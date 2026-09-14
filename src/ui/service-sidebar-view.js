import { CATALOG_TOPICS } from "./learning-catalog-view.js";
import { escapeHtml, renderInlineCodeText } from "./markdown.js";
import { buildMyPageHash } from "../core/navigation.js";

export function renderServiceIcon(kind) {
  const shapes = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    learn: '<path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',
    review: '<path d="m3 6 2 2 3-4M11 6h10M3 13h5M11 13h10M3 20h5M11 20h10"/>',
    history: '<path d="M4 5h16v15H4Z"/><path d="M8 3v4M16 3v4M8 11h8M8 15h5"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  };
  return `<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[kind] ?? ""}</svg>`;
}

export function renderSidebarUtilityLink({ isCurrent = false } = {}) {
  return `<a class="sidebar-utility-link${isCurrent ? " is-current" : ""}" href="${buildMyPageHash()}"${isCurrent ? ' aria-current="page"' : ""}>${renderServiceIcon("history")}내 학습 기록</a>`;
}

export function renderSidebarSearch(query = "", results = {}) {
  return `<form class="sidebar-search desktop-navigation" data-sidebar-search-form role="search" aria-label="문서와 문제 찾기">
    <label>${renderServiceIcon("search")}<span class="sr-only">문서·문제 검색</span><input type="search" data-sidebar-search placeholder="문서·문제 검색" value="${escapeHtml(query)}" autocomplete="off" aria-controls="sidebar-search-results" aria-expanded="${Boolean(query.trim())}"></label>
    <div class="sidebar-search-results" id="sidebar-search-results"${query.trim() ? "" : " hidden"}>${query.trim() ? renderSidebarSearchResults(results) : ""}</div>
  </form>`;
}

export function renderSidebarSearchResults({ learn = [], review = [], loading = false, failures = [] } = {}) {
  const group = (items, title) => items.length ? `<section><h3>${title} · ${items.length}</h3><ul>${items.map((item) => `<li><a href="${escapeHtml(item.href)}" data-sidebar-result><span>${renderInlineCodeText(item.title)}</span><small>${escapeHtml(item.courseName)}${item.sample ? " · 샘플" : ""}</small></a></li>`).join("")}</ul></section>` : "";
  return `${loading ? '<p role="status">문제와 개념을 불러오고 있어요…</p>' : ""}
    ${failures.length ? `<p role="status">${escapeHtml(failures.join(", "))} 문제는 불러오지 못했습니다. <button type="button" class="text-button" data-sidebar-retry>다시 불러오기</button></p>` : ""}
    ${!learn.length && !review.length && !loading ? '<p role="status">검색 결과가 없어요.<br>다른 제목이나 키워드로 찾아보세요.</p>' : ""}
    ${group(learn, "학습문서")}${group(review, "객관식 문제")}`;
}

export function renderSidebarContext({ current = "home", items = [], topicId = null, activeHref = "", loading = false } = {}) {
  if (current === "home") return "";
  const isReview = current === "review";
  const selectedItems = topicId === null ? [] : items.filter((item) => topicId === "all" || item.topicId === topicId);
  const activeIndex = selectedItems.findIndex((item) => item.href === activeHref);
  const start = Math.max(0, Math.min(activeIndex - 2, selectedItems.length - 5));
  const nearby = selectedItems.slice(start, start + 5);
  const topicTitle = CATALOG_TOPICS.find((topic) => topic.id === topicId)?.title ?? "전체";
  return `<label class="sidebar-nav-label" for="sidebar-topic">주제</label>
    <select id="sidebar-topic" data-sidebar-topic><option value=""${topicId === null ? " selected" : ""}>주제 선택</option>${CATALOG_TOPICS.map((topic) => {
      const topicItems = items.filter((item) => topic.id === "all" || item.topicId === topic.id);
      const sample = topicItems.length > 0 && topicItems.every((item) => item.sample);
      return `<option value="${topic.id}"${topic.id === topicId ? " selected" : ""}${!topicItems.length && topic.id !== "all" ? " disabled" : ""}>${topic.title}${sample ? " · 샘플" : !topicItems.length && topic.id !== "all" ? topic.planned ? " · 준비 중" : loading && isReview ? " · 불러오는 중" : " · 자료 없음" : ""}</option>`;
    }).join("")}</select>
    ${topicId === null ? '<p class="sidebar-nav-empty">주제를 고르면 바로 이동할 수 있어요.</p>' : `<div class="sidebar-context-heading"><span>${isReview ? "문제 범위" : "학습문서"}</span><span>${selectedItems.length}${isReview ? "개 묶음" : "개 문서"}</span></div>
    <nav aria-label="${escapeHtml(topicTitle)} ${isReview ? "문제 바로가기" : "문서 바로가기"}"><ol class="sidebar-document-list">${nearby.map((item, index) => `<li><a href="${escapeHtml(item.href)}"${item.href === activeHref ? ' aria-current="page"' : ""}><span class="sidebar-document-number" aria-hidden="true">${String(start + index + 1).padStart(2, "0")}</span><span>${renderInlineCodeText(item.title)}</span></a></li>`).join("")}</ol></nav>
    ${!nearby.length ? `<p class="sidebar-nav-empty">${loading && isReview ? "문제를 불러오고 있어요…" : "이 주제의 자료가 없습니다."}</p>` : ""}
    <button type="button" class="sidebar-all" data-sidebar-catalog="${current}">${escapeHtml(topicTitle)} ${isReview ? "문제" : "문서"} 모두 보기 <span aria-hidden="true">→</span></button>`}`;
}

export function renderSidebarRecent(lessons = []) {
  if (!lessons.length) return "";
  return `<nav aria-label="최근 본 문서"><p class="sidebar-nav-label">최근 본 문서</p><ul>${lessons.map((lesson) => `<li><a href="${escapeHtml(lesson.href)}">${renderInlineCodeText(lesson.title)}</a></li>`).join("")}</ul></nav>`;
}
