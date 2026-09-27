const KEYWORDS = {
  javascript: "async await break case catch class const continue default delete do else export extends false finally for function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield",
  java: "abstract assert boolean break byte case catch char class continue default do double else enum extends false final finally float for if implements import instanceof int interface long new null package private protected public record return short static super switch synchronized this throw throws true try void while",
  html: "article aside body button div footer form h1 h2 head header html img input label li link main meta nav ol p script section span style table tbody td textarea th title tr ul",
  css: "align-items background border border-color border-radius color display flex font-family font-size gap grid height justify-content line-height margin max-width min-height overflow padding position text-align width",
};
const IDENTIFIER = /[$A-Za-z_][$\w]*/g;
const WORD_END = /[$A-Za-z_][$\w]*$/;
const COMPOSING_EDITORS = new WeakSet();
let nextListId = 0;

export function isCodeEditorComposing(textarea) {
  return COMPOSING_EDITORS.has(textarea);
}

function prefixAt(source, cursor) {
  return source.slice(0, cursor).match(WORD_END)?.[0] ?? "";
}

export function getCodeEditorSuggestions(source, cursor, languageId, { explicit = false } = {}) {
  if (typeof source !== "string" || !Number.isSafeInteger(cursor) || cursor < 0 || cursor > source.length) return [];
  const prefix = prefixAt(source, cursor);
  if (!explicit && prefix.length < 2) return [];
  const identifiers = [...source.matchAll(IDENTIFIER)].map(([word]) => word);
  const keywords = KEYWORDS[languageId]?.split(" ") ?? [];
  return [...new Set([...identifiers, ...keywords])]
    .filter((word) => word !== prefix && (!prefix || word.startsWith(prefix)))
    .slice(0, 8);
}

// execCommand is deprecated, but insertText currently keeps the browser's native undo history.
export function insertCodeEditorText(textarea, text, start, end) {
  if (!textarea || textarea.readOnly || textarea.disabled || COMPOSING_EDITORS.has(textarea)
    || typeof text !== "string" || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)
    || start < 0 || end < start || end > textarea.value.length) return false;
  const before = textarea.value;
  const expected = `${before.slice(0, start)}${text}${before.slice(end)}`;
  const selectionStart = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;
  let emittedInput = false;
  const markInput = () => { emittedInput = true; };
  textarea.addEventListener("input", markInput);
  let inserted = false;
  try {
    textarea.focus();
    textarea.setSelectionRange(start, end);
    inserted = textarea.ownerDocument.execCommand("insertText", false, text);
  } catch {
    inserted = false;
  } finally {
    textarea.removeEventListener("input", markInput);
  }
  if (!inserted || textarea.value !== expected) {
    if (textarea.value === before) textarea.setSelectionRange(selectionStart, selectionEnd);
    return false;
  }
  if (!emittedInput) textarea.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function selectedLines(textarea) {
  const source = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const first = source.lastIndexOf("\n", start - 1) + 1;
  const lastCharacter = end > start && source[end - 1] === "\n" ? end - 1 : end;
  const nextLine = source.indexOf("\n", lastCharacter);
  const last = nextLine < 0 ? source.length : nextLine;
  return { first, last, lines: source.slice(first, last).split("\n") };
}

function changeLineIndent(textarea, direction) {
  const { first, last, lines } = selectedLines(textarea);
  const changed = lines.map((line) => direction === "in"
    ? `  ${line}` : line.startsWith("  ") ? line.slice(2) : line.startsWith("\t") ? line.slice(1) : line.startsWith(" ") ? line.slice(1) : line);
  if (changed.every((line, index) => line === lines[index])) return false;
  return insertCodeEditorText(textarea, changed.join("\n"), first, last);
}

export function attachCodeEditorAssist(textarea, { languageId, onChange } = {}) {
  if (!textarea || typeof onChange !== "function") throw new TypeError("textarea와 onChange가 필요합니다.");
  const doc = textarea.ownerDocument;
  const host = textarea.closest(".quest-editor-shell, .coding-test-editor-shell") ?? textarea;
  const toolbar = doc.createElement("div");
  toolbar.className = "code-editor-assist";
  toolbar.innerHTML = `<div class="code-editor-assist-actions">
    <button type="button" data-editor-complete aria-label="자동완성 후보 보기">자동완성</button>
    <button type="button" data-editor-indent aria-label="선택 줄 들여쓰기">들여쓰기</button>
    <button type="button" data-editor-outdent aria-label="선택 줄 내어쓰기">내어쓰기</button>
    </div><div class="code-editor-assist-list" role="listbox" hidden></div>
    <p class="code-editor-assist-status" role="status" aria-live="polite"></p>`;
  host.after(toolbar);
  const list = toolbar.querySelector("[role=listbox]");
  const status = toolbar.querySelector("[role=status]");
  const complete = toolbar.querySelector("[data-editor-complete]");
  for (const button of toolbar.querySelectorAll(".code-editor-assist-actions button")) {
    button.disabled = textarea.readOnly || textarea.disabled;
  }
  const listId = `code-editor-options-${++nextListId}`;
  list.id = listId;
  textarea.setAttribute("aria-controls", listId);
  textarea.setAttribute("aria-expanded", "false");
  textarea.setAttribute("aria-autocomplete", "list");
  textarea.setAttribute("aria-haspopup", "listbox");
  let composing = false;
  let candidates = [];
  let active = 0;
  let rangeStart = 0;
  let rangeEnd = 0;

  function close() {
    candidates = [];
    list.hidden = true;
    list.replaceChildren();
    textarea.setAttribute("aria-expanded", "false");
    textarea.removeAttribute("aria-activedescendant");
  }
  function announce(message) { status.textContent = message; }
  function renderCandidates() {
    list.replaceChildren();
    candidates.forEach((word, index) => {
      const option = doc.createElement("button");
      option.type = "button";
      option.id = `${listId}-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(index === active));
      option.textContent = word;
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => choose(index));
      list.append(option);
    });
    list.hidden = candidates.length === 0;
    textarea.setAttribute("aria-expanded", String(candidates.length > 0));
    if (candidates.length) textarea.setAttribute("aria-activedescendant", `${listId}-${active}`);
    else textarea.removeAttribute("aria-activedescendant");
  }
  function show(explicit = false) {
    if (composing || textarea.readOnly || textarea.disabled || textarea.selectionStart !== textarea.selectionEnd) {
      close();
      return;
    }
    const cursor = textarea.selectionStart;
    const prefix = prefixAt(textarea.value, cursor);
    candidates = getCodeEditorSuggestions(textarea.value, cursor, languageId, { explicit });
    rangeStart = cursor - prefix.length;
    rangeEnd = cursor;
    while (/[$\w]/.test(textarea.value[rangeEnd] ?? "") && rangeEnd < textarea.value.length) rangeEnd++;
    active = 0;
    renderCandidates();
    if (explicit) announce(candidates.length ? `자동완성 후보 ${candidates.length}개` : "자동완성 후보가 없습니다.");
  }
  function choose(index) {
    if (composing || textarea.readOnly || !candidates[index]) return;
    const word = candidates[index];
    close();
    if (insertCodeEditorText(textarea, word, rangeStart, rangeEnd)) announce(`${word} 입력됨`);
    else announce("이 브라우저에서 보조 입력을 사용할 수 없습니다. 코드는 유지됩니다.");
    textarea.focus();
  }
  function onInput(event) {
    onChange(event);
    if (composing || event.isComposing) close();
    else show();
  }
  function onKeyDown(event) {
    if (composing || event.isComposing || textarea.readOnly || textarea.disabled) return;
    if (event.key === "Escape" && !list.hidden) { close(); event.preventDefault(); return; }
    if (event.key === "Tab") { close(); return; }
    if (!list.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      active = (active + (event.key === "ArrowDown" ? 1 : candidates.length - 1)) % candidates.length;
      renderCandidates();
      event.preventDefault();
      return;
    }
    if (!list.hidden && event.key === "Enter") { choose(active); event.preventDefault(); return; }
    if (event.key !== "Enter" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
    const indent = textarea.value.slice(lineStart).match(/^[ \t]*/)?.[0] ?? "";
    if (indent && insertCodeEditorText(textarea, `\n${indent}`, start, textarea.selectionEnd)) event.preventDefault();
  }
  function onToolbarClick(event) {
    if (composing || textarea.readOnly || textarea.disabled) return;
    const button = event.target.closest("button");
    if (button === complete) { textarea.focus(); show(true); return; }
    const direction = button?.hasAttribute("data-editor-indent") ? "in"
      : button?.hasAttribute("data-editor-outdent") ? "out" : null;
    if (!direction) return;
    if (!changeLineIndent(textarea, direction)) announce("들여쓰기를 적용하지 못했습니다. 코드는 유지됩니다.");
    else announce(direction === "in" ? "선택 줄 들여쓰기 완료" : "선택 줄 내어쓰기 완료");
    textarea.focus();
  }
  const onCompositionStart = () => { composing = true; COMPOSING_EDITORS.add(textarea); close(); };
  const onCompositionEnd = () => { composing = false; COMPOSING_EDITORS.delete(textarea); close(); };
  const onSelectionChange = (event) => {
    if (!list.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) return;
    if (doc.activeElement === textarea && !list.hidden) show();
  };
  textarea.addEventListener("input", onInput);
  textarea.addEventListener("keydown", onKeyDown);
  textarea.addEventListener("compositionstart", onCompositionStart);
  textarea.addEventListener("compositionend", onCompositionEnd);
  textarea.addEventListener("click", onSelectionChange);
  textarea.addEventListener("keyup", onSelectionChange);
  toolbar.addEventListener("mousedown", (event) => { if (event.target.closest("button")) event.preventDefault(); });
  toolbar.addEventListener("click", onToolbarClick);
  return () => {
    close();
    COMPOSING_EDITORS.delete(textarea);
    textarea.removeEventListener("input", onInput);
    textarea.removeEventListener("keydown", onKeyDown);
    textarea.removeEventListener("compositionstart", onCompositionStart);
    textarea.removeEventListener("compositionend", onCompositionEnd);
    textarea.removeEventListener("click", onSelectionChange);
    textarea.removeEventListener("keyup", onSelectionChange);
    textarea.removeAttribute("aria-controls");
    textarea.removeAttribute("aria-expanded");
    textarea.removeAttribute("aria-autocomplete");
    textarea.removeAttribute("aria-haspopup");
    textarea.removeAttribute("aria-activedescendant");
    toolbar.remove();
  };
}

export function patchConnectedEditor(root, nextHtml, selector) {
  if (!root?.isConnected || typeof nextHtml !== "string") return false;
  const template = root.ownerDocument.createElement("template");
  template.innerHTML = nextHtml;
  const oldMatches = root.querySelectorAll(selector);
  const newMatches = template.content.querySelectorAll(selector);
  if (oldMatches.length !== 1 || newMatches.length !== 1
    || COMPOSING_EDITORS.has(oldMatches[0]) || oldMatches[0].value !== newMatches[0].value) return false;
  const path = (node, top) => {
    const nodes = [];
    while (node) {
      nodes.unshift(node);
      if (node === top) return nodes;
      node = node.parentNode;
    }
    return null;
  };
  const oldPath = path(oldMatches[0], root);
  const newPath = path(newMatches[0], template.content);
  if (!oldPath || !newPath || oldPath.length !== newPath.length) return false;
  for (let i = 1; i < oldPath.length; i++) {
    if (oldPath[i].nodeType !== 1 || newPath[i].nodeType !== 1
      || oldPath[i].tagName !== newPath[i].tagName || oldPath[i].id !== newPath[i].id) return false;
  }
  const plans = oldPath.slice(0, -1).map((parent, index) => {
    const newParent = newPath[index];
    const newChild = newPath[index + 1];
    const before = [];
    const after = [];
    let passed = false;
    for (const node of newParent.childNodes) {
      if (node === newChild) { passed = true; continue; }
      (passed ? after : before).push(node.cloneNode(true));
    }
    return { parent, newParent, child: oldPath[index + 1], before, after };
  });
  if (plans.some(({ parent, child, newParent }) => child.parentNode !== parent || !newParent.childNodes.length)) return false;
  const syncAttributes = (current, next) => {
    for (const name of current.getAttributeNames()) if (!next.hasAttribute(name)) current.removeAttribute(name);
    for (const name of next.getAttributeNames()) current.setAttribute(name, next.getAttribute(name));
  };
  for (const { parent, newParent, child, before, after } of plans) {
    if (parent.nodeType === 1 && newParent.nodeType === 1) syncAttributes(parent, newParent);
    for (const node of [...parent.childNodes]) if (node !== child) node.remove();
    for (const node of before) parent.insertBefore(node, child);
    for (const node of after) parent.append(node);
  }
  syncAttributes(oldMatches[0], newMatches[0]);
  return true;
}
