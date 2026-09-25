import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  JAVA_RUNTIME_LIMITS, compileTrustedQuestSource, getJavaQuestCapabilities,
} from "../desktop/runtime/supervisor.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "bam-java-quest-compile-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bundleRoot = path.join(root, "Resources");
  const workRoot = path.join(root, "work");
  const jdkHome = path.join(bundleRoot, "runtime", "jdk", "Contents", "Home");
  await mkdir(path.join(jdkHome, "bin"), { recursive: true });
  await mkdir(path.join(bundleRoot, "runtime", "java-runner"), { recursive: true });
  await mkdir(workRoot);
  for (const name of ["java", "javac"]) {
    const executable = path.join(jdkHome, "bin", name);
    await writeFile(executable, "fake executable");
    await chmod(executable, 0o755);
  }
  await writeFile(path.join(jdkHome, "release"), 'JAVA_VERSION="25.0.4.1"\nOS_ARCH="aarch64"\n');
  const sourcePath = path.join(workRoot, "JavaBamQuestRunner.java");
  await writeFile(sourcePath, "class BamQuestRunner {}\n");
  const sourceSha256 = createHash("sha256").update(await readFile(sourcePath)).digest("hex");
  return { root, bundleRoot, workRoot, sourcePath, sourceSha256, jdkHome };
}

const safeExecution = {
  exitCode: 0,
  terminationEvidence: {
    childCreated: true, pid: 1234, exitObserved: true, closeObserved: true, processGroupAbsent: true,
    processObserverCloseObserved: true, observerUnreaped: false, cleanupFailed: false,
  },
};

test("독립 회수 guard가 없으면 fake child조차 시작하지 않는다", async (t) => {
  const input = await fixture(t);
  let calls = 0;
  await assert.rejects(compileTrustedQuestSource(input, {
    executeProcess() { calls += 1; return safeExecution; },
  }), /독립 회수 guard/u);
  assert.equal(calls, 0);
});

test("고정 source 경로와 hash가 틀리면 reservation·fake child가 모두 0이다", async (t) => {
  const input = await fixture(t);
  let reservations = 0;
  let childCalls = 0;
  const executionGuard = {
    reserve() { reservations += 1; return {}; },
    finish() { return true; },
  };
  const executeProcess = () => { childCalls += 1; return safeExecution; };
  await assert.rejects(compileTrustedQuestSource({
    ...input, sourceSha256: "0".repeat(64), executionGuard,
  }, { executeProcess }), /예상 바이트/u);
  const alias = path.join(input.workRoot, "alias.java");
  await writeFile(alias, await readFile(input.sourcePath));
  await assert.rejects(compileTrustedQuestSource({
    ...input, sourcePath: alias, executionGuard,
  }, { executeProcess }), /예상 바이트/u);
  assert.equal(reservations, 0);
  assert.equal(childCalls, 0);
});

test("fake compile은 고정 profile·Java 25 argv·한도와 독립 회수 ACK를 요구한다", async (t) => {
  const input = await fixture(t);
  const events = [];
  const reservation = { attemptId: "a".repeat(64) };
  const executionGuard = {
    reserve(details) { events.push(["reserve", details]); return reservation; },
    recordSpawn(details) { events.push(["recordSpawn", details]); return true; },
    finish(details) { events.push(["finish", details]); return true; },
  };
  const result = await compileTrustedQuestSource({ ...input, executionGuard }, {
    async executeProcess(options) {
      events.push(["execute", options]);
      await options.onChildSpawn(1234);
      return safeExecution;
    },
  });
  const canonicalWork = await realpath(input.workRoot);
  const canonicalJdk = await realpath(input.jdkHome);
  const canonicalSource = await realpath(input.sourcePath);
  assert.deepEqual(events.map(([name]) => name), ["reserve", "execute", "recordSpawn", "finish"]);
  assert.deepEqual(events[0][1], {
    kind: "prepare-quest", workRoot: canonicalWork,
    executable: path.join(canonicalJdk, "bin", "javac"),
  });
  const options = events[1][1];
  assert.equal(options.profileName, "compile.sb");
  assert.equal(options.executable, path.join(canonicalJdk, "bin", "javac"));
  assert.equal(options.timeoutMs, JAVA_RUNTIME_LIMITS.compileTimeoutMs);
  assert.equal(options.rssLimitBytes, JAVA_RUNTIME_LIMITS.compileRssBytes);
  assert.equal(options.args[0], `-J-Dbam.owner.nonce=${reservation.attemptId}`);
  assert.deepEqual(options.args.slice(4, 11), [
    "--release", "25", "-encoding", "UTF-8", "-proc:none", "-implicit:none", "-classpath",
  ]);
  assert.equal(options.args.at(-1), canonicalSource);
  assert.equal(options.compileOutputPath, path.join(canonicalWork, "classes"));
  assert.deepEqual(events[2][1], { reservation, pid: 1234, pgid: 1234 });
  assert.equal(events[3][1].reservation, reservation);
  assert.equal(events[3][1].execution.terminationEvidence.pid, 1234);
  assert.equal(result.safe, true);
  assert.equal(result.sourceSha256, input.sourceSha256);
});

test("독립 회수 ACK 실패는 unsafe와 runtime poison으로 이어진다", async (t) => {
  const input = await fixture(t);
  const result = await compileTrustedQuestSource({
    ...input,
    executionGuard: { reserve() { return { attemptId: "b".repeat(64) }; },
      recordSpawn() { return true; }, finish() { return false; } },
  }, { async executeProcess(options) { await options.onChildSpawn(1234); return safeExecution; } });
  assert.equal(result.safe, false);
  assert.equal((await getJavaQuestCapabilities({ bundleRoot: input.bundleRoot })).available, false);
});

test("fake 프로세스 예외는 null 실행 증거로 guard 회수를 시도하고 poison한다", async (t) => {
  const input = await fixture(t);
  const finishCalls = [];
  const originalError = new Error("fake launch failed");
  await assert.rejects(compileTrustedQuestSource({
    ...input,
    executionGuard: {
      reserve() { return { attemptId: "c".repeat(64) }; },
      recordSpawn() { return true; },
      finish(details) { finishCalls.push(details); return false; },
    },
  }, { executeProcess() { throw originalError; } }), (error) => error === originalError);
  assert.deepEqual(finishCalls, [{ reservation: { attemptId: "c".repeat(64) }, execution: null }]);
  assert.equal((await getJavaQuestCapabilities({ bundleRoot: input.bundleRoot })).available, false);
});
