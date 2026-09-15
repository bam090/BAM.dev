import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";

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
    revision: 1,
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
  const attempts = [];
  const events = [];
  const app = Object.create(BamLearningApp.prototype);

  Object.assign(app, {
    currentView: "quest",
    currentLesson: null,
    curriculum: null,
    codeQuestCollection: { languageId: "javascript" },
    codeQuestState: createQuestState(quest),
    codeQuestRunner: null,
    executionCoordinator: new ExecutionCoordinator(),
    questRequestSequence: 0,
    progressRepository: {
      saveQuestDraft(draft) {
        saves.push({ ...draft });
        events.push(`save:${draft.questId}`);
      },
      recordQuestAttempt(attempt) {
        attempts.push({ ...attempt });
      },
      getPersistenceStatus() {
        return { isPersistent: true };
      },
    },
    updateCodeQuestDraftFeedback() {},
    syncMenuState() {},
    renderCodeQuest() {
      events.push("render");
    },
  });
  app.questDraftSaveCoordinator = new DraftSaveCoordinator({
    delayMs: 250,
    persist: (pending) => app.persistQuestDraft(pending),
    setTimer: (callback) => app.setQuestDraftSaveTimer(callback),
    clearTimer: (timer) => app.clearQuestDraftSaveTimer(timer),
  });
  return { app, saves, attempts, events };
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

test("Java 실행 준비 중에는 편집·힌트·전체 공개 데이터·초안 저장만 허용한다", async (t) => {
  const clock = installFakeBrowserClock(t);
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
  );
  const quest = collection.quests.find(({ id }) => id === "quest-java-bridge-arr-01");
  const { app, saves, attempts, events } = createAppHarness(quest);
  let runnerCalls = 0;
  app.codeQuestCollection = collection;
  app.javaCodeQuestCapability = { available: false };
  app.codeQuestRunner = {
    async run() {
      runnerCalls += 1;
      throw new Error("비활성 Java runner를 호출하면 안 됩니다.");
    },
  };

  const editedSource = `${quest.starterCode}\n// 저장 가능한 Java 초안`;
  inputSource(app, editedSource);
  app.revealNextCodeQuestHint();
  await app.runCurrentCodeQuest();

  assert.equal(app.codeQuestState.source, editedSource);
  assert.equal(app.codeQuestState.visibleHintCount, 1);
  assert.equal(app.javaCodeQuestCapability.available, false);
  assert.equal(runnerCalls, 0);
  assert.equal(attempts.length, 0);
  assert.equal(app.codeQuestState.report, null);
  assert.equal(app.codeQuestState.isRunning, false);
  assert.match(app.codeQuestState.uiError, /코드는 작성하고 저장할 수 있지만/);
  assert.ok(events.filter((event) => event === "render").length >= 2);

  clock.runLiveTimers();
  assert.deepEqual(saves, [{
    questId: quest.id,
    languageId: "java",
    source: editedSource,
  }]);

  const output = { value: "" };
  const details = {
    open: true,
    dataset: { questTestIndex: "0" },
    closest(selector) { return selector === "[data-quest-public-data]" ? this : null; },
    querySelector(selector) {
      return selector === "[data-quest-public-data-output]" ? output : null;
    },
  };
  app.handleCodeQuestDetailsToggle({ target: details });
  assert.deepEqual(JSON.parse(output.value), {
    args: quest.publicTests[0].args,
    expected: quest.publicTests[0].expected,
    observations: quest.publicTests[0].observations,
  });
  details.open = false;
  app.handleCodeQuestDetailsToggle({ target: details });
  assert.equal(output.value, "");
});

test("큰 Java 공개 데이터 다운로드는 전체 JSON Blob을 만들고 임시 자원을 정리한다", async (t) => {
  const clock = installFakeBrowserClock(t);
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
  );
  const quest = collection.quests.find(({ id }) => id === "quest-java-bridge-que-01");
  const testIndex = quest.publicTests.findIndex(({ args, expected }) =>
    args.some((value) => Array.isArray(value) && value.length > 20)
      || (Array.isArray(expected) && expected.length > 20));
  assert.ok(testIndex >= 0);
  const publicTest = quest.publicTests[testIndex];
  const { app } = createAppHarness(quest);
  const status = { textContent: "" };
  const link = {
    href: "",
    download: "",
    hidden: false,
    clickCount: 0,
    removeCount: 0,
    click() { this.clickCount += 1; },
    remove() { this.removeCount += 1; },
  };
  let appendedLink = null;
  let capturedBlob = null;
  const revokedUrls = [];
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const previousRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName) {
        assert.equal(tagName, "a");
        return link;
      },
      body: { append(candidate) { appendedLink = candidate; } },
    },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value(blob) {
      capturedBlob = blob;
      return "blob:java-public-data";
    },
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value(objectUrl) { revokedUrls.push(objectUrl); },
  });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
    if (previousCreateObjectUrl) Object.defineProperty(URL, "createObjectURL", previousCreateObjectUrl);
    else delete URL.createObjectURL;
    if (previousRevokeObjectUrl) Object.defineProperty(URL, "revokeObjectURL", previousRevokeObjectUrl);
    else delete URL.revokeObjectURL;
  });

  const button = {
    dataset: { questTestIndex: String(testIndex) },
    parentElement: {
      querySelector(selector) {
        return selector === "[data-quest-public-download-status]" ? status : null;
      },
    },
    closest(selector) {
      return selector === "[data-quest-public-download]" ? this : null;
    },
  };
  assert.equal(app.handleCodeQuestClick({ target: button }), true);
  assert.equal(appendedLink, link);
  assert.equal(link.href, "blob:java-public-data");
  assert.equal(link.download, `${quest.id}-${publicTest.id}-public.json`);
  assert.equal(link.hidden, true);
  assert.equal(link.clickCount, 1);
  assert.equal(link.removeCount, 1);
  assert.equal(status.textContent, "전체 공개 JSON 다운로드를 요청했습니다.");
  assert.equal(capturedBlob.type, "application/json");

  const json = await capturedBlob.text();
  assert.ok(json.length > 2_000_000);
  assert.deepEqual(JSON.parse(json), {
    args: publicTest.args,
    expected: publicTest.expected,
    observations: publicTest.observations,
  });
  assert.deepEqual(revokedUrls, []);
  assert.deepEqual(clock.scheduled.map(({ delay }) => delay), [0]);
  clock.runLiveTimers();
  assert.deepEqual(revokedUrls, ["blob:java-public-data"]);
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

test("Code Quest 실행 중 화면을 떠나 취소되면 시도를 저장하거나 렌더하지 않는다", async (t) => {
  installFakeBrowserClock(t);
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/javascript.json", import.meta.url), "utf8"),
  );
  const quest = collection.quests[0];
  const { app, attempts, events } = createAppHarness(quest);
  let resolveReport;
  app.codeQuestCollection = collection;
  app.codeQuestRunner = {
    run(request, { signal }) {
      return new Promise((resolve) => {
        resolveReport = () =>
          resolve({
            requestId: request.requestId,
            contractVersion: request.contractVersion,
            questId: quest.id,
            questRevision: quest.revision,
            languageId: collection.languageId,
            suite: "public",
            outcome: "cancelled",
            tests: [],
            summary: { passed: 0, total: quest.publicTests.length },
            durationMs: 1,
            limitsApplied: {},
            error: null,
          });
        signal.addEventListener("abort", resolveReport, { once: true });
      });
    },
  };

  const run = app.runCurrentCodeQuest();
  app.cancelCodeQuestRun({ disabled: false, textContent: "실행 취소" });
  assert.equal(app.executionCoordinator.active.cancellationReason, "user");
  app.leaveCurrentView();
  assert.equal(app.executionCoordinator.active.cancellationReason, "navigation");
  app.currentView = "lesson";
  app.codeQuestState = null;
  resolveReport();
  await run;

  assert.equal(attempts.length, 0);
  assert.deepEqual(events, ["render"]);
  assert.equal(app.executionCoordinator.active, null);
});

test("현재 Code Quest 화면에서 직접 취소한 결과는 계속 저장하고 표시한다", async (t) => {
  installFakeBrowserClock(t);
  const collection = JSON.parse(
    await readFile(new URL("../content/quests/javascript.json", import.meta.url), "utf8"),
  );
  const quest = collection.quests[0];
  const { app, attempts } = createAppHarness(quest);
  app.codeQuestCollection = collection;
  app.codeQuestRunner = {
    run(request, { signal }) {
      return new Promise((resolve) => {
        signal.addEventListener(
          "abort",
          () =>
            resolve({
              requestId: request.requestId,
              contractVersion: request.contractVersion,
              questId: quest.id,
              questRevision: quest.revision,
              languageId: collection.languageId,
              suite: "public",
              outcome: "cancelled",
              tests: [],
              summary: { passed: 0, total: quest.publicTests.length },
              durationMs: 1,
              limitsApplied: {},
              error: null,
            }),
          { once: true },
        );
      });
    },
  };

  const run = app.runCurrentCodeQuest();
  app.cancelCodeQuestRun({ disabled: false, textContent: "실행 취소" });
  assert.equal(app.executionCoordinator.active.cancellationReason, "user");
  await run;

  assert.equal(attempts.length, 1);
  assert.equal(app.codeQuestState.report.outcome, "cancelled");
  assert.equal(app.codeQuestState.reportPersistenceStatus, "saved");
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
