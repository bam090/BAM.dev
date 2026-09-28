import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { JAVA_RUNTIME_LIMITS, __test as supervisorTest } from "../desktop/runtime/supervisor.mjs";

test.beforeEach(() => {
  supervisorTest.resetIsolationRuntimePoisoned();
});

test.afterEach(() => {
  supervisorTest.resetIsolationRuntimePoisoned();
});

function createFakeClock() {
  let now = 0;
  let nextId = 1;
  const timeouts = new Map();
  const intervals = new Map();
  const setTimeoutFn = (callback, delay = 0) => {
    const id = nextId++;
    timeouts.set(id, { callback, dueAt: now + delay });
    return id;
  };
  return {
    activeCount: () => timeouts.size + intervals.size,
    advanceBy(duration) {
      const target = now + duration;
      while (true) {
        const next = [...timeouts.entries()]
          .filter(([, timer]) => timer.dueAt <= target)
          .sort((left, right) => left[1].dueAt - right[1].dueAt)[0];
        if (!next) break;
        const [id, timer] = next;
        timeouts.delete(id);
        now = timer.dueAt;
        timer.callback();
      }
      now = target;
    },
    clearIntervalFn: (id) => intervals.delete(id),
    clearTimeoutFn: (id) => timeouts.delete(id),
    runIntervals() {
      for (const callback of [...intervals.values()]) callback();
    },
    setIntervalFn: (callback) => {
      const id = nextId++;
      intervals.set(id, callback);
      return id;
    },
    setTimeoutFn,
  };
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function createFakeStream() {
  const stream = new EventEmitter();
  stream.destroyCalls = 0;
  stream.unrefCalls = 0;
  stream.destroy = () => { stream.destroyCalls += 1; };
  stream.setEncoding = () => stream;
  stream.unref = () => { stream.unrefCalls += 1; };
  return stream;
}

function createFakeChild(pid = 4242) {
  const child = new EventEmitter();
  child.pid = pid;
  child.exitCode = null;
  child.signalCode = null;
  child.stdout = createFakeStream();
  child.stderr = createFakeStream();
  child.stdio = [null, child.stdout, child.stderr];
  child.unrefCalls = 0;
  child.unref = () => { child.unrefCalls += 1; };
  return child;
}

function emitExit(child, code = 0, signal = null) {
  child.exitCode = code;
  child.signalCode = signal;
  child.emit("exit", code, signal);
}

function emitClose(child) {
  child.emit("close", child.exitCode, child.signalCode);
}

function processConfig(overrides = {}) {
  return {
    profileName: "compile.sb",
    parameters: { WORK_ROOT: "/virtual/work-root" },
    executable: "/virtual/javac",
    args: [],
    environment: {},
    timeoutMs: 10,
    rssLimitBytes: 1024,
    ...overrides,
  };
}

function fakeDependencies(
  clock,
  child,
  observations = [{ present: false, rssBytes: 0, observerCloseObserved: true }],
) {
  const signals = [];
  let observationIndex = 0;
  return {
    dependencies: {
      spawnProcess: () => child,
      terminateChildGroup: (target, signal) => signals.push([target.pid, signal]),
      inspectChildProcessGroup: async (pid, options) => {
        const next = observations[Math.min(observationIndex++, observations.length - 1)];
        if (typeof next === "function") return next(pid, options);
        if (next instanceof Error) throw next;
        return next;
      },
      setTimeoutFn: clock.setTimeoutFn,
      clearTimeoutFn: clock.clearTimeoutFn,
      setIntervalFn: clock.setIntervalFn,
      clearIntervalFn: clock.clearIntervalFn,
    },
    observationCount: () => observationIndex,
    signals,
  };
}

async function flushMicrotasks(rounds = 6) {
  for (let index = 0; index < rounds; index += 1) await Promise.resolve();
}

function assertNoTimer(clock) {
  assert.equal(clock.activeCount(), 0, "fake timer 또는 monitor interval이 남았습니다.");
}

function compileParameters(jdkRoot = "/trusted/BAM.dev/runtime/jdk/Contents/Home") {
  return supervisorTest.compileSandboxParameters(
    jdkRoot,
    `${jdkRoot}/bin/javac`,
    "/scratch/work",
  );
}

function expectedCompileParameters(jdkRoot = "/trusted/BAM.dev/runtime/jdk/Contents/Home") {
  const ancestors = [
    "/",
    "/trusted",
    "/trusted/BAM.dev",
    "/trusted/BAM.dev/runtime",
    "/trusted/BAM.dev/runtime/jdk",
    "/trusted/BAM.dev/runtime/jdk/Contents",
    jdkRoot,
    `${jdkRoot}/bin`,
  ];
  const parameters = { JDK_ROOT: jdkRoot, WORK_ROOT: "/scratch/work" };
  for (let index = 0; index < 16; index += 1) {
    parameters[`METADATA_ANCESTOR_${String(index + 1).padStart(2, "0")}`] = (
      ancestors[index] ?? jdkRoot
    );
  }
  return parameters;
}

const RUNTIME_PATHS = Object.freeze({
  jdkRoot: "/trusted/BAM.dev/runtime/jdk/Contents/Home",
  executable: "/trusted/BAM.dev/runtime/jdk/Contents/Home/bin/java",
  runnerRoot: "/trusted/BAM.dev/runtime/java-runner",
  classesRoot: "/scratch/work/classes",
  homeRoot: "/scratch/work/home",
  tempRoot: "/scratch/work/tmp",
});

function runtimeParameters(overrides = {}) {
  return supervisorTest.runtimeSandboxParameters({
    ...RUNTIME_PATHS,
    ...overrides,
  });
}

function expectedRuntimeParameters() {
  const ancestors = [
    "/",
    "/scratch",
    "/trusted",
    "/scratch/work",
    "/trusted/BAM.dev",
    "/scratch/work/tmp",
    "/scratch/work/home",
    "/scratch/work/classes",
    "/trusted/BAM.dev/runtime",
    "/trusted/BAM.dev/runtime/jdk",
    RUNTIME_PATHS.runnerRoot,
    "/trusted/BAM.dev/runtime/jdk/Contents",
    RUNTIME_PATHS.jdkRoot,
    "/trusted/BAM.dev/runtime/jdk/Contents/Home/bin",
  ];
  const parameters = { JDK_ROOT: RUNTIME_PATHS.jdkRoot };
  for (let index = 0; index < 32; index += 1) {
    parameters[`METADATA_ANCESTOR_${String(index + 1).padStart(2, "0")}`] = (
      ancestors[index] ?? RUNTIME_PATHS.jdkRoot
    );
  }
  return parameters;
}

async function assertScratchPreserved() {
  let removals = 0;
  await supervisorTest.finishJavaRun(
    { outcome: "engine_error", tests: [] },
    "/virtual/work-root",
    true,
    async () => { removals += 1; },
  );
  assert.equal(removals, 0);
}

test("compile metadata는 trusted JDK ancestor를 정규화·중복 제거하고 16개로 고정한다", () => {
  const jdkRoot = "/trusted/BAM.dev/runtime/jdk/Contents/Home";
  const parameters = compileParameters(jdkRoot);
  assert.deepEqual(parameters, expectedCompileParameters(jdkRoot));
  for (let index = 9; index <= 16; index += 1) {
    assert.equal(
      parameters[`METADATA_ANCESTOR_${String(index).padStart(2, "0")}`],
      jdkRoot,
      "미사용 metadata는 이미 JDK_ROOT subpath에 포함된 literal만 재사용해야 합니다.",
    );
  }
});

test("compile metadata의 깊이와 신뢰 경로 입력은 sandbox spawn 전에 거부한다", () => {
  const deepJdkRoot = `/${Array.from({ length: 16 }, (_, index) => `level-${index + 1}`).join("/")}`;
  assert.throws(() => supervisorTest.compileSandboxParameters(
    deepJdkRoot,
    `${deepJdkRoot}/bin/javac`,
    "/scratch/work",
  ));
  assert.throws(() => supervisorTest.compileSandboxParameters(
    "relative/jdk",
    "/trusted/jdk/bin/javac",
    "/scratch/work",
  ));
  assert.throws(() => supervisorTest.compileSandboxParameters(
    "/trusted/jdk",
    "relative/jdk/bin/javac",
    "/scratch/work",
  ));
  assert.throws(() => supervisorTest.compileSandboxParameters(
    "/trusted/jdk",
    "/trusted/jdk/bin/java",
    "/scratch/work",
  ));
  assert.throws(() => supervisorTest.compileSandboxParameters(
    null,
    "/trusted/jdk/bin/javac",
    "/scratch/work",
  ));
});

test("runtime metadata는 여섯 trusted root의 ancestor를 32개 literal로 제한한다", () => {
  const parameters = runtimeParameters();
  assert.deepEqual(parameters, expectedRuntimeParameters());
  assert.equal(
    Object.values(parameters).includes("/scratch/work/sibling"),
    false,
    "입력 root와 무관한 sibling metadata는 허용하지 않아야 합니다.",
  );
  for (let index = 15; index <= 32; index += 1) {
    assert.equal(
      parameters[`METADATA_ANCESTOR_${String(index).padStart(2, "0")}`],
      RUNTIME_PATHS.jdkRoot,
    );
  }
  const deepJdkRoot = `/${Array.from({ length: 32 }, (_, index) => `level-${index + 1}`).join("/")}`;
  assert.throws(() => runtimeParameters({
    jdkRoot: deepJdkRoot,
    executable: `${deepJdkRoot}/bin/java`,
  }));
  for (const name of Object.keys(RUNTIME_PATHS)) {
    assert.throws(() => runtimeParameters({ [name]: "" }));
    assert.throws(() => runtimeParameters({ [name]: `relative/${name}` }));
  }
  assert.throws(() => runtimeParameters({ executable: `${RUNTIME_PATHS.jdkRoot}/bin/javac` }));
  assert.throws(() => runtimeParameters({ classesRoot: "/scratch/work/./classes" }));
});

test("compile/runtime profile은 metadata 외 권한 계약을 유지한다", async () => {
  const compileProfile = await readFile(
    new URL("../desktop/runtime/profiles/compile.sb", import.meta.url),
    "utf8",
  );
  const runtimeProfile = await readFile(
    new URL("../desktop/runtime/profiles/runtime.sb", import.meta.url),
    "utf8",
  );
  const digest = (content) => createHash("sha256").update(content).digest("hex");

  assert.equal(
    digest(compileProfile),
    "9a080e97444358826fc9ebbe185f055e6c0548c7945ce23d57adb198b463df79",
  );
  assert.equal(
    digest(runtimeProfile.replace(
      /\(allow file-read-metadata[\s\S]*?\n(?=\(allow)/u,
      "(allow file-read-metadata <runtime metadata checked separately>)\n",
    )),
    "0fa901fa96374b63a9f843ababf24bce61601bcf02326c8a0b56707a40d0736f",
  );
  const metadataParameterNames = Array.from(
    { length: 32 },
    (_, index) => `METADATA_ANCESTOR_${String(index + 1).padStart(2, "0")}`,
  );
  assert.deepEqual(
    [...compileProfile.matchAll(/\(literal \(param "METADATA_ANCESTOR_(\d{2})"\)\)/g)].map(([, index]) => index),
    Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(2, "0")),
  );
  const runtimeMetadata = runtimeProfile.match(/\(allow file-read-metadata[\s\S]*?\n(?=\(allow)/u);
  assert.ok(runtimeMetadata);
  assert.equal(
    runtimeMetadata[0].trim(),
    [
      "(allow file-read-metadata",
      "  (literal \"/etc\")",
      "  (literal \"/tmp\")",
      "  (literal \"/var\")",
      "  (literal \"/private\")",
      "  (literal \"/Library\")",
      ...metadataParameterNames.map((name, index) => (
        `  (literal (param \"${name}\"))${index === metadataParameterNames.length - 1 ? ")" : ""}`
      )),
    ].join("\n"),
  );
});

test("spawn 전 실패와 정상 종료는 child 생성 및 3증거를 구분한다", async (t) => {
  await t.test("spawn 전 실패", async () => {
    const clock = createFakeClock();
    const startError = new Error("fake spawn failure");
    const execution = await supervisorTest.runSandboxedProcess(processConfig(), {
      spawnProcess: () => { throw startError; },
      setTimeoutFn: clock.setTimeoutFn,
      clearTimeoutFn: clock.clearTimeoutFn,
      setIntervalFn: clock.setIntervalFn,
      clearIntervalFn: clock.clearIntervalFn,
    });
    assert.equal(execution.startError, startError);
    assert.deepEqual(execution.terminationEvidence, {
      childCreated: false,
      pid: null,
      exitObserved: false,
      closeObserved: false,
      processGroupAbsent: null,
      processObserverCloseObserved: null,
      observerUnreaped: false,
      cleanupFailed: false,
    });
    assertNoTimer(clock);
  });

  await t.test("정상 exit·close·group absent", async () => {
    const clock = createFakeClock();
    const child = createFakeChild();
    const fake = fakeDependencies(clock, child);
    const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
    emitExit(child);
    emitClose(child);
    const execution = await resultPromise;
    assert.equal(execution.terminationReason, null);
    assert.deepEqual(execution.terminationEvidence, {
      childCreated: true,
      pid: 4242,
      exitObserved: true,
      closeObserved: true,
      processGroupAbsent: true,
      processObserverCloseObserved: true,
      observerUnreaped: false,
      cleanupFailed: false,
    });
    assert.deepEqual(fake.signals, []);
    assertNoTimer(clock);

    const removals = [];
    await supervisorTest.finishJavaRun(
      { outcome: "passed", tests: [{ outcome: "passed" }] },
      "/virtual/work-root",
      false,
      async (...args) => removals.push(args),
    );
    assert.deepEqual(removals, [["/virtual/work-root", { recursive: true, force: true }]]);
  });
});

test("종료 전 RSS present 결과는 버리고 fresh absent 뒤에만 정상 완료한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5001);
  const oldObservation = createDeferred();
  const freshObservation = createDeferred();
  const fake = fakeDependencies(clock, child, [
    () => oldObservation.promise,
    () => freshObservation.promise,
  ]);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
  let completed = false;
  void resultPromise.then(() => { completed = true; });

  clock.runIntervals();
  await flushMicrotasks(18);
  assert.equal(fake.observationCount(), 1);
  emitExit(child);
  emitClose(child);
  await flushMicrotasks(18);
  assert.equal(fake.observationCount(), 1, "exit·close는 진행 중인 old observer를 공유해야 합니다.");

  oldObservation.resolve({ present: true, rssBytes: 128, observerCloseObserved: true });
  await flushMicrotasks(18);
  assert.equal(completed, false, "종료 전 present 결과로 lingering 판정을 시작하면 안 됩니다.");
  assert.equal(fake.observationCount(), 2, "종료 뒤 fresh observer를 정확히 하나 시작해야 합니다.");
  assert.deepEqual(fake.signals, []);

  freshObservation.resolve({ present: false, rssBytes: 0, observerCloseObserved: true });
  const execution = await resultPromise;
  assert.equal(execution.terminationReason, null);
  assert.equal(execution.terminationEvidence.processGroupAbsent, true);
  assert.equal(execution.terminationEvidence.processObserverCloseObserved, true);
  assert.deepEqual(fake.signals, []);
  assertNoTimer(clock);
});

test("종료 전 RSS absent 결과는 버리고 fresh present descendant를 기존 절차로 회수한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5002);
  const oldObservation = createDeferred();
  const freshObservation = createDeferred();
  const fake = fakeDependencies(clock, child, [
    () => oldObservation.promise,
    () => freshObservation.promise,
    { present: false, rssBytes: 0, observerCloseObserved: true },
  ]);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
  let completed = false;
  void resultPromise.then(() => { completed = true; });

  clock.runIntervals();
  await flushMicrotasks();
  emitExit(child);
  emitClose(child);
  oldObservation.resolve({ present: false, rssBytes: 0, observerCloseObserved: true });
  await flushMicrotasks(18);
  assert.equal(completed, false, "종료 전 absent 결과로 성급히 성공하면 안 됩니다.");
  assert.equal(fake.observationCount(), 2);
  assert.deepEqual(fake.signals, []);

  freshObservation.resolve({ present: true, rssBytes: 64, observerCloseObserved: true });
  await flushMicrotasks(18);
  assert.equal(completed, false);
  assert.deepEqual(fake.signals, [[5002, "SIGTERM"]]);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  await flushMicrotasks();

  const execution = await resultPromise;
  assert.equal(execution.terminationReason, "lingering_process");
  assert.equal(execution.terminationEvidence.processGroupAbsent, true);
  assert.equal(fake.observationCount(), 3);
  assert.deepEqual(fake.signals, [[5002, "SIGTERM"], [5002, "SIGKILL"]]);
  assertNoTimer(clock);
});

test("종료 전 absent 뒤 fresh observer 실패는 old 결과로 fallback하지 않고 poison한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5003);
  const oldObservation = createDeferred();
  const observerError = Object.assign(new Error("fake fresh observer did not close"), {
    code: "observer_unreaped",
    observerCloseObserved: false,
  });
  const fake = fakeDependencies(clock, child, [
    () => oldObservation.promise,
    observerError,
  ]);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);

  clock.runIntervals();
  await flushMicrotasks();
  emitExit(child);
  emitClose(child);
  oldObservation.resolve({ present: false, rssBytes: 0, observerCloseObserved: true });
  await flushMicrotasks(18);
  assert.equal(fake.observationCount(), 2);
  assert.deepEqual(fake.signals, [[5003, "SIGTERM"]]);

  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  await flushMicrotasks();
  clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
  await flushMicrotasks();
  const execution = await resultPromise;

  assert.equal(execution.terminationReason, "unreaped_process");
  assert.equal(execution.terminationEvidence.processGroupAbsent, null);
  assert.equal(execution.terminationEvidence.processObserverCloseObserved, false);
  assert.equal(execution.terminationEvidence.observerUnreaped, true);
  assert.equal(supervisorTest.getIsolationRuntimePoisoned(), true);
  assert.ok(fake.observationCount() >= 3, "fresh 실패 뒤 bounded 재확인을 수행해야 합니다.");
  assert.deepEqual(fake.signals, [[5003, "SIGTERM"], [5003, "SIGKILL"]]);
  await assertScratchPreserved();
  assertNoTimer(clock);
});

test("동시 exit·close와 stop은 fresh observer 하나를 공유하고 완료 뒤 재관찰하지 않는다", async (t) => {
  for (const reason of ["timeout", "cancelled"]) {
    await t.test(reason, async () => {
      const clock = createFakeClock();
      const child = createFakeChild(reason === "timeout" ? 5004 : 5005);
      const controller = new AbortController();
      const oldObservation = createDeferred();
      const freshObservation = createDeferred();
      const fake = fakeDependencies(clock, child, [
        () => oldObservation.promise,
        () => freshObservation.promise,
      ]);
      const resultPromise = supervisorTest.runSandboxedProcess(
        processConfig({ signal: controller.signal }),
        fake.dependencies,
      );
      let completed = false;
      void resultPromise.then(() => { completed = true; });

      clock.runIntervals();
      await flushMicrotasks(18);
      if (reason === "timeout") clock.advanceBy(10);
      else controller.abort();
      emitExit(child, null, "SIGTERM");
      emitClose(child);
      oldObservation.resolve({ present: true, rssBytes: 4096, observerCloseObserved: true });
      await flushMicrotasks(18);

      assert.equal(completed, false);
      assert.equal(fake.observationCount(), 2, "동시 종료 경로는 fresh observer 하나를 공유해야 합니다.");
      assert.deepEqual(fake.signals, [[child.pid, "SIGTERM"]]);
      freshObservation.resolve({ present: false, rssBytes: 0, observerCloseObserved: true });
      const execution = await resultPromise;

      assert.equal(execution.terminationReason, reason);
      assert.equal(execution.terminationEvidence.processGroupAbsent, true);
      assert.equal(execution.terminationEvidence.processObserverCloseObserved, true);
      const observationsAtCompletion = fake.observationCount();
      clock.runIntervals();
      clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs + JAVA_RUNTIME_LIMITS.reapDeadlineMs);
      await flushMicrotasks();
      assert.equal(fake.observationCount(), observationsAtCompletion);
      assert.deepEqual(fake.signals, [[child.pid, "SIGTERM"]]);
      assertNoTimer(clock);
    });
  }
});

test("회수된 timeout과 cancel은 실제 종료 증거 뒤 완료한다", async (t) => {
  for (const reason of ["timeout", "cancelled"]) {
    await t.test(reason, async () => {
      const clock = createFakeClock();
      const child = createFakeChild(reason === "timeout" ? 5101 : 5102);
      const controller = new AbortController();
      const fake = fakeDependencies(clock, child);
      const resultPromise = supervisorTest.runSandboxedProcess(
        processConfig({ signal: controller.signal }),
        fake.dependencies,
      );
      if (reason === "timeout") clock.advanceBy(10);
      else controller.abort();
      emitExit(child, null, "SIGTERM");
      emitClose(child);
      const execution = await resultPromise;
      assert.equal(execution.terminationReason, reason);
      assert.deepEqual(execution.terminationEvidence, {
        childCreated: true,
        pid: child.pid,
        exitObserved: true,
        closeObserved: true,
        processGroupAbsent: true,
        processObserverCloseObserved: true,
        observerUnreaped: false,
        cleanupFailed: false,
      });
      assert.deepEqual(fake.signals, [[child.pid, "SIGTERM"]]);
      assertNoTimer(clock);
    });
  }
});

test("leader 종료 뒤 descendant 잔존은 TERM·KILL·group 부재 순으로 회수한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5201);
  const fake = fakeDependencies(clock, child, [
    { present: true, rssBytes: 256, observerCloseObserved: true },
    { present: true, rssBytes: 128, observerCloseObserved: true },
    { present: false, rssBytes: 0, observerCloseObserved: true },
  ]);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
  emitExit(child);
  emitClose(child);
  await flushMicrotasks(18);
  assert.deepEqual(fake.signals, [[5201, "SIGTERM"]]);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  await flushMicrotasks();
  assert.deepEqual(fake.signals, [[5201, "SIGTERM"], [5201, "SIGKILL"]]);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
  const execution = await resultPromise;
  assert.equal(execution.terminationReason, "lingering_process");
  assert.equal(fake.observationCount(), 3);
  assert.deepEqual(execution.terminationEvidence, {
    childCreated: true,
    pid: 5201,
    exitObserved: true,
    closeObserved: true,
    processGroupAbsent: true,
    processObserverCloseObserved: true,
    observerUnreaped: false,
    cleanupFailed: false,
  });
  assertNoTimer(clock);
});

test("exit-only는 close 부재를 보존하고 scratch를 삭제하지 않는다", { timeout: 1000 }, async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5301);
  const fake = fakeDependencies(clock, child);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
  emitExit(child);
  await flushMicrotasks();
  clock.advanceBy(10);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
  await flushMicrotasks();
  const execution = await resultPromise;
  assert.equal(execution.terminationReason, "close_timeout");
  assert.deepEqual(execution.terminationEvidence, {
    childCreated: true,
    pid: 5301,
    exitObserved: true,
    closeObserved: false,
    processGroupAbsent: true,
    processObserverCloseObserved: true,
    observerUnreaped: false,
    cleanupFailed: false,
  });
  assert.deepEqual(fake.signals, [[5301, "SIGTERM"], [5301, "SIGKILL"]]);
  let removals = 0;
  await supervisorTest.finishJavaRun(
    { outcome: "engine_error", tests: [] },
    "/virtual/work-root",
    true,
    async () => { removals += 1; },
  );
  assert.equal(removals, 0);
  assertNoTimer(clock);
});

test("close-only는 exit 부재를 보존하고 scratch를 삭제하지 않는다", { timeout: 1000 }, async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5302);
  const fake = fakeDependencies(clock, child);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
  emitClose(child);
  await flushMicrotasks();
  clock.advanceBy(10);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
  await flushMicrotasks();
  const execution = await resultPromise;
  assert.equal(execution.terminationReason, "unreaped_process");
  assert.deepEqual(execution.terminationEvidence, {
    childCreated: true,
    pid: 5302,
    exitObserved: false,
    closeObserved: true,
    processGroupAbsent: true,
    processObserverCloseObserved: true,
    observerUnreaped: false,
    cleanupFailed: false,
  });
  assert.deepEqual(fake.signals, [[5302, "SIGTERM"], [5302, "SIGKILL"]]);
  let removals = 0;
  await supervisorTest.finishJavaRun(
    { outcome: "engine_error", tests: [] },
    "/virtual/work-root",
    true,
    async () => { removals += 1; },
  );
  assert.equal(removals, 0);
  assertNoTimer(clock);
});

test("child error는 PID 유무에 따라 회수와 spawn 실패를 구분한다", async (t) => {
  await t.test("PID 있음", async () => {
    const clock = createFakeClock();
    const child = createFakeChild(5401);
    const fake = fakeDependencies(clock, child);
    const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
    const childError = new Error("fake child error");
    child.emit("error", childError);
    emitExit(child, 1, null);
    emitClose(child);
    const execution = await resultPromise;
    assert.equal(execution.startError, childError);
    assert.equal(execution.terminationReason, "child_error");
    assert.equal(execution.terminationEvidence.processGroupAbsent, true);
    assert.deepEqual(fake.signals, [[5401, "SIGTERM"]]);
    assertNoTimer(clock);
  });

  await t.test("PID 없음", async () => {
    const clock = createFakeClock();
    const child = createFakeChild(null);
    const fake = fakeDependencies(clock, child);
    const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);
    child.emit("error", new Error("fake child error without pid"));
    const execution = await resultPromise;
    assert.deepEqual(execution.terminationEvidence, {
      childCreated: false,
      pid: null,
      exitObserved: false,
      closeObserved: false,
      processGroupAbsent: null,
      processObserverCloseObserved: null,
      observerUnreaped: false,
      cleanupFailed: false,
    });
    assert.deepEqual(fake.signals, []);
    assertNoTimer(clock);
  });
});

test("timeout·cancel·PID child error가 종료 이벤트 없이 group을 남기면 보존한다", async (t) => {
  for (const trigger of ["timeout", "cancelled", "child_error"]) {
    await t.test(trigger, async () => {
      const clock = createFakeClock();
      const child = createFakeChild(
        trigger === "timeout" ? 5451 : trigger === "cancelled" ? 5452 : 5453,
      );
      const controller = new AbortController();
      const fake = fakeDependencies(clock, child, [{
        present: true,
        rssBytes: 64,
        observerCloseObserved: true,
      }]);
      const resultPromise = supervisorTest.runSandboxedProcess(
        processConfig({ signal: controller.signal }),
        fake.dependencies,
      );

      if (trigger === "timeout") clock.advanceBy(10);
      else if (trigger === "cancelled") controller.abort();
      else child.emit("error", new Error("fake child error"));
      clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
      await flushMicrotasks();
      clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
      const execution = await resultPromise;

      assert.equal(execution.terminationReason, "unreaped_process");
      assert.deepEqual(execution.terminationEvidence, {
        childCreated: true,
        pid: child.pid,
        exitObserved: false,
        closeObserved: false,
        processGroupAbsent: false,
        processObserverCloseObserved: true,
        observerUnreaped: false,
        cleanupFailed: false,
      });
      assert.deepEqual(fake.signals, [[child.pid, "SIGTERM"], [child.pid, "SIGKILL"]]);
      await assertScratchPreserved();
      assertNoTimer(clock);
    });
  }
});

test("process group signal EPERM은 runtime을 poison하고 다음 실행을 spawn 전에 차단한다", async () => {
  supervisorTest.resetIsolationRuntimePoisoned();
  assert.equal(supervisorTest.getIsolationRuntimePoisoned(), false);
  const clock = createFakeClock();
  const child = createFakeChild(5461);
  const fake = fakeDependencies(clock, child);
  const signalError = Object.assign(new Error("fake signal denied"), { code: "EPERM" });
  fake.dependencies.terminateChildGroup = () => { throw signalError; };
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);

  clock.advanceBy(10);
  emitExit(child, null, "SIGTERM");
  emitClose(child);
  const execution = await resultPromise;

  assert.equal(execution.terminationReason, "cleanup_error");
  assert.deepEqual(execution.terminationEvidence, {
    childCreated: true,
    pid: 5461,
    exitObserved: true,
    closeObserved: true,
    processGroupAbsent: true,
    processObserverCloseObserved: true,
    observerUnreaped: false,
    cleanupFailed: true,
  });
  await assertScratchPreserved();
  assertNoTimer(clock);

  assert.equal(supervisorTest.getIsolationRuntimePoisoned(), true);
  const blockedCalls = {
    spawn: 0,
    observe: 0,
    terminate: 0,
    setTimeout: 0,
    clearTimeout: 0,
    setInterval: 0,
    clearInterval: 0,
  };
  const blocked = await supervisorTest.runSandboxedProcess(processConfig(), {
    spawnProcess: () => { blockedCalls.spawn += 1; },
    inspectChildProcessGroup: async () => {
      blockedCalls.observe += 1;
      return { present: false, rssBytes: 0, observerCloseObserved: true };
    },
    terminateChildGroup: () => { blockedCalls.terminate += 1; },
    setTimeoutFn: () => { blockedCalls.setTimeout += 1; },
    clearTimeoutFn: () => { blockedCalls.clearTimeout += 1; },
    setIntervalFn: () => { blockedCalls.setInterval += 1; },
    clearIntervalFn: () => { blockedCalls.clearInterval += 1; },
  });
  assert.equal(blocked.terminationReason, "runtime_poisoned");
  assert.deepEqual(blocked.terminationEvidence, {
    childCreated: false,
    pid: null,
    exitObserved: false,
    closeObserved: false,
    processGroupAbsent: null,
    processObserverCloseObserved: null,
    observerUnreaped: false,
    cleanupFailed: false,
  });
  assert.equal(blocked.startError.message, "Java isolation runtime is poisoned.");
  assert.deepEqual(blockedCalls, {
    spawn: 0,
    observe: 0,
    terminate: 0,
    setTimeout: 0,
    clearTimeout: 0,
    setInterval: 0,
    clearInterval: 0,
  });

  supervisorTest.resetIsolationRuntimePoisoned();
  assert.equal(supervisorTest.getIsolationRuntimePoisoned(), false);
});

test("compile spawn은 고정 sandbox 명령·argv·환경·stdio만 사용한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5471);
  const fake = fakeDependencies(clock, child);
  const spawnCalls = [];
  const parameters = compileParameters();
  const javacExecutable = "/trusted/BAM.dev/runtime/jdk/Contents/Home/bin/javac";
  fake.dependencies.spawnProcess = (...args) => {
    spawnCalls.push(args);
    return child;
  };
  const compileArguments = [
    "-J-Xmx128m",
    "-J-Duser.home=/scratch/home",
    "-J-Djava.io.tmpdir=/scratch/tmp",
    "--release", "25",
    "-encoding", "UTF-8",
    "-proc:none",
    "-implicit:none",
    "-classpath", "/scratch/empty-classpath",
    "-d", "/scratch/classes",
    "/scratch/Solution.java",
  ];
  const environment = {
    HOME: "/scratch/home",
    TMPDIR: "/scratch/tmp",
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
  };
  const resultPromise = supervisorTest.runSandboxedProcess({
    profileName: "compile.sb",
    parameters,
    executable: javacExecutable,
    args: compileArguments,
    environment,
    timeoutMs: JAVA_RUNTIME_LIMITS.compileTimeoutMs,
    rssLimitBytes: JAVA_RUNTIME_LIMITS.compileRssBytes,
    compileOutputPath: "/scratch/classes",
  }, fake.dependencies);

  assert.deepEqual(spawnCalls, [[
    "/usr/bin/sandbox-exec",
    [
      "-f",
      fileURLToPath(new URL("../desktop/runtime/profiles/compile.sb", import.meta.url)),
      ...Object.entries(expectedCompileParameters()).flatMap(([name, value]) => ["-D", `${name}=${value}`]),
      "-D", `EXECUTABLE=${javacExecutable}`,
      javacExecutable,
      ...compileArguments,
    ],
    {
      cwd: "/scratch/work",
      detached: true,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    },
  ]]);
  emitExit(child);
  emitClose(child);
  const execution = await resultPromise;
  assert.equal(execution.terminationReason, null);
  assert.equal(execution.terminationEvidence.processGroupAbsent, true);
  assertNoTimer(clock);
});

function createFakeObserver(pid) {
  const observer = new EventEmitter();
  observer.pid = pid;
  observer.stdout = createFakeStream();
  observer.killCalls = [];
  observer.unrefCalls = 0;
  observer.kill = (signal) => { observer.killCalls.push(signal); };
  observer.unref = () => { observer.unrefCalls += 1; };
  return observer;
}

function observeFakeProcessGroup(clock, observer, signal) {
  return supervisorTest.readProcessGroup(4242, { signal }, {
    spawnProcess: () => observer,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
  });
}

test("group observer error는 observer child를 kill하고 timer를 정리한다", async () => {
  const clock = createFakeClock();
  const observer = createFakeObserver(5501);
  const observation = observeFakeProcessGroup(clock, observer);
  observer.emit("error", new Error("fake observer error"));
  observer.emit("close", 1);
  await assert.rejects(observation, /fake observer error/u);
  assert.deepEqual(observer.killCalls, ["SIGKILL"]);
  assertNoTimer(clock);
});

test("group observer timeout은 observer child 종료 뒤 timer를 정리한다", async () => {
  const clock = createFakeClock();
  const observer = createFakeObserver(5502);
  const observation = observeFakeProcessGroup(clock, observer);
  clock.advanceBy(250);
  observer.emit("close", null, "SIGKILL");
  await assert.rejects(observation, /timed out/u);
  assert.deepEqual(observer.killCalls, ["SIGKILL"]);
  assertNoTimer(clock);
});

test("SIGKILL 뒤 close 없는 group observer는 observer_unreaped로 고정되고 재활성화되지 않는다", async () => {
  const clock = createFakeClock();
  const observer = createFakeObserver(5505);
  const observation = observeFakeProcessGroup(clock, observer);

  clock.advanceBy(250);
  clock.advanceBy(250);
  const error = await observation.catch((caught) => caught);

  assert.equal(error.code, "observer_unreaped");
  assert.equal(error.observerCloseObserved, false);
  assert.deepEqual(observer.killCalls, ["SIGKILL"]);
  observer.stdout.emit("data", "4242 4242 999\n");
  observer.emit("close", 0);
  assert.deepEqual(observer.killCalls, ["SIGKILL"]);
  assertNoTimer(clock);
});

test("observer_unreaped 증거는 실행을 unsafe로 남기고 scratch를 보존한다", async () => {
  const clock = createFakeClock();
  const child = createFakeChild(5506);
  const observerError = Object.assign(new Error("fake observer did not close"), {
    code: "observer_unreaped",
    observerCloseObserved: false,
  });
  const fake = fakeDependencies(clock, child, [observerError]);
  const resultPromise = supervisorTest.runSandboxedProcess(processConfig(), fake.dependencies);

  emitExit(child);
  emitClose(child);
  await flushMicrotasks(18);
  clock.advanceBy(JAVA_RUNTIME_LIMITS.forceKillDelayMs);
  await flushMicrotasks();
  clock.advanceBy(JAVA_RUNTIME_LIMITS.reapDeadlineMs);
  const execution = await resultPromise;

  assert.equal(execution.terminationReason, "unreaped_process");
  assert.deepEqual(execution.terminationEvidence, {
    childCreated: true,
    pid: 5506,
    exitObserved: true,
    closeObserved: true,
    processGroupAbsent: null,
    processObserverCloseObserved: false,
    observerUnreaped: true,
    cleanupFailed: false,
  });
  assert.deepEqual(fake.signals, [[5506, "SIGTERM"], [5506, "SIGKILL"]]);
  await assertScratchPreserved();
  assertNoTimer(clock);
});

test("group observer cancel은 observer child 종료 뒤 timer를 정리한다", async () => {
  const clock = createFakeClock();
  const observer = createFakeObserver(5503);
  const controller = new AbortController();
  const observation = observeFakeProcessGroup(clock, observer, controller.signal);
  controller.abort();
  observer.emit("close", null, "SIGKILL");
  await assert.rejects(observation, /cancelled/u);
  assert.deepEqual(observer.killCalls, ["SIGKILL"]);
  assertNoTimer(clock);
});

test("완료 뒤 group observer의 늦은 결과는 판정과 timer를 바꾸지 않는다", async () => {
  const clock = createFakeClock();
  const observer = createFakeObserver(5504);
  const observation = observeFakeProcessGroup(clock, observer);
  observer.stdout.emit("data", "1 1 10\n");
  observer.emit("close", 0);
  assert.deepEqual(await observation, {
    present: false,
    rssBytes: 0,
    observerCloseObserved: true,
  });
  observer.stdout.emit("data", "4242 4242 999\n");
  observer.emit("close", 0);
  assertNoTimer(clock);
});

test("cleanup 실패는 사례를 보존하고 경로를 숨긴 오류로 반환한다", async () => {
  const report = {
    outcome: "wrong_answer",
    tests: [{ testId: "public-1", outcome: "wrong_answer", actual: "7" }],
    summary: { outcome: "wrong_answer", total: 1, wrong_answer: 1 },
  };
  const finished = await supervisorTest.finishJavaRun(
    report,
    "/virtual/work-root",
    false,
    async () => { throw new Error("cannot remove /virtual/work-root/Solution.java"); },
  );
  assert.equal(finished.outcome, "engine_error");
  assert.equal(finished.tests, report.tests);
  assert.equal(finished.summary, report.summary);
  assert.equal(finished.error.type, "java_cleanup_error");
  assert.doesNotMatch(JSON.stringify(finished), /virtual|Solution|cannot remove/u);
});
