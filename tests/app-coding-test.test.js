import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";

const problem = {
  id: "coding-test-javascript-test-problem",
  revision: 2,
  starterCode: "function solve(value) { return value; }",
};

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
    activeQuestExecution: null,
    activeCodingTestExecution: null,
    pendingCodingTestDraftSave: null,
    codingTestDraftSaveTimer: null,
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
    pendingCodingTestDraftSave: null,
    codingTestDraftSaveTimer: null,
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

  app.scheduleCodingTestDraftSave(state);
  state.source = "마지막 입력";
  app.scheduleCodingTestDraftSave(state);
  assert.equal(timers.size, 1);
  assert.equal(savedDrafts.length, 0);

  const callback = timers.values().next().value;
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
});

test("코딩테스트 실행 취소는 현재 AbortSignal을 중단한다", (t) => {
  installMinimalWindow(t);
  const { app } = createExecutionHarness();
  const controller = new AbortController();
  app.codingTestState.isRunning = true;
  app.activeCodingTestExecution = { controller };
  const button = { disabled: false, textContent: "실행 취소" };

  app.cancelCodingTestRun(button);

  assert.equal(controller.signal.aborted, true);
  assert.equal(app.codingTestState.cancelRequested, true);
  assert.equal(button.disabled, true);
  assert.equal(button.textContent, "취소하는 중…");
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

test("코딩테스트 검색은 IME 조합 중 목록을 교체하지 않는다", () => {
  let renderCount = 0;
  const search = {
    value: "배",
    selectionStart: 1,
    closest(selector) {
      return selector === "[data-coding-test-search]" ? this : null;
    },
  };
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
    renderCodingTestList() {
      renderCount += 1;
    },
  });

  app.handleInput({ target: search, isComposing: true });
  assert.equal(renderCount, 0);
  assert.equal(app.codingTestFilters.query, "");

  search.value = "배열";
  search.selectionStart = 2;
  app.handleInput({ target: search, isComposing: false });
  assert.equal(renderCount, 1);
  assert.equal(app.codingTestFilters.query, "배열");
});
