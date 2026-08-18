import assert from "node:assert/strict";
import test from "node:test";
import { createWebProjectPreviewDocument } from "../src/ui/web-project-preview.js";

test("HTML과 CSS를 외부 요청 없는 sandbox srcdoc용 문서로 결합한다", () => {
  const preview = createWebProjectPreviewDocument(
    "<!doctype html><main><h1>학습 계획</h1></main>",
    "main > h1 { color: #2563eb; }",
  );

  assert.equal(preview.issue, null);
  assert.match(preview.document, /Content-Security-Policy/);
  assert.match(preview.document, /default-src 'none'/);
  assert.match(preview.document, /style-src data: 'unsafe-inline'/);
  assert.match(preview.document, /navigate-to 'none'/);
  assert.match(preview.document, /data:text\/css;charset=utf-8,main%20%3E%20h1/);
  assert.match(preview.document, /<main><h1>학습 계획<\/h1><\/main>/);
  assert.doesNotMatch(preview.document, /allow-scripts|allow-same-origin/);
  assert.equal(Object.isFrozen(preview), true);
});

test("위험한 HTML이나 CSS는 미리보기에 삽입하지 않고 파일별 원인을 반환한다", () => {
  const htmlFailure = createWebProjectPreviewDocument(
    '<main onclick="fetch(\'https://example.com\')"></main>',
    "main { color: red; }",
  );
  assert.equal(htmlFailure.issue.filePath, "index.html");
  assert.doesNotMatch(htmlFailure.document, /onclick|example\.com/);

  const cssFailure = createWebProjectPreviewDocument(
    "<!doctype html><main></main>",
    "main { background: url(https://example.com/a.png); }",
  );
  assert.equal(cssFailure.issue.filePath, "styles.css");
  assert.doesNotMatch(cssFailure.document, /example\.com/);

  for (const htmlSource of [
    "<style>main { display: grid; }</style><main></main>",
    '<main style="display: grid"></main>',
  ]) {
    const inlineStyleFailure = createWebProjectPreviewDocument(
      htmlSource,
      "main { color: red; }",
    );
    assert.equal(inlineStyleFailure.issue.filePath, "index.html");
    assert.equal(inlineStyleFailure.issue.code, "inline_style");
    assert.doesNotMatch(inlineStyleFailure.document, /display: grid/);
  }

  for (const htmlSource of [
    "<!--><style>main { display: grid; }</style><main></main>",
    '<!-- --!><meta http-equiv="&#114;efresh" content="0;url=https://example.com">',
  ]) {
    const malformedCommentFailure = createWebProjectPreviewDocument(
      htmlSource,
      "main { color: red; }",
    );
    assert.equal(malformedCommentFailure.issue.filePath, "index.html");
    assert.equal(malformedCommentFailure.issue.code, "malformed_comment");
    assert.doesNotMatch(malformedCommentFailure.document, /display: grid|example\.com/);
  }
});

test("한글·따옴표·특수 문자 CSS도 data URL 속성을 탈출하지 않는다", () => {
  const preview = createWebProjectPreviewDocument(
    "<!doctype html><p>안녕</p>",
    'p::before { content: "안녕 & \\"< >"; }',
  );
  assert.equal(preview.issue, null);
  assert.doesNotMatch(preview.document, /href="[^"]*"< /);
  assert.match(preview.document, /%EC%95%88%EB%85%95/);
});
