import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createCodingTestArtifacts } from "../desktop/runtime/coding-test-artifacts.mjs";
import { JavaBrowserCodingTestProvider } from "../src/grading/java-browser-coding-test-provider.js";

const collection = JSON.parse(await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"));
const authored = collection.problems.slice(72);
const class17 = Uint8Array.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 61]);
const ctArtifacts = createCodingTestArtifacts(collection);
const assets = { ctArtifacts, compiler: { ctRunnerClass: class17 } };
const passed = { outcome: "passed", message: "", discovered: 1, started: 1, finished: 1,
  passed: 1, wrong: 0, runtime: 0, skipped: 0, aborted: 0, infrastructure: 0,
  planStarted: true, planFinished: true };

test("authored 12개는 learner와 해당 공개 원문만 컴파일하고 run 첫 그룹·submit 전체 그룹을 보존한다", async () => {
  const compiles = [];
  const selectors = [];
  const provider = new JavaBrowserCodingTestProvider({
    getCollection: () => collection, getAssets: () => assets,
    compile(input) { compiles.push(input); return { status: "compiled", diagnostics: [],
      classes: { Solution: class17, SolutionPublicTest: class17 } }; },
    execute({ selector, mode, jarBytes }) {
      assert.equal(mode, "junit");
      assert.ok(jarBytes instanceof Uint8Array);
      selectors.push(selector);
      return { kind: "junit", report: passed };
    },
  });
  assert.equal(authored.length, 12);
  for (const problem of authored) {
    assert.equal(provider.supportsProblem(problem), true);
    for (const mode of ["run", "submit"]) {
      const request = { requestId: `${problem.id}-${mode}`, problemId: problem.id,
        revision: problem.revision, source: `class Solution { /* ${problem.id} */ }`, mode };
      const before = selectors.length;
      const report = await provider.run(request);
      const selected = mode === "run" ? problem.publicTests.slice(0, 1) : problem.publicTests;
      assert.equal(report.outcome, "passed", `${problem.id}: ${mode}`);
      assert.equal(report.mode, mode);
      assert.deepEqual(report.tests.map(({ testId }) => testId), selected.map(({ id }) => id));
      assert.deepEqual(selectors.slice(before).map(({ testClass, method }) => `${testClass}#${method}`),
        ctArtifacts.manifest.problems.find(({ id }) => id === problem.id).tests.slice(0, selected.length)
          .map(({ testClass, method }) => `${testClass}#${method}`));
      const { sources, profile, entryClass } = compiles.at(-1);
      assert.equal(profile, "junit");
      assert.equal(entryClass, "Solution");
      assert.deepEqual(sources, [
        { path: "Solution.java", source: request.source },
        { path: "SolutionPublicTest.java", source: problem.publicTestSource },
      ]);
    }
  }
  assert.equal(compiles.length, 24);
});

test("authored 원문 불일치와 0-discovery는 성공으로 표시하지 않는다", async () => {
  const problem = authored[0];
  let compileCount = 0;
  const provider = new JavaBrowserCodingTestProvider({
    getCollection: () => collection, getAssets: () => assets,
    compile() { compileCount++; return { status: "compiled", diagnostics: [],
      classes: { Solution: class17, SolutionPublicTest: class17 } }; },
    execute() { return { kind: "junit", report: { ...passed, discovered: 0, started: 0,
      finished: 0, passed: 0 } }; },
  });
  const request = { requestId: "authored-negative", problemId: problem.id,
    revision: problem.revision, source: "class Solution {}", mode: "run" };
  const report = await provider.run(request);
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  const changedAssets = { ...assets, ctArtifacts: { ...ctArtifacts, sources: { ...ctArtifacts.sources,
    [`sources/authored/${problem.id}/SolutionPublicTest.java`]: "class Changed {}" } } };
  const changedProvider = new JavaBrowserCodingTestProvider({
    getCollection: () => collection, getAssets: () => changedAssets,
    compile() { compileCount++; return null; },
  });
  await assert.rejects(changedProvider.run(request), /원본과 실행 자산이 일치하지 않습니다/u);
  assert.equal(compileCount, 1);
});


test("authored JUnit wrong answer와 Solution runtime 결과는 공개 DTO에서 구분된다", async () => {
  const problem = authored[0];
  const reports = [
    { ...passed, outcome: "wrong_answer", passed: 0, wrong: 1, message: "기대값과 다릅니다." },
    { ...passed, outcome: "runtime_error", passed: 0, runtime: 1, message: "Solution.solve 예외" },
  ];
  const provider = new JavaBrowserCodingTestProvider({
    getCollection: () => collection, getAssets: () => assets,
    compile: async () => ({ status: "compiled", diagnostics: [],
      classes: { Solution: class17, SolutionPublicTest: class17 } }),
    execute: async () => ({ kind: "junit", report: reports.shift() }),
  });
  for (const outcome of ["wrong_answer", "runtime_error"]) {
    const report = await provider.run({ requestId: `authored-${outcome}`, problemId: problem.id,
      revision: problem.revision, source: "class Solution {}", mode: "run" });
    assert.equal(report.outcome, outcome);
    assert.equal(report.tests[0].outcome, outcome);
    assert.equal(report.tests[0].invocations.discovered, 1);
  }
});
