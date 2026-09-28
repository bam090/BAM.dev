import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { chmod, lstat, mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createJavaSourceGuard, observeJavaProcessTable, recoverOwnedJavaGroups,
  recoverPreviousJavaSourceGuard,
  startIndependentJavaGuardChannel,
} from "../scripts/java-source-guard.mjs";

const reaped = { terminationEvidence: {
  childCreated: true, pid: 510, exitObserved: true, closeObserved: true, processGroupAbsent: true,
  processObserverCloseObserved: true, observerUnreaped: false, cleanupFailed: false,
} };

async function fixture(t) {
  const checkoutRoot = await mkdtemp(path.join(tmpdir(), "bam-source-guard-test-"));
  t.after(() => rm(checkoutRoot, { recursive: true, force: true }));
  const workRoot = path.join(checkoutRoot, "work");
  const executable = path.join(checkoutRoot, "fake-javac");
  await mkdir(workRoot);
  await writeFile(executable, "fake");
  await chmod(executable, 0o755);
  return { checkoutRoot, workRoot, executable,
    stateRoot: path.join(checkoutRoot, ".bam-java-state") };
}

function channel(overrides = {}) {
  return {
    reserve: async (marker) => ({ hostId: marker.hostId, attemptId: marker.attemptId, watchingHost: true }),
    recordSpawn: async (record) => ({ hostId: record.hostId, attemptId: record.attemptId,
      pid: record.pid, pgid: record.pgid, watchingGroup: true }),
    confirmAbsent: async (marker) => ({ hostId: marker.hostId, attemptId: marker.attemptId,
      allGroupsAbsent: true, observersClosed: true }),
    close: async ({ hostId }) => ({ hostId, allGroupsAbsent: true, observersClosed: true }),
    ...overrides,
  };
}

test("host·active marker는 channel ACK 전에 기록되고 독립 회수 뒤 receipt로 닫힌다", async (t) => {
  const paths = await fixture(t);
  let durableAtReserve = false;
  const guard = await createJavaSourceGuard({
    checkoutRoot: paths.checkoutRoot,
    channel: channel({
      async reserve(marker) {
        const stored = JSON.parse(await readFile(path.join(paths.stateRoot, "active.json"), "utf8"));
        durableAtReserve = stored.attemptId === marker.attemptId;
        return { hostId: marker.hostId, attemptId: marker.attemptId, watchingHost: true };
      },
    }),
  });
  const stateMode = (await lstat(paths.stateRoot)).mode & 0o777;
  assert.equal(stateMode & 0o077, 0);
  const reservation = await guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable });
  assert.equal(durableAtReserve, true);
  assert.equal((await lstat(path.join(paths.stateRoot, "active.json"))).mode & 0o077, 0);
  await guard.recordSpawn({ reservation, pid: 510, pgid: 510 });
  assert.equal(await guard.finish({ reservation, execution: reaped }), true);
  assert.equal((await readdir(paths.stateRoot)).some((name) => name.startsWith("receipt-")), true);
  assert.equal((await readdir(paths.stateRoot)).includes("active.json"), false);
  await guard.close();
  assert.equal((await readdir(paths.stateRoot)).includes("host.json"), false);
});

test("다른 port나 runtime 선택과 무관하게 같은 checkout의 두 번째 host를 막는다", async (t) => {
  const paths = await fixture(t);
  const first = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() });
  await assert.rejects(createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() }),
    { code: "EEXIST" });
  await first.close();
});

test("이전 또는 손상된 active marker는 새 host의 자동 복구 대상이 아니다", async (t) => {
  const paths = await fixture(t);
  await mkdir(paths.stateRoot, { mode: 0o700 });
  await writeFile(path.join(paths.stateRoot, "active.json"), "{broken-json");
  await assert.rejects(createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() }),
    /회수 상태/u);
  assert.equal((await readdir(paths.stateRoot)).includes("host.json"), false);
});

test("unsafe 종료 또는 독립 증거 불일치는 active marker를 남기고 close를 막는다", async (t) => {
  const paths = await fixture(t);
  const guard = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot,
    channel: channel({ confirmAbsent: async (marker) => ({ hostId: marker.hostId,
      attemptId: marker.attemptId, allGroupsAbsent: false, observersClosed: true }) }) });
  const reservation = await guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable });
  await guard.recordSpawn({ reservation, pid: 510, pgid: 510 });
  assert.equal(await guard.finish({ reservation, execution: reaped }), false);
  assert.equal((await readdir(paths.stateRoot)).includes("active.json"), true);
  await assert.rejects(guard.close(), /회수 전/u);
  await assert.rejects(createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() }),
    /회수 상태/u);
});

test("로컬 observer 종료 증거가 빠지면 독립 부재 ACK만으로 marker를 지우지 않는다", async (t) => {
  const paths = await fixture(t);
  const guard = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() });
  const reservation = await guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable });
  await guard.recordSpawn({ reservation, pid: 510, pgid: 510 });
  const unsafe = { terminationEvidence: { ...reaped.terminationEvidence,
    processObserverCloseObserved: false } };
  assert.equal(await guard.finish({ reservation, execution: unsafe }), false);
  assert.equal((await readdir(paths.stateRoot)).includes("active.json"), true);
  assert.equal((await readdir(paths.stateRoot)).some((name) => name.startsWith("receipt-")), false);
});

test("childCreated 종료라도 spawn 인계가 없으면 active marker를 보존한다", async (t) => {
  const paths = await fixture(t);
  const guard = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel: channel() });
  const reservation = await guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable });
  assert.equal(await guard.finish({ reservation, execution: reaped }), false);
  assert.equal((await readdir(paths.stateRoot)).includes("active.json"), true);
  assert.equal((await readdir(paths.stateRoot)).some((name) => name.startsWith("receipt-")), false);
});

test("PID/PGID 기록은 channel ACK 전에 durable하며 잘못된 PID를 거부한다", async (t) => {
  const paths = await fixture(t);
  let storedAtAck = false;
  const guard = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot,
    channel: channel({
      async recordSpawn(record) {
        const file = path.join(paths.stateRoot, `spawn-${record.attemptId}.json`);
        const stored = JSON.parse(await readFile(file, "utf8"));
        storedAtAck = stored.pid === record.pid && stored.pgid === record.pgid;
        return { hostId: record.hostId, attemptId: record.attemptId,
          pid: record.pid, pgid: record.pgid, watchingGroup: true };
      },
    }) });
  const reservation = await guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable });
  await assert.rejects(guard.recordSpawn({ reservation, pid: 510, pgid: 511 }), /유효하지/u);
  await guard.recordSpawn({ reservation, pid: 510, pgid: 510 });
  assert.equal(storedAtAck, true);
  assert.equal(await guard.finish({ reservation, execution: reaped }), true);
  await guard.close();
});

test("reserve ACK의 attempt ID가 다르면 durable marker를 보존한다", async (t) => {
  const paths = await fixture(t);
  const guard = await createJavaSourceGuard({ checkoutRoot: paths.checkoutRoot,
    channel: channel({ reserve: async (marker) => ({ hostId: marker.hostId,
      attemptId: "wrong", watchingHost: true }) }) });
  await assert.rejects(guard.reserve({ kind: "prepare-quest", workRoot: paths.workRoot,
    executable: paths.executable }), /durable 예약/u);
  assert.equal((await readdir(paths.stateRoot)).includes("active.json"), true);
});

test("실제 Node fixture를 두 번 연속 예약해 종료·독립 부재 확인 뒤 watcher를 해제한다",
  { skip: process.env.BAM_JAVA_GUARD_NATIVE_TEST !== "1" }, async (t) => {
    const checkoutRoot = await mkdtemp(path.join(tmpdir(), "bam-source-guard-native-"));
    const workRoot = path.join(checkoutRoot, "work");
    const fixturePath = fileURLToPath(new URL("./fixtures/java-guard-owned-node.mjs", import.meta.url));
    const executable = await realpath(process.execPath);
    await mkdir(workRoot);
    let channelClosed = false;
    let ownedChild = null;
    const guardChannel = await startIndependentJavaGuardChannel({
      spawnProcess(file, args, options) {
        return spawn(file, [...args, "--node-fixture"], options);
      },
    });
    t.after(async () => {
      if (ownedChild && ownedChild.exitCode === null) ownedChild.kill("SIGKILL");
      if (!channelClosed) await guardChannel.disconnectAfterFailure();
      if (channelClosed) await rm(checkoutRoot, { recursive: true, force: true });
    });
    const guard = await createJavaSourceGuard({ checkoutRoot, channel: guardChannel });
    for (let iteration = 0; iteration < 2; iteration += 1) {
      const reservation = await guard.reserve({ kind: "node-guard-fixture", workRoot, executable });
      ownedChild = spawn(executable, [fixturePath, `--bam-owner-nonce=${reservation.attemptId}`,
        `--bam-work-root=${reservation.workRoot}`, "--bam-mode=normal"], {
        detached: true, stdio: ["ignore", "pipe", "ignore"],
      });
      const child = ownedChild;
      const ready = new Promise((resolve, reject) => {
        let output = "";
        child.stdout.on("data", (chunk) => {
          output += chunk.toString("utf8");
          if (output.includes(`READY ${child.pid}\n`)) resolve();
        });
        child.once("error", reject);
        child.once("exit", () => reject(new Error("Node fixture가 READY 전에 종료됐습니다.")));
      });
      await guard.recordSpawn({ reservation, pid: child.pid, pgid: child.pid });
      await ready;
      const closed = new Promise((resolve, reject) => {
        let exited = false;
        child.once("exit", (code) => { exited = code === 0; });
        child.once("close", (code) => code === 0 && exited ? resolve() : reject(new Error("Node fixture 종료 증거가 없습니다.")));
      });
      child.kill("SIGTERM");
      await closed;
      ownedChild = null;
      const observation = await observeJavaProcessTable({ spawnProcess: spawn, timeoutMs: 2_000 });
      assert.equal(observation.rows.some((row) => row.pgid === child.pid), false);
      assert.equal(await guard.finish({ reservation, execution: { terminationEvidence: {
        childCreated: true, pid: child.pid, exitObserved: true, closeObserved: true,
        processGroupAbsent: true, processObserverCloseObserved: observation.observerCloseObserved,
        observerUnreaped: false, cleanupFailed: false,
      } } }), true);
    }
    await guard.close();
    channelClosed = true;
  });

test("삭제한 단일 Quest 검증 플래그는 제품 예약으로 해석하지 않는다",
  { skip: process.env.BAM_JAVA_GUARD_NATIVE_TEST !== "1" }, async (t) => {
    const checkoutRoot = await mkdtemp(path.join(tmpdir(), "bam-source-guard-retired-"));
    const workRoot = path.join(checkoutRoot, "work");
    await mkdir(workRoot);
    const executable = await realpath(process.execPath);
    const guardChannel = await startIndependentJavaGuardChannel({
      spawnProcess(file, args, options) {
        return spawn(file, [...args, "--trusted-quest-compile-once"], options);
      },
    });
    let channelClosed = false;
    t.after(async () => {
      if (!channelClosed) await guardChannel.disconnectAfterFailure();
      if (channelClosed) await rm(checkoutRoot, { recursive: true, force: true });
    });
    const guard = await createJavaSourceGuard({ checkoutRoot, channel: guardChannel });
    await assert.rejects(guard.reserve({ kind: "prepare-quest", workRoot, executable }),
      /durable 예약/u);
    const stateFiles = await readdir(path.join(checkoutRoot, ".bam-java-state"));
    assert.equal(stateFiles.includes("active.json"), true);
    assert.equal(stateFiles.some((name) => name.startsWith("spawn-")), false);
    await guardChannel.disconnectAfterFailure();
    channelClosed = true;
  });

const marker = { attemptId: "a".repeat(64), ownedPgid: 510, workRoot: "/private/tmp/java-work",
  executable: "/private/tmp/jdk/bin/javac" };
const owned = (pgid = 510) => ({ pid: 511, pgid, state: "S",
  command: `${marker.executable} -J-Dbam.owner.nonce=${marker.attemptId} -J-Duser.home=${marker.workRoot}/home -d classes` });
const snapshot = (rows) => ({ rows, observerExitObserved: true, observerCloseObserved: true });

test("혼합 PGID와 흉내 낸 소유 명령은 어떤 그룹에도 signal을 보내지 않는다", async () => {
  const signals = [];
  const hostile = { pid: 512, pgid: 510, state: "S", command: "/bin/other" };
  const mixed = await recoverOwnedJavaGroups(marker, {
    observe: async () => snapshot([owned(), hostile]),
    signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
  });
  assert.equal(mixed.status, "unknown");
  const forged = await recoverOwnedJavaGroups(marker, {
    observe: async () => snapshot([{ ...owned(), command: `${marker.executable} ${marker.workRoot}` }]),
    signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
  });
  assert.equal(forged.status, "unknown");
  assert.deepEqual(signals, []);
});

test("nonce 없는 직접 Java 명령은 home 경로가 같아도 소유 실행으로 회수하지 않는다", async () => {
  const javaMarker = { ...marker, executable: "/private/tmp/jdk/bin/java" };
  const row = { pid: 611, pgid: 610, state: "S",
    command: `${javaMarker.executable} -Duser.home=${javaMarker.workRoot}/home -cp classes Main` };
  const signals = [];
  let time = 0;
  const result = await recoverOwnedJavaGroups(javaMarker, {
    observe: async () => snapshot([row]),
    signalGroup: (...args) => { signals.push(args); return true; },
    wait: async () => {}, now: () => { time += 1_000; return time; }, terminate: true,
  });
  assert.equal(result.status, "unknown");
  assert.deepEqual(signals, []);
});

test("명령이 맞아도 durable PID/PGID 인계가 없거나 다르면 신호를 보내지 않는다", async () => {
  const signals = [];
  for (const changed of [{ ownedPgid: undefined }, { ownedPgid: 999 }]) {
    const result = await recoverOwnedJavaGroups({ ...marker, ...changed }, {
      observe: async () => snapshot([owned()]),
      signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
    });
    assert.equal(result.status, "unknown");
  }
  assert.deepEqual(signals, []);
});

test("기록된 PGID만 살아 있고 nonce 신원이 없으면 부재로 판정하지 않는다", async () => {
  const signals = [];
  const result = await recoverOwnedJavaGroups(marker, {
    observe: async () => snapshot([{ pid: 512, pgid: marker.ownedPgid, state: "S",
      command: "/bin/unrelated process" }]),
    signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
  });
  assert.equal(result.status, "unknown");
  assert.deepEqual(signals, []);
});

test("Node fixture 소유 명령은 정확한 파일·nonce·workRoot·kind만 회수한다", async () => {
  const fixturePath = fileURLToPath(new URL("./fixtures/java-guard-owned-node.mjs", import.meta.url));
  const nodeMarker = { ...marker, kind: "node-guard-fixture", ownedPgid: 610,
    executable: await realpath(process.execPath) };
  const command = `${nodeMarker.executable} ${fixturePath}`
    + ` --bam-owner-nonce=${nodeMarker.attemptId}`
    + ` --bam-work-root=${nodeMarker.workRoot} --bam-mode=normal`;
  const row = { pid: 611, pgid: 610, state: "S", command };
  const observations = [snapshot([row]), snapshot([])];
  const signals = [];
  const valid = await recoverOwnedJavaGroups(nodeMarker, {
    observe: async () => observations.shift(),
    signalGroup: (...args) => { signals.push(args); return true; },
    wait: async () => {}, terminate: true,
  });
  assert.equal(valid.status, "absent_after_term");
  assert.deepEqual(signals, [[610, "SIGTERM"]]);

  for (const hostile of [
    { ...row, command: command.replace(nodeMarker.attemptId, "0".repeat(64)) },
    { ...row, command: command.replace(fixturePath, "/private/tmp/other-fixture.mjs") },
  ]) {
    const result = await recoverOwnedJavaGroups(nodeMarker, {
      observe: async () => snapshot([hostile]),
      signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
    });
    assert.equal(result.status, "unknown");
  }
  const productKind = await recoverOwnedJavaGroups({ ...nodeMarker, kind: "quest" }, {
    observe: async () => snapshot([row]),
    signalGroup: (...args) => { signals.push(args); return true; }, terminate: true,
  });
  assert.equal(productKind.status, "unknown");
  assert.deepEqual(signals, [[610, "SIGTERM"]]);
});

test("observer 종료가 불명확하면 회수 불명, 정확한 그룹은 TERM 뒤 부재를 재확인한다", async () => {
  const unknown = await recoverOwnedJavaGroups(marker, {
    observe: async () => ({ rows: [], observerExitObserved: true, observerCloseObserved: false }),
  });
  assert.equal(unknown.status, "unknown");
  const observations = [snapshot([owned()]), snapshot([])];
  const signals = [];
  const result = await recoverOwnedJavaGroups(marker, {
    observe: async () => observations.shift(),
    signalGroup: (pgid, name) => { signals.push([pgid, name]); return true; },
    wait: async () => {}, terminate: true,
  });
  assert.equal(result.status, "absent_after_term");
  assert.deepEqual(signals, [[510, "SIGTERM"]]);
});

test("process table과 guard IPC는 주입된 fake 프로세스만 사용한다", async () => {
  const observer = new EventEmitter();
  observer.stdout = new PassThrough();
  let spawnArgs;
  const observing = observeJavaProcessTable({ spawnProcess: (...args) => { spawnArgs = args; return observer; } });
  observer.stdout.write("511 510 S /private/tmp/jdk/bin/javac -J-Duser.home=/private/tmp/java-work/home\n");
  observer.emit("exit", 0);
  observer.emit("close", 0);
  const table = await observing;
  assert.equal(spawnArgs[0], "/bin/ps");
  assert.equal(table.rows[0].pgid, 510);

  const child = new EventEmitter();
  child.pid = 9001;
  let unrefCalls = 0;
  let disconnectCalls = 0;
  child.unref = () => { unrefCalls += 1; };
  child.disconnect = () => { disconnectCalls += 1; };
  child.send = (message, callback) => {
    callback?.(null);
    queueMicrotask(() => {
      child.emit("message", { id: message.id, op: message.op,
        result: message.op === "close"
          ? { hostId: message.payload.hostId, allGroupsAbsent: true, observersClosed: true }
          : message.op === "recordSpawn"
            ? { hostId: message.payload.hostId, attemptId: message.payload.attemptId,
              pid: message.payload.pid, pgid: message.payload.pgid, watchingGroup: true }
            : { hostId: message.payload.hostId, attemptId: message.payload.attemptId,
              watchingHost: true } });
      if (message.op === "close") queueMicrotask(() => {
        child.emit("disconnect"); child.emit("exit", 0); child.emit("close", 0);
      });
    });
  };
  const starting = startIndependentJavaGuardChannel({ spawnProcess: (...args) => { spawnArgs = args;
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child; } });
  const guardChannel = await starting;
  assert.equal(spawnArgs[0], process.execPath);
  assert.equal(unrefCalls, 0);
  assert.equal((await guardChannel.reserve({ hostId: "host", attemptId: "attempt" })).watchingHost, true);
  assert.equal((await guardChannel.close({ hostId: "host" })).allGroupsAbsent, true);
  assert.equal(disconnectCalls, 0);
  assert.equal(unrefCalls, 0);
});

test("guard 시작 timeout은 자신이 만든 자식에 TERM을 보내고 exit·close를 확인한다", async () => {
  const child = new EventEmitter();
  child.pid = 9002;
  child.send = () => {};
  child.unref = () => {};
  const signals = [];
  child.kill = (name) => {
    signals.push(name);
    queueMicrotask(() => { child.emit("exit", 0); child.emit("close", 0); });
  };
  await assert.rejects(startIndependentJavaGuardChannel({
    spawnProcess: () => child, timeoutMs: 5,
  }), /시작 시간이 초과/u);
  assert.deepEqual(signals, ["SIGTERM"]);
});

test("guard 시작 실패 뒤 TERM·KILL에도 close 증명이 없으면 unknown으로 남긴다", async () => {
  const child = new EventEmitter();
  child.pid = 9003;
  child.send = () => {};
  child.unref = () => {};
  const signals = [];
  child.kill = (name) => { signals.push(name); };
  await assert.rejects(startIndependentJavaGuardChannel({
    spawnProcess: () => child, timeoutMs: 5,
  }), /child 종료를 확인하지 못했습니다/u);
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
});

test("worker shutdown이 비영 exit·close이면 정상 회수로 인정하지 않는다", async () => {
  const child = new EventEmitter();
  child.pid = 9004;
  let parentDisconnects = 0;
  child.disconnect = () => { parentDisconnects += 1; };
  child.send = (message, callback) => {
    callback?.(null);
    queueMicrotask(() => {
      child.emit("message", { id: message.id, op: message.op,
        result: { allGroupsAbsent: true, observersClosed: true } });
      queueMicrotask(() => {
        child.emit("disconnect"); child.emit("exit", 1); child.emit("close", 1);
      });
    });
  };
  const starting = startIndependentJavaGuardChannel({ spawnProcess: () => {
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child;
  }, disposeTimeoutMs: 5 });
  const guardChannel = await starting;
  await assert.rejects(guardChannel.disconnectAfterFailure(), /회수 완료를 확인하지 못했습니다/u);
  assert.equal(parentDisconnects, 0);
});

test("정상 close는 worker의 IPC 단절 뒤 지연된 exit와 close 둘 다 기다린다", async () => {
  const child = new EventEmitter();
  child.pid = 9006;
  let unrefCalls = 0;
  let killCalls = 0;
  let parentDisconnects = 0;
  child.unref = () => { unrefCalls += 1; };
  child.kill = () => { killCalls += 1; };
  child.send = (message, callback) => {
    callback?.(null);
    queueMicrotask(() => {
      child.emit("message", { id: message.id, op: message.op,
        result: { hostId: message.payload.hostId, allGroupsAbsent: true, observersClosed: true } });
      queueMicrotask(() => {
        child.emit("disconnect");
        queueMicrotask(() => child.emit("exit", 0));
        setTimeout(() => child.emit("close", 0), 2);
      });
    });
  };
  child.disconnect = () => { parentDisconnects += 1; };
  const guardChannel = await startIndependentJavaGuardChannel({ spawnProcess: () => {
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child;
  }, disposeTimeoutMs: 20 });
  assert.deepEqual(await guardChannel.close({ hostId: "host" }), {
    hostId: "host", allGroupsAbsent: true, observersClosed: true,
  });
  assert.equal(unrefCalls, 0);
  assert.equal(killCalls, 0);
  assert.equal(parentDisconnects, 0);
});

test("실패 회수는 worker shutdown 응답과 exit·close를 확인한다", async () => {
  const child = new EventEmitter();
  child.pid = 9008;
  let parentDisconnects = 0;
  let shutdownRequests = 0;
  child.disconnect = () => { parentDisconnects += 1; };
  child.send = (message, callback) => {
    if (message.op === "shutdown") shutdownRequests += 1;
    callback?.(null);
    queueMicrotask(() => {
      child.emit("message", { id: message.id, op: message.op,
        result: { allGroupsAbsent: true, observersClosed: true } });
      queueMicrotask(() => {
        child.emit("disconnect"); child.emit("exit", 0); child.emit("close", 0);
      });
    });
  };
  const guardChannel = await startIndependentJavaGuardChannel({ spawnProcess: () => {
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child;
  }, disposeTimeoutMs: 20 });
  assert.deepEqual(await guardChannel.disconnectAfterFailure(), {
    workerExitObserved: true, workerCloseObserved: true, workerExitCode: 0,
  });
  assert.equal(shutdownRequests, 1);
  assert.equal(parentDisconnects, 0);
});

test("exit만 있고 close가 늦으면 정상 종료로 오인하지 않는다", async () => {
  const child = new EventEmitter();
  child.pid = 9007;
  let parentDisconnects = 0;
  child.send = (message, callback) => {
    callback?.(null);
    queueMicrotask(() => {
      child.emit("message", { id: message.id, op: message.op,
        result: { allGroupsAbsent: true, observersClosed: true } });
      queueMicrotask(() => { child.emit("disconnect"); child.emit("exit", 0); });
    });
  };
  const signals = [];
  child.kill = (name) => { signals.push(name); child.emit("close", 0); };
  child.disconnect = () => { parentDisconnects += 1; };
  const guardChannel = await startIndependentJavaGuardChannel({ spawnProcess: () => {
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child;
  }, disposeTimeoutMs: 5 });
  await assert.rejects(guardChannel.disconnectAfterFailure(), /기한을 넘겨 종료돼 회수 결과가 불명확/u);
  assert.deepEqual(signals, ["SIGTERM"]);
  assert.equal(parentDisconnects, 0);
});

test("worker shutdown 응답 timeout은 exact child TERM 회수 뒤에도 결과 불명으로 반환한다", async () => {
  const child = new EventEmitter();
  child.pid = 9005;
  child.send = () => {};
  child.unref = () => {};
  let parentDisconnects = 0;
  child.disconnect = () => { parentDisconnects += 1; };
  const signals = [];
  child.kill = (name) => {
    signals.push(name);
    queueMicrotask(() => { child.emit("exit", 0); child.emit("close", 0); });
  };
  const guardChannel = await startIndependentJavaGuardChannel({ spawnProcess: () => {
    queueMicrotask(() => child.emit("message", { id: 0, op: "ready", version: 1 }));
    return child;
  }, timeoutMs: 5, disposeTimeoutMs: 5 });
  await assert.rejects(guardChannel.disconnectAfterFailure(), /종료 응답이 없어 회수 결과가 불명확/u);
  assert.deepEqual(signals, ["SIGTERM"]);
  assert.equal(parentDisconnects, 0);
});

async function previousState(t, { active = true } = {}) {
  const paths = await fixture(t);
  const checkout = await realpath(paths.checkoutRoot);
  await mkdir(paths.stateRoot, { mode: 0o700 });
  const host = { schemaVersion: 1, hostId: "a".repeat(64), checkout, hostPid: 999_999 };
  const marker = active ? { schemaVersion: 1, hostId: host.hostId, attemptId: "b".repeat(64),
    kind: "prepare-quest", checkout, workRoot: paths.workRoot,
    executable: paths.executable, hostPid: host.hostPid } : null;
  await writeFile(path.join(paths.stateRoot, "host.json"), `${JSON.stringify(host)}\n`, { mode: 0o600 });
  if (marker) {
    await writeFile(path.join(paths.stateRoot, "active.json"), `${JSON.stringify(marker)}\n`, { mode: 0o600 });
    await writeFile(path.join(paths.stateRoot, `spawn-${marker.attemptId}.json`),
      `${JSON.stringify({ hostId: host.hostId, attemptId: marker.attemptId, pid: 510, pgid: 510 })}\n`,
      { mode: 0o600 });
  }
  return { ...paths, host, marker };
}

test("재시작 회수는 독립 영수증의 host·attempt·상태를 확인한 뒤 marker를 제거한다", async (t) => {
  const paths = await previousState(t);
  const receiptFile = `guard-recover-${paths.marker.attemptId}-${"c".repeat(32)}.json`;
  await writeFile(path.join(paths.stateRoot, receiptFile), `${JSON.stringify({
    hostId: paths.host.hostId, attemptId: paths.marker.attemptId,
    phase: "recover", result: { status: "absent_after_term" },
  })}\n`, { mode: 0o600 });
  const channel = {
    async recoverPrevious({ host, marker }) {
      assert.equal(host.hostId, paths.host.hostId);
      assert.equal(marker.attemptId, paths.marker.attemptId);
      return { hostId: host.hostId, attemptId: marker.attemptId,
        allGroupsAbsent: true, observersClosed: true, receiptFile };
    },
  };
  assert.equal(await recoverPreviousJavaSourceGuard({ checkoutRoot: paths.checkoutRoot, channel }), true);
  const names = await readdir(paths.stateRoot);
  assert.equal(names.includes("host.json"), false);
  assert.equal(names.includes("active.json"), false);
  assert.equal(names.includes(`receipt-${paths.marker.attemptId}.json`), true);
});

test("재시작 회수의 영수증 신원이 다르면 host·active marker를 보존한다", async (t) => {
  const paths = await previousState(t);
  const receiptFile = `guard-recover-${paths.marker.attemptId}-${"d".repeat(32)}.json`;
  await writeFile(path.join(paths.stateRoot, receiptFile), `${JSON.stringify({
    hostId: "wrong", attemptId: paths.marker.attemptId,
    phase: "recover", result: { status: "absent" },
  })}\n`, { mode: 0o600 });
  await assert.rejects(recoverPreviousJavaSourceGuard({ checkoutRoot: paths.checkoutRoot,
    channel: { async recoverPrevious() { return { hostId: paths.host.hostId,
      attemptId: paths.marker.attemptId, allGroupsAbsent: true, observersClosed: true,
      receiptFile }; } },
  }), /영수증 내용/u);
  const names = await readdir(paths.stateRoot);
  assert.equal(names.includes("host.json"), true);
  assert.equal(names.includes("active.json"), true);
});

test("재시작 회수 ACK가 부재를 증명하지 못하면 영수증 없이 marker를 보존한다", async (t) => {
  const paths = await previousState(t);
  await assert.rejects(recoverPreviousJavaSourceGuard({ checkoutRoot: paths.checkoutRoot,
    channel: { async recoverPrevious() { return { hostId: paths.host.hostId,
      attemptId: paths.marker.attemptId, allGroupsAbsent: false, observersClosed: true,
      receiptFile: null }; } },
  }), /독립 회수 증거/u);
  const names = await readdir(paths.stateRoot);
  assert.equal(names.includes("host.json"), true);
  assert.equal(names.includes("active.json"), true);
  assert.equal(names.some((name) => name.startsWith("receipt-")), false);
});
