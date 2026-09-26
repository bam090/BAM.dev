const HELPER_NAMES = ["JrtCompiler", "JrtCompiler$JrtNames", "JrtCompiler$1"];
let started = false;

self.onmessage = async ({ data }) => {
  if (started) return;
  started = true;
  const runId = typeof data?.runId === "string" ? data.runId : "";
  try {
    const compiler = data?.compiler;
    if (data?.type !== "compile" || !runId || !["quest", "junit"].includes(data.profile)
        || data.entryClass !== "Solution" || !Array.isArray(data.sources)
        || data.sources.length < 1 || data.sources.length > 8
        || !data.sources.every((unit) => typeof unit?.path === "string" && typeof unit.source === "string")
        || !(compiler?.ecjJar instanceof Uint8Array)
        || !compiler.helperClasses || Object.keys(compiler.helperClasses).length !== HELPER_NAMES.length
        || !HELPER_NAMES.every((name) => compiler.helperClasses[name] instanceof Uint8Array)
        || (data.profile === "junit" && !(compiler.junitJar instanceof Uint8Array))) {
      throw new Error("Invalid Java compiler request");
    }
    importScripts("https://cjrtnc.leaningtech.com/4.3/loader.js");
    await cheerpjInit({ version: 17, status: "none" });
    cheerpOSAddStringFile("/str/ecj-3.33.0.jar", compiler.ecjJar);
    if (data.profile === "junit") cheerpOSAddStringFile("/str/junit.jar", compiler.junitJar);
    for (const name of HELPER_NAMES) {
      cheerpOSAddStringFile(`/str/${name}.class`, compiler.helperClasses[name]);
    }
    const library = await cheerpjRunLibrary("/str/:/str/ecj-3.33.0.jar");
    const JrtCompiler = await library.JrtCompiler;
    const fields = [data.profile, data.entryClass,
      ...data.sources.flatMap(({ path, source }) => [path, source])];
    const frame = `${fields.length}:` + fields.map((value) => `${value.length}:${value}`).join("");
    const raw = await JrtCompiler.compile(frame);
    if (typeof raw !== "string" || raw.length > 12 * 1024 * 1024) {
      throw new Error("Invalid Java compiler return");
    }
    const result = JSON.parse(raw);
    self.postMessage({ type: "compiled-result", runId, result });
  } catch (error) {
    self.postMessage({ type: "compiler-error", runId,
      message: String(error?.message ?? error).slice(0, 500) });
  }
};
