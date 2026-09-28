import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  opendir,
  readFile,
  readlink,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "desktop-dist");
const validationOutputRoot = path.join(projectRoot, "desktop-validation-dist");
const lockPath = path.join(projectRoot, "desktop", "runtime-lock.json");
const defaultArtifactRoot = "/private/tmp/bam-java-runtime-artifacts";
const runnerSourcePath = path.join(projectRoot, "desktop", "runtime", "JavaBamQuestRunner.java");
const runnerClassNames = ["BamQuestRunner$ArrayInput.class", "BamQuestRunner.class"];
const runnerReceiptName = "runner-provenance.json";

async function sha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function runnerClassHashes(runnerPath) {
  if (!(await lstat(runnerPath)).isDirectory()) throw new Error("Java runner 경로가 일반 디렉터리가 아닙니다.");
  const classes = [];
  for await (const entry of await opendir(runnerPath)) {
    const filePath = path.join(runnerPath, entry.name);
    if (!(await lstat(filePath)).isFile()) throw new Error("Java runner에는 일반 파일만 허용됩니다.");
    if (entry.name === runnerReceiptName) continue;
    if (!runnerClassNames.includes(entry.name)) throw new Error("예기치 않은 Java runner 파일입니다.");
    classes.push({ name: entry.name, sha256: await sha256(filePath) });
  }
  classes.sort((left, right) => left.name < right.name ? -1 : 1);
  // The current runner's nested record is required even for a scalar-only run.
  if (runnerClassNames.some((name) => !classes.some((entry) => entry.name === name))) {
    throw new Error("Java runner class 묶음이 누락됐습니다.");
  }
  return classes;
}

export async function verifyRunnerProvenance(runnerPath) {
  const classes = await runnerClassHashes(runnerPath);
  const receipt = JSON.parse(await readFile(path.join(runnerPath, runnerReceiptName), "utf8"));
  const provenance = receipt.provenance;
  // Reuse evidence identifies the reviewed bytes; its temporary path is not a runtime dependency.
  const validProvenance = provenance?.kind === "bundled-javac"
    ? provenance.release === 25 && /^[a-f0-9]{64}$/u.test(provenance.javacSha256 ?? "")
    : provenance?.kind === "verified-byte-reuse"
      && provenance.compilationPerformed === false
      && typeof provenance.originalRunner === "string" && path.isAbsolute(provenance.originalRunner)
      && typeof provenance.evidence?.path === "string" && path.isAbsolute(provenance.evidence.path)
      && /^[a-f0-9]{64}$/u.test(provenance.evidence.sha256 ?? "");
  if (
    receipt.schemaVersion !== 1
    || receipt.sourceSha256 !== await sha256(runnerSourcePath)
    || !validProvenance
    || JSON.stringify(receipt.classes) !== JSON.stringify(classes)
  ) {
    throw new Error("Java runner 출처 또는 class 묶음이 현재 소스와 일치하지 않습니다.");
  }
  return receipt;
}

function assertSafeArchiveMembers(listing, archiveName) {
  const members = listing.split("\n").filter(Boolean);
  if (members.length === 0) throw new Error(`${archiveName} archive가 비어 있습니다.`);
  for (const member of members) {
    const name = member.endsWith("/") ? member.slice(0, -1) : member;
    if (
      name === "" ||
      name.includes("\0") ||
      name.includes("\\") ||
      path.posix.isAbsolute(name) ||
      /^[A-Za-z]:/u.test(name) ||
      name.split("/").some((segment) => segment === "..")
    ) {
      throw new Error(`${archiveName}에 안전하지 않은 경로가 있습니다.`);
    }
  }
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

async function assertSafeTree(rootPath) {
  const root = await realpath(rootPath);
  const pending = [root];
  while (pending.length > 0) {
    const directoryPath = pending.pop();
    const directory = await opendir(directoryPath);
    for await (const entry of directory) {
      const entryPath = path.join(directoryPath, entry.name);
      const entryStat = await lstat(entryPath);
      if (entryStat.isDirectory()) {
        pending.push(entryPath);
      } else if (entryStat.isSymbolicLink()) {
        const target = await readlink(entryPath);
        if (path.isAbsolute(target)) {
          throw new Error(`bundle 밖을 가리키는 절대 symlink입니다: ${entryPath}`);
        }
        const lexicalTarget = path.resolve(directoryPath, target);
        if (!isInside(root, lexicalTarget)) {
          throw new Error(`bundle 밖을 가리키는 symlink입니다: ${entryPath}`);
        }
        const resolvedTarget = await realpath(entryPath);
        if (!isInside(root, resolvedTarget)) {
          throw new Error(`bundle 밖에서 해석되는 symlink입니다: ${entryPath}`);
        }
      }
    }
  }
}

async function verifyArchive(filePath, expectedHash) {
  const actualHash = await sha256(filePath);
  if (actualHash !== expectedHash) {
    throw new Error(`${path.basename(filePath)} SHA-256이 runtime lock과 다릅니다.`);
  }
}

async function run(command, args, options = {}) {
  return execFileAsync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

async function prepareElectron(archivePath, destination) {
  const { stdout } = await run("/usr/bin/unzip", ["-Z1", archivePath]);
  assertSafeArchiveMembers(stdout, path.basename(archivePath));
  await mkdir(destination, { recursive: true });
  await run("/usr/bin/ditto", ["-x", "-k", archivePath, destination]);
  await assertSafeTree(destination);
}

async function prepareJdk(archivePath, destination) {
  const { stdout } = await run("/usr/bin/tar", ["-tf", archivePath]);
  assertSafeArchiveMembers(stdout, path.basename(archivePath));
  await mkdir(destination, { recursive: true });
  await run("/usr/bin/tar", ["-xzf", archivePath, "-C", destination]);
  await assertSafeTree(destination);
}

async function editBundleMetadata(appPath, lock) {
  const infoPath = path.join(appPath, "Contents", "Info.plist");
  for (const [key, value] of [
    ["CFBundleDisplayName", "BAM.dev"],
    ["CFBundleIdentifier", lock.bundle.bundleIdentifier],
    ["CFBundleName", "BAM.dev"],
  ]) {
    await run("/usr/bin/plutil", ["-replace", key, "-string", value, infoPath]);
  }
  for (const key of [
    "ElectronAsarIntegrity",
    "NSAppTransportSecurity",
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription",
  ]) {
    await run("/usr/bin/plutil", ["-remove", key, infoPath]);
  }
}

async function signLocalPrototype(appPath, bundleIdentifier) {
  await run("/usr/bin/codesign", [
    "--force",
    "--deep",
    "--sign",
    "-",
    "--identifier",
    bundleIdentifier,
    appPath,
  ]);
  await run("/usr/bin/codesign", ["--verify", "--deep", "--strict", appPath]);
}

async function treeHash(rootPath) {
  const records = [];
  const pending = [rootPath];
  while (pending.length > 0) {
    const directoryPath = pending.pop();
    const directory = await opendir(directoryPath);
    for await (const entry of directory) {
      const entryPath = path.join(directoryPath, entry.name);
      const relativePath = path.relative(rootPath, entryPath).split(path.sep).join("/");
      const entryStat = await lstat(entryPath);
      if (entryStat.isDirectory()) {
        pending.push(entryPath);
      } else if (entryStat.isSymbolicLink()) {
        records.push(`${relativePath}\0link\0${await readlink(entryPath)}`);
      } else if (entryStat.isFile()) {
        records.push(`${relativePath}\0file\0${await sha256(entryPath)}`);
      }
    }
  }
  records.sort();
  return createHash("sha256").update(records.join("\n")).digest("hex");
}

export async function writeDesktopReceipt({ appPath, dmgPath = null, lock }) {
  const appSize = (await run("/usr/bin/du", ["-sk", appPath])).stdout.trim().split(/\s+/u)[0];
  const lines = [
    "# BAM.dev 로컬 데스크톱 prototype receipt",
    "",
    `- Host: ${os.type()} ${os.release()} ${os.arch()}`,
    `- Electron: ${lock.electron.version}`,
    `- Electron archive SHA-256: \`${lock.electron.sha256}\``,
    `- Temurin JDK: ${lock.jdk.version}`,
    `- JDK archive SHA-256: \`${lock.jdk.sha256}\``,
    `- App tree SHA-256: \`${await treeHash(appPath)}\``,
    `- App size: ${appSize} KiB`,
    `- App bundle identifier: \`${lock.bundle.bundleIdentifier}\``,
    "- Signing: local ad-hoc signature only",
    "- Notarization: not performed",
    "- Distribution: local prototype only; public redistribution source-offer review is incomplete",
    "- Runtime: bundled JDK path only; system JDK fallback is not provided",
  ];
  if (dmgPath) {
    lines.push(`- DMG SHA-256: \`${await sha256(dmgPath)}\``);
    lines.push(`- DMG size: ${(await stat(dmgPath)).size} bytes`);
  }
  lines.push("");
  await writeFile(path.join(outputRoot, "RECEIPT.md"), lines.join("\n"), "utf8");
}

export async function stageDesktopRuntimeOnly({ sourceAppPath, outputAppPath } = {}) {
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  const sourcePath = path.resolve(sourceAppPath ?? path.join(outputRoot, lock.bundle.appName));
  const destinationPath = path.resolve(
    outputAppPath ?? path.join(validationOutputRoot, lock.bundle.appName),
  );
  if (
    sourcePath === destinationPath
    || isInside(sourcePath, destinationPath)
    || isInside(destinationPath, sourcePath)
  ) {
    throw new Error("runtime-only 입력 앱과 출력 앱은 서로 분리된 경로여야 합니다.");
  }

  const destinationRoot = path.dirname(destinationPath);
  await mkdir(destinationRoot, { recursive: true });
  const stagingRoot = await mkdtemp(path.join(destinationRoot, ".runtime-staging-"));
  const stagedAppPath = path.join(stagingRoot, path.basename(destinationPath));

  try {
    await cp(sourcePath, stagedAppPath, {
      recursive: true,
      preserveTimestamps: true,
      dereference: false,
      verbatimSymlinks: true,
    });
    await assertSafeTree(stagedAppPath);
    const resourcesPath = path.join(stagedAppPath, "Contents", "Resources");
    const runtimePath = path.join(resourcesPath, "runtime");
    await verifyRunnerProvenance(path.join(runtimePath, "java-runner"));
    await rm(path.join(runtimePath, "profiles"), { recursive: true, force: true });
    await Promise.all([
      cp(path.join(projectRoot, "desktop", "runtime", "supervisor.mjs"), path.join(runtimePath, "supervisor.mjs"), {
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "runtime", "profiles"), path.join(runtimePath, "profiles"), {
        recursive: true,
        preserveTimestamps: true,
      }),
      cp(lockPath, path.join(resourcesPath, "runtime-lock.json"), {
        preserveTimestamps: true,
      }),
    ]);
    await rm(destinationPath, { recursive: true, force: true });
    await rename(stagedAppPath, destinationPath);
    console.log(`Java 미실행 runtime 검증 앱 준비 완료: ${path.relative(projectRoot, destinationPath)}`);
    return { appPath: destinationPath, lock, sourceAppPath: sourcePath };
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

export async function buildDesktopApp() {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    throw new Error("이 prototype build는 macOS arm64에서만 지원합니다.");
  }

  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  if (lock.platform !== "darwin" || lock.arch !== "arm64") {
    throw new Error("runtime lock 플랫폼이 현재 prototype과 다릅니다.");
  }
  const artifactRoot = path.resolve(
    process.env.BAM_RUNTIME_ARTIFACTS_DIR ?? defaultArtifactRoot,
  );
  const electronArchive = path.join(artifactRoot, lock.electron.archive);
  const jdkArchive = path.join(artifactRoot, lock.jdk.archive);
  await Promise.all([
    verifyArchive(electronArchive, lock.electron.sha256),
    verifyArchive(jdkArchive, lock.jdk.sha256),
  ]);

  await run(process.execPath, [path.join(projectRoot, "scripts", "build.mjs")]);
  await mkdir(outputRoot, { recursive: true });
  const stagingRoot = await mkdtemp(path.join(outputRoot, ".staging-"));
  const electronExtractRoot = path.join(stagingRoot, "electron");
  const jdkExtractRoot = path.join(stagingRoot, "jdk");
  const stagedAppPath = path.join(stagingRoot, lock.bundle.appName);
  const finalAppPath = path.join(outputRoot, lock.bundle.appName);

  try {
    await Promise.all([
      prepareElectron(electronArchive, electronExtractRoot),
      prepareJdk(jdkArchive, jdkExtractRoot),
    ]);
    const extractedAppPath = path.join(electronExtractRoot, "Electron.app");
    const extractedJdkPath = path.join(jdkExtractRoot, lock.jdk.archiveRoot);
    await rename(extractedAppPath, stagedAppPath);

    const resourcesPath = path.join(stagedAppPath, "Contents", "Resources");
    const applicationPath = path.join(resourcesPath, "app");
    const runtimePath = path.join(resourcesPath, "runtime");
    const runnerPath = path.join(runtimePath, "java-runner");
    const runnerClasspath = path.join(stagingRoot, "runner-empty-classpath");
    await rm(path.join(resourcesPath, "default_app.asar"), { force: true });
    await mkdir(path.join(applicationPath, "desktop"), { recursive: true });
    await mkdir(path.join(resourcesPath, "licenses", "electron"), { recursive: true });
    await mkdir(runnerPath, { recursive: true });
    await mkdir(runnerClasspath, { recursive: true });

    await Promise.all([
      cp(path.join(projectRoot, "dist"), path.join(applicationPath, "dist"), {
        recursive: true,
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "main.cjs"), path.join(applicationPath, "desktop", "main.cjs"), {
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "preload.cjs"), path.join(applicationPath, "desktop", "preload.cjs"), {
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "package.json"), path.join(applicationPath, "package.json"), {
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "runtime", "supervisor.mjs"), path.join(runtimePath, "supervisor.mjs"), {
        preserveTimestamps: true,
      }),
      cp(path.join(projectRoot, "desktop", "runtime", "profiles"), path.join(runtimePath, "profiles"), {
        recursive: true,
        preserveTimestamps: true,
      }),
      cp(extractedJdkPath, path.join(runtimePath, "jdk"), {
        recursive: true,
        preserveTimestamps: true,
        dereference: false,
      }),
      cp(lockPath, path.join(resourcesPath, "runtime-lock.json"), {
        preserveTimestamps: true,
      }),
      cp(path.join(artifactRoot, "LICENSE"), path.join(resourcesPath, "licenses", "electron", "LICENSE"), {
        preserveTimestamps: true,
      }),
      cp(
        path.join(artifactRoot, "LICENSES.chromium.html"),
        path.join(resourcesPath, "licenses", "electron", "LICENSES.chromium.html"),
        { preserveTimestamps: true },
      ),
      cp(
        path.join(artifactRoot, "RECEIPT.md"),
        path.join(resourcesPath, "licenses", "runtime-artifacts-RECEIPT.md"),
        { preserveTimestamps: true },
      ),
    ]);

    const bundledJavac = path.join(runtimePath, "jdk", "Contents", "Home", "bin", "javac");
    const runnerSourceSha256 = await sha256(runnerSourcePath);
    await run(
      bundledJavac,
      [
        "--release",
        "25",
        "-encoding",
        "UTF-8",
        "-proc:none",
        "-implicit:none",
        "-classpath",
        runnerClasspath,
        "-d",
        runnerPath,
        runnerSourcePath,
      ],
      {
        env: {
          HOME: stagingRoot,
          TMPDIR: stagingRoot,
          LANG: "C",
          LC_ALL: "C",
        },
      },
    );
    if (await sha256(runnerSourcePath) !== runnerSourceSha256) {
      throw new Error("컴파일 중 Java runner 소스가 변경됐습니다.");
    }
    await writeFile(path.join(runnerPath, runnerReceiptName), `${JSON.stringify({
      schemaVersion: 1,
      sourceSha256: runnerSourceSha256,
      classes: await runnerClassHashes(runnerPath),
      provenance: { kind: "bundled-javac", release: 25, javacSha256: await sha256(bundledJavac) },
    }, null, 2)}\n`, { flag: "wx" });
    await verifyRunnerProvenance(runnerPath);

    const electronVersion = (await readFile(path.join(electronExtractRoot, "version"), "utf8")).trim();
    const jdkRelease = await readFile(path.join(runtimePath, "jdk", "Contents", "Home", "release"), "utf8");
    if (
      electronVersion !== lock.electron.version ||
      !jdkRelease.includes('JAVA_VERSION="25.0.4.1"') ||
      !jdkRelease.includes('IMPLEMENTOR="Eclipse Adoptium"')
    ) {
      throw new Error("압축을 푼 runtime 버전이 runtime lock과 다릅니다.");
    }

    for (const requiredPath of [
      path.join(runtimePath, "jdk", "Contents", "Home", "bin", "java"),
      path.join(runtimePath, "jdk", "Contents", "Home", "bin", "javac"),
      path.join(runtimePath, "jdk", "Contents", "Home", "legal", "java.base", "LICENSE"),
      path.join(runtimePath, "java-runner", "BamQuestRunner.class"),
      path.join(runtimePath, "profiles", "compile.sb"),
      path.join(runtimePath, "profiles", "runtime.sb"),
    ]) {
      await stat(requiredPath);
    }

    await assertSafeTree(stagedAppPath);
    await editBundleMetadata(stagedAppPath, lock);
    await signLocalPrototype(stagedAppPath, lock.bundle.bundleIdentifier);
    await rm(finalAppPath, { recursive: true, force: true });
    await rename(stagedAppPath, finalAppPath);
    await writeDesktopReceipt({ appPath: finalAppPath, lock });
    console.log(`로컬 데스크톱 앱 빌드 완료: ${path.relative(projectRoot, finalAppPath)}`);
    return { appPath: finalAppPath, lock, outputRoot };
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length === 3 && process.argv[2] === "--runtime-only") {
    await stageDesktopRuntimeOnly();
  } else if (process.argv.length === 2) {
    await buildDesktopApp();
  } else {
    throw new Error("사용법: node scripts/desktop-build.mjs [--runtime-only]");
  }
}
