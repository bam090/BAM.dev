import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForCourse } from "../src/core/content.js";
import {
  buildCodingTestHash,
  buildCodingTestListHash,
  buildLessonHash,
  buildMyPageHash,
  buildQuestHash,
  buildReviewHash,
  buildWebProjectHash,
  buildWebProjectListHash,
  getAdjacentLessons,
  parseCodingTestHash,
  parseLessonHash,
  parseMyPageHash,
  parseQuestHash,
  parseReviewHash,
  parseWebProjectHash,
  resolveLessonRoute,
} from "../src/core/navigation.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("교안 해시를 만들고 다시 해석한다", () => {
  const hash = buildLessonHash("javascript", "functions-scope-closure");
  assert.equal(hash, "#/learn/javascript/functions-scope-closure");
  assert.deepEqual(parseLessonHash(hash), {
    courseId: "javascript",
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

test("Web Project 목록과 상세 해시를 만들고 다시 해석한다", () => {
  assert.equal(buildWebProjectListHash(), "#/web-projects");
  assert.equal(
    buildWebProjectHash("learning board/시안"),
    "#/web-projects/learning%20board%2F%EC%8B%9C%EC%95%88",
  );
  assert.deepEqual(parseWebProjectHash("#/web-projects"), { kind: "list" });
  assert.deepEqual(parseWebProjectHash("#/web-projects/"), { kind: "list" });
  assert.deepEqual(
    parseWebProjectHash("#/web-projects/responsive-learning-plan"),
    { kind: "project", slug: "responsive-learning-plan" },
  );
});

test("잘못된 Web Project 해시는 해석하지 않는다", () => {
  assert.equal(parseWebProjectHash("#/web-projects/one/two"), null);
  assert.equal(parseWebProjectHash("#/web-projects/%E0%A4%A"), null);
  assert.equal(parseWebProjectHash("#/web-project"), null);
});

test("마이페이지 해시를 만들고 정확한 경로만 해석한다", () => {
  assert.equal(buildMyPageHash(), "#/my");
  assert.deepEqual(parseMyPageHash("#/my"), { kind: "my-page" });
  assert.deepEqual(parseMyPageHash("#/my/"), { kind: "my-page" });
  assert.equal(parseMyPageHash("#/my/records"), null);
  assert.equal(parseMyPageHash("#/my-page"), null);
});

test("잘못된 경로에서는 마지막 교안 또는 첫 교안을 선택한다", () => {
  assert.equal(resolveLessonRoute(curriculum, "#/missing", "js-03-functions-scope-closure").order, 3);
  assert.equal(resolveLessonRoute(curriculum, "#/missing", "not-found").order, 1);
});

test("planned 과정의 직접 경로와 최근 교안은 탐색 가능한 기본 교안으로 복귀한다", () => {
  const planned = structuredClone(curriculum);
  planned.courses.find((course) => course.id === "html").status = "planned";

  const direct = resolveLessonRoute(
    planned,
    "#/learn/html/document-structure-and-semantics",
  );
  const restored = resolveLessonRoute(planned, "#/missing", "html-01-document-structure");

  assert.equal(direct.id, "js-01-runtime");
  assert.equal(restored.id, "js-01-runtime");
});

test("기존 JavaScript 알고리즘 딥링크 8개를 알고리즘 과정으로 호환 이동한다", () => {
  const legacySlugs = [
    "implementation-and-string-simulation",
    "hash-map-set",
    "stack-and-queue",
    "sorting-two-pointers-sliding-window",
    "brute-force-backtracking-recursion",
    "bfs-dfs-graph-grid",
    "heap-and-greedy",
    "binary-search-and-dynamic-programming",
  ];

  for (const slug of legacySlugs) {
    const lesson = resolveLessonRoute(curriculum, `#/learn/javascript/${slug}`);
    assert.equal(lesson.courseId, "algorithm", slug);
  }
});

test("planned 카테고리 아래 과정은 직접 학습 경로를 열지 않는다", () => {
  const planned = structuredClone(curriculum);
  planned.categories.find((category) => category.id === "algorithm").status = "planned";
  const algorithmLesson = getLessonsForCourse(planned, "algorithm")[0];

  const resolved = resolveLessonRoute(
    planned,
    buildLessonHash(algorithmLesson.courseId, algorithmLesson.slug),
  );

  assert.equal(resolved.id, "js-01-runtime");
});

test("현재 교안의 이전과 다음을 계산한다", () => {
  for (const courseId of ["javascript", "algorithm"]) {
    const lessons = getLessonsForCourse(curriculum, courseId);
    assert.equal(getAdjacentLessons(lessons, lessons[0].id).previous, null);
    assert.equal(getAdjacentLessons(lessons, lessons[0].id).next?.order ?? null, 2);
    assert.equal(getAdjacentLessons(lessons, lessons.at(-1).id).next, null);
  }
});
