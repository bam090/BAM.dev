import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStorage } from "../src/repositories/progress-repository.js";
import {
  REVIEW_SESSION_STORAGE_KEY,
  LocalStorageReviewSessionRepository,
  getReviewContentSignature,
  restoreReviewSession,
} from "../src/repositories/review-session-repository.js";

const scope = { languageId: "javascript", lessonId: "lesson-functions", conceptId: "js.functions" };
const questions = ["one", "two"].map((suffix) => ({
  id: `quiz-javascript-${suffix}`, lessonId: scope.lessonId, conceptId: scope.conceptId,
  prompt: `${suffix}의 결과는?`, difficulty: "basic",
  options: ["a", "b", "c", "d"].map((id) => ({ id, text: id, isCorrect: id === "a", feedback: `${id}의 근거` })),
}));

function snapshot(overrides = {}) {
  return {
    id: "session-one", scope, contentSignature: getReviewContentSignature(questions),
    questionIds: questions.map((question) => question.id), mode: "all", screen: "question", currentIndex: 1,
    selectedOptionIds: [[questions[0].id, "b"], [questions[1].id, "a"]], gradedQuestionIds: [questions[0].id],
    expandedQuestionIds: [questions[0].id], recordAttempted: false,
    viewport: { scrollY: 423, focusId: "quiz-option-1" },
    returnContext: { token: "return-one", lessonId: scope.lessonId },
    ...overrides,
  };
}

test("중단 저장은 선택과 제출을 구분하고 현재 문제·해설·복귀 위치를 복원한다", () => {
  const saved = snapshot();
  const result = restoreReviewSession(saved, questions, scope);
  assert.equal(result.status, "restored");
  const session = result.session;
  assert.equal(session.currentIndex, 1);
  assert.equal(session.selectedOptionIds.get(questions[1].id), "a");
  assert.equal(session.gradedAnswers.has(questions[1].id), false, "선택만 한 답은 자동 제출하지 않는다.");
  assert.equal(session.gradedAnswers.get(questions[0].id).isCorrect, false);
  assert.deepEqual([...session.expandedQuestionIds], [questions[0].id]);
  assert.deepEqual(session.viewport, saved.viewport);
  assert.deepEqual(session.returnContext, saved.returnContext);
  assert.equal(session.recordAttempted, false);
});

test("기존 v1과 낯선 보기·채점 값은 기본 방식으로 복구하되 풀이 범위와 답은 보존한다", () => {
  for (const optionalModes of [{}, { viewMode: "unknown", gradingMode: "unknown" }, { viewMode: null, gradingMode: 2 }]) {
    const result = restoreReviewSession(snapshot({ mode: "incorrect", ...optionalModes }), questions, scope);
    assert.equal(result.status, "restored");
    assert.equal(result.session.viewMode, "single");
    assert.equal(result.session.gradingMode, "individual");
    assert.equal(result.session.mode, "incorrect", "보기 방식은 오답 재도전 범위를 덮어쓰지 않는다.");
    assert.equal(result.session.selectedOptionIds.get(questions[1].id), "a");
    assert.equal(result.session.gradedAnswers.has(questions[1].id), false);
    assert.equal(result.session.expandedQuestionIds.has(questions[0].id), true);
  }
});

test("새 보기·채점 네 조합은 같은 v1 키에서 새 저장소 인스턴스까지 복구된다", () => {
  for (const viewMode of ["single", "all"]) {
    for (const gradingMode of ["individual", "batch"]) {
      const storage = new MemoryStorage();
      const saved = snapshot({ viewMode, gradingMode });
      new LocalStorageReviewSessionRepository(storage).save(saved);
      const raw = JSON.parse(storage.getItem(REVIEW_SESSION_STORAGE_KEY));
      assert.equal(raw.schemaVersion, 1);
      const result = restoreReviewSession(new LocalStorageReviewSessionRepository(storage).read(), questions, scope);
      assert.equal(result.status, "restored");
      assert.equal(result.session.viewMode, viewMode);
      assert.equal(result.session.gradingMode, gradingMode);
      assert.equal(result.session.id, saved.id);
      assert.deepEqual(result.session.questions.map(({ id }) => id), saved.questionIds);
      assert.deepEqual(result.session.viewport, saved.viewport);
      assert.deepEqual(result.session.returnContext, saved.returnContext);
      assert.equal(result.session.recordAttempted, false);
    }
  }
});

test("완료 결과 복원은 저장 당시 같은 콘텐츠에서만 허용하고 재완료 기록을 방지한다", () => {
  const saved = snapshot({ screen: "result", gradedQuestionIds: questions.map((question) => question.id) });
  const { status, session } = restoreReviewSession(saved, questions, scope);
  assert.equal(status, "restored");
  assert.equal(session.recordAttempted, true);
  assert.equal(session.summary.correct, 1);
  assert.equal(session.summary.total, 2);
  assert.equal(restoreReviewSession(snapshot({ screen: "result" }), questions, scope).status, "invalid");
});

test("최근 완료 결과를 다시 열었다면 당시 정오와 날짜를 현재 정답으로 바꾸지 않는다", () => {
  const saved = snapshot({
    screen: "result", gradedQuestionIds: questions.map((question) => question.id),
    completedAt: "2026-09-09T12:00:00.000Z",
    recordedAnswers: questions.map((question) => ({ questionId: question.id, isCorrect: true })),
  });
  const { status, session } = restoreReviewSession(saved, questions, scope);
  assert.equal(status, "restored");
  assert.equal(session.summary.correct, 2, "현재 보기 기준으로 첫 답이 오답이어도 저장 당시 결과를 보존한다.");
  assert.equal(session.completedAt, saved.completedAt);
  assert.equal(session.recordAttempted, true);
  assert.equal(restoreReviewSession({ ...saved, recordedAnswers: [] }, questions, scope).status, "invalid");
});

test("정답·문구·해설·문항 순서가 바뀌면 과거 풀이를 현재 콘텐츠로 조용히 재채점하지 않는다", () => {
  for (const mutate of [
    (items) => { items[0].prompt += " 변경"; },
    (items) => { items[0].options[0].feedback += " 변경"; },
    (items) => { items[0].options[0].isCorrect = false; items[0].options[1].isCorrect = true; },
    (items) => items.reverse(),
    (items) => items.pop(),
  ]) {
    const changed = structuredClone(questions);
    mutate(changed);
    assert.equal(restoreReviewSession(snapshot(), changed, scope).status, "content-changed");
  }
});

test("다른 언어·단원·키워드의 풀이를 현재 범위에 복원하지 않는다", () => {
  for (const other of [{ languageId: "java" }, { lessonId: "other" }, { conceptId: "js.other" }]) {
    assert.equal(restoreReviewSession(snapshot(), questions, { ...scope, ...other }).status, "other-scope");
  }
  assert.equal(restoreReviewSession(null, questions, scope).status, "other-scope");
});

test("누락 문항·잘못된 보기·미선택 제출·범위 밖 위치·깨진 세션은 채점하지 않는다", () => {
  for (const invalid of [
    { id: "<script>" }, { questionIds: [] }, { questionIds: [questions[0].id, questions[0].id] },
    { questionIds: ["missing"] }, { currentIndex: -1 }, { currentIndex: 2 }, { currentIndex: 0.5 },
    { mode: "unknown" }, { screen: "complete" }, { selectedOptionIds: [[questions[0].id, "z"]] },
    { selectedOptionIds: [["missing", "a"]] }, { selectedOptionIds: [], gradedQuestionIds: [questions[0].id] },
    { gradedQuestionIds: ["missing"] }, { gradedQuestionIds: null }, { selectedOptionIds: {} },
  ]) {
    assert.equal(restoreReviewSession(snapshot(invalid), questions, scope).status, "invalid", JSON.stringify(invalid));
  }
});

test("새 저장 키는 기존 진도·다른 제품 데이터를 그대로 두고 저장소 재생성 후 읽힌다", () => {
  const storage = new MemoryStorage();
  const prior = '{"quizAttempts":[{"id":"past"}],"codeQuestDrafts":{"quest":"code"}}';
  storage.setItem("bam.dev.progress.v1", prior);
  storage.setItem("other.product", "untouched");
  const repository = new LocalStorageReviewSessionRepository(storage);
  assert.equal(repository.read(), null);
  assert.ok(["saved", "memory"].includes(repository.save(snapshot())));
  assert.deepEqual(new LocalStorageReviewSessionRepository(storage).read(), snapshot());
  assert.equal(storage.getItem("bam.dev.progress.v1"), prior);
  assert.equal(storage.getItem("other.product"), "untouched");
  assert.equal(REVIEW_SESSION_STORAGE_KEY, "bam.dev.review-session.v1");
});

test("깨진 JSON·알 수 없는 버전·저장 차단을 성공 복원으로 표시하지 않는다", () => {
  const storage = new MemoryStorage();
  for (const value of ["{broken", JSON.stringify({ schemaVersion: 2, activeSession: snapshot() })]) {
    storage.setItem(REVIEW_SESSION_STORAGE_KEY, value);
    assert.equal(new LocalStorageReviewSessionRepository(storage).read(), null);
  }
  const blocked = new LocalStorageReviewSessionRepository({
    getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); },
  });
  assert.equal(blocked.read(), null);
  assert.throws(() => blocked.save(snapshot()), /blocked/);
  const quota = new LocalStorageReviewSessionRepository({ getItem() { return null; }, setItem() { throw new Error("quota"); } });
  quota.read();
  assert.throws(() => quota.save(snapshot()), /quota/);
});

test("다른 탭이 저장한 풀이를 오래 열린 탭이 덮어쓰지 않는다", () => {
  const storage = new MemoryStorage();
  const first = new LocalStorageReviewSessionRepository(storage);
  const second = new LocalStorageReviewSessionRepository(storage);
  first.read();
  second.read();
  first.save(snapshot());
  assert.throws(() => second.save(snapshot({ currentIndex: 0 })), /다른 탭/);
  assert.equal(second.read().currentIndex, 1);
  second.save(snapshot({ currentIndex: 0 }));
  assert.equal(new LocalStorageReviewSessionRepository(storage).read().currentIndex, 0);
});
