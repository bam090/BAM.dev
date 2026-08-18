import { escapeHtml, renderHighlightedCode } from "./markdown.js";

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
        <span>문제 <strong>${questionNumber}/${safeTotal}</strong></span>
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

function renderOption(option, index, selectedOptionId, gradedAnswer) {
  const isSelected = option.id === selectedOptionId;
  const feedback = gradedAnswer?.feedback?.find((item) => item.optionId === option.id) ?? null;
  const isCorrect = feedback?.isCorrect === true;
  const isSelectedIncorrect = Boolean(gradedAnswer && isSelected && !isCorrect);
  const feedbackId = `quiz-option-feedback-${index}`;
  const inputId = `quiz-option-${index}`;
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
      <input id="${inputId}" type="radio" name="quiz-answer" value="${escapeHtml(option.id)}" data-quiz-option${isSelected ? " checked" : ""}${gradedAnswer ? " disabled" : ""}${feedback ? ` aria-describedby="${feedbackId}"` : ""}>
      <label for="${inputId}">
        <span class="quiz-option-marker" aria-hidden="true">${OPTION_MARKERS[index] ?? index + 1}</span>
        <span class="quiz-option-content">
          <span class="quiz-option-text">${escapeHtml(option.text)}</span>
          ${
            feedback
              ? `<span class="quiz-option-feedback" id="${feedbackId}"><strong>${resultLabel}</strong>${escapeHtml(feedback.message)}</span>`
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
    <section class="quiz-answer-summary ${gradedAnswer.isCorrect ? "is-correct" : "is-incorrect"}" data-quiz-grade-summary tabindex="-1" role="region" aria-labelledby="quiz-answer-summary-title">
      <h3 id="quiz-answer-summary-title">${gradedAnswer.isCorrect ? "정답입니다." : "오답입니다."}</h3>
      <p><strong>정답</strong> ${escapeHtml(correctOption?.text ?? "정답 정보를 확인할 수 없습니다.")}</p>
      <p><strong>정답 설명</strong> ${escapeHtml(explanation?.message ?? "정답 해설을 확인할 수 없습니다.")}</p>
    </section>
  `;
}

export function renderQuizQuestionView({
  languageId = "javascript",
  languageName = "학습 언어",
  title,
  question,
  currentIndex = 0,
  total = 0,
  answeredCount = 0,
  selectedOptionId = null,
  gradedAnswer = null,
  recentAttempt = null,
  incorrectQuestionCount = 0,
  sessionMode = "all",
} = {}) {
  const safeTotal = Math.max(0, safeInteger(total));
  const safeIndex = Math.min(Math.max(0, safeInteger(currentIndex)), Math.max(0, safeTotal - 1));
  const isLastQuestion = safeTotal > 0 && safeIndex === safeTotal - 1;
  const difficulty = DIFFICULTY_LABELS[question?.difficulty] ?? "복습";
  const hasSelection = question?.options?.some((option) => option.id === selectedOptionId) ?? false;
  const isGraded = Boolean(gradedAnswer);

  return `
    <main class="main-area" id="lesson-content" tabindex="-1">
      <div class="review-container">
        ${renderQuestionHeader({
          languageName,
          title,
          currentIndex: safeIndex,
          total: safeTotal,
          answeredCount,
          recentAttempt,
          incorrectQuestionCount,
          sessionMode,
        })}

        <section class="quiz-card" aria-labelledby="quiz-question-title">
          <p class="quiz-question-meta">${difficulty} 문제 · ${safeIndex + 1}/${safeTotal}</p>
          <h2 id="quiz-question-title" tabindex="-1">${escapeHtml(question?.prompt ?? "문제를 불러오지 못했습니다.")}</h2>
          ${renderQuestionCode(question?.code, languageId, languageName)}

          <form class="quiz-form" data-quiz-form>
            <fieldset class="quiz-options">
              <legend>답을 하나 선택하세요.</legend>
              ${(question?.options ?? [])
                .map((option, index) =>
                  renderOption(option, index, selectedOptionId, gradedAnswer),
                )
                .join("")}
            </fieldset>

            ${renderGradedSummary(question, gradedAnswer)}

            <div class="quiz-actions">
              <button class="button button--secondary" type="button" data-quiz-previous${safeIndex === 0 ? " disabled" : ""}>이전 문제</button>
              <button class="button button--primary" type="button" data-quiz-check${!hasSelection || isGraded ? " disabled" : ""}>${isGraded ? "채점 완료" : "정답 확인"}</button>
              <button class="button button--secondary${isGraded ? "" : " is-disabled"}" type="button" data-quiz-next aria-disabled="${String(!isGraded)}"${!isGraded ? ' aria-describedby="quiz-next-help"' : ""}>${isLastQuestion ? "결과 보기" : "다음 문제"}</button>
            </div>
            <p class="quiz-next-help${isGraded ? " is-ready" : ""}" id="quiz-next-help">${isGraded ? "채점을 완료했습니다. 다음 단계로 이동할 수 있습니다." : "정답을 확인한 뒤 다음 문제로 이동할 수 있습니다."}</p>
          </form>
        </section>
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
        <header class="review-result-header">
          <p class="eyebrow">${sessionMode === "incorrect" ? "오답 다시 풀기 완료" : escapeHtml(title)}</p>
          <h1 id="quiz-result-title" tabindex="-1">복습 결과</h1>
          <p>모든 문제를 채점했습니다. 결과를 확인하고 다음 연습을 선택하세요.</p>
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
          <p class="quiz-persistence-status${persistenceStatus === "saved" ? "" : " is-warning"}" role="status">${persistenceMessage}</p>
          <div class="quiz-result-actions">
            <button class="button button--primary" type="button" data-quiz-retry="${hasIncorrect ? "incorrect" : "all"}">${hasIncorrect ? "오답 다시 풀기" : "전체 다시 풀기"}</button>
            <a class="button button--secondary" href="${escapeHtml(lessonHref)}">교안으로 돌아가기</a>
          </div>
        </section>
      </div>
    </main>
  `;
}
