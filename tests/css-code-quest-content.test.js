import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertValidWebCodeQuestCollection,
  createWebCodeQuestExecutionRequest,
  findWebCodeQuestSourceIssue,
  validateWebCodeQuestCollection,
  WEB_CODE_QUEST_EVALUATION_KINDS,
} from "../src/core/web-code-quest.js";
import { evaluateCssStyleAssertion } from "../src/grading/browser-web-code-quest-runner.js";
import { cssCodeQuestSolutionFixtures } from "./fixtures/css-code-quest-solutions.js";

const collection = JSON.parse(
  await readFile(new URL("../content/quests/css.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/web-code-quest.schema.json", import.meta.url), "utf8"),
);

const HINT_STAGES = ["concept", "observation", "implementation"];
const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;

function resolveLocalReference(reference) {
  assert.match(reference, /^#\//, `지원하지 않는 스키마 참조입니다: ${reference}`);
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], schema);
}

function schemaMatches(value, candidate, valuePath) {
  try {
    validateAgainstSchema(value, candidate, valuePath);
    return true;
  } catch {
    return false;
  }
}

function validateAgainstSchema(value, candidate, valuePath = "$") {
  if (candidate.$ref) {
    const referenced = resolveLocalReference(candidate.$ref);
    assert.ok(referenced, `${valuePath}: 스키마 참조를 찾을 수 없습니다.`);
    validateAgainstSchema(value, referenced, valuePath);
    return;
  }

  if (candidate.oneOf) {
    const matchCount = candidate.oneOf.filter((branch) =>
      schemaMatches(value, branch, valuePath),
    ).length;
    assert.equal(matchCount, 1, `${valuePath}: oneOf 조건 하나만 만족해야 합니다.`);
  }

  for (const branch of candidate.allOf ?? []) {
    validateAgainstSchema(value, branch, valuePath);
  }

  if (candidate.if && schemaMatches(value, candidate.if, valuePath) && candidate.then) {
    validateAgainstSchema(value, candidate.then, valuePath);
  }

  if (Object.hasOwn(candidate, "const")) {
    assert.deepEqual(value, candidate.const, `${valuePath}: const 조건을 만족하지 않습니다.`);
  }
  if (candidate.enum) {
    assert.ok(candidate.enum.includes(value), `${valuePath}: 허용된 enum 값이 아닙니다.`);
  }

  const validatesObject =
    candidate.type === "object" ||
    candidate.properties ||
    candidate.required ||
    candidate.additionalProperties === false;
  if (validatesObject) {
    assert.ok(
      value !== null && typeof value === "object" && !Array.isArray(value),
      `${valuePath}: 객체여야 합니다.`,
    );
    for (const requiredKey of candidate.required ?? []) {
      assert.ok(Object.hasOwn(value, requiredKey), `${valuePath}.${requiredKey}: 필수 필드입니다.`);
    }
    if (candidate.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(candidate.properties ?? {}));
      for (const key of Object.keys(value)) {
        assert.ok(allowedKeys.has(key), `${valuePath}.${key}: 허용되지 않은 필드입니다.`);
      }
    }
    for (const [key, propertySchema] of Object.entries(candidate.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateAgainstSchema(value[key], propertySchema, `${valuePath}.${key}`);
      }
    }
  }

  if (candidate.type === "array") {
    assert.ok(Array.isArray(value), `${valuePath}: 배열이어야 합니다.`);
    if (candidate.minItems !== undefined) {
      assert.ok(value.length >= candidate.minItems, `${valuePath}: 항목 수가 너무 적습니다.`);
    }
    if (candidate.maxItems !== undefined) {
      assert.ok(value.length <= candidate.maxItems, `${valuePath}: 항목 수가 너무 많습니다.`);
    }
    if (candidate.uniqueItems) {
      assert.equal(
        new Set(value.map((item) => JSON.stringify(item))).size,
        value.length,
        `${valuePath}: 중복 항목이 있습니다.`,
      );
    }
    value.forEach((item, index) => {
      if (candidate.items) validateAgainstSchema(item, candidate.items, `${valuePath}[${index}]`);
    });
  }

  if (candidate.type === "string") {
    assert.equal(typeof value, "string", `${valuePath}: 문자열이어야 합니다.`);
    if (candidate.minLength !== undefined) {
      assert.ok(value.length >= candidate.minLength, `${valuePath}: 문자열이 너무 짧습니다.`);
    }
    if (candidate.maxLength !== undefined) {
      assert.ok(value.length <= candidate.maxLength, `${valuePath}: 문자열이 너무 깁니다.`);
    }
    if (candidate.pattern) {
      assert.match(value, new RegExp(candidate.pattern), `${valuePath}: 문자열 형식이 다릅니다.`);
    }
  }

  if (candidate.type === "integer") {
    assert.ok(Number.isInteger(value), `${valuePath}: 정수여야 합니다.`);
    if (candidate.minimum !== undefined) {
      assert.ok(value >= candidate.minimum, `${valuePath}: 최솟값보다 작습니다.`);
    }
  }
}

function canonicalizeCssValue(value) {
  return value
    .replace(/#([\da-f]{6})(?![\da-f])/giu, (_match, hexadecimal) => {
      const red = Number.parseInt(hexadecimal.slice(0, 2), 16);
      const green = Number.parseInt(hexadecimal.slice(2, 4), 16);
      const blue = Number.parseInt(hexadecimal.slice(4, 6), 16);
      return `rgb(${red}, ${green}, ${blue})`;
    })
    .replaceAll(/\s+/g, " ")
    .trim();
}

class FixtureStyleSheet {
  constructor() {
    this.cssRules = [];
  }

  replaceSync(source) {
    const withoutComments = source.replaceAll(/\/\*[\s\S]*?\*\//g, "");
    this.cssRules = parseFixtureRuleList(withoutComments);
  }
}

function findClosingBrace(source, openingIndex) {
  let depth = 0;
  for (let index = openingIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }
  throw new SyntaxError("닫히지 않은 CSS 규칙이 있습니다.");
}

function createFixtureStyle(declarationSource) {
  const declarations = new Map();
  for (const declaration of declarationSource.split(";")) {
    if (!declaration.trim()) continue;
    const colonIndex = declaration.indexOf(":");
    if (colonIndex < 1 || !declaration.slice(colonIndex + 1).trim()) {
      throw new SyntaxError("CSS 선언의 속성 또는 값이 비어 있습니다.");
    }
    const property = declaration.slice(0, colonIndex).trim().toLowerCase();
    const value = canonicalizeCssValue(declaration.slice(colonIndex + 1));
    declarations.set(property, value);
  }
  return {
    getPropertyValue(property) {
      return declarations.get(property.toLowerCase()) ?? "";
    },
    setProperty(property, value) {
      declarations.set(property.toLowerCase(), canonicalizeCssValue(value));
    },
  };
}

function parseFixtureRuleList(source) {
  const rules = [];
  let cursor = 0;

  while (cursor < source.length) {
    while (/\s/u.test(source[cursor] ?? "")) cursor += 1;
    if (cursor >= source.length) break;

    const openingIndex = source.indexOf("{", cursor);
    if (openingIndex < 0) throw new SyntaxError("CSS 규칙의 여는 중괄호가 없습니다.");
    const prelude = source.slice(cursor, openingIndex).trim();
    const closingIndex = findClosingBrace(source, openingIndex);
    const body = source.slice(openingIndex + 1, closingIndex);

    if (/^@media\s+/iu.test(prelude)) {
      const conditionText = prelude.replace(/^@media\s+/iu, "").trim();
      if (!conditionText) throw new SyntaxError("media 조건이 비어 있습니다.");
      rules.push({
        type: 4,
        cssText: `@media ${conditionText} { ${body} }`,
        conditionText,
        cssRules: parseFixtureRuleList(body),
      });
    } else {
      if (!prelude || prelude.startsWith("@") || /[{}]/u.test(body)) {
        throw new SyntaxError("지원하지 않는 CSS 규칙 형식입니다.");
      }
      rules.push({
        selectorText: prelude,
        style: createFixtureStyle(body),
      });
    }
    cursor = closingIndex + 1;
  }

  return rules;
}

function assertUnique(values, message) {
  assert.equal(new Set(values).size, values.length, message);
}

async function evaluateSource(quest, source, requestSuffix) {
  const request = createWebCodeQuestExecutionRequest(
    collection,
    quest,
    source,
    `verify-${quest.slug}-${requestSuffix}`,
  );
  const results = [];

  for (const publicTest of request.tests) {
    const actual = await evaluateCssStyleAssertion(
      {
        source: request.source,
        fixtureHtml: request.fixtureHtml,
        assertion: publicTest.assertion,
      },
      { styleSheetFactory: () => new FixtureStyleSheet() },
    );
    results.push({
      id: publicTest.id,
      expected: publicTest.expected,
      actual,
      passed: Object.is(actual, publicTest.expected),
    });
  }

  return results;
}

test("CSS Code Quest 컬렉션이 JSON Schema와 런타임 계약을 통과한다", () => {
  assert.doesNotThrow(() => validateAgainstSchema(collection, schema));
  assert.deepEqual(validateWebCodeQuestCollection(collection, curriculum), []);
  assert.doesNotThrow(() => assertValidWebCodeQuestCollection(collection, curriculum));
});

test("Quest 메타데이터·공개 검사·실패 설명·힌트가 독립적인 학습 계약을 이룬다", () => {
  assert.equal(collection.evaluationKind, WEB_CODE_QUEST_EVALUATION_KINDS.CSS);
  assert.equal(collection.languageId, "css");
  assert.equal(collection.quests.length, 4);
  assertUnique(collection.quests.map((quest) => quest.id), "Quest ID가 중복됩니다.");
  assertUnique(collection.quests.map((quest) => quest.slug), "Quest slug가 중복됩니다.");

  const allTestIds = [];
  collection.quests.forEach((quest, index) => {
    assert.equal(quest.order, index + 1, `${quest.id}: order가 연속적이지 않습니다.`);
    assert.ok(
      quest.publicTests.length >= 4 && quest.publicTests.length <= 6,
      `${quest.id}: 공개 검사는 4~6개여야 합니다.`,
    );
    assert.ok(
      quest.publicTests.every((publicTest) =>
        new Set(["rule-declaration", "media-rule-declaration"]).has(
          publicTest.assertion.kind,
        ),
      ),
      `${quest.id}: 선언 위치까지 판정할 수 있는 CSS 검사만 사용해야 합니다.`,
    );
    const testIds = quest.publicTests.map((publicTest) => publicTest.id);
    const explanationIds = quest.failureExplanations.map((item) => item.testId);
    assert.deepEqual(
      explanationIds.toSorted(),
      testIds.toSorted(),
      `${quest.id}: 공개 검사마다 실패 설명이 정확히 하나씩 필요합니다.`,
    );
    assert.deepEqual(
      quest.hints.map((hint) => hint.level),
      [1, 2, 3],
      `${quest.id}: 힌트 level 순서가 다릅니다.`,
    );
    assert.deepEqual(
      quest.hints.map((hint) => hint.stage),
      HINT_STAGES,
      `${quest.id}: 힌트 단계가 개념→관찰→구현 순서가 아닙니다.`,
    );
    assert.equal(
      findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.HTML, quest.fixtureHtml, {
        fixture: true,
      }),
      null,
      `${quest.id}: 고정 HTML fixture가 안전하지 않습니다.`,
    );
    assert.doesNotMatch(JSON.stringify(quest), NON_PUBLIC_TEST_TERMS);
    allTestIds.push(...testIds);
  });
  assertUnique(allTestIds, "서로 다른 Quest의 공개 검사 ID가 중복됩니다.");
});

test("기준 답안 fixture는 모든 공개 검사를 통과한다", async () => {
  assert.deepEqual(
    Object.keys(cssCodeQuestSolutionFixtures).toSorted(),
    collection.quests.map((quest) => quest.id).toSorted(),
    "Quest와 기준 답안 fixture가 1:1로 연결되어야 합니다.",
  );

  for (const quest of collection.quests) {
    const fixture = cssCodeQuestSolutionFixtures[quest.id];
    assert.equal(
      findWebCodeQuestSourceIssue(
        WEB_CODE_QUEST_EVALUATION_KINDS.CSS,
        fixture.referenceSource,
      ),
      null,
      `${quest.id}: 기준 답안이 안전한 CSS 범위를 벗어납니다.`,
    );
    const results = await evaluateSource(quest, fixture.referenceSource, "reference");
    assert.deepEqual(
      results.filter((result) => !result.passed),
      [],
      `${quest.id}: 기준 답안이 공개 검사를 통과하지 못했습니다.`,
    );
  }
});

test("대표 오답은 의도한 공개 검사에서만 실패한다", async () => {
  for (const quest of collection.quests) {
    const fixture = cssCodeQuestSolutionFixtures[quest.id];
    assert.ok(
      fixture.representativeWrongSolutions.length >= 1,
      `${quest.id}: 대표 오답이 필요합니다.`,
    );
    assertUnique(
      fixture.representativeWrongSolutions.map((wrong) => wrong.id),
      `${quest.id}: 대표 오답 ID가 중복됩니다.`,
    );

    for (const wrong of fixture.representativeWrongSolutions) {
      assert.equal(
        findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.CSS, wrong.source),
        null,
        `${quest.id}/${wrong.id}: 대표 오답이 안전한 CSS 범위를 벗어납니다.`,
      );
      const results = await evaluateSource(quest, wrong.source, wrong.id);
      const failingIds = results
        .filter((result) => !result.passed)
        .map((result) => result.id)
        .toSorted();
      assert.deepEqual(
        failingIds,
        wrong.expectedFailingPublicTestIds.toSorted(),
        `${quest.id}/${wrong.id}: 의도한 공개 검사 실패 집합과 다릅니다.`,
      );
    }
  }
});

test("위험한 fixture와 연결 교안 밖의 개념은 콘텐츠 검증에서 거부한다", () => {
  const unsafeFixture = structuredClone(collection);
  unsafeFixture.quests[0].fixtureHtml = "<script>bad()</script>";
  assert.ok(
    validateWebCodeQuestCollection(unsafeFixture, curriculum).some((error) =>
      error.includes("fixtureHtml"),
    ),
  );

  const crossedConcept = structuredClone(collection);
  crossedConcept.quests[0].conceptIds = ["css.grid"];
  assert.ok(
    validateWebCodeQuestCollection(crossedConcept, curriculum).some((error) =>
      error.includes("연결 교안에 없는 개념"),
    ),
  );
});
