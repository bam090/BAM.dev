import assert from "node:assert/strict";
import test from "node:test";

import { BamLearningApp } from "../src/app.js";
import { JAVA_BROWSER_ASSET_BYTES, JAVA_BROWSER_ASSET_MANIFEST, prepareJavaBrowserAssets } from "../src/grading/java-browser-assets.js";
import { JavaBrowserProvider } from "../src/grading/java-browser-provider.js";

const class17 = Uint8Array.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 61]);
const compiled = { status: "compiled", diagnostics: [], classes: { Solution: class17 } };
const quest = {
  id: "quest-java-total-price", revision: 1,
  publicTests: Array.from({ length: 6 }, (_, index) => ({
    id: `public-${index}`, label: `공개 ${index}`, args: [index, 0, 0], expected: String(index),
  })),
};
const request = { requestId: "run-1", questId: quest.id, revision: 1, source: "class Solution {}" };

function readyProvider(overrides = {}) {
  const provider = new JavaBrowserProvider({ getQuest: () => quest, ...overrides });
  provider.status = "ready";
  provider.assets = { runtime: [] };
  return provider;
}

test("준비 취소는 늦은 자산·진행 callback을 버리고 ready를 만들지 않는다", async () => {
  let finishAssets;
  let reportProgress;
  let compiles = 0;
  const states = [];
  const provider = new JavaBrowserProvider({
    onChange() { states.push(provider.status); },
    prepareAssets({ onProgress }) {
      reportProgress = onProgress;
      return new Promise((resolve) => { finishAssets = resolve; });
    },
    compile() { compiles++; return compiled; },
    execute() { return { kind: "result", actual: 17n }; },
  });
  const preparing = provider.prepare();
  assert.equal(provider.status, "preparing");
  provider.cancelPreparation();
  reportProgress({ receivedBytes: 1024, totalBytes: 1024 });
  finishAssets({ runtime: [] });
  assert.equal(await preparing, false);
  assert.equal(provider.status, "idle");
  assert.equal(provider.assets, null);
  assert.equal(compiles, 0);
  assert.deepEqual(states, ["preparing", "idle"]);
});

test("고정 Java 17 smoke 실패는 ready capability를 열지 않는다", async () => {
  const provider = new JavaBrowserProvider({
    prepareAssets: async () => ({ runtime: [] }),
    compile: async () => compiled,
    execute: async () => ({ kind: "result", actual: 18n }),
  });
  assert.equal(await provider.prepare(), false);
  assert.equal(provider.status, "error");
  assert.equal((await provider.capabilities()).available, false);
  assert.equal(provider.assets, null);
});

test("지원 밖 Quest는 ready에서도 거부하고 취소된 공개 결과는 완료로 기록하지 않는다", async () => {
  let finishCase;
  let started;
  const caseStarted = new Promise((resolve) => { started = resolve; });
  const provider = readyProvider({
    compile: async () => compiled,
    execute: async () => {
      started();
      return new Promise((resolve) => { finishCase = resolve; });
    },
  });
  assert.equal(provider.supportsQuest({ ...quest, revision: 2 }), false);
  await assert.rejects(provider.run({ ...request, questId: "other-quest" }), /지원하지 않습니다/u);
  const pending = provider.run(request);
  await caseStarted;
  await provider.cancel({ requestId: "other-run" });
  assert.equal(provider.activeRun?.requestId, request.requestId);
  await provider.cancel({ requestId: request.requestId });
  finishCase({ kind: "result", actual: 0n });
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(provider.activeRun, null);
});

test("Java 결과 표시는 큰 long을 정확히 보존하고 number·array를 유지한다", async () => {
  const longValues = [9007199254740993n, 9223372036854775807n];
  const longQuest = { ...quest, publicTests: quest.publicTests.map((item, index) => ({
    ...item, expected: String(longValues[index % longValues.length]),
  })) };
  let call = 0;
  const longProvider = readyProvider({
    getQuest: () => longQuest,
    compile: async () => compiled,
    execute: async () => ({ kind: "result", actual: longValues[call++ % longValues.length] }),
  });
  const longReport = await longProvider.run(request);
  assert.equal(longReport.outcome, "passed");
  assert.deepEqual(longReport.tests.slice(0, 2).map(({ actualDisplay }) => actualDisplay),
    ["9007199254740993", "9223372036854775807"]);

  const numberQuest = { id: "quest-java-bridge-arr-02", revision: 1,
    publicTests: Array.from({ length: 6 }, (_, index) => ({
      id: `number-${index}`, label: `숫자 ${index}`, args: [[1, 2], 1, 2], expected: 2,
    })) };
  const numberProvider = readyProvider({
    getQuest: () => numberQuest, compile: async () => compiled,
    execute: async () => ({ kind: "result", actual: 2 }),
  });
  const numberReport = await numberProvider.run({ ...request, questId: numberQuest.id });
  assert.equal(numberReport.outcome, "passed");
  assert.equal(numberReport.tests[0].actualDisplay, "2");

  const arrayQuest = { id: "quest-java-bridge-arr-01", revision: 1,
    publicTests: Array.from({ length: 6 }, (_, index) => ({
      id: `array-${index}`, label: `배열 ${index}`, args: [[1], 0, 2], expected: [2],
      observations: { argument0Unchanged: true, returnNotArgument0: true },
    })) };
  const arrayProvider = readyProvider({
    getQuest: () => arrayQuest, compileSources: async () => compiled,
    execute: async () => ({ kind: "result", actual: [2],
      observations: { argument0Unchanged: true, returnNotArgument0: true } }),
  });
  const arrayReport = await arrayProvider.run({ ...request, questId: arrayQuest.id });
  assert.equal(arrayReport.outcome, "passed");
  assert.equal(arrayReport.tests[0].actualDisplay, "[2]");
});

test("준비 progress와 상태 전환은 편집기 DOM·미저장 값·커서를 보존한다", () => {
  const editor = { value: "class Solution { /* unsaved */ }", selectionStart: 12, selectionEnd: 12 };
  const description = { textContent: "" };
  const panel = {
    dataset: { javaBrowserPreparation: "preparing" },
    querySelector(selector) { return selector === "[data-java-preparation-message]" ? description : null; },
    set outerHTML(value) { this.replacement = value; },
  };
  const root = {
    querySelector(selector) {
      if (selector === "[data-java-browser-preparation]") return panel;
      if (selector === "[data-quest-source]") return editor;
      return null;
    },
    set innerHTML(_) { assert.fail("Java 준비 갱신이 문제 편집기를 재생성했습니다."); },
  };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root, currentView: "quest", codeQuestCollection: { languageId: "java" },
    codeQuestState: { quest, source: editor.value },
    javaBrowserProvider: { status: "preparing", message: "1 MB / 46 MB", assets: null, supportsQuest: () => true },
    isCodeQuestExecutionAvailable: () => false,
    updateCodeQuestDraftFeedback() {},
    renderCodeQuest() { assert.fail("Java 준비 갱신이 전체 문제를 다시 렌더링했습니다."); },
  });
  app.refreshJavaBrowserPreparation();
  assert.equal(description.textContent, "1 MB / 46 MB");
  assert.equal(panel.replacement, undefined);
  panel.dataset.javaBrowserPreparation = "idle";
  app.refreshJavaBrowserPreparation();
  assert.match(panel.replacement, /data-java-browser-preparation="preparing"/u);
  assert.equal(root.querySelector("[data-quest-source]"), editor);
  assert.equal(editor.value, "class Solution { /* unsaved */ }");
  assert.equal(editor.selectionStart, 12);
  assert.equal(editor.selectionEnd, 12);
});

test("준비 자산은 고정 URL 변경·해시 불일치에서 나머지 요청을 취소한다", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const spec = JAVA_BROWSER_ASSET_MANIFEST.runtime[0];
  const calls = [];
  let redirected = true;
  let cancelled = 0;
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: (url, options) => {
      calls.push({ url, options });
      if (url !== spec.url) return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          cancelled++;
          reject(new DOMException("cancelled", "AbortError"));
        }, { once: true });
      });
      return Promise.resolve({
        url: redirected ? `${url}?redirected=1` : url,
        status: spec.status,
        body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(spec.size)); controller.close(); } }),
        headers: { get: () => null },
      });
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "fetch", previous);
    else delete globalThis.fetch;
  });
  await assert.rejects(prepareJavaBrowserAssets(), /응답이 일치하지 않습니다/u);
  redirected = false;
  await assert.rejects(prepareJavaBrowserAssets(), /해시가 일치하지 않습니다/u);
  const firstThree = JAVA_BROWSER_ASSET_MANIFEST.runtime.slice(0, 3).map(({ url }) => url);
  assert.deepEqual(calls.slice(0, 3).map(({ url }) => url), firstThree);
  assert.deepEqual(calls.slice(3).map(({ url }) => url), firstThree);
  assert.equal(cancelled, 4);
  assert.ok(calls.every(({ options }) => options.credentials === "omit" && options.redirect === "error"));
});

test("자산 준비는 manifest 앞 세 요청만 시작하고 사용자 취소 후 진행률을 내지 않는다", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const calls = [];
  let abortedRequests = 0;
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: (url, options) => new Promise((_resolve, reject) => {
      calls.push({ url, options });
      options.signal.addEventListener("abort", () => {
        abortedRequests++;
        reject(new DOMException("cancelled", "AbortError"));
      }, { once: true });
    }),
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "fetch", previous);
    else delete globalThis.fetch;
  });
  const controller = new AbortController();
  const progress = [];
  const preparing = prepareJavaBrowserAssets({ signal: controller.signal, onProgress: (value) => progress.push(value) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls.map(({ url }) => url), JAVA_BROWSER_ASSET_MANIFEST.runtime.slice(0, 3).map(({ url }) => url));
  assert.ok(calls.every(({ options }) => options.cache === "default"));
  controller.abort();
  await assert.rejects(preparing, { name: "AbortError" });
  assert.equal(abortedRequests, 3);
  assert.deepEqual(progress, []);
});

test("검증된 자산은 cache 정책과 manifest 순서를 지키고 읽은 byte만 진행률에 반영한다", async (t) => {
  const previousFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const previousCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const previousCaches = Object.getOwnPropertyDescriptor(globalThis, "caches");
  const specs = [...JAVA_BROWSER_ASSET_MANIFEST.runtime,
    ...JAVA_BROWSER_ASSET_MANIFEST.compiler, JAVA_BROWSER_ASSET_MANIFEST.executor,
    JAVA_BROWSER_ASSET_MANIFEST.runtimeBootstrap];
  const byUrl = new Map(specs.map((spec) => [spec.url, spec]));
  const bySize = new Map(specs.map((spec) => [spec.size, spec]));
  const calls = [];
  const moduleSpec = JAVA_BROWSER_ASSET_MANIFEST.runtime.find(({ url }) => url.endsWith("/17/lib/modules"));
  const cacheKey = `${moduleSpec.url}?bam-sha256=${moduleSpec.sha256}`;
  let storedModule = null;
  let puts = 0;
  let deletes = 0;
  let failPut = false;
  let waitOnMatch = null;
  let putMeta;
  let moduleHashes = 0;
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    value: { async open(name) {
      assert.equal(name, "bam.dev.java-modules-v1");
      return {
        async match(key) {
          assert.equal(key, cacheKey);
          if (waitOnMatch) return waitOnMatch();
          return storedModule?.clone() ?? null;
        },
        async delete(key) { assert.equal(key, cacheKey); deletes++; storedModule = null; return true; },
        async put(key, response) {
          puts++;
          if (failPut) throw new DOMException("quota", "QuotaExceededError");
          putMeta = { key, url: response.headers.get("X-Bam-Original-URL"),
            length: response.headers.get("Content-Length") };
          storedModule = response;
        },
      };
    } },
  });
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { subtle: { async digest(_algorithm, bytes) {
      const spec = bySize.get(bytes.byteLength);
      assert.ok(spec, "manifest에 없는 자산을 해시했습니다.");
      if (spec === moduleSpec) {
        moduleHashes++;
        if (bytes[0] !== 0) return new Uint8Array(32).buffer;
      }
      return Uint8Array.from(Buffer.from(spec.sha256, "hex")).buffer;
    } } },
  });
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url, options) => {
      const spec = byUrl.get(url);
      assert.ok(spec, "manifest 밖 URL을 요청했습니다.");
      calls.push({ url, options });
      const bytes = new Uint8Array(spec.size);
      if (spec.name === "ctArtifacts") {
        bytes.fill(0x20);
        bytes[0] = 0x7b;
        bytes[1] = 0x7d;
      }
      return {
        url, status: spec.status,
        body: new ReadableStream({ start(controller) { if (bytes.length) controller.enqueue(bytes); controller.close(); } }),
        headers: { get: () => null },
      };
    },
  });
  t.after(() => {
    if (previousFetch) Object.defineProperty(globalThis, "fetch", previousFetch);
    else delete globalThis.fetch;
    if (previousCrypto) Object.defineProperty(globalThis, "crypto", previousCrypto);
    else delete globalThis.crypto;
    if (previousCaches) Object.defineProperty(globalThis, "caches", previousCaches);
    else delete globalThis.caches;
  });
  const progress = [];
  const result = await prepareJavaBrowserAssets({ onProgress: (value) => progress.push(value) });
  assert.equal(calls.length, specs.length);
  assert.deepEqual(calls.map(({ url }) => url), specs.map(({ url }) => url));
  assert.ok(calls.every(({ url, options }) => options.cache ===
    (url.startsWith("https://cjrtnc.leaningtech.com/4.3/") ? "default" : "no-cache")));
  assert.deepEqual(result.runtime.map(({ url }) => url), JAVA_BROWSER_ASSET_MANIFEST.runtime.map(({ url }) => url));
  assert.equal(result.receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(result.runtimeBootstrap.byteLength, JAVA_BROWSER_ASSET_MANIFEST.runtimeBootstrap.size);
  assert.ok(calls.some(({ url }) => url === JAVA_BROWSER_ASSET_MANIFEST.runtimeBootstrap.url));
  assert.equal(progress.at(-1).receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.ok(progress.every(({ receivedBytes, totalBytes }) =>
    receivedBytes <= totalBytes && totalBytes === JAVA_BROWSER_ASSET_BYTES));
  assert.ok(progress.every((value, index) => index === 0 || value.receivedBytes >= progress[index - 1].receivedBytes));
  assert.equal(puts, 1);
  assert.deepEqual(putMeta, { key: cacheKey, url: moduleSpec.url, length: String(moduleSpec.size) });
  calls.length = 0;
  const cachedProgress = [];
  const cached = await prepareJavaBrowserAssets({ onProgress: (value) => cachedProgress.push(value) });
  assert.equal(calls.some(({ url }) => url === moduleSpec.url), false);
  assert.equal(calls.length, specs.length - 1);
  assert.equal(cached.receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(cachedProgress.at(-1).receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(puts, 1);
  assert.equal(moduleHashes, 2, "cache hit에서도 SHA 검증을 다시 해야 합니다.");

  const corruptBytes = new Uint8Array(moduleSpec.size);
  corruptBytes[0] = 1;
  storedModule = new Response(corruptBytes, { status: moduleSpec.status, headers: {
    "X-Bam-Original-URL": moduleSpec.url, "Content-Length": String(moduleSpec.size),
  } });
  calls.length = 0;
  const recoveredProgress = [];
  const recovered = await prepareJavaBrowserAssets({ onProgress: (value) => recoveredProgress.push(value) });
  assert.equal(deletes, 1);
  assert.equal(calls.filter(({ url }) => url === moduleSpec.url).length, 1);
  assert.equal(recovered.receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(recoveredProgress.at(-1).receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(puts, 2);

  storedModule = null;
  failPut = true;
  calls.length = 0;
  const withoutStorage = await prepareJavaBrowserAssets();
  assert.equal(withoutStorage.receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(calls.filter(({ url }) => url === moduleSpec.url).length, 1);
  assert.equal(puts, 3);

  const mockedCaches = globalThis.caches;
  delete globalThis.caches;
  calls.length = 0;
  const withoutCacheApi = await prepareJavaBrowserAssets();
  assert.equal(withoutCacheApi.receivedBytes, JAVA_BROWSER_ASSET_BYTES);
  assert.equal(calls.filter(({ url }) => url === moduleSpec.url).length, 1);
  Object.defineProperty(globalThis, "caches", { configurable: true, value: mockedCaches });

  let enteredMatch;
  let releaseMatch;
  const matching = new Promise((resolve) => { enteredMatch = resolve; });
  waitOnMatch = () => { enteredMatch(); return new Promise((resolve) => { releaseMatch = resolve; }); };
  const controller = new AbortController();
  const lateProgress = [];
  calls.length = 0;
  const cancelled = prepareJavaBrowserAssets({ signal: controller.signal,
    onProgress: (value) => lateProgress.push(value) });
  await matching;
  controller.abort();
  const progressAtAbort = lateProgress.length;
  releaseMatch(null);
  await assert.rejects(cancelled, { name: "AbortError" });
  assert.equal(lateProgress.length, progressAtAbort);
  assert.equal(calls.some(({ url }) => url === moduleSpec.url), false);
});

test("provider는 자산 읽기·컴파일러 확인·실행 확인을 분리해 ready를 표시한다", async () => {
  let finishCompile;
  let finishExecute;
  let compileStarted;
  let executeStarted;
  const enteredCompile = new Promise((resolve) => { compileStarted = resolve; });
  const enteredExecute = new Promise((resolve) => { executeStarted = resolve; });
  const messages = [];
  const provider = new JavaBrowserProvider({
    onChange() { messages.push(provider.message); },
    prepareAssets: async ({ onProgress }) => {
      onProgress({ receivedBytes: 1_048_576, totalBytes: 2_097_152 });
      return { runtime: [] };
    },
    compile() {
      compileStarted();
      return new Promise((resolve) => { finishCompile = resolve; });
    },
    execute() {
      executeStarted();
      return new Promise((resolve) => { finishExecute = resolve; });
    },
  });
  const preparing = provider.prepare();
  await enteredCompile;
  assert.equal(provider.status, "preparing");
  assert.ok(messages.some((message) => message.includes("자산 읽기·검증 중") && message.includes("1.0 / 2.0 MiB")));
  assert.match(provider.message, /컴파일러를 확인/u);
  finishCompile(compiled);
  await enteredExecute;
  assert.equal(provider.status, "preparing");
  assert.match(provider.message, /실행 환경을 확인/u);
  finishExecute({ kind: "result", actual: 17n });
  assert.equal(await preparing, true);
  assert.equal(provider.status, "ready");
});
