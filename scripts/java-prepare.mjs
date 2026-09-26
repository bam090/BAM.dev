import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, constants as fsConstants } from "node:fs";
import { access, cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CT_JUNIT, verifyCodingTestBundle } from "../desktop/runtime/coding-test-artifacts.mjs";
import {
  assertSafeTree, buildCodingTestBundle, runnerClassHashes, treeHash,
  prepareJdk, verifyArchive, verifyRunnerProvenance,
} from "./desktop-build.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRuntime = path.join(projectRoot, "desktop", "runtime");
const sourceLock = path.join(projectRoot, "desktop", "runtime-lock.json");
const questSource = path.join(sourceRuntime, "JavaBamQuestRunner.java");
const receiptName = "java-prepare-receipt.json";

async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

function inside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function requireRegularFile(file) {
  if (!(await lstat(file)).isFile()) throw new Error(`일반 파일이 아닙니다: ${file}`);
}

async function requireAbsent(file) {
  try { await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return; throw error; }
  throw new Error(`기존 준비본을 덮어쓰지 않습니다: ${file}`);
}

export function parseJavaPrepareArgs(argv) {
  if (!Array.isArray(argv) || argv.length !== 4) throw new TypeError("사용법: node scripts/java-prepare.mjs --artifacts <고정자료폴더> --runtime <전용새폴더>");
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!["--artifacts", "--runtime"].includes(key) || key in values || typeof value !== "string" || !value || value.startsWith("--")) {
      throw new TypeError("--artifacts와 --runtime을 각각 한 번 지정해야 합니다.");
    }
    values[key] = value;
  }
  if (!values["--artifacts"] || !values["--runtime"]) throw new TypeError("--artifacts와 --runtime이 필요합니다.");
  return { artifactRoot: values["--artifacts"], runtimeRoot: values["--runtime"] };
}

// The default command stays closed until the supervised preparation preflight is independently approved.
// Injected operations let source-only tests exercise the staging and failure boundary without a child.
export async function prepareJavaRuntime({ artifactRoot, runtimeRoot, signal, executionGuard } = {}, {
  unpackJdk, compileQuest, compileCt, finalizeGuard,
} = {}) {
  if (typeof artifactRoot !== "string" || !artifactRoot || typeof runtimeRoot !== "string" || !runtimeRoot) throw new TypeError("자료와 출력 경로가 필요합니다.");
  const lockBytes = await readFile(sourceLock);
  const lock = JSON.parse(lockBytes);
  if (lock.platform !== "darwin" || lock.arch !== "arm64" || lock.junit.artifact !== CT_JUNIT.file
    || lock.junit.sha256 !== CT_JUNIT.sha256 || lock.junit.size !== CT_JUNIT.size || lock.junit.version !== CT_JUNIT.version) {
    throw new Error("고정 Java runtime lock이 현재 후보와 다릅니다.");
  }
  const artifacts = await realpath(path.resolve(artifactRoot));
  const parent = await realpath(path.dirname(path.resolve(runtimeRoot)));
  const destination = path.join(parent, path.basename(path.resolve(runtimeRoot)));
  if (inside(artifacts, destination) || inside(destination, artifacts)) throw new Error("자료와 출력 폴더는 분리해야 합니다.");
  if (["content", "src", "styles"].some((name) => inside(path.join(projectRoot, name), destination))) {
    throw new Error("정적 공개 경로 아래에는 Java runtime을 만들 수 없습니다.");
  }
  await requireAbsent(destination);
  const jdkArchive = path.join(artifacts, lock.jdk.archive);
  const junitJar = path.join(artifacts, lock.junit.artifact);
  await Promise.all([requireRegularFile(jdkArchive), requireRegularFile(junitJar)]);
  await Promise.all([verifyArchive(jdkArchive, lock.jdk.sha256), verifyArchive(junitJar, CT_JUNIT.sha256)]);
  if ((await stat(junitJar)).size !== CT_JUNIT.size) throw new Error("JUnit 크기가 lock과 다릅니다.");
  if (![unpackJdk, compileQuest, compileCt, finalizeGuard].every((operation) => typeof operation === "function")) {
    throw new Error("준비 child 감독·회수 preflight 전에는 archive 해제와 Java 컴파일을 시작할 수 없습니다.");
  }

  const staging = await mkdtemp(path.join(parent, ".java-prepare-"));
  const resources = path.join(staging, "Resources");
  const runtime = path.join(resources, "runtime");
  try {
    await mkdir(path.join(runtime, "java-runner"), { recursive: true });
    await mkdir(path.join(resources, "app", "dist", "content", "quests"), { recursive: true });
    await mkdir(path.join(resources, "app", "dist", "content", "coding-tests"), { recursive: true });
    await cp(sourceLock, path.join(resources, "runtime-lock.json"));
    await cp(path.join(sourceRuntime, "supervisor.mjs"), path.join(runtime, "supervisor.mjs"));
    for (const name of ["coding-test-artifacts.mjs", "JavaBamCodingTestRunner.java", "SolutionInvoker.java"]) {
      await cp(path.join(sourceRuntime, name), path.join(runtime, name));
    }
    await cp(path.join(sourceRuntime, "profiles"), path.join(runtime, "profiles"), { recursive: true });
    await cp(path.join(projectRoot, "content", "quests", "java.json"), path.join(resources, "app", "dist", "content", "quests", "java.json"));
    await cp(path.join(projectRoot, "content", "coding-tests", "java.json"), path.join(resources, "app", "dist", "content", "coding-tests", "java.json"));

    const extracted = path.join(staging, "jdk-extracted");
    await unpackJdk(jdkArchive, extracted);
    await assertSafeTree(extracted);
    const extractedJdk = path.join(extracted, lock.jdk.archiveRoot);
    if (!(await lstat(extractedJdk)).isDirectory()) throw new Error("JDK archive root가 실제 디렉터리가 아닙니다.");
    await rename(extractedJdk, path.join(runtime, "jdk"));
    await rm(extracted, { recursive: true });
    const jdkHome = path.join(runtime, "jdk", "Contents", "Home");
    const java = path.join(jdkHome, "bin", "java");
    const javac = path.join(jdkHome, "bin", "javac");
    for (const executable of [java, javac]) {
      if (!inside(await realpath(jdkHome), await realpath(executable))) throw new Error("JDK 실행 파일이 JDK 밖을 가리킵니다.");
      await access(executable, fsConstants.X_OK);
    }
    await requireRegularFile(path.join(jdkHome, "legal", "java.base", "LICENSE"));
    const release = await readFile(path.join(jdkHome, "release"), "utf8");
    if (!/^JAVA_VERSION="25\.0\.4\.1"$/mu.test(release) || !/^OS_ARCH="aarch64"$/mu.test(release)) throw new Error("고정 JDK의 release가 다릅니다.");

    const questSourceHash = await sha256(questSource);
    const questWorkRoot = await mkdtemp(path.join(staging, "quest-build-"));
    const questBuildSource = path.join(questWorkRoot, "JavaBamQuestRunner.java");
    await cp(questSource, questBuildSource);
    if (await sha256(questBuildSource) !== questSourceHash) throw new Error("Quest 신뢰 소스 복제본이 다릅니다.");
    const runnerRoot = path.join(runtime, "java-runner");
    const questCompile = await compileQuest({ bundleRoot: resources, workRoot: questWorkRoot,
      sourcePath: questBuildSource, sourceSha256: questSourceHash, signal, executionGuard });
    await writeFile(path.join(runtime, "quest-compile-receipt.json"), `${JSON.stringify(questCompile, null, 2)}\n`, { flag: "wx" });
    if (!questCompile?.safe || questCompile.execution?.exitCode !== 0 || questCompile.execution?.startError || questCompile.execution?.terminationReason) throw new Error("Quest 신뢰 소스 컴파일을 안전하게 완료하지 못했습니다.");
    if (await sha256(questSource) !== questSourceHash || await sha256(questBuildSource) !== questSourceHash
      || await realpath(questCompile.executable) !== await realpath(javac)
      || await realpath(questCompile.classesRoot) !== await realpath(path.join(questWorkRoot, "classes"))) {
      throw new Error("Quest 컴파일 입력·출력 또는 JDK가 바뀌었습니다.");
    }
    await rm(runnerRoot, { recursive: true });
    await rename(path.join(questWorkRoot, "classes"), runnerRoot);
    await writeFile(path.join(runnerRoot, "runner-provenance.json"), `${JSON.stringify({
      schemaVersion: 1,
      sourceSha256: questSourceHash,
      classes: await runnerClassHashes(runnerRoot),
      provenance: { kind: "bundled-javac", release: 25, javacSha256: await sha256(javac) },
    }, null, 2)}\n`, { flag: "wx" });
    await verifyRunnerProvenance(runnerRoot);
    await rm(questWorkRoot, { recursive: true });

    await buildCodingTestBundle({ resourcesPath: resources, stagingRoot: staging, junitArtifact: junitJar, lock }, {
      compileSources: (value) => compileCt({ ...value, signal, executionGuard }),
    });
    const receipt = {
      schemaVersion: 1,
      runtimeLockSha256: createHash("sha256").update(lockBytes).digest("hex"),
      jdkArchiveSha256: lock.jdk.sha256,
      jdkTreeSha256: await treeHash(path.join(runtime, "jdk")),
      junitSha256: CT_JUNIT.sha256,
      questContentSha256: await sha256(path.join(resources, "app", "dist", "content", "quests", "java.json")),
      codingTestContentSha256: await sha256(path.join(resources, "app", "dist", "content", "coding-tests", "java.json")),
      supervisorSha256: await sha256(path.join(runtime, "supervisor.mjs")),
      questCompileReceiptSha256: await sha256(path.join(runtime, "quest-compile-receipt.json")),
      profilesSha256: await treeHash(path.join(runtime, "profiles")),
    };
    // mkdir is exclusive: rename alone can replace an existing empty directory.
    await mkdir(destination, { mode: 0o700 });
    await rename(resources, path.join(destination, "Resources"));
    await verifyPreparedRoot(destination, receipt);
    if (await finalizeGuard() !== true) throw new Error("독립 Java 감독 종료 증거가 없습니다.");
    await rm(staging, { recursive: true });
    await writeFile(path.join(destination, receiptName), `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
    return { runtimeRoot: destination, receipt };
  } catch (error) {
    error.message = `${error.message}; 미완성 준비 폴더 보존: ${staging}; 출력은 완료 receipt가 없으면 사용하지 마세요: ${destination}`;
    throw error;
  }
}

async function verifyPreparedRoot(root, receipt) {
  const resources = path.join(root, "Resources");
  if (!(await lstat(resources)).isDirectory()) throw new Error("Resources가 실제 디렉터리가 아닙니다.");
  await assertSafeTree(root);
  const lockBytes = await readFile(sourceLock);
  const lock = JSON.parse(lockBytes);
  if (receipt.schemaVersion !== 1 || receipt.runtimeLockSha256 !== createHash("sha256").update(lockBytes).digest("hex")
    || receipt.jdkArchiveSha256 !== lock.jdk.sha256 || receipt.junitSha256 !== CT_JUNIT.sha256
    || !(await readFile(path.join(resources, "runtime-lock.json"))).equals(lockBytes)) throw new Error("Java 준비 lock 출처가 다릅니다.");
  const questContent = path.join(resources, "app", "dist", "content", "quests", "java.json");
  const ctContent = path.join(resources, "app", "dist", "content", "coding-tests", "java.json");
  if (receipt.questContentSha256 !== await sha256(questContent) || receipt.codingTestContentSha256 !== await sha256(ctContent)
    || !(await readFile(questContent)).equals(await readFile(path.join(projectRoot, "content", "quests", "java.json")))
    || !(await readFile(ctContent)).equals(await readFile(path.join(projectRoot, "content", "coding-tests", "java.json")))) throw new Error("공개 Java 콘텐츠 snapshot이 바뀌었습니다.");
  const runtime = path.join(resources, "runtime");
  if (receipt.supervisorSha256 !== await sha256(path.join(runtime, "supervisor.mjs"))
    || receipt.questCompileReceiptSha256 !== await sha256(path.join(runtime, "quest-compile-receipt.json"))
    || !(await readFile(path.join(runtime, "supervisor.mjs"))).equals(await readFile(path.join(sourceRuntime, "supervisor.mjs")))
    || receipt.profilesSha256 !== await treeHash(path.join(runtime, "profiles"))
    || receipt.profilesSha256 !== await treeHash(path.join(sourceRuntime, "profiles"))) throw new Error("Java 감독 코드 또는 profile이 바뀌었습니다.");
  for (const name of ["coding-test-artifacts.mjs", "JavaBamCodingTestRunner.java", "SolutionInvoker.java"]) {
    if (!(await readFile(path.join(runtime, name))).equals(await readFile(path.join(sourceRuntime, name)))) {
      throw new Error("CT 신뢰 소스가 현재 코드와 다릅니다.");
    }
  }
  if (receipt.jdkTreeSha256 !== await treeHash(path.join(runtime, "jdk"))) throw new Error("준비 JDK 파일 묶음이 바뀌었습니다.");
  const jdkHome = path.join(runtime, "jdk", "Contents", "Home");
  const release = await readFile(path.join(jdkHome, "release"), "utf8");
  if (!/^JAVA_VERSION="25\.0\.4\.1"$/mu.test(release) || !/^OS_ARCH="aarch64"$/mu.test(release)) throw new Error("준비 JDK release가 다릅니다.");
  await requireRegularFile(path.join(jdkHome, "legal", "java.base", "LICENSE"));
  for (const name of ["java", "javac"]) {
    const executable = await realpath(path.join(jdkHome, "bin", name));
    if (!inside(await realpath(jdkHome), executable)) throw new Error("준비 JDK 실행 파일이 밖을 가리킵니다.");
    await access(executable, fsConstants.X_OK);
  }
  await verifyRunnerProvenance(path.join(resources, "runtime", "java-runner"));
  await verifyCodingTestBundle(path.join(resources, "runtime", "java-ct-runner"), JSON.parse(await readFile(ctContent, "utf8")));
  return { resourcesPath: resources, questCollection: JSON.parse(await readFile(questContent, "utf8")), codingTestCollection: JSON.parse(await readFile(ctContent, "utf8")) };
}

export async function verifyPreparedJavaRuntime(runtimeRoot) {
  if (!(await lstat(path.resolve(runtimeRoot))).isDirectory()) throw new Error("준비 root가 실제 디렉터리가 아닙니다.");
  const root = await realpath(path.resolve(runtimeRoot));
  await assertSafeTree(root);
  await requireRegularFile(path.join(root, receiptName));
  const receipt = JSON.parse(await readFile(path.join(root, receiptName), "utf8"));
  return verifyPreparedRoot(root, receipt);
}

export async function startJavaPreparation(options) {
  const guardModule = await import("./java-source-guard.mjs");
  if (guardModule.SOURCE_JAVA_GUARD_PREFLIGHT_VALIDATED !== true) {
    throw new Error("독립 Java 감독·회수 preflight 전에는 아카이브 해제와 Java 컴파일을 시작하지 않습니다.");
  }
  const supervisor = await import("../desktop/runtime/supervisor.mjs");
  const channel = await guardModule.startIndependentJavaGuardChannel({ spawnProcess: spawn });
  let guard;
  try {
    await guardModule.recoverPreviousJavaSourceGuard({ checkoutRoot: projectRoot, channel });
    guard = await guardModule.createJavaSourceGuard({ checkoutRoot: projectRoot, channel });
  } catch (error) {
    try {
      await channel.disconnectAfterFailure();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError],
        `Java 재시작 회수와 감독 종료가 확인되지 않았습니다: ${error.message}; ${cleanupError.message}`);
    }
    throw error;
  }
  let failure;
  let result;
  try {
    result = await prepareJavaRuntime({ ...options, executionGuard: guard }, {
      unpackJdk: prepareJdk,
      compileQuest: supervisor.compileTrustedQuestSource,
      compileCt: supervisor.compileTrustedCodingTestSources,
      finalizeGuard: async () => { await guard.close(); return true; },
    });
  } catch (error) { failure = error; }
  try { await guard.close(); }
  catch (error) {
    failure ??= error;
    try { await channel.disconnectAfterFailure(); }
    catch (cleanupError) {
      failure = new AggregateError([failure, cleanupError],
        `Java 준비 실패 후 감독 worker 종료가 확인되지 않았습니다: ${failure.message}; ${cleanupError.message}`);
    }
  }
  if (failure) throw failure;
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { runtimeRoot } = await startJavaPreparation(parseJavaPrepareArgs(process.argv.slice(2)));
    console.log(`Java runtime 준비 완료: ${runtimeRoot}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
