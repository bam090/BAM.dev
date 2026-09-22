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
const javaCodeQuests = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
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
    openCodeQuestCatalogRoute() {
      opened.push({ view: "quest-catalog" });
    },
    async openReviewRoute(languageId, lessonId) {
      opened.push({ view: "review", languageId, ...(lessonId ? { lessonId } : {}) });
    },
    async openCodeQuestRoute(languageId, slug) {
      opened.push({ view: "quest", languageId, slug });
    },
    async openLessonRoute() {
      opened.push({ view: "lesson" });
    },
  });
  return { app, opened };
}

test("HTML과 정적 제공 중인 Java의 객관식 해시는 해당 언어로 연다", async (t) => {
  const replacements = installWindow(t, "#/review/html");
  assert.equal(curriculum.languages.find((language) => language.id === "java")?.status, "available");
  for (const languageId of ["html", "java"]) {
    window.location.hash = `#/review/${languageId}`;
    const { app, opened } = createRouteHarness();
    await app.openRoute();
    assert.deepEqual(opened, [{ view: "review", languageId }]);
  }
  assert.deepEqual(replacements, []);
});

test("교안별 객관식 해시의 세 번째 경로를 단원 선택으로 전달한다", async (t) => {
  const replacements = installWindow(t, "#/review/javascript/js-notes-functions");
  const { app, opened } = createRouteHarness();
  await app.openRoute();
  assert.deepEqual(opened, [{ view: "review", languageId: "javascript", lessonId: "js-notes-functions" }]);
  assert.deepEqual(replacements, []);
});

test("Code Quest 제공 언어인 JavaScript·HTML·CSS의 해시는 해당 과제로 연다", async (t) => {
  const replacements = installWindow(t, "#/quest/html/document-structure");
  for (const [languageId, slug] of [
    ["javascript", "delivery-fee-policy"],
    ["html", "document-structure"],
    ["css", "learning-notice"],
  ]) {
    window.location.hash = `#/quest/${languageId}/${slug}`;
    const { app, opened } = createRouteHarness();
    await app.openRoute();
    assert.deepEqual(opened, [{ view: "quest", languageId, slug }]);
  }
  assert.deepEqual(replacements, []);
});

test("Code Quest 목록 해시는 상세 경로와 구분해 탐색기를 연다", async (t) => {
  const replacements = installWindow(t, "#/quest/?from=home");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "quest-catalog" }]);
  assert.deepEqual(replacements, []);
});

test("Java 실행 capability가 없어도 정식 Quest 상세와 저장된 초안을 연다", async (t) => {
  const replacements = installWindow(t, "#/quest/java/types-and-methods");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: { title: "" },
  });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
  const app = Object.create(BamLearningApp.prototype);
  const opened = [];
  Object.assign(window, {
    scrollTo() {},
    requestAnimationFrame(callback) { callback(); },
  });
  Object.assign(app, {
    curriculum,
    javaCodeQuestCapability: { available: false },
    codeQuestCollections: new Map([["java", javaCodeQuests]]),
    codeQuestCollection: { languageId: "javascript" },
    codeQuestState: { quest: { id: "old-quest" } },
    renderSequence: 0,
    hasRenderedView: false,
    root: { innerHTML: "" },
    progressRepository: {
      getQuestDraft(questId) {
        return questId === "quest-java-total-price"
          ? { source: "public class Solution { /* 저장한 Java 초안 */ }" }
          : null;
      },
      getPersistenceStatus() { return { isPersistent: true }; },
    },
    enterView(view) {
      opened.push(view);
      this.renderSequence += 1;
      return this.renderSequence;
    },
    renderServiceShell({ mainContent }) { return mainContent; },
    syncMenuState() {},
    renderCodeQuest() { opened.push("java-detail"); },
    focusCodeQuestTitle() {},
    renderFatalError(error) { throw error; },
  });
  assert.equal(curriculum.languages.find((language) => language.id === "java")?.status, "available");

  await app.openCodeQuestRoute("java", "types-and-methods");

  assert.deepEqual(opened, ["quest", "java-detail"]);
  assert.equal(app.codeQuestCollection, javaCodeQuests);
  assert.equal(app.codeQuestState.quest.id, "quest-java-total-price");
  assert.equal(app.codeQuestState.source, "public class Solution { /* 저장한 Java 초안 */ }");
  assert.equal(app.codeQuestState.draftStatus, "saved");
  assert.equal(app.javaCodeQuestCapability.available, false);
  assert.deepEqual(replacements, ["#/quest/java/total-price"]);
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
