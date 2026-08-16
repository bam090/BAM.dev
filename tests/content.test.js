import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertValidCurriculum, getLessonsForLanguage, validateCurriculum } from "../src/core/content.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("커리큘럼 메타데이터가 유효하다", () => {
  assert.deepEqual(validateCurriculum(curriculum), []);
  assert.equal(assertValidCurriculum(curriculum), curriculum);
});

test("JavaScript 교안은 1부터 7까지 순서대로 제공된다", () => {
  const lessons = getLessonsForLanguage(curriculum, "javascript");
  assert.equal(lessons.length, 7);
  assert.deepEqual(
    lessons.map((lesson) => lesson.order),
    [1, 2, 3, 4, 5, 6, 7],
  );
  assert.ok(lessons.every((lesson) => lesson.objectives.length === 4));
});

test("중복 교안 ID와 끊어진 순서를 거부한다", () => {
  const invalid = structuredClone(curriculum);
  invalid.lessons[1].id = invalid.lessons[0].id;
  invalid.lessons[1].order = 9;
  const errors = validateCurriculum(invalid);
  assert.ok(errors.some((error) => error.includes("교안 ID가 중복")));
  assert.ok(errors.some((error) => error.includes("order는 1부터 연속")));
});
