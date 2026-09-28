import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, lstat, mkdir, open, readFile, realpath, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NODE_FIXTURE_KIND = "node-guard-fixture";
const NODE_FIXTURE_PATH = fileURLToPath(new URL("../tests/fixtures/java-guard-owned-node.mjs", import.meta.url));
const NODE_FIXTURE_SHA256 = "dd5818a3818a1cc8d5ba0dcad125c45edfe7a2be236393c98b8f516dff574ea8";
const TASK_KINDS = new Set(["prepare-quest", "prepare-coding-test", "quest", "coding-test", NODE_FIXTURE_KIND]);
const OBSERVER_OUTPUT_LIMIT = 2 * 1024 * 1024;
// Fixed-JDK Quest compilation and independent group recovery passed preflight.
// Prepared-runtime integrity and browser isolation remain separate admission checks.
export const SOURCE_JAVA_GUARD_PREFLIGHT_VALIDATED = true;

async function syncDirectory(directory) {
  const handle = await open(directory, "r");
  try { await handle.sync(); } finally { await handle.close(); }
}

async function writeExclusive(file, value) {
  const handle = await open(file, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value)}\n`);
    await handle.sync();
  } finally { await handle.close(); }
  await syncDirectory(path.dirname(file));
}

async function readPrivateJson(file) {
  const handle = await open(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile() || (info.mode & 0o077) !== 0
      || (process.getuid && info.uid !== process.getuid()) || info.size > 16_384) {
      throw new Error("Java 감독 기록이 비공개 정규 파일이 아닙니다.");
    }
    return JSON.parse(await handle.readFile("utf8"));
  } finally { await handle.close(); }
}

async function privateStateRoot(checkoutRoot) {
  const checkout = await realpath(checkoutRoot);
  const stateRoot = path.join(checkout, ".bam-java-state");
  await mkdir(stateRoot, { mode: 0o700, recursive: true });
  const state = await lstat(stateRoot);
  if (!state.isDirectory() || state.isSymbolicLink() || (state.mode & 0o077) !== 0
    || (process.getuid && state.uid !== process.getuid()) || await realpath(stateRoot) !== stateRoot) {
    throw new Error("Java 감독 상태 경로가 비공개 정규 디렉터리가 아닙니다.");
  }
  return { checkout, stateRoot };
}

function exactFields(value, names) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === names.length
    && Object.keys(value).every((key) => names.includes(key));
}

function locallyReaped(execution) {
  const evidence = execution?.terminationEvidence;
  return evidence?.childCreated === false || (evidence?.childCreated === true
    && evidence.exitObserved === true && evidence.closeObserved === true
    && evidence.processGroupAbsent === true && evidence.processObserverCloseObserved === true
    && evidence.observerUnreaped === false && evidence.cleanupFailed === false);
}

export function observeJavaProcessTable({ spawnProcess, timeoutMs = 250, reapMs = 250 } = {}) {
  if (typeof spawnProcess !== "function") throw new Error("독립 process observer가 아직 활성화되지 않았습니다.");
  return new Promise((resolve, reject) => {
    const observer = spawnProcess("/bin/ps", ["-ww", "-axo", "pid=,pgid=,state=,command="], {
      env: { LANG: "C", LC_ALL: "C" }, stdio: ["ignore", "pipe", "ignore"],
    });
    let output = "";
    let exitObserved = false;
    let failure = null;
    let settled = false;
    let reapTimer;
    const finish = (error, rows) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      clearTimeout(reapTimer);
      if (error) reject(error);
      else resolve({ rows, observerExitObserved: exitObserved, observerCloseObserved: true });
    };
    const stop = (error) => {
      if (failure) return;
      failure = error;
      try { observer.kill("SIGKILL"); } catch { /* A failed observer remains unknown. */ }
      reapTimer = setTimeout(() => {
        observer.unref?.();
        observer.stdout?.destroy?.();
        finish(new Error("process_observer_unreaped"));
      }, reapMs);
    };
    const deadline = setTimeout(() => stop(new Error("process_observer_timeout")), timeoutMs);
    observer.stdout.on("data", (chunk) => {
      output += chunk.toString("utf8");
      if (Buffer.byteLength(output) > OBSERVER_OUTPUT_LIMIT) stop(new Error("process_observer_output_limit"));
    });
    observer.once("error", stop);
    observer.once("exit", (code) => { exitObserved = true; if (code !== 0) failure ??= new Error("process_observer_nonzero"); });
    observer.once("close", (code) => {
      if (failure || !exitObserved || code !== 0) {
        finish(failure ?? new Error("process_observer_close_unknown"));
        return;
      }
      try {
        const rows = output.trimEnd().split("\n").filter(Boolean).map((line) => {
          const match = /^\s*(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/u.exec(line);
          if (!match) throw new Error("process_observer_invalid_row");
          const pid = Number(match[1]);
          const pgid = Number(match[2]);
          if (!Number.isSafeInteger(pid) || !Number.isSafeInteger(pgid) || pid <= 0 || pgid <= 0) {
            throw new Error("process_observer_invalid_pid");
          }
          return { pid, pgid, state: match[3], command: match[4] };
        });
        finish(null, rows);
      } catch (error) { finish(error); }
    });
  });
}

function matchesOwnedCommand(row, marker) {
  const command = row.command;
  if (typeof command !== "string" || row.pgid <= 1) return false;
  if (marker.kind === NODE_FIXTURE_KIND) {
    const prefix = `${marker.executable} ${NODE_FIXTURE_PATH} --bam-owner-nonce=${marker.attemptId}`
      + ` --bam-work-root=${marker.workRoot} --bam-mode=`;
    return command === `${prefix}normal` || command === `${prefix}term-ignore`;
  }
  const home = path.join(marker.workRoot, "home");
  const wrapper = command.startsWith("/usr/bin/sandbox-exec ")
    && command.includes(`BAM_OWNER_NONCE=${marker.attemptId}`)
    && command.includes(` ${marker.executable} `)
    && command.includes(marker.workRoot);
  const java = path.basename(marker.executable) === "java";
  const nonceOption = `${java ? "-D" : "-J-D"}bam.owner.nonce=${marker.attemptId}`;
  const direct = command.startsWith(`${marker.executable} `)
    && command.includes(`${java ? "-D" : "-J-D"}user.home=${home}`)
    && (command.includes(`${nonceOption} `) || command.endsWith(nonceOption));
  return wrapper || direct;
}

function resemblesOwnedCommand(row, marker) {
  if (marker.kind === NODE_FIXTURE_KIND) {
    return typeof row.command === "string" && row.command.startsWith(`${marker.executable} ${NODE_FIXTURE_PATH} `)
      && row.command.includes(`--bam-work-root=${marker.workRoot} `);
  }
  return typeof row.command === "string" && row.command.includes(marker.workRoot)
    && row.command.includes(marker.executable)
    && (row.command.startsWith("/usr/bin/sandbox-exec ")
      || row.command.startsWith(`${marker.executable} `));
}

// The caller supplies process observation and signalling; no native process is launched here.
export async function recoverOwnedJavaGroups(marker, {
  observe, signalGroup, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = () => performance.now(), terminate = false,
} = {}) {
  if (typeof observe !== "function" || (terminate && typeof signalGroup !== "function")) {
    throw new Error("독립 Java 그룹 관찰/회수 기능이 필요합니다.");
  }
  const observations = [];
  const inspect = async () => {
    const snapshot = await observe();
    if (snapshot?.observerExitObserved !== true || snapshot?.observerCloseObserved !== true
      || !Array.isArray(snapshot.rows)) throw new Error("process_observer_unknown");
    if (!Number.isSafeInteger(marker.ownedPgid) || marker.ownedPgid <= 1) {
      throw new Error("owned_group_handoff_unknown");
    }
    if (snapshot.rows.some((row) => resemblesOwnedCommand(row, marker)
      && !matchesOwnedCommand(row, marker))) throw new Error("owned_command_identity_unknown");
    if (snapshot.rows.some((row) => row.pgid === marker.ownedPgid
      && !matchesOwnedCommand(row, marker))) throw new Error("owned_group_identity_unknown");
    const matchedRows = snapshot.rows.filter((row) => matchesOwnedCommand(row, marker));
    if (matchedRows.some((row) => row.pgid !== marker.ownedPgid)) {
      throw new Error("owned_group_handoff_unknown");
    }
    const groups = new Set(matchedRows.map((row) => row.pgid));
    for (const group of groups) {
      if (snapshot.rows.some((row) => row.pgid === group && !matchesOwnedCommand(row, marker))) {
        throw new Error("owned_group_identity_unknown");
      }
    }
    observations.push({
      groupIds: [...groups], observerClosed: true,
      matched: snapshot.rows.filter((row) => groups.has(row.pgid))
        .map(({ pid, pgid, state, command }) => ({ pid, pgid, state, command })),
    });
    return groups;
  };
  try {
    let groups = await inspect();
    if (groups.size === 0) {
      await wait(50);
      groups = await inspect();
      if (groups.size === 0) return { status: "absent", observations };
    }
    if (!terminate) return { status: "present", observations };
    const owned = new Set(groups);
    const signal = (signalName, targets) => {
      for (const group of targets) {
        if (signalGroup(group, signalName) !== true) throw new Error("owned_group_signal_unknown");
      }
    };
    signal("SIGTERM", groups);
    await wait(500);
    groups = await inspect();
    if (groups.size === 0) return { status: "absent_after_term", observations };
    if ([...groups].some((group) => !owned.has(group))) throw new Error("new_owned_group_after_host_exit");
    signal("SIGKILL", groups);
    const deadline = now() + 1_000;
    do {
      groups = await inspect();
      if (groups.size === 0) return { status: "absent_after_kill", observations };
      await wait(Math.min(100, Math.max(0, deadline - now())));
    } while (now() < deadline);
    return { status: "unreaped", observations };
  } catch (error) {
    return { status: "unknown", error: String(error), observations };
  }
}

// A restarted host may remove old ownership only after a fresh independent recovery receipt.
export async function recoverPreviousJavaSourceGuard({ checkoutRoot, channel } = {}) {
  if (typeof channel?.recoverPrevious !== "function") throw new Error("독립 Java 재시작 회수 채널이 필요합니다.");
  const { checkout, stateRoot } = await privateStateRoot(checkoutRoot);
  const hostFile = path.join(stateRoot, "host.json");
  const activeFile = path.join(stateRoot, "active.json");
  const readOptional = async (file) => {
    try { return await readPrivateJson(file); }
    catch (error) { if (error.code === "ENOENT") return null; throw error; }
  };
  const host = await readOptional(hostFile);
  const marker = await readOptional(activeFile);
  if (!host && !marker) return false;
  if (!exactFields(host, ["schemaVersion", "hostId", "checkout", "hostPid"])
    || host.schemaVersion !== 1 || host.checkout !== checkout
    || !/^[a-f0-9]{64}$/u.test(host.hostId) || !Number.isSafeInteger(host.hostPid)
    || host.hostPid <= 1 || (marker && (!exactFields(marker,
      ["schemaVersion", "hostId", "attemptId", "kind", "checkout", "workRoot", "executable", "hostPid"])
      || marker.schemaVersion !== 1 || marker.hostId !== host.hostId
      || marker.hostPid !== host.hostPid || marker.checkout !== checkout
      || !/^[a-f0-9]{64}$/u.test(marker.attemptId) || !TASK_KINDS.has(marker.kind)
      || typeof marker.workRoot !== "string" || !path.isAbsolute(marker.workRoot)
      || typeof marker.executable !== "string" || !path.isAbsolute(marker.executable)))) {
    throw new Error("이전 Java 감독 marker가 유효하지 않습니다.");
  }
  const acknowledgement = await channel.recoverPrevious({ host, marker });
  if (!exactFields(acknowledgement,
    ["hostId", "attemptId", "allGroupsAbsent", "observersClosed", "receiptFile"])
    || acknowledgement.hostId !== host.hostId
    || acknowledgement.attemptId !== (marker?.attemptId ?? null)
    || acknowledgement.allGroupsAbsent !== true || acknowledgement.observersClosed !== true) {
    throw new Error("이전 Java 그룹의 독립 회수 증거가 없습니다.");
  }
  if (marker) {
    if (typeof acknowledgement.receiptFile !== "string"
      || !new RegExp(`^guard-recover-${marker.attemptId}-[a-f0-9]{32}\\.json$`, "u")
        .test(acknowledgement.receiptFile)) throw new Error("독립 회수 영수증 경로가 유효하지 않습니다.");
    const independent = await readPrivateJson(path.join(stateRoot, acknowledgement.receiptFile));
    if (independent.hostId !== host.hostId || independent.attemptId !== marker.attemptId
      || independent.phase !== "recover" || !["absent", "absent_after_term", "absent_after_kill"].includes(
        independent.result?.status)) throw new Error("독립 회수 영수증 내용이 일치하지 않습니다.");
    const receiptFile = path.join(stateRoot, `receipt-${marker.attemptId}.json`);
    const receipt = {
      schemaVersion: 1, hostId: host.hostId, attemptId: marker.attemptId,
      kind: marker.kind, workRoot: marker.workRoot, executable: marker.executable,
      recoveredAfterHostExit: true, independentGroupAbsence: true,
      independentObserversClosed: true, recoveryEvidenceFile: acknowledgement.receiptFile,
    };
    try { await writeExclusive(receiptFile, receipt); }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      const previous = await readPrivateJson(receiptFile);
      if (previous.hostId !== host.hostId || previous.attemptId !== marker.attemptId
        || previous.independentGroupAbsence !== true || previous.independentObserversClosed !== true) {
        throw new Error("기존 Java 회수 영수증이 일치하지 않습니다.");
      }
    }
    await unlink(activeFile);
    await syncDirectory(stateRoot);
  } else if (acknowledgement.receiptFile !== null) {
    throw new Error("예약되지 않은 Java 회수 영수증이 있습니다.");
  }
  await unlink(hostFile);
  await syncDirectory(stateRoot);
  return true;
}

// A source host must supply an independently supervised channel before it can reserve a Java child.
export async function createJavaSourceGuard({ checkoutRoot, channel } = {}) {
  if (typeof channel?.reserve !== "function" || typeof channel?.recordSpawn !== "function"
    || typeof channel?.confirmAbsent !== "function"
    || typeof channel?.close !== "function") throw new Error("독립 Java 감독 채널이 필요합니다.");
  const { checkout, stateRoot } = await privateStateRoot(checkoutRoot);
  const hostId = randomBytes(32).toString("hex");
  const hostFile = path.join(stateRoot, "host.json");
  const activeFile = path.join(stateRoot, "active.json");
  try {
    await lstat(activeFile);
    throw new Error("이전 Java 실행의 회수 상태가 남아 있습니다.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeExclusive(hostFile, { schemaVersion: 1, hostId, checkout, hostPid: process.pid });
  let activeReservation = null;
  let recordedSpawn = null;
  let closed = false;

  async function reserve({ kind, workRoot, executable } = {}) {
    if (closed || activeReservation || !TASK_KINDS.has(kind)) throw new Error("Java 감독 예약을 시작할 수 없습니다.");
    const work = await realpath(workRoot);
    const command = await realpath(executable);
    if (!(await stat(work)).isDirectory() || !(await stat(command)).isFile()) {
      throw new Error("Java 작업 공간 또는 실행 파일이 정규 경로가 아닙니다.");
    }
    await access(command, fsConstants.X_OK);
    const marker = Object.freeze({
      schemaVersion: 1, hostId, attemptId: randomBytes(32).toString("hex"),
      kind, checkout, workRoot: work, executable: command, hostPid: process.pid,
    });
    await writeExclusive(activeFile, marker);
    activeReservation = marker;
    const acknowledgement = await channel.reserve(marker);
    if (!exactFields(acknowledgement, ["hostId", "attemptId", "watchingHost"])
      || acknowledgement.hostId !== hostId || acknowledgement.attemptId !== marker.attemptId
      || acknowledgement.watchingHost !== true) {
      throw new Error("독립 Java 감독자가 durable 예약을 확인하지 않았습니다.");
    }
    return marker;
  }

  async function recordSpawn({ reservation, pid, pgid } = {}) {
    if (closed || reservation !== activeReservation || recordedSpawn
      || !Number.isSafeInteger(pid) || pid <= 1 || pgid !== pid) {
      throw new Error("Java child PID/PGID 감독 인계가 유효하지 않습니다.");
    }
    const record = Object.freeze({ schemaVersion: 1, hostId, attemptId: reservation.attemptId, pid, pgid });
    await writeExclusive(path.join(stateRoot, `spawn-${reservation.attemptId}.json`), record);
    const acknowledgement = await channel.recordSpawn(record);
    if (!exactFields(acknowledgement, ["hostId", "attemptId", "pid", "pgid", "watchingGroup"])
      || acknowledgement.hostId !== hostId || acknowledgement.attemptId !== reservation.attemptId
      || acknowledgement.pid !== pid || acknowledgement.pgid !== pgid
      || acknowledgement.watchingGroup !== true) {
      throw new Error("독립 Java 감독자가 PID/PGID를 확인하지 않았습니다.");
    }
    recordedSpawn = record;
    return record;
  }

  async function finish({ reservation, execution } = {}) {
    if (closed || reservation !== activeReservation) throw new Error("Java 감독 예약이 일치하지 않습니다.");
    const observation = await channel.confirmAbsent(reservation);
    const independent = exactFields(observation, ["hostId", "attemptId", "allGroupsAbsent", "observersClosed"])
      && observation.hostId === hostId && observation.attemptId === reservation.attemptId
      && observation.allGroupsAbsent === true && observation.observersClosed === true;
    if (!locallyReaped(execution) || !independent
      || (execution.terminationEvidence.childCreated === true
        && (!recordedSpawn || recordedSpawn.pid !== execution.terminationEvidence.pid))) return false;
    await writeExclusive(path.join(stateRoot, `receipt-${reservation.attemptId}.json`), {
      schemaVersion: 1, hostId, attemptId: reservation.attemptId,
      kind: reservation.kind, workRoot: reservation.workRoot, executable: reservation.executable,
      terminationEvidence: execution.terminationEvidence,
      independentGroupAbsence: true, independentObserversClosed: true,
    });
    await unlink(activeFile);
    await syncDirectory(stateRoot);
    activeReservation = null;
    recordedSpawn = null;
    return true;
  }

  async function close() {
    if (closed) return;
    if (activeReservation) throw new Error("Java 작업 회수 전에는 감독 소유권을 놓을 수 없습니다.");
    try {
      await lstat(activeFile);
      throw new Error("Java 회수 marker가 남아 있어 감독 소유권을 놓을 수 없습니다.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const acknowledgement = await channel.close({ hostId });
    if (!exactFields(acknowledgement, ["hostId", "allGroupsAbsent", "observersClosed"])
      || acknowledgement.hostId !== hostId || acknowledgement.allGroupsAbsent !== true
      || acknowledgement.observersClosed !== true) throw new Error("독립 Java 감독 종료를 확인하지 못했습니다.");
    await unlink(hostFile);
    await syncDirectory(stateRoot);
    closed = true;
  }

  return Object.freeze({ reserve, recordSpawn, finish, close });
}

// The production gate remains separate from the fixed Node fixture mode.
export async function startIndependentJavaGuardChannel({ spawnProcess, timeoutMs = 1_000,
  disposeTimeoutMs = 5_000 } = {}) {
  if (typeof spawnProcess !== "function") throw new Error("Java 감독 프로세스 실행은 아직 활성화되지 않았습니다.");
  const child = spawnProcess(process.execPath, [fileURLToPath(import.meta.url), "--java-guard-worker"], {
    detached: true, stdio: ["ignore", "ignore", "ignore", "ipc"],
  });
  let exitObserved = false;
  let closeObserved = false;
  let exitCode = null;
  let closeCode = null;
  child?.once?.("exit", (code) => { exitObserved = true; exitCode = code; });
  child?.once?.("close", (code) => { closeObserved = true; closeCode = code; });
  const waitForClose = (durationMs) => new Promise((resolve) => {
    if (exitObserved && closeObserved) { resolve(true); return; }
    const done = () => {
      if (!exitObserved || !closeObserved) return;
      clearTimeout(timer);
      child.off("exit", done);
      child.off("close", done);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", done);
      child.off("close", done);
      resolve(false);
    }, durationMs);
    child.on("exit", done);
    child.on("close", done);
  });
  const reapStartupChild = async (reapMs = timeoutMs) => {
    if (exitObserved && closeObserved) return true;
    if (!Number.isSafeInteger(child?.pid) || child.pid <= 1 || typeof child.kill !== "function") return false;
    try { child.kill("SIGTERM"); } catch { /* Try the exact same child with SIGKILL below. */ }
    if (await waitForClose(reapMs)) return true;
    try { child.kill("SIGKILL"); } catch { return false; }
    return waitForClose(reapMs);
  };
  if (!Number.isSafeInteger(child?.pid) || child.pid <= 1 || typeof child.send !== "function") {
    if (!await reapStartupChild()) throw new Error("독립 Java 감독 시작 실패 후 child 종료를 확인하지 못했습니다.");
    throw new Error("독립 Java 감독 프로세스를 확인하지 못했습니다.");
  }
  const pending = new Map();
  let nextId = 1;
  let ready;
  let failedError = null;
  const startup = new Promise((resolve, reject) => { ready = { resolve, reject }; });
  const fail = (error) => {
    failedError = error;
    ready?.reject(error);
    ready = null;
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    pending.clear();
  };
  child.on("message", (message) => {
    if (message?.id === 0 && message.op === "ready" && message.version === 1) {
      ready?.resolve();
      ready = null;
      return;
    }
    const entry = pending.get(message?.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.op !== entry.op || !exactFields(message, ["id", "op", "result"])) {
      entry.reject(new Error("Java 감독 IPC 응답이 요청과 다릅니다."));
    } else entry.resolve(message.result);
  });
  child.once("error", fail);
  child.once("exit", () => fail(new Error("독립 Java 감독 프로세스가 종료됐습니다.")));
  child.once("disconnect", () => fail(new Error("독립 Java 감독 IPC가 끊겼습니다.")));
  const startupTimer = setTimeout(() => fail(new Error("독립 Java 감독 시작 시간이 초과됐습니다.")), timeoutMs);
  try { await startup; }
  catch (error) {
    if (!await reapStartupChild()) {
      throw new Error("독립 Java 감독 시작 실패 후 child 종료를 확인하지 못했습니다.", { cause: error });
    }
    throw error;
  } finally { clearTimeout(startupTimer); }

  function request(op, payload, responseTimeoutMs = timeoutMs) {
    if (failedError) return Promise.reject(failedError);
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("독립 Java 감독 응답 시간이 초과됐습니다."));
      }, responseTimeoutMs);
      pending.set(id, { op, timer, resolve, reject });
      const onSendError = (error) => {
        if (!error || !pending.has(id)) return;
        pending.delete(id);
        clearTimeout(timer);
        reject(error);
      };
      try { child.send({ id, op, payload }, onSendError); }
      catch (error) { onSendError(error); }
    });
  }

  async function waitForWorkerExit() {
    if (await waitForClose(disposeTimeoutMs)) {
      if (exitCode === 0 && closeCode === 0) {
        return { workerExitObserved: true, workerCloseObserved: true, workerExitCode: 0 };
      }
      throw new Error("독립 Java 감독 회수 완료를 확인하지 못했습니다.");
    }
    const reaped = await reapStartupChild(250);
    throw new Error(reaped
      ? "독립 Java 감독이 기한을 넘겨 종료돼 회수 결과가 불명확합니다."
      : "독립 Java 감독 프로세스의 종료를 확인하지 못했습니다.");
  }

  let disposePromise;
  function disconnectAfterFailure() {
    disposePromise ??= (async () => {
      let acknowledgement;
      try { acknowledgement = await request("shutdown", null, disposeTimeoutMs); }
      catch (error) {
        const reaped = await reapStartupChild(250);
        throw new Error(reaped
          ? "독립 Java 감독 종료 응답이 없어 회수 결과가 불명확합니다."
          : "독립 Java 감독 종료 응답과 프로세스 종료를 확인하지 못했습니다.", { cause: error });
      }
      const exit = await waitForWorkerExit();
      if (exactFields(acknowledgement, ["allGroupsAbsent", "observersClosed"])
        && acknowledgement.allGroupsAbsent === true && acknowledgement.observersClosed === true) return exit;
      throw new Error("독립 Java 감독의 그룹 회수 증거가 없습니다.");
    })();
    return disposePromise;
  }

  return Object.freeze({
    reserve: (marker) => request("reserve", marker),
    recordSpawn: (record) => request("recordSpawn", record),
    recoverPrevious: (state) => request("recoverPrevious", state),
    confirmAbsent: (marker) => request("confirmAbsent", marker),
    disconnectAfterFailure,
    close: async (host) => {
      const result = await request("close", host);
      if (result?.allGroupsAbsent === true && result?.observersClosed === true) {
        await waitForWorkerExit();
      }
      return result;
    },
  });
}

if (process.argv[2] === "--java-guard-worker" && process.argv[1] === fileURLToPath(import.meta.url)) {
  const fixtureRequested = process.argv[3] === "--node-fixture";
  const productionMode = process.argv.length === 3;
  const fixtureExecutable = await realpath(process.execPath);
  let fixtureValidated = false;
  if (fixtureRequested && process.argv.length === 4) {
    try {
      const info = await lstat(NODE_FIXTURE_PATH);
      fixtureValidated = info.isFile() && !info.isSymbolicLink()
        && await realpath(NODE_FIXTURE_PATH) === NODE_FIXTURE_PATH
        && createHash("sha256").update(await readFile(NODE_FIXTURE_PATH)).digest("hex") === NODE_FIXTURE_SHA256;
    } catch { /* A changed or missing fixture keeps every execution kind closed. */ }
  }
  const allowed = (marker) => fixtureRequested
    ? fixtureValidated && marker?.kind === NODE_FIXTURE_KIND && marker.executable === fixtureExecutable
    : productionMode && SOURCE_JAVA_GUARD_PREFLIGHT_VALIDATED && marker?.kind !== NODE_FIXTURE_KIND;
  let watchedMarker = null;
  let shutdownRequested = false;
  let queued = Promise.resolve();
  const observe = () => observeJavaProcessTable({ spawnProcess: spawn });
  const signalGroup = (group, signalName) => {
    if (!Number.isSafeInteger(group) || group <= 1) return false;
    try { process.kill(-group, signalName); return true; }
    catch (error) { return error.code === "ESRCH"; }
  };
  const recoveryFile = (marker, phase) => `guard-${phase}-${marker.attemptId}`
    + (phase === "recover" ? `-${randomBytes(16).toString("hex")}` : "") + ".json";
  const inspect = async (marker, terminate, phase) => {
    let ownedMarker = marker;
    try {
      const record = await readPrivateJson(path.join(marker.checkout, ".bam-java-state",
        `spawn-${marker.attemptId}.json`));
      if (!exactFields(record, ["schemaVersion", "hostId", "attemptId", "pid", "pgid"])
        || record.schemaVersion !== 1 || record.hostId !== marker.hostId
        || record.attemptId !== marker.attemptId || !Number.isSafeInteger(record.pid)
        || record.pid <= 1 || record.pgid !== record.pid) throw new Error("invalid_spawn_handoff");
      ownedMarker = { ...marker, ownedPgid: record.pgid };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const result = await recoverOwnedJavaGroups(ownedMarker, { observe, signalGroup, terminate });
    const receiptFile = recoveryFile(marker, phase);
    await writeExclusive(path.join(marker.checkout, ".bam-java-state", receiptFile), {
      schemaVersion: 1, hostId: marker.hostId, attemptId: marker.attemptId,
      phase, result,
    });
    return { receiptFile, absent: result.status === "absent" || result.status === "absent_after_term"
      || result.status === "absent_after_kill" };
  };
  const handle = async (message) => {
    if (!Number.isSafeInteger(message?.id) || message.id < 1 || typeof message.op !== "string") return;
    const payload = message.payload;
    let result;
    if (message.op === "reserve") {
      let watchingHost = false;
      if (allowed(payload) && exactFields(payload,
        ["schemaVersion", "hostId", "attemptId", "kind", "checkout", "workRoot", "executable", "hostPid"])) {
        const root = path.join(payload.checkout, ".bam-java-state");
        const durable = await readPrivateJson(path.join(root, "active.json"));
        const host = await readPrivateJson(path.join(root, "host.json"));
        if (JSON.stringify(durable) === JSON.stringify(payload) && host.hostId === payload.hostId
          && /^[a-f0-9]{64}$/u.test(payload.attemptId) && watchedMarker === null) {
          watchedMarker = payload;
          watchingHost = true;
        }
      }
      result = { hostId: payload?.hostId, attemptId: payload?.attemptId, watchingHost };
    } else if (message.op === "recordSpawn") {
      let watchingGroup = false;
      if (allowed(watchedMarker) && watchedMarker
        && exactFields(payload, ["schemaVersion", "hostId", "attemptId", "pid", "pgid"])
        && payload.hostId === watchedMarker.hostId && payload.attemptId === watchedMarker.attemptId
        && Number.isSafeInteger(payload.pid) && payload.pid > 1 && payload.pgid === payload.pid) {
        const durable = await readPrivateJson(path.join(watchedMarker.checkout, ".bam-java-state",
          `spawn-${watchedMarker.attemptId}.json`));
        watchingGroup = JSON.stringify(durable) === JSON.stringify(payload);
      }
      result = { hostId: payload?.hostId, attemptId: payload?.attemptId,
        pid: payload?.pid, pgid: payload?.pgid, watchingGroup };
    } else if (message.op === "recoverPrevious") {
      const host = payload?.host;
      const marker = payload?.marker;
      let allGroupsAbsent = false;
      let receiptFile = null;
      if ((marker ? allowed(marker) : (fixtureRequested ? fixtureValidated
        : productionMode && SOURCE_JAVA_GUARD_PREFLIGHT_VALIDATED))
        && watchedMarker === null
        && exactFields(host, ["schemaVersion", "hostId", "checkout", "hostPid"])
        && (marker === null || exactFields(marker,
          ["schemaVersion", "hostId", "attemptId", "kind", "checkout", "workRoot", "executable", "hostPid"]))) {
        const root = path.join(host.checkout, ".bam-java-state");
        const durableHost = await readPrivateJson(path.join(root, "host.json"));
        const durableMarker = marker ? await readPrivateJson(path.join(root, "active.json")) : null;
        let oldHostAbsent = false;
        try { process.kill(host.hostPid, 0); }
        catch (error) { oldHostAbsent = error.code === "ESRCH"; }
        if (oldHostAbsent && JSON.stringify(durableHost) === JSON.stringify(host)
          && JSON.stringify(durableMarker) === JSON.stringify(marker)) {
          if (marker) {
            watchedMarker = marker;
            const recovery = await inspect(marker, true, "recover");
            allGroupsAbsent = recovery.absent;
            receiptFile = recovery.receiptFile;
            if (allGroupsAbsent) watchedMarker = null;
          } else {
            const observation = await observe();
            allGroupsAbsent = observation?.observerExitObserved === true
              && observation?.observerCloseObserved === true && Array.isArray(observation.rows);
          }
        }
      }
      result = { hostId: host?.hostId, attemptId: marker?.attemptId ?? null,
        allGroupsAbsent, observersClosed: allGroupsAbsent, receiptFile };
    } else if (message.op === "confirmAbsent") {
      const same = watchedMarker && payload?.attemptId === watchedMarker.attemptId
        && payload?.hostId === watchedMarker.hostId;
      const absent = allowed(watchedMarker) && same
        ? (await inspect(watchedMarker, false, "confirm")).absent : false;
      if (absent) watchedMarker = null;
      result = { hostId: payload?.hostId, attemptId: payload?.attemptId,
        allGroupsAbsent: absent, observersClosed: absent };
    } else if (message.op === "close") {
      let absent = watchedMarker === null;
      if (allowed(watchedMarker) && watchedMarker
        && payload?.hostId === watchedMarker.hostId) {
        try {
          await lstat(path.join(watchedMarker.checkout, ".bam-java-state", "active.json"));
          absent = false;
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          absent = (await inspect(watchedMarker, false, "close")).absent;
        }
        if (absent) watchedMarker = null;
      }
      result = { hostId: payload?.hostId, allGroupsAbsent: absent, observersClosed: absent };
    } else if (message.op === "shutdown") {
      shutdownRequested = true;
      let absent = watchedMarker === null;
      if (watchedMarker) {
        try {
          absent = allowed(watchedMarker)
            && (await inspect(watchedMarker, true, "host-exit")).absent;
        } catch { absent = false; }
      }
      if (!absent) process.exitCode = 1;
      result = { allGroupsAbsent: absent, observersClosed: absent };
    } else return;
    const disconnectAfterResponse = message.op === "shutdown"
      || (message.op === "close" && result.allGroupsAbsent === true && result.observersClosed === true);
    if (disconnectAfterResponse) {
      process.send?.({ id: message.id, op: message.op, result }, (error) => {
        if (error) process.exitCode = 1;
        try { process.disconnect?.(); } catch { process.exitCode = 1; }
      });
    } else process.send?.({ id: message.id, op: message.op, result });
  };
  process.on("message", (message) => {
    queued = queued.then(() => handle(message)).catch(() => {
      process.exitCode = 1;
      // No success response: the host keeps its durable marker and closes Java admission.
    });
  });
  process.on("disconnect", () => {
    queued = queued.then(async () => {
      if (!shutdownRequested && allowed(watchedMarker) && watchedMarker) {
        const recovery = await inspect(watchedMarker, true, "host-exit");
        if (!recovery.absent) process.exitCode = 1;
      }
    }).catch(() => { process.exitCode = 1; /* The marker remains unresolved. */ })
      .finally(() => {
        process.removeAllListeners("message");
        process.channel?.unref?.();
      });
  });
  process.send?.({ id: 0, op: "ready", version: 1 });
}
