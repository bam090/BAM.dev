import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { areJsonValuesEqual } from "../src/grading/code-grading.js";
import { executeJavaScriptTest } from "../src/grading/javascript-runtime.js";
import { codingTestSolutionFixtures } from "./fixtures/coding-test-solutions.js";

const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/javascript.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/coding-test.schema.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const codeQuests = JSON.parse(
  await readFile(new URL("../content/quests/javascript.json", import.meta.url), "utf8"),
);

const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;
const FORBIDDEN_RUNTIME_API_PATTERN =
  /\b(?:document|window|fetch|XMLHttpRequest|WebSocket|EventSource|navigator|location|localStorage|sessionStorage|indexedDB|caches|importScripts|setTimeout|setInterval|requestAnimationFrame|Date|performance|crypto|Intl)\b|Math\.random/;

function resolveLocalReference(reference) {
  assert.match(reference, /^#\//);
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], schema);
}

function validateAgainstSchema(value, currentSchema, path = "$") {
  if (currentSchema.$ref) {
    const referenced = resolveLocalReference(currentSchema.$ref);
    assert.ok(referenced, `${path}: 스키마 참조를 찾을 수 없습니다.`);
    validateAgainstSchema(value, referenced, path);
    return;
  }
  if (Object.hasOwn(currentSchema, "const")) {
    assert.deepEqual(value, currentSchema.const, `${path}: const 조건 불일치`);
  }
  if (currentSchema.enum) {
    assert.ok(currentSchema.enum.includes(value), `${path}: enum 조건 불일치`);
  }
  if (currentSchema.type === "object") {
    assert.ok(value !== null && typeof value === "object" && !Array.isArray(value), `${path}: 객체 필요`);
    for (const field of currentSchema.required ?? []) {
      assert.ok(Object.hasOwn(value, field), `${path}.${field}: 필수 필드`);
    }
    if (currentSchema.additionalProperties === false) {
      const allowed = new Set(Object.keys(currentSchema.properties ?? {}));
      for (const field of Object.keys(value)) {
        assert.ok(allowed.has(field), `${path}.${field}: 추가 필드 금지`);
      }
    }
    for (const [field, fieldSchema] of Object.entries(currentSchema.properties ?? {})) {
      if (Object.hasOwn(value, field)) validateAgainstSchema(value[field], fieldSchema, `${path}.${field}`);
    }
  }
  if (currentSchema.type === "array") {
    assert.ok(Array.isArray(value), `${path}: 배열 필요`);
    if (currentSchema.minItems !== undefined) assert.ok(value.length >= currentSchema.minItems);
    if (currentSchema.maxItems !== undefined) assert.ok(value.length <= currentSchema.maxItems);
    if (currentSchema.uniqueItems) {
      assert.equal(new Set(value.map((item) => JSON.stringify(item))).size, value.length);
    }
    for (const [index, item] of value.entries()) {
      if (currentSchema.items) validateAgainstSchema(item, currentSchema.items, `${path}[${index}]`);
    }
  }
  if (currentSchema.type === "string") {
    assert.equal(typeof value, "string", `${path}: 문자열 필요`);
    if (currentSchema.minLength !== undefined) assert.ok(value.length >= currentSchema.minLength);
    if (currentSchema.pattern) assert.match(value, new RegExp(currentSchema.pattern));
  }
  if (currentSchema.type === "integer") {
    assert.ok(Number.isInteger(value), `${path}: 정수 필요`);
    if (currentSchema.minimum !== undefined) assert.ok(value >= currentSchema.minimum);
  }
}

async function executeCase(source, problem, testCase) {
  return executeJavaScriptTest({
    source,
    entryPoint: problem.entryPoint,
    args: testCase.args,
  });
}

test("JavaScript 코딩테스트 컬렉션이 전용 JSON Schema를 통과한다", () => {
  assert.doesNotThrow(() => validateAgainstSchema(collection, schema));

  const invalid = structuredClone(collection);
  invalid.problems[0].unexpected = true;
  assert.throws(() => validateAgainstSchema(invalid, schema));
});

test("6문제의 난이도와 유형 분포가 필터를 실제로 검증할 수 있게 구성된다", () => {
  assert.equal(collection.schemaVersion, 1);
  assert.equal(collection.contractVersion, 1);
  assert.equal(collection.languageId, "javascript");
  assert.equal(collection.problems.length, 6);

  const difficultyCounts = Object.fromEntries(
    ["beginner", "intermediate", "advanced"].map((difficulty) => [
      difficulty,
      collection.problems.filter((problem) => problem.difficulty === difficulty).length,
    ]),
  );
  assert.deepEqual(difficultyCounts, { beginner: 3, intermediate: 2, advanced: 1 });
  assert.ok(new Set(collection.problems.map((problem) => problem.type)).size >= 4);
  assert.deepEqual(
    collection.problems.map((problem) => problem.order),
    [1, 2, 3, 4, 5, 6],
  );
});

test("모든 문제 ID·slug·공개 테스트 ID가 고유하고 교안 개념에 연결된다", () => {
  const lessons = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  const problemIds = collection.problems.map((problem) => problem.id);
  const slugs = collection.problems.map((problem) => problem.slug);
  const publicTestIds = collection.problems.flatMap((problem) =>
    problem.publicTests.map((publicTest) => publicTest.id),
  );

  assert.equal(new Set(problemIds).size, problemIds.length);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(new Set(publicTestIds).size, publicTestIds.length);

  for (const problem of collection.problems) {
    const lesson = lessons.get(problem.lessonId);
    assert.ok(problem.id.startsWith("coding-test-javascript-"));
    assert.ok(lesson, `${problem.id}: 연결 교안이 필요합니다.`);
    assert.equal(lesson.languageId, collection.languageId);
    assert.ok(problem.conceptIds.every((conceptId) => lesson.conceptIds.includes(conceptId)));
  }
});

test("runTestIds는 공개 테스트의 진부분집합이며 제출 테스트도 모두 브라우저 공개 데이터다", () => {
  assert.doesNotMatch(JSON.stringify(collection), NON_PUBLIC_TEST_TERMS);
  for (const problem of collection.problems) {
    const publicIds = new Set(problem.publicTests.map((testCase) => testCase.id));
    assert.ok(problem.runTestIds.length >= 1);
    assert.ok(problem.runTestIds.length < problem.publicTests.length);
    assert.equal(new Set(problem.runTestIds).size, problem.runTestIds.length);
    assert.ok(problem.runTestIds.every((testId) => publicIds.has(testId)));
    assert.deepEqual(
      problem.failureExplanations.map((item) => item.testId).sort(),
      [...publicIds].sort(),
    );
  }
});

test("예시는 실제 공개 테스트와 같은 입출력 계약을 사용한다", () => {
  for (const problem of collection.problems) {
    for (const example of problem.examples) {
      assert.ok(
        problem.publicTests.some(
          (testCase) =>
            areJsonValuesEqual(testCase.args, example.args) &&
            areJsonValuesEqual(testCase.expected, example.expected),
        ),
        `${problem.id}: 예시와 같은 공개 테스트가 필요합니다.`,
      );
    }
  }
});

test("fixture가 모든 문제와 정확히 대응하고 독립 검증 사례가 공개 사례와 중복되지 않는다", () => {
  assert.deepEqual(
    Object.keys(codingTestSolutionFixtures).sort(),
    collection.problems.map((problem) => problem.id).sort(),
  );

  for (const problem of collection.problems) {
    const fixture = codingTestSolutionFixtures[problem.id];
    assert.deepEqual(fixture.expectedComplexity, problem.functionContract.complexity);
    assert.ok(fixture.verificationCases.length >= 1);
    assert.ok(fixture.representativeWrongSolutions.length >= 1);
    for (const verificationCase of fixture.verificationCases) {
      assert.equal(verificationCase.args.length, problem.functionContract.parameters.length);
      assert.ok(
        !problem.publicTests.some((testCase) =>
          areJsonValuesEqual(testCase.args, verificationCase.args),
        ),
        `${problem.id}/${verificationCase.id}: 독립 사례가 공개 테스트 입력과 중복됩니다.`,
      );
    }
  }
});

test("각 기준 풀이가 모든 공개 테스트와 독립 검증 사례를 실제 런타임으로 통과한다", async () => {
  for (const problem of collection.problems) {
    const fixture = codingTestSolutionFixtures[problem.id];
    for (const testCase of [...problem.publicTests, ...fixture.verificationCases]) {
      const result = await executeCase(fixture.referenceSource, problem, testCase);
      assert.equal(result.outcome, "completed", `${problem.id}/${testCase.id}: 실행 실패`);
      assert.ok(
        areJsonValuesEqual(result.value, testCase.expected),
        `${problem.id}/${testCase.id}: 기준 풀이 결과 불일치`,
      );
    }
  }
});

test("각 대표 오답은 정상 실행되지만 의도한 공개 테스트에서 정확히 실패한다", async () => {
  for (const problem of collection.problems) {
    const fixture = codingTestSolutionFixtures[problem.id];
    for (const wrongSolution of fixture.representativeWrongSolutions) {
      const failingTestIds = [];
      for (const testCase of problem.publicTests) {
        const result = await executeCase(wrongSolution.source, problem, testCase);
        assert.equal(
          result.outcome,
          "completed",
          `${problem.id}/${wrongSolution.id}/${testCase.id}: 값 비교까지 실행되어야 합니다.`,
        );
        if (!areJsonValuesEqual(result.value, testCase.expected)) {
          failingTestIds.push(testCase.id);
        }
      }
      assert.deepEqual(failingTestIds, wrongSolution.expectedFailingPublicTestIds);
      assert.ok(failingTestIds.length >= 1);
      assert.ok(failingTestIds.length < problem.publicTests.length);
    }
  }
});

test("격자 로봇은 남쪽·서쪽 이동 벡터를 공개 채점하고 변경된 계약 리비전을 사용한다", () => {
  const problem = collection.problems.find(
    (item) => item.id === "coding-test-javascript-grid-robot",
  );
  assert.ok(problem);
  assert.ok(problem.revision >= 2);
  const publicTestIds = new Set(problem.publicTests.map((testCase) => testCase.id));
  assert.ok(publicTestIds.has("robot-move-south"));
  assert.ok(publicTestIds.has("robot-move-west"));

  const fixture = codingTestSolutionFixtures[problem.id];
  assert.ok(
    fixture.representativeWrongSolutions.some(
      (wrongSolution) =>
        wrongSolution.id === "reverse-south-and-west-vectors" &&
        wrongSolution.expectedFailingPublicTestIds.includes("robot-move-south") &&
        wrongSolution.expectedFailingPublicTestIds.includes("robot-move-west"),
    ),
  );
});

test("starterCode는 실행 가능하지만 전체 공개 테스트를 이미 통과하지 않는다", async () => {
  for (const problem of collection.problems) {
    let passed = 0;
    for (const testCase of problem.publicTests) {
      const result = await executeCase(problem.starterCode, problem, testCase);
      assert.equal(result.outcome, "completed", `${problem.id}/${testCase.id}: starter 실행 실패`);
      if (areJsonValuesEqual(result.value, testCase.expected)) passed += 1;
    }
    assert.ok(passed < problem.publicTests.length, `${problem.id}: starter가 완성 답안입니다.`);
  }
});

test("문제·기준 풀이·대표 오답은 결정적 순수 함수 범위를 지킨다", () => {
  const questEntryPoints = new Set(codeQuests.quests.map((quest) => quest.entryPoint));
  for (const problem of collection.problems) {
    const fixture = codingTestSolutionFixtures[problem.id];
    assert.equal(questEntryPoints.has(problem.entryPoint), false);
    for (const source of [
      problem.starterCode,
      fixture.referenceSource,
      ...fixture.representativeWrongSolutions.map((item) => item.source),
    ]) {
      assert.doesNotMatch(source, FORBIDDEN_RUNTIME_API_PATTERN, `${problem.id}: 제외 API 사용`);
    }
    assert.equal(JSON.stringify(collection).includes(fixture.referenceSource.trim()), false);
  }
});
