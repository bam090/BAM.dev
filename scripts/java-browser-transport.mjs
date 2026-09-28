import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { performance } from "node:perf_hooks";

const BODY_LIMIT = 32 * 1024;
const SOURCE_LIMIT = 20 * 1024;
const REPORT_LIMIT = 256 * 1024;
const BODY_TIMEOUT_MS = 5_000;
const LEASE_MS = 15_000;
const BOOTSTRAP_MS = 60_000;
const REAP_TIMEOUT_MS = 5_000;
const MAX_SEEN_IDS = 128;
const CANCELLED_ID = Symbol("cancelled request ID");
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const ENDPOINTS = new Set(["session", "capabilities", "run", "cancel", "heartbeat", "release"]);

function exactFields(value, names) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === names.length
    && Object.keys(value).every((key) => names.includes(key));
}

function singleHeader(request, name) {
  const raw = request.rawHeaders ?? [];
  const matches = [];
  for (let index = 0; index < raw.length; index += 2) {
    if (raw[index].toLowerCase() === name) matches.push(raw[index + 1]);
  }
  if (matches.length > 1) return null;
  return matches.length === 1 ? matches[0] : request.headers?.[name];
}

function sameSecret(received, expected) {
  if (typeof received !== "string" || typeof expected !== "string") return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function reply(response, status, body) {
  if (response.destroyed || response.writableEnded) return;
  const bytes = Buffer.from(JSON.stringify(body));
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": bytes.length,
    "X-Content-Type-Options": "nosniff",
  });
  response.end(bytes);
}

function failure(response, status, code) {
  reply(response, status, { error: { code, message: code } });
}

async function readJson(request) {
  if (!/^application\/json(?:;\s*charset=utf-8)?$/iu.test(singleHeader(request, "content-type") ?? "")) {
    return { status: 415, code: "json_required" };
  }
  const chunks = [];
  let size = 0;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    request.destroy?.();
  }, BODY_TIMEOUT_MS);
  timeout.unref?.();
  try {
    for await (const chunk of request) {
      size += chunk.length;
      if (size > BODY_LIMIT) return { status: 413, code: "body_too_large" };
      chunks.push(chunk);
    }
    if (timedOut) return { status: 408, code: "body_timeout" };
    if (request.aborted || request.complete === false) return { status: 400, code: "body_incomplete" };
    return { body: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
  } catch {
    return { status: timedOut ? 408 : 400, code: timedOut ? "body_timeout" : "invalid_json" };
  } finally {
    clearTimeout(timeout);
  }
}

function validRun(body) {
  if (!exactFields(body, ["sessionId", "kind", "request"])) return false;
  const request = body.request;
  const quest = body.kind === "quest";
  const codingTest = body.kind === "coding-test";
  if (!quest && !codingTest) return false;
  if (!exactFields(request, quest
    ? ["questId", "revision", "source", "requestId"]
    : ["problemId", "revision", "source", "requestId", "mode"])) return false;
  const contentId = quest ? request.questId : request.problemId;
  return ID_PATTERN.test(request.requestId) && ID_PATTERN.test(contentId)
    && Number.isSafeInteger(request.revision) && request.revision > 0
    && typeof request.source === "string" && Buffer.byteLength(request.source, "utf8") <= SOURCE_LIMIT
    && (quest || request.mode === "run" || request.mode === "submit");
}

function digest(body) {
  const request = body.request;
  const canonical = body.kind === "quest"
    ? [body.kind, request.requestId, request.questId, request.revision, request.source]
    : [body.kind, request.requestId, request.problemId, request.revision, request.source, request.mode];
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

function withDeadline(promise, milliseconds) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("reap_timeout")), milliseconds);
      timer.unref?.();
    }),
  ]).finally(() => clearTimeout(timer));
}

export function createJavaBrowserTransport({
  port,
  runtimeReady = false,
  learnerIsolationValidated = false,
  runner = null,
  now = () => performance.now(),
  setLeaseTimeout = setTimeout,
  clearLeaseTimeout = clearTimeout,
} = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new TypeError("port required");
  const host = `localhost:${port}`;
  const origin = `http://${host}`;
  const serverEpoch = randomBytes(32).toString("base64url");
  const enabled = runtimeReady === true && learnerIsolationValidated === true
    && typeof runner?.run === "function" && typeof runner?.capabilities === "function"
    && typeof runner?.validate === "function";
  let owner = null;
  let pendingBootstrap = null;
  let active = null;
  let poisoned = false;
  let stopping = false;
  let leaseTimer = null;
  let leaseGeneration = 0;

  function clearOwnerLeaseTimer() {
    leaseGeneration += 1;
    if (leaseTimer !== null) clearLeaseTimeout(leaseTimer);
    leaseTimer = null;
  }

  function scheduleOwnerLeaseTimer(session) {
    clearOwnerLeaseTimer();
    const generation = leaseGeneration;
    leaseTimer = setLeaseTimeout(() => {
      if (generation !== leaseGeneration || owner !== session || session.closing) return;
      leaseTimer = null;
      if (now() >= session.leaseUntil) void closeOwner();
      else scheduleOwnerLeaseTimer(session);
    }, Math.max(0, session.leaseUntil - now()));
    leaseTimer?.unref?.();
  }

  function hostAllowed(request) {
    return singleHeader(request, "host") === host;
  }

  function issueNavigationCapability(request) {
    if (!enabled || stopping || poisoned || owner || !hostAllowed(request)) return null;
    if (request.method !== "GET" || !["/", "/index.html"].includes(request.url?.split("?")[0])) return null;
    if (singleHeader(request, "sec-fetch-mode") !== "navigate"
      || singleHeader(request, "sec-fetch-dest") !== "document"
      || !["none", "same-origin"].includes(singleHeader(request, "sec-fetch-site"))) return null;
    pendingBootstrap = { value: randomBytes(32).toString("base64url"), until: now() + BOOTSTRAP_MS };
    return pendingBootstrap.value;
  }

  function decorateHtml(request, html) {
    const capability = issueNavigationCapability(request);
    const nonce = capability ? randomBytes(16).toString("base64url") : null;
    const script = capability
      ? `<script nonce="${nonce}">Object.defineProperty(window,"takeBamJavaBootstrap",{configurable:true,value:(()=>{let value="${capability}";return ()=>{const taken=value;value=null;return taken}})()});document.currentScript.remove()</script>`
      : "";
    const body = script
      ? html.replace("<script type=\"module\" src=\"./src/app.js\"></script>", `${script}\n    <script type="module" src="./src/app.js"></script>`)
      : html;
    return {
      body,
      headers: {
        "Content-Security-Policy": `default-src 'self'; script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ""}; style-src 'self' 'unsafe-inline' data:; img-src 'self' data:; connect-src 'self'; worker-src ${origin}/src/workers/javascript-code-runner.classic.js; frame-ancestors 'none'; base-uri 'none'`,
        "Vary": "Sec-Fetch-Mode, Sec-Fetch-Dest",
      },
    };
  }

  function requestAllowed(request) {
    return hostAllowed(request)
      && singleHeader(request, "origin") === origin
      && singleHeader(request, "sec-fetch-site") === "same-origin"
      && singleHeader(request, "sec-fetch-mode") === "cors"
      && singleHeader(request, "x-bam-java") === "1";
  }

  function authenticate(request, body) {
    const authorization = singleHeader(request, "authorization");
    if (!owner || owner.closing || !sameSecret(authorization, `Bearer ${owner.token}`)
      || body.sessionId !== owner.sessionId) return false;
    if (now() >= owner.leaseUntil) {
      void closeOwner();
      return false;
    }
    return true;
  }

  async function closeOwner() {
    if (!owner) return;
    if (owner.closing) return owner.closing;
    const closingOwner = owner;
    clearOwnerLeaseTimer();
    pendingBootstrap = null;
    closingOwner.closing = (async () => {
      if (active) {
        active.controller.abort();
        try { await withDeadline(active.done, REAP_TIMEOUT_MS); }
        catch { poisoned = true; }
      }
      if (!poisoned && owner === closingOwner) owner = null;
    })();
    return closingOwner.closing;
  }

  async function reapExpired() {
    if (owner && now() >= owner.leaseUntil) await closeOwner();
    if (pendingBootstrap && now() >= pendingBootstrap.until) pendingBootstrap = null;
  }

  async function shutdown() {
    stopping = true;
    pendingBootstrap = null;
    clearOwnerLeaseTimer();
    await closeOwner();
  }

  async function handle(request, response) {
    const pathname = request.url?.split("?")[0] ?? "";
    if (!pathname.startsWith("/api/java/")) return false;
    const endpoint = pathname.slice("/api/java/".length);
    if (!ENDPOINTS.has(endpoint)) { failure(response, 404, "not_found"); return true; }
    if (request.method !== "POST") { failure(response, 405, "post_required"); return true; }
    if (!requestAllowed(request)) { failure(response, 403, "request_denied"); return true; }
    const parsed = await readJson(request);
    if (parsed.status) { failure(response, parsed.status, parsed.code); return true; }
    const body = parsed.body;

    if (endpoint === "session") {
      if (!exactFields(body, [])) { failure(response, 400, "invalid_body"); return true; }
      if (!enabled || stopping || poisoned) { failure(response, 503, "java_unavailable"); return true; }
      await reapExpired();
      if (owner) { failure(response, 409, "owner_busy"); return true; }
      const bootstrap = singleHeader(request, "x-bam-java-bootstrap");
      if (!pendingBootstrap || now() >= pendingBootstrap.until || !sameSecret(bootstrap, pendingBootstrap.value)) {
        failure(response, 403, "bootstrap_denied"); return true;
      }
      pendingBootstrap = null; // Consume before any asynchronous work.
      owner = {
        sessionId: randomBytes(32).toString("base64url"),
        token: randomBytes(32).toString("base64url"),
        leaseUntil: now() + LEASE_MS,
        seen: new Map(),
        lastReceipt: null,
        closing: null,
      };
      scheduleOwnerLeaseTimer(owner);
      reply(response, 200, { serverEpoch, sessionId: owner.sessionId, token: owner.token, leaseMs: LEASE_MS });
      return true;
    }

    const fields = endpoint === "run" ? ["sessionId", "kind", "request"]
      : endpoint === "cancel" ? ["sessionId", "requestId"] : ["sessionId"];
    if (!exactFields(body, fields)) { failure(response, 400, "invalid_body"); return true; }
    if (!authenticate(request, body)) { failure(response, 401, "session_expired"); return true; }
    if (stopping || poisoned) { failure(response, 503, "java_unavailable"); return true; }
    const session = owner;
    if (endpoint === "heartbeat") {
      session.leaseUntil = now() + LEASE_MS;
      scheduleOwnerLeaseTimer(session);
      reply(response, 200, { serverEpoch, sessionId: session.sessionId, leaseMs: LEASE_MS });
      return true;
    }
    if (endpoint === "release") {
      await closeOwner();
      if (poisoned) failure(response, 503, "reap_unknown");
      else reply(response, 200, { serverEpoch, released: true });
      return true;
    }
    if (endpoint === "capabilities") {
      try {
        const [quest, codingTest] = await Promise.all([
          runner.capabilities("quest"), runner.capabilities("coding-test"),
        ]);
        if (owner !== session || session.closing) throw new Error("session_expired");
        reply(response, 200, { serverEpoch, sessionId: session.sessionId, quest, codingTest });
      } catch { failure(response, 503, "java_unavailable"); }
      return true;
    }
    if (endpoint === "cancel") {
      if (!ID_PATTERN.test(body.requestId)) { failure(response, 400, "invalid_body"); return true; }
      if (!active || active.session !== session || active.runId !== body.requestId) {
        if (!session.seen.has(body.requestId) && session.seen.size < MAX_SEEN_IDS) {
          session.seen.set(body.requestId, CANCELLED_ID);
        }
        failure(response, 410, "run_expired"); return true;
      }
      active.controller.abort();
      reply(response, 202, { serverEpoch, sessionId: session.sessionId, runId: active.runId, status: "aborting" });
      return true;
    }

    if (!validRun(body)) { failure(response, 400, "invalid_run"); return true; }
    if (session.seen.get(body.request.requestId) === CANCELLED_ID) {
      failure(response, 410, "run_expired"); return true;
    }
    try {
      if (runner.validate(body.kind, body.request) !== true) throw new Error("untrusted request");
    } catch {
      failure(response, 400, "untrusted_run");
      return true;
    }
    const runId = body.request.requestId;
    const runDigest = digest(body);
    const seen = session.seen.get(runId);
    if (seen) {
      if (seen !== runDigest) failure(response, 409, "run_id_conflict");
      else if (session.lastReceipt?.runId === runId) reply(response, 200, session.lastReceipt);
      else if (active?.runId === runId) reply(response, 202, { serverEpoch, sessionId: session.sessionId, runId, status: "pending" });
      else failure(response, 410, "run_expired");
      return true;
    }
    if (active) { failure(response, 409, "run_busy"); return true; }
    if (session.seen.size >= MAX_SEEN_IDS) { failure(response, 429, "session_limit"); return true; }

    // Reserve the identity and shared slot before the first await or runner launch.
    session.seen.set(runId, runDigest);
    const controller = new AbortController();
    const slot = { session, runId, controller, done: null };
    active = slot;
    let finished = false;
    response.once?.("finish", () => { finished = true; });
    response.once?.("close", () => { if (!finished && active === slot) controller.abort(); });
    const sourceSha256 = createHash("sha256").update(body.request.source).digest("hex");
    slot.done = Promise.resolve().then(() => runner.run(body.kind, body.request, { signal: controller.signal }))
      .then((report) => {
        if (Buffer.byteLength(JSON.stringify(report)) > REPORT_LIMIT) throw new Error("report_too_large");
        const receipt = {
          serverEpoch, sessionId: session.sessionId, runId, kind: body.kind,
          sourceSha256, revision: body.request.revision, report,
        };
        session.lastReceipt = receipt;
        return receipt;
      });
    try {
      const receipt = await slot.done;
      if (session.closing || poisoned || stopping) failure(response, 503, "session_closed");
      else reply(response, 200, receipt);
    } catch {
      poisoned = true; // A rejected runner gives no proof that cleanup completed.
      failure(response, 503, "reap_unknown");
    } finally {
      if (active === slot && !poisoned) active = null;
    }
    return true;
  }

  return Object.freeze({ handle, hostAllowed, issueNavigationCapability, decorateHtml, reapExpired, shutdown });
}
