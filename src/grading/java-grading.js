import { createExecutionRequestSnapshot } from "./code-grading.js";

export const JAVA_EXECUTION_TYPES = Object.freeze([
  "int",
  "boolean",
  "String",
  "int[]",
  "String[]",
]);

const JAVA_TYPE_SET = new Set(JAVA_EXECUTION_TYPES);
const JAVA_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const JAVA_RESERVED_WORDS = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "exports",
  "extends",
  "final",
  "finally",
  "false",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "module",
  "native",
  "new",
  "non-sealed",
  "open",
  "opens",
  "package",
  "permits",
  "private",
  "protected",
  "provides",
  "public",
  "record",
  "requires",
  "return",
  "sealed",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "to",
  "true",
  "transient",
  "transitive",
  "try",
  "uses",
  "var",
  "void",
  "volatile",
  "when",
  "while",
  "with",
  "yield",
  "null",
  "_",
]);
const JAVA_REQUEST_FIELDS = new Set([
  "requestId",
  "contractVersion",
  "questId",
  "questRevision",
  "languageId",
  "suite",
  "source",
  "entryPoint",
  "parameterTypes",
  "returnType",
  "tests",
]);
const INT_MIN = -2_147_483_648;
const INT_MAX = 2_147_483_647;

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function readExactRequestFields(request) {
  if (!isPlainRecord(request)) {
    throw new TypeError("Java 실행 요청은 일반 객체여야 합니다.");
  }
  const values = Object.create(null);
  const fields = Reflect.ownKeys(request);
  for (const field of fields) {
    if (typeof field !== "string" || !JAVA_REQUEST_FIELDS.has(field)) {
      throw new TypeError(`Java 실행 요청에 허용되지 않은 필드가 있습니다: ${String(field)}`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(request, field);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new TypeError(`Java 실행 요청.${field}는 열거 가능한 값 필드여야 합니다.`);
    }
    values[field] = descriptor.value;
  }
  for (const field of JAVA_REQUEST_FIELDS) {
    if (!Object.hasOwn(values, field)) {
      throw new TypeError(`Java 실행 요청.${field}는 필수 필드입니다.`);
    }
  }
  return values;
}

export function normalizeJavaType(type) {
  if (typeof type !== "string") {
    throw new TypeError("Java 함수 타입은 문자열이어야 합니다.");
  }
  const normalized = type.trim().replace(/\s*\[\s*\]\s*$/u, "[]");
  if (!JAVA_TYPE_SET.has(normalized)) {
    throw new TypeError(
      `지원하지 않는 Java 함수 타입입니다: ${type}. ` +
        `허용 타입: ${JAVA_EXECUTION_TYPES.join(", ")}`,
    );
  }
  return normalized;
}

export function normalizeJavaFunctionContract(functionContract) {
  if (!isPlainRecord(functionContract) || !Array.isArray(functionContract.parameters)) {
    throw new TypeError("Java functionContract.parameters 배열이 필요합니다.");
  }
  if (!isPlainRecord(functionContract.returns)) {
    throw new TypeError("Java functionContract.returns 객체가 필요합니다.");
  }
  const parameterTypes = functionContract.parameters.map((parameter, index) => {
    if (!isPlainRecord(parameter)) {
      throw new TypeError(`Java functionContract.parameters[${index}]가 올바르지 않습니다.`);
    }
    if (
      typeof parameter.name !== "string" ||
      !JAVA_IDENTIFIER_PATTERN.test(parameter.name) ||
      JAVA_RESERVED_WORDS.has(parameter.name)
    ) {
      throw new TypeError(
        `Java functionContract.parameters[${index}].name은 예약어가 아닌 Java 식별자여야 합니다.`,
      );
    }
    return normalizeJavaType(parameter.type);
  });
  return Object.freeze({
    parameterTypes: Object.freeze(parameterTypes),
    returnType: normalizeJavaType(functionContract.returns.type),
  });
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function hasJavaSolutionEntryPointDeclaration(
  source,
  entryPoint,
  functionContract,
) {
  if (
    typeof source !== "string" ||
    typeof entryPoint !== "string" ||
    !JAVA_IDENTIFIER_PATTERN.test(entryPoint)
  ) {
    return false;
  }
  let normalized;
  try {
    normalized = normalizeJavaFunctionContract(functionContract);
  } catch {
    return false;
  }
  const classPattern = /\bpublic\s+(?:(?:final|abstract)\s+)?class\s+Solution\b/u;
  if (!classPattern.test(source)) return false;

  const parameterPattern = functionContract.parameters
    .map((parameter, index) => {
      const type = escapeRegularExpression(normalized.parameterTypes[index]);
      const name = escapeRegularExpression(parameter.name);
      return `${type}\\s+${name}`;
    })
    .join("\\s*,\\s*");
  const signaturePattern = new RegExp(
    `\\bpublic\\s+static\\s+${escapeRegularExpression(normalized.returnType)}\\s+` +
      `${escapeRegularExpression(entryPoint)}\\s*\\(\\s*${parameterPattern}\\s*\\)`,
    "u",
  );
  return signaturePattern.test(source);
}

function isJavaInt(value) {
  return Number.isInteger(value) && value >= INT_MIN && value <= INT_MAX;
}

function matchesJavaValue(type, value) {
  if (type === "int") return isJavaInt(value);
  if (type === "boolean") return typeof value === "boolean";
  if (type === "String") return value === null || typeof value === "string";
  if (type === "int[]") {
    return value === null || (Array.isArray(value) && value.every(isJavaInt));
  }
  if (type === "String[]") {
    return (
      value === null ||
      (Array.isArray(value) &&
        value.every((item) => item === null || typeof item === "string"))
    );
  }
  return false;
}

function assertJavaTestValues(tests, parameterTypes, returnType) {
  for (const [testIndex, test] of tests.entries()) {
    if (test.args.length !== parameterTypes.length) {
      throw new TypeError(
        `tests[${testIndex}].args는 parameterTypes와 같은 수의 항목이 필요합니다.`,
      );
    }
    for (const [argumentIndex, argument] of test.args.entries()) {
      const parameterType = parameterTypes[argumentIndex];
      if (!matchesJavaValue(parameterType, argument)) {
        throw new TypeError(
          `tests[${testIndex}].args[${argumentIndex}] 값이 ${parameterType} 타입과 맞지 않습니다.`,
        );
      }
    }
    if (!matchesJavaValue(returnType, test.expected)) {
      throw new TypeError(
        `tests[${testIndex}].expected 값이 ${returnType} 반환 타입과 맞지 않습니다.`,
      );
    }
  }
}

export function createJavaExecutionRequestSnapshot(request, limitOverrides) {
  let requestValues;
  try {
    requestValues = readExactRequestFields(request);
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError("Java 실행 요청을 안전하게 확인할 수 없습니다.");
  }
  if (requestValues.languageId !== "java") {
    throw new TypeError('Java 실행 요청 languageId는 "java"여야 합니다.');
  }
  if (
    typeof requestValues.entryPoint !== "string" ||
    !JAVA_IDENTIFIER_PATTERN.test(requestValues.entryPoint) ||
    JAVA_RESERVED_WORDS.has(requestValues.entryPoint)
  ) {
    throw new TypeError("entryPoint는 예약어가 아닌 안정적인 Java 식별자여야 합니다.");
  }
  if (!Array.isArray(requestValues.parameterTypes)) {
    throw new TypeError("Java 실행 요청 parameterTypes 배열이 필요합니다.");
  }

  const parameterTypes = requestValues.parameterTypes.map(normalizeJavaType);
  const returnType = normalizeJavaType(requestValues.returnType);
  const baseSnapshot = createExecutionRequestSnapshot(
    {
      requestId: requestValues.requestId,
      contractVersion: requestValues.contractVersion,
      questId: requestValues.questId,
      questRevision: requestValues.questRevision,
      languageId: "javascript",
      suite: requestValues.suite,
      source: requestValues.source,
      entryPoint: "solution",
      tests: requestValues.tests,
    },
    limitOverrides,
  );
  assertJavaTestValues(baseSnapshot.tests, parameterTypes, returnType);

  return Object.freeze({
    ...baseSnapshot,
    languageId: "java",
    entryPoint: requestValues.entryPoint,
    parameterTypes: Object.freeze(parameterTypes),
    returnType,
  });
}
