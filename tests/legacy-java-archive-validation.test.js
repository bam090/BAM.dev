import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { isLegacyJavaArchiveWithoutInterviewAnswers } from "../scripts/validate-content.mjs";

const execFileAsync = promisify(execFile);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const legacyLessonIds = [
  "java-02-control-flow-arrays",
  "java-03-classes-objects",
  "java-04-collections-generics",
  "java-05-exceptions-debugging",
  "java-06-review-practice",
];

function getLesson(id) {
  const lesson = curriculum.lessons.find((candidate) => candidate.id === id);
  assert.ok(lesson, `${id}: curriculum 항목이 없습니다.`);
  return lesson;
}

async function readLesson(lesson) {
  return readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
}

test("복원한 Java 02~06 원문만 면접 답변 예시 요구에서 제외한다", async () => {
  for (const id of legacyLessonIds) {
    const lesson = getLesson(id);
    const markdown = await readLesson(lesson);

    assert.equal(lesson.archivedFromCatalog, true, id);
    assert.doesNotMatch(markdown, /^## 면접 답변 예시$/mu, id);
    assert.equal(isLegacyJavaArchiveWithoutInterviewAnswers(lesson, markdown), true, id);
  }
});

test("보관 상태·ID·경로·원문 중 하나라도 달라지면 제외하지 않는다", async () => {
  const lesson = getLesson(legacyLessonIds[0]);
  const markdown = await readLesson(lesson);
  const rejectedCases = [
    ["활성 교안", { ...lesson, archivedFromCatalog: false }, markdown],
    ["등록되지 않은 ID", { ...lesson, id: "java-unknown-archive" }, markdown],
    [
      "다른 콘텐츠 경로",
      { ...lesson, contentFile: "content/lessons/java/review-problem-solving-and-testing.md" },
      markdown,
    ],
    ["변조된 원문", lesson, `${markdown}\n`],
  ];

  for (const [label, candidate, candidateMarkdown] of rejectedCases) {
    assert.equal(
      isLegacyJavaArchiveWithoutInterviewAnswers(candidate, candidateMarkdown),
      false,
      label,
    );
  }
});

test("현재 활성 교안은 기존 면접 답변 예시 gate를 유지한다", async () => {
  const lesson = getLesson("js-01-runtime");
  const markdown = await readLesson(lesson);

  assert.equal(Boolean(lesson.archivedFromCatalog), false);
  assert.match(markdown, /^## 면접 답변 예시$/mu);
  assert.equal(isLegacyJavaArchiveWithoutInterviewAnswers(lesson, markdown), false);
});

test("현재 전체 콘텐츠 gate는 원문 보관 예외와 함께 통과한다", async () => {
  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));
  const { stdout } = await execFileAsync(process.execPath, [validatorPath]);

  assert.match(stdout, /콘텐츠 검증 완료/);
});
