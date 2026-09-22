"use strict";

const { readFile, realpath, stat } = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, ipcMain, protocol, session } = require("electron");

const APP_ORIGIN = "bam://app";
const JAVA_EVALUATION_KIND = "java-static-method-v1";
const JAVA_MANIFEST_PATH = path.join("dist", "content", "quests", "java.json");
const JAVA_CT_EVALUATION_KIND = "java-junit-method-v1";
const JAVA_CT_MANIFEST_PATH = path.join("dist", "content", "coding-tests", "java.json");
const MAX_SOURCE_BYTES = 20 * 1024;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const QUEST_ID_PATTERN = /^quest-java-[a-z0-9-]{1,96}$/u;
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");
const WORKER_CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY.replace(
  "script-src 'self'",
  "script-src 'self' 'unsafe-eval'",
);
const WORKER_PATH = "src/workers/javascript-code-runner.worker.js";
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

protocol.registerSchemesAsPrivileged([
  {
    scheme: "bam",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

let mainWindow = null;
let activeRun = null;
let runTransition = Promise.resolve();
let quittingAfterCleanup = false;
const finishedRequestIds = new Set();

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactFields(value, names) {
  if (!isPlainRecord(value)) return false;
  const keys = Reflect.ownKeys(value);
  return (
    keys.length === names.length &&
    keys.every((key) => typeof key === "string" && names.includes(key))
  );
}

function assertRunRequest(request, kind = "quest") {
  const idField = kind === "coding-test" ? "problemId" : "questId";
  const fields = ["requestId", idField, "revision", "source", ...(kind === "coding-test" ? ["mode"] : [])];
  if (!hasExactFields(request, fields) || fields.some((name) => {
    const descriptor = Object.getOwnPropertyDescriptor(request, name);
    return !descriptor?.enumerable || !("value" in descriptor);
  })) {
    throw new TypeError("Java 실행 요청 형식이 올바르지 않습니다.");
  }
  if (typeof request.requestId !== "string" || !REQUEST_ID_PATTERN.test(request.requestId)) {
    throw new TypeError("Java 실행 requestId 형식이 올바르지 않습니다.");
  }
  const idPattern = kind === "coding-test" ? /^coding-test-java-[a-z0-9-]{1,96}$/u : QUEST_ID_PATTERN;
  if (typeof request[idField] !== "string" || !idPattern.test(request[idField])) {
    throw new TypeError(`Java 실행 ${idField} 형식이 올바르지 않습니다.`);
  }
  if (kind === "coding-test" && !["run", "submit"].includes(request.mode)) throw new TypeError("Java CT mode가 올바르지 않습니다.");
  if (!Number.isSafeInteger(request.revision) || request.revision < 1) {
    throw new TypeError("Java 실행 revision은 1 이상의 안전한 정수여야 합니다.");
  }
  if (
    typeof request.source !== "string" ||
    Buffer.byteLength(request.source, "utf8") > MAX_SOURCE_BYTES
  ) {
    throw new TypeError("Java source는 UTF-8 20 KiB 이하여야 합니다.");
  }
}

function assertCancelRequest(request) {
  if (
    !hasExactFields(request, ["requestId"]) ||
    !REQUEST_ID_PATTERN.test(request.requestId)
  ) {
    throw new TypeError("Java 취소 요청 형식이 올바르지 않습니다.");
  }
}

function frameIdentity(event) {
  return {
    webContentsId: event.sender.id,
    processId: event.senderFrame.processId,
    routingId: event.senderFrame.routingId,
  };
}

function sameFrame(left, right) {
  return (
    left.webContentsId === right.webContentsId &&
    left.processId === right.processId &&
    left.routingId === right.routingId
  );
}

function isTrustedAppUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "bam:" &&
      url.hostname === "app" &&
      url.port === "" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

function assertTrustedMainFrame(event) {
  const frame = event.senderFrame;
  if (
    mainWindow === null ||
    mainWindow.isDestroyed() ||
    event.sender !== mainWindow.webContents ||
    event.sender.isDestroyed() ||
    frame !== event.sender.mainFrame
  ) {
    throw new Error("허용되지 않은 Java 실행 호출입니다.");
  }

  if (!isTrustedAppUrl(frame.url)) {
    throw new Error("허용되지 않은 Java 실행 origin입니다.");
  }
}

function safeAssetPath(requestUrl) {
  const url = new URL(requestUrl);
  if (
    url.protocol !== "bam:" ||
    url.hostname !== "app" ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== ""
  ) {
    return null;
  }

  let decodedPath;
  try {
    const rawPath = requestUrl.match(/^bam:\/\/[^/?#]*([^?#]*)/u)?.[1] ?? "";
    decodedPath = decodeURIComponent(rawPath || "/");
  } catch {
    return null;
  }
  if (
    decodedPath.includes("\\") ||
    decodedPath.includes("\0") ||
    decodedPath.startsWith("//")
  ) {
    return null;
  }

  const segments = decodedPath.split("/");
  if (segments.includes(".") || segments.includes("..")) return null;
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  if (relativePath === "" || path.posix.isAbsolute(relativePath)) return null;
  return path.posix.normalize(relativePath);
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function responseHeaders(relativePath, contentType = "text/plain; charset=utf-8") {
  return {
    "Content-Type": contentType,
    "Content-Security-Policy":
      relativePath === WORKER_PATH
        ? WORKER_CONTENT_SECURITY_POLICY
        : CONTENT_SECURITY_POLICY,
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=()",
    "X-Content-Type-Options": "nosniff",
  };
}

async function registerAssetProtocol() {
  const assetRoot = await realpath(path.join(app.getAppPath(), "dist"));
  protocol.handle("bam", async (request) => {
    const relativePath = safeAssetPath(request.url);
    if (!relativePath || !["GET", "HEAD"].includes(request.method)) {
      return new Response("Not found", {
        status: 404,
        headers: responseHeaders(""),
      });
    }

    try {
      const candidatePath = path.join(assetRoot, ...relativePath.split("/"));
      const resolvedPath = await realpath(candidatePath);
      const fileStat = await stat(resolvedPath);
      if (!isInside(assetRoot, resolvedPath) || !fileStat.isFile()) throw new Error("not found");
      const contentType = MIME_TYPES.get(path.extname(resolvedPath).toLowerCase());
      if (!contentType) throw new Error("unsupported asset");
      const body = request.method === "HEAD" ? null : await readFile(resolvedPath);
      return new Response(body, {
        status: 200,
        headers: responseHeaders(relativePath, contentType),
      });
    } catch {
      return new Response("Not found", {
        status: 404,
        headers: responseHeaders(""),
      });
    }
  });
}

function configureSessionSecurity() {
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: [
        "http://*/*",
        "https://*/*",
        "file://*/*",
        "ftp://*/*",
        "ws://*/*",
        "wss://*/*",
      ],
    },
    (_details, callback) => callback({ cancel: true }),
  );
}

async function loadJavaRuntime() {
  const moduleUrl = pathToFileURL(
    path.join(process.resourcesPath, "runtime", "supervisor.mjs"),
  ).href;
  const runtime = await import(moduleUrl);
  if (
    typeof runtime.getJavaQuestCapabilities !== "function" ||
    typeof runtime.runJavaQuest !== "function"
  ) {
    throw new Error("Java runtime module contract mismatch");
  }
  return runtime;
}

async function loadTrustedManifest() {
  const manifestPath = path.join(app.getAppPath(), JAVA_MANIFEST_PATH);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    !isPlainRecord(manifest) ||
    manifest.contractVersion !== 1 ||
    manifest.languageId !== "java" ||
    manifest.evaluationKind !== JAVA_EVALUATION_KIND ||
    !Array.isArray(manifest.quests)
  ) {
    throw new Error("Java Quest manifest contract mismatch");
  }
  return manifest;
}

let javaRuntimePromise = null;
let trustedManifestPromise = null;
let trustedCodingTestManifestPromise = null;

async function loadTrustedCodingTestManifest() {
  const manifest = JSON.parse(await readFile(path.join(app.getAppPath(), JAVA_CT_MANIFEST_PATH), "utf8"));
  if (!isPlainRecord(manifest) || manifest.contractVersion !== 1 || manifest.languageId !== "java"
    || manifest.evaluationKind !== JAVA_EVALUATION_KIND || !Array.isArray(manifest.problems)) throw new Error("Java CT manifest contract mismatch");
  return manifest;
}

function getTrustedCodingTestManifest() {
  trustedCodingTestManifestPromise ??= loadTrustedCodingTestManifest();
  return trustedCodingTestManifestPromise;
}

function getJavaRuntime() {
  javaRuntimePromise ??= loadJavaRuntime();
  return javaRuntimePromise;
}

function getTrustedManifest() {
  trustedManifestPromise ??= loadTrustedManifest();
  return trustedManifestPromise;
}

function unavailableCapabilities(evaluationKind = JAVA_EVALUATION_KIND, reason = "이 설치본에서 Java 실행기를 준비하지 못했습니다.") {
  return {
    contractVersion: 1,
    evaluationKind,
    available: false,
    reason,
  };
}

function normalizeCapabilities(capabilities, evaluationKind = JAVA_EVALUATION_KIND) {
  if (
    !isPlainRecord(capabilities) ||
    capabilities.contractVersion !== 1 ||
    capabilities.evaluationKind !== evaluationKind ||
    typeof capabilities.available !== "boolean"
  ) {
    return unavailableCapabilities(evaluationKind);
  }
  if (capabilities.available) {
    return {
      contractVersion: 1,
      evaluationKind,
      available: true,
    };
  }
  return unavailableCapabilities(evaluationKind, evaluationKind === JAVA_CT_EVALUATION_KIND && typeof capabilities.reason === "string" ? capabilities.reason : undefined);
}

function engineErrorReport(request, kind = "quest") {
  return {
    requestId: request.requestId,
    contractVersion: 1,
    ...(kind === "coding-test" ? {
      problemId: request.problemId, problemRevision: request.revision,
      evaluationKind: JAVA_CT_EVALUATION_KIND, mode: request.mode,
    } : { questId: request.questId, questRevision: request.revision }),
    languageId: "java",
    suite: "public",
    outcome: "engine_error",
    tests: [],
    summary: {
      outcome: "not_run",
      total: 0,
      passed: 0,
      wrong_answer: 0,
      syntax_error: 0,
      runtime_error: 0,
      timeout: 0,
      output_limit: 0,
      cancelled: 0,
      engine_error: 0,
      not_run: 0,
    },
    durationMs: 0,
    limitsApplied: null,
    error: {
      type: "java_runtime_unavailable",
      message: "Java 실행기를 준비하지 못했습니다.",
      learnerMessage: "Java 실행기를 준비하지 못했습니다. 앱을 다시 시작해 주세요.",
    },
  };
}

async function beginJavaRun(event, request, kind = "quest") {
  assertTrustedMainFrame(event);
  if (
    finishedRequestIds.has(request.requestId) ||
    activeRun?.requestId === request.requestId
  ) {
    throw new TypeError("이미 사용한 Java 실행 requestId입니다.");
  }

  const previous = activeRun;
  const controller = new AbortController();
  const record = {
    kind,
    requestId: request.requestId,
    owner: frameIdentity(event),
    controller,
    promise: null,
  };
  let execution;
  const start = runTransition.then(async () => {
    if (previous) await previous.promise;

    assertTrustedMainFrame(event);
    execution = (async () => {
      const [runtime, trustedManifest] = await Promise.all([
        getJavaRuntime(),
        kind === "coding-test" ? getTrustedCodingTestManifest() : getTrustedManifest(),
      ]);
      const run = kind === "coding-test" ? runtime.runJavaCodingTest : runtime.runJavaQuest;
      // Pending cancellation uses the supervisor's existing no-launch cancelled report.
      return await run(request, {
        signal: controller.signal,
        bundleRoot: process.resourcesPath,
        trustedManifest,
      });
    })();
    return record;
  });

  record.promise = start.then(() => execution)
    .catch(() => engineErrorReport(request, kind))
    .finally(() => {
      if (activeRun === record) activeRun = null;
    });
  // Reserve the ID and expose cancellation before waiting for earlier cleanup.
  finishedRequestIds.add(request.requestId);
  activeRun = record;
  runTransition = start.then(
    () => undefined,
    () => undefined,
  );
  previous?.controller.abort();
  return start;
}

function abortActiveRun() {
  activeRun?.controller.abort();
  return activeRun?.promise ?? Promise.resolve();
}

function registerJavaIpc() {
  ipcMain.handle("bam-java:capabilities", async (event) => {
    assertTrustedMainFrame(event);
    try {
      await getTrustedManifest();
      const runtime = await getJavaRuntime();
      return normalizeCapabilities(
        await runtime.getJavaQuestCapabilities({ bundleRoot: process.resourcesPath }),
      );
    } catch {
      return unavailableCapabilities();
    }
  });

  ipcMain.handle("bam-java:run", async (event, request) => {
    assertTrustedMainFrame(event);
    assertRunRequest(request);
    const record = await beginJavaRun(event, request);
    return record.promise;
  });

  ipcMain.handle("bam-java:cancel", async (event, request) => {
    return cancelJavaRun(event, request, "quest");
  });
  ipcMain.handle("bam-java-ct:capabilities", async (event) => {
    assertTrustedMainFrame(event);
    try {
      const [runtime, trustedManifest] = await Promise.all([getJavaRuntime(), getTrustedCodingTestManifest()]);
      return normalizeCapabilities(await runtime.getJavaCodingTestCapabilities({ bundleRoot: process.resourcesPath, trustedManifest }), JAVA_CT_EVALUATION_KIND);
    } catch { return unavailableCapabilities(JAVA_CT_EVALUATION_KIND); }
  });
  ipcMain.handle("bam-java-ct:run", async (event, request) => {
    assertTrustedMainFrame(event);
    assertRunRequest(request, "coding-test");
    const record = await beginJavaRun(event, Object.freeze({ ...request }), "coding-test");
    return record.promise;
  });
  ipcMain.handle("bam-java-ct:cancel", async (event, request) => {
    return cancelJavaRun(event, request, "coding-test");
  });
}

async function cancelJavaRun(event, request, kind) {
  assertTrustedMainFrame(event);
  assertCancelRequest(request);
  const owner = frameIdentity(event);
  if (!activeRun || activeRun.kind !== kind || activeRun.requestId !== request.requestId || !sameFrame(activeRun.owner, owner)) {
    return { requestId: request.requestId, cancelled: false };
  }
  const run = activeRun;
  run.controller.abort();
  await run.promise;
  return { requestId: request.requestId, cancelled: true };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 880,
    minHeight: 640,
    show: false,
    backgroundColor: "#080c14",
    title: "BAM.dev",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: false,
    },
  });
  mainWindow = window;

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-attach-webview", (event) => event.preventDefault());
  window.webContents.on("will-navigate", (event, targetUrl) => {
    if (isTrustedAppUrl(targetUrl)) return;
    event.preventDefault();
  });
  window.webContents.on("did-start-navigation", (_event, _url, isInPlace, isMainFrame) => {
    if (isMainFrame && !isInPlace) void abortActiveRun();
  });
  window.webContents.on("render-process-gone", () => void abortActiveRun());
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null;
    void abortActiveRun();
  });
  window.once("ready-to-show", () => window.show());
  void window.loadURL(`${APP_ORIGIN}/`);
}

void app
  .whenReady()
  .then(async () => {
    configureSessionSecurity();
    await registerAssetProtocol();
    registerJavaIpc();
    createWindow();
  })
  .catch(() => app.quit());

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => app.quit());

app.on("before-quit", (event) => {
  if (!activeRun || quittingAfterCleanup) return;
  event.preventDefault();
  quittingAfterCleanup = true;
  void abortActiveRun().finally(() => app.quit());
});
