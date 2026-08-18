function assertConstructorOptions(options) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("DraftSaveCoordinator 설정 객체가 필요합니다.");
  }

  if (
    typeof options.delayMs !== "number" ||
    !Number.isFinite(options.delayMs) ||
    options.delayMs < 0
  ) {
    throw new TypeError("delayMs는 0 이상의 유한한 숫자여야 합니다.");
  }

  for (const callbackName of ["persist", "setTimer", "clearTimer"]) {
    if (typeof options[callbackName] !== "function") {
      throw new TypeError(`${callbackName}는 함수여야 합니다.`);
    }
  }
}

function assertOwnerKey(ownerKey) {
  if (typeof ownerKey !== "string" || ownerKey.trim().length === 0) {
    throw new TypeError("ownerKey는 비어 있지 않은 문자열이어야 합니다.");
  }
}

export class DraftSaveCoordinator {
  #delayMs;
  #persist;
  #setTimer;
  #clearTimer;
  #pending = null;
  #timerHandle;
  #hasTimer = false;
  #timerGeneration = 0;

  constructor(options) {
    assertConstructorOptions(options);

    this.#delayMs = options.delayMs;
    this.#persist = options.persist;
    this.#setTimer = options.setTimer;
    this.#clearTimer = options.clearTimer;
  }

  schedule(ownerKey, snapshot) {
    assertOwnerKey(ownerKey);

    if (this.#pending !== null && this.#pending.ownerKey !== ownerKey) {
      this.flush();
    } else {
      this.#clearScheduledTimer();
    }

    this.#pending = { ownerKey, snapshot };
    this.#scheduleTimer();
  }

  flush() {
    if (this.#pending === null) return false;

    const { snapshot } = this.#pending;
    this.#pending = null;
    this.#clearScheduledTimer();
    this.#persist(snapshot);
    return true;
  }

  cancel() {
    const hadPendingSave = this.#pending !== null || this.#hasTimer;
    this.#pending = null;
    this.#clearScheduledTimer();
    return hadPendingSave;
  }

  #scheduleTimer() {
    const generation = this.#timerGeneration + 1;
    this.#timerGeneration = generation;
    let callbackRanSynchronously = false;

    const timerHandle = this.#setTimer(() => {
      callbackRanSynchronously = true;
      if (generation !== this.#timerGeneration) return;

      this.#hasTimer = false;
      this.#timerHandle = undefined;
      const pending = this.#pending;
      this.#pending = null;
      if (pending !== null) this.#persist(pending.snapshot);
    }, this.#delayMs);

    if (callbackRanSynchronously || generation !== this.#timerGeneration) return;
    this.#timerHandle = timerHandle;
    this.#hasTimer = true;
  }

  #clearScheduledTimer() {
    this.#timerGeneration += 1;
    if (!this.#hasTimer) return;

    const timerHandle = this.#timerHandle;
    this.#timerHandle = undefined;
    this.#hasTimer = false;
    this.#clearTimer(timerHandle);
  }
}
