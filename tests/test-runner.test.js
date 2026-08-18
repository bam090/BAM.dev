import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findTestFiles } from "../scripts/run-tests.mjs";

test("테스트 탐색기는 운영체제 셸 glob 없이 중첩된 .test.js만 정렬한다", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "bam-test-runner-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const nested = join(directory, "nested");
  await mkdir(nested);
  await Promise.all([
    writeFile(join(directory, "z.test.js"), ""),
    writeFile(join(directory, "ignored.js"), ""),
    writeFile(join(nested, "a.test.js"), ""),
    writeFile(join(nested, "ignored.test.mjs"), ""),
  ]);

  const files = await findTestFiles(directory);

  assert.deepEqual(files, [join(nested, "a.test.js"), join(directory, "z.test.js")]);
});
