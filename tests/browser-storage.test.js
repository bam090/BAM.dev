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
  assert.equal(storage.isPersistent(), false);
});
