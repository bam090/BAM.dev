import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildDesktopApp } from "./desktop-build.mjs";

export async function bootstrapDesktopApp() {
  const { appPath } = await buildDesktopApp();
  const executable = path.join(appPath, "Contents", "MacOS", "Electron");
  const child = spawn(executable, process.argv.slice(2), {
    cwd: path.dirname(fileURLToPath(import.meta.url)),
    stdio: "inherit",
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => child.kill(signal));
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  process.exitCode = exitCode;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await bootstrapDesktopApp();
}
