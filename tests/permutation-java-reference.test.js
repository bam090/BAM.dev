import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createPermutationTrace,
  movePermutationCursor,
  PERMUTATION_JAVA_LINES,
} from "../src/core/permutation-trace.js";

// Explicit development verification only. Ordinary npm test requires no system Java.
// Run: BAM_VERIFY_PERMUTATION_JAVA=1 node --test tests/permutation-java-reference.test.js
// Compile with Java 17 language/bytecode targets; execution uses the selected system JVM.
// This does not verify Java 17 API availability (--release 17 requires absent ct.sym here).
// No product runner, arbitrary source input, or system-JDK fallback is added.
const enabled = process.env.BAM_VERIFY_PERMUTATION_JAVA === "1";

function instrumentDisplayedJava(lines) {
  // Pin each observation to its original source line. Unexpected source edits must be reviewed,
  // not silently accepted by an instrumentation rule intended for another program.
  const hooks = new Map([
    [8, ["permute(0);", 'TraceProbe.emit("start", 8); TraceProbe.call(0, 8); permute(0); TraceProbe.returned(); TraceProbe.emit("complete", 8);']],
    [10, ["static void permute(int depth) {", 'static void permute(int depth) { TraceProbe.enter(depth, 10);']],
    [11, ["if (depth == nums.length) {", 'if (TraceProbe.condition(depth == nums.length, 11)) {']],
    [12, ["results.add(new ArrayList<>(path));", 'results.add(new ArrayList<>(path)); TraceProbe.emit("copy", 12);']],
    [13, ["return;", "TraceProbe.prepareReturn(13); return;"]],
    [15, ["for (int i = 0; i < nums.length; i++) {", "for (int i = 0; TraceProbe.loop(i, i < nums.length, 15); i++) {"]],
    [16, ["if (used[i]) continue;", "if (TraceProbe.used(used[i], 16)) continue;"]],
    [17, ["used[i] = true;", 'used[i] = true; TraceProbe.emit("mark", 17);']],
    [18, ["path.add(nums[i]);", 'path.add(nums[i]); TraceProbe.emit("choose", 18);']],
    [19, ["permute(depth + 1);", "TraceProbe.call(depth + 1, 19); permute(depth + 1); TraceProbe.returned();"]],
    [20, ["path.remove(path.size() - 1);", 'path.remove(path.size() - 1); TraceProbe.emit("remove", 20);']],
    [21, ["used[i] = false;", 'used[i] = false; TraceProbe.emit("unmark", 21);']],
    [23, ["}", "TraceProbe.prepareReturn(23); }"]],
  ]);
  assert.equal(lines.length, 24, "Source edits require observation-boundary review");
  return lines.map((line, index) => {
    const hook = hooks.get(index + 1);
    if (!hook) return line;
    const [expected, instrumented] = hook;
    assert.equal(line.trim(), expected, `Displayed Java source line ${index + 1}`);
    return instrumented;
  }).join("\n");
}

function semanticSnapshot(snapshot) {
  const { description: _learnerExplanation, ...values } = snapshot;
  return values;
}

test("표시된 Java 원문 실행과 계산된 trace의 전체 관찰 상태를 독립 대조한다", {
  skip: enabled ? false : "별도 개발 검증: BAM_VERIFY_PERMUTATION_JAVA=1로 실행",
}, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "bam-permutation-reference-"));
  try {
    const probe = await readFile(new URL("./fixtures/permutation-trace/TraceProbe.java", import.meta.url), "utf8");
    await writeFile(join(directory, "Main.java"), instrumentDisplayedJava(PERMUTATION_JAVA_LINES));
    await writeFile(join(directory, "TraceProbe.java"), probe);
    const run = (args) => execFileSync("java", args, {
      cwd: directory, encoding: "utf8", timeout: 15_000, maxBuffer: 2 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    t.diagnostic(`Compiler: ${run(["-m", "jdk.compiler/com.sun.tools.javac.Main", "-version"]).trim()}`);
    t.diagnostic(`Runtime: ${run(["--version"]).trim()}`);
    t.diagnostic("Compatibility: -source 17 -target 17; Java 17 API/runtime compatibility is not verified.");
    run(["-m", "jdk.compiler/com.sun.tools.javac.Main", "-source", "17", "-target", "17", "-d", directory, "Main.java", "TraceProbe.java"]);
    const classBytes = await readFile(join(directory, "Main.class"));
    assert.equal(classBytes.readUInt16BE(6), 61, "Java 17 class-file major version");
    const javaTrace = run(["-cp", directory, "Main"]).trim().split("\n").map((line) => JSON.parse(line));
    const replay = createPermutationTrace();

    await t.test("202개 관찰의 행·실행 프레임·모든 지역 i·공유값·결과가 실제 Java 값과 같다", () => {
      assert.equal(javaTrace.length, 202);
      assert.equal(replay.length, javaTrace.length);
      for (let index = 0; index < javaTrace.length; index += 1) {
        assert.deepEqual(semanticSnapshot(replay[index]), javaTrace[index], `Java observation ${index}`);
      }
      assert.deepEqual(javaTrace.at(-1).answers, [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]);
    });

    await t.test("실제 Java return은 배열을 그대로 두고 다음 remove만 path를 줄인다", () => {
      assert.equal(javaTrace[31].event, "copy");
      assert.equal(javaTrace[32].event, "return");
      assert.equal(javaTrace[33].event, "remove");
      assert.equal(javaTrace[34].event, "unmark");
      for (const index of [31, 32]) assert.deepEqual(javaTrace[index].path, [1, 2, 3]);
      for (const index of [33, 34]) assert.deepEqual(javaTrace[index].path, [1, 2]);
      for (const index of [31, 32, 33]) assert.deepEqual(javaTrace[index].used, [true, true, true]);
      assert.deepEqual(javaTrace[34].used, [true, true, false]);
      for (const index of [31, 32, 33, 34]) assert.deepEqual(javaTrace[index].answers, [[1, 2, 3]]);
      assert.equal(javaTrace[32].frames.at(-1).i, 2);
    });

    await t.test("앞뒤 재생과 초기화는 Java 관찰값과 일치하며 기존 snapshot을 바꾸지 않는다", () => {
      const before = structuredClone(replay);
      let cursor = 0;
      for (let index = 1; index < javaTrace.length; index += 1) {
        cursor = movePermutationCursor(cursor, 1, replay.length);
        assert.deepEqual(semanticSnapshot(replay[cursor]), javaTrace[index]);
      }
      for (let index = javaTrace.length - 2; index >= 0; index -= 1) {
        cursor = movePermutationCursor(cursor, -1, replay.length);
        assert.deepEqual(semanticSnapshot(replay[cursor]), javaTrace[index]);
      }
      cursor = 0;
      assert.deepEqual(semanticSnapshot(replay[cursor]), javaTrace[0]);
      assert.deepEqual(replay, before);
      assert.deepEqual(createPermutationTrace(), before);
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
