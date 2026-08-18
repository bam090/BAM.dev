import assert from "node:assert/strict";
import test from "node:test";
import { renderAppShell } from "../src/ui/app-shell.js";

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

test("공통 앱 셸은 모바일 메뉴·코스 진도·본문·announcer 계약을 유지한다", () => {
  const html = renderShell();

  assert.equal((html.match(/class="app-shell"/g) ?? []).length, 1);
  assert.match(html, /class="mobile-header"/);
  assert.match(html, /data-toggle-menu aria-controls="course-sidebar" aria-expanded="true"/);
  assert.match(html, /class="sidebar is-open" id="course-sidebar"/);
  assert.match(html, /2\/5 완료/);
  assert.match(html, /aria-label="JavaScript 학습 진도"/);
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
        content: '<nav data-feature="web-project">Web Project</nav>',
      },
    ],
  });

  const reviewIndex = html.indexOf('class="review-nav"');
  const codingTestIndex = html.indexOf('class="coding-test-nav"');
  const webProjectIndex = html.indexOf('data-feature="web-project"');

  assert.ok(reviewIndex >= 0);
  assert.ok(codingTestIndex > reviewIndex);
  assert.ok(webProjectIndex > codingTestIndex);
  assert.doesNotMatch(html, /class="quest-nav"/);
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
