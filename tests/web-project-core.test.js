import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  assertValidWebProjectCollection,
  assertValidWebProjectSubmission,
  createWebProjectSubmission,
  findWebProjectBySlug,
  getWebProjectsInOrder,
  isSafeWebProjectPath,
  loadWebProjectCollection,
  snapshotWebProjectSubmission,
  validateWebProjectCollection,
  validateWebProjectSubmission,
  WEB_PROJECT_AUTOMATIC_POINTS,
  WEB_PROJECT_FILE_MAX_BYTES,
  WEB_PROJECT_MANUAL_POINTS,
  WEB_PROJECT_TOTAL_MAX_BYTES,
  WEB_PROJECT_TOTAL_POINTS,
} from "../src/core/web-project.js";

const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const project = collection.projects[0];

function createSubmissionInput(overrides = {}) {
  return {
    submissionId: "submission-responsive-plan-001",
    submittedAt: "2026-08-18T01:02:03.000Z",
    files: project.files.map((file) => ({ path: file.path, source: file.starterSource })),
    manualAssessments: project.manualCriteria.map((criterion) => ({
      criterionId: criterion.id,
      status: "pending",
      levelId: null,
    })),
    ...overrides,
  };
}

test("Web Project v1 컬렉션은 독립 계약과 70·30·100점 불변식을 만족한다", () => {
  assert.deepEqual(validateWebProjectCollection(collection, curriculum), []);
  assert.equal(assertValidWebProjectCollection(collection, curriculum), collection);
  assert.equal(collection.schemaVersion, 1);
  assert.equal(collection.contractVersion, 1);
  assert.equal(
    project.automaticCriteria.reduce((total, criterion) => total + criterion.maxPoints, 0),
    WEB_PROJECT_AUTOMATIC_POINTS,
  );
  assert.equal(
    project.manualCriteria.reduce((total, criterion) => total + criterion.maxPoints, 0),
    WEB_PROJECT_MANUAL_POINTS,
  );
  assert.equal(WEB_PROJECT_AUTOMATIC_POINTS + WEB_PROJECT_MANUAL_POINTS, WEB_PROJECT_TOTAL_POINTS);
  assert.equal(WEB_PROJECT_FILE_MAX_BYTES, 20 * 1024);
  assert.equal(WEB_PROJECT_TOTAL_MAX_BYTES, 64 * 1024);
});

test("목록·slug 조회와 고정 콘텐츠 경로 로더가 정식 컬렉션을 반환한다", async () => {
  assert.deepEqual(getWebProjectsInOrder(collection).map((item) => item.id), [project.id]);
  assert.equal(findWebProjectBySlug(collection, project.slug), project);
  assert.equal(findWebProjectBySlug(collection, "../unsafe"), null);

  let requestedPath = null;
  const loaded = await loadWebProjectCollection(curriculum, async (path) => {
    requestedPath = path;
    return { ok: true, json: async () => structuredClone(collection) };
  });
  assert.equal(requestedPath, "./content/web-projects/index.json");
  assert.equal(loaded.projects[0].id, project.id);
});

test("ID·slug·revision·order·교안·개념 참조 위반을 런타임에서 거부한다", () => {
  const cases = [];

  const invalidId = structuredClone(collection);
  invalidId.projects[0].id = "project_invalid";
  cases.push([invalidId, /id 형식/]);

  const invalidSlug = structuredClone(collection);
  invalidSlug.projects[0].slug = "Bad Slug";
  cases.push([invalidSlug, /slug 형식/]);

  const invalidRevision = structuredClone(collection);
  invalidRevision.projects[0].revision = 0;
  cases.push([invalidRevision, /revision/]);

  const invalidOrder = structuredClone(collection);
  invalidOrder.projects[0].order = 2;
  cases.push([invalidOrder, /order/]);

  const missingLesson = structuredClone(collection);
  missingLesson.projects[0].conceptRefs[0].lessonId = "html-missing-lesson";
  cases.push([missingLesson, /존재하지 않는 교안/]);

  const crossedConcept = structuredClone(collection);
  crossedConcept.projects[0].conceptRefs[0].conceptIds = ["css.grid"];
  cases.push([crossedConcept, /연결 교안에 없는 개념/]);

  for (const [candidate, expected] of cases) {
    assert.match(validateWebProjectCollection(candidate, curriculum).join("\n"), expected);
  }
});

test("파일은 안전한 POSIX 경로·HTML/CSS 두 파일·개별 및 전체 크기 제한을 지킨다", () => {
  for (const safePath of ["index.html", "styles.css", "assets/theme.css"]) {
    assert.equal(isSafeWebProjectPath(safePath), true, safePath);
  }
  for (const unsafePath of ["/index.html", "../index.html", "a/../index.html", "a\\b.css", "a//b.css"]) {
    assert.equal(isSafeWebProjectPath(unsafePath), false, unsafePath);
  }

  const traversal = structuredClone(collection);
  traversal.projects[0].files[0].path = "../index.html";
  assert.match(validateWebProjectCollection(traversal, curriculum).join("\n"), /안전한 상대 POSIX 경로/);

  const crossedExtension = structuredClone(collection);
  crossedExtension.projects[0].files[0].path = "index.css";
  assert.match(validateWebProjectCollection(crossedExtension, curriculum).join("\n"), /확장자/);

  const oversized = structuredClone(collection);
  oversized.projects[0].files[1].starterSource = `.card { color: red; }\n${"/* safe */".repeat(2400)}`;
  assert.match(validateWebProjectCollection(oversized, curriculum).join("\n"), /20480바이트/);

  const totalOversized = structuredClone(collection);
  totalOversized.projects[0].files[0].starterSource = `<main>${"가".repeat(12000)}</main>`;
  totalOversized.projects[0].files[1].starterSource = `.x{--note:${"가".repeat(12000)}}`;
  assert.match(validateWebProjectCollection(totalOversized, curriculum).join("\n"), /65536바이트/);
});

test("Web Project HTML은 스타일을 styles.css에만 두도록 style 요소와 속성을 거부한다", () => {
  for (const htmlSource of [
    '<!doctype html><style>.learning-board { display: grid; }</style><main></main>',
    '<!doctype html><main style="display: grid"></main>',
  ]) {
    const authored = structuredClone(collection);
    authored.projects[0].files.find((file) => file.languageId === "html").starterSource =
      htmlSource;
    assert.match(
      validateWebProjectCollection(authored, curriculum).join("\n"),
      /style 요소와 style 속성/,
    );

    const submitted = createSubmissionInput();
    submitted.files.find((file) => file.path.endsWith(".html")).source = htmlSource;
    assert.throws(
      () => createWebProjectSubmission(collection, project, submitted),
      /style 요소와 style 속성/,
    );
  }
});

test("평가 종류·파일·assertion·배점·자가점검 scale 교차 불변식을 거부한다", () => {
  const wrongLanguage = structuredClone(collection);
  wrongLanguage.projects[0].automaticCriteria[0].evaluationKind = "css-style-v1";
  assert.match(validateWebProjectCollection(wrongLanguage, curriculum).join("\n"), /대상 파일 언어/);

  const wrongAssertion = structuredClone(collection);
  wrongAssertion.projects[0].automaticCriteria[0].assertion = {
    kind: "rule-declaration",
    selector: "body",
    property: "display",
    expected: "grid",
  };
  assert.match(validateWebProjectCollection(wrongAssertion, curriculum).join("\n"), /허용되지 않습니다/);

  const wrongAutomaticTotal = structuredClone(collection);
  wrongAutomaticTotal.projects[0].automaticCriteria[0].maxPoints += 1;
  assert.match(validateWebProjectCollection(wrongAutomaticTotal, curriculum).join("\n"), /70점/);

  const wrongManualTotal = structuredClone(collection);
  wrongManualTotal.projects[0].manualCriteria[0].maxPoints += 1;
  wrongManualTotal.projects[0].manualCriteria[0].scale[2].points += 1;
  assert.match(validateWebProjectCollection(wrongManualTotal, curriculum).join("\n"), /30점/);

  const wrongScale = structuredClone(collection);
  wrongScale.projects[0].manualCriteria[0].scale[0].points = 1;
  wrongScale.projects[0].manualCriteria[0].scale[1].points = 0;
  assert.match(validateWebProjectCollection(wrongScale, curriculum).join("\n"), /첫 단계는 0점|오름차순/);
});

test("Web Project도 계산된 Grid 열 개수와 viewport 범위를 공통 assertion 계약으로 검증한다", () => {
  const candidate = structuredClone(collection);
  const criterion = candidate.projects[0].automaticCriteria.find(
    (item) => item.evaluationKind === "css-style-v1",
  );
  criterion.assertion = {
    kind: "computed-grid-column-count",
    selector: ".learning-board",
    viewportWidth: 640,
    expected: 2,
  };
  assert.deepEqual(validateWebProjectCollection(candidate, curriculum), []);

  criterion.assertion.viewportWidth = 319;
  assert.match(validateWebProjectCollection(candidate, curriculum).join("\n"), /viewportWidth는 320~1920/);
  criterion.assertion.viewportWidth = 640;
  criterion.assertion.expected = 13;
  assert.match(validateWebProjectCollection(candidate, curriculum).join("\n"), /expected는 1~12/);
});

test("제출 생성은 정식 파일·수동 기준만 복사하고 모든 중첩 값을 동결한다", () => {
  const impostorProject = { id: project.id, files: [], manualCriteria: [], revision: 999 };
  const submission = createWebProjectSubmission(collection, impostorProject, createSubmissionInput());

  assert.equal(submission.projectId, project.id);
  assert.equal(submission.projectRevision, project.revision);
  assert.deepEqual(validateWebProjectSubmission(submission, project), []);
  assert.equal(assertValidWebProjectSubmission(submission, project), submission);
  assert.ok(Object.isFrozen(submission));
  assert.ok(Object.isFrozen(submission.files));
  assert.ok(submission.files.every(Object.isFrozen));
  assert.ok(Object.isFrozen(submission.manualAssessments));
  assert.ok(submission.manualAssessments.every(Object.isFrozen));
  assert.ok(!Object.hasOwn(submission, "automaticCriteria"));
  assert.ok(!Object.hasOwn(submission, "manualCriteria"));
  assert.ok(submission.files.every((file) => !Object.hasOwn(file, "assertion")));
});

test("제출은 알 수 없는 파일·기준·배점·assertion 삽입과 위험 source를 거부한다", () => {
  const extraField = createSubmissionInput({ assertion: { kind: "selector-exists" } });
  assert.throws(
    () => createWebProjectSubmission(collection, project, extraField),
    /허용되지 않은 필드.*assertion/,
  );

  const unknownFile = createSubmissionInput();
  unknownFile.files[0].path = "answer.html";
  assert.throws(
    () => createWebProjectSubmission(collection, project, unknownFile),
    /정식 프로젝트 파일/,
  );

  const unsafeSource = createSubmissionInput();
  unsafeSource.files[0].source = "<script>alert(1)</script>";
  assert.throws(() => createWebProjectSubmission(collection, project, unsafeSource), /script/);

  const injectedPoints = createSubmissionInput();
  injectedPoints.manualAssessments[0].points = 10;
  assert.throws(() => createWebProjectSubmission(collection, project, injectedPoints), /points/);

  const unknownLevel = createSubmissionInput();
  unknownLevel.manualAssessments[0] = {
    criterionId: project.manualCriteria[0].id,
    status: "self_assessed",
    levelId: "invented",
  };
  assert.throws(() => createWebProjectSubmission(collection, project, unknownLevel), /평가 단계/);
});

test("기존 제출 snapshot도 exact DTO를 다시 검증해 정식 revision으로 고정한다", () => {
  const created = createWebProjectSubmission(collection, project, createSubmissionInput());
  const plainSubmission = structuredClone(created);
  const snapshot = snapshotWebProjectSubmission(collection, project, plainSubmission);
  assert.deepEqual(snapshot, created);
  assert.ok(Object.isFrozen(snapshot));

  plainSubmission.projectRevision += 1;
  assert.throws(
    () => snapshotWebProjectSubmission(collection, project, plainSubmission),
    /projectRevision/,
  );
});

test("getter·비정상 prototype·희소 배열 입력을 실행하지 않고 검증 오류로 반환한다", () => {
  const withGetter = structuredClone(collection);
  let getterCalled = false;
  Object.defineProperty(withGetter.projects[0], "title", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "실행되면 안 됨";
    },
  });
  assert.match(validateWebProjectCollection(withGetter, curriculum).join("\n"), /열거 가능한 값 필드/);
  assert.equal(getterCalled, false);

  const exotic = structuredClone(collection);
  Object.setPrototypeOf(exotic.projects[0], { inherited: true });
  assert.match(validateWebProjectCollection(exotic, curriculum).join("\n"), /열거 가능한 값 필드/);

  const sparse = structuredClone(collection);
  delete sparse.projects[0].manualCriteria[1];
  assert.match(validateWebProjectCollection(sparse, curriculum).join("\n"), /비어 있는 배열 항목/);
});
