import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getLessonsForCourse,
  getLessonsForLanguage,
  validateCurriculum,
} from "../src/core/content.js";
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

test("Java 정식 과정은 6개 교안과 교안별 2개 객관식을 제공한다", async () => {
  const language = curriculum.languages.find((item) => item.id === "java");
  const lessons = getLessonsForLanguage(curriculum, "java");
  const quiz = JSON.parse(
    await readFile(new URL("../content/quizzes/java.json", import.meta.url), "utf8"),
  );

  const expectedLessons = [
    {
      id: "java-01-types-methods",
      conceptIds: ["java.types", "java.variables", "java.methods", "java.compilation"],
    },
    {
      id: "java-02-control-flow-arrays",
      conceptIds: ["java.operators", "java.control-flow", "java.arrays"],
    },
    {
      id: "java-03-classes-objects",
      conceptIds: [
        "java.classes",
        "java.objects",
        "java.constructors",
        "java.encapsulation",
      ],
    },
    {
      id: "java-04-collections-generics",
      conceptIds: ["java.collections", "java.generics", "java.list", "java.map"],
    },
    {
      id: "java-05-exceptions-debugging",
      conceptIds: ["java.exceptions", "java.checked-exceptions", "java.debugging"],
    },
    {
      id: "java-06-review-practice",
      conceptIds: ["java.problem-decomposition", "java.testing", "java.complexity"],
    },
  ];

  assert.equal(language?.status, "available");
  assert.equal(lessons.length, 6);
  assert.deepEqual(
    lessons.map(({ id, conceptIds }) => ({ id, conceptIds })),
    expectedLessons,
  );
  assert.deepEqual(
    lessons.map((lesson) => lesson.order),
    [1, 2, 3, 4, 5, 6],
  );
  assert.ok(lessons.every((lesson) => lesson.objectives.length === 4));
  assert.ok(
    lessons.every(
      (lesson) =>
        lesson.source.kind === "bam-authored" &&
        lesson.source.verifiedAt === "2026-08-19",
    ),
  );

  for (const lesson of lessons) {
    const markdown = await readFile(
      new URL(`../${lesson.contentFile}`, import.meta.url),
      "utf8",
    );
    assert.match(markdown, /^# /);
    assert.match(markdown, /## 학습 목표/);
    assert.match(markdown, /## 먼저 관찰하기/);
    assert.match(markdown, /## 최소 구현/);
    assert.match(markdown, /## (?:최종 )?확인 문제/);
    assert.match(markdown, /https:\/\/docs\.oracle\.com\/(?:en\/java\/javase\/25|javase\/specs\/jls\/se25)/);
    assert.match(markdown, /```java/);
    assert.doesNotMatch(markdown, /비밀\s*테스트|숨김\s*테스트/);
  }

  assert.deepEqual(validateQuizCollection(quiz, curriculum), []);
  assert.equal(quiz.questions.length, 12);
  assert.equal(
    quiz.questions.some((question) => question.id === "quiz-java-method-return"),
    true,
  );
  assert.equal(new Set(quiz.questions.map((question) => question.id)).size, 12);

  for (const lesson of lessons) {
    const questions = quiz.questions.filter(
      (question) => question.lessonId === lesson.id,
    );
    assert.equal(questions.length, 2, `${lesson.id}: 문항이 정확히 2개여야 합니다.`);
    assert.deepEqual(
      questions.map((question) => question.difficulty).sort(),
      ["application", "basic"],
    );
    for (const question of questions) {
      assert.ok(lesson.conceptIds.includes(question.conceptId));
      assert.deepEqual(
        question.options.map((option) => option.id).sort(),
        ["a", "b", "c", "d"],
      );
      assert.equal(
        question.options.filter((option) => option.isCorrect).length,
        1,
      );
      assert.ok(question.options.every((option) => option.feedback.trim()));
    }
  }
});

test("Java 공식 출처 기록은 SE 25와 Java 21 호환 범위를 명시한다", async () => {
  const sources = await readFile(
    new URL("../docs/references/java-official-sources.md", import.meta.url),
    "utf8",
  );

  assert.match(sources, /확인일: 2026-08-19/);
  assert.match(sources, /Java 21/);
  assert.match(sources, /Java SE 25/);
  assert.match(sources, /jls\/se25\/html\/jls-4\.html/);
  assert.match(sources, /jls\/se25\/html\/jls-8\.html/);
  assert.match(sources, /jls\/se25\/html\/jls-10\.html/);
  assert.match(sources, /jls\/se25\/html\/jls-11\.html/);
  assert.match(sources, /jls\/se25\/html\/jls-14\.html/);
  assert.match(sources, /java\/util\/List\.html/);
  assert.match(sources, /java\/util\/Map\.html/);
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
  crossedPath.lessons.find((lesson) => lesson.courseId === "css").contentFile =
    "content/lessons/html/cascade-and-box-model.md";
  assert.ok(
    validateCurriculum(crossedPath).some((error) =>
      error.includes("해당 과정 디렉터리"),
    ),
  );
});
