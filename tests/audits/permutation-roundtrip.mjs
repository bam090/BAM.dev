// Manual Chromium round-trip audit; run separately from npm test:
//   node tests/audits/permutation-roundtrip.mjs
// Requires an already installed, sandbox-capable Chromium and Node with WebSocket.
// Uses only a new temporary profile and its own loopback server. No sandbox fallback,
// installation, personal browser connection, screenshots, or raw session output.
// Expectations: docs/designs/lesson-review.md (R1, trace, prediction, boundary focus)
// and BACKTRACKING-ROUNDTRIP-20261008. Trace implementation is not an oracle here.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createDevServer } from "../../scripts/dev-server.mjs";

const targets = [
  { question: "quiz-java-algo-permutations-missing-unvisit", lesson: "algo-08-permutations-java",
    hash: "#/learn/algorithm/permutations-combinations-java" },
  { question: "quiz-java-algo-backtracking-negative-pruning", lesson: "js-12-brute-force-backtracking",
    hash: "#/learn/algorithm/brute-force-backtracking-recursion" },
];
const sessionKey = "bam.dev.review-session.v1";
const finalAnswers = ["[1, 2, 3]", "[1, 3, 2]", "[2, 1, 3]", "[2, 3, 1]", "[3, 1, 2]", "[3, 2, 1]"];

async function waitFor(check, label, timeout = 10_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error(`Timed out: ${label}`);
}

async function connectPage(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { socket.close(); reject(new Error("CDP connection timed out")); }, 5_000);
    socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("CDP connection failed")); }, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const handlers = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) { handlers.get(message.method)?.(message.params); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  socket.addEventListener("close", () => {
    for (const request of pending.values()) {
      clearTimeout(request.timeout);
      request.reject(new Error("CDP disconnected"));
    }
    pending.clear();
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 8_000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }
  return { send, evaluate, on: (name, handler) => handlers.set(name, handler), close: () => socket.close() };
}

function createDriver(client, requests) {
  const { evaluate, send } = client;
  const has = (selector) => evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
  const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent`);
  const active = (selector) => evaluate(`Boolean(document.activeElement?.matches(${JSON.stringify(selector)}))`);
  const settle = () => evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
  async function key(value) {
    const windowsVirtualKeyCode = { Enter: 13, Escape: 27, " ": 32 }[value];
    const params = { key: value, code: value === " " ? "Space" : value, windowsVirtualKeyCode };
    await send("Input.dispatchKeyEvent", { ...params, type: "rawKeyDown" });
    if (value === "Enter") await send("Input.dispatchKeyEvent", { ...params, type: "char", text: "\r", unmodifiedText: "\r" });
    await send("Input.dispatchKeyEvent", { ...params, type: "keyUp" });
  }
  async function focus(selector) {
    assert.equal(await has(selector), true, `Missing control: ${selector}`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus({preventScroll:true})`);
    assert.equal(await active(selector), true, `Could not focus: ${selector}`);
  }
  async function press(selector, value = "Enter") { await focus(selector); await key(value); }
  const session = () => evaluate(`(() => {
    const saved = JSON.parse(localStorage.getItem(${JSON.stringify(sessionKey)}))?.activeSession;
    if (!saved) throw new Error('Review session was not saved');
    const {id, questionIds, currentIndex, selectedOptionIds, gradedQuestionIds, expandedQuestionIds,
      returnContext, viewport, screen, mode, viewMode, gradingMode, recordAttempted, completedAt,
      firstAttemptByQuestion} = saved;
    return {id, questionIds, currentIndex, selectedOptionIds, gradedQuestionIds, expandedQuestionIds,
      returnContext, viewport, screen, mode, viewMode, gradingMode, recordAttempted, completedAt,
      firstAttemptByQuestion};
  })()`);
  const storage = () => evaluate("Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]))");
  const writes = () => evaluate("window.__roundtripProbe.storageWrites");
  async function step(index, path, used) {
    assert.equal(await text("[data-permutation-counter]"), `${index} / 201단계`);
    assert.equal(await text("[data-permutation-path]"), path);
    assert.equal(await text("[data-permutation-used]"), used);
    if (index >= 32 && index <= 34) {
      assert.deepEqual(await evaluate("[...document.querySelectorAll('.permutation-lab-answers li')].map(node => node.textContent)"), ["[1, 2, 3]"]);
    }
  }
  async function advance(count, value = "Enter") {
    await focus("[data-permutation-next]");
    for (let index = 0; index < count; index += 1) await key(value);
  }
  async function noPrediction() {
    assert.deepEqual(await evaluate("[...document.querySelectorAll('[data-permutation-predict]')].map(node => node.getAttribute('aria-pressed'))"), ["false", "false"]);
    assert.equal(await text("[data-permutation-prediction-selection]"), "아직 선택하지 않았습니다.");
  }
  async function openLab() {
    await press("[data-permutation-open]");
    await waitFor(() => has("dialog.permutation-lab[open]"), "native lab dialog");
    assert.equal(await evaluate("document.querySelectorAll('dialog').length"), 1);
    await step(0, "[]", "[false, false, false]");
    await noPrediction();
    assert.equal(await active("[data-permutation-next]"), true);
  }
  async function exercisePrediction(mode, endpoints) {
    await advance(32);
    await step(32, "[1, 2, 3]", "[true, true, true]");
    assert.equal(await evaluate("document.querySelector('[data-permutation-prediction-question]').hidden"), false);
    await noPrediction();
    if (mode !== "unanswered") {
      // Changing a choice must neither advance nor reveal the actual answer early.
      await press('[data-permutation-predict="keep"]');
      assert.equal(await active('[data-permutation-predict="keep"]'), true);
      assert.equal(await evaluate("document.querySelector('[data-permutation-prediction-result]').hidden"), true);
      if (mode === "remove") await press('[data-permutation-predict="remove"]');
      assert.equal(await text("[data-permutation-counter]"), "32 / 201단계");
      assert.equal(await evaluate(`document.querySelector('[data-permutation-predict="${mode === "remove" ? "remove" : "keep"}"]').getAttribute('aria-pressed')`), "true");
    }
    await press(mode === "skip" ? "[data-permutation-skip]" : "[data-permutation-next]");
    assert.equal(await active("[data-permutation-next]"), true);
    await step(33, "[1, 2]", "[true, true, true]");
    const comparison = await text("[data-permutation-prediction-result]");
    assert.ok(comparison.includes("실제 path = [1, 2]"));
    if (mode === "skip" || mode === "unanswered") assert.ok(!comparison.includes("내 예상:"));
    else assert.ok(comparison.includes(`내 예상: ${mode === "keep" ? "[1, 2, 3]" : "[1, 2]"}`));
    await press("[data-permutation-next]");
    await step(34, "[1, 2]", "[true, true, false]");
    await press("[data-permutation-previous]");
    assert.ok(!(await text("[data-permutation-prediction-result]")).includes("내 예상:"));
    await press("[data-permutation-previous]");
    await noPrediction();
    await press('[data-permutation-predict="remove"]');
    await press("[data-permutation-first]");
    assert.equal(await active("[data-permutation-first]"), true);
    await step(0, "[]", "[false, false, false]");
    await noPrediction();
    if (endpoints) {
      for (const value of ["Enter", " "]) {
        await advance(201, value);
        await step(201, "[]", "[false, false, false]");
        assert.deepEqual(await evaluate("[...document.querySelectorAll('.permutation-lab-answers li')].map(node => node.textContent)"), finalAnswers);
        assert.equal(await active("[data-permutation-previous]"), true);
        for (let index = 0; index < 201; index += 1) await key(value);
        await step(0, "[]", "[false, false, false]");
        assert.equal(await active("[data-permutation-next]"), true);
      }
    }
  }
  async function enterDocument(target) {
    const card = `[data-quiz-question-id="${target.question}"]`;
    await press(`${card} [data-related-concept]`);
    await waitFor(() => has("dialog.concept-dialog[open]"), "related concept dialog");
    await press("[data-concept-document]");
    await waitFor(() => has("[data-permutation-open]"), "linked lesson");
    await settle();
    const hash = await evaluate("location.hash");
    assert.equal(hash.split("?")[0], target.hash);
    assert.equal(await has("[data-review-return]"), true);
    assert.equal(await has("dialog"), false);
    return hash;
  }
  return { has, text, active, settle, key, focus, press, session, storage, writes,
    step, advance, noPrediction, openLab, exercisePrediction, enterDocument,
    requestCount: () => requests.length };
}

async function prepareQuestion(client, driver, origin, target, answerState) {
  // Each case owns this isolated origin. Leave its old app before clearing its data.
  await client.send("Page.navigate", { url: "about:blank" });
  await waitFor(() => client.evaluate("location.href === 'about:blank'"), "blank between cases");
  await client.send("Storage.clearDataForOrigin", { origin, storageTypes: "local_storage" });
  const reviewHash = `#/review/java/${target.lesson}`;
  await client.send("Page.navigate", { url: `${origin}/${reviewHash}` });
  await waitFor(() => driver.has("[data-quiz-view-mode]"), "public Java question UI");
  await driver.press('[data-quiz-view-mode="all"]');
  await driver.settle();
  const card = `[data-quiz-question-id="${target.question}"]`;
  await waitFor(() => driver.has(card), "target question in public collection");
  if (answerState !== "unselected") {
    await driver.press(`${card} [data-quiz-option][value="a"]`, " ");
    if (answerState === "graded-expanded") {
      await driver.press(`${card} [data-quiz-check]`);
      await driver.settle();
      await waitFor(() => driver.has(`${card} [data-quiz-feedback-toggle]`), "graded question");
      await driver.press(`${card} [data-quiz-feedback-toggle]`);
      await driver.settle();
    }
  }
  await client.evaluate(`document.querySelector(${JSON.stringify(card)}).scrollIntoView({block:'start',behavior:'instant'})`);
  await driver.focus(`${card} [data-related-concept]`);
  await driver.settle();
  const saved = await driver.session();
  assert.equal(saved.questionIds[saved.currentIndex], target.question);
  assert.equal(saved.selectedOptionIds.some(([id, value]) => id === target.question && value === "a"), answerState !== "unselected");
  assert.equal(saved.gradedQuestionIds.includes(target.question), answerState === "graded-expanded");
  assert.equal(saved.expandedQuestionIds.includes(target.question), answerState === "graded-expanded");
  return { reviewHash, questionScroll: await client.evaluate("scrollY"), before: saved };
}

async function auditRoundTrip(client, driver, origin, target, answerState, closeMethod, mode, endpoints) {
  const { reviewHash, questionScroll, before } = await prepareQuestion(client, driver, origin, target, answerState);
  const documentHash = await driver.enterDocument(target);
  const saved = await driver.session();
  for (const property of ["id", "questionIds", "currentIndex", "selectedOptionIds", "gradedQuestionIds", "expandedQuestionIds"]) {
    assert.deepEqual(saved[property], before[property], `Entering document changed ${property}`);
  }
  assert.equal(saved.returnContext.sessionId, saved.id);
  assert.equal(saved.returnContext.questionId, target.question);
  assert.equal(saved.returnContext.lessonId, target.lesson);
  assert.equal(new URLSearchParams(documentHash.split("?")[1]).get("review"), saved.returnContext.token);
  assert.ok(saved.returnContext.token);
  // Keep an actual node reference: equal HTML alone would miss DOM replacement.
  await client.evaluate(`window.__roundtripProbe.lessonBody = document.querySelector('article.lesson-body');
    window.__roundtripProbe.lessonHTML = window.__roundtripProbe.lessonBody.outerHTML;
    window.scrollTo({top:600,behavior:'instant'})`);
  await driver.focus("[data-permutation-open]");
  await driver.settle();
  const readingScroll = await client.evaluate("scrollY");
  const storageBefore = await driver.storage();
  const writesBefore = await driver.writes();
  const requestsBefore = driver.requestCount();
  await driver.openLab();
  await driver.exercisePrediction(mode, endpoints);
  if (closeMethod === "escape") await driver.key("Escape");
  else await driver.press("[data-permutation-close]");
  await waitFor(async () => !(await driver.has("dialog")), "lab dismissal");
  assert.equal(await driver.active("[data-permutation-open]"), true);
  assert.ok(Math.abs(await client.evaluate("scrollY") - readingScroll) <= 1, "Lesson scroll was not restored");
  assert.equal(await client.evaluate("location.hash"), documentHash);
  assert.equal(await client.evaluate("document.querySelector('article.lesson-body') === window.__roundtripProbe.lessonBody && window.__roundtripProbe.lessonBody.outerHTML === window.__roundtripProbe.lessonHTML"), true);
  // Closing and reopening must create a fresh attempt, still without persistence.
  await driver.openLab();
  await driver.advance(32);
  await driver.noPrediction();
  await driver.key("Escape");
  await driver.settle();
  assert.deepEqual(await driver.storage(), storageBefore, "Lab changed persisted data");
  assert.equal(await driver.writes(), writesBefore, "Lab attempted a storage write");
  assert.equal(driver.requestCount(), requestsBefore, "Lab made a network request");
  assert.deepEqual(await driver.session(), saved);
  await driver.press("[data-review-return]");
  await waitFor(() => driver.has(`[data-quiz-question-id="${target.question}"]`), "return to original question");
  await driver.settle();
  assert.equal(await client.evaluate("location.hash"), reviewHash);
  assert.deepEqual(await driver.session(), saved, "Question round trip lost saved state");
  assert.equal(await driver.active(`#quiz-related-concept-${target.question}`), true);
  assert.ok(Math.abs(await client.evaluate("scrollY") - questionScroll) <= 1, "Question scroll was not restored");
  const card = `[data-quiz-question-id="${target.question}"]`;
  assert.equal(await driver.has(`${card} [data-quiz-option]:checked`), answerState !== "unselected");
  assert.equal(await driver.has(`${card} [data-quiz-grade-summary]`), answerState === "graded-expanded");
  assert.equal(await driver.has(`${card} [data-quiz-feedback-toggle][aria-expanded="true"]`), answerState === "graded-expanded");
  return { question: target.question, answerState, closeMethod, prediction: mode, storageWrites: 0, networkRequests: 0 };
}

async function auditHistory(client, driver, target, otherTarget) {
  const documentHash = await driver.enterDocument(target);
  const originalSession = await driver.session();
  await driver.openLab();
  await driver.advance(32);
  await driver.press('[data-permutation-predict="keep"]');
  // A stale trigger must not be focused during navigation disposal.
  await client.evaluate(`window.__roundtripProbe.staleFocusCalls = 0;
    const oldTrigger = document.querySelector('[data-permutation-open]');
    const focus = oldTrigger.focus;
    oldTrigger.focus = function(...args) { window.__roundtripProbe.staleFocusCalls += 1; return focus.apply(this,args); };
    history.back()`);
  await waitFor(() => driver.has(`[data-quiz-question-id="${target.question}"]`), "browser Back to question");
  await driver.settle();
  // The review screen keeps its scope dialog in the DOM while closed.
  assert.equal(await driver.has("dialog[open], dialog.permutation-lab, dialog.concept-dialog"), false);
  assert.equal(await client.evaluate("window.__roundtripProbe.staleFocusCalls"), 0);
  assert.deepEqual(await driver.session(), originalSession);
  assert.equal(await driver.active(`#quiz-related-concept-${target.question}`), true);
  await client.evaluate("history.forward()");
  await waitFor(() => driver.has("[data-permutation-open]"), "browser Forward to document");
  await driver.settle();
  assert.equal(await client.evaluate("location.hash"), documentHash);
  assert.equal(await driver.has("dialog"), false);
  await driver.openLab();
  await driver.advance(32);
  await driver.noPrediction();
  await driver.press('[data-permutation-predict="remove"]');
  await client.evaluate(`location.hash = ${JSON.stringify(otherTarget.hash)}`);
  await waitFor(() => client.evaluate(`location.hash === ${JSON.stringify(otherTarget.hash)} && !document.querySelector('dialog') && !document.querySelector('[data-review-return]') && Boolean(document.querySelector('[data-permutation-open]'))`), "different document without return authority");
  await driver.settle();
  assert.equal(await driver.active("[data-permutation-open]"), false, "Old dialog must not restore trigger focus in a different document");
  assert.equal(await client.evaluate("window.__roundtripProbe.staleFocusCalls"), 0);
  await driver.openLab();
  await driver.advance(32);
  await driver.noPrediction();
  await driver.key("Escape");
  assert.equal(await driver.has("[data-review-return]"), false);
  await client.evaluate("history.back()");
  await waitFor(() => driver.has("[data-review-return]"), "Back to token-bearing lesson");
  await driver.settle();
  assert.equal(await client.evaluate("location.hash"), documentHash);
  assert.equal(await driver.has("dialog"), false);
  await driver.openLab();
  await driver.noPrediction();
  await driver.key("Escape");
  await driver.press("[data-review-return]");
  await waitFor(() => driver.has(`[data-quiz-question-id="${target.question}"]`), "return after document history");
  await driver.settle();
  assert.deepEqual(await driver.session(), originalSession);
  return { question: target.question, backForward: true, differentDocument: true, freshReentry: true, staleTriggerFocusCalls: 0 };
}

assert.equal(typeof WebSocket, "function", "Use Node with built-in WebSocket; do not install a package.");
const profile = await mkdtemp(join(tmpdir(), "bam-roundtrip-isolated-"));
const server = createDevServer();
let browser;
let client;
let launchError;
let browserLog = "";
let networkError;
const requests = [];
const exceptions = [];
const externalRequests = [];
const interrupt = () => { client?.close(); browser?.kill("SIGTERM"); };
process.once("SIGINT", interrupt);
process.once("SIGTERM", interrupt);
try {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = spawn(process.env.BAM_CHROMIUM_PATH || "/usr/bin/chromium", [
    "--headless=new", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-sync", "--disable-component-update",
    "--disable-dev-shm-usage", "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"], detached: process.platform !== "win32",
    env: { ...process.env, XDG_CONFIG_HOME: join(profile, "config"), XDG_CACHE_HOME: join(profile, "cache") } });
  browser.on("error", (error) => { launchError = error; });
  browser.stderr.on("data", (data) => { browserLog = (browserLog + data.toString()).slice(-4_000); });
  const port = await waitFor(async () => {
    if (launchError) throw launchError;
    if (browser.exitCode !== null || browser.signalCode !== null) throw new Error(`Chromium launch blocked or failed; sandbox unchanged: ${browserLog}`);
    try { return Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); }
    catch (error) { if (error.code !== "ENOENT") throw error; return null; }
  }, "sandboxed Chromium debug port");
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find((entry) => entry.type === "page" && entry.url === "about:blank");
  assert.ok(page, "Only the new about:blank page is eligible");
  client = await connectPage(page.webSocketDebuggerUrl);
  client.on("Fetch.requestPaused", ({ requestId, request }) => {
    const allowed = new URL(request.url).origin === origin;
    if (!allowed) externalRequests.push(request.url);
    client.send(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed ? { requestId } : { requestId, errorReason: "BlockedByClient" })
      .catch((error) => { networkError = error; client.close(); });
  });
  client.on("Network.requestWillBeSent", ({ request }) => requests.push({ url: request.url, method: request.method }));
  client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => exceptions.push(exceptionDetails.text));
  await client.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  await client.send("Page.bringToFront");
  await client.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await client.send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__roundtripProbe = {storageWrites:0};
    for (const method of ['setItem','removeItem','clear']) {
      const original = Storage.prototype[method];
      Storage.prototype[method] = function(...args) {
        window.__roundtripProbe.storageWrites += 1;
        return original.apply(this,args);
      };
    }` });
  const driver = createDriver(client, requests);
  const reports = [];
  for (const [width, height] of [[1440, 1000], [320, 640]]) {
    await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width === 320 });
    const roundTrips = [];
    const history = [];
    let modeIndex = 0;
    for (const target of targets) {
      for (const answerState of ["unselected", "selected", "graded-expanded"]) {
        for (const closeMethod of ["button", "escape"]) {
          const mode = ["keep", "remove", "skip", "unanswered"][modeIndex++ % 4];
          roundTrips.push(await auditRoundTrip(client, driver, origin, target, answerState, closeMethod, mode, modeIndex === 1));
        }
      }
      history.push(await auditHistory(client, driver, target, targets.find((entry) => entry !== target)));
    }
    reports.push({ width, height, roundTrips, history });
  }
  if (networkError) throw networkError;
  assert.deepEqual(externalRequests, [], "Unexpected external page request");
  assert.deepEqual(exceptions, [], "Unexpected browser runtime exception");
  const version = await client.send("Browser.getVersion");
  console.log(JSON.stringify({ node: process.version, browser: version.product, isolatedProfile: true,
    sandboxDisabled: false, actualChromium: true, syntheticKeyboard: true,
    humanVisualReview: false, screenReaderTest: false, otherBrowserTest: false, reports }, null, 2));
} finally {
  client?.close();
  if (browser?.pid) {
    const signal = (name) => {
      try { process.platform === "win32" ? browser.kill(name) : process.kill(-browser.pid, name); }
      catch (error) { if (error.code !== "ESRCH") throw error; }
    };
    signal("SIGTERM");
    if (browser.exitCode === null && browser.signalCode === null) {
      await Promise.race([new Promise((resolve) => browser.once("exit", resolve)), delay(2_000)]);
    }
    signal("SIGKILL");
  }
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  process.removeListener("SIGINT", interrupt);
  process.removeListener("SIGTERM", interrupt);
}
