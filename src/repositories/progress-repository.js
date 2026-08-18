export const PROGRESS_STORAGE_KEY = "bam.dev.progress.v1";
const MAX_QUIZ_ATTEMPTS = 20;
const MAX_QUEST_DRAFTS = 20;
const MAX_QUEST_ATTEMPTS = 50;
const MAX_QUEST_SOURCE_BYTES = 20 * 1024;
const MAX_CODING_TEST_DRAFTS = 20;
const MAX_CODING_TEST_SUBMISSIONS = 50;
const MAX_CODING_TEST_SOURCE_BYTES = 20 * 1024;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LANGUAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const OPTION_ID_PATTERN = /^[a-d]$/;
const QUEST_OUTCOMES = new Set([
  "passed",
  "wrong_answer",
  "syntax_error",
  "runtime_error",
  "timeout",
  "output_limit",
  "cancelled",
  "engine_error",
]);
const QUEST_DRAFT_INPUT_FIELDS = new Set(["questId", "languageId", "source"]);
const STORED_QUEST_DRAFT_FIELDS = new Set([
  "questId",
  "languageId",
  "source",
  "updatedAt",
]);
const QUEST_ATTEMPT_INPUT_FIELDS = new Set([
  "questId",
  "questRevision",
  "languageId",
  "outcome",
  "passed",
  "total",
]);
const STORED_QUEST_ATTEMPT_FIELDS = new Set([
  "id",
  ...QUEST_ATTEMPT_INPUT_FIELDS,
  "completedAt",
]);
const CODING_TEST_DRAFT_INPUT_FIELDS = new Set([
  "problemId",
  "problemRevision",
  "languageId",
  "source",
]);
const STORED_CODING_TEST_DRAFT_FIELDS = new Set([
  ...CODING_TEST_DRAFT_INPUT_FIELDS,
  "updatedAt",
]);
const CODING_TEST_SUBMISSION_INPUT_FIELDS = new Set([
  "problemId",
  "problemRevision",
  "languageId",
  "outcome",
  "passed",
  "total",
]);
const STORED_CODING_TEST_SUBMISSION_FIELDS = new Set([
  "id",
  ...CODING_TEST_SUBMISSION_INPUT_FIELDS,
  "completedAt",
]);
const COMPLETED_CODING_TEST_FIELDS = new Set([
  "problemId",
  "problemRevision",
  "completedAt",
]);
const textEncoder = new TextEncoder();

export function createEmptyProgress() {
  return {
    schemaVersion: 1,
    completedLessonIds: [],
    lastLessonId: null,
    quizAttempts: [],
    incorrectQuestionIds: [],
    questDrafts: [],
    questAttempts: [],
    completedQuestIds: [],
    codingTestDrafts: [],
    codingTestSubmissions: [],
    completedCodingTestProblems: [],
    updatedAt: null,
  };
}

export function normalizeProgress(value) {
  if (!value || typeof value !== "object" || value.schemaVersion !== 1) {
    return createEmptyProgress();
  }

  const completedLessonIds = Array.isArray(value.completedLessonIds)
    ? [...new Set(value.completedLessonIds.filter(isStableId))]
    : [];
  const quizAttempts = [];
  const attemptIds = new Set();
  for (const attempt of Array.isArray(value.quizAttempts) ? value.quizAttempts : []) {
    if (!isStoredQuizAttempt(attempt) || attemptIds.has(attempt.id)) continue;
    attemptIds.add(attempt.id);
    quizAttempts.push(attempt);
  }
  const incorrectQuestionIds = Array.isArray(value.incorrectQuestionIds)
    ? [...new Set(value.incorrectQuestionIds.filter(isQuizQuestionId))]
    : [];
  const questDrafts = normalizeQuestDrafts(value.questDrafts);
  const questAttempts = [];
  const questAttemptIds = new Set();
  const completedQuestIds = new Set(
    Array.isArray(value.completedQuestIds)
      ? value.completedQuestIds.filter(isQuestId)
      : [],
  );
  for (const storedValue of Array.isArray(value.questAttempts) ? value.questAttempts : []) {
    const attempt = normalizeStoredQuestAttempt(storedValue);
    if (!attempt || questAttemptIds.has(attempt.id)) continue;
    questAttemptIds.add(attempt.id);
    questAttempts.push(attempt);
    if (isCompletedQuestAttempt(attempt)) completedQuestIds.add(attempt.questId);
  }
  const retainedQuestAttempts = questAttempts.slice(-MAX_QUEST_ATTEMPTS);
  const codingTestDrafts = normalizeCodingTestDrafts(value.codingTestDrafts);
  const codingTestSubmissions = [];
  const codingTestSubmissionIds = new Set();
  const completedCodingTestProblems = normalizeCompletedCodingTestProblems(
    value.completedCodingTestProblems,
  );
  for (const storedValue of Array.isArray(value.codingTestSubmissions)
    ? value.codingTestSubmissions
    : []) {
    const submission = normalizeStoredCodingTestSubmission(storedValue);
    if (!submission || codingTestSubmissionIds.has(submission.id)) continue;
    codingTestSubmissionIds.add(submission.id);
    codingTestSubmissions.push(submission);
    if (isCompletedCodingTestSubmission(submission)) {
      retainCompletedCodingTestProblem(completedCodingTestProblems, {
        problemId: submission.problemId,
        problemRevision: submission.problemRevision,
        completedAt: submission.completedAt,
      });
    }
  }

  return {
    schemaVersion: 1,
    completedLessonIds,
    lastLessonId: isStableId(value.lastLessonId) ? value.lastLessonId : null,
    quizAttempts: quizAttempts.slice(-MAX_QUIZ_ATTEMPTS),
    incorrectQuestionIds,
    questDrafts,
    questAttempts: retainedQuestAttempts,
    completedQuestIds: [...completedQuestIds],
    codingTestDrafts,
    codingTestSubmissions: codingTestSubmissions.slice(-MAX_CODING_TEST_SUBMISSIONS),
    completedCodingTestProblems: [...completedCodingTestProblems.values()],
    updatedAt: isValidDateString(value.updatedAt) ? value.updatedAt : null,
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 && value === value.trim();
}

function isStableId(value) {
  return isNonEmptyString(value) && STABLE_ID_PATTERN.test(value);
}

function isQuizQuestionId(value) {
  return isStableId(value) && value.startsWith("quiz-");
}

function isQuestId(value) {
  return isStableId(value) && value.startsWith("quest-") && value.split("-").length >= 3;
}

function isCodingTestProblemId(value) {
  return (
    isStableId(value) &&
    value.startsWith("coding-test-") &&
    value.split("-").length >= 4
  );
}

function isLanguageId(value) {
  return isNonEmptyString(value) && LANGUAGE_ID_PATTERN.test(value);
}

function isValidDateString(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function utf8ByteLength(value) {
  return textEncoder.encode(value).byteLength;
}

function questMatchesLanguage(questId, languageId) {
  return questId.startsWith(`quest-${languageId}-`);
}

function codingTestProblemMatchesLanguage(problemId, languageId) {
  return problemId.startsWith(`coding-test-${languageId}-`);
}

function snapshotPlainDataDto(value, allowedFields) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;

  try {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return null;

    const keys = Reflect.ownKeys(value);
    if (keys.length !== allowedFields.size) return null;
    const snapshot = Object.create(null);
    for (const key of keys) {
      if (typeof key !== "string" || !allowedFields.has(key)) return null;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) return null;
      snapshot[key] = descriptor.value;
    }
    if ([...allowedFields].some((field) => !Object.hasOwn(snapshot, field))) return null;
    return snapshot;
  } catch {
    return null;
  }
}

function normalizeStoredQuestDraft(value) {
  const draft = snapshotPlainDataDto(value, STORED_QUEST_DRAFT_FIELDS);
  if (
    !draft ||
    !isQuestId(draft.questId) ||
    !isLanguageId(draft.languageId) ||
    !questMatchesLanguage(draft.questId, draft.languageId) ||
    typeof draft.source !== "string" ||
    utf8ByteLength(draft.source) > MAX_QUEST_SOURCE_BYTES ||
    !isValidDateString(draft.updatedAt)
  ) {
    return null;
  }
  return {
    questId: draft.questId,
    languageId: draft.languageId,
    source: draft.source,
    updatedAt: draft.updatedAt,
  };
}

function normalizeQuestDrafts(value) {
  const latestByQuestId = new Map();
  for (const storedValue of Array.isArray(value) ? value : []) {
    const draft = normalizeStoredQuestDraft(storedValue);
    if (!draft) continue;
    const previous = latestByQuestId.get(draft.questId);
    if (!previous || previous.updatedAt <= draft.updatedAt) {
      latestByQuestId.set(draft.questId, draft);
    }
  }

  return [...latestByQuestId.values()]
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
    .slice(-MAX_QUEST_DRAFTS);
}

function isValidProblemRevision(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function normalizeStoredCodingTestDraft(value) {
  const draft = snapshotPlainDataDto(value, STORED_CODING_TEST_DRAFT_FIELDS);
  if (
    !draft ||
    !isCodingTestProblemId(draft.problemId) ||
    !isValidProblemRevision(draft.problemRevision) ||
    !isLanguageId(draft.languageId) ||
    !codingTestProblemMatchesLanguage(draft.problemId, draft.languageId) ||
    typeof draft.source !== "string" ||
    utf8ByteLength(draft.source) > MAX_CODING_TEST_SOURCE_BYTES ||
    !isValidDateString(draft.updatedAt)
  ) {
    return null;
  }
  return {
    problemId: draft.problemId,
    problemRevision: draft.problemRevision,
    languageId: draft.languageId,
    source: draft.source,
    updatedAt: draft.updatedAt,
  };
}

function normalizeCodingTestDrafts(value) {
  const latestByProblemId = new Map();
  for (const storedValue of Array.isArray(value) ? value : []) {
    const draft = normalizeStoredCodingTestDraft(storedValue);
    if (!draft) continue;
    const previous = latestByProblemId.get(draft.problemId);
    if (!previous || previous.updatedAt <= draft.updatedAt) {
      latestByProblemId.set(draft.problemId, draft);
    }
  }

  return [...latestByProblemId.values()]
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
    .slice(-MAX_CODING_TEST_DRAFTS);
}

function normalizeCodingTestDraftInput(value) {
  const draft = snapshotPlainDataDto(value, CODING_TEST_DRAFT_INPUT_FIELDS);
  if (
    !draft ||
    !isCodingTestProblemId(draft.problemId) ||
    !isValidProblemRevision(draft.problemRevision) ||
    !isLanguageId(draft.languageId) ||
    !codingTestProblemMatchesLanguage(draft.problemId, draft.languageId)
  ) {
    throw new TypeError("코딩테스트 초안의 문제 ID, 리비전과 언어가 올바르지 않습니다.");
  }
  if (typeof draft.source !== "string") {
    throw new TypeError("코딩테스트 초안 source는 문자열이어야 합니다.");
  }
  if (utf8ByteLength(draft.source) > MAX_CODING_TEST_SOURCE_BYTES) {
    throw new RangeError(
      `코딩테스트 초안은 UTF-8 ${MAX_CODING_TEST_SOURCE_BYTES}바이트 이하여야 합니다.`,
    );
  }
  return {
    problemId: draft.problemId,
    problemRevision: draft.problemRevision,
    languageId: draft.languageId,
    source: draft.source,
  };
}

function isValidCodingTestSubmissionSnapshot(submission, requireStoredFields) {
  return (
    (!requireStoredFields ||
      getCodingTestSubmissionSuffix(submission.id, submission.completedAt) !== null) &&
    isCodingTestProblemId(submission.problemId) &&
    isValidProblemRevision(submission.problemRevision) &&
    isLanguageId(submission.languageId) &&
    codingTestProblemMatchesLanguage(submission.problemId, submission.languageId) &&
    QUEST_OUTCOMES.has(submission.outcome) &&
    Number.isSafeInteger(submission.passed) &&
    submission.passed >= 0 &&
    Number.isSafeInteger(submission.total) &&
    submission.total >= submission.passed &&
    isQuestOutcomeConsistent(submission.outcome, submission.passed, submission.total) &&
    (!requireStoredFields || isValidDateString(submission.completedAt))
  );
}

function normalizeStoredCodingTestSubmission(value) {
  const submission = snapshotPlainDataDto(value, STORED_CODING_TEST_SUBMISSION_FIELDS);
  if (!submission || !isValidCodingTestSubmissionSnapshot(submission, true)) return null;
  return {
    id: submission.id,
    problemId: submission.problemId,
    problemRevision: submission.problemRevision,
    languageId: submission.languageId,
    outcome: submission.outcome,
    passed: submission.passed,
    total: submission.total,
    completedAt: submission.completedAt,
  };
}

function normalizeCodingTestSubmissionInput(value) {
  const submission = snapshotPlainDataDto(value, CODING_TEST_SUBMISSION_INPUT_FIELDS);
  if (!submission || !isValidCodingTestSubmissionSnapshot(submission, false)) {
    throw new TypeError("코딩테스트 제출 결과 형식이 올바르지 않습니다.");
  }
  return {
    problemId: submission.problemId,
    problemRevision: submission.problemRevision,
    languageId: submission.languageId,
    outcome: submission.outcome,
    passed: submission.passed,
    total: submission.total,
  };
}

function isCompletedCodingTestSubmission(submission) {
  return (
    submission.outcome === "passed" &&
    submission.total > 0 &&
    submission.passed === submission.total
  );
}

function normalizeCompletedCodingTestProblem(value) {
  const completed = snapshotPlainDataDto(value, COMPLETED_CODING_TEST_FIELDS);
  if (
    !completed ||
    !isCodingTestProblemId(completed.problemId) ||
    !isValidProblemRevision(completed.problemRevision) ||
    !isValidDateString(completed.completedAt)
  ) {
    return null;
  }
  return {
    problemId: completed.problemId,
    problemRevision: completed.problemRevision,
    completedAt: completed.completedAt,
  };
}

function retainCompletedCodingTestProblem(completedByProblemId, completed) {
  const previous = completedByProblemId.get(completed.problemId);
  if (!previous || previous.completedAt <= completed.completedAt) {
    completedByProblemId.set(completed.problemId, completed);
  }
}

function normalizeCompletedCodingTestProblems(value) {
  const completedByProblemId = new Map();
  for (const storedValue of Array.isArray(value) ? value : []) {
    const completed = normalizeCompletedCodingTestProblem(storedValue);
    if (completed) retainCompletedCodingTestProblem(completedByProblemId, completed);
  }
  return completedByProblemId;
}

function isValidQuestAttemptSnapshot(attempt, requireStoredFields) {
  return (
    (!requireStoredFields || getQuestAttemptSuffix(attempt.id, attempt.completedAt) !== null) &&
    isQuestId(attempt.questId) &&
    Number.isSafeInteger(attempt.questRevision) &&
    attempt.questRevision > 0 &&
    isLanguageId(attempt.languageId) &&
    questMatchesLanguage(attempt.questId, attempt.languageId) &&
    QUEST_OUTCOMES.has(attempt.outcome) &&
    Number.isSafeInteger(attempt.passed) &&
    attempt.passed >= 0 &&
    Number.isSafeInteger(attempt.total) &&
    attempt.total >= attempt.passed &&
    isQuestOutcomeConsistent(attempt.outcome, attempt.passed, attempt.total) &&
    (!requireStoredFields || isValidDateString(attempt.completedAt))
  );
}

function normalizeStoredQuestAttempt(value) {
  const attempt = snapshotPlainDataDto(value, STORED_QUEST_ATTEMPT_FIELDS);
  if (!attempt || !isValidQuestAttemptSnapshot(attempt, true)) return null;
  return {
    id: attempt.id,
    questId: attempt.questId,
    questRevision: attempt.questRevision,
    languageId: attempt.languageId,
    outcome: attempt.outcome,
    passed: attempt.passed,
    total: attempt.total,
    completedAt: attempt.completedAt,
  };
}

function getQuestAttemptSuffix(id, completedAt) {
  if (!isNonEmptyString(id) || !isValidDateString(completedAt)) return null;
  const prefix = `quest-${completedAt}-`;
  if (!id.startsWith(prefix)) return null;
  const suffixText = id.slice(prefix.length);
  if (!/^[1-9][0-9]*$/.test(suffixText)) return null;
  const suffix = Number(suffixText);
  return Number.isSafeInteger(suffix) && suffix > 0 ? suffix : null;
}

function getCodingTestSubmissionSuffix(id, completedAt) {
  if (!isNonEmptyString(id) || !isValidDateString(completedAt)) return null;
  const prefix = `coding-test-${completedAt}-`;
  if (!id.startsWith(prefix)) return null;
  const suffixText = id.slice(prefix.length);
  if (!/^[1-9][0-9]*$/.test(suffixText)) return null;
  const suffix = Number(suffixText);
  return Number.isSafeInteger(suffix) && suffix > 0 ? suffix : null;
}

function isQuestOutcomeConsistent(outcome, passed, total) {
  if (outcome === "passed") return total > 0 && passed === total;
  if (outcome === "wrong_answer") return total > 0 && passed < total;
  return total === 0 || passed < total;
}

function isCompletedQuestAttempt(attempt) {
  return attempt.outcome === "passed" && attempt.total > 0 && attempt.passed === attempt.total;
}

function normalizeQuestDraftInput(draft) {
  const snapshot = snapshotPlainDataDto(draft, QUEST_DRAFT_INPUT_FIELDS);
  if (!snapshot) {
    throw new TypeError("유효한 Code Quest 초안이 필요합니다.");
  }
  if (!isQuestId(snapshot.questId) || !isLanguageId(snapshot.languageId)) {
    throw new TypeError("유효한 questId와 languageId가 필요합니다.");
  }
  if (!questMatchesLanguage(snapshot.questId, snapshot.languageId)) {
    throw new TypeError("Quest ID와 언어가 일치해야 합니다.");
  }
  if (typeof snapshot.source !== "string") {
    throw new TypeError("Code Quest 초안 source는 문자열이어야 합니다.");
  }
  if (utf8ByteLength(snapshot.source) > MAX_QUEST_SOURCE_BYTES) {
    throw new RangeError(`Code Quest 초안은 UTF-8 ${MAX_QUEST_SOURCE_BYTES}바이트 이하여야 합니다.`);
  }
  return {
    questId: snapshot.questId,
    languageId: snapshot.languageId,
    source: snapshot.source,
  };
}

function normalizeQuestAttemptInput(attempt) {
  const snapshot = snapshotPlainDataDto(attempt, QUEST_ATTEMPT_INPUT_FIELDS);
  if (!snapshot || !isValidQuestAttemptSnapshot(snapshot, false)) {
    throw new TypeError("Code Quest 제출 결과 형식이 올바르지 않습니다.");
  }
  return {
    questId: snapshot.questId,
    questRevision: snapshot.questRevision,
    languageId: snapshot.languageId,
    outcome: snapshot.outcome,
    passed: snapshot.passed,
    total: snapshot.total,
  };
}

function isStoredQuizAnswer(answer) {
  return (
    answer &&
    typeof answer === "object" &&
    isQuizQuestionId(answer.questionId) &&
    isStableId(answer.lessonId) &&
    OPTION_ID_PATTERN.test(answer.selectedOptionId) &&
    typeof answer.isCorrect === "boolean"
  );
}

function isStoredQuizAttempt(attempt) {
  return (
    attempt &&
    typeof attempt === "object" &&
    isNonEmptyString(attempt.id) &&
    isLanguageId(attempt.languageId) &&
    isValidDateString(attempt.completedAt) &&
    Number.isInteger(attempt.score) &&
    attempt.score >= 0 &&
    Number.isInteger(attempt.total) &&
    attempt.total > 0 &&
    Array.isArray(attempt.answers) &&
    attempt.answers.length > 0 &&
    attempt.answers.every(isStoredQuizAnswer) &&
    attempt.answers.every((answer) => answer.questionId.startsWith(`quiz-${attempt.languageId}-`)) &&
    attempt.total === attempt.answers.length &&
    attempt.score === attempt.answers.filter((answer) => answer.isCorrect).length &&
    new Set(attempt.answers.map((answer) => answer.questionId)).size === attempt.answers.length
  );
}

function normalizeQuizAttemptInput(attempt) {
  if (!attempt || typeof attempt !== "object" || !isLanguageId(attempt.languageId)) {
    throw new TypeError("유효한 객관식 시도 정보가 필요합니다.");
  }
  if (!Array.isArray(attempt.answers) || attempt.answers.length === 0) {
    throw new TypeError("한 개 이상의 객관식 답안이 필요합니다.");
  }

  const answers = attempt.answers.map((answer) => {
    if (!isStoredQuizAnswer(answer)) {
      throw new TypeError("객관식 답안 형식이 올바르지 않습니다.");
    }
    return {
      questionId: answer.questionId,
      lessonId: answer.lessonId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect: answer.isCorrect,
    };
  });

  if (new Set(answers.map((answer) => answer.questionId)).size !== answers.length) {
    throw new TypeError("하나의 시도에 같은 문제 답안을 중복 저장할 수 없습니다.");
  }
  if (answers.some((answer) => !answer.questionId.startsWith(`quiz-${attempt.languageId}-`))) {
    throw new TypeError("문제 ID와 객관식 언어가 일치해야 합니다.");
  }

  return { languageId: attempt.languageId, answers };
}

export class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  isPersistent() {
    return false;
  }
}

class ResilientBrowserStorage {
  constructor(primaryStorage) {
    this.primaryStorage = primaryStorage;
    this.fallbackStorage = new MemoryStorage();
  }

  getItem(key) {
    if (this.primaryStorage) {
      try {
        const value = this.primaryStorage.getItem(key);
        if (value === null) this.fallbackStorage.removeItem(key);
        else this.fallbackStorage.setItem(key, value);
        return value;
      } catch {
        this.primaryStorage = null;
      }
    }
    return this.fallbackStorage.getItem(key);
  }

  setItem(key, value) {
    if (this.primaryStorage) {
      try {
        this.primaryStorage.setItem(key, value);
        this.fallbackStorage.setItem(key, value);
        return;
      } catch {
        this.primaryStorage = null;
      }
    }
    this.fallbackStorage.setItem(key, value);
  }

  isPersistent() {
    return this.primaryStorage !== null;
  }
}

export function createBrowserStorage(browserWindow = globalThis.window) {
  let primaryStorage = null;
  try {
    primaryStorage = browserWindow?.localStorage ?? null;
  } catch {
    // 개인 정보 보호 설정 등으로 접근이 막히면 현재 탭의 메모리 저장소로 동작합니다.
  }
  return new ResilientBrowserStorage(primaryStorage);
}

export class ProgressRepository {
  getProgress() {
    throw new Error("getProgress()를 구현해야 합니다.");
  }

  setLastLesson() {
    throw new Error("setLastLesson()을 구현해야 합니다.");
  }

  setLessonCompleted() {
    throw new Error("setLessonCompleted()를 구현해야 합니다.");
  }

  recordQuizAttempt() {
    throw new Error("recordQuizAttempt()를 구현해야 합니다.");
  }

  getQuestDraft() {
    throw new Error("getQuestDraft()를 구현해야 합니다.");
  }

  saveQuestDraft() {
    throw new Error("saveQuestDraft()를 구현해야 합니다.");
  }

  clearQuestDraft() {
    throw new Error("clearQuestDraft()를 구현해야 합니다.");
  }

  recordQuestAttempt() {
    throw new Error("recordQuestAttempt()를 구현해야 합니다.");
  }

  getCodingTestDraft() {
    throw new Error("getCodingTestDraft()를 구현해야 합니다.");
  }

  saveCodingTestDraft() {
    throw new Error("saveCodingTestDraft()를 구현해야 합니다.");
  }

  clearCodingTestDraft() {
    throw new Error("clearCodingTestDraft()를 구현해야 합니다.");
  }

  recordCodingTestSubmission() {
    throw new Error("recordCodingTestSubmission()을 구현해야 합니다.");
  }

  getPersistenceStatus() {
    throw new Error("getPersistenceStatus()를 구현해야 합니다.");
  }
}

export class LocalStorageProgressRepository extends ProgressRepository {
  constructor(storage, clock = () => new Date()) {
    super();
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
      throw new TypeError("localStorage와 호환되는 저장소가 필요합니다.");
    }
    this.storage = storage;
    this.clock = clock;
  }

  getProgress() {
    let raw;
    try {
      raw = this.storage.getItem(PROGRESS_STORAGE_KEY);
    } catch {
      return createEmptyProgress();
    }
    if (!raw) return createEmptyProgress();
    try {
      return normalizeProgress(JSON.parse(raw));
    } catch {
      return createEmptyProgress();
    }
  }

  getPersistenceStatus() {
    return {
      isPersistent:
        typeof this.storage.isPersistent === "function" ? this.storage.isPersistent() : true,
    };
  }

  setLastLesson(lessonId) {
    if (!isStableId(lessonId)) {
      throw new TypeError("유효한 lessonId가 필요합니다.");
    }
    return this.#save({ ...this.getProgress(), lastLessonId: lessonId });
  }

  setLessonCompleted(lessonId, completed = true) {
    if (!isStableId(lessonId)) {
      throw new TypeError("유효한 lessonId가 필요합니다.");
    }

    const progress = this.getProgress();
    const completedIds = new Set(progress.completedLessonIds);
    if (completed) completedIds.add(lessonId);
    else completedIds.delete(lessonId);

    return this.#save({
      ...progress,
      completedLessonIds: [...completedIds],
      lastLessonId: lessonId,
    });
  }

  recordQuizAttempt(attemptInput) {
    const attempt = normalizeQuizAttemptInput(attemptInput);
    const progress = this.getProgress();
    const completedAt = this.clock().toISOString();
    const incorrectQuestionIds = new Set(progress.incorrectQuestionIds);

    for (const answer of attempt.answers) {
      if (answer.isCorrect) incorrectQuestionIds.delete(answer.questionId);
      else incorrectQuestionIds.add(answer.questionId);
    }

    const storedAttempt = {
      id: createQuizAttemptId(completedAt, progress.quizAttempts),
      languageId: attempt.languageId,
      answers: attempt.answers,
      score: attempt.answers.filter((answer) => answer.isCorrect).length,
      total: attempt.answers.length,
      completedAt,
    };

    return this.#save(
      {
        ...progress,
        quizAttempts: [...progress.quizAttempts, storedAttempt].slice(-MAX_QUIZ_ATTEMPTS),
        incorrectQuestionIds: [...incorrectQuestionIds],
      },
      completedAt,
    );
  }

  getQuestDraft(questId) {
    if (!isQuestId(questId)) {
      throw new TypeError("유효한 questId가 필요합니다.");
    }
    return this.getProgress().questDrafts.find((draft) => draft.questId === questId) ?? null;
  }

  saveQuestDraft(draftInput) {
    const draft = normalizeQuestDraftInput(draftInput);
    const progress = this.getProgress();
    const updatedAt = this.clock().toISOString();

    return this.#save(
      {
        ...progress,
        questDrafts: [
          ...progress.questDrafts.filter((stored) => stored.questId !== draft.questId),
          { ...draft, updatedAt },
        ].slice(-MAX_QUEST_DRAFTS),
      },
      updatedAt,
    );
  }

  clearQuestDraft(questId) {
    if (!isQuestId(questId)) {
      throw new TypeError("유효한 questId가 필요합니다.");
    }
    const progress = this.getProgress();
    return this.#save({
      ...progress,
      questDrafts: progress.questDrafts.filter((draft) => draft.questId !== questId),
    });
  }

  recordQuestAttempt(attemptInput) {
    const attempt = normalizeQuestAttemptInput(attemptInput);
    const progress = this.getProgress();
    const completedAt = this.clock().toISOString();
    const storedAttempt = {
      id: createQuestAttemptId(completedAt, progress.questAttempts),
      ...attempt,
      completedAt,
    };
    const completedQuestIds = new Set(progress.completedQuestIds);
    if (isCompletedQuestAttempt(storedAttempt)) completedQuestIds.add(storedAttempt.questId);

    return this.#save(
      {
        ...progress,
        questAttempts: [...progress.questAttempts, storedAttempt].slice(-MAX_QUEST_ATTEMPTS),
        completedQuestIds: [...completedQuestIds],
      },
      completedAt,
    );
  }

  getCodingTestDraft(problemId, problemRevision) {
    if (!isCodingTestProblemId(problemId) || !isValidProblemRevision(problemRevision)) {
      throw new TypeError("유효한 코딩테스트 문제 ID와 리비전이 필요합니다.");
    }
    return (
      this.getProgress().codingTestDrafts.find(
        (draft) =>
          draft.problemId === problemId && draft.problemRevision === problemRevision,
      ) ?? null
    );
  }

  saveCodingTestDraft(draftInput) {
    const draft = normalizeCodingTestDraftInput(draftInput);
    const progress = this.getProgress();
    const updatedAt = this.clock().toISOString();

    return this.#save(
      {
        ...progress,
        codingTestDrafts: [
          ...progress.codingTestDrafts.filter(
            (stored) => stored.problemId !== draft.problemId,
          ),
          { ...draft, updatedAt },
        ].slice(-MAX_CODING_TEST_DRAFTS),
      },
      updatedAt,
    );
  }

  clearCodingTestDraft(problemId) {
    if (!isCodingTestProblemId(problemId)) {
      throw new TypeError("유효한 코딩테스트 문제 ID가 필요합니다.");
    }
    const progress = this.getProgress();
    return this.#save({
      ...progress,
      codingTestDrafts: progress.codingTestDrafts.filter(
        (draft) => draft.problemId !== problemId,
      ),
    });
  }

  recordCodingTestSubmission(submissionInput) {
    const submission = normalizeCodingTestSubmissionInput(submissionInput);
    const progress = this.getProgress();
    const completedAt = this.clock().toISOString();
    const storedSubmission = {
      id: createCodingTestSubmissionId(completedAt, progress.codingTestSubmissions),
      ...submission,
      completedAt,
    };
    const completedCodingTestProblems = normalizeCompletedCodingTestProblems(
      progress.completedCodingTestProblems,
    );
    if (isCompletedCodingTestSubmission(storedSubmission)) {
      retainCompletedCodingTestProblem(completedCodingTestProblems, {
        problemId: storedSubmission.problemId,
        problemRevision: storedSubmission.problemRevision,
        completedAt,
      });
    }

    return this.#save(
      {
        ...progress,
        codingTestSubmissions: [
          ...progress.codingTestSubmissions,
          storedSubmission,
        ].slice(-MAX_CODING_TEST_SUBMISSIONS),
        completedCodingTestProblems: [...completedCodingTestProblems.values()],
      },
      completedAt,
    );
  }

  #save(progress, updatedAt = this.clock().toISOString()) {
    const nextProgress = normalizeProgress({
      ...progress,
      schemaVersion: 1,
      updatedAt,
    });
    this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
    return nextProgress;
  }
}

function createQuizAttemptId(completedAt, attempts) {
  const prefix = `quiz-${completedAt}-`;
  const largestSuffix = attempts.reduce((largest, attempt) => {
    if (!attempt.id.startsWith(prefix)) return largest;
    const suffix = Number.parseInt(attempt.id.slice(prefix.length), 10);
    return Number.isInteger(suffix) ? Math.max(largest, suffix) : largest;
  }, 0);
  return `${prefix}${largestSuffix + 1}`;
}

function createQuestAttemptId(completedAt, attempts) {
  const prefix = `quest-${completedAt}-`;
  const usedSuffixes = new Set();
  let largestSuffix = 0;
  for (const attempt of attempts) {
    const suffix = getQuestAttemptSuffix(attempt.id, attempt.completedAt);
    if (suffix === null || !attempt.id.startsWith(prefix)) continue;
    usedSuffixes.add(suffix);
    largestSuffix = Math.max(largestSuffix, suffix);
  }

  if (largestSuffix < Number.MAX_SAFE_INTEGER) {
    return `${prefix}${largestSuffix + 1}`;
  }

  let availableSuffix = 1;
  while (usedSuffixes.has(availableSuffix)) availableSuffix += 1;
  return `${prefix}${availableSuffix}`;
}

function createCodingTestSubmissionId(completedAt, submissions) {
  const prefix = `coding-test-${completedAt}-`;
  const usedSuffixes = new Set();
  let largestSuffix = 0;
  for (const submission of submissions) {
    const suffix = getCodingTestSubmissionSuffix(submission.id, submission.completedAt);
    if (suffix === null || !submission.id.startsWith(prefix)) continue;
    usedSuffixes.add(suffix);
    largestSuffix = Math.max(largestSuffix, suffix);
  }

  if (largestSuffix < Number.MAX_SAFE_INTEGER) {
    return `${prefix}${largestSuffix + 1}`;
  }

  let availableSuffix = 1;
  while (usedSuffixes.has(availableSuffix)) availableSuffix += 1;
  return `${prefix}${availableSuffix}`;
}
