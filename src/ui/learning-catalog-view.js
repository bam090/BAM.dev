import { buildLessonHash } from "../core/navigation.js";
import { buildKeywordReviewHash, getReviewDocumentLesson } from "../core/review-navigation.js";
import { escapeHtml, renderInlineCodeText } from "./markdown.js";

const CATALOG_TOPICS = [
  { id: "html", title: "HTML" },
  { id: "css", title: "CSS" },
  { id: "javascript", title: "JavaScript" },
  { id: "java", title: "Java" },
  { id: "algorithm", title: "알고리즘" },
  { id: "all", title: "전체" },
  { id: "spring", title: "Spring", planned: true },
  { id: "cs", title: "CS", planned: true },
  { id: "typescript", title: "TypeScript", planned: true },
  { id: "react", title: "React", planned: true },
];

function getCourseTopic(course) {
  return course.categoryId === "language" ? course.languageId : course.categoryId;
}

export function renderReviewResume(saved) {
  if (!saved?.scope || !saved.questionIds?.length) return "";
  const href = buildKeywordReviewHash(saved.scope.languageId, saved.scope.lessonId, saved.scope.conceptId);
  return `<aside class="resume-card" aria-label="저장된 풀이">
    <div><strong>${saved.screen === "result" ? "마지막 풀이 결과" : "이어서 풀 수 있어요"}</strong><p>${escapeHtml(saved.title ?? "객관식 문제")} · ${saved.gradedQuestionIds?.length ?? 0}/${saved.questionIds.length}문제 채점</p></div>
    <a class="button button--secondary" href="${escapeHtml(href)}">${saved.screen === "result" ? "결과 확인" : "이어서 풀기"}</a>
  </aside>`;
}

export function renderLearningHome({ saved = null } = {}) {
  return `<main class="main-area service-main" id="lesson-content" tabindex="-1">
    <section class="service-intro"><p class="eyebrow">개념을 이해하는 개발 공부</p><h1>배운 개념이 <span>내 것이 되는 곳.</span></h1><p>궁금한 개념은 문서로 읽고 이해한 내용은 문제로 확인하세요.<br>지금 필요한 공부부터 바로 시작하세요!</p></section>
    <div class="service-cards">
      <article class="service-card"><span class="service-card-number">01 / LEARN</span><h2>개념별 학습문서</h2><p><span class="service-card-intro">주제별 학습문서를 통해</span>개념을 읽고 예제를 살펴보세요.<br>핵심 질문에 내 말로 답해 봅니다.</p><a class="button button--primary" href="#/learn">학습문서 읽기 <span aria-hidden="true">↗</span></a></article>
      <article class="service-card"><span class="service-card-number">02 / PRACTICE</span><h2>객관식 문제 풀어보기</h2><p><span class="service-card-intro">얼마나 이해했을까?</span>문제를 풀고 선택한 답의 이유를 확인하세요.<br>헷갈리는 개념은 바로 다시 읽을 수 있어요.</p><a class="button button--secondary" href="#/review">객관식 문제 풀기 <span aria-hidden="true">↗</span></a></article>
    </div>
    <div class="service-study-path"><span>읽고 이해하기 <span aria-hidden="true">→</span> 스스로 답하기 <span aria-hidden="true">→</span> 개념 다시 보기</span><span>나의 속도로, 필요한 만큼</span></div>
    ${renderReviewResume(saved)}
  </main>`;
}

export function getLearningCatalogItems({ curriculum, collections = new Map(), concepts = [], kind = "learn", courseId = "all", topicId = "all", query = "" }) {
  const allowedCourses = curriculum.courses.filter((course) => course.status !== "planned" &&
    curriculum.categories.some((category) => category.id === course.categoryId && category.status !== "planned") &&
    (topicId === "all" || getCourseTopic(course) === topicId));
  const search = query.trim().toLocaleLowerCase("ko");
  return curriculum.lessons.filter((lesson) => allowedCourses.some((course) => course.id === lesson.courseId) &&
    (kind !== "learn" || !lesson.archivedFromCatalog) &&
    (courseId === "all" || lesson.courseId === courseId)).flatMap((lesson) => {
    const course = allowedCourses.find((item) => item.id === lesson.courseId);
    const collection = collections.get(lesson.languageId);
    const questions = (collection?.questions ?? []).filter((question) => question.lessonId === lesson.id);
    const related = concepts.filter((concept) => kind === "learn"
      ? getReviewDocumentLesson(curriculum, concept)?.id === lesson.id
      : concept.lessonId === lesson.id);
    const labels = related.map((concept) => concept.title);
    if (kind === "learn") {
      const matches = [course.name, lesson.title, lesson.summary, ...labels, ...related.map((concept) => concept.excerpt), ...lesson.conceptIds].join(" ").toLocaleLowerCase("ko").includes(search);
      return matches ? [{ title: lesson.title, summary: lesson.summary, courseName: course.name, topicId: getCourseTopic(course), sample: course.status === "sample", href: buildLessonHash(lesson.courseId, lesson.slug), count: lesson.estimatedMinutes, labels }] : [];
    }
    if (questions.length && related.length === 0) {
      if (![lesson.title, lesson.summary, course.name, ...lesson.conceptIds].join(" ").toLocaleLowerCase("ko").includes(search)) return [];
      return [{ title: lesson.title, summary: lesson.summary, courseName: course.name, topicId: getCourseTopic(course), sample: course.status === "sample", href: buildKeywordReviewHash(lesson.languageId, lesson.id), count: questions.length, labels: [] }];
    }
    return [...new Set(questions.map((question) => question.conceptId))].flatMap((conceptId) => {
      const concept = related.find((item) => item.id === conceptId);
      const title = concept?.title ?? lesson.title;
      const document = getReviewDocumentLesson(curriculum, concept) ?? lesson;
      if (![title, course.name, lesson.title, conceptId, concept?.excerpt ?? "", ...questions.filter((question) => question.conceptId === conceptId).map((question) => question.prompt)].join(" ").toLocaleLowerCase("ko").includes(search)) return [];
      return [{ title, summary: concept ? `관련 학습문서: ${document.title}` : "관련 학습문서의 설명과 함께 확인할 수 있어요.", courseName: course.name, topicId: getCourseTopic(course), sample: course.status === "sample", href: buildKeywordReviewHash(lesson.languageId, lesson.id, conceptId), count: questions.filter((question) => question.conceptId === conceptId).length, labels: [] }];
    });
  });
}

export function renderLearningCatalog({ curriculum, collections = new Map(), concepts = [], kind = "learn", filters = {}, saved = null, failedLanguages = [] }) {
  const isReview = kind === "review";
  const topicId = filters.topicId ?? null;
  const query = filters.query ?? "";
  const hasSelection = topicId !== null || query.trim() !== "";
  const allItems = getLearningCatalogItems({ curriculum, collections, concepts, kind });
  const items = hasSelection ? getLearningCatalogItems({ curriculum, collections, concepts, kind, ...filters, topicId: topicId ?? "all" }) : [];
  const selectedTopic = CATALOG_TOPICS.find((topic) => topic.id === topicId);
  const topicButtons = CATALOG_TOPICS.map((topic) => {
    const topicItems = topic.id === "all" ? allItems : allItems.filter((item) => item.topicId === topic.id);
    const count = isReview ? topicItems.reduce((sum, item) => sum + item.count, 0) : topicItems.length;
    const sample = topicItems.length > 0 && topicItems.every((item) => item.sample);
    const failed = isReview && curriculum.languages.some((language) => language.id === topic.id && failedLanguages.includes(language.name));
    const status = failed ? "불러오기 실패" : count ? `${count}${isReview ? "문제" : "개 문서"}${sample ? " · 샘플" : ""}` : topic.planned ? "준비 중" : "자료 없음";
    return `<button class="catalog-topic" type="button" data-catalog-topic="${topic.id}" aria-pressed="${topic.id === topicId}"${count === 0 && topic.id !== "all" ? " disabled" : ""}><strong>${topic.title}</strong><span>${status}</span>${topic.id === topicId ? '<span class="catalog-topic-selected">선택됨</span>' : ""}</button>`;
  }).join("");
  return `<main class="main-area service-main" id="lesson-content" tabindex="-1">
    <header class="catalog-header"><p class="eyebrow">${isReview ? "바로 풀고, 개념을 확인하세요" : "궁금한 개념부터 읽어 보세요"}</p><h1>${isReview ? "객관식 문제" : "학습문서"}</h1><p>${isReview ? "주제를 고른 뒤 키워드별 문제를 풀어보세요. 풀이 중에도 관련 학습문서를 확인할 수 있어요." : "배우고 싶은 주제를 고르거나 키워드로 필요한 학습자료를 찾아보세요."}</p></header>
    ${isReview ? renderReviewResume(saved) : ""}
    <form class="catalog-filters" data-catalog-form role="search" aria-label="키워드 찾기">
      <label>키워드 검색<input type="search" data-catalog-search value="${escapeHtml(query)}" placeholder="함수, 배열, HTML…" autocomplete="off"></label>
      <button type="submit" class="button button--secondary">찾기</button>
      ${hasSelection ? '<button type="button" class="text-button" data-catalog-reset>검색 초기화</button>' : ""}
      <p class="catalog-search-scope">${selectedTopic && selectedTopic.id !== "all" ? `${selectedTopic.title}에서 검색합니다. 다른 주제도 찾으려면 전체를 선택하세요.` : "전체 학습자료에서 검색합니다."}</p>
    </form>
    <section class="catalog-topics" aria-labelledby="catalog-topics-title"><h2 id="catalog-topics-title">주제 선택</h2><div class="catalog-topic-options">${topicButtons}</div></section>
    ${failedLanguages.length ? `<p class="catalog-notice" role="status">${escapeHtml(failedLanguages.join(", "))} 문제를 불러오지 못했습니다. <button type="button" class="text-button" data-retry>다시 불러오기</button></p>` : ""}
    ${hasSelection ? `<p class="catalog-count" role="status">${selectedTopic?.title ?? "전체"} · ${items.length}${isReview ? `개 문제 묶음 · ${items.reduce((sum, item) => sum + item.count, 0)}문제 · 개별 채점` : "개 문서"}</p>` : ""}
    ${items.length ? `<div class="catalog-grid">${items.map((item) => `<a class="catalog-card" href="${escapeHtml(item.href)}"><div class="eyebrow">${escapeHtml(item.courseName)}${item.sample ? " · 샘플" : ""}</div><h2>${renderInlineCodeText(item.title)}</h2><p>${escapeHtml(item.summary)}</p>${item.labels.length ? `<p class="catalog-keywords">${item.labels.map(renderInlineCodeText).join(" · ")}</p>` : ""}<span class="catalog-card-action">${item.count}${isReview ? "문제 풀기" : "분 · 문서 읽기"} <span aria-hidden="true">→</span></span></a>`).join("")}</div>` : hasSelection ? `<section class="catalog-empty"><h2>검색 결과가 없어요.</h2><p>다른 키워드로 찾거나 주제 선택을 바꿔 보세요.</p></section>` : `<section class="catalog-empty"><h2>주제를 선택해 주세요.</h2><p>위에서 배우고 싶은 주제를 고르면 ${isReview ? "문제 묶음이" : "학습문서가"} 보여요.<br>키워드 검색으로 바로 시작할 수도 있어요.</p></section>`}
    ${isReview ? "" : '<footer class="catalog-source-note">일부 학습문서는 밤위키 학습자료를 바탕으로 작성했습니다.</footer>'}
  </main>`;
}
