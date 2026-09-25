import { createReadStream } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.BAM_DEV_PORT ?? 4173);
const allowedRoots = new Set(["content", "src", "styles"]);
const isolatedWorkerPath = "/src/workers/javascript-code-runner.classic.js";
const oldWorkerPath = "/src/workers/javascript-code-runner.worker.js";
const workerPolicy = "default-src 'none'; connect-src 'none'; script-src 'unsafe-eval'; worker-src 'none'";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  if (pathname === "/" || pathname === "/index.html") {
    return path.join(rootDirectory, "index.html");
  }

  const segments = pathname.replace(/^\/+/, "").split("/");
  if (!allowedRoots.has(segments[0])) return null;
  const resolvedPath = path.resolve(rootDirectory, ...segments);
  if (!resolvedPath.startsWith(`${rootDirectory}${path.sep}`)) return null;
  return resolvedPath;
}

export function pipeReadableResponse(readable, response) {
  readable.once("error", () => {
    response.destroy();
  });
  readable.pipe(response);
}

export function createDevServer({ javaTransport = null } = {}) {
  return createServer(async (request, response) => {
    if (javaTransport && !javaTransport.hostAllowed(request)) {
      response.writeHead(403, { "Cache-Control": "no-store" });
      response.end("Forbidden");
      return;
    }

    if (javaTransport) {
      try {
        if (await javaTransport.handle(request, response)) return;
      } catch {
        if (!response.headersSent) response.writeHead(503, { "Cache-Control": "no-store" });
        response.end();
        return;
      }
    }

    if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }

    const filePath = resolveRequestPath(request.url);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      return;
    }

    try {
      let servedPath = filePath;
      let canonicalRoot = rootDirectory;
      if (javaTransport) {
        canonicalRoot = await realpath(rootDirectory);
        servedPath = await realpath(filePath);
        const relativePath = path.relative(rootDirectory, filePath);
        const firstSegment = relativePath.split(path.sep)[0];
        const allowed = relativePath === "index.html"
          ? servedPath === path.join(canonicalRoot, "index.html")
          : allowedRoots.has(firstSegment)
            && servedPath.startsWith(`${path.join(canonicalRoot, firstSegment)}${path.sep}`);
        if (!allowed) throw new Error("path outside static root");
        if (servedPath === path.join(canonicalRoot, oldWorkerPath.slice(1))) {
          throw new Error("old learner worker unavailable in Java mode");
        }
      }
      const fileStat = await stat(servedPath);
      if (!fileStat.isFile()) throw new Error("not a file");
      const html = javaTransport && request.method === "GET" && filePath === path.join(rootDirectory, "index.html")
        ? javaTransport.decorateHtml(request, await readFile(servedPath, "utf8"))
        : null;
      const body = html ? Buffer.from(html.body) : null;
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": body?.length ?? fileStat.size,
        "Content-Type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        ...(javaTransport && servedPath === path.join(canonicalRoot, isolatedWorkerPath.slice(1))
          ? { "Content-Security-Policy": workerPolicy } : {}),
        ...(html?.headers ?? {}),
      });
      if (request.method === "HEAD") response.end();
      else if (body) response.end(body);
      else pipeReadableResponse(createReadStream(servedPath), response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
    }
  });
}

const server = createDevServer();

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`BAM.dev 개발 서버: http://localhost:${port}`);
    console.log("종료하려면 Ctrl+C를 누르세요.");
  });
}
