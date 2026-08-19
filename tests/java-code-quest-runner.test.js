import assert from "node:assert/strict";
import test from "node:test";

import { summarizeTestResults } from "../src/grading/code-grading.js";
import { BrowserJavaCodeQuestRunner } from "../src/grading/java-code-quest-runner.js";

function createRequest(overrides = {}) {
  return {
    requestId: "java-browser-request",
    contractVersion: 1,
    questId: "quest-java-add",
    questRevision: 1,
    languageId: "java",
    suite: "public",
    source: "public class Solution { public static int add(int a, int b) { return a + b; } }",
    entryPoint: "add",
    parameterTypes: ["int", "int"],
    returnType: "int",
    tests: [
      { id: "java-add-one", label: "양수", args: [1, 2], expected: 3 },
      { id: "java-add-two", label: "음수", args: [-2, 1], expected: -1 },
    ],
    ...overrides,
  };
}

function createReport(request) {
  const tests = request.tests.map((test) => ({
    testId: test.id,
    label: test.label,
    outcome: "passed",
    expected: test.expected,
    expectedDisplay: JSON.stringify(test.expected),
    actual: test.expected,
    actualDisplay: JSON.stringify(test.expected),
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
    summary: summarizeTestResults(tests),
    durationMs: 2,
    limitsApplied: { javaRelease: 21 },
    error: null,
  };
}

function jsonResponse(value, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async text() {
      return JSON.stringify(value);
    },
  };
}

test("Java browser runner는 same-origin API에 타입 포함 JSON을 POST하고 report를 정규화한다", async () => {
  const calls = [];
  const runner = new BrowserJavaCodeQuestRunner({
    fetchImplementation: async function (url, options) {
      calls.push({ url, options, receiver: this });
      const request = JSON.parse(options.body);
      return jsonResponse(createReport(request));
    },
  });
  const request = createRequest();
  const report = await runner.run(request);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].receiver, globalThis);
  assert.equal(calls[0].url, "/api/java/execute");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.credentials, "same-origin");
  assert.equal(calls[0].options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0].options.body).parameterTypes, ["int", "int"]);
  assert.equal(report.outcome, "passed");
  assert.equal(report.summary.passed, 2);
});

test("Java browser runner는 AbortController 취소를 cancelled report로 정규화한다", async () => {
  const runner = new BrowserJavaCodeQuestRunner({
    fetchImplementation: async (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener(
          "abort",
          () => reject(new DOMException("aborted", "AbortError")),
          { once: true },
        );
      }),
  });
  const controller = new AbortController();
  const pending = runner.run(createRequest(), { signal: controller.signal });
  controller.abort();
  const report = await pending;

  assert.equal(report.outcome, "cancelled");
  assert.equal(report.tests[0].outcome, "cancelled");
  assert.equal(report.tests[1].outcome, "not_run");
});

test("signal이 중단되지 않은 AbortError는 Java 사용자 취소로 오인하지 않는다", async () => {
  const runner = new BrowserJavaCodeQuestRunner({
    fetchImplementation: async () => {
      throw new DOMException("transport aborted", "AbortError");
    },
  });
  const controller = new AbortController();
  const report = await runner.run(createRequest(), { signal: controller.signal });
  assert.equal(controller.signal.aborted, false);
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.error.type, "java_transport_error");
});

test("Java browser runner는 요청과 다른 서버 report를 engine_error로 거부한다", async () => {
  const request = createRequest();
  const invalidReport = createReport(request);
  invalidReport.questId = "quest-java-other";
  const runner = new BrowserJavaCodeQuestRunner({
    fetchImplementation: async () => jsonResponse(invalidReport),
  });

  const report = await runner.run(request);
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.error.type, "java_transport_error");
  assert.match(report.error.message, /DTO와 일치하지 않습니다/);
});

test("Java browser runner는 API 오류를 던지지 않고 engine_error로 보고한다", async () => {
  const runner = new BrowserJavaCodeQuestRunner({
    fetchImplementation: async () => jsonResponse({}, { ok: false, status: 503 }),
  });
  const report = await runner.run(createRequest());
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.error.type, "java_api_error");
});

test("Java browser runner endpoint는 same-origin 절대 경로만 허용한다", () => {
  const fetchImplementation = async () => jsonResponse({});
  assert.throws(
    () => new BrowserJavaCodeQuestRunner({ endpoint: "https://example.com/java", fetchImplementation }),
    /same-origin/,
  );
  assert.throws(
    () => new BrowserJavaCodeQuestRunner({ endpoint: "//example.com/java", fetchImplementation }),
    /same-origin/,
  );
});
