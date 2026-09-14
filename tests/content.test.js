import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { runInNewContext } from "node:vm";
import {
  assertValidCurriculum,
  getCourse,
  getLessonsForCourse,
  getLessonsForLanguage,
  validateCurriculum,
} from "../src/core/content.js";

const execFileAsync = promisify(execFile);

const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);

test("커리큘럼 메타데이터가 유효하다", () => {
  assert.deepEqual(validateCurriculum(curriculum), []);
  assert.equal(assertValidCurriculum(curriculum), curriculum);
});

test("과정 조회와 실행 언어별 평가 조회를 분리한다", () => {
  const algorithm = getCourse(curriculum, "algorithm");
  const algorithmLessons = getLessonsForCourse(curriculum, algorithm.id);
  const javascriptAssessmentLessons = getLessonsForLanguage(curriculum, "javascript");

  assert.equal(algorithm.languageId, "java");
  assert.equal(algorithmLessons.length, 14);
  assert.ok(algorithmLessons.every((lesson) => lesson.courseId === "algorithm" && lesson.languageId === "java"));
  assert.ok(javascriptAssessmentLessons.length > algorithmLessons.length);
  assert.ok(javascriptAssessmentLessons.every((lesson) => lesson.languageId === "javascript"));
  const archivedHash = javascriptAssessmentLessons.find((lesson) => lesson.id === "js-09-hash-map-set");
  assert.equal(archivedHash.courseId, "javascript");
  assert.equal(archivedHash.order, 40);
  assert.equal(archivedHash.archivedFromCatalog, true);
  assert.deepEqual(archivedHash.conceptIds, ["algo.hashing", "js.map-collection", "js.set-collection"]);
});

test("탐색 가능한 과정의 교안은 과정별로 1부터 순서대로 제공된다", () => {
  for (const course of curriculum.courses.filter((item) => item.status !== "planned")) {
    const lessons = getLessonsForCourse(curriculum, course.id);
    assert.ok(lessons.length > 0, `${course.id}: 교안이 필요합니다.`);
    assert.deepEqual(
      lessons.map((lesson) => lesson.order),
      Array.from({ length: lessons.length }, (_, index) => index + 1),
    );
    assert.ok(lessons.every((lesson) => lesson.objectives.length > 0));
  }
});

test("중복 교안 ID와 끊어진 순서를 거부한다", () => {
  const invalid = structuredClone(curriculum);
  invalid.lessons[1].id = invalid.lessons[0].id;
  invalid.lessons[1].order = 9;
  const errors = validateCurriculum(invalid);
  assert.ok(errors.some((error) => error.includes("교안 ID가 중복")));
  assert.ok(errors.some((error) => error.includes("order는 1부터 연속")));
});

test("원문 반입 출처는 상대경로·전체 해시·실제 날짜·반입 방식을 함께 요구한다", () => {
  const imported = structuredClone(curriculum);
  imported.lessons[0].source = {
    ...imported.lessons[0].source,
    originalPath: "profile/경험/학습/Web 기초/JavaScript/02 함수.md",
    sha256: "a".repeat(64),
    importedAt: "2026-09-09",
    importMode: "copy",
  };
  assert.deepEqual(validateCurriculum(imported), []);

  for (const [field, value] of [
    ["originalPath", "/Users/private/lesson.md"],
    ["originalPath", "profile/../private.md"],
    ["originalPath", "profile/./lesson.md"],
    ["originalPath", "profile/lesson\n.md"],
    ["sha256", "A".repeat(64)],
    ["sha256", "abc"],
    ["importedAt", "2026-02-30"],
    ["importMode", "automatic"],
  ]) {
    const invalid = structuredClone(imported);
    invalid.lessons[0].source[field] = value;
    assert.ok(validateCurriculum(invalid).some((error) => error.includes(`source.${field}`)), `${field}: ${value}`);
  }

  for (const field of ["originalPath", "sha256", "importedAt", "importMode"]) {
    const invalid = structuredClone(imported);
    delete invalid.lessons[0].source[field];
    assert.ok(validateCurriculum(invalid).some((error) => error.includes("모두 필요")), field);
  }
});

test("파생 교안은 승인된 위키 상대 경로와 명시한 답 절을 사용하고 보관 표시는 boolean이다", () => {
  const derived = structuredClone(curriculum);
  Object.assign(derived.lessons[0], {
    archivedFromCatalog: false,
    answerHeading: "핵심 질문 답",
    source: {
      ...derived.lessons[0].source,
      originalPath: "wiki/학습자료/밤데브 학습문서/01 HTML/01 문서 구조와 의미.md",
      sha256: "a".repeat(64), importedAt: "2026-09-13", importMode: "derived",
    },
  });
  assert.deepEqual(validateCurriculum(derived), []);
  for (const value of [
    "wiki/개인 기록/비공개.md", "wiki/학습자료/밤데브 학습문서/../비공개.md",
    "wiki/학습자료/밤데브 학습문서//문서.md", "wiki/학습자료/밤데브 학습문서/문서\\원문.md",
    "wiki/학습자료/밤데브 학습문서/문서\n.md",
  ]) {
    const invalid = structuredClone(derived);
    invalid.lessons[0].source.originalPath = value;
    assert.ok(validateCurriculum(invalid).some((error) => error.includes("source.originalPath")), value);
  }
  for (const [field, value] of [["archivedFromCatalog", "true"], ["answerHeading", " "], ["answerHeading", 1]]) {
    const invalid = structuredClone(derived);
    invalid.lessons[0][field] = value;
    assert.ok(validateCurriculum(invalid).some((error) => error.includes(field)), field);
  }
});

test("파생 교안의 답 절이 없으면 검증 명령이 다른 답변으로 대체하지 않고 거부한다", async (t) => {
  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "bam-derived-answer-"));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));
  for (const answerHeading of [undefined, "존재하지 않는 답 절"]) {
    const invalid = structuredClone(curriculum);
    const lesson = invalid.lessons.find((item) => item.source?.importMode === "derived");
    assert.ok(lesson, "명시적 직접답을 제공하는 파생 교안이 필요합니다.");
    if (answerHeading === undefined) delete lesson.answerHeading;
    else lesson.answerHeading = answerHeading;
    const fixturePath = path.join(fixtureDirectory, answerHeading === undefined ? "missing.json" : "wrong.json");
    await writeFile(fixturePath, JSON.stringify(invalid), "utf8");
    await assert.rejects(execFileAsync(process.execPath, [validatorPath, "--curriculum", fixturePath]), (error) => {
      assert.match(error.stderr, /answerHeading/);
      assert.ok(error.stderr.includes(lesson.id));
      return true;
    });
  }
});

test("빈 taxonomy와 교안 컬렉션을 런타임과 스키마 검증에서 거부한다", async (t) => {
  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "bam-empty-curriculum-"));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));

  for (const field of ["categories", "languages", "courses", "lessons"]) {
    const invalid = structuredClone(curriculum);
    invalid[field] = [];

    assert.ok(
      validateCurriculum(invalid).some((error) => error.includes(field)),
      `${field}: 런타임 검증이 빈 컬렉션을 거부해야 합니다.`,
    );

    const fixturePath = path.join(fixtureDirectory, `${field}.json`);
    await writeFile(fixturePath, JSON.stringify(invalid), "utf8");
    await assert.rejects(
      execFileAsync(process.execPath, [validatorPath, "--curriculum", fixturePath]),
      (error) => {
        assert.match(error.stderr, /커리큘럼 스키마 검증 실패/);
        assert.match(error.stderr, new RegExp(`\\$\\.${field}`));
        return true;
      },
    );
  }
});

test("콘텐츠 검증 명령은 수동 검증에 없는 커리큘럼 스키마 제약도 적용한다", async (t) => {
  const invalid = structuredClone(curriculum);
  invalid.product = "다른 제품";
  invalid.lessons[0].source.verifiedAt = "2026-02-30";

  assert.deepEqual(validateCurriculum(invalid), []);

  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "bam-curriculum-schema-"));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const fixturePath = path.join(fixtureDirectory, "curriculum.json");
  await writeFile(fixturePath, JSON.stringify(invalid), "utf8");

  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));
  await assert.rejects(
    execFileAsync(process.execPath, [validatorPath, "--curriculum", fixturePath]),
    (error) => {
      assert.match(error.stderr, /커리큘럼 스키마 검증 실패/);
      assert.match(error.stderr, /\$\.product/);
      assert.match(error.stderr, /\$\.lessons\[0\]\.source\.verifiedAt/);
      return true;
    },
  );
});

test("원문 복사 해시가 다르면 콘텐츠 검증 명령이 반입본을 거부한다", async (t) => {
  const invalid = structuredClone(curriculum);
  const importedLesson = invalid.lessons.find((lesson) => lesson.source?.importMode === "copy");
  assert.ok(importedLesson, "검증할 반입 복사본이 필요합니다.");
  importedLesson.source.sha256 = "0".repeat(64);
  assert.deepEqual(validateCurriculum(invalid), [], "해시 문자열 형식만으로 본문 일치를 주장할 수 없습니다.");

  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "bam-import-hash-"));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const fixturePath = path.join(fixtureDirectory, "curriculum.json");
  await writeFile(fixturePath, JSON.stringify(invalid), "utf8");
  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));
  await assert.rejects(execFileAsync(process.execPath, [validatorPath, "--curriculum", fixturePath]), (error) => {
    assert.match(error.stderr, /반입 원문 복사본의 SHA-256/);
    assert.ok(error.stderr.includes(importedLesson.id));
    return true;
  });
});

test("DOM 본 교안과 종합 실습은 같은 키보드 접근 가능 목록 흐름을 제공한다", async () => {
  const [markdown, reviewMarkdown] = await Promise.all([
    readFile(
      new URL("../content/lessons/javascript/dom-and-events.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../content/lessons/javascript/review-and-practice.md", import.meta.url),
      "utf8",
    ),
  ]);
  const executionSections = markdown.split("\n## 실행 흐름\n");
  assert.ok(executionSections.length > 1, "DOM 교안의 실행 흐름 섹션을 찾을 수 없습니다.");
  const minimumCodeSections = executionSections[1].split("\n## 최소 코드\n");
  assert.ok(minimumCodeSections.length > 1, "DOM 교안의 최소 코드 섹션을 찾을 수 없습니다.");
  const executionExample = minimumCodeSections[0];

  const reviewPracticeSections = reviewMarkdown.split("\n## 실습 3. DOM과 이벤트\n");
  assert.ok(
    reviewPracticeSections.length > 1,
    "종합 실습의 DOM과 이벤트 섹션을 찾을 수 없습니다.",
  );
  const followingPracticeSections = reviewPracticeSections[1].split(
    "\n## 실습 4. Promise와 `fetch()`\n",
  );
  assert.ok(
    followingPracticeSections.length > 1,
    "종합 실습의 Promise와 fetch 섹션을 찾을 수 없습니다.",
  );
  const reviewPractice = followingPracticeSections[0];

  assert.match(markdown, /<label for="item-input">새 항목<\/label>/);
  assert.match(markdown, /<form id="item-form">/);
  assert.match(markdown, /<button type="submit">추가<\/button>/);
  assert.match(markdown, /data-action="delete"/);
  assert.match(markdown, /aria-label="첫 번째 항목 삭제"/);
  assert.match(markdown, /aria-label="두 번째 항목 삭제"/);
  assert.match(
    executionExample,
    /deleteButton\.setAttribute\("aria-label", `\$\{value\} 삭제`\)/,
  );
  assert.match(markdown, /form\.addEventListener\("submit"/);
  assert.match(markdown, /키보드 활성화/);
  assert.doesNotMatch(executionExample, /event\.target\.matches\("li"\)/);
  assert.match(reviewPractice, /보이는 `<label>`/);
  assert.match(reviewPractice, /`<form>`의 `submit` 흐름/);
  assert.match(reviewPractice, /`<button type="button">` 삭제 버튼/);
  assert.match(reviewPractice, /`aria-label`에는 항목 이름/);
  assert.match(reviewPractice, /event\.target\.closest\(\)/);
  assert.doesNotMatch(reviewPractice, /목록 항목을 클릭하면/);
  assert.doesNotMatch(reviewPractice, /li이면 remove\(\)/);
});

test("종합 실행 예제는 고정된 시각에도 고유 ID를 만들고 선택한 버튼의 항목만 토글한다", async () => {
  const markdown = await readFile(
    new URL("../content/lessons/javascript/review-and-practice.md", import.meta.url),
    "utf8",
  );
  const executionSections = markdown.split("\n## 실행 흐름\n");
  assert.ok(executionSections.length > 1, "종합 실습의 실행 흐름 섹션을 찾을 수 없습니다.");
  const minimumCodeSections = executionSections[1].split("\n## 최소 코드\n");
  assert.ok(minimumCodeSections.length > 1, "종합 실습의 최소 코드 섹션을 찾을 수 없습니다.");
  const executionSection = minimumCodeSections[0];
  const htmlSource = executionSection.match(/```html\n([\s\S]*?)\n```/)?.[1];
  const source = executionSection.match(/```javascript\n([\s\S]*?)\n```/)?.[1];

  assert.ok(htmlSource, "실행 흐름의 HTML 블록을 찾을 수 없습니다.");
  assert.ok(source, "실행 흐름의 JavaScript 블록을 찾을 수 없습니다.");
  assert.doesNotMatch(source, /Date\.now\(\)/);
  assert.doesNotMatch(source, /closest\("li"\)/);

  const labelMarkup = htmlSource.match(/<label\s+([^>]*)>([\s\S]*?)<\/label>/);
  const inputMarkup = htmlSource.match(/<input\s+([^>]*)\/?\s*>/);
  assert.ok(labelMarkup, "실행 예제의 보이는 label을 찾을 수 없습니다.");
  assert.ok(inputMarkup, "실행 예제의 input을 찾을 수 없습니다.");

  const getAttribute = (attributes, name) =>
    attributes.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];

  const listeners = { form: {}, list: {} };
  let dateNowCalls = 0;
  let resetCount = 0;
  let focusCount = 0;

  function createNode(tagName) {
    return {
      tagName: tagName.toUpperCase(),
      dataset: Object.create(null),
      attributes: Object.create(null),
      children: [],
      parentNode: null,
      type: "",
      value: "",
      _textContent: "",
      get textContent() {
        return this._textContent;
      },
      set textContent(value) {
        this._textContent = String(value);
        this.children = [];
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      append(...children) {
        for (const child of children) {
          if (typeof child === "object" && child !== null) child.parentNode = this;
          this.children.push(child);
        }
      },
      closest(selector) {
        if (selector === '[data-action="toggle"]' && this.dataset.action === "toggle") {
          return this;
        }
        return this.parentNode?.closest?.(selector) ?? null;
      },
    };
  }

  function nodeContains(root, target) {
    if (root === target) return true;
    return root.children.some(
      (child) => typeof child === "object" && child !== null && nodeContains(child, target),
    );
  }

  const label = createNode("label");
  const form = createNode("form");
  const input = createNode("input");
  const list = createNode("ul");
  label.htmlFor = getAttribute(labelMarkup[1], "for");
  label.textContent = labelMarkup[2].trim();
  input.id = getAttribute(inputMarkup[1], "id");
  input.name = getAttribute(inputMarkup[1], "name");
  form.titleValue = "";
  form.addEventListener = (type, listener) => {
    listeners.form[type] = listener;
  };
  form.reset = () => {
    resetCount += 1;
    form.titleValue = "";
  };
  input.focus = () => {
    focusCount += 1;
  };
  list.addEventListener = (type, listener) => {
    listeners.list[type] = listener;
  };
  list.contains = (target) => nodeContains(list, target);

  class FormDataStub {
    constructor(target) {
      this.target = target;
    }

    get(name) {
      return name === "title" ? this.target.titleValue : null;
    }
  }

  const context = {
    Date: {
      now() {
        dateNowCalls += 1;
        return 123456789;
      },
    },
    FormData: FormDataStub,
    document: {
      querySelector(selector) {
        return {
          "#todo-form": form,
          "#todo-title": input,
          "#todo-list": list,
          [`label[for="${input.id}"]`]: label,
        }[selector];
      },
      createElement: createNode,
    },
  };

  runInNewContext(`${source}\n;globalThis.__todosForTest = todos;`, context);

  assert.ok(input.id, "실행 예제 input에는 label 연결에 사용할 id가 필요합니다.");
  const visibleLabel = context.document.querySelector(`label[for="${input.id}"]`);
  assert.equal(visibleLabel?.tagName, "LABEL");
  assert.ok(visibleLabel.htmlFor, "실행 예제 label에는 for 연결이 필요합니다.");
  assert.equal(visibleLabel.htmlFor, input.id);
  assert.ok(visibleLabel.textContent.trim().length > 0);

  for (const title of ["첫째", "둘째", "셋째"]) {
    form.titleValue = title;
    listeners.form.submit({
      currentTarget: form,
      preventDefault() {},
    });
  }

  assert.deepEqual(
    Array.from(context.__todosForTest, ({ id }) => id),
    [1, 2, 3],
  );
  assert.equal(new Set(Array.from(context.__todosForTest, ({ id }) => id)).size, 3);
  assert.equal(dateNowCalls, 0);
  assert.equal(resetCount, 3);
  assert.equal(focusCount, 3);

  const renderedButtons = list.children.map((item) =>
    item.children.find(
      (child) => typeof child === "object" && child?.dataset?.action === "toggle",
    ),
  );
  assert.ok(renderedButtons.every((button) => button?.tagName === "BUTTON"));
  assert.ok(renderedButtons.every((button) => button.type === "button"));
  assert.deepEqual(
    renderedButtons.map((button) => button.attributes["aria-label"]),
    ["첫째 완료로 변경", "둘째 완료로 변경", "셋째 완료로 변경"],
  );

  listeners.list.click({ target: renderedButtons[1] });

  assert.deepEqual(
    Array.from(context.__todosForTest, ({ completed }) => completed),
    [false, true, false],
  );
  const rerenderedSecondButton = list.children[1].children.find(
    (child) => typeof child === "object" && child?.dataset?.action === "toggle",
  );
  assert.equal(rerenderedSecondButton.attributes["aria-label"], "둘째 미완료로 변경");
});

test("JSON.stringify 교안은 순환 참조와 BigInt의 TypeError 경계를 설명한다", async () => {
  const markdown = await readFile(
    new URL("../content/lessons/javascript/arrays-objects-built-ins.md", import.meta.url),
    "utf8",
  );
  const jsonSections = markdown.split("\n#### JSON\n");
  assert.ok(jsonSections.length > 1, "배열·객체 교안의 JSON 섹션을 찾을 수 없습니다.");
  const executionSections = jsonSections[1].split("\n## 실행 흐름\n");
  assert.ok(executionSections.length > 1, "배열·객체 교안의 실행 흐름 섹션을 찾을 수 없습니다.");
  const jsonSection = executionSections[0];

  assert.match(jsonSection, /JSON으로 표현 가능한 JavaScript 값/);
  assert.match(jsonSection, /circularData\.self = circularData/);
  assert.match(jsonSection, /JSON\.stringify\(circularData\); \/\/ TypeError/);
  assert.match(jsonSection, /JSON\.stringify\(\{ count: 1n \}\); \/\/ TypeError/);

  const circularData = {};
  circularData.self = circularData;
  assert.throws(() => JSON.stringify(circularData), TypeError);
  assert.throws(() => JSON.stringify({ count: 1n }), TypeError);
});

test("모든 JavaScript 교안의 fetch 실습은 외부 API 대신 로컬 fixture를 사용한다", async () => {
  const javascriptLessons = getLessonsForLanguage(curriculum, "javascript");
  const [markdown, reviewMarkdown, fixtureText, ...lessonMarkdowns] = await Promise.all([
    readFile(
      new URL("../content/lessons/javascript/async-await-fetch.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../content/lessons/javascript/review-and-practice.md", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../content/fixtures/javascript/todos.json", import.meta.url), "utf8"),
    ...javascriptLessons.map(({ contentFile }) =>
      readFile(new URL(`../${contentFile}`, import.meta.url), "utf8"),
    ),
  ]);
  const todos = JSON.parse(fixtureText);

  for (const lessonMarkdown of lessonMarkdowns) {
    assert.doesNotMatch(lessonMarkdown, /jsonplaceholder/i);
  }
  assert.match(markdown, /\.\/content\/fixtures\/javascript\/todos\.json/);
  assert.match(markdown, /인터넷이나 외부 API 없이 연습/);
  assert.match(reviewMarkdown, /GET \.\/content\/fixtures\/javascript\/todos\.json/);
  assert.match(reviewMarkdown, /외부 API나 인터넷 연결 없이/);
  assert.ok(Array.isArray(todos));
  assert.equal(todos.length, 3);
  assert.ok(
    todos.every(
      (todo) =>
        typeof todo.id === "string" &&
        typeof todo.title === "string" &&
        typeof todo.completed === "boolean",
    ),
  );
});
