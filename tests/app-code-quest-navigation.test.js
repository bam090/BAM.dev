import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collections = new Map(
  await Promise.all(
    ["javascript", "html", "css"].map(async (languageId) => [
      languageId,
      JSON.parse(
        await readFile(
          new URL(`../content/quests/${languageId}.json`, import.meta.url),
          "utf8",
        ),
      ),
    ]),
  ),
);

function installBrowser(t, hash = "#/quest") {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const replacements = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash },
      history: {
        replaceState(_state, _title, nextHash) {
          replacements.push(nextHash);
          globalThis.window.location.hash = nextHash;
        },
      },
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
  return replacements;
}

function createCatalogHarness() {
  const calls = { progressReads: 0, renders: 0, finishes: 0, noticeFocus: 0 };
  let number = "";
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    codeQuestCollections: collections,
    currentView: "home",
    codeQuestCatalogFilters: {
      courseId: "missing-course",
      topicId: "missing-topic",
      status: "completed",
      query: "가려진 결과",
      number: "",
    },
    codeQuestCatalogNotice: "",
    progressRepository: {
      getProgress() {
        calls.progressReads += 1;
        return {};
      },
    },
    root: {
      querySelector(selector) {
        if (selector === "[data-quest-number]") return { value: number };
        if (selector === "[data-quest-catalog-notice]") {
          return { focus() { calls.noticeFocus += 1; } };
        }
        return null;
      },
    },
    enterView(view) {
      this.currentView = view;
    },
    renderCodeQuestCatalog() {
      calls.renders += 1;
    },
    finishServiceNavigation() {
      calls.finishes += 1;
    },
  });
  return {
    app,
    calls,
    setNumber(value) {
      number = value;
    },
  };
}

function installHintBrowser(t) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const animationFrames = [];
  const viewport = { x: 0, y: 0 };
  const fakeDocument = { activeElement: null };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      get scrollX() {
        return viewport.x;
      },
      get scrollY() {
        return viewport.y;
      },
      scrollTo({ left = viewport.x, top = viewport.y }) {
        viewport.x = left;
        viewport.y = top;
      },
      requestAnimationFrame(callback) {
        animationFrames.push(callback);
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: fakeDocument,
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  return {
    animationFrames,
    document: fakeDocument,
    getViewport() {
      return { ...viewport };
    },
    setViewport(x, y) {
      viewport.x = x;
      viewport.y = y;
    },
    runNextAnimationFrame() {
      const callback = animationFrames.shift();
      assert.ok(callback, "실행할 animation frame이 있어야 한다");
      callback();
    },
  };
}

function createHintRevealHarness(browser) {
  const focusCalls = [];
  const hints = ["concept", "observation", "implementation"].map((kind) => ({
    kind,
    focus(options) {
      focusCalls.push({ kind, options });
      if (!options?.preventScroll) browser.setViewport(0, 0);
      browser.document.activeElement = this;
    },
  }));
  const report = { passed: false };
  const executionCoordinator = { active: null };
  const progressRepository = {};
  const state = {
    quest: {
      id: "quest-javascript-hint-order",
      hints: hints.map(({ kind }) => ({ kind })),
    },
    source: "function solve(value) { return value; }",
    isRunning: false,
    cancelRequested: false,
    draftStatus: "saved",
    uiError: null,
    report,
    reportPersistenceStatus: "saved",
    visibleHintCount: 0,
  };
  const app = Object.create(BamLearningApp.prototype);
  let renderCount = 0;
  Object.assign(app, {
    currentView: "quest",
    renderSequence: 8,
    codeQuestState: state,
    executionCoordinator,
    progressRepository,
    root: {
      querySelectorAll(selector) {
        assert.equal(selector, "[data-quest-hint]");
        return hints.slice(0, state.visibleHintCount);
      },
    },
    syncMenuState() {},
    renderCodeQuest() {
      renderCount += 1;
      browser.setViewport(0, 0);
    },
  });

  return {
    app,
    executionCoordinator,
    focusCalls,
    getRenderCount: () => renderCount,
    hints,
    progressRepository,
    report,
    state,
  };
}

test("Quest 목록 진입은 첫 실제 과정을 고르고 진도 저장을 쓰지 않는다", (t) => {
  const replacements = installBrowser(t, "#/quest/");
  const { app, calls } = createCatalogHarness();

  app.openCodeQuestCatalogRoute();

  assert.equal(app.currentView, "quest-catalog");
  assert.equal(app.codeQuestCatalogFilters.courseId, "javascript");
  assert.equal(app.codeQuestCatalogFilters.topicId, "all");
  assert.equal(app.codeQuestCatalogFilters.status, "all");
  assert.deepEqual(replacements, ["#/quest"]);
  assert.equal(calls.progressReads, 1);
  assert.equal(calls.renders, 1);
  assert.equal(calls.finishes, 1);
  assert.equal(document.title, "Code Quest · BAM.dev");
});

test("번호 이동은 필터와 무관한 과정 전체 번호를 쓰고 잘못된 입력은 보존한다", (t) => {
  installBrowser(t);
  const { app, calls, setNumber } = createCatalogHarness();
  app.currentView = "quest-catalog";
  app.codeQuestCatalogFilters.courseId = "javascript";

  setNumber("2");
  app.openCodeQuestByNumber();
  assert.equal(window.location.hash, "#/quest/javascript/number-path");
  assert.equal(app.codeQuestCatalogFilters.number, "2");
  assert.equal(app.codeQuestCatalogFilters.topicId, "missing-topic");
  assert.equal(app.codeQuestCatalogFilters.status, "completed");
  assert.equal(app.codeQuestCatalogFilters.query, "가려진 결과");
  assert.equal(calls.renders, 0);

  window.location.hash = "#/quest";
  setNumber("99");
  app.openCodeQuestByNumber();
  assert.equal(window.location.hash, "#/quest");
  assert.equal(app.codeQuestCatalogFilters.number, "99");
  assert.match(app.codeQuestCatalogNotice, /99번 Quest가 없습니다/);
  assert.match(app.codeQuestCatalogNotice, /1부터 9 사이/);
  assert.equal(calls.renders, 1);
  assert.equal(calls.noticeFocus, 1);
});

test("학습 지도 버튼은 상세 URL을 유지하고 inline 지도에 초점과 스크롤을 옮긴다", (t) => {
  installBrowser(t, "#/quest/javascript/delivery-fee-policy");
  const interactions = [];
  const map = {
    focus(options) {
      interactions.push(["focus", options]);
    },
    scrollIntoView(options) {
      interactions.push(["scroll", options]);
    },
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "quest",
    codeQuestState: { quest: { id: "quest-javascript-delivery-fee" } },
    root: {
      querySelector(selector) {
        return selector === "#quest-detail-map" ? map : null;
      },
    },
  });
  const event = {
    target: {
      closest(selector) {
        return selector === "[data-quest-map-focus]" ? this : null;
      },
    },
  };

  assert.equal(app.handleCodeQuestClick(event), true);
  assert.equal(window.location.hash, "#/quest/javascript/delivery-fee-policy");
  assert.deepEqual(interactions, [
    ["focus", { preventScroll: true }],
    ["scroll", { behavior: "instant", block: "start" }],
  ]);
});

test("힌트는 첫째부터 마지막까지 현재 위치를 유지하며 새 항목에 초점을 둔다", (t) => {
  const browser = installHintBrowser(t);
  const harness = createHintRevealHarness(browser);
  const { app, state } = harness;
  const hintButtonEvent = {
    target: {
      closest(selector) {
        return selector === "[data-quest-show-hint]" ? this : null;
      },
    },
  };
  const preservedState = {
    source: state.source,
    isRunning: state.isRunning,
    cancelRequested: state.cancelRequested,
    draftStatus: state.draftStatus,
    uiError: state.uiError,
    report: state.report,
    reportPersistenceStatus: state.reportPersistenceStatus,
    executionCoordinator: app.executionCoordinator,
    progressRepository: app.progressRepository,
  };
  const viewports = [
    { x: 17, y: 480 },
    { x: 29, y: 920 },
    { x: 41, y: 1370 },
  ];

  for (const [index, viewport] of viewports.entries()) {
    browser.setViewport(viewport.x, viewport.y);

    assert.equal(app.handleCodeQuestClick(hintButtonEvent), true);

    assert.equal(state.visibleHintCount, index + 1);
    assert.deepEqual(browser.getViewport(), viewport);
    browser.runNextAnimationFrame();
    assert.deepEqual(browser.getViewport(), viewport);
    assert.equal(browser.document.activeElement, harness.hints[index]);
  }

  assert.deepEqual(
    harness.focusCalls,
    ["concept", "observation", "implementation"].map((kind) => ({
      kind,
      options: { preventScroll: true },
    })),
  );
  assert.equal(harness.getRenderCount(), 3);
  assert.deepEqual(
    {
      source: state.source,
      isRunning: state.isRunning,
      cancelRequested: state.cancelRequested,
      draftStatus: state.draftStatus,
      uiError: state.uiError,
      report: state.report,
      reportPersistenceStatus: state.reportPersistenceStatus,
      executionCoordinator: app.executionCoordinator,
      progressRepository: app.progressRepository,
    },
    preservedState,
  );

  assert.equal(app.handleCodeQuestClick(hintButtonEvent), true);
  assert.equal(state.visibleHintCount, 3);
  assert.equal(harness.getRenderCount(), 3);
  assert.equal(browser.animationFrames.length, 0);
});

test("힌트 공개 뒤 라우트가 바뀌면 이전 animation frame은 위치와 초점을 바꾸지 않는다", (t) => {
  const browser = installHintBrowser(t);
  const harness = createHintRevealHarness(browser);
  const previousState = harness.state;
  const nextViewFocus = { id: "coding-test-list" };
  const hintButtonEvent = {
    target: {
      closest(selector) {
        return selector === "[data-quest-show-hint]" ? this : null;
      },
    },
  };

  browser.setViewport(13, 640);
  assert.equal(harness.app.handleCodeQuestClick(hintButtonEvent), true);
  assert.equal(previousState.visibleHintCount, 1);
  assert.deepEqual(browser.getViewport(), { x: 13, y: 640 });

  harness.app.enterView("coding-test-list");
  browser.setViewport(23, 180);
  browser.document.activeElement = nextViewFocus;
  browser.runNextAnimationFrame();

  assert.equal(harness.app.currentView, "coding-test-list");
  assert.equal(harness.app.codeQuestState, null);
  assert.deepEqual(browser.getViewport(), { x: 23, y: 180 });
  assert.equal(browser.document.activeElement, nextViewFocus);
  assert.deepEqual(harness.focusCalls, []);
});
