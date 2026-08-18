import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";

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
    async openReviewRoute(languageId) {
      opened.push({ view: "review", languageId });
    },
    async openLessonRoute() {
      opened.push({ view: "lesson" });
    },
  });
  return { app, opened };
}

test("sample 언어의 객관식 해시를 JavaScript로 되돌리지 않고 연다", async (t) => {
  const replacements = installWindow(t, "#/review/html");
  const { app, opened } = createRouteHarness();

  await app.openRoute();

  assert.deepEqual(opened, [{ view: "review", languageId: "html" }]);
  assert.deepEqual(replacements, []);
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
