import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BamLearningApp,
  loadAvailableCodeQuestCollectionsSafely,
} from "../src/app.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

function installWindow(t, hash) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const replacements = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash },
      history: {
        replaceState(_state, _title, nextHash) {
          replacements.push(nextHash);
          globalThis.window.location.hash = nextHash;
        },
      },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });
  return replacements;
}

function createRouteHarness(curriculumOverride = curriculum) {
  const app = Object.create(BamLearningApp.prototype);
  const opened = [];
  Object.assign(app, {
    curriculum: curriculumOverride,
    pendingQuestDraftSave: null,
    questDraftSaveTimer: null,
    activeQuestExecution: null,
    activeCodingTestExecution: null,
    pendingCodingTestSearchRender: null,
    codingTestSearchRenderTimer: null,
    pendingCodingTestDraftSave: null,
    codingTestDraftSaveTimer: null,
    openCodingTestListRoute() {
      opened.push({ view: "coding-test-list" });
    },
    async openCodingTestRoute(languageId, slug) {
      opened.push({ view: "coding-test", languageId, slug });
    },
    async openReviewRoute(languageId) {
      opened.push({ view: "review", languageId });
    },
    async openCodeQuestRoute(languageId, slug) {
      opened.push({ view: "quest", languageId, slug });
    },
    async openLessonRoute() {
      opened.push({ view: "lesson" });
    },
    openMyPageRoute() {
      opened.push({ view: "my-page" });
    },
  });
  return { app, opened };
}

test("마이페이지와 잘못된 마이페이지 하위 경로를 전용 화면으로 연다", async (t) => {
  const replacements = installWindow(t, "#/my");
  const { app, opened } = createRouteHarness();

  await app.openRoute();
  assert.deepEqual(opened, [{ view: "my-page" }]);

  window.location.hash = "#/my/private";
  await app.openRoute();
  assert.deepEqual(opened.at(-1), { view: "my-page" });
  assert.equal(replacements.at(-1), "#/my");
});

test("탐색 가능한 언어의 객관식 해시를 JavaScript로 되돌리지 않고 연다", async (t) => {
  const replacements = installWindow(t, "#/review/html");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "review", languageId: "html" }]);
  assert.deepEqual(replacements, []);
});

test("HTML·CSS 정식 언어의 Code Quest 해시를 해당 언어로 연다", async (t) => {
  const replacements = installWindow(t, "#/quest/html/document-structure");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [
    { view: "quest", languageId: "html", slug: "document-structure" },
  ]);
  assert.deepEqual(replacements, []);
});

test("Java 정식 과정의 Code Quest 해시를 해당 언어로 연다", async (t) => {
  const replacements = installWindow(t, "#/quest/java/java-level-label");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [
    { view: "quest", languageId: "java", slug: "java-level-label" },
  ]);
  assert.deepEqual(replacements, []);
});

test("사용 가능한 Code Quest 컬렉션을 병렬 로드하고 언어별 실패를 격리한다", async () => {
  const calls = [];
  const collections = await loadAvailableCodeQuestCollectionsSafely(
    curriculum,
    async (languageId) => {
      calls.push(languageId);
      if (languageId === "css") throw new Error("CSS fixture failure");
      return { languageId, quests: [] };
    },
  );

  assert.deepEqual(new Set(calls), new Set(["javascript", "html", "css", "java"]));
  assert.deepEqual([...collections.keys()].sort(), ["html", "java", "javascript"]);
  assert.equal(collections.get("html").languageId, "html");
  assert.equal(collections.get("java").languageId, "java");
  assert.equal(collections.has("css"), false);
});

test("Java 정식 과정의 코딩테스트 문제 해시를 Java 실행 화면으로 연다", async (t) => {
  const replacements = installWindow(t, "#/coding-tests/java/sum-values");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [
    { view: "coding-test", languageId: "java", slug: "sum-values" },
  ]);
  assert.deepEqual(replacements, []);
});

test("코딩테스트가 없는 정식 언어의 문제 해시는 목록으로 안전하게 복귀한다", async (t) => {
  const replacements = installWindow(t, "#/coding-tests/html/document-structure");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "coding-test-list" }]);
  assert.deepEqual(replacements, ["#/coding-tests"]);
});

test("등록되지 않은 객관식 언어는 기본 JavaScript 교안으로 안전하게 복귀한다", async (t) => {
  const replacements = installWindow(t, "#/review/python");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "lesson" }]);
  assert.deepEqual(replacements, ["#/learn/javascript/javascript-and-runtime"]);
});

test("planned 언어의 객관식 해시는 기본 JavaScript 교안으로 안전하게 복귀한다", async (t) => {
  const replacements = installWindow(t, "#/review/html");
  const plannedCurriculum = {
    ...curriculum,
    languages: curriculum.languages.map((language) =>
      language.id === "html" ? { ...language, status: "planned" } : language,
    ),
  };
  const { app, opened } = createRouteHarness(plannedCurriculum);

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "lesson" }]);
  assert.deepEqual(replacements, ["#/learn/javascript/javascript-and-runtime"]);
});

test("코딩테스트와 이름만 비슷한 해시는 일반 교안 라우팅으로 넘긴다", async (t) => {
  const replacements = installWindow(t, "#/coding-tests-archive");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "lesson" }]);
  assert.deepEqual(replacements, []);
});

test("코딩테스트 네임스페이스 안의 잘못된 해시는 목록으로 안전하게 복귀한다", async (t) => {
  const replacements = installWindow(t, "#/coding-tests/javascript");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "coding-test-list" }]);
  assert.deepEqual(replacements, ["#/coding-tests"]);
});
