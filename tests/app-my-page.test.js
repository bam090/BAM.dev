import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { MemoryStorage } from "../src/repositories/browser-storage.js";
import {
  LocalStorageProgressRepository,
  PROGRESS_STORAGE_KEY,
} from "../src/repositories/progress-repository.js";

const minimumCurriculum = {
  categories: [{ id: "language", status: "available" }],
  languages: [
    { id: "javascript", name: "JavaScript", shortName: "JS", accent: "javascript", status: "available" },
  ],
  courses: [
    { id: "javascript", categoryId: "language", languageId: "javascript", name: "JavaScript", shortName: "JS", accent: "javascript", status: "available" },
  ],
  lessons: [
    { id: "js-current", courseId: "javascript", languageId: "javascript", slug: "current", title: "현재 문서" },
  ],
};

function installBrowserGlobals(t, hash = "#/my") {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { hash },
      history: { replaceState() {} },
      scrollTo() {},
      requestAnimationFrame(callback) {
        callback();
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { title: "" },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
}

test("#/my는 lesson fallback 전에 MyPage route로 연다", async (t) => {
  installBrowserGlobals(t);
  let opened = 0;
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum: minimumCurriculum,
    currentView: "lesson",
    leaveCurrentView() {},
    async openMyPageRoute() {
      await Promise.resolve();
      opened += 1;
    },
    openLessonRoute() {
      assert.fail("#/my를 교안 fallback으로 열면 안 됩니다.");
    },
  });

  await app.openRoute();

  assert.equal(opened, 1);
});

test("MyPage 진입은 catalog 준비를 기다리고 stale sequence에서는 최종 기록 화면을 덮어쓰지 않는다", async (t) => {
  installBrowserGlobals(t);
  const createApp = ({ becomeStale = false } = {}) => {
    const calls = [];
    const app = Object.create(BamLearningApp.prototype);
    Object.assign(app, {
      root: { innerHTML: "" },
      renderSequence: 4,
      enterView() {
        calls.push("enter");
        return 4;
      },
      renderServiceShell: ({ mainContent }) => mainContent,
      syncMenuState() {
        calls.push("sync");
      },
      async loadSidebarCatalog() {
        calls.push("load-start");
        await Promise.resolve();
        calls.push("load-end");
        if (becomeStale) this.renderSequence = 5;
      },
      renderMyPage() {
        calls.push("render");
      },
      finishServiceNavigation() {
        calls.push("finish");
      },
    });
    return { app, calls };
  };

  const current = createApp();
  await current.app.openMyPageRoute();
  assert.deepEqual(current.calls, [
    "enter",
    "sync",
    "load-start",
    "load-end",
    "render",
    "finish",
  ]);
  assert.equal(document.title, "마이페이지 · BAM.dev");

  document.title = "다른 화면";
  const stale = createApp({ becomeStale: true });
  await stale.app.openMyPageRoute();
  assert.deepEqual(stale.calls, ["enter", "sync", "load-start", "load-end"]);
  assert.equal(document.title, "다른 화면");
});

test("MyPage 조회는 저장된 progress를 쓰지 않고 현재 화면을 렌더링한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(
    storage,
    () => new Date("2026-08-23T12:00:00.000Z"),
  );
  repository.setLessonCompleted("js-current", true);
  const before = storage.getItem(PROGRESS_STORAGE_KEY);
  const root = { innerHTML: "" };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum: minimumCurriculum,
    quizCollections: new Map(),
    codeQuestCollections: new Map(),
    codingTestCollection: null,
    webProjectCollection: null,
    progressRepository: repository,
    webProjectRepository: {
      getState: () => ({ drafts: [], submissions: [] }),
      getPersistenceStatus: () => ({ isPersistent: false }),
    },
    renderServiceShell: ({ mainContent }) => `<div data-test-shell>${mainContent}</div>`,
    syncMenuState() {},
  });

  app.renderMyPage();

  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), before);
  assert.match(root.innerHTML, /data-test-shell/);
  assert.match(root.innerHTML, /마이페이지/);
  assert.match(root.innerHTML, /완료한 교안<\/dt><dd>1<span>\/1<\/span>/);
});

test("공유 저장소 읽기 실패는 메모리 저장 상태로 오인하지 않고 화면을 유지한다", () => {
  const root = { innerHTML: "" };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum: minimumCurriculum,
    quizCollections: new Map(),
    codeQuestCollections: new Map(),
    codingTestCollection: null,
    webProjectCollection: null,
    progressRepository: {
      getProgress() {
        throw new Error("read blocked");
      },
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    webProjectRepository: {
      getState() {
        throw new Error("read blocked");
      },
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    renderServiceShell: ({ mainContent }) => `<div data-test-shell>${mainContent}</div>`,
    syncMenuState() {},
  });

  assert.doesNotThrow(() => app.renderMyPage());

  assert.match(root.innerHTML, /마이페이지/);
  assert.match(root.innerHTML, /기록을 읽지 못|불러오지 못/);
  assert.doesNotMatch(root.innerHTML, /현재 탭에만 임시 저장 중/);
  assert.match(root.innerHTML, /확인 불가/);
});
