import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { once } from "node:events";
import { PassThrough, Readable } from "node:stream";
import test from "node:test";

import { createDevServer } from "../scripts/dev-server.mjs";
import { createJavaBrowserTransport } from "../scripts/java-browser-transport.mjs";

const host = "localhost:4173";
const origin = `http://${host}`;
const headers = {
  host,
  origin,
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "cors",
  "x-bam-java": "1",
  "content-type": "application/json",
};
const quest = (sessionId, overrides = {}) => ({
  sessionId,
  kind: "quest",
  request: {
    questId: "quest-java-total-price", revision: 1,
    source: "class Solution {}", requestId: "run-1", ...overrides,
  },
});

function request(path, body, extraHeaders = {}) {
  const values = { ...headers, ...extraHeaders };
  const stream = Readable.from([Buffer.from(JSON.stringify(body))]);
  stream.method = "POST";
  stream.url = path;
  stream.headers = values;
  stream.rawHeaders = Object.entries(values).flat();
  stream.complete = true;
  stream.aborted = false;
  return stream;
}

function response() {
  const result = new EventEmitter();
  result.destroyed = false;
  result.writableEnded = false;
  result.writeHead = (status, responseHeaders) => {
    result.status = status;
    result.headers = responseHeaders;
  };
  result.end = (bytes) => {
    result.body = JSON.parse(Buffer.from(bytes).toString("utf8"));
    result.writableEnded = true;
    result.emit("finish");
  };
  return result;
}

async function send(transport, path, body, extraHeaders = {}) {
  const result = response();
  assert.equal(await transport.handle(request(path, body, extraHeaders), result), true);
  return result;
}

function navigation(overrides = {}) {
  const values = {
    host,
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
    "sec-fetch-site": "none",
    ...overrides,
  };
  return {
    method: "GET", url: "/", headers: values, rawHeaders: Object.entries(values).flat(),
  };
}

function fakeRunner(run = async () => ({ outcome: "passed" })) {
  return {
    validate(kind, runRequest) {
      return kind === "quest" && runRequest.questId === "quest-java-total-price"
        && runRequest.revision === 1;
    },
    async capabilities() { return { available: true }; },
    run,
  };
}

async function session(transport) {
  const bootstrap = transport.issueNavigationCapability(navigation());
  assert.equal(typeof bootstrap, "string");
  const reply = await send(transport, "/api/java/session", {}, { "x-bam-java-bootstrap": bootstrap });
  assert.equal(reply.status, 200);
  return { ...reply.body, bootstrap };
}

function leaseClock() {
  let time = 0;
  const timers = [];
  return {
    now: () => time,
    setLeaseTimeout(callback, delay) {
      const timer = { callback, delay, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearLeaseTimeout(timer) { timer.cleared = true; },
    advance(milliseconds) { time += milliseconds; },
    latest() { return timers.at(-1); },
  };
}

test("기본 source 서버 연결은 Java capability와 session을 닫는다", async () => {
  const transport = createJavaBrowserTransport({ port: 4173, runner: fakeRunner() });
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  const denied = await send(transport, "/api/java/session", {});
  assert.equal(denied.status, 503);
  assert.equal(denied.body.error.code, "java_unavailable");
  await transport.shutdown();
});

test("Java HTML CSP는 기존 CSS 학습·미리보기를 허용하고 실행 권한은 유지한다", async () => {
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true, runner: fakeRunner(),
  });
  const policy = transport.decorateHtml(navigation(), "<html></html>")
    .headers["Content-Security-Policy"];
  assert.match(policy, /style-src 'self' 'unsafe-inline' data:/u);
  assert.match(policy, /script-src 'self' 'nonce-[A-Za-z0-9_-]+'/u);
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/u);
  assert.match(policy, /connect-src 'self'/u);
  assert.match(policy, /worker-src http:\/\/localhost:4173\/src\/workers\/javascript-code-runner\.classic\.js/u);
  assert.match(policy, /frame-ancestors 'none'/u);
  await transport.shutdown();
});

test("navigation capability는 정확한 Host와 문서 탐색에만 발급되고 한 번만 쓰인다", async () => {
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true, runner: fakeRunner(),
  });
  assert.equal(transport.issueNavigationCapability(navigation({ host: "127.0.0.1:4173" })), null);
  assert.equal(transport.issueNavigationCapability(navigation({ "sec-fetch-dest": "iframe" })), null);
  const bootstrap = transport.issueNavigationCapability(navigation());
  const wrongOrigin = await send(transport, "/api/java/session", {}, {
    origin: "http://evil.example", "x-bam-java-bootstrap": bootstrap,
  });
  assert.equal(wrongOrigin.status, 403);
  const opened = await send(transport, "/api/java/session", {}, { "x-bam-java-bootstrap": bootstrap });
  assert.equal(opened.status, 200);
  assert.equal(opened.headers["Cache-Control"], "no-store");
  assert.equal(typeof opened.body.token, "string");
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  const released = await send(transport, "/api/java/release", {
    sessionId: opened.body.sessionId,
  }, { authorization: `Bearer ${opened.body.token}` });
  assert.equal(released.status, 200);
  const replay = await send(transport, "/api/java/session", {}, { "x-bam-java-bootstrap": bootstrap });
  assert.equal(replay.status, 403);
  await transport.shutdown();
});

test("같은 run ID는 pending·terminal 재사용, 다른 내용은 충돌이며 fake 실행은 한 번이다", async () => {
  let finish;
  let started;
  const running = new Promise((resolve) => { finish = resolve; });
  const startedPromise = new Promise((resolve) => { started = resolve; });
  let calls = 0;
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(async () => { calls += 1; started(); return running; }),
  });
  const owner = await session(transport);
  const auth = { authorization: `Bearer ${owner.token}` };
  const body = quest(owner.sessionId);
  const first = send(transport, "/api/java/run", body, auth);
  await startedPromise;
  const pending = await send(transport, "/api/java/run", body, auth);
  assert.equal(pending.status, 202);
  assert.equal(pending.body.status, "pending");
  const conflict = await send(transport, "/api/java/run", quest(owner.sessionId, { source: "changed" }), auth);
  assert.equal(conflict.status, 409);
  const busy = await send(transport, "/api/java/run", quest(owner.sessionId, { requestId: "run-2" }), auth);
  assert.equal(busy.status, 409);
  finish({ outcome: "passed" });
  const terminal = await first;
  assert.equal(terminal.status, 200);
  assert.equal(terminal.body.runId, "run-1");
  assert.equal((await send(transport, "/api/java/run", body, auth)).status, 200);
  assert.equal(calls, 1);
  const untrusted = await send(transport, "/api/java/run", quest(owner.sessionId, {
    questId: "unknown-quest", requestId: "run-3",
  }), auth);
  assert.equal(untrusted.status, 400);
  assert.equal(calls, 1);
  await transport.shutdown();
});

test("요청 body 상한과 token 실패는 runner 전에 거부한다", async () => {
  let calls = 0;
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(async () => { calls += 1; return { outcome: "passed" }; }),
  });
  const owner = await session(transport);
  const oversized = await send(transport, "/api/java/run", quest(owner.sessionId, {
    source: "x".repeat(33 * 1024),
  }), { authorization: `Bearer ${owner.token}` });
  assert.equal(oversized.status, 413);
  const unauthorized = await send(transport, "/api/java/run", quest(owner.sessionId), {
    authorization: "Bearer wrong",
  });
  assert.equal(unauthorized.status, 401);
  assert.equal(calls, 0);
  await transport.shutdown();
});

test("소유자 취소는 fake signal로 전달되고 같은 세션만 제어한다", async () => {
  let started;
  const startedPromise = new Promise((resolve) => { started = resolve; });
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner((kind, runRequest, { signal }) => new Promise((resolve) => {
      started();
      signal.addEventListener("abort", () => resolve({ outcome: "cancelled" }), { once: true });
    })),
  });
  const owner = await session(transport);
  const auth = { authorization: `Bearer ${owner.token}` };
  const first = send(transport, "/api/java/run", quest(owner.sessionId), auth);
  await startedPromise;
  const rejected = await send(transport, "/api/java/cancel", {
    sessionId: "other", requestId: "run-1",
  }, auth);
  assert.equal(rejected.status, 401);
  const cancelled = await send(transport, "/api/java/cancel", {
    sessionId: owner.sessionId, requestId: "run-1",
  }, auth);
  assert.equal(cancelled.status, 202);
  assert.equal((await first).body.report.outcome, "cancelled");
  await transport.shutdown();
});

test("추가 요청 없이 lease가 끝나도 owner를 회수하고 기존 token을 거부한다", async () => {
  const clock = leaseClock();
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(), ...clock,
  });
  const first = await session(transport);
  assert.equal(clock.latest().delay, first.leaseMs);
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  clock.advance(first.leaseMs);
  clock.latest().callback();
  assert.equal(typeof transport.issueNavigationCapability(navigation()), "string");
  const expired = await send(transport, "/api/java/heartbeat", { sessionId: first.sessionId }, {
    authorization: `Bearer ${first.token}`,
  });
  assert.equal(expired.status, 401);
  await transport.shutdown();
});

test("heartbeat는 만료를 연장하고 취소된 이전 타이머·지연 타이머를 무시한다", async () => {
  const clock = leaseClock();
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(), ...clock,
  });
  const first = await session(transport);
  const original = clock.latest();
  clock.advance(5_000);
  const heartbeat = await send(transport, "/api/java/heartbeat", { sessionId: first.sessionId }, {
    authorization: `Bearer ${first.token}`,
  });
  assert.equal(heartbeat.status, 200);
  assert.equal(original.cleared, true);
  clock.advance(10_000);
  original.callback(); // Already queued when heartbeat reset the deadline.
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  const renewed = clock.latest();
  renewed.callback(); // Callback ran early relative to the monotonic clock.
  assert.equal(clock.latest().delay, 5_000);
  clock.advance(5_000);
  clock.latest().callback();
  assert.equal(typeof transport.issueNavigationCapability(navigation()), "string");
  await transport.shutdown();
});

test("lease 만료는 실행을 abort하고 회수 완료 전 새 owner를 막는다", async () => {
  const clock = leaseClock();
  let started;
  let finishReap;
  let aborted = false;
  const startedPromise = new Promise((resolve) => { started = resolve; });
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true, ...clock,
    runner: fakeRunner((kind, runRequest, { signal }) => new Promise((resolve) => {
      signal.addEventListener("abort", () => { aborted = true; }, { once: true });
      finishReap = resolve;
      started();
    })),
  });
  const first = await session(transport);
  const running = send(transport, "/api/java/run", quest(first.sessionId), {
    authorization: `Bearer ${first.token}`,
  });
  await startedPromise;
  clock.advance(first.leaseMs);
  clock.latest().callback();
  assert.equal(aborted, true);
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  finishReap({ outcome: "cancelled" });
  assert.equal((await running).status, 503);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(typeof transport.issueNavigationCapability(navigation()), "string");
  await transport.shutdown();
});

test("release·shutdown은 타이머를 취소하고 이전 owner callback이 새 owner를 닫지 못한다", async () => {
  const clock = leaseClock();
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(), ...clock,
  });
  const first = await session(transport);
  const oldTimer = clock.latest();
  const released = await send(transport, "/api/java/release", { sessionId: first.sessionId }, {
    authorization: `Bearer ${first.token}`,
  });
  assert.equal(released.status, 200);
  assert.equal(oldTimer.cleared, true);
  const second = await session(transport);
  clock.advance(second.leaseMs);
  oldTimer.callback();
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  const secondTimer = clock.latest();
  await transport.shutdown();
  assert.equal(secondTimer.cleared, true);
  secondTimer.callback();
  assert.equal(transport.issueNavigationCapability(navigation()), null);
});

test("run보다 먼저 온 소유자 cancel은 ID를 묶어 뒤늦은 실행을 막는다", async () => {
  let validations = 0;
  let launches = 0;
  const runner = fakeRunner(async () => { launches += 1; return { outcome: "passed" }; });
  const originalValidate = runner.validate;
  runner.validate = (...args) => { validations += 1; return originalValidate(...args); };
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true, runner,
  });
  const first = await session(transport);
  const auth = { authorization: `Bearer ${first.token}` };
  const cancelled = await send(transport, "/api/java/cancel", {
    sessionId: first.sessionId, requestId: "run-1",
  }, auth);
  assert.equal(cancelled.status, 410);
  const delayed = await send(transport, "/api/java/run", quest(first.sessionId), auth);
  assert.equal(delayed.status, 410);
  assert.equal(validations, 0);
  assert.equal(launches, 0);
  await transport.shutdown();
});

test("사전 취소 ID 128개 이후 새 실행은 session 한도에서 차단된다", async () => {
  let launches = 0;
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true,
    runner: fakeRunner(async () => { launches += 1; return { outcome: "passed" }; }),
  });
  const first = await session(transport);
  const auth = { authorization: `Bearer ${first.token}` };
  for (let index = 0; index < 128; index += 1) {
    const cancelled = await send(transport, "/api/java/cancel", {
      sessionId: first.sessionId, requestId: `cancel-${index}`,
    }, auth);
    assert.equal(cancelled.status, 410);
  }
  const blocked = await send(transport, "/api/java/run", quest(first.sessionId), auth);
  assert.equal(blocked.status, 429);
  assert.equal(launches, 0);
  await transport.shutdown();
});

test("만료 abort 뒤 runner 회수 실패는 새 세션을 poison으로 차단한다", async () => {
  const clock = leaseClock();
  let started;
  const startedPromise = new Promise((resolve) => { started = resolve; });
  const transport = createJavaBrowserTransport({
    port: 4173, runtimeReady: true, learnerIsolationValidated: true, ...clock,
    runner: fakeRunner((kind, runRequest, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("cleanup unknown")), { once: true });
      started();
    })),
  });
  const first = await session(transport);
  const running = send(transport, "/api/java/run", quest(first.sessionId), {
    authorization: `Bearer ${first.token}`,
  });
  await startedPromise;
  clock.advance(first.leaseMs);
  clock.latest().callback();
  assert.equal((await running).body.error.code, "reap_unknown");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(transport.issueNavigationCapability(navigation()), null);
  await transport.shutdown();
});

test("실제 listener 없이 정적 기본 동작과 Java 모드 Worker CSP를 구분한다", async () => {
  async function staticRequest(server, url, requestedHost = host) {
    const stream = new PassThrough();
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.writeHead = (status, responseHeaders) => {
      stream.status = status;
      stream.headers = responseHeaders;
    };
    const requestHeaders = { host: requestedHost };
    server.emit("request", {
      method: "GET", url, headers: requestHeaders,
      rawHeaders: Object.entries(requestHeaders).flat(),
    }, stream);
    await once(stream, "finish");
    return { status: stream.status, headers: stream.headers, body: Buffer.concat(chunks).toString("utf8") };
  }

  const basic = createDevServer();
  assert.equal((await staticRequest(basic, "/index.html")).status, 200);

  const transport = createJavaBrowserTransport({ port: 4173, runner: fakeRunner() });
  const javaServer = createDevServer({ javaTransport: transport });
  assert.equal((await staticRequest(javaServer, "/index.html", "127.0.0.1:4173")).status, 403);
  assert.equal((await staticRequest(javaServer, "/src/workers/javascript-code-runner.worker.js")).status, 404);
  const isolated = await staticRequest(javaServer, "/src/workers/javascript-code-runner.classic.js");
  assert.equal(isolated.status, 200);
  assert.match(isolated.headers["Content-Security-Policy"], /connect-src 'none'/u);
  assert.match(isolated.headers["Content-Security-Policy"], /worker-src 'none'/u);
  await transport.shutdown();
});
