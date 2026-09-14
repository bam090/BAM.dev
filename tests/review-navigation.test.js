import assert from "node:assert/strict";
import test from "node:test";
import { parseLessonHash, parseReviewHash } from "../src/core/navigation.js";
import { buildKeywordReviewHash, buildReviewLessonHash, getKeywordReviewScope, getReviewRouteOptions } from "../src/core/review-navigation.js";

test("키워드 query를 붙여도 기존 언어·단원 깊은 경로를 보존한다", () => {
  const hash = buildKeywordReviewHash("javascript", "js-notes-functions", "js.function-return");
  assert.equal(hash, "#/review/javascript/js-notes-functions?concept=js.function-return");
  assert.deepEqual(parseReviewHash(hash), { languageId: "javascript", lessonId: "js-notes-functions" });
  assert.equal(getReviewRouteOptions(hash).conceptId, "js.function-return");
  assert.equal(buildKeywordReviewHash("javascript"), "#/review/javascript");
});

test("문서 복귀 토큰·heading은 URL 데이터로 인코딩하고 문서 경로를 유지한다", () => {
  const lesson = { courseId: "java script", slug: "함수/반환" };
  const hash = buildReviewLessonHash(lesson, "session-one", "`map`, `filter` & 함수?");
  assert.deepEqual(parseLessonHash(hash), lesson);
  assert.deepEqual(getReviewRouteOptions(hash), {
    conceptId: null, returnToken: "session-one", heading: "`map`, `filter` & 함수?",
  });
  assert.equal(hash.includes(" & "), false);
});

test("직접 문서와 query 없는 경로에는 복귀 문맥이 없으며 외부 return URL을 해석하지 않는다", () => {
  for (const hash of ["#/learn/javascript/functions", "#/", undefined, "#/learn/javascript/functions?return=https://example.com"]) {
    assert.deepEqual(getReviewRouteOptions(hash), { conceptId: null, returnToken: null, heading: null });
  }
});

test("모든 소유자의 상세 문서가 확인된 키워드만 합치고 불완전한 매핑은 원래 범위를 유지한다", () => {
  const curriculum = {
    courses: [
      { id: "notes", categoryId: "language", languageId: "javascript" },
      { id: "javascript", categoryId: "language", languageId: "javascript" },
    ],
    lessons: [
      { id: "old", courseId: "notes", languageId: "javascript", conceptIds: ["js.variables"] },
      { id: "new", courseId: "javascript", languageId: "javascript", conceptIds: ["js.variables"] },
      { id: "other", courseId: "javascript", languageId: "javascript", conceptIds: ["js.variables"] },
    ],
  };
  const collection = { languageId: "javascript", questions: [
    { id: "old-question", lessonId: "old", conceptId: "js.variables" },
    { id: "new-question", lessonId: "new", conceptId: "js.variables" },
    { id: "unrelated", lessonId: "new", conceptId: "js.operators" },
  ] };
  const concepts = [
    { id: "js.variables", lessonId: "old", documentLessonId: "new" },
    { id: "js.variables", lessonId: "new" },
  ];
  for (const owner of ["old", "new"]) {
    const scope = getKeywordReviewScope(curriculum, collection, concepts, owner, "js.variables");
    assert.equal(scope.lessonId, null);
    assert.deepEqual(scope.questions.map((question) => question.id), ["old-question", "new-question"]);
  }
  for (const [candidateCollection, candidateConcepts] of [
    [collection, concepts.slice(0, 1)],
    [collection, [concepts[0], { ...concepts[1], documentLessonId: "other" }]],
    [{ ...collection, languageId: "java" }, concepts],
    [{ ...collection, questions: [collection.questions[0]] }, concepts],
  ]) {
    const scope = getKeywordReviewScope(curriculum, candidateCollection, candidateConcepts, "old", "js.variables");
    assert.equal(scope.lessonId, "old");
    assert.deepEqual(scope.questions.map((question) => question.id), ["old-question"]);
  }
  assert.deepEqual(getKeywordReviewScope(curriculum, collection, concepts, "missing", "js.variables"), { lessonId: "missing", questions: [] });
});
