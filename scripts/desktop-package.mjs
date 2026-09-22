import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, link, lstat, mkdir, mkdtemp, readFile, realpath, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { assertSafeTree, treeHash, verifyRunnerProvenance } from "./desktop-build.mjs";
import { verifyCodingTestBundle } from "../desktop/runtime/coding-test-artifacts.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);
const usage = "사용법: node scripts/desktop-package.mjs --app <existing.app> --output <new.dmg>";

export function parsePackageArgs(argv) {
  if (!Array.isArray(argv) || argv.length !== 4) throw new TypeError(usage);
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!["--app", "--output"].includes(key) || key in options
      || typeof value !== "string" || value.length === 0 || value.startsWith("--")) {
      throw new TypeError(usage);
    }
    options[key] = value;
  }
  if (!options["--app"] || !options["--output"]) throw new TypeError(usage);
  return { sourceAppPath: options["--app"], outputDmgPath: options["--output"] };
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function requireAbsent(filePath) {
  try {
    await lstat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  throw new Error(`기존 출력은 덮어쓰지 않습니다: ${filePath}`);
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`));
}

async function verifyPackageProvenance(appPath) {
  const resources = path.join(appPath, "Contents", "Resources");
  const lockPath = path.join(resources, "runtime-lock.json");
  const expectedLock = await readFile(path.join(projectRoot, "desktop", "runtime-lock.json"));
  if (!(await readFile(lockPath)).equals(expectedLock)) throw new Error("앱 runtime lock이 현재 고정 버전과 다릅니다.");
  const runtimePath = path.join(resources, "runtime");
  const questPath = path.join(runtimePath, "java-runner");
  const codingTestPath = path.join(runtimePath, "java-ct-runner");
  await verifyRunnerProvenance(questPath);
  const collection = JSON.parse(await readFile(path.join(resources, "app", "dist", "content", "coding-tests", "java.json"), "utf8"));
  await verifyCodingTestBundle(codingTestPath, collection);
  return {
    runtimeLockSha256: await sha256(lockPath),
    questProvenanceSha256: await sha256(path.join(questPath, "runner-provenance.json")),
    codingTestProvenanceSha256: await sha256(path.join(codingTestPath, "ct-provenance.json")),
  };
}

export async function packageDesktopApp({ sourceAppPath, outputDmgPath } = {}, {
  runCommand = (executable, args) => execFileAsync(executable, args, { maxBuffer: 8 * 1024 * 1024 }),
  verifyProvenance = verifyPackageProvenance,
  copyApp = cp,
  platform = process.platform,
  arch = process.arch,
} = {}) {
  if (platform !== "darwin" || arch !== "arm64") throw new Error("이 시험용 포장은 macOS arm64 prototype에 한정됩니다.");
  if (typeof sourceAppPath !== "string" || !sourceAppPath.endsWith(".app")
    || typeof outputDmgPath !== "string" || !outputDmgPath.endsWith(".dmg")) throw new TypeError(usage);
  const input = path.resolve(sourceAppPath);
  const inputStat = await lstat(input);
  if (!inputStat.isDirectory() || inputStat.isSymbolicLink()) throw new Error("입력은 실제 .app 디렉터리여야 합니다.");
  const appPath = await realpath(input);
  const outputParent = await realpath(path.dirname(path.resolve(outputDmgPath)));
  if (!(await stat(outputParent)).isDirectory()) throw new Error("출력 부모 디렉터리가 필요합니다.");
  const dmgPath = path.join(outputParent, path.basename(outputDmgPath));
  const receiptPath = `${dmgPath}.receipt.json`;
  if (isWithin(appPath, dmgPath)) throw new Error("앱 내부에는 DMG를 만들 수 없습니다.");
  await requireAbsent(dmgPath);
  await requireAbsent(receiptPath);

  const commands = [];
  async function command(executable, args) {
    try {
      const result = await runCommand(executable, args);
      commands.push({ executable, args, exitCode: 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" });
      return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
    } catch (error) {
      error.commandResult = { executable, args, exitCode: error.code ?? null, signal: error.signal ?? null,
        stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
      throw error;
    }
  }

  await assertSafeTree(appPath);
  const sourceHash = await treeHash(appPath);
  await command("/usr/bin/codesign", ["--verify", "--deep", "--strict", appPath]);
  const signature = await command("/usr/bin/codesign", ["--display", "--verbose=2", appPath]);
  if (!/^Signature=adhoc$/mu.test(`${signature.stdout}\n${signature.stderr}`)) {
    throw new Error("현재 포장 범위는 검증된 ad-hoc 서명 prototype에 한정됩니다.");
  }
  const provenance = await verifyProvenance(appPath);
  const lock = JSON.parse(await readFile(path.join(projectRoot, "desktop", "runtime-lock.json"), "utf8"));
  const identity = {};
  for (const key of ["CFBundleIdentifier", "CFBundleName"]) {
    identity[key] = (await command("/usr/bin/plutil", ["-extract", key, "raw", "-o", "-", path.join(appPath, "Contents", "Info.plist")])).stdout.trim();
  }
  if (identity.CFBundleIdentifier !== lock.bundle.bundleIdentifier || identity.CFBundleName !== "BAM.dev") {
    throw new Error("앱 identity가 고정된 prototype과 다릅니다.");
  }

  const stagingRoot = await mkdtemp(path.join(outputParent, ".bam-package-"));
  const published = [];
  try {
    const imageRoot = path.join(stagingRoot, "image");
    const stagedApp = path.join(imageRoot, lock.bundle.appName);
    const stagedDmg = path.join(stagingRoot, "candidate.dmg");
    const stagedReceipt = path.join(stagingRoot, "receipt.json");
    await mkdir(imageRoot);
    await copyApp(appPath, stagedApp, { recursive: true, preserveTimestamps: true, dereference: false, verbatimSymlinks: true, force: false, errorOnExist: true });
    await assertSafeTree(stagedApp);
    if (await treeHash(stagedApp) !== sourceHash) throw new Error("복사된 앱이 원본과 다릅니다.");
    await command("/usr/bin/codesign", ["--verify", "--deep", "--strict", stagedApp]);
    await command("/usr/bin/hdiutil", ["create", "-srcfolder", imageRoot, "-volname", "BAM.dev", "-format", "UDZO", stagedDmg]);
    await command("/usr/bin/hdiutil", ["verify", stagedDmg]);
    const imageStat = await lstat(stagedDmg);
    if (!imageStat.isFile() || imageStat.isSymbolicLink() || imageStat.size === 0) throw new Error("유효한 DMG 파일이 생성되지 않았습니다.");
    if (await treeHash(stagedApp) !== sourceHash || await treeHash(appPath) !== sourceHash) {
      throw new Error("포장 중 앱 내용이 변경됐습니다.");
    }
    const receipt = {
      schemaVersion: 1,
      status: "LOCAL_PROTOTYPE_DMG_PACKAGED_NOT_INSTALLATION_VALIDATED",
      sourceApp: { path: appPath, treeSha256: sourceHash, unchanged: true },
      identity,
      provenance,
      dmg: { path: dmgPath, format: "UDZO", size: imageStat.size, sha256: await sha256(stagedDmg) },
      signing: "Existing local ad-hoc signature verified; not re-signed",
      notarization: "Not performed",
      distribution: "Local prototype only; public redistribution source-offer review is incomplete",
      notValidated: ["Installation", "Offline first launch", "Repackaging data preservation", "Official OS or packaging support"],
      commands,
    };
    await writeFile(stagedReceipt, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
    const receiptStat = await lstat(stagedReceipt);
    // Same-filesystem exclusive links publish complete files without overwriting a concurrent output.
    await link(stagedDmg, dmgPath);
    published.push({ path: dmgPath, dev: imageStat.dev, ino: imageStat.ino });
    await link(stagedReceipt, receiptPath);
    published.push({ path: receiptPath, dev: receiptStat.dev, ino: receiptStat.ino });
    await rm(stagingRoot, { recursive: true, force: true });
    return { dmgPath, receiptPath };
  } catch (error) {
    const cleanupErrors = [];
    for (const output of published.reverse()) {
      try {
        const current = await lstat(output.path);
        // Compare with our staged inode; never follow or delete a replacement symlink/file.
        if (current.isFile() && current.dev === output.dev && current.ino === output.ino) {
          await unlink(output.path);
        }
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") cleanupErrors.push(cleanupError);
      }
    }
    try { await rm(stagingRoot, { recursive: true, force: true }); } catch (cleanupError) { cleanupErrors.push(cleanupError); }
    if (cleanupErrors.length) {
      error.message += ` 임시 산출물 정리도 실패했습니다: ${cleanupErrors.map((entry) => entry.message).join("; ")}`;
    }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await packageDesktopApp(parsePackageArgs(process.argv.slice(2)));
    console.log(`시험용 DMG 포장 완료: ${result.dmgPath}\n검증 기록: ${result.receiptPath}`);
  } catch (error) {
    console.error(error.message);
    if (error.commandResult) console.error(JSON.stringify(error.commandResult));
    process.exitCode = 1;
  }
}
