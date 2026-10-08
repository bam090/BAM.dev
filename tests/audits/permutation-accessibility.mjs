// Manual synthetic accessibility audit, not a screen-reader test or an npm test dependency.
// Requires installed Chromium and a Node version with built-in WebSocket (verified: Node 24).
// Run: node tests/audits/permutation-accessibility.mjs
// In a disposable container that cannot provide Chromium's sandbox, explicitly opt in with
// BAM_CHROMIUM_NO_SANDBOX=1. BAM_CHROMIUM_PATH may select an already installed executable.
// Starts its own loopback server and fresh browser; never attaches to an existing debug port.
// Prints synthetic summaries only. No raw AX trees, screenshots, or user data are saved.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createDevServer } from "../../scripts/dev-server.mjs";

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
    if (!message.id) {
      handlers.get(message.method)?.(message.params);
      return;
    }
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
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 8_000);
      pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }
  return { send, evaluate, on: (name, handler) => handlers.set(name, handler), close: () => socket.close() };
}

function axProperty(node, name) {
  assert.ok(node, `Missing accessibility node for ${name}`);
  return node.properties?.find((property) => property.name === name)?.value?.value;
}

async function auditViewport(client, origin, width, height) {
  const { send, evaluate } = client;
  const focus = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  const activeHas = (attribute) => evaluate(`document.activeElement.hasAttribute(${JSON.stringify(attribute)})`);
  async function key(value, modifiers = 0) {
    const windowsVirtualKeyCode = { Tab: 9, Enter: 13, Escape: 27, " ": 32 }[value];
    const params = { key: value, code: value === " " ? "Space" : value, windowsVirtualKeyCode, modifiers };
    await send("Input.dispatchKeyEvent", { ...params, type: "rawKeyDown" });
    if (value === "Enter") await send("Input.dispatchKeyEvent", { ...params, type: "char", text: "\r", unmodifiedText: "\r" });
    await send("Input.dispatchKeyEvent", { ...params, type: "keyUp" });
  }
  async function ax() {
    return (await send("Accessibility.getFullAXTree")).nodes.filter((node) => !node.ignored);
  }
  const button = (nodes, name) => nodes.find((node) => node.role.value === "button" && node.name.value === name);
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width === 320 });
  await send("Page.navigate", { url: `${origin}/#/learn/algorithm/permutations-combinations-java` });
  await waitFor(() => evaluate("Boolean(document.querySelector('[data-permutation-open]'))"), "lesson entry");
  await focus("[data-permutation-open]");
  await key("Enter");
  await waitFor(() => evaluate("Boolean(document.querySelector('dialog[open]'))"), "open dialog");
  let nodes = await ax();
  const dialog = nodes.find((node) => node.role.value === "dialog");
  assert.equal(dialog?.name.value, "선택한 뒤, 어떻게 돌아올까요?");
  assert.equal(axProperty(dialog, "modal"), true);
  assert.deepEqual(nodes.filter((node) => node.role.value === "button").map((node) => node.name.value).sort(),
    ["문서로 돌아가기", "처음부터", "이전", "다음"].sort());
  assert.equal(axProperty(button(nodes, "이전"), "disabled"), true);
  const status = nodes.find((node) => node.role.value === "status");
  assert.equal(axProperty(status, "live"), "polite");
  assert.equal(axProperty(status, "atomic"), true);
  assert.ok(!nodes.some((node) => node.role.value === "link" && node.name.value === "마이페이지"));

  for (const modifiers of [0, 8]) {
    for (let index = 0; index < 12; index += 1) {
      await key("Tab", modifiers);
      // Browser chrome may receive focus; no focused page element may escape the modal.
      assert.equal(await evaluate("!document.hasFocus() || Boolean(document.activeElement.closest('dialog'))"), true);
    }
  }
  await focus("[data-permutation-next]");
  for (let index = 0; index < 32; index += 1) await key(" ");
  nodes = await ax();
  assert.ok(nodes.some((node) => node.role.value === "region" && node.name.value === "첫 복귀의 path 예상과 관찰"));
  for (const name of ["[1, 2, 3] 그대로", "[1, 2]로 줄어듦"]) assert.equal(axProperty(button(nodes, name), "pressed"), "false");
  await focus('[data-permutation-predict="keep"]');
  await key("Enter");
  nodes = await ax();
  assert.equal(axProperty(button(nodes, "[1, 2, 3] 그대로"), "pressed"), "true");
  assert.equal(axProperty(button(nodes, "[1, 2]로 줄어듦"), "pressed"), "false");
  assert.ok(nodes.some((node) => node.role.value === "StaticText" && node.name.value.includes("내 예상: [1, 2, 3]")));
  await key("Tab");
  await key(" ");
  assert.equal(await evaluate("document.activeElement.getAttribute('data-permutation-predict')"), "remove");
  await key("Tab");
  assert.equal(await activeHas("data-permutation-skip"), true);
  await key("Enter");
  assert.equal(await activeHas("data-permutation-next"), true);
  nodes = await ax();
  assert.ok(!button(nodes, "건너뛰기"));
  assert.ok(nodes.some((node) => node.role.value === "StaticText" && node.name.value.includes("실제 path = [1, 2]")));
  await focus("[data-permutation-first]");
  await key("Enter");
  assert.equal(await activeHas("data-permutation-first"), true);
  assert.equal(await evaluate("document.querySelector('[data-permutation-counter]').textContent"), "0 / 201단계");
  await key("Escape");
  assert.equal(await activeHas("data-permutation-open"), true);
  assert.equal(await evaluate("document.querySelector('dialog') === null"), true);
  return { width, height, namedModal: true, statusLive: "polite", statusAtomic: true,
    backgroundLinkExcluded: true, tabChecks: 24, predictionPressed: true,
    selectionAndActualExposed: true, skipFocus: true, restartFocus: true, escapeRestore: true };
}

assert.equal(typeof WebSocket, "function", "Use a Node version with built-in WebSocket; no package installation is required.");
const profile = await mkdtemp(join(tmpdir(), "bam-ax-isolated-"));
const server = createDevServer();
let browser;
let client;
let launchError;
let browserLog = "";
let networkError;
const interrupt = () => { client?.close(); browser?.kill("SIGTERM"); };
process.once("SIGINT", interrupt);
process.once("SIGTERM", interrupt);
try {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const args = ["--headless=new", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-sync", "--disable-component-update",
    "--disable-dev-shm-usage", "about:blank"];
  if (process.env.BAM_CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  browser = spawn(process.env.BAM_CHROMIUM_PATH || "chromium", args, {
    stdio: ["ignore", "ignore", "pipe"], detached: process.platform !== "win32",
    env: { ...process.env, XDG_CONFIG_HOME: join(profile, "config"), XDG_CACHE_HOME: join(profile, "cache") },
  });
  browser.on("error", (error) => { launchError = error; });
  browser.stderr.on("data", (data) => { browserLog = (browserLog + data.toString()).slice(-4_000); });
  const debugPort = await waitFor(async () => {
    if (launchError) throw launchError;
    if (browser.exitCode !== null || browser.signalCode !== null) throw new Error(`Chromium launch failed: ${browserLog}`);
    try { return Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); }
    catch (error) { if (error.code !== "ENOENT") throw error; return null; }
  }, "isolated Chromium debug port");
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const target = targets.find((entry) => entry.type === "page" && entry.url === "about:blank");
  assert.ok(target, "Only the freshly created about:blank target is eligible");
  client = await connectPage(target.webSocketDebuggerUrl);
  client.on("Fetch.requestPaused", ({ requestId, request }) => {
    const allowed = new URL(request.url).origin === origin;
    client.send(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed ? { requestId } : { requestId, errorReason: "BlockedByClient" })
      .catch((error) => { networkError = error; client.close(); });
  });
  await client.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Accessibility.enable");
  await client.send("Page.bringToFront");
  await client.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  const reports = [];
  for (const [width, height] of [[1440, 1000], [320, 640]]) reports.push(await auditViewport(client, origin, width, height));
  if (networkError) throw networkError;
  const version = await client.send("Browser.getVersion");
  console.log(JSON.stringify({ node: process.version, browser: version.product,
    isolatedProfile: true, rawAccessibilityTreesSaved: false, screenReaderTest: false,
    chromiumSandboxDisabled: process.env.BAM_CHROMIUM_NO_SANDBOX === "1", reports }, null, 2));
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
