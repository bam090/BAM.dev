import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const entries = ["index.html", "content", "src", "styles"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const entry of entries) {
  await cp(path.join(projectRoot, entry), path.join(outputDirectory, entry), {
    recursive: true,
  });
}

console.log(`정적 빌드 완료: ${path.relative(projectRoot, outputDirectory)}/`);
