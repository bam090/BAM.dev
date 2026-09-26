import assert from "node:assert/strict";
import test from "node:test";

import { BamLearningApp } from "../src/app.js";
import { JAVA_BROWSER_ASSET_MANIFEST, prepareJavaBrowserAssets } from "../src/grading/java-browser-assets.js";
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

test("준비 자산은 고정 URL 응답의 변경·해시 불일치에서 첫 fetch만 하고 실패한다", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const spec = JAVA_BROWSER_ASSET_MANIFEST.runtime[0];
  const calls = [];
  let redirected = true;
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url, options) => {
      calls.push({ url, options });
      return {
        url: redirected ? `${url}?redirected=1` : url,
        status: 200,
        body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(spec.size)); controller.close(); } }),
        headers: { get: () => null },
      };
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "fetch", previous);
    else delete globalThis.fetch;
  });
  await assert.rejects(prepareJavaBrowserAssets(), /응답이 일치하지 않습니다/u);
  redirected = false;
  await assert.rejects(prepareJavaBrowserAssets(), /해시가 일치하지 않습니다/u);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ url }) => url === spec.url));
  assert.ok(calls.every(({ options }) => options.credentials === "omit" && options.redirect === "error"));
});
