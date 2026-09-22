import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BamLearningApp,
  loadCodingTestCollectionSafely,
} from "../src/app.js";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";
import { createCodingTestSourceFingerprint } from "../src/core/coding-test.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";

const problem = {
  id: "coding-test-javascript-test-problem",
  slug: "test-problem",
  revision: 2,
  title: "테스트 문제",
  starterCode: "function solve(value) { return value; }",
};

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const codingTestCollection = JSON.parse(
  await readFile(
    new URL("../content/coding-tests/javascript.json", import.meta.url),
    "utf8",
  ),
);

function createCodingTestReport({
  targetProblem = problem,
  languageId = "javascript",
  mode = "run",
  outcome = "passed",
  requestId = `coding-test-${mode}-test`,
} = {}) {
  const counts = {
    passed: 0,
    wrong_answer: 0,
    syntax_error: 0,
    runtime_error: 0,
    timeout: 0,
    output_limit: 0,
    cancelled: 0,
    engine_error: 0,
    not_run: 0,
  };
  counts[outcome] = 1;
  return {
    requestId,
    contractVersion: 1,
    problemId: targetProblem.id,
    problemRevision: targetProblem.revision,
    languageId,
    mode,
    suite: "public",
    outcome,
    tests: [
      {
        testId: "public-one",
        label: "공개 테스트 1",
        outcome,
        expectedDisplay: "2",
        actualDisplay: outcome === "passed" || outcome === "wrong_answer" ? "2" : null,
        hasActual: outcome === "passed" || outcome === "wrong_answer",
        durationMs: 1,
        console: [],
        error: null,
        invocations: null,
      },
    ],
    summary: { outcome, total: 1, ...counts },
    durationMs: 1,
    limitsApplied: {},
    error: null,
  };
}

function installMinimalWindow(t) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      requestAnimationFrame() {},
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });
}

function installCodingTestRouteEnvironment(t) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash: "#/coding-tests/javascript/test-problem" },
      history: { replaceState() {} },
      requestAnimationFrame(callback) {
        callback?.();
      },
      scrollTo() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      title: "",
      querySelector() {
        return null;
      },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
}

function createRouteHarness(repository) {
  const collection = {
    contractVersion: 1,
    languageId: "javascript",
    title: "JavaScript 코딩테스트",
    problems: [problem],
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    currentView: null,
    renderSequence: 0,
    root: { innerHTML: "" },
    codingTestCollections: new Map([["javascript", collection]]),
    codingTestCollection: null,
    progressRepository: repository,
    hasRenderedView: false,
    renderCount: 0,
    enterView(view) {
      this.currentView = view;
      this.renderSequence += 1;
      return this.renderSequence;
    },
    renderServiceShell({ mainContent }) {
      return mainContent;
    },
    syncMenuState() {},
    getRelatedCodeQuest() {
      return null;
    },
    renderCodingTest() {
      this.renderCount += 1;
    },
  });
  return app;
}

function createExecutionHarness() {
  const reports = [];
  const app = Object.create(BamLearningApp.prototype);
  const repository = new LocalStorageProgressRepository(
    new MemoryStorage(),
    () => new Date("2026-08-18T00:00:00.000Z"),
  );
  Object.assign(app, {
    currentView: "coding-test",
    codingTestCollection: {
      contractVersion: 1,
      languageId: "javascript",
      problems: [problem],
    },
    codingTestState: {
      problem,
      source: "function solve(value) { return value; }",
      isRunning: false,
      cancelRequested: false,
      executionMode: null,
      draftStatus: "saved",
      uiError: null,
      report: null,
      reportPersistenceStatus: null,
    },
    codingTestRunner: {
      async run(input, options) {
        assert.equal(options.signal instanceof AbortSignal, true);
        const report = createCodingTestReport({
          mode: input.mode,
          requestId: input.requestId,
        });
        reports.push(report);
        return report;
      },
    },
    progressRepository: repository,
    executionCoordinator: new ExecutionCoordinator(),
    codingTestRequestSequence: 0,
    renderCodingTest() {},
    focusCodingTestResults() {},
  });
  return { app, repository, reports };
}

test("코딩테스트 source fingerprint는 trim·정규화 없이 UTF-8 원문을 SHA-256에 전달한다", async () => {
  const source = "  cafe\u0301\n";
  let algorithm = null;
  let received = null;
  const crypto = {
    subtle: {
      async digest(nextAlgorithm, bytes) {
        algorithm = nextAlgorithm;
        received = new Uint8Array(bytes);
        return Uint8Array.from(
          { length: 32 },
          (_, index) => (index * 17) % 256,
        ).buffer;
      },
    },
  };

  const fingerprint = await createCodingTestSourceFingerprint(source, crypto);

  assert.equal(algorithm, "SHA-256");
  assert.equal(new TextDecoder().decode(received), source);
  assert.equal(
    fingerprint,
    "00112233445566778899aabbccddeeff102132435465768798a9bacbdcedfe0f",
  );
  await assert.rejects(
    () => createCodingTestSourceFingerprint(source, {}),
    /fingerprint를 계산할 수 없습니다/,
  );
});

test("코딩테스트 실행은 상세만 저장하고 제출만 완료 처리하며 Quest 진도를 보존한다", async (t) => {
  installMinimalWindow(t);
  const { app, repository, reports } = createExecutionHarness();
  repository.recordQuestAttempt({
    questId: "quest-javascript-coding-test-separation",
    questRevision: 1,
    languageId: "javascript",
    outcome: "passed",
    passed: 1,
    total: 1,
  });
  const questState = structuredClone({
    questAttempts: repository.getProgress().questAttempts,
    completedQuestIds: repository.getProgress().completedQuestIds,
    completedQuestRevisions: repository.getProgress().completedQuestRevisions,
  });

  await app.executeCurrentCodingTest("run");
  assert.equal(reports.length, 1);
  assert.equal(repository.getProgress().codingTestSubmissions.length, 0);
  assert.equal(repository.getProgress().completedCodingTestProblems.length, 0);
  assert.equal(app.codingTestState.reportPersistenceStatus, null);
  assert.equal(app.codingTestState.resultPersistenceStatus, "memory");
  assert.equal(app.codingTestState.reportSourceStatus, "current");
  const runResult = repository.getCodingTestResult(problem.id, problem.revision);
  assert.equal(runResult.mode, "run");
  assert.match(runResult.sourceFingerprint, /^[a-f0-9]{64}$/);
  for (const forbidden of ["source", "requestId", "suite", "limitsApplied"]) {
    assert.equal(Object.hasOwn(runResult, forbidden), false, forbidden);
  }

  await app.executeCurrentCodingTest("submit");
  const progress = repository.getProgress();
  assert.equal(reports.length, 2);
  assert.equal(progress.codingTestSubmissions.length, 1);
  assert.equal(progress.codingTestSubmissions[0].problemId, problem.id);
  assert.equal(Object.hasOwn(progress.codingTestSubmissions[0], "source"), false);
  assert.deepEqual(progress.completedCodingTestProblems, [
    {
      problemId: problem.id,
      problemRevision: problem.revision,
      completedAt: "2026-08-18T00:00:00.000Z",
    },
  ]);
  assert.equal(app.codingTestState.reportPersistenceStatus, "memory");
  assert.equal(app.codingTestState.resultPersistenceStatus, "memory");
  assert.equal(
    repository.getCodingTestResult(problem.id, problem.revision).mode,
    "submit",
  );
  assert.deepEqual(
    {
      questAttempts: progress.questAttempts,
      completedQuestIds: progress.completedQuestIds,
      completedQuestRevisions: progress.completedQuestRevisions,
    },
    questState,
  );
});

test("상세 결과는 재진입 때 현재 draft와 비교해 복원하고 reset·revision 경계를 지킨다", async (t) => {
  installCodingTestRouteEnvironment(t);
  const { app: executionApp, repository, reports } = createExecutionHarness();
  await executionApp.executeCurrentCodingTest("run");
  const savedResult = repository.getCodingTestResult(problem.id, problem.revision);
  const progressAfterRun = structuredClone(repository.getProgress());

  const restoredApp = createRouteHarness(repository);
  await restoredApp.openCodingTestRoute("javascript", problem.slug);

  assert.equal(restoredApp.codingTestState.report.outcome, "passed");
  assert.equal(restoredApp.codingTestState.executionMode, "run");
  assert.equal(restoredApp.codingTestState.reportSourceStatus, "current");
  assert.equal(restoredApp.codingTestState.reportSource, problem.starterCode);
  assert.equal(restoredApp.codingTestState.resultPersistenceStatus, "restored");
  assert.equal(reports.length, 1);
  assert.deepEqual(repository.getProgress(), progressAfterRun);

  const editedSource = `${problem.starterCode}\n// 현재 draft`;
  repository.saveCodingTestDraft({
    problemId: problem.id,
    problemRevision: problem.revision,
    languageId: "javascript",
    source: editedSource,
  });
  const staleApp = createRouteHarness(repository);
  await staleApp.openCodingTestRoute("javascript", problem.slug);

  assert.equal(staleApp.codingTestState.source, editedSource);
  assert.equal(staleApp.codingTestState.report.outcome, "passed");
  assert.equal(staleApp.codingTestState.reportSourceStatus, "stale");
  assert.equal(staleApp.codingTestState.reportSource, null);
  assert.equal(staleApp.codingTestState.resultPersistenceStatus, "restored");
  assert.equal(reports.length, 1);

  staleApp.resetCodingTestSource();
  assert.equal(staleApp.codingTestState.report, null);
  assert.equal(staleApp.codingTestState.resultPersistenceStatus, null);
  assert.equal(repository.getCodingTestDraft(problem.id, problem.revision), null);
  assert.equal(repository.getCodingTestResult(problem.id, problem.revision), null);

  const { finishedAt, ...resultInput } = savedResult;
  repository.saveCodingTestResult({
    ...resultInput,
    problemRevision: problem.revision + 1,
  });
  const revisedApp = createRouteHarness(repository);
  await revisedApp.openCodingTestRoute("javascript", problem.slug);
  assert.equal(revisedApp.codingTestState.report, null);
  assert.equal(revisedApp.codingTestState.executionMode, null);
  assert.equal(revisedApp.codingTestState.resultPersistenceStatus, null);
  assert.equal(reports.length, 1);
  assert.equal(repository.getProgress().codingTestSubmissions.length, 0);
});

test("상세 복원 fingerprint 실패가 늦게 끝나도 이동한 route의 화면·상태·제목을 덮어쓰지 않는다", async (t) => {
  installCodingTestRouteEnvironment(t);
  const { app: executionApp, repository } = createExecutionHarness();
  await executionApp.executeCurrentCodingTest("run");

  let rejectDigest;
  let markDigestStarted;
  const digestStarted = new Promise((resolve) => {
    markDigestStarted = resolve;
  });
  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    writable: true,
    value: {
      subtle: {
        digest() {
          markDigestStarted();
          return new Promise((_, reject) => {
            rejectDigest = reject;
          });
        },
      },
    },
  });
  t.after(() => {
    if (previousCrypto) Object.defineProperty(globalThis, "crypto", previousCrypto);
    else delete globalThis.crypto;
  });

  const app = createRouteHarness(repository);
  const previousState = { marker: "new-route-state" };
  const opening = app.openCodingTestRoute("javascript", problem.slug);
  await digestStarted;
  app.enterView("lesson");
  app.codingTestState = previousState;
  app.root.innerHTML = "new route screen";
  document.title = "새 화면 · BAM.dev";
  rejectDigest(new Error("delayed digest failure"));
  await opening;

  assert.equal(app.currentView, "lesson");
  assert.equal(app.codingTestState, previousState);
  assert.equal(app.root.innerHTML, "new route screen");
  assert.equal(document.title, "새 화면 · BAM.dev");
  assert.equal(app.renderCount, 0);
});

test("stale 상세 결과는 원래 source에서 current가 되고 늦은 fingerprint는 추가 편집·이동을 덮어쓰지 않는다", async (t) => {
  installCodingTestRouteEnvironment(t);
  const { app: executionApp, repository } = createExecutionHarness();
  await executionApp.executeCurrentCodingTest("run");
  repository.saveCodingTestDraft({
    problemId: problem.id,
    problemRevision: problem.revision,
    languageId: "javascript",
    source: `${problem.starterCode}\n// stale draft`,
  });

  const app = createRouteHarness(repository);
  await app.openCodingTestRoute("javascript", problem.slug);
  const state = app.codingTestState;
  assert.equal(state.reportSourceStatus, "stale");
  assert.equal(state.reportSource, null);

  state.source = problem.starterCode;
  await app.updateCodingTestResultSourceStatus(state);
  assert.equal(state.reportSourceStatus, "current");
  assert.equal(state.reportSource, problem.starterCode);

  const originalFingerprint = state.report.sourceFingerprint;
  const fingerprintBytes = Uint8Array.from(
    originalFingerprint.match(/.{2}/g),
    (pair) => Number.parseInt(pair, 16),
  ).buffer;
  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const pendingDigests = [];
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    writable: true,
    value: {
      subtle: {
        digest() {
          return new Promise((resolve) => pendingDigests.push(resolve));
        },
      },
    },
  });
  t.after(() => {
    if (previousCrypto) Object.defineProperty(globalThis, "crypto", previousCrypto);
    else delete globalThis.crypto;
  });

  state.reportSource = null;
  state.reportSourceStatus = "stale";
  state.source = problem.starterCode;
  const editRace = app.updateCodingTestResultSourceStatus(state);
  assert.equal(pendingDigests.length, 1);
  state.source = `${problem.starterCode}\n// later edit`;
  pendingDigests.shift()(fingerprintBytes.slice(0));
  await editRace;
  assert.equal(state.reportSource, null);
  assert.equal(state.reportSourceStatus, "stale");

  state.source = problem.starterCode;
  const routeRace = app.updateCodingTestResultSourceStatus(state);
  assert.equal(pendingDigests.length, 1);
  app.enterView("lesson");
  pendingDigests.shift()(fingerprintBytes.slice(0));
  await routeRace;
  assert.equal(app.currentView, "lesson");
  assert.equal(state.reportSource, null);
  assert.equal(state.reportSourceStatus, "stale");
});

test("상세 저장 용량·quota·WebCrypto 실패에도 현재 report와 기존 진도를 유지한다", async (t) => {
  installMinimalWindow(t);

  for (const [error, expectedStatus] of [
    [new RangeError("too large"), "too-large"],
    [new Error("quota exceeded"), "failed"],
  ]) {
    const { app, repository } = createExecutionHarness();
    repository.setLessonCompleted("js-01-runtime", true);
    const progressBeforeRun = structuredClone(repository.getProgress());
    repository.saveCodingTestResult = () => {
      throw error;
    };

    await app.executeCurrentCodingTest("run");

    assert.equal(app.codingTestState.report.outcome, "passed");
    assert.equal(app.codingTestState.reportSourceStatus, "current");
    assert.equal(app.codingTestState.resultPersistenceStatus, expectedStatus);
    assert.deepEqual(repository.getProgress(), progressBeforeRun);
  }

  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const { app, repository } = createExecutionHarness();
  repository.setLessonCompleted("js-01-runtime", true);
  const progressBeforeRun = structuredClone(repository.getProgress());
  let resultSaveCalls = 0;
  repository.saveCodingTestResult = () => {
    resultSaveCalls += 1;
  };
  try {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    await app.executeCurrentCodingTest("run");
  } finally {
    if (previousCrypto) Object.defineProperty(globalThis, "crypto", previousCrypto);
    else delete globalThis.crypto;
  }

  assert.equal(app.codingTestState.report.outcome, "passed");
  assert.equal(app.codingTestState.reportSourceStatus, "current");
  assert.equal(app.codingTestState.resultPersistenceStatus, "failed");
  assert.equal(resultSaveCalls, 0);
  assert.deepEqual(repository.getProgress(), progressBeforeRun);
});

test("기존 실제 오류 6종의 report 형태를 상세 snapshot으로 투영하고 다시 읽는다", async (t) => {
  installMinimalWindow(t);
  const invocationCases = new Map([
    [
      "wrong_answer",
      {
        discovered: 5,
        started: 5,
        finished: 5,
        passed: 0,
        wrongAnswer: 5,
        runtimeError: 0,
        skipped: 0,
        aborted: 0,
        infrastructure: 0,
      },
    ],
    [
      "runtime_error",
      {
        discovered: 5,
        started: 5,
        finished: 5,
        passed: 0,
        wrongAnswer: 0,
        runtimeError: 5,
        skipped: 0,
        aborted: 0,
        infrastructure: 0,
      },
    ],
  ]);
  const outcomes = [
    "wrong_answer",
    "syntax_error",
    "runtime_error",
    "timeout",
    "cancelled",
    "output_limit",
  ];

  for (const outcome of outcomes) {
    const { app, repository } = createExecutionHarness();
    app.codingTestRunner = {
      async run(input) {
        const report = createCodingTestReport({
          mode: input.mode,
          outcome,
          requestId: input.requestId,
        });
        report.tests[0].error = {
          type: outcome,
          message: `${outcome} 원인`,
          learnerMessage: `${outcome} 원인`,
        };
        report.tests[0].invocations = invocationCases.get(outcome) ?? null;
        return report;
      },
    };

    await app.executeCurrentCodingTest("run");
    const restored = repository.getCodingTestResult(problem.id, problem.revision);

    assert.equal(app.codingTestState.resultPersistenceStatus, "memory", outcome);
    assert.equal(restored.outcome, outcome);
    assert.equal(restored.summary.outcome, outcome);
    assert.equal(restored.tests[0].outcome, outcome);
    assert.deepEqual(restored.tests[0].error, {
      type: outcome,
      message: `${outcome} 원인`,
      learnerMessage: `${outcome} 원인`,
    });
    assert.deepEqual(restored.tests[0].invocations, invocationCases.get(outcome) ?? null);
  }
});

test("코딩테스트 초안은 연속 입력을 마지막 값 한 건으로 저장하고 리비전을 보존한다", () => {
  const savedDrafts = [];
  const timers = new Map();
  let nextTimerId = 1;
  const app = Object.create(BamLearningApp.prototype);
  const state = {
    problem,
    source: "첫 입력",
    draftStatus: "starter",
    uiError: null,
  };
  Object.assign(app, {
    currentView: "coding-test",
    codingTestCollection: { languageId: "javascript" },
    codingTestState: state,
    setCodingTestDraftSaveTimer(callback) {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    },
    clearCodingTestDraftSaveTimer(id) {
      timers.delete(id);
    },
    progressRepository: {
      saveCodingTestDraft(draft) {
        savedDrafts.push(structuredClone(draft));
      },
      getPersistenceStatus() {
        return { isPersistent: true };
      },
    },
    updateCodingTestDraftFeedback() {},
  });
  app.codingTestDraftSaveCoordinator = new DraftSaveCoordinator({
    delayMs: 250,
    persist: (pending) => app.persistCodingTestDraft(pending),
    setTimer: (callback) => app.setCodingTestDraftSaveTimer(callback),
    clearTimer: (timer) => app.clearCodingTestDraftSaveTimer(timer),
  });

  app.scheduleCodingTestDraftSave(state);
  state.source = "마지막 입력";
  app.scheduleCodingTestDraftSave(state);
  assert.equal(timers.size, 1);
  assert.equal(savedDrafts.length, 0);

  const [timerId, callback] = timers.entries().next().value;
  timers.delete(timerId);
  callback();
  assert.deepEqual(savedDrafts, [
    {
      problemId: problem.id,
      problemRevision: 2,
      languageId: "javascript",
      source: "마지막 입력",
    },
  ]);
  assert.equal(state.draftStatus, "saved");

  state.source = "리비전 2의 후속 입력";
  app.scheduleCodingTestDraftSave(state);
  const revisedState = {
    ...state,
    problem: { ...problem, revision: 3 },
    source: "리비전 3 입력",
  };
  app.codingTestState = revisedState;
  app.scheduleCodingTestDraftSave(revisedState);

  assert.equal(savedDrafts[1].problemRevision, 2);
  assert.equal(savedDrafts[1].source, "리비전 2의 후속 입력");
  assert.equal(timers.size, 1);
  timers.values().next().value();
  assert.equal(savedDrafts[2].problemRevision, 3);
  assert.equal(savedDrafts[2].source, "리비전 3 입력");
});

test("코딩테스트 실행 취소는 현재 AbortSignal을 중단한다", (t) => {
  installMinimalWindow(t);
  const { app } = createExecutionHarness();
  app.codingTestState.isRunning = true;
  const execution = app.executionCoordinator.start({
    kind: "coding-test",
    requestId: "coding-test-run-cancel",
    ownerId: `javascript:${problem.id}:${problem.revision}`,
    mode: "run",
  });
  const button = { disabled: false, textContent: "실행 취소" };

  app.cancelCodingTestRun(button);

  assert.equal(execution.signal.aborted, true);
  assert.equal(app.codingTestState.cancelRequested, true);
  assert.equal(button.disabled, true);
  assert.equal(button.textContent, "취소하는 중…");
});

test("코딩테스트 제출 중 화면을 떠나 취소되면 결과를 저장하거나 렌더하지 않는다", async (t) => {
  installMinimalWindow(t);
  const { app, repository } = createExecutionHarness();
  let renderCount = 0;
  let resolveReport;
  app.renderCodingTest = () => {
    renderCount += 1;
  };
  app.codingTestRunner = {
    run(input, { signal }) {
      return new Promise((resolve) => {
        resolveReport = () =>
          resolve({
            requestId: input.requestId,
            contractVersion: 1,
            problemId: problem.id,
            problemRevision: problem.revision,
            languageId: "javascript",
            mode: input.mode,
            suite: "public",
            outcome: "cancelled",
            tests: [],
            summary: { passed: 0, total: 6 },
            durationMs: 1,
            limitsApplied: {},
            error: null,
          });
        signal.addEventListener("abort", resolveReport, { once: true });
      });
    },
  };

  const submission = app.executeCurrentCodingTest("submit");
  app.cancelCodingTestRun({ disabled: false, textContent: "실행 취소" });
  assert.equal(app.executionCoordinator.active.cancellationReason, "user");
  app.leaveCurrentView();
  assert.equal(app.executionCoordinator.active.cancellationReason, "navigation");
  app.currentView = "lesson";
  app.codingTestState = null;
  resolveReport();
  await submission;

  assert.equal(repository.getProgress().codingTestSubmissions.length, 0);
  assert.equal(renderCount, 1);
  assert.equal(app.executionCoordinator.active, null);
});

test("현재 코딩테스트 화면에서 직접 취소한 제출 결과는 계속 저장하고 표시한다", async (t) => {
  installMinimalWindow(t);
  const { app, repository } = createExecutionHarness();
  app.codingTestRunner = {
    run(input, { signal }) {
      return new Promise((resolve) => {
        signal.addEventListener(
          "abort",
          () =>
            resolve({
              requestId: input.requestId,
              contractVersion: 1,
              problemId: problem.id,
              problemRevision: problem.revision,
              languageId: "javascript",
              mode: input.mode,
              suite: "public",
              outcome: "cancelled",
              tests: [],
              summary: { passed: 0, total: 6 },
              durationMs: 1,
              limitsApplied: {},
              error: null,
            }),
          { once: true },
        );
      });
    },
  };

  const submission = app.executeCurrentCodingTest("submit");
  app.cancelCodingTestRun({ disabled: false, textContent: "실행 취소" });
  assert.equal(app.executionCoordinator.active.cancellationReason, "user");
  await submission;

  assert.equal(repository.getProgress().codingTestSubmissions.length, 1);
  assert.equal(app.codingTestState.report.outcome, "cancelled");
  assert.equal(app.codingTestState.reportPersistenceStatus, "memory");
});

test("코딩테스트 목록 진입은 진행 중인 이전 화면 렌더를 무효화한다", (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash: "#/coding-tests" },
      history: { replaceState() {} },
      scrollTo() {},
      requestAnimationFrame() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: { title: "" },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    renderSequence: 4,
    codingTestCollection: { title: "JavaScript 코딩테스트" },
    hasRenderedView: false,
    syncMenuState() {},
    renderCodingTestList() {},
  });

  app.openCodingTestListRoute();

  assert.equal(app.renderSequence, 5);
  assert.equal(app.currentView, "coding-test-list");
});

test("코딩테스트 콘텐츠 로드 실패는 다른 학습 기능의 시작을 막지 않도록 격리한다", async () => {
  const loadArguments = [];
  const loaded = { title: "JavaScript 코딩테스트" };
  const successful = await loadCodingTestCollectionSafely(
    curriculum,
    async (...args) => {
      loadArguments.push(args);
      return loaded;
    },
  );
  const failed = await loadCodingTestCollectionSafely(curriculum, async () => {
    throw new Error("503");
  });

  assert.equal(successful, loaded);
  assert.deepEqual(loadArguments, [["javascript", curriculum]]);
  assert.equal(failed, null);
});

test("코딩테스트 검색은 빠른 연속 입력을 최신 값 한 번으로 렌더한다", (t) => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const callbacks = [];
  const clearedTimers = [];
  const renderOptions = [];
  const search = {
    value: "배",
    selectionStart: 1,
    closest(selector) {
      return selector === "[data-coding-test-search]" ? this : null;
    },
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: { activeElement: search },
  });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "coding-test-list",
    codingTestFilters: {
      query: "",
      difficulty: "all",
      language: "all",
      type: "all",
      status: "all",
    },
    pendingCodingTestSearchRender: null,
    codingTestSearchRenderTimer: null,
    setCodingTestSearchRenderTimer(callback) {
      callbacks.push(callback);
      return callbacks.length;
    },
    clearCodingTestSearchRenderTimer(timer) {
      clearedTimers.push(timer);
    },
    renderCodingTestList(options) {
      renderOptions.push(options);
    },
  });

  search.value = "배열";
  search.selectionStart = 2;
  app.handleInput({ target: search, isComposing: false });
  search.value = "배열 메서드";
  search.selectionStart = 6;
  app.handleInput({ target: search, isComposing: false });

  assert.deepEqual(clearedTimers, [1]);
  assert.equal(renderOptions.length, 0);
  assert.equal(app.codingTestFilters.query, "배열 메서드");

  callbacks[0]();
  assert.equal(renderOptions.length, 0);
  callbacks[1]();
  assert.deepEqual(renderOptions, [
    {
      focusSelector: "[data-coding-test-search]",
      cursorPosition: 6,
    },
  ]);

  search.value = "배열 메서드 검색";
  search.selectionStart = 9;
  app.handleInput({ target: search, isComposing: false });
  globalThis.document.activeElement = {};
  callbacks[2]();
  assert.deepEqual(renderOptions[1], {
    focusSelector: null,
    cursorPosition: null,
  });
});

test("코딩테스트 검색은 IME 조합 중 예약을 취소하고 종료 입력만 렌더한다", (t) => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const callbacks = [];
  const renderOptions = [];
  const search = {
    value: "배",
    selectionStart: 1,
    closest(selector) {
      return selector === "[data-coding-test-search]" ? this : null;
    },
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: { activeElement: search },
  });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "coding-test-list",
    codingTestFilters: {
      query: "",
      difficulty: "all",
      language: "all",
      type: "all",
      status: "all",
    },
    pendingCodingTestSearchRender: null,
    codingTestSearchRenderTimer: null,
    setCodingTestSearchRenderTimer(callback) {
      callbacks.push(callback);
      return callbacks.length;
    },
    clearCodingTestSearchRenderTimer() {},
    renderCodingTestList(options) {
      renderOptions.push(options);
    },
  });

  app.handleInput({ target: search, isComposing: true });
  assert.equal(callbacks.length, 0);
  assert.equal(app.codingTestFilters.query, "");

  search.value = "배열";
  search.selectionStart = 2;
  app.handleInput({ target: search, isComposing: false });
  assert.equal(renderOptions.length, 0);
  assert.equal(app.codingTestFilters.query, "배열");
  callbacks[0]();
  assert.equal(renderOptions.length, 1);

  search.value = "배열과";
  search.selectionStart = 3;
  app.handleInput({ target: search, isComposing: false });
  assert.notEqual(app.pendingCodingTestSearchRender, null);
  search.value = "배열과 ㅎ";
  app.handleInput({ target: search, isComposing: true });
  assert.equal(app.pendingCodingTestSearchRender, null);
  assert.equal(app.codingTestFilters.query, "배열과");
  callbacks[1]();
  assert.equal(renderOptions.length, 1);
});

test("코딩테스트 목록은 한 번 읽은 진도 스냅샷을 셸과 완료 표시에 재사용한다", () => {
  const progress = {
    completedCodingTestProblems: [
      {
        problemId: codingTestCollection.problems[0].id,
        problemRevision: codingTestCollection.problems[0].revision,
        completedAt: "2026-08-18T00:00:00.000Z",
      },
    ],
  };
  let progressReadCount = 0;
  let shellArguments = null;
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    codingTestCollection,
    codingTestFilters: {
      query: "",
      difficulty: "all",
      language: "all",
      type: "all",
      status: "all",
    },
    pendingCodingTestSearchRender: null,
    codingTestSearchRenderTimer: null,
    progressRepository: {
      getProgress() {
        progressReadCount += 1;
        return progress;
      },
    },
    renderCodingTestShell(...args) {
      shellArguments = args;
    },
  });

  app.renderCodingTestList();

  assert.equal(progressReadCount, 1);
  assert.equal(shellArguments[1], progress);
  assert.equal(shellArguments[2].has(codingTestCollection.problems[0].id), true);
});
