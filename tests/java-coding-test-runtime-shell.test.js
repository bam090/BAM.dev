import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mainPath = path.join(projectRoot, "desktop", "main.cjs");
const preloadPath = path.join(projectRoot, "desktop", "preload.cjs");
const mainSource = await readFile(mainPath, "utf8");
const preloadSource = await readFile(preloadPath, "utf8");

function loadMainShell() {
  const handlers = new Map();
  const electron = {
    app: { getAppPath: () => "/virtual/app" },
    BrowserWindow: function BrowserWindow() {},
    ipcMain: {
      handle(channel, handler) {
        if (handlers.has(channel)) throw new Error(`duplicate handler: ${channel}`);
        handlers.set(channel, handler);
      },
    },
    protocol: {
      registerSchemesAsPrivileged() {},
      handle() {},
    },
    session: { defaultSession: {} },
  };
  const nativeRequire = createRequire(mainPath);
  const localRequire = (specifier) => specifier === "electron" ? electron : nativeRequire(specifier);
  const startupIndex = mainSource.indexOf("\nvoid app\n");
  assert.ok(startupIndex > 0, "main startup 경계를 찾을 수 없습니다.");
  const source = `${mainSource.slice(0, startupIndex)}
    module.exports = {
      assertRunRequest,
      assertTrustedMainFrame,
      beginJavaRun,
      cancelJavaRun,
      abortActiveRun,
      registerJavaIpc,
      local: (value) => JSON.parse(JSON.stringify(value)),
      assertAccessorRequest(kind) {
        const value = {
          requestId: "ct-accessor",
          problemId: "coding-test-java-bridge-arr-01",
          revision: 1,
          mode: "run",
        };
        Object.defineProperty(value, "source", { enumerable: true, get() { return "source"; } });
        return assertRunRequest(value, kind);
      },
      reset({ window, runtime, questManifest, codingTestManifest }) {
        mainWindow = window;
        activeRun = null;
        runTransition = Promise.resolve();
        quittingAfterCleanup = false;
        finishedRequestIds.clear();
        javaRuntimePromise = Promise.resolve(runtime);
        trustedManifestPromise = Promise.resolve(questManifest);
        trustedCodingTestManifestPromise = Promise.resolve(codingTestManifest);
      },
      state: () => ({
        activeKind: activeRun?.kind ?? null,
        activeRequestId: activeRun?.requestId ?? null,
        finishedRequestIds: [...finishedRequestIds],
      }),
    };
  `;
  const module = { exports: {} };
  const wrapper = runInNewContext(
    `(function (require, module, exports, __dirname, __filename) { ${source}\n })`,
    {
      AbortController,
      Buffer,
      console,
      process: { resourcesPath: "/virtual/resources" },
      Response,
      URL,
    },
    { filename: mainPath },
  );
  wrapper(localRequire, module, module.exports, path.dirname(mainPath), mainPath);
  return { api: module.exports, handlers };
}

function createTrustedWindow(id = 11) {
  const frame = {
    processId: id + 1,
    routingId: id + 2,
    url: "bam://app/",
  };
  const webContents = {
    id,
    mainFrame: frame,
    isDestroyed: () => false,
  };
  return {
    event: { sender: webContents, senderFrame: frame },
    window: { webContents, isDestroyed: () => false },
  };
}

function questRequest(requestId = "quest-run") {
  return {
    requestId,
    questId: "quest-java-total-price",
    revision: 1,
    source: "public class Solution {}",
  };
}

function codingTestRequest(requestId = "ct-run", mode = "run") {
  return {
    requestId,
    problemId: "coding-test-java-bridge-arr-01",
    revision: 1,
    source: "public class Solution {}",
    mode,
  };
}

function createDeferredRuntime() {
  const calls = [];
  let activeCount = 0;
  let maximumActiveCount = 0;
  const run = (kind) => (request, { signal }) => new Promise((resolve) => {
    activeCount += 1;
    maximumActiveCount = Math.max(maximumActiveCount, activeCount);
    const call = { kind, request, signal };
    calls.push(call);
    signal.addEventListener("abort", () => {
      activeCount -= 1;
      resolve({ requestId: request.requestId, outcome: "cancelled" });
    }, { once: true });
  });
  return {
    calls,
    get maximumActiveCount() { return maximumActiveCount; },
    getJavaQuestCapabilities: async () => ({
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: true,
    }),
    getJavaCodingTestCapabilities: async () => ({
      contractVersion: 1,
      evaluationKind: "java-junit-method-v1",
      available: false,
      reason: "검증 전",
    }),
    runJavaQuest: run("quest"),
    runJavaCodingTest: run("coding-test"),
  };
}

function createCleanupDeferredRuntime(oldRequestId) {
  const calls = [];
  const pending = new Map();
  const waiters = new Map();
  let activeSupervisorCalls = 0;
  let maximumSupervisorCalls = 0;
  let unabortedNewRuns = 0;

  const report = (kind, request) => kind === "coding-test"
    ? {
        requestId: request.requestId,
        outcome: "cancelled",
        tests: [
          { testId: "public-one", outcome: "cancelled" },
          { testId: "public-two", outcome: "not_run" },
        ],
        summary: {
          outcome: "cancelled",
          total: 2,
          passed: 0,
          wrong_answer: 0,
          syntax_error: 0,
          runtime_error: 0,
          timeout: 0,
          output_limit: 0,
          cancelled: 1,
          engine_error: 0,
          not_run: 1,
        },
      }
    : { requestId: request.requestId, outcome: "cancelled" };

  const run = (kind) => (request, { signal }) => {
    activeSupervisorCalls += 1;
    maximumSupervisorCalls = Math.max(
      maximumSupervisorCalls,
      activeSupervisorCalls,
    );
    const call = {
      kind,
      request,
      signal,
      abortedAtCall: signal.aborted,
    };
    calls.push(call);
    if (request.requestId !== oldRequestId && !signal.aborted) {
      unabortedNewRuns += 1;
    }
    waiters.get(request.requestId)?.(call);
    waiters.delete(request.requestId);
    return new Promise((resolve) => {
      pending.set(request.requestId, () => {
        pending.delete(request.requestId);
        activeSupervisorCalls -= 1;
        resolve(report(kind, request));
      });
    });
  };

  return {
    calls,
    get maximumSupervisorCalls() { return maximumSupervisorCalls; },
    get unabortedNewRuns() { return unabortedNewRuns; },
    waitForCall(requestId) {
      const call = calls.find((entry) => entry.request.requestId === requestId);
      if (call) return Promise.resolve(call);
      return new Promise((resolve) => waiters.set(requestId, resolve));
    },
    finish(requestId) {
      const finish = pending.get(requestId);
      assert.ok(finish, `pending supervisor call: ${requestId}`);
      finish();
    },
    getJavaQuestCapabilities: async () => ({
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: true,
    }),
    getJavaCodingTestCapabilities: async () => ({
      contractVersion: 1,
      evaluationKind: "java-junit-method-v1",
      available: true,
    }),
    runJavaQuest: run("quest"),
    runJavaCodingTest: run("coding-test"),
  };
}

test("CT shell 요청은 exact 5 fields와 값 descriptor만 허용한다", () => {
  const { api } = loadMainShell();
  const valid = api.local(codingTestRequest());
  assert.doesNotThrow(() => api.assertRunRequest(valid, "coding-test"));
  assert.throws(
    () => api.assertRunRequest(api.local({ ...codingTestRequest(), selector: "arbitrary" }), "coding-test"),
    /형식/u,
  );
  assert.throws(() => api.assertAccessorRequest("coding-test"), /형식/u);
  assert.throws(
    () => api.assertRunRequest(api.local(codingTestRequest("ct-bad-mode", "hidden")), "coding-test"),
    /mode/u,
  );
  assert.throws(
    () => api.assertRunRequest(api.local({ ...codingTestRequest(), problemId: "quest-java-total-price" }), "coding-test"),
    /problemId/u,
  );
});

test("CT IPC는 신뢰한 bam main frame에만 세 채널을 등록하고 preload는 최소 bridge만 노출한다", async () => {
  const { api, handlers } = loadMainShell();
  api.registerJavaIpc();
  assert.deepEqual([...handlers.keys()].sort(), [
    "bam-java-ct:cancel",
    "bam-java-ct:capabilities",
    "bam-java-ct:run",
    "bam-java:cancel",
    "bam-java:capabilities",
    "bam-java:run",
  ]);

  const trusted = createTrustedWindow();
  api.reset({
    window: trusted.window,
    runtime: createDeferredRuntime(),
    questManifest: {},
    codingTestManifest: {},
  });
  const foreignWindow = createTrustedWindow(99);
  await assert.rejects(
    handlers.get("bam-java-ct:run")(
      foreignWindow.event,
      api.local(codingTestRequest("ct-foreign-frame")),
    ),
    /허용되지 않은/u,
  );
  const badOrigin = createTrustedWindow(11);
  badOrigin.event.senderFrame.url = "https://example.com/";
  api.reset({
    window: badOrigin.window,
    runtime: createDeferredRuntime(),
    questManifest: {},
    codingTestManifest: {},
  });
  await assert.rejects(
    handlers.get("bam-java-ct:run")(
      badOrigin.event,
      api.local(codingTestRequest("ct-bad-origin")),
    ),
    /origin/u,
  );

  const exposed = new Map();
  const invokes = [];
  const preloadRequire = (specifier) => {
    assert.equal(specifier, "electron");
    return {
      contextBridge: {
        exposeInMainWorld(name, value) { exposed.set(name, value); },
      },
      ipcRenderer: {
        invoke(channel, request) {
          invokes.push([channel, request]);
          return Promise.resolve(channel);
        },
      },
    };
  };
  runInNewContext(preloadSource, { require: preloadRequire, Object }, { filename: preloadPath });
  const bridge = exposed.get("bamJavaCodingTest");
  assert.equal(Object.isFrozen(bridge), true);
  await bridge.capabilities();
  await bridge.run({ requestId: "ct-preload" });
  await bridge.cancel({ requestId: "ct-preload" });
  assert.deepEqual(invokes.map(([channel]) => channel), [
    "bam-java-ct:capabilities",
    "bam-java-ct:run",
    "bam-java-ct:cancel",
  ]);
});

test("Quest와 CT는 한 active run을 공유하고 새 실행 전 기존 child 취소 완료를 기다린다", async () => {
  const { api } = loadMainShell();
  const trusted = createTrustedWindow();
  const runtime = createDeferredRuntime();
  api.reset({
    window: trusted.window,
    runtime,
    questManifest: {},
    codingTestManifest: {},
  });

  const quest = await api.beginJavaRun(
    trusted.event,
    api.local(questRequest("shared-quest")),
    "quest",
  );
  assert.equal(api.state().activeKind, "quest");
  const codingTestStart = api.beginJavaRun(
    trusted.event,
    api.local(codingTestRequest("shared-ct")),
    "coding-test",
  );
  const codingTest = await codingTestStart;

  assert.equal((await quest.promise).outcome, "cancelled");
  assert.equal(runtime.calls[0].signal.aborted, true);
  assert.equal(runtime.calls[1].kind, "coding-test");
  assert.equal(runtime.maximumActiveCount, 1);
  assert.equal(api.state().activeKind, "coding-test");

  const wrongKind = await api.cancelJavaRun(
    trusted.event,
    api.local({ requestId: "shared-ct" }),
    "quest",
  );
  assert.equal(wrongKind.cancelled, false);
  assert.equal(runtime.calls[1].signal.aborted, false);

  const cancelled = await api.cancelJavaRun(
    trusted.event,
    api.local({ requestId: "shared-ct" }),
    "coding-test",
  );
  assert.equal(cancelled.cancelled, true);
  assert.equal((await codingTest.promise).outcome, "cancelled");
  assert.equal(api.state().activeKind, null);
  assert.deepEqual(
    Array.from(api.state().finishedRequestIds).sort(),
    ["shared-ct", "shared-quest"],
  );
});

test("이전 Quest 정리 중 등록·취소한 CT는 abort를 보존하고 신규 learner 실행 없이 cancelled/not_run으로 끝난다", async () => {
  const { api } = loadMainShell();
  const trusted = createTrustedWindow();
  const runtime = createCleanupDeferredRuntime("cleanup-quest");
  api.reset({
    window: trusted.window,
    runtime,
    questManifest: {},
    codingTestManifest: {},
  });

  const oldQuest = await api.beginJavaRun(
    trusted.event,
    api.local(questRequest("cleanup-quest")),
    "quest",
  );
  await runtime.waitForCall("cleanup-quest");
  const nextStart = api.beginJavaRun(
    trusted.event,
    api.local(codingTestRequest("pending-ct", "submit")),
    "coding-test",
  );
  assert.equal(api.state().activeRequestId, "pending-ct");

  const cancellation = api.cancelJavaRun(
    trusted.event,
    api.local({ requestId: "pending-ct" }),
    "coding-test",
  );
  await assert.rejects(
    api.beginJavaRun(
      trusted.event,
      api.local(codingTestRequest("pending-ct", "submit")),
      "coding-test",
    ),
    /이미 사용/u,
  );
  assert.equal(runtime.calls.length, 1);

  runtime.finish("cleanup-quest");
  assert.equal((await oldQuest.promise).outcome, "cancelled");
  const pendingCall = await runtime.waitForCall("pending-ct");
  assert.equal(pendingCall.abortedAtCall, true);
  assert.equal(runtime.unabortedNewRuns, 0);
  runtime.finish("pending-ct");

  const next = await nextStart;
  const result = await next.promise;
  assert.deepEqual(
    result.tests.map(({ outcome }) => outcome),
    ["cancelled", "not_run"],
  );
  assert.equal(result.outcome, "cancelled");
  assert.equal(result.summary.outcome, "cancelled");
  assert.equal(result.summary.cancelled, 1);
  assert.equal(result.summary.not_run, 1);
  const cancellationResult = await cancellation;
  assert.equal(cancellationResult.requestId, "pending-ct");
  assert.equal(cancellationResult.cancelled, true);
  assert.equal(runtime.maximumSupervisorCalls, 1);
  assert.equal(api.state().activeKind, null);
});

test("정리 대기 중 lifecycle abort와 세 번째 supersede는 pending run을 부활·중첩시키지 않는다", async () => {
  const { api } = loadMainShell();
  const trusted = createTrustedWindow();
  const runtime = createCleanupDeferredRuntime("close-quest");
  api.reset({
    window: trusted.window,
    runtime,
    questManifest: {},
    codingTestManifest: {},
  });

  const oldQuest = await api.beginJavaRun(
    trusted.event,
    api.local(questRequest("close-quest")),
    "quest",
  );
  await runtime.waitForCall("close-quest");
  const secondStart = api.beginJavaRun(
    trusted.event,
    api.local(codingTestRequest("superseded-ct")),
    "coding-test",
  );
  const thirdStart = api.beginJavaRun(
    trusted.event,
    api.local(questRequest("pending-third")),
    "quest",
  );
  assert.equal(api.state().activeRequestId, "pending-third");
  const lifecycleCleanup = api.abortActiveRun();
  runtime.finish("close-quest");
  assert.equal((await oldQuest.promise).outcome, "cancelled");

  const secondCall = await runtime.waitForCall("superseded-ct");
  assert.equal(secondCall.abortedAtCall, true);
  assert.equal(api.state().activeRequestId, "pending-third");
  assert.equal(runtime.calls.length, 2);
  runtime.finish("superseded-ct");
  const second = await secondStart;
  assert.equal((await second.promise).outcome, "cancelled");

  const thirdCall = await runtime.waitForCall("pending-third");
  assert.equal(thirdCall.abortedAtCall, true);
  assert.equal(api.state().activeRequestId, "pending-third");
  runtime.finish("pending-third");
  const third = await thirdStart;
  assert.equal((await third.promise).outcome, "cancelled");
  assert.equal((await lifecycleCleanup).outcome, "cancelled");

  assert.equal(runtime.unabortedNewRuns, 0);
  assert.equal(runtime.maximumSupervisorCalls, 1);
  assert.deepEqual(
    runtime.calls.map(({ kind, request }) => [kind, request.requestId]),
    [
      ["quest", "close-quest"],
      ["coding-test", "superseded-ct"],
      ["quest", "pending-third"],
    ],
  );
  assert.equal(api.state().activeKind, null);
});

test("완료 requestId는 Quest·CT 종류를 넘어 재사용할 수 없고 lifecycle abort가 active run을 회수한다", async () => {
  const { api } = loadMainShell();
  const trusted = createTrustedWindow();
  const runtime = createDeferredRuntime();
  api.reset({
    window: trusted.window,
    runtime,
    questManifest: {},
    codingTestManifest: {},
  });

  const codingTest = await api.beginJavaRun(
    trusted.event,
    api.local(codingTestRequest("global-request-id")),
    "coding-test",
  );
  await api.abortActiveRun();
  assert.equal((await codingTest.promise).outcome, "cancelled");
  assert.equal(api.state().activeKind, null);

  await assert.rejects(
    api.beginJavaRun(
      trusted.event,
      api.local(questRequest("global-request-id")),
      "quest",
    ),
    /이미 사용/u,
  );
  assert.equal(runtime.calls.length, 1);
});
