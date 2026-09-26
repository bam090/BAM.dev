import { compileJavaSources } from "./java-browser-compiler.js";
import { createJavaClassJar } from "./java-browser-class-jar.js";
import { runJavaBrowserCase } from "./java-browser-provider.js";

const SUPPORTED_PROBLEM_COUNTS = Object.freeze({
  arr: 12, stk: 5, que: 4, hsh: 6, tre: 4, set: 4, gra: 6,
  bkt: 5, srt: 6, twp: 4, sim: 6, dyn: 4, gre: 6,
});
const OUTCOMES = ["passed", "wrong_answer", "syntax_error", "runtime_error", "timeout", "output_limit", "cancelled", "engine_error", "not_run"];
const PRIORITY = ["cancelled", "engine_error", "timeout", "output_limit", "syntax_error", "runtime_error", "wrong_answer", "not_run"];

function aborted() {
  return new DOMException("Java 코딩테스트 실행을 취소했습니다.", "AbortError");
}

function resultFor(test, outcome, { durationMs = 0, message = "", invocations } = {}) {
  return { testId: test.id, label: test.label, outcome, durationMs: Math.max(0, Math.round(durationMs)),
    ...(invocations ? { invocations } : {}), ...(message ? { error: { message } } : {}) };
}

function reportFor(request, tests, durationMs, error = null) {
  const counts = Object.fromEntries(OUTCOMES.map((name) => [name, 0]));
  for (const test of tests) counts[test.outcome]++;
  const summaryOutcome = PRIORITY.find((name) => counts[name] > 0) ?? "passed";
  return { requestId: request.requestId, contractVersion: 1, problemId: request.problemId,
    problemRevision: request.revision, evaluationKind: "java-junit-method-v1", mode: request.mode,
    languageId: "java", suite: "public", outcome: error ? "engine_error" : summaryOutcome,
    tests, summary: { total: tests.length, outcome: summaryOutcome, ...counts },
    durationMs: Math.max(0, Math.round(durationMs)), error };
}

function invocationsFor(raw) {
  return { discovered: raw.discovered, started: raw.started, finished: raw.finished,
    passed: raw.passed, wrongAnswer: raw.wrong, runtimeError: raw.runtime,
    skipped: raw.skipped, aborted: raw.aborted, infrastructure: raw.infrastructure };
}

function completeJUnit(raw) {
  return raw.planStarted && raw.planFinished && raw.discovered > 0
    && raw.discovered === raw.started && raw.started === raw.finished
    && raw.finished === raw.passed + raw.wrong + raw.runtime
    && raw.skipped === 0 && raw.aborted === 0 && raw.infrastructure === 0
    && raw.outcome === (raw.runtime > 0 ? "runtime_error" : raw.wrong > 0 ? "wrong_answer" : "passed");
}

function canonicalArtifact(assets, problem) {
  const artifact = assets?.ctArtifacts;
  const item = artifact?.manifest?.problems?.find((entry) => entry.id === problem.id && entry.revision === problem.revision);
  if (!item || !Array.isArray(item.tests) || item.tests.length !== problem.publicTests?.length) throw new Error("공개 JUnit 자산이 현재 문제와 일치하지 않습니다.");
  const testPath = `${item.tests[0].testClass.replaceAll(".", "/")}.java`;
  const adapterPath = `${item.solutionClass.replaceAll(".", "/")}.java`;
  const originalTestSource = artifact.sources?.[`sources/${testPath}`];
  const adapterSource = artifact.sources?.[`sources/${adapterPath}`];
  if (originalTestSource !== problem.publicTestSource || typeof adapterSource !== "string"
    || item.tests.some((test, index) => test.id !== problem.publicTests[index]?.id
      || test.label !== problem.publicTests[index]?.label
      || test.assertionSource !== problem.publicTests[index]?.assertionSource)) {
    throw new Error("공개 JUnit 원본과 실행 자산이 일치하지 않습니다.");
  }
  return { item, testPath, adapterPath, originalTestSource, adapterSource };
}

export class JavaBrowserCodingTestProvider {
  constructor({ getCollection, getAssets, compile = compileJavaSources, execute = runJavaBrowserCase } = {}) {
    this.getCollection = getCollection;
    this.getAssets = getAssets;
    this.compile = compile;
    this.execute = execute;
    this.activeRun = null;
  }

  supportsProblem(problem) {
    const match = /^coding-test-java-bridge-([a-z]{3})-(\d{2})$/.exec(problem?.id ?? "");
    return problem?.revision === 1 && Boolean(match)
      && Number(match[2]) >= 1 && Number(match[2]) <= (SUPPORTED_PROBLEM_COUNTS[match[1]] ?? 0);
  }

  async capabilities() {
    const available = Boolean(this.getAssets?.());
    return { contractVersion: 1, evaluationKind: "java-junit-method-v1", available,
      ...(available ? {} : { reason: "Java 17 실행 환경을 먼저 준비해 주세요." }) };
  }

  async run(request) {
    const assets = this.getAssets?.();
    if (!assets) throw new Error("Java 환경을 먼저 준비해 주세요.");
    if (this.activeRun) throw new Error("다른 Java 실행을 정리 중입니다.");
    const collection = this.getCollection?.();
    const problem = collection?.problems?.find((item) => item.id === request.problemId && item.revision === request.revision);
    if (!this.supportsProblem(problem) || !["run", "submit"].includes(request.mode)) throw new Error("이 Java 코딩테스트는 아직 브라우저 실행을 지원하지 않습니다.");
    const { item, testPath, adapterPath, originalTestSource, adapterSource } = canonicalArtifact(assets, problem);
    const selected = request.mode === "run" ? item.tests.slice(0, 1) : item.tests;
    const started = performance.now();
    const controller = new AbortController();
    const active = { requestId: request.requestId, controller };
    this.activeRun = active;
    const current = () => { if (controller.signal.aborted || this.activeRun !== active) throw aborted(); };
    const stopped = (outcome, message) => reportFor(request, selected.map((test, index) =>
      resultFor(test, index === 0 ? outcome : "not_run", { message: index === 0 ? message : "" })),
    performance.now() - started, outcome === "engine_error" ? { message } : null);
    try {
      let compiled;
      try {
        compiled = await this.compile({ sources: [
          { path: "Solution.java", source: request.source },
          { path: adapterPath, source: adapterSource },
          { path: "dev/bam/runtime/SolutionInvoker.java", source: assets.compiler.solutionInvokerSource },
          { path: testPath, source: originalTestSource },
        ], entryClass: "Solution", profile: "junit" }, { signal: controller.signal, assets });
      } catch (error) {
        current();
        return stopped("engine_error", String(error?.message ?? error).slice(0, 500));
      }
      current();
      if (compiled.status === "compile_error") {
        return stopped("syntax_error", compiled.diagnostics.map((diagnostic) => diagnostic.message).join("\n").slice(0, 800) || "Java 문법 오류를 확인해 주세요.");
      }
      if (compiled.status !== "compiled" || Object.hasOwn(compiled.classes, "CtBrowserRunner")) return stopped("engine_error", "Java 컴파일 결과가 올바르지 않습니다.");
      let jarBytes;
      try {
        const classes = Object.assign(Object.create(null), compiled.classes);
        classes.CtBrowserRunner = assets.compiler.ctRunnerClass;
        jarBytes = createJavaClassJar(classes);
      } catch (error) { return stopped("engine_error", String(error?.message ?? error).slice(0, 500)); }

      const results = [];
      for (const test of selected) {
        current();
        const caseStarted = performance.now();
        let value;
        try {
          value = await this.execute({ assets, mode: "junit", jarBytes,
            selector: { testClass: test.testClass, method: test.method,
              signature: test.parameterTypes.join(",") }, signal: controller.signal });
        } catch (error) {
          current();
          value = { kind: "error", code: "engine_error", message: String(error?.message ?? error).slice(0, 500) };
        }
        current();
        const durationMs = performance.now() - caseStarted;
        if (value.kind === "junit" && completeJUnit(value.report)) {
          results.push(resultFor(test, value.report.outcome, { durationMs,
            invocations: invocationsFor(value.report), message: value.report.message }));
        } else {
          const outcome = value.kind === "error" && ["timeout", "output_limit", "engine_error"].includes(value.code)
            ? value.code : "engine_error";
          results.push(resultFor(test, outcome, { durationMs,
            message: value.kind === "error" ? value.message : "공개 JUnit 그룹을 완전히 실행하지 못했습니다." }));
          break;
        }
      }
      for (const test of selected.slice(results.length)) results.push(resultFor(test, "not_run"));
      const error = results.find((test) => test.outcome === "engine_error")?.error ?? null;
      return reportFor(request, results, performance.now() - started, error);
    } finally {
      if (this.activeRun === active) this.activeRun = null;
    }
  }

  async cancel({ requestId }) {
    if (this.activeRun?.requestId === requestId) this.activeRun.controller.abort();
  }

  dispose() {
    this.activeRun?.controller.abort();
  }
}
