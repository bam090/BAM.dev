import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkClassicWorker } from "./build-classic-worker.mjs";
import { createCodingTestArtifacts } from "../desktop/runtime/coding-test-artifacts.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const entries = ["index.html", "content", "src", "styles", "assets", "runtime"];

await checkClassicWorker();
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const entry of entries) {
  await cp(path.join(projectRoot, entry), path.join(outputDirectory, entry), {
    recursive: true,
  });
}

const ctCollection = JSON.parse(await readFile(path.join(projectRoot, "content/coding-tests/java.json"), "utf8"));
const ctArtifact = `${JSON.stringify(createCodingTestArtifacts(ctCollection))}\n`;
const ctOutput = path.join(outputDirectory, "runtime/java-browser/compiler");
await mkdir(ctOutput, { recursive: true });
await writeFile(path.join(ctOutput, "ct-artifacts.json"), ctArtifact);
await cp(path.join(projectRoot, "desktop/runtime/SolutionInvoker.java"),
  path.join(ctOutput, "SolutionInvoker.java"));

console.log(`정적 빌드 완료: ${path.relative(projectRoot, outputDirectory)}/`);
