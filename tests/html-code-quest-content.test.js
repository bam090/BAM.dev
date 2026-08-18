import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  assertValidWebCodeQuestCollection,
  createWebCodeQuestExecutionRequest,
  findWebCodeQuestSourceIssue,
  validateWebCodeQuestCollection,
} from "../src/core/web-code-quest.js";
import { BrowserWebCodeQuestRunner } from "../src/grading/browser-web-code-quest-runner.js";
import { htmlCodeQuestSolutionFixtures } from "./fixtures/html-code-quest-solutions.js";

const collection = JSON.parse(
  await readFile(new URL("../content/quests/html.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(
    new URL("../content/schema/web-code-quest.schema.json", import.meta.url),
    "utf8",
  ),
);

const EXPECTED_QUEST_LINKS = [
  {
    id: "quest-html-document-structure",
    lessonId: "html-01-document-structure",
    conceptIds: [
      "html.document-structure",
      "html.semantics",
      "html.heading-structure",
    ],
  },
  {
    id: "quest-html-descriptive-navigation",
    lessonId: "html-02-text-links",
    conceptIds: ["html.hyperlinks", "html.urls"],
  },
  {
    id: "quest-html-list-data-table",
    lessonId: "html-03-images-lists-tables",
    conceptIds: ["html.lists", "html.tabular-data"],
  },
  {
    id: "quest-html-accessible-form",
    lessonId: "html-04-forms-accessibility",
    conceptIds: [
      "html.form-submission",
      "html.form-controls",
      "html.labels",
      "html.constraint-validation",
      "html.native-accessibility",
    ],
  },
  {
    id: "quest-html-learning-profile",
    lessonId: "html-05-review-practice",
    conceptIds: ["html.document-planning", "html.accessibility-audit"],
  },
];

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function createElementNode(tagName, attributes, parent) {
  return {
    tagName,
    attributes,
    parent,
    children: [],
    getAttribute(name) {
      return this.attributes.has(name.toLowerCase())
        ? this.attributes.get(name.toLowerCase())
        : null;
    },
    get textContent() {
      return this.children
        .map((child) => (typeof child === "string" ? child : child.textContent))
        .join("");
    },
  };
}

function parseAttributes(source) {
  const attributes = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  for (const match of source.matchAll(pattern)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    attributes.set(
      name.toLowerCase(),
      doubleQuoted ?? singleQuoted ?? unquoted ?? "",
    );
  }
  return attributes;
}

function parseHtmlFragment(source) {
  const root = { tagName: null, parent: null, children: [] };
  const stack = [root];
  const tokens = source.match(
    /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+|</gu,
  ) ?? [];

  for (const token of tokens) {
    if (token.startsWith("<!--") || /^<!/u.test(token)) continue;
    if (!token.startsWith("<")) {
      stack.at(-1).children.push(token);
      continue;
    }
    if (/^<\s*\//u.test(token)) {
      const closingName = /^<\s*\/\s*([A-Za-z][A-Za-z0-9-]*)/u
        .exec(token)?.[1]
        ?.toLowerCase();
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tagName === closingName) {
          stack.length = index;
          break;
        }
      }
      continue;
    }

    const opening = /^<\s*([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)(\/?)>$/u.exec(token);
    assert.ok(opening, `테스트용 HTML 파서가 해석할 수 없는 태그입니다: ${token}`);
    const [, rawTagName, rawAttributes, selfClosing] = opening;
    const tagName = rawTagName.toLowerCase();
    const parent = stack.at(-1);
    const node = createElementNode(tagName, parseAttributes(rawAttributes), parent);
    parent.children.push(node);
    if (!selfClosing && !VOID_ELEMENTS.has(tagName)) stack.push(node);
  }

  return root;
}

function parseCompoundSelector(selector) {
  const tagName = /^[A-Za-z][A-Za-z0-9-]*/u.exec(selector)?.[0]?.toLowerCase() ?? null;
  const ids = [...selector.matchAll(/#([A-Za-z_][A-Za-z0-9_-]*)/gu)].map(
    (match) => match[1],
  );
  const classes = [...selector.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/gu)].map(
    (match) => match[1],
  );
  const attributes = [...selector.matchAll(
    /\[([A-Za-z_:][A-Za-z0-9_.:-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]/gu,
  )].map((match) => ({
    name: match[1].toLowerCase(),
    expected: match[2] ?? match[3] ?? match[4],
  }));
  const unsupported = selector
    .replace(/^[A-Za-z][A-Za-z0-9-]*/u, "")
    .replace(/#[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/\.[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/\[[^\]]+\]/gu, "")
    .trim();
  assert.equal(unsupported, "", `테스트용 DOM이 지원하지 않는 선택자입니다: ${selector}`);
  return { tagName, ids, classes, attributes };
}

function matchesCompoundSelector(node, selector) {
  const parsed = parseCompoundSelector(selector);
  if (parsed.tagName && node.tagName !== parsed.tagName) return false;
  if (parsed.ids.some((id) => node.getAttribute("id") !== id)) return false;
  const classNames = new Set((node.getAttribute("class") ?? "").split(/\s+/u).filter(Boolean));
  if (parsed.classes.some((className) => !classNames.has(className))) return false;
  return parsed.attributes.every(({ name, expected }) => {
    const actual = node.getAttribute(name);
    return expected === undefined ? actual !== null : actual === expected;
  });
}

function collectElementDescendants(root) {
  const elements = [];
  const visit = (node) => {
    for (const child of node.children) {
      if (typeof child === "string") continue;
      elements.push(child);
      visit(child);
    }
  };
  visit(root);
  return elements;
}

function matchesChildSelectorChain(node, selectorParts) {
  let current = node;
  for (let index = selectorParts.length - 1; index >= 0; index -= 1) {
    if (!current || !matchesCompoundSelector(current, selectorParts[index])) return false;
    current = current.parent?.tagName ? current.parent : null;
  }
  return true;
}

function createQueryableFragment(source) {
  const root = parseHtmlFragment(source);
  const elements = collectElementDescendants(root);
  const querySelectorAll = (selector) => {
    const selectorParts = selector.split(">").map((part) => part.trim());
    assert.ok(selectorParts.every(Boolean), `비어 있는 선택자 구간입니다: ${selector}`);
    return elements.filter((element) =>
      matchesChildSelectorChain(element, selectorParts),
    );
  };
  return {
    querySelector(selector) {
      return querySelectorAll(selector)[0] ?? null;
    },
    querySelectorAll,
  };
}

function createMiniDomDocument() {
  return {
    createElement(name) {
      assert.equal(name, "template");
      let content = createQueryableFragment("<p>초기 문서</p>");
      return {
        get content() {
          return content;
        },
        set innerHTML(source) {
          content = createQueryableFragment(source);
        },
      };
    },
  };
}

function createMiniDomParser() {
  return {
    parseFromString(source, mimeType) {
      assert.equal(mimeType, "text/html");
      return {
        doctype: /<!doctype\s+html\s*>/iu.test(source)
          ? { name: "html", publicId: "", systemId: "" }
          : null,
      };
    },
  };
}

async function gradeSource(quest, source, requestId) {
  const runner = new BrowserWebCodeQuestRunner({
    environment: {
      documentRef: createMiniDomDocument(),
      domParserFactory: createMiniDomParser,
    },
  });
  const request = createWebCodeQuestExecutionRequest(
    collection,
    quest,
    source,
    requestId,
  );
  return runner.run(request);
}

test("HTML Code Quest 컬렉션이 새 스키마와 런타임 계약을 충족한다", () => {
  assert.equal(schema.title, "BAM.dev HTML and CSS Code Quest collection");
  assert.ok(schema.properties.evaluationKind.enum.includes("html-dom-v1"));
  assert.equal(schema.properties.quests.items.$ref, "#/$defs/quest");
  assert.deepEqual(validateWebCodeQuestCollection(collection, curriculum), []);
  assert.doesNotThrow(() => assertValidWebCodeQuestCollection(collection, curriculum));
  assert.equal(collection.schemaVersion, 1);
  assert.equal(collection.contractVersion, 1);
  assert.equal(collection.evaluationKind, "html-dom-v1");
  assert.equal(collection.languageId, "html");
});

test("다섯 Quest가 교안 순서와 개념에 연결되고 직접 HTML 작성 범위를 다룬다", () => {
  assert.equal(collection.quests.length, 5);
  assert.deepEqual(
    collection.quests.map(({ id, lessonId, conceptIds }) => ({ id, lessonId, conceptIds })),
    EXPECTED_QUEST_LINKS,
  );
  assert.deepEqual(
    collection.quests.map((quest) => quest.order),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    collection.quests.map((quest) => quest.slug),
    [
      "document-structure",
      "descriptive-navigation",
      "list-data-table",
      "accessible-form",
      "learning-profile",
    ],
  );

  for (const quest of collection.quests) {
    assert.match(quest.starterCode, /<[a-z]/iu, `${quest.id}: HTML 시작 코드가 필요합니다.`);
    assert.ok(
      quest.estimatedMinutes >= 20 && quest.estimatedMinutes <= 30,
      `${quest.id}: 예상 시간이 범위를 벗어났습니다.`,
    );
  }
});

test("공개 테스트·실패 설명·힌트가 학습자에게 완전하게 공개된다", () => {
  const allTestIds = [];
  for (const quest of collection.quests) {
    assert.ok(
      quest.publicTests.length >= 4 && quest.publicTests.length <= 6,
      `${quest.id}: 공개 테스트는 4~6개여야 합니다.`,
    );
    assert.equal(
      quest.requirements.length,
      quest.publicTests.length,
      `${quest.id}: 요구사항과 공개 테스트가 일대일이어야 합니다.`,
    );
    assert.deepEqual(
      quest.failureExplanations.map((item) => item.testId).sort(),
      quest.publicTests.map((item) => item.id).sort(),
      `${quest.id}: 공개 테스트마다 실패 설명이 하나씩 필요합니다.`,
    );
    assert.deepEqual(
      quest.hints.slice(0, 3).map(({ level, stage }) => ({ level, stage })),
      [
        { level: 1, stage: "concept" },
        { level: 2, stage: "observation" },
        { level: 3, stage: "implementation" },
      ],
    );
    assert.doesNotMatch(
      JSON.stringify(quest),
      /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu,
    );
    allTestIds.push(...quest.publicTests.map((publicTest) => publicTest.id));
  }
  assert.equal(new Set(allTestIds).size, allTestIds.length, "공개 테스트 ID가 중복됩니다.");
});

test("시작 코드·예시·검증 fixture가 외부 리소스 없이 안전 검사를 통과한다", () => {
  for (const quest of collection.quests) {
    const fixture = htmlCodeQuestSolutionFixtures[quest.id];
    assert.ok(fixture, `${quest.id}: 검증 fixture가 필요합니다.`);
    const sources = [
      quest.starterCode,
      ...quest.examples.map((example) => example.source),
      fixture.referenceSource,
      ...fixture.representativeWrongSolutions.map((wrong) => wrong.source),
    ];
    for (const source of sources) {
      assert.equal(
        findWebCodeQuestSourceIssue(collection.evaluationKind, source),
        null,
        `${quest.id}: 안전하지 않은 HTML source입니다.`,
      );
    }
  }
});

test("모든 기준 답안은 통과하고 대표 오답은 지정된 공개 테스트에서 실패한다", async () => {
  assert.deepEqual(
    Object.keys(htmlCodeQuestSolutionFixtures).sort(),
    collection.quests.map((quest) => quest.id).sort(),
  );

  for (const quest of collection.quests) {
    const fixture = htmlCodeQuestSolutionFixtures[quest.id];
    const referenceReport = await gradeSource(
      quest,
      fixture.referenceSource,
      `verify-${quest.slug}-reference`,
    );
    assert.equal(referenceReport.outcome, "passed", `${quest.id}: 기준 답안이 실패했습니다.`);
    assert.ok(
      referenceReport.tests.every((result) => result.outcome === "passed"),
      `${quest.id}: 통과하지 못한 기준 답안 테스트가 있습니다.`,
    );

    assert.ok(
      fixture.representativeWrongSolutions.length >= 1,
      `${quest.id}: 대표 오답이 필요합니다.`,
    );
    for (const wrong of fixture.representativeWrongSolutions) {
      const wrongReport = await gradeSource(
        quest,
        wrong.source,
        `verify-${quest.slug}-${wrong.id}`,
      );
      const actualFailingTestIds = wrongReport.tests
        .filter((result) => result.outcome === "wrong_answer")
        .map((result) => result.testId);
      assert.equal(wrongReport.outcome, "wrong_answer", `${quest.id}/${wrong.id}`);
      assert.deepEqual(
        actualFailingTestIds,
        wrong.expectedFailingPublicTestIds,
        `${quest.id}/${wrong.id}: 예상 실패 공개 테스트와 다릅니다.`,
      );
    }
  }
});

test("접근 가능한 폼은 컨트롤을 form 밖이나 서로 다른 form에 둔 오답을 거부한다", async () => {
  const quest = collection.quests.find(
    (candidate) => candidate.id === "quest-html-accessible-form",
  );
  assert.ok(quest);
  assert.equal(quest.revision, 3);

  const disconnectedReport = await gradeSource(
    quest,
    '<form></form><label for="email"></label><input id="email" type="email" name="email" required><button type="submit"></button>',
    "verify-accessible-form-disconnected-controls",
  );

  assert.equal(disconnectedReport.outcome, "wrong_answer");
  assert.deepEqual(
    disconnectedReport.tests
      .filter((result) => result.outcome === "wrong_answer")
      .map((result) => result.testId),
    [
      "html-form-form-exists",
      "html-form-email-label",
      "html-form-email-type",
      "html-form-email-name",
      "html-form-email-required",
      "html-form-submit-button",
    ],
  );

  const splitFormReport = await gradeSource(
    quest,
    '<form id="newsletter-signup"><label for="email">이메일</label></form><form><input id="email" type="email" name="email" required></form><form><button type="submit">신청하기</button></form>',
    "verify-accessible-form-split-controls",
  );

  assert.equal(splitFormReport.outcome, "wrong_answer");
  assert.deepEqual(
    splitFormReport.tests
      .filter((result) => result.outcome === "wrong_answer")
      .map((result) => result.testId),
    [
      "html-form-email-type",
      "html-form-email-name",
      "html-form-email-required",
      "html-form-submit-button",
    ],
  );
});
