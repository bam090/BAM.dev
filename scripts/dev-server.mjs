import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  JavaRequestValidationError,
  LocalJavaGrader,
} from "./java-grader/index.mjs";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.BAM_DEV_PORT ?? 4173);
const JAVA_API_PATH = "/api/java/execute";
const MAX_JAVA_REQUEST_BYTES = 128 * 1024;
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const allowedRoots = new Set(["content", "src", "styles"]);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function resolveRequestPath(requestUrl, staticRoot = rootDirectory) {
  const url = new URL(requestUrl, "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  if (pathname === "/" || pathname === "/index.html") {
    return path.join(staticRoot, "index.html");
  }

  const segments = pathname.replace(/^\/+/, "").split("/");
  if (!allowedRoots.has(segments[0])) return null;
  const resolvedPath = path.resolve(staticRoot, ...segments);
  if (!resolvedPath.startsWith(`${staticRoot}${path.sep}`)) return null;
  return resolvedPath;
}

export function pipeReadableResponse(readable, response) {
  readable.once("error", () => {
    response.destroy();
  });
  readable.pipe(response);
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
}

export function isSameOriginRequest(request) {
  const fetchSite = request.headers["sec-fetch-site"];
  if (fetchSite && fetchSite !== "same-origin") return false;
  const host = request.headers.host;
  if (typeof host !== "string" || host.length === 0 || /[\s,@]/u.test(host)) return false;
  let parsedHost;
  try {
    parsedHost = new URL(`http://${host}`);
  } catch {
    return false;
  }
  if (
    parsedHost.host.toLowerCase() !== host.toLowerCase() ||
    !LOOPBACK_HOSTNAMES.has(parsedHost.hostname.toLowerCase())
  ) {
    return false;
  }
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const parsedOrigin = new URL(origin);
    return (
      parsedOrigin.protocol === "http:" &&
      parsedOrigin.host.toLowerCase() === parsedHost.host.toLowerCase() &&
      parsedOrigin.pathname === "/" &&
      parsedOrigin.search === "" &&
      parsedOrigin.hash === ""
    );
  } catch {
    return false;
  }
}

export async function readJsonRequest(
  request,
  maximumBytes = MAX_JAVA_REQUEST_BYTES,
) {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new RangeError("Java 실행 요청 본문이 너무 큽니다.");
  }
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > maximumBytes) {
      throw new RangeError("Java 실행 요청 본문이 너무 큽니다.");
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new JavaRequestValidationError("Java 실행 요청 본문은 올바른 JSON이어야 합니다.");
  }
}

export async function handleJavaExecution(request, response, javaGrader) {
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "POST" });
    response.end("Method Not Allowed");
    return;
  }
  if (!isSameOriginRequest(request)) {
    sendJson(response, 403, { error: "same-origin Java 실행 요청만 허용됩니다." });
    return;
  }
  const contentType = String(request.headers["content-type"] ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    sendJson(response, 415, { error: "Content-Type은 application/json이어야 합니다." });
    return;
  }

  const controller = new AbortController();
  const handleAborted = () => controller.abort();
  const handleClosed = () => {
    if (!response.writableEnded) controller.abort();
  };
  request.once("aborted", handleAborted);
  response.once("close", handleClosed);
  try {
    const body = await readJsonRequest(request);
    const report = await javaGrader.execute(body, { signal: controller.signal });
    if (!response.destroyed) sendJson(response, 200, report);
  } catch (error) {
    if (response.destroyed) return;
    if (error instanceof RangeError) {
      sendJson(response, 413, { error: error.message });
    } else if (error instanceof JavaRequestValidationError) {
      sendJson(response, 400, { error: error.message });
    } else {
      sendJson(response, 500, { error: "로컬 Java 실행기를 처리하지 못했습니다." });
    }
  } finally {
    request.removeListener("aborted", handleAborted);
    response.removeListener("close", handleClosed);
  }
}

export function createDevServer({
  staticRoot = rootDirectory,
  javaGrader = new LocalJavaGrader(),
} = {}) {
  if (!javaGrader || typeof javaGrader.execute !== "function") {
    throw new TypeError("execute()를 제공하는 Java 채점기가 필요합니다.");
  }

  return createServer(async (request, response) => {
    let pathname = null;
    try {
      pathname = request.url ? new URL(request.url, "http://localhost").pathname : null;
    } catch {
      pathname = null;
    }
    if (pathname === JAVA_API_PATH) {
      await handleJavaExecution(request, response, javaGrader);
      return;
    }

    if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }

    const filePath = resolveRequestPath(request.url, staticRoot);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      return;
    }

    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error("not a file");
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": fileStat.size,
        "Content-Type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      if (request.method === "HEAD") response.end();
      else pipeReadableResponse(createReadStream(filePath), response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createDevServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`BAM.dev 개발 서버: http://localhost:${port}`);
    console.log("종료하려면 Ctrl+C를 누르세요.");
  });
}
