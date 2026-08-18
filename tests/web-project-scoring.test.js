import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  scoreWebProject,
  validateWebProjectScoringInput,
  WEB_PROJECT_AUTOMATIC_OUTCOMES,
  WEB_PROJECT_MANUAL_STATUSES,
} from "../src/grading/web-project-scoring.js";

const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const project = collection.projects[0];

function createAutomaticResults(outcome = "passed") {
  return project.automaticCriteria.map((criterion) => ({ criterionId: criterion.id, outcome }));
}

function createManualAssessments(levelId = "meets") {
  return project.manualCriteria.map((criterion) => ({
    criterionId: criterion.id,
    status: levelId === null ? "pending" : "self_assessed",
    levelId,
  }));
}

function createEvaluation(overrides = {}) {
  return {
    automaticResults: createAutomaticResults(),
    manualAssessments: createManualAssessments(),
    ...overrides,
  };
}

function cloneProject() {
  return structuredClone(project);
}

test("자동 outcome과 수동 상태의 공개 허용 목록을 고정한다", () => {
  assert.deepEqual(WEB_PROJECT_AUTOMATIC_OUTCOMES, [
    "passed",
    "failed",
    "invalid_source",
    "engine_error",
    "cancelled",
    "not_run",
  ]);
  assert.deepEqual(WEB_PROJECT_MANUAL_STATUSES, ["pending", "self_assessed"]);
});

test("모든 자동 기준과 자가점검을 완료했을 때만 100점 provisional 결과를 만든다", () => {
  const evaluation = createEvaluation();
  assert.deepEqual(validateWebProjectScoringInput(project, evaluation), []);

  const report = scoreWebProject(project, evaluation);
  assert.equal(report.isComplete, true);
  assert.equal(report.isVerified, false);
  assert.equal(report.provisionalScore, 100);
  assert.equal(report.maxPoints, 100);
  assert.deepEqual(
    [report.automatic.status, report.automatic.earnedPoints, report.automatic.maxPoints],
    ["complete", 70, 70],
  );
  assert.deepEqual(
    [report.manual.status, report.manual.earnedPoints, report.manual.maxPoints],
    ["complete", 30, 30],
  );
  assert.ok(Object.isFrozen(report));
  assert.ok(Object.isFrozen(report.automatic.criteria));
  assert.ok(report.automatic.criteria.every(Object.isFrozen));
  assert.ok(report.manual.criteria.every(Object.isFrozen));
});

test("failed·invalid_source는 완료된 0점 결과이며 부분 점수를 정확히 합산한다", () => {
  const automaticResults = createAutomaticResults();
  automaticResults[0].outcome = "failed";
  automaticResults[1].outcome = "invalid_source";
  const manualAssessments = createManualAssessments();
  manualAssessments[0].levelId = "partly";
  manualAssessments[1].levelId = "not-yet";

  const report = scoreWebProject(project, { automaticResults, manualAssessments });
  const lostAutomaticPoints =
    project.automaticCriteria[0].maxPoints + project.automaticCriteria[1].maxPoints;
  assert.equal(report.automatic.earnedPoints, 70 - lostAutomaticPoints);
  assert.equal(report.manual.earnedPoints, 15);
  assert.equal(report.provisionalScore, 70 - lostAutomaticPoints + 15);
  assert.equal(report.automatic.criteria[0].earnedPoints, 0);
  assert.equal(report.automatic.criteria[1].earnedPoints, 0);
  assert.equal(report.isComplete, true);
  assert.equal(report.isVerified, false);
});

test("engine_error·cancelled·not_run은 0점으로 확정하지 않고 자동 평가를 미완료로 둔다", () => {
  for (const outcome of ["engine_error", "cancelled", "not_run"]) {
    const automaticResults = createAutomaticResults();
    automaticResults[2].outcome = outcome;
    const report = scoreWebProject(project, {
      automaticResults,
      manualAssessments: createManualAssessments(),
    });

    assert.equal(report.automatic.status, "incomplete", outcome);
    assert.equal(report.automatic.earnedPoints, null, outcome);
    assert.equal(report.automatic.criteria[2].earnedPoints, null, outcome);
    assert.equal(report.automatic.criteria[2].isComplete, false, outcome);
    assert.equal(report.manual.earnedPoints, 30, outcome);
    assert.equal(report.provisionalScore, null, outcome);
    assert.equal(report.isComplete, false, outcome);
    assert.equal(report.isVerified, false, outcome);
  }
});

test("pending 자가점검은 0점으로 확정하지 않고 전체 provisional 점수를 숨긴다", () => {
  const manualAssessments = createManualAssessments();
  manualAssessments[1] = {
    criterionId: project.manualCriteria[1].id,
    status: "pending",
    levelId: null,
  };
  const report = scoreWebProject(project, {
    automaticResults: createAutomaticResults(),
    manualAssessments,
  });

  assert.equal(report.automatic.earnedPoints, 70);
  assert.equal(report.manual.status, "incomplete");
  assert.equal(report.manual.earnedPoints, null);
  assert.equal(report.manual.criteria[1].earnedPoints, null);
  assert.equal(report.provisionalScore, null);
  assert.equal(report.isComplete, false);
  assert.equal(report.isVerified, false);
});

test("점수 함수는 누락·중복·알 수 없는 기준과 임의 점수 필드를 거부한다", () => {
  const missing = createEvaluation();
  missing.automaticResults.pop();
  assert.match(validateWebProjectScoringInput(project, missing).join("\n"), /정확히|결과가 없습니다/);

  const duplicate = createEvaluation();
  duplicate.automaticResults[1].criterionId = duplicate.automaticResults[0].criterionId;
  assert.match(validateWebProjectScoringInput(project, duplicate).join("\n"), /중복/);

  const unknownOutcome = createEvaluation();
  unknownOutcome.automaticResults[0].outcome = "wrong_answer";
  assert.match(validateWebProjectScoringInput(project, unknownOutcome).join("\n"), /지원하는 자동 평가 상태/);

  const injectedPoints = createEvaluation();
  injectedPoints.automaticResults[0].earnedPoints = 999;
  assert.match(validateWebProjectScoringInput(project, injectedPoints).join("\n"), /earnedPoints/);

  const unknownManualLevel = createEvaluation();
  unknownManualLevel.manualAssessments[0].levelId = "reviewer-approved";
  assert.match(validateWebProjectScoringInput(project, unknownManualLevel).join("\n"), /평가 단계/);

  assert.throws(() => scoreWebProject(project, unknownOutcome), /점수 입력 검증 실패/);
});

test("서버 검증처럼 보이는 수동 상태를 허용하지 않고 isVerified는 항상 false다", () => {
  const evaluation = createEvaluation();
  evaluation.manualAssessments[0].status = "verified";
  assert.match(validateWebProjectScoringInput(project, evaluation).join("\n"), /지원하는 수동 평가 상태/);

  const zeroReport = scoreWebProject(project, {
    automaticResults: createAutomaticResults("failed"),
    manualAssessments: createManualAssessments("not-yet"),
  });
  assert.equal(zeroReport.provisionalScore, 0);
  assert.equal(zeroReport.isComplete, true);
  assert.equal(zeroReport.isVerified, false);
});

test("getter·비정상 prototype·희소 배열 점수 입력을 실행하지 않고 안전하게 거부한다", () => {
  let getterCalled = false;
  const withGetter = createEvaluation();
  Object.defineProperty(withGetter.automaticResults[0], "outcome", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "passed";
    },
  });
  assert.match(validateWebProjectScoringInput(project, withGetter).join("\n"), /열거 가능한 값 필드/);
  assert.equal(getterCalled, false);

  const exotic = createEvaluation();
  Object.setPrototypeOf(exotic.manualAssessments[0], { inherited: true });
  assert.match(validateWebProjectScoringInput(project, exotic).join("\n"), /열거 가능한 값 필드/);

  const sparse = createEvaluation();
  delete sparse.automaticResults[0];
  assert.match(validateWebProjectScoringInput(project, sparse).join("\n"), /비어 있는 배열 항목/);

  const throwingProject = new Proxy(project, {
    get() {
      throw new Error("호출되면 안 되는 값");
    },
  });
  assert.deepEqual(validateWebProjectScoringInput(throwingProject, createEvaluation()), [
    "Web Project 점수 입력을 안전하게 검증할 수 없습니다.",
  ]);
});

test("배점 합계가 같아도 0점·음수·소수·안전 범위 밖 maxPoints를 거부한다", () => {
  const candidates = [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1];
  for (const maxPoints of candidates) {
    const forgedAutomatic = cloneProject();
    forgedAutomatic.automaticCriteria[0].maxPoints = maxPoints;
    assert.match(
      validateWebProjectScoringInput(forgedAutomatic, createEvaluation()).join("\n"),
      /maxPoints는 1 이상의 안전한 정수/,
      `automatic ${String(maxPoints)}`,
    );

    const forgedManual = cloneProject();
    forgedManual.manualCriteria[0].maxPoints = maxPoints;
    assert.match(
      validateWebProjectScoringInput(forgedManual, createEvaluation()).join("\n"),
      /maxPoints는 1 이상의 안전한 정수/,
      `manual ${String(maxPoints)}`,
    );
  }

  const sumPreserving = cloneProject();
  sumPreserving.automaticCriteria[0].maxPoints +=
    sumPreserving.automaticCriteria[1].maxPoints;
  sumPreserving.automaticCriteria[1].maxPoints = 0;
  assert.match(
    validateWebProjectScoringInput(sumPreserving, createEvaluation()).join("\n"),
    /maxPoints는 1 이상의 안전한 정수/,
  );
});

test("자동·수동 평가 기준은 일반 객체와 고유 ID를 사용해야 한다", () => {
  const duplicateAutomatic = cloneProject();
  duplicateAutomatic.automaticCriteria[1].id = duplicateAutomatic.automaticCriteria[0].id;
  assert.match(
    validateWebProjectScoringInput(duplicateAutomatic, createEvaluation()).join("\n"),
    /자동 평가 기준 ID가 중복/,
  );

  const duplicateManual = cloneProject();
  duplicateManual.manualCriteria[1].id = duplicateManual.manualCriteria[0].id;
  assert.match(
    validateWebProjectScoringInput(duplicateManual, createEvaluation()).join("\n"),
    /중복 평가 기준 ID/,
  );

  const crossCollision = cloneProject();
  crossCollision.manualCriteria[0].id = crossCollision.automaticCriteria[0].id;
  assert.match(
    validateWebProjectScoringInput(crossCollision, createEvaluation()).join("\n"),
    /중복 평가 기준 ID/,
  );

  const exoticCriterion = cloneProject();
  Object.setPrototypeOf(exoticCriterion.automaticCriteria[0], { inherited: true });
  assert.match(
    validateWebProjectScoringInput(exoticCriterion, createEvaluation()).join("\n"),
    /일반 객체의 열거 가능한 값 필드/,
  );
});

test("평가 기준 getter를 실행하지 않고 거부하며 rubric 배열은 조밀해야 한다", () => {
  let getterCalled = false;
  const withGetter = cloneProject();
  Object.defineProperty(withGetter.manualCriteria[0], "maxPoints", {
    enumerable: true,
    get() {
      getterCalled = true;
      return 10;
    },
  });
  assert.match(
    validateWebProjectScoringInput(withGetter, createEvaluation()).join("\n"),
    /일반 객체의 열거 가능한 값 필드/,
  );
  assert.equal(getterCalled, false);

  const sparse = cloneProject();
  delete sparse.manualCriteria[1];
  assert.match(
    validateWebProjectScoringInput(sparse, createEvaluation()).join("\n"),
    /비어 있는 배열 항목/,
  );
});

test("수동 scale은 세 일반 객체·고유 ID·유효한 오름차순 점수 경계를 지켜야 한다", () => {
  const wrongLength = cloneProject();
  wrongLength.manualCriteria[0].scale.pop();
  assert.match(
    validateWebProjectScoringInput(wrongLength, createEvaluation()).join("\n"),
    /정확히 3개 항목/,
  );

  const exoticLevel = cloneProject();
  Object.setPrototypeOf(exoticLevel.manualCriteria[0].scale[0], { inherited: true });
  assert.match(
    validateWebProjectScoringInput(exoticLevel, createEvaluation()).join("\n"),
    /일반 객체의 열거 가능한 값 필드/,
  );

  const duplicateLevel = cloneProject();
  duplicateLevel.manualCriteria[0].scale[1].id = duplicateLevel.manualCriteria[0].scale[0].id;
  assert.match(
    validateWebProjectScoringInput(duplicateLevel, createEvaluation()).join("\n"),
    /scale ID가 중복/,
  );

  const notIncreasing = cloneProject();
  notIncreasing.manualCriteria[0].scale[1].points = 0;
  assert.match(
    validateWebProjectScoringInput(notIncreasing, createEvaluation()).join("\n"),
    /엄격한 오름차순/,
  );

  const wrongFirst = cloneProject();
  wrongFirst.manualCriteria[0].scale[0].points = 1;
  assert.match(
    validateWebProjectScoringInput(wrongFirst, createEvaluation()).join("\n"),
    /첫 단계는 0점/,
  );

  const wrongLast = cloneProject();
  wrongLast.manualCriteria[0].scale[2].points = wrongLast.manualCriteria[0].maxPoints - 1;
  assert.match(
    validateWebProjectScoringInput(wrongLast, createEvaluation()).join("\n"),
    /마지막 단계는 maxPoints/,
  );

  const unsafePoints = cloneProject();
  unsafePoints.manualCriteria[0].scale[1].points = 1.5;
  assert.match(
    validateWebProjectScoringInput(unsafePoints, createEvaluation()).join("\n"),
    /points는 0부터 maxPoints 사이의 안전한 정수/,
  );
});

test("수동 단계 점수 조작으로 합계 100점을 유지한 채 101점을 만드는 우회를 차단한다", () => {
  const forged = cloneProject();
  forged.manualCriteria[0].scale[2].points = forged.manualCriteria[0].maxPoints + 1;

  const errors = validateWebProjectScoringInput(forged, createEvaluation()).join("\n");
  assert.match(errors, /0부터 maxPoints 사이|마지막 단계는 maxPoints/);
  assert.throws(() => scoreWebProject(forged, createEvaluation()), /점수 입력 검증 실패/);
});
