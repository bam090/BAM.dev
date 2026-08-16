import {
  getLanguage,
  getLessonsForLanguage,
  loadCurriculum,
  loadLessonMarkdown,
} from "./core/content.js";
import {
  buildLessonHash,
  getAdjacentLessons,
  resolveLessonRoute,
} from "./core/navigation.js";
import {
  createBrowserStorage,
  LocalStorageProgressRepository,
  PROGRESS_STORAGE_KEY,
} from "./repositories/progress-repository.js";
import { escapeHtml, renderMarkdown } from "./ui/markdown.js";

const appRoot = document.querySelector("#app");

class BamLearningApp {
  constructor(root) {
    this.root = root;
    this.curriculum = null;
    this.currentLesson = null;
    this.currentMarkdown = "";
    this.renderSequence = 0;
    this.hasRenderedLesson = false;
    this.menuOpen = false;
    this.mobileMedia = window.matchMedia("(max-width: 820px)");
    this.progressRepository = new LocalStorageProgressRepository(createBrowserStorage(window));
  }

  async start() {
    this.bindGlobalEvents();
    try {
      this.curriculum = await loadCurriculum();
      await this.openRoute({ useLastLesson: true });
    } catch (error) {
      this.renderFatalError(error);
    }
  }

  bindGlobalEvents() {
    window.addEventListener("hashchange", () => this.openRoute());
    window.addEventListener("storage", (event) => {
      if (event.key === PROGRESS_STORAGE_KEY && this.currentLesson) {
        this.renderLesson();
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
      }
    });

    this.root.addEventListener("click", (event) => this.handleClick(event));
  }

  async openRoute({ useLastLesson = false } = {}) {
    if (!this.curriculum) return;
    const sequence = ++this.renderSequence;
    const progress = this.progressRepository.getProgress();
    const lesson = resolveLessonRoute(
      this.curriculum,
      window.location.hash,
      useLastLesson ? progress.lastLessonId : null,
    );

    if (!lesson) {
      this.renderFatalError(new Error("표시할 교안이 없습니다."));
      return;
    }

    const canonicalHash = buildLessonHash(lesson.languageId, lesson.slug);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, "", canonicalHash);
    }

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
      if (this.hasRenderedLesson) {
        document.querySelector("#lesson-content")?.focus({ preventScroll: true });
        this.announce(`${lesson.title} 단원으로 이동했습니다.`);
      }
      this.hasRenderedLesson = true;
    } catch (error) {
      if (sequence === this.renderSequence) this.renderFatalError(error);
    }
  }

  handleClick(event) {
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

    if (event.target.closest(".lesson-link")) {
      this.menuOpen = false;
      this.syncMenuState();
    }
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
      <div class="loading-page" role="status">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p><strong>${escapeHtml(lesson.title)}</strong> 교안을 불러오고 있습니다…</p>
      </div>
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
            <div class="progress-track" role="progressbar" aria-label="JavaScript 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
              <span style="width: ${progressPercent}%"></span>
            </div>
          </div>

          <nav class="lesson-nav" aria-label="JavaScript 교안">
            <p class="nav-label">교안</p>
            <ol>
              ${lessons.map((item) => this.renderLessonLink(item, lesson.id, completedIds)).join("")}
            </ol>
          </nav>

          <div class="coming-soon" aria-label="다음 개발 단계">
            <p class="nav-label">다음 단계</p>
            <span><i aria-hidden="true">2</i> 객관식 복습 <small>준비 중</small></span>
            <span><i aria-hidden="true">3</i> Code Quest <small>준비 중</small></span>
          </div>
        </aside>

        <button class="sidebar-backdrop${this.menuOpen ? " is-visible" : ""}" type="button" data-close-menu aria-label="교안 메뉴 닫기" tabindex="${this.menuOpen ? "0" : "-1"}"></button>

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

  syncMenuState() {
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    const toggle = document.querySelector("[data-toggle-menu]");
    const mainArea = document.querySelector(".main-area");
    const mobileHeader = document.querySelector(".mobile-header");
    const isMobile = this.mobileMedia.matches;
    sidebar?.classList.toggle("is-open", this.menuOpen);
    backdrop?.classList.toggle("is-visible", this.menuOpen);
    sidebar?.toggleAttribute("inert", isMobile && !this.menuOpen);
    mainArea?.toggleAttribute("inert", isMobile && this.menuOpen);
    mobileHeader?.toggleAttribute("inert", isMobile && this.menuOpen);
    if (backdrop) backdrop.tabIndex = this.menuOpen ? 0 : -1;
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

  renderFatalError(error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    this.root.innerHTML = `
      <main class="error-page" role="alert">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p class="eyebrow">콘텐츠를 열지 못했습니다</p>
        <h1>학습 페이지를 준비하는 중 문제가 생겼습니다.</h1>
        <p>${escapeHtml(message)}</p>
        <button class="button button--primary" type="button" onclick="window.location.reload()">다시 시도</button>
      </main>
    `;
  }
}

new BamLearningApp(appRoot).start();
