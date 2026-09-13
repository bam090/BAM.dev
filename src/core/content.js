const REQUIRED_LESSON_FIELDS = [
  "id",
  "courseId",
  "languageId",
  "order",
  "slug",
  "title",
  "summary",
  "essentialQuestion",
  "objectives",
  "estimatedMinutes",
  "conceptIds",
  "contentFile",
  "source",
];

export function validateCurriculum(curriculum) {
  const errors = [];

  if (!curriculum || typeof curriculum !== "object") {
    return ["커리큘럼은 객체여야 합니다."];
  }

  if (curriculum.schemaVersion !== 1) {
    errors.push("지원하는 schemaVersion은 1입니다.");
  }

  if (!Array.isArray(curriculum.categories) || curriculum.categories.length === 0) {
    errors.push("categories에는 한 개 이상의 카테고리가 필요합니다.");
  }

  if (!Array.isArray(curriculum.languages) || curriculum.languages.length === 0) {
    errors.push("languages에는 한 개 이상의 언어가 필요합니다.");
  }

  if (!Array.isArray(curriculum.courses) || curriculum.courses.length === 0) {
    errors.push("courses에는 한 개 이상의 과정이 필요합니다.");
  }

  if (!Array.isArray(curriculum.lessons) || curriculum.lessons.length === 0) {
    errors.push("lessons에는 한 개 이상의 교안이 필요합니다.");
    return errors;
  }

  const categories = Array.isArray(curriculum.categories) ? curriculum.categories : [];
  const languages = Array.isArray(curriculum.languages) ? curriculum.languages : [];
  const courses = Array.isArray(curriculum.courses) ? curriculum.courses : [];

  const categoryIds = new Set();
  for (const [index, category] of categories.entries()) {
    const label = `categories[${index}]`;
    if (!category?.id || !/^[a-z][a-z0-9-]*$/.test(category.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
      continue;
    }
    if (categoryIds.has(category.id)) {
      errors.push(`카테고리 ID가 중복됩니다: ${category.id}`);
    }
    categoryIds.add(category.id);
    if (!["available", "sample", "planned"].includes(category.status)) {
      errors.push(`${label}.status가 올바르지 않습니다.`);
    }
  }

  const languageIds = new Set();
  for (const [index, language] of languages.entries()) {
    const label = `languages[${index}]`;
    if (!language?.id || !/^[a-z][a-z0-9-]*$/.test(language.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
      continue;
    }
    if (languageIds.has(language.id)) {
      errors.push(`언어 ID가 중복됩니다: ${language.id}`);
    }
    languageIds.add(language.id);
    if (!["available", "sample", "planned"].includes(language.status)) {
      errors.push(`${label}.status가 올바르지 않습니다.`);
    }
  }

  const courseIds = new Set();
  for (const [index, course] of courses.entries()) {
    const label = `courses[${index}]`;
    if (!course?.id || !/^[a-z][a-z0-9-]*$/.test(course.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
      continue;
    }
    if (courseIds.has(course.id)) {
      errors.push(`과정 ID가 중복됩니다: ${course.id}`);
    }
    courseIds.add(course.id);
    if (!categoryIds.has(course.categoryId)) {
      errors.push(`${label}.categoryId가 존재하지 않는 카테고리를 가리킵니다.`);
    }
    if (!languageIds.has(course.languageId)) {
      errors.push(`${label}.languageId가 존재하지 않는 언어를 가리킵니다.`);
    }
    if (!["available", "sample", "planned"].includes(course.status)) {
      errors.push(`${label}.status가 올바르지 않습니다.`);
    }
  }

  const lessonIds = new Set();
  const lessonSlugs = new Set();
  const lessonsByCourse = new Map();

  for (const [index, lesson] of curriculum.lessons.entries()) {
    const label = `lessons[${index}]`;
    for (const field of REQUIRED_LESSON_FIELDS) {
      if (lesson?.[field] === undefined || lesson?.[field] === null) {
        errors.push(`${label}.${field}가 필요합니다.`);
      }
    }

    if (!lesson?.id || !/^[a-z0-9-]+$/.test(lesson.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
    } else if (lessonIds.has(lesson.id)) {
      errors.push(`교안 ID가 중복됩니다: ${lesson.id}`);
    }
    lessonIds.add(lesson?.id);

    const routeKey = `${lesson?.courseId}/${lesson?.slug}`;
    if (!lesson?.slug || !/^[a-z0-9-]+$/.test(lesson.slug)) {
      errors.push(`${label}.slug 형식이 올바르지 않습니다.`);
    } else if (lessonSlugs.has(routeKey)) {
      errors.push(`교안 경로가 중복됩니다: ${routeKey}`);
    }
    lessonSlugs.add(routeKey);

    if (!languageIds.has(lesson?.languageId)) {
      errors.push(`${label}.languageId가 존재하지 않는 언어를 가리킵니다.`);
    }
    const course = courses.find((item) => item.id === lesson?.courseId);
    if (!courseIds.has(lesson?.courseId)) {
      errors.push(`${label}.courseId가 존재하지 않는 과정을 가리킵니다.`);
    } else if (course.languageId !== lesson.languageId) {
      errors.push(`${label}.languageId가 과정의 실행 언어와 다릅니다.`);
    }
    if (!Number.isInteger(lesson?.order) || lesson.order < 1) {
      errors.push(`${label}.order는 1 이상의 정수여야 합니다.`);
    }
    if (lesson?.archivedFromCatalog !== undefined && typeof lesson.archivedFromCatalog !== "boolean") {
      errors.push(`${label}.archivedFromCatalog는 boolean이어야 합니다.`);
    }
    if (lesson?.answerHeading !== undefined &&
        (typeof lesson.answerHeading !== "string" || !lesson.answerHeading.trim())) {
      errors.push(`${label}.answerHeading은 비어 있지 않은 절 제목이어야 합니다.`);
    }
    if (
      !Array.isArray(lesson?.objectives) ||
      lesson.objectives.length === 0 ||
      lesson.objectives.some((objective) => typeof objective !== "string" || !objective.trim())
    ) {
      errors.push(`${label}.objectives에는 한 개 이상의 목표가 필요합니다.`);
    }
    const source = lesson?.source;
    const importFields = ["originalPath", "sha256", "importedAt", "importMode"];
    if (source && importFields.some((field) => Object.hasOwn(source, field))) {
      if (importFields.some((field) => typeof source[field] !== "string" || !source[field].trim())) {
        errors.push(`${label}.source에는 originalPath, sha256, importedAt, importMode가 모두 필요합니다.`);
      }
      if (
        !/^(?:profile\/|wiki\/학습자료\/밤데브 학습문서\/).+\.md$/.test(source.originalPath ?? "") ||
        /[\\\u0000-\u001f]/.test(source.originalPath ?? "") ||
        String(source.originalPath).split("/").some((part) => !part || part === "." || part === "..")
      ) {
        errors.push(`${label}.source.originalPath는 profile 또는 wiki/학습자료/밤데브 학습문서 아래의 안전한 상대 Markdown 경로여야 합니다.`);
      }
      if (!/^[a-f0-9]{64}$/.test(source.sha256 ?? "")) {
        errors.push(`${label}.source.sha256은 소문자 SHA-256 해시여야 합니다.`);
      }
      const importDate = new Date(`${source.importedAt}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(source.importedAt ?? "") ||
        !Number.isFinite(importDate.getTime()) ||
        importDate.toISOString().slice(0, 10) !== source.importedAt
      ) {
        errors.push(`${label}.source.importedAt는 유효한 YYYY-MM-DD 날짜여야 합니다.`);
      }
      if (!["copy", "excerpt", "derived"].includes(source.importMode)) {
        errors.push(`${label}.source.importMode는 copy, excerpt 또는 derived여야 합니다.`);
      }
    }
    if (!Array.isArray(lesson?.conceptIds) || lesson.conceptIds.length === 0) {
      errors.push(`${label}.conceptIds에는 한 개 이상의 개념 ID가 필요합니다.`);
    }
    if (!/^content\/lessons\/.+\.md$/.test(lesson?.contentFile ?? "")) {
      errors.push(`${label}.contentFile 경로가 올바르지 않습니다.`);
    } else if (
      courseIds.has(lesson?.courseId) &&
      !lesson.contentFile.startsWith(`content/lessons/${lesson.courseId}/`)
    ) {
      errors.push(`${label}.contentFile은 해당 과정 디렉터리 안에 있어야 합니다.`);
    }

    if (!lessonsByCourse.has(lesson?.courseId)) {
      lessonsByCourse.set(lesson?.courseId, []);
    }
    lessonsByCourse.get(lesson?.courseId).push(lesson);
  }

  for (const [courseId, lessons] of lessonsByCourse) {
    const orders = lessons.map((lesson) => lesson.order).sort((a, b) => a - b);
    const expected = Array.from({ length: orders.length }, (_, index) => index + 1);
    if (orders.some((order, index) => order !== expected[index])) {
      errors.push(`${courseId} 과정 교안의 order는 1부터 연속되어야 합니다.`);
    }
  }

  for (const course of courses) {
    if (
      ["available", "sample"].includes(course?.status) &&
      (lessonsByCourse.get(course.id)?.length ?? 0) === 0
    ) {
      errors.push(`${course.id}: available 또는 sample 과정에는 교안이 필요합니다.`);
    }
  }

  return errors;
}

export function assertValidCurriculum(curriculum) {
  const errors = validateCurriculum(curriculum);
  if (errors.length > 0) {
    throw new Error(`커리큘럼 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return curriculum;
}

export function getLanguage(curriculum, languageId) {
  return curriculum.languages.find((language) => language.id === languageId) ?? null;
}

export function getCourse(curriculum, courseId) {
  return curriculum.courses.find((course) => course.id === courseId) ?? null;
}

export function getLessonsForCourse(curriculum, courseId) {
  return curriculum.lessons
    .filter((lesson) => lesson.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsForLanguage(curriculum, languageId) {
  return curriculum.lessons
    .filter((lesson) => lesson.languageId === languageId)
    .sort((a, b) => a.order - b.order);
}

export async function loadCurriculum(fetchImplementation = globalThis.fetch) {
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }
  const response = await fetchImplementation("./content/curriculum.json");
  if (!response.ok) {
    throw new Error(`커리큘럼을 불러오지 못했습니다. (${response.status})`);
  }
  return assertValidCurriculum(await response.json());
}

export async function loadLessonMarkdown(lesson, fetchImplementation = globalThis.fetch) {
  if (!lesson?.contentFile || !/^content\/lessons\/.+\.md$/.test(lesson.contentFile)) {
    throw new Error("허용되지 않은 교안 경로입니다.");
  }
  const response = await fetchImplementation(`./${lesson.contentFile}`);
  if (!response.ok) {
    throw new Error(`교안 본문을 불러오지 못했습니다. (${response.status})`);
  }
  return response.text();
}
