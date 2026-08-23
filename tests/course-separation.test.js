import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp, supportsCodingTests } from "../src/app.js";
import {
  getLessonsForCourse,
  getLessonsForLanguage,
} from "../src/core/content.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

function createShellHarness() {
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    root: { innerHTML: "" },
    menuOpen: false,
    codeQuestCollections: new Map(),
    progressRepository: {
      getProgress() {
        return { completedLessonIds: [] };
      },
    },
    getCodingTestCollectionForLanguage() {
      return null;
    },
    getSolvedCodingTestProblemIds() {
      return new Set();
    },
    getWebProjectNavigationOptions() {
      return null;
    },
    syncMenuState() {},
  });
  return app;
}

test("JavaScript 언어 과정 7개와 알고리즘 12개를 실행 언어 합계 19개와 구분한다", () => {
  assert.equal(getLessonsForCourse(curriculum, "javascript").length, 7);
  assert.equal(getLessonsForCourse(curriculum, "algorithm").length, 12);
  assert.equal(getLessonsForLanguage(curriculum, "javascript").length, 19);
});

test("알고리즘 교안 셸은 12개 목차만 표시하고 미제공 평가 기능은 숨긴다", () => {
  const app = createShellHarness();
  const lesson = getLessonsForCourse(curriculum, "algorithm")[0];
  app.currentLesson = lesson;
  app.currentMarkdown = `# ${lesson.title}`;

  app.renderLesson();

  assert.match(app.root.innerHTML, /0\/12 완료/);
  assert.equal((app.root.innerHTML.match(/class="lesson-link/g) ?? []).length, 12);
  assert.match(app.root.innerHTML, /href="#\/learn\/algorithm\//);
  assert.doesNotMatch(app.root.innerHTML, /class="review-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="quest-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="coding-test-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="web-project-nav"/);
  assert.match(app.root.innerHTML, /class="my-page-nav"/);
});

test("코딩테스트 셸은 JavaScript 정식 과정 7개만 사용하고 Java·마이페이지를 보존한다", () => {
  const app = createShellHarness();
  const progress = { completedLessonIds: [] };
  app.codingTestCollection = { languageId: "javascript", problems: [] };

  app.renderCodingTestShell(
    '<main id="lesson-content" tabindex="-1">코딩테스트</main>',
    progress,
    new Set(),
  );

  const lessonNavigation =
    app.root.innerHTML.match(/<nav class="lesson-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(app.root.innerHTML, /0\/7 완료/);
  assert.equal((lessonNavigation.match(/class="lesson-link/g) ?? []).length, 7);
  assert.doesNotMatch(lessonNavigation, /href="#\/learn\/algorithm\//);
  assert.match(app.root.innerHTML, /class="my-page-nav"/);
  assert.equal(typeof BamLearningApp.prototype.openMyPageRoute, "function");
  assert.equal(supportsCodingTests("java"), true);
});
