import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml, renderMarkdown } from "../src/ui/markdown.js";

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
  assert.ok(result.includes("1 &lt; 2"));
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
