import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createWebProjectSubmission,
  WEB_PROJECT_FILE_MAX_BYTES,
  WEB_PROJECT_TOTAL_MAX_BYTES,
} from "../src/core/web-project.js";
import { getWebAssertionExpected } from "../src/core/web-code-quest.js";
import {
  BrowserWebProjectRunner,
  DEFAULT_WEB_PROJECT_RUNNER_LIMITS,
} from "../src/grading/browser-web-project-runner.js";
import { webProjectSolutionFixtures } from "./fixtures/web-project-solutions.js";

const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const project = collection.projects[0];
const referenceFiles = webProjectSolutionFixtures[project.id].referenceFiles;

function createManualAssessments(levelId = "meets") {
  return project.manualCriteria.map((criterion) => ({
    criterionId: criterion.id,
    status: levelId === null ? "pending" : "self_assessed",
    levelId,
  }));
}

function createSubmission({
  submissionId = "submission-responsive-plan-001",
  files = referenceFiles,
  manualLevel = "meets",
} = {}) {
  return createWebProjectSubmission(collection, project, {
    submissionId,
    submittedAt: "2026-08-18T01:02:03.000Z",
    files: structuredClone(files),
    manualAssessments: createManualAssessments(manualLevel),
  });
}

function expectedFor(input) {
  return getWebAssertionExpected(input.assertion);
}

function createPassingRunner({ calls = [], now } = {}) {
  return new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async (input) => {
        calls.push({ kind: "html-dom-v1", input });
        return expectedFor(input);
      },
      "css-style-v1": async (input) => {
        calls.push({ kind: "css-style-v1", input });
        return expectedFor(input);
      },
    },
    now,
  });
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test("정식 자동 기준만 실행하고 제출한 HTML을 CSS fixture로 사용해 100점 report를 만든다", async () => {
  const calls = [];
  let tick = 0;
  const runner = createPassingRunner({ calls, now: () => tick++ });
  const submission = createSubmission();
  const originalCollection = structuredClone(collection);
  const originalSubmission = structuredClone(submission);

  const report = await runner.run({ collection, project, submission });

  assert.deepEqual(collection, originalCollection);
  assert.deepEqual(submission, originalSubmission);
  assert.equal(calls.length, project.automaticCriteria.length);
  assert.deepEqual(
    calls.map(({ kind }) => kind),
    project.automaticCriteria.map((criterion) => criterion.evaluationKind),
  );

  const submittedHtml = submission.files.find((file) => file.path === "index.html").source;
  const submittedCss = submission.files.find((file) => file.path === "styles.css").source;
  for (const call of calls) {
    const canonicalCriterion = project.automaticCriteria.find(
      (criterion) => criterion.assertion.kind === call.input.assertion.kind &&
        JSON.stringify(criterion.assertion) === JSON.stringify(call.input.assertion),
    );
    assert.ok(canonicalCriterion);
    assert.equal(
      call.input.source,
      call.kind === "html-dom-v1" ? submittedHtml : submittedCss,
    );
    assert.equal(call.input.fixtureHtml, call.kind === "css-style-v1" ? submittedHtml : null);
    assert.ok(Object.hasOwn(call.input, "signal"));
  }

  assert.deepEqual(
    report.automaticResults.map((result) => result.criterionId),
    project.automaticCriteria.map((criterion) => criterion.id),
  );
  assert.ok(report.automaticResults.every((result) => result.outcome === "passed"));
  assert.deepEqual(
    report.automaticResults.map((result) => result.expected),
    project.automaticCriteria.map((criterion) => getWebAssertionExpected(criterion.assertion)),
  );
  assert.deepEqual(
    report.automaticResults.map((result) => result.actual),
    report.automaticResults.map((result) => result.expected),
  );
  assert.deepEqual(
    {
      contractVersion: report.contractVersion,
      submissionId: report.submissionId,
      projectId: report.projectId,
      projectRevision: report.projectRevision,
      outcome: report.outcome,
    },
    {
      contractVersion: collection.contractVersion,
      submissionId: submission.submissionId,
      projectId: project.id,
      projectRevision: project.revision,
      outcome: "passed",
    },
  );
  assert.equal(report.score.provisionalScore, 100);
  assert.equal(report.score.automatic.earnedPoints, 70);
  assert.equal(report.score.manual.earnedPoints, 30);
  assert.equal(report.score.isComplete, true);
  assert.equal(report.score.isVerified, false);
  assert.deepEqual(report.limits, {
    maxFileBytes: WEB_PROJECT_FILE_MAX_BYTES,
    maxTotalBytes: WEB_PROJECT_TOTAL_MAX_BYTES,
  });
  assert.deepEqual(report.limits, DEFAULT_WEB_PROJECT_RUNNER_LIMITS);
  assert.ok(report.durationMs > 0);
  assert.ok(report.automaticResults.every((result) => result.durationMs > 0));
  assert.equal(report.error, null);
  assert.ok(Object.isFrozen(report));
  assert.ok(Object.isFrozen(report.automaticResults));
  assert.ok(report.automaticResults.every(Object.isFrozen));
  assert.ok(Object.isFrozen(report.score));
  assert.ok(Object.isFrozen(report.limits));
  assert.equal(Object.hasOwn(report, "tests"), false);
  assert.equal(Object.hasOwn(report, "suite"), false);
  assert.equal(Object.hasOwn(report, "summary"), false);
  assert.doesNotMatch(JSON.stringify(report), /비밀|secret/iu);
});

test("Grid 열 개수 assertion을 정식 Web Project에서 snapshot해 CSS 평가기에 전달한다", async () => {
  const candidateCollection = structuredClone(collection);
  const candidateProject = candidateCollection.projects[0];
  const criterion = candidateProject.automaticCriteria.find(
    (item) => item.evaluationKind === "css-style-v1",
  );
  criterion.assertion = {
    kind: "computed-grid-column-count",
    selector: ".learning-board",
    viewportWidth: 640,
    expected: 2,
  };
  const observedAssertions = [];
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async (input) => expectedFor(input),
      "css-style-v1": async (input) => {
        if (input.assertion.kind === "computed-grid-column-count") {
          observedAssertions.push(input.assertion);
        }
        return expectedFor(input);
      },
    },
  });

  const report = await runner.run({
    collection: candidateCollection,
    project: candidateProject,
    submission: createSubmission(),
  });

  const observedAssertion = observedAssertions.find(
    (assertion) => assertion.viewportWidth === criterion.assertion.viewportWidth,
  );
  assert.deepEqual(observedAssertion, criterion.assertion);
  assert.ok(Object.isFrozen(observedAssertion));
  const result = report.automaticResults.find((item) => item.criterionId === criterion.id);
  assert.equal(result.expected, 2);
  assert.equal(result.actual, 2);
  assert.equal(result.outcome, "passed");
});

test("호출자가 건넨 위장 project의 기준·revision은 무시하고 정식 컬렉션을 사용한다", async () => {
  const calls = [];
  const runner = createPassingRunner({ calls });
  const impostorProject = {
    id: project.id,
    revision: 999,
    automaticCriteria: [
      {
        id: "learner-injected-test",
        assertion: { kind: "selector-exists", selector: "script" },
      },
    ],
    files: [{ path: "answer.html", source: "<script>trusted()</script>" }],
    score: 999,
  };

  const report = await runner.run({
    collection,
    project: impostorProject,
    submission: createSubmission(),
  });

  assert.equal(report.projectRevision, project.revision);
  assert.deepEqual(
    report.automaticResults.map((result) => result.criterionId),
    project.automaticCriteria.map((criterion) => criterion.id),
  );
  assert.equal(calls.length, project.automaticCriteria.length);
  assert.ok(calls.every(({ input }) => input.assertion.selector !== "script"));
});

test("제출에 tests·scores·metadata를 삽입하면 어댑터 실행 전에 exact DTO 검증으로 거부한다", async () => {
  for (const field of ["tests", "scores", "metadata"]) {
    let calls = 0;
    const runner = new BrowserWebProjectRunner({
      evaluationAdapters: {
        "html-dom-v1": async () => {
          calls += 1;
          return true;
        },
      },
    });
    const submission = structuredClone(createSubmission());
    submission[field] = field === "tests" ? [{ expected: true }] : { trusted: true };

    await assert.rejects(
      runner.run({ collection, project, submission }),
      new RegExp(`허용되지 않은 필드.*${field}`),
    );
    assert.equal(calls, 0);
  }
});

test("틀린 기준은 정식 실패 설명과 실제값을 남기고 부분 점수를 계산한다", async () => {
  const failedCriterion = project.automaticCriteria[0];
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async (input) =>
        input.assertion.kind === failedCriterion.assertion.kind ? false : expectedFor(input),
      "css-style-v1": async (input) => expectedFor(input),
    },
  });

  const report = await runner.run({ collection, project, submission: createSubmission() });
  const failedResult = report.automaticResults[0];

  assert.equal(report.outcome, "failed");
  assert.equal(failedResult.criterionId, failedCriterion.id);
  assert.equal(failedResult.outcome, "failed");
  assert.equal(failedResult.expected, true);
  assert.equal(failedResult.actual, false);
  assert.equal(failedResult.error.type, "criterion_failed");
  assert.equal(failedResult.error.message, failedCriterion.failureMessage);
  assert.ok(report.automaticResults.slice(1).every((result) => result.outcome === "passed"));
  assert.equal(report.score.automatic.earnedPoints, 70 - failedCriterion.maxPoints);
  assert.equal(report.score.provisionalScore, 100 - failedCriterion.maxPoints);
  assert.equal(report.score.isComplete, true);
});

test("위험 HTML은 어댑터에 전달하지 않고 HTML 기준을 invalid_source, CSS를 not_run으로 둔다", async () => {
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
      "css-style-v1": async () => {
        calls += 1;
        return "grid";
      },
    },
  });
  const submission = structuredClone(createSubmission());
  submission.files.find((file) => file.path === "index.html").source =
    "<!doctype html><main><script>alert(1)</script></main>";

  const report = await runner.run({ collection, project, submission });
  const htmlResults = report.automaticResults.filter((result) =>
    result.criterionId.startsWith("auto-html-"),
  );
  const cssResults = report.automaticResults.filter((result) =>
    result.criterionId.startsWith("auto-css-"),
  );

  assert.equal(calls, 0);
  assert.equal(report.outcome, "invalid_source");
  assert.ok(htmlResults.every((result) => result.outcome === "invalid_source"));
  assert.ok(htmlResults.every((result) => result.error.type === "blocked_element"));
  assert.ok(cssResults.every((result) => result.outcome === "not_run"));
  assert.ok(cssResults.every((result) => result.error.type === "invalid_html_fixture"));
  assert.equal(report.score.automatic.status, "incomplete");
  assert.equal(report.score.provisionalScore, null);
});

test("Web Project runner는 HTML 인라인 스타일을 CSS fixture에 넣기 전에 거부한다", async () => {
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
      "css-style-v1": async () => {
        calls += 1;
        return "grid";
      },
    },
  });
  const submission = structuredClone(createSubmission());
  submission.files.find((file) => file.path === "index.html").source =
    '<!doctype html><style>.learning-board { display: grid; }</style><main class="learning-board"></main>';

  const report = await runner.run({ collection, project, submission });
  const htmlResults = report.automaticResults.filter((result) =>
    result.criterionId.startsWith("auto-html-"),
  );
  const cssResults = report.automaticResults.filter((result) =>
    result.criterionId.startsWith("auto-css-"),
  );

  assert.equal(calls, 0);
  assert.equal(report.outcome, "invalid_source");
  assert.ok(htmlResults.every((result) => result.outcome === "invalid_source"));
  assert.ok(htmlResults.every((result) => result.error.type === "inline_style"));
  assert.ok(cssResults.every((result) => result.outcome === "not_run"));
  assert.ok(cssResults.every((result) => result.error.type === "invalid_html_fixture"));
});

test("Web Project runner는 브라우저가 복구하는 비정상 주석 뒤의 활성 태그를 거부한다", async () => {
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
      "css-style-v1": async () => {
        calls += 1;
        return "grid";
      },
    },
  });
  const submission = structuredClone(createSubmission());
  submission.files.find((file) => file.path === "index.html").source =
    '<!doctype html><!--><meta http-equiv="&#114;efresh" content="0;url=https://example.com">';

  const report = await runner.run({ collection, project, submission });

  assert.equal(calls, 0);
  assert.equal(report.outcome, "invalid_source");
  assert.ok(
    report.automaticResults
      .filter((result) => result.criterionId.startsWith("auto-html-"))
      .every(
        (result) =>
          result.outcome === "invalid_source" &&
          result.error.type === "malformed_comment",
      ),
  );
});

test("20KiB를 넘는 CSS는 HTML 평가 후 CSS 기준별 invalid_source로 보고한다", async () => {
  const calls = [];
  const runner = createPassingRunner({ calls });
  const submission = structuredClone(createSubmission());
  submission.files.find((file) => file.path === "styles.css").source =
    `.safe { color: red; }\n${"/* safe padding */".repeat(1500)}`;

  const report = await runner.run({ collection, project, submission });
  const htmlCriterionCount = project.automaticCriteria.filter(
    (criterion) => criterion.evaluationKind === "html-dom-v1",
  ).length;
  const cssResults = report.automaticResults.slice(htmlCriterionCount);

  assert.equal(calls.length, htmlCriterionCount);
  assert.ok(calls.every(({ kind }) => kind === "html-dom-v1"));
  assert.ok(
    report.automaticResults
      .slice(0, htmlCriterionCount)
      .every((result) => result.outcome === "passed"),
  );
  assert.ok(cssResults.every((result) => result.outcome === "invalid_source"));
  assert.ok(cssResults.every((result) => result.error.type === "source_too_large"));
  assert.equal(report.outcome, "invalid_source");
  const htmlPoints = project.automaticCriteria
    .filter((criterion) => criterion.evaluationKind === "html-dom-v1")
    .reduce((total, criterion) => total + criterion.maxPoints, 0);
  assert.equal(report.score.automatic.earnedPoints, htmlPoints);
  assert.equal(report.score.provisionalScore, htmlPoints + 30);
});

test("실행 전 취소는 첫 기준만 cancelled, 나머지는 not_run으로 남긴다", async () => {
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        calls += 1;
        return true;
      },
    },
  });
  const controller = new AbortController();
  controller.abort();

  const report = await runner.run(
    { collection, project, submission: createSubmission() },
    { signal: controller.signal },
  );

  assert.equal(calls, 0);
  assert.equal(report.outcome, "cancelled");
  assert.deepEqual(
    report.automaticResults.map((result) => result.outcome),
    ["cancelled", ...project.automaticCriteria.slice(1).map(() => "not_run")],
  );
  assert.equal(report.automaticResults[0].error.type, "cancelled");
  assert.ok(
    report.automaticResults
      .slice(1)
      .every(
        (result) =>
          result.error.type === "stopped_after_cancel" &&
          result.error.message.includes("취소"),
      ),
  );
  assert.equal(report.error.type, "cancelled");
  assert.equal(report.score.isComplete, false);
});

test("평가 중 취소를 adapter에 전달하고 뒤 기준을 실행하지 않는다", async () => {
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": ({ signal }) => {
        calls += 1;
        return new Promise((resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => {
              const error = new Error("cancelled");
              error.name = "AbortError";
              reject(error);
            },
            { once: true },
          );
        });
      },
    },
  });
  const controller = new AbortController();

  const reportPromise = runner.run(
    { collection, project, submission: createSubmission() },
    { signal: controller.signal },
  );
  controller.abort();
  const report = await reportPromise;

  assert.equal(calls, 1);
  assert.equal(report.outcome, "cancelled");
  assert.equal(report.automaticResults[0].outcome, "cancelled");
  assert.ok(report.automaticResults.slice(1).every((result) => result.outcome === "not_run"));
  assert.ok(
    report.automaticResults
      .slice(1)
      .every(
        (result) =>
          result.error.type === "stopped_after_cancel" &&
          result.error.message.includes("취소"),
      ),
  );
});

test("같은 runner의 동시 실행은 첫 실행을 유지하고 두 번째를 engine_error로 보고한다", async () => {
  const gate = deferred();
  let calls = 0;
  const runner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async (input) => {
        calls += 1;
        if (calls === 1) await gate.promise;
        return expectedFor(input);
      },
      "css-style-v1": async (input) => {
        calls += 1;
        return expectedFor(input);
      },
    },
  });
  const firstRun = runner.run({
    collection,
    project,
    submission: createSubmission({ submissionId: "submission-first" }),
  });

  const concurrent = await runner.run({
    collection,
    project,
    submission: createSubmission({ submissionId: "submission-second" }),
  });
  assert.equal(concurrent.submissionId, "submission-second");
  assert.equal(concurrent.outcome, "engine_error");
  assert.equal(concurrent.error.type, "concurrent_run");
  assert.ok(concurrent.automaticResults.every((result) => result.outcome === "not_run"));
  assert.ok(
    concurrent.automaticResults.every((result) => result.error.type === "concurrent_run"),
  );

  gate.resolve();
  const completed = await firstRun;
  assert.equal(completed.outcome, "passed");
  assert.equal(calls, project.automaticCriteria.length);
});

test("SyntaxError·일반 오류·비 JSON 반환을 구분하고 치명 오류 뒤 기준은 not_run으로 둔다", async (t) => {
  const cases = [
    {
      name: "문법 오류",
      throwValue: () => {
        throw { name: "SyntaxError", message: "CSS 선언 문법 오류" };
      },
      outcome: "invalid_source",
      errorType: "syntax_error",
    },
    {
      name: "평가 엔진 오류",
      throwValue: () => {
        throw new Error("브라우저 평가 엔진 실패");
      },
      outcome: "engine_error",
      errorType: "evaluation_error",
    },
    {
      name: "비 JSON 반환",
      throwValue: () => Symbol("invalid-result"),
      outcome: "engine_error",
      errorType: "evaluation_error",
    },
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      let calls = 0;
      const runner = new BrowserWebProjectRunner({
        evaluationAdapters: {
          "html-dom-v1": async () => {
            calls += 1;
            return item.throwValue();
          },
        },
      });

      const report = await runner.run({ collection, project, submission: createSubmission() });

      assert.equal(calls, 1);
      assert.equal(report.outcome, item.outcome);
      assert.equal(report.automaticResults[0].outcome, item.outcome);
      assert.equal(report.automaticResults[0].error.type, item.errorType);
      assert.ok(report.automaticResults.slice(1).every((result) => result.outcome === "not_run"));
      assert.ok(
        report.automaticResults
          .slice(1)
          .every((result) => result.error.type === "stopped_after_fatal"),
      );
      assert.equal(report.error.type, item.errorType);
      assert.equal(report.score.isComplete, false);
    });
  }
});

test("pending 자가평가는 자동 기준이 모두 통과해도 provisional 점수를 숨긴다", async () => {
  const runner = createPassingRunner();
  const report = await runner.run({
    collection,
    project,
    submission: createSubmission({ manualLevel: null }),
  });

  assert.equal(report.outcome, "passed");
  assert.equal(report.score.automatic.earnedPoints, 70);
  assert.equal(report.score.manual.status, "incomplete");
  assert.equal(report.score.manual.earnedPoints, null);
  assert.equal(report.score.provisionalScore, null);
  assert.equal(report.score.isComplete, false);
});

test("잘못된 signal·adapter 설정과 getter·희소 배열 제출을 안전하게 거부한다", async () => {
  assert.throws(
    () => new BrowserWebProjectRunner({ now: 1 }),
    /now는 함수/,
  );
  assert.throws(
    () => new BrowserWebProjectRunner({ evaluationAdapters: { learner: async () => true } }),
    /지원하지 않는 Web Project 평가 어댑터/,
  );

  const runner = createPassingRunner();
  await assert.rejects(
    runner.run({ collection, project, submission: createSubmission() }, { signal: {} }),
    /AbortSignal/,
  );

  let getterCalled = false;
  let adapterCalls = 0;
  const guardedRunner = new BrowserWebProjectRunner({
    evaluationAdapters: {
      "html-dom-v1": async () => {
        adapterCalls += 1;
        return true;
      },
    },
  });
  const withGetter = structuredClone(createSubmission());
  Object.defineProperty(withGetter.files[0], "source", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "<!doctype html><main></main>";
    },
  });
  await assert.rejects(
    guardedRunner.run({ collection, project, submission: withGetter }),
    /열거 가능한 값 필드/,
  );
  assert.equal(getterCalled, false);
  assert.equal(adapterCalls, 0);

  const sparse = structuredClone(createSubmission());
  delete sparse.files[0];
  await assert.rejects(
    guardedRunner.run({ collection, project, submission: sparse }),
    /비어 있는 배열 항목/,
  );
  assert.equal(adapterCalls, 0);
});
