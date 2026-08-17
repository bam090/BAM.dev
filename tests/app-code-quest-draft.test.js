import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";

function installFakeBrowserClock(t) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const scheduled = [];
  const liveTimers = new Map();
  let nextTimerId = 0;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      setTimeout(callback, delay) {
        nextTimerId += 1;
        const timer = { id: nextTimerId, callback, delay };
        scheduled.push(timer);
        liveTimers.set(timer.id, timer);
        return timer.id;
      },
      clearTimeout(timerId) {
        liveTimers.delete(timerId);
      },
      requestAnimationFrame() {},
    },
  });

  t.after(() => {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      delete globalThis.window;
    }
  });

  return {
    scheduled,
    liveTimers,
    runLiveTimers() {
      const timers = [...liveTimers.values()];
      liveTimers.clear();
      for (const timer of timers) timer.callback();
    },
    runEveryScheduledCallback() {
      for (const timer of scheduled) timer.callback();
    },
  };
}

function createQuest(id, starterCode = "function solve() {}") {
  return {
    id,
    starterCode,
    hints: [],
  };
}

function createQuestState(quest) {
  return {
    quest,
    source: quest.starterCode,
    isRunning: false,
    cancelRequested: false,
    draftStatus: "starter",
    uiError: null,
    report: null,
    reportPersistenceStatus: null,
    visibleHintCount: 0,
  };
}

function createAppHarness(quest = createQuest("quest-javascript-one")) {
  const saves = [];
  const events = [];
  const app = Object.create(BamLearningApp.prototype);

  Object.assign(app, {
    currentView: "quest",
    currentLesson: null,
    curriculum: null,
    codeQuestCollection: { languageId: "javascript" },
    codeQuestState: createQuestState(quest),
    codeQuestRunner: null,
    activeQuestExecution: null,
    pendingQuestDraftSave: null,
    questDraftSaveTimer: null,
    questRequestSequence: 0,
    progressRepository: {
      saveQuestDraft(draft) {
        saves.push({ ...draft });
        events.push(`save:${draft.questId}`);
      },
      getPersistenceStatus() {
        return { isPersistent: true };
      },
    },
    updateCodeQuestDraftFeedback() {},
    renderCodeQuest() {
      events.push("render");
    },
  });

  return { app, saves, events };
}

function inputSource(app, value) {
  const editor = {
    value,
    closest(selector) {
      return selector === "[data-quest-source]" ? this : null;
    },
  };
  app.handleInput({ target: editor });
}

test("Code Quest 입력은 즉시 반영하고 250ms 동안의 변경을 한 번만 저장한다", (t) => {
  const clock = installFakeBrowserClock(t);
  const { app, saves } = createAppHarness();

  inputSource(app, "f");
  assert.equal(app.codeQuestState.source, "f");
  inputSource(app, "fu");
  assert.equal(app.codeQuestState.source, "fu");
  inputSource(app, "function solve() { return 1; }");

  assert.equal(app.codeQuestState.source, "function solve() { return 1; }");
  assert.deepEqual(
    clock.scheduled.map((timer) => timer.delay),
    [250, 250, 250],
  );
  assert.equal(clock.liveTimers.size, 1);
  assert.equal(saves.length, 0);

  clock.runLiveTimers();
  assert.deepEqual(saves, [
    {
      questId: "quest-javascript-one",
      languageId: "javascript",
      source: "function solve() { return 1; }",
    },
  ]);

  clock.runEveryScheduledCallback();
  assert.equal(saves.length, 1);
});

test("라우트 전환은 대기 중인 최신 초안을 즉시 한 번 저장한다", async (t) => {
  const clock = installFakeBrowserClock(t);
  const { app, saves } = createAppHarness();

  inputSource(app, "function solve() { return 2; }");
  await app.openRoute();

  assert.equal(clock.liveTimers.size, 0);
  assert.deepEqual(saves, [
    {
      questId: "quest-javascript-one",
      languageId: "javascript",
      source: "function solve() { return 2; }",
    },
  ]);

  clock.runEveryScheduledCallback();
  assert.equal(saves.length, 1);
});

test("공개 테스트 실행은 request를 만들기 전에 대기 중인 초안을 저장한다", async (t) => {
  installFakeBrowserClock(t);
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/javascript.json", import.meta.url), "utf8"),
  );
  const quest = collection.quests[0];
  const { app, saves, events } = createAppHarness(quest);
  app.codeQuestCollection = collection;
  app.codeQuestRunner = {
    async run() {
      events.push("run");
      throw new Error("테스트에서 실행을 종료합니다.");
    },
  };

  const editedSource = `${quest.starterCode}\n// 저장 순서 확인`;
  inputSource(app, editedSource);
  await app.runCurrentCodeQuest();

  assert.equal(saves.length, 1);
  assert.equal(saves[0].source, editedSource);
  assert.ok(events.indexOf(`save:${quest.id}`) < events.indexOf("run"));
});

test("이전 Quest의 취소된 timer는 다음 Quest 초안을 오염시키지 않는다", (t) => {
  const clock = installFakeBrowserClock(t);
  const firstQuest = createQuest("quest-javascript-one");
  const secondQuest = createQuest("quest-javascript-two");
  const { app, saves } = createAppHarness(firstQuest);

  inputSource(app, "first source");
  app.codeQuestState = createQuestState(secondQuest);
  inputSource(app, "second source");

  assert.deepEqual(saves, [
    {
      questId: firstQuest.id,
      languageId: "javascript",
      source: "first source",
    },
  ]);
  assert.equal(clock.liveTimers.size, 1);

  clock.runEveryScheduledCallback();
  assert.deepEqual(saves, [
    {
      questId: firstQuest.id,
      languageId: "javascript",
      source: "first source",
    },
    {
      questId: secondQuest.id,
      languageId: "javascript",
      source: "second source",
    },
  ]);
});
