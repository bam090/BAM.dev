import assert from "node:assert/strict";
import test from "node:test";
import { BrowserCodeQuestRunner } from "../src/grading/browser-code-quest-runner.js";
import { executeJavaScriptTest } from "../src/grading/javascript-runtime.js";

function createRequest(overrides = {}) {
  return {
    requestId: "run-fixture-001",
    contractVersion: 1,
    questId: "quest-fixture-sum",
    questRevision: 1,
    languageId: "javascript",
    suite: "public",
    source: "function add(left, right) { return left + right; }",
    entryPoint: "add",
    tests: [
      { id: "public-basic", label: "양수", args: [2, 3], expected: 5 },
      { id: "public-negative", label: "음수", args: [-2, -3], expected: -5 },
    ],
    ...overrides,
  };
}

class FakeWorker {
  constructor(handlePostMessage) {
    this.handlePostMessage = handlePostMessage;
    this.listeners = new Map();
    this.messages = [];
    this.terminateCount = 0;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  postMessage(message) {
    this.messages.push(message);
    this.handlePostMessage?.(message, this);
  }

  dispatch(type, event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  terminate() {
    this.terminateCount += 1;
  }
}

function createFakeTimers() {
  let sequence = 0;
  const timers = new Map();

  return {
    setTimeoutFn(callback) {
      sequence += 1;
      timers.set(sequence, callback);
      return sequence;
    },
    clearTimeoutFn(timerId) {
      timers.delete(timerId);
    },
    flush() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((callback) => callback());
    },
    get size() {
      return timers.size;
    },
  };
}

function createRunner(handlePostMessage, options = {}) {
  const workers = [];
  const runner = new BrowserCodeQuestRunner({
    workerFactory() {
      const worker = new FakeWorker(handlePostMessage);
      workers.push(worker);
      return worker;
    },
    tokenFactory: (() => {
      let sequence = 0;
      return () => `token-${(sequence += 1)}`;
    })(),
    ...options,
  });

  return { runner, workers };
}

function respond(worker, message, result, envelopeOverrides = {}) {
  worker.dispatch("message", {
    data: {
      type: "result",
      requestId: message.requestId,
      testId: message.testId,
      workerToken: message.workerToken,
      result,
      ...envelopeOverrides,
    },
  });
}

function createSharedDag(depth) {
  let value = { leaf: 0 };
  for (let level = 0; level < depth; level += 1) {
    value = { left: value, right: value };
  }
  return value;
}

test("테스트마다 새 실행 문맥을 만들고 기준 풀이의 예상값과 실제값을 보고한다", async () => {
  const { runner, workers } = createRunner(async (message, worker) => {
    const result = await executeJavaScriptTest(message);
    respond(worker, message, result);
  });

  const report = await runner.run(createRequest());

  assert.equal(report.outcome, "passed");
  assert.equal(workers.length, 2);
  assert.ok(workers.every((worker) => worker.terminateCount === 1));
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["passed", "passed"],
  );
  assert.deepEqual(
    report.tests.map((result) => [result.expectedDisplay, result.actualDisplay]),
    [["5", "5"], ["-5", "-5"]],
  );
});

test("대표 오답은 실행 오류가 아니라 테스트별 wrong_answer로 구분한다", async () => {
  const { runner } = createRunner(async (message, worker) => {
    const result = await executeJavaScriptTest(message);
    respond(worker, message, result);
  });
  const request = createRequest({
    source: "function add(left, right) { return left - right; }",
  });

  const report = await runner.run(request);

  assert.equal(report.outcome, "wrong_answer");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["wrong_answer", "wrong_answer"],
  );
  assert.equal(report.tests[0].expected, 5);
  assert.equal(report.tests[0].actual, -1);
});

test("문법 오류 뒤 테스트는 실행하지 않고 문법 오류를 런타임 오류와 구분한다", async () => {
  const { runner, workers } = createRunner((message, worker) => {
    respond(worker, message, {
      outcome: "syntax_error",
      error: {
        name: "SyntaxError",
        message: "Unexpected token",
        learnerMessage: "코드 문법을 확인해 주세요.",
      },
      console: [],
    });
  });

  const report = await runner.run(createRequest());

  assert.equal(report.outcome, "syntax_error");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["syntax_error", "not_run"],
  );
  assert.equal(workers.length, 1);
});

test("런타임 오류와 출력 제한을 각각 보존한다", async () => {
  const outcomes = ["runtime_error", "output_limit"];
  const { runner } = createRunner((message, worker) => {
    const outcome = outcomes.shift();
    respond(worker, message, {
      outcome,
      error: {
        name: outcome === "runtime_error" ? "TypeError" : "OutputLimitError",
        message: outcome,
        learnerMessage: outcome,
      },
      ...(outcome === "output_limit"
        ? { limit: { kind: "return_value" } }
        : {}),
      console: [],
    });
  });

  const report = await runner.run(createRequest());

  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["runtime_error", "output_limit"],
  );
  assert.equal(report.outcome, "output_limit");
});

test("응답이 없는 Worker를 제한 시간에 종료하고 timeout을 반환한다", async () => {
  const timers = createFakeTimers();
  const { runner, workers } = createRunner(undefined, timers);

  const reportPromise = runner.run(createRequest({ tests: [createRequest().tests[0]] }));
  assert.equal(timers.size, 1);
  timers.flush();
  const report = await reportPromise;

  assert.equal(report.outcome, "timeout");
  assert.equal(report.tests[0].outcome, "timeout");
  assert.match(report.tests[0].error.learnerMessage, /반복문|재귀/);
  assert.equal(workers[0].terminateCount, 1);
  assert.equal(timers.size, 0);
});

test("전체 실행 시간 제한에 도달하면 새 Worker를 만들지 않고 나머지를 건너뛴다", async () => {
  const times = [0, 0, 0, 0, 3000, 6000, 6000];
  const { runner, workers } = createRunner(
    (message, worker) => {
      respond(worker, message, { outcome: "completed", value: 5, console: [] });
    },
    {
      limits: { runTimeoutMs: 5000 },
      now: () => times.shift() ?? 6000,
    },
  );
  const request = createRequest({
    tests: [
      createRequest().tests[0],
      { id: "public-second", args: [2, 3], expected: 5 },
      { id: "public-third", args: [2, 3], expected: 5 },
    ],
  });

  const report = await runner.run(request);

  assert.equal(report.outcome, "timeout");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["passed", "timeout", "not_run"],
  );
  assert.equal(workers.length, 1);
});

test("취소 시 현재 Worker를 종료하고 남은 테스트를 실행하지 않는다", async () => {
  const controller = new AbortController();
  const { runner, workers } = createRunner(undefined);

  const reportPromise = runner.run(createRequest(), { signal: controller.signal });
  controller.abort();
  const report = await reportPromise;

  assert.equal(report.outcome, "cancelled");
  assert.deepEqual(
    report.tests.map((result) => result.outcome),
    ["cancelled", "not_run"],
  );
  assert.equal(workers[0].terminateCount, 1);
});

test("다른 실행·테스트·Worker 토큰의 오래된 메시지를 무시한다", async () => {
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, { outcome: "completed", value: 999, console: [] }, {
      workerToken: "stale-token",
    });
    respond(worker, message, { outcome: "completed", value: 5, console: [] });
  });

  const report = await runner.run(createRequest({ tests: [createRequest().tests[0]] }));

  assert.equal(report.outcome, "passed");
  assert.equal(report.tests[0].actual, 5);
});

test("동시 실행과 짧은 시간의 반복 실행을 Worker 생성 전에 제한한다", async () => {
  const firstController = new AbortController();
  const { runner, workers } = createRunner(undefined, {
    limits: { maxRunsPerWindow: 2 },
  });
  const firstRun = runner.run(createRequest(), { signal: firstController.signal });

  const concurrent = await runner.run(
    createRequest({ requestId: "run-fixture-concurrent" }),
  );
  assert.equal(concurrent.outcome, "engine_error");
  assert.equal(concurrent.error.type, "concurrent_run");
  assert.equal(workers.length, 1);

  firstController.abort();
  await firstRun;

  const secondController = new AbortController();
  const secondRun = runner.run(
    createRequest({ requestId: "run-fixture-002" }),
    { signal: secondController.signal },
  );
  secondController.abort();
  await secondRun;

  const limited = await runner.run(createRequest({ requestId: "run-fixture-003" }));
  assert.equal(limited.outcome, "engine_error");
  assert.equal(limited.error.type, "run_rate_limit");
  assert.equal(workers.length, 2);
});

test("Worker 프로토콜 오류는 학습자 코드 오류와 다른 engine_error다", async () => {
  const { runner, workers } = createRunner((message, worker) => {
    respond(worker, message, { outcome: "unknown" });
  });

  const report = await runner.run(createRequest());

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.equal(report.tests[1].outcome, "not_run");
  assert.equal(workers[0].terminateCount, 1);
});

test("outcome별 Worker 결과 DTO가 malformed이면 invalid_worker_result로 거부한다", async (t) => {
  const malformedResults = [
    ["completed에 own value 없음", { outcome: "completed", console: [] }],
    ["completed value가 JSON 비호환", { outcome: "completed", value: undefined, console: [] }],
    ["console이 배열이 아님", { outcome: "completed", value: 5, console: "외부 출력" }],
    ["runtime error DTO가 문자열", { outcome: "runtime_error", error: "boom", console: [] }],
  ];

  for (const [name, malformedResult] of malformedResults) {
    await t.test(name, async () => {
      const { runner } = createRunner((message, worker) => {
        respond(worker, message, malformedResult);
      });
      const report = await runner.run(
        createRequest({ tests: [createRequest().tests[0]] }),
      );

      assert.equal(report.outcome, "engine_error");
      assert.equal(report.tests[0].outcome, "engine_error");
      assert.equal(report.tests[0].error.type, "invalid_worker_result");
    });
  }
});

test("Worker result의 outcome accessor를 실행하지 않고 거부한다", async () => {
  let getterCalls = 0;
  const result = { value: 5, console: [] };
  Object.defineProperty(result, "outcome", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "completed";
    },
  });
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, result);
  });

  const report = await runner.run(
    createRequest({ tests: [{ id: "public-outcome-accessor", args: [], expected: 5 }] }),
  );

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].error.type, "invalid_worker_result");
  assert.equal(getterCalls, 0);
});

test("Worker console 배열의 length get trap을 실행하지 않는다", async () => {
  let lengthGets = 0;
  const consoleEntries = new Proxy([], {
    get(target, key, receiver) {
      if (key === "length") lengthGets += 1;
      return Reflect.get(target, key, receiver);
    },
  });
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, {
      outcome: "completed",
      value: 5,
      console: consoleEntries,
    });
  });

  const report = await runner.run(
    createRequest({ tests: [{ id: "public-console-proxy", args: [], expected: 5 }] }),
  );

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].error.type, "invalid_worker_result");
  assert.equal(lengthGets, 0);
});

test("ambient toJSON 변조로 completed value 크기 제한을 우회하지 못한다", async () => {
  const toJsonDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, {
      outcome: "completed",
      value: { payload: "x".repeat(20_000) },
      console: [],
    });
  });
  let report;

  try {
    Object.defineProperty(Object.prototype, "toJSON", {
      configurable: true,
      value() {
        return null;
      },
    });
    report = await runner.run(
      createRequest({ tests: [{ id: "public-large-result", args: [], expected: null }] }),
    );
  } finally {
    if (toJsonDescriptor) Object.defineProperty(Object.prototype, "toJSON", toJsonDescriptor);
    else delete Object.prototype.toJSON;
  }

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.equal(report.tests[0].error.type, "invalid_worker_result");
});

test("alias DAG Worker 결과도 실제 JSON 확장 크기 한도로 거부한다", async () => {
  const expandedDag = createSharedDag(20);
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, {
      outcome: "completed",
      value: expandedDag,
      console: [],
    });
  });

  const report = await runner.run(
    createRequest({ tests: [{ id: "public-alias-result", args: [], expected: null }] }),
  );

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.equal(report.tests[0].error.type, "invalid_worker_result");
});

test("Worker의 compile capability engine_error를 학습자 오류로 바꾸지 않는다", async () => {
  const { runner } = createRunner((message, worker) => {
    respond(worker, message, {
      outcome: "engine_error",
      error: {
        name: "EvalError",
        message: "unsafe-eval is blocked",
        learnerMessage: "현재 브라우저 설정에서는 코드 실행기를 사용할 수 없습니다.",
      },
      console: [],
    });
  });

  const report = await runner.run(createRequest({ tests: [createRequest().tests[0]] }));

  assert.equal(report.outcome, "engine_error");
  assert.equal(report.tests[0].outcome, "engine_error");
  assert.equal(report.tests[0].error.name, "EvalError");
});

test("검증 직후 요청을 snapshot하여 실행 중 원본 source/tests/expected 변경을 무시한다", async () => {
  const originalSource = "function add(left, right) { return left + right; }";
  const request = createRequest({ source: originalSource });
  const postedMessages = [];
  const { runner, workers } = createRunner((message, worker) => {
    postedMessages.push(message);
    queueMicrotask(() => {
      respond(worker, message, {
        outcome: "completed",
        value: message.args[0] + message.args[1],
        console: [],
      });
    });
  });

  const reportPromise = runner.run(request);
  request.source = "function add() { return 999; }";
  request.tests[0].expected = 999;
  request.tests[0].args[0] = 100;
  request.tests.push({ id: "public-appended", args: [9, 9], expected: 18 });

  const report = await reportPromise;

  assert.equal(report.outcome, "passed");
  assert.equal(report.tests.length, 2);
  assert.equal(workers.length, 2);
  assert.ok(postedMessages.every((message) => message.source === originalSource));
  assert.deepEqual(postedMessages[0].args, [2, 3]);
  assert.equal(report.tests[0].expected, 5);
  assert.equal(report.tests[0].actual, 5);
});

test("알 수 없거나 올바르지 않은 실행 제한은 Worker 생성 전에 거부한다", () => {
  assert.throws(
    () => new BrowserCodeQuestRunner({ limits: { unknownLimit: 1 } }),
    /허용되지 않은 실행 제한/,
  );
  assert.throws(
    () => new BrowserCodeQuestRunner({ limits: { testTimeoutMs: 0 } }),
    /testTimeoutMs/,
  );
  assert.throws(
    () => new BrowserCodeQuestRunner({ limits: null }),
    /일반 객체/,
  );
});
