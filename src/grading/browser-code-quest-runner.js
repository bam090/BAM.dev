import {
  DEFAULT_EXECUTION_LIMITS,
  areJsonValuesEqual,
  createExecutionRequestSnapshot,
  formatJsonValue,
  serializedJsonByteLength,
  summarizeTestResults,
  utf8ByteLength,
} from "./code-grading.js";

const WORKER_RESULT_OUTCOMES = new Set([
  "completed",
  "syntax_error",
  "runtime_error",
  "output_limit",
  "engine_error",
]);
const CONSOLE_METHODS = new Set(["log", "info", "warn", "error"]);
const ERROR_RESULT_OUTCOMES = new Set(["syntax_error", "runtime_error", "engine_error"]);
const ERROR_FIELD_MAX_BYTES = 1024;
const RESULT_FIELDS = Object.freeze({
  completed: new Set(["outcome", "value", "console"]),
  syntax_error: new Set(["outcome", "error", "console"]),
  runtime_error: new Set(["outcome", "error", "console"]),
  output_limit: new Set(["outcome", "error", "limit", "console"]),
  engine_error: new Set(["outcome", "error", "console"]),
});
const OUTPUT_LIMIT_FIELDS = Object.freeze({
  console_entries: "maxConsoleEntries",
  console_bytes: "maxConsoleBytes",
  return_bytes: "maxOutputBytes",
  return_value: null,
});
const objectHasOwn = Object.hasOwn.bind(Object);
const cloneStructuredValue =
  typeof globalThis.structuredClone === "function"
    ? globalThis.structuredClone.bind(globalThis)
    : null;

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function hasExactDataFields(value, expectedFields) {
  if (!isPlainRecord(value)) return false;

  let fields;
  try {
    fields = Reflect.ownKeys(value);
  } catch {
    return false;
  }
  if (
    fields.length !== expectedFields.size ||
    fields.some((field) => typeof field !== "string" || !expectedFields.has(field))
  ) {
    return false;
  }

  return fields.every((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    return descriptor?.enumerable === true && objectHasOwn(descriptor, "value");
  });
}

function isValidErrorDto(error) {
  const fields = new Set(["name", "message", "learnerMessage"]);
  if (!hasExactDataFields(error, fields)) return false;

  const values = ["name", "message", "learnerMessage"].map(
    (field) => Object.getOwnPropertyDescriptor(error, field).value,
  );
  return values.every(
    (value) => typeof value === "string" && utf8ByteLength(value) <= ERROR_FIELD_MAX_BYTES,
  );
}

function isValidConsoleDto(entries, limits) {
  if (!Array.isArray(entries)) return false;
  const lengthDescriptor = Object.getOwnPropertyDescriptor(entries, "length");
  const length = lengthDescriptor?.value;
  if (
    !Number.isSafeInteger(length) ||
    length < 0 ||
    length > limits.maxConsoleEntries
  ) {
    return false;
  }

  let totalBytes = 0;
  for (let index = 0; index < length; index += 1) {
    const entryDescriptor = Object.getOwnPropertyDescriptor(entries, String(index));
    if (!entryDescriptor?.enumerable || !objectHasOwn(entryDescriptor, "value")) return false;
    const entry = entryDescriptor.value;
    if (!hasExactDataFields(entry, new Set(["method", "preview"]))) return false;
    const method = Object.getOwnPropertyDescriptor(entry, "method").value;
    const preview = Object.getOwnPropertyDescriptor(entry, "preview").value;
    if (!CONSOLE_METHODS.has(method) || typeof preview !== "string") return false;
    totalBytes += utf8ByteLength(preview);
    if (totalBytes > limits.maxConsoleBytes) return false;
  }
  return true;
}

function isValidOutputLimitDto(limit, limits) {
  if (!isPlainRecord(limit)) return false;
  const kindDescriptor = Object.getOwnPropertyDescriptor(limit, "kind");
  if (!kindDescriptor?.enumerable || !objectHasOwn(kindDescriptor, "value")) return false;
  const kind = kindDescriptor.value;
  const limitField = OUTPUT_LIMIT_FIELDS[kind];
  if (limitField === undefined) return false;

  const expectedFields = new Set(limitField === null ? ["kind"] : ["kind", limitField]);
  if (!hasExactDataFields(limit, expectedFields)) return false;
  if (limitField === null) return true;

  const expectedValue =
    limitField === "maxOutputBytes" ? limits.maxOutputBytesPerTest : limits[limitField];
  return Object.getOwnPropertyDescriptor(limit, limitField).value === expectedValue;
}

function isValidWorkerResult(result, limits) {
  if (!isPlainRecord(result)) return false;
  const outcomeDescriptor = Object.getOwnPropertyDescriptor(result, "outcome");
  if (
    !outcomeDescriptor?.enumerable ||
    !objectHasOwn(outcomeDescriptor, "value") ||
    !WORKER_RESULT_OUTCOMES.has(outcomeDescriptor.value)
  ) {
    return false;
  }
  const outcome = outcomeDescriptor.value;
  const expectedFields = RESULT_FIELDS[outcome];
  if (!expectedFields || !hasExactDataFields(result, expectedFields)) return false;
  const consoleEntries = Object.getOwnPropertyDescriptor(result, "console").value;
  if (!isValidConsoleDto(consoleEntries, limits)) return false;

  if (outcome === "completed") {
    const completedValue = Object.getOwnPropertyDescriptor(result, "value").value;
    if (!areJsonValuesEqual(completedValue, completedValue)) {
      return false;
    }
    const outputBytes = serializedJsonByteLength(
      completedValue,
      limits.maxOutputBytesPerTest,
    );
    return outputBytes !== null && outputBytes <= limits.maxOutputBytesPerTest;
  }

  const error = Object.getOwnPropertyDescriptor(result, "error").value;
  if (!isValidErrorDto(error)) return false;
  if (ERROR_RESULT_OUTCOMES.has(outcome)) return true;
  const limit = Object.getOwnPropertyDescriptor(result, "limit").value;
  return outcome === "output_limit" && isValidOutputLimitDto(limit, limits);
}

function snapshotWorkerResult(result, limits) {
  if (!cloneStructuredValue || !isValidWorkerResult(result, limits)) return null;
  try {
    const snapshot = cloneStructuredValue(result);
    return isValidWorkerResult(snapshot, limits) ? snapshot : null;
  } catch {
    return null;
  }
}

function defaultNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function defaultWorkerFactory(workerUrl) {
  if (typeof Worker !== "function") {
    throw new Error("이 환경에서는 Web Worker를 사용할 수 없습니다.");
  }

  return new Worker(workerUrl, {
    name: "bam-code-quest-test",
    type: "module",
  });
}

let fallbackTokenSequence = 0;

function defaultTokenFactory() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackTokenSequence += 1;
  return `worker-${fallbackTokenSequence}`;
}

function mergeLimits(overrides) {
  if (
    overrides !== undefined &&
    (overrides === null ||
      typeof overrides !== "object" ||
      Array.isArray(overrides) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(overrides)))
  ) {
    throw new TypeError("실행 제한 설정은 일반 객체여야 합니다.");
  }

  const unknownNames = Object.keys(overrides ?? {}).filter(
    (name) => !Object.hasOwn(DEFAULT_EXECUTION_LIMITS, name),
  );
  if (unknownNames.length > 0) {
    throw new TypeError(`허용되지 않은 실행 제한이 있습니다: ${unknownNames.join(", ")}`);
  }

  const limits = { ...DEFAULT_EXECUTION_LIMITS, ...overrides };

  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`실행 제한 ${name}은 0보다 큰 안전한 정수여야 합니다.`);
    }
  }

  return Object.freeze(limits);
}

function isAbortSignal(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.aborted === "boolean" &&
    typeof value.addEventListener === "function" &&
    typeof value.removeEventListener === "function"
  );
}

function createError(type, message, learnerMessage = message) {
  return {
    type,
    message,
    learnerMessage,
  };
}

function createBaseTestResult(test) {
  return {
    testId: test.id,
    label: test.label ?? null,
    expected: test.expected,
    expectedDisplay: formatJsonValue(test.expected),
    actual: null,
    actualDisplay: null,
    hasActual: false,
    durationMs: 0,
    console: [],
    error: null,
  };
}

function createNotRunResult(test) {
  return {
    ...createBaseTestResult(test),
    outcome: "not_run",
  };
}

function createStoppedResult(test, outcome, message) {
  return {
    ...createBaseTestResult(test),
    outcome,
    error: createError(outcome, message),
  };
}

function roundDuration(value) {
  return Math.max(0, Math.round(value * 10) / 10);
}

/**
 * Browser implementation of the replaceable Code Quest grading port.
 *
 * A future server grader can expose the same `run(request, { signal })`
 * method and return the same report shape without exposing Worker details to
 * the caller.
 */
export class BrowserCodeQuestRunner {
  constructor({
    workerUrl = new URL("../workers/javascript-code-runner.worker.js", import.meta.url),
    workerFactory = defaultWorkerFactory,
    limits,
    now = defaultNow,
    setTimeoutFn = (handler, delay) => globalThis.setTimeout(handler, delay),
    clearTimeoutFn = (timerId) => globalThis.clearTimeout(timerId),
    tokenFactory = defaultTokenFactory,
  } = {}) {
    if (typeof workerFactory !== "function") {
      throw new TypeError("workerFactory는 함수여야 합니다.");
    }
    if (typeof now !== "function") {
      throw new TypeError("now는 함수여야 합니다.");
    }
    if (typeof setTimeoutFn !== "function" || typeof clearTimeoutFn !== "function") {
      throw new TypeError("타이머 함수가 필요합니다.");
    }
    if (typeof tokenFactory !== "function") {
      throw new TypeError("tokenFactory는 함수여야 합니다.");
    }

    this.workerUrl = workerUrl;
    this.workerFactory = workerFactory;
    this.limits = mergeLimits(limits);
    this.now = now;
    this.setTimeoutFn = setTimeoutFn;
    this.clearTimeoutFn = clearTimeoutFn;
    this.tokenFactory = tokenFactory;
    this.active = false;
    this.runTimestamps = [];
  }

  async run(request, { signal } = {}) {
    const executionRequest = createExecutionRequestSnapshot(request, this.limits);

    if (signal !== undefined && !isAbortSignal(signal)) {
      throw new TypeError("signal은 AbortSignal이어야 합니다.");
    }

    if (this.active) {
      return this.#createReport(
        executionRequest,
        executionRequest.tests.map(createNotRunResult),
        {
          outcome: "engine_error",
          error: createError(
            "concurrent_run",
            "이미 코드 실행이 진행 중입니다.",
            "현재 실행이 끝난 뒤 다시 시도해 주세요.",
          ),
          durationMs: 0,
        },
      );
    }

    const requestedAt = this.now();
    this.#removeExpiredRunTimestamps(requestedAt);
    if (this.runTimestamps.length >= this.limits.maxRunsPerWindow) {
      return this.#createReport(
        executionRequest,
        executionRequest.tests.map(createNotRunResult),
        {
          outcome: "engine_error",
          error: createError(
            "run_rate_limit",
            `${this.limits.runWindowMs}ms 동안 실행할 수 있는 횟수를 초과했습니다.`,
            "짧은 시간에 실행을 너무 많이 요청했습니다. 잠시 후 다시 시도해 주세요.",
          ),
          durationMs: 0,
        },
      );
    }

    this.runTimestamps.push(requestedAt);
    this.active = true;
    const startedAt = this.now();

    try {
      const testResults = [];
      let shouldStop = false;

      for (let index = 0; index < executionRequest.tests.length; index += 1) {
        const test = executionRequest.tests[index];

        if (shouldStop) {
          testResults.push(createNotRunResult(test));
          continue;
        }

        if (signal?.aborted) {
          testResults.push(
            createStoppedResult(test, "cancelled", "사용자가 코드 실행을 취소했습니다."),
          );
          shouldStop = true;
          continue;
        }

        const elapsed = this.now() - startedAt;
        const remainingRunTime = this.limits.runTimeoutMs - elapsed;
        if (remainingRunTime <= 0) {
          testResults.push(
            createStoppedResult(
              test,
              "timeout",
              `전체 실행 시간이 ${this.limits.runTimeoutMs}ms를 넘었습니다.`,
            ),
          );
          shouldStop = true;
          continue;
        }

        const timeoutMs = Math.max(
          1,
          Math.min(this.limits.testTimeoutMs, Math.ceil(remainingRunTime)),
        );
        const execution = await this.#executeTest(executionRequest, test, timeoutMs, signal);
        const testResult = this.#toTestResult(test, execution);
        testResults.push(testResult);

        if (
          testResult.outcome === "syntax_error" ||
          testResult.outcome === "cancelled" ||
          testResult.outcome === "engine_error"
        ) {
          shouldStop = true;
        }
      }

      return this.#createReport(executionRequest, testResults, {
        durationMs: roundDuration(this.now() - startedAt),
      });
    } finally {
      this.active = false;
    }
  }

  #removeExpiredRunTimestamps(now) {
    const windowStart = now - this.limits.runWindowMs;
    this.runTimestamps = this.runTimestamps.filter((timestamp) => timestamp > windowStart);
  }

  #executeTest(request, test, timeoutMs, signal) {
    const startedAt = this.now();

    return new Promise((resolve) => {
      let worker;
      let timerId;
      let settled = false;
      const workerToken = this.tokenFactory();

      const finish = (result) => {
        if (settled) return;
        settled = true;
        if (timerId !== undefined) this.clearTimeoutFn(timerId);
        signal?.removeEventListener("abort", handleAbort);

        if (worker) {
          worker.removeEventListener?.("message", handleMessage);
          worker.removeEventListener?.("error", handleWorkerError);
          worker.removeEventListener?.("messageerror", handleMessageError);
          try {
            worker.terminate();
          } catch {
            // The result is already terminal; cleanup errors are not learner errors.
          }
        }

        resolve({
          ...result,
          durationMs: roundDuration(this.now() - startedAt),
        });
      };

      const handleMessage = (event) => {
        const message = event?.data;
        if (
          message?.type !== "result" ||
          message.requestId !== request.requestId ||
          message.testId !== test.id ||
          message.workerToken !== workerToken
        ) {
          return;
        }

        const resultSnapshot = snapshotWorkerResult(message.result, this.limits);
        if (!resultSnapshot) {
          finish({
            outcome: "engine_error",
            error: createError(
              "invalid_worker_result",
              "실행 Worker가 올바르지 않은 결과를 반환했습니다.",
              "코드 실행 결과를 읽지 못했습니다. 다시 시도해 주세요.",
            ),
          });
          return;
        }

        finish(resultSnapshot);
      };

      const handleWorkerError = (event) => {
        event?.preventDefault?.();
        finish({
          outcome: "engine_error",
          error: createError(
            "worker_error",
            "실행 Worker에서 처리할 수 없는 오류가 발생했습니다.",
            "코드 실행기를 시작하지 못했습니다. 다시 시도해 주세요.",
          ),
        });
      };

      const handleMessageError = () => {
        finish({
          outcome: "engine_error",
          error: createError(
            "worker_message_error",
            "실행 Worker의 결과를 복제하지 못했습니다.",
            "코드 실행 결과를 전달하지 못했습니다. 반환값을 단순하게 바꿔 보세요.",
          ),
        });
      };

      const handleAbort = () => {
        finish({
          outcome: "cancelled",
          error: createError("cancelled", "사용자가 코드 실행을 취소했습니다."),
        });
      };

      try {
        worker = this.workerFactory(this.workerUrl);
        if (!worker || typeof worker.postMessage !== "function") {
          throw new TypeError("workerFactory가 올바른 Worker를 반환하지 않았습니다.");
        }

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleWorkerError);
        worker.addEventListener("messageerror", handleMessageError);
        signal?.addEventListener("abort", handleAbort, { once: true });
        timerId = this.setTimeoutFn(() => {
          finish({
            outcome: "timeout",
            error: createError(
              "timeout",
              `이 테스트의 실행 시간이 ${timeoutMs}ms를 넘었습니다.`,
              "반복문이 끝나는 조건과 재귀 호출이 줄어드는지 확인해 보세요.",
            ),
          });
        }, timeoutMs);

        worker.postMessage({
          type: "execute",
          requestId: request.requestId,
          testId: test.id,
          workerToken,
          source: request.source,
          entryPoint: request.entryPoint,
          args: test.args,
          limits: {
            maxOutputBytes: this.limits.maxOutputBytesPerTest,
            maxConsoleEntries: this.limits.maxConsoleEntries,
            maxConsoleBytes: this.limits.maxConsoleBytes,
          },
        });
      } catch (error) {
        finish({
          outcome: "engine_error",
          error: createError(
            "worker_start_error",
            error instanceof Error ? error.message : "실행 Worker를 만들지 못했습니다.",
            "코드 실행기를 시작하지 못했습니다. 브라우저 설정을 확인해 주세요.",
          ),
        });
      }
    });
  }

  #toTestResult(test, execution) {
    const base = {
      ...createBaseTestResult(test),
      durationMs: execution.durationMs,
      console: Array.isArray(execution.console) ? execution.console : [],
      error: execution.error ?? null,
    };

    if (execution.outcome !== "completed") {
      return {
        ...base,
        outcome: execution.outcome,
      };
    }

    const isCorrect = areJsonValuesEqual(execution.value, test.expected);
    return {
      ...base,
      outcome: isCorrect ? "passed" : "wrong_answer",
      actual: execution.value,
      actualDisplay: formatJsonValue(execution.value),
      hasActual: true,
    };
  }

  #createReport(request, testResults, { outcome, error = null, durationMs }) {
    const summary = summarizeTestResults(testResults);

    return {
      requestId: request.requestId,
      contractVersion: request.contractVersion,
      questId: request.questId,
      questRevision: request.questRevision,
      languageId: request.languageId,
      suite: request.suite,
      outcome: outcome ?? summary.outcome,
      tests: testResults,
      summary,
      durationMs,
      limitsApplied: { ...this.limits },
      error,
    };
  }
}
