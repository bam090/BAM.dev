const HEARTBEAT_MS = 5_000;

const ERROR_COPY = {
  owner_busy: "다른 탭에서 Java 연결을 사용 중입니다. 그 탭에서 연결을 끝낸 뒤 다시 연결하세요.",
  run_busy: "다른 Java 실행을 정리 중입니다. 잠시 후 다시 시도하세요.",
  java_unavailable: "로컬 Java 실행 준비가 완료되지 않았습니다. 코드는 계속 작성하고 저장할 수 있습니다.",
  bootstrap_denied: "연결 정보가 만료됐습니다. 초안을 저장한 뒤 이 페이지를 새로고침하세요.",
  session_expired: "Java 연결이 만료됐습니다. 초안을 저장한 뒤 이 페이지를 새로고침하세요.",
  run_expired: "실행 결과를 확인할 수 없습니다. 이 실행은 정답이나 오답으로 기록하지 않았습니다.",
  reap_unknown: "이전 Java 실행의 종료를 확인할 수 없어 새 실행이 차단됐습니다.",
  session_limit: "이번 연결의 실행 한도에 도달했습니다. 초안을 저장한 뒤 다시 연결하세요.",
};

function connectionError(code, fallback) {
  const error = new Error(ERROR_COPY[code] ?? fallback);
  error.code = code;
  return error;
}

function validSession(value) {
  return value && typeof value.serverEpoch === "string" && value.serverEpoch.length > 0
    && typeof value.sessionId === "string" && value.sessionId.length > 0
    && typeof value.token === "string" && value.token.length > 0
    && Number.isSafeInteger(value.leaseMs) && value.leaseMs > HEARTBEAT_MS;
}

async function sourceSha256(source) {
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// The HTML bootstrap is taken once at startup and never copied into storage or a Worker.
export function takeJavaBrowserBootstrap(page = window) {
  const take = page.takeBamJavaBootstrap;
  delete page.takeBamJavaBootstrap;
  return typeof take === "function" ? take() : null;
}

export class JavaBrowserTransport {
  constructor(bootstrap, onChange = () => {}) {
    this.bootstrap = typeof bootstrap === "string" ? bootstrap : null;
    this.onChange = onChange;
    this.session = null;
    this.timer = null;
    this.runAbort = null;
    this.pendingRun = null;
    this.cancelledRunIds = new Set();
    this.status = this.bootstrap ? "disconnected" : "unavailable";
    this.message = this.bootstrap
      ? "로컬 Java 연결을 선택하면 이 탭에서만 공개 테스트를 실행합니다."
      : "이 페이지에는 Java 연결 권한이 없습니다. Java 서버의 주소로 새로 접속해 주세요.";
    this.capability = null;
  }

  get canConnect() {
    return Boolean(this.bootstrap && !this.session && this.status !== "connecting");
  }

  get needsReload() {
    return this.status === "expired";
  }

  setStatus(status, message) {
    this.status = status;
    this.message = message;
    this.onChange();
  }

  async post(endpoint, body, session = this.session, signal = undefined) {
    const headers = { "Content-Type": "application/json", "X-Bam-Java": "1" };
    if (endpoint === "session") headers["X-Bam-Java-Bootstrap"] = this.bootstrap;
    else if (session) headers.Authorization = `Bearer ${session.token}`;
    let response;
    try {
      response = await fetch(`/api/java/${endpoint}`, {
        method: "POST", headers, body: JSON.stringify(body), cache: "no-store",
        credentials: "omit", redirect: "error", referrerPolicy: "no-referrer",
        keepalive: endpoint === "release", signal,
      });
    } catch {
      throw connectionError("network_error", "로컬 Java 연결에서 응답을 받지 못했습니다. 실행 결과는 기록하지 않았습니다.");
    }
    let result;
    try { result = await response.json(); }
    catch { throw connectionError("invalid_response", "Java 연결 응답을 확인할 수 없습니다."); }
    if (!response.ok) {
      const code = typeof result?.error?.code === "string" ? result.error.code : "invalid_response";
      throw connectionError(code, "Java 연결 요청을 완료하지 못했습니다.");
    }
    return { status: response.status, result };
  }

  async connect() {
    if (!this.canConnect) return;
    this.setStatus("connecting", "로컬 Java 연결 중…");
    try {
      const { result: session } = await this.post("session", {});
      if (!validSession(session)) throw connectionError("invalid_response", "Java 연결 응답을 확인할 수 없습니다.");
      this.bootstrap = null;
      this.session = session;
      this.cancelledRunIds.clear();
      const { result } = await this.post("capabilities", { sessionId: session.sessionId });
      if (result.serverEpoch !== session.serverEpoch || result.sessionId !== session.sessionId) {
        throw connectionError("invalid_response", "Java 연결 상태가 바뀌었습니다.");
      }
      this.capability = { quest: result.quest, codingTest: result.codingTest };
      this.timer = window.setInterval(() => { void this.heartbeat(); }, HEARTBEAT_MS);
      this.setStatus("connected", "이 탭의 로컬 Java 연결을 사용 중입니다. 탭이 절전 상태면 연결이 만료될 수 있습니다.");
    } catch (error) {
      if (this.session) this.expire(error.message);
      else this.setStatus(error.code === "bootstrap_denied" ? "expired" : "disconnected", error.message);
    }
  }

  expire(message = ERROR_COPY.session_expired) {
    const session = this.session;
    this.runAbort?.abort();
    window.clearInterval(this.timer);
    this.timer = null;
    if (session) void this.post("release", { sessionId: session.sessionId }, session).catch(() => {});
    this.session = null;
    this.bootstrap = null;
    this.capability = null;
    const reconnect = message.includes("새로고침")
      ? message : `${message} 초안을 저장한 뒤 페이지를 새로고침해 다시 연결하세요.`;
    this.setStatus("expired", `${reconnect} 서버가 이전 실행을 정리 중이면 잠시 기다려야 할 수 있습니다.`);
  }

  async heartbeat() {
    const session = this.session;
    if (!session) return;
    try {
      const { result } = await this.post("heartbeat", { sessionId: session.sessionId }, session);
      if (this.session !== session) return;
      if (result.serverEpoch !== session.serverEpoch || result.sessionId !== session.sessionId
        || !Number.isSafeInteger(result.leaseMs) || result.leaseMs <= HEARTBEAT_MS) {
        throw connectionError("invalid_response", "Java 연결 상태가 바뀌었습니다.");
      }
    } catch (error) {
      if (this.session === session) this.expire(error.message);
    }
  }

  bridge(kind) {
    return {
      capabilities: async () => {
        if (this.status !== "connected") return null;
        return kind === "quest" ? this.capability?.quest : this.capability?.codingTest;
      },
      run: (request) => this.run(kind, request),
      cancel: ({ requestId }) => this.cancel(requestId),
    };
  }

  async run(kind, request) {
    const session = this.session;
    if (!session || this.status !== "connected") throw connectionError("session_expired", ERROR_COPY.session_expired);
    if (this.pendingRun) throw connectionError("run_busy", ERROR_COPY.run_busy);
    const pending = { requestId: request.requestId, cancelled: this.cancelledRunIds.has(request.requestId) };
    this.pendingRun = pending;
    try {
      if (pending.cancelled) throw connectionError("run_expired", ERROR_COPY.run_expired);
      const digest = await sourceSha256(request.source);
      if (pending.cancelled) throw connectionError("run_expired", ERROR_COPY.run_expired);
      if (this.session !== session || this.status !== "connected") {
        throw connectionError("session_expired", ERROR_COPY.session_expired);
      }
      const controller = new AbortController();
      this.runAbort = controller;
      const { status, result } = await this.post("run", { sessionId: session.sessionId, kind, request }, session, controller.signal);
      if (pending.cancelled) throw connectionError("run_expired", ERROR_COPY.run_expired);
      if (status === 202) throw connectionError("run_expired", ERROR_COPY.run_expired);
      if (this.session !== session || this.status !== "connected"
        || result.serverEpoch !== session.serverEpoch || result.sessionId !== session.sessionId
        || result.runId !== request.requestId || result.kind !== kind
        || result.revision !== request.revision || result.sourceSha256 !== digest
        || !result.report || typeof result.report !== "object") {
        throw connectionError("invalid_response", "실행 결과가 현재 코드 또는 연결과 일치하지 않아 기록하지 않았습니다.");
      }
      return result.report;
    } catch (error) {
      if (["session_expired", "network_error", "invalid_response"].includes(error.code)
        && this.session === session) this.expire(error.message);
      throw error;
    } finally {
      if (this.pendingRun === pending) this.pendingRun = null;
      this.runAbort = null;
    }
  }

  async cancel(requestId) {
    this.cancelledRunIds.add(requestId);
    if (this.cancelledRunIds.size > 128) this.cancelledRunIds.delete(this.cancelledRunIds.values().next().value);
    if (this.pendingRun?.requestId === requestId) this.pendingRun.cancelled = true;
    const session = this.session;
    if (!session) return;
    try { await this.post("cancel", { sessionId: session.sessionId, requestId }, session); }
    catch (error) { if (error.code === "session_expired" && this.session === session) this.expire(error.message); }
  }

  release() {
    const session = this.session;
    if (!session) return;
    window.clearInterval(this.timer);
    this.timer = null;
    this.session = null;
    this.capability = null;
    this.setStatus("expired", ERROR_COPY.session_expired);
    void this.post("release", { sessionId: session.sessionId }, session).catch(() => {});
  }
}
