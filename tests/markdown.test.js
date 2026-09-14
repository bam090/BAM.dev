import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { escapeHtml, renderInlineCodeText, renderMarkdown, splitLessonOverview, splitMarkdownSection } from "../src/ui/markdown.js";

function originalCodeFrom(result) {
  const encodedSource = result.match(/data-code-source="([^"]*)"/)?.[1];
  assert.notEqual(encodedSource, undefined);
  return decodeURIComponent(encodedSource);
}

function copyCodeFromElement(codeElement) {
  const copyButton = {
    closest(selector) {
      assert.equal(selector, ".code-card");
      return {
        querySelector(codeSelector) {
          assert.equal(codeSelector, "code");
          return codeElement;
        },
      };
    },
  };
  let copiedCode = null;
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    currentLesson: null,
    handleCodingTestClick: () => false,
    handleCodeQuestClick: () => false,
    handleQuizClick: () => false,
    copyCode(button, code) {
      assert.equal(button, copyButton);
      copiedCode = code;
    },
  });
  const target = {
    closest(selector) {
      return selector === "[data-copy-code]" ? copyButton : null;
    },
  };

  app.handleClick({ target });
  return copiedCode;
}

test("원시 HTML을 실행 가능한 마크업으로 통과시키지 않는다", () => {
  const result = renderMarkdown("<script>alert('xss')</script>");
  assert.ok(result.includes("&lt;script&gt;"));
  assert.ok(!result.includes("<script>"));
  assert.equal(escapeHtml('a & <b> "c"'), "a &amp; &lt;b&gt; &quot;c&quot;");
});

test("교안의 로컬 PNG는 문단과 분리하고 대체 텍스트를 안전하게 표시한다", () => {
  const result = renderMarkdown('앞 문단\n![순서 <값> & "다음"](content/assets/algorithm/stack-lifo.png)\n뒤 문단');
  assert.equal((result.match(/<img\b/g) ?? []).length, 1);
  assert.match(result, /src="content\/assets\/algorithm\/stack-lifo\.png"/);
  assert.match(result, /alt="순서 &lt;값&gt; &amp; &quot;다음&quot;"/);
  assert.match(result, /<p>앞 문단<\/p>\s*<figure\b/);
  assert.match(result, /<\/figure>\s*<p>뒤 문단<\/p>/);
  assert.doesNotMatch(result, /<값>/);
});

test("교안 이미지의 외부·절대·우회 경로와 코드 안 이미지 문법을 실행하지 않는다", () => {
  for (const source of [
    "https://example.com/image.png", "//example.com/image.png", "data:image/png;base64,AAAA",
    "/content/assets/image.png", "/Users/private/image.png", "content/assets/../private.png",
    "content/assets/%2e%2e/private.png", "content/assets/%252e%252e/private.png",
    "content/assets/algorithm\\image.png", "content/assets/algorithm%5cimage.png",
    "content/assets/image.png?download=1", "content/assets/image.png#fragment", "content/assets/image.svg",
  ]) {
    assert.doesNotMatch(renderMarkdown(`![그림](${source})`), /<img\b/, source);
  }
  const source = "![스택](content/assets/algorithm/stack-lifo.png)";
  const result = renderMarkdown(`\`\`\`markdown\n${source}\n\`\`\``);
  assert.doesNotMatch(result, /<img\b/);
  assert.equal(originalCodeFrom(result), source);
});

test("함수 원문의 백틱 문자 설명과 이어지는 템플릿 변수는 각각 별도 코드로 읽힌다", () => {
  const source = "백틱 `` ` ``으로 감싼 문자열 안의 `${name}`은 `name` 값을 그 자리에 넣는다.";
  const expected = "백틱 <code>`</code>으로 감싼 문자열 안의 <code>${name}</code>은 <code>name</code> 값을 그 자리에 넣는다.";
  assert.equal(renderMarkdown(source), `<p>${expected}</p>`);
  assert.equal(renderInlineCodeText(source), expected);
});

test("같은 길이 백틱으로 감싼 내부 태그는 escape하고 미종료 코드는 원문으로 보존한다", () => {
  for (const [source, expected] of [
    ["`` `<tag>` ``", "<code>`&lt;tag&gt;`</code>"],
    ["앞 ``닫히지 않음` <img>", "앞 ``닫히지 않음` &lt;img&gt;"],
    ["`   `", "<code>   </code>"],
    ["`  x  `", "<code> x </code>"],
  ]) {
    assert.equal(renderMarkdown(source), `<p>${expected}</p>`);
    assert.equal(renderInlineCodeText(source), expected);
  }
});

test("제목, 목록, 표, 코드 블록을 제한된 HTML로 변환한다", () => {
  const markdown = [
    "# 제목",
    "",
    "## 목표",
    "",
    "- 첫째",
    "- 둘째",
    "",
    "| 이름 | 값 |",
    "| --- | --- |",
    "| const | 1 |",
    "",
    "```javascript",
    "const value = 1 < 2;",
    "```",
  ].join("\n");
  const result = renderMarkdown(markdown, { skipFirstHeading: true });
  assert.ok(!result.includes("<h1"));
  assert.ok(result.includes("<h2"));
  assert.ok(result.includes("<ul>"));
  assert.ok(result.includes("<table>"));
  assert.ok(result.includes("data-copy-code"));
  assert.ok(result.includes("code-token--keyword"));
  assert.ok(result.includes("&lt;"));
  assert.equal(originalCodeFrom(result), "const value = 1 < 2;");
});

test("일반 문단에서 문장별 소스 줄바꿈을 화면 줄바꿈으로 보존한다", () => {
  const markdown =
    "처음부터 이 모든 기능을 만들 필요는 없습니다.\nJavaScript의 기본 문법과 브라우저 도구를 조합하면 됩니다.";
  const result = renderMarkdown(
    markdown,
    { preserveParagraphLineBreaks: true },
  );

  assert.equal(
    result,
    "<p>처음부터 이 모든 기능을 만들 필요는 없습니다.<br>JavaScript의 기본 문법과 브라우저 도구를 조합하면 됩니다.</p>",
  );
  assert.equal(
    renderMarkdown(markdown),
    "<p>처음부터 이 모든 기능을 만들 필요는 없습니다. JavaScript의 기본 문법과 브라우저 도구를 조합하면 됩니다.</p>",
  );
});

test("선두 목표·요약만 분리하고 문장별 줄바꿈과 나머지 개념 제목을 보존한다", () => {
  const markdown = "# 교안\n\n## 학습 목표\n\n첫째 문장.\n둘째 문장.\n\n## 한줄 요약\n\n`값`의 흐름을 읽는다.\n\n## 변수\n\n값을 기억한다.\n\n## 한줄 요약\n\n후반 요약은 본문이다.";
  const { body, objectives, summary } = splitLessonOverview(markdown);
  assert.equal(objectives.trim(), "첫째 문장.\n둘째 문장.");
  assert.equal(summary.trim(), "`값`의 흐름을 읽는다.");
  assert.ok(!body.includes("첫째 문장.") && !body.includes("`값`의 흐름을 읽는다."));
  assert.match(body, /## 변수\n\n값을 기억한다\./);
  assert.match(body, /## 한줄 요약\n\n후반 요약은 본문이다\./);
  assert.match(renderMarkdown(body, { skipFirstHeading: true }), /<h2 id="변수">변수<\/h2>/);
});

test("선두 소개나 코드 안의 같은 제목을 목표·요약 섹션으로 오인하지 않는다", () => {
  const unrecognized = [
    "# 교안\n\n소개를 먼저 읽는다.\n\n## 학습 목표\n\n뒤의 목표.",
    "# 교안\n\n```text\n## 학습 목표\n코드 안의 제목\n```\n\n## 한줄 요약\n후반 요약.",
    "# 교안\n\n## 다른 개념\n\n설명.\n\n## 학습 목표\n\n뒤의 목표.",
  ];
  for (const markdown of unrecognized) {
    const result = splitLessonOverview(markdown);
    assert.equal(result.objectives, "");
    assert.equal(result.summary, "");
    assert.equal(result.body, markdown);
  }
  const fencedGoal = "# 교안\n\n## 학습 목표\n\n```text\n## 한줄 요약\n코드 안의 내용\n```\n\n목표의 끝.\n\n## 한줄 요약\n\n실제 요약.\n\n## 본문\n\n설명.";
  const result = splitLessonOverview(fencedGoal);
  assert.match(result.objectives, /```text\n## 한줄 요약\n코드 안의 내용\n```/);
  assert.match(result.objectives, /목표의 끝\./);
  assert.equal(result.summary.trim(), "실제 요약.");
  assert.match(result.body, /## 본문\n\n설명\./);
});

test("답변 절을 옮길 때 코드 안 제목을 건너뛰고 원문·하위 제목·다음 절을 보존한다", () => {
  for (const title of ["핵심 정리", "면접 답변 예시"]) {
    const before = `# 교안\n\n\`\`\`text\n## ${title}\n코드 안의 제목\n\`\`\`\n\n`;
    const section = `## ${title}\n\n첫 문장.\n둘째 문장.\n\n### 답변 1\n\n\`\`\`text\n## 공식 자료\n코드 안의 절 경계\n\`\`\`\n\n답변의 끝.`;
    const after = "\n\n## 공식 자료\n\n남길 내용.\n";
    const result = splitMarkdownSection(before + section + after, title);
    assert.equal(result.section, section);
    assert.match(result.body, /코드 안의 제목/);
    assert.match(result.body, /## 공식 자료\n\n남길 내용\./);
    assert.doesNotMatch(result.body, /첫 문장|답변의 끝/);
    assert.equal((result.body.match(new RegExp(`## ${title}`, "g")) ?? []).length, 1);
  }
});

test("정확한 답변 절이 없거나 비어 있으면 본문을 그대로 유지하고 빈 답변을 만들지 않는다", () => {
  for (const markdown of [
    "# 교안\r\n\r\n## 핵심 정리 보충\r\n\r\n본문.",
    "# 교안\n\n```text\n## 핵심 정리\n코드 안의 내용\n```",
    "# 교안\n\n## 핵심 정리\n\n## 공식 자료\n\n남길 내용.",
  ]) {
    assert.deepEqual(splitMarkdownSection(markdown, "핵심 정리"), { body: markdown, section: "" });
  }
});

test("HTML 코드 블록은 태그·속성·문자열을 안전하게 강조한다", () => {
  const source = [
    "<!doctype html>",
    '<html lang="ko">',
    "  <head>",
    '    <script src="./main.js" defer></script>',
    "  </head>",
    "</html>",
  ].join("\n");
  const result = renderMarkdown(["```html", source, "```"].join("\n"));

  assert.match(result, /code-token--keyword[^>]*>&lt;!doctype html&gt;/);
  assert.match(result, /code-token--tag[^>]*>html</);
  assert.match(result, /code-token--property[^>]*>lang</);
  assert.match(result, /code-token--string[^>]*>&quot;ko&quot;</);
  assert.match(result, /<pre class="syntax-code" tabindex="0" aria-label="html 코드 예제">/);
  assert.equal((result.match(/class="code-line"/g) ?? []).length, 6);
  assert.equal(originalCodeFrom(result), source);
  assert.doesNotMatch(result, /<!doctype html>|<html lang=|<script src=/);
});

test("HTML의 script와 style 본문도 각각 JavaScript와 CSS로 강조한다", () => {
  const source = [
    "<script>",
    '  const button = document.querySelector("button"); // 아직 button이 없음',
    '  const markup = "<img src=x onerror=alert(1)>";',
    "</script>",
    "<style>",
    "  .notice:hover { color: #a7f3d0; }",
    "</style>",
    "<button>확인</button>",
  ].join("\n");
  const result = renderMarkdown(["```html", source, "```"].join("\n"));

  assert.match(result, /code-token--keyword[^>]*>const</);
  assert.match(result, /code-token--builtin[^>]*>document</);
  assert.match(result, /code-token--function[^>]*>querySelector</);
  assert.match(result, /code-token--string[^>]*>&quot;button&quot;</);
  assert.match(result, /code-token--comment[^>]*>\/\/ 아직 button이 없음</);
  assert.match(result, /code-token--selector[^>]*>\.notice:hover</);
  assert.match(result, /code-token--property[^>]*>color</);
  assert.match(result, /code-token--number[^>]*>#a7f3d0</);
  assert.match(result, /code-token--tag[^>]*>button</);
  assert.doesNotMatch(result, /<img\b/);
  assert.equal(originalCodeFrom(result), source);
});

test("JavaScript와 CSS 코드 블록은 주요 토큰을 구분한다", () => {
  const javascript = [
    "```javascript",
    'const message = "안녕하세요"; // 인사',
    "console.log(message);",
    "```",
  ].join("\n");
  const css = [
    "```css",
    ".card:hover {",
    "  color: #a7f3d0;",
    "  width: 100%;",
    "}",
    "```",
  ].join("\n");

  const javascriptResult = renderMarkdown(javascript);
  assert.match(javascriptResult, /code-token--keyword[^>]*>const</);
  assert.match(javascriptResult, /code-token--string[^>]*>&quot;안녕하세요&quot;</);
  assert.match(javascriptResult, /code-token--comment[^>]*>\/\/ 인사</);
  assert.match(javascriptResult, /code-token--builtin[^>]*>console</);
  assert.equal(
    originalCodeFrom(javascriptResult),
    'const message = "안녕하세요"; // 인사\nconsole.log(message);',
  );

  const cssResult = renderMarkdown(css);
  assert.match(cssResult, /code-token--selector[^>]*>\.card:hover</);
  assert.match(cssResult, /code-token--property[^>]*>color</);
  assert.match(cssResult, /code-token--number[^>]*>#a7f3d0</);
  assert.match(cssResult, /code-token--number[^>]*>100%</);
  assert.equal(originalCodeFrom(cssResult), ".card:hover {\n  color: #a7f3d0;\n  width: 100%;\n}");
});

test("알 수 없는 언어는 원문을 이스케이프하고 토큰 색상을 만들지 않는다", () => {
  const source = '<script>alert("xss")</script>\n</span><img src=x onerror=alert(1)>';
  const result = renderMarkdown(["```mystery", source, "```"].join("\n"));

  assert.match(result, /class="language-mystery"/);
  assert.match(result, /&lt;script&gt;alert\(&quot;xss&quot;\)&lt;\/script&gt;/);
  assert.match(result, /&lt;\/span&gt;&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(result, /class="code-token/);
  assert.doesNotMatch(result, /<script>|<img\b/);
  assert.equal(originalCodeFrom(result), source);
});

test("고립 surrogate가 있어도 코드 블록 렌더링을 중단하지 않고 원문 속성을 생략한다", () => {
  const isolatedSurrogate = String.fromCharCode(0xd800);
  const source = `const broken = "${isolatedSurrogate}";`;
  let result = "";

  assert.doesNotThrow(() => {
    result = renderMarkdown(["```javascript", source, "```"].join("\n"));
  });
  assert.match(result, /class="language-javascript"/);
  assert.match(result, /class="code-line"/);
  assert.doesNotMatch(result, /data-code-source=/);
  assert.equal(copyCodeFromElement({ dataset: {}, textContent: source }), source);
});

test("작은따옴표·퍼센트·이모지·빈 줄을 포함한 복사 원문을 정확히 보존한다", () => {
  const source = ["const label = '진행률 100% 😀';", "", "console.log(label);"].join("\n");
  const result = renderMarkdown(["```javascript", source, "```"].join("\n"));
  const encodedSource = result.match(/data-code-source="([^"]*)"/)?.[1];

  assert.match(encodedSource, /%27/);
  assert.match(encodedSource, /100%25/);
  assert.match(encodedSource, /%F0%9F%98%80/);
  assert.match(encodedSource, /%0A%0A/);
  assert.equal(originalCodeFrom(result), source);
  assert.equal(copyCodeFromElement({ dataset: { codeSource: encodedSource }, textContent: "장식" }), source);
});

test("복사 버튼은 장식된 코드 DOM이 아니라 별도로 보존한 원문을 사용한다", () => {
  const source = '<button aria-label="저장">저장</button>\n// 원본';
  assert.equal(
    copyCodeFromElement({
      dataset: { codeSource: encodeURIComponent(source) },
      textContent: "장식된 화면 문자열",
    }),
    source,
  );
});

test("Code Quest 강조 레이어는 입력 원문을 이스케이프하고 양축 스크롤을 동기화한다", () => {
  const viewport = { scrollTop: 0, scrollLeft: 0 };
  const highlight = {
    innerHTML: "",
    closest(selector) {
      assert.equal(selector, ".quest-source-highlight");
      return viewport;
    },
  };
  const source = '</code><script>alert("x")</script>\nconst answer = 42;';
  const editor = { value: source, scrollTop: 88, scrollLeft: 31 };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    codeQuestCollection: { languageId: "javascript" },
    root: {
      querySelector(selector) {
        if (selector === "[data-quest-source]") return editor;
        if (selector === "[data-quest-source-highlight]") return highlight;
        return null;
      },
    },
  });

  app.syncCodeQuestEditorHighlight(editor);

  assert.match(highlight.innerHTML, /&lt;\//);
  assert.match(highlight.innerHTML, /code/);
  assert.doesNotMatch(highlight.innerHTML, /<script>/);
  assert.match(highlight.innerHTML, /code-token--keyword[^>]*>const</);
  assert.equal(viewport.scrollTop, 88);
  assert.equal(viewport.scrollLeft, 31);
});

test("코드 스포트라이트는 키보드 포커스·가로 스크롤·reduced-motion을 보존한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");

  assert.match(css, /\.code-card pre\s*\{[^}]*overflow:\s*auto/s);
  assert.match(css, /\.syntax-code:focus-visible\s*\{/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.syntax-code \.code-line:hover/);
  const dimmedRule = css.match(/\.syntax-code code:hover \.code-line:not\(:hover\)\s*\{([^}]*)\}/)?.[1] ?? "";
  const opacity = Number(dimmedRule.match(/opacity:\s*([\d.]+)\s*;/)?.[1]);
  assert.ok(opacity >= 0.85 && opacity <= 1, "강조하지 않은 코드도 검증된 읽힘 하한을 유지해야 합니다.");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.code-line\s*\{[^}]*transition:\s*none/s);
});

test("Quest 편집기 강조는 입력을 가리지 않고 모바일·고대비 모드를 보존한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
  const shellRule = css.match(/\.quest-editor-shell\s*\{([^}]*)\}/)?.[1] ?? "";
  const highlightRule = css.match(/\.quest-source-highlight\s*\{([^}]*)\}/)?.[1] ?? "";
  const editorRule = css.match(/#quest-source\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(shellRule, /position:\s*relative/);
  assert.match(shellRule, /min-width:\s*0/);
  assert.match(highlightRule, /position:\s*absolute/);
  assert.match(highlightRule, /pointer-events:\s*none/);
  assert.match(highlightRule, /overflow:\s*hidden/);
  assert.match(editorRule, /color:\s*transparent/);
  assert.match(editorRule, /-webkit-text-fill-color:\s*transparent/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?#quest-source,[\s\S]*?\.quest-source-highlight\s*\{[^}]*padding:\s*13px/s);
  assert.match(css, /@media \(forced-colors: active\)[\s\S]*?\.quest-source-highlight\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media \(forced-colors: active\)[\s\S]*?#quest-source\s*\{[^}]*color:\s*CanvasText/s);
});

test("javascript URL은 링크로 허용하지 않는다", () => {
  const result = renderMarkdown("[위험](javascript:alert(1))");
  assert.ok(result.includes('href="#"'));
  assert.ok(!result.includes("href=\"javascript:"));
});

test("표의 코드 span과 이스케이프된 파이프를 열 구분자로 해석하지 않는다", () => {
  const markdown = [
    "| 종류 | 예 | 설명 |",
    "| --- | --- | --- |",
    "| 논리 | `&&`, `||`, `!` | 조건 조합 또는 반전 |",
    String.raw`| 문자 | 왼쪽 \| 오른쪽 | 파이프 문자 |`,
  ].join("\n");

  const result = renderMarkdown(markdown);

  assert.equal(result.match(/<th scope="col">/g)?.length, 3);
  assert.equal(result.match(/<td>/g)?.length, 6);
  assert.ok(result.includes("<code>||</code>"));
  assert.ok(result.includes("왼쪽 | 오른쪽"));
  assert.ok(!result.includes(String.raw`왼쪽 \| 오른쪽`));
});
