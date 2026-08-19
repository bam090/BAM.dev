import { escapeHtml, renderHighlightedCode } from "./markdown.js";

const DIFFICULTY_LABELS = Object.freeze({
  beginner: "입문",
  intermediate: "중급",
  advanced: "심화",
});

const HINT_STAGE_LABELS = Object.freeze({
  concept: "개념",
  observation: "관찰",
  implementation: "구현",
});

const OUTCOME_COPY = Object.freeze({
  passed: {
    label: "통과",
    title: "모든 공개 테스트를 통과했습니다.",
    tone: "success",
  },
  wrong_answer: {
    label: "기대값과 다름",
    title: "일부 공개 테스트의 결과가 기대값과 다릅니다.",
    tone: "danger",
  },
  syntax_error: {
    label: "문법 오류",
    title: "문법 오류로 공개 테스트 실행을 멈췄습니다.",
    tone: "danger",
  },
  runtime_error: {
    label: "실행 오류",
    title: "코드를 실행하는 중 오류가 발생했습니다.",
    tone: "danger",
  },
  timeout: {
    label: "시간 초과",
    title: "공개 테스트 실행 시간이 제한을 넘었습니다.",
    tone: "warning",
  },
  output_limit: {
    label: "출력 한도 초과",
    title: "코드가 출력할 수 있는 한도를 넘었습니다.",
    tone: "warning",
  },
  cancelled: {
    label: "실행 취소",
    title: "공개 테스트 실행을 취소했습니다.",
    tone: "muted",
  },
  engine_error: {
    label: "실행기 오류",
    title: "코드 실행기를 사용할 수 없습니다.",
    tone: "danger",
  },
  not_run: {
    label: "실행하지 않음",
    title: "이 공개 테스트는 실행되지 않았습니다.",
    tone: "muted",
  },
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

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, safeInteger(value)));
}

function formatJsonValue(value) {
  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return "값을 표시할 수 없습니다.";
  }
}

function renderQuestProse(value) {
  const text = String(value ?? "");
  const inlineCodePattern = /`([^`\n]+)`/g;
  let rendered = "";
  let lastIndex = 0;

  for (const match of text.matchAll(inlineCodePattern)) {
    rendered += escapeHtml(text.slice(lastIndex, match.index));
    rendered += `<code>${escapeHtml(match[1])}</code>`;
    lastIndex = match.index + match[0].length;
  }

  return rendered + escapeHtml(text.slice(lastIndex));
}

function getOutcomeCopy(outcome) {
  return OUTCOME_COPY[normalizeOutcome(outcome)];
}

function getErrorMessage(error) {
  if (!error || typeof error !== "object") return "";
  const message = error.learnerMessage ?? error.message;
  return typeof message === "string" ? message : "";
}

function renderValue(label, display) {
  return `
    <div class="quest-result-value">
      <dt>${label}</dt>
      <dd><pre class="syntax-code" tabindex="0" aria-label="${escapeHtml(label)}"><code class="language-json">${renderHighlightedCode(display, "json")}</code></pre></dd>
    </div>
  `;
}

function renderConsoleEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return "";
  return `
    <details class="quest-console">
      <summary>console 출력 ${entries.length}개</summary>
      <ol>
        ${entries
          .map(
            (entry) => `
              <li><strong>${escapeHtml(entry?.method ?? "log")}</strong><code>${escapeHtml(entry?.preview ?? "")}</code></li>
            `,
          )
          .join("")}
      </ol>
    </details>
  `;
}

function renderTestResult(testResult, index, failureByTestId) {
  const outcome = normalizeOutcome(testResult?.outcome);
  const copy = getOutcomeCopy(outcome);
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

  return `
    <article class="quest-test-result is-${copy.tone}" aria-labelledby="quest-test-title-${index}">
      <header>
        <div>
          <span class="quest-outcome-badge">${copy.label}</span>
          <h4 id="quest-test-title-${index}">${escapeHtml(testResult?.label ?? `공개 테스트 ${index + 1}`)}</h4>
        </div>
        <span>${Math.max(0, Number(testResult?.durationMs) || 0)}ms</span>
      </header>
      <dl class="quest-result-values">
        ${renderValue("기대값", expectedDisplay)}
        ${testResult?.hasActual === true ? renderValue("실제값", actualDisplay) : ""}
      </dl>
      ${errorMessage ? `<p class="quest-test-error"><strong>실행 안내</strong>${escapeHtml(errorMessage)}</p>` : ""}
      ${failureExplanation ? `<p class="quest-failure-explanation quest-prose"><strong>학습자 원인</strong>${renderQuestProse(failureExplanation)}</p>` : ""}
      ${renderConsoleEntries(testResult?.console)}
    </article>
  `;
}

function renderReportPersistence(status) {
  if (!status) return "";
  const copy =
    status === "failed"
      ? "결과는 화면에 유지되지만 시도 기록을 저장하지 못했습니다."
      : status === "memory"
        ? "이 시도는 현재 탭에만 저장되었습니다. 탭을 닫으면 기록이 사라질 수 있습니다."
        : "이 시도를 최근 Code Quest 기록에 저장했습니다.";
  const warning = status === "failed" || status === "memory";
  return `<p class="quest-persistence${warning ? " is-warning" : ""}">${copy}</p>`;
}

function renderQuestReport(report, quest, persistenceStatus) {
  if (!report) {
    return `
      <section class="quest-results-empty" aria-labelledby="quest-results-empty-title">
        <h3 id="quest-results-empty-title">공개 테스트 결과</h3>
        <p>코드를 실행하면 ${quest?.publicTests?.length ?? 0}개의 공개 테스트 결과가 표시됩니다.</p>
      </section>
    `;
  }

  const outcome = normalizeOutcome(report.outcome);
  const copy = getOutcomeCopy(outcome);
  const passed = Math.max(0, safeInteger(report.summary?.passed));
  const total = Math.max(0, safeInteger(report.summary?.total));
  const reportError = getErrorMessage(report.error);
  const failureByTestId = new Map(
    (quest?.failureExplanations ?? []).map((item) => [item.testId, item.message]),
  );

  return `
    <section class="quest-results is-${copy.tone}" data-quest-results tabindex="-1" role="region" aria-labelledby="quest-results-title">
      <header>
        <div>
          <p class="quest-result-kicker">마지막 공개 테스트 결과</p>
          <h3 id="quest-results-title">${copy.title}</h3>
        </div>
        <strong>${passed}/${total} 통과</strong>
      </header>
      ${reportError ? `<p class="quest-report-error"><strong>실행 안내</strong>${escapeHtml(reportError)}</p>` : ""}
      <div class="quest-test-results">
        ${(report.tests ?? [])
          .map((testResult, index) => renderTestResult(testResult, index, failureByTestId))
          .join("")}
      </div>
      ${renderReportPersistence(persistenceStatus)}
    </section>
  `;
}

function renderFunctionContract(quest, languageId = "javascript") {
  const contract = quest?.functionContract ?? {};
  const parameters = Array.isArray(contract.parameters) ? contract.parameters : [];
  const constraints = Array.isArray(contract.constraints) ? contract.constraints : [];

  return `
    <section class="quest-section" aria-labelledby="quest-contract-title">
      <p class="quest-section-label">${languageId === "java" ? "정적 메서드" : "함수"} 계약</p>
      <h2 id="quest-contract-title"><code>${escapeHtml(quest?.entryPoint ?? "함수")}</code></h2>
      <dl class="quest-contract-list">
        ${parameters
          .map(
            (parameter) => `
              <div>
                <dt><code>${escapeHtml(parameter.name)}</code> <span>${escapeHtml(parameter.type)}</span></dt>
                <dd class="quest-prose">${renderQuestProse(parameter.description)}</dd>
              </div>
            `,
          )
          .join("")}
        <div>
          <dt>반환 <span>${escapeHtml(contract.returns?.type ?? "")}</span></dt>
          <dd class="quest-prose">${renderQuestProse(contract.returns?.description)}</dd>
        </div>
      </dl>
      <h3>제약 조건</h3>
      <ul class="quest-constraints">
        ${constraints.map((constraint) => `<li class="quest-prose">${renderQuestProse(constraint)}</li>`).join("")}
      </ul>
      <dl class="quest-complexity" aria-label="목표 복잡도">
        <div><dt>시간</dt><dd><code>${escapeHtml(contract.complexity?.time ?? "-")}</code></dd></div>
        <div><dt>공간</dt><dd><code>${escapeHtml(contract.complexity?.space ?? "-")}</code></dd></div>
      </dl>
    </section>
  `;
}

function renderExamples(examples) {
  return `
    <section class="quest-section" aria-labelledby="quest-examples-title">
      <p class="quest-section-label">입출력 확인</p>
      <h2 id="quest-examples-title">예제</h2>
      <div class="quest-examples">
        ${(examples ?? [])
          .map(
            (example, index) => `
              <article>
                <h3>예제 ${index + 1}</h3>
                <dl>
                  ${renderValue("인수", formatJsonValue(example.args))}
                  ${renderValue("기대값", formatJsonValue(example.expected))}
                </dl>
                <p class="quest-prose">${renderQuestProse(example.explanation)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderWebRequirements(quest, evaluationKind) {
  const requirements = Array.isArray(quest?.requirements) ? quest.requirements : [];
  const isCss = evaluationKind === "css-style-v1";

  return `
    <section class="quest-section" aria-labelledby="quest-requirements-title">
      <p class="quest-section-label">작성 조건</p>
      <h2 id="quest-requirements-title">공개 검사 요구사항</h2>
      <ul class="quest-constraints">
        ${requirements.map((requirement) => `<li class="quest-prose">${renderQuestProse(requirement)}</li>`).join("")}
      </ul>
      ${
        isCss
          ? `<div class="quest-fixture">
              <h3>제공 HTML</h3>
              <p>아래 고정 마크업에 작성한 CSS를 적용해 공개 테스트를 실행합니다.</p>
              <pre class="syntax-code" tabindex="0" aria-label="제공 HTML 코드"><code class="language-html">${renderHighlightedCode(quest?.fixtureHtml ?? "", "html")}</code></pre>
            </div>`
          : ""
      }
    </section>
  `;
}

function renderWebExamples(examples, languageId) {
  return `
    <section class="quest-section" aria-labelledby="quest-examples-title">
      <p class="quest-section-label">구조 확인</p>
      <h2 id="quest-examples-title">작성 예시</h2>
      <div class="quest-examples quest-source-examples">
        ${(examples ?? [])
          .map(
            (example, index) => `
              <article>
                <h3>예시 ${index + 1}</h3>
                <pre class="syntax-code" tabindex="0" aria-label="${escapeHtml(languageId)} 작성 예시"><code class="language-${escapeHtml(languageId)}">${renderHighlightedCode(example?.source ?? "", languageId)}</code></pre>
                <p class="quest-prose">${renderQuestProse(example?.explanation)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function getEditorCopy(evaluationKind, languageId, languageName, entryPoint) {
  if (evaluationKind === "html-dom-v1") {
    return {
      label: "HTML 마크업",
      help: "HTML을 직접 작성하세요. 실행하면 코드를 동작시키지 않고 공개된 문서 구조 검사만 수행합니다.",
    };
  }
  if (evaluationKind === "css-style-v1") {
    return {
      label: "CSS 스타일시트",
      help: "CSS를 직접 작성하세요. 실행하면 제공된 고정 HTML에 적용해 공개된 규칙·스타일 검사만 수행합니다.",
    };
  }
  if (languageId === "java") {
    return {
      label: `Solution.${entryPoint || "메서드"} 정적 메서드 코드`,
      help: "public class Solution과 public static 메서드를 포함한 Java 코드를 작성하세요. 실행하면 로컬 Java 채점기가 화면에 공개된 테스트만 평가합니다.",
    };
  }
  return {
    label: `${entryPoint || "함수"} 함수 코드`,
    help: `함수 선언을 포함한 ${languageName} 코드를 작성하세요. 실행하면 화면에 공개된 테스트만 평가합니다.`,
  };
}

function renderHints(quest, visibleHintCount) {
  const hints = Array.isArray(quest?.hints) ? quest.hints : [];
  const visibleCount = clamp(visibleHintCount, 0, hints.length);
  const visibleHints = hints.slice(0, visibleCount);
  const hasMore = visibleCount < hints.length;
  const nextLevel = visibleCount + 1;

  return `
    <section class="quest-section quest-hints" aria-labelledby="quest-hints-title">
      <p class="quest-section-label">막혔을 때</p>
      <h2 id="quest-hints-title">단계별 힌트</h2>
      <p>필요한 만큼만 열어 보고 먼저 자신의 말로 다음 단계를 설명해 보세요.</p>
      ${
        visibleHints.length > 0
          ? `<div class="quest-hint-list" id="quest-hint-list">${visibleHints
              .map(
                (hint, index) => `
                  <article class="quest-hint" data-quest-hint tabindex="-1" role="region" aria-labelledby="quest-hint-title-${index}">
                    <p>${index + 1}단계 · ${HINT_STAGE_LABELS[hint.stage] ?? "힌트"}</p>
                    <h3 class="quest-prose" id="quest-hint-title-${index}">${renderQuestProse(hint.title)}</h3>
                    <p class="quest-prose">${renderQuestProse(hint.content)}</p>
                  </article>
                `,
              )
              .join("")}</div>`
          : '<p class="quest-hint-empty" id="quest-hint-list">아직 공개한 힌트가 없습니다.</p>'
      }
      <button class="button button--secondary" type="button" data-quest-show-hint aria-controls="quest-hint-list"${hasMore ? "" : " disabled"}>
        ${hasMore ? `힌트 ${nextLevel} 보기` : "모든 힌트를 확인했습니다"}
      </button>
    </section>
  `;
}

function renderPaginationItem(item, direction) {
  if (!item) return '<span class="pagination-spacer" aria-hidden="true"></span>';
  const isPrevious = direction === "previous";
  return `
    <a class="pagination-link pagination-link--${direction}" href="${escapeHtml(item.href ?? "#")}">
      <span aria-hidden="true">${isPrevious ? "←" : "→"}</span>
      <span><small>${isPrevious ? "이전 Quest" : "다음 Quest"}</small><strong>${escapeHtml(item.title ?? "Code Quest")}</strong></span>
    </a>
  `;
}

export function getCodeQuestDraftStatusMessage(status) {
  return DRAFT_STATUS_COPY[normalizeDraftStatus(status)];
}

export function renderCodeQuestNavigationLink({
  href,
  isCurrent = false,
  completedCount = 0,
  totalCount = 0,
} = {}) {
  const completed = Math.max(0, safeInteger(completedCount));
  const total = Math.max(completed, safeInteger(totalCount));
  return `
    <nav class="quest-nav" aria-label="Code Quest">
      <p class="nav-label">코드 연습</p>
      <a class="quest-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href ?? "#")}"${isCurrent ? ' aria-current="page"' : ""}>
        <span class="quest-link-icon" aria-hidden="true">&lt;/&gt;</span>
        <span><strong>Code Quest</strong><small>${completed}/${total} 완료 · 공개 테스트</small></span>
      </a>
    </nav>
  `;
}

export function renderCodeQuestLoadingView({ languageName = "학습 언어" } = {}) {
  return `
    <main class="loading-page" id="lesson-content" tabindex="-1">
      <div class="quest-state-message" role="status">
        <span class="brand-mark" aria-hidden="true">B</span>
        <p><strong>${escapeHtml(languageName)}</strong> Code Quest를 준비하고 있습니다…</p>
      </div>
    </main>
  `;
}

export function renderCodeQuestView({
  languageId = "javascript",
  languageName = "학습 언어",
  collectionTitle = "Code Quest",
  evaluationKind = "javascript-function-v1",
  quest,
  currentIndex = 0,
  total = 0,
  source = "",
  isRunning = false,
  cancelRequested = false,
  draftStatus = "starter",
  uiError = null,
  report = null,
  reportPersistenceStatus = null,
  visibleHintCount = 0,
  isCompleted = false,
  previous = null,
  next = null,
} = {}) {
  const safeTotal = Math.max(0, safeInteger(total));
  const safeIndex = clamp(currentIndex, 0, Math.max(0, safeTotal - 1));
  const difficulty = DIFFICULTY_LABELS[quest?.difficulty] ?? "연습";
  const normalizedDraftStatus = normalizeDraftStatus(draftStatus);
  const editorDisabled = isRunning ? " readonly" : "";
  const runDisabled = isRunning || String(source).trim().length === 0 ? " disabled" : "";
  const isWebQuest = evaluationKind === "html-dom-v1" || evaluationKind === "css-style-v1";
  const sourceLanguage =
    evaluationKind === "html-dom-v1"
      ? "html"
      : evaluationKind === "css-style-v1"
        ? "css"
        : languageId;
  const editorCopy = getEditorCopy(
    evaluationKind,
    languageId,
    languageName,
    quest?.entryPoint,
  );

  return `
    <main class="main-area quest-main" id="lesson-content" tabindex="-1">
      <div class="quest-container">
        <header class="quest-header">
          <div class="eyebrow">
            <span>${escapeHtml(languageName)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(collectionTitle)}</span>
          </div>
          <div class="quest-title-row">
            <div>
              <p>${difficulty} · ${safeIndex + 1}/${safeTotal} Quest · 약 ${Math.max(0, safeInteger(quest?.estimatedMinutes))}분</p>
              <h1 id="quest-title" tabindex="-1">${escapeHtml(quest?.title ?? "Code Quest")}</h1>
            </div>
            <span class="quest-completion-badge${isCompleted ? " is-complete" : ""}">${isCompleted ? "완료" : "도전 중"}</span>
          </div>
          <p class="quest-summary quest-prose">${renderQuestProse(quest?.summary)}</p>
        </header>

        <div class="quest-workspace">
          <article class="quest-brief-panel">
            <section class="quest-section" aria-labelledby="quest-instructions-title">
              <p class="quest-section-label">문제</p>
              <h2 id="quest-instructions-title">구현 목표</h2>
              <p class="quest-prose">${renderQuestProse(quest?.instructions)}</p>
            </section>
            ${isWebQuest ? renderWebRequirements(quest, evaluationKind) : renderFunctionContract(quest, languageId)}
            ${isWebQuest ? renderWebExamples(quest?.examples, sourceLanguage) : renderExamples(quest?.examples)}
            ${renderHints(quest, visibleHintCount)}
          </article>

          <section class="quest-run-panel" aria-labelledby="quest-editor-title" aria-busy="${String(isRunning)}">
            <header>
              <div>
                <p class="quest-section-label">코드 작성</p>
                <h2 id="quest-editor-title">${escapeHtml(languageName)} 편집기</h2>
              </div>
              <span>공개 테스트 ${quest?.publicTests?.length ?? 0}개</span>
            </header>
            <label class="quest-editor-label" id="quest-source-label" for="quest-source">${escapeHtml(editorCopy.label)}</label>
            <div class="quest-editor-shell${isRunning ? " is-readonly" : ""}" data-quest-editor-shell>
              <pre class="quest-source-highlight syntax-code" aria-hidden="true"><code class="language-${escapeHtml(sourceLanguage)}" data-quest-source-highlight>${renderHighlightedCode(source, sourceLanguage)}</code></pre>
              <textarea id="quest-source" data-quest-source aria-labelledby="quest-source-label" aria-describedby="quest-draft-status quest-editor-help" rows="20" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off"${editorDisabled}>${escapeHtml(source)}</textarea>
            </div>
            <p class="quest-editor-help" id="quest-editor-help">${escapeHtml(editorCopy.help)}</p>
            <p class="quest-draft-status${normalizedDraftStatus === "failed" || normalizedDraftStatus === "memory" ? " is-warning" : ""}" id="quest-draft-status" data-quest-draft-status>${getCodeQuestDraftStatusMessage(normalizedDraftStatus)}</p>
            <div class="quest-run-actions">
              <button class="button button--primary" type="button" data-quest-run aria-busy="${String(isRunning)}"${runDisabled}>${isRunning ? "실행 중…" : "공개 테스트 실행"}</button>
              ${isRunning ? `<button class="button button--danger" type="button" data-quest-cancel${cancelRequested ? " disabled" : ""}>${cancelRequested ? "취소하는 중…" : "실행 취소"}</button>` : '<button class="button button--secondary" type="button" data-quest-reset>초기 코드로 되돌리기</button>'}
            </div>
            <div class="quest-inline-error" data-quest-error role="alert">${uiError ? escapeHtml(uiError) : ""}</div>
            ${renderQuestReport(report, quest, reportPersistenceStatus)}
          </section>
        </div>

        <nav class="lesson-pagination quest-pagination" aria-label="이전 및 다음 Code Quest">
          ${renderPaginationItem(previous, "previous")}
          ${renderPaginationItem(next, "next")}
        </nav>
      </div>
    </main>
  `;
}
