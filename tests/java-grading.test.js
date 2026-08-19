import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createCodeQuestExecutionRequest,
  validateCodeQuestCollection,
} from "../src/core/code-quest.js";
import { createCodingTestRunnerRequest } from "../src/grading/coding-test-runner-adapter.js";
import {
  createJavaExecutionRequestSnapshot,
  hasJavaSolutionEntryPointDeclaration,
  normalizeJavaFunctionContract,
  normalizeJavaType,
} from "../src/grading/java-grading.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const questCollection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);
const codingTestCollection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);

function createRequest(overrides = {}) {
  return {
    requestId: "java-request-one",
    contractVersion: 1,
    questId: "quest-java-example",
    questRevision: 1,
    languageId: "java",
    suite: "public",
    source: "public class Solution { public static int add(int left, int right) { return left + right; } }",
    entryPoint: "add",
    parameterTypes: ["int", "int"],
    returnType: "int",
    tests: [{ id: "java-add-one", label: "두 정수", args: [1, 2], expected: 3 }],
    ...overrides,
  };
}

test("Java 함수 타입은 허용된 다섯 타입으로만 정규화한다", () => {
  assert.equal(normalizeJavaType(" int [ ] "), "int[]");
  assert.equal(normalizeJavaType(" String[] "), "String[]");
  assert.throws(() => normalizeJavaType("long"), /지원하지 않는 Java 함수 타입/);

  const normalized = normalizeJavaFunctionContract({
    parameters: [{ name: "names", type: "String [ ]" }],
    returns: { type: "boolean" },
  });
  assert.deepEqual(normalized, {
    parameterTypes: ["String[]"],
    returnType: "boolean",
  });
  assert.ok(Object.isFrozen(normalized));
  assert.ok(Object.isFrozen(normalized.parameterTypes));
});

test("Java 실행 요청은 machine-readable 타입과 공개 테스트를 동결한다", () => {
  const snapshot = createJavaExecutionRequestSnapshot(createRequest());
  assert.equal(snapshot.languageId, "java");
  assert.deepEqual(snapshot.parameterTypes, ["int", "int"]);
  assert.equal(snapshot.returnType, "int");
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.tests));
  assert.ok(Object.isFrozen(snapshot.tests[0].args));
});

test("Java 실행 요청은 Java에서 유효한 JavaScript 예약어 메서드명을 허용한다", () => {
  for (const entryPoint of ["delete", "typeof", "let", "function"]) {
    const snapshot = createJavaExecutionRequestSnapshot(createRequest({ entryPoint }));
    assert.equal(snapshot.entryPoint, entryPoint);
  }
});

test("Java 실행 요청은 검증한 own data 값만 스냅샷에 사용한다", () => {
  let entryPointReads = 0;
  const request = new Proxy(createRequest({ entryPoint: "delete" }), {
    get(target, property, receiver) {
      if (property === "entryPoint") {
        entryPointReads += 1;
        return entryPointReads <= 3 ? "delete" : "class";
      }
      return Reflect.get(target, property, receiver);
    },
  });

  const snapshot = createJavaExecutionRequestSnapshot(request);
  assert.equal(snapshot.entryPoint, "delete");
  assert.equal(entryPointReads, 0);
  assert.ok(Object.isFrozen(snapshot));
});

test("Java 실행 요청은 타입과 맞지 않는 값·예약어·추가 필드를 거부한다", () => {
  assert.throws(
    () => createJavaExecutionRequestSnapshot(createRequest({ tests: [{ id: "bad", args: [1, 2], expected: 3.5 }] })),
    /expected.*int/,
  );
  assert.throws(
    () => createJavaExecutionRequestSnapshot(createRequest({ entryPoint: "record" })),
    /Java 식별자/,
  );
  for (const entryPoint of ["true", "false", "null"]) {
    assert.throws(
      () => createJavaExecutionRequestSnapshot(createRequest({ entryPoint })),
      /Java 식별자/,
    );
  }
  assert.throws(
    () => createJavaExecutionRequestSnapshot({ ...createRequest(), hiddenTests: [] }),
    /허용되지 않은 필드/,
  );
});

test("Code Quest와 코딩테스트 요청이 canonical functionContract 타입을 포함한다", () => {
  const quest = questCollection.quests[1];
  const questRequest = createCodeQuestExecutionRequest(
    questCollection,
    quest,
    quest.starterCode,
    "java-quest-request",
  );
  assert.deepEqual(questRequest.parameterTypes, ["int[]", "int"]);
  assert.equal(questRequest.returnType, "int");

  const problem = codingTestCollection.problems[0];
  const execution = createCodingTestRunnerRequest({
    collection: codingTestCollection,
    problem,
    source: problem.starterCode,
    requestId: "java-coding-run",
    mode: "run",
  });
  assert.deepEqual(
    execution.runnerRequest.parameterTypes,
    problem.functionContract.parameters.map((parameter) => parameter.type),
  );
  assert.equal(
    execution.runnerRequest.returnType,
    problem.functionContract.returns.type,
  );
});

test("Java starterCode는 Solution의 public static 계약과 일치해야 한다", () => {
  const quest = questCollection.quests[0];
  assert.equal(
    hasJavaSolutionEntryPointDeclaration(
      quest.starterCode,
      quest.entryPoint,
      quest.functionContract,
    ),
    true,
  );

  const invalidCollection = structuredClone(questCollection);
  invalidCollection.quests[0].starterCode = invalidCollection.quests[0].starterCode.replace(
    "public static String",
    "public String",
  );
  const errors = validateCodeQuestCollection(invalidCollection, curriculum);
  assert.ok(errors.some((error) => /public static entryPoint/u.test(error)));
});
