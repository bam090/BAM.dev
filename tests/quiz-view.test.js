import assert from "node:assert/strict";
import test from "node:test";
import {
  renderQuizLoadingView,
  renderQuizQuestionView,
  renderQuizResultView,
  renderReviewNavigationLink,
} from "../src/ui/quiz-view.js";

const question = {
  id: "quiz-javascript-test-question",
  lessonId: "js-01-runtime",
  difficulty: "basic",
  prompt: "다음 코드의 결과는 무엇인가요?",
  code: "const value = 1 < 2;",
  options: [
    { id: "a", text: "true", feedback: "맞습니다." },
    { id: "b", text: "false", feedback: "비교 결과를 다시 확인하세요." },
    { id: "c", text: "1", feedback: "비교식은 boolean을 반환합니다." },
    { id: "d", text: "오류", feedback: "유효한 비교식입니다." },
  ],
};

const gradedAnswer = {
  questionId: question.id,
  lessonId: question.lessonId,
  selectedOptionId: "b",
  correctOptionId: "a",
  isCorrect: false,
  feedback: [
    { optionId: "a", isCorrect: true, message: "맞습니다." },
    { optionId: "b", isCorrect: false, message: "비교 결과를 다시 확인하세요." },
    { optionId: "c", isCorrect: false, message: "비교식은 boolean을 반환합니다." },
    { optionId: "d", isCorrect: false, message: "유효한 비교식입니다." },
  ],
};

function renderQuestion(overrides = {}) {
  return renderQuizQuestionView({
    languageId: "javascript",
    languageName: "JavaScript",
    title: "JavaScript 객관식 복습",
    question,
    currentIndex: 0,
    total: 14,
    answeredCount: 0,
    ...overrides,
  });
}

function quizCodeText(html) {
  const markup = html.match(/<figure class="quiz-code">[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>/)?.[1];
  assert.notEqual(markup, undefined);
  return markup
    .replace(/<\/?span(?:\s[^>]*)?>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&");
}

test("교안과 구분된 실제 복습 링크를 렌더링한다", () => {
  const html = renderReviewNavigationLink({
    href: "#/review/javascript",
    isCurrent: true,
  });
  assert.match(html, /<nav class="review-nav"/);
  assert.match(html, /href="#\/review\/javascript"/);
  assert.match(html, /객관식 복습/);
  assert.match(html, /즉시 채점 · 전체 해설/);
  assert.doesNotMatch(html, /14문항/);
  assert.match(html, /aria-current="page"/);
});

test("로딩 화면은 skip link 대상과 status를 유지하고 문자열을 escape한다", () => {
  const html = renderQuizLoadingView({ title: '<script>alert("x")</script>' });
  assert.match(html, /<main class="loading-page" id="lesson-content" tabindex="-1">/);
  assert.match(html, /class="quiz-state-message" role="status"/);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
});

test("미선택 문제는 fieldset과 라디오 4개를 제공하고 정답 확인을 비활성화한다", () => {
  const html = renderQuestion();
  assert.match(html, /<fieldset class="quiz-options">/);
  assert.match(html, /<legend>답을 하나 선택하세요.<\/legend>/);
  assert.equal((html.match(/type="radio"/g) ?? []).length, 4);
  assert.match(html, /data-quiz-check disabled/);
  assert.match(html, /data-quiz-next aria-disabled="true"/);
  assert.match(html, /정답을 확인한 뒤 다음 문제로 이동할 수 있습니다/);
  assert.match(html, /<pre class="syntax-code" tabindex="0" aria-label="JavaScript 문제 코드">/);
  assert.match(html, /class="language-javascript"/);
  assert.match(html, /code-token--keyword[^>]*>const</);
  assert.match(html, /code-token--number[^>]*>1</);
  assert.match(html, /class="code-line"/);
});

test("HTML이 섞인 복습 코드는 내부 script까지 자동으로 강조한다", () => {
  const code = [
    "<script>",
    '  const button = document.querySelector("button"); // 아직 button이 없음',
    "</script>",
    "<button>확인</button>",
    'const label = "확인";',
  ].join("\n");
  const html = renderQuestion({ question: { ...question, code } });

  assert.match(html, /class="language-html-javascript"/);
  assert.match(html, /code-token--tag[^>]*>script</);
  assert.match(html, /code-token--keyword[^>]*>const</);
  assert.match(html, /code-token--builtin[^>]*>document</);
  assert.match(html, /code-token--comment[^>]*>\/\/ 아직 button이 없음</);
  assert.match(html, /code-token--keyword[^>]*>const</);
  assert.match(html, /code-token--string[^>]*>&quot;확인&quot;</);
  assert.equal(quizCodeText(html), code);
});

test("선택한 미채점 문제는 확인 버튼을 활성화하되 정답 정보를 노출하지 않는다", () => {
  const html = renderQuestion({ selectedOptionId: "b" });
  assert.match(html, /value="b" data-quiz-option checked/);
  assert.match(html, /data-quiz-check>정답 확인<\/button>/);
  assert.ok(!html.includes("is-correct"));
  assert.ok(!html.includes("quiz-option-feedback"));
  assert.ok(!html.includes("정답 설명"));
});

test("문제·코드·선택지의 위험 문자열을 실행 가능한 HTML로 통과시키지 않는다", () => {
  const maliciousQuestion = {
    ...question,
    prompt: '<img src=x onerror="alert(1)">',
    code: "</code><script>alert(1)</script>",
    options: question.options.map((option, index) => ({
      ...option,
      id: index === 0 ? 'a" autofocus onfocus="alert(1)' : option.id,
      text: index === 0 ? "<button>위험</button>" : option.text,
    })),
  };
  const html = renderQuestion({
    languageName: "<em>위험 언어</em>",
    question: maliciousQuestion,
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<button>위험</button>"));
  assert.ok(!html.includes("<img src=x"));
  assert.equal(quizCodeText(html), maliciousQuestion.code);
  assert.match(html, /&lt;button&gt;위험&lt;\/button&gt;/);
  assert.match(html, /&quot; autofocus onfocus=&quot;/);
  assert.match(html, /&lt;em&gt;위험 언어&lt;\/em&gt;/);
});

test("문제·선택지·해설의 백틱 코드는 안전한 인라인 코드로 렌더링한다", () => {
  const inlineQuestion = {
    ...question,
    prompt: "`total`과 <tag>를 확인하세요.",
    options: question.options.map((option, index) => ({
      ...option,
      text: index === 0 ? "`console.log()` 사용" : option.text,
    })),
  };
  const inlineGradedAnswer = {
    ...gradedAnswer,
    feedback: gradedAnswer.feedback.map((feedback, index) => ({
      ...feedback,
      message: index === 0 ? "`total`은 숫자입니다." : feedback.message,
    })),
  };
  const html = renderQuestion({
    question: inlineQuestion,
    selectedOptionId: "a",
    gradedAnswer: inlineGradedAnswer,
  });

  assert.match(html, /<code>total<\/code>과 &lt;tag&gt;/);
  assert.match(html, /<code>console\.log\(\)<\/code> 사용/);
  assert.match(html, /<code>total<\/code>은 숫자입니다/);
  assert.doesNotMatch(html, /`(?:total|console\.log)/);
});

test("채점 후 선택지를 잠그고 정답 설명과 네 선택지 feedback을 모두 표시한다", () => {
  const html = renderQuestion({
    selectedOptionId: "b",
    gradedAnswer,
    answeredCount: 1,
  });
  assert.equal((html.match(/data-quiz-option[^>]* disabled/g) ?? []).length, 4);
  assert.match(html, /오답입니다/);
  assert.match(html, /<strong>정답 설명<\/strong> 맞습니다/);
  assert.equal((html.match(/class="quiz-option-feedback"/g) ?? []).length, 4);
  assert.match(html, /오답 · 내 선택/);
  assert.match(html, /data-quiz-next aria-disabled="false"/);
  assert.match(html, /aria-valuenow="7"/);
});

test("채점 결과는 이름이 있는 단일 focus region으로 제공한다", () => {
  const html = renderQuestion({
    selectedOptionId: "b",
    gradedAnswer,
    answeredCount: 1,
  });
  assert.match(
    html,
    /data-quiz-grade-summary tabindex="-1" role="region" aria-labelledby="quiz-answer-summary-title"/,
  );
  assert.match(html, /<h3 id="quiz-answer-summary-title">오답입니다\.<\/h3>/);
  assert.doesNotMatch(html, /data-quiz-grade-summary[^>]*role="status"/);
  assert.doesNotMatch(html, /data-quiz-grade-summary[^>]*aria-live/);
  assert.equal((html.match(/aria-live=/g) ?? []).length, 0);
});

test("마지막 문항은 채점 후 결과 보기 동작을 제공한다", () => {
  const html = renderQuestion({
    currentIndex: 13,
    selectedOptionId: "b",
    gradedAnswer,
    answeredCount: 14,
  });
  assert.match(html, /문제 <strong>14\/14<\/strong>/);
  assert.match(html, /aria-valuenow="100"/);
  assert.match(html, /data-quiz-next aria-disabled="false">결과 보기/);
});

test("결과 화면은 점수·정답률·오답 수와 오답 재도전을 표시한다", () => {
  const html = renderQuizResultView({
    title: "JavaScript 객관식 복습",
    summary: {
      correct: 10,
      total: 14,
      percent: 71,
      incorrectQuestionIds: ["q1", "q2", "q3", "q4"],
    },
    lessonHref: "#/learn/javascript/javascript-and-runtime",
  });
  assert.match(html, /10<span>\/14<\/span>/);
  assert.match(html, /71% 정답/);
  assert.match(html, /<dt>오답<\/dt><dd>4문항<\/dd>/);
  assert.match(html, /data-quiz-retry="incorrect">오답 다시 풀기/);
});

test("만점 결과와 메모리·실패 저장 상태를 구분한다", () => {
  const summary = {
    correct: 14,
    total: 14,
    percent: 100,
    incorrectQuestionIds: [],
  };
  const memoryHtml = renderQuizResultView({ summary, persistenceStatus: "memory" });
  const failedHtml = renderQuizResultView({ summary, persistenceStatus: "failed" });
  assert.match(memoryHtml, /data-quiz-retry="all">전체 다시 풀기/);
  assert.match(memoryHtml, /현재 탭에만 저장되었습니다/);
  assert.match(failedHtml, /결과는 화면에 유지되지만 저장하지 못했습니다/);
});

test("최근 결과와 현재 컬렉션의 저장된 오답 수를 헤더에 표시한다", () => {
  const html = renderQuestion({
    recentAttempt: { score: 9, total: 14 },
    incorrectQuestionCount: 5,
  });
  assert.match(html, /최근 결과 <strong>9\/14 \(64%\)<\/strong>/);
  assert.match(html, /저장된 오답 <strong>5문항<\/strong>/);
});
