import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  assertValidJavaCodeQuestCollection,
  createCodeQuestExecutionRequest,
  validateJavaCodeQuestCollection,
} from "../src/core/code-quest.js";
import { javaCodeQuestSolutionFixtures } from "./fixtures/java-code-quest-solutions.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/java-code-quest.schema.json", import.meta.url), "utf8"),
);
const questsById = new Map(collection.quests.map((quest) => [quest.id, quest]));
const quest = questsById.get("quest-java-total-price");

const EXPECTED_QUEST_CONTRACTS = [
  {
    id: "quest-java-total-price",
    slug: "total-price",
    order: 1,
    lessonId: "java-concept-numeric-operations",
    conceptIds: ["java.numeric-operations"],
    entryPoint: "totalPrice",
    parameters: [["price", "int"], ["quantity", "int"], ["shippingFee", "int"]],
    returns: "long",
    observations: false,
  },
  {
    id: "quest-java-bridge-arr-01",
    slug: "bridge-arr-01",
    order: 2,
    lessonId: "java-concept-arrays",
    conceptIds: ["java.arrays"],
    entryPoint: "solve",
    parameters: [["readings", "int[]"], ["slotNumber", "int"], ["correctedValue", "int"]],
    returns: "int[]",
    observations: true,
  },
  {
    id: "quest-java-bridge-arr-02",
    slug: "bridge-arr-02",
    order: 3,
    lessonId: "java-concept-control-flow",
    conceptIds: ["java.control-flow"],
    entryPoint: "solve",
    parameters: [["values", "int[]"], ["minimum", "int"], ["maximum", "int"]],
    returns: "int",
    observations: false,
  },
  {
    id: "quest-java-bridge-que-01",
    slug: "bridge-que-01",
    order: 4,
    lessonId: "java-concept-deque",
    conceptIds: ["java.deque"],
    entryPoint: "solve",
    parameters: [["order", "int[]"]],
    returns: "int[]",
    observations: true,
  },
];

test("Java schema와 core는 네 Quest의 타입·순서·관찰 계약을 고정한다", () => {
  assert.equal(schema.properties.quests.minItems, 4);
  assert.equal(schema.properties.quests.maxItems, 73);
  assert.deepEqual(schema.$defs.quest.properties.id.enum, EXPECTED_QUEST_CONTRACTS.map(({ id }) => id));
  assert.deepEqual(schema.$defs.javaIntArgs, {
    type: "array",
    minItems: 3,
    maxItems: 3,
    items: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
  });
  assert.equal(schema.$defs.decimalLong.pattern, "^(?:0|-?[1-9][0-9]*)$");
  assert.equal(schema.$defs.example.properties.args.$ref, "#/$defs/javaIntArgs");
  assert.equal(schema.$defs.example.properties.expected.$ref, "#/$defs/decimalLong");
  assert.equal(schema.$defs.publicTest.properties.args.$ref, "#/$defs/javaIntArgs");
  assert.equal(schema.$defs.publicTest.properties.expected.$ref, "#/$defs/decimalLong");
  assert.deepEqual(schema.$defs.returnedIntArray.maxItems, 100000);
  assert.deepEqual(schema.$defs.arr01InputArray, {
    type: "array",
    minItems: 1,
    maxItems: 100,
    items: { type: "integer", minimum: -1000, maximum: 1000 },
  });
  assert.deepEqual(schema.$defs.arr02InputArray.maxItems, 1000);
  assert.deepEqual(schema.$defs.que01InputArray.maxItems, 100000);
  assert.deepEqual(schema.$defs.requiredArrayObservations, {
    type: "object",
    required: ["argument0Unchanged", "returnNotArgument0"],
    properties: {
      argument0Unchanged: { const: true },
      returnNotArgument0: { const: true },
    },
    additionalProperties: false,
  });
  assert.equal(assertValidJavaCodeQuestCollection(collection, curriculum), collection);

  assert.deepEqual(EXPECTED_QUEST_CONTRACTS.map(({ id }) => questsById.get(id)).map((candidate) => ({
    id: candidate.id,
    slug: candidate.slug,
    order: candidate.order,
    lessonId: candidate.lessonId,
    conceptIds: candidate.conceptIds,
    entryPoint: candidate.entryPoint,
    parameters: candidate.functionContract.parameters.map(({ name, type }) => [name, type]),
    returns: candidate.functionContract.returns.type,
    observations: candidate.examples.every((example) => example.observations?.argument0Unchanged === true
      && example.observations?.returnNotArgument0 === true)
      && candidate.publicTests.every((publicTest) => publicTest.observations?.argument0Unchanged === true
        && publicTest.observations?.returnNotArgument0 === true),
  })), EXPECTED_QUEST_CONTRACTS);

  const invalidCases = [
    {
      label: "배열 위치가 실제 길이를 넘음",
      mutate(candidate) { candidate.quests[1].publicTests[0].args[1] = 4; },
      expectedError: /1부터 첫 배열 길이/,
    },
    {
      label: "관찰 Quest의 필수 관찰 누락",
      mutate(candidate) { delete candidate.quests[1].examples[0].observations; },
      expectedError: /observations/,
    },
    {
      label: "비관찰 Quest에 관찰 추가",
      mutate(candidate) {
        candidate.quests[2].publicTests[0].observations = {
          argument0Unchanged: true,
          returnNotArgument0: true,
        };
      },
      expectedError: /허용되지 않은 필드.*observations/,
    },
    {
      label: "닫힌 구간의 경계 순서가 뒤집힘",
      mutate(candidate) { candidate.quests[2].publicTests[0].args = [[0], 1, 0]; },
      expectedError: /minimum ≤ maximum/,
    },
    {
      label: "Queue 배열이 최대 길이를 넘음",
      mutate(candidate) { candidate.quests[3].publicTests[0].args[0] = Array(100001).fill(0); },
      expectedError: /최대 100000개/,
    },
    {
      label: "공개 사례가 4 MiB를 넘음",
      mutate(candidate) { candidate.quests[3].publicTests[0].label = "가".repeat(1400000); },
      expectedError: /UTF-8 4194304바이트 이하/,
    },
  ];

  for (const { label, mutate, expectedError } of invalidCases) {
    const candidate = structuredClone(collection);
    mutate(candidate);
    assert.match(validateJavaCodeQuestCollection(candidate, curriculum).join("\n"), expectedError, label);
  }
});

test("Java 실행 요청은 UTF-8 20 KiB 경계와 최소 renderer DTO를 지킨다", () => {
  const exactBoundarySource = `${"가".repeat(6826)}aa`;
  assert.equal(new TextEncoder().encode(exactBoundarySource).byteLength, 20 * 1024);

  const request = createCodeQuestExecutionRequest(
    collection,
    quest,
    exactBoundarySource,
    "java-quest-boundary",
  );

  assert.deepEqual(Object.keys(request).sort(), [
    "contractVersion",
    "evaluationKind",
    "languageId",
    "questId",
    "questRevision",
    "requestId",
    "source",
    "suite",
  ]);
  assert.deepEqual(request, {
    requestId: "java-quest-boundary",
    contractVersion: 1,
    questId: "quest-java-total-price",
    questRevision: 1,
    languageId: "java",
    suite: "public",
    evaluationKind: "java-static-method-v1",
    source: exactBoundarySource,
  });
  assert.equal(Object.isFrozen(request), true);
  assert.equal("tests" in request, false);
  assert.equal("expected" in request, false);

  assert.throws(
    () => createCodeQuestExecutionRequest(
      collection,
      quest,
      `${exactBoundarySource}가`,
      "java-quest-too-large",
    ),
    /UTF-8 20480바이트 이하/,
  );
});

test("네 Java 개발 fixture는 Node 정적 모델과 공개 테스트 ID만 참조한다", () => {
  assert.deepEqual(Object.keys(javaCodeQuestSolutionFixtures), EXPECTED_QUEST_CONTRACTS.map(({ id }) => id));

  const expectedFor = (questId, args) => {
    if (questId === "quest-java-total-price") {
      const [price, quantity, shippingFee] = args;
      return String(BigInt(price) * BigInt(quantity) + BigInt(shippingFee));
    }
    if (questId === "quest-java-bridge-arr-01") {
      const [readings, slotNumber, correctedValue] = args;
      const result = [...readings];
      result[slotNumber - 1] = correctedValue;
      return result;
    }
    if (questId === "quest-java-bridge-arr-02") {
      const [values, minimum, maximum] = args;
      return values.filter((value) => value >= minimum && value <= maximum).length;
    }
    const [order] = args;
    return order.length > 0 ? [...order.slice(1), order[0]] : [];
  };

  for (const candidate of EXPECTED_QUEST_CONTRACTS.map(({ id }) => questsById.get(id))) {
    const fixture = javaCodeQuestSolutionFixtures[candidate.id];
    const publicTestIds = new Set(candidate.publicTests.map(({ id }) => id));
    assert.ok(fixture, candidate.id);
    assert.match(fixture.referenceSource, /public class Solution/);
    assert.deepEqual(fixture.expectedComplexity, candidate.functionContract.complexity);
    for (const verificationCase of fixture.verificationCases) {
      assert.deepEqual(
        verificationCase.expected,
        expectedFor(candidate.id, verificationCase.args),
        verificationCase.id,
      );
      if (candidate.id === "quest-java-bridge-arr-01" || candidate.id === "quest-java-bridge-que-01") {
        assert.deepEqual(verificationCase.observations, {
          argument0Unchanged: true,
          returnNotArgument0: true,
        });
      } else {
        assert.equal("observations" in verificationCase, false);
      }
    }
    for (const wrongSolution of fixture.representativeWrongSolutions) {
      assert.match(wrongSolution.source, /public class Solution/);
      assert.ok(wrongSolution.expectedFailingPublicTestIds.length > 0);
      assert.ok(
        wrongSolution.expectedFailingPublicTestIds.every((testId) => publicTestIds.has(testId)),
        `${wrongSolution.id}: 공개 테스트 ID만 참조해야 합니다.`,
      );
    }
  }
});
