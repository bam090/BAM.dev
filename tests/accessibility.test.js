import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderReviewNavigationLink } from "../src/ui/quiz-view.js";
import {
  renderCodeQuestNavigationLink,
  renderCodeQuestView,
} from "../src/ui/code-quest-view.js";
import { renderCodingTestNavigationLink } from "../src/ui/coding-test-view.js";

function relativeLuminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
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

test("주요 버튼의 기본·hover 색 대비가 일반 텍스트 AA 기준을 충족한다", () => {
  assert.ok(contrastRatio("#4c8bf5", "#06101f") >= 4.5);
  assert.ok(contrastRatio("#5a96fa", "#06101f") >= 4.5);
});

test("긴 교안 제목과 인라인 코드가 320px 문서 폭을 늘리지 않도록 줄바꿈한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const lessonTitleRule = css.match(/\.lesson-hero h1\s*\{([^}]*)\}/);
  const inlineCodeRule = css.match(/\.lesson-body :not\(pre\) > code\s*\{([^}]*)\}/);

  assert.ok(lessonTitleRule);
  assert.ok(inlineCodeRule);
  assert.match(lessonTitleRule[1], /overflow-wrap:\s*anywhere/);
  assert.match(inlineCodeRule[1], /overflow-wrap:\s*anywhere/);
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
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
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

  assert.equal((appSource.match(/\$\{renderReviewNavigationLink\(\{/g) ?? []).length, 4);
  assert.equal(
    (appSource.match(/renderCodeQuestNavigationLink\(\{/g) ?? []).length,
    4,
  );
  assert.equal(
    (appSource.match(/renderCodingTestNavigationLink\(\{/g) ?? []).length,
    4,
  );
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
  assert.match(`${appSource}\n${questViewSource}\n${codingTestViewSource}`, /공개 테스트/);
  assert.doesNotMatch(
    `${appSource}\n${quizViewSource}\n${questViewSource}\n${codingTestViewSource}`,
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
  const start = appSource.indexOf("  finishQuizSession() {");
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

test("오답 재도전과 지원하지 않는 언어 복귀의 앱 계약을 유지한다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const routeStart = appSource.indexOf("  async openRoute(");
  const routeEnd = appSource.indexOf("\n  async openLessonRoute(", routeStart);
  const retryStart = appSource.indexOf("  retryQuiz(mode) {");
  const retryEnd = appSource.indexOf("\n  startQuizSession(", retryStart);
  const sessionStart = retryEnd + 1;
  const sessionEnd = appSource.indexOf("\n  getCurrentQuizQuestion() {", sessionStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart);
  assert.ok(retryStart >= 0 && retryEnd > retryStart);
  assert.ok(sessionStart > 0 && sessionEnd > sessionStart);

  const routeSource = appSource.slice(routeStart, routeEnd);
  const retrySource = appSource.slice(retryStart, retryEnd);
  const sessionSource = appSource.slice(sessionStart, sessionEnd);
  assert.match(
    routeSource,
    /getLanguage\(this\.curriculum, reviewRoute\.languageId\)/,
  );
  assert.match(routeSource, /reviewLanguage\.status !== "planned"/);
  assert.match(routeSource, /await this\.openReviewRoute\(reviewRoute\.languageId\)/);
  assert.match(routeSource, /getLessonsForLanguage\([\s\S]*DEFAULT_LANGUAGE_ID[\s\S]*\)\[0\]/);
  assert.match(
    routeSource,
    /buildLessonHash\(fallbackLesson\.languageId, fallbackLesson\.slug\)/,
  );
  assert.match(routeSource, /await this\.openLessonRoute\(\)/);
  assert.match(retrySource, /mode === "incorrect"/);
  assert.match(retrySource, /summary\.incorrectQuestionIds\.includes\(question\.id\)/);
  assert.match(retrySource, /startQuizSession\(questions, mode === "incorrect"/);
  assert.match(sessionSource, /recordAttempted: false/);
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
  assert.match(routeSource, /questLanguage\?\.status === "available"/);
  assert.match(routeSource, /questLessons\.length > 0/);
  assert.match(routeSource, /openCodeQuestRoute\(questRoute\.languageId, questRoute\.slug\)/);
  assert.match(routeSource, /buildLessonHash\(fallbackLesson\.languageId, fallbackLesson\.slug\)/);
  assert.match(questSource, /findCodeQuestBySlug\(collection, slug\) \?\? quests\[0\]/);
  assert.match(questSource, /buildQuestHash\(languageId, quest\.slug\)/);
  assert.match(questSource, /window\.history\.replaceState\(null, "", canonicalHash\)/);
});

test("Code Quest 실행은 request→runner 순서를 지키고 report당 한 번만 저장한다", async () => {
  const appSource = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const start = appSource.indexOf("  async runCurrentCodeQuest() {");
  const end = appSource.indexOf("\n  cancelCodeQuestRun(", start);
  assert.ok(start >= 0 && end > start);

  const runSource = appSource.slice(start, end);
  const requestIndex = runSource.indexOf("createCodeQuestExecutionRequest(");
  const runnerIndex = runSource.indexOf("this.codeQuestRunner.run(request");
  const guardIndex = runSource.indexOf("if (!execution.recordAttempted)");
  const markIndex = runSource.indexOf("execution.recordAttempted = true");
  const recordIndex = runSource.indexOf("recordQuestAttempt({");
  assert.ok(requestIndex >= 0 && runnerIndex > requestIndex);
  assert.ok(guardIndex >= 0 && markIndex > guardIndex && recordIndex > markIndex);
  assert.equal((runSource.match(/recordQuestAttempt\(/g) ?? []).length, 1);
  assert.equal((appSource.match(/recordQuestAttempt\(/g) ?? []).length, 1);
  assert.match(runSource, /new AbortController\(\)/);
  assert.match(runSource, /signal: execution\.controller\.signal/);
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
