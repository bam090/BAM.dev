import assert from "node:assert/strict";
import test from "node:test";
import {
  getCodingTestDraftStatusMessage,
  renderCodingTestListView,
  renderCodingTestLoadingView,
  renderCodingTestNavigationLink,
  renderCodingTestView,
} from "../src/ui/coding-test-view.js";

const problem = {
  id: "coding-test-javascript-cart-total",
  slug: "cart-total",
  revision: 1,
  order: 1,
  lessonId: "js-05-arrays-objects-built-ins",
  conceptIds: ["js.arrays", "js.array-methods"],
  difficulty: "beginner",
  type: "array",
  tags: ["배열", "누적"],
  estimatedMinutes: 20,
  title: "장바구니 합계 계산하기",
  summary: "상품 가격을 순회해 합계를 계산합니다.",
  description: "calculateCartTotal 함수가 모든 상품 가격의 합을 반환하도록 구현하세요.",
  functionContract: {
    parameters: [
      {
        name: "prices",
        type: "number[]",
        description: "0 이상의 상품 가격 배열입니다.",
      },
    ],
    returns: {
      type: "number",
      description: "모든 상품 가격의 합입니다.",
    },
    constraints: ["prices의 길이는 0 이상 100 이하입니다."],
    complexity: { time: "O(n)", space: "O(1)" },
  },
  entryPoint: "calculateCartTotal",
  starterCode: "function calculateCartTotal(prices) {\n  return 0;\n}",
  examples: [
    {
      args: [[1000, 2500]],
      expected: 3500,
      explanation: "두 가격을 더하면 3,500입니다.",
    },
  ],
  publicTests: [
    { id: "cart-basic", label: "두 상품", args: [[1000, 2500]], expected: 3500 },
    { id: "cart-empty", label: "빈 장바구니", args: [[]], expected: 0 },
    { id: "cart-single", label: "상품 하나", args: [[4000]], expected: 4000 },
  ],
  runTestIds: ["cart-basic", "cart-empty"],
  failureExplanations: [
    { testId: "cart-basic", message: "모든 배열 요소를 누적했는지 확인하세요." },
    { testId: "cart-empty", message: "빈 배열의 합은 0이어야 합니다." },
    { testId: "cart-single", message: "요소가 하나인 경우도 확인하세요." },
  ],
};

function createReport(outcome = "wrong_answer", overrides = {}) {
  return {
    outcome,
    summary: { passed: outcome === "passed" ? 1 : 0, total: 1 },
    tests: [
      {
        testId: "cart-basic",
        label: "두 상품",
        outcome,
        expected: 3500,
        expectedDisplay: "3500",
        actual: 0,
        actualDisplay: "0",
        hasActual: outcome === "passed" || outcome === "wrong_answer",
        durationMs: 1.4,
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

function renderDetail(overrides = {}) {
  return renderCodingTestView({
    languageName: "JavaScript",
    collectionTitle: "JavaScript 코딩테스트",
    listHref: "#/coding-tests",
    problem,
    source: problem.starterCode,
    ...overrides,
  });
}

test("코딩테스트 내비게이션과 로딩 화면은 실제 링크·현재 상태·escape를 유지한다", () => {
  const navigation = renderCodingTestNavigationLink({
    href: '#/coding-tests" onclick="bad()',
    isCurrent: true,
    solvedCount: 2,
    totalCount: 5,
  });
  const loading = renderCodingTestLoadingView({ title: "<img src=x onerror=bad()>" });

  assert.match(navigation, /<nav class="coding-test-nav" aria-label="코딩테스트">/);
  assert.match(navigation, /2\/5 풀이 완료/);
  assert.match(navigation, /aria-current="page"/);
  assert.match(navigation, /&quot; onclick=&quot;bad\(\)/);
  assert.doesNotMatch(navigation, /\s(?:aria-disabled|disabled)(?:=|\s|>)/);
  assert.match(loading, /class="loading-page" id="lesson-content" tabindex="-1"/);
  assert.match(loading, /class="coding-test-state-message" role="status"/);
  assert.match(loading, /&lt;img src=x onerror=bad\(\)&gt;/);
  assert.doesNotMatch(loading, /<img/);
});

test("목록은 검색·난이도·언어·유형·풀이 상태 필터와 현재 값을 렌더링한다", () => {
  const html = renderCodingTestListView({
    title: "JavaScript 코딩테스트",
    problems: [problem],
    totalCount: 3,
    filters: {
      query: '합계" autofocus onfocus="bad()',
      difficulty: "beginner",
      language: "javascript",
      type: "array",
      status: "solved",
    },
    languageOptions: [{ value: "javascript", label: "JavaScript" }],
    typeOptions: [{ value: "array", label: "배열" }],
    solvedProblemIds: new Set([problem.id]),
    hrefByProblemId: {
      [problem.id]: '#/coding-tests/javascript/cart-total" onclick="bad()',
    },
  });

  assert.match(html, /id="coding-test-list-title" tabindex="-1"/);
  assert.match(html, /data-coding-test-search[^>]*type="search"/);
  assert.match(html, /data-coding-test-filter="difficulty"/);
  assert.match(html, /data-coding-test-filter="language"/);
  assert.match(html, /data-coding-test-filter="type"/);
  assert.match(html, /data-coding-test-filter="status"/);
  assert.match(html, /data-coding-test-filter-reset/);
  assert.match(html, /value="beginner" selected/);
  assert.match(html, /value="javascript" selected/);
  assert.match(html, /value="array" selected/);
  assert.match(html, /value="solved" selected/);
  assert.match(html, /합계&quot; autofocus onfocus=&quot;bad\(\)/);
  assert.doesNotMatch(html, /value="합계" autofocus/);
  assert.match(html, /전체 3문제 중 1문제/);
  assert.match(html, /data-coding-test-status>풀이 완료/);
  assert.match(html, /data-coding-test-link href="#\/coding-tests\/javascript\/cart-total&quot; onclick=&quot;bad\(\)"/);
  assert.match(html, /배열/);
  assert.match(html, /누적/);
});

test("필터 결과가 없으면 이름 있는 빈 상태와 초기화 안내를 표시한다", () => {
  const html = renderCodingTestListView({ problems: [], totalCount: 4 });

  assert.match(html, /data-coding-test-count>전체 4문제 중 0문제/);
  assert.match(html, /data-coding-test-empty aria-labelledby="coding-test-empty-title"/);
  assert.match(html, /조건에 맞는 문제가 없습니다/);
  assert.doesNotMatch(html, /data-coding-test-list>/);
});

test("필터 결과 개수 변경을 보조 기술에 알린다", () => {
  const html = renderCodingTestListView({ problems: [problem], totalCount: 3 });

  assert.match(
    html,
    /role="status" aria-live="polite" aria-atomic="true" data-coding-test-count>전체 3문제 중 1문제/,
  );
});

test("상세 화면은 좌측 문제와 우측 편집기·결과의 접근성 계약을 제공한다", () => {
  const html = renderDetail({
    source: '</textarea><script>globalThis.bad = true</script>',
  });

  const problemPanelIndex = html.indexOf('class="coding-test-problem-panel"');
  const editorPanelIndex = html.indexOf('class="coding-test-editor-panel"');
  const resultPanelIndex = html.indexOf('class="coding-test-results-panel"');
  assert.ok(problemPanelIndex >= 0 && editorPanelIndex > problemPanelIndex);
  assert.ok(resultPanelIndex > editorPanelIndex);
  assert.match(html, /id="coding-test-title" tabindex="-1"/);
  assert.match(html, /문제 설명/);
  assert.match(html, /제한사항/);
  assert.match(html, /입력과 출력/);
  assert.match(html, /입출력 예/);
  assert.match(html, /예제와 설명/);
  assert.match(html, /<label[^>]*for="coding-test-source"/);
  assert.match(html, /<textarea[^>]*id="coding-test-source"[^>]*data-coding-test-source/);
  assert.match(html, /&lt;\/textarea&gt;&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.equal((html.match(/data-coding-test-results/g) ?? []).length, 1);
  assert.match(
    html,
    /data-coding-test-results tabindex="-1" role="region" aria-labelledby="coding-test-results-title"/,
  );
  assert.doesNotMatch(html, /data-coding-test-results[^>]*(?:role="status"|aria-live)/);
  assert.match(html, /화면에 공개된 테스트만 사용합니다/);
  assert.match(html, /화면에 공개된 테스트 3개를 모두 채점합니다/);
  assert.doesNotMatch(html, /비밀\s*테스트|숨김\s*테스트|secret\s*test|hidden\s*test/i);
});

test("Java 상세 화면은 Solution 정적 메서드와 로컬 채점 경계를 안내한다", () => {
  const html = renderDetail({
    languageId: "java",
    languageName: "Java",
    collectionTitle: "Java 코딩테스트",
  });

  assert.match(html, /Solution\.calculateCartTotal 정적 메서드를 포함한 클래스 코드/);
  assert.match(html, /정적 메서드 계약/);
  assert.match(html, /로컬 Java 채점기/);
  assert.match(html, /공개 테스트 채점/);
  assert.doesNotMatch(html, /비밀\s*테스트|숨김\s*테스트/i);
});

test("실행 중에는 편집·실행·제출을 막고 취소 상태를 명확히 표시한다", () => {
  const runHtml = renderDetail({ isRunning: true, executionMode: "run" });
  const submitHtml = renderDetail({
    isRunning: true,
    cancelRequested: true,
    executionMode: "submit",
  });

  assert.match(runHtml, /coding-test-editor-panel[^>]*aria-busy="true"/);
  assert.match(runHtml, /data-coding-test-source[^>]*readonly/);
  assert.match(runHtml, /data-coding-test-run[^>]*aria-busy="true"[^>]*disabled>실행 중…/);
  assert.match(runHtml, /data-coding-test-submit[^>]*disabled>제출 및 채점/);
  assert.match(runHtml, /data-coding-test-cancel>실행 취소/);
  assert.doesNotMatch(runHtml, /data-coding-test-reset/);
  assert.match(submitHtml, /data-coding-test-submit[^>]*aria-busy="true"[^>]*disabled>채점 중…/);
  assert.match(submitHtml, /data-coding-test-cancel disabled>취소하는 중…/);
  assert.match(submitHtml, /제출 테스트를 채점하고 있습니다/);
});

test("실행과 제출 결과 문구를 구분하고 제출에만 저장 상태를 표시한다", () => {
  const runHtml = renderDetail({
    executionMode: "run",
    report: createReport("passed"),
    reportPersistenceStatus: "saved",
  });
  const submitHtml = renderDetail({
    executionMode: "submit",
    report: createReport("wrong_answer"),
    reportPersistenceStatus: "memory",
  });

  assert.match(runHtml, /data-coding-test-result-mode>마지막 실행 테스트 결과/);
  assert.match(runHtml, /실행 테스트를 모두 통과했습니다/);
  assert.doesNotMatch(runHtml, /최근 코딩테스트 기록에 저장/);
  assert.match(submitHtml, /data-coding-test-result-mode>마지막 제출 채점 결과/);
  assert.match(submitHtml, /제출 채점에서 통과하지 못한 테스트가 있습니다/);
  assert.match(submitHtml, /모든 배열 요소를 누적했는지 확인하세요/);
  assert.match(submitHtml, /현재 탭에만 저장되었습니다/);
  assert.match(submitHtml, /0\/1 통과/);
});

test("모든 실행 outcome을 구분하고 실제값이 없는 결과를 만들어 내지 않는다", () => {
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
    const html = renderDetail({ executionMode: "run", report: createReport(outcome) });
    assert.match(html, new RegExp(label));
    if (!["passed", "wrong_answer"].includes(outcome)) {
      assert.doesNotMatch(html, /<dt>실제값<\/dt>/);
    }
  }
});

test("상속 프로퍼티와 알 수 없는 outcome은 실행기 오류로 안전하게 렌더링한다", () => {
  const invalidOutcomes = ["constructor", "toString", "__proto__", "unknown_outcome", null];

  for (const outcome of invalidOutcomes) {
    const html = renderDetail({ executionMode: "run", report: createReport(outcome) });

    assert.match(html, /coding-test-report is-danger/);
    assert.match(html, /코드 실행기를 사용할 수 없습니다/);
    assert.match(html, /coding-test-case is-danger/);
    assert.match(html, /coding-test-outcome">실행기 오류/);
    assert.doesNotMatch(html, /is-undefined|>undefined</);
  }
});

test("문제·리포트·오류의 동적 문자열을 escape하고 초안 상태를 구분한다", () => {
  const maliciousProblem = structuredClone(problem);
  maliciousProblem.title = "<img src=x onerror=bad()>";
  maliciousProblem.description = "</p><script>bad()</script>";
  maliciousProblem.examples[0].explanation = "<svg onload=bad()>";
  maliciousProblem.failureExplanations[0].message = "<iframe src=x>";
  const report = createReport("wrong_answer");
  report.tests[0].label = "<img src=x>";
  report.tests[0].expectedDisplay = "</code><script>bad()</script>";
  report.error = { learnerMessage: "<strong>bad</strong>" };

  const html = renderCodingTestView({
    problem: maliciousProblem,
    source: problem.starterCode,
    draftStatus: "failed",
    uiError: "<img src=x onerror=bad()>",
    executionMode: "submit",
    report,
    reportPersistenceStatus: "failed",
  });

  assert.doesNotMatch(html, /<(?:script|iframe|svg|img)(?:\s|>)/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(html, /&lt;iframe src=x&gt;/);
  assert.match(html, /data-coding-test-error role="alert"/);
  assert.match(html, /coding-test-draft-status is-warning/);
  assert.equal(
    getCodingTestDraftStatusMessage("failed"),
    "초안을 저장하지 못했습니다. 코드는 편집기에 그대로 유지됩니다.",
  );
  assert.match(html, /제출 결과는 화면에 유지되지만 시도 기록을 저장하지 못했습니다/);
});

test("상속 프로퍼티와 알 수 없는 초안 상태는 초기 코드 안내로 돌아간다", () => {
  const invalidStatuses = ["constructor", "toString", "__proto__", "unknown_status", null];
  const starterMessage = "초기 코드를 불러왔습니다. 편집하면 자동으로 저장됩니다.";

  for (const status of invalidStatuses) {
    assert.equal(getCodingTestDraftStatusMessage(status), starterMessage);

    const html = renderDetail({ draftStatus: status });
    assert.match(html, /class="coding-test-draft-status"[^>]*>초기 코드를 불러왔습니다/);
    assert.doesNotMatch(html, /coding-test-draft-status is-warning/);
  }
});

test("저자 설명의 백틱 코드는 code 요소로 표시하면서 HTML은 escape한다", () => {
  const inlineCodeProblem = structuredClone(problem);
  inlineCodeProblem.summary = "`sum`을 호출하고 <img src=x>를 출력하지 않습니다.";
  inlineCodeProblem.description = "`public static` 메서드를 구현하세요.";
  inlineCodeProblem.functionContract.parameters[0].description = "`prices` 배열입니다.";
  inlineCodeProblem.functionContract.returns.description = "`int` 합계입니다.";
  inlineCodeProblem.functionContract.constraints = ["`null`은 입력되지 않습니다."];
  inlineCodeProblem.examples[0].explanation = "`1000 + 2500`은 3500입니다.";
  inlineCodeProblem.failureExplanations[0].message = "`return` 값을 확인하세요.";
  inlineCodeProblem.publicTests = [inlineCodeProblem.publicTests[0]];
  inlineCodeProblem.runTestIds = ["cart-basic"];

  const detailHtml = renderCodingTestView({
    problem: inlineCodeProblem,
    source: inlineCodeProblem.starterCode,
    executionMode: "run",
    report: createReport("wrong_answer"),
  });
  const listHtml = renderCodingTestListView({ problems: [inlineCodeProblem] });

  assert.match(detailHtml, /<code>sum<\/code>을 호출하고 &lt;img src=x&gt;/);
  assert.match(detailHtml, /<code>public static<\/code> 메서드/);
  assert.match(detailHtml, /<code>prices<\/code> 배열/);
  assert.match(detailHtml, /<code>int<\/code> 합계/);
  assert.match(detailHtml, /<code>null<\/code>은 입력되지/);
  assert.match(detailHtml, /<code>1000 \+ 2500<\/code>은 3500/);
  assert.match(detailHtml, /<code>return<\/code> 값을 확인/);
  assert.match(listHtml, /<code>sum<\/code>을 호출하고 &lt;img src=x&gt;/);
  assert.doesNotMatch(detailHtml, /<(?:img|script|iframe)(?:\s|>)/);
});
