import {
  WEB_PROJECT_AUTOMATIC_POINTS,
  WEB_PROJECT_CONTRACT_VERSION,
  WEB_PROJECT_MANUAL_POINTS,
  WEB_PROJECT_TOTAL_POINTS,
} from "../core/web-project.js";

export const WEB_PROJECT_AUTOMATIC_OUTCOMES = Object.freeze([
  "passed",
  "failed",
  "invalid_source",
  "engine_error",
  "cancelled",
  "not_run",
]);
export const WEB_PROJECT_MANUAL_STATUSES = Object.freeze(["pending", "self_assessed"]);

const AUTOMATIC_OUTCOME_SET = new Set(WEB_PROJECT_AUTOMATIC_OUTCOMES);
const COMPLETE_AUTOMATIC_OUTCOMES = new Set(["passed", "failed", "invalid_source"]);
const MANUAL_STATUS_SET = new Set(WEB_PROJECT_MANUAL_STATUSES);
const EVALUATION_FIELDS = new Set(["automaticResults", "manualAssessments"]);
const AUTOMATIC_RESULT_FIELDS = new Set(["criterionId", "outcome"]);
const MANUAL_ASSESSMENT_FIELDS = new Set(["criterionId", "status", "levelId"]);
const AUTOMATIC_CRITERION_REQUIRED_FIELDS = new Set(["id", "maxPoints"]);
const MANUAL_CRITERION_REQUIRED_FIELDS = new Set(["id", "maxPoints", "scale"]);
const SCALE_LEVEL_REQUIRED_FIELDS = new Set(["id", "points"]);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
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

function inspectRequiredRecord(value, label, requiredFields, errors) {
  const keys = ownEnumerableDataKeys(value);
  if (!keys) {
    errors.push(`${label}은 일반 객체의 열거 가능한 값 필드만 사용해야 합니다.`);
    return null;
  }
  for (const field of requiredFields) {
    if (!keys.includes(field)) errors.push(`${label}.${field}가 필요합니다.`);
  }
  return value;
}

function inspectDenseArray(value, label, errors, expectedLength = null) {
  if (!Array.isArray(value)) {
    errors.push(`${label}은 배열이어야 합니다.`);
    return [];
  }
  const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    errors.push(`${label}.length를 안전하게 확인할 수 없습니다.`);
    return [];
  }
  if (expectedLength !== null && length !== expectedLength) {
    errors.push(`${label}에는 정확히 ${expectedLength}개 항목이 필요합니다.`);
  }
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

function hasValidRubric(project, errors) {
  const projectKeys = ownEnumerableDataKeys(project);
  if (!projectKeys) {
    errors.push("점수를 계산할 정식 Web Project가 필요합니다.");
    return false;
  }
  for (const field of ["id", "revision", "automaticCriteria", "manualCriteria"]) {
    if (!projectKeys.includes(field)) errors.push(`Web Project.${field}가 필요합니다.`);
  }
  if (typeof project.id !== "string" || !Number.isSafeInteger(project.revision)) {
    errors.push("Web Project의 id와 revision이 필요합니다.");
  }

  const automaticCriteria = inspectDenseArray(
    project.automaticCriteria,
    "Web Project.automaticCriteria",
    errors,
  );
  const manualCriteria = inspectDenseArray(
    project.manualCriteria,
    "Web Project.manualCriteria",
    errors,
  );
  if (!Array.isArray(project.automaticCriteria) || !Array.isArray(project.manualCriteria)) return false;

  const occupiedCriterionIds = new Set();
  let automaticPoints = 0;
  automaticCriteria.forEach((value, index) => {
    const label = `Web Project.automaticCriteria[${index}]`;
    const criterion = inspectRequiredRecord(
      value,
      label,
      AUTOMATIC_CRITERION_REQUIRED_FIELDS,
      errors,
    );
    if (!criterion) return;
    if (typeof criterion.id !== "string" || criterion.id.trim().length === 0) {
      errors.push(`${label}.id는 비어 있지 않은 문자열이어야 합니다.`);
    } else {
      if (occupiedCriterionIds.has(criterion.id)) {
        errors.push(`Web Project 자동 평가 기준 ID가 중복됩니다: ${criterion.id}`);
      }
      occupiedCriterionIds.add(criterion.id);
    }
    if (!Number.isSafeInteger(criterion.maxPoints) || criterion.maxPoints < 1) {
      errors.push(`${label}.maxPoints는 1 이상의 안전한 정수여야 합니다.`);
      return;
    }
    const nextTotal = automaticPoints + criterion.maxPoints;
    if (!Number.isSafeInteger(nextTotal)) {
      errors.push("Web Project.automaticCriteria 배점 합계를 안전하게 계산할 수 없습니다.");
      return;
    }
    automaticPoints = nextTotal;
  });

  let manualPoints = 0;
  manualCriteria.forEach((value, index) => {
    const label = `Web Project.manualCriteria[${index}]`;
    const criterion = inspectRequiredRecord(
      value,
      label,
      MANUAL_CRITERION_REQUIRED_FIELDS,
      errors,
    );
    if (!criterion) return;
    if (typeof criterion.id !== "string" || criterion.id.trim().length === 0) {
      errors.push(`${label}.id는 비어 있지 않은 문자열이어야 합니다.`);
    } else {
      if (occupiedCriterionIds.has(criterion.id)) {
        errors.push(`Web Project에 중복 평가 기준 ID가 있습니다: ${criterion.id}`);
      }
      occupiedCriterionIds.add(criterion.id);
    }

    const maxPoints = criterion.maxPoints;
    if (!Number.isSafeInteger(maxPoints) || maxPoints < 1) {
      errors.push(`${label}.maxPoints는 1 이상의 안전한 정수여야 합니다.`);
    } else {
      const nextTotal = manualPoints + maxPoints;
      if (!Number.isSafeInteger(nextTotal)) {
        errors.push("Web Project.manualCriteria 배점 합계를 안전하게 계산할 수 없습니다.");
      } else {
        manualPoints = nextTotal;
      }
    }

    const scale = inspectDenseArray(criterion.scale, `${label}.scale`, errors, 3);
    const scaleIds = new Set();
    const scalePoints = [];
    scale.forEach((levelValue, levelIndex) => {
      const levelLabel = `${label}.scale[${levelIndex}]`;
      const level = inspectRequiredRecord(
        levelValue,
        levelLabel,
        SCALE_LEVEL_REQUIRED_FIELDS,
        errors,
      );
      if (!level) return;
      if (typeof level.id !== "string" || level.id.trim().length === 0) {
        errors.push(`${levelLabel}.id는 비어 있지 않은 문자열이어야 합니다.`);
      } else {
        if (scaleIds.has(level.id)) errors.push(`${label}.scale ID가 중복됩니다: ${level.id}`);
        scaleIds.add(level.id);
      }
      if (
        !Number.isSafeInteger(level.points) ||
        !Number.isSafeInteger(maxPoints) ||
        maxPoints < 1 ||
        level.points < 0 ||
        level.points > maxPoints
      ) {
        errors.push(`${levelLabel}.points는 0부터 maxPoints 사이의 안전한 정수여야 합니다.`);
        scalePoints[levelIndex] = null;
        return;
      }
      scalePoints[levelIndex] = level.points;
    });
    for (let scaleIndex = 1; scaleIndex < scalePoints.length; scaleIndex += 1) {
      const previous = scalePoints[scaleIndex - 1];
      const current = scalePoints[scaleIndex];
      if (previous !== null && current !== null && current <= previous) {
        errors.push(`${label}.scale points는 엄격한 오름차순이어야 합니다.`);
      }
    }
    if (scalePoints[0] !== 0) errors.push(`${label}.scale 첫 단계는 0점이어야 합니다.`);
    if (scalePoints[2] !== maxPoints) {
      errors.push(`${label}.scale 마지막 단계는 maxPoints여야 합니다.`);
    }
  });

  if (automaticPoints !== WEB_PROJECT_AUTOMATIC_POINTS) {
    errors.push(`자동 평가 배점 합계는 ${WEB_PROJECT_AUTOMATIC_POINTS}점이어야 합니다.`);
  }
  if (manualPoints !== WEB_PROJECT_MANUAL_POINTS) {
    errors.push(`수동 평가 배점 합계는 ${WEB_PROJECT_MANUAL_POINTS}점이어야 합니다.`);
  }
  return errors.length === 0;
}

export function validateWebProjectScoringInput(project, evaluation) {
  try {
  const errors = [];
  if (!hasValidRubric(project, errors)) return errors;
  if (!inspectExactRecord(evaluation, "Web Project 평가 입력", EVALUATION_FIELDS, errors)) return errors;

  const automaticById = new Map(project.automaticCriteria.map((criterion) => [criterion.id, criterion]));
  const automaticResults = inspectDenseArray(
    evaluation.automaticResults,
    "Web Project 평가 입력.automaticResults",
    errors,
    automaticById.size,
  );
  const automaticIds = new Set();
  automaticResults.forEach((value, index) => {
    const label = `Web Project 평가 입력.automaticResults[${index}]`;
    const result = inspectExactRecord(value, label, AUTOMATIC_RESULT_FIELDS, errors);
    if (!result) return;
    if (!automaticById.has(result.criterionId)) {
      errors.push(`${label}.criterionId가 정식 자동 평가 기준을 가리켜야 합니다.`);
    }
    if (automaticIds.has(result.criterionId)) {
      errors.push(`자동 평가 criterionId가 중복됩니다: ${result.criterionId}`);
    }
    automaticIds.add(result.criterionId);
    if (!AUTOMATIC_OUTCOME_SET.has(result.outcome)) {
      errors.push(`${label}.outcome이 지원하는 자동 평가 상태가 아닙니다.`);
    }
  });
  for (const criterionId of automaticById.keys()) {
    if (!automaticIds.has(criterionId)) errors.push(`자동 평가 결과가 없습니다: ${criterionId}`);
  }

  const manualById = new Map(project.manualCriteria.map((criterion) => [criterion.id, criterion]));
  const manualAssessments = inspectDenseArray(
    evaluation.manualAssessments,
    "Web Project 평가 입력.manualAssessments",
    errors,
    manualById.size,
  );
  const manualIds = new Set();
  manualAssessments.forEach((value, index) => {
    const label = `Web Project 평가 입력.manualAssessments[${index}]`;
    const assessment = inspectExactRecord(value, label, MANUAL_ASSESSMENT_FIELDS, errors);
    if (!assessment) return;
    const criterion = manualById.get(assessment.criterionId);
    if (!criterion) errors.push(`${label}.criterionId가 정식 수동 평가 기준을 가리켜야 합니다.`);
    if (manualIds.has(assessment.criterionId)) {
      errors.push(`수동 평가 criterionId가 중복됩니다: ${assessment.criterionId}`);
    }
    manualIds.add(assessment.criterionId);
    if (!MANUAL_STATUS_SET.has(assessment.status)) {
      errors.push(`${label}.status가 지원하는 수동 평가 상태가 아닙니다.`);
    } else if (assessment.status === "pending") {
      if (assessment.levelId !== null) errors.push(`${label}.pending 상태의 levelId는 null이어야 합니다.`);
    } else if (!criterion?.scale?.some((level) => level.id === assessment.levelId)) {
      errors.push(`${label}.levelId가 정식 평가 단계와 일치하지 않습니다.`);
    }
  });
  for (const criterionId of manualById.keys()) {
    if (!manualIds.has(criterionId)) errors.push(`수동 평가 결과가 없습니다: ${criterionId}`);
  }
  return errors;
  } catch {
    return ["Web Project 점수 입력을 안전하게 검증할 수 없습니다."];
  }
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

export function scoreWebProject(project, evaluation) {
  const errors = validateWebProjectScoringInput(project, evaluation);
  if (errors.length > 0) {
    throw new Error(`Web Project 점수 입력 검증 실패:\n- ${errors.join("\n- ")}`);
  }

  const automaticById = new Map(
    evaluation.automaticResults.map((result) => [result.criterionId, result]),
  );
  const automaticCriteria = project.automaticCriteria.map((criterion) => {
    const outcome = automaticById.get(criterion.id).outcome;
    const isComplete = COMPLETE_AUTOMATIC_OUTCOMES.has(outcome);
    return {
      criterionId: criterion.id,
      outcome,
      earnedPoints: isComplete ? (outcome === "passed" ? criterion.maxPoints : 0) : null,
      maxPoints: criterion.maxPoints,
      isComplete,
    };
  });
  const automaticComplete = automaticCriteria.every((criterion) => criterion.isComplete);
  const automaticEarnedPoints = automaticComplete
    ? automaticCriteria.reduce((total, criterion) => total + criterion.earnedPoints, 0)
    : null;

  const manualById = new Map(
    evaluation.manualAssessments.map((assessment) => [assessment.criterionId, assessment]),
  );
  const manualCriteria = project.manualCriteria.map((criterion) => {
    const assessment = manualById.get(criterion.id);
    const level =
      assessment.status === "self_assessed"
        ? criterion.scale.find((candidate) => candidate.id === assessment.levelId)
        : null;
    const isComplete = assessment.status === "self_assessed";
    return {
      criterionId: criterion.id,
      status: assessment.status,
      levelId: assessment.levelId,
      earnedPoints: isComplete ? level.points : null,
      maxPoints: criterion.maxPoints,
      isComplete,
    };
  });
  const manualComplete = manualCriteria.every((criterion) => criterion.isComplete);
  const manualEarnedPoints = manualComplete
    ? manualCriteria.reduce((total, criterion) => total + criterion.earnedPoints, 0)
    : null;

  const isComplete = automaticComplete && manualComplete;
  return deepFreeze({
    contractVersion: WEB_PROJECT_CONTRACT_VERSION,
    projectId: project.id,
    projectRevision: project.revision,
    isComplete,
    isVerified: false,
    provisionalScore: isComplete ? automaticEarnedPoints + manualEarnedPoints : null,
    maxPoints: WEB_PROJECT_TOTAL_POINTS,
    automatic: {
      status: automaticComplete ? "complete" : "incomplete",
      earnedPoints: automaticEarnedPoints,
      maxPoints: WEB_PROJECT_AUTOMATIC_POINTS,
      criteria: automaticCriteria,
    },
    manual: {
      status: manualComplete ? "complete" : "incomplete",
      earnedPoints: manualEarnedPoints,
      maxPoints: WEB_PROJECT_MANUAL_POINTS,
      criteria: manualCriteria,
    },
  });
}
