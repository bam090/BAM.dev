import { escapeHtml } from "./markdown.js";

const DIFFICULTY_LABELS = Object.freeze({
  beginner: "입문",
  intermediate: "중급",
  advanced: "심화",
});

const TYPE_LABELS = Object.freeze({
  array: "배열",
  condition: "조건",
  implementation: "구현",
  object: "객체",
  search: "탐색",
  simulation: "시뮬레이션",
  sorting: "정렬",
  string: "문자열",
});

const OUTCOME_COPY = Object.freeze({
  passed: { label: "통과", tone: "success" },
  wrong_answer: { label: "기대값과 다름", tone: "danger" },
  syntax_error: { label: "문법 오류", tone: "danger" },
  runtime_error: { label: "실행 오류", tone: "danger" },
  timeout: { label: "시간 초과", tone: "warning" },
  output_limit: { label: "출력 한도 초과", tone: "warning" },
  cancelled: { label: "실행 취소", tone: "muted" },
  engine_error: { label: "실행기 오류", tone: "danger" },
  not_run: { label: "실행하지 않음", tone: "muted" },
});

const DRAFT_STATUS_COPY = Object.freeze({
  starter: "초기 코드를 불러왔습니다. 편집하면 자동으로 저장됩니다.",
  saved: "초안을 이 브라우저에 저장했습니다.",
  memory: "초안이 현재 탭에만 저장되었습니다. 탭을 닫으면 사라질 수 있습니다.",
  failed: "초안을 저장하지 못했습니다. 코드는 편집기에 그대로 유지됩니다.",
});

function normalizeOutcome(outcome) {
  return typeof outcome === "string" && Object.hasOwn(OUTCOME_COPY, outcome)
    ? outcome
    : "engine_error";
}

function normalizeDraftStatus(status) {
  return typeof status === "string" && Object.hasOwn(DRAFT_STATUS_COPY, status)
    ? status
    : "starter";
}

function safeInteger(value, fallback = 0) {
  return Number.isSafeInteger(value) ? value : fallback;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function toIdSet(value) {
  if (value instanceof Set) return new Set([...value].filter((item) => typeof item === "string"));
  return new Set(toStringArray(value));
}

function formatJsonValue(value) {
  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return "값을 표시할 수 없습니다.";
  }
}

function getErrorMessage(error) {
  if (!error || typeof error !== "object") return "";
  const message = error.learnerMessage ?? error.message;
  return typeof message === "string" ? message : "";
}

function getDifficultyLabel(value) {
  return DIFFICULTY_LABELS[value] ?? "연습";
}

function normalizeOption(option) {
  if (typeof option === "string") {
    return { value: option, label: TYPE_LABELS[option] ?? option };
  }
  if (!option || typeof option !== "object") return null;
  const value = typeof option.value === "string" ? option.value : option.id;
  const label = typeof option.label === "string" ? option.label : option.name;
  if (typeof value !== "string" || value.length === 0) return null;
  return {
    value,
    label: typeof label === "string" && label.length > 0 ? label : TYPE_LABELS[value] ?? value,
  };
}

function normalizeOptions(options) {
  const normalized = [];
  const seen = new Set();
  for (const option of Array.isArray(options) ? options : []) {
    const item = normalizeOption(option);
    if (!item || seen.has(item.value)) continue;
    seen.add(item.value);
    normalized.push(item);
  }
  return normalized;
}

function renderSelectOptions(options, selectedValue, allLabel) {
  const selected = typeof selectedValue === "string" ? selectedValue : "all";
  return [
    `<option value="all"${selected === "all" ? " selected" : ""}>${escapeHtml(allLabel)}</option>`,
    ...normalizeOptions(options).map(
      (option) =>
        `<option value="${escapeHtml(option.value)}"${selected === option.value ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
    ),
  ].join("");
}

function getHref(problemId, hrefByProblemId) {
  let href = "#";
  if (hrefByProblemId instanceof Map) {
    href = hrefByProblemId.get(problemId) ?? href;
  } else if (hrefByProblemId && typeof hrefByProblemId === "object") {
    const descriptor = Object.getOwnPropertyDescriptor(hrefByProblemId, problemId);
    if (descriptor && "value" in descriptor) href = descriptor.value;
  }
  return typeof href === "string" ? href : "#";
}

function getTypeLabel(type, typeOptions = []) {
  const match = normalizeOptions(typeOptions).find((option) => option.value === type);
  return match?.label ?? TYPE_LABELS[type] ?? String(type || "유형 미지정");
}

function renderProblemCard(problem, index, options) {
  const solvedIds = options.solvedIds;
  const isSolved = solvedIds.has(problem?.id);
  const tags = toStringArray(problem?.tags);
  const conceptIds = toStringArray(problem?.conceptIds);
  const visibleTags = tags.length > 0 ? tags : conceptIds;
  const problemOrder = Math.max(1, safeInteger(problem?.order, index + 1));
  const href = getHref(problem?.id, options.hrefByProblemId);

  return `
    <li class="coding-test-list-item">
      <article class="coding-test-card${isSolved ? " is-solved" : ""}" aria-labelledby="coding-test-card-title-${index}">
        <div class="coding-test-card-meta">
          <span>문제 ${problemOrder}</span>
          <span>${escapeHtml(getDifficultyLabel(problem?.difficulty))}</span>
          <span>${escapeHtml(options.languageName)}</span>
          <span>${escapeHtml(getTypeLabel(problem?.type, options.typeOptions))}</span>
        </div>
        <div class="coding-test-card-heading">
          <div>
            <h2 id="coding-test-card-title-${index}"><a data-coding-test-link href="${escapeHtml(href)}">${escapeHtml(problem?.title ?? "제목 없는 문제")}</a></h2>
            <p>${escapeHtml(problem?.summary ?? "")}</p>
          </div>
          <span class="coding-test-status${isSolved ? " is-solved" : ""}" data-coding-test-status>${isSolved ? "풀이 완료" : "미풀이"}</span>
        </div>
        ${
          visibleTags.length > 0
            ? `<ul class="coding-test-tags" aria-label="문제 주제">${visibleTags
                .map((tag) => `<li>${escapeHtml(tag)}</li>`)
                .join("")}</ul>`
            : ""
        }
        <p class="coding-test-card-time">예상 풀이 시간 ${Math.max(0, safeInteger(problem?.estimatedMinutes))}분</p>
      </article>
    </li>
  `;
}

function renderResultValue(label, display) {
  return `
    <div class="coding-test-result-value">
      <dt>${escapeHtml(label)}</dt>
      <dd><pre tabindex="0"><code>${escapeHtml(display)}</code></pre></dd>
    </div>
  `;
}

function renderConsoleEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return "";
  return `
    <details class="coding-test-console">
      <summary>console 출력 ${entries.length}개</summary>
      <ol>
        ${entries
          .map(
            (entry) =>
              `<li><strong>${escapeHtml(entry?.method ?? "log")}</strong><code>${escapeHtml(entry?.preview ?? "")}</code></li>`,
          )
          .join("")}
      </ol>
    </details>
  `;
}

function getOutcomeTitle(outcome, mode) {
  const submission = mode === "submit";
  const copy = {
    passed: submission
      ? "제출 채점을 통과했습니다."
      : "실행 테스트를 모두 통과했습니다.",
    wrong_answer: submission
      ? "제출 채점에서 통과하지 못한 테스트가 있습니다."
      : "일부 실행 테스트의 결과가 기대값과 다릅니다.",
    syntax_error: "문법 오류로 테스트 실행을 멈췄습니다.",
    runtime_error: "코드를 실행하는 중 오류가 발생했습니다.",
    timeout: "테스트 실행 시간이 제한을 넘었습니다.",
    output_limit: "코드가 출력할 수 있는 한도를 넘었습니다.",
    cancelled: "테스트 실행을 취소했습니다.",
    engine_error: "코드 실행기를 사용할 수 없습니다.",
    not_run: "테스트가 실행되지 않았습니다.",
  };
  return copy[outcome] ?? copy.engine_error;
}

function renderTestResult(testResult, index, failureByTestId) {
  const outcome = normalizeOutcome(testResult?.outcome);
  const copy = OUTCOME_COPY[outcome];
  const errorMessage = getErrorMessage(testResult?.error);
  const failureExplanation =
    outcome === "wrong_answer" ? failureByTestId.get(testResult?.testId) : null;
  const expectedDisplay =
    typeof testResult?.expectedDisplay === "string"
      ? testResult.expectedDisplay
      : formatJsonValue(testResult?.expected);
  const actualDisplay =
    typeof testResult?.actualDisplay === "string"
      ? testResult.actualDisplay
      : formatJsonValue(testResult?.actual);
  const duration = Math.max(0, Number(testResult?.durationMs) || 0);

  return `
    <article class="coding-test-case is-${copy.tone}" aria-labelledby="coding-test-case-title-${index}">
      <header>
        <div>
          <span class="coding-test-outcome">${copy.label}</span>
          <h4 id="coding-test-case-title-${index}">${escapeHtml(testResult?.label ?? `공개 테스트 ${index + 1}`)}</h4>
        </div>
        <span>${duration}ms</span>
      </header>
      <dl class="coding-test-result-values">
        ${renderResultValue("기대값", expectedDisplay)}
        ${testResult?.hasActual === true ? renderResultValue("실제값", actualDisplay) : ""}
      </dl>
      ${errorMessage ? `<p class="coding-test-test-error"><strong>실행 안내</strong>${escapeHtml(errorMessage)}</p>` : ""}
      ${failureExplanation ? `<p class="coding-test-failure-explanation"><strong>확인할 점</strong>${escapeHtml(failureExplanation)}</p>` : ""}
      ${renderConsoleEntries(testResult?.console)}
    </article>
  `;
}

function renderPersistenceStatus(status, mode) {
  if (mode !== "submit" || !status) return "";
  const copy =
    status === "failed"
      ? "제출 결과는 화면에 유지되지만 시도 기록을 저장하지 못했습니다."
      : status === "memory"
        ? "이 제출은 현재 탭에만 저장되었습니다. 탭을 닫으면 기록이 사라질 수 있습니다."
        : "이 제출 결과를 최근 코딩테스트 기록에 저장했습니다.";
  const warning = status === "failed" || status === "memory";
  return `<p class="coding-test-persistence${warning ? " is-warning" : ""}">${copy}</p>`;
}

function renderExecutionReport({ problem, report, mode, persistenceStatus, isRunning }) {
  const runCount = toStringArray(problem?.runTestIds).length;
  const submitCount = Array.isArray(problem?.publicTests) ? problem.publicTests.length : 0;

  if (isRunning) {
    return `<p class="coding-test-results-state">${mode === "submit" ? "제출 테스트를 채점하고 있습니다…" : "실행 테스트를 확인하고 있습니다…"}</p>`;
  }
  if (!report) {
    return `<p class="coding-test-results-state">코드를 실행하면 ${runCount}개 실행 테스트를 확인할 수 있습니다. 제출 시에는 브라우저에 포함된 공개 테스트 ${submitCount}개를 모두 채점합니다.</p>`;
  }

  const outcome = normalizeOutcome(report?.outcome);
  const copy = OUTCOME_COPY[outcome];
  const passed = Math.max(0, safeInteger(report?.summary?.passed));
  const total = Math.max(0, safeInteger(report?.summary?.total));
  const reportError = getErrorMessage(report?.error);
  const failureByTestId = new Map(
    (Array.isArray(problem?.failureExplanations) ? problem.failureExplanations : [])
      .filter((item) => item && typeof item.testId === "string")
      .map((item) => [item.testId, item.message]),
  );

  return `
    <div class="coding-test-report is-${copy.tone}">
      <header>
        <div>
          <p class="coding-test-result-mode" data-coding-test-result-mode>${mode === "submit" ? "마지막 제출 채점 결과" : "마지막 실행 테스트 결과"}</p>
          <h3>${escapeHtml(getOutcomeTitle(outcome, mode))}</h3>
        </div>
        <strong>${passed}/${total} 통과</strong>
      </header>
      ${reportError ? `<p class="coding-test-report-error"><strong>실행 안내</strong>${escapeHtml(reportError)}</p>` : ""}
      <div class="coding-test-case-list">
        ${(Array.isArray(report?.tests) ? report.tests : [])
          .map((testResult, index) => renderTestResult(testResult, index, failureByTestId))
          .join("")}
      </div>
      ${renderPersistenceStatus(persistenceStatus, mode)}
    </div>
  `;
}

function renderFunctionContract(problem) {
  const contract = problem?.functionContract ?? {};
  const parameters = Array.isArray(contract.parameters) ? contract.parameters : [];
  const constraints = toStringArray(contract.constraints);
  const returns = contract.returns ?? {};

  return `
    <section class="coding-test-section" aria-labelledby="coding-test-contract-title">
      <p class="coding-test-section-label">입력과 출력</p>
      <h2 id="coding-test-contract-title"><code>${escapeHtml(problem?.entryPoint ?? "함수")}</code> 함수 계약</h2>
      <dl class="coding-test-contract-list">
        ${parameters
          .map(
            (parameter) => `
              <div>
                <dt>입력 <code>${escapeHtml(parameter?.name ?? "인수")}</code> <span>${escapeHtml(parameter?.type ?? "")}</span></dt>
                <dd>${escapeHtml(parameter?.description ?? "")}</dd>
              </div>
            `,
          )
          .join("")}
        <div>
          <dt>출력 <span>${escapeHtml(returns?.type ?? "")}</span></dt>
          <dd>${escapeHtml(returns?.description ?? "")}</dd>
        </div>
      </dl>
      <h3>제한사항</h3>
      <ul class="coding-test-constraints">
        ${constraints.map((constraint) => `<li>${escapeHtml(constraint)}</li>`).join("")}
      </ul>
      <dl class="coding-test-complexity" aria-label="목표 복잡도">
        <div><dt>시간</dt><dd><code>${escapeHtml(contract.complexity?.time ?? "-")}</code></dd></div>
        <div><dt>공간</dt><dd><code>${escapeHtml(contract.complexity?.space ?? "-")}</code></dd></div>
      </dl>
    </section>
  `;
}

function renderExamples(examples) {
  return `
    <section class="coding-test-section" aria-labelledby="coding-test-examples-title">
      <p class="coding-test-section-label">입출력 예</p>
      <h2 id="coding-test-examples-title">예제와 설명</h2>
      <div class="coding-test-examples">
        ${(Array.isArray(examples) ? examples : [])
          .map(
            (example, index) => `
              <article>
                <h3>예제 ${index + 1}</h3>
                <dl class="coding-test-result-values">
                  ${renderResultValue("입력 인수", formatJsonValue(example?.args))}
                  ${renderResultValue("출력", formatJsonValue(example?.expected))}
                </dl>
                <p>${escapeHtml(example?.explanation ?? "")}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function getCodingTestDraftStatusMessage(status) {
  return DRAFT_STATUS_COPY[normalizeDraftStatus(status)];
}

export function renderCodingTestNavigationLink({
  href,
  isCurrent = false,
  solvedCount = 0,
  totalCount = 0,
} = {}) {
  const solved = Math.max(0, safeInteger(solvedCount));
  const total = Math.max(solved, safeInteger(totalCount));
  return `
    <nav class="coding-test-nav" aria-label="코딩테스트">
      <p class="nav-label">실전 연습</p>
      <a class="coding-test-nav-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href ?? "#")}"${isCurrent ? ' aria-current="page"' : ""}>
        <span class="coding-test-nav-icon" aria-hidden="true">CT</span>
        <span><strong>코딩테스트</strong><small>${solved}/${total} 풀이 완료</small></span>
      </a>
    </nav>
  `;
}

export function renderCodingTestLoadingView({ title = "코딩테스트" } = {}) {
  return `
    <main class="loading-page" id="lesson-content" tabindex="-1">
      <div class="coding-test-state-message" role="status">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p><strong>${escapeHtml(title)}</strong> 문제를 준비하고 있습니다…</p>
      </div>
    </main>
  `;
}

export function renderCodingTestListView({
  title = "JavaScript 코딩테스트",
  problems = [],
  totalCount,
  filters = {},
  languageName = "JavaScript",
  languageOptions = [{ value: "javascript", label: "JavaScript" }],
  typeOptions = [],
  solvedProblemIds = [],
  hrefByProblemId = {},
} = {}) {
  const visibleProblems = Array.isArray(problems) ? problems : [];
  const safeTotal = Math.max(visibleProblems.length, safeInteger(totalCount, visibleProblems.length));
  const query = typeof filters.query === "string" ? filters.query : "";
  const difficultyOptions = Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const derivedTypeOptions =
    normalizeOptions(typeOptions).length > 0
      ? typeOptions
      : [...new Set(visibleProblems.map((problem) => problem?.type).filter(Boolean))];
  const solvedIds = toIdSet(solvedProblemIds);

  return `
    <main class="main-area coding-test-list-main" id="lesson-content" tabindex="-1">
      <div class="coding-test-list-container">
        <header class="coding-test-list-header">
          <div class="eyebrow"><span>문제를 분석하고 직접 구현하기</span></div>
          <h1 id="coding-test-list-title" tabindex="-1">${escapeHtml(title)}</h1>
          <p>학습한 개념을 문제에 적용하고 실행 결과를 관찰해 보세요.</p>
        </header>

        <section class="coding-test-filters" aria-labelledby="coding-test-filters-title" data-coding-test-filters>
          <h2 class="sr-only" id="coding-test-filters-title">코딩테스트 검색과 필터</h2>
          <label class="coding-test-search-label" for="coding-test-search">
            <span>문제 검색</span>
            <input id="coding-test-search" data-coding-test-search type="search" value="${escapeHtml(query)}" placeholder="제목, 설명, 개념 검색" autocomplete="off">
          </label>
          <div class="coding-test-filter-grid">
            <label for="coding-test-difficulty"><span>난이도</span><select id="coding-test-difficulty" data-coding-test-filter="difficulty">${renderSelectOptions(difficultyOptions, filters.difficulty, "전체 난이도")}</select></label>
            <label for="coding-test-language"><span>언어</span><select id="coding-test-language" data-coding-test-filter="language">${renderSelectOptions(languageOptions, filters.language, "전체 언어")}</select></label>
            <label for="coding-test-type"><span>문제 유형</span><select id="coding-test-type" data-coding-test-filter="type">${renderSelectOptions(derivedTypeOptions, filters.type, "전체 유형")}</select></label>
            <label for="coding-test-status"><span>풀이 여부</span><select id="coding-test-status" data-coding-test-filter="status">${renderSelectOptions(
              [
                { value: "solved", label: "풀이 완료" },
                { value: "unsolved", label: "미풀이" },
              ],
              filters.status,
              "전체 상태",
            )}</select></label>
          </div>
          <button class="button button--secondary coding-test-filter-reset" type="button" data-coding-test-filter-reset>필터 초기화</button>
        </section>

        <div class="coding-test-list-summary">
          <p data-coding-test-count>전체 ${safeTotal}문제 중 ${visibleProblems.length}문제</p>
          <p>${solvedIds.size}문제 풀이 완료</p>
        </div>

        ${
          visibleProblems.length > 0
            ? `<ol class="coding-test-list" data-coding-test-list>${visibleProblems
                .map((problem, index) =>
                  renderProblemCard(problem, index, {
                    solvedIds,
                    hrefByProblemId,
                    languageName,
                    typeOptions: derivedTypeOptions,
                  }),
                )
                .join("")}</ol>`
            : `<section class="coding-test-empty" data-coding-test-empty aria-labelledby="coding-test-empty-title"><h2 id="coding-test-empty-title">조건에 맞는 문제가 없습니다.</h2><p>검색어나 필터를 바꾸거나 초기화해 보세요.</p></section>`
        }
      </div>
    </main>
  `;
}

export function renderCodingTestView({
  languageName = "JavaScript",
  collectionTitle = "JavaScript 코딩테스트",
  listHref = "#/coding-tests",
  problem,
  source = "",
  isRunning = false,
  cancelRequested = false,
  executionMode = null,
  draftStatus = "starter",
  uiError = null,
  report = null,
  reportPersistenceStatus = null,
  isSolved = false,
} = {}) {
  const mode = executionMode === "submit" ? "submit" : "run";
  const normalizedDraftStatus = normalizeDraftStatus(draftStatus);
  const sourceIsEmpty = String(source).trim().length === 0;
  const actionsDisabled = isRunning || sourceIsEmpty ? " disabled" : "";
  const editorReadonly = isRunning ? " readonly" : "";
  const typeLabel = getTypeLabel(problem?.type);
  const publicTestCount = Array.isArray(problem?.publicTests) ? problem.publicTests.length : 0;
  const runTestCount = toStringArray(problem?.runTestIds).length;

  return `
    <main class="main-area coding-test-main" id="lesson-content" tabindex="-1">
      <div class="coding-test-container">
        <header class="coding-test-header">
          <a class="coding-test-back-link" href="${escapeHtml(listHref)}">← 문제 목록</a>
          <div class="eyebrow">
            <span>${escapeHtml(languageName)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(collectionTitle)}</span>
          </div>
          <div class="coding-test-title-row">
            <div>
              <p>${escapeHtml(getDifficultyLabel(problem?.difficulty))} · ${escapeHtml(typeLabel)} · 약 ${Math.max(0, safeInteger(problem?.estimatedMinutes))}분</p>
              <h1 id="coding-test-title" tabindex="-1">${escapeHtml(problem?.title ?? "코딩테스트 문제")}</h1>
            </div>
            <span class="coding-test-solved-badge${isSolved ? " is-solved" : ""}">${isSolved ? "풀이 완료" : "미풀이"}</span>
          </div>
          <p class="coding-test-summary">${escapeHtml(problem?.summary ?? "")}</p>
        </header>

        <div class="coding-test-workspace">
          <article class="coding-test-problem-panel" aria-labelledby="coding-test-description-title">
            <section class="coding-test-section">
              <p class="coding-test-section-label">문제 설명</p>
              <h2 id="coding-test-description-title">구현할 기능</h2>
              <p class="coding-test-description">${escapeHtml(problem?.description ?? "")}</p>
            </section>
            ${renderFunctionContract(problem)}
            ${renderExamples(problem?.examples)}
          </article>

          <div class="coding-test-run-column">
            <section class="coding-test-editor-panel" aria-labelledby="coding-test-editor-title" aria-busy="${String(isRunning)}">
              <header>
                <div>
                  <p class="coding-test-section-label">코드 작성</p>
                  <h2 id="coding-test-editor-title">${escapeHtml(languageName)} 편집기</h2>
                </div>
                <span>실행 ${runTestCount}개 · 제출 ${publicTestCount}개</span>
              </header>
              <label class="coding-test-editor-label" id="coding-test-source-label" for="coding-test-source">${escapeHtml(problem?.entryPoint ?? "함수")} 함수 코드</label>
              <textarea id="coding-test-source" data-coding-test-source aria-labelledby="coding-test-source-label" aria-describedby="coding-test-editor-help coding-test-draft-status" rows="18" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off"${editorReadonly}>${escapeHtml(source)}</textarea>
              <p class="coding-test-editor-help" id="coding-test-editor-help">실행과 제출 채점에 사용하는 모든 테스트는 이 브라우저에 포함된 공개 테스트입니다.</p>
              <p class="coding-test-draft-status${normalizedDraftStatus === "failed" || normalizedDraftStatus === "memory" ? " is-warning" : ""}" id="coding-test-draft-status" data-coding-test-draft-status>${getCodingTestDraftStatusMessage(normalizedDraftStatus)}</p>
              <div class="coding-test-actions">
                <button class="button button--secondary" type="button" data-coding-test-run aria-busy="${String(isRunning && mode === "run")}"${actionsDisabled}>${isRunning && mode === "run" ? "실행 중…" : "테스트 실행"}</button>
                <button class="button button--primary" type="button" data-coding-test-submit aria-busy="${String(isRunning && mode === "submit")}"${actionsDisabled}>${isRunning && mode === "submit" ? "채점 중…" : "제출 및 채점"}</button>
                ${isRunning ? `<button class="button button--danger" type="button" data-coding-test-cancel${cancelRequested ? " disabled" : ""}>${cancelRequested ? "취소하는 중…" : "실행 취소"}</button>` : '<button class="button button--secondary" type="button" data-coding-test-reset>초기 코드로 되돌리기</button>'}
              </div>
              <div class="coding-test-inline-error" data-coding-test-error role="alert">${uiError ? escapeHtml(uiError) : ""}</div>
            </section>

            <section class="coding-test-results-panel" data-coding-test-results tabindex="-1" role="region" aria-labelledby="coding-test-results-title" aria-busy="${String(isRunning)}">
              <header class="coding-test-results-heading">
                <p class="coding-test-section-label">브라우저 공개 채점</p>
                <h2 id="coding-test-results-title">실행 결과</h2>
              </header>
              ${renderExecutionReport({
                problem,
                report,
                mode,
                persistenceStatus: reportPersistenceStatus,
                isRunning,
              })}
            </section>
          </div>
        </div>
      </div>
    </main>
  `;
}
