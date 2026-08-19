import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  DEFAULT_EXECUTION_LIMITS,
  areJsonValuesEqual,
  formatJsonValue,
  serializedJsonByteLength,
  summarizeTestResults,
} from "../../src/grading/code-grading.js";
import { createJavaExecutionRequestSnapshot } from "../../src/grading/java-grading.js";
import { createJavaHarnessSource } from "./harness.mjs";
import { inspectJavaSourcePreflight } from "./preflight.mjs";

const KIBIBYTE = 1024;
const JAVA_RELEASE = "21";
const DOCKER_WORKSPACE = "/workspace";
const DOCKER_JAVA_HOME = "/opt/java/openjdk";
const DOCKER_CONTROL_OUTPUT_BYTES = 8 * KIBIBYTE;
const DOCKER_COMPILE_MEMORY_MIB = 512;
const DOCKER_TEST_MEMORY_MIB = 128;
const DOCKER_PIDS_LIMIT = 64;
const DOCKER_CPU_LIMIT = 1;

export const LOCAL_JAVA_DOCKER_IMAGE =
  "maven@sha256:3a4ab3276a087bf276f79cae96b1af04f53731bec53fb2e651aca79e4b10211e";
export const LOCAL_JAVA_CONTAINER_PREFIX = "bam-java-grader-";

export const DEFAULT_LOCAL_JAVA_LIMITS = Object.freeze({
  maxSourceBytes: DEFAULT_EXECUTION_LIMITS.maxSourceBytes,
  maxTests: DEFAULT_EXECUTION_LIMITS.maxTests,
  maxInputBytesPerTest: DEFAULT_EXECUTION_LIMITS.maxInputBytesPerTest,
  maxOutputBytesPerTest: DEFAULT_EXECUTION_LIMITS.maxOutputBytesPerTest,
  maxConsoleEntries: DEFAULT_EXECUTION_LIMITS.maxConsoleEntries,
  maxConsoleBytes: DEFAULT_EXECUTION_LIMITS.maxConsoleBytes,
  compileTimeoutMs: 4_000,
  testTimeoutMs: 1_000,
  runTimeoutMs: 8_000,
  maxProcessOutputBytes: 64 * KIBIBYTE,
  maxTotalOutputBytes: 128 * KIBIBYTE,
  maxConcurrentRuns: 1,
  dockerControlTimeoutMs: 4_000,
});

export class JavaRequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "JavaRequestValidationError";
  }
}

function mergeLimits(overrides) {
  if (
    overrides !== undefined &&
    (overrides === null ||
      typeof overrides !== "object" ||
      Array.isArray(overrides) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(overrides)))
  ) {
    throw new TypeError("Java 실행 제한은 일반 객체여야 합니다.");
  }
  const unknown = Object.keys(overrides ?? {}).filter(
    (key) => !Object.hasOwn(DEFAULT_LOCAL_JAVA_LIMITS, key),
  );
  if (unknown.length > 0) {
    throw new TypeError(`허용되지 않은 Java 실행 제한이 있습니다: ${unknown.join(", ")}`);
  }
  const limits = { ...DEFAULT_LOCAL_JAVA_LIMITS, ...overrides };
  for (const [key, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`Java 실행 제한 ${key}는 0보다 큰 안전한 정수여야 합니다.`);
    }
  }
  return Object.freeze(limits);
}

function roundDuration(value) {
  return Math.max(0, Math.round(value * 10) / 10);
}

function createError(type, message, learnerMessage = message) {
  return { type, message, learnerMessage };
}

function createBaseTestResult(test) {
  return {
    testId: test.id,
    label: test.label ?? null,
    outcome: "not_run",
    expected: test.expected,
    expectedDisplay: formatJsonValue(test.expected),
    actual: null,
    actualDisplay: null,
    hasActual: false,
    durationMs: 0,
    console: [],
    error: null,
  };
}

function createStoppedResults(request, outcome, error) {
  return request.tests.map((test, index) => ({
    ...createBaseTestResult(test),
    outcome: index === 0 ? outcome : "not_run",
    error: index === 0 ? error : null,
  }));
}

function assertDockerName(value, label) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 100 ||
    !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/u.test(value)
  ) {
    throw new TypeError(`${label}은 안전한 Docker 이름이어야 합니다.`);
  }
}

export function createDockerCreateArguments({
  containerName,
  temporaryDirectory,
  entrypoint,
  memoryMiB,
  userId,
  groupId,
  image = LOCAL_JAVA_DOCKER_IMAGE,
}) {
  assertDockerName(containerName, "containerName");
  if (
    typeof temporaryDirectory !== "string" ||
    !path.isAbsolute(temporaryDirectory) ||
    /[,\u0000\r\n]/u.test(temporaryDirectory)
  ) {
    throw new TypeError("temporaryDirectory는 안전한 절대 경로여야 합니다.");
  }
  if (
    ![
      `${DOCKER_JAVA_HOME}/bin/javac`,
      `${DOCKER_JAVA_HOME}/bin/java`,
    ].includes(entrypoint)
  ) {
    throw new TypeError("허용된 Java 컨테이너 entrypoint가 아닙니다.");
  }
  if (!Number.isSafeInteger(memoryMiB) || memoryMiB < 64 || memoryMiB > 1024) {
    throw new TypeError("Docker 메모리 제한은 64~1024 MiB 정수여야 합니다.");
  }
  if (
    !Number.isSafeInteger(userId) ||
    !Number.isSafeInteger(groupId) ||
    userId <= 0 ||
    groupId < 0
  ) {
    throw new TypeError("Docker 컨테이너는 host의 non-root uid:gid로 실행해야 합니다.");
  }
  if (image !== LOCAL_JAVA_DOCKER_IMAGE) {
    throw new TypeError("Java 채점기는 승인된 고정 digest 이미지만 사용할 수 있습니다.");
  }
  const isTestContainer = entrypoint === `${DOCKER_JAVA_HOME}/bin/java`;

  const argumentsList = [
    "create",
    `--name=${containerName}`,
    "--pull=never",
    "--network=none",
    "--read-only",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    `--pids-limit=${DOCKER_PIDS_LIMIT}`,
    `--cpus=${DOCKER_CPU_LIMIT}`,
    `--memory=${memoryMiB}m`,
    `--memory-swap=${memoryMiB}m`,
    "--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=64m,mode=1777",
    `--mount=type=bind,source=${temporaryDirectory},target=${DOCKER_WORKSPACE}${
      isTestContainer ? ",readonly" : ""
    }`,
    `--workdir=${DOCKER_WORKSPACE}`,
    `--user=${userId}:${groupId}`,
    "--env=HOME=/tmp",
    "--env=LANG=C.UTF-8",
    "--label=bam.dev.component=java-grader",
    `--entrypoint=${entrypoint}`,
  ];
  if (isTestContainer) argumentsList.push("--interactive");
  argumentsList.push(image);
  return argumentsList;
}

function appendBoundedChunk(chunks, chunk, state, outputLimitBytes) {
  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  const remaining = Math.max(0, outputLimitBytes - state.bytes);
  if (remaining > 0) chunks.push(buffer.subarray(0, remaining));
  state.bytes += buffer.byteLength;
  return state.bytes > outputLimitBytes;
}

function runBoundedProcess(
  executable,
  argumentsList,
  { cwd, environment, timeoutMs, outputLimitBytes, signal, stdinInput },
) {
  return new Promise((resolve) => {
    let child;
    let timer;
    let settled = false;
    let terminalKind = null;
    const stdoutChunks = [];
    const stderrChunks = [];
    const outputState = { bytes: 0 };

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      signal?.removeEventListener("abort", handleAbort);
      resolve({
        ...result,
        stdout: Buffer.concat(stdoutChunks).toString("utf8"),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
        outputBytes: outputState.bytes,
      });
    };

    const terminate = (kind) => {
      if (terminalKind) return;
      terminalKind = kind;
      try {
        if (child?.pid) process.kill(-child.pid, "SIGKILL");
        else child?.kill("SIGKILL");
      } catch {
        try {
          child?.kill("SIGKILL");
        } catch {
          finish({ kind });
        }
      }
    };

    const handleAbort = () => terminate("cancelled");

    if (signal?.aborted) {
      finish({ kind: "cancelled" });
      return;
    }

    try {
      child = spawn(executable, argumentsList, {
        cwd,
        detached: true,
        env: environment,
        shell: false,
        stdio: [stdinInput === undefined ? "ignore" : "pipe", "pipe", "pipe"],
      });
      if (stdinInput !== undefined) {
        child.stdin.on("error", () => {});
        child.stdin.end(stdinInput);
      }
      child.stdout.on("data", (chunk) => {
        if (appendBoundedChunk(stdoutChunks, chunk, outputState, outputLimitBytes)) {
          terminate("output_limit");
        }
      });
      child.stderr.on("data", (chunk) => {
        if (appendBoundedChunk(stderrChunks, chunk, outputState, outputLimitBytes)) {
          terminate("output_limit");
        }
      });
      child.once("error", (error) => finish({ kind: "spawn_error", error }));
      child.once("close", (code, childSignal) => {
        finish({
          kind: terminalKind ?? "exit",
          code,
          signal: childSignal,
        });
      });
      signal?.addEventListener("abort", handleAbort, { once: true });
      if (signal?.aborted) handleAbort();
      if (!settled) timer = setTimeout(() => terminate("timeout"), timeoutMs);
    } catch (error) {
      finish({ kind: "spawn_error", error });
    }
  });
}

function cleanProcessMessage(value, temporaryDirectory, maximumCharacters = 1_600) {
  const cleaned = String(value || "")
    .replaceAll(temporaryDirectory, "<java-workspace>")
    .replaceAll(DOCKER_WORKSPACE, "<java-workspace>")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "")
    .trim();
  if (!cleaned) return "자세한 오류 메시지가 없습니다.";
  return cleaned.length <= maximumCharacters
    ? cleaned
    : `${cleaned.slice(0, maximumCharacters)}…`;
}

function createConsoleEntries(stdout, stderr, token, limits) {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const markerPattern = new RegExp(
    `${escapedToken}\\t(?:OK|ERROR)\\t[A-Za-z0-9+/]*={0,2}(?=\\r?\\n|$)`,
    "gu",
  );
  const learnerStdout = stdout.replace(markerPattern, "");
  const candidates = [
    ...learnerStdout.split(/\r?\n/gu).map((preview) => ({ method: "log", preview })),
    ...stderr.split(/\r?\n/gu).map((preview) => ({ method: "error", preview })),
  ].filter((entry) => entry.preview.length > 0);

  const entries = [];
  let bytes = 0;
  for (const candidate of candidates) {
    if (entries.length >= limits.maxConsoleEntries) break;
    const availableBytes = limits.maxConsoleBytes - bytes;
    if (availableBytes <= 0) break;
    let preview = candidate.preview;
    while (Buffer.byteLength(preview, "utf8") > availableBytes && preview.length > 0) {
      preview = preview.slice(0, -1);
    }
    if (!preview) break;
    bytes += Buffer.byteLength(preview, "utf8");
    entries.push({ method: candidate.method, preview });
  }
  return entries;
}

function parseHarnessResult(stdout, token) {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const matches = [
    ...stdout.matchAll(
      new RegExp(
        `${escapedToken}\\t(OK|ERROR)\\t([A-Za-z0-9+/]*={0,2})(?=\\r?\\n|$)`,
        "gu",
      ),
    ),
  ];
  if (matches.length !== 1) return null;
  const match = matches[0];
  try {
    return {
      kind: match[1],
      value: Buffer.from(match[2], "base64").toString("utf8"),
    };
  } catch {
    return null;
  }
}

function dockerClientEnvironment() {
  return {
    LANG: "C",
    LC_ALL: "C",
    PATH: "/usr/bin:/bin",
  };
}

function dockerClientArguments(argumentsList) {
  return [
    "--host=unix:///var/run/docker.sock",
    "--config=/var/empty",
    ...argumentsList,
  ];
}

function javaVmArguments() {
  return [
    "-Xms16m",
    "-Xmx64m",
    "-Xss256k",
    "-XX:ActiveProcessorCount=1",
    "-XX:-UsePerfData",
    "-Djava.awt.headless=true",
  ];
}

function didProcessSucceed(result) {
  return result.kind === "exit" && result.code === 0;
}

function isMissingContainerResult(result) {
  return (
    result.kind === "exit" &&
    result.code !== 0 &&
    /No such container/iu.test(`${result.stderr}\n${result.stdout}`)
  );
}

function waitForCleanupRetry(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export class LocalJavaGrader {
  constructor({
    limits,
    dockerExecutable = "/usr/local/bin/docker",
    containerNamePrefix = LOCAL_JAVA_CONTAINER_PREFIX,
    temporaryDirectoryPrefix = "bam-java-grader-",
    userId = process.getuid?.(),
    groupId = process.getgid?.(),
  } = {}) {
    this.limits = mergeLimits(limits);
    if (
      typeof dockerExecutable !== "string" ||
      !path.isAbsolute(dockerExecutable) ||
      /[\u0000\r\n]/u.test(dockerExecutable)
    ) {
      throw new TypeError("dockerExecutable은 안전한 절대 경로여야 합니다.");
    }
    assertDockerName(containerNamePrefix, "containerNamePrefix");
    if (containerNamePrefix.length > 48) {
      throw new TypeError("containerNamePrefix는 48자 이하여야 합니다.");
    }
    if (
      typeof temporaryDirectoryPrefix !== "string" ||
      temporaryDirectoryPrefix.length === 0 ||
      temporaryDirectoryPrefix.length > 64 ||
      !/^[A-Za-z0-9][A-Za-z0-9_.-]*-$/u.test(temporaryDirectoryPrefix)
    ) {
      throw new TypeError("temporaryDirectoryPrefix는 안전한 임시 디렉터리 접두사여야 합니다.");
    }
    this.dockerExecutable = dockerExecutable;
    this.containerNamePrefix = containerNamePrefix;
    this.temporaryDirectoryPrefix = temporaryDirectoryPrefix;
    this.userId = userId;
    this.groupId = groupId;
    this.activeRuns = 0;
  }

  get limitsApplied() {
    return {
      javaRelease: Number(JAVA_RELEASE),
      maxSourceBytes: this.limits.maxSourceBytes,
      maxTests: this.limits.maxTests,
      maxInputBytesPerTest: this.limits.maxInputBytesPerTest,
      maxOutputBytesPerTest: this.limits.maxOutputBytesPerTest,
      maxConsoleEntries: this.limits.maxConsoleEntries,
      maxConsoleBytes: this.limits.maxConsoleBytes,
      compileTimeoutMs: this.limits.compileTimeoutMs,
      testTimeoutMs: this.limits.testTimeoutMs,
      runTimeoutMs: this.limits.runTimeoutMs,
      dockerControlTimeoutMs: this.limits.dockerControlTimeoutMs,
      maxProcessOutputBytes: this.limits.maxProcessOutputBytes,
      maxTotalOutputBytes: this.limits.maxTotalOutputBytes,
      maxConcurrentRuns: this.limits.maxConcurrentRuns,
      jvmMaxHeapMiB: 64,
      jvmStackKiB: 256,
      activeProcessorCount: 1,
      containerCompileMemoryMiB: DOCKER_COMPILE_MEMORY_MIB,
      containerTestMemoryMiB: DOCKER_TEST_MEMORY_MIB,
      containerPidsLimit: DOCKER_PIDS_LIMIT,
      containerCpuLimit: DOCKER_CPU_LIMIT,
      sandbox: "local-docker",
      image: LOCAL_JAVA_DOCKER_IMAGE,
    };
  }

  #createReport(request, tests, startedAt, { outcome, error = null } = {}) {
    const summary = summarizeTestResults(tests);
    return {
      requestId: request.requestId,
      contractVersion: request.contractVersion,
      questId: request.questId,
      questRevision: request.questRevision,
      languageId: request.languageId,
      suite: request.suite,
      outcome: outcome ?? summary.outcome,
      tests,
      summary,
      durationMs: roundDuration(performance.now() - startedAt),
      limitsApplied: this.limitsApplied,
      error,
    };
  }

  #engineReport(request, startedAt, type, message, learnerMessage = message) {
    const error = createError(type, message, learnerMessage);
    return this.#createReport(
      request,
      request.tests.map(createBaseTestResult),
      startedAt,
      { outcome: "engine_error", error },
    );
  }

  #cancelledReport(request, startedAt) {
    const error = createError("cancelled", "사용자가 Java 코드 실행을 취소했습니다.");
    return this.#createReport(
      request,
      createStoppedResults(request, "cancelled", error),
      startedAt,
    );
  }

  #createContainerName(kind) {
    return `${this.containerNamePrefix}${kind}-${randomUUID().replaceAll("-", "")}`;
  }

  async #runDockerControl(argumentsList, { signal } = {}) {
    return runBoundedProcess(
      this.dockerExecutable,
      dockerClientArguments(argumentsList),
      {
        cwd: "/var/empty",
        environment: dockerClientEnvironment(),
        timeoutMs: this.limits.dockerControlTimeoutMs,
        outputLimitBytes: DOCKER_CONTROL_OUTPUT_BYTES,
        signal,
      },
    );
  }

  async #inspectDockerBackend(signal) {
    const serverResult = await this.#runDockerControl(
      ["version", "--format={{.Server.Version}}"],
      { signal },
    );
    if (serverResult.kind === "cancelled") return { cancelled: true };
    if (!didProcessSucceed(serverResult) || serverResult.stdout.trim().length === 0) {
      return {
        type: "java_docker_unavailable",
        message: "로컬 Docker daemon에 연결하지 못했습니다.",
        learnerMessage:
          "무료 로컬 Java 실행을 사용하려면 Docker Desktop을 설치하고 실행해 주세요.",
      };
    }

    const imageResult = await this.#runDockerControl(
      ["image", "inspect", "--format={{.Id}}", LOCAL_JAVA_DOCKER_IMAGE],
      { signal },
    );
    if (imageResult.kind === "cancelled") return { cancelled: true };
    if (!didProcessSucceed(imageResult) || imageResult.stdout.trim().length === 0) {
      return {
        type: "java_docker_image_unavailable",
        message: `고정 Java 21 이미지가 로컬에 없습니다: ${LOCAL_JAVA_DOCKER_IMAGE}`,
        learnerMessage:
          "문서에 지정된 Java 21 Docker 이미지를 먼저 로컬에 준비해 주세요. 실행기가 이미지를 자동 다운로드하지는 않습니다.",
      };
    }
    return null;
  }

  async #removeDockerContainer(containerName) {
    const retryDelaysMs = [0, 100, 250, 500];
    let lastResultWasMissing = false;
    for (const delayMs of retryDelaysMs) {
      if (delayMs > 0) await waitForCleanupRetry(delayMs);
      const result = await this.#runDockerControl(["rm", "--force", containerName]);
      if (didProcessSucceed(result)) return true;
      if (isMissingContainerResult(result)) {
        lastResultWasMissing = true;
        continue;
      }
      lastResultWasMissing = false;
    }
    return lastResultWasMissing;
  }

  async #runDockerContainer(
    {
      kind,
      temporaryDirectory,
      entrypoint,
      memoryMiB,
      commandArguments,
      timeoutMs,
      deadline,
      outputLimitBytes,
      signal,
      stdinInput,
    },
    liveContainerNames,
  ) {
    const containerName = this.#createContainerName(kind);
    liveContainerNames.add(containerName);
    const dockerArguments = createDockerCreateArguments({
      containerName,
      temporaryDirectory,
      entrypoint,
      memoryMiB,
      userId: this.userId,
      groupId: this.groupId,
    });
    const createResult = await runBoundedProcess(
      this.dockerExecutable,
      dockerClientArguments([...dockerArguments, ...commandArguments]),
      {
        cwd: temporaryDirectory,
        environment: dockerClientEnvironment(),
        timeoutMs: Math.max(
          1,
          Math.min(
            this.limits.dockerControlTimeoutMs,
            Math.ceil(deadline - performance.now()),
          ),
        ),
        outputLimitBytes: DOCKER_CONTROL_OUTPUT_BYTES,
        signal,
      },
    );
    let processResult;
    if (didProcessSucceed(createResult)) {
      processResult = await runBoundedProcess(
        this.dockerExecutable,
        dockerClientArguments([
          "start",
          "--attach",
          ...(stdinInput === undefined ? [] : ["--interactive"]),
          containerName,
        ]),
        {
          cwd: temporaryDirectory,
          environment: dockerClientEnvironment(),
          timeoutMs: Math.max(
            1,
            Math.min(timeoutMs, Math.ceil(deadline - performance.now())),
          ),
          outputLimitBytes,
          signal,
          stdinInput,
        },
      );
    } else if (createResult.kind === "cancelled") {
      processResult = createResult;
    } else {
      processResult = {
        ...createResult,
        kind: "container_create_error",
        error: new Error("보안 제한이 적용된 Docker 컨테이너를 생성하지 못했습니다."),
      };
    }
    const removed = await this.#removeDockerContainer(containerName);
    if (removed) liveContainerNames.delete(containerName);
    if (!removed) {
      return {
        ...processResult,
        kind: "cleanup_error",
        error: new Error(`Docker 컨테이너 ${containerName} 정리에 실패했습니다.`),
      };
    }
    return processResult;
  }

  async execute(rawRequest, { signal } = {}) {
    const startedAt = performance.now();
    let request;
    try {
      request = createJavaExecutionRequestSnapshot(rawRequest, {
        maxSourceBytes: this.limits.maxSourceBytes,
        maxTests: this.limits.maxTests,
        maxInputBytesPerTest: this.limits.maxInputBytesPerTest,
        maxOutputBytesPerTest: this.limits.maxOutputBytesPerTest,
      });
    } catch (error) {
      throw new JavaRequestValidationError(
        error instanceof Error ? error.message : "Java 실행 요청이 올바르지 않습니다.",
      );
    }

    if (this.activeRuns >= this.limits.maxConcurrentRuns) {
      return this.#engineReport(
        request,
        startedAt,
        "java_concurrent_limit",
        "동시에 실행할 수 있는 Java 요청 수를 초과했습니다.",
        "현재 Java 실행이 끝난 뒤 다시 시도해 주세요.",
      );
    }

    this.activeRuns += 1;
    try {
      if (signal?.aborted) return this.#cancelledReport(request, startedAt);

      const preflightIssues = inspectJavaSourcePreflight(request.source);
      if (preflightIssues.length > 0) {
        return this.#engineReport(
          request,
          startedAt,
          "java_source_rejected",
          preflightIssues.join(" "),
          `이 학습 실행기에서 허용하지 않는 Java 코드입니다. ${preflightIssues.join(" ")}`,
        );
      }
      if (
        !Number.isSafeInteger(this.userId) ||
        !Number.isSafeInteger(this.groupId) ||
        this.userId <= 0 ||
        this.groupId < 0
      ) {
        return this.#engineReport(
          request,
          startedAt,
          "java_container_user_unavailable",
          "host의 non-root uid:gid를 확인할 수 없어 Java 컨테이너 실행을 거부했습니다.",
          "로컬 Java 컨테이너를 non-root 사용자로 시작할 수 없습니다.",
        );
      }
      const backendIssue = await this.#inspectDockerBackend(signal);
      if (backendIssue?.cancelled) return this.#cancelledReport(request, startedAt);
      if (backendIssue) {
        return this.#engineReport(
          request,
          startedAt,
          backendIssue.type,
          backendIssue.message,
          backendIssue.learnerMessage,
        );
      }
      return await this.#executeInTemporaryDirectory(request, startedAt, signal);
    } finally {
      this.activeRuns -= 1;
    }
  }

  async #executeInTemporaryDirectory(request, startedAt, signal) {
    const createdDirectory = await mkdtemp(
      path.join(tmpdir(), this.temporaryDirectoryPrefix),
    );
    let temporaryDirectory = createdDirectory;
    const liveContainerNames = new Set();
    const deadline = performance.now() + this.limits.runTimeoutMs;
    const outputBudget = { remaining: this.limits.maxTotalOutputBytes };

    try {
      temporaryDirectory = await realpath(createdDirectory);
      const classesDirectory = path.join(temporaryDirectory, "classes");
      const sourcePath = path.join(temporaryDirectory, "Solution.java");
      const harnessPath = path.join(temporaryDirectory, "BamJavaHarness.java");
      await mkdir(classesDirectory, { mode: 0o700 });
      await Promise.all([
        writeFile(sourcePath, request.source, { encoding: "utf8", mode: 0o600 }),
        writeFile(harnessPath, createJavaHarnessSource(request), {
          encoding: "utf8",
          mode: 0o600,
        }),
      ]);

      const compileTimeoutMs = Math.max(
        1,
        Math.min(this.limits.compileTimeoutMs, Math.ceil(deadline - performance.now())),
      );
      const compileResult = await this.#runDockerContainer(
        {
          kind: "compile",
          temporaryDirectory,
          entrypoint: `${DOCKER_JAVA_HOME}/bin/javac`,
          memoryMiB: DOCKER_COMPILE_MEMORY_MIB,
          commandArguments: [
            "-J-Xms16m",
            "-J-Xmx64m",
            "-J-Xss256k",
            "-J-XX:ActiveProcessorCount=1",
            "-J-XX:-UsePerfData",
            "-proc:none",
            "-encoding",
            "UTF-8",
            "--release",
            JAVA_RELEASE,
            "-d",
            `${DOCKER_WORKSPACE}/classes`,
            `${DOCKER_WORKSPACE}/Solution.java`,
            `${DOCKER_WORKSPACE}/BamJavaHarness.java`,
          ],
          timeoutMs: compileTimeoutMs,
          deadline,
          outputLimitBytes: Math.min(
            this.limits.maxProcessOutputBytes,
            outputBudget.remaining,
          ),
          signal,
        },
        liveContainerNames,
      );
      outputBudget.remaining = Math.max(0, outputBudget.remaining - compileResult.outputBytes);

      const compileTerminal = this.#compileTerminalReport(
        request,
        compileResult,
        temporaryDirectory,
        startedAt,
      );
      if (compileTerminal) return compileTerminal;

      const testResults = [];
      for (let index = 0; index < request.tests.length; index += 1) {
        const remainingMs = Math.ceil(deadline - performance.now());
        if (remainingMs <= 0) {
          const error = createError(
            "java_run_timeout",
            `Java 전체 실행 시간이 ${this.limits.runTimeoutMs}ms를 넘었습니다.`,
            "전체 실행 시간이 초과되었습니다. 반복문과 재귀 종료 조건을 확인해 보세요.",
          );
          testResults.push({
            ...createBaseTestResult(request.tests[index]),
            outcome: "timeout",
            error,
          });
          for (let rest = index + 1; rest < request.tests.length; rest += 1) {
            testResults.push(createBaseTestResult(request.tests[rest]));
          }
          break;
        }
        if (outputBudget.remaining <= 0) {
          const error = createError(
            "java_total_output_limit",
            "Java 전체 프로세스 출력 상한을 초과했습니다.",
            "출력한 문자열의 양을 줄여 주세요.",
          );
          testResults.push({
            ...createBaseTestResult(request.tests[index]),
            outcome: "output_limit",
            error,
          });
          for (let rest = index + 1; rest < request.tests.length; rest += 1) {
            testResults.push(createBaseTestResult(request.tests[rest]));
          }
          break;
        }

        const token = `BAM_${randomUUID().replaceAll("-", "")}`;
        const testStartedAt = performance.now();
        const processResult = await this.#runDockerContainer(
          {
            kind: "test",
            temporaryDirectory,
            entrypoint: `${DOCKER_JAVA_HOME}/bin/java`,
            memoryMiB: DOCKER_TEST_MEMORY_MIB,
            commandArguments: [
              ...javaVmArguments(),
              "-Djava.io.tmpdir=/tmp",
              "-cp",
              `${DOCKER_WORKSPACE}/classes`,
              "BamJavaHarness",
              String(index),
            ],
            timeoutMs: Math.max(
              1,
              Math.min(this.limits.testTimeoutMs, remainingMs),
            ),
            deadline,
            outputLimitBytes: Math.min(
              this.limits.maxProcessOutputBytes,
              outputBudget.remaining,
            ),
            signal,
            stdinInput: `${token}\n`,
          },
          liveContainerNames,
        );
        outputBudget.remaining = Math.max(0, outputBudget.remaining - processResult.outputBytes);
        testResults.push(
          this.#toTestResult(
            request.tests[index],
            processResult,
            token,
            temporaryDirectory,
            roundDuration(performance.now() - testStartedAt),
          ),
        );
        if (["cancelled", "engine_error"].includes(testResults.at(-1).outcome)) {
          for (let rest = index + 1; rest < request.tests.length; rest += 1) {
            testResults.push(createBaseTestResult(request.tests[rest]));
          }
          break;
        }
      }
      return this.#createReport(request, testResults, startedAt);
    } catch (error) {
      return this.#engineReport(
        request,
        startedAt,
        "java_grader_failure",
        error instanceof Error ? error.message : "Java 채점기를 실행하지 못했습니다.",
        "로컬 Java 채점기를 준비하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      for (const containerName of liveContainerNames) {
        try {
          await this.#removeDockerContainer(containerName);
        } catch {
          // The exact-name cleanup was attempted; never broaden the target.
        }
      }
      await rm(createdDirectory, { recursive: true, force: true }).catch(() => {});
    }
  }

  #compileTerminalReport(request, result, temporaryDirectory, startedAt) {
    if (result.kind === "exit" && result.code === 0) return null;
    let outcome = "engine_error";
    let error;
    if (result.kind === "timeout") {
      outcome = "timeout";
      error = createError(
        "java_compile_timeout",
        `Java 컴파일 시간이 ${this.limits.compileTimeoutMs}ms를 넘었습니다.`,
        "컴파일 시간이 초과되었습니다. 소스 구조를 단순하게 바꿔 보세요.",
      );
    } else if (result.kind === "output_limit") {
      outcome = "output_limit";
      error = createError(
        "java_compile_output_limit",
        "Java 컴파일러 출력 상한을 초과했습니다.",
        "컴파일 오류가 너무 많이 발생했습니다. 첫 오류부터 수정해 보세요.",
      );
    } else if (result.kind === "cancelled") {
      outcome = "cancelled";
      error = createError("cancelled", "사용자가 Java 코드 실행을 취소했습니다.");
    } else if (result.kind === "exit" && result.signal) {
      error = createError(
        "java_compiler_signal",
        `javac 프로세스가 ${result.signal} 신호로 종료되었습니다.`,
        "로컬 Java 컴파일러가 비정상 종료되었습니다. 다시 시도해 주세요.",
      );
    } else if (["cleanup_error", "container_create_error"].includes(result.kind)) {
      error = createError(
        result.kind === "cleanup_error"
          ? "java_container_cleanup_error"
          : "java_container_create_error",
        result.error instanceof Error
          ? result.error.message
          : "Java 컴파일 컨테이너를 준비하지 못했습니다.",
        result.kind === "cleanup_error"
          ? "로컬 Java 컨테이너를 안전하게 정리하지 못해 실행을 중단했습니다."
          : "보안 제한이 적용된 로컬 Java 컨테이너를 만들지 못했습니다.",
      );
    } else if (result.kind === "spawn_error") {
      error = createError(
        "java_container_start_error",
        result.error instanceof Error ? result.error.message : "Docker를 시작하지 못했습니다.",
        "로컬 Docker Java 컨테이너를 시작하지 못했습니다.",
      );
    } else if (result.kind === "exit" && result.code === 1) {
      const diagnostic = cleanProcessMessage(
        `${result.stderr}\n${result.stdout}`,
        temporaryDirectory,
      );
      outcome = "syntax_error";
      error = createError(
        "java_compile_error",
        diagnostic,
        `Java 컴파일 오류입니다. ${diagnostic}`,
      );
    } else if (result.kind === "exit") {
      const diagnostic = cleanProcessMessage(
        `${result.stderr}\n${result.stdout}`,
        temporaryDirectory,
      );
      error = createError(
        "java_container_compile_error",
        diagnostic,
        "Java 컴파일 컨테이너가 비정상 종료되었습니다. Docker 상태를 확인해 주세요.",
      );
    } else {
      error = createError(
        "java_compiler_start_error",
        result.error instanceof Error ? result.error.message : "javac를 시작하지 못했습니다.",
        "Docker Desktop과 고정 Java 21 이미지, 로컬 개발 서버 설정을 확인해 주세요.",
      );
    }
    const tests = createStoppedResults(request, outcome, error);
    return this.#createReport(request, tests, startedAt, {
      outcome: outcome === "engine_error" ? "engine_error" : undefined,
      error: outcome === "engine_error" ? error : null,
    });
  }

  #toTestResult(test, result, token, temporaryDirectory, durationMs) {
    const base = {
      ...createBaseTestResult(test),
      durationMs,
      console: createConsoleEntries(result.stdout, result.stderr, token, this.limits),
    };
    if (result.kind === "timeout") {
      return {
        ...base,
        outcome: "timeout",
        error: createError(
          "java_test_timeout",
          `이 공개 테스트의 실행 시간이 ${this.limits.testTimeoutMs}ms를 넘었습니다.`,
          "반복문과 재귀 호출의 종료 조건을 확인해 보세요.",
        ),
      };
    }
    if (result.kind === "output_limit") {
      return {
        ...base,
        outcome: "output_limit",
        error: createError(
          "java_output_limit",
          "Java 프로세스 출력 상한을 초과했습니다.",
          "System.out 출력이나 반환 배열·문자열의 크기를 줄여 주세요.",
        ),
      };
    }
    if (result.kind === "cancelled") {
      return {
        ...base,
        outcome: "cancelled",
        error: createError("cancelled", "사용자가 Java 코드 실행을 취소했습니다."),
      };
    }
    if (["spawn_error", "cleanup_error", "container_create_error"].includes(result.kind)) {
      return {
        ...base,
        outcome: "engine_error",
        error: createError(
          result.kind === "cleanup_error"
            ? "java_container_cleanup_error"
            : result.kind === "container_create_error"
              ? "java_container_create_error"
              : "java_container_start_error",
          result.error instanceof Error
            ? result.error.message
            : "Java 컨테이너를 시작하거나 정리하지 못했습니다.",
          "로컬 Docker Java 컨테이너를 안전하게 실행하지 못했습니다.",
        ),
      };
    }

    if (result.kind === "exit" && [125, 126, 127].includes(result.code)) {
      const processMessage = cleanProcessMessage(
        `${result.stderr}\n${result.stdout}`,
        temporaryDirectory,
      );
      return {
        ...base,
        outcome: "engine_error",
        error: createError(
          "java_container_process_error",
          processMessage,
          "로컬 Docker Java 컨테이너를 시작하지 못했습니다.",
        ),
      };
    }

    if (result.kind !== "exit" || result.code !== 0) {
      const processMessage = cleanProcessMessage(
        `${result.stderr}\n${result.stdout}`,
        temporaryDirectory,
      );
      return {
        ...base,
        outcome: "runtime_error",
        error: createError(
          "java_process_error",
          processMessage,
          `Java 실행 중 오류가 발생했습니다. ${processMessage}`,
        ),
      };
    }

    const harnessResult = parseHarnessResult(result.stdout, token);
    if (!harnessResult) {
      const processMessage = cleanProcessMessage(
        `${result.stderr}\n${result.stdout}`,
        temporaryDirectory,
      );
      return {
        ...base,
        outcome: result.code === 0 ? "engine_error" : "runtime_error",
        error: createError(
          result.code === 0 ? "java_invalid_harness_result" : "java_process_error",
          processMessage,
          result.code === 0
            ? "Java 실행 결과를 읽지 못했습니다. 다시 시도해 주세요."
            : `Java 실행 중 오류가 발생했습니다. ${processMessage}`,
        ),
      };
    }
    if (harnessResult.kind === "ERROR") {
      const detail = cleanProcessMessage(harnessResult.value, temporaryDirectory);
      return {
        ...base,
        outcome: "runtime_error",
        error: createError("java_runtime_error", detail, `Java 실행 오류입니다. ${detail}`),
      };
    }

    let actual;
    try {
      actual = JSON.parse(harnessResult.value);
    } catch {
      return {
        ...base,
        outcome: "engine_error",
        error: createError(
          "java_invalid_return_value",
          "Java harness가 올바른 JSON 반환값을 만들지 못했습니다.",
          "반환값을 읽지 못했습니다. 메서드의 반환 타입을 확인해 주세요.",
        ),
      };
    }
    const outputBytes = serializedJsonByteLength(actual, this.limits.maxOutputBytesPerTest);
    if (outputBytes === null || outputBytes > this.limits.maxOutputBytesPerTest) {
      return {
        ...base,
        outcome: "output_limit",
        error: createError(
          "java_return_output_limit",
          "Java 반환값의 JSON 크기 상한을 초과했습니다.",
          "반환 배열이나 문자열의 크기를 줄여 주세요.",
        ),
      };
    }
    const passed = areJsonValuesEqual(actual, test.expected);
    return {
      ...base,
      outcome: passed ? "passed" : "wrong_answer",
      actual,
      actualDisplay: formatJsonValue(actual),
      hasActual: true,
    };
  }
}
