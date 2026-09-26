const MAX_SOURCE_BYTES = 128 * 1024;
const MAX_DIAGNOSTICS = 100;
const MAX_DIAGNOSTIC_BYTES = 32 * 1024;
const MAX_CLASSES = 256;
const MAX_CLASS_BYTES = 8 * 1024 * 1024;
const COMPILE_TIMEOUT_MS = 180_000;

function compilerError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function plainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function hasKeys(value, keys) {
  return plainRecord(value) && Object.keys(value).sort().join("\0") === keys.slice().sort().join("\0");
}

function decodeResult(value, entryClass, allowObserver) {
  if (!hasKeys(value, ["status", "diagnostics", "classesBase64"])
      || !["compiled", "compile_error"].includes(value.status)
      || !Array.isArray(value.diagnostics) || value.diagnostics.length > MAX_DIAGNOSTICS
      || !plainRecord(value.classesBase64)) {
    throw compilerError("engine_error", "Java compiler returned an invalid result.");
  }
  let diagnosticBytes = 0;
  const diagnostics = value.diagnostics.map((item) => {
    if (!hasKeys(item, ["message", "line", "column"])
        || typeof item.message !== "string"
        || !Number.isSafeInteger(item.line) || item.line < 1
        || !Number.isSafeInteger(item.column) || item.column < 1) {
      throw compilerError("engine_error", "Java compiler returned an invalid diagnostic.");
    }
    diagnosticBytes += new TextEncoder().encode(item.message).byteLength;
    return { message: item.message, line: item.line, column: item.column };
  });
  if (diagnosticBytes > MAX_DIAGNOSTIC_BYTES) {
    throw compilerError("engine_error", "Java compiler diagnostics exceeded the limit.");
  }
  const entries = Object.entries(value.classesBase64);
  if (value.status === "compile_error") {
    if (entries.length || diagnostics.length === 0) {
      throw compilerError("engine_error", "Java compiler returned an inconsistent error result.");
    }
    return { status: "compile_error", diagnostics, classes: {} };
  }
  if (entries.length === 0 || entries.length > MAX_CLASSES || diagnostics.length) {
    throw compilerError("engine_error", "Java compiler returned an inconsistent class result.");
  }
  const classes = Object.create(null);
  let totalBytes = 0;
  for (const [name, encoded] of entries) {
    // Package segments become JAR entries after a separate path check.
    if (name.length > 255 || !/^[\p{ID_Start}_$][\p{ID_Continue}$]*(?:\.[\p{ID_Start}_$][\p{ID_Continue}$]*)*$/u.test(name)
        || /^(?:JrtCompiler|CtBrowserRunner)(?:\$.*)?$/.test(name)
        || (!allowObserver && /^BamQuestObserver(?:\$.*)?$/.test(name))
        || typeof encoded !== "string" || encoded.length % 4 !== 0
        || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
      throw compilerError("engine_error", "Java compiler returned an invalid class name or encoding.");
    }
    const raw = atob(encoded);
    totalBytes += raw.length;
    if (totalBytes > MAX_CLASS_BYTES || raw.length < 8) {
      throw compilerError("engine_error", "Java compiler class bytes exceeded the limit.");
    }
    const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0));
    const header = new DataView(bytes.buffer);
    if (header.getUint32(0) !== 0xcafebabe || header.getUint16(4) !== 0
        || header.getUint16(6) !== 61) {
      throw compilerError("engine_error", "Java compiler returned a non-Java-17 class.");
    }
    classes[name] = bytes;
  }
  if (!(classes[entryClass] instanceof Uint8Array)) {
    throw compilerError("engine_error", "Java compiler did not return the entry class.");
  }
  return { status: "compiled", diagnostics, classes };
}

function canonicalSourcePath(path) {
  return typeof path === "string" && path.length <= 255
    && /^[A-Za-z_$][A-Za-z0-9_$]*(?:\/[A-Za-z_$][A-Za-z0-9_$]*)*\.java$/.test(path)
    && !path.startsWith("JrtCompiler") && path !== "CtBrowserRunner.java";
}

function junitSourcePaths(paths) {
  const bridge = /^bridge\/(?:[A-Za-z_$][A-Za-z0-9_$]*\/)+(?:solution|test)\/[A-Za-z_$][A-Za-z0-9_$]*\.java$/;
  return paths.length === 4 && paths.includes("dev/bam/runtime/SolutionInvoker.java")
    && paths.filter((path) => bridge.test(path) && path.includes("/solution/")).length === 1
    && paths.filter((path) => bridge.test(path) && path.includes("/test/")).length === 1;
}

export function compileJava({ source, className = "Solution" }, options) {
  return compileJavaSources({ sources: [{ path: "Solution.java", source }],
    entryClass: className, profile: "quest" }, options);
}

export function compileJavaSources({ sources, entryClass = "Solution", profile }, { signal, assets } = {}) {
  if (!["quest", "junit"].includes(profile) || entryClass !== "Solution"
      || !Array.isArray(sources) || sources.length < 1 || sources.length > 8
      || !sources.every((unit) => hasKeys(unit, ["path", "source"])
        && canonicalSourcePath(unit.path) && typeof unit.source === "string")
      || new Set(sources.map((unit) => unit.path)).size !== sources.length
      || sources[0].path !== "Solution.java"
      || (profile === "quest" && !(sources.length === 1
        || (sources.length === 2 && sources[1].path === "BamQuestObserver.java")))
      || (profile === "junit" && !junitSourcePaths(sources.map((unit) => unit.path)))
      || sources.reduce((sum, unit) => sum + new TextEncoder().encode(unit.source).byteLength, 0) > MAX_SOURCE_BYTES) {
    throw compilerError("invalid_input", "Java sources must use canonical paths and stay within 128 KiB.");
  }
  const compiler = assets?.compiler;
  if (!(compiler?.ecjJar instanceof Uint8Array) || !plainRecord(compiler.helperClasses)
      || Object.keys(compiler.helperClasses).length !== 3
      || !Object.values(compiler.helperClasses).every((value) => value instanceof Uint8Array)
      || (profile === "junit" && !(compiler.junitJar instanceof Uint8Array))) {
    throw compilerError("engine_error", "Java compiler assets are unavailable.");
  }
  if (signal?.aborted) return Promise.reject(compilerError("cancelled", "Java compilation was cancelled."));

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/java-browser-compiler.worker.js", import.meta.url));
    const runId = crypto.randomUUID();
    let settled = false;
    let timer;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      if (error) reject(error);
      else resolve(result);
    };
    const onAbort = () => finish(compilerError("cancelled", "Java compilation was cancelled."));
    signal?.addEventListener("abort", onAbort, { once: true });
    worker.onmessage = (event) => {
      const reply = event.data;
      if (hasKeys(reply, ["type", "runId", "message"])
          && reply.type === "compiler-error" && reply.runId === runId
          && typeof reply.message === "string" && reply.message.length <= 500) {
        finish(compilerError("engine_error", "Java compiler failed: " + reply.message));
        return;
      }
      if (!hasKeys(reply, ["type", "runId", "result"])
          || reply.type !== "compiled-result" || reply.runId !== runId) {
        finish(compilerError("engine_error", "Java compiler reply did not match this run."));
        return;
      }
      try { finish(null, decodeResult(reply.result, entryClass,
        profile === "quest" && sources.length === 2)); }
      catch (error) { finish(error); }
    };
    worker.onerror = () => finish(compilerError("engine_error", "Java compiler Worker failed."));
    worker.onmessageerror = () => finish(compilerError("engine_error", "Java compiler Worker reply could not be read."));
    timer = setTimeout(() => finish(compilerError("timeout", "Java compilation timed out.")), COMPILE_TIMEOUT_MS);
    if (signal?.aborted) {
      onAbort();
      return;
    }
    worker.postMessage({ type: "compile", runId, sources, entryClass, profile, compiler });
  });
}
