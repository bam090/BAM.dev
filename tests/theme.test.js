import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserStorage, MemoryStorage } from "../src/repositories/browser-storage.js";
import { LocalStorageThemePreferenceRepository, THEME_PREFERENCE_STORAGE_KEY } from "../src/repositories/theme-preference-repository.js";
import { createThemeController, renderThemeControls, resolveTheme } from "../src/ui/theme.js";

function persistentStorage() {
  const storage = new MemoryStorage();
  storage.isPersistent = () => true;
  return storage;
}

function themeEnvironment(storage, prefersDark = false) {
  let onOsChange;
  const buttons = ["light", "dark"].map((themeChoice) => ({
    dataset: { themeChoice }, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
  }));
  const notice = { hidden: true, textContent: "" };
  const focusedOption = { value: "b", checked: true };
  const document = { documentElement: { dataset: {} }, activeElement: focusedOption };
  const root = {
    set innerHTML(_value) { assert.fail("테마 변경으로 풀이 DOM을 교체하면 안 된다."); },
    querySelectorAll(selector) { return selector === "[data-theme-choice]" ? buttons : selector === "[data-theme-notice]" ? [notice] : []; },
  };
  const browserWindow = {
    matchMedia(query) {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return { matches: prefersDark, addEventListener(type, callback) { assert.equal(type, "change"); onOsChange = callback; } };
    },
    location: { reload() { assert.fail("테마 변경으로 페이지를 다시 불러오면 안 된다."); } },
  };
  const controller = createThemeController({ browserWindow, document, root, repository: new LocalStorageThemePreferenceRepository(storage) });
  return { controller, buttons, notice, document, focusedOption, osChange: (matches) => onOsChange({ matches }) };
}

test("저장한 밝기는 OS보다 우선하고 없거나 비정상인 값은 OS를 따른다", () => {
  for (const prefersDark of [false, true]) {
    for (const value of [null, "", "system", "DARK", '{"theme":"dark"}', "<script>"]) {
      assert.equal(resolveTheme(value, prefersDark), prefersDark ? "dark" : "light");
    }
    assert.equal(resolveTheme("light", prefersDark), "light");
    assert.equal(resolveTheme("dark", prefersDark), "dark");
  }
  const storage = persistentStorage();
  storage.setItem(THEME_PREFERENCE_STORAGE_KEY, "light");
  const app = themeEnvironment(storage, true);
  assert.equal(app.controller.getState().theme, "light");
  app.osChange(true);
  assert.equal(app.controller.getState().theme, "light");
});

test("테마 저장소는 유효한 값만 읽고 기존 진도·진행 세션과 손상 데이터를 건드리지 않는다", () => {
  const storage = persistentStorage();
  const progress = '{"completedLessonIds":["js-notes-functions"],"quizAttempts":[{"id":"past"}]}';
  const session = '{"activeSession":{"selectedOptionIds":[["question","b"]]}}';
  storage.setItem("bam.dev.progress.v1", progress);
  storage.setItem("bam.dev.review-session.v1", session);
  const repository = new LocalStorageThemePreferenceRepository(storage);
  assert.equal(THEME_PREFERENCE_STORAGE_KEY, "bam.dev.theme.v1");
  assert.equal(repository.read(), null);
  storage.setItem(THEME_PREFERENCE_STORAGE_KEY, "invalid");
  assert.equal(repository.read(), null);
  assert.equal(storage.getItem(THEME_PREFERENCE_STORAGE_KEY), "invalid");
  assert.throws(() => repository.save("invalid"), TypeError);
  assert.equal(storage.getItem(THEME_PREFERENCE_STORAGE_KEY), "invalid");
  assert.deepEqual(repository.save("dark"), { persistent: true });
  assert.equal(new LocalStorageThemePreferenceRepository(storage).read(), "dark");
  assert.equal(storage.getItem("bam.dev.progress.v1"), progress);
  assert.equal(storage.getItem("bam.dev.review-session.v1"), session);
  assert.deepEqual(storage.keys().sort(), ["bam.dev.progress.v1", "bam.dev.review-session.v1", "bam.dev.theme.v1"]);
});

test("명시적 선택 전 OS 변화는 반영하고 선택 뒤에는 풀이·초점·선택 테마를 유지한다", () => {
  const storage = persistentStorage();
  const app = themeEnvironment(storage);
  assert.equal(app.document.documentElement.dataset.theme, "light");
  app.osChange(true);
  assert.equal(app.document.documentElement.dataset.theme, "dark");
  assert.equal(storage.getItem(THEME_PREFERENCE_STORAGE_KEY), null, "OS 변화는 사용자 선택을 저장하지 않는다.");
  app.controller.setTheme("light");
  assert.equal(app.controller.getState().notice, "");
  assert.equal(storage.getItem(THEME_PREFERENCE_STORAGE_KEY), "light");
  app.osChange(true);
  assert.equal(app.document.documentElement.dataset.theme, "light");
  assert.deepEqual(app.buttons.map((button) => button.attributes["aria-pressed"]), ["true", "false"]);
  assert.equal(app.document.activeElement, app.focusedOption);
  assert.equal(app.focusedOption.checked, true);
  assert.equal(app.focusedOption.value, "b");
  assert.equal(themeEnvironment(storage, true).controller.getState().theme, "light", "새 실행도 명시 선택을 복원한다.");
  assert.throws(() => app.controller.setTheme("auto"), TypeError);
  assert.equal(app.controller.getState().theme, "light");
});

test("읽기·쓰기 차단이나 용량 실패에도 현재 색을 바꾸고 저장 성공으로 안내하지 않는다", () => {
  for (const storage of [
    { getItem() { throw new Error("접근 차단"); }, setItem() { throw new Error("접근 차단"); } },
    { getItem() { return null; }, setItem() { throw new Error("용량 부족"); } },
    new MemoryStorage(),
  ]) {
    const app = themeEnvironment(storage);
    assert.equal(app.controller.getState().theme, "light");
    app.controller.setTheme("dark");
    assert.equal(app.document.documentElement.dataset.theme, "dark");
    assert.equal(app.controller.getState().theme, "dark");
    assert.match(app.notice.textContent, /저장하지 못/);
    assert.equal(app.notice.hidden, false);
    assert.deepEqual(app.buttons.map((button) => button.attributes["aria-pressed"]), ["false", "true"]);
    assert.equal(app.document.activeElement, app.focusedOption);
    app.osChange(false);
    assert.equal(app.controller.getState().theme, "dark");
  }
  const deniedWindow = { get localStorage() { throw new Error("getter 차단"); } };
  const repository = new LocalStorageThemePreferenceRepository(createBrowserStorage(deniedWindow));
  assert.equal(repository.read(), null);
  assert.deepEqual(repository.save("dark"), { persistent: false });
  assert.equal(repository.read(), "dark", "현재 창의 메모리 fallback은 선택을 유지한다.");
});

test("밝기 조작부는 네이티브 버튼과 선택 상태를 제공하고 안내 문자열은 실행하지 않는다", () => {
  for (const theme of ["light", "dark"]) {
    const html = renderThemeControls({ theme, notice: '<script>alert("notice")</script>' });
    assert.match(html, /role="group" aria-label="화면 밝기"/);
    assert.equal((html.match(/<button\b/g) ?? []).length, 2);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
    assert.match(html, new RegExp(`data-theme-choice="${theme}" aria-pressed="true"`));
    assert.match(html, />밝게<\/button>/);
    assert.match(html, />어둡게<\/button>/);
    assert.match(html, /role="status"/);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  }
});
