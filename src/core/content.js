const REQUIRED_LESSON_FIELDS = [
  "id",
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

  if (!Array.isArray(curriculum.languages) || curriculum.languages.length === 0) {
    errors.push("languages에는 한 개 이상의 언어가 필요합니다.");
  }

  if (!Array.isArray(curriculum.lessons) || curriculum.lessons.length === 0) {
    errors.push("lessons에는 한 개 이상의 교안이 필요합니다.");
    return errors;
  }

  const languageIds = new Set();
  for (const [index, language] of (curriculum.languages ?? []).entries()) {
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

  const lessonIds = new Set();
  const lessonSlugs = new Set();
  const lessonsByLanguage = new Map();

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

    const routeKey = `${lesson?.languageId}/${lesson?.slug}`;
    if (!lesson?.slug || !/^[a-z0-9-]+$/.test(lesson.slug)) {
      errors.push(`${label}.slug 형식이 올바르지 않습니다.`);
    } else if (lessonSlugs.has(routeKey)) {
      errors.push(`교안 경로가 중복됩니다: ${routeKey}`);
    }
    lessonSlugs.add(routeKey);

    if (!languageIds.has(lesson?.languageId)) {
      errors.push(`${label}.languageId가 존재하지 않는 언어를 가리킵니다.`);
    }
    if (!Number.isInteger(lesson?.order) || lesson.order < 1) {
      errors.push(`${label}.order는 1 이상의 정수여야 합니다.`);
    }
    if (!Array.isArray(lesson?.objectives) || lesson.objectives.length === 0) {
      errors.push(`${label}.objectives에는 한 개 이상의 목표가 필요합니다.`);
    }
    if (!Array.isArray(lesson?.conceptIds) || lesson.conceptIds.length === 0) {
      errors.push(`${label}.conceptIds에는 한 개 이상의 개념 ID가 필요합니다.`);
    }
    if (!/^content\/lessons\/.+\.md$/.test(lesson?.contentFile ?? "")) {
      errors.push(`${label}.contentFile 경로가 올바르지 않습니다.`);
    }

    if (!lessonsByLanguage.has(lesson?.languageId)) {
      lessonsByLanguage.set(lesson?.languageId, []);
    }
    lessonsByLanguage.get(lesson?.languageId).push(lesson);
  }

  for (const [languageId, lessons] of lessonsByLanguage) {
    const orders = lessons.map((lesson) => lesson.order).sort((a, b) => a - b);
    const expected = Array.from({ length: orders.length }, (_, index) => index + 1);
    if (orders.some((order, index) => order !== expected[index])) {
      errors.push(`${languageId} 교안의 order는 1부터 연속되어야 합니다.`);
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
