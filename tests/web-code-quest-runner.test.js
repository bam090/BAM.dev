import assert from "node:assert/strict";
import test from "node:test";

import {
  BrowserWebCodeQuestRunner,
  DEFAULT_WEB_CODE_QUEST_LIMITS,
  evaluateCssStyleAssertion,
  evaluateHtmlDomAssertion,
} from "../src/grading/browser-web-code-quest-runner.js";

function createHtmlRequest(overrides = {}) {
  return {
    requestId: "web-request-one",
    contractVersion: 1,
    questId: "quest-html-landmark",
    questRevision: 1,
    languageId: "html",
    evaluationKind: "html-dom-v1",
    suite: "public",
    source: "<main><h1>소개</h1></main>",
    fixtureHtml: null,
    tests: [
      {
        id: "main-exists",
        label: "main 요소가 있다",
        assertion: { kind: "selector-exists", selector: "main" },
        expected: true,
      },
      {
        id: "heading-count",
        label: "h1 요소가 하나다",
        assertion: { kind: "selector-count", selector: "h1", expected: 1 },
        expected: 1,
      },
    ],
    ...overrides,
  };
}

function createCssRequest(overrides = {}) {
  return {
    requestId: "web-request-css",
    contractVersion: 1,
    questId: "quest-css-card-box",
    questRevision: 2,
    languageId: "css",
    evaluationKind: "css-style-v1",
    suite: "public",
    source: ".card { box-sizing: border-box; padding: 16px; }",
    fixtureHtml: '<article class="card">카드</article>',
    tests: [
      {
        id: "card-box-sizing",
        label: "box-sizing 선언",
        assertion: {
          kind: "rule-declaration",
          selector: ".card",
          property: "box-sizing",
          expected: "border-box",
        },
        expected: "border-box",
      },
    ],
    ...overrides,
  };
}

function createComputedStyleRequest(overrides = {}) {
  return createCssRequest({
    source: ".card { color: #1e293b; }",
    tests: [
      {
        id: "card-color",
        label: "카드 글자색",
        assertion: {
          kind: "computed-style",
          selector: ".card",
          property: "color",
          expected: "#1e293b",
        },
        expected: "#1e293b",
      },
    ],
    ...overrides,
  });
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createFakeTimer() {
  let pendingCallback = null;
  let scheduledDelay = null;
  let clearCalls = 0;

  return {
    setTimeoutFn: (callback, delay) => {
      pendingCallback = callback;
      scheduledDelay = delay;
      return 1;
    },
    clearTimeoutFn: (timeoutId) => {
      assert.equal(timeoutId, 1);
      pendingCallback = null;
      clearCalls += 1;
    },
    fire() {
      assert.ok(pendingCallback, "실행할 iframe 제한 시간 콜백이 필요합니다.");
      pendingCallback();
    },
    get scheduledDelay() {
      return scheduledDelay;
    },
    get clearCalls() {
      return clearCalls;
    },
  };
}

function createIframeHarness({
  onAppend = () => {},
  contentDocument = null,
  contentWindow = null,
  contentDocumentError = null,
} = {}) {
  const listeners = new Map();
  let removedCount = 0;
  const iframe = {
    style: {},
    contentWindow,
    setAttribute() {},
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    removeEventListener(name, callback) {
      if (listeners.get(name) === callback) listeners.delete(name);
    },
    remove() {
      removedCount += 1;
    },
  };
  if (contentDocumentError) {
    Object.defineProperty(iframe, "contentDocument", {
      get() {
        throw contentDocumentError;
      },
    });
  } else {
    iframe.contentDocument = contentDocument;
  }

  const dispatch = (eventName) => listeners.get(eventName)?.();
  const documentRef = {
    createElement(name) {
      assert.equal(name, "iframe");
      return iframe;
    },
  };
  const iframeHost = {
    append(value) {
      assert.equal(value, iframe);
      onAppend(dispatch);
    },
  };

  return {
    environment: { documentRef, iframeHost },
    listeners,
    get removedCount() {
      return removedCount;
    },
  };
}

test("주입 평가 어댑터의 결과를 JavaScript runner 호환 report shape로 요약한다", async () => {
  const inputs = [];
  let tick = 0;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": async (input) => {
        inputs.push(input);
        return input.assertion.kind === "selector-exists" ? true : 2;
      },
    },
    now: () => tick++,
  });
  const request = createHtmlRequest();
  const original = structuredClone(request);

  const report = await runner.run(request);

  assert.deepEqual(request, original);
  assert.equal(inputs.length, 2);
  assert.equal(inputs[0].source, request.source);
  assert.equal(inputs[0].fixtureHtml, null);
  assert.equal(report.requestId, request.requestId);
  assert.equal(report.contractVersion, 1);
  assert.equal(report.questId, request.questId);
  assert.equal(report.questRevision, 1);
  assert.equal(report.languageId, "html");
  assert.equal(report.suite, "public");
  assert.equal(report.outcome, "wrong_answer");
  assert.deepEqual(report.limitsApplied, DEFAULT_WEB_CODE_QUEST_LIMITS);
  assert.equal(report.error, null);
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.passed, 1);
  assert.equal(report.summary.wrong_answer, 1);
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["passed", "wrong_answer"],
  );
  assert.deepEqual(report.tests[0].console, []);
  assert.equal(report.tests[1].expected, 1);
  assert.equal(report.tests[1].actual, 2);
  assert.equal(report.tests[1].hasActual, true);
  assert.equal(report.tests[1].error, null);
});

test("CSS 요청은 css-style-v1 어댑터에 고정 fixture를 전달한다", async () => {
  let observed;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "css-style-v1": async (input) => {
        observed = input;
        return "border-box";
      },
    },
  });
  const request = createCssRequest();

  const report = await runner.run(request);

  assert.equal(observed.fixtureHtml, request.fixtureHtml);
  assert.equal(observed.source, request.source);
  assert.deepEqual(observed.assertion, request.tests[0].assertion);
  assert.equal(report.outcome, "passed");
  assert.equal(report.tests[0].actual, "border-box");
});

test("위험 소스와 크기 제한 초과는 평가 어댑터 호출 전에 거부한다", async () => {
  let calls = 0;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
    },
  });

  await assert.rejects(
    runner.run(createHtmlRequest({ source: '<main onclick="alert(1)">소개</main>' })),
    /이벤트 핸들러/,
  );
  await assert.rejects(
    runner.run(createHtmlRequest({ source: `<main>${"a".repeat(21 * 1024)}</main>` })),
    /20480바이트/,
  );
  assert.equal(calls, 0);
});

test("실행 전 AbortSignal 취소는 첫 테스트를 cancelled, 나머지를 not_run으로 남긴다", async () => {
  let calls = 0;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
    },
  });
  const controller = new AbortController();
  controller.abort();

  const report = await runner.run(createHtmlRequest(), { signal: controller.signal });

  assert.equal(calls, 0);
  assert.equal(report.outcome, "cancelled");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["cancelled", "not_run"],
  );
  assert.equal(report.tests[0].error.type, "cancelled");
  assert.equal(report.summary.cancelled, 1);
  assert.equal(report.summary.not_run, 1);
});

test("평가 중 취소를 전달하고 이후 공개 테스트를 실행하지 않는다", async () => {
  let calls = 0;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": ({ signal }) => {
        calls += 1;
        return new Promise((resolve, reject) => {
          const handleAbort = () => {
            const error = new Error("cancelled");
            error.name = "AbortError";
            reject(error);
          };
          signal.addEventListener("abort", handleAbort, { once: true });
        });
      },
    },
  });
  const controller = new AbortController();

  const reportPromise = runner.run(createHtmlRequest(), { signal: controller.signal });
  controller.abort();
  const report = await reportPromise;

  assert.equal(calls, 1);
  assert.equal(report.outcome, "cancelled");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["cancelled", "not_run"],
  );
});

test("같은 runner의 동시 실행은 진행 중 요청을 건드리지 않고 engine_error로 보고한다", async () => {
  const gate = deferred();
  let calls = 0;
  const runner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": async ({ assertion }) => {
        calls += 1;
        if (calls === 1) await gate.promise;
        return assertion.kind === "selector-exists" ? true : 1;
      },
    },
  });
  const firstRun = runner.run(createHtmlRequest());

  const concurrent = await runner.run(
    createHtmlRequest({ requestId: "web-request-two" }),
  );
  assert.equal(concurrent.outcome, "engine_error");
  assert.equal(concurrent.error.type, "concurrent_run");
  assert.deepEqual(
    concurrent.tests.map((result) => result.outcome),
    ["not_run", "not_run"],
  );

  gate.resolve();
  const completed = await firstRun;
  assert.equal(completed.outcome, "passed");
  assert.equal(calls, 2);
});

test("SyntaxError와 일반 평가 오류를 구분하고 남은 테스트를 중단한다", async () => {
  const syntaxRunner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        throw new SyntaxError("잘못된 선택자");
      },
    },
  });
  const syntaxReport = await syntaxRunner.run(createHtmlRequest());
  assert.equal(syntaxReport.outcome, "syntax_error");
  assert.equal(syntaxReport.tests[0].error.type, "syntax_error");
  assert.equal(syntaxReport.tests[1].outcome, "not_run");

  const failureRunner = new BrowserWebCodeQuestRunner({
    evaluationAdapters: {
      "css-style-v1": async () => {
        throw new Error("평가기 내부 실패");
      },
    },
  });
  const failureReport = await failureRunner.run(createCssRequest());
  assert.equal(failureReport.outcome, "engine_error");
  assert.equal(failureReport.tests[0].error.type, "evaluation_error");
  assert.equal(failureReport.tests[0].error.message, "평가기 내부 실패");
});

test("HTML 기본 어댑터는 main DOM이 아닌 inert template content만 조회한다", async () => {
  const heading = {
    textContent: "  초보자   소개  ",
    getAttribute: (name) => (name === "data-level" ? "beginner" : null),
  };
  const root = {
    querySelector: (selector) => (selector === "h1" ? heading : null),
    querySelectorAll: (selector) => (selector === "h1" ? [heading] : []),
  };
  const template = { content: root, innerHTML: "" };
  let createCalls = 0;
  const documentRef = {
    createElement: (name) => {
      assert.equal(name, "template");
      createCalls += 1;
      return template;
    },
    body: {
      append() {
        assert.fail("HTML learner source를 main DOM에 삽입하면 안 됩니다.");
      },
    },
  };
  const common = { source: "<h1>초보자 소개</h1>" };

  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...common, assertion: { kind: "selector-exists", selector: "h1" } },
      { documentRef },
    ),
    true,
  );
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        ...common,
        assertion: { kind: "selector-count", selector: "h1", expected: 1 },
      },
      { documentRef },
    ),
    1,
  );
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        ...common,
        assertion: {
          kind: "attribute-equals",
          selector: "h1",
          attribute: "data-level",
          expected: "beginner",
        },
      },
      { documentRef },
    ),
    "beginner",
  );
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        ...common,
        assertion: { kind: "text-includes", selector: "h1", expected: "초보자 소개" },
      },
      { documentRef },
    ),
    true,
  );
  assert.equal(template.innerHTML, common.source);
  assert.equal(createCalls, 4);
});

test("HTML 선언형 어댑터는 공백 속성과 카드별 직접 제목·숨김 텍스트를 구분한다", async () => {
  const attributeNode = (attributes = {}) => ({
    getAttribute: (name) => attributes[name] ?? null,
    hasAttribute: (name) => Object.hasOwn(attributes, name),
  });
  const container = attributeNode();
  const cards = Array.from({ length: 3 }, () => ({
    ...attributeNode(),
    parentElement: container,
  }));
  const hiddenName = {
    ...attributeNode({ hidden: "" }),
    nodeType: 1,
    childNodes: ["HTML"],
  };
  const headings = [
    { ...attributeNode(), parentElement: cards[0], childNodes: ["HTML"] },
    { ...attributeNode(), parentElement: cards[1], childNodes: ["CSS"] },
    { ...attributeNode(), parentElement: cards[2], childNodes: ["JavaScript"] },
  ];
  const progress = [
    attributeNode({ "aria-label": "HTML 학습 진도" }),
    attributeNode({ "aria-label": " \n\t " }),
    attributeNode({ "aria-label": "JavaScript 학습 진도" }),
  ];
  const root = {
    querySelector: (selector) =>
      selector === ".learning-board" ? container : null,
    querySelectorAll: (selector) => {
      if (selector === "article.learning-card") return cards;
      if (selector === "h2") return headings;
      if (selector === "progress") return progress;
      return [];
    },
  };
  const documentRef = {
    createElement: () => ({ content: root, innerHTML: "" }),
  };

  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        source: "<main></main>",
        assertion: {
          kind: "nonblank-attribute-count",
          selector: "progress",
          attribute: "aria-label",
          expected: 3,
        },
      },
      { documentRef },
    ),
    2,
  );
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        source: "<main></main>",
        assertion: {
          kind: "direct-child-text-equals",
          selector: ".learning-board",
          childSelector: "article.learning-card",
          childIndex: 1,
          textSelector: "h2",
          expected: "CSS",
        },
      },
      { documentRef },
    ),
    true,
  );

  headings[0].childNodes = [hiddenName, "마크업"];
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        source: "<main></main>",
        assertion: {
          kind: "direct-child-text-equals",
          selector: ".learning-board",
          childSelector: "article.learning-card",
          childIndex: 0,
          textSelector: "h2",
          expected: "HTML",
        },
      },
      { documentRef },
    ),
    false,
  );
});

test("doctype-present는 공개·시스템 식별자 없는 HTML doctype만 승인한다", async () => {
  const calls = [];
  let doctype = { name: "html", publicId: "", systemId: "" };
  const domParserFactory = () => ({
    parseFromString(source, mimeType) {
      calls.push({ source, mimeType });
      return { doctype };
    },
  });
  const input = {
    source: "<!doctype html><html><body></body></html>",
    assertion: { kind: "doctype-present" },
  };

  assert.equal(
    await evaluateHtmlDomAssertion(input, {
      domParserFactory,
      documentRef: null,
    }),
    true,
  );
  const leadingNewlineSource =
    "\n\r\t <!DOCTYPE html>\n<html><body></body></html>";
  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...input, source: leadingNewlineSource },
      { domParserFactory, documentRef: null },
    ),
    true,
  );
  const multilineDoctypeSource =
    "<!DOCTYPE\nhtml\r\n>\n<html><body></body></html>";
  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...input, source: multilineDoctypeSource },
      { domParserFactory, documentRef: null },
    ),
    true,
  );
  doctype = { name: "svg", publicId: "", systemId: "" };
  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...input, source: "<!doctype svg><svg></svg>" },
      { domParserFactory, documentRef: null },
    ),
    false,
  );
  doctype = { name: "html", publicId: "", systemId: "" };
  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...input, source: "<!doctype html foo><html></html>" },
      { domParserFactory, documentRef: null },
    ),
    false,
  );
  doctype = {
    name: "html",
    publicId: "-//W3C//DTD HTML 4.01//EN",
    systemId: "http://www.w3.org/TR/html4/strict.dtd",
  };
  assert.equal(
    await evaluateHtmlDomAssertion(
      {
        ...input,
        source:
          '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html></html>',
      },
      { domParserFactory, documentRef: null },
    ),
    false,
  );
  doctype = null;
  assert.equal(
    await evaluateHtmlDomAssertion(
      { ...input, source: "<html><body></body></html>" },
      { domParserFactory, documentRef: null },
    ),
    false,
  );
  assert.deepEqual(calls, [
    { source: "<!doctype html><html><body></body></html>", mimeType: "text/html" },
    { source: leadingNewlineSource, mimeType: "text/html" },
    { source: multilineDoctypeSource, mimeType: "text/html" },
    { source: "<!doctype svg><svg></svg>", mimeType: "text/html" },
    { source: "<!doctype html foo><html></html>", mimeType: "text/html" },
    {
      source:
        '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html></html>',
      mimeType: "text/html",
    },
    { source: "<html><body></body></html>", mimeType: "text/html" },
  ]);
});

test("CSS rule-declaration은 허용된 선언만 constructed stylesheet에서 읽는다", async () => {
  let replacedSource;
  const styleSheetFactory = () => ({
    replaceSync(source) {
      replacedSource = source;
    },
    cssRules: [
      {
        selectorText: ".card, .panel",
        style: {
          getPropertyValue: (property) =>
            property === "box-sizing" ? " border-box " : "",
        },
      },
    ],
  });
  const source = ".card, .panel { box-sizing: border-box; }";

  const actual = await evaluateCssStyleAssertion(
    {
      source,
      fixtureHtml: '<article class="card"></article>',
      assertion: {
        kind: "rule-declaration",
        selector: ".card",
        property: "box-sizing",
        expected: "border-box",
      },
    },
    { styleSheetFactory },
  );

  assert.equal(replacedSource, source);
  assert.equal(actual, "border-box");
});

test("CSS 선언 기대값도 같은 CSSOM으로 직렬화해 동등한 색 표현을 승인한다", async () => {
  const replacedSources = [];
  let normalizedInput = null;
  let factoryCalls = 0;
  const styleSheetFactory = () => {
    factoryCalls += 1;
    if (factoryCalls === 1) {
      return {
        replaceSync: (source) => replacedSources.push(source),
        cssRules: [
          {
            selectorText: ".notice",
            style: {
              getPropertyValue: (property) =>
                property === "color" ? "rgb(30, 41, 59)" : "",
            },
          },
        ],
      };
    }
    const expectedStyle = {
      setProperty(property, value) {
        normalizedInput = { property, value };
      },
      getPropertyValue: () => "rgb(30, 41, 59)",
    };
    return {
      replaceSync: (source) => replacedSources.push(source),
      cssRules: [{ selectorText: ":root", style: expectedStyle }],
    };
  };

  const actual = await evaluateCssStyleAssertion(
    {
      source: ".notice { color: #1e293b; }",
      fixtureHtml: '<aside class="notice"></aside>',
      assertion: {
        kind: "rule-declaration",
        selector: ".notice",
        property: "color",
        expected: "#1e293b",
      },
    },
    { styleSheetFactory },
  );

  assert.equal(actual, "#1e293b");
  assert.deepEqual(normalizedInput, { property: "color", value: "#1e293b" });
  assert.deepEqual(replacedSources, [
    ".notice { color: #1e293b; }",
    ":root {}",
  ]);
});

test("rule-declaration은 같은 선택자의 최종 선언과 important 우선순위를 따른다", async () => {
  const createFactory = (values) => {
    let sourceSheetCreated = false;
    return () => {
      if (!sourceSheetCreated) {
        sourceSheetCreated = true;
        return {
          replaceSync() {},
          cssRules: values.map(({ value, priority = "" }) => ({
            selectorText: ".card",
            style: {
              getPropertyValue: (property) =>
                property === "display" ? value : "",
              getPropertyPriority: (property) =>
                property === "display" ? priority : "",
            },
          })),
        };
      }
      let normalizedExpected = "";
      return {
        replaceSync() {},
        cssRules: [
          {
            selectorText: ":root",
            style: {
              setProperty: (_property, value) => {
                normalizedExpected = value;
              },
              getPropertyValue: () => normalizedExpected,
            },
          },
        ],
      };
    };
  };
  const input = {
    source: ".card {} .card { display: block; } .card { display: grid; }",
    fixtureHtml: '<article class="card"></article>',
    assertion: {
      kind: "rule-declaration",
      selector: ".card",
      property: "display",
      expected: "grid",
    },
  };

  assert.equal(
    await evaluateCssStyleAssertion(input, {
      styleSheetFactory: createFactory([
        { value: "" },
        { value: "block" },
        { value: "grid" },
        { value: "block" },
      ]),
    }),
    "block",
    "같은 선택자의 뒤 선언이 앞의 정답 선언을 무효화합니다.",
  );
  assert.equal(
    await evaluateCssStyleAssertion(input, {
      styleSheetFactory: createFactory([
        { value: "grid", priority: "important" },
        { value: "block" },
      ]),
    }),
    "grid",
    "important 선언은 뒤의 일반 선언보다 우선합니다.",
  );
});

test("media-rule-declaration은 정규화된 @media 조건 내부 선언만 확인한다", async () => {
  let replacedSource;
  const mediaRule = {
    type: 4,
    cssText: "@media ( min-width : 48rem ) { .card { display: grid; } }",
    conditionText: "( min-width : 48rem )",
    cssRules: [
      {
        selectorText: ".card",
        style: {
          getPropertyValue: () => "",
        },
      },
      {
        selectorText: ".card",
        style: {
          getPropertyValue: (property) => (property === "display" ? " grid " : ""),
        },
      },
    ],
  };
  const styleSheetFactory = () => ({
    replaceSync(source) {
      replacedSource = source;
    },
    cssRules: [mediaRule],
  });
  const source = "@media (min-width: 48rem) { .card { display: grid; } }";
  const baseInput = {
    source,
    fixtureHtml: '<article class="card"></article>',
    assertion: {
      kind: "media-rule-declaration",
      condition: "(min-width: 48rem)",
      selector: ".card",
      property: "display",
      expected: "grid",
    },
  };

  assert.equal(
    await evaluateCssStyleAssertion(baseInput, { styleSheetFactory }),
    "grid",
  );
  assert.equal(replacedSource, source);
  assert.equal(
    await evaluateCssStyleAssertion(
      {
        ...baseInput,
        assertion: { ...baseInput.assertion, condition: "(min-width: 64rem)" },
      },
      { styleSheetFactory },
    ),
    null,
  );
});

test("media-rule-declaration은 다른 조건부 그룹 안에 중첩된 @media를 승인하지 않는다", async () => {
  const nestedMediaRule = {
    type: 4,
    cssText: "@media (min-width: 48rem) { .card { display: grid; } }",
    conditionText: "(min-width: 48rem)",
    cssRules: [
      {
        selectorText: ".card",
        style: {
          getPropertyValue: (property) =>
            property === "display" ? "grid" : "",
        },
      },
    ],
  };
  const styleSheetFactory = () => ({
    replaceSync() {},
    cssRules: [
      {
        type: 12,
        cssText:
          "@supports (display: definitely-not-a-real-value) { @media (min-width: 48rem) { .card { display: grid; } } }",
        cssRules: [nestedMediaRule],
      },
    ],
  });

  const actual = await evaluateCssStyleAssertion(
    {
      source:
        "@supports (display: definitely-not-a-real-value) { @media (min-width: 48rem) { .card { display: grid; } } }",
      fixtureHtml: '<article class="card"></article>',
      assertion: {
        kind: "media-rule-declaration",
        condition: "(min-width: 48rem)",
        selector: ".card",
        property: "display",
        expected: "grid",
      },
    },
    { styleSheetFactory },
  );

  assert.equal(actual, null);
});

test("일반 rule-declaration은 조건부 그룹 내부 규칙을 평탄화해 합격시키지 않는다", async () => {
  const styleSheetFactory = () => ({
    replaceSync() {},
    cssRules: [
      {
        type: 4,
        cssText: "@media (min-width: 48rem) { .card { display: grid; } }",
        conditionText: "(min-width: 48rem)",
        cssRules: [
          {
            selectorText: ".card",
            style: { getPropertyValue: () => "grid" },
          },
        ],
      },
      {
        type: 12,
        cssText: "@supports (display: grid) { .card { display: grid; } }",
        cssRules: [
          {
            selectorText: ".card",
            style: { getPropertyValue: () => "grid" },
          },
        ],
      },
    ],
  });

  const actual = await evaluateCssStyleAssertion(
    {
      source: "@media (min-width: 48rem) { .card { display: grid; } }",
      fixtureHtml: '<article class="card"></article>',
      assertion: {
        kind: "rule-declaration",
        selector: ".card",
        property: "display",
        expected: "grid",
      },
    },
    { styleSheetFactory },
  );

  assert.equal(actual, null);
});

test("CSS computed-style은 스크립트 없는 일회성 iframe에 fixed fixture와 스타일을 분리한다", async () => {
  const listeners = new Map();
  const attributes = new Map();
  let appendedToParent = null;
  let appendedFixture = null;
  let appendedStyle = null;
  let removed = false;
  let inlineValue = "";
  let inlinePriority = "";
  const target = {
    id: "card",
    style: {
      getPropertyValue: () => inlineValue,
      getPropertyPriority: () => inlinePriority,
      setProperty: (_property, value, priority) => {
        if (value === "not-a-valid-color") return;
        inlineValue = value;
        inlinePriority = priority;
      },
      removeProperty: () => {
        inlineValue = "";
        inlinePriority = "";
      },
    },
  };
  const fixtureTemplate = { innerHTML: "", content: { kind: "fixture-fragment" } };
  const learnerStyle = { textContent: "" };
  const frameDocument = {
    head: { append: (value) => (appendedStyle = value) },
    body: { append: (value) => (appendedFixture = value) },
    createElement: (name) => {
      if (name === "template") return fixtureTemplate;
      if (name === "style") return learnerStyle;
      throw new Error(`unexpected frame element: ${name}`);
    },
    querySelector: (selector) => (selector === ".card" ? target : null),
  };
  const iframe = {
    style: {},
    contentDocument: frameDocument,
    contentWindow: {
      getComputedStyle: (element) => {
        assert.equal(element, target);
        return {
          getPropertyValue: (property) =>
            property === "color" ? " rgb(30, 41, 59) " : "",
        };
      },
    },
    setAttribute: (name, value) => attributes.set(name, value),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    remove: () => {
      removed = true;
    },
  };
  const documentRef = {
    createElement: (name) => {
      assert.equal(name, "iframe");
      return iframe;
    },
  };
  const iframeHost = {
    append: (value) => {
      appendedToParent = value;
      listeners.get("load")?.();
    },
  };
  const source = ".card { color: #1e293b; }";
  const fixtureHtml = '<article class="card">카드</article>';

  const actual = await evaluateCssStyleAssertion(
    {
      source,
      fixtureHtml,
      assertion: {
        kind: "computed-style",
        selector: ".card",
        property: "color",
        expected: "#1e293b",
      },
    },
    { documentRef, iframeHost },
  );

  assert.equal(actual, "#1e293b");
  assert.equal(appendedToParent, iframe);
  assert.equal(attributes.get("sandbox"), "allow-same-origin");
  assert.ok(!attributes.get("sandbox").includes("allow-scripts"));
  assert.equal(attributes.get("aria-hidden"), "true");
  assert.equal(iframe.tabIndex, -1);
  assert.match(iframe.srcdoc, /Content-Security-Policy/);
  assert.doesNotMatch(iframe.srcdoc, /#1e293b/);
  assert.equal(fixtureTemplate.innerHTML, fixtureHtml);
  assert.equal(appendedFixture, fixtureTemplate.content);
  assert.equal(learnerStyle.textContent, source);
  assert.equal(appendedStyle, learnerStyle);
  assert.equal(inlineValue, "");
  assert.equal(inlinePriority, "");
  assert.equal(removed, true);

  const invalidExpectedActual = await evaluateCssStyleAssertion(
    {
      source,
      fixtureHtml,
      assertion: {
        kind: "computed-style",
        selector: ".card",
        property: "color",
        expected: "not-a-valid-color",
      },
    },
    { documentRef, iframeHost },
  );

  assert.equal(
    invalidExpectedActual,
    "rgb(30, 41, 59)",
    "브라우저가 거부한 기대값을 현재 계산값과 같다고 오판하면 안 됩니다.",
  );
  assert.equal(inlineValue, "");
  assert.equal(inlinePriority, "");
});

test("computed-focus-style은 focus-visible 상태의 최종 cascade와 important override를 읽는다", async () => {
  const listeners = new Map();
  let activeElement = null;
  let computedOutline = "rgb(37, 99, 235) solid 3px";
  let inlineValue = "";
  let removedCount = 0;
  let probeRemovedCount = 0;
  const target = {
    style: {
      getPropertyValue: () => inlineValue,
      getPropertyPriority: () => (inlineValue ? "important" : ""),
      removeProperty: () => {
        inlineValue = "";
      },
      setProperty: (_property, value) => {
        inlineValue = value;
      },
    },
    focus: () => {
      activeElement = target;
    },
    matches: (selector) => selector === ":focus-visible",
  };
  const body = {
    append(value) {
      if (typeof value?.focus === "function") value.focus();
    },
  };
  const frameDocument = {
    head: { append() {} },
    body,
    get activeElement() {
      return activeElement;
    },
    createElement(name) {
      if (name === "template") return { innerHTML: "", content: {} };
      if (name === "style") return { textContent: "" };
      if (name === "input") {
        const probe = {
          style: {},
          setAttribute() {},
          focus: () => {
            activeElement = probe;
          },
          remove: () => {
            probeRemovedCount += 1;
          },
        };
        return probe;
      }
      throw new Error(`unexpected frame element: ${name}`);
    },
    querySelector: (selector) => (selector === ".learning-card-link" ? target : null),
  };
  const iframe = {
    style: {},
    contentDocument: frameDocument,
    contentWindow: {
      getComputedStyle: () => ({
        getPropertyValue: () =>
          inlineValue ? "rgb(37, 99, 235) solid 3px" : computedOutline,
      }),
    },
    setAttribute() {},
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    remove: () => {
      removedCount += 1;
    },
  };
  const environment = {
    documentRef: { createElement: () => iframe },
    iframeHost: { append: () => listeners.get("load")?.() },
  };
  const input = {
    source: [
      ".learning-card-link:focus-visible { outline: 3px solid #2563eb; }",
      "main .learning-card-link:focus-visible { outline: none !important; }",
    ].join("\n"),
    fixtureHtml: '<main><a class="learning-card-link" href="#plan">계획</a></main>',
    assertion: {
      kind: "computed-focus-style",
      selector: ".learning-card-link",
      property: "outline",
      expected: "3px solid #2563eb",
    },
  };

  computedOutline = "none";
  assert.equal(await evaluateCssStyleAssertion(input, environment), "none");
  computedOutline = "rgb(37, 99, 235) solid 3px";
  assert.equal(await evaluateCssStyleAssertion(input, environment), "3px solid #2563eb");
  assert.equal(activeElement, target);
  assert.equal(probeRemovedCount, 2);
  assert.equal(removedCount, 2);
  assert.equal(inlineValue, "");
});

test("CSS Grid 열 개수는 지정 viewport의 최종 computed track list를 행동 기준으로 센다", async () => {
  const listeners = new Map();
  let computedColumns = "[start] 240px minmax(0px, 1fr) [end]";
  let removedCount = 0;
  let appendedSource = null;
  const target = {};
  const frameDocument = {
    head: {
      append: (style) => {
        appendedSource = style.textContent;
      },
    },
    body: { append() {} },
    createElement: (name) => {
      if (name === "template") return { innerHTML: "", content: {} };
      if (name === "style") return { textContent: "" };
      throw new Error(`unexpected frame element: ${name}`);
    },
    querySelector: (selector) => (selector === ".learning-board" ? target : null),
  };
  const iframe = {
    style: {},
    contentDocument: frameDocument,
    contentWindow: {
      getComputedStyle: (element) => {
        assert.equal(element, target);
        return {
          getPropertyValue: (property) => {
            if (property === "display") return "grid";
            if (property === "grid-template-columns") return computedColumns;
            throw new Error(`unexpected computed property: ${property}`);
          },
        };
      },
    },
    setAttribute() {},
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    remove: () => {
      removedCount += 1;
    },
  };
  const environment = {
    documentRef: {
      createElement: (name) => {
        assert.equal(name, "iframe");
        return iframe;
      },
    },
    iframeHost: {
      append: () => listeners.get("load")?.(),
    },
  };
  const source = [
    ".learning-board { display: grid; grid-template-columns: repeat(4, 1fr); }",
    ".learning-board { grid-template-columns: 1fr 1fr; }",
  ].join("\n");
  const input = {
    source,
    fixtureHtml: '<main class="learning-board"></main>',
    assertion: {
      kind: "computed-grid-column-count",
      selector: ".learning-board",
      viewportWidth: 640,
      expected: 2,
    },
  };

  assert.equal(await evaluateCssStyleAssertion(input, environment), 2);
  assert.match(iframe.style.cssText, /width:640px/);
  assert.equal(appendedSource, source);

  computedColumns = "repeat(3, minmax(0px, 1fr))";
  input.assertion.viewportWidth = 1024;
  input.assertion.expected = 3;
  assert.equal(await evaluateCssStyleAssertion(input, environment), 3);
  assert.match(iframe.style.cssText, /width:1024px/);
  assert.equal(removedCount, 2);

  iframe.contentWindow.getComputedStyle = () => ({
    getPropertyValue: (property) =>
      property === "display" ? "block" : "240px 240px",
  });
  assert.equal(await evaluateCssStyleAssertion(input, environment), 0);
  assert.equal(removedCount, 3);
});

test("CSS iframe error는 리소스를 정리하고 engine_error로 보고한다", async () => {
  const timer = createFakeTimer();
  const harness = createIframeHarness({
    onAppend: (dispatch) => dispatch("error"),
  });
  const runner = new BrowserWebCodeQuestRunner({
    environment: {
      ...harness.environment,
      iframeLoadTimeoutMs: 25,
      setTimeoutFn: timer.setTimeoutFn,
      clearTimeoutFn: timer.clearTimeoutFn,
    },
  });

  const report = await runner.run(createComputedStyleRequest());

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.equal(report.tests[0].error.type, "evaluation_error");
  assert.match(report.tests[0].error.message, /불러오지 못했습니다/);
  assert.equal(harness.removedCount, 1);
  assert.equal(harness.listeners.size, 0);
  assert.equal(timer.clearCalls, 1);
});

test("CSS iframe 대기 중 abort는 리소스를 정리하고 cancelled로 보고한다", async () => {
  const controller = new AbortController();
  const timer = createFakeTimer();
  const harness = createIframeHarness({
    onAppend: () => controller.abort(),
  });
  const runner = new BrowserWebCodeQuestRunner({
    environment: {
      ...harness.environment,
      iframeLoadTimeoutMs: 25,
      setTimeoutFn: timer.setTimeoutFn,
      clearTimeoutFn: timer.clearTimeoutFn,
    },
  });

  const report = await runner.run(createComputedStyleRequest(), {
    signal: controller.signal,
  });

  assert.equal(report.outcome, "cancelled");
  assert.equal(report.tests[0].outcome, "cancelled");
  assert.equal(harness.removedCount, 1);
  assert.equal(harness.listeners.size, 0);
  assert.equal(timer.clearCalls, 1);
});

test("CSS iframe contentDocument 접근 실패는 정리 후 engine_error로 보고한다", async () => {
  const timer = createFakeTimer();
  const harness = createIframeHarness({
    onAppend: (dispatch) => dispatch("load"),
    contentDocumentError: new Error("sandbox 문서 접근 거부"),
  });
  const runner = new BrowserWebCodeQuestRunner({
    environment: {
      ...harness.environment,
      iframeLoadTimeoutMs: 25,
      setTimeoutFn: timer.setTimeoutFn,
      clearTimeoutFn: timer.clearTimeoutFn,
    },
  });

  const report = await runner.run(createComputedStyleRequest());

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.match(report.tests[0].error.message, /문서 접근 거부/);
  assert.equal(harness.removedCount, 1);
  assert.equal(harness.listeners.size, 0);
  assert.equal(timer.clearCalls, 1);
});

test("CSS iframe load 무응답은 제한 시간 뒤 정리하고 engine_error로 보고한다", async () => {
  const timer = createFakeTimer();
  const harness = createIframeHarness();
  const runner = new BrowserWebCodeQuestRunner({
    environment: {
      ...harness.environment,
      iframeLoadTimeoutMs: 25,
      setTimeoutFn: timer.setTimeoutFn,
      clearTimeoutFn: timer.clearTimeoutFn,
    },
  });

  const reportPromise = runner.run(createComputedStyleRequest());
  assert.equal(timer.scheduledDelay, 25);
  timer.fire();
  const report = await reportPromise;

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.match(report.tests[0].error.message, /25ms를 초과/);
  assert.equal(harness.removedCount, 1);
  assert.equal(harness.listeners.size, 0);
  assert.equal(timer.clearCalls, 1);
});
