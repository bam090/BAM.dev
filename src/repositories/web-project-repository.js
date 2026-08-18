import {
  WEB_PROJECT_AUTOMATIC_POINTS,
  WEB_PROJECT_CONTRACT_VERSION,
  WEB_PROJECT_FILE_MAX_BYTES,
  WEB_PROJECT_MANUAL_POINTS,
  WEB_PROJECT_TOTAL_MAX_BYTES,
  WEB_PROJECT_TOTAL_POINTS,
  isSafeWebProjectPath,
} from "../core/web-project.js";
import { createBrowserStorage } from "./browser-storage.js";

export const WEB_PROJECT_STORAGE_KEY = "bam.dev.web-projects.v1";
export const WEB_PROJECT_RECORD_KEY_PREFIX = `${WEB_PROJECT_STORAGE_KEY}.records.v1`;
export const MAX_WEB_PROJECT_DRAFTS = 10;
export const MAX_WEB_PROJECT_SUBMISSIONS = 20;

const STORAGE_SCHEMA_VERSION = 1;
const STORAGE_MANIFEST_VERSION = 2;
const DRAFT_RECORD_KEY_PREFIX = `${WEB_PROJECT_RECORD_KEY_PREFIX}.draft.`;
const SUBMISSION_RECORD_KEY_PREFIX = `${WEB_PROJECT_RECORD_KEY_PREFIX}.submission.`;
const MANIFEST_FIELDS = new Set([
  "schemaVersion",
  "recordKeys",
  "updatedAt",
  "changeToken",
]);
const PROJECT_ID_PATTERN = /^web-project-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_FILE_EXTENSIONS = new Set(["html", "css"]);
const AUTOMATIC_OUTCOMES = new Set([
  "passed",
  "failed",
  "invalid_source",
  "engine_error",
  "cancelled",
  "not_run",
]);
const COMPLETE_AUTOMATIC_OUTCOMES = new Set([
  "passed",
  "failed",
  "invalid_source",
]);
const COMPONENT_STATUSES = new Set(["complete", "incomplete"]);
const MANUAL_STATUSES = new Set(["pending", "self_assessed"]);

const DRAFT_INPUT_FIELDS = new Set(["projectId", "projectRevision", "files"]);
const STORED_DRAFT_FIELDS = new Set([
  ...DRAFT_INPUT_FIELDS,
  "updatedAt",
]);
const DRAFT_WRITE_OPTIONS_FIELDS = new Set(["expectedDraftToken"]);
const FILE_FIELDS = new Set(["path", "source"]);
const SUBMISSION_FIELDS = new Set([
  "submissionId",
  "contractVersion",
  "projectId",
  "projectRevision",
  "submittedAt",
  "files",
  "manualAssessments",
]);
const MANUAL_ASSESSMENT_FIELDS = new Set([
  "criterionId",
  "status",
  "levelId",
]);
const STORED_SUBMISSION_FIELDS = new Set([
  "submissionId",
  "contractVersion",
  "projectId",
  "projectRevision",
  "submittedAt",
  "recordedAt",
  "manualAssessments",
  "report",
]);
const REPORT_FIELDS = new Set([
  "contractVersion",
  "projectId",
  "projectRevision",
  "isComplete",
  "isVerified",
  "provisionalScore",
  "maxPoints",
  "automatic",
  "manual",
]);
const REPORT_COMPONENT_FIELDS = new Set([
  "status",
  "earnedPoints",
  "maxPoints",
  "criteria",
]);
const AUTOMATIC_CRITERION_FIELDS = new Set([
  "criterionId",
  "outcome",
  "earnedPoints",
  "maxPoints",
  "isComplete",
]);
const MANUAL_CRITERION_FIELDS = new Set([
  "criterionId",
  "status",
  "levelId",
  "earnedPoints",
  "maxPoints",
  "isComplete",
]);

const textEncoder = new TextEncoder();

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function snapshotExactRecord(value, fields) {
  if (!isPlainRecord(value)) return null;
  try {
    const keys = Reflect.ownKeys(value);
    if (keys.length !== fields.size) return null;
    const snapshot = Object.create(null);
    for (const key of keys) {
      if (typeof key !== "string" || !fields.has(key)) return null;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) return null;
      snapshot[key] = descriptor.value;
    }
    if ([...fields].some((field) => !Object.hasOwn(snapshot, field))) return null;
    return snapshot;
  } catch {
    return null;
  }
}

function snapshotDenseArray(value, minimum = 0, maximum = Infinity) {
  if (!Array.isArray(value)) return null;
  try {
    const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
    if (
      !Number.isSafeInteger(length) ||
      length < minimum ||
      length > maximum
    ) {
      return null;
    }
    const entries = [];
    for (const key of Reflect.ownKeys(value)) {
      if (key === "length") continue;
      if (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/.test(key)) {
        return null;
      }
      const index = Number(key);
      if (!Number.isSafeInteger(index) || index >= length) return null;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) return null;
      entries.push([index, descriptor.value]);
    }
    if (entries.length !== length) return null;
    entries.sort((left, right) => left[0] - right[0]);
    return entries.map(([, entry]) => entry);
  } catch {
    return null;
  }
}

function isStableId(value) {
  return typeof value === "string" && STABLE_ID_PATTERN.test(value);
}

function isProjectId(value) {
  return typeof value === "string" && PROJECT_ID_PATTERN.test(value);
}

function isProjectRevision(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isIsoInstant(value) {
  if (typeof value !== "string") return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function isPointValue(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function utf8ByteLength(value) {
  return textEncoder.encode(value).byteLength;
}

function getFileExtension(path) {
  const dotIndex = path.lastIndexOf(".");
  return dotIndex < 0 ? "" : path.slice(dotIndex + 1);
}

function normalizeFiles(value) {
  const values = snapshotDenseArray(value, 1, 10);
  if (!values) return null;
  const paths = new Set();
  let totalBytes = 0;
  const files = [];

  for (const valueItem of values) {
    const file = snapshotExactRecord(valueItem, FILE_FIELDS);
    if (
      !file ||
      !isSafeWebProjectPath(file.path) ||
      !ALLOWED_FILE_EXTENSIONS.has(getFileExtension(file.path)) ||
      paths.has(file.path) ||
      typeof file.source !== "string"
    ) {
      return null;
    }
    const bytes = utf8ByteLength(file.source);
    if (bytes > WEB_PROJECT_FILE_MAX_BYTES) return null;
    totalBytes += bytes;
    paths.add(file.path);
    files.push({ path: file.path, source: file.source });
  }

  return totalBytes <= WEB_PROJECT_TOTAL_MAX_BYTES ? files : null;
}

function normalizeManualAssessments(value) {
  const values = snapshotDenseArray(value, 1, 20);
  if (!values) return null;
  const criterionIds = new Set();
  const assessments = [];

  for (const valueItem of values) {
    const assessment = snapshotExactRecord(valueItem, MANUAL_ASSESSMENT_FIELDS);
    if (
      !assessment ||
      !isStableId(assessment.criterionId) ||
      criterionIds.has(assessment.criterionId) ||
      !MANUAL_STATUSES.has(assessment.status)
    ) {
      return null;
    }
    if (
      (assessment.status === "pending" && assessment.levelId !== null) ||
      (assessment.status === "self_assessed" &&
        !isStableId(assessment.levelId))
    ) {
      return null;
    }
    criterionIds.add(assessment.criterionId);
    assessments.push({
      criterionId: assessment.criterionId,
      status: assessment.status,
      levelId: assessment.levelId,
    });
  }
  return assessments;
}

function normalizeDraft(value, fields = STORED_DRAFT_FIELDS) {
  const draft = snapshotExactRecord(value, fields);
  if (
    !draft ||
    !isProjectId(draft.projectId) ||
    !isProjectRevision(draft.projectRevision)
  ) {
    return null;
  }
  const files = normalizeFiles(draft.files);
  if (!files) return null;
  if (fields === STORED_DRAFT_FIELDS && !isIsoInstant(draft.updatedAt)) return null;
  return {
    projectId: draft.projectId,
    projectRevision: draft.projectRevision,
    files,
    ...(fields === STORED_DRAFT_FIELDS ? { updatedAt: draft.updatedAt } : {}),
  };
}

function normalizeAutomaticCriteria(value) {
  const values = snapshotDenseArray(value, 1, 50);
  if (!values) return null;
  const ids = new Set();
  const criteria = [];
  for (const valueItem of values) {
    const criterion = snapshotExactRecord(valueItem, AUTOMATIC_CRITERION_FIELDS);
    if (
      !criterion ||
      !isStableId(criterion.criterionId) ||
      ids.has(criterion.criterionId) ||
      !AUTOMATIC_OUTCOMES.has(criterion.outcome) ||
      !isPointValue(criterion.maxPoints) ||
      typeof criterion.isComplete !== "boolean"
    ) {
      return null;
    }
    const shouldBeComplete = COMPLETE_AUTOMATIC_OUTCOMES.has(criterion.outcome);
    if (criterion.isComplete !== shouldBeComplete) return null;
    const expectedPoints = criterion.outcome === "passed" ? criterion.maxPoints : 0;
    if (
      (criterion.isComplete && criterion.earnedPoints !== expectedPoints) ||
      (!criterion.isComplete && criterion.earnedPoints !== null)
    ) {
      return null;
    }
    ids.add(criterion.criterionId);
    criteria.push({
      criterionId: criterion.criterionId,
      outcome: criterion.outcome,
      earnedPoints: criterion.earnedPoints,
      maxPoints: criterion.maxPoints,
      isComplete: criterion.isComplete,
    });
  }
  return criteria;
}

function normalizeManualCriteria(value) {
  const values = snapshotDenseArray(value, 1, 20);
  if (!values) return null;
  const ids = new Set();
  const criteria = [];
  for (const valueItem of values) {
    const criterion = snapshotExactRecord(valueItem, MANUAL_CRITERION_FIELDS);
    if (
      !criterion ||
      !isStableId(criterion.criterionId) ||
      ids.has(criterion.criterionId) ||
      !MANUAL_STATUSES.has(criterion.status) ||
      !isPointValue(criterion.maxPoints) ||
      typeof criterion.isComplete !== "boolean"
    ) {
      return null;
    }
    const shouldBeComplete = criterion.status === "self_assessed";
    if (
      criterion.isComplete !== shouldBeComplete ||
      (shouldBeComplete && !isStableId(criterion.levelId)) ||
      (!shouldBeComplete && criterion.levelId !== null) ||
      (shouldBeComplete &&
        (!isPointValue(criterion.earnedPoints) ||
          criterion.earnedPoints > criterion.maxPoints)) ||
      (!shouldBeComplete && criterion.earnedPoints !== null)
    ) {
      return null;
    }
    ids.add(criterion.criterionId);
    criteria.push({
      criterionId: criterion.criterionId,
      status: criterion.status,
      levelId: criterion.levelId,
      earnedPoints: criterion.earnedPoints,
      maxPoints: criterion.maxPoints,
      isComplete: criterion.isComplete,
    });
  }
  return criteria;
}

function normalizeReportComponent(value, kind) {
  const component = snapshotExactRecord(value, REPORT_COMPONENT_FIELDS);
  if (
    !component ||
    !COMPONENT_STATUSES.has(component.status) ||
    !isPointValue(component.maxPoints)
  ) {
    return null;
  }
  const criteria =
    kind === "automatic"
      ? normalizeAutomaticCriteria(component.criteria)
      : normalizeManualCriteria(component.criteria);
  if (!criteria) return null;
  const isComplete = criteria.every((criterion) => criterion.isComplete);
  const expectedStatus = isComplete ? "complete" : "incomplete";
  const expectedMaxPoints = criteria.reduce(
    (total, criterion) => total + criterion.maxPoints,
    0,
  );
  const expectedEarnedPoints = isComplete
    ? criteria.reduce((total, criterion) => total + criterion.earnedPoints, 0)
    : null;
  if (
    component.status !== expectedStatus ||
    component.maxPoints !== expectedMaxPoints ||
    component.earnedPoints !== expectedEarnedPoints
  ) {
    return null;
  }
  return {
    status: component.status,
    earnedPoints: component.earnedPoints,
    maxPoints: component.maxPoints,
    criteria,
  };
}

function normalizeReport(value) {
  const report = snapshotExactRecord(value, REPORT_FIELDS);
  if (
    !report ||
    report.contractVersion !== WEB_PROJECT_CONTRACT_VERSION ||
    !isProjectId(report.projectId) ||
    !isProjectRevision(report.projectRevision) ||
    typeof report.isComplete !== "boolean" ||
    report.isVerified !== false ||
    report.maxPoints !== WEB_PROJECT_TOTAL_POINTS
  ) {
    return null;
  }
  const automatic = normalizeReportComponent(report.automatic, "automatic");
  const manual = normalizeReportComponent(report.manual, "manual");
  if (
    !automatic ||
    !manual ||
    automatic.maxPoints !== WEB_PROJECT_AUTOMATIC_POINTS ||
    manual.maxPoints !== WEB_PROJECT_MANUAL_POINTS
  ) {
    return null;
  }
  const shouldBeComplete =
    automatic.status === "complete" && manual.status === "complete";
  const expectedScore = shouldBeComplete
    ? automatic.earnedPoints + manual.earnedPoints
    : null;
  if (
    report.isComplete !== shouldBeComplete ||
    report.provisionalScore !== expectedScore
  ) {
    return null;
  }
  return {
    contractVersion: report.contractVersion,
    projectId: report.projectId,
    projectRevision: report.projectRevision,
    isComplete: report.isComplete,
    isVerified: report.isVerified,
    provisionalScore: report.provisionalScore,
    maxPoints: report.maxPoints,
    automatic,
    manual,
  };
}

function normalizeSubmissionSummary(value) {
  const stored = snapshotExactRecord(value, STORED_SUBMISSION_FIELDS);
  if (
    !stored ||
    !isStableId(stored.submissionId) ||
    stored.contractVersion !== WEB_PROJECT_CONTRACT_VERSION ||
    !isProjectId(stored.projectId) ||
    !isProjectRevision(stored.projectRevision) ||
    !isIsoInstant(stored.submittedAt) ||
    !isIsoInstant(stored.recordedAt)
  ) {
    return null;
  }
  const manualAssessments = normalizeManualAssessments(stored.manualAssessments);
  const report = normalizeReport(stored.report);
  if (
    !manualAssessments ||
    !report ||
    report.projectId !== stored.projectId ||
    report.projectRevision !== stored.projectRevision ||
    report.contractVersion !== stored.contractVersion
  ) {
    return null;
  }
  if (
    manualAssessments.length !== report.manual.criteria.length ||
    manualAssessments.some((assessment) => {
      const criterion = report.manual.criteria.find(
        (candidate) => candidate.criterionId === assessment.criterionId,
      );
      return (
        !criterion ||
        criterion.status !== assessment.status ||
        criterion.levelId !== assessment.levelId
      );
    })
  ) {
    return null;
  }
  return {
    submissionId: stored.submissionId,
    contractVersion: stored.contractVersion,
    projectId: stored.projectId,
    projectRevision: stored.projectRevision,
    submittedAt: stored.submittedAt,
    recordedAt: stored.recordedAt,
    manualAssessments,
    report,
  };
}

function normalizeSubmissionInput(submission, reportInput, recordedAt) {
  const snapshot = snapshotExactRecord(submission, SUBMISSION_FIELDS);
  if (
    !snapshot ||
    !isStableId(snapshot.submissionId) ||
    snapshot.contractVersion !== WEB_PROJECT_CONTRACT_VERSION ||
    !isProjectId(snapshot.projectId) ||
    !isProjectRevision(snapshot.projectRevision) ||
    !isIsoInstant(snapshot.submittedAt) ||
    !normalizeFiles(snapshot.files)
  ) {
    return null;
  }
  const manualAssessments = normalizeManualAssessments(snapshot.manualAssessments);
  const report = normalizeReport(reportInput);
  if (
    !manualAssessments ||
    !report ||
    report.projectId !== snapshot.projectId ||
    report.projectRevision !== snapshot.projectRevision ||
    report.contractVersion !== snapshot.contractVersion
  ) {
    return null;
  }
  return normalizeSubmissionSummary({
    submissionId: snapshot.submissionId,
    contractVersion: snapshot.contractVersion,
    projectId: snapshot.projectId,
    projectRevision: snapshot.projectRevision,
    submittedAt: snapshot.submittedAt,
    recordedAt,
    manualAssessments,
    report,
  });
}

function draftKey(draft) {
  return `${draft.projectId}@${draft.projectRevision}`;
}

function draftRecordKey(projectId, projectRevision) {
  return `${DRAFT_RECORD_KEY_PREFIX}${projectId}@${projectRevision}`;
}

function submissionRecordKey(projectId, projectRevision, submissionId) {
  return `${SUBMISSION_RECORD_KEY_PREFIX}${projectId}@${projectRevision}@${submissionId}`;
}

function isDraftRecordKey(value) {
  return typeof value === "string" && value.startsWith(DRAFT_RECORD_KEY_PREFIX);
}

function isSubmissionRecordKey(value) {
  return typeof value === "string" && value.startsWith(SUBMISSION_RECORD_KEY_PREFIX);
}

function isWebProjectRecordKey(value) {
  return isDraftRecordKey(value) || isSubmissionRecordKey(value);
}

function parseStoredJson(raw) {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listStorageKeys(storage) {
  try {
    if (typeof storage.keys === "function") {
      const keys = storage.keys();
      return Array.isArray(keys)
        ? keys.filter((key) => typeof key === "string")
        : [];
    }
    if (
      Number.isSafeInteger(storage.length) &&
      storage.length >= 0 &&
      typeof storage.key === "function"
    ) {
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (typeof key === "string") keys.push(key);
      }
      return keys;
    }
  } catch {
    return [];
  }
  return [];
}

function normalizeManifest(value) {
  const manifest = snapshotExactRecord(value, MANIFEST_FIELDS);
  if (
    !manifest ||
    manifest.schemaVersion !== STORAGE_MANIFEST_VERSION ||
    (manifest.updatedAt !== null && !isIsoInstant(manifest.updatedAt)) ||
    typeof manifest.changeToken !== "string"
  ) {
    return null;
  }
  const keys = snapshotDenseArray(manifest.recordKeys, 0, 2_000);
  if (!keys || keys.some((key) => !isWebProjectRecordKey(key))) return null;
  return {
    schemaVersion: STORAGE_MANIFEST_VERSION,
    recordKeys: [...new Set(keys)],
    updatedAt: manifest.updatedAt,
    changeToken: manifest.changeToken,
  };
}

function textFingerprint(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export class WebProjectDraftConflictError extends Error {
  constructor() {
    super("다른 탭에서 Web Project 초안이 변경되었습니다.");
    this.name = "WebProjectDraftConflictError";
    this.code = "draft_conflict";
  }
}

export function getWebProjectDraftToken(draft) {
  if (draft === null) return null;
  const normalized = normalizeDraft(draft, STORED_DRAFT_FIELDS);
  if (!normalized || !isIsoInstant(normalized.updatedAt)) {
    throw new TypeError("저장된 Web Project 초안 토큰을 만들 수 없습니다.");
  }
  return JSON.stringify([
    normalized.projectId,
    normalized.projectRevision,
    normalized.updatedAt,
    normalized.files.map((file) => [file.path, file.source]),
  ]);
}

function readDraftWriteOptions(options) {
  if (options === undefined) return { enforce: false, expectedDraftToken: null };
  const snapshot = snapshotExactRecord(options, DRAFT_WRITE_OPTIONS_FIELDS);
  if (
    !snapshot ||
    (snapshot.expectedDraftToken !== null &&
      typeof snapshot.expectedDraftToken !== "string")
  ) {
    throw new TypeError("Web Project 초안 저장 기준 토큰이 올바르지 않습니다.");
  }
  return { enforce: true, expectedDraftToken: snapshot.expectedDraftToken };
}

function assertDraftIsCurrent(current, options) {
  if (!options.enforce) return;
  if (getWebProjectDraftToken(current) !== options.expectedDraftToken) {
    throw new WebProjectDraftConflictError();
  }
}

function normalizeDrafts(value) {
  const values = snapshotDenseArray(value, 0, 1_000) ?? [];
  const latestByKey = new Map();
  for (const valueItem of values) {
    const draft = normalizeDraft(valueItem);
    if (!draft) continue;
    const key = draftKey(draft);
    const previous = latestByKey.get(key);
    if (!previous || previous.updatedAt <= draft.updatedAt) {
      latestByKey.set(key, draft);
    }
  }
  return [...latestByKey.values()]
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
    .slice(-MAX_WEB_PROJECT_DRAFTS);
}

function normalizeSubmissions(value) {
  const values = snapshotDenseArray(value, 0, 2_000) ?? [];
  const latestByIdentity = new Map();
  for (const valueItem of values) {
    const submission = normalizeSubmissionSummary(valueItem);
    if (!submission) continue;
    const identity = [
      submission.projectId,
      submission.projectRevision,
      submission.submissionId,
    ].join("@");
    const previous = latestByIdentity.get(identity);
    if (!previous || previous.recordedAt <= submission.recordedAt) {
      latestByIdentity.set(identity, submission);
    }
  }
  return [...latestByIdentity.values()]
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
    .slice(-MAX_WEB_PROJECT_SUBMISSIONS);
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

export function createEmptyWebProjectState() {
  return deepFreeze({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    drafts: [],
    submissions: [],
    updatedAt: null,
  });
}

export function normalizeWebProjectState(value) {
  if (
    !isPlainRecord(value) ||
    value.schemaVersion !== STORAGE_SCHEMA_VERSION
  ) {
    return createEmptyWebProjectState();
  }
  return deepFreeze({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    drafts: normalizeDrafts(value.drafts),
    submissions: normalizeSubmissions(value.submissions),
    updatedAt: isIsoInstant(value.updatedAt) ? value.updatedAt : null,
  });
}

function assertProjectIdentity(projectId, projectRevision) {
  if (!isProjectId(projectId) || !isProjectRevision(projectRevision)) {
    throw new TypeError("유효한 Web Project ID와 현재 리비전이 필요합니다.");
  }
}

export class WebProjectRepository {
  getState() {
    throw new Error("getState()를 구현해야 합니다.");
  }

  getDraft() {
    throw new Error("getDraft()를 구현해야 합니다.");
  }

  saveDraft() {
    throw new Error("saveDraft()를 구현해야 합니다.");
  }

  clearDraft() {
    throw new Error("clearDraft()를 구현해야 합니다.");
  }

  listSubmissions() {
    throw new Error("listSubmissions()를 구현해야 합니다.");
  }

  recordSubmission() {
    throw new Error("recordSubmission()을 구현해야 합니다.");
  }

  getPersistenceStatus() {
    throw new Error("getPersistenceStatus()를 구현해야 합니다.");
  }
}

export class LocalStorageWebProjectRepository extends WebProjectRepository {
  constructor(storage = createBrowserStorage(), now = () => new Date()) {
    super();
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function"
    ) {
      throw new TypeError("localStorage와 호환되는 저장소가 필요합니다.");
    }
    if (typeof now !== "function") {
      throw new TypeError("현재 시각을 반환하는 함수가 필요합니다.");
    }
    this.storage = storage;
    this.now = now;
  }

  getState() {
    this.#ensureLegacyStateMigrated();
    return this.#readRecordState();
  }

  getDraft(projectId, projectRevision) {
    assertProjectIdentity(projectId, projectRevision);
    this.#ensureLegacyStateMigrated();
    return this.#readDraftRecord(draftRecordKey(projectId, projectRevision));
  }

  saveDraft(draftInput, writeOptions) {
    const draft = normalizeDraft(draftInput, DRAFT_INPUT_FIELDS);
    if (!draft) {
      throw new TypeError("Web Project 초안 형식이 올바르지 않습니다.");
    }
    this.#ensureLegacyStateMigrated();
    const options = readDraftWriteOptions(writeOptions);
    const recordKey = draftRecordKey(draft.projectId, draft.projectRevision);
    assertDraftIsCurrent(this.#readDraftRecord(recordKey), options);
    const updatedAt = this.#nowIso();
    const storedDraft = { ...draft, updatedAt };
    const serialized = JSON.stringify(storedDraft);
    this.storage.setItem(recordKey, serialized);
    this.#pruneRecordGroup(
      DRAFT_RECORD_KEY_PREFIX,
      MAX_WEB_PROJECT_DRAFTS,
      [recordKey],
      [recordKey],
    );
    this.#writeManifest({
      updatedAt,
      action: "save-draft",
      changedRecordKey: recordKey,
      changedValue: serialized,
      additionalKeys: [recordKey],
    });
    return deepFreeze(storedDraft);
  }

  clearDraft(projectId, projectRevision, writeOptions) {
    assertProjectIdentity(projectId, projectRevision);
    this.#ensureLegacyStateMigrated();
    const options = readDraftWriteOptions(writeOptions);
    const recordKey = draftRecordKey(projectId, projectRevision);
    const current = this.#readDraftRecord(recordKey);
    assertDraftIsCurrent(current, options);
    if (!current) return false;
    const updatedAt = this.#nowIso();
    this.#removeRecord(recordKey);
    this.#writeManifest({
      updatedAt,
      action: "clear-draft",
      changedRecordKey: recordKey,
      changedValue: "",
    });
    return true;
  }

  listSubmissions(projectId = null) {
    if (projectId !== null && !isProjectId(projectId)) {
      throw new TypeError("유효한 Web Project ID가 필요합니다.");
    }
    const submissions = this.getState().submissions;
    return deepFreeze(
      submissions.filter(
        (submission) => projectId === null || submission.projectId === projectId,
      ),
    );
  }

  recordSubmission(submission, report) {
    const recordedAt = this.#nowIso();
    const summary = normalizeSubmissionInput(submission, report, recordedAt);
    if (!summary) {
      throw new TypeError("Web Project 제출 또는 평가 요약 형식이 올바르지 않습니다.");
    }
    this.#ensureLegacyStateMigrated();
    const recordKey = submissionRecordKey(
      summary.projectId,
      summary.projectRevision,
      summary.submissionId,
    );
    if (this.#readSubmissionRecord(recordKey)) {
      throw new TypeError("같은 Web Project 제출 ID를 중복 저장할 수 없습니다.");
    }
    const serialized = JSON.stringify(summary);
    this.storage.setItem(recordKey, serialized);
    this.#pruneRecordGroup(
      SUBMISSION_RECORD_KEY_PREFIX,
      MAX_WEB_PROJECT_SUBMISSIONS,
      [recordKey],
      [recordKey],
    );
    this.#writeManifest({
      updatedAt: recordedAt,
      action: "record-submission",
      changedRecordKey: recordKey,
      changedValue: serialized,
      additionalKeys: [recordKey],
    });
    return deepFreeze(summary);
  }

  getPersistenceStatus() {
    return deepFreeze({
      isPersistent:
        typeof this.storage.isPersistent === "function"
          ? this.storage.isPersistent()
          : true,
    });
  }

  #nowIso() {
    let value;
    try {
      value = this.now();
    } catch {
      throw new TypeError("현재 시각을 확인할 수 없습니다.");
    }
    if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
      throw new TypeError("현재 시각 함수는 유효한 Date를 반환해야 합니다.");
    }
    return value.toISOString();
  }

  #readRaw(key) {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  #readManifest() {
    return normalizeManifest(parseStoredJson(this.#readRaw(WEB_PROJECT_STORAGE_KEY)));
  }

  #listRecordKeys(additionalKeys = []) {
    const keys = new Set(additionalKeys.filter(isWebProjectRecordKey));
    for (const key of listStorageKeys(this.storage)) {
      if (isWebProjectRecordKey(key)) keys.add(key);
    }
    for (const key of this.#readManifest()?.recordKeys ?? []) keys.add(key);
    return [...keys];
  }

  #readDraftRecord(recordKey) {
    const draft = normalizeDraft(parseStoredJson(this.#readRaw(recordKey)));
    if (!draft || draftRecordKey(draft.projectId, draft.projectRevision) !== recordKey) {
      return null;
    }
    return deepFreeze(draft);
  }

  #readSubmissionRecord(recordKey) {
    const submission = normalizeSubmissionSummary(
      parseStoredJson(this.#readRaw(recordKey)),
    );
    if (
      !submission ||
      submissionRecordKey(
        submission.projectId,
        submission.projectRevision,
        submission.submissionId,
      ) !== recordKey
    ) {
      return null;
    }
    return deepFreeze(submission);
  }

  #readRecordState() {
    const drafts = [];
    const submissions = [];
    for (const recordKey of this.#listRecordKeys()) {
      if (isDraftRecordKey(recordKey)) {
        const draft = this.#readDraftRecord(recordKey);
        if (draft) drafts.push(draft);
      } else if (isSubmissionRecordKey(recordKey)) {
        const submission = this.#readSubmissionRecord(recordKey);
        if (submission) submissions.push(submission);
      }
    }
    const normalizedDrafts = normalizeDrafts(drafts);
    const normalizedSubmissions = normalizeSubmissions(submissions);
    const manifest = this.#readManifest();
    const timestamps = [
      ...normalizedDrafts.map((draft) => draft.updatedAt),
      ...normalizedSubmissions.map((submission) => submission.recordedAt),
    ].filter(isIsoInstant);
    timestamps.sort((left, right) => left.localeCompare(right));
    return deepFreeze({
      schemaVersion: STORAGE_SCHEMA_VERSION,
      drafts: normalizedDrafts,
      submissions: normalizedSubmissions,
      updatedAt: manifest ? manifest.updatedAt : timestamps.at(-1) ?? null,
    });
  }

  #ensureLegacyStateMigrated() {
    const raw = this.#readRaw(WEB_PROJECT_STORAGE_KEY);
    const parsed = parseStoredJson(raw);
    if (!parsed || normalizeManifest(parsed)) return;
    if (!isPlainRecord(parsed) || parsed.schemaVersion !== STORAGE_SCHEMA_VERSION) {
      return;
    }

    const legacyState = normalizeWebProjectState(parsed);
    const migratedKeys = [];
    for (const draft of legacyState.drafts) {
      const recordKey = draftRecordKey(draft.projectId, draft.projectRevision);
      const storedDraft = this.#readDraftRecord(recordKey);
      // 독립 레코드가 생긴 뒤에는 그것이 진실 원본입니다. legacy 값을 더
      // 최신으로 보아 덮어쓰면 비교와 쓰기 사이의 동시 저장을 잃을 수 있습니다.
      if (!storedDraft) {
        this.storage.setItem(recordKey, JSON.stringify(draft));
      }
      migratedKeys.push(recordKey);
    }
    for (const submission of legacyState.submissions) {
      const recordKey = submissionRecordKey(
        submission.projectId,
        submission.projectRevision,
        submission.submissionId,
      );
      if (!this.#readSubmissionRecord(recordKey)) {
        this.storage.setItem(recordKey, JSON.stringify(submission));
      }
      migratedKeys.push(recordKey);
    }
    this.#pruneRecordGroup(
      DRAFT_RECORD_KEY_PREFIX,
      MAX_WEB_PROJECT_DRAFTS,
      migratedKeys,
    );
    this.#pruneRecordGroup(
      SUBMISSION_RECORD_KEY_PREFIX,
      MAX_WEB_PROJECT_SUBMISSIONS,
      migratedKeys,
    );
    this.#writeManifest({
      updatedAt: legacyState.updatedAt,
      action: "migrate-legacy",
      changedRecordKey: null,
      changedValue: raw,
      additionalKeys: migratedKeys,
    });
  }

  #pruneRecordGroup(
    prefix,
    maximum,
    additionalKeys = [],
    protectedKeys = [],
  ) {
    const protectedRecordKeys = new Set(protectedKeys);
    const records = this.#listRecordKeys(additionalKeys)
      .filter((recordKey) => recordKey.startsWith(prefix))
      .map((recordKey) => ({
        recordKey,
        value: prefix === DRAFT_RECORD_KEY_PREFIX
          ? this.#readDraftRecord(recordKey)
          : this.#readSubmissionRecord(recordKey),
      }))
      .filter(({ value }) => value !== null)
      .sort((left, right) => {
        const protectionOrder =
          Number(protectedRecordKeys.has(left.recordKey)) -
          Number(protectedRecordKeys.has(right.recordKey));
        if (protectionOrder !== 0) return protectionOrder;
        const leftTimestamp = left.value.updatedAt ?? left.value.recordedAt;
        const rightTimestamp = right.value.updatedAt ?? right.value.recordedAt;
        return (
          leftTimestamp.localeCompare(rightTimestamp) ||
          left.recordKey.localeCompare(right.recordKey)
        );
      });
    for (const { recordKey } of records.slice(0, Math.max(0, records.length - maximum))) {
      this.#removeRecord(recordKey);
    }
  }

  #removeRecord(recordKey) {
    if (typeof this.storage.removeItem === "function") {
      this.storage.removeItem(recordKey);
    } else {
      this.storage.setItem(recordKey, "");
    }
  }

  #writeManifest({
    updatedAt,
    action,
    changedRecordKey,
    changedValue,
    additionalKeys = [],
  }) {
    const recordKeys = this.#listRecordKeys(additionalKeys)
      .filter((recordKey) =>
        isDraftRecordKey(recordKey)
          ? this.#readDraftRecord(recordKey) !== null
          : this.#readSubmissionRecord(recordKey) !== null,
      )
      .sort((left, right) => left.localeCompare(right));
    const manifest = {
      schemaVersion: STORAGE_MANIFEST_VERSION,
      recordKeys,
      updatedAt: isIsoInstant(updatedAt) ? updatedAt : null,
      changeToken: [
        action,
        changedRecordKey ?? "legacy",
        textFingerprint(String(changedValue ?? "")),
        updatedAt ?? "",
      ].join(":"),
    };
    this.storage.setItem(WEB_PROJECT_STORAGE_KEY, JSON.stringify(manifest));
  }
}
