import { randomUUID } from "node:crypto";
import { cp, mkdir, rm, rename } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { buildDesktopApp, writeDesktopReceipt } from "./desktop-build.mjs";

const execFileAsync = promisify(execFile);

export async function packageDesktopApp() {
  const { appPath, lock, outputRoot } = await buildDesktopApp();
  const imageRoot = path.join(outputRoot, `.dmg-staging-${randomUUID()}`);
  const temporaryDmg = path.join(outputRoot, `.BAM.dev-${randomUUID()}.dmg`);
  const finalDmg = path.join(outputRoot, "BAM.dev-0.1.0-macos-arm64-local.dmg");
  try {
    await mkdir(imageRoot, { recursive: true });
    await cp(appPath, path.join(imageRoot, path.basename(appPath)), {
      recursive: true,
      preserveTimestamps: true,
      dereference: false,
    });
    await cp(path.join(outputRoot, "RECEIPT.md"), path.join(imageRoot, "RECEIPT.md"), {
      preserveTimestamps: true,
    });
    await execFileAsync(
      "/usr/bin/hdiutil",
      [
        "create",
        "-volname",
        "BAM.dev",
        "-srcfolder",
        imageRoot,
        "-format",
        "UDZO",
        temporaryDmg,
      ],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
    );
    await execFileAsync("/usr/bin/hdiutil", ["verify", temporaryDmg], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    await rm(finalDmg, { force: true });
    await rename(temporaryDmg, finalDmg);
    await writeDesktopReceipt({ appPath, dmgPath: finalDmg, lock });
    console.log(`로컬 DMG 패키징 완료: ${finalDmg}`);
    return finalDmg;
  } finally {
    await rm(imageRoot, { recursive: true, force: true });
    await rm(temporaryDmg, { force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await packageDesktopApp();
}
