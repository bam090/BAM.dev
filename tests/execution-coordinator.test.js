import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionCoordinator } from "../src/core/execution-coordinator.js";

function createStartInput(overrides = {}) {
  return {
    kind: "code-quest",
    requestId: "quest-run-one",
    ownerId: "javascript:delivery-fee-policy",
    mode: "run",
    ...overrides,
  };
}

test("start는 exact 일반 객체와 비어 있지 않은 네 문자열만 허용한다", () => {
  const coordinator = new ExecutionCoordinator();

  for (const input of [undefined, null, [], "quest"]) {
    assert.throws(() => coordinator.start(input), /일반 객체/);
  }

  const missingMode = createStartInput();
  delete missingMode.mode;
  assert.throws(() => coordinator.start(missingMode), /mode.*필수/);
  assert.throws(
    () => coordinator.start({ ...createStartInput(), extra: true }),
    /허용되지 않은 필드.*extra/,
  );

  const symbolField = createStartInput();
  symbolField[Symbol("extra")] = true;
  assert.throws(() => coordinator.start(symbolField), /허용되지 않은 필드/);

  const accessorInput = createStartInput();
  Object.defineProperty(accessorInput, "mode", {
    enumerable: true,
    get() {
      throw new Error("getter를 실행하면 안 됩니다.");
    },
  });
  assert.throws(() => coordinator.start(accessorInput), /getter나 숨겨진 필드/);

  for (const field of ["kind", "requestId", "ownerId", "mode"]) {
    for (const invalidValue of ["", "   ", null, 17]) {
      assert.throws(
        () => coordinator.start(createStartInput({ [field]: invalidValue })),
        new RegExp(field),
      );
    }
  }
});

test("start는 내부 controller를 숨긴 읽기 전용 실행 핸들을 만든다", () => {
  const coordinator = new ExecutionCoordinator();
  const input = createStartInput();
  const handle = coordinator.start(input);

  assert.ok(handle);
  assert.equal(Object.isFrozen(handle), true);
  assert.deepEqual(Object.keys(handle).sort(), [
    "cancellationReason",
    "kind",
    "mode",
    "ownerId",
    "requestId",
    "signal",
  ]);
  assert.equal("controller" in handle, false);
  assert.equal(handle.kind, input.kind);
  assert.equal(handle.requestId, input.requestId);
  assert.equal(handle.ownerId, input.ownerId);
  assert.equal(handle.mode, input.mode);
  assert.equal(handle.signal.aborted, false);
  assert.equal(handle.cancellationReason, null);
  assert.equal(coordinator.isActive(handle), true);
  assert.throws(() => {
    handle.mode = "submit";
  }, TypeError);
});

test("활성 실행이 있으면 두 번째 실행을 시작하지 않는다", () => {
  const coordinator = new ExecutionCoordinator();
  const firstHandle = coordinator.start(createStartInput());

  assert.equal(coordinator.active, firstHandle);

  assert.equal(
    coordinator.start(
      createStartInput({
        kind: "coding-test",
        requestId: "coding-test-submit-two",
        ownerId: "javascript:two-sum",
        mode: "submit",
      }),
    ),
    null,
  );
  assert.equal(coordinator.isActive(firstHandle), true);
});

test("active는 controller를 노출하지 않고 현재 핸들 또는 null만 반환한다", () => {
  const coordinator = new ExecutionCoordinator();

  assert.equal(coordinator.active, null);
  const handle = coordinator.start(createStartInput());
  assert.equal(coordinator.active, handle);
  assert.equal("controller" in coordinator.active, false);

  coordinator.finish(handle);
  assert.equal(coordinator.active, null);
});

test("cancel은 현재 핸들만 취소하고 navigation 사유를 사용자 취소보다 우선한다", () => {
  const coordinator = new ExecutionCoordinator();
  const handle = coordinator.start(createStartInput());

  assert.equal(coordinator.cancel({}, "user"), false);
  assert.equal(handle.signal.aborted, false);
  assert.equal(coordinator.cancel(handle), true);
  assert.equal(handle.signal.aborted, true);
  assert.equal(handle.signal.reason, "user");
  assert.equal(handle.cancellationReason, "user");

  assert.equal(coordinator.cancel(handle, "navigation"), true);
  assert.equal(handle.cancellationReason, "navigation");
  assert.equal(
    handle.signal.reason,
    "user",
    "이미 중단된 AbortSignal의 reason과 별개로 화면 이탈 사유를 승격해야 합니다.",
  );
  assert.equal(coordinator.cancel(handle, "user"), true);
  assert.equal(handle.cancellationReason, "navigation");
});

test("취소 사유는 user와 navigation만 허용한다", () => {
  const coordinator = new ExecutionCoordinator();
  const handle = coordinator.start(createStartInput());

  for (const reason of ["", "timeout", null, undefined]) {
    if (reason === undefined) continue;
    assert.throws(() => coordinator.cancel(handle, reason), /취소 사유/);
    assert.throws(() => coordinator.cancelActive(reason), /취소 사유/);
  }
  assert.equal(handle.signal.aborted, false);
});

test("finish는 현재 실행만 해제하고 stale 핸들은 새 실행을 방해하지 못한다", () => {
  const coordinator = new ExecutionCoordinator();
  const firstHandle = coordinator.start(createStartInput());

  assert.equal(coordinator.finish({}), false);
  assert.equal(coordinator.isActive(firstHandle), true);
  assert.equal(coordinator.finish(firstHandle), true);
  assert.equal(coordinator.finish(firstHandle), false);

  const secondHandle = coordinator.start(
    createStartInput({
      requestId: "quest-run-two",
      ownerId: "javascript:second-quest",
    }),
  );
  assert.ok(secondHandle);
  assert.notEqual(secondHandle, firstHandle);
  assert.equal(coordinator.cancel(firstHandle, "navigation"), false);
  assert.equal(coordinator.finish(firstHandle), false);
  assert.equal(coordinator.isActive(secondHandle), true);
  assert.equal(secondHandle.signal.aborted, false);
});

test("cancelActive는 활성 실행을 편의 취소하고 활성 여부를 유지한다", () => {
  const coordinator = new ExecutionCoordinator();

  assert.equal(coordinator.cancelActive("navigation"), false);
  const handle = coordinator.start(createStartInput());
  assert.equal(coordinator.cancelActive("navigation"), true);
  assert.equal(handle.signal.aborted, true);
  assert.equal(handle.cancellationReason, "navigation");
  assert.equal(coordinator.isActive(handle), true);
  assert.equal(coordinator.finish(handle), true);
  assert.equal(coordinator.isActive(handle), false);
});
