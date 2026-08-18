import { WEB_CODE_QUEST_EVALUATION_KINDS } from "../core/web-code-quest.js";

const WEB_EVALUATION_KINDS = new Set(Object.values(WEB_CODE_QUEST_EVALUATION_KINDS));

function assertRunner(runner, label) {
  if (!runner || typeof runner.run !== "function") {
    throw new TypeError(`${label}는 run(request, options)을 구현해야 합니다.`);
  }
  return runner;
}

/**
 * Keeps the JavaScript v1 request contract intact while routing explicit
 * HTML/CSS evaluation kinds to the direct-source web runner.
 */
export class CodeQuestRunnerRouter {
  constructor({ javascriptRunner, webRunner } = {}) {
    this.javascriptRunner = assertRunner(javascriptRunner, "JavaScript Code Quest runner");
    this.webRunner = assertRunner(webRunner, "Web Code Quest runner");
  }

  supports(request) {
    if (!request || typeof request !== "object") return false;
    if (WEB_EVALUATION_KINDS.has(request.evaluationKind)) return true;
    return (
      request.languageId === "javascript" &&
      (request.evaluationKind === undefined || request.evaluationKind === "javascript-function-v1")
    );
  }

  resolve(request) {
    if (WEB_EVALUATION_KINDS.has(request?.evaluationKind)) return this.webRunner;
    if (
      request?.languageId === "javascript" &&
      (request.evaluationKind === undefined || request.evaluationKind === "javascript-function-v1")
    ) {
      return this.javascriptRunner;
    }
    throw new Error("이 Code Quest 요청을 처리할 평가기가 없습니다.");
  }

  run(request, options) {
    return this.resolve(request).run(request, options);
  }
}
