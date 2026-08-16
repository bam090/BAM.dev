import assert from "node:assert/strict";
import test from "node:test";
import {
  createBrowserStorage,
  LocalStorageProgressRepository,
  PROGRESS_STORAGE_KEY,
  createEmptyProgress,
} from "../src/repositories/progress-repository.js";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

const fixedClock = () => new Date("2026-08-16T12:00:00.000Z");

test("처음에는 빈 진도를 반환한다", () => {
  const repository = new LocalStorageProgressRepository(new MemoryStorage(), fixedClock);
  assert.deepEqual(repository.getProgress(), createEmptyProgress());
});

test("최근 교안과 완료 상태를 같은 버전 데이터에 저장한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage, fixedClock);

  repository.setLastLesson("js-02-values-control-flow");
  repository.setLessonCompleted("js-02-values-control-flow", true);

  assert.deepEqual(repository.getProgress(), {
    schemaVersion: 1,
    completedLessonIds: ["js-02-values-control-flow"],
    lastLessonId: "js-02-values-control-flow",
    updatedAt: "2026-08-16T12:00:00.000Z",
  });
  assert.ok(storage.getItem(PROGRESS_STORAGE_KEY));
});

test("완료 표시를 해제할 수 있고 손상된 JSON은 안전하게 복구한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageProgressRepository(storage, fixedClock);
  repository.setLessonCompleted("js-01-runtime", true);
  repository.setLessonCompleted("js-01-runtime", false);
  assert.deepEqual(repository.getProgress().completedLessonIds, []);

  storage.setItem(PROGRESS_STORAGE_KEY, "{broken");
  assert.deepEqual(repository.getProgress(), createEmptyProgress());
});

test("브라우저 저장소 접근이 차단되면 메모리 저장소로 계속 동작한다", () => {
  const blockedWindow = {};
  Object.defineProperty(blockedWindow, "localStorage", {
    get() {
      throw new Error("SecurityError");
    },
  });

  const repository = new LocalStorageProgressRepository(
    createBrowserStorage(blockedWindow),
    fixedClock,
  );
  repository.setLessonCompleted("js-01-runtime", true);
  assert.deepEqual(repository.getProgress().completedLessonIds, ["js-01-runtime"]);
});

test("localStorage 쓰기가 실패해도 현재 탭의 진도는 유지한다", () => {
  const throwingStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const repository = new LocalStorageProgressRepository(
    createBrowserStorage({ localStorage: throwingStorage }),
    fixedClock,
  );
  repository.setLessonCompleted("js-02-values-control-flow", true);
  assert.deepEqual(repository.getProgress().completedLessonIds, ["js-02-values-control-flow"]);
});
