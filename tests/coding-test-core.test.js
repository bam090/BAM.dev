import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertValidCodingTestCollection,
  filterCodingTestProblems,
  findCodingTestProblemBySlug,
  getCodingTestProblemsInOrder,
  getCodingTestPublicTestsForMode,
  loadCodingTestCollection,
  validateCodingTestCollection,
} from "../src/core/coding-test.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/javascript.json", import.meta.url), "utf8"),
);

test("코딩테스트 컬렉션의 런타임 계약이 현재 콘텐츠를 승인한다", () => {
  assert.deepEqual(validateCodingTestCollection(collection, curriculum), []);
  assert.equal(assertValidCodingTestCollection(collection, curriculum), collection);
});

test("문제 순서와 slug 탐색은 원본 배열을 변경하지 않는다", () => {
  const reversed = [...collection.problems].reverse();
  const snapshot = structuredClone(reversed);
  const ordered = getCodingTestProblemsInOrder(reversed);

  assert.deepEqual(ordered.map((problem) => problem.order), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(reversed, snapshot);
  assert.equal(
    findCodingTestProblemBySlug(collection, "find-first-position")?.id,
    "coding-test-javascript-first-position",
  );
  assert.equal(findCodingTestProblemBySlug(collection, "not-present"), null);
  assert.equal(findCodingTestProblemBySlug(collection, "bad/slug"), null);
});

test("run은 runTestIds 부분집합, submit은 모든 공개 테스트를 순서대로 선택한다", () => {
  for (const problem of collection.problems) {
    const runTests = getCodingTestPublicTestsForMode(problem, "run");
    const submitTests = getCodingTestPublicTestsForMode(problem, "submit");

    assert.deepEqual(runTests.map((item) => item.id), problem.runTestIds);
    assert.deepEqual(submitTests.map((item) => item.id), problem.publicTests.map((item) => item.id));
    assert.ok(runTests.length < submitTests.length);
  }
  assert.throws(
    () => getCodingTestPublicTestsForMode(collection.problems[0], "hidden"),
    /run.*submit/,
  );
});

test("검색·난이도·유형·풀이 상태 필터를 함께 적용한다", () => {
  const completedProblemIds = [
    "coding-test-javascript-target-words",
    "coding-test-javascript-first-position",
  ];

  assert.deepEqual(
    filterCodingTestProblems(collection, { query: "이진 탐색" }).map((problem) => problem.slug),
    ["find-first-position"],
  );
  assert.deepEqual(
    filterCodingTestProblems(collection, { query: "js.arrays" }).map((problem) => problem.slug),
    [
      "count-target-words",
      "summarize-inventory",
      "longest-increasing-run",
      "sort-products-by-price",
    ],
  );
  assert.deepEqual(
    filterCodingTestProblems(collection, { difficulty: "advanced" }).map(
      (problem) => problem.slug,
    ),
    ["simulate-grid-robot"],
  );
  assert.deepEqual(
    filterCodingTestProblems(collection, { type: "object" }).map((problem) => problem.slug),
    ["summarize-inventory"],
  );
  assert.deepEqual(
    filterCodingTestProblems(collection, {
      status: "solved",
      completedProblemIds,
    }).map((problem) => problem.slug),
    ["count-target-words", "find-first-position"],
  );
  assert.deepEqual(
    filterCodingTestProblems(collection, {
      query: "배열",
      difficulty: "beginner",
      status: "unsolved",
      completedProblemIds,
    }).map((problem) => problem.slug),
    ["summarize-inventory", "longest-increasing-run"],
  );
});

test("order·교안·개념·runTestIds가 깨진 콘텐츠를 거부한다", () => {
  const invalid = structuredClone(collection);
  invalid.problems[0].order = 9;
  invalid.problems[1].lessonId = "missing-lesson";
  invalid.problems[2].conceptIds = ["js.not-present"];
  invalid.problems[3].runTestIds = ["not-present-test"];

  const errors = validateCodingTestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("order")));
  assert.ok(errors.some((error) => error.includes("존재하지 않는 교안")));
  assert.ok(errors.some((error) => error.includes("연결 교안에 없습니다")));
  assert.ok(errors.some((error) => error.includes("존재하지 않는 공개 테스트")));
});

test("동일 ID·slug·공개 테스트 ID와 누락된 실패 설명을 거부한다", () => {
  const invalid = structuredClone(collection);
  invalid.problems[1].id = invalid.problems[0].id;
  invalid.problems[2].slug = invalid.problems[0].slug;
  invalid.problems[3].publicTests[0].id = invalid.problems[0].publicTests[0].id;
  invalid.problems[4].failureExplanations.pop();

  const errors = validateCodingTestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("문제 ID가 중복")));
  assert.ok(errors.some((error) => error.includes("slug가 중복")));
  assert.ok(errors.some((error) => error.includes("공개 테스트 ID가 중복")));
  assert.ok(errors.some((error) => error.includes("1:1")));
});

test("언어별 고정 경로에서 컬렉션을 불러오고 요청 언어 불일치를 거부한다", async () => {
  const requestedPaths = [];
  const loaded = await loadCodingTestCollection("javascript", curriculum, async (path) => {
    requestedPaths.push(path);
    return { ok: true, json: async () => structuredClone(collection) };
  });

  assert.equal(loaded.languageId, "javascript");
  assert.deepEqual(requestedPaths, ["./content/coding-tests/javascript.json"]);
  await assert.rejects(() => loadCodingTestCollection("../javascript", curriculum), /허용되지 않은/);

  const mismatched = structuredClone(collection);
  mismatched.languageId = "html";
  await assert.rejects(
    () =>
      loadCodingTestCollection("javascript", curriculum, async () => ({
        ok: true,
        json: async () => mismatched,
      })),
    /검증 실패|언어/,
  );
});
