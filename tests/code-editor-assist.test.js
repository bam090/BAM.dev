import assert from "node:assert/strict";
import test from "node:test";

import {
  attachCodeEditorAssist,
  insertCodeEditorText,
  isCodeEditorComposing,
} from "../src/ui/code-editor-assist.js";

function editorFixture(source) {
  const events = (node) => {
    const handlers = new Map();
    return Object.assign(node, {
      addEventListener(type, handler) { handlers.set(type, [...(handlers.get(type) ?? []), handler]); },
      removeEventListener(type, handler) { handlers.set(type, (handlers.get(type) ?? []).filter((item) => item !== handler)); },
      dispatchEvent(event) { for (const handler of handlers.get(event.type) ?? []) handler(event); return true; },
    });
  };
  const element = () => events({
    hidden: false, children: [], attributes: new Map(), textContent: "",
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
    removeAttribute(name) { this.attributes.delete(name); },
    hasAttribute(name) { return this.attributes.has(name); },
    replaceChildren() { this.children = []; },
    append(child) { this.children.push(child); },
    closest(selector) { return selector === "button" ? this : null; },
    remove() { this.removed = true; },
  });
  const list = element();
  const status = element();
  const complete = element();
  const indent = element(); indent.setAttribute("data-editor-indent", "");
  const outdent = element(); outdent.setAttribute("data-editor-outdent", "");
  const toolbar = events({
    querySelector(selector) {
      return { "[role=listbox]": list, "[role=status]": status,
        "[data-editor-complete]": complete }[selector];
    },
    querySelectorAll() { return [complete, indent, outdent]; },
    remove() { this.removed = true; },
  });
  const host = { after(node) { assert.equal(node, toolbar); } };
  const doc = {
    activeElement: null,
    createElement(tag) { return tag === "div" ? toolbar : element(); },
    execCommand(_command, _showUi, text) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.dispatchEvent({ type: "input", isComposing: false });
      return true;
    },
  };
  const textarea = events({
    value: source, selectionStart: source.length, selectionEnd: source.length,
    readOnly: false, disabled: false, ownerDocument: doc,
    closest() { return host; },
    setAttribute() {}, removeAttribute() {},
    focus() { doc.activeElement = this; },
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
  });
  return { textarea, doc, toolbar, list, status, complete, indent, outdent };
}

function key(textarea, key, options = {}) {
  let prevented = false;
  textarea.dispatchEvent({ type: "keydown", key, ...options,
    preventDefault() { prevented = true; } });
  return prevented;
}

test("native 삽입 실패·readonly·조합 중에는 원문을 유지하고 입력 callback을 중복 호출하지 않는다", () => {
  const fixture = editorFixture("pri");
  const { textarea, doc } = fixture;
  let changes = 0;
  const dispose = attachCodeEditorAssist(textarea, { languageId: "javascript", onChange() { changes++; } });
  textarea.readOnly = true;
  assert.equal(insertCodeEditorText(textarea, "print", 0, 3), false);
  textarea.readOnly = false;
  textarea.dispatchEvent({ type: "compositionstart" });
  assert.equal(isCodeEditorComposing(textarea), true);
  assert.equal(insertCodeEditorText(textarea, "print", 0, 3), false);
  assert.equal(key(textarea, "Enter", { isComposing: true }), false);
  textarea.dispatchEvent({ type: "compositionend" });
  assert.equal(isCodeEditorComposing(textarea), false);
  doc.execCommand = () => false;
  assert.equal(insertCodeEditorText(textarea, "print", 0, 3), false);
  assert.equal(textarea.value, "pri");
  doc.execCommand = (_command, _showUi, text) => {
    textarea.value = text;
    textarea.dispatchEvent({ type: "input", isComposing: false });
    return true;
  };
  assert.equal(insertCodeEditorText(textarea, "print", 0, 3), true);
  assert.equal(textarea.value, "print");
  assert.equal(changes, 1);
  dispose();
});

test("후보 Enter 선택·Escape 닫기와 Tab 기본 이동은 서로 간섭하지 않는다", () => {
  const { textarea, toolbar, list, complete } = editorFixture("print printer prin");
  const dispose = attachCodeEditorAssist(textarea, { languageId: "javascript", onChange() {} });
  toolbar.dispatchEvent({ type: "click", target: complete });
  assert.equal(list.hidden, false);
  assert.equal(key(textarea, "Tab"), false);
  assert.equal(list.hidden, true);
  toolbar.dispatchEvent({ type: "click", target: complete });
  assert.equal(key(textarea, "Escape"), true);
  assert.equal(list.hidden, true);
  toolbar.dispatchEvent({ type: "click", target: complete });
  assert.equal(key(textarea, "ArrowDown"), true);
  assert.equal(key(textarea, "Enter"), true);
  assert.equal(textarea.value, "print printer printer");
  dispose();
});

test("후보 클릭은 현재 편집 문서의 식별자만 삽입한다", () => {
  const { textarea, toolbar, list, complete } = editorFixture("print prin");
  const dispose = attachCodeEditorAssist(textarea, { languageId: "javascript", onChange() {} });
  toolbar.dispatchEvent({ type: "click", target: complete });
  list.children[0].dispatchEvent({ type: "click" });
  assert.equal(textarea.value, "print print");
  dispose();
});

test("선택 끝이 다음 줄 시작일 때 그 줄은 들여쓰지 않고 내어쓰기로 원문을 복원한다", () => {
  const { textarea, toolbar, indent, outdent } = editorFixture("a\nb\nc");
  const dispose = attachCodeEditorAssist(textarea, { languageId: "javascript", onChange() {} });
  textarea.setSelectionRange(0, 4);
  toolbar.dispatchEvent({ type: "click", target: indent });
  assert.equal(textarea.value, "  a\n  b\nc");
  textarea.setSelectionRange(0, 8);
  toolbar.dispatchEvent({ type: "click", target: outdent });
  assert.equal(textarea.value, "a\nb\nc");
  dispose();
});
