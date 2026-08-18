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

const LANGUAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const ENTRY_POINT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MAX_JSON_BYTES = 16 * 1024;
const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;

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

function inspectExactRecord(value, label, fields, errors) {
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
  for (const field of fields) {
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

function validateCodingTestCollectionInternal(collectionValue, curriculum) {
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
    if (status === "solved" && !isCompleted) return false;
    if (status === "unsolved" && isCompleted) return false;
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
