import { compileJava, compileJavaSources } from "./java-browser-compiler.js";
import { JAVA_BROWSER_ASSET_BYTES, prepareJavaBrowserAssets } from "./java-browser-assets.js";

const QUEST_KIND = Object.freeze({
  "quest-java-total-price": "total-price",
  "quest-java-bridge-arr-01": "array-replace",
  "quest-java-bridge-arr-02": "array-count",
  "quest-java-bridge-que-01": "queue-rotate",
});
const QUEST_REVISION = 1;
const SUPPORTED_QUEST_IDS = new Set(Object.keys(QUEST_KIND));
const CASE_TIMEOUT_MS = 60_000;
const OUTCOMES = ["passed", "wrong_answer", "syntax_error", "runtime_error", "timeout", "output_limit", "cancelled", "engine_error", "not_run"];
const PRIORITY = ["cancelled", "engine_error", "timeout", "output_limit", "syntax_error", "runtime_error", "wrong_answer", "not_run"];
const SMOKE_SOURCE = "public class Solution { public static long totalPrice(int a, int b, int c) { return 17L; } }";
const FRAME_URL = new URL("../workers/java-browser-executor-frame.html", import.meta.url);
let nextWorkerRunId = 0;

export function createJavaQuestObserverSource(kind) {
  if (kind !== "array-replace" && kind !== "queue-rotate") return null;
  const parameters = kind === "array-replace" ? "int[] input, int slotNumber, int correctedValue" : "int[] input";
  const call = kind === "array-replace" ? "Solution.solve(input, slotNumber, correctedValue)" : "Solution.solve(input)";
  return `import java.util.Arrays;
public final class BamQuestObserver {
  public static int[] run(${parameters}) {
    int[] before = input.clone();
    int[] result = ${call};
    boolean unchanged = Arrays.equals(input, before);
    boolean distinct = result != null && result != input;
    if (result == null) return new int[] {unchanged ? 1 : 0, 0, -1};
    if (result.length > 100000) throw new IllegalStateException("Java 반환 배열 길이 제한을 초과했습니다.");
    int[] observed = new int[result.length + 3];
    observed[0] = unchanged ? 1 : 0;
    observed[1] = distinct ? 1 : 0;
    observed[2] = result.length;
    System.arraycopy(result, 0, observed, 3, result.length);
    return observed;
  }
}`;
}

function aborted() {
  return new DOMException("Java 실행을 취소했습니다.", "AbortError");
}

function displayValue(value) {
  if (value === null) return "null";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 4_000 ? `${text.slice(0, 4_000)}… (전체 ${text.length}자)` : text;
}

function testResult(test, outcome, { actual = null, durationMs = 0, message = "", observations = null } = {}) {
  const failedObservations = observations
    ? Object.keys(test.observations ?? {}).filter((name) => observations[name] !== true)
    : [];
  return {
    testId: test.id,
    label: test.label,
    outcome,
    expectedDisplay: displayValue(test.expected),
    actualDisplay: actual === null ? null : displayValue(actual),
    hasActual: actual !== null,
    durationMs: Math.max(0, Math.round(durationMs)),
    error: message ? { message } : null,
    console: [],
    ...(test.observations ? {
      expectedObservations: test.observations,
      actualObservations: observations,
      failedObservations,
    } : {}),
  };
}

function reportFor(request, tests, error = null) {
  const counts = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, 0]));
  for (const test of tests) counts[test.outcome]++;
  const outcome = PRIORITY.find((candidate) => counts[candidate] > 0) ?? "passed";
  return {
    requestId: request.requestId,
    contractVersion: 1,
    questId: request.questId,
    questRevision: request.revision,
    languageId: "java",
    suite: "public",
    outcome,
    tests,
    summary: { outcome, total: tests.length, ...counts,
      observationFailures: tests.reduce((total, test) => total + (test.failedObservations?.length ?? 0), 0) },
    error,
  };
}

function validatePublicTests(quest) {
  if (!Array.isArray(quest?.publicTests) || quest.publicTests.length !== 6) throw new Error("이 문제의 공개 테스트를 확인할 수 없습니다.");
  const kind = QUEST_KIND[quest.id];
  const integer = (value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
  const integerArray = (value, maxLength) => Array.isArray(value) && value.length <= maxLength && value.every(integer);
  return quest.publicTests.map((test) => {
    if (typeof test.id !== "string" || typeof test.label !== "string" || !Array.isArray(test.args)) throw new Error("이 문제의 공개 테스트가 올바르지 않습니다.");
    const args = test.args;
    const valid = kind === "total-price"
      ? args.length === 3 && args.every(integer) && typeof test.expected === "string" && /^-?\d+$/.test(test.expected)
      : kind === "array-replace"
        ? args.length === 3 && integerArray(args[0], 100) && args.slice(1).every(integer) && integerArray(test.expected, 100)
        : kind === "array-count"
          ? args.length === 3 && integerArray(args[0], 1_000) && args.slice(1).every(integer) && integer(test.expected)
          : args.length === 1 && integerArray(args[0], 100_000) && integerArray(test.expected, 100_000);
    if (!valid) throw new Error("이 문제의 공개 테스트가 올바르지 않습니다.");
    const observations = kind === "array-replace" || kind === "queue-rotate"
      ? test.observations : null;
    if (observations && (observations.argument0Unchanged !== true || observations.returnNotArgument0 !== true)) throw new Error("공개 배열 관찰 조건이 올바르지 않습니다.");
    return { id: test.id, label: test.label, args: args.map((value) => Array.isArray(value) ? [...value] : value),
      expected: Array.isArray(test.expected) ? [...test.expected] : test.expected,
      ...(observations ? { observations: { argument0Unchanged: true, returnNotArgument0: true } } : {}) };
  });
}

function validateClasses(classes) {
  if (!classes || typeof classes !== "object" || !Object.hasOwn(classes, "Solution")) throw new Error("Solution class가 없습니다.");
  const entries = Object.entries(classes);
  if (entries.length === 0 || entries.length > 256) throw new Error("Java class 수 제한을 초과했습니다.");
  let total = 0;
  for (const [name, bytes] of entries) {
    if (!/^[\p{L}_$][\p{L}\p{M}\p{N}_$]*$/u.test(name)
      || !(bytes instanceof Uint8Array) || bytes.byteLength < 8
      || bytes[0] !== 0xca || bytes[1] !== 0xfe || bytes[2] !== 0xba || bytes[3] !== 0xbe
      || bytes[4] !== 0 || bytes[5] !== 0 || bytes[6] !== 0 || bytes[7] !== 61) throw new Error("Java class 형식이 올바르지 않습니다.");
    total += bytes.byteLength;
    if (total > 8 * 1024 * 1024) throw new Error("Java class 크기 제한을 초과했습니다.");
  }
}

function validJunitReport(report) {
  const keys = ["aborted", "discovered", "finished", "infrastructure", "message", "outcome", "passed",
    "planFinished", "planStarted", "runtime", "skipped", "started", "wrong"];
  return report && typeof report === "object" && !Array.isArray(report)
    && Object.keys(report).sort().join(",") === keys.sort().join(",")
    && ["passed", "wrong_answer", "runtime_error", "engine_error"].includes(report.outcome)
    && typeof report.message === "string" && report.message.length <= 800
    && typeof report.planStarted === "boolean" && typeof report.planFinished === "boolean"
    && keys.filter((key) => !["message", "outcome", "planStarted", "planFinished"].includes(key))
      .every((key) => Number.isSafeInteger(report[key]) && report[key] >= 0);
}

export function runJavaBrowserCase({ assets, classes, args, questKind = "total-price", mode = "quest",
  jarBytes, selector, signal, timeoutMs = CASE_TIMEOUT_MS }) {
  signal?.throwIfAborted();
  const runId = ++nextWorkerRunId;
  const frame = document.createElement("iframe");
  frame.sandbox = "allow-scripts";
  frame.hidden = true;
  frame.setAttribute("aria-hidden", "true");
  frame.src = FRAME_URL.href;
  const channel = new MessageChannel();
  let settled = false;
  let started = false;
  let stopAcknowledged;
  const stopAck = new Promise((resolve) => { stopAcknowledged = resolve; });

  return new Promise((resolve, reject) => {
    const cleanup = async () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      if (frame.isConnected) {
        frame.contentWindow?.postMessage({ command: "stop", runId }, "*");
        await Promise.race([stopAck, new Promise((done) => setTimeout(done, 1_000))]);
      }
      window.removeEventListener("message", onFrameMessage);
      frame.remove();
      channel.port1.close();
    };
    const finish = (value, isError = false) => {
      if (settled) return;
      settled = true;
      void cleanup().then(() => isError ? reject(value) : resolve(value), reject);
    };
    const onAbort = () => finish(aborted(), true);
    const timer = setTimeout(() => finish({ kind: "error", code: "timeout", message: "Java 공개 테스트 시간이 초과됐습니다." }), timeoutMs);
    const onFrameMessage = (event) => {
      if (event.source !== frame.contentWindow || event.origin !== "null" || !event.data || typeof event.data !== "object") return;
      if (event.data.kind === "terminated" && event.data.runId === runId) { stopAcknowledged(); return; }
      if (settled || event.data.kind === "raw-worker") return;
      if (event.data.kind === "worker-error" && event.data.runId === runId) {
        finish({ kind: "error", code: "engine_error", message: String(event.data.message).slice(0, 500) });
        return;
      }
      if (event.data.kind !== "ready" || started) return;
      started = true;
      try {
        const runtime = assets.runtime.map((asset) => ({
          url: asset.url, status: asset.status, lastModified: asset.lastModified,
          bytes: asset.bytes.slice(),
        }));
        const copiedClasses = Object.create(null);
        if (mode === "quest") for (const [name, bytes] of Object.entries(classes)) copiedClasses[name] = bytes.slice();
        const copiedJar = mode === "junit" ? jarBytes.slice() : null;
        const copiedJunit = mode === "junit" ? assets.compiler.junitJar.slice() : null;
        const transfers = [channel.port2, ...runtime.map((asset) => asset.bytes.buffer),
          ...Object.values(copiedClasses).map((bytes) => bytes.buffer),
          ...(copiedJar ? [copiedJar.buffer, copiedJunit.buffer] : [])];
        frame.contentWindow.postMessage({ command: "start", runId, workerSource: assets.executorSource,
          assets: runtime, classes: copiedClasses, args, questKind, mode,
          jarBytes: copiedJar, junitJar: copiedJunit, selector }, "*", transfers);
      } catch (error) { finish({ kind: "error", code: "engine_error", message: String(error?.message ?? error).slice(0, 500) }); }
    };
    channel.port1.onmessage = (event) => {
      if (settled || !event.data || typeof event.data !== "object" || event.data.runId !== runId) return;
      const fields = Object.keys(event.data).sort().join(",");
      if (event.data.kind === "result" && fields === "actual,kind,runId"
        && (questKind === "total-price" ? typeof event.data.actual === "bigint"
          : questKind === "array-count" ? Number.isInteger(event.data.actual)
            : false)) {
        finish({ kind: "result", actual: event.data.actual });
      } else if (event.data.kind === "result" && fields === "actual,kind,observations,runId"
        && ["array-replace", "queue-rotate"].includes(questKind)
        && (event.data.actual === null || Array.isArray(event.data.actual))
        && (event.data.actual === null || event.data.actual.length <= 100_000)
        && (event.data.actual === null || event.data.actual.every((value) => Number.isInteger(value)))
        && event.data.observations && Object.keys(event.data.observations).sort().join(",") === "argument0Unchanged,returnNotArgument0"
        && typeof event.data.observations.argument0Unchanged === "boolean"
        && typeof event.data.observations.returnNotArgument0 === "boolean") {
        finish({ kind: "result", actual: event.data.actual, observations: event.data.observations });
      } else if (mode === "junit" && event.data.kind === "junit" && fields === "kind,report,runId"
        && validJunitReport(event.data.report)) {
        finish({ kind: "junit", report: event.data.report });
      } else if (event.data.kind === "error" && fields === "code,kind,message,runId"
        && ["engine_error", "runtime_error"].includes(event.data.code) && typeof event.data.message === "string") {
        finish({ kind: "error", code: event.data.code, message: event.data.message.slice(0, 800) });
      }
    };
    window.addEventListener("message", onFrameMessage);
    signal?.addEventListener("abort", onAbort, { once: true });
    document.body.append(frame);
    if (signal?.aborted) onAbort();
  });
}

export class JavaBrowserProvider {
  constructor({ getQuest, onChange = () => {}, prepareAssets = prepareJavaBrowserAssets, compile = compileJava,
    compileSources = compileJavaSources, execute = runJavaBrowserCase } = {}) {
    this.getQuest = getQuest;
    this.onChange = onChange;
    this.prepareAssets = prepareAssets;
    this.compile = compile;
    this.compileSources = compileSources;
    this.execute = execute;
    this.status = "idle";
    this.message = `브라우저에서 Java 17 실행 환경을 준비할 수 있습니다. 처음에는 약 ${(JAVA_BROWSER_ASSET_BYTES / 1048576).toFixed(0)}MB의 자산을 내려받습니다.`;
    this.progress = { receivedBytes: 0, totalBytes: JAVA_BROWSER_ASSET_BYTES };
    this.assets = null;
    this.prepareAbort = null;
    this.prepareGeneration = 0;
    this.activeRun = null;
  }

  setStatus(status, message) {
    this.status = status;
    this.message = message;
    this.onChange();
  }

  supportsQuest(quest) {
    return SUPPORTED_QUEST_IDS.has(quest?.id) && quest?.revision === QUEST_REVISION;
  }

  async capabilities() {
    return {
      contractVersion: 1,
      evaluationKind: "java-static-method-v1",
      available: this.status === "ready" && Boolean(this.assets),
      reason: this.status === "ready" ? undefined : "Java 17 실행 환경을 먼저 준비해 주세요.",
    };
  }

  async prepare() {
    if (this.status === "preparing" || this.status === "ready") return this.status === "ready";
    const generation = ++this.prepareGeneration;
    const controller = new AbortController();
    this.prepareAbort = controller;
    this.progress = { receivedBytes: 0, totalBytes: JAVA_BROWSER_ASSET_BYTES };
    this.setStatus("preparing", "Java 자산을 내려받고 있습니다…");
    try {
      const assets = await this.prepareAssets({ signal: controller.signal, onProgress: (progress) => {
        if (generation !== this.prepareGeneration) return;
        this.progress = progress;
        this.setStatus("preparing", `Java 자산을 내려받는 중… ${(progress.receivedBytes / 1048576).toFixed(1)} / ${(progress.totalBytes / 1048576).toFixed(1)} MB`);
      } });
      controller.signal.throwIfAborted();
      this.setStatus("preparing", "Java 컴파일러와 실행 환경을 확인하고 있습니다…");
      const smoke = await this.compile({ source: SMOKE_SOURCE, className: "Solution" }, { signal: controller.signal, assets });
      if (smoke.status !== "compiled") throw new Error("Java 컴파일러를 시작하지 못했습니다.");
      validateClasses(smoke.classes);
      const proof = await this.execute({ assets, classes: smoke.classes, args: [0, 0, 0], signal: controller.signal });
      if (proof.kind !== "result" || proof.actual !== 17n) throw new Error("Java 실행 환경을 확인하지 못했습니다.");
      if (generation !== this.prepareGeneration || controller.signal.aborted) return false;
      this.assets = assets;
      this.setStatus("ready", "Java 17 실행 환경이 준비됐습니다. Java Quest 4개와 Java 코딩테스트 72개의 공개 테스트를 실행할 수 있습니다.");
      return true;
    } catch (error) {
      if (generation !== this.prepareGeneration || controller.signal.aborted) return false;
      this.assets = null;
      this.setStatus("error", `Java 준비에 실패했습니다. ${String(error?.message ?? error).slice(0, 300)}`);
      return false;
    } finally {
      if (generation === this.prepareGeneration) this.prepareAbort = null;
    }
  }

  cancelPreparation() {
    if (this.status !== "preparing") return;
    ++this.prepareGeneration;
    this.prepareAbort?.abort();
    this.prepareAbort = null;
    this.assets = null;
    this.progress = { receivedBytes: 0, totalBytes: JAVA_BROWSER_ASSET_BYTES };
    this.setStatus("idle", "Java 환경 준비를 취소했습니다. 코드는 계속 작성하고 저장할 수 있습니다.");
  }

  async run(request) {
    if (this.status !== "ready" || !this.assets) throw new Error("Java 환경을 먼저 준비해 주세요.");
    if (this.activeRun) throw new Error("다른 Java 실행을 정리 중입니다.");
    const quest = this.getQuest?.(request.questId);
    if (!this.supportsQuest(quest) || request.questId !== quest.id || request.revision !== QUEST_REVISION) {
      throw new Error("이 Java Quest는 아직 브라우저 실행을 지원하지 않습니다.");
    }
    const publicTests = validatePublicTests(quest);
    const controller = new AbortController();
    const active = { requestId: request.requestId, controller };
    this.activeRun = active;
    const current = () => {
      if (controller.signal.aborted || this.activeRun !== active) throw aborted();
    };
    const stoppedReport = (outcome, message) => reportFor(request, publicTests.map((test, index) =>
      testResult(test, index === 0 ? outcome : "not_run", { message: index === 0 ? message : "" })),
    outcome === "engine_error" ? { message } : null);
    try {
      let compiled;
      try {
        const observer = createJavaQuestObserverSource(QUEST_KIND[quest.id]);
        compiled = observer
          ? await this.compileSources({ sources: [{ path: "Solution.java", source: request.source },
            { path: "BamQuestObserver.java", source: observer }], entryClass: "Solution", profile: "quest" },
          { signal: controller.signal, assets: this.assets })
          : await this.compile({ source: request.source, className: "Solution" }, { signal: controller.signal, assets: this.assets });
      } catch (error) {
        current();
        return stoppedReport("engine_error", String(error?.message ?? error).slice(0, 500));
      }
      current();
      if (compiled.status === "compile_error") {
        const message = compiled.diagnostics.map((diagnostic) => diagnostic.message).join("\n").slice(0, 800) || "Java 문법 오류를 확인해 주세요.";
        return stoppedReport("syntax_error", message);
      }
      if (compiled.status !== "compiled") return stoppedReport("engine_error", "Java 컴파일 결과가 올바르지 않습니다.");
      try { validateClasses(compiled.classes); }
      catch (error) { return stoppedReport("engine_error", error.message); }

      const results = [];
      for (const test of publicTests) {
        current();
        const start = performance.now();
        let value;
        try { value = await this.execute({ assets: this.assets, classes: compiled.classes, args: test.args,
          questKind: QUEST_KIND[quest.id], signal: controller.signal }); }
        catch (error) {
          current();
          value = { kind: "error", code: "engine_error", message: String(error?.message ?? error).slice(0, 500) };
        }
        current();
        const durationMs = performance.now() - start;
        if (value.kind === "result") {
          const actual = value.actual;
          const sameValue = Array.isArray(test.expected)
            ? Array.isArray(actual) && actual.length === test.expected.length
              && actual.every((item, index) => item === test.expected[index])
            : typeof test.expected === "string" ? actual?.toString() === test.expected : actual === test.expected;
          const observations = value.observations ?? null;
          const observationPass = !test.observations
            || (observations?.argument0Unchanged === true && observations?.returnNotArgument0 === true);
          results.push(testResult(test, sameValue && observationPass ? "passed" : "wrong_answer",
            { actual: actual === null ? "null" : actual, observations, durationMs }));
        } else {
          const outcome = ["runtime_error", "timeout", "output_limit", "engine_error"].includes(value.code) ? value.code : "engine_error";
          results.push(testResult(test, outcome, { durationMs, message: value.message }));
          if (outcome !== "runtime_error") break;
        }
      }
      for (const test of publicTests.slice(results.length)) results.push(testResult(test, "not_run"));
      const engineError = results.find((test) => test.outcome === "engine_error")?.error ?? null;
      return reportFor(request, results, engineError);
    } finally {
      if (this.activeRun === active) this.activeRun = null;
    }
  }

  async cancel({ requestId }) {
    if (this.activeRun?.requestId === requestId) this.activeRun.controller.abort();
  }

  dispose() {
    this.cancelPreparation();
    this.activeRun?.controller.abort();
    this.assets = null;
    if (this.status === "ready") this.setStatus("idle", "Java 환경을 다시 준비해 주세요.");
  }
}
