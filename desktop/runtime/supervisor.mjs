import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { release as osRelease, tmpdir, version as osVersion } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CT_EVALUATION_KIND, CT_JUNIT, CT_RUNNER_CLASS, createCodingTestArtifacts, verifyCodingTestBundle } from "./coding-test-artifacts.mjs";

const MODULE_ROOT = dirname(fileURLToPath(import.meta.url));
const SANDBOX_EXECUTABLE = "/usr/bin/sandbox-exec";
const PS_EXECUTABLE = "/bin/ps";
const PROCESS_OBSERVER_TIMEOUT_MS = 250;
const PROCESS_OBSERVER_REAP_DEADLINE_MS = 250;
const PROCESS_OBSERVER_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const MAX_COMPILE_METADATA_ANCESTORS = 16;
const MAX_RUNTIME_METADATA_ANCESTORS = 32;
const SOURCE_FILE = "Solution.java";
const RUNNER_CLASS = "BamQuestRunner";
const REQUEST_FIELDS = new Set(["requestId", "questId", "revision", "source"]);
const LONG_PATTERN = /^(?:0|-?[1-9][0-9]*)$/;
const INT_PATTERN = /^(?:0|-?[1-9][0-9]*)$/;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ENTRY_POINT_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
// 실측된 커널에 한정한 활성화 후보이며, 장비 신원이나 공식 OS 지원을 보증하지 않는다.
const ISOLATION_PROTOTYPE_VALIDATED = true;
const CODING_TEST_PROTOTYPE_VALIDATED = true;
let isolationRuntimePoisoned = false;
const MAX_LONG = 9_223_372_036_854_775_807n;
const MIN_LONG = -9_223_372_036_854_775_808n;
const MIN_INT = -2_147_483_648;
const MAX_INT = 2_147_483_647;
const ARRAY_SIGNATURES = Object.freeze({
  "quest-java-bridge-arr-01": Object.freeze({
    entryPoint: "solve",
    signature: "int-array-int-int-to-int-array",
    parameters: Object.freeze([["readings", "int[]"], ["slotNumber", "int"], ["correctedValue", "int"]]),
    returns: "int[]",
    observations: true,
  }),
  "quest-java-bridge-arr-02": Object.freeze({
    entryPoint: "solve",
    signature: "int-array-int-int-to-int",
    parameters: Object.freeze([["values", "int[]"], ["minimum", "int"], ["maximum", "int"]]),
    returns: "int",
    observations: false,
  }),
  "quest-java-bridge-que-01": Object.freeze({
    entryPoint: "solve",
    signature: "int-array-to-int-array",
    parameters: Object.freeze([["order", "int[]"]]),
    returns: "int[]",
    observations: true,
  }),
});
const OUTCOMES = [
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

export const JAVA_RUNTIME_LIMITS = Object.freeze({
  maxSourceBytes: 20 * 1024,
  maxTests: 6,
  compileTimeoutMs: 10_000,
  testTimeoutMs: 3_000,
  maxProcessOutputBytes: 32 * 1024,
  maxProtocolBytes: 4 * 1024,
  maxArrayProtocolBytes: 2 * 1024 * 1024,
  maxArrayInputBytes: 400_012,
  maxArrayLength: 100_000,
  maxCompileFilesBytes: 1024 * 1024,
  compileRssBytes: 512 * 1024 * 1024,
  runtimeRssBytes: 256 * 1024 * 1024,
  monitorIntervalMs: 50,
  forceKillDelayMs: 500,
  reapDeadlineMs: 1_000,
});

function createError(type, message, learnerMessage = message) {
  return { type, message, learnerMessage };
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function readRequest(request, fields = REQUEST_FIELDS, idField = "questId") {
  if (!isPlainRecord(request)) throw new TypeError("Java 실행 요청은 일반 객체여야 합니다.");

  const copy = {};
  const found = new Set();
  for (const key of Reflect.ownKeys(request)) {
    if (typeof key !== "string" || !fields.has(key)) {
      throw new TypeError(`Java 실행 요청에 허용되지 않은 필드가 있습니다: ${String(key)}`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(request, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`Java 실행 요청.${key}는 값 필드여야 합니다.`);
    }
    found.add(key);
    copy[key] = descriptor.value;
  }

  for (const field of fields) {
    if (!found.has(field)) throw new TypeError(`Java 실행 요청.${field}는 필수 필드입니다.`);
  }
  if (typeof copy.requestId !== "string" || !ID_PATTERN.test(copy.requestId)) {
    throw new TypeError("Java 실행 요청.requestId 형식이 올바르지 않습니다.");
  }
  if (typeof copy[idField] !== "string" || !ID_PATTERN.test(copy[idField])) {
    throw new TypeError(`Java 실행 요청.${idField} 형식이 올바르지 않습니다.`);
  }
  if (!Number.isSafeInteger(copy.revision) || copy.revision <= 0) {
    throw new TypeError("Java 실행 요청.revision은 양의 안전한 정수여야 합니다.");
  }
  if (typeof copy.source !== "string") {
    throw new TypeError("Java 실행 요청.source는 문자열이어야 합니다.");
  }
  if (Buffer.byteLength(copy.source, "utf8") > JAVA_RUNTIME_LIMITS.maxSourceBytes) {
    throw new TypeError(`Java 실행 요청.source는 UTF-8 ${JAVA_RUNTIME_LIMITS.maxSourceBytes}바이트 이하여야 합니다.`);
  }
  return Object.freeze(copy);
}

function isJavaInt(value, minimum = MIN_INT, maximum = MAX_INT) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

function isDenseArray(value) {
  return (
    Array.isArray(value)
    && Object.keys(value).length === value.length
    && Object.keys(value).every((key, index) => key === String(index))
  );
}

function readIntArray(value, label, { minimumLength = 0, maximumLength, minimum, maximum }) {
  if (
    !isDenseArray(value)
    || value.length < minimumLength
    || value.length > maximumLength
  ) {
    throw new TypeError(`${label} 배열 길이가 올바르지 않습니다.`);
  }
  const copy = value.map((item, index) => {
    if (!isJavaInt(item, minimum, maximum)) {
      throw new TypeError(`${label}[${index}]가 허용된 int 범위를 벗어났습니다.`);
    }
    return item;
  });
  return Object.freeze(copy);
}

function readTrustedArrayArgs(args, signature, label) {
  if (!isDenseArray(args)) throw new TypeError(`${label}.args는 빈 항목 없는 배열이어야 합니다.`);
  if (signature === "int-array-int-int-to-int-array") {
    if (args.length !== 3) throw new TypeError(`${label}.args 개수가 올바르지 않습니다.`);
    const readings = readIntArray(args[0], `${label}.args[0]`, {
      minimumLength: 1,
      maximumLength: 100,
      minimum: -1000,
      maximum: 1000,
    });
    if (!isJavaInt(args[1], 1, readings.length) || !isJavaInt(args[2], -1000, 1000)) {
      throw new TypeError(`${label}.args의 위치 또는 수정값 범위가 올바르지 않습니다.`);
    }
    return Object.freeze([readings, args[1], args[2]]);
  }
  if (signature === "int-array-int-int-to-int") {
    if (args.length !== 3) throw new TypeError(`${label}.args 개수가 올바르지 않습니다.`);
    const values = readIntArray(args[0], `${label}.args[0]`, {
      maximumLength: 1000,
      minimum: -10_000,
      maximum: 10_000,
    });
    if (!isJavaInt(args[1]) || !isJavaInt(args[2]) || args[1] > args[2]) {
      throw new TypeError(`${label}.args의 닫힌 구간 범위가 올바르지 않습니다.`);
    }
    return Object.freeze([values, args[1], args[2]]);
  }
  if (signature === "int-array-to-int-array") {
    if (args.length !== 1) throw new TypeError(`${label}.args 개수가 올바르지 않습니다.`);
    return Object.freeze([readIntArray(args[0], `${label}.args[0]`, {
      maximumLength: JAVA_RUNTIME_LIMITS.maxArrayLength,
      minimum: -1_000_000,
      maximum: 1_000_000,
    })]);
  }
  throw new TypeError("지원하지 않는 Java 배열 signature입니다.");
}

function readTrustedObservations(value, label) {
  if (
    !isPlainRecord(value)
    || Object.keys(value).length !== 2
    || value.argument0Unchanged !== true
    || value.returnNotArgument0 !== true
  ) {
    throw new TypeError(`${label}.observations 계약이 올바르지 않습니다.`);
  }
  return Object.freeze({ argument0Unchanged: true, returnNotArgument0: true });
}

function readTrustedTest(test, index, runtimeContract, testIds) {
  const label = `Java Quest publicTests[${index}]`;
  const allowedFields = new Set([
    "id",
    "label",
    "args",
    "expected",
    ...(runtimeContract.observations ? ["observations"] : []),
  ]);
  if (
    !isPlainRecord(test)
    || Object.keys(test).length !== allowedFields.size
    || Object.keys(test).some((key) => !allowedFields.has(key))
    || typeof test.id !== "string"
    || !ID_PATTERN.test(test.id)
    || typeof test.label !== "string"
    || test.label.length === 0
  ) {
    throw new TypeError(`${label} 필드가 올바르지 않습니다.`);
  }
  if (testIds.has(test.id)) throw new TypeError(`${label}.id가 중복됩니다.`);
  testIds.add(test.id);
  if (Buffer.byteLength(JSON.stringify(test), "utf8") > 4 * 1024 * 1024) {
    throw new TypeError(`${label}은 UTF-8 4 MiB 이하여야 합니다.`);
  }

  if (runtimeContract.signature === null) {
    if (!isDenseArray(test.args) || test.args.length !== 3 || !test.args.every((value) => isJavaInt(value))) {
      throw new TypeError(`${label}.args는 int 세 개여야 합니다.`);
    }
    if (typeof test.expected !== "string" || !LONG_PATTERN.test(test.expected)) {
      throw new TypeError(`${label}.expected는 정규 10진 long 문자열이어야 합니다.`);
    }
    const expected = BigInt(test.expected);
    if (expected < MIN_LONG || expected > MAX_LONG) {
      throw new TypeError(`${label}.expected가 long 범위를 벗어났습니다.`);
    }
    return Object.freeze({
      id: test.id,
      label: test.label,
      args: Object.freeze([...test.args]),
      expected: test.expected,
      observations: null,
    });
  }

  const args = readTrustedArrayArgs(test.args, runtimeContract.signature, label);
  let expected;
  if (runtimeContract.returns === "int") {
    if (!isJavaInt(test.expected)) throw new TypeError(`${label}.expected는 int여야 합니다.`);
    expected = test.expected;
  } else {
    expected = readIntArray(test.expected, `${label}.expected`, {
      maximumLength: JAVA_RUNTIME_LIMITS.maxArrayLength,
      minimum: MIN_INT,
      maximum: MAX_INT,
    });
    if (expected.length !== args[0].length) {
      throw new TypeError(`${label}.expected 길이는 첫 입력 배열 길이와 같아야 합니다.`);
    }
  }
  return Object.freeze({
    id: test.id,
    label: test.label,
    args,
    expected,
    observations: runtimeContract.observations
      ? readTrustedObservations(test.observations, label)
      : null,
  });
}

function readTrustedQuest(manifest, request) {
  if (
    !isPlainRecord(manifest)
    || manifest.contractVersion !== 1
    || manifest.languageId !== "java"
    || manifest.evaluationKind !== "java-static-method-v1"
    || !Array.isArray(manifest.quests)
  ) {
    throw new TypeError("신뢰한 Java Quest manifest 계약이 올바르지 않습니다.");
  }

  const quest = manifest.quests.find((candidate) => (
    isPlainRecord(candidate)
    && candidate.id === request.questId
    && candidate.revision === request.revision
  ));
  if (!quest) throw new TypeError("요청한 Java Quest ID 또는 revision이 bundle과 일치하지 않습니다.");
  const runtimeContract = quest.id === "quest-java-total-price"
    ? Object.freeze({
      entryPoint: "totalPrice",
      signature: null,
      parameters: Object.freeze([["price", "int"], ["quantity", "int"], ["shippingFee", "int"]]),
      returns: "long",
      observations: false,
    })
    : ARRAY_SIGNATURES[quest.id];
  if (!runtimeContract) throw new TypeError("승인되지 않은 Java Quest입니다.");
  const actualParameters = quest.functionContract?.parameters?.map((parameter) => [
    parameter?.name,
    parameter?.type,
  ]);
  if (
    !isPlainRecord(quest.javaContract)
    || quest.javaContract.sourceFile !== SOURCE_FILE
    || quest.javaContract.className !== "Solution"
    || quest.entryPoint !== runtimeContract.entryPoint
    || !ENTRY_POINT_PATTERN.test(quest.entryPoint)
    || JSON.stringify(actualParameters) !== JSON.stringify(runtimeContract.parameters)
    || quest.functionContract?.returns?.type !== runtimeContract.returns
  ) {
    throw new TypeError("Java Quest 실행 진입점 계약이 올바르지 않습니다.");
  }
  if (
    !Array.isArray(quest.publicTests)
    || quest.publicTests.length < 1
    || quest.publicTests.length > JAVA_RUNTIME_LIMITS.maxTests
  ) {
    throw new TypeError(`Java Quest에는 공개 테스트가 1~${JAVA_RUNTIME_LIMITS.maxTests}개 필요합니다.`);
  }

  const testIds = new Set();
  const tests = quest.publicTests.map((test, index) => (
    readTrustedTest(test, index, runtimeContract, testIds)
  ));

  return Object.freeze({ ...runtimeContract, tests: Object.freeze(tests) });
}

function assertAbortSignal(signal) {
  if (
    signal !== undefined
    && (
      signal === null
      || typeof signal !== "object"
      || typeof signal.aborted !== "boolean"
      || typeof signal.addEventListener !== "function"
      || typeof signal.removeEventListener !== "function"
    )
  ) {
    throw new TypeError("signal은 AbortSignal이어야 합니다.");
  }
}

function isWithin(parentPath, childPath) {
  const pathFromParent = relative(parentPath, childPath);
  return pathFromParent === "" || (!pathFromParent.startsWith(`..${sep}`) && pathFromParent !== "..");
}

function matchesValidatedKernel(release, version) {
  return release === "23.6.0"
    && version === "Darwin Kernel Version 23.6.0: Wed Nov  5 21:50:27 PST 2025; root:xnu-10063.141.1.708.2~1/RELEASE_ARM64_T6020";
}

async function resolveBundlePaths(bundleRoot, { requireQuestClass = true } = {}) {
  if (typeof bundleRoot !== "string" || !isAbsolute(bundleRoot)) {
    throw new TypeError("bundleRoot는 절대 경로여야 합니다.");
  }

  let validatedKernel = false;
  try {
    validatedKernel = matchesValidatedKernel(osRelease(), osVersion());
  } catch {
    // 커널 지문을 읽지 못하면 검증된 환경으로 취급하지 않는다.
  }
  if (!validatedKernel) {
    throw Object.assign(new Error("검증된 Java 실행 환경과 일치하지 않습니다."), {
      code: "java_environment_mismatch",
    });
  }

  const resourcesRoot = await realpath(resolve(bundleRoot));
  const jdkRoot = await realpath(join(resourcesRoot, "runtime", "jdk", "Contents", "Home"));
  const javaExecutable = await realpath(join(jdkRoot, "bin", "java"));
  const javacExecutable = await realpath(join(jdkRoot, "bin", "javac"));
  const runnerRoot = await realpath(join(resourcesRoot, "runtime", "java-runner"));
  const runnerClass = requireQuestClass
    ? await realpath(join(runnerRoot, `${RUNNER_CLASS}.class`)) : null;

  if (!isWithin(resourcesRoot, jdkRoot) || !isWithin(resourcesRoot, runnerRoot)) {
    throw new Error("bundle Java 경로가 Resources 밖을 가리킵니다.");
  }
  for (const executable of [javaExecutable, javacExecutable]) {
    if (!isWithin(jdkRoot, executable)) throw new Error("bundle JDK 실행 파일이 JDK 밖을 가리킵니다.");
    await access(executable, fsConstants.X_OK);
  }
  if (runnerClass && !isWithin(runnerRoot, runnerClass)) throw new Error("Java runner class가 runner 경로 밖을 가리킵니다.");
  const release = await readFile(join(jdkRoot, "release"), "utf8");
  if (
    process.platform !== "darwin"
    || process.arch !== "arm64"
    || !/^JAVA_VERSION="25\.0\.4\.1"$/mu.test(release)
    || !/^OS_ARCH="aarch64"$/mu.test(release)
  ) {
    throw new Error("bundle JDK가 검증된 macOS arm64 Java 25.0.4.1과 일치하지 않습니다.");
  }
  await access(SANDBOX_EXECUTABLE, fsConstants.X_OK);

  return { resourcesRoot, jdkRoot, javaExecutable, javacExecutable, runnerRoot };
}

export async function getJavaQuestCapabilities({ bundleRoot } = {}) {
  if (!ISOLATION_PROTOTYPE_VALIDATED || isolationRuntimePoisoned) {
    return {
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: false,
      reason: "이 macOS 환경에서 Java 격리 실행을 안전하게 완료하지 못했습니다.",
    };
  }

  try {
    await resolveBundlePaths(bundleRoot);
    await access(join(MODULE_ROOT, "profiles", "compile.sb"), fsConstants.R_OK);
    await access(join(MODULE_ROOT, "profiles", "runtime.sb"), fsConstants.R_OK);
    return {
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: true,
    };
  } catch (error) {
    return {
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: false,
      reason: error?.code === "java_environment_mismatch"
        ? "검증된 Java 실행 환경과 일치하지 않습니다."
        : "번들 Java 실행 환경을 사용할 수 없습니다.",
    };
  }
}

function createEnvironment(homePath, tempPath) {
  return {
    HOME: homePath,
    TMPDIR: tempPath,
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
  };
}

function sandboxArguments(profileName, parameters, executable, executableArguments) {
  const args = ["-f", join(MODULE_ROOT, "profiles", profileName)];
  for (const [name, value] of Object.entries({ ...parameters, EXECUTABLE: executable })) {
    args.push("-D", `${name}=${value}`);
  }
  args.push(executable, ...executableArguments);
  return args;
}

function addMetadataAncestorParameters(parameters, rootPaths, maximumAncestors, limitMessage) {
  const ancestors = new Set();
  for (const directoryPath of rootPaths) {
    let currentPath = directoryPath;
    while (true) {
      ancestors.add(currentPath);
      const parentPath = dirname(currentPath);
      if (parentPath === currentPath) break;
      currentPath = parentPath;
    }
  }
  const orderedAncestors = [...ancestors].sort((left, right) => (
    left.length - right.length || left.localeCompare(right)
  ));
  if (orderedAncestors.length > maximumAncestors) throw new Error(limitMessage);

  for (let index = 0; index < maximumAncestors; index += 1) {
    parameters[`METADATA_ANCESTOR_${String(index + 1).padStart(2, "0")}`] = (
      orderedAncestors[index] ?? parameters.JDK_ROOT
    );
  }
  return parameters;
}

function compileSandboxParameters(jdkRoot, javacExecutable, workRoot) {
  if (
    typeof jdkRoot !== "string"
    || jdkRoot.length === 0
    || !isAbsolute(jdkRoot)
    || typeof javacExecutable !== "string"
    || javacExecutable.length === 0
    || !isAbsolute(javacExecutable)
  ) {
    throw new TypeError("bundle JDK와 javac 경로는 비어 있지 않은 절대 경로여야 합니다.");
  }
  const normalizedJdkRoot = resolve(jdkRoot);
  const normalizedJavacExecutable = resolve(javacExecutable);
  if (normalizedJavacExecutable !== join(normalizedJdkRoot, "bin", "javac")) {
    throw new Error("bundle javac 경로가 trusted JDK bin/javac 계약과 다릅니다.");
  }

  return addMetadataAncestorParameters(
    { JDK_ROOT: normalizedJdkRoot, WORK_ROOT: workRoot },
    [normalizedJdkRoot, dirname(normalizedJavacExecutable)],
    MAX_COMPILE_METADATA_ANCESTORS,
    "bundle JDK 경로의 sandbox metadata ancestor 깊이가 제한을 넘었습니다.",
  );
}

function runtimeSandboxParameters({
  jdkRoot,
  executable,
  runnerRoot,
  classesRoot,
  homeRoot,
  tempRoot,
} = {}) {
  const rootPaths = [jdkRoot, executable, runnerRoot, classesRoot, homeRoot, tempRoot];
  if (rootPaths.some((path) => (
    typeof path !== "string"
    || path.length === 0
    || !isAbsolute(path)
    || resolve(path) !== path
  ))) {
    throw new TypeError("runtime sandbox 경로는 비어 있지 않은 정규 절대 경로여야 합니다.");
  }
  if (executable !== join(jdkRoot, "bin", "java")) {
    throw new Error("bundle java 경로가 trusted JDK bin/java 계약과 다릅니다.");
  }

  return addMetadataAncestorParameters(
    { JDK_ROOT: jdkRoot },
    [jdkRoot, dirname(executable), runnerRoot, classesRoot, homeRoot, tempRoot],
    MAX_RUNTIME_METADATA_ANCESTORS,
    "runtime sandbox metadata ancestor 깊이가 제한을 넘었습니다.",
  );
}

function terminateProcessGroup(child, signalName) {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, signalName);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function readProcessGroup(pid, { signal } = {}, {
  spawnProcess = spawn,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
} = {}) {
  return new Promise((resolveGroup, rejectGroup) => {
    let observer;
    let output = "";
    let settled = false;
    let stopError = null;
    let closeObserved = false;
    let deadlineId;
    let reapDeadlineId;

    const finish = (error, group = null) => {
      if (settled) return;
      settled = true;
      clearTimeoutFn(deadlineId);
      clearTimeoutFn(reapDeadlineId);
      signal?.removeEventListener("abort", handleAbort);
      if (error) rejectGroup(error);
      else resolveGroup(group);
    };

    const stopObserver = (error) => {
      if (settled || stopError) return;
      stopError = error;
      reapDeadlineId = setTimeoutFn(() => {
        const unreapedError = new Error("Process group observer did not close.");
        unreapedError.code = "observer_unreaped";
        unreapedError.observerCloseObserved = false;
        finish(unreapedError);
      }, PROCESS_OBSERVER_REAP_DEADLINE_MS);
      try {
        observer.kill("SIGKILL");
      } catch (killError) {
        if (killError?.code !== "ESRCH") stopError = killError;
      }
    };

    const handleAbort = () => stopObserver(new Error("Process group observation was cancelled."));

    try {
      observer = spawnProcess(PS_EXECUTABLE, ["-axo", "pid=,pgid=,rss="], {
        env: { LANG: "C", LC_ALL: "C" },
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch (error) {
      finish(error);
      return;
    }

    observer.stdout.setEncoding("utf8");
    observer.stdout.on("data", (chunk) => {
      if (settled || stopError) return;
      output += chunk;
      if (Buffer.byteLength(output, "utf8") > PROCESS_OBSERVER_MAX_OUTPUT_BYTES) {
        stopObserver(new Error("Process group observation exceeded its output limit."));
      }
    });
    observer.once("error", (error) => {
      stopObserver(error);
    });
    observer.once("close", (code) => {
      if (settled) return;
      closeObserved = true;
      if (stopError) {
        stopError.observerCloseObserved = true;
        finish(stopError);
        return;
      }
      if (code !== 0) {
        const error = new Error("Process group observer failed.");
        error.observerCloseObserved = true;
        finish(error);
        return;
      }

      let rssKibibytes = 0;
      let present = false;
      for (const line of output.split("\n")) {
        if (line.trim() === "") continue;
        const match = line.match(/^\s*([0-9]+)\s+([0-9]+)\s+([0-9]+)\s*$/u);
        if (!match) {
          const error = new Error("Process group observer returned invalid data.");
          error.observerCloseObserved = true;
          finish(error);
          return;
        }
        const processGroupId = Number.parseInt(match[2], 10);
        if (processGroupId !== pid) continue;
        const processRssKibibytes = Number.parseInt(match[3], 10);
        if (!Number.isSafeInteger(processRssKibibytes)) {
          const error = new Error("Process group observer returned invalid RSS data.");
          error.observerCloseObserved = true;
          finish(error);
          return;
        }
        present = true;
        rssKibibytes += processRssKibibytes;
        if (!Number.isSafeInteger(rssKibibytes)) {
          const error = new Error("Process group RSS exceeded the safe integer range.");
          error.observerCloseObserved = true;
          finish(error);
          return;
        }
      }
      finish(null, { present, rssBytes: rssKibibytes * 1024, observerCloseObserved: closeObserved });
    });
    deadlineId = setTimeoutFn(() => {
      stopObserver(new Error("Process group observation timed out."));
    }, PROCESS_OBSERVER_TIMEOUT_MS);
    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted) handleAbort();
  });
}

async function directorySize(rootPath) {
  let total = 0;
  const pending = [rootPath];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const childPath = join(current, entry.name);
      if (entry.isSymbolicLink()) {
        total += (await stat(childPath)).size;
      } else if (entry.isDirectory()) {
        pending.push(childPath);
      } else if (entry.isFile()) {
        total += (await stat(childPath)).size;
      }
      if (total > JAVA_RUNTIME_LIMITS.maxCompileFilesBytes) return total;
    }
  }
  return total;
}

function encodeArrayInput(signature, args) {
  const trustedArgs = readTrustedArrayArgs(args, signature, "Java runner 입력");
  const extraInts = signature === "int-array-to-int-array" ? 0 : 2;
  const buffer = Buffer.alloc(4 * (1 + trustedArgs[0].length + extraInts));
  let offset = 0;
  buffer.writeInt32BE(trustedArgs[0].length, offset);
  offset += 4;
  for (const value of trustedArgs[0]) {
    buffer.writeInt32BE(value, offset);
    offset += 4;
  }
  for (const value of trustedArgs.slice(1)) {
    buffer.writeInt32BE(value, offset);
    offset += 4;
  }
  if (buffer.length > JAVA_RUNTIME_LIMITS.maxArrayInputBytes) {
    throw new TypeError("Java runner 배열 입력이 최대 binary record 크기를 넘었습니다.");
  }
  return buffer;
}

function runSandboxedProcess({
  profileName,
  parameters,
  executable,
  args,
  environment,
  timeoutMs,
  rssLimitBytes,
  signal,
  compileOutputPath,
  protocol = false,
  input = null,
  maxProtocolBytes = JAVA_RUNTIME_LIMITS.maxProtocolBytes,
  onChildSpawn,
}, dependencies = {}) {
  if (isolationRuntimePoisoned) {
    return Promise.resolve({
      exitCode: null,
      exitSignal: null,
      terminationReason: "runtime_poisoned",
      terminationEvidence: Object.freeze({
        childCreated: false,
        pid: null,
        exitObserved: false,
        closeObserved: false,
        processGroupAbsent: null,
        processObserverCloseObserved: null,
        observerUnreaped: false,
        cleanupFailed: false,
      }),
      stdout: "",
      stderr: "",
      protocolOutput: Buffer.alloc(0),
      durationMs: 0,
      startError: new Error("Java isolation runtime is poisoned."),
    });
  }

  const {
    spawnProcess = spawn,
    terminateChildGroup = terminateProcessGroup,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
  } = dependencies;
  const inspectChildProcessGroup = dependencies.inspectChildProcessGroup
    ?? dependencies.readChildProcessGroup
    ?? dependencies.observeProcessGroup
    ?? (dependencies.readChildResidentBytes
      ? async (pid) => ({
        present: false,
        rssBytes: await dependencies.readChildResidentBytes(pid),
        observerCloseObserved: true,
      })
      : readProcessGroup);
  const startedAt = performance.now();

  return new Promise((resolveProcess) => {
    let child;
    let settled = false;
    let finishing = false;
    let exitObserved = false;
    let closeObserved = false;
    let processGroupAbsent = null;
    let processObserverCloseObserved = null;
    let observerUnreaped = false;
    let cleanupFailed = false;
    let terminationReason = null;
    let startError = null;
    let observedExitCode = null;
    let observedExitSignal = null;
    let outputBytes = 0;
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let protocolOutput = Buffer.alloc(0);
    let monitorBusy = false;
    let terminationStarted = false;
    let observerController = null;
    let observerPromise = null;
    let forceKillId;
    let reapDeadlineId;
    let timeoutId;
    let monitorId;
    let spawnRecordPromise;

    const finish = async () => {
      if (settled || finishing) return;
      finishing = true;
      clearTimeoutFn(timeoutId);
      clearIntervalFn(monitorId);
      clearTimeoutFn(forceKillId);
      clearTimeoutFn(reapDeadlineId);
      signal?.removeEventListener("abort", handleAbort);
      observerController?.abort();
      try {
        await observerPromise;
        await spawnRecordPromise;
      } catch {
        // A cancelled or failed observer is already represented by processGroupAbsent.
      }
      settled = true;
      resolveProcess({
        exitCode: observedExitCode,
        exitSignal: observedExitSignal,
        terminationReason,
        terminationEvidence: Object.freeze({
          childCreated: Number.isSafeInteger(child?.pid),
          pid: Number.isSafeInteger(child?.pid) ? child.pid : null,
          exitObserved,
          closeObserved,
          processGroupAbsent,
          processObserverCloseObserved,
          observerUnreaped,
          cleanupFailed,
        }),
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8"),
        protocolOutput,
        durationMs: Math.max(0, Math.round((performance.now() - startedAt) * 10) / 10),
        startError,
      });
    };

    const observeGroup = () => {
      const startedBeforeExitOrClose = !exitObserved && !closeObserved;
      if (!Number.isSafeInteger(child?.pid)) {
        return Promise.resolve({
          observation: { present: false, rssBytes: 0 },
          startedBeforeExitOrClose,
        });
      }
      if (observerPromise) return observerPromise;
      observerController = new AbortController();
      const currentPromise = Promise.resolve().then(() => inspectChildProcessGroup(
        child.pid,
        { signal: observerController.signal },
      )).then((observation) => ({ observation, startedBeforeExitOrClose }));
      observerPromise = currentPromise.finally(() => {
        if (observerPromise === currentPromise || observerPromise === wrappedPromise) {
          observerController = null;
          observerPromise = null;
        }
      });
      const wrappedPromise = observerPromise;
      return wrappedPromise;
    };

    const observeGroupForTermination = async () => {
      let observed = await observeGroup();
      if (
        observed.startedBeforeExitOrClose
        && (exitObserved || closeObserved)
        && !settled
        && !finishing
      ) {
        observed = await observeGroup();
      }
      return observed.observation;
    };

    const markUnconfirmed = async () => {
      if (settled || finishing) return;
      try {
        const observation = await observeGroupForTermination();
        if (settled || finishing) return;
        processObserverCloseObserved = observation.observerCloseObserved === true;
        processGroupAbsent = processObserverCloseObserved && observation.present === false;
      } catch (error) {
        if (settled || finishing) return;
        processObserverCloseObserved = error?.observerCloseObserved === true;
        observerUnreaped ||= error?.code === "observer_unreaped";
        processGroupAbsent = null;
      }
      if (settled || finishing) return;
      if (processGroupAbsent && exitObserved && closeObserved) {
        await finish();
        return;
      }
      isolationRuntimePoisoned = true;
      terminationReason = exitObserved && !closeObserved
        ? "close_timeout"
        : "unreaped_process";
      child?.unref?.();
      for (const stream of child?.stdio ?? []) {
        stream?.destroy?.();
        stream?.unref?.();
      }
      await finish();
    };

    const armReapDeadline = () => {
      if (settled || finishing || reapDeadlineId !== undefined) return;
      reapDeadlineId = setTimeoutFn(() => {
        reapDeadlineId = undefined;
        void markUnconfirmed();
      }, JAVA_RUNTIME_LIMITS.reapDeadlineMs);
    };

    const stop = (reason) => {
      if (settled || finishing || terminationStarted || !Number.isSafeInteger(child?.pid)) return;
      terminationStarted = true;
      terminationReason ??= reason;
      clearTimeoutFn(timeoutId);
      clearIntervalFn(monitorId);
      clearTimeoutFn(reapDeadlineId);
      reapDeadlineId = undefined;
      try {
        terminateChildGroup(child, "SIGTERM");
      } catch {
        cleanupFailed = true;
        isolationRuntimePoisoned = true;
        terminationReason = "cleanup_error";
      }
      forceKillId = setTimeoutFn(() => {
        forceKillId = undefined;
        if (settled || finishing) return;
        try {
          terminateChildGroup(child, "SIGKILL");
        } catch {
          cleanupFailed = true;
          isolationRuntimePoisoned = true;
          terminationReason = "cleanup_error";
        }
        armReapDeadline();
        void confirmTermination();
      }, JAVA_RUNTIME_LIMITS.forceKillDelayMs);
    };

    const confirmTermination = async () => {
      if (settled || finishing || !Number.isSafeInteger(child?.pid)) return;
      try {
        const observation = await observeGroupForTermination();
        if (settled || finishing) return;
        processObserverCloseObserved = observation.observerCloseObserved === true;
        processGroupAbsent = processObserverCloseObserved && observation.present === false;
        if (processGroupAbsent && exitObserved && closeObserved) {
          await finish();
        } else if (observation.present && (exitObserved || closeObserved)) {
          stop("lingering_process");
        }
      } catch (error) {
        if (settled || finishing) return;
        processObserverCloseObserved = error?.observerCloseObserved === true;
        observerUnreaped ||= error?.code === "observer_unreaped";
        processGroupAbsent = null;
        stop("monitor_error");
      }
    };

    const appendOutput = (target, chunk) => {
      if (settled || finishing) return target;
      outputBytes += chunk.length;
      if (outputBytes > JAVA_RUNTIME_LIMITS.maxProcessOutputBytes) {
        stop("output_limit");
        return target;
      }
      return Buffer.concat([target, chunk], target.length + chunk.length);
    };

    const handleAbort = () => stop("cancelled");

    try {
      child = spawnProcess(
        SANDBOX_EXECUTABLE,
        sandboxArguments(profileName, parameters, executable, args),
        {
          cwd: parameters.WORK_ROOT ?? parameters.CLASSES_ROOT,
          detached: true,
          env: environment,
          stdio: protocol
            ? [input ? "pipe" : "ignore", "pipe", "pipe", "pipe"]
            : ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      startError = error;
      void finish();
      return;
    }

    child.stdout.on("data", (chunk) => {
      stdout = appendOutput(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = appendOutput(stderr, chunk);
    });
    if (protocol) {
      child.stdio[3].on("data", (chunk) => {
        if (settled) return;
        if (protocolOutput.length + chunk.length > maxProtocolBytes + 4) {
          stop("invalid_protocol");
          return;
        }
        protocolOutput = Buffer.concat(
          [protocolOutput, chunk],
          protocolOutput.length + chunk.length,
        );
      });
    }
    if (input) {
      child.stdin.once("error", () => stop("input_error"));
      child.stdin.end(input, (error) => {
        if (error) stop("input_error");
      });
    }

    child.once("error", (error) => {
      if (settled || finishing) return;
      startError = error;
      if (Number.isSafeInteger(child.pid)) stop("child_error");
      else void finish();
    });
    child.once("exit", (code, exitSignal) => {
      if (settled || finishing) return;
      exitObserved = true;
      observedExitCode = code;
      observedExitSignal = exitSignal;
      if (!terminationStarted) armReapDeadline();
      void confirmTermination();
    });
    child.once("close", () => {
      if (settled || finishing) return;
      closeObserved = true;
      if (!terminationStarted) armReapDeadline();
      void confirmTermination();
    });

    if (Number.isSafeInteger(child.pid) && onChildSpawn) {
      spawnRecordPromise = Promise.resolve().then(() => onChildSpawn(child.pid)).catch(() => {
        cleanupFailed = true;
        isolationRuntimePoisoned = true;
        terminationReason ??= "spawn_record_failed";
        stop("spawn_record_failed");
      });
    }

    timeoutId = setTimeoutFn(() => stop("timeout"), timeoutMs);
    monitorId = setIntervalFn(async () => {
      if (
        settled
        || finishing
        || monitorBusy
        || exitObserved
        || closeObserved
        || terminationStarted
      ) return;
      monitorBusy = true;
      try {
        const { observation } = await observeGroup();
        if (
          settled
          || finishing
          || exitObserved
          || closeObserved
          || terminationStarted
        ) return;
        if (observation.rssBytes > rssLimitBytes) {
          stop("memory_limit");
          return;
        }
        if (compileOutputPath) {
          const compileFilesBytes = await directorySize(compileOutputPath);
          if (
            settled
            || finishing
            || exitObserved
            || closeObserved
            || terminationStarted
          ) return;
          if (compileFilesBytes > JAVA_RUNTIME_LIMITS.maxCompileFilesBytes) {
            stop("compile_files_limit");
          }
        }
      } catch (error) {
        if (settled || finishing) return;
        processObserverCloseObserved = error?.observerCloseObserved === true;
        observerUnreaped ||= error?.code === "observer_unreaped";
        if (
          !settled
          && !finishing
          && !exitObserved
          && !closeObserved
          && child.exitCode === null
          && child.signalCode === null
        ) {
          stop("monitor_error");
        }
      } finally {
        monitorBusy = false;
      }
    }, JAVA_RUNTIME_LIMITS.monitorIntervalMs);
    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted) handleAbort();
  });
}

function parseCanonicalInt(value) {
  if (!INT_PATTERN.test(value)) throw new Error("Java runner int 값이 정규 10진수가 아닙니다.");
  const parsed = Number(value);
  if (!isJavaInt(parsed)) throw new Error("Java runner int 값이 int32 범위를 벗어났습니다.");
  return parsed;
}

function parseProtocol(buffer, signature = null) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    throw new Error("Java runner 결과 프레임이 없습니다.");
  }
  const maxProtocolBytes = signature === null
    ? JAVA_RUNTIME_LIMITS.maxProtocolBytes
    : JAVA_RUNTIME_LIMITS.maxArrayProtocolBytes;
  const length = buffer.readUInt32BE(0);
  if (length < 1 || length > maxProtocolBytes || buffer.length !== length + 4) {
    throw new Error("Java runner 결과 프레임 길이가 올바르지 않습니다.");
  }
  const payload = buffer.subarray(4).toString("utf8");
  if (!Buffer.from(payload, "utf8").equals(buffer.subarray(4))) {
    throw new Error("Java runner 결과가 올바른 UTF-8이 아닙니다.");
  }
  const lines = payload.split("\n");
  const [status, value] = lines;
  if (status === "runtime_error" && lines.length === 2 && /^[A-Za-z0-9_-]+$/.test(value)) {
    const message = Buffer.from(value, "base64url").toString("utf8");
    if (
      message.length > 0
      && Buffer.byteLength(message, "utf8") <= 3072
      && Buffer.from(message, "utf8").toString("base64url") === value
    ) {
      return { status, message };
    }
  }
  if (signature === null) {
    if (status === "returned" && lines.length === 2 && LONG_PATTERN.test(value)) {
      const actual = BigInt(value);
      if (actual >= MIN_LONG && actual <= MAX_LONG) return { status, actual: value };
    }
    throw new Error("Java runner 결과 record 값이 올바르지 않습니다.");
  }
  if (signature === "int-array-int-int-to-int") {
    if (status === "returned_int" && lines.length === 2) {
      return { status, actual: parseCanonicalInt(value) };
    }
    throw new Error("Java runner 결과 record 값이 올바르지 않습니다.");
  }
  if (
    (signature === "int-array-int-int-to-int-array" || signature === "int-array-to-int-array")
    && status === "returned_int_array"
    && lines.length === 4
    && /^(?:true|false)$/.test(lines[2])
    && /^(?:true|false)$/.test(lines[3])
  ) {
    const items = value === "" ? [] : value.split(",");
    if (items.length > JAVA_RUNTIME_LIMITS.maxArrayLength) {
      throw new Error("Java runner 배열 결과가 최대 길이를 넘었습니다.");
    }
    return {
      status,
      actual: items.map(parseCanonicalInt),
      observations: {
        argument0Unchanged: lines[2] === "true",
        returnNotArgument0: lines[3] === "true",
      },
    };
  }
  throw new Error("Java runner 결과 record 값이 올바르지 않습니다.");
}

function baseTestResult(test) {
  return {
    testId: test.id,
    label: test.label,
    expected: test.expected,
    expectedDisplay: test.expected,
    actual: null,
    actualDisplay: null,
    hasActual: false,
    durationMs: 0,
    console: [],
    error: null,
    ...(test.observations ? {
      expectedObservations: test.observations,
      actualObservations: null,
      failedObservations: [],
    } : {}),
  };
}

function stoppedTestResult(test, outcome, message, durationMs = 0) {
  return {
    ...baseTestResult(test),
    outcome,
    durationMs,
    error: createError(outcome, message),
  };
}

function summarize(testResults) {
  const counts = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, 0]));
  for (const result of testResults) counts[result.outcome] += 1;
  const priority = [
    "cancelled",
    "engine_error",
    "timeout",
    "output_limit",
    "syntax_error",
    "runtime_error",
    "wrong_answer",
    "not_run",
  ];
  const outcome = priority.find((candidate) => counts[candidate] > 0) ?? "passed";
  const observationFailures = testResults.reduce(
    (total, result) => total + (result.failedObservations?.length ?? 0),
    0,
  );
  return { outcome, total: testResults.length, ...counts, observationFailures };
}

function createReport(request, tests, startedAt, error = null) {
  const summary = summarize(tests);
  return {
    requestId: request.requestId,
    contractVersion: 1,
    ...(request.problemId ? {
      problemId: request.problemId,
      problemRevision: request.revision,
      evaluationKind: CT_EVALUATION_KIND,
      mode: request.mode,
    } : { questId: request.questId, questRevision: request.revision }),
    languageId: "java",
    suite: "public",
    outcome: error ? "engine_error" : summary.outcome,
    tests,
    summary,
    durationMs: Math.max(0, Math.round((performance.now() - startedAt) * 10) / 10),
    limitsApplied: { ...JAVA_RUNTIME_LIMITS },
    error,
  };
}

async function finishJavaRun(report, workRoot, preserveWorkRoot, removeWorkRoot = rm) {
  if (!workRoot || preserveWorkRoot) return report;
  try {
    await removeWorkRoot(workRoot, { recursive: true, force: true });
    return report;
  } catch {
    isolationRuntimePoisoned = true;
    return {
      ...report,
      outcome: "engine_error",
      error: createError(
        "java_cleanup_error",
        "Java 작업 공간을 안전하게 정리하지 못했습니다.",
        "Java 실행 환경을 정리하지 못했습니다. 앱을 다시 시작해 주세요.",
      ),
    };
  }
}

function remainingNotRun(tests, startIndex) {
  return tests.slice(startIndex).map((test) => ({ ...baseTestResult(test), outcome: "not_run" }));
}

function compileFailureResult(test, execution) {
  if (execution.terminationReason === "cancelled") {
    return stoppedTestResult(test, "cancelled", "사용자가 Java 실행을 취소했습니다.", execution.durationMs);
  }
  if (execution.terminationReason === "timeout") {
    return stoppedTestResult(test, "timeout", "Java 컴파일 시간이 10초를 넘었습니다.", execution.durationMs);
  }
  if (execution.terminationReason === "output_limit") {
    return stoppedTestResult(test, "output_limit", "Java 컴파일 출력이 32 KiB를 넘었습니다.", execution.durationMs);
  }
  if (
    execution.startError
    || execution.terminationReason
    || execution.exitCode !== 1
    || /sandbox-exec:|Could not create the Java Virtual Machine/u.test(execution.stderr)
  ) {
    return stoppedTestResult(test, "engine_error", "Java 컴파일 실행기를 안전하게 완료하지 못했습니다.", execution.durationMs);
  }
  const diagnostic = `${execution.stdout}${execution.stderr}`.trim();
  return stoppedTestResult(
    test,
    "syntax_error",
    diagnostic.length > 0 ? diagnostic : "Java 소스를 컴파일하지 못했습니다.",
    execution.durationMs,
  );
}

function equalIntArrays(left, right) {
  return (
    Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index])
  );
}

function runtimeTestResult(test, execution, signature) {
  const reason = execution.terminationReason;
  if (reason === "cancelled") {
    return stoppedTestResult(test, "cancelled", "사용자가 Java 실행을 취소했습니다.", execution.durationMs);
  }
  if (reason === "timeout") {
    return stoppedTestResult(test, "timeout", "이 Java 테스트의 실행 시간이 3초를 넘었습니다.", execution.durationMs);
  }
  if (reason === "output_limit") {
    return stoppedTestResult(test, "output_limit", "Java 실행 출력이 32 KiB를 넘었습니다.", execution.durationMs);
  }
  if (reason === "memory_limit") {
    return stoppedTestResult(test, "runtime_error", "Java 실행이 256 MiB 메모리 제한을 넘었습니다.", execution.durationMs);
  }
  if (execution.startError || reason) {
    return stoppedTestResult(test, "engine_error", "Java 실행기를 안전하게 완료하지 못했습니다.", execution.durationMs);
  }

  let record;
  try {
    record = parseProtocol(execution.protocolOutput, signature);
  } catch {
    if (
      execution.exitCode !== 0
      && (
        /OutOfMemoryError|Cannot create worker GC thread/u.test(execution.stderr)
        || /OutOfMemoryError/u.test(execution.stdout)
      )
    ) {
      return stoppedTestResult(test, "runtime_error", "Java 실행이 메모리 제한으로 종료됐습니다.", execution.durationMs);
    }
    if (execution.exitCode !== 0) {
      return stoppedTestResult(test, "runtime_error", "학습자 코드가 Java 실행을 종료했습니다.", execution.durationMs);
    }
    return stoppedTestResult(test, "engine_error", "Java runner 결과를 읽지 못했습니다.", execution.durationMs);
  }

  if (execution.exitCode !== 0) {
    return stoppedTestResult(test, "engine_error", "Java runner가 결과 뒤 비정상 종료했습니다.", execution.durationMs);
  }
  if (record.status === "runtime_error") {
    return stoppedTestResult(test, "runtime_error", record.message, execution.durationMs);
  }
  const actualObservations = record.observations ?? null;
  const failedObservations = test.observations
    ? Object.keys(test.observations).filter((name) => actualObservations?.[name] !== true)
    : [];
  const valueMatches = Array.isArray(test.expected)
    ? equalIntArrays(record.actual, test.expected)
    : record.actual === test.expected;
  return {
    ...baseTestResult(test),
    outcome: valueMatches && failedObservations.length === 0 ? "passed" : "wrong_answer",
    actual: record.actual,
    actualDisplay: record.actual,
    hasActual: true,
    durationMs: execution.durationMs,
    ...(test.observations ? { actualObservations, failedObservations } : {}),
  };
}

function readCodingTestRequest(value) {
  const request = readRequest(value, new Set(["requestId", "problemId", "revision", "source", "mode"]), "problemId");
  if (!["run", "submit"].includes(request.mode)) throw new TypeError("CT mode must be run or submit");
  return request;
}

function readTrustedCodingTest(collection, request) {
  const { manifest } = createCodingTestArtifacts(collection);
  const problem = manifest.problems.find((candidate) => candidate.id === request.problemId && candidate.revision === request.revision);
  if (!problem) throw new TypeError("CT problem ID/revision does not match the installed collection");
  const tests = request.mode === "run" ? problem.tests.filter((test) => problem.runTestIds.includes(test.id)) : problem.tests;
  return { ...problem, codingTest: true, tests: tests.map((test) => ({ ...test, expected: test.assertionSource })) };
}

function parseCodingTestProtocol(buffer, expectedTestId) {
  if (!Buffer.isBuffer(buffer) || buffer.length > JAVA_RUNTIME_LIMITS.maxProtocolBytes) throw new Error("Invalid CT frame size");
  const text = buffer.toString("utf8");
  const fields = text.trimEnd().split("|");
  if (!text.endsWith("\n") || text.indexOf("\n") !== text.length - 1 || fields.length !== 15
    || fields[0] !== "BAMCT1" || fields[1] !== expectedTestId
    || !["passed", "wrong_answer", "runtime_error", "engine_error"].includes(fields[2])) throw new Error("Invalid CT frame identity");
  const names = ["discovered", "started", "finished", "passed", "wrongAnswer", "runtimeError", "skipped", "aborted", "infrastructure"];
  const counts = {};
  names.forEach((name, index) => {
    const token = fields[index + 3];
    if (!/^(?:0|[1-9][0-9]*)$/u.test(token) || !Number.isSafeInteger(Number(token))) throw new Error("Invalid CT count");
    counts[name] = Number(token);
  });
  if (![fields[12], fields[13]].every((value) => ["true", "false"].includes(value))) throw new Error("Invalid CT plan state");
  const messageBytes = Buffer.from(fields[14], "base64");
  if (messageBytes.toString("base64") !== fields[14] || messageBytes.length > 2048) throw new Error("Invalid CT message");
  const complete = fields[12] === "true" && fields[13] === "true" && counts.discovered > 0
    && counts.discovered === counts.started && counts.started === counts.finished
    && counts.finished === counts.passed + counts.wrongAnswer + counts.runtimeError
    && counts.skipped === 0 && counts.aborted === 0 && counts.infrastructure === 0;
  const outcome = !complete ? "engine_error" : counts.runtimeError ? "runtime_error" : counts.wrongAnswer ? "wrong_answer" : "passed";
  if (fields[2] !== outcome) throw new Error("Inconsistent CT result counts");
  return { outcome, invocations: counts, message: messageBytes.toString("utf8"), complete };
}

function codingTestResult(test, execution) {
  if (execution.startError || execution.terminationReason) return runtimeTestResult(test, execution);
  let result;
  try { result = parseCodingTestProtocol(execution.protocolOutput, test.id); }
  catch { return runtimeTestResult(test, { ...execution, protocolOutput: Buffer.alloc(0) }); }
  if (execution.exitCode !== 0) return stoppedTestResult(test, "engine_error", "CT runner가 결과 뒤 비정상 종료했습니다.", execution.durationMs);
  return { ...baseTestResult(test), outcome: result.outcome, durationMs: execution.durationMs, invocations: result.invocations,
    error: result.outcome === "passed" ? null : createError(result.outcome, result.message || "공개 JUnit 그룹을 완료하지 못했습니다.") };
}

export async function getJavaCodingTestCapabilities({ bundleRoot, trustedManifest } = {}) {
  const base = { contractVersion: 1, evaluationKind: CT_EVALUATION_KIND };
  if (!CODING_TEST_PROTOTYPE_VALIDATED) return { ...base, available: false, reason: "Java 코딩테스트 실행 검증이 아직 완료되지 않았습니다." };
  const questCapability = await getJavaQuestCapabilities({ bundleRoot });
  if (!questCapability.available) return { ...base, available: false, reason: questCapability.reason };
  try {
    const paths = await resolveBundlePaths(bundleRoot);
    const ctRoot = await realpath(join(paths.resourcesRoot, "runtime", "java-ct-runner"));
    if (!isWithin(paths.resourcesRoot, ctRoot)) throw new Error("CT root escaped bundle");
    await verifyCodingTestBundle(ctRoot, trustedManifest);
    return { ...base, available: true };
  } catch { return { ...base, available: false, reason: "번들 Java 코딩테스트 실행 환경을 사용할 수 없습니다." }; }
}

export async function runJavaCodingTest(value, { signal, bundleRoot, trustedManifest, executionGuard } = {}) {
  const request = readCodingTestRequest(value);
  assertAbortSignal(signal);
  const problem = readTrustedCodingTest(trustedManifest, request);
  return runJavaTask(request, problem, { signal, bundleRoot, trustedManifest, executionGuard });
}

// Packaging compilation uses the same bounded child/group supervision as learner javac.
export async function compileTrustedCodingTestSources({ bundleRoot, workRoot, sourcePaths, signal, executionGuard } = {}) {
  assertAbortSignal(signal);
  const paths = await resolveBundlePaths(bundleRoot, { requireQuestClass: false });
  const root = await realpath(workRoot);
  if (!Array.isArray(sourcePaths) || sourcePaths.length !== 146 || new Set(sourcePaths).size !== sourcePaths.length) throw new Error("Invalid CT build sources");
  for (const source of sourcePaths) if (!source.endsWith(".java") || !isWithin(root, await realpath(source))) throw new Error("CT build source escaped work root");
  const classesRoot = join(root, "classes");
  const homeRoot = join(root, "home");
  const tempRoot = join(root, "tmp");
  await Promise.all([mkdir(classesRoot), mkdir(homeRoot), mkdir(tempRoot)]);
  const args = ["-J-Xmx128m", `-J-Duser.home=${homeRoot}`, `-J-Djava.io.tmpdir=${tempRoot}`,
    "--release", "25", "-encoding", "UTF-8", "-proc:none", "-implicit:none",
    "-classpath", join(root, CT_JUNIT.file), "-d", classesRoot, ...sourcePaths];
  const execution = await runSourceGuardedProcess({
    profileName: "compile.sb", parameters: compileSandboxParameters(paths.jdkRoot, paths.javacExecutable, root),
    executable: paths.javacExecutable, args, environment: createEnvironment(homeRoot, tempRoot),
    timeoutMs: JAVA_RUNTIME_LIMITS.compileTimeoutMs, rssLimitBytes: JAVA_RUNTIME_LIMITS.compileRssBytes,
    signal, compileOutputPath: classesRoot,
  }, { executionGuard, kind: "prepare-coding-test", workRoot: root });
  const safe = terminationIsSafe(execution);
  if (!safe) isolationRuntimePoisoned = true;
  return { execution, safe, executable: paths.javacExecutable, args: execution.launchedArgs ?? args };
}

export async function compileTrustedQuestSource({ bundleRoot, workRoot, sourcePath, sourceSha256, signal, executionGuard } = {},
  { executeProcess = runSandboxedProcess } = {}) {
  assertAbortSignal(signal);
  if (typeof executionGuard?.reserve !== "function" || typeof executionGuard?.finish !== "function") {
    throw new Error("Java 준비 child의 독립 회수 guard가 필요합니다.");
  }
  const paths = await resolveBundlePaths(bundleRoot, { requireQuestClass: false });
  const root = await realpath(workRoot);
  const source = await realpath(sourcePath);
  if (source !== join(root, "JavaBamQuestRunner.java")
    || !/^[a-f0-9]{64}$/u.test(sourceSha256)
    || createHash("sha256").update(await readFile(source)).digest("hex") !== sourceSha256) {
    throw new Error("고정 Quest runner 소스가 준비 작업 공간의 예상 바이트와 다릅니다.");
  }
  const classesRoot = join(root, "classes");
  const emptyClasspath = join(root, "empty-classpath");
  const homeRoot = join(root, "home");
  const tempRoot = join(root, "tmp");
  await Promise.all([mkdir(classesRoot), mkdir(emptyClasspath), mkdir(homeRoot), mkdir(tempRoot)]);
  const args = ["-J-Xmx128m", `-J-Duser.home=${homeRoot}`, `-J-Djava.io.tmpdir=${tempRoot}`,
    "--release", "25", "-encoding", "UTF-8", "-proc:none", "-implicit:none",
    "-classpath", emptyClasspath, "-d", classesRoot, source];
  const execution = await runSourceGuardedProcess({
    profileName: "compile.sb", parameters: compileSandboxParameters(paths.jdkRoot, paths.javacExecutable, root),
    executable: paths.javacExecutable, args, environment: createEnvironment(homeRoot, tempRoot),
    timeoutMs: JAVA_RUNTIME_LIMITS.compileTimeoutMs, rssLimitBytes: JAVA_RUNTIME_LIMITS.compileRssBytes,
    signal, compileOutputPath: classesRoot,
  }, { executionGuard, kind: "prepare-quest", workRoot: root, executeProcess });
  const safe = terminationIsSafe(execution);
  if (!safe) isolationRuntimePoisoned = true;
  if (createHash("sha256").update(await readFile(source)).digest("hex") !== sourceSha256) {
    throw new Error("컴파일 중 Quest runner 소스가 변경됐습니다.");
  }
  return { execution, safe, executable: paths.javacExecutable, args: execution.launchedArgs, classesRoot, sourceSha256 };
}

function terminationIsSafe(execution) {
  const evidence = execution.terminationEvidence;
  return execution.guardSafe !== false && (evidence.childCreated === false || (evidence.exitObserved && evidence.closeObserved
    && evidence.processGroupAbsent === true && evidence.processObserverCloseObserved === true
    && evidence.observerUnreaped === false && evidence.cleanupFailed === false));
}

async function runSourceGuardedProcess(config, { executionGuard, kind, workRoot, executeProcess = runSandboxedProcess } = {}) {
  if (!executionGuard) return executeProcess(config);
  if (typeof executionGuard.reserve !== "function" || typeof executionGuard.recordSpawn !== "function"
    || typeof executionGuard.finish !== "function") {
    throw new Error("독립 Java 감독이 준비되지 않았습니다.");
  }
  let reservation;
  try {
    reservation = await executionGuard.reserve({ kind, workRoot, executable: config.executable });
  } catch (error) {
    isolationRuntimePoisoned = true;
    throw error;
  }
  if (!/^[a-f0-9]{64}$/u.test(reservation?.attemptId)) {
    isolationRuntimePoisoned = true;
    throw new Error("독립 Java 감독 nonce가 유효하지 않습니다.");
  }
  let execution;
  try {
    const ownedArguments = [
      `${basename(config.executable) === "javac" ? "-J-D" : "-D"}bam.owner.nonce=${reservation.attemptId}`,
      ...config.args,
    ];
    execution = await executeProcess({
      ...config,
      parameters: { BAM_OWNER_NONCE: reservation.attemptId, ...config.parameters },
      args: ownedArguments,
      onChildSpawn: (pid) => executionGuard.recordSpawn({ reservation, pid, pgid: pid }),
    });
    execution = { ...execution, launchedArgs: ownedArguments };
  } catch (error) {
    try { await executionGuard.finish({ reservation, execution: null }); }
    catch { /* The durable marker remains until independent recovery. */ }
    isolationRuntimePoisoned = true;
    throw error;
  }
  try {
    const independentlyReaped = await executionGuard.finish({ reservation, execution });
    if (independentlyReaped !== true) isolationRuntimePoisoned = true;
    return { ...execution, guardSafe: independentlyReaped === true };
  } catch (error) {
    isolationRuntimePoisoned = true;
    throw error;
  }
}

export async function runJavaQuest(requestValue, { signal, bundleRoot, trustedManifest, executionGuard } = {}) {
  const request = readRequest(requestValue);
  assertAbortSignal(signal);
  const quest = readTrustedQuest(trustedManifest, request);
  return runJavaTask(request, quest, { signal, bundleRoot, executionGuard });
}

async function runJavaTask(request, quest, { signal, bundleRoot, trustedManifest, executionGuard } = {}) {
  const startedAt = performance.now();
  const ctUnavailable = quest.codingTest && !CODING_TEST_PROTOTYPE_VALIDATED;

  if (!ISOLATION_PROTOTYPE_VALIDATED || isolationRuntimePoisoned || ctUnavailable) {
    const tests = quest.tests.map((test) => ({ ...baseTestResult(test), outcome: "not_run" }));
    return createReport(
      request,
      tests,
      startedAt,
      createError(
        ctUnavailable ? "java_ct_unavailable" : "java_isolation_unavailable",
        ctUnavailable ? "Java 코딩테스트 실행 검증이 아직 완료되지 않았습니다." : "macOS Java 격리 prototype이 timeout 뒤 프로세스 정리를 보장하지 못했습니다.",
        ctUnavailable ? "Java 코딩테스트 실행 검증이 아직 완료되지 않았습니다." : "현재 기기에서는 Java 코드 실행을 안전하게 시작할 수 없습니다.",
      ),
    );
  }

  let workRoot;
  let preserveWorkRoot = false;

  const observeTermination = (execution) => {
    const cleanupIsSafe = terminationIsSafe(execution);
    if (!cleanupIsSafe) {
      preserveWorkRoot = true;
      isolationRuntimePoisoned = true;
    }
    return cleanupIsSafe;
  };

  try {
    const bundlePaths = await resolveBundlePaths(bundleRoot);
    if (quest.codingTest) {
      const ctRoot = await realpath(join(bundlePaths.resourcesRoot, "runtime", "java-ct-runner"));
      if (!isWithin(bundlePaths.resourcesRoot, ctRoot)) throw new Error("CT runner root escaped the bundle");
      await verifyCodingTestBundle(ctRoot, trustedManifest);
      bundlePaths.runnerRoot = ctRoot;
    }
    workRoot = await mkdtemp(join(tmpdir(), quest.codingTest ? "bam-java-ct-" : "bam-java-quest-"));
    workRoot = await realpath(workRoot);
    const classesRoot = join(workRoot, "classes");
    const emptyClasspath = join(workRoot, "empty-classpath");
    const homeRoot = join(workRoot, "home");
    const tempRoot = join(workRoot, "tmp");
    await Promise.all([
      mkdir(classesRoot),
      mkdir(emptyClasspath),
      mkdir(homeRoot),
      mkdir(tempRoot),
    ]);
    const sourcePath = join(workRoot, SOURCE_FILE);
    await writeFile(sourcePath, request.source, { encoding: "utf8", flag: "wx", mode: 0o600 });

    if (signal?.aborted) {
      const tests = [
        stoppedTestResult(quest.tests[0], "cancelled", "사용자가 Java 실행을 취소했습니다."),
        ...remainingNotRun(quest.tests, 1),
      ];
      return finishJavaRun(createReport(request, tests, startedAt), workRoot, preserveWorkRoot);
    }

    const environment = createEnvironment(homeRoot, tempRoot);
    const compilation = await runSourceGuardedProcess({
      profileName: "compile.sb",
      parameters: compileSandboxParameters(
        bundlePaths.jdkRoot,
        bundlePaths.javacExecutable,
        workRoot,
      ),
      executable: bundlePaths.javacExecutable,
      args: [
        "-J-Xmx128m",
        `-J-Duser.home=${homeRoot}`,
        `-J-Djava.io.tmpdir=${tempRoot}`,
        "--release", "25",
        "-encoding", "UTF-8",
        "-proc:none",
        "-implicit:none",
        "-classpath", emptyClasspath,
        "-d", classesRoot,
        sourcePath,
      ],
      environment,
      timeoutMs: JAVA_RUNTIME_LIMITS.compileTimeoutMs,
      rssLimitBytes: JAVA_RUNTIME_LIMITS.compileRssBytes,
      signal,
      compileOutputPath: classesRoot,
    }, { executionGuard, kind: quest.codingTest ? "coding-test" : "quest", workRoot });
    const compilationCleanupIsSafe = observeTermination(compilation);

    if (
      !compilationCleanupIsSafe
      || compilation.exitCode !== 0
      || compilation.terminationReason
      || compilation.startError
    ) {
      const firstResult = compilationCleanupIsSafe
        ? compileFailureResult(quest.tests[0], compilation)
        : stoppedTestResult(
          quest.tests[0],
          "engine_error",
          "Java 컴파일 실행기의 종료를 확인하지 못했습니다.",
          compilation.durationMs,
        );
      const tests = [firstResult, ...remainingNotRun(quest.tests, 1)];
      return finishJavaRun(createReport(request, tests, startedAt), workRoot, preserveWorkRoot);
    }

    const testResults = [];
    for (const [index, test] of quest.tests.entries()) {
      if (signal?.aborted) {
        testResults.push(stoppedTestResult(test, "cancelled", "사용자가 Java 실행을 취소했습니다."));
        testResults.push(...remainingNotRun(quest.tests, index + 1));
        break;
      }

      const arrayInput = quest.signature ? encodeArrayInput(quest.signature, test.args) : null;
      const runnerArguments = quest.codingTest
        ? [test.testClass, test.method, test.parameterTypes.join(","), test.id]
        : quest.signature
        ? ["--array-v1", quest.entryPoint, quest.signature]
        : [quest.entryPoint, ...test.args.map(String)];

      const execution = await runSourceGuardedProcess({
        profileName: "runtime.sb",
        parameters: {
          ...runtimeSandboxParameters({
            jdkRoot: bundlePaths.jdkRoot,
            executable: bundlePaths.javaExecutable,
            runnerRoot: bundlePaths.runnerRoot,
            classesRoot,
            homeRoot,
            tempRoot,
          }),
          RUNNER_ROOT: bundlePaths.runnerRoot,
          CLASSES_ROOT: classesRoot,
        },
        executable: bundlePaths.javaExecutable,
        args: [
          "-Xmx64m",
          "-Xss256k",
          "-XX:MaxMetaspaceSize=64m",
          "-XX:MaxDirectMemorySize=16m",
          "-XX:ActiveProcessorCount=2",
          "-XX:+ExitOnOutOfMemoryError",
          "-XX:+DisableAttachMechanism",
          "-XX:-UsePerfData",
          `-Duser.home=${homeRoot}`,
          `-Djava.io.tmpdir=${tempRoot}`,
          "-cp", quest.codingTest
            ? `${join(bundlePaths.runnerRoot, "classes")}:${join(bundlePaths.runnerRoot, CT_JUNIT.file)}:${classesRoot}`
            : `${bundlePaths.runnerRoot}:${classesRoot}`,
          quest.codingTest ? CT_RUNNER_CLASS : RUNNER_CLASS,
          ...runnerArguments,
        ],
        environment,
        timeoutMs: JAVA_RUNTIME_LIMITS.testTimeoutMs,
        rssLimitBytes: JAVA_RUNTIME_LIMITS.runtimeRssBytes,
        signal,
        protocol: true,
        input: arrayInput,
        maxProtocolBytes: quest.signature
          ? JAVA_RUNTIME_LIMITS.maxArrayProtocolBytes
          : JAVA_RUNTIME_LIMITS.maxProtocolBytes,
      }, { executionGuard, kind: quest.codingTest ? "coding-test" : "quest", workRoot });
      const executionCleanupIsSafe = observeTermination(execution);
      const result = executionCleanupIsSafe
        ? quest.codingTest ? codingTestResult(test, execution) : runtimeTestResult(test, execution, quest.signature)
        : stoppedTestResult(
          test,
          "engine_error",
          "Java 실행기의 종료를 확인하지 못했습니다.",
          execution.durationMs,
        );
      testResults.push(result);
      if (result.outcome === "cancelled" || result.outcome === "engine_error"
        || (quest.codingTest && !["passed", "wrong_answer"].includes(result.outcome))) {
        testResults.push(...remainingNotRun(quest.tests, index + 1));
        break;
      }
    }

    return finishJavaRun(
      createReport(request, testResults, startedAt),
      workRoot,
      preserveWorkRoot,
    );
  } catch (error) {
    if (executionGuard) preserveWorkRoot = true;
    const tests = quest.tests.map((test) => ({ ...baseTestResult(test), outcome: "not_run" }));
    return finishJavaRun(
      createReport(
        request,
        tests,
        startedAt,
        createError(
          "java_engine_error",
          error instanceof Error ? error.message : "Java 실행 환경을 준비하지 못했습니다.",
          "Java 실행 환경을 준비하지 못했습니다. 다시 시도해 주세요.",
        ),
      ),
      workRoot,
      preserveWorkRoot,
    );
  }
}

export const __test = Object.freeze({
  readCodingTestRequest,
  readTrustedCodingTest,
  parseCodingTestProtocol,
  codingTestResult,
  matchesValidatedKernel,
  compileFailureResult,
  compileSandboxParameters,
  createEnvironment,
  encodeArrayInput,
  finishJavaRun,
  getIsolationRuntimePoisoned: () => isolationRuntimePoisoned,
  parseProtocol,
  readProcessGroup,
  readRequest,
  readTrustedQuest,
  resetIsolationRuntimePoisoned: () => {
    isolationRuntimePoisoned = false;
  },
  runSandboxedProcess,
  runSourceGuardedProcess,
  runtimeSandboxParameters,
  runtimeTestResult,
});
