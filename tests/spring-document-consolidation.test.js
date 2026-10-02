import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveLessonRoute } from "../src/core/navigation.js";
import { getAllReviewQuestions, getReviewDocumentLesson, getTopicReviewQuestions } from "../src/core/review-navigation.js";
import { getLearningCatalogItems } from "../src/ui/learning-catalog-view.js";
import { splitLessonOverview, splitMarkdownSection } from "../src/ui/markdown.js";
import { LocalStorageProgressRepository, MemoryStorage } from "../src/repositories/progress-repository.js";

const load = async (file) => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), "utf8"));
const curriculum = await load("content/curriculum.json");
const collection = await load("content/quizzes/java.json");
const { concepts } = await load("content/review-concepts.json");
const lessons = curriculum.lessons.filter((lesson) => lesson.courseId === "spring");
const springConcepts = concepts.filter((concept) => concept.id.startsWith("spring."));
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const body = (lesson) => readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");

// 설계 r1의 처리 흐름 쌍. 기대값은 작성 본문이나 현재 metadata에서 생성하지 않는다.
const mergedInto = {
  "component-scan": "boot-start", "auto-configuration": "starters", "profiles": "external-config",
  "request-parameters": "request-mapping", "validation": "request-body", "exception-handling": "responses",
  "mvc-tests": "unit-tests", "security-request-rules": "security-filter-chain", "security-password-storage": "security-form-login",
  "jpa-entity-id": "jpa-table-keys", "jpa-save-merge": "jpa-context-states", "jpa-flush-commit": "jpa-transactions",
};
const targets = new Set(Object.values(mergedInto).map((key) => `spring-${key}`));
const archived = new Set(Object.keys(mergedInto).map((key) => `spring-${key}`));

// 02c363f473a92e8f1b21820cc199ae68e3848e24의 git blob에서 독립 산출했다.
// 실행 시 Git 이력을 요구하지 않으므로 소스 ZIP에서도 동일하게 검사한다.
test("Spring의 기존 46개 ID·URL·순서와 Java 컬렉션의 모든 문항 객체를 보존한다", () => {
  assert.equal(lessons.length, 46);
  const identity = lessons.map(({ id, slug, contentFile, order, courseId, languageId, answerHeading, source }) =>
    ({ id, slug, contentFile, order, courseId, languageId, answerHeading, sourceKind: source.kind }));
  assert.equal(hash(identity), "e6effc74ddb8cb45466500526af62e477f56532e595942e9e0c7e5c1d5c18d1c");
  assert.equal(hash(collection.questions), "be6baf310544dad7bf7e5af9cb00eff422cf02e5837f45f69d07ea3a5a6a8909");
  assert.equal(hash(springConcepts.map(({ id, lessonId, title }) => ({ id, lessonId, title }))), "57cf383dccf3428cdec950217b0353af1613621426ab3ff60cf6f999ccdcefde");
  for (const lesson of lessons) {
    assert.equal(resolveLessonRoute(curriculum, `#/learn/spring/${lesson.slug}`)?.id, lesson.id);
    assert.equal(Boolean(lesson.archivedFromCatalog), archived.has(lesson.id), lesson.id);
  }
});

test("흡수한 12개 본문은 원문 바이트를 보존하고 목록은 대표 34개와 복습 92문항을 제공한다", async () => {
  const originals = await Promise.all(Object.keys(mergedInto).map(async (key) => [key, await body(lessons.find((lesson) => lesson.slug === key))]));
  assert.equal(hash(originals), "567e5bfa8a1287faa2270f77b034127a1dea4fe4fc6a708bfe3a49a82294b10a");
  const options = { curriculum, collections: new Map([["java", collection]]), concepts, topicId: "spring" };
  const documents = getLearningCatalogItems({ ...options, kind: "learn" });
  assert.equal(documents.length, 34);
  assert.ok(documents.every((item) => !archived.has(item.lessonId)));
  const review = getLearningCatalogItems({ ...options, kind: "review" });
  assert.equal(review.reduce((sum, item) => sum + item.count, 0), 92);
  const questions = getTopicReviewQuestions(curriculum, collection, "spring");
  assert.equal(questions.length, 92);
  const allQuestions = getAllReviewQuestions(curriculum, options.collections);
  for (const question of questions) assert.equal(allQuestions.filter((item) => item.id === question.id).length, 1, question.id);
});

test("문항의 소유를 유지하며 합친 개념의 실제 절과 발췌로 이동한다", async () => {
  for (const concept of springConcepts) {
    const owner = lessons.find((lesson) => lesson.id === concept.lessonId);
    const targetId = `spring-${mergedInto[owner.slug] ?? owner.slug}`;
    const document = getReviewDocumentLesson(curriculum, concept);
    assert.equal(document?.id, targetId, concept.id);
    assert.ok(document.conceptIds.includes(concept.id), concept.id);
    if (archived.has(owner.id)) assert.equal(concept.documentLessonId, targetId);
    const markdown = await body(document);
    const headings = [...markdown.matchAll(/^(#{1,6}) (.+)$/gm)];
    const heading = headings.find((match) => match[2] === concept.heading);
    assert.ok(heading, `${concept.id}: 실제 heading 없음`);
    const next = headings.find((match) => match.index > heading.index && match[1].length <= heading[1].length);
    assert.ok(markdown.slice(heading.index + heading[0].length, next?.index ?? markdown.length).includes(concept.excerpt), concept.id);
    // profiles 발췌가 닫는 펜스만 포함해 상세 화면에 코드 펜스가 노출된 회귀를 검사한다.
    assert.equal([...concept.excerpt.matchAll(/^```[^\n]*$/gm)].length % 2, 0, `${concept.id}: 닫히지 않은 발췌 코드 블록`);
    assert.equal(collection.questions.filter((question) => question.lessonId === owner.id && question.conceptId === concept.id).length, 2, concept.id);
  }
});

test("대표의 목표와 직접답·공식 자료 및 활성 문서의 선수 연결을 확인한다", async () => {
  for (const lesson of lessons.filter((item) => !item.archivedFromCatalog)) {
    const markdown = await body(lesson);
    for (const [, link] of markdown.matchAll(/\]\((#\/learn\/[^)]+)\)/g)) {
      const target = resolveLessonRoute(curriculum, link);
      assert.equal(`#/learn/${target?.courseId}/${target?.slug}`, link, `${lesson.id}: 경로 없음`);
      assert.equal(Boolean(target.archivedFromCatalog), false, `${lesson.id}: 보관 문서 링크 ${link}`);
      assert.notEqual(target.id, lesson.id, `${lesson.id}: 자기 링크`);
    }
    const prerequisites = splitMarkdownSection(markdown, "먼저 확인할 개념").section;
    for (const [, link] of prerequisites.matchAll(/\]\((#\/learn\/[^)]+)\)/g)) {
      const prerequisite = resolveLessonRoute(curriculum, link);
      if (prerequisite.courseId === "spring") assert.ok(prerequisite.order < lesson.order, `${lesson.id}: 선수 순서 ${link}`);
    }
    if (!targets.has(lesson.id)) continue;
    const objectives = splitLessonOverview(markdown).objectives.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2).replaceAll("`", ""));
    assert.deepEqual(objectives, lesson.objectives, lesson.id);
    assert.ok(objectives.length >= 3 && objectives.length <= 4, lesson.id);
    assert.equal([...markdown.matchAll(/^## 핵심 질문 답$/gm)].length, 1, lesson.id);
    assert.ok(splitMarkdownSection(markdown, "핵심 질문 답").section.replace(/^## 핵심 질문 답\s*/, "").trim(), lesson.id);
    assert.doesNotMatch(markdown, /^## 한줄 요약$/m, lesson.id);
    const summary = splitMarkdownSection(markdown, "정리").section;
    assert.equal(summary.split("\n").filter((line) => line.startsWith("- ")).length, 3, `${lesson.id}: 정리 3줄`);
    const summaryIndex = markdown.indexOf("## 정리");
    assert.ok(summaryIndex > 0, `${lesson.id}: 정리 없음`);
    assert.match(markdown.slice(0, summaryIndex), /^---$/m, `${lesson.id}: 주제 전환 구분선 없음`);
    assert.doesNotMatch(markdown.slice(summaryIndex), /^---$/m, `${lesson.id}: 마무리 절 앞 구분선`);
    const sources = splitMarkdownSection(markdown, "공식 자료").section;
    const officialLinks = [...sources.matchAll(/\]\((https:\/\/[^)]+)\)/g)];
    assert.ok(officialLinks.length > 0 && officialLinks.length <= 3, lesson.id);
    assert.ok(officialLinks.every(([, url]) => /^(?:docs\.spring\.io|jakarta\.ee|junit\.org|docs\.junit\.org|docs\.oracle\.com)$/.test(new URL(url).hostname)), lesson.id);
  }
});

test("기존 보관 완료와 오답 이력은 대표를 자동 완료하지 않고 옛 URL로 복구한다", () => {
  for (const sourceId of archived) {
    const source = lessons.find((lesson) => lesson.id === sourceId);
    const targetId = `spring-${mergedInto[source.slug]}`;
    const question = collection.questions.find((item) => item.lessonId === sourceId);
    const storage = new MemoryStorage();
    const repository = new LocalStorageProgressRepository(storage);
    repository.setLessonCompleted(sourceId, true);
    repository.recordQuizAttempt({ languageId: "java", answers: [{ questionId: question.id, lessonId: sourceId, selectedOptionId: question.options[0].id, isCorrect: false }] });
    const restored = new LocalStorageProgressRepository(storage).getProgress();
    assert.deepEqual(restored.completedLessonIds, [sourceId]);
    assert.equal(restored.completedLessonIds.includes(targetId), false);
    assert.equal(resolveLessonRoute(curriculum, "", restored.lastLessonId)?.id, sourceId);
    assert.deepEqual(restored.incorrectQuestionIds, [question.id]);
    assert.equal(restored.quizAttempts[0].answers[0].lessonId, sourceId);
  }
});
