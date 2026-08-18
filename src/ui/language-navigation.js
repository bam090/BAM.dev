import { getLessonsForLanguage } from "../core/content.js";
import { buildLessonHash } from "../core/navigation.js";
import { escapeHtml } from "./markdown.js";

const LANGUAGE_STATUS_LABELS = Object.freeze({
  available: "정식 과정",
  sample: "샘플",
  planned: "준비 중",
});

export function renderLanguageNavigation({ curriculum, currentLanguageId }) {
  const languages = Array.isArray(curriculum?.languages) ? curriculum.languages : [];

  return `
    <nav class="language-nav" aria-label="언어 선택">
      <p class="nav-label">언어</p>
      <ul>
        ${languages
          .map((language) => {
            const firstLesson = getLessonsForLanguage(curriculum, language.id)[0] ?? null;
            const isCurrent = language.id === currentLanguageId;
            const isNavigable = language.status !== "planned" && firstLesson !== null;
            const statusLabel = LANGUAGE_STATUS_LABELS[language.status] ?? "준비 중";
            const content = `
              <span class="language-nav-badge language-nav-badge--${escapeHtml(language.accent)}" aria-hidden="true">${escapeHtml(language.shortName)}</span>
              <span class="language-nav-copy">
                <strong>${escapeHtml(language.name)}</strong>
                <small>${escapeHtml(statusLabel)}</small>
              </span>
            `;

            if (!isNavigable) {
              return `<li><span class="language-nav-link is-disabled" aria-disabled="true">${content}</span></li>`;
            }

            return `
              <li>
                <a class="language-nav-link${isCurrent ? " is-current" : ""}" href="${buildLessonHash(firstLesson.languageId, firstLesson.slug)}"${isCurrent ? ' aria-current="true"' : ""}>
                  ${content}
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
    </nav>
  `;
}
