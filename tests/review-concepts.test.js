import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getReviewDocumentLesson, validateReviewConcepts } from "../src/core/review-navigation.js";

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const curriculum = await load("../content/curriculum.json");
const data = await load("../content/review-concepts.json");
const collection = await load("../content/quizzes/javascript.json");
const pilotLessonIds = ["js-notes-values", "js-notes-functions", "js-notes-collections"];
const pilotConcepts = data.concepts.filter((concept) => pilotLessonIds.includes(concept.lessonId));

test("첫 묶음의 13문항·9개념은 안정 ID로 세 원문 교안에 연결된다", () => {
  const questions = collection.questions.filter((question) => pilotLessonIds.includes(question.lessonId));
  assert.equal(questions.length, 13);
  assert.equal(pilotConcepts.length, 9);
  assert.equal(new Set(pilotConcepts.map((concept) => concept.id)).size, 9);
  assert.deepEqual(validateReviewConcepts(data, curriculum), data.concepts);
  for (const question of questions) {
    assert.equal(data.concepts.filter((concept) => concept.id === question.conceptId && concept.lessonId === question.lessonId).length, 1, question.id);
  }
  assert.deepEqual([...new Set(pilotConcepts.map((concept) => concept.lessonId))].sort(), pilotLessonIds.toSorted());
});

test("개념 발췌는 대상 heading 아래의 승인된 기존 원문과 정확히 일치한다", async () => {
  for (const concept of data.concepts) {
    const lesson = curriculum.lessons.find((item) => item.id === (concept.documentLessonId ?? concept.lessonId));
    const source = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const headings = [...source.matchAll(/^(#{1,6}) (.+)$/gm)];
    const heading = headings.find((match) => match[2] === concept.heading);
    assert.ok(heading, `${concept.id}: 실제 heading 없음`);
    const next = headings.find((match) => match.index > heading.index && match[1].length <= heading[1].length);
    const section = source.slice(heading.index + heading[0].length, next?.index ?? source.length);
    assert.ok(section.includes(concept.excerpt), `${concept.id}: 원문 발췌 불일치`);
    assert.deepEqual(Object.keys(concept).sort(), ["id", "title", "lessonId", "heading", "excerpt", ...(concept.documentLessonId ? ["documentLessonId"] : [])].sort());
    assert.doesNotMatch(JSON.stringify(concept), /\/Users\/|profile\/|개인용|source-note/);
  }
});

test("HTML 문항 10개만 새 문서로 연결하고 DOM·텍스트 의미 문항은 기존 교안에 남긴다", async () => {
  const { questions } = await load("../content/quizzes/html.json");
  const htmlConcepts = data.concepts.filter((concept) => concept.documentLessonId);
  const expectedTargets = {
    "quiz-html-semantic-main": "semantic-structure",
    "quiz-html-link-destination": "links-buttons",
    "quiz-html-alt-context": "image-alternatives",
    "quiz-html-list-order": "lists",
    "quiz-html-table-header-scope": "tables",
    "quiz-html-form-name-submission": "input-names",
    "quiz-html-label-association": "input-names",
    "quiz-html-validation-boundary": "constraint-validation",
    "quiz-html-checker-purpose": "inspection",
    "quiz-html-profile-structure-audit": "integration",
  };
  assert.equal(questions.length, 12);
  assert.equal(htmlConcepts.length, 10);
  for (const question of questions) {
    const concept = htmlConcepts.find((item) => item.id === question.conceptId && item.lessonId === question.lessonId);
    if (expectedTargets[question.id]) {
      assert.equal(concept?.documentLessonId, `html-notes-${expectedTargets[question.id]}`, question.id);
      assert.equal(getReviewDocumentLesson(curriculum, concept)?.id, concept.documentLessonId);
      assert.notEqual(concept.lessonId, concept.documentLessonId);
    } else {
      assert.equal(concept, undefined, `${question.id}: 원문 범위 밖 문항을 새 문서에 연결하지 않는다.`);
    }
  }
});

test("문서 대상은 원래 문제 소유와 같은 과정·언어·개념이어야 한다", () => {
  const valid = data.concepts.find((concept) => concept.documentLessonId);
  assert.ok(valid);
  for (const invalid of [
    { ...valid, documentLessonId: "missing" }, { ...valid, documentLessonId: " " },
    { ...valid, documentLessonId: "js-notes-values" }, { ...valid, id: "html.unknown" },
  ]) {
    assert.deepEqual(validateReviewConcepts({ schemaVersion: 1, concepts: [invalid] }, curriculum), []);
    assert.equal(getReviewDocumentLesson(curriculum, invalid), null);
  }
  for (const field of ["courseId", "languageId", "conceptIds"]) {
    const invalid = structuredClone(curriculum);
    const document = invalid.lessons.find((item) => item.id === valid.documentLessonId);
    document[field] = field === "conceptIds" ? [] : "javascript";
    assert.equal(getReviewDocumentLesson(invalid, valid), null, field);
    assert.deepEqual(validateReviewConcepts({ schemaVersion: 1, concepts: [valid] }, invalid), [], field);
  }
  assert.equal(getReviewDocumentLesson(curriculum, pilotConcepts[0])?.id, pilotConcepts[0].lessonId);
});

test("개념 검증은 알 수 없는 버전·없는 교안·잘못된 개념 연결·중복을 노출하지 않는다", () => {
  const valid = data.concepts[0];
  assert.deepEqual(validateReviewConcepts({ ...data, schemaVersion: 2 }, curriculum), []);
  assert.deepEqual(validateReviewConcepts(null, curriculum), []);
  for (const invalid of [
    { ...valid, lessonId: "missing" }, { ...valid, id: "js.unknown" },
    { ...valid, excerpt: " " }, { ...valid, heading: 12 }, null,
  ]) {
    assert.deepEqual(validateReviewConcepts({ schemaVersion: 1, concepts: [invalid, valid, valid] }, curriculum), [valid]);
  }
});
