import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const curriculum = await load("../content/curriculum.json");
const javaCodingTests = await load("../content/coding-tests/java.json");
const fixtures = await load("./fixtures/java-coding-test-authored-solutions.json");

// DEC-JAVA-CT-AUTHORED-01: 연습 문제가 없던 알고리즘 교안 12편에 문서당 1문제를 원본 72문제 뒤에 붙였다.
const AUTHORED = [
  ["algo-tree-map-01", "algo-tree-java"],
  ["algo-bellman-ford-01", "algo-07-bellman-ford"],
  ["algo-binary-search-01", "algo-09-binary-search"],
  ["algo-topological-sort-01", "algo-09-topological-sort"],
  ["algo-string-01", "algo-10-string-simulation"],
  ["algo-gcd-01", "algo-06-number-theory-geometry"],
  ["algo-prime-01", "algo-13-prime"],
  ["algo-combinatorics-01", "algo-13-combinatorics"],
  ["algo-bits-01", "algo-13-bits"],
  ["algo-geometry-01", "algo-13-geometry"],
  ["algo-integer-01", "algo-13-integer-java"],
  ["algo-fast-power-01", "algo-13-fast-power"],
];

test("새로 만든 Java 코딩테스트 12문제는 원본 72문제 뒤에 교안 순서로 붙고 연결 교안의 개념을 쓴다", () => {
  const authored = javaCodingTests.problems.filter((problem) => problem.origin === "bam-authored");
  assert.equal(javaCodingTests.title, "알고리즘 Java 코딩테스트");
  assert.deepEqual(javaCodingTests.problems.slice(72), authored);
  assert.deepEqual(authored.map(({ slug, lessonId }) => [slug, lessonId]), AUTHORED);
  assert.deepEqual(authored.map(({ order }) => order), AUTHORED.map((_, index) => 73 + index));
  for (const problem of authored) {
    const lesson = curriculum.lessons.find((candidate) => candidate.id === problem.lessonId);
    assert.equal(problem.id, `coding-test-java-${problem.slug}`);
    assert.ok(problem.conceptIds.every((conceptId) => lesson.conceptIds.includes(conceptId)), problem.slug);
    assert.equal(problem.executionMode, "draft-only", problem.slug);
    assert.equal(Object.hasOwn(problem, "relatedQuestId") || Object.hasOwn(problem, "legacyQuestId"), false, problem.slug);
    assert.doesNotMatch(problem.publicTestSource, /^\s*package\s/m, `${problem.slug}: 공개 테스트는 기본 패키지`);
    assert.match(problem.publicTestSource, /Solution\.solve\(/, problem.slug);
    assert.ok(problem.hints.length >= 1, `${problem.slug}: 힌트가 필요합니다.`);
  }
});

test("새 문제마다 기준 풀이·독립 사례·대표 오답과 Java 17 실제 실행 결과를 fixture에 남긴다", () => {
  const authored = javaCodingTests.problems.filter((problem) => problem.origin === "bam-authored");
  assert.deepEqual(fixtures.map(({ problemId, revision }) => [problemId, revision]), authored.map(({ id, revision }) => [id, revision]));
  for (const fixture of fixtures) {
    assert.match(fixture.executionStatus, /^PASS: Java 17\.0\.20 \+ JUnit 6\.0\.3/, fixture.problemId);
    assert.match(fixture.referenceSolution, /public class Solution/, fixture.problemId);
    assert.ok(fixture.independentCases.length >= 2, `${fixture.problemId}: 독립 사례 2개 이상`);
    assert.ok(fixture.representativeWrongAnswerCandidates.length >= 2, `${fixture.problemId}: 대표 오답 2개 이상`);
    for (const wrong of fixture.representativeWrongAnswerCandidates) {
      assert.ok(wrong.id && wrong.misconception, fixture.problemId);
      assert.match(wrong.wrongSolution, /public class Solution/, `${fixture.problemId}: ${wrong.id}`);
    }
  }
});
