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

test("첫 묶음의 13문항·9개념은 세 원문 소유 ID를 보존한다", () => {
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
  const htmlConcepts = data.concepts.filter((concept) => concept.id.startsWith("html.") && concept.documentLessonId);
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

test("CSS 기존 12문항은 문제 소유를 유지하고 판단 범위에 맞는 새 문서로 연결한다", async () => {
  const { questions } = await load("../content/quizzes/css.json");
  const cssConcepts = data.concepts.filter((concept) => concept.id.startsWith("css."));
  const expectedTargets = {
    "quiz-css-selector-compound-descendant": "selectors",
    "quiz-css-unit-inheritance-context": "units",
    "quiz-css-cascade-winner": "cascade",
    "quiz-css-border-box": "box-model",
    "quiz-css-display-formatting": "display",
    "quiz-css-overflow-spacing-choice": "overflow",
    "quiz-css-flex-axis": "flexbox",
    "quiz-css-grid-position-choice": "layout-review",
    "quiz-css-media-query-condition": "responsive",
    "quiz-css-focus-motion-accessibility": "motion",
    "quiz-css-debugging-cascade-step": "layout-review",
    "quiz-css-layout-tool-choice": "layout-review",
  };
  assert.equal(questions.length, 47);
  assert.equal(cssConcepts.length, 38);
  for (const questionId of Object.keys(expectedTargets)) {
    const question = questions.find((item) => item.id === questionId);
    assert.ok(question, `${questionId}: 기존 문항 ID를 보존한다.`);
    const matches = cssConcepts.filter((concept) => concept.id === question.conceptId && concept.lessonId === question.lessonId);
    assert.equal(matches.length, 1, question.id);
    const concept = matches[0];
    assert.equal(concept.documentLessonId, `css-notes-${expectedTargets[question.id]}`, question.id);
    assert.equal(getReviewDocumentLesson(curriculum, concept)?.id, concept.documentLessonId);
    assert.notEqual(question.lessonId, concept.documentLessonId);
  }
  const added = questions.filter((question) => !Object.hasOwn(expectedTargets, question.id));
  assert.equal(added.length, 35);
  for (const question of added) {
    const matches = cssConcepts.filter((concept) => concept.id === question.conceptId && concept.lessonId === question.lessonId);
    assert.equal(matches.length, 1, question.id);
    const lesson = getReviewDocumentLesson(curriculum, matches[0]);
    assert.equal(lesson?.id, question.lessonId, question.id);
    assert.equal(lesson?.courseId, "css", question.id);
    assert.equal(Boolean(lesson?.archivedFromCatalog), false, question.id);
  }
});

test("문서 대상은 원래 문제의 언어·개념과 승인된 과정 경계를 지켜야 한다", () => {
  const valid = data.concepts.find((concept) => concept.id.startsWith("html.") && concept.documentLessonId);
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
  assert.equal(getReviewDocumentLesson(curriculum, pilotConcepts[0])?.id, pilotConcepts[0].documentLessonId);
});

test("같은 언어의 language 과정 간 문서 연결은 허용하고 알고리즘·다른 언어·없는 개념은 거부한다", () => {
  const source = {
    courses: [
      { id: "notes", categoryId: "language", languageId: "javascript" },
      { id: "javascript", categoryId: "language", languageId: "javascript" },
      { id: "algorithm", categoryId: "algorithm", languageId: "javascript" },
    ],
    lessons: [
      { id: "old", courseId: "notes", languageId: "javascript", conceptIds: ["js.variables"] },
      { id: "new", courseId: "javascript", languageId: "javascript", conceptIds: ["js.variables"] },
    ],
  };
  const concept = { id: "js.variables", lessonId: "old", documentLessonId: "new", title: "재대입", heading: "변수", excerpt: "이름에 새 값을 넣습니다." };
  assert.equal(getReviewDocumentLesson(source, concept)?.id, "new");
  assert.deepEqual(validateReviewConcepts({ schemaVersion: 1, concepts: [concept] }, source), [concept]);
  for (const change of [
    (candidate) => { candidate.lessons[1].courseId = "algorithm"; },
    (candidate) => { candidate.lessons[0].courseId = "algorithm"; },
    (candidate) => { candidate.lessons[1].languageId = "java"; },
    (candidate) => { candidate.courses[1].languageId = "java"; },
    (candidate) => { candidate.lessons[1].conceptIds = []; },
    (candidate) => { candidate.lessons[0].conceptIds = []; },
    (candidate) => { candidate.lessons.pop(); },
  ]) {
    const invalid = structuredClone(source);
    change(invalid);
    assert.equal(getReviewDocumentLesson(invalid, concept), null);
    assert.deepEqual(validateReviewConcepts({ schemaVersion: 1, concepts: [concept] }, invalid), []);
  }
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
