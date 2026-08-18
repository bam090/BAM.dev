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
  }

  getItem(key) {
    if (this.primaryStorage) {
      try {
        const value = this.primaryStorage.getItem(key);
        if (value === null) this.fallbackStorage.removeItem(key);
        else this.fallbackStorage.setItem(key, value);
        return value;
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
        this.fallbackStorage.setItem(key, value);
        return;
      } catch {
        this.primaryStorage = null;
      }
    }
    this.fallbackStorage.setItem(key, value);
  }

  removeItem(key) {
    if (this.primaryStorage) {
      try {
        this.primaryStorage.removeItem(key);
        this.fallbackStorage.removeItem(key);
        return;
      } catch {
        this.primaryStorage = null;
      }
    }
    this.fallbackStorage.removeItem(key);
  }

  keys() {
    if (this.primaryStorage) {
      try {
        if (
          !Number.isSafeInteger(this.primaryStorage.length) ||
          this.primaryStorage.length < 0 ||
          typeof this.primaryStorage.key !== "function"
        ) {
          return this.fallbackStorage.keys();
        }
        const keys = [];
        for (let index = 0; index < this.primaryStorage.length; index += 1) {
          const key = this.primaryStorage.key(index);
          if (typeof key === "string") keys.push(key);
        }
        return keys;
      } catch {
        // 키 열거 실패만으로 읽기·쓰기까지 포기하지 않습니다. manifest를
        // 읽을 수 있는 저장소는 fallback 키와 getItem으로 레코드를 복구합니다.
        return this.fallbackStorage.keys();
      }
    }
    return this.fallbackStorage.keys();
  }

  isPersistent() {
    return this.primaryStorage !== null;
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
