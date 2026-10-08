import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { LocalStorageProgressRepository, MemoryStorage } from "../src/repositories/progress-repository.js";
import { LocalStorageReviewSessionRepository } from "../src/repositories/review-session-repository.js";

// Integration simulation built from the existing app-independent-review and
// permutation-lab-view fixtures. Real public files, app handlers and repositories
// run unchanged. DOM geometry, native dialog/cancel, hash history and animation
// timing are modeled here: this is not a native-browser or screen-reader result.
const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
const { concepts } = JSON.parse(await readFile(new URL("../content/review-concepts.json", import.meta.url), "utf8"));
const targets = [
  { lessonId: "algo-08-permutations-java", questionId: "quiz-java-algo-permutations-missing-unvisit" },
  { lessonId: "js-12-brute-force-backtracking", questionId: "quiz-java-algo-backtracking-negative-pruning" },
];

function event(target) {
  return { target, preventDefault() { this.defaultPrevented = true; } };
}

function installRoundtripHarness(t, { deferFrames = false } = {}) {
  const frames = [];
  const focusLog = [];
  const requests = [];
  const scrollLog = [];
  const dialogs = [];
  const storage = new MemoryStorage();
  const writes = [];
  const setItem = storage.setItem.bind(storage);
  storage.setItem = (key, value) => { writes.push(key); setItem(key, value); };
  const app = Object.create(BamLearningApp.prototype);
  const elements = new Map();
  let markup = "";
  let cards = [];
  const root = {
    children: [],
    get innerHTML() { return markup; },
    set innerHTML(value) {
      for (const node of elements.values()) node.isConnected = false;
      for (const card of cards) for (const node of card.controls.values()) node.isConnected = false;
      if (document.activeElement?.isConnected === false) document.activeElement = document.body;
      elements.clear();
      cards = [];
      markup = value;
      this.children = [];
    },
    append(node) { this.children.push(node); },
    querySelectorAll(selector) {
      if (selector === "[data-quiz-question-id]") return getCards();
      if (selector === "[data-quiz-option]") return getCards().flatMap((card) => card.radios);
      return [];
    },
    querySelector(selector) {
      if (selector.startsWith("[data-quiz-question-id=")) return getCards().find((card) => selector.includes(card.dataset.quizQuestionId)) ?? null;
      if (selector === ".quiz-card, .quiz-result-card") return getCards()[0] ?? null;
      for (const card of getCards()) {
        const control = [...card.controls.values(), ...card.radios].find((node) => `#${node.id}` === selector);
        if (control) return control;
      }
      if (!selector.startsWith("#") && !/^\[data-[\w-]+\]$/.test(selector)) return null;
      const needle = selector.startsWith("#") ? `id="${selector.slice(1)}"` : selector.slice(1, -1);
      if (!markup.includes(needle)) return null;
      if (!elements.has(selector)) elements.set(selector, makeControl(selector, selector.startsWith("#") ? selector.slice(1) : ""));
      return elements.get(selector);
    },
  };
  function makeControl(selector, id = "", parent = null) {
    const attributes = new Map();
    const node = {
      id, isConnected: true, hidden: false, textContent: "", innerHTML: "", _disabled: false,
      classList: { toggle() {} },
      get disabled() { return this._disabled; },
      set disabled(value) {
        this._disabled = value;
        if (value && document.activeElement === this) document.activeElement = document.body;
      },
      closest(candidate) {
        return candidate.split(",").map((part) => part.trim()).includes(selector) ? this : parent?.closest(candidate) ?? null;
      },
      focus(options) {
        if (!this.disabled && this.isConnected) { document.activeElement = this; focusLog.push({ node: this, options }); }
      },
      getBoundingClientRect: () => ({ top: 835 - window.scrollY, bottom: 865 - window.scrollY, left: 0, right: 100 }),
      scrollIntoView() {}, getClientRects: () => [{}],
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name) ?? null; },
      hasAttribute(name) { return attributes.has(name) || selector === `[${name}]`; },
    };
    return node;
  }
  function getCards() {
    if (cards.length || app.currentView !== "review" || !app.quizSession) return cards;
    cards = [...markup.matchAll(/data-quiz-question-id="([^"]+)"/g)].map((match) => {
      const question = app.quizSession.questions.find(({ id }) => id === match[1]);
      assert.ok(question, "Rendered cards must refer to actual public questions");
      const card = makeControl("[data-quiz-question-id]");
      card.dataset = { quizQuestionId: question.id };
      card.controls = new Map();
      for (const [attribute, prefix] of [["quiz-check", "quiz-check"], ["related-concept", "quiz-related-concept"],
        ["quiz-feedback-toggle", "quiz-feedback-toggle"], ["quiz-question-title", "quiz-question-title"], ["quiz-grade-summary", "quiz-answer-summary"]]) {
        card.controls.set(`[data-${attribute}]`, makeControl(`[data-${attribute}]`, `${prefix}-${question.id}`, card));
      }
      card.radios = question.options.map((option, index) => {
        const container = makeControl(".quiz-option", "", card);
        const input = makeControl("[data-quiz-option]", `quiz-option-${question.id}-${index}`, container);
        input.value = option.id;
        return input;
      });
      card.querySelector = (selector) => card.controls.get(selector) ?? null;
      card.querySelectorAll = (selector) => selector === "[data-quiz-option]" ? card.radios : [];
      return card;
    });
    return cards;
  }
  function createDialog() {
    const controls = new Map();
    const listeners = new Map();
    const dialog = {
      innerHTML: "", isConnected: true,
      setAttribute() {}, getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 100 }),
      querySelector(selector) {
        if (!controls.has(selector)) {
          const control = makeControl(selector);
          const choice = /data-permutation-predict="(keep|remove)"/.exec(selector)?.[1];
          if (choice) {
            control.setAttribute("data-permutation-predict", choice);
            control.closest = (candidate) => candidate === "[data-permutation-predict]" ? control : null;
          }
          controls.set(selector, control);
        }
        return controls.get(selector);
      },
      querySelectorAll(selector) {
        return selector === "[data-permutation-predict]" ? ["keep", "remove"].map((choice) => this.querySelector(`[data-permutation-predict="${choice}"]`)) : [];
      },
      addEventListener(name, listener) { listeners.set(name, listener); },
      showModal() { this.open = true; },
      remove() {
        this.isConnected = false;
        this.open = false;
        for (const control of controls.values()) control.isConnected = false;
        if (document.activeElement?.isConnected === false) document.activeElement = document.body;
        root.children = root.children.filter((node) => node !== this);
      },
      control(name) { return this.querySelector(`[data-permutation-${name}]`); },
      click(name) { listeners.get("click")(event(this.control(name))); },
      cancel() { const cancelEvent = event(this); listeners.get("cancel")(cancelEvent); assert.equal(cancelEvent.defaultPrevented, true); },
      followDocument() { listeners.get("click")(event(this.querySelector("[data-concept-document]"))); },
    };
    dialogs.push(dialog);
    return dialog;
  }
  const values = {
    window: {
      location: { hash: "#/review/java" }, scrollY: 400, innerHeight: 1000,
      history: { replaceState(_state, _title, hash) { window.location.hash = hash; } },
      requestAnimationFrame(callback) { deferFrames ? frames.push(callback) : callback(); },
      scrollTo(options) { window.scrollY = options.top; scrollLog.push(options); },
    },
    document: {
      title: "", body: { classList: { add() {}, remove() {} } },
      querySelector: (selector) => root.querySelector(selector), querySelectorAll: () => [],
      getElementById: (id) => root.querySelector(`#${id}`),
      createElement(tag) { assert.equal(tag, "dialog"); return createDialog(); },
    },
    fetch: async (path) => {
      requests.push(path);
      const content = await readFile(new URL(`../${String(path).replace(/^\.\//, "")}`, import.meta.url), "utf8");
      return { ok: true, json: async () => JSON.parse(content), text: async () => content };
    },
  };
  for (const [name, value] of Object.entries(values)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  document.activeElement = document.body;
  const errors = [];
  const repository = new LocalStorageReviewSessionRepository(storage);
  Object.assign(app, {
    curriculum, root, renderSequence: 0, currentView: "home", reviewSessionRepository: repository,
    savedReviewSession: repository.read(),
    progressRepository: new LocalStorageProgressRepository(storage, () => new Date("2026-10-08T00:00:00Z")),
    reviewConcepts: concepts, reviewConceptsLoaded: true, quizCollections: new Map(),
    catalogFilters: { learn: { topicId: null, query: "" }, review: { topicId: null, query: "" } },
    syncMenuState() {}, announce() {}, renderFatalError(error) { errors.push(error.message); },
  });
  app.progressRepository.setLessonCompleted("js-notes-values", true);
  return {
    app, root, storage, writes, requests, errors, focusLog, scrollLog, dialogs,
    flushFrames() { while (frames.length) frames.shift()(); },
    async navigate(hash) { window.location.hash = hash; await app.openRoute(); assert.deepEqual(errors, []); },
    clickReview(selector) { const control = app.getQuizQuestionCard().querySelector(selector); control.focus(); app.handleQuizClick(event(control)); },
    openLab() {
      assert.match(root.innerHTML, /data-permutation-open/);
      const trigger = root.querySelector("[data-permutation-open]");
      trigger.focus();
      app.handleClick(event(trigger));
      return { dialog: dialogs.at(-1), trigger };
    },
  };
}

function answers(session) {
  return structuredClone({ id: session.id, questionIds: session.questions.map(({ id }) => id), currentIndex: session.currentIndex,
    selected: [...session.selectedOptionIds], graded: [...session.gradedAnswers], expanded: [...session.expandedQuestionIds],
    firstAttempts: [...session.firstAttemptByQuestion], viewMode: session.viewMode, gradingMode: session.gradingMode, screen: session.screen });
}

async function openQuestion(harness, target, state) {
  await harness.navigate(`#/review/java/${target.lessonId}`);
  const { app } = harness;
  while (app.getCurrentQuizQuestion().id !== target.questionId) {
    const before = app.quizSession.currentIndex;
    app.showNextQuizQuestion();
    assert.ok(app.quizSession.currentIndex > before, "Public target question must be reachable");
  }
  if (state !== "unanswered") {
    const input = app.getQuizQuestionCard().radios.find((option) => option.value === "b");
    input.focus();
    app.handleChange({ target: input });
  }
  if (state === "graded-expanded") {
    harness.clickReview("[data-quiz-check]");
    harness.clickReview("[data-quiz-feedback-toggle]");
  }
  harness.flushFrames();
  window.scrollY = 400;
  assert.equal(app.quizSession.selectedOptionIds.size, state === "unanswered" ? 0 : 1);
  assert.equal(app.quizSession.gradedAnswers.size, state === "graded-expanded" ? 1 : 0);
  assert.equal(app.quizSession.expandedQuestionIds.size, state === "graded-expanded" ? 1 : 0);
}

async function visitDocument(harness, target) {
  harness.clickReview("[data-related-concept]");
  harness.dialogs.at(-1).followDocument();
  const saved = structuredClone(harness.app.savedReviewSession);
  assert.equal(saved.returnContext.questionId, target.questionId);
  assert.equal(saved.returnContext.lessonId, target.lessonId);
  assert.equal(saved.returnContext.sessionId, saved.id);
  assert.ok(saved.returnContext.token);
  await harness.app.openRoute();
  assert.deepEqual(harness.errors, []);
  assert.equal(harness.app.currentLesson.id, target.lessonId);
  assert.match(harness.root.innerHTML, /data-review-return/);
  return saved;
}

function assertSnapshot(dialog, step, path, used) {
  assert.equal(dialog.control("counter").textContent, `${step} / 201단계`);
  const html = dialog.control("snapshot").innerHTML;
  assert.ok(html.includes(`<dd data-permutation-path>${path}</dd>`));
  assert.ok(html.includes(`<dd data-permutation-used>${used}</dd>`));
  assert.match(html, /경로 복사본 1개/);
  assert.match(html, /class="permutation-lab-answers"><li>\[1, 2, 3\]<\/li>/);
}

for (const target of targets) for (const state of ["unanswered", "selected", "graded-expanded"]) for (const close of ["button", "Escape"]) {
  test(`${target.lessonId}: ${state} → 문서 → 실험실 → ${close} → 같은 문제·풀이·위치`, async (t) => {
    const harness = installRoundtripHarness(t);
    const { app, root, storage, writes, requests } = harness;
    await openQuestion(harness, target, state);
    const expectedAnswers = answers(app.quizSession);
    const completed = app.progressRepository.getProgress().completedLessonIds;
    const saved = await visitDocument(harness, target);
    const hash = window.location.hash;
    const documentMarkup = root.innerHTML;
    const answer = root.querySelector("#lesson-answer");
    if (answer) answer.open = true;
    window.scrollY = 735;
    const beforeLab = { data: [...storage.values], writes: writes.length, requests: requests.length };
    const { dialog, trigger } = harness.openLab();
    for (let index = 0; index < 32; index += 1) dialog.click("next");
    assertSnapshot(dialog, 32, "[1, 2, 3]", "[true, true, true]");
    dialog.click('predict="remove"');
    dialog.click("next");
    assertSnapshot(dialog, 33, "[1, 2]", "[true, true, true]");
    assert.match(dialog.control("prediction-result").textContent, /내 예상: \[1, 2\]\. 실제 path = \[1, 2\]/);
    dialog.click("next");
    assertSnapshot(dialog, 34, "[1, 2]", "[true, true, false]");
    close === "Escape" ? dialog.cancel() : dialog.click("close");
    assert.equal(dialog.isConnected, false);
    assert.equal(document.activeElement, trigger);
    assert.equal(window.scrollY, 735);
    assert.equal(window.location.hash, hash);
    assert.equal(root.innerHTML, documentMarkup);
    if (answer) { assert.equal(root.querySelector("#lesson-answer"), answer); assert.equal(answer.open, true); }
    assert.deepEqual([...storage.values], beforeLab.data);
    assert.equal(writes.length, beforeLab.writes, "Lab controls must not write even equivalent storage values");
    assert.equal(requests.length, beforeLab.requests);
    assert.deepEqual(app.lessonReviewReturn.saved, saved);
    app.handleClick(event(root.querySelector("[data-review-return]")));
    await app.openRoute();
    harness.flushFrames();
    assert.deepEqual(harness.errors, []);
    assert.deepEqual(answers(app.quizSession), expectedAnswers);
    assert.deepEqual(app.quizSession.returnContext, saved.returnContext);
    assert.deepEqual(app.quizSession.viewport, saved.viewport);
    assert.equal(app.getCurrentQuizQuestion().id, target.questionId);
    assert.equal(window.scrollY, 400);
    assert.equal(document.activeElement.id, `quiz-related-concept-${target.questionId}`);
    assert.equal(app.progressRepository.getProgress().quizAttempts.length, 0);
    assert.deepEqual(app.progressRepository.getProgress().completedLessonIds, completed);
  });
}

for (const choice of ["keep", "remove", "changed", "unanswered", "skip"]) {
  test(`왕복 도중 첫 복귀 예측 ${choice}: 동일한 복구 단계와 선택 초기화`, async (t) => {
    const harness = installRoundtripHarness(t);
    await openQuestion(harness, targets[0], "selected");
    await visitDocument(harness, targets[0]);
    const { dialog } = harness.openLab();
    for (let index = 0; index < 32; index += 1) dialog.click("next");
    assertSnapshot(dialog, 32, "[1, 2, 3]", "[true, true, true]");
    if (choice !== "unanswered") dialog.click(`predict="${choice === "remove" ? "remove" : "keep"}"`);
    if (choice === "changed") dialog.click('predict="remove"');
    dialog.click(choice === "skip" ? "skip" : "next");
    assertSnapshot(dialog, 33, "[1, 2]", "[true, true, true]");
    const result = dialog.control("prediction-result").textContent;
    if (["unanswered", "skip"].includes(choice)) assert.doesNotMatch(result, /내 예상/);
    else assert.ok(result.startsWith(`내 예상: ${choice === "keep" ? "[1, 2, 3]" : "[1, 2]"}.`));
    if (choice === "skip") assert.equal(document.activeElement, dialog.control("next"));
    dialog.click("previous");
    assert.equal(dialog.control("prediction-selection").textContent, "아직 선택하지 않았습니다.");
    assert.equal(dialog.control('predict="keep"').getAttribute("aria-pressed"), "false");
    assert.equal(dialog.control('predict="remove"').getAttribute("aria-pressed"), "false");
    dialog.click("next"); dialog.click("next"); dialog.click("previous");
    assert.doesNotMatch(dialog.control("prediction-result").textContent, /내 예상/);
    dialog.click("first");
    assert.equal(dialog.control("counter").textContent, "0 / 201단계");
    dialog.cancel();
    const reopened = harness.openLab().dialog;
    assert.equal(reopened.control("counter").textContent, "0 / 201단계");
    for (let index = 0; index < 32; index += 1) reopened.click("next");
    assert.equal(reopened.control("prediction-selection").textContent, "아직 선택하지 않았습니다.");
    reopened.cancel();
  });
}

for (const target of targets) {
  test(`${target.lessonId}: 모형 Back·Forward·다른 문서·재진입은 옛 대화상자·예상·초점을 버린다`, async (t) => {
    const harness = installRoundtripHarness(t);
    const { app, root, focusLog } = harness;
    await openQuestion(harness, target, "graded-expanded");
    const original = answers(app.quizSession);
    await visitDocument(harness, target);
    const documentHash = window.location.hash;
    const reviewHash = `#/review/java/${target.lessonId}`;
    const { dialog, trigger } = harness.openLab();
    for (let index = 0; index < 32; index += 1) dialog.click("next");
    dialog.click('predict="keep"');
    const beforeNavigation = focusLog.length;
    await harness.navigate(reviewHash); // modeled browser Back hashchange
    assert.equal(dialog.isConnected, false);
    assert.equal(trigger.isConnected, false);
    assert.deepEqual(answers(app.quizSession), original);
    assert.ok(focusLog.slice(beforeNavigation).every(({ node }) => node !== trigger));
    await harness.navigate(documentHash); // modeled browser Forward hashchange
    assert.equal(root.children.length, 0);
    assert.ok(app.lessonReviewReturn);
    const reentry = harness.openLab();
    assert.equal(reentry.dialog.control("counter").textContent, "0 / 201단계");
    for (let index = 0; index < 32; index += 1) reentry.dialog.click("next");
    assert.equal(reentry.dialog.control("prediction-selection").textContent, "아직 선택하지 않았습니다.");
    reentry.dialog.click('predict="remove"');
    const other = curriculum.lessons.find((lesson) => lesson.id === targets.find((item) => item !== target).lessonId);
    const beforeOther = focusLog.length;
    await harness.navigate(`#/learn/${other.courseId}/${other.slug}`);
    assert.equal(reentry.dialog.isConnected, false);
    assert.equal(root.children.length, 0);
    assert.equal(app.lessonReviewReturn, null);
    assert.doesNotMatch(root.innerHTML, /data-review-return/);
    assert.ok(focusLog.slice(beforeOther).every(({ node }) => node !== reentry.trigger));
    const otherLab = harness.openLab();
    assert.equal(otherLab.dialog.control("counter").textContent, "0 / 201단계");
    otherLab.dialog.cancel();
    assert.equal(document.activeElement, otherLab.trigger);
  });
}

for (const close of ["button", "Escape"]) {
  test(`예측 선택 직후 ${close}로 닫고 재진입하면 선택과 대조가 남지 않는다`, async (t) => {
    const harness = installRoundtripHarness(t);
    await openQuestion(harness, targets[0], "unanswered");
    await visitDocument(harness, targets[0]);
    const { dialog } = harness.openLab();
    for (let index = 0; index < 32; index += 1) dialog.click("next");
    dialog.click('predict="keep"');
    assert.equal(dialog.control('predict="keep"').getAttribute("aria-pressed"), "true");
    close === "Escape" ? dialog.cancel() : dialog.click("close");
    const reopened = harness.openLab().dialog;
    assert.equal(reopened.control("counter").textContent, "0 / 201단계");
    assert.equal(reopened.control("prediction").hidden, true);
    for (let index = 0; index < 32; index += 1) reopened.click("next");
    assert.equal(reopened.control("prediction-selection").textContent, "아직 선택하지 않았습니다.");
    assert.equal(reopened.control('predict="keep"').getAttribute("aria-pressed"), "false");
    reopened.click("next");
    assert.doesNotMatch(reopened.control("prediction-result").textContent, /내 예상/);
    reopened.cancel();
  });
}

for (const destination of ["Forward", "other-document"]) {
  test(`예약된 문제 복귀 후 ${destination}: 오래된 animation frame은 새 문서의 초점·위치를 바꾸지 않는다`, async (t) => {
    const harness = installRoundtripHarness(t, { deferFrames: true });
    const { app, root, focusLog } = harness;
    await openQuestion(harness, targets[0], "graded-expanded");
    await visitDocument(harness, targets[0]);
    const documentHash = window.location.hash;
    const { dialog } = harness.openLab();
    dialog.cancel();
    app.handleClick(event(root.querySelector("[data-review-return]")));
    await app.openRoute(); // Review focus and viewport restoration wait for animation frames.
    assert.equal(app.currentView, "review");
    const nextHash = destination === "Forward" ? documentHash : "#/learn/algorithm/brute-force-backtracking-recursion";
    await harness.navigate(nextHash); // Route changes before the earlier frame callbacks run.
    const currentEntry = root.querySelector("[data-permutation-open]");
    currentEntry.focus();
    window.scrollY = 735;
    const focusCount = focusLog.length;
    harness.flushFrames();
    assert.equal(window.location.hash, nextHash);
    assert.equal(app.currentView, "lesson");
    assert.equal(window.scrollY, 735, "A stale review callback must not restore its 400px viewport on a later document");
    assert.equal(document.activeElement, currentEntry, "A stale review callback must not steal the later document focus");
    assert.equal(focusLog.length, focusCount, "Leaving review invalidates its queued focus changes");
  });
}
