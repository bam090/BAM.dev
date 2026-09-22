import {
  areJsonValuesEqual,
  serializedJsonByteLength,
  validateExecutionRequest,
} from "../grading/code-grading.js";

const COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "languageId",
  "title",
  "problems",
]);
const JAVA_COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "languageId",
  "evaluationKind",
  "title",
  "problems",
]);
const PROBLEM_FIELDS = new Set([
  "id",
  "slug",
  "revision",
  "order",
  "lessonId",
  "conceptIds",
  "difficulty",
  "type",
  "tags",
  "estimatedMinutes",
  "title",
  "summary",
  "description",
  "functionContract",
  "entryPoint",
  "starterCode",
  "examples",
  "publicTests",
  "runTestIds",
  "failureExplanations",
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
const JAVA_PROBLEM_FIELDS = new Set([
  "id",
  "slug",
  "revision",
  "order",
  "lessonId",
  "conceptIds",
  "difficulty",
  "type",
  "tags",
  "estimatedMinutes",
  "title",
  "summary",
  "description",
  "functionContract",
  "entryPoint",
  "javaContract",
  "starterCode",
  "examples",
  "executionMode",
  "publicTestSource",
  "publicTests",
  "hints",
  "commonMistakes",
  "relatedQuestId",
  "legacyQuestId",
]);
const JAVA_PROBLEM_REQUIRED_FIELDS = new Set(
  [...JAVA_PROBLEM_FIELDS].filter(
    (field) => !["commonMistakes", "relatedQuestId", "legacyQuestId"].includes(field),
  ),
);
const JAVA_FUNCTION_CONTRACT_REQUIRED_FIELDS = new Set([
  "parameters",
  "returns",
  "constraints",
]);
const JAVA_CONTRACT_FIELDS = new Set(["sourceFile", "className"]);
const SOURCE_PUBLIC_TEST_FIELDS = new Set(["id", "label", "assertionSource"]);
const HINT_FIELDS = new Set(["level", "stage", "title", "content"]);
const COMMON_MISTAKE_FIELDS = new Set(["id", "title", "explanation"]);

const LANGUAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const ENTRY_POINT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MAX_JSON_BYTES = 16 * 1024;
const MAX_JAVA_CASE_BYTES = 4 * 1024 * 1024;
const MAX_JAVA_SOURCE_BYTES = 20 * 1024;
const MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES = 8 * 1024;
const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;
const JAVA_LONG_MIN = -(2n ** 63n);
const JAVA_LONG_MAX = 2n ** 63n - 1n;
const CANONICAL_DECIMAL_PATTERN = /^(?:0|-?[1-9][0-9]*)$/;
const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;
const JAVA_EVALUATION_KIND = "java-static-method-v1";

export async function createCodingTestSourceFingerprint(
  source,
  crypto = globalThis.crypto,
) {
  if (typeof source !== "string") {
    throw new TypeError("코딩테스트 source는 문자열이어야 합니다.");
  }
  if (typeof crypto?.subtle?.digest !== "function") {
    throw new Error("코딩테스트 source fingerprint를 계산할 수 없습니다.");
  }

  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source)),
  );
  if (digest.byteLength !== 32) {
    throw new Error("코딩테스트 source fingerprint를 계산할 수 없습니다.");
  }
  return [...digest]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
const JAVA_DRAFT_EXECUTION_MODE = "draft-only";
const JAVA_TYPES = new Set([
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
const HINT_STAGES = new Set(["concept", "observation", "implementation"]);

export const CODING_TEST_DIFFICULTIES = Object.freeze([
  "beginner",
  "intermediate",
  "advanced",
]);
export const CODING_TEST_TYPES = Object.freeze([
  "string",
  "array",
  "object",
  "sorting",
  "search",
  "simulation",
]);
export const CODING_TEST_EXECUTION_MODES = Object.freeze(["run", "submit"]);

const difficultySet = new Set(CODING_TEST_DIFFICULTIES);
const typeSet = new Set(CODING_TEST_TYPES);
const executionModeSet = new Set(CODING_TEST_EXECUTION_MODES);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function inspectExactRecord(value, label, fields, errors, requiredFields = fields) {
  if (!isPlainRecord(value)) {
    errors.push(`${label}은 일반 객체여야 합니다.`);
    return null;
  }
  const keys = Reflect.ownKeys(value);
  for (const key of keys) {
    if (typeof key !== "string" || !fields.has(key)) {
      errors.push(`${label}에 허용되지 않은 필드가 있습니다: ${String(key)}`);
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      errors.push(`${label}.${key}는 getter나 숨겨진 필드가 아닌 값이어야 합니다.`);
    }
  }
  for (const field of requiredFields) {
    if (!Object.hasOwn(value, field)) errors.push(`${label}.${field}는 필수 필드입니다.`);
  }
  return value;
}

function inspectArray(value, label, errors, minimum = 0, maximum = Infinity) {
  if (!Array.isArray(value)) {
    errors.push(`${label}은 배열이어야 합니다.`);
    return [];
  }
  if (value.length < minimum) errors.push(`${label}에는 최소 ${minimum}개 항목이 필요합니다.`);
  if (value.length > maximum) errors.push(`${label}에는 최대 ${maximum}개 항목만 허용됩니다.`);
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      errors.push(`${label}[${index}]은 비어 있지 않은 값 항목이어야 합니다.`);
    }
  }
  return value;
}

function validateText(value, label, errors) {
  if (!isNonEmptyString(value)) errors.push(`${label}은 비어 있지 않은 문자열이어야 합니다.`);
}

function validateJsonValue(value, label, errors) {
  const bytes = serializedJsonByteLength(value, MAX_JSON_BYTES);
  if (bytes === null) {
    errors.push(`${label}은 순환 없는 JSON 호환 값이어야 합니다.`);
  } else if (bytes > MAX_JSON_BYTES) {
    errors.push(`${label}은 JSON 기준 ${MAX_JSON_BYTES}바이트 이하여야 합니다.`);
  }
}

function validateFunctionContract(value, label, errors) {
  const contract = inspectExactRecord(value, label, FUNCTION_CONTRACT_FIELDS, errors);
  if (!contract) return 0;

  const parameters = inspectArray(contract.parameters, `${label}.parameters`, errors, 1);
  const names = new Set();
  for (const [index, parameterValue] of parameters.entries()) {
    const parameterLabel = `${label}.parameters[${index}]`;
    const parameter = inspectExactRecord(parameterValue, parameterLabel, PARAMETER_FIELDS, errors);
    if (!parameter) continue;
    if (!isNonEmptyString(parameter.name) || !ENTRY_POINT_PATTERN.test(parameter.name)) {
      errors.push(`${parameterLabel}.name 형식이 올바르지 않습니다.`);
    } else if (names.has(parameter.name)) {
      errors.push(`${label}.parameters에 중복된 이름이 있습니다: ${parameter.name}`);
    }
    names.add(parameter.name);
    validateText(parameter.type, `${parameterLabel}.type`, errors);
    validateText(parameter.description, `${parameterLabel}.description`, errors);
  }

  const returns = inspectExactRecord(contract.returns, `${label}.returns`, RETURN_FIELDS, errors);
  if (returns) {
    validateText(returns.type, `${label}.returns.type`, errors);
    validateText(returns.description, `${label}.returns.description`, errors);
  }

  const constraints = inspectArray(contract.constraints, `${label}.constraints`, errors, 1);
  const normalizedConstraints = new Set();
  for (const [index, constraint] of constraints.entries()) {
    validateText(constraint, `${label}.constraints[${index}]`, errors);
    if (isNonEmptyString(constraint)) normalizedConstraints.add(constraint.trim());
  }
  if (normalizedConstraints.size !== constraints.length) {
    errors.push(`${label}.constraints에 중복된 항목이 있습니다.`);
  }

  const complexity = inspectExactRecord(
    contract.complexity,
    `${label}.complexity`,
    COMPLEXITY_FIELDS,
    errors,
  );
  if (complexity) {
    validateText(complexity.time, `${label}.complexity.time`, errors);
    validateText(complexity.space, `${label}.complexity.space`, errors);
  }
  return parameters.length;
}

function validateExamples(examplesValue, label, parameterCount, publicTests, errors) {
  const examples = inspectArray(examplesValue, label, errors, 1, 3);
  for (const [index, exampleValue] of examples.entries()) {
    const exampleLabel = `${label}[${index}]`;
    const example = inspectExactRecord(exampleValue, exampleLabel, EXAMPLE_FIELDS, errors);
    if (!example) continue;
    const args = inspectArray(example.args, `${exampleLabel}.args`, errors);
    if (args.length !== parameterCount) {
      errors.push(`${exampleLabel}.args는 함수 매개변수 ${parameterCount}개와 같은 수여야 합니다.`);
    }
    validateJsonValue(args, `${exampleLabel}.args`, errors);
    validateJsonValue(example.expected, `${exampleLabel}.expected`, errors);
    validateText(example.explanation, `${exampleLabel}.explanation`, errors);
    if (
      !publicTests.some(
        (test) =>
          isPlainRecord(test) &&
          areJsonValuesEqual(test.args, example.args) &&
          areJsonValuesEqual(test.expected, example.expected),
      )
    ) {
      errors.push(`${exampleLabel}은 실제 공개 테스트 입출력과 일치해야 합니다.`);
    }
  }
}

function validateProblem(problemValue, index, collection, lessonMap, allTestIds, errors) {
  const label = `problems[${index}]`;
  const problem = inspectExactRecord(problemValue, label, PROBLEM_FIELDS, errors);
  if (!problem) return;

  const idPattern = new RegExp(
    `^coding-test-${collection.languageId}-[a-z0-9]+(?:-[a-z0-9]+)*$`,
  );
  if (!isNonEmptyString(problem.id) || !idPattern.test(problem.id)) {
    errors.push(`${label}.id는 컬렉션 언어로 네임스페이스되어야 합니다.`);
  }
  if (!isNonEmptyString(problem.slug) || !STABLE_ID_PATTERN.test(problem.slug)) {
    errors.push(`${label}.slug 형식이 올바르지 않습니다.`);
  }
  if (!Number.isSafeInteger(problem.revision) || problem.revision < 1) {
    errors.push(`${label}.revision은 1 이상의 안전한 정수여야 합니다.`);
  }
  if (problem.order !== index + 1) {
    errors.push(`${label}.order는 배열 순서에 맞게 1부터 연속되어야 합니다.`);
  }

  const lesson = lessonMap.get(problem.lessonId);
  if (!lesson) {
    errors.push(`${label}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
  } else if (lesson.languageId !== collection.languageId) {
    errors.push(`${label}.lessonId의 언어가 컬렉션 언어와 다릅니다.`);
  }

  const conceptIds = inspectArray(problem.conceptIds, `${label}.conceptIds`, errors, 1);
  const seenConceptIds = new Set();
  for (const [conceptIndex, conceptId] of conceptIds.entries()) {
    if (!isNonEmptyString(conceptId) || !CONCEPT_ID_PATTERN.test(conceptId)) {
      errors.push(`${label}.conceptIds[${conceptIndex}] 형식이 올바르지 않습니다.`);
    } else if (seenConceptIds.has(conceptId)) {
      errors.push(`${label}.conceptIds에 중복된 ID가 있습니다: ${conceptId}`);
    }
    seenConceptIds.add(conceptId);
    if (lesson && !lesson.conceptIds.includes(conceptId)) {
      errors.push(`${label}.conceptIds[${conceptIndex}]가 연결 교안에 없습니다.`);
    }
  }

  if (!difficultySet.has(problem.difficulty)) errors.push(`${label}.difficulty가 올바르지 않습니다.`);
  if (!typeSet.has(problem.type)) errors.push(`${label}.type이 올바르지 않습니다.`);
  const tags = inspectArray(problem.tags, `${label}.tags`, errors, 1);
  const normalizedTags = new Set();
  for (const [tagIndex, tag] of tags.entries()) {
    validateText(tag, `${label}.tags[${tagIndex}]`, errors);
    if (isNonEmptyString(tag)) normalizedTags.add(tag.trim().toLocaleLowerCase("ko-KR"));
  }
  if (normalizedTags.size !== tags.length) errors.push(`${label}.tags에 중복된 값이 있습니다.`);
  if (!Number.isSafeInteger(problem.estimatedMinutes) || problem.estimatedMinutes < 1) {
    errors.push(`${label}.estimatedMinutes는 1 이상의 안전한 정수여야 합니다.`);
  }
  for (const field of ["title", "summary", "description"]) {
    validateText(problem[field], `${label}.${field}`, errors);
  }

  const parameterCount = validateFunctionContract(
    problem.functionContract,
    `${label}.functionContract`,
    errors,
  );
  if (!isNonEmptyString(problem.entryPoint) || !ENTRY_POINT_PATTERN.test(problem.entryPoint)) {
    errors.push(`${label}.entryPoint 형식이 올바르지 않습니다.`);
  }
  validateText(problem.starterCode, `${label}.starterCode`, errors);
  if (
    isNonEmptyString(problem.entryPoint) &&
    ENTRY_POINT_PATTERN.test(problem.entryPoint) &&
    isNonEmptyString(problem.starterCode) &&
    !new RegExp(`\\b${problem.entryPoint}\\b`).test(problem.starterCode)
  ) {
    errors.push(`${label}.starterCode에 entryPoint가 포함되어야 합니다.`);
  }

  const publicTests = inspectArray(problem.publicTests, `${label}.publicTests`, errors, 4, 12);
  const problemTestIds = new Set();
  for (const [testIndex, testValue] of publicTests.entries()) {
    const testLabel = `${label}.publicTests[${testIndex}]`;
    const publicTest = inspectExactRecord(testValue, testLabel, PUBLIC_TEST_FIELDS, errors);
    if (!publicTest) continue;
    if (!isNonEmptyString(publicTest.id) || !STABLE_ID_PATTERN.test(publicTest.id)) {
      errors.push(`${testLabel}.id 형식이 올바르지 않습니다.`);
    } else if (problemTestIds.has(publicTest.id) || allTestIds.has(publicTest.id)) {
      errors.push(`공개 테스트 ID가 중복됩니다: ${publicTest.id}`);
    }
    problemTestIds.add(publicTest.id);
    allTestIds.add(publicTest.id);
    validateText(publicTest.label, `${testLabel}.label`, errors);
    const args = inspectArray(publicTest.args, `${testLabel}.args`, errors);
    if (args.length !== parameterCount) {
      errors.push(`${testLabel}.args는 함수 매개변수 ${parameterCount}개와 같은 수여야 합니다.`);
    }
    validateJsonValue(args, `${testLabel}.args`, errors);
    validateJsonValue(publicTest.expected, `${testLabel}.expected`, errors);
  }

  const runTestIds = inspectArray(problem.runTestIds, `${label}.runTestIds`, errors, 1, 4);
  const seenRunTestIds = new Set();
  for (const [runIndex, testId] of runTestIds.entries()) {
    if (!isNonEmptyString(testId) || !STABLE_ID_PATTERN.test(testId)) {
      errors.push(`${label}.runTestIds[${runIndex}] 형식이 올바르지 않습니다.`);
    } else if (seenRunTestIds.has(testId)) {
      errors.push(`${label}.runTestIds에 중복된 ID가 있습니다: ${testId}`);
    } else if (!problemTestIds.has(testId)) {
      errors.push(`${label}.runTestIds가 존재하지 않는 공개 테스트를 가리킵니다: ${testId}`);
    }
    seenRunTestIds.add(testId);
  }

  validateExamples(problem.examples, `${label}.examples`, parameterCount, publicTests, errors);

  const explanations = inspectArray(
    problem.failureExplanations,
    `${label}.failureExplanations`,
    errors,
    4,
    12,
  );
  const explanationIds = new Set();
  for (const [explanationIndex, explanationValue] of explanations.entries()) {
    const explanationLabel = `${label}.failureExplanations[${explanationIndex}]`;
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
    validateText(explanation.message, `${explanationLabel}.message`, errors);
  }
  if (
    explanationIds.size !== problemTestIds.size ||
    [...problemTestIds].some((testId) => !explanationIds.has(testId)) ||
    [...explanationIds].some((testId) => !problemTestIds.has(testId))
  ) {
    errors.push(`${label}.failureExplanations는 모든 공개 테스트와 1:1로 연결되어야 합니다.`);
  }

  if (collection.languageId === "javascript") {
    const requestErrors = validateExecutionRequest({
      requestId: `validate-${problem.id}`,
      contractVersion: collection.contractVersion,
      questId: problem.id,
      questRevision: problem.revision,
      languageId: collection.languageId,
      suite: "public",
      source: problem.starterCode,
      entryPoint: problem.entryPoint,
      tests: publicTests.map(({ id, label: testLabel, args, expected }) => ({
        id,
        label: testLabel,
        args,
        expected,
      })),
    });
    for (const requestError of requestErrors) {
      errors.push(`${label}: ${requestError}`);
    }
  }

  try {
    if (NON_PUBLIC_TEST_TERMS.test(JSON.stringify(problem))) {
      errors.push(`${label}에 공개 테스트를 잘못 표현하는 문구가 있습니다.`);
    }
  } catch {
    errors.push(`${label}을 JSON으로 안전하게 확인할 수 없습니다.`);
  }
}

function javaDeclarationPattern(type) {
  return typeof type === "string"
    ? type.split("[]").join("\\s*\\[\\s*\\]")
    : "(?!)";
}

function validateJavaTypedValue(value, type, label, errors) {
  if (typeof type !== "string") return;
  if (type.endsWith("[]")) {
    const items = inspectArray(value, label, errors, 0, 100_000);
    const itemType = type.slice(0, -2);
    for (const [index, item] of items.entries()) {
      validateJavaTypedValue(item, itemType, `${label}[${index}]`, errors);
    }
    return;
  }
  if (type === "int") {
    if (!Number.isInteger(value) || value < JAVA_INT_MIN || value > JAVA_INT_MAX) {
      errors.push(`${label}은 Java int 범위의 정수여야 합니다.`);
    }
    return;
  }
  if (type === "long") {
    try {
      const parsed =
        typeof value === "string" && CANONICAL_DECIMAL_PATTERN.test(value)
          ? BigInt(value)
          : null;
      if (parsed === null || parsed < JAVA_LONG_MIN || parsed > JAVA_LONG_MAX) throw new Error();
    } catch {
      errors.push(`${label}은 Java long 범위의 정규 10진 문자열이어야 합니다.`);
    }
    return;
  }
  if (type === "double") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${label}은 유한한 JSON number여야 합니다.`);
    }
    return;
  }
  if (type === "boolean" && typeof value !== "boolean") {
    errors.push(`${label}은 boolean이어야 합니다.`);
  } else if (type === "String" && typeof value !== "string") {
    errors.push(`${label}은 String이어야 합니다.`);
  }
}

function validateJavaFunctionContract(value, label, errors) {
  const contract = inspectExactRecord(
    value,
    label,
    FUNCTION_CONTRACT_FIELDS,
    errors,
    JAVA_FUNCTION_CONTRACT_REQUIRED_FIELDS,
  );
  if (!contract) return [];

  const parameters = inspectArray(contract.parameters, `${label}.parameters`, errors, 1, 5);
  const parameterNames = new Set();
  for (const [index, parameterValue] of parameters.entries()) {
    const parameterLabel = `${label}.parameters[${index}]`;
    const parameter = inspectExactRecord(parameterValue, parameterLabel, PARAMETER_FIELDS, errors);
    if (!parameter) continue;
    if (!isNonEmptyString(parameter.name) || !ENTRY_POINT_PATTERN.test(parameter.name)) {
      errors.push(`${parameterLabel}.name 형식이 올바르지 않습니다.`);
    } else if (parameterNames.has(parameter.name)) {
      errors.push(`${label}.parameters에 중복된 이름이 있습니다: ${parameter.name}`);
    }
    parameterNames.add(parameter.name);
    if (!JAVA_TYPES.has(parameter.type)) {
      errors.push(`${parameterLabel}.type은 승인된 Java 표시 타입이어야 합니다.`);
    }
    validateText(parameter.description, `${parameterLabel}.description`, errors);
  }

  const returns = inspectExactRecord(contract.returns, `${label}.returns`, RETURN_FIELDS, errors);
  if (returns) {
    if (!JAVA_TYPES.has(returns.type)) {
      errors.push(`${label}.returns.type은 승인된 Java 표시 타입이어야 합니다.`);
    }
    validateText(returns.description, `${label}.returns.description`, errors);
  }

  const constraints = inspectArray(contract.constraints, `${label}.constraints`, errors, 1);
  const normalizedConstraints = new Set();
  for (const [index, constraint] of constraints.entries()) {
    validateText(constraint, `${label}.constraints[${index}]`, errors);
    if (isNonEmptyString(constraint)) normalizedConstraints.add(constraint.trim());
  }
  if (normalizedConstraints.size !== constraints.length) {
    errors.push(`${label}.constraints에 중복된 항목이 있습니다.`);
  }

  if (Object.hasOwn(contract, "complexity")) {
    const complexity = inspectExactRecord(
      contract.complexity,
      `${label}.complexity`,
      COMPLEXITY_FIELDS,
      errors,
    );
    if (complexity) {
      validateText(complexity.time, `${label}.complexity.time`, errors);
      validateText(complexity.space, `${label}.complexity.space`, errors);
    }
  }
  return parameters;
}

function validateJavaExamples(examplesValue, label, parameters, returnType, errors) {
  const examples = inspectArray(examplesValue, label, errors, 1, 3);
  for (const [index, exampleValue] of examples.entries()) {
    const exampleLabel = `${label}[${index}]`;
    const example = inspectExactRecord(exampleValue, exampleLabel, EXAMPLE_FIELDS, errors);
    if (!example) continue;
    const args = inspectArray(example.args, `${exampleLabel}.args`, errors);
    if (args.length !== parameters.length) {
      errors.push(`${exampleLabel}.args는 메서드 매개변수 ${parameters.length}개와 같은 수여야 합니다.`);
    }
    const bytes = serializedJsonByteLength(example, MAX_JAVA_CASE_BYTES);
    if (bytes === null) {
      errors.push(`${exampleLabel}은 순환 없는 JSON 호환 값이어야 합니다.`);
    } else if (bytes > MAX_JAVA_CASE_BYTES) {
      errors.push(`${exampleLabel}은 JSON 기준 ${MAX_JAVA_CASE_BYTES}바이트 이하여야 합니다.`);
    }
    validateText(example.explanation, `${exampleLabel}.explanation`, errors);
    for (const [argumentIndex, parameter] of parameters.entries()) {
      validateJavaTypedValue(
        args[argumentIndex],
        parameter?.type,
        `${exampleLabel}.args[${argumentIndex}]`,
        errors,
      );
    }
    validateJavaTypedValue(example.expected, returnType, `${exampleLabel}.expected`, errors);
  }
}

function validateJavaSupportItems(problem, label, errors) {
  const hints = inspectArray(problem.hints, `${label}.hints`, errors, 0, 5);
  let previousStage = -1;
  for (const [index, hintValue] of hints.entries()) {
    const hintLabel = `${label}.hints[${index}]`;
    const hint = inspectExactRecord(hintValue, hintLabel, HINT_FIELDS, errors);
    if (!hint) continue;
    if (hint.level !== index + 1) errors.push(`${hintLabel}.level은 1부터 순서대로 이어져야 합니다.`);
    if (!HINT_STAGES.has(hint.stage)) {
      errors.push(`${hintLabel}.stage가 올바르지 않습니다.`);
    } else {
      const stage = ["concept", "observation", "implementation"].indexOf(hint.stage);
      if (stage < previousStage) {
        errors.push(`${label}.hints는 concept → observation → implementation 순서여야 합니다.`);
      }
      previousStage = stage;
    }
    validateText(hint.title, `${hintLabel}.title`, errors);
    validateText(hint.content, `${hintLabel}.content`, errors);
  }

  if (!Object.hasOwn(problem, "commonMistakes")) return;
  const mistakes = inspectArray(problem.commonMistakes, `${label}.commonMistakes`, errors, 0);
  const mistakeIds = new Set();
  for (const [index, mistakeValue] of mistakes.entries()) {
    const mistakeLabel = `${label}.commonMistakes[${index}]`;
    const mistake = inspectExactRecord(
      mistakeValue,
      mistakeLabel,
      COMMON_MISTAKE_FIELDS,
      errors,
    );
    if (!mistake) continue;
    if (!isNonEmptyString(mistake.id) || !STABLE_ID_PATTERN.test(mistake.id)) {
      errors.push(`${mistakeLabel}.id 형식이 올바르지 않습니다.`);
    } else if (mistakeIds.has(mistake.id)) {
      errors.push(`${label}.commonMistakes에 중복된 ID가 있습니다: ${mistake.id}`);
    }
    mistakeIds.add(mistake.id);
    validateText(mistake.title, `${mistakeLabel}.title`, errors);
    validateText(mistake.explanation, `${mistakeLabel}.explanation`, errors);
  }
}

function validateJavaProblem(problemValue, index, lessonMap, allTestIds, errors) {
  const label = `problems[${index}]`;
  const problem = inspectExactRecord(
    problemValue,
    label,
    JAVA_PROBLEM_FIELDS,
    errors,
    JAVA_PROBLEM_REQUIRED_FIELDS,
  );
  if (!problem) return;

  if (
    !isNonEmptyString(problem.id) ||
    !/^coding-test-java-bridge-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problem.id)
  ) {
    errors.push(`${label}.id는 coding-test-java-bridge 네임스페이스여야 합니다.`);
  }
  if (!isNonEmptyString(problem.slug) || !/^bridge-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problem.slug)) {
    errors.push(`${label}.slug는 원본 bridge slot이어야 합니다.`);
  } else if (problem.id !== `coding-test-java-${problem.slug}`) {
    errors.push(`${label}.id와 slug의 원본 slot이 일치해야 합니다.`);
  }
  if (problem.revision !== 1) errors.push(`${label}.revision은 1이어야 합니다.`);
  if (problem.order !== index + 1) {
    errors.push(`${label}.order는 원본 72문제 순서대로 1부터 이어져야 합니다.`);
  }

  const lesson = lessonMap.get(problem.lessonId);
  if (!lesson) {
    errors.push(`${label}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
  } else if (lesson.languageId !== "java") {
    errors.push(`${label}.lessonId는 Java 교안을 가리켜야 합니다.`);
  }
  const conceptIds = inspectArray(problem.conceptIds, `${label}.conceptIds`, errors, 1);
  const seenConceptIds = new Set();
  for (const [conceptIndex, conceptId] of conceptIds.entries()) {
    if (!isNonEmptyString(conceptId) || !CONCEPT_ID_PATTERN.test(conceptId)) {
      errors.push(`${label}.conceptIds[${conceptIndex}] 형식이 올바르지 않습니다.`);
    } else if (seenConceptIds.has(conceptId)) {
      errors.push(`${label}.conceptIds에 중복된 ID가 있습니다: ${conceptId}`);
    }
    seenConceptIds.add(conceptId);
    if (lesson && !lesson.conceptIds.includes(conceptId)) {
      errors.push(`${label}.conceptIds[${conceptIndex}]가 연결 교안에 없습니다.`);
    }
  }

  if (!difficultySet.has(problem.difficulty)) errors.push(`${label}.difficulty가 올바르지 않습니다.`);
  if (!typeSet.has(problem.type)) errors.push(`${label}.type이 올바르지 않습니다.`);
  const tags = inspectArray(problem.tags, `${label}.tags`, errors, 2);
  if (new Set(tags).size !== tags.length) errors.push(`${label}.tags에 중복된 값이 있습니다.`);
  tags.forEach((tag, tagIndex) => validateText(tag, `${label}.tags[${tagIndex}]`, errors));
  if (!Number.isSafeInteger(problem.estimatedMinutes) || problem.estimatedMinutes < 1) {
    errors.push(`${label}.estimatedMinutes는 1 이상의 안전한 정수여야 합니다.`);
  }
  for (const field of ["title", "summary", "description"]) {
    validateText(problem[field], `${label}.${field}`, errors);
  }
  if (problem.executionMode !== JAVA_DRAFT_EXECUTION_MODE) {
    errors.push(`${label}.executionMode는 ${JAVA_DRAFT_EXECUTION_MODE}여야 합니다.`);
  }

  const linkFields = ["relatedQuestId", "legacyQuestId"].filter((field) => Object.hasOwn(problem, field));
  if (linkFields.length !== 1) {
    errors.push(`${label}에는 relatedQuestId 또는 legacyQuestId 중 하나만 필요합니다.`);
  }
  for (const field of linkFields) {
    if (
      !isNonEmptyString(problem[field]) ||
      !/^quest-java-bridge-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problem[field])
    ) {
      errors.push(`${label}.${field} 형식이 올바르지 않습니다.`);
    } else if (problem[field] !== `quest-java-${problem.slug}`) {
      errors.push(`${label}.${field}와 slug의 원본 slot이 일치해야 합니다.`);
    }
  }

  const parameters = validateJavaFunctionContract(
    problem.functionContract,
    `${label}.functionContract`,
    errors,
  );
  if (!isNonEmptyString(problem.entryPoint) || !ENTRY_POINT_PATTERN.test(problem.entryPoint)) {
    errors.push(`${label}.entryPoint 형식이 올바르지 않습니다.`);
  }
  const javaContract = inspectExactRecord(
    problem.javaContract,
    `${label}.javaContract`,
    JAVA_CONTRACT_FIELDS,
    errors,
  );
  if (javaContract?.sourceFile !== "Solution.java" || javaContract?.className !== "Solution") {
    errors.push(`${label}.javaContract는 Solution.java의 Solution 클래스여야 합니다.`);
  }
  validateText(problem.starterCode, `${label}.starterCode`, errors);
  const parameterPattern = parameters
    .map((parameter) => `${javaDeclarationPattern(parameter?.type)}\\s+${parameter?.name}`)
    .join("\\s*,\\s*");
  const signaturePattern = JAVA_TYPES.has(problem.functionContract?.returns?.type)
    ? new RegExp(
        `\\bpublic\\s+static\\s+${javaDeclarationPattern(problem.functionContract.returns.type)}\\s+${problem.entryPoint}\\s*\\(\\s*${parameterPattern}\\s*\\)`,
      )
    : null;
  if (
    !isNonEmptyString(problem.starterCode) ||
    !/\bpublic\s+class\s+Solution\b/.test(problem.starterCode) ||
    !signaturePattern?.test(problem.starterCode)
  ) {
    errors.push(`${label}.starterCode에 함수 계약과 같은 public static 메서드 선언이 필요합니다.`);
  }
  if (new TextEncoder().encode(String(problem.starterCode ?? "")).byteLength > MAX_JAVA_SOURCE_BYTES) {
    errors.push(`${label}.starterCode는 UTF-8 ${MAX_JAVA_SOURCE_BYTES}바이트 이하여야 합니다.`);
  }

  validateJavaExamples(
    problem.examples,
    `${label}.examples`,
    parameters,
    problem.functionContract?.returns?.type,
    errors,
  );
  validateText(problem.publicTestSource, `${label}.publicTestSource`, errors);
  if (
    new TextEncoder().encode(String(problem.publicTestSource ?? "")).byteLength >
    MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES
  ) {
    errors.push(`${label}.publicTestSource는 UTF-8 ${MAX_JAVA_PUBLIC_TEST_SOURCE_BYTES}바이트 이하여야 합니다.`);
  }
  const publicTests = inspectArray(problem.publicTests, `${label}.publicTests`, errors, 1, 6);
  const problemTestIds = new Set();
  for (const [testIndex, testValue] of publicTests.entries()) {
    const testLabel = `${label}.publicTests[${testIndex}]`;
    const publicTest = inspectExactRecord(
      testValue,
      testLabel,
      SOURCE_PUBLIC_TEST_FIELDS,
      errors,
    );
    if (!publicTest) continue;
    if (!isNonEmptyString(publicTest.id) || !STABLE_ID_PATTERN.test(publicTest.id)) {
      errors.push(`${testLabel}.id 형식이 올바르지 않습니다.`);
    } else if (problemTestIds.has(publicTest.id) || allTestIds.has(publicTest.id)) {
      errors.push(`공개 테스트 ID가 중복됩니다: ${publicTest.id}`);
    }
    problemTestIds.add(publicTest.id);
    allTestIds.add(publicTest.id);
    validateText(publicTest.label, `${testLabel}.label`, errors);
    validateText(publicTest.assertionSource, `${testLabel}.assertionSource`, errors);
    if (
      isNonEmptyString(publicTest.assertionSource) &&
      !String(problem.publicTestSource ?? "").includes(publicTest.assertionSource)
    ) {
      errors.push(`${testLabel}.assertionSource는 publicTestSource의 원문 일부여야 합니다.`);
    }
  }
  validateJavaSupportItems(problem, label, errors);
  if (NON_PUBLIC_TEST_TERMS.test(JSON.stringify(problem))) {
    errors.push(`${label}에 공개 테스트를 잘못 표현하는 문구가 있습니다.`);
  }
}

function validateJavaCodingTestCollectionInternal(collectionValue, curriculum) {
  const errors = [];
  const collection = inspectExactRecord(
    collectionValue,
    "Java 코딩테스트 컬렉션",
    JAVA_COLLECTION_FIELDS,
    errors,
  );
  if (!collection) return errors;
  if (collection.schemaVersion !== 1) errors.push("지원하는 Java 코딩테스트 schemaVersion은 1입니다.");
  if (collection.contractVersion !== 1) errors.push("지원하는 Java 코딩테스트 contractVersion은 1입니다.");
  if (collection.languageId !== "java") errors.push("Java 코딩테스트 languageId는 java여야 합니다.");
  if (collection.evaluationKind !== JAVA_EVALUATION_KIND) {
    errors.push(`Java 코딩테스트 evaluationKind는 ${JAVA_EVALUATION_KIND}여야 합니다.`);
  }
  validateText(collection.title, "Java 코딩테스트 컬렉션.title", errors);

  const lessonMap = new Map(
    (Array.isArray(curriculum?.lessons) ? curriculum.lessons : []).map((lesson) => [lesson.id, lesson]),
  );
  const problems = inspectArray(collection.problems, "Java 코딩테스트 컬렉션.problems", errors, 72, 72);
  const problemIds = new Set();
  const slugs = new Set();
  const allTestIds = new Set();
  let relatedCount = 0;
  let legacyCount = 0;
  for (const [index, problem] of problems.entries()) {
    if (isPlainRecord(problem)) {
      if (problemIds.has(problem.id)) errors.push(`코딩테스트 문제 ID가 중복됩니다: ${problem.id}`);
      if (slugs.has(problem.slug)) errors.push(`코딩테스트 slug가 중복됩니다: ${problem.slug}`);
      problemIds.add(problem.id);
      slugs.add(problem.slug);
      if (Object.hasOwn(problem, "relatedQuestId")) relatedCount += 1;
      if (Object.hasOwn(problem, "legacyQuestId")) legacyCount += 1;
    }
    validateJavaProblem(problem, index, lessonMap, allTestIds, errors);
  }
  if (relatedCount !== 3 || legacyCount !== 69) {
    errors.push("Java 코딩테스트는 준비 Quest 3개와 legacy Quest 69개에 정확히 대응해야 합니다.");
  }
  return errors;
}

function validateCodingTestCollectionInternal(collectionValue, curriculum) {
  if (collectionValue?.languageId === "java") {
    return validateJavaCodingTestCollectionInternal(collectionValue, curriculum);
  }
  const errors = [];
  const collection = inspectExactRecord(
    collectionValue,
    "코딩테스트 컬렉션",
    COLLECTION_FIELDS,
    errors,
  );
  if (!collection) return errors;

  if (collection.schemaVersion !== 1) errors.push("지원하는 코딩테스트 schemaVersion은 1입니다.");
  if (collection.contractVersion !== 1) {
    errors.push("지원하는 코딩테스트 contractVersion은 1입니다.");
  }
  if (!isNonEmptyString(collection.languageId) || !LANGUAGE_ID_PATTERN.test(collection.languageId)) {
    errors.push("코딩테스트 languageId 형식이 올바르지 않습니다.");
  }
  validateText(collection.title, "코딩테스트 컬렉션.title", errors);

  const lessons = Array.isArray(curriculum?.lessons) ? curriculum.lessons : [];
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const problems = inspectArray(collection.problems, "코딩테스트 컬렉션.problems", errors, 1);
  const problemIds = new Set();
  const slugs = new Set();
  const allTestIds = new Set();

  for (const [index, problem] of problems.entries()) {
    if (isPlainRecord(problem)) {
      if (problemIds.has(problem.id)) errors.push(`코딩테스트 문제 ID가 중복됩니다: ${problem.id}`);
      if (slugs.has(problem.slug)) errors.push(`코딩테스트 slug가 중복됩니다: ${problem.slug}`);
      problemIds.add(problem.id);
      slugs.add(problem.slug);
    }
    validateProblem(problem, index, collection, lessonMap, allTestIds, errors);
  }
  return errors;
}

export function validateCodingTestCollection(collection, curriculum) {
  try {
    return validateCodingTestCollectionInternal(collection, curriculum);
  } catch {
    return ["코딩테스트 콘텐츠를 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidCodingTestCollection(collection, curriculum) {
  const errors = validateCodingTestCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`코딩테스트 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return collection;
}

export async function loadCodingTestCollection(
  languageId,
  curriculum,
  fetchImplementation = globalThis.fetch,
) {
  if (!isNonEmptyString(languageId) || !LANGUAGE_ID_PATTERN.test(languageId)) {
    throw new Error("허용되지 않은 코딩테스트 언어 경로입니다.");
  }
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("코딩테스트 콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }
  const response = await fetchImplementation(`./content/coding-tests/${languageId}.json`);
  if (!response?.ok) {
    throw new Error(`코딩테스트 콘텐츠를 불러오지 못했습니다. (${response?.status ?? "unknown"})`);
  }
  const collection = assertValidCodingTestCollection(await response.json(), curriculum);
  if (collection.languageId !== languageId) {
    throw new Error("요청한 언어와 코딩테스트 컬렉션 언어가 다릅니다.");
  }
  return collection;
}

function resolveProblemList(collectionOrProblems) {
  if (Array.isArray(collectionOrProblems)) return collectionOrProblems;
  if (isPlainRecord(collectionOrProblems) && Array.isArray(collectionOrProblems.problems)) {
    return collectionOrProblems.problems;
  }
  return [];
}

export function getCodingTestProblemsInOrder(collectionOrProblems) {
  return [...resolveProblemList(collectionOrProblems)].sort((left, right) => left.order - right.order);
}

export function findCodingTestProblemBySlug(collectionOrProblems, slug) {
  if (!isNonEmptyString(slug) || !STABLE_ID_PATTERN.test(slug)) return null;
  return resolveProblemList(collectionOrProblems).find((problem) => problem?.slug === slug) ?? null;
}

export function canRunCodingTest(collection, problem, javaExecutionAvailable = false) {
  const belongsToCollection =
    isPlainRecord(collection) &&
    isPlainRecord(problem) &&
    Array.isArray(collection.problems) &&
    collection.problems.some(
      (candidate) =>
        candidate?.id === problem.id && candidate?.revision === problem.revision,
    );
  if (!belongsToCollection) return false;
  if (collection.languageId === "javascript") {
    return problem.executionMode !== JAVA_DRAFT_EXECUTION_MODE;
  }
  return (
    collection.languageId === "java" &&
    collection.evaluationKind === JAVA_EVALUATION_KIND &&
    problem.executionMode === JAVA_DRAFT_EXECUTION_MODE &&
    javaExecutionAvailable === true
  );
}

export function getCodingTestPublicTestsForMode(problem, mode) {
  if (!isPlainRecord(problem) || !Array.isArray(problem.publicTests)) {
    throw new TypeError("실행할 코딩테스트 문제가 필요합니다.");
  }
  if (!executionModeSet.has(mode)) {
    throw new TypeError('코딩테스트 실행 모드는 "run" 또는 "submit"이어야 합니다.');
  }
  if (mode === "submit") return [...problem.publicTests];
  const testsById = new Map(problem.publicTests.map((test) => [test.id, test]));
  return problem.runTestIds.map((testId) => {
    const test = testsById.get(testId);
    if (!test) throw new Error(`실행 공개 테스트를 찾을 수 없습니다: ${testId}`);
    return test;
  });
}

export function filterCodingTestProblems(
  collectionOrProblems,
  {
    query = "",
    difficulty = "all",
    type = "all",
    status = "all",
    completedProblemIds = [],
  } = {},
) {
  const normalizedQuery = String(query).normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
  const completedIds = new Set(completedProblemIds);
  return getCodingTestProblemsInOrder(collectionOrProblems).filter((problem) => {
    if (difficulty !== "all" && problem.difficulty !== difficulty) return false;
    if (type !== "all" && problem.type !== type) return false;
    const isCompleted = completedIds.has(problem.id);
    const isDraftOnly =
      problem.executionMode === JAVA_DRAFT_EXECUTION_MODE &&
      problem.executionAvailable !== true;
    if (status === "solved" && (isDraftOnly || !isCompleted)) return false;
    if (status === "unsolved" && (isCompleted || isDraftOnly)) return false;
    if (!normalizedQuery) return true;
    const searchableText = [
      problem.title,
      problem.summary,
      problem.description,
      problem.type,
      ...(Array.isArray(problem.conceptIds) ? problem.conceptIds : []),
      ...(Array.isArray(problem.tags) ? problem.tags : []),
    ]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("ko-KR");
    return searchableText.includes(normalizedQuery);
  });
}
