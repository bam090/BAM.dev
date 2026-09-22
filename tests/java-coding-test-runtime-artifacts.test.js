import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CT_EVALUATION_KIND,
  CT_JUNIT,
  CT_RUNNER_CLASS,
  createCodingTestArtifacts,
} from "../desktop/runtime/coding-test-artifacts.mjs";

const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);

const APPROVED_TYPES = [
  "String",
  "String[]",
  "String[][]",
  "boolean",
  "boolean[][]",
  "double",
  "double[]",
  "int",
  "int[]",
  "int[][]",
  "long",
  "long[]",
];

test("CT manifest는 Java72의 원본 168개 공개 method를 고정 selector로 보존한다", () => {
  const before = JSON.stringify(collection);
  const { manifest, sources } = createCodingTestArtifacts(collection);

  assert.equal(CT_EVALUATION_KIND, "java-junit-method-v1");
  assert.equal(CT_RUNNER_CLASS, "BamCodingTestRunner");
  assert.deepEqual(CT_JUNIT, {
    version: "6.1.3",
    file: "junit-platform-console-standalone-6.1.3.jar",
    size: 2_997_949,
    sha256: "e62b96ac475dbcde8599ea905d088f65d90778f86e259b856a49fa5c4ea256ec",
  });
  assert.equal(JSON.stringify(collection), before, "artifact 생성이 원본 컬렉션을 바꾸면 안 됩니다.");
  assert.deepEqual(
    {
      schemaVersion: manifest.schemaVersion,
      contractVersion: manifest.contractVersion,
      languageId: manifest.languageId,
      evaluationKind: manifest.evaluationKind,
    },
    {
      schemaVersion: 1,
      contractVersion: 1,
      languageId: "java",
      evaluationKind: "java-junit-method-v1",
    },
  );
  assert.equal(manifest.problems.length, 72);
  assert.equal(manifest.problems.reduce((sum, problem) => sum + problem.tests.length, 0), 168);

  const selectors = new Set();
  const usedTypes = new Set();
  for (const [index, problem] of collection.problems.entries()) {
    const generated = manifest.problems[index];
    assert.equal(generated.id, problem.id);
    assert.equal(generated.revision, problem.revision);
    assert.equal(generated.entryPoint, "solve");
    assert.deepEqual(generated.parameters, problem.functionContract.parameters.map(({ name, type }) => ({
      name,
      type,
    })));
    assert.equal(generated.returnType, problem.functionContract.returns.type);
    assert.deepEqual(generated.tests.map(({ id }) => id), problem.publicTests.map(({ id }) => id));
    assert.deepEqual(generated.runTestIds, [problem.publicTests[0].id]);

    const publicSourcePath = `sources/${generated.tests[0].testClass.replaceAll(".", "/")}.java`;
    assert.equal(sources[publicSourcePath], problem.publicTestSource, problem.id);
    for (const [testIndex, publicTest] of problem.publicTests.entries()) {
      const generatedTest = generated.tests[testIndex];
      assert.equal(generatedTest.label, publicTest.label);
      assert.equal(generatedTest.assertionSource, publicTest.assertionSource);
      assert.ok(problem.publicTestSource.includes(generatedTest.assertionSource));
      assert.equal(selectors.has(`${generatedTest.testClass}#${generatedTest.method}`), false);
      selectors.add(`${generatedTest.testClass}#${generatedTest.method}`);
    }

    for (const parameter of generated.parameters) usedTypes.add(parameter.type);
    usedTypes.add(generated.returnType);
  }
  assert.equal(selectors.size, 168);
  assert.deepEqual([...usedTypes].sort(), APPROVED_TYPES);

  const first = manifest.problems[0];
  assert.deepEqual(
    first.tests.map(({ id, testClass, method }) => ({ id, testClass, method })),
    [
      {
        id: "bridge-arr-01-corrects-one-position",
        testClass: "bridge.array.onedimensional.test.ArraySolution01Test",
        method: "correctsOnePosition",
      },
      {
        id: "bridge-arr-01-test06",
        testClass: "bridge.array.onedimensional.test.ArraySolution01Test",
        method: "test06",
      },
    ],
  );
});

test("typed adapter는 Solution.solve 서명을 직접 전달하고 JSON 변환을 만들지 않는다", () => {
  const { manifest, sources } = createCodingTestArtifacts(collection);

  for (const generated of manifest.problems) {
    const adapterPath = `sources/${generated.solutionClass.replaceAll(".", "/")}.java`;
    const adapter = sources[adapterPath];
    assert.equal(typeof adapter, "string", generated.id);
    assert.match(adapter, /dev\.bam\.runtime\.SolutionInvoker\.invoke\(/u, generated.id);
    assert.doesNotMatch(adapter, /JSON|ObjectMapper|Gson/u, generated.id);
    assert.match(
      adapter,
      new RegExp(`public static ${generated.returnType.replaceAll("[", "\\[").replaceAll("]", "\\]")} solve\\(`, "u"),
      generated.id,
    );
    for (const parameter of generated.parameters) {
      assert.match(adapter, new RegExp(`${parameter.type.replaceAll("[", "\\[").replaceAll("]", "\\]")} ${parameter.name}\\b`, "u"));
      assert.match(adapter, new RegExp(`${parameter.type.replaceAll("[", "\\[").replaceAll("]", "\\]")}\\.class`, "u"));
    }
  }
});

test("artifact 생성은 원본 source와 public group의 불일치를 닫힌 상태로 거부한다", () => {
  const changedAssertion = structuredClone(collection);
  changedAssertion.problems[0].publicTests[0].assertionSource += "\n// changed";
  assert.throws(
    () => createCodingTestArtifacts(changedAssertion),
    /original public source/u,
  );

  const duplicatePublicId = structuredClone(collection);
  duplicatePublicId.problems[1].publicTests[0].id = collection.problems[0].publicTests[0].id;
  assert.throws(
    () => createCodingTestArtifacts(duplicatePublicId),
    /test identity/u,
  );

  const missingProblem = structuredClone(collection);
  missingProblem.problems.pop();
  assert.throws(
    () => createCodingTestArtifacts(missingProblem),
    /approved Java72/u,
  );
});
