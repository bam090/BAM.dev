import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { escapeHtml, renderMarkdown } from "../src/ui/markdown.js";

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
  assert.match(result, /<pre tabindex="0" aria-label="html 코드 예제">/);
  assert.equal((result.match(/class="code-line"/g) ?? []).length, 6);
  assert.equal(originalCodeFrom(result), source);
  assert.doesNotMatch(result, /<!doctype html>|<html lang=|<script src=/);
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

test("코드 스포트라이트는 키보드 포커스·가로 스크롤·reduced-motion을 보존한다", async () => {
  const css = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");

  assert.match(css, /\.code-card pre\s*\{[^}]*overflow:\s*auto/s);
  assert.match(css, /\.code-card pre:focus-visible\s*\{/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.code-card \.code-line:hover/);
  assert.match(css, /\.code-card code:hover \.code-line:not\(:hover\)\s*\{[^}]*opacity:\s*0\.75/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.code-line\s*\{[^}]*transition:\s*none/s);
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
