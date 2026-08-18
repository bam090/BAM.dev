import {
  findWebCodeQuestSourceIssue,
  getWebAssertionExpected,
  WEB_CODE_QUEST_EVALUATION_KINDS,
} from "./web-code-quest.js";

export const WEB_PROJECT_SCHEMA_VERSION = 1;
export const WEB_PROJECT_CONTRACT_VERSION = 1;
export const WEB_PROJECT_FILE_MAX_BYTES = 20 * 1024;
export const WEB_PROJECT_TOTAL_MAX_BYTES = 64 * 1024;
export const WEB_PROJECT_AUTOMATIC_POINTS = 70;
export const WEB_PROJECT_MANUAL_POINTS = 30;
export const WEB_PROJECT_TOTAL_POINTS = 100;

const textEncoder = new TextEncoder();
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_ID_PATTERN = /^web-project-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const SAFE_POSIX_PATH_PATTERN = /^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/;
const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z_:][A-Za-z0-9_.:-]*$/;
const CSS_PROPERTY_PATTERN = /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/;
const ISO_INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ALLOWED_DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const ALLOWED_FILE_LANGUAGES = new Set(["html", "css"]);
const EVALUATION_LANGUAGE = new Map([
  [WEB_CODE_QUEST_EVALUATION_KINDS.HTML, "html"],
  [WEB_CODE_QUEST_EVALUATION_KINDS.CSS, "css"],
]);
const HTML_ASSERTION_KINDS = new Set([
  "doctype-present",
  "selector-exists",
  "selector-count",
  "attribute-equals",
  "text-includes",
  "nonblank-attribute-count",
  "direct-child-text-equals",
]);
const CSS_ASSERTION_KINDS = new Set([
  "rule-declaration",
  "media-rule-declaration",
  "computed-style",
  "computed-grid-column-count",
  "computed-focus-style",
]);

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
const CONCEPT_REF_FIELDS = new Set(["lessonId", "conceptIds"]);
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
const SUBMISSION_INPUT_FIELDS = new Set([
  "submissionId",
  "submittedAt",
  "files",
  "manualAssessments",
]);
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

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function utf8ByteLength(value) {
  return textEncoder.encode(value).byteLength;
}

function ownEnumerableDataKeys(value) {
  if (!isPlainRecord(value)) return null;
  try {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string")) return null;
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) return null;
    }
    return keys;
  } catch {
    return null;
  }
}

function inspectExactRecord(value, label, allowedFields, errors) {
  const keys = ownEnumerableDataKeys(value);
  if (!keys) {
    errors.push(`${label}은 일반 객체의 열거 가능한 값 필드만 사용해야 합니다.`);
    return null;
  }
  for (const key of keys) {
    if (!allowedFields.has(key)) errors.push(`${label}에 허용되지 않은 필드가 있습니다: ${key}`);
  }
  for (const field of allowedFields) {
    if (!keys.includes(field)) errors.push(`${label}.${field}가 필요합니다.`);
  }
  return value;
}

function inspectDenseArray(value, label, errors, minimum = 0, maximum = Infinity) {
  if (!Array.isArray(value)) {
    errors.push(`${label}은 배열이어야 합니다.`);
    return null;
  }
  const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    errors.push(`${label}.length를 안전하게 확인할 수 없습니다.`);
    return null;
  }
  if (length < minimum) errors.push(`${label}에는 최소 ${minimum}개 항목이 필요합니다.`);
  if (length > maximum) errors.push(`${label}에는 최대 ${maximum}개 항목만 허용됩니다.`);
  const entries = [];
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    const index = typeof key === "string" ? Number(key) : Number.NaN;
    if (!Number.isSafeInteger(index) || index < 0 || index >= length || String(index) !== key) {
      errors.push(`${label} 배열에 허용되지 않은 속성이 있습니다: ${String(key)}`);
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      errors.push(`${label}[${index}]은 열거 가능한 값 항목이어야 합니다.`);
      continue;
    }
    entries.push([index, descriptor.value]);
  }
  entries.sort((left, right) => left[0] - right[0]);
  if (entries.length !== length) errors.push(`${label}에는 비어 있는 배열 항목이 없어야 합니다.`);
  return entries.map(([, item]) => item);
}

function validateStableId(value, label, errors, pattern = STABLE_ID_PATTERN) {
  if (!isNonEmptyString(value) || !pattern.test(value)) {
    errors.push(`${label} 형식이 올바르지 않습니다.`);
    return false;
  }
  return true;
}

function validateStringList(value, label, errors, minimum = 1, maximum = 20) {
  const items = inspectDenseArray(value, label, errors, minimum, maximum) ?? [];
  const seen = new Set();
  items.forEach((item, index) => {
    if (!isNonEmptyString(item)) errors.push(`${label}[${index}]은 비어 있지 않은 문자열이어야 합니다.`);
    if (seen.has(item)) errors.push(`${label}에 중복된 항목이 있습니다: ${item}`);
    seen.add(item);
  });
  return items;
}

export function isSafeWebProjectPath(value) {
  if (!isNonEmptyString(value) || !SAFE_POSIX_PATH_PATTERN.test(value)) return false;
  if (value.includes("\\") || value.startsWith("/") || value.endsWith("/")) return false;
  return value.split("/").every((segment) => segment !== "." && segment !== "..");
}

export function findWebProjectSourceIssue(evaluationKind, source) {
  return findWebCodeQuestSourceIssue(evaluationKind, source, {
    disallowInlineStyles:
      evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
  });
}

function assertionFields(kind) {
  if (kind === "doctype-present") return new Set(["kind"]);
  if (kind === "selector-exists") return new Set(["kind", "selector"]);
  if (kind === "selector-count") return new Set(["kind", "selector", "expected"]);
  if (kind === "attribute-equals") return new Set(["kind", "selector", "attribute", "expected"]);
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

function validateAssertion(value, evaluationKind, label, errors) {
  if (!isPlainRecord(value) || !isNonEmptyString(value.kind)) {
    errors.push(`${label}은 kind를 가진 일반 객체여야 합니다.`);
    return null;
  }
  const fields = assertionFields(value.kind);
  const allowedKinds =
    evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.HTML
      ? HTML_ASSERTION_KINDS
      : CSS_ASSERTION_KINDS;
  if (!fields || !allowedKinds.has(value.kind)) {
    errors.push(`${label}.kind는 ${evaluationKind}에서 허용되지 않습니다.`);
    return null;
  }
  if (!inspectExactRecord(value, label, fields, errors)) return null;
  if (value.kind !== "doctype-present") {
    if (!isNonEmptyString(value.selector) || value.selector.length > 200) {
      errors.push(`${label}.selector는 1~200자의 문자열이어야 합니다.`);
    }
  }
  if (value.kind === "selector-count" || value.kind === "nonblank-attribute-count") {
    if (!Number.isSafeInteger(value.expected) || value.expected < 0) {
      errors.push(`${label}.expected는 0 이상의 안전한 정수여야 합니다.`);
    }
    if (
      value.kind === "nonblank-attribute-count" &&
      (!isNonEmptyString(value.attribute) || !ATTRIBUTE_NAME_PATTERN.test(value.attribute))
    ) {
      errors.push(`${label}.attribute 형식이 올바르지 않습니다.`);
    }
  } else if (value.kind === "attribute-equals") {
    if (!isNonEmptyString(value.attribute) || !ATTRIBUTE_NAME_PATTERN.test(value.attribute)) {
      errors.push(`${label}.attribute 형식이 올바르지 않습니다.`);
    }
    if (typeof value.expected !== "string") errors.push(`${label}.expected는 문자열이어야 합니다.`);
  } else if (value.kind === "text-includes") {
    if (!isNonEmptyString(value.expected)) errors.push(`${label}.expected가 필요합니다.`);
  } else if (value.kind === "direct-child-text-equals") {
    for (const field of ["childSelector", "textSelector"]) {
      if (!isNonEmptyString(value[field]) || value[field].length > 200) {
        errors.push(`${label}.${field}는 1~200자의 문자열이어야 합니다.`);
      }
    }
    if (!Number.isSafeInteger(value.childIndex) || value.childIndex < 0 || value.childIndex > 99) {
      errors.push(`${label}.childIndex는 0~99의 안전한 정수여야 합니다.`);
    }
    if (!isNonEmptyString(value.expected)) errors.push(`${label}.expected가 필요합니다.`);
  } else if (value.kind === "computed-grid-column-count") {
    if (
      !Number.isSafeInteger(value.viewportWidth) ||
      value.viewportWidth < 320 ||
      value.viewportWidth > 1920
    ) {
      errors.push(`${label}.viewportWidth는 320~1920의 안전한 정수여야 합니다.`);
    }
    if (!Number.isSafeInteger(value.expected) || value.expected < 1 || value.expected > 12) {
      errors.push(`${label}.expected는 1~12의 안전한 정수여야 합니다.`);
    }
  } else if (CSS_ASSERTION_KINDS.has(value.kind)) {
    if (
      value.kind === "media-rule-declaration" &&
      (!isNonEmptyString(value.condition) || value.condition.length > 200)
    ) {
      errors.push(`${label}.condition은 1~200자의 문자열이어야 합니다.`);
    }
    if (!isNonEmptyString(value.property) || !CSS_PROPERTY_PATTERN.test(value.property)) {
      errors.push(`${label}.property 형식이 올바르지 않습니다.`);
    }
    if (!isNonEmptyString(value.expected)) errors.push(`${label}.expected가 필요합니다.`);
  }
  getWebAssertionExpected(value);
  return value;
}

function validateConceptRefs(project, curriculum, label, errors) {
  const refs = inspectDenseArray(project.conceptRefs, `${label}.conceptRefs`, errors, 1, 8) ?? [];
  const lessonMap = new Map(
    (Array.isArray(curriculum?.lessons) ? curriculum.lessons : [])
      .filter((lesson) => isPlainRecord(lesson) && isNonEmptyString(lesson.id))
      .map((lesson) => [lesson.id, lesson]),
  );
  if (lessonMap.size === 0) errors.push("교안 연결을 확인할 커리큘럼이 필요합니다.");
  const lessonIds = new Set();
  refs.forEach((value, index) => {
    const refLabel = `${label}.conceptRefs[${index}]`;
    const ref = inspectExactRecord(value, refLabel, CONCEPT_REF_FIELDS, errors);
    if (!ref) return;
    if (!validateStableId(ref.lessonId, `${refLabel}.lessonId`, errors)) return;
    if (lessonIds.has(ref.lessonId)) errors.push(`${label}.conceptRefs에 중복 교안이 있습니다: ${ref.lessonId}`);
    lessonIds.add(ref.lessonId);
    const lesson = lessonMap.get(ref.lessonId);
    if (!lesson) errors.push(`${refLabel}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
    const conceptIds = validateStringList(ref.conceptIds, `${refLabel}.conceptIds`, errors, 1, 12);
    conceptIds.forEach((conceptId, conceptIndex) => {
      if (!CONCEPT_ID_PATTERN.test(conceptId)) {
        errors.push(`${refLabel}.conceptIds[${conceptIndex}] 형식이 올바르지 않습니다.`);
      } else if (lesson && !lesson.conceptIds?.includes(conceptId)) {
        errors.push(`${refLabel}.conceptIds에 연결 교안에 없는 개념이 있습니다: ${conceptId}`);
      }
    });
  });
}

function validateProjectFiles(project, label, errors, sourceField = "starterSource") {
  const fields = inspectDenseArray(project.files, `${label}.files`, errors, 2, 2) ?? [];
  const paths = new Set();
  const languageCounts = new Map();
  let totalBytes = 0;
  fields.forEach((value, index) => {
    const fileLabel = `${label}.files[${index}]`;
    const file = inspectExactRecord(value, fileLabel, FILE_FIELDS, errors);
    if (!file) return;
    if (!isSafeWebProjectPath(file.path)) errors.push(`${fileLabel}.path는 안전한 상대 POSIX 경로여야 합니다.`);
    if (paths.has(file.path)) errors.push(`${label}.files에 중복 경로가 있습니다: ${file.path}`);
    paths.add(file.path);
    if (!ALLOWED_FILE_LANGUAGES.has(file.languageId)) {
      errors.push(`${fileLabel}.languageId는 html 또는 css여야 합니다.`);
    } else {
      languageCounts.set(file.languageId, (languageCounts.get(file.languageId) ?? 0) + 1);
      const expectedExtension = file.languageId === "html" ? ".html" : ".css";
      if (!file.path.endsWith(expectedExtension)) {
        errors.push(`${fileLabel}.path 확장자와 languageId가 일치하지 않습니다.`);
      }
      const evaluationKind =
        file.languageId === "html"
          ? WEB_CODE_QUEST_EVALUATION_KINDS.HTML
          : WEB_CODE_QUEST_EVALUATION_KINDS.CSS;
      const issue = findWebProjectSourceIssue(evaluationKind, file[sourceField]);
      if (issue) errors.push(`${fileLabel}.${sourceField}: ${issue.message}`);
    }
    if (typeof file[sourceField] === "string") totalBytes += utf8ByteLength(file[sourceField]);
  });
  for (const languageId of ALLOWED_FILE_LANGUAGES) {
    if (languageCounts.get(languageId) !== 1) {
      errors.push(`${label}.files에는 ${languageId} 파일이 정확히 하나 필요합니다.`);
    }
  }
  if (totalBytes > WEB_PROJECT_TOTAL_MAX_BYTES) {
    errors.push(`${label}.files 전체 UTF-8 크기는 ${WEB_PROJECT_TOTAL_MAX_BYTES}바이트 이하여야 합니다.`);
  }
  return fields;
}

function validateAutomaticCriteria(project, fileMap, label, errors) {
  const criteria = inspectDenseArray(
    project.automaticCriteria,
    `${label}.automaticCriteria`,
    errors,
    1,
    20,
  ) ?? [];
  const ids = new Set();
  let totalPoints = 0;
  criteria.forEach((value, index) => {
    const criterionLabel = `${label}.automaticCriteria[${index}]`;
    const criterion = inspectExactRecord(value, criterionLabel, AUTOMATIC_CRITERION_FIELDS, errors);
    if (!criterion) return;
    if (validateStableId(criterion.id, `${criterionLabel}.id`, errors)) {
      if (ids.has(criterion.id)) errors.push(`${label}.automaticCriteria ID가 중복됩니다: ${criterion.id}`);
      ids.add(criterion.id);
    }
    if (criterion.order !== index + 1) errors.push(`${criterionLabel}.order는 배열에서 1부터 이어져야 합니다.`);
    for (const field of ["title", "description", "failureMessage"]) {
      if (!isNonEmptyString(criterion[field])) errors.push(`${criterionLabel}.${field}가 필요합니다.`);
    }
    if (!Number.isSafeInteger(criterion.maxPoints) || criterion.maxPoints < 1) {
      errors.push(`${criterionLabel}.maxPoints는 1 이상의 안전한 정수여야 합니다.`);
    } else {
      totalPoints += criterion.maxPoints;
    }
    if (!isSafeWebProjectPath(criterion.filePath) || !fileMap.has(criterion.filePath)) {
      errors.push(`${criterionLabel}.filePath가 프로젝트 파일을 가리켜야 합니다.`);
    }
    const expectedLanguage = EVALUATION_LANGUAGE.get(criterion.evaluationKind);
    if (!expectedLanguage) {
      errors.push(`${criterionLabel}.evaluationKind는 html-dom-v1 또는 css-style-v1이어야 합니다.`);
    } else if (fileMap.get(criterion.filePath)?.languageId !== expectedLanguage) {
      errors.push(`${criterionLabel}.evaluationKind와 대상 파일 언어가 일치하지 않습니다.`);
    }
    validateAssertion(criterion.assertion, criterion.evaluationKind, `${criterionLabel}.assertion`, errors);
  });
  if (totalPoints !== WEB_PROJECT_AUTOMATIC_POINTS) {
    errors.push(`${label}.automaticCriteria 배점 합계는 ${WEB_PROJECT_AUTOMATIC_POINTS}점이어야 합니다.`);
  }
  return ids;
}

function validateManualCriteria(project, occupiedIds, label, errors) {
  const criteria = inspectDenseArray(
    project.manualCriteria,
    `${label}.manualCriteria`,
    errors,
    1,
    10,
  ) ?? [];
  let totalPoints = 0;
  criteria.forEach((value, index) => {
    const criterionLabel = `${label}.manualCriteria[${index}]`;
    const criterion = inspectExactRecord(value, criterionLabel, MANUAL_CRITERION_FIELDS, errors);
    if (!criterion) return;
    if (validateStableId(criterion.id, `${criterionLabel}.id`, errors)) {
      if (occupiedIds.has(criterion.id)) errors.push(`${label}에 중복 평가 기준 ID가 있습니다: ${criterion.id}`);
      occupiedIds.add(criterion.id);
    }
    if (criterion.order !== index + 1) errors.push(`${criterionLabel}.order는 배열에서 1부터 이어져야 합니다.`);
    for (const field of ["title", "description"]) {
      if (!isNonEmptyString(criterion[field])) errors.push(`${criterionLabel}.${field}가 필요합니다.`);
    }
    if (!Number.isSafeInteger(criterion.maxPoints) || criterion.maxPoints < 2) {
      errors.push(`${criterionLabel}.maxPoints는 2 이상의 안전한 정수여야 합니다.`);
    } else {
      totalPoints += criterion.maxPoints;
    }
    const scale = inspectDenseArray(criterion.scale, `${criterionLabel}.scale`, errors, 3, 3) ?? [];
    const scaleIds = new Set();
    let previousPoints = -1;
    scale.forEach((value, scaleIndex) => {
      const levelLabel = `${criterionLabel}.scale[${scaleIndex}]`;
      const level = inspectExactRecord(value, levelLabel, SCALE_LEVEL_FIELDS, errors);
      if (!level) return;
      if (validateStableId(level.id, `${levelLabel}.id`, errors)) {
        if (scaleIds.has(level.id)) errors.push(`${criterionLabel}.scale ID가 중복됩니다: ${level.id}`);
        scaleIds.add(level.id);
      }
      for (const field of ["label", "description"]) {
        if (!isNonEmptyString(level[field])) errors.push(`${levelLabel}.${field}가 필요합니다.`);
      }
      if (!Number.isSafeInteger(level.points) || level.points < 0 || level.points > criterion.maxPoints) {
        errors.push(`${levelLabel}.points는 0부터 maxPoints 사이의 안전한 정수여야 합니다.`);
      }
      if (level.points <= previousPoints) errors.push(`${criterionLabel}.scale points는 오름차순이어야 합니다.`);
      previousPoints = level.points;
    });
    if (scale[0]?.points !== 0) errors.push(`${criterionLabel}.scale 첫 단계는 0점이어야 합니다.`);
    if (!(scale[1]?.points > 0 && scale[1]?.points < criterion.maxPoints)) {
      errors.push(`${criterionLabel}.scale 중간 단계는 0점과 maxPoints 사이여야 합니다.`);
    }
    if (scale[2]?.points !== criterion.maxPoints) {
      errors.push(`${criterionLabel}.scale 마지막 단계는 maxPoints여야 합니다.`);
    }
  });
  if (totalPoints !== WEB_PROJECT_MANUAL_POINTS) {
    errors.push(`${label}.manualCriteria 배점 합계는 ${WEB_PROJECT_MANUAL_POINTS}점이어야 합니다.`);
  }
}

function validateCollectionInternal(collection, curriculum) {
  const errors = [];
  if (!inspectExactRecord(collection, "Web Project 컬렉션", COLLECTION_FIELDS, errors)) return errors;
  if (collection.schemaVersion !== WEB_PROJECT_SCHEMA_VERSION) {
    errors.push(`지원하는 Web Project schemaVersion은 ${WEB_PROJECT_SCHEMA_VERSION}입니다.`);
  }
  if (collection.contractVersion !== WEB_PROJECT_CONTRACT_VERSION) {
    errors.push(`지원하는 Web Project contractVersion은 ${WEB_PROJECT_CONTRACT_VERSION}입니다.`);
  }
  if (!isNonEmptyString(collection.title)) errors.push("Web Project 컬렉션.title이 필요합니다.");
  const projects = inspectDenseArray(collection.projects, "Web Project 컬렉션.projects", errors, 1, 20) ?? [];
  const ids = new Set();
  const slugs = new Set();
  projects.forEach((value, index) => {
    const label = `projects[${index}]`;
    const project = inspectExactRecord(value, label, PROJECT_FIELDS, errors);
    if (!project) return;
    if (validateStableId(project.id, `${label}.id`, errors, PROJECT_ID_PATTERN)) {
      if (ids.has(project.id)) errors.push(`Web Project ID가 중복됩니다: ${project.id}`);
      ids.add(project.id);
    }
    if (validateStableId(project.slug, `${label}.slug`, errors)) {
      if (slugs.has(project.slug)) errors.push(`Web Project slug가 중복됩니다: ${project.slug}`);
      slugs.add(project.slug);
    }
    if (!Number.isSafeInteger(project.revision) || project.revision < 1) {
      errors.push(`${label}.revision은 1 이상의 안전한 정수여야 합니다.`);
    }
    if (project.order !== index + 1) errors.push(`${label}.order는 배열에서 1부터 이어져야 합니다.`);
    for (const field of ["title", "summary", "instructions"]) {
      if (!isNonEmptyString(project[field])) errors.push(`${label}.${field}가 필요합니다.`);
    }
    if (!ALLOWED_DIFFICULTIES.has(project.difficulty)) {
      errors.push(`${label}.difficulty 형식이 올바르지 않습니다.`);
    }
    if (!Number.isSafeInteger(project.estimatedMinutes) || project.estimatedMinutes < 10 || project.estimatedMinutes > 480) {
      errors.push(`${label}.estimatedMinutes는 10~480의 안전한 정수여야 합니다.`);
    }
    validateStringList(project.requirements, `${label}.requirements`, errors, 1, 20);
    validateConceptRefs(project, curriculum, label, errors);
    const files = validateProjectFiles(project, label, errors);
    const fileMap = new Map(files.map((file) => [file?.path, file]));
    const criterionIds = validateAutomaticCriteria(project, fileMap, label, errors);
    validateManualCriteria(project, criterionIds, label, errors);
  });
  return errors;
}

export function validateWebProjectCollection(collection, curriculum) {
  try {
    return validateCollectionInternal(collection, curriculum);
  } catch {
    return ["Web Project 콘텐츠를 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidWebProjectCollection(collection, curriculum) {
  const errors = validateWebProjectCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`Web Project 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return collection;
}

export async function loadWebProjectCollection(
  curriculum,
  fetchImplementation = globalThis.fetch,
) {
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("Web Project 콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }
  const response = await fetchImplementation("./content/web-projects/index.json");
  if (!response?.ok) {
    throw new Error(`Web Project 콘텐츠를 불러오지 못했습니다. (${response?.status ?? "unknown"})`);
  }
  return assertValidWebProjectCollection(await response.json(), curriculum);
}

export function getWebProjectsInOrder(collection) {
  return Array.isArray(collection?.projects)
    ? [...collection.projects].sort((left, right) => left.order - right.order)
    : [];
}

export function findWebProjectBySlug(collection, slug) {
  if (!isNonEmptyString(slug) || !STABLE_ID_PATTERN.test(slug)) return null;
  return collection?.projects?.find((project) => project?.slug === slug) ?? null;
}

function isValidIsoInstant(value) {
  if (typeof value !== "string" || !ISO_INSTANT_PATTERN.test(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function validateSubmissionInternal(submission, project) {
  const errors = [];
  if (!inspectExactRecord(submission, "Web Project 제출", SUBMISSION_FIELDS, errors)) return errors;
  validateStableId(submission.submissionId, "Web Project 제출.submissionId", errors);
  if (submission.contractVersion !== WEB_PROJECT_CONTRACT_VERSION) {
    errors.push(`Web Project 제출.contractVersion은 ${WEB_PROJECT_CONTRACT_VERSION}이어야 합니다.`);
  }
  if (submission.projectId !== project?.id) errors.push("Web Project 제출.projectId가 정식 프로젝트와 다릅니다.");
  if (submission.projectRevision !== project?.revision) {
    errors.push("Web Project 제출.projectRevision이 정식 프로젝트와 다릅니다.");
  }
  if (!isValidIsoInstant(submission.submittedAt)) {
    errors.push("Web Project 제출.submittedAt은 정규화된 UTC ISO 시각이어야 합니다.");
  }

  const canonicalFiles = new Map((Array.isArray(project?.files) ? project.files : []).map((file) => [file.path, file]));
  const files = inspectDenseArray(submission.files, "Web Project 제출.files", errors, canonicalFiles.size, canonicalFiles.size) ?? [];
  const filePaths = new Set();
  let totalBytes = 0;
  files.forEach((value, index) => {
    const label = `Web Project 제출.files[${index}]`;
    const file = inspectExactRecord(value, label, SUBMISSION_FILE_FIELDS, errors);
    if (!file) return;
    if (!isSafeWebProjectPath(file.path) || !canonicalFiles.has(file.path)) {
      errors.push(`${label}.path가 정식 프로젝트 파일을 가리켜야 합니다.`);
      return;
    }
    if (filePaths.has(file.path)) errors.push(`Web Project 제출.files에 중복 경로가 있습니다: ${file.path}`);
    filePaths.add(file.path);
    const canonicalFile = canonicalFiles.get(file.path);
    const evaluationKind =
      canonicalFile.languageId === "html"
        ? WEB_CODE_QUEST_EVALUATION_KINDS.HTML
        : WEB_CODE_QUEST_EVALUATION_KINDS.CSS;
    const issue = findWebProjectSourceIssue(evaluationKind, file.source);
    if (issue) errors.push(`${label}.source: ${issue.message}`);
    if (typeof file.source === "string") totalBytes += utf8ByteLength(file.source);
  });
  for (const path of canonicalFiles.keys()) {
    if (!filePaths.has(path)) errors.push(`Web Project 제출.files에 정식 파일이 없습니다: ${path}`);
  }
  if (totalBytes > WEB_PROJECT_TOTAL_MAX_BYTES) {
    errors.push(`Web Project 제출.files 전체 UTF-8 크기는 ${WEB_PROJECT_TOTAL_MAX_BYTES}바이트 이하여야 합니다.`);
  }

  const canonicalCriteria = new Map(
    (Array.isArray(project?.manualCriteria) ? project.manualCriteria : []).map((criterion) => [criterion.id, criterion]),
  );
  const assessments = inspectDenseArray(
    submission.manualAssessments,
    "Web Project 제출.manualAssessments",
    errors,
    canonicalCriteria.size,
    canonicalCriteria.size,
  ) ?? [];
  const criterionIds = new Set();
  assessments.forEach((value, index) => {
    const label = `Web Project 제출.manualAssessments[${index}]`;
    const assessment = inspectExactRecord(value, label, MANUAL_ASSESSMENT_FIELDS, errors);
    if (!assessment) return;
    const criterion = canonicalCriteria.get(assessment.criterionId);
    if (!criterion) errors.push(`${label}.criterionId가 정식 수동 평가 기준을 가리켜야 합니다.`);
    if (criterionIds.has(assessment.criterionId)) {
      errors.push(`Web Project 제출.manualAssessments criterionId가 중복됩니다: ${assessment.criterionId}`);
    }
    criterionIds.add(assessment.criterionId);
    if (assessment.status === "pending") {
      if (assessment.levelId !== null) errors.push(`${label}.pending 상태의 levelId는 null이어야 합니다.`);
    } else if (assessment.status === "self_assessed") {
      if (!criterion?.scale?.some((level) => level.id === assessment.levelId)) {
        errors.push(`${label}.levelId가 정식 평가 단계와 일치하지 않습니다.`);
      }
    } else {
      errors.push(`${label}.status는 pending 또는 self_assessed여야 합니다.`);
    }
  });
  for (const criterionId of canonicalCriteria.keys()) {
    if (!criterionIds.has(criterionId)) {
      errors.push(`Web Project 제출.manualAssessments에 정식 평가 기준이 없습니다: ${criterionId}`);
    }
  }
  return errors;
}

export function validateWebProjectSubmission(submission, project) {
  try {
    return validateSubmissionInternal(submission, project);
  } catch {
    return ["Web Project 제출을 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidWebProjectSubmission(submission, project) {
  const errors = validateWebProjectSubmission(submission, project);
  if (errors.length > 0) {
    throw new Error(`Web Project 제출 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return submission;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function findCanonicalProject(collection, project) {
  if (!isPlainRecord(collection) || !Array.isArray(collection.projects)) {
    throw new TypeError("정식 Web Project 컬렉션이 필요합니다.");
  }
  const canonical = collection.projects.find((candidate) => candidate?.id === project?.id);
  if (!canonical) throw new Error("Web Project가 정식 컬렉션에 속하지 않습니다.");
  return canonical;
}

export function snapshotWebProjectSubmission(collection, project, submission) {
  const canonicalProject = findCanonicalProject(collection, project);
  assertValidWebProjectSubmission(submission, canonicalProject);
  return deepFreeze({
    submissionId: submission.submissionId,
    contractVersion: submission.contractVersion,
    projectId: canonicalProject.id,
    projectRevision: canonicalProject.revision,
    submittedAt: submission.submittedAt,
    files: submission.files.map((file) => ({ path: file.path, source: file.source })),
    manualAssessments: submission.manualAssessments.map((assessment) => ({
      criterionId: assessment.criterionId,
      status: assessment.status,
      levelId: assessment.levelId,
    })),
  });
}

export function createWebProjectSubmission(collection, project, input) {
  const canonicalProject = findCanonicalProject(collection, project);
  const inputErrors = [];
  inspectExactRecord(input, "Web Project 제출 입력", SUBMISSION_INPUT_FIELDS, inputErrors);
  if (inputErrors.length > 0) {
    throw new TypeError(`Web Project 제출 입력 검증 실패:\n- ${inputErrors.join("\n- ")}`);
  }
  const submission = {
    submissionId: input.submissionId,
    contractVersion: WEB_PROJECT_CONTRACT_VERSION,
    projectId: canonicalProject.id,
    projectRevision: canonicalProject.revision,
    submittedAt: input.submittedAt,
    files: input.files,
    manualAssessments: input.manualAssessments,
  };
  return snapshotWebProjectSubmission(collection, canonicalProject, submission);
}
