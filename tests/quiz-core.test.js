import assert from "node:assert/strict";
import test from "node:test";
import {
  assertValidQuizCollection,
  gradeQuestion,
  summarizeQuiz,
  validateQuizCollection,
} from "../src/core/quiz.js";

const curriculum = {
  lessons: [
    {
      id: "js-01-runtime",
      languageId: "javascript",
      conceptIds: ["js.runtime"],
    },
  ],
};

const validCollection = {
  schemaVersion: 1,
  languageId: "javascript",
  title: "JavaScript 개념 복습",
  questions: [
    {
      id: "quiz-javascript-test-001",
      lessonId: "js-01-runtime",
      conceptId: "js.runtime",
      difficulty: "basic",
      prompt: "브라우저가 제공하는 기능은 무엇인가요?",
      options: [
        { id: "a", text: "DOM", isCorrect: true, feedback: "DOM은 브라우저 Web API입니다." },
        { id: "b", text: "const", isCorrect: false, feedback: "const는 언어 문법입니다." },
        { id: "c", text: "let", isCorrect: false, feedback: "let은 언어 문법입니다." },
        { id: "d", text: "if", isCorrect: false, feedback: "if는 언어 문법입니다." },
      ],
    },
  ],
};

test("유효한 객관식 컬렉션을 승인한다", () => {
  assert.deepEqual(validateQuizCollection(validCollection, curriculum), []);
  assert.equal(assertValidQuizCollection(validCollection, curriculum), validCollection);
});

test("교안에 없는 개념, 중복 선택지, 복수 정답을 거부한다", () => {
  const invalid = structuredClone(validCollection);
  invalid.questions[0].conceptId = "js.unknown";
  invalid.questions[0].options[1].text = invalid.questions[0].options[0].text;
  invalid.questions[0].options[1].isCorrect = true;
  const errors = validateQuizCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("conceptId")));
  assert.ok(errors.some((error) => error.includes("선택지 내용이 중복")));
  assert.ok(errors.some((error) => error.includes("정확히 하나의 정답")));
});

test("선택한 답을 즉시 채점하고 모든 선택지 해설을 반환한다", () => {
  const result = gradeQuestion(validCollection.questions[0], "b");
  assert.equal(result.isCorrect, false);
  assert.equal(result.correctOptionId, "a");
  assert.equal(result.feedback.length, 4);
  assert.ok(result.feedback.every((item) => item.message.length > 0));
});

test("전체 점수, 오답, 미응답 문제를 요약한다", () => {
  const questions = [
    validCollection.questions[0],
    { ...validCollection.questions[0], id: "quiz-javascript-test-002" },
    { ...validCollection.questions[0], id: "quiz-javascript-test-003" },
  ];
  const summary = summarizeQuiz(questions, [
    { questionId: "quiz-javascript-test-001", isCorrect: true },
    { questionId: "quiz-javascript-test-002", isCorrect: false },
  ]);
  assert.deepEqual(summary, {
    correct: 1,
    total: 3,
    percent: 33,
    incorrectQuestionIds: ["quiz-javascript-test-002"],
    unansweredQuestionIds: ["quiz-javascript-test-003"],
  });
});

test("요약에서 잘못되거나 중복된 답안을 거부한다", () => {
  const question = validCollection.questions[0];
  assert.throws(
    () => summarizeQuiz([question], [{ questionId: question.id, isCorrect: "false" }]),
    /답안 형식/,
  );
  assert.throws(
    () =>
      summarizeQuiz([question], [
        { questionId: question.id, isCorrect: true },
        { questionId: question.id, isCorrect: false },
      ]),
    /답안이 중복/,
  );
  assert.throws(
    () => summarizeQuiz([question], [{ questionId: "quiz-javascript-missing", isCorrect: false }]),
    /문제 목록에 없는 답안/,
  );
});

test("문제 ID가 전체 언어 ID로 네임스페이스되어야 한다", () => {
  const invalid = structuredClone(validCollection);
  invalid.questions[0].id = "quiz-js-test-001";
  assert.ok(
    validateQuizCollection(invalid, curriculum).some((error) =>
      error.includes("id 형식"),
    ),
  );
});

test("런타임 검증이 경로형 ID, 잘못된 선택지 ID와 추가 필드를 거부한다", () => {
  const invalid = structuredClone(validCollection);
  invalid.extra = true;
  invalid.questions[0].id = "quiz-javascript-../../escape";
  invalid.questions[0].extra = true;
  invalid.questions[0].options[0].id = "w";
  invalid.questions[0].options[0].extra = true;

  const errors = validateQuizCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("컬렉션에 허용되지 않은 필드")));
  assert.ok(errors.some((error) => error.includes("id 형식")));
  assert.ok(errors.some((error) => error.includes("a, b, c, d 중 하나")));
  assert.ok(errors.filter((error) => error.includes("허용되지 않은 필드")).length >= 3);
});
