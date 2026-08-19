import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertExamplesUsePublicContracts,
  assertJavaMethodContract,
  assertMatchesSchema,
  assertUnique,
  JAVA_HINT_STAGES,
  JAVA_STABLE_ID_PATTERN,
  javaFixtureRequest,
  NON_PUBLIC_TEST_TERMS,
} from "./fixtures/java-content-test-helpers.js";
import { javaCodeQuestSolutionFixtures } from "./fixtures/java-code-quest-solutions.js";
import { runJavaFixtureCases } from "./fixtures/java-fixture-runner.js";

const collection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/code-quest.schema.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collectionsLesson = await readFile(
  new URL("../content/lessons/java/collections-generics-list-and-map.md", import.meta.url),
  "utf8",
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

test("Java Code Quest 5개가 언어 중립 JSON Schema를 통과한다", () => {
  assert.doesNotThrow(() => assertMatchesSchema(collection, schema));
  assert.equal(collection.languageId, "java");
  assert.equal(collection.quests.length, 5);
});

test("Quest·slug·공개 테스트·대표 오답 ID가 Java 네임스페이스에서 고유하다", () => {
  const questIds = collection.quests.map((quest) => quest.id);
  const slugs = collection.quests.map((quest) => quest.slug);
  const publicTestIds = collection.quests.flatMap((quest) =>
    quest.publicTests.map((testCase) => testCase.id),
  );
  const mistakeIds = collection.quests.flatMap((quest) =>
    quest.commonMistakes.map((mistake) => mistake.id),
  );

  assertUnique(questIds, "Java Quest ID가 중복됩니다.");
  assertUnique(slugs, "Java Quest slug가 중복됩니다.");
  assertUnique(publicTestIds, "Java 공개 테스트 ID가 중복됩니다.");
  assertUnique(mistakeIds, "Java 대표 오답 ID가 중복됩니다.");
  for (const id of [...questIds, ...slugs, ...publicTestIds, ...mistakeIds]) {
    assert.match(id, JAVA_STABLE_ID_PATTERN);
    assert.ok(id.includes("java-"), `${id}: java 네임스페이스가 필요합니다.`);
  }

  assert.deepEqual(
    collection.quests.map((quest) => quest.order),
    [1, 2, 3, 4, 5],
  );
});

test("모든 Quest가 고정 Java 교안·개념 계약과 실제 curriculum에 연결된다", () => {
  const lessonById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  for (const quest of collection.quests) {
    const contractedConcepts = LESSON_CONCEPT_CONTRACT[quest.lessonId];
    assert.ok(contractedConcepts, `${quest.id}: 고정 계약에 없는 교안입니다.`);
    assert.ok(
      quest.conceptIds.every((conceptId) => contractedConcepts.includes(conceptId)),
      `${quest.id}: 고정 계약에 없는 개념을 참조합니다.`,
    );
    const lesson = lessonById.get(quest.lessonId);
    assert.ok(lesson, `${quest.id}: curriculum 교안이 필요합니다.`);
    assert.equal(lesson.languageId, "java");
    assert.deepEqual(lesson.conceptIds, contractedConcepts);
    assert.ok(quest.conceptIds.every((conceptId) => lesson.conceptIds.includes(conceptId)));
  }
});

test("모든 Quest가 public class Solution의 public static 허용 타입 계약을 사용한다", () => {
  for (const quest of collection.quests) {
    assertJavaMethodContract(quest);
    assertExamplesUsePublicContracts(quest);
    assert.match(quest.id, /^quest-java-/);
    assert.equal(quest.difficulty, "beginner");
    assert.ok(quest.estimatedMinutes >= 10 && quest.estimatedMinutes <= 25);
  }
});

test("공개 테스트·실패 설명·단계별 힌트가 일대일 계약을 이룬다", () => {
  assert.doesNotMatch(JSON.stringify(collection), NON_PUBLIC_TEST_TERMS);
  for (const quest of collection.quests) {
    assert.ok(quest.publicTests.length >= 4 && quest.publicTests.length <= 6);
    assert.equal(quest.failureExplanations.length, quest.publicTests.length);
    assert.deepEqual(
      quest.failureExplanations.map((item) => item.testId).sort(),
      quest.publicTests.map((item) => item.id).sort(),
    );
    assert.deepEqual(
      quest.hints.slice(0, 3).map((hint) => hint.stage),
      JAVA_HINT_STAGES,
    );
    assert.deepEqual(
      quest.hints.slice(0, 3).map((hint) => hint.level),
      [1, 2, 3],
    );
    assert.ok(quest.commonMistakes.length >= 1);
  }
});

test("좌석 Quest는 내부 클래스 구조를 권장·자가점검으로 두고 반환값만 자동 채점한다", () => {
  const quest = collection.quests.find((item) => item.id === "quest-java-remaining-seats");
  assert.ok(quest);
  assert.match(quest.instructions, /권장 구현/);
  assert.match(quest.instructions, /스스로 .*확인/);
  assert.match(quest.instructions, /자동 채점은 .*반환값만 검사/);
  assert.match(quest.instructions, /내부 클래스 구조는 판정하지 않습니다/);
});

test("이름 중복 제거 Quest는 교안에서 배운 List.contains만 사용한다", () => {
  const quest = collection.quests.find((item) => item.id === "quest-java-distinct-names");
  assert.ok(quest);
  assert.equal(quest.revision, 2);
  assert.match(collectionsLesson, /contains\(value\)/);
  assert.match(quest.starterCode, /List<String>/);
  assert.doesNotMatch(JSON.stringify(quest), /\b(?:HashSet|TreeSet|Set)\b/);
  assert.match(quest.functionContract.complexity.time, /O\(n² \+ n·c\) 최악/);
  assert.match(quest.functionContract.complexity.time, /c = 모든 이름 길이의 합/);
  assert.match(quest.functionContract.complexity.time, /List\.contains의 선형 탐색/);
  assert.match(quest.functionContract.complexity.space, /O\(n\) 추가 공간/);
});

test("Java Quest fixture가 복잡도·경계·독립 사례·대표 오답을 빠짐없이 기록한다", () => {
  assert.deepEqual(
    Object.keys(javaCodeQuestSolutionFixtures).sort(),
    collection.quests.map((quest) => quest.id).sort(),
  );

  for (const quest of collection.quests) {
    const fixture = javaCodeQuestSolutionFixtures[quest.id];
    assert.deepEqual(fixture.expectedComplexity, quest.functionContract.complexity);
    assert.deepEqual(
      fixture.representativeWrongSolutions.map((item) => item.id).sort(),
      quest.commonMistakes.map((item) => item.id).sort(),
    );
    assert.deepEqual(Object.keys(fixture.boundaryCoverage), ["normal", "minimum", "maximum", "edge"]);
    assert.ok(fixture.verificationCases.length >= 1);

    const knownCaseIds = new Set([
      ...quest.publicTests.map((item) => item.id),
      ...fixture.verificationCases.map((item) => item.id),
    ]);
    for (const ids of Object.values(fixture.boundaryCoverage)) {
      assert.ok(ids.length >= 1);
      assert.ok(ids.every((id) => knownCaseIds.has(id)), `${quest.id}: 없는 경계 사례 참조`);
    }
    for (const verificationCase of fixture.verificationCases) {
      assert.ok(
        !quest.publicTests.some(
          (publicCase) =>
            JSON.stringify(publicCase.args) === JSON.stringify(verificationCase.args) &&
            JSON.stringify(publicCase.expected) === JSON.stringify(verificationCase.expected),
        ),
        `${quest.id}/${verificationCase.id}: 독립 사례가 공개 테스트와 중복됩니다.`,
      );
    }
  }
});

test("starterCode는 Java 21로 실행되지만 전체 공개 테스트의 완성 답안은 아니다", async () => {
  for (const quest of collection.quests) {
    const failingIds = await runJavaFixtureCases(
      javaFixtureRequest(quest, quest.starterCode, quest.publicTests),
    );
    assert.ok(failingIds.length >= 1, `${quest.id}: starterCode가 완성 답안입니다.`);
    assert.ok(
      failingIds.every((id) => quest.publicTests.some((testCase) => testCase.id === id)),
      `${quest.id}: starterCode가 값 비교 전에 실패했습니다: ${failingIds.join(", ")}`,
    );
  }
});

test("기준 풀이는 Java 21에서 모든 공개 테스트와 독립 검증을 통과한다", async () => {
  for (const quest of collection.quests) {
    const fixture = javaCodeQuestSolutionFixtures[quest.id];
    const failingIds = await runJavaFixtureCases(
      javaFixtureRequest(quest, fixture.referenceSource, [
        ...quest.publicTests,
        ...fixture.verificationCases,
      ]),
    );
    assert.deepEqual(failingIds, [], `${quest.id}: 기준 풀이 실패`);
  }
});

test("각 대표 오답은 Java 21에서 정상 실행되고 선언한 공개 테스트에서 정확히 실패한다", async () => {
  for (const quest of collection.quests) {
    const fixture = javaCodeQuestSolutionFixtures[quest.id];
    for (const wrongSolution of fixture.representativeWrongSolutions) {
      const failingIds = await runJavaFixtureCases(
        javaFixtureRequest(quest, wrongSolution.source, quest.publicTests),
      );
      assert.deepEqual(failingIds, wrongSolution.expectedFailingPublicTestIds);
      assert.ok(failingIds.length >= 1);
      assert.ok(failingIds.length < quest.publicTests.length);
    }
  }
});
