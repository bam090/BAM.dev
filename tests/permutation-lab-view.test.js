import assert from "node:assert/strict";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { createPermutationTrace } from "../src/core/permutation-trace.js";
import { openPermutationLab, renderPermutationSnapshot } from "../src/ui/permutation-lab-view.js";

function installDialogHarness(t) {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const controls = new Map();
  const listeners = new Map();
  const focused = [];
  const scrolls = [];
  const lesson = { answerOpen: true, heading: "선택과 복귀" };
  const host = { children: [lesson], append(node) { this.children.push(node); } };
  function control(name) {
    if (!controls.has(name)) controls.set(name, {
      disabled: false, textContent: "", innerHTML: "",
      hasAttribute(attribute) { return attribute === `data-permutation-${name}`; },
      closest(selector) { return selector.includes(`[data-permutation-${name}]`) ? this : null; },
      focus(options) { focused.push({ name, options }); },
    });
    return controls.get(name);
  }
  const dialog = {
    innerHTML: "", attributes: {}, modal: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) {
      if (selector === ".permutation-lab-source") return control("source");
      const match = selector.match(/data-permutation-([^\]]+)/);
      return match ? control(match[1]) : null;
    },
    addEventListener(name, handler) { listeners.set(name, handler); },
    showModal() { this.modal = true; },
    remove() { host.children = host.children.filter((child) => child !== this); },
  };
  const trigger = {
    isConnected: true,
    focus(options) { focused.push({ name: "entry", options }); },
  };
  globalThis.window = {
    scrollY: 735,
    location: { hash: "#/learn/algorithm/permutations-combinations-java?reviewReturn=session-123&heading=copy" },
    scrollTo(options) { scrolls.push(options); },
  };
  globalThis.document = { createElement(tag) { assert.equal(tag, "dialog"); return dialog; } };
  t.after(() => {
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow);
    else delete globalThis.window;
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument);
    else delete globalThis.document;
  });
  return { host, lesson, dialog, trigger, control, focused, scrolls, listeners,
    click(name) { listeners.get("click")({ target: control(name) }); },
  };
}

test("실험실의 다음·이전·처음부터는 같은 snapshot으로 돌아오며 끝에서 중복 결과를 만들지 않는다", (t) => {
  const harness = installDialogHarness(t);
  const { control, click, focused } = harness;
  openPermutationLab(harness.trigger, harness.host);
  assert.equal(control("previous").disabled, true);
  const initial = control("snapshot").innerHTML;
  const count = createPermutationTrace().length;
  click("next");
  assert.notEqual(control("snapshot").innerHTML, initial);
  click("previous");
  assert.equal(control("snapshot").innerHTML, initial);
  click("previous");
  assert.equal(control("snapshot").innerHTML, initial);
  for (let index = 1; index < count; index += 1) click("next");
  assert.equal(control("next").disabled, true);
  const complete = control("snapshot").innerHTML;
  assert.match(complete, /경로 복사본 6개/);
  click("next");
  assert.equal(control("snapshot").innerHTML, complete);
  click("first");
  assert.equal(control("snapshot").innerHTML, initial);
  assert.equal(control("previous").disabled, true);
  assert.equal(control("next").disabled, false);
  assert.equal(focused.length, 1, "단계 이동은 버튼의 초점을 강제로 옮기지 않는다");
});

test("닫기는 원래 교안 DOM·답펼침·URL을 유지하고 위치와 진입 초점을 복원한다", (t) => {
  const harness = installDialogHarness(t);
  const hash = window.location.hash;
  openPermutationLab(harness.trigger, harness.host);
  assert.equal(harness.dialog.modal, true);
  assert.equal(harness.dialog.attributes["aria-labelledby"], "permutation-lab-title");
  assert.match(harness.dialog.innerHTML, /임의의 사용자 Java 코드를 실행하는 기능은 아닙니다/);
  assert.match(harness.dialog.innerHTML, /Java의 return이나 역실행이 아닙니다/);
  window.scrollY = 0;
  harness.click("close");
  assert.deepEqual(harness.host.children, [harness.lesson]);
  assert.equal(harness.lesson.answerOpen, true);
  assert.equal(window.location.hash, hash);
  assert.deepEqual(harness.scrolls, [{ top: 735, behavior: "instant" }]);
  assert.deepEqual(harness.focused.at(-1), { name: "entry", options: { preventScroll: true } });
});

test("Escape도 같은 복귀를 수행하고 다른 문서로 이동한 뒤에는 이전 위치를 덮어쓰지 않는다", (t) => {
  const harness = installDialogHarness(t);
  let prevented = false;
  openPermutationLab(harness.trigger, harness.host);
  harness.listeners.get("cancel")({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(harness.host.children.length, 1);
  assert.equal(harness.scrolls.length, 1);
  const dispose = openPermutationLab(harness.trigger, harness.host);
  window.location.hash = "#/learn/javascript/javascript-and-runtime";
  dispose({ restoreFocus: true });
  dispose({ restoreFocus: true });
  assert.equal(harness.host.children.length, 1);
  assert.equal(harness.scrolls.length, 1);
});

test("앱의 화면 전환은 열린 실험실을 정리한다", () => {
  const app = Object.create(BamLearningApp.prototype);
  let disposed = 0;
  Object.assign(app, {
    renderSequence: 0,
    syncMenuState() {},
    permutationLabDispose() { disposed += 1; },
  });
  app.enterView("lesson");
  assert.equal(disposed, 1);
  assert.equal(app.permutationLabDispose, null);
});

test("복귀 화면은 방금 실행한 자식 행과 현재 부모 호출·공유 상태를 구분한다", () => {
  const trace = createPermutationTrace();
  const copyIndex = trace.findIndex((step) => step.event === "copy");
  const html = renderPermutationSnapshot(trace[copyIndex + 1]);
  assert.match(html, /방금 실행: 깊이 3 · 13행/);
  assert.match(html, /깊이 2 · i = 2<strong>현재 호출/);
  assert.match(html, /data-permutation-path>\[1, 2, 3\]/);
  assert.match(html, /data-permutation-used>\[true, true, true\]/);
  assert.match(html, /경로 복사본 1개/);
});
