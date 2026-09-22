import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { release as osRelease, version as osVersion } from "node:os";
import test from "node:test";

import {
  getJavaCodingTestCapabilities,
  runJavaCodingTest,
  __test as supervisorTest,
} from "../desktop/runtime/supervisor.mjs";

const collection = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);
const firstProblem = collection.problems[0];

function request(mode = "run", overrides = {}) {
  return {
    requestId: `ct-${mode}-request`,
    problemId: firstProblem.id,
    revision: firstProblem.revision,
    source: firstProblem.starterCode,
    mode,
    ...overrides,
  };
}

function protocolFrame({
  testId = firstProblem.publicTests[0].id,
  outcome = "passed",
  discovered = 5,
  started = discovered,
  finished = started,
  passed = finished,
  wrongAnswer = 0,
  runtimeError = 0,
  skipped = 0,
  aborted = 0,
  infrastructure = 0,
  discoveryComplete = true,
  executionComplete = true,
  message = "",
} = {}) {
  return Buffer.from([
    "BAMCT1",
    testId,
    outcome,
    discovered,
    started,
    finished,
    passed,
    wrongAnswer,
    runtimeError,
    skipped,
    aborted,
    infrastructure,
    discoveryComplete,
    executionComplete,
    Buffer.from(message).toString("base64"),
  ].join("|") + "\n");
}

function execution(protocolOutput, overrides = {}) {
  return {
    exitCode: 0,
    terminationReason: null,
    startError: null,
    stdout: "",
    stderr: "",
    protocolOutput,
    durationMs: 12.3,
    ...overrides,
  };
}

test("CT renderer 요청은 다섯 필드만 허용하고 신뢰 manifest가 run/submit을 선택한다", () => {
  const runRequest = supervisorTest.readCodingTestRequest(request("run"));
  assert.equal(Object.isFrozen(runRequest), true);
  assert.deepEqual(Object.keys(runRequest).sort(), [
    "mode",
    "problemId",
    "requestId",
    "revision",
    "source",
  ]);

  const quick = supervisorTest.readTrustedCodingTest(collection, runRequest);
  const submission = supervisorTest.readTrustedCodingTest(
    collection,
    supervisorTest.readCodingTestRequest(request("submit")),
  );
  assert.equal(quick.codingTest, true);
  assert.deepEqual(quick.tests.map(({ id }) => id), [firstProblem.publicTests[0].id]);
  assert.deepEqual(
    submission.tests.map(({ id }) => id),
    firstProblem.publicTests.map(({ id }) => id),
  );
  assert.deepEqual(
    submission.tests.map(({ testClass, method }) => `${testClass}#${method}`),
    [
      "bridge.array.onedimensional.test.ArraySolution01Test#correctsOnePosition",
      "bridge.array.onedimensional.test.ArraySolution01Test#test06",
    ],
  );
  assert.deepEqual(
    submission.tests.map(({ expected }) => expected),
    firstProblem.publicTests.map(({ assertionSource }) => assertionSource),
  );

  assert.throws(
    () => supervisorTest.readCodingTestRequest(request("run", { testId: "renderer-choice" })),
    /허용되지 않은 필드/u,
  );
  assert.throws(
    () => supervisorTest.readCodingTestRequest(request("hidden")),
    /run or submit/u,
  );
  assert.throws(
    () => supervisorTest.readTrustedCodingTest(collection, request("run", { revision: 2 })),
    /ID\/revision/u,
  );
});

test("JUnit protocol은 parameterized invocation 수와 오류 종류를 구조적으로 집계한다", () => {
  assert.deepEqual(supervisorTest.parseCodingTestProtocol(protocolFrame(), firstProblem.publicTests[0].id), {
    outcome: "passed",
    invocations: {
      discovered: 5,
      started: 5,
      finished: 5,
      passed: 5,
      wrongAnswer: 0,
      runtimeError: 0,
      skipped: 0,
      aborted: 0,
      infrastructure: 0,
    },
    message: "",
    complete: true,
  });

  const wrongAnswer = supervisorTest.parseCodingTestProtocol(protocolFrame({
    outcome: "wrong_answer",
    passed: 4,
    wrongAnswer: 1,
    message: "기대값과 실제값이 다릅니다.",
  }), firstProblem.publicTests[0].id);
  assert.equal(wrongAnswer.outcome, "wrong_answer");
  assert.equal(wrongAnswer.invocations.wrongAnswer, 1);
  assert.equal(wrongAnswer.message, "기대값과 실제값이 다릅니다.");

  const runtimeError = supervisorTest.parseCodingTestProtocol(protocolFrame({
    outcome: "runtime_error",
    passed: 3,
    runtimeError: 2,
    message: "학습자 코드 예외",
  }), firstProblem.publicTests[0].id);
  assert.equal(runtimeError.outcome, "runtime_error");
  assert.equal(runtimeError.invocations.runtimeError, 2);
});

test("0 discovery·skip·abort·provider/infrastructure·불완전 plan은 성공이 아니다", () => {
  const engineCases = [
    { discovered: 0, started: 0, finished: 0, passed: 0 },
    { passed: 4, skipped: 1 },
    { passed: 4, aborted: 1 },
    { passed: 4, infrastructure: 1 },
    { discoveryComplete: false },
    { executionComplete: false },
  ];
  for (const candidate of engineCases) {
    const parsed = supervisorTest.parseCodingTestProtocol(protocolFrame({
      ...candidate,
      outcome: "engine_error",
      message: "JUnit 실행 미완료",
    }), firstProblem.publicTests[0].id);
    assert.equal(parsed.outcome, "engine_error");
    assert.equal(parsed.complete, false);
  }

  assert.throws(
    () => supervisorTest.parseCodingTestProtocol(protocolFrame({
      outcome: "passed",
      discovered: 0,
      started: 0,
      finished: 0,
      passed: 0,
    }), firstProblem.publicTests[0].id),
    /Inconsistent/u,
  );
  assert.throws(
    () => supervisorTest.parseCodingTestProtocol(protocolFrame(), "different-test-id"),
    /frame identity/u,
  );
  assert.throws(
    () => supervisorTest.parseCodingTestProtocol(
      Buffer.from(protocolFrame().toString("utf8").replace("|5|5|5|", "|05|5|5|")),
      firstProblem.publicTests[0].id,
    ),
    /count/u,
  );
});

test("method 결과는 invocation을 보존하고 깨진 protocol·비정상 종료를 engine_error로 닫는다", () => {
  const [method] = supervisorTest.readTrustedCodingTest(
    collection,
    supervisorTest.readCodingTestRequest(request("run")),
  ).tests;
  const passed = supervisorTest.codingTestResult(method, execution(protocolFrame()));
  assert.equal(passed.testId, firstProblem.publicTests[0].id);
  assert.equal(passed.outcome, "passed");
  assert.equal(passed.invocations.passed, 5);
  assert.equal(passed.durationMs, 12.3);
  assert.equal(passed.error, null);

  const malformed = supervisorTest.codingTestResult(method, execution(Buffer.from("not-a-frame\n")));
  assert.equal(malformed.outcome, "engine_error");
  assert.equal(malformed.error.type, "engine_error");

  const nonzeroExit = supervisorTest.codingTestResult(
    method,
    execution(protocolFrame(), { exitCode: 3 }),
  );
  assert.equal(nonzeroExit.outcome, "engine_error");
  assert.match(nonzeroExit.error.message, /비정상 종료/u);
});

test("활성화된 CT capability는 플랫폼·bundle의 첫 실패 단계에서 false로 닫는다", async () => {
  const failureStage = supervisorTest.matchesValidatedKernel(
    osRelease(),
    osVersion(),
  )
    ? "bundle"
    : "kernel";
  const capability = await getJavaCodingTestCapabilities({
    bundleRoot: "/must-not-be-read",
    trustedManifest: collection,
  });
  assert.deepEqual(capability, {
    contractVersion: 1,
    evaluationKind: "java-junit-method-v1",
    available: false,
    reason: failureStage === "kernel"
      ? "검증된 Java 실행 환경과 일치하지 않습니다."
      : "번들 Java 실행 환경을 사용할 수 없습니다.",
  });
});

test("검증되지 않은 bundle 실행 요청은 JVM 없이 run/submit 전체를 not_run으로 보고한다", async () => {
  const quick = await runJavaCodingTest(request("run"), {
    bundleRoot: "/must-not-be-read",
    trustedManifest: collection,
  });
  const submission = await runJavaCodingTest(request("submit"), {
    bundleRoot: "/must-not-be-read",
    trustedManifest: collection,
  });

  assert.deepEqual({
    problemId: quick.problemId,
    problemRevision: quick.problemRevision,
    evaluationKind: quick.evaluationKind,
    mode: quick.mode,
    outcome: quick.outcome,
    testIds: quick.tests.map(({ testId }) => testId),
    notRun: quick.summary.not_run,
  }, {
    problemId: firstProblem.id,
    problemRevision: firstProblem.revision,
    evaluationKind: "java-junit-method-v1",
    mode: "run",
    outcome: "engine_error",
    testIds: [firstProblem.publicTests[0].id],
    notRun: 1,
  });
  assert.equal(submission.mode, "submit");
  assert.equal(submission.outcome, "engine_error");
  assert.deepEqual(
    submission.tests.map(({ testId, outcome }) => ({ testId, outcome })),
    firstProblem.publicTests.map(({ id }) => ({ testId: id, outcome: "not_run" })),
  );
  assert.equal(submission.summary.total, firstProblem.publicTests.length);
  assert.equal(submission.summary.not_run, firstProblem.publicTests.length);
});
