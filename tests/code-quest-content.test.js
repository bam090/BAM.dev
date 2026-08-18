import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  areJsonValuesEqual,
  assertValidExecutionRequest,
} from "../src/grading/code-grading.js";
import { executeJavaScriptTest } from "../src/grading/javascript-runtime.js";
import { codeQuestSolutionFixtures } from "./fixtures/code-quest-solutions.js";

const questFileUrl = new URL("../content/quests/javascript.json", import.meta.url);
const collection = JSON.parse(await readFile(questFileUrl, "utf8"));
const questSchema = JSON.parse(
  await readFile(new URL("../content/schema/code-quest.schema.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const quizzes = JSON.parse(
  await readFile(new URL("../content/quizzes/javascript.json", import.meta.url), "utf8"),
);

const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HINT_STAGES = ["concept", "observation", "implementation"];
const BOUNDARY_KINDS = ["normal", "minimum", "maximum", "edge"];
const FORBIDDEN_RUNTIME_API_PATTERN =
  /\b(?:document|window|fetch|XMLHttpRequest|WebSocket|EventSource|navigator|location|localStorage|sessionStorage|indexedDB|caches|importScripts|setTimeout|setInterval|requestAnimationFrame|Date|performance|crypto|Intl)\b|Math\.random/;
const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;

function resolveLocalReference(reference) {
  assert.match(reference, /^#\//, `지원하지 않는 스키마 참조입니다: ${reference}`);

  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], questSchema);
}

function validateAgainstSchema(value, schema, valuePath = "$") {
  if (schema.$ref) {
    const referencedSchema = resolveLocalReference(schema.$ref);
    assert.ok(referencedSchema, `${valuePath}: 스키마 참조를 찾을 수 없습니다.`);
    validateAgainstSchema(value, referencedSchema, valuePath);
    return;
  }

  if (Object.hasOwn(schema, "const")) {
    assert.deepEqual(value, schema.const, `${valuePath}: const 조건을 만족하지 않습니다.`);
  }

  if (schema.enum) {
    assert.ok(schema.enum.includes(value), `${valuePath}: 허용된 enum 값이 아닙니다.`);
  }

  if (schema.type === "object") {
    assert.ok(
      value !== null && typeof value === "object" && !Array.isArray(value),
      `${valuePath}: 객체여야 합니다.`,
    );

    for (const requiredKey of schema.required ?? []) {
      assert.ok(Object.hasOwn(value, requiredKey), `${valuePath}.${requiredKey}: 필수 필드입니다.`);
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) {
        assert.ok(allowedKeys.has(key), `${valuePath}.${key}: 허용되지 않은 필드입니다.`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateAgainstSchema(value[key], propertySchema, `${valuePath}.${key}`);
      }
    }
  }

  if (schema.type === "array") {
    assert.ok(Array.isArray(value), `${valuePath}: 배열이어야 합니다.`);

    if (schema.minItems !== undefined) {
      assert.ok(value.length >= schema.minItems, `${valuePath}: 항목 수가 minItems보다 적습니다.`);
    }
    if (schema.maxItems !== undefined) {
      assert.ok(value.length <= schema.maxItems, `${valuePath}: 항목 수가 maxItems보다 많습니다.`);
    }
    if (schema.uniqueItems) {
      assert.equal(
        new Set(value.map((item) => JSON.stringify(item))).size,
        value.length,
        `${valuePath}: 중복 항목이 있습니다.`,
      );
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validateAgainstSchema(item, schema.items, `${valuePath}[${index}]`),
      );
    }
  }

  if (schema.type === "string") {
    assert.equal(typeof value, "string", `${valuePath}: 문자열이어야 합니다.`);
    if (schema.minLength !== undefined) {
      assert.ok(value.length >= schema.minLength, `${valuePath}: 문자열이 너무 짧습니다.`);
    }
    if (schema.pattern) {
      assert.match(value, new RegExp(schema.pattern), `${valuePath}: 문자열 형식이 올바르지 않습니다.`);
    }
  }

  if (schema.type === "integer") {
    assert.ok(Number.isInteger(value), `${valuePath}: 정수여야 합니다.`);
    if (schema.minimum !== undefined) {
      assert.ok(value >= schema.minimum, `${valuePath}: minimum보다 작습니다.`);
    }
  }
}

function normalizeText(value) {
  return value.normalize("NFKC").replaceAll(/\s+/g, " ").trim().toLocaleLowerCase("ko-KR");
}

function assertUnique(values, message) {
  assert.equal(new Set(values).size, values.length, message);
}

function toRunnerTests(quest) {
  return quest.publicTests.map(({ id, label, args, expected }) => ({
    id,
    label,
    args,
    expected,
  }));
}

function createExecutionRequest(quest, source = quest.starterCode) {
  return {
    requestId: `verify-${quest.id}`,
    contractVersion: collection.contractVersion,
    questId: quest.id,
    questRevision: quest.revision,
    languageId: collection.languageId,
    suite: "public",
    source,
    entryPoint: quest.entryPoint,
    tests: toRunnerTests(quest),
  };
}

async function executeCase(source, entryPoint, testCase) {
  return executeJavaScriptTest({
    source,
    entryPoint,
    args: testCase.args,
  });
}

test("JavaScript Code Quest 컬렉션이 JSON Schema를 통과한다", () => {
  assert.doesNotThrow(() => validateAgainstSchema(collection, questSchema));
});

test("Code Quest 스키마는 언어 중립 컬렉션과 고정 채점 버전을 표현한다", () => {
  assert.equal(questSchema.title, "BAM.dev Code Quest collection");
  assert.equal(questSchema.properties.languageId.const, undefined);
  assert.equal(
    questSchema.properties.languageId.pattern,
    "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
  );
  assert.equal(questSchema.properties.contractVersion.const, 1);
  assert.equal(questSchema.properties.quests.minItems, 1);
  assert.equal(questSchema.properties.quests.maxItems, undefined);
  assert.deepEqual(questSchema.$defs.publicTest.required, ["id", "label", "args", "expected"]);
  assert.equal(questSchema.$defs.publicTest.additionalProperties, false);

  for (const languageId of ["html", "css", "java"]) {
    const sampleQuest = structuredClone(collection.quests[0]);
    sampleQuest.id = `quest-${languageId}-sample`;
    sampleQuest.slug = `${languageId}-sample`;
    sampleQuest.lessonId = `${languageId}-01-sample`;
    sampleQuest.conceptIds = [`${languageId}.sample`];
    sampleQuest.entryPoint = "solveSample";
    sampleQuest.starterCode = "function solveSample(value) { return value; }";

    assert.doesNotThrow(() =>
      validateAgainstSchema(
        {
          ...structuredClone(collection),
          languageId,
          quests: [sampleQuest],
        },
        questSchema,
      ),
    );
  }
});

test("Code Quest 스키마는 잘못된 ID·revision·개수와 추가 필드를 거부한다", () => {
  const invalidCases = [];

  const withCollectionExtra = structuredClone(collection);
  withCollectionExtra.extra = true;
  invalidCases.push(withCollectionExtra);

  const withInvalidId = structuredClone(collection);
  withInvalidId.quests[0].id = "Quest_javascript_invalid";
  invalidCases.push(withInvalidId);

  const withInvalidRevision = structuredClone(collection);
  withInvalidRevision.quests[0].revision = 0;
  invalidCases.push(withInvalidRevision);

  const withTooFewTests = structuredClone(collection);
  withTooFewTests.quests[0].publicTests = withTooFewTests.quests[0].publicTests.slice(0, 2);
  invalidCases.push(withTooFewTests);

  const withTooFewHints = structuredClone(collection);
  withTooFewHints.quests[0].hints = withTooFewHints.quests[0].hints.slice(0, 2);
  invalidCases.push(withTooFewHints);

  const withRunnerDtoExtra = structuredClone(collection);
  withRunnerDtoExtra.quests[0].publicTests[0].failureExplanation = "잘못 섞인 설명";
  invalidCases.push(withRunnerDtoExtra);

  for (const invalid of invalidCases) {
    assert.throws(() => validateAgainstSchema(invalid, questSchema));
  }
});

test("파일명·Quest ID·slug·revision·order가 안정적이고 전역 중복이 없다", () => {
  const fileLanguageId = path.basename(fileURLToPath(questFileUrl), ".json");
  const questIds = collection.quests.map((quest) => quest.id);
  const slugs = collection.quests.map((quest) => quest.slug);
  const publicTestIds = collection.quests.flatMap((quest) =>
    quest.publicTests.map((publicTest) => publicTest.id),
  );

  assert.equal(fileLanguageId, collection.languageId);
  assert.equal(collection.schemaVersion, 1);
  assert.equal(collection.contractVersion, 1);
  assert.ok(collection.quests.length >= 4 && collection.quests.length <= 6);
  assertUnique(questIds, "Quest ID가 중복됩니다.");
  assertUnique(slugs, "Quest slug가 중복됩니다.");
  assertUnique(publicTestIds, "공개 테스트 ID가 다른 Quest와 중복됩니다.");

  collection.quests.forEach((quest, index) => {
    assert.equal(quest.order, index + 1, `${quest.id}: order는 1부터 연속이어야 합니다.`);
    assert.ok(Number.isSafeInteger(quest.revision) && quest.revision >= 1);
    assert.ok(quest.id.startsWith(`quest-${collection.languageId}-`));
    assert.match(quest.id, STABLE_ID_PATTERN);
    assert.match(quest.slug, STABLE_ID_PATTERN);
    assert.equal(quest.difficulty, "beginner");
    assert.ok(quest.estimatedMinutes >= 10 && quest.estimatedMinutes <= 25);
  });
});

test("모든 Quest의 lessonId와 conceptIds가 같은 언어의 교안에 연결된다", () => {
  const lessonById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));

  for (const quest of collection.quests) {
    const lesson = lessonById.get(quest.lessonId);
    assert.ok(lesson, `${quest.id}: 존재하지 않는 lessonId입니다.`);
    assert.equal(lesson.languageId, collection.languageId, `${quest.id}: 다른 언어 교안입니다.`);
    assertUnique(quest.conceptIds, `${quest.id}: conceptIds가 중복됩니다.`);

    for (const conceptId of quest.conceptIds) {
      assert.ok(
        lesson.conceptIds.includes(conceptId),
        `${quest.id}: ${conceptId}가 연결 교안에 속하지 않습니다.`,
      );
    }
  }
});

test("함수 계약·예시·starterCode와 entryPoint가 서로 일치한다", () => {
  for (const quest of collection.quests) {
    const escapedEntryPoint = quest.entryPoint.replaceAll(/[$]/g, "\\$");
    const declaration = quest.starterCode.match(
      new RegExp(`function\\s+${escapedEntryPoint}\\s*\\(([^)]*)\\)`),
    );
    assert.ok(declaration, `${quest.id}: starterCode에 entryPoint 함수 선언이 없습니다.`);
    const starterParameters = declaration[1]
      .split(",")
      .map((parameter) => parameter.trim())
      .filter(Boolean);
    assert.deepEqual(
      starterParameters,
      quest.functionContract.parameters.map((parameter) => parameter.name),
      `${quest.id}: 함수 매개변수 계약과 starterCode가 다릅니다.`,
    );
    assert.ok(quest.functionContract.constraints.every((item) => item.trim().length > 0));
    assert.match(quest.functionContract.complexity.time, /^O\(.+\)/);
    assert.match(quest.functionContract.complexity.space, /^O\(.+\)/);
    const parameterCount = quest.functionContract.parameters.length;

    for (const example of quest.examples) {
      assert.equal(
        example.args.length,
        parameterCount,
        `${quest.id}: 입출력 예의 인수 개수가 함수 계약과 다릅니다.`,
      );
      assert.ok(
        quest.publicTests.some(
          (publicTest) =>
            areJsonValuesEqual(publicTest.args, example.args) &&
            areJsonValuesEqual(publicTest.expected, example.expected),
        ),
        `${quest.id}: 입출력 예가 실제 공개 테스트 계약과 다릅니다.`,
      );
    }
    for (const publicTest of quest.publicTests) {
      assert.equal(
        publicTest.args.length,
        parameterCount,
        `${quest.id}/${publicTest.id}: 공개 테스트 인수 개수가 함수 계약과 다릅니다.`,
      );
    }
  }
});

test("공개 테스트와 학습자용 실패 설명은 일대일이며 runner DTO에는 네 필드만 전달된다", () => {
  for (const quest of collection.quests) {
    assert.ok(quest.publicTests.length >= 3 && quest.publicTests.length <= 6);
    assert.equal(quest.failureExplanations.length, quest.publicTests.length);
    assertUnique(
      quest.publicTests.map((publicTest) => publicTest.id),
      `${quest.id}: 공개 테스트 ID가 중복됩니다.`,
    );
    assertUnique(
      quest.failureExplanations.map((explanation) => explanation.testId),
      `${quest.id}: 실패 설명 testId가 중복됩니다.`,
    );
    assert.deepEqual(
      quest.failureExplanations.map((explanation) => explanation.testId).sort(),
      quest.publicTests.map((publicTest) => publicTest.id).sort(),
      `${quest.id}: 모든 공개 테스트에 실패 설명이 정확히 하나씩 필요합니다.`,
    );

    const runnerTests = toRunnerTests(quest);
    for (const runnerTest of runnerTests) {
      assert.deepEqual(Object.keys(runnerTest).sort(), ["args", "expected", "id", "label"]);
    }
    assert.equal(
      assertValidExecutionRequest(createExecutionRequest(quest)).tests.length,
      quest.publicTests.length,
    );
  }
});

test("힌트는 개념→관찰→구현 순서이며 대표 오답 설명을 포함한다", () => {
  for (const quest of collection.quests) {
    assert.ok(quest.hints.length >= 3);
    assert.deepEqual(
      quest.hints.slice(0, 3).map((hint) => hint.stage),
      HINT_STAGES,
      `${quest.id}: 힌트 단계 순서가 올바르지 않습니다.`,
    );
    assert.deepEqual(
      quest.hints.slice(0, 3).map((hint) => hint.level),
      [1, 2, 3],
      `${quest.id}: 힌트 level은 1부터 시작해야 합니다.`,
    );
    assert.ok(quest.commonMistakes.length >= 1);
    assertUnique(
      quest.commonMistakes.map((mistake) => mistake.id),
      `${quest.id}: 대표 오답 ID가 중복됩니다.`,
    );
  }
});

test("starterCode는 실행 가능한 함수이지만 공개 테스트의 완성 답안은 아니다", async () => {
  for (const quest of collection.quests) {
    let passed = 0;
    for (const publicTest of quest.publicTests) {
      const result = await executeCase(quest.starterCode, quest.entryPoint, publicTest);
      assert.equal(result.outcome, "completed", `${quest.id}/${publicTest.id}: starter 실행 실패`);
      if (areJsonValuesEqual(result.value, publicTest.expected)) passed += 1;
    }
    assert.ok(passed < quest.publicTests.length, `${quest.id}: starterCode가 이미 완성 답안입니다.`);
  }
});

test("fixture는 모든 Quest와 정확히 대응하고 복잡도·경계값 구성을 기록한다", () => {
  const fixtureQuestIds = Object.keys(codeQuestSolutionFixtures).sort();
  const contentQuestIds = collection.quests.map((quest) => quest.id).sort();
  assert.deepEqual(fixtureQuestIds, contentQuestIds);

  for (const quest of collection.quests) {
    const fixture = codeQuestSolutionFixtures[quest.id];
    const testCaseIds = new Set([
      ...quest.publicTests.map((publicTest) => publicTest.id),
      ...fixture.verificationCases.map((verificationCase) => verificationCase.id),
    ]);
    const commonMistakeIds = quest.commonMistakes.map((mistake) => mistake.id).sort();
    const wrongSolutionIds = fixture.representativeWrongSolutions
      .map((solution) => solution.id)
      .sort();

    assert.deepEqual(fixture.expectedComplexity, quest.functionContract.complexity);
    assert.deepEqual(wrongSolutionIds, commonMistakeIds);
    assert.deepEqual(Object.keys(fixture.boundaryCoverage), BOUNDARY_KINDS);
    assert.ok(fixture.verificationCases.length >= 1);
    for (const verificationCase of fixture.verificationCases) {
      assert.equal(
        verificationCase.args.length,
        quest.functionContract.parameters.length,
        `${quest.id}/${verificationCase.id}: 추가 검증 인수 개수가 함수 계약과 다릅니다.`,
      );
    }

    for (const kind of BOUNDARY_KINDS) {
      const ids = fixture.boundaryCoverage[kind];
      assert.ok(ids.length >= 1, `${quest.id}: ${kind} 경계 구성이 비어 있습니다.`);
      for (const id of ids) {
        assert.ok(testCaseIds.has(id), `${quest.id}: ${kind}가 없는 검증 사례를 참조합니다.`);
      }
    }
  }
});

test("추가 검증 사례는 공개 테스트와 ID·입출력 계약이 겹치지 않는다", () => {
  for (const quest of collection.quests) {
    const fixture = codeQuestSolutionFixtures[quest.id];
    const publicTestIds = new Set(quest.publicTests.map((publicTest) => publicTest.id));
    for (const verificationCase of fixture.verificationCases) {
      assert.ok(
        !publicTestIds.has(verificationCase.id),
        `${quest.id}/${verificationCase.id}: 추가 검증 ID가 공개 테스트와 중복됩니다.`,
      );
      assert.ok(
        !quest.publicTests.some(
          (publicTest) =>
            areJsonValuesEqual(publicTest.args, verificationCase.args) &&
            areJsonValuesEqual(publicTest.expected, verificationCase.expected),
        ),
        `${quest.id}/${verificationCase.id}: 추가 검증의 args+expected가 공개 테스트와 중복됩니다.`,
      );
    }
  }
});

test("배송비 공개 채점은 standard 지역의 멤버십 30,000원 경계를 직접 검증한다", async () => {
  const quest = collection.quests.find(
    (item) => item.id === "quest-javascript-delivery-fee",
  );
  assert.ok(quest, "배송비 Quest가 필요합니다.");
  const fixture = codeQuestSolutionFixtures[quest.id];
  assert.ok(fixture, "배송비 Quest의 풀이 fixture가 필요합니다.");
  const publicBoundary = quest.publicTests.find(
    (publicTest) => publicTest.id === "delivery-member-standard-at-threshold",
  );
  assert.ok(publicBoundary, "멤버십 무료 기준 공개 테스트가 필요합니다.");
  const maximumVerification = fixture.verificationCases.find(
    (verificationCase) => verificationCase.id === "verify-delivery-maximum-member-island",
  );
  assert.ok(maximumVerification, "최대 입력 추가 검증 사례가 필요합니다.");
  const wrongSolution = fixture.representativeWrongSolutions.find(
    (solution) => solution.id === "membership-threshold-by-destination",
  );
  assert.ok(wrongSolution, "배송 지역별 기준 금액 대표 오답이 필요합니다.");

  assert.ok(
    Number.isSafeInteger(quest.revision) && quest.revision >= 2,
    "배송비 Quest revision은 P1 수정 버전인 2 이상이어야 합니다.",
  );
  assert.deepEqual(publicBoundary, {
    id: "delivery-member-standard-at-threshold",
    label: "멤버십 무료 기준과 같은 금액의 일반 지역 배송",
    args: [30000, "standard", true],
    expected: 0,
  });
  assert.deepEqual(maximumVerification, {
    id: "verify-delivery-maximum-member-island",
    args: [1000000, "island", true],
    expected: 5000,
  });
  assert.deepEqual(wrongSolution.expectedFailingPublicTestIds, [
    "delivery-member-standard-at-threshold",
  ]);

  const result = await executeCase(wrongSolution.source, quest.entryPoint, publicBoundary);
  assert.equal(result.outcome, "completed");
  assert.ok(!areJsonValuesEqual(result.value, publicBoundary.expected));
});

test("기준 풀이는 공개 테스트와 추가 독립 검증 사례를 모두 통과한다", async () => {
  for (const quest of collection.quests) {
    const fixture = codeQuestSolutionFixtures[quest.id];
    const sourceLineCount = fixture.referenceSource
      .split("\n")
      .filter((line) => line.trim().length > 0).length;
    assert.ok(
      sourceLineCount >= 10 && sourceLineCount <= 25,
      `${quest.id}: 기준 풀이는 10~25줄 범위여야 합니다. 현재 ${sourceLineCount}줄`,
    );

    const allCases = [...quest.publicTests, ...fixture.verificationCases];
    for (const testCase of allCases) {
      const result = await executeCase(fixture.referenceSource, quest.entryPoint, testCase);
      assert.equal(result.outcome, "completed", `${quest.id}/${testCase.id}: 기준 풀이 실행 실패`);
      assert.ok(
        areJsonValuesEqual(result.value, testCase.expected),
        `${quest.id}/${testCase.id}: 기준 풀이 결과가 expected와 다릅니다.`,
      );

    }
  }
});

test("각 대표 오답은 정상 실행되지만 선언한 공개 테스트에서 정확히 실패한다", async () => {
  for (const quest of collection.quests) {
    const fixture = codeQuestSolutionFixtures[quest.id];

    for (const wrongSolution of fixture.representativeWrongSolutions) {
      const failingTestIds = [];
      for (const publicTest of quest.publicTests) {
        const result = await executeCase(wrongSolution.source, quest.entryPoint, publicTest);
        assert.equal(
          result.outcome,
          "completed",
          `${quest.id}/${wrongSolution.id}/${publicTest.id}: 대표 오답은 값 비교까지 실행되어야 합니다.`,
        );
        if (!areJsonValuesEqual(result.value, publicTest.expected)) {
          failingTestIds.push(publicTest.id);
        }
      }

      assert.deepEqual(failingTestIds, wrongSolution.expectedFailingPublicTestIds);
      assert.ok(failingTestIds.length >= 1, `${quest.id}: 대표 오답이 모든 테스트를 통과했습니다.`);
      assert.ok(
        failingTestIds.length < quest.publicTests.length,
        `${quest.id}: 대표 오답은 그럴듯한 정상 사례도 통과해야 합니다.`,
      );
    }
  }
});

test("문제·테스트·풀이가 결정적 순수 함수 범위를 벗어나는 API를 사용하지 않는다", () => {
  const contentText = JSON.stringify(collection);
  assert.doesNotMatch(contentText, NON_PUBLIC_TEST_TERMS);

  for (const quest of collection.quests) {
    const fixture = codeQuestSolutionFixtures[quest.id];
    const sources = [
      quest.starterCode,
      fixture.referenceSource,
      ...fixture.representativeWrongSolutions.map((solution) => solution.source),
    ];
    for (const source of sources) {
      assert.doesNotMatch(source, FORBIDDEN_RUNTIME_API_PATTERN, `${quest.id}: 제외 API 사용`);
    }
    assert.ok(!contentText.includes(fixture.referenceSource.trim()));
  }
});

test("새 Quest끼리 또는 기존 교안 구현 함수·퀴즈 문구와 직접 중복되지 않는다", async () => {
  const normalizedTitles = collection.quests.map((quest) => normalizeText(quest.title));
  const normalizedSummaries = collection.quests.map((quest) => normalizeText(quest.summary));
  const normalizedInstructions = collection.quests.map((quest) => normalizeText(quest.instructions));
  assertUnique(normalizedTitles, "Quest 제목이 중복됩니다.");
  assertUnique(normalizedSummaries, "Quest 요약이 중복됩니다.");
  assertUnique(normalizedInstructions, "Quest 지시문이 중복됩니다.");

  const quizPrompts = new Set(quizzes.questions.map((question) => normalizeText(question.prompt)));
  for (const quest of collection.quests) {
    assert.ok(!quizPrompts.has(normalizeText(quest.title)));
    assert.ok(!quizPrompts.has(normalizeText(quest.instructions)));
  }

  const lessonSources = await Promise.all(
    curriculum.lessons
      .filter((lesson) => lesson.languageId === collection.languageId)
      .map((lesson) => readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8")),
  );
  const combinedLessons = lessonSources.join("\n");
  for (const quest of collection.quests) {
    assert.doesNotMatch(
      combinedLessons,
      new RegExp(`\\b${quest.entryPoint}\\b`),
      `${quest.id}: 기존 교안의 구현 함수명을 다시 사용했습니다.`,
    );
  }
});
