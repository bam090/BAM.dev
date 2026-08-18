import assert from "node:assert/strict";
import test from "node:test";
import { DraftSaveCoordinator } from "../src/core/draft-save-coordinator.js";

function createTimerHarness() {
  const callbacks = new Map();
  const clearedTimerIds = [];
  const delays = [];
  let nextTimerId = 1;

  return {
    callbacks,
    clearedTimerIds,
    delays,
    setTimer(callback, delayMs) {
      const timerId = nextTimerId;
      nextTimerId += 1;
      callbacks.set(timerId, callback);
      delays.push(delayMs);
      return timerId;
    },
    clearTimer(timerId) {
      // 실제 타이머 취소 뒤에도 이미 큐에 들어간 콜백이 실행되는 상황을 재현하기 위해
      // 콜백은 Map에 남겨 둔다.
      clearedTimerIds.push(timerId);
    },
    fire(timerId) {
      const callback = callbacks.get(timerId);
      assert.equal(typeof callback, "function", `${timerId}번 타이머가 존재해야 합니다.`);
      callback();
    },
  };
}

function createCoordinator() {
  const timerHarness = createTimerHarness();
  const persistedSnapshots = [];
  const coordinator = new DraftSaveCoordinator({
    delayMs: 250,
    persist(snapshot) {
      persistedSnapshots.push(snapshot);
    },
    setTimer: timerHarness.setTimer,
    clearTimer: timerHarness.clearTimer,
  });

  return { coordinator, persistedSnapshots, timerHarness };
}

test("생성자 설정과 ownerKey를 검증한다", () => {
  const validOptions = {
    delayMs: 250,
    persist() {},
    setTimer() {
      return 1;
    },
    clearTimer() {},
  };

  assert.throws(() => new DraftSaveCoordinator(), /설정 객체/);
  for (const delayMs of [-1, Number.NaN, Number.POSITIVE_INFINITY, "250"]) {
    assert.throws(
      () => new DraftSaveCoordinator({ ...validOptions, delayMs }),
      /delayMs/,
    );
  }
  for (const callbackName of ["persist", "setTimer", "clearTimer"]) {
    assert.throws(
      () => new DraftSaveCoordinator({ ...validOptions, [callbackName]: null }),
      new RegExp(callbackName),
    );
  }

  const { coordinator } = createCoordinator();
  for (const ownerKey of [undefined, null, "", "   ", 17]) {
    assert.throws(() => coordinator.schedule(ownerKey, {}), /ownerKey/);
  }
});

test("같은 소유자의 연속 입력은 마지막 스냅샷 한 건으로 debounce한다", () => {
  const { coordinator, persistedSnapshots, timerHarness } = createCoordinator();
  const firstSnapshot = Object.freeze({ source: "첫 입력" });
  const latestSnapshot = Object.freeze({ source: "마지막 입력" });

  coordinator.schedule("quest:one", firstSnapshot);
  coordinator.schedule("quest:one", latestSnapshot);

  assert.deepEqual(timerHarness.delays, [250, 250]);
  assert.deepEqual(timerHarness.clearedTimerIds, [1]);
  assert.deepEqual(persistedSnapshots, []);

  timerHarness.fire(1);
  assert.deepEqual(persistedSnapshots, [], "취소된 이전 타이머 콜백은 무시해야 합니다.");
  timerHarness.fire(2);

  assert.equal(persistedSnapshots.length, 1);
  assert.equal(persistedSnapshots[0], latestSnapshot, "스냅샷 객체를 그대로 전달해야 합니다.");
  assert.deepEqual(latestSnapshot, { source: "마지막 입력" });
});

test("소유자가 바뀌면 이전 최신 스냅샷을 즉시 저장한다", () => {
  const { coordinator, persistedSnapshots, timerHarness } = createCoordinator();
  const firstOwnerSnapshot = { source: "첫 문제 코드" };
  const secondOwnerSnapshot = { source: "둘째 문제 코드" };

  coordinator.schedule("quest:first", firstOwnerSnapshot);
  coordinator.schedule("quest:second", secondOwnerSnapshot);

  assert.deepEqual(persistedSnapshots, [firstOwnerSnapshot]);
  assert.deepEqual(timerHarness.clearedTimerIds, [1]);

  timerHarness.fire(1);
  assert.deepEqual(persistedSnapshots, [firstOwnerSnapshot]);
  timerHarness.fire(2);
  assert.deepEqual(persistedSnapshots, [firstOwnerSnapshot, secondOwnerSnapshot]);
});

test("flush는 대기 스냅샷을 동기 저장하고 stale 타이머를 무시한다", () => {
  const { coordinator, persistedSnapshots, timerHarness } = createCoordinator();
  const snapshot = { source: "이동 직전 코드" };

  coordinator.schedule("coding-test:one", snapshot);

  assert.equal(coordinator.flush(), true);
  assert.deepEqual(persistedSnapshots, [snapshot]);
  assert.equal(coordinator.flush(), false);

  timerHarness.fire(1);
  assert.deepEqual(persistedSnapshots, [snapshot]);
});

test("cancel은 타이머와 대기를 버리고 존재 여부를 반환한다", () => {
  const { coordinator, persistedSnapshots, timerHarness } = createCoordinator();

  assert.equal(coordinator.cancel(), false);
  coordinator.schedule("quest:cancelled", { source: "저장하지 않을 코드" });
  assert.equal(coordinator.cancel(), true);
  assert.deepEqual(timerHarness.clearedTimerIds, [1]);
  assert.equal(coordinator.cancel(), false);

  timerHarness.fire(1);
  assert.deepEqual(persistedSnapshots, []);
});

test("동기 실행되는 타이머 구현에서도 스냅샷을 한 번만 저장한다", () => {
  const persistedSnapshots = [];
  const snapshot = { source: "즉시 저장" };
  let clearCount = 0;
  const coordinator = new DraftSaveCoordinator({
    delayMs: 0,
    persist(value) {
      persistedSnapshots.push(value);
    },
    setTimer(callback) {
      callback();
      return 1;
    },
    clearTimer() {
      clearCount += 1;
    },
  });

  coordinator.schedule("quest:sync", snapshot);

  assert.deepEqual(persistedSnapshots, [snapshot]);
  assert.equal(coordinator.flush(), false);
  assert.equal(coordinator.cancel(), false);
  assert.equal(clearCount, 0);
});
