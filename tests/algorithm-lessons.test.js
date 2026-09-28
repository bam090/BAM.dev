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

test("알고리즘 교안의 선수 링크는 앞 키워드만 가리키고 개념 ID는 문서 하나에만 속한다", async () => {
  assert.ok(algorithmLessons.length > 0);
  const unitOrderOf = (lesson) => (lesson.parentLessonId === undefined
    ? lesson
    : curriculum.lessons.find((candidate) => candidate.id === lesson.parentLessonId)).order;

  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");

    const objectiveSection = markdown.match(/\n## 학습 목표\n([\s\S]*?)(?=\n## |$)/);
    const objectives = objectiveSection?.[1]
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2));
    assert.deepEqual(objectives, lesson.objectives, `${lesson.id}: 학습 목표가 다릅니다.`);

    // 학습자가 실제로 누르는 선수 링크로 배우는 순서를 검사한다. 같은 키워드의 문서끼리는 서로 가리킬 수 있다.
    const prerequisites = splitMarkdownSection(markdown, "먼저 확인할 개념").section;
    assert.ok(prerequisites, `${lesson.id}: 먼저 확인할 개념 절이 필요합니다.`);
    for (const [, slug] of prerequisites.matchAll(/\(#\/learn\/algorithm\/([a-z0-9-]+)\)/g)) {
      const target = algorithmLessons.find((candidate) => candidate.slug === slug);
      assert.ok(target, `${lesson.id}: 없는 알고리즘 문서 ${slug}를 가리킵니다.`);
      assert.ok(unitOrderOf(target) <= unitOrderOf(lesson), `${lesson.id}: 뒤 키워드의 ${slug}를 선수로 가리킵니다.`);
    }
  }

  const conceptIds = algorithmLessons.flatMap((lesson) => lesson.conceptIds);
  assert.equal(new Set(conceptIds).size, conceptIds.length, "개념 ID는 알고리즘 과정의 문서 하나에만 속합니다.");
});

test("알고리즘 교안은 Java 예제·실행 가능한 전체 프로그램·예상 출력과 명시한 직접답을 제공한다", async () => {
  assert.equal(algorithmLessons.filter((lesson) => lesson.parentLessonId === undefined).length, 14);
  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const javaExamples = [...markdown.matchAll(/```java\n([\s\S]*?)```/g)];
    assert.equal(lesson.languageId, "java", lesson.id);
    assert.ok(javaExamples.length > 0, `${lesson.id}: Java 예제가 필요합니다.`);
    assert.doesNotMatch(markdown, /^```(?:js|javascript)\b/m, lesson.id);
    // 본문에는 읽기 쉬운 코드 조각을 두고 저장해 실행할 수 있는 전체 프로그램은 하나 이상 둔다(예: "전체 코드 보기" 토글).
    assert.ok(
      javaExamples.some(([, source]) => /public class \w+/.test(source) && /public static void main\(String\[\] \w+\)/.test(source)),
      `${lesson.id}: 파일로 저장해 실행할 수 있는 전체 프로그램이 필요합니다.`,
    );
    assert.match(markdown, /```text\n\S[\s\S]*?```/, `${lesson.id}: 비교할 예상 출력이 필요합니다.`);
    assert.equal(lesson.answerHeading, "핵심 질문 답", lesson.id);
    assert.ok(lesson.essentialQuestion?.trim(), `${lesson.id}: 핵심 질문이 필요합니다.`);
    assert.ok(splitMarkdownSection(markdown, lesson.answerHeading).section, `${lesson.id}: 직접답이 필요합니다.`);
  }
});

test("알고리즘 과정은 0~13 키워드 구조를 따르고 옛 교안 ID·주소는 같은 개념을 잇는 문서에 남는다", () => {
  const unitLessons = algorithmLessons.filter((lesson) => lesson.parentLessonId === undefined);
  assert.deepEqual(unitLessons.map(({ order }) => order), Array.from({ length: 14 }, (_, index) => index + 1));
  assert.deepEqual(unitLessons.map(({ id, keyword }) => [id, keyword]), [
    ["algo-00-data-structures-algorithms", "자료구조와 알고리즘"],
    ["algo-01-array", "배열"],
    ["js-10-stack-queue", "스택"],
    ["algo-03-queue", "큐"],
    ["algo-hash-map-set", "해시"],
    ["algo-09-tree", "트리"],
    ["algo-06-union-find", "집합"],
    ["js-13-bfs-dfs", "그래프"],
    ["js-12-brute-force-backtracking", "백트래킹"],
    ["js-11-sorting-window", "정렬"],
    ["js-08-implementation-simulation", "시뮬레이션"],
    ["js-15-binary-search-dp", "동적 계획법"],
    ["js-14-heap-greedy", "그리디"],
    ["algo-06-number-theory-geometry", "수학"],
  ]);
  // 키워드마다 개념과 활용 문서가 모두 있다(bam 확정).
  for (const unit of unitLessons) {
    const kinds = algorithmLessons.filter((lesson) => lesson.parentLessonId === unit.id).map((lesson) => lesson.documentKind);
    assert.ok(kinds.includes("application"), `${unit.keyword}: 활용문서가 필요합니다.`);
  }
  // 옛 교안은 URL과 완료 기록을 지키려고 같은 개념을 이어받는 문서에 그대로 남는다.
  const preserved = [
    ["algo-list-conditions", "list-and-conditions", "algo-01-array"],
    ["algo-dictionary", "dictionary", "algo-hash-map-set"],
    ["algo-12-dijkstra", "weighted-graphs-dijkstra", "js-13-bfs-dfs"],
    ["algo-11-dynamic-programming-advanced", "dynamic-programming-advanced", "js-15-binary-search-dp"],
  ];
  for (const [id, slug, parentLessonId] of preserved) {
    const lesson = algorithmLessons.find((candidate) => candidate.id === id);
    assert.deepEqual([lesson?.slug, lesson?.parentLessonId], [slug, parentLessonId], id);
  }
});
