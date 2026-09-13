import {
  snapshotWebProjectSubmission,
  findWebProjectSourceIssue,
  WEB_PROJECT_CONTRACT_VERSION,
  WEB_PROJECT_FILE_MAX_BYTES,
  WEB_PROJECT_TOTAL_MAX_BYTES,
} from "../core/web-project.js";
import {
  getWebAssertionExpected,
  WEB_CODE_QUEST_EVALUATION_KINDS,
} from "../core/web-code-quest.js";
import { areJsonValuesEqual, utf8ByteLength } from "./code-grading.js";
import { createDefaultWebCodeQuestEvaluationAdapters } from "./browser-web-code-quest-runner.js";
import { scoreWebProject } from "./web-project-scoring.js";

export const DEFAULT_WEB_PROJECT_RUNNER_LIMITS = Object.freeze({
  maxFileBytes: WEB_PROJECT_FILE_MAX_BYTES,
  maxTotalBytes: WEB_PROJECT_TOTAL_MAX_BYTES,
});

const EVALUATION_KINDS = new Set(Object.values(WEB_CODE_QUEST_EVALUATION_KINDS));
const RUN_INPUT_FIELDS = new Set(["collection", "project", "submission"]);
const COLLECTION_FIELDS = new Set(["schemaVersion", "contractVersion", "title", "projects"]);
const PROJECT_FIELDS = new Set([
  "id",
  "slug",
  "revision",
  "order",
  "title",
  "summary",
  "difficulty",
  "estimatedMinutes",
  "instructions",
  "requirements",
  "conceptRefs",
  "files",
  "automaticCriteria",
  "manualCriteria",
]);
const FILE_FIELDS = new Set(["path", "languageId", "starterSource"]);
const AUTOMATIC_CRITERION_FIELDS = new Set([
  "id",
  "order",
  "title",
  "description",
  "failureMessage",
  "maxPoints",
  "filePath",
  "evaluationKind",
  "assertion",
]);
const MANUAL_CRITERION_FIELDS = new Set([
  "id",
  "order",
  "title",
  "description",
  "maxPoints",
  "scale",
]);
const SCALE_LEVEL_FIELDS = new Set(["id", "label", "description", "points"]);
const SUBMISSION_FIELDS = new Set([
  "submissionId",
  "contractVersion",
  "projectId",
  "projectRevision",
  "submittedAt",
  "files",
  "manualAssessments",
]);
const SUBMISSION_FILE_FIELDS = new Set(["path", "source"]);
const MANUAL_ASSESSMENT_FIELDS = new Set(["criterionId", "status", "levelId"]);

function defaultNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function readExactRecord(value, label, allowedFields) {
  if (!isPlainRecord(value)) throw new TypeError(`${label}은 일반 객체여야 합니다.`);
  let keys;
  try {
    keys = Reflect.ownKeys(value);
  } catch {
    throw new TypeError(`${label}의 필드를 안전하게 확인할 수 없습니다.`);
  }
  const output = {};
  for (const key of keys) {
    if (typeof key !== "string" || !allowedFields.has(key)) {
      throw new TypeError(`${label}에 허용되지 않은 필드가 있습니다: ${String(key)}`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${label}.${key}는 열거 가능한 값 필드여야 합니다.`);
    }
    output[key] = descriptor.value;
  }
  for (const field of allowedFields) {
    if (!Object.hasOwn(output, field)) throw new TypeError(`${label}.${field}가 필요합니다.`);
  }
  return output;
}

function readOwnValue(value, field, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label}은 일반 객체여야 합니다.`);
  const descriptor = Object.getOwnPropertyDescriptor(value, field);
  if (!descriptor?.enumerable || !("value" in descriptor)) {
    throw new TypeError(`${label}.${field}는 열거 가능한 값 필드여야 합니다.`);
  }
  return descriptor.value;
}

function readDenseArray(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label}은 배열이어야 합니다.`);
  const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new TypeError(`${label}.length를 안전하게 확인할 수 없습니다.`);
  }
  const entries = [];
  let keys;
  try {
    keys = Reflect.ownKeys(value);
  } catch {
    throw new TypeError(`${label}의 항목을 안전하게 확인할 수 없습니다.`);
  }
  for (const key of keys) {
    if (key === "length") continue;
    const index = typeof key === "string" ? Number(key) : Number.NaN;
    if (!Number.isSafeInteger(index) || index < 0 || index >= length || String(index) !== key) {
      throw new TypeError(`${label} 배열에 허용되지 않은 속성이 있습니다: ${String(key)}`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${label}[${index}]은 열거 가능한 값 항목이어야 합니다.`);
    }
    entries.push([index, descriptor.value]);
  }
  entries.sort((left, right) => left[0] - right[0]);
  if (entries.length !== length) throw new TypeError(`${label}에는 비어 있는 배열 항목이 없어야 합니다.`);
  return entries.map(([, item]) => item);
}

function assertionFields(kind) {
  if (kind === "doctype-present") return new Set(["kind"]);
  if (kind === "selector-exists") return new Set(["kind", "selector"]);
  if (kind === "selector-count") return new Set(["kind", "selector", "expected"]);
  if (kind === "attribute-equals") {
    return new Set(["kind", "selector", "attribute", "expected"]);
  }
  if (kind === "text-includes") return new Set(["kind", "selector", "expected"]);
  if (kind === "nonblank-attribute-count") {
    return new Set(["kind", "selector", "attribute", "expected"]);
  }
  if (kind === "direct-child-text-equals") {
    return new Set([
      "kind",
      "selector",
      "childSelector",
      "childIndex",
      "textSelector",
      "expected",
    ]);
  }
  if (
    kind === "rule-declaration" ||
    kind === "computed-style" ||
    kind === "computed-focus-style"
  ) {
    return new Set(["kind", "selector", "property", "expected"]);
  }
  if (kind === "computed-grid-column-count") {
    return new Set(["kind", "selector", "viewportWidth", "expected"]);
  }
  if (kind === "media-rule-declaration") {
    return new Set(["kind", "condition", "selector", "property", "expected"]);
  }
  return null;
}

function snapshotAssertion(value, label) {
  const kind = readOwnValue(value, "kind", label);
  const fields = assertionFields(kind);
  if (!fields) throw new TypeError(`${label}.kind가 지원하는 공개 자동 검사 종류가 아닙니다.`);
  return Object.freeze(readExactRecord(value, label, fields));
}

function snapshotCanonicalProject(collection, projectReference) {
  const collectionRecord = readExactRecord(
    collection,
    "Web Project 실행 컬렉션",
    COLLECTION_FIELDS,
  );
  if (collectionRecord.contractVersion !== WEB_PROJECT_CONTRACT_VERSION) {
    throw new TypeError(
      `Web Project 실행 컬렉션.contractVersion은 ${WEB_PROJECT_CONTRACT_VERSION}이어야 합니다.`,
    );
  }
  const projectId = readOwnValue(projectReference, "id", "실행할 Web Project");
  const projects = readDenseArray(collectionRecord.projects, "Web Project 실행 컬렉션.projects");
  const canonicalValue = projects.find(
    (candidate) => readOwnValue(candidate, "id", "정식 Web Project") === projectId,
  );
  if (!canonicalValue) throw new Error("Web Project가 정식 컬렉션에 속하지 않습니다.");

  const canonical = readExactRecord(canonicalValue, "정식 Web Project", PROJECT_FIELDS);
  if (typeof canonical.id !== "string" || !Number.isSafeInteger(canonical.revision)) {
    throw new TypeError("정식 Web Project의 id와 revision이 필요합니다.");
  }

  const files = readDenseArray(canonical.files, "정식 Web Project.files").map((value, index) => {
    const file = readExactRecord(value, `정식 Web Project.files[${index}]`, FILE_FIELDS);
    return Object.freeze({
      path: file.path,
      languageId: file.languageId,
      starterSource: file.starterSource,
    });
  });
  const fileMap = new Map(files.map((file) => [file.path, file]));
  const automaticCriteria = readDenseArray(
    canonical.automaticCriteria,
    "정식 Web Project.automaticCriteria",
  ).map((value, index) => {
    const criterion = readExactRecord(
      value,
      `정식 Web Project.automaticCriteria[${index}]`,
      AUTOMATIC_CRITERION_FIELDS,
    );
    if (!EVALUATION_KINDS.has(criterion.evaluationKind)) {
      throw new TypeError(`${criterion.id}의 evaluationKind를 지원하지 않습니다.`);
    }
    const file = fileMap.get(criterion.filePath);
    const expectedLanguage =
      criterion.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.HTML
        ? "html"
        : "css";
    if (!file || file.languageId !== expectedLanguage) {
      throw new TypeError(`${criterion.id}의 대상 파일과 평가 종류가 일치하지 않습니다.`);
    }
    const assertion = snapshotAssertion(
      criterion.assertion,
      `정식 Web Project.automaticCriteria[${index}].assertion`,
    );
    return Object.freeze({
      id: criterion.id,
      maxPoints: criterion.maxPoints,
      failureMessage: criterion.failureMessage,
      filePath: criterion.filePath,
      evaluationKind: criterion.evaluationKind,
      assertion,
      expected: getWebAssertionExpected(assertion),
    });
  });
  const manualCriteria = readDenseArray(
    canonical.manualCriteria,
    "정식 Web Project.manualCriteria",
  ).map((value, index) => {
    const criterion = readExactRecord(
      value,
      `정식 Web Project.manualCriteria[${index}]`,
      MANUAL_CRITERION_FIELDS,
    );
    const scale = readDenseArray(
      criterion.scale,
      `정식 Web Project.manualCriteria[${index}].scale`,
    ).map((levelValue, levelIndex) => {
      const level = readExactRecord(
        levelValue,
        `정식 Web Project.manualCriteria[${index}].scale[${levelIndex}]`,
        SCALE_LEVEL_FIELDS,
      );
      return Object.freeze({
        id: level.id,
        label: level.label,
        description: level.description,
        points: level.points,
      });
    });
    return Object.freeze({
      id: criterion.id,
      maxPoints: criterion.maxPoints,
      scale: Object.freeze(scale),
    });
  });

  return Object.freeze({
    id: canonical.id,
    revision: canonical.revision,
    files: Object.freeze(files),
    automaticCriteria: Object.freeze(automaticCriteria),
    manualCriteria: Object.freeze(manualCriteria),
  });
}

function snapshotSubmission(project, submission) {
  const value = readExactRecord(submission, "Web Project 실행 제출", SUBMISSION_FIELDS);
  const files = readDenseArray(value.files, "Web Project 실행 제출.files").map((fileValue, index) => {
    const file = readExactRecord(
      fileValue,
      `Web Project 실행 제출.files[${index}]`,
      SUBMISSION_FILE_FIELDS,
    );
    return { path: file.path, source: file.source };
  });
  const manualAssessments = readDenseArray(
    value.manualAssessments,
    "Web Project 실행 제출.manualAssessments",
  ).map((assessmentValue, index) => {
    const assessment = readExactRecord(
      assessmentValue,
      `Web Project 실행 제출.manualAssessments[${index}]`,
      MANUAL_ASSESSMENT_FIELDS,
    );
    return {
      criterionId: assessment.criterionId,
      status: assessment.status,
      levelId: assessment.levelId,
    };
  });

  const starterSources = new Map(
    project.files.map((file) => [file.path, file.starterSource]),
  );
  const fallbackStarter = project.files[0]?.starterSource ?? "<!doctype html><main></main>";
  const structurallySafeSubmission = {
    submissionId: value.submissionId,
    contractVersion: value.contractVersion,
    projectId: value.projectId,
    projectRevision: value.projectRevision,
    submittedAt: value.submittedAt,
    files: files.map((file) => ({
      path: file.path,
      source: starterSources.get(file.path) ?? fallbackStarter,
    })),
    manualAssessments,
  };
  const validated = snapshotWebProjectSubmission(
    { projects: [project] },
    project,
    structurallySafeSubmission,
  );

  return Object.freeze({
    submissionId: validated.submissionId,
    contractVersion: WEB_PROJECT_CONTRACT_VERSION,
    projectId: project.id,
    projectRevision: project.revision,
    files: Object.freeze(
      files.map((file) => Object.freeze({ path: file.path, source: file.source })),
    ),
    manualAssessments: validated.manualAssessments,
  });
}

function snapshotRunInput(input) {
  const runInput = readExactRecord(input, "Web Project 실행 입력", RUN_INPUT_FIELDS);
  const project = snapshotCanonicalProject(runInput.collection, runInput.project);
  const submission = snapshotSubmission(project, runInput.submission);
  return Object.freeze({ project, submission });
}

function isAbortSignal(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.aborted === "boolean" &&
    typeof value.addEventListener === "function" &&
    typeof value.removeEventListener === "function"
  );
}

function isAbortError(error) {
  try {
    return error?.name === "AbortError";
  } catch {
    return false;
  }
}

function isSyntaxError(error) {
  try {
    return error instanceof SyntaxError || error?.name === "SyntaxError";
  } catch {
    return false;
  }
}

function getErrorMessage(error) {
  try {
    const message = error instanceof Error ? error.message : error?.message;
    return typeof message === "string" && message.length > 0
      ? message
      : "Web Project 자동 평가기가 실패했습니다.";
  } catch {
    return "Web Project 자동 평가기가 실패했습니다.";
  }
}

function createError(type, message, learnerMessage = message) {
  return { type, message, learnerMessage };
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function elapsed(now, startedAt) {
  const value = now() - startedAt;
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 10) / 10) : 0;
}

function createBaseResult(criterion) {
  return {
    criterionId: criterion.id,
    outcome: "not_run",
    expected: criterion.expected,
    actual: null,
    error: null,
    durationMs: 0,
  };
}

function createStoppedResult(criterion, outcome, error) {
  return { ...createBaseResult(criterion), outcome, error };
}

function getSourcePreflight(project, submission) {
  const canonicalFiles = new Map(project.files.map((file) => [file.path, file]));
  const sourceIssues = new Map();
  let totalBytes = 0;
  for (const file of submission.files) {
    const canonicalFile = canonicalFiles.get(file.path);
    const evaluationKind =
      canonicalFile?.languageId === "html"
        ? WEB_CODE_QUEST_EVALUATION_KINDS.HTML
        : WEB_CODE_QUEST_EVALUATION_KINDS.CSS;
    const issue = findWebProjectSourceIssue(evaluationKind, file.source);
    if (issue) sourceIssues.set(file.path, issue);
    if (typeof file.source === "string") totalBytes += utf8ByteLength(file.source);
  }
  if (totalBytes > WEB_PROJECT_TOTAL_MAX_BYTES) {
    const issue = {
      code: "total_source_too_large",
      message: `제출 파일 전체 UTF-8 크기는 ${WEB_PROJECT_TOTAL_MAX_BYTES}바이트 이하여야 합니다.`,
    };
    for (const file of project.files) sourceIssues.set(file.path, issue);
  }
  const htmlPath = project.files.find((file) => file.languageId === "html")?.path ?? null;
  return { sourceIssues, htmlPath, htmlIssue: htmlPath ? sourceIssues.get(htmlPath) : null };
}

function overallOutcome(results, forcedOutcome) {
  if (forcedOutcome) return forcedOutcome;
  for (const outcome of ["engine_error", "cancelled", "invalid_source", "failed", "not_run"]) {
    if (results.some((result) => result.outcome === outcome)) return outcome;
  }
  return "passed";
}

export function createDefaultWebProjectEvaluationAdapters(environment = {}) {
  return createDefaultWebCodeQuestEvaluationAdapters(environment);
}

function mergeEvaluationAdapters(overrides, environment) {
  const defaults = createDefaultWebProjectEvaluationAdapters(environment);
  if (overrides === undefined) return defaults;
  if (!isPlainRecord(overrides)) {
    throw new TypeError("Web Project 평가 어댑터는 일반 객체여야 합니다.");
  }
  const keys = Reflect.ownKeys(overrides);
  const unknown = keys.filter(
    (kind) => typeof kind !== "string" || !EVALUATION_KINDS.has(kind),
  );
  if (unknown.length > 0) {
    throw new TypeError(`지원하지 않는 Web Project 평가 어댑터가 있습니다: ${unknown.join(", ")}`);
  }
  const adapters = { ...defaults };
  for (const kind of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(overrides, kind);
    if (!descriptor?.enumerable || !("value" in descriptor) || typeof descriptor.value !== "function") {
      throw new TypeError(`${String(kind)} Web Project 평가 어댑터는 함수여야 합니다.`);
    }
    adapters[kind] = descriptor.value;
  }
  return Object.freeze(adapters);
}

/**
 * Browser grader for the public automatic criteria of a canonical Web Project.
 * Learner HTML is parsed inertly and learner CSS is evaluated with the submitted
 * index document as its fixture. No learner JavaScript is executed.
 */
export class BrowserWebProjectRunner {
  constructor({ evaluationAdapters, environment, now = defaultNow } = {}) {
    if (typeof now !== "function") throw new TypeError("now는 함수여야 합니다.");
    this.evaluationAdapters = mergeEvaluationAdapters(evaluationAdapters, environment);
    this.now = now;
    this.active = false;
  }

  async run(input, { signal } = {}) {
    const execution = snapshotRunInput(input);
    if (signal !== undefined && !isAbortSignal(signal)) {
      throw new TypeError("signal은 AbortSignal이어야 합니다.");
    }
    const startedAt = this.now();

    if (this.active) {
      return this.#createReport(
        execution,
        execution.project.automaticCriteria.map((criterion) =>
          createStoppedResult(
            criterion,
            "not_run",
            createError("concurrent_run", "이미 Web Project 자동 평가가 진행 중입니다."),
          ),
        ),
        {
          forcedOutcome: "engine_error",
          error: createError(
            "concurrent_run",
            "이미 Web Project 자동 평가가 진행 중입니다.",
            "현재 자동 평가가 끝난 뒤 다시 시도해 주세요.",
          ),
          durationMs: 0,
        },
      );
    }

    this.active = true;
    try {
      const { project, submission } = execution;
      const sourceByPath = new Map(submission.files.map((file) => [file.path, file.source]));
      const { sourceIssues, htmlPath, htmlIssue } = getSourcePreflight(project, submission);
      const fixtureHtml = htmlPath ? sourceByPath.get(htmlPath) : null;
      const results = [];
      let stopReason = null;
      let reportError = null;

      for (const criterion of project.automaticCriteria) {
        if (stopReason) {
          const stoppedAfterCancel = stopReason === "cancelled";
          results.push(
            createStoppedResult(
              criterion,
              "not_run",
              stoppedAfterCancel
                ? createError(
                    "stopped_after_cancel",
                    "사용자가 자동 평가를 취소해 이 기준을 실행하지 않았습니다.",
                  )
                : createError(
                    "stopped_after_fatal",
                    "앞선 치명적 오류로 이 기준을 실행하지 않았습니다.",
                  ),
            ),
          );
          continue;
        }
        if (signal?.aborted) {
          const error = createError("cancelled", "사용자가 Web Project 자동 평가를 취소했습니다.");
          results.push(createStoppedResult(criterion, "cancelled", error));
          reportError = error;
          stopReason = "cancelled";
          continue;
        }

        const sourceIssue = sourceIssues.get(criterion.filePath);
        if (sourceIssue) {
          results.push(
            createStoppedResult(
              criterion,
              "invalid_source",
              createError(sourceIssue.code, sourceIssue.message),
            ),
          );
          continue;
        }
        if (criterion.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS && htmlIssue) {
          results.push(
            createStoppedResult(
              criterion,
              "not_run",
              createError(
                "invalid_html_fixture",
                "제출한 index.html이 안전 검사를 통과하지 못해 CSS 기준을 실행하지 않았습니다.",
              ),
            ),
          );
          continue;
        }

        const criterionStartedAt = this.now();
        try {
          const actual = await this.evaluationAdapters[criterion.evaluationKind]({
            source: sourceByPath.get(criterion.filePath),
            fixtureHtml:
              criterion.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS
                ? fixtureHtml
                : null,
            assertion: criterion.assertion,
            signal,
          });
          if (signal?.aborted) {
            const error = new Error("cancelled");
            error.name = "AbortError";
            throw error;
          }
          if (!areJsonValuesEqual(actual, actual)) {
            throw new Error("평가 어댑터가 JSON으로 표현할 수 없는 결과를 반환했습니다.");
          }
          const passed = areJsonValuesEqual(actual, criterion.expected);
          results.push({
            ...createBaseResult(criterion),
            outcome: passed ? "passed" : "failed",
            actual,
            error: passed
              ? null
              : createError("criterion_failed", criterion.failureMessage),
            durationMs: elapsed(this.now, criterionStartedAt),
          });
        } catch (error) {
          let outcome;
          let resultError;
          if (signal?.aborted || isAbortError(error)) {
            outcome = "cancelled";
            resultError = createError(
              "cancelled",
              "사용자가 Web Project 자동 평가를 취소했습니다.",
            );
          } else if (isSyntaxError(error)) {
            outcome = "invalid_source";
            resultError = createError(
              "syntax_error",
              getErrorMessage(error),
              "작성한 HTML 또는 CSS 문법을 확인해 보세요.",
            );
          } else {
            outcome = "engine_error";
            resultError = createError(
              "evaluation_error",
              getErrorMessage(error),
              "이 공개 자동 기준을 실행하지 못했습니다. 다시 시도해 주세요.",
            );
          }
          results.push({
            ...createStoppedResult(criterion, outcome, resultError),
            durationMs: elapsed(this.now, criterionStartedAt),
          });
          reportError = resultError;
          stopReason = outcome === "cancelled" ? "cancelled" : "fatal";
        }
      }

      return this.#createReport(execution, results, {
        error: reportError,
        durationMs: elapsed(this.now, startedAt),
      });
    } finally {
      this.active = false;
    }
  }

  #createReport(execution, automaticResults, { forcedOutcome, error = null, durationMs }) {
    const scoringResults = automaticResults.map(({ criterionId, outcome }) => ({
      criterionId,
      outcome,
    }));
    const score = scoreWebProject(execution.project, {
      automaticResults: scoringResults,
      manualAssessments: execution.submission.manualAssessments.map((assessment) => ({
        criterionId: assessment.criterionId,
        status: assessment.status,
        levelId: assessment.levelId,
      })),
    });
    return deepFreeze({
      contractVersion: WEB_PROJECT_CONTRACT_VERSION,
      submissionId: execution.submission.submissionId,
      projectId: execution.project.id,
      projectRevision: execution.project.revision,
      outcome: overallOutcome(automaticResults, forcedOutcome),
      automaticResults,
      score,
      durationMs,
      limits: { ...DEFAULT_WEB_PROJECT_RUNNER_LIMITS },
      error,
    });
  }
}
