import { getCodingTestPublicTestsForMode } from "../core/coding-test.js";
import { BrowserCodeQuestRunner } from "./browser-code-quest-runner.js";
import { createExecutionRequestSnapshot } from "./code-grading.js";
import {
  createJavaExecutionRequestSnapshot,
  normalizeJavaFunctionContract,
} from "./java-grading.js";

const MODES = new Set(["run", "submit"]);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getCanonicalProblem(collection, problem) {
  if (!isPlainRecord(collection) || !Array.isArray(collection.problems)) {
    throw new TypeError("코딩테스트 컬렉션이 필요합니다.");
  }
  if (!isPlainRecord(problem) || !isNonEmptyString(problem.id)) {
    throw new TypeError("실행할 코딩테스트 문제가 필요합니다.");
  }
  const canonicalProblem = collection.problems.find((candidate) => candidate?.id === problem.id);
  if (!canonicalProblem) throw new Error("코딩테스트 문제가 컬렉션에 속하지 않습니다.");
  return canonicalProblem;
}

export function createCodingTestRunnerRequest({
  collection,
  problem,
  source,
  requestId,
  mode,
}) {
  if (!MODES.has(mode)) {
    throw new TypeError('코딩테스트 실행 모드는 "run" 또는 "submit"이어야 합니다.');
  }
  const canonicalProblem = getCanonicalProblem(collection, problem);
  const publicTests = getCodingTestPublicTestsForMode(canonicalProblem, mode);
  const baseRequest = {
    requestId,
    contractVersion: collection.contractVersion,
    questId: canonicalProblem.id,
    questRevision: canonicalProblem.revision,
    languageId: collection.languageId,
    suite: "public",
    source,
    entryPoint: canonicalProblem.entryPoint,
    tests: publicTests.map(({ id, label, args, expected }) => ({
      id,
      label,
      args,
      expected,
    })),
  };
  const runnerRequest =
    collection.languageId === "java"
      ? createJavaExecutionRequestSnapshot({
          ...baseRequest,
          ...normalizeJavaFunctionContract(canonicalProblem.functionContract),
        })
      : createExecutionRequestSnapshot(baseRequest);

  return Object.freeze({
    problemId: canonicalProblem.id,
    problemRevision: canonicalProblem.revision,
    mode,
    runnerRequest,
  });
}

function assertMatchingRunnerReport(report, execution) {
  const request = execution.runnerRequest;
  if (
    !isPlainRecord(report) ||
    report.requestId !== request.requestId ||
    report.contractVersion !== request.contractVersion ||
    report.questId !== execution.problemId ||
    report.questRevision !== execution.problemRevision ||
    report.languageId !== request.languageId ||
    report.suite !== "public"
  ) {
    throw new Error("코딩테스트 실행 결과가 요청과 일치하지 않습니다.");
  }
}

export function adaptCodingTestRunnerReport(report, execution) {
  if (!isPlainRecord(execution) || !isPlainRecord(execution.runnerRequest)) {
    throw new TypeError("코딩테스트 실행 요청 정보가 필요합니다.");
  }
  if (!MODES.has(execution.mode)) {
    throw new TypeError("코딩테스트 실행 요청의 mode가 올바르지 않습니다.");
  }
  assertMatchingRunnerReport(report, execution);
  return {
    requestId: report.requestId,
    contractVersion: report.contractVersion,
    problemId: execution.problemId,
    problemRevision: execution.problemRevision,
    languageId: report.languageId,
    mode: execution.mode,
    suite: "public",
    outcome: report.outcome,
    tests: report.tests,
    summary: report.summary,
    durationMs: report.durationMs,
    limitsApplied: report.limitsApplied,
    error: report.error,
  };
}

export class CodingTestRunnerAdapter {
  constructor(runners = new BrowserCodeQuestRunner()) {
    if (
      isPlainRecord(runners) &&
      (Object.hasOwn(runners, "javascriptRunner") || Object.hasOwn(runners, "javaRunner"))
    ) {
      if (!runners.javascriptRunner || typeof runners.javascriptRunner.run !== "function") {
        throw new TypeError("run()을 제공하는 JavaScript 실행기가 필요합니다.");
      }
      if (!runners.javaRunner || typeof runners.javaRunner.run !== "function") {
        throw new TypeError("run()을 제공하는 Java 실행기가 필요합니다.");
      }
      this.runners = Object.freeze({
        javascript: runners.javascriptRunner,
        java: runners.javaRunner,
      });
      this.runner = runners.javascriptRunner;
      return;
    }
    if (!runners || typeof runners.run !== "function") {
      throw new TypeError("run()을 제공하는 JavaScript 실행기가 필요합니다.");
    }
    this.runners = Object.freeze({ javascript: runners });
    this.runner = runners;
  }

  async run(input, options = {}) {
    const execution = createCodingTestRunnerRequest(input);
    const runner = this.runners[execution.runnerRequest.languageId];
    if (!runner) {
      throw new Error(`이 코딩테스트 언어를 처리할 실행기가 없습니다: ${execution.runnerRequest.languageId}`);
    }
    const report = await runner.run(execution.runnerRequest, options);
    return adaptCodingTestRunnerReport(report, execution);
  }
}
