import assert from "node:assert/strict";
import test from "node:test";
import {
  createBrowserStorage,
  MemoryStorage,
} from "../src/repositories/browser-storage.js";
import {
  createBrowserStorage as createLegacyBrowserStorage,
  MemoryStorage as LegacyMemoryStorage,
} from "../src/repositories/progress-repository.js";

test("기존 progress-repository 공개 export를 그대로 유지한다", () => {
  assert.equal(createLegacyBrowserStorage, createBrowserStorage);
  assert.equal(LegacyMemoryStorage, MemoryStorage);
});

test("MemoryStorage는 Web Storage처럼 문자열을 저장하고 영구 저장소가 아님을 알린다", () => {
  const storage = new MemoryStorage();

  storage.setItem("count", 3);
  assert.equal(storage.getItem("count"), "3");
  assert.equal(storage.isPersistent(), false);

  storage.removeItem("count");
  assert.equal(storage.getItem("count"), null);
  assert.deepEqual(storage.keys(), []);
});

test("브라우저 저장소 wrapper는 키 열거와 개별 삭제를 지원한다", () => {
  const values = new Map();
  const primaryStorage = {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  storage.setItem("draft.one", "1");
  storage.setItem("submission.one", "2");
  assert.deepEqual(storage.keys().sort(), ["draft.one", "submission.one"]);

  storage.removeItem("draft.one");
  assert.deepEqual(storage.keys(), ["submission.one"]);
  assert.equal(storage.getItem("draft.one"), null);
  assert.equal(storage.isPersistent(), true);
});

test("다른 탭이 primary 키를 삭제하면 정상 키 열거에서 fallback 캐시를 제외한다", () => {
  const values = new Map([
    ["keep", "persisted"],
    ["removed.by.other.tab", "stale soon"],
  ]);
  const primaryStorage = {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  assert.equal(storage.getItem("removed.by.other.tab"), "stale soon");
  assert.deepEqual(storage.keys().sort(), ["keep", "removed.by.other.tab"]);

  values.delete("removed.by.other.tab");

  assert.deepEqual(storage.keys(), ["keep"]);
});

test("키 열거 API가 없어도 사용 가능한 primary 읽기·쓰기를 포기하지 않는다", () => {
  const values = new Map([
    ["manifest", "record.one"],
    ["record.one", "persisted"],
  ]);
  const primaryStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  assert.equal(storage.getItem("manifest"), "record.one");
  assert.deepEqual(storage.keys(), ["manifest"]);
  assert.equal(storage.getItem("record.one"), "persisted");
  assert.equal(storage.isPersistent(), true);
});

test("브라우저 저장소 접근이 차단되면 메모리 저장소로 계속 동작한다", () => {
  const blockedWindow = {};
  Object.defineProperty(blockedWindow, "localStorage", {
    get() {
      throw new Error("SecurityError");
    },
  });

  const storage = createBrowserStorage(blockedWindow);
  storage.setItem("progress", "saved in memory");

  assert.equal(storage.getItem("progress"), "saved in memory");
  assert.equal(storage.isPersistent(), false);
});

test("localStorage 쓰기가 실패해도 현재 탭의 값을 유지한다", () => {
  const primaryStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  storage.setItem("progress", "saved after failure");

  assert.equal(storage.getItem("progress"), "saved after failure");
  assert.equal(storage.isPersistent(), false);
});

test("QuotaExceeded 뒤에도 기존 primary 값과 키를 읽고 실패한 키만 메모리를 우선한다", () => {
  const values = new Map([
    ["persisted.one", "primary one"],
    ["persisted.two", "primary two"],
    ["failed.write", "stale primary"],
  ]);
  const primaryStorage = {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
    removeItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  storage.setItem("failed.write", "memory replacement");
  storage.setItem("memory.new", "memory new");

  assert.equal(storage.getItem("failed.write"), "memory replacement");
  assert.equal(storage.getItem("memory.new"), "memory new");
  assert.equal(storage.getItem("persisted.one"), "primary one");
  assert.equal(storage.getItem("persisted.two"), "primary two");
  assert.deepEqual(storage.keys().sort(), [
    "failed.write",
    "memory.new",
    "persisted.one",
    "persisted.two",
  ]);
  assert.equal(storage.isPersistent(), false);
});

test("primary 삭제가 실패하면 tombstone이 이전 값을 읽기와 키 열거에서 숨긴다", () => {
  const values = new Map([
    ["keep", "persisted"],
    ["remove.me", "stale primary"],
  ]);
  const primaryStorage = {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
    removeItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  storage.removeItem("remove.me");

  assert.equal(storage.getItem("remove.me"), null);
  assert.equal(storage.getItem("keep"), "persisted");
  assert.deepEqual(storage.keys(), ["keep"]);
  assert.equal(storage.isPersistent(), false);

  storage.setItem("remove.me", "memory restored");
  assert.equal(storage.getItem("remove.me"), "memory restored");
  assert.deepEqual(storage.keys().sort(), ["keep", "remove.me"]);
});

test("정상 저장 뒤 localStorage 읽기가 차단되어도 마지막 값을 유지한다", () => {
  let blocked = false;
  const values = new Map();
  const primaryStorage = {
    getItem(key) {
      if (blocked) throw new Error("SecurityError");
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
  const storage = createBrowserStorage({ localStorage: primaryStorage });

  storage.setItem("progress", "persisted");
  assert.equal(storage.isPersistent(), true);
  blocked = true;

  assert.equal(storage.getItem("progress"), "persisted");
  assert.deepEqual(storage.keys(), ["progress"]);
  storage.removeItem("progress");
  assert.deepEqual(storage.keys(), []);
  assert.equal(storage.isPersistent(), false);
});
