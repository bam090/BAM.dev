import assert from "node:assert/strict";
import test from "node:test";
import {
  renderMyPageNavigationLink,
  renderMyPageView,
} from "../src/ui/my-page-view.js";

const curriculum = {
  languages: [
    {
      id: "javascript",
      name: "JavaScript",
      shortName: "JS",
      accent: "javascript",
      status: "available",
    },
    {
      id: "html",
      name: "HTML",
      shortName: "HTML",
      accent: "html",
      status: "available",
    },
  ],
  lessons: [
    {
      id: "js-01-runtime",
      languageId: "javascript",
      slug: "javascript-runtime",
      title: "런타임",
    },
    {
      id: "html-01-document",
      languageId: "html",
      slug: "document-structure",
      title: "문서 구조",
    },
  ],
};

const codeQuestCollections = new Map([
  [
    "javascript",
    {
      quests: [
        {
          id: "quest-javascript-delivery-fee",
          slug: "delivery-fee-policy",
          title: "배송비 정책 계산하기",
          revision: 2,
        },
      ],
    },
  ],
]);

const codingTestCollections = new Map([
  [
    "javascript",
    {
      problems: [
        {
          id: "coding-test-javascript-target-words",
          slug: "count-target-words",
          title: "목표 단어 세기",
          revision: 1,
        },
      ],
    },
  ],
]);

const webProjectCollection = {
  projects: [
    {
      id: "web-project-responsive-learning-plan",
      slug: "responsive-learning-plan",
      title: "반응형 학습 계획 보드",
      revision: 2,
    },
  ],
};

test("마이페이지 내비게이션은 안전한 링크와 현재 페이지 상태를 렌더링한다", () => {
  const html = renderMyPageNavigationLink({
    href: '#/my" data-injected="true',
    isCurrent: true,
  });

  assert.match(html, /aria-label="마이페이지"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /href="#\/my&quot; data-injected=&quot;true"/);
  assert.doesNotMatch(html, /data-injected="true"/);
});

test("마이페이지는 로컬 진도·오답·재도전·최근 제출을 실제 기록으로 요약한다", () => {
  const html = renderMyPageView({
    curriculum,
    codeQuestCollections,
    codingTestCollections,
    webProjectCollection,
    progress: {
      completedLessonIds: ["js-01-runtime"],
      lastLessonId: "js-01-runtime",
      incorrectQuestionIds: ["quiz-javascript-runtime-one"],
      completedQuestIds: [],
      quizAttempts: [
        {
          id: "quiz-one",
          languageId: "javascript",
          score: 1,
          total: 2,
          completedAt: "2026-08-20T10:00:00.000Z",
        },
      ],
      questAttempts: [
        {
          id: "quest-one",
          questId: "quest-javascript-delivery-fee",
          questRevision: 2,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 2,
          total: 3,
          completedAt: "2026-08-21T10:00:00.000Z",
        },
      ],
      codingTestSubmissions: [
        {
          id: "coding-one",
          problemId: "coding-test-javascript-target-words",
          problemRevision: 1,
          languageId: "javascript",
          outcome: "passed",
          passed: 4,
          total: 4,
          completedAt: "2026-08-22T10:00:00.000Z",
        },
      ],
      completedCodingTestProblems: [
        {
          problemId: "coding-test-javascript-target-words",
          problemRevision: 1,
        },
      ],
    },
    webProjectState: {
      submissions: [
        {
          submissionId: "web-one",
          projectId: "web-project-responsive-learning-plan",
          projectRevision: 2,
          recordedAt: "2026-08-23T10:00:00.000Z",
          report: {
            isComplete: true,
            provisionalScore: 80,
            maxPoints: 100,
          },
        },
      ],
    },
    isPersistent: true,
  });

  assert.match(html, /<h1 id="my-page-title">마이페이지<\/h1>/);
  assert.match(html, /최근 교안 이어 학습/);
  assert.match(html, /완료한 교안[\s\S]*1<span>\/2<\/span>/);
  assert.match(html, /저장된 오답[\s\S]*1<span>개<\/span>/);
  assert.match(html, /푼 코딩테스트[\s\S]*1<span>\/1<\/span>/);
  assert.match(html, /href="#\/review\/javascript"/);
  assert.match(html, /저장된 오답 1개/);
  assert.match(html, /배송비 정책 계산하기/);
  assert.match(html, /재도전 필요 · 공개 테스트 2\/3 통과/);
  assert.match(html, /목표 단어 세기/);
  assert.match(html, /자가평가 포함 임시 점수 80\/100점/);
  assert.match(html, /datetime="2026-08-23T10:00:00.000Z"/);
  assert.match(html, /계정 로그인과 기기 간 동기화는 아직 연결하지 않았습니다/);
  assert.doesNotMatch(html, /검증 완료/);
});

test("기록이 없거나 영구 저장이 막혀도 명확한 빈 상태와 경고를 보여 준다", () => {
  const html = renderMyPageView({
    curriculum,
    codeQuestCollections,
    codingTestCollections,
    webProjectCollection,
    isPersistent: false,
  });

  assert.match(html, /현재 탭에만 임시 저장 중/);
  assert.match(html, /탭을 닫으면 기록이 사라질 수 있습니다/);
  assert.match(html, /지금 저장된 재도전 대상이 없습니다/);
  assert.match(html, /아직 저장된 풀이 또는 제출 기록이 없습니다/);
});

test("오래된 리비전의 최신 기록이 현재 리비전 재도전을 가리지 않는다", () => {
  const html = renderMyPageView({
    curriculum,
    codeQuestCollections,
    codingTestCollections,
    webProjectCollection,
    progress: {
      incorrectQuestionIds: [],
      completedQuestIds: [],
      completedCodingTestProblems: [],
      questAttempts: [
        {
          questId: "quest-javascript-delivery-fee",
          questRevision: 2,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 1,
          total: 3,
        },
        {
          questId: "quest-javascript-delivery-fee",
          questRevision: 1,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 0,
          total: 3,
        },
      ],
      codingTestSubmissions: [
        {
          problemId: "coding-test-javascript-target-words",
          problemRevision: 1,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 2,
          total: 4,
        },
        {
          problemId: "coding-test-javascript-target-words",
          problemRevision: 0,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 0,
          total: 4,
        },
      ],
    },
    webProjectState: {
      submissions: [
        {
          projectId: "web-project-responsive-learning-plan",
          projectRevision: 2,
          report: { isComplete: false, provisionalScore: null, maxPoints: 100 },
        },
        {
          projectId: "web-project-responsive-learning-plan",
          projectRevision: 1,
          report: { isComplete: false, provisionalScore: null, maxPoints: 100 },
        },
      ],
    },
  });

  assert.match(html, /공개 테스트 1\/3 통과/);
  assert.match(html, /공개 테스트 2\/4 통과/);
  assert.match(html, /평가를 끝까지 완료하지 않았습니다/);
});

test("현재 Quest 리비전의 실패 기록은 과거 완료 ID보다 우선한다", () => {
  const html = renderMyPageView({
    curriculum,
    codeQuestCollections,
    progress: {
      completedQuestIds: ["quest-javascript-delivery-fee"],
      questAttempts: [
        {
          questId: "quest-javascript-delivery-fee",
          questRevision: 2,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 2,
          total: 3,
        },
      ],
    },
  });

  assert.match(html, /완료한 Quest[\s\S]*0<span>\/1<\/span>/);
  assert.match(html, /배송비 정책 계산하기/);
  assert.match(html, /재도전 필요 · 공개 테스트 2\/3 통과/);
});

test("저장된 현재 Quest 완료 리비전은 이후 연습 실패로 취소되지 않는다", () => {
  const html = renderMyPageView({
    curriculum,
    codeQuestCollections,
    progress: {
      completedQuestIds: ["quest-javascript-delivery-fee"],
      completedQuestRevisions: [
        {
          questId: "quest-javascript-delivery-fee",
          questRevision: 2,
          completedAt: "2026-08-23T12:00:00.000Z",
        },
      ],
      questAttempts: [
        {
          questId: "quest-javascript-delivery-fee",
          questRevision: 2,
          languageId: "javascript",
          outcome: "wrong_answer",
          passed: 2,
          total: 3,
        },
      ],
    },
  });

  assert.match(html, /완료한 Quest[\s\S]*1<span>\/1<\/span>/);
  assert.doesNotMatch(html, /재도전 필요 · 공개 테스트 2\/3 통과/);
});

test("콘텐츠 표시 문자열을 HTML로 해석하지 않는다", () => {
  const html = renderMyPageView({
    curriculum: {
      languages: [
        {
          id: "javascript",
          name: '<script data-xss="yes">bad()</script>',
          shortName: "JS",
          accent: "javascript",
          status: "available",
        },
      ],
      lessons: [
        {
          id: "js-01-runtime",
          languageId: "javascript",
          slug: "runtime",
          title: "런타임",
        },
      ],
    },
  });

  assert.doesNotMatch(html, /<script data-xss=/);
  assert.match(html, /&lt;script data-xss=&quot;yes&quot;&gt;/);
});
