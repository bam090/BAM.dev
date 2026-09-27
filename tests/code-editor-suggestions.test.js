import assert from "node:assert/strict";
import test from "node:test";

import { getCodeEditorSuggestions } from "../src/ui/code-editor-assist.js";

test("두 글자 접두사는 현재 소스의 식별자를 중복 없이 최대 8개만 제시한다", () => {
  const identifiers = Array.from({ length: 12 }, (_, index) => `formatItem${index}`);
  const source = `${identifiers.join(" ")} formatItem0 fo`;
  const suggestions = getCodeEditorSuggestions(source, source.length, "javascript");
  assert.ok(suggestions.includes("formatItem0"));
  assert.equal(new Set(suggestions).size, suggestions.length);
  assert.ok(suggestions.length <= 8);
  assert.ok(suggestions.every((item) => item.startsWith("fo")));
  assert.deepEqual(getCodeEditorSuggestions(source + "f", source.length + 1, "javascript"), []);
});

test("명시적 요청은 빈 접두사에서도 언어 키워드를 제시하고 외부 답안은 섞지 않는다", () => {
  const source = "localValue = 1;\n";
  const suggestions = getCodeEditorSuggestions(source, source.length, "javascript", { explicit: true });
  assert.ok(suggestions.includes("localValue"));
  assert.ok(suggestions.some((item) => ["const", "function", "return", "if", "for"].includes(item)));
  assert.ok(!suggestions.includes("secretAnswerFromAnotherProblem"));
  assert.ok(suggestions.length <= 8);
});
