import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { BamLearningApp } from "../src/app.js";
import { JavaBrowserTransport, takeJavaBrowserBootstrap } from "../src/grading/java-browser-transport.js";

const owner = { serverEpoch: "epoch-1", sessionId: "session-1", token: "secret", leaseMs: 15_000 };
const request = { questId: "quest-java-total-price", revision: 1, source: "class Solution {}", requestId: "run-1" };
const digest = createHash("sha256").update(request.source).digest("hex");
const receipt = (overrides = {}) => ({
  serverEpoch: owner.serverEpoch, sessionId: owner.sessionId, runId: request.requestId,
  kind: "quest", revision: request.revision, sourceSha256: digest,
  report: { outcome: "passed" }, ...overrides,
});
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, async json() { return body; } });

function useBrowser(fetchRequest) {
  const previous = { fetch: globalThis.fetch, window: globalThis.window };
  const intervals = new Set();
  globalThis.window = {
    setInterval(callback) { intervals.add(callback); return callback; },
    clearInterval(callback) { intervals.delete(callback); },
  };
  globalThis.fetch = fetchRequest;
  return {
    intervals,
    restore() { globalThis.fetch = previous.fetch; globalThis.window = previous.window; },
  };
}

test("bootstrap은 한 번만 인수하고 Java 응답은 소스·세션에 결합된다", async () => {
  const page = { takeBamJavaBootstrap: () => "bootstrap-1" };
  assert.equal(takeJavaBrowserBootstrap(page), "bootstrap-1");
  assert.equal(takeJavaBrowserBootstrap(page), null);
  let nextReceipt = receipt();
  const calls = [];
  const browser = useBrowser(async (path, options) => {
    const endpoint = path.split("/").pop();
    calls.push({ endpoint, options });
    if (endpoint === "session") return response(200, owner);
    if (endpoint === "capabilities") return response(200, {
      serverEpoch: owner.serverEpoch, sessionId: owner.sessionId,
      quest: { available: true }, codingTest: { available: false },
    });
    if (endpoint === "run") return response(200, nextReceipt);
    return response(200, { released: true });
  });
  try {
    const client = new JavaBrowserTransport("bootstrap-1");
    await client.connect();
    assert.equal(client.status, "connected");
    assert.equal(calls[0].options.headers["X-Bam-Java-Bootstrap"], "bootstrap-1");
    assert.equal(calls[1].options.headers.Authorization, `Bearer ${owner.token}`);
    assert.equal(calls[0].options.credentials, "omit");
    assert.equal(calls[0].options.redirect, "error");
    assert.deepEqual(await client.run("quest", request), { outcome: "passed" });
    nextReceipt = receipt({ sourceSha256: "wrong" });
    await assert.rejects(client.run("quest", request), { code: "invalid_response" });
    assert.equal(client.status, "expired");
    const reconnected = new JavaBrowserTransport("bootstrap-2");
    await reconnected.connect();
    nextReceipt = receipt({ serverEpoch: "old-epoch" });
    await assert.rejects(reconnected.run("quest", request), { code: "invalid_response" });
    assert.equal(reconnected.status, "expired");
  } finally { browser.restore(); }
});

test("취소 요청은 현재 소유 세션과 run ID만 보내고 늦은 성공 결과를 버린다", async () => {
  let finishRun;
  const pendingRun = new Promise((resolve) => { finishRun = resolve; });
  const calls = [];
  const browser = useBrowser(async (path, options) => {
    const endpoint = path.split("/").pop();
    calls.push({ endpoint, body: JSON.parse(options.body), options });
    if (endpoint === "session") return response(200, owner);
    if (endpoint === "capabilities") return response(200, {
      serverEpoch: owner.serverEpoch, sessionId: owner.sessionId,
      quest: { available: true }, codingTest: { available: true },
    });
    if (endpoint === "run") return pendingRun;
    return response(202, { status: "aborting" });
  });
  try {
    const client = new JavaBrowserTransport("bootstrap-1");
    await client.connect();
    const result = client.run("quest", request);
    await client.cancel(request.requestId);
    assert.deepEqual(calls.find(({ endpoint }) => endpoint === "cancel").body, {
      sessionId: owner.sessionId, requestId: request.requestId,
    });
    client.release();
    finishRun(response(200, receipt()));
    await assert.rejects(result, { code: "run_expired" });
  } finally { browser.restore(); }
});

test("capability 조회 실패는 서버 owner를 release하고 브라우저 연결을 닫는다", async () => {
  const calls = [];
  const browser = useBrowser(async (path) => {
    const endpoint = path.split("/").pop();
    calls.push(endpoint);
    if (endpoint === "session") return response(200, owner);
    if (endpoint === "capabilities") return response(503, { error: { code: "java_unavailable" } });
    return response(200, { released: true });
  });
  try {
    const client = new JavaBrowserTransport("bootstrap-1");
    await client.connect();
    assert.equal(client.status, "expired");
    assert.equal(client.session, null);
    assert.equal(client.canConnect, false);
    assert.deepEqual(calls, ["session", "capabilities", "release"]);
  } finally { browser.restore(); }
});

test("pagehide release는 BFCache에 남은 연결을 만료로 표시하고 자동 재연결하지 않는다", async () => {
  const calls = [];
  const browser = useBrowser(async (path) => {
    const endpoint = path.split("/").pop();
    calls.push(endpoint);
    if (endpoint === "session") return response(200, owner);
    if (endpoint === "capabilities") return response(200, {
      serverEpoch: owner.serverEpoch, sessionId: owner.sessionId,
      quest: { available: true }, codingTest: { available: true },
    });
    return response(200, { released: true });
  });
  try {
    let changes = 0;
    const client = new JavaBrowserTransport("bootstrap-1", () => { changes += 1; });
    await client.connect();
    const beforeRelease = changes;
    client.release();
    assert.equal(changes, beforeRelease + 1);
    assert.equal(client.status, "expired");
    assert.equal(client.needsReload, true);
    assert.equal(client.canConnect, false);
    assert.equal(client.session, null);
    assert.equal(client.capability, null);
    assert.equal((await client.bridge("coding-test").capabilities()), null);
    assert.deepEqual(calls, ["session", "capabilities", "release"]);
  } finally { browser.restore(); }
});

test("BFCache pageshow는 Java capability와 화면만 갱신하고 초안·연결을 보존한다", async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const handlers = new Map();
  globalThis.window = { addEventListener(name, handler) { handlers.set(name, handler); } };
  globalThis.document = { querySelector() { return null; }, addEventListener() {} };
  try {
    const app = Object.create(BamLearningApp.prototype);
    const collection = { languageId: "java" };
    let renders = 0;
    let connections = 0;
    let capabilityReads = 0;
    Object.assign(app, {
      root: { addEventListener() {} }, mobileMedia: { addEventListener() {} },
      currentView: "coding-test", codingTestCollection: collection,
      codingTestState: { collection, source: "saved learner draft" },
      javaBrowserTransport: { connect() { connections += 1; } },
      javaCodeQuestRunner: { async capabilities() { capabilityReads += 1; return { available: false }; } },
      javaCodingTestRunner: { async capabilities() { capabilityReads += 1; return { available: false }; } },
      renderCodingTest() { renders += 1; },
    });
    app.bindGlobalEvents();
    handlers.get("pageshow")({ persisted: false });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(capabilityReads, 0);
    handlers.get("pageshow")({ persisted: true });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(capabilityReads, 2);
    assert.equal(renders, 1);
    assert.equal(connections, 0);
    assert.equal(app.codingTestState.source, "saved learner draft");
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});

test("digest 계산 중 취소된 ID는 뒤늦게 run POST를 시작하지 않는다", async () => {
  const calls = [];
  const browser = useBrowser(async (path) => {
    const endpoint = path.split("/").pop();
    calls.push(endpoint);
    if (endpoint === "session") return response(200, owner);
    if (endpoint === "capabilities") return response(200, {
      serverEpoch: owner.serverEpoch, sessionId: owner.sessionId,
      quest: { available: true }, codingTest: { available: true },
    });
    if (endpoint === "cancel") return response(410, { error: { code: "run_expired" } });
    if (endpoint === "run") return response(200, receipt());
    return response(200, { released: true });
  });
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  let finishDigest;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { subtle: { digest: () => new Promise((resolve) => { finishDigest = resolve; }) } },
  });
  try {
    const client = new JavaBrowserTransport("bootstrap-1");
    await client.connect();
    const pending = client.run("quest", request);
    await client.cancel(request.requestId);
    finishDigest(Buffer.from(digest, "hex"));
    await assert.rejects(pending, { code: "run_expired" });
    assert.equal(calls.filter((endpoint) => endpoint === "run").length, 0);
    client.release();
  } finally {
    if (originalCrypto) Object.defineProperty(globalThis, "crypto", originalCrypto);
    else delete globalThis.crypto;
    browser.restore();
  }
});
