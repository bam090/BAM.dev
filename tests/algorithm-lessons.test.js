import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { splitMarkdownSection } from "../src/ui/markdown.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const algorithmLessons = curriculum.lessons
  .filter((lesson) => lesson.courseId === "algorithm")
  .sort((left, right) => left.order - right.order);

function conceptIdsFrom(text) {
  return [...text.matchAll(/`([a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+)`/g)].map(
    (match) => match[1],
  );
}

test("알고리즘 과정 교안은 선언한 conceptId를 선행·후속 흐름에 연결한다", async () => {
  assert.ok(algorithmLessons.length > 0);

  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const connection = markdown.match(/\n## 개념 연결\n([\s\S]*?)(?=\n## |$)/);

    assert.ok(connection, `${lesson.id}: 개념 연결 섹션이 필요합니다.`);

    const objectiveSection = markdown.match(/\n## 학습 목표\n([\s\S]*?)(?=\n## |$)/);
    const objectives = objectiveSection?.[1]
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2));

    assert.deepEqual(objectives, lesson.objectives, `${lesson.id}: 학습 목표가 다릅니다.`);

    const prerequisiteLine = connection[1].match(/^- 선행:\s*(.+)$/m);
    const currentLine = connection[1].match(/^- 이 단원:\s*(.+)$/m);
    const followupLine = connection[1].match(/^- 후속:\s*(.+)$/m);

    assert.ok(prerequisiteLine, `${lesson.id}: 선행 conceptId가 필요합니다.`);
    assert.ok(currentLine, `${lesson.id}: 이 단원 conceptId가 필요합니다.`);
    assert.ok(followupLine, `${lesson.id}: 후속 conceptId 안내가 필요합니다.`);

    const previousIds = new Set(
      curriculum.lessons
        .filter(
          (candidate) =>
            candidate.languageId === lesson.languageId &&
            (candidate.courseId !== lesson.courseId || candidate.order < lesson.order),
        )
        .flatMap((candidate) => candidate.conceptIds),
    );
    const laterIds = new Set(
      curriculum.lessons
        .filter(
          (candidate) =>
            candidate.courseId === lesson.courseId && candidate.order > lesson.order,
        )
        .flatMap((candidate) => candidate.conceptIds),
    );
    const prerequisiteIds = conceptIdsFrom(prerequisiteLine[1]);
    const currentIds = conceptIdsFrom(currentLine[1]);
    const followupIds = conceptIdsFrom(followupLine[1]);

    assert.ok(prerequisiteIds.length > 0, `${lesson.id}: 선행 conceptId가 비어 있습니다.`);
    assert.deepEqual(currentIds, lesson.conceptIds, `${lesson.id}: 현재 conceptId가 다릅니다.`);
    assert.ok(
      prerequisiteIds.every((conceptId) => previousIds.has(conceptId)),
      `${lesson.id}: 앞 단원에 없는 선행 conceptId가 있습니다.`,
    );
    if (lesson === algorithmLessons.at(-1)) {
      assert.equal(followupIds.length, 0, `${lesson.id}: 마지막 단원 뒤에 conceptId가 있습니다.`);
      assert.match(
        followupLine[1],
        /마지막 단원이므로 새 후속 conceptId는 없습니다/,
        `${lesson.id}: 과정이 끝났다는 안내가 필요합니다.`,
      );
    } else {
      assert.ok(followupIds.length > 0, `${lesson.id}: 후속 conceptId가 비어 있습니다.`);
      assert.ok(
        followupIds.every((conceptId) => laterIds.has(conceptId)),
        `${lesson.id}: 뒤 단원에 없는 후속 conceptId가 있습니다.`,
      );
    }
  }
});

test("알고리즘 14개 교안은 Java 예제·예상 출력과 명시한 직접답을 제공한다", async () => {
  assert.equal(algorithmLessons.length, 14);
  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const javaExamples = [...markdown.matchAll(/```java\n([\s\S]*?)```/g)];
    assert.equal(lesson.languageId, "java", lesson.id);
    assert.ok(javaExamples.length > 0, `${lesson.id}: Java 예제가 필요합니다.`);
    assert.doesNotMatch(markdown, /^```(?:js|javascript)\b/m, lesson.id);
    for (const [, source] of javaExamples) {
      assert.match(source, /public class \w+/, `${lesson.id}: 파일로 저장할 클래스가 필요합니다.`);
      assert.match(source, /public static void main\(String\[\] \w+\)/, `${lesson.id}: 실행 진입점이 필요합니다.`);
    }
    assert.match(markdown, /```text\n\S[\s\S]*?```/, `${lesson.id}: 비교할 예상 출력이 필요합니다.`);
    assert.equal(lesson.answerHeading, "핵심 질문 답", lesson.id);
    assert.ok(lesson.essentialQuestion?.trim(), `${lesson.id}: 핵심 질문이 필요합니다.`);
    assert.ok(splitMarkdownSection(markdown, lesson.answerHeading).section, `${lesson.id}: 직접답이 필요합니다.`);
  }
});

test("분리한 알고리즘 기초 세 문서는 개념 소유와 Java 전환 순서를 보존한다", () => {
  assert.deepEqual(
    algorithmLessons.slice(0, 3).map(({ id, slug, conceptIds }) => [id, slug, conceptIds]),
    [
      ["algo-list-conditions", "list-and-conditions", ["algo.list", "algo.condition"]],
      ["algo-dictionary", "dictionary", ["algo.dictionary"]],
      ["js-10-stack-queue", "stack-and-queue", ["algo.stack", "algo.queue"]],
    ],
  );
  assert.deepEqual(algorithmLessons.map(({ order }) => order), Array.from({ length: 14 }, (_, index) => index + 1));
  assert.deepEqual(
    algorithmLessons.slice(3).map(({ id, conceptIds }) => [id, conceptIds]),
    [
      ["algo-hash-map-set", ["algo.hashing", "algo.map-collection", "algo.set-collection"]],
      ["js-14-heap-greedy", ["algo.heap", "algo.priority-queue", "algo.greedy"]],
      ["js-11-sorting-window", ["algo.sorting", "algo.two-pointers", "algo.sliding-window"]],
      ["js-12-brute-force-backtracking", ["algo.brute-force", "algo.recursion", "algo.backtracking"]],
      ["algo-06-number-theory-geometry", ["algo.number-theory", "algo.geometry"]],
      ["js-15-binary-search-dp", ["algo.binary-search", "algo.dynamic-programming"]],
      ["js-13-bfs-dfs", ["algo.graph-representation", "algo.bfs", "algo.dfs", "algo.grid-traversal"]],
      ["algo-09-tree", ["algo.tree", "algo.tree-traversal"]],
      ["js-08-implementation-simulation", ["algo.simulation", "algo.string-processing"]],
      ["algo-11-dynamic-programming-advanced", ["algo.dynamic-programming-advanced"]],
      ["algo-12-dijkstra", ["algo.weighted-graph", "algo.shortest-path", "algo.dijkstra"]],
    ],
  );
});
