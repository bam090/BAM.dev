import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertValidCodeQuestCollection,
  createCodeQuestExecutionRequest,
  findCodeQuestBySlug,
  getAdjacentCodeQuests,
  getCodeQuestsInOrder,
  loadCodeQuestCollection,
  validateCodeQuestCollection,
} from "../src/core/code-quest.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collection = JSON.parse(
  await readFile(new URL("../content/quests/javascript.json", import.meta.url), "utf8"),
);

test("실제 JavaScript Code Quest 컬렉션을 승인한다", () => {
  assert.deepEqual(validateCodeQuestCollection(collection, curriculum), []);
  assert.equal(assertValidCodeQuestCollection(collection, curriculum), collection);
});

test("런타임 컬렉션 검증은 특정 언어 ID에 종속되지 않는다", () => {
  const neutralCollection = structuredClone(collection);
  neutralCollection.languageId = "sample-lang";
  neutralCollection.title = "Sample Code Quest";
  neutralCollection.quests = [neutralCollection.quests[0]];
  neutralCollection.quests[0].id = "quest-sample-lang-delivery-fee";
  neutralCollection.quests[0].lessonId = "sample-01-flow";
  neutralCollection.quests[0].conceptIds = ["sample.control-flow"];
  neutralCollection.quests[0].entryPoint = "return";
  const neutralCurriculum = {
    lessons: [
      {
        id: "sample-01-flow",
        languageId: "sample-lang",
        conceptIds: ["sample.control-flow"],
      },
    ],
  };

  assert.deepEqual(validateCodeQuestCollection(neutralCollection, neutralCurriculum), []);
});

test("JavaScript entryPoint는 채점 계약과 같이 예약어를 거부한다", () => {
  const invalid = structuredClone(collection);
  invalid.quests[0].entryPoint = "return";

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(
    errors.some(
      (error) => error.includes("entryPoint") && error.includes("JavaScript 채점 계약"),
    ),
  );
  assert.throws(
    () => assertValidCodeQuestCollection(invalid, curriculum),
    /entryPoint[\s\S]*JavaScript 채점 계약/,
  );
});

test("언어 경로를 제한하고 fetch 결과를 검증해 불러온다", async () => {
  const requestedUrls = [];
  const loaded = await loadCodeQuestCollection("javascript", curriculum, async (url) => {
    requestedUrls.push(url);
    return { ok: true, status: 200, async json() { return structuredClone(collection); } };
  });

  assert.deepEqual(requestedUrls, ["./content/quests/javascript.json"]);
  assert.equal(loaded.languageId, "javascript");
  await assert.rejects(
    () => loadCodeQuestCollection("../javascript", curriculum, async () => ({ ok: true })),
    /허용되지 않은/,
  );
});

test("slug 조회와 order 기반 이전·다음 탐색이 입력 배열을 바꾸지 않는다", () => {
  const reversed = [...collection.quests].reverse();
  const originalIds = reversed.map((quest) => quest.id);
  const selected = findCodeQuestBySlug(reversed, "number-path");
  const ordered = getCodeQuestsInOrder(reversed);
  const adjacent = getAdjacentCodeQuests(reversed, selected.id);

  assert.equal(selected.id, "quest-javascript-number-path");
  assert.deepEqual(reversed.map((quest) => quest.id), originalIds);
  assert.deepEqual(ordered.map((quest) => quest.order), [1, 2, 3, 4, 5]);
  assert.equal(adjacent.previous.order, 1);
  assert.equal(adjacent.next.order, 3);
  assert.deepEqual(getAdjacentCodeQuests(reversed, "quest-missing"), {
    previous: null,
    next: null,
  });
});

test("추가 필드, 경로형 ID, 중복 순서와 깨진 교안·개념 연결을 거부한다", () => {
  const invalid = structuredClone(collection);
  invalid.extra = true;
  invalid.quests[0].id = "quest-javascript-../../escape";
  invalid.quests[0].extra = true;
  invalid.quests[1].order = invalid.quests[0].order;
  invalid.quests[1].lessonId = "js-missing";
  invalid.quests[2].conceptIds[0] = "js.unknown";
  invalid.quests[2].publicTests[0].extra = true;

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("컬렉션에 허용되지 않은 필드")));
  assert.ok(errors.some((error) => error.includes("languageId로 네임스페이스")));
  assert.ok(errors.some((error) => error.includes("order가 중복")));
  assert.ok(errors.some((error) => error.includes("존재하지 않는 교안")));
  assert.ok(errors.some((error) => error.includes("연결된 교안에 없습니다")));
  assert.ok(errors.filter((error) => error.includes("허용되지 않은 필드")).length >= 3);
});

test("Quest order는 컬렉션 배열에서 1부터 빈틈없이 이어져야 한다", () => {
  const invalid = structuredClone(collection);
  invalid.quests[2].order = 99;

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("order") && error.includes("1부터")));
});

test("예제와 공개 테스트의 args 수는 함수 계약의 매개변수 수와 같아야 한다", () => {
  const invalid = structuredClone(collection);
  invalid.quests[0].examples[0].args.pop();
  invalid.quests[0].publicTests[0].args.pop();

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(
    errors.some(
      (error) =>
        error.includes("examples[0].args") && error.includes("매개변수") && error.includes("3개"),
    ),
  );
  assert.ok(
    errors.some(
      (error) =>
        error.includes("publicTests[0].args") &&
        error.includes("매개변수") &&
        error.includes("3개"),
    ),
  );
});

test("서로 다른 Quest도 같은 public test ID를 공유할 수 없다", () => {
  const invalid = structuredClone(collection);
  const duplicatedTestId = invalid.quests[0].publicTests[0].id;
  invalid.quests[1].publicTests[0].id = duplicatedTestId;
  invalid.quests[1].failureExplanations[0].testId = duplicatedTestId;

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(
    errors.some(
      (error) => error.includes("공개 테스트 ID") && error.includes("컬렉션 전체") && error.includes(duplicatedTestId),
    ),
  );
});

test("공개 테스트와 실패 설명의 1:1 연결 및 힌트 단계를 검증한다", () => {
  const invalid = structuredClone(collection);
  invalid.quests[0].failureExplanations[0].testId = "unknown-public-test";
  invalid.quests[0].hints[0].level = 2;
  invalid.quests[0].hints[1].stage = "implementation";
  invalid.quests[0].hints[2].stage = "observation";

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("실패 설명이 없습니다")));
  assert.ok(errors.some((error) => error.includes("존재하지 않는 공개 테스트")));
  assert.ok(errors.some((error) => error.includes("level은 배열 순서")));
  assert.ok(errors.some((error) => error.includes("concept → observation → implementation")));
});

test("예제와 공개 테스트 입력·기대값에서 JSON 비호환 값을 거부한다", () => {
  const invalid = structuredClone(collection);
  const circular = {};
  circular.self = circular;
  invalid.quests[0].examples[0].expected = Number.NaN;
  invalid.quests[0].publicTests[0].args = [1n];
  invalid.quests[0].publicTests[1].expected = circular;

  const errors = validateCodeQuestCollection(invalid, curriculum);
  assert.ok(errors.some((error) => error.includes("유한한 number")));
  assert.ok(errors.some((error) => error.includes("bigint 값")));
  assert.ok(errors.some((error) => error.includes("순환 참조")));
});

test("실행 요청에는 공개 테스트 실행 필드만 독립된 스냅샷으로 전달한다", () => {
  const executionCollection = structuredClone(collection);
  const quest = executionCollection.quests[0];
  const before = structuredClone(executionCollection);
  const request = createCodeQuestExecutionRequest(
    executionCollection,
    quest,
    quest.starterCode,
    "run-code-quest-001",
  );

  assert.deepEqual(Object.keys(request).sort(), [
    "contractVersion",
    "entryPoint",
    "languageId",
    "questId",
    "questRevision",
    "requestId",
    "source",
    "suite",
    "tests",
  ]);
  assert.equal(request.contractVersion, 1);
  assert.equal(request.suite, "public");
  assert.equal(request.questId, quest.id);
  assert.notEqual(request.tests, quest.publicTests);
  assert.equal(request.tests.length, quest.publicTests.length);
  for (const [index, publicTest] of request.tests.entries()) {
    assert.deepEqual(Object.keys(publicTest).sort(), ["args", "expected", "id", "label"]);
    assert.notEqual(publicTest, quest.publicTests[index]);
    assert.notEqual(publicTest.args, quest.publicTests[index].args);
    assert.equal("failureExplanation" in publicTest, false);
    assert.equal("hints" in publicTest, false);
  }
  assert.equal("failureExplanations" in request, false);
  assert.equal("hints" in request, false);
  assert.deepEqual(executionCollection, before);

  const firstInput = structuredClone(request.tests[0].args);
  quest.publicTests[0].args[0] = "원본 후속 변경";
  quest.failureExplanations[0].message = "콘텐츠 후속 변경";
  assert.deepEqual(request.tests[0].args, firstInput);
  assert.equal(Object.isFrozen(request.tests[0].args), true);
});

test("컬렉션에 없는 quest는 실행 요청으로 만들지 않는다", () => {
  assert.throws(
    () =>
      createCodeQuestExecutionRequest(
        collection,
        { ...collection.quests[0], id: "quest-javascript-not-in-collection" },
        "function solve() {}",
        "run-code-quest-002",
      ),
    /컬렉션에 속하지 않습니다/,
  );
});
