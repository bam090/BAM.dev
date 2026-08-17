const ALLOWED_DIFFICULTIES = new Set(["basic", "application"]);
const ALLOWED_OPTION_IDS = new Set(["a", "b", "c", "d"]);
const COLLECTION_FIELDS = new Set(["schemaVersion", "languageId", "title", "questions"]);
const QUESTION_FIELDS = new Set([
  "id",
  "lessonId",
  "conceptId",
  "difficulty",
  "prompt",
  "code",
  "options",
]);
const OPTION_FIELDS = new Set(["id", "text", "isCorrect", "feedback"]);
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LANGUAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CONCEPT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function findUnknownFields(value, allowedFields) {
  return Object.keys(value).filter((field) => !allowedFields.has(field));
}

export function validateQuizCollection(collection, curriculum) {
  const errors = [];
  if (!collection || typeof collection !== "object") {
    return ["객관식 컬렉션은 객체여야 합니다."];
  }
  const unknownCollectionFields = findUnknownFields(collection, COLLECTION_FIELDS);
  if (unknownCollectionFields.length > 0) {
    errors.push(`객관식 컬렉션에 허용되지 않은 필드가 있습니다: ${unknownCollectionFields.join(", ")}`);
  }
  if (collection.schemaVersion !== 1) {
    errors.push("지원하는 객관식 schemaVersion은 1입니다.");
  }
  if (!isNonEmptyString(collection.languageId) || !LANGUAGE_ID_PATTERN.test(collection.languageId)) {
    errors.push("languageId 형식이 올바르지 않습니다.");
  }
  if (!isNonEmptyString(collection.title)) {
    errors.push("객관식 컬렉션 제목이 필요합니다.");
  }
  if (!Array.isArray(collection.questions) || collection.questions.length === 0) {
    errors.push("questions에는 한 개 이상의 문제가 필요합니다.");
    return errors;
  }

  const curriculumLessons = new Map(
    (curriculum?.lessons ?? []).map((lesson) => [lesson.id, lesson]),
  );
  const questionIds = new Set();

  collection.questions.forEach((question, questionIndex) => {
    const label = `questions[${questionIndex}]`;
    if (!question || typeof question !== "object") {
      errors.push(`${label}은 객체여야 합니다.`);
      return;
    }
    const unknownQuestionFields = findUnknownFields(question, QUESTION_FIELDS);
    if (unknownQuestionFields.length > 0) {
      errors.push(`${label}에 허용되지 않은 필드가 있습니다: ${unknownQuestionFields.join(", ")}`);
    }
    const questionIdPattern = LANGUAGE_ID_PATTERN.test(collection.languageId ?? "")
      ? new RegExp(`^quiz-${collection.languageId}-[a-z0-9]+(?:-[a-z0-9]+)*$`)
      : null;
    if (!isNonEmptyString(question.id) || !questionIdPattern?.test(question.id)) {
      errors.push(`${label}.id 형식이 올바르지 않습니다.`);
    } else if (questionIds.has(question.id)) {
      errors.push(`문제 ID가 중복됩니다: ${question.id}`);
    }
    questionIds.add(question.id);

    if (!isNonEmptyString(question.lessonId) || !STABLE_ID_PATTERN.test(question.lessonId)) {
      errors.push(`${label}.lessonId 형식이 올바르지 않습니다.`);
    }
    const lesson = curriculumLessons.get(question.lessonId);
    if (!lesson) {
      errors.push(`${label}.lessonId가 존재하지 않는 교안을 가리킵니다.`);
    } else {
      if (lesson.languageId !== collection.languageId) {
        errors.push(`${label}.lessonId의 언어가 컬렉션 언어와 다릅니다.`);
      }
      if (!lesson.conceptIds.includes(question.conceptId)) {
        errors.push(`${label}.conceptId가 연결된 교안에 없습니다.`);
      }
    }

    if (!isNonEmptyString(question.conceptId) || !CONCEPT_ID_PATTERN.test(question.conceptId)) {
      errors.push(`${label}.conceptId 형식이 올바르지 않습니다.`);
    }

    if (!ALLOWED_DIFFICULTIES.has(question.difficulty)) {
      errors.push(`${label}.difficulty는 basic 또는 application이어야 합니다.`);
    }
    if (!isNonEmptyString(question.prompt)) {
      errors.push(`${label}.prompt가 필요합니다.`);
    }
    if (question.code !== undefined && !isNonEmptyString(question.code)) {
      errors.push(`${label}.code는 비어 있지 않은 문자열이어야 합니다.`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push(`${label}.options는 정확히 4개여야 합니다.`);
      return;
    }

    const optionIds = new Set();
    const optionTexts = new Set();
    let correctOptionCount = 0;
    question.options.forEach((option, optionIndex) => {
      const optionLabel = `${label}.options[${optionIndex}]`;
      if (!option || typeof option !== "object") {
        errors.push(`${optionLabel}은 객체여야 합니다.`);
        return;
      }
      const unknownOptionFields = findUnknownFields(option, OPTION_FIELDS);
      if (unknownOptionFields.length > 0) {
        errors.push(`${optionLabel}에 허용되지 않은 필드가 있습니다: ${unknownOptionFields.join(", ")}`);
      }
      if (!ALLOWED_OPTION_IDS.has(option.id)) {
        errors.push(`${optionLabel}.id는 a, b, c, d 중 하나여야 합니다.`);
      } else if (optionIds.has(option.id)) {
        errors.push(`${label}의 선택지 ID가 중복됩니다: ${option.id}`);
      }
      optionIds.add(option.id);

      const normalizedText = isNonEmptyString(option.text)
        ? option.text.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko")
        : "";
      if (!normalizedText) {
        errors.push(`${optionLabel}.text가 필요합니다.`);
      } else if (optionTexts.has(normalizedText)) {
        errors.push(`${label}의 선택지 내용이 중복됩니다.`);
      }
      optionTexts.add(normalizedText);

      if (typeof option.isCorrect !== "boolean") {
        errors.push(`${optionLabel}.isCorrect는 boolean이어야 합니다.`);
      } else if (option.isCorrect) {
        correctOptionCount += 1;
      }
      if (!isNonEmptyString(option.feedback)) {
        errors.push(`${optionLabel}.feedback이 필요합니다.`);
      }
    });

    if (correctOptionCount !== 1) {
      errors.push(`${label}에는 정확히 하나의 정답이 있어야 합니다.`);
    }
    if (optionIds.size === 4 && [...ALLOWED_OPTION_IDS].some((id) => !optionIds.has(id))) {
      errors.push(`${label}의 선택지 ID는 a, b, c, d를 각각 한 번씩 사용해야 합니다.`);
    }
  });

  return errors;
}

export function assertValidQuizCollection(collection, curriculum) {
  const errors = validateQuizCollection(collection, curriculum);
  if (errors.length > 0) {
    throw new Error(`객관식 콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
  return collection;
}

export async function loadQuizCollection(
  languageId,
  curriculum,
  fetchImplementation = globalThis.fetch,
) {
  if (!/^[a-z][a-z0-9-]*$/.test(languageId)) {
    throw new Error("허용되지 않은 객관식 언어 경로입니다.");
  }
  if (typeof fetchImplementation !== "function") {
    throw new TypeError("객관식 콘텐츠를 불러올 fetch 구현이 필요합니다.");
  }

  const response = await fetchImplementation(`./content/quizzes/${languageId}.json`);
  if (!response.ok) {
    throw new Error(`객관식 콘텐츠를 불러오지 못했습니다. (${response.status})`);
  }
  return assertValidQuizCollection(await response.json(), curriculum);
}

export function gradeQuestion(question, selectedOptionId) {
  if (!question || !Array.isArray(question.options)) {
    throw new TypeError("채점할 문제가 필요합니다.");
  }
  const selectedOption = question.options.find((option) => option.id === selectedOptionId);
  if (!selectedOption) {
    throw new Error("문제에 존재하는 선택지를 골라야 합니다.");
  }
  const correctOption = question.options.find((option) => option.isCorrect);
  if (!correctOption) {
    throw new Error("문제에 정답이 설정되지 않았습니다.");
  }

  return {
    questionId: question.id,
    lessonId: question.lessonId,
    selectedOptionId: selectedOption.id,
    correctOptionId: correctOption.id,
    isCorrect: selectedOption.id === correctOption.id,
    feedback: question.options.map((option) => ({
      optionId: option.id,
      isCorrect: option.isCorrect,
      message: option.feedback,
    })),
  };
}

export function summarizeQuiz(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    throw new TypeError("문제와 답안 배열이 필요합니다.");
  }

  const questionIds = questions.map((question) => question?.id);
  if (questionIds.some((id) => !isNonEmptyString(id))) {
    throw new TypeError("모든 문제에 유효한 ID가 필요합니다.");
  }
  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error("요약할 문제 ID가 중복됩니다.");
  }

  const allowedQuestionIds = new Set(questionIds);
  const answerIds = new Set();
  for (const answer of answers) {
    if (
      !answer ||
      typeof answer !== "object" ||
      !isNonEmptyString(answer.questionId) ||
      typeof answer.isCorrect !== "boolean"
    ) {
      throw new TypeError("요약할 답안 형식이 올바르지 않습니다.");
    }
    if (!allowedQuestionIds.has(answer.questionId)) {
      throw new Error(`문제 목록에 없는 답안입니다: ${answer.questionId}`);
    }
    if (answerIds.has(answer.questionId)) {
      throw new Error(`같은 문제의 답안이 중복됩니다: ${answer.questionId}`);
    }
    answerIds.add(answer.questionId);
  }

  const answerByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const correct = questions.filter(
    (question) => answerByQuestionId.get(question.id)?.isCorrect === true,
  ).length;
  return {
    correct,
    total: questions.length,
    percent: questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100),
    incorrectQuestionIds: questions
      .filter((question) => answerByQuestionId.get(question.id)?.isCorrect === false)
      .map((question) => question.id),
    unansweredQuestionIds: questions
      .filter((question) => !answerByQuestionId.has(question.id))
      .map((question) => question.id),
  };
}
