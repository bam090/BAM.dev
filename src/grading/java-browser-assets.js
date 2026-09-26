const CDN = "https://cjrtnc.leaningtech.com/4.3/";
const LOCAL = new URL("../../", import.meta.url);
const MAX_BYTES = 128 * 1024 * 1024;

const RUNTIME = [
  ["loader.js", 200, 7521, "5b0ec873d1ae97d184928041b5f97ecf36eb990dac3baec5836a90bd87fa7a9f"],
  ["cj3.js", 200, 666055, "5bcf00711009cbb12b858dcbea865cfe0e9d652cfc95f55ad20a600724462644"],
  ["cj3.wasm", 200, 372758, "b4d6581f7369729a96bddd7b060e3ce539ec4fb1d517e9159615fc0f915d673b"],
  ["cheerpOS.js", 200, 90871, "549c7074a761720b09e5a6526fdb53b686958ffa5f157f16d60ebd0b4a154be3"],
  ["cj3n17.wasm", 200, 3227431, "ea4763c1a69ae5c9fcfb59643d2b5e6fcd0c97667222b10732d2cfd5f33cd954"],
  ["17/lib/modules", 200, 38145733, "f121f2dd8164921c36ece441d0ad17043ad3067a698a35ff0b58328cabe93ff7"],
  ["etc/users", 200, 39, "ba22ff21f2d73daf148452051c728541389dc0f91420b4f3bb371bd025362810"],
  ["etc/localtime", 204, 0, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["17/jre/lib/cheerpj-handlers.jar", 200, 6145, "aee6bb2716976235f49358d509bd863dd9050b6d3460d5aae26fa2c9af22a4b4"],
  ["17/jre/lib/cheerpj-awt.jar", 200, 97111, "963579a22f483a61e13a1e7dec05e78f21e0e2f671f8b7b55aa66b26de951b6b"],
  ["17/jre/lib/cheerpj-jsobject.jar", 200, 1247, "7f860043d6b6a62306bd026a30b4fef7cbfed10272d6a53a7ab77a1605fb0ff7"],
  ["17/conf/security/java.security", 200, 67189, "c129348e7a3f40b929cb035372dfd9c33f15f366022f6c6c6d35ecd928a307f4"],
  ["17/conf/logging.properties", 200, 2732, "b62d2733ab99556b108a1951d894c5a8d76b1ac7a00c02c388f9eb9be046c56f"],
];

const COMPILER = [
  ["ecjJar", "assets/java-browser/compiler/ecj-3.33.0.jar", 3160927, "f7686c4960cf70c2ebc5c500a73a8cfc04541b730c18f1c5c21329889b137f45"],
  ["JrtCompiler", "runtime/java-browser/compiler/JrtCompiler.class", 6665, "ec720b7421b94d8b37723d81379194b2e760257f0d620cd2e7897bf624eac771"],
  ["JrtCompiler$JrtNames", "runtime/java-browser/compiler/JrtCompiler$JrtNames.class", 4463, "943cc4fe7caea186c9857b5a0fe4a3f74be71a75ac3d508c73f6288a1cffcfde"],
  ["JrtCompiler$1", "runtime/java-browser/compiler/JrtCompiler$1.class", 3411, "964d4182e7ec5f297f153a2f8fee9527f7d808b849dde13868c8a3c881b4bd5b"],
  ["junitJar", "assets/java-browser/compiler/junit-platform-console-standalone-6.1.3.jar", 2997949, "e62b96ac475dbcde8599ea905d088f65d90778f86e259b856a49fa5c4ea256ec"],
  ["ctRunnerClass", "runtime/java-browser/compiler/CtBrowserRunner.class", 8398, "c5973d28cb64f9a71b897c4cbba3bdff3068489878b966cfe05f52f59196f6bb"],
  ["ctArtifacts", "runtime/java-browser/compiler/ct-artifacts.json", 448346, "e18b11eb41cb02e1498c7437eca79853e2df378b6c95b153cc0b0200fb03f33e"],
  ["solutionInvokerSource", "runtime/java-browser/compiler/SolutionInvoker.java", 1281, "22bc673851ad7bf799d0b2a0600f1043114dc62287bbd236380638a1d56cbdf8"],
];

export const JAVA_BROWSER_ASSET_MANIFEST = Object.freeze({
  runtime: RUNTIME.map(([path, status, size, sha256]) => Object.freeze({ url: CDN + path, status, size, sha256 })),
  compiler: COMPILER.map(([name, path, size, sha256]) => Object.freeze({ name, url: new URL(path, LOCAL).href, status: 200, size, sha256 })),
  executor: Object.freeze({ url: new URL("src/workers/java-browser-executor.worker.js", LOCAL).href, status: 200, size: 11057, sha256: "05e6704a227fb8366bbe8fe9c5f0085adbbfd7790e4875dd11eed9a1657f5f49" }),
});

export const JAVA_BROWSER_ASSET_BYTES = [...JAVA_BROWSER_ASSET_MANIFEST.runtime, ...JAVA_BROWSER_ASSET_MANIFEST.compiler, JAVA_BROWSER_ASSET_MANIFEST.executor]
  .reduce((total, asset) => total + asset.size, 0);

async function readVerifiedAsset(asset, signal, onChunk) {
  const response = await fetch(asset.url, {
    method: "GET", mode: "cors", credentials: "omit", cache: "no-store",
    redirect: "error", referrerPolicy: "no-referrer", signal,
  });
  if (response.url !== asset.url || response.status !== asset.status) throw new Error(`Java 자산 응답이 일치하지 않습니다: ${asset.url}`);
  const chunks = [];
  let length = 0;
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > asset.size) { await reader.cancel(); throw new Error(`Java 자산 크기가 초과됐습니다: ${asset.url}`); }
      chunks.push(value);
      onChunk(value.byteLength);
    }
  }
  if (length !== asset.size) throw new Error(`Java 자산 크기가 일치하지 않습니다: ${asset.url}`);
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (sha256 !== asset.sha256) throw new Error(`Java 자산 해시가 일치하지 않습니다: ${asset.url}`);
  return { url: asset.url, status: asset.status, bytes, lastModified: response.headers.get("Last-Modified") ?? "" };
}

export async function prepareJavaBrowserAssets({ signal, onProgress = () => {} } = {}) {
  const specs = [...JAVA_BROWSER_ASSET_MANIFEST.runtime, ...JAVA_BROWSER_ASSET_MANIFEST.compiler, JAVA_BROWSER_ASSET_MANIFEST.executor];
  if (JAVA_BROWSER_ASSET_BYTES > MAX_BYTES) throw new Error("Java 자산 제한을 초과했습니다.");
  let receivedBytes = 0;
  const loaded = new Map();
  for (const spec of specs) {
    signal?.throwIfAborted();
    const asset = await readVerifiedAsset(spec, signal, (bytes) => {
      receivedBytes += bytes;
      if (receivedBytes > MAX_BYTES) throw new Error("Java 자산 제한을 초과했습니다.");
      onProgress({ receivedBytes, totalBytes: JAVA_BROWSER_ASSET_BYTES, asset: spec.url });
    });
    loaded.set(spec.url, asset);
  }
  return {
    runtime: JAVA_BROWSER_ASSET_MANIFEST.runtime.map((spec) => loaded.get(spec.url)),
    compiler: {
      ecjJar: loaded.get(JAVA_BROWSER_ASSET_MANIFEST.compiler[0].url).bytes,
      helperClasses: Object.fromEntries(JAVA_BROWSER_ASSET_MANIFEST.compiler.slice(1, 4)
        .map((spec) => [spec.name, loaded.get(spec.url).bytes])),
      junitJar: loaded.get(JAVA_BROWSER_ASSET_MANIFEST.compiler[4].url).bytes,
      ctRunnerClass: loaded.get(JAVA_BROWSER_ASSET_MANIFEST.compiler[5].url).bytes,
      solutionInvokerSource: new TextDecoder().decode(loaded.get(JAVA_BROWSER_ASSET_MANIFEST.compiler[7].url).bytes),
    },
    ctArtifacts: JSON.parse(new TextDecoder().decode(loaded.get(JAVA_BROWSER_ASSET_MANIFEST.compiler[6].url).bytes)),
    executorSource: new TextDecoder().decode(loaded.get(JAVA_BROWSER_ASSET_MANIFEST.executor.url).bytes),
    receivedBytes,
  };
}
