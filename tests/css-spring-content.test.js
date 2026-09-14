import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("명시 직접답을 쓰는 새 저작도 목표 누락과 직접답 누락·빈 답·중복 답을 거부한다", async (t) => {
  const directory = await realpath(await mkdtemp(path.join(tmpdir(), "bam-spring-answer-")));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
  const lesson = curriculum.lessons.find((item) => item.id === "spring-framework-boot");
  assert.ok(lesson && !lesson.source.originalPath);
  const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
  const fixtureCurriculum = {
    ...curriculum,
    categories: curriculum.categories.filter((item) => item.id === "spring"),
    courses: curriculum.courses.filter((item) => item.id === "spring"),
    languages: curriculum.languages.filter((item) => item.id === "java"),
    lessons: [lesson],
  };
  // 본문 검증이 실패하는 작은 복제본에서만 변형하고 실제 교안은 보존한다.
  for (const name of ["scripts", "content/schema", "content/lessons/spring"]) await mkdir(path.join(directory, name), { recursive: true });
  await cp(new URL("../src", import.meta.url), path.join(directory, "src"), { recursive: true });
  await cp(new URL("../scripts/validate-content.mjs", import.meta.url), path.join(directory, "scripts/validate-content.mjs"));
  await cp(new URL("../content/schema/curriculum.schema.json", import.meta.url), path.join(directory, "content/schema/curriculum.schema.json"));
  await writeFile(path.join(directory, "package.json"), '{"type":"module"}');
  await writeFile(path.join(directory, "content/curriculum.json"), JSON.stringify(fixtureCurriculum));
  for (const [name, body, expected] of [
    ["목표 누락", markdown.replace(/^## 학습 목표\n[\s\S]*?(?=^## )/m, ""), /학습 목표 섹션이 없습니다/],
    ["직접답 누락", markdown.replace(/^## 핵심 질문 답\n[\s\S]*$/m, ""), /answerHeading.*정확히 하나/],
    ["빈 직접답", markdown.replace(/(^## 핵심 질문 답\n)[\s\S]*$/m, "$1"), /answerHeading.*정확히 하나/],
    ["중복 직접답", `${markdown}\n\n## 핵심 질문 답\n\n중복 답입니다.`, /answerHeading.*정확히 하나/],
  ]) {
    await writeFile(path.join(directory, lesson.contentFile), body);
    await assert.rejects(execFileAsync(process.execPath, [path.join(directory, "scripts/validate-content.mjs")]), (error) => {
      assert.ok(error.stderr.includes(`${lesson.id}:`), name);
      assert.match(error.stderr, expected, name);
      assert.doesNotMatch(error.stderr, /확인 문제 섹션이 없습니다|면접 답변 예시 섹션/);
      return true;
    });
  }
});
