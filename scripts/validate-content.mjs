import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidCurriculum } from "../src/core/content.js";
import { assertValidQuizCollection } from "../src/core/quiz.js";
import { getReviewDocumentLesson, validateReviewConcepts } from "../src/core/review-navigation.js";
import { headingId, renderMarkdown, splitMarkdownSection } from "../src/ui/markdown.js";
import { assertValidCodingTestCollection } from "../src/core/coding-test.js";
import {
  assertValidWebCodeQuestCollection,
  createWebCodeQuestExecutionRequest,
} from "../src/core/web-code-quest.js";
import { assertValidWebProjectCollection } from "../src/core/web-project.js";
import {
  areJsonValuesEqual,
  assertValidExecutionRequest,
} from "../src/grading/code-grading.js";

const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HINT_STAGES = ["concept", "observation", "implementation"];
const NON_PUBLIC_TEST_TERMS = /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu;
const FORBIDDEN_RUNTIME_API_PATTERN =
  /\b(?:document|window|fetch|XMLHttpRequest|WebSocket|EventSource|navigator|location|localStorage|sessionStorage|indexedDB|caches|importScripts|setTimeout|setInterval|requestAnimationFrame|Date|performance|crypto|Intl)\b|Math\.random/;

// origin/dev db1a5f430f45fc0f60277a0a1ddc7f38fc21c7a0에서 복원한 원문 보관본이다.
const LEGACY_JAVA_ANSWER_EXEMPTIONS = new Map([
  [
    "java-02-control-flow-arrays",
    {
      contentFile: "content/lessons/java/operators-control-flow-and-arrays.md",
      sha256: "9fb9d02d87121a971eed784e5e69d03bf65acc10fc85036ad42449e4b243d0ea",
    },
  ],
  [
    "java-03-classes-objects",
    {
      contentFile: "content/lessons/java/classes-objects-and-encapsulation.md",
      sha256: "9c7527ae36b618c4cd6d7fec2816d8ddbd4c765633a6888b2073433b16b5a4ea",
    },
  ],
  [
    "java-04-collections-generics",
    {
      contentFile: "content/lessons/java/collections-generics-list-and-map.md",
      sha256: "67c2b89b706ec739c20741e636890c08288cd6a5155bbef06f97cb636486e7a5",
    },
  ],
  [
    "java-05-exceptions-debugging",
    {
      contentFile: "content/lessons/java/exceptions-and-debugging.md",
      sha256: "47207680c3574a0dd75ad88371f8503e505b0e01f8935d11ec17d6681f904ead",
    },
  ],
  [
    "java-06-review-practice",
    {
      contentFile: "content/lessons/java/review-problem-solving-and-testing.md",
      sha256: "145bb45dd6967a046b56c919cce7769f8d27e3bc2e6f9e3bb98d7529b8530732",
    },
  ],
]);

export function isLegacyJavaArchiveWithoutInterviewAnswers(lesson, markdown) {
  if (lesson?.archivedFromCatalog !== true || typeof markdown !== "string") {
    return false;
  }
  const exemption = LEGACY_JAVA_ANSWER_EXEMPTIONS.get(lesson.id);
  return Boolean(
    exemption &&
      lesson.contentFile === exemption.contentFile &&
      createHash("sha256").update(markdown, "utf8").digest("hex") === exemption.sha256,
  );
}

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function resolveLocalSchemaReference(rootSchema, reference) {
  if (!/^#\//.test(reference)) return undefined;

  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], rootSchema);
}

export function validateSchemaValue(value, schema, rootSchema, valuePath, errors) {
  for (const childSchema of schema.allOf ?? []) {
    validateSchemaValue(value, childSchema, rootSchema, valuePath, errors);
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter((childSchema) => {
      const branchErrors = [];
      validateSchemaValue(value, childSchema, rootSchema, valuePath, branchErrors);
      return branchErrors.length === 0;
    });
    if (matches.length !== 1) {
      errors.push(`${valuePath}: oneOf 조건 중 정확히 하나를 만족해야 합니다.`);
    }
  }

  if (schema.not) {
    const forbiddenErrors = [];
    validateSchemaValue(value, schema.not, rootSchema, valuePath, forbiddenErrors);
    if (forbiddenErrors.length === 0) {
      errors.push(`${valuePath}: not 조건을 만족하면 안 됩니다.`);
    }
  }

  if (schema.if) {
    const conditionErrors = [];
    validateSchemaValue(value, schema.if, rootSchema, valuePath, conditionErrors);
    if (conditionErrors.length === 0 && schema.then) {
      validateSchemaValue(value, schema.then, rootSchema, valuePath, errors);
    } else if (conditionErrors.length > 0 && schema.else) {
      validateSchemaValue(value, schema.else, rootSchema, valuePath, errors);
    }
  }

  if (schema.$ref) {
    const referencedSchema = resolveLocalSchemaReference(rootSchema, schema.$ref);
    if (!referencedSchema) {
      errors.push(`${valuePath}: 스키마 참조를 찾을 수 없습니다 (${schema.$ref}).`);
      return;
    }
    validateSchemaValue(value, referencedSchema, rootSchema, valuePath, errors);
    return;
  }

  if (Object.hasOwn(schema, "const") && !Object.is(value, schema.const)) {
    errors.push(`${valuePath}: const 조건을 만족하지 않습니다.`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${valuePath}: 허용된 enum 값이 아닙니다.`);
  }

  if (
    schema.type === "object" ||
    schema.required ||
    schema.properties ||
    Object.hasOwn(schema, "additionalProperties")
  ) {
    if (!isPlainRecord(value)) {
      errors.push(`${valuePath}: 객체여야 합니다.`);
      return;
    }
    for (const requiredKey of schema.required ?? []) {
      if (!Object.hasOwn(value, requiredKey)) {
        errors.push(`${valuePath}.${requiredKey}: 필수 필드입니다.`);
      }
    }
    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) {
        if (!allowedKeys.has(key)) {
          errors.push(`${valuePath}.${key}: 허용되지 않은 필드입니다.`);
        }
      }
    }
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateSchemaValue(value[key], propertySchema, rootSchema, `${valuePath}.${key}`, errors);
      }
    }
    return;
  }

  if (schema.type === "array" || (schema.items && Array.isArray(value))) {
    if (!Array.isArray(value)) {
      errors.push(`${valuePath}: 배열이어야 합니다.`);
      return;
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${valuePath}: 항목 수가 ${schema.minItems}개보다 적습니다.`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${valuePath}: 항목 수가 ${schema.maxItems}개보다 많습니다.`);
    }
    if (
      schema.uniqueItems &&
      new Set(value.map((item) => JSON.stringify(item))).size !== value.length
    ) {
      errors.push(`${valuePath}: 중복 항목이 있습니다.`);
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validateSchemaValue(item, schema.items, rootSchema, `${valuePath}[${index}]`, errors),
      );
    }
    return;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${valuePath}: 문자열이어야 합니다.`);
      return;
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${valuePath}: 문자열이 너무 짧습니다.`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`${valuePath}: 문자열이 너무 깁니다.`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${valuePath}: 문자열 형식이 올바르지 않습니다.`);
    }
    if (schema.format === "date" && !isValidCalendarDate(value)) {
      errors.push(`${valuePath}: 유효한 YYYY-MM-DD 날짜여야 합니다.`);
    }
    return;
  }

  if (schema.type === "integer") {
    if (!Number.isInteger(value)) {
      errors.push(`${valuePath}: 정수여야 합니다.`);
      return;
    }
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${valuePath}: ${schema.minimum}보다 작습니다.`);
    }
  }
}

function validateCodeQuestCollection(collection, curriculum, schema) {
  const errors = [];
  validateSchemaValue(collection, schema, schema, "$", errors);
  if (!isPlainRecord(collection) || !Array.isArray(collection.quests)) return errors;

  const lessonById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  const questIds = new Set();
  const slugs = new Set();

  collection.quests.forEach((quest, index) => {
    const label = `quests[${index}]`;
    if (!isPlainRecord(quest)) return;

    if (questIds.has(quest.id)) errors.push(`${label}: Quest ID가 중복됩니다 (${quest.id}).`);
    else questIds.add(quest.id);
    if (slugs.has(quest.slug)) errors.push(`${label}: Quest slug가 중복됩니다 (${quest.slug}).`);
    else slugs.add(quest.slug);

    if (quest.order !== index + 1) {
      errors.push(`${label}.order: 1부터 빈틈없이 이어져야 합니다.`);
    }
    if (!Number.isSafeInteger(quest.revision) || quest.revision < 1) {
      errors.push(`${label}.revision: 1 이상의 안전한 정수여야 합니다.`);
    }
    if (
      isNonEmptyString(collection.languageId) &&
      isNonEmptyString(quest.id) &&
      !quest.id.startsWith(`quest-${collection.languageId}-`)
    ) {
      errors.push(`${label}.id: languageId 네임스페이스로 시작해야 합니다.`);
    }

    const lesson = lessonById.get(quest.lessonId);
    if (!lesson) {
      errors.push(`${label}.lessonId: 존재하지 않는 교안입니다 (${quest.lessonId}).`);
    } else {
      if (lesson.languageId !== collection.languageId) {
        errors.push(`${label}.lessonId: 다른 언어의 교안을 참조합니다.`);
      }
      if (Array.isArray(quest.conceptIds)) {
        for (const conceptId of quest.conceptIds) {
          if (!lesson.conceptIds.includes(conceptId)) {
            errors.push(`${label}.conceptIds: 연결 교안에 없는 개념입니다 (${conceptId}).`);
          }
        }
      }
    }

    if (isNonEmptyString(quest.entryPoint) && isNonEmptyString(quest.starterCode)) {
      const escapedEntryPoint = quest.entryPoint.replaceAll(/[$]/g, "\\$");
      const declaration = quest.starterCode.match(
        new RegExp(`function\\s+${escapedEntryPoint}\\s*\\(([^)]*)\\)`),
      );
      if (!declaration) {
        errors.push(`${label}.starterCode: entryPoint 함수 선언을 찾을 수 없습니다.`);
      } else if (Array.isArray(quest.functionContract?.parameters)) {
        const declaredParameters = declaration[1]
          .split(",")
          .map((parameter) => parameter.trim())
          .filter(Boolean);
        const contractedParameters = quest.functionContract.parameters.map(
          (parameter) => parameter.name,
        );
        if (JSON.stringify(declaredParameters) !== JSON.stringify(contractedParameters)) {
          errors.push(`${label}.starterCode: 함수 매개변수 계약과 다릅니다.`);
        }
      }
    }
    if (
      isNonEmptyString(quest.starterCode) &&
      FORBIDDEN_RUNTIME_API_PATTERN.test(quest.starterCode)
    ) {
      errors.push(`${label}.starterCode: 결정적 순수 함수 범위를 벗어나는 API가 있습니다.`);
    }

    if (Array.isArray(quest.functionContract?.parameters)) {
      const parameterCount = quest.functionContract.parameters.length;
      for (const [testKind, cases] of [
        ["examples", quest.examples],
        ["publicTests", quest.publicTests],
      ]) {
        if (!Array.isArray(cases)) continue;
        cases.forEach((testCase, caseIndex) => {
          if (Array.isArray(testCase?.args) && testCase.args.length !== parameterCount) {
            errors.push(
              `${label}.${testKind}[${caseIndex}].args: 함수 계약과 인수 개수가 다릅니다.`,
            );
          }
        });
      }
    }

    if (Array.isArray(quest.examples) && Array.isArray(quest.publicTests)) {
      for (const example of quest.examples) {
        const matchesPublicTest = quest.publicTests.some(
          (publicTest) =>
            areJsonValuesEqual(publicTest.args, example.args) &&
            areJsonValuesEqual(publicTest.expected, example.expected),
        );
        if (!matchesPublicTest) {
          errors.push(`${label}.examples: 공개 테스트와 일치하지 않는 입출력 예가 있습니다.`);
        }
      }
    }

    if (Array.isArray(quest.publicTests) && Array.isArray(quest.failureExplanations)) {
      const publicTestIds = quest.publicTests.map((publicTest) => publicTest.id).sort();
      const explanationIds = quest.failureExplanations
        .map((explanation) => explanation.testId)
        .sort();
      if (JSON.stringify(publicTestIds) !== JSON.stringify(explanationIds)) {
        errors.push(`${label}.failureExplanations: 공개 테스트마다 정확히 하나씩 필요합니다.`);
      }
    }

    if (Array.isArray(quest.hints)) {
      const stages = quest.hints.slice(0, 3).map((hint) => hint.stage);
      const levels = quest.hints.slice(0, 3).map((hint) => hint.level);
      if (JSON.stringify(stages) !== JSON.stringify(HINT_STAGES)) {
        errors.push(`${label}.hints: 개념→관찰→구현 순서여야 합니다.`);
      }
      if (JSON.stringify(levels) !== JSON.stringify([1, 2, 3])) {
        errors.push(`${label}.hints: level은 1부터 순서대로 시작해야 합니다.`);
      }
    }

    if (NON_PUBLIC_TEST_TERMS.test(JSON.stringify(quest))) {
      errors.push(`${label}: 공개 테스트를 잘못 표현하는 문구가 있습니다.`);
    }
  });

  return errors;
}

async function main() {
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curriculumArguments = process.argv.slice(2);
if (
  curriculumArguments.length !== 0 &&
  !(
    curriculumArguments.length === 2 &&
    curriculumArguments[0] === "--curriculum" &&
    curriculumArguments[1].trim()
  )
) {
  throw new Error("사용법: node scripts/validate-content.mjs [--curriculum <파일 경로>]");
}

const curriculumPath = curriculumArguments.length
  ? path.resolve(curriculumArguments[1])
  : path.join(projectRoot, "content", "curriculum.json");
const curriculumSchemaPath = path.join(
  projectRoot,
  "content",
  "schema",
  "curriculum.schema.json",
);
const curriculumSchema = JSON.parse(await readFile(curriculumSchemaPath, "utf8"));
const curriculumDocument = JSON.parse(await readFile(curriculumPath, "utf8"));
const curriculumSchemaErrors = [];
validateSchemaValue(curriculumDocument, curriculumSchema, curriculumSchema, "$", curriculumSchemaErrors);
if (curriculumSchemaErrors.length > 0) {
  throw new Error(`커리큘럼 스키마 검증 실패:\n- ${curriculumSchemaErrors.join("\n- ")}`);
}
const curriculum = assertValidCurriculum(curriculumDocument);
const contentErrors = [];

for (const lesson of curriculum.lessons) {
  const absolutePath = path.resolve(projectRoot, lesson.contentFile);
  if (!absolutePath.startsWith(`${path.join(projectRoot, "content", "lessons")}${path.sep}`)) {
    contentErrors.push(`${lesson.id}: 콘텐츠 디렉터리 밖을 가리킵니다.`);
    continue;
  }

  try {
    await access(absolutePath);
    const markdown = await readFile(absolutePath, "utf8");
    if (!markdown.startsWith("# ")) {
      contentErrors.push(`${lesson.id}: H1 제목으로 시작해야 합니다.`);
    }
    if (markdown.length < 500) {
      contentErrors.push(`${lesson.id}: 교안 본문이 지나치게 짧습니다.`);
    }
    if (lesson.source.importMode === "derived" && !lesson.answerHeading) {
      contentErrors.push(`${lesson.id}: 파생 교안에는 직접답을 가리키는 answerHeading이 필요합니다.`);
    }
    if (lesson.answerHeading !== undefined) {
      const answer = splitMarkdownSection(markdown, lesson.answerHeading);
      const answerId = headingId(lesson.answerHeading);
      const headingCount = [...renderMarkdown(markdown).matchAll(/<h2 id="([^"]+)">/g)]
        .filter((match) => match[1] === answerId).length;
      if (!answer.section || headingCount !== 1) {
        contentErrors.push(`${lesson.id}: answerHeading과 일치하는 비어 있지 않은 직접답 절이 정확히 하나 필요합니다.`);
      }
    }
    // 검증된 출처를 가진 반입본은 원문 형식을 보존하고 metadata의 학습 목표를 사용한다.
    if (lesson.source.originalPath) {
      if (
        lesson.source.importMode === "copy" &&
        createHash("sha256").update(markdown, "utf8").digest("hex") !== lesson.source.sha256
      ) {
        contentErrors.push(`${lesson.id}: 반입 원문 복사본의 SHA-256이 source.sha256과 다릅니다.`);
      }
      continue;
    }
    if (!markdown.includes("## 학습 목표")) {
      contentErrors.push(`${lesson.id}: 학습 목표 섹션이 없습니다.`);
    }
    // 명시한 직접답 절은 위에서 검사하며, 작은 새 저작에는 종전 답변 형식을 요구하지 않는다.
    if (lesson.answerHeading !== undefined) continue;
    if (!markdown.includes("## 확인 문제") && !markdown.includes("## 최종 확인 문제")) {
      contentErrors.push(`${lesson.id}: 확인 문제 섹션이 없습니다.`);
    }
    const confirmationMatch = markdown.match(
      /\n## (?:최종 )?확인 문제\n([\s\S]*?)(?=\n## |$)/,
    );
    const questionNumbers = confirmationMatch
      ? [...confirmationMatch[1].matchAll(/^(\d+)\.\s+.+$/gm)].map((match) => Number(match[1]))
      : [];
    if (isLegacyJavaArchiveWithoutInterviewAnswers(lesson, markdown)) continue;
    const answerHeading = "\n## 면접 답변 예시\n";
    const answerSections = markdown.split(answerHeading);
    if (answerSections.length !== 2) {
      contentErrors.push(`${lesson.id}: 면접 답변 예시 섹션이 정확히 하나 필요합니다.`);
    } else {
      const answerNumbers = [...answerSections[1].matchAll(/^### 답변 (\d+)\s*$/gm)].map(
        (match) => Number(match[1]),
      );
      const answerBodies = answerSections[1].split(/^### 답변 \d+\s*$/gm).slice(1);
      const expectedNumbers = questionNumbers.map((_, index) => index + 1);
      const answerStartsAfterQuestions =
        confirmationMatch && markdown.indexOf(answerHeading) > confirmationMatch.index;
      const answerIsLastSection = !answerSections[1].includes("\n## ");
      if (
        questionNumbers.length === 0 ||
        !answerStartsAfterQuestions ||
        !answerIsLastSection ||
        questionNumbers.some((number, index) => number !== expectedNumbers[index]) ||
        answerNumbers.length !== questionNumbers.length ||
        answerNumbers.some((number, index) => number !== questionNumbers[index]) ||
        answerBodies.some((body) => body.trim().length === 0)
      ) {
        contentErrors.push(
          `${lesson.id}: 확인 문제와 답변 예시의 개수·순서·내용이 일치해야 합니다.`,
        );
      }
    }
  } catch {
    contentErrors.push(`${lesson.id}: ${lesson.contentFile} 파일을 읽을 수 없습니다.`);
  }
}

if (contentErrors.length > 0) {
  throw new Error(`콘텐츠 파일 검증 실패:\n- ${contentErrors.join("\n- ")}`);
}

const quizSchemaPath = path.join(projectRoot, "content", "schema", "quiz.schema.json");
let quizSchema;
try {
  quizSchema = JSON.parse(await readFile(quizSchemaPath, "utf8"));
} catch {
  contentErrors.push("객관식 스키마 파일을 읽을 수 없습니다.");
}

const quizDirectory = path.join(projectRoot, "content", "quizzes");
const quizCollections = new Map();
const questionIds = new Set();
let quizFileNames = [];
try {
  quizFileNames = (await readdir(quizDirectory))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
} catch {
  contentErrors.push("객관식 콘텐츠 디렉터리를 읽을 수 없습니다.");
}

for (const fileName of quizFileNames) {
  const languageId = fileName.slice(0, -".json".length);
  const quizPath = path.join(quizDirectory, fileName);
  try {
    const quiz = JSON.parse(await readFile(quizPath, "utf8"));
    if (quizSchema) {
      const quizSchemaErrors = [];
      validateSchemaValue(quiz, quizSchema, quizSchema, "$", quizSchemaErrors);
      if (quizSchemaErrors.length > 0) {
        throw new Error(`JSON Schema 불일치:\n- ${quizSchemaErrors.join("\n- ")}`);
      }
    }
    const collection = assertValidQuizCollection(quiz, curriculum);
    if (collection.languageId !== languageId) {
      throw new Error(`파일명 언어 ${languageId}와 languageId ${collection.languageId}가 다릅니다.`);
    }
    if (!curriculum.languages.some((language) => language.id === languageId)) {
      throw new Error(`커리큘럼에 없는 언어입니다: ${languageId}`);
    }
    for (const question of collection.questions) {
      if (questionIds.has(question.id)) {
        throw new Error(`다른 컬렉션과 문제 ID가 중복됩니다: ${question.id}`);
      }
      questionIds.add(question.id);
    }
    quizCollections.set(languageId, collection);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    contentErrors.push(`${languageId}: 객관식 콘텐츠 검증 실패 (${message})`);
  }
}

for (const language of curriculum.languages.filter((item) =>
  ["available", "sample"].includes(item.status),
)) {
  if (!quizCollections.has(language.id)) {
    contentErrors.push(`${language.id}: 탐색 가능한 언어의 객관식 콘텐츠가 없습니다.`);
  }
}

try {
  const data = JSON.parse(await readFile(path.join(projectRoot, "content", "review-concepts.json"), "utf8"));
  const concepts = validateReviewConcepts(data, curriculum);
  if (data.schemaVersion !== 1 || !Array.isArray(data.concepts) || concepts.length !== data.concepts.length) {
    contentErrors.push("개념 발췌의 문서·언어·과정·개념 연결이나 중복을 확인해 주세요.");
  }
  for (const concept of concepts) {
    const lesson = getReviewDocumentLesson(curriculum, concept);
    const questions = quizCollections.get(lesson.languageId)?.questions ?? [];
    if (!questions.some((question) => question.lessonId === concept.lessonId && question.conceptId === concept.id)) {
      contentErrors.push(`${concept.id}: 개념 발췌에 연결된 실제 문항이 없습니다.`);
    }
    const markdown = await readFile(path.join(projectRoot, lesson.contentFile), "utf8");
    const section = splitMarkdownSection(markdown, concept.heading).section;
    if (!section || !section.slice(section.indexOf("\n") + 1).includes(concept.excerpt)) {
      contentErrors.push(`${concept.id}: 상세 문서의 실제 절과 발췌가 일치하지 않습니다.`);
    }
  }
} catch (error) {
  contentErrors.push(`개념 발췌 검증 실패 (${error.message})`);
}

const codeQuestSchemaPath = path.join(projectRoot, "content", "schema", "code-quest.schema.json");
let codeQuestSchema;
try {
  codeQuestSchema = JSON.parse(await readFile(codeQuestSchemaPath, "utf8"));
} catch {
  contentErrors.push("Code Quest 스키마 파일을 읽을 수 없습니다.");
}

const webCodeQuestSchemaPath = path.join(
  projectRoot,
  "content",
  "schema",
  "web-code-quest.schema.json",
);
let webCodeQuestSchema;
try {
  webCodeQuestSchema = JSON.parse(await readFile(webCodeQuestSchemaPath, "utf8"));
} catch {
  contentErrors.push("HTML·CSS Code Quest 스키마 파일을 읽을 수 없습니다.");
}

const questDirectory = path.join(projectRoot, "content", "quests");
const questCollections = new Map();
const questIds = new Set();
const questSlugs = new Set();
const publicTestIds = new Set();
let questFileNames = [];
try {
  questFileNames = (await readdir(questDirectory))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
} catch {
  contentErrors.push("Code Quest 콘텐츠 디렉터리를 읽을 수 없습니다.");
}

for (const fileName of questFileNames) {
  const languageId = fileName.slice(0, -".json".length);
  const questPath = path.join(questDirectory, fileName);
  try {
    if (!STABLE_ID_PATTERN.test(languageId)) {
      throw new Error(`파일명 언어 ID 형식이 올바르지 않습니다: ${languageId}`);
    }

    const collection = JSON.parse(await readFile(questPath, "utf8"));
    const isWebCollection = Object.hasOwn(collection, "evaluationKind");
    if (isWebCollection && webCodeQuestSchema) {
      const schemaErrors = [];
      validateSchemaValue(
        collection,
        webCodeQuestSchema,
        webCodeQuestSchema,
        "$",
        schemaErrors,
      );
      if (schemaErrors.length > 0) {
        throw new Error(`JSON Schema 불일치:\n- ${schemaErrors.join("\n- ")}`);
      }
      assertValidWebCodeQuestCollection(collection, curriculum);
    } else if (!isWebCollection && codeQuestSchema) {
      const validationErrors = validateCodeQuestCollection(
        collection,
        curriculum,
        codeQuestSchema,
      );
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n- "));
      }
    }
    if (collection.languageId !== languageId) {
      throw new Error(`파일명 언어 ${languageId}와 languageId ${collection.languageId}가 다릅니다.`);
    }
    if (!curriculum.languages.some((language) => language.id === languageId)) {
      throw new Error(`커리큘럼에 없는 언어입니다: ${languageId}`);
    }

    for (const quest of collection.quests) {
      if (questIds.has(quest.id)) {
        throw new Error(`다른 컬렉션과 Quest ID가 중복됩니다: ${quest.id}`);
      }
      if (questSlugs.has(quest.slug)) {
        throw new Error(`다른 컬렉션과 Quest slug가 중복됩니다: ${quest.slug}`);
      }
      questIds.add(quest.id);
      questSlugs.add(quest.slug);

      for (const publicTest of quest.publicTests) {
        if (publicTestIds.has(publicTest.id)) {
          throw new Error(`다른 Quest와 공개 테스트 ID가 중복됩니다: ${publicTest.id}`);
        }
        publicTestIds.add(publicTest.id);
      }

      if (isWebCollection) {
        createWebCodeQuestExecutionRequest(
          collection,
          quest,
          quest.starterCode,
          `validate-${quest.id}`,
        );
      } else if (languageId === "javascript") {
        assertValidExecutionRequest({
          requestId: `validate-${quest.id}`,
          contractVersion: collection.contractVersion,
          questId: quest.id,
          questRevision: quest.revision,
          languageId: collection.languageId,
          suite: "public",
          source: quest.starterCode,
          entryPoint: quest.entryPoint,
          tests: quest.publicTests.map(({ id, label, args, expected }) => ({
            id,
            label,
            args,
            expected,
          })),
        });
      }
    }

    questCollections.set(languageId, collection);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    contentErrors.push(`${languageId}: Code Quest 콘텐츠 검증 실패 (${message})`);
  }
}

// 정적 교안·객관식의 available 상태와 실행형 Code Quest 제공 범위는 별개다.
const requiredCodeQuestLanguages = new Set(["javascript", "html", "css"]);
for (const language of curriculum.languages.filter((item) =>
  item.status === "available" && requiredCodeQuestLanguages.has(item.id),
)) {
  if (!questCollections.has(language.id)) {
    contentErrors.push(`${language.id}: 사용 가능한 언어의 Code Quest 콘텐츠가 없습니다.`);
  }
}

const codingTestSchemaPath = path.join(
  projectRoot,
  "content",
  "schema",
  "coding-test.schema.json",
);
let codingTestSchema;
try {
  codingTestSchema = JSON.parse(await readFile(codingTestSchemaPath, "utf8"));
} catch {
  contentErrors.push("코딩테스트 스키마 파일을 읽을 수 없습니다.");
}

const codingTestDirectory = path.join(projectRoot, "content", "coding-tests");
const codingTestCollections = new Map();
const codingTestProblemIds = new Set();
const codingTestSlugs = new Set();
const codingTestPublicTestIds = new Set();
let codingTestFileNames = [];
try {
  codingTestFileNames = (await readdir(codingTestDirectory))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
} catch {
  contentErrors.push("코딩테스트 콘텐츠 디렉터리를 읽을 수 없습니다.");
}

for (const fileName of codingTestFileNames) {
  const languageId = fileName.slice(0, -".json".length);
  const codingTestPath = path.join(codingTestDirectory, fileName);
  try {
    if (!STABLE_ID_PATTERN.test(languageId)) {
      throw new Error(`파일명 언어 ID 형식이 올바르지 않습니다: ${languageId}`);
    }
    const document = JSON.parse(await readFile(codingTestPath, "utf8"));
    if (codingTestSchema) {
      const schemaErrors = [];
      validateSchemaValue(
        document,
        codingTestSchema,
        codingTestSchema,
        "$",
        schemaErrors,
      );
      if (schemaErrors.length > 0) {
        throw new Error(`JSON Schema 불일치:\n- ${schemaErrors.join("\n- ")}`);
      }
    }
    const collection = assertValidCodingTestCollection(document, curriculum);
    if (collection.languageId !== languageId) {
      throw new Error(
        `파일명 언어 ${languageId}와 languageId ${collection.languageId}가 다릅니다.`,
      );
    }
    if (!curriculum.languages.some((language) => language.id === languageId)) {
      throw new Error(`커리큘럼에 없는 언어입니다: ${languageId}`);
    }

    for (const problem of collection.problems) {
      if (codingTestProblemIds.has(problem.id)) {
        throw new Error(`다른 컬렉션과 코딩테스트 문제 ID가 중복됩니다: ${problem.id}`);
      }
      if (codingTestSlugs.has(problem.slug)) {
        throw new Error(`다른 컬렉션과 코딩테스트 slug가 중복됩니다: ${problem.slug}`);
      }
      codingTestProblemIds.add(problem.id);
      codingTestSlugs.add(problem.slug);
      for (const publicTest of problem.publicTests) {
        if (codingTestPublicTestIds.has(publicTest.id)) {
          throw new Error(
            `다른 코딩테스트 문제와 공개 테스트 ID가 중복됩니다: ${publicTest.id}`,
          );
        }
        codingTestPublicTestIds.add(publicTest.id);
      }
    }
    codingTestCollections.set(languageId, collection);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    contentErrors.push(`${languageId}: 코딩테스트 콘텐츠 검증 실패 (${message})`);
  }
}

if (!codingTestCollections.has("javascript")) {
  contentErrors.push("javascript: 4차 코딩테스트 콘텐츠가 없습니다.");
}

const webProjectSchemaPath = path.join(
  projectRoot,
  "content",
  "schema",
  "web-project.schema.json",
);
const webProjectContentPath = path.join(
  projectRoot,
  "content",
  "web-projects",
  "index.json",
);
let webProjectCollection = null;
try {
  const [webProjectSchemaText, webProjectContentText] = await Promise.all([
    readFile(webProjectSchemaPath, "utf8"),
    readFile(webProjectContentPath, "utf8"),
  ]);
  const webProjectSchema = JSON.parse(webProjectSchemaText);
  const webProjectDocument = JSON.parse(webProjectContentText);
  const schemaErrors = [];
  validateSchemaValue(
    webProjectDocument,
    webProjectSchema,
    webProjectSchema,
    "$",
    schemaErrors,
  );
  if (schemaErrors.length > 0) {
    throw new Error(`JSON Schema 불일치:\n- ${schemaErrors.join("\n- ")}`);
  }
  webProjectCollection = assertValidWebProjectCollection(
    webProjectDocument,
    curriculum,
  );
  if (NON_PUBLIC_TEST_TERMS.test(JSON.stringify(webProjectCollection))) {
    throw new Error("자동 검사를 비공개 테스트로 오해하게 하는 문구가 있습니다.");
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  contentErrors.push(`Web Project 콘텐츠 검증 실패 (${message})`);
}

if (contentErrors.length > 0) {
  throw new Error(`콘텐츠 파일 검증 실패:\n- ${contentErrors.join("\n- ")}`);
}

const availableLanguages = curriculum.languages.filter((language) => language.status === "available");
const sampleLanguages = curriculum.languages.filter((language) => language.status === "sample");
const codingTestProblemCount = [...codingTestCollections.values()].reduce(
  (total, collection) => total + collection.problems.length,
  0,
);
const webProjectCount = webProjectCollection?.projects.length ?? 0;
console.log(
  `콘텐츠 검증 완료: 정식 언어 ${availableLanguages.length}개, 샘플 언어 ${sampleLanguages.length}개, 교안 ${curriculum.lessons.length}개, 객관식 ${[...quizCollections.values()].reduce((total, collection) => total + collection.questions.length, 0)}문항, Code Quest ${[...questCollections.values()].reduce((total, collection) => total + collection.quests.length, 0)}개, 코딩테스트 ${codingTestProblemCount}개, Web Project ${webProjectCount}개`,
);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) await main();
