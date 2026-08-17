import assert from "node:assert/strict";
import test from "node:test";
import { focusMainContent, getFocusLoopTarget } from "../src/ui/focus.js";

const first = { id: "first" };
const middle = { id: "middle" };
const last = { id: "last" };
const elements = [first, middle, last];

test("모바일 메뉴의 마지막 요소에서 Tab을 누르면 첫 요소로 순환한다", () => {
  assert.equal(getFocusLoopTarget(elements, last), first);
});

test("모바일 메뉴의 첫 요소에서 Shift+Tab을 누르면 마지막 요소로 순환한다", () => {
  assert.equal(getFocusLoopTarget(elements, first, true), last);
});

test("메뉴 밖에서 포커스가 들어오면 이동 방향의 경계 요소로 보낸다", () => {
  assert.equal(getFocusLoopTarget(elements, { id: "outside" }), first);
  assert.equal(getFocusLoopTarget(elements, { id: "outside" }, true), last);
});

test("메뉴 중간에서는 브라우저의 기본 Tab 순서를 유지한다", () => {
  assert.equal(getFocusLoopTarget(elements, middle), null);
  assert.equal(getFocusLoopTarget([], middle), null);
});

test("본문 바로가기는 URL 해시 대신 현재 본문을 맨 위로 이동하고 초점을 준다", () => {
  const calls = [];
  const target = {
    focus(options) {
      calls.push(["focus", options]);
    },
  };
  const browserWindow = {
    scrollTo(options) {
      calls.push(["scrollTo", options]);
    },
  };

  assert.equal(focusMainContent(target, browserWindow), true);
  assert.deepEqual(calls, [
    ["scrollTo", { top: 0, behavior: "instant" }],
    ["focus", { preventScroll: true }],
  ]);
  assert.equal(focusMainContent(null, browserWindow), false);
});
