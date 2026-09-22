import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import os, { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  JAVA_RUNTIME_LIMITS,
  __test as supervisorTest,
  getJavaQuestCapabilities,
  runJavaQuest,
} from "../desktop/runtime/supervisor.mjs";
import { stageDesktopRuntimeOnly } from "../scripts/desktop-build.mjs";

const collection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);
const REPORT_OUTCOMES = [
  "passed",
  "wrong_answer",
  "syntax_error",
  "runtime_error",
  "timeout",
  "output_limit",
  "cancelled",
  "engine_error",
  "not_run",
];
const RUNNABLE_QUEST_IDS = new Set([
  "quest-java-total-price",
  "quest-java-bridge-arr-01",
  "quest-java-bridge-arr-02",
  "quest-java-bridge-que-01",
]);
const VALIDATED_KERNEL_RELEASE = "23.6.0";
const VALIDATED_KERNEL_VERSION = "Darwin Kernel Version 23.6.0: Wed Nov  5 21:50:27 PST 2025; root:xnu-10063.141.1.708.2~1/RELEASE_ARM64_T6020";

async function withKernelGetters(release, version, callback) {
  const originalRelease = os.release;
  const originalVersion = os.version;
  os.release = typeof release === "function" ? release : () => release;
  os.version = typeof version === "function" ? version : () => version;
  syncBuiltinESMExports();
  try {
    return await callback();
  } finally {
    os.release = originalRelease;
    os.version = originalVersion;
    syncBuiltinESMExports();
  }
}

function createRequest(requestId, quest) {
  return {
    requestId,
    questId: quest.id,
    questRevision: quest.revision,
    source: quest.starterCode,
  };
}

function frame(payload) {
  const body = Buffer.from(payload, "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length);
  return Buffer.concat([header, body]);
}

test("runtime-only staging은 분리 출력에 overlay하고 source와 기존 runtime을 보존한다", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "bam-runtime-only-test-"));
  const sourceAppPath = path.join(temporaryRoot, "source", "BAM.dev.app");
  const outputRoot = path.join(temporaryRoot, "output");
  const outputAppPath = path.join(outputRoot, "BAM.dev.app");
  const sourceRuntime = path.join(sourceAppPath, "Contents", "Resources", "runtime");
  const outputRuntime = path.join(outputAppPath, "Contents", "Resources", "runtime");
  const runnerClasses = [
    ["BamQuestRunner$ArrayInput.class", "fake nested class\n"],
    ["BamQuestRunner.class", "fake class\n"],
  ];
  const runnerSourceSha256 = createHash("sha256")
    .update(await readFile(new URL("../desktop/runtime/JavaBamQuestRunner.java", import.meta.url)))
    .digest("hex");

  try {
    await Promise.all([
      mkdir(path.join(sourceRuntime, "profiles"), { recursive: true }),
      mkdir(path.join(sourceRuntime, "jdk", "Contents", "Home", "bin"), { recursive: true }),
      mkdir(path.join(sourceRuntime, "java-runner"), { recursive: true }),
      mkdir(outputAppPath, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(path.join(sourceRuntime, "supervisor.mjs"), "source supervisor\n"),
      writeFile(path.join(sourceRuntime, "profiles", "compile.sb"), "source profile\n"),
      writeFile(path.join(sourceRuntime, "jdk", "Contents", "Home", "bin", "java"), "fake java\n"),
      ...runnerClasses.map(([name, content]) => (
        writeFile(path.join(sourceRuntime, "java-runner", name), content)
      )),
      writeFile(path.join(sourceRuntime, "java-runner", "runner-provenance.json"), `${JSON.stringify({
        schemaVersion: 1,
        sourceSha256: runnerSourceSha256,
        classes: runnerClasses.map(([name, content]) => ({
          name,
          sha256: createHash("sha256").update(content).digest("hex"),
        })),
        provenance: {
          kind: "bundled-javac",
          release: 25,
          javacSha256: "a".repeat(64),
        },
      }, null, 2)}\n`),
      writeFile(path.join(outputAppPath, "stale-output"), "stale\n"),
    ]);

    await assert.rejects(
      stageDesktopRuntimeOnly({ sourceAppPath, outputAppPath: sourceAppPath }),
      /서로 분리된 경로/u,
    );
    await assert.rejects(
      stageDesktopRuntimeOnly({
        sourceAppPath,
        outputAppPath: path.join(sourceAppPath, "nested", "BAM.dev.app"),
      }),
      /서로 분리된 경로/u,
    );
    await assert.rejects(
      stageDesktopRuntimeOnly({
        sourceAppPath,
        outputAppPath: path.dirname(sourceAppPath),
      }),
      /서로 분리된 경로/u,
    );

    const staged = await stageDesktopRuntimeOnly({ sourceAppPath, outputAppPath });
    assert.equal(staged.appPath, outputAppPath);
    assert.equal(staged.sourceAppPath, sourceAppPath);
    assert.equal(await readFile(path.join(sourceRuntime, "supervisor.mjs"), "utf8"), "source supervisor\n");
    assert.equal(await readFile(path.join(sourceRuntime, "profiles", "compile.sb"), "utf8"), "source profile\n");
    assert.equal(
      await readFile(path.join(outputRuntime, "supervisor.mjs"), "utf8"),
      await readFile(new URL("../desktop/runtime/supervisor.mjs", import.meta.url), "utf8"),
    );
    assert.equal(
      await readFile(path.join(outputRuntime, "profiles", "compile.sb"), "utf8"),
      await readFile(new URL("../desktop/runtime/profiles/compile.sb", import.meta.url), "utf8"),
    );
    assert.equal(
      await readFile(path.join(outputRuntime, "jdk", "Contents", "Home", "bin", "java"), "utf8"),
      "fake java\n",
    );
    assert.equal(
      await readFile(path.join(outputRuntime, "java-runner", "BamQuestRunner.class"), "utf8"),
      "fake class\n",
    );
    assert.equal(
      await readFile(path.join(outputAppPath, "stale-output"), "utf8").catch(() => null),
      null,
    );
    assert.equal(
      (await readdir(outputRoot)).some((name) => name.startsWith(".runtime-staging-")),
      false,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("배열 codec은 big-endian 입력과 signature별 엄격한 출력 frame을 고정한다", () => {
  const encoded = supervisorTest.encodeArrayInput(
    "int-array-int-int-to-int-array",
    [[1, -2], 2, 1000],
  );
  assert.equal(encoded.toString("hex"), "0000000200000001fffffffe00000002000003e8");
  assert.equal(
    supervisorTest.encodeArrayInput("int-array-to-int-array", [Array(100000).fill(0)]).byteLength,
    400004,
  );
  assert.equal(JAVA_RUNTIME_LIMITS.maxArrayInputBytes, 400012);
  assert.equal(JAVA_RUNTIME_LIMITS.maxArrayLength, 100000);
  assert.equal(JAVA_RUNTIME_LIMITS.maxArrayProtocolBytes, 2 * 1024 * 1024);
  assert.throws(
    () => supervisorTest.encodeArrayInput("int-array-to-int-array", [[1.5]]),
    /int 범위/,
  );
  assert.throws(
    () => supervisorTest.encodeArrayInput("int-array-int-int-to-int-array", [[1], 2, 0]),
    /위치 또는 수정값 범위/,
  );
  assert.throws(
    () => supervisorTest.encodeArrayInput("int-array-to-int-array", [Array(100001).fill(0)]),
    /배열 길이/,
  );

  assert.deepEqual(supervisorTest.parseProtocol(frame("returned\n9223372036854775807")), {
    status: "returned",
    actual: "9223372036854775807",
  });
  assert.deepEqual(
    supervisorTest.parseProtocol(frame("returned_int\n-2147483648"), "int-array-int-int-to-int"),
    { status: "returned_int", actual: -2147483648 },
  );
  assert.deepEqual(
    supervisorTest.parseProtocol(
      frame("returned_int_array\n1,-2\ntrue\nfalse"),
      "int-array-to-int-array",
    ),
    {
      status: "returned_int_array",
      actual: [1, -2],
      observations: { argument0Unchanged: true, returnNotArgument0: false },
    },
  );

  const largeArrayFrame = frame(`returned_int_array\n${Array(3000).fill(0).join(",")}\ntrue\ntrue`);
  assert.throws(() => supervisorTest.parseProtocol(largeArrayFrame), /프레임 길이/);
  assert.equal(
    supervisorTest.parseProtocol(largeArrayFrame, "int-array-to-int-array").actual.length,
    3000,
  );
  assert.throws(
    () => supervisorTest.parseProtocol(Buffer.concat([frame("returned\n0"), Buffer.from([0])])),
    /프레임 길이/,
  );
  assert.throws(
    () => supervisorTest.parseProtocol(frame("returned_int\n01"), "int-array-int-int-to-int"),
    /정규 10진수/,
  );
  assert.throws(
    () => supervisorTest.parseProtocol(
      frame("returned_int_array\n1\nTRUE\ntrue"),
      "int-array-to-int-array",
    ),
    /record 값/,
  );
  const oversizedHeader = Buffer.alloc(4);
  oversizedHeader.writeUInt32BE(JAVA_RUNTIME_LIMITS.maxArrayProtocolBytes + 1);
  assert.throws(
    () => supervisorTest.parseProtocol(oversizedHeader, "int-array-to-int-array"),
    /프레임 길이/,
  );
});

test("heap OOME가 stdout에 기록되고 JVM이 exit 3이면 메모리 제한 원인을 안내한다", () => {
  const result = supervisorTest.runtimeTestResult(
    { id: "runtime-heap-oome", label: "runtime-heap-oome", expected: "3" },
    {
      exitCode: 3,
      terminationReason: null,
      startError: null,
      stdout: "MODE_HEAP_STARTED\nTerminating due to java.lang.OutOfMemoryError: Java heap space\n",
      stderr: "",
      protocolOutput: Buffer.alloc(0),
      durationMs: 91.9,
    },
    null,
  );

  assert.equal(result.outcome, "runtime_error");
  assert.equal(result.error.type, "runtime_error");
  assert.match(result.error.message, /메모리 제한/u);
});

test("검증 커널 지문만 capability와 Java 실행을 열고 나머지는 spawn 전에 닫는다", async () => {
  assert.equal(supervisorTest.matchesValidatedKernel(
    VALIDATED_KERNEL_RELEASE,
    VALIDATED_KERNEL_VERSION,
  ), true);
  assert.equal(supervisorTest.matchesValidatedKernel("23.6.1", VALIDATED_KERNEL_VERSION), false);
  assert.equal(supervisorTest.matchesValidatedKernel(VALIDATED_KERNEL_RELEASE, `${VALIDATED_KERNEL_VERSION} changed`), false);
  assert.equal(supervisorTest.matchesValidatedKernel(undefined, undefined), false);

  const assertPublicGuard = async () => {
    const capability = await getJavaQuestCapabilities({ bundleRoot: "/must-not-be-read" });
    assert.deepEqual(capability, {
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: false,
      reason: "검증된 Java 실행 환경과 일치하지 않습니다.",
    });

    const runnableQuests = collection.quests.filter((candidate) =>
      RUNNABLE_QUEST_IDS.has(candidate.id));
    assert.equal(runnableQuests.length, 4);
    for (const candidate of runnableQuests) {
      const request = createRequest(`java-kernel-guard-${candidate.order}`, candidate);
      const report = await runJavaQuest(
        {
          requestId: request.requestId,
          questId: request.questId,
          revision: request.questRevision,
          source: request.source,
        },
        {
          bundleRoot: "/must-not-be-read",
          trustedManifest: collection,
        },
      );

      assert.equal(report.outcome, "engine_error", candidate.id);
      assert.equal(report.error.type, "java_engine_error", candidate.id);
      assert.equal(report.error.message, "검증된 Java 실행 환경과 일치하지 않습니다.", candidate.id);
      assert.equal(report.summary.outcome, "not_run", candidate.id);
      assert.equal(report.summary.total, candidate.publicTests.length, candidate.id);
      assert.equal(report.summary.not_run, candidate.publicTests.length, candidate.id);
      assert.equal(report.summary.observationFailures, 0, candidate.id);
      assert.deepEqual(
        Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, report.summary[outcome]])),
        Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, outcome === "not_run" ? 6 : 0])),
        candidate.id,
      );
      assert.deepEqual(
        report.tests.map(({ outcome }) => outcome),
        Array(candidate.publicTests.length).fill("not_run"),
        candidate.id,
      );
      const observed = candidate.id === "quest-java-bridge-arr-01"
        || candidate.id === "quest-java-bridge-que-01";
      assert.equal(
        report.tests.every((result) => Object.hasOwn(result, "expectedObservations")),
        observed,
        candidate.id,
      );
    }
  };

  await withKernelGetters("23.6.1", VALIDATED_KERNEL_VERSION, assertPublicGuard);
  await withKernelGetters(VALIDATED_KERNEL_RELEASE, () => {
    throw new Error("fake kernel version query failure");
  }, assertPublicGuard);
});
