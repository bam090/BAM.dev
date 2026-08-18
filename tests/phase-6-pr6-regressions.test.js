import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateSchemaValue } from "../scripts/validate-content.mjs";
import { findWebCodeQuestSourceIssue } from "../src/core/web-code-quest.js";
import { createWebProjectSubmission } from "../src/core/web-project.js";
import { BrowserWebProjectRunner } from "../src/grading/browser-web-project-runner.js";

const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/web-project.schema.json", import.meta.url), "utf8"),
);
const project = collection.projects[0];

function createSubmission() {
  return createWebProjectSubmission(collection, project, {
    submissionId: "phase-six-abort-error-regression",
    submittedAt: "2026-08-18T00:00:00.000Z",
    files: project.files.map((file) => ({
      path: file.path,
      source: file.starterSource,
    })),
    manualAssessments: project.manualCriteria.map((criterion) => ({
      criterionId: criterion.id,
      status: "pending",
      levelId: null,
    })),
  });
}

test("CSS escape로 숨긴 @import와 url()도 source preflight에서 차단한다", () => {
  const backslash = String.fromCharCode(92);
  const unsafeSources = [
    `@${backslash}69mport "./theme.css";`,
    `.card { background-image: u${backslash}72l(/asset.png); }`,
    `@${backslash}69\r\nmport "./theme.css";`,
    `.card { background-image: u${backslash}72\r\nl(/asset.png); }`,
  ];

  for (const source of unsafeSources) {
    assert.ok(findWebCodeQuestSourceIssue("css-style-v1", source), source);
  }
});

test("Web Project JSON Schema 검증은 maximum을 초과한 정수를 거부한다", () => {
  const invalid = structuredClone(collection);
  invalid.projects[0].estimatedMinutes = 481;
  const errors = [];

  validateSchemaValue(invalid, schema, schema, "$", errors);

  assert.ok(errors.length > 0, "estimatedMinutes: 481은 maximum: 480을 위반해야 합니다.");
});

test("signal이 중단되지 않은 AbortError는 사용자 취소가 아니라 engine_error다", async () => {
  const adapterError = new Error("평가 어댑터 오류");
  adapterError.name = "AbortError";
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        throw adapterError;
      },
      "css-style-v1": async () => true,
    },
  });
  const controller = new AbortController();

  const report = await runner.run(
    { collection, project, submission: createSubmission() },
    { signal: controller.signal },
  );

  assert.equal(controller.signal.aborted, false);
  assert.equal(report.outcome, "engine_error");
  assert.equal(report.automaticResults[0].outcome, "engine_error");
});
