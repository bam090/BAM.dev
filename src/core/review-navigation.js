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
  if (!owner?.conceptIds.includes(concept.id) || !document?.conceptIds.includes(concept.id) ||
      owner.languageId !== document.languageId) return null;
  if (owner.courseId === document.courseId) return document;

  const ownerCourse = curriculum.courses?.find((course) => course.id === owner.courseId);
  const documentCourse = curriculum.courses?.find((course) => course.id === document.courseId);
  return ownerCourse?.categoryId === "language" && documentCourse?.categoryId === "language" &&
    ownerCourse.languageId === owner.languageId && documentCourse.languageId === document.languageId ? document : null;
}

// Merge only when every question in this language has the same verified reading destination and topic.
export function getKeywordReviewScope(curriculum, collection, concepts, lessonId, conceptId) {
  const questions = (collection?.questions ?? []).filter((question) => question.conceptId === conceptId);
  const ownedQuestions = questions.filter((question) => question.lessonId === lessonId);
  const fallback = { lessonId, questions: ownedQuestions };
  if (!ownedQuestions.length || new Set(questions.map((question) => question.lessonId)).size < 2) return fallback;

  let documentId = null;
  let topicId = null;
  for (const question of questions) {
    const concept = concepts.find((item) => item.lessonId === question.lessonId && item.id === conceptId);
    const document = getReviewDocumentLesson(curriculum, concept);
    const owner = curriculum.lessons.find((lesson) => lesson.id === question.lessonId);
    const course = curriculum.courses.find((item) => item.id === owner?.courseId);
    if (!document || document.languageId !== collection.languageId || !course) return fallback;
    const topic = course.categoryId === "language" ? course.languageId : course.categoryId;
    if ((documentId !== null && documentId !== document.id) || (topicId !== null && topicId !== topic)) return fallback;
    documentId = document.id;
    topicId = topic;
  }
  return { lessonId: null, questions };
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
