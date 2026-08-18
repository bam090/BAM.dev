import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForLanguage, validateCurriculum } from "../src/core/content.js";
import { validateQuizCollection } from "../src/core/quiz.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

const SAMPLE_CONTRACTS = [
  {
    languageId: "html",
    lessonId: "html-01-document-structure",
    conceptIds: ["html.document-structure", "html.semantics"],
    quizId: "quiz-html-semantic-main",
    sourceHost: "html.spec.whatwg.org",
  },
  {
    languageId: "css",
    lessonId: "css-01-cascade-box-model",
    conceptIds: ["css.cascade", "css.box-model"],
    quizId: "quiz-css-border-box",
    sourceHost: "www.w3.org",
  },
  {
    languageId: "java",
    lessonId: "java-01-types-methods",
    conceptIds: ["java.types", "java.methods"],
    quizId: "quiz-java-method-return",
    sourceHost: "docs.oracle.com",
  },
];

test("HTML·CSS·Java는 각각 한 개의 언어 중립 샘플 교안 계약을 사용한다", async () => {
  for (const contract of SAMPLE_CONTRACTS) {
    const language = curriculum.languages.find(
      (item) => item.id === contract.languageId,
    );
    const lessons = getLessonsForLanguage(curriculum, contract.languageId);

    assert.ok(language, `${contract.languageId}: 언어 메타데이터가 필요합니다.`);
    assert.equal(language.status, "sample");
    assert.equal(lessons.length, 1);
    assert.equal(lessons[0].id, contract.lessonId);
    assert.equal(lessons[0].order, 1);
    assert.deepEqual(lessons[0].conceptIds, contract.conceptIds);
    assert.equal(lessons[0].source.kind, "bam-authored");
    assert.match(
      lessons[0].contentFile,
      new RegExp(`^content/lessons/${contract.languageId}/`),
    );

    const markdown = await readFile(
      new URL(`../${lessons[0].contentFile}`, import.meta.url),
      "utf8",
    );
    assert.match(markdown, /^# /);
    assert.match(markdown, /## 학습 목표/);
    assert.match(markdown, /## (?:최종 )?확인 문제/);
    assert.match(markdown, new RegExp(`https://${contract.sourceHost.replaceAll(".", "\\.")}/`));
    assert.doesNotMatch(markdown, /비밀\s*테스트|숨김\s*테스트/);
  }
});

test("각 샘플 언어의 객관식 한 문항이 같은 교안·개념과 연결된다", async () => {
  const allQuestionIds = new Set();

  for (const contract of SAMPLE_CONTRACTS) {
    const quiz = JSON.parse(
      await readFile(
        new URL(`../content/quizzes/${contract.languageId}.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.deepEqual(validateQuizCollection(quiz, curriculum), []);
    assert.equal(quiz.languageId, contract.languageId);
    assert.equal(quiz.questions.length, 1);

    const [question] = quiz.questions;
    assert.equal(question.id, contract.quizId);
    assert.equal(question.lessonId, contract.lessonId);
    assert.ok(contract.conceptIds.includes(question.conceptId));
    assert.equal(question.options.length, 4);
    assert.equal(question.options.filter((option) => option.isCorrect).length, 1);
    assert.ok(question.options.every((option) => option.feedback.trim().length > 0));
    assert.equal(allQuestionIds.has(question.id), false);
    allQuestionIds.add(question.id);
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

test("sample 언어의 교안 누락과 다른 언어 디렉터리 경로를 거부한다", () => {
  const missingSampleLesson = structuredClone(curriculum);
  missingSampleLesson.lessons = missingSampleLesson.lessons.filter(
    (lesson) => lesson.languageId !== "html",
  );
  assert.ok(
    validateCurriculum(missingSampleLesson).some(
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
