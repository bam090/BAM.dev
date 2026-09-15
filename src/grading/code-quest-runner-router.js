import { WEB_CODE_QUEST_EVALUATION_KINDS } from "../core/web-code-quest.js";

const WEB_EVALUATION_KINDS = new Set(Object.values(WEB_CODE_QUEST_EVALUATION_KINDS));
const JAVA_EVALUATION_KIND = "java-static-method-v1";

function assertRunner(runner, label) {
  if (!runner || typeof runner.run !== "function") {
    throw new TypeError(`${label}는 run(request, options)을 구현해야 합니다.`);
  }
  return runner;
}

/**
 * Keeps the JavaScript v1 request contract intact while routing explicit
 * HTML/CSS evaluation kinds to the direct-source web runner and the explicit
 * Java kind to the local bridge adapter when it is installed.
 */
export class CodeQuestRunnerRouter {
  constructor({ javascriptRunner, webRunner, javaRunner = null } = {}) {
    this.javascriptRunner = assertRunner(javascriptRunner, "JavaScript Code Quest runner");
    this.webRunner = assertRunner(webRunner, "Web Code Quest runner");
    this.javaRunner = javaRunner === null ? null : assertRunner(javaRunner, "Java Code Quest runner");
  }

  #runnerFor(request) {
    if (!request || typeof request !== "object") return null;
    if (
      request.languageId === "java" &&
      request.evaluationKind === JAVA_EVALUATION_KIND
    ) {
      return this.javaRunner;
    }
    if (WEB_EVALUATION_KINDS.has(request.evaluationKind)) return this.webRunner;
    if (
      request.languageId === "javascript" &&
      (request.evaluationKind === undefined || request.evaluationKind === "javascript-function-v1")
    ) {
      return this.javascriptRunner;
    }
    return null;
  }

  supports(request) {
    return this.#runnerFor(request) !== null;
  }

  resolve(request) {
    const runner = this.#runnerFor(request);
    if (runner) return runner;
    throw new Error("이 Code Quest 요청을 처리할 평가기가 없습니다.");
  }

  run(request, options) {
    return this.resolve(request).run(request, options);
  }
}
