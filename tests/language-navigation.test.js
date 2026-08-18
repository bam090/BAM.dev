import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderLanguageNavigation } from "../src/ui/language-navigation.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("HTML·CSS 정식 과정과 Java 샘플을 첫 교안으로 연결한다", () => {
  const html = renderLanguageNavigation({
    curriculum,
    currentLanguageId: "css",
  });

  assert.match(html, /<nav class="language-nav" aria-label="언어 선택">/);
  assert.equal((html.match(/class="language-nav-link/g) ?? []).length, 4);
  assert.equal((html.match(/>정식 과정</g) ?? []).length, 3);
  assert.equal((html.match(/>샘플</g) ?? []).length, 1);
  assert.match(html, /href="#\/learn\/html\/document-structure-and-semantics"/);
  assert.match(html, /href="#\/learn\/css\/css-rules-selectors-values"[^>]*aria-current="true"/);
  assert.match(html, /href="#\/learn\/java\/types-and-methods"/);
});

test("교안이 없는 planned 언어는 링크 대신 준비 중 상태로 표시한다", () => {
  const planned = structuredClone(curriculum);
  planned.languages.find((language) => language.id === "java").status = "planned";
  planned.lessons = planned.lessons.filter((lesson) => lesson.languageId !== "java");

  const html = renderLanguageNavigation({
    curriculum: planned,
    currentLanguageId: "javascript",
  });

  assert.match(
    html,
    /<span class="language-nav-link is-disabled" aria-disabled="true">[\s\S]*?Java[\s\S]*?준비 중/,
  );
  assert.doesNotMatch(html, /href="#\/learn\/java\//);
});

test("언어 내비게이션의 동적 문구를 HTML로 실행하지 않는다", () => {
  const unsafe = structuredClone(curriculum);
  unsafe.languages[0].name = '<img src=x onerror="alert(1)">';

  const html = renderLanguageNavigation({
    curriculum: unsafe,
    currentLanguageId: "javascript",
  });

  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});
