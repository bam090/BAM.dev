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

test("알고리즘 교안의 모든 JavaScript 예제는 실제 런타임에서 실행된다", async () => {
  for (const lesson of algorithmLessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const codeBlocks = [...markdown.matchAll(/```javascript\n([\s\S]*?)```/g)].map(
      (match) => match[1],
    );

    assert.ok(codeBlocks.length > 0, `${lesson.id}: 실행할 JavaScript 예제가 필요합니다.`);

    for (const [index, source] of codeBlocks.entries()) {
      assert.doesNotThrow(
        () => runInNewContext(source, { console: { log() {} } }, { timeout: 1_000 }),
        `${lesson.id}: ${index + 1}번째 JavaScript 예제를 실행할 수 없습니다.`,
      );
    }
  }
});
