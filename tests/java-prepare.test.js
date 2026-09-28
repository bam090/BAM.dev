import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { assertSafeTree, verifyArchive } from "../scripts/desktop-build.mjs";
import { parseJavaPrepareArgs, prepareJavaRuntime,
  verifyPreparedJavaRuntime } from "../scripts/java-prepare.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "bam-java-prepare-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const artifacts = path.join(root, "artifacts");
  await mkdir(artifacts);
  return { root, artifacts };
}

test("준비 CLI는 두 경로를 각 한 번만 받는다", () => {
  assert.deepEqual(parseJavaPrepareArgs(["--runtime", "출력", "--artifacts", "자료"]), {
    artifactRoot: "자료", runtimeRoot: "출력",
  });
  for (const args of [[], ["--artifacts", "자료"], ["--runtime", "출력", "--runtime", "다른 출력"],
    ["--artifacts", "자료", "--unknown", "출력"]]) {
    assert.throws(() => parseJavaPrepareArgs(args), /--artifacts|사용법/u);
  }
});

test("기존 출력은 입력 자료 확인·child 호출 전에 거부하고 원문을 보존한다", async (t) => {
  const { root, artifacts } = await fixture(t);
  const destination = path.join(root, "prepared");
  await mkdir(destination);
  await writeFile(path.join(destination, "owner.txt"), "keep me");
  let childCalls = 0;
  const forbidden = () => { childCalls += 1; throw new Error("child must not run"); };
  await assert.rejects(prepareJavaRuntime({ artifactRoot: artifacts, runtimeRoot: destination }, {
    unpackJdk: forbidden, compileQuest: forbidden, compileCt: forbidden,
  }), /덮어쓰지 않습니다/u);
  assert.equal(await readFile(path.join(destination, "owner.txt"), "utf8"), "keep me");
  assert.equal(childCalls, 0);
  assert.deepEqual((await readdir(root)).sort(), ["artifacts", "prepared"]);
});

test("자료 내부 출력·자료와 겹치는 출력·공개 정적 경로를 거부한다", async (t) => {
  const { root, artifacts } = await fixture(t);
  await assert.rejects(prepareJavaRuntime({
    artifactRoot: artifacts, runtimeRoot: path.join(artifacts, "prepared"),
  }), /분리해야/u);
  await assert.rejects(prepareJavaRuntime({
    artifactRoot: artifacts, runtimeRoot: root,
  }), /분리해야/u);
  const sourcePath = fileURLToPath(new URL("../src/java-runtime-test", import.meta.url));
  await assert.rejects(prepareJavaRuntime({
    artifactRoot: artifacts, runtimeRoot: sourcePath,
  }), /정적 공개 경로/u);
});

test("잠긴 archive의 잘못된 hash는 staging·child 실행 전에 거부한다", async (t) => {
  const { root, artifacts } = await fixture(t);
  const lock = JSON.parse(await readFile(new URL("../desktop/runtime-lock.json", import.meta.url)));
  await writeFile(path.join(artifacts, lock.jdk.archive), "not a JDK");
  await writeFile(path.join(artifacts, lock.junit.artifact), "not JUnit");
  let childCalls = 0;
  const forbidden = () => { childCalls += 1; throw new Error("child must not run"); };
  await assert.rejects(prepareJavaRuntime({ artifactRoot: artifacts, runtimeRoot: path.join(root, "prepared") }, {
    unpackJdk: forbidden, compileQuest: forbidden, compileCt: forbidden,
  }), /SHA-256.*runtime lock/u);
  assert.equal(childCalls, 0);
  assert.deepEqual((await readdir(root)).sort(), ["artifacts"]);
  await assert.rejects(verifyArchive(path.join(artifacts, lock.jdk.archive), lock.jdk.sha256), /SHA-256/u);
});

test("경로 alias를 canonical로 확인하고 archive symlink는 읽기 전에 거부한다", async (t) => {
  const { root, artifacts } = await fixture(t);
  const alias = path.join(root, "alias");
  await symlink(artifacts, alias);
  await assert.rejects(prepareJavaRuntime({
    artifactRoot: artifacts, runtimeRoot: path.join(alias, "prepared"),
  }), /분리해야/u);

  const lock = JSON.parse(await readFile(new URL("../desktop/runtime-lock.json", import.meta.url)));
  const outside = path.join(root, "outside.txt");
  await writeFile(outside, "archive bytes");
  await symlink(outside, path.join(artifacts, lock.jdk.archive));
  await writeFile(path.join(artifacts, lock.junit.artifact), "JUnit bytes");
  await assert.rejects(prepareJavaRuntime({
    artifactRoot: artifacts, runtimeRoot: path.join(root, "prepared"),
  }), /일반 파일이 아닙니다/u);
  assert.deepEqual((await readdir(root)).sort(), ["alias", "artifacts", "outside.txt"]);
});

test("준비 검증은 symlink root·Resources 및 외부 symlink를 거부한다", async (t) => {
  const { root } = await fixture(t);
  const prepared = path.join(root, "prepared");
  const alias = path.join(root, "alias");
  await mkdir(prepared);
  await symlink(prepared, alias);
  await assert.rejects(verifyPreparedJavaRuntime(alias), /실제 디렉터리/u);

  const resourcesTarget = path.join(root, "resources-target");
  await mkdir(resourcesTarget);
  await symlink(resourcesTarget, path.join(prepared, "Resources"));
  await assert.rejects(verifyPreparedJavaRuntime(prepared), /symlink|실제 디렉터리/u);

  const tree = path.join(root, "tree");
  await mkdir(tree);
  await symlink("../resources-target", path.join(tree, "escape"));
  await assert.rejects(assertSafeTree(tree), /bundle 밖/u);
});
