import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { pipeReadableResponse } from "../scripts/dev-server.mjs";

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
