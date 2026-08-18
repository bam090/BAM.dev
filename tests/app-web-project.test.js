import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BamLearningApp,
  createWebProjectRequestId,
  loadWebProjectCollectionSafely,
} from "../src/app.js";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";
import { scoreWebProject } from "../src/grading/web-project-scoring.js";
import { MemoryStorage } from "../src/repositories/browser-storage.js";
import { LocalStorageWebProjectRepository } from "../src/repositories/web-project-repository.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const project = collection.projects[0];

test("Web Project 실행 ID는 탭별 난수값으로 같은 시각·순서 충돌을 피한다", () => {
  const first = createWebProjectRequestId("submit", 1_700_000_000_000, 1, "tab-a");
  const second = createWebProjectRequestId("submit", 1_700_000_000_000, 1, "tab-b");

  assert.notEqual(first, second);
  assert.match(first, /^web-project-submit-[a-z0-9]+-1-tab-a$/u);
  assert.throws(
    () => createWebProjectRequestId("submit", 1_700_000_000_000, 1, "unsafe/value"),
    /난수값/,
  );
});

function installWindow(t, hash = "#/web-projects") {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
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
      requestAnimationFrame() {},
      cancelAnimationFrame() {},
      scrollTo() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      title: "",
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
  return replacements;
}

function createFiles() {
  return project.files.map((file) => ({
    path: file.path,
    languageId: file.languageId,
    source: file.starterSource,
  }));
}

function createManualAssessments() {
  return project.manualCriteria.map((criterion) => ({
    criterionId: criterion.id,
    status: "pending",
    levelId: null,
  }));
}

function createReport(submission, outcomes = null) {
  const automaticResults = project.automaticCriteria.map((criterion, index) => ({
    criterionId: criterion.id,
    outcome: outcomes?.[index] ?? "passed",
    expected: true,
    actual: true,
    error: null,
    durationMs: 0,
  }));
  return {
    contractVersion: 1,
    submissionId: submission.submissionId,
    projectId: project.id,
    projectRevision: project.revision,
    outcome: automaticResults.every((result) => result.outcome === "passed")
      ? "passed"
      : automaticResults[0].outcome,
    automaticResults,
    score: scoreWebProject(project, {
      automaticResults: automaticResults.map(({ criterionId, outcome }) => ({
        criterionId,
        outcome,
      })),
      manualAssessments: submission.manualAssessments,
    }),
    durationMs: 1,
    limits: { maxFileBytes: 20 * 1024, maxTotalBytes: 64 * 1024 },
    error: null,
  };
}

function createExecutionHarness() {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    () => new Date("2026-08-18T00:00:00.000Z"),
  );
  const reports = [];
  const app = Object.create(BamLearningApp.prototype);
  const state = {
    project,
    files: createFiles(),
    activeFilePath: "index.html",
    manualAssessments: createManualAssessments(),
    isRunning: false,
    cancelRequested: false,
    executionMode: null,
    draftStatus: "saved",
    uiError: null,
    report: null,
    reportPersistenceStatus: null,
    previewSize: "wide",
  };
  Object.assign(app, {
    currentView: "web-project",
    webProjectCollection: collection,
    webProjectState: state,
    webProjectRepository: repository,
    executionCoordinator: new ExecutionCoordinator(),
    webProjectRequestSequence: 0,
    webProjectRunner: {
      async run({ submission }, { signal }) {
        assert.equal(signal instanceof AbortSignal, true);
        const report = createReport(submission);
        reports.push(report);
        return report;
      },
    },
    renderWebProject() {},
    focusWebProjectResults() {},
  });
  return { app, repository, reports, state };
}

test("Web Project 목록·상세·잘못된 하위 경로를 전용 라우트로 연다", async (t) => {
  const replacements = installWindow(t, "#/web-projects");
  const app = Object.create(BamLearningApp.prototype);
  const opened = [];
  Object.assign(app, {
    curriculum,
    openWebProjectListRoute() {
      opened.push({ view: "list" });
    },
    openWebProjectRoute(slug) {
      opened.push({ view: "project", slug });
    },
  });

  await app.openRoute();
  assert.deepEqual(opened, [{ view: "list" }]);

  window.location.hash = `#/web-projects/${project.slug}`;
  await app.openRoute();
  assert.deepEqual(opened.at(-1), { view: "project", slug: project.slug });

  window.location.hash = "#/web-projects/one/two";
  await app.openRoute();
  assert.deepEqual(opened.at(-1), { view: "list" });
  assert.equal(replacements.at(-1), "#/web-projects");
});

test("Web Project 콘텐츠 로드 실패는 다른 학습 기능을 막지 않도록 격리한다", async () => {
  const loaded = await loadWebProjectCollectionSafely(curriculum, async (input) => {
    assert.equal(input, curriculum);
    return collection;
  });
  assert.equal(loaded, collection);
  assert.equal(
    await loadWebProjectCollectionSafely(curriculum, async () => {
      throw new Error("broken");
    }),
    null,
  );
});

test("Web Project 초안은 두 파일의 마지막 스냅샷과 리비전을 함께 저장한다", () => {
  const timers = new Map();
  const saved = [];
  let nextTimerId = 1;
  const app = Object.create(BamLearningApp.prototype);
  const state = {
    project,
    files: createFiles(),
    draftToken: null,
    draftStatus: "starter",
    uiError: null,
  };
  Object.assign(app, {
    currentView: "web-project",
    webProjectState: state,
    setWebProjectDraftSaveTimer(callback) {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    },
    clearWebProjectDraftSaveTimer(id) {
      timers.delete(id);
    },
    webProjectRepository: {
      saveDraft(value, options) {
        assert.deepEqual(options, { expectedDraftToken: null });
        saved.push(structuredClone(value));
        return { ...structuredClone(value), updatedAt: "2026-08-18T00:00:00.000Z" };
      },
      getPersistenceStatus() {
        return { isPersistent: true };
      },
    },
    updateWebProjectDraftFeedback() {},
  });
  app.webProjectDraftSaveCoordinator = new DraftSaveCoordinator({
    delayMs: 250,
    persist: (pending) => app.persistWebProjectDraft(pending),
    setTimer: (callback) => app.setWebProjectDraftSaveTimer(callback),
    clearTimer: (timer) => app.clearWebProjectDraftSaveTimer(timer),
  });

  app.scheduleWebProjectDraftSave(state);
  state.files[0].source = "<!doctype html><main>최신</main>";
  state.files[1].source = "main { display: grid; }";
  app.scheduleWebProjectDraftSave(state);
  assert.equal(timers.size, 1);
  timers.values().next().value();

  assert.equal(saved.length, 1);
  assert.equal(saved[0].projectId, project.id);
  assert.equal(saved[0].projectRevision, project.revision);
  assert.equal(saved[0].files[0].source.includes("최신"), true);
  assert.equal(saved[0].files[1].source.includes("grid"), true);
  assert.equal(state.draftStatus, "saved");
  assert.equal(typeof state.draftToken, "string");
});

test("Web Project 초안 충돌은 경고 스타일과 alert 문구를 동적으로 갱신한다", (t) => {
  installWindow(t);
  const toggles = [];
  const status = {
    textContent: "",
    classList: {
      toggle(name, enabled) {
        toggles.push([name, enabled]);
      },
    },
  };
  const error = { textContent: "" };
  globalThis.document.querySelector = (selector) => {
    if (selector === "[data-web-project-draft-status]") return status;
    if (selector === "[data-web-project-error]") return error;
    return null;
  };
  const app = Object.create(BamLearningApp.prototype);
  app.webProjectState = {
    draftStatus: "conflict",
    uiError: "다른 탭에서 초안이 바뀌었습니다.",
  };

  app.updateWebProjectDraftFeedback();

  assert.match(status.textContent, /충돌/);
  assert.deepEqual(toggles, [["is-warning", true]]);
  assert.equal(error.textContent, "다른 탭에서 초안이 바뀌었습니다.");
});

test("Web Project 미리보기는 파일명이 아니라 languageId로 HTML과 CSS를 결합한다", () => {
  const app = Object.create(BamLearningApp.prototype);
  const frame = { srcdoc: "" };
  const status = {
    textContent: "",
    classList: { toggle() {} },
  };
  Object.assign(app, {
    currentView: "web-project",
    webProjectState: {
      files: [
        { path: "page.html", languageId: "html", source: "<main>다른 경로</main>" },
        { path: "assets/site.css", languageId: "css", source: "main { color: red; }" },
      ],
    },
    root: {
      querySelector(selector) {
        if (selector === "[data-web-project-preview]") return frame;
        if (selector === "[data-web-project-preview-status]") return status;
        return null;
      },
    },
  });

  app.syncWebProjectPreview();
  assert.match(frame.srcdoc, /다른 경로/);
  assert.match(frame.srcdoc, /data:text\/css/);
  assert.doesNotMatch(status.textContent, /비어 있지 않은/);
});

test("Web Project 초기화 확인을 취소하면 편집 내용과 저장소를 그대로 둔다", () => {
  const app = Object.create(BamLearningApp.prototype);
  const files = createFiles();
  files[0].source = "<!doctype html><main>지키기</main>";
  let clearCount = 0;
  Object.assign(app, {
    webProjectState: {
      project,
      files,
      isRunning: false,
    },
    confirmWebProjectReset() {
      return false;
    },
    webProjectRepository: {
      clearDraft() {
        clearCount += 1;
      },
    },
  });

  assert.equal(app.resetWebProjectFiles(), false);
  assert.equal(files[0].source.includes("지키기"), true);
  assert.equal(clearCount, 0);
});

test("공개 자동 검사는 기록하지 않고 유효한 제출만 source 없이 저장한다", async (t) => {
  installWindow(t);
  const { app, repository, reports } = createExecutionHarness();

  await app.executeCurrentWebProject("run");
  assert.equal(reports.length, 1);
  assert.equal(repository.listSubmissions().length, 0);

  await app.executeCurrentWebProject("submit");
  const submissions = repository.listSubmissions();
  assert.equal(reports.length, 2);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].projectId, project.id);
  assert.equal(Object.hasOwn(submissions[0], "files"), false);
  assert.equal(JSON.stringify(submissions).includes("<!doctype html>"), false);
  assert.equal(app.webProjectState.reportPersistenceStatus, "memory");
});

test("안전 검사 실패나 미완료 평가는 제출 기록으로 저장하지 않는다", async (t) => {
  installWindow(t);
  const { app, repository } = createExecutionHarness();
  app.webProjectRunner = {
    async run({ submission }) {
      return createReport(submission, [
        "invalid_source",
        ...project.automaticCriteria.slice(1).map(() => "not_run"),
      ]);
    },
  };

  await app.executeCurrentWebProject("submit");
  assert.equal(repository.listSubmissions().length, 0);
  assert.match(app.webProjectState.uiError, /소스 안전 검사/);
  assert.equal(app.webProjectState.reportPersistenceStatus, null);
});

test("제출 중 화면을 떠나면 취소 결과를 저장하거나 렌더하지 않는다", async (t) => {
  installWindow(t);
  const { app, repository } = createExecutionHarness();
  let resolveReport;
  let renderCount = 0;
  app.renderWebProject = () => {
    renderCount += 1;
  };
  app.webProjectRunner = {
    run({ submission }, { signal }) {
      return new Promise((resolve) => {
        resolveReport = () => {
          const outcomes = [
            "cancelled",
            ...project.automaticCriteria.slice(1).map(() => "not_run"),
          ];
          resolve(createReport(submission, outcomes));
        };
        signal.addEventListener("abort", resolveReport, { once: true });
      });
    },
  };

  const pending = app.executeCurrentWebProject("submit");
  app.cancelWebProjectRun({ disabled: false, textContent: "취소" });
  assert.equal(app.executionCoordinator.active.cancellationReason, "user");
  app.leaveCurrentView();
  assert.equal(app.executionCoordinator.active.cancellationReason, "navigation");
  app.currentView = "lesson";
  app.webProjectState = null;
  resolveReport();
  await pending;

  assert.equal(repository.listSubmissions().length, 0);
  assert.equal(renderCount, 1);
  assert.equal(app.executionCoordinator.active, null);
});
