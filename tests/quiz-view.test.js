import assert from "node:assert/strict";
import test from "node:test";
import {
  renderQuizLoadingView,
  renderQuizQuestionView,
  renderQuizResultView,
  renderQuizScopeControls,
  renderQuizEmptyView,
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

test("채점 후 선택지를 잠그고 정답·선택한 오답의 근거를 먼저 표시한다", () => {
  const html = renderQuestion({
    selectedOptionId: "b",
    gradedAnswer,
    answeredCount: 1,
  });
  assert.equal((html.match(/data-quiz-option[^>]* disabled/g) ?? []).length, 4);
  assert.match(html, /오답입니다/);
  assert.match(html, /<strong>정답 설명<\/strong> 맞습니다/);
  assert.equal((html.match(/class="quiz-option-feedback"/g) ?? []).length, 2);
  assert.match(html, /data-quiz-feedback-toggle aria-expanded="false"/);
  assert.doesNotMatch(html, /비교식은 boolean을 반환합니다/);
  assert.match(html, /오답 · 내 선택/);
  assert.match(html, /data-quiz-next aria-disabled="false"/);
  assert.match(html, /aria-valuenow="7"/);
});

test("다른 보기 해설은 사용자가 펼친 경우 모두 보이며 펼침 상태를 전달한다", () => {
  const html = renderQuestion({ selectedOptionId: "b", gradedAnswer, otherFeedbackExpanded: true });
  assert.equal((html.match(/class="quiz-option-feedback"/g) ?? []).length, 4);
  assert.match(html, /data-quiz-feedback-toggle aria-expanded="true"/);
  assert.match(html, /비교식은 boolean을 반환합니다/);
});

test("채점 결과는 이름이 있는 단일 focus region으로 제공한다", () => {
  const html = renderQuestion({
    selectedOptionId: "b",
    gradedAnswer,
    answeredCount: 1,
  });
  const summary = html.match(/<section[^>]*data-quiz-grade-summary[^>]*>/)?.[0];
  assert.ok(summary);
  assert.match(summary, /tabindex="-1"/);
  assert.match(summary, /role="region"/);
  const titleId = summary.match(/aria-labelledby="([^"]+)"/)?.[1];
  assert.ok(titleId?.includes(question.id), "결과의 접근 가능한 이름은 해당 문항에 고유해야 한다.");
  assert.ok(html.includes(`<h3 id="${titleId}">오답입니다.</h3>`));
  assert.doesNotMatch(html, /data-quiz-grade-summary[^>]*role="status"/);
  assert.doesNotMatch(html, /data-quiz-grade-summary[^>]*aria-live/);
  assert.equal((html.match(/aria-live=/g) ?? []).length, 0);
});

test("전부 보기의 세 카드는 라디오·이름·해설·개념 초점 대상을 고유하게 연결한다", () => {
  const questions = ["one", "two", "three"].map((suffix) => ({ ...question, id: `quiz-javascript-${suffix}` }));
  const questionStates = questions.map((item, currentIndex) => ({
    question: item, currentIndex,
    selectedOptionId: currentIndex === 1 ? null : "b",
    gradedAnswer: currentIndex === 0 ? { ...gradedAnswer, questionId: item.id } : null,
    lessonHref: "#/learn/javascript/javascript-and-runtime",
    lessonTitle: "JavaScript 실행", relatedConceptTitle: "실행 결과",
    otherFeedbackExpanded: currentIndex === 0,
  }));
  const html = renderQuestion({ question: questions[1], currentIndex: 1, total: 3, answeredCount: 1, viewMode: "all", questionStates });
  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(allIds).size, allIds.length, "같은 화면에서 DOM id가 겹치면 안 된다.");
  const cards = html.split(/<section[^>]*data-quiz-question-id="/).slice(1);
  assert.equal(cards.length, 3);
  for (const [index, card] of cards.entries()) {
    const questionId = questions[index].id;
    assert.ok(card.startsWith(`${questionId}"`));
    const titleId = card.slice(0, card.indexOf(">") + 1).match(/aria-labelledby="([^"]+)"/)?.[1];
    assert.ok(titleId?.includes(questionId));
    assert.ok(card.includes(`<h2 id="${titleId}"`));
    const inputs = [...card.matchAll(/<input[^>]*type="radio"[^>]*>/g)].map((match) => match[0]);
    assert.equal(inputs.length, 4);
    const names = inputs.map((input) => input.match(/name="([^"]+)"/)?.[1]);
    assert.deepEqual([...new Set(names)], [`quiz-answer-${questionId}`]);
    for (const input of inputs) {
      const inputId = input.match(/\bid="([^"]+)"/)?.[1];
      assert.ok(inputId?.includes(questionId));
      assert.ok(card.includes(`<label for="${inputId}">`));
      for (const reference of input.match(/aria-describedby="([^"]+)"/)?.[1]?.split(" ") ?? []) {
        assert.ok(card.includes(`id="${reference}"`));
      }
    }
    assert.ok(card.includes(`id="quiz-related-concept-${questionId}"`));
    if (index === 0) {
      assert.match(card, /정답 설명/);
      assert.match(card, /비교식은 boolean을 반환합니다/);
    } else {
      assert.doesNotMatch(card, /class="quiz-option-feedback"|data-quiz-grade-summary|is-correct|정답 설명/);
    }
  }
  const single = renderQuestion({ ...questionStates[1], total: 3, viewMode: "single" });
  const singleInputIds = [...single.matchAll(/<input id="([^"]+)"[^>]*data-quiz-option/g)].map((match) => match[1]);
  const allSecondInputIds = [...cards[1].matchAll(/<input id="([^"]+)"[^>]*data-quiz-option/g)].map((match) => match[1]);
  assert.equal(singleInputIds.length, 4);
  assert.deepEqual(singleInputIds, allSecondInputIds, "보기 전환 후에도 같은 문항 입력으로 초점을 복구할 수 있어야 한다.");
});

test("하나씩 전체 채점 화면은 답을 모으기 위한 다음 이동을 제공하고 선택 방식도 표시한다", () => {
  const html = renderQuestion({ total: 3, gradingMode: "batch" });
  assert.match(html, /data-quiz-next aria-disabled="false"/);
  assert.match(html, /data-quiz-view-mode="single"[^>]*aria-pressed="true"/);
  assert.match(html, /data-quiz-view-mode="all"[^>]*aria-pressed="false"/);
  assert.match(html, /data-quiz-grading-mode="batch"[^>]*aria-pressed="true"/);
  assert.match(html, /data-quiz-check-all[^>]*disabled/);
  assert.doesNotMatch(html, /class="quiz-option-feedback"|data-quiz-grade-summary/);
});

test("마지막 문항은 다음 후보가 있으면 바로 다음 문제를, 없으면 결과 보기를 제공한다", () => {
  for (const viewMode of ["single", "all"]) {
    for (const hasNextScope of [true, false]) {
      const html = renderQuestion({ currentIndex: 0, total: 1, selectedOptionId: "b", gradedAnswer, answeredCount: 1, viewMode, hasNextScope });
      assert.match(html, /aria-valuenow="100"/);
      if (viewMode === "single") assert.match(html, /문제 <strong>1\/1<\/strong>/);
      const action = viewMode === "single" ? "data-quiz-next" : "data-quiz-finish";
      assert.match(html, new RegExp(`${action}[^>]*>${hasNextScope ? "다음 문제" : "결과 보기"}</button>`));
      assert.match(html, /이 문제 묶음의 채점을 완료했습니다/);
      assert.doesNotMatch(html, /결과 보기에서 다음 키워드로 이어갈 수 있습니다/);
      assert.doesNotMatch(html, /data-quiz-continue/);
    }
  }
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

test("단원 선택기는 과정명·문항 수·저장 기록 동작을 구분하고 표시 텍스트를 escape한다", () => {
  const html = renderQuizScopeControls({
    lessons: [{ id: 'lesson"bad', title: "<함수>", courseName: "<원문>", questionCount: 2 }],
    selectedLessonId: 'lesson"bad',
    recentAttempt: { score: 1, total: 2 },
    incorrectQuestionCount: 1,
  });
  assert.match(html, /<label for="quiz-lesson-scope">/);
  assert.match(html, /<option value="lesson&quot;bad" selected>&lt;원문&gt; · &lt;함수&gt; \(2문항\)/);
  assert.match(html, /data-quiz-retry="saved-incorrect">저장된 오답 다시 풀기 \(1\)/);
  assert.match(html, /data-quiz-history>최근 완료 결과 보기/);
  assert.match(html, /선택과 채점 상태는 이 브라우저에 저장됩니다/);
  assert.match(html, /완료 기록은 유지됩니다/);
  const emptyHistory = renderQuizScopeControls();
  assert.match(emptyHistory, /data-quiz-retry="saved-incorrect" disabled/);
  assert.match(emptyHistory, /data-quiz-history disabled/);
});

test("문제 없음 화면은 선택기와 읽기 링크를 유지하고 제출·점수를 표시하지 않는다", () => {
  const html = renderQuizEmptyView({
    title: "<단원>",
    scopeControls: renderQuizScopeControls(),
    lessonHref: "#/learn/javascript/functions",
  });
  assert.match(html, /연결된 문제가 없습니다/);
  assert.match(html, /&lt;단원&gt;/);
  assert.match(html, /data-quiz-lesson/);
  assert.match(html, /href="#\/learn\/javascript\/functions"/);
  assert.doesNotMatch(html, /data-quiz-check|class="quiz-score"/);
});

test("채점 전후 관련 개념 버튼을 제공하고 내부 ID나 새 탭 이동을 노출하지 않는다", () => {
  const options = {
    question: { ...question, conceptId: 'js.functions<img src="x">' },
    learningObjective: "`return`과 <script>를 구분한다.",
    lessonHref: "#/learn/javascript-notes/functions",
    lessonTitle: "<함수>",
    relatedConceptTitle: "<함수의 반환>",
  };
  const before = renderQuestion(options);
  assert.match(before, /<strong>학습 목표<\/strong> <code>return<\/code>과 &lt;script&gt;/);
  assert.doesNotMatch(before, /근거 교안|정답 설명/);
  const after = renderQuestion({ ...options, gradedAnswer, selectedOptionId: "b" });
  for (const html of [before, after]) {
    assert.match(html, /data-related-concept aria-haspopup="dialog"/);
    assert.match(html, /관련 개념: &lt;함수의 반환&gt;/);
    assert.doesNotMatch(html, /target="_blank"|js\.functions/);
  }
  assert.doesNotMatch(after, /<script>|<img /);
});

test("저장 결과에는 문항별 정오·근거와 저장 당시 날짜 및 정답률 한계를 표시한다", () => {
  const html = renderQuizResultView({
    title: "함수 복습",
    summary: { correct: 0, total: 1, percent: 0, incorrectQuestionIds: [question.id] },
    completedAt: "2026-09-09T12:00:00.000Z",
    questionResults: [{
      prompt: "<img src=x>", isCorrect: false, lessonHref: "#/learn/javascript/functions", lessonTitle: "함수", conceptId: "js.functions",
    }],
  });
  assert.match(html, /2026-09-09 저장 당시 결과/);
  assert.match(html, /<li><strong>오답<\/strong> &lt;img src=x&gt;/);
  assert.match(html, /관련 학습문서: 함수/);
  assert.doesNotMatch(html, /관련 개념: js.functions/);
  assert.match(html, /독립적인 구현 능력이나 완전한 숙련을 뜻하지 않습니다/);
  assert.doesNotMatch(html, /<img /);
});

test("다음 키워드 결과 동작은 실제 묶음명·문항 수와 저장 차단 상태를 제공한다", () => {
  const summary = { correct: 0, total: 1, percent: 0, incorrectQuestionIds: [question.id] };
  const nextScope = { title: '문서 구조와 <HTML> "의미"', count: 1 };
  for (const continuationBlocked of [false, true]) {
    const html = renderQuizResultView({ summary, nextScope, continuationBlocked });
    const button = html.match(/<button[^>]*data-quiz-continue[^>]*>/)?.[0];
    assert.ok(button);
    assert.match(button, /class="button button--primary"/);
    assert.match(button, /type="button"/);
    assert.match(button, /aria-describedby="quiz-next-scope-description"/);
    assert.equal(/ disabled/.test(button), continuationBlocked);
    assert.match(html, /id="quiz-next-scope-description">다음 키워드: <strong>문서 구조와 &lt;HTML&gt; &quot;의미&quot;<\/strong> · 1문항/);
    assert.match(html, />다음 키워드 풀기<\/button>/);
    assert.match(html, /data-quiz-retry="incorrect">오답 다시 풀기/);
    assert.match(html, /href="#\/review">다른 문제 찾기/);
    assert.doesNotMatch(html, /<HTML>/);
  }
});

test("다음 카드가 없는 결과는 마지막 범위와 대응 불명 범위를 구분한다", () => {
  for (const isLastScope of [true, false]) {
    const html = renderQuizResultView({ isLastScope });
    assert.doesNotMatch(html, /data-quiz-continue|quiz-next-scope-description/);
    assert.equal(html.includes("이 주제의 마지막 문제 묶음입니다"), isLastScope);
    assert.match(html, /href="#\/review">다른 문제 찾기/);
  }
});
