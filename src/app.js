import {
  getCourse,
  getLanguage,
  getLessonsForCourse,
  getLessonsForLanguage,
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
  buildQuestCatalogHash,
  buildQuestHash,
  buildReviewHash,
  buildWebProjectHash,
  buildWebProjectListHash,
  getAdjacentLessons,
  parseCodingTestHash,
  parseLessonHash,
  parseMyPageHash,
  parseQuestCatalogHash,
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
  createCodeQuestCatalog,
  createCodeQuestExecutionRequest,
  filterCodeQuestCatalogItems,
  findCodeQuestBySlug,
  findCodeQuestByDisplayOrder,
  getAdjacentCodeQuestCatalogItems,
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
import { buildKeywordReviewHash, buildReviewLessonHash, getKeywordReviewScope, getReviewDocumentLesson, getReviewRouteOptions, validateReviewConcepts } from "./core/review-navigation.js";
import { getReviewContentSignature, LocalStorageReviewSessionRepository, restoreReviewSession, REVIEW_SESSION_STORAGE_KEY } from "./repositories/review-session-repository.js";
import { getCourseTopic, getLearningCatalogItems, renderLearningHome, renderLearningCatalog } from "./ui/learning-catalog-view.js";
import { renderSidebarContext, renderSidebarSearchResults } from "./ui/service-sidebar-view.js";
import { DraftSaveCoordinator } from "./core/draft-save-coordinator.js";
import { ExecutionCoordinator } from "./core/execution-coordinator.js";
import { BrowserCodeQuestRunner } from "./grading/browser-code-quest-runner.js";
import { BrowserWebCodeQuestRunner } from "./grading/browser-web-code-quest-runner.js";
import { CodeQuestRunnerRouter } from "./grading/code-quest-runner-router.js";
import { CodingTestRunnerAdapter } from "./grading/coding-test-runner-adapter.js";
import { BrowserWebProjectRunner } from "./grading/browser-web-project-runner.js";
import { scoreWebProject } from "./grading/web-project-scoring.js";
import {
  createBrowserStorage,
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
import { renderLearningShell } from "./ui/app-shell.js";
import { renderMyPageView } from "./ui/my-page-view.js";
import { createThemeController } from "./ui/theme.js";
import { escapeHtml, headingId, renderHighlightedCode, renderInlineCodeText, renderMarkdown, splitLessonOverview, splitMarkdownSection } from "./ui/markdown.js";
import {
  getQuizSaveStatusMessage,
  renderQuizEmptyView,
  renderQuizLoadingView,
  renderQuizQuestionView,
  renderQuizResultView,
  renderQuizScopeControls,
} from "./ui/quiz-view.js";
import {
  getCodeQuestDraftStatusMessage,
  renderCodeQuestCatalogView,
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
const CODE_QUEST_LANGUAGE_IDS = new Set(["javascript", "html", "css"]);

function isAvailableCodeQuestLanguage(language) {
  // 정적 교안·객관식의 available 상태와 Code Quest 지원 범위는 별개다.
  return language?.status === "available" && CODE_QUEST_LANGUAGE_IDS.has(language.id);
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

export async function loadAvailableCodeQuestCollectionsSafely(
  curriculum,
  loader = loadCodeQuestCollection,
) {
  const collections = new Map();
  const languages = Array.isArray(curriculum?.languages)
    ? curriculum.languages.filter(isAvailableCodeQuestLanguage)
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
    this.quizLessonId = null;
    this.quizSession = null;
    this.quizRecentAttempt = null;
    this.quizIncorrectQuestionCount = 0;
    this.reviewConcepts = [];
    this.reviewConceptsLoaded = false;
    this.quizCollections = new Map();
    this.catalogFilters = { learn: { topicId: null, query: "" }, review: { topicId: null, query: "" } };
    this.reviewSessionRepository = new LocalStorageReviewSessionRepository(createBrowserStorage(window));
    this.savedReviewSession = this.reviewSessionRepository.read();
    this.reviewSaveStatus = "saved";
    this.quizConceptId = null;
    this.lessonReviewReturn = null;
    this.codeQuestCollections = new Map();
    this.codeQuestCollection = null;
    this.codeQuestState = null;
    this.codeQuestCatalogFilters = {
      courseId: null,
      topicId: "all",
      status: "all",
      query: "",
      number: "",
    };
    this.codeQuestCatalogNotice = "";
    this.javascriptCodeQuestRunner = new BrowserCodeQuestRunner();
    this.webCodeQuestRunner = new BrowserWebCodeQuestRunner();
    this.codeQuestRunner = new CodeQuestRunnerRouter({
      javascriptRunner: this.javascriptCodeQuestRunner,
      webRunner: this.webCodeQuestRunner,
    });
    this.codingTestCollection = null;
    this.codingTestFilters = createDefaultCodingTestFilters();
    this.codingTestState = null;
    this.codingTestRunner = new CodingTestRunnerAdapter(
      this.javascriptCodeQuestRunner,
    );
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
    this.themeController = createThemeController({ root: this.root });
    this.bindGlobalEvents();
    try {
      this.curriculum = await loadCurriculum();
      this.codeQuestCollections = await loadAvailableCodeQuestCollectionsSafely(
        this.curriculum,
      );
      this.codeQuestCollection =
        this.codeQuestCollections.get(DEFAULT_LANGUAGE_ID) ?? null;
      this.codingTestCollection = await loadCodingTestCollectionSafely(
        this.curriculum,
      );
      this.webProjectCollection = await loadWebProjectCollectionSafely(
        this.curriculum,
      );
      await this.openRoute({ useLastLesson: true });
      if (!this.mobileMedia.matches) void this.loadSidebarCatalog();
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
      this.saveReviewSession({ captureViewport: true });
      this.cancelPendingCodingTestSearchRender();
      this.flushPendingQuestDraftSave();
      this.flushPendingCodingTestDraftSave();
      this.flushPendingWebProjectDraftSave();
    });
    window.addEventListener("storage", (event) => {
      if (event.key === REVIEW_SESSION_STORAGE_KEY) {
        if (this.currentView === "review") {
          this.reviewStorageConflict = true;
          this.reviewSaveStatus = "failed";
          this.reviewRestoreNotice = "다른 탭에서 풀이가 바뀌었습니다. 새로고침하여 저장된 풀이를 이어 주세요.";
          this.renderQuiz();
        } else {
          this.savedReviewSession = this.reviewSessionRepository.read();
          if (this.currentView.endsWith("-catalog")) this.renderLearningCatalog();
        }
        return;
      }
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
      else if (this.currentView === "quest-catalog") this.renderCodeQuestCatalog();
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
      else this.clearSidebarSearch();
      this.syncMenuState();
      if (!this.mobileMedia.matches) void this.loadSidebarCatalog();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.getServiceNavigation().query) {
        event.preventDefault();
        this.clearSidebarSearch();
        this.root.querySelector("[data-sidebar-search]")?.focus();
        return;
      }
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
    this.root.addEventListener("submit", (event) => {
      if (event.target.matches("[data-sidebar-search-form]")) {
        event.preventDefault();
        this.root.querySelector("[data-sidebar-result]")?.click();
        return;
      }
      if (event.target.matches("[data-catalog-form]")) {
        event.preventDefault();
        this.updateCatalogFilters();
        return;
      }
      if (event.target.matches("[data-quest-catalog-form]")) {
        event.preventDefault();
        this.updateCodeQuestCatalogSearch();
        return;
      }
      if (event.target.matches("[data-quest-number-form]")) {
        event.preventDefault();
        this.openCodeQuestByNumber();
        return;
      }
      if (event.target.matches("[data-quiz-form]")) {
        event.preventDefault();
        if (!this.activateQuizQuestionForElement(event.target)) return;
        if (this.quizSession.gradingMode === "batch") this.gradePendingQuizQuestions();
        else this.gradeCurrentQuizQuestion();
      }
    });
    this.root.addEventListener("focusin", (event) => {
      if (this.currentView !== "review" || !event.target.closest?.("[data-quiz-question-id]")) return;
      const previousIndex = this.quizSession?.currentIndex;
      if (this.activateQuizQuestionForElement(event.target) && previousIndex !== this.quizSession.currentIndex) this.saveReviewSession();
    });
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("scroll", (event) => this.handleScroll(event), true);
  }

  async openRoute({ useLastLesson = false } = {}) {
    this.leaveCurrentView();
    if (!this.curriculum) {
      this.enterView(this.currentView ?? "lesson");
      return;
    }

    const routePath = String(window.location.hash).split("?")[0];
    if (["", "#", "#/"].includes(routePath)) {
      this.enterView("home");
      const questCatalog = this.getCodeQuestCatalog();
      this.root.innerHTML = this.renderServiceShell({ mainContent: renderLearningHome({
        saved: this.savedReviewSession,
        questOverview: {
          courseCount: questCatalog.courses.length,
          completedCount: questCatalog.items.filter((item) => item.progress === "completed").length,
          totalCount: questCatalog.items.length,
        },
      }) });
      this.syncMenuState();
      document.title = "BAM.dev · 개발 학습";
      this.finishServiceNavigation();
      return;
    }
    if (["#/learn", "#/learn/", "#/review", "#/review/"].includes(routePath)) {
      await this.openLearningCatalog(routePath.startsWith("#/review") ? "review" : "learn");
      return;
    }

    if (parseQuestCatalogHash(window.location.hash)) {
      this.openCodeQuestCatalogRoute();
      return;
    }

    const myPageRoute = parseMyPageHash(window.location.hash);
    if (myPageRoute) {
      await this.openMyPageRoute();
      return;
    }
    if (/^#\/my(?:\/|$)/u.test(String(window.location.hash))) {
      window.history.replaceState(null, "", buildMyPageHash());
      await this.openMyPageRoute();
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
      const questLessons = getLessonsForLanguage(
        this.curriculum,
        questRoute.languageId,
      );
      if (
        isAvailableCodeQuestLanguage(questLanguage) &&
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
      const reviewLessons = getLessonsForLanguage(
        this.curriculum,
        reviewRoute.languageId,
      );
      if (
        reviewLanguage &&
        reviewLanguage.status !== "planned" &&
        reviewLessons.length > 0
      ) {
        await this.openReviewRoute(reviewRoute.languageId, reviewRoute.lessonId);
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

  async openMyPageRoute() {
    const sequence = this.enterView("my-page");
    const canonicalHash = buildMyPageHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }
    this.root.innerHTML = this.renderServiceShell({
      current: "my-page",
      mainContent: '<main class="main-area service-main" id="lesson-content" tabindex="-1"><p role="status">학습 기록을 준비하고 있어요…</p></main>',
    });
    this.syncMenuState();
    await this.loadSidebarCatalog();
    if (sequence !== this.renderSequence) return;
    this.renderMyPage();
    document.title = "마이페이지 · BAM.dev";
    this.finishServiceNavigation();
  }

  leaveCurrentView(reason = "navigation") {
    if (this.currentView === "lesson" && this.currentLesson) {
      this.getServiceNavigation().readingPosition = {
        href: this.getServiceNavigation().routes.learn,
        scrollY: window.scrollY ?? 0,
        answerOpen: Boolean(this.root.querySelector?.("#lesson-answer")?.open),
      };
    }
    const returnToken = this.quizSession?.returnContext?.token;
    const visitingReviewDocument = returnToken && getReviewRouteOptions(globalThis.window?.location?.hash).returnToken === returnToken;
    this.saveReviewSession({ captureViewport: !visitingReviewDocument });
    this.closeConceptOverlay?.({ restoreFocus: false });
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
    this.quizLessonId = null;
    this.quizConceptId = null;
    this.lessonReviewReturn = null;
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
    const routeOptions = getReviewRouteOptions(window.location.hash);
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
    const requestedLesson = parseLessonHash(window.location.hash);
    const isExactLesson = requestedLesson?.courseId === lesson.courseId && requestedLesson.slug === lesson.slug;
    if (lesson.answerHeading || routeOptions.returnToken) {
      await this.loadReviewConcepts();
      if (sequence !== this.renderSequence) return;
    }
    if (routeOptions.returnToken && isExactLesson) {
      const saved = this.savedReviewSession ?? this.reviewSessionRepository?.read();
      const context = saved?.returnContext;
      if (context?.token === routeOptions.returnToken && context.lessonId === lesson.id && saved?.id === context.sessionId) {
        try {
          const collection = await loadQuizCollection(saved.scope.languageId, this.curriculum);
          if (sequence !== this.renderSequence) return;
          const questions = collection.questions.filter((question) =>
            (!saved.scope.lessonId || question.lessonId === saved.scope.lessonId) &&
            (!saved.scope.conceptId || question.conceptId === saved.scope.conceptId));
          const restored = restoreReviewSession(saved, questions, saved.scope);
          if (restored.status === "restored" && restored.session.questions.some((question) => {
            if (question.id !== context.questionId) return false;
            const concept = this.reviewConcepts?.find((item) => item.id === question.conceptId && item.lessonId === question.lessonId);
            return question.lessonId === lesson.id || getReviewDocumentLesson(this.curriculum, concept)?.id === lesson.id;
          })) {
            this.lessonReviewReturn = { saved, context };
          }
        } catch {
          // The document remains readable even when its saved review is unavailable.
        }
      }
    }
    if (!isExactLesson && window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.renderLoadingLesson(lesson);
    try {
      const markdown = await loadLessonMarkdown(lesson);
      if (sequence !== this.renderSequence) return;
      this.lessonQuizLoadFailed = false;
      if (lesson.answerHeading) {
        this.quizCollections ??= new Map();
        if (!this.quizCollections.has(lesson.languageId)) {
          try {
            this.quizCollections.set(lesson.languageId, await loadQuizCollection(lesson.languageId, this.curriculum));
          } catch {
            this.lessonQuizLoadFailed = true;
          }
          if (sequence !== this.renderSequence) return;
        }
      }
      this.currentLesson = lesson;
      this.currentMarkdown = markdown;
      this.rememberServiceLocation("learn", getCourseTopic(getCourse(this.curriculum, lesson.courseId)));
      const navigation = this.getServiceNavigation();
      navigation.recentLessonIds = [lesson.id, ...navigation.recentLessonIds.filter((id) => id !== lesson.id)].slice(0, 2);
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
      if (routeOptions.heading) {
        const section = document.getElementById?.(headingId(routeOptions.heading));
        if (section) {
          const answerDetails = section.closest?.("details");
          if (answerDetails) answerDetails.open = true;
          section.setAttribute("tabindex", "-1");
          section.scrollIntoView({ behavior: "instant", block: "start" });
          section.focus({ preventScroll: true });
        } else this.announce("해당 절을 찾지 못해 문서 처음을 표시합니다.");
      }
      const readingPosition = this.getServiceNavigation().restoreReadingPosition;
      this.getServiceNavigation().restoreReadingPosition = null;
      if (readingPosition?.href === window.location.hash && (!routeOptions.returnToken || this.lessonReviewReturn)) {
        const answer = this.root.querySelector?.("#lesson-answer");
        if (answer) answer.open = readingPosition.answerOpen;
        window.scrollTo({ top: readingPosition.scrollY, behavior: "instant" });
      }
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  async openReviewRoute(languageId, lessonId = null) {
    const { conceptId } = getReviewRouteOptions(window.location.hash);
    const language = getLanguage(this.curriculum, languageId);
    if (!language) {
      await this.openLessonRoute();
      return;
    }

    const sequence = this.enterView("review");
    if (
      lessonId &&
      !this.curriculum.lessons.some((lesson) => lesson.id === lessonId && lesson.languageId === languageId)
    ) {
      this.renderFatalError(new Error("선택한 학습 문서를 찾을 수 없습니다. 문서 목록에서 다시 선택해 주세요."));
      return;
    }
    this.quizLessonId = lessonId;
    this.quizConceptId = conceptId;

    const canonicalHash = buildKeywordReviewHash(languageId, lessonId, conceptId);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.root.innerHTML = this.renderServiceShell({
      current: "review",
      mainContent: renderQuizLoadingView({ title: language.name }),
    });
    this.syncMenuState();
    try {
      const collection = await loadQuizCollection(languageId, this.curriculum);
      if (sequence !== this.renderSequence) return;

      this.quizCollection = collection;
      this.quizCollections ??= new Map();
      this.quizCollections.set(languageId, collection);
      if (conceptId && !collection.questions.some((question) => question.conceptId === conceptId && (!lessonId || question.lessonId === lessonId))) {
        throw new Error("선택한 키워드의 문제를 찾을 수 없습니다. 객관식 문제 목록에서 다시 선택해 주세요.");
      }
      await this.loadReviewConcepts();
      if (sequence !== this.renderSequence) return;
      this.refreshQuizHistory();
      const restored = this.reviewSessionRepository?.readStatus === "invalid" && !this.savedReviewSession
        ? { status: "invalid" }
        : restoreReviewSession(this.savedReviewSession, this.getScopedQuizQuestions(), this.getReviewScope());
      if (restored.status === "restored") this.quizSession = restored.session;
      else this.startQuizSession(this.getScopedQuizQuestions(), "all");
      this.reviewRestoreNotice = ["content-changed", "invalid"].includes(restored.status)
        ? "문제 내용이 바뀌었거나 저장된 풀이를 읽을 수 없어 이어서 풀 수 없습니다. 기존 완료 기록은 유지됩니다." : "";
      this.reviewNeedsRestart = ["content-changed", "invalid"].includes(restored.status);
      const reviewLesson = this.curriculum.lessons.find((lesson) => lesson.id === lessonId);
      const reviewCourse = this.curriculum.courses?.find((course) => course.id === reviewLesson?.courseId);
      this.rememberServiceLocation("review", reviewCourse ? getCourseTopic(reviewCourse) : languageId);
      this.renderQuiz();
      const reviewTitle = reviewCourse && reviewCourse.categoryId !== "language"
        ? `${reviewCourse.name} · 객관식 복습` : collection.title;
      document.title = `${reviewTitle} · BAM.dev`;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (this.hasRenderedView) {
        this.focusQuizQuestion();
        this.announce(restored.status === "restored" ? "저장된 풀이를 이어갑니다." : "복습 첫 문제로 이동했습니다.");
      }
      this.hasRenderedView = true;
      if (restored.status === "restored") this.restoreReviewViewport();
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  async loadReviewConcepts() {
    if (this.reviewConceptsLoaded) return;
    try {
      const response = await fetch("./content/review-concepts.json");
      this.reviewConceptsLoadFailed = !response.ok;
      this.reviewConcepts = response.ok ? validateReviewConcepts(await response.json(), this.curriculum) : [];
    } catch {
      this.reviewConcepts = [];
      this.reviewConceptsLoadFailed = true;
    }
    this.reviewConceptsLoaded = true;
  }

  getServiceNavigation() {
    this.catalogFilters ??= { learn: { topicId: null, query: "" }, review: { topicId: null, query: "" } };
    this.serviceNavigation ??= {
      routes: {
        learn: "#/learn",
        review: "#/review",
        quest: buildQuestCatalogHash(),
        "coding-test": buildCodingTestListHash(),
        "web-project": buildWebProjectListHash(),
      },
      recentLessonIds: [],
      query: "",
    };
    return this.serviceNavigation;
  }

  getCurrentService() {
    const serviceByView = {
      home: "home",
      lesson: "learn",
      "learn-catalog": "learn",
      review: "review",
      "review-catalog": "review",
      quest: "quest",
      "quest-catalog": "quest",
      "coding-test": "coding-test",
      "coding-test-list": "coding-test",
      "web-project": "web-project",
      "web-project-list": "web-project",
      "my-page": "my-page",
    };
    return serviceByView[this.currentView] ?? "home";
  }

  getCodeQuestCatalog() {
    return createCodeQuestCatalog(
      this.curriculum,
      this.codeQuestCollections,
      this.progressRepository.getProgress(),
    );
  }

  openCodeQuestCatalogRoute() {
    this.enterView("quest-catalog");
    const canonicalHash = buildQuestCatalogHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }
    const catalog = this.getCodeQuestCatalog();
    if (!catalog.courses.length) {
      this.renderFatalError(new Error("등록된 Code Quest가 없습니다."));
      return;
    }
    if (!catalog.courses.some((course) => course.id === this.codeQuestCatalogFilters.courseId)) {
      this.codeQuestCatalogFilters = {
        ...this.codeQuestCatalogFilters,
        courseId: catalog.courses[0].id,
        topicId: "all",
        status: "all",
      };
    }
    this.renderCodeQuestCatalog();
    document.title = "Code Quest · BAM.dev";
    this.finishServiceNavigation();
  }

  renderCodeQuestCatalog() {
    const catalog = this.getCodeQuestCatalog();
    const course = catalog.courses.find(
      (item) => item.id === this.codeQuestCatalogFilters.courseId,
    ) ?? catalog.courses[0] ?? null;
    if (!course) return;
    const items = filterCodeQuestCatalogItems(course.items, this.codeQuestCatalogFilters);
    const mainContent = renderCodeQuestCatalogView({
      catalog,
      course,
      items,
      filters: this.codeQuestCatalogFilters,
      notice: this.codeQuestCatalogNotice,
    });
    this.root.innerHTML = this.renderServiceShell({ current: "quest", mainContent });
    this.syncMenuState();
  }

  updateCodeQuestCatalogSearch() {
    if (this.currentView !== "quest-catalog") return;
    this.codeQuestCatalogFilters.query = this.root.querySelector("[data-quest-search]")?.value ?? "";
    this.codeQuestCatalogNotice = "";
    this.renderCodeQuestCatalog();
    this.root.querySelector("[data-quest-result-count]")?.focus?.({ preventScroll: true });
  }

  openCodeQuestByNumber() {
    if (this.currentView !== "quest-catalog") return;
    const input = this.root.querySelector("[data-quest-number]");
    const number = input?.value ?? "";
    this.codeQuestCatalogFilters.number = number;
    const catalog = this.getCodeQuestCatalog();
    const course = catalog.courses.find(
      (item) => item.id === this.codeQuestCatalogFilters.courseId,
    );
    const quest = findCodeQuestByDisplayOrder(course?.items, number);
    if (quest) {
      window.location.hash = quest.href;
      return;
    }
    this.codeQuestCatalogNotice = `이 과정에는 ${number || "입력한"}번 Quest가 없습니다. 1부터 ${course?.totalCount ?? 0} 사이의 번호를 입력해 주세요.`;
    this.renderCodeQuestCatalog();
    this.root.querySelector("[data-quest-catalog-notice]")?.focus?.({ preventScroll: true });
  }

  rememberServiceLocation(kind, topicId) {
    this.getServiceNavigation().routes[kind] = window.location.hash;
    if (topicId && this.catalogFilters[kind].topicId !== topicId) this.catalogFilters[kind] = { topicId, query: "" };
  }

  getSidebarSearchResults() {
    const query = this.getServiceNavigation().query;
    const content = { curriculum: this.curriculum, collections: this.quizCollections, concepts: this.reviewConcepts ?? [], query };
    return {
      learn: query.trim() && this.curriculum ? getLearningCatalogItems({ ...content, kind: "learn" }) : [],
      review: query.trim() && this.curriculum ? getLearningCatalogItems({ ...content, kind: "review" }) : [],
      loading: this.sidebarCatalogLoading,
      failures: this.sidebarCatalogFailures ?? [],
    };
  }

  getServiceSidebar(current) {
    const navigation = this.getServiceNavigation();
    const isCatalogService = ["learn", "review"].includes(current);
    const activeHref = current === "learn" && this.currentLesson
      ? buildLessonHash(this.currentLesson.courseId, this.currentLesson.slug)
      : current === "review" && this.quizCollection
        ? buildKeywordReviewHash(this.quizCollection.languageId, this.quizLessonId, this.quizConceptId)
        : "";
    return {
      current, activeHref, routes: navigation.routes, query: navigation.query,
      topicId: isCatalogService ? this.catalogFilters?.[current]?.topicId ?? null : null,
      items: isCatalogService && this.curriculum ? getLearningCatalogItems({ curriculum: this.curriculum, collections: this.quizCollections, concepts: this.reviewConcepts ?? [], kind: current }) : [],
      recent: navigation.recentLessonIds.flatMap((id) => {
        const lesson = this.curriculum?.lessons.find((item) => item.id === id);
        return lesson ? [{ title: lesson.title, href: buildLessonHash(lesson.courseId, lesson.slug) }] : [];
      }),
      loading: this.sidebarCatalogLoading,
      searchResults: this.getSidebarSearchResults(),
    };
  }

  renderServiceShell({ current = "home", mainContent = "" } = {}) {
    return renderLearningShell({ current, mainContent, theme: this.themeController?.getState(), menuOpen: this.menuOpen, sidebar: this.getServiceSidebar(current) });
  }

  async loadSidebarCatalog() {
    if (!this.curriculum) return;
    if (this.sidebarCatalogPromise) return this.sidebarCatalogPromise;
    this.sidebarCatalogLoading = true;
    this.sidebarCatalogPromise = (async () => {
      await this.loadReviewConcepts();
      this.quizCollections ??= new Map();
      const failures = [];
      await Promise.all(this.curriculum.languages.filter((language) => language.status !== "planned").map(async (language) => {
        if (this.quizCollections.has(language.id)) return;
        try {
          this.quizCollections.set(language.id, await loadQuizCollection(language.id, this.curriculum));
        } catch { failures.push(language.name); }
      }));
      this.sidebarCatalogFailures = failures;
      this.sidebarCatalogLoading = false;
      const context = this.root.querySelector?.("[data-sidebar-context]");
      if (context) {
        const focusedTopic = document.activeElement?.matches?.("[data-sidebar-topic]");
        const current = this.getCurrentService();
        context.innerHTML = renderSidebarContext(this.getServiceSidebar(current));
        if (focusedTopic) this.root.querySelector("[data-sidebar-topic]")?.focus({ preventScroll: true });
      }
      this.updateSidebarSearch();
    })();
    return this.sidebarCatalogPromise;
  }

  updateSidebarSearch() {
    const query = this.getServiceNavigation().query;
    const results = this.root.querySelector?.("#sidebar-search-results");
    if (!results) return;
    results.hidden = !query.trim();
    results.innerHTML = query.trim() ? renderSidebarSearchResults(this.getSidebarSearchResults()) : "";
    this.root.querySelector("[data-sidebar-search]")?.setAttribute("aria-expanded", String(!results.hidden));
  }

  clearSidebarSearch() {
    this.getServiceNavigation().query = "";
    const input = this.root.querySelector?.("[data-sidebar-search]");
    if (input) input.value = "";
    this.updateSidebarSearch();
  }

  openSidebarCatalog(kind, topicId) {
    if (!["learn", "review"].includes(kind)) return;
    const items = getLearningCatalogItems({ curriculum: this.curriculum, collections: this.quizCollections, concepts: this.reviewConcepts ?? [], kind });
    if (topicId !== null && topicId !== "all" && !items.some((item) => item.topicId === topicId)) return;
    this.catalogFilters[kind] = { topicId, query: "" };
    this.clearSidebarSearch();
    if (this.currentView === `${kind}-catalog`) {
      this.renderLearningCatalog();
      this.root.querySelector("[data-sidebar-topic]")?.focus({ preventScroll: true });
    } else window.location.hash = `#/${kind}`;
  }

  finishServiceNavigation() {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (this.hasRenderedView) document.querySelector("#lesson-content")?.focus({ preventScroll: true });
    this.hasRenderedView = true;
  }

  async openLearningCatalog(kind) {
    const sequence = this.enterView(`${kind}-catalog`);
    this.rememberServiceLocation(kind);
    this.root.innerHTML = this.renderServiceShell({ current: kind, mainContent: '<main class="main-area service-main" id="lesson-content" tabindex="-1"><p role="status">학습자료를 준비하고 있어요…</p></main>' });
    this.syncMenuState();
    await this.loadReviewConcepts();
    const failures = [];
    if (kind === "review") {
      await Promise.all(this.curriculum.languages.filter((language) => language.status !== "planned").map(async (language) => {
        if (this.quizCollections.has(language.id)) return;
        try {
          this.quizCollections.set(language.id, await loadQuizCollection(language.id, this.curriculum));
        } catch { failures.push(language.name); }
      }));
    }
    if (sequence !== this.renderSequence) return;
    this.catalogFailedLanguages = failures;
    this.renderLearningCatalog();
    document.title = `${kind === "review" ? "객관식 문제" : "학습문서"} · BAM.dev`;
    this.finishServiceNavigation();
  }

  renderLearningCatalog() {
    const kind = this.currentView === "review-catalog" ? "review" : "learn";
    this.root.innerHTML = this.renderServiceShell({ current: kind, mainContent: renderLearningCatalog({
      curriculum: this.curriculum, collections: this.quizCollections, concepts: this.reviewConcepts,
      kind, filters: this.catalogFilters[kind], saved: this.savedReviewSession,
      failedLanguages: this.catalogFailedLanguages,
    }) });
    this.syncMenuState();
  }

  renderMyPage() {
    if (!this.curriculum) return;

    let progress = {};
    let webProjectState = {};
    let isPersistent = true;
    const storageReadErrors = [];
    try {
      progress = this.progressRepository.getProgress();
      isPersistent =
        this.progressRepository.getPersistenceStatus().isPersistent === true;
    } catch {
      isPersistent = false;
      storageReadErrors.push("progress");
    }
    try {
      webProjectState = this.webProjectRepository.getState();
      isPersistent =
        isPersistent &&
        this.webProjectRepository.getPersistenceStatus().isPersistent === true;
    } catch {
      isPersistent = false;
      storageReadErrors.push("web-project");
    }

    const mainContent = renderMyPageView({
      curriculum: this.curriculum,
      progress,
      quizCollections: this.quizCollections,
      codeQuestCollections: this.codeQuestCollections,
      codingTestCollections: this.codingTestCollection
        ? [this.codingTestCollection]
        : [],
      webProjectCollection: this.webProjectCollection,
      webProjectState,
      isPersistent,
      storageReadErrors,
    });
    this.root.innerHTML = this.renderServiceShell({
      current: "my-page",
      mainContent,
    });
    this.syncMenuState();
  }

  updateCatalogFilters() {
    const kind = this.currentView === "review-catalog" ? "review" : "learn";
    this.catalogFilters[kind] = {
      topicId: this.catalogFilters[kind].topicId ?? null,
      query: this.root.querySelector("[data-catalog-search]")?.value ?? "",
    };
    this.renderLearningCatalog();
    this.root.querySelector("[data-catalog-search]")?.focus({ preventScroll: true });
  }

  getReviewScope() {
    return { languageId: this.quizCollection?.languageId, lessonId: this.quizLessonId ?? null, conceptId: this.quizConceptId ?? null };
  }

  saveReviewSession({ captureViewport = false } = {}) {
    const session = this.quizSession;
    if (!this.reviewSessionRepository || this.currentView !== "review" || !session?.questions.length || this.reviewNeedsRestart) return false;
    if (captureViewport) {
      const card = this.getQuizQuestionCard() ?? this.root.querySelector?.(".quiz-result-card");
      const active = document.activeElement;
      session.viewport = {
        anchor: session.questions[session.currentIndex]?.id,
        offset: card?.getBoundingClientRect?.().top ?? 0,
        scrollY: window.scrollY ?? 0,
        focusId: active?.id || null,
      };
    }
    const selectedLesson = this.curriculum.lessons.find((lesson) => lesson.id === this.quizLessonId);
    const selectedCourse = selectedLesson ? getCourse(this.curriculum, selectedLesson.courseId) : null;
    const title = selectedCourse?.categoryId === "spring"
      ? `${selectedCourse.name} · ${selectedLesson.title}` : this.quizCollection.title;
    const saved = {
      id: session.id, scope: this.getReviewScope(), title,
      contentSignature: getReviewContentSignature(this.getScopedQuizQuestions()),
      questionIds: session.questions.map((question) => question.id), mode: session.mode,
      viewMode: session.viewMode ?? "single", gradingMode: session.gradingMode ?? "individual",
      currentIndex: session.currentIndex, selectedOptionIds: [...session.selectedOptionIds],
      gradedQuestionIds: [...session.gradedAnswers.keys()], screen: session.screen,
      firstAttemptByQuestion: [...(session.firstAttemptByQuestion ?? [])].map(([questionId, firstAttempt]) => [
        questionId,
        { selectedOptionId: firstAttempt.selectedOptionId, isCorrect: false },
      ]),
      recordAttempted: session.recordAttempted, persistenceStatus: session.persistenceStatus,
      expandedQuestionIds: [...(session.expandedQuestionIds ?? [])],
      returnContext: session.returnContext ?? null, viewport: session.viewport ?? null,
      completedAt: session.completedAt ?? null,
      recordedAnswers: session.completedAt ? [...session.gradedAnswers.values()].map(({ questionId, isCorrect }) => ({ questionId, isCorrect })) : null,
    };
    try {
      this.reviewSaveStatus = this.reviewSessionRepository.save(saved);
      this.savedReviewSession = saved;
    } catch (error) {
      this.reviewSaveStatus = "failed";
      if (error.message.includes("다른 탭")) this.reviewStorageConflict = true;
      this.reviewRestoreNotice = error.message;
    }
    const status = this.root.querySelector?.("[data-review-save-status]");
    const message = getQuizSaveStatusMessage(this.reviewSaveStatus);
    if (status && status.textContent !== message) status.textContent = message;
    const notice = this.root.querySelector?.("[data-review-save-notice]");
    const noticeMessage = this.root.querySelector?.("[data-review-save-message]");
    if (notice) notice.hidden = !this.reviewRestoreNotice;
    if (noticeMessage) noticeMessage.textContent = this.reviewRestoreNotice ?? "";
    return this.reviewSaveStatus !== "failed";
  }

  restoreReviewViewport({ keepFocusVisible = false } = {}) {
    const viewport = this.quizSession?.viewport;
    if (!viewport) return;
    window.requestAnimationFrame(() => {
      const card = this.getQuizQuestionCard() ?? this.root.querySelector?.(".quiz-result-card");
      const top = Number.isFinite(viewport.offset) && card
        ? (window.scrollY ?? 0) + card.getBoundingClientRect().top - viewport.offset
        : viewport.scrollY;
      window.scrollTo({ top: Number.isFinite(top) ? Math.max(0, top) : 0, behavior: "instant" });
      const focusTarget = viewport.focusId ? document.getElementById(viewport.focusId) : null;
      const legacySelectors = {
        "quiz-related-concept": "[data-related-concept]",
        "quiz-feedback-toggle": "[data-quiz-feedback-toggle]",
        "quiz-question-title": "[data-quiz-question-title]",
        "quiz-answer-summary-title": "[data-quiz-grade-summary]",
      };
      const oldOptionIndex = /^quiz-option-(\d+)$/.exec(viewport.focusId ?? "")?.[1];
      const legacyTarget = oldOptionIndex !== undefined
        ? card?.querySelectorAll?.("[data-quiz-option]")[Number(oldOptionIndex)]
        : card?.querySelector?.(legacySelectors[viewport.focusId] ?? "[data-quiz-question-title]");
      let target = [focusTarget, legacyTarget, card?.querySelector?.("[data-quiz-question-title]"), this.root.querySelector("#quiz-result-title")]
        .find((element) => element && !element.disabled && element.isConnected !== false);
      const bounds = target?.getBoundingClientRect?.();
      if (keepFocusVisible && bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
        // A display change can move the toolbar away from the preserved question.
        target = card?.querySelector?.("[data-quiz-question-title]") ?? target;
        target?.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
      target?.focus({ preventScroll: true });
    });
  }

  openConceptOverlay(button) {
    const question = this.activateQuizQuestionForElement(button);
    const owner = this.curriculum.lessons.find((item) => item.id === question?.lessonId);
    if (!owner || !question) return;
    const concept = this.reviewConcepts?.find((item) => item.id === question.conceptId && item.lessonId === owner.id);
    const lesson = getReviewDocumentLesson(this.curriculum, concept) ?? owner;
    this.saveReviewSession({ captureViewport: true });
    if (this.quizSession.viewport) this.quizSession.viewport.focusId = button.id || "quiz-related-concept";
    this.closeConceptOverlay({ restoreFocus: false });
    const dialog = document.createElement("dialog");
    dialog.className = "concept-dialog";
    dialog.setAttribute("aria-labelledby", "concept-dialog-title");
    dialog.innerHTML = `<div class="concept-dialog-heading"><div><p class="eyebrow">${concept ? "관련 개념" : "관련 학습문서 요약"}</p><h2 id="concept-dialog-title">${renderInlineCodeText(concept?.title ?? lesson.title)}</h2></div><button class="icon-button" type="button" data-concept-close aria-label="개념 설명 닫기">×</button></div><div class="lesson-body">${concept ? renderMarkdown(concept.excerpt) : `<p>${escapeHtml(lesson.summary)}</p>`}</div><a class="button button--primary" href="${buildLessonHash(lesson.courseId, lesson.slug)}" data-concept-document>학습문서에서 자세히 보기</a>`;
    this.root.append(dialog);
    this.conceptDialog = dialog;
    this.conceptTrigger = button;
    dialog.addEventListener("close", () => {
      document.body.classList.remove("concept-open");
      if (this.conceptDialog === dialog) this.conceptDialog = null;
      dialog.remove();
      if (button.isConnected) button.focus({ preventScroll: true });
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const elements = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length > 0);
      const target = getFocusLoopTarget(elements, document.activeElement, event.shiftKey);
      if (!target) return;
      event.preventDefault();
      target.focus();
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const onBackdrop = event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
      if (event.target.closest("[data-concept-close]") || onBackdrop) {
        this.closeConceptOverlay();
        return;
      }
      if (event.target.closest("[data-concept-document]")) {
        event.preventDefault();
        const token = createClientEntropy();
        this.quizSession.returnContext = { token, sessionId: this.quizSession.id, lessonId: lesson.id, questionId: question.id };
        this.saveReviewSession();
        this.closeConceptOverlay({ restoreFocus: false });
        window.location.hash = buildReviewLessonHash(lesson, token, concept?.heading);
      }
    });
    document.body.classList.add("concept-open");
    dialog.showModal();
    dialog.querySelector("[data-concept-close]").focus();
  }

  closeConceptOverlay({ restoreFocus = true } = {}) {
    const dialog = this.conceptDialog;
    if (!dialog) return;
    this.conceptDialog = null;
    document.body.classList.remove("concept-open");
    dialog.remove();
    if (restoreFocus && this.conceptTrigger?.isConnected) this.conceptTrigger.focus({ preventScroll: true });
  }

  async openCodeQuestRoute(languageId, slug) {
    const language = getLanguage(this.curriculum, languageId);
    const lessons = getLessonsForLanguage(this.curriculum, languageId);
    if (!isAvailableCodeQuestLanguage(language) || lessons.length === 0) {
      await this.openLessonRoute();
      return;
    }

    const sequence = this.enterView("quest");
    this.root.innerHTML = this.renderServiceShell({
      current: "quest",
      mainContent: renderCodeQuestLoadingView({ languageName: language.name }),
    });
    this.syncMenuState();

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
    this.enterView("coding-test-list");
    if (!this.codingTestCollection) {
      this.renderFatalError(new Error("등록된 코딩테스트가 없습니다."));
      return;
    }

    const canonicalHash = buildCodingTestListHash();
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.renderCodingTestList();
    document.title = `${this.codingTestCollection.title} · BAM.dev`;
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
      language.status === "planned" ||
      languageId !== DEFAULT_LANGUAGE_ID
    ) {
      window.history.replaceState(null, "", buildCodingTestListHash());
      this.openCodingTestListRoute();
      return;
    }

    const sequence = this.enterView("coding-test");
    this.root.innerHTML = this.renderServiceShell({
      current: "coding-test",
      mainContent: renderCodingTestLoadingView({ title: language.name }),
    });
    this.syncMenuState();

    try {
      if (
        !this.codingTestCollection ||
        this.codingTestCollection.languageId !== languageId
      ) {
        this.codingTestCollection = await loadCodingTestCollection(
          languageId,
          this.curriculum,
        );
      }
      if (sequence !== this.renderSequence) return;

      const problem = findCodingTestProblemBySlug(this.codingTestCollection, slug);
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
    this.root.innerHTML = this.renderServiceShell({
      current: "web-project",
      mainContent: renderWebProjectLoadingView(),
    });
    this.syncMenuState();
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
    const serviceLink = event.target.closest("[data-service-link]");
    if (serviceLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const navigation = this.getServiceNavigation();
      navigation.restoreReadingPosition = serviceLink.dataset.serviceLink === "learn" && this.currentView !== "lesson" ? navigation.readingPosition : null;
      const topicId = this.catalogFilters.learn.topicId;
      if (serviceLink.dataset.serviceLink === "review" && ["lesson", "learn-catalog"].includes(this.currentView)
        && !this.lessonReviewReturn && topicId && topicId !== "all") {
        event.preventDefault();
        this.catalogFilters.review = { topicId, query: "" };
        this.clearSidebarSearch();
        window.location.hash = "#/review";
        return;
      }
      if (serviceLink.getAttribute("href") === window.location.hash && !this.mobileMedia.matches) {
        event.preventDefault();
        this.root.querySelector("#lesson-content")?.focus({ preventScroll: true });
      }
    }
    const sidebarResult = event.target.closest("[data-sidebar-result]");
    if (sidebarResult && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      const href = sidebarResult.getAttribute("href");
      this.clearSidebarSearch();
      if (href === window.location.hash) this.root.querySelector("#lesson-content")?.focus({ preventScroll: true });
      else window.location.hash = href;
      return;
    }
    if (this.getServiceNavigation().query && !event.target.closest("[data-sidebar-search-form]")) this.clearSidebarSearch();
    const sidebarCatalog = event.target.closest("[data-sidebar-catalog]");
    if (sidebarCatalog) {
      const kind = sidebarCatalog.dataset.sidebarCatalog;
      this.openSidebarCatalog(kind, this.catalogFilters[kind]?.topicId ?? "all");
      return;
    }
    if (event.target.closest("[data-sidebar-retry]")) {
      this.sidebarCatalogPromise = null;
      void this.loadSidebarCatalog();
      this.updateSidebarSearch();
      return;
    }
    const themeChoice = event.target.closest("[data-theme-choice]");
    if (themeChoice) {
      this.themeController?.setTheme(themeChoice.dataset.themeChoice);
      return;
    }
    const sectionLink = event.target.closest("[data-lesson-section]");
    if (sectionLink) {
      const section = document.getElementById(sectionLink.dataset.lessonSection);
      if (section && this.root.contains(section)) {
        const answer = section.closest("details");
        if (answer) answer.open = true;
        section.setAttribute("tabindex", "-1");
        section.focus({ preventScroll: true });
        section.scrollIntoView({ block: "start", behavior: "instant" });
      }
      return;
    }
    const catalogTopic = event.target.closest("[data-catalog-topic]");
    if (catalogTopic && !catalogTopic.disabled) {
      const kind = this.currentView === "review-catalog" ? "review" : "learn";
      this.catalogFilters[kind] = {
        topicId: catalogTopic.dataset.catalogTopic,
        query: this.root.querySelector("[data-catalog-search]")?.value ?? "",
      };
      this.renderLearningCatalog();
      this.root.querySelector('[data-catalog-topic][aria-pressed="true"]')?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-catalog-reset]")) {
      const kind = this.currentView === "review-catalog" ? "review" : "learn";
      this.catalogFilters[kind] = { topicId: null, query: "" };
      this.renderLearningCatalog();
      this.root.querySelector("[data-catalog-search]")?.focus();
      return;
    }
    const questCourse = event.target.closest("[data-quest-course]");
    if (questCourse && this.currentView === "quest-catalog") {
      this.codeQuestCatalogFilters = {
        courseId: questCourse.dataset.questCourse,
        topicId: "all",
        status: "all",
        query: "",
        number: "",
      };
      this.codeQuestCatalogNotice = "";
      this.renderCodeQuestCatalog();
      this.root.querySelector('[data-quest-course][aria-pressed="true"]')?.focus({ preventScroll: true });
      return;
    }
    const questTopic = event.target.closest("[data-quest-topic]");
    if (questTopic && this.currentView === "quest-catalog") {
      this.codeQuestCatalogFilters.topicId = questTopic.dataset.questTopic;
      this.codeQuestCatalogNotice = "";
      this.renderCodeQuestCatalog();
      this.root.querySelector('[data-quest-topic][aria-pressed="true"]')?.focus({ preventScroll: true });
      return;
    }
    const questStatus = event.target.closest("[data-quest-status]");
    if (questStatus && this.currentView === "quest-catalog") {
      this.codeQuestCatalogFilters.status = questStatus.dataset.questStatus;
      this.codeQuestCatalogNotice = "";
      this.renderCodeQuestCatalog();
      this.root.querySelector('[data-quest-status][aria-pressed="true"]')?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-quest-catalog-reset]") && this.currentView === "quest-catalog") {
      this.codeQuestCatalogFilters = {
        ...this.codeQuestCatalogFilters,
        topicId: "all",
        status: "all",
        query: "",
        number: "",
      };
      this.codeQuestCatalogNotice = "";
      this.renderCodeQuestCatalog();
      this.root.querySelector("[data-quest-search]")?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-review-start-new]")) {
      this.reviewNeedsRestart = false;
      this.reviewRestoreNotice = "";
      this.renderQuiz();
      this.focusQuizQuestion();
      return;
    }
    if (event.target.closest("[data-review-return]") && this.lessonReviewReturn) {
      const scope = this.lessonReviewReturn.saved.scope;
      window.location.hash = buildKeywordReviewHash(scope.languageId, scope.lessonId, scope.conceptId);
      return;
    }
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
      const answerOpen = Boolean(this.root?.querySelector?.("#lesson-answer")?.open);
      try {
        this.progressRepository.setLessonCompleted(this.currentLesson.id, !wasCompleted);
        this.renderLesson({ answerOpen });
        const updatedButton = document.querySelector("[data-toggle-complete]");
        updatedButton?.focus();
        this.announce(
          wasCompleted
            ? "학습 완료 표시를 해제했습니다."
            : "학습을 완료로 표시했습니다.",
        );
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
    const sidebarTopic = event.target.closest("[data-sidebar-topic]");
    if (sidebarTopic) {
      const kind = this.currentView.startsWith("review") ? "review" : "learn";
      this.openSidebarCatalog(kind, sidebarTopic.value || null);
      return;
    }
    const quizLesson = event.target.closest("[data-quiz-lesson]");
    if (quizLesson && this.currentView === "review" && this.quizCollection) {
      const lessonId = quizLesson.value || null;
      if (
        !lessonId ||
        this.curriculum.lessons.some((lesson) => lesson.id === lessonId && lesson.languageId === this.quizCollection.languageId)
      ) {
        window.location.hash = buildReviewHash(this.quizCollection.languageId, lessonId);
      }
      return;
    }
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
    const question = option ? this.activateQuizQuestionForElement(event.target) : null;
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
    this.saveReviewSession();
    // Keep the native radio in place while its click/change activation finishes.
    const card = this.getQuizQuestionCard();
    for (const input of card?.querySelectorAll("[data-quiz-option]") ?? []) {
      input.closest(".quiz-option")?.classList.toggle("is-selected", input.value === option.value);
    }
    const checkButton = card?.querySelector("[data-quiz-check]");
    if (checkButton) checkButton.disabled = false;
    this.updateQuizBatchControls();
  }

  handleInput(event) {
    const sidebarSearch = event.target.closest("[data-sidebar-search]");
    if (sidebarSearch) {
      this.getServiceNavigation().query = sidebarSearch.value;
      if (!event.isComposing) {
        void this.loadSidebarCatalog();
        this.updateSidebarSearch();
      }
      return;
    }
    const catalogSearch = event.target.closest("[data-catalog-search]");
    if (catalogSearch && !event.isComposing) {
      const cursor = catalogSearch.selectionStart;
      this.updateCatalogFilters();
      this.root.querySelector("[data-catalog-search]")?.setSelectionRange(cursor, cursor);
      return;
    }
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

    if (event.target.closest("[data-quest-map-focus]")) {
      const map = this.root.querySelector("#quest-detail-map");
      map?.focus({ preventScroll: true });
      map?.scrollIntoView({ behavior: "instant", block: "start" });
      return true;
    }
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
    if (this.currentView !== "review") return false;
    const questionRetryButton = event.target.closest("[data-quiz-question-retry]");
    if (questionRetryButton) {
      this.retryCurrentQuizQuestion(questionRetryButton);
      return true;
    }
    if (event.target.closest("[data-quiz-question-id]")) {
      if (!this.activateQuizQuestionForElement(event.target)) return true;
      this.saveReviewSession();
    }
    const viewButton = event.target.closest("[data-quiz-view-mode]");
    if (viewButton) { this.setQuizViewMode(viewButton.dataset.quizViewMode); return true; }
    const gradingButton = event.target.closest("[data-quiz-grading-mode]");
    if (gradingButton) { this.setQuizGradingMode(gradingButton.dataset.quizGradingMode); return true; }
    const documentLink = event.target.closest("[data-review-document]");
    if (documentLink && this.quizSession) {
      const route = parseLessonHash(documentLink.getAttribute("href"));
      const lesson = this.curriculum.lessons.find((item) => item.courseId === route?.courseId && item.slug === route?.slug);
      const question = this.quizSession.questions.find((item) => item.lessonId === lesson?.id);
      if (lesson && question) {
        event.preventDefault();
        const token = createClientEntropy();
        this.quizSession.returnContext = { token, sessionId: this.quizSession.id, lessonId: lesson.id, questionId: question.id };
        this.saveReviewSession({ captureViewport: true });
        window.location.hash = buildReviewLessonHash(lesson, token);
      }
      return true;
    }
    const conceptButton = event.target.closest("[data-related-concept]");
    if (conceptButton) {
      this.openConceptOverlay(conceptButton);
      return true;
    }
    if (event.target.closest("[data-quiz-feedback-toggle]")) {
      const question = this.getCurrentQuizQuestion();
      if (!question) return true;
      const expanded = this.quizSession.expandedQuestionIds;
      if (expanded.has(question.id)) expanded.delete(question.id);
      else expanded.add(question.id);
      this.saveReviewSession({ captureViewport: true });
      this.renderQuiz();
      this.restoreReviewViewport();
      this.getQuizQuestionCard()?.querySelector("[data-quiz-feedback-toggle]")?.focus({ preventScroll: true });
      return true;
    }
    const retryButton = event.target.closest("[data-quiz-retry]");
    if (retryButton) {
      this.retryQuiz(retryButton.dataset.quizRetry);
      return true;
    }
    if (event.target.closest("[data-quiz-history]")) {
      this.showRecentQuizResult();
      return true;
    }
    if (event.target.closest("[data-quiz-continue]")) {
      this.continueQuizToNextScope();
      return true;
    }
    if (this.quizSession?.screen !== "question") return false;

    if (event.target.closest("[data-quiz-check-all]")) {
      this.gradePendingQuizQuestions();
      return true;
    }
    if (event.target.closest("[data-quiz-finish]")) {
      this.finishQuizSession({ continueToNext: true });
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

  activateQuizQuestionForElement(element) {
    if (this.currentView !== "review" || this.quizSession?.screen !== "question") return null;
    const card = element?.closest?.("[data-quiz-question-id]");
    if (!card) return this.getCurrentQuizQuestion();
    const index = this.quizSession.questions.findIndex((question) => question.id === card.dataset.quizQuestionId);
    if (index < 0) return null;
    this.quizSession.currentIndex = index;
    return this.getCurrentQuizQuestion();
  }

  getQuizQuestionCard() {
    const questionId = this.getCurrentQuizQuestion()?.id;
    return [...(this.root.querySelectorAll?.("[data-quiz-question-id]") ?? [])]
      .find((card) => card.dataset.quizQuestionId === questionId) ?? null;
  }

  setQuizViewMode(mode) {
    if (!["single", "all"].includes(mode) || this.quizSession?.screen !== "question" || this.quizSession.viewMode === mode) return;
    this.saveReviewSession({ captureViewport: true });
    this.quizSession.viewMode = mode;
    this.renderQuiz();
    this.restoreReviewViewport({ keepFocusVisible: true });
    this.announce(`${mode === "all" ? "전부" : "하나씩"} 보기로 바꿨습니다. 풀이 상태는 유지됩니다.`);
  }

  setQuizGradingMode(mode) {
    if (!["individual", "batch"].includes(mode) || this.quizSession?.screen !== "question" || this.quizSession.gradingMode === mode) return;
    this.saveReviewSession({ captureViewport: true });
    this.quizSession.gradingMode = mode;
    this.renderQuiz();
    this.restoreReviewViewport({ keepFocusVisible: true });
    this.announce(`${mode === "batch" ? "전체" : "개별"} 채점으로 바꿨습니다. 선택한 답과 채점 결과는 유지됩니다.`);
  }

  updateQuizBatchControls() {
    const session = this.quizSession;
    if (!session || session.gradingMode !== "batch") return;
    const pending = session.questions.filter((question) => session.selectedOptionIds.has(question.id) && !session.gradedAnswers.has(question.id)).length;
    const unanswered = session.questions.filter((question) => !session.selectedOptionIds.has(question.id)).length;
    for (const button of this.root.querySelectorAll("[data-quiz-check-all]")) {
      button.textContent = `답한 ${pending}개 채점`;
      button.disabled = pending === 0;
    }
    for (const status of this.root.querySelectorAll("[data-quiz-batch-status]")) {
      status.textContent = `미채점 선택 ${pending}문항 · 미응답 ${unanswered}문항. 이미 채점한 문항과 미응답은 제외합니다.`;
    }
  }

  gradePendingQuizQuestions() {
    const session = this.quizSession;
    if (!session || session.screen !== "question" || session.gradingMode !== "batch") return;
    const pending = session.questions.filter((question) => session.selectedOptionIds.has(question.id) && !session.gradedAnswers.has(question.id));
    const unanswered = session.questions.filter((question) => !session.selectedOptionIds.has(question.id)).length;
    if (!pending.length) {
      this.announce(`새로 채점할 답이 없습니다. 미응답 ${unanswered}개 남음.`);
      return;
    }
    try {
      // Compute every candidate first; invalid content must not leave a partly graded submission.
      const answers = pending.map((question) => gradeQuestion(question, session.selectedOptionIds.get(question.id)));
      const fromEnd = document.activeElement?.id === "quiz-check-all-end";
      this.saveReviewSession({ captureViewport: true });
      for (const answer of answers) session.gradedAnswers.set(answer.questionId, answer);
      this.renderQuiz();
      this.restoreReviewViewport();
      const message = `${answers.length}개 채점, 미응답 ${unanswered}개 남음. ${session.gradedAnswers.size === session.questions.length ? "모든 문제를 채점했습니다. 결과 보기를 선택해 주세요." : "남은 답을 선택해 이어서 채점할 수 있습니다."}`;
      for (const status of this.root.querySelectorAll("[data-quiz-batch-status]")) status.textContent = message;
      window.requestAnimationFrame(() => {
        const status = this.root.querySelector(fromEnd ? "#quiz-batch-status-end" : "#quiz-batch-status");
        status?.scrollIntoView({ behavior: "instant", block: "nearest" });
        status?.focus({ preventScroll: true });
      });
    } catch {
      this.announce("선택한 답을 채점하지 못했습니다. 선택은 유지됩니다. 다시 확인해 주세요.");
    }
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
        const summary = this.getQuizQuestionCard()?.querySelector("[data-quiz-grade-summary]");
        summary?.scrollIntoView({ behavior: "instant", block: "center" });
        summary?.focus({ preventScroll: true });
      });
    } catch {
      this.announce("이 문제를 채점하지 못했습니다. 다시 선택해 주세요.");
    }
  }

  retryCurrentQuizQuestion(element) {
    const session = this.quizSession;
    if (
      !session ||
      session.screen !== "question" ||
      session.recordAttempted ||
      session.completedAt
    ) return false;
    if (this.reviewStorageConflict) {
      this.announce("다른 탭에서 풀이가 바뀌었습니다. 저장된 풀이를 다시 불러온 뒤 재도전해 주세요.");
      return false;
    }

    const card = element?.closest?.("[data-quiz-question-id]");
    const targetIndex = card
      ? session.questions.findIndex((question) => question.id === card.dataset.quizQuestionId)
      : session.currentIndex;
    const question = session.questions[targetIndex];
    const gradedAnswer = question ? session.gradedAnswers.get(question.id) : null;
    if (!question || gradedAnswer?.isCorrect !== false) return false;

    const previousIndex = session.currentIndex;
    const hadFirstAttempt = session.firstAttemptByQuestion.has(question.id);
    const previousFirstAttempt = session.firstAttemptByQuestion.get(question.id);
    const hadSelection = session.selectedOptionIds.has(question.id);
    const previousSelection = session.selectedOptionIds.get(question.id);
    const hadExpandedFeedback = session.expandedQuestionIds.has(question.id);

    session.currentIndex = targetIndex;
    if (!hadFirstAttempt) {
      session.firstAttemptByQuestion.set(question.id, {
        selectedOptionId: gradedAnswer.selectedOptionId,
        isCorrect: false,
      });
    }
    session.selectedOptionIds.delete(question.id);
    session.gradedAnswers.delete(question.id);
    session.expandedQuestionIds.delete(question.id);

    if (!this.saveReviewSession()) {
      session.currentIndex = previousIndex;
      if (hadFirstAttempt) session.firstAttemptByQuestion.set(question.id, previousFirstAttempt);
      else session.firstAttemptByQuestion.delete(question.id);
      if (hadSelection) session.selectedOptionIds.set(question.id, previousSelection);
      else session.selectedOptionIds.delete(question.id);
      session.gradedAnswers.set(question.id, gradedAnswer);
      if (hadExpandedFeedback) session.expandedQuestionIds.add(question.id);
      else session.expandedQuestionIds.delete(question.id);
      this.renderQuiz();
      this.focusQuizQuestion();
      this.announce("재도전 상태를 저장하지 못해 이전 오답 상태를 유지합니다.");
      return false;
    }

    this.renderQuiz();
    this.focusQuizQuestion();
    this.announce("이 문제를 다시 풀 수 있습니다. 답을 선택해 주세요.");
    return true;
  }

  showPreviousQuizQuestion() {
    if (!this.quizSession || this.quizSession.currentIndex === 0) return;
    this.quizSession.returnContext = null;
    this.quizSession.currentIndex -= 1;
    this.renderQuiz();
    this.focusQuizQuestion();
    this.announce(`${this.quizSession.currentIndex + 1}번 문제로 이동했습니다.`);
  }

  showNextQuizQuestion() {
    const question = this.getCurrentQuizQuestion();
    if (!question || (this.quizSession.gradingMode !== "batch" && !this.quizSession.gradedAnswers.has(question.id))) {
      this.announce("정답을 확인한 뒤 다음 문제로 이동할 수 있습니다.");
      return;
    }

    if (this.quizSession.currentIndex < this.quizSession.questions.length - 1) {
      this.quizSession.returnContext = null;
      this.quizSession.currentIndex += 1;
      this.renderQuiz();
      this.focusQuizQuestion();
      this.announce(`${this.quizSession.currentIndex + 1}번 문제로 이동했습니다.`);
      return;
    }

    this.finishQuizSession({ continueToNext: true });
  }

  finishQuizSession({ continueToNext = false } = {}) {
    const session = this.quizSession;
    if (!session || session.screen !== "question" || session.recordAttempted) return;
    if (this.reviewStorageConflict) {
      this.announce("다른 탭에서 풀이가 바뀌었습니다. 저장된 풀이를 다시 불러온 뒤 결과를 확인해 주세요.");
      return;
    }

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
    this.saveReviewSession();
    if (this.reviewStorageConflict) {
      session.recordAttempted = false;
      session.screen = "question";
      session.summary = null;
      this.renderQuiz();
      return;
    }

    try {
      const progress = this.progressRepository.recordQuizAttempt({
        languageId: this.quizCollection.languageId,
        answers: answers.map((answer) => {
          const firstAttempt = session.firstAttemptByQuestion.get(answer.questionId);
          return {
            questionId: answer.questionId,
            lessonId: answer.lessonId,
            selectedOptionId: answer.selectedOptionId,
            isCorrect: answer.isCorrect,
            ...(firstAttempt ? { firstAttempt: { ...firstAttempt } } : {}),
          };
        }),
      });
      const persistence = this.progressRepository.getPersistenceStatus();
      session.persistenceStatus = persistence.isPersistent ? "saved" : "memory";
      this.refreshQuizHistory(progress);
    } catch {
      session.persistenceStatus = "failed";
    }

    if (continueToNext && this.continueQuizToNextScope()) return;
    this.renderQuiz();
    this.focusQuizResult();
    this.announce(
      `복습을 완료했습니다. ${session.summary.correct}개를 맞혔습니다.`,
    );
  }

  retryQuiz(mode) {
    if (!this.quizCollection || !["all", "incorrect", "saved-incorrect"].includes(mode)) return;
    if (mode !== "saved-incorrect" && this.quizSession?.screen !== "result") return;
    const incorrectIds = mode === "saved-incorrect"
      ? this.progressRepository.getProgress().incorrectQuestionIds
      : this.quizSession.summary?.incorrectQuestionIds ?? [];
    const questions = this.getScopedQuizQuestions().filter((question) =>
      mode === "all" || incorrectIds.includes(question.id),
    );
    if (questions.length === 0) {
      this.announce("선택한 범위에 남은 오답이 없습니다.");
      return;
    }

    this.startQuizSession(questions, mode === "all" ? "all" : "incorrect");
    this.renderQuiz();
    this.focusQuizQuestion();
    this.announce("새 복습 세션을 시작했습니다.");
  }

  startQuizSession(questions, mode) {
    this.quizSession = {
      id: createClientEntropy(),
      mode,
      viewMode: "single",
      gradingMode: "individual",
      questions: [...questions],
      currentIndex: 0,
      selectedOptionIds: new Map(),
      gradedAnswers: new Map(),
      firstAttemptByQuestion: new Map(),
      screen: questions.length ? "question" : "empty",
      summary: null,
      recordAttempted: false,
      persistenceStatus: "saved",
      expandedQuestionIds: new Set(),
    };
  }

  getCurrentQuizQuestion() {
    if (!this.quizSession || this.quizSession.screen !== "question") return null;
    return this.quizSession.questions[this.quizSession.currentIndex] ?? null;
  }

  getScopedQuizQuestions() {
    return (this.quizCollection?.questions ?? []).filter((question) =>
      (!this.quizLessonId || question.lessonId === this.quizLessonId) &&
      (!this.quizConceptId || question.conceptId === this.quizConceptId),
    );
  }

  getQuizContinuation() {
    const unavailable = { nextScope: null, isLastScope: false };
    if (!this.quizCollection || !this.curriculum?.courses?.length || !this.curriculum.categories?.length) return unavailable;
    const questions = this.getScopedQuizQuestions();
    const topics = new Set(questions.map((question) => {
      const lesson = this.curriculum.lessons.find((item) => item.id === question.lessonId);
      const course = this.curriculum.courses.find((item) => item.id === lesson?.courseId);
      return course ? getCourseTopic(course) : null;
    }));
    if (topics.size !== 1 || topics.has(null)) return unavailable;

    let lessonId = this.quizLessonId ?? null;
    if (lessonId && this.quizConceptId) {
      lessonId = getKeywordReviewScope(this.curriculum, this.quizCollection, this.reviewConcepts ?? [], lessonId, this.quizConceptId).lessonId;
    }
    const currentHref = buildKeywordReviewHash(this.quizCollection.languageId, lessonId, this.quizConceptId);
    const items = getLearningCatalogItems({
      curriculum: this.curriculum,
      collections: new Map([[this.quizCollection.languageId, this.quizCollection]]),
      concepts: this.reviewConcepts ?? [],
      kind: "review",
      topicId: [...topics][0],
    });
    const currentIndex = items.findIndex((item) => item.href === currentHref);
    if (currentIndex < 0) return unavailable;
    return {
      nextScope: items[currentIndex + 1]?.count > 0 ? items[currentIndex + 1] : null,
      isLastScope: currentIndex === items.length - 1,
    };
  }

  continueQuizToNextScope() {
    const session = this.quizSession;
    if (this.currentView !== "review" || session?.screen !== "result" || !session.recordAttempted) return false;
    if (this.reviewStorageConflict || session.persistenceStatus === "failed" || this.reviewSaveStatus === "failed") {
      this.announce("저장 상태를 확인한 뒤 다시 시도해 주세요. 현재 결과는 그대로 유지합니다.");
      return false;
    }
    const { nextScope } = this.getQuizContinuation();
    if (!nextScope) return false;

    this.saveReviewSession();
    if (this.reviewStorageConflict || this.reviewSaveStatus === "failed") {
      this.announce("풀이를 저장하지 못해 이동하지 않았습니다. 저장 안내를 확인해 주세요.");
      return false;
    }
    window.location.hash = nextScope.href;
    return true;
  }

  showRecentQuizResult() {
    this.refreshQuizHistory();
    const attempt = this.quizRecentAttempt;
    if (!attempt) return;
    const answerIds = new Set(attempt.answers.map((answer) => answer.questionId));
    const questions = this.getScopedQuizQuestions().filter((question) => answerIds.has(question.id));
    this.startQuizSession(questions, "all");
    this.quizSession.screen = "result";
    this.quizSession.summary = summarizeQuiz(questions, attempt.answers);
    this.quizSession.gradedAnswers = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
    this.quizSession.selectedOptionIds = new Map(attempt.answers.map((answer) => [answer.questionId, answer.selectedOptionId]));
    this.quizSession.firstAttemptByQuestion = new Map(
      attempt.answers
        .filter((answer) => answer.firstAttempt)
        .map((answer) => [answer.questionId, { ...answer.firstAttempt }]),
    );
    this.quizSession.completedAt = attempt.completedAt;
    this.quizSession.recordAttempted = true;
    this.quizSession.persistenceStatus = this.progressRepository.getPersistenceStatus().isPersistent ? "saved" : "memory";
    this.renderQuiz();
    this.focusQuizResult();
  }

  refreshQuizHistory(progress = this.progressRepository.getProgress()) {
    if (!this.quizCollection) return;
    const currentQuestionIds = new Set(
      this.getScopedQuizQuestions().map((question) => question.id),
    );
    const languageAttempts = progress.quizAttempts.filter(
      (attempt) => attempt.languageId === this.quizCollection.languageId,
    );
    this.quizRecentAttempt = null;
    for (const attempt of [...languageAttempts].reverse()) {
      const answers = attempt.answers.filter((answer) => currentQuestionIds.has(answer.questionId));
      if (!answers.length) continue;
      this.quizRecentAttempt = {
        ...attempt,
        answers,
        score: answers.filter((answer) => answer.isCorrect).length,
        total: answers.length,
      };
      break;
    }
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

    const scrollX = window.scrollX ?? 0;
    const scrollY = window.scrollY ?? 0;
    const renderSequence = this.renderSequence;
    state.visibleHintCount += 1;
    const visibleHintCount = state.visibleHintCount;
    this.renderCodeQuest();
    window.scrollTo?.({ left: scrollX, top: scrollY, behavior: "instant" });
    window.requestAnimationFrame(() => {
      if (
        this.currentView !== "quest" ||
        this.codeQuestState !== state ||
        this.renderSequence !== renderSequence ||
        state.visibleHintCount !== visibleHintCount
      ) {
        return;
      }
      window.scrollTo?.({ left: scrollX, top: scrollY, behavior: "instant" });
      const hints = this.root.querySelectorAll("[data-quest-hint]");
      hints[hints.length - 1]?.focus({ preventScroll: true });
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

  renderLoadingLesson(lesson) {
    const mainContent = `
      <main class="loading-page" id="lesson-content" tabindex="-1">
        <div class="state-message" role="status">
          <span class="brand-mark" aria-hidden="true">B</span>
          <p><strong>${escapeHtml(lesson.title)}</strong> 교안을 불러오고 있습니다…</p>
        </div>
      </main>
    `;
    this.root.innerHTML = this.renderServiceShell({
      current: "learn",
      mainContent,
    });
    this.syncMenuState();
  }

  renderLesson({ answerOpen = false } = {}) {
    const lesson = this.currentLesson;
    if (!lesson || !this.curriculum) return;

    const course = getCourse(this.curriculum, lesson.courseId);
    const language = getLanguage(this.curriculum, lesson.languageId);
    if (!course || !language) return;
    const lessons = getLessonsForCourse(this.curriculum, lesson.courseId)
      .filter((item) => Boolean(item.archivedFromCatalog) === Boolean(lesson.archivedFromCatalog));
    const readingPosition = lessons.findIndex((item) => item.id === lesson.id) + 1;
    const progress = this.progressRepository.getProgress();
    const isCompleted = progress.completedLessonIds.includes(lesson.id);
    const adjacent = getAdjacentLessons(lessons, lesson.id);
    const usesCoreSummary = Boolean(lesson.source?.originalPath);
    const answer = splitMarkdownSection(this.currentMarkdown, lesson.answerHeading ?? (usesCoreSummary ? "핵심 정리" : "면접 답변 예시"));
    const overview = splitLessonOverview(answer.body);
    const prerequisite = splitMarkdownSection(overview.body, "먼저 확인할 개념");
    const metadataObjectives = lesson.source?.originalPath || !overview.objectives
      ? [...new Set(lesson.objectives)].filter((objective) => !overview.objectives.includes(objective.trim()))
      : [];

    const summaryHtml = overview.summary
      ? renderMarkdown(overview.summary, { preserveParagraphLineBreaks: true })
      : lesson.summary ? `<p>${escapeHtml(lesson.summary)}</p>` : "";
    const summaryIsObjective = [overview.objectives, ...metadataObjectives]
      .some((objective) => objective.trim() === (overview.summary || lesson.summary || "").trim());
    const prerequisiteHtml = renderMarkdown(prerequisite.section, { preserveParagraphLineBreaks: true });
    const bodyHtml = renderMarkdown(prerequisite.body, { skipFirstHeading: true, preserveParagraphLineBreaks: true });
    const answerHtml = renderMarkdown(answer.section, { preserveParagraphLineBreaks: true });
    const collection = this.quizCollections?.get(lesson.languageId);
    const relatedQuestions = collection?.questions ?? [];
    const seenReviewLinks = new Set();
    const reviewLinks = (this.reviewConcepts ?? []).filter((concept) =>
      getReviewDocumentLesson(this.curriculum, concept)?.id === lesson.id &&
      relatedQuestions.some((question) => question.lessonId === concept.lessonId && question.conceptId === concept.id))
      .map((concept) => {
        const scope = getKeywordReviewScope(this.curriculum, collection, this.reviewConcepts, concept.lessonId, concept.id);
        return { title: concept.title, href: buildKeywordReviewHash(lesson.languageId, scope.lessonId, concept.id) };
      }).filter((link) => {
        if (seenReviewLinks.has(link.href)) return false;
        seenReviewLinks.add(link.href);
        return true;
      });
    const reviewLinkHtml = lesson.answerHeading
      ? reviewLinks.length
        ? reviewLinks.map((link) => `<p class="lesson-review-link"><a class="button button--primary" href="${escapeHtml(link.href)}">${escapeHtml(link.title)} 객관식으로 복습하기</a></p>`).join("")
        : `<p class="lesson-review-link" role="status">${this.lessonQuizLoadFailed || this.reviewConceptsLoadFailed ? "관련 문제를 불러오지 못했습니다. 새로고침하여 다시 확인해 주세요." : "이 문서의 관련 객관식 문제는 아직 준비 중입니다."}</p>`
      : `<p class="lesson-review-link"><a class="button button--primary" href="${buildReviewHash(lesson.languageId, lesson.id)}">읽은 내용 객관식으로 복습하기</a></p>`;
    // Read only headings emitted by our Markdown renderer; fenced code is escaped.
    const documentHeadings = [...`${prerequisiteHtml}${bodyHtml}${answerHtml}`.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/gu)];
    const tableOfContents = `<nav class="lesson-toc" aria-label="이 문서의 목차"><p>이 문서에서</p>
      ${overview.objectives || metadataObjectives.length || summaryHtml ? '<button type="button" data-lesson-section="학습-목표">학습 목표</button>' : ""}
      ${documentHeadings.map((heading) => `<button type="button" data-lesson-section="${heading[1]}">${heading[2].replace(/<[^>]*>/gu, "")}</button>`).join("")}
      <button type="button" data-lesson-section="completion-title">핵심 질문</button>
    </nav>`;

    const mainContent = `
      <main class="main-area" id="lesson-content" tabindex="-1">
          <div class="lesson-container">
            <nav class="lesson-context" aria-label="문서 탐색"><a href="#/learn">← 학습문서 목록</a>${this.lessonReviewReturn ? '<button class="button button--secondary" type="button" data-review-return>문제로 돌아가기</button>' : ""}</nav>
            ${getReviewRouteOptions(globalThis.window?.location?.hash).returnToken && !this.lessonReviewReturn ? '<p class="catalog-notice" role="status">이 문제의 풀이를 복원할 수 없습니다. <a href="#/review">객관식 문제 목록</a>에서 다시 선택해 주세요.</p>' : ""}
            <div class="lesson-layout">
              ${tableOfContents}
              <div class="lesson-reading-content">
            <header class="lesson-hero">
              <div class="eyebrow">
                <span>${escapeHtml(course.name)}</span>
                <span aria-hidden="true">·</span>
                <span>${readingPosition}/${lessons.length}단원</span>
                <span aria-hidden="true">·</span>
                <span>약 ${lesson.estimatedMinutes}분</span>
              </div>
              <h1>${escapeHtml(lesson.title)}</h1>
              ${overview.objectives || metadataObjectives.length || summaryHtml ? `<div class="essential-question"><div><h2 id="학습-목표">학습 목표</h2>
                ${overview.objectives || metadataObjectives.length ? `<div class="lesson-summary lesson-learning-outcomes" aria-label="학습 후 할 수 있는 것">${renderMarkdown(overview.objectives, { preserveParagraphLineBreaks: true })}${metadataObjectives.length ? `<ul>${metadataObjectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join("")}</ul>` : ""}</div>` : ""}
                ${summaryHtml ? `<div class="lesson-overview-summary" id="한줄-요약">${summaryIsObjective ? "" : summaryHtml}</div>` : ""}
              </div></div>` : ""}
              ${prerequisiteHtml ? `<div class="lesson-prerequisites">${prerequisiteHtml}</div>` : ""}
            </header>

            <article class="lesson-body">
              ${bodyHtml}
            </article>

            <section class="completion-card${isCompleted ? " is-complete" : ""}" aria-labelledby="completion-title">
              <div class="completion-question">
                <span class="completion-icon" aria-hidden="true">${isCompleted ? "✓" : readingPosition}</span>
                <div>
                  <p class="eyebrow">스스로 답해 보기</p>
                  <h2 id="completion-title">${escapeHtml(lesson.essentialQuestion)}</h2>
                </div>
              </div>
              <p class="lesson-self-check-prompt">먼저 자신의 말로 답해 보세요.</p>
              ${answer.section ? `<p class="lesson-answer-guidance">${lesson.answerHeading ? "아래를 누르면 이 핵심 질문의 답을 펼쳐 자신의 설명과 비교할 수 있습니다." : usesCoreSummary ? "아래를 누르면 핵심 정리를 펼쳐 자신의 답과 비교할 수 있습니다." : "아래를 누르면 확인 문제의 답변 예시를 펼쳐 자신의 설명과 비교할 수 있습니다."}</p>
              <details class="lesson-answer" id="lesson-answer"${answerOpen ? " open" : ""}>
                <summary>${lesson.answerHeading || usesCoreSummary ? "핵심 질문 답 확인하기" : "답변 예시 확인하기"}</summary>
                <div class="lesson-body">${answerHtml}</div>
              </details>` : ""}
              <div class="completion-actions">
                <p class="completion-status">${isCompleted ? "진도에 저장되었습니다. 언제든 다시 읽고 완료 표시를 바꿀 수 있습니다." : "자신의 말로 설명할 수 있다면 완료로 표시하고 다음 단원으로 이동하세요."}</p>
                <button class="button ${isCompleted ? "button--secondary" : "button--primary"}" type="button" data-toggle-complete aria-pressed="${isCompleted}">
                  ${isCompleted ? "완료 표시 해제" : "학습 완료로 표시"}
                </button>
              </div>
            </section>

            ${reviewLinkHtml}

            <nav class="lesson-pagination" aria-label="이전 및 다음 교안">
              ${this.renderPaginationLink(adjacent.previous, "previous")}
              ${this.renderPaginationLink(adjacent.next, "next")}
            </nav>

              </div>
            </div>
          </div>
      </main>
    `;
    this.root.innerHTML = this.renderServiceShell({ current: "learn", mainContent });
    this.syncMenuState();
  }

  renderQuiz() {
    if (!this.curriculum || !this.quizCollection || !this.quizSession) return;
    if (this.reviewNeedsRestart) {
      this.root.innerHTML = this.renderServiceShell({ current: "review", mainContent: `<main class="main-area service-main" id="lesson-content" tabindex="-1"><h1>풀이를 확인해 주세요.</h1><p role="status">${escapeHtml(this.reviewRestoreNotice)}</p><button class="button button--primary" type="button" data-review-start-new>현재 문제로 새로 시작</button> <a href="#/review">문제 목록으로 이동</a></main>` });
      this.syncMenuState();
      return;
    }
    this.saveReviewSession();

    const language = getLanguage(this.curriculum, this.quizCollection.languageId);
    const lessons = getLessonsForLanguage(this.curriculum, this.quizCollection.languageId);
    if (!language || lessons.length === 0) return;
    const selectedLesson = lessons.find((lesson) => lesson.id === this.quizLessonId) ?? null;
    const selectedCourse = selectedLesson ? getCourse(this.curriculum, selectedLesson.courseId) : null;
    const firstLessonHref = buildLessonHash(lessons[0].courseId, lessons[0].slug);
    const session = this.quizSession;
    const question = this.getCurrentQuizQuestion();
    const questionLesson = lessons.find((lesson) => lesson.id === question?.lessonId) ?? null;
    const selectedConcept = this.reviewConcepts?.find((item) => item.id === this.quizConceptId && (!selectedLesson || item.lessonId === selectedLesson.id));
    const reviewTitle = selectedConcept?.title ?? (selectedLesson ? `${selectedLesson.title} · 객관식 복습` : this.quizCollection.title);
    const lessonHref = selectedLesson ? buildLessonHash(selectedLesson.courseId, selectedLesson.slug) : firstLessonHref;
    const continuation = this.getQuizContinuation();
    const scopeControls = renderQuizScopeControls({
      lessons: lessons.filter((lesson) => this.quizCollection.questions.some((question) => question.lessonId === lesson.id)).map((lesson) => ({
        ...lesson,
        courseName: getCourse(this.curriculum, lesson.courseId)?.name ?? lesson.courseId,
        questionCount: this.quizCollection.questions.filter((item) => item.lessonId === lesson.id).length,
      })),
      selectedLessonId: this.quizLessonId,
      recentAttempt: this.quizRecentAttempt,
      incorrectQuestionCount: this.quizIncorrectQuestionCount,
      saveStatus: this.reviewSaveStatus,
      notice: this.reviewRestoreNotice,
    });
    const mainContent =
      session.screen === "result"
        ? renderQuizResultView({
            title: reviewTitle,
            summary: session.summary,
            persistenceStatus: session.persistenceStatus,
            sessionMode: session.mode,
            lessonHref,
            scopeControls,
            completedAt: session.completedAt,
            ...continuation,
            continuationBlocked: this.reviewStorageConflict || this.reviewSaveStatus === "failed" || session.persistenceStatus === "failed",
            questionResults: session.questions.map((item) => {
              const lesson = lessons.find((candidate) => candidate.id === item.lessonId);
              return {
                prompt: item.prompt,
                isCorrect: session.gradedAnswers.get(item.id)?.isCorrect === true,
                firstAttempt: session.firstAttemptByQuestion.get(item.id) ?? null,
                conceptId: item.conceptId,
                lessonTitle: lesson?.title,
                lessonHref: lesson ? buildLessonHash(lesson.courseId, lesson.slug) : null,
              };
            }),
          })
        : session.screen === "empty"
          ? renderQuizEmptyView({ title: reviewTitle, scopeControls, lessonHref })
        : renderQuizQuestionView({
            languageId: this.quizCollection.languageId,
            languageName: selectedCourse && selectedCourse.categoryId !== "language" ? selectedCourse.name : language.name,
            title: reviewTitle,
            question,
            currentIndex: session.currentIndex,
            total: session.questions.length,
            answeredCount: session.gradedAnswers.size,
            selectedOptionId: session.selectedOptionIds.get(question?.id) ?? null,
            gradedAnswer: session.gradedAnswers.get(question?.id) ?? null,
            firstAttempt: session.firstAttemptByQuestion.get(question?.id) ?? null,
            recentAttempt: this.quizRecentAttempt,
            incorrectQuestionCount: this.quizIncorrectQuestionCount,
            sessionMode: session.mode,
            scopeControls,
            lessonTitle: questionLesson?.title,
            lessonHref: questionLesson ? buildLessonHash(questionLesson.courseId, questionLesson.slug) : null,
            learningObjective: question?.learningObjective ?? questionLesson?.objectives?.[0] ?? "",
            relatedConceptTitle: this.reviewConcepts?.find((item) => item.id === question?.conceptId && item.lessonId === question?.lessonId)?.title,
            otherFeedbackExpanded: session.expandedQuestionIds?.has(question?.id) ?? false,
            viewMode: session.viewMode ?? "single",
            gradingMode: session.gradingMode ?? "individual",
            canRetryQuestions: !session.recordAttempted && !session.completedAt && !this.reviewStorageConflict,
            hasNextScope: Boolean(continuation.nextScope),
            nextScope: continuation.nextScope,
            questionStates: session.questions.map((item, currentIndex) => {
              const lesson = lessons.find((candidate) => candidate.id === item.lessonId);
              return {
                question: item, currentIndex,
                selectedOptionId: session.selectedOptionIds.get(item.id) ?? null,
                gradedAnswer: session.gradedAnswers.get(item.id) ?? null,
                firstAttempt: session.firstAttemptByQuestion.get(item.id) ?? null,
                lessonHref: lesson ? buildLessonHash(lesson.courseId, lesson.slug) : null,
                learningObjective: item.learningObjective ?? lesson?.objectives?.[0] ?? "",
                relatedConceptTitle: this.reviewConcepts?.find((concept) => concept.id === item.conceptId && concept.lessonId === item.lessonId)?.title,
                otherFeedbackExpanded: session.expandedQuestionIds?.has(item.id) ?? false,
              };
            }),
          });

    this.root.innerHTML = this.renderServiceShell({ current: "review", mainContent });
    this.syncMenuState();
  }

  renderCodeQuest() {
    const state = this.codeQuestState;
    const collection = this.codeQuestCollection;
    if (!this.curriculum || !collection || !state) return;

    const progress = this.progressRepository.getProgress();
    const catalog = createCodeQuestCatalog(this.curriculum, this.codeQuestCollections, progress);
    const catalogItem = catalog.items.find((item) => item.id === state.quest.id);
    const catalogCourse = catalog.courses.find((course) => course.id === catalogItem?.courseId);
    const catalogTopic = catalogCourse?.topics.find((topic) => topic.id === catalogItem?.topicId);
    const language = getLanguage(this.curriculum, collection.languageId);
    if (!language || !catalogItem || !catalogCourse || !catalogTopic) return;

    const quests = catalogCourse.items;
    const currentIndex = quests.findIndex((quest) => quest.id === state.quest.id);
    const adjacent = getAdjacentCodeQuestCatalogItems(quests, state.quest.id);
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
      isCompleted: catalogItem.progress === "completed",
      catalogItem,
      catalogCourse,
      catalogTopic,
      catalogHref: buildQuestCatalogHash(),
      previous: adjacent.previous
        ? {
            href: adjacent.previous.href,
            title: adjacent.previous.title,
          }
        : null,
      next: adjacent.next
        ? {
            href: adjacent.next.href,
            title: adjacent.next.title,
          }
        : {
            href: buildQuestCatalogHash(),
            label: "다음 행동",
            title: "Code Quest 목록으로 돌아가기",
          },
    });

    this.root.innerHTML = this.renderServiceShell({
      current: "quest",
      mainContent,
    });
    this.syncMenuState();
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
    this.renderWebProjectShell(mainContent);
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
    this.renderWebProjectShell(mainContent);
    this.scheduleWebProjectPreviewSync();
  }

  renderWebProjectShell(mainContent) {
    this.root.innerHTML = this.renderServiceShell({
      current: "web-project",
      mainContent,
    });
    this.syncMenuState();
  }

  getSolvedCodingTestProblemIds(progress = this.progressRepository.getProgress()) {
    const completions = Array.isArray(progress.completedCodingTestProblems)
      ? progress.completedCodingTestProblems
      : [];
    const revisionByProblemId = new Map(
      getCodingTestProblemsInOrder(this.codingTestCollection).map((problem) => [
        problem.id,
        problem.revision,
      ]),
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
    const collection = this.codingTestCollection;
    if (!this.curriculum || !collection) return;
    const language = getLanguage(this.curriculum, collection.languageId);
    if (!language) return;

    const allProblems = getCodingTestProblemsInOrder(collection);
    const progress = this.progressRepository.getProgress();
    const solvedProblemIds = this.getSolvedCodingTestProblemIds(progress);
    const languageMatches =
      this.codingTestFilters.language === "all" ||
      this.codingTestFilters.language === collection.languageId;
    const visibleProblems = languageMatches
      ? filterCodingTestProblems(collection, {
          query: this.codingTestFilters.query,
          difficulty: this.codingTestFilters.difficulty,
          type: this.codingTestFilters.type,
          status: this.codingTestFilters.status,
          completedProblemIds: solvedProblemIds,
        })
      : [];
    const hrefByProblemId = Object.fromEntries(
      allProblems.map((problem) => [
        problem.id,
        buildCodingTestHash(collection.languageId, problem.slug),
      ]),
    );
    const mainContent = renderCodingTestListView({
      title: collection.title,
      problems: visibleProblems,
      totalCount: allProblems.length,
      filters: this.codingTestFilters,
      languageName: language.name,
      languageOptions: [{ value: language.id, label: language.name }],
      typeOptions: [...new Set(allProblems.map((problem) => problem.type))],
      solvedProblemIds,
      hrefByProblemId,
    });
    this.renderCodingTestShell(mainContent, progress, solvedProblemIds);

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

  renderCodingTestShell(mainContent) {
    this.root.innerHTML = this.renderServiceShell({
      current: "coding-test",
      mainContent,
    });
    this.syncMenuState();
  }

  focusQuizQuestion() {
    window.requestAnimationFrame(() => {
      const title = this.getQuizQuestionCard()?.querySelector("[data-quiz-question-title]");
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
    const mainArea =
      document.querySelector(".main-area") ??
      document.querySelector("#lesson-content");
    const mobileHeader = document.querySelector(".mobile-header");
    const footer = document.querySelector(".service-footer");
    const skipLink = document.querySelector(".skip-link");
    const isMobile = this.mobileMedia.matches;
    const activeElement = document.activeElement;
    const focusInSidebar = sidebar?.contains(activeElement);
    const focusInHeader = mobileHeader?.contains(activeElement);
    this.menuOpen = isMobile && this.menuOpen;
    sidebar?.classList.toggle("is-open", this.menuOpen);
    backdrop?.classList.toggle("is-visible", this.menuOpen);
    sidebar?.toggleAttribute("inert", isMobile && !this.menuOpen);
    mainArea?.toggleAttribute("inert", isMobile && this.menuOpen);
    mobileHeader?.toggleAttribute("inert", isMobile && this.menuOpen);
    footer?.toggleAttribute("inert", isMobile && this.menuOpen);
    skipLink?.toggleAttribute("inert", isMobile && this.menuOpen);
    if (this.menuOpen) {
      sidebar?.setAttribute("role", "dialog");
      sidebar?.setAttribute("aria-modal", "true");
    } else {
      sidebar?.removeAttribute("role");
      sidebar?.removeAttribute("aria-modal");
    }
    toggle?.setAttribute("aria-expanded", String(this.menuOpen));
    document.body.classList.toggle("menu-open", this.menuOpen);

    // Resizing or asynchronous rendering must not strand focus in hidden content.
    if (isMobile && !this.menuOpen && focusInSidebar) {
      toggle?.focus();
    } else if (!isMobile && (focusInHeader || activeElement?.matches(".sidebar-close"))) {
      sidebar?.querySelector("a[href]")?.focus();
    } else if (this.menuOpen && !focusInSidebar) {
      sidebar?.querySelector(".sidebar-close")?.focus();
    }
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
    const mainContent = `
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
    this.root.innerHTML = this.renderServiceShell({
      current: this.getCurrentService(),
      mainContent,
    });
    this.syncMenuState();
    window.requestAnimationFrame(() => {
      focusMainContent(document.querySelector("#lesson-content"));
    });
  }

  renderFatalError(error) {
    this.menuOpen = false;
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    const fallbackLesson = this.curriculum?.lessons?.[0];
    const mainContent = `
      <main class="error-page" id="lesson-content" tabindex="-1" aria-labelledby="error-title">
        <div class="state-message" role="alert">
          <span class="brand-mark" aria-hidden="true">B</span>
          <p class="eyebrow">콘텐츠를 열지 못했습니다</p>
          <h1 id="error-title">학습 페이지를 준비하는 중 문제가 생겼습니다.</h1>
          <p>${escapeHtml(message)}</p>
        </div>
        <button class="button button--primary" type="button" data-retry>다시 시도</button>
        ${fallbackLesson ? `<a class="button button--secondary" href="${buildLessonHash(fallbackLesson.courseId, fallbackLesson.slug)}">학습 문서 목록으로 돌아가기</a>` : ""}
      </main>
    `;
    this.root.innerHTML = this.renderServiceShell({
      current: this.getCurrentService(),
      mainContent,
    });
    this.syncMenuState();
    window.requestAnimationFrame(() => {
      focusMainContent(document.querySelector("#lesson-content"));
    });
  }
}

if (typeof document !== "undefined") {
  const appRoot = document.querySelector("#app");
  if (appRoot) new BamLearningApp(appRoot).start();
}
