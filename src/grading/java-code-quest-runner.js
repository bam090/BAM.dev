import {
  areJsonValuesEqual,
  formatJsonValue,
  summarizeTestResults,
} from "./code-grading.js";
import { createJavaExecutionRequestSnapshot } from "./java-grading.js";

const OUTCOMES = new Set([
  "passed",
  "wrong_answer",
  "syntax_error",
  "runtime_error",
  "timeout",
  "output_limit",
  "cancelled",
  "engine_error",
  "not_run",
]);
const MAX_RESPONSE_BYTES = 256 * 1024;

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
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

function createError(type, message, learnerMessage = message) {
  return { type, message, learnerMessage };
}

function createBaseTestResult(test) {
  return {
    testId: test.id,
    label: test.label ?? null,
    outcome: "not_run",
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

function createTransportReport(request, outcome, error) {
  const tests = request.tests.map(createBaseTestResult);
  if (tests.length > 0 && outcome === "cancelled") {
    tests[0] = {
      ...tests[0],
      outcome: "cancelled",
      error,
    };
  }
  const summary = summarizeTestResults(tests);
  return {
    requestId: request.requestId,
    contractVersion: request.contractVersion,
    questId: request.questId,
    questRevision: request.questRevision,
    languageId: request.languageId,
    suite: request.suite,
    outcome,
    tests,
    summary,
    durationMs: 0,
    limitsApplied: {},
    error,
  };
}

function isErrorDto(value) {
  return (
    value === null ||
    (isPlainRecord(value) &&
      typeof value.type === "string" &&
      typeof value.message === "string" &&
      typeof value.learnerMessage === "string")
  );
}

function normalizeConsole(value) {
  if (!Array.isArray(value) || value.length > 100) return null;
  const entries = [];
  for (const entry of value) {
    if (
      !isPlainRecord(entry) ||
      !["log", "info", "warn", "error"].includes(entry.method) ||
      typeof entry.preview !== "string"
    ) {
      return null;
    }
    entries.push({ method: entry.method, preview: entry.preview });
  }
  return entries;
}

function normalizeTestResult(result, expectedTest) {
  if (
    !isPlainRecord(result) ||
    result.testId !== expectedTest.id ||
    !OUTCOMES.has(result.outcome) ||
    typeof result.hasActual !== "boolean" ||
    !Number.isFinite(result.durationMs) ||
    result.durationMs < 0 ||
    !isErrorDto(result.error) ||
    !areJsonValuesEqual(result.expected, expectedTest.expected) ||
    typeof result.expectedDisplay !== "string" ||
    (result.actualDisplay !== null && typeof result.actualDisplay !== "string")
  ) {
    return null;
  }
  const consoleEntries = normalizeConsole(result.console);
  if (consoleEntries === null) return null;
  if (result.hasActual && !["passed", "wrong_answer"].includes(result.outcome)) return null;
  if (!result.hasActual && result.actual !== null) return null;

  return {
    testId: result.testId,
    label: typeof result.label === "string" ? result.label : null,
    outcome: result.outcome,
    expected: result.expected,
    expectedDisplay: result.expectedDisplay,
    actual: result.actual,
    actualDisplay: result.actualDisplay,
    hasActual: result.hasActual,
    durationMs: result.durationMs,
    console: consoleEntries,
    error: result.error,
  };
}

function normalizeServerReport(report, request) {
  if (
    !isPlainRecord(report) ||
    report.requestId !== request.requestId ||
    report.contractVersion !== request.contractVersion ||
    report.questId !== request.questId ||
    report.questRevision !== request.questRevision ||
    report.languageId !== "java" ||
    report.suite !== "public" ||
    !OUTCOMES.has(report.outcome) ||
    !Array.isArray(report.tests) ||
    report.tests.length !== request.tests.length ||
    !Number.isFinite(report.durationMs) ||
    report.durationMs < 0 ||
    !isPlainRecord(report.limitsApplied) ||
    !isErrorDto(report.error)
  ) {
    return null;
  }

  const tests = [];
  for (const [index, result] of report.tests.entries()) {
    const normalized = normalizeTestResult(result, request.tests[index]);
    if (!normalized) return null;
    tests.push(normalized);
  }
  const calculatedSummary = summarizeTestResults(tests);
  if (
    !isPlainRecord(report.summary) ||
    Object.entries(calculatedSummary).some(([key, value]) => report.summary[key] !== value) ||
    report.outcome !== calculatedSummary.outcome && report.outcome !== "engine_error"
  ) {
    return null;
  }

  return {
    requestId: report.requestId,
    contractVersion: report.contractVersion,
    questId: report.questId,
    questRevision: report.questRevision,
    languageId: report.languageId,
    suite: report.suite,
    outcome: report.outcome,
    tests,
    summary: calculatedSummary,
    durationMs: report.durationMs,
    limitsApplied: { ...report.limitsApplied },
    error: report.error,
  };
}

/**
 * Same-origin browser adapter for the replaceable local Java grading port.
 * The local development server performs compilation and sandboxed execution.
 */
export class BrowserJavaCodeQuestRunner {
  constructor({
    endpoint = "/api/java/execute",
    fetchImplementation = globalThis.fetch,
  } = {}) {
    if (
      typeof endpoint !== "string" ||
      !/^\/(?!\/)/u.test(endpoint) ||
      endpoint.includes("\\")
    ) {
      throw new TypeError("Java 실행 endpoint는 same-origin 절대 경로여야 합니다.");
    }
    if (typeof fetchImplementation !== "function") {
      throw new TypeError("Java 실행 요청에 사용할 fetch 구현이 필요합니다.");
    }
    this.endpoint = endpoint;
    this.fetchImplementation = fetchImplementation;
  }

  async run(request, { signal } = {}) {
    const executionRequest = createJavaExecutionRequestSnapshot(request);
    if (signal !== undefined && !isAbortSignal(signal)) {
      throw new TypeError("signal은 AbortSignal이어야 합니다.");
    }
    if (signal?.aborted) {
      return createTransportReport(
        executionRequest,
        "cancelled",
        createError("cancelled", "사용자가 Java 코드 실행을 취소했습니다."),
      );
    }

    try {
      const response = await Reflect.apply(this.fetchImplementation, globalThis, [
        this.endpoint,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(executionRequest),
          cache: "no-store",
          credentials: "same-origin",
          redirect: "error",
          signal,
        },
      ]);
      if (!response?.ok || typeof response.text !== "function") {
        return createTransportReport(
          executionRequest,
          "engine_error",
          createError(
            "java_api_error",
            `Java 실행 API가 요청을 처리하지 못했습니다. (${response?.status ?? "unknown"})`,
            "로컬 Java 실행 서버가 준비되었는지 확인해 주세요.",
          ),
        );
      }
      const responseText = await response.text();
      if (new TextEncoder().encode(responseText).byteLength > MAX_RESPONSE_BYTES) {
        throw new Error("Java 실행 API 응답이 허용 크기를 넘었습니다.");
      }
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        throw new Error("Java 실행 API가 올바른 JSON을 반환하지 않았습니다.");
      }
      const normalized = normalizeServerReport(parsed, executionRequest);
      if (!normalized) {
        throw new Error("Java 실행 API 결과가 요청 DTO와 일치하지 않습니다.");
      }
      return normalized;
    } catch (error) {
      if (signal?.aborted) {
        return createTransportReport(
          executionRequest,
          "cancelled",
          createError("cancelled", "사용자가 Java 코드 실행을 취소했습니다."),
        );
      }
      const message = error instanceof Error ? error.message : "Java 실행 API 호출에 실패했습니다.";
      return createTransportReport(
        executionRequest,
        "engine_error",
        createError(
          "java_transport_error",
          message,
          "로컬 Java 실행 서버와 통신하지 못했습니다. 개발 서버 상태를 확인해 주세요.",
        ),
      );
    }
  }
}
