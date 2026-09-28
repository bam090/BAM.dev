const JAVA_EVALUATION_KIND = "java-static-method-v1";
const JAVA_REQUEST_FIELDS = new Set([
  "requestId",
  "contractVersion",
  "questId",
  "questRevision",
  "languageId",
  "suite",
  "evaluationKind",
  "source",
]);
const CAPABILITY_FIELDS = new Set([
  "contractVersion",
  "evaluationKind",
  "available",
  "reason",
]);
const REPORT_OUTCOMES = new Set([
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
const REPORT_OUTCOME_PRIORITY = [
  "cancelled",
  "engine_error",
  "timeout",
  "output_limit",
  "syntax_error",
  "runtime_error",
  "wrong_answer",
  "not_run",
];
const OBSERVED_QUEST_IDS = new Set([
  "quest-java-bridge-arr-01",
  "quest-java-bridge-que-01",
]);
const RUNNABLE_QUEST_IDS = new Set([
  "quest-java-total-price",
  "quest-java-bridge-arr-01",
  "quest-java-bridge-arr-02",
  "quest-java-bridge-que-01",
]);
const OBSERVATION_NAMES = new Set(["argument0Unchanged", "returnNotArgument0"]);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function unavailableCapability(reason = "Java 실행기를 사용할 수 없습니다.") {
  return Object.freeze({
    contractVersion: 1,
    evaluationKind: JAVA_EVALUATION_KIND,
    available: false,
    reason,
  });
}

function normalizeCapability(value) {
  if (!isPlainRecord(value)) return unavailableCapability();
  const keys = Object.keys(value);
  if (
    keys.some((key) => !CAPABILITY_FIELDS.has(key)) ||
    value.contractVersion !== 1 ||
    value.evaluationKind !== JAVA_EVALUATION_KIND ||
    typeof value.available !== "boolean" ||
    (value.reason !== undefined && typeof value.reason !== "string")
  ) {
    return unavailableCapability();
  }
  return Object.freeze({
    contractVersion: 1,
    evaluationKind: JAVA_EVALUATION_KIND,
    available: value.available,
    ...(value.reason ? { reason: value.reason } : {}),
  });
}

function validateJavaRequest(request) {
  if (!isPlainRecord(request)) throw new TypeError("Java Code Quest 실행 요청이 필요합니다.");
  const keys = Object.keys(request);
  if (
    keys.length !== JAVA_REQUEST_FIELDS.size ||
    keys.some((key) => !JAVA_REQUEST_FIELDS.has(key))
  ) {
    throw new TypeError("Java Code Quest 실행 요청 필드가 올바르지 않습니다.");
  }
  if (
    typeof request.requestId !== "string" ||
    !request.requestId ||
    request.contractVersion !== 1 ||
    typeof request.questId !== "string" ||
    !request.questId ||
    !Number.isSafeInteger(request.questRevision) ||
    request.questRevision < 1 ||
    request.languageId !== "java" ||
    request.suite !== "public" ||
    request.evaluationKind !== JAVA_EVALUATION_KIND ||
    typeof request.source !== "string"
  ) {
    throw new TypeError("Java Code Quest 실행 요청 값이 올바르지 않습니다.");
  }
  if (!RUNNABLE_QUEST_IDS.has(request.questId)) {
    throw new Error("이 Java Code Quest는 현재 앱에서 실행할 수 없습니다.");
  }
}

function validateJavaReport(report, request) {
  if (
    !isPlainRecord(report) ||
    report.requestId !== request.requestId ||
    report.contractVersion !== 1 ||
    report.questId !== request.questId ||
    report.questRevision !== request.questRevision ||
    report.languageId !== "java" ||
    report.suite !== "public" ||
    !REPORT_OUTCOMES.has(report.outcome) ||
    !Array.isArray(report.tests) ||
    !isPlainRecord(report.summary)
  ) {
    throw new Error("Java 실행기가 현재 요청과 일치하는 결과를 반환하지 않았습니다.");
  }

  const counts = Object.fromEntries([...REPORT_OUTCOMES].map((outcome) => [outcome, 0]));
  const testIds = new Set();
  let observationFailures = 0;
  for (const test of report.tests) {
    if (
      !isPlainRecord(test)
      || typeof test.testId !== "string"
      || test.testId.length === 0
      || testIds.has(test.testId)
      || !REPORT_OUTCOMES.has(test.outcome)
    ) {
      throw new Error("Java 실행기가 현재 요청과 일치하는 결과를 반환하지 않았습니다.");
    }
    testIds.add(test.testId);
    counts[test.outcome] += 1;

    if (OBSERVED_QUEST_IDS.has(request.questId)) {
      const expected = test.expectedObservations;
      const actual = test.actualObservations;
      const failed = test.failedObservations;
      const returned = test.outcome === "passed" || test.outcome === "wrong_answer";
      if (
        !isPlainRecord(expected)
        || Object.keys(expected).length !== OBSERVATION_NAMES.size
        || expected.argument0Unchanged !== true
        || expected.returnNotArgument0 !== true
        || !Array.isArray(failed)
        || new Set(failed).size !== failed.length
        || failed.some((name) => !OBSERVATION_NAMES.has(name))
        || (actual !== null && (
          !isPlainRecord(actual)
          || Object.keys(actual).length !== OBSERVATION_NAMES.size
          || typeof actual.argument0Unchanged !== "boolean"
          || typeof actual.returnNotArgument0 !== "boolean"
        ))
        || (actual === null && failed.length !== 0)
        || returned !== (actual !== null)
        || (test.outcome === "passed" && failed.length !== 0)
        || (actual !== null && [...OBSERVATION_NAMES].some(
          (name) => failed.includes(name) === (actual[name] === true),
        ))
      ) {
        throw new Error("Java 실행기가 공개 배열 관찰 결과를 빠짐없이 반환하지 않았습니다.");
      }
      observationFailures += failed.length;
    } else if (
      Object.hasOwn(test, "expectedObservations")
      || Object.hasOwn(test, "actualObservations")
      || Object.hasOwn(test, "failedObservations")
    ) {
      throw new Error("Java 실행기가 관찰 대상이 아닌 Quest에 관찰 결과를 반환했습니다.");
    }
  }

  const summary = report.summary;
  const summaryOutcome = REPORT_OUTCOME_PRIORITY.find((outcome) => counts[outcome] > 0) ?? "passed";
  const summaryIsConsistent =
    summary.total === report.tests.length
    && summary.total > 0
    && summary.outcome === summaryOutcome
    && Number.isSafeInteger(summary.observationFailures)
    && summary.observationFailures === observationFailures
    && [...REPORT_OUTCOMES].every(
      (outcome) => Number.isSafeInteger(summary[outcome]) && summary[outcome] === counts[outcome],
    )
    && (report.error == null ? report.outcome === summaryOutcome : report.outcome === "engine_error");
  if (!summaryIsConsistent) {
    throw new Error("Java 실행기가 공개 테스트 요약 통계를 빠짐없이 반환하지 않았습니다.");
  }
  return report;
}

export class JavaCodeQuestRunnerAdapter {
  constructor(bridge) {
    this.bridge = bridge;
  }

  async capabilities() {
    if (typeof this.bridge?.capabilities !== "function") return unavailableCapability();
    try {
      return normalizeCapability(await this.bridge.capabilities());
    } catch {
      return unavailableCapability("Java 실행 준비 상태를 확인하지 못했습니다.");
    }
  }

  async run(request, { signal } = {}) {
    validateJavaRequest(request);
    if (typeof this.bridge?.run !== "function" || typeof this.bridge?.cancel !== "function") {
      throw new Error("이 환경에서는 Java Code Quest를 실행할 수 없습니다.");
    }

    const bridgeRequest = {
      requestId: request.requestId,
      questId: request.questId,
      revision: request.questRevision,
      source: request.source,
    };
    let cancelSent = false;
    const cancel = () => {
      if (cancelSent) return;
      cancelSent = true;
      Promise.resolve(this.bridge.cancel({ requestId: request.requestId })).catch(() => {});
    };

    const runPromise = Promise.resolve(this.bridge.run(bridgeRequest));
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
    try {
      return validateJavaReport(await runPromise, request);
    } finally {
      signal?.removeEventListener("abort", cancel);
    }
  }
}
