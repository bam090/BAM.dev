import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const algorithmLessons = curriculum.lessons
  .filter((lesson) => lesson.courseId === "algorithm")
  .sort((left, right) => left.order - right.order);

const expectedLessons = [
  ["js-10-stack-queue", "stack-and-queue.md"],
  ["js-08-implementation-simulation", "implementation-and-string-simulation.md"],
  ["js-09-hash-map-set", "hash-map-set.md"],
  ["js-11-sorting-window", "sorting-two-pointers-sliding-window.md"],
  ["js-12-brute-force-backtracking", "brute-force-backtracking-recursion.md"],
  ["algo-06-number-theory-geometry", "number-theory-and-geometry.md"],
  ["js-15-binary-search-dp", "binary-search-and-dynamic-programming.md"],
  ["js-13-bfs-dfs", "bfs-dfs-graph-grid.md"],
  ["algo-09-tree", "tree-basics.md"],
  ["js-14-heap-greedy", "heap-and-greedy.md"],
  ["algo-11-dynamic-programming-advanced", "dynamic-programming-advanced.md"],
  ["algo-12-dijkstra", "weighted-graphs-dijkstra.md"],
];

const expectedNewLessonOutputs = new Map([
  ["algo-06-number-theory-geometry", ["6", '"반시계"']],
  [
    "algo-09-tree",
    ['["A","B","D","E","C"]', '["A","B","C","D","E"]'],
  ],
  [
    "algo-11-dynamic-programming-advanced",
    [
      "7",
      "[[0,0],[1,0],[1,1],[2,1],[2,2]]",
      "[[1,5,7],[3,4,9],[6,6,7]]",
      "7",
    ],
  ],
  ["algo-12-dijkstra", ["[[1,7],[2,2]]", "[0,4,2,5]"]],
]);

function conceptIdsFrom(text) {
  return [...text.matchAll(/`([a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+)`/g)].map(
    (match) => match[1],
  );
}

function javascriptBlocksFrom(markdown) {
  return [...markdown.matchAll(/```javascript\n([\s\S]*?)```/g)].map((match) => match[1]);
}

function execute(source) {
  const output = [];
  const context = {
    console: {
      log(...values) {
        output.push(values.map((value) => JSON.stringify(value)).join(" "));
      },
    },
  };

  runInNewContext(source, context, { timeout: 1_000 });
  return { context, output };
}

test("알고리즘 과정은 안정 ID를 유지한 12개 단원을 선수 순서대로 제공한다", () => {
  assert.deepEqual(
    algorithmLessons.map((lesson) => [lesson.id, lesson.contentFile.split("/").at(-1)]),
    expectedLessons,
  );
  assert.deepEqual(
    algorithmLessons.map((lesson) => lesson.order),
    Array.from({ length: 12 }, (_, index) => index + 1),
  );
  assert.ok(
    algorithmLessons.every(
      (lesson) =>
        lesson.languageId === "javascript" &&
        lesson.contentFile.startsWith("content/lessons/algorithm/"),
    ),
  );

  const orderById = new Map(algorithmLessons.map((lesson) => [lesson.id, lesson.order]));
  assert.ok(orderById.get("js-08-implementation-simulation") < orderById.get("js-11-sorting-window"));
  assert.ok(orderById.get("js-11-sorting-window") < orderById.get("js-14-heap-greedy"));
  assert.ok(orderById.get("algo-09-tree") < orderById.get("js-14-heap-greedy"));
});

test("알고리즘 교안의 제목·학습 목표·개념 연결은 curriculum과 일치한다", async () => {
  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    assert.ok(
      markdown.startsWith(`# ${String(lesson.order).padStart(2, "0")}. ${lesson.title}\n`),
      `${lesson.id}: 제목과 단원 번호가 curriculum과 다릅니다.`,
    );

    const objectiveSection = markdown.match(/\n## 학습 목표\n([\s\S]*?)(?=\n## |$)/);
    const objectives = objectiveSection?.[1]
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2));
    assert.deepEqual(objectives, lesson.objectives, `${lesson.id}: 학습 목표가 다릅니다.`);

    const connection = markdown.match(/\n## 개념 연결\n([\s\S]*?)(?=\n## |$)/);
    assert.ok(connection, `${lesson.id}: 개념 연결 섹션이 필요합니다.`);

    const prerequisiteLine = connection[1].match(/^- 선행:\s*(.+)$/m);
    const currentLine = connection[1].match(/^- 이 단원:\s*(.+)$/m);
    const followupLine = connection[1].match(/^- 후속:\s*(.+)$/m);
    assert.ok(prerequisiteLine, `${lesson.id}: 선행 conceptId가 필요합니다.`);
    assert.ok(currentLine, `${lesson.id}: 현재 conceptId가 필요합니다.`);
    assert.ok(followupLine, `${lesson.id}: 후속 안내가 필요합니다.`);

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
      algorithmLessons
        .filter((candidate) => candidate.order > lesson.order)
        .flatMap((candidate) => candidate.conceptIds),
    );

    assert.deepEqual(conceptIdsFrom(currentLine[1]), lesson.conceptIds);
    assert.ok(
      conceptIdsFrom(prerequisiteLine[1]).every((conceptId) => previousIds.has(conceptId)),
      `${lesson.id}: 앞 단원에 없는 선행 conceptId가 있습니다.`,
    );

    if (lesson.order === 12) {
      assert.deepEqual(conceptIdsFrom(followupLine[1]), []);
      assert.match(followupLine[1], /마지막 단원/);
    } else {
      assert.ok(
        conceptIdsFrom(followupLine[1]).every((conceptId) => laterIds.has(conceptId)),
        `${lesson.id}: 뒤 단원에 없는 후속 conceptId가 있습니다.`,
      );
    }
  }
});

test("알고리즘 교안의 JavaScript 코드 블록 39개는 독립 실행된다", async () => {
  let blockCount = 0;

  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const blocks = javascriptBlocksFrom(markdown);
    assert.ok(blocks.length > 0, `${lesson.id}: 실행할 JavaScript 예제가 필요합니다.`);

    for (const [index, source] of blocks.entries()) {
      assert.doesNotThrow(
        () => execute(source),
        `${lesson.id}: ${index + 1}번째 JavaScript 예제를 실행할 수 없습니다.`,
      );
    }

    blockCount += blocks.length;
  }

  assert.equal(blockCount, 39);
});

test("신규 4개 알고리즘 교안 예제는 문서에 설명된 출력을 만든다", async () => {
  for (const [lessonId, expected] of expectedNewLessonOutputs) {
    const lesson = algorithmLessons.find((candidate) => candidate.id === lessonId);
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const actual = javascriptBlocksFrom(markdown).flatMap((source) => execute(source).output);
    assert.deepEqual(actual, expected, lessonId);
  }
});

test("구현·시뮬레이션 예제는 명령 공백과 잘못된 입력 경계를 검증한다", async () => {
  const markdown = await readFile(
    new URL("../content/lessons/algorithm/implementation-and-string-simulation.md", import.meta.url),
    "utf8",
  );
  const source = javascriptBlocksFrom(markdown).find((block) =>
    block.includes("function simulateRobot"),
  );
  const { context } = execute(source);

  assert.deepEqual(
    JSON.parse(JSON.stringify(context.simulateRobot("  R\t2, L   1  ", 0, 8))),
    { position: 1, visited: [0, 2, 1] },
  );

  for (const [command, message] of [
    ["R", /방향과 거리 두 값/],
    ["R 1 extra", /방향과 거리 두 값/],
    ["X 1", /방향은 R 또는 L/],
    ["R nope", /0 이상의 유한한 숫자/],
    ["R Infinity", /0 이상의 유한한 숫자/],
    ["R -1", /0 이상의 유한한 숫자/],
  ]) {
    assert.throws(() => context.simulateRobot(command, 0, 8), message, command);
  }
});

test("정확성 감사에서 확인된 복잡도와 다익스트라 입력 경계를 고정한다", async () => {
  const [numberTheory, tree, dijkstra] = await Promise.all([
    readFile(new URL("../content/lessons/algorithm/number-theory-and-geometry.md", import.meta.url), "utf8"),
    readFile(new URL("../content/lessons/algorithm/tree-basics.md", import.meta.url), "utf8"),
    readFile(new URL("../content/lessons/algorithm/weighted-graphs-dijkstra.md", import.meta.url), "utf8"),
  ]);

  assert.match(numberTheory, /유클리드 알고리즘의 반복 횟수는 `O\(log m\)`/);
  assert.match(numberTheory, /방향 판별은 `O\(1\)` 시간과 `O\(1\)` 추가 공간/);
  assert.match(tree, /큐 배열의 추가 공간은 `O\(n\)`/);
  assert.match(tree, /호출 스택 한도/);
  assert.match(dijkstra, /`O\(\(V \+ E\) log\(V \+ E \+ 1\)\)`/);
  assert.match(dijkstra, /간선이 없는 `E = 0`/);
  assert.match(dijkstra, /누적 경로 비용도 필요한 정밀도와 유한 범위/);

  const dijkstraSource = javascriptBlocksFrom(dijkstra).find((source) =>
    source.includes("function dijkstra"),
  );
  const { context } = execute(dijkstraSource);
  assert.deepEqual(Array.from(context.dijkstra([[]], 0)), [0]);
  assert.throws(() => context.dijkstra([], 0), /정점이 하나 이상/);
  assert.throws(() => context.dijkstra([[]], 1), /시작 정점이 그래프 범위/);
  assert.throws(() => context.dijkstra([[[1, 1]]], 0), /도착 정점이 그래프 범위/);
});
