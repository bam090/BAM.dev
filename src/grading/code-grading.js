const NativeArray = Array;
const NativeError = Error;
const NativeNumber = Number;
const NativeSet = Set;
const NativeString = String;
const NativeTextEncoder = TextEncoder;
const NativeTypeError = TypeError;
const NativeWeakMap = WeakMap;
const NativeWeakSet = WeakSet;
const nativeObjectPrototype = Object.prototype;
const uncurryThis = (method) => Function.prototype.call.bind(method);
const arrayIsArray = Array.isArray.bind(Array);
const arrayJoin = uncurryThis(Array.prototype.join);
const arrayPop = uncurryThis(Array.prototype.pop);
const arrayPush = uncurryThis(Array.prototype.push);
const arraySort = uncurryThis(Array.prototype.sort);
const jsonStringify = JSON.stringify.bind(JSON);
const mathMin = Math.min.bind(Math);
const numberIsFinite = Number.isFinite.bind(Number);
const numberIsInteger = Number.isInteger.bind(Number);
const numberIsSafeInteger = Number.isSafeInteger.bind(Number);
const objectCreate = Object.create.bind(Object);
const objectDefineProperty = Object.defineProperty.bind(Object);
const objectFreeze = Object.freeze.bind(Object);
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor.bind(Object);
const objectGetPrototypeOf = Object.getPrototypeOf.bind(Object);
const objectHasOwn = Object.hasOwn.bind(Object);
const objectKeys = Object.keys.bind(Object);
const objectSetPrototypeOf = Object.setPrototypeOf.bind(Object);
const objectValues = Object.values.bind(Object);
const reflectOwnKeys = Reflect.ownKeys.bind(Reflect);
const regexpExec = uncurryThis(RegExp.prototype.exec);
const setAdd = uncurryThis(Set.prototype.add);
const setHas = uncurryThis(Set.prototype.has);
const stringTrim = uncurryThis(String.prototype.trim);
const weakMapGet = uncurryThis(WeakMap.prototype.get);
const weakMapHas = uncurryThis(WeakMap.prototype.has);
const weakMapSet = uncurryThis(WeakMap.prototype.set);
const weakSetAdd = uncurryThis(WeakSet.prototype.add);
const weakSetDelete = uncurryThis(WeakSet.prototype.delete);
const weakSetHas = uncurryThis(WeakSet.prototype.has);
const textEncoder = new NativeTextEncoder();
const encodeText = NativeTextEncoder.prototype.encode.bind(textEncoder);
const typedArrayPrototype = objectGetPrototypeOf(Uint8Array.prototype);
const typedArrayByteLength = uncurryThis(
  objectGetOwnPropertyDescriptor(typedArrayPrototype, "byteLength").get,
);

function defineDataProperty(target, key, value) {
  const descriptor = objectCreate(null);
  descriptor.value = value;
  descriptor.enumerable = true;
  descriptor.configurable = true;
  descriptor.writable = true;
  return objectDefineProperty(target, key, descriptor);
}

const KIBIBYTE = 1024;

export const DEFAULT_EXECUTION_LIMITS = objectFreeze({
  maxSourceBytes: 20 * KIBIBYTE,
  maxTests: 20,
  maxInputBytesPerTest: 16 * KIBIBYTE,
  maxOutputBytesPerTest: 16 * KIBIBYTE,
  maxConsoleEntries: 100,
  maxConsoleBytes: 8 * KIBIBYTE,
  testTimeoutMs: 1000,
  runTimeoutMs: 5000,
  maxRunsPerWindow: 20,
  runWindowMs: 60_000,
});

export const GRADING_OUTCOMES = objectFreeze({
  PASSED: "passed",
  WRONG_ANSWER: "wrong_answer",
  SYNTAX_ERROR: "syntax_error",
  RUNTIME_ERROR: "runtime_error",
  TIMEOUT: "timeout",
  OUTPUT_LIMIT: "output_limit",
  CANCELLED: "cancelled",
  ENGINE_ERROR: "engine_error",
  NOT_RUN: "not_run",
});

const REQUEST_FIELD_NAMES = objectFreeze([
  "requestId",
  "contractVersion",
  "questId",
  "questRevision",
  "languageId",
  "suite",
  "source",
  "entryPoint",
  "tests",
]);
const REQUEST_FIELDS = new NativeSet(REQUEST_FIELD_NAMES);
const TEST_REQUIRED_FIELD_NAMES = objectFreeze(["id", "args", "expected"]);
const TEST_OPTIONAL_FIELD_NAMES = objectFreeze(["label"]);
const TEST_FIELDS = new NativeSet([
  ...TEST_REQUIRED_FIELD_NAMES,
  ...TEST_OPTIONAL_FIELD_NAMES,
]);
const LIMIT_FIELD_NAMES = objectFreeze(objectKeys(DEFAULT_EXECUTION_LIMITS));
const LIMIT_FIELDS = new NativeSet(LIMIT_FIELD_NAMES);
const OUTCOME_NAMES = objectFreeze(objectValues(GRADING_OUTCOMES));
const OUTCOME_VALUES = new NativeSet(OUTCOME_NAMES);
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ENTRY_POINT_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED_ENTRY_POINTS = new NativeSet([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);
const OVERALL_OUTCOME_PRIORITY = [
  GRADING_OUTCOMES.CANCELLED,
  GRADING_OUTCOMES.ENGINE_ERROR,
  GRADING_OUTCOMES.TIMEOUT,
  GRADING_OUTCOMES.OUTPUT_LIMIT,
  GRADING_OUTCOMES.SYNTAX_ERROR,
  GRADING_OUTCOMES.RUNTIME_ERROR,
  GRADING_OUTCOMES.WRONG_ANSWER,
  GRADING_OUTCOMES.NOT_RUN,
];
// 루트 컨테이너를 깊이 0으로 세며, 0..511의 컨테이너를 허용한다.
// javascript-runtime.js의 반환값 정규화와 같은 경계여야 한다.
const MAX_JSON_CONTAINER_DEPTH = 512;
const MAX_SAFE_JSON_BYTES = NativeNumber.MAX_SAFE_INTEGER;

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || arrayIsArray(value)) return false;

  try {
    const prototype = objectGetPrototypeOf(value);
    return prototype === nativeObjectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && stringTrim(value).length > 0;
}

function appendJsonPath(path, key) {
  if (regexpExec(/^[A-Za-z_$][A-Za-z0-9_$]*$/, key) !== null) return `${path}.${key}`;
  return `${path}[${jsonStringify(key)}]`;
}

function findJsonValueIssue(rootValue, rootPath) {
  const activeObjects = new NativeWeakSet();
  const validatedDepths = new NativeWeakMap();
  const stack = [{ kind: "visit", value: rootValue, path: rootPath, depth: 0 }];

  try {
    while (stack.length > 0) {
      const frame = arrayPop(stack);
      if (frame.kind === "exit") {
        weakSetDelete(activeObjects, frame.value);
        const previousDepth = weakMapGet(validatedDepths, frame.value);
        if (!weakMapHas(validatedDepths, frame.value) || frame.depth > previousDepth) {
          weakMapSet(validatedDepths, frame.value, frame.depth);
        }
        continue;
      }

      const { value, path, depth } = frame;
      if (value === null || typeof value === "string" || typeof value === "boolean") {
        continue;
      }
      if (typeof value === "number") {
        if (!numberIsFinite(value)) {
          return `${path}에는 NaN이나 Infinity가 아닌 유한한 number가 필요합니다.`;
        }
        continue;
      }
      if (typeof value !== "object") {
        return `${path}의 ${typeof value} 값은 JSON으로 표현할 수 없습니다.`;
      }
      if (depth >= MAX_JSON_CONTAINER_DEPTH) {
        return `${path}의 JSON 값이 지나치게 깊게 중첩되어 있습니다.`;
      }
      if (weakSetHas(activeObjects, value)) {
        return `${path}에 순환 참조가 있어 JSON으로 표현할 수 없습니다.`;
      }
      const validatedDepth = weakMapGet(validatedDepths, value);
      if (weakMapHas(validatedDepths, value) && depth <= validatedDepth) {
        continue;
      }

      weakSetAdd(activeObjects, value);
      arrayPush(stack, { kind: "exit", value, depth });

      if (arrayIsArray(value)) {
        const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
        const length = lengthDescriptor?.value;
        if (!numberIsSafeInteger(length) || length < 0 || length > 0xffff_ffff) {
          return `${path} 배열의 length를 안전하게 검사할 수 없습니다.`;
        }
        const indexEntries = [];
        const ownKeys = reflectOwnKeys(value);
        for (let keyIndex = 0; keyIndex < ownKeys.length; keyIndex += 1) {
          const key = ownKeys[keyIndex];
          if (key === "length") continue;
          if (typeof key === "symbol") {
            return `${path} 배열의 Symbol 속성은 JSON으로 표현할 수 없습니다.`;
          }

          const index = NativeNumber(key);
          if (
            !numberIsSafeInteger(index) ||
            index < 0 ||
            index >= length ||
            NativeString(index) !== key
          ) {
            return `${path} 배열에 JSON 배열 항목이 아닌 속성 ${jsonStringify(key)}이 있습니다.`;
          }

          const descriptor = objectGetOwnPropertyDescriptor(value, key);
          if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) {
            return `${path}[${index}]은 getter, setter 또는 숨겨진 속성이 아닌 값이어야 합니다.`;
          }
          arrayPush(indexEntries, { index, value: descriptor.value });
        }

        arraySort(indexEntries, (left, right) => left.index - right.index);
        if (indexEntries.length !== length) {
          let missingIndex = 0;
          while (
            missingIndex < indexEntries.length &&
            indexEntries[missingIndex].index === missingIndex
          ) {
            missingIndex += 1;
          }
          return `${path}[${missingIndex}]은 비어 있는 배열 항목이어서 JSON 값이 아닙니다.`;
        }

        for (let index = indexEntries.length - 1; index >= 0; index -= 1) {
          const entry = indexEntries[index];
          arrayPush(stack, {
            kind: "visit",
            value: entry.value,
            path: `${path}[${entry.index}]`,
            depth: depth + 1,
          });
        }
        continue;
      }

      const prototype = objectGetPrototypeOf(value);
      if (prototype !== nativeObjectPrototype && prototype !== null) {
        return `${path}에는 일반 객체, 배열 또는 JSON 기본값만 사용할 수 있습니다.`;
      }

      const entries = [];
      const ownKeys = reflectOwnKeys(value);
      for (let keyIndex = 0; keyIndex < ownKeys.length; keyIndex += 1) {
        const key = ownKeys[keyIndex];
        if (typeof key === "symbol") {
          return `${path} 객체의 Symbol 키는 JSON으로 표현할 수 없습니다.`;
        }
        const descriptor = objectGetOwnPropertyDescriptor(value, key);
        if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) {
          return `${appendJsonPath(path, key)}은 getter, setter 또는 숨겨진 속성이 아닌 값이어야 합니다.`;
        }
        arrayPush(entries, { key, value: descriptor.value });
      }

      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const entry = entries[index];
        arrayPush(stack, {
          kind: "visit",
          value: entry.value,
          path: appendJsonPath(path, entry.key),
          depth: depth + 1,
        });
      }
    }
  } catch {
    return `${rootPath} 값을 안전하게 검사할 수 없습니다.`;
  }

  return null;
}

function serializeJsonValueSafely(value, space) {
  const issue = findJsonValueIssue(value, "JSON 값");
  if (issue) throw new NativeTypeError(issue);
  const safeValue = cloneJsonValueFromDescriptors(
    value,
    "JSON 값",
    new NativeWeakMap(),
    new NativeWeakSet(),
    true,
  );
  return jsonStringify(safeValue, null, space);
}

export function serializedJsonByteLength(value, optionalMaxBytes) {
  if (
    optionalMaxBytes !== undefined &&
    (!numberIsSafeInteger(optionalMaxBytes) || optionalMaxBytes < 0)
  ) {
    return null;
  }

  try {
    const issue = findJsonValueIssue(value, "JSON 값");
    if (issue) return null;
    return measureSerializedJsonByteLength(value, optionalMaxBytes);
  } catch {
    return null;
  }
}

function primitiveSerializedByteLength(value) {
  if (value !== null && typeof value === "object") return null;
  const serialized = jsonStringify(value);
  return typeof serialized === "string" ? utf8ByteLength(serialized) : null;
}

function measureSerializedJsonByteLength(rootValue, optionalMaxBytes) {
  const maxBytes = optionalMaxBytes ?? MAX_SAFE_JSON_BYTES;
  const exceededBytes = maxBytes < MAX_SAFE_JSON_BYTES ? maxBytes + 1 : null;
  const primitiveBytes = primitiveSerializedByteLength(rootValue);
  if (primitiveBytes !== null) {
    if (primitiveBytes <= maxBytes) return primitiveBytes;
    return exceededBytes;
  }
  if (rootValue === null || typeof rootValue !== "object") return null;

  const measuredBytes = new NativeWeakMap();
  const activeObjects = new NativeWeakSet();
  const stack = [{ kind: "visit", value: rootValue }];

  while (stack.length > 0) {
    const frame = arrayPop(stack);
    if (frame.kind === "finish") {
      weakSetDelete(activeObjects, frame.value);
      let totalBytes = frame.baseBytes;

      for (let index = 0; index < frame.children.length; index += 1) {
        const child = frame.children[index];
        const childBytes =
          child !== null && typeof child === "object"
            ? weakMapGet(measuredBytes, child)
            : primitiveSerializedByteLength(child);
        if (!numberIsSafeInteger(childBytes) || childBytes < 0) return null;
        if (childBytes > maxBytes - totalBytes) return exceededBytes;
        totalBytes += childBytes;
      }

      weakMapSet(measuredBytes, frame.value, totalBytes);
      continue;
    }

    const current = frame.value;
    if (weakMapHas(measuredBytes, current)) continue;
    if (weakSetHas(activeObjects, current)) return null;
    weakSetAdd(activeObjects, current);

    const children = [];
    let baseBytes = 2;
    if (arrayIsArray(current)) {
      const lengthDescriptor = objectGetOwnPropertyDescriptor(current, "length");
      const length = lengthDescriptor?.value;
      if (!numberIsSafeInteger(length) || length < 0) return null;
      if (length > 0) baseBytes += length - 1;

      for (let index = 0; index < length; index += 1) {
        const descriptor = objectGetOwnPropertyDescriptor(current, NativeString(index));
        if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) return null;
        arrayPush(children, descriptor.value);
      }
    } else {
      const prototype = objectGetPrototypeOf(current);
      if (prototype !== nativeObjectPrototype && prototype !== null) return null;
      const keys = objectKeys(current);
      if (keys.length > 0) baseBytes += keys.length - 1;

      for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        const descriptor = objectGetOwnPropertyDescriptor(current, key);
        if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) return null;
        const keyBytes = primitiveSerializedByteLength(key);
        if (!numberIsSafeInteger(keyBytes)) return null;
        if (keyBytes + 1 > maxBytes - baseBytes) return exceededBytes;
        baseBytes += keyBytes + 1;
        arrayPush(children, descriptor.value);
      }
    }

    if (baseBytes > maxBytes) return exceededBytes;
    arrayPush(stack, { kind: "finish", value: current, children, baseBytes });
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      if (
        child !== null &&
        typeof child === "object" &&
        !weakMapHas(measuredBytes, child)
      ) {
        arrayPush(stack, { kind: "visit", value: child });
      }
    }
  }

  const totalBytes = weakMapGet(measuredBytes, rootValue);
  return numberIsSafeInteger(totalBytes) ? totalBytes : null;
}

function inspectDtoFields(value, label, allowedFields, requiredFieldNames, errors) {
  const fieldValues = objectCreate(null);
  let fields;
  try {
    fields = reflectOwnKeys(value);
  } catch {
    arrayPush(errors, `${label}의 필드를 안전하게 확인할 수 없습니다.`);
    return fieldValues;
  }

  const unknownFields = [];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field === "symbol") {
      arrayPush(errors, `${label}에는 Symbol 필드를 사용할 수 없습니다.`);
      continue;
    }
    if (!setHas(allowedFields, field)) {
      arrayPush(unknownFields, field);
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) {
      arrayPush(
        errors,
        `${label}.${field}는 getter, setter 또는 숨겨진 필드가 아닌 값이어야 합니다.`,
      );
      continue;
    }
    defineDataProperty(fieldValues, field, descriptor.value);
  }

  if (unknownFields.length > 0) {
    const message =
      label === "실행 제한 설정"
        ? `허용되지 않은 실행 제한이 있습니다: ${arrayJoin(unknownFields, ", ")}`
        : `${label}에 허용되지 않은 필드가 있습니다: ${arrayJoin(unknownFields, ", ")}`;
    arrayPush(errors, message);
  }

  for (let index = 0; index < requiredFieldNames.length; index += 1) {
    const field = requiredFieldNames[index];
    if (!objectHasOwn(fieldValues, field)) {
      arrayPush(
        errors,
        `${label}.${field}는 필수 own enumerable data 필드여야 합니다.`,
      );
    }
  }
  return fieldValues;
}

function resolveExecutionLimits(overrides, errors) {
  if (overrides === undefined) return DEFAULT_EXECUTION_LIMITS;
  if (!isPlainRecord(overrides)) {
    arrayPush(errors, "실행 제한 설정은 일반 객체여야 합니다.");
    return DEFAULT_EXECUTION_LIMITS;
  }

  const fields = inspectDtoFields(
    overrides,
    "실행 제한 설정",
    LIMIT_FIELDS,
    [],
    errors,
  );

  const resolved = { ...DEFAULT_EXECUTION_LIMITS };
  for (let index = 0; index < LIMIT_FIELD_NAMES.length; index += 1) {
    const field = LIMIT_FIELD_NAMES[index];
    if (!objectHasOwn(fields, field)) continue;
    const value = fields[field];
    if (!numberIsSafeInteger(value) || value <= 0) {
      arrayPush(errors, `실행 제한 ${field}은 0보다 큰 안전한 정수여야 합니다.`);
      continue;
    }
    resolved[field] = value;
  }
  return resolved;
}

function validateExecutionRequestInternal(request, limitOverrides) {
  const errors = [];
  const limits = resolveExecutionLimits(limitOverrides, errors);

  if (!isPlainRecord(request)) {
    arrayPush(errors, "코드 실행 요청은 일반 객체여야 합니다.");
    return errors;
  }
  const requestFields = inspectDtoFields(
    request,
    "코드 실행 요청",
    REQUEST_FIELDS,
    REQUEST_FIELD_NAMES,
    errors,
  );

  if (
    !isNonEmptyString(requestFields.requestId) ||
    regexpExec(STABLE_ID_PATTERN, requestFields.requestId) === null
  ) {
    arrayPush(
      errors,
      "requestId 형식이 올바르지 않습니다. 영문 소문자와 숫자를 하이픈으로 연결해 주세요.",
    );
  }
  if (requestFields.contractVersion !== 1) {
    arrayPush(errors, "지원하는 contractVersion은 1입니다.");
  }
  if (
    !isNonEmptyString(requestFields.questId) ||
    regexpExec(STABLE_ID_PATTERN, requestFields.questId) === null
  ) {
    arrayPush(
      errors,
      "questId 형식이 올바르지 않습니다. 영문 소문자와 숫자를 하이픈으로 연결해 주세요.",
    );
  }
  if (!numberIsSafeInteger(requestFields.questRevision) || requestFields.questRevision <= 0) {
    arrayPush(errors, "questRevision은 1 이상의 안전한 정수여야 합니다.");
  }
  if (requestFields.languageId !== "javascript") {
    arrayPush(errors, 'languageId는 "javascript"여야 합니다.');
  }
  if (requestFields.suite !== "public") {
    arrayPush(errors, 'suite는 "public"이어야 합니다.');
  }

  if (!isNonEmptyString(requestFields.source)) {
    arrayPush(errors, "source는 비어 있지 않은 문자열이어야 합니다.");
  } else {
    const sourceBytes = utf8ByteLength(requestFields.source);
    if (sourceBytes > limits.maxSourceBytes) {
      arrayPush(
        errors,
        `source의 UTF-8 크기는 ${limits.maxSourceBytes}바이트 이하여야 합니다. ` +
          `(현재 ${sourceBytes}바이트)`,
      );
    }
  }

  if (
    !isNonEmptyString(requestFields.entryPoint) ||
    regexpExec(ENTRY_POINT_PATTERN, requestFields.entryPoint) === null ||
    setHas(RESERVED_ENTRY_POINTS, requestFields.entryPoint)
  ) {
    arrayPush(errors, "entryPoint는 예약어가 아닌 안정적인 ASCII JavaScript 식별자여야 합니다.");
  }

  const tests = requestFields.tests;
  if (!arrayIsArray(tests)) {
    arrayPush(errors, "tests에는 한 개 이상의 공개 테스트가 필요합니다.");
    return errors;
  }
  const testsLengthDescriptor = objectGetOwnPropertyDescriptor(tests, "length");
  const testsLength = testsLengthDescriptor?.value;
  if (
    !testsLengthDescriptor ||
    !objectHasOwn(testsLengthDescriptor, "value") ||
    !numberIsSafeInteger(testsLength) ||
    testsLength < 0 ||
    testsLength > 0xffff_ffff
  ) {
    arrayPush(errors, "tests 배열의 length를 안전하게 확인할 수 없습니다.");
    return errors;
  }
  if (testsLength === 0) {
    arrayPush(errors, "tests에는 한 개 이상의 공개 테스트가 필요합니다.");
    return errors;
  }
  if (testsLength > limits.maxTests) {
    arrayPush(errors, `tests는 최대 ${limits.maxTests}개까지 실행할 수 있습니다.`);
  }

  const testIds = new NativeSet();
  const testCountToInspect = mathMin(testsLength, limits.maxTests);
  for (let index = 0; index < testCountToInspect; index += 1) {
    const label = `tests[${index}]`;
    const testDescriptor = objectGetOwnPropertyDescriptor(tests, NativeString(index));
    if (
      !testDescriptor?.enumerable ||
      !objectHasOwn(testDescriptor, "value")
    ) {
      arrayPush(errors, `${label}은 own enumerable data 배열 항목이어야 합니다.`);
      continue;
    }
    const test = testDescriptor.value;
    if (!isPlainRecord(test)) {
      arrayPush(errors, `${label}은 일반 객체여야 합니다.`);
      continue;
    }
    const testFields = inspectDtoFields(
      test,
      label,
      TEST_FIELDS,
      TEST_REQUIRED_FIELD_NAMES,
      errors,
    );

    if (!isNonEmptyString(testFields.id) || regexpExec(STABLE_ID_PATTERN, testFields.id) === null) {
      arrayPush(
        errors,
        `${label}.id 형식이 올바르지 않습니다. 영문 소문자와 숫자를 하이픈으로 연결해 주세요.`,
      );
    } else if (setHas(testIds, testFields.id)) {
      arrayPush(errors, `공개 테스트 ID가 중복됩니다: ${testFields.id}`);
    } else {
      setAdd(testIds, testFields.id);
    }

    if (objectHasOwn(testFields, "label") && !isNonEmptyString(testFields.label)) {
      arrayPush(errors, `${label}.label은 생략하거나 비어 있지 않은 문자열이어야 합니다.`);
    }

    if (!arrayIsArray(testFields.args)) {
      arrayPush(errors, `${label}.args는 배열이어야 합니다.`);
    } else {
      const argsIssue = findJsonValueIssue(testFields.args, `${label}.args`);
      if (argsIssue) {
        arrayPush(errors, argsIssue);
      } else {
        const inputBytes = serializedJsonByteLength(
          testFields.args,
          limits.maxInputBytesPerTest,
        );
        if (inputBytes === null) {
          arrayPush(errors, `${label}.args를 JSON으로 직렬화할 수 없습니다.`);
        } else if (inputBytes > limits.maxInputBytesPerTest) {
          arrayPush(
            errors,
            `${label}.args의 JSON 크기는 ${limits.maxInputBytesPerTest}바이트 이하여야 합니다. ` +
              `(최소 ${inputBytes}바이트)`,
          );
        }
      }
    }

    const expectedIssue = findJsonValueIssue(testFields.expected, `${label}.expected`);
    if (expectedIssue) {
      arrayPush(errors, expectedIssue);
    } else {
      const outputBytes = serializedJsonByteLength(
        testFields.expected,
        limits.maxOutputBytesPerTest,
      );
      if (outputBytes === null) {
        arrayPush(errors, `${label}.expected를 JSON으로 직렬화할 수 없습니다.`);
      } else if (outputBytes > limits.maxOutputBytesPerTest) {
        arrayPush(
          errors,
          `${label}.expected의 JSON 크기는 ${limits.maxOutputBytesPerTest}바이트 이하여야 합니다. ` +
            `(최소 ${outputBytes}바이트)`,
        );
      }
    }
  }

  return errors;
}

function cloneJsonValueFromDescriptors(
  value,
  path,
  copies,
  activeObjects,
  useNullObjectPrototypes = false,
  useNullArrayPrototypes = useNullObjectPrototypes,
) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && numberIsFinite(value))
  ) {
    return value;
  }
  if (typeof value !== "object") {
    throw new NativeTypeError(`${path}의 ${typeof value} 값은 JSON으로 복제할 수 없습니다.`);
  }
  if (weakSetHas(activeObjects, value)) {
    throw new NativeTypeError(`${path}에 순환 참조가 있어 JSON으로 복제할 수 없습니다.`);
  }
  if (weakMapHas(copies, value)) return weakMapGet(copies, value);

  const isArray = arrayIsArray(value);
  if (!isArray) {
    const prototype = objectGetPrototypeOf(value);
    if (prototype !== nativeObjectPrototype && prototype !== null) {
      throw new NativeTypeError(`${path}에는 일반 객체, 배열 또는 JSON 기본값만 사용할 수 있습니다.`);
    }
  }

  let copy;
  if (isArray) {
    const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
    const length = lengthDescriptor?.value;
    if (!numberIsInteger(length) || length < 0 || length > 0xffff_ffff) {
      throw new NativeTypeError(`${path} 배열의 length를 안전하게 복제할 수 없습니다.`);
    }
    copy = new NativeArray(length);
    if (useNullArrayPrototypes) objectSetPrototypeOf(copy, null);
  } else {
    copy = useNullObjectPrototypes ? objectCreate(null) : {};
  }

  weakMapSet(copies, value, copy);
  weakSetAdd(activeObjects, value);
  try {
    const ownKeys = reflectOwnKeys(value);
    for (let keyIndex = 0; keyIndex < ownKeys.length; keyIndex += 1) {
      const key = ownKeys[keyIndex];
      if (isArray && key === "length") continue;
      if (typeof key === "symbol") {
        throw new NativeTypeError(`${path}의 Symbol 키는 JSON으로 복제할 수 없습니다.`);
      }

      const descriptor = objectGetOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !objectHasOwn(descriptor, "value")) {
        throw new NativeTypeError(
          `${appendJsonPath(path, key)}은 getter, setter 또는 숨겨진 속성이 아닌 값이어야 합니다.`,
        );
      }

      defineDataProperty(
        copy,
        key,
        cloneJsonValueFromDescriptors(
          descriptor.value,
          appendJsonPath(path, key),
          copies,
          activeObjects,
          useNullObjectPrototypes,
          useNullArrayPrototypes,
        ),
      );
    }
  } finally {
    weakSetDelete(activeObjects, value);
  }

  return copy;
}

function deepFreezeDescriptorValue(rootValue) {
  const frozenValues = new NativeWeakSet();

  function freezeValue(value) {
    if (value === null || typeof value !== "object" || weakSetHas(frozenValues, value)) {
      return value;
    }

    weakSetAdd(frozenValues, value);
    const ownKeys = reflectOwnKeys(value);
    for (let keyIndex = 0; keyIndex < ownKeys.length; keyIndex += 1) {
      const descriptor = objectGetOwnPropertyDescriptor(value, ownKeys[keyIndex]);
      if (descriptor && objectHasOwn(descriptor, "value")) freezeValue(descriptor.value);
    }
    return objectFreeze(value);
  }

  return freezeValue(rootValue);
}

export function utf8ByteLength(value) {
  if (typeof value !== "string") {
    throw new NativeTypeError("UTF-8 크기를 계산할 문자열이 필요합니다.");
  }
  return typedArrayByteLength(encodeText(value));
}

export function formatJsonValue(value) {
  const issue = findJsonValueIssue(value, "값");
  if (!issue) return serializeJsonValueSafely(value, 2);

  if (value === undefined) return "undefined";
  if (typeof value === "number") return NativeString(value);
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "symbol") return NativeString(value);
  if (typeof value === "function") {
    return `[Function${value.name ? `: ${value.name}` : ""}]`;
  }
  return `[JSON으로 표시할 수 없는 값: ${issue}]`;
}

export function areJsonValuesEqual(left, right) {
  if (findJsonValueIssue(left, "left") || findJsonValueIssue(right, "right")) {
    return false;
  }

  const stack = [[left, right]];
  while (stack.length > 0) {
    const pair = arrayPop(stack);
    const leftValue = pair[0];
    const rightValue = pair[1];
    if (leftValue === rightValue) continue;
    if (
      leftValue === null ||
      rightValue === null ||
      typeof leftValue !== typeof rightValue ||
      typeof leftValue !== "object"
    ) {
      return false;
    }

    const leftIsArray = arrayIsArray(leftValue);
    if (leftIsArray !== arrayIsArray(rightValue)) return false;
    if (leftIsArray) {
      const leftLength = objectGetOwnPropertyDescriptor(leftValue, "length")?.value;
      const rightLength = objectGetOwnPropertyDescriptor(rightValue, "length")?.value;
      if (!numberIsSafeInteger(leftLength) || leftLength !== rightLength) return false;
      for (let index = 0; index < leftLength; index += 1) {
        const leftDescriptor = objectGetOwnPropertyDescriptor(
          leftValue,
          NativeString(index),
        );
        const rightDescriptor = objectGetOwnPropertyDescriptor(
          rightValue,
          NativeString(index),
        );
        if (
          !leftDescriptor?.enumerable ||
          !rightDescriptor?.enumerable ||
          !objectHasOwn(leftDescriptor, "value") ||
          !objectHasOwn(rightDescriptor, "value")
        ) {
          return false;
        }
        arrayPush(stack, [leftDescriptor.value, rightDescriptor.value]);
      }
      continue;
    }

    const leftKeys = objectKeys(leftValue);
    const rightKeys = objectKeys(rightValue);
    if (leftKeys.length !== rightKeys.length) return false;
    for (const key of leftKeys) {
      if (!objectHasOwn(rightValue, key)) return false;
      const leftDescriptor = objectGetOwnPropertyDescriptor(leftValue, key);
      const rightDescriptor = objectGetOwnPropertyDescriptor(rightValue, key);
      if (
        !leftDescriptor?.enumerable ||
        !rightDescriptor?.enumerable ||
        !objectHasOwn(leftDescriptor, "value") ||
        !objectHasOwn(rightDescriptor, "value")
      ) {
        return false;
      }
      arrayPush(stack, [leftDescriptor.value, rightDescriptor.value]);
    }
  }

  return true;
}

export function validateExecutionRequest(request, limitOverrides) {
  try {
    return validateExecutionRequestInternal(request, limitOverrides);
  } catch {
    return ["코드 실행 요청을 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidExecutionRequest(request, limitOverrides) {
  const errors = validateExecutionRequest(request, limitOverrides);
  if (errors.length > 0) {
    throw new NativeError(`코드 실행 요청 검증 실패:\n- ${arrayJoin(errors, "\n- ")}`);
  }
  return request;
}

export function createExecutionRequestSnapshot(request, limitOverrides) {
  assertValidExecutionRequest(request, limitOverrides);

  let snapshot;
  try {
    snapshot = cloneJsonValueFromDescriptors(
      request,
      "코드 실행 요청",
      new NativeWeakMap(),
      new NativeWeakSet(),
      true,
      false,
    );
  } catch (error) {
    let message = "요청을 안전하게 복제할 수 없습니다.";
    try {
      if (typeof error?.message === "string") message = error.message;
    } catch {
      // Proxy traps may throw values whose properties cannot be inspected.
    }
    throw new NativeError(`코드 실행 요청 스냅샷 복제 실패: ${message}`);
  }

  const snapshotErrors = validateExecutionRequest(snapshot, limitOverrides);
  if (snapshotErrors.length > 0) {
    throw new NativeError(
      `코드 실행 요청 스냅샷 재검증 실패:\n- ${arrayJoin(snapshotErrors, "\n- ")}`,
    );
  }

  return deepFreezeDescriptorValue(snapshot);
}

export function summarizeTestResults(testResults) {
  if (!arrayIsArray(testResults)) {
    throw new NativeTypeError("요약할 테스트 결과 배열이 필요합니다.");
  }

  const counts = {};
  for (let index = 0; index < OUTCOME_NAMES.length; index += 1) {
    defineDataProperty(counts, OUTCOME_NAMES[index], 0);
  }
  for (let index = 0; index < testResults.length; index += 1) {
    const result = testResults[index];
    if (!isPlainRecord(result) || !setHas(OUTCOME_VALUES, result.outcome)) {
      throw new NativeTypeError(`testResults[${index}].outcome이 올바르지 않습니다.`);
    }
    counts[result.outcome] += 1;
  }

  let outcome = testResults.length === 0 ? GRADING_OUTCOMES.NOT_RUN : GRADING_OUTCOMES.PASSED;
  for (let index = 0; index < OVERALL_OUTCOME_PRIORITY.length; index += 1) {
    const candidate = OVERALL_OUTCOME_PRIORITY[index];
    if (counts[candidate] > 0) {
      outcome = candidate;
      break;
    }
  }

  return {
    outcome,
    total: testResults.length,
    passed: counts.passed,
    wrong_answer: counts.wrong_answer,
    syntax_error: counts.syntax_error,
    runtime_error: counts.runtime_error,
    timeout: counts.timeout,
    output_limit: counts.output_limit,
    cancelled: counts.cancelled,
    engine_error: counts.engine_error,
    not_run: counts.not_run,
  };
}
