export const DEFAULT_LANGUAGE_ID = "javascript";

export function buildLessonHash(languageId, slug) {
  return `#/learn/${encodeURIComponent(languageId)}/${encodeURIComponent(slug)}`;
}

export function parseLessonHash(hash) {
  const cleanHash = String(hash ?? "").replace(/^#/, "");
  const match = cleanHash.match(/^\/learn\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return {
      languageId: decodeURIComponent(match[1]),
      slug: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export function resolveLessonRoute(curriculum, hash, preferredLessonId = null) {
  const parsed = parseLessonHash(hash);
  const routedLesson = parsed
    ? curriculum.lessons.find(
        (lesson) => lesson.languageId === parsed.languageId && lesson.slug === parsed.slug,
      )
    : null;

  if (routedLesson) return routedLesson;

  const preferredLesson = preferredLessonId
    ? curriculum.lessons.find((lesson) => lesson.id === preferredLessonId)
    : null;
  if (preferredLesson) return preferredLesson;

  return (
    curriculum.lessons.find((lesson) => lesson.languageId === DEFAULT_LANGUAGE_ID) ??
    curriculum.lessons[0] ??
    null
  );
}

export function getAdjacentLessons(lessons, lessonId) {
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: lessons[currentIndex - 1] ?? null,
    next: lessons[currentIndex + 1] ?? null,
  };
}
