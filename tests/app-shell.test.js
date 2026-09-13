import assert from "node:assert/strict";
import test from "node:test";
import { renderAppShell, renderLearningShell } from "../src/ui/app-shell.js";

function renderShell(overrides = {}) {
  return renderAppShell({
    homeHref: "#/learn/javascript/javascript-and-runtime",
    menuOpen: true,
    language: {
      name: "JavaScript",
      shortName: "JS",
      accent: "yellow",
    },
    lessonProgress: {
      completedCount: 2,
      totalCount: 5,
      percent: 40,
    },
    languageNavigation:
      '<nav class="language-nav" aria-label="언어 선택">언어 링크</nav>',
    lessonNavigationItems:
      '<li><a class="lesson-link" href="#/learn/javascript/variables">변수</a></li>',
    featureNavigation: [
      {
        kind: "review",
        options: { href: "#/review/javascript", isCurrent: false },
      },
      {
        kind: "code-quest",
        options: {
          href: "#/quest/javascript/variables",
          isCurrent: true,
          completedCount: 1,
          totalCount: 3,
        },
      },
      {
        kind: "coding-test",
        options: {
          href: "#/coding-tests",
          isCurrent: false,
          solvedCount: 2,
          totalCount: 6,
        },
      },
    ],
    mainContent: '<main id="lesson-content" tabindex="-1">본문</main>',
    ...overrides,
  });
}

test("브랜드는 별도 B 배지 없이 BAM.dev 한 이름을 홈 링크로 제공한다", () => {
  const learning = renderLearningShell({ current: "learn" });
  const homeLink = learning.match(/<a\b[^>]*href="#\/"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
  assert.match(homeLink, /aria-label="BAM.dev 홈"/);
  assert.match(homeLink, /BAM\.dev/);
  assert.equal((learning.match(/aria-label="BAM.dev 홈"/g) ?? []).length, 1);
  assert.match(learning, /href="#\/"[^>]*>홈<\/a>/);
  assert.match(learning, /href="#\/learn"[^>]*>학습문서<\/a>/);
  assert.match(learning, /href="#\/review"[^>]*>객관식 문제<\/a>/);
  assert.match(learning, /<footer\b[^>]*>[\s\S]*?BAM\.dev · 개발자로 성장하는 나의 공간[\s\S]*?<\/footer>/);
  assert.match(learning, /data-theme-choice="light"/);
  assert.match(learning, /data-theme-choice="dark"/);
  assert.doesNotMatch(learning, /디자인 시안|표본 1개|이 화면에서만 유지/);
  assert.doesNotMatch(learning, /brand-mark|>B<\/span>/);
  assert.doesNotMatch(renderShell(), /brand-mark|>B<\/span>/);
});

test("공통 앱 셸은 모바일 메뉴·코스 진도·본문·announcer 계약을 유지한다", () => {
  const html = renderShell();

  assert.equal((html.match(/class="app-shell"/g) ?? []).length, 1);
  assert.match(html, /class="mobile-header"/);
  assert.match(html, /목차 메뉴 열기/);
  assert.match(html, /목차 메뉴 닫기/);
  assert.doesNotMatch(html, /교안 메뉴/);
  assert.match(html, /data-toggle-menu aria-controls="course-sidebar" aria-expanded="true"/);
  assert.match(html, /class="sidebar is-open" id="course-sidebar"/);
  assert.match(html, /2\/5 완료/);
  assert.match(html, /aria-label="JavaScript 학습 진도"/);
  assert.match(html, /<nav class="lesson-nav" aria-label="JavaScript 목차">/);
  assert.match(html, /<p class="nav-label">목차<\/p>/);
  assert.match(html, /aria-valuenow="40"/);
  assert.match(html, /class="sidebar-backdrop is-visible" data-close-menu/);
  assert.match(html, /<main id="lesson-content" tabindex="-1">본문<\/main>/);
  assert.match(html, /class="announcer sr-only" aria-live="polite" aria-atomic="true"/);
});

test("기능 내비게이션 DTO는 순서와 빈 슬롯을 보존하며 Web Project를 확장할 수 있다", () => {
  const html = renderShell({
    featureNavigation: [
      {
        kind: "review",
        options: { href: "#/review/javascript", isCurrent: false },
      },
      { kind: "code-quest", options: null },
      {
        kind: "coding-test",
        options: {
          href: "#/coding-tests",
          isCurrent: false,
          solvedCount: 2,
          totalCount: 6,
        },
      },
      {
        kind: "web-project",
        options: {
          href: "#/web-projects",
          isCurrent: false,
          submittedCount: 1,
          totalCount: 2,
        },
      },
      { kind: "unknown", content: '<script data-feature="unsafe"></script>' },
    ],
  });

  const reviewIndex = html.indexOf('class="review-nav"');
  const codingTestIndex = html.indexOf('class="coding-test-nav"');
  const webProjectIndex = html.indexOf('class="web-project-nav"');

  assert.ok(reviewIndex >= 0);
  assert.ok(codingTestIndex > reviewIndex);
  assert.ok(webProjectIndex > codingTestIndex);
  assert.doesNotMatch(html, /class="quest-nav"/);
  assert.doesNotMatch(html, /data-feature="unsafe"/);
});

test("공통 셸은 표시 문자열과 퍼센트를 안전한 값으로 정규화한다", () => {
  const html = renderShell({
    homeHref: '#/learn/javascript/lesson" data-injected="true',
    language: {
      name: "JavaScript <script>",
      shortName: "<JS>",
      accent: 'yellow" onclick="bad()',
    },
    lessonProgress: {
      completedCount: -1,
      totalCount: 3,
      percent: 170,
    },
  });

  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /onclick="bad\(\)"/);
  assert.match(html, /href="#\/learn\/javascript\/lesson&quot; data-injected=&quot;true"/);
  assert.match(html, /0\/3 완료/);
  assert.match(html, /aria-valuenow="100"/);
});
