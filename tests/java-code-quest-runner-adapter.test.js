import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { JavaCodeQuestRunnerAdapter } from "../src/grading/java-code-quest-runner-adapter.js";

const collection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);
const questsById = new Map(collection.quests.map((quest) => [quest.id, quest]));
const quest = questsById.get("quest-java-total-price");
const REPORT_OUTCOMES = [
  "passed",
  "wrong_answer",
  "syntax_error",
  "runtime_error",
  "timeout",
  "output_limit",
  "cancelled",
  "engine_error",
  "not_run",
];
const REPORT_OUTCOME_PRIORITY = [
  "cancelled",
  "engine_error",
  "timeout",
  "output_limit",
  "syntax_error",
  "runtime_error",
  "wrong_answer",
  "not_run",
];

function createRequest(requestId = "java-adapter-request", targetQuest = quest) {
  return {
    requestId,
    contractVersion: 1,
    questId: targetQuest.id,
    questRevision: targetQuest.revision,
    languageId: "java",
    suite: "public",
    evaluationKind: "java-static-method-v1",
    source: targetQuest.starterCode,
  };
}

function createSummary(tests, observationFailures = 0) {
  const counts = Object.fromEntries(REPORT_OUTCOMES.map((outcome) => [outcome, 0]));
  for (const result of tests) counts[result.outcome] += 1;
  const outcome = REPORT_OUTCOME_PRIORITY.find((candidate) => counts[candidate] > 0) ?? "passed";
  return { outcome, total: tests.length, ...counts, observationFailures };
}

function createPassedReport(request, testId = "java-total-price-normal") {
  const tests = [{ testId, outcome: "passed" }];
  return {
    requestId: request.requestId,
    contractVersion: 1,
    questId: request.questId,
    questRevision: request.questRevision,
    languageId: "java",
    suite: "public",
    outcome: "passed",
    tests,
    summary: createSummary(tests),
    error: null,
  };
}

test("adapter는 capability 누락·오류·잘못된 응답을 available false로 닫는다", async () => {
  const unavailable = await new JavaCodeQuestRunnerAdapter().capabilities();
  assert.deepEqual(unavailable, {
    contractVersion: 1,
    evaluationKind: "java-static-method-v1",
    available: false,
    reason: "Java 실행기를 사용할 수 없습니다.",
  });
  assert.equal(Object.isFrozen(unavailable), true);

  const failed = await new JavaCodeQuestRunnerAdapter({
    async capabilities() { throw new Error("bridge failure"); },
  }).capabilities();
  assert.equal(failed.available, false);
  assert.equal(failed.reason, "Java 실행 준비 상태를 확인하지 못했습니다.");

  const invalid = await new JavaCodeQuestRunnerAdapter({
    async capabilities() {
      return {
        contractVersion: 1,
        evaluationKind: "java-static-method-v1",
        available: true,
        extra: true,
      };
    },
  }).capabilities();
  assert.equal(invalid.available, false);
});

test("adapter는 최소 bridge record만 보내고 요청과 일치하는 report identity를 보존한다", async () => {
  const request = createRequest();
  const report = createPassedReport(request);
  const calls = [];
  const adapter = new JavaCodeQuestRunnerAdapter({
    async run(bridgeRequest) {
      calls.push(bridgeRequest);
      return report;
    },
    async cancel() {},
  });

  const received = await adapter.run(request);

  assert.equal(received, report);
  assert.deepEqual(calls, [{
    requestId: request.requestId,
    questId: request.questId,
    revision: request.questRevision,
    source: request.source,
  }]);

  await assert.rejects(
    () => adapter.run({ ...request, unexpected: true }),
    /실행 요청 필드/,
  );
  await assert.rejects(
    () => new JavaCodeQuestRunnerAdapter({
      async run() { return { ...report, requestId: "other-request" }; },
      async cancel() {},
    }).run(request),
    /현재 요청과 일치하는 결과/,
  );
  await assert.rejects(
    () => new JavaCodeQuestRunnerAdapter({
      async run() { return { ...report, summary: { ...report.summary, passed: 0 } }; },
      async cancel() {},
    }).run(request),
    /요약 통계/,
  );
});

test("adapter는 배열 관찰 결과와 outcome별 요약을 빠짐없이 검증하고 report identity를 보존한다", async () => {
  const observedQuest = questsById.get("quest-java-bridge-arr-01");
  const request = createRequest("java-observation-report", observedQuest);
  const tests = [
    {
      testId: observedQuest.publicTests[0].id,
      outcome: "wrong_answer",
      expectedObservations: { argument0Unchanged: true, returnNotArgument0: true },
      actualObservations: { argument0Unchanged: true, returnNotArgument0: false },
      failedObservations: ["returnNotArgument0"],
    },
    {
      testId: observedQuest.publicTests[1].id,
      outcome: "passed",
      expectedObservations: { argument0Unchanged: true, returnNotArgument0: true },
      actualObservations: { argument0Unchanged: true, returnNotArgument0: true },
      failedObservations: [],
    },
  ];
  const report = {
    ...createPassedReport(request, tests[0].testId),
    outcome: "wrong_answer",
    tests,
    summary: createSummary(tests, 1),
  };
  const runWithReport = (candidate) => new JavaCodeQuestRunnerAdapter({
    async run() { return candidate; },
    async cancel() {},
  }).run(request);

  assert.equal(await runWithReport(report), report);
  await assert.rejects(
    () => runWithReport({ ...report, tests: [{ ...tests[0], actualObservations: null }] }),
    /관찰 결과/,
  );
  await assert.rejects(
    () => runWithReport({ ...report, tests: [{ ...tests[0], failedObservations: [] }] }),
    /관찰 결과/,
  );
  await assert.rejects(
    () => runWithReport({ ...report, summary: { ...report.summary, observationFailures: 0 } }),
    /요약 통계/,
  );

  const plainRequest = createRequest("java-no-observations", questsById.get("quest-java-bridge-arr-02"));
  await assert.rejects(
    () => new JavaCodeQuestRunnerAdapter({
      async run() {
        return {
          ...createPassedReport(plainRequest, "java-bridge-arr-02-mixed"),
          tests: [{
            testId: "java-bridge-arr-02-mixed",
            outcome: "passed",
            expectedObservations: { argument0Unchanged: true, returnNotArgument0: true },
            actualObservations: { argument0Unchanged: true, returnNotArgument0: true },
            failedObservations: [],
          }],
        };
      },
      async cancel() {},
    }).run(plainRequest),
    /관찰 대상이 아닌 Quest/,
  );
});

test("adapter는 AbortSignal당 cancel을 한 번만 전달한다", async () => {
  const request = createRequest("java-adapter-cancel");
  const report = createPassedReport(request);
  const cancelCalls = [];
  let finishRun;
  const adapter = new JavaCodeQuestRunnerAdapter({
    run() {
      return new Promise((resolve) => { finishRun = resolve; });
    },
    async cancel(bridgeRequest) { cancelCalls.push(bridgeRequest); },
  });
  const controller = new AbortController();
  const running = adapter.run(request, { signal: controller.signal });

  controller.abort();
  controller.abort();
  finishRun(report);

  assert.equal(await running, report);
  assert.deepEqual(cancelCalls, [{ requestId: request.requestId }]);
});
