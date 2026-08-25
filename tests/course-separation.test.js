import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp, supportsCodingTests } from "../src/app.js";
import {
  getLessonsForCourse,
  getLessonsForLanguage,
} from "../src/core/content.js";
import { renderMarkdown } from "../src/ui/markdown.js";

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

function createShellHarness() {
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum,
    root: { innerHTML: "" },
    menuOpen: false,
    codeQuestCollections: new Map(),
    progressRepository: {
      getProgress() {
        return { completedLessonIds: [] };
      },
    },
    getCodingTestCollectionForLanguage() {
      return null;
    },
    getSolvedCodingTestProblemIds() {
      return new Set();
    },
    getWebProjectNavigationOptions() {
      return null;
    },
    syncMenuState() {},
  });
  return app;
}

test("JavaScript 언어 과정 7개와 알고리즘 12개를 실행 언어 합계 19개와 구분한다", () => {
  assert.equal(getLessonsForCourse(curriculum, "javascript").length, 7);
  assert.equal(getLessonsForCourse(curriculum, "algorithm").length, 12);
  assert.equal(getLessonsForLanguage(curriculum, "javascript").length, 19);
});

test("모든 교안은 원문 학습 목표를 hero에 한 번만 렌더링하고 나머지 섹션을 보존한다", async () => {
  const app = createShellHarness();
  const renderedById = new Map();

  for (const lesson of curriculum.lessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const objectivesMarkdown = markdown.match(
      /(?:^|\n)(## 학습 목표\n[\s\S]*?)(?=\n##\s|$)/,
    )?.[1];
    assert.ok(objectivesMarkdown, `${lesson.id}: 원문 학습 목표가 필요합니다.`);

    app.currentLesson = lesson;
    app.currentMarkdown = markdown;
    app.renderLesson();

    const html = app.root.innerHTML;
    const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
    const body = html.match(/<article class="lesson-body">\s*([\s\S]*?)\s*<\/article>/)?.[1] ?? "";
    const objectives = hero.match(
      /<section class="lesson-objectives" aria-labelledby="학습-목표">([\s\S]*?)<\/section>/,
    )?.[1] ?? "";

    assert.equal(
      (html.match(/<h2 id="학습-목표">학습 목표<\/h2>/g) ?? []).length,
      1,
      lesson.id,
    );
    assert.equal(objectives, renderMarkdown(objectivesMarkdown), lesson.id);
    assert.ok(hero.indexOf("lesson-summary") < hero.indexOf("lesson-objectives"), lesson.id);
    assert.ok(
      hero.indexOf("lesson-objectives") < hero.indexOf("essential-question"),
      lesson.id,
    );
    assert.doesNotMatch(body, /<h2 id="학습-목표">/, lesson.id);

    if (markdown.includes("## 면접 답변 예시")) {
      assert.match(
        body,
        /<section class="lesson-model-answer"[^>]*role="region"[^>]*tabindex="-1"[^>]*aria-labelledby="면접-답변-예시"[^>]* hidden>\s*<h2 id="면접-답변-예시">면접 답변 예시<\/h2>/,
        lesson.id,
      );
      assert.match(
        body,
        /data-toggle-model-answer[^>]*aria-controls="lesson-model-answer"[^>]*aria-describedby="lesson-model-answer-help"[^>]*aria-expanded="false"[^>]*>면접 답변 보기<\/button>/,
        lesson.id,
      );
      const completionButton = html.match(/<button[^>]*data-toggle-complete[^>]*>/)?.[0] ?? "";
      assert.doesNotMatch(completionButton, /aria-(?:controls|expanded)=/, lesson.id);
    } else {
      assert.doesNotMatch(
        body,
        /data-toggle-model-answer|lesson-model-answer-help|id="lesson-model-answer"/,
        lesson.id,
      );
    }

    renderedById.set(lesson.id, { body, hero, html });
  }

  const javascriptLesson = renderedById.get("js-01-runtime");
  assert.match(javascriptLesson.hero, /<code>defer<\/code>/);
  assert.match(javascriptLesson.body.trim(), /^<h2 id="javascript란">JavaScript란\?<\/h2>/);

  const cssLesson = renderedById.get("css-01-cascade-box-model");
  assert.match(cssLesson.body.trim(), /^<h2 id="학습-시간">학습 시간<\/h2>/);

  const algorithmLesson = renderedById.get(
    getLessonsForCourse(curriculum, "algorithm")[0].id,
  );
  assert.match(algorithmLesson.body, /<h2 id="확인-문제">확인 문제<\/h2>/);
  assert.match(algorithmLesson.body, /<h2 id="면접-답변-예시">면접 답변 예시<\/h2>/);
  assert.match(algorithmLesson.html, /id="completion-title"/);
});

test("면접 답변 전용 버튼은 일시적으로 공개·숨기고 재렌더에서 닫힌다", async (t) => {
  const lesson = getLessonsForCourse(curriculum, "algorithm")[0];
  const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
  const questionCount =
    markdown.match(/\n## 확인 문제\n([\s\S]*?)(?=\n##\s|$)/)?.[1].match(/^\d+\./gm)
      ?.length ?? 0;
  const answerCount =
    markdown.match(/\n## 면접 답변 예시\n([\s\S]*?)$/)?.[1].match(/^### 답변 \d+/gm)
      ?.length ?? 0;
  const progress = { completedLessonIds: [] };
  let answerFocusCount = 0;
  let disclosureFocusCount = 0;
  let completionFocusCount = 0;
  let completionSaveCount = 0;
  const messages = [];
  const answerElement = {
    hidden: true,
    focus() {
      answerFocusCount += 1;
    },
  };
  const attributes = new Map([["aria-expanded", "false"]]);
  const disclosureButton = {
    textContent: "면접 답변 보기",
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    focus() {
      disclosureFocusCount += 1;
    },
  };
  const app = createShellHarness();
  Object.assign(app, {
    currentLesson: lesson,
    currentMarkdown: markdown,
    handleWebProjectClick: () => false,
    handleCodingTestClick: () => false,
    handleCodeQuestClick: () => false,
    handleQuizClick: () => false,
    progressRepository: {
      getProgress: () => progress,
      setLessonCompleted(lessonId, completed) {
        assert.equal(lessonId, lesson.id);
        completionSaveCount += 1;
        progress.completedLessonIds = completed ? [lessonId] : [];
      },
    },
    announce(message) {
      messages.push(message);
    },
  });
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector(selector) {
        if (selector === "#lesson-model-answer") return answerElement;
        if (selector === "[data-toggle-complete]") {
          return { focus: () => { completionFocusCount += 1; } };
        }
        return null;
      },
    },
  });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete globalThis.document;
  });
  const disclosureEvent = {
    target: {
      closest(selector) {
        return selector === "[data-toggle-model-answer]" ? disclosureButton : null;
      },
    },
  };
  const completionEvent = {
    target: {
      closest(selector) {
        return selector === "[data-toggle-complete]" ? {} : null;
      },
    },
  };

  app.renderLesson();
  assert.match(app.root.innerHTML, /id="lesson-model-answer"[^>]* hidden>/);
  assert.match(
    app.root.innerHTML,
    /data-toggle-model-answer[^>]*aria-expanded="false"[^>]*>면접 답변 보기<\/button>/,
  );
  assert.match(app.root.innerHTML, /답을 보기 전에 먼저 확인 문제를 자신의 말로 설명해 보세요\./);

  app.handleClick(disclosureEvent);
  assert.equal(answerElement.hidden, false);
  assert.equal(attributes.get("aria-expanded"), "true");
  assert.equal(disclosureButton.textContent, "면접 답변 숨기기");
  assert.equal(answerFocusCount, 1);
  assert.equal(disclosureFocusCount, 0);
  assert.equal(completionSaveCount, 0);
  assert.equal(questionCount, answerCount);
  assert.equal(
    (app.root.innerHTML.match(/<h3 id="답변-\d+">답변 \d+<\/h3>/g) ?? []).length,
    answerCount,
  );

  app.handleClick(disclosureEvent);
  assert.equal(answerElement.hidden, true);
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(disclosureButton.textContent, "면접 답변 보기");
  assert.equal(disclosureFocusCount, 1);
  assert.equal(completionSaveCount, 0);
  assert.deepEqual(messages, []);

  progress.completedLessonIds = [lesson.id];
  app.renderLesson();
  assert.match(app.root.innerHTML, /id="lesson-model-answer"[^>]* hidden>/);
  assert.match(
    app.root.innerHTML,
    /data-toggle-model-answer[^>]*aria-expanded="false"[^>]*>면접 답변 보기<\/button>/,
  );
  const completedButton = app.root.innerHTML.match(
    /<button[^>]*data-toggle-complete[^>]*aria-pressed="true"[^>]*>/,
  )?.[0] ?? "";
  assert.ok(completedButton);
  assert.doesNotMatch(completedButton, /aria-(?:controls|expanded)=/);

  app.handleClick(completionEvent);
  assert.deepEqual(progress.completedLessonIds, []);
  assert.equal(completionSaveCount, 1);
  assert.equal(completionFocusCount, 1);
  assert.deepEqual(messages, ["학습 완료 표시를 해제했습니다."]);
  assert.match(app.root.innerHTML, /id="lesson-model-answer"[^>]* hidden>/);
});

test("알고리즘 교안 셸은 12개 목차만 표시하고 미제공 평가 기능은 숨긴다", () => {
  const app = createShellHarness();
  const lesson = getLessonsForCourse(curriculum, "algorithm")[0];
  app.currentLesson = lesson;
  app.currentMarkdown = `# ${lesson.title}`;

  app.renderLesson();

  assert.match(app.root.innerHTML, /0\/12 완료/);
  assert.equal((app.root.innerHTML.match(/class="lesson-link/g) ?? []).length, 12);
  assert.match(app.root.innerHTML, /href="#\/learn\/algorithm\//);
  assert.doesNotMatch(app.root.innerHTML, /class="review-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="quest-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="coding-test-nav"/);
  assert.doesNotMatch(app.root.innerHTML, /class="web-project-nav"/);
  assert.match(app.root.innerHTML, /class="my-page-nav"/);
});

test("코딩테스트 셸은 JavaScript 정식 과정 7개만 사용하고 Java·마이페이지를 보존한다", () => {
  const app = createShellHarness();
  const progress = { completedLessonIds: [] };
  app.codingTestCollection = { languageId: "javascript", problems: [] };

  app.renderCodingTestShell(
    '<main id="lesson-content" tabindex="-1">코딩테스트</main>',
    progress,
    new Set(),
  );

  const lessonNavigation =
    app.root.innerHTML.match(/<nav class="lesson-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(app.root.innerHTML, /0\/7 완료/);
  assert.equal((lessonNavigation.match(/class="lesson-link/g) ?? []).length, 7);
  assert.doesNotMatch(lessonNavigation, /href="#\/learn\/algorithm\//);
  assert.match(app.root.innerHTML, /class="my-page-nav"/);
  assert.equal(typeof BamLearningApp.prototype.openMyPageRoute, "function");
  assert.equal(supportsCodingTests("java"), true);
});
