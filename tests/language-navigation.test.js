import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderCourseNavigation } from "../src/ui/language-navigation.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("언어·알고리즘 과정과 CS 준비 중 상태를 표시한다", () => {
  const html = renderCourseNavigation({
    curriculum,
    currentCourseId: "css",
  });

  assert.match(html, /<nav class="language-nav" aria-label="과정 선택">/);
  assert.equal((html.match(/class="course-category"/g) ?? []).length, 3);
  assert.equal((html.match(/class="language-nav-link/g) ?? []).length, 5);
  assert.equal((html.match(/>정식 과정</g) ?? []).length, 5);
  assert.match(html, /<strong>CS<\/strong>[\s\S]*?준비 중/);
  assert.match(html, /href="#\/learn\/html\/document-structure-and-semantics"/);
  assert.match(html, /href="#\/learn\/css\/css-rules-selectors-values"[^>]*aria-current="true"/);
  assert.match(html, /href="#\/learn\/java\/types-and-methods"/);
  assert.match(html, /href="#\/learn\/algorithm\//);
});

test("교안이 없는 planned 과정은 링크 대신 준비 중 상태로 표시한다", () => {
  const planned = structuredClone(curriculum);
  planned.courses.find((course) => course.id === "java").status = "planned";
  planned.lessons = planned.lessons.filter((lesson) => lesson.courseId !== "java");

  const html = renderCourseNavigation({
    curriculum: planned,
    currentCourseId: "javascript",
  });

  assert.match(
    html,
    /<span class="language-nav-link is-disabled" aria-disabled="true">[\s\S]*?Java[\s\S]*?준비 중/,
  );
  assert.doesNotMatch(html, /href="#\/learn\/java\//);
});

test("과정 내비게이션의 동적 문구를 HTML로 실행하지 않는다", () => {
  const unsafe = structuredClone(curriculum);
  unsafe.categories[0].name = '<img src=x onerror="alert(1)">';
  unsafe.courses[0].name = '<img src=x onerror="alert(1)">';

  const html = renderCourseNavigation({
    curriculum: unsafe,
    currentCourseId: "javascript",
  });

  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
