import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createCodeQuestCatalog, filterCodeQuestCatalogItems } from "../src/core/code-quest.js";
import {
  renderCodeQuestCatalogView,
  renderCodeQuestView,
} from "../src/ui/code-quest-view.js";

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
const javaCollection = JSON.parse(
  await readFile(new URL("../content/quests/java.json", import.meta.url), "utf8"),
);

function createCatalogFixture() {
  const [previouslyCompleted, draftInProgress] = collections.get("javascript").quests;
  const progress = {
    completedQuestIds: [previouslyCompleted.id],
    completedQuestRevisions: [],
    questAttempts: [],
    questDrafts: [
      {
        questId: draftInProgress.id,
        languageId: "javascript",
        source: "function numberPath() {}",
        updatedAt: "2026-09-14T10:00:00.000Z",
      },
    ],
  };
  const catalog = createCodeQuestCatalog(curriculum, collections, progress);
  const course = catalog.courses.find((item) => item.id === "javascript");
  return { catalog, course, previouslyCompleted, draftInProgress };
}

test("Java 실행 준비 중 목록은 네 Quest의 읽기·작성 진입을 유지한다", () => {
  const catalog = createCodeQuestCatalog(
    curriculum,
    new Map([...collections, ["java", javaCollection]]),
    {
      completedQuestIds: [],
      completedQuestRevisions: [],
      questAttempts: [],
      questDrafts: [],
    },
  );
  const course = catalog.courses.find((item) => item.id === "java");
  const html = renderCodeQuestCatalogView({
    catalog,
    course,
    items: course.items,
    filters: { courseId: "java", topicId: "all", status: "all", query: "" },
    javaExecutionAvailable: false,
  });

  assert.equal(course.totalCount, 4);
  assert.match(html, /data-quest-course="java"[^>]*[\s\S]*?<span>4개 등록 · 실행 준비 중<\/span>/);
  assert.match(html, /등록된 4개 Quest의 문제·힌트·공개 조건을 읽고 코드를 저장할 수 있습니다/);
  assert.equal((html.match(/Java 실행 준비 중 · 코드 작성·저장 가능/g) ?? []).length, 5);
  for (const item of course.items) {
    assert.match(html, new RegExp(`href="${item.href}"`));
  }
  assert.doesNotMatch(html, /aria-disabled="true"|data-quest-course="java"[^>]*disabled/);
});

test("목록은 과정·주제·상태·범위 진도와 필터 결과를 접근 가능한 이름으로 표시한다", () => {
  const { catalog, course, draftInProgress } = createCatalogFixture();
  const catalogItem = course.items.find((item) => item.id === draftInProgress.id);
  const filters = {
    courseId: course.id,
    topicId: catalogItem.topicId,
    status: "in_progress",
    query: "양방향",
    number: "99",
  };
  const items = filterCodeQuestCatalogItems(course.items, filters);
  const html = renderCodeQuestCatalogView({
    catalog,
    course,
    items,
    filters,
    notice: '<없는 번호>는 이동할 수 없습니다.',
  });

  const courseNavigation = html.match(
    /<nav class="quest-course-tabs"[^>]*>[\s\S]*?<\/nav>/,
  )?.[0] ?? "";
  assert.equal((courseNavigation.match(/data-quest-course=/g) ?? []).length, 3);
  assert.equal((courseNavigation.match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.match(
    courseNavigation,
    /data-quest-course="javascript" aria-pressed="true"/,
  );
  assert.match(
    html,
    /role="progressbar" aria-label="JavaScript Code Quest 전체 진도"[^>]*aria-valuenow="0"/,
  );
  assert.match(html, /data-quest-catalog-form role="search" aria-label="Code Quest 검색"/);
  assert.match(html, /data-quest-search value="양방향"/);
  assert.match(
    html,
    /<form data-quest-number-form aria-label="Quest 번호로 이동" novalidate>/,
    "범위 밖 번호도 앱의 구체적인 안내로 처리할 수 있어야 합니다.",
  );
  assert.match(html, /data-quest-number[^>]*value="99"/);
  assert.match(
    html,
    new RegExp(`data-quest-topic="${catalogItem.topicId}" aria-pressed="true"`),
  );
  assert.match(html, /data-quest-status="in_progress" aria-pressed="true"/);
  assert.match(html, /data-quest-result-count role="status"[^>]*>JavaScript · 1\/12개 Quest/);
  assert.match(html, /data-quest-catalog-notice role="status"[^>]*>&lt;없는 번호&gt;/);
  assert.match(html, new RegExp(`href="${catalogItem.href}"`));
  assert.match(html, /저장된 초안의 문제 버전은 확인할 수 없습니다/);
  assert.match(html, /<section class="quest-learning-map"[^>]*aria-labelledby="quest-map-title"/);
  assert.match(html, /교안에 선언된 개념과 연결된 Code Quest만 보여 줍니다/);
  assert.match(html, /href="#\/learn\/javascript\/arrays-objects-built-ins"/);
  assert.match(html, /<code>js\.arrays<\/code>/);
  assert.doesNotMatch(html, /<없는 번호>/);
});

test("결과가 없어도 입력과 필터를 보존하고 이유를 상태 텍스트로 알린다", () => {
  const { catalog, course } = createCatalogFixture();
  const filters = {
    courseId: course.id,
    topicId: "missing-topic",
    status: "completed",
    query: "찾을 수 없는 Quest",
    number: "100",
  };
  const html = renderCodeQuestCatalogView({
    catalog,
    course,
    items: filterCodeQuestCatalogItems(course.items, filters),
    filters,
    notice: "1부터 12 사이의 번호를 입력해 주세요.",
  });

  assert.match(html, /data-quest-search value="찾을 수 없는 Quest"/);
  assert.match(html, /data-quest-number[^>]*value="100"/);
  assert.match(html, /JavaScript · 0\/12개 Quest/);
  assert.match(html, /조건에 맞는 Quest가 없습니다/);
  assert.match(html, /1부터 12 사이의 번호를 입력해 주세요/);
  assert.match(html, /data-quest-catalog-reset/);
});

test("이전 완료의 문제 버전 근거를 목록·이어서·학습 지도와 상세에서 구분한다", () => {
  const [olderRevisionQuest, legacyQuest, currentRevisionQuest] =
    collections.get("javascript").quests;
  const catalog = createCodeQuestCatalog(curriculum, collections, {
    completedQuestIds: [legacyQuest.id],
    completedQuestRevisions: [
      {
        questId: olderRevisionQuest.id,
        questRevision: olderRevisionQuest.revision - 1,
        completedAt: "2026-09-13T10:00:00.000Z",
      },
      {
        questId: currentRevisionQuest.id,
        questRevision: currentRevisionQuest.revision,
        completedAt: "2026-09-14T10:00:00.000Z",
      },
    ],
    questAttempts: [],
    questDrafts: [],
  });
  const course = catalog.courses.find((item) => item.id === "javascript");
  const olderItem = course.items.find((item) => item.id === olderRevisionQuest.id);
  const legacyItem = course.items.find((item) => item.id === legacyQuest.id);
  const currentItem = course.items.find((item) => item.id === currentRevisionQuest.id);
  const olderEvidence = "문제 버전 1에서 완료";
  const legacyEvidence = "완료한 문제 버전을 확인할 수 없습니다.";
  const catalogHtml = renderCodeQuestCatalogView({
    catalog,
    course,
    items: course.items,
    filters: { courseId: course.id, topicId: "all", status: "all", query: "" },
  });

  const resume = catalogHtml.match(
    /<aside class="resume-card quest-resume-card"[\s\S]*?<\/aside>/,
  )?.[0] ?? "";
  const olderCard = catalogHtml.match(
    new RegExp(`<a class="quest-catalog-card" href="${olderItem.href}">[\\s\\S]*?</a>`),
  )?.[0] ?? "";
  const legacyCard = catalogHtml.match(
    new RegExp(`<a class="quest-catalog-card" href="${legacyItem.href}">[\\s\\S]*?</a>`),
  )?.[0] ?? "";
  const currentCard = catalogHtml.match(
    new RegExp(`<a class="quest-catalog-card" href="${currentItem.href}">[\\s\\S]*?</a>`),
  )?.[0] ?? "";
  const catalogMap = catalogHtml.match(
    /<section class="quest-learning-map"[\s\S]*?<\/section>/,
  )?.[0] ?? "";

  assert.match(resume, /이전 완료/);
  assert.ok(resume.includes(olderEvidence));
  assert.match(olderCard, /quest-status--previously_completed">이전 완료<\/span>/);
  assert.ok(olderCard.includes(olderEvidence));
  assert.match(legacyCard, /quest-status--previously_completed">이전 완료<\/span>/);
  assert.ok(legacyCard.includes(legacyEvidence));
  assert.match(currentCard, /quest-status--completed">완료<\/span>/);
  assert.equal(currentCard.includes(olderEvidence), false);
  assert.equal(currentCard.includes(legacyEvidence), false);
  assert.ok(catalogMap.includes(olderEvidence));
  assert.ok(catalogMap.includes(legacyEvidence));

  const renderDetail = (quest, catalogItem) => {
    const topic = course.topics.find((item) => item.id === catalogItem.topicId);
    return renderCodeQuestView({
      languageId: "javascript",
      languageName: "JavaScript",
      collectionTitle: collections.get("javascript").title,
      quest,
      currentIndex: catalogItem.displayOrder - 1,
      total: course.totalCount,
      source: quest.starterCode,
      catalog,
      catalogItem,
      catalogCourse: course,
      catalogTopic: topic,
      catalogHref: "#/quest",
    });
  };
  const olderDetail = renderDetail(olderRevisionQuest, olderItem);
  const legacyDetail = renderDetail(legacyQuest, legacyItem);
  const currentDetail = renderDetail(currentRevisionQuest, currentItem);
  const olderHeader = olderDetail.match(/<header class="quest-header">[\s\S]*?<\/header>/)?.[0] ?? "";
  const legacyHeader = legacyDetail.match(/<header class="quest-header">[\s\S]*?<\/header>/)?.[0] ?? "";
  const currentHeader = currentDetail.match(/<header class="quest-header">[\s\S]*?<\/header>/)?.[0] ?? "";
  const olderMap = olderDetail.match(/<section class="quest-detail-map"[\s\S]*?<\/section>/)?.[0] ?? "";
  const legacyMap = legacyDetail.match(/<section class="quest-detail-map"[\s\S]*?<\/section>/)?.[0] ?? "";
  const currentMapItem = currentDetail.match(
    new RegExp(`<a href="${currentItem.href}"[^>]*>[\\s\\S]*?</a>`),
  )?.[0] ?? "";

  assert.match(olderHeader, /class="quest-completion-badge">이전 완료<\/span>/);
  assert.ok(olderHeader.includes(olderEvidence));
  assert.ok(olderMap.includes(olderEvidence));
  assert.match(legacyHeader, /class="quest-completion-badge">이전 완료<\/span>/);
  assert.ok(legacyHeader.includes(legacyEvidence));
  assert.ok(legacyMap.includes(legacyEvidence));
  assert.match(currentHeader, /class="quest-completion-badge is-complete">완료<\/span>/);
  assert.equal(currentHeader.includes(olderEvidence), false);
  assert.equal(currentHeader.includes(legacyEvidence), false);
  assert.match(currentMapItem, / · 완료<\/a>/);
  assert.equal(currentMapItem.includes(olderEvidence), false);
  assert.equal(currentMapItem.includes(legacyEvidence), false);
});

test("상세는 과정→주제→현재 위치와 실제 문서·개념 관계, 이전 완료·초안 미상 상태를 표시한다", () => {
  const { catalog, course, previouslyCompleted } = createCatalogFixture();
  const catalogItem = course.items.find((item) => item.id === previouslyCompleted.id);
  const topic = course.topics.find((item) => item.id === catalogItem.topicId);
  catalogItem.hasDraft = true;
  catalogItem.draftSourceRevision = "unknown";

  const html = renderCodeQuestView({
    languageId: "javascript",
    languageName: "JavaScript",
    collectionTitle: collections.get("javascript").title,
    quest: previouslyCompleted,
    currentIndex: 0,
    total: course.totalCount,
    source: previouslyCompleted.starterCode,
    catalog,
    catalogItem,
    catalogCourse: course,
    catalogTopic: topic,
    catalogHref: "#/quest",
  });

  assert.match(html, /<nav class="quest-breadcrumb" aria-label="현재 Code Quest 위치">/);
  assert.match(html, /href="#\/quest">Code Quest<\/a>/);
  assert.match(html, /<span>JavaScript<\/span>[\s\S]*?<span>값·변수·연산자·제어문<\/span>/);
  assert.match(html, /<span aria-current="page">1\. 배송비 정책 계산하기<\/span>/);
  assert.match(html, /class="quest-completion-badge"[^>]*>이전 완료<\/span>/);
  assert.match(html, /저장된 초안의 문제 버전은 확인할 수 없습니다\. 코드는 그대로 보존됩니다/);
  assert.match(html, /aria-label="JavaScript Code Quest 전체 진도"/);
  assert.match(html, /aria-label="값·변수·연산자·제어문 진도"/);
  assert.match(
    html,
    /href="#\/learn\/javascript\/values-variables-control-flow">관련 학습문서 읽기<\/a>/,
  );
  assert.match(
    html,
    /<button class="text-button" type="button" data-quest-map-focus>학습 지도 보기<\/button>/,
  );
  assert.doesNotMatch(html, /href="#quest-detail-map"/);
  assert.match(
    html,
    /<section class="quest-detail-map" id="quest-detail-map" aria-labelledby="quest-detail-map-title" tabindex="-1">/,
  );
  assert.match(html, /<h2 id="quest-detail-map-title">값·변수·연산자·제어문에서 연습하는 개념<\/h2>/);
  assert.match(html, /<code>js\.operators<\/code> · <code>js\.control-flow<\/code>/);
  assert.match(
    html,
    /href="#\/quest\/javascript\/delivery-fee-policy" aria-current="page"/,
  );
});
