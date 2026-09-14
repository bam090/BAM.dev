import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderCourseNavigation } from "../src/ui/language-navigation.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("기존 6개 과정과 별도 Spring 과정을 표시하고 CS 준비 중 상태를 유지한다", () => {
  const html = renderCourseNavigation({
    curriculum,
    currentCourseId: "css",
  });

  assert.match(html, /<nav class="language-nav" aria-label="과정 선택">/);
  assert.equal((html.match(/class="course-category"/g) ?? []).length, 4);
  assert.equal((html.match(/class="language-nav-link/g) ?? []).length, 7);
  assert.equal((html.match(/>정식 과정</g) ?? []).length, 7);
  assert.equal((html.match(/>샘플</g) ?? []).length, 0);
  assert.match(html, /<strong>CS<\/strong>[\s\S]*?준비 중/);
  assert.match(html, /href="#\/learn\/html\/document-structure-and-semantics"/);
  assert.match(html, /href="#\/learn\/css\/css-rules-selectors-values"[^>]*aria-current="true"/);
  assert.match(html, /href="#\/learn\/java\/types-and-methods"/);
  assert.match(html, /href="#\/learn\/algorithm\//);
  const expectedCourses = [
    ["#/learn/javascript-notes/values", "JavaScript 학습문서", "정식 과정"],
    ["#/learn/javascript/javascript-and-runtime", "JavaScript", "정식 과정"],
    ["#/learn/html/document-structure-and-semantics", "HTML", "정식 과정"],
    ["#/learn/css/css-rules-selectors-values", "CSS", "정식 과정"],
    ["#/learn/algorithm/stack-and-queue", "알고리즘", "정식 과정"],
    ["#/learn/java/types-and-methods", "Java", "정식 과정"],
    ["#/learn/spring/framework-boot", "Spring · Spring Boot", "정식 과정"],
  ];
  const links = [...html.matchAll(/<a class="language-nav-link[^>]*>[\s\S]*?<\/a>/g)].map(([markup]) => markup);
  assert.deepEqual(
    links.map((link) => link.match(/href="([^"]+)"/)[1]).sort(),
    expectedCourses.map(([href]) => href).sort(),
    "Spring 첫 문서 진입을 추가하며 기존 6개 과정의 경로를 대체하거나 중복하지 않습니다.",
  );
  for (const [href, name, status] of expectedCourses) {
    const link = links.find((markup) => markup.includes(`href="${href}"`));
    assert.ok(link.includes(`<strong>${name}</strong>`));
    assert.ok(link.includes(`<small>${status}</small>`));
    assert.equal(link.includes('aria-current="true"'), name === "CSS");
  }

  const notesHtml = renderCourseNavigation({ curriculum, currentCourseId: "javascript-notes" });
  assert.match(notesHtml, /href="#\/learn\/javascript-notes\/values"[^>]*aria-current="true"/);
  assert.equal((notesHtml.match(/aria-current="true"/g) ?? []).length, 1);

  const springHtml = renderCourseNavigation({ curriculum, currentCourseId: "spring" });
  const springCategory = springHtml.match(/<section class="course-category" aria-label="Spring">[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(springCategory, /href="#\/learn\/spring\/framework-boot"[^>]*aria-current="true"/);
  assert.match(springCategory, /<strong>Spring · Spring Boot<\/strong>/);
  assert.doesNotMatch(springCategory, /href="#\/learn\/java\//);
  assert.equal((springHtml.match(/aria-current="true"/g) ?? []).length, 1);
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
