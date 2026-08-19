import assert from "node:assert/strict";
import { ALLOWED_JAVA_CONTRACT_TYPES, toJavaLiteral } from "./java-fixture-runner.js";

export const NON_PUBLIC_TEST_TERMS =
  /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;
export const JAVA_STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const JAVA_HINT_STAGES = ["concept", "observation", "implementation"];

function resolveLocalReference(rootSchema, reference) {
  assert.match(reference, /^#\//, `지원하지 않는 스키마 참조입니다: ${reference}`);
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], rootSchema);
}

export function assertMatchesSchema(value, schema, rootSchema = schema, valuePath = "$") {
  if (schema.$ref) {
    const referenced = resolveLocalReference(rootSchema, schema.$ref);
    assert.ok(referenced, `${valuePath}: 스키마 참조를 찾을 수 없습니다.`);
    assertMatchesSchema(value, referenced, rootSchema, valuePath);
    return;
  }

  if (Object.hasOwn(schema, "const")) {
    assert.deepEqual(value, schema.const, `${valuePath}: const 조건 불일치`);
  }
  if (schema.enum) {
    assert.ok(schema.enum.includes(value), `${valuePath}: enum 조건 불일치`);
  }

  if (schema.type === "object") {
    assert.ok(
      value !== null && typeof value === "object" && !Array.isArray(value),
      `${valuePath}: 객체가 필요합니다.`,
    );
    for (const key of schema.required ?? []) {
      assert.ok(Object.hasOwn(value, key), `${valuePath}.${key}: 필수 필드입니다.`);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) {
        assert.ok(allowed.has(key), `${valuePath}.${key}: 추가 필드는 허용되지 않습니다.`);
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        assertMatchesSchema(value[key], childSchema, rootSchema, `${valuePath}.${key}`);
      }
    }
    return;
  }

  if (schema.type === "array") {
    assert.ok(Array.isArray(value), `${valuePath}: 배열이 필요합니다.`);
    if (schema.minItems !== undefined) {
      assert.ok(value.length >= schema.minItems, `${valuePath}: 항목 수가 너무 적습니다.`);
    }
    if (schema.maxItems !== undefined) {
      assert.ok(value.length <= schema.maxItems, `${valuePath}: 항목 수가 너무 많습니다.`);
    }
    if (schema.uniqueItems) {
      assert.equal(
        new Set(value.map((item) => JSON.stringify(item))).size,
        value.length,
        `${valuePath}: 중복 항목이 있습니다.`,
      );
    }
    if (schema.items) {
      value.forEach((item, index) =>
        assertMatchesSchema(item, schema.items, rootSchema, `${valuePath}[${index}]`),
      );
    }
    return;
  }

  if (schema.type === "string") {
    assert.equal(typeof value, "string", `${valuePath}: 문자열이 필요합니다.`);
    if (schema.minLength !== undefined) {
      assert.ok(value.length >= schema.minLength, `${valuePath}: 문자열이 너무 짧습니다.`);
    }
    if (schema.pattern) {
      assert.match(value, new RegExp(schema.pattern), `${valuePath}: 문자열 형식이 다릅니다.`);
    }
    return;
  }

  if (schema.type === "integer") {
    assert.ok(Number.isInteger(value), `${valuePath}: 정수가 필요합니다.`);
    if (schema.minimum !== undefined) {
      assert.ok(value >= schema.minimum, `${valuePath}: minimum보다 작습니다.`);
    }
  }
}

export function assertUnique(values, message) {
  assert.equal(new Set(values).size, values.length, message);
}

export function assertJavaMethodContract(item) {
  assert.match(item.starterCode, /\bpublic\s+class\s+Solution\b/, `${item.id}: Solution class 필요`);
  assert.doesNotMatch(item.starterCode, /\bpackage\s+[A-Za-z_]/, `${item.id}: package 선언 금지`);

  const allowedTypes = new Set(ALLOWED_JAVA_CONTRACT_TYPES);
  const parameterTypes = item.functionContract.parameters.map((parameter) => parameter.type);
  const returnType = item.functionContract.returns.type;
  for (const type of [...parameterTypes, returnType]) {
    assert.ok(allowedTypes.has(type), `${item.id}: 허용되지 않은 계약 타입 ${type}`);
  }

  const escapedEntryPoint = item.entryPoint.replaceAll(/[$]/g, "\\$");
  const declaration = item.starterCode.match(
    new RegExp(
      `public\\s+static\\s+(int\\[\\]|String\\[\\]|int|boolean|String)\\s+${escapedEntryPoint}\\s*\\(([^)]*)\\)`,
    ),
  );
  assert.ok(declaration, `${item.id}: public static 진입점 선언이 필요합니다.`);
  assert.equal(declaration[1], returnType, `${item.id}: 반환 타입 계약 불일치`);

  const declaredParameters = declaration[2]
    .split(",")
    .map((parameter) => parameter.trim())
    .filter(Boolean);
  const expectedParameters = item.functionContract.parameters.map(
    (parameter) => `${parameter.type} ${parameter.name}`,
  );
  assert.deepEqual(declaredParameters, expectedParameters, `${item.id}: 매개변수 계약 불일치`);

  const allCases = [...item.examples, ...item.publicTests];
  for (const testCase of allCases) {
    assert.equal(testCase.args.length, parameterTypes.length, `${item.id}/${testCase.id}: 인수 개수`);
    testCase.args.forEach((argument, index) => toJavaLiteral(argument, parameterTypes[index]));
    toJavaLiteral(testCase.expected, returnType);
  }
}

export function assertExamplesUsePublicContracts(item) {
  for (const example of item.examples) {
    assert.ok(
      item.publicTests.some(
        (testCase) =>
          JSON.stringify(testCase.args) === JSON.stringify(example.args) &&
          JSON.stringify(testCase.expected) === JSON.stringify(example.expected),
      ),
      `${item.id}: 입출력 예와 같은 공개 테스트가 필요합니다.`,
    );
  }
}

export function javaFixtureRequest(item, source, testCases) {
  return {
    source,
    entryPoint: item.entryPoint,
    parameterTypes: item.functionContract.parameters.map((parameter) => parameter.type),
    returnType: item.functionContract.returns.type,
    testCases,
  };
}
