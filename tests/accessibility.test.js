import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { renderAppShell } from "../src/ui/app-shell.js";
import { renderReviewNavigationLink } from "../src/ui/quiz-view.js";
import {
  renderCodeQuestNavigationLink,
  renderCodeQuestView,
} from "../src/ui/code-quest-view.js";
import { renderCodingTestNavigationLink } from "../src/ui/coding-test-view.js";

const tokenCss = await readFile(new URL("../styles/tokens.css", import.meta.url), "utf8");
const colorTokens = new Map([...tokenCss.matchAll(/(--[\w-]+):\s*([^;]+);/g)]
  .map(([, name, value]) => [name, value.trim()]));

// Resolve each light-dark branch independently; translucent layers need browser checks.
function tokenColor(name, theme = "light") {
  const value = colorTokens.get(name) ?? "";
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  if (reference) return tokenColor(reference[1], theme);
  const pair = value.match(/^light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)$/i);
  if (pair) return pair[theme === "dark" ? 2 : 1];
  assert.match(value, /^#[0-9a-f]{6}$/i, `${name}: 불투명 색상 토큰이 필요합니다.`);
  return value;
}

function relativeLuminance(hex) {
  const rgb = Array.isArray(hex) ? hex : hex.replace("#", "").match(/.{2}/g).map((channel) => Number.parseInt(channel, 16));
  const channels = rgb.map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test("승인된 밝게·어둡게 색상을 기존 semantic 역할에 연결한다", () => {
  const approved = {
    "--color-bg": ["#f7f6f2", "#17181b"],
    "--color-surface": ["#ffffff", "#202226"],
    "--color-surface-raised": ["#f0efeb", "#292b30"],
    "--color-code": ["#f0efeb", "#292b30"],
    "--color-text": ["#25262b", "#f0eee9"],
    "--color-text-muted": ["#62636b", "#b4b5bd"],
    "--color-primary": ["#6941b8", "#c3a9fb"],
    "--color-secondary": ["#eee8f8", "#352b46"],
    "--color-on-primary": ["#ffffff", "#221a30"],
    "--color-success-text": ["#216345", "#a5ddbc"],
    "--color-success-bg": ["#eaf4ed", "#22382c"],
    "--color-danger-text": ["#a14237", "#ffb3a8"],
    "--color-danger-bg": ["#faf0ec", "#422b29"],
  };
  for (const [token, [light, dark]] of Object.entries(approved)) {
    assert.equal(tokenColor(token, "light"), light, `${token}: 밝게`);
    assert.equal(tokenColor(token, "dark"), dark, `${token}: 어둡게`);
  }
  assert.match(tokenCss, /color-scheme:\s*light dark/);
  for (const theme of ["light", "dark"]) {
    assert.match(tokenCss, new RegExp(`:root\\[data-theme="${theme}"\\]\\s*\\{[^}]*color-scheme:\\s*${theme}`));
  }
});

test("실제 본문·버튼·링크 토큰은 AA 대비를, focus·의미 경계는 3:1을 충족한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const primaryRule = css.match(/\.button--primary\s*\{([^}]*)\}/)?.[1] ?? "";
  const hoverRule = css.match(/\.button--primary:hover\s*\{([^}]*)\}/)?.[1] ?? "";
  const focusRule = css.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(primaryRule, /background:\s*var\(--color-primary\)/);
  assert.match(primaryRule, /color:\s*var\(--color-on-primary\)/);
  assert.match(hoverRule, /background:\s*var\(--color-primary-hover\)/);
  assert.match(focusRule, /outline:\s*3px solid var\(--color-focus\)/);

  const pairs = [
    ["--color-on-primary", "--color-primary", 4.5],
    ["--color-on-primary", "--color-primary-hover", 4.5],
  ];
  for (const background of ["--color-bg", "--color-surface", "--color-surface-raised", "--color-secondary"]) {
    for (const foreground of ["--color-text", "--color-text-soft", "--color-text-muted", "--color-primary-strong"]) {
      pairs.push([foreground, background, 4.5]);
    }
    for (const foreground of ["--color-focus", "--color-border-strong"]) {
      pairs.push([foreground, background, 3]);
    }
  }
  for (const theme of ["light", "dark"]) {
    for (const [foreground, background, minimum] of pairs) {
      const ratio = contrastRatio(tokenColor(foreground, theme), tokenColor(background, theme));
      assert.ok(ratio >= minimum, `${theme} ${foreground} / ${background}: ${ratio}:1, 최소 ${minimum}:1`);
    }
  }
});

test("syntax·상태·언어 배지의 보조색은 양쪽 theme의 실제 바탕에서 읽힌다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const pairs = [
    ["--color-inline-code", "--color-inline-code-bg"],
    ...["success", "warning", "danger"].map((state) => [`--color-${state}-text`, `--color-${state}-bg`]),
    ...[...colorTokens.keys()].filter((name) => name.startsWith("--color-syntax-")).map((name) => [name, "--color-code"]),
    ...[...colorTokens.keys()].filter((name) => name.startsWith("--color-language-")).flatMap((name) => [
      [name, "--color-bg"], [name, "--color-surface"],
    ]),
  ];
  for (const theme of ["light", "dark"]) {
    for (const [foreground, background] of pairs) {
      const ratio = contrastRatio(tokenColor(foreground, theme), tokenColor(background, theme));
      assert.ok(ratio >= 4.5, `${theme} ${foreground} / ${background}: ${ratio}:1`);
    }
    for (const language of ["javascript", "html", "css", "java"]) {
      const token = `--color-language-${language}`;
      const rule = css.match(new RegExp(`\\.language-badge--${language}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
      const percent = rule.match(/background:\s*color-mix\(in srgb, var\(--color-language-[\w-]+\) ([\d.]+)%, var\(--color-bg\)\)/)?.[1];
      assert.ok(percent, `${language}: 실제 배지의 합성 바탕을 확인한다.`);
      const rgb = (name) => tokenColor(name, theme).slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16));
      const foreground = rgb(token);
      const background = rgb("--color-bg").map((channel, index) => channel * (1 - Number(percent) / 100) + foreground[index] * Number(percent) / 100);
      assert.ok(contrastRatio(foreground, background) >= 4.5, `${theme} ${language}: 배지의 합성 배경 대비`);
    }
  }
});

test("긴 교안 제목과 인라인 코드가 320px 문서 폭을 늘리지 않도록 줄바꿈한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const lessonTitleRule = css.match(/\.lesson-hero h1\s*\{([^}]*)\}/);
  const inlineCodeRule = css.match(/\.lesson-body :not\(pre\) > code\s*\{([^}]*)\}/);
  const lessonBodyRule = css.match(/\.lesson-body\s*\{([^}]*)\}/);

  assert.ok(lessonTitleRule);
  assert.ok(inlineCodeRule);
  assert.ok(lessonBodyRule);
  assert.match(lessonTitleRule[1], /overflow-wrap:\s*anywhere/);
  assert.match(inlineCodeRule[1], /overflow-wrap:\s*anywhere/);
  assert.match(lessonBodyRule[1], /word-break:\s*keep-all/);
  assert.match(lessonBodyRule[1], /overflow-wrap:\s*anywhere/);
});

test("인라인 코드의 보조색은 제품 토큰으로 연결하고 오류 제목은 물결 밑줄로 구분한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const sharedInlineRule = css.match(/#lesson-content :not\(pre\) > code\s*\{([^}]*)\}/)?.[1] ?? "";
  const quizInlineRule = css.match(/\.quiz-card :not\(pre\) > code\s*\{([^}]*)\}/)?.[1] ?? "";
  const questInlineRule = css.match(/\.quest-prose code\s*\{([^}]*)\}/)?.[1] ?? "";
  const diagnosticRule = css.match(
    /\.quiz-answer-summary\.is-incorrect h3,[\s\S]*?\.web-project-result-item\.is-engine_error strong\s*\{([^}]*)\}/,
  )?.[1] ?? "";

  for (const rule of [quizInlineRule, questInlineRule]) {
    assert.match(rule, /background:\s*var\(--color-inline-code-bg\)/);
    assert.match(rule, /border:\s*1px solid var\(--color-inline-code-border\)/);
  }
  assert.match(sharedInlineRule, /color:\s*var\(--color-inline-code\)/);
  for (const theme of ["light", "dark"]) {
    for (const background of ["--color-bg", "--color-surface", "--color-inline-code-bg"]) {
      assert.ok(contrastRatio(tokenColor("--color-inline-code", theme), tokenColor(background, theme)) >= 4.5);
    }
  }
  assert.match(diagnosticRule, /text-decoration-color:\s*var\(--color-danger\)/);
  assert.match(diagnosticRule, /text-decoration-line:\s*underline/);
  assert.match(diagnosticRule, /text-decoration-style:\s*wavy/);
  assert.match(diagnosticRule, /text-underline-offset:\s*0\.22em/);
});

test("초기 로딩 상태에서도 본문 바로가기 링크의 대상이 존재한다", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /href="#lesson-content"/);
  assert.match(
    html,
    /<main[^>]*class="initial-loader"[^>]*id="lesson-content"[^>]*tabindex="-1"/s,
  );
  assert.doesNotMatch(html, /<main[^>]*role=/s);
  assert.match(html, /class="state-message" role="status"/);
  assert.doesNotMatch(html, /aria-busy=/);
});

test("교안 로딩·빈 결과·오류 상태도 같은 본문 바로가기 대상을 유지한다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(appSource, /class="loading-page" id="lesson-content" tabindex="-1"/);
  assert.match(appSource, /class="empty-page" id="lesson-content" tabindex="-1"/);
  assert.match(appSource, /class="error-page" id="lesson-content" tabindex="-1"/);
  assert.doesNotMatch(appSource, /<main class="(?:loading|empty|error)-page"[^>]*role=/);
  assert.equal(appSource.match(/class="state-message" role="status"/g)?.length, 2);
  assert.match(appSource, /class="state-message" role="alert"/);
  assert.doesNotMatch(appSource, /aria-busy=/);
});

test("Phase 4 학습·복습·Quest·코딩테스트 내비게이션을 실제 링크로 노출한다", async () => {
  const quizViewSource = await readFile(
    new URL("../src/ui/quiz-view.js", import.meta.url),
    "utf8",
  );
  const questViewSource = await readFile(
    new URL("../src/ui/code-quest-view.js", import.meta.url),
    "utf8",
  );
  const codingTestViewSource = await readFile(
    new URL("../src/ui/coding-test-view.js", import.meta.url),
    "utf8",
  );
  const reviewNavigation = renderReviewNavigationLink({
    href: "#/review/javascript",
    isCurrent: true,
  });
  const questNavigation = renderCodeQuestNavigationLink({
    href: "#/quest/javascript/delivery-fee-policy",
    isCurrent: true,
    completedCount: 2,
    totalCount: 5,
  });
  const codingTestNavigation = renderCodingTestNavigationLink({
    href: "#/coding-tests",
    isCurrent: true,
    solvedCount: 1,
    totalCount: 6,
  });
  const shell = renderAppShell({
    homeHref: "#/learn/javascript/javascript-and-runtime",
    language: { name: "JavaScript", shortName: "JS", accent: "yellow" },
    lessonProgress: { completedCount: 1, totalCount: 6, percent: 17 },
    languageNavigation: '<nav class="language-nav">언어</nav>',
    lessonNavigationItems: '<li><a class="lesson-link" href="#lesson">교안</a></li>',
    featureNavigation: [
      {
        kind: "review",
        options: { href: "#/review/javascript", isCurrent: true },
      },
      {
        kind: "code-quest",
        options: {
          href: "#/quest/javascript/delivery-fee-policy",
          isCurrent: true,
          completedCount: 2,
          totalCount: 5,
        },
      },
      {
        kind: "coding-test",
        options: {
          href: "#/coding-tests",
          isCurrent: true,
          solvedCount: 1,
          totalCount: 6,
        },
      },
    ],
    mainContent: '<main id="lesson-content" tabindex="-1">본문</main>',
  });

  assert.equal((shell.match(/<nav class="review-nav"/g) ?? []).length, 1);
  assert.equal((shell.match(/<nav class="quest-nav"/g) ?? []).length, 1);
  assert.equal((shell.match(/<nav class="coding-test-nav"/g) ?? []).length, 1);
  assert.match(reviewNavigation, /<nav class="review-nav"/);
  assert.match(reviewNavigation, /href="#\/review\/javascript"/);
  assert.match(reviewNavigation, /객관식 복습/);
  assert.match(reviewNavigation, /aria-current="page"/);
  assert.doesNotMatch(reviewNavigation, /\s(?:aria-disabled|disabled)(?:=|\s|>)/);
  assert.match(questNavigation, /<nav class="quest-nav"/);
  assert.match(questNavigation, /href="#\/quest\/javascript\/delivery-fee-policy"/);
  assert.match(questNavigation, /Code Quest/);
  assert.match(questNavigation, /2\/5 완료 · 공개 테스트/);
  assert.match(questNavigation, /aria-current="page"/);
  assert.doesNotMatch(questNavigation, /\s(?:aria-disabled|disabled)(?:=|\s|>)/);
  assert.match(codingTestNavigation, /<nav class="coding-test-nav"/);
  assert.match(codingTestNavigation, /href="#\/coding-tests"/);
  assert.match(codingTestNavigation, /1\/6 풀이 완료/);
  assert.match(codingTestNavigation, /aria-current="page"/);
  assert.match(`${shell}\n${questViewSource}\n${codingTestViewSource}`, /공개 테스트/);
  assert.doesNotMatch(
    `${shell}\n${quizViewSource}\n${questViewSource}\n${codingTestViewSource}`,
    /실전 프로젝트|AI 코드 리뷰/,
  );
});

test("Code Quest 편집기와 결과는 label 및 단일 포커스 region 전략을 사용한다", () => {
  const quest = {
    id: "quest-javascript-accessibility",
    title: "접근성 확인",
    entryPoint: "solve",
    publicTests: [{ id: "public-one", label: "첫 테스트", args: [], expected: 1 }],
    failureExplanations: [],
    functionContract: {
      parameters: [],
      returns: { type: "number", description: "결과" },
      constraints: [],
      complexity: { time: "O(1)", space: "O(1)" },
    },
    examples: [],
    hints: [],
  };
  const html = renderCodeQuestView({
    languageName: "JavaScript",
    quest,
    total: 1,
    source: "function solve() { return 1; }",
    report: {
      outcome: "passed",
      summary: { passed: 1, total: 1 },
      tests: [
        {
          testId: "public-one",
          label: "첫 테스트",
          outcome: "passed",
          expectedDisplay: "1",
          actualDisplay: "1",
          hasActual: true,
          durationMs: 1,
          console: [],
          error: null,
        },
      ],
      error: null,
    },
  });

  assert.match(html, /<label[^>]*for="quest-source"/);
  assert.match(html, /<textarea[^>]*id="quest-source"[^>]*data-quest-source/);
  assert.equal((html.match(/class="quest-source-highlight syntax-code" aria-hidden="true"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /quest-source-highlight[^>]*(?:tabindex|role=|aria-live)/);
  assert.equal((html.match(/data-quest-results/g) ?? []).length, 1);
  assert.match(
    html,
    /data-quest-results tabindex="-1" role="region" aria-labelledby="quest-results-title"/,
  );
  assert.doesNotMatch(html, /data-quest-results[^>]*(?:role="status"|aria-live)/);
});

test("정상 채점은 결과 영역 초점만 사용하고 오류만 announcer로 알린다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const start = appSource.indexOf("  gradeCurrentQuizQuestion() {");
  const end = appSource.indexOf("\n  showPreviousQuizQuestion() {", start);
  assert.ok(start >= 0 && end > start);

  const gradingSource = appSource.slice(start, end);
  assert.match(gradingSource, /querySelector\("\[data-quiz-grade-summary\]"\)/);
  assert.match(gradingSource, /summary\?\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(gradingSource, /this\.announce\(gradedAnswer\.isCorrect/);
  assert.match(
    gradingSource,
    /this\.announce\("이 문제를 채점하지 못했습니다\. 다시 선택해 주세요\."\)/,
  );
});

test("객관식 저장은 세션당 한 번만 시도하고 비영속 상태를 구분한다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const start = appSource.indexOf("  finishQuizSession(");
  const end = appSource.indexOf("\n  retryQuiz(mode) {", start);
  assert.ok(start >= 0 && end > start);

  const finishSource = appSource.slice(start, end);
  const guardIndex = finishSource.indexOf("session.recordAttempted) return");
  const attemptedIndex = finishSource.indexOf("session.recordAttempted = true");
  const recordIndex = finishSource.indexOf("recordQuizAttempt({");
  assert.ok(guardIndex >= 0);
  assert.ok(attemptedIndex > guardIndex);
  assert.ok(recordIndex > attemptedIndex);
  assert.equal((finishSource.match(/recordQuizAttempt\(/g) ?? []).length, 1);
  assert.equal((appSource.match(/recordQuizAttempt\(/g) ?? []).length, 1);
  assert.match(finishSource, /getPersistenceStatus\(\)/);
  assert.match(finishSource, /persistence\.isPersistent \? "saved" : "memory"/);
});

test("지원 가능한 복습 경로를 유지하고 미지원·planned 언어는 기존 JavaScript 첫 교안으로 복귀한다", async (t) => {
  const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: { hash: "" },
      history: { replaceState(_state, _title, hash) { globalThis.window.location.hash = hash; } },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });

  for (const { hash, planned, expected } of [
    { hash: "#/review/html", expected: ["review", "html", undefined] },
    { hash: "#/review/java", expected: ["review", "java", undefined] },
    { hash: "#/review/javascript/js-notes-functions", expected: ["review", "javascript", "js-notes-functions"] },
    { hash: "#/review/python", expected: ["lesson", "#/learn/javascript/javascript-and-runtime"] },
    { hash: "#/review/html", planned: "html", expected: ["lesson", "#/learn/javascript/javascript-and-runtime"] },
  ]) {
    const calls = [];
    const app = Object.create(BamLearningApp.prototype);
    const inputCurriculum = structuredClone(curriculum);
    if (planned) inputCurriculum.languages.find((language) => language.id === planned).status = "planned";
    Object.assign(app, {
      curriculum: inputCurriculum,
      leaveCurrentView() {},
      async openReviewRoute(languageId, lessonId) { calls.push(["review", languageId, lessonId]); },
      async openLessonRoute() { calls.push(["lesson", globalThis.window.location.hash]); },
    });
    globalThis.window.location.hash = hash;
    await app.openRoute();
    assert.deepEqual(calls, [expected], hash);
    if (expected[0] === "review") assert.equal(globalThis.window.location.hash, hash);
  }
});

test("오답 재도전은 단원 범위를 지키고 새 세션을 미저장 상태로 시작하며 첫 문제 초점을 안내한다", () => {
  const questions = [
    { id: "quiz-javascript-one", lessonId: "lesson-functions" },
    { id: "quiz-javascript-two", lessonId: "lesson-functions" },
    { id: "quiz-javascript-other", lessonId: "lesson-values" },
  ];
  const calls = [];
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "review",
    quizCollection: { languageId: "javascript", questions },
    quizLessonId: "lesson-functions",
    quizSession: { screen: "result", recordAttempted: true, summary: { incorrectQuestionIds: [questions[0].id, questions[2].id] } },
    progressRepository: { getProgress: () => ({ incorrectQuestionIds: [questions[1].id, questions[2].id] }) },
    renderQuiz() { calls.push("render"); },
    focusQuizQuestion() { calls.push("focus-question"); },
    announce(message) { calls.push(message); },
  });

  for (const [mode, expectedQuestion] of [["incorrect", questions[0]], ["saved-incorrect", questions[1]]]) {
    calls.length = 0;
    app.retryQuiz(mode);
    assert.deepEqual(app.quizSession.questions, [expectedQuestion]);
    assert.equal(app.quizSession.screen, "question");
    assert.equal(app.quizSession.mode, "incorrect");
    assert.equal(app.quizSession.currentIndex, 0);
    assert.equal(app.quizSession.recordAttempted, false);
    assert.equal(app.quizSession.selectedOptionIds.size, 0);
    assert.equal(app.quizSession.gradedAnswers.size, 0);
    assert.equal(app.quizSession.summary, null);
    assert.deepEqual(calls, ["render", "focus-question", "새 복습 세션을 시작했습니다."]);
  }
});

test("Code Quest 라우트는 잘못된 slug와 지원하지 않는 언어를 안전하게 복귀시킨다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const routeStart = appSource.indexOf("  async openRoute(");
  const routeEnd = appSource.indexOf("\n  async openLessonRoute(", routeStart);
  const questStart = appSource.indexOf("  async openCodeQuestRoute(");
  const questEnd = appSource.indexOf("\n  handleClick(", questStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart);
  assert.ok(questStart >= 0 && questEnd > questStart);

  const routeSource = appSource.slice(routeStart, routeEnd);
  const questSource = appSource.slice(questStart, questEnd);
  assert.match(routeSource, /parseQuestHash\(window\.location\.hash\)/);
  // 지원 언어와 Java fallback 동작은 app-language-routing.test.js에서 검증한다.
  assert.match(routeSource, /questLessons\.length > 0/);
  assert.match(routeSource, /openCodeQuestRoute\(questRoute\.languageId, questRoute\.slug\)/);
  assert.match(routeSource, /buildLessonHash\(fallbackLesson\.courseId, fallbackLesson\.slug\)/);
  assert.match(questSource, /findCodeQuestBySlug\(collection, slug\) \?\? quests\[0\]/);
  assert.match(questSource, /buildQuestHash\(languageId, quest\.slug\)/);
  assert.match(questSource, /window\.history\.replaceState\(null, "", canonicalHash\)/);
});

test("Code Quest 실행은 공통 실행 신호를 runner에 전달하고 정답 안내를 중복 방송하지 않는다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const start = appSource.indexOf("  async runCurrentCodeQuest() {");
  const end = appSource.indexOf("\n  cancelCodeQuestRun(", start);
  assert.ok(start >= 0 && end > start);

  const runSource = appSource.slice(start, end);
  const requestIndex = runSource.indexOf("createCodeQuestExecutionRequest(");
  const startIndex = runSource.indexOf("this.executionCoordinator.start({");
  const runnerIndex = runSource.indexOf("this.codeQuestRunner.run(request");
  const recordIndex = runSource.indexOf("recordQuestAttempt({");
  assert.ok(requestIndex >= 0 && startIndex > requestIndex && runnerIndex > startIndex);
  assert.ok(recordIndex > runnerIndex);
  assert.equal((runSource.match(/recordQuestAttempt\(/g) ?? []).length, 1);
  assert.equal((appSource.match(/recordQuestAttempt\(/g) ?? []).length, 1);
  assert.match(runSource, /signal: execution\.signal/);
  assert.doesNotMatch(runSource, /new AbortController\(\)/);
  assert.match(runSource, /getPersistenceStatus\(\)/);
  assert.doesNotMatch(runSource.slice(recordIndex, runSource.indexOf("});", recordIndex)), /source:/);
  assert.doesNotMatch(runSource, /this\.announce\([^)]*(?:통과|결과)/);
});

test("Code Quest 초안은 get/save/clear API와 비영속 상태를 연결한다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.equal((appSource.match(/getQuestDraft\(/g) ?? []).length, 1);
  assert.equal((appSource.match(/saveQuestDraft\(/g) ?? []).length, 1);
  assert.equal((appSource.match(/clearQuestDraft\(/g) ?? []).length, 1);
  assert.match(appSource, /draft \? draft\.source : quest\.starterCode/);
  assert.match(appSource, /persistence\.isPersistent \? "saved" : "memory"/);
  assert.match(appSource, /state\.source = editor\.value/);
});

test("Web Project 작업 공간은 키보드·고대비·320px 반응형 스타일 계약을 유지한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const baseStart = css.indexOf(".web-project-nav {");
  const desktopMediaStart = css.indexOf("@media (min-width: 1120px)", baseStart);
  const tabletStart = css.indexOf("@media (max-width: 820px)", desktopMediaStart);
  const mobileStart = css.indexOf("@media (max-width: 600px)", tabletStart);
  const narrowStart = css.indexOf("@media (max-width: 360px)", mobileStart);
  const reducedMotionStart = css.indexOf(
    "@media (prefers-reduced-motion: reduce)",
    narrowStart,
  );
  const forcedColorsStart = css.indexOf(
    "@media (forced-colors: active)",
    reducedMotionStart,
  );

  assert.ok(baseStart >= 0);
  assert.ok(desktopMediaStart > baseStart);
  assert.ok(tabletStart > desktopMediaStart);
  assert.ok(mobileStart > tabletStart);
  assert.ok(narrowStart > mobileStart);
  assert.ok(reducedMotionStart > narrowStart);
  assert.ok(forcedColorsStart > reducedMotionStart);

  const base = css.slice(baseStart, desktopMediaStart);
  const tablet = css.slice(tabletStart, mobileStart);
  const mobile = css.slice(mobileStart, narrowStart);
  const narrow = css.slice(narrowStart, reducedMotionStart);
  const reducedMotion = css.slice(reducedMotionStart, forcedColorsStart);
  const forcedColors = css.slice(forcedColorsStart);

  const workspaceRules = [
    ...base.matchAll(/\.web-project-workspace\s*\{([^}]*)\}/g),
  ];
  const workspaceRule = workspaceRules.find((match) =>
    match[1].includes("grid-template-columns"),
  );
  const sourceRule = base.match(/\.web-project-source\s*\{([^}]*)\}/);
  const previewRule = base.match(/\.web-project-preview-frame\s*\{([^}]*)\}/);
  const fileButtonRule = base.match(
    /\.web-project-file-tab,\s*\.web-project-preview-heading button\s*\{([^}]*)\}/,
  );
  assert.ok(workspaceRule);
  assert.ok(sourceRule);
  assert.ok(previewRule);
  assert.ok(fileButtonRule);
  assert.match(workspaceRule[1], /grid-template-columns:\s*minmax\(210px,[^)]+\)\s+minmax\(0,[^)]+\)/);
  assert.match(sourceRule[1], /min-width:\s*0/);
  assert.match(sourceRule[1], /min-height:\s*420px/);
  assert.match(sourceRule[1], /overflow:\s*auto/);
  assert.match(sourceRule[1], /white-space:\s*pre/);
  assert.match(previewRule[1], /max-width:\s*100%/);
  assert.match(previewRule[1], /overflow:\s*auto/);
  assert.match(fileButtonRule[1], /min-height:\s*44px/);
  assert.match(base, /\.web-project-preview-frame\.is-narrow iframe\s*\{[^}]*width:\s*22\.5rem/s);
  assert.match(base, /\.web-project-preview-frame\.is-wide iframe\s*\{[^}]*width:\s*max\(100%,\s*48rem\)/s);
  assert.match(base, /\.web-project-file-tab:focus-visible,[\s\S]*\.web-project-results:focus-visible\s*\{/);

  const webProjectPixelFontSizes = [...base.matchAll(/font-size:\s*(\d+)px/g)].map(
    (match) => Number(match[1]),
  );
  assert.ok(webProjectPixelFontSizes.length > 0);
  assert.ok(webProjectPixelFontSizes.every((size) => size >= 12));

  assert.match(tablet, /\.web-project-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(mobile, /\.web-project-source\s*\{[^}]*min-height:\s*340px/s);
  assert.match(narrow, /\.web-project-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(narrow, /\.web-project-list-page,[\s\S]*padding-left:\s*8px/);
  assert.match(reducedMotion, /\.web-project-link,[\s\S]*transition:\s*none/);
  assert.match(forcedColors, /\.web-project-source\s*\{[^}]*background:\s*Canvas[^}]*color:\s*CanvasText/s);
  assert.match(forcedColors, /\.web-project-result-item\s*\{[^}]*border-left-width:\s*4px/s);
});
