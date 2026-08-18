import { escapeHtml } from "./markdown.js";

const DRAFT_STATUS_MESSAGES = Object.freeze({
  starter: "초기 코드입니다. 입력하면 이 브라우저에 자동 저장됩니다.",
  saved: "초안을 이 브라우저에 저장했습니다.",
  memory: "영구 저장을 사용할 수 없어 현재 탭에만 초안을 보관합니다.",
  failed: "초안을 저장하지 못했습니다. 편집 중인 코드는 화면에 유지됩니다.",
  conflict: "다른 탭의 변경과 충돌해 이 탭의 자동 저장을 멈췄습니다.",
});

const AUTOMATIC_OUTCOME_LABELS = Object.freeze({
  passed: "통과",
  failed: "개선 필요",
  invalid_source: "소스 안전 검사 실패",
  engine_error: "평가 도구 오류",
  cancelled: "검사 취소",
  not_run: "실행하지 않음",
});

function safeCount(value) {
  return Number.isSafeInteger(value) ? Math.max(0, value) : 0;
}

function safeOutcome(value) {
  return typeof value === "string" && Object.hasOwn(AUTOMATIC_OUTCOME_LABELS, value)
    ? value
    : "engine_error";
}

function findFile(files, path) {
  if (!Array.isArray(files)) return null;
  return files.find((file) => file?.path === path) ?? files[0] ?? null;
}

function renderListStatus(status) {
  const submissionCount = safeCount(status?.submissionCount);
  if (submissionCount > 0) return `제출 기록 ${submissionCount}건`;
  if (status?.hasDraft === true) return "초안 저장됨";
  return "시작 전";
}

function renderPersistenceStatus(status) {
  if (status === "saved") return "제출 결과를 이 브라우저에 저장했습니다.";
  if (status === "memory") return "제출 결과를 현재 탭에만 보관합니다.";
  if (status === "failed") return "평가는 완료했지만 제출 기록을 저장하지 못했습니다.";
  return "";
}

export function getWebProjectDraftStatusMessage(status) {
  const normalized =
    typeof status === "string" && Object.hasOwn(DRAFT_STATUS_MESSAGES, status)
      ? status
      : "starter";
  return DRAFT_STATUS_MESSAGES[normalized];
}

export function renderWebProjectNavigationLink({
  href = "#/web-projects",
  isCurrent = false,
  submittedCount = 0,
  totalCount = 0,
} = {}) {
  const safeSubmitted = safeCount(submittedCount);
  const safeTotal = Math.max(safeSubmitted, safeCount(totalCount));
  return `
    <nav class="web-project-nav" aria-label="Web Project 과제">
      <p class="nav-label">프로젝트</p>
      <a class="web-project-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href)}"${isCurrent ? ' aria-current="page"' : ""}>
        <span class="web-project-link-icon" aria-hidden="true">W</span>
        <span><strong>Web Project</strong><small>${safeSubmitted}/${safeTotal} 제출 기록</small></span>
      </a>
    </nav>
  `;
}

export function renderWebProjectLoadingView() {
  return `
    <main class="loading-page" id="lesson-content" tabindex="-1">
      <div class="quiz-state-message" role="status">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p>Web Project 과제를 준비하고 있습니다…</p>
      </div>
    </main>
  `;
}

export function renderWebProjectListView({ title = "Web Project", items = [] } = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const cards = safeItems
    .map(({ project, href, status } = {}) => {
      if (!project) return "";
      return `
        <article class="web-project-card">
          <div class="web-project-card-meta">
            <span>${escapeHtml(project.difficulty ?? "beginner")}</span>
            <span>${safeCount(project.estimatedMinutes)}분</span>
            <span>HTML · CSS</span>
          </div>
          <h2><a href="${escapeHtml(href ?? "#/web-projects")}">${escapeHtml(project.title ?? "Web Project")}</a></h2>
          <p>${escapeHtml(project.summary ?? "")}</p>
          <div class="web-project-card-footer">
            <span class="web-project-status">${renderListStatus(status)}</span>
            <span>자동 70점 · 자가평가 30점</span>
          </div>
        </article>
      `;
    })
    .filter(Boolean)
    .join("");

  return `
    <main class="web-project-list-page" id="lesson-content" tabindex="-1" aria-labelledby="web-project-list-title">
      <header class="web-project-list-header">
        <p class="eyebrow">HTML · CSS 실전 과제</p>
        <h1 id="web-project-list-title">${escapeHtml(title)}</h1>
        <p>배운 개념을 하나의 작은 화면으로 연결하고, 공개 자동 검사와 자가평가로 결과를 점검하세요.</p>
      </header>
      <section class="web-project-list" aria-label="Web Project 목록">
        ${cards || '<p class="empty-message">Web Project 과제가 없습니다.</p>'}
      </section>
    </main>
  `;
}

function renderFileTabs(project, activeFilePath, isRunning) {
  return (project.files ?? [])
    .map((file) => {
      const isActive = file.path === activeFilePath;
      return `<button class="web-project-file-tab${isActive ? " is-active" : ""}" type="button" data-web-project-file-tab="${escapeHtml(file.path)}" aria-pressed="${isActive}"${isRunning ? " disabled" : ""}>${escapeHtml(file.path)}</button>`;
    })
    .join("");
}

function renderManualCriteria(project, assessments, isRunning) {
  const assessmentById = new Map(
    (Array.isArray(assessments) ? assessments : []).map((item) => [item?.criterionId, item]),
  );
  return (project.manualCriteria ?? [])
    .map((criterion) => {
      const selected = assessmentById.get(criterion.id);
      const options = (criterion.scale ?? [])
        .map((level) => {
          const checked =
            selected?.status === "self_assessed" && selected.levelId === level.id;
          return `
            <label class="web-project-manual-option">
              <input type="radio" name="manual-${escapeHtml(criterion.id)}" value="${escapeHtml(level.id)}" data-web-project-manual="${escapeHtml(criterion.id)}"${checked ? " checked" : ""}${isRunning ? " disabled" : ""}>
              <span><strong>${escapeHtml(level.label)}</strong><small>${escapeHtml(level.description)}</small><b>${safeCount(level.points)}점</b></span>
            </label>
          `;
        })
        .join("");
      return `
        <fieldset class="web-project-manual-criterion">
          <legend>${escapeHtml(criterion.title)} <span>${safeCount(criterion.maxPoints)}점</span></legend>
          <p>${escapeHtml(criterion.description)}</p>
          ${options}
        </fieldset>
      `;
    })
    .join("");
}

function renderAutomaticResults(project, report) {
  if (!report) return "";
  const results = Array.isArray(report.criterionResults)
    ? report.criterionResults
    : Array.isArray(report.automaticResults)
      ? report.automaticResults
      : [];
  const resultById = new Map(results.map((result) => [result?.criterionId, result]));
  const score = report.score ?? report.scoreReport ?? null;
  const scoreCriterionById = new Map(
    (Array.isArray(score?.automatic?.criteria) ? score.automatic.criteria : []).map(
      (criterion) => [criterion?.criterionId, criterion],
    ),
  );
  const items = (project.automaticCriteria ?? [])
    .map((criterion) => {
      const result = resultById.get(criterion.id) ?? { outcome: "not_run" };
      const outcome = safeOutcome(result.outcome);
      const message =
        outcome === "passed"
          ? criterion.description
          : result.error?.learnerMessage ?? result.error?.message ?? criterion.failureMessage;
      const criterionScore = scoreCriterionById.get(criterion.id);
      const earnedPoints = Number.isSafeInteger(criterionScore?.earnedPoints)
        ? criterionScore.earnedPoints
        : null;
      const maxPoints = Number.isSafeInteger(criterionScore?.maxPoints)
        ? criterionScore.maxPoints
        : safeCount(criterion.maxPoints);
      return `
        <li class="web-project-result-item is-${escapeHtml(outcome)}">
          <div><strong>${escapeHtml(criterion.title)}</strong><span>${escapeHtml(AUTOMATIC_OUTCOME_LABELS[outcome])} · ${earnedPoints === null ? `미확정/${maxPoints}점` : `${earnedPoints}/${maxPoints}점`}</span></div>
          <p>${escapeHtml(message ?? "평가 결과를 확인하지 못했습니다.")}</p>
        </li>
      `;
    })
    .join("");
  const automaticEarnedPoints = Number.isSafeInteger(score?.automatic?.earnedPoints)
    ? score.automatic.earnedPoints
    : null;
  const automaticMaxPoints = Number.isSafeInteger(score?.automatic?.maxPoints)
    ? score.automatic.maxPoints
    : 70;
  const manualEarnedPoints = Number.isSafeInteger(score?.manual?.earnedPoints)
    ? score.manual.earnedPoints
    : null;
  const manualMaxPoints = Number.isSafeInteger(score?.manual?.maxPoints)
    ? score.manual.maxPoints
    : 30;
  const provisionalScore = Number.isSafeInteger(score?.provisionalScore)
    ? score.provisionalScore
    : null;
  const hasInvalidSource = results.some(
    (result) => safeOutcome(result?.outcome) === "invalid_source",
  );
  return `
    <section class="web-project-results" data-web-project-results tabindex="-1" aria-labelledby="web-project-results-title">
      <div class="web-project-results-heading">
        <div><p class="eyebrow">공개 자동 검사 결과</p><h2 id="web-project-results-title">항목별 피드백</h2></div>
        <strong>${automaticEarnedPoints === null ? `자동 점수 미확정/${automaticMaxPoints}` : `자동 ${automaticEarnedPoints}/${automaticMaxPoints}`} · ${manualEarnedPoints === null ? `자가평가 대기/${manualMaxPoints}` : `자가평가 ${manualEarnedPoints}/${manualMaxPoints}`}${provisionalScore === null ? "" : ` · 임시 총점 ${provisionalScore}/${safeCount(score?.maxPoints)}`}</strong>
      </div>
      ${hasInvalidSource ? '<p class="web-project-submit-warning">소스 안전 검사를 통과해야 제출 기록을 저장할 수 있습니다.</p>' : ""}
      <ul>${items}</ul>
      <p class="web-project-provisional-note">자가평가가 포함된 점수는 확정된 검증 점수가 아닌 임시 점수입니다.</p>
    </section>
  `;
}

export function renderWebProjectView({
  project,
  files = [],
  activeFilePath = "index.html",
  manualAssessments = [],
  isRunning = false,
  cancelRequested = false,
  executionMode = null,
  draftStatus = "starter",
  report = null,
  reportPersistenceStatus = null,
  uiError = null,
  previewSize = "wide",
} = {}) {
  if (!project) return renderWebProjectLoadingView();
  const activeFile = findFile(files, activeFilePath);
  const requirements = (project.requirements ?? [])
    .map((requirement) => `<li>${escapeHtml(requirement)}</li>`)
    .join("");
  const sourceIsEmpty = (files ?? []).some(
    (file) => typeof file?.source !== "string" || file.source.trim().length === 0,
  );
  const persistenceMessage = renderPersistenceStatus(reportPersistenceStatus);
  const runLabel = executionMode === "submit" ? "제출 평가 중…" : "자동 검사 중…";
  return `
    <main class="web-project-page" id="lesson-content" tabindex="-1" aria-labelledby="web-project-title">
      <header class="web-project-header">
        <p class="eyebrow">Web Project · ${safeCount(project.estimatedMinutes)}분</p>
        <h1 id="web-project-title">${escapeHtml(project.title)}</h1>
        <p>${escapeHtml(project.summary)}</p>
      </header>

      <div class="web-project-workspace">
        <aside class="web-project-brief" aria-labelledby="web-project-requirements-title">
          <h2 id="web-project-requirements-title">요구사항</h2>
          <p>${escapeHtml(project.instructions)}</p>
          <ol>${requirements}</ol>
          <p class="web-project-scoring-note">공개 자동 검사 70점 · 자가평가 30점</p>
        </aside>

        <section class="web-project-editor-panel" aria-labelledby="web-project-editor-title">
          <div class="web-project-editor-heading">
            <h2 id="web-project-editor-title">파일 편집</h2>
            <div class="web-project-file-tabs" role="group" aria-label="편집할 파일 선택">${renderFileTabs(project, activeFile?.path, isRunning)}</div>
          </div>
          <label class="sr-only" for="web-project-source">${escapeHtml(activeFile?.path ?? "프로젝트 파일")} 코드</label>
          <textarea id="web-project-source" class="web-project-source" data-web-project-source spellcheck="false" aria-describedby="web-project-draft-status"${isRunning ? " readonly" : ""}>${escapeHtml(activeFile?.source ?? "")}</textarea>
          <div class="web-project-editor-footer">
          <p id="web-project-draft-status" data-web-project-draft-status class="${draftStatus === "failed" || draftStatus === "memory" || draftStatus === "conflict" ? "is-warning" : ""}">${escapeHtml(getWebProjectDraftStatusMessage(draftStatus))}</p>
            <button class="button button--ghost" type="button" data-web-project-reset${isRunning ? " disabled" : ""}>초기 코드로 되돌리기</button>
          </div>
        </section>

        <section class="web-project-preview-panel" aria-labelledby="web-project-preview-title">
          <div class="web-project-preview-heading">
            <h2 id="web-project-preview-title">안전 미리보기</h2>
            <div role="group" aria-label="미리보기 너비">
              <button type="button" data-web-project-preview-size="narrow" aria-pressed="${previewSize === "narrow"}">좁게</button>
              <button type="button" data-web-project-preview-size="wide" aria-pressed="${previewSize !== "narrow"}">넓게</button>
            </div>
          </div>
          <div class="web-project-preview-frame is-${previewSize === "narrow" ? "narrow" : "wide"}">
            <iframe data-web-project-preview title="${escapeHtml(project.title)} 안전 미리보기" sandbox="" referrerpolicy="no-referrer"></iframe>
          </div>
          <p data-web-project-preview-status>스크립트와 외부 요청 없이 HTML과 CSS를 결합해 보여 줍니다.</p>
        </section>

        <section class="web-project-manual" aria-labelledby="web-project-manual-title">
          <h2 id="web-project-manual-title">자가평가</h2>
          <p>직접 미리보기를 관찰한 뒤 가장 가까운 단계를 선택하세요. 선택은 새로고침 후 복원되지 않습니다.</p>
          ${renderManualCriteria(project, manualAssessments, isRunning)}
        </section>

        <section class="web-project-actions" aria-label="Web Project 실행 및 제출">
          ${isRunning ? `<button class="button button--danger" type="button" data-web-project-cancel${cancelRequested ? " disabled" : ""}>${cancelRequested ? "취소하는 중…" : `${runLabel} 취소`}</button>` : `<button class="button button--secondary" type="button" data-web-project-run${sourceIsEmpty ? " disabled" : ""}>공개 자동 검사</button><button class="button button--primary" type="button" data-web-project-submit${sourceIsEmpty ? " disabled" : ""}>제출 및 평가</button>`}
          <p data-web-project-error role="alert" aria-atomic="true">${escapeHtml(uiError ?? "")}</p>
          ${persistenceMessage ? `<p class="web-project-persistence">${escapeHtml(persistenceMessage)}</p>` : ""}
        </section>

        ${renderAutomaticResults(project, report)}
      </div>
    </main>
  `;
}
