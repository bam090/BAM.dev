import { escapeHtml } from "./markdown.js";
import { renderReviewNavigationLink } from "./quiz-view.js";
import { renderCodeQuestNavigationLink } from "./code-quest-view.js";
import { renderCodingTestNavigationLink } from "./coding-test-view.js";
import { renderWebProjectNavigationLink } from "./web-project-view.js";
import { renderThemeControls } from "./theme.js";

const FEATURE_NAVIGATION_RENDERERS = Object.freeze({
  review: renderReviewNavigationLink,
  "code-quest": renderCodeQuestNavigationLink,
  "coding-test": renderCodingTestNavigationLink,
  "web-project": renderWebProjectNavigationLink,
});

export function renderLearningShell({ current = "home", mainContent = "", theme } = {}) {
  return `<div class="learning-shell">
    <header class="service-header">
      <a class="mobile-brand" href="#/" aria-label="BAM.dev 홈"><strong>BAM.dev</strong></a>
      <nav aria-label="서비스 선택">
        <a href="#/"${current === "home" ? ' aria-current="page"' : ""}>홈</a>
        <a href="#/learn"${current === "learn" ? ' aria-current="page"' : ""}>학습문서</a>
        <a href="#/review"${current === "review" ? ' aria-current="page"' : ""}>객관식 문제</a>
      </nav>
      ${renderThemeControls(theme)}
    </header>
    ${mainContent}
    <footer class="service-footer">BAM.dev · 개발자로 성장하는 나의 공간</footer>
    <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
  </div>`;
}

function normalizeCount(value) {
  return Number.isInteger(value) ? Math.max(0, value) : 0;
}

function normalizePercent(value) {
  return Number.isInteger(value) ? Math.min(100, Math.max(0, value)) : 0;
}

function renderFeatureNavigation(features) {
  if (!Array.isArray(features)) return "";
  return features
    .map((feature) => {
      const kind = typeof feature?.kind === "string" ? feature.kind : "";
      if (Object.hasOwn(FEATURE_NAVIGATION_RENDERERS, kind)) {
        if (feature.options === null) return "";
        return FEATURE_NAVIGATION_RENDERERS[kind](feature.options);
      }
      return "";
    })
    .filter(Boolean)
    .join("");
}

export function renderAppShell({
  homeHref = "#",
  menuOpen = false,
  language = {},
  lessonProgress = {},
  languageNavigation = "",
  lessonNavigationItems = "",
  featureNavigation = [],
  mainContent = "",
  theme,
} = {}) {
  const completedCount = normalizeCount(lessonProgress.completedCount);
  const totalCount = Math.max(
    completedCount,
    normalizeCount(lessonProgress.totalCount),
  );
  const progressPercent = normalizePercent(lessonProgress.percent);
  const safeHomeHref = escapeHtml(homeHref);
  const safeLanguageName = escapeHtml(language.name ?? "");

  return `
    <div class="app-shell">
      <header class="mobile-header">
        <a class="mobile-brand" href="${safeHomeHref}" aria-label="BAM.dev 학습 홈">
          <strong>BAM.dev</strong>
        </a>
        ${renderThemeControls(theme)}
        <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${Boolean(menuOpen)}">
          <span aria-hidden="true">☰</span><span class="sr-only">목차 메뉴 열기</span>
        </button>
      </header>

      <aside class="sidebar${menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
        <div class="sidebar-brand">
          <a href="${safeHomeHref}" aria-label="BAM.dev 학습 홈">
            <strong>BAM.dev</strong>
          </a>
          <button class="icon-button sidebar-close" type="button" data-close-menu>
            <span aria-hidden="true">×</span><span class="sr-only">목차 메뉴 닫기</span>
          </button>
        </div>

        <div class="sidebar-services">
          <nav aria-label="서비스 선택"><a href="#/">홈</a><a href="#/learn">학습문서</a><a href="#/review">객관식 문제</a></nav>
          ${renderThemeControls(theme)}
        </div>

        <div class="course-heading">
          <div class="course-title-row">
            <span class="language-badge language-badge--${escapeHtml(language.accent ?? "")}">${escapeHtml(language.shortName ?? "")}</span>
            <div><small>현재 코스</small><strong>${safeLanguageName}</strong></div>
          </div>
          <div class="sidebar-progress-label"><span>${completedCount}/${totalCount} 완료</span><span>${progressPercent}%</span></div>
          <div class="progress-track" role="progressbar" aria-label="${safeLanguageName} 학습 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
            <span style="width: ${progressPercent}%"></span>
          </div>
        </div>

        ${languageNavigation}

        <nav class="lesson-nav" aria-label="${safeLanguageName} 목차">
          <p class="nav-label">목차</p>
          <ol>
            ${lessonNavigationItems}
          </ol>
        </nav>

        ${renderFeatureNavigation(featureNavigation)}
      </aside>

      <div class="sidebar-backdrop${menuOpen ? " is-visible" : ""}" data-close-menu aria-hidden="true"></div>
      ${mainContent}
      <div class="announcer sr-only" aria-live="polite" aria-atomic="true"></div>
    </div>
  `;
}
