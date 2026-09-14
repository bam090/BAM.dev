import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { LocalStorageProgressRepository, MemoryStorage, PROGRESS_STORAGE_KEY } from "../src/repositories/progress-repository.js";
import { LocalStorageReviewSessionRepository, REVIEW_SESSION_STORAGE_KEY } from "../src/repositories/review-session-repository.js";
import { buildReviewLessonHash } from "../src/core/review-navigation.js";

const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
const { concepts } = JSON.parse(await readFile(new URL("../content/review-concepts.json", import.meta.url), "utf8"));
const lesson = curriculum.lessons.find((item) => item.id === "js-notes-functions");
const reviewHash = "#/review/javascript/js-notes-functions?concept=js.function-return";

function browser(t, hash = reviewHash) {
  const scrolls = [];
  const focus = [];
  const values = {
    window: {
      location: { hash }, scrollY: 400,
      history: { replaceState(_state, _title, next) { window.location.hash = next; } },
      requestAnimationFrame(callback) { callback(); },
      scrollTo(options) { scrolls.push(options); },
    },
    document: {
      title: "", activeElement: { id: "quiz-related-concept" },
      querySelector() { return null; }, querySelectorAll() { return []; },
      getElementById(id) { return { focus() { focus.push(id); }, setAttribute() {}, scrollIntoView() {} }; },
    },
    fetch: async (path) => {
      const body = await readFile(new URL(`../${String(path).replace(/^\.\//, "")}`, import.meta.url), "utf8");
      return { ok: true, json: async () => JSON.parse(body), text: async () => body };
    },
  };
  for (const [name, value] of Object.entries(values)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  return { scrolls, focus };
}

function harness(storage = new MemoryStorage()) {
  const app = Object.create(BamLearningApp.prototype);
  const errors = [];
  const announcements = [];
  const reviewSessionRepository = new LocalStorageReviewSessionRepository(storage);
  Object.assign(app, {
    curriculum, root: { innerHTML: "", querySelector() { return null; }, querySelectorAll() { return []; } },
    renderSequence: 0, currentView: "home", reviewSessionRepository,
    savedReviewSession: reviewSessionRepository.read(),
    progressRepository: new LocalStorageProgressRepository(storage, () => new Date("2026-09-12T01:00:00Z")),
    reviewConcepts: concepts, reviewConceptsLoaded: true, quizCollections: new Map(),
    catalogFilters: { learn: { topicId: null, query: "" }, review: { topicId: null, query: "" } },
    syncMenuState() {},
    announce(message) { announcements.push(message); },
    renderFatalError(error) { errors.push(error.message); },
  });
  return { app, storage, errors, announcements };
}

function click(selector, element = {}) {
  return { target: { closest(candidate) { return candidate === selector ? element : null; } }, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
}

async function followService(app, kind) {
  const match = app.root.innerHTML.match(new RegExp(`href="([^"]+)" data-service-link="${kind}"`));
  assert.ok(match, `${kind} 서비스 링크가 있어야 한다.`);
  const href = match[1].replaceAll("&amp;", "&");
  const event = click("[data-service-link]", { dataset: { serviceLink: kind }, getAttribute: () => href });
  app.handleClick(event);
  if (!event.defaultPrevented) window.location.hash = href;
  await app.openRoute();
}

function choose(app, optionId) {
  app.handleChange({ target: { closest(selector) { return selector === "[data-quiz-option]" ? { value: optionId } : null; } } });
}

// 카드마다 다른 DOM 범위를 제공해 첫 카드로 잘못 전달되는 위임 이벤트를 검출한다.
function reviewCards(app, questions = app.quizSession.questions, tops = [40, 360, 680]) {
  const focused = [];
  const cards = questions.map((question, index) => {
    const card = {
      dataset: { quizQuestionId: question.id },
      getBoundingClientRect: () => ({ top: tops[index] }),
      scrollIntoView() {},
      closest(selector) { return selector === "[data-quiz-question-id]" || selector === ".quiz-card" ? card : null; },
    };
    function control(selector, id, properties = {}) {
      const element = {
        id, isConnected: true, ...properties,
        closest(candidate) { return candidate === selector ? element : card.closest(candidate); },
        focus() { document.activeElement = element; focused.push(id); },
        scrollIntoView() {}, setAttribute() {},
      };
      return element;
    }
    card.radios = question.options.map((option, optionIndex) => {
      const optionContainer = { classList: { toggle(_className, selected) { optionContainer.selected = selected; } } };
      const radio = control("[data-quiz-option]", `quiz-option-${question.id}-${optionIndex}`, { value: option.id, optionContainer });
      const closest = radio.closest;
      radio.closest = (selector) => selector === ".quiz-option" ? optionContainer : closest(selector);
      return radio;
    });
    card.controls = new Map([
      ["[data-quiz-check]", control("[data-quiz-check]", `quiz-check-${question.id}`, { disabled: true })],
      ["[data-quiz-feedback-toggle]", control("[data-quiz-feedback-toggle]", `quiz-feedback-toggle-${question.id}`)],
      ["[data-related-concept]", control("[data-related-concept]", `quiz-related-concept-${question.id}`)],
      ["[data-quiz-grade-summary]", control("[data-quiz-grade-summary]", `quiz-answer-summary-${question.id}`)],
      ["[data-quiz-question-title]", control("[data-quiz-question-title]", `quiz-question-title-${question.id}`)],
    ]);
    card.querySelectorAll = (selector) => selector === "[data-quiz-option]" ? card.radios : [];
    card.querySelector = (selector) => card.controls.get(selector) ?? null;
    return card;
  });
  app.root.querySelectorAll = (selector) => selector === "[data-quiz-question-id]" ? cards : selector === "[data-quiz-option]" ? cards.flatMap((card) => card.radios) : [];
  app.root.querySelector = (selector) => {
    const identified = cards.find((card) => selector === `[data-quiz-question-id="${card.dataset.quizQuestionId}"]`);
    if (identified) return identified;
    if (selector === ".quiz-card, .quiz-result-card") return cards[0];
    for (const card of cards) {
      const byId = [...card.controls.values(), ...card.radios].find((element) => selector === `#${element.id}`);
      if (byId) return byId;
    }
    return cards[0]?.querySelector(selector) ?? null;
  };
  return { cards, focused };
}

function chooseCard(app, card, optionId) {
  const input = card.radios.find((radio) => radio.value === optionId);
  assert.ok(input);
  document.activeElement = input;
  app.handleChange({ target: input });
}

function clickCard(app, card, selector) {
  const control = card.querySelector(selector);
  assert.ok(control);
  document.activeElement = control;
  app.handleQuizClick({ target: control, preventDefault() {} });
}

function menuEnvironment(app) {
  const nodes = new Map();
  function element(selector) {
    const attributes = new Map();
    const node = {
      attributes, children: [], visible: true,
      classList: { toggle(name, value) { attributes.set(`class:${name}`, value); } },
      toggleAttribute(name, value) { value ? attributes.set(name, "") : attributes.delete(name); },
      setAttribute(name, value) { attributes.set(name, value); }, removeAttribute(name) { attributes.delete(name); },
      contains(target) { return node === target || node.children.includes(target); },
      matches(candidate) { return candidate === selector; },
      focus() { if (!attributes.has("inert")) document.activeElement = node; },
      getClientRects() { return node.visible ? [{}] : []; },
      addEventListener() {},
    };
    nodes.set(selector, node);
    return node;
  }
  const sidebar = element(".sidebar");
  nodes.set("#course-sidebar", sidebar);
  const brand = element("a[href]");
  const close = element(".sidebar-close");
  const theme = element("[data-theme-choice]");
  const toggle = element("[data-toggle-menu]");
  const main = element(".main-area");
  nodes.set("#lesson-content", main);
  const header = element(".mobile-header");
  header.children = [toggle];
  sidebar.children = [brand, close, theme];
  sidebar.querySelector = (selector) => nodes.get(selector) ?? null;
  sidebar.querySelectorAll = () => sidebar.children;
  const background = [main, header, element(".service-footer"), element(".skip-link")];
  const backdrop = element(".sidebar-backdrop");
  document.body = element("body");
  document.querySelector = (selector) => nodes.get(selector) ?? null;
  const handlers = new Map();
  document.addEventListener = (name, callback) => handlers.set(name, callback);
  window.addEventListener = () => {};
  app.root.addEventListener = () => {};
  app.mobileMedia = { matches: true, addEventListener(_name, callback) { handlers.set("resize", callback); } };
  app.menuOpen = false;
  app.syncMenuState = BamLearningApp.prototype.syncMenuState;
  app.bindGlobalEvents();
  return { sidebar, brand, close, theme, toggle, main, background, backdrop, handlers };
}

test("모바일 서비스 메뉴는 배경과 footer를 잠그고 Tab·닫기·화면 폭 변화 뒤 유효 초점을 유지한다", (t) => {
  browser(t, "#/learn");
  const { app } = harness();
  const menu = menuEnvironment(app);
  app.syncMenuState();
  assert.ok(menu.sidebar.attributes.has("inert"), "처음 닫힌 drawer는 탐색할 수 없다.");
  for (const dismiss of ["Escape", "close", "backdrop", "current-link"]) {
    app.handleClick(click("[data-toggle-menu]"));
    assert.equal(document.activeElement, menu.close);
    assert.equal(menu.toggle.attributes.get("aria-expanded"), "true");
    assert.equal(menu.sidebar.attributes.has("inert"), false);
    assert.ok(menu.background.every((node) => node.attributes.has("inert")));
    assert.equal(document.body.attributes.get("class:menu-open"), true);
    for (const [active, shiftKey, expected] of [[menu.theme, false, menu.brand], [menu.brand, true, menu.theme]]) {
      active.focus();
      let prevented = false;
      menu.handlers.get("keydown")({ key: "Tab", shiftKey, preventDefault() { prevented = true; } });
      assert.equal(prevented, true);
      assert.equal(document.activeElement, expected);
    }
    if (dismiss === "Escape") menu.handlers.get("keydown")({ key: "Escape" });
    else if (dismiss === "current-link") {
      app.handleClick(click("a[href]", { closest: () => menu.sidebar, getAttribute: () => window.location.hash }));
    } else app.handleClick(click("[data-close-menu]", dismiss === "close" ? menu.close : menu.backdrop));
    assert.equal(app.menuOpen, false);
    assert.equal(menu.toggle.attributes.get("aria-expanded"), "false");
    assert.ok(menu.sidebar.attributes.has("inert"));
    assert.ok(menu.background.every((node) => !node.attributes.has("inert")));
    assert.equal(document.body.attributes.get("class:menu-open"), false);
    assert.equal(document.activeElement, dismiss === "current-link" ? menu.main : menu.toggle);
  }
  app.handleClick(click("[data-toggle-menu]"));
  app.mobileMedia.matches = false;
  menu.handlers.get("resize")();
  app.menuOpen = true; // 데스크톱에서 뒤늦게 전달된 열림 값으로 배경을 잠그지 않는다.
  app.syncMenuState();
  assert.equal(app.menuOpen, false);
  assert.equal(document.activeElement, menu.brand);
  assert.equal(menu.sidebar.attributes.has("inert"), false);
  assert.ok(menu.background.every((node) => !node.attributes.has("inert")));
  assert.equal(document.body.attributes.get("class:menu-open"), false);
  app.mobileMedia.matches = true;
  menu.handlers.get("resize")();
  assert.equal(document.activeElement, menu.toggle);
  assert.ok(menu.sidebar.attributes.has("inert"));
});

test("메뉴와 밝기 조작은 선택·채점·해설·저장 기록과 목록 검색 DOM을 교체하지 않는다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
  const menu = menuEnvironment(app);
  const themes = [];
  app.themeController = { setTheme(value) { themes.push(value); } };
  const session = structuredClone(app.quizSession);
  const stored = storage.keys().map((key) => [key, storage.getItem(key)]);
  for (const view of ["review", "learn-catalog"]) {
    if (view === "learn-catalog") {
      app.currentView = view;
      app.catalogFilters.learn = { topicId: "javascript", query: "콜백" };
      app.themeController.getState = () => ({ theme: "dark" });
      app.renderLearningCatalog();
    }
    const markup = app.root.innerHTML;
    Object.defineProperty(app.root, "innerHTML", { configurable: true, get: () => markup, set() { assert.fail("메뉴/theme 조작은 본문 DOM을 교체하면 안 된다."); } });
    app.handleClick(click("[data-toggle-menu]"));
    for (const themeChoice of ["dark", "light"]) app.handleClick(click("[data-theme-choice]", { dataset: { themeChoice } }));
    assert.equal(document.activeElement, menu.close);
    app.handleClick(click("[data-close-menu]"));
    assert.equal(document.activeElement, menu.toggle);
    assert.deepEqual(app.quizSession, session);
    assert.deepEqual(storage.keys().map((key) => [key, storage.getItem(key)]), stored);
    if (view === "learn-catalog") assert.deepEqual(app.catalogFilters.learn, { topicId: "javascript", query: "콜백" });
    Object.defineProperty(app.root, "innerHTML", { configurable: true, writable: true, value: markup });
  }
  assert.deepEqual(themes, ["dark", "light", "dark", "light"]);
});

test("목록 비동기 완료는 열린 메뉴와 새 drawer 내부의 초점을 유지한다", async (t) => {
  browser(t, "#/learn");
  const { app } = harness();
  const menu = menuEnvironment(app);
  let finishLoading;
  app.loadReviewConcepts = () => new Promise((resolve) => { finishLoading = resolve; });
  app.hasRenderedView = true;
  const opening = app.openLearningCatalog("learn");
  assert.match(app.root.innerHTML, /학습자료를 준비하고 있어요/);
  assert.ok(menu.sidebar.attributes.has("inert"));
  app.handleClick(click("[data-toggle-menu]"));
  menu.theme.focus();
  // 실제 innerHTML 교체 뒤에는 이전 drawer의 노드가 새 drawer에 속하지 않는다.
  document.activeElement = { matches: () => false };
  finishLoading();
  await opening;
  assert.equal(app.menuOpen, true);
  assert.match(app.root.innerHTML, /aria-expanded="true"/);
  assert.equal(menu.sidebar.attributes.has("inert"), false);
  assert.ok(menu.background.every((node) => node.attributes.has("inert")));
  assert.equal(document.activeElement, menu.close);
  assert.match(app.root.innerHTML, /키워드 검색/);
});

test("빈 주소와 홈에서 두 서비스에 독립 진입하고 문서를 먼저 열지 않는다", async (t) => {
  browser(t, "");
  const { app, errors } = harness();
  await app.openRoute();
  assert.equal(app.currentView, "home");
  assert.match(app.root.innerHTML, /학습문서 읽기/);
  assert.match(app.root.innerHTML, /객관식 문제 풀기/);
  window.location.hash = "#/review";
  await app.openRoute();
  assert.equal(app.currentView, "review-catalog");
  assert.equal(app.currentLesson, null);
  assert.match(app.root.innerHTML, /키워드 검색/);
  assert.doesNotMatch(app.root.innerHTML, /class="catalog-card"/);
  assert.equal(app.quizCollections.size, 4);
  window.location.hash = "#/learn";
  await app.openRoute();
  assert.equal(app.currentView, "learn-catalog");
  assert.doesNotMatch(app.root.innerHTML, /class="catalog-card"/);
  assert.deepEqual(errors, []);
});

test("탐색 사이드바 검색과 Escape는 풀이 DOM·선택·해설·저장을 유지한다", async (t) => {
  browser(t);
  const { app, storage, errors } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
  await app.loadSidebarCatalog();
  const session = structuredClone(app.quizSession);
  const stored = storage.keys().map((key) => [key, storage.getItem(key)]);
  const handlers = new Map();
  window.addEventListener = () => {};
  document.addEventListener = (name, handler) => handlers.set(name, handler);
  app.root.addEventListener = () => {};
  app.mobileMedia = { matches: false, addEventListener() {} };
  app.bindGlobalEvents();
  const results = { innerHTML: "", hidden: true };
  const input = { value: "", setAttribute() {}, focus() { document.activeElement = input; } };
  app.root.querySelector = (selector) => ({ "#sidebar-search-results": results, "[data-sidebar-search]": input })[selector] ?? null;
  const markup = app.root.innerHTML;
  Object.defineProperty(app.root, "innerHTML", { get: () => markup, set() { assert.fail("검색 입력은 풀이가 있는 본문을 교체하지 않는다."); } });
  input.value = "HTML";
  app.handleInput({ target: { closest: (selector) => selector === "[data-sidebar-search]" ? input : null } });
  assert.equal(results.hidden, false);
  assert.match(results.innerHTML, /href="#\/learn\/html\/wiki-markup"/);
  assert.match(results.innerHTML, /href="#\/review\/html\/html-01-document-structure\?concept=html.semantics"/);
  assert.doesNotMatch(results.innerHTML, /href="#\/learn\/html\/document-structure-and-semantics"/, "보관 문서는 검색 결과에 섞이지 않는다.");
  input.value = "찾을수없는개념xyz";
  app.handleInput({ target: { closest: (selector) => selector === "[data-sidebar-search]" ? input : null } });
  assert.match(results.innerHTML, /검색 결과가 없어요/);
  let prevented = false;
  handlers.get("keydown")({ key: "Escape", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(input.value, "");
  assert.equal(results.hidden, true);
  assert.equal(document.activeElement, input);
  assert.deepEqual(app.quizSession, session);
  assert.deepEqual(storage.keys().map((key) => [key, storage.getItem(key)]), stored);
  assert.deepEqual(errors, []);
});

test("탐색 사이드바는 실제 주제의 가까운 문서와 성공한 최근 방문 두 개만 보여 준다", async (t) => {
  browser(t, "#/learn/html/wiki-document-skeleton");
  const { app, errors } = harness();
  await app.openRoute();
  const nearby = app.root.innerHTML.match(/<nav aria-label="HTML 문서 바로가기">[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.deepEqual([...nearby.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), [
    "#/learn/html/wiki-markup", "#/learn/html/wiki-document-skeleton", "#/learn/html/wiki-semantic-structure",
    "#/learn/html/wiki-links-buttons", "#/learn/html/wiki-image-alternatives",
  ]);
  assert.match(nearby, /href="#\/learn\/html\/wiki-document-skeleton" aria-current="page"/);
  for (const slug of ["wiki-markup", "wiki-semantic-structure", "wiki-document-skeleton"]) {
    window.location.hash = `#/learn/html/${slug}`;
    await app.openRoute();
  }
  const recent = app.root.innerHTML.match(/<nav aria-label="최근 본 문서">[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.deepEqual([...recent.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), [
    "#/learn/html/wiki-document-skeleton", "#/learn/html/wiki-semantic-structure",
  ]);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (path) => String(path).endsWith("/wiki-markup.md")
    ? Promise.resolve({ ok: false, status: 503 }) : originalFetch(path);
  window.location.hash = "#/learn/html/wiki-markup";
  await app.openRoute();
  globalThis.fetch = originalFetch;
  assert.deepEqual(app.getServiceSidebar("learn").recent.map((item) => item.href), [
    "#/learn/html/wiki-document-skeleton", "#/learn/html/wiki-semantic-structure",
  ], "불러오기 실패를 최근 방문으로 기록하지 않는다.");
  assert.deepEqual(errors, ["교안 본문을 불러오지 못했습니다. (503)"]);
  app.handleClick(click("[data-sidebar-catalog]", { dataset: { sidebarCatalog: "learn" } }));
  await app.openRoute();
  assert.equal(window.location.hash, "#/learn");
  assert.match(app.root.innerHTML, /HTML · 15개 문서/);
  app.handleChange({ target: { closest: (selector) => selector === "[data-sidebar-topic]" ? { value: "css" } : null } });
  const main = app.root.innerHTML.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
  assert.deepEqual(app.catalogFilters.learn, { topicId: "css", query: "" });
  assert.deepEqual(app.catalogFilters.review, { topicId: null, query: "" });
  assert.match(main, /class="catalog-card" href="#\/learn\/css\//);
  assert.doesNotMatch(main, /class="catalog-card" href="#\/learn\/html\//);
  assert.deepEqual(app.progressRepository.getProgress().completedLessonIds, []);
  assert.deepEqual(app.progressRepository.getProgress().quizAttempts, []);
});

test("탐색 사이드바 객관식 전환은 읽던 문서·목록의 주제를 선택하고 이전 검색을 비운다", async (t) => {
  browser(t);
  for (const [topicId, documentHash, hasPreviousReview] of [
    ["html", null, false],
    ["html", "#/learn/html/wiki-document-skeleton", true],
    ["css", "#/learn/css/wiki-css-basics", true],
    ["html", null, true],
  ]) {
    const { app, errors } = harness();
    app.mobileMedia = { matches: false };
    if (hasPreviousReview) {
      window.location.hash = "#/review/css/css-foundations-selectors?concept=css.selectors";
      await app.openRoute();
      app.catalogFilters.review.query = "이전 검색어";
    }
    window.location.hash = "#/";
    await app.openRoute();
    await followService(app, "learn");
    app.handleClick(click("[data-catalog-topic]", { dataset: { catalogTopic: topicId }, disabled: false }));
    if (documentHash) {
      assert.ok(app.root.innerHTML.includes(`class="catalog-card" href="${documentHash}"`));
      window.location.hash = documentHash;
      await app.openRoute();
    }
    if (!hasPreviousReview) assert.equal(app.quizCollections.size, 0, "첫 객관식 진입은 문제 목록을 미리 불러오지 않아도 된다.");
    await followService(app, "review");
    assert.equal(window.location.hash, "#/review", "과거 CSS 풀이가 아닌 현재 학습 주제의 목록을 연다.");
    assert.equal(app.currentView, "review-catalog");
    assert.deepEqual(app.catalogFilters.review, { topicId, query: "" });
    assert.match(app.root.innerHTML, new RegExp(`<option value="${topicId}" selected>`));
    assert.match(app.root.innerHTML, new RegExp(`data-catalog-topic="${topicId}" aria-pressed="true"`));
    const cards = [...app.root.innerHTML.matchAll(/class="catalog-card" href="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(cards.length > 0);
    assert.ok(cards.every((href) => new RegExp(`^#/review/${topicId}(?:/|\\?)`).test(href)), "선택 주제의 실제 문제 묶음만 보여 준다.");
    assert.deepEqual(errors, []);
  }
});

test("탐색 사이드바 객관식 전환은 주제 미선택·전체·홈에서 기존 풀이 복귀를 유지한다", async (t) => {
  browser(t);
  const previousHash = "#/review/css/css-foundations-selectors?concept=css.selectors";
  for (const destination of [null, "all", "home"]) {
    const { app, errors } = harness();
    app.mobileMedia = { matches: false };
    window.location.hash = previousHash;
    await app.openRoute();
    window.location.hash = destination === "home" ? "#/" : "#/learn";
    await app.openRoute();
    if (destination === "all") app.handleClick(click("[data-catalog-topic]", { dataset: { catalogTopic: "all" }, disabled: false }));
    await followService(app, "review");
    assert.equal(window.location.hash, previousHash);
    assert.equal(app.currentView, "review");
    assert.deepEqual(errors, []);
  }
});

test("탐색 사이드바 서비스 왕복은 유효 문제 토큰·주제·문서 답과 읽던 위치를 복원한다", async (t) => {
  const hash = "#/review/html/html-01-document-structure?concept=html.semantics";
  const { scrolls } = browser(t, hash);
  const { app, errors } = harness();
  app.mobileMedia = { matches: false };
  await app.openRoute();
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
  const question = app.getCurrentQuizQuestion();
  const sessionId = app.quizSession.id;
  const documentLesson = curriculum.lessons.find((item) => item.id === "html-notes-semantic-structure");
  app.quizSession.returnContext = { token: "sidebar-return", sessionId, questionId: question.id, lessonId: documentLesson.id };
  app.saveReviewSession({ captureViewport: true });
  const documentHash = buildReviewLessonHash(documentLesson, "sidebar-return", "요구사항에서 구조를 찾는 순서");
  window.location.hash = documentHash;
  await app.openRoute();
  assert.match(app.root.innerHTML, /data-review-return/);
  const answer = { open: true };
  app.root.querySelector = (selector) => selector === "#lesson-answer" ? answer : null;
  window.scrollY = 980;
  await followService(app, "review");
  assert.equal(window.location.hash, hash);
  assert.equal(app.quizSession.id, sessionId);
  assert.equal(app.quizSession.selectedOptionIds.get(question.id), "b");
  assert.equal(app.quizSession.gradedAnswers.has(question.id), true);
  assert.equal(app.quizSession.expandedQuestionIds.has(question.id), true);
  answer.open = false; // 새 문서 DOM은 닫힌 상태로 렌더링된다.
  await followService(app, "learn");
  assert.equal(window.location.hash, documentHash, "서비스 복귀는 review·section query를 잘라내지 않는다.");
  assert.equal(app.currentLesson.id, documentLesson.id);
  assert.deepEqual(app.catalogFilters, { learn: { topicId: "html", query: "" }, review: { topicId: "html", query: "" } });
  assert.equal(answer.open, true);
  assert.equal(scrolls.at(-1).top, 980, "section이 있는 문서도 서비스 복귀 때는 읽던 위치를 복원한다.");
  assert.match(app.root.innerHTML, /data-review-return/);
  const recent = app.root.innerHTML.match(/<nav aria-label="최근 본 문서">[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(recent, /href="#\/learn\/html\/wiki-semantic-structure"/);
  assert.doesNotMatch(recent, /\?review=/, "일반 최근 문서 링크는 문제 경유 토큰을 전달하지 않는다.");
  assert.deepEqual(app.progressRepository.getProgress().quizAttempts, []);
  assert.deepEqual(errors, []);
});

test("문서와 문제에서 검색·주제 선택·초기화가 동작하고 두 서비스의 선택을 분리한다", async (t) => {
  browser(t, "#/learn");
  const { app, errors } = harness();
  let focused = 0;
  const input = { value: "", selectionStart: 0, focus() { focused += 1; }, setSelectionRange() {} };
  app.root.querySelector = (selector) => selector === "[data-catalog-search]" ? input : null;
  for (const kind of ["learn", "review"]) {
    await app.openLearningCatalog(kind);
    assert.deepEqual(app.catalogFilters[kind], { topicId: null, query: "" });
    assert.doesNotMatch(app.root.innerHTML, /class="catalog-card"/);
    input.value = "콜백";
    input.selectionStart = 2;
    app.handleInput({ target: { closest: (selector) => selector === "[data-catalog-search]" ? input : null } });
    assert.deepEqual(app.catalogFilters[kind], { topicId: null, query: "콜백" });
    assert.match(app.root.innerHTML, /class="catalog-card"/);
    app.handleClick(click("[data-catalog-topic]", { dataset: { catalogTopic: "html" }, disabled: false }));
    assert.deepEqual(app.catalogFilters[kind], { topicId: "html", query: "콜백" });
    assert.match(app.root.innerHTML, /검색 결과가 없어요/);
    assert.doesNotMatch(app.root.innerHTML, /class="catalog-card"/);
    app.handleClick(click("[data-catalog-reset]"));
    assert.deepEqual(app.catalogFilters[kind], { topicId: null, query: "" });
    assert.match(app.root.innerHTML, /주제를 선택해 주세요/);
    assert.doesNotMatch(app.root.innerHTML, /class="catalog-card"/);
    input.value = "";
    app.handleClick(click("[data-catalog-topic]", { dataset: { catalogTopic: "javascript" }, disabled: false }));
    assert.deepEqual(app.catalogFilters[kind], { topicId: "javascript", query: "" });
    assert.match(app.root.innerHTML, /class="catalog-card"/);
  }
  assert.deepEqual(app.catalogFilters.learn, { topicId: "javascript", query: "" });
  assert.ok(focused >= 4, "검색과 초기화 이후 검색 입력 초점을 유지한다.");
  assert.deepEqual(errors, []);
});

test("현재 키워드의 여러 문항만 열고 선택·채점·해설·다음 문제를 새 인스턴스에 복원한다", async (t) => {
  const { scrolls, focus } = browser(t);
  const { app, storage, errors } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  assert.equal(app.quizSession.questions.length, 3);
  assert.ok(app.quizSession.questions.every((question) => question.conceptId === "js.function-return"));
  const first = app.getCurrentQuizQuestion();
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
  app.showNextQuizQuestion();
  const second = app.getCurrentQuizQuestion();
  choose(app, "c");
  app.saveReviewSession({ captureViewport: true });
  const savedId = app.quizSession.id;
  const restored = harness(storage).app;
  await restored.openReviewRoute("javascript", lesson.id);
  assert.equal(restored.quizSession.id, savedId);
  assert.equal(restored.quizSession.currentIndex, 1);
  assert.equal(restored.quizSession.selectedOptionIds.get(second.id), "c");
  assert.equal(restored.quizSession.gradedAnswers.has(second.id), false);
  assert.equal(restored.quizSession.gradedAnswers.has(first.id), true);
  assert.equal(restored.quizSession.expandedQuestionIds.has(first.id), true);
  assert.equal(scrolls.at(-1).top, 400);
  assert.equal(focus.at(-1), "quiz-related-concept");
  assert.equal(restored.progressRepository.getProgress().quizAttempts.length, 0);
  assert.deepEqual(errors, []);
});

test("전부 보기의 비연속 선택은 해당 카드만 바꾸고 전체 채점은 미응답·기채점을 제외한다", async (t) => {
  const { focus } = browser(t);
  const { app, storage, announcements, errors } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  const { cards } = reviewCards(app);
  const batchFocus = [];
  const batchScrolls = [];
  const batchStatuses = ["quiz-batch-status", "quiz-batch-status-end"].map((id) => ({
    id, textContent: "",
    focus() { document.activeElement = this; batchFocus.push(id); },
    scrollIntoView(options) { batchScrolls.push({ id, ...options }); },
  }));
  const findCardElement = app.root.querySelector;
  const findCardElements = app.root.querySelectorAll;
  app.root.querySelector = (selector) => batchStatuses.find(({ id }) => selector === `#${id}`) ?? findCardElement(selector);
  app.root.querySelectorAll = (selector) => selector === "[data-quiz-batch-status]" ? batchStatuses : findCardElements(selector);
  const [first, second, third] = app.quizSession.questions;
  assert.deepEqual([first.id, second.id, third.id], [
    "quiz-javascript-notes-return-value", "quiz-javascript-notes-early-return", "quiz-javascript-notes-arrow-block-return",
  ]);
  const id = app.quizSession.id;
  app.handleQuizClick(click("[data-quiz-view-mode]", { dataset: { quizViewMode: "all" } }));
  app.handleQuizClick(click("[data-quiz-grading-mode]", { dataset: { quizGradingMode: "batch" } }));
  assert.equal(app.quizSession.viewMode, "all");
  assert.equal(app.quizSession.gradingMode, "batch");
  app.gradePendingQuizQuestions();
  assert.equal(app.quizSession.gradedAnswers.size, 0, "미응답은 오답 또는 모름으로 제출하지 않는다.");
  assert.match(announcements.at(-1), /새로 채점할 답이 없습니다\. 미응답 3개 남음/);
  app.setQuizGradingMode("individual");
  chooseCard(app, cards[0], "b");
  chooseCard(app, cards[2], "a");
  assert.equal(app.quizSession.currentIndex, 2);
  assert.deepEqual([...app.quizSession.selectedOptionIds], [[first.id, "b"], [third.id, "a"]]);
  assert.equal(cards[0].controls.get("[data-quiz-check]").disabled, false);
  assert.equal(cards[1].controls.get("[data-quiz-check]").disabled, true);
  assert.deepEqual(cards[0].radios.filter((input) => input.optionContainer.selected).map(({ value }) => value), ["b"]);
  assert.deepEqual(cards[2].radios.filter((input) => input.optionContainer.selected).map(({ value }) => value), ["a"]);
  app.setQuizGradingMode("batch");
  document.activeElement = { id: "quiz-check-all-end" };
  const announcementsBeforeGrading = announcements.length;
  app.handleQuizClick(click("[data-quiz-check-all]"));
  assert.deepEqual([...app.quizSession.gradedAnswers.keys()], [first.id, third.id]);
  assert.equal(app.quizSession.gradedAnswers.get(first.id).isCorrect, true);
  assert.equal(app.quizSession.gradedAnswers.get(third.id).isCorrect, false);
  assert.equal(app.quizSession.selectedOptionIds.has(second.id), false);
  assert.equal(app.quizSession.screen, "question");
  assert.equal(app.quizSession.recordAttempted, false);
  for (const status of batchStatuses) {
    assert.match(status.textContent, /^2개 채점, 미응답 1개 남음\./);
    const tag = app.root.innerHTML.match(new RegExp(`<p id="${status.id}"[^>]*>`))?.[0];
    assert.ok(tag);
    assert.doesNotMatch(tag, /role="status"|aria-live=/, "성공 안내는 초점 이동과 live 방송을 중복하지 않는다.");
  }
  assert.equal(announcements.length, announcementsBeforeGrading, "성공 결과를 announcer로 다시 방송하지 않는다.");
  assert.deepEqual(batchFocus, ["quiz-batch-status-end"], "하단에서 채점하면 동작한 위치의 결과 안내로 한 번 초점을 옮긴다.");
  assert.deepEqual(batchScrolls, [{ id: "quiz-batch-status-end", behavior: "instant", block: "nearest" }]);
  const firstGrade = app.quizSession.gradedAnswers.get(first.id);
  const thirdGrade = app.quizSession.gradedAnswers.get(third.id);
  app.gradePendingQuizQuestions();
  assert.equal(app.quizSession.gradedAnswers.get(first.id), firstGrade, "반복 전체 채점은 이미 채점한 결과를 다시 생성하지 않는다.");
  assert.equal(app.quizSession.gradedAnswers.get(third.id), thirdGrade);
  app.finishQuizSession();
  assert.equal(app.quizSession.screen, "question");
  assert.equal(app.progressRepository.getProgress().quizAttempts.length, 0);
  clickCard(app, cards[2], "[data-quiz-feedback-toggle]");
  const state = {
    selected: [...app.quizSession.selectedOptionIds], graded: [...app.quizSession.gradedAnswers],
    expanded: [...app.quizSession.expandedQuestionIds], signature: app.savedReviewSession.contentSignature,
  };
  for (const [viewMode, gradingMode] of [["single", "batch"], ["single", "individual"], ["all", "individual"], ["all", "batch"]]) {
    app.setQuizViewMode(viewMode);
    app.setQuizGradingMode(gradingMode);
    assert.equal(app.quizSession.id, id);
    assert.equal(app.quizSession.mode, "all", "기존 문항 범위를 보기 방식으로 오해하지 않는다.");
    assert.equal(app.quizSession.currentIndex, 2);
    assert.deepEqual([...app.quizSession.selectedOptionIds], state.selected);
    assert.deepEqual([...app.quizSession.gradedAnswers], state.graded);
    assert.deepEqual([...app.quizSession.expandedQuestionIds], state.expanded);
    assert.equal(app.savedReviewSession.contentSignature, state.signature);
    assert.equal(app.quizSession.recordAttempted, false);
    assert.equal(focus.at(-1), cards[2].controls.get("[data-quiz-feedback-toggle]").id);
  }
  app.setQuizGradingMode("individual");
  chooseCard(app, cards[1], "c");
  clickCard(app, cards[1], "[data-quiz-check]");
  assert.equal(app.quizSession.gradedAnswers.size, 3);
  assert.equal(app.quizSession.screen, "question", "마지막 채점 자체는 완료 기록이 아니다.");
  assert.equal(app.progressRepository.getProgress().quizAttempts.length, 0);
  app.handleQuizClick(click("[data-quiz-finish]"));
  app.handleQuizClick(click("[data-quiz-finish]"));
  app.finishQuizSession();
  assert.equal(app.quizSession.screen, "result");
  assert.equal(app.quizSession.summary.correct, 2);
  assert.equal(app.quizSession.summary.total, 3);
  assert.equal(app.progressRepository.getProgress().quizAttempts.length, 1);
  const restored = harness(storage).app;
  await restored.openReviewRoute("javascript", lesson.id);
  assert.equal(restored.quizSession.viewMode, "all");
  assert.equal(restored.quizSession.gradingMode, "individual");
  assert.equal(restored.quizSession.screen, "result");
  assert.equal(restored.progressRepository.getProgress().quizAttempts.length, 1);
  assert.deepEqual(errors, []);
});

test("하나씩 전체 채점은 미채점 문항을 이동하지만 마지막 미응답 상태에서 결과를 기록하지 않는다", async (t) => {
  browser(t);
  const { app } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  assert.equal(app.quizSession.viewMode, "single");
  assert.equal(app.quizSession.gradingMode, "individual");
  app.showNextQuizQuestion();
  assert.equal(app.quizSession.currentIndex, 0, "기본 개별 채점은 기존 다음 문제 조건을 유지한다.");
  app.setQuizGradingMode("batch");
  choose(app, "b");
  app.showNextQuizQuestion();
  assert.equal(app.quizSession.currentIndex, 1);
  app.showNextQuizQuestion();
  assert.equal(app.quizSession.currentIndex, 2);
  app.showNextQuizQuestion();
  assert.equal(app.quizSession.screen, "question");
  assert.equal(app.quizSession.recordAttempted, false);
  app.gradePendingQuizQuestions();
  assert.equal(app.quizSession.gradedAnswers.size, 1);
  app.showNextQuizQuestion();
  assert.equal(app.quizSession.currentIndex, 2);
  assert.equal(app.quizSession.screen, "question");
  assert.equal(app.progressRepository.getProgress().quizAttempts.length, 0);
  app.showPreviousQuizQuestion();
  assert.equal(app.quizSession.currentIndex, 1);
});

test("이전 고정 초점 ID는 현재 카드에 연결하고 잠긴 라디오에는 초점을 잃지 않는다", async (t) => {
  browser(t);
  const { app } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  const { cards, focused } = reviewCards(app);
  app.quizSession.currentIndex = 1;
  document.getElementById = () => null; // 새 DOM에는 이전 버전의 고정 ID가 없다.
  app.quizSession.viewport = { anchor: app.getCurrentQuizQuestion().id, offset: 360, scrollY: 400, focusId: "quiz-option-1" };
  app.restoreReviewViewport();
  assert.equal(document.activeElement, cards[1].radios[1]);
  cards[1].radios[1].disabled = true;
  app.restoreReviewViewport();
  assert.equal(document.activeElement, cards[1].controls.get("[data-quiz-question-title]"));
  assert.equal(focused.at(-1), `quiz-question-title-${app.getCurrentQuizQuestion().id}`);
  app.quizSession.viewport.focusId = "quiz-related-concept";
  app.restoreReviewViewport();
  assert.equal(document.activeElement, cards[1].controls.get("[data-related-concept]"));
});

test("전부 보기 두 번째 카드의 개념·문서는 해당 문항·펼침·위치·초점으로 새로고침 후 돌아온다", async (t) => {
  const hash = "#/review/javascript";
  const { scrolls, focus } = browser(t, hash);
  const fullCollection = JSON.parse(await readFile(new URL("../content/quizzes/javascript.json", import.meta.url), "utf8"));
  const questionIds = ["quiz-javascript-notes-return-value", "quiz-javascript-notes-const-property", "quiz-javascript-notes-arrow-block-return"];
  const collection = { ...fullCollection, questions: questionIds.map((id) => fullCollection.questions.find((question) => question.id === id)) };
  const fetchActualFile = globalThis.fetch;
  globalThis.fetch = async (path) => path === "./content/quizzes/javascript.json"
    ? { ok: true, json: async () => collection }
    : fetchActualFile(path);
  const { app, storage, errors } = harness();
  await app.openReviewRoute("javascript");
  assert.deepEqual(app.quizSession.questions.map(({ id }) => id), questionIds);
  const { cards } = reviewCards(app);
  app.setQuizViewMode("all");
  app.setQuizGradingMode("batch");
  chooseCard(app, cards[1], "a");
  app.setQuizGradingMode("individual");
  clickCard(app, cards[1], "[data-quiz-check]");
  clickCard(app, cards[1], "[data-quiz-feedback-toggle]");
  assert.deepEqual([...app.quizSession.expandedQuestionIds], [questionIds[1]]);
  assert.deepEqual([...app.quizSession.gradedAnswers.keys()], [questionIds[1]]);
  const sessionId = app.quizSession.id;
  const handlers = new Map();
  const dialog = {
    setAttribute() {}, addEventListener(name, handler) { handlers.set(name, handler); },
    querySelector() { return { focus() {} }; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, right: 100, top: 0, bottom: 100 }; },
    showModal() {}, remove() {},
  };
  document.createElement = () => dialog;
  document.body = { classList: { add() {}, remove() {} } };
  app.root.append = () => {};
  clickCard(app, cards[1], "[data-related-concept]");
  assert.match(dialog.innerHTML, /href="#\/learn\/javascript\/wiki-variables"/);
  assert.doesNotMatch(dialog.innerHTML, /href="#\/learn\/javascript\/wiki-function-return"/);
  handlers.get("click")(click("[data-concept-document]"));
  assert.equal(app.quizSession.returnContext.questionId, questionIds[1]);
  assert.equal(app.quizSession.viewport.anchor, questionIds[1]);
  assert.equal(app.quizSession.viewport.offset, 360, "문서 이동 기준은 첫 카드가 아닌 두 번째 카드다.");
  const conceptFocusId = cards[1].controls.get("[data-related-concept]").id;
  assert.equal(app.quizSession.viewport.focusId, conceptFocusId);
  const documentHash = window.location.hash;
  await app.openRoute();
  assert.equal(app.currentLesson.id, "js-concept-variables");
  assert.match(app.root.innerHTML, /data-review-return/);
  const restored = harness(storage).app;
  await restored.openLessonRoute();
  assert.equal(window.location.hash, documentHash);
  assert.match(restored.root.innerHTML, /data-review-return/);
  restored.handleClick(click("[data-review-return]"));
  assert.equal(window.location.hash, hash);
  reviewCards(restored, collection.questions, [70, 860, 1200]);
  await restored.openRoute();
  assert.equal(restored.quizSession.id, sessionId);
  assert.equal(restored.quizSession.currentIndex, 1);
  assert.equal(restored.quizSession.viewMode, "all");
  assert.equal(restored.quizSession.gradingMode, "individual");
  assert.deepEqual([...restored.quizSession.selectedOptionIds], [[questionIds[1], "a"]]);
  assert.deepEqual([...restored.quizSession.gradedAnswers.keys()], [questionIds[1]]);
  assert.deepEqual([...restored.quizSession.expandedQuestionIds], [questionIds[1]]);
  assert.equal(scrolls.at(-1).top, 900, "두 번째 카드의 새 위치에서 저장된 상대 위치를 복구한다.");
  assert.equal(focus.at(-1), conceptFocusId);
  assert.equal(restored.progressRepository.getProgress().quizAttempts.length, 0);
  window.location.hash = "#/learn/javascript/wiki-variables";
  await restored.openRoute();
  assert.doesNotMatch(restored.root.innerHTML, /data-review-return/);
  assert.deepEqual(errors, []);
});

test("문제 경유 토큰으로 문서에 들어온 경우에만 복귀하고 같은 세션을 이어 푼다", async (t) => {
  const { focus } = browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  choose(app, "b");
  const question = app.getCurrentQuizQuestion();
  app.quizSession.returnContext = { token: "return-one", sessionId: app.quizSession.id, questionId: question.id, lessonId: lesson.id };
  app.saveReviewSession({ captureViewport: true });
  const sessionId = app.quizSession.id;
  window.location.hash = buildReviewLessonHash(lesson, "return-one", "반환값은 호출한 곳으로 돌아간다");
  document.activeElement = { id: "" }; // 모달 링크를 누르고 닫힌 뒤의 전환 초점은 풀이 복귀 초점이 아니다.
  await app.openRoute();
  const reloaded = harness(storage).app;
  await reloaded.openLessonRoute();
  assert.equal(reloaded.currentLesson.id, lesson.id);
  assert.match(reloaded.root.innerHTML, /data-review-return/);
  reloaded.handleClick(click("[data-review-return]"));
  assert.equal(window.location.hash, reviewHash);
  await reloaded.openRoute();
  assert.equal(reloaded.quizSession.id, sessionId);
  assert.equal(reloaded.quizSession.selectedOptionIds.get(question.id), "b");
  assert.equal(reloaded.quizSession.gradedAnswers.size, 0);
  assert.equal(focus.at(-1), "quiz-related-concept");
});

test("직접 문서·다른 토큰·타문서·없는 문제에는 가짜 복귀 버튼이 없다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  app.quizSession.returnContext = { token: "return-one", sessionId: app.quizSession.id, questionId: app.getCurrentQuizQuestion().id, lessonId: lesson.id };
  app.saveReviewSession();
  const otherLesson = curriculum.lessons.find((item) => item.id === "js-notes-values");
  for (const hash of [
    "#/learn/javascript-notes/functions",
    buildReviewLessonHash(lesson, "wrong-token"),
    buildReviewLessonHash(otherLesson, "return-one"),
    "#/learn/javascript-notes/missing?review=return-one",
  ]) {
    window.location.hash = hash;
    const restored = harness(storage).app;
    await restored.openLessonRoute();
    assert.equal(restored.lessonReviewReturn, null, hash);
    assert.doesNotMatch(restored.root.innerHTML, /data-review-return/, hash);
  }
  const saved = app.savedReviewSession;
  saved.returnContext.questionId = "missing";
  app.reviewSessionRepository.save(saved);
  window.location.hash = buildReviewLessonHash(lesson, "return-one");
  const restored = harness(storage).app;
  await restored.openLessonRoute();
  assert.equal(restored.lessonReviewReturn, null);
  assert.match(restored.root.innerHTML, /풀이를 복원할 수 없습니다/);
});

test("완료 후 재실행과 결과 재확인으로 완료 기록을 중복 저장하지 않는다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  app.progressRepository.setLessonCompleted("js-notes-values", true);
  await app.openReviewRoute("javascript", lesson.id);
  while (app.quizSession.screen === "question") {
    choose(app, "a"); app.gradeCurrentQuizQuestion(); app.showNextQuizQuestion();
  }
  const score = app.quizSession.summary.correct;
  assert.equal(app.progressRepository.getProgress().quizAttempts.length, 1);
  const restored = harness(storage).app;
  await restored.openReviewRoute("javascript", lesson.id);
  restored.finishQuizSession();
  assert.equal(restored.quizSession.screen, "result");
  assert.equal(restored.quizSession.summary.correct, score);
  assert.equal(restored.progressRepository.getProgress().quizAttempts.length, 1);
  assert.deepEqual(restored.progressRepository.getProgress().completedLessonIds, ["js-notes-values"]);
});

test("변경된 콘텐츠나 깨진 JSON은 기존 저장을 유지하고 사용자가 새 시작을 고른 뒤에만 교체한다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  choose(app, "b");
  const changed = { ...app.savedReviewSession, contentSignature: "old content" };
  for (const raw of [JSON.stringify({ schemaVersion: 1, activeSession: changed }), "{broken"]) {
    storage.setItem(REVIEW_SESSION_STORAGE_KEY, raw);
    const restored = harness(storage).app;
    await restored.openReviewRoute("javascript", lesson.id);
    assert.equal(restored.reviewNeedsRestart, true);
    assert.match(restored.root.innerHTML, /data-review-start-new/);
    assert.doesNotMatch(restored.root.innerHTML, /data-quiz-option/);
    assert.equal(storage.getItem(REVIEW_SESSION_STORAGE_KEY), raw);
    restored.handleClick(click("[data-review-start-new]"));
    assert.equal(restored.reviewNeedsRestart, false);
    assert.match(restored.root.innerHTML, /data-quiz-option/);
    assert.notEqual(storage.getItem(REVIEW_SESSION_STORAGE_KEY), raw);
  }
});

test("공유 키워드에 새 문항이 추가되면 안내 후 사용자가 새로 시작할 때만 풀이를 교체한다", async (t) => {
  browser(t, "#/review/javascript?concept=js.variables");
  const currentFetch = globalThis.fetch;
  const previous = JSON.parse(await readFile(new URL("../content/quizzes/javascript.json", import.meta.url), "utf8"));
  previous.questions = previous.questions.filter((question) => !question.lessonId.startsWith("js-concept-"));
  globalThis.fetch = async (path) => String(path).endsWith("content/quizzes/javascript.json")
    ? { ok: true, json: async () => structuredClone(previous) } : currentFetch(path);
  const { app, storage, errors } = harness();
  app.progressRepository.setLessonCompleted("js-notes-values", true);
  await app.openRoute();
  assert.equal(app.quizSession.questions.length, 1);
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  const saved = storage.getItem(REVIEW_SESSION_STORAGE_KEY);
  const progress = storage.getItem(PROGRESS_STORAGE_KEY);
  const signature = app.savedReviewSession.contentSignature;
  globalThis.fetch = currentFetch;
  const restored = harness(storage).app;
  await restored.openRoute();
  assert.equal(restored.reviewNeedsRestart, true);
  assert.match(restored.root.innerHTML, /role="status"/);
  assert.match(restored.root.innerHTML, /data-review-start-new/);
  assert.doesNotMatch(restored.root.innerHTML, /data-quiz-option/);
  assert.equal(storage.getItem(REVIEW_SESSION_STORAGE_KEY), saved);
  restored.handleClick(click("[data-review-start-new]"));
  assert.equal(restored.reviewNeedsRestart, false);
  assert.equal(restored.quizSession.questions.length, 2);
  assert.notEqual(restored.savedReviewSession.contentSignature, signature);
  assert.equal(restored.quizSession.selectedOptionIds.size, 0);
  assert.equal(restored.quizSession.gradedAnswers.size, 0);
  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), progress);
  assert.deepEqual(errors, []);
});

test("CSS Flexbox의 글쓰기 조건 보완은 해당 풀이만 새 시작을 요구하고 미변경 문항·완료 기록을 보존한다", async (t) => {
  browser(t);
  const currentFetch = globalThis.fetch;
  const previousCollection = JSON.parse(await readFile(new URL("../content/quizzes/css.json", import.meta.url), "utf8"));
  const flex = previousCollection.questions.find((question) => question.id === "quiz-css-flex-axis");
  const condition = /\n[ \t]+writing-mode: horizontal-tb;/;
  assert.match(flex.code, condition, "현재 문항에는 주축 판단의 글쓰기 전제가 있다.");
  flex.code = flex.code.replace(condition, "");
  for (const [ownerId, conceptId, changed] of [
    ["css-position-flex-grid", "css.flexbox", true],
    ["css-foundations-selectors", "css.selectors", false],
  ]) {
    window.location.hash = `#/review/css/${ownerId}?concept=${conceptId}`;
    globalThis.fetch = async (path) => String(path).endsWith("content/quizzes/css.json")
      ? { ok: true, json: async () => structuredClone(previousCollection) }
      : currentFetch(path);
    const { app, storage, errors } = harness();
    app.progressRepository.setLessonCompleted("css-position-flex-grid", true);
    await app.openRoute();
    choose(app, "b");
    app.gradeCurrentQuizQuestion();
    const questionId = app.getCurrentQuizQuestion().id;
    const sessionId = app.quizSession.id;
    const signature = app.savedReviewSession.contentSignature;
    const saved = storage.getItem(REVIEW_SESSION_STORAGE_KEY);
    const progress = storage.getItem(PROGRESS_STORAGE_KEY);
    globalThis.fetch = currentFetch;
    const restored = harness(storage).app;
    await restored.openRoute();
    assert.equal(restored.reviewNeedsRestart, changed);
    if (changed) {
      assert.match(restored.root.innerHTML, /data-review-start-new/);
      assert.doesNotMatch(restored.root.innerHTML, /data-quiz-option/);
      assert.equal(storage.getItem(REVIEW_SESSION_STORAGE_KEY), saved, "새 시작을 고르기 전 이전 풀이를 덮지 않는다.");
      restored.handleClick(click("[data-review-start-new]"));
      assert.equal(restored.reviewNeedsRestart, false);
      assert.notEqual(restored.savedReviewSession.contentSignature, signature);
      assert.equal(restored.quizSession.selectedOptionIds.size, 0);
      assert.equal(restored.quizSession.gradedAnswers.size, 0);
    } else {
      assert.equal(restored.quizSession.id, sessionId);
      assert.equal(restored.savedReviewSession.contentSignature, signature);
      assert.equal(restored.quizSession.selectedOptionIds.get(questionId), "b");
      assert.equal(restored.quizSession.gradedAnswers.has(questionId), true);
    }
    assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), progress, "기존 문서 완료와 완료한 풀이 기록은 바꾸지 않는다.");
    assert.deepEqual(errors, []);
  }
});

test("저장 충돌은 현재 화면을 유지하면서 알리고 다른 탭의 답을 덮지 않는다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  const second = harness(storage).app;
  await second.openReviewRoute("javascript", lesson.id);
  choose(app, "b");
  const firstRaw = storage.getItem(REVIEW_SESSION_STORAGE_KEY);
  const status = { textContent: "풀이 자동 저장" };
  const notice = { hidden: true };
  const message = { textContent: "" };
  second.root.querySelector = (selector) => ({
    "[data-review-save-status]": status,
    "[data-review-save-notice]": notice,
    "[data-review-save-message]": message,
  })[selector] ?? null;
  choose(second, "c");
  assert.equal(second.quizSession.selectedOptionIds.get(second.getCurrentQuizQuestion().id), "c");
  assert.equal(second.reviewSaveStatus, "failed");
  assert.match(status.textContent, /저장하지 못했습니다/);
  assert.equal(notice.hidden, false);
  assert.match(message.textContent, /다른 탭/);
  assert.equal(storage.getItem(REVIEW_SESSION_STORAGE_KEY), firstRaw);
});

test("보기 선택을 바꿀 때 현재 입력을 교체하지 않고 채점 가능 상태와 저장된 선택을 갱신한다", async (t) => {
  browser(t);
  const { app, storage } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  const originalMarkup = app.root.innerHTML;
  const { cards } = reviewCards(app);
  const card = cards[0];
  const radios = card.radios;
  const checkButton = card.querySelector("[data-quiz-check]");
  for (const value of ["a", "b"]) {
    chooseCard(app, card, value);
    assert.equal(app.root.innerHTML, originalMarkup, "선택 중인 입력이 있는 문서 트리를 교체하지 않는다.");
    assert.equal(card.querySelectorAll("[data-quiz-option]")[1], radios[1]);
    assert.equal(checkButton.disabled, false);
    assert.deepEqual(radios.filter((input) => input.optionContainer.selected).map(({ value: id }) => id), [value]);
    assert.equal(app.quizSession.selectedOptionIds.get(app.getCurrentQuizQuestion().id), value);
  }
  const restored = harness(storage).app;
  await restored.openReviewRoute("javascript", lesson.id);
  assert.equal(restored.quizSession.selectedOptionIds.get(restored.getCurrentQuizQuestion().id), "b");
  assert.match(restored.root.innerHTML, /value="b" data-quiz-option checked/);
  assert.match(restored.root.innerHTML, /data-quiz-check>정답 확인/);
});

test("개념 모달의 Tab 양끝은 모달 안에서 순환하고 닫으면 열었던 버튼으로 돌아간다", async (t) => {
  browser(t);
  const { app } = harness();
  await app.openReviewRoute("javascript", lesson.id);
  const handlers = new Map();
  const button = { isConnected: true, focus() { document.activeElement = button; } };
  const first = { getClientRects: () => [{}], focus() { document.activeElement = first; } };
  const hidden = { getClientRects: () => [], focus() { assert.fail("숨겨진 항목으로 초점 이동"); } };
  const last = { getClientRects: () => [{}], focus() { document.activeElement = last; } };
  const dialog = {
    setAttribute() {}, addEventListener(name, callback) { handlers.set(name, callback); },
    querySelector() { return first; }, querySelectorAll() { return [first, last, hidden]; },
    showModal() {}, remove() {},
  };
  document.createElement = (tag) => { assert.equal(tag, "dialog"); return dialog; };
  document.body = { classList: { add() {}, remove() {} } };
  app.root.append = () => {};
  app.openConceptOverlay(button);
  assert.equal(document.activeElement, first);
  assert.match(dialog.innerHTML, /학습문서에서 자세히 보기/);
  for (const [active, shiftKey, expected] of [[last, false, first], [first, true, last]]) {
    document.activeElement = active;
    let prevented = false;
    handlers.get("keydown")({ key: "Tab", shiftKey, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(document.activeElement, expected);
  }
  app.closeConceptOverlay();
  assert.equal(document.activeElement, button);
});

test("기존 소유자의 풀이를 새 문서에 연결해도 문항 서명·선택·채점·펼침과 복귀를 보존한다", async (t) => {
  const { focus } = browser(t);
  for (const [languageId, ownerId, conceptId, questionId, documentId, slug, wrongLessonId, wrongQuestionId] of [
    ["html", "html-01-document-structure", "html.semantics", "quiz-html-semantic-main", "html-notes-semantic-structure", "semantic-structure", "html-notes-media-alternatives", "quiz-html-link-destination"],
    ["css", "css-foundations-selectors", "css.selectors", "quiz-css-selector-compound-descendant", "css-notes-selectors", "selectors", "css-notes-typography", "quiz-css-unit-inheritance-context"],
    ["javascript", "js-notes-values", "js.variables", "quiz-javascript-notes-const-property", "js-concept-variables", "variables", "js-concept-callbacks", "quiz-javascript-notes-sync-callback"],
  ]) {
    const hash = `#/review/${languageId}/${ownerId}?concept=${conceptId}`;
    const plainDocumentHash = `#/learn/${languageId}/wiki-${slug}`;
    window.location.hash = hash;
    const { app, storage, errors } = harness();
    app.reviewConcepts = concepts.filter((concept) => !concept.documentLessonId);
    await app.openReviewRoute(languageId, ownerId);
    choose(app, "b");
    app.gradeCurrentQuizQuestion();
    app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
    const question = app.getCurrentQuizQuestion();
    assert.equal(question.id, questionId);
    const signature = app.savedReviewSession.contentSignature;
    const sessionId = app.quizSession.id;
    const upgraded = harness(storage).app;
    await upgraded.openReviewRoute(languageId, ownerId);
    assert.equal(upgraded.quizSession.id, sessionId, "문서 매핑 추가는 기존 풀이의 새 시작 사유가 아니다.");
    const handlers = new Map();
    const dialog = {
      setAttribute() {}, addEventListener(name, callback) { handlers.set(name, callback); },
      querySelector() { return { focus() {} }; }, showModal() {}, remove() {},
      getBoundingClientRect() { return { left: 0, right: 100, top: 0, bottom: 100 }; },
    };
    document.createElement = () => dialog;
    document.body = { classList: { add() {}, remove() {} } };
    upgraded.root.append = () => {};
    upgraded.openConceptOverlay({ id: "quiz-related-concept", isConnected: true, focus() {} });
    assert.ok(dialog.innerHTML.includes(`href="${plainDocumentHash}"`));
    handlers.get("click")(click("[data-concept-document]"));
    const documentHash = window.location.hash;
    assert.ok(documentHash.startsWith(`${plainDocumentHash}?review=`));
    await upgraded.openRoute();
    assert.equal(upgraded.currentLesson.id, documentId);
    assert.match(upgraded.root.innerHTML, /data-review-return/);
    const reloaded = harness(storage).app;
    await reloaded.openLessonRoute();
    assert.match(reloaded.root.innerHTML, /data-review-return/);
    reloaded.handleClick(click("[data-review-return]"));
    assert.equal(window.location.hash, hash);
    await reloaded.openRoute();
    assert.equal(reloaded.quizSession.id, sessionId);
    assert.equal(reloaded.savedReviewSession.contentSignature, signature);
    assert.equal(reloaded.quizSession.selectedOptionIds.get(question.id), "b");
    assert.equal(reloaded.quizSession.gradedAnswers.has(question.id), true);
    assert.equal(reloaded.quizSession.expandedQuestionIds.has(question.id), true);
    assert.equal(focus.at(-1), "quiz-related-concept");
    assert.equal(reloaded.progressRepository.getProgress().quizAttempts.length, 0);
    assert.deepEqual(errors, []);

    const validSaved = structuredClone(upgraded.savedReviewSession);
    const oldToken = structuredClone(validSaved);
    oldToken.returnContext.lessonId = question.lessonId;
    upgraded.reviewSessionRepository.save(oldToken);
    const oldLesson = curriculum.lessons.find((item) => item.id === question.lessonId);
    window.location.hash = buildReviewLessonHash(oldLesson, oldToken.returnContext.token);
    const oldReturn = harness(storage).app;
    await oldReturn.openLessonRoute();
    assert.match(oldReturn.root.innerHTML, /data-review-return/, "새 매핑이 있어도 이전 버전의 원래 문서 복귀 토큰은 유효하다.");
    for (const [targetId, questionId] of [
      [wrongLessonId, question.id],
      [documentId, wrongQuestionId],
    ]) {
      const tampered = structuredClone(validSaved);
      tampered.returnContext.lessonId = targetId;
      tampered.returnContext.questionId = questionId;
      upgraded.reviewSessionRepository.save(tampered);
      const target = curriculum.lessons.find((item) => item.id === targetId);
      window.location.hash = buildReviewLessonHash(target, tampered.returnContext.token);
      const rejected = harness(storage).app;
      await rejected.openLessonRoute();
      assert.equal(rejected.lessonReviewReturn, null);
      assert.doesNotMatch(rejected.root.innerHTML, /data-review-return/);
    }
  }
});

test("새 JS·Java 문서의 공유 개념 CTA는 한 번만 표시하고 서로 다른 개념은 따로 연다", async (t) => {
  browser(t);
  for (const [documentHash, expected] of [
    ["#/learn/javascript/wiki-variables", [["#/review/javascript?concept=js.variables", 2]]],
    ["#/learn/java/wiki-methods", [["#/review/java?concept=java.methods", 2]]],
    ["#/learn/javascript/wiki-function-return", [
      ["#/review/javascript/js-notes-functions?concept=js.function-return", 3],
      ["#/review/javascript/js-03-functions-scope-closure?concept=js.functions", 1],
    ]],
  ]) {
    window.location.hash = documentHash;
    const { app, errors } = harness();
    await app.openRoute();
    const main = app.root.innerHTML.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
    const links = [...main.matchAll(/href="(#\/review\/[^\"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(links.toSorted(), expected.map(([href]) => href).toSorted());
    assert.doesNotMatch(main, /data-review-return/);
    for (const [href, count] of expected) {
      window.location.hash = href;
      await app.openRoute();
      assert.equal(app.quizSession.questions.length, count, href);
      if (!href.split("?")[0].split("/")[3]) {
        assert.equal(new Set(app.quizSession.questions.map((question) => question.lessonId)).size, 2);
      }
    }
    assert.deepEqual(errors, []);
  }
});

test("Spring 문서 범위는 과정명을 표시하고 Java 전체 범위와 코드 언어 계약은 유지한다", async (t) => {
  browser(t);
  for (const [hash, title, count] of [
    ["#/review/java/spring-ioc-di?concept=spring.ioc-di", "Spring · Spring Boot", 2],
    ["#/review/java", "Java", 156],
  ]) {
    window.location.hash = hash;
    const { app, storage, errors } = harness();
    await app.openRoute();
    assert.deepEqual(errors, []);
    assert.equal(app.quizCollection.languageId, "java");
    assert.equal(app.quizSession.questions.length, count);
    const eyebrow = app.root.innerHTML.match(/<header class="review-header">\s*<div class="eyebrow">([\s\S]*?)<\/div>/)?.[1] ?? "";
    assert.ok(eyebrow.includes(`<span>${title}</span>`));
    assert.ok(document.title.includes(title));
    assert.match(app.root.innerHTML, /<code class="language-java">/);
    assert.doesNotMatch(app.root.innerHTML, /<code class="language-spring/);
    const expectedResumeTitle = hash === "#/review/java" ? app.quizCollection.title : "Spring · Spring Boot · DI(의존성 주입): 필요한 객체를 외부에서 받기";
    assert.equal(app.savedReviewSession.title, expectedResumeTitle);
    let resumeApp = app;
    if (hash === "#/review/java") {
      assert.doesNotMatch(eyebrow, /Spring/);
      assert.doesNotMatch(document.title, /Spring/);
    } else {
      const question = app.getCurrentQuizQuestion();
      const wrongOption = question.options.find((option) => !option.isCorrect);
      choose(app, wrongOption.id);
      app.gradeCurrentQuizQuestion();
      app.saveReviewSession({ captureViewport: true });
      const previous = { ...app.savedReviewSession, title: app.quizCollection.title };
      app.reviewSessionRepository.save(previous);
      const restored = harness(storage);
      resumeApp = restored.app;
      await resumeApp.openRoute();
      assert.deepEqual(restored.errors, []);
      assert.equal(resumeApp.quizSession.selectedOptionIds.get(question.id), wrongOption.id);
      assert.equal(resumeApp.quizSession.gradedAnswers.get(question.id)?.isCorrect, false);
      const persisted = JSON.parse(storage.getItem(REVIEW_SESSION_STORAGE_KEY));
      assert.equal(persisted.schemaVersion, 1);
      assert.deepEqual(persisted.activeSession, { ...previous, title: expectedResumeTitle }, "이전 Spring 풀이의 제목만 바꾸고 서명·선택·채점·viewport 등 저장 필드는 보존한다.");
    }
    for (const destination of ["#/", "#/review"]) {
      window.location.hash = destination;
      await resumeApp.openRoute();
      const card = resumeApp.root.innerHTML.match(/<aside class="resume-card"[\s\S]*?<\/aside>/)?.[0] ?? "";
      assert.ok(card.includes(expectedResumeTitle), `${hash}: ${destination}`);
      assert.ok(card.includes(`href="${hash}"`), `${hash}: 복습 범위를 유지한다.`);
      assert.match(card, /이어서 풀기/);
    }
  }
});

test("새 HTML·CSS 문서는 실제 키워드만 연결하고 문제 없는 문서를 전체 문제로 보내지 않는다", async (t) => {
  browser(t);
  for (const [languageId, mappedSlug, unmappedSlug, expectedQuestions] of [
    ["html", "input-names", "media-alternatives", [
      ["html-04-forms-accessibility", "html.form-submission", ["quiz-html-form-name-submission"]],
      ["html-04-forms-accessibility", "html.labels", ["quiz-html-label-association"]],
    ]],
    ["css", "layout-review", null, [
      ["css-position-flex-grid", "css.grid", ["quiz-css-grid-position-choice"]],
      [null, "css.debugging", ["quiz-css-debugging-cascade-step", "quiz-css-unmatched-selector-debug"]],
      [null, "css.layout-choice", ["quiz-css-layout-tool-choice", "quiz-css-variable-badge-flow"]],
      ["css-notes-layout-review", "css.problem-decomposition", ["quiz-css-overflow-one-cause"]],
      ["css-notes-layout-review", "css.accessibility-review", ["quiz-css-visual-dom-order"]],
    ]],
  ]) {
    window.location.hash = `#/learn/${languageId}/wiki-${mappedSlug}`;
    const { app, errors } = harness();
    await app.openRoute();
    const links = [...app.root.innerHTML.matchAll(/href="(#\/review\/[^\"]+)"/g)].map((match) => match[1]);
    const expected = expectedQuestions.map(([ownerId, conceptId, questionIds]) => [
      `#/review/${languageId}${ownerId ? `/${ownerId}` : ""}?concept=${conceptId}`, questionIds,
    ]);
    assert.deepEqual(links.toSorted(), expected.map(([href]) => href).toSorted());
    for (const [href, questionIds] of expected) {
      window.location.hash = href;
      await app.openRoute();
      assert.deepEqual(app.quizSession.questions.map((question) => question.id).toSorted(), questionIds.toSorted());
    }
    if (unmappedSlug) {
      window.location.hash = `#/learn/${languageId}/wiki-${unmappedSlug}`;
      await app.openRoute();
      assert.match(app.root.innerHTML, /관련 객관식 문제는 아직 준비 중/);
      const main = app.root.innerHTML.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
      assert.ok(!main.includes(`href="#/review/${languageId}`));
      assert.doesNotMatch(app.root.innerHTML, /data-review-return/);
      assert.match(app.root.innerHTML, /data-toggle-complete/);
    }
    assert.deepEqual(errors, []);
  }
});

test("보관 교안의 완료와 깊은 URL은 유지하고 새 문서의 답 보기·완료 기록을 독립 처리한다", async (t) => {
  browser(t);
  for (const [languageId, oldId, oldSlug, slug, newId] of [
    ["html", "html-01-document-structure", "document-structure-and-semantics", "markup", "html-notes-markup"],
    ["css", "css-foundations-selectors", "css-rules-selectors-values", "css-basics", "css-notes-css-basics"],
    ["java", "java-01-types-methods", "types-and-methods", "methods", "java-concept-methods"],
  ]) {
    window.location.hash = `#/learn/${languageId}/wiki-${slug}`;
    const { app, storage, errors } = harness();
    const oldHash = `#/learn/${languageId}/${oldSlug}`;
    app.progressRepository.setLessonCompleted(oldId, true);
    await app.openRoute();
    assert.equal(app.currentLesson.id, newId);
    assert.match(app.root.innerHTML, /data-toggle-complete aria-pressed="false"/);
    const before = storage.getItem(PROGRESS_STORAGE_KEY);
    const answer = { open: true };
    app.root.querySelector = (selector) => selector === "#lesson-answer" ? answer : null;
    app.handleClick({ target: { closest: () => null } });
    assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), before, "직접답 열람만으로 완료하지 않는다.");
    app.handleClick(click("[data-toggle-complete]"));
    assert.deepEqual(app.progressRepository.getProgress().completedLessonIds.toSorted(), [oldId, newId].toSorted());
    app.handleClick(click("[data-toggle-complete]"));
    assert.deepEqual(app.progressRepository.getProgress().completedLessonIds, [oldId]);
    window.location.hash = oldHash;
    await app.openRoute();
    assert.equal(app.currentLesson.id, oldId);
    assert.equal(window.location.hash, oldHash);
    assert.match(app.root.innerHTML, /data-toggle-complete aria-pressed="true"/);
    assert.match(app.root.innerHTML, /답변 예시 확인하기/);
    assert.doesNotMatch(app.root.innerHTML, /data-review-return/);
    assert.deepEqual(errors, []);
  }
});
