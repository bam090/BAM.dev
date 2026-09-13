export const DEFAULT_LANGUAGE_ID = "javascript";
export const DEFAULT_COURSE_ID = "javascript";

export function buildLessonHash(courseId, slug) {
  return `#/learn/${encodeURIComponent(courseId)}/${encodeURIComponent(slug)}`;
}

export function buildReviewHash(languageId, lessonId = null) {
  const lessonPath = lessonId ? `/${encodeURIComponent(lessonId)}` : "";
  return `#/review/${encodeURIComponent(languageId)}${lessonPath}`;
}

export function buildQuestHash(languageId, slug) {
  return `#/quest/${encodeURIComponent(languageId)}/${encodeURIComponent(slug)}`;
}

export function buildCodingTestListHash() {
  return "#/coding-tests";
}

export function buildCodingTestHash(languageId, slug) {
  return `#/coding-tests/${encodeURIComponent(languageId)}/${encodeURIComponent(slug)}`;
}

export function buildWebProjectListHash() {
  return "#/web-projects";
}

export function buildWebProjectHash(slug) {
  return `#/web-projects/${encodeURIComponent(slug)}`;
}

export function parseLessonHash(hash) {
  const cleanHash = String(hash ?? "").split("?")[0].replace(/^#/, "");
  const match = cleanHash.match(/^\/learn\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return {
      courseId: decodeURIComponent(match[1]),
      slug: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export function parseReviewHash(hash) {
  const cleanHash = String(hash ?? "").split("?")[0].replace(/^#/, "");
  const match = cleanHash.match(/^\/review\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (!match) return null;

  try {
    return {
      languageId: decodeURIComponent(match[1]),
      ...(match[2] ? { lessonId: decodeURIComponent(match[2]) } : {}),
    };
  } catch {
    return null;
  }
}

export function parseQuestHash(hash) {
  const cleanHash = String(hash ?? "").replace(/^#/, "");
  const match = cleanHash.match(/^\/quest\/([^/]+)\/([^/]+)\/?$/);
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

export function parseCodingTestHash(hash) {
  const cleanHash = String(hash ?? "").replace(/^#/, "");
  if (/^\/coding-tests\/?$/.test(cleanHash)) return { kind: "list" };

  const match = cleanHash.match(/^\/coding-tests\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return {
      kind: "problem",
      languageId: decodeURIComponent(match[1]),
      slug: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export function parseWebProjectHash(hash) {
  const cleanHash = String(hash ?? "").replace(/^#/, "");
  if (/^\/web-projects\/?$/.test(cleanHash)) return { kind: "list" };

  const match = cleanHash.match(/^\/web-projects\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return {
      kind: "project",
      slug: decodeURIComponent(match[1]),
    };
  } catch {
    return null;
  }
}

export function resolveLessonRoute(curriculum, hash, preferredLessonId = null) {
  const navigableCategoryIds = new Set(
    (curriculum.categories ?? [])
      .filter((category) => category.status !== "planned")
      .map((category) => category.id),
  );
  const navigableCourseIds = new Set(
    (curriculum.courses ?? [])
      .filter(
        (course) =>
          course.status !== "planned" && navigableCategoryIds.has(course.categoryId),
      )
      .map((course) => course.id),
  );
  const parsed = parseLessonHash(hash);
  const routedLesson = parsed
    ? curriculum.lessons.find(
        (lesson) =>
          navigableCourseIds.has(lesson.courseId) &&
          lesson.courseId === parsed.courseId &&
          lesson.slug === parsed.slug,
      )
    : null;

  if (routedLesson) return routedLesson;

  const preferredLesson = preferredLessonId
    ? curriculum.lessons.find(
        (lesson) =>
          navigableCourseIds.has(lesson.courseId) && lesson.id === preferredLessonId,
      )
    : null;
  if (preferredLesson) return preferredLesson;

  return (
    curriculum.lessons.find(
      (lesson) =>
        navigableCourseIds.has(lesson.courseId) && lesson.courseId === DEFAULT_COURSE_ID,
    ) ??
    curriculum.lessons.find((lesson) => navigableCourseIds.has(lesson.courseId)) ??
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
