import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseLessonHash, resolveLessonRoute } from "../src/core/navigation.js";
import { getReviewDocumentLesson } from "../src/core/review-navigation.js";
import { splitLessonOverview, splitMarkdownSection } from "../src/ui/markdown.js";

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const curriculum = await load("../content/curriculum.json");
const { concepts } = await load("../content/review-concepts.json");
const contracts = [
  {
    language: "javascript", prefix: "js", firstOrder: 8, sourceFolder: "03 JavaScript", verifiedAt: "2026-09-02", newQuestionCount: 42,
    keys: "values-types variables operators control-flow function-return callbacks function-effects arrays-objects iteration array-methods object-sharing shallow-copy scope-hoisting closure object-model dom-properties forms-state event-delegation event-defaults errors-input error-boundaries debugging promise-chain async-await async-state async-composition event-loop json web-storage http fetch flow-review".split(" "),
  },
  {
    language: "java", prefix: "java", firstOrder: 2, sourceFolder: "04 Java", verifiedAt: "2026-09-03", newQuestionCount: 63,
    keys: "runtime types-variables numeric-operations control-flow arrays strings methods argument-values objects constructors encapsulation packages-access static-members final-immutability equality-hashing inheritance-dispatch abstract-interfaces composition-injection generics lists sets-maps deque collection-choice exceptions resources lambdas streams date-time shared-state tasks-results test-contracts test-tools".split(" "),
  },
];

test("승인된 JS·Java 64개 단위는 목표·요약·직접답과 유효한 후속 학습·문제 연결을 가진다", async () => {
  for (const contract of contracts) {
    const collection = await load(`../content/quizzes/${contract.language}.json`);
    const lessonIds = contract.keys.map((key) => `${contract.prefix}-concept-${key}`);
    const derived = curriculum.lessons.filter((lesson) => lesson.id.startsWith(`${contract.prefix}-concept-`));
    assert.deepEqual(derived.map((lesson) => lesson.id).toSorted(), lessonIds.toSorted());
    const newQuestions = collection.questions.filter((question) => lessonIds.includes(question.lessonId));
    assert.equal(newQuestions.length, contract.newQuestionCount);
    assert.ok(newQuestions.every((question) => question.learningObjective?.trim()), contract.language);
    for (const [index, key] of contract.keys.entries()) {
      const lesson = derived.find((item) => item.id === lessonIds[index]);
      assert.equal(lesson.courseId, contract.language);
      assert.equal(lesson.languageId, contract.language);
      assert.equal(lesson.order, contract.firstOrder + index);
      assert.equal(lesson.slug, `wiki-${key}`);
      assert.equal(lesson.contentFile, `content/lessons/${contract.language}/wiki-${key}.md`);
      assert.equal(Boolean(lesson.archivedFromCatalog), false);
      assert.equal(lesson.objectives.length, 1);
      assert.ok(lesson.objectives[0].trim());
      assert.ok(lesson.summary.trim());
      assert.ok(lesson.essentialQuestion.trim());
      assert.equal(lesson.answerHeading, "핵심 질문 답");
      assert.equal(lesson.source.kind, "user-authored");
      assert.equal(lesson.source.importMode, "derived");
      assert.ok(lesson.source.originalPath.startsWith(`wiki/학습자료/밤데브 학습문서/${contract.sourceFolder}/`));
      assert.match(lesson.source.sha256, /^[a-f0-9]{64}$/);
      assert.equal(lesson.source.verifiedAt, contract.verifiedAt);
      assert.equal(lesson.source.importedAt, "2026-09-14");
      const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
      const overview = splitLessonOverview(markdown);
      assert.equal(overview.objectives, lesson.objectives[0], `${lesson.id}: 목표 불일치`);
      assert.equal(overview.summary, lesson.summary, `${lesson.id}: 요약 불일치`);
      const answer = splitMarkdownSection(markdown, lesson.answerHeading);
      assert.ok(answer.section.replace(/^## 핵심 질문 답\s*/, "").trim(), `${lesson.id}: 직접답 없음`);
      assert.doesNotMatch(answer.body, /^## 핵심 질문 답\s*$/m, `${lesson.id}: 중복 직접답`);
      for (const [, hash] of markdown.matchAll(/\]\((#\/learn\/[^)]+)\)/g)) {
        const parsed = parseLessonHash(hash);
        const target = resolveLessonRoute(curriculum, hash);
        assert.ok(parsed, hash);
        assert.equal(target?.courseId, parsed.courseId, hash);
        assert.equal(target?.slug, parsed.slug, hash);
      }
      const mappings = concepts.filter((concept) => getReviewDocumentLesson(curriculum, concept)?.id === lesson.id);
      assert.ok(collection.questions.some((question) => mappings.some((concept) => concept.lessonId === question.lessonId && concept.id === question.conceptId)), `${lesson.id}: 풀 수 있는 관련 문항 없음`);
    }
  }
});

test("보관된 JS 9개·Java 6개와 활성 runtime은 기존 깊은 URL을 계속 해석한다", () => {
  const originals = [
    ["js-notes-values", "javascript-notes", "values"],
    ["js-notes-functions", "javascript-notes", "functions"],
    ["js-notes-collections", "javascript-notes", "collections"],
    ["js-02-values-control-flow", "javascript", "values-variables-control-flow"],
    ["js-03-functions-scope-closure", "javascript", "functions-scope-closure"],
    ["js-04-collections", "javascript", "arrays-objects-built-ins"],
    ["js-05-dom-events", "javascript", "dom-and-events"],
    ["js-06-async-fetch", "javascript", "async-await-fetch"],
    ["js-07-review-practice", "javascript", "review-and-practice"],
    ["java-01-types-methods", "java", "types-and-methods"],
    ["java-02-control-flow-arrays", "java", "operators-control-flow-and-arrays"],
    ["java-03-classes-objects", "java", "classes-objects-and-encapsulation"],
    ["java-04-collections-generics", "java", "collections-generics-list-and-map"],
    ["java-05-exceptions-debugging", "java", "exceptions-and-debugging"],
    ["java-06-review-practice", "java", "review-problem-solving-and-testing"],
  ];
  for (const [id, courseId, slug] of originals) {
    const lesson = resolveLessonRoute(curriculum, `#/learn/${courseId}/${slug}`);
    assert.equal(lesson?.id, id);
    assert.equal(lesson.archivedFromCatalog, true);
  }
  const runtime = resolveLessonRoute(curriculum, "#/learn/javascript/javascript-and-runtime");
  assert.equal(runtime?.id, "js-01-runtime");
  assert.equal(Boolean(runtime.archivedFromCatalog), false);
  assert.equal(runtime.answerHeading, undefined);
});

test("복원한 Java 02~06 교안과 공식 출처 기록은 origin/dev 원문 바이트를 유지한다", async () => {
  const expectedHashes = new Map([
    ["content/lessons/java/operators-control-flow-and-arrays.md", "9fb9d02d87121a971eed784e5e69d03bf65acc10fc85036ad42449e4b243d0ea"],
    ["content/lessons/java/classes-objects-and-encapsulation.md", "9c7527ae36b618c4cd6d7fec2816d8ddbd4c765633a6888b2073433b16b5a4ea"],
    ["content/lessons/java/collections-generics-list-and-map.md", "67c2b89b706ec739c20741e636890c08288cd6a5155bbef06f97cb636486e7a5"],
    ["content/lessons/java/exceptions-and-debugging.md", "47207680c3574a0dd75ad88371f8503e505b0e01f8935d11ec17d6681f904ead"],
    ["content/lessons/java/review-problem-solving-and-testing.md", "145bb45dd6967a046b56c919cce7769f8d27e3bc2e6f9e3bb98d7529b8530732"],
    ["docs/references/java-official-sources.md", "d6efdf5eaca5792e89610c674cdace7a86c4cbbddce74fddd849ffc7669ebad3"],
  ]);

  for (const [file, expectedHash] of expectedHashes) {
    const content = await readFile(new URL(`../${file}`, import.meta.url));
    assert.equal(createHash("sha256").update(content).digest("hex"), expectedHash, file);
  }
});
