import { gradeQuestion, summarizeQuiz } from "../core/quiz.js";

export const REVIEW_SESSION_STORAGE_KEY = "bam.dev.review-session.v1";

// Store the exact content signature: restoration must never silently regrade changed content.
export function getReviewContentSignature(questions) {
  return JSON.stringify(questions);
}

export function restoreReviewSession(saved, questions, scope) {
  if (!saved || saved.scope?.languageId !== scope.languageId ||
      (saved.scope?.lessonId ?? null) !== (scope.lessonId ?? null) ||
      (saved.scope?.conceptId ?? null) !== (scope.conceptId ?? null)) return { status: "other-scope" };
  if (saved.contentSignature !== getReviewContentSignature(questions)) return { status: "content-changed" };
  try {
    if (typeof saved.id !== "string" || !/^[a-z0-9-]+$/i.test(saved.id) ||
        !Array.isArray(saved.questionIds) || !saved.questionIds.length ||
        new Set(saved.questionIds).size !== saved.questionIds.length ||
        !["all", "incorrect"].includes(saved.mode) ||
        !["question", "result"].includes(saved.screen)) throw new Error();
    const sessionQuestions = saved.questionIds.map((id) => questions.find((question) => question.id === id));
    if (sessionQuestions.some((question) => !question) || !Number.isInteger(saved.currentIndex) ||
        saved.currentIndex < 0 || saved.currentIndex >= sessionQuestions.length) throw new Error();
    const selectedOptionIds = new Map(saved.selectedOptionIds);
    const gradedAnswers = new Map();
    if (!Array.isArray(saved.selectedOptionIds) || selectedOptionIds.size !== saved.selectedOptionIds.length ||
        !Array.isArray(saved.gradedQuestionIds) || new Set(saved.gradedQuestionIds).size !== saved.gradedQuestionIds.length) throw new Error();
    for (const [id, optionId] of selectedOptionIds) {
      if (!sessionQuestions.find((question) => question.id === id)?.options.some((option) => option.id === optionId)) throw new Error();
    }
    for (const id of saved.gradedQuestionIds) {
      const question = sessionQuestions.find((item) => item.id === id);
      const graded = gradeQuestion(question, selectedOptionIds.get(id));
      if (saved.completedAt) {
        const recorded = saved.recordedAnswers?.find((answer) => answer.questionId === id);
        if (typeof recorded?.isCorrect !== "boolean") throw new Error();
        graded.isCorrect = recorded.isCorrect;
      }
      gradedAnswers.set(id, graded);
    }
    if (saved.screen === "result" && gradedAnswers.size !== sessionQuestions.length) throw new Error();
    return { status: "restored", session: {
      id: saved.id, mode: saved.mode, questions: sessionQuestions, currentIndex: saved.currentIndex,
      selectedOptionIds, gradedAnswers, screen: saved.screen,
      summary: saved.screen === "result" ? summarizeQuiz(sessionQuestions, [...gradedAnswers.values()]) : null,
      recordAttempted: saved.recordAttempted === true || saved.screen === "result",
      persistenceStatus: saved.persistenceStatus ?? "saved",
      expandedQuestionIds: new Set((saved.expandedQuestionIds ?? []).filter((id) => saved.questionIds.includes(id))),
      returnContext: saved.returnContext ?? null,
      viewport: saved.viewport ?? null,
      completedAt: typeof saved.completedAt === "string" ? saved.completedAt : null,
    } };
  } catch {
    return { status: "invalid" };
  }
}

export class LocalStorageReviewSessionRepository {
  constructor(storage) {
    this.storage = storage;
    this.lastRead = undefined;
  }

  read() {
    try {
      this.lastRead = this.storage.getItem(REVIEW_SESSION_STORAGE_KEY);
      const data = JSON.parse(this.lastRead ?? "null");
      this.readStatus = this.lastRead === null ? "empty" : data?.schemaVersion === 1 && data.activeSession ? "saved" : "invalid";
      return data?.schemaVersion === 1 ? data.activeSession ?? null : null;
    } catch {
      this.readStatus = "invalid";
      return null;
    }
  }

  save(activeSession) {
    const current = this.storage.getItem(REVIEW_SESSION_STORAGE_KEY);
    if (this.lastRead !== undefined && current !== this.lastRead) {
      throw new Error("다른 탭에서 풀이가 바뀌었습니다. 새로고침하여 저장된 풀이를 이어 주세요.");
    }
    const next = JSON.stringify({ schemaVersion: 1, activeSession });
    this.storage.setItem(REVIEW_SESSION_STORAGE_KEY, next);
    this.lastRead = next;
    return this.storage.isPersistent?.() === false ? "memory" : "saved";
  }
}
