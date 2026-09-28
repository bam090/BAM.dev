import assert from "node:assert/strict";
import test from "node:test";

import { JAVA_BROWSER_ASSET_MANIFEST } from "../src/grading/java-browser-assets.js";
import { clearJavaCompileCache, compileJava } from "../src/grading/java-browser-compiler.js";
import { initializeJavaRuntime } from "../src/workers/java-browser-runtime.js";
import { JavaBrowserProvider } from "../src/grading/java-browser-provider.js";

const assets = {
  runtime: JAVA_BROWSER_ASSET_MANIFEST.runtime.map((spec, index) => ({
    url: spec.url, status: spec.status, bytes: new Uint8Array([index + 1]),
  })),
  runtimeBootstrap: new Uint8Array([7, 8, 9]),
  compiler: {
    ecjJar: new Uint8Array([1]),
    helperClasses: {
      JrtCompiler: new Uint8Array([1]),
      "JrtCompiler$JrtNames": new Uint8Array([1]),
      "JrtCompiler$1": new Uint8Array([1]),
    },
  },
};
const java17Class = Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 61]).toString("base64");
const java21Class = Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 65]).toString("base64");

function installWorker(t, reply) {
  clearJavaCompileCache();
  t.after(clearJavaCompileCache);
  const previous = Object.getOwnPropertyDescriptor(globalThis, "Worker");
  const workers = [];
  class FakeWorker {
    constructor() { this.terminated = false; workers.push(this); }
    postMessage(request, transfer) {
      this.request = request;
      this.transfer = transfer;
      queueMicrotask(() => reply?.(this, request));
    }
    terminate() { this.terminated = true; }
    send(result, runId = this.request.runId) {
      this.onmessage({ data: { type: "compiled-result", runId, result } });
    }
  }
  Object.defineProperty(globalThis, "Worker", { configurable: true, value: FakeWorker });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "Worker", previous);
    else delete globalThis.Worker;
  });
  return workers;
}

test("Java 17 결과는 Solution과 nested·기본 패키지 helper를 전달한다", async (t) => {
  const workers = installWorker(t, (worker) => worker.send({
    status: "compiled", diagnostics: [], classesBase64: {
      Solution: java17Class,
      "Solution$Nested": java17Class,
      Helper: java17Class,
    },
  }));
  const result = await compileJava({ source: "class Solution {}" }, { assets });
  assert.equal(result.status, "compiled");
  assert.deepEqual(Object.keys(result.classes).sort(), ["Solution", "Solution$Nested", "Helper"].sort());
  assert.deepEqual(result.classes.Solution, Uint8Array.from(Buffer.from(java17Class, "base64")));
  assert.equal(workers[0].terminated, true);
});

test("성공 다음 컴파일 오류는 이전 class를 재사용하지 않고 typed diagnostic만 남긴다", async (t) => {
  let calls = 0;
  const workers = installWorker(t, (worker) => worker.send(++calls === 1
    ? { status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } }
    : { status: "compile_error", diagnostics: [{ message: "cannot find symbol", line: 1, column: 7 }], classesBase64: {} }));
  await compileJava({ source: "class Solution {}" }, { assets });
  const result = await compileJava({ source: "class Solution { invalid }" }, { assets });
  assert.deepEqual(result, {
    status: "compile_error",
    diagnostics: [{ message: "cannot find symbol", line: 1, column: 7 }],
    classes: {},
  });
  assert.equal(workers.length, 2);
  assert.ok(workers.every((worker) => worker.terminated));
});

test("다른 run 응답과 Java 21 class는 실패로 닫고 Worker를 종료한다", async (t) => {
  const workers = installWorker(t, (worker, request) => worker.send({
    status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class },
  }, `${request.runId}-old`));
  await assert.rejects(compileJava({ source: "class Solution {}" }, { assets }), { code: "engine_error" });
  workers[0].send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  assert.equal(workers[0].terminated, true);
  installWorker(t, (worker) => worker.send({
    status: "compiled", diagnostics: [], classesBase64: { Solution: java21Class },
  }));
  await assert.rejects(compileJava({ source: "class Solution {}" }, { assets }), { code: "engine_error" });
});

test("취소와 UTF-8 source 상한은 준비 자산이나 늦은 결과로 우회되지 않는다", async (t) => {
  const workers = installWorker(t);
  const controller = new AbortController();
  const pending = compileJava({ source: "class Solution {}" }, { assets, signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: "cancelled" });
  assert.equal(workers[0].terminated, true);
  workers[0].send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  assert.throws(
    () => compileJava({ source: "😀".repeat(32 * 1024 + 1) }, { assets }),
    { code: "invalid_input" },
  );
  assert.equal(workers.length, 1);
});

test("합법적인 __proto__ class도 누락 없이 own class entry로 전달한다", async (t) => {
  installWorker(t, (worker) => worker.send({
    status: "compiled", diagnostics: [],
    classesBase64: { Solution: java17Class, ["__proto__"]: java17Class },
  }));
  const result = await compileJava({ source: "class Solution {} class __proto__ {}" }, { assets });
  assert.equal(Object.hasOwn(result.classes, "__proto__"), true);
  assert.ok(result.classes.__proto__ instanceof Uint8Array);
});


test("검증된 runtime 13개와 bootstrap 바이트를 compiler Worker에 전달하고 원본을 보존한다", async (t) => {
  const workers = installWorker(t, (worker) => worker.send({
    status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class },
  }));
  await compileJava({ source: "class Solution {}" }, { assets });
  const worker = workers[0];
  assert.deepEqual(worker.request.runtimeAssets.map(({ url }) => url),
    JAVA_BROWSER_ASSET_MANIFEST.runtime.map(({ url }) => url));
  assert.deepEqual(worker.request.runtimeBootstrap, new Uint8Array([7, 8, 9]));
  assert.equal(worker.transfer, undefined, "원본 ArrayBuffer를 Worker로 이전하지 않아야 합니다.");
  assert.equal(assets.runtime[0].bytes.byteLength, 1);
  assert.equal(assets.runtimeBootstrap.byteLength, 3);
});

test("런타임 자산 누락은 Worker 생성 전에 거부하고 bootstrap 실패는 typed error로 닫는다", async (t) => {
  const workers = installWorker(t, (worker, request) => worker.onmessage({ data: {
    type: "compiler-error", runId: request.runId, message: "Java runtime asset is missing",
  } }));
  assert.throws(() => compileJava({ source: "class Solution {}" }, {
    assets: { ...assets, runtime: assets.runtime.slice(1) },
  }), { code: "engine_error" });
  assert.throws(() => compileJava({ source: "class Solution {}" }, {
    assets: { ...assets, runtimeBootstrap: null },
  }), { code: "engine_error" });
  assert.equal(workers.length, 0);
  await assert.rejects(compileJava({ source: "class Solution {}" }, { assets }),
    { code: "engine_error" });
  assert.equal(workers.length, 1);
  assert.equal(workers[0].terminated, true);
});

test("공통 bootstrap은 누락·중복·query가 있는 runtime cache를 설치 전에 거부한다", async () => {
  const validShape = assets.runtime.map((asset) => ({ ...asset }));
  await assert.rejects(initializeJavaRuntime(validShape.slice(1)), /누락/u);
  await assert.rejects(initializeJavaRuntime(validShape.map((asset, index) =>
    index === 1 ? { ...asset, url: validShape[0].url } : asset)), /올바르지/u);
  await assert.rejects(initializeJavaRuntime(validShape.map((asset, index) =>
    index === 1 ? { ...asset, url: `${asset.url}?bypass=1` } : asset)), /올바르지/u);
});


test("RAM1 cache는 동일 소스만 재사용하고 class 바이트를 복사한다", async (t) => {
  const workers = installWorker(t, (worker) => worker.send({
    status: "compiled", diagnostics: [], classesBase64: {
      Solution: java17Class, "Solution$Nested": java17Class, ["__proto__"]: java17Class,
    },
  }));
  const input = { source: "class Solution {}" };
  const first = await compileJava(input, { assets });
  first.classes.Solution[0] = 0;
  first.classes["__proto__"][0] = 0;
  const second = await compileJava(input, { assets });
  assert.equal(workers.length, 1);
  assert.equal(Object.getPrototypeOf(second.classes), null);
  assert.equal(second.classes.Solution[0], 0xca);
  assert.equal(second.classes["__proto__"][0], 0xca);
  second.classes.Solution[1] = 0;
  const third = await compileJava(input, { assets });
  assert.equal(third.classes.Solution[1], 0xfe);
  assert.notEqual(first.classes.Solution, second.classes.Solution);
  assert.notEqual(second.classes.Solution, third.classes.Solution);
});

test("RAM1 cache는 소스·자산 identity 변경에 miss하고 실패·취소를 저장하지 않는다", async (t) => {
  const workers = installWorker(t, (worker, request) => worker.send(
    request.sources[0].source.includes("broken")
      ? { status: "compile_error", diagnostics: [{ message: "invalid", line: 1, column: 1 }], classesBase64: {} }
      : { status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } },
  ));
  const good = { source: "class Solution {}" };
  await compileJava(good, { assets });
  await compileJava({ source: "class Solution { broken }" }, { assets });
  assert.equal(workers.length, 2);
  await compileJava(good, { assets });
  assert.equal(workers.length, 2, "컴파일 오류가 이전 성공 항목을 덮어쓰면 안 됩니다.");
  await compileJava({ source: "class Solution { int n; }" }, { assets });
  assert.equal(workers.length, 3);
  await compileJava(good, { assets });
  assert.equal(workers.length, 4, "가장 최근 성공 항목 한 개만 보존해야 합니다.");
  await compileJava(good, { assets: { ...assets } });
  assert.equal(workers.length, 5, "자산 객체가 교체되면 다시 컴파일해야 합니다.");
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(compileJava(good, { assets, signal: controller.signal }), { code: "cancelled" });
  assert.equal(workers.length, 5);
});

test("RAM1 cache clear와 provider dispose는 hit·진행 중 응답을 무효화한다", async (t) => {
  let delayedCount = 0;
  const workers = installWorker(t, (worker, request) => {
    if (request.sources[0].source === "class Solution { int n; }" && ++delayedCount === 1) return;
    worker.send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  });
  const input = { source: "class Solution {}" };
  await compileJava(input, { assets });
  const hit = compileJava(input, { assets });
  clearJavaCompileCache();
  await assert.rejects(hit, { code: "cancelled" });
  await compileJava(input, { assets });
  assert.equal(workers.length, 2);
  const provider = new JavaBrowserProvider();
  provider.dispose();
  await compileJava(input, { assets });
  assert.equal(workers.length, 3);
  const pending = compileJava({ source: "class Solution { int n; }" }, { assets });
  assert.equal(workers.length, 4);
  clearJavaCompileCache();
  workers[3].send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  await pending;
  await compileJava({ source: "class Solution { int n; }" }, { assets });
  assert.equal(workers.length, 5, "clear 후 도착한 성공 응답은 cache에 넣지 않아야 합니다.");
});


test("RAM1 cache는 취소된 Worker의 늦은 성공을 저장하지 않는다", async (t) => {
  const workers = installWorker(t, (worker, request) => {
    if (workers.length === 1) return;
    worker.send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  });
  const controller = new AbortController();
  const input = { source: "class Solution { long value; }" };
  const pending = compileJava(input, { assets, signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: "cancelled" });
  workers[0].send({ status: "compiled", diagnostics: [], classesBase64: { Solution: java17Class } });
  const retried = await compileJava(input, { assets });
  assert.equal(retried.status, "compiled");
  assert.equal(workers.length, 2);
  assert.equal(workers[0].terminated, true);
});
