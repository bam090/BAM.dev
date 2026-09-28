import assert from "node:assert/strict";
import test from "node:test";

import {
  createTrustedJavaRunner, parseDevJavaArgs, readDevJavaPort, startDevJava,
} from "../scripts/dev-java.mjs";

test("Java 서버 CLI는 준비 경로 하나와 고정 단일 port만 받는다", () => {
  assert.deepEqual(parseDevJavaArgs(["--runtime", "준비 폴더"]), { runtimeRoot: "준비 폴더" });
  for (const args of [[], ["--runtime", "a", "--port", "1234"], ["--artifacts", "a"]]) {
    assert.throws(() => parseDevJavaArgs(args), /사용법/u);
  }
  assert.equal(readDevJavaPort(null), 4173);
  assert.equal(readDevJavaPort("65535"), 65535);
  for (const value of ["0", "65536", "-1", "4173abc", " 4173", "4173.0"]) {
    assert.throws(() => readDevJavaPort(value), /1~65535/u);
  }
});

test("검증된 컬렉션의 ID·revision·CT mode만 fake supervisor에 전달한다", async () => {
  const calls = [];
  const executionGuard = { reserve() {}, finish() {}, recordSpawn() {} };
  const questCollection = { quests: [{ id: "quest-1", revision: 2 }] };
  const codingTestCollection = { problems: [{ id: "problem-1", revision: 3 }] };
  const supervisor = {
    getJavaQuestCapabilities(value) { calls.push(["quest-capability", value]); return { available: false }; },
    getJavaCodingTestCapabilities(value) { calls.push(["ct-capability", value]); return { available: false }; },
    runJavaQuest(value, options) { calls.push(["quest-run", value, options]); return { outcome: "passed" }; },
    runJavaCodingTest(value, options) { calls.push(["ct-run", value, options]); return { outcome: "passed" }; },
  };
  const runner = createTrustedJavaRunner({ resourcesPath: "/fake/Resources", questCollection,
    codingTestCollection, supervisor, executionGuard });
  assert.equal(runner.validate("quest", { questId: "quest-1", revision: 2 }), true);
  assert.equal(runner.validate("quest", { questId: "quest-1", revision: 1 }), false);
  assert.equal(runner.validate("coding-test", { problemId: "problem-1", revision: 3,
    mode: "submit" }), true);
  assert.equal(runner.validate("coding-test", { problemId: "problem-1", revision: 3,
    mode: "hidden" }), false);
  assert.deepEqual(await runner.capabilities("quest"), { available: false });
  assert.deepEqual(await runner.capabilities("coding-test"), { available: false });
  const signal = new AbortController().signal;
  await runner.run("quest", { questId: "quest-1" }, { signal });
  await runner.run("coding-test", { problemId: "problem-1" }, { signal });
  assert.equal(calls.length, 4);
  assert.equal(calls[0][1].executionGuard, executionGuard);
  assert.equal(calls[1][1].trustedManifest, codingTestCollection);
  assert.equal(calls[2][2].signal, signal);
  assert.equal(calls[3][2].executionGuard, executionGuard);
});

test("감독 계약이 없으면 runner를 만들지 않고 잘못된 runtime은 listener 전에 거부한다", async () => {
  assert.throws(() => createTrustedJavaRunner({
    resourcesPath: "/fake", questCollection: { quests: [] }, codingTestCollection: { problems: [] },
    supervisor: {}, executionGuard: {},
  }), /독립 Java child 감독/u);
  await assert.rejects(startDevJava({ runtimeRoot: "/unavailable/bam-java-runtime" }),
    { code: "ENOENT" });
});
