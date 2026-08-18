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
