import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { LocalStorageProgressRepository, MemoryStorage, PROGRESS_STORAGE_KEY } from "../src/repositories/progress-repository.js";
import { renderMarkdown } from "../src/ui/markdown.js";

function createLessonApp(completed, categoryId = "language", {
  source,
  markdown,
  objectives = ["답변 표시를 확인합니다."],
  summary = "이 문서는 질문과 답변의 표시 흐름을 다룹니다.",
  essentialQuestion = "언제 답변을 보여 줄까요?",
  answerHeading,
  progressRepository,
} = {}) {
  const courseId = categoryId === "algorithm" ? "algorithm" : "javascript";
  const lesson = {
    id: "js-01-sample",
    courseId,
    languageId: "javascript",
    order: 1,
    slug: "sample",
    title: "표시 확인",
    summary,
    essentialQuestion,
    ...(answerHeading ? { answerHeading } : {}),
    objectives,
    estimatedMinutes: 5,
    conceptIds: ["js.sample"],
    contentFile: "content/lessons/javascript/sample.md",
    source: source ?? { kind: "bam-authored", verifiedAt: "2026-08-20" },
  };
  const curriculum = {
    schemaVersion: 1,
    categories: [
      {
        id: categoryId,
        name: categoryId === "algorithm" ? "알고리즘" : "언어",
        status: "available",
        description: "표시 확인",
      },
    ],
    courses: [
      {
        id: courseId,
        categoryId,
        languageId: "javascript",
        name: categoryId === "algorithm" ? "알고리즘" : "JavaScript",
        shortName: categoryId === "algorithm" ? "ALGO" : "JS",
        status: "available",
        accent: "javascript",
        description: "표시 확인",
      },
    ],
    languages: [
      {
        id: "javascript",
        name: "JavaScript",
        shortName: "JS",
        status: "available",
        accent: "javascript",
        description: "표시 확인",
      },
    ],
    lessons: [lesson],
  };
  const root = { innerHTML: "" };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    root,
    curriculum,
    currentLesson: lesson,
    currentMarkdown: markdown ?? [
      "# 표시 확인",
      "",
      "## 확인 문제",
      "",
      "1. 답변은 언제 보이나요?",
      "",
      "## 공식 자료",
      "",
      "- 공식 자료",
      "",
      "## 면접 답변 예시",
      "",
      "### 답변 1",
      "",
      "기존에 작성된 답변 예시입니다.",
    ].join("\n"),
    progressRepository: progressRepository ?? {
      getProgress: () => ({
        completedLessonIds: completed ? [lesson.id] : [],
        completedQuestIds: [],
        completedCodingTestProblems: [],
      }),
    },
    codeQuestCollections: new Map([
      ["javascript", { quests: [{ id: "quest-javascript-sample", slug: "sample", order: 1 }] }],
    ]),
    codingTestCollection: {
      languageId: "javascript",
      problems: [{ id: "coding-test-javascript-sample", order: 1 }],
    },
    menuOpen: false,
    getSolvedCodingTestProblemIds: () => new Set(),
    getWebProjectNavigationOptions: () => null,
    renderLessonLink: () => "",
    renderPaginationLink: () => "",
    syncMenuState: () => {},
  });

  return app;
}

function renderLessonPage(...args) {
  const app = createLessonApp(...args);
  app.renderLesson();
  return app.root.innerHTML;
}

test("완료 기록과 무관하게 실제 핵심 질문을 보여 주고 확인 문제 답변은 접힌 상태로 시작한다", () => {
  for (const completed of [false, true]) {
    const html = renderLessonPage(completed);
    const answer = html.match(/<details\b[^>]*id="lesson-answer"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
    const button = html.match(/<button\b[^>]*data-toggle-complete[^>]*>/)?.[0] ?? "";
    assert.match(html, /<h2 id="completion-title">언제 답변을 보여 줄까요\?<\/h2>/);
    assert.match(answer, /<summary[^>]*>답변 예시 확인하기<\/summary>/);
    assert.match(answer, /id="면접-답변-예시"/);
    assert.match(answer, /기존에 작성된 답변 예시입니다\./);
    assert.match(html, /확인 문제의 답변 예시를 펼쳐/);
    assert.doesNotMatch(answer.split(">")[0], /\sopen(?:\s|$)/);
    assert.doesNotMatch(button, /aria-expanded|aria-controls|disabled/);
    assert.ok(button.includes(`aria-pressed="${completed}"`));
    assert.ok(html.indexOf('id="completion-title"') < html.indexOf('id="lesson-answer"'));
    assert.ok(html.indexOf("</details>") < html.indexOf("data-toggle-complete"));
  }
});

test("반입 원문은 학습 완료와 무관하게 읽고 단원 복습 링크를 제공하며 상단 출처를 노출하지 않는다", () => {
  const html = renderLessonPage(false, "language", {
    markdown: "# 원문\n\n함수는 작은 동작입니다.\n\n<script>실행 금지</script>",
    source: {
      originalPath: "profile/학습/<함수>.md",
      sha256: "a".repeat(64),
      importedAt: "2026-09-09",
      importMode: "copy",
    },
  });
  assert.match(html, /함수는 작은 동작입니다/);
  assert.match(html, /href="#\/review\/javascript\/js-01-sample"/);
  assert.doesNotMatch(html, /원문 출처|2026-09-09 수록|밤위키 학습자료에서 가져온 학습문서입니다/);
  assert.doesNotMatch(html, /profile\/|&lt;함수&gt;\.md|SHA-256/);
  assert.doesNotMatch(html, new RegExp("a".repeat(64)));
  assert.match(html, /id="학습-목표"/);
  assert.doesNotMatch(html, /<h2\b[^>]*>학습 목표<\/h2>/);
  assert.match(html, /답변 표시를 확인합니다\./);
  assert.doesNotMatch(html, /<script>|aria-controls="lesson-answer"|id="lesson-answer"/);
  assert.match(html, /<h2 id="completion-title">언제 답변을 보여 줄까요\?<\/h2>/);
  assert.match(html, /data-toggle-complete aria-pressed="false"/);
});

test("실제 반입 교안 3개의 상단 목표·요약과 하단 핵심 정리를 원문 그대로 한 번만 보여 준다", async () => {
  const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
  const expected = [
    ["values", "사람이 말로 적은 요구사항을 JavaScript가 처리할 수 있는 값과 실행 순서로 어떻게 바꾸는지 알아보자.", "들어오는 값, 기억할 상태, 판단할 조건, 내보낼 결과를 차례로 나누면 긴 요구사항도 작은 코드로 옮길 수 있다."],
    ["functions", "여러 번 필요한 계산과 판단을 입력과 결과를 가진 작은 동작으로 어떻게 나누는지 알아보자.", "함수는 값을 받아 한 가지 일을 하고 결과를 돌려주는, 이름 붙인 코드 묶음이다."],
    ["collections", "여러 값의 순서와 한 대상의 이름 있는 정보를 JavaScript에서 어떻게 나누어 담는지 알아보자.", "순서대로 모아야 하면 배열을, 한 대상의 특징을 이름으로 구분해야 하면 객체를 먼저 생각한다."],
  ];
  for (const [slug, goal, summary] of expected) {
    const lesson = curriculum.lessons.find((item) => item.courseId === "javascript-notes" && item.slug === slug);
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    assert.ok(markdown.includes(goal) && markdown.includes(summary), `${slug}: 기대 문장이 실제 원문에 있다.`);
    const html = renderLessonPage(false, "language", { markdown, source: lesson.source, objectives: lesson.objectives, essentialQuestion: lesson.essentialQuestion });
    const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
    const body = html.match(/<article class="lesson-body">([\s\S]*?)<\/article>/)?.[1] ?? "";
    for (const sentence of [goal, ...lesson.objectives]) {
      assert.ok(hero.includes(sentence), `${slug}: 제목 아래 원문과 메타 목표를 함께 보존한다.`);
      assert.equal(html.split(sentence).length - 1, 1, `${slug}: 목표 문장을 중복 표시하지 않는다.`);
      assert.ok(!body.includes(sentence));
      assert.ok(hero.indexOf(sentence) > hero.indexOf("</h1>"));
      assert.ok(hero.indexOf(sentence) < hero.indexOf(summary));
    }
    assert.ok(hero.includes(summary), `${slug}: 제목 아래 목표 다음에 원문 요약을 표시한다.`);
    assert.equal(html.split(summary).length - 1, 1);
    assert.ok(!body.includes(summary));
    assert.equal((html.match(/id="학습-목표"/g) ?? []).length, 1);
    assert.equal((html.match(/id="한줄-요약"/g) ?? []).length, 1);
    assert.doesNotMatch(body, /id="학습-목표"|id="한줄-요약"/);
    assert.doesNotMatch(hero, /오늘의 핵심 질문|원문 출처/);
    assert.doesNotMatch(hero, /<h2\b[^>]*>학습 목표<\/h2>/);
    const core = markdown.match(/(?:^|\n)## 핵심 정리\n[\s\S]*?(?=\n## |$)/)?.[0];
    const answer = html.match(/<details\b[^>]*id="lesson-answer"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
    assert.ok(core, `${slug}: 비교 자료는 기존 핵심 정리에서 가져온다.`);
    assert.ok(answer.includes(renderMarkdown(core, { preserveParagraphLineBreaks: true })));
    assert.match(answer, /<summary[^>]*>핵심 질문 답 확인하기<\/summary>/);
    assert.match(html, /핵심 정리를 펼쳐 자신의 답과 비교/);
    assert.ok(html.includes(`<h2 id="completion-title">${lesson.essentialQuestion}</h2>`));
    assert.equal((html.match(/id="핵심-정리"/g) ?? []).length, 1);
    assert.doesNotMatch(body, /id="핵심-정리"/);
    assert.match(body, /id="밤데브에서-연습할-포인트"/);
    assert.match(body, /id="공식-자료"/);
    assert.doesNotMatch(answer, /id="밤데브에서-연습할-포인트"|id="공식-자료"/);
  }
});

test("선두 목표·요약이 없으면 기존 필드로 능력과 핵심 개념을 나누고 답변은 독립 펼침으로 제공한다", () => {
  const html = renderLessonPage(false);
  const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
  assert.match(hero, /답변 표시를 확인합니다\./);
  assert.match(hero, /한줄 요약/);
  assert.match(hero, /이 문서는 질문과 답변의 표시 흐름을 다룹니다\./);
  assert.ok(hero.indexOf("답변 표시를 확인합니다.") < hero.indexOf("이 문서는 질문과 답변의 표시 흐름을 다룹니다."));
  assert.doesNotMatch(hero, /오늘의 핵심 질문|언제 답변을 보여 줄까요|<h2\b[^>]*>학습 목표<\/h2>/);
  assert.match(html, /<h2 id="completion-title">언제 답변을 보여 줄까요\?<\/h2>/);
  assert.match(html, /<details\b[^>]*id="lesson-answer"/);
  assert.doesNotMatch(html, /aria-controls="lesson-answer"/);
});

test("명시한 직접답만 접어서 보여 주고 원문 출처나 기존 답변 절로 대체하지 않는다", () => {
  const markdown = "# 표시 확인\n\n## 본문\n\n본문 설명입니다.\n\n## 핵심 정리\n\n기존 정리입니다.\n\n## 면접 답변 예시\n\n기존 예시입니다.\n\n## 핵심 질문 답\n\n질문에 직접 답하는 내용입니다.";
  for (const source of [undefined, { originalPath: "wiki/학습자료/밤데브 학습문서/01 HTML/원문.md", importMode: "derived" }]) {
    const html = renderLessonPage(false, "language", { markdown, source, answerHeading: "핵심 질문 답" });
    const body = html.match(/<article class="lesson-body">([\s\S]*?)<\/article>/)?.[1] ?? "";
    const answer = html.match(/<details\b[^>]*id="lesson-answer"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
    assert.match(answer, /질문에 직접 답하는 내용입니다/);
    assert.doesNotMatch(answer, /기존 정리입니다|기존 예시입니다/);
    assert.doesNotMatch(body, /질문에 직접 답하는 내용입니다/);
    assert.match(html, /이 핵심 질문의 답을 펼쳐 자신의 설명과 비교/);
    assert.doesNotMatch(answer.split(">")[0], /\sopen(?:\s|$)/);
    assert.match(html, /data-toggle-complete aria-pressed="false"/);
    const missing = renderLessonPage(false, "language", { markdown, source, answerHeading: "없는 답" });
    assert.doesNotMatch(missing, /id="lesson-answer"/);
  }
});

test("HTML 새 15문서는 각각 직접답과 활성 순서를 사용하고 보관 5문서와 이전다음이 섞이지 않는다", async () => {
  const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
  const htmlLessons = curriculum.lessons.filter((lesson) => lesson.courseId === "html");
  const active = htmlLessons.filter((lesson) => !lesson.archivedFromCatalog);
  const archived = htmlLessons.filter((lesson) => lesson.archivedFromCatalog);
  assert.equal(active.length, 15);
  assert.deepEqual(active.map((lesson) => lesson.order), Array.from({ length: 15 }, (_, index) => index + 6));
  assert.equal(archived.length, 5);
  for (const group of [active, archived]) {
    for (const [index, lesson] of group.entries()) {
      const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
      const app = createLessonApp(false);
      Object.assign(app, { curriculum, currentLesson: lesson, currentMarkdown: markdown, renderPaginationLink: BamLearningApp.prototype.renderPaginationLink });
      app.renderLesson();
      const html = app.root.innerHTML;
      assert.ok(html.includes(`<span>${index + 1}/${group.length}단원</span>`), lesson.id);
      const pagination = html.match(/<nav class="lesson-pagination"[\s\S]*?<\/nav>/)?.[0] ?? "";
      const expected = [group[index - 1], group[index + 1]].filter(Boolean).map((item) => `#/learn/html/${item.slug}`);
      assert.deepEqual([...pagination.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), expected, lesson.id);
      if (lesson.archivedFromCatalog) continue;
      assert.equal(lesson.answerHeading, "핵심 질문 답");
      assert.equal(lesson.source.importMode, "derived");
      assert.equal((markdown.match(/^## 핵심 질문 답$/gm) ?? []).length, 1, lesson.id);
      const directAnswer = markdown.match(/(?:^|\n)## 핵심 질문 답\n([\s\S]*?)(?=\n## |$)/)?.[1].trim();
      assert.ok(directAnswer, lesson.id);
      const answer = html.match(/<details\b[^>]*id="lesson-answer"[^>]*>[\s\S]*?<\/details>/)?.[0] ?? "";
      assert.ok(answer.includes(renderMarkdown(directAnswer, { preserveParagraphLineBreaks: true })), lesson.id);
      assert.doesNotMatch(answer.split(">")[0], /\sopen(?:\s|$)/);
      assert.doesNotMatch(html, /면접 답변 예시|profile\/|wiki\/학습자료/);
      assert.ok(html.includes(`<h2 id="completion-title">${lesson.essentialQuestion}</h2>`), lesson.id);
    }
  }
});

test("없는 목표·요약을 목업 표본이나 핵심 질문으로 지어내지 않는다", () => {
  const html = renderLessonPage(false, "language", { objectives: [], summary: "" });
  const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
  assert.doesNotMatch(hero, /언제 답변을 보여 줄까요|값의 타입을 구분하고|변수는 상태를 기억하며/);
  assert.match(html, /<h2 id="completion-title">언제 답변을 보여 줄까요\?<\/h2>/);
});

test("문서 목차는 실제 h2와 보존된 앵커만 연결하고 코드 안 제목이나 HTML을 실행하지 않는다", () => {
  const markdown = [
    "# 표시 확인", "", "## 학습 목표", "", "목표 원문입니다.", "", "## 한줄 요약", "", "요약 원문입니다.", "",
    "## `값` & <img src=x onerror=bad()>", "", "본문입니다.", "",
    "```markdown", "## 코드 속 가짜 제목", "<h2 id=unsafe>실행하면 안 됩니다.</h2>", "```", "",
    "### 더 작은 제목", "", "설명입니다.", "", "## 면접 답변 예시", "", "### 답변 1", "", "기존 답변입니다.",
  ].join("\n");
  const html = renderLessonPage(false, "language", { markdown });
  const toc = html.match(/<nav\b[^>]*aria-label="이 문서의 목차"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const targets = [...toc.matchAll(/data-lesson-section="([^"]+)"/g)].map((match) => match[1]);
  const headingIds = [...html.matchAll(/<h2\b[^>]*id="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(targets.length >= 4);
  assert.equal(new Set(targets).size, targets.length);
  for (const id of targets) assert.ok(headingIds.includes(id), `${id}: 실제 문서 h2로 이동한다.`);
  for (const id of headingIds) assert.ok(targets.includes(id), `${id}: 실제 h2를 목차에서 찾을 수 있다.`);
  assert.match(toc, /data-lesson-section="한줄-요약"/);
  assert.match(toc, /data-lesson-section="면접-답변-예시"/);
  assert.match(toc, /data-lesson-section="completion-title"/);
  assert.match(toc, /&lt;img/);
  assert.doesNotMatch(toc, /코드 속 가짜 제목|더 작은 제목|<img\b|<h2\b|<code>/);
  assert.match(html, /id="학습-목표"/);
  assert.match(html, /코드 속 가짜 제목/);
  assert.match(html, /<details\b[^>]*id="lesson-answer"/);
});

test("원문 목표가 여러 문단이어도 모두 보존하고 겹치는 메타 목표만 중복 제거한다", () => {
  const first = "첫 번째 목표 문장을 설명합니다.";
  const second = "두 번째 목표 문장을 비교합니다.";
  const extra = "기존 메타 목표의 관찰 지점을 확인합니다.";
  const html = renderLessonPage(false, "language", {
    source: { originalPath: "profile/학습/원문.md" },
    markdown: `# 원문\n\n## 학습 목표\n\n${first}\n\n${second}\n\n## 한줄 요약\n\n원문 요약입니다.\n\n## 본문\n\n설명입니다.`,
    objectives: [first, extra],
  });
  const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
  for (const sentence of [first, second, extra]) {
    assert.ok(hero.includes(sentence), sentence);
    assert.equal(html.split(sentence).length - 1, 1, `${sentence}: 교육 문장은 한 번 보존한다.`);
  }
});

test("목차로 접힌 답 영역을 열어도 진도를 저장하지 않고 해당 절에만 초점을 둔다", (t) => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage);
  const app = createLessonApp(false, "language", { progressRepository: repository });
  const before = storage.getItem(PROGRESS_STORAGE_KEY);
  const answer = { open: false };
  const calls = [];
  const section = {
    closest(selector) { return selector === "details" ? answer : null; },
    setAttribute(name, value) { calls.push([name, value]); },
    focus() { calls.push("focus"); },
    scrollIntoView() { calls.push("scroll"); },
  };
  app.root.contains = (node) => node === section;
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true, value: { getElementById: (id) => id === "면접-답변-예시" ? section : null },
  });
  t.after(() => previous ? Object.defineProperty(globalThis, "document", previous) : delete globalThis.document);
  const click = (id) => app.handleClick({ target: { closest: (selector) => selector === "[data-lesson-section]" ? { dataset: { lessonSection: id } } : null } });
  click("면접-답변-예시");
  assert.equal(answer.open, true);
  assert.deepEqual(calls, [["tabindex", "-1"], "focus", "scroll"]);
  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), before);
  assert.deepEqual(repository.getProgress().completedLessonIds, []);
  click("없는-절");
  assert.equal(calls.length, 3, "없는 절로 임의 이동하거나 다른 영역을 열지 않는다.");
});

test("일반 교안의 원문 목표를 옮길 때 동일한 메타 목표를 다시 덧붙이지 않는다", async () => {
  const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
  const lesson = curriculum.lessons.find((item) => item.id === "js-01-runtime");
  const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
  const html = renderLessonPage(false, "language", { markdown, source: lesson.source, objectives: lesson.objectives });
  const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
  for (const objective of lesson.objectives) {
    assert.ok(markdown.includes(objective));
    assert.ok(hero.includes(objective));
    assert.equal(html.split(objective).length - 1, 1);
  }
  assert.equal((html.match(/id="학습-목표"/g) ?? []).length, 1);
  assert.match(html, /id="1-html-css-javascript가-하는-일"/);
  assert.match(html, /<details\b[^>]*id="lesson-answer"/);
});

test("상단으로 옮긴 원문 목표·요약과 메타 목표의 HTML을 실행하지 않는다", () => {
  const html = renderLessonPage(false, "language", {
    markdown: "# 원문\n\n## 학습 목표\n\n<script>목표</script>\n\n## 한줄 요약\n\n<img src=x onerror=alert(1)>\n\n## 본문\n\n설명입니다.",
    source: { originalPath: "profile/학습/원문.md" },
    objectives: ["<svg onload=alert(1)>"],
    essentialQuestion: "<img src=x onerror=alert(1)>도 질문인가요?",
  });
  const hero = html.match(/<header class="lesson-hero">([\s\S]*?)<\/header>/)?.[1] ?? "";
  assert.match(hero, /&lt;script&gt;목표&lt;\/script&gt;/);
  assert.match(hero, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(hero, /&lt;svg onload=alert\(1\)&gt;/);
  assert.match(html, /<h2 id="completion-title">&lt;img src=x onerror=alert\(1\)&gt;도 질문인가요\?<\/h2>/);
  assert.doesNotMatch(html, /<script>|<img\b|<svg\b/);
});

test("알고리즘 과정 교안에서는 평가 기능 링크를 표시하지 않는다", () => {
  const html = renderLessonPage(false, "algorithm");

  assert.doesNotMatch(html, /class="review-nav"/);
  assert.doesNotMatch(html, /class="quest-nav"/);
  assert.doesNotMatch(html, /class="coding-test-nav"/);
});

test("답변 열람은 저장하지 않고 완료·해제는 현재 펼침과 초점을 보존하며 재진입은 접힌다", (t) => {
  const lessonId = "js-01-sample";
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage);
  const app = createLessonApp(false, "language", { progressRepository: repository });
  const announcements = [];
  let markup = "";
  let answer = null;
  let focusCount = 0;
  Object.defineProperty(app.root, "innerHTML", {
    get: () => markup,
    set: (value) => {
      markup = value;
      const tag = value.match(/<details\b[^>]*id="lesson-answer"[^>]*>/)?.[0];
      answer = tag ? { open: /\sopen(?:\s|>)/.test(tag) } : null;
    },
  });
  app.root.querySelector = (selector) => selector === "#lesson-answer" ? answer : null;
  Object.assign(app, {
    handleWebProjectClick: () => false,
    handleCodingTestClick: () => false,
    handleCodeQuestClick: () => false,
    handleQuizClick: () => false,
    announce: (message) => announcements.push(message),
  });
  const originalDocument = globalThis.document;
  globalThis.document = {
    querySelector: (selector) => selector === "[data-toggle-complete]"
      ? { focus: () => { focusCount += 1; } }
      : null,
  };
  t.after(() => {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  });
  const clickComplete = () => app.handleClick({ target: {
    closest: (selector) => selector === "[data-toggle-complete]" ? {} : null,
  } });

  app.renderLesson();
  assert.equal(answer.open, false);
  clickComplete();
  assert.deepEqual(repository.getProgress().completedLessonIds, [lessonId]);
  assert.equal(answer.open, false, "읽기 전에 완료해도 답을 자동으로 열지 않는다.");
  assert.match(markup, /data-toggle-complete aria-pressed="true"/);

  const saved = storage.getItem(PROGRESS_STORAGE_KEY);
  const beforeRead = answer;
  answer.open = true; // 네이티브 details 토글 뒤 앱에 전달되는 click은 진도 동작이 아니다.
  app.handleClick({ target: { closest: () => null } });
  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), saved);
  assert.equal(answer, beforeRead, "열람 click으로 문서를 다시 렌더링하지 않는다.");
  clickComplete();
  assert.deepEqual(repository.getProgress().completedLessonIds, []);
  assert.equal(answer.open, true);
  assert.match(markup, /data-toggle-complete aria-pressed="false"/);
  clickComplete();
  assert.deepEqual(repository.getProgress().completedLessonIds, [lessonId]);
  assert.equal(answer.open, true);
  assert.equal(focusCount, 3);
  assert.deepEqual(announcements, [
    "학습을 완료로 표시했습니다.",
    "학습 완료 표시를 해제했습니다.",
    "학습을 완료로 표시했습니다.",
  ]);

  const restored = renderLessonPage(false, "language", { progressRepository: new LocalStorageProgressRepository(storage) });
  assert.match(restored, /data-toggle-complete aria-pressed="true"/);
  assert.doesNotMatch(restored.match(/<details\b[^>]*id="lesson-answer"[^>]*>/)?.[0] ?? "", /\sopen(?:\s|>)/);
});

test("완료 저장 실패는 기존 기록·화면·펼침을 유지하고 성공으로 알리지 않는다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage);
  repository.setLessonCompleted("js-01-sample", true);
  const saved = storage.getItem(PROGRESS_STORAGE_KEY);
  const app = createLessonApp(true, "language", { progressRepository: repository });
  const answer = { open: true };
  const announcements = [];
  Object.assign(app, {
    handleWebProjectClick: () => false,
    handleCodingTestClick: () => false,
    handleCodeQuestClick: () => false,
    handleQuizClick: () => false,
    announce: (message) => announcements.push(message),
  });
  app.root.querySelector = () => answer;
  app.renderLesson({ answerOpen: true });
  const markup = app.root.innerHTML;
  storage.setItem = () => { throw new Error("저장 공간 부족"); };
  app.handleClick({ target: {
    closest: (selector) => selector === "[data-toggle-complete]" ? {} : null,
  } });
  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), saved);
  assert.equal(app.root.innerHTML, markup);
  assert.equal(answer.open, true);
  assert.deepEqual(announcements, ["진도를 저장하지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요."]);
});

test("기존 작성 형식 교안의 확인 문제와 면접 답변 예시가 번호대로 일치한다", async () => {
  const curriculum = JSON.parse(
    await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
  );

  for (const lesson of curriculum.lessons.filter((item) => !item.source?.originalPath)) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const confirmation = markdown.match(
      /\n## (?:최종 )?확인 문제\n([\s\S]*?)(?=\n## |$)/,
    );
    const answerSections = markdown.split("\n## 면접 답변 예시\n");

    assert.ok(confirmation, `${lesson.id}: 확인 문제 섹션이 필요합니다.`);
    assert.equal(answerSections.length, 2, `${lesson.id}: 답변 예시 섹션이 하나여야 합니다.`);

    const questionNumbers = [...confirmation[1].matchAll(/^(\d+)\.\s+.+$/gm)].map(
      (match) => Number(match[1]),
    );
    const answerNumbers = [...answerSections[1].matchAll(/^### 답변 (\d+)\s*$/gm)].map(
      (match) => Number(match[1]),
    );
    const expectedNumbers = questionNumbers.map((_, index) => index + 1);

    assert.deepEqual(questionNumbers, expectedNumbers, `${lesson.id}: 질문 번호가 연속이어야 합니다.`);
    assert.deepEqual(answerNumbers, questionNumbers, `${lesson.id}: 질문과 답변 번호가 다릅니다.`);
  }
});
