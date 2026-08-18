import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";

test("leaveCurrentView는 예약 작업을 정리하고 사용자 취소를 탐색 취소로 승격한다", () => {
  const app = Object.create(BamLearningApp.prototype);
  const calls = [];
  const executionCoordinator = new ExecutionCoordinator();
  const execution = executionCoordinator.start({
    kind: "code-quest",
    requestId: "quest-run-lifecycle",
    ownerId: "javascript:quest-one:1",
    mode: "run",
  });
  executionCoordinator.cancel(execution, "user");

  Object.assign(app, {
    executionCoordinator,
    cancelPendingCodingTestSearchRender() {
      calls.push("cancel-search");
    },
    flushPendingQuestDraftSave() {
      calls.push("flush-quest");
      return true;
    },
    flushPendingCodingTestDraftSave() {
      calls.push("flush-coding-test");
      return true;
    },
  });

  assert.equal(app.leaveCurrentView(), true);
  assert.deepEqual(calls, ["cancel-search", "flush-quest", "flush-coding-test"]);
  assert.equal(execution.signal.aborted, true);
  assert.equal(execution.cancellationReason, "navigation");
  assert.equal(executionCoordinator.active, execution);
});

test("enterView는 화면 전용 상태만 초기화하고 장기 객체와 콘텐츠 캐시는 보존한다", () => {
  const app = Object.create(BamLearningApp.prototype);
  const preserved = {
    curriculum: { languages: [] },
    codeQuestCollections: new Map([["javascript", { quests: [] }]]),
    codeQuestCollection: { languageId: "javascript" },
    codingTestCollection: { languageId: "javascript" },
    codeQuestRunner: { run() {} },
    codingTestRunner: { run() {} },
    progressRepository: { getProgress() {} },
    executionCoordinator: new ExecutionCoordinator(),
    questDraftSaveCoordinator: { flush() {} },
    codingTestDraftSaveCoordinator: { flush() {} },
    codingTestFilters: { query: "배열" },
  };
  let menuSyncCount = 0;
  Object.assign(app, preserved, {
    renderSequence: 7,
    currentView: "quest",
    currentLesson: { id: "lesson-one" },
    currentMarkdown: "본문",
    quizCollection: { questions: [] },
    quizSession: { screen: "question" },
    quizRecentAttempt: { id: "attempt-one" },
    quizIncorrectQuestionCount: 3,
    codeQuestState: { quest: { id: "quest-one" } },
    codingTestState: { problem: { id: "problem-one" } },
    menuOpen: true,
    syncMenuState() {
      menuSyncCount += 1;
    },
  });

  const sequence = app.enterView("web-project");

  assert.equal(sequence, 8);
  assert.equal(app.renderSequence, 8);
  assert.equal(app.currentView, "web-project");
  assert.equal(app.currentLesson, null);
  assert.equal(app.currentMarkdown, "");
  assert.equal(app.quizCollection, null);
  assert.equal(app.quizSession, null);
  assert.equal(app.quizRecentAttempt, null);
  assert.equal(app.quizIncorrectQuestionCount, 0);
  assert.equal(app.codeQuestState, null);
  assert.equal(app.codingTestState, null);
  assert.equal(app.menuOpen, false);
  assert.equal(menuSyncCount, 1);

  for (const [key, value] of Object.entries(preserved)) {
    assert.equal(app[key], value, `${key}는 화면 전환 뒤에도 같은 객체여야 합니다.`);
  }
});

test("curriculum 로드 전 openRoute도 초안을 flush하고 이전 비동기 렌더를 무효화한다", async () => {
  const app = Object.create(BamLearningApp.prototype);
  const calls = [];
  Object.assign(app, {
    curriculum: null,
    currentView: "quest",
    currentLesson: null,
    currentMarkdown: "",
    renderSequence: 11,
    executionCoordinator: new ExecutionCoordinator(),
    cancelPendingCodingTestSearchRender() {
      calls.push("cancel-search");
    },
    flushPendingQuestDraftSave() {
      calls.push("flush-quest");
      return true;
    },
    flushPendingCodingTestDraftSave() {
      calls.push("flush-coding-test");
      return true;
    },
    syncMenuState() {},
  });

  await app.openRoute();

  assert.deepEqual(calls, ["cancel-search", "flush-quest", "flush-coding-test"]);
  assert.equal(app.renderSequence, 12);
  assert.equal(app.currentView, "quest");
});
