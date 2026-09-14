import {
  escapeHtml,
  renderHighlightedCode,
  renderInlineCodeText,
} from "./markdown.js";

const OPTION_MARKERS = ["A", "B", "C", "D"];
const DIFFICULTY_LABELS = {
  basic: "기본",
  application: "응용",
};

function safeInteger(value, fallback = 0) {
  return Number.isInteger(value) ? value : fallback;
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, safeInteger(value)));
}

function renderRecentProgress(recentAttempt, incorrectQuestionCount) {
  const incorrectCount = Math.max(0, safeInteger(incorrectQuestionCount));
  const incorrectCopy =
    incorrectCount > 0
      ? `<span>저장된 오답 <strong>${incorrectCount}문항</strong></span>`
      : "<span>저장된 오답 없음</span>";

  if (!recentAttempt) {
    return `
      <div class="review-history" aria-label="최근 복습 기록">
        <span>최근 완료 기록 없음</span>
        ${incorrectCopy}
      </div>
    `;
  }

  const score = Math.max(0, safeInteger(recentAttempt.score));
  const total = Math.max(0, safeInteger(recentAttempt.total));
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return `
    <div class="review-history" aria-label="최근 복습 기록">
      <span>최근 결과 <strong>${score}/${total} (${percent}%)</strong></span>
      ${incorrectCopy}
    </div>
  `;
}

export function getQuizSaveStatusMessage(status) {
  if (status === "memory") return "현재 탭에만 저장됩니다. 새로고침하면 사라질 수 있어요.";
  if (status === "failed") return "풀이를 저장하지 못했습니다. 현재 화면에서 계속할 수 있어요.";
  return "풀이 자동 저장";
}

export function renderQuizScopeControls({
  lessons = [],
  selectedLessonId = null,
  recentAttempt = null,
  incorrectQuestionCount = 0,
  saveStatus = "saved",
  notice = "",
} = {}) {
  return `
    <nav class="review-breadcrumb" aria-label="문제 탐색"><a href="#/review">← 객관식 문제 목록</a><span data-review-save-status role="status">${getQuizSaveStatusMessage(saveStatus)}</span></nav>
    <p class="catalog-notice" data-review-save-notice role="status"${notice ? "" : " hidden"}><span data-review-save-message>${escapeHtml(notice)}</span> <button class="text-button" type="button" data-retry>저장된 풀이 불러오기</button></p>
    <details class="review-scope">
      <summary>문제 범위·지난 결과</summary>
      <label for="quiz-lesson-scope">복습할 학습 문서</label>
      <select id="quiz-lesson-scope" data-quiz-lesson>
        <option value=""${selectedLessonId ? "" : " selected"}>이 언어의 전체 문서</option>
        ${lessons.map((lesson) => `<option value="${escapeHtml(lesson.id)}"${lesson.id === selectedLessonId ? " selected" : ""}>${escapeHtml(lesson.courseName)} · ${escapeHtml(lesson.title)} (${lesson.questionCount}문항)</option>`).join("")}
      </select>
      <div class="quiz-result-actions">
        <button class="button button--secondary" type="button" data-quiz-retry="saved-incorrect"${incorrectQuestionCount > 0 ? "" : " disabled"}>저장된 오답 다시 풀기 (${incorrectQuestionCount})</button>
        <button class="button button--secondary" type="button" data-quiz-history${recentAttempt ? "" : " disabled"}>최근 완료 결과 보기</button>
      </div>
      <p>선택과 채점 상태는 이 브라우저에 저장됩니다. 새 범위를 시작하면 마지막 진행 중 풀이가 바뀌며, 완료 기록은 유지됩니다.</p>
    </details>
  `;
}

export function renderQuizEmptyView({ title, scopeControls = "", lessonHref = "#" } = {}) {
  return `
    <main class="main-area" id="lesson-content" tabindex="-1">
      <div class="review-container">
        ${scopeControls}
        <section class="quiz-card" role="status">
          <h1 id="quiz-question-title" tabindex="-1">연결된 문제가 없습니다.</h1>
          <p>${escapeHtml(title)}에는 아직 준비된 객관식 문제가 없습니다. 문서를 읽거나 다른 범위를 선택해 주세요.</p>
          <a class="button button--secondary" href="${escapeHtml(lessonHref)}">학습 문서 읽기</a>
        </section>
      </div>
    </main>
  `;
}

function renderLessonReference({ lessonHref, lessonTitle, conceptId }) {
  if (!lessonHref) return "";
  return `<p class="quiz-lesson-reference"><a href="${escapeHtml(lessonHref)}" data-review-document>관련 학습문서: ${escapeHtml(lessonTitle)}</a></p>`;
}

export function renderReviewNavigationLink({ href, isCurrent = false } = {}) {
  return `
    <nav class="review-nav" aria-label="개념 복습">
      <p class="nav-label">복습</p>
      <a class="review-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href ?? "#")}"${isCurrent ? ' aria-current="page"' : ""}>
        <span class="review-link-icon" aria-hidden="true">?</span>
        <span><strong>객관식 복습</strong><small>즉시 채점 · 전체 해설</small></span>
      </a>
    </nav>
  `;
}

export function renderQuizLoadingView({ title = "학습 언어" } = {}) {
  return `
    <main class="loading-page" id="lesson-content" tabindex="-1">
      <div class="quiz-state-message" role="status">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p><strong>${escapeHtml(title)}</strong> 객관식 복습을 준비하고 있습니다…</p>
      </div>
    </main>
  `;
}

function renderQuestionHeader({
  languageName,
  title,
  currentIndex,
  total,
  answeredCount,
  recentAttempt,
  incorrectQuestionCount,
  sessionMode,
  viewMode,
}) {
  const safeTotal = Math.max(0, safeInteger(total));
  const safeAnswered = Math.min(safeTotal, Math.max(0, safeInteger(answeredCount)));
  const questionNumber = Math.min(safeTotal, Math.max(1, safeInteger(currentIndex) + 1));
  const percent = safeTotal === 0 ? 0 : Math.round((safeAnswered / safeTotal) * 100);

  return `
    <header class="review-header">
      <div class="eyebrow">
        <span>${escapeHtml(languageName)}</span>
        <span aria-hidden="true">·</span>
        <span>${sessionMode === "incorrect" ? "오답 다시 풀기" : "전체 복습"}</span>
      </div>
      <h1>${escapeHtml(title)}</h1>
      ${renderRecentProgress(recentAttempt, incorrectQuestionCount)}
      <div class="review-progress-copy">
        <span>${viewMode === "all" ? `전체 문제 <strong>${safeTotal}문항</strong>` : `문제 <strong>${questionNumber}/${safeTotal}</strong>`}</span>
        <span>채점 완료 ${safeAnswered}/${safeTotal}</span>
      </div>
      <div class="review-progress-track" role="progressbar" aria-label="객관식 복습 진행" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
        <span style="width: ${percent}%"></span>
      </div>
    </header>
  `;
}

function renderQuestionCode(code, languageId, languageName) {
  if (typeof code !== "string" || code.length === 0) return "";
  const hasHtmlMarkup =
    /(?:^|\n)\s*(?:<!doctype\b|<\/?[A-Z_a-z][\w:-]*(?:\s[^<>]*|\s*\/?)>)/i.test(code);
  const syntaxLanguage = hasHtmlMarkup
    ? languageId === "javascript"
      ? "html-javascript"
      : languageId === "css"
        ? "html-css"
        : "html"
    : languageId;
  return `
    <figure class="quiz-code">
      <figcaption>문제 코드</figcaption>
      <pre class="syntax-code" tabindex="0" aria-label="${escapeHtml(languageName)} 문제 코드"><code class="language-${escapeHtml(syntaxLanguage)}">${renderHighlightedCode(code, syntaxLanguage)}</code></pre>
    </figure>
  `;
}

function renderOption(option, index, selectedOptionId, gradedAnswer, otherFeedbackExpanded, questionId) {
  const isSelected = option.id === selectedOptionId;
  const feedback = gradedAnswer?.feedback?.find((item) => item.optionId === option.id) ?? null;
  const isCorrect = feedback?.isCorrect === true;
  const isSelectedIncorrect = Boolean(gradedAnswer && isSelected && !isCorrect);
  const feedbackId = `quiz-option-feedback-${questionId}-${index}`;
  const inputId = `quiz-option-${questionId}-${index}`;
  const showFeedback = feedback && (isCorrect || isSelected || otherFeedbackExpanded);
  const optionClasses = [
    "quiz-option",
    isSelected ? "is-selected" : "",
    isCorrect ? "is-correct" : "",
    isSelectedIncorrect ? "is-incorrect" : "",
  ]
    .filter(Boolean)
    .join(" ");

  let resultLabel = "";
  if (gradedAnswer) {
    if (isCorrect && isSelected) resultLabel = "정답 · 내 선택";
    else if (isCorrect) resultLabel = "정답";
    else if (isSelected) resultLabel = "오답 · 내 선택";
    else resultLabel = "오답 선택지";
  }

  return `
    <div class="${optionClasses}">
      <input id="${escapeHtml(inputId)}" type="radio" name="quiz-answer-${escapeHtml(questionId)}" value="${escapeHtml(option.id)}" data-quiz-option${isSelected ? " checked" : ""}${gradedAnswer ? " disabled" : ""}${showFeedback ? ` aria-describedby="${escapeHtml(feedbackId)}"` : ""}>
      <label for="${escapeHtml(inputId)}">
        <span class="quiz-option-marker" aria-hidden="true">${OPTION_MARKERS[index] ?? index + 1}</span>
        <span class="quiz-option-content">
          <span class="quiz-option-text">${renderInlineCodeText(option.text)}</span>
          ${
            showFeedback
              ? `<span class="quiz-option-feedback" id="${escapeHtml(feedbackId)}"><strong>${resultLabel}</strong>${renderInlineCodeText(feedback.message)}</span>`
              : ""
          }
        </span>
      </label>
    </div>
  `;
}

function renderGradedSummary(question, gradedAnswer) {
  if (!gradedAnswer) return "";
  const correctOption = question.options.find(
    (option) => option.id === gradedAnswer.correctOptionId,
  );
  const explanation = gradedAnswer.feedback.find(
    (feedback) => feedback.optionId === gradedAnswer.correctOptionId,
  );

  return `
    <section class="quiz-answer-summary ${gradedAnswer.isCorrect ? "is-correct" : "is-incorrect"}" id="quiz-answer-summary-${escapeHtml(question.id)}" data-quiz-grade-summary tabindex="-1" role="region" aria-labelledby="quiz-answer-summary-title-${escapeHtml(question.id)}">
      <h3 id="quiz-answer-summary-title-${escapeHtml(question.id)}">${gradedAnswer.isCorrect ? "정답입니다." : "오답입니다."}</h3>
      <p><strong>정답</strong> ${renderInlineCodeText(correctOption?.text ?? "정답 정보를 확인할 수 없습니다.")}</p>
      <p><strong>정답 설명</strong> ${renderInlineCodeText(explanation?.message ?? "정답 해설을 확인할 수 없습니다.")}</p>
    </section>
  `;
}

function renderQuizQuestionCard({
  languageId, languageName, question, currentIndex, total, answeredCount,
  selectedOptionId, gradedAnswer, lessonHref, learningObjective,
  relatedConceptTitle, otherFeedbackExpanded = false, viewMode, gradingMode,
}) {
  const questionId = question?.id ?? "missing";
  const safeId = escapeHtml(questionId);
  const isLastQuestion = total > 0 && currentIndex === total - 1;
  const difficulty = DIFFICULTY_LABELS[question?.difficulty] ?? "복습";
  const hasSelection = question?.options?.some((option) => option.id === selectedOptionId) ?? false;
  const isGraded = Boolean(gradedAnswer);
  const allGraded = answeredCount === total;
  const canMoveNext = gradingMode === "batch"
    ? !isLastQuestion || allGraded
    : isGraded && (!isLastQuestion || allGraded);
  const nextHelp = canMoveNext
    ? gradingMode === "batch" && !isGraded
      ? "다른 문제의 답도 고른 뒤 함께 채점할 수 있습니다."
      : "채점을 완료했습니다. 다음 단계로 이동할 수 있습니다."
    : isLastQuestion && !allGraded
      ? "모든 문제를 채점한 뒤 결과를 볼 수 있습니다. 이전 문제나 전부 보기에서 남은 답을 선택해 주세요."
      : "정답을 확인한 뒤 다음 문제로 이동할 수 있습니다.";
  return `
    <section class="quiz-card" data-quiz-question-id="${safeId}" aria-labelledby="quiz-question-title-${safeId}">
      <p class="quiz-question-meta">${difficulty} 문제 · ${currentIndex + 1}/${total}</p>
      <h2 id="quiz-question-title-${safeId}" data-quiz-question-title tabindex="-1">${renderInlineCodeText(question?.prompt ?? "문제를 불러오지 못했습니다.")}</h2>
      ${learningObjective ? `<p class="quiz-learning-objective"><strong>학습 목표</strong> ${renderInlineCodeText(learningObjective)}</p>` : ""}
      ${renderQuestionCode(question?.code, languageId, languageName)}
      <form class="quiz-form" data-quiz-form>
        <fieldset class="quiz-options">
          <legend>답을 하나 선택하세요.</legend>
          ${(question?.options ?? []).map((option, index) => renderOption(option, index, selectedOptionId, gradedAnswer, otherFeedbackExpanded, questionId)).join("")}
        </fieldset>
        ${renderGradedSummary(question, gradedAnswer)}
        ${gradedAnswer ? `<button class="text-button" id="quiz-feedback-toggle-${safeId}" type="button" data-quiz-feedback-toggle aria-expanded="${otherFeedbackExpanded}">${otherFeedbackExpanded ? "다른 보기 해설 접기" : "다른 보기 해설 펼치기"}</button>` : ""}
        ${lessonHref ? `<p class="quiz-lesson-reference"><button class="button button--secondary" id="quiz-related-concept-${safeId}" type="button" data-related-concept aria-haspopup="dialog">관련 개념${relatedConceptTitle ? `: ${renderInlineCodeText(relatedConceptTitle)}` : " 확인"}</button></p>` : ""}
        <div class="quiz-actions${viewMode === "all" ? " quiz-actions--individual" : ""}${gradingMode === "batch" ? " quiz-actions--batch" : ""}">
          ${viewMode === "single" ? `<button class="button button--secondary" type="button" data-quiz-previous${currentIndex === 0 ? " disabled" : ""}>이전 문제</button>` : ""}
          ${gradingMode === "individual" ? `<button class="button button--primary" type="button" data-quiz-check${!hasSelection || isGraded ? " disabled" : ""}>${isGraded ? "채점 완료" : "정답 확인"}</button>` : ""}
          ${viewMode === "single" ? `<button class="button button--secondary${canMoveNext ? "" : " is-disabled"}" type="button" data-quiz-next aria-disabled="${String(!canMoveNext)}"${canMoveNext ? "" : ` aria-describedby="quiz-next-help-${safeId}"`}>${isLastQuestion ? "결과 보기" : "다음 문제"}</button>` : ""}
        </div>
        ${viewMode === "single" ? `<p class="quiz-next-help${canMoveNext ? " is-ready" : ""}" id="quiz-next-help-${safeId}">${nextHelp}</p>` : ""}
      </form>
    </section>
  `;
}

function renderQuizModeControls({ viewMode, gradingMode, pendingCount, unansweredCount }) {
  return `
    <section class="quiz-mode-controls" aria-label="문제 보기와 채점 방식">
      <div class="quiz-mode-group" role="group" aria-label="보기 방식">
        <span>보기 방식</span>
        ${[["single", "하나씩 보기"], ["all", "전부 보기"]].map(([value, label]) => `<button class="button button--secondary" id="quiz-view-${value}" type="button" data-quiz-view-mode="${value}" aria-pressed="${viewMode === value}">${label}</button>`).join("")}
      </div>
      <div class="quiz-mode-group" role="group" aria-label="채점 방식">
        <span>채점 방식</span>
        ${[["individual", "개별 채점"], ["batch", "전체 채점"]].map(([value, label]) => `<button class="button button--secondary" id="quiz-grading-${value}" type="button" data-quiz-grading-mode="${value}" aria-pressed="${gradingMode === value}">${label}</button>`).join("")}
      </div>
      ${gradingMode === "batch" ? `<div class="quiz-batch-controls"><button class="button button--primary" id="quiz-check-all" type="button" data-quiz-check-all${pendingCount ? "" : " disabled"}>답한 ${pendingCount}개 채점</button><p id="quiz-batch-status" data-quiz-batch-status tabindex="-1">미채점 선택 ${pendingCount}문항 · 미응답 ${unansweredCount}문항. 이미 채점한 문항과 미응답은 제외합니다.</p></div>` : ""}
    </section>
  `;
}

export function renderQuizQuestionView({
  languageId = "javascript", languageName = "학습 언어", title, question,
  currentIndex = 0, total = 0, answeredCount = 0,
  selectedOptionId = null, gradedAnswer = null, recentAttempt = null,
  incorrectQuestionCount = 0, sessionMode = "all", scopeControls = "",
  lessonHref = null, lessonTitle = "학습 문서", learningObjective = "",
  relatedConceptTitle = null, otherFeedbackExpanded = false,
  viewMode = "single", gradingMode = "individual", questionStates = null,
} = {}) {
  const safeTotal = Math.max(0, safeInteger(total));
  const safeIndex = Math.min(Math.max(0, safeInteger(currentIndex)), Math.max(0, safeTotal - 1));
  const states = questionStates ?? [{ question, currentIndex: safeIndex, selectedOptionId, gradedAnswer, lessonHref, lessonTitle, learningObjective, relatedConceptTitle, otherFeedbackExpanded }];
  const visibleStates = viewMode === "all" ? states : states.filter((state) => state.currentIndex === safeIndex);
  const pendingCount = states.filter((state) => state.selectedOptionId && !state.gradedAnswer).length;
  const unansweredCount = safeTotal - states.filter((state) => state.selectedOptionId).length;
  return `
    <main class="main-area" id="lesson-content" tabindex="-1">
      <div class="review-container">
        ${scopeControls}
        ${renderQuestionHeader({ languageName, title, currentIndex: safeIndex, total: safeTotal, answeredCount, recentAttempt, incorrectQuestionCount, sessionMode, viewMode })}
        ${renderQuizModeControls({ viewMode, gradingMode, pendingCount, unansweredCount })}
        <div class="quiz-question-list">
          ${visibleStates.map((state) => renderQuizQuestionCard({ ...state, languageId, languageName, total: safeTotal, answeredCount, viewMode, gradingMode })).join("")}
        </div>
        ${viewMode === "all" ? `<div class="quiz-list-result">${gradingMode === "batch" ? `<button class="button button--primary" id="quiz-check-all-end" type="button" data-quiz-check-all${pendingCount ? "" : " disabled"}>답한 ${pendingCount}개 채점</button><p id="quiz-batch-status-end" data-quiz-batch-status tabindex="-1">미채점 선택 ${pendingCount}문항 · 미응답 ${unansweredCount}문항</p>` : ""}<button class="button button--primary" type="button" data-quiz-finish${answeredCount === safeTotal ? "" : " disabled"}>결과 보기</button><p>모든 문제를 채점하면 결과를 확인할 수 있습니다.</p></div>` : ""}
      </div>
    </main>
  `;
}

export function renderQuizResultView({
  title,
  summary,
  persistenceStatus = "saved",
  sessionMode = "all",
  lessonHref = "#",
  scopeControls = "",
  questionResults = [],
  completedAt = null,
} = {}) {
  const correct = Math.max(0, safeInteger(summary?.correct));
  const total = Math.max(0, safeInteger(summary?.total));
  const percent = clampPercent(summary?.percent);
  const incorrectCount = Array.isArray(summary?.incorrectQuestionIds)
    ? summary.incorrectQuestionIds.length
    : Math.max(0, total - correct);
  const hasIncorrect = incorrectCount > 0;
  const persistenceMessage =
    persistenceStatus === "failed"
      ? "결과는 화면에 유지되지만 저장하지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요."
      : persistenceStatus === "memory"
        ? "현재 탭에만 저장되었습니다. 브라우저를 닫으면 이 기록이 사라질 수 있습니다."
        : "최근 결과와 오답 대상에 저장했습니다.";

  return `
    <main class="main-area" id="lesson-content" tabindex="-1">
      <div class="review-container review-result-container">
        ${scopeControls}
        <header class="review-result-header">
          <p class="eyebrow">${sessionMode === "incorrect" ? "오답 다시 풀기 완료" : escapeHtml(title)}</p>
          <h1 id="quiz-result-title" tabindex="-1">복습 결과</h1>
          <p>${completedAt ? `${escapeHtml(completedAt.slice(0, 10))} 저장 당시 결과입니다. 현재 범위에 남아 있는 문항만 표시합니다.` : "모든 문제를 채점했습니다. 결과를 확인하고 다음 연습을 선택하세요."}</p>
        </header>

        <section class="quiz-result-card" aria-labelledby="quiz-result-title">
          <div class="quiz-score" aria-label="복습 점수">
            <strong>${correct}<span>/${total}</span></strong>
            <p>${percent}% 정답</p>
          </div>
          <dl class="quiz-result-stats">
            <div><dt>정답</dt><dd>${correct}문항</dd></div>
            <div><dt>오답</dt><dd>${incorrectCount}문항</dd></div>
            <div><dt>정답률</dt><dd>${percent}%</dd></div>
          </dl>
          <p>이 정답률은 객관식 복습 기록이며, 독립적인 구현 능력이나 완전한 숙련을 뜻하지 않습니다.</p>
          ${questionResults.length ? `<ol class="quiz-result-items">${questionResults.map((result) => `<li><strong>${result.isCorrect ? "정답" : "오답"}</strong> ${renderInlineCodeText(result.prompt)}${renderLessonReference(result)}</li>`).join("")}</ol>` : ""}
          <p class="quiz-persistence-status${persistenceStatus === "saved" ? "" : " is-warning"}" role="status">${persistenceMessage}</p>
          <div class="quiz-result-actions">
            <button class="button button--primary" type="button" data-quiz-retry="${hasIncorrect ? "incorrect" : "all"}">${hasIncorrect ? "오답 다시 풀기" : "전체 다시 풀기"}</button>
            <a class="button button--secondary" href="#/review">다른 문제 찾기</a>
          </div>
        </section>
      </div>
    </main>
  `;
}
