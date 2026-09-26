const CDN = "https://cjrtnc.leaningtech.com/4.3/";
const MAX_CLASSES = 256;
const MAX_CLASS_BYTES = 8 * 1024 * 1024;

function describe(error) {
  return String(error?.message ?? error).slice(0, 800);
}

function lockChildWorkers() {
  for (const name of ["Worker", "SharedWorker"]) {
    let holder = self;
    while (holder) {
      const descriptor = Object.getOwnPropertyDescriptor(holder, name);
      if (descriptor) {
        if (!descriptor.configurable) throw new Error(`${name} 생성자를 차단할 수 없습니다.`);
        Object.defineProperty(holder, name, { value: undefined, writable: false, configurable: false });
      }
      holder = Object.getPrototypeOf(holder);
    }
    if (!Object.hasOwn(self, name)) Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false });
  }
  if (self.Worker !== undefined || self.SharedWorker !== undefined) throw new Error("하위 Worker를 차단하지 못했습니다.");
}

function installRuntimeCache(assets) {
  const cache = new Map();
  for (const asset of assets) {
    if (!asset || typeof asset.url !== "string" || !asset.url.startsWith(CDN)
      || asset.url.includes("?") || asset.url.includes("#")
      || !(asset.bytes instanceof Uint8Array) || ![200, 204].includes(asset.status)
      || cache.has(asset.url)) throw new Error("Java 실행 자산이 올바르지 않습니다.");
    cache.set(asset.url, asset);
  }
  if (cache.size !== 13) throw new Error("Java 실행 자산이 누락됐습니다.");
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

function addClasses(classes) {
  if (!classes || typeof classes !== "object" || !Object.hasOwn(classes, "Solution")) throw new Error("Solution class가 없습니다.");
  const entries = Object.entries(classes);
  if (entries.length === 0 || entries.length > MAX_CLASSES) throw new Error("Java class 수 제한을 초과했습니다.");
  let total = 0;
  for (const [name, bytes] of entries) {
    if (!/^[\p{L}_$][\p{L}\p{M}\p{N}_$]*$/u.test(name) || !(bytes instanceof Uint8Array)
      || bytes.byteLength < 8 || bytes[0] !== 0xca || bytes[1] !== 0xfe || bytes[2] !== 0xba || bytes[3] !== 0xbe
      || bytes[4] !== 0 || bytes[5] !== 0 || bytes[6] !== 0 || bytes[7] !== 61) throw new Error("Java class 형식이 올바르지 않습니다.");
    total += bytes.byteLength;
    if (total > MAX_CLASS_BYTES) throw new Error("Java class 크기 제한을 초과했습니다.");
    self.cheerpOSAddStringFile(`/str/${name}.class`, bytes);
  }
}

self.addEventListener("message", async (event) => {
  const port = event.ports[0];
  const runId = event.data?.runId;
  if (!port || !Number.isSafeInteger(runId)) return;
  const privateReply = port.postMessage.bind(port);
  const replyError = (code, error) => privateReply({ kind: "error", runId, code, message: describe(error) });
  let cache;
  let executionStarted = false;
  try {
    lockChildWorkers();
    cache = installRuntimeCache(event.data.assets);
    const moduleUrl = URL.createObjectURL(new Blob([cache.get(CDN + "cj3.js").bytes], { type: "text/javascript" }));
    let module;
    try { module = await import(moduleUrl); } finally { URL.revokeObjectURL(moduleUrl); }
    const runtime = await module.default({ absPath: CDN + "cj3.wasm" });
    await runtime.cj3Init({ version: 17, status: "none" }, CDN.slice(0, -1), runtime);
    if (cache.misses() !== 0) throw new Error(`Java 실행 자산이 누락됐습니다: ${cache.lastMiss()}`);
    if (event.data.mode === "junit") {
      const jar = event.data.jarBytes;
      const junit = event.data.junitJar;
      const selector = event.data.selector;
      if (!(jar instanceof Uint8Array) || jar.byteLength < 22 || jar.byteLength > 10 * 1024 * 1024
        || jar[0] !== 0x50 || jar[1] !== 0x4b
        || !(junit instanceof Uint8Array) || junit.byteLength !== 2_997_949
        || !selector || typeof selector !== "object"
        || typeof selector.testClass !== "string" || selector.testClass.length > 255
        || typeof selector.method !== "string" || selector.method.length > 255
        || typeof selector.signature !== "string" || selector.signature.length > 512) throw new Error("Java JUnit 실행 입력이 올바르지 않습니다.");
      self.cheerpOSAddStringFile("/str/classes.jar", jar);
      self.cheerpOSAddStringFile("/str/junit.jar", junit);
      const library = await runtime.cheerpjRunLibrary("/str/classes.jar:/str/junit.jar");
      const runner = await library.CtBrowserRunner;
      const raw = await runner.run(selector.testClass, selector.method, selector.signature);
      if (typeof raw !== "string" || raw.length > 4096) throw new Error("Java JUnit 결과가 올바르지 않습니다.");
      if (cache.misses() !== 0) throw new Error(`Java 실행 자산이 누락됐습니다: ${cache.lastMiss()}`);
      privateReply({ kind: "junit", runId, report: JSON.parse(raw) });
      return;
    }
    addClasses(event.data.classes);
    const args = event.data.args;
    const kind = event.data.questKind ?? "total-price";
    const integer = (value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
    const validArray = (value, max) => Array.isArray(value) && value.length <= max && value.every(integer);
    const valid = kind === "total-price"
      ? Array.isArray(args) && args.length === 3 && args.every((value) => integer(value) && value >= 0)
      : kind === "array-replace"
        ? Array.isArray(args) && args.length === 3 && validArray(args[0], 100) && args.slice(1).every(integer)
        : kind === "array-count"
          ? Array.isArray(args) && args.length === 3 && validArray(args[0], 1_000) && args.slice(1).every(integer)
          : kind === "queue-rotate" && Array.isArray(args) && args.length === 1 && validArray(args[0], 100_000);
    if (!valid) throw new Error("공개 입력이 올바르지 않습니다.");
    executionStarted = true;
    const library = await runtime.cheerpjRunLibrary("/str/");
    const entry = await library[kind === "array-replace" || kind === "queue-rotate" ? "BamQuestObserver" : "Solution"];
    const raw = await entry[kind === "total-price" ? "totalPrice" : kind === "array-count" ? "solve" : "run"](...args);
    if (cache.misses() !== 0) throw new Error("Java 실행 자산이 누락됐습니다.");
    if (kind === "total-price") {
      if (typeof raw !== "bigint") throw new TypeError("long 반환값을 확인할 수 없습니다.");
      privateReply({ kind: "result", runId, actual: raw });
    } else if (kind === "array-count") {
      if (!integer(raw)) throw new TypeError("int 반환값을 확인할 수 없습니다.");
      privateReply({ kind: "result", runId, actual: raw });
    } else {
      if (!(raw instanceof Int32Array) || raw.length < 3 || ![0, 1].includes(raw[0])
        || ![0, 1].includes(raw[1]) || raw[2] < -1 || raw[2] > 100_000
        || (raw[2] === -1 ? raw.length !== 3 : raw.length !== raw[2] + 3)) throw new TypeError("Java 배열 관찰 결과가 올바르지 않습니다.");
      privateReply({ kind: "result", runId,
        actual: raw[2] === -1 ? null : Array.from(raw.subarray(3)),
        observations: { argument0Unchanged: raw[0] === 1, returnNotArgument0: raw[1] === 1 } });
    }
  } catch (error) {
    replyError(cache?.misses() ? "engine_error" : executionStarted ? "runtime_error" : "engine_error", error);
  }
}, { once: true });
