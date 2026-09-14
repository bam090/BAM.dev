export const THEME_PREFERENCE_STORAGE_KEY = "bam.dev.theme.v1";

export function isThemePreference(value) {
  return value === "light" || value === "dark";
}

export class LocalStorageThemePreferenceRepository {
  constructor(storage) {
    this.storage = storage;
  }

  read() {
    try {
      const value = this.storage.getItem(THEME_PREFERENCE_STORAGE_KEY);
      return isThemePreference(value) ? value : null;
    } catch {
      return null;
    }
  }

  save(theme) {
    if (!isThemePreference(theme)) throw new TypeError("화면 테마가 올바르지 않습니다.");
    try {
      this.storage.setItem(THEME_PREFERENCE_STORAGE_KEY, theme);
      return { persistent: this.storage.isPersistent?.() !== false };
    } catch {
      return { persistent: false };
    }
  }
}
