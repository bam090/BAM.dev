import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createJavaHarnessSource } from "../scripts/java-grader/harness.mjs";
import {
  createDockerCreateArguments,
  LOCAL_JAVA_DOCKER_IMAGE,
  LocalJavaGrader,
} from "../scripts/java-grader/index.mjs";
import {
  inspectJavaSourcePreflight,
  stripJavaCommentsAndLiterals,
} from "../scripts/java-grader/preflight.mjs";

function createRequest() {
  return {
    requestId: "java-local-request",
    contractVersion: 1,
    questId: "quest-java-add",
    questRevision: 1,
    languageId: "java",
    suite: "public",
    source: "public class Solution { public static int add(int a, int b) { return a + b; } }",
    entryPoint: "add",
    parameterTypes: ["int", "int"],
    returnType: "int",
    tests: [{ id: "java-local-add", label: "덧셈", args: [2, 3], expected: 5 }],
  };
}

async function createFakeDockerScript(lines) {
  const directory = await mkdtemp(path.join(tmpdir(), "bam-java-fake-docker-"));
  const executable = path.join(directory, "docker");
  await writeFile(executable, ["#!/bin/sh", ...lines, ""].join("\n"), "utf8");
  await chmod(executable, 0o700);
  return {
    directory,
    executable,
    logPath: `${executable}.log`,
  };
}

test("Java preflight는 주석·문자열의 위험 단어는 무시하고 실제 토큰만 검사한다", () => {
  const source = `public class Solution {
    public static String echo(String value) {
      // Runtime, System.exit, Files, Socket은 설명에만 있습니다.
      String explanation = "Runtime System.exit Files Socket";
      return value + explanation.length();
    }
  }`;
  assert.deepEqual(inspectJavaSourcePreflight(source), []);
  const stripped = stripJavaCommentsAndLiterals(source);
  assert.doesNotMatch(stripped, /Runtime|System\.exit|Files|Socket/u);
});

test("Java preflight는 package·추가 public 타입·native와 위험 API를 거부한다", () => {
  const sources = [
    "package demo; public class Solution {}",
    "public class Solution {} public class Other {}",
    "public class Solution { public native int run(); }",
    "public class Solution { public static void run() { System.exit(0); } }",
    "import static java.lang.System.*; public class Solution { public static int run() { exit(0); return 1; } }",
    "public class Solution { public static void run() { System.loadLibrary(\"x\"); } }",
    "public class Solution { public static void run() throws Exception { Class.forName(\"X\"); } }",
    "import com.sun.tools.attach.VirtualMachine; public class Solution {}",
    "import java.nio.file.Files; public class Solution {}",
  ];
  for (const source of sources) {
    assert.notDeepEqual(inspectJavaSourcePreflight(source), [], source);
  }
});

test("Java preflight는 harness JDK 타입을 shadow하는 선언을 거부한다", () => {
  const sources = [
    "class System {} public class Solution { public static int run() { return 1; } }",
    "class java {} public class Solution { public static int run() { return 1; } }",
    "public class Solution { static class String {} public static int run() { return 1; } }",
    "class BamJavaHarness {} public class Solution { public static int run() { return 1; } }",
  ];
  for (const source of sources) {
    assert.ok(
      inspectJavaSourcePreflight(source).some((issue) => /예약 타입/u.test(issue)),
      source,
    );
  }
});

test("Java Unicode escape는 lexical preflight 우회를 막기 위해 위치와 무관하게 fail-closed한다", () => {
  const escapedIdentifier =
    "public class Solution { public static int run() { return \\u0052untime.getRuntime().availableProcessors(); } }";
  const escapedComment =
    "public class Solution { // \\u000a System.exit(0);\n public static int run() { return 1; } }";
  const escapedString =
    "public class Solution { public static String run() { return \"\\u0052untime\"; } }";

  for (const source of [escapedIdentifier, escapedComment, escapedString]) {
    assert.ok(
      inspectJavaSourcePreflight(source).some((issue) => /Unicode escape/u.test(issue)),
      source,
    );
  }
});

test("Java harness는 learner source와 분리된 public class에서 공개 테스트만 호출한다", () => {
  const request = createRequest();
  const harness = createJavaHarnessSource(request);
  assert.match(harness, /public final class BamJavaHarness/u);
  assert.match(harness, /Solution\.add\(2, 3\)/u);
  assert.equal((harness.match(/case 0 ->/gu) ?? []).length, 1);
  assert.doesNotMatch(harness, /hidden|secret/iu);
  assert.doesNotMatch(harness, /arguments\[1\]/u);
  assert.match(harness, /java\.lang\.System\.in/u);
  assert.match(harness, /java\.lang\.System\.out/u);
  assert.match(harness, /java\.lang\.StringBuilder/u);
});

test("Docker create 인자는 고정 이미지와 격리·자원·non-root 경계를 모두 적용한다", () => {
  const argumentsList = createDockerCreateArguments({
    containerName: "bam-java-test-123",
    temporaryDirectory: "/private/tmp/bam-request",
    entrypoint: "/opt/java/openjdk/bin/java",
    memoryMiB: 128,
    userId: 501,
    groupId: 20,
  });
  assert.equal(argumentsList[0], "create");
  assert.ok(argumentsList.includes("--pull=never"));
  assert.ok(argumentsList.includes("--network=none"));
  assert.ok(argumentsList.includes("--read-only"));
  assert.ok(argumentsList.includes("--cap-drop=ALL"));
  assert.ok(argumentsList.includes("--security-opt=no-new-privileges"));
  assert.ok(argumentsList.includes("--pids-limit=64"));
  assert.ok(argumentsList.includes("--cpus=1"));
  assert.ok(argumentsList.includes("--memory=128m"));
  assert.ok(argumentsList.includes("--memory-swap=128m"));
  assert.ok(argumentsList.includes("--user=501:20"));
  assert.ok(
    argumentsList.includes(
      "--mount=type=bind,source=/private/tmp/bam-request,target=/workspace,readonly",
    ),
  );
  assert.ok(argumentsList.includes("--interactive"));
  assert.equal(argumentsList.at(-1), LOCAL_JAVA_DOCKER_IMAGE);

  const compileArguments = createDockerCreateArguments({
    containerName: "bam-java-compile-123",
    temporaryDirectory: "/private/tmp/bam-request",
    entrypoint: "/opt/java/openjdk/bin/javac",
    memoryMiB: 512,
    userId: 501,
    groupId: 20,
  });
  assert.ok(
    compileArguments.includes(
      "--mount=type=bind,source=/private/tmp/bam-request,target=/workspace",
    ),
  );
  assert.ok(!compileArguments.includes("--interactive"));
});

test("고정 digest가 아닌 이미지는 실행 인자를 만들기 전에 거부한다", () => {
  assert.throws(
    () =>
      createDockerCreateArguments({
        containerName: "bam-java-test-123",
        temporaryDirectory: "/private/tmp/bam-request",
        entrypoint: "/opt/java/openjdk/bin/java",
        memoryMiB: 128,
        userId: 501,
        groupId: 20,
        image: "maven:latest",
      }),
    /고정 digest/u,
  );
});

test("Docker daemon을 사용할 수 없으면 임의 host 실행 대신 engine_error를 반환한다", async () => {
  const grader = new LocalJavaGrader({
    dockerExecutable: "/definitely/missing/docker",
    userId: 501,
    groupId: 20,
  });
  const report = await grader.execute(createRequest());
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.error.type, "java_docker_unavailable");
  assert.equal(report.tests[0].outcome, "not_run");
});

test("고정 이미지가 없으면 pull·create 없이 fail-closed한다", async () => {
  const fake = await createFakeDockerScript([
    'printf "%s\\n" "$*" >> "$0.log"',
    'case "$*" in',
    '  *" version "*) echo "27.0"; exit 0 ;;',
    '  *" image inspect "*) exit 1 ;;',
    "  *) exit 99 ;;",
    "esac",
  ]);
  try {
    const grader = new LocalJavaGrader({
      dockerExecutable: fake.executable,
      dockerSocket: "/tmp/bam-java-test.sock",
      userId: 501,
      groupId: 20,
    });
    const report = await grader.execute(createRequest());
    assert.equal(report.outcome, "engine_error");
    assert.equal(report.error.type, "java_docker_image_unavailable");
    const calls = await readFile(fake.logPath, "utf8");
    assert.match(calls, /--host=unix:\/\/\/tmp\/bam-java-test\.sock/u);
    assert.match(calls, / image inspect /u);
    assert.doesNotMatch(calls, /\bpull\b|\bcreate\b/u);
  } finally {
    await rm(fake.directory, { recursive: true, force: true });
  }
});

test("컨테이너 exact-name 정리가 실패하면 결과가 있어도 engine_error로 중단한다", async () => {
  const fake = await createFakeDockerScript([
    'printf "%s\\n" "$*" >> "$0.log"',
    'case "$*" in',
    '  *" version "*) echo "27.0"; exit 0 ;;',
    '  *" image inspect "*) echo "sha256:fixed"; exit 0 ;;',
    '  *" create "*) echo "container-id"; exit 0 ;;',
    '  *" start "*) exit 0 ;;',
    '  *" rm --force "*) exit 2 ;;',
    "  *) exit 99 ;;",
    "esac",
  ]);
  try {
    const grader = new LocalJavaGrader({
      dockerExecutable: fake.executable,
      containerNamePrefix: "bam-java-cleanup-test-",
      temporaryDirectoryPrefix: "bam-java-cleanup-test-",
      userId: 501,
      groupId: 20,
    });
    const report = await grader.execute(createRequest());
    assert.equal(report.outcome, "engine_error");
    assert.equal(report.error.type, "java_container_cleanup_error");
    assert.equal(report.tests[0].outcome, "engine_error");
    const calls = await readFile(fake.logPath, "utf8");
    assert.ok((calls.match(/ rm --force /gu) ?? []).length >= 4);
  } finally {
    await rm(fake.directory, { recursive: true, force: true });
  }
});

test("stdin token marker가 중복되면 정답처럼 보여도 engine_error로 거부한다", async () => {
  const fake = await createFakeDockerScript([
    'printf "%s\\n" "$*" >> "$0.log"',
    'case "$*" in',
    '  *" version "*) echo "27.0"; exit 0 ;;',
    '  *" image inspect "*) echo "sha256:fixed"; exit 0 ;;',
    '  *" create "*) echo "container-id"; exit 0 ;;',
    '  *" start "*"test-"*)',
    '    IFS= read -r token',
    '    printf "%s\\tOK\\tNA==\\n" "$token"',
    '    printf "%s\\tOK\\tNA==\\n" "$token"',
    "    exit 0 ;;",
    '  *" start "*) exit 0 ;;',
    '  *" rm --force "*) exit 0 ;;',
    "  *) exit 99 ;;",
    "esac",
  ]);
  try {
    const grader = new LocalJavaGrader({
      dockerExecutable: fake.executable,
      containerNamePrefix: "bam-java-marker-test-",
      temporaryDirectoryPrefix: "bam-java-marker-test-",
      userId: 501,
      groupId: 20,
    });
    const report = await grader.execute(createRequest());
    assert.equal(report.outcome, "engine_error");
    assert.equal(report.tests[0].error.type, "java_invalid_harness_result");
    assert.doesNotMatch(await readFile(fake.logPath, "utf8"), /BAM_[a-f0-9]{32}/u);
  } finally {
    await rm(fake.directory, { recursive: true, force: true });
  }
});

test("console 미리보기는 UTF-8 바이트 상한에서도 문자 경계를 보존한다", async () => {
  const fake = await createFakeDockerScript([
    'case "$*" in',
    '  *" version "*) echo "27.0"; exit 0 ;;',
    '  *" image inspect "*) echo "sha256:fixed"; exit 0 ;;',
    '  *" create "*) echo "container-id"; exit 0 ;;',
    '  *" start "*"test-"*)',
    '    IFS= read -r token',
    '    printf "가나다\\n"',
    '    printf "%s\\tOK\\tNQ==\\n" "$token"',
    "    exit 0 ;;",
    '  *" start "*) exit 0 ;;',
    '  *" rm --force "*) exit 0 ;;',
    "  *) exit 99 ;;",
    "esac",
  ]);
  try {
    const grader = new LocalJavaGrader({
      dockerExecutable: fake.executable,
      limits: { maxConsoleBytes: 5 },
      userId: 501,
      groupId: 20,
    });
    const report = await grader.execute(createRequest());
    assert.equal(report.outcome, "passed");
    assert.deepEqual(report.tests[0].console, [{ method: "log", preview: "가" }]);
  } finally {
    await rm(fake.directory, { recursive: true, force: true });
  }
});

test("non-root uid를 확인할 수 없으면 Docker를 호출하기 전에 fail-closed한다", async () => {
  const grader = new LocalJavaGrader({
    dockerExecutable: "/definitely/missing/docker",
    userId: 0,
    groupId: 0,
  });
  const report = await grader.execute(createRequest());
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.error.type, "java_container_user_unavailable");
  assert.equal(report.tests[0].outcome, "not_run");
});
