import assert from "node:assert/strict";
import test from "node:test";

import { CodeQuestRunnerRouter } from "../src/grading/code-quest-runner-router.js";

function createSpyRunner(name) {
  const calls = [];
  return {
    calls,
    async run(request, options) {
      calls.push({ request, options });
      return { runner: name, requestId: request.requestId };
    },
  };
}

test("기존 JavaScript v1 요청은 evaluationKind 없이도 원래 runner로 전달한다", async () => {
  const javascriptRunner = createSpyRunner("javascript");
  const webRunner = createSpyRunner("web");
  const javaRunner = createSpyRunner("java");
  const router = new CodeQuestRunnerRouter({ javascriptRunner, webRunner, javaRunner });
  const request = { requestId: "javascript-one", languageId: "javascript" };
  const options = { signal: new AbortController().signal };

  const report = await router.run(request, options);

  assert.deepEqual(report, { runner: "javascript", requestId: "javascript-one" });
  assert.equal(javascriptRunner.calls.length, 1);
  assert.equal(javascriptRunner.calls[0].request, request);
  assert.equal(javascriptRunner.calls[0].options, options);
  assert.equal(webRunner.calls.length, 0);
  assert.equal(router.supports(request), true);
  assert.equal(router.resolve(request), javascriptRunner);
});

test("명시적인 javascript-function-v1도 기존 JavaScript runner로 유지한다", async () => {
  const javascriptRunner = createSpyRunner("javascript");
  const webRunner = createSpyRunner("web");
  const javaRunner = createSpyRunner("java");
  const router = new CodeQuestRunnerRouter({ javascriptRunner, webRunner, javaRunner });
  const request = {
    requestId: "javascript-two",
    languageId: "javascript",
    evaluationKind: "javascript-function-v1",
  };

  await router.run(request);

  assert.equal(javascriptRunner.calls.length, 1);
  assert.equal(webRunner.calls.length, 0);
});

test("HTML·CSS evaluationKind는 공통 Web runner로 분기한다", async () => {
  const javascriptRunner = createSpyRunner("javascript");
  const webRunner = createSpyRunner("web");
  const javaRunner = createSpyRunner("java");
  const router = new CodeQuestRunnerRouter({ javascriptRunner, webRunner, javaRunner });
  const html = {
    requestId: "html-one",
    languageId: "html",
    evaluationKind: "html-dom-v1",
  };
  const css = {
    requestId: "css-one",
    languageId: "css",
    evaluationKind: "css-style-v1",
  };

  assert.equal((await router.run(html)).runner, "web");
  assert.equal((await router.run(css)).runner, "web");
  assert.equal(webRunner.calls.length, 2);
  assert.equal(javascriptRunner.calls.length, 0);
  assert.equal(router.resolve(html), webRunner);
  assert.equal(router.supports(css), true);
});

test("Java 함수 요청은 로컬 Java runner로 분기한다", async () => {
  const javascriptRunner = createSpyRunner("javascript");
  const webRunner = createSpyRunner("web");
  const javaRunner = createSpyRunner("java");
  const router = new CodeQuestRunnerRouter({ javascriptRunner, webRunner, javaRunner });
  const request = {
    requestId: "java-one",
    languageId: "java",
    evaluationKind: "java-function-v1",
  };

  assert.equal((await router.run(request)).runner, "java");
  assert.equal(router.supports({ ...request, evaluationKind: undefined }), true);
  assert.equal(javaRunner.calls.length, 1);
  assert.equal(javascriptRunner.calls.length, 0);
  assert.equal(webRunner.calls.length, 0);
});

test("알 수 없는 언어·evaluationKind는 지원하지 않고 명시적으로 거부한다", () => {
  const router = new CodeQuestRunnerRouter({
    javascriptRunner: createSpyRunner("javascript"),
    webRunner: createSpyRunner("web"),
    javaRunner: createSpyRunner("java"),
  });

  assert.equal(router.supports(null), false);
  assert.equal(router.supports({ languageId: "python" }), false);
  assert.equal(
    router.supports({ languageId: "html", evaluationKind: "javascript-function-v1" }),
    false,
  );
  assert.throws(() => router.resolve({ languageId: "python" }), /평가기가 없습니다/);
});

test("세 runner 계약은 생성 시점에 검증한다", () => {
  const runner = createSpyRunner("valid");

  assert.throws(
    () => new CodeQuestRunnerRouter({ javascriptRunner: null, webRunner: runner, javaRunner: runner }),
    /JavaScript Code Quest runner/,
  );
  assert.throws(
    () => new CodeQuestRunnerRouter({ javascriptRunner: runner, webRunner: {}, javaRunner: runner }),
    /Web Code Quest runner/,
  );
  assert.throws(
    () => new CodeQuestRunnerRouter({ javascriptRunner: runner, webRunner: runner }),
    /Java Code Quest runner/,
  );
});
