import assert from "node:assert/strict";
import test from "node:test";

import { compileJavaSources } from "../src/grading/java-browser-compiler.js";

const assets = {
  compiler: {
    ecjJar: new Uint8Array([1]),
    junitJar: new Uint8Array([1]),
    helperClasses: {
      JrtCompiler: new Uint8Array([1]),
      "JrtCompiler$JrtNames": new Uint8Array([1]),
      "JrtCompiler$1": new Uint8Array([1]),
    },
  },
};
const class17 = Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 61]).toString("base64");
const source = (path = "Solution.java", text = "class Solution {}") => ({ path, source: text });
const originalSources = () => [
  source(),
  source("dev/bam/runtime/SolutionInvoker.java", "package dev.bam.runtime; class SolutionInvoker {}"),
  source("bridge/array/onedimensional/solution/ArraySolution01.java", "package bridge.array.onedimensional.solution; class ArraySolution01 {}"),
  source("bridge/array/onedimensional/test/ArraySolution01Test.java", "package bridge.array.onedimensional.test; class ArraySolution01Test {}"),
];

function installWorker(t, reply) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "Worker");
  const requests = [];
  class FakeWorker {
    postMessage(request) {
      requests.push(request);
      queueMicrotask(() => reply?.(this, request));
    }
    terminate() { this.terminated = true; }
    send(result, request) {
      this.onmessage({ data: { type: "compiled-result", runId: request.runId, result } });
    }
  }
  Object.defineProperty(globalThis, "Worker", { configurable: true, value: FakeWorker });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "Worker", previous);
    else delete globalThis.Worker;
  });
  return requests;
}

test("JUnit profile은 원본 상대 경로를 전달하고 dotted·특수 class key를 보존한다", async (t) => {
  const requests = installWorker(t, (worker, request) => worker.send({
    status: "compiled", diagnostics: [],
    classesBase64: {
      Solution: class17,
      "bridge.array.onedimensional.test.ArraySolution01Test": class17,
      ["__proto__"]: class17,
    },
  }, request));
  const sources = originalSources();
  const result = await compileJavaSources({ sources, entryClass: "Solution", profile: "junit" }, { assets });
  assert.deepEqual(requests[0].sources, sources);
  assert.equal(requests[0].entryClass, "Solution");
  assert.equal(requests[0].profile, "junit");
  assert.equal(result.status, "compiled");
  assert.deepEqual(Object.keys(result.classes).sort(), ["Solution", "bridge.array.onedimensional.test.ArraySolution01Test", "__proto__"].sort());
  assert.ok(result.classes["bridge.array.onedimensional.test.ArraySolution01Test"] instanceof Uint8Array);
  assert.equal(Object.hasOwn(result.classes, "__proto__"), true);
});

test("JUnit source path는 상위·절대·URL·역슬래시·중복을 Worker 전에 거부한다", async (t) => {
  const requests = installWorker(t);
  const badPaths = ["../Test.java", "./Test.java", "/tmp/Test.java", "C:/Test.java", "https://example.test/Test.java", "pkg\\Test.java", "pkg//Test.java"];
  for (const path of badPaths) {
    await assert.rejects(
      async () => compileJavaSources({ sources: originalSources().map((unit, index) => index === 3 ? source(path) : unit), entryClass: "Solution", profile: "junit" }, { assets }),
      { code: "invalid_input" },
      path,
    );
  }
  await assert.rejects(
    async () => compileJavaSources({ sources: originalSources().map((unit, index) => index === 3 ? source("bridge/array/onedimensional/solution/ArraySolution01.java") : unit), entryClass: "Solution", profile: "junit" }, { assets }),
    { code: "invalid_input" },
  );
  assert.equal(requests.length, 0);
});

test("Quest와 JUnit의 고정 entry·source 개수·UTF-8 상한을 Worker 전에 지킨다", async (t) => {
  const requests = installWorker(t);
  const invalid = [
    { sources: [source(), source("Extra.java")], entryClass: "Solution", profile: "quest" },
    { sources: originalSources(), entryClass: "other.Solution", profile: "junit" },
    { sources: [...originalSources(), ...Array.from({ length: 5 }, (_, index) => source(`Extra${index}.java`))], entryClass: "Solution", profile: "junit" },
    { sources: originalSources().map((unit, index) => index === 0 ? source("Solution.java", "😀".repeat(32 * 1024 + 1)) : unit), entryClass: "Solution", profile: "junit" },
  ];
  for (const input of invalid) {
    await assert.rejects(async () => compileJavaSources(input, { assets }), { code: "invalid_input" });
  }
  assert.equal(requests.length, 0);
});
