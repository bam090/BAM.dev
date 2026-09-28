import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  stageDesktopRuntimeOnly,
  verifyRunnerProvenance,
} from "../scripts/desktop-build.mjs";

const RUNNER_CLASSES = [
  ["BamQuestRunner$ArrayInput.class", "nested-record-bytecode"],
  ["BamQuestRunner.class", "main-runner-bytecode"],
];
const RUNNER_SOURCE_SHA256 = createHash("sha256")
  .update(await readFile(new URL("../desktop/runtime/JavaBamQuestRunner.java", import.meta.url)))
  .digest("hex");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function bundledJavacProvenance() {
  return {
    kind: "bundled-javac",
    release: 25,
    javacSha256: "a".repeat(64),
  };
}

async function writeRunnerFixture(runnerPath, provenance = bundledJavacProvenance()) {
  await mkdir(runnerPath, { recursive: true });
  for (const [name, content] of RUNNER_CLASSES) {
    await writeFile(path.join(runnerPath, name), content);
  }
  const receipt = {
    schemaVersion: 1,
    sourceSha256: RUNNER_SOURCE_SHA256,
    classes: RUNNER_CLASSES.map(([name, content]) => ({ name, sha256: sha256(content) })),
    provenance,
  };
  const receiptPath = path.join(runnerPath, "runner-provenance.json");
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  return { receipt, receiptPath, runnerPath };
}

async function createRunnerFixture(provenance) {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "bam-runner-provenance-"));
  return {
    temporaryRoot,
    ...await writeRunnerFixture(path.join(temporaryRoot, "java-runner"), provenance),
  };
}

async function rewriteReceipt(fixture, mutate) {
  mutate(fixture.receipt);
  await writeFile(fixture.receiptPath, `${JSON.stringify(fixture.receipt, null, 2)}\n`);
}

test("현재 소스와 정확한 두 class의 bundled-javac receipt를 검증한다", async () => {
  const fixture = await createRunnerFixture();
  try {
    assert.deepEqual(await verifyRunnerProvenance(fixture.runnerPath), fixture.receipt);
  } finally {
    await rm(fixture.temporaryRoot, { recursive: true, force: true });
  }
});

test("verified-byte-reuse receipt는 검토 원본과 array PASS 증거를 명시한다", async () => {
  const evidenceRoot = await mkdtemp(path.join(tmpdir(), "bam-runner-reuse-evidence-"));
  const evidencePath = path.join(evidenceRoot, "array-pass-receipt.json");
  const evidence = "reviewed array PASS receipt\n";
  await writeFile(evidencePath, evidence);
  const provenance = {
    kind: "verified-byte-reuse",
    originalRunner: path.join(evidenceRoot, "reviewed-java-runner"),
    evidence: { path: evidencePath, sha256: sha256(evidence) },
    compilationPerformed: false,
  };
  const fixture = await createRunnerFixture(provenance);

  try {
    assert.deepEqual(await verifyRunnerProvenance(fixture.runnerPath), fixture.receipt);

    for (const mutate of [
      (value) => { delete value.evidence; },
      (value) => { value.evidence.path = "relative/array-pass-receipt.json"; },
      (value) => { value.evidence.sha256 = "A".repeat(64); },
      (value) => { value.originalRunner = "relative/java-runner"; },
      (value) => { value.compilationPerformed = true; },
    ]) {
      const invalid = await createRunnerFixture(structuredClone(provenance));
      try {
        await rewriteReceipt(invalid, (receipt) => mutate(receipt.provenance));
        await assert.rejects(verifyRunnerProvenance(invalid.runnerPath));
      } finally {
        await rm(invalid.temporaryRoot, { recursive: true, force: true });
      }
    }
  } finally {
    await Promise.all([
      rm(fixture.temporaryRoot, { recursive: true, force: true }),
      rm(evidenceRoot, { recursive: true, force: true }),
    ]);
  }
});

test("누락·stale·변조·추가·하위 경로의 runner 묶음을 거부한다", async () => {
  const cases = [
    async (fixture) => rm(fixture.receiptPath),
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.schemaVersion = 2;
    }),
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.sourceSha256 = "0".repeat(64);
    }),
    async (fixture) => rm(path.join(fixture.runnerPath, RUNNER_CLASSES[0][0])),
    async (fixture) => writeFile(path.join(fixture.runnerPath, RUNNER_CLASSES[1][0]), "modified"),
    async (fixture) => writeFile(path.join(fixture.runnerPath, "Unexpected.class"), "extra"),
    async (fixture) => mkdir(path.join(fixture.runnerPath, "nested")),
    async (fixture) => {
      const classPath = path.join(fixture.runnerPath, RUNNER_CLASSES[1][0]);
      const outsidePath = path.join(fixture.temporaryRoot, "outside.class");
      await Promise.all([rm(classPath), writeFile(outsidePath, "main-runner-bytecode")]);
      await symlink(outsidePath, classPath);
    },
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.classes = receipt.classes.slice(1);
    }),
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.provenance.kind = "unreviewed-copy";
    }),
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.provenance.release = 24;
    }),
    async (fixture) => rewriteReceipt(fixture, (receipt) => {
      receipt.provenance.javacSha256 = "not-a-sha256";
    }),
  ];

  for (const mutate of cases) {
    const fixture = await createRunnerFixture();
    try {
      await mutate(fixture);
      await assert.rejects(verifyRunnerProvenance(fixture.runnerPath));
    } finally {
      await rm(fixture.temporaryRoot, { recursive: true, force: true });
    }
  }
});

test("runtime-only staging은 stale runner를 출력 교체 전에 거부한다", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "bam-runner-staging-"));
  const sourceAppPath = path.join(temporaryRoot, "source", "BAM.dev.app");
  const outputRoot = path.join(temporaryRoot, "output");
  const outputAppPath = path.join(outputRoot, "BAM.dev.app");
  const runnerPath = path.join(sourceAppPath, "Contents", "Resources", "runtime", "java-runner");
  const sentinelPath = path.join(outputAppPath, "preserved-output");

  try {
    const fixture = await writeRunnerFixture(runnerPath);
    await rewriteReceipt(fixture, (receipt) => {
      receipt.sourceSha256 = "0".repeat(64);
    });
    await mkdir(outputAppPath, { recursive: true });
    await writeFile(sentinelPath, "keep\n");

    await assert.rejects(stageDesktopRuntimeOnly({ sourceAppPath, outputAppPath }));
    assert.equal(await readFile(sentinelPath, "utf8"), "keep\n");
    assert.equal(
      (await readdir(outputRoot)).some((name) => name.startsWith(".runtime-staging-")),
      false,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
