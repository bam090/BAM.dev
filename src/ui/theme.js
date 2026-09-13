import { createBrowserStorage } from "../repositories/browser-storage.js";
import { isThemePreference, LocalStorageThemePreferenceRepository } from "../repositories/theme-preference-repository.js";
import { escapeHtml } from "./markdown.js";

export function resolveTheme(preference, prefersDark = false) {
  return isThemePreference(preference) ? preference : prefersDark ? "dark" : "light";
}

export function renderThemeControls({ theme = "light", notice = "" } = {}) {
  return `<div class="theme-preference">
    <div class="theme-choices" role="group" aria-label="화면 밝기">
      <button type="button" data-theme-choice="light" aria-pressed="${theme === "light"}">밝게</button>
      <button type="button" data-theme-choice="dark" aria-pressed="${theme === "dark"}">어둡게</button>
    </div>
    <p class="theme-notice" data-theme-notice role="status"${notice ? "" : " hidden"}>${escapeHtml(notice)}</p>
  </div>`;
}

export function createThemeController({
  browserWindow = globalThis.window,
  document = globalThis.document,
  root = document,
  repository = new LocalStorageThemePreferenceRepository(createBrowserStorage(browserWindow)),
} = {}) {
  const media = browserWindow?.matchMedia?.("(prefers-color-scheme: dark)");
  let preference = repository.read();
  let theme = resolveTheme(preference, media?.matches);
  let notice = "";

  function applyTheme() {
    if (document?.documentElement) document.documentElement.dataset.theme = theme;
    root?.querySelectorAll?.("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
    root?.querySelectorAll?.("[data-theme-notice]").forEach((message) => {
      message.textContent = notice;
      message.hidden = !notice;
    });
  }

  media?.addEventListener?.("change", (event) => {
    if (preference !== null) return;
    theme = resolveTheme(null, event.matches);
    applyTheme();
  });
  applyTheme();

  return {
    getState: () => ({ theme, notice }),
    setTheme(nextTheme) {
      if (!isThemePreference(nextTheme)) throw new TypeError("화면 테마가 올바르지 않습니다.");
      preference = nextTheme;
      theme = nextTheme;
      const result = repository.save(nextTheme);
      notice = result.persistent ? "" : "화면 색상은 바뀌었지만 저장하지 못했어요. 이 창에서만 유지됩니다.";
      // Keep the existing lesson, draft, dialog and focus intact when colors change.
      applyTheme();
      return { theme, notice };
    },
  };
}
