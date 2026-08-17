import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const quiz = JSON.parse(
  await readFile(new URL("../content/quizzes/javascript.json", import.meta.url), "utf8"),
);
const quizSchema = JSON.parse(
  await readFile(new URL("../content/schema/quiz.schema.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

function resolveLocalReference(reference) {
  assert.match(reference, /^#\//, `지원하지 않는 스키마 참조입니다: ${reference}`);

  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], quizSchema);
}

function validateAgainstSchema(value, schema, path = "$") {
  if (schema.$ref) {
    const referencedSchema = resolveLocalReference(schema.$ref);
    assert.ok(referencedSchema, `${path}: 스키마 참조를 찾을 수 없습니다.`);
    validateAgainstSchema(value, referencedSchema, path);
    return;
  }

  if (Object.hasOwn(schema, "const")) {
    assert.deepEqual(value, schema.const, `${path}: const 조건을 만족하지 않습니다.`);
  }

  if (schema.enum) {
    assert.ok(schema.enum.includes(value), `${path}: 허용된 enum 값이 아닙니다.`);
  }

  if (schema.type === "object") {
    assert.ok(
      value !== null && typeof value === "object" && !Array.isArray(value),
      `${path}: 객체여야 합니다.`,
    );

    for (const requiredKey of schema.required ?? []) {
      assert.ok(Object.hasOwn(value, requiredKey), `${path}.${requiredKey}: 필수 필드입니다.`);
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) {
        assert.ok(allowedKeys.has(key), `${path}.${key}: 허용되지 않은 필드입니다.`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateAgainstSchema(value[key], propertySchema, `${path}.${key}`);
      }
    }
  }

  if (schema.type === "array") {
    assert.ok(Array.isArray(value), `${path}: 배열이어야 합니다.`);

    if (schema.minItems !== undefined) {
      assert.ok(value.length >= schema.minItems, `${path}: 항목 수가 minItems보다 적습니다.`);
    }
    if (schema.maxItems !== undefined) {
      assert.ok(value.length <= schema.maxItems, `${path}: 항목 수가 maxItems보다 많습니다.`);
    }
    if (schema.uniqueItems) {
      assert.equal(
        new Set(value.map((item) => JSON.stringify(item))).size,
        value.length,
        `${path}: 중복 항목이 있습니다.`,
      );
    }

    if (schema.items) {
      value.forEach((item, index) => validateAgainstSchema(item, schema.items, `${path}[${index}]`));
    }

    if (schema.contains) {
      const matchCount = value.filter((item, index) => {
        try {
          validateAgainstSchema(item, schema.contains, `${path}[${index}]`);
          return true;
        } catch {
          return false;
        }
      }).length;

      if (schema.minContains !== undefined) {
        assert.ok(
          matchCount >= schema.minContains,
          `${path}: contains 조건을 만족하는 항목이 부족합니다.`,
        );
      }
      if (schema.maxContains !== undefined) {
        assert.ok(
          matchCount <= schema.maxContains,
          `${path}: contains 조건을 만족하는 항목이 너무 많습니다.`,
        );
      }
    }
  }

  if (schema.type === "string") {
    assert.equal(typeof value, "string", `${path}: 문자열이어야 합니다.`);
    if (schema.minLength !== undefined) {
      assert.ok(value.length >= schema.minLength, `${path}: 문자열이 너무 짧습니다.`);
    }
    if (schema.pattern) {
      assert.match(value, new RegExp(schema.pattern), `${path}: 문자열 형식이 올바르지 않습니다.`);
    }
  }

  if (schema.type === "boolean") {
    assert.equal(typeof value, "boolean", `${path}: boolean이어야 합니다.`);
  }
}

function normalizeText(value) {
  return value.normalize("NFKC").replaceAll(/\s+/g, " ").trim().toLocaleLowerCase("ko-KR");
}

function assertUnique(values, message) {
  assert.equal(new Set(values).size, values.length, message);
}

test("JavaScript 퀴즈가 JSON Schema를 통과한다", () => {
  assert.doesNotThrow(() => validateAgainstSchema(quiz, quizSchema));
});

test("퀴즈 스키마는 언어 중립 컬렉션을 허용한다", () => {
  assert.equal(quizSchema.title, "BAM.dev quiz collection");
  assert.equal(quizSchema.properties.languageId.const, undefined);
  assert.equal(
    quizSchema.properties.languageId.pattern,
    "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
  );
  assert.equal(
    quizSchema.$defs.question.properties.lessonId.pattern,
    "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  );
  assert.equal(
    quizSchema.$defs.question.properties.id.pattern,
    "^quiz-[a-z][a-z0-9]*(?:-[a-z0-9]+)+$",
  );
  assert.equal(quizSchema.properties.questions.minItems, 1);
  assert.equal(quizSchema.properties.questions.maxItems, undefined);

  for (const languageId of ["html", "css", "java"]) {
    const sampleQuestion = structuredClone(quiz.questions[0]);
    sampleQuestion.id = `quiz-${languageId}-sample`;
    sampleQuestion.lessonId = `${languageId}-01-sample`;
    sampleQuestion.conceptId = `${languageId}.sample`;

    assert.doesNotThrow(() =>
      validateAgainstSchema(
        {
          schemaVersion: 1,
          languageId,
          title: `${languageId} sample`,
          questions: [sampleQuestion],
        },
        quizSchema,
      ),
    );
  }

  for (const languageId of ["html-", "html--sample"]) {
    assert.throws(() =>
      validateAgainstSchema(
        {
          schemaVersion: 1,
          languageId,
          title: "invalid sample",
          questions: [quiz.questions[0]],
        },
        quizSchema,
      ),
    );
  }

  for (const [field, invalidId] of [
    ["id", "quiz-html--sample"],
    ["id", "quiz-html-sample-"],
    ["lessonId", "html--01-sample"],
    ["lessonId", "html-01-sample-"],
  ]) {
    const sampleQuestion = structuredClone(quiz.questions[0]);
    sampleQuestion[field] = invalidId;

    assert.throws(() =>
      validateAgainstSchema(
        {
          schemaVersion: 1,
          languageId: "html",
          title: "invalid sample",
          questions: [sampleQuestion],
        },
        quizSchema,
      ),
    );
  }
});

test("7개 교안에 basic과 application 문항이 하나씩 있다", () => {
  const lessons = curriculum.lessons.filter((lesson) => lesson.languageId === quiz.languageId);

  assert.equal(quiz.schemaVersion, 1);
  assert.equal(quiz.languageId, "javascript");
  assert.ok(quiz.title.trim().length > 0);
  assert.equal(lessons.length, 7);
  assert.equal(quiz.questions.length, 14);

  for (const lesson of lessons) {
    const questions = quiz.questions.filter((question) => question.lessonId === lesson.id);
    assert.equal(questions.length, 2, `${lesson.id}: 문항이 정확히 2개여야 합니다.`);
    assert.deepEqual(
      questions.map((question) => question.difficulty).sort(),
      ["application", "basic"],
      `${lesson.id}: basic과 application 문항이 하나씩 필요합니다.`,
    );
    assertUnique(
      questions.map((question) => question.conceptId),
      `${lesson.id}: 두 문항은 서로 다른 개념 ID를 사용해야 합니다.`,
    );
  }
});

test("문항 ID와 lessonId·conceptId 참조가 유효하다", () => {
  const lessonById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  const questionIds = quiz.questions.map((question) => question.id);

  assertUnique(questionIds, "문항 ID가 중복됩니다.");

  for (const question of quiz.questions) {
    const lesson = lessonById.get(question.lessonId);

    assert.ok(
      question.id.startsWith(`quiz-${quiz.languageId}-`),
      `${question.id}: 컬렉션 languageId 네임스페이스로 시작해야 합니다.`,
    );
    assert.ok(lesson, `${question.id}: 존재하지 않는 lessonId입니다.`);
    assert.equal(
      lesson.languageId,
      quiz.languageId,
      `${question.id}: 다른 언어의 교안을 참조합니다.`,
    );
    assert.ok(
      lesson.conceptIds.includes(question.conceptId),
      `${question.id}: conceptId가 참조 교안에 속하지 않습니다.`,
    );
    assert.ok(question.prompt.trim().length > 0, `${question.id}: 질문 본문이 비어 있습니다.`);
    if (question.code !== undefined) {
      assert.ok(question.code.trim().length > 0, `${question.id}: 코드가 비어 있습니다.`);
    }
  }
});

test("각 문항은 중복 없는 선택지 4개와 하나의 정답, 모든 feedback을 가진다", () => {
  for (const question of quiz.questions) {
    assert.equal(question.options.length, 4, `${question.id}: 선택지는 정확히 4개여야 합니다.`);
    assert.deepEqual(
      question.options.map((option) => option.id).sort(),
      ["a", "b", "c", "d"],
      `${question.id}: 선택지 ID는 a, b, c, d여야 합니다.`,
    );
    assertUnique(
      question.options.map((option) => normalizeText(option.text)),
      `${question.id}: 선택지 문구가 중복됩니다.`,
    );
    assert.equal(
      question.options.filter((option) => option.isCorrect).length,
      1,
      `${question.id}: 정답은 정확히 하나여야 합니다.`,
    );

    for (const option of question.options) {
      assert.ok(option.text.trim().length > 0, `${question.id}/${option.id}: 문구가 비어 있습니다.`);
      assert.ok(
        option.feedback.trim().length > 0,
        `${question.id}/${option.id}: feedback이 비어 있습니다.`,
      );
    }
  }
});

test("첫 문항은 ECMAScript 계산 규칙과 실행 환경의 Console 역할을 구분한다", () => {
  const question = quiz.questions.find(
    ({ id }) => id === "quiz-javascript-01-ecmascript-runtime",
  );
  const correctOption = question?.options.find(({ isCorrect }) => isCorrect);

  assert.ok(question);
  assert.equal(question.lessonId, "js-01-runtime");
  assert.equal(question.conceptId, "js.ecmascript");
  assert.match(question.prompt, /계산/);
  assert.match(question.prompt, /각 환경에 `console\.log\(\)`가 제공된다면 출력/);
  assert.equal(correctOption?.id, "a");
  assert.match(correctOption.text, /ECMAScript 규칙/);
  assert.match(correctOption.text, /실행 환경이 제공하는 `console\.log\(\)`/);
  assert.match(correctOption.feedback, /언어 규칙/);
  assert.match(correctOption.feedback, /실행 환경이 제공하는 출력 기능/);
});

test("새 문항끼리 또는 기존 확인 문제와 문구가 중복되지 않는다", async () => {
  const normalizedPrompts = quiz.questions.map((question) => normalizeText(question.prompt));
  assertUnique(normalizedPrompts, "새 문항의 질문 본문이 중복됩니다.");

  const existingQuestions = [];
  for (const lesson of curriculum.lessons.filter((item) => item.languageId === quiz.languageId)) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const confirmationSection = markdown.split(/\n## (?:최종 )?확인 문제\n/).at(-1);

    for (const line of confirmationSection.split("\n")) {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) existingQuestions.push(normalizeText(match[1]));
    }
  }

  for (const question of quiz.questions) {
    assert.ok(
      !existingQuestions.includes(normalizeText(question.prompt)),
      `${question.id}: 기존 확인 문제 문구를 그대로 사용했습니다.`,
    );
  }
});
