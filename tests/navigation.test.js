import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCodingTestHash,
  buildCodingTestListHash,
  buildLessonHash,
  buildQuestHash,
  buildReviewHash,
  getAdjacentLessons,
  parseCodingTestHash,
  parseLessonHash,
  parseQuestHash,
  parseReviewHash,
  resolveLessonRoute,
} from "../src/core/navigation.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("교안 해시를 만들고 다시 해석한다", () => {
  const hash = buildLessonHash("javascript", "functions-scope-closure");
  assert.equal(hash, "#/learn/javascript/functions-scope-closure");
  assert.deepEqual(parseLessonHash(hash), {
    languageId: "javascript",
    slug: "functions-scope-closure",
  });
});

test("객관식 복습 해시를 만들고 다시 해석한다", () => {
  assert.equal(buildReviewHash("javascript"), "#/review/javascript");
  assert.deepEqual(parseReviewHash("#/review/javascript"), { languageId: "javascript" });
  assert.deepEqual(parseReviewHash("#/review/javascript/"), { languageId: "javascript" });
});

test("잘못된 객관식 복습 해시는 해석하지 않는다", () => {
  assert.equal(parseReviewHash("#/review"), null);
  assert.equal(parseReviewHash("#/review/javascript/extra"), null);
  assert.equal(parseReviewHash("#/review/%E0%A4%A"), null);
});

test("Code Quest 해시를 만들고 다시 해석한다", () => {
  assert.equal(
    buildQuestHash("javascript", "delivery-fee-policy"),
    "#/quest/javascript/delivery-fee-policy",
  );
  assert.deepEqual(parseQuestHash("#/quest/javascript/delivery-fee-policy"), {
    languageId: "javascript",
    slug: "delivery-fee-policy",
  });
  assert.deepEqual(parseQuestHash("#/quest/javascript/delivery-fee-policy/"), {
    languageId: "javascript",
    slug: "delivery-fee-policy",
  });
});

test("잘못된 Code Quest 해시는 해석하지 않는다", () => {
  assert.equal(parseQuestHash("#/quest/javascript"), null);
  assert.equal(parseQuestHash("#/quest/javascript/delivery-fee-policy/extra"), null);
  assert.equal(parseQuestHash("#/quest/javascript/%E0%A4%A"), null);
});

test("코딩테스트 목록과 문제 해시를 만들고 다시 해석한다", () => {
  assert.equal(buildCodingTestListHash(), "#/coding-tests");
  assert.equal(
    buildCodingTestHash("java script", "pair/search"),
    "#/coding-tests/java%20script/pair%2Fsearch",
  );
  assert.deepEqual(parseCodingTestHash("#/coding-tests"), { kind: "list" });
  assert.deepEqual(parseCodingTestHash("#/coding-tests/"), { kind: "list" });
  assert.deepEqual(parseCodingTestHash("#/coding-tests/javascript/pair-sum"), {
    kind: "problem",
    languageId: "javascript",
    slug: "pair-sum",
  });
});

test("잘못된 코딩테스트 해시는 해석하지 않는다", () => {
  assert.equal(parseCodingTestHash("#/coding-tests/javascript"), null);
  assert.equal(parseCodingTestHash("#/coding-tests/javascript/pair-sum/extra"), null);
  assert.equal(parseCodingTestHash("#/coding-tests/%E0%A4%A/pair-sum"), null);
});

test("잘못된 경로에서는 마지막 교안 또는 첫 교안을 선택한다", () => {
  assert.equal(resolveLessonRoute(curriculum, "#/missing", "js-03-functions-scope-closure").order, 3);
  assert.equal(resolveLessonRoute(curriculum, "#/missing", "not-found").order, 1);
});

test("planned 언어의 직접 경로와 최근 교안은 탐색 가능한 기본 교안으로 복귀한다", () => {
  const planned = structuredClone(curriculum);
  planned.languages.find((language) => language.id === "html").status = "planned";

  const direct = resolveLessonRoute(
    planned,
    "#/learn/html/document-structure-and-semantics",
  );
  const restored = resolveLessonRoute(planned, "#/missing", "html-01-document-structure");

  assert.equal(direct.id, "js-01-runtime");
  assert.equal(restored.id, "js-01-runtime");
});

test("현재 교안의 이전과 다음을 계산한다", () => {
  const lessons = curriculum.lessons.filter((lesson) => lesson.languageId === "javascript");
  assert.equal(getAdjacentLessons(lessons, "js-01-runtime").previous, null);
  assert.equal(getAdjacentLessons(lessons, "js-01-runtime").next.order, 2);
  assert.equal(getAdjacentLessons(lessons, "js-07-review-practice").next, null);
});
