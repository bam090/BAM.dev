import { serializedJsonByteLength } from "./code-grading.js";

const trustedGlobal = globalThis;
const NativeError = Error;
const NativeEval = eval;
const NativeFunction = Function;
const NativePromise = Promise;
const NativeReferenceError = ReferenceError;
const NativeString = String;
const NativeSyntaxError = SyntaxError;
const NativeTextEncoder = TextEncoder;
const NativeTypeError = TypeError;
const NativeWeakMap = WeakMap;
const NativeWeakSet = WeakSet;
const nativeObjectPrototype = Object.prototype;
const uncurryThis = (method) => Function.prototype.call.bind(method);
const arrayIsArray = Array.isArray.bind(Array);
const functionHasInstance = uncurryThis(Function.prototype[Symbol.hasInstance]);
const jsonParse = JSON.parse.bind(JSON);
const jsonStringify = JSON.stringify.bind(JSON);
const numberIsFinite = Number.isFinite.bind(Number);
const numberIsSafeInteger = Number.isSafeInteger.bind(Number);
const objectCreate = Object.create.bind(Object);
const objectDefineProperty = Object.defineProperty.bind(Object);
const objectFreeze = Object.freeze.bind(Object);
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor.bind(Object);
const objectGetOwnPropertySymbols = Object.getOwnPropertySymbols.bind(Object);
const objectGetPrototypeOf = Object.getPrototypeOf.bind(Object);
const objectHasOwn = Object.hasOwn.bind(Object);
const objectKeys = Object.keys.bind(Object);
const objectPropertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
const objectSetPrototypeOf = Object.setPrototypeOf.bind(Object);
const promiseThen = uncurryThis(Promise.prototype.then);
const reflectApply = Reflect.apply.bind(Reflect);
const reflectDeleteProperty = Reflect.deleteProperty.bind(Reflect);
const regexpTest = uncurryThis(RegExp.prototype.test);
const stringCharCodeAt = uncurryThis(String.prototype.charCodeAt);
const stringSlice = uncurryThis(String.prototype.slice);
const stringTrim = uncurryThis(String.prototype.trim);
const weakSetAdd = uncurryThis(WeakSet.prototype.add);
const weakSetDelete = uncurryThis(WeakSet.prototype.delete);
const weakSetHas = uncurryThis(WeakSet.prototype.has);
const weakMapGet = uncurryThis(WeakMap.prototype.get);
const weakMapHas = uncurryThis(WeakMap.prototype.has);
const weakMapSet = uncurryThis(WeakMap.prototype.set);
const textEncoder = new NativeTextEncoder();
const encodeText = NativeTextEncoder.prototype.encode.bind(textEncoder);
const typedArrayPrototype = objectGetPrototypeOf(Uint8Array.prototype);
const typedArrayByteLength = uncurryThis(
  objectGetOwnPropertyDescriptor(typedArrayPrototype, "byteLength").get,
);
const cloneStructuredValue =
  typeof trustedGlobal.structuredClone === "function"
    ? trustedGlobal.structuredClone.bind(trustedGlobal)
    : null;

const DEFAULT_LIMITS = objectFreeze({
  maxConsoleEntries: 100,
  maxConsoleBytes: 8 * 1024,
  maxOutputBytes: 16 * 1024,
  maxErrorMessageBytes: 1024,
});

const ERROR_NAME_MAX_BYTES = 80;
// 루트 컨테이너를 깊이 0으로 세며, 0..511의 컨테이너를 허용한다.
// code-grading.js의 요청 JSON 검사와 같은 경계여야 한다.
const MAX_JSON_CONTAINER_DEPTH = 512;
const outputLimitErrors = new NativeWeakSet();

function createDataDescriptor(value, enumerable, configurable, writable) {
  const descriptor = objectCreate(null);
  descriptor.value = value;
  descriptor.enumerable = enumerable;
  descriptor.configurable = configurable;
  descriptor.writable = writable;
  return descriptor;
}

function defineDataProperty(
  target,
  key,
  value,
  enumerable = true,
  configurable = true,
  writable = true,
) {
  return objectDefineProperty(
    target,
    key,
    createDataDescriptor(value, enumerable, configurable, writable),
  );
}

function clonePropertyDescriptor(descriptor) {
  if (!descriptor) return descriptor;
  const clone = objectCreate(null);
  const fields = ["value", "writable", "get", "set", "enumerable", "configurable"];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (objectHasOwn(descriptor, field)) clone[field] = descriptor[field];
  }
  return clone;
}

class OutputLimitError extends NativeError {
  constructor(kind, message, learnerMessage, details = {}) {
    super(message);
    defineDataProperty(this, "name", "OutputLimitError");
    defineDataProperty(this, "kind", kind);
    defineDataProperty(this, "learnerMessage", learnerMessage);
    defineDataProperty(this, "details", objectFreeze({ ...details }));
    weakSetAdd(outputLimitErrors, this);
    objectFreeze(this);
  }
}

function byteLength(value) {
  return typedArrayByteLength(encodeText(value));
}

function clipUtf8(value, maxBytes) {
  const text = NativeString(value);
  if (maxBytes <= 0) {
    return { text: "", truncated: text.length > 0 };
  }

  let bytes = 0;
  let clipped = "";
  for (let index = 0; index < text.length; ) {
    const firstCodeUnit = stringCharCodeAt(text, index);
    const isSurrogatePair =
      firstCodeUnit >= 0xd800 &&
      firstCodeUnit <= 0xdbff &&
      index + 1 < text.length &&
      stringCharCodeAt(text, index + 1) >= 0xdc00 &&
      stringCharCodeAt(text, index + 1) <= 0xdfff;
    const width = isSurrogatePair ? 2 : 1;
    const character = stringSlice(text, index, index + width);
    const characterBytes = byteLength(character);
    if (bytes + characterBytes > maxBytes) {
      return { text: clipped, truncated: true };
    }
    clipped += character;
    bytes += characterBytes;
    index += width;
  }
  return { text: clipped, truncated: false };
}

function clipWithEllipsis(value, maxBytes) {
  const text = NativeString(value);
  const direct = clipUtf8(text, maxBytes);
  if (!direct.truncated) return direct.text;

  const ellipsis = "…";
  const ellipsisBytes = byteLength(ellipsis);
  if (maxBytes < ellipsisBytes) {
    return direct.text;
  }
  return `${clipUtf8(text, maxBytes - ellipsisBytes).text}${ellipsis}`;
}

function normalizeLimit(value, fallback) {
  return numberIsSafeInteger(value) && value >= 0 ? value : fallback;
}

function normalizeLimits(limits) {
  const candidate = limits && typeof limits === "object" ? limits : {};
  return {
    maxConsoleEntries: normalizeLimit(
      candidate.maxConsoleEntries,
      DEFAULT_LIMITS.maxConsoleEntries,
    ),
    maxConsoleBytes: normalizeLimit(
      candidate.maxConsoleBytes,
      DEFAULT_LIMITS.maxConsoleBytes,
    ),
    maxOutputBytes: normalizeLimit(candidate.maxOutputBytes, DEFAULT_LIMITS.maxOutputBytes),
    maxErrorMessageBytes: normalizeLimit(
      candidate.maxErrorMessageBytes,
      DEFAULT_LIMITS.maxErrorMessageBytes,
    ),
  };
}

function safelyReadErrorField(error, field) {
  try {
    return error?.[field];
  } catch {
    return undefined;
  }
}

function errorName(error) {
  const candidate = safelyReadErrorField(error, "name");
  const name = typeof candidate === "string" && stringTrim(candidate) ? candidate : "Error";
  return clipWithEllipsis(name, ERROR_NAME_MAX_BYTES);
}

function errorMessage(error) {
  const candidate = safelyReadErrorField(error, "message");
  if (typeof candidate === "string") return candidate;
  if (typeof error === "string") return error;
  if (error === null) return "null 값이 오류로 전달되었습니다.";
  if (error === undefined) return "undefined 값이 오류로 전달되었습니다.";

  try {
    return NativeString(error);
  } catch {
    return "오류 내용을 문자열로 표시할 수 없습니다.";
  }
}

function learnerMessageFor(outcome, name) {
  if (outcome === "syntax_error") {
    return "코드 문법을 해석하지 못했습니다. 괄호, 따옴표와 키워드 사용을 확인해 보세요.";
  }
  if (outcome === "engine_error") {
    if (name === "InputError") {
      return "테스트 입력을 안전하게 준비하지 못했습니다. 입력값이 JSON 호환 형식과 깊이 제한을 지키는지 확인해 주세요.";
    }
    return "현재 브라우저 설정에서는 코드 실행기를 시작할 수 없습니다. 동적 코드 실행 정책을 확인해 주세요.";
  }
  if (name === "ReferenceError") {
    return "실행할 함수를 찾지 못했거나 선언되지 않은 이름을 사용했습니다. 함수 이름과 변수 선언을 확인해 보세요.";
  }
  if (name === "TypeError") {
    return "실행 중 값의 종류가 맞지 않아 작업을 계속하지 못했습니다. 함수 호출과 값의 형태를 확인해 보세요.";
  }
  if (name === "RangeError") {
    return "실행 중 허용할 수 있는 값의 범위를 벗어났습니다. 반복 횟수와 입력값의 크기를 확인해 보세요.";
  }
  return "코드를 실행하는 중 오류가 발생했습니다. 오류 메시지와 해당 줄 주변을 확인해 보세요.";
}

function isInstanceOf(constructor, value) {
  try {
    return functionHasInstance(constructor, value);
  } catch {
    return false;
  }
}

function isOutputLimitError(error) {
  try {
    return weakSetHas(outputLimitErrors, error);
  } catch {
    return false;
  }
}

function describeError(error, outcome, maxMessageBytes) {
  const name = errorName(error);
  return {
    name,
    message: clipWithEllipsis(errorMessage(error), maxMessageBytes),
    learnerMessage: clipWithEllipsis(
      learnerMessageFor(outcome, name),
      maxMessageBytes,
    ),
  };
}

function consoleByteLimitError(limits) {
  return new OutputLimitError(
    "console_bytes",
    `콘솔 출력 크기가 ${limits.maxConsoleBytes}바이트를 넘었습니다.`,
    "콘솔 출력이 너무 깁니다. 출력할 값과 console 호출 횟수를 줄여 보세요.",
    { maxConsoleBytes: limits.maxConsoleBytes },
  );
}

function previewTextParts(parts, maxBytes) {
  let text = "";
  let remainingBytes = maxBytes;

  for (let index = 0; index < parts.length; index += 1) {
    const clipped = clipUtf8(parts[index], remainingBytes);
    text += clipped.text;
    remainingBytes -= byteLength(clipped.text);
    if (clipped.truncated) return { text, truncated: true };
  }

  return { text, truncated: false };
}

function previewValue(value, maxBytes, limits) {
  if (typeof value === "string") return clipUtf8(value, maxBytes);
  if (typeof value === "undefined") return clipUtf8("undefined", maxBytes);
  if (typeof value === "bigint") {
    return previewTextParts([NativeString(value), "n"], maxBytes);
  }
  if (typeof value === "symbol") return clipUtf8(NativeString(value), maxBytes);
  if (typeof value === "function") {
    const name = safelyReadErrorField(value, "name");
    return previewTextParts(
      typeof name === "string" && name
        ? ["[Function: ", name, "]"]
        : ["[Function]"],
      maxBytes,
    );
  }
  if (isInstanceOf(NativeError, value)) {
    return previewTextParts(
      [errorName(value), ": ", errorMessage(value)],
      maxBytes,
    );
  }

  if (value && typeof value === "object") {
    try {
      const measuredBytes = serializedJsonByteLength(value, maxBytes);
      if (measuredBytes !== null && measuredBytes > maxBytes) {
        throw consoleByteLimitError(limits);
      }
      const normalized = normalizeJsonValue(value);
      const normalizedBytes = serializedJsonByteLength(normalized, maxBytes);
      if (normalizedBytes !== null && normalizedBytes > maxBytes) {
        throw consoleByteLimitError(limits);
      }
      const serialized = jsonStringify(normalized);
      return clipUtf8(serialized ?? NativeString(value), maxBytes);
    } catch (error) {
      if (isOutputLimitError(error) && error.kind === "console_bytes") throw error;
      return clipUtf8("[표시할 수 없는 값]", maxBytes);
    }
  }

  return clipUtf8(NativeString(value), maxBytes);
}

function previewArguments(values, maxBytes, limits) {
  let preview = "";
  let remainingBytes = maxBytes;

  for (let index = 0; index < values.length; index += 1) {
    if (index > 0) {
      const separator = clipUtf8(" ", remainingBytes);
      preview += separator.text;
      remainingBytes -= byteLength(separator.text);
      if (separator.truncated) return { text: preview, truncated: true };
    }

    const valuePreview = previewValue(values[index], remainingBytes, limits);
    preview += valuePreview.text;
    remainingBytes -= byteLength(valuePreview.text);
    if (valuePreview.truncated) return { text: preview, truncated: true };
  }

  return { text: preview, truncated: false };
}

function createConsoleCapture(limits) {
  const entries = [];
  let usedBytes = 0;
  let exceeded = null;

  const capture = (method, values) => {
    if (exceeded) throw exceeded;
    if (entries.length >= limits.maxConsoleEntries) {
      exceeded = new OutputLimitError(
        "console_entries",
        `콘솔 출력 횟수가 ${limits.maxConsoleEntries}회를 넘었습니다.`,
        "콘솔 출력이 너무 많습니다. 반복문과 console 호출 횟수를 확인해 보세요.",
        { maxConsoleEntries: limits.maxConsoleEntries },
      );
      throw exceeded;
    }

    const remaining = limits.maxConsoleBytes - usedBytes;
    const remainingBytes = remaining > 0 ? remaining : 0;
    let renderedPreview;
    try {
      renderedPreview = previewArguments(values, remainingBytes, limits);
    } catch (error) {
      if (isOutputLimitError(error) && error.kind === "console_bytes") {
        exceeded = error;
      }
      throw error;
    }
    defineDataProperty(entries, entries.length, {
      method,
      preview: renderedPreview.text,
    });
    usedBytes += byteLength(renderedPreview.text);

    if (renderedPreview.truncated) {
      exceeded = consoleByteLimitError(limits);
      throw exceeded;
    }
  };

  const capturedConsole = objectCreate(null);
  for (const method of ["log", "info", "warn", "error"]) {
    defineDataProperty(
      capturedConsole,
      method,
      (...values) => capture(method, values),
      true,
      false,
      false,
    );
  }
  objectFreeze(capturedConsole);

  return {
    console: capturedConsole,
    get entries() {
      const snapshot = [];
      for (let index = 0; index < entries.length; index += 1) {
        defineDataProperty(snapshot, index, { ...entries[index] });
      }
      return snapshot;
    },
    get exceeded() {
      return exceeded;
    },
  };
}

function installGlobalConsole(capturedConsole, lockGlobalConsole) {
  const originalDescriptor = clonePropertyDescriptor(
    objectGetOwnPropertyDescriptor(trustedGlobal, "console"),
  );
  try {
    defineDataProperty(
      trustedGlobal,
      "console",
      capturedConsole,
      originalDescriptor?.enumerable ?? true,
      !lockGlobalConsole,
      false,
    );
  } catch (error) {
    return { installed: false, error, restore() {} };
  }

  return {
    installed: true,
    restore() {
      if (lockGlobalConsole) return;
      try {
        if (originalDescriptor) objectDefineProperty(trustedGlobal, "console", originalDescriptor);
        else reflectDeleteProperty(trustedGlobal, "console");
      } catch {
        // Direct test/runtime callers should discard the realm if learner code
        // deliberately makes the temporary property non-configurable.
      }
    },
  };
}

function createProtocolRecord(fields) {
  objectSetPrototypeOf(fields, null);
  return fields;
}

function observeNativePromise(value) {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) {
    return null;
  }

  let resolveObservation;
  const observation = new NativePromise((resolve) => {
    resolveObservation = resolve;
  });
  defineDataProperty(observation, "constructor", NativePromise, false, false, false);

  try {
    promiseThen(
      value,
      (fulfilledValue) => {
        resolveObservation(
          createProtocolRecord({ fulfilled: true, value: fulfilledValue }),
        );
      },
      (rejection) => {
        resolveObservation(createProtocolRecord({ fulfilled: false, error: rejection }));
      },
    );
  } catch {
    return null;
  }

  return observation;
}

function outputLimitResult(error, consoleEntries, limits) {
  return createProtocolRecord({
    outcome: "output_limit",
    error: {
      name: error.name,
      message: clipWithEllipsis(error.message, limits.maxErrorMessageBytes),
      learnerMessage: clipWithEllipsis(
        error.learnerMessage,
        limits.maxErrorMessageBytes,
      ),
    },
    limit: { kind: error.kind, ...error.details },
    console: consoleEntries,
  });
}

function unsupportedReturnValue(reason) {
  return new OutputLimitError(
    "return_value",
    `반환값을 채점 가능한 형태로 변환하지 못했습니다: ${reason}`,
    "반환값은 순환이 없는 JSON 호환 값이어야 합니다. undefined, 함수, Symbol, BigInt, NaN과 Infinity는 반환할 수 없습니다.",
  );
}

function normalizeJsonValue(
  value,
  ancestors = new NativeWeakSet(),
  copies = new NativeWeakMap(),
  depth = 0,
) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!numberIsFinite(value)) throw unsupportedReturnValue("유한하지 않은 숫자입니다.");
    return value;
  }
  const valueType = typeof value;
  if (
    valueType === "undefined" ||
    valueType === "bigint" ||
    valueType === "symbol" ||
    valueType === "function"
  ) {
    throw unsupportedReturnValue(`${typeof value} 형식은 JSON으로 표현할 수 없습니다.`);
  }
  if (depth >= MAX_JSON_CONTAINER_DEPTH) {
    throw unsupportedReturnValue("반환값이 지나치게 깊게 중첩되어 있습니다.");
  }
  if (weakSetHas(ancestors, value)) {
    throw unsupportedReturnValue("반환값이 순환 참조를 포함합니다.");
  }
  if (weakMapHas(copies, value)) return weakMapGet(copies, value);

  weakSetAdd(ancestors, value);
  try {
    if (arrayIsArray(value)) {
      const normalized = [];
      objectSetPrototypeOf(normalized, null);
      weakMapSet(copies, value, normalized);
      const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
      const length = lengthDescriptor?.value;
      if (!numberIsSafeInteger(length) || length < 0 || length > 0xffff_ffff) {
        throw unsupportedReturnValue("배열의 length를 안전하게 확인할 수 없습니다.");
      }
      for (let index = 0; index < length; index += 1) {
        if (!objectHasOwn(value, index)) {
          throw unsupportedReturnValue("배열의 빈 항목은 JSON 호환 반환값으로 사용할 수 없습니다.");
        }
        const descriptor = objectGetOwnPropertyDescriptor(value, NativeString(index));
        if (!descriptor || !objectHasOwn(descriptor, "value")) {
          throw unsupportedReturnValue("getter 또는 setter가 있는 배열은 반환할 수 없습니다.");
        }
        defineDataProperty(
          normalized,
          index,
          normalizeJsonValue(descriptor.value, ancestors, copies, depth + 1),
        );
      }
      return normalized;
    }

    const prototype = objectGetPrototypeOf(value);
    if (prototype !== nativeObjectPrototype && prototype !== null) {
      throw unsupportedReturnValue("일반 객체와 배열만 반환할 수 있습니다.");
    }
    const symbols = objectGetOwnPropertySymbols(value);
    for (let index = 0; index < symbols.length; index += 1) {
      if (objectPropertyIsEnumerable(value, symbols[index])) {
        throw unsupportedReturnValue("Symbol 키는 JSON으로 표현할 수 없습니다.");
      }
    }

    const normalized = objectCreate(null);
    weakMapSet(copies, value, normalized);
    const keys = objectKeys(value);
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const descriptor = objectGetOwnPropertyDescriptor(value, key);
      if (!descriptor || !objectHasOwn(descriptor, "value")) {
        throw unsupportedReturnValue("getter 또는 setter가 있는 객체는 반환할 수 없습니다.");
      }
      defineDataProperty(
        normalized,
        key,
        normalizeJsonValue(descriptor.value, ancestors, copies, depth + 1),
      );
    }
    return normalized;
  } catch (error) {
    if (isOutputLimitError(error)) throw error;
    throw unsupportedReturnValue("객체 속성을 안전하게 읽을 수 없습니다.");
  } finally {
    weakSetDelete(ancestors, value);
  }
}

function normalizeReturnValue(value, limits) {
  const measuredBytes = serializedJsonByteLength(value, limits.maxOutputBytes);
  if (measuredBytes === null) {
    throw unsupportedReturnValue(
      "반환값이 JSON 호환 형식이 아니거나 지나치게 깊게 중첩되어 있습니다.",
    );
  }
  if (measuredBytes !== null && measuredBytes > limits.maxOutputBytes) {
    throw new OutputLimitError(
      "return_bytes",
      `반환값 크기가 ${limits.maxOutputBytes}바이트를 넘었습니다.`,
      "반환값이 너무 큽니다. 문제에서 요구한 값만 반환하도록 코드와 자료 구조를 확인해 보세요.",
      { maxOutputBytes: limits.maxOutputBytes },
    );
  }

  const normalized = normalizeJsonValue(value);
  const normalizedBytes = serializedJsonByteLength(
    normalized,
    limits.maxOutputBytes,
  );
  if (normalizedBytes === null) {
    throw unsupportedReturnValue("정규화한 반환값을 안전하게 검사하지 못했습니다.");
  }
  if (normalizedBytes > limits.maxOutputBytes) {
    throw new OutputLimitError(
      "return_bytes",
      `반환값 크기가 ${limits.maxOutputBytes}바이트를 넘었습니다.`,
      "반환값이 너무 큽니다. 문제에서 요구한 값만 반환하도록 코드와 자료 구조를 확인해 보세요.",
      { maxOutputBytes: limits.maxOutputBytes },
    );
  }

  let serialized;
  try {
    serialized = jsonStringify(normalized);
  } catch {
    throw unsupportedReturnValue("JSON 직렬화에 실패했습니다.");
  }

  const outputBytes = byteLength(serialized);
  if (outputBytes > limits.maxOutputBytes) {
    throw new OutputLimitError(
      "return_bytes",
      `반환값 크기가 ${limits.maxOutputBytes}바이트를 넘었습니다.`,
      "반환값이 너무 큽니다. 문제에서 요구한 값만 반환하도록 코드와 자료 구조를 확인해 보세요.",
      { maxOutputBytes: limits.maxOutputBytes },
    );
  }
  return jsonParse(serialized);
}

function cloneArguments(args) {
  if (!arrayIsArray(args)) {
    const error = new NativeTypeError("테스트 인수(args)는 배열이어야 합니다.");
    defineDataProperty(error, "name", "InputError");
    throw error;
  }
  if (serializedJsonByteLength(args) === null) {
    const error = new NativeTypeError(
      "테스트 인수(args)가 JSON 호환 형식 또는 컨테이너 깊이 제한을 벗어났습니다.",
    );
    defineDataProperty(error, "name", "InputError");
    throw error;
  }

  try {
    if (cloneStructuredValue) {
      return cloneStructuredValue(args);
    }
    return jsonParse(jsonStringify(args));
  } catch {
    const error = new NativeTypeError("테스트 인수(args)를 안전하게 복제하지 못했습니다.");
    defineDataProperty(error, "name", "InputError");
    throw error;
  }
}

function isValidEntryPoint(entryPoint) {
  return (
    typeof entryPoint === "string" &&
    regexpTest(/^[A-Za-z_$][A-Za-z0-9_$]*$/, entryPoint)
  );
}

function resultForError(outcome, error, consoleEntries, limits) {
  return createProtocolRecord({
    outcome,
    error: describeError(error, outcome, limits.maxErrorMessageBytes),
    console: consoleEntries,
  });
}

function compileJavaScriptFunction(source, entryPoint) {
  // outer Function은 `eval` 매개변수를 허용하도록 non-strict로 두고, inner
  // strict 함수의 direct eval에는 모듈 로드 때 캡처한 native eval만 전달한다.
  // Eval은 실행 전에 전체 Script를 파싱한다. 유효한 source라면 선행 `throw 0`이
  // 학습자 코드보다 먼저 실행되고, 문법 오류라면 sentinel보다 먼저 SyntaxError가
  // 발생한다. 별도 block wrapper가 없어 source가 검사 문맥을 닫고 탈출할 수 없다.
  const syntaxParser = new NativeFunction(
    "eval",
    "candidate",
    `return (function (source) {\n` +
      `  "use strict";\n` +
      `  try {\n` +
      `    eval('"use strict";\\nthrow 0;\\n' + source);\n` +
      `  } catch (error) {\n` +
      `    if (error === 0) return;\n` +
      `    throw error;\n` +
      `  }\n` +
      `})(candidate);`,
  );
  reflectApply(syntaxParser, undefined, [NativeEval, source]);
  return new NativeFunction(
    "console",
    `"use strict";\n${source}\n; return ${entryPoint};`,
  );
}

/**
 * 브라우저 Worker 안에서 공개 테스트 하나를 실행한다.
 * 시간 제한과 실행 문맥 폐기는 Worker 어댑터가 담당한다.
 */
export async function executeJavaScriptTest(request = {}, options = {}) {
  const limits = normalizeLimits(request?.limits);
  const capture = createConsoleCapture(limits);
  const source = typeof request?.source === "string" ? request.source : "";
  const entryPoint = request?.entryPoint;
  const compileFunction =
    typeof options.compileFunction === "function"
      ? options.compileFunction
      : compileJavaScriptFunction;
  const consoleBinding = installGlobalConsole(
    capture.console,
    options.lockGlobalConsole === true,
  );

  if (!consoleBinding.installed) {
    return resultForError(
      "engine_error",
      consoleBinding.error,
      capture.entries,
      limits,
    );
  }

  try {
    if (!isValidEntryPoint(entryPoint)) {
      return resultForError(
        "runtime_error",
        new NativeReferenceError("실행할 함수 이름(entryPoint)이 올바르지 않습니다."),
        capture.entries,
        limits,
      );
    }

    let factory;
    try {
      factory = compileFunction(source, entryPoint);
    } catch (error) {
      const outcome = isInstanceOf(NativeSyntaxError, error)
        ? "syntax_error"
        : "engine_error";
      return resultForError(outcome, error, capture.entries, limits);
    }

    let clonedArgs;
    try {
      clonedArgs = cloneArguments(request?.args ?? []);
    } catch (error) {
      return resultForError("engine_error", error, capture.entries, limits);
    }

    try {
      const callable = factory(capture.console);
      if (typeof callable !== "function") {
        throw new NativeReferenceError(`실행할 함수 "${entryPoint}"를 찾을 수 없습니다.`);
      }
      const invocationResult = reflectApply(callable, undefined, clonedArgs);
      const promiseObservation = observeNativePromise(invocationResult);
      let value = invocationResult;
      if (promiseObservation) {
        const settlement = await promiseObservation;
        if (!settlement.fulfilled) throw settlement.error;
        value = settlement.value;
      }

      if (capture.exceeded) {
        return outputLimitResult(capture.exceeded, capture.entries, limits);
      }

      try {
        return createProtocolRecord({
          outcome: "completed",
          value: normalizeReturnValue(value, limits),
          console: capture.entries,
        });
      } catch (error) {
        if (isOutputLimitError(error)) {
          return outputLimitResult(error, capture.entries, limits);
        }
        throw error;
      }
    } catch (error) {
      if (capture.exceeded) {
        return outputLimitResult(capture.exceeded, capture.entries, limits);
      }
      return resultForError("runtime_error", error, capture.entries, limits);
    }
  } finally {
    consoleBinding.restore();
  }
}

export { DEFAULT_LIMITS };
