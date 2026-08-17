import { executeJavaScriptTest } from "../grading/javascript-runtime.js";

const nativeObjectPrototype = Object.prototype;
const arrayIsArray = Array.isArray.bind(Array);
const numberIsSafeInteger = Number.isSafeInteger.bind(Number);
const objectCreate = Object.create.bind(Object);
const objectDefineProperty = Object.defineProperty.bind(Object);
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor.bind(Object);
const objectGetPrototypeOf = Object.getPrototypeOf.bind(Object);
const objectHasOwn = Object.hasOwn.bind(Object);
const reflectOwnKeys = Reflect.ownKeys.bind(Reflect);

const EXECUTE_MESSAGE_FIELDS = Object.freeze([
  "type",
  "requestId",
  "testId",
  "workerToken",
  "source",
  "entryPoint",
  "args",
  "limits",
]);
const LIMIT_FIELDS = Object.freeze([
  "maxOutputBytes",
  "maxConsoleEntries",
  "maxConsoleBytes",
]);

function containsField(fields, candidate) {
  for (let index = 0; index < fields.length; index += 1) {
    if (fields[index] === candidate) return true;
  }
  return false;
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || arrayIsArray(value)) return false;
  try {
    const prototype = objectGetPrototypeOf(value);
    return prototype === nativeObjectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function hasExactDataFields(value, expectedFields) {
  if (!isPlainRecord(value)) return false;

  let fields;
  try {
    fields = reflectOwnKeys(value);
  } catch {
    return false;
  }
  if (fields.length !== expectedFields.length) return false;

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== "string" || !containsField(expectedFields, field)) return false;
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) return false;
  }
  return true;
}

function isValidExecutionMessage(message) {
  if (!hasExactDataFields(message, EXECUTE_MESSAGE_FIELDS)) return false;
  if (
    message.type !== "execute" ||
    typeof message.requestId !== "string" ||
    message.requestId.length === 0 ||
    typeof message.testId !== "string" ||
    message.testId.length === 0 ||
    typeof message.workerToken !== "string" ||
    message.workerToken.length === 0 ||
    typeof message.source !== "string" ||
    typeof message.entryPoint !== "string" ||
    !arrayIsArray(message.args) ||
    !hasExactDataFields(message.limits, LIMIT_FIELDS)
  ) {
    return false;
  }

  for (let index = 0; index < LIMIT_FIELDS.length; index += 1) {
    const value = message.limits[LIMIT_FIELDS[index]];
    if (!numberIsSafeInteger(value) || value <= 0) return false;
  }
  return true;
}

function defineDataField(record, name, value) {
  const descriptor = objectCreate(null);
  descriptor.value = value;
  descriptor.enumerable = true;
  descriptor.configurable = true;
  descriptor.writable = true;
  objectDefineProperty(record, name, descriptor);
}

function createResultEnvelope({ requestId, testId, workerToken, result }) {
  const response = objectCreate(null);
  defineDataField(response, "type", "result");
  defineDataField(response, "requestId", requestId);
  defineDataField(response, "testId", testId);
  defineDataField(response, "workerToken", workerToken);
  defineDataField(response, "result", result);
  return response;
}

async function executeValidatedMessage(message, postResult, runtimeOptions) {
  const requestId = message.requestId;
  const testId = message.testId;
  const workerToken = message.workerToken;
  const source = message.source;
  const entryPoint = message.entryPoint;
  const args = message.args;
  const limits = message.limits;
  const result = await executeJavaScriptTest(
    { source, entryPoint, args, limits },
    runtimeOptions,
  );
  postResult(createResultEnvelope({ requestId, testId, workerToken, result }));
  return true;
}

export async function handleJavaScriptRunnerMessage(
  message,
  postResult,
  runtimeOptions = {},
) {
  if (!isValidExecutionMessage(message) || typeof postResult !== "function") {
    return false;
  }
  return executeValidatedMessage(message, postResult, runtimeOptions);
}

export function createOneShotJavaScriptRunner(
  postResult,
  { runtimeOptions = {}, onComplete = () => {} } = {},
) {
  let hasHandledExecution = false;

  return async (message) => {
    if (hasHandledExecution || !isValidExecutionMessage(message)) return false;
    hasHandledExecution = true;
    try {
      return await executeValidatedMessage(message, postResult, runtimeOptions);
    } finally {
      onComplete();
    }
  };
}

const workerScope = typeof self === "undefined" ? null : self;
const dedicatedWorkerScopeConstructor =
  typeof DedicatedWorkerGlobalScope === "function" ? DedicatedWorkerGlobalScope : null;
const isDedicatedWorkerScope =
  workerScope !== null &&
  dedicatedWorkerScopeConstructor !== null &&
  workerScope instanceof dedicatedWorkerScopeConstructor;

if (isDedicatedWorkerScope && typeof workerScope.addEventListener === "function") {
  const postWorkerResult = workerScope.postMessage.bind(workerScope);
  const closeWorker =
    typeof workerScope.close === "function" ? workerScope.close.bind(workerScope) : () => {};
  const handleOneShotExecution = createOneShotJavaScriptRunner(postWorkerResult, {
    runtimeOptions: { lockGlobalConsole: true },
    onComplete: closeWorker,
  });

  workerScope.addEventListener("message", (event) => {
    void handleOneShotExecution(event?.data);
  });
}
