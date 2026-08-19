import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import test from "node:test";
import {
  createDevServer,
  handleJavaExecution,
  isSameOriginRequest,
  pipeReadableResponse,
  readJsonRequest,
} from "../scripts/dev-server.mjs";
import { JavaRequestValidationError } from "../scripts/java-grader/index.mjs";

function createRequest({
  method = "POST",
  headers = {},
  chunks = [],
} = {}) {
  const request = Readable.from(chunks);
  request.method = method;
  request.headers = {
    host: "localhost:4173",
    origin: "http://localhost:4173",
    "sec-fetch-site": "same-origin",
    "content-type": "application/json",
    ...headers,
  };
  return request;
}

class ResponseStub extends EventEmitter {
  constructor() {
    super();
    this.destroyed = false;
    this.headersSent = false;
    this.writableEnded = false;
    this.statusCode = null;
    this.headers = {};
    this.body = "";
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.headersSent = true;
    return this;
  }

  end(chunk = "") {
    this.body += String(chunk);
    this.writableEnded = true;
  }

  destroy() {
    this.destroyed = true;
    this.emit("close");
  }
}

function parseResponse(response) {
  return response.body ? JSON.parse(response.body) : null;
}

function createCountingGrader(result = { outcome: "passed" }) {
  return {
    calls: [],
    async execute(body, options) {
      this.calls.push({ body, options });
      return result;
    },
  };
}

test("개발 서버 파일 스트림 오류는 이미 시작된 응답을 파기한다", () => {
  class ReadableStub extends EventEmitter {
    pipe(target) {
      this.target = target;
      return target;
    }
  }

  const readable = new ReadableStub();
  let destroyCalls = 0;
  const response = {
    destroy() {
      destroyCalls += 1;
    },
  };

  pipeReadableResponse(readable, response);
  assert.equal(readable.target, response);

  readable.emit("error", new Error("simulated read failure"));

  assert.equal(destroyCalls, 1);
});

test("개발 서버 요청 콜백은 비동기 처리 실패를 500으로 끝내고 응답 실패 시 파기한다", async () => {
  const server = createDevServer({ javaGrader: createCountingGrader() });
  const requestListener = server.listeners("request")[0];
  const createFailingRequest = () => {
    const request = { method: "GET" };
    Object.defineProperty(request, "url", {
      get() {
        throw new Error("simulated request failure");
      },
    });
    return request;
  };

  const response = new ResponseStub();
  const returned = requestListener(createFailingRequest(), response);

  assert.equal(returned, undefined);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(response.statusCode, 500);
  assert.equal(response.body, "Internal Server Error");
  assert.equal(response.writableEnded, true);

  const startedResponse = new ResponseStub();
  startedResponse.writeHead(200);
  startedResponse.body = "partial";
  assert.equal(requestListener(createFailingRequest(), startedResponse), undefined);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(startedResponse.statusCode, 200);
  assert.equal(startedResponse.body, "partial");
  assert.equal(startedResponse.writableEnded, true);

  const brokenResponse = new ResponseStub();
  brokenResponse.writeHead = () => {
    throw new Error("simulated response failure");
  };
  assert.equal(requestListener(createFailingRequest(), brokenResponse), undefined);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(brokenResponse.destroyed, true);
});

test("Java API는 loopback Host와 일치하는 same-origin 요청만 허용한다", () => {
  assert.equal(
    isSameOriginRequest({
      headers: {
        host: "127.0.0.1:4173",
        origin: "http://127.0.0.1:4173",
        "sec-fetch-site": "same-origin",
      },
    }),
    true,
  );
  assert.equal(
    isSameOriginRequest({
      headers: { host: "localhost:4173", origin: "http://localhost:4173" },
    }),
    true,
  );
  assert.equal(
    isSameOriginRequest({ headers: { host: "[::1]:4173" } }),
    true,
  );
});

test("Java API는 DNS rebinding Host·다른 Origin·cross-site 요청을 거부한다", () => {
  const deniedHeaders = [
    {
      host: "attacker.example:4173",
      origin: "http://attacker.example:4173",
    },
    {
      host: "localhost:4173",
      origin: "http://127.0.0.1:4173",
    },
    {
      host: "localhost:4173",
      origin: "http://localhost:4173",
      "sec-fetch-site": "cross-site",
    },
    { host: "localhost:4173,attacker.example" },
    { origin: "http://localhost:4173" },
  ];
  for (const headers of deniedHeaders) {
    assert.equal(isSameOriginRequest({ headers }), false, JSON.stringify(headers));
  }
});

test("Java API는 method·origin·content-type을 grader 호출 전에 거부한다", async () => {
  const cases = [
    {
      request: createRequest({ method: "GET" }),
      expectedStatus: 405,
    },
    {
      request: createRequest({ headers: { host: "attacker.example:4173" } }),
      expectedStatus: 403,
    },
    {
      request: createRequest({ headers: { "content-type": "text/plain" } }),
      expectedStatus: 415,
    },
  ];

  for (const { request, expectedStatus } of cases) {
    const grader = createCountingGrader();
    const response = new ResponseStub();
    await handleJavaExecution(request, response, grader);
    assert.equal(response.statusCode, expectedStatus);
    assert.equal(grader.calls.length, 0);
  }
});

test("Java API는 content-length와 실제 stream의 body 상한을 모두 적용한다", async () => {
  const grader = createCountingGrader();
  const response = new ResponseStub();
  await handleJavaExecution(
    createRequest({ headers: { "content-length": String(128 * 1024 + 1) } }),
    response,
    grader,
  );
  assert.equal(response.statusCode, 413);
  assert.equal(grader.calls.length, 0);

  await assert.rejects(
    () => readJsonRequest(createRequest({ chunks: ["12345"] }), 4),
    RangeError,
  );
});

test("Java API는 잘못된 JSON과 grader DTO 검증 오류를 400으로 반환한다", async () => {
  const malformedGrader = createCountingGrader();
  const malformedResponse = new ResponseStub();
  await handleJavaExecution(
    createRequest({ chunks: ["{not-json"] }),
    malformedResponse,
    malformedGrader,
  );
  assert.equal(malformedResponse.statusCode, 400);
  assert.equal(malformedGrader.calls.length, 0);

  const validationResponse = new ResponseStub();
  const validationGrader = {
    calls: 0,
    async execute() {
      this.calls += 1;
      throw new JavaRequestValidationError("잘못된 Java DTO");
    },
  };
  await handleJavaExecution(
    createRequest({ chunks: ["{}"] }),
    validationResponse,
    validationGrader,
  );
  assert.equal(validationResponse.statusCode, 400);
  assert.match(parseResponse(validationResponse).error, /잘못된 Java DTO/u);
  assert.equal(validationGrader.calls, 1);
});

test("Java API는 JSON body와 AbortSignal을 grader에 전달하고 200 report를 반환한다", async () => {
  const report = { outcome: "passed", tests: [] };
  const grader = createCountingGrader(report);
  const response = new ResponseStub();
  await handleJavaExecution(
    createRequest({ chunks: [JSON.stringify({ source: "code" })] }),
    response,
    grader,
  );
  assert.equal(response.statusCode, 200);
  assert.deepEqual(parseResponse(response), report);
  assert.deepEqual(grader.calls[0].body, { source: "code" });
  assert.equal(grader.calls[0].options.signal.aborted, false);
});

test("Java API는 request abort와 미완료 response close를 grader signal로 전파한다", async () => {
  for (const eventKind of ["request-aborted", "response-close"]) {
    let resolveStarted;
    const started = new Promise((resolve) => {
      resolveStarted = resolve;
    });
    let capturedSignal;
    const grader = {
      async execute(_body, { signal }) {
        capturedSignal = signal;
        resolveStarted();
        await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
        return { outcome: "cancelled", tests: [] };
      },
    };
    const request = createRequest({ chunks: ["{}"] });
    const response = new ResponseStub();
    const handled = handleJavaExecution(request, response, grader);
    await started;
    if (eventKind === "request-aborted") request.emit("aborted");
    else {
      response.destroyed = true;
      response.emit("close");
    }
    await handled;
    assert.equal(capturedSignal.aborted, true, eventKind);
    if (eventKind === "response-close") assert.equal(response.statusCode, null);
  }
});
