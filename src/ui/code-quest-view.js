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

const QUEST_PROGRESS_COPY = Object.freeze({
  not_started: "시작 전",
  in_progress: "진행 중",
  previously_completed: "이전 완료",
  completed: "완료",
});

const PUBLIC_ARRAY_PREVIEW_LIMIT = 20;

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

function formatCompactJsonValue(value, showDecimalStringAsNumber = false) {
  if (
    showDecimalStringAsNumber &&
    typeof value === "string" &&
    /^-?\d+$/.test(value)
  ) {
    return value;
  }

  try {
    const serialized = JSON.stringify(value, null, 1);
    return serialized === undefined
      ? String(value)
      : serialized.replace(/\n\s*/g, " ");
  } catch {
    return "값을 표시할 수 없습니다.";
  }
}

function renderCompactJsonValue(value, showDecimalStringAsNumber = false) {
  return `<code class="language-json">${renderHighlightedCode(formatCompactJsonValue(value, showDecimalStringAsNumber), "json")}</code>`;
}

function formatJavaTypedValue(value, type) {
  if (type === "long" && typeof value === "string" && /^(?:0|-?[1-9]\d*)$/.test(value)) {
    return value;
  }
  if (typeof type === "string" && type.endsWith("[]") && Array.isArray(value)) {
    const itemType = type.slice(0, -2);
    return `[${value.map((item) => formatJavaTypedValue(item, itemType)).join(", ")}]`;
  }
  return formatCompactJsonValue(value);
}

function renderJavaTypedValue(value, type) {
  return `<code class="language-json">${renderHighlightedCode(formatJavaTypedValue(value, type), "json")}</code>`;
}

function createArrayPreview(value) {
  if (!Array.isArray(value)) return value;
  return value
    .slice(0, PUBLIC_ARRAY_PREVIEW_LIMIT)
    .map((item) => createArrayPreview(item));
}

function getArrayCountSummary(value, label) {
  const summaries = [];
  const visit = (item, path) => {
    if (!Array.isArray(item)) return;
    summaries.push(`${path} 총 ${item.length}개`);
    item.slice(0, PUBLIC_ARRAY_PREVIEW_LIMIT).forEach((child, index) => {
      if (Array.isArray(child)) visit(child, `${path}[${index}]`);
    });
  };
  visit(value, label);
  return summaries.join(" · ");
}

function containsLongArray(value) {
  return Array.isArray(value) && (
    value.length > PUBLIC_ARRAY_PREVIEW_LIMIT ||
    value.slice(0, PUBLIC_ARRAY_PREVIEW_LIMIT).some((item) => containsLongArray(item))
  );
}

function renderPublicValuePreview(label, value, showDecimalStringAsNumber = false) {
  const countSummary = getArrayCountSummary(value, label);
  const previewLimitCopy = containsLongArray(value)
    ? ` · 처음 ${PUBLIC_ARRAY_PREVIEW_LIMIT}개까지 표시`
    : "";
  return `<div class="quest-public-value">
    <dt><code>${escapeHtml(label)}</code>${countSummary ? `<small>${escapeHtml(countSummary)}${previewLimitCopy}</small>` : ""}</dt>
    <dd>${renderCompactJsonValue(createArrayPreview(value), showDecimalStringAsNumber)}</dd>
  </div>`;
}

export function renderQuestProse(value) {
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

function renderQuestReport(report, quest, persistenceStatus, executionAvailable) {
  if (!report) {
    const unavailableCopy = quest?.executionMode === "draft-only"
      ? "이 draft는 원본 공개 테스트를 읽는 자료이며 앱에서 실행한 결과는 만들지 않습니다."
      : "Java 실행 준비 중이므로 아직 실행 결과가 없습니다. 공개 입력과 기대값은 문제 영역에서 확인할 수 있습니다.";
    return `
      <section class="quest-results-empty" aria-labelledby="quest-results-empty-title">
        <h3 id="quest-results-empty-title">공개 테스트 결과</h3>
        <p>${executionAvailable ? `코드를 실행하면 ${quest?.publicTests?.length ?? 0}개의 공개 테스트 결과가 표시됩니다.` : unavailableCopy}</p>
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

export function renderFunctionContract(quest) {
  const contract = quest?.functionContract ?? {};
  const parameters = Array.isArray(contract.parameters) ? contract.parameters : [];
  const constraints = Array.isArray(contract.constraints) ? contract.constraints : [];

  return `
    <section class="quest-section" aria-labelledby="quest-contract-title">
      <p class="quest-section-label">함수 계약</p>
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

export function renderExamples(quest, evaluationKind) {
  const examples = Array.isArray(quest?.examples) ? quest.examples : [];
  const parameters = Array.isArray(quest?.functionContract?.parameters)
    ? quest.functionContract.parameters
    : [];
  const isJava = evaluationKind === "java-static-method-v1";
  const explanations = examples
    .map((example, index) => ({ example, number: index + 1 }))
    .filter(
      ({ example }) =>
        typeof example?.explanation === "string" && example.explanation.length > 0,
    );

  return `
    <section class="quest-section" aria-labelledby="quest-examples-title">
      <p class="quest-section-label">입출력 확인</p>
      <h2 id="quest-examples-title">예제</h2>
      <div class="quest-example-table-container">
        <table class="quest-example-table">
          <colgroup><col class="quest-example-number-column">${parameters.map(() => "<col>").join("")}<col></colgroup>
          <thead><tr>
            <th scope="col">예제</th>
            ${parameters.map((parameter) => `<th scope="col"><code>${escapeHtml(parameter.name)}</code></th>`).join("")}
            <th scope="col"><code>return</code></th>
          </tr></thead>
          <tbody>${examples.map((example, index) => `<tr>
            <th scope="row">${index + 1}</th>
            ${parameters.map((parameter, parameterIndex) => `<td>${isJava ? renderJavaTypedValue(example.args?.[parameterIndex], parameter.type) : renderCompactJsonValue(example.args?.[parameterIndex])}</td>`).join("")}
            <td>${isJava ? renderJavaTypedValue(example.expected, quest?.functionContract?.returns?.type) : renderCompactJsonValue(example.expected)}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>
      ${explanations.length ? `<h3>예제 설명</h3><ol class="quest-example-explanations">${explanations.map(({ example, number }) => `<li class="quest-prose" value="${number}"><strong>예제 ${number} 설명</strong>${renderQuestProse(example.explanation)}</li>`).join("")}</ol>` : ""}
    </section>
  `;
}

function renderPublicObservations(observations) {
  if (!observations) return "";
  const conditions = [
    observations.argument0Unchanged === true ? "첫 번째 인수의 원본 값 보존" : "",
    observations.returnNotArgument0 === true ? "입력과 다른 새 배열 반환" : "",
  ].filter(Boolean);
  if (!conditions.length) return "";
  return `<div><h4>공개 추가 관찰</h4><ul class="quest-constraints">${conditions.map((condition) => `<li>${condition}</li>`).join("")}</ul></div>`;
}

function renderPublicDataAccess(test, index) {
  const label = test.label ?? `공개 테스트 ${index + 1}`;
  if (containsLongArray(test.args) || containsLongArray(test.expected)) {
    const descriptionId = `quest-public-download-description-${index}`;
    const statusId = `quest-public-download-status-${index}`;
    return `<div>
      <p id="${descriptionId}">전체 공개 원본 JSON에는 인수와 기대값${test.observations ? "·추가 관찰" : ""}이 포함됩니다.</p>
      <button class="button button--secondary" type="button" data-quest-public-download data-quest-test-index="${index}" aria-describedby="${descriptionId} ${statusId}">전체 공개 JSON 다운로드</button>
      <span class="sr-only" id="${statusId}" data-quest-public-download-status role="status" aria-live="polite"></span>
    </div>`;
  }
  return `<details class="quest-console" data-quest-public-data data-quest-test-index="${index}">
    <summary>전체 공개 데이터 보기</summary>
    <textarea data-quest-public-data-output aria-label="${escapeHtml(label)} 전체 공개 데이터" rows="12" cols="60" readonly spellcheck="false" wrap="off"></textarea>
  </details>`;
}

export function renderJavaPublicTests(quest, executionAvailable) {
  const tests = Array.isArray(quest?.publicTests) ? quest.publicTests : [];
  if (!tests.length) return "";
  if (quest?.executionMode === "draft-only") {
    return `<section class="quest-section" aria-labelledby="quest-public-tests-title">
      <p class="quest-section-label">원본 공개 검증 자료</p>
      <h2 id="quest-public-tests-title">공개 테스트 소스</h2>
      <p>아래 코드는 원본 저장소의 공개 테스트입니다. <code>Solution</code> 호출과 assertion은 읽기 자료이며 앱에서 실행한 결과가 아닙니다.</p>
      <details class="quest-public-tests">
        <summary>원본 Test.java 전체 보기</summary>
        <pre class="syntax-code" tabindex="0" aria-label="원본 공개 테스트 전체 소스"><code class="language-java">${renderHighlightedCode(quest.publicTestSource ?? "", "java")}</code></pre>
      </details>
      <div>
        <button class="button button--secondary" type="button" data-quest-public-source-download>원본 Test.java 다운로드</button>
        <span class="sr-only" data-quest-public-source-status role="status" aria-live="polite"></span>
      </div>
      <div class="quest-public-test-list">
        ${tests.map((test, index) => `<details class="quest-console">
          <summary>${index + 1}. ${escapeHtml(test.label ?? `공개 테스트 ${index + 1}`)}</summary>
          <pre class="syntax-code" tabindex="0" aria-label="${escapeHtml(test.label ?? `공개 테스트 ${index + 1}`)} 원본 메서드"><code class="language-java">${renderHighlightedCode(test.assertionSource ?? "", "java")}</code></pre>
        </details>`).join("")}
      </div>
    </section>`;
  }
  const parameters = Array.isArray(quest?.functionContract?.parameters)
    ? quest.functionContract.parameters
    : [];
  const showDecimalStringAsNumber = quest?.functionContract?.returns?.type === "long";
  return `<section class="quest-section" aria-labelledby="quest-public-tests-title">
    <p class="quest-section-label">공개 평가 조건</p>
    <h2 id="quest-public-tests-title">공개 테스트</h2>
    <p>모든 입력과 반환값·추가 확인 조건을 공개합니다.${executionAvailable ? "" : " Java 실행 준비 중이며 이 데이터는 아직 실행된 결과가 아닙니다."}</p>
    <details class="quest-public-tests">
      <summary>공개 테스트 ${tests.length}개 보기</summary>
      <div class="quest-public-test-list">
        ${tests.map((test, index) => `<article>
          <h3>${index + 1}. ${escapeHtml(test.label ?? `공개 테스트 ${index + 1}`)}</h3>
          <dl class="quest-public-values">
            ${(Array.isArray(test.args) ? test.args : []).map((value, parameterIndex) => renderPublicValuePreview(parameters[parameterIndex]?.name ?? `인수 ${parameterIndex + 1}`, value)).join("")}
            ${renderPublicValuePreview("return", test.expected, showDecimalStringAsNumber)}
          </dl>
          ${renderPublicObservations(test.observations)}
          ${renderPublicDataAccess(test, index)}
        </article>`).join("")}
      </div>
    </details>
  </section>`;
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

function getEditorCopy(evaluationKind, languageName, entryPoint) {
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
  if (evaluationKind === "java-static-method-v1") {
    return {
      label: "Solution.java 전체 소스",
      help: "메서드 본문을 완성하세요. 작성 중인 초안은 자동으로 저장됩니다.",
    };
  }
  return {
    label: `${entryPoint || "함수"} 함수 코드`,
    help: `함수 선언을 포함한 ${languageName} 코드를 작성하세요. 실행하면 이 브라우저에서 공개 테스트만 평가합니다.`,
  };
}

function renderHints(quest, visibleHintCount) {
  const hints = Array.isArray(quest?.hints) ? quest.hints : [];
  if (hints.length === 0) {
    return `<section class="quest-section quest-hints" aria-labelledby="quest-hints-title">
      <p class="quest-section-label">막혔을 때</p>
      <h2 id="quest-hints-title">단계별 힌트</h2>
      <p>원본 문제에는 제공된 힌트가 없습니다. 함수 계약과 공개 테스트 소스를 관찰해 보세요.</p>
    </section>`;
  }
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
      <span><small>${escapeHtml(item.label ?? (isPrevious ? "이전 Quest" : "다음 Quest"))}</small><strong>${escapeHtml(item.title ?? "Code Quest")}</strong></span>
    </a>
  `;
}

export function getCodeQuestDraftStatusMessage(status) {
  return DRAFT_STATUS_COPY[normalizeDraftStatus(status)];
}

function renderCatalogProgress(label, completedCount, totalCount, percent) {
  const completed = Math.max(0, safeInteger(completedCount));
  const total = Math.max(completed, safeInteger(totalCount));
  const value = clamp(safeInteger(percent), 0, 100);
  return `<div class="quest-catalog-progress">
    <div><strong>${escapeHtml(label)}</strong><span>${completed}/${total} 완료</span></div>
    <div class="progress-track" role="progressbar" aria-label="${escapeHtml(label)} 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width: ${value}%"></span></div>
  </div>`;
}

function renderQuestProgressBadge(item) {
  const label = QUEST_PROGRESS_COPY[item?.progress] ?? QUEST_PROGRESS_COPY.not_started;
  return `<span class="quest-status quest-status--${escapeHtml(item?.progress ?? "not_started")}">${label}</span>`;
}

function getQuestProgressEvidenceCopy(item) {
  if (item?.progress !== "previously_completed") return "";
  if (
    item.progressEvidence === "older_revision" &&
    Number.isSafeInteger(item.knownPassedRevision) &&
    item.knownPassedRevision > 0
  ) {
    return `문제 버전 ${item.knownPassedRevision}에서 완료`;
  }
  return item.progressEvidence === "legacy_unversioned"
    ? "완료한 문제 버전을 확인할 수 없습니다."
    : "";
}

function isCatalogItemExecutionAvailable(item, javaExecutionAvailable) {
  return item?.languageId !== "java" || (
    javaExecutionAvailable && item?.executionMode !== "draft-only"
  );
}

function getCourseExecutionCount(course, javaExecutionAvailable) {
  return (course?.items ?? []).filter((item) =>
    isCatalogItemExecutionAvailable(item, javaExecutionAvailable)).length;
}

function getCourseAvailabilityCopy(course, javaExecutionAvailable, languageId = course?.languageId) {
  if (languageId !== "java") return `${course?.completedCount ?? 0}/${course?.totalCount ?? 0} 완료`;
  const executableCount = getCourseExecutionCount(course, javaExecutionAvailable);
  return executableCount > 0
    ? `${course.totalCount}개 등록 · ${executableCount}개 실행 가능`
    : `${course.totalCount}개 등록 · 실행 준비 중`;
}

function renderQuestLearningMap(course, javaExecutionAvailable) {
  return `<section class="quest-learning-map" aria-labelledby="quest-map-title">
    <header><p class="eyebrow">실제 콘텐츠 연결</p><h2 id="quest-map-title">학습 지도</h2><p>교안에 선언된 개념과 연결된 Code Quest만 보여 줍니다.</p></header>
    <div class="quest-map-topics">${course.topics.map((topic) => `<article>
      <div><h3>${escapeHtml(topic.title)}</h3><p>${getCourseAvailabilityCopy(topic, javaExecutionAvailable, course.languageId)}</p><a href="${escapeHtml(topic.items[0]?.lessonHref ?? "#")}">관련 학습문서 읽기</a></div>
      <ul>${topic.items.map((item) => `<li><a href="${escapeHtml(item.href)}"><span>${String(item.displayOrder).padStart(2, "0")}</span><strong>${escapeHtml(item.title)}</strong></a><small>${getQuestProgressEvidenceCopy(item) ? `진행 상태: ${getQuestProgressEvidenceCopy(item)}<br>` : ""}연결 개념: ${item.conceptIds.map((conceptId) => `<code>${escapeHtml(conceptId)}</code>`).join(" · ")}</small></li>`).join("")}</ul>
    </article>`).join("")}</div>
  </section>`;
}

export function renderCodeQuestCatalogView({
  catalog,
  course,
  items = [],
  filters = {},
  notice = "",
  javaExecutionAvailable = true,
} = {}) {
  const courses = Array.isArray(catalog?.courses) ? catalog.courses : [];
  if (!course) {
    return `<main class="main-area service-main quest-catalog-main" id="lesson-content" tabindex="-1"><section class="catalog-empty"><h1>Code Quest를 준비하지 못했습니다.</h1><p>사용할 수 있는 과정과 문제 연결을 확인해 주세요.</p></section></main>`;
  }
  const query = String(filters.query ?? "");
  const topicId = filters.topicId ?? "all";
  const status = filters.status ?? "all";
  const number = String(filters.number ?? "");
  const resume = course.resumeItem;
  const executableCount = getCourseExecutionCount(course, javaExecutionAvailable);
  const draftOnlyCount = course.items.filter((item) => item.executionMode === "draft-only").length;
  const javaExecutionPending = course.languageId === "java" && executableCount < course.totalCount;
  const resumeExecutionAvailable = isCatalogItemExecutionAvailable(
    resume,
    javaExecutionAvailable,
  );
  const statusOptions = [
    ["all", "전체"],
    ["not_started", "시작 전"],
    ["in_progress", "진행 중"],
    ["previously_completed", "이전 완료"],
    ["completed", "완료"],
  ];

  return `<main class="main-area service-main quest-catalog-main" id="lesson-content" tabindex="-1">
    <header class="catalog-header quest-catalog-header"><p class="eyebrow">읽은 개념을 짧은 코드로 확인하세요</p><h1>Code Quest</h1><p>과정과 학습 주제를 확인하고, 공개된 실행 기준으로 직접 작성해 보세요.</p></header>
    <nav class="quest-course-tabs" aria-label="Code Quest 과정">${courses.map((item) => `<button type="button" data-quest-course="${escapeHtml(item.id)}" aria-pressed="${String(item.id === course.id)}"${item.id === course.id ? ' aria-current="true"' : ""}><strong>${escapeHtml(item.name)}</strong><span>${getCourseAvailabilityCopy(item, javaExecutionAvailable)}</span></button>`).join("")}</nav>
    ${javaExecutionPending ? draftOnlyCount > 0 ? `<p class="catalog-notice" role="status"><strong>Java Quest ${course.totalCount}개 등록 · ${executableCount}개 실행 가능</strong><br>${draftOnlyCount}개 draft는 원본 문제·힌트·공개 테스트를 읽고 코드를 저장할 수 있으며, 앱 실행과 완료 판정은 제공하지 않습니다.</p>` : `<p class="catalog-notice" role="status"><strong>Java 실행 준비 중 · 코드 작성·저장 가능</strong><br>등록된 ${course.totalCount}개 Quest의 문제·힌트·공개 조건을 읽고 코드를 저장할 수 있습니다. 실행과 완료 판정은 아직 사용할 수 없습니다.</p>` : renderCatalogProgress(`${course.name} Code Quest 전체`, course.completedCount, course.totalCount, course.percent)}
    ${resume ? `<aside class="resume-card quest-resume-card" aria-label="Code Quest 이어서 풀기"><div><strong>${resumeExecutionAvailable ? resume.progress === "in_progress" ? "이어서 풀 수 있어요" : resume.progress === "completed" ? "처음부터 다시 풀어 보세요" : "다음 Quest를 시작하세요" : resume.hasDraft ? "저장한 코드를 이어서 작성하세요" : "코드 작성을 시작하세요"}</strong><p>${resume.displayOrder}. ${escapeHtml(resume.title)} · ${resumeExecutionAvailable ? QUEST_PROGRESS_COPY[resume.progress] : resume.hasDraft ? "초안 저장됨" : resume.executionMode === "draft-only" ? "원본 테스트 읽기" : "실행 준비 중"}${getQuestProgressEvidenceCopy(resume) ? ` · ${getQuestProgressEvidenceCopy(resume)}` : ""}</p></div><a class="button button--primary" href="${escapeHtml(resume.href)}">${resumeExecutionAvailable ? resume.progress === "in_progress" ? "이어서 풀기" : resume.progress === "completed" ? "다시 풀기" : "시작하기" : resume.hasDraft ? "이어서 작성하기" : "코드 작성하기"}</a></aside>` : ""}
    <section class="quest-catalog-tools" aria-labelledby="quest-explorer-title">
      <header><h2 id="quest-explorer-title">문제 탐색기</h2><p>검색과 필터를 함께 사용하거나 과정 안의 번호로 바로 이동할 수 있습니다.</p></header>
      <form data-quest-catalog-form role="search" aria-label="Code Quest 검색"><label>번호·제목·요약 검색<input type="search" data-quest-search value="${escapeHtml(query)}" placeholder="예: 배열, 3" autocomplete="off"></label><button class="button button--secondary" type="submit">찾기</button></form>
      <form data-quest-number-form aria-label="Quest 번호로 이동" novalidate><label>번호로 이동<input type="number" data-quest-number min="1" max="${course.totalCount}" value="${escapeHtml(number)}" inputmode="numeric"></label><button class="button button--secondary" type="submit">이동</button></form>
      ${notice ? `<p class="catalog-notice" data-quest-catalog-notice role="status" tabindex="-1">${escapeHtml(notice)}</p>` : ""}
      <div class="quest-filter-group"><span>학습 주제</span><div>${[["all", "전체"], ...course.topics.map((topic) => [topic.id, `${topic.title} · ${topic.completedCount}/${topic.totalCount}`])].map(([id, label]) => `<button type="button" data-quest-topic="${escapeHtml(id)}" aria-pressed="${String(id === topicId)}"${id === topicId ? ' aria-current="true"' : ""}>${escapeHtml(label)}</button>`).join("")}</div></div>
      <div class="quest-filter-group"><span>진행 상태</span><div>${statusOptions.map(([id, label]) => `<button type="button" data-quest-status="${id}" aria-pressed="${String(id === status)}">${label}</button>`).join("")}</div></div>
      ${query || topicId !== "all" || status !== "all" ? '<button class="text-button" type="button" data-quest-catalog-reset>검색과 필터 초기화</button>' : ""}
      <p class="catalog-count" data-quest-result-count role="status" tabindex="-1">${course.name} · ${items.length}/${course.totalCount}개 Quest</p>
    </section>
    ${items.length ? `<div class="quest-catalog-list">${items.map((item) => `<a class="quest-catalog-card" href="${escapeHtml(item.href)}"><span class="quest-catalog-number">${String(item.displayOrder).padStart(2, "0")}</span><div><p>${escapeHtml(item.topicTitle)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p>${item.executionMode === "draft-only" ? '<small>원본 공개 테스트 읽기 · 앱 실행 미지원</small>' : !isCatalogItemExecutionAvailable(item, javaExecutionAvailable) ? '<small>Java 실행 준비 중 · 코드 작성·저장 가능</small>' : ""}${getQuestProgressEvidenceCopy(item) ? `<small>${getQuestProgressEvidenceCopy(item)}</small>` : ""}${item.hasDraft ? '<small>저장된 초안의 문제 버전은 확인할 수 없습니다.</small>' : ""}</div>${renderQuestProgressBadge(item)}</a>`).join("")}</div>` : `<section class="catalog-empty"><h2>조건에 맞는 Quest가 없습니다.</h2><p>검색어 또는 주제·진행 상태 필터를 바꿔 보세요.</p></section>`}
    ${renderQuestLearningMap(course, javaExecutionAvailable)}
  </main>`;
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
  executionAvailable = true,
  draftStatus = "starter",
  uiError = null,
  report = null,
  reportPersistenceStatus = null,
  visibleHintCount = 0,
  isCompleted = false,
  previous = null,
  next = null,
  catalogItem = null,
  catalogCourse = null,
  catalogTopic = null,
  catalogHref = "#/quest",
} = {}) {
  const safeTotal = Math.max(0, safeInteger(total));
  const safeIndex = clamp(currentIndex, 0, Math.max(0, safeTotal - 1));
  const difficulty = DIFFICULTY_LABELS[quest?.difficulty] ?? "연습";
  const normalizedDraftStatus = normalizeDraftStatus(draftStatus);
  const editorDisabled = isRunning ? " readonly" : "";
  const runDisabled =
    !executionAvailable || isRunning || String(source).trim().length === 0 ? " disabled" : "";
  const isWebQuest = evaluationKind === "html-dom-v1" || evaluationKind === "css-style-v1";
  const sourceLanguage =
    evaluationKind === "html-dom-v1"
      ? "html"
      : evaluationKind === "css-style-v1"
        ? "css"
        : languageId;
  const editorCopy = getEditorCopy(evaluationKind, languageName, quest?.entryPoint);
  const isDraftOnly = quest?.executionMode === "draft-only";
  const javaExecutionPending = evaluationKind === "java-static-method-v1" && !executionAvailable;
  const progress = catalogItem?.progress ?? (isCompleted ? "completed" : "in_progress");
  const progressLabel = QUEST_PROGRESS_COPY[progress] ?? QUEST_PROGRESS_COPY.in_progress;

  return `
    <main class="main-area quest-main" id="lesson-content" tabindex="-1">
      <div class="quest-container">
        <nav class="quest-breadcrumb" aria-label="현재 Code Quest 위치">
          <a href="${escapeHtml(catalogHref)}">Code Quest</a><span aria-hidden="true">/</span>
          <span>${escapeHtml(catalogCourse?.name ?? languageName)}</span><span aria-hidden="true">/</span>
          <span>${escapeHtml(catalogTopic?.title ?? catalogItem?.topicTitle ?? "학습 주제")}</span><span aria-hidden="true">/</span>
          <span aria-current="page">${catalogItem?.displayOrder ?? safeIndex + 1}. ${escapeHtml(quest?.title ?? "현재 Quest")}</span>
        </nav>
        <header class="quest-header">
          <div class="eyebrow">
            <span>${escapeHtml(catalogCourse?.name ?? languageName)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(catalogTopic?.title ?? catalogItem?.topicTitle ?? collectionTitle)}</span>
          </div>
          <div class="quest-title-row">
            <div>
              <p>${difficulty} · ${safeIndex + 1}/${safeTotal} Quest · 약 ${Math.max(0, safeInteger(quest?.estimatedMinutes))}분</p>
              <h1 id="quest-title" tabindex="-1">${escapeHtml(quest?.title ?? "Code Quest")}</h1>
            </div>
            <span class="quest-completion-badge${progress === "completed" ? " is-complete" : ""}">${progressLabel}</span>
          </div>
          <p class="quest-summary quest-prose">${renderQuestProse(quest?.summary)}</p>
          ${getQuestProgressEvidenceCopy(catalogItem) ? `<p class="quest-draft-revision-note">${getQuestProgressEvidenceCopy(catalogItem)}</p>` : ""}
          ${catalogItem?.hasDraft ? '<p class="quest-draft-revision-note">저장된 초안의 문제 버전은 확인할 수 없습니다. 코드는 그대로 보존됩니다.</p>' : ""}
        </header>

        ${javaExecutionPending ? isDraftOnly ? '<p class="catalog-notice" role="status"><strong>원본 공개 테스트 읽기 · 앱 실행 미지원</strong><br>문제와 공개 테스트 소스를 확인하고 코드를 저장할 수 있습니다. 이 draft는 실행과 완료 판정을 제공하지 않습니다.</p>' : '<p class="catalog-notice" role="status"><strong>Java 실행 준비 중 · 코드 작성·저장 가능</strong><br>문제와 힌트를 확인하고 코드를 저장할 수 있습니다. 공개 테스트 실행과 완료 판정은 아직 사용할 수 없습니다.</p>' : ""}

        ${catalogCourse && catalogTopic ? `<section class="quest-location-summary" aria-label="현재 과정과 주제 진도">
          ${javaExecutionPending ? `<p><strong>${escapeHtml(catalogCourse.name)} Code Quest ${catalogCourse.totalCount}개 등록</strong> · 실행 준비 중</p><p><strong>${escapeHtml(catalogTopic.title)} ${catalogTopic.totalCount}개 등록</strong> · 코드 작성·저장 가능</p>` : `${renderCatalogProgress(`${catalogCourse.name} Code Quest 전체`, catalogCourse.completedCount, catalogCourse.totalCount, catalogCourse.percent)}${renderCatalogProgress(catalogTopic.title, catalogTopic.completedCount, catalogTopic.totalCount, catalogTopic.percent)}`}
          <div class="quest-location-actions"><a href="${escapeHtml(catalogHref)}">문제 탐색기로 돌아가기</a><a href="${escapeHtml(catalogItem?.lessonHref ?? "#")}">관련 학습문서 읽기</a><button class="text-button" type="button" data-quest-map-focus>학습 지도 보기</button></div>
        </section>` : ""}

        ${catalogTopic ? `<section class="quest-detail-map" id="quest-detail-map" aria-labelledby="quest-detail-map-title" tabindex="-1"><p class="quest-section-label">학습 지도</p><h2 id="quest-detail-map-title">${escapeHtml(catalogTopic.title)}에서 연습하는 개념</h2><p>${catalogItem?.conceptIds?.map((conceptId) => `<code>${escapeHtml(conceptId)}</code>`).join(" · ") ?? ""}</p><div>${catalogTopic.items.map((item) => `<a href="${escapeHtml(item.href)}"${item.id === catalogItem?.id ? ' aria-current="page"' : ""}>${item.displayOrder}. ${escapeHtml(item.title)} · ${QUEST_PROGRESS_COPY[item.progress] ?? QUEST_PROGRESS_COPY.not_started}${getQuestProgressEvidenceCopy(item) ? ` · ${getQuestProgressEvidenceCopy(item)}` : ""}</a>`).join("")}</div></section>` : ""}

        <div class="quest-workspace">
          <article class="quest-brief-panel">
            <section class="quest-section" aria-labelledby="quest-instructions-title">
              <p class="quest-section-label">문제</p>
              <h2 id="quest-instructions-title">구현 목표</h2>
              <p class="quest-prose">${renderQuestProse(quest?.instructions)}</p>
            </section>
            ${isWebQuest ? renderWebRequirements(quest, evaluationKind) : renderFunctionContract(quest)}
            ${isWebQuest ? renderWebExamples(quest?.examples, sourceLanguage) : renderExamples(quest, evaluationKind)}
            ${evaluationKind === "java-static-method-v1" ? renderJavaPublicTests(quest, executionAvailable) : ""}
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
            ${javaExecutionPending ? `<p class="quest-editor-help" role="status">${isDraftOnly ? "원본 테스트 읽기용 draft · 코드 작성·저장 가능. 앱 실행과 완료 판정은 제공하지 않습니다." : "Java 실행 준비 중 · 코드 작성·저장 가능. 실행과 완료 판정은 차단되어 있습니다."}</p>` : ""}
            <p class="quest-draft-status${normalizedDraftStatus === "failed" || normalizedDraftStatus === "memory" ? " is-warning" : ""}" id="quest-draft-status" data-quest-draft-status>${getCodeQuestDraftStatusMessage(normalizedDraftStatus)}</p>
            <div class="quest-run-actions">
              <button class="button button--primary" type="button" data-quest-run aria-busy="${String(isRunning)}"${runDisabled}>${isRunning ? "실행 중…" : "공개 테스트 실행"}</button>
              ${isRunning ? `<button class="button button--danger" type="button" data-quest-cancel${cancelRequested ? " disabled" : ""}>${cancelRequested ? "취소하는 중…" : "실행 취소"}</button>` : '<button class="button button--secondary" type="button" data-quest-reset>초기 코드로 되돌리기</button>'}
            </div>
            <div class="quest-inline-error" data-quest-error role="alert">${uiError ? escapeHtml(uiError) : ""}</div>
            ${renderQuestReport(report, quest, reportPersistenceStatus, executionAvailable)}
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
