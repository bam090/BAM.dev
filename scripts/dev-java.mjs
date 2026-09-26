import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyPreparedJavaRuntime } from "./java-prepare.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Chrome-only independent browser PASS (2026-09-24): docs/roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수.
const BROWSER_ISOLATION_PREFLIGHT_VALIDATED = true;
const browserPreflightSources = Object.freeze({
  "scripts/dev-server.mjs": "31084e7656c3f69416f4f0f208c8e9587631791ffc2e6f884339f3c84b14b68a",
  "scripts/java-browser-transport.mjs": "5b43a372e0fd0f22ad339926d0b1135543fc6bfc0a374844fe92e75e3a8f4e0b",
  "src/workers/javascript-code-runner.classic.js": "46a8a2bb53836cd07858365c318b57f0c204ed4927820077d0750f47d61bd183",
  "src/grading/java-browser-transport.js": "d4e59ec2b9ca85d5964438867e5fb9b310fff2e4fb9c37b9c8a88fbdebb6d431",
  "src/app.js": "b56fff9a441ef23aea130d916d7c0c40c7aec6281ad66803eebde9261a0987a2",
});

async function assertBrowserPreflightSources() {
  for (const [file, expected] of Object.entries(browserPreflightSources)) {
    const actual = createHash("sha256").update(await readFile(path.join(projectRoot, file))).digest("hex");
    if (actual !== expected) throw new Error(`Chrome 브라우저 선행 검증 대상이 바뀌었습니다: ${file}`);
  }
}

export function parseDevJavaArgs(argv) {
  if (!Array.isArray(argv) || argv.length !== 2 || argv[0] !== "--runtime"
    || typeof argv[1] !== "string" || !argv[1] || argv[1].startsWith("--")) {
    throw new TypeError("사용법: npm run dev:java -- --runtime <준비폴더>");
  }
  return { runtimeRoot: argv[1] };
}

export function readDevJavaPort(value = process.env.BAM_DEV_PORT) {
  const text = value ?? "4173";
  if (!/^[1-9][0-9]*$/u.test(text)) throw new TypeError("BAM_DEV_PORT는 1~65535의 정수여야 합니다.");
  const port = Number(text);
  if (!Number.isSafeInteger(port) || port > 65535) throw new TypeError("BAM_DEV_PORT는 1~65535의 정수여야 합니다.");
  return port;
}

export function createTrustedJavaRunner({ resourcesPath, questCollection, codingTestCollection, supervisor, executionGuard }) {
  if (typeof executionGuard?.reserve !== "function" || typeof executionGuard?.finish !== "function"
    || typeof executionGuard?.recordSpawn !== "function") throw new Error("독립 Java child 감독 계약이 필요합니다.");
  for (const name of ["getJavaQuestCapabilities", "getJavaCodingTestCapabilities", "runJavaQuest", "runJavaCodingTest"]) {
    if (typeof supervisor?.[name] !== "function") throw new Error("준비 Java supervisor 계약이 다릅니다.");
  }
  const collections = { quest: questCollection, "coding-test": codingTestCollection };
  return Object.freeze({
    validate(kind, request) {
      const collection = collections[kind];
      const items = kind === "quest" ? collection?.quests : collection?.problems;
      const id = kind === "quest" ? request?.questId : request?.problemId;
      return Array.isArray(items) && items.some((item) => item.id === id && item.revision === request?.revision)
        && (kind === "quest" || request?.mode === "run" || request?.mode === "submit");
    },
    capabilities(kind) {
      return kind === "quest"
        ? supervisor.getJavaQuestCapabilities({ bundleRoot: resourcesPath, executionGuard })
        : supervisor.getJavaCodingTestCapabilities({ bundleRoot: resourcesPath,
          trustedManifest: codingTestCollection, executionGuard });
    },
    run(kind, request, { signal } = {}) {
      const trustedManifest = collections[kind];
      return kind === "quest"
        ? supervisor.runJavaQuest(request, { signal, bundleRoot: resourcesPath, trustedManifest, executionGuard })
        : supervisor.runJavaCodingTest(request, { signal, bundleRoot: resourcesPath, trustedManifest, executionGuard });
    },
  });
}

function listenOnFixedPort(server, port) {
  return new Promise((resolve, reject) => {
    const failed = (error) => { server.off("listening", ready); reject(error); };
    const ready = () => { server.off("error", failed); resolve(); };
    server.once("error", failed);
    server.once("listening", ready);
    server.listen(port, "127.0.0.1");
  });
}

function closeListener(server) {
  return new Promise((resolve, reject) => {
    if (!server.listening) { resolve(); return; }
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections?.();
  });
}

export async function startDevJava({ runtimeRoot } = {}) {
  if (typeof runtimeRoot !== "string" || !runtimeRoot) throw new TypeError("준비된 Java runtime 경로가 필요합니다.");
  const port = readDevJavaPort();
  const prepared = await verifyPreparedJavaRuntime(runtimeRoot);
  const guardModule = await import("./java-source-guard.mjs");
  if (guardModule.SOURCE_JAVA_GUARD_PREFLIGHT_VALIDATED !== true) {
    throw new Error("독립 Java 감독·회수 preflight가 완료되지 않아 dev:java 서버를 열지 않습니다.");
  }
  if (!BROWSER_ISOLATION_PREFLIGHT_VALIDATED) {
    throw new Error("학습자 Worker/CSP의 실제 브라우저 부정검증 전에는 dev:java 서버를 열지 않습니다.");
  }
  await assertBrowserPreflightSources();

  const supervisor = await import(pathToFileURL(path.join(prepared.resourcesPath, "runtime", "supervisor.mjs")).href);
  const channel = await guardModule.startIndependentJavaGuardChannel({ spawnProcess: spawn });
  let executionGuard;
  try {
    await guardModule.recoverPreviousJavaSourceGuard({ checkoutRoot: projectRoot, channel });
    executionGuard = await guardModule.createJavaSourceGuard({ checkoutRoot: projectRoot, channel });
  } catch (error) {
    try {
      await channel.disconnectAfterFailure();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError],
        `Java 재시작 회수와 감독 종료가 확인되지 않았습니다: ${error.message}; ${cleanupError.message}`);
    }
    throw error;
  }
  let transport;
  let server;
  let stopping;
  const shutdown = () => {
    stopping ??= (async () => {
      let failure;
      try { await transport?.shutdown(); } catch (error) { failure = error; }
      try { if (server) await closeListener(server); } catch (error) { failure ??= error; }
      try { await executionGuard.close(); }
      catch (error) {
        failure ??= error;
        try { await channel.disconnectAfterFailure(); }
        catch (cleanupError) {
          failure = new AggregateError([failure, cleanupError],
            `Java 서버 종료 후 감독 worker 회수가 확인되지 않았습니다: ${failure.message}; ${cleanupError.message}`);
        }
      }
      if (failure) throw failure;
    })();
    return stopping;
  };
  try {
    const { createJavaBrowserTransport } = await import("./java-browser-transport.mjs");
    const { createDevServer } = await import("./dev-server.mjs");
    const runner = createTrustedJavaRunner({ ...prepared, supervisor, executionGuard });
    transport = createJavaBrowserTransport({
      port, runtimeReady: true, learnerIsolationValidated: true, runner,
    });
    server = createDevServer({ javaTransport: transport });
    await listenOnFixedPort(server, port);
  } catch (error) {
    try { await shutdown(); } catch { /* Preserve the first startup failure and durable guard state. */ }
    throw error;
  }
  return { port, server, shutdown };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { port, shutdown } = await startDevJava(parseDevJavaArgs(process.argv.slice(2)));
    console.log(`BAM.dev Java 연결 서버: http://localhost:${port}`);
    const stop = () => { void shutdown().catch((error) => { console.error(error.message); process.exitCode = 1; }); };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
