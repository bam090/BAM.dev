import {
  createExecutionRequestSnapshot,
  validateExecutionRequest,
} from "../grading/code-grading.js";
import {
  assertValidWebCodeQuestCollection,
  createWebCodeQuestExecutionRequest,
} from "./web-code-quest.js";

const COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "languageId",
  "title",
  "quests",
]);
const JAVA_COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "languageId",
  "evaluationKind",
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
const JAVA_QUEST_FIELDS = new Set([...QUEST_FIELDS, "javaContract"]);
const DRAFT_JAVA_QUEST_FIELDS = new Set([
  ...QUEST_FIELDS,
  "javaContract",
  "executionMode",
  "publicTestSource",
]);
// Draft quests expose source-first tests, so they omit runnable-only failure explanations.
DRAFT_JAVA_QUEST_FIELDS.delete("failureExplanations");
const JAVA_CONTRACT_FIELDS = new Set(["sourceFile", "className"]);
const FUNCTION_CONTRACT_FIELDS = new Set([
  "parameters",
  "returns",
  "constraints",
  "complexity",
]);
const DRAFT_FUNCTION_CONTRACT_REQUIRED_FIELDS = new Set([
  "parameters",
  "returns",
  "constraints",
]);
const PARAMETER_FIELDS = new Set(["name", "type", "description"]);
const RETURN_FIELDS = new Set(["type", "description"]);
const COMPLEXITY_FIELDS = new Set(["time", "space"]);
const EXAMPLE_FIELDS = new Set(["args", "expected", "explanation"]);
const PUBLIC_TEST_FIELDS = new Set(["id", "label", "args", "expected"]);
const SOURCE_PUBLIC_TEST_FIELDS = new Set(["id", "label", "assertionSource"]);
const OBSERVED_EXAMPLE_FIELDS = new Set([...EXAMPLE_FIELDS, "observations"]);
const OBSERVED_PUBLIC_TEST_FIELDS = new Set([...PUBLIC_TEST_FIELDS, "observations"]);
const OBSERVATION_FIELDS = new Set(["argument0Unchanged", "returnNotArgument0"]);
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
const JAVA_EVALUATION_KIND = "java-static-method-v1";
const JAVA_DRAFT_EXECUTION_MODE = "draft-only";
const JAVA_DRAFT_TYPES = new Set([
  "int",
  "long",
  "double",
  "boolean",
  "String",
  "int[]",
  "long[]",
  "double[]",
  "String[]",
  "int[][]",
  "boolean[][]",
  "String[][]",
]);
const JAVA_INT_MIN = -2147483648;
const JAVA_INT_MAX = 2147483647;
const JAVA_LONG_MIN = -(2n ** 63n);
const JAVA_LONG_MAX = 2n ** 63n - 1n;
const MAX_JAVA_SOURCE_BYTES = 20 * 1024;
const MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES = 8 * 1024;
const MAX_JAVA_CASE_BYTES = 4 * 1024 * 1024;
const CANONICAL_DECIMAL_PATTERN = /^(?:0|-?[1-9][0-9]*)$/;
const JAVA_QUEST_CONTRACTS = new Map([
  [
    "quest-java-total-price",
    {
      slug: "total-price",
      order: 1,
      lessonId: "java-concept-numeric-operations",
      conceptIds: ["java.numeric-operations"],
      entryPoint: "totalPrice",
      parameters: [["price", "int"], ["quantity", "int"], ["shippingFee", "int"]],
      returns: "long",
      signaturePattern: /\bpublic\s+static\s+long\s+totalPrice\s*\(\s*int\s+price\s*,\s*int\s+quantity\s*,\s*int\s+shippingFee\s*\)/,
    },
  ],
  [
    "quest-java-bridge-arr-01",
    {
      slug: "bridge-arr-01",
      order: 2,
      lessonId: "java-concept-arrays",
      conceptIds: ["java.arrays"],
      entryPoint: "solve",
      parameters: [["readings", "int[]"], ["slotNumber", "int"], ["correctedValue", "int"]],
      returns: "int[]",
      observations: true,
      signaturePattern: /\bpublic\s+static\s+int\s*\[\s*\]\s+solve\s*\(\s*int\s*\[\s*\]\s+readings\s*,\s*int\s+slotNumber\s*,\s*int\s+correctedValue\s*\)/,
    },
  ],
  [
    "quest-java-bridge-arr-02",
    {
      slug: "bridge-arr-02",
      order: 3,
      lessonId: "java-concept-control-flow",
      conceptIds: ["java.control-flow"],
      entryPoint: "solve",
      parameters: [["values", "int[]"], ["minimum", "int"], ["maximum", "int"]],
      returns: "int",
      signaturePattern: /\bpublic\s+static\s+int\s+solve\s*\(\s*int\s*\[\s*\]\s+values\s*,\s*int\s+minimum\s*,\s*int\s+maximum\s*\)/,
    },
  ],
  [
    "quest-java-bridge-que-01",
    {
      slug: "bridge-que-01",
      order: 4,
      lessonId: "java-concept-deque",
      conceptIds: ["java.deque"],
      entryPoint: "solve",
      parameters: [["order", "int[]"]],
      returns: "int[]",
      observations: true,
      signaturePattern: /\bpublic\s+static\s+int\s*\[\s*\]\s+solve\s*\(\s*int\s*\[\s*\]\s+order\s*\)/,
    },
  ],
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

function inspectExactRecord(
  value,
  label,
  allowedFields,
  errors,
  requiredFields = allowedFields,
) {
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

  for (const field of requiredFields) {
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

function validateFunctionContract(
  value,
  label,
  errors,
  { complexityRequired = true } = {},
) {
  const contract = inspectExactRecord(
    value,
    label,
    FUNCTION_CONTRACT_FIELDS,
    errors,
    complexityRequired
      ? FUNCTION_CONTRACT_FIELDS
      : DRAFT_FUNCTION_CONTRACT_REQUIRED_FIELDS,
  );
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

  if (contract.complexity !== undefined) {
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
  }
  return parameters?.length ?? null;
}

function validateExamples(
  value,
  label,
  parameterCount,
  errors,
  fields = EXAMPLE_FIELDS,
) {
  const examples = inspectDenseArray(value, label, errors, 1, 3);
  for (const [index, exampleValue] of (examples ?? []).entries()) {
    const exampleLabel = `${label}[${index}]`;
    const example = inspectExactRecord(exampleValue, exampleLabel, fields, errors);
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

function validatePublicTests(
  value,
  label,
  parameterCount,
  collectionTestIds,
  errors,
  fields = PUBLIC_TEST_FIELDS,
) {
  const publicTests = inspectDenseArray(value, label, errors, 3, 6);
  const testIds = new Set();
  for (const [index, testValue] of (publicTests ?? []).entries()) {
    const testLabel = `${label}[${index}]`;
    const publicTest = inspectExactRecord(testValue, testLabel, fields, errors);
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

function validateHints(
  value,
  label,
  errors,
  { minimum = 3, requireAllStages = true } = {},
) {
  const hints = inspectDenseArray(value, label, errors, minimum, 5);
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
  if (requireAllStages) {
    for (const stage of HINT_STAGE_ORDER.keys()) {
      if (!seenStages.has(stage)) errors.push(`${label}에는 ${stage} 단계가 필요합니다.`);
    }
  }
}

function validateCommonMistakes(value, label, errors, minimum = 1) {
  const mistakes = inspectDenseArray(value, label, errors, minimum);
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

function isJavaInt(value, minimum = JAVA_INT_MIN, maximum = JAVA_INT_MAX) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

function validateJavaIntArray(
  value,
  label,
  errors,
  { minimumLength = 0, maximumLength = 100_000, minimum = JAVA_INT_MIN, maximum = JAVA_INT_MAX } = {},
) {
  const items = inspectDenseArray(value, label, errors, minimumLength, maximumLength);
  for (const [index, item] of (items ?? []).entries()) {
    if (!isJavaInt(item, minimum, maximum)) {
      errors.push(`${label}[${index}]는 ${minimum}..${maximum} 범위의 정수여야 합니다.`);
    }
  }
  return items;
}

function validateRequiredJavaObservations(value, label, errors) {
  const observations = inspectExactRecord(value, label, OBSERVATION_FIELDS, errors);
  if (!observations) return;
  if (observations.argument0Unchanged !== true) {
    errors.push(`${label}.argument0Unchanged는 true여야 합니다.`);
  }
  if (observations.returnNotArgument0 !== true) {
    errors.push(`${label}.returnNotArgument0는 true여야 합니다.`);
  }
}

function validateJavaLongExpected(expected, label, errors) {
  if (typeof expected !== "string" || !CANONICAL_DECIMAL_PATTERN.test(expected)) {
    errors.push(`${label}은 정규 10진 long 문자열이어야 합니다.`);
    return;
  }
  try {
    const parsed = BigInt(expected);
    if (parsed < JAVA_LONG_MIN || parsed > JAVA_LONG_MAX) {
      errors.push(`${label}은 Java long 범위여야 합니다.`);
    }
  } catch {
    errors.push(`${label}은 정규 10진 long 문자열이어야 합니다.`);
  }
}

function validateDraftJavaValue(value, type, label, errors) {
  if (typeof type !== "string") return;
  if (type.endsWith("[]")) {
    const items = inspectDenseArray(value, label, errors, 0, 100_000);
    const itemType = type.slice(0, -2);
    for (const [index, item] of (items ?? []).entries()) {
      validateDraftJavaValue(item, itemType, `${label}[${index}]`, errors);
    }
    return;
  }

  if (type === "int") {
    if (!isJavaInt(value)) errors.push(`${label}은 Java int 범위의 정수여야 합니다.`);
  } else if (type === "long") {
    validateJavaLongExpected(value, label, errors);
  } else if (type === "double") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${label}은 유한한 JSON number여야 합니다.`);
    }
  } else if (type === "boolean") {
    if (typeof value !== "boolean") errors.push(`${label}은 boolean이어야 합니다.`);
  } else if (type === "String") {
    if (typeof value !== "string") errors.push(`${label}은 String이어야 합니다.`);
  } else {
    errors.push(`${label}의 Java 타입을 검증할 수 없습니다: ${type}`);
  }
}

function validateDraftJavaFunctionContract(value, label, errors) {
  const parameterCount = validateFunctionContract(value, label, errors, {
    complexityRequired: false,
  });
  const parameters = isPlainRecord(value) && Array.isArray(value.parameters)
    ? value.parameters
    : [];
  if (parameters.length > 5) errors.push(`${label}.parameters에는 최대 5개 항목만 허용됩니다.`);
  for (const [index, parameter] of parameters.entries()) {
    if (!JAVA_DRAFT_TYPES.has(parameter?.type)) {
      errors.push(`${label}.parameters[${index}].type은 승인된 Java 표시 타입이어야 합니다.`);
    }
  }
  if (!JAVA_DRAFT_TYPES.has(value?.returns?.type)) {
    errors.push(`${label}.returns.type은 승인된 Java 표시 타입이어야 합니다.`);
  }
  return parameterCount;
}

function validateDraftJavaExamples(examples, label, contract, errors) {
  for (const [index, example] of (Array.isArray(examples) ? examples : []).entries()) {
    if (!isPlainRecord(example)) continue;
    const exampleLabel = `${label}[${index}]`;
    try {
      if (new TextEncoder().encode(JSON.stringify(example)).byteLength > MAX_JAVA_CASE_BYTES) {
        errors.push(`${exampleLabel}은 UTF-8 ${MAX_JAVA_CASE_BYTES}바이트 이하여야 합니다.`);
      }
    } catch {
      errors.push(`${exampleLabel}을 JSON 바이트로 안전하게 확인할 수 없습니다.`);
    }
    const args = Array.isArray(example.args) ? example.args : [];
    for (const [argumentIndex, parameter] of (contract?.parameters ?? []).entries()) {
      validateDraftJavaValue(
        args[argumentIndex],
        parameter.type,
        `${exampleLabel}.args[${argumentIndex}]`,
        errors,
      );
    }
    if (JAVA_DRAFT_TYPES.has(contract?.returns?.type)) {
      validateDraftJavaValue(
        example.expected,
        contract.returns.type,
        `${exampleLabel}.expected`,
        errors,
      );
    }
  }
}

function validateSourcePublicTests(value, source, label, collectionTestIds, errors) {
  const publicTests = inspectDenseArray(value, label, errors, 1, 4);
  const questTestIds = new Set();
  for (const [index, testValue] of (publicTests ?? []).entries()) {
    const testLabel = `${label}[${index}]`;
    const publicTest = inspectExactRecord(
      testValue,
      testLabel,
      SOURCE_PUBLIC_TEST_FIELDS,
      errors,
    );
    if (!publicTest) continue;
    if (!isNonEmptyString(publicTest.id) || !STABLE_ID_PATTERN.test(publicTest.id)) {
      errors.push(`${testLabel}.id 형식이 올바르지 않습니다.`);
    } else if (questTestIds.has(publicTest.id)) {
      errors.push(`공개 테스트 ID가 중복됩니다: ${publicTest.id}`);
    } else if (collectionTestIds.has(publicTest.id)) {
      errors.push(`공개 테스트 ID가 컬렉션 전체에서 중복됩니다: ${publicTest.id}`);
    }
    questTestIds.add(publicTest.id);
    collectionTestIds.add(publicTest.id);
    validateNonEmptyString(publicTest.label, `${testLabel}.label`, errors);
    validateNonEmptyString(publicTest.assertionSource, `${testLabel}.assertionSource`, errors);
    if (
      isNonEmptyString(publicTest.assertionSource) &&
      typeof source === "string" &&
      !source.includes(publicTest.assertionSource)
    ) {
      errors.push(`${testLabel}.assertionSource는 publicTestSource의 원문 일부여야 합니다.`);
    }
  }
  return publicTests ?? [];
}

function javaDeclarationPattern(type) {
  return typeof type === "string"
    ? type.split("[]").join("\\s*\\[\\s*\\]")
    : "(?!)";
}

function validateDraftJavaQuestContract(quest, label, collectionTestIds, errors) {
  if (quest.executionMode !== JAVA_DRAFT_EXECUTION_MODE) {
    errors.push(`${label}.executionMode는 ${JAVA_DRAFT_EXECUTION_MODE}여야 합니다.`);
  }
  if (JAVA_QUEST_CONTRACTS.has(quest.id)) {
    errors.push(`${label}.id는 기존 실행형 Java Quest ID를 사용할 수 없습니다.`);
  }
  if (quest.revision !== 1 || !Number.isSafeInteger(quest.order) || quest.order < 5 || quest.order > 73) {
    errors.push(`${label}의 draft revision은 1, order는 5..73이어야 합니다.`);
  }

  const javaContract = inspectExactRecord(
    quest.javaContract,
    `${label}.javaContract`,
    JAVA_CONTRACT_FIELDS,
    errors,
  );
  if (javaContract) {
    if (javaContract.sourceFile !== "Solution.java") {
      errors.push(`${label}.javaContract.sourceFile은 Solution.java여야 합니다.`);
    }
    if (javaContract.className !== "Solution") {
      errors.push(`${label}.javaContract.className은 Solution이어야 합니다.`);
    }
  }

  validateNonEmptyString(quest.publicTestSource, `${label}.publicTestSource`, errors);
  if (
    typeof quest.publicTestSource === "string" &&
    new TextEncoder().encode(quest.publicTestSource).byteLength > MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES
  ) {
    errors.push(
      `${label}.publicTestSource는 UTF-8 ${MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES}바이트 이하여야 합니다.`,
    );
  }
  validateSourcePublicTests(
    quest.publicTests,
    quest.publicTestSource,
    `${label}.publicTests`,
    collectionTestIds,
    errors,
  );

  const parameters = Array.isArray(quest.functionContract?.parameters)
    ? quest.functionContract.parameters
    : [];
  const returnType = quest.functionContract?.returns?.type;
  const hasValidSignatureFields =
    JAVA_DRAFT_TYPES.has(returnType) &&
    ENTRY_POINT_PATTERN.test(quest.entryPoint ?? "") &&
    parameters.every(
      (parameter) =>
        JAVA_DRAFT_TYPES.has(parameter?.type) &&
        ENTRY_POINT_PATTERN.test(parameter?.name ?? ""),
    );
  const parameterPattern = parameters
    .map((parameter) => `${javaDeclarationPattern(parameter.type)}\\s+${parameter.name}`)
    .join("\\s*,\\s*");
  const signaturePattern = hasValidSignatureFields
    ? new RegExp(
        `\\bpublic\\s+static\\s+${javaDeclarationPattern(returnType)}\\s+${quest.entryPoint}\\s*\\(\\s*${parameterPattern}\\s*\\)`,
      )
    : null;
  if (
    !isNonEmptyString(quest.starterCode) ||
    !/\bpublic\s+class\s+Solution\b/.test(quest.starterCode) ||
    !signaturePattern?.test(quest.starterCode)
  ) {
    errors.push(`${label}.starterCode에 함수 계약과 같은 public static 메서드 선언이 필요합니다.`);
  }
  if (
    typeof quest.starterCode === "string" &&
    new TextEncoder().encode(quest.starterCode).byteLength > MAX_JAVA_SOURCE_BYTES
  ) {
    errors.push(`${label}.starterCode는 UTF-8 ${MAX_JAVA_SOURCE_BYTES}바이트 이하여야 합니다.`);
  }
  validateDraftJavaExamples(quest.examples, `${label}.examples`, quest.functionContract, errors);
}

function validateJavaCase(caseValue, label, contract, errors) {
  if (!isPlainRecord(caseValue) || !contract) return;
  try {
    if (new TextEncoder().encode(JSON.stringify(caseValue)).byteLength > MAX_JAVA_CASE_BYTES) {
      errors.push(`${label}은 UTF-8 ${MAX_JAVA_CASE_BYTES}바이트 이하여야 합니다.`);
    }
  } catch {
    errors.push(`${label}을 JSON 바이트로 안전하게 확인할 수 없습니다.`);
  }

  const args = inspectDenseArray(
    Object.getOwnPropertyDescriptor(caseValue, "args")?.value,
    `${label}.args`,
    errors,
    contract.parameters.length,
    contract.parameters.length,
  );
  const expected = Object.getOwnPropertyDescriptor(caseValue, "expected")?.value;

  if (contract.order === 1) {
    for (const [index, value] of (args ?? []).entries()) {
      if (!isJavaInt(value)) errors.push(`${label}.args[${index}]는 Java int 범위의 정수여야 합니다.`);
    }
    validateJavaLongExpected(expected, `${label}.expected`, errors);
  } else if (contract.order === 2) {
    const readings = validateJavaIntArray(args?.[0], `${label}.args[0]`, errors, {
      minimumLength: 1,
      maximumLength: 100,
      minimum: -1000,
      maximum: 1000,
    });
    if (!isJavaInt(args?.[1], 1, readings?.length ?? 0)) {
      errors.push(`${label}.args[1]은 1부터 첫 배열 길이까지의 정수여야 합니다.`);
    }
    if (!isJavaInt(args?.[2], -1000, 1000)) {
      errors.push(`${label}.args[2]는 -1000..1000 범위의 정수여야 합니다.`);
    }
    const returned = validateJavaIntArray(expected, `${label}.expected`, errors);
    if (readings && returned && returned.length !== readings.length) {
      errors.push(`${label}.expected 길이는 첫 입력 배열 길이와 같아야 합니다.`);
    }
  } else if (contract.order === 3) {
    validateJavaIntArray(args?.[0], `${label}.args[0]`, errors, {
      maximumLength: 1000,
      minimum: -10_000,
      maximum: 10_000,
    });
    if (!isJavaInt(args?.[1]) || !isJavaInt(args?.[2])) {
      errors.push(`${label}.args[1..2]는 Java int 범위의 정수여야 합니다.`);
    } else if (args[1] > args[2]) {
      errors.push(`${label}.args는 minimum ≤ maximum이어야 합니다.`);
    }
    if (!isJavaInt(expected)) errors.push(`${label}.expected는 Java int 범위의 정수여야 합니다.`);
  } else if (contract.order === 4) {
    const order = validateJavaIntArray(args?.[0], `${label}.args[0]`, errors, {
      maximumLength: 100_000,
      minimum: -1_000_000,
      maximum: 1_000_000,
    });
    const returned = validateJavaIntArray(expected, `${label}.expected`, errors);
    if (order && returned && returned.length !== order.length) {
      errors.push(`${label}.expected 길이는 첫 입력 배열 길이와 같아야 합니다.`);
    }
  }

  if (contract.observations) {
    validateRequiredJavaObservations(
      Object.getOwnPropertyDescriptor(caseValue, "observations")?.value,
      `${label}.observations`,
      errors,
    );
  }
}

function validateJavaQuestContract(quest, label, errors) {
  const contract = JAVA_QUEST_CONTRACTS.get(quest.id);
  if (!contract) {
    errors.push(`${label}.id는 승인된 네 Java Quest 중 하나여야 합니다.`);
    return;
  }
  const javaContract = inspectExactRecord(
    quest.javaContract,
    `${label}.javaContract`,
    JAVA_CONTRACT_FIELDS,
    errors,
  );
  if (javaContract) {
    if (javaContract.sourceFile !== "Solution.java") {
      errors.push(`${label}.javaContract.sourceFile은 Solution.java여야 합니다.`);
    }
    if (javaContract.className !== "Solution") {
      errors.push(`${label}.javaContract.className은 Solution이어야 합니다.`);
    }
  }

  if (
    quest.slug !== contract.slug ||
    quest.revision !== 1 ||
    quest.order !== contract.order ||
    quest.lessonId !== contract.lessonId ||
    JSON.stringify(quest.conceptIds) !== JSON.stringify(contract.conceptIds)
  ) {
    errors.push(`${label}의 안정 ID·revision·순서·교안·개념 연결이 올바르지 않습니다.`);
  }

  const parameters = quest.functionContract?.parameters;
  if (
    !Array.isArray(parameters) ||
    JSON.stringify(parameters.map((parameter) => [parameter?.name, parameter?.type])) !==
      JSON.stringify(contract.parameters) ||
    quest.functionContract?.returns?.type !== contract.returns
  ) {
    errors.push(`${label}.functionContract가 승인된 Java 정적 메서드 서명과 다릅니다.`);
  }
  if (quest.entryPoint !== contract.entryPoint) {
    errors.push(`${label}.entryPoint는 ${contract.entryPoint}여야 합니다.`);
  }
  if (
    !isNonEmptyString(quest.starterCode) ||
    !/\bpublic\s+class\s+Solution\b/.test(quest.starterCode) ||
    !contract.signaturePattern.test(quest.starterCode)
  ) {
    errors.push(`${label}.starterCode에 고정 Java 클래스와 메서드 선언이 필요합니다.`);
  }
  if (
    typeof quest.starterCode === "string" &&
    new TextEncoder().encode(quest.starterCode).byteLength > MAX_JAVA_SOURCE_BYTES
  ) {
    errors.push(`${label}.starterCode는 UTF-8 ${MAX_JAVA_SOURCE_BYTES}바이트 이하여야 합니다.`);
  }
  for (const [kind, cases] of [
    ["examples", quest.examples],
    ["publicTests", quest.publicTests],
  ]) {
    for (const [index, caseValue] of (Array.isArray(cases) ? cases : []).entries()) {
      validateJavaCase(caseValue, `${label}.${kind}[${index}]`, contract, errors);
    }
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

function validateCodeQuestCollectionInternal(collectionValue, curriculum, { java = false } = {}) {
  const errors = [];
  const collection = inspectExactRecord(
    collectionValue,
    "Code Quest 컬렉션",
    java ? JAVA_COLLECTION_FIELDS : COLLECTION_FIELDS,
    errors,
  );
  if (!collection) return errors;

  if (collection.schemaVersion !== 1) errors.push("지원하는 Code Quest schemaVersion은 1입니다.");
  if (collection.contractVersion !== 1) errors.push("지원하는 Code Quest contractVersion은 1입니다.");
  if (!isNonEmptyString(collection.languageId) || !LANGUAGE_ID_PATTERN.test(collection.languageId)) {
    errors.push("Code Quest languageId 형식이 올바르지 않습니다.");
  }
  validateNonEmptyString(collection.title, "Code Quest 컬렉션.title", errors);
  if (java) {
    if (collection.languageId !== "java") {
      errors.push("Java Code Quest languageId는 java여야 합니다.");
    }
    if (collection.evaluationKind !== JAVA_EVALUATION_KIND) {
      errors.push(`Java Code Quest evaluationKind는 ${JAVA_EVALUATION_KIND}여야 합니다.`);
    }
  }

  const quests = inspectDenseArray(
    collection.quests,
    "Code Quest 컬렉션.quests",
    errors,
    java ? JAVA_QUEST_CONTRACTS.size : 1,
    java ? 73 : Infinity,
  );
  if (!quests) return errors;

  const lessonMap = buildCurriculumLessonMap(curriculum, errors);
  const questIds = new Set();
  const slugs = new Set();
  const orders = new Set();
  const collectionTestIds = new Set();
  const languageId = collection.languageId;
  const runnableJavaQuestIds = new Set();
  const namespacedQuestIdPattern = LANGUAGE_ID_PATTERN.test(languageId ?? "")
    ? new RegExp(`^quest-${languageId}-[a-z0-9]+(?:-[a-z0-9]+)*$`)
    : null;

  for (const [index, questValue] of quests.entries()) {
    const label = `quests[${index}]`;
    const isDraftJavaQuest =
      java &&
      isPlainRecord(questValue) &&
      Object.getOwnPropertyDescriptor(questValue, "executionMode")?.value ===
        JAVA_DRAFT_EXECUTION_MODE;
    const quest = inspectExactRecord(
      questValue,
      label,
      java
        ? isDraftJavaQuest
          ? DRAFT_JAVA_QUEST_FIELDS
          : JAVA_QUEST_FIELDS
        : QUEST_FIELDS,
      errors,
    );
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

    const parameterCount = isDraftJavaQuest
      ? validateDraftJavaFunctionContract(
          quest.functionContract,
          `${label}.functionContract`,
          errors,
        )
      : validateFunctionContract(
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

    const javaContract = java && !isDraftJavaQuest
      ? JAVA_QUEST_CONTRACTS.get(quest.id)
      : null;
    const exampleFields = javaContract?.observations
      ? OBSERVED_EXAMPLE_FIELDS
      : EXAMPLE_FIELDS;
    const publicTestFields = javaContract?.observations
      ? OBSERVED_PUBLIC_TEST_FIELDS
      : PUBLIC_TEST_FIELDS;
    validateExamples(
      quest.examples,
      `${label}.examples`,
      parameterCount,
      errors,
      exampleFields,
    );
    if (isDraftJavaQuest) {
      validateHints(quest.hints, `${label}.hints`, errors, {
        minimum: 0,
        requireAllStages: false,
      });
      validateCommonMistakes(quest.commonMistakes, `${label}.commonMistakes`, errors, 0);
      validateDraftJavaQuestContract(quest, label, collectionTestIds, errors);
    } else {
      const publicTests = validatePublicTests(
        quest.publicTests,
        `${label}.publicTests`,
        parameterCount,
        collectionTestIds,
        errors,
        publicTestFields,
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
    if (java && !isDraftJavaQuest) {
      validateJavaQuestContract(quest, label, errors);
      if (JAVA_QUEST_CONTRACTS.has(quest.id)) runnableJavaQuestIds.add(quest.id);
    }
  }

  if (java) {
    for (const questId of JAVA_QUEST_CONTRACTS.keys()) {
      if (!runnableJavaQuestIds.has(questId)) {
        errors.push(`기존 실행형 Java Quest가 누락되었습니다: ${questId}`);
      }
    }
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

export function validateJavaCodeQuestCollection(collection, curriculum) {
  try {
    return validateCodeQuestCollectionInternal(collection, curriculum, { java: true });
  } catch {
    return ["Java Code Quest 콘텐츠를 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidJavaCodeQuestCollection(collection, curriculum) {
  const errors = validateJavaCodeQuestCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`Java Code Quest 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
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
  const document = await response.json();
  const collection =
    document?.evaluationKind === JAVA_EVALUATION_KIND
      ? assertValidJavaCodeQuestCollection(document, curriculum)
      : Object.hasOwn(document ?? {}, "evaluationKind")
        ? assertValidWebCodeQuestCollection(document, curriculum)
        : assertValidCodeQuestCollection(document, curriculum);
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

function isStrictPassedQuestAttempt(attempt) {
  return (
    attempt?.outcome === "passed" &&
    Number.isSafeInteger(attempt.questRevision) &&
    attempt.questRevision > 0 &&
    Number.isSafeInteger(attempt.passed) &&
    Number.isSafeInteger(attempt.total) &&
    attempt.total > 0 &&
    attempt.passed === attempt.total
  );
}

function getActivityTime(value) {
  const timestamp = Date.parse(value ?? "");
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getNewestActivityTime(records, field) {
  let newest = null;
  for (const record of records) {
    const timestamp = getActivityTime(record?.[field]);
    if (timestamp !== null && (newest === null || timestamp > newest)) newest = timestamp;
  }
  return newest;
}

function resolveCodeQuestCollections(collections) {
  if (collections instanceof Map) return [...collections.values()];
  return Array.isArray(collections) ? collections : [];
}

function getQuestProgress(quest, progress) {
  const attempts = (Array.isArray(progress?.questAttempts) ? progress.questAttempts : [])
    .filter((attempt) => attempt?.questId === quest.id);
  const drafts = (Array.isArray(progress?.questDrafts) ? progress.questDrafts : [])
    .filter((draft) => draft?.questId === quest.id);
  const completionRecords = (Array.isArray(progress?.completedQuestRevisions)
    ? progress.completedQuestRevisions
    : [])
    .filter((completed) => completed?.questId === quest.id);
  const passedAttempts = attempts.filter(isStrictPassedQuestAttempt);
  const passedRevisions = [
    ...completionRecords.map((completed) => completed.questRevision),
    ...passedAttempts.map((attempt) => attempt.questRevision),
  ].filter((revision) => Number.isSafeInteger(revision) && revision > 0);
  const hasCurrentPass = passedRevisions.includes(quest.revision);
  const hasCurrentAttempt = attempts.some((attempt) => attempt?.questRevision === quest.revision);
  const hasLegacyCompletion = (Array.isArray(progress?.completedQuestIds)
    ? progress.completedQuestIds
    : []).includes(quest.id);
  const olderPassedRevisions = passedRevisions.filter((revision) => revision !== quest.revision);
  const knownPassedRevision = passedRevisions.length ? Math.max(...passedRevisions) : null;
  const latestAttemptAt = getNewestActivityTime(attempts, "completedAt");
  const draftUpdatedAt = getNewestActivityTime(drafts, "updatedAt");
  const recentActivityAt = [latestAttemptAt, draftUpdatedAt]
    .filter((timestamp) => timestamp !== null)
    .reduce((newest, timestamp) => Math.max(newest, timestamp), 0) || null;

  if (hasCurrentPass) {
    return {
      progress: "completed",
      progressEvidence: "current_revision",
      knownPassedRevision,
      draftSourceRevision: drafts.length ? "unknown" : "none",
      hasDraft: drafts.length > 0,
      recentActivityAt,
    };
  }
  if (hasCurrentAttempt) {
    return {
      progress: "in_progress",
      progressEvidence: "current_revision",
      knownPassedRevision,
      draftSourceRevision: drafts.length ? "unknown" : "none",
      hasDraft: drafts.length > 0,
      recentActivityAt,
    };
  }
  if (olderPassedRevisions.length || hasLegacyCompletion) {
    return {
      progress: "previously_completed",
      progressEvidence: olderPassedRevisions.length ? "older_revision" : "legacy_unversioned",
      knownPassedRevision,
      draftSourceRevision: drafts.length ? "unknown" : "none",
      hasDraft: drafts.length > 0,
      recentActivityAt,
    };
  }
  if (drafts.length || attempts.length) {
    return {
      progress: "in_progress",
      progressEvidence: "none",
      knownPassedRevision: null,
      draftSourceRevision: drafts.length ? "unknown" : "none",
      hasDraft: drafts.length > 0,
      recentActivityAt,
    };
  }
  return {
    progress: "not_started",
    progressEvidence: "none",
    knownPassedRevision: null,
    draftSourceRevision: "none",
    hasDraft: false,
    recentActivityAt: null,
  };
}

function addCodeQuestProgress(scope) {
  const completedCount = scope.items.filter((item) => item.progress === "completed").length;
  return {
    ...scope,
    completedCount,
    totalCount: scope.items.length,
    percent: scope.items.length ? Math.round((completedCount / scope.items.length) * 100) : 0,
  };
}

export function getCodeQuestResumeItem(items) {
  const ordered = Array.isArray(items) ? items : [];
  const inProgress = ordered.filter((item) => item.progress === "in_progress");
  if (inProgress.length) {
    return [...inProgress].sort((left, right) => {
      const activityDifference = (right.recentActivityAt ?? -1) - (left.recentActivityAt ?? -1);
      return activityDifference || left.displayOrder - right.displayOrder || left.id.localeCompare(right.id);
    })[0];
  }
  return ordered.find((item) => item.progress !== "completed") ?? ordered[0] ?? null;
}

export function createCodeQuestCatalog(curriculum, collections, progress = {}) {
  const lessons = new Map((curriculum?.lessons ?? []).map((lesson) => [lesson.id, lesson]));
  const courses = new Map((curriculum?.courses ?? []).map((course) => [course.id, course]));
  const categories = new Map((curriculum?.categories ?? []).map((category) => [category.id, category]));
  const courseItems = new Map();

  for (const collection of resolveCodeQuestCollections(collections)) {
    for (const quest of getCodeQuestsInOrder(collection)) {
      const lesson = lessons.get(quest.lessonId);
      const course = lesson ? courses.get(lesson.courseId) : null;
      const category = course ? categories.get(course.categoryId) : null;
      const conceptsMatch = Array.isArray(quest.conceptIds) && quest.conceptIds.every(
        (conceptId) => lesson?.conceptIds?.includes(conceptId),
      );
      if (
        !lesson ||
        !course ||
        !category ||
        course.status === "planned" ||
        category.status === "planned" ||
        lesson.languageId !== collection.languageId ||
        course.languageId !== collection.languageId ||
        !conceptsMatch
      ) {
        throw new Error(`${quest.id ?? "Code Quest"}: 검증된 과정·교안·개념 연결을 만들 수 없습니다.`);
      }
      if (!courseItems.has(course.id)) courseItems.set(course.id, []);
      courseItems.get(course.id).push({
        id: quest.id,
        revision: quest.revision,
        slug: quest.slug,
        href: `#/quest/${encodeURIComponent(collection.languageId)}/${encodeURIComponent(quest.slug)}`,
        courseId: course.id,
        courseName: course.name,
        languageId: collection.languageId,
        lessonId: lesson.id,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        lessonHref: `#/learn/${encodeURIComponent(course.id)}/${encodeURIComponent(lesson.slug)}`,
        topicId: lesson.id,
        topicTitle: lesson.title,
        topicOrder: lesson.order,
        conceptIds: [...quest.conceptIds],
        order: quest.order,
        title: quest.title,
        summary: quest.summary,
        difficulty: quest.difficulty,
        estimatedMinutes: quest.estimatedMinutes,
        ...(quest.executionMode === JAVA_DRAFT_EXECUTION_MODE
          ? { executionMode: JAVA_DRAFT_EXECUTION_MODE }
          : {}),
        ...getQuestProgress(quest, progress),
      });
    }
  }

  const catalogCourses = (curriculum?.courses ?? []).flatMap((course) => {
    const items = courseItems.get(course.id);
    if (!items?.length) return [];
    items.sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
    items.forEach((item, index) => { item.displayOrder = index + 1; });
    const topicsById = new Map();
    for (const item of items) {
      if (!topicsById.has(item.topicId)) {
        topicsById.set(item.topicId, {
          id: item.topicId,
          title: item.topicTitle,
          lessonId: item.lessonId,
          lessonSlug: item.lessonSlug,
          order: item.topicOrder,
          items: [],
        });
      }
      topicsById.get(item.topicId).items.push(item);
    }
    const topics = [...topicsById.values()]
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      .map(addCodeQuestProgress);
    const projectedCourse = addCodeQuestProgress({
      id: course.id,
      name: course.name,
      languageId: course.languageId,
      items,
      topics,
    });
    projectedCourse.resumeItem = getCodeQuestResumeItem(items);
    return [projectedCourse];
  });

  return {
    courses: catalogCourses,
    items: catalogCourses.flatMap((course) => course.items),
  };
}

export function filterCodeQuestCatalogItems(items, { query = "", topicId = "all", status = "all" } = {}) {
  const normalizedQuery = String(query).normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (topicId !== "all" && item.topicId !== topicId) return false;
    if (status !== "all" && item.progress !== status) return false;
    if (!normalizedQuery) return true;
    return [String(item.displayOrder), item.title, item.summary]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("ko-KR")
      .includes(normalizedQuery);
  });
}

export function findCodeQuestByDisplayOrder(items, displayOrder) {
  const number = Number(displayOrder);
  if (!Number.isInteger(number) || number < 1) return null;
  return (Array.isArray(items) ? items : []).find((item) => item.displayOrder === number) ?? null;
}

export function getAdjacentCodeQuestCatalogItems(items, questId) {
  const ordered = Array.isArray(items) ? items : [];
  const currentIndex = ordered.findIndex((item) => item.id === questId);
  if (currentIndex === -1) return { previous: null, next: null };
  return {
    previous: ordered[currentIndex - 1] ?? null,
    next: ordered[currentIndex + 1] ?? null,
  };
}

export function canRunCodeQuest(collection, quest, javaExecutionAvailable = true) {
  if (!isPlainRecord(collection) || !Array.isArray(collection.quests) || !isPlainRecord(quest)) {
    return false;
  }
  const canonicalQuest = collection.quests.find((candidate) => candidate?.id === quest.id);
  if (!canonicalQuest) return false;
  if (collection.evaluationKind !== JAVA_EVALUATION_KIND) return true;
  return (
    javaExecutionAvailable === true &&
    canonicalQuest.executionMode !== JAVA_DRAFT_EXECUTION_MODE &&
    JAVA_QUEST_CONTRACTS.has(canonicalQuest.id)
  );
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

  if (collection.evaluationKind === JAVA_EVALUATION_KIND) {
    if (!canRunCodeQuest(collection, canonicalQuest, true)) {
      throw new Error("이 Java Code Quest는 현재 앱에서 실행할 수 없습니다.");
    }
    if (typeof source !== "string") {
      throw new TypeError("Java source는 문자열이어야 합니다.");
    }
    if (new TextEncoder().encode(source).byteLength > MAX_JAVA_SOURCE_BYTES) {
      throw new RangeError(`Java source는 UTF-8 ${MAX_JAVA_SOURCE_BYTES}바이트 이하여야 합니다.`);
    }
    if (!isNonEmptyString(requestId)) {
      throw new TypeError("Java 실행 requestId가 필요합니다.");
    }
    return Object.freeze({
      requestId,
      contractVersion: collection.contractVersion,
      questId: canonicalQuest.id,
      questRevision: canonicalQuest.revision,
      languageId: "java",
      suite: "public",
      evaluationKind: JAVA_EVALUATION_KIND,
      source,
    });
  }

  if (Object.hasOwn(collection, "evaluationKind")) {
    return createWebCodeQuestExecutionRequest(
      collection,
      canonicalQuest,
      source,
      requestId,
    );
  }

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
