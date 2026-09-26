import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  BamLearningApp,
  loadAvailableCodingTestCollectionsSafely,
} from "../src/app.js";
import {
  canRunCodingTest,
  findCodingTestProblemBySlug,
  validateCodingTestCollection,
} from "../src/core/coding-test.js";
import {
  buildCodingTestHash,
  buildQuestHash,
  parseCodingTestHash,
} from "../src/core/navigation.js";
import { createCodingTestRunnerRequest } from "../src/grading/coding-test-runner-adapter.js";
import {
  LocalStorageProgressRepository,
  MemoryStorage,
  PROGRESS_STORAGE_KEY,
} from "../src/repositories/progress-repository.js";
import { renderCodingTestView } from "../src/ui/coding-test-view.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const javaCodingTests = JSON.parse(
  await readFile(new URL("../content/coding-tests/java.json", import.meta.url), "utf8"),
);
const javascriptCodingTests = JSON.parse(
  await readFile(new URL("../content/coding-tests/javascript.json", import.meta.url), "utf8"),
);
const javaSchema = JSON.parse(
  await readFile(
    new URL("../content/schema/java-coding-test.schema.json", import.meta.url),
    "utf8",
  ),
);
const codingTestFixtures = JSON.parse(
  await readFile(
    new URL("./fixtures/algorithm-bridge-coding-test-solutions.json", import.meta.url),
    "utf8",
  ),
);
const questCollections = await Promise.all(
  ["javascript", "html", "css", "java"].map(async (languageId) =>
    JSON.parse(
      await readFile(
        new URL(`../content/quests/${languageId}.json`, import.meta.url),
        "utf8",
      ),
    )),
);

const SOURCE_SLOTS = [
  ...Array.from({ length: 12 }, (_, index) => `arr-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `stk-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `que-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `hsh-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `tre-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `set-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `gra-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `bkt-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `srt-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `twp-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `sim-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `dyn-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `gre-${String(index + 1).padStart(2, "0")}`),
];
const RELATED_QUEST_IDS = new Set([
  "quest-java-bridge-arr-01",
  "quest-java-bridge-arr-02",
  "quest-java-bridge-que-01",
]);
const JAVA_TYPES = [
  "int",
  "long",
  "double",
  "boolean",
  "String",
  "int[]",
  "long[]",
  "double[]",
  "String[]",
  "int[][]",
  "boolean[][]",
  "String[][]",
];

function expectedJavaProblemId(index) {
  return `coding-test-java-bridge-${SOURCE_SLOTS[index]}`;
}

function validateMutation(problemId, mutate) {
  const candidate = structuredClone(javaCodingTests);
  const problem = candidate.problems.find(({ id }) => id === problemId);
  assert.ok(problem, `${problemId} 기준 문제가 있어야 합니다.`);
  mutate(problem);
  return validateCodingTestCollection(candidate, curriculum);
}

function findExamplePositionForType(type) {
  for (const problem of javaCodingTests.problems) {
    const parameterIndex = problem.functionContract.parameters.findIndex(
      (parameter) => parameter.type === type,
    );
    if (parameterIndex >= 0) return { problem, parameterIndex, target: "argument" };
    if (problem.functionContract.returns.type === type) {
      return { problem, target: "return" };
    }
  }
  return null;
}

function installBrowserGlobals(t, hash) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const replacements = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { hash },
      history: {
        replaceState(_state, _title, nextHash) {
          replacements.push(nextHash);
          globalThis.window.location.hash = nextHash;
        },
      },
      requestAnimationFrame(callback) { callback(); },
      scrollTo() {},
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      title: "",
      querySelector() { return null; },
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
  return replacements;
}

test("Java72·JavaScript6과 기존 Quest32의 ID·원본 순서·연결을 고정한다", () => {
  const expectedProblemIds = SOURCE_SLOTS.map((slot) => `coding-test-java-bridge-${slot}`);
  const expectedSlugs = SOURCE_SLOTS.map((slot) => `bridge-${slot}`);
  const related = javaCodingTests.problems.filter((problem) => problem.relatedQuestId);
  const legacy = javaCodingTests.problems.filter((problem) => problem.legacyQuestId);
  const publicTestIds = javaCodingTests.problems.flatMap((problem) =>
    problem.publicTests.map((publicTest) => publicTest.id),
  );
  const usedTypes = new Set(
    javaCodingTests.problems.flatMap((problem) => [
      ...problem.functionContract.parameters.map((parameter) => parameter.type),
      problem.functionContract.returns.type,
    ]),
  );

  assert.equal(SOURCE_SLOTS.length, 72);
  assert.equal(javaCodingTests.problems.length, 72);
  assert.equal(javascriptCodingTests.problems.length, 6);
  assert.equal(questCollections.reduce((count, collection) => count + collection.quests.length, 0), 32);
  assert.equal(questCollections.find(({ languageId }) => languageId === "java").quests.length, 4);
  assert.deepEqual(javaCodingTests.problems.map(({ id }) => id), expectedProblemIds);
  assert.deepEqual(javaCodingTests.problems.map(({ slug }) => slug), expectedSlugs);
  assert.deepEqual(javaCodingTests.problems.map(({ order }) => order), SOURCE_SLOTS.map((_, index) => index + 1));
  assert.deepEqual(new Set(related.map(({ relatedQuestId }) => relatedQuestId)), RELATED_QUEST_IDS);
  assert.equal(related.length, 3);
  assert.equal(legacy.length, 69);
  assert.equal(
    legacy.every(({ legacyQuestId, slug }) => legacyQuestId === `quest-java-${slug}`),
    true,
  );
  assert.equal(publicTestIds.length, 168);
  assert.equal(new Set(publicTestIds).size, 168);
  assert.deepEqual([...usedTypes].sort(), [...JAVA_TYPES].sort());
  assert.equal(
    javaCodingTests.problems.every((problem) =>
      problem.executionMode === "draft-only" &&
      problem.hints.length <= 5 &&
      problem.publicTests.every(({ assertionSource }) =>
        problem.publicTestSource.includes(assertionSource))),
    true,
  );
  assert.equal(javaCodingTests.problems.some(({ hints }) => hints.length === 0), true);
  assert.deepEqual(
    codingTestFixtures.map(({ problemId, revision }) => [problemId, revision]),
    javaCodingTests.problems.map(({ id, revision }) => [id, revision]),
  );
  assert.equal(
    codingTestFixtures.every(({ executionStatus }) =>
      executionStatus.startsWith("BLOCKED: Java/JDK/javac 실행 금지")),
    true,
  );
});

test("Java 전용 schema와 core는 닫힌 72문제 draft 계약을 승인한다", () => {
  assert.equal(javaSchema.properties.problems.minItems, 72);
  assert.equal(javaSchema.properties.problems.maxItems, 72);
  assert.deepEqual(javaSchema.$defs.javaType.enum, JAVA_TYPES);
  assert.equal(javaSchema.$defs.problem.properties.executionMode.const, "draft-only");
  assert.equal(javaSchema.$defs.problem.additionalProperties, false);
  assert.deepEqual(javaSchema.$defs.publicTest.required, ["id", "label", "assertionSource"]);
  assert.equal(javaSchema.$defs.publicTest.additionalProperties, false);
  assert.deepEqual(validateCodingTestCollection(javaCodingTests, curriculum), []);
  assert.deepEqual(validateCodingTestCollection(javascriptCodingTests, curriculum), []);

  assert.match(validateMutation(expectedJavaProblemId(0), (problem) => {
    problem.legacyQuestId = "quest-java-bridge-arr-01";
  }).join("\n"), /relatedQuestId 또는 legacyQuestId 중 하나/);
  assert.match(validateMutation(expectedJavaProblemId(2), (problem) => {
    delete problem.legacyQuestId;
  }).join("\n"), /relatedQuestId 또는 legacyQuestId 중 하나/);
});

test("12개 Java 표시 타입은 예제 인수·반환의 잘못된 값과 배열 경계를 거부한다", () => {
  const invalidByType = new Map([
    ["int", 2147483648],
    ["long", "01"],
    ["double", Infinity],
    ["boolean", "true"],
    ["String", 1],
    ["int[]", [2147483648]],
    ["long[]", ["01"]],
    ["double[]", [Infinity]],
    ["String[]", [1]],
    ["int[][]", [[2147483648]]],
    ["boolean[][]", [["true"]]],
    ["String[][]", [[1]]],
  ]);

  for (const [type, invalidValue] of invalidByType) {
    const position = findExamplePositionForType(type);
    assert.ok(position, `${type} 예제 위치가 있어야 합니다.`);
    const errors = validateMutation(position.problem.id, (problem) => {
      if (position.target === "argument") {
        problem.examples[0].args[position.parameterIndex] = invalidValue;
      } else {
        problem.examples[0].expected = invalidValue;
      }
    });
    assert.equal(errors.some((error) => error.includes("examples[0]")), true, `${type}: ${errors}`);
  }

  const intArray = findExamplePositionForType("int[]");
  assert.match(validateMutation(intArray.problem.id, (problem) => {
    problem.examples[0].args[intArray.parameterIndex] = Array(100_001).fill(0);
  }).join("\n"), /100000/);
});

test("원본 Test와 typed 예제의 UTF-8 한도·포함 관계·닫힌 필드를 거부한다", () => {
  const sourceProblem = [...javaCodingTests.problems].sort(
    (left, right) => left.publicTestSource.length - right.publicTestSource.length,
  )[0];
  const assertions = sourceProblem.publicTests.map(({ assertionSource }) => assertionSource).join("\n");
  const assertionBytes = new TextEncoder().encode(assertions).byteLength;
  assert.ok(assertionBytes < 8 * 1024);

  assert.deepEqual(validateMutation(sourceProblem.id, (problem) => {
    problem.publicTestSource = `${assertions}${"a".repeat(8 * 1024 - assertionBytes)}`;
  }), []);
  assert.match(validateMutation(sourceProblem.id, (problem) => {
    problem.publicTestSource = `${assertions}${"a".repeat(8 * 1024 - assertionBytes)}가`;
  }).join("\n"), /8192/);
  assert.match(validateMutation(sourceProblem.id, (problem) => {
    problem.publicTests[0].assertionSource = "@Test void missing() {}";
  }).join("\n"), /publicTestSource의 원문 일부/);
  assert.match(validateMutation(sourceProblem.id, (problem) => {
    problem.publicTests[0].expected = 1;
  }).join("\n"), /허용되지 않은 필드.*expected/);

  const stringPosition = findExamplePositionForType("String");
  assert.match(validateMutation(stringPosition.problem.id, (problem) => {
    problem.examples[0].args[stringPosition.parameterIndex] = "가".repeat(1_400_000);
  }).join("\n"), /4194304/);
});

test("두 언어 컬렉션을 함께 로드하고 Java는 core·adapter에서 Worker 진입 전에 닫는다", async () => {
  const calls = [];
  const collections = await loadAvailableCodingTestCollectionsSafely(
    curriculum,
    async (languageId) => {
      calls.push(languageId);
      return languageId === "java" ? javaCodingTests : javascriptCodingTests;
    },
  );
  const javaProblem = javaCodingTests.problems[0];
  let forbiddenCalls = 0;

  assert.deepEqual(new Set(calls), new Set(["javascript", "java"]));
  assert.deepEqual([...collections.keys()].sort(), ["java", "javascript"]);
  assert.equal(canRunCodingTest(javascriptCodingTests, javascriptCodingTests.problems[0]), true);
  assert.equal(canRunCodingTest(javaCodingTests, javaProblem), false);
  for (const mode of ["run", "submit"]) {
    assert.throws(
      () => createCodingTestRunnerRequest({
        collection: javaCodingTests,
        problem: javaProblem,
        source: javaProblem.starterCode,
        requestId: `java-${mode}`,
        mode,
      }),
      /현재 앱에서 실행할 수 없습니다/,
    );
  }

  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentView: "coding-test",
    codingTestState: {
      collection: javaCodingTests,
      problem: javaProblem,
      source: javaProblem.starterCode,
      isRunning: false,
      uiError: null,
      report: null,
      reportPersistenceStatus: null,
    },
    codingTestRunner: { async run() { forbiddenCalls += 1; } },
    progressRepository: { recordCodingTestSubmission() { forbiddenCalls += 100; } },
    flushPendingCodingTestDraftSave() { forbiddenCalls += 1000; },
    renderCodingTest() {},
  });
  await app.executeCurrentCodingTest("run");
  await app.executeCurrentCodingTest("submit");
  assert.equal(forbiddenCalls, 0);
  assert.equal(app.codingTestState.report, null);
  assert.match(app.codingTestState.uiError, /작성과 저장만 지원/);
});

test("옛 Quest URL 69개만 canonical 코딩테스트 URL로 바꾸고 준비 Quest 링크는 유지한다", async (t) => {
  const legacyProblem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-03");
  const relatedProblem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-01");
  const javaQuests = questCollections.find(({ languageId }) => languageId === "java");
  const replacements = installBrowserGlobals(t, buildQuestHash("java", legacyProblem.slug));
  const opened = [];
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    codeQuestCollections: new Map([["java", javaQuests]]),
    codingTestCollections: new Map([["java", javaCodingTests]]),
    renderSequence: 0,
    root: { innerHTML: "" },
    enterView() { this.renderSequence += 1; return this.renderSequence; },
    renderServiceShell({ mainContent }) { return mainContent; },
    syncMenuState() {},
    async openCodingTestRoute(languageId, slug, options) {
      opened.push({ languageId, slug, options });
    },
  });

  await app.openCodeQuestRoute("java", legacyProblem.slug);

  assert.deepEqual(replacements, [buildCodingTestHash("java", legacyProblem.slug)]);
  assert.deepEqual(opened, [{
    languageId: "java",
    slug: legacyProblem.slug,
    options: { routeNotice: "이 문제는 Code Quest에서 코딩테스트로 이동했습니다." },
  }]);
  assert.deepEqual(parseCodingTestHash(replacements[0]), {
    kind: "problem",
    languageId: "java",
    slug: legacyProblem.slug,
  });
  assert.deepEqual(app.getRelatedCodeQuest(relatedProblem), {
    href: buildQuestHash("java", relatedProblem.slug),
    title: javaQuests.quests.find(({ id }) => id === relatedProblem.relatedQuestId).title,
  });
  assert.equal(app.findLegacyCodingTestProblem("java", relatedProblem.slug), null);
});

test("옛 Quest 초안은 명시적으로만 CT 배열에 복사하고 시도·완료와 원본 상태를 합치지 않는다", (t) => {
  installBrowserGlobals(t, "#/coding-tests/java/bridge-arr-03");
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(
    storage,
    () => new Date("2026-09-15T12:00:00.000Z"),
  );
  const legacyProblem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-03");
  const legacySource = "public class Solution { /* 이전 Quest 초안 */ }";
  repository.saveQuestDraft({
    questId: legacyProblem.legacyQuestId,
    languageId: "java",
    source: legacySource,
  });
  repository.recordQuestAttempt({
    questId: legacyProblem.legacyQuestId,
    questRevision: 1,
    languageId: "java",
    outcome: "passed",
    passed: 2,
    total: 2,
  });
  const before = repository.getProgress();
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    codingTestState: {
      collection: javaCodingTests,
      problem: legacyProblem,
      source: legacyProblem.starterCode,
      isRunning: false,
      legacyDraft: repository.getQuestDraft(legacyProblem.legacyQuestId),
      hasCodingTestDraft: false,
      uiError: null,
    },
    progressRepository: repository,
    cancelPendingCodingTestDraftSave() {},
    renderCodingTest() {},
  });

  assert.equal(app.importLegacyCodeQuestDraft(), true);
  const after = repository.getProgress();
  assert.equal(app.codingTestState.source, legacySource);
  assert.equal(repository.getCodingTestDraft(legacyProblem.id, 1).source, legacySource);
  assert.deepEqual(after.questDrafts, before.questDrafts);
  assert.deepEqual(after.questAttempts, before.questAttempts);
  assert.deepEqual(after.completedQuestIds, before.completedQuestIds);
  assert.deepEqual(after.completedQuestRevisions, before.completedQuestRevisions);
  assert.deepEqual(after.codingTestSubmissions, []);
  assert.deepEqual(after.completedCodingTestProblems, []);
  assert.deepEqual(storage.keys(), [PROGRESS_STORAGE_KEY]);
});

test("가져오기 버튼을 누르는 순간 생긴 CT 초안을 재확인해 덮어쓰지 않는다", (t) => {
  installBrowserGlobals(t, "#/coding-tests/java/bridge-arr-03");
  const problem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-03");
  const currentSource = "public class Solution { /* 현재 CT 초안 */ }";
  let saveCalls = 0;
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    codingTestState: {
      collection: javaCodingTests,
      problem,
      source: problem.starterCode,
      isRunning: false,
      legacyDraft: { source: "public class Solution { /* 옛 Quest 초안 */ }" },
      hasCodingTestDraft: false,
      uiError: null,
    },
    progressRepository: {
      getCodingTestDraft() {
        return { source: currentSource };
      },
      saveCodingTestDraft() { saveCalls += 1; },
    },
    cancelPendingCodingTestDraftSave() {},
    renderCodingTest() {},
  });

  assert.equal(app.importLegacyCodeQuestDraft(), false);
  assert.equal(saveCalls, 0);
  assert.equal(app.codingTestState.source, currentSource);
  assert.equal(app.codingTestState.hasCodingTestDraft, true);
});

test("Java 상세는 source-first 자료를 보존하고 검증 capability에만 JUnit 실행을 연다", () => {
  const problem = structuredClone(findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-01"));
  const maliciousSource = "</code><script>globalThis.bad = true</script>";
  problem.publicTestSource += maliciousSource;
  problem.publicTests[0].assertionSource += maliciousSource;
  const html = renderCodingTestView({
    languageName: "Java",
    collectionTitle: javaCodingTests.title,
    problem,
    source: problem.starterCode,
    evaluationKind: javaCodingTests.evaluationKind,
    executionAvailable: true,
    routeNotice: "이 문제는 Code Quest에서 코딩테스트로 이동했습니다.",
    relatedQuest: { href: "#/quest/java/bridge-arr-01", title: "기록 한 칸 바로잡기" },
  });

  assert.ok(html.indexOf("공개 테스트 소스") < html.indexOf("Java 편집기"));
  assert.match(html, /<table class="quest-example-table">/);
  assert.match(html, /원본 Test\.java 전체 보기/);
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
  assert.equal((html.match(/<summary>[123]단계 ·/g) ?? []).length, 3);
  assert.match(html, /Code Quest에서 코딩테스트로 이동/);
  assert.match(html, /관련 준비 연습:/);
  assert.doesNotMatch(html, /작성 전용/);
  assert.match(html, /data-coding-test-run/);
  assert.doesNotMatch(html, /data-coding-test-run[^>]* disabled/u);
  assert.match(html, /첫 공개 그룹 실행/);
  assert.match(html, /data-coding-test-submit/);
  assert.doesNotMatch(html, /data-coding-test-submit[^>]* disabled/u);
  assert.match(html, /전체 공개 테스트 확인/);
  assert.match(html, /data-coding-test-results/);
  assert.match(html, /첫 공개 JUnit 메서드 그룹 1개/);
  assert.match(html, /공개 그룹 2개를 모두 실행/);
  assert.match(html, /globalThis\.bad/);
  assert.doesNotMatch(html, /<script>/);

  const noHintProblem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-06");
  assert.equal(noHintProblem.hints.length, 0);
  const noHintHtml = renderCodingTestView({
    languageName: "Java",
    problem: noHintProblem,
    source: noHintProblem.starterCode,
    evaluationKind: javaCodingTests.evaluationKind,
    executionAvailable: false,
  });
  assert.doesNotMatch(noHintHtml, /coding-test-support-title|단계 ·|힌트.*(?:button|버튼)/);
  assert.match(noHintHtml, /작성 전용/);
  assert.match(noHintHtml, /data-coding-test-run[^>]* disabled/u);
  assert.match(noHintHtml, /data-coding-test-submit[^>]* disabled/u);
  assert.match(noHintHtml, /data-coding-test-results/u);
  assert.doesNotMatch(noHintHtml, /data-coding-test-cancel/u);
});

test("작성 전용 Java 문제도 로컬 연결을 안내하되 capability 전에는 실행을 비활성화한다", () => {
  const problem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-01");
  assert.equal(problem.executionMode, "draft-only");
  const html = renderCodingTestView({
    languageName: "Java",
    problem,
    source: problem.starterCode,
    evaluationKind: javaCodingTests.evaluationKind,
    executionAvailable: false,
    javaConnection: {
      message: "이 탭에서 로컬 Java 연결을 시작하세요.", canConnect: true, needsReload: false,
    },
  });
  assert.match(html, /이 탭에서 로컬 Java 연결을 시작하세요/);
  assert.match(html, /data-java-connect>로컬 Java 연결/);
  assert.match(html, /작성 전용/);
  assert.match(html, /data-coding-test-run[^>]* disabled/u);
  assert.match(html, /data-coding-test-submit[^>]* disabled/u);
  assert.match(html, /data-coding-test-results/u);
  assert.doesNotMatch(html, /data-coding-test-cancel/u);
});

test("legacy 초안은 현재 CT 초안 유무에 따라 가져오기만 숨기고 원문은 따로 보존한다", () => {
  const problem = findCodingTestProblemBySlug(javaCodingTests, "bridge-arr-03");
  const legacyDraft = { source: "public class Solution { /* legacy */ }" };
  const withoutCurrent = renderCodingTestView({
    languageName: "Java",
    problem,
    source: problem.starterCode,
    evaluationKind: javaCodingTests.evaluationKind,
    legacyDraft,
    hasCodingTestDraft: false,
  });
  const withCurrent = renderCodingTestView({
    languageName: "Java",
    problem,
    source: "public class Solution { /* current */ }",
    evaluationKind: javaCodingTests.evaluationKind,
    legacyDraft,
    hasCodingTestDraft: true,
  });

  assert.match(withoutCurrent, /data-coding-test-import-legacy-draft/);
  assert.match(withoutCurrent, /원할 때만 이전 코드를/);
  assert.doesNotMatch(withCurrent, /data-coding-test-import-legacy-draft/);
  assert.match(withCurrent, /현재 코딩테스트 초안은 그대로 유지/);
  assert.match(withCurrent, /legacy/);
  assert.match(withCurrent, /current/);
});
