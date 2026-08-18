const START_FIELDS = Object.freeze(["kind", "requestId", "ownerId", "mode"]);
const START_FIELD_SET = new Set(START_FIELDS);
const CANCELLATION_REASONS = new Set(["user", "navigation"]);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function readStartInput(input) {
  if (!isPlainRecord(input)) {
    throw new TypeError("실행 시작 정보는 일반 객체여야 합니다.");
  }

  const fields = {};
  const presentFields = new Set();
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string" || !START_FIELD_SET.has(key)) {
      throw new TypeError(`실행 시작 정보에 허용되지 않은 필드가 있습니다: ${String(key)}`);
    }

    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(
        `실행 시작 정보.${key}는 getter나 숨겨진 필드가 아닌 값이어야 합니다.`,
      );
    }
    presentFields.add(key);
    fields[key] = descriptor.value;
  }

  for (const field of START_FIELDS) {
    if (!presentFields.has(field)) {
      throw new TypeError(`실행 시작 정보.${field}는 필수 필드입니다.`);
    }
    if (typeof fields[field] !== "string" || fields[field].trim().length === 0) {
      throw new TypeError(`실행 시작 정보.${field}는 비어 있지 않은 문자열이어야 합니다.`);
    }
  }

  return fields;
}

function assertCancellationReason(reason) {
  if (!CANCELLATION_REASONS.has(reason)) {
    throw new TypeError('실행 취소 사유는 "user" 또는 "navigation"이어야 합니다.');
  }
}

function createExecutionRecord(input) {
  const controller = new AbortController();
  const state = { cancellationReason: null };
  const handle = Object.freeze({
    kind: input.kind,
    requestId: input.requestId,
    ownerId: input.ownerId,
    mode: input.mode,
    signal: controller.signal,
    get cancellationReason() {
      return state.cancellationReason;
    },
  });

  return { controller, handle, state };
}

export class ExecutionCoordinator {
  #activeRecord = null;

  get active() {
    return this.#activeRecord?.handle ?? null;
  }

  start(input) {
    const fields = readStartInput(input);
    if (this.#activeRecord !== null) return null;

    const record = createExecutionRecord(fields);
    this.#activeRecord = record;
    return record.handle;
  }

  isActive(handle) {
    return this.#activeRecord?.handle === handle;
  }

  cancel(handle, reason = "user") {
    assertCancellationReason(reason);
    const record = this.#activeRecord;
    if (record === null || record.handle !== handle) return false;

    if (record.state.cancellationReason === null || reason === "navigation") {
      record.state.cancellationReason = reason;
    }
    if (!record.controller.signal.aborted) record.controller.abort(reason);
    return true;
  }

  cancelActive(reason = "user") {
    assertCancellationReason(reason);
    const handle = this.#activeRecord?.handle;
    return handle === undefined ? false : this.cancel(handle, reason);
  }

  finish(handle) {
    if (this.#activeRecord?.handle !== handle) return false;
    this.#activeRecord = null;
    return true;
  }
}
