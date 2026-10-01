import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForCourse } from "../src/core/content.js";

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const curriculum = await load("../content/curriculum.json");
const javaQuiz = await load("../content/quizzes/java.json");
const algorithmLessons = getLessonsForCourse(curriculum, "algorithm");
const algorithmQuestions = javaQuiz.questions.filter((question) => question.id.startsWith("quiz-java-algo-"));

// DEC-ALGORITHM-QUIZ-01: 개념 문서는 3문제, 활용·심화 문서는 2문제를 둔다.
function expectedCount(lesson) {
  return (lesson.documentKind ?? "concept") === "concept" ? 3 : 2;
}

test("알고리즘 교안 40편은 개념 3문제·활용·심화 2문제씩 모두 98문항을 가진다", () => {
  assert.equal(algorithmLessons.length, 40);
  assert.equal(algorithmQuestions.length, 98);
  for (const lesson of algorithmLessons) {
    const questions = algorithmQuestions.filter((question) => question.lessonId === lesson.id);
    assert.equal(questions.length, expectedCount(lesson), lesson.id);
    const difficulties = new Set(questions.map((question) => question.difficulty));
    assert.ok(difficulties.has("basic") && difficulties.has("application"), `${lesson.id}: basic과 application이 모두 필요합니다.`);
    assert.ok(questions.every((question) => lesson.conceptIds.includes(question.conceptId)), lesson.id);
  }
});

test("알고리즘 문항은 교안 읽기 순서대로 Java 컬렉션 끝에 붙고 알고리즘 교안만 가리킨다", () => {
  const algorithmLessonIds = new Set(algorithmLessons.map((lesson) => lesson.id));
  assert.deepEqual(javaQuiz.questions.slice(-algorithmQuestions.length), algorithmQuestions);
  assert.ok(algorithmQuestions.every((question) => algorithmLessonIds.has(question.lessonId)));
  assert.ok(javaQuiz.questions.every((question) => question.id.startsWith("quiz-java-algo-") === algorithmLessonIds.has(question.lessonId)));
  const lessonOrder = algorithmLessons.map((lesson) => lesson.id);
  const questionLessonOrder = [...new Set(algorithmQuestions.map((question) => question.lessonId))];
  assert.deepEqual(questionLessonOrder, lessonOrder);
});

test("알고리즘 문항은 모든 보기에 feedback을 두고 한 교안 안에서 정답 위치가 연달아 같지 않다", () => {
  for (const lesson of algorithmLessons) {
    const answers = algorithmQuestions
      .filter((question) => question.lessonId === lesson.id)
      .map((question) => question.options.find((option) => option.isCorrect).id);
    for (let index = 1; index < answers.length; index += 1) {
      assert.notEqual(answers[index], answers[index - 1], `${lesson.id}: 정답 위치가 연달아 같습니다.`);
    }
  }
  for (const question of algorithmQuestions) {
    assert.ok(question.learningObjective, question.id);
    assert.deepEqual(question.options.map((option) => option.id), ["a", "b", "c", "d"], question.id);
    assert.ok(question.options.every((option) => option.feedback.trim().length > 0), question.id);
    assert.doesNotMatch(question.prompt, /올바른 것은\?$/, question.id);
  }
});
