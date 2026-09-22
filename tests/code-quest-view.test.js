import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getCodeQuestDraftStatusMessage,
  renderCodeQuestLoadingView,
  renderCodeQuestNavigationLink,
  renderCodeQuestView,
} from "../src/ui/code-quest-view.js";

const quest = {
  id: "quest-javascript-delivery-fee",
  slug: "delivery-fee-policy",
  revision: 1,
  order: 1,
  difficulty: "beginner",
  estimatedMinutes: 15,
  title: "배송비 정책 계산하기",
  summary: "조건을 나누어 최종 배송비를 계산합니다.",
  instructions: "calculateDeliveryFee 함수를 완성하세요.",
  entryPoint: "calculateDeliveryFee",
  starterCode: "function calculateDeliveryFee() {\n  return 0;\n}",
  functionContract: {
    parameters: [
      {
        name: "orderTotal",
        type: "integer",
        description: "주문 금액입니다.",
      },
    ],
    returns: {
      type: "integer",
      description: "최종 배송비입니다.",
    },
    constraints: ["주문 금액은 0 이상입니다."],
    complexity: { time: "O(1)", space: "O(1)" },
  },
  examples: [
    {
      args: [50000],
      expected: 0,
      explanation: "무료 배송 기준과 같습니다.",
    },
  ],
  publicTests: [
    { id: "delivery-threshold", label: "무료 기준", args: [50000], expected: 0 },
  ],
  failureExplanations: [
    { testId: "delivery-threshold", message: "경계값에서도 무료여야 합니다." },
  ],
  hints: [
    { level: 1, stage: "concept", title: "조건 나누기", content: "역할별로 나누세요." },
    { level: 2, stage: "observation", title: "경계 관찰", content: "같은 값도 확인하세요." },
    { level: 3, stage: "implementation", title: "분기 구현", content: "조건문을 작성하세요." },
  ],
};

function render(overrides = {}) {
  return renderCodeQuestView({
    languageId: "javascript",
    languageName: "JavaScript",
    collectionTitle: "JavaScript Code Quest",
    quest,
    currentIndex: 0,
    total: 5,
    source: quest.starterCode,
    ...overrides,
  });
}

function renderJava(overrides = {}) {
  const largeValues = [...Array.from({ length: 24 }, (_, index) => index), 987654];
  const javaQuest = {
    ...quest,
    id: "quest-java-bridge-que-01",
    slug: "bridge-que-01",
    title: "대기 순서 한 칸 돌리기",
    entryPoint: "solve",
    starterCode: "public class Solution {\n    public static int[] solve(int[] order) {\n        return new int[] {};\n    }\n}\n",
    functionContract: {
      ...quest.functionContract,
      parameters: [{ name: "order", type: "int[]", description: "순번 배열입니다." }],
      returns: { type: "int[]", description: "한 칸 돌린 새 배열입니다." },
    },
    examples: [{
      args: [[3, 9]],
      expected: [9, 3],
      explanation: "맨 앞 값을 맨 뒤로 보냅니다.",
      observations: { argument0Unchanged: true, returnNotArgument0: true },
    }],
    publicTests: [
      {
        id: "java-bridge-que-01-large-view",
        label: "큰 배열 공개 조건",
        args: [largeValues],
        expected: [...largeValues.slice(1), largeValues[0]],
        observations: { argument0Unchanged: true, returnNotArgument0: true },
      },
      {
        id: "java-bridge-que-01-small-view",
        label: "작은 배열 공개 조건",
        args: [[3, 9]],
        expected: [9, 3],
        observations: { argument0Unchanged: true, returnNotArgument0: true },
      },
    ],
  };
  return renderCodeQuestView({
    languageId: "java",
    languageName: "Java",
    collectionTitle: "Java Code Quest",
    evaluationKind: "java-static-method-v1",
    quest: javaQuest,
    currentIndex: 0,
    total: 4,
    source: javaQuest.starterCode,
    executionAvailable: false,
    ...overrides,
  });
}

function createReport(outcome = "wrong_answer", overrides = {}) {
  return {
    outcome,
    summary: {
      outcome,
      passed: outcome === "passed" ? 1 : 0,
      total: 1,
    },
    tests: [
      {
        testId: "delivery-threshold",
        label: "무료 기준",
        outcome,
        expected: 0,
        expectedDisplay: "0",
        actual: 3000,
        actualDisplay: "3000",
        hasActual: outcome === "passed" || outcome === "wrong_answer",
        durationMs: 1.2,
        console: [],
        error:
          outcome === "passed" || outcome === "wrong_answer" || outcome === "not_run"
            ? null
            : { learnerMessage: `${outcome} 안내` },
      },
    ],
    error: null,
    ...overrides,
  };
}

test("Code Quest 내비게이션은 실제 링크·현재 상태·완료 수를 표시한다", () => {
  const html = renderCodeQuestNavigationLink({
    href: '#/quest/javascript/delivery-fee-policy" onclick="bad()',
    isCurrent: true,
    completedCount: 2,
    totalCount: 5,
  });

  assert.match(html, /<nav class="quest-nav" aria-label="Code Quest">/);
  assert.match(html, /Code Quest/);
  assert.match(html, /2\/5 완료 · 공개 테스트/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /&quot; onclick=&quot;bad\(\)/);
  assert.doesNotMatch(html, /\s(?:aria-disabled|disabled)(?:=|\s|>)/);
});

test("Code Quest 로딩 화면은 본문 대상과 언어 escape를 유지한다", () => {
  const html = renderCodeQuestLoadingView({ languageName: "<img src=x onerror=bad()>" });
  assert.match(html, /class="loading-page" id="lesson-content" tabindex="-1"/);
  assert.match(html, /class="quest-state-message" role="status"/);
  assert.match(html, /&lt;img src=x onerror=bad\(\)&gt;/);
  assert.doesNotMatch(html, /<img/);
});

test("초기 화면은 문제·계약·예제와 명시적 편집기 label만 표시한다", () => {
  const html = render({
    source: '</textarea><script>globalThis.bad = true</script>',
  });

  assert.match(html, /class="quest-workspace"/);
  assert.match(html, /배송비 정책 계산하기/);
  assert.match(html, /함수 계약/);
  assert.match(html, /제약 조건/);
  assert.match(html, /예제 1/);
  assert.match(html, /<label[^>]*for="quest-source"/);
  assert.match(html, /class="quest-editor-shell"[^>]*data-quest-editor-shell/);
  assert.match(html, /<pre class="quest-source-highlight syntax-code" aria-hidden="true">/);
  assert.match(html, /data-quest-source-highlight/);
  assert.match(html, /<textarea[^>]*data-quest-source[^>]*>/);
  assert.match(html, /&lt;\/textarea&gt;&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /공개 테스트 결과/);
  assert.match(html, /코드를 실행하면 1개의 공개 테스트 결과가 표시됩니다/);
  assert.doesNotMatch(html, /data-quest-results/);
  assert.doesNotMatch(html, /무료 기준<\/h4>/);
  assert.equal((html.match(/data-quest-hint/g) ?? []).length, 0);
});

test("Quest 편집기와 JSON 예제는 원본 입력을 유지하며 안전하게 강조한다", () => {
  const html = render();

  assert.match(html, /data-quest-source-highlight>[\s\S]*code-token--keyword[^>]*>function</);
  assert.match(html, /data-quest-source-highlight>[\s\S]*code-token--function[^>]*>calculateDeliveryFee</);
  assert.match(html, /class="language-json"/);
  assert.match(html, /code-token--number[^>]*>50000</);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length >= 1, true);
  assert.doesNotMatch(html, /quest-source-highlight[^>]*tabindex/);
  assert.match(html, new RegExp(`<textarea[^>]*>${quest.starterCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/textarea>`));
});

test("JavaScript 함수형 예제는 이름 있는 열에서 JSON 타입과 설명 번호를 보존한다", () => {
  const typedQuest = structuredClone(quest);
  typedQuest.functionContract.parameters = [
    { name: "emptyList", type: "array", description: "빈 배열입니다." },
    { name: "numericText", type: "string", description: "숫자 모양 문자열입니다." },
    { name: "count", type: "integer", description: "실제 숫자입니다." },
    { name: "missing", type: "null", description: "빈 값입니다." },
    { name: "enabled", type: "boolean", description: "선택 상태입니다." },
    { name: "payload", type: "object", description: "JSON 객체입니다." },
  ];
  typedQuest.functionContract.returns = { type: "object", description: "결과 객체입니다." };
  typedQuest.examples = [
    {
      args: [[], "7", 7, null, false, { raw: "<tag>" }],
      expected: { ok: true },
      explanation: "각 값의 JSON 타입을 그대로 비교합니다.",
    },
    {
      args: [[], "0", 0, null, true, {}],
      expected: { ok: false },
    },
  ];

  const html = render({ quest: typedQuest });
  const table = html.match(/<table class="quest-example-table">[\s\S]*?<\/table>/)?.[0] ?? "";
  let previousHeader = -1;

  for (const header of ["예제", "emptyList", "numericText", "count", "missing", "enabled", "payload", "return"]) {
    const position = table.indexOf(header);
    assert.ok(position > previousHeader, `${header} 열이 계약 순서대로 있어야 합니다.`);
    previousHeader = position;
  }

  assert.equal((table.match(/<th scope="col">/g) ?? []).length, 8);
  assert.equal((table.match(/<th scope="row">/g) ?? []).length, 2);
  assert.equal((table.match(/<td>/g) ?? []).length, 14);
  assert.match(table, /<span class="code-line">\[\]<\/span>/);
  assert.match(table, /code-token--string[^>]*>&quot;7&quot;</);
  assert.match(table, /code-token--number[^>]*>7</);
  assert.match(table, /code-token--literal[^>]*>null</);
  assert.match(table, /code-token--literal[^>]*>false</);
  assert.match(table, /&quot;raw&quot;[\s\S]*&quot;&lt;tag&gt;&quot;/);
  assert.doesNotMatch(html, /<tag>/);
  assert.match(html, /<ol class="quest-example-explanations">[\s\S]*<li class="quest-prose" value="1"><strong>예제 1 설명<\/strong>/);
  assert.doesNotMatch(html, /예제 2 설명/);
});

test("대표 Java Quest와 long 반환 pilot은 타입·전체 공개 사례·원본 접근을 보존한다", async () => {
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
  );
  const expectedQuests = new Map([
    ["quest-java-bridge-arr-01", { parameters: ["readings", "slotNumber", "correctedValue"], examples: 2, downloads: 1 }],
    ["quest-java-bridge-arr-02", { parameters: ["values", "minimum", "maximum"], examples: 2, downloads: 1 }],
    ["quest-java-bridge-que-01", { parameters: ["order"], examples: 2, downloads: 1 }],
    ["quest-java-total-price", { parameters: ["price", "quantity", "shippingFee"], examples: 3, downloads: 0 }],
  ]);
  const rendered = new Map();

  for (const [questId, expected] of expectedQuests) {
    const javaQuest = collection.quests.find(({ id }) => id === questId);
    const html = renderJava({ quest: javaQuest });
    const table = html.match(/<table class="quest-example-table">[\s\S]*?<\/table>/)?.[0] ?? "";
    const publicDetails = html.match(/<details class="quest-public-tests">[\s\S]*?<\/section>/)?.[0] ?? "";
    rendered.set(questId, { html, table });

    assert.ok(javaQuest, `${questId} 기준 자료가 있어야 합니다.`);
    let previousHeader = -1;
    for (const header of ["예제", ...expected.parameters, "return"]) {
      const position = table.indexOf(header);
      assert.ok(position > previousHeader, `${questId}의 ${header} 열 순서가 계약과 같아야 합니다.`);
      previousHeader = position;
    }
    assert.equal((table.match(/<th scope="col">/g) ?? []).length, expected.parameters.length + 2);
    assert.equal((table.match(/<th scope="row">/g) ?? []).length, expected.examples);
    assert.equal((table.match(/<td>/g) ?? []).length, (expected.parameters.length + 1) * expected.examples);
    for (let number = 1; number <= expected.examples; number += 1) {
      assert.match(html, new RegExp(`<li class="quest-prose" value="${number}"><strong>예제 ${number} 설명<\\/strong>`));
    }
    for (const parameterName of expected.parameters) {
      assert.match(table, new RegExp(`<th scope="col"><code>${parameterName}<\\/code><\\/th>`));
      assert.match(publicDetails, new RegExp(`<dt><code>${parameterName}<\\/code>`));
    }
    assert.match(table, /<th scope="col"><code>return<\/code><\/th>/);
    assert.match(html, /모든 입력과 반환값·추가 확인 조건을 공개합니다[\s\S]*<details class="quest-public-tests">\s*<summary>공개 테스트 6개 보기<\/summary>/);
    assert.doesNotMatch(html, /<details class="quest-public-tests"[^>]*\bopen\b/);
    assert.equal((html.match(/data-quest-public-data data-quest-test-index=/g) ?? []).length, 6 - expected.downloads);
    assert.equal((html.match(/data-quest-public-download data-quest-test-index=/g) ?? []).length, expected.downloads);
    if (expected.downloads) {
      assert.match(html, /data-quest-public-download-status role="status" aria-live="polite"/);
    }
    for (const [index, publicTest] of javaQuest.publicTests.entries()) {
      assert.ok(html.includes(`${index + 1}. ${publicTest.label}`));
    }
    const observationCount = javaQuest.publicTests.filter(({ observations }) => observations).length;
    assert.equal((html.match(/<h4>공개 추가 관찰<\/h4>/g) ?? []).length, observationCount);
  }

  const longTable = rendered.get("quest-java-total-price").table;
  assert.match(longTable, /code-token--number[^>]*>4000003000<\/span>/);
  assert.doesNotMatch(longTable, /code-token--string[^>]*>&quot;4000003000&quot;/);

  const countTable = rendered.get("quest-java-bridge-arr-02").table;
  assert.match(countTable, /<span class="code-line">\[\]<\/span>/);
  assert.match(countTable, /code-token--number[^>]*>0<\/span>/);

  const queueHtml = rendered.get("quest-java-bridge-que-01").html;
  assert.match(queueHtml, /<code>order<\/code><small>order 총 100000개 · 처음 20개까지 표시<\/small>/);
  assert.doesNotMatch(queueHtml, /(?:&quot;|")…(?:&quot;|")/);
  assert.doesNotMatch(queueHtml, /code-token--number[^>]*>99999<\/span>/);
  assert.ok(queueHtml.length < 100_000, `큰 공개 배열이 DOM을 ${queueHtml.length}자로 늘리면 안 됩니다.`);
});

test("실행 중에는 편집과 중복 실행을 막고 실제 취소 버튼만 제공한다", () => {
  const html = render({ isRunning: true });
  assert.match(html, /quest-run-panel[^>]*aria-busy="true"/);
  assert.match(html, /data-quest-source[^>]*readonly/);
  assert.match(html, /data-quest-run[^>]*aria-busy="true"[^>]*disabled/);
  assert.match(html, /data-quest-cancel/);
  assert.doesNotMatch(html, /data-quest-reset/);
  assert.doesNotMatch(html, /data-quest-results/);
});

test("Java 실행 준비 중에도 문제·힌트·편집기와 공개 데이터 hook을 유지한다", () => {
  const source = "public class Solution { /* 저장할 초안 */ }";
  const first = renderJava({ source, visibleHintCount: 1 });
  const rerendered = renderJava({ source: `${source}\n// 계속 작성`, visibleHintCount: 2 });

  for (const html of [first, rerendered]) {
    assert.match(html, /Java 실행 준비 중 · 코드 작성·저장 가능/);
    assert.match(html, /data-quest-source[^>]*>/);
    assert.doesNotMatch(html, /data-quest-source[^>]*readonly/);
    assert.match(html, /data-quest-run[^>]*disabled/);
    assert.match(html, /data-quest-reset/);
    assert.match(html, /<details class="quest-public-tests">\s*<summary>공개 테스트 2개 보기<\/summary>/);
    assert.match(html, /<code>order<\/code><small>order 총 25개 · 처음 20개까지 표시<\/small>/);
    assert.doesNotMatch(html, /(?:&quot;|")…(?:&quot;|")/);
    assert.doesNotMatch(html, /987654/);
    assert.match(html, /첫 번째 인수의 원본 값 보존/);
    assert.match(html, /입력과 다른 새 배열 반환/);
    assert.match(html, /data-quest-public-download data-quest-test-index="0"/);
    assert.match(html, /전체 공개 원본 JSON에는 인수와 기대값·추가 관찰이 포함됩니다/);
    assert.match(html, /data-quest-public-download-status role="status" aria-live="polite"/);
    assert.doesNotMatch(html, /<details[^>]*data-quest-public-data[^>]*data-quest-test-index="0"/);
    assert.match(html, /<details[^>]*data-quest-public-data data-quest-test-index="1">\s*<summary>전체 공개 데이터 보기<\/summary>/);
    assert.match(html, /data-quest-public-data-output[^>]*><\/textarea>/);
  }
  assert.match(first, /조건 나누기/);
  assert.doesNotMatch(first, /경계 관찰/);
  assert.match(rerendered, /조건 나누기/);
  assert.match(rerendered, /경계 관찰/);
  assert.match(first, /public class Solution \{ \/\* 저장할 초안 \*\/ \}/);
  assert.match(rerendered, /\/\/ 계속 작성/);
});

test("힌트는 개념→관찰→구현 순서로 한 단계씩만 DOM에 공개한다", () => {
  const none = render({ visibleHintCount: 0 });
  const first = render({ visibleHintCount: 1 });
  const second = render({ visibleHintCount: 2 });
  const all = render({ visibleHintCount: 3 });

  assert.doesNotMatch(none, /조건 나누기|경계 관찰|분기 구현/);
  assert.match(none, /힌트 1 보기/);
  assert.match(first, /1단계 · 개념/);
  assert.match(first, /조건 나누기/);
  assert.doesNotMatch(first, /경계 관찰|분기 구현/);
  assert.match(second, /1단계 · 개념/);
  assert.match(second, /2단계 · 관찰/);
  assert.doesNotMatch(second, /분기 구현/);
  assert.match(all, /3단계 · 구현/);
  assert.match(all, /모든 힌트를 확인했습니다/);
  assert.match(all, /data-quest-show-hint[^>]*disabled/);
});

test("오답 결과는 이름 있는 단일 focus region으로 기대값·실제값·원인을 표시한다", () => {
  const html = render({
    report: createReport("wrong_answer"),
    reportPersistenceStatus: "saved",
  });

  assert.equal((html.match(/data-quest-results/g) ?? []).length, 1);
  assert.match(
    html,
    /data-quest-results tabindex="-1" role="region" aria-labelledby="quest-results-title"/,
  );
  assert.doesNotMatch(html, /data-quest-results[^>]*(?:aria-live|role="status")/);
  assert.match(html, /기대값/);
  assert.match(html, /실제값/);
  assert.match(html, /경계값에서도 무료여야 합니다/);
  assert.match(html, /0\/1 통과/);
  assert.match(html, /최근 Code Quest 기록에 저장했습니다/);
});

test("실행 outcome을 모두 구분하고 실제값이 없는 결과에는 실제값을 만들지 않는다", () => {
  const expectedLabels = new Map([
    ["passed", "통과"],
    ["wrong_answer", "기대값과 다름"],
    ["syntax_error", "문법 오류"],
    ["runtime_error", "실행 오류"],
    ["timeout", "시간 초과"],
    ["output_limit", "출력 한도 초과"],
    ["cancelled", "실행 취소"],
    ["engine_error", "실행기 오류"],
    ["not_run", "실행하지 않음"],
  ]);

  for (const [outcome, label] of expectedLabels) {
    const html = render({ report: createReport(outcome) });
    assert.match(html, new RegExp(label));
    if (!["passed", "wrong_answer"].includes(outcome)) {
      assert.doesNotMatch(html, /<dt>실제값<\/dt>/);
    }
  }
});

test("상속 프로퍼티와 알 수 없는 outcome은 실행기 오류로 안전하게 렌더링한다", () => {
  const invalidOutcomes = ["constructor", "toString", "__proto__", "unknown_outcome", null];

  for (const outcome of invalidOutcomes) {
    const html = render({ report: createReport(outcome) });

    assert.match(html, /quest-results is-danger/);
    assert.match(html, /코드 실행기를 사용할 수 없습니다/);
    assert.match(html, /quest-test-result is-danger/);
    assert.match(html, /quest-outcome-badge">실행기 오류/);
    assert.doesNotMatch(html, /is-undefined|>undefined</);
  }
});

test("리포트와 오류의 동적 문자열을 escape하고 비영속 안내를 결과 안에 유지한다", () => {
  const maliciousQuest = structuredClone(quest);
  maliciousQuest.title = "<img src=x onerror=bad()>";
  maliciousQuest.instructions = "</p><script>bad()</script>";
  maliciousQuest.hints[0].title = "<svg onload=bad()>";
  maliciousQuest.failureExplanations[0].message = "<iframe src=x>";
  const report = createReport("wrong_answer");
  report.tests[0].label = "<img src=x>";
  report.tests[0].expectedDisplay = "</code><script>bad()</script>";
  report.error = { learnerMessage: "<strong>bad</strong>" };

  const html = render({
    quest: maliciousQuest,
    visibleHintCount: 1,
    report,
    reportPersistenceStatus: "memory",
    uiError: "<img src=x onerror=bad()>",
  });

  assert.doesNotMatch(html, /<(?:script|iframe|svg|img)(?:\s|>)/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(html, /&lt;iframe src=x&gt;/);
  assert.match(html, /현재 탭에만 저장되었습니다/);
  assert.match(html, /data-quest-error role="alert"/);
});

test("Quest 설명 prose는 백틱을 안전한 인라인 코드로 렌더링한다", () => {
  const inlineQuest = structuredClone(quest);
  inlineQuest.summary = "`summaryCode`와 <strong>요약</strong>";
  inlineQuest.instructions =
    "`calculateDeliveryFee(orderTotal, destination, hasMembership)`와 `destination`을 확인하세요.";
  inlineQuest.functionContract.parameters[0].description = "`orderTotal`은 <img src=x> 금액입니다.";
  inlineQuest.functionContract.returns.description = "`number`를 반환합니다.";
  inlineQuest.functionContract.constraints = ["`orderTotal >= 0`을 만족합니다."];
  inlineQuest.examples[0].explanation = "결과는 `0`입니다.";
  inlineQuest.hints[0].title = "`if` 조건";
  inlineQuest.hints[0].content = "`destination === \"island\"`를 먼저 관찰하세요.";
  inlineQuest.failureExplanations[0].message = "`>=` 경계와 <iframe src=x>를 확인하세요.";

  const html = render({
    quest: inlineQuest,
    visibleHintCount: 1,
    report: createReport("wrong_answer"),
  });

  assert.match(
    html,
    /<code>calculateDeliveryFee\(orderTotal, destination, hasMembership\)<\/code>/,
  );
  assert.match(html, /<code>destination<\/code>/);
  assert.match(html, /<code>orderTotal &gt;= 0<\/code>/);
  assert.match(html, /<code>destination === &quot;island&quot;<\/code>/);
  assert.match(html, /<code>&gt;=<\/code>/);
  assert.doesNotMatch(html, /`calculateDeliveryFee|`destination`|`orderTotal &gt;= 0`/);
  assert.doesNotMatch(html, /<(?:img|iframe)(?:\s|>)/);
  assert.doesNotMatch(html, /<strong>요약<\/strong>/);
  assert.match(html, /&lt;strong&gt;요약&lt;\/strong&gt;/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /&lt;iframe src=x&gt;/);
});

test("초안 저장 상태 문구와 이전·다음 Quest 링크를 렌더링한다", () => {
  const html = render({
    draftStatus: "failed",
    isCompleted: true,
    previous: { href: '#/quest/javascript/prev" bad="x', title: "이전 <Quest>" },
    next: { href: "#/quest/javascript/next", title: "다음 Quest" },
  });

  assert.equal(
    getCodeQuestDraftStatusMessage("failed"),
    "초안을 저장하지 못했습니다. 코드는 편집기에 그대로 유지됩니다.",
  );
  assert.match(html, /quest-draft-status is-warning/);
  assert.match(html, /quest-completion-badge is-complete">완료/);
  assert.match(html, /&quot; bad=&quot;x/);
  assert.match(html, /이전 &lt;Quest&gt;/);
  assert.match(html, /다음 Quest/);
});

test("상속 프로퍼티와 알 수 없는 초안 상태는 초기 코드 안내로 돌아간다", () => {
  const invalidStatuses = ["constructor", "toString", "__proto__", "unknown_status", null];
  const starterMessage = "초기 코드를 불러왔습니다. 편집하면 자동으로 저장됩니다.";

  for (const status of invalidStatuses) {
    assert.equal(getCodeQuestDraftStatusMessage(status), starterMessage);

    const html = render({ draftStatus: status });
    assert.match(html, /class="quest-draft-status"[^>]*>초기 코드를 불러왔습니다/);
    assert.doesNotMatch(html, /quest-draft-status is-warning/);
  }
});

test("HTML Quest는 함수 계약 대신 직접 마크업 요구사항과 비실행 구조 검사를 안내한다", () => {
  const htmlQuest = {
    ...quest,
    entryPoint: undefined,
    functionContract: undefined,
    requirements: ["main 요소 안에 <h1>을 작성합니다."],
    examples: [
      {
        source: '<main><h1 class="title">안녕</h1></main>',
        explanation: "문서의 핵심 제목을 main 안에 둡니다.",
      },
    ],
  };
  const html = render({
    languageId: "html",
    languageName: "HTML",
    evaluationKind: "html-dom-v1",
    quest: htmlQuest,
    source: '</textarea><script>bad()</script>',
  });

  assert.match(html, /공개 검사 요구사항/);
  assert.match(html, /HTML 마크업/);
  assert.match(html, /코드를 동작시키지 않고 공개된 문서 구조 검사만 수행/);
  assert.match(html, /class="language-html"/);
  assert.match(html, /code-token--tag[^>]*>main</);
  assert.match(html, /code-token--property[^>]*>class</);
  assert.match(html, /code-token--string[^>]*>&quot;title&quot;</);
  assert.match(html, /main 요소 안에 &lt;h1&gt;을 작성합니다/);
  assert.doesNotMatch(html, /함수 계약|함수 코드/);
  assert.doesNotMatch(html, /<script>/);
});

test("CSS Quest는 제공 HTML을 escape해 보여 주고 직접 스타일시트 검사를 안내한다", () => {
  const cssQuest = {
    ...quest,
    entryPoint: undefined,
    functionContract: undefined,
    requirements: [".card의 display를 grid로 지정합니다."],
    fixtureHtml: '<article class="card"><img src=x onerror=bad()></article>',
    examples: [
      {
        source: ".card { display: grid; }",
        explanation: "카드를 그리드 컨테이너로 만듭니다.",
      },
    ],
  };
  const html = render({
    languageId: "css",
    languageName: "CSS",
    evaluationKind: "css-style-v1",
    quest: cssQuest,
    source: ".card { display: grid; }",
  });

  assert.match(html, /CSS 스타일시트/);
  assert.match(html, /제공 HTML/);
  assert.match(html, /고정 HTML에 적용해 공개된 규칙·스타일 검사만 수행/);
  assert.match(html, /class="language-html"/);
  assert.match(html, /code-token--tag[^>]*>article</);
  assert.match(html, /code-token--property[^>]*>onerror</);
  assert.match(html, /class="language-css"/);
  assert.match(html, /code-token--selector[^>]*>\.card</);
  assert.match(html, /code-token--property[^>]*>display</);
  assert.doesNotMatch(html, /<article class="card">|<img src=x/);
});
