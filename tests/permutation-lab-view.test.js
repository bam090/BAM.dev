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
      _disabled: false, textContent: "", innerHTML: "", hidden: false, attributes: {},
      get disabled() { return this._disabled; },
      set disabled(value) {
        this._disabled = value;
        // Chromium drops focus immediately when its active button is disabled.
        if (value && document.activeElement === this) document.activeElement = document.body;
      },
      setAttribute(attribute, value) { this.attributes[attribute] = value; },
      getAttribute(attribute) {
        if (attribute === "data-permutation-predict" && name.startsWith("predict=")) return name.slice(8);
        return this.attributes[attribute] ?? null;
      },
      hasAttribute(attribute) {
        return attribute === `data-permutation-${name}`
          || (attribute === "data-permutation-predict" && name.startsWith("predict="));
      },
      closest(selector) {
        return selector.includes(`[data-permutation-${name}]`)
          || (name.startsWith("predict=") && selector.includes("[data-permutation-predict]")) ? this : null;
      },
      focus(options) {
        if (this.disabled) return;
        document.activeElement = this;
        focused.push({ name, options });
      },
    });
    return controls.get(name);
  }
  const dialog = {
    innerHTML: "", attributes: {}, modal: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) {
      if (selector === ".permutation-lab-source") return control("source");
      const match = selector.match(/data-permutation-([^\]]+)/);
      return match ? control(match[1].replaceAll('"', "").replaceAll("'", "")) : null;
    },
    querySelectorAll(selector) {
      return selector === "[data-permutation-predict]"
        ? ["keep", "remove"].map((value) => control(`predict=${value}`)) : [];
    },
    addEventListener(name, handler) { listeners.set(name, handler); },
    showModal() { this.modal = true; },
    remove() { host.children = host.children.filter((child) => child !== this); },
  };
  const trigger = {
    isConnected: true,
    focus(options) { document.activeElement = this; focused.push({ name: "entry", options }); },
  };
  globalThis.window = {
    scrollY: 735,
    location: { hash: "#/learn/algorithm/permutations-combinations-java?reviewReturn=session-123&heading=copy" },
    scrollTo(options) { scrolls.push(options); },
  };
  const body = {};
  globalThis.document = { body, activeElement: body, createElement(tag) { assert.equal(tag, "dialog"); return dialog; } };
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
  assert.equal(focused.length, 1, "일반 단계 이동은 버튼의 초점을 강제로 옮기지 않는다");
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
});

test("마지막 단계에서 다음이 비활성화되면 BODY로 사라진 초점을 이전으로 복원한다", (t) => {
  const harness = installDialogHarness(t);
  openPermutationLab(harness.trigger, harness.host);
  const initialFocusCount = harness.focused.length;
  for (let index = 1; index < 201; index += 1) harness.click("next");
  assert.equal(document.activeElement, harness.control("next"));
  assert.equal(harness.focused.length, initialFocusCount);
  harness.click("next");
  assert.equal(harness.control("next").disabled, true);
  assert.equal(document.activeElement, harness.control("previous"));
  assert.deepEqual(harness.focused.at(-1), { name: "previous", options: { preventScroll: true } });
  assert.equal(harness.focused.length, initialFocusCount + 1);
});

test("첫 단계에서 이전이 비활성화되면 BODY로 사라진 초점을 다음으로 복원한다", (t) => {
  const harness = installDialogHarness(t);
  openPermutationLab(harness.trigger, harness.host);
  harness.click("next");
  harness.control("previous").focus();
  const focusCount = harness.focused.length;
  harness.click("previous");
  assert.equal(harness.control("previous").disabled, true);
  assert.equal(document.activeElement, harness.control("next"));
  assert.deepEqual(harness.focused.at(-1), { name: "next", options: { preventScroll: true } });
  assert.equal(harness.focused.length, focusCount + 1);
});

test("경계에 도착해도 다른 활성 버튼의 초점은 빼앗지 않는다", (t) => {
  const harness = installDialogHarness(t);
  openPermutationLab(harness.trigger, harness.host);
  harness.control("close").focus();
  const focusCount = harness.focused.length;
  for (let index = 1; index <= 201; index += 1) harness.click("next");
  assert.equal(document.activeElement, harness.control("close"));
  assert.equal(harness.focused.length, focusCount);
  harness.control("first").focus();
  const beforeReset = harness.focused.length;
  harness.click("first");
  assert.equal(document.activeElement, harness.control("first"));
  assert.equal(harness.focused.length, beforeReset);
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

function openFirstPrediction(harness) {
  openPermutationLab(harness.trigger, harness.host);
  for (let index = 0; index < 31; index += 1) harness.click("next");
  assert.equal(harness.control("prediction").hidden, true, "copy 직후는 이번 예측 지점이 아니다");
  harness.click("next");
  assert.match(harness.control("counter").textContent, /^32 \/ 201/);
  assert.equal(harness.control("prediction").hidden, false);
  assert.match(harness.control("snapshot").innerHTML, /data-permutation-path>\[1, 2, 3\]/);
}

test("첫 반환에서만 다음 remove의 path를 물으며 두 예상은 답 공개나 단계 이동 없이 바꿀 수 있다", (t) => {
  const harness = installDialogHarness(t);
  const { control, click, focused } = harness;
  openFirstPrediction(harness);
  assert.match(harness.dialog.innerHTML, /다음 path\.remove 직후, path는 어떻게 될까요/);
  const snapshot = control("snapshot").innerHTML;
  const focusCount = focused.length;
  for (const [choice, expected] of [["keep", /1, 2, 3/], ["remove", /1, 2/]]) {
    click(`predict=${choice}`);
    assert.equal(control(`predict=${choice}`).getAttribute("aria-pressed"), "true");
    assert.equal(control(`predict=${choice === "keep" ? "remove" : "keep"}`).getAttribute("aria-pressed"), "false");
    assert.match(control("prediction-selection").textContent, expected);
    assert.equal(control("prediction-result").hidden, true, "선택 직후에는 실제 답을 공개하지 않는다");
    assert.equal(control("snapshot").innerHTML, snapshot);
    assert.match(control("counter").textContent, /^32 \/ 201/);
    assert.equal(control("next").disabled, false);
  }
  assert.equal(focused.length, focusCount, "선택 버튼의 초점을 강제로 옮기지 않는다");
});

test("각 예상은 다음 remove 실제 값과 대조되며 return 직후의 값과 구분한다", (t) => {
  const harness = installDialogHarness(t);
  const { control, click } = harness;
  for (const choice of ["keep", "remove"]) {
    openFirstPrediction(harness);
    click(`predict=${choice}`);
    click("next");
    assert.match(control("counter").textContent, /^33 \/ 201/);
    assert.equal(control("prediction-result").hidden, false);
    assert.match(control("prediction-result").textContent, /1, 2\]/);
    assert.match(control("prediction-result").textContent, /path\.remove/);
    assert.match(control("prediction-result").textContent, choice === "keep" ? /예상.*1, 2, 3/ : /예상.*1, 2\]/);
    assert.match(control("snapshot").innerHTML, /data-permutation-path>\[1, 2\]/);
    click("next");
    assert.equal(control("prediction").hidden, true);
    assert.match(control("snapshot").innerHTML, /data-permutation-path>\[1, 2\]/);
    click("close");
  }
});

test("미응답 다음과 선택 후 건너뛰기는 동일한 실제 상태로 진행하며 건너뛰기는 다음에 초점을 둔다", (t) => {
  const harness = installDialogHarness(t);
  const { control, click, focused } = harness;
  openFirstPrediction(harness);
  click("next");
  const unanswered = control("prediction-result").textContent;
  const actualSnapshot = control("snapshot").innerHTML;
  click("previous");
  click("predict=remove");
  const focusCount = focused.length;
  click("skip");
  assert.match(control("counter").textContent, /^33 \/ 201/);
  assert.equal(control("prediction-result").textContent, unanswered);
  assert.equal(control("snapshot").innerHTML, actualSnapshot);
  assert.equal(focused.length, focusCount + 1);
  assert.deepEqual(focused.at(-1), { name: "next", options: { preventScroll: true } });
});

test("이전·처음부터·닫기·Escape와 재진입은 지난 예상을 지운다", (t) => {
  const harness = installDialogHarness(t);
  const { control, click } = harness;
  openFirstPrediction(harness);
  click("next");
  const unanswered = control("prediction-result").textContent;
  click("previous");
  click("predict=remove");
  click("next");
  click("next");
  click("previous");
  assert.equal(control("prediction-result").textContent, unanswered, "34→33는 지난 답 없이 실제만 보인다");
  click("previous");
  for (const choice of ["keep", "remove"]) assert.equal(control(`predict=${choice}`).getAttribute("aria-pressed"), "false");
  click("predict=remove");
  click("first");
  assert.equal(control("prediction").hidden, true);
  for (let index = 0; index < 32; index += 1) click("next");
  assert.equal(control("predict=remove").getAttribute("aria-pressed"), "false");
  click("predict=remove");
  click("close");
  openFirstPrediction(harness);
  assert.equal(control("predict=remove").getAttribute("aria-pressed"), "false");
  click("predict=keep");
  harness.listeners.get("cancel")({ preventDefault() {} });
  openFirstPrediction(harness);
  assert.equal(control("predict=keep").getAttribute("aria-pressed"), "false");
});

test("예측은 첫 사례에만 나타나며 저장 없이 기존 202개 trace와 최종 여섯 복사본을 보존한다", (t) => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("예측은 저장소에 접근하지 않는다"); } });
  t.after(() => {
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete globalThis.localStorage;
  });
  const traceBefore = createPermutationTrace();
  assert.equal(traceBefore.length, 202);
  const harness = installDialogHarness(t);
  openFirstPrediction(harness);
  harness.click("predict=remove");
  harness.click("next");
  for (let index = 34; index < 202; index += 1) {
    harness.click("next");
    assert.equal(harness.control("prediction").hidden, true, `후속 ${index}단계`);
  }
  assert.match(harness.control("snapshot").innerHTML, /경로 복사본 6개/);
  assert.deepEqual(createPermutationTrace(), traceBefore);
  assert.deepEqual(traceBefore.at(-1).answers, [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]);
});
