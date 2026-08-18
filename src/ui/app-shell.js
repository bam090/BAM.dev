import { escapeHtml } from "./markdown.js";
import { renderReviewNavigationLink } from "./quiz-view.js";
import { renderCodeQuestNavigationLink } from "./code-quest-view.js";
import { renderCodingTestNavigationLink } from "./coding-test-view.js";

const FEATURE_NAVIGATION_RENDERERS = Object.freeze({
  review: renderReviewNavigationLink,
  "code-quest": renderCodeQuestNavigationLink,
  "coding-test": renderCodingTestNavigationLink,
});

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
      return typeof feature?.content === "string" ? feature.content : "";
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
          <span class="brand-mark brand-mark--small" aria-hidden="true">B</span>
          <span>BAM.dev</span>
        </a>
        <button class="icon-button" type="button" data-toggle-menu aria-controls="course-sidebar" aria-expanded="${Boolean(menuOpen)}">
          <span aria-hidden="true">☰</span><span class="sr-only">교안 메뉴 열기</span>
        </button>
      </header>

      <aside class="sidebar${menuOpen ? " is-open" : ""}" id="course-sidebar" aria-label="학습 내비게이션">
        <div class="sidebar-brand">
          <a href="${safeHomeHref}" aria-label="BAM.dev 학습 홈">
            <span class="brand-mark" aria-hidden="true">B</span>
            <span><strong>BAM.dev</strong><small>배우고, 만들고, 성장하기</small></span>
          </a>
          <button class="icon-button sidebar-close" type="button" data-close-menu>
            <span aria-hidden="true">×</span><span class="sr-only">교안 메뉴 닫기</span>
          </button>
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

        <nav class="lesson-nav" aria-label="${safeLanguageName} 교안">
          <p class="nav-label">교안</p>
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
