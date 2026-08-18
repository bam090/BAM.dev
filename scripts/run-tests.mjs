import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name, "en"));

  const files = [];
  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(entryPath);
    }
  }
  return files;
}

export async function findTestFiles(directory) {
  return collectTestFiles(resolve(directory));
}

export function runTestFiles(testFiles, cwd) {
  return new Promise((resolveExitCode, reject) => {
    const child = spawn(process.execPath, ["--test", ...testFiles], {
      cwd,
      shell: false,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolveExitCode(code ?? 1));
  });
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  try {
    const testFiles = await findTestFiles(resolve(projectRoot, "tests"));
    if (testFiles.length === 0) throw new Error("실행할 테스트 파일이 없습니다.");
    process.exitCode = await runTestFiles(testFiles, projectRoot);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
