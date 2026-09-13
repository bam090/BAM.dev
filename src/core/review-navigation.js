import { buildLessonHash, buildReviewHash } from "./navigation.js";

export function getReviewRouteOptions(hash) {
  const query = String(hash ?? "").split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  return {
    conceptId: params.get("concept") || null,
    returnToken: params.get("review") || null,
    heading: params.get("section") || null,
  };
}

export function buildKeywordReviewHash(languageId, lessonId = null, conceptId = null) {
  const hash = buildReviewHash(languageId, lessonId);
  return conceptId ? `${hash}?concept=${encodeURIComponent(conceptId)}` : hash;
}

export function buildReviewLessonHash(lesson, token, heading = null) {
  const params = new URLSearchParams({ review: token });
  if (heading) params.set("section", heading);
  return `${buildLessonHash(lesson.courseId, lesson.slug)}?${params}`;
}

// A question keeps its original owner; only the reading destination may change.
export function getReviewDocumentLesson(curriculum, concept) {
  if (!concept) return null;
  const owner = curriculum.lessons.find((lesson) => lesson.id === concept.lessonId);
  const documentId = concept.documentLessonId ?? concept.lessonId;
  const document = curriculum.lessons.find((lesson) => lesson.id === documentId);
  return owner?.conceptIds.includes(concept.id) && document?.conceptIds.includes(concept.id) &&
    owner.courseId === document.courseId && owner.languageId === document.languageId ? document : null;
}

export function validateReviewConcepts(data, curriculum) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.concepts)) return [];
  const seen = new Set();
  return data.concepts.filter((concept) => {
    if (!concept || ![concept.id, concept.title, concept.lessonId, concept.heading, concept.excerpt]
      .every((value) => typeof value === "string" && value.trim().length > 0)) return false;
    const key = `${concept.lessonId}:${concept.id}`;
    if (concept.documentLessonId !== undefined &&
        (typeof concept.documentLessonId !== "string" || !concept.documentLessonId.trim())) return false;
    if (!getReviewDocumentLesson(curriculum, concept) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
