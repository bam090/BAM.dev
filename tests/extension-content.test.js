import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForCourse, getLessonsForLanguage, validateCurriculum } from "../src/core/content.js";
import { validateQuizCollection } from "../src/core/quiz.js";
import { splitMarkdownSection } from "../src/ui/markdown.js";

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
    quizCount: 47,
    sourcePattern: /https:\/\/(?:www\.w3\.org|drafts\.csswg\.org)\//,
  },
];

test("HTML·CSS의 보관·파생 교안은 같은 과정의 연속 순서와 공식 출처를 유지한다", async () => {
  for (const contract of AVAILABLE_CONTRACTS) {
    const language = curriculum.languages.find(
      (item) => item.id === contract.languageId,
    );
    const lessons = getLessonsForLanguage(curriculum, contract.languageId);
    const originalLessons = lessons.filter((lesson) => lesson.source.importMode !== "derived");
    const derivedLessons = lessons.filter((lesson) => lesson.source.importMode === "derived");

    assert.ok(language, `${contract.languageId}: 언어 메타데이터가 필요합니다.`);
    assert.equal(language.status, "available");
    assert.equal(originalLessons.length, contract.lessonCount);
    assert.equal(derivedLessons.length, contract.languageId === "html" ? 15 : 20);
    assert.deepEqual(
      originalLessons.map((lesson) => lesson.order),
      Array.from({ length: contract.lessonCount }, (_, index) => index + 1),
    );
    assert.deepEqual(
      derivedLessons.map((lesson) => lesson.order),
      Array.from({ length: derivedLessons.length }, (_, index) => contract.lessonCount + index + 1),
    );

    for (const lesson of lessons) {
      assert.equal(lesson.courseId, contract.languageId);
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
      assert.match(markdown, contract.sourcePattern);
      assert.doesNotMatch(markdown, /비밀\s*테스트|숨김\s*테스트/);
      if (lesson.source.importMode === "derived") {
        assert.equal(lesson.source.kind, "user-authored");
        assert.equal(Boolean(lesson.archivedFromCatalog), false);
        assert.equal(lesson.answerHeading, "핵심 질문 답");
        assert.ok(splitMarkdownSection(markdown, lesson.answerHeading).section, lesson.id);
      } else {
        assert.equal(lesson.source.kind, "bam-authored");
        assert.equal(Boolean(lesson.archivedFromCatalog), true);
        assert.match(markdown, /## (?:최종 )?확인 문제/);
        assert.match(markdown, /## 면접 답변 예시/);
      }
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

test("Java 정적 학습은 32개 개념 문서와 64문항을 제공하고 기존 샘플의 ID·URL을 보존한다", async () => {
  const language = curriculum.languages.find((item) => item.id === "java");
  const lessons = getLessonsForCourse(curriculum, "java");
  const quiz = JSON.parse(
    await readFile(new URL("../content/quizzes/java.json", import.meta.url), "utf8"),
  );

  assert.equal(language?.status, "available");
  assert.equal(curriculum.courses.find((course) => course.id === "java")?.status, "available");
  assert.equal(lessons.length, 33);
  assert.equal(lessons[0].id, "java-01-types-methods");
  assert.equal(lessons[0].slug, "types-and-methods");
  assert.equal(lessons[0].archivedFromCatalog, true);
  assert.equal(lessons.filter((lesson) => !lesson.archivedFromCatalog).length, 32);
  assert.equal(quiz.questions.filter((question) => lessons.some((lesson) => lesson.id === question.lessonId)).length, 64);
  assert.equal(quiz.questions[0].id, "quiz-java-method-return");
  assert.equal(quiz.questions[0].lessonId, "java-01-types-methods");
  assert.deepEqual(validateQuizCollection(quiz, curriculum), []);
});

test("Spring은 Security·JPA를 포함한 46개 정적 교안·92문항을 기존 Java 컬렉션에 연결한다", async () => {
  const course = curriculum.courses.find((item) => item.id === "spring");
  assert.equal(course?.categoryId, "spring");
  assert.equal(course?.languageId, "java");
  assert.equal(course?.name, "Spring · Spring Boot");
  assert.equal(course?.status, "available");
  assert.equal(course?.accent, "java");
  assert.equal(curriculum.categories.find((item) => item.id === "spring")?.status, "available");
  assert.equal(curriculum.languages.some((item) => item.id === "spring"), false);
  const lessons = getLessonsForCourse(curriculum, "spring");
  const quiz = JSON.parse(await readFile(new URL("../content/quizzes/java.json", import.meta.url), "utf8"));
  assert.equal(lessons.length, 46);
  assert.deepEqual(lessons.map((lesson) => lesson.order), Array.from({ length: 46 }, (_, index) => index + 1));
  assert.equal(quiz.questions.length, 156);
  for (const lesson of lessons) {
    assert.equal(lesson.id, `spring-${lesson.slug}`);
    assert.equal(lesson.contentFile, `content/lessons/spring/${lesson.slug}.md`);
    assert.equal(lesson.languageId, "java");
    assert.equal(Boolean(lesson.archivedFromCatalog), false);
    assert.equal(lesson.source.kind, "bam-authored");
    for (const field of ["originalPath", "sha256", "importedAt", "importMode"]) assert.equal(Object.hasOwn(lesson.source, field), false, `${lesson.id}: ${field}`);
    assert.ok(lesson.conceptIds.every((id) => id.startsWith("spring.")), lesson.id);
    const questions = quiz.questions.filter((question) => question.lessonId === lesson.id);
    assert.equal(questions.length, 2, lesson.id);
    assert.ok(questions.every((question) => question.id.startsWith(`quiz-java-${lesson.id}-`)), lesson.id);
  }
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

test("탐색 가능한 과정의 교안 누락과 다른 과정 디렉터리 경로를 거부한다", () => {
  const missingAvailableLesson = structuredClone(curriculum);
  missingAvailableLesson.lessons = missingAvailableLesson.lessons.filter(
    (lesson) => lesson.courseId !== "html",
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
    validateCurriculum(crossedPath).some((error) => error.includes("해당 과정 디렉터리")),
  );
});
