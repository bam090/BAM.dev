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

test("JavaScript 교안은 1부터 7까지 순서대로 제공된다", () => {
  const lessons = getLessonsForCourse(curriculum, "javascript");
  assert.equal(lessons.length, 7);
  assert.deepEqual(
    lessons.map((lesson) => lesson.order),
    [1, 2, 3, 4, 5, 6, 7],
  );
  assert.ok(lessons.every((lesson) => lesson.objectives.length === 4));
});

test("교안 공식 자료 섹션은 직접 외부 링크를 2~3개만 제공한다", async () => {
  const officialHeadings = new Set([
    "공식 자료",
    "공식 근거 자료",
    "공식 출처",
    "공식·권위 자료",
  ]);

  for (const lesson of curriculum.lessons) {
    const markdown = await readFile(new URL(`../${lesson.contentFile}`, import.meta.url), "utf8");
    const h2Headings = [...markdown.matchAll(/^## (.+)$/gm)];

    for (const [index, headingMatch] of h2Headings.entries()) {
      const heading = headingMatch[1];
      if (!officialHeadings.has(heading)) continue;

      const sectionStart = headingMatch.index + headingMatch[0].length;
      const sectionEnd = h2Headings[index + 1]?.index ?? markdown.length;
      const section = markdown.slice(sectionStart, sectionEnd);
      const linkCount = [...section.matchAll(/^- \[[^\]\r\n]+\]\(https:\/\/\S+\)$/gm)].length;

      assert.ok(
        linkCount >= 2 && linkCount <= 3,
        `${lesson.id} / ${heading}: 공식 외부 링크 실제 ${linkCount}개`,
      );
    }
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

test("빈 언어와 교안 컬렉션을 런타임과 스키마 검증에서 거부한다", async (t) => {
  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), "bam-empty-curriculum-"));
  t.after(() => rm(fixtureDirectory, { recursive: true, force: true }));
  const validatorPath = fileURLToPath(new URL("../scripts/validate-content.mjs", import.meta.url));

  for (const field of ["languages", "lessons"]) {
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
