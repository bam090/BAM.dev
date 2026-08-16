export const PROGRESS_STORAGE_KEY = "bam.dev.progress.v1";

export function createEmptyProgress() {
  return {
    schemaVersion: 1,
    completedLessonIds: [],
    lastLessonId: null,
    updatedAt: null,
  };
}

export function normalizeProgress(value) {
  if (!value || typeof value !== "object" || value.schemaVersion !== 1) {
    return createEmptyProgress();
  }

  const completedLessonIds = Array.isArray(value.completedLessonIds)
    ? [...new Set(value.completedLessonIds.filter((id) => typeof id === "string"))]
    : [];

  return {
    schemaVersion: 1,
    completedLessonIds,
    lastLessonId: typeof value.lastLessonId === "string" ? value.lastLessonId : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

class ResilientBrowserStorage {
  constructor(primaryStorage) {
    this.primaryStorage = primaryStorage;
    this.fallbackStorage = new MemoryStorage();
  }

  getItem(key) {
    if (this.primaryStorage) {
      try {
        return this.primaryStorage.getItem(key);
      } catch {
        this.primaryStorage = null;
      }
    }
    return this.fallbackStorage.getItem(key);
  }

  setItem(key, value) {
    if (this.primaryStorage) {
      try {
        this.primaryStorage.setItem(key, value);
        return;
      } catch {
        this.primaryStorage = null;
      }
    }
    this.fallbackStorage.setItem(key, value);
  }
}

export function createBrowserStorage(browserWindow = globalThis.window) {
  let primaryStorage = null;
  try {
    primaryStorage = browserWindow?.localStorage ?? null;
  } catch {
    // 개인 정보 보호 설정 등으로 접근이 막히면 현재 탭의 메모리 저장소로 동작합니다.
  }
  return new ResilientBrowserStorage(primaryStorage);
}

export class ProgressRepository {
  getProgress() {
    throw new Error("getProgress()를 구현해야 합니다.");
  }

  setLastLesson() {
    throw new Error("setLastLesson()을 구현해야 합니다.");
  }

  setLessonCompleted() {
    throw new Error("setLessonCompleted()를 구현해야 합니다.");
  }
}

export class LocalStorageProgressRepository extends ProgressRepository {
  constructor(storage, clock = () => new Date()) {
    super();
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
      throw new TypeError("localStorage와 호환되는 저장소가 필요합니다.");
    }
    this.storage = storage;
    this.clock = clock;
  }

  getProgress() {
    let raw;
    try {
      raw = this.storage.getItem(PROGRESS_STORAGE_KEY);
    } catch {
      return createEmptyProgress();
    }
    if (!raw) return createEmptyProgress();
    try {
      return normalizeProgress(JSON.parse(raw));
    } catch {
      return createEmptyProgress();
    }
  }

  setLastLesson(lessonId) {
    if (typeof lessonId !== "string" || lessonId.length === 0) {
      throw new TypeError("유효한 lessonId가 필요합니다.");
    }
    return this.#save({ ...this.getProgress(), lastLessonId: lessonId });
  }

  setLessonCompleted(lessonId, completed = true) {
    if (typeof lessonId !== "string" || lessonId.length === 0) {
      throw new TypeError("유효한 lessonId가 필요합니다.");
    }

    const progress = this.getProgress();
    const completedIds = new Set(progress.completedLessonIds);
    if (completed) completedIds.add(lessonId);
    else completedIds.delete(lessonId);

    return this.#save({
      ...progress,
      completedLessonIds: [...completedIds],
      lastLessonId: lessonId,
    });
  }

  #save(progress) {
    const nextProgress = normalizeProgress({
      ...progress,
      schemaVersion: 1,
      updatedAt: this.clock().toISOString(),
    });
    this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
    return nextProgress;
  }
}
