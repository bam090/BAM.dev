import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { __test as javaSupervisorTest } from "../desktop/runtime/supervisor.mjs";
import { BamLearningApp } from "../src/app.js";
import { canRunCodingTest } from "../src/core/coding-test.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";
import {
  JavaCodingTestRunnerAdapter,
  createJavaCodingTestRunnerRequest,
  normalizeJavaCodingTestCapability,
  validateJavaCodingTestRunnerReport,
} from "../src/grading/java-coding-test-runner-adapter.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";

const javaCollection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);
const javascriptCollection = JSON.parse(
  await readFile(new URL("../content/coding-tests/javascript.json", import.meta.url), "utf8"),
);
const problem = javaCollection.problems[0];
const REPORT_OUTCOMES = [
  "passed",
  "wrong_answer",
  "syntax_error",
  "runtime_error",
  "timeout",
  "output_limit",
  "cancelled",
  "engine_error",
  "not_run",
];

function input(mode = "run", overrides = {}) {
  return {
    collection: javaCollection,
    problem,
    source: problem.starterCode,
    requestId: `java-ct-${mode}`,
    mode,
    ...overrides,
  };
}

function invocations(outcome = "passed", overrides = {}) {
  return {
    discovered: 5,
    started: 5,
    finished: 5,
    passed: outcome === "passed" ? 5 : 4,
    wrongAnswer: outcome === "wrong_answer" ? 1 : 0,
    runtimeError: outcome === "runtime_error" ? 1 : 0,
    skipped: 0,
    aborted: 0,
    infrastructure: 0,
    ...overrides,
  };
}

function summary(tests) {
  const counts = Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, 0]));
  for (const result of tests) counts[result.outcome] += 1;
  const priority = [
    "cancelled",
    "engine_error",
    "timeout",
    "output_limit",
    "syntax_error",
    "runtime_error",
    "wrong_answer",
    "not_run",
  ];
  return {
    outcome: priority.find((outcome) => counts[outcome] > 0) ?? "passed",
    total: tests.length,
    ...counts,
  };
}

function reportFor(execution, outcomes = []) {
  const tests = execution.expectedTests.map((expected, index) => {
    const outcome = outcomes[index] ?? "passed";
    return {
      testId: expected.id,
      label: expected.label,
      outcome,
      invocations: invocations(outcome),
    };
  });
  return {
    requestId: execution.bridgeRequest.requestId,
    contractVersion: 1,
    problemId: execution.bridgeRequest.problemId,
    problemRevision: execution.bridgeRequest.revision,
    evaluationKind: "java-junit-method-v1",
    mode: execution.bridgeRequest.mode,
    languageId: "java",
    suite: "public",
    outcome: summary(tests).outcome,
    tests,
    summary: summary(tests),
    durationMs: 12.3,
    limitsApplied: { testTimeoutMs: 3000 },
    error: null,
  };
}

function availableCapability() {
  return {
    contractVersion: 1,
    evaluationKind: "java-junit-method-v1",
    available: true,
  };
}

test("Java CT 요청은 native bridge에 exact 5 fields만 보내고 run/submit 그룹을 고정한다", () => {
  const quick = createJavaCodingTestRunnerRequest(input("run"));
  const submission = createJavaCodingTestRunnerRequest(input("submit"));

  assert.deepEqual(quick.bridgeRequest, {
    problemId: problem.id,
    revision: problem.revision,
    source: problem.starterCode,
    requestId: "java-ct-run",
    mode: "run",
  });
  assert.deepEqual(quick.expectedTests.map(({ id }) => id), [problem.publicTests[0].id]);
  assert.deepEqual(
    submission.expectedTests.map(({ id }) => id),
    problem.publicTests.map(({ id }) => id),
  );
  assert.equal(Object.isFrozen(quick.bridgeRequest), true);
  assert.throws(() => createJavaCodingTestRunnerRequest(input("hidden")), /run.*submit/u);
  assert.throws(
    () => createJavaCodingTestRunnerRequest(input("run", {
      problem: { ...problem, revision: problem.revision + 1 },
    })),
    /현재 컬렉션/u,
  );
});

test("native bridge가 없거나 capability가 오류·malformed이면 브라우저에서 fail closed한다", async () => {
  assert.deepEqual(await new JavaCodingTestRunnerAdapter().capabilities(), {
    contractVersion: 1,
    evaluationKind: "java-junit-method-v1",
    available: false,
    reason: "Java 코딩테스트 실행기를 사용할 수 없습니다.",
  });
  assert.equal(Object.isFrozen(normalizeJavaCodingTestCapability(null)), true);
  assert.equal(normalizeJavaCodingTestCapability({
    ...availableCapability(),
    evaluationKind: "java-static-method-v1",
  }).available, false);

  let runCalls = 0;
  const unavailable = new JavaCodingTestRunnerAdapter({
    async capabilities() { throw new Error("native bridge failed"); },
    async run() { runCalls += 1; },
    async cancel() {},
  });
  const capability = await unavailable.capabilities();
  assert.equal(capability.available, false);
  await assert.rejects(() => unavailable.run(input()), /준비 상태/u);
  assert.equal(runCalls, 0);

  assert.equal(canRunCodingTest(javaCollection, problem, false), false);
  assert.equal(canRunCodingTest(javaCollection, problem, true), true);
  assert.equal(
    canRunCodingTest(javascriptCollection, javascriptCollection.problems[0], false),
    true,
  );
});

test("adapter는 capability를 재확인하고 report identity·그룹 순서·invocation 집계를 보존한다", async () => {
  let capabilityCalls = 0;
  const bridgeCalls = [];
  const execution = createJavaCodingTestRunnerRequest(input("submit"));
  const expectedReport = reportFor(execution, ["passed", "wrong_answer"]);
  const adapter = new JavaCodingTestRunnerAdapter({
    async capabilities() {
      capabilityCalls += 1;
      return availableCapability();
    },
    async run(request) {
      bridgeCalls.push(request);
      return expectedReport;
    },
    async cancel() {},
  });

  const received = await adapter.run(input("submit"));
  assert.equal(received, expectedReport);
  assert.equal(capabilityCalls, 1);
  assert.deepEqual(bridgeCalls, [execution.bridgeRequest]);
  assert.deepEqual(
    received.tests.map(({ testId, outcome, invocations: counts }) => ({
      testId,
      outcome,
      finished: counts.finished,
    })),
    [
      { testId: problem.publicTests[0].id, outcome: "passed", finished: 5 },
      { testId: problem.publicTests[1].id, outcome: "wrong_answer", finished: 5 },
    ],
  );
});

test("0·skip·abort invocation, 누락·중복·순서 변경과 잘못된 summary를 거부한다", () => {
  const execution = createJavaCodingTestRunnerRequest(input("submit"));
  const valid = reportFor(execution);
  const invalidReports = [];

  for (const changedInvocations of [
    invocations("passed", { discovered: 0, started: 0, finished: 0, passed: 0 }),
    invocations("passed", { passed: 4, skipped: 1 }),
    invocations("passed", { passed: 4, aborted: 1 }),
  ]) {
    const candidate = structuredClone(valid);
    candidate.tests[0].invocations = changedInvocations;
    invalidReports.push(candidate);
  }
  invalidReports.push({ ...valid, tests: valid.tests.slice(0, 1) });
  invalidReports.push({ ...valid, tests: [...valid.tests].reverse() });
  invalidReports.push({
    ...valid,
    tests: [valid.tests[0], { ...valid.tests[1], testId: valid.tests[0].testId }],
  });
  invalidReports.push({
    ...valid,
    summary: { ...valid.summary, passed: valid.summary.passed - 1 },
  });

  for (const candidate of invalidReports) {
    assert.throws(
      () => validateJavaCodingTestRunnerReport(candidate, execution),
      /누락|순서|완전히 실행|요약/u,
    );
  }
});

test("runtime 로딩 실패의 빈 engine_error만 안전한 미완료로 허용한다", () => {
  const execution = createJavaCodingTestRunnerRequest(input("submit"));
  const fallback = {
    requestId: execution.bridgeRequest.requestId,
    contractVersion: 1,
    problemId: execution.bridgeRequest.problemId,
    problemRevision: execution.bridgeRequest.revision,
    evaluationKind: "java-junit-method-v1",
    mode: execution.bridgeRequest.mode,
    languageId: "java",
    suite: "public",
    outcome: "engine_error",
    tests: [],
    summary: {
      outcome: "not_run",
      total: 0,
      ...Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, 0])),
    },
    durationMs: 0,
    limitsApplied: null,
    error: {
      type: "java_runtime_unavailable",
      message: "Java 실행기를 준비하지 못했습니다.",
      learnerMessage: "Java 실행기를 준비하지 못했습니다. 앱을 다시 시작해 주세요.",
    },
  };

  assert.equal(validateJavaCodingTestRunnerReport(fallback, execution), fallback);
  assert.throws(
    () => validateJavaCodingTestRunnerReport({ ...fallback, outcome: "passed" }, execution),
    /누락/u,
  );
  assert.throws(
    () => validateJavaCodingTestRunnerReport({ ...fallback, error: null }, execution),
    /누락/u,
  );
});

test("memory_limit runtime_error의 원인을 보존하고 submit은 기록하되 완료로 표시하지 않는다", async (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { requestAnimationFrame() {} },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelector() { return null; } },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const repository = new LocalStorageProgressRepository(
    new MemoryStorage(),
    () => new Date("2026-09-22T01:00:00.000Z"),
  );
  const bridge = {
    async capabilities() { return availableCapability(); },
    async run(bridgeRequest) {
      const execution = createJavaCodingTestRunnerRequest(input(bridgeRequest.mode, {
        requestId: bridgeRequest.requestId,
        source: bridgeRequest.source,
      }));
      const [failedTest, ...remainingTests] = execution.expectedTests;
      const memoryLimitResult = javaSupervisorTest.codingTestResult(
        {
          id: failedTest.id,
          label: failedTest.label,
          expected: failedTest.assertionSource,
        },
        { terminationReason: "memory_limit", durationMs: 7 },
      );
      const tests = [
        memoryLimitResult,
        ...remainingTests.map((testCase) => ({
          testId: testCase.id,
          label: testCase.label,
          outcome: "not_run",
        })),
      ];
      const nativeReport = {
        ...reportFor(execution),
        outcome: "runtime_error",
        tests,
        summary: summary(tests),
      };

      assert.equal(Object.hasOwn(memoryLimitResult, "invocations"), false);
      assert.throws(
        () => validateJavaCodingTestRunnerReport({
          ...nativeReport,
          tests: [{ ...memoryLimitResult, error: null }, ...tests.slice(1)],
        }, execution),
        /진단/u,
      );
      return nativeReport;
    },
    async cancel() {},
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "coding-test",
    codingTestCollection: javaCollection,
    codingTestState: {
      collection: javaCollection,
      problem,
      source: problem.starterCode,
      isRunning: false,
      cancelRequested: false,
      executionMode: null,
      draftStatus: "saved",
      uiError: null,
      report: null,
      reportPersistenceStatus: null,
    },
    javaCodingTestCapability: availableCapability(),
    javaCodingTestRunner: new JavaCodingTestRunnerAdapter(bridge),
    codingTestRunner: { async run() { throw new Error("Java가 browser runner로 갔습니다."); } },
    progressRepository: repository,
    executionCoordinator: new ExecutionCoordinator(),
    codingTestRequestSequence: 0,
    flushPendingCodingTestDraftSave() {},
    renderCodingTest() {},
    focusCodingTestResults() {},
  });

  await app.executeCurrentCodingTest("submit");

  assert.equal(app.codingTestState.report.outcome, "runtime_error");
  assert.deepEqual(app.codingTestState.report.tests[0].error, {
    type: "runtime_error",
    message: "Java 실행이 256 MiB 메모리 제한을 넘었습니다.",
    learnerMessage: "Java 실행이 256 MiB 메모리 제한을 넘었습니다.",
  });
  const progress = repository.getProgress();
  assert.deepEqual(progress.codingTestSubmissions.map((submission) => ({
    outcome: submission.outcome,
    passed: submission.passed,
    total: submission.total,
  })), [{ outcome: "runtime_error", passed: 0, total: problem.publicTests.length }]);
  assert.deepEqual(progress.completedCodingTestProblems, []);
});

test("AbortSignal은 같은 requestId의 native cancel을 한 번만 보낸다", async () => {
  const execution = createJavaCodingTestRunnerRequest(input("run", { requestId: "ct-cancel" }));
  const expectedReport = reportFor(execution);
  const cancelCalls = [];
  let finishRun;
  let runStarted;
  const runPromise = new Promise((resolve) => { finishRun = resolve; });
  const startedPromise = new Promise((resolve) => { runStarted = resolve; });
  const adapter = new JavaCodingTestRunnerAdapter({
    async capabilities() { return availableCapability(); },
    run() { runStarted(); return runPromise; },
    async cancel(request) { cancelCalls.push(request); },
  });
  const controller = new AbortController();
  const running = adapter.run(input("run", { requestId: "ct-cancel" }), {
    signal: controller.signal,
  });
  await startedPromise;
  controller.abort();
  controller.abort();
  finishRun(expectedReport);

  assert.equal(await running, expectedReport);
  assert.deepEqual(cancelCalls, [{ requestId: "ct-cancel" }]);
});

test("capability 조회 중 취소하면 Java CT 실행은 시작되지 않는다", async () => {
  let finishCapability;
  const capabilityPending = new Promise((resolve) => { finishCapability = resolve; });
  let runCalls = 0;
  let cancelCalls = 0;
  const adapter = new JavaCodingTestRunnerAdapter({
    capabilities() { return capabilityPending; },
    run() { runCalls += 1; },
    cancel() { cancelCalls += 1; },
  });
  const controller = new AbortController();
  const pending = adapter.run(input(), { signal: controller.signal });
  controller.abort();
  finishCapability(availableCapability());
  await assert.rejects(pending, /취소한 실행 결과/u);
  assert.equal(runCalls, 0);
  assert.equal(cancelCalls, 0);
});

test("Java CT run은 제출·완료를 만들지 않고 전체 submit만 CT 진도를 기록하며 Quest 진도는 보존한다", async (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { requestAnimationFrame() {} },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelector() { return null; } },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const repository = new LocalStorageProgressRepository(
    new MemoryStorage(),
    () => new Date("2026-09-22T00:00:00.000Z"),
  );
  repository.recordQuestAttempt({
    questId: "quest-java-total-price",
    questRevision: 1,
    languageId: "java",
    outcome: "passed",
    passed: 1,
    total: 1,
  });
  const questSnapshot = structuredClone(repository.getProgress().completedQuestRevisions);
  const bridge = {
    async capabilities() { return availableCapability(); },
    async run(bridgeRequest) {
      const execution = createJavaCodingTestRunnerRequest(input(bridgeRequest.mode, {
        requestId: bridgeRequest.requestId,
        source: bridgeRequest.source,
      }));
      return reportFor(execution);
    },
    async cancel() {},
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "coding-test",
    codingTestCollection: javaCollection,
    codingTestState: {
      collection: javaCollection,
      problem,
      source: problem.starterCode,
      isRunning: false,
      cancelRequested: false,
      executionMode: null,
      draftStatus: "saved",
      uiError: null,
      report: null,
      reportPersistenceStatus: null,
    },
    javaCodingTestCapability: availableCapability(),
    javaCodingTestRunner: new JavaCodingTestRunnerAdapter(bridge),
    codingTestRunner: { async run() { throw new Error("Java가 browser runner로 갔습니다."); } },
    progressRepository: repository,
    executionCoordinator: new ExecutionCoordinator(),
    codingTestRequestSequence: 0,
    flushPendingCodingTestDraftSave() {},
    renderCodingTest() {},
    focusCodingTestResults() {},
  });

  await app.executeCurrentCodingTest("run");
  assert.equal(repository.getProgress().codingTestSubmissions.length, 0);
  assert.deepEqual(repository.getProgress().completedQuestRevisions, questSnapshot);

  await app.executeCurrentCodingTest("submit");
  const progress = repository.getProgress();
  assert.equal(progress.codingTestSubmissions.length, 1);
  assert.deepEqual(progress.completedCodingTestProblems, [{
    problemId: problem.id,
    problemRevision: problem.revision,
    completedAt: "2026-09-22T00:00:00.000Z",
  }]);
  assert.deepEqual(progress.completedQuestRevisions, questSnapshot);
  assert.deepEqual(progress.completedQuestIds, ["quest-java-total-price"]);
});

test("Java CT 결과 뒤 fingerprint 대기 중 취소해도 제출·결과를 저장하지 않는다", async (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  let finishDigest;
  Object.defineProperty(globalThis, "window", {
    configurable: true, value: { requestAnimationFrame() {} },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true, value: { querySelector() { return null; } },
  });
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { subtle: { digest: () => new Promise((resolve) => { finishDigest = resolve; }) } },
  });
  t.after(() => {
    for (const [name, previous] of [
      ["window", previousWindow], ["document", previousDocument], ["crypto", previousCrypto],
    ]) {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else delete globalThis[name];
    }
  });

  let submissions = 0;
  let results = 0;
  let reportReturned;
  const reportReady = new Promise((resolve) => { reportReturned = resolve; });
  const app = Object.create(BamLearningApp.prototype);
  const state = {
    collection: javaCollection, problem, source: problem.starterCode,
    isRunning: false, cancelRequested: false, report: null,
  };
  Object.assign(app, {
    currentView: "coding-test", codingTestCollection: javaCollection,
    codingTestState: state, javaCodingTestCapability: availableCapability(),
    javaCodingTestRunner: {
      async capabilities() { return availableCapability(); },
      async run() {
        reportReturned();
        return reportFor(createJavaCodingTestRunnerRequest(input("submit")));
      },
    },
    progressRepository: {
      recordCodingTestSubmission() { submissions += 1; },
      saveCodingTestResult() { results += 1; },
      getPersistenceStatus() { return { isPersistent: true }; },
    },
    executionCoordinator: new ExecutionCoordinator(),
    codingTestRequestSequence: 0,
    flushPendingCodingTestDraftSave() {}, renderCodingTest() {}, focusCodingTestResults() {},
  });

  const running = app.executeCurrentCodingTest("submit");
  await reportReady;
  await Promise.resolve();
  app.cancelCodingTestRun({ disabled: false, textContent: "" });
  finishDigest(new Uint8Array(32));
  await running;
  assert.equal(submissions, 0);
  assert.equal(results, 0);
  assert.equal(state.report, null);
});
