import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertExamplesUsePublicContracts,
  assertJavaMethodContract,
  assertMatchesSchema,
  assertUnique,
  JAVA_STABLE_ID_PATTERN,
  javaFixtureRequest,
  NON_PUBLIC_TEST_TERMS,
} from "./fixtures/java-content-test-helpers.js";
import { javaCodingTestSolutionFixtures } from "./fixtures/java-coding-test-solutions.js";
import { runJavaFixtureCases } from "./fixtures/java-fixture-runner.js";

const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/coding-test.schema.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const codeQuests = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);

const LESSON_CONCEPT_CONTRACT = Object.freeze({
  "java-01-types-methods": ["java.types", "java.variables", "java.methods", "java.compilation"],
  "java-02-control-flow-arrays": ["java.operators", "java.control-flow", "java.arrays"],
  "java-03-classes-objects": [
    "java.classes",
    "java.objects",
    "java.constructors",
    "java.encapsulation",
  ],
  "java-04-collections-generics": [
    "java.collections",
    "java.generics",
    "java.list",
    "java.map",
  ],
  "java-05-exceptions-debugging": [
    "java.exceptions",
    "java.checked-exceptions",
    "java.debugging",
  ],
  "java-06-review-practice": [
    "java.problem-decomposition",
    "java.testing",
    "java.complexity",
  ],
});

test("Java 코딩테스트 6문제가 전용 JSON Schema를 통과한다", () => {
  assert.doesNotThrow(() => assertMatchesSchema(collection, schema));
  assert.equal(collection.languageId, "java");
  assert.equal(collection.problems.length, 6);
});

test("난이도·유형·순서가 검색 필터를 검증할 수 있게 분포한다", () => {
  assert.deepEqual(
    Object.fromEntries(
      ["beginner", "intermediate", "advanced"].map((difficulty) => [
        difficulty,
        collection.problems.filter((problem) => problem.difficulty === difficulty).length,
      ]),
    ),
    { beginner: 3, intermediate: 2, advanced: 1 },
  );
  assert.ok(new Set(collection.problems.map((problem) => problem.type)).size >= 3);
  assert.deepEqual(
    collection.problems.map((problem) => problem.order),
    [1, 2, 3, 4, 5, 6],
  );
});

test("문제·slug·공개 테스트 ID가 Java 네임스페이스에서 고유하다", () => {
  const problemIds = collection.problems.map((problem) => problem.id);
  const slugs = collection.problems.map((problem) => problem.slug);
  const publicTestIds = collection.problems.flatMap((problem) =>
    problem.publicTests.map((testCase) => testCase.id),
  );
  assertUnique(problemIds, "Java 코딩테스트 문제 ID가 중복됩니다.");
  assertUnique(slugs, "Java 코딩테스트 slug가 중복됩니다.");
  assertUnique(publicTestIds, "Java 코딩테스트 공개 테스트 ID가 중복됩니다.");
  for (const id of [...problemIds, ...slugs, ...publicTestIds]) {
    assert.match(id, JAVA_STABLE_ID_PATTERN);
    assert.ok(id.includes("java-"), `${id}: java 네임스페이스가 필요합니다.`);
  }
});

test("모든 문제가 고정 Java 교안·개념 계약과 실제 curriculum에 연결된다", () => {
  const lessonById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  for (const problem of collection.problems) {
    const contractedConcepts = LESSON_CONCEPT_CONTRACT[problem.lessonId];
    assert.ok(contractedConcepts, `${problem.id}: 고정 계약에 없는 교안입니다.`);
    assert.ok(problem.conceptIds.every((conceptId) => contractedConcepts.includes(conceptId)));
    const lesson = lessonById.get(problem.lessonId);
    assert.ok(lesson, `${problem.id}: curriculum 교안이 필요합니다.`);
    assert.equal(lesson.languageId, "java");
    assert.deepEqual(lesson.conceptIds, contractedConcepts);
    assert.ok(problem.conceptIds.every((conceptId) => lesson.conceptIds.includes(conceptId)));
  }
});

test("모든 문제가 public class Solution의 public static 허용 타입 계약을 사용한다", () => {
  const questEntryPoints = new Set(codeQuests.quests.map((quest) => quest.entryPoint));
  for (const problem of collection.problems) {
    assertJavaMethodContract(problem);
    assertExamplesUsePublicContracts(problem);
    assert.match(problem.id, /^coding-test-java-/);
    assert.equal(questEntryPoints.has(problem.entryPoint), false, `${problem.id}: Quest 진입점과 중복`);
  }
});

test("공개 테스트 6개 이상에 실패 설명이 일대일이고 runTestIds는 진부분집합이다", () => {
  assert.doesNotMatch(JSON.stringify(collection), NON_PUBLIC_TEST_TERMS);
  for (const problem of collection.problems) {
    assert.ok(problem.publicTests.length >= 6);
    assert.equal(problem.failureExplanations.length, problem.publicTests.length);
    const publicIds = new Set(problem.publicTests.map((testCase) => testCase.id));
    assert.deepEqual(
      problem.failureExplanations.map((item) => item.testId).sort(),
      [...publicIds].sort(),
    );
    assert.ok(problem.runTestIds.length >= 1);
    assert.ok(problem.runTestIds.length < problem.publicTests.length);
    assertUnique(problem.runTestIds, `${problem.id}: runTestIds가 중복됩니다.`);
    assert.ok(problem.runTestIds.every((id) => publicIds.has(id)));
  }
});

test("학생 분류는 내부 클래스 구조를 권장·자가점검으로 두고 반환 배열만 자동 채점한다", () => {
  const problem = collection.problems.find(
    (item) => item.id === "coding-test-java-classify-students",
  );
  assert.ok(problem);
  assert.match(problem.description, /권장 구현 방식/);
  assert.match(problem.description, /스스로 객체를 사용했는지 확인/);
  assert.match(problem.description, /자동 채점은 반환 배열의 값과 순서만 검사/);
  assert.match(problem.description, /내부 클래스 구조는 판정하지 않습니다/);
});

test("문자열 결과 문제의 복잡도는 총 문자 수와 Map 평균 연산 비용을 포함한다", () => {
  const classify = collection.problems.find(
    (item) => item.id === "coding-test-java-classify-students",
  );
  const frequency = collection.problems.find(
    (item) => item.id === "coding-test-java-frequency-report",
  );
  assert.ok(classify);
  assert.ok(frequency);
  assert.match(classify.functionContract.complexity.time, /O\(n \+ c\)/);
  assert.match(classify.functionContract.complexity.time, /c = 모든 이름 길이의 합/);
  assert.match(classify.functionContract.complexity.space, /O\(n \+ c\)/);
  assert.match(frequency.functionContract.complexity.time, /O\(n \+ c \+ u log\(n \+ 1\)\) 평균/);
  assert.match(frequency.functionContract.complexity.time, /c = 모든 단어 길이의 합/);
  assert.match(frequency.functionContract.complexity.time, /LinkedHashMap 연산 평균 O\(1\) 가정/);
  assert.match(frequency.functionContract.complexity.space, /O\(u \+ c \+ u log\(n \+ 1\)\)/);
});

test("fixture가 모든 문제의 복잡도·독립 사례·대표 오답을 기록한다", () => {
  assert.deepEqual(
    Object.keys(javaCodingTestSolutionFixtures).sort(),
    collection.problems.map((problem) => problem.id).sort(),
  );

  for (const problem of collection.problems) {
    const fixture = javaCodingTestSolutionFixtures[problem.id];
    assert.deepEqual(fixture.expectedComplexity, problem.functionContract.complexity);
    assert.ok(fixture.verificationCases.length >= 1);
    assert.ok(fixture.representativeWrongSolutions.length >= 1);
    for (const verificationCase of fixture.verificationCases) {
      assert.ok(
        !problem.publicTests.some(
          (publicCase) =>
            JSON.stringify(publicCase.args) === JSON.stringify(verificationCase.args),
        ),
        `${problem.id}/${verificationCase.id}: 독립 사례가 공개 테스트와 중복됩니다.`,
      );
    }
  }
});

test("영문 모음 기준 풀이는 비ASCII 대문자 İ를 ASCII I로 간주하지 않는다", () => {
  const fixture = javaCodingTestSolutionFixtures["coding-test-java-count-vowels"];
  assert.ok(fixture);
  assert.deepEqual(
    fixture.verificationCases.find(
      (testCase) => testCase.id === "verify-java-vowels-non-ascii-capital-i",
    ),
    {
      id: "verify-java-vowels-non-ascii-capital-i",
      args: ["İ"],
      expected: 0,
    },
  );
  assert.doesNotMatch(fixture.referenceSource, /Character\.toLowerCase/);
});

test("starterCode는 Java 21로 실행되지만 전체 공개 테스트의 완성 답안은 아니다", async () => {
  for (const problem of collection.problems) {
    const failingIds = await runJavaFixtureCases(
      javaFixtureRequest(problem, problem.starterCode, problem.publicTests),
    );
    assert.ok(failingIds.length >= 1, `${problem.id}: starterCode가 완성 답안입니다.`);
    assert.ok(
      failingIds.every((id) => problem.publicTests.some((testCase) => testCase.id === id)),
      `${problem.id}: starterCode가 값 비교 전에 실패했습니다: ${failingIds.join(", ")}`,
    );
  }
});

test("기준 풀이는 Java 21에서 공개 테스트·경계·독립 사례를 모두 통과한다", async () => {
  for (const problem of collection.problems) {
    const fixture = javaCodingTestSolutionFixtures[problem.id];
    const failingIds = await runJavaFixtureCases(
      javaFixtureRequest(problem, fixture.referenceSource, [
        ...problem.publicTests,
        ...fixture.verificationCases,
      ]),
    );
    assert.deepEqual(failingIds, [], `${problem.id}: 기준 풀이 실패`);
  }
});

test("각 대표 오답은 Java 21에서 정상 실행되고 선언한 공개 테스트에서 정확히 실패한다", async () => {
  for (const problem of collection.problems) {
    const fixture = javaCodingTestSolutionFixtures[problem.id];
    for (const wrongSolution of fixture.representativeWrongSolutions) {
      const failingIds = await runJavaFixtureCases(
        javaFixtureRequest(problem, wrongSolution.source, problem.publicTests),
      );
      assert.deepEqual(failingIds, wrongSolution.expectedFailingPublicTestIds);
      assert.ok(failingIds.length >= 1);
      assert.ok(failingIds.length < problem.publicTests.length);
    }
  }
});
