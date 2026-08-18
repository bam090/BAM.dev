import {
  getLanguage,
  getLessonsForLanguage,
  loadCurriculum,
  loadLessonMarkdown,
} from "./core/content.js";
import {
  DEFAULT_LANGUAGE_ID,
  buildCodingTestHash,
  buildCodingTestListHash,
  buildLessonHash,
  buildQuestHash,
  buildReviewHash,
  getAdjacentLessons,
  parseCodingTestHash,
  parseQuestHash,
  parseReviewHash,
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
import { gradeQuestion, loadQuizCollection, summarizeQuiz } from "./core/quiz.js";
import { BrowserCodeQuestRunner } from "./grading/browser-code-quest-runner.js";
import { BrowserWebCodeQuestRunner } from "./grading/browser-web-code-quest-runner.js";
import { CodeQuestRunnerRouter } from "./grading/code-quest-runner-router.js";
import { CodingTestRunnerAdapter } from "./grading/coding-test-runner-adapter.js";
import {
  createBrowserStorage,
  LocalStorageProgressRepository,
  PROGRESS_STORAGE_KEY,
} from "./repositories/progress-repository.js";
import { focusMainContent, getFocusLoopTarget } from "./ui/focus.js";
import { renderLanguageNavigation } from "./ui/language-navigation.js";
import { escapeHtml, renderMarkdown } from "./ui/markdown.js";
import {
  renderQuizLoadingView,
  renderQuizQuestionView,
  renderQuizResultView,
  renderReviewNavigationLink,
} from "./ui/quiz-view.js";
import {
  getCodeQuestDraftStatusMessage,
  renderCodeQuestLoadingView,
  renderCodeQuestNavigationLink,
  renderCodeQuestView,
} from "./ui/code-quest-view.js";
import {
  getCodingTestDraftStatusMessage,
  renderCodingTestListView,
  renderCodingTestLoadingView,
  renderCodingTestNavigationLink,
  renderCodingTestView,
} from "./ui/coding-test-view.js";

const QUEST_DRAFT_SAVE_DEBOUNCE_MS = 250;
const CODING_TEST_SEARCH_DEBOUNCE_MS = 250;

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
    this.activeCodingTestExecution = null;
    this.pendingCodingTestSearchRender = null;
    this.codingTestSearchRenderTimer = null;
    this.pendingCodingTestDraftSave = null;
    this.codingTestDraftSaveTimer = null;
    this.codingTestRequestSequence = 0;
    this.activeQuestExecution = null;
    this.pendingQuestDraftSave = null;
    this.questDraftSaveTimer = null;
    this.questRequestSequence = 0;
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
      this.codingTestCollection = await loadCodingTestCollectionSafely(
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
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== PROGRESS_STORAGE_KEY) return;
      if (this.currentLesson) this.renderLesson();
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
  }

  async openRoute({ useLastLesson = false } = {}) {
    this.cancelPendingCodingTestSearchRender();
    this.flushPendingQuestDraftSave();
    this.flushPendingCodingTestDraftSave();
    if (!this.curriculum) return;
    this.abortQuestExecutionForNavigation();
    this.abortCodingTestExecutionForNavigation();

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
        questLanguage?.status === "available" &&
        questLessons.length > 0
      ) {
        await this.openCodeQuestRoute(questRoute.languageId, questRoute.slug);
        return;
      }

      const fallbackLesson = getLessonsForLanguage(
        this.curriculum,
        DEFAULT_LANGUAGE_ID,
      )[0];
      if (!fallbackLesson) {
        this.currentLesson = null;
        this.currentMarkdown = "";
        this.renderEmptyState();
        document.title = "등록된 교안 없음 · BAM.dev";
        return;
      }
      window.history.replaceState(
        null,
        "",
        buildLessonHash(fallbackLesson.languageId, fallbackLesson.slug),
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
        await this.openReviewRoute(reviewRoute.languageId);
        return;
      }

      const fallbackLesson = getLessonsForLanguage(
        this.curriculum,
        DEFAULT_LANGUAGE_ID,
      )[0];
      if (!fallbackLesson) {
        this.currentLesson = null;
        this.currentMarkdown = "";
        this.renderEmptyState();
        document.title = "등록된 교안 없음 · BAM.dev";
        return;
      }
      window.history.replaceState(
        null,
        "",
        buildLessonHash(fallbackLesson.languageId, fallbackLesson.slug),
      );
      await this.openLessonRoute();
      return;
    }

    await this.openLessonRoute({ useLastLesson });
  }

  async openLessonRoute({ useLastLesson = false } = {}) {
    const sequence = ++this.renderSequence;
    const progress = this.progressRepository.getProgress();
    const lesson = resolveLessonRoute(
      this.curriculum,
      window.location.hash,
      useLastLesson ? progress.lastLessonId : null,
    );

    if (!lesson) {
      this.currentLesson = null;
      this.currentMarkdown = "";
      this.renderEmptyState();
      document.title = "등록된 교안 없음 · BAM.dev";
      return;
    }

    this.currentView = "lesson";
    this.codeQuestState = null;
    this.codingTestState = null;
    this.currentLesson = null;
    this.currentMarkdown = "";
    const canonicalHash = buildLessonHash(lesson.languageId, lesson.slug);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

    this.menuOpen = false;
    this.syncMenuState();
    this.renderLoadingLesson(lesson);
    try {
      const markdown = await loadLessonMarkdown(lesson);
      if (sequence !== this.renderSequence) return;
      this.currentLesson = lesson;
      this.currentMarkdown = markdown;
      this.menuOpen = false;
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
    const sequence = ++this.renderSequence;
    const language = getLanguage(this.curriculum, languageId);
    if (!language) {
      await this.openLessonRoute();
      return;
    }

    this.currentView = "review";
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.quizCollection = null;
    this.quizSession = null;
    this.codeQuestState = null;
    this.codingTestState = null;
    this.menuOpen = false;
    this.syncMenuState();

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
    const sequence = ++this.renderSequence;
    const language = getLanguage(this.curriculum, languageId);
    const lessons = getLessonsForLanguage(this.curriculum, languageId);
    if (!language || language.status !== "available" || lessons.length === 0) {
      await this.openLessonRoute();
      return;
    }

    this.currentView = "quest";
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.quizCollection = null;
    this.quizSession = null;
    this.codeQuestState = null;
    this.codingTestState = null;
    this.menuOpen = false;
    this.syncMenuState();
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
    ++this.renderSequence;
    if (!this.codingTestCollection) {
      this.renderFatalError(new Error("등록된 코딩테스트가 없습니다."));
      return;
    }

    this.currentView = "coding-test-list";
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.quizCollection = null;
    this.quizSession = null;
    this.codeQuestState = null;
    this.codingTestState = null;
    this.menuOpen = false;
    this.syncMenuState();

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
    const sequence = ++this.renderSequence;
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

    this.currentView = "coding-test";
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.quizCollection = null;
    this.quizSession = null;
    this.codeQuestState = null;
    this.codingTestState = null;
    this.menuOpen = false;
    this.syncMenuState();
    this.root.innerHTML = renderCodingTestLoadingView({ title: language.name });

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

  handleClick(event) {
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
      const code = copyButton.closest(".code-card")?.querySelector("code")?.textContent ?? "";
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
    this.scheduleQuestDraftSave(state);
    this.updateCodeQuestDraftFeedback();
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
        state.draftStatus === "failed" || state.draftStatus === "memory",
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

  clearScheduledQuestDraftSave() {
    if (this.questDraftSaveTimer === null) return;
    this.clearQuestDraftSaveTimer(this.questDraftSaveTimer);
    this.questDraftSaveTimer = null;
  }

  scheduleQuestDraftSave(state) {
    const languageId = this.codeQuestCollection?.languageId;
    if (!languageId) {
      state.draftStatus = "failed";
      state.uiError = "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      return;
    }

    const previous = this.pendingQuestDraftSave;
    if (
      previous &&
      (previous.questId !== state.quest.id || previous.languageId !== languageId)
    ) {
      this.flushPendingQuestDraftSave();
    } else {
      this.clearScheduledQuestDraftSave();
    }

    const pending = {
      owner: state,
      questId: state.quest.id,
      languageId,
      source: state.source,
    };
    this.pendingQuestDraftSave = pending;
    this.questDraftSaveTimer = this.setQuestDraftSaveTimer(() => {
      if (this.pendingQuestDraftSave !== pending) return;
      this.pendingQuestDraftSave = null;
      this.questDraftSaveTimer = null;
      this.persistQuestDraft(pending);
    });
  }

  flushPendingQuestDraftSave() {
    const pending = this.pendingQuestDraftSave;
    if (!pending) return false;

    this.clearScheduledQuestDraftSave();
    this.pendingQuestDraftSave = null;
    this.persistQuestDraft(pending);
    return true;
  }

  cancelPendingQuestDraftSave() {
    this.clearScheduledQuestDraftSave();
    this.pendingQuestDraftSave = null;
  }

  persistQuestDraft(pending) {
    const isCurrentOwner =
      this.currentView === "quest" &&
      this.codeQuestState === pending.owner &&
      pending.owner.quest.id === pending.questId;

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
        state.draftStatus === "failed" || state.draftStatus === "memory",
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

  clearScheduledCodingTestDraftSave() {
    if (this.codingTestDraftSaveTimer === null) return;
    this.clearCodingTestDraftSaveTimer(this.codingTestDraftSaveTimer);
    this.codingTestDraftSaveTimer = null;
  }

  scheduleCodingTestDraftSave(state) {
    const languageId = this.codingTestCollection?.languageId;
    if (!languageId) {
      state.draftStatus = "failed";
      state.uiError = "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.";
      return;
    }

    const previous = this.pendingCodingTestDraftSave;
    if (previous && previous.problemId !== state.problem.id) {
      this.flushPendingCodingTestDraftSave();
    } else {
      this.clearScheduledCodingTestDraftSave();
    }

    const pending = {
      owner: state,
      problemId: state.problem.id,
      problemRevision: state.problem.revision,
      languageId,
      source: state.source,
    };
    this.pendingCodingTestDraftSave = pending;
    this.codingTestDraftSaveTimer = this.setCodingTestDraftSaveTimer(() => {
      if (this.pendingCodingTestDraftSave !== pending) return;
      this.pendingCodingTestDraftSave = null;
      this.codingTestDraftSaveTimer = null;
      this.persistCodingTestDraft(pending);
    });
  }

  flushPendingCodingTestDraftSave() {
    const pending = this.pendingCodingTestDraftSave;
    if (!pending) return false;
    this.clearScheduledCodingTestDraftSave();
    this.pendingCodingTestDraftSave = null;
    this.persistCodingTestDraft(pending);
    return true;
  }

  cancelPendingCodingTestDraftSave() {
    this.clearScheduledCodingTestDraftSave();
    this.pendingCodingTestDraftSave = null;
  }

  persistCodingTestDraft(pending) {
    const isCurrentOwner =
      this.currentView === "coding-test" &&
      this.codingTestState === pending.owner &&
      pending.owner.problem.id === pending.problemId;

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
    if (this.activeCodingTestExecution || this.activeQuestExecution) {
      state.uiError = "이전 코드 실행을 정리하고 있습니다. 잠시 후 다시 시도해 주세요.";
      this.renderCodingTest();
      return;
    }

    this.codingTestRequestSequence += 1;
    const requestId = `coding-test-${mode}-${Date.now().toString(36)}-${this.codingTestRequestSequence.toString(36)}`;
    const execution = {
      requestId,
      problemId: state.problem.id,
      mode,
      controller: new AbortController(),
      submissionRecorded: false,
    };
    this.activeCodingTestExecution = execution;
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
        { signal: execution.controller.signal },
      );
    } catch (error) {
      if (this.activeCodingTestExecution === execution) {
        this.activeCodingTestExecution = null;
      }
      if (this.codingTestState !== state || this.currentView !== "coding-test") return;
      state.isRunning = false;
      state.cancelRequested = false;
      state.uiError =
        error instanceof Error ? error.message : "코드 실행 결과를 받지 못했습니다.";
      this.renderCodingTest();
      return;
    }

    let reportPersistenceStatus = null;
    if (mode === "submit" && !execution.submissionRecorded) {
      execution.submissionRecorded = true;
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

    if (this.activeCodingTestExecution === execution) {
      this.activeCodingTestExecution = null;
    }
    if (
      this.codingTestState !== state ||
      this.currentView !== "coding-test" ||
      state.problem.id !== execution.problemId
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
    const execution = this.activeCodingTestExecution;
    if (!state?.isRunning || !execution || execution.controller.signal.aborted) return;
    state.cancelRequested = true;
    button.disabled = true;
    button.textContent = "취소하는 중…";
    execution.controller.abort();
  }

  async runCurrentCodeQuest() {
    const state = this.codeQuestState;
    if (!state || this.currentView !== "quest" || state.isRunning) return;

    this.flushPendingQuestDraftSave();

    if (this.activeQuestExecution || this.activeCodingTestExecution) {
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

    const execution = {
      requestId: request.requestId,
      questId: state.quest.id,
      controller: new AbortController(),
      recordAttempted: false,
    };
    this.activeQuestExecution = execution;
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
        signal: execution.controller.signal,
      });
    } catch (error) {
      if (this.activeQuestExecution === execution) this.activeQuestExecution = null;
      if (this.codeQuestState !== state || this.currentView !== "quest") return;
      state.isRunning = false;
      state.cancelRequested = false;
      state.uiError =
        error instanceof Error ? error.message : "코드 실행 결과를 받지 못했습니다.";
      this.renderCodeQuest();
      return;
    }

    let reportPersistenceStatus = "saved";
    if (!execution.recordAttempted) {
      execution.recordAttempted = true;
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
    }

    if (this.activeQuestExecution === execution) this.activeQuestExecution = null;
    if (
      this.codeQuestState !== state ||
      this.currentView !== "quest" ||
      state.quest.id !== execution.questId
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
    const execution = this.activeQuestExecution;
    if (!state?.isRunning || !execution || execution.controller.signal.aborted) return;

    state.cancelRequested = true;
    button.disabled = true;
    button.textContent = "취소하는 중…";
    execution.controller.abort();
  }

  abortQuestExecutionForNavigation() {
    const execution = this.activeQuestExecution;
    if (execution && !execution.controller.signal.aborted) execution.controller.abort();
  }

  abortCodingTestExecutionForNavigation() {
    const execution = this.activeCodingTestExecution;
    if (execution && !execution.controller.signal.aborted) execution.controller.abort();
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

    const language = getLanguage(this.curriculum, lesson.languageId);
    const lessons = getLessonsForLanguage(this.curriculum, lesson.languageId);
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
    const completedCodeQuestCount = codeQuests.filter((item) =>
      progress.completedQuestIds.includes(item.id),
    ).length;
    const codingTestProblems =
      language.id === this.codingTestCollection?.languageId
        ? getCodingTestProblemsInOrder(this.codingTestCollection)
        : [];
    const solvedCodingTestProblemIds = this.getSolvedCodingTestProblemIds(progress);

    this.root.innerHTML = `
      <div class="app-shell">
        <header class="mobile-header">
          <a class="mobile-brand" href="${buildLessonHash(lessons[0].languageId, lessons[0].slug)}" aria-label="BAM.dev 학습 홈">
            <span class="brand-mark brand-mark--small" aria-hidden="true">B</span>
            <span>BAM.dev</span>
          </a>
          <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${this.menuOpen}">
            <span aria-hidden="true">☰</span><span class="sr-only">교안 메뉴 열기</span>
          </button>
        </header>

        <aside class="sidebar${this.menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
          <div class="sidebar-brand">
            <a href="${buildLessonHash(lessons[0].languageId, lessons[0].slug)}" aria-label="BAM.dev 학습 홈">
              <span class="brand-mark" aria-hidden="true">B</span>
              <span><strong>BAM.dev</strong><small>배우고, 만들고, 성장하기</small></span>
            </a>
            <button class="icon-button sidebar-close" type="button" data-close-menu>
              <span aria-hidden="true">×</span><span class="sr-only">교안 메뉴 닫기</span>
            </button>
          </div>

          <div class="course-heading">
            <div class="course-title-row">
              <span class="language-badge language-badge--${escapeHtml(language.accent)}">${escapeHtml(language.shortName)}</span>
              <div><small>현재 코스</small><strong>${escapeHtml(language.name)}</strong></div>
            </div>
            <div class="sidebar-progress-label"><span>${completedCount}/${lessons.length} 완료</span><span>${progressPercent}%</span></div>
            <div class="progress-track" role="progressbar" aria-label="${escapeHtml(language.name)} 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
              <span style="width: ${progressPercent}%"></span>
            </div>
          </div>

          ${renderLanguageNavigation({
            curriculum: this.curriculum,
            currentLanguageId: language.id,
          })}

          <nav class="lesson-nav" aria-label="${escapeHtml(language.name)} 교안">
            <p class="nav-label">교안</p>
            <ol>
              ${lessons.map((item) => this.renderLessonLink(item, lesson.id, completedIds)).join("")}
            </ol>
          </nav>

          ${renderReviewNavigationLink({
            href: buildReviewHash(language.id),
            isCurrent: false,
          })}

          ${
            firstCodeQuest
              ? renderCodeQuestNavigationLink({
                  href: buildQuestHash(language.id, firstCodeQuest.slug),
                  isCurrent: false,
                  completedCount: completedCodeQuestCount,
                  totalCount: codeQuests.length,
                })
              : ""
          }
          ${
            codingTestProblems.length > 0
              ? renderCodingTestNavigationLink({
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                })
              : ""
          }

        </aside>

        <div class="sidebar-backdrop${this.menuOpen ? " is-visible" : ""}" data-close-menu aria-hidden="true"></div>

        <main class="main-area" id="lesson-content" tabindex="-1">
          <div class="lesson-container">
            <header class="lesson-hero">
              <div class="eyebrow">
                <span>${escapeHtml(language.name)}</span>
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
        <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
    this.syncMenuState();
  }

  renderQuiz() {
    if (!this.curriculum || !this.quizCollection || !this.quizSession) return;

    const language = getLanguage(this.curriculum, this.quizCollection.languageId);
    const lessons = getLessonsForLanguage(this.curriculum, this.quizCollection.languageId);
    if (!language || lessons.length === 0) return;

    const progress = this.progressRepository.getProgress();
    const completedIds = new Set(progress.completedLessonIds);
    const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
    const progressPercent = Math.round((completedCount / lessons.length) * 100);
    const firstLessonHref = buildLessonHash(lessons[0].languageId, lessons[0].slug);
    const languageQuestCollection =
      this.codeQuestCollections.get(language.id) ?? null;
    const codeQuests = getCodeQuestsInOrder(languageQuestCollection);
    const firstCodeQuest = codeQuests[0] ?? null;
    const completedCodeQuestCount = codeQuests.filter((item) =>
      progress.completedQuestIds.includes(item.id),
    ).length;
    const codingTestProblems =
      language.id === this.codingTestCollection?.languageId
        ? getCodingTestProblemsInOrder(this.codingTestCollection)
        : [];
    const solvedCodingTestProblemIds = this.getSolvedCodingTestProblemIds(progress);
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

    this.root.innerHTML = `
      <div class="app-shell">
        <header class="mobile-header">
          <a class="mobile-brand" href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
            <span class="brand-mark brand-mark--small" aria-hidden="true">B</span>
            <span>BAM.dev</span>
          </a>
          <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${this.menuOpen}">
            <span aria-hidden="true">☰</span><span class="sr-only">교안 메뉴 열기</span>
          </button>
        </header>

        <aside class="sidebar${this.menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
          <div class="sidebar-brand">
            <a href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
              <span class="brand-mark" aria-hidden="true">B</span>
              <span><strong>BAM.dev</strong><small>배우고, 만들고, 성장하기</small></span>
            </a>
            <button class="icon-button sidebar-close" type="button" data-close-menu>
              <span aria-hidden="true">×</span><span class="sr-only">교안 메뉴 닫기</span>
            </button>
          </div>

          <div class="course-heading">
            <div class="course-title-row">
              <span class="language-badge language-badge--${escapeHtml(language.accent)}">${escapeHtml(language.shortName)}</span>
              <div><small>현재 코스</small><strong>${escapeHtml(language.name)}</strong></div>
            </div>
            <div class="sidebar-progress-label"><span>${completedCount}/${lessons.length} 완료</span><span>${progressPercent}%</span></div>
            <div class="progress-track" role="progressbar" aria-label="${escapeHtml(language.name)} 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
              <span style="width: ${progressPercent}%"></span>
            </div>
          </div>

          ${renderLanguageNavigation({
            curriculum: this.curriculum,
            currentLanguageId: language.id,
          })}

          <nav class="lesson-nav" aria-label="${escapeHtml(language.name)} 교안">
            <p class="nav-label">교안</p>
            <ol>
              ${lessons.map((lesson) => this.renderLessonLink(lesson, null, completedIds)).join("")}
            </ol>
          </nav>

          ${renderReviewNavigationLink({
            href: buildReviewHash(language.id),
            isCurrent: true,
          })}
          ${
            firstCodeQuest
              ? renderCodeQuestNavigationLink({
                  href: buildQuestHash(language.id, firstCodeQuest.slug),
                  isCurrent: false,
                  completedCount: completedCodeQuestCount,
                  totalCount: codeQuests.length,
                })
              : ""
          }
          ${
            codingTestProblems.length > 0
              ? renderCodingTestNavigationLink({
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                })
              : ""
          }
        </aside>

        <div class="sidebar-backdrop${this.menuOpen ? " is-visible" : ""}" data-close-menu aria-hidden="true"></div>
        ${mainContent}
        <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
    this.syncMenuState();
  }

  renderCodeQuest() {
    const state = this.codeQuestState;
    const collection = this.codeQuestCollection;
    if (!this.curriculum || !collection || !state) return;

    const language = getLanguage(this.curriculum, collection.languageId);
    const lessons = getLessonsForLanguage(this.curriculum, collection.languageId);
    if (!language || lessons.length === 0) return;

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
    const completedQuestIds = new Set(progress.completedQuestIds);
    const completedQuestCount = quests.filter((quest) =>
      completedQuestIds.has(quest.id),
    ).length;
    const codingTestProblems =
      language.id === this.codingTestCollection?.languageId
        ? getCodingTestProblemsInOrder(this.codingTestCollection)
        : [];
    const solvedCodingTestProblemIds =
      codingTestProblems.length > 0
        ? this.getSolvedCodingTestProblemIds(progress)
        : new Set();
    const firstLessonHref = buildLessonHash(lessons[0].languageId, lessons[0].slug);
    const currentQuestHref = buildQuestHash(language.id, state.quest.slug);
    const mainContent = renderCodeQuestView({
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

    this.root.innerHTML = `
      <div class="app-shell">
        <header class="mobile-header">
          <a class="mobile-brand" href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
            <span class="brand-mark brand-mark--small" aria-hidden="true">B</span>
            <span>BAM.dev</span>
          </a>
          <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${this.menuOpen}">
            <span aria-hidden="true">☰</span><span class="sr-only">교안 메뉴 열기</span>
          </button>
        </header>

        <aside class="sidebar${this.menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
          <div class="sidebar-brand">
            <a href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
              <span class="brand-mark" aria-hidden="true">B</span>
              <span><strong>BAM.dev</strong><small>배우고, 만들고, 성장하기</small></span>
            </a>
            <button class="icon-button sidebar-close" type="button" data-close-menu>
              <span aria-hidden="true">×</span><span class="sr-only">교안 메뉴 닫기</span>
            </button>
          </div>

          <div class="course-heading">
            <div class="course-title-row">
              <span class="language-badge language-badge--${escapeHtml(language.accent)}">${escapeHtml(language.shortName)}</span>
              <div><small>현재 코스</small><strong>${escapeHtml(language.name)}</strong></div>
            </div>
            <div class="sidebar-progress-label"><span>${completedLessonCount}/${lessons.length} 완료</span><span>${lessonProgressPercent}%</span></div>
            <div class="progress-track" role="progressbar" aria-label="${escapeHtml(language.name)} 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lessonProgressPercent}">
              <span style="width: ${lessonProgressPercent}%"></span>
            </div>
          </div>

          ${renderLanguageNavigation({
            curriculum: this.curriculum,
            currentLanguageId: language.id,
          })}

          <nav class="lesson-nav" aria-label="${escapeHtml(language.name)} 교안">
            <p class="nav-label">교안</p>
            <ol>
              ${lessons.map((lesson) => this.renderLessonLink(lesson, null, completedLessonIds)).join("")}
            </ol>
          </nav>

          ${renderReviewNavigationLink({
            href: buildReviewHash(language.id),
            isCurrent: false,
          })}
          ${renderCodeQuestNavigationLink({
            href: currentQuestHref,
            isCurrent: true,
            completedCount: completedQuestCount,
            totalCount: quests.length,
          })}
          ${
            codingTestProblems.length > 0
              ? renderCodingTestNavigationLink({
                  href: buildCodingTestListHash(),
                  isCurrent: false,
                  solvedCount: solvedCodingTestProblemIds.size,
                  totalCount: codingTestProblems.length,
                })
              : ""
          }
        </aside>

        <div class="sidebar-backdrop${this.menuOpen ? " is-visible" : ""}" data-close-menu aria-hidden="true"></div>
        ${mainContent}
        <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
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

  renderCodingTestShell(
    mainContent,
    progressSnapshot = null,
    solvedProblemIdsSnapshot = null,
  ) {
    const collection = this.codingTestCollection;
    if (!this.curriculum || !collection) return;
    const language = getLanguage(this.curriculum, collection.languageId);
    const lessons = getLessonsForLanguage(this.curriculum, collection.languageId);
    if (!language || lessons.length === 0) return;

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
    const completedQuestCount = quests.filter((quest) =>
      progress.completedQuestIds.includes(quest.id),
    ).length;
    const problems = getCodingTestProblemsInOrder(collection);
    const firstLessonHref = buildLessonHash(lessons[0].languageId, lessons[0].slug);

    this.root.innerHTML = `
      <div class="app-shell">
        <header class="mobile-header">
          <a class="mobile-brand" href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
            <span class="brand-mark brand-mark--small" aria-hidden="true">B</span>
            <span>BAM.dev</span>
          </a>
          <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${this.menuOpen}">
            <span aria-hidden="true">☰</span><span class="sr-only">교안 메뉴 열기</span>
          </button>
        </header>

        <aside class="sidebar${this.menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
          <div class="sidebar-brand">
            <a href="${firstLessonHref}" aria-label="BAM.dev 학습 홈">
              <span class="brand-mark" aria-hidden="true">B</span>
              <span><strong>BAM.dev</strong><small>배우고, 만들고, 성장하기</small></span>
            </a>
            <button class="icon-button sidebar-close" type="button" data-close-menu>
              <span aria-hidden="true">×</span><span class="sr-only">교안 메뉴 닫기</span>
            </button>
          </div>

          <div class="course-heading">
            <div class="course-title-row">
              <span class="language-badge language-badge--${escapeHtml(language.accent)}">${escapeHtml(language.shortName)}</span>
              <div><small>현재 코스</small><strong>${escapeHtml(language.name)}</strong></div>
            </div>
            <div class="sidebar-progress-label"><span>${completedLessonCount}/${lessons.length} 완료</span><span>${lessonProgressPercent}%</span></div>
            <div class="progress-track" role="progressbar" aria-label="${escapeHtml(language.name)} 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lessonProgressPercent}">
              <span style="width: ${lessonProgressPercent}%"></span>
            </div>
          </div>

          ${renderLanguageNavigation({
            curriculum: this.curriculum,
            currentLanguageId: language.id,
          })}

          <nav class="lesson-nav" aria-label="${escapeHtml(language.name)} 교안">
            <p class="nav-label">교안</p>
            <ol>
              ${lessons.map((lesson) => this.renderLessonLink(lesson, null, completedLessonIds)).join("")}
            </ol>
          </nav>

          ${renderReviewNavigationLink({
            href: buildReviewHash(language.id),
            isCurrent: false,
          })}
          ${
            quests[0]
              ? renderCodeQuestNavigationLink({
                  href: buildQuestHash(language.id, quests[0].slug),
                  isCurrent: false,
                  completedCount: completedQuestCount,
                  totalCount: quests.length,
                })
              : ""
          }
          ${renderCodingTestNavigationLink({
            href: buildCodingTestListHash(),
            isCurrent: true,
            solvedCount: solvedProblemIds.size,
            totalCount: problems.length,
          })}
        </aside>

        <div class="sidebar-backdrop${this.menuOpen ? " is-visible" : ""}" data-close-menu aria-hidden="true"></div>
        ${mainContent}
        <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
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
        <a class="lesson-link${isCurrent ? " is-current" : ""}" href="${buildLessonHash(lesson.languageId, lesson.slug)}"${isCurrent ? ' aria-current="page"' : ""}>
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
      <a class="pagination-link pagination-link--${direction}" href="${buildLessonHash(lesson.languageId, lesson.slug)}">
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
