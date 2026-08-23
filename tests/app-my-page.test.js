import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { createWebProjectSubmission } from "../src/core/web-project.js";
import { scoreWebProject } from "../src/grading/web-project-scoring.js";
import { MemoryStorage } from "../src/repositories/browser-storage.js";
import { LocalStorageProgressRepository } from "../src/repositories/progress-repository.js";
import { LocalStorageWebProjectRepository } from "../src/repositories/web-project-repository.js";

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

const curriculum = await readJson("../content/curriculum.json");
const javascriptQuiz = await readJson("../content/quizzes/javascript.json");
const webProjectCollection = await readJson("../content/web-projects/index.json");
const codeQuestCollections = new Map(
  await Promise.all(
    ["javascript", "html", "css", "java"].map(async (languageId) => [
      languageId,
      await readJson(`../content/quests/${languageId}.json`),
    ]),
  ),
);
const codingTestCollections = new Map(
  await Promise.all(
    ["javascript", "java"].map(async (languageId) => [
      languageId,
      await readJson(`../content/coding-tests/${languageId}.json`),
    ]),
  ),
);
const totalQuestCount = [...codeQuestCollections.values()].reduce(
  (total, collection) => total + collection.quests.length,
  0,
);
const javascriptQuestCount = codeQuestCollections.get("javascript").quests.length;
const totalCodingTestCount = [...codingTestCollections.values()].reduce(
  (total, collection) => total + collection.problems.length,
  0,
);

test("앱은 두 로컬 저장소의 스냅샷으로 마이페이지 셸을 렌더링한다", () => {
  const root = { innerHTML: "" };
  const progress = {
    completedLessonIds: ["js-01-runtime"],
    lastLessonId: "js-01-runtime",
    quizAttempts: [],
    incorrectQuestionIds: [],
    questAttempts: [],
    completedQuestIds: [],
    completedQuestRevisions: [],
    codingTestSubmissions: [],
    completedCodingTestProblems: [],
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    codeQuestCollections,
    codeQuestCollection: codeQuestCollections.get("javascript"),
    codingTestCollections,
    codingTestCollection: codingTestCollections.get("javascript"),
    webProjectCollection,
    menuOpen: false,
    progressRepository: {
      getProgress: () => progress,
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    webProjectRepository: {
      getState: () => ({ drafts: [], submissions: [] }),
      listSubmissions: () => [],
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    syncMenuState() {},
  });

  app.renderMyPage();

  assert.equal((root.innerHTML.match(/class="app-shell"/g) ?? []).length, 1);
  assert.match(root.innerHTML, /id="my-page-title">마이페이지/);
  assert.match(
    root.innerHTML,
    /class="my-page-nav-link is-current" href="#\/my" aria-current="page"/,
  );
  assert.match(root.innerHTML, /JavaScript 교안 진도/);
  assert.match(root.innerHTML, /이 브라우저에 저장 중/);
});

test("마이페이지 본문과 앱 셸은 같은 현재 Quest 리비전 완료 판정을 쓴다", () => {
  const root = { innerHTML: "" };
  const quest = codeQuestCollections.get("javascript").quests[0];
  const mismatchedQuestRevision = quest.revision === 1 ? 2 : 1;
  const progress = {
    completedLessonIds: [],
    lastLessonId: "js-01-runtime",
    quizAttempts: [],
    incorrectQuestionIds: [],
    questAttempts: [
      {
        questId: quest.id,
        questRevision: quest.revision,
        languageId: "javascript",
        outcome: "wrong_answer",
        passed: 0,
        total: quest.publicTests.length,
      },
    ],
    completedQuestIds: [quest.id],
    completedQuestRevisions: [
      {
        questId: quest.id,
        questRevision: mismatchedQuestRevision,
        completedAt: "2026-08-22T12:00:00.000Z",
      },
    ],
    codingTestSubmissions: [],
    completedCodingTestProblems: [],
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    codeQuestCollections,
    codeQuestCollection: codeQuestCollections.get("javascript"),
    codingTestCollections,
    codingTestCollection: codingTestCollections.get("javascript"),
    webProjectCollection,
    menuOpen: false,
    progressRepository: {
      getProgress: () => progress,
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    webProjectRepository: {
      getState: () => ({ drafts: [], submissions: [] }),
      listSubmissions: () => [],
      getPersistenceStatus: () => ({ isPersistent: true }),
    },
    syncMenuState() {},
  });

  app.renderMyPage();

  assert.ok(
    root.innerHTML.includes(`완료한 Quest</dt><dd>0<span>/${totalQuestCount}</span>`),
  );
  assert.ok(
    root.innerHTML.includes(`Code Quest</strong><small>0/${javascriptQuestCount} 완료`),
  );
  assert.ok(root.innerHTML.includes(quest.title));
});

test("저장소 읽기에 실패해도 마이페이지는 임시 저장 경고와 빈 기록으로 열린다", () => {
  const root = { innerHTML: "" };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    codeQuestCollections,
    codeQuestCollection: codeQuestCollections.get("javascript"),
    codingTestCollections,
    codingTestCollection: codingTestCollections.get("javascript"),
    webProjectCollection,
    menuOpen: false,
    progressRepository: {
      getProgress() {
        throw new Error("blocked");
      },
    },
    webProjectRepository: {
      getState() {
        throw new Error("blocked");
      },
      listSubmissions: () => [],
    },
    syncMenuState() {},
  });

  app.renderMyPage();

  assert.match(root.innerHTML, /현재 탭에만 임시 저장 중/);
  assert.match(root.innerHTML, /아직 저장된 풀이 또는 제출 기록이 없습니다/);
});

test("실제 로컬 저장소 API로 기록한 진도와 제출을 마이페이지에서 읽는다", () => {
  const storage = new MemoryStorage();
  const now = () => new Date("2026-08-23T12:00:00.000Z");
  const progressRepository = new LocalStorageProgressRepository(storage, now);
  const webProjectRepository = new LocalStorageWebProjectRepository(storage, now);
  const quest = codeQuestCollections.get("javascript").quests[0];
  const problem = codingTestCollections.get("javascript").problems[0];
  const project = webProjectCollection.projects[0];
  const question = javascriptQuiz.questions[0];

  progressRepository.setLessonCompleted("js-01-runtime");
  progressRepository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: question.id,
        lessonId: question.lessonId,
        selectedOptionId: "a",
        isCorrect: false,
      },
    ],
  });
  progressRepository.recordQuestAttempt({
    questId: quest.id,
    questRevision: quest.revision,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 0,
    total: quest.publicTests.length,
  });
  progressRepository.recordCodingTestSubmission({
    problemId: problem.id,
    problemRevision: problem.revision,
    languageId: "javascript",
    outcome: "passed",
    passed: problem.publicTests.length,
    total: problem.publicTests.length,
  });

  const manualAssessments = project.manualCriteria.map((criterion) => ({
    criterionId: criterion.id,
    status: "pending",
    levelId: null,
  }));
  const submission = createWebProjectSubmission(
    webProjectCollection,
    project,
    {
      submissionId: "submission-my-page-integration",
      submittedAt: "2026-08-23T12:00:00.000Z",
      files: project.files.map((file) => ({
        path: file.path,
        source: file.starterSource,
      })),
      manualAssessments,
    },
  );
  const report = scoreWebProject(project, {
    automaticResults: project.automaticCriteria.map((criterion) => ({
      criterionId: criterion.id,
      outcome: "passed",
    })),
    manualAssessments,
  });
  webProjectRepository.recordSubmission(submission, report);

  const root = { innerHTML: "" };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    codeQuestCollections,
    codeQuestCollection: codeQuestCollections.get("javascript"),
    codingTestCollections,
    codingTestCollection: codingTestCollections.get("javascript"),
    webProjectCollection,
    menuOpen: false,
    progressRepository,
    webProjectRepository,
    syncMenuState() {},
  });

  app.renderMyPage();

  assert.match(root.innerHTML, /저장된 오답 1개/);
  assert.ok(root.innerHTML.includes(quest.title));
  assert.ok(
    root.innerHTML.includes(`푼 코딩테스트</dt><dd>1<span>/${totalCodingTestCount}`),
  );
  assert.match(root.innerHTML, /Web Project 제출<\/dt><dd>1<span>건/);
  assert.match(root.innerHTML, /제출 평가 미완료/);
});

test("마이페이지 라우트 이동은 포커스 가능한 본문으로 초점을 옮긴다", (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  let focused = false;
  const main = {
    focus() {
      focused = true;
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { hash: "#/my" },
      history: { replaceState() {} },
      requestAnimationFrame(callback) {
        callback();
      },
      scrollTo() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      title: "",
      querySelector(selector) {
        return selector === "#lesson-content" ? main : null;
      },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });

  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    hasRenderedView: true,
    enterView() {},
    renderMyPage() {},
  });

  app.openMyPageRoute();

  assert.equal(focused, true);
  assert.equal(document.title, "마이페이지 · BAM.dev");
});

test("마이페이지 언어별 학습 링크는 실제 44px 터치 타깃을 만든다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const languageLinkRule = css.match(/\.my-page-language-item a\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(languageLinkRule, /display:\s*inline-flex/);
  assert.match(languageLinkRule, /min-height:\s*44px/);
});
