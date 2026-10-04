import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BamLearningApp } from "../src/app.js";
import { LocalStorageWebAssignmentRepository } from "../src/repositories/web-assignment-repository.js";

const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
const collection = JSON.parse(await readFile(new URL("../content/web-assignments/index.json", import.meta.url), "utf8"));
const assignment = collection.assignments[0];

function installWindow(t) {
  for (const [name, value] of Object.entries({ window: { location: { hash: "#/web-assignments" }, history: { replaceState(_state, _title, hash) { window.location.hash = hash; } }, scrollTo() {} }, document: { title: "" } })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => original ? Object.defineProperty(globalThis, name, original) : delete globalThis[name]);
  }
}

function createHarness() {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const app = Object.create(BamLearningApp.prototype);
  Object.assign(app, {
    curriculum, webAssignmentCollection: collection, webAssignmentRepository: new LocalStorageWebAssignmentRepository(storage),
    webAssignment: assignment, webAssignmentReadFailed: false,
    root: { innerHTML: "", querySelector() { return null; } },
    renderServiceShell({ mainContent }) { return mainContent; },
    enterView(view) { this.currentView = view; }, leaveCurrentView() {}, syncMenuState() {},
  });
  return { app, storage };
}

function createForm() {
  const status = { value: "self_completed" };
  const reflection = { value: "POST의 ID에 해당하는 글 상태를 바꾸고 GET에서 분류한다." };
  const feedback = { textContent: "" };
  const checklist = [true, false, true, false].map((checked) => ({ checked }));
  return { status, reflection, feedback, checklist,
    querySelector(selector) { return selector.includes("save-status") ? feedback : selector.includes("reflection") ? reflection : status; },
    querySelectorAll() { return checklist; },
  };
}

test("앱은 외부 목록·상세·잘못된 경로와 기존 인앱 경로를 분리해 연다", async (t) => {
  installWindow(t);
  const { app } = createHarness();
  const opened = [];
  app.openWebAssignmentRoute = (id) => opened.push(["external", id]);
  app.openWebProjectListRoute = () => opened.push(["legacy-list"]);
  app.openWebProjectRoute = (slug) => opened.push(["legacy-detail", slug]);
  for (const [hash, expected] of [
    ["#/web-assignments", ["external", undefined]],
    [`#/web-assignments/${assignment.id}`, ["external", assignment.id]],
    ["#/web-assignments/bad/extra", ["external", undefined]],
    ["#/web-projects", ["legacy-list"]],
    ["#/web-projects/learning-board", ["legacy-detail", "learning-board"]],
  ]) {
    window.location.hash = hash;
    await app.openRoute();
    assert.deepEqual(opened.at(-1), expected, hash);
  }
});

test("잘못된 외부 주소는 오류를 명시하고 유효한 과제·인앱 목록으로 이동할 수 있다", async (t) => {
  installWindow(t);
  const { app } = createHarness();
  for (const hash of ["#/web-assignments/bad-id", `#/web-assignments/${assignment.id}/extra`]) {
    window.location.hash = hash;
    await app.openRoute();
    assert.match(app.root.innerHTML, /role="alert"[^>]*>[^<]*주소가 올바르지 않습니다/);
    assert.ok(app.root.innerHTML.includes(`href="#/web-assignments/${assignment.id}"`));
    assert.match(app.root.innerHTML, /href="#\/web-projects"/);
    assert.equal(app.webAssignment, null);
  }
  window.location.hash = `#/web-assignments/${assignment.id}`;
  await app.openRoute();
  assert.equal(app.webAssignment.id, assignment.id);
  assert.doesNotMatch(app.root.innerHTML, /주소가 올바르지 않습니다/);
  let openedLegacy = false;
  app.openWebProjectListRoute = () => { openedLegacy = true; };
  window.location.hash = "#/web-projects";
  await app.openRoute();
  assert.equal(openedLegacy, true);
});

test("상세 재진입은 현재 revision 기록만 읽고 없는 ID는 안내한다", (t) => {
  installWindow(t);
  const { app } = createHarness();
  app.webAssignmentRepository.saveProgress(assignment.id, 1, { status: "in_progress", reflection: "이전 revision 기록", checklist: [true, false, false, false] });
  app.openWebAssignmentRoute(assignment.id);
  assert.match(app.root.innerHTML, /이전 revision 기록/);
  app.webAssignmentCollection = { ...collection, assignments: [{ ...assignment, revision: 2 }] };
  app.openWebAssignmentRoute(assignment.id);
  assert.doesNotMatch(app.root.innerHTML, /이전 revision 기록/);
  assert.match(app.root.innerHTML, /value="not_started" selected/);
  assert.equal(app.webAssignmentRepository.getProgress(assignment.id, 1).reflection, "이전 revision 기록");
  app.openWebAssignmentRoute("web-assignment-missing");
  assert.match(app.root.innerHTML, /찾을 수 없/);
});

test("명시적 저장은 현재 revision의 입력만 저장하며 자기 보고를 제품 PASS로 바꾸지 않는다", () => {
  const { app } = createHarness();
  const form = createForm();
  app.saveWebAssignmentProgress(form);
  const saved = app.webAssignmentRepository.getProgress(assignment.id, assignment.revision);
  assert.equal(saved.status, "self_completed");
  assert.equal(saved.reflection, form.reflection.value);
  assert.deepEqual(saved.checklist, [true, false, true, false]);
  assert.match(form.feedback.textContent, /저장했습니다/);
  assert.equal(assignment.availability.status, "execution-verification-pending");
});

test("앱 저장 실패는 이전 기록과 폼 입력을 보존하고 동일 입력 재시도가 가능하다", () => {
  const { app, storage } = createHarness();
  const form = createForm();
  app.saveWebAssignmentProgress(form);
  const before = app.webAssignmentRepository.getProgress(assignment.id, 1);
  form.reflection.value = "실패해도 지킬 입력";
  const setItem = storage.setItem;
  storage.setItem = () => { throw new Error("quota"); };
  app.saveWebAssignmentProgress(form);
  assert.match(form.feedback.textContent, /저장하지 못/);
  assert.equal(form.reflection.value, "실패해도 지킬 입력");
  assert.equal(app.webAssignmentRepository.getProgress(assignment.id, 1).reflection, before.reflection);
  storage.setItem = setItem;
  app.saveWebAssignmentProgress(form);
  assert.equal(app.webAssignmentRepository.getProgress(assignment.id, 1).reflection, "실패해도 지킬 입력");
});

test("기록 읽기 실패 상태에서는 저장하지 않고 정상 재읽기 후 저장한다", (t) => {
  installWindow(t);
  const { app, storage } = createHarness();
  const form = createForm();
  const getItem = storage.getItem;
  storage.getItem = () => { throw new Error("denied"); };
  app.openWebAssignmentRoute(assignment.id);
  assert.equal(app.webAssignmentReadFailed, true);
  assert.match(app.root.innerHTML, /disabled/);
  storage.getItem = getItem;
  app.saveWebAssignmentProgress(form);
  assert.equal(app.webAssignmentRepository.getProgress(assignment.id, 1), null);
  app.openWebAssignmentRoute(assignment.id);
  assert.equal(app.webAssignmentReadFailed, false);
  app.saveWebAssignmentProgress(form);
  assert.equal(app.webAssignmentRepository.getProgress(assignment.id, 1).reflection, form.reflection.value);
});
