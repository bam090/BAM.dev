import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  adaptCodingTestRunnerReport,
  CodingTestRunnerAdapter,
  createCodingTestRunnerRequest,
} from "../src/grading/coding-test-runner-adapter.js";

const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/javascript.json", import.meta.url), "utf8"),
);
const problem = collection.problems[0];
const javaCollection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);
const javaProblem = javaCollection.problems[0];

function createInput(mode, overrides = {}) {
  return {
    collection,
    problem,
    source: problem.starterCode,
    requestId: `coding-test-${mode}-request`,
    mode,
    ...overrides,
  };
}

function createPassingRunnerReport(request) {
  const tests = request.tests.map((item) => ({
    testId: item.id,
    label: item.label,
    outcome: "passed",
    expected: item.expected,
    expectedDisplay: JSON.stringify(item.expected),
    actual: item.expected,
    actualDisplay: JSON.stringify(item.expected),
    hasActual: true,
    durationMs: 1,
    console: [],
    error: null,
  }));
  return {
    requestId: request.requestId,
    contractVersion: request.contractVersion,
    questId: request.questId,
    questRevision: request.questRevision,
    languageId: request.languageId,
    suite: request.suite,
    outcome: "passed",
    tests,
    summary: {
      outcome: "passed",
      total: tests.length,
      passed: tests.length,
      wrong_answer: 0,
      syntax_error: 0,
      runtime_error: 0,
      timeout: 0,
      output_limit: 0,
      cancelled: 0,
      engine_error: 0,
      not_run: 0,
    },
    durationMs: tests.length,
    limitsApplied: { testTimeoutMs: 1000 },
    error: null,
  };
}

test("run 요청은 선택된 공개 테스트만 기존 runner DTO의 public suite로 투영한다", () => {
  const execution = createCodingTestRunnerRequest(createInput("run"));
  const request = execution.runnerRequest;

  assert.equal(execution.problemId, problem.id);
  assert.equal(execution.problemRevision, problem.revision);
  assert.equal(execution.mode, "run");
  assert.equal(request.questId, problem.id);
  assert.equal(request.questRevision, problem.revision);
  assert.equal(request.suite, "public");
  assert.deepEqual(request.tests.map((item) => item.id), problem.runTestIds);
  assert.ok(Object.isFrozen(request));
  assert.ok(Object.isFrozen(request.tests));
});

test("submit 요청도 public suite를 유지하며 모든 브라우저 공개 테스트를 전달한다", () => {
  const execution = createCodingTestRunnerRequest(createInput("submit"));
  const request = execution.runnerRequest;

  assert.equal(execution.mode, "submit");
  assert.equal(request.suite, "public");
  assert.deepEqual(request.tests.map((item) => item.id), problem.publicTests.map((item) => item.id));
  assert.equal(request.tests.length, problem.publicTests.length);
});

test("어댑터는 AbortSignal 옵션을 전달하고 결과를 problem 의미로 복원한다", async () => {
  const calls = [];
  const runner = {
    async run(request, options) {
      calls.push({ request, options });
      return createPassingRunnerReport(request);
    },
  };
  const adapter = new CodingTestRunnerAdapter(runner);
  const controller = new AbortController();
  const report = await adapter.run(createInput("run"), { signal: controller.signal });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.signal, controller.signal);
  assert.equal(calls[0].request.suite, "public");
  assert.equal(report.problemId, problem.id);
  assert.equal(report.problemRevision, problem.revision);
  assert.equal(report.mode, "run");
  assert.equal(report.suite, "public");
  assert.equal(report.summary.total, problem.runTestIds.length);
  assert.equal(Object.hasOwn(report, "questId"), false);
  assert.equal(Object.hasOwn(report, "questRevision"), false);
});

test("submit 결과는 mode를 submit으로 복원하고 전체 테스트 요약을 보존한다", async () => {
  const runner = {
    async run(request) {
      return createPassingRunnerReport(request);
    },
  };
  const report = await new CodingTestRunnerAdapter(runner).run(createInput("submit"));

  assert.equal(report.mode, "submit");
  assert.equal(report.summary.total, problem.publicTests.length);
  assert.deepEqual(report.tests.map((item) => item.testId), problem.publicTests.map((item) => item.id));
});

test("허용되지 않은 mode와 컬렉션 밖 문제를 실행 전에 거부한다", () => {
  assert.throws(() => createCodingTestRunnerRequest(createInput("hidden")), /run.*submit/);
  assert.throws(
    () =>
      createCodingTestRunnerRequest(
        createInput("run", {
          problem: { ...problem, id: "coding-test-javascript-not-present" },
        }),
      ),
    /컬렉션에 속하지 않습니다/,
  );
  assert.throws(() => new CodingTestRunnerAdapter({}), /run\(\)/);
});

test("runner가 요청과 다른 식별자나 suite를 반환하면 결과를 거부한다", () => {
  const execution = createCodingTestRunnerRequest(createInput("run"));
  const report = createPassingRunnerReport(execution.runnerRequest);
  report.questId = "coding-test-javascript-other";
  assert.throws(
    () => adaptCodingTestRunnerReport(report, execution),
    /실행 결과가 요청과 일치하지 않습니다/,
  );

  const wrongSuite = createPassingRunnerReport(execution.runnerRequest);
  wrongSuite.suite = "submission";
  assert.throws(
    () => adaptCodingTestRunnerReport(wrongSuite, execution),
    /실행 결과가 요청과 일치하지 않습니다/,
  );
});

test("다중 언어 어댑터는 Java 코딩테스트를 Java runner로 보내고 타입 DTO를 보존한다", async () => {
  let javascriptCalls = 0;
  const javaCalls = [];
  const javascriptRunner = {
    async run() {
      javascriptCalls += 1;
      throw new Error("Java 요청이 JavaScript runner로 전달되었습니다.");
    },
  };
  const javaRunner = {
    async run(request) {
      javaCalls.push(request);
      return createPassingRunnerReport(request);
    },
  };
  const adapter = new CodingTestRunnerAdapter({ javascriptRunner, javaRunner });
  const report = await adapter.run({
    collection: javaCollection,
    problem: javaProblem,
    source: javaProblem.starterCode,
    requestId: "java-coding-adapter",
    mode: "run",
  });

  assert.equal(javascriptCalls, 0);
  assert.equal(javaCalls.length, 1);
  assert.equal(javaCalls[0].languageId, "java");
  assert.deepEqual(
    javaCalls[0].parameterTypes,
    javaProblem.functionContract.parameters.map((parameter) => parameter.type),
  );
  assert.equal(javaCalls[0].returnType, javaProblem.functionContract.returns.type);
  assert.equal(report.languageId, "java");
  assert.equal(report.problemId, javaProblem.id);
});

test("다중 언어 어댑터는 JavaScript·Java runner를 모두 요구한다", () => {
  const runner = { async run() {} };
  assert.throws(
    () => new CodingTestRunnerAdapter({ javascriptRunner: runner }),
    /Java 실행기/,
  );
  assert.throws(
    () => new CodingTestRunnerAdapter({ javaRunner: runner }),
    /JavaScript 실행기/,
  );
});
