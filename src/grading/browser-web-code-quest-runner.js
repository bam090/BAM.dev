import {
  assertValidWebCodeQuestExecutionRequest,
  WEB_CODE_QUEST_EVALUATION_KINDS,
  WEB_CODE_QUEST_MAX_TESTS,
  WEB_CODE_QUEST_SOURCE_MAX_BYTES,
} from "../core/web-code-quest.js";
import {
  areJsonValuesEqual,
  formatJsonValue,
  summarizeTestResults,
} from "./code-grading.js";

export const DEFAULT_WEB_CODE_QUEST_LIMITS = Object.freeze({
  maxSourceBytes: WEB_CODE_QUEST_SOURCE_MAX_BYTES,
  maxTests: WEB_CODE_QUEST_MAX_TESTS,
});

const EVALUATION_KINDS = new Set(Object.values(WEB_CODE_QUEST_EVALUATION_KINDS));
const DEFAULT_IFRAME_LOAD_TIMEOUT_MS = 3000;
const FIXED_IFRAME_DOCUMENT =
  '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"></head><body></body></html>';

function defaultNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function defaultSetTimeout(callback, delay) {
  return globalThis.setTimeout(callback, delay);
}

function defaultClearTimeout(timeoutId) {
  globalThis.clearTimeout(timeoutId);
}

function roundDuration(value) {
  return Math.max(0, Math.round(value * 10) / 10);
}

function isAbortSignal(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.aborted === "boolean" &&
    typeof value.addEventListener === "function" &&
    typeof value.removeEventListener === "function"
  );
}

function abortError() {
  const error = new Error("사용자가 Web Code Quest 실행을 취소했습니다.");
  error.name = "AbortError";
  return error;
}

function createError(type, message, learnerMessage = message) {
  return { type, message, learnerMessage };
}

function normalizeText(value) {
  return String(value ?? "").replaceAll(/\s+/g, " ").trim();
}

function createBaseTestResult(test) {
  return {
    testId: test.id,
    label: test.label ?? null,
    expected: test.expected,
    expectedDisplay: formatJsonValue(test.expected),
    actual: null,
    actualDisplay: null,
    hasActual: false,
    durationMs: 0,
    console: [],
    error: null,
  };
}

function createNotRunResult(test) {
  return { ...createBaseTestResult(test), outcome: "not_run" };
}

function createStoppedResult(test, outcome, error) {
  return { ...createBaseTestResult(test), outcome, error };
}

function snapshotExecutionRequest(request) {
  const snapshot = {
    requestId: request.requestId,
    contractVersion: request.contractVersion,
    questId: request.questId,
    questRevision: request.questRevision,
    languageId: request.languageId,
    evaluationKind: request.evaluationKind,
    suite: request.suite,
    source: request.source,
    fixtureHtml: request.fixtureHtml,
    tests: request.tests.map((test) => ({
      id: test.id,
      label: test.label,
      assertion: { ...test.assertion },
      expected: test.expected,
    })),
  };
  assertValidWebCodeQuestExecutionRequest(snapshot);
  snapshot.tests.forEach((test) => {
    Object.freeze(test.assertion);
    Object.freeze(test);
  });
  Object.freeze(snapshot.tests);
  return Object.freeze(snapshot);
}

function queryOne(root, selector) {
  if (!root || typeof root.querySelector !== "function") {
    throw new Error("HTML 평가 문서에서 querySelector를 사용할 수 없습니다.");
  }
  return root.querySelector(selector);
}

function queryAll(root, selector) {
  if (!root || typeof root.querySelectorAll !== "function") {
    throw new Error("HTML 평가 문서에서 querySelectorAll을 사용할 수 없습니다.");
  }
  return root.querySelectorAll(selector);
}

function hasExactHtml5Doctype(source, doctype) {
  return (
    doctype?.name?.toLowerCase() === "html" &&
    !doctype.publicId &&
    !doctype.systemId &&
    /^\uFEFF?[\t\n\f\r ]*<!doctype[\t\n\f\r ]+html[\t\n\f\r ]*>/iu.test(source)
  );
}

export async function evaluateHtmlDomAssertion(
  { source, assertion, signal },
  {
    documentRef = globalThis.document,
    domParserFactory = () => {
      if (typeof globalThis.DOMParser !== "function") {
        throw new Error("이 브라우저에서는 DOMParser를 사용할 수 없습니다.");
      }
      return new globalThis.DOMParser();
    },
  } = {},
) {
  if (signal?.aborted) throw abortError();
  let actual;

  if (assertion.kind === "doctype-present") {
    const parser = domParserFactory();
    if (!parser || typeof parser.parseFromString !== "function") {
      throw new Error("이 브라우저에서는 DOMParser를 사용할 수 없습니다.");
    }
    const parsedDocument = parser.parseFromString(source, "text/html");
    const doctype = parsedDocument?.doctype;
    actual = hasExactHtml5Doctype(source, doctype);
  } else {
    if (!documentRef || typeof documentRef.createElement !== "function") {
      throw new Error("이 브라우저에서는 HTML DOM 평가를 시작할 수 없습니다.");
    }
    const template = documentRef.createElement("template");
    if (!template || !("content" in template)) {
      throw new Error("이 브라우저에서는 inert template 평가를 사용할 수 없습니다.");
    }
    template.innerHTML = source;
    const root = template.content;

    if (assertion.kind === "selector-exists") {
      actual = queryOne(root, assertion.selector) !== null;
    } else if (assertion.kind === "selector-count") {
      actual = queryAll(root, assertion.selector).length;
    } else if (assertion.kind === "attribute-equals") {
      const element = queryOne(root, assertion.selector);
      actual = element?.getAttribute?.(assertion.attribute) ?? null;
    } else if (assertion.kind === "text-includes") {
      const element = queryOne(root, assertion.selector);
      actual = normalizeText(element?.textContent).includes(normalizeText(assertion.expected));
    } else {
      throw new Error(`지원하지 않는 HTML assertion입니다: ${assertion.kind}`);
    }
  }

  if (signal?.aborted) throw abortError();
  return actual;
}

function collectStyleRules(ruleList) {
  return Array.from(ruleList ?? []).filter(
    (rule) => typeof rule?.selectorText === "string" && rule.style,
  );
}

function selectorListIncludes(selectorText, selector) {
  return selectorText
    .split(",")
    .map((item) => item.trim())
    .includes(selector.trim());
}

function normalizeMediaCondition(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\(\s*/g, "(")
    .replaceAll(/\s*\)/g, ")")
    .replaceAll(/\s*:\s*/g, ":")
    .replaceAll(/\s*,\s*/g, ",");
}

function isMediaRule(rule) {
  return (
    rule?.type === 4 ||
    rule?.constructor?.name === "CSSMediaRule" ||
    /^@media\b/iu.test(rule?.cssText ?? "")
  );
}

function collectMediaRules(ruleList) {
  return Array.from(ruleList ?? []).filter(isMediaRule);
}

function findRuleDeclarations(ruleList, assertion) {
  const rules = collectStyleRules(ruleList);
  return rules
    .filter((candidate) =>
      selectorListIncludes(candidate.selectorText, assertion.selector),
    )
    .map(
      (rule) =>
        rule?.style?.getPropertyValue?.(assertion.property)?.trim() || null,
    )
    .filter((value) => value !== null);
}

function reconcileDeclarationValue(actual, assertion, styleSheetFactory) {
  if (actual === null || actual === assertion.expected) return actual;
  const expectedSheet = styleSheetFactory();
  if (!expectedSheet || typeof expectedSheet.replaceSync !== "function") return actual;
  expectedSheet.replaceSync(":root {}");
  const expectedRule = Array.from(expectedSheet.cssRules ?? []).find(
    (rule) => typeof rule?.selectorText === "string" && rule.style,
  );
  if (!expectedRule?.style || typeof expectedRule.style.setProperty !== "function") {
    return actual;
  }
  expectedRule.style.setProperty(assertion.property, assertion.expected);
  const normalizedExpected =
    expectedRule.style.getPropertyValue(assertion.property)?.trim() || null;
  return actual === normalizedExpected ? assertion.expected : actual;
}

function resolveDeclarationValue(ruleList, assertion, styleSheetFactory) {
  // This assertion proves that an authored declaration exists. It deliberately
  // does not approximate the full cascade; use computed-style for the winner.
  const values = findRuleDeclarations(ruleList, assertion).map((value) =>
    reconcileDeclarationValue(value, assertion, styleSheetFactory),
  );
  return values.find((value) => value === assertion.expected) ?? values.at(-1) ?? null;
}

function evaluateRuleDeclaration(source, assertion, styleSheetFactory) {
  const sheet = styleSheetFactory();
  if (!sheet || typeof sheet.replaceSync !== "function") {
    throw new Error("이 브라우저에서는 CSSStyleSheet.replaceSync를 사용할 수 없습니다.");
  }
  sheet.replaceSync(source);
  return resolveDeclarationValue(sheet.cssRules, assertion, styleSheetFactory);
}

function evaluateMediaRuleDeclaration(source, assertion, styleSheetFactory) {
  const sheet = styleSheetFactory();
  if (!sheet || typeof sheet.replaceSync !== "function") {
    throw new Error("이 브라우저에서는 CSSStyleSheet.replaceSync를 사용할 수 없습니다.");
  }
  sheet.replaceSync(source);
  const expectedCondition = normalizeMediaCondition(assertion.condition);
  const matchingMediaRules = collectMediaRules(sheet.cssRules).filter(
    (rule) => normalizeMediaCondition(rule.conditionText) === expectedCondition,
  );
  let fallback = null;
  for (const mediaRule of matchingMediaRules) {
    const actual = resolveDeclarationValue(
      mediaRule.cssRules,
      assertion,
      styleSheetFactory,
    );
    if (actual === assertion.expected) return actual;
    if (actual !== null) fallback = actual;
  }
  return fallback;
}

function waitForIframeLoad(
  iframe,
  host,
  signal,
  {
    timeoutMs,
    setTimeoutFn,
    clearTimeoutFn,
  },
) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("CSS 평가용 sandbox iframe 제한 시간은 양수여야 합니다.");
  }
  if (typeof setTimeoutFn !== "function" || typeof clearTimeoutFn !== "function") {
    throw new TypeError("CSS 평가용 sandbox iframe 타이머를 사용할 수 없습니다.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId = null;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== null) {
        clearTimeoutFn(timeoutId);
        timeoutId = null;
      }
      iframe.removeEventListener?.("load", handleLoad);
      iframe.removeEventListener?.("error", handleError);
      signal?.removeEventListener("abort", handleAbort);
      callback(value);
    };
    const handleLoad = () => finish(resolve);
    const handleError = () =>
      finish(reject, new Error("CSS 평가용 sandbox iframe을 불러오지 못했습니다."));
    const handleAbort = () => finish(reject, abortError());
    const handleTimeout = () =>
      finish(
        reject,
        new Error(
          `CSS 평가용 sandbox iframe 로드 시간이 ${timeoutMs}ms를 초과했습니다.`,
        ),
      );

    iframe.addEventListener?.("load", handleLoad, { once: true });
    iframe.addEventListener?.("error", handleError, { once: true });
    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted) {
      handleAbort();
      return;
    }
    timeoutId = setTimeoutFn(handleTimeout, timeoutMs);
    try {
      host.append(iframe);
    } catch (error) {
      finish(reject, error);
    }
  });
}

async function evaluateComputedStyle(
  source,
  fixtureHtml,
  assertion,
  signal,
  {
    documentRef,
    iframeHost,
    iframeLoadTimeoutMs,
    setTimeoutFn,
    clearTimeoutFn,
  },
) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("이 브라우저에서는 CSS computed-style 평가를 시작할 수 없습니다.");
  }
  const host = iframeHost ?? documentRef.body;
  if (!host || typeof host.append !== "function") {
    throw new Error("CSS 평가용 sandbox iframe을 연결할 호스트가 없습니다.");
  }

  const iframe = documentRef.createElement("iframe");
  try {
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.setAttribute("title", "BAM.dev CSS 공개 테스트 평가 영역");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.cssText =
      "position:fixed;left:-10000px;top:0;width:1024px;height:768px;pointer-events:none;opacity:0;";
    iframe.srcdoc = FIXED_IFRAME_DOCUMENT;

    await waitForIframeLoad(iframe, host, signal, {
      timeoutMs: iframeLoadTimeoutMs,
      setTimeoutFn,
      clearTimeoutFn,
    });
    if (signal?.aborted) throw abortError();
    const frameDocument = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!frameDocument?.head || !frameDocument?.body || !frameWindow) {
      throw new Error("CSS 평가용 sandbox 문서에 접근할 수 없습니다.");
    }

    const fixtureTemplate = frameDocument.createElement("template");
    fixtureTemplate.innerHTML = fixtureHtml;
    frameDocument.body.append(fixtureTemplate.content);

    const style = frameDocument.createElement("style");
    style.textContent = source;
    frameDocument.head.append(style);
    const target = frameDocument.querySelector(assertion.selector);
    if (!target) return null;
    const actual = frameWindow
      .getComputedStyle(target)
      .getPropertyValue(assertion.property)
      .trim();
    let reconciledActual = actual || null;
    if (
      reconciledActual !== null &&
      reconciledActual !== assertion.expected &&
      target.style &&
      typeof target.style.setProperty === "function"
    ) {
      const previousValue = target.style.getPropertyValue(assertion.property);
      const previousPriority = target.style.getPropertyPriority(assertion.property);
      try {
        target.style.removeProperty(assertion.property);
        target.style.setProperty(assertion.property, assertion.expected, "important");
        const acceptedExpected = target.style
          .getPropertyValue(assertion.property)
          .trim();
        if (acceptedExpected) {
          const normalizedExpected = frameWindow
            .getComputedStyle(target)
            .getPropertyValue(assertion.property)
            .trim();
          if (actual === normalizedExpected) reconciledActual = assertion.expected;
        }
      } finally {
        if (previousValue) {
          target.style.setProperty(assertion.property, previousValue, previousPriority);
        } else {
          target.style.removeProperty(assertion.property);
        }
      }
    }
    if (signal?.aborted) throw abortError();
    return reconciledActual;
  } finally {
    iframe.remove?.();
  }
}

export async function evaluateCssStyleAssertion(
  { source, fixtureHtml, assertion, signal },
  {
    documentRef = globalThis.document,
    iframeHost,
    iframeLoadTimeoutMs = DEFAULT_IFRAME_LOAD_TIMEOUT_MS,
    setTimeoutFn = defaultSetTimeout,
    clearTimeoutFn = defaultClearTimeout,
    styleSheetFactory = () => {
      if (typeof globalThis.CSSStyleSheet !== "function") {
        throw new Error("이 브라우저에서는 CSSStyleSheet를 사용할 수 없습니다.");
      }
      return new globalThis.CSSStyleSheet();
    },
  } = {},
) {
  if (signal?.aborted) throw abortError();
  if (assertion.kind === "rule-declaration") {
    return evaluateRuleDeclaration(source, assertion, styleSheetFactory);
  }
  if (assertion.kind === "media-rule-declaration") {
    return evaluateMediaRuleDeclaration(source, assertion, styleSheetFactory);
  }
  if (assertion.kind === "computed-style") {
    return evaluateComputedStyle(source, fixtureHtml, assertion, signal, {
      documentRef,
      iframeHost,
      iframeLoadTimeoutMs,
      setTimeoutFn,
      clearTimeoutFn,
    });
  }
  throw new Error(`지원하지 않는 CSS assertion입니다: ${assertion.kind}`);
}

export function createDefaultWebCodeQuestEvaluationAdapters(environment = {}) {
  return Object.freeze({
    [WEB_CODE_QUEST_EVALUATION_KINDS.HTML]: (input) =>
      evaluateHtmlDomAssertion(input, environment),
    [WEB_CODE_QUEST_EVALUATION_KINDS.CSS]: (input) =>
      evaluateCssStyleAssertion(input, environment),
  });
}

function mergeEvaluationAdapters(overrides, environment) {
  const defaults = createDefaultWebCodeQuestEvaluationAdapters(environment);
  if (overrides === undefined) return defaults;
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new TypeError("Web Code Quest 평가 어댑터는 객체여야 합니다.");
  }
  const unknown = Object.keys(overrides).filter((kind) => !EVALUATION_KINDS.has(kind));
  if (unknown.length > 0) {
    throw new TypeError(`지원하지 않는 평가 어댑터가 있습니다: ${unknown.join(", ")}`);
  }
  const adapters = { ...defaults, ...overrides };
  for (const kind of EVALUATION_KINDS) {
    if (typeof adapters[kind] !== "function") {
      throw new TypeError(`${kind} 평가 어댑터는 함수여야 합니다.`);
    }
  }
  return Object.freeze(adapters);
}

/**
 * Browser grader for direct HTML and CSS source.
 *
 * HTML is parsed in an inert template. CSS rule checks use a constructed
 * stylesheet, while computed-style checks use a one-shot sandbox iframe that
 * contains only BAM.dev's fixed fixture and the learner stylesheet.
 */
export class BrowserWebCodeQuestRunner {
  constructor({ evaluationAdapters, environment, now = defaultNow } = {}) {
    if (typeof now !== "function") throw new TypeError("now는 함수여야 합니다.");
    this.evaluationAdapters = mergeEvaluationAdapters(evaluationAdapters, environment);
    this.now = now;
    this.active = false;
  }

  async run(request, { signal } = {}) {
    const executionRequest = snapshotExecutionRequest(request);
    if (signal !== undefined && !isAbortSignal(signal)) {
      throw new TypeError("signal은 AbortSignal이어야 합니다.");
    }
    const startedAt = this.now();

    if (this.active) {
      return this.#createReport(
        executionRequest,
        executionRequest.tests.map(createNotRunResult),
        {
          outcome: "engine_error",
          error: createError(
            "concurrent_run",
            "이미 Web Code Quest 평가가 진행 중입니다.",
            "현재 실행이 끝난 뒤 다시 시도해 주세요.",
          ),
          durationMs: 0,
        },
      );
    }

    this.active = true;
    try {
      const testResults = [];
      let shouldStop = false;
      const adapter = this.evaluationAdapters[executionRequest.evaluationKind];

      for (const test of executionRequest.tests) {
        if (shouldStop) {
          testResults.push(createNotRunResult(test));
          continue;
        }
        if (signal?.aborted) {
          testResults.push(
            createStoppedResult(
              test,
              "cancelled",
              createError("cancelled", "사용자가 Web Code Quest 실행을 취소했습니다."),
            ),
          );
          shouldStop = true;
          continue;
        }

        const testStartedAt = this.now();
        try {
          const actual = await adapter({
            source: executionRequest.source,
            fixtureHtml: executionRequest.fixtureHtml,
            assertion: test.assertion,
            signal,
          });
          if (signal?.aborted) throw abortError();
          if (!areJsonValuesEqual(actual, actual)) {
            throw new Error("평가 어댑터가 JSON으로 표현할 수 없는 결과를 반환했습니다.");
          }
          const passed = areJsonValuesEqual(actual, test.expected);
          testResults.push({
            ...createBaseTestResult(test),
            outcome: passed ? "passed" : "wrong_answer",
            actual,
            actualDisplay: formatJsonValue(actual),
            hasActual: true,
            durationMs: roundDuration(this.now() - testStartedAt),
          });
        } catch (error) {
          if (signal?.aborted || error?.name === "AbortError") {
            testResults.push(
              createStoppedResult(
                test,
                "cancelled",
                createError("cancelled", "사용자가 Web Code Quest 실행을 취소했습니다."),
              ),
            );
          } else if (error?.name === "SyntaxError") {
            testResults.push(
              createStoppedResult(
                test,
                "syntax_error",
                createError(
                  "syntax_error",
                  error.message,
                  "작성한 소스의 괄호, 선택자와 선언 형식을 확인해 보세요.",
                ),
              ),
            );
          } else {
            testResults.push(
              createStoppedResult(
                test,
                "engine_error",
                createError(
                  "evaluation_error",
                  error instanceof Error ? error.message : "Web 평가기가 실패했습니다.",
                  "이 공개 테스트를 실행하지 못했습니다. 다시 시도해 주세요.",
                ),
              ),
            );
          }
          testResults[testResults.length - 1].durationMs = roundDuration(
            this.now() - testStartedAt,
          );
          shouldStop = true;
        }
      }

      return this.#createReport(executionRequest, testResults, {
        durationMs: roundDuration(this.now() - startedAt),
      });
    } finally {
      this.active = false;
    }
  }

  #createReport(request, tests, { outcome, error = null, durationMs }) {
    const summary = summarizeTestResults(tests);
    return {
      requestId: request.requestId,
      contractVersion: request.contractVersion,
      questId: request.questId,
      questRevision: request.questRevision,
      languageId: request.languageId,
      suite: request.suite,
      outcome: outcome ?? summary.outcome,
      tests,
      summary,
      durationMs,
      limitsApplied: { ...DEFAULT_WEB_CODE_QUEST_LIMITS },
      error,
    };
  }
}
