const CDN = "https://cjrtnc.leaningtech.com/4.3/";

function installRuntimeCache(assets) {
  const cache = new Map();
  for (const asset of assets) {
    if (!asset || typeof asset.url !== "string" || !asset.url.startsWith(CDN)
      || asset.url.includes("?") || asset.url.includes("#")
      || !(asset.bytes instanceof Uint8Array) || ![200, 204].includes(asset.status)
      || cache.has(asset.url)) throw new Error("Java 실행 자산이 올바르지 않습니다.");
    cache.set(asset.url, asset);
  }
  if (cache.size !== 14) throw new Error("Java 실행 자산이 누락됐습니다.");
  let misses = 0;
  let lastMiss = "";
  const get = (url) => {
    if (typeof url !== "string" || !url.startsWith(CDN) || url.includes("?") || url.includes("#") || !cache.has(url)) {
      misses++;
      lastMiss = typeof url === "string" && url.startsWith(CDN)
        ? url.slice(CDN.length).split(/[?#]/, 1)[0].split("/").at(-1).slice(0, 64)
        : "non-CDN";
      throw new TypeError("준비되지 않은 Java 자산 요청입니다.");
    }
    return cache.get(url);
  };
  const responseFor = (url, range) => {
    const asset = get(url);
    const length = asset.bytes.byteLength;
    let status = asset.status;
    let start = 0;
    let end = length - 1;
    const headers = new Headers({ "Accept-Ranges": "bytes", "Last-Modified": asset.lastModified || "Sat, 26 Sep 2026 00:00:00 GMT" });
    if (range !== null) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) throw new TypeError("지원하지 않는 Java 자산 범위입니다.");
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) throw new TypeError("잘못된 Java 자산 범위입니다.");
      if (start >= length) {
        status = 416;
        headers.set("Content-Range", `bytes */${length}`);
      } else {
        end = Math.min(end, length - 1);
        status = 206;
        headers.set("Content-Range", `bytes ${start}-${end}/${length}`);
      }
    }
    const bytes = status === 204 || status === 416 ? new Uint8Array() : asset.bytes.slice(start, end + 1);
    headers.set("Content-Length", String(bytes.byteLength));
    const response = new Response(status === 204 ? null : bytes, { status, headers });
    Object.defineProperty(response, "url", { value: url });
    return response;
  };
  const memoryFetch = (input, init = {}) => {
    if (typeof input !== "string" || (init.method && init.method !== "GET") || init.body != null) {
      return Promise.reject(new TypeError("지원하지 않는 Java 자산 요청입니다."));
    }
    const headers = new Headers(init.headers || {});
    if ([...headers.keys()].some((key) => key !== "range")) return Promise.reject(new TypeError("지원하지 않는 Java 자산 헤더입니다."));
    try { return Promise.resolve(responseFor(input, headers.get("Range"))); }
    catch (error) { return Promise.reject(error); }
  };
  class MemoryXHR {
    open(method, url) { if (method !== "GET") throw new TypeError("지원하지 않는 Java 자산 메서드입니다."); this.url = url; }
    send() {
      queueMicrotask(() => {
        try {
          if (this.responseType !== "arraybuffer") throw new TypeError("지원하지 않는 Java 자산 응답입니다.");
          const asset = get(this.url);
          if (asset.status !== 200) throw new TypeError("Java 자산 응답이 올바르지 않습니다.");
          this.status = 200;
          this.response = asset.bytes.slice().buffer;
          this.onload?.();
        } catch (error) { this.onerror?.(error); }
      });
    }
  }
  const importCachedScript = (...urls) => {
    if (urls.length !== 1 || urls[0] !== CDN + "cheerpOS.js") throw new TypeError("준비되지 않은 Java 스크립트입니다.");
    (0, eval)(new TextDecoder().decode(get(urls[0]).bytes));
  };
  Object.defineProperty(self, "fetch", { value: memoryFetch, writable: false, configurable: false });
  Object.defineProperty(self, "XMLHttpRequest", { value: MemoryXHR, writable: false, configurable: false });
  Object.defineProperty(self, "importScripts", { value: importCachedScript, writable: false, configurable: false });
  return { get, misses: () => misses, lastMiss: () => lastMiss };
}

export async function initializeJavaRuntime(runtimeAssets) {
  const cache = installRuntimeCache(runtimeAssets);
  const moduleUrl = URL.createObjectURL(new Blob([cache.get(CDN + "cj3.js").bytes], { type: "text/javascript" }));
  let module;
  try { module = await import(moduleUrl); } finally { URL.revokeObjectURL(moduleUrl); }
  const runtime = await module.default({ absPath: CDN + "cj3.wasm" });
  await runtime.cj3Init({ version: 17, status: "none" }, CDN.slice(0, -1), runtime);
  if (cache.misses() !== 0) throw new Error(`Java 실행 자산이 누락됐습니다: ${cache.lastMiss()}`);
  return { runtime, cacheMisses: cache.misses, lastMiss: cache.lastMiss };
}
