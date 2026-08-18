import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BamLearningApp,
  loadCodingTestCollectionSafely,
} from "../src/app.js";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";

const problem = {
  id: "coding-test-javascript-test-problem",
  revision: 2,
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
        const report = {
          requestId: input.requestId,
          contractVersion: 1,
          problemId: problem.id,
          problemRevision: problem.revision,
          languageId: "javascript",
          mode: input.mode,
          suite: "public",
          outcome: "passed",
          tests: [],
          summary: { passed: input.mode === "run" ? 3 : 6, total: input.mode === "run" ? 3 : 6 },
          durationMs: 1,
          limitsApplied: {},
          error: null,
        };
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

test("코딩테스트 실행은 기록하지 않고 제출만 정확히 한 번 저장한다", async (t) => {
  installMinimalWindow(t);
  const { app, repository, reports } = createExecutionHarness();

  await app.executeCurrentCodingTest("run");
  assert.equal(reports.length, 1);
  assert.equal(repository.getProgress().codingTestSubmissions.length, 0);
  assert.equal(app.codingTestState.reportPersistenceStatus, null);

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
