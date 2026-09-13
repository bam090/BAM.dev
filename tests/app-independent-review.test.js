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
  return { target: { closest(candidate) { return candidate === selector ? element : null; } }, preventDefault() {} };
}

function choose(app, optionId) {
  app.handleChange({ target: { closest(selector) { return selector === "[data-quiz-option]" ? { value: optionId } : null; } } });
}

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
  const selectedCards = new Map();
  const radios = ["a", "b", "c", "d"].map((value) => ({
    value,
    closest() { return { classList: { toggle(_name, selected) { selectedCards.set(value, selected); } } }; },
  }));
  const checkButton = { disabled: true };
  app.root.querySelectorAll = () => radios;
  app.root.querySelector = (selector) => selector === "[data-quiz-check]" ? checkButton : null;
  for (const value of ["a", "b"]) {
    choose(app, value);
    assert.equal(app.root.innerHTML, originalMarkup, "선택 중인 입력이 있는 문서 트리를 교체하지 않는다.");
    assert.equal(app.root.querySelectorAll()[1], radios[1]);
    assert.equal(checkButton.disabled, false);
    assert.deepEqual([...selectedCards].filter(([, selected]) => selected).map(([id]) => id), [value]);
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

test("HTML의 기존 풀이를 새 문서에 연결해도 문항 서명·선택·채점·펼침과 복귀를 보존한다", async (t) => {
  const hash = "#/review/html/html-01-document-structure?concept=html.semantics";
  browser(t, hash);
  const { app, storage, errors } = harness();
  app.reviewConcepts = concepts.filter((concept) => !concept.documentLessonId);
  await app.openReviewRoute("html", "html-01-document-structure");
  choose(app, "b");
  app.gradeCurrentQuizQuestion();
  app.handleQuizClick(click("[data-quiz-feedback-toggle]"));
  const question = app.getCurrentQuizQuestion();
  assert.equal(question.id, "quiz-html-semantic-main");
  const signature = app.savedReviewSession.contentSignature;
  const sessionId = app.quizSession.id;
  const upgraded = harness(storage).app;
  await upgraded.openReviewRoute("html", "html-01-document-structure");
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
  assert.match(dialog.innerHTML, /href="#\/learn\/html\/wiki-semantic-structure"/);
  handlers.get("click")(click("[data-concept-document]"));
  const documentHash = window.location.hash;
  assert.match(documentHash, /^#\/learn\/html\/wiki-semantic-structure\?review=/);
  await upgraded.openRoute();
  assert.equal(upgraded.currentLesson.id, "html-notes-semantic-structure");
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
    ["html-notes-media-alternatives", question.id],
    ["html-notes-semantic-structure", "quiz-html-link-destination"],
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
});

test("새 HTML 문서는 정확한 기존 키워드만 연결하고 문제 없는 문서를 전체 문제로 보내지 않는다", async (t) => {
  browser(t, "#/learn/html/wiki-input-names");
  const { app, errors } = harness();
  await app.openRoute();
  const links = [...app.root.innerHTML.matchAll(/href="(#\/review\/[^\"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(links.toSorted(), [
    "#/review/html/html-04-forms-accessibility?concept=html.form-submission",
    "#/review/html/html-04-forms-accessibility?concept=html.labels",
  ]);
  for (const href of links) {
    window.location.hash = href;
    await app.openRoute();
    assert.equal(app.quizSession.questions.length, 1);
    const expectedId = href.endsWith("html.labels") ? "quiz-html-label-association" : "quiz-html-form-name-submission";
    assert.equal(app.getCurrentQuizQuestion().id, expectedId);
  }
  window.location.hash = "#/learn/html/wiki-media-alternatives";
  await app.openRoute();
  assert.match(app.root.innerHTML, /관련 객관식 문제는 아직 준비 중/);
  assert.doesNotMatch(app.root.innerHTML, /href="#\/review\/html/);
  assert.doesNotMatch(app.root.innerHTML, /data-review-return/);
  assert.match(app.root.innerHTML, /data-toggle-complete/);
  assert.deepEqual(errors, []);
});

test("보관 HTML의 완료와 깊은 URL은 유지하고 새 문서의 답 보기·완료 기록을 독립 처리한다", async (t) => {
  browser(t, "#/learn/html/wiki-markup");
  const { app, storage, errors } = harness();
  const oldId = "html-01-document-structure";
  const newId = "html-notes-markup";
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
  window.location.hash = "#/learn/html/document-structure-and-semantics";
  await app.openRoute();
  assert.equal(app.currentLesson.id, oldId);
  assert.equal(window.location.hash, "#/learn/html/document-structure-and-semantics");
  assert.match(app.root.innerHTML, /data-toggle-complete aria-pressed="true"/);
  assert.match(app.root.innerHTML, /답변 예시 확인하기/);
  assert.doesNotMatch(app.root.innerHTML, /data-review-return/);
  assert.deepEqual(errors, []);
});
