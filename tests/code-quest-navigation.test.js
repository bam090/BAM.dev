import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createCodeQuestCatalog,
  filterCodeQuestCatalogItems,
  findCodeQuestByDisplayOrder,
  getAdjacentCodeQuestCatalogItems,
  getCodeQuestResumeItem,
} from "../src/core/code-quest.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const collections = new Map(
  await Promise.all(
    ["javascript", "html", "css"].map(async (languageId) => [
      languageId,
      JSON.parse(
        await readFile(
          new URL(`../content/quests/${languageId}.json`, import.meta.url),
          "utf8",
        ),
      ),
    ]),
  ),
);

function getJavascriptQuests() {
  return collections.get("javascript").quests;
}

function createAttempt(quest, {
  revision = quest.revision,
  outcome = "wrong_answer",
  passed = 0,
  total = 3,
  completedAt,
} = {}) {
  return {
    id: `attempt-${quest.id}-${completedAt}`,
    questId: quest.id,
    questRevision: revision,
    languageId: "javascript",
    outcome,
    passed,
    total,
    completedAt,
  };
}

test("실제 Quest는 교안 관계로 과정·주제·표시 번호를 만들고 원본을 바꾸지 않는다", () => {
  const curriculumBefore = structuredClone(curriculum);
  const collectionsBefore = structuredClone(collections);
  const catalog = createCodeQuestCatalog(curriculum, collections, {});

  assert.deepEqual(
    catalog.courses.map(({ id, totalCount }) => [id, totalCount]),
    [["javascript", 9], ["css", 4], ["html", 5]],
  );
  assert.equal(catalog.items.length, 18);

  const javascript = catalog.courses.find((course) => course.id === "javascript");
  assert.deepEqual(
    javascript.items.map((item) => item.displayOrder),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
  const deliveryFee = javascript.items[0];
  assert.equal(deliveryFee.id, "quest-javascript-delivery-fee");
  assert.equal(deliveryFee.courseId, "javascript");
  assert.equal(deliveryFee.topicId, "js-02-values-control-flow");
  assert.equal(deliveryFee.lessonId, "js-02-values-control-flow");
  assert.equal(deliveryFee.lessonHref, "#/learn/javascript/values-variables-control-flow");
  assert.deepEqual(deliveryFee.conceptIds, ["js.operators", "js.control-flow"]);
  assert.equal(
    javascript.topics.find((topic) => topic.id === deliveryFee.topicId).items[0],
    deliveryFee,
  );

  assert.deepEqual(curriculum, curriculumBefore);
  assert.deepEqual(collections, collectionsBefore);
});

test("현재 PASS·현재 시도·이전 PASS·legacy 완료·revision 미상 초안을 구분한다", () => {
  const stateCollections = structuredClone(collections);
  const [
    currentPassed,
    currentAttempt,
    olderPassed,
    legacyCompleted,
    draftOnly,
    untouched,
    zeroTotalPass,
  ] = stateCollections.get("javascript").quests;
  currentAttempt.revision = 2;
  olderPassed.revision = 2;
  const progress = {
    completedQuestIds: [currentPassed.id, olderPassed.id, legacyCompleted.id],
    completedQuestRevisions: [
      {
        questId: currentPassed.id,
        questRevision: currentPassed.revision,
        completedAt: "2026-09-10T09:00:00.000Z",
      },
    ],
    questAttempts: [
      createAttempt(currentAttempt, {
        revision: 1,
        outcome: "passed",
        passed: 3,
        total: 3,
        completedAt: "2026-09-13T09:00:00.000Z",
      }),
      createAttempt(currentPassed, {
        outcome: "wrong_answer",
        completedAt: "2026-09-14T12:00:00.000Z",
      }),
      createAttempt(olderPassed, {
        revision: 1,
        outcome: "passed",
        passed: 3,
        total: 3,
        completedAt: "2026-09-12T09:00:00.000Z",
      }),
      createAttempt(currentAttempt, {
        outcome: "wrong_answer",
        completedAt: "2026-09-11T09:00:00.000Z",
      }),
      createAttempt(zeroTotalPass, {
        outcome: "passed",
        passed: 0,
        total: 0,
        completedAt: "2026-09-09T09:00:00.000Z",
      }),
    ],
    questDrafts: [
      {
        questId: draftOnly.id,
        languageId: "javascript",
        source: "// 작성 중인 원본",
        updatedAt: "2026-09-14T10:00:00.000Z",
      },
      {
        questId: olderPassed.id,
        languageId: "javascript",
        source: "// 이전 완료 뒤 작성 중",
        updatedAt: "2026-09-14T11:00:00.000Z",
      },
    ],
  };
  const items = createCodeQuestCatalog(curriculum, stateCollections, progress)
    .courses.find((course) => course.id === "javascript").items;
  const byId = new Map(items.map((item) => [item.id, item]));

  assert.deepEqual(
    ["progress", "progressEvidence", "knownPassedRevision", "hasDraft"].map(
      (key) => byId.get(currentPassed.id)[key],
    ),
    ["completed", "current_revision", currentPassed.revision, false],
  );
  assert.deepEqual(
    ["progress", "progressEvidence", "knownPassedRevision"].map(
      (key) => byId.get(currentAttempt.id)[key],
    ),
    ["in_progress", "current_revision", 1],
  );
  assert.deepEqual(
    ["progress", "progressEvidence", "knownPassedRevision", "draftSourceRevision", "hasDraft"].map(
      (key) => byId.get(olderPassed.id)[key],
    ),
    ["previously_completed", "older_revision", 1, "unknown", true],
  );
  assert.deepEqual(
    ["progress", "progressEvidence"].map((key) => byId.get(legacyCompleted.id)[key]),
    ["previously_completed", "legacy_unversioned"],
  );
  assert.deepEqual(
    ["progress", "progressEvidence", "knownPassedRevision", "draftSourceRevision", "hasDraft"].map(
      (key) => byId.get(draftOnly.id)[key],
    ),
    ["in_progress", "none", null, "unknown", true],
  );
  assert.deepEqual(
    ["progress", "progressEvidence", "draftSourceRevision", "hasDraft"].map(
      (key) => byId.get(untouched.id)[key],
    ),
    ["not_started", "none", "none", false],
  );
  assert.deepEqual(
    ["progress", "progressEvidence"].map((key) => byId.get(zeroTotalPass.id)[key]),
    ["in_progress", "current_revision"],
    "0/0인 passed 결과는 완료 증거가 아닙니다.",
  );

  const javascript = createCodeQuestCatalog(curriculum, stateCollections, progress)
    .courses.find((course) => course.id === "javascript");
  assert.equal(javascript.completedCount, 1);
  assert.equal(javascript.totalCount, 9);
  assert.equal(
    javascript.resumeItem.id,
    draftOnly.id,
    "배열 위치와 관계없이 가장 최근 활동이 있는 진행 중 Quest를 이어갑니다.",
  );
});

test("이어서 풀기는 최근 진행 중 항목을 고르고 동률·완료 뒤에는 표시 순을 쓴다", () => {
  const items = [
    { id: "quest-one", displayOrder: 1, progress: "completed", recentActivityAt: 50 },
    { id: "quest-two", displayOrder: 2, progress: "in_progress", recentActivityAt: 100 },
    { id: "quest-three", displayOrder: 3, progress: "in_progress", recentActivityAt: 300 },
    { id: "quest-four", displayOrder: 4, progress: "not_started", recentActivityAt: null },
  ];
  assert.equal(getCodeQuestResumeItem(items).id, "quest-three");

  const tied = items.map((item) =>
    item.progress === "in_progress" ? { ...item, recentActivityAt: null } : item,
  );
  assert.equal(getCodeQuestResumeItem(tied).id, "quest-two");
  assert.equal(
    getCodeQuestResumeItem(items.map((item) => ({ ...item, progress: "completed" }))).id,
    "quest-one",
  );
});

test("검색·주제·상태 필터를 함께 적용하고 번호 이동과 다음 Quest는 전체 과정 순서를 쓴다", () => {
  const javascript = createCodeQuestCatalog(curriculum, collections, {
    questDrafts: [
      {
        questId: "quest-javascript-number-path",
        languageId: "javascript",
        source: "function numberPath() {}",
        updatedAt: "2026-09-14T10:00:00.000Z",
      },
    ],
  }).courses.find((course) => course.id === "javascript");
  const numberPath = javascript.items.find(
    (item) => item.id === "quest-javascript-number-path",
  );

  assert.deepEqual(
    filterCodeQuestCatalogItems(javascript.items, {
      query: "  양방향  ",
      topicId: numberPath.topicId,
      status: "in_progress",
    }).map((item) => item.id),
    [numberPath.id],
  );
  assert.equal(
    filterCodeQuestCatalogItems(javascript.items, { query: "2" })
      .some((item) => item.id === numberPath.id),
    true,
  );
  assert.deepEqual(
    filterCodeQuestCatalogItems(javascript.items, { topicId: "missing-topic" }),
    [],
  );

  const hiddenByFilter = filterCodeQuestCatalogItems(javascript.items, {
    status: "completed",
  });
  assert.equal(hiddenByFilter.includes(numberPath), false);
  assert.equal(findCodeQuestByDisplayOrder(javascript.items, "2"), numberPath);
  assert.equal(findCodeQuestByDisplayOrder(javascript.items, "2.5"), null);
  assert.equal(findCodeQuestByDisplayOrder(javascript.items, 0), null);

  assert.equal(
    getAdjacentCodeQuestCatalogItems(javascript.items, numberPath.id).next,
    javascript.items[2],
  );
  assert.equal(
    getAdjacentCodeQuestCatalogItems(javascript.items, javascript.items.at(-1).id).next,
    null,
  );
  assert.deepEqual(
    getAdjacentCodeQuestCatalogItems(javascript.items, "quest-missing"),
    { previous: null, next: null },
  );
});

test("검증되지 않은 교안·과정·개념 관계로 학습 지도를 만들지 않는다", () => {
  const invalidCollections = structuredClone(collections);
  invalidCollections.get("javascript").quests[0].conceptIds = ["js.not-real"];

  assert.throws(
    () => createCodeQuestCatalog(curriculum, invalidCollections, {}),
    /검증된 과정·교안·개념 연결을 만들 수 없습니다/,
  );
});
