import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLearningCatalogItems, renderLearningCatalog, renderLearningHome } from "../src/ui/learning-catalog-view.js";

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const curriculum = await load("../content/curriculum.json");
const { concepts } = await load("../content/review-concepts.json");
const collections = new Map(await Promise.all(["html", "css", "javascript", "java"].map(async (id) => [id, await load(`../content/quizzes/${id}.json`)])));
const options = { curriculum, concepts, collections };

test("홈은 학습문서와 객관식의 독립 진입을 동등하게 제공한다", () => {
  const html = renderLearningHome();
  const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "";
  assert.equal(title.replace(/<[^>]+>/g, "").trim(), "배운 개념이 내 것이 되는 곳.");
  assert.doesNotMatch(title, /<br\b|,/);
  for (const phrase of [
    "개념을 이해하는 개발 공부", "궁금한 개념은 문서로 읽고 이해한 내용은 문제로 확인하세요.",
    "지금 필요한 공부부터 바로 시작하세요!", "01 / LEARN", "개념별 학습문서", "주제별 학습문서를 통해",
    "개념을 읽고 예제를 살펴보세요.", "핵심 질문에 내 말로 답해 봅니다.", "02 / PRACTICE",
    "객관식 문제 풀어보기", "얼마나 이해했을까?", "문제를 풀고 선택한 답의 이유를 확인하세요.",
    "헷갈리는 개념은 바로 다시 읽을 수 있어요.", "읽고 이해하기", "스스로 답하기", "개념 다시 보기", "나의 속도로, 필요한 만큼",
  ]) assert.ok(html.includes(phrase), phrase);
  assert.match(html, /href="#\/learn"[^>]*>[\s\S]*?학습문서 읽기/);
  assert.match(html, /href="#\/review"[^>]*>[\s\S]*?객관식 문제 풀기/);
  assert.match(html, /궁금한 개념은 문서로 읽고 이해한 내용은 문제로 확인하세요\.<br\s*\/?>\s*지금 필요한 공부부터 바로 시작하세요!/);
  assert.match(html, /개념을 읽고 예제를 살펴보세요\.<br\s*\/?>\s*핵심 질문에 내 말로 답해 봅니다\./);
  assert.match(html, /문제를 풀고 선택한 답의 이유를 확인하세요\.<br\s*\/?>\s*헷갈리는 개념은 바로 다시 읽을 수 있어요\./);
  assert.doesNotMatch(html, /학습문서.*완료해야|target="_blank"|디자인 시안|표본 1개|이 화면에서만 유지/);
});

test("문서 목록은 활성 문서만 나열하고 보관 교안의 메타데이터와 깊은 URL은 남긴다", () => {
  const all = getLearningCatalogItems(options);
  assert.equal(curriculum.lessons.length, 182);
  assert.equal(all.length, 160);
  assert.equal(curriculum.lessons.filter((lesson) => lesson.archivedFromCatalog).length, 22);
  for (const lesson of curriculum.lessons) {
    assert.equal(all.some((item) => item.href === `#/learn/${lesson.courseId}/${lesson.slug}`), !lesson.archivedFromCatalog, lesson.id);
  }
  const htmlLessons = curriculum.lessons.filter((lesson) => lesson.courseId === "html");
  assert.equal(htmlLessons.filter((lesson) => lesson.archivedFromCatalog).length, 5);
  assert.equal(getLearningCatalogItems({ ...options, topicId: "html" }).length, 15);
  assert.equal(curriculum.lessons.filter((lesson) => lesson.courseId === "css" && lesson.archivedFromCatalog).length, 6);
  assert.equal(getLearningCatalogItems({ ...options, topicId: "css" }).length, 20);
  const java = getLearningCatalogItems({ ...options, courseId: "java" });
  assert.equal(java.length, 32);
  assert.ok(java.every((item) => !item.sample));
  assert.equal(getLearningCatalogItems({ ...options, courseId: "missing" }).length, 0);
});

test("문서와 문제 첫 화면은 검색 다음에 주제 선택을 보여 주고 아직 카드를 나열하지 않는다", () => {
  for (const kind of ["learn", "review"]) {
    const html = renderLearningCatalog({ ...options, kind });
    assert.match(html, /주제를 선택해 주세요/);
    assert.ok(html.indexOf("data-catalog-search") < html.indexOf("data-catalog-topic"));
    assert.doesNotMatch(html, /class="catalog-card"|data-catalog-course/);
    assert.deepEqual([...html.matchAll(/data-catalog-topic="([^"]+)"/g)].map((match) => match[1]),
      ["html", "css", "javascript", "java", "spring", "algorithm", "all", "cs", "typescript", "react"]);
    const selected = renderLearningCatalog({ ...options, kind, filters: { topicId: "html" } });
    assert.match(selected, /class="catalog-card"/);
    assert.ok(selected.indexOf("data-catalog-topic") < selected.indexOf('class="catalog-card"'));
    const htmlButton = selected.match(/<button\b[^>]*data-catalog-topic="html"[^>]*>/)?.[0] ?? "";
    assert.match(htmlButton, /aria-pressed="true"/);
  }
});

test("JavaScript 주제는 활성 개념 문서와 runtime을 보여 주고 보관 교안·알고리즘을 제외한다", () => {
  const javascriptLessons = curriculum.lessons.filter((lesson) => ["javascript", "javascript-notes"].includes(lesson.courseId) && !lesson.archivedFromCatalog);
  const javascript = getLearningCatalogItems({ ...options, topicId: "javascript" });
  assert.deepEqual(javascript.map((item) => item.href).sort(), javascriptLessons.map((lesson) => `#/learn/${lesson.courseId}/${lesson.slug}`).sort());
  assert.ok(javascript.some((item) => item.href.startsWith("#/learn/javascript/")));
  assert.equal(javascript.length, 33);
  assert.ok(javascript.every((item) => !item.href.startsWith("#/learn/javascript-notes/")));
  assert.ok(javascript.some((item) => item.href === "#/learn/javascript/javascript-and-runtime"));
  assert.ok(javascript.every((item) => !item.href.includes("/algorithm/")));
  const algorithm = getLearningCatalogItems({ ...options, topicId: "algorithm" });
  assert.equal(algorithm.length, 14);
  assert.ok(curriculum.lessons.filter((lesson) => lesson.courseId === "algorithm").every((lesson) => lesson.languageId === "java"));
  assert.ok(algorithm.every((item) => item.href.startsWith("#/learn/algorithm/")));
  assert.ok(getLearningCatalogItems({ ...options, topicId: "java" }).every((item) => !item.href.includes("/algorithm/")));
  const javascriptQuestions = getLearningCatalogItems({ ...options, kind: "review", topicId: "javascript" });
  assert.equal(javascriptQuestions.reduce((sum, item) => sum + item.count, 0), collections.get("javascript").questions.length);
  assert.equal(getLearningCatalogItems({ ...options, kind: "review", topicId: "algorithm" }).length, 0);
});

test("준비 중 주제와 문제 자료 없는 주제는 제공 중인 카드로 오인되지 않는다", () => {
  for (const kind of ["learn", "review"]) {
    const html = renderLearningCatalog({ ...options, kind });
    for (const id of ["cs", "typescript", "react"]) {
      const button = html.match(new RegExp(`<button\\b[^>]*data-catalog-topic="${id}"[^>]*>[\\s\\S]*?<\\/button>`))?.[0] ?? "";
      assert.match(button, /\bdisabled\b/);
      assert.match(button, /준비 중/);
    }
    const java = renderLearningCatalog({ ...options, kind, filters: { topicId: "java" } });
    assert.doesNotMatch(java, /샘플/);
    assert.match(java, /class="catalog-card"/);
  }
  const review = renderLearningCatalog({ ...options, kind: "review" });
  const algorithmButton = review.match(/<button\b[^>]*data-catalog-topic="algorithm"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";
  assert.match(algorithmButton, /자료 없음/);
  assert.doesNotMatch(review, /class="catalog-card"/);
});

test("공유 키워드와 소유별 문제 묶음은 모든 언어의 문항을 정확히 한 번 집계한다", () => {
  const items = getLearningCatalogItems({ ...options, kind: "review" });
  assert.equal(items.reduce((sum, item) => sum + item.count, 0), 284);
  for (const [languageId, collection] of collections) {
    const questionIds = items.filter((item) => item.href.split("?")[0].split("/")[2] === languageId).flatMap((item) => {
      const [route, query] = item.href.split("?");
      const ownerId = route.split("/")[3];
      const conceptId = new URLSearchParams(query).get("concept");
      const questions = collection.questions.filter((question) => (!ownerId || question.lessonId === ownerId) && (!conceptId || question.conceptId === conceptId));
      assert.equal(item.count, questions.length, item.href);
      for (const question of questions) {
        const lesson = curriculum.lessons.find((candidate) => candidate.id === question.lessonId);
        const course = curriculum.courses.find((candidate) => candidate.id === lesson.courseId);
        assert.equal(item.topicId, course.categoryId === "language" ? course.languageId : course.categoryId, question.id);
      }
      return questions.map((question) => question.id);
    });
    assert.equal(new Set(questionIds).size, questionIds.length, `${languageId}: 문항 중복 집계`);
    assert.deepEqual(questionIds.toSorted(), collection.questions.map((question) => question.id).toSorted());
  }
  for (const item of items.filter((candidate) => !candidate.href.includes("?concept="))) {
    assert.ok(curriculum.lessons.some((lesson) => lesson.title === item.title));
    assert.doesNotMatch(item.title, /(?:js|html|css|java)\.[a-z]/);
  }
});

test("Security·JPA를 포함한 Spring 문서 46개·92문항은 Java 주제와 나뉘고 같은 Java 언어 URL을 쓴다", () => {
  for (const kind of ["learn", "review"]) {
    const java = getLearningCatalogItems({ ...options, kind, topicId: "java" });
    const spring = getLearningCatalogItems({ ...options, kind, topicId: "spring" });
    assert.equal(kind === "learn" ? java.length : java.reduce((sum, item) => sum + item.count, 0), kind === "learn" ? 32 : 64);
    assert.equal(kind === "learn" ? spring.length : spring.reduce((sum, item) => sum + item.count, 0), kind === "learn" ? 46 : 92);
    assert.ok(spring.every((item) => item.topicId === "spring" && item.href.startsWith(kind === "learn" ? "#/learn/spring/" : "#/review/java/spring-")));
    assert.ok(java.every((item) => !spring.some((candidate) => candidate.href === item.href)));
    for (const [query, slug] of [
      ["컴포넌트 탐색", "component-scan"],
      ["spring.security-csrf", "security-csrf"],
      ["spring.jpa-query-methods", "jpa-query-methods"],
    ]) {
      const matched = getLearningCatalogItems({ ...options, kind, topicId: "spring", query });
      const expectedHref = kind === "learn" ? `#/learn/spring/${slug}` : `#/review/java/spring-${slug}?concept=spring.${slug}`;
      assert.ok(matched.some((item) => item.href === expectedHref), `${kind}: ${query}`);
      assert.deepEqual(getLearningCatalogItems({ ...options, kind, topicId: "java", query }), []);
      assert.deepEqual(getLearningCatalogItems({ ...options, kind, query }), matched);
    }
    const html = renderLearningCatalog({ ...options, kind, filters: { topicId: "spring" } });
    const button = html.match(/<button\b[^>]*data-catalog-topic="spring"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";
    assert.match(button, /Spring · Spring Boot/);
    assert.match(button, kind === "learn" ? /46개 문서/ : /92문제/);
    assert.doesNotMatch(button, /disabled|준비 중|자료 없음/);
    assert.doesNotMatch(html, /개별 채점/);
  }
});

test("Java 컬렉션 로드 실패는 Java·Spring 주제에 함께 표시하고 전체의 일부·전부 실패를 구분한다", () => {
  const available = new Map(collections);
  available.delete("java");
  const html = renderLearningCatalog({ ...options, kind: "review", collections: available, failedLanguages: ["Java"] });
  for (const topic of ["java", "spring"]) {
    const button = html.match(new RegExp(`<button\\b[^>]*data-catalog-topic="${topic}"[^>]*>[\\s\\S]*?<\\/button>`))?.[0] ?? "";
    assert.match(button, /disabled/);
    assert.match(button, /불러오기 실패/);
    assert.doesNotMatch(button, /자료 없음|준비 중/);
  }
  assert.match(html.match(/<button\b[^>]*data-catalog-topic="all"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "", /일부 불러오기 실패/);
  const failed = renderLearningCatalog({ ...options, kind: "review", collections: new Map(), failedLanguages: ["HTML", "CSS", "JavaScript", "Java"] });
  const allButton = failed.match(/<button\b[^>]*data-catalog-topic="all"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";
  assert.match(allButton, /불러오기 실패/);
  assert.doesNotMatch(allButton, /일부|자료 없음/);
});

test("같은 개념의 기존·신규 문항은 한 카드로 찾고 다른 개념 ID는 같은 문서에서도 구분한다", () => {
  const items = getLearningCatalogItems({ ...options, kind: "review", topicId: "javascript" });
  const variableCards = items.filter((item) => item.href.endsWith("concept=js.variables"));
  assert.equal(variableCards.length, 1);
  assert.equal(variableCards[0].href, "#/review/javascript?concept=js.variables");
  assert.equal(variableCards[0].count, 2);
  const searched = getLearningCatalogItems({ ...options, kind: "review", topicId: "javascript", query: "재대입이 필요한 이름에만" });
  assert.deepEqual(searched, variableCards, "새 문항의 단서로 검색해도 기존 문항을 포함한 전체 범위를 보여 준다.");
  const returns = items.filter((item) => /concept=js\.(function-return|functions)$/.test(item.href));
  assert.equal(returns.length, 2);
  assert.notEqual(returns[0].title, returns[1].title);
  assert.equal(returns.find((item) => item.href.endsWith("concept=js.function-return")).count, 3);
});

test("HTML 목록에서 새 개념 카드와 기존 보완 문항은 12개 문제를 각각 한 번만 가리킨다", () => {
  const items = getLearningCatalogItems({ ...options, kind: "review", topicId: "html" });
  const questions = collections.get("html").questions;
  const exposedQuestionIds = items.flatMap((item) => {
    const [route, query] = item.href.split("?");
    const lessonId = route.split("/")[3];
    const conceptId = new URLSearchParams(query).get("concept");
    const scoped = questions.filter((question) => question.lessonId === lessonId && (!conceptId || question.conceptId === conceptId));
    assert.equal(item.count, scoped.length, item.href);
    return scoped.map((question) => question.id);
  });
  assert.equal(exposedQuestionIds.length, 12);
  assert.equal(new Set(exposedQuestionIds).size, 12);
  assert.deepEqual(exposedQuestionIds.toSorted(), questions.map((question) => question.id).toSorted());
  for (const concept of concepts.filter((item) => item.id.startsWith("html.") && item.documentLessonId)) {
    const item = items.find((entry) => entry.href.endsWith(`concept=${concept.id}`));
    const target = curriculum.lessons.find((lesson) => lesson.id === concept.documentLessonId);
    assert.ok(item, concept.id);
    assert.equal(item.title, concept.title);
    assert.ok(item.summary.includes(target.title), concept.id);
  }
});

test("사용자가 아는 콜백·함수·HTML 검색어로 문서와 문제를 찾는다", () => {
  for (const kind of ["learn", "review"]) {
    const callbacks = getLearningCatalogItems({ ...options, kind, query: "  콜백  " });
    assert.ok(callbacks.some((item) => item.href === (kind === "learn" ? "#/learn/javascript/wiki-callbacks" : "#/review/javascript?concept=js.callbacks")), kind);
    assert.ok(getLearningCatalogItems({ ...options, kind, query: "함수" }).length > 0);
    assert.ok(getLearningCatalogItems({ ...options, kind, query: "hTmL" }).length > 0);
    assert.equal(getLearningCatalogItems({ ...options, kind, query: "존재하지않는검색어" }).length, 0);
  }
});

test("주제 없이 전체 검색하고 선택한 주제 안에서 같은 검색어로 좁힐 수 있다", () => {
  for (const kind of ["learn", "review"]) {
    const global = renderLearningCatalog({ ...options, kind, filters: { topicId: null, query: "콜백" } });
    assert.match(global, /class="catalog-card"/);
    assert.match(global, /callbacks/);
    assert.doesNotMatch(global, /주제를 선택해 주세요/);
    const scoped = renderLearningCatalog({ ...options, kind, filters: { topicId: "html", query: "콜백" } });
    assert.match(scoped, /검색 결과가 없어요/);
    assert.match(scoped, /data-catalog-reset/);
    assert.doesNotMatch(scoped, /class="catalog-card"/);
  }
});

test("문서 목록 끝에는 일부 자료의 밤위키 출처를 작게 안내하고 개인 출처 데이터는 내보내지 않는다", () => {
  const html = renderLearningCatalog({ ...options, filters: { topicId: "all" } });
  assert.match(html, /일부 학습문서는 밤위키/);
  assert.ok(html.indexOf("일부 학습문서는 밤위키") > html.lastIndexOf('class="catalog-card"'));
  assert.doesNotMatch(html, /profile\/|SHA-256|원문 출처/);
});

test("planned 과정이나 카테고리 아래 자료는 독립 목록에서도 숨긴다", () => {
  const planned = structuredClone(curriculum);
  planned.courses.find((course) => course.id === "html").status = "planned";
  const algorithm = planned.courses.find((course) => course.id === "algorithm");
  planned.categories.find((category) => category.id === algorithm.categoryId).status = "planned";
  for (const kind of ["learn", "review"]) {
    const items = getLearningCatalogItems({ ...options, curriculum: planned, kind });
    assert.ok(items.every((item) => !item.href.includes("/html/") && !item.href.includes("/algorithm/")));
  }
});

test("빈 검색 결과에는 초기화 동작이 있고 요청 실패는 콘텐츠 없음과 구분한다", () => {
  const html = renderLearningCatalog({ ...options, kind: "review", filters: { query: "존재하지않는검색어" }, failedLanguages: ["JavaScript"] });
  assert.match(html, /검색 결과가 없어요/);
  assert.match(html, /data-catalog-reset/);
  assert.match(html, /JavaScript 문제를 불러오지 못했습니다/);
  assert.match(html, /data-retry/);
  assert.match(html, /<label>키워드 검색<input type="search"/);
  assert.match(html, /role="status"/);
});

test("검색어·제목·요약·저장 제목은 HTML로 실행하지 않고 텍스트로 표시한다", () => {
  const unsafe = structuredClone(curriculum);
  const active = unsafe.lessons.find((lesson) => !lesson.archivedFromCatalog);
  active.title = '<script>alert("lesson")</script>';
  active.summary = '<img src=x onerror="alert(1)">';
  const html = renderLearningCatalog({ ...options, curriculum: unsafe, filters: { query: '" autofocus onfocus="alert(1)' } });
  assert.match(html, /value="&quot; autofocus onfocus=&quot;alert\(1\)"/);
  const listing = renderLearningCatalog({ ...options, curriculum: unsafe, filters: { topicId: "all" } });
  assert.match(listing, /&lt;script&gt;/);
  assert.match(listing, /&lt;img/);
  assert.doesNotMatch(listing, /<script>|<img src=x/);
  const home = renderLearningHome({ saved: { scope: { languageId: "javascript" }, questionIds: ["one"], title: "<svg onload=alert(1)>" } });
  assert.match(home, /&lt;svg/);
  assert.doesNotMatch(home, /<svg/);
});
