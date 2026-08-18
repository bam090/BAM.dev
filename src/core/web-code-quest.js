export const WEB_CODE_QUEST_EVALUATION_KINDS = Object.freeze({
  HTML: "html-dom-v1",
  CSS: "css-style-v1",
});

export const WEB_CODE_QUEST_SOURCE_MAX_BYTES = 20 * 1024;
export const WEB_CODE_QUEST_FIXTURE_MAX_BYTES = 32 * 1024;
export const WEB_CODE_QUEST_MAX_TESTS = 20;

const textEncoder = new TextEncoder();
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z_:][A-Za-z0-9_.:-]*$/;
const CSS_PROPERTY_PATTERN = /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/;
const ALLOWED_DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const EVALUATION_LANGUAGE = new Map([
  [WEB_CODE_QUEST_EVALUATION_KINDS.HTML, "html"],
  [WEB_CODE_QUEST_EVALUATION_KINDS.CSS, "css"],
]);
const HTML_ASSERTION_KINDS = new Set([
  "doctype-present",
  "selector-exists",
  "selector-count",
  "attribute-equals",
  "text-includes",
]);
const CSS_ASSERTION_KINDS = new Set([
  "rule-declaration",
  "media-rule-declaration",
  "computed-style",
]);
const COLLECTION_FIELDS = new Set([
  "schemaVersion",
  "contractVersion",
  "evaluationKind",
  "languageId",
  "title",
  "quests",
]);
const COMMON_QUEST_FIELDS = new Set([
  "id",
  "slug",
  "revision",
  "order",
  "lessonId",
  "conceptIds",
  "difficulty",
  "estimatedMinutes",
  "title",
  "summary",
  "instructions",
  "starterCode",
  "requirements",
  "examples",
  "publicTests",
  "failureExplanations",
  "hints",
  "commonMistakes",
]);
const EXAMPLE_FIELDS = new Set(["source", "explanation"]);
const PUBLIC_TEST_FIELDS = new Set(["id", "label", "assertion"]);
const FAILURE_FIELDS = new Set(["testId", "message"]);
const HINT_FIELDS = new Set(["level", "stage", "title", "content"]);
const MISTAKE_FIELDS = new Set(["id", "title", "explanation"]);
const EXECUTION_REQUEST_FIELDS = new Set([
  "requestId",
  "contractVersion",
  "questId",
  "questRevision",
  "languageId",
  "evaluationKind",
  "suite",
  "source",
  "fixtureHtml",
  "tests",
]);
const EXECUTION_TEST_FIELDS = new Set(["id", "label", "assertion", "expected"]);

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function utf8ByteLength(value) {
  return textEncoder.encode(value).byteLength;
}

function ownEnumerableDataKeys(value) {
  if (!isPlainRecord(value)) return null;
  try {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string")) return null;
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !("value" in descriptor)) return null;
    }
    return keys;
  } catch {
    return null;
  }
}

function inspectExactRecord(value, label, fields, errors) {
  const keys = ownEnumerableDataKeys(value);
  if (!keys) {
    errors.push(`${label}은 일반 객체의 열거 가능한 값 필드만 사용해야 합니다.`);
    return null;
  }
  for (const key of keys) {
    if (!fields.has(key)) errors.push(`${label}에 허용되지 않은 필드가 있습니다: ${key}`);
  }
  for (const field of fields) {
    if (!keys.includes(field)) errors.push(`${label}.${field}가 필요합니다.`);
  }
  return value;
}

function inspectArray(value, label, errors, minimum = 0, maximum = Infinity) {
  if (!Array.isArray(value)) {
    errors.push(`${label}은 배열이어야 합니다.`);
    return null;
  }
  if (value.length < minimum) errors.push(`${label}에는 최소 ${minimum}개 항목이 필요합니다.`);
  if (value.length > maximum) errors.push(`${label}에는 최대 ${maximum}개 항목만 허용됩니다.`);
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) errors.push(`${label}[${index}]은 비어 있지 않아야 합니다.`);
  }
  return value;
}

function validateStringArray(value, label, errors, minimum = 1) {
  const items = inspectArray(value, label, errors, minimum);
  if (!items) return [];
  const seen = new Set();
  items.forEach((item, index) => {
    if (!isNonEmptyString(item)) errors.push(`${label}[${index}]은 비어 있지 않은 문자열이어야 합니다.`);
    if (seen.has(item)) errors.push(`${label}에 중복된 항목이 있습니다: ${item}`);
    seen.add(item);
  });
  return items;
}

function isExternalUrlText(value) {
  return /(?:^|[\s"'=])(https?:|data:|javascript:|blob:|file:|\/\/)/iu.test(value);
}

function hasInlineEventHandlerAttribute(source) {
  let index = 0;
  while (index < source.length) {
    const tagStart = source.indexOf("<", index);
    if (tagStart < 0) return false;
    if (source.startsWith("<!--", tagStart)) {
      const commentEnd = source.indexOf("-->", tagStart + 4);
      index = commentEnd < 0 ? source.length : commentEnd + 3;
      continue;
    }

    let cursor = tagStart + 1;
    while (/[\t\n\f\r ]/u.test(source[cursor] ?? "")) cursor += 1;
    if (!/[a-z]/iu.test(source[cursor] ?? "")) {
      index = tagStart + 1;
      continue;
    }
    while (/[^\t\n\f\r />]/u.test(source[cursor] ?? "")) cursor += 1;

    while (cursor < source.length) {
      while (/[\t\n\f\r ]/u.test(source[cursor] ?? "")) cursor += 1;
      if (source[cursor] === ">") {
        cursor += 1;
        break;
      }
      if (source[cursor] === "/" && source[cursor + 1] === ">") {
        cursor += 2;
        break;
      }

      const nameStart = cursor;
      while (/[^\t\n\f\r =/>]/u.test(source[cursor] ?? "")) cursor += 1;
      if (cursor === nameStart) {
        cursor += 1;
        continue;
      }
      const attributeName = source.slice(nameStart, cursor);
      if (/^on[a-z0-9_-]+$/iu.test(attributeName)) return true;

      while (/[\t\n\f\r ]/u.test(source[cursor] ?? "")) cursor += 1;
      if (source[cursor] !== "=") continue;
      cursor += 1;
      while (/[\t\n\f\r ]/u.test(source[cursor] ?? "")) cursor += 1;
      const quote = source[cursor];
      if (quote === '"' || quote === "'") {
        cursor += 1;
        while (cursor < source.length && source[cursor] !== quote) cursor += 1;
        if (source[cursor] === quote) cursor += 1;
      } else {
        while (/[^\t\n\f\r >]/u.test(source[cursor] ?? "")) cursor += 1;
      }
    }
    index = Math.max(cursor, tagStart + 1);
  }
  return false;
}

/**
 * Performs the same conservative source preflight for authored examples,
 * learner submissions, and CSS fixtures. The evaluators never execute scripts
 * and never insert learner HTML into BAM.dev's main document.
 */
export function findWebCodeQuestSourceIssue(evaluationKind, source, { fixture = false } = {}) {
  if (typeof source !== "string" || source.trim().length === 0) {
    return { code: "empty_source", message: "source는 비어 있지 않은 문자열이어야 합니다." };
  }
  const maximum = fixture ? WEB_CODE_QUEST_FIXTURE_MAX_BYTES : WEB_CODE_QUEST_SOURCE_MAX_BYTES;
  if (utf8ByteLength(source) > maximum) {
    return {
      code: "source_too_large",
      message: `source의 UTF-8 크기는 ${maximum}바이트 이하여야 합니다.`,
    };
  }
  if (source.includes("\0")) {
    return { code: "null_character", message: "source에는 null 문자를 사용할 수 없습니다." };
  }

  if (evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.HTML) {
    if (/<\s*\/?\s*(?:script|iframe|object|embed)(?=[\s/>])/iu.test(source)) {
      return {
        code: "blocked_element",
        message: "script, iframe, object, embed 요소는 사용할 수 없습니다.",
      };
    }
    if (/<\s*\/?\s*(?:base|link)(?=[\s/>])/iu.test(source)) {
      return {
        code: "resource_element",
        message: "외부 문서나 기준 URL을 불러오는 base, link 요소는 사용할 수 없습니다.",
      };
    }
    if (/<\s*meta\b[^>]*http-equiv\s*=\s*["']?refresh\b/iu.test(source)) {
      return { code: "meta_refresh", message: "자동 이동을 만드는 meta refresh는 사용할 수 없습니다." };
    }
    if (hasInlineEventHandlerAttribute(source)) {
      return { code: "event_handler", message: "이벤트 핸들러 속성은 사용할 수 없습니다." };
    }
    if (/\b(?:src|srcset|poster|data|action|formaction)\s*=/iu.test(source)) {
      return {
        code: "resource_attribute",
        message: "네트워크나 탐색을 시작할 수 있는 리소스 속성은 사용할 수 없습니다.",
      };
    }
    if (/@import\b|url\s*\(/iu.test(source) || isExternalUrlText(source)) {
      return { code: "external_url", message: "외부 URL이나 @import는 사용할 수 없습니다." };
    }
    return null;
  }

  if (evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS) {
    if (/@import\b/iu.test(source)) {
      return { code: "css_import", message: "CSS @import는 사용할 수 없습니다." };
    }
    if (/url\s*\(/iu.test(source) || isExternalUrlText(source)) {
      return { code: "external_url", message: "CSS 외부 URL은 사용할 수 없습니다." };
    }
    if (/\b(?:expression|behavior)\s*[:(]|-moz-binding\s*:/iu.test(source)) {
      return { code: "legacy_execution", message: "실행 동작을 만들 수 있는 CSS 구문은 사용할 수 없습니다." };
    }
    return null;
  }

  return { code: "evaluation_kind", message: "지원하지 않는 Web Code Quest 평가 종류입니다." };
}

function assertionFields(kind) {
  if (kind === "doctype-present") return new Set(["kind"]);
  if (kind === "selector-exists") return new Set(["kind", "selector"]);
  if (kind === "selector-count") return new Set(["kind", "selector", "expected"]);
  if (kind === "attribute-equals") {
    return new Set(["kind", "selector", "attribute", "expected"]);
  }
  if (kind === "text-includes") return new Set(["kind", "selector", "expected"]);
  if (kind === "rule-declaration" || kind === "computed-style") {
    return new Set(["kind", "selector", "property", "expected"]);
  }
  if (kind === "media-rule-declaration") {
    return new Set(["kind", "condition", "selector", "property", "expected"]);
  }
  return null;
}

function validateAssertion(value, evaluationKind, label, errors) {
  if (!isPlainRecord(value) || !isNonEmptyString(value.kind)) {
    errors.push(`${label}은 kind를 가진 일반 객체여야 합니다.`);
    return null;
  }
  const fields = assertionFields(value.kind);
  const allowedKinds =
    evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.HTML
      ? HTML_ASSERTION_KINDS
      : CSS_ASSERTION_KINDS;
  if (!fields || !allowedKinds.has(value.kind)) {
    errors.push(`${label}.kind는 ${evaluationKind}에서 허용되지 않습니다.`);
    return null;
  }
  if (!inspectExactRecord(value, label, fields, errors)) return null;
  if (value.kind !== "doctype-present") {
    if (!isNonEmptyString(value.selector) || value.selector.length > 200) {
      errors.push(`${label}.selector는 1~200자의 문자열이어야 합니다.`);
    }
  }
  if (value.kind === "selector-count") {
    if (!Number.isSafeInteger(value.expected) || value.expected < 0) {
      errors.push(`${label}.expected는 0 이상의 안전한 정수여야 합니다.`);
    }
  } else if (value.kind === "attribute-equals") {
    if (!isNonEmptyString(value.attribute) || !ATTRIBUTE_NAME_PATTERN.test(value.attribute)) {
      errors.push(`${label}.attribute 형식이 올바르지 않습니다.`);
    }
    if (typeof value.expected !== "string") errors.push(`${label}.expected는 문자열이어야 합니다.`);
  } else if (value.kind === "text-includes") {
    if (!isNonEmptyString(value.expected)) errors.push(`${label}.expected가 필요합니다.`);
  } else if (CSS_ASSERTION_KINDS.has(value.kind)) {
    if (
      value.kind === "media-rule-declaration" &&
      (!isNonEmptyString(value.condition) || value.condition.length > 200)
    ) {
      errors.push(`${label}.condition은 1~200자의 문자열이어야 합니다.`);
    }
    if (!isNonEmptyString(value.property) || !CSS_PROPERTY_PATTERN.test(value.property)) {
      errors.push(`${label}.property 형식이 올바르지 않습니다.`);
    }
    if (!isNonEmptyString(value.expected)) errors.push(`${label}.expected가 필요합니다.`);
  }
  return value;
}

export function getWebAssertionExpected(assertion) {
  if (!isPlainRecord(assertion)) return null;
  if (
    assertion.kind === "doctype-present" ||
    assertion.kind === "selector-exists" ||
    assertion.kind === "text-includes"
  ) {
    return true;
  }
  return Object.hasOwn(assertion, "expected") ? assertion.expected : null;
}

function buildLessonMap(curriculum, errors) {
  if (!isPlainRecord(curriculum) || !Array.isArray(curriculum.lessons)) {
    errors.push("교안 연결을 확인할 커리큘럼이 필요합니다.");
    return new Map();
  }
  return new Map(
    curriculum.lessons
      .filter((lesson) => isPlainRecord(lesson) && isNonEmptyString(lesson.id))
      .map((lesson) => [lesson.id, lesson]),
  );
}

function validateExamples(quest, evaluationKind, label, errors) {
  const examples = inspectArray(quest.examples, `${label}.examples`, errors, 1, 3) ?? [];
  examples.forEach((value, index) => {
    const exampleLabel = `${label}.examples[${index}]`;
    const example = inspectExactRecord(value, exampleLabel, EXAMPLE_FIELDS, errors);
    if (!example) return;
    if (!isNonEmptyString(example.explanation)) errors.push(`${exampleLabel}.explanation이 필요합니다.`);
    const issue = findWebCodeQuestSourceIssue(evaluationKind, example.source);
    if (issue) errors.push(`${exampleLabel}.source: ${issue.message}`);
  });
}

function validateTests(quest, evaluationKind, label, collectionTestIds, errors) {
  const tests = inspectArray(quest.publicTests, `${label}.publicTests`, errors, 3, 6) ?? [];
  const localIds = new Set();
  tests.forEach((value, index) => {
    const testLabel = `${label}.publicTests[${index}]`;
    const test = inspectExactRecord(value, testLabel, PUBLIC_TEST_FIELDS, errors);
    if (!test) return;
    if (!isNonEmptyString(test.id) || !STABLE_ID_PATTERN.test(test.id)) {
      errors.push(`${testLabel}.id 형식이 올바르지 않습니다.`);
    } else if (localIds.has(test.id) || collectionTestIds.has(test.id)) {
      errors.push(`공개 테스트 ID가 중복됩니다: ${test.id}`);
    }
    localIds.add(test.id);
    collectionTestIds.add(test.id);
    if (!isNonEmptyString(test.label)) errors.push(`${testLabel}.label이 필요합니다.`);
    validateAssertion(test.assertion, evaluationKind, `${testLabel}.assertion`, errors);
  });
  return localIds;
}

function validateFailureExplanations(quest, publicTestIds, label, errors) {
  const values = inspectArray(
    quest.failureExplanations,
    `${label}.failureExplanations`,
    errors,
    3,
    6,
  ) ?? [];
  const explanationIds = new Set();
  values.forEach((value, index) => {
    const itemLabel = `${label}.failureExplanations[${index}]`;
    const item = inspectExactRecord(value, itemLabel, FAILURE_FIELDS, errors);
    if (!item) return;
    if (!isNonEmptyString(item.testId) || !STABLE_ID_PATTERN.test(item.testId)) {
      errors.push(`${itemLabel}.testId 형식이 올바르지 않습니다.`);
    } else if (explanationIds.has(item.testId)) {
      errors.push(`${label}.failureExplanations의 testId가 중복됩니다: ${item.testId}`);
    }
    explanationIds.add(item.testId);
    if (!isNonEmptyString(item.message)) errors.push(`${itemLabel}.message가 필요합니다.`);
  });
  for (const testId of publicTestIds) {
    if (!explanationIds.has(testId)) errors.push(`${label}: ${testId}의 실패 설명이 없습니다.`);
  }
  for (const testId of explanationIds) {
    if (!publicTestIds.has(testId)) errors.push(`${label}: 존재하지 않는 테스트 설명입니다: ${testId}`);
  }
}

function validateHints(quest, label, errors) {
  const hints = inspectArray(quest.hints, `${label}.hints`, errors, 3, 5) ?? [];
  const stages = ["concept", "observation", "implementation"];
  hints.forEach((value, index) => {
    const hintLabel = `${label}.hints[${index}]`;
    const hint = inspectExactRecord(value, hintLabel, HINT_FIELDS, errors);
    if (!hint) return;
    if (hint.level !== index + 1) errors.push(`${hintLabel}.level은 ${index + 1}이어야 합니다.`);
    if (index < stages.length && hint.stage !== stages[index]) {
      errors.push(`${hintLabel}.stage는 ${stages[index]}이어야 합니다.`);
    }
    if (!stages.includes(hint.stage)) errors.push(`${hintLabel}.stage 형식이 올바르지 않습니다.`);
    if (!isNonEmptyString(hint.title)) errors.push(`${hintLabel}.title이 필요합니다.`);
    if (!isNonEmptyString(hint.content)) errors.push(`${hintLabel}.content가 필요합니다.`);
  });
}

function validateMistakes(quest, label, errors) {
  const values = inspectArray(quest.commonMistakes, `${label}.commonMistakes`, errors, 1) ?? [];
  const ids = new Set();
  values.forEach((value, index) => {
    const itemLabel = `${label}.commonMistakes[${index}]`;
    const item = inspectExactRecord(value, itemLabel, MISTAKE_FIELDS, errors);
    if (!item) return;
    if (!isNonEmptyString(item.id) || !STABLE_ID_PATTERN.test(item.id)) {
      errors.push(`${itemLabel}.id 형식이 올바르지 않습니다.`);
    } else if (ids.has(item.id)) {
      errors.push(`${label}.commonMistakes의 ID가 중복됩니다: ${item.id}`);
    }
    ids.add(item.id);
    if (!isNonEmptyString(item.title)) errors.push(`${itemLabel}.title이 필요합니다.`);
    if (!isNonEmptyString(item.explanation)) errors.push(`${itemLabel}.explanation이 필요합니다.`);
  });
}

function validateWebCodeQuestCollectionInternal(collection, curriculum) {
  const errors = [];
  if (!inspectExactRecord(collection, "Web Code Quest 컬렉션", COLLECTION_FIELDS, errors)) {
    return errors;
  }
  if (collection.schemaVersion !== 1) errors.push("지원하는 Web Code Quest schemaVersion은 1입니다.");
  if (collection.contractVersion !== 1) errors.push("지원하는 Web Code Quest contractVersion은 1입니다.");
  const expectedLanguageId = EVALUATION_LANGUAGE.get(collection.evaluationKind);
  if (!expectedLanguageId) errors.push("evaluationKind는 html-dom-v1 또는 css-style-v1이어야 합니다.");
  const hasValidLanguageId =
    isNonEmptyString(collection.languageId) && STABLE_ID_PATTERN.test(collection.languageId);
  if (!hasValidLanguageId) errors.push("컬렉션 languageId 형식이 올바르지 않습니다.");
  if (collection.languageId !== expectedLanguageId) {
    errors.push("evaluationKind와 languageId가 일치하지 않습니다.");
  }
  if (!isNonEmptyString(collection.title)) errors.push("컬렉션 title이 필요합니다.");

  const languages = Array.isArray(curriculum?.languages) ? curriculum.languages : [];
  if (!languages.some((language) => language?.id === collection.languageId)) {
    errors.push(`커리큘럼에 ${collection.languageId} 언어가 없습니다.`);
  }
  const lessonMap = buildLessonMap(curriculum, errors);
  const quests = inspectArray(collection.quests, "Web Code Quest 컬렉션.quests", errors, 1) ?? [];
  const questIds = new Set();
  const slugs = new Set();
  const collectionTestIds = new Set();
  const questFields = new Set(COMMON_QUEST_FIELDS);
  if (collection.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS) {
    questFields.add("fixtureHtml");
  }
  const idPattern = hasValidLanguageId
    ? new RegExp(`^quest-${collection.languageId}-[a-z0-9]+(?:-[a-z0-9]+)*$`)
    : null;

  quests.forEach((value, index) => {
    const label = `quests[${index}]`;
    const quest = inspectExactRecord(value, label, questFields, errors);
    if (!quest) return;
    if (!isNonEmptyString(quest.id) || !idPattern?.test(quest.id)) {
      errors.push(`${label}.id는 컬렉션 언어로 네임스페이스되어야 합니다.`);
    } else if (questIds.has(quest.id)) {
      errors.push(`Quest ID가 중복됩니다: ${quest.id}`);
    }
    questIds.add(quest.id);
    if (!isNonEmptyString(quest.slug) || !STABLE_ID_PATTERN.test(quest.slug)) {
      errors.push(`${label}.slug 형식이 올바르지 않습니다.`);
    } else if (slugs.has(quest.slug)) {
      errors.push(`Quest slug가 중복됩니다: ${quest.slug}`);
    }
    slugs.add(quest.slug);
    if (!Number.isSafeInteger(quest.revision) || quest.revision < 1) {
      errors.push(`${label}.revision은 1 이상의 안전한 정수여야 합니다.`);
    }
    if (quest.order !== index + 1) errors.push(`${label}.order는 배열에서 1부터 이어져야 합니다.`);

    const lesson = lessonMap.get(quest.lessonId);
    if (!lesson) errors.push(`${label}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
    else if (lesson.languageId !== collection.languageId) {
      errors.push(`${label}.lessonId의 언어가 컬렉션 언어와 다릅니다.`);
    }
    const conceptIds = validateStringArray(quest.conceptIds, `${label}.conceptIds`, errors);
    conceptIds.forEach((conceptId, conceptIndex) => {
      if (!CONCEPT_ID_PATTERN.test(conceptId)) {
        errors.push(`${label}.conceptIds[${conceptIndex}] 형식이 올바르지 않습니다.`);
      }
      if (lesson && !lesson.conceptIds?.includes(conceptId)) {
        errors.push(`${label}.conceptIds에 연결 교안에 없는 개념이 있습니다: ${conceptId}`);
      }
    });
    if (!ALLOWED_DIFFICULTIES.has(quest.difficulty)) {
      errors.push(`${label}.difficulty 형식이 올바르지 않습니다.`);
    }
    if (!Number.isSafeInteger(quest.estimatedMinutes) || quest.estimatedMinutes < 1) {
      errors.push(`${label}.estimatedMinutes는 1 이상의 안전한 정수여야 합니다.`);
    }
    for (const field of ["title", "summary", "instructions"]) {
      if (!isNonEmptyString(quest[field])) errors.push(`${label}.${field}가 필요합니다.`);
    }
    validateStringArray(quest.requirements, `${label}.requirements`, errors);

    const starterIssue = findWebCodeQuestSourceIssue(collection.evaluationKind, quest.starterCode);
    if (starterIssue) errors.push(`${label}.starterCode: ${starterIssue.message}`);
    if (collection.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS) {
      const fixtureIssue = findWebCodeQuestSourceIssue(
        WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
        quest.fixtureHtml,
        { fixture: true },
      );
      if (fixtureIssue) errors.push(`${label}.fixtureHtml: ${fixtureIssue.message}`);
    }

    validateExamples(quest, collection.evaluationKind, label, errors);
    const publicTestIds = validateTests(
      quest,
      collection.evaluationKind,
      label,
      collectionTestIds,
      errors,
    );
    validateFailureExplanations(quest, publicTestIds, label, errors);
    validateHints(quest, label, errors);
    validateMistakes(quest, label, errors);
  });
  return errors;
}

export function validateWebCodeQuestCollection(collection, curriculum) {
  try {
    return validateWebCodeQuestCollectionInternal(collection, curriculum);
  } catch {
    return ["Web Code Quest 콘텐츠를 안전하게 검증할 수 없습니다."];
  }
}

export function assertValidWebCodeQuestCollection(collection, curriculum) {
  const errors = validateWebCodeQuestCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`Web Code Quest 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return collection;
}

export async function loadWebCodeQuestCollection(
  languageId,
  curriculum,
  fetchImplementation = globalThis.fetch,
) {
  if (!new Set(["html", "css"]).has(languageId)) {
    throw new Error("허용되지 않은 Web Code Quest 언어 경로입니다.");
  }
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("Web Code Quest 콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }
  const response = await fetchImplementation(`./content/quests/${languageId}.json`);
  if (!response?.ok) {
    throw new Error(`Web Code Quest 콘텐츠를 불러오지 못했습니다. (${response?.status ?? "unknown"})`);
  }
  const collection = assertValidWebCodeQuestCollection(await response.json(), curriculum);
  if (collection.languageId !== languageId) {
    throw new Error("요청한 언어와 Web Code Quest 컬렉션 언어가 다릅니다.");
  }
  return collection;
}

export function getWebCodeQuestsInOrder(collection) {
  return Array.isArray(collection?.quests)
    ? [...collection.quests].sort((left, right) => left.order - right.order)
    : [];
}

export function findWebCodeQuestBySlug(collection, slug) {
  if (!isNonEmptyString(slug) || !STABLE_ID_PATTERN.test(slug)) return null;
  return collection?.quests?.find((quest) => quest?.slug === slug) ?? null;
}

function cloneAssertion(assertion) {
  const copy = {};
  for (const field of assertionFields(assertion.kind) ?? []) copy[field] = assertion[field];
  return Object.freeze(copy);
}

function freezeExecutionRequest(request) {
  const tests = request.tests.map((test) =>
    Object.freeze({
      id: test.id,
      label: test.label,
      assertion: cloneAssertion(test.assertion),
      expected: test.expected,
    }),
  );
  return Object.freeze({ ...request, tests: Object.freeze(tests) });
}

export function validateWebCodeQuestExecutionRequest(request) {
  const errors = [];
  if (!inspectExactRecord(request, "Web Code Quest 실행 요청", EXECUTION_REQUEST_FIELDS, errors)) {
    return errors;
  }
  if (!isNonEmptyString(request.requestId) || !STABLE_ID_PATTERN.test(request.requestId)) {
    errors.push("requestId 형식이 올바르지 않습니다.");
  }
  if (request.contractVersion !== 1) errors.push("지원하는 contractVersion은 1입니다.");
  if (!isNonEmptyString(request.questId) || !STABLE_ID_PATTERN.test(request.questId)) {
    errors.push("questId 형식이 올바르지 않습니다.");
  }
  if (!Number.isSafeInteger(request.questRevision) || request.questRevision < 1) {
    errors.push("questRevision은 1 이상의 안전한 정수여야 합니다.");
  }
  const expectedLanguageId = EVALUATION_LANGUAGE.get(request.evaluationKind);
  if (!expectedLanguageId || request.languageId !== expectedLanguageId) {
    errors.push("evaluationKind와 languageId가 일치하지 않습니다.");
  }
  if (
    typeof request.questId === "string" &&
    !request.questId.startsWith(`quest-${request.languageId}-`)
  ) {
    errors.push("questId와 languageId가 일치하지 않습니다.");
  }
  if (request.suite !== "public") errors.push('suite는 "public"이어야 합니다.');
  const sourceIssue = findWebCodeQuestSourceIssue(request.evaluationKind, request.source);
  if (sourceIssue) errors.push(sourceIssue.message);
  if (request.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS) {
    const fixtureIssue = findWebCodeQuestSourceIssue(
      WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
      request.fixtureHtml,
      { fixture: true },
    );
    if (fixtureIssue) errors.push(`fixtureHtml: ${fixtureIssue.message}`);
  } else if (request.fixtureHtml !== null) {
    errors.push("HTML DOM 평가 요청의 fixtureHtml은 null이어야 합니다.");
  }

  const tests = inspectArray(request.tests, "Web Code Quest 실행 요청.tests", errors, 1, WEB_CODE_QUEST_MAX_TESTS) ?? [];
  const ids = new Set();
  tests.forEach((value, index) => {
    const label = `Web Code Quest 실행 요청.tests[${index}]`;
    const test = inspectExactRecord(value, label, EXECUTION_TEST_FIELDS, errors);
    if (!test) return;
    if (!isNonEmptyString(test.id) || !STABLE_ID_PATTERN.test(test.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
    } else if (ids.has(test.id)) errors.push(`실행 테스트 ID가 중복됩니다: ${test.id}`);
    ids.add(test.id);
    if (!isNonEmptyString(test.label)) errors.push(`${label}.label이 필요합니다.`);
    if (validateAssertion(test.assertion, request.evaluationKind, `${label}.assertion`, errors)) {
      const expected = getWebAssertionExpected(test.assertion);
      if (!Object.is(expected, test.expected)) errors.push(`${label}.expected가 assertion과 다릅니다.`);
    }
  });
  return errors;
}

export function assertValidWebCodeQuestExecutionRequest(request) {
  const errors = validateWebCodeQuestExecutionRequest(request);
  if (errors.length > 0) {
    throw new Error(`Web Code Quest 실행 요청 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return request;
}

export function createWebCodeQuestExecutionRequest(collection, quest, source, requestId) {
  if (!isPlainRecord(collection) || !Array.isArray(collection.quests)) {
    throw new TypeError("실행할 Web Code Quest 컬렉션이 필요합니다.");
  }
  const canonicalQuest = collection.quests.find((candidate) => candidate?.id === quest?.id);
  if (!canonicalQuest) throw new Error("Web Code Quest가 컬렉션에 속하지 않습니다.");
  const request = {
    requestId,
    contractVersion: collection.contractVersion,
    questId: canonicalQuest.id,
    questRevision: canonicalQuest.revision,
    languageId: collection.languageId,
    evaluationKind: collection.evaluationKind,
    suite: "public",
    source,
    fixtureHtml:
      collection.evaluationKind === WEB_CODE_QUEST_EVALUATION_KINDS.CSS
        ? canonicalQuest.fixtureHtml
        : null,
    tests: canonicalQuest.publicTests.map((test) => ({
      id: test.id,
      label: test.label,
      assertion: { ...test.assertion },
      expected: getWebAssertionExpected(test.assertion),
    })),
  };
  assertValidWebCodeQuestExecutionRequest(request);
  return freezeExecutionRequest(request);
}
