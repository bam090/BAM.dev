import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
} from "../src/repositories/progress-repository.js";

const fixedClock = () => new Date("2026-09-09T12:00:00.000Z");
const curriculum = {
  courses: [],
  languages: [{ id: "javascript", name: "JavaScript", status: "available" }],
  lessons: [
    { id: "lesson-functions", languageId: "javascript", conceptIds: ["js.functions"] },
    { id: "lesson-values", languageId: "javascript", conceptIds: ["js.values"] },
    { id: "lesson-empty", languageId: "javascript", conceptIds: ["js.empty"] },
    { id: "lesson-html", languageId: "html", conceptIds: ["html.elements"] },
  ],
};
const collection = {
  schemaVersion: 1,
  languageId: "javascript",
  title: "복습 fixture",
  questions: [
    ["functions-one", "lesson-functions", "js.functions"],
    ["functions-two", "lesson-functions", "js.functions"],
    ["values-one", "lesson-values", "js.values"],
  ].map(([id, lessonId, conceptId]) => ({
    id: `quiz-javascript-${id}`,
    lessonId,
    conceptId,
    difficulty: "basic",
    prompt: `${id}의 정답은?`,
    options: ["a", "b", "c", "d"].map((optionId) => ({
      id: optionId,
      text: optionId,
      isCorrect: optionId === "a",
      feedback: optionId === "a" ? "정답 근거" : "오답 근거",
    })),
  })),
};

function installBrowser(t, fetchImplementation = async () => ({ ok: true, json: async () => structuredClone(collection) })) {
  const values = {
    window: {
      location: { hash: "#/review/javascript" },
      history: { replaceState(_state, _title, hash) { globalThis.window.location.hash = hash; } },
      requestAnimationFrame() {},
      scrollTo() {},
    },
    document: { title: "", querySelector() { return null; } },
    fetch: fetchImplementation,
  };
  for (const [name, value] of Object.entries(values)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else delete globalThis[name];
    });
  }
}

function createHarness(storage = new MemoryStorage(), reviewSessionRepository = null) {
  const app = Object.create(BamLearningApp.prototype);
  const repository = new LocalStorageProgressRepository(storage, fixedClock);
  const announcements = [];
  const errors = [];
  const reviewSnapshots = [];
  const activeReviewRepository = reviewSessionRepository ?? {
    save(saved) {
      reviewSnapshots.push(structuredClone(saved));
      return "saved";
    },
  };
  const focusEvents = [];
  Object.assign(app, {
    curriculum,
    root: { innerHTML: "", querySelector() { return null; }, querySelectorAll() { return []; } },
    renderSequence: 0,
    currentView: "review",
    quizCollection: structuredClone(collection),
    quizLessonId: "lesson-functions",
    progressRepository: repository,
    reviewSessionRepository: activeReviewRepository,
    reviewSaveStatus: "saved",
    reviewStorageConflict: false,
    reviewNeedsRestart: false,
    syncMenuState() {},
    renderQuiz() {},
    focusQuizQuestion() { focusEvents.push("question"); },
    focusQuizResult() { focusEvents.push("result"); },
    announce(message) { announcements.push(message); },
    renderFatalError(error) { errors.push(error.message); },
  });
  app.startQuizSession(app.getScopedQuizQuestions(), "all");
  return { app, repository, announcements, errors, reviewSnapshots, focusEvents };
}

function elementInQuestion(questionId) {
  return {
    closest(selector) {
      return selector === "[data-quiz-question-id]"
        ? { dataset: { quizQuestionId: questionId } }
        : null;
    },
  };
}

function retryButtonInQuestion(questionId) {
  const card = { dataset: { quizQuestionId: questionId } };
  const button = {
    closest(selector) {
      if (selector === "[data-quiz-question-retry]") return button;
      if (selector === "[data-quiz-question-id]") return card;
      return null;
    },
  };
  return button;
}

function answerCurrent(app, optionId) {
  app.quizSession.selectedOptionIds.set(app.getCurrentQuizQuestion().id, optionId);
  app.gradeCurrentQuizQuestion();
  app.showNextQuizQuestion();
}

test("단원 경로는 그 단원의 문제만 열고 언어 전체 경로는 기존 전체 문제를 유지한다", async (t) => {
  installBrowser(t);
  const { app } = createHarness();
  await app.openReviewRoute("javascript", "lesson-functions");
  assert.equal(globalThis.window.location.hash, "#/review/javascript/lesson-functions");
  assert.deepEqual(app.quizSession.questions.map((question) => question.lessonId), ["lesson-functions", "lesson-functions"]);

  await app.openReviewRoute("javascript");
  assert.equal(globalThis.window.location.hash, "#/review/javascript");
  assert.equal(app.quizSession.questions.length, 3);
});

test("없는 단원·다른 언어의 단원은 전체 문제로 대체하거나 콘텐츠를 요청하지 않는다", async (t) => {
  let fetchCount = 0;
  installBrowser(t, async () => { fetchCount += 1; throw new Error("요청하면 안 됨"); });
  for (const lessonId of ["unknown", "lesson-html"]) {
    const { app, repository, errors } = createHarness();
    await app.openReviewRoute("javascript", lessonId);
    assert.equal(app.quizSession, null);
    assert.match(errors[0], /학습 문서를 찾을 수 없습니다/);
    assert.equal(repository.getProgress().quizAttempts.length, 0);
  }
  assert.equal(fetchCount, 0);
});

test("단원에 문제가 없으면 빈 상태이고 미응답·빈 세션을 완료 결과로 저장하지 않는다", async (t) => {
  installBrowser(t);
  const { app, repository, announcements } = createHarness();
  app.gradeCurrentQuizQuestion();
  app.showNextQuizQuestion();
  app.finishQuizSession();
  assert.equal(app.quizSession.currentIndex, 0);
  assert.equal(app.quizSession.gradedAnswers.size, 0);
  assert.equal(app.quizSession.recordAttempted, false);
  assert.ok(announcements.some((message) => message.includes("답을 하나 선택")));
  assert.equal(repository.getProgress().quizAttempts.length, 0);

  await app.openReviewRoute("javascript", "lesson-empty");
  assert.equal(app.quizSession.screen, "empty");
  assert.equal(app.getCurrentQuizQuestion(), null);
  app.finishQuizSession();
  assert.equal(repository.getProgress().quizAttempts.length, 0);
});

test("요청·JSON·콘텐츠 계약 실패는 오류로 알리고 채점 기록을 만들지 않는다", async (t) => {
  installBrowser(t);
  for (const response of [
    async () => ({ ok: false, status: 404 }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError("깨진 JSON"); } }),
    async () => ({ ok: true, json: async () => ({ ...collection, questions: [] }) }),
  ]) {
    globalThis.fetch = response;
    const { app, repository, errors } = createHarness();
    await app.openReviewRoute("javascript", "lesson-functions");
    assert.equal(errors.length, 1);
    assert.equal(app.quizSession, null);
    assert.equal(repository.getProgress().quizAttempts.length, 0);
  }
});

test("채점→완료→저장소 재생성→최근 결과 확인→저장 오답 재풀이가 다른 단원 기록을 보존한다", (t) => {
  installBrowser(t);
  const storage = new MemoryStorage();
  const { app, repository } = createHarness(storage);
  repository.setLessonCompleted("lesson-values", true);
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [{ questionId: collection.questions[2].id, lessonId: "lesson-values", selectedOptionId: "b", isCorrect: false }],
  });

  answerCurrent(app, "b");
  assert.equal(repository.getProgress().quizAttempts.length, 1, "중간 답안은 저장하지 않는다.");
  answerCurrent(app, "a");
  assert.equal(app.quizSession.screen, "result");
  assert.equal(app.quizSession.summary.correct, 1);
  assert.equal(app.quizSession.summary.total, 2);
  app.finishQuizSession();
  assert.equal(repository.getProgress().quizAttempts.length, 2, "완료 중복 호출도 한 번만 기록한다.");

  const restored = createHarness(storage);
  restored.app.refreshQuizHistory();
  assert.equal(restored.app.quizRecentAttempt.score, 1);
  assert.equal(restored.app.quizRecentAttempt.total, 2);
  assert.equal(restored.app.quizIncorrectQuestionCount, 1);
  restored.app.showRecentQuizResult();
  assert.equal(restored.app.quizSession.screen, "result");
  assert.equal(restored.app.quizSession.completedAt, fixedClock().toISOString());
  assert.deepEqual(restored.app.quizSession.summary.incorrectQuestionIds, [collection.questions[0].id]);
  assert.equal(restored.repository.getProgress().quizAttempts.length, 2, "최근 결과 열람은 새 완료 시도가 아니다.");

  restored.app.retryQuiz("saved-incorrect");
  assert.deepEqual(restored.app.quizSession.questions.map((question) => question.id), [collection.questions[0].id]);
  answerCurrent(restored.app, "a");
  const progress = new LocalStorageProgressRepository(storage, fixedClock).getProgress();
  assert.deepEqual(progress.incorrectQuestionIds, [collection.questions[2].id]);
  assert.deepEqual(progress.completedLessonIds, ["lesson-values"]);
  assert.equal(progress.quizAttempts.length, 3);

  restored.app.retryQuiz("all");
  assert.equal(restored.app.quizSession.questions.length, 2, "전체 재풀기도 현재 단원 범위 안이다.");
  const currentSession = restored.app.quizSession;
  restored.app.retryQuiz("saved-incorrect");
  assert.equal(restored.app.quizSession, currentSession, "남은 오답 없음은 진행 중 세션을 바꾸지 않는다.");
  assert.match(restored.announcements.at(-1), /남은 오답이 없습니다/);
});

test("최근 결과는 현재 단원의 답안만 보여 주고 후속 다른 단원 시도나 정답 변경으로 덮지 않는다", (t) => {
  installBrowser(t);
  const { app, repository } = createHarness();
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: collection.questions.map((question, index) => ({
      questionId: question.id, lessonId: question.lessonId, selectedOptionId: "a", isCorrect: index === 1,
    })),
  });
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [{ questionId: collection.questions[2].id, lessonId: "lesson-values", selectedOptionId: "a", isCorrect: true }],
  });
  app.showRecentQuizResult();
  assert.equal(app.quizRecentAttempt.total, 2);
  assert.equal(app.quizSession.summary.correct, 1, "저장 당시 정오를 현재 정답으로 재채점하지 않는다.");
  assert.equal(app.quizSession.summary.total, 2);
  app.retryQuiz("incorrect");
  assert.deepEqual(app.quizSession.questions.map((question) => question.id), [collection.questions[0].id]);
  assert.equal(repository.getProgress().quizAttempts.length, 2);
});

test("저장 실패에도 완료 결과를 유지하고 실패 상태를 표시한다", (t) => {
  installBrowser(t);
  const { app } = createHarness();
  app.progressRepository.recordQuizAttempt = () => { throw new Error("저장 공간 부족"); };
  answerCurrent(app, "a");
  answerCurrent(app, "b");
  assert.equal(app.quizSession.screen, "result");
  assert.equal(app.quizSession.summary.correct, 1);
  assert.equal(app.quizSession.persistenceStatus, "failed");
});

test("오답 즉시 재도전은 대상 카드만 초기화하고 세션 범위·순서·방식을 보존한다", (t) => {
  installBrowser(t);
  const { app, reviewSnapshots, announcements, focusEvents } = createHarness();
  const [firstQuestion, secondQuestion] = app.quizSession.questions;
  const sessionId = app.quizSession.id;
  app.quizSession.viewMode = "all";
  app.quizSession.gradingMode = "batch";

  app.quizSession.selectedOptionIds.set(firstQuestion.id, "c");
  app.gradeCurrentQuizQuestion();
  app.quizSession.expandedQuestionIds.add(firstQuestion.id);
  app.quizSession.currentIndex = 1;
  app.quizSession.selectedOptionIds.set(secondQuestion.id, "a");
  app.gradeCurrentQuizQuestion();

  assert.equal(app.handleQuizClick({ target: retryButtonInQuestion(firstQuestion.id) }), true);
  assert.equal(app.quizSession.id, sessionId);
  assert.deepEqual(app.quizSession.questions.map(({ id }) => id), [firstQuestion.id, secondQuestion.id]);
  assert.equal(app.quizSession.mode, "all");
  assert.equal(app.quizSession.viewMode, "all");
  assert.equal(app.quizSession.gradingMode, "batch");
  assert.equal(app.quizSession.screen, "question");
  assert.equal(app.quizSession.recordAttempted, false);
  assert.equal(app.quizSession.currentIndex, 0);
  assert.equal(app.quizSession.selectedOptionIds.has(firstQuestion.id), false);
  assert.equal(app.quizSession.gradedAnswers.has(firstQuestion.id), false);
  assert.equal(app.quizSession.expandedQuestionIds.has(firstQuestion.id), false);
  assert.equal(app.quizSession.selectedOptionIds.get(secondQuestion.id), "a");
  assert.equal(app.quizSession.gradedAnswers.get(secondQuestion.id).isCorrect, true);
  assert.deepEqual(app.quizSession.firstAttemptByQuestion.get(firstQuestion.id), {
    selectedOptionId: "c",
    isCorrect: false,
  });
  assert.deepEqual(reviewSnapshots.at(-1).firstAttemptByQuestion, [[firstQuestion.id, {
    selectedOptionId: "c",
    isCorrect: false,
  }]]);
  assert.deepEqual(reviewSnapshots.at(-1).gradedQuestionIds, [secondQuestion.id]);
  assert.match(announcements.at(-1), /다시 풀 수 있습니다/);
  assert.equal(focusEvents.at(-1), "question");
});

test("첫 오답은 연속 재도전에도 불변이고 정답·미채점·완료 카드는 재도전하지 않는다", (t) => {
  installBrowser(t);
  const { app } = createHarness();
  const [firstQuestion, secondQuestion] = app.quizSession.questions;
  const firstElement = elementInQuestion(firstQuestion.id);

  app.quizSession.selectedOptionIds.set(firstQuestion.id, "c");
  app.gradeCurrentQuizQuestion();
  assert.equal(app.retryCurrentQuizQuestion(firstElement), true);
  assert.equal(app.retryCurrentQuizQuestion(firstElement), false, "초기화된 미채점 카드는 다시 초기화하지 않는다.");

  app.quizSession.selectedOptionIds.set(firstQuestion.id, "b");
  app.gradeCurrentQuizQuestion();
  assert.equal(app.retryCurrentQuizQuestion(firstElement), true);
  assert.deepEqual(app.quizSession.firstAttemptByQuestion.get(firstQuestion.id), {
    selectedOptionId: "c",
    isCorrect: false,
  });

  app.quizSession.selectedOptionIds.set(firstQuestion.id, "a");
  app.gradeCurrentQuizQuestion();
  assert.equal(app.retryCurrentQuizQuestion(firstElement), false);
  assert.equal(app.quizSession.gradedAnswers.get(firstQuestion.id).isCorrect, true);

  app.quizSession.currentIndex = 1;
  assert.equal(app.retryCurrentQuizQuestion(elementInQuestion(secondQuestion.id)), false);
  app.quizSession.selectedOptionIds.set(secondQuestion.id, "b");
  app.gradeCurrentQuizQuestion();
  app.quizSession.screen = "result";
  assert.equal(app.retryCurrentQuizQuestion(elementInQuestion(secondQuestion.id)), false);
  assert.equal(app.quizSession.selectedOptionIds.get(secondQuestion.id), "b");
});

test("재도전 저장 실패는 오답 상태를 되돌리고 충돌은 차단하며 메모리 저장은 성공시킨다", (t) => {
  installBrowser(t);
  const failing = createHarness(undefined, {
    save() { throw new Error("저장 공간 부족"); },
  });
  const failingQuestion = failing.app.getCurrentQuizQuestion();
  failing.app.quizSession.selectedOptionIds.set(failingQuestion.id, "b");
  failing.app.gradeCurrentQuizQuestion();
  failing.app.quizSession.expandedQuestionIds.add(failingQuestion.id);
  failing.app.quizSession.currentIndex = 1;

  assert.equal(failing.app.retryCurrentQuizQuestion(elementInQuestion(failingQuestion.id)), false);
  assert.equal(failing.app.quizSession.currentIndex, 1);
  assert.equal(failing.app.quizSession.selectedOptionIds.get(failingQuestion.id), "b");
  assert.equal(failing.app.quizSession.gradedAnswers.get(failingQuestion.id).isCorrect, false);
  assert.equal(failing.app.quizSession.expandedQuestionIds.has(failingQuestion.id), true);
  assert.equal(failing.app.quizSession.firstAttemptByQuestion.has(failingQuestion.id), false);
  assert.equal(failing.app.reviewSaveStatus, "failed");
  assert.match(failing.announcements.at(-1), /이전 오답 상태를 유지/);

  let conflictSaveCount = 0;
  const conflicted = createHarness(undefined, { save() { conflictSaveCount += 1; return "saved"; } });
  const conflictedQuestion = conflicted.app.getCurrentQuizQuestion();
  conflicted.app.quizSession.selectedOptionIds.set(conflictedQuestion.id, "b");
  conflicted.app.gradeCurrentQuizQuestion();
  conflicted.app.reviewStorageConflict = true;
  assert.equal(conflicted.app.retryCurrentQuizQuestion(elementInQuestion(conflictedQuestion.id)), false);
  assert.equal(conflictSaveCount, 0);
  assert.equal(conflicted.app.quizSession.gradedAnswers.has(conflictedQuestion.id), true);

  const memory = createHarness(undefined, { save() { return "memory"; } });
  const memoryQuestion = memory.app.getCurrentQuizQuestion();
  memory.app.quizSession.selectedOptionIds.set(memoryQuestion.id, "b");
  memory.app.gradeCurrentQuizQuestion();
  assert.equal(memory.app.retryCurrentQuizQuestion(elementInQuestion(memoryQuestion.id)), true);
  assert.equal(memory.app.reviewSaveStatus, "memory");
  assert.equal(memory.app.quizSession.gradedAnswers.has(memoryQuestion.id), false);
});

test("전체 채점 재도전은 미채점으로 돌아가며 완료 기록과 최근 결과는 현재 답과 첫 오답을 분리한다", (t) => {
  installBrowser(t);
  const storage = new MemoryStorage();
  const { app, repository } = createHarness(storage);
  const [firstQuestion, secondQuestion] = app.quizSession.questions;
  app.quizSession.viewMode = "all";
  app.quizSession.gradingMode = "batch";
  app.quizSession.selectedOptionIds.set(firstQuestion.id, "b");
  app.quizSession.selectedOptionIds.set(secondQuestion.id, "a");
  app.gradePendingQuizQuestions();
  assert.equal(app.quizSession.gradedAnswers.size, 2);

  assert.equal(app.retryCurrentQuizQuestion(elementInQuestion(firstQuestion.id)), true);
  assert.equal(app.quizSession.currentIndex, 0);
  assert.equal(app.quizSession.gradedAnswers.size, 1);
  assert.equal(app.quizSession.selectedOptionIds.has(firstQuestion.id), false);
  assert.equal(app.quizSession.selectedOptionIds.get(secondQuestion.id), "a");
  app.finishQuizSession();
  assert.equal(repository.getProgress().quizAttempts.length, 0, "재도전 미채점 문항을 완료로 기록하지 않는다.");

  app.quizSession.selectedOptionIds.set(firstQuestion.id, "a");
  app.gradePendingQuizQuestions();
  app.finishQuizSession();
  app.finishQuizSession();
  const persisted = new LocalStorageProgressRepository(storage, fixedClock).getProgress();
  assert.equal(persisted.quizAttempts.length, 1);
  assert.equal(persisted.quizAttempts[0].score, 2);
  assert.deepEqual(persisted.incorrectQuestionIds, []);
  assert.deepEqual(persisted.quizAttempts[0].answers[0].firstAttempt, {
    selectedOptionId: "b",
    isCorrect: false,
  });

  app.showRecentQuizResult();
  assert.equal(app.quizSession.screen, "result");
  assert.equal(app.quizSession.recordAttempted, true);
  assert.equal(app.quizSession.summary.correct, 2);
  assert.deepEqual(app.quizSession.firstAttemptByQuestion.get(firstQuestion.id), {
    selectedOptionId: "b",
    isCorrect: false,
  });
  assert.equal(app.retryCurrentQuizQuestion(elementInQuestion(firstQuestion.id)), false);
  assert.equal(repository.getProgress().quizAttempts.length, 1, "최근 결과 재열기는 완료 기록을 중복 생성하지 않는다.");
});
