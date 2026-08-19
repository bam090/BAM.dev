import assert from "node:assert/strict";
import { once } from "node:events";
import { request as httpRequest } from "node:http";
import test from "node:test";

import { createDevServer } from "../scripts/dev-server.mjs";

const integrationEnabled = process.env.BAM_DEV_SERVER_INTEGRATION === "1";

function sendRequest({ port, hostHeader, origin, body }) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/java/execute",
        method: "POST",
        headers: {
          Host: hostHeader,
          Origin: origin,
          "Sec-Fetch-Site": "same-origin",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    request.once("error", reject);
    request.end(body);
  });
}

test(
  "loopback 개발 서버는 Java API 200과 DNS rebinding 403을 실제 HTTP에서 구분한다",
  { skip: !integrationEnabled },
  async () => {
    const calls = [];
    const report = { outcome: "passed", tests: [] };
    const server = createDevServer({
      javaGrader: {
        async execute(body, options) {
          calls.push({ body, options });
          return report;
        },
      },
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address();
    try {
      const allowed = await sendRequest({
        port,
        hostHeader: `127.0.0.1:${port}`,
        origin: `http://127.0.0.1:${port}`,
        body: JSON.stringify({ source: "code" }),
      });
      assert.equal(allowed.statusCode, 200);
      assert.deepEqual(JSON.parse(allowed.body), report);
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0].body, { source: "code" });

      const denied = await sendRequest({
        port,
        hostHeader: `attacker.example:${port}`,
        origin: `http://attacker.example:${port}`,
        body: "{}",
      });
      assert.equal(denied.statusCode, 403);
      assert.equal(calls.length, 1);
    } finally {
      server.close();
      await once(server, "close");
    }
  },
);
