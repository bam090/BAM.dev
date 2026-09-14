import assert from "node:assert/strict";
import test from "node:test";
import { renderLearningShell } from "../src/ui/app-shell.js";
import {
  renderMyPageNavigationLink,
  renderMyPageView,
} from "../src/ui/my-page-view.js";

const curriculum = {
  categories: [
    { id: "language", status: "available" },
    { id: "algorithm", status: "available" },
  ],
  languages: [
    { id: "javascript", name: "JavaScript", shortName: "JS", accent: "javascript", status: "available" },
    { id: "java", name: "Java", shortName: "Java", accent: "java", status: "available" },
  ],
  courses: [
    { id: "javascript", categoryId: "language", languageId: "javascript", name: "JavaScript", shortName: "JS", accent: "javascript", status: "available" },
    { id: "java", categoryId: "language", languageId: "java", name: "Java", shortName: "Java", accent: "java", status: "available" },
    { id: "algorithm", categoryId: "algorithm", languageId: "java", name: "알고리즘", shortName: "ALGO", accent: "java", status: "available" },
    { id: "spring", categoryId: "language", languageId: "java", name: "Spring", shortName: "SPRING", accent: "java", status: "available" },
  ],
  lessons: [
    { id: "js-current", courseId: "javascript", languageId: "javascript", slug: "current", title: "JS 현재 문서" },
    { id: "java-current", courseId: "java", languageId: "java", slug: "wiki-runtime", title: "Java 현재 문서" },
    { id: "java-01-types-methods", courseId: "java", languageId: "java", slug: "types-and-methods", title: "Java 기본 타입과 메서드", archivedFromCatalog: true },
    { id: "algo-current", courseId: "algorithm", languageId: "java", slug: "stack-and-queue", title: "스택과 큐" },
    { id: "algo-archived", courseId: "algorithm", languageId: "java", slug: "old-algorithm", title: "예전 알고리즘", archivedFromCatalog: true },
    { id: "spring-ioc-di", courseId: "spring", languageId: "java", slug: "ioc-di", title: "IoC와 DI" },
  ],
};

const codeQuestCollections = new Map([
  [
    "javascript",
    {
      quests: [
        {
          id: "quest-javascript-current",
          slug: "current",
          title: "현재 Quest",
          revision: 2,
        },
      ],
    },
  ],
]);

const codingTestCollections = [
  {
    languageId: "javascript",
    problems: [
      {
        id: "coding-test-javascript-current",
        slug: "current",
        title: "현재 코딩테스트",
        revision: 1,
      },
    ],
  },
];

const quizCollections = new Map([
  [
    "java",
    {
      languageId: "java",
      questions: [
        {
          id: "quiz-java-spring-ioc-di-container-wiring",
          lessonId: "spring-ioc-di",
          conceptId: "spring.ioc-di",
        },
      ],
    },
  ],
]);

test("학습 shell과 보관 화면 링크는 #/my를 안전한 현재 페이지 링크로 제공한다", () => {
  const shell = renderLearningShell({ current: "my-page" });
  assert.match(shell, /href="#\/my"[^>]*aria-current="page"/);

  const escaped = renderMyPageNavigationLink({
    href: '#/my" data-injected="true',
    isCurrent: true,
  });
  assert.match(escaped, /href="#\/my&quot; data-injected=&quot;true"/);
  assert.match(escaped, /aria-current="page"/);
  assert.doesNotMatch(escaped, /data-injected="true"/);
});

test("과정별 활성 분모와 이어 학습 링크는 language가 아니라 실제 course를 사용한다", () => {
  const html = renderMyPageView({
    curriculum,
    quizCollections,
    progress: {
      completedLessonIds: ["js-current", "java-01-types-methods", "algo-archived"],
      lastLessonId: "java-01-types-methods",
    },
  });

  assert.match(html, /완료한 교안<\/dt><dd>1<span>\/4<\/span>/);
  assert.match(html, /<strong>Java<\/strong><small>0\/1개 문서 완료/);
  assert.match(html, /<strong>알고리즘<\/strong><small>0\/1개 문서 완료/);
  assert.match(html, /<strong>Spring<\/strong><small>0\/1개 문서 완료/);
  assert.match(html, /href="#\/learn\/java\/wiki-runtime"/);
  assert.match(html, /href="#\/learn\/algorithm\/stack-and-queue"/);
  assert.match(html, /href="#\/learn\/spring\/ioc-di"/);
  assert.doesNotMatch(html, /href="#\/learn\/java\/stack-and-queue"/);
  assert.doesNotMatch(html, /href="#\/learn\/java\/ioc-di"/);
});

test("현재 재도전은 정확한 범위로 연결하고 현재 없는 Java 실습 이력에는 링크를 만들지 않는다", () => {
  const html = renderMyPageView({
    curriculum,
    quizCollections,
    codeQuestCollections,
    codingTestCollections,
    progress: {
      completedLessonIds: [],
      incorrectQuestionIds: ["quiz-java-spring-ioc-di-container-wiring"],
      completedQuestIds: [],
      completedQuestRevisions: [],
      completedCodingTestProblems: [],
      questAttempts: [
        {
          id: "current-quest",
          questId: "quest-javascript-current",
          questRevision: 2,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 1,
          total: 2,
          completedAt: "2026-08-21T10:00:00.000Z",
        },
        {
          id: "legacy-java-quest",
          questId: "quest-java-distinct-names",
          questRevision: 2,
          languageId: "java",
          outcome: "passed",
          passed: 2,
          total: 2,
          completedAt: "2026-08-20T10:00:00.000Z",
        },
      ],
      codingTestSubmissions: [
        {
          id: "current-coding-test",
          problemId: "coding-test-javascript-current",
          problemRevision: 1,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 1,
          total: 3,
          completedAt: "2026-08-22T10:00:00.000Z",
        },
        {
          id: "legacy-java-coding-test",
          problemId: "coding-test-java-maximum-window-sum",
          problemRevision: 1,
          languageId: "java",
          outcome: "passed",
          passed: 3,
          total: 3,
          completedAt: "2026-08-19T10:00:00.000Z",
        },
      ],
    },
  });

  assert.match(html, /href="#\/review\/java\/spring-ioc-di"/);
  assert.match(html, /href="#\/quest\/javascript\/current"/);
  assert.match(html, /href="#\/coding-tests\/javascript\/current"/);
  assert.match(html, /Java Code Quest/);
  assert.match(html, /Java 코딩테스트/);
  assert.equal((html.match(/이전 버전 · 현재 미제공 실습/g) ?? []).length, 2);
  assert.doesNotMatch(html, /href="#\/quest\/java\//);
  assert.doesNotMatch(html, /href="#\/coding-tests\/java\//);
});

test("보관 완료 교안은 정확한 깊은 URL로 남기고 없는 완료 ID는 미제공 기록으로 분리한다", () => {
  const html = renderMyPageView({
    curriculum,
    quizCollections,
    progress: {
      completedLessonIds: ["java-01-types-methods", "lesson-removed-before-upgrade"],
      lastLessonId: "lesson-removed-before-upgrade",
    },
  });

  assert.match(html, /Java 기본 타입과 메서드/);
  assert.match(html, /href="#\/learn\/java\/types-and-methods"/);
  assert.match(html, /이전 문서 기록 · 현재 미제공/);
  assert.doesNotMatch(html, /href="[^"]*lesson-removed-before-upgrade/);
  assert.doesNotMatch(html, /최근 교안 이어 학습/);
});

test("영구 저장·메모리 저장·읽기 오류와 빈 기록을 서로 다른 상태로 설명한다", () => {
  const persistent = renderMyPageView({ curriculum, isPersistent: true });
  const memory = renderMyPageView({ curriculum, isPersistent: false });
  const failed = renderMyPageView({
    curriculum,
    isPersistent: false,
    storageReadErrors: ["progress"],
  });

  assert.match(persistent, /이 브라우저에 저장 중|로컬 저장/);
  assert.match(memory, /현재 탭에만 임시 저장 중|메모리만/);
  assert.match(failed, /기록을 읽지 못|불러오지 못/);
  assert.doesNotMatch(failed, /현재 탭에만 임시 저장 중/);
  assert.match(failed, /확인 불가/);
  assert.match(failed, /일부 풀이 또는 제출 기록을 불러오지 못했습니다/);
});
