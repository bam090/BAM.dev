import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LIMITS,
  executeJavaScriptTest,
} from "../src/grading/javascript-runtime.js";
import {
  createOneShotJavaScriptRunner,
  handleJavaScriptRunnerMessage,
} from "../src/workers/javascript-code-runner.worker.js";

const execute = (source, args = [], limits = {}) =>
  executeJavaScriptTest({
    source,
    entryPoint: "solution",
    args,
    limits: { ...DEFAULT_LIMITS, ...limits },
  });

const WORKER_LIMITS = Object.freeze({
  maxOutputBytes: DEFAULT_LIMITS.maxOutputBytes,
  maxConsoleEntries: DEFAULT_LIMITS.maxConsoleEntries,
  maxConsoleBytes: DEFAULT_LIMITS.maxConsoleBytes,
});

test("동기 함수의 반환값과 네 종류의 console preview를 캡처한다", async () => {
  const result = await execute(
    `
      function solution(left, right) {
        console.log("입력", left, right);
        console.info({ total: left + right });
        console.warn("확인");
        console.error("연습 오류 메시지");
        return { total: left + right, values: [left, right] };
      }
    `,
    [2, 3],
  );

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.value, { total: 5, values: [2, 3] });
  assert.deepEqual(result.console, [
    { method: "log", preview: "입력 2 3" },
    { method: "info", preview: '{"total":5}' },
    { method: "warn", preview: "확인" },
    { method: "error", preview: "연습 오류 메시지" },
  ]);
});

test("Promise를 반환하는 async 함수를 기다린다", async () => {
  const result = await execute(
    `async function solution(value) {
      await Promise.resolve();
      return value * 2;
    }`,
    [4],
  );

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 8);
});

test("동적 컴파일의 SyntaxError만 syntax_error로 분류한다", async () => {
  const result = await execute("function solution( { return 1; }");

  assert.equal(result.outcome, "syntax_error");
  assert.equal(result.error.name, "SyntaxError");
  assert.match(result.error.learnerMessage, /문법/);
});

test("사용자 실행 중 던진 SyntaxError는 runtime_error로 분류한다", async () => {
  const result = await execute(`function solution() {
    const error = new SyntaxError("실행 중 만든 오류");
    throw error;
  }`);

  assert.equal(result.outcome, "runtime_error");
  assert.equal(result.error.name, "SyntaxError");
  assert.equal(result.error.message, "실행 중 만든 오류");
});

test("비동기 rejection과 누락된 함수를 runtime_error로 분류한다", async (t) => {
  await t.test("rejection", async () => {
    const result = await execute(`async function solution() {
      throw new TypeError("비동기 실행 실패");
    }`);
    assert.equal(result.outcome, "runtime_error");
    assert.equal(result.error.name, "TypeError");
    assert.match(result.error.learnerMessage, /값의 종류/);
  });

  await t.test("missing entry point", async () => {
    const result = await execute("const anotherFunction = () => 1;");
    assert.equal(result.outcome, "runtime_error");
    assert.equal(result.error.name, "ReferenceError");
    assert.match(result.error.learnerMessage, /함수/);
  });
});

test("source 최상위 return으로 entryPoint 확인을 우회할 수 없다", async () => {
  const result = await execute("return () => 42;");

  assert.equal(result.outcome, "syntax_error");
  assert.equal(result.error.name, "SyntaxError");
  assert.match(result.error.learnerMessage, /문법/);
});

test("strict FunctionBody에서 유효한 최상위 arguments와 await 식별자를 허용한다", async (t) => {
  await t.test("arguments", async () => {
    const result = await execute(`
      const factoryArgumentCount = arguments.length;
      function solution() { return factoryArgumentCount; }
    `);

    assert.equal(result.outcome, "completed");
    assert.equal(result.value, 1);
  });

  await t.test("var await", async () => {
    const result = await execute(`
      var await = 41;
      function solution() { return await + 1; }
    `);

    assert.equal(result.outcome, "completed");
    assert.equal(result.value, 42);
  });
});

test("문자열·템플릿·주석과 중첩 함수의 return은 최상위 return으로 오인하지 않는다", async () => {
  const result = await execute(`
    const text = "return";
    const template = \`return \${text}\`;
    // return은 이 주석에서 실행되지 않는다.
    /* return 역시 이 주석에서 실행되지 않는다. */
    function* values() { yield 1; return 2; }
    class Counter { value() { return [...values()][0]; } }
    function solution() { return new Counter().value() + template.length; }
  `);

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 14);
});

test("ambient eval 변조와 무관하게 캡처한 구문 검사기를 사용한다", async () => {
  const originalEval = globalThis.eval;
  let result;

  try {
    globalThis.eval = () => {
      throw new Error("ambient eval must not run");
    };
    result = await execute("function solution() { return 42; }");
  } finally {
    globalThis.eval = originalEval;
  }

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 42);
});

test("구문 검사 source가 검사 문맥을 탈출하거나 코드를 실행할 수 없다", async () => {
  const markerKey = "__bamSyntaxPrecheckEscape";
  delete globalThis[markerKey];

  try {
    const result = await execute(`}
      globalThis.${markerKey} = true;
    {`);

    assert.equal(result.outcome, "syntax_error");
    assert.equal(globalThis[markerKey], undefined);
  } finally {
    delete globalThis[markerKey];
  }
});

test("콘솔 출력 횟수와 바이트 제한 초과를 output_limit으로 반환한다", async (t) => {
  await t.test("entry count", async () => {
    const result = await execute(
      `function solution() {
        console.log("하나");
        console.log("둘");
        return 0;
      }`,
      [],
      { maxConsoleEntries: 1 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "console_entries");
    assert.equal(result.console.length, 1);
  });

  await t.test("UTF-8 byte count", async () => {
    const result = await execute(
      `function solution() {
        console.log("가나");
        return 0;
      }`,
      [],
      { maxConsoleBytes: 5 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "console_bytes");
    assert.deepEqual(result.console, [{ method: "log", preview: "가" }]);
  });
});

test("반환값의 크기와 JSON 비호환 값을 output_limit으로 반환한다", async (t) => {
  await t.test("output bytes", async () => {
    const result = await execute(
      `function solution() { return "길이가 긴 반환값"; }`,
      [],
      { maxOutputBytes: 5 },
    );
    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_bytes");
  });

  for (const [name, source] of [
    ["undefined", "function solution() { return undefined; }"],
    ["non-finite", "function solution() { return Infinity; }"],
    ["BigInt", "function solution() { return 1n; }"],
    ["sparse array", "function solution() { return Array(1); }"],
    [
      "circular",
      "function solution() { const value = {}; value.self = value; return value; }",
    ],
  ]) {
    await t.test(name, async () => {
      const result = await execute(source);
      assert.equal(result.outcome, "output_limit");
      assert.equal(result.limit.kind, "return_value");
      assert.match(result.error.learnerMessage, /JSON/);
    });
  }
});

test("JSON 반환값은 컨테이너 512단계까지만 정규화한다", async () => {
  const accepted = await execute(`function solution() {
    let value = 0;
    for (let depth = 0; depth < 512; depth += 1) value = [value];
    return value;
  }`);
  const rejected = await execute(`function solution() {
    let value = 0;
    for (let depth = 0; depth < 513; depth += 1) value = [value];
    return value;
  }`);

  assert.equal(accepted.outcome, "completed");
  assert.equal(rejected.outcome, "output_limit");
  assert.equal(rejected.limit.kind, "return_value");
  assert.match(rejected.error.message, /깊게 중첩/);
});

test("큰 alias DAG 반환값은 확장 전에 바이트 제한으로 중단한다", async () => {
  const counterKey = "__bamRuntimeDagOwnKeys";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(
      `
        globalThis.${counterKey} = 0;
        const handler = {
          ownKeys(target) {
            globalThis.${counterKey} += 1;
            return Reflect.ownKeys(target);
          },
        };
        let shared = new Proxy({ leaf: 0 }, handler);
        for (let depth = 0; depth < 20; depth += 1) {
          shared = new Proxy({ left: shared, right: shared }, handler);
        }
        function solution() { return shared; }
      `,
      [],
      { maxOutputBytes: 128 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_bytes");
    assert.ok(
      globalThis[counterKey] < 200,
      `ownKeys가 ${globalThis[counterKey]}회 호출되었습니다.`,
    );
  } finally {
    delete globalThis[counterKey];
  }
});

test("큰 alias DAG console preview도 stringify 전에 바이트 제한으로 중단한다", async () => {
  const counterKey = "__bamRuntimeConsoleDagOwnKeys";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(
      `
        globalThis.${counterKey} = 0;
        const handler = {
          ownKeys(target) {
            globalThis.${counterKey} += 1;
            return Reflect.ownKeys(target);
          },
        };
        let shared = new Proxy({ leaf: 0 }, handler);
        for (let depth = 0; depth < 20; depth += 1) {
          shared = new Proxy({ left: shared, right: shared }, handler);
        }
        function solution() {
          console.log(shared);
          return 0;
        }
      `,
      [],
      { maxConsoleBytes: 128 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "console_bytes");
    assert.ok(
      globalThis[counterKey] < 200,
      `ownKeys가 ${globalThis[counterKey]}회 호출되었습니다.`,
    );
  } finally {
    delete globalThis[counterKey];
  }
});

test("많은 긴 console 인수는 남은 바이트 예산이 끝나면 즉시 순회를 멈춘다", async () => {
  const counterKey = "__bamRuntimeConsoleRemainingArgs";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(
      `
        globalThis.${counterKey} = 0;
        const longText = "x".repeat(8 * 1024);
        const values = Array(20_000).fill(longText);
        values.push(new Proxy({ ignored: true }, {
          ownKeys(target) {
            globalThis.${counterKey} += 1;
            return Reflect.ownKeys(target);
          },
        }));
        function solution() {
          console.log(...values);
          return 0;
        }
      `,
      [],
      { maxConsoleBytes: 128 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "console_bytes");
    assert.deepEqual(result.console, [{ method: "log", preview: "x".repeat(128) }]);
    assert.equal(globalThis[counterKey], 0);
  } finally {
    delete globalThis[counterKey];
  }
});

test("엄격 JSON preflight 실패도 alias DAG 정규화로 재진입하지 않는다", async () => {
  const counterKey = "__bamRuntimeRejectedDagOwnKeys";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(
      `
        globalThis.${counterKey} = 0;
        const handler = {
          ownKeys(target) {
            globalThis.${counterKey} += 1;
            return Reflect.ownKeys(target);
          },
        };
        let shared = new Proxy({ leaf: 0 }, handler);
        for (let depth = 0; depth < 18; depth += 1) {
          shared = new Proxy({ left: shared, right: shared }, handler);
        }
        Object.defineProperty(shared, "ignored", {
          enumerable: false,
          value: true,
        });
        function solution() { return shared; }
      `,
      [],
      { maxOutputBytes: 128 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_value");
    assert.ok(
      globalThis[counterKey] < 100,
      `ownKeys가 ${globalThis[counterKey]}회 호출되었습니다.`,
    );
  } finally {
    delete globalThis[counterKey];
  }
});

test("stateful Proxy가 normalize 때 공개한 alias DAG도 stringify 전에 다시 제한한다", async () => {
  const counterKey = "__bamRuntimeChangingProxyOwnKeys";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(
      `
        globalThis.${counterKey} = 0;
        let shared = { leaf: 0 };
        for (let depth = 0; depth < 20; depth += 1) {
          shared = { left: shared, right: shared };
        }
        const target = { small: 0, large: shared };
        const changing = new Proxy(target, {
          ownKeys() {
            globalThis.${counterKey} += 1;
            return globalThis.${counterKey} <= 2 ? ["small"] : ["large"];
          },
          getOwnPropertyDescriptor(object, key) {
            return Object.getOwnPropertyDescriptor(object, key);
          },
        });
        function solution() { return changing; }
      `,
      [],
      { maxOutputBytes: 128 },
    );

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_bytes");
    assert.ok(
      globalThis[counterKey] < 20,
      `ownKeys가 ${globalThis[counterKey]}회 호출되었습니다.`,
    );
  } finally {
    delete globalThis[counterKey];
  }
});

test("Proxy 배열 반환값의 length get trap을 실행하지 않는다", async () => {
  const counterKey = "__bamRuntimeArrayLengthGets";
  delete globalThis[counterKey];

  let result;
  try {
    result = await execute(`
      globalThis.${counterKey} = 0;
      const values = new Proxy([1, 2], {
        get(target, key, receiver) {
          if (key === "length") globalThis.${counterKey} += 1;
          return Reflect.get(target, key, receiver);
        },
      });
      function solution() { return values; }
    `);

    assert.equal(result.outcome, "completed");
    assert.deepEqual(result.value, [1, 2]);
    assert.equal(globalThis[counterKey], 0);
  } finally {
    delete globalThis[counterKey];
  }
});

test("직접 호출의 초심도 args를 bounded engine_error로 거부한다", async () => {
  let nested = 0;
  for (let depth = 0; depth < 10_000; depth += 1) nested = [nested];

  const result = await executeJavaScriptTest({
    source: "function solution(value) { return value; }",
    entryPoint: "solution",
    args: nested,
    limits: DEFAULT_LIMITS,
  });

  assert.equal(result.outcome, "engine_error");
  assert.equal(result.error.name, "InputError");
  assert.match(result.error.learnerMessage, /테스트 입력/);
  assert.ok(new TextEncoder().encode(result.error.message).byteLength <= 1024);
});

test("__proto__ 키를 prototype 변경 없이 JSON 값으로 정규화한다", async () => {
  const result = await execute(`function solution() {
    const value = {};
    Object.defineProperty(value, "__proto__", {
      enumerable: true,
      value: { safe: true },
    });
    return value;
  }`);

  assert.equal(result.outcome, "completed");
  assert.equal(Object.hasOwn(result.value, "__proto__"), true);
  assert.deepEqual(result.value.__proto__, { safe: true });
  assert.equal(Object.getPrototypeOf(result.value), Object.prototype);
});

test("학습자 코드가 JSON 메서드를 바꿔도 실제 반환값을 오판하지 않는다", async () => {
  const originalStringify = JSON.stringify;
  const originalParse = JSON.parse;
  let result;

  try {
    result = await execute(`function solution() {
      JSON.stringify = () => "5";
      JSON.parse = () => 5;
      return 0;
    }`);
  } finally {
    JSON.stringify = originalStringify;
    JSON.parse = originalParse;
  }

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 0);
});

test("mutable JSON 후처리 intrinsic과 Array toJSON 변조를 무시한다", async () => {
  const originalObjectKeys = Object.keys;
  const originalObjectGetPrototypeOf = Object.getPrototypeOf;
  const originalArrayIsArray = Array.isArray;
  const originalNumberIsFinite = Number.isFinite;
  const originalToJsonDescriptor = Object.getOwnPropertyDescriptor(
    Array.prototype,
    "toJSON",
  );
  let result;

  try {
    result = await execute(`
      Object.keys = () => [];
      Object.getPrototypeOf = () => null;
      Array.isArray = () => false;
      Number.isFinite = () => true;
      Array.prototype.toJSON = () => 5;
      function solution() { return { answer: [0] }; }
    `);
  } finally {
    Object.keys = originalObjectKeys;
    Object.getPrototypeOf = originalObjectGetPrototypeOf;
    Array.isArray = originalArrayIsArray;
    Number.isFinite = originalNumberIsFinite;
    if (originalToJsonDescriptor) {
      Object.defineProperty(Array.prototype, "toJSON", originalToJsonDescriptor);
    } else {
      delete Array.prototype.toJSON;
    }
  }

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.value, { answer: [0] });
});

test("descriptor의 inherited value가 getter 반환값으로 오판되지 않는다", async () => {
  const valueDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "value");
  let result;

  try {
    result = await execute(`function solution() {
      const returned = {};
      Object.defineProperty(returned, "answer", {
        enumerable: true,
        get() { return 0; },
      });
      Object.prototype.value = 5;
      return returned;
    }`);
  } finally {
    if (valueDescriptor) Object.defineProperty(Object.prototype, "value", valueDescriptor);
    else delete Object.prototype.value;
  }

  assert.equal(result.outcome, "output_limit");
  assert.equal(result.limit.kind, "return_value");
});

test("Object.prototype.then 변조가 실행기 결과를 thenable로 바꾸지 않는다", async () => {
  const originalThenDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "then");
  let result;

  try {
    result = await execute(`function solution() {
      Object.defineProperty(Object.prototype, "then", {
        configurable: true,
        value(resolve) {
          const forged = Object.create(null);
          forged.outcome = "completed";
          forged.value = 5;
          forged.console = [];
          resolve(forged);
        },
      });
      return 0;
    }`);
  } finally {
    if (originalThenDescriptor) {
      Object.defineProperty(Object.prototype, "then", originalThenDescriptor);
    } else {
      delete Object.prototype.then;
    }
  }

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 0);
});

test("동기 일반 객체는 inherited then이 있어도 Promise처럼 동화하지 않는다", async () => {
  const originalThenDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "then");
  let result;

  try {
    result = await execute(`function solution() {
      Object.defineProperty(Object.prototype, "then", {
        configurable: true,
        value(resolve) { resolve(999); },
      });
      return { answer: 1 };
    }`);
  } finally {
    if (originalThenDescriptor) {
      Object.defineProperty(Object.prototype, "then", originalThenDescriptor);
    } else {
      delete Object.prototype.then;
    }
  }

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.value, { answer: 1 });
});

test("동기 JSON 객체의 own then 필드는 일반 데이터로 보존한다", async () => {
  const result = await execute(`function solution() {
    return { then: "학습 데이터", answer: 1 };
  }`);

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.value, { then: "학습 데이터", answer: 1 });
});

test("동기 객체의 callable own then도 Promise로 실행하지 않고 JSON 오류로 처리한다", async () => {
  const result = await execute(`function solution() {
    return {
      answer: 1,
      then(resolve) { resolve(999); },
    };
  }`);

  assert.equal(result.outcome, "output_limit");
  assert.equal(result.limit.kind, "return_value");
});

test("Promise prototype을 위조한 일반 객체는 실제 Promise로 판별하지 않는다", async () => {
  const thenDescriptor = Object.getOwnPropertyDescriptor(Promise.prototype, "then");
  let result;

  try {
    result = await execute(`function solution() {
      Promise.prototype.then = (resolve) => resolve(999);
      return Object.create(Promise.prototype);
    }`);
  } finally {
    Object.defineProperty(Promise.prototype, "then", thenDescriptor);
  }

  assert.equal(result.outcome, "output_limit");
  assert.equal(result.limit.kind, "return_value");
});

test("동기 함수가 반환한 실제 Promise도 완료될 때까지 기다린다", async () => {
  const result = await execute(`function solution() {
    return Promise.resolve({ answer: 1 });
  }`);

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.value, { answer: 1 });
});

test("structuredClone 변조 전에 인수를 복제한다", async () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "structuredClone");
  let result;

  try {
    result = await execute(
      `
        globalThis.structuredClone = () => [41];
        function solution(value) { return value + 1; }
      `,
      [1],
    );
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "structuredClone", originalDescriptor);
    } else {
      delete globalThis.structuredClone;
    }
  }

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 2);
});

test("Array iterator 변조가 복제한 테스트 인수를 바꾸지 않는다", async () => {
  const iteratorDescriptor = Object.getOwnPropertyDescriptor(
    Array.prototype,
    Symbol.iterator,
  );
  let result;

  try {
    result = await execute(
      `Array.prototype[Symbol.iterator] = function* () { yield 999; };
       function solution(value) { return value; }`,
      [1],
    );
  } finally {
    Object.defineProperty(Array.prototype, Symbol.iterator, iteratorDescriptor);
  }

  assert.equal(result.outcome, "completed");
  assert.equal(result.value, 1);
});

test("TextEncoder와 Math·String 변조로 출력 바이트 제한을 우회하지 못한다", async (t) => {
  await t.test("return bytes", async () => {
    const originalEncodeDescriptor = Object.getOwnPropertyDescriptor(
      TextEncoder.prototype,
      "encode",
    );
    let result;
    try {
      result = await execute(
        `function solution() {
          TextEncoder.prototype.encode = () => ({ byteLength: 0 });
          return "가나다";
        }`,
        [],
        { maxOutputBytes: 2 },
      );
    } finally {
      Object.defineProperty(TextEncoder.prototype, "encode", originalEncodeDescriptor);
    }

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_bytes");
  });

  await t.test("typed array byteLength getter", async () => {
    const byteLengthDescriptor = Object.getOwnPropertyDescriptor(
      Uint8Array.prototype,
      "byteLength",
    );
    let result;

    try {
      result = await execute(
        `function solution() {
          Object.defineProperty(Uint8Array.prototype, "byteLength", {
            configurable: true,
            get() { return 0; },
          });
          return "가나다";
        }`,
        [],
        { maxOutputBytes: 2 },
      );
    } finally {
      if (byteLengthDescriptor) {
        Object.defineProperty(Uint8Array.prototype, "byteLength", byteLengthDescriptor);
      } else {
        delete Uint8Array.prototype.byteLength;
      }
    }

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "return_bytes");
  });

  await t.test("console bytes", async () => {
    const originalMathMax = Math.max;
    const originalString = globalThis.String;
    let result;
    try {
      result = await execute(
        `function solution() {
          Math.max = () => 1_000_000;
          globalThis.String = () => "";
          console.log(12345);
          return 0;
        }`,
        [],
        { maxConsoleBytes: 1 },
      );
    } finally {
      Math.max = originalMathMax;
      globalThis.String = originalString;
    }

    assert.equal(result.outcome, "output_limit");
    assert.equal(result.limit.kind, "console_bytes");
  });
});

test("console preview는 비순환 공유 참조를 순환 참조로 오판하지 않는다", async () => {
  const result = await execute(`function solution() {
    const shared = { value: 1 };
    console.log({ left: shared, right: shared });
    return 0;
  }`);

  assert.deepEqual(result.console, [
    { method: "log", preview: '{"left":{"value":1},"right":{"value":1}}' },
  ]);
});

test("globalThis.console도 외부 console 대신 같은 캡처와 용량 제한을 사용한다", async () => {
  const originalConsole = globalThis.console;
  const externalLogs = [];
  let result;

  globalThis.console = {
    ...originalConsole,
    log: (...values) => externalLogs.push(values),
  };

  try {
    result = await execute(
      `function solution() {
        globalThis.console.log("첫 번째");
        globalThis.console.log("두 번째");
        return 0;
      }`,
      [],
      { maxConsoleEntries: 1 },
    );
  } finally {
    globalThis.console = originalConsole;
  }

  assert.deepEqual(externalLogs, []);
  assert.equal(result.outcome, "output_limit");
  assert.equal(result.limit.kind, "console_entries");
  assert.deepEqual(result.console, [{ method: "log", preview: "첫 번째" }]);
});

test("OutputLimitError 필드는 inherited setter의 영향을 받지 않는다", async () => {
  const kindDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "kind");
  let result;

  try {
    result = await execute(
      `function solution() {
        Object.defineProperty(Object.prototype, "kind", {
          configurable: true,
          set() { throw new Error("kind setter must not run"); },
        });
        console.log("너무 긴 출력");
        return 0;
      }`,
      [],
      { maxConsoleBytes: 1 },
    );
  } finally {
    if (kindDescriptor) Object.defineProperty(Object.prototype, "kind", kindDescriptor);
    else delete Object.prototype.kind;
  }

  assert.equal(result.outcome, "output_limit");
  assert.equal(result.limit.kind, "console_bytes");
});

test("동적 컴파일 capability 오류는 학습자 runtime_error가 아닌 engine_error다", async () => {
  const result = await executeJavaScriptTest(
    {
      source: "function solution() { return 1; }",
      entryPoint: "solution",
      args: [],
      limits: DEFAULT_LIMITS,
    },
    {
      compileFunction() {
        throw new EvalError("unsafe-eval is blocked by Content Security Policy");
      },
    },
  );

  assert.equal(result.outcome, "engine_error");
  assert.equal(result.error.name, "EvalError");
  assert.match(result.error.learnerMessage, /실행기|브라우저|설정/);
});

test("실행마다 함수 상태와 전달 인수를 새로 초기화한다", async () => {
  const source = `
    let calls = 0;
    function solution(input) {
      calls += 1;
      input.count += 1;
      return { calls, count: input.count };
    }
  `;
  const args = [{ count: 0 }];

  const first = await execute(source, args);
  const second = await execute(source, args);

  assert.deepEqual(first.value, { calls: 1, count: 1 });
  assert.deepEqual(second.value, { calls: 1, count: 1 });
  assert.deepEqual(args, [{ count: 0 }]);
});

test("오류 메시지를 제한하고 학습자용 한국어 설명을 함께 반환한다", async () => {
  const result = await execute(
    `function solution() { throw new Error("x".repeat(200)); }`,
    [],
    { maxErrorMessageBytes: 40 },
  );

  assert.equal(result.outcome, "runtime_error");
  assert.ok(new TextEncoder().encode(result.error.message).byteLength <= 40);
  assert.ok(new TextEncoder().encode(result.error.learnerMessage).byteLength <= 40);
  assert.match(result.error.learnerMessage, /코드를 실행/);
});

test("Worker 엔트리는 Node에서 import할 수 있고 결과 envelope를 보존한다", async () => {
  const messages = [];
  const handled = await handleJavaScriptRunnerMessage(
    {
      type: "execute",
      requestId: "request-test-1",
      testId: "public-test-1",
      workerToken: "worker-test-1",
      source: "function solution(value) { return value + 1; }",
      entryPoint: "solution",
      args: [2],
      limits: WORKER_LIMITS,
    },
    (message) => messages.push(message),
  );

  assert.equal(handled, true);
  assert.equal(Object.getPrototypeOf(messages[0].result), null);
  assert.deepEqual(
    messages.map((message) => ({
      ...message,
      result: { ...message.result },
    })),
    [
      {
        type: "result",
        requestId: "request-test-1",
        testId: "public-test-1",
        workerToken: "worker-test-1",
        result: { outcome: "completed", value: 3, console: [] },
      },
    ],
  );
  assert.equal(await handleJavaScriptRunnerMessage({ type: "ignore" }, () => {}), false);
});

test("Worker 전송 참조는 학습자 global 변조와 무관하고 실행은 one-shot이다", async () => {
  const postMessageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "postMessage");
  const closeDescriptor = Object.getOwnPropertyDescriptor(globalThis, "close");
  const messages = [];
  let completed = 0;
  const runOnce = createOneShotJavaScriptRunner(
    (message) => messages.push(message),
    { onComplete: () => { completed += 1; } },
  );
  const message = {
    type: "execute",
    requestId: "request-one-shot",
    testId: "public-one-shot",
    workerToken: "worker-one-shot",
    source: `function solution() {
      globalThis.postMessage = () => {};
      globalThis.close = () => {};
      return 1;
    }`,
    entryPoint: "solution",
    args: [],
    limits: WORKER_LIMITS,
  };

  try {
    assert.equal(await runOnce({ type: "execute" }), false);
    assert.equal(await runOnce(message), true);
    assert.equal(await runOnce({ ...message, testId: "public-second" }), false);
  } finally {
    if (postMessageDescriptor) {
      Object.defineProperty(globalThis, "postMessage", postMessageDescriptor);
    } else {
      delete globalThis.postMessage;
    }
    if (closeDescriptor) Object.defineProperty(globalThis, "close", closeDescriptor);
    else delete globalThis.close;
  }

  assert.equal(completed, 1);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].workerToken, "worker-one-shot");
  assert.equal(messages[0].result.outcome, "completed");
  assert.equal(messages[0].result.value, 1);
});

test("Worker envelope은 학습자가 바꾼 Reflect와 inherited setter를 사용하지 않는다", async (t) => {
  await t.test("Reflect.getOwnPropertyDescriptor", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Reflect, "getOwnPropertyDescriptor");
    const messages = [];

    try {
      const handled = await handleJavaScriptRunnerMessage(
        {
          type: "execute",
          requestId: "request-reflect",
          testId: "public-reflect",
          workerToken: "worker-reflect",
          source: `function solution() {
            Reflect.getOwnPropertyDescriptor = null;
            return 1;
          }`,
          entryPoint: "solution",
          args: [],
          limits: WORKER_LIMITS,
        },
        (message) => messages.push(message),
      );

      assert.equal(handled, true);
    } finally {
      Object.defineProperty(Reflect, "getOwnPropertyDescriptor", descriptor);
    }

    assert.equal(messages.length, 1);
    assert.equal(messages[0].workerToken, "worker-reflect");
    assert.equal(messages[0].result.value, 1);
  });

  await t.test("Object.prototype.workerToken setter", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, "workerToken");
    const messages = [];

    try {
      const handled = await handleJavaScriptRunnerMessage(
        {
          type: "execute",
          requestId: "request-setter",
          testId: "public-setter",
          workerToken: "worker-setter",
          source: `function solution() {
            Object.defineProperty(Object.prototype, "workerToken", {
              configurable: true,
              set() { throw new Error("inherited setter must not run"); },
            });
            return 1;
          }`,
          entryPoint: "solution",
          args: [],
          limits: WORKER_LIMITS,
        },
        (message) => messages.push(message),
      );

      assert.equal(handled, true);
    } finally {
      if (descriptor) Object.defineProperty(Object.prototype, "workerToken", descriptor);
      else delete Object.prototype.workerToken;
    }

    assert.equal(messages.length, 1);
    assert.equal(messages[0].workerToken, "worker-setter");
    assert.equal(messages[0].result.value, 1);
  });

  await t.test("Object.prototype.get data", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, "get");
    const messages = [];

    try {
      const handled = await handleJavaScriptRunnerMessage(
        {
          type: "execute",
          requestId: "request-descriptor",
          testId: "public-descriptor",
          workerToken: "worker-descriptor",
          source: `function solution() {
            Object.defineProperty(Object.prototype, "get", {
              configurable: true,
              value() { return undefined; },
            });
            return 1;
          }`,
          entryPoint: "solution",
          args: [],
          limits: WORKER_LIMITS,
        },
        (message) => messages.push(message),
      );

      assert.equal(handled, true);
    } finally {
      if (descriptor) Object.defineProperty(Object.prototype, "get", descriptor);
      else delete Object.prototype.get;
    }

    assert.equal(messages.length, 1);
    assert.equal(messages[0].workerToken, "worker-descriptor");
    assert.equal(messages[0].result.value, 1);
  });
});

test("Worker 모듈을 Window 문맥에서 import해도 실행 listener를 등록하지 않는다", async () => {
  const selfDescriptor = Object.getOwnPropertyDescriptor(globalThis, "self");
  const dedicatedDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "DedicatedWorkerGlobalScope",
  );
  let listenerRegistrations = 0;

  class FakeDedicatedWorkerGlobalScope {}
  const fakeWindow = {
    addEventListener() {
      listenerRegistrations += 1;
    },
    postMessage() {},
    close() {},
  };

  try {
    Object.defineProperty(globalThis, "self", {
      value: fakeWindow,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "DedicatedWorkerGlobalScope", {
      value: FakeDedicatedWorkerGlobalScope,
      configurable: true,
      writable: true,
    });
    await import("../src/workers/javascript-code-runner.worker.js?window-guard-regression");
  } finally {
    if (selfDescriptor) Object.defineProperty(globalThis, "self", selfDescriptor);
    else delete globalThis.self;
    if (dedicatedDescriptor) {
      Object.defineProperty(globalThis, "DedicatedWorkerGlobalScope", dedicatedDescriptor);
    } else {
      delete globalThis.DedicatedWorkerGlobalScope;
    }
  }

  assert.equal(listenerRegistrations, 0);
});
