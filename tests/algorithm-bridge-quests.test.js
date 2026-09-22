import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateJavaCodeQuestCollection } from "../src/core/code-quest.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const javaCollection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);

const EXPECTED_JAVA_QUESTS = [
  ["quest-java-total-price", "total-price", 1],
  ["quest-java-bridge-arr-01", "bridge-arr-01", 2],
  ["quest-java-bridge-arr-02", "bridge-arr-02", 3],
  ["quest-java-bridge-que-01", "bridge-que-01", 4],
];

test("Algorithm Bridge 전환 뒤에도 기존 Java Quest 네 개의 ID·URL·순서를 보존한다", () => {
  assert.deepEqual(validateJavaCodeQuestCollection(javaCollection, curriculum), []);
  assert.deepEqual(
    javaCollection.quests.map(({ id, slug, order }) => [id, slug, order]),
    EXPECTED_JAVA_QUESTS,
  );
  assert.equal(javaCollection.quests.every((quest) => !("executionMode" in quest)), true);
});
