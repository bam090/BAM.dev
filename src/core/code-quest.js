import {
  createExecutionRequestSnapshot,
  validateExecutionRequest,
} from "../grading/code-grading.js";

const COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "languageId",
  "title",
  "quests",
]);
const QUEST_FIELDS = new Set([
  "id",
  "slug",
  "revision",
  "order",
  "lessonId",
  "conceptIds",
  "difficulty",
  "estimatedMinutes",
  "title",
  "summary",
  "instructions",
  "functionContract",
  "entryPoint",
  "starterCode",
  "examples",
  "publicTests",
  "failureExplanations",
  "hints",
  "commonMistakes",
]);
const FUNCTION_CONTRACT_FIELDS = new Set([
  "parameters",
  "returns",
  "constraints",
  "complexity",
]);
const PARAMETER_FIELDS = new Set(["name", "type", "description"]);
const RETURN_FIELDS = new Set(["type", "description"]);
const COMPLEXITY_FIELDS = new Set(["time", "space"]);
const EXAMPLE_FIELDS = new Set(["args", "expected", "explanation"]);
const PUBLIC_TEST_FIELDS = new Set(["id", "label", "args", "expected"]);
const FAILURE_EXPLANATION_FIELDS = new Set(["testId", "message"]);
const HINT_FIELDS = new Set(["level", "stage", "title", "content"]);
const COMMON_MISTAKE_FIELDS = new Set(["id", "title", "explanation"]);

const LANGUAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const QUEST_ID_PATTERN = /^quest-[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/;
const ENTRY_POINT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ALLOWED_DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const HINT_STAGE_ORDER = new Map([
  ["concept", 0],
  ["observation", 1],
  ["implementation", 2],
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function appendJsonPath(path, key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function inspectExactRecord(value, label, allowedFields, errors) {
  if (!isPlainRecord(value)) {
    errors.push(`${label}은 일반 객체여야 합니다.`);
    return null;
  }

  const fields = {};
  const presentFields = new Set();
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "symbol") {
      errors.push(`${label}에는 Symbol 필드를 사용할 수 없습니다.`);
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      errors.push(`${label}.${key}는 getter, setter 또는 숨겨진 필드가 아닌 값이어야 합니다.`);
      continue;
    }
    presentFields.add(key);
    if (!allowedFields.has(key)) {
      errors.push(`${label}에 허용되지 않은 필드가 있습니다: ${key}`);
      continue;
    }
    fields[key] = descriptor.value;
  }

  for (const field of allowedFields) {
    if (!presentFields.has(field)) errors.push(`${label}.${field}는 필수 필드입니다.`);
  }
  return fields;
}

function inspectDenseArray(value, label, errors, minimum = 0, maximum = Infinity) {
  if (!Array.isArray(value)) {
    errors.push(`${label}은 배열이어야 합니다.`);
    return null;
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  const length = lengthDescriptor?.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    errors.push(`${label}.length를 안전하게 확인할 수 없습니다.`);
    return null;
  }
  if (length < minimum) errors.push(`${label}에는 최소 ${minimum}개 항목이 필요합니다.`);
  if (length > maximum) errors.push(`${label}에는 최대 ${maximum}개 항목만 허용됩니다.`);

  const indexedValues = [];
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    if (typeof key === "symbol") {
      errors.push(`${label} 배열에는 Symbol 속성을 사용할 수 없습니다.`);
      continue;
    }

    const index = Number(key);
    if (
      !Number.isSafeInteger(index) ||
      index < 0 ||
      index >= length ||
      String(index) !== key
    ) {
      errors.push(`${label} 배열에 허용되지 않은 속성이 있습니다: ${key}`);
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      errors.push(`${label}[${index}]은 getter, setter 또는 숨겨진 항목이 아닌 값이어야 합니다.`);
      continue;
    }
    indexedValues.push([index, descriptor.value]);
  }

  indexedValues.sort((left, right) => left[0] - right[0]);
  if (indexedValues.length !== length) {
    errors.push(`${label}에는 비어 있는 배열 항목이 없어야 합니다.`);
  }
  return indexedValues.map(([, item]) => item);
}

function findJsonValueIssue(rootValue, rootPath) {
  const activeObjects = new WeakSet();
  const stack = [{ kind: "visit", value: rootValue, path: rootPath }];

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame.kind === "exit") {
      activeObjects.delete(frame.value);
      continue;
    }

    const { value, path } = frame;
    if (value === null || typeof value === "string" || typeof value === "boolean") continue;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return `${path}에는 유한한 number가 필요합니다.`;
      continue;
    }
    if (typeof value !== "object") {
      return `${path}의 ${typeof value} 값은 JSON으로 표현할 수 없습니다.`;
    }
    if (activeObjects.has(value)) return `${path}에 순환 참조가 있습니다.`;

    activeObjects.add(value);
    stack.push({ kind: "exit", value });

    if (Array.isArray(value)) {
      const entries = [];
      const length = Object.getOwnPropertyDescriptor(value, "length")?.value;
      if (!Number.isSafeInteger(length) || length < 0) {
        return `${path}.length를 안전하게 확인할 수 없습니다.`;
      }
      for (const key of Reflect.ownKeys(value)) {
        if (key === "length") continue;
        if (typeof key === "symbol") return `${path} 배열에는 Symbol 속성을 사용할 수 없습니다.`;
        const index = Number(key);
        if (
          !Number.isSafeInteger(index) ||
          index < 0 ||
          index >= length ||
          String(index) !== key
        ) {
          return `${path} 배열에 JSON 항목이 아닌 속성 ${JSON.stringify(key)}이 있습니다.`;
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
          return `${path}[${index}]은 getter, setter 또는 숨겨진 항목이 아닌 값이어야 합니다.`;
        }
        entries.push([index, descriptor.value]);
      }
      entries.sort((left, right) => left[0] - right[0]);
      if (entries.length !== length) return `${path}에는 비어 있는 배열 항목이 있습니다.`;
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        stack.push({ kind: "visit", value: entries[index][1], path: `${path}[${entries[index][0]}]` });
      }
      continue;
    }

    if (!isPlainRecord(value)) return `${path}에는 일반 객체나 배열만 사용할 수 있습니다.`;
    const entries = [];
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key === "symbol") return `${path} 객체에는 Symbol 키를 사용할 수 없습니다.`;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) {
        return `${appendJsonPath(path, key)}은 getter, setter 또는 숨겨진 값이 아니어야 합니다.`;
      }
      entries.push([key, descriptor.value]);
    }
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const [key, nestedValue] = entries[index];
      stack.push({ kind: "visit", value: nestedValue, path: appendJsonPath(path, key) });
    }
  }
  return null;
}

function validateNonEmptyString(value, label, errors) {
  if (!isNonEmptyString(value)) errors.push(`${label}은 비어 있지 않은 문자열이어야 합니다.`);
}

function isValidJavaScriptGradingEntryPoint(entryPoint) {
  // JavaScript 예약어 목록을 복제하지 않고 실제 실행 DTO 계약을 단일 기준으로 사용한다.
  return (
    validateExecutionRequest({
      requestId: "entry-point-contract-check",
      contractVersion: 1,
      questId: "quest-entry-point-contract",
      questRevision: 1,
      languageId: "javascript",
      suite: "public",
      source: "/* entryPoint 계약 검증 */",
      entryPoint,
      tests: [{ id: "entry-point-contract-case", args: [], expected: null }],
    }).length === 0
  );
}

function validateFunctionContract(value, label, errors) {
  const contract = inspectExactRecord(value, label, FUNCTION_CONTRACT_FIELDS, errors);
  if (!contract) return null;

  const parameters = inspectDenseArray(contract.parameters, `${label}.parameters`, errors, 1);
  const parameterNames = new Set();
  for (const [index, parameterValue] of (parameters ?? []).entries()) {
    const parameterLabel = `${label}.parameters[${index}]`;
    const parameter = inspectExactRecord(parameterValue, parameterLabel, PARAMETER_FIELDS, errors);
    if (!parameter) continue;
    if (!isNonEmptyString(parameter.name) || !ENTRY_POINT_PATTERN.test(parameter.name)) {
      errors.push(`${parameterLabel}.name 형식이 올바르지 않습니다.`);
    } else if (parameterNames.has(parameter.name)) {
      errors.push(`${label}의 매개변수 이름이 중복됩니다: ${parameter.name}`);
    }
    parameterNames.add(parameter.name);
    validateNonEmptyString(parameter.type, `${parameterLabel}.type`, errors);
    validateNonEmptyString(parameter.description, `${parameterLabel}.description`, errors);
  }

  const returns = inspectExactRecord(contract.returns, `${label}.returns`, RETURN_FIELDS, errors);
  if (returns) {
    validateNonEmptyString(returns.type, `${label}.returns.type`, errors);
    validateNonEmptyString(returns.description, `${label}.returns.description`, errors);
  }

  const constraints = inspectDenseArray(contract.constraints, `${label}.constraints`, errors, 1);
  const normalizedConstraints = new Set();
  for (const [index, constraint] of (constraints ?? []).entries()) {
    validateNonEmptyString(constraint, `${label}.constraints[${index}]`, errors);
    if (isNonEmptyString(constraint)) {
      const normalized = constraint.trim();
      if (normalizedConstraints.has(normalized)) {
        errors.push(`${label}.constraints에 중복된 항목이 있습니다.`);
      }
      normalizedConstraints.add(normalized);
    }
  }

  const complexity = inspectExactRecord(
    contract.complexity,
    `${label}.complexity`,
    COMPLEXITY_FIELDS,
    errors,
  );
  if (complexity) {
    validateNonEmptyString(complexity.time, `${label}.complexity.time`, errors);
    validateNonEmptyString(complexity.space, `${label}.complexity.space`, errors);
  }
  return parameters?.length ?? null;
}

function validateExamples(value, label, parameterCount, errors) {
  const examples = inspectDenseArray(value, label, errors, 1, 3);
  for (const [index, exampleValue] of (examples ?? []).entries()) {
    const exampleLabel = `${label}[${index}]`;
    const example = inspectExactRecord(exampleValue, exampleLabel, EXAMPLE_FIELDS, errors);
    if (!example) continue;
    if (!Array.isArray(example.args)) {
      errors.push(`${exampleLabel}.args는 배열이어야 합니다.`);
    } else {
      const issue = findJsonValueIssue(example.args, `${exampleLabel}.args`);
      if (issue) errors.push(issue);
      if (Number.isSafeInteger(parameterCount) && example.args.length !== parameterCount) {
        errors.push(
          `${exampleLabel}.args는 함수 계약 매개변수 ${parameterCount}개와 같은 수의 인수를 가져야 합니다.`,
        );
      }
    }
    const expectedIssue = findJsonValueIssue(example.expected, `${exampleLabel}.expected`);
    if (expectedIssue) errors.push(expectedIssue);
    validateNonEmptyString(example.explanation, `${exampleLabel}.explanation`, errors);
  }
}

function validatePublicTests(value, label, parameterCount, collectionTestIds, errors) {
  const publicTests = inspectDenseArray(value, label, errors, 3, 6);
  const testIds = new Set();
  for (const [index, testValue] of (publicTests ?? []).entries()) {
    const testLabel = `${label}[${index}]`;
    const publicTest = inspectExactRecord(testValue, testLabel, PUBLIC_TEST_FIELDS, errors);
    if (!publicTest) continue;
    if (!isNonEmptyString(publicTest.id) || !STABLE_ID_PATTERN.test(publicTest.id)) {
      errors.push(`${testLabel}.id 형식이 올바르지 않습니다.`);
    } else if (testIds.has(publicTest.id)) {
      errors.push(`공개 테스트 ID가 중복됩니다: ${publicTest.id}`);
    } else {
      testIds.add(publicTest.id);
    }
    validateNonEmptyString(publicTest.label, `${testLabel}.label`, errors);
    if (!Array.isArray(publicTest.args)) {
      errors.push(`${testLabel}.args는 배열이어야 합니다.`);
    } else {
      const issue = findJsonValueIssue(publicTest.args, `${testLabel}.args`);
      if (issue) errors.push(issue);
      if (Number.isSafeInteger(parameterCount) && publicTest.args.length !== parameterCount) {
        errors.push(
          `${testLabel}.args는 함수 계약 매개변수 ${parameterCount}개와 같은 수의 인수를 가져야 합니다.`,
        );
      }
    }
    const expectedIssue = findJsonValueIssue(publicTest.expected, `${testLabel}.expected`);
    if (expectedIssue) errors.push(expectedIssue);
  }
  for (const testId of testIds) {
    if (collectionTestIds.has(testId)) {
      errors.push(`공개 테스트 ID가 컬렉션 전체에서 중복됩니다: ${testId}`);
    }
    collectionTestIds.add(testId);
  }
  return publicTests ?? [];
}

function validateFailureExplanations(value, publicTests, label, errors) {
  const explanations = inspectDenseArray(value, label, errors, 3, 6);
  const explanationIds = new Set();
  for (const [index, explanationValue] of (explanations ?? []).entries()) {
    const explanationLabel = `${label}[${index}]`;
    const explanation = inspectExactRecord(
      explanationValue,
      explanationLabel,
      FAILURE_EXPLANATION_FIELDS,
      errors,
    );
    if (!explanation) continue;
    if (!isNonEmptyString(explanation.testId) || !STABLE_ID_PATTERN.test(explanation.testId)) {
      errors.push(`${explanationLabel}.testId 형식이 올바르지 않습니다.`);
    } else if (explanationIds.has(explanation.testId)) {
      errors.push(`실패 설명 testId가 중복됩니다: ${explanation.testId}`);
    }
    explanationIds.add(explanation.testId);
    validateNonEmptyString(explanation.message, `${explanationLabel}.message`, errors);
  }

  const publicTestIds = publicTests
    .map((test) => (isPlainRecord(test) ? Object.getOwnPropertyDescriptor(test, "id")?.value : null))
    .filter(isNonEmptyString);
  for (const testId of publicTestIds) {
    if (!explanationIds.has(testId)) errors.push(`공개 테스트 ${testId}의 실패 설명이 없습니다.`);
  }
  for (const testId of explanationIds) {
    if (!publicTestIds.includes(testId)) errors.push(`존재하지 않는 공개 테스트의 실패 설명입니다: ${testId}`);
  }
  if (explanations && publicTests.length !== explanations.length) {
    errors.push("publicTests와 failureExplanations는 1:1로 연결되어야 합니다.");
  }
}

function validateHints(value, label, errors) {
  const hints = inspectDenseArray(value, label, errors, 3, 5);
  let previousStageOrder = -1;
  const seenStages = new Set();
  for (const [index, hintValue] of (hints ?? []).entries()) {
    const hintLabel = `${label}[${index}]`;
    const hint = inspectExactRecord(hintValue, hintLabel, HINT_FIELDS, errors);
    if (!hint) continue;
    if (hint.level !== index + 1) {
      errors.push(`${hintLabel}.level은 배열 순서에 맞는 ${index + 1}이어야 합니다.`);
    }
    const stageOrder = HINT_STAGE_ORDER.get(hint.stage);
    if (stageOrder === undefined) {
      errors.push(`${hintLabel}.stage 형식이 올바르지 않습니다.`);
    } else {
      if (stageOrder < previousStageOrder) {
        errors.push(`${label}.stage는 concept → observation → implementation 순서여야 합니다.`);
      }
      previousStageOrder = stageOrder;
      seenStages.add(hint.stage);
    }
    validateNonEmptyString(hint.title, `${hintLabel}.title`, errors);
    validateNonEmptyString(hint.content, `${hintLabel}.content`, errors);
  }
  for (const stage of HINT_STAGE_ORDER.keys()) {
    if (!seenStages.has(stage)) errors.push(`${label}에는 ${stage} 단계가 필요합니다.`);
  }
}

function validateCommonMistakes(value, label, errors) {
  const mistakes = inspectDenseArray(value, label, errors, 1);
  const mistakeIds = new Set();
  for (const [index, mistakeValue] of (mistakes ?? []).entries()) {
    const mistakeLabel = `${label}[${index}]`;
    const mistake = inspectExactRecord(mistakeValue, mistakeLabel, COMMON_MISTAKE_FIELDS, errors);
    if (!mistake) continue;
    if (!isNonEmptyString(mistake.id) || !STABLE_ID_PATTERN.test(mistake.id)) {
      errors.push(`${mistakeLabel}.id 형식이 올바르지 않습니다.`);
    } else if (mistakeIds.has(mistake.id)) {
      errors.push(`흔한 실수 ID가 중복됩니다: ${mistake.id}`);
    }
    mistakeIds.add(mistake.id);
    validateNonEmptyString(mistake.title, `${mistakeLabel}.title`, errors);
    validateNonEmptyString(mistake.explanation, `${mistakeLabel}.explanation`, errors);
  }
}

function buildCurriculumLessonMap(curriculum, errors) {
  if (!isPlainRecord(curriculum)) {
    errors.push("교안 컬렉션은 일반 객체여야 합니다.");
    return new Map();
  }
  const lessons = Object.getOwnPropertyDescriptor(curriculum, "lessons")?.value;
  if (!Array.isArray(lessons)) {
    errors.push("교안 컬렉션에 lessons 배열이 필요합니다.");
    return new Map();
  }
  const lessonMap = new Map();
  for (const lesson of lessons) {
    if (!isPlainRecord(lesson)) continue;
    const id = Object.getOwnPropertyDescriptor(lesson, "id")?.value;
    if (isNonEmptyString(id)) lessonMap.set(id, lesson);
  }
  return lessonMap;
}

function validateCodeQuestCollectionInternal(collectionValue, curriculum) {
  const errors = [];
  const collection = inspectExactRecord(
    collectionValue,
    "Code Quest 컬렉션",
    COLLECTION_FIELDS,
    errors,
  );
  if (!collection) return errors;

  if (collection.schemaVersion !== 1) errors.push("지원하는 Code Quest schemaVersion은 1입니다.");
  if (collection.contractVersion !== 1) errors.push("지원하는 Code Quest contractVersion은 1입니다.");
  if (!isNonEmptyString(collection.languageId) || !LANGUAGE_ID_PATTERN.test(collection.languageId)) {
    errors.push("Code Quest languageId 형식이 올바르지 않습니다.");
  }
  validateNonEmptyString(collection.title, "Code Quest 컬렉션.title", errors);

  const quests = inspectDenseArray(collection.quests, "Code Quest 컬렉션.quests", errors, 1);
  if (!quests) return errors;

  const lessonMap = buildCurriculumLessonMap(curriculum, errors);
  const questIds = new Set();
  const slugs = new Set();
  const orders = new Set();
  const collectionTestIds = new Set();
  const languageId = collection.languageId;
  const namespacedQuestIdPattern = LANGUAGE_ID_PATTERN.test(languageId ?? "")
    ? new RegExp(`^quest-${languageId}-[a-z0-9]+(?:-[a-z0-9]+)*$`)
    : null;

  for (const [index, questValue] of quests.entries()) {
    const label = `quests[${index}]`;
    const quest = inspectExactRecord(questValue, label, QUEST_FIELDS, errors);
    if (!quest) continue;

    if (
      !isNonEmptyString(quest.id) ||
      !QUEST_ID_PATTERN.test(quest.id) ||
      !namespacedQuestIdPattern?.test(quest.id)
    ) {
      errors.push(`${label}.id는 컬렉션 languageId로 네임스페이스된 안정적인 ID여야 합니다.`);
    } else if (questIds.has(quest.id)) {
      errors.push(`Code Quest ID가 중복됩니다: ${quest.id}`);
    }
    questIds.add(quest.id);

    if (!isNonEmptyString(quest.slug) || !STABLE_ID_PATTERN.test(quest.slug)) {
      errors.push(`${label}.slug 형식이 올바르지 않습니다.`);
    } else if (slugs.has(quest.slug)) {
      errors.push(`Code Quest slug가 중복됩니다: ${quest.slug}`);
    }
    slugs.add(quest.slug);

    if (!Number.isSafeInteger(quest.revision) || quest.revision < 1) {
      errors.push(`${label}.revision은 1 이상의 안전한 정수여야 합니다.`);
    }
    if (!Number.isSafeInteger(quest.order) || quest.order < 1) {
      errors.push(`${label}.order는 1 이상의 안전한 정수여야 합니다.`);
    } else if (orders.has(quest.order)) {
      errors.push(`Code Quest order가 중복됩니다: ${quest.order}`);
    }
    if (quest.order !== index + 1) {
      errors.push(`${label}.order는 컬렉션 배열에서 1부터 빈틈없이 이어져야 합니다.`);
    }
    orders.add(quest.order);

    if (!isNonEmptyString(quest.lessonId) || !STABLE_ID_PATTERN.test(quest.lessonId)) {
      errors.push(`${label}.lessonId 형식이 올바르지 않습니다.`);
    }
    const lesson = lessonMap.get(quest.lessonId);
    if (!lesson) {
      errors.push(`${label}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
    } else {
      const lessonLanguageId = Object.getOwnPropertyDescriptor(lesson, "languageId")?.value;
      if (lessonLanguageId !== languageId) {
        errors.push(`${label}.lessonId의 언어가 컬렉션 언어와 다릅니다.`);
      }
    }

    const conceptIds = inspectDenseArray(quest.conceptIds, `${label}.conceptIds`, errors, 1);
    const lessonConceptIds = lesson
      ? Object.getOwnPropertyDescriptor(lesson, "conceptIds")?.value
      : null;
    const seenConceptIds = new Set();
    for (const [conceptIndex, conceptId] of (conceptIds ?? []).entries()) {
      if (!isNonEmptyString(conceptId) || !CONCEPT_ID_PATTERN.test(conceptId)) {
        errors.push(`${label}.conceptIds[${conceptIndex}] 형식이 올바르지 않습니다.`);
      } else if (seenConceptIds.has(conceptId)) {
        errors.push(`${label}.conceptIds에 중복된 ID가 있습니다: ${conceptId}`);
      }
      seenConceptIds.add(conceptId);
      if (Array.isArray(lessonConceptIds) && !lessonConceptIds.includes(conceptId)) {
        errors.push(`${label}.conceptIds[${conceptIndex}]가 연결된 교안에 없습니다.`);
      }
    }

    if (!ALLOWED_DIFFICULTIES.has(quest.difficulty)) {
      errors.push(`${label}.difficulty 형식이 올바르지 않습니다.`);
    }
    if (!Number.isSafeInteger(quest.estimatedMinutes) || quest.estimatedMinutes < 1) {
      errors.push(`${label}.estimatedMinutes는 1 이상의 안전한 정수여야 합니다.`);
    }
    for (const field of ["title", "summary", "instructions"]) {
      validateNonEmptyString(quest[field], `${label}.${field}`, errors);
    }

    const parameterCount = validateFunctionContract(
      quest.functionContract,
      `${label}.functionContract`,
      errors,
    );
    if (!isNonEmptyString(quest.entryPoint) || !ENTRY_POINT_PATTERN.test(quest.entryPoint)) {
      errors.push(`${label}.entryPoint 형식이 올바르지 않습니다.`);
    } else if (
      languageId === "javascript" &&
      !isValidJavaScriptGradingEntryPoint(quest.entryPoint)
    ) {
      errors.push(
        `${label}.entryPoint는 JavaScript 채점 계약에서 허용하는 예약어가 아닌 식별자여야 합니다.`,
      );
    }
    validateNonEmptyString(quest.starterCode, `${label}.starterCode`, errors);
    if (
      isNonEmptyString(quest.entryPoint) &&
      ENTRY_POINT_PATTERN.test(quest.entryPoint) &&
      isNonEmptyString(quest.starterCode) &&
      !new RegExp(`\\b${quest.entryPoint}\\b`).test(quest.starterCode)
    ) {
      errors.push(`${label}.starterCode에 entryPoint가 포함되어야 합니다.`);
    }

    validateExamples(quest.examples, `${label}.examples`, parameterCount, errors);
    const publicTests = validatePublicTests(
      quest.publicTests,
      `${label}.publicTests`,
      parameterCount,
      collectionTestIds,
      errors,
    );
    validateFailureExplanations(
      quest.failureExplanations,
      publicTests,
      `${label}.failureExplanations`,
      errors,
    );
    validateHints(quest.hints, `${label}.hints`, errors);
    validateCommonMistakes(quest.commonMistakes, `${label}.commonMistakes`, errors);
  }

  return errors;
}

export function validateCodeQuestCollection(collection, curriculum) {
  try {
    return validateCodeQuestCollectionInternal(collection, curriculum);
  } catch {
    return ["Code Quest 콘텐츠를 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidCodeQuestCollection(collection, curriculum) {
  const errors = validateCodeQuestCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`Code Quest 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return collection;
}

export async function loadCodeQuestCollection(
  languageId,
  curriculum,
  fetchImplementation = globalThis.fetch,
) {
  if (!isNonEmptyString(languageId) || !LANGUAGE_ID_PATTERN.test(languageId)) {
    throw new Error("허용되지 않은 Code Quest 언어 경로입니다.");
  }
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("Code Quest 콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }

  const response = await fetchImplementation(`./content/quests/${languageId}.json`);
  if (!response?.ok) {
    throw new Error(`Code Quest 콘텐츠를 불러오지 못했습니다. (${response?.status ?? "unknown"})`);
  }
  const collection = assertValidCodeQuestCollection(await response.json(), curriculum);
  if (collection.languageId !== languageId) {
    throw new Error("요청한 언어와 Code Quest 컬렉션 언어가 다릅니다.");
  }
  return collection;
}

function resolveQuestList(collectionOrQuests) {
  if (Array.isArray(collectionOrQuests)) return collectionOrQuests;
  if (isPlainRecord(collectionOrQuests) && Array.isArray(collectionOrQuests.quests)) {
    return collectionOrQuests.quests;
  }
  return [];
}

export function getCodeQuestsInOrder(collectionOrQuests) {
  return [...resolveQuestList(collectionOrQuests)].sort((left, right) => left.order - right.order);
}

export function findCodeQuestBySlug(collectionOrQuests, slug) {
  if (!isNonEmptyString(slug) || !STABLE_ID_PATTERN.test(slug)) return null;
  return resolveQuestList(collectionOrQuests).find((quest) => quest?.slug === slug) ?? null;
}

export function getAdjacentCodeQuests(collectionOrQuests, questId) {
  const quests = getCodeQuestsInOrder(collectionOrQuests);
  const currentIndex = quests.findIndex((quest) => quest?.id === questId);
  if (currentIndex === -1) return { previous: null, next: null };
  return {
    previous: quests[currentIndex - 1] ?? null,
    next: quests[currentIndex + 1] ?? null,
  };
}

export function createCodeQuestExecutionRequest(collection, quest, source, requestId) {
  if (!isPlainRecord(collection) || !Array.isArray(collection.quests)) {
    throw new TypeError("실행할 Code Quest 컬렉션이 필요합니다.");
  }
  if (!isPlainRecord(quest) || !isNonEmptyString(quest.id)) {
    throw new TypeError("실행할 Code Quest가 필요합니다.");
  }

  const canonicalQuest = collection.quests.find((candidate) => candidate?.id === quest.id);
  if (!canonicalQuest) throw new Error("Code Quest가 컬렉션에 속하지 않습니다.");

  return createExecutionRequestSnapshot({
    requestId,
    contractVersion: collection.contractVersion,
    questId: canonicalQuest.id,
    questRevision: canonicalQuest.revision,
    languageId: collection.languageId,
    suite: "public",
    source,
    entryPoint: canonicalQuest.entryPoint,
    tests: canonicalQuest.publicTests.map(({ id, label, args, expected }) => ({
      id,
      label,
      args,
      expected,
    })),
  });
}
