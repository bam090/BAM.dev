const JAVA_CODING_TEST_EVALUATION_KIND = "java-junit-method-v1";
const JAVA_CONTENT_EVALUATION_KIND = "java-static-method-v1";
const MODES = new Set(["run", "submit"]);
const CAPABILITY_FIELDS = new Set([
  "contractVersion",
  "evaluationKind",
  "available",
  "reason",
]);
const REPORT_OUTCOMES = Object.freeze([
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
const OUTCOME_PRIORITY = [
  "cancelled",
  "engine_error",
  "timeout",
  "output_limit",
  "syntax_error",
  "runtime_error",
  "wrong_answer",
  "not_run",
];
const INVOCATION_FIELDS = [
  "discovered",
  "started",
  "finished",
  "passed",
  "wrongAnswer",
  "runtimeError",
  "skipped",
  "aborted",
  "infrastructure",
];
const reportOutcomeSet = new Set(REPORT_OUTCOMES);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function unavailableCapability(reason = "Java 코딩테스트 실행기를 사용할 수 없습니다.") {
  return Object.freeze({
    contractVersion: 1,
    evaluationKind: JAVA_CODING_TEST_EVALUATION_KIND,
    available: false,
    reason,
  });
}

export function normalizeJavaCodingTestCapability(value) {
  if (!isPlainRecord(value)) return unavailableCapability();
  const keys = Object.keys(value);
  if (
    keys.some((key) => !CAPABILITY_FIELDS.has(key)) ||
    value.contractVersion !== 1 ||
    value.evaluationKind !== JAVA_CODING_TEST_EVALUATION_KIND ||
    typeof value.available !== "boolean" ||
    (value.reason !== undefined && typeof value.reason !== "string")
  ) {
    return unavailableCapability();
  }
  return Object.freeze({
    contractVersion: 1,
    evaluationKind: JAVA_CODING_TEST_EVALUATION_KIND,
    available: value.available,
    ...(value.reason ? { reason: value.reason } : {}),
  });
}

function getCanonicalJavaProblem(collection, problem) {
  if (
    !isPlainRecord(collection) ||
    collection.contractVersion !== 1 ||
    collection.languageId !== "java" ||
    collection.evaluationKind !== JAVA_CONTENT_EVALUATION_KIND ||
    !Array.isArray(collection.problems)
  ) {
    throw new TypeError("Java 코딩테스트 컬렉션이 필요합니다.");
  }
  if (!isPlainRecord(problem) || !isNonEmptyString(problem.id)) {
    throw new TypeError("실행할 Java 코딩테스트 문제가 필요합니다.");
  }
  const canonicalProblem = collection.problems.find((candidate) => candidate?.id === problem.id);
  if (!canonicalProblem || canonicalProblem.revision !== problem.revision) {
    throw new Error("Java 코딩테스트 문제가 현재 컬렉션에 속하지 않습니다.");
  }
  if (!Array.isArray(canonicalProblem.publicTests) || canonicalProblem.publicTests.length === 0) {
    throw new Error("Java 코딩테스트 공개 테스트 그룹을 찾을 수 없습니다.");
  }
  return canonicalProblem;
}

export function createJavaCodingTestRunnerRequest({
  collection,
  problem,
  source,
  requestId,
  mode,
}) {
  if (!MODES.has(mode)) {
    throw new TypeError('코딩테스트 실행 모드는 "run" 또는 "submit"이어야 합니다.');
  }
  if (!isNonEmptyString(requestId) || typeof source !== "string") {
    throw new TypeError("Java 코딩테스트 실행 요청 값이 올바르지 않습니다.");
  }
  const canonicalProblem = getCanonicalJavaProblem(collection, problem);
  const expectedTests = mode === "run"
    ? canonicalProblem.publicTests.slice(0, 1)
    : canonicalProblem.publicTests;
  return Object.freeze({
    problem: canonicalProblem,
    expectedTests,
    bridgeRequest: Object.freeze({
      problemId: canonicalProblem.id,
      revision: canonicalProblem.revision,
      source,
      requestId,
      mode,
    }),
  });
}

function validateInvocationShape(invocations) {
  if (!isPlainRecord(invocations) || Object.keys(invocations).length !== INVOCATION_FIELDS.length) {
    throw new Error("Java 코딩테스트 실행 횟수 결과가 올바르지 않습니다.");
  }
  for (const field of INVOCATION_FIELDS) {
    if (!Number.isSafeInteger(invocations[field]) || invocations[field] < 0) {
      throw new Error("Java 코딩테스트 실행 횟수 결과가 올바르지 않습니다.");
    }
  }
}

function validateInvocations(invocations, outcome) {
  validateInvocationShape(invocations);

  const complete =
    invocations.discovered > 0 &&
    invocations.discovered === invocations.started &&
    invocations.started === invocations.finished &&
    invocations.finished ===
      invocations.passed + invocations.wrongAnswer + invocations.runtimeError &&
    invocations.skipped === 0 &&
    invocations.aborted === 0 &&
    invocations.infrastructure === 0;
  const outcomeMatches =
    (outcome === "passed" &&
      invocations.passed === invocations.finished &&
      invocations.wrongAnswer === 0 &&
      invocations.runtimeError === 0) ||
    (outcome === "wrong_answer" &&
      invocations.wrongAnswer > 0 &&
      invocations.runtimeError === 0) ||
    (outcome === "runtime_error" && invocations.runtimeError > 0);
  if (!complete || !outcomeMatches) {
    throw new Error("Java 코딩테스트 공개 JUnit 그룹이 완전히 실행되지 않았습니다.");
  }
}

function validateJavaTestResults(tests, expectedTests) {
  if (!Array.isArray(tests) || tests.length !== expectedTests.length) {
    throw new Error("Java 코딩테스트 결과에 공개 테스트 그룹이 누락되었습니다.");
  }
  const counts = Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, 0]));
  for (let index = 0; index < expectedTests.length; index += 1) {
    const test = tests[index];
    const expected = expectedTests[index];
    if (
      !isPlainRecord(test) ||
      test.testId !== expected.id ||
      test.label !== expected.label ||
      !reportOutcomeSet.has(test.outcome)
    ) {
      throw new Error("Java 코딩테스트 결과가 공개 테스트 그룹 순서와 일치하지 않습니다.");
    }
    counts[test.outcome] += 1;
    if (["passed", "wrong_answer"].includes(test.outcome)) {
      validateInvocations(test.invocations, test.outcome);
    } else if (test.outcome === "runtime_error") {
      if (test.invocations !== undefined) {
        validateInvocations(test.invocations, test.outcome);
      } else if (
        !isPlainRecord(test.error) ||
        ![test.error.learnerMessage, test.error.message].some(isNonEmptyString)
      ) {
        throw new Error("Java 코딩테스트 실행 오류 진단이 누락되었습니다.");
      }
    } else if (test.invocations !== undefined) {
      validateInvocationShape(test.invocations);
    }
  }
  return counts;
}

function validateSummary(summary, tests, counts) {
  if (!isPlainRecord(summary) || summary.total !== tests.length) {
    throw new Error("Java 코딩테스트 결과 요약이 올바르지 않습니다.");
  }
  for (const outcome of REPORT_OUTCOMES) {
    if (!Number.isSafeInteger(summary[outcome]) || summary[outcome] !== counts[outcome]) {
      throw new Error("Java 코딩테스트 결과 요약이 올바르지 않습니다.");
    }
  }
  const expectedOutcome = OUTCOME_PRIORITY.find((outcome) => counts[outcome] > 0) ?? "passed";
  if (summary.outcome !== expectedOutcome) {
    throw new Error("Java 코딩테스트 결과 요약이 올바르지 않습니다.");
  }
  return expectedOutcome;
}

export function validateJavaCodingTestRunnerReport(report, execution) {
  const request = execution?.bridgeRequest;
  if (
    !isPlainRecord(report) ||
    !isPlainRecord(request) ||
    report.requestId !== request.requestId ||
    report.contractVersion !== 1 ||
    report.problemId !== request.problemId ||
    report.problemRevision !== request.revision ||
    report.evaluationKind !== JAVA_CODING_TEST_EVALUATION_KIND ||
    report.mode !== request.mode ||
    report.languageId !== "java" ||
    report.suite !== "public" ||
    !reportOutcomeSet.has(report.outcome) ||
    !Array.isArray(report.tests) ||
    !isPlainRecord(report.summary) ||
    typeof report.durationMs !== "number" ||
    !Number.isFinite(report.durationMs) ||
    report.durationMs < 0
  ) {
    throw new Error("Java 코딩테스트 실행기가 현재 요청과 일치하는 결과를 반환하지 않았습니다.");
  }

  if (report.tests.length === 0) {
    const hasZeroCounts = REPORT_OUTCOMES.every(
      (outcome) => report.summary[outcome] === 0,
    );
    if (
      report.outcome !== "engine_error" ||
      !isPlainRecord(report.error) ||
      report.summary.total !== 0 ||
      report.summary.outcome !== "not_run" ||
      !hasZeroCounts
    ) {
      throw new Error("Java 코딩테스트 실행 결과에 공개 테스트 그룹이 누락되었습니다.");
    }
    return report;
  }

  const counts = validateJavaTestResults(report.tests, execution.expectedTests);
  const summaryOutcome = validateSummary(report.summary, report.tests, counts);
  const expectedReportOutcome = report.error == null ? summaryOutcome : "engine_error";
  if (report.outcome !== expectedReportOutcome) {
    throw new Error("Java 코딩테스트 전체 결과가 공개 테스트 그룹 결과와 일치하지 않습니다.");
  }
  return report;
}

export class JavaCodingTestRunnerAdapter {
  constructor(bridge) {
    this.bridge = bridge;
  }

  async capabilities() {
    if (typeof this.bridge?.capabilities !== "function") return unavailableCapability();
    try {
      return normalizeJavaCodingTestCapability(await this.bridge.capabilities());
    } catch {
      return unavailableCapability("Java 코딩테스트 실행 준비 상태를 확인하지 못했습니다.");
    }
  }

  async run(input, { signal } = {}) {
    const execution = createJavaCodingTestRunnerRequest(input);
    if (typeof this.bridge?.run !== "function" || typeof this.bridge?.cancel !== "function") {
      throw new Error("이 환경에서는 Java 코딩테스트를 실행할 수 없습니다.");
    }
    const capability = await this.capabilities();
    if (!capability.available) {
      throw new Error(capability.reason ?? "Java 코딩테스트 실행기를 사용할 수 없습니다.");
    }
    if (signal?.aborted) {
      throw new Error("취소한 실행 결과는 채점이나 완료 기록에 반영하지 않았습니다.");
    }

    let cancelSent = false;
    const cancel = () => {
      if (cancelSent) return;
      cancelSent = true;
      Promise.resolve(this.bridge.cancel({ requestId: execution.bridgeRequest.requestId })).catch(
        () => {},
      );
    };
    const runPromise = Promise.resolve(this.bridge.run(execution.bridgeRequest));
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
    try {
      return validateJavaCodingTestRunnerReport(await runPromise, execution);
    } finally {
      signal?.removeEventListener("abort", cancel);
    }
  }
}
