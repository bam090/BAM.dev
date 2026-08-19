import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import {
  LOCAL_JAVA_DOCKER_IMAGE,
  LocalJavaGrader,
} from "../scripts/java-grader/index.mjs";

const execFileAsync = promisify(execFile);
const dockerExecutableCandidates = process.platform === "linux"
  ? ["/usr/bin/docker", "/usr/local/bin/docker"]
  : ["/usr/local/bin/docker", "/opt/homebrew/bin/docker", "/usr/bin/docker"];
const dockerExecutable = process.env.BAM_JAVA_DOCKER_EXECUTABLE ??
  dockerExecutableCandidates.find((candidate) => existsSync(candidate)) ??
  dockerExecutableCandidates[0];
const dockerSocketCandidates = [
  ...(process.platform === "darwin"
    ? [path.join(homedir(), ".docker", "run", "docker.sock")]
    : []),
  ...(path.isAbsolute(process.env.XDG_RUNTIME_DIR ?? "")
    ? [path.join(process.env.XDG_RUNTIME_DIR, "docker.sock")]
    : []),
  "/var/run/docker.sock",
];
const dockerSocket = process.env.BAM_JAVA_DOCKER_SOCKET ??
  dockerSocketCandidates.find((candidate) => existsSync(candidate)) ??
  dockerSocketCandidates.at(-1);
const dockerGlobalArguments = [
  `--host=unix://${dockerSocket}`,
  "--config=/var/empty",
];
const dockerEnvironment = {
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
};
const integrationEnabled = process.env.BAM_JAVA_DOCKER_INTEGRATION === "1";

async function docker(argumentsList, timeout = 10_000) {
  return execFileAsync(
    dockerExecutable,
    [...dockerGlobalArguments, ...argumentsList],
    {
      encoding: "utf8",
      env: dockerEnvironment,
      maxBuffer: 1024 * 1024,
      timeout,
    },
  );
}

function createRequest({
  id,
  source,
  entryPoint = "solve",
  parameterTypes = ["int"],
  returnType = "int",
  args = [2],
  expected = 4,
}) {
  return {
    requestId: `java-it-${id}`,
    contractVersion: 1,
    questId: `quest-java-it-${id}`,
    questRevision: 1,
    languageId: "java",
    suite: "public",
    source,
    entryPoint,
    parameterTypes,
    returnType,
    tests: [
      {
        id: `java-it-${id}-case`,
        label: id,
        args,
        expected,
      },
    ],
  };
}

async function listContainerNames(prefix) {
  const { stdout } = await docker(["ps", "--all", "--format={{.Names}}"]);
  return stdout
    .split(/\r?\n/gu)
    .filter((name) => name.startsWith(prefix));
}

async function waitForTestContainer(prefix, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const names = await listContainerNames(prefix);
    const name = names.find((candidate) => candidate.includes("test-"));
    if (name) return name;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("격리 설정을 검사할 실행 중 Java test 컨테이너를 찾지 못했습니다.");
}

async function waitForNoContainers(prefix, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await listContainerNames(prefix)).length === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.deepEqual(await listContainerNames(prefix), []);
}

async function listTemporaryDirectories(prefix) {
  return (await readdir(tmpdir())).filter((name) => name.startsWith(prefix));
}

test(
  "고정 Java 21 Docker backend는 공개 테스트와 격리·제한·정리를 실제로 수행한다",
  { skip: !integrationEnabled },
  async (t) => {
    const unique = `${process.pid}-${randomUUID().slice(0, 8)}`;
    const containerNamePrefix = `bam-java-it-${unique}-`;
    const temporaryDirectoryPrefix = `bam-java-it-${unique}-`;
    const createGrader = (limits) =>
      new LocalJavaGrader({
        containerNamePrefix,
        temporaryDirectoryPrefix,
        limits,
      });

    const { stdout: imageId } = await docker([
      "image",
      "inspect",
      "--format={{.Id}}",
      LOCAL_JAVA_DOCKER_IMAGE,
    ]);
    assert.match(imageId, /^sha256:[a-f0-9]{64}\s*$/u);

    await t.test("정답·오답·컴파일·런타임 결과를 구분한다", async () => {
      const grader = createGrader();
      const correct = await grader.execute(
        createRequest({
          id: "correct",
          source:
            "public class Solution { public static int solve(int value) { return value * 2; } }",
        }),
      );
      assert.equal(correct.outcome, "passed");
      assert.equal(correct.tests[0].actual, 4);

      const wrong = await grader.execute(
        createRequest({
          id: "wrong",
          source:
            "public class Solution { public static int solve(int value) { return value; } }",
        }),
      );
      assert.equal(wrong.outcome, "wrong_answer");
      assert.equal(wrong.tests[0].actual, 2);

      const compile = await grader.execute(
        createRequest({
          id: "compile",
          source:
            "public class Solution { public static int solve(int value) { return value * 2 } }",
        }),
      );
      assert.equal(compile.outcome, "syntax_error");
      assert.equal(compile.tests[0].outcome, "syntax_error");

      const runtime = await grader.execute(
        createRequest({
          id: "runtime",
          source:
            "public class Solution { public static int solve(int value) { throw new IllegalStateException(\"boom\"); } }",
        }),
      );
      assert.equal(runtime.outcome, "runtime_error");
      assert.match(runtime.tests[0].error.message, /IllegalStateException.*boom/u);
    });

    await t.test("시간과 출력 상한에서 컨테이너를 종료한다", async () => {
      const timeoutGrader = createGrader({
        compileTimeoutMs: 5_000,
        testTimeoutMs: 700,
        runTimeoutMs: 8_000,
      });
      const timeoutReport = await timeoutGrader.execute(
        createRequest({
          id: "timeout",
          source:
            "public class Solution { public static int solve(int value) { while (true) {} } }",
        }),
      );
      assert.equal(timeoutReport.outcome, "timeout");
      assert.equal(timeoutReport.tests[0].outcome, "timeout");

      const outputGrader = createGrader({
        maxProcessOutputBytes: 1_024,
        maxTotalOutputBytes: 4_096,
        compileTimeoutMs: 5_000,
        testTimeoutMs: 3_000,
        runTimeoutMs: 8_000,
      });
      const outputReport = await outputGrader.execute(
        createRequest({
          id: "output",
          source:
            "public class Solution { public static int solve(int value) { while (true) { System.out.println(\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"); } } }",
        }),
      );
      assert.equal(outputReport.outcome, "output_limit");
      assert.equal(outputReport.tests[0].outcome, "output_limit");
    });

    await t.test("host 파일은 보이지 않고 test mount와 network는 격리된다", async () => {
      const hostMarkerDirectory = await mkdtemp(
        path.join(tmpdir(), "bam-java-host-marker-"),
      );
      const hostMarkerPath = path.join(hostMarkerDirectory, "marker.png");
      await writeFile(
        hostMarkerPath,
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      );
      try {
        const report = await createGrader().execute(
          createRequest({
            id: "host-file",
            source:
              "public class Solution { public static boolean solve(String path) { return new javax.swing.ImageIcon(path).getIconWidth() > 0; } }",
            parameterTypes: ["String"],
            returnType: "boolean",
            args: [hostMarkerPath],
            expected: false,
          }),
        );
        assert.equal(report.outcome, "passed");
      } finally {
        await rm(hostMarkerDirectory, { recursive: true, force: true });
      }

      const controller = new AbortController();
      const isolationGrader = createGrader({
        compileTimeoutMs: 5_000,
        testTimeoutMs: 5_000,
        runTimeoutMs: 10_000,
        maxConcurrentRuns: 1,
      });
      const running = isolationGrader.execute(
        createRequest({
          id: "isolation",
          source:
            "public class Solution { public static int solve(int value) { while (true) {} } }",
        }),
        { signal: controller.signal },
      );
      const containerName = await waitForTestContainer(containerNamePrefix);
      const { stdout } = await docker(["inspect", containerName]);
      const [inspection] = JSON.parse(stdout);
      assert.equal(inspection.HostConfig.NetworkMode, "none");
      assert.equal(inspection.HostConfig.ReadonlyRootfs, true);
      assert.ok(inspection.HostConfig.CapDrop.includes("ALL"));
      assert.ok(
        inspection.HostConfig.SecurityOpt.some((option) =>
          option.startsWith("no-new-privileges"),
        ),
      );
      assert.equal(inspection.HostConfig.PidsLimit, 64);
      assert.equal(inspection.HostConfig.NanoCpus, 1_000_000_000);
      assert.equal(inspection.HostConfig.Memory, 128 * 1024 * 1024);
      assert.equal(inspection.HostConfig.MemorySwap, 128 * 1024 * 1024);
      assert.equal(inspection.Config.User, `${process.getuid()}:${process.getgid()}`);
      assert.equal(inspection.Config.OpenStdin, true);
      assert.equal(inspection.Config.Image, LOCAL_JAVA_DOCKER_IMAGE);
      assert.equal(inspection.Path, "/opt/java/openjdk/bin/java");
      assert.doesNotMatch(inspection.Args.join(" "), /BAM_[a-f0-9]{32}/u);
      const bindMounts = inspection.Mounts.filter((mount) => mount.Type === "bind");
      assert.equal(bindMounts.length, 1);
      assert.equal(bindMounts[0].Destination, "/workspace");
      assert.equal(bindMounts[0].RW, false);
      assert.ok(Object.hasOwn(inspection.HostConfig.Tmpfs, "/tmp"));

      const concurrent = await isolationGrader.execute(
        createRequest({
          id: "concurrent",
          source:
            "public class Solution { public static int solve(int value) { return value; } }",
        }),
      );
      assert.equal(concurrent.outcome, "engine_error");
      assert.equal(concurrent.error.type, "java_concurrent_limit");
      controller.abort();
      const cancelled = await running;
      assert.equal(cancelled.outcome, "cancelled");
      assert.equal(cancelled.tests[0].outcome, "cancelled");
    });

    await t.test("token은 argv에 없고 learner 출력으로 marker를 위조하지 못한다", async () => {
      const report = await createGrader().execute(
        createRequest({
          id: "marker",
          source: `public class Solution {
            public static int solve(int value) {
              String command = java.lang.management.ManagementFactory
                .getRuntimeMXBean().getSystemProperties().get("sun.java.command");
              System.out.println(command);
              System.out.println("BAM_00000000000000000000000000000000\\tOK\\tOTk5");
              return value * 2;
            }
          }`,
        }),
      );
      assert.equal(report.outcome, "passed");
      assert.equal(report.tests[0].actual, 4);
      assert.ok(
        report.tests[0].console.some((entry) => /BamJavaHarness 0/u.test(entry.preview)),
      );
    });

    await waitForNoContainers(containerNamePrefix);
    assert.deepEqual(await listTemporaryDirectories(temporaryDirectoryPrefix), []);
  },
);
