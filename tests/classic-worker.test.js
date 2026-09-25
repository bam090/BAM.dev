import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { TextEncoder } from "node:util";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import { checkClassicWorker } from "../scripts/build-classic-worker.mjs";
import { BrowserCodeQuestRunner } from "../src/grading/browser-code-quest-runner.js";

const asset = new URL("../src/workers/javascript-code-runner.classic.js", import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));

test("classic Worker 자산은 원본과 같고 한 번의 공개 평가만 처리한다", async () => {
  await checkClassicWorker();

  let onMessage;
  let closeCount = 0;
  let resolveResult;
  const resultPromise = new Promise((resolve) => { resolveResult = resolve; });
  class FakeWorkerScope {
    addEventListener(type, listener) {
      if (type === "message") onMessage = listener;
    }
    postMessage(value) { resolveResult(value); }
    close() { closeCount += 1; }
  }
  const self = new FakeWorkerScope();
  const context = vm.createContext({
    self,
    DedicatedWorkerGlobalScope: FakeWorkerScope,
    TextEncoder,
  });
  vm.runInContext(await readFile(asset, "utf8"), context, { timeout: 1_000 });

  const message = {
    type: "execute",
    requestId: "run-1",
    testId: "public-1",
    workerToken: "worker-1",
    source: "function add(left, right) { return left + right; }",
    entryPoint: "add",
    args: [2, 3],
    limits: { maxOutputBytes: 1024, maxConsoleEntries: 10, maxConsoleBytes: 1024 },
  };
  onMessage({ data: vm.runInContext(`(${JSON.stringify(message)})`, context) });
  let timeout;
  const result = await Promise.race([
    resultPromise,
    new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error("classic Worker 결과 없음")), 2_000);
    }),
  ]);
  clearTimeout(timeout);
  assert.equal(result.type, "result");
  assert.equal(result.requestId, "run-1");
  assert.equal(result.testId, "public-1");
  assert.equal(result.workerToken, "worker-1");
  assert.equal(result.result.outcome, "completed");
  assert.equal(result.result.value, 5);
  assert.equal(closeCount, 1);

  onMessage({ data: vm.runInContext(`(${JSON.stringify({ ...message, requestId: "run-2" })})`, context) });
  await Promise.resolve();
  assert.equal(closeCount, 1);
});

test("기본 평가기는 classic 자산을 classic Worker로 연다", async () => {
  const originalWorker = globalThis.Worker;
  let created;
  class FakeWorker {
    constructor(url, options) {
      created = { url, options };
      this.listeners = new Map();
    }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    removeEventListener(type) { this.listeners.delete(type); }
    postMessage(message) {
      queueMicrotask(() => this.listeners.get("message")?.({
        data: {
          type: "result", requestId: message.requestId, testId: message.testId,
          workerToken: message.workerToken,
          result: { outcome: "completed", value: 5, console: [] },
        },
      }));
    }
    terminate() {}
  }
  globalThis.Worker = FakeWorker;
  try {
    const runner = new BrowserCodeQuestRunner();
    const report = await runner.run({
      requestId: "run-1", contractVersion: 1, questId: "quest-1", questRevision: 1,
      languageId: "javascript", suite: "public",
      source: "function add(a, b) { return a + b; }", entryPoint: "add",
      tests: [{ id: "public-1", args: [2, 3], expected: 5 }],
    });
    assert.equal(report.outcome, "passed");
    assert.equal(created.url.href, asset.href);
    assert.equal(created.options.type, "classic");
  } finally {
    if (originalWorker === undefined) delete globalThis.Worker;
    else globalThis.Worker = originalWorker;
  }
});

test("공백 없는 ESM export가 원본에 섞이면 생성 전에 닫힌다", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "bam-classic-guard-"));
  const inputs = [
    "scripts/build-classic-worker.mjs",
    "src/grading/code-grading.js",
    "src/grading/javascript-runtime.js",
    "src/workers/javascript-code-runner.worker.js",
  ];
  try {
    for (const relativePath of inputs) {
      const destination = path.join(temporaryRoot, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(root, relativePath), destination);
    }
    const gradingPath = path.join(temporaryRoot, "src/grading/code-grading.js");
    await writeFile(gradingPath, `${await readFile(gradingPath, "utf8")}\nexport{DEFAULT_EXECUTION_LIMITS};\n`);
    const output = spawnSync(process.execPath, [path.join(temporaryRoot, inputs[0])], { encoding: "utf8" });
    assert.notEqual(output.status, 0);
    assert.match(output.stderr, /SyntaxError/u);
    await assert.rejects(readFile(path.join(temporaryRoot, "src/workers/javascript-code-runner.classic.js")));
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
