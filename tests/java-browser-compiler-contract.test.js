import assert from "node:assert/strict";
import test from "node:test";

import { compileJava } from "../src/grading/java-browser-compiler.js";

const assets = {
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
  const previous = Object.getOwnPropertyDescriptor(globalThis, "Worker");
  const workers = [];
  class FakeWorker {
    constructor() { this.terminated = false; workers.push(this); }
    postMessage(request) {
      this.request = request;
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
