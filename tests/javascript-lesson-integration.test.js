import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { getLessonsForCourse } from "../src/core/content.js";
import { getAdjacentLessons, resolveLessonRoute } from "../src/core/navigation.js";
import { getReviewDocumentLesson } from "../src/core/review-navigation.js";
import { LocalStorageProgressRepository, MemoryStorage, PROGRESS_STORAGE_KEY } from "../src/repositories/progress-repository.js";
import { renderMarkdown, splitLessonOverview, splitMarkdownSection } from "../src/ui/markdown.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const curriculum = JSON.parse(await read("content/curriculum.json"));
const { concepts } = JSON.parse(await read("content/review-concepts.json"));
const quiz = JSON.parse(await read("content/quizzes/javascript.json"));
const digest = (value) => createHash("sha256").update(value).digest("hex");
// Approved design, independent of the current curriculum and reading destinations.
const mergedInto = {
  "js-concept-shallow-copy": "js-concept-object-sharing",
  "js-concept-event-defaults": "js-concept-event-delegation",
  "js-concept-promise-chain": "js-concept-async-await",
};
const targetIds = Object.values(mergedInto);
const reviewRows = [
  ["js-notes-collections", "js.object-sharing", targetIds[0], "filter도 요소 객체까지 복제하지 않는다", true],
  ["js-concept-shallow-copy", "js.shallow-copy", targetIds[0], "바꿀 중첩 단계까지 새로 만들기", true],
  ["js-concept-event-defaults", "web.event-defaults", targetIds[1], "기본 동작 취소와 이벤트 전파 중단은 다른 일이다", true],
  ["js-06-async-fetch", "js.promise", targetIds[2], "Promise는 나중 결과를 나타내는 객체다", true],
  ["js-concept-promise-chain", "js.promise", targetIds[2], "Promise는 나중 결과를 나타내는 객체다", true],
  ["js-concept-object-sharing", "js.object-identity", targetIds[0], "매개변수에 다른 객체를 다시 넣으면", false],
  ["js-05-dom-events", "web.event-delegation", targetIds[1], "이벤트는 부모 쪽으로 전달될 수 있다", false],
  ["js-concept-event-delegation", "web.event-delegation", targetIds[1], "이벤트는 부모 쪽으로 전달될 수 있다", false],
  ["js-concept-async-await", "js.async-failures", targetIds[2], "실패 처리", false],
];

test("JS 통합은 승인한 세 묶음만 변경하고 기존 ID·URL·order·문항 소유를 보존한다", async () => {
  // Baseline 02c363f plus approved Spring consolidation: omit only the allowed JS metadata changes.
  // Hash derived independently from the frozen Spring source, not the combined working tree.
  const protectedCurriculum = structuredClone(curriculum);
  for (const lesson of protectedCurriculum.lessons) {
    if (targetIds.includes(lesson.id)) {
      for (const field of ["title", "summary", "essentialQuestion", "objectives", "conceptIds"]) delete lesson[field];
    }
    if (Object.hasOwn(mergedInto, lesson.id)) delete lesson.archivedFromCatalog;
  }
  assert.equal(digest(JSON.stringify(protectedCurriculum)), "bd255f0a354af01afb39f544219a5b751f0686d2e5454175fe67b49f3f6a5681");
  const lessons = getLessonsForCourse(curriculum, "javascript");
  assert.equal(lessons.length, 40);
  const active = lessons.filter((lesson) => !lesson.archivedFromCatalog);
  assert.equal(active.length, 30);
  assert.equal(lessons.filter((lesson) => lesson.archivedFromCatalog).length, 10);
  for (const lesson of lessons) assert.equal(resolveLessonRoute(curriculum, `#/learn/javascript/${lesson.slug}`)?.id, lesson.id);
  for (const [sourceId, targetId] of Object.entries(mergedInto)) {
    const source = lessons.find((lesson) => lesson.id === sourceId);
    const target = lessons.find((lesson) => lesson.id === targetId);
    assert.equal(source.archivedFromCatalog, true, sourceId);
    assert.equal(Boolean(target.archivedFromCatalog), false, targetId);
    for (const id of source.conceptIds) assert.ok(target.conceptIds.includes(id), id);
  }
  for (const [id, previous, next] of [
    [targetIds[0], "js-concept-array-methods", "js-concept-scope-hoisting"],
    [targetIds[1], "js-concept-forms-state", "js-concept-errors-input"],
    [targetIds[2], "js-concept-debugging", "js-concept-async-state"],
  ]) {
    const adjacent = getAdjacentLessons(active, id);
    assert.deepEqual([adjacent.previous?.id, adjacent.next?.id], [previous, next], id);
  }
  for (const [path, hash] of [
    ["content/quizzes/javascript.json", "1c708ee87766834b6f21475022f36fa23bc5483eee1b1caa3510ced0cea302b2"],
    ["content/quests/javascript.json", "f33f6d993921e0a3da4588fa39a2e79439d0078dc3dfb8950f3d6718f8da17af"],
    ["content/coding-tests/javascript.json", "7d150c725108c827efd2512b6179db8f7157cfa302b7307a5752c36ba09e22e4"],
    ["content/lessons/javascript/wiki-shallow-copy.md", "18f05fcbf33bcc1c0c43fc78141c8cdd426684c7425cf2fa8708f611c7e1d50d"],
    ["content/lessons/javascript/wiki-event-defaults.md", "04e0741af6e099c29665c9a399c3680721a51f59260d23cc39e1ce7cd2246ec0"],
    ["content/lessons/javascript/wiki-promise-chain.md", "85017a9da48268c860bbfb33ab5aef987913582125489ef634f9b9a543a72eec"],
  ]) assert.equal(digest(await read(path)), hash, path);
});

test("JS 발췌 아홉 행은 원래 소유와 heading을 유지하고 승인된 활성 절로 이동한다", async () => {
  const protectedConcepts = structuredClone(concepts);
  for (const [ownerId, conceptId, targetId, heading, redirected] of reviewRows) {
    const matches = concepts.filter((concept) => concept.lessonId === ownerId && concept.id === conceptId);
    assert.equal(matches.length, 1, `${ownerId}:${conceptId}`);
    const concept = matches[0];
    assert.equal(concept.heading, heading);
    const document = getReviewDocumentLesson(curriculum, concept);
    assert.equal(document?.id, targetId);
    assert.equal(Boolean(document.archivedFromCatalog), false);
    const markdown = await read(document.contentFile);
    const headings = [...markdown.matchAll(/^(#{1,6}) (.+)$/gm)];
    const matchingHeadings = headings.filter((match) => match[2] === heading);
    assert.equal(matchingHeadings.length, 1, heading);
    const start = matchingHeadings[0];
    const end = headings.find((match) => match.index > start.index && match[1].length <= start[1].length);
    assert.ok(concept.excerpt.trim());
    assert.ok(markdown.slice(start.index + start[0].length, end?.index ?? markdown.length).includes(concept.excerpt), `${ownerId}:${conceptId}`);
    assert.ok(quiz.questions.some((question) => question.lessonId === ownerId && question.conceptId === conceptId));
    const protectedRow = protectedConcepts.find((row) => row.lessonId === ownerId && row.id === conceptId);
    delete protectedRow.excerpt;
    if (redirected) delete protectedRow.documentLessonId;
  }
  // Every other row, owner, title and heading stays pinned to the independently frozen Spring baseline.
  assert.equal(digest(JSON.stringify(protectedConcepts)), "81122add51df5ee3e751ca750d97f0e97ac81c8fc4273a0f92a7f7acf2430ce6");
});

function lessonApp(lesson, markdown, repository) {
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root: { innerHTML: "" }, curriculum, currentLesson: lesson, currentMarkdown: markdown,
    progressRepository: repository, quizCollections: new Map([["javascript", quiz]]), reviewConcepts: concepts,
    renderServiceShell: ({ mainContent }) => mainContent, syncMenuState: () => {},
  });
  return app;
}

test("JS 통합 문서의 직접답은 접히고 보관 문서 열람은 원래 완료 ID를 그대로 둔다", async () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage);
  const completed = Object.keys(mergedInto);
  for (const id of completed) repository.setLessonCompleted(id, true);
  const saved = storage.getItem(PROGRESS_STORAGE_KEY);
  for (const id of [...completed, ...targetIds]) {
    const lesson = curriculum.lessons.find((item) => item.id === id);
    const markdown = await read(lesson.contentFile);
    const app = lessonApp(lesson, markdown, repository);
    app.renderLesson();
    const html = app.root.innerHTML;
    const answer = html.match(/<details\b[^>]*id="lesson-answer"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
    const section = splitMarkdownSection(markdown, "핵심 질문 답").section;
    assert.ok(section.trim(), id);
    assert.ok(answer.includes(renderMarkdown(section, { preserveParagraphLineBreaks: true })), id);
    assert.doesNotMatch(answer.split(">")[0], /\sopen(?:\s|$)/);
    assert.ok(html.includes(`data-toggle-complete aria-pressed="${completed.includes(id)}"`), id);
    assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), saved, id);
  }
  assert.deepEqual(new LocalStorageProgressRepository(storage).getProgress().completedLessonIds.toSorted(), completed.toSorted());
});

test("JS 통합 세 문서의 목표는 plain·backtick 차이에도 metadata fallback 중복 없이 한 번 표시한다", async () => {
  for (const id of targetIds) {
    const lesson = curriculum.lessons.find((item) => item.id === id);
    const markdown = await read(lesson.contentFile);
    const overview = splitLessonOverview(splitMarkdownSection(markdown, lesson.answerHeading).body);
    assert.equal(overview.summary, "", id);
    const objectives = overview.objectives.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2).replaceAll("`", ""));
    assert.equal(objectives.length, 3, id);
    assert.deepEqual(objectives, lesson.objectives, id);
    const app = lessonApp(lesson, markdown, new LocalStorageProgressRepository(new MemoryStorage()));
    app.renderLesson();
    const outcomes = app.root.innerHTML.match(/<div class="lesson-summary lesson-learning-outcomes"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.equal(outcomes, renderMarkdown(overview.objectives, { preserveParagraphLineBreaks: true }), id);
    assert.equal((outcomes.match(/<li>/g) ?? []).length, 3, id);
  }
});
