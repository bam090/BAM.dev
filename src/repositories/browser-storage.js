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

  removeItem(key) {
    this.values.delete(key);
  }

  keys() {
    return [...this.values.keys()];
  }

  isPersistent() {
    return false;
  }
}

class ResilientBrowserStorage {
  constructor(primaryStorage) {
    this.primaryStorage = primaryStorage;
    this.fallbackStorage = new MemoryStorage();
    this.primaryReadAvailable = primaryStorage !== null;
    this.primaryWriteAvailable = primaryStorage !== null;
    this.memoryOnlyKeys = new Set();
    this.tombstones = new Set();
  }

  getItem(key) {
    if (this.tombstones.has(key)) return null;
    if (this.memoryOnlyKeys.has(key)) return this.fallbackStorage.getItem(key);

    if (this.primaryStorage && this.primaryReadAvailable) {
      try {
        const value = this.primaryStorage.getItem(key);
        if (value === null) this.fallbackStorage.removeItem(key);
        else this.fallbackStorage.setItem(key, value);
        return value;
      } catch {
        this.primaryReadAvailable = false;
      }
    }
    return this.fallbackStorage.getItem(key);
  }

  setItem(key, value) {
    const stringValue = String(value);
    if (this.primaryStorage && this.primaryWriteAvailable) {
      try {
        this.primaryStorage.setItem(key, stringValue);
        this.fallbackStorage.setItem(key, stringValue);
        this.memoryOnlyKeys.delete(key);
        this.tombstones.delete(key);
        return;
      } catch {
        this.primaryWriteAvailable = false;
      }
    }
    this.fallbackStorage.setItem(key, stringValue);
    this.memoryOnlyKeys.add(key);
    this.tombstones.delete(key);
  }

  removeItem(key) {
    if (this.primaryStorage && this.primaryWriteAvailable) {
      try {
        this.primaryStorage.removeItem(key);
        this.fallbackStorage.removeItem(key);
        this.memoryOnlyKeys.delete(key);
        this.tombstones.delete(key);
        return;
      } catch {
        this.primaryWriteAvailable = false;
      }
    }
    this.fallbackStorage.removeItem(key);
    this.memoryOnlyKeys.delete(key);
    if (this.primaryStorage) this.tombstones.add(key);
  }

  keys() {
    const keys = new Set(this.fallbackStorage.keys());
    if (this.primaryStorage && this.primaryReadAvailable) {
      try {
        if (
          !Number.isSafeInteger(this.primaryStorage.length) ||
          this.primaryStorage.length < 0 ||
          typeof this.primaryStorage.key !== "function"
        ) {
          return [...keys].filter((key) => !this.tombstones.has(key));
        }
        for (let index = 0; index < this.primaryStorage.length; index += 1) {
          const key = this.primaryStorage.key(index);
          if (typeof key === "string") keys.add(key);
        }
      } catch {
        // 키 열거 실패만으로 읽기·쓰기까지 포기하지 않습니다. manifest를
        // 읽을 수 있는 저장소는 fallback 키와 getItem으로 레코드를 복구합니다.
      }
    }
    return [...keys].filter((key) => !this.tombstones.has(key));
  }

  isPersistent() {
    return Boolean(
      this.primaryStorage &&
        this.primaryReadAvailable &&
        this.primaryWriteAvailable,
    );
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
