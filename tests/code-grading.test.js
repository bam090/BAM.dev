import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_EXECUTION_LIMITS,
  GRADING_OUTCOMES,
  areJsonValuesEqual,
  assertValidExecutionRequest,
  createExecutionRequestSnapshot,
  formatJsonValue,
  serializedJsonByteLength,
  summarizeTestResults,
  utf8ByteLength,
  validateExecutionRequest,
} from "../src/grading/code-grading.js";

function createRequest(overrides = {}) {
  return {
    requestId: "run-contract-fixture-001",
    contractVersion: 1,
    questId: "quest-contract-fixture",
    questRevision: 1,
    languageId: "javascript",
    suite: "public",
    source: "/* DTO 검증 전용 소스 */",
    entryPoint: "solve",
    tests: [
      {
        id: "public-contract-case",
        label: "계약 검증 사례",
        args: [{ input: [1, null, true] }],
        expected: { output: [1, null, true] },
      },
    ],
    ...overrides,
  };
}

function createNestedArrays(containerDepth) {
  let value = 0;
  for (let depth = 0; depth < containerDepth; depth += 1) value = [value];
  return value;
}

function createSharedDag(depth, wrap = (value) => value) {
  let value = wrap({ leaf: 0 });
  for (let level = 0; level < depth; level += 1) {
    value = wrap({ left: value, right: value });
  }
  return value;
}

test("기본 실행 제한과 채점 outcome 계약을 고정한다", () => {
  assert.deepEqual(DEFAULT_EXECUTION_LIMITS, {
    maxSourceBytes: 20 * 1024,
    maxTests: 20,
    maxInputBytesPerTest: 16 * 1024,
    maxOutputBytesPerTest: 16 * 1024,
    maxConsoleEntries: 100,
    maxConsoleBytes: 8 * 1024,
    testTimeoutMs: 1000,
    runTimeoutMs: 5000,
    maxRunsPerWindow: 20,
    runWindowMs: 60_000,
  });
  assert.deepEqual(Object.values(GRADING_OUTCOMES), [
    "passed",
    "wrong_answer",
    "syntax_error",
    "runtime_error",
    "timeout",
    "output_limit",
    "cancelled",
    "engine_error",
    "not_run",
  ]);
  assert.ok(Object.isFrozen(DEFAULT_EXECUTION_LIMITS));
  assert.ok(Object.isFrozen(GRADING_OUTCOMES));
});

test("문자열 크기를 UTF-8 바이트 단위로 계산한다", () => {
  assert.equal(utf8ByteLength("abc"), 3);
  assert.equal(utf8ByteLength("한"), 3);
  assert.equal(utf8ByteLength("😀"), 4);
  assert.throws(() => utf8ByteLength(1), /문자열/);
});

test("alias DAG의 실제 JSON 확장 바이트를 정확하고 제한된 작업으로 계산한다", () => {
  const leaf = {
    'escape"\n😀': "값\\\n",
    negativeZero: -0,
    exponent: 1e21,
  };
  const smallDag = { left: leaf, right: leaf };
  const expectedBytes = utf8ByteLength(JSON.stringify(smallDag));

  assert.equal(serializedJsonByteLength(smallDag), expectedBytes);
  assert.equal(serializedJsonByteLength(smallDag, 20), 21);

  let ownKeyReads = 0;
  const boundedDag = createSharedDag(
    20,
    (value) =>
      new Proxy(value, {
        ownKeys(target) {
          ownKeyReads += 1;
          return Reflect.ownKeys(target);
        },
      }),
  );

  assert.equal(serializedJsonByteLength(boundedDag, 16 * 1024), 16 * 1024 + 1);
  assert.ok(ownKeyReads < 200, `ownKeys가 ${ownKeyReads}회 호출되었습니다.`);

  const circular = {};
  circular.self = circular;
  assert.equal(serializedJsonByteLength(circular, 1024), null);

  let deepShared = 0;
  for (let depth = 0; depth < 511; depth += 1) deepShared = [deepShared];
  assert.notEqual(serializedJsonByteLength({ shallow: deepShared }, 4096), null);
  assert.equal(
    serializedJsonByteLength({ shallow: deepShared, deeper: [deepShared] }, 4096),
    null,
  );
});

test("JSON 값을 읽기 쉽게 표시하고 객체 키 순서와 무관하게 비교한다", () => {
  assert.equal(
    formatJsonValue({ answer: [true, null] }),
    '{\n  "answer": [\n    true,\n    null\n  ]\n}',
  );
  assert.equal(formatJsonValue("text"), '"text"');
  assert.equal(formatJsonValue(undefined), "undefined");

  assert.equal(
    areJsonValuesEqual(
      { first: [1, { ready: true }], second: null },
      { second: null, first: [1, { ready: true }] },
    ),
    true,
  );
  assert.equal(areJsonValuesEqual([1, 2], [2, 1]), false);
  assert.equal(areJsonValuesEqual(0, -0), true);
  assert.equal(areJsonValuesEqual(1, "1"), false);
});

test("JSON이 아닌 값이나 순환 참조는 같은 참조여도 채점상 같다고 보지 않는다", () => {
  const circular = {};
  circular.self = circular;

  assert.equal(areJsonValuesEqual(undefined, undefined), false);
  assert.equal(areJsonValuesEqual(Number.NaN, Number.NaN), false);
  assert.equal(areJsonValuesEqual(circular, circular), false);
  assert.equal(areJsonValuesEqual(new Date(0), new Date(0)), false);
  assert.match(formatJsonValue(circular), /JSON으로 표시할 수 없는 값|순환 참조/);
});

test("승인된 고정 DTO를 허용하고 assert 함수가 같은 요청을 반환한다", () => {
  const request = createRequest();

  assert.deepEqual(validateExecutionRequest(request), []);
  assert.equal(assertValidExecutionRequest(request), request);
});

test("실행 요청 snapshot을 원본과 분리하고 모든 중첩 JSON 값을 동결한다", () => {
  const request = createRequest();
  const snapshot = createExecutionRequestSnapshot(request);

  assert.deepEqual(structuredClone(snapshot), request);
  assert.notEqual(snapshot, request);
  assert.notEqual(snapshot.tests, request.tests);
  assert.notEqual(snapshot.tests[0], request.tests[0]);
  assert.notEqual(snapshot.tests[0].args, request.tests[0].args);
  assert.notEqual(snapshot.tests[0].args[0], request.tests[0].args[0]);
  assert.notEqual(snapshot.tests[0].expected, request.tests[0].expected);
  assert.equal(Object.getPrototypeOf(snapshot), null);
  assert.equal(Object.getPrototypeOf(snapshot.tests[0]), null);
  assert.equal(Object.getPrototypeOf(snapshot.tests[0].args[0]), null);
  assert.equal(Object.getPrototypeOf(snapshot.tests[0].expected), null);

  for (const value of [
    snapshot,
    snapshot.tests,
    snapshot.tests[0],
    snapshot.tests[0].args,
    snapshot.tests[0].args[0],
    snapshot.tests[0].args[0].input,
    snapshot.tests[0].expected,
    snapshot.tests[0].expected.output,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }

  request.source = "/* 원본 후속 변경 */";
  request.tests[0].id = "public-mutated-case";
  request.tests[0].args[0].input[0] = 999;
  request.tests[0].expected.output.push(false);
  request.tests.push({ id: "public-added-case", args: [], expected: null });

  assert.equal(snapshot.source, "/* DTO 검증 전용 소스 */");
  assert.equal(snapshot.tests.length, 1);
  assert.equal(snapshot.tests[0].id, "public-contract-case");
  assert.deepEqual(structuredClone(snapshot.tests[0].args), [{ input: [1, null, true] }]);
  assert.deepEqual(structuredClone(snapshot.tests[0].expected), { output: [1, null, true] });
  assert.throws(() => {
    snapshot.tests[0].args[0].input[0] = 2;
  }, TypeError);
});

test("tests Proxy의 length get trap을 실행하지 않고 descriptor로 snapshot한다", () => {
  let lengthGets = 0;
  const tests = new Proxy(createRequest().tests, {
    get(target, key, receiver) {
      if (key === "length") lengthGets += 1;
      return Reflect.get(target, key, receiver);
    },
  });
  const snapshot = createExecutionRequestSnapshot(createRequest({ tests }));

  assert.equal(snapshot.tests.length, 1);
  assert.equal(lengthGets, 0);
});

test("JSON 배열 비교도 Proxy get trap 대신 data descriptor만 읽는다", () => {
  let valueGets = 0;
  const left = new Proxy([1, { ready: true }], {
    get(target, key, receiver) {
      valueGets += 1;
      return Reflect.get(target, key, receiver);
    },
  });

  assert.equal(areJsonValuesEqual(left, [1, { ready: true }]), true);
  assert.equal(valueGets, 0);
});

test("검증과 복제 사이에 descriptor를 바꾸는 Proxy는 snapshot 재검증에서 거부한다", () => {
  const target = createRequest();
  let suiteDescriptorReads = 0;
  const request = new Proxy(target, {
    getOwnPropertyDescriptor(object, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
      if (key !== "suite") return descriptor;

      suiteDescriptorReads += 1;
      return suiteDescriptorReads === 1
        ? descriptor
        : { ...descriptor, value: "private" };
    },
  });

  assert.throws(
    () => createExecutionRequestSnapshot(request),
    /스냅샷 재검증 실패:[\s\S]*suite는 "public"/,
  );
  assert.ok(suiteDescriptorReads >= 2);
});

test("요청 Proxy가 JSON intrinsic을 바꿔도 입력 크기 검증을 우회하지 못한다", () => {
  const originalStringify = JSON.stringify;
  const target = createRequest({
    tests: [{ id: "public-large-input", args: ["x".repeat(20_000)], expected: 0 }],
  });
  const request = new Proxy(target, {
    getOwnPropertyDescriptor(object, key) {
      JSON.stringify = () => "[]";
      return Reflect.getOwnPropertyDescriptor(object, key);
    },
  });

  try {
    assert.throws(
      () => createExecutionRequestSnapshot(request),
      /args의 JSON 크기는 16384바이트 이하/,
    );
  } finally {
    JSON.stringify = originalStringify;
  }
});

test("필수 DTO 필드는 상속값이 아닌 own enumerable data field여야 한다", () => {
  const sourceDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "source");
  const expectedDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "expected");
  const request = createRequest();
  delete request.source;
  delete request.tests[0].expected;

  try {
    Object.defineProperty(Object.prototype, "source", {
      value: "function inherited() { return 1; }",
      configurable: true,
      writable: true,
    });
    Object.defineProperty(Object.prototype, "expected", {
      value: 1,
      configurable: true,
      writable: true,
    });

    assert.throws(
      () => createExecutionRequestSnapshot(request),
      /source는 필수 own enumerable data 필드/,
    );
  } finally {
    if (sourceDescriptor) Object.defineProperty(Object.prototype, "source", sourceDescriptor);
    else delete Object.prototype.source;
    if (expectedDescriptor) {
      Object.defineProperty(Object.prototype, "expected", expectedDescriptor);
    } else {
      delete Object.prototype.expected;
    }
  }
});

test("own accessor 필드를 실행하지 않고 DTO 계약 오류로 거부한다", () => {
  const request = createRequest();
  let getterCalls = 0;
  Object.defineProperty(request, "source", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "function getterSource() { return 1; }";
    },
  });

  assert.throws(() => createExecutionRequestSnapshot(request), /source.*getter|source.*값/);
  assert.equal(getterCalls, 0);
});

test("JSON getter를 실행하지 않고 snapshot 생성 전에 계약 오류로 거부한다", () => {
  let getterCalls = 0;
  const expected = {};
  Object.defineProperty(expected, "answer", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return 1;
    },
  });
  const request = createRequest({
    tests: [{ id: "public-getter-case", args: [], expected }],
  });

  assert.throws(() => createExecutionRequestSnapshot(request), /getter/);
  assert.equal(getterCalls, 0);
});

test("고정 DTO의 버전, 언어, 공개 suite와 안정적인 식별자를 검증한다", () => {
  const request = createRequest({
    requestId: "../run",
    contractVersion: 2,
    questId: "Quest_Invalid",
    questRevision: 0,
    languageId: "python",
    suite: "private",
    source: "   ",
    entryPoint: "return",
    extra: true,
  });

  const errors = validateExecutionRequest(request);
  assert.ok(errors.some((error) => error.includes("허용되지 않은 필드") && error.includes("extra")));
  assert.ok(errors.some((error) => error.includes("requestId 형식")));
  assert.ok(errors.some((error) => error.includes("contractVersion")));
  assert.ok(errors.some((error) => error.includes("questId 형식")));
  assert.ok(errors.some((error) => error.includes("questRevision")));
  assert.ok(errors.some((error) => error.includes("languageId")));
  assert.ok(errors.some((error) => error.includes("suite")));
  assert.ok(errors.some((error) => error.includes("source")));
  assert.ok(errors.some((error) => error.includes("entryPoint")));
});

test("공개 테스트 ID, 선택 label, args 배열과 고정 필드를 검증한다", () => {
  const request = createRequest({
    tests: [
      { id: "bad/id", label: " ", args: "not-an-array", expected: null, extra: true },
      { id: "duplicate-case", args: [], expected: 1 },
      { id: "duplicate-case", args: [], expected: 2 },
    ],
  });

  const errors = validateExecutionRequest(request);
  assert.ok(errors.some((error) => error.includes("tests[0]") && error.includes("extra")));
  assert.ok(errors.some((error) => error.includes("tests[0].id 형식")));
  assert.ok(errors.some((error) => error.includes("tests[0].label")));
  assert.ok(errors.some((error) => error.includes("tests[0].args는 배열")));
  assert.ok(errors.some((error) => error.includes("공개 테스트 ID가 중복")));
});

test("args와 expected에서 순환 없는 JSON 호환 값과 유한한 number만 허용한다", () => {
  const circular = {};
  circular.self = circular;
  const sparse = new Array(1);

  const request = createRequest({
    tests: [
      { id: "public-non-finite", args: [Number.POSITIVE_INFINITY], expected: null },
      { id: "public-circular", args: [], expected: circular },
      { id: "public-sparse", args: sparse, expected: null },
      { id: "public-undefined", args: [], expected: undefined },
      { id: "public-bigint", args: [], expected: 1n },
      { id: "public-special-object", args: [new Date(0)], expected: null },
    ],
  });

  const errors = validateExecutionRequest(request);
  assert.ok(errors.some((error) => error.includes("유한한 number")));
  assert.ok(errors.some((error) => error.includes("순환 참조")));
  assert.ok(errors.some((error) => error.includes("비어 있는 배열 항목")));
  assert.ok(errors.some((error) => error.includes("undefined 값")));
  assert.ok(errors.some((error) => error.includes("bigint 값")));
  assert.ok(errors.some((error) => error.includes("일반 객체")));
});

test("실행 요청 JSON은 런타임과 같은 컨테이너 512단계 경계를 적용한다", () => {
  const boundaryRequest = createRequest({
    tests: [
      {
        id: "public-depth-boundary",
        args: [],
        expected: createNestedArrays(512),
      },
    ],
  });
  const tooDeepRequest = createRequest({
    tests: [
      {
        id: "public-depth-overflow",
        args: [],
        expected: createNestedArrays(513),
      },
    ],
  });

  assert.deepEqual(validateExecutionRequest(boundaryRequest), []);
  assert.doesNotThrow(() => createExecutionRequestSnapshot(boundaryRequest));
  assert.ok(
    validateExecutionRequest(tooDeepRequest).some(
      (error) => error.includes("expected") && error.includes("깊게 중첩"),
    ),
  );
  assert.throws(
    () => createExecutionRequestSnapshot(tooDeepRequest),
    /expected.*깊게 중첩/,
  );

  const argsBoundaryRequest = createRequest({
    tests: [
      {
        id: "public-args-depth-boundary",
        args: createNestedArrays(512),
        expected: null,
      },
    ],
  });
  const argsTooDeepRequest = createRequest({
    tests: [
      {
        id: "public-args-depth-overflow",
        args: createNestedArrays(10_000),
        expected: null,
      },
    ],
  });

  assert.deepEqual(validateExecutionRequest(argsBoundaryRequest), []);
  assert.doesNotThrow(() => createExecutionRequestSnapshot(argsBoundaryRequest));
  assert.doesNotThrow(() => validateExecutionRequest(argsTooDeepRequest));
  assert.ok(
    validateExecutionRequest(argsTooDeepRequest).some(
      (error) => error.includes("args") && error.includes("깊게 중첩"),
    ),
  );
});

test("source, 테스트 수와 테스트별 입출력 크기를 바이트 경계에서 제한한다", () => {
  const sourceAtLimit = "a".repeat(DEFAULT_EXECUTION_LIMITS.maxSourceBytes);
  const inputAtLimit = "i".repeat(DEFAULT_EXECUTION_LIMITS.maxInputBytesPerTest - 4);
  const outputAtLimit = "o".repeat(DEFAULT_EXECUTION_LIMITS.maxOutputBytesPerTest - 2);
  const boundaryRequest = createRequest({
    source: sourceAtLimit,
    tests: [
      {
        id: "public-byte-boundary",
        args: [inputAtLimit],
        expected: outputAtLimit,
      },
    ],
  });
  assert.deepEqual(validateExecutionRequest(boundaryRequest), []);

  const overLimitRequest = createRequest({
    source: `${sourceAtLimit}a`,
    tests: [
      {
        id: "public-byte-overflow",
        args: [`${inputAtLimit}i`],
        expected: `${outputAtLimit}o`,
      },
    ],
  });
  const sizeErrors = validateExecutionRequest(overLimitRequest);
  assert.ok(sizeErrors.some((error) => error.includes("source의 UTF-8 크기")));
  assert.ok(sizeErrors.some((error) => error.includes("args의 JSON 크기")));
  assert.ok(sizeErrors.some((error) => error.includes("expected의 JSON 크기")));

  const tooManyTests = createRequest({
    tests: Array.from({ length: DEFAULT_EXECUTION_LIMITS.maxTests + 1 }, (_, index) => ({
      id: `public-limit-${index + 1}`,
      args: [],
      expected: null,
    })),
  });
  assert.ok(validateExecutionRequest(tooManyTests).some((error) => error.includes("최대 20개")));
});

test("alias DAG 입출력은 JSON 확장 크기가 한도를 넘는 즉시 거부한다", () => {
  const expandedDag = createSharedDag(20);
  const errors = validateExecutionRequest(
    createRequest({
      tests: [
        {
          id: "public-alias-dag-limit",
          args: [expandedDag],
          expected: expandedDag,
        },
      ],
    }),
  );

  assert.ok(
    errors.some(
      (error) =>
        error.includes("args의 JSON 크기") && error.includes("최소 16385바이트"),
    ),
  );
  assert.ok(
    errors.some(
      (error) =>
        error.includes("expected의 JSON 크기") && error.includes("최소 16385바이트"),
    ),
  );
});

test("사용자 지정 실행 제한도 양의 안전한 정수로 검증한다", () => {
  const request = createRequest({ source: "12345" });

  assert.ok(
    validateExecutionRequest(request, { maxSourceBytes: 4 }).some((error) =>
      error.includes("source의 UTF-8 크기"),
    ),
  );
  assert.ok(
    validateExecutionRequest(request, { maxTests: 0 }).some((error) =>
      error.includes("maxTests"),
    ),
  );
  assert.ok(
    validateExecutionRequest(request, { unknownLimit: 1 }).some((error) =>
      error.includes("허용되지 않은 실행 제한"),
    ),
  );
});

test("assert 검증 오류는 필드별 한국어 원인을 함께 제공한다", () => {
  assert.throws(
    () => assertValidExecutionRequest(createRequest({ source: "", tests: [] })),
    /코드 실행 요청 검증 실패:\n- source는 비어 있지 않은 문자열.*\n- tests에는 한 개 이상의 공개 테스트/s,
  );
});

test("테스트별 outcome을 세고 전체 outcome 우선순위를 적용한다", () => {
  const results = Object.values(GRADING_OUTCOMES).map((outcome) => ({ outcome }));

  assert.deepEqual(summarizeTestResults(results), {
    outcome: "cancelled",
    total: 9,
    passed: 1,
    wrong_answer: 1,
    syntax_error: 1,
    runtime_error: 1,
    timeout: 1,
    output_limit: 1,
    cancelled: 1,
    engine_error: 1,
    not_run: 1,
  });

  const priority = [
    "cancelled",
    "engine_error",
    "timeout",
    "output_limit",
    "syntax_error",
    "runtime_error",
    "wrong_answer",
    "passed",
  ];
  for (let index = 0; index < priority.length - 1; index += 1) {
    assert.equal(
      summarizeTestResults([
        { outcome: priority[index + 1] },
        { outcome: priority[index] },
      ]).outcome,
      priority[index],
    );
  }
});

test("미실행·빈 결과를 not_run으로 요약하고 알 수 없는 outcome을 거부한다", () => {
  assert.equal(summarizeTestResults([]).outcome, "not_run");
  assert.equal(
    summarizeTestResults([{ outcome: "passed" }, { outcome: "not_run" }]).outcome,
    "not_run",
  );
  assert.throws(() => summarizeTestResults([{ outcome: "completed" }]), /outcome/);
  assert.throws(() => summarizeTestResults(null), /결과 배열/);
});
