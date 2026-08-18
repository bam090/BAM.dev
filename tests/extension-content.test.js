import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForLanguage, validateCurriculum } from "../src/core/content.js";
import { validateQuizCollection } from "../src/core/quiz.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

const AVAILABLE_CONTRACTS = [
  {
    languageId: "html",
    lessonCount: 5,
    quizCount: 12,
    sourcePattern: /https:\/\/(?:html\.spec\.whatwg\.org|www\.w3\.org)\//,
  },
  {
    languageId: "css",
    lessonCount: 6,
    quizCount: 12,
    sourcePattern: /https:\/\/(?:www\.w3\.org|drafts\.csswg\.org)\//,
  },
];

test("HTML·CSS 정식 과정은 연속된 교안과 공식 출처를 가진다", async () => {
  for (const contract of AVAILABLE_CONTRACTS) {
    const language = curriculum.languages.find(
      (item) => item.id === contract.languageId,
    );
    const lessons = getLessonsForLanguage(curriculum, contract.languageId);

    assert.ok(language, `${contract.languageId}: 언어 메타데이터가 필요합니다.`);
    assert.equal(language.status, "available");
    assert.equal(lessons.length, contract.lessonCount);
    assert.deepEqual(
      lessons.map((lesson) => lesson.order),
      Array.from({ length: contract.lessonCount }, (_, index) => index + 1),
    );

    for (const lesson of lessons) {
      assert.equal(lesson.source.kind, "bam-authored");
      assert.match(
        lesson.contentFile,
        new RegExp(`^content/lessons/${contract.languageId}/`),
      );
      const markdown = await readFile(
        new URL(`../${lesson.contentFile}`, import.meta.url),
        "utf8",
      );
      assert.match(markdown, /^# /);
      assert.match(markdown, /## 학습 목표/);
      assert.match(markdown, /## (?:최종 )?확인 문제/);
      assert.match(markdown, contract.sourcePattern);
      assert.doesNotMatch(markdown, /비밀\s*테스트|숨김\s*테스트/);
    }
  }
});

test("HTML·CSS 객관식은 모든 문항을 같은 언어의 교안·개념과 연결한다", async () => {
  const allQuestionIds = new Set();

  for (const contract of AVAILABLE_CONTRACTS) {
    const quiz = JSON.parse(
      await readFile(
        new URL(`../content/quizzes/${contract.languageId}.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.deepEqual(validateQuizCollection(quiz, curriculum), []);
    assert.equal(quiz.languageId, contract.languageId);
    assert.equal(quiz.questions.length, contract.quizCount);

    for (const question of quiz.questions) {
      const lesson = curriculum.lessons.find((item) => item.id === question.lessonId);
      assert.equal(lesson?.languageId, contract.languageId);
      assert.ok(lesson.conceptIds.includes(question.conceptId));
      assert.equal(question.options.length, 4);
      assert.equal(question.options.filter((option) => option.isCorrect).length, 1);
      assert.ok(question.options.every((option) => option.feedback.trim().length > 0));
      assert.equal(allQuestionIds.has(question.id), false);
      allQuestionIds.add(question.id);
    }
  }
});

test("Java는 한 개의 읽기·추론 샘플 교안과 객관식을 유지한다", async () => {
  const language = curriculum.languages.find((item) => item.id === "java");
  const lessons = getLessonsForLanguage(curriculum, "java");
  const quiz = JSON.parse(
    await readFile(new URL("../content/quizzes/java.json", import.meta.url), "utf8"),
  );

  assert.equal(language?.status, "sample");
  assert.equal(lessons.length, 1);
  assert.equal(lessons[0].id, "java-01-types-methods");
  assert.equal(quiz.questions.length, 1);
  assert.equal(quiz.questions[0].id, "quiz-java-method-return");
});

test("모든 정식·샘플 언어가 학습 링크와 짝을 이루는 객관식 컬렉션을 가진다", async () => {
  const navigableLanguages = curriculum.languages.filter((language) =>
    ["available", "sample"].includes(language.status),
  );

  for (const language of navigableLanguages) {
    const quiz = JSON.parse(
      await readFile(
        new URL(`../content/quizzes/${language.id}.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.equal(quiz.languageId, language.id);
    assert.ok(quiz.questions.length > 0);
  }
});

test("탐색 가능한 언어의 교안 누락과 다른 언어 디렉터리 경로를 거부한다", () => {
  const missingAvailableLesson = structuredClone(curriculum);
  missingAvailableLesson.lessons = missingAvailableLesson.lessons.filter(
    (lesson) => lesson.languageId !== "html",
  );
  assert.ok(
    validateCurriculum(missingAvailableLesson).some(
      (error) => error.includes("html") && error.includes("교안이 필요"),
    ),
  );

  const crossedPath = structuredClone(curriculum);
  crossedPath.lessons.find((lesson) => lesson.languageId === "css").contentFile =
    "content/lessons/html/cascade-and-box-model.md";
  assert.ok(
    validateCurriculum(crossedPath).some((error) =>
      error.includes("해당 언어 디렉터리"),
    ),
  );
});
