import {
  getCourse,
  getLanguage,
  getLessonsForCourse,
  loadCurriculum,
  loadLessonMarkdown,
} from "./core/content.js";
import {
  DEFAULT_COURSE_ID,
  DEFAULT_LANGUAGE_ID,
  buildCodingTestHash,
  buildCodingTestListHash,
  buildLessonHash,
  buildMyPageHash,
  buildQuestHash,
  buildReviewHash,
  buildWebProjectHash,
  buildWebProjectListHash,
  getAdjacentLessons,
  parseCodingTestHash,
  parseMyPageHash,
  parseQuestHash,
  parseReviewHash,
  parseWebProjectHash,
  resolveLessonRoute,
} from "./core/navigation.js";
import {
  filterCodingTestProblems,
  findCodingTestProblemBySlug,
  getCodingTestProblemsInOrder,
  loadCodingTestCollection,
} from "./core/coding-test.js";
import {
  createCodeQuestExecutionRequest,
  findCodeQuestBySlug,
  getAdjacentCodeQuests,
  getCodeQuestsInOrder,
  loadCodeQuestCollection,
} from "./core/code-quest.js";
import {
  createWebProjectSubmission,
  findWebProjectBySlug,
  getWebProjectsInOrder,
  loadWebProjectCollection,
} from "./core/web-project.js";
import { gradeQuestion, loadQuizCollection, summarizeQuiz } from "./core/quiz.js";
import { DraftSaveCoordinator } from "./core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "./core/execution-coordinator.js";
import { BrowserCodeQuestRunner } from "./grading/browser-code-quest-runner.js";
import { BrowserJavaCodeQuestRunner } from "./grading/java-code-quest-runner.js";
import { BrowserWebCodeQuestRunner } from "./grading/browser-web-code-quest-runner.js";
import { CodeQuestRunnerRouter } from "./grading/code-quest-runner-router.js";
import { CodingTestRunnerAdapter } from "./grading/coding-test-runner-adapter.js";
import { BrowserWebProjectRunner } from "./grading/browser-web-project-runner.js";
import { scoreWebProject } from "./grading/web-project-scoring.js";
import {
  createBrowserStorage,
  getCurrentCompletedQuestIds,
  LocalStorageProgressRepository,
  PROGRESS_STORAGE_KEY,
} from "./repositories/progress-repository.js";
import {
  getWebProjectDraftToken,
  LocalStorageWebProjectRepository,
  WEB_PROJECT_STORAGE_KEY,
  WebProjectDraftConflictError,
} from "./repositories/web-project-repository.js";
import { focusMainContent, getFocusLoopTarget } from "./ui/focus.js";
import { renderAppShell } from "./ui/app-shell.js";
import { renderMyPageView } from "./ui/my-page-view.js";
import { renderLanguageNavigation } from "./ui/language-navigation.js";
import { escapeHtml, renderHighlightedCode, renderMarkdown } from "./ui/markdown.js";
import {
  renderQuizLoadingView,
  renderQuizQuestionView,
  renderQuizResultView,
} from "./ui/quiz-view.js";
import {
  getCodeQuestDraftStatusMessage,
  renderCodeQuestLoadingView,
  renderCodeQuestView,
} from "./ui/code-quest-view.js";
import {
  getCodingTestDraftStatusMessage,
  renderCodingTestListView,
  renderCodingTestLoadingView,
  renderCodingTestView,
} from "./ui/coding-test-view.js";
import {
  getWebProjectDraftStatusMessage,
  renderWebProjectListView,
  renderWebProjectLoadingView,
  renderWebProjectView,
} from "./ui/web-project-view.js";
import { createWebProjectPreviewDocument } from "./ui/web-project-preview.js";

const QUEST_DRAFT_SAVE_DEBOUNCE_MS = 250;
const CODING_TEST_SEARCH_DEBOUNCE_MS = 250;
const WEB_PROJECT_DRAFT_SAVE_DEBOUNCE_MS = 250;
export const CODING_TEST_LANGUAGE_IDS = Object.freeze(["javascript", "java"]);
const CODING_TEST_LANGUAGE_ID_SET = new Set(CODING_TEST_LANGUAGE_IDS);

function getLanguageCourse(curriculum, languageId) {
  return (
    (curriculum?.courses ?? []).find(
      (course) =>
        course.categoryId === "language" && course.languageId === languageId,
    ) ?? null
  );
}

export function supportsCodingTests(languageId) {
  return CODING_TEST_LANGUAGE_ID_SET.has(languageId);
}

function createDefaultCodingTestFilters() {
  return {
    query: "",
    difficulty: "all",
    language: "all",
    type: "all",
    status: "all",
  };
}

export async function loadCodingTestCollectionSafely(
  curriculum,
  loader = loadCodingTestCollection,
) {
  try {
    return await loader(DEFAULT_LANGUAGE_ID, curriculum);
  } catch {
    return null;
  }
}

export async function loadAvailableCodingTestCollectionsSafely(
  curriculum,
  loader = loadCodingTestCollection,
) {
  const collections = new Map();
  const languages = Array.isArray(curriculum?.languages)
    ? curriculum.languages.filter(
        (language) =>
          language.status === "available" && supportsCodingTests(language.id),
      )
    : [];

  await Promise.all(
    languages.map(async (language) => {
      try {
        const collection = await loader(language.id, curriculum);
        collections.set(language.id, collection);
      } catch {
        // 한 언어의 코딩테스트 콘텐츠 오류가 다른 학습 기능을 막지 않게 격리한다.
      }
    }),
  );
  return collections;
}

export async function loadAvailableCodeQuestCollectionsSafely(
  curriculum,
  loader = loadCodeQuestCollection,
) {
  const collections = new Map();
  const languages = Array.isArray(curriculum?.languages)
    ? curriculum.languages.filter((language) => language.status === "available")
    : [];

  await Promise.all(
    languages.map(async (language) => {
      try {
        const collection = await loader(language.id, curriculum);
        collections.set(language.id, collection);
      } catch {
        // 한 언어의 선택형 실습 콘텐츠 실패가 다른 교안·복습을 막지 않게 격리한다.
      }
    }),
  );
  return collections;
}

export async function loadWebProjectCollectionSafely(
  curriculum,
  loader = loadWebProjectCollection,
) {
  try {
    return await loader(curriculum);
  } catch {
    return null;
  }
}

function createClientEntropy() {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    if (typeof globalThis.crypto?.getRandomValues === "function") {
      const values = new Uint32Array(2);
      globalThis.crypto.getRandomValues(values);
      return `${values[0].toString(36)}-${values[1].toString(36)}`;
    }
  } catch {
    // 사용할 수 있는 브라우저 난수원이 없으면 아래 로컬 충돌 완화값을 사용합니다.
  }
  const fallback = `${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
  return fallback.replace(/^-|-$/g, "") || "local";
}

export function createWebProjectRequestId(
  mode,
  timestamp,
  sequence,
  entropy = createClientEntropy(),
) {
  if (!new Set(["run", "submit"]).has(mode)) {
    throw new TypeError("Web Project 실행 모드가 올바르지 않습니다.");
  }
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new TypeError("Web Project 실행 시각이 올바르지 않습니다.");
  }
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new TypeError("Web Project 실행 순서가 올바르지 않습니다.");
  }
  if (typeof entropy !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(entropy)) {
    throw new TypeError("Web Project 실행 ID 난수값이 올바르지 않습니다.");
  }
  return `web-project-${mode}-${timestamp.toString(36)}-${sequence.toString(36)}-${entropy}`;
}

export class BamLearningApp {
  constructor(root) {
    this.root = root;
    this.curriculum = null;
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.currentView = "lesson";
    this.quizCollection = null;
    this.quizSession = null;
    this.quizRecentAttempt = null;
    this.quizIncorrectQuestionCount = 0;
    this.codeQuestCollections = new Map();
    this.codeQuestCollection = null;
    this.codeQuestState = null;
    this.javascriptCodeQuestRunner = new BrowserCodeQuestRunner();
    this.javaCodeQuestRunner = new BrowserJavaCodeQuestRunner();
    this.webCodeQuestRunner = new BrowserWebCodeQuestRunner();
    this.codeQuestRunner = new CodeQuestRunnerRouter({
      javascriptRunner: this.javascriptCodeQuestRunner,
      webRunner: this.webCodeQuestRunner,
      javaRunner: this.javaCodeQuestRunner,
    });
    this.codingTestCollections = new Map();
    this.codingTestCollection = null;
    this.codingTestFilters = createDefaultCodingTestFilters();
    this.codingTestState = null;
    this.codingTestRunner = new CodingTestRunnerAdapter({
      javascriptRunner: this.javascriptCodeQuestRunner,
      javaRunner: this.javaCodeQuestRunner,
    });
    this.webProjectCollection = null;
    this.webProjectState = null;
    this.webProjectRunner = new BrowserWebProjectRunner();
    this.webProjectRepository = new LocalStorageWebProjectRepository(
      createBrowserStorage(window),
    );
    this.executionCoordinator = new ExecutionCoordinator();
    this.pendingCodingTestSearchRender = null;
    this.codingTestSearchRenderTimer = null;
    this.codingTestDraftSaveCoordinator = this.createCodingTestDraftSaveCoordinator();
    this.codingTestRequestSequence = 0;
    this.questDraftSaveCoordinator = this.createQuestDraftSaveCoordinator();
    this.questRequestSequence = 0;
    this.webProjectDraftSaveCoordinator =
      this.createWebProjectDraftSaveCoordinator();
    this.webProjectRequestSequence = 0;
    this.webProjectPreviewFrameRequest = null;
    this.renderSequence = 0;
    this.hasRenderedView = false;
    this.menuOpen = false;
    this.mobileMedia = window.matchMedia("(max-width: 820px)");
    this.progressRepository = new LocalStorageProgressRepository(createBrowserStorage(window));
  }

  async start() {
    this.bindGlobalEvents();
    try {
      this.curriculum = await loadCurriculum();
      this.codeQuestCollections = await loadAvailableCodeQuestCollectionsSafely(
        this.curriculum,
      );
      this.codeQuestCollection =
        this.codeQuestCollections.get(DEFAULT_LANGUAGE_ID) ?? null;
      this.codingTestCollections = await loadAvailableCodingTestCollectionsSafely(
        this.curriculum,
      );
      this.codingTestCollection =
        this.codingTestCollections.get(DEFAULT_LANGUAGE_ID) ??
        this.codingTestCollections.values().next().value ??
        null;
      this.webProjectCollection = await loadWebProjectCollectionSafely(
        this.curriculum,
      );
      await this.openRoute({ useLastLesson: true });
    } catch (error) {
      this.renderFatalError(error);
    }
  }

  bindGlobalEvents() {
    document.querySelector(".skip-link")?.addEventListener("click", (event) => {
      event.preventDefault();
      window.requestAnimationFrame(() => {
        focusMainContent(document.querySelector("#lesson-content"));
      });
    });

    window.addEventListener("hashchange", () => this.openRoute());
    window.addEventListener("pagehide", () => {
      this.cancelPendingCodingTestSearchRender();
      this.flushPendingQuestDraftSave();
      this.flushPendingCodingTestDraftSave();
      this.flushPendingWebProjectDraftSave();
    });
    window.addEventListener("storage", (event) => {
      if (event.key === WEB_PROJECT_STORAGE_KEY) {
        if (this.currentView === "my-page") this.renderMyPage();
        else if (this.currentView === "web-project-list") this.renderWebProjectList();
        else if (this.currentView === "web-project" && this.webProjectState) {
          this.handleExternalWebProjectStorageChange();
        }
        return;
      }
      if (event.key !== PROGRESS_STORAGE_KEY) return;
      if (this.currentView === "my-page") this.renderMyPage();
      else if (this.currentLesson) this.renderLesson();
      else if (this.currentView === "review" && this.quizCollection) {
        this.refreshQuizHistory();
        this.renderQuiz();
      } else if (this.currentView === "quest" && this.codeQuestState) {
        this.renderCodeQuest();
      } else if (this.currentView === "coding-test-list" && this.codingTestCollection) {
        this.renderCodingTestList();
      } else if (this.currentView === "coding-test" && this.codingTestState) {
        this.renderCodingTest();
      }
    });
    this.mobileMedia.addEventListener("change", () => {
      if (!this.mobileMedia.matches) this.menuOpen = false;
      this.syncMenuState();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.menuOpen) {
        this.menuOpen = false;
        this.syncMenuState();
        document.querySelector("[data-toggle-menu]")?.focus();
        return;
      }

      if (event.key === "Tab" && this.menuOpen && this.mobileMedia.matches) {
        this.keepFocusInMenu(event);
      }
    });

    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("scroll", (event) => this.handleScroll(event), true);
  }

  async openRoute({ useLastLesson = false } = {}) {
    this.leaveCurrentView();
    if (!this.curriculum) {
      this.enterView(this.currentView ?? "lesson");
      return;
    }

    const myPageRoute = parseMyPageHash(window.location.hash);
    if (myPageRoute) {
      this.openMyPageRoute();
      return;
    }
    if (/^#\/my(?:\/|$)/u.test(String(window.location.hash))) {
      window.history.replaceState(null, "", buildMyPageHash());
      this.openMyPageRoute();
      return;
    }

    const webProjectRoute = parseWebProjectHash(window.location.hash);
    if (webProjectRoute?.kind === "list") {
      this.openWebProjectListRoute();
      return;
    }
    if (webProjectRoute?.kind === "project") {
      this.openWebProjectRoute(webProjectRoute.slug);
      return;
    }
    if (/^#\/web-projects(?:\/|$)/u.test(String(window.location.hash))) {
      window.history.replaceState(null, "", buildWebProjectListHash());
      this.openWebProjectListRoute();
      return;
    }

    const codingTestRoute = parseCodingTestHash(window.location.hash);
    if (codingTestRoute?.kind === "list") {
      this.openCodingTestListRoute();
      return;
    }
    if (codingTestRoute?.kind === "problem") {
      if (!supportsCodingTests(codingTestRoute.languageId)) {
        window.history.replaceState(null, "", buildCodingTestListHash());
        this.openCodingTestListRoute();
        return;
      }
      await this.openCodingTestRoute(
        codingTestRoute.languageId,
        codingTestRoute.slug,
      );
      return;
    }
    if (/^#\/coding-tests(?:\/|$)/u.test(String(window.location.hash))) {
      window.history.replaceState(null, "", buildCodingTestListHash());
      this.openCodingTestListRoute();
      return;
    }

    const questRoute = parseQuestHash(window.location.hash);
    if (questRoute) {
      const questLanguage = getLanguage(
        this.curriculum,
        questRoute.languageId,
      );
      const questCourse = getLanguageCourse(this.curriculum, questRoute.languageId);
      const questLessons = questCourse
        ? getLessonsForCourse(this.curriculum, questCourse.id)
        : [];
      if (
        questLanguage?.status === "available" &&
        questLessons.length > 0
      ) {
        await this.openCodeQuestRoute(questRoute.languageId, questRoute.slug);
        return;
      }

      const fallbackLesson = getLessonsForCourse(
        this.curriculum,
        DEFAULT_COURSE_ID,
      )[0];
      if (!fallbackLesson) {
        this.enterView("lesson");
        this.renderEmptyState();
        document.title = "등록된 교안 없음 · BAM.dev";
        return;
      }
      window.history.replaceState(
        null,
        "",
        buildLessonHash(fallbackLesson.courseId, fallbackLesson.slug),
      );
      await this.openLessonRoute();
      return;
    }

    const reviewRoute = parseReviewHash(window.location.hash);
    if (reviewRoute) {
      const reviewLanguage = getLanguage(this.curriculum, reviewRoute.languageId);
      const reviewCourse = getLanguageCourse(this.curriculum, reviewRoute.languageId);
      const reviewLessons = reviewCourse
        ? getLessonsForCourse(this.curriculum, reviewCourse.id)
        : [];
      if (
        reviewLanguage &&
        reviewLanguage.status !== "planned" &&
        reviewCourse?.status !== "planned" &&
        reviewLessons.length > 0
      ) {
        await this.openReviewRoute(reviewRoute.languageId);
        return;
      }

      const fallbackLesson = getLessonsForCourse(
        this.curriculum,
        DEFAULT_COURSE_ID,
      )[0];
      if (!fallbackLesson) {
        this.enterView("lesson");
        this.renderEmptyState();
        document.title = "등록된 교안 없음 · BAM.dev";
        return;
      }
      window.history.replaceState(
        null,
        "",
        buildLessonHash(fallbackLesson.courseId, fallbackLesson.slug),
      );
      await this.openLessonRoute();
      return;
    }

    await this.openLessonRoute({ useLastLesson });
  }

  openMyPageRoute() {
    this.enterView("my-page");
    const canonicalHash = buildMyPageHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }
    this.renderMyPage();
    document.title = "마이페이지 · BAM.dev";
    window.scrollTo({ top: 0, behavior: "instant" });
    if (this.hasRenderedView) {
      window.requestAnimationFrame(() => {
        focusMainContent(document.querySelector("#lesson-content"));
      });
    }
    this.hasRenderedView = true;
  }

  leaveCurrentView(reason = "navigation") {
    this.cancelPendingCodingTestSearchRender();
    this.cancelPendingWebProjectPreviewSync();
    this.flushPendingQuestDraftSave();
    this.flushPendingCodingTestDraftSave();
    this.flushPendingWebProjectDraftSave();
    return this.executionCoordinator?.cancelActive(reason) ?? false;
  }

  enterView(kind) {
    const currentSequence = Number.isSafeInteger(this.renderSequence)
      ? this.renderSequence
      : 0;
    this.renderSequence = currentSequence + 1;
    this.currentView = kind;
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.quizCollection = null;
    this.quizSession = null;
    this.quizRecentAttempt = null;
    this.quizIncorrectQuestionCount = 0;
    this.codeQuestState = null;
    this.codingTestState = null;
    this.webProjectState = null;
    this.menuOpen = false;
    this.syncMenuState?.();
    return this.renderSequence;
  }

  async openLessonRoute({ useLastLesson = false } = {}) {
    const sequence = this.enterView("lesson");
    const progress = this.progressRepository.getProgress();
    const lesson = resolveLessonRoute(
      this.curriculum,
      window.location.hash,
      useLastLesson ? progress.lastLessonId : null,
    );

    if (!lesson) {
      this.renderEmptyState();
      document.title = "등록된 교안 없음 · BAM.dev";
      return;
    }

    const canonicalHash = buildLessonHash(lesson.courseId, lesson.slug);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.renderLoadingLesson(lesson);
    try {
      const markdown = await loadLessonMarkdown(lesson);
      if (sequence !== this.renderSequence) return;
      this.currentLesson = lesson;
      this.currentMarkdown = markdown;
      try {
        this.progressRepository.setLastLesson(lesson.id);
      } catch {
        this.announce("현재 브라우저에서 최근 학습 위치를 저장하지 못했습니다.");
      }
      this.renderLesson();
      document.title = `${lesson.title} · BAM.dev`;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (this.hasRenderedView) {
        document.querySelector("#lesson-content")?.focus({ preventScroll: true });
        this.announce(`${lesson.title} 단원으로 이동했습니다.`);
      }
      this.hasRenderedView = true;
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  async openReviewRoute(languageId) {
    const language = getLanguage(this.curriculum, languageId);
    if (!language) {
      await this.openLessonRoute();
      return;
    }

    const sequence = this.enterView("review");

    const canonicalHash = buildReviewHash(languageId);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.root.innerHTML = renderQuizLoadingView({ title: language.name });
    try {
      const collection = await loadQuizCollection(languageId, this.curriculum);
      if (sequence !== this.renderSequence) return;

      this.quizCollection = collection;
      this.refreshQuizHistory();
      this.startQuizSession(collection.questions, "all");
      this.renderQuiz();
      document.title = `${collection.title} · BAM.dev`;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (this.hasRenderedView) {
        this.focusQuizQuestion();
        this.announce("복습 첫 문제로 이동했습니다.");
      }
      this.hasRenderedView = true;
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  async openCodeQuestRoute(languageId, slug) {
    const language = getLanguage(this.curriculum, languageId);
    const course = getLanguageCourse(this.curriculum, languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    if (
      !language ||
      language.status !== "available" ||
      course?.status !== "available" ||
      lessons.length === 0
    ) {
      await this.openLessonRoute();
      return;
    }

    const sequence = this.enterView("quest");
    this.root.innerHTML = renderCodeQuestLoadingView({ languageName: language.name });

    try {
      let collection = this.codeQuestCollections.get(languageId) ?? null;
      if (!collection) {
        collection = await loadCodeQuestCollection(languageId, this.curriculum);
        this.codeQuestCollections.set(languageId, collection);
      }
      if (sequence !== this.renderSequence) return;
      this.codeQuestCollection = collection;

      const quests = getCodeQuestsInOrder(collection);
      const quest = findCodeQuestBySlug(collection, slug) ?? quests[0] ?? null;
      if (!quest) {
        this.renderFatalError(new Error("등록된 Code Quest가 없습니다."));
        return;
      }

      const canonicalHash = buildQuestHash(languageId, quest.slug);
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, "", canonicalHash);
      }

      let draft = null;
      let draftStatus = "starter";
      let uiError = null;
      try {
        draft = this.progressRepository.getQuestDraft(quest.id);
        if (draft) {
          const persistence = this.progressRepository.getPersistenceStatus();
          draftStatus = persistence.isPersistent ? "saved" : "memory";
        }
      } catch {
        draftStatus = "failed";
        uiError = "저장된 초안을 읽지 못해 초기 코드를 불러왔습니다.";
      }

      this.codeQuestState = {
        quest,
        source: draft ? draft.source : quest.starterCode,
        visibleHintCount: 0,
        isRunning: false,
        cancelRequested: false,
        draftStatus,
        uiError,
        report: null,
        reportPersistenceStatus: null,
      };
      this.renderCodeQuest();
      document.title = `${quest.title} · BAM.dev`;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (this.hasRenderedView) this.focusCodeQuestTitle();
      this.hasRenderedView = true;
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  openCodingTestListRoute() {
    const originLanguageId =
      this.currentView === "lesson"
        ? this.currentLesson?.languageId
        : this.currentView === "review"
          ? this.quizCollection?.languageId
          : this.currentView === "quest"
            ? this.codeQuestCollection?.languageId
            : this.currentView === "coding-test"
              ? this.codingTestCollection?.languageId
              : null;
    const originCollection = originLanguageId
      ? this.getCodingTestCollectionForLanguage(originLanguageId)
      : null;
    if (originCollection) this.codingTestCollection = originCollection;
    this.enterView("coding-test-list");
    if (!this.codingTestCollection && this.codingTestCollections?.size > 0) {
      this.codingTestCollection =
        this.codingTestCollections.get(DEFAULT_LANGUAGE_ID) ??
        this.codingTestCollections.values().next().value ??
        null;
    }
    if (!this.codingTestCollection) {
      this.renderFatalError(new Error("등록된 코딩테스트가 없습니다."));
      return;
    }

    const canonicalHash = buildCodingTestListHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.renderCodingTestList();
    document.title = `코딩테스트 문제 목록 · BAM.dev`;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (this.hasRenderedView) {
      window.requestAnimationFrame(() => {
        focusMainContent(document.querySelector("#coding-test-list-title"));
      });
    }
    this.hasRenderedView = true;
  }

  async openCodingTestRoute(languageId, slug) {
    const language = getLanguage(this.curriculum, languageId);
    if (
      !language ||
      language.status !== "available" ||
      !supportsCodingTests(languageId)
    ) {
      window.history.replaceState(null, "", buildCodingTestListHash());
      this.openCodingTestListRoute();
      return;
    }

    const sequence = this.enterView("coding-test");
    this.root.innerHTML = renderCodingTestLoadingView({ title: language.name });

    try {
      let collection = this.codingTestCollections?.get(languageId) ?? null;
      if (!collection) {
        collection = await loadCodingTestCollection(
          languageId,
          this.curriculum,
        );
        if (!(this.codingTestCollections instanceof Map)) {
          this.codingTestCollections = new Map();
        }
        this.codingTestCollections.set(languageId, collection);
      }
      if (sequence !== this.renderSequence) return;
      this.codingTestCollection = collection;

      const problem = findCodingTestProblemBySlug(collection, slug);
      if (!problem) {
        window.history.replaceState(null, "", buildCodingTestListHash());
        this.openCodingTestListRoute();
        return;
      }
      const canonicalHash = buildCodingTestHash(languageId, problem.slug);
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, "", canonicalHash);
      }

      let draft = null;
      let draftStatus = "starter";
      let uiError = null;
      try {
        draft = this.progressRepository.getCodingTestDraft(
          problem.id,
          problem.revision,
        );
        if (draft) {
          const persistence = this.progressRepository.getPersistenceStatus();
          draftStatus = persistence.isPersistent ? "saved" : "memory";
        }
      } catch {
        draftStatus = "failed";
        uiError = "저장된 초안을 읽지 못해 초기 코드를 불러왔습니다.";
      }

      this.codingTestState = {
        problem,
        source: draft ? draft.source : problem.starterCode,
        isRunning: false,
        cancelRequested: false,
        executionMode: null,
        draftStatus,
        uiError,
        report: null,
        reportPersistenceStatus: null,
      };
      this.renderCodingTest();
      document.title = `${problem.title} · BAM.dev`;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (this.hasRenderedView) this.focusCodingTestTitle();
      this.hasRenderedView = true;
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  openWebProjectListRoute() {
    this.enterView("web-project-list");
    if (!this.webProjectCollection) {
      this.renderFatalError(new Error("등록된 Web Project 과제가 없습니다."));
      return;
    }

    const canonicalHash = buildWebProjectListHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.renderWebProjectList();
    document.title = `${this.webProjectCollection.title} · BAM.dev`;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (this.hasRenderedView) {
      window.requestAnimationFrame(() => {
        focusMainContent(document.querySelector("#web-project-list-title"));
      });
    }
    this.hasRenderedView = true;
  }

  openWebProjectRoute(slug) {
    this.enterView("web-project");
    this.root.innerHTML = renderWebProjectLoadingView();
    const collection = this.webProjectCollection;
    const project = findWebProjectBySlug(collection, slug);
    if (!collection || !project) {
      window.history.replaceState(null, "", buildWebProjectListHash());
      this.openWebProjectListRoute();
      return;
    }

    const canonicalHash = buildWebProjectHash(project.slug);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    let draft = null;
    let draftStatus = "starter";
    let uiError = null;
    try {
      draft = this.webProjectRepository.getDraft(project.id, project.revision);
      if (draft) {
        const persistence = this.webProjectRepository.getPersistenceStatus();
        draftStatus = persistence.isPersistent ? "saved" : "memory";
      }
    } catch {
      draftStatus = "failed";
      uiError = "저장된 초안을 읽지 못해 초기 코드를 불러왔습니다.";
    }

    const draftByPath = new Map(
      (draft?.files ?? []).map((file) => [file.path, file.source]),
    );
    const files = project.files.map((file) => ({
      path: file.path,
      languageId: file.languageId,
      source: draftByPath.get(file.path) ?? file.starterSource,
    }));
    this.webProjectState = {
      project,
      files,
      activeFilePath: files[0]?.path ?? "index.html",
      manualAssessments: project.manualCriteria.map((criterion) => ({
        criterionId: criterion.id,
        status: "pending",
        levelId: null,
      })),
      isRunning: false,
      cancelRequested: false,
      executionMode: null,
      draftStatus,
      draftToken: getWebProjectDraftToken(draft),
      uiError,
      report: null,
      reportPersistenceStatus: null,
      previewSize: "wide",
    };
    this.renderWebProject();
    document.title = `${project.title} · BAM.dev`;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (this.hasRenderedView) this.focusWebProjectTitle();
    this.hasRenderedView = true;
  }

  handleClick(event) {
    if (this.handleWebProjectClick(event)) return;
    if (this.handleCodingTestClick(event)) return;
    if (this.handleCodeQuestClick(event)) return;
    if (this.handleQuizClick(event)) return;

    if (event.target.closest("[data-retry]")) {
      window.location.reload();
      return;
    }

    const menuButton = event.target.closest("[data-toggle-menu]");
    if (menuButton) {
      this.menuOpen = !this.menuOpen;
      this.syncMenuState();
      if (this.menuOpen) document.querySelector(".sidebar-close")?.focus();
      return;
    }

    if (event.target.closest("[data-close-menu]")) {
      this.menuOpen = false;
      this.syncMenuState();
      document.querySelector("[data-toggle-menu]")?.focus();
      return;
    }

    const completeButton = event.target.closest("[data-toggle-complete]");
    if (completeButton && this.currentLesson) {
      const progress = this.progressRepository.getProgress();
      const wasCompleted = progress.completedLessonIds.includes(this.currentLesson.id);
      try {
        this.progressRepository.setLessonCompleted(this.currentLesson.id, !wasCompleted);
        this.renderLesson();
        const updatedButton = document.querySelector("[data-toggle-complete]");
        updatedButton?.focus();
        this.announce(wasCompleted ? "학습 완료 표시를 해제했습니다." : "학습을 완료로 표시했습니다.");
      } catch {
        this.announce("진도를 저장하지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요.");
      }
      return;
    }

    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      const codeElement = copyButton.closest(".code-card")?.querySelector("code");
      let code = codeElement?.textContent ?? "";
      const encodedSource = codeElement?.dataset.codeSource;
      if (encodedSource !== undefined) {
        try {
          code = decodeURIComponent(encodedSource);
        } catch {
          // 손상된 속성은 화면에 보이는 코드로 안전하게 대체합니다.
        }
      }
      this.copyCode(copyButton, code);
      return;
    }

    const clickedLink = event.target.closest("a[href]");
    const sidebarLink = clickedLink?.closest("#course-sidebar") ? clickedLink : null;
    if (sidebarLink && this.mobileMedia.matches) {
      const isCurrentDestination = sidebarLink.getAttribute("href") === window.location.hash;
      this.menuOpen = false;
      this.syncMenuState();
      if (isCurrentDestination) {
        event.preventDefault();
        window.requestAnimationFrame(() => {
          focusMainContent(document.querySelector("#lesson-content"));
        });
      }
    }
  }

  handleChange(event) {
    const webProjectManual = event.target.closest("[data-web-project-manual]");
    if (
      webProjectManual &&
      this.currentView === "web-project" &&
      this.webProjectState &&
      !this.webProjectState.isRunning
    ) {
      const criterionId = webProjectManual.dataset.webProjectManual;
      const criterion = this.webProjectState.project.manualCriteria.find(
        (item) => item.id === criterionId,
      );
      const level = criterion?.scale.find(
        (item) => item.id === webProjectManual.value,
      );
      if (!criterion || !level) return;

      this.webProjectState.manualAssessments =
        this.webProjectState.manualAssessments.map((assessment) =>
          assessment.criterionId === criterionId
            ? {
                criterionId,
                status: "self_assessed",
                levelId: level.id,
              }
            : assessment,
        );
      if (this.webProjectState.report) {
        const score = scoreWebProject(this.webProjectState.project, {
          automaticResults: this.webProjectState.report.automaticResults.map(
            ({ criterionId: resultCriterionId, outcome }) => ({
              criterionId: resultCriterionId,
              outcome,
            }),
          ),
          manualAssessments: this.webProjectState.manualAssessments,
        });
        this.webProjectState.report = Object.freeze({
          ...this.webProjectState.report,
          score,
        });
        this.webProjectState.reportPersistenceStatus = null;
      }
      this.renderWebProject();
      window.requestAnimationFrame(() => {
        const selected = [...document.querySelectorAll("[data-web-project-manual]")].find(
          (input) =>
            input.dataset.webProjectManual === criterionId &&
            input.value === level.id,
        );
        selected?.focus({ preventScroll: true });
      });
      return;
    }

    const codingTestFilter = event.target.closest("[data-coding-test-filter]");
    if (codingTestFilter && this.currentView === "coding-test-list") {
      const filterName = codingTestFilter.dataset.codingTestFilter;
      if (["difficulty", "language", "type", "status"].includes(filterName)) {
        this.codingTestFilters[filterName] = codingTestFilter.value;
        this.renderCodingTestList({ focusSelector: `[data-coding-test-filter="${filterName}"]` });
      }
      return;
    }

    const option = event.target.closest("[data-quiz-option]");
    const question = this.getCurrentQuizQuestion();
    if (
      !option ||
      !question ||
      this.currentView !== "review" ||
      this.quizSession?.screen !== "question" ||
      this.quizSession.gradedAnswers.has(question.id)
    ) {
      return;
    }

    const isValidOption = question.options.some((item) => item.id === option.value);
    if (!isValidOption) return;

    this.quizSession.selectedOptionIds.set(question.id, option.value);
    this.renderQuiz();
    window.requestAnimationFrame(() => {
      const selectedInput = [...document.querySelectorAll("[data-quiz-option]")].find(
        (input) => input.value === option.value,
      );
      selectedInput?.focus({ preventScroll: true });
    });
  }

  handleInput(event) {
    const webProjectEditor = event.target.closest("[data-web-project-source]");
    const webProjectState = this.webProjectState;
    if (
      webProjectEditor &&
      this.currentView === "web-project" &&
      webProjectState &&
      !webProjectState.isRunning
    ) {
      const activeFile = webProjectState.files.find(
        (file) => file.path === webProjectState.activeFilePath,
      );
      if (!activeFile) return;
      activeFile.source = webProjectEditor.value;
      webProjectState.uiError = null;
      webProjectState.report = null;
      webProjectState.reportPersistenceStatus = null;
      this.scheduleWebProjectDraftSave(webProjectState);
      this.updateWebProjectDraftFeedback();
      this.scheduleWebProjectPreviewSync();
      return;
    }

    const codingTestSearch = event.target.closest("[data-coding-test-search]");
    if (codingTestSearch && this.currentView === "coding-test-list") {
      if (event.isComposing) {
        this.cancelPendingCodingTestSearchRender();
        return;
      }
      const cursorPosition = codingTestSearch.selectionStart;
      this.codingTestFilters.query = codingTestSearch.value;
      this.scheduleCodingTestSearchRender(codingTestSearch, cursorPosition);
      return;
    }

    const codingTestEditor = event.target.closest("[data-coding-test-source]");
    const codingTestState = this.codingTestState;
    if (
      codingTestEditor &&
      this.currentView === "coding-test" &&
      codingTestState &&
      !codingTestState.isRunning
    ) {
      codingTestState.source = codingTestEditor.value;
      codingTestState.uiError = null;
      this.scheduleCodingTestDraftSave(codingTestState);
      this.updateCodingTestDraftFeedback();
      return;
    }

    const editor = event.target.closest("[data-quest-source]");
    const state = this.codeQuestState;
    if (!editor || this.currentView !== "quest" || !state || state.isRunning) return;

    state.source = editor.value;
    state.uiError = null;
    this.syncCodeQuestEditorHighlight(editor);
    this.scheduleQuestDraftSave(state);
    this.updateCodeQuestDraftFeedback();
  }

  handleScroll(event) {
    const editor = event.target.closest?.("[data-quest-source]");
    if (editor) this.syncCodeQuestEditorHighlight(editor);
  }

  syncCodeQuestEditorHighlight(editor = this.root?.querySelector?.("[data-quest-source]")) {
    const highlight = this.root?.querySelector?.("[data-quest-source-highlight]");
    if (!editor || !highlight) return;

    const languageId = this.codeQuestCollection?.languageId ?? "text";
    highlight.innerHTML = renderHighlightedCode(editor.value, languageId);
    const highlightViewport = highlight.closest(".quest-source-highlight");
    if (highlightViewport) {
      highlightViewport.scrollTop = editor.scrollTop;
      highlightViewport.scrollLeft = editor.scrollLeft;
    }
  }

  handleWebProjectClick(event) {
    if (this.currentView !== "web-project" || !this.webProjectState) return false;

    const fileTab = event.target.closest("[data-web-project-file-tab]");
    if (fileTab && !this.webProjectState.isRunning) {
      const filePath = fileTab.dataset.webProjectFileTab;
      if (!this.webProjectState.files.some((file) => file.path === filePath)) {
        return true;
      }
      this.webProjectState.activeFilePath = filePath;
      this.renderWebProject();
      window.requestAnimationFrame(() => {
        document.querySelector("[data-web-project-source]")?.focus({
          preventScroll: true,
        });
      });
      return true;
    }

    const previewSizeButton = event.target.closest(
      "[data-web-project-preview-size]",
    );
    if (previewSizeButton) {
      const size = previewSizeButton.dataset.webProjectPreviewSize;
      if (["narrow", "wide"].includes(size)) {
        this.webProjectState.previewSize = size;
        this.renderWebProject();
        window.requestAnimationFrame(() => {
          document
            .querySelector(`[data-web-project-preview-size="${size}"]`)
            ?.focus({ preventScroll: true });
        });
      }
      return true;
    }

    if (event.target.closest("[data-web-project-run]")) {
      void this.executeCurrentWebProject("run");
      return true;
    }
    if (event.target.closest("[data-web-project-submit]")) {
      void this.executeCurrentWebProject("submit");
      return true;
    }
    const cancelButton = event.target.closest("[data-web-project-cancel]");
    if (cancelButton) {
      this.cancelWebProjectRun(cancelButton);
      return true;
    }
    if (event.target.closest("[data-web-project-reset]")) {
      this.resetWebProjectFiles();
      return true;
    }
    return false;
  }

  handleCodingTestClick(event) {
    if (this.currentView === "coding-test-list") {
      if (event.target.closest("[data-coding-test-filter-reset]")) {
        this.codingTestFilters = createDefaultCodingTestFilters();
        this.renderCodingTestList({ focusSelector: "[data-coding-test-search]" });
        this.announce("코딩테스트 필터를 초기화했습니다.");
        return true;
      }
      return false;
    }

    if (this.currentView !== "coding-test" || !this.codingTestState) return false;
    if (event.target.closest("[data-coding-test-run]")) {
      void this.executeCurrentCodingTest("run");
      return true;
    }
    if (event.target.closest("[data-coding-test-submit]")) {
      void this.executeCurrentCodingTest("submit");
      return true;
    }
    const cancelButton = event.target.closest("[data-coding-test-cancel]");
    if (cancelButton) {
      this.cancelCodingTestRun(cancelButton);
      return true;
    }
    if (event.target.closest("[data-coding-test-reset]")) {
      this.resetCodingTestSource();
      return true;
    }
    return false;
  }

  handleCodeQuestClick(event) {
    if (this.currentView !== "quest" || !this.codeQuestState) return false;

    if (event.target.closest("[data-quest-run]")) {
      void this.runCurrentCodeQuest();
      return true;
    }
    const cancelButton = event.target.closest("[data-quest-cancel]");
    if (cancelButton) {
      this.cancelCodeQuestRun(cancelButton);
      return true;
    }
    if (event.target.closest("[data-quest-reset]")) {
      this.resetCodeQuestSource();
      return true;
    }
    if (event.target.closest("[data-quest-show-hint]")) {
      this.revealNextCodeQuestHint();
      return true;
    }
    return false;
  }

  handleQuizClick(event) {
    if (this.currentView !== "review" || this.quizSession?.screen !== "question") {
      const retryButton = event.target.closest("[data-quiz-retry]");
      if (!retryButton || this.currentView !== "review") return false;
      this.retryQuiz(retryButton.dataset.quizRetry);
      return true;
    }

    if (event.target.closest("[data-quiz-check]")) {
      this.gradeCurrentQuizQuestion();
      return true;
    }
    if (event.target.closest("[data-quiz-previous]")) {
      this.showPreviousQuizQuestion();
      return true;
    }
    if (event.target.closest("[data-quiz-next]")) {
      this.showNextQuizQuestion();
      return true;
    }
    return false;
  }

  gradeCurrentQuizQuestion() {
    const question = this.getCurrentQuizQuestion();
    if (!question || this.quizSession.gradedAnswers.has(question.id)) return;

    const selectedOptionId = this.quizSession.selectedOptionIds.get(question.id);
    if (!selectedOptionId) {
      this.announce("답을 하나 선택한 뒤 확인해 주세요.");
      return;
    }

    try {
      const gradedAnswer = gradeQuestion(question, selectedOptionId);
      this.quizSession.gradedAnswers.set(question.id, gradedAnswer);
      this.renderQuiz();
      window.requestAnimationFrame(() => {
        const summary = document.querySelector("[data-quiz-grade-summary]");
        summary?.scrollIntoView({ behavior: "instant", block: "center" });
        summary?.focus({ preventScroll: true });
      });
    } catch {
      this.announce("이 문제를 채점하지 못했습니다. 다시 선택해 주세요.");
    }
  }

  showPreviousQuizQuestion() {
    if (!this.quizSession || this.quizSession.currentIndex === 0) return;
    this.quizSession.currentIndex -= 1;
    this.renderQuiz();
    this.focusQuizQuestion();
    this.announce(`${this.quizSession.currentIndex + 1}번 문제로 이동했습니다.`);
  }

  showNextQuizQuestion() {
    const question = this.getCurrentQuizQuestion();
    if (!question || !this.quizSession.gradedAnswers.has(question.id)) {
      this.announce("정답을 확인한 뒤 다음 문제로 이동할 수 있습니다.");
      return;
    }

    if (this.quizSession.currentIndex < this.quizSession.questions.length - 1) {
      this.quizSession.currentIndex += 1;
      this.renderQuiz();
      this.focusQuizQuestion();
      this.announce(`${this.quizSession.currentIndex + 1}번 문제로 이동했습니다.`);
      return;
    }

    this.finishQuizSession();
  }

  finishQuizSession() {
    const session = this.quizSession;
    if (!session || session.screen !== "question" || session.recordAttempted) return;

    const answers = session.questions
      .map((question) => session.gradedAnswers.get(question.id))
      .filter(Boolean);
    if (answers.length !== session.questions.length) {
      this.announce("모든 문제를 채점한 뒤 결과를 확인할 수 있습니다.");
      return;
    }

    session.recordAttempted = true;
    session.summary = summarizeQuiz(session.questions, answers);
    session.screen = "result";
    session.persistenceStatus = "saved";

    try {
      const progress = this.progressRepository.recordQuizAttempt({
        languageId: this.quizCollection.languageId,
        answers: answers.map((answer) => ({
          questionId: answer.questionId,
          lessonId: answer.lessonId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: answer.isCorrect,
        })),
      });
      const persistence = this.progressRepository.getPersistenceStatus();
      session.persistenceStatus = persistence.isPersistent ? "saved" : "memory";
      this.refreshQuizHistory(progress);
    } catch {
      session.persistenceStatus = "failed";
    }

    this.renderQuiz();
    this.focusQuizResult();
    this.announce(
      `복습을 완료했습니다. ${session.summary.correct}개를 맞혔습니다.`,
    );
  }

  retryQuiz(mode) {
    if (!this.quizCollection || this.quizSession?.screen !== "result") return;

    const questions =
      mode === "incorrect"
        ? this.quizCollection.questions.filter((question) =>
            this.quizSession.summary.incorrectQuestionIds.includes(question.id),
          )
        : this.quizCollection.questions;
    if (questions.length === 0) return;

    this.startQuizSession(questions, mode === "incorrect" ? "incorrect" : "all");
    this.renderQuiz();
    this.focusQuizQuestion();
    this.announce("새 복습 세션을 시작했습니다.");
  }

  startQuizSession(questions, mode) {
    this.quizSession = {
      mode,
      questions: [...questions],
      currentIndex: 0,
      selectedOptionIds: new Map(),
      gradedAnswers: new Map(),
      screen: "question",
      summary: null,
      recordAttempted: false,
      persistenceStatus: "saved",
    };
  }

  getCurrentQuizQuestion() {
    if (!this.quizSession || this.quizSession.screen !== "question") return null;
    return this.quizSession.questions[this.quizSession.currentIndex] ?? null;
  }

  refreshQuizHistory(progress = this.progressRepository.getProgress()) {
    if (!this.quizCollection) return;
    const currentQuestionIds = new Set(
      this.quizCollection.questions.map((question) => question.id),
    );
    const languageAttempts = progress.quizAttempts.filter(
      (attempt) => attempt.languageId === this.quizCollection.languageId,
    );
    this.quizRecentAttempt = languageAttempts.at(-1) ?? null;
    this.quizIncorrectQuestionCount = progress.incorrectQuestionIds.filter((questionId) =>
      currentQuestionIds.has(questionId),
    ).length;
  }

  updateCodeQuestDraftFeedback() {
    const state = this.codeQuestState;
    if (!state) return;

    const status = document.querySelector("[data-quest-draft-status]");
    if (status) {
      status.textContent = getCodeQuestDraftStatusMessage(state.draftStatus);
      status.classList.toggle(
        "is-warning",
        state.draftStatus === "failed" ||
          state.draftStatus === "memory" ||
          state.draftStatus === "conflict",
      );
    }
    const error = document.querySelector("[data-quest-error]");
    if (error) error.textContent = state.uiError ?? "";
    const runButton = document.querySelector("[data-quest-run]");
    if (runButton) runButton.disabled = state.source.trim().length === 0;
  }

  setQuestDraftSaveTimer(callback) {
    return window.setTimeout(callback, QUEST_DRAFT_SAVE_DEBOUNCE_MS);
  }

  clearQuestDraftSaveTimer(timer) {
    window.clearTimeout(timer);
  }

  createQuestDraftSaveCoordinator() {
    return new DraftSaveCoordinator({
      delayMs: QUEST_DRAFT_SAVE_DEBOUNCE_MS,
      persist: (pending) => this.persistQuestDraft(pending),
      setTimer: (callback) => this.setQuestDraftSaveTimer(callback),
      clearTimer: (timer) => this.clearQuestDraftSaveTimer(timer),
    });
  }

  scheduleQuestDraftSave(state) {
    const languageId = this.codeQuestCollection?.languageId;
    if (!languageId) {
      state.draftStatus = "failed";
      state.uiError = "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      return;
    }

    const pending = {
      owner: state,
      questId: state.quest.id,
      questRevision: state.quest.revision,
      languageId,
      source: state.source,
    };
    const ownerKey = `quest:${languageId}:${state.quest.id}:${String(state.quest.revision)}`;
    this.questDraftSaveCoordinator.schedule(ownerKey, pending);
  }

  flushPendingQuestDraftSave() {
    return this.questDraftSaveCoordinator?.flush() ?? false;
  }

  cancelPendingQuestDraftSave() {
    return this.questDraftSaveCoordinator?.cancel() ?? false;
  }

  persistQuestDraft(pending) {
    const isCurrentOwner =
      this.currentView === "quest" &&
      this.codeQuestState === pending.owner &&
      pending.owner.quest.id === pending.questId &&
      pending.owner.quest.revision === pending.questRevision;

    try {
      this.progressRepository.saveQuestDraft({
        questId: pending.questId,
        languageId: pending.languageId,
        source: pending.source,
      });
      const persistence = this.progressRepository.getPersistenceStatus();
      if (isCurrentOwner) {
        pending.owner.draftStatus = persistence.isPersistent ? "saved" : "memory";
        pending.owner.uiError = null;
      }
    } catch {
      if (isCurrentOwner) {
        pending.owner.draftStatus = "failed";
        pending.owner.uiError =
          "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      }
    }

    if (isCurrentOwner) this.updateCodeQuestDraftFeedback();
  }

  updateCodingTestDraftFeedback() {
    const state = this.codingTestState;
    if (!state) return;

    const status = document.querySelector("[data-coding-test-draft-status]");
    if (status) {
      status.textContent = getCodingTestDraftStatusMessage(state.draftStatus);
      status.classList.toggle(
        "is-warning",
        state.draftStatus === "failed" ||
          state.draftStatus === "memory" ||
          state.draftStatus === "conflict",
      );
    }
    const error = document.querySelector("[data-coding-test-error]");
    if (error) error.textContent = state.uiError ?? "";
    const sourceIsEmpty = state.source.trim().length === 0;
    for (const button of document.querySelectorAll(
      "[data-coding-test-run], [data-coding-test-submit]",
    )) {
      button.disabled = sourceIsEmpty;
    }
  }

  setCodingTestSearchRenderTimer(callback) {
    return window.setTimeout(callback, CODING_TEST_SEARCH_DEBOUNCE_MS);
  }

  clearCodingTestSearchRenderTimer(timer) {
    window.clearTimeout(timer);
  }

  clearScheduledCodingTestSearchRender() {
    if (this.codingTestSearchRenderTimer == null) return;
    this.clearCodingTestSearchRenderTimer(this.codingTestSearchRenderTimer);
    this.codingTestSearchRenderTimer = null;
  }

  scheduleCodingTestSearchRender(owner, cursorPosition) {
    this.clearScheduledCodingTestSearchRender();
    const pending = {
      owner,
      cursorPosition: Number.isSafeInteger(cursorPosition) ? cursorPosition : null,
    };
    this.pendingCodingTestSearchRender = pending;
    this.codingTestSearchRenderTimer = this.setCodingTestSearchRenderTimer(() => {
      if (this.pendingCodingTestSearchRender !== pending) return;
      this.pendingCodingTestSearchRender = null;
      this.codingTestSearchRenderTimer = null;
      if (this.currentView !== "coding-test-list") return;

      const shouldRestoreFocus = globalThis.document?.activeElement === pending.owner;
      this.renderCodingTestList({
        focusSelector: shouldRestoreFocus ? "[data-coding-test-search]" : null,
        cursorPosition: shouldRestoreFocus ? pending.cursorPosition : null,
      });
    });
  }

  cancelPendingCodingTestSearchRender() {
    this.clearScheduledCodingTestSearchRender();
    this.pendingCodingTestSearchRender = null;
  }

  setCodingTestDraftSaveTimer(callback) {
    return window.setTimeout(callback, QUEST_DRAFT_SAVE_DEBOUNCE_MS);
  }

  clearCodingTestDraftSaveTimer(timer) {
    window.clearTimeout(timer);
  }

  createCodingTestDraftSaveCoordinator() {
    return new DraftSaveCoordinator({
      delayMs: QUEST_DRAFT_SAVE_DEBOUNCE_MS,
      persist: (pending) => this.persistCodingTestDraft(pending),
      setTimer: (callback) => this.setCodingTestDraftSaveTimer(callback),
      clearTimer: (timer) => this.clearCodingTestDraftSaveTimer(timer),
    });
  }

  scheduleCodingTestDraftSave(state) {
    const languageId = this.codingTestCollection?.languageId;
    if (!languageId) {
      state.draftStatus = "failed";
      state.uiError = "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      return;
    }

    const pending = {
      owner: state,
      problemId: state.problem.id,
      problemRevision: state.problem.revision,
      languageId,
      source: state.source,
    };
    const ownerKey = `coding-test:${languageId}:${state.problem.id}:${String(state.problem.revision)}`;
    this.codingTestDraftSaveCoordinator.schedule(ownerKey, pending);
  }

  flushPendingCodingTestDraftSave() {
    return this.codingTestDraftSaveCoordinator?.flush() ?? false;
  }

  cancelPendingCodingTestDraftSave() {
    return this.codingTestDraftSaveCoordinator?.cancel() ?? false;
  }

  persistCodingTestDraft(pending) {
    const isCurrentOwner =
      this.currentView === "coding-test" &&
      this.codingTestState === pending.owner &&
      pending.owner.problem.id === pending.problemId &&
      pending.owner.problem.revision === pending.problemRevision;

    try {
      this.progressRepository.saveCodingTestDraft({
        problemId: pending.problemId,
        problemRevision: pending.problemRevision,
        languageId: pending.languageId,
        source: pending.source,
      });
      const persistence = this.progressRepository.getPersistenceStatus();
      if (isCurrentOwner) {
        pending.owner.draftStatus = persistence.isPersistent ? "saved" : "memory";
        pending.owner.uiError = null;
      }
    } catch {
      if (isCurrentOwner) {
        pending.owner.draftStatus = "failed";
        pending.owner.uiError =
          "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      }
    }

    if (isCurrentOwner) this.updateCodingTestDraftFeedback();
  }

  updateWebProjectDraftFeedback() {
    const state = this.webProjectState;
    if (!state) return;
    const status = document.querySelector("[data-web-project-draft-status]");
    if (status) {
      status.textContent = getWebProjectDraftStatusMessage(state.draftStatus);
      status.classList.toggle(
        "is-warning",
        state.draftStatus === "failed" ||
          state.draftStatus === "memory" ||
          state.draftStatus === "conflict",
      );
    }
    const error = document.querySelector("[data-web-project-error]");
    if (error) error.textContent = state.uiError ?? "";
  }

  setWebProjectDraftSaveTimer(callback) {
    return window.setTimeout(callback, WEB_PROJECT_DRAFT_SAVE_DEBOUNCE_MS);
  }

  clearWebProjectDraftSaveTimer(timer) {
    window.clearTimeout(timer);
  }

  createWebProjectDraftSaveCoordinator() {
    return new DraftSaveCoordinator({
      delayMs: WEB_PROJECT_DRAFT_SAVE_DEBOUNCE_MS,
      persist: (pending) => this.persistWebProjectDraft(pending),
      setTimer: (callback) => this.setWebProjectDraftSaveTimer(callback),
      clearTimer: (timer) => this.clearWebProjectDraftSaveTimer(timer),
    });
  }

  scheduleWebProjectDraftSave(state) {
    const pending = {
      owner: state,
      projectId: state.project.id,
      projectRevision: state.project.revision,
      expectedDraftToken: state.draftToken ?? null,
      files: state.files.map(({ path, source }) => ({ path, source })),
    };
    const ownerKey = `web-project:${state.project.id}:${String(state.project.revision)}`;
    this.webProjectDraftSaveCoordinator.schedule(ownerKey, pending);
  }

  flushPendingWebProjectDraftSave() {
    return this.webProjectDraftSaveCoordinator?.flush() ?? false;
  }

  cancelPendingWebProjectDraftSave() {
    return this.webProjectDraftSaveCoordinator?.cancel() ?? false;
  }

  persistWebProjectDraft(pending) {
    const state = this.webProjectState;
    const isCurrentOwner =
      this.currentView === "web-project" &&
      state === pending.owner &&
      state?.project.id === pending.projectId &&
      state?.project.revision === pending.projectRevision;
    try {
      const savedDraft = this.webProjectRepository.saveDraft(
        {
          projectId: pending.projectId,
          projectRevision: pending.projectRevision,
          files: pending.files,
        },
        { expectedDraftToken: pending.expectedDraftToken },
      );
      const persistence = this.webProjectRepository.getPersistenceStatus();
      if (isCurrentOwner) {
        state.draftToken = getWebProjectDraftToken(savedDraft);
        state.draftStatus = persistence.isPersistent ? "saved" : "memory";
        state.uiError = null;
      }
    } catch (error) {
      if (isCurrentOwner) {
        const isConflict = error instanceof WebProjectDraftConflictError;
        state.draftStatus = isConflict ? "conflict" : "failed";
        state.uiError = isConflict
          ? "다른 탭에서 이 과제의 초안이 바뀌었습니다. 현재 편집 내용은 저장하지 않았습니다. 필요한 코드를 복사한 뒤 새로고침해 외부 변경을 불러오세요."
          : "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      }
    }
    if (isCurrentOwner) this.updateWebProjectDraftFeedback();
  }

  cancelPendingWebProjectPreviewSync() {
    if (this.webProjectPreviewFrameRequest == null) return false;
    window.cancelAnimationFrame(this.webProjectPreviewFrameRequest);
    this.webProjectPreviewFrameRequest = null;
    return true;
  }

  scheduleWebProjectPreviewSync() {
    this.cancelPendingWebProjectPreviewSync();
    this.webProjectPreviewFrameRequest = window.requestAnimationFrame(() => {
      this.webProjectPreviewFrameRequest = null;
      this.syncWebProjectPreview();
    });
  }

  syncWebProjectPreview() {
    const state = this.webProjectState;
    if (!state || this.currentView !== "web-project") return;
    const htmlSource =
      state.files.find((file) => file.languageId === "html")?.source ?? "";
    const cssSource =
      state.files.find((file) => file.languageId === "css")?.source ?? "";
    const preview = createWebProjectPreviewDocument(htmlSource, cssSource);
    const frame = this.root?.querySelector?.("[data-web-project-preview]");
    const status = this.root?.querySelector?.("[data-web-project-preview-status]");
    if (frame) frame.srcdoc = preview.document;
    if (status) {
      status.textContent = preview.issue
        ? `${preview.issue.filePath}: ${preview.issue.message}`
        : "스크립트와 외부 요청 없이 HTML과 CSS를 결합해 보여 줍니다.";
      status.classList.toggle("is-warning", preview.issue !== null);
    }
  }

  handleExternalWebProjectStorageChange() {
    const state = this.webProjectState;
    if (!state || this.currentView !== "web-project") return false;
    let externalDraft;
    try {
      externalDraft = this.webProjectRepository.getDraft(
        state.project.id,
        state.project.revision,
      );
    } catch {
      return false;
    }
    if (getWebProjectDraftToken(externalDraft) === state.draftToken) return false;
    this.cancelPendingWebProjectDraftSave();
    state.draftStatus = "conflict";
    state.uiError =
      "다른 탭에서 이 과제의 초안이 바뀌었습니다. 현재 편집 내용은 저장하지 않았습니다. 필요한 코드를 복사한 뒤 새로고침해 외부 변경을 불러오세요.";
    this.updateWebProjectDraftFeedback();
    return true;
  }

  revealNextCodeQuestHint() {
    const state = this.codeQuestState;
    if (!state || state.isRunning) return;
    const hintCount = state.quest.hints.length;
    if (state.visibleHintCount >= hintCount) return;

    state.visibleHintCount += 1;
    this.renderCodeQuest();
    window.requestAnimationFrame(() => {
      const hints = document.querySelectorAll("[data-quest-hint]");
      focusMainContent(hints[hints.length - 1] ?? document.querySelector("#quest-hints-title"));
    });
  }

  resetCodeQuestSource() {
    const state = this.codeQuestState;
    if (!state || state.isRunning) return;

    this.cancelPendingQuestDraftSave();
    state.source = state.quest.starterCode;
    state.report = null;
    state.reportPersistenceStatus = null;
    state.uiError = null;
    try {
      this.progressRepository.clearQuestDraft(state.quest.id);
      const persistence = this.progressRepository.getPersistenceStatus();
      state.draftStatus = persistence.isPersistent ? "starter" : "memory";
    } catch {
      state.draftStatus = "failed";
      state.uiError =
        "편집기는 초기 코드로 되돌렸지만 저장된 초안을 지우지 못했습니다.";
    }

    this.renderCodeQuest();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-quest-source]")?.focus({ preventScroll: true });
    });
  }

  resetCodingTestSource() {
    const state = this.codingTestState;
    if (!state || state.isRunning) return;

    this.cancelPendingCodingTestDraftSave();
    state.source = state.problem.starterCode;
    state.executionMode = null;
    state.report = null;
    state.reportPersistenceStatus = null;
    state.uiError = null;
    try {
      this.progressRepository.clearCodingTestDraft(state.problem.id);
      const persistence = this.progressRepository.getPersistenceStatus();
      state.draftStatus = persistence.isPersistent ? "starter" : "memory";
    } catch {
      state.draftStatus = "failed";
      state.uiError =
        "편집기는 초기 코드로 되돌렸지만 저장된 초안을 지우지 못했습니다.";
    }

    this.renderCodingTest();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-coding-test-source]")?.focus({ preventScroll: true });
    });
  }

  resetWebProjectFiles() {
    const state = this.webProjectState;
    if (!state || state.isRunning) return;
    if (!this.confirmWebProjectReset()) return false;
    this.cancelPendingWebProjectDraftSave();
    try {
      this.webProjectRepository.clearDraft(
        state.project.id,
        state.project.revision,
        { expectedDraftToken: state.draftToken ?? null },
      );
      const persistence = this.webProjectRepository.getPersistenceStatus();
      state.files = state.project.files.map((file) => ({
        path: file.path,
        languageId: file.languageId,
        source: file.starterSource,
      }));
      state.activeFilePath = state.files[0]?.path ?? "index.html";
      state.draftToken = null;
      state.report = null;
      state.reportPersistenceStatus = null;
      state.uiError = null;
      state.draftStatus = persistence.isPersistent ? "starter" : "memory";
    } catch (error) {
      const isConflict = error instanceof WebProjectDraftConflictError;
      state.draftStatus = isConflict ? "conflict" : "failed";
      state.uiError = isConflict
        ? "다른 탭에서 초안이 바뀌어 초기화하지 않았습니다. 새로고침한 뒤 다시 시도해 주세요."
        : "저장된 초안을 지우지 못해 편집 내용도 초기화하지 않았습니다.";
      this.updateWebProjectDraftFeedback();
      return false;
    }
    this.renderWebProject();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-web-project-source]")?.focus({
        preventScroll: true,
      });
    });
    return true;
  }

  confirmWebProjectReset() {
    if (typeof window.confirm !== "function") return true;
    return window.confirm(
      "편집 중인 HTML과 CSS 및 저장된 초안을 모두 초기 코드로 되돌릴까요? 이 작업은 되돌릴 수 없습니다.",
    );
  }

  async executeCurrentWebProject(mode) {
    const state = this.webProjectState;
    const collection = this.webProjectCollection;
    if (
      !state ||
      !collection ||
      this.currentView !== "web-project" ||
      state.isRunning ||
      !["run", "submit"].includes(mode)
    ) {
      return;
    }

    this.flushPendingWebProjectDraftSave();
    if (this.executionCoordinator.active) {
      state.uiError = "이전 평가를 정리하고 있습니다. 잠시 후 다시 시도해 주세요.";
      this.renderWebProject();
      return;
    }

    this.webProjectRequestSequence += 1;
    const requestId = createWebProjectRequestId(
      mode,
      Date.now(),
      this.webProjectRequestSequence,
    );
    const submission = {
      submissionId: requestId,
      contractVersion: collection.contractVersion,
      projectId: state.project.id,
      projectRevision: state.project.revision,
      submittedAt: new Date().toISOString(),
      files: state.files.map(({ path, source }) => ({ path, source })),
      manualAssessments: state.manualAssessments.map((assessment) => ({
        ...assessment,
      })),
    };
    const execution = this.executionCoordinator.start({
      kind: "web-project",
      requestId,
      ownerId: `${state.project.id}:${String(state.project.revision)}`,
      mode,
    });
    if (!execution) return;

    state.isRunning = true;
    state.cancelRequested = false;
    state.executionMode = mode;
    state.uiError = null;
    state.report = null;
    state.reportPersistenceStatus = null;
    this.renderWebProject();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-web-project-cancel]")?.focus({
        preventScroll: true,
      });
    });

    let report;
    try {
      report = await this.webProjectRunner.run(
        { collection, project: state.project, submission },
        { signal: execution.signal },
      );
    } catch (error) {
      this.executionCoordinator.finish(execution);
      if (execution.cancellationReason === "navigation") return;
      if (this.webProjectState !== state || this.currentView !== "web-project") {
        return;
      }
      state.isRunning = false;
      state.cancelRequested = false;
      state.executionMode = null;
      state.uiError =
        error instanceof Error ? error.message : "Web Project 평가 결과를 받지 못했습니다.";
      this.renderWebProject();
      return;
    }

    const ownerId = `${state.project.id}:${String(state.project.revision)}`;
    const ownsExecution =
      this.executionCoordinator.isActive(execution) &&
      execution.cancellationReason !== "navigation" &&
      this.webProjectState === state &&
      this.currentView === "web-project" &&
      execution.ownerId === ownerId;
    if (!ownsExecution) {
      this.executionCoordinator.finish(execution);
      return;
    }

    let reportPersistenceStatus = null;
    const canRecordSubmission =
      mode === "submit" &&
      report.automaticResults.every(({ outcome }) =>
        ["passed", "failed"].includes(outcome),
      );
    if (canRecordSubmission) {
      reportPersistenceStatus = "saved";
      try {
        const canonicalSubmission = createWebProjectSubmission(
          collection,
          state.project,
          {
            submissionId: submission.submissionId,
            submittedAt: submission.submittedAt,
            files: submission.files,
            manualAssessments: submission.manualAssessments,
          },
        );
        this.webProjectRepository.recordSubmission(
          canonicalSubmission,
          report.score,
        );
        const persistence = this.webProjectRepository.getPersistenceStatus();
        reportPersistenceStatus = persistence.isPersistent ? "saved" : "memory";
      } catch {
        reportPersistenceStatus = "failed";
      }
    } else if (mode === "submit") {
      const hasInvalidSource = report.automaticResults.some(
        ({ outcome }) => outcome === "invalid_source",
      );
      state.uiError = hasInvalidSource
        ? "소스 안전 검사를 통과하지 못해 이번 제출은 기록하지 않았습니다."
        : "평가가 완료되지 않아 이번 제출은 기록하지 않았습니다.";
    }

    this.executionCoordinator.finish(execution);
    if (
      this.webProjectState !== state ||
      this.currentView !== "web-project" ||
      execution.ownerId !== ownerId
    ) {
      return;
    }
    state.isRunning = false;
    state.cancelRequested = false;
    state.executionMode = null;
    state.report = report;
    state.reportPersistenceStatus = reportPersistenceStatus;
    this.renderWebProject();
    this.focusWebProjectResults();
  }

  cancelWebProjectRun(button) {
    const state = this.webProjectState;
    const execution = this.executionCoordinator?.active;
    if (
      !state?.isRunning ||
      execution?.kind !== "web-project" ||
      execution.signal.aborted
    ) {
      return;
    }
    state.cancelRequested = true;
    button.disabled = true;
    button.textContent = "취소하는 중…";
    this.executionCoordinator.cancel(execution, "user");
  }

  async executeCurrentCodingTest(mode) {
    const state = this.codingTestState;
    if (
      !state ||
      this.currentView !== "coding-test" ||
      state.isRunning ||
      !["run", "submit"].includes(mode)
    ) {
      return;
    }

    this.flushPendingCodingTestDraftSave();
    if (this.executionCoordinator.active) {
      state.uiError = "이전 코드 실행을 정리하고 있습니다. 잠시 후 다시 시도해 주세요.";
      this.renderCodingTest();
      return;
    }

    this.codingTestRequestSequence += 1;
    const requestId = `coding-test-${mode}-${Date.now().toString(36)}-${this.codingTestRequestSequence.toString(36)}`;
    const execution = this.executionCoordinator.start({
      kind: "coding-test",
      requestId,
      ownerId: `${this.codingTestCollection.languageId}:${state.problem.id}:${String(state.problem.revision)}`,
      mode,
    });
    if (!execution) {
      state.uiError = "이전 코드 실행을 정리하고 있습니다. 잠시 후 다시 시도해 주세요.";
      this.renderCodingTest();
      return;
    }
    state.isRunning = true;
    state.cancelRequested = false;
    state.executionMode = mode;
    state.uiError = null;
    state.report = null;
    state.reportPersistenceStatus = null;
    this.renderCodingTest();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-coding-test-cancel]")?.focus({ preventScroll: true });
    });

    let report;
    try {
      report = await this.codingTestRunner.run(
        {
          collection: this.codingTestCollection,
          problem: state.problem,
          source: state.source,
          requestId,
          mode,
        },
        { signal: execution.signal },
      );
    } catch (error) {
      this.executionCoordinator.finish(execution);
      if (execution.cancellationReason === "navigation") return;
      if (this.codingTestState !== state || this.currentView !== "coding-test") return;
      state.isRunning = false;
      state.cancelRequested = false;
      state.uiError =
        error instanceof Error ? error.message : "코드 실행 결과를 받지 못했습니다.";
      this.renderCodingTest();
      return;
    }

    const ownsExecution =
      this.executionCoordinator.isActive(execution) &&
      execution.cancellationReason !== "navigation" &&
      this.codingTestState === state &&
      this.currentView === "coding-test" &&
      execution.ownerId ===
        `${this.codingTestCollection.languageId}:${state.problem.id}:${String(state.problem.revision)}`;
    if (!ownsExecution) {
      this.executionCoordinator.finish(execution);
      return;
    }

    let reportPersistenceStatus = null;
    if (mode === "submit") {
      reportPersistenceStatus = "saved";
      try {
        this.progressRepository.recordCodingTestSubmission({
          problemId: report.problemId,
          problemRevision: report.problemRevision,
          languageId: report.languageId,
          outcome: report.outcome,
          passed: report.summary.passed,
          total: report.summary.total,
        });
        const persistence = this.progressRepository.getPersistenceStatus();
        reportPersistenceStatus = persistence.isPersistent ? "saved" : "memory";
      } catch {
        reportPersistenceStatus = "failed";
      }
    }

    this.executionCoordinator.finish(execution);
    if (
      this.codingTestState !== state ||
      this.currentView !== "coding-test" ||
      execution.ownerId !==
        `${this.codingTestCollection.languageId}:${state.problem.id}:${String(state.problem.revision)}`
    ) {
      return;
    }

    state.isRunning = false;
    state.cancelRequested = false;
    state.report = report;
    state.reportPersistenceStatus = reportPersistenceStatus;
    this.renderCodingTest();
    this.focusCodingTestResults();
  }

  cancelCodingTestRun(button) {
    const state = this.codingTestState;
    const execution = this.executionCoordinator?.active;
    if (
      !state?.isRunning ||
      execution?.kind !== "coding-test" ||
      execution.signal.aborted
    ) {
      return;
    }
    state.cancelRequested = true;
    button.disabled = true;
    button.textContent = "취소하는 중…";
    this.executionCoordinator.cancel(execution, "user");
  }

  async runCurrentCodeQuest() {
    const state = this.codeQuestState;
    if (!state || this.currentView !== "quest" || state.isRunning) return;

    this.flushPendingQuestDraftSave();

    if (this.executionCoordinator.active) {
      state.uiError = "이전 코드 실행을 정리하고 있습니다. 잠시 후 다시 실행해 주세요.";
      this.renderCodeQuest();
      return;
    }

    let request;
    try {
      this.questRequestSequence += 1;
      const requestId = `quest-run-${Date.now().toString(36)}-${this.questRequestSequence.toString(36)}`;
      request = createCodeQuestExecutionRequest(
        this.codeQuestCollection,
        state.quest,
        state.source,
        requestId,
      );
    } catch (error) {
      state.uiError =
        error instanceof Error ? error.message : "코드 실행 요청을 만들지 못했습니다.";
      this.renderCodeQuest();
      return;
    }

    const execution = this.executionCoordinator.start({
      kind: "code-quest",
      requestId: request.requestId,
      ownerId: `${request.languageId}:${state.quest.id}:${String(state.quest.revision)}`,
      mode: "run",
    });
    if (!execution) {
      state.uiError = "이전 코드 실행을 정리하고 있습니다. 잠시 후 다시 실행해 주세요.";
      this.renderCodeQuest();
      return;
    }
    state.isRunning = true;
    state.cancelRequested = false;
    state.uiError = null;
    state.report = null;
    state.reportPersistenceStatus = null;
    this.renderCodeQuest();
    window.requestAnimationFrame(() => {
      document.querySelector("[data-quest-cancel]")?.focus({ preventScroll: true });
    });

    let report;
    try {
      report = await this.codeQuestRunner.run(request, {
        signal: execution.signal,
      });
    } catch (error) {
      this.executionCoordinator.finish(execution);
      if (execution.cancellationReason === "navigation") return;
      if (this.codeQuestState !== state || this.currentView !== "quest") return;
      state.isRunning = false;
      state.cancelRequested = false;
      state.uiError =
        error instanceof Error ? error.message : "코드 실행 결과를 받지 못했습니다.";
      this.renderCodeQuest();
      return;
    }

    const ownsExecution =
      this.executionCoordinator.isActive(execution) &&
      execution.cancellationReason !== "navigation" &&
      this.codeQuestState === state &&
      this.currentView === "quest" &&
      execution.ownerId ===
        `${request.languageId}:${state.quest.id}:${String(state.quest.revision)}`;
    if (!ownsExecution) {
      this.executionCoordinator.finish(execution);
      return;
    }

    let reportPersistenceStatus = "saved";
    try {
      this.progressRepository.recordQuestAttempt({
        questId: report.questId,
        questRevision: report.questRevision,
        languageId: report.languageId,
        outcome: report.outcome,
        passed: report.summary.passed,
        total: report.summary.total,
      });
      const persistence = this.progressRepository.getPersistenceStatus();
      reportPersistenceStatus = persistence.isPersistent ? "saved" : "memory";
    } catch {
      reportPersistenceStatus = "failed";
    }

    this.executionCoordinator.finish(execution);
    if (
      this.codeQuestState !== state ||
      this.currentView !== "quest" ||
      execution.ownerId !==
        `${request.languageId}:${state.quest.id}:${String(state.quest.revision)}`
    ) {
      return;
    }

    state.isRunning = false;
    state.cancelRequested = false;
    state.report = report;
    state.reportPersistenceStatus = reportPersistenceStatus;
    this.renderCodeQuest();
    this.focusCodeQuestResults();
  }

  cancelCodeQuestRun(button) {
    const state = this.codeQuestState;
    const execution = this.executionCoordinator?.active;
    if (
      !state?.isRunning ||
      execution?.kind !== "code-quest" ||
      execution.signal.aborted
    ) {
      return;
    }

    state.cancelRequested = true;
    button.disabled = true;
    button.textContent = "취소하는 중…";
    this.executionCoordinator.cancel(execution, "user");
  }

  abortQuestExecutionForNavigation() {
    const execution = this.executionCoordinator?.active;
    if (execution?.kind !== "code-quest") return false;
    return this.executionCoordinator.cancel(execution, "navigation");
  }

  abortCodingTestExecutionForNavigation() {
    const execution = this.executionCoordinator?.active;
    if (execution?.kind !== "coding-test") return false;
    return this.executionCoordinator.cancel(execution, "navigation");
  }

  focusCodeQuestTitle() {
    window.requestAnimationFrame(() => {
      focusMainContent(
        document.querySelector("#quest-title") ?? document.querySelector("#lesson-content"),
      );
    });
  }

  focusCodeQuestResults() {
    window.requestAnimationFrame(() => {
      const results = document.querySelector("[data-quest-results]");
      results?.scrollIntoView({ behavior: "instant", block: "start" });
      focusMainContent(results ?? document.querySelector("#lesson-content"));
    });
  }

  focusCodingTestTitle() {
    window.requestAnimationFrame(() => {
      focusMainContent(
        document.querySelector("#coding-test-title") ??
          document.querySelector("#lesson-content"),
      );
    });
  }

  focusCodingTestResults() {
    window.requestAnimationFrame(() => {
      const results = document.querySelector("[data-coding-test-results]");
      results?.scrollIntoView({ behavior: "instant", block: "start" });
      focusMainContent(results ?? document.querySelector("#lesson-content"));
    });
  }

  focusWebProjectTitle() {
    window.requestAnimationFrame(() => {
      focusMainContent(
        document.querySelector("#web-project-title") ??
          document.querySelector("#lesson-content"),
      );
    });
  }

  focusWebProjectResults() {
    window.requestAnimationFrame(() => {
      const results = document.querySelector("[data-web-project-results]");
      results?.scrollIntoView({ behavior: "instant", block: "start" });
      focusMainContent(results ?? document.querySelector("#lesson-content"));
    });
  }

  async copyCode(button, code) {
    try {
      await navigator.clipboard.writeText(code);
      const original = button.textContent;
      button.textContent = "복사됨";
      this.announce("코드를 클립보드에 복사했습니다.");
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = original;
      }, 1600);
    } catch {
      this.announce("코드를 복사하지 못했습니다. 코드를 직접 선택해 주세요.");
    }
  }

  renderMyPage() {
    if (!this.curriculum) return;

    let progress = {};
    let webProjectState = {};
    let isPersistent = true;
    try {
      progress = this.progressRepository.getProgress();
      isPersistent =
        this.progressRepository.getPersistenceStatus().isPersistent === true;
    } catch {
      isPersistent = false;
    }
    try {
      webProjectState = this.webProjectRepository.getState();
      isPersistent =
        isPersistent &&
        this.webProjectRepository.getPersistenceStatus().isPersistent === true;
    } catch {
      isPersistent = false;
    }

    const navigableLanguageCategoryIds = new Set(
      (this.curriculum.categories ?? [])
        .filter(
          (category) =>
            category.id === "language" && category.status !== "planned",
        )
        .map((category) => category.id),
    );
    const languageCourseIds = new Set(
      (this.curriculum.courses ?? [])
        .filter(
          (course) =>
            course.status !== "planned" &&
            navigableLanguageCategoryIds.has(course.categoryId),
        )
        .map((course) => course.id),
    );
    const languageLessons = this.curriculum.lessons.filter((lesson) =>
      languageCourseIds.has(lesson.courseId),
    );
    const mainContent = renderMyPageView({
      curriculum: {
        ...this.curriculum,
        lessons: languageLessons,
      },
      progress,
      codeQuestCollections: this.codeQuestCollections,
      codingTestCollections: this.codingTestCollections,
      webProjectCollection: this.webProjectCollection,
      webProjectState,
      isPersistent,
    });
    const lastLesson = languageLessons.find(
      (lesson) => lesson.id === progress.lastLessonId,
    );
    const course =
      getCourse(this.curriculum, lastLesson?.courseId) ??
      getCourse(
        this.curriculum,
        languageCourseIds.has(DEFAULT_COURSE_ID)
          ? DEFAULT_COURSE_ID
          : languageLessons[0]?.courseId,
      );
    const language = getLanguage(this.curriculum, course?.languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    if (!course || !language || lessons.length === 0) {
      this.root.innerHTML = mainContent;
      return;
    }

    const completedLessonIds = new Set(progress.completedLessonIds ?? []);
    const completedLessonCount = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const questCollection = this.codeQuestCollections.get(language.id) ?? null;
    const quests = getCodeQuestsInOrder(questCollection);
    const completedQuestCount = getCurrentCompletedQuestIds(
      progress,
      quests,
    ).size;
    const codingTestCollection = this.getCodingTestCollectionForLanguage(
      language.id,
    );
    const codingTestProblems = getCodingTestProblemsInOrder(
      codingTestCollection,
    );
    const solvedProblemIds = this.getSolvedCodingTestProblemIds(
      progress,
      codingTestCollection,
    );
    const firstLessonHref = buildLessonHash(
      lessons[0].courseId,
      lessons[0].slug,
    );
    const supportsLanguageFeatures = course.categoryId === "language";

    this.root.innerHTML = renderAppShell({
      homeHref: firstLessonHref,
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount: completedLessonCount,
        totalCount: lessons.length,
        percent: Math.round((completedLessonCount / lessons.length) * 100),
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((lesson) =>
          this.renderLessonLink(lesson, null, completedLessonIds),
        )
        .join(""),
      featureNavigation: supportsLanguageFeatures ? [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: false,
          },
        },
        {
          kind: "code-quest",
          options: quests[0]
            ? {
                href: buildQuestHash(language.id, quests[0].slug),
                isCurrent: false,
                completedCount: completedQuestCount,
                totalCount: quests.length,
              }
            : null,
        },
        {
          kind: "coding-test",
          options:
            codingTestProblems.length > 0
              ? {
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedProblemIds.size,
                  totalCount: codingTestProblems.length,
                }
              : null,
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(false),
        },
      ] : [],
      myPageCurrent: true,
      mainContent,
    });
    this.syncMenuState();
  }

  renderLoadingLesson(lesson) {
    this.root.innerHTML = `
      <main class="loading-page" id="lesson-content" tabindex="-1">
        <div class="state-message" role="status">
          <span class="brand-mark" aria-hidden="true">B</span>
          <p><strong>${escapeHtml(lesson.title)}</strong> 교안을 불러오고 있습니다…</p>
        </div>
      </main>
    `;
  }

  renderLesson() {
    const lesson = this.currentLesson;
    if (!lesson || !this.curriculum) return;

    const course = getCourse(this.curriculum, lesson.courseId);
    const language = getLanguage(this.curriculum, lesson.languageId);
    const lessons = getLessonsForCourse(this.curriculum, lesson.courseId);
    if (!course || !language || lessons.length === 0) return;
    const progress = this.progressRepository.getProgress();
    const completedIds = new Set(progress.completedLessonIds);
    const isCompleted = completedIds.has(lesson.id);
    const completedCount = lessons.filter((item) => completedIds.has(item.id)).length;
    const progressPercent = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100);
    const adjacent = getAdjacentLessons(lessons, lesson.id);
    const languageQuestCollection =
      this.codeQuestCollections.get(language.id) ?? null;
    const codeQuests = getCodeQuestsInOrder(languageQuestCollection);
    const firstCodeQuest = codeQuests[0] ?? null;
    const completedCodeQuestCount = getCurrentCompletedQuestIds(
      progress,
      codeQuests,
    ).size;
    const languageCodingTestCollection =
      this.getCodingTestCollectionForLanguage(language.id);
    const codingTestProblems = getCodingTestProblemsInOrder(
      languageCodingTestCollection,
    );
    const solvedCodingTestProblemIds = this.getSolvedCodingTestProblemIds(
      progress,
      languageCodingTestCollection,
    );
    const supportsLanguageFeatures = course.categoryId === "language";

    const mainContent = `
      <main class="main-area" id="lesson-content" tabindex="-1">
          <div class="lesson-container">
            <header class="lesson-hero">
              <div class="eyebrow">
                <span>${escapeHtml(course.name)}</span>
                <span aria-hidden="true">·</span>
                <span>${lesson.order}/${lessons.length}단원</span>
                <span aria-hidden="true">·</span>
                <span>약 ${lesson.estimatedMinutes}분</span>
              </div>
              <h1>${escapeHtml(lesson.title)}</h1>
              <p class="lesson-summary">${escapeHtml(lesson.summary)}</p>
              <div class="essential-question">
                <span aria-hidden="true">?</span>
                <div><small>오늘의 핵심 질문</small><strong>${escapeHtml(lesson.essentialQuestion)}</strong></div>
              </div>
            </header>

            <article class="lesson-body">
              ${renderMarkdown(this.currentMarkdown, { skipFirstHeading: true })}
            </article>

            <section class="completion-card${isCompleted ? " is-complete" : ""}" aria-labelledby="completion-title">
              <div>
                <span class="completion-icon" aria-hidden="true">${isCompleted ? "✓" : lesson.order}</span>
                <div>
                  <h2 id="completion-title">${isCompleted ? "이 단원을 완료했습니다" : "핵심 질문에 답할 수 있나요?"}</h2>
                  <p>${isCompleted ? "진도에 저장되었습니다. 언제든 다시 읽고 완료 표시를 바꿀 수 있습니다." : "자신의 말로 설명할 수 있다면 완료로 표시하고 다음 단원으로 이동하세요."}</p>
                </div>
              </div>
              <button class="button ${isCompleted ? "button--secondary" : "button--primary"}" type="button" data-toggle-complete aria-pressed="${isCompleted}">
                ${isCompleted ? "완료 표시 해제" : "학습 완료로 표시"}
              </button>
            </section>

            <nav class="lesson-pagination" aria-label="이전 및 다음 교안">
              ${this.renderPaginationLink(adjacent.previous, "previous")}
              ${this.renderPaginationLink(adjacent.next, "next")}
            </nav>

            <footer class="page-footer">
              <span>BAM.dev</span>
              <p>문법 암기보다 값의 흐름을 설명하는 연습부터.</p>
            </footer>
          </div>
      </main>
    `;
    this.root.innerHTML = renderAppShell({
      homeHref: buildLessonHash(lessons[0].courseId, lessons[0].slug),
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount,
        totalCount: lessons.length,
        percent: progressPercent,
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((item) => this.renderLessonLink(item, lesson.id, completedIds))
        .join(""),
      featureNavigation: supportsLanguageFeatures ? [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: false,
          },
        },
        {
          kind: "code-quest",
          options: firstCodeQuest
            ? {
                href: buildQuestHash(language.id, firstCodeQuest.slug),
                isCurrent: false,
                completedCount: completedCodeQuestCount,
                totalCount: codeQuests.length,
              }
            : null,
        },
        {
          kind: "coding-test",
          options:
            codingTestProblems.length > 0
              ? {
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                }
              : null,
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(false),
        },
      ] : [],
      mainContent,
    });
    this.syncMenuState();
  }

  renderQuiz() {
    if (!this.curriculum || !this.quizCollection || !this.quizSession) return;

    const language = getLanguage(this.curriculum, this.quizCollection.languageId);
    const course = getLanguageCourse(this.curriculum, this.quizCollection.languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    if (!language || !course || lessons.length === 0) return;

    const progress = this.progressRepository.getProgress();
    const completedIds = new Set(progress.completedLessonIds);
    const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
    const progressPercent = Math.round((completedCount / lessons.length) * 100);
    const firstLessonHref = buildLessonHash(lessons[0].courseId, lessons[0].slug);
    const languageQuestCollection =
      this.codeQuestCollections.get(language.id) ?? null;
    const codeQuests = getCodeQuestsInOrder(languageQuestCollection);
    const firstCodeQuest = codeQuests[0] ?? null;
    const completedCodeQuestCount = getCurrentCompletedQuestIds(
      progress,
      codeQuests,
    ).size;
    const languageCodingTestCollection =
      this.getCodingTestCollectionForLanguage(language.id);
    const codingTestProblems = getCodingTestProblemsInOrder(
      languageCodingTestCollection,
    );
    const solvedCodingTestProblemIds = this.getSolvedCodingTestProblemIds(
      progress,
      languageCodingTestCollection,
    );
    const session = this.quizSession;
    const question = this.getCurrentQuizQuestion();
    const mainContent =
      session.screen === "result"
        ? renderQuizResultView({
            title: this.quizCollection.title,
            summary: session.summary,
            persistenceStatus: session.persistenceStatus,
            sessionMode: session.mode,
            lessonHref: firstLessonHref,
          })
        : renderQuizQuestionView({
            languageId: this.quizCollection.languageId,
            languageName: language.name,
            title: this.quizCollection.title,
            question,
            currentIndex: session.currentIndex,
            total: session.questions.length,
            answeredCount: session.gradedAnswers.size,
            selectedOptionId: session.selectedOptionIds.get(question?.id) ?? null,
            gradedAnswer: session.gradedAnswers.get(question?.id) ?? null,
            recentAttempt: this.quizRecentAttempt,
            incorrectQuestionCount: this.quizIncorrectQuestionCount,
            sessionMode: session.mode,
          });

    this.root.innerHTML = renderAppShell({
      homeHref: firstLessonHref,
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount,
        totalCount: lessons.length,
        percent: progressPercent,
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((lesson) => this.renderLessonLink(lesson, null, completedIds))
        .join(""),
      featureNavigation: [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: true,
          },
        },
        {
          kind: "code-quest",
          options: firstCodeQuest
            ? {
                href: buildQuestHash(language.id, firstCodeQuest.slug),
                isCurrent: false,
                completedCount: completedCodeQuestCount,
                totalCount: codeQuests.length,
              }
            : null,
        },
        {
          kind: "coding-test",
          options:
            codingTestProblems.length > 0
              ? {
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                }
              : null,
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(false),
        },
      ],
      mainContent,
    });
    this.syncMenuState();
  }

  renderCodeQuest() {
    const state = this.codeQuestState;
    const collection = this.codeQuestCollection;
    if (!this.curriculum || !collection || !state) return;

    const language = getLanguage(this.curriculum, collection.languageId);
    const course = getLanguageCourse(this.curriculum, collection.languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    if (!language || !course || lessons.length === 0) return;

    const progress = this.progressRepository.getProgress();
    const completedLessonIds = new Set(progress.completedLessonIds);
    const completedLessonCount = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const lessonProgressPercent = Math.round(
      (completedLessonCount / lessons.length) * 100,
    );
    const quests = getCodeQuestsInOrder(collection);
    const currentIndex = quests.findIndex((quest) => quest.id === state.quest.id);
    const adjacent = getAdjacentCodeQuests(collection, state.quest.id);
    const completedQuestIds = getCurrentCompletedQuestIds(progress, quests);
    const completedQuestCount = completedQuestIds.size;
    const languageCodingTestCollection =
      this.getCodingTestCollectionForLanguage(language.id);
    const codingTestProblems = getCodingTestProblemsInOrder(
      languageCodingTestCollection,
    );
    const solvedCodingTestProblemIds =
      codingTestProblems.length > 0
        ? this.getSolvedCodingTestProblemIds(
            progress,
            languageCodingTestCollection,
          )
        : new Set();
    const firstLessonHref = buildLessonHash(lessons[0].courseId, lessons[0].slug);
    const currentQuestHref = buildQuestHash(language.id, state.quest.slug);
    const mainContent = renderCodeQuestView({
      languageId: collection.languageId,
      languageName: language.name,
      collectionTitle: collection.title,
      evaluationKind: collection.evaluationKind ?? "javascript-function-v1",
      quest: state.quest,
      currentIndex: Math.max(0, currentIndex),
      total: quests.length,
      source: state.source,
      isRunning: state.isRunning,
      cancelRequested: state.cancelRequested,
      draftStatus: state.draftStatus,
      uiError: state.uiError,
      report: state.report,
      reportPersistenceStatus: state.reportPersistenceStatus,
      visibleHintCount: state.visibleHintCount,
      isCompleted: completedQuestIds.has(state.quest.id),
      previous: adjacent.previous
        ? {
            href: buildQuestHash(language.id, adjacent.previous.slug),
            title: adjacent.previous.title,
          }
        : null,
      next: adjacent.next
        ? {
            href: buildQuestHash(language.id, adjacent.next.slug),
            title: adjacent.next.title,
          }
        : null,
    });

    this.root.innerHTML = renderAppShell({
      homeHref: firstLessonHref,
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount: completedLessonCount,
        totalCount: lessons.length,
        percent: lessonProgressPercent,
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((lesson) => this.renderLessonLink(lesson, null, completedLessonIds))
        .join(""),
      featureNavigation: [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: false,
          },
        },
        {
          kind: "code-quest",
          options: {
            href: currentQuestHref,
            isCurrent: true,
            completedCount: completedQuestCount,
            totalCount: quests.length,
          },
        },
        {
          kind: "coding-test",
          options:
            codingTestProblems.length > 0
              ? {
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                }
              : null,
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(false),
        },
      ],
      mainContent,
    });
    this.syncMenuState();
  }

  getWebProjectNavigationOptions(isCurrent = false) {
    const projects = getWebProjectsInOrder(this.webProjectCollection);
    if (projects.length === 0) return null;
    let submissions = [];
    try {
      submissions = this.webProjectRepository.listSubmissions();
    } catch {
      submissions = [];
    }
    const revisionByProjectId = new Map(
      projects.map((project) => [project.id, project.revision]),
    );
    const submittedProjectIds = new Set(
      submissions
        .filter(
          (submission) =>
            revisionByProjectId.get(submission.projectId) ===
            submission.projectRevision,
        )
        .map((submission) => submission.projectId),
    );
    return {
      href: buildWebProjectListHash(),
      isCurrent,
      submittedCount: submittedProjectIds.size,
      totalCount: projects.length,
    };
  }

  getWebProjectShellContext(project = null) {
    const currentProject =
      project ?? getWebProjectsInOrder(this.webProjectCollection)[0] ?? null;
    const referencedLessonIds = new Set(
      (currentProject?.conceptRefs ?? []).map((reference) => reference.lessonId),
    );
    const referencedLesson = this.curriculum?.lessons.find((lesson) =>
      referencedLessonIds.has(lesson.id),
    );
    const course =
      getLanguageCourse(this.curriculum, referencedLesson?.languageId) ??
      getCourse(this.curriculum, DEFAULT_COURSE_ID);
    const language = getLanguage(this.curriculum, course?.languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    return { language, course, lessons };
  }

  renderWebProjectList() {
    const collection = this.webProjectCollection;
    if (!this.curriculum || !collection) return;
    const projects = getWebProjectsInOrder(collection);
    let state;
    try {
      state = this.webProjectRepository.getState();
    } catch {
      state = { drafts: [], submissions: [] };
    }
    const items = projects.map((project) => ({
      project,
      href: buildWebProjectHash(project.slug),
      status: {
        hasDraft: state.drafts.some(
          (draft) =>
            draft.projectId === project.id &&
            draft.projectRevision === project.revision,
        ),
        submissionCount: state.submissions.filter(
          (submission) =>
            submission.projectId === project.id &&
            submission.projectRevision === project.revision,
        ).length,
      },
    }));
    const mainContent = renderWebProjectListView({
      title: collection.title,
      items,
    });
    this.renderWebProjectShell(mainContent, projects[0] ?? null);
  }

  renderWebProject() {
    const state = this.webProjectState;
    if (!state || !this.webProjectCollection || !this.curriculum) return;
    const mainContent = renderWebProjectView({
      project: state.project,
      files: state.files,
      activeFilePath: state.activeFilePath,
      manualAssessments: state.manualAssessments,
      isRunning: state.isRunning,
      cancelRequested: state.cancelRequested,
      executionMode: state.executionMode,
      draftStatus: state.draftStatus,
      report: state.report,
      reportPersistenceStatus: state.reportPersistenceStatus,
      uiError: state.uiError,
      previewSize: state.previewSize,
    });
    this.renderWebProjectShell(mainContent, state.project);
    this.scheduleWebProjectPreviewSync();
  }

  renderWebProjectShell(mainContent, project) {
    const { language, course, lessons } = this.getWebProjectShellContext(project);
    if (!language || !course || lessons.length === 0) {
      this.root.innerHTML = mainContent;
      return;
    }
    const progress = this.progressRepository.getProgress();
    const completedLessonIds = new Set(progress.completedLessonIds);
    const completedLessonCount = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const lessonProgressPercent = Math.round(
      (completedLessonCount / lessons.length) * 100,
    );
    const questCollection = this.codeQuestCollections.get(language.id) ?? null;
    const quests = getCodeQuestsInOrder(questCollection);
    const completedQuestCount = getCurrentCompletedQuestIds(
      progress,
      quests,
    ).size;
    const languageCodingTestCollection =
      this.getCodingTestCollectionForLanguage(language.id);
    const codingTestProblems = getCodingTestProblemsInOrder(
      languageCodingTestCollection,
    );
    const solvedCodingTestProblemIds =
      codingTestProblems.length > 0
        ? this.getSolvedCodingTestProblemIds(
            progress,
            languageCodingTestCollection,
          )
        : new Set();
    const firstLessonHref = buildLessonHash(
      lessons[0].courseId,
      lessons[0].slug,
    );
    this.root.innerHTML = renderAppShell({
      homeHref: firstLessonHref,
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount: completedLessonCount,
        totalCount: lessons.length,
        percent: lessonProgressPercent,
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((lesson) =>
          this.renderLessonLink(lesson, null, completedLessonIds),
        )
        .join(""),
      featureNavigation: [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: false,
          },
        },
        {
          kind: "code-quest",
          options: quests[0]
            ? {
                href: buildQuestHash(language.id, quests[0].slug),
                isCurrent: false,
                completedCount: completedQuestCount,
                totalCount: quests.length,
              }
            : null,
        },
        {
          kind: "coding-test",
          options:
            codingTestProblems.length > 0
              ? {
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                }
              : null,
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(true),
        },
      ],
      mainContent,
    });
    this.syncMenuState();
  }

  getCodingTestCollectionForLanguage(languageId) {
    const loaded =
      this.codingTestCollections instanceof Map
        ? this.codingTestCollections.get(languageId)
        : null;
    if (loaded) return loaded;
    return this.codingTestCollection?.languageId === languageId
      ? this.codingTestCollection
      : null;
  }

  getCodingTestCollectionsInCurriculumOrder() {
    const collections = [];
    const seen = new Set();
    for (const language of this.curriculum?.languages ?? []) {
      const collection = this.getCodingTestCollectionForLanguage(language.id);
      if (!collection || seen.has(collection.languageId)) continue;
      collections.push(collection);
      seen.add(collection.languageId);
    }
    if (
      this.codingTestCollection &&
      !seen.has(this.codingTestCollection.languageId)
    ) {
      collections.push(this.codingTestCollection);
    }
    return collections;
  }

  getSolvedCodingTestProblemIds(
    progress = this.progressRepository.getProgress(),
    source = this.codingTestCollection,
  ) {
    const completions = Array.isArray(progress.completedCodingTestProblems)
      ? progress.completedCodingTestProblems
      : [];
    const collections =
      source instanceof Map
        ? [...source.values()]
        : Array.isArray(source)
          ? source
          : source
            ? [source]
            : [];
    const revisionByProblemId = new Map(
      collections.flatMap((collection) =>
        getCodingTestProblemsInOrder(collection).map((problem) => [
          problem.id,
          problem.revision,
        ]),
      ),
    );
    return new Set(
      completions
        .filter(
          (completion) =>
            revisionByProblemId.get(completion.problemId) ===
            completion.problemRevision,
        )
        .map((completion) => completion.problemId),
    );
  }

  renderCodingTestList({ focusSelector = null, cursorPosition = null } = {}) {
    this.cancelPendingCodingTestSearchRender();
    const collections = this.getCodingTestCollectionsInCurriculumOrder();
    if (!this.curriculum || collections.length === 0) return;
    if (
      this.codingTestFilters.language !== "all" &&
      this.getCodingTestCollectionForLanguage(this.codingTestFilters.language)
    ) {
      this.codingTestCollection = this.getCodingTestCollectionForLanguage(
        this.codingTestFilters.language,
      );
    }
    const entries = collections.flatMap((collection) => {
      const language = getLanguage(this.curriculum, collection.languageId);
      return getCodingTestProblemsInOrder(collection).map((problem) => ({
        problem,
        collection,
        language,
      }));
    });
    const allProblems = entries.map((entry) => entry.problem);
    const progress = this.progressRepository.getProgress();
    const solvedProblemIds = this.getSolvedCodingTestProblemIds(
      progress,
      collections,
    );
    const visibleProblems = collections.flatMap((collection) => {
      if (
        this.codingTestFilters.language !== "all" &&
        this.codingTestFilters.language !== collection.languageId
      ) {
        return [];
      }
      return filterCodingTestProblems(collection, {
          query: this.codingTestFilters.query,
          difficulty: this.codingTestFilters.difficulty,
          type: this.codingTestFilters.type,
          status: this.codingTestFilters.status,
          completedProblemIds: solvedProblemIds,
        });
    });
    const hrefByProblemId = Object.fromEntries(
      entries.map(({ problem, collection }) => [
        problem.id,
        buildCodingTestHash(collection.languageId, problem.slug),
      ]),
    );
    const languageNameByProblemId = Object.fromEntries(
      entries.map(({ problem, language, collection }) => [
        problem.id,
        language?.name ?? collection.languageId,
      ]),
    );
    const languageOptions = collections.map((collection) => {
      const language = getLanguage(this.curriculum, collection.languageId);
      return {
        value: collection.languageId,
        label: language?.name ?? collection.languageId,
      };
    });
    const mainContent = renderCodingTestListView({
      title: "코딩테스트 문제 목록",
      problems: visibleProblems,
      totalCount: allProblems.length,
      filters: this.codingTestFilters,
      languageName: "학습 언어",
      languageNameByProblemId,
      languageOptions,
      typeOptions: [...new Set(allProblems.map((problem) => problem.type))],
      solvedProblemIds,
      hrefByProblemId,
    });
    const activeSolvedProblemIds = this.getSolvedCodingTestProblemIds(
      progress,
      this.codingTestCollection,
    );
    this.renderCodingTestShell(mainContent, progress, activeSolvedProblemIds);

    if (focusSelector) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector(focusSelector);
        target?.focus({ preventScroll: true });
        if (
          Number.isSafeInteger(cursorPosition) &&
          typeof target?.setSelectionRange === "function"
        ) {
          target.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    }
  }

  renderCodingTest() {
    const state = this.codingTestState;
    const collection = this.codingTestCollection;
    if (!this.curriculum || !collection || !state) return;
    const language = getLanguage(this.curriculum, collection.languageId);
    if (!language) return;
    const progress = this.progressRepository.getProgress();
    const solvedProblemIds = this.getSolvedCodingTestProblemIds(progress);
    const mainContent = renderCodingTestView({
      languageId: collection.languageId,
      languageName: language.name,
      collectionTitle: collection.title,
      listHref: buildCodingTestListHash(),
      problem: state.problem,
      source: state.source,
      isRunning: state.isRunning,
      cancelRequested: state.cancelRequested,
      executionMode: state.executionMode,
      draftStatus: state.draftStatus,
      uiError: state.uiError,
      report: state.report,
      reportPersistenceStatus: state.reportPersistenceStatus,
      isSolved: solvedProblemIds.has(state.problem.id),
    });
    this.renderCodingTestShell(mainContent, progress, solvedProblemIds);
  }

  renderCodingTestShell(
    mainContent,
    progressSnapshot = null,
    solvedProblemIdsSnapshot = null,
  ) {
    const collection = this.codingTestCollection;
    if (!this.curriculum || !collection) return;
    const language = getLanguage(this.curriculum, collection.languageId);
    const course = getLanguageCourse(this.curriculum, collection.languageId);
    const lessons = course ? getLessonsForCourse(this.curriculum, course.id) : [];
    if (!language || !course || lessons.length === 0) return;

    const progress = progressSnapshot ?? this.progressRepository.getProgress();
    const solvedProblemIds =
      solvedProblemIdsSnapshot ?? this.getSolvedCodingTestProblemIds(progress);
    const completedLessonIds = new Set(progress.completedLessonIds);
    const completedLessonCount = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const lessonProgressPercent = Math.round(
      (completedLessonCount / lessons.length) * 100,
    );
    const languageQuestCollection =
      this.codeQuestCollections.get(language.id) ?? null;
    const quests = getCodeQuestsInOrder(languageQuestCollection);
    const completedQuestCount = getCurrentCompletedQuestIds(
      progress,
      quests,
    ).size;
    const problems = getCodingTestProblemsInOrder(collection);
    const firstLessonHref = buildLessonHash(lessons[0].courseId, lessons[0].slug);

    this.root.innerHTML = renderAppShell({
      homeHref: firstLessonHref,
      menuOpen: this.menuOpen,
      language: course,
      lessonProgress: {
        completedCount: completedLessonCount,
        totalCount: lessons.length,
        percent: lessonProgressPercent,
      },
      languageNavigation: renderLanguageNavigation({
        curriculum: this.curriculum,
        currentLanguageId: language.id,
        currentCourseId: course.id,
      }),
      lessonNavigationItems: lessons
        .map((lesson) => this.renderLessonLink(lesson, null, completedLessonIds))
        .join(""),
      featureNavigation: [
        {
          kind: "review",
          options: {
            href: buildReviewHash(language.id),
            isCurrent: false,
          },
        },
        {
          kind: "code-quest",
          options: quests[0]
            ? {
                href: buildQuestHash(language.id, quests[0].slug),
                isCurrent: false,
                completedCount: completedQuestCount,
                totalCount: quests.length,
              }
            : null,
        },
        {
          kind: "coding-test",
          options: {
            href: buildCodingTestListHash(),
            isCurrent: true,
            solvedCount: solvedProblemIds.size,
            totalCount: problems.length,
          },
        },
        {
          kind: "web-project",
          options: this.getWebProjectNavigationOptions(false),
        },
      ],
      mainContent,
    });
    this.syncMenuState();
  }

  focusQuizQuestion() {
    window.requestAnimationFrame(() => {
      const title = document.querySelector("#quiz-question-title");
      if (title) focusMainContent(title);
      else focusMainContent(document.querySelector("#lesson-content"));
    });
  }

  focusQuizResult() {
    window.requestAnimationFrame(() => {
      const title = document.querySelector("#quiz-result-title");
      if (title) focusMainContent(title);
      else focusMainContent(document.querySelector("#lesson-content"));
    });
  }

  renderLessonLink(lesson, currentLessonId, completedIds) {
    const isCurrent = lesson.id === currentLessonId;
    const isComplete = completedIds.has(lesson.id);
    return `
      <li>
        <a class="lesson-link${isCurrent ? " is-current" : ""}" href="${buildLessonHash(lesson.courseId, lesson.slug)}"${isCurrent ? ' aria-current="page"' : ""}>
          <span class="lesson-number${isComplete ? " is-complete" : ""}" aria-hidden="true">${isComplete ? "✓" : lesson.order}</span>
          <span><strong>${escapeHtml(lesson.title)}</strong><small>${lesson.estimatedMinutes}분</small></span>
        </a>
      </li>
    `;
  }

  renderPaginationLink(lesson, direction) {
    if (!lesson) return '<span class="pagination-spacer" aria-hidden="true"></span>';
    const isPrevious = direction === "previous";
    return `
      <a class="pagination-link pagination-link--${direction}" href="${buildLessonHash(lesson.courseId, lesson.slug)}">
        <span aria-hidden="true">${isPrevious ? "←" : "→"}</span>
        <span><small>${isPrevious ? "이전 단원" : "다음 단원"}</small><strong>${escapeHtml(lesson.title)}</strong></span>
      </a>
    `;
  }

  keepFocusInMenu(event) {
    const sidebar = document.querySelector("#course-sidebar");
    if (!sidebar) return;

    const focusableElements = [...sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0);
    const target = getFocusLoopTarget(focusableElements, document.activeElement, event.shiftKey);
    if (!target) return;

    event.preventDefault();
    target.focus();
  }

  syncMenuState() {
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    const toggle = document.querySelector("[data-toggle-menu]");
    const mainArea = document.querySelector(".main-area");
    const mobileHeader = document.querySelector(".mobile-header");
    const skipLink = document.querySelector(".skip-link");
    const isMobile = this.mobileMedia.matches;
    sidebar?.classList.toggle("is-open", this.menuOpen);
    backdrop?.classList.toggle("is-visible", this.menuOpen);
    sidebar?.toggleAttribute("inert", isMobile && !this.menuOpen);
    mainArea?.toggleAttribute("inert", isMobile && this.menuOpen);
    mobileHeader?.toggleAttribute("inert", isMobile && this.menuOpen);
    skipLink?.toggleAttribute("inert", isMobile && this.menuOpen);
    toggle?.setAttribute("aria-expanded", String(this.menuOpen));
    document.body.classList.toggle("menu-open", this.menuOpen);
  }

  announce(message) {
    const announcer = document.querySelector(".announcer");
    if (!announcer) return;
    announcer.textContent = "";
    window.requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  renderEmptyState() {
    this.menuOpen = false;
    this.syncMenuState();
    this.root.innerHTML = `
      <main class="empty-page" id="lesson-content" tabindex="-1" aria-labelledby="empty-title">
        <div class="state-message" role="status">
          <span class="brand-mark" aria-hidden="true">B</span>
          <p class="eyebrow">등록된 교안 없음</p>
          <h1 id="empty-title">아직 학습할 콘텐츠가 없습니다.</h1>
          <p>커리큘럼에 교안이 추가되면 이곳에서 바로 학습을 시작할 수 있습니다.</p>
        </div>
        <button class="button button--primary" type="button" data-retry>다시 확인</button>
      </main>
    `;
    window.requestAnimationFrame(() => {
      focusMainContent(document.querySelector("#lesson-content"));
    });
  }

  renderFatalError(error) {
    this.menuOpen = false;
    this.syncMenuState();
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    this.root.innerHTML = `
      <main class="error-page" id="lesson-content" tabindex="-1" aria-labelledby="error-title">
        <div class="state-message" role="alert">
          <span class="brand-mark" aria-hidden="true">B</span>
          <p class="eyebrow">콘텐츠를 열지 못했습니다</p>
          <h1 id="error-title">학습 페이지를 준비하는 중 문제가 생겼습니다.</h1>
          <p>${escapeHtml(message)}</p>
        </div>
        <button class="button button--primary" type="button" data-retry>다시 시도</button>
      </main>
    `;
    window.requestAnimationFrame(() => {
      focusMainContent(document.querySelector("#lesson-content"));
    });
  }
}

if (typeof document !== "undefined") {
  const appRoot = document.querySelector("#app");
  if (appRoot) new BamLearningApp(appRoot).start();
}
