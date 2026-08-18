import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";

function createQuestState(questId, source, revision = 1) {
  return {
    quest: { id: questId, revision },
    source,
    draftStatus: "starter",
    uiError: null,
    isRunning: false,
  };
}

function createDraftHarness() {
  const app = Object.create(BamLearningApp.prototype);
  const savedDrafts = [];
  const timers = new Map();
  let nextTimerId = 1;
  let feedbackUpdates = 0;

  app.currentView = "quest";
  app.codeQuestCollection = { languageId: "javascript" };
  app.codeQuestState = null;
  app.renderSequence = 0;
  app.executionCoordinator = new ExecutionCoordinator();
  app.syncMenuState = () => {};
  app.setQuestDraftSaveTimer = (callback) => {
    const timerId = nextTimerId;
    nextTimerId += 1;
    timers.set(timerId, callback);
    return timerId;
  };
  app.clearQuestDraftSaveTimer = (timerId) => {
    timers.delete(timerId);
  };
  app.progressRepository = {
    saveQuestDraft(draft) {
      savedDrafts.push(structuredClone(draft));
    },
    getPersistenceStatus() {
      return { isPersistent: true };
    },
  };
  app.updateCodeQuestDraftFeedback = () => {
    feedbackUpdates += 1;
  };
  app.questDraftSaveCoordinator = new DraftSaveCoordinator({
    delayMs: 250,
    persist: (pending) => app.persistQuestDraft(pending),
    setTimer: (callback) => app.setQuestDraftSaveTimer(callback),
    clearTimer: (timerId) => app.clearQuestDraftSaveTimer(timerId),
  });
  return {
    app,
    savedDrafts,
    timers,
    get feedbackUpdates() {
      return feedbackUpdates;
    },
    runOnlyTimer() {
      assert.equal(timers.size, 1, "실행할 저장 타이머가 하나여야 합니다.");
      const [timerId, callback] = timers.entries().next().value;
      timers.delete(timerId);
      callback();
    },
  };
}

test("Code Quest 초안 저장 지연은 250ms다", (t) => {
  const previousWindow = globalThis.window;
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });

  let observedDelay = null;
  globalThis.window = {
    setTimeout(_callback, delay) {
      observedDelay = delay;
      return 17;
    },
  };

  const app = Object.create(BamLearningApp.prototype);
  assert.equal(app.setQuestDraftSaveTimer(() => {}), 17);
  assert.equal(observedDelay, 250);
});

test("연속 입력은 마지막 Code Quest 초안 한 번만 저장한다", () => {
  const harness = createDraftHarness();
  const state = createQuestState("quest-javascript-a", "첫 입력");
  harness.app.codeQuestState = state;

  harness.app.scheduleQuestDraftSave(state);
  state.source = "마지막 입력";
  harness.app.scheduleQuestDraftSave(state);

  assert.equal(harness.savedDrafts.length, 0);
  assert.equal(harness.timers.size, 1);
  harness.runOnlyTimer();

  assert.deepEqual(harness.savedDrafts, [
    {
      questId: "quest-javascript-a",
      languageId: "javascript",
      source: "마지막 입력",
    },
  ]);
  assert.equal(state.draftStatus, "saved");
  assert.equal(harness.feedbackUpdates, 1);
});

test("라우트 이탈과 실행 직전에는 대기 중인 초안을 즉시 저장한다", async () => {
  const routeHarness = createDraftHarness();
  const routeState = createQuestState("quest-javascript-route", "라우트 이탈 전");
  routeHarness.app.codeQuestState = routeState;
  routeHarness.app.curriculum = null;
  routeHarness.app.scheduleQuestDraftSave(routeState);

  await routeHarness.app.openRoute();

  assert.equal(routeHarness.timers.size, 0);
  assert.equal(routeHarness.savedDrafts[0]?.source, "라우트 이탈 전");

  const runHarness = createDraftHarness();
  const runState = createQuestState("quest-javascript-run", "실행 직전");
  runHarness.app.codeQuestState = runState;
  runHarness.app.executionCoordinator.start({
    kind: "code-quest",
    requestId: "already-running",
    ownerId: "javascript:quest-javascript-other:1",
    mode: "run",
  });
  runHarness.app.renderCodeQuest = () => {};
  runHarness.app.scheduleQuestDraftSave(runState);

  await runHarness.app.runCurrentCodeQuest();

  assert.equal(runHarness.timers.size, 0);
  assert.equal(runHarness.savedDrafts[0]?.source, "실행 직전");
});

test("Quest가 바뀌면 이전 소유자의 최신 초안을 먼저 저장해 교차 오염을 막는다", () => {
  const harness = createDraftHarness();
  const firstState = createQuestState("quest-javascript-first", "첫 Quest 코드");
  const secondState = createQuestState("quest-javascript-second", "둘째 Quest 코드");

  harness.app.codeQuestState = firstState;
  harness.app.scheduleQuestDraftSave(firstState);
  harness.app.codeQuestState = secondState;
  harness.app.scheduleQuestDraftSave(secondState);

  assert.deepEqual(harness.savedDrafts, [
    {
      questId: "quest-javascript-first",
      languageId: "javascript",
      source: "첫 Quest 코드",
    },
  ]);
  harness.runOnlyTimer();
  assert.deepEqual(harness.savedDrafts[1], {
    questId: "quest-javascript-second",
    languageId: "javascript",
    source: "둘째 Quest 코드",
  });
});

test("같은 Quest ID라도 리비전이 바뀌면 별도 초안 소유자로 취급한다", () => {
  const harness = createDraftHarness();
  const previousRevision = createQuestState(
    "quest-javascript-revisioned",
    "리비전 1 코드",
    1,
  );
  const currentRevision = createQuestState(
    "quest-javascript-revisioned",
    "리비전 2 코드",
    2,
  );

  harness.app.codeQuestState = previousRevision;
  harness.app.scheduleQuestDraftSave(previousRevision);
  harness.app.codeQuestState = currentRevision;
  harness.app.scheduleQuestDraftSave(currentRevision);

  assert.equal(harness.savedDrafts[0]?.source, "리비전 1 코드");
  harness.runOnlyTimer();
  assert.equal(harness.savedDrafts[1]?.source, "리비전 2 코드");
});
