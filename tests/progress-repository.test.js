import assert from "node:assert/strict";
import test from "node:test";
import {
  createBrowserStorage,
  LocalStorageProgressRepository,
  MemoryStorage,
  PROGRESS_STORAGE_KEY,
  createEmptyProgress,
  getCurrentCompletedQuestIds,
  normalizeProgress,
} from "../src/repositories/progress-repository.js";

const fixedClock = () => new Date("2026-08-16T12:00:00.000Z");

function createCodingTestResultInput({
  problemId = "coding-test-javascript-result-storage",
  problemRevision = 1,
  languageId = "javascript",
  sourceFingerprint = "a".repeat(64),
  mode = "run",
  outcome = "passed",
  preview = "",
} = {}) {
  const counts = {
    passed: 0,
    wrong_answer: 0,
    syntax_error: 0,
    runtime_error: 0,
    timeout: 0,
    output_limit: 0,
    cancelled: 0,
    engine_error: 0,
    not_run: 0,
  };
  counts[outcome] = 1;
  return {
    problemId,
    problemRevision,
    languageId,
    sourceFingerprint,
    mode,
    outcome,
    tests: [
      {
        testId: "public-one",
        label: "공개 테스트 1",
        outcome,
        expectedDisplay: "2",
        actualDisplay: outcome === "passed" || outcome === "wrong_answer" ? "2" : null,
        hasActual: outcome === "passed" || outcome === "wrong_answer",
        durationMs: 2.5,
        console: preview ? [{ method: "log", preview }] : [],
        error: null,
        invocations: null,
      },
    ],
    summary: { outcome, total: 1, ...counts },
    durationMs: 3.5,
    error: null,
  };
}

test("처음에는 빈 진도를 반환한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  assert.deepEqual(repository.getProgress(), createEmptyProgress());
});

test("최근 교안과 완료 상태를 같은 버전 데이터에 저장한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage, fixedClock);

  repository.setLastLesson("js-02-values-control-flow");
  repository.setLessonCompleted("js-02-values-control-flow", true);

  assert.deepEqual(repository.getProgress(), {
    schemaVersion: 1,
    completedLessonIds: ["js-02-values-control-flow"],
    lastLessonId: "js-02-values-control-flow",
    quizAttempts: [],
    incorrectQuestionIds: [],
    questDrafts: [],
    questAttempts: [],
    completedQuestIds: [],
    completedQuestRevisions: [],
    codingTestDrafts: [],
    codingTestSubmissions: [],
    completedCodingTestProblems: [],
    codingTestResults: [],
    updatedAt: "2026-08-16T12:00:00.000Z",
  });
  assert.ok(storage.getItem(PROGRESS_STORAGE_KEY));
});

test("완료 표시를 해제할 수 있고 손상된 JSON은 안전하게 복구한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage, fixedClock);
  repository.setLessonCompleted("js-01-runtime", true);
  repository.setLessonCompleted("js-01-runtime", false);
  assert.deepEqual(repository.getProgress().completedLessonIds, []);

  storage.setItem(PROGRESS_STORAGE_KEY, "{broken");
  assert.deepEqual(repository.getProgress(), createEmptyProgress());
});

test("1차 저장 형식을 읽을 때 객관식 필드를 빈 배열로 보완한다", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      completedLessonIds: ["js-01-runtime"],
      lastLessonId: "js-01-runtime",
      updatedAt: "2026-08-15T12:00:00.000Z",
    }),
  );

  assert.deepEqual(new LocalStorageProgressRepository(storage, fixedClock).getProgress(), {
    schemaVersion: 1,
    completedLessonIds: ["js-01-runtime"],
    lastLessonId: "js-01-runtime",
    quizAttempts: [],
    incorrectQuestionIds: [],
    questDrafts: [],
    questAttempts: [],
    completedQuestIds: [],
    completedQuestRevisions: [],
    codingTestDrafts: [],
    codingTestSubmissions: [],
    completedCodingTestProblems: [],
    codingTestResults: [],
    updatedAt: "2026-08-15T12:00:00.000Z",
  });
});

test("기존 dev 진도의 Quest revision과 Java 실습 기록을 교안·객관식 저장 뒤에도 보존한다", () => {
  const storage = new MemoryStorage();
  const completedAt = "2026-08-15T10:00:00.000Z";
  const legacyState = {
    ...createEmptyProgress(),
    completedLessonIds: ["java-02-control-flow-arrays"],
    lastLessonId: "java-02-control-flow-arrays",
    questDrafts: [
      {
        questId: "quest-java-distinct-names",
        languageId: "java",
        source: "class Solution {}",
        updatedAt: completedAt,
      },
    ],
    questAttempts: [
      {
        id: `quest-${completedAt}-1`,
        questId: "quest-java-distinct-names",
        questRevision: 2,
        languageId: "java",
        outcome: "passed",
        passed: 2,
        total: 2,
        completedAt,
      },
    ],
    completedQuestIds: ["quest-java-distinct-names"],
    completedQuestRevisions: [
      {
        questId: "quest-java-distinct-names",
        questRevision: 2,
        completedAt,
      },
    ],
    codingTestDrafts: [
      {
        problemId: "coding-test-java-maximum-window-sum",
        problemRevision: 1,
        languageId: "java",
        source: "class Solution {}",
        updatedAt: completedAt,
      },
    ],
    codingTestSubmissions: [
      {
        id: `coding-test-${completedAt}-1`,
        problemId: "coding-test-java-maximum-window-sum",
        problemRevision: 1,
        languageId: "java",
        outcome: "passed",
        passed: 3,
        total: 3,
        completedAt,
      },
    ],
    completedCodingTestProblems: [
      {
        problemId: "coding-test-java-maximum-window-sum",
        problemRevision: 1,
        completedAt,
      },
    ],
    updatedAt: completedAt,
  };
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(legacyState));
  const repository = new LocalStorageProgressRepository(storage, fixedClock);

  repository.setLessonCompleted("js-01-runtime", true);
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: "quiz-javascript-storage-compatibility",
        lessonId: "js-01-runtime",
        selectedOptionId: "a",
        isCorrect: true,
      },
    ],
  });

  const saved = repository.getProgress();
  for (const field of [
    "questDrafts",
    "questAttempts",
    "completedQuestIds",
    "completedQuestRevisions",
    "codingTestDrafts",
    "codingTestSubmissions",
    "completedCodingTestProblems",
    "codingTestResults",
  ]) {
    assert.deepEqual(saved[field], legacyState[field], field);
  }
  assert.deepEqual(saved.completedLessonIds, [
    "java-02-control-flow-arrays",
    "js-01-runtime",
  ]);
  assert.equal(saved.quizAttempts.length, 1);
  assert.deepEqual(
    JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)).completedQuestRevisions,
    legacyState.completedQuestRevisions,
  );
});

test("손상된 객관식 시도와 공백 ID를 정규화 과정에서 버린다", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      completedLessonIds: [" ", "js-01-runtime"],
      lastLessonId: " ",
      incorrectQuestionIds: [" ", "quiz-javascript-valid"],
      quizAttempts: [
        {
          id: "non-iso-attempt",
          languageId: "javascript",
          completedAt: "0",
          score: 0,
          total: 1,
          answers: [
            {
              questionId: "quiz-javascript-date-one",
              lessonId: "js-01-runtime",
              selectedOptionId: "a",
              isCorrect: false,
            },
          ],
        },
        {
          id: "normalized-date-attempt",
          languageId: "javascript",
          completedAt: "2026-02-30",
          score: 1,
          total: 1,
          answers: [
            {
              questionId: "quiz-javascript-date-two",
              lessonId: "js-01-runtime",
              selectedOptionId: "a",
              isCorrect: true,
            },
          ],
        },
      ],
      updatedAt: "0",
    }),
  );

  const progress = new LocalStorageProgressRepository(storage, fixedClock).getProgress();
  assert.deepEqual(progress.completedLessonIds, ["js-01-runtime"]);
  assert.equal(progress.lastLessonId, null);
  assert.deepEqual(progress.incorrectQuestionIds, ["quiz-javascript-valid"]);
  assert.deepEqual(progress.quizAttempts, []);
  assert.equal(progress.updatedAt, null);
});

test("객관식 결과와 오답 재도전 대상을 저장한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const progress = repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: "quiz-javascript-test-001",
        lessonId: "js-01-runtime",
        selectedOptionId: "b",
        isCorrect: false,
      },
      {
        questionId: "quiz-javascript-test-002",
        lessonId: "js-01-runtime",
        selectedOptionId: "a",
        isCorrect: true,
      },
    ],
  });

  assert.equal(progress.quizAttempts.length, 1);
  assert.equal(progress.quizAttempts[0].score, 1);
  assert.equal(progress.quizAttempts[0].total, 2);
  assert.deepEqual(progress.incorrectQuestionIds, ["quiz-javascript-test-001"]);
  assert.equal(Object.hasOwn(progress.quizAttempts[0].answers[0], "firstAttempt"), false);
});

test("완료 기록은 첫 오답을 선택 필드로 보존하고 점수·현재 오답은 최종 답으로 계산한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage, fixedClock);
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: "quiz-javascript-retried-correct",
        lessonId: "js-01-runtime",
        selectedOptionId: "a",
        isCorrect: true,
        firstAttempt: { selectedOptionId: "b", isCorrect: false },
      },
      {
        questionId: "quiz-javascript-current-wrong",
        lessonId: "js-01-runtime",
        selectedOptionId: "c",
        isCorrect: false,
      },
    ],
  });

  const progress = new LocalStorageProgressRepository(storage, fixedClock).getProgress();
  assert.equal(progress.quizAttempts[0].score, 1);
  assert.equal(progress.quizAttempts[0].total, 2);
  assert.deepEqual(progress.incorrectQuestionIds, ["quiz-javascript-current-wrong"]);
  assert.deepEqual(progress.quizAttempts[0].answers[0], {
    questionId: "quiz-javascript-retried-correct",
    lessonId: "js-01-runtime",
    selectedOptionId: "a",
    isCorrect: true,
    firstAttempt: { selectedOptionId: "b", isCorrect: false },
  });

  const damaged = JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY));
  damaged.quizAttempts[0].answers[0].firstAttempt.extra = true;
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(damaged));
  assert.deepEqual(
    new LocalStorageProgressRepository(storage, fixedClock).getProgress().quizAttempts,
    [],
    "잘못된 첫 응답 추가 필드는 완료 기록 손상 정책에 따라 시도 전체를 버린다.",
  );
});

test("다시 맞힌 문제는 오답 재도전 대상에서 제거한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: "quiz-javascript-test-001",
        lessonId: "js-01-runtime",
        selectedOptionId: "b",
        isCorrect: false,
      },
    ],
  });

  const progress = repository.recordQuizAttempt({
    languageId: "javascript",
    answers: [
      {
        questionId: "quiz-javascript-test-001",
        lessonId: "js-01-runtime",
        selectedOptionId: "a",
        isCorrect: true,
      },
    ],
  });

  assert.deepEqual(progress.incorrectQuestionIds, []);
  assert.equal(progress.quizAttempts.length, 2);
});

test("객관식 시도에서 중복 문제와 잘못된 답안 형식을 거부한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const duplicatedAnswer = {
    questionId: "quiz-javascript-test-001",
    lessonId: "js-01-runtime",
    selectedOptionId: "a",
    isCorrect: true,
  };

  assert.throws(
    () =>
      repository.recordQuizAttempt({
        languageId: "javascript",
        answers: [duplicatedAnswer, duplicatedAnswer],
      }),
    /중복 저장/,
  );
  assert.throws(
    () => repository.recordQuizAttempt({ languageId: "javascript", answers: [] }),
    /한 개 이상의 객관식 답안/,
  );
  assert.throws(
    () => repository.recordQuizAttempt({ answers: [duplicatedAnswer] }),
    /유효한 객관식 시도/,
  );
  assert.throws(
    () =>
      repository.recordQuizAttempt({
        languageId: "javascript",
        answers: [{ ...duplicatedAnswer, questionId: "quiz-html-test-001" }],
      }),
    /문제 ID와 객관식 언어/,
  );
  assert.throws(
    () =>
      repository.recordQuizAttempt({
        languageId: "javascript",
        answers: [{ ...duplicatedAnswer, selectedOptionId: "z" }],
      }),
    /답안 형식/,
  );
  for (const firstAttempt of [
    { selectedOptionId: "b", isCorrect: true },
    { selectedOptionId: "z", isCorrect: false },
    { selectedOptionId: "b" },
    { selectedOptionId: "b", isCorrect: false, extra: true },
    null,
  ]) {
    assert.throws(
      () => repository.recordQuizAttempt({
        languageId: "javascript",
        answers: [{ ...duplicatedAnswer, firstAttempt }],
      }),
      /답안 형식/,
      JSON.stringify(firstAttempt),
    );
  }
});

test("같은 시각에 보관 한도보다 많이 저장해도 시도 ID가 중복되지 않는다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  for (let index = 0; index < 22; index += 1) {
    repository.recordQuizAttempt({
      languageId: "javascript",
      answers: [
        {
          questionId: `quiz-javascript-question-${index}`,
          lessonId: "js-01-runtime",
          selectedOptionId: "a",
          isCorrect: true,
        },
      ],
    });
  }

  const attempts = repository.getProgress().quizAttempts;
  assert.equal(attempts.length, 20);
  assert.equal(new Set(attempts.map((attempt) => attempt.id)).size, attempts.length);
});

test("Code Quest 초안을 Quest별 최신 한 건으로 저장하고 조회·삭제한다", () => {
  let tick = 0;
  const clock = () => new Date(`2026-08-16T12:00:0${tick++}.000Z`);
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), clock);

  repository.saveQuestDraft({
    questId: "quest-javascript-sum-values",
    languageId: "javascript",
    source: "function sum(a, b) {}",
  });
  repository.saveQuestDraft({
    questId: "quest-javascript-sum-values",
    languageId: "javascript",
    source: "function sum(a, b) { return a + b; }",
  });

  assert.deepEqual(repository.getQuestDraft("quest-javascript-sum-values"), {
    questId: "quest-javascript-sum-values",
    languageId: "javascript",
    source: "function sum(a, b) { return a + b; }",
    updatedAt: "2026-08-16T12:00:01.000Z",
  });
  assert.equal(repository.getProgress().questDrafts.length, 1);

  repository.clearQuestDraft("quest-javascript-sum-values");
  assert.equal(repository.getQuestDraft("quest-javascript-sum-values"), null);
});

test("Code Quest 초안은 UTF-8 20KiB와 언어 네임스페이스를 검증한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const exactlyTwentyKibibytes = `${"가".repeat(6826)}aa`;

  repository.saveQuestDraft({
    questId: "quest-javascript-source-limit",
    languageId: "javascript",
    source: exactlyTwentyKibibytes,
  });
  assert.equal(
    repository.getQuestDraft("quest-javascript-source-limit").source,
    exactlyTwentyKibibytes,
  );

  assert.throws(
    () =>
      repository.saveQuestDraft({
        questId: "quest-javascript-source-over-limit",
        languageId: "javascript",
        source: `${exactlyTwentyKibibytes}a`,
      }),
    /20480바이트/,
  );
  assert.throws(
    () =>
      repository.saveQuestDraft({
        questId: "quest-html-wrong-language",
        languageId: "javascript",
        source: "",
      }),
    /ID와 언어가 일치/,
  );
  assert.throws(() => repository.getQuestDraft("not-a-quest"), /유효한 questId/);
});

test("Code Quest 초안은 가장 최근 20개만 보관한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  for (let index = 0; index < 22; index += 1) {
    repository.saveQuestDraft({
      questId: `quest-javascript-draft-${index}`,
      languageId: "javascript",
      source: `// ${index}`,
    });
  }

  const drafts = repository.getProgress().questDrafts;
  assert.equal(drafts.length, 20);
  assert.equal(drafts.some((draft) => draft.questId === "quest-javascript-draft-0"), false);
  assert.equal(drafts.some((draft) => draft.questId === "quest-javascript-draft-21"), true);
});

test("Code Quest 제출 요약을 저장하고 완전 통과한 Quest만 완료 처리한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const wrong = repository.recordQuestAttempt({
    questId: "quest-javascript-sum-values",
    questRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 1,
    total: 2,
  });

  assert.deepEqual(wrong.completedQuestIds, []);
  assert.deepEqual(wrong.completedQuestRevisions, []);
  assert.equal(Object.hasOwn(wrong.questAttempts[0], "source"), false);

  const passed = repository.recordQuestAttempt({
    questId: "quest-javascript-sum-values",
    questRevision: 2,
    languageId: "javascript",
    outcome: "passed",
    passed: 2,
    total: 2,
  });
  assert.deepEqual(passed.completedQuestIds, ["quest-javascript-sum-values"]);
  assert.deepEqual(passed.completedQuestRevisions, [
    {
      questId: "quest-javascript-sum-values",
      questRevision: 2,
      completedAt: "2026-08-16T12:00:00.000Z",
    },
  ]);
  assert.equal(passed.questAttempts.length, 2);
  assert.equal(passed.questAttempts[1].questRevision, 2);
  assert.equal(passed.questAttempts[1].completedAt, "2026-08-16T12:00:00.000Z");
});

test("보관 한도 밖의 유효한 통과 기록도 완료 상태 복구에 사용한다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const oldPassedAttempt = {
    id: `quest-${completedAt}-1`,
    questId: "quest-javascript-old-passed",
    questRevision: 1,
    languageId: "javascript",
    outcome: "passed",
    passed: 1,
    total: 1,
    completedAt,
  };
  const recentFailures = Array.from({ length: 50 }, (_, index) => ({
    id: `quest-${completedAt}-${index + 2}`,
    questId: `quest-javascript-recent-failure-${index}`,
    questRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 0,
    total: 1,
    completedAt,
  }));

  const progress = normalizeProgress({
    ...createEmptyProgress(),
    completedQuestIds: undefined,
    questAttempts: [oldPassedAttempt, ...recentFailures],
  });

  assert.equal(progress.questAttempts.length, 50);
  assert.equal(progress.questAttempts.some((attempt) => attempt.id === oldPassedAttempt.id), false);
  assert.deepEqual(progress.completedQuestIds, ["quest-javascript-old-passed"]);
  assert.deepEqual(progress.completedQuestRevisions, [
    {
      questId: "quest-javascript-old-passed",
      questRevision: 1,
      completedAt,
    },
  ]);
});

test("Quest 통과가 attempt 보관 한도 밖으로 밀려도 완료 revision을 유지한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const questId = "quest-javascript-retained-completion";
  repository.recordQuestAttempt({
    questId,
    questRevision: 2,
    languageId: "javascript",
    outcome: "passed",
    passed: 1,
    total: 1,
  });
  for (let index = 0; index < 50; index += 1) {
    repository.recordQuestAttempt({
      questId,
      questRevision: 2,
      languageId: "javascript",
      outcome: "wrong_answer",
      passed: 0,
      total: 1,
    });
  }

  const progress = repository.getProgress();
  assert.equal(progress.questAttempts.length, 50);
  assert.equal(
    progress.questAttempts.some((attempt) => attempt.outcome === "passed"),
    false,
  );
  assert.deepEqual(progress.completedQuestRevisions, [
    {
      questId,
      questRevision: 2,
      completedAt: "2026-08-16T12:00:00.000Z",
    },
  ]);
  assert.deepEqual(
    [...getCurrentCompletedQuestIds(progress, [{ id: questId, revision: 2 }])],
    [questId],
  );
});

test("Quest 완료 selector는 현재 revision과 versioned 기록을 우선하고 legacy revision 1만 인정한다", () => {
  const quests = [
    { id: "quest-javascript-current", revision: 2 },
    { id: "quest-javascript-old", revision: 2 },
    { id: "quest-javascript-legacy", revision: 1 },
  ];
  const completedAt = "2026-08-16T12:00:00.000Z";

  const completed = getCurrentCompletedQuestIds(
    {
      completedQuestIds: quests.map((quest) => quest.id),
      completedQuestRevisions: [
        {
          questId: "quest-javascript-current",
          questRevision: 2,
          completedAt,
        },
        {
          questId: "quest-javascript-old",
          questRevision: 1,
          completedAt,
        },
      ],
    },
    quests,
  );

  assert.deepEqual([...completed], [
    "quest-javascript-current",
    "quest-javascript-legacy",
  ]);
});

test("높은 Quest 완료 revision은 나중의 구버전 통과 기록으로 내려가지 않는다", () => {
  const progress = normalizeProgress({
    ...createEmptyProgress(),
    completedQuestRevisions: [
      {
        questId: "quest-javascript-stale-tab",
        questRevision: 2,
        completedAt: "2026-08-16T12:00:00.000Z",
      },
      {
        questId: "quest-javascript-stale-tab",
        questRevision: 1,
        completedAt: "2026-08-16T12:00:01.000Z",
      },
    ],
  });

  assert.deepEqual(progress.completedQuestRevisions, [
    {
      questId: "quest-javascript-stale-tab",
      questRevision: 2,
      completedAt: "2026-08-16T12:00:00.000Z",
    },
  ]);
});

test("Code Quest 제출 결과의 ID·리비전·점수·결과 일관성을 거부한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const valid = {
    questId: "quest-javascript-sum-values",
    questRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 1,
    total: 2,
  };

  for (const invalid of [
    { ...valid, questId: "quest-html-sum-values" },
    { ...valid, questRevision: 0 },
    { ...valid, outcome: "not_run" },
    { ...valid, passed: -1 },
    { ...valid, passed: 3 },
    { ...valid, outcome: "passed", passed: 0, total: 0 },
    { ...valid, outcome: "passed", passed: 1, total: 2 },
    { ...valid, outcome: "wrong_answer", passed: 2, total: 2 },
    { ...valid, outcome: "runtime_error", passed: 2, total: 2 },
  ]) {
    assert.throws(() => repository.recordQuestAttempt(invalid), /제출 결과 형식/);
  }
});

test("손상된 Code Quest 데이터는 정규화하고 유효한 통과 기록에서 완료를 복구한다", () => {
  const storage = new MemoryStorage();
  const validDraft = {
    questId: "quest-javascript-valid-draft",
    languageId: "javascript",
    source: "최신",
    updatedAt: "2026-08-16T12:00:01.000Z",
  };
  const validAttempt = {
    id: "quest-2026-08-16T12:00:00.000Z-1",
    questId: "quest-javascript-valid-attempt",
    questRevision: 1,
    languageId: "javascript",
    outcome: "passed",
    passed: 2,
    total: 2,
    completedAt: "2026-08-16T12:00:00.000Z",
  };
  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      ...createEmptyProgress(),
      questDrafts: [
        { ...validDraft, source: "이전", updatedAt: "2026-08-16T12:00:00.000Z" },
        validDraft,
        { ...validDraft, questId: "quest-html-wrong-namespace" },
        { ...validDraft, questId: "quest-javascript-bad-date", updatedAt: "2026-02-30" },
        { ...validDraft, questId: "quest-javascript-too-large", source: "a".repeat(20481) },
      ],
      questAttempts: [
        validAttempt,
        { ...validAttempt },
        { ...validAttempt, id: "bad-namespace", questId: "quest-html-invalid" },
        { ...validAttempt, id: "bad-date", completedAt: "0" },
        { ...validAttempt, id: "bad-score", outcome: "passed", passed: 0, total: 0 },
      ],
      completedQuestIds: [" ", "quest-python-previously-completed"],
    }),
  );

  const progress = new LocalStorageProgressRepository(storage, fixedClock).getProgress();
  assert.deepEqual(progress.questDrafts, [validDraft]);
  assert.deepEqual(progress.questAttempts, [validAttempt]);
  assert.deepEqual(progress.completedQuestIds, [
    "quest-python-previously-completed",
    "quest-javascript-valid-attempt",
  ]);
});

test("같은 시각의 Code Quest 제출을 최대 50개 보관하면서 ID를 고유하게 유지한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  for (let index = 0; index < 52; index += 1) {
    repository.recordQuestAttempt({
      questId: `quest-javascript-attempt-${index}`,
      questRevision: 1,
      languageId: "javascript",
      outcome: "cancelled",
      passed: 0,
      total: 0,
    });
  }

  const attempts = repository.getProgress().questAttempts;
  assert.equal(attempts.length, 50);
  assert.equal(new Set(attempts.map((attempt) => attempt.id)).size, 50);
  assert.equal(attempts.at(-1).id.endsWith("-52"), true);
});

test("Code Quest attempt ID는 완료 시각과 양의 safe integer suffix 전체가 일치해야 한다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const validAttempt = {
    id: `quest-${completedAt}-1`,
    questId: "quest-javascript-id-contract",
    questRevision: 1,
    languageId: "javascript",
    outcome: "cancelled",
    passed: 0,
    total: 0,
    completedAt,
  };
  const progress = normalizeProgress({
    ...createEmptyProgress(),
    questAttempts: [
      validAttempt,
      { ...validAttempt, id: `quest-${completedAt}-1junk` },
      { ...validAttempt, id: `quest-${completedAt}-0` },
      { ...validAttempt, id: `quest-${completedAt}-9007199254740992` },
      { ...validAttempt, id: "quest-2026-08-16T12:00:01.000Z-2" },
    ],
  });

  assert.deepEqual(progress.questAttempts, [validAttempt]);
});

test("최대 safe integer suffix가 있어도 새 Code Quest attempt ID가 충돌하지 않는다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const storage = new MemoryStorage();
  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      ...createEmptyProgress(),
      questAttempts: [
        {
          id: `quest-${completedAt}-${Number.MAX_SAFE_INTEGER}`,
          questId: "quest-javascript-existing-attempt",
          questRevision: 1,
          languageId: "javascript",
          outcome: "cancelled",
          passed: 0,
          total: 0,
          completedAt,
        },
      ],
    }),
  );
  const repository = new LocalStorageProgressRepository(storage, fixedClock);

  repository.recordQuestAttempt({
    questId: "quest-javascript-new-attempt",
    questRevision: 1,
    languageId: "javascript",
    outcome: "cancelled",
    passed: 0,
    total: 0,
  });

  const attempts = repository.getProgress().questAttempts;
  assert.equal(attempts.length, 2);
  assert.equal(new Set(attempts.map((attempt) => attempt.id)).size, 2);
  assert.equal(attempts[1].id, `quest-${completedAt}-1`);
});

test("코딩테스트 초안은 문제 리비전별로 조회하고 같은 문제의 최신 한 건만 보관한다", () => {
  let tick = 0;
  const clock = () => new Date(`2026-08-16T12:00:0${tick++}.000Z`);
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), clock);

  repository.saveCodingTestDraft({
    problemId: "coding-test-javascript-pair-sum",
    problemRevision: 1,
    languageId: "javascript",
    source: "function findPair() {}",
  });
  repository.saveCodingTestDraft({
    problemId: "coding-test-javascript-pair-sum",
    problemRevision: 2,
    languageId: "javascript",
    source: "function findPair() { return []; }",
  });

  assert.equal(
    repository.getCodingTestDraft("coding-test-javascript-pair-sum", 1),
    null,
  );
  assert.deepEqual(
    repository.getCodingTestDraft("coding-test-javascript-pair-sum", 2),
    {
      problemId: "coding-test-javascript-pair-sum",
      problemRevision: 2,
      languageId: "javascript",
      source: "function findPair() { return []; }",
      updatedAt: "2026-08-16T12:00:01.000Z",
    },
  );

  repository.clearCodingTestDraft("coding-test-javascript-pair-sum");
  assert.equal(
    repository.getCodingTestDraft("coding-test-javascript-pair-sum", 2),
    null,
  );
});

test("코딩테스트 상세 결과는 문제별 마지막 한 건과 최근 20개만 보관하고 초기화한다", () => {
  let tick = 0;
  const clock = () => new Date(Date.UTC(2026, 7, 16, 12, 0, tick++));
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), clock);
  repository.recordQuestAttempt({
    questId: "quest-javascript-result-separation",
    questRevision: 1,
    languageId: "javascript",
    outcome: "passed",
    passed: 1,
    total: 1,
  });
  const questState = structuredClone({
    questAttempts: repository.getProgress().questAttempts,
    completedQuestIds: repository.getProgress().completedQuestIds,
    completedQuestRevisions: repository.getProgress().completedQuestRevisions,
  });

  repository.saveCodingTestResult(createCodingTestResultInput());
  repository.saveCodingTestResult(
    createCodingTestResultInput({
      problemRevision: 2,
      sourceFingerprint: "b".repeat(64),
      mode: "submit",
    }),
  );

  assert.equal(
    repository.getCodingTestResult("coding-test-javascript-result-storage", 1),
    null,
  );
  assert.deepEqual(
    repository.getCodingTestResult("coding-test-javascript-result-storage", 2),
    {
      ...createCodingTestResultInput({
        problemRevision: 2,
        sourceFingerprint: "b".repeat(64),
        mode: "submit",
      }),
      finishedAt: "2026-08-16T12:00:02.000Z",
    },
  );
  assert.deepEqual(
    {
      questAttempts: repository.getProgress().questAttempts,
      completedQuestIds: repository.getProgress().completedQuestIds,
      completedQuestRevisions: repository.getProgress().completedQuestRevisions,
    },
    questState,
  );
  assert.deepEqual(repository.getProgress().codingTestSubmissions, []);
  assert.deepEqual(repository.getProgress().completedCodingTestProblems, []);

  repository.clearCodingTestResult("coding-test-javascript-result-storage");
  assert.equal(
    repository.getCodingTestResult("coding-test-javascript-result-storage", 2),
    null,
  );

  for (let index = 0; index < 21; index += 1) {
    repository.saveCodingTestResult(
      createCodingTestResultInput({
        problemId: `coding-test-javascript-result-${index}`,
      }),
    );
  }
  const retained = repository.getProgress().codingTestResults;
  assert.equal(retained.length, 20);
  assert.equal(
    retained.some((result) => result.problemId === "coding-test-javascript-result-0"),
    false,
  );
  assert.equal(
    retained.some((result) => result.problemId === "coding-test-javascript-result-20"),
    true,
  );
});

test("기존 v1 진도와 손상된 상세 결과를 격리하고 유효한 결과·학습 진도를 보존한다", () => {
  const finishedAt = "2026-08-16T12:00:00.000Z";
  const validResult = {
    ...createCodingTestResultInput(),
    finishedAt,
  };
  const oversizedResult = structuredClone(validResult);
  oversizedResult.problemId = "coding-test-javascript-oversized-stored-result";
  oversizedResult.tests[0].console = [
    { method: "log", preview: "가".repeat(22_000) },
  ];
  const inconsistentResult = {
    ...validResult,
    problemId: "coding-test-javascript-inconsistent-stored-result",
    outcome: "wrong_answer",
  };
  const progress = normalizeProgress({
    ...createEmptyProgress(),
    completedLessonIds: ["js-01-runtime"],
    completedQuestIds: ["quest-javascript-existing-progress"],
    codingTestResults: [
      { ...validResult, sourceFingerprint: "INVALID" },
      oversizedResult,
      inconsistentResult,
      validResult,
    ],
    updatedAt: finishedAt,
  });

  assert.deepEqual(progress.completedLessonIds, ["js-01-runtime"]);
  assert.deepEqual(progress.completedQuestIds, ["quest-javascript-existing-progress"]);
  assert.deepEqual(progress.codingTestResults, [validResult]);

  const legacy = normalizeProgress({
    schemaVersion: 1,
    completedLessonIds: ["js-01-runtime"],
    updatedAt: finishedAt,
  });
  assert.deepEqual(legacy.codingTestResults, []);
  assert.deepEqual(legacy.completedLessonIds, ["js-01-runtime"]);
});

test("상세 결과의 UTF-8 64KiB 초과와 저장소 실패는 기존 진도를 덮어쓰지 않는다", () => {
  const backing = new MemoryStorage();
  let rejectWrites = false;
  const storage = {
    getItem(key) {
      return backing.getItem(key);
    },
    setItem(key, value) {
      if (rejectWrites) throw new Error("quota exceeded");
      backing.setItem(key, value);
    },
    isPersistent() {
      return true;
    },
  };
  const repository = new LocalStorageProgressRepository(storage, fixedClock);
  repository.setLessonCompleted("js-01-runtime", true);
  const savedBeforeFailure = backing.getItem(PROGRESS_STORAGE_KEY);

  assert.throws(
    () =>
      repository.saveCodingTestResult(
        createCodingTestResultInput({ preview: "가".repeat(22_000) }),
      ),
    /65536바이트/,
  );
  assert.equal(backing.getItem(PROGRESS_STORAGE_KEY), savedBeforeFailure);

  rejectWrites = true;
  assert.throws(
    () => repository.saveCodingTestResult(createCodingTestResultInput()),
    /quota exceeded/,
  );
  assert.equal(backing.getItem(PROGRESS_STORAGE_KEY), savedBeforeFailure);
  assert.deepEqual(repository.getProgress().completedLessonIds, ["js-01-runtime"]);
  assert.deepEqual(repository.getProgress().codingTestResults, []);
});

test("코딩테스트는 실행 코드 없이 제출 요약만 저장하고 현재 리비전 통과를 완료로 기록한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const failed = repository.recordCodingTestSubmission({
    problemId: "coding-test-javascript-pair-sum",
    problemRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 2,
    total: 5,
  });
  assert.deepEqual(failed.completedCodingTestProblems, []);
  assert.equal(Object.hasOwn(failed.codingTestSubmissions[0], "source"), false);

  const passed = repository.recordCodingTestSubmission({
    problemId: "coding-test-javascript-pair-sum",
    problemRevision: 2,
    languageId: "javascript",
    outcome: "passed",
    passed: 5,
    total: 5,
  });
  assert.deepEqual(passed.completedCodingTestProblems, [
    {
      problemId: "coding-test-javascript-pair-sum",
      problemRevision: 2,
      completedAt: "2026-08-16T12:00:00.000Z",
    },
  ]);
  assert.equal(passed.codingTestSubmissions.length, 2);
});

test("같은 시각의 코딩테스트 제출을 최대 50개 보관하면서 ID를 고유하게 유지한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  for (let index = 0; index < 52; index += 1) {
    repository.recordCodingTestSubmission({
      problemId: `coding-test-javascript-submission-${index}`,
      problemRevision: 1,
      languageId: "javascript",
      outcome: "cancelled",
      passed: 0,
      total: 0,
    });
  }

  const submissions = repository.getProgress().codingTestSubmissions;
  assert.equal(submissions.length, 50);
  assert.equal(new Set(submissions.map((submission) => submission.id)).size, 50);
  assert.equal(submissions.at(-1).id.endsWith("-52"), true);
});

test("코딩테스트 submission ID는 완료 시각과 양의 safe integer suffix 전체가 일치해야 한다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const validSubmission = {
    id: `coding-test-${completedAt}-1`,
    problemId: "coding-test-javascript-id-contract",
    problemRevision: 1,
    languageId: "javascript",
    outcome: "cancelled",
    passed: 0,
    total: 0,
    completedAt,
  };
  const progress = normalizeProgress({
    ...createEmptyProgress(),
    codingTestSubmissions: [
      validSubmission,
      { ...validSubmission, id: `coding-test-${completedAt}-1junk` },
      { ...validSubmission, id: `coding-test-${completedAt}-0` },
      { ...validSubmission, id: `coding-test-${completedAt}-01` },
      { ...validSubmission, id: `coding-test-${completedAt}-9007199254740992` },
      { ...validSubmission, id: "coding-test-2026-08-16T12:00:01.000Z-2" },
      { ...validSubmission, id: `quest-${completedAt}-2` },
    ],
  });

  assert.deepEqual(progress.codingTestSubmissions, [validSubmission]);
});

test("최대 safe integer suffix가 있어도 새 코딩테스트 submission ID가 충돌하지 않는다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const storage = new MemoryStorage();
  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      ...createEmptyProgress(),
      codingTestSubmissions: [
        {
          id: `coding-test-${completedAt}-${Number.MAX_SAFE_INTEGER}`,
          problemId: "coding-test-javascript-existing-submission",
          problemRevision: 1,
          languageId: "javascript",
          outcome: "cancelled",
          passed: 0,
          total: 0,
          completedAt,
        },
      ],
    }),
  );
  const repository = new LocalStorageProgressRepository(storage, fixedClock);

  repository.recordCodingTestSubmission({
    problemId: "coding-test-javascript-new-submission",
    problemRevision: 1,
    languageId: "javascript",
    outcome: "cancelled",
    passed: 0,
    total: 0,
  });

  const submissions = repository.getProgress().codingTestSubmissions;
  assert.equal(submissions.length, 2);
  assert.equal(new Set(submissions.map((submission) => submission.id)).size, 2);
  assert.equal(submissions[1].id, `coding-test-${completedAt}-1`);
});

test("손상된 코딩테스트 데이터는 버리고 보관 밖 통과 제출에서도 완료 상태를 복구한다", () => {
  const completedAt = "2026-08-16T12:00:00.000Z";
  const oldPassedSubmission = {
    id: `coding-test-${completedAt}-1`,
    problemId: "coding-test-javascript-old-solved",
    problemRevision: 3,
    languageId: "javascript",
    outcome: "passed",
    passed: 1,
    total: 1,
    completedAt,
  };
  const recentFailures = Array.from({ length: 50 }, (_, index) => ({
    id: `coding-test-${completedAt}-${index + 2}`,
    problemId: `coding-test-javascript-recent-${index}`,
    problemRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 0,
    total: 1,
    completedAt,
  }));

  const progress = normalizeProgress({
    ...createEmptyProgress(),
    codingTestDrafts: [
      {
        problemId: "coding-test-javascript-invalid-language",
        problemRevision: 1,
        languageId: "html",
        source: "",
        updatedAt: completedAt,
      },
    ],
    codingTestSubmissions: [
      oldPassedSubmission,
      ...recentFailures,
      { ...oldPassedSubmission, id: "bad-id" },
    ],
  });

  assert.deepEqual(progress.codingTestDrafts, []);
  assert.equal(progress.codingTestSubmissions.length, 50);
  assert.equal(
    progress.codingTestSubmissions.some((item) => item.id === oldPassedSubmission.id),
    false,
  );
  assert.deepEqual(progress.completedCodingTestProblems, [
    {
      problemId: "coding-test-javascript-old-solved",
      problemRevision: 3,
      completedAt,
    },
  ]);
});

test("코딩테스트 초안과 제출 DTO의 크기·네임스페이스·결과 일관성을 검증한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  const valid = {
    problemId: "coding-test-javascript-pair-sum",
    problemRevision: 1,
    languageId: "javascript",
    outcome: "wrong_answer",
    passed: 1,
    total: 2,
  };

  assert.throws(
    () =>
      repository.saveCodingTestDraft({
        problemId: "coding-test-javascript-source-limit",
        problemRevision: 1,
        languageId: "javascript",
        source: "a".repeat(20481),
      }),
    /20480바이트/,
  );
  for (const invalid of [
    { ...valid, problemId: "coding-test-html-pair-sum" },
    { ...valid, problemRevision: 0 },
    { ...valid, outcome: "not_run" },
    { ...valid, outcome: "passed", passed: 1, total: 2 },
    { ...valid, outcome: "wrong_answer", passed: 2, total: 2 },
  ]) {
    assert.throws(
      () => repository.recordCodingTestSubmission(invalid),
      /제출 결과 형식/,
    );
  }
});

test("Code Quest DTO는 상속 필드와 accessor를 거부하며 getter를 실행하지 않는다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  let sourceGetterReads = 0;
  const accessorDraft = {
    questId: "quest-javascript-accessor-draft",
    languageId: "javascript",
  };
  Object.defineProperty(accessorDraft, "source", {
    enumerable: true,
    get() {
      sourceGetterReads += 1;
      return "실행되면 안 됨";
    },
  });

  assert.throws(() => repository.saveQuestDraft(accessorDraft), /초안/);
  assert.equal(sourceGetterReads, 0);

  const inheritedDraft = Object.create({ questId: "quest-javascript-inherited-draft" });
  inheritedDraft.languageId = "javascript";
  inheritedDraft.source = "상속 ID를 수용하면 안 됨";
  assert.throws(() => repository.saveQuestDraft(inheritedDraft), /초안/);

  let outcomeGetterReads = 0;
  const accessorAttempt = {
    questId: "quest-javascript-accessor-attempt",
    questRevision: 1,
    languageId: "javascript",
    passed: 0,
    total: 0,
  };
  Object.defineProperty(accessorAttempt, "outcome", {
    enumerable: true,
    get() {
      outcomeGetterReads += 1;
      return "cancelled";
    },
  });
  assert.throws(() => repository.recordQuestAttempt(accessorAttempt), /제출 결과/);
  assert.equal(outcomeGetterReads, 0);

  assert.throws(
    () =>
      repository.recordQuestAttempt({
        questId: "quest-javascript-source-field",
        questRevision: 1,
        languageId: "javascript",
        outcome: "cancelled",
        passed: 0,
        total: 0,
        source: "attempt DTO에는 허용하지 않음",
      }),
    /제출 결과/,
  );
});

test("저장 데이터 정규화도 Code Quest accessor를 실행하지 않는다", () => {
  let sourceGetterReads = 0;
  let outcomeGetterReads = 0;
  const draft = {
    questId: "quest-javascript-stored-accessor-draft",
    languageId: "javascript",
    updatedAt: "2026-08-16T12:00:00.000Z",
  };
  Object.defineProperty(draft, "source", {
    enumerable: true,
    get() {
      sourceGetterReads += 1;
      return "실행되면 안 됨";
    },
  });
  const attempt = {
    id: "quest-2026-08-16T12:00:00.000Z-1",
    questId: "quest-javascript-stored-accessor-attempt",
    questRevision: 1,
    languageId: "javascript",
    passed: 0,
    total: 0,
    completedAt: "2026-08-16T12:00:00.000Z",
  };
  Object.defineProperty(attempt, "outcome", {
    enumerable: true,
    get() {
      outcomeGetterReads += 1;
      return "cancelled";
    },
  });

  const progress = normalizeProgress({
    ...createEmptyProgress(),
    questDrafts: [draft],
    questAttempts: [attempt],
  });

  assert.deepEqual(progress.questDrafts, []);
  assert.deepEqual(progress.questAttempts, []);
  assert.equal(sourceGetterReads, 0);
  assert.equal(outcomeGetterReads, 0);
});

test("Code Quest 데이터도 localStorage 실패 후 메모리 fallback에서 유지한다", () => {
  const throwingStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const repository = new LocalStorageProgressRepository(
    createBrowserStorage({ localStorage: throwingStorage }),
    fixedClock,
  );

  repository.saveQuestDraft({
    questId: "quest-javascript-memory-draft",
    languageId: "javascript",
    source: "function solve() {}",
  });
  repository.recordQuestAttempt({
    questId: "quest-javascript-memory-draft",
    questRevision: 1,
    languageId: "javascript",
    outcome: "runtime_error",
    passed: 0,
    total: 1,
  });

  assert.equal(repository.getQuestDraft("quest-javascript-memory-draft").source, "function solve() {}");
  assert.equal(repository.getProgress().questAttempts.length, 1);
  assert.deepEqual(repository.getPersistenceStatus(), { isPersistent: false });
});
