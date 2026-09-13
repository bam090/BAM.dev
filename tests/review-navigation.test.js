import assert from "node:assert/strict";
import test from "node:test";
import { parseLessonHash, parseReviewHash } from "../src/core/navigation.js";
import { buildKeywordReviewHash, buildReviewLessonHash, getReviewRouteOptions } from "../src/core/review-navigation.js";

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
