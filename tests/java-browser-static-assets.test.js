import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createCodingTestArtifacts } from "../desktop/runtime/coding-test-artifacts.mjs";
import { JAVA_BROWSER_ASSET_MANIFEST } from "../src/grading/java-browser-assets.js";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const staticRoot = process.env.BAM_JAVA_STATIC_ROOT ?? repositoryRoot;
const localAssets = [...JAVA_BROWSER_ASSET_MANIFEST.compiler,
  JAVA_BROWSER_ASSET_MANIFEST.executor, JAVA_BROWSER_ASSET_MANIFEST.runtimeBootstrap];
const assetPath = (asset) => path.relative(repositoryRoot, fileURLToPath(asset.url));

test("Pages 루트의 Java 고정 자산은 동적 생성 없이 manifest 응답·크기·해시를 만족한다", async (t) => {
  // dev-server의 생성 fallback을 쓰면 Pages에서 누락된 파일을 발견할 수 없다.
  const files = new Map(localAssets.map((asset) => [`/BAM.dev/${assetPath(asset)}`, assetPath(asset)]));
  const server = createServer(async (request, response) => {
    try {
      const relativePath = files.get(request.url);
      if (!relativePath) throw new Error("unknown asset");
      response.end(await readFile(path.join(staticRoot, relativePath)));
    } catch {
      response.writeHead(404);
      response.end("Not Found");
    }
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const asset of localAssets) {
    await t.test(assetPath(asset), async () => {
      const url = `${origin}/BAM.dev/${assetPath(asset)}`;
      const response = await fetch(url, { redirect: "error" });
      assert.equal(response.url, url);
      assert.equal(response.status, asset.status, assetPath(asset));
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(bytes.length, asset.size, assetPath(asset));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, assetPath(asset));
    });
  }
});

test("정적 CT 자료와 호출 소스는 빌드에서 사용하는 원본의 결정적 바이트와 일치한다", async () => {
  const collection = JSON.parse(await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"));
  const generated = Buffer.from(`${JSON.stringify(createCodingTestArtifacts(collection))}\n`);
  assert.deepEqual(await readFile(path.join(staticRoot, "runtime/java-browser/compiler/ct-artifacts.json")), generated);
  assert.deepEqual(await readFile(path.join(staticRoot, "runtime/java-browser/compiler/SolutionInvoker.java")),
    await readFile(new URL("../desktop/runtime/SolutionInvoker.java", import.meta.url)));
});
