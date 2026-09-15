import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";
import { LocalStorageWebProjectRepository } from "../src/repositories/web-project-repository.js";

const readJson = async (path) => JSON.parse(
  await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
);

const curriculum = await readJson("content/curriculum.json");
const javascriptQuests = await readJson("content/quests/javascript.json");
const codingTests = await readJson("content/coding-tests/javascript.json");
const webProjects = await readJson("content/web-projects/index.json");

function installBrowser(t, hash) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash },
      history: {
        replaceState(_state, _title, nextHash) {
          globalThis.window.location.hash = nextHash;
        },
      },
      requestAnimationFrame(callback) {
        callback();
      },
      scrollTo() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      title: "",
      activeElement: null,
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
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

function createRoot() {
  const renders = [];
  let markup = "";
  const root = {
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
  Object.defineProperty(root, "innerHTML", {
    get() {
      return markup;
    },
    set(value) {
      markup = value;
      renders.push(value);
    },
  });
  return { root, renders };
}

function createApp() {
  const { root, renders } = createRoot();
  const storage = new MemoryStorage();
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    currentView: "home",
    currentLesson: null,
    currentMarkdown: "",
    renderSequence: 0,
    hasRenderedView: false,
    menuOpen: false,
    quizCollection: null,
    quizCollections: new Map(),
    reviewConcepts: [],
    catalogFilters: {
      learn: { topicId: null, query: "" },
      review: { topicId: null, query: "" },
    },
    codeQuestCollections: new Map([["javascript", javascriptQuests]]),
    codeQuestCollection: javascriptQuests,
    codeQuestCatalogFilters: {
      courseId: "javascript",
      topicId: "all",
      status: "all",
      query: "",
      number: "",
    },
    codeQuestCatalogNotice: "",
    codingTestCollections: new Map([["javascript", codingTests]]),
    codingTestCollection: codingTests,
    codingTestFilters: {
      query: "",
      difficulty: "all",
      language: "all",
      type: "all",
      status: "all",
    },
    pendingCodingTestSearchRender: null,
    codingTestSearchRenderTimer: null,
    webProjectCollection: webProjects,
    progressRepository: new LocalStorageProgressRepository(storage),
    webProjectRepository: new LocalStorageWebProjectRepository(storage),
    themeController: { getState: () => ({ preference: "light", effective: "light" }) },
    leaveCurrentView() {},
    syncMenuState() {},
    finishServiceNavigation() {},
    scheduleWebProjectPreviewSync() {},
  });
  return { app, renders };
}

function assertServiceShell(markup, current, bodyPattern) {
  const sidebar = markup.match(/<aside\b[^>]*>[\s\S]*?<\/aside>/)?.[0] ?? "";
  const navigation = sidebar.match(/<nav\b[^>]*aria-label="서비스 선택"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.equal((navigation.match(/<a\b/g) ?? []).length, 6);
  assert.equal((sidebar.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(navigation, new RegExp(`data-service-link="${current}" aria-current="page"`));
  assert.match(markup, bodyPattern);
}

test("Quest·코딩테스트·Web Project 목록과 상세 route는 로딩부터 최종 본문까지 같은 서비스 셸을 쓴다", async (t) => {
  const quest = javascriptQuests.quests[0];
  const codingTest = codingTests.problems[0];
  const webProject = webProjects.projects[0];
  const cases = [
    { hash: "#/quest", current: "quest", body: /quest-catalog-main/ },
    { hash: `#/quest/javascript/${quest.slug}`, current: "quest", body: new RegExp(quest.title) },
    { hash: "#/coding-tests", current: "coding-test", body: /coding-test-list-main/ },
    { hash: `#/coding-tests/javascript/${codingTest.slug}`, current: "coding-test", body: new RegExp(codingTest.title) },
    { hash: "#/web-projects", current: "web-project", body: /web-project-list-page/ },
    { hash: `#/web-projects/${webProject.slug}`, current: "web-project", body: new RegExp(webProject.title) },
  ];

  installBrowser(t, cases[0].hash);
  for (const { hash, current, body } of cases) {
    window.location.hash = hash;
    const { app, renders } = createApp();

    await app.openRoute();

    assert.ok(renders.length > 0, hash);
    for (const markup of renders) {
      assertServiceShell(markup, current, /id="lesson-content"/);
    }
    assert.match(renders.at(-1), body, hash);
  }
});

test("빈 결과·오류·교안 없는 fallback도 현재 서비스와 본문을 함께 유지한다", async (t) => {
  installBrowser(t, "#/coding-tests");

  const coding = createApp();
  coding.app.codingTestFilters.query = "존재하지않는문제xyz";
  await coding.app.openRoute();
  assertServiceShell(coding.renders.at(-1), "coding-test", /조건에 맞는 문제가 없습니다/);

  window.location.hash = "#/web-projects";
  const fatal = createApp();
  fatal.app.webProjectCollection = null;
  await fatal.app.openRoute();
  assertServiceShell(fatal.renders.at(-1), "web-project", /학습 페이지를 준비하는 중 문제가 생겼습니다/);

  window.location.hash = "#/quest/java/not-available";
  const empty = createApp();
  empty.app.curriculum = {
    categories: [],
    languages: [],
    courses: [],
    lessons: [],
  };
  await empty.app.openRoute();
  assertServiceShell(empty.renders.at(-1), "learn", /아직 학습할 콘텐츠가 없습니다/);
});

test("사이드바 자료의 비동기 준비는 실습 화면을 학습문서로 오인하지 않고 DOM이 없어도 안전하다", async (t) => {
  installBrowser(t, "#/coding-tests");
  const availableCollections = new Map(
    curriculum.languages
      .filter((language) => language.status !== "planned")
      .map((language) => [language.id, { languageId: language.id, questions: [] }]),
  );

  const rendered = createApp();
  const context = { innerHTML: "기존 문맥" };
  rendered.app.currentView = "coding-test";
  rendered.app.reviewConceptsLoaded = true;
  rendered.app.quizCollections = availableCollections;
  rendered.app.root.querySelector = (selector) =>
    selector === "[data-sidebar-context]" ? context : null;

  await rendered.app.loadSidebarCatalog();

  assert.equal(rendered.app.getCurrentService(), "coding-test");
  assert.equal(context.innerHTML, "", "코딩테스트에 학습문서 주제 탐색을 끼워 넣지 않는다.");

  const detached = createApp();
  detached.app.currentView = "web-project";
  detached.app.reviewConceptsLoaded = true;
  detached.app.quizCollections = availableCollections;
  detached.app.root = {};
  await assert.doesNotReject(() => detached.app.loadSidebarCatalog());
  assert.equal(detached.app.getCurrentService(), "web-project");
});
