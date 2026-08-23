import { getLessonsForCourse } from "../core/content.js";
import { buildLessonHash } from "../core/navigation.js";
import { escapeHtml } from "./markdown.js";

const STATUS_LABELS = Object.freeze({
  available: "정식 과정",
  sample: "샘플",
  planned: "준비 중",
});

function renderCourseItem({ curriculum, course, category, currentCourseId }) {
  const firstLesson = getLessonsForCourse(curriculum, course.id)[0] ?? null;
  const isCurrent = course.id === currentCourseId;
  const isNavigable =
    category.status !== "planned" && course.status !== "planned" && firstLesson !== null;
  const status = category.status === "planned" ? "planned" : course.status;
  const statusLabel = STATUS_LABELS[status] ?? "준비 중";
  const content = `
    <span class="language-nav-badge language-nav-badge--${escapeHtml(course.accent)}" aria-hidden="true">${escapeHtml(course.shortName)}</span>
    <span class="language-nav-copy">
      <strong>${escapeHtml(course.name)}</strong>
      <small>${escapeHtml(statusLabel)}</small>
    </span>
  `;

  if (!isNavigable) {
    return `<li><span class="language-nav-link is-disabled" aria-disabled="true">${content}</span></li>`;
  }

  return `
    <li>
      <a class="language-nav-link${isCurrent ? " is-current" : ""}" href="${buildLessonHash(firstLesson.courseId, firstLesson.slug)}"${isCurrent ? ' aria-current="true"' : ""}>
        ${content}
      </a>
    </li>
  `;
}

export function renderCourseNavigation({ curriculum, currentCourseId }) {
  const categories = Array.isArray(curriculum?.categories) ? curriculum.categories : [];
  const courses = Array.isArray(curriculum?.courses) ? curriculum.courses : [];

  return `
    <nav class="language-nav" aria-label="과정 선택">
      <p class="nav-label">과정</p>
      ${categories
        .map((category) => {
          const categoryCourses = courses.filter((course) => course.categoryId === category.id);
          const categoryStatus = STATUS_LABELS[category.status] ?? "준비 중";
          return `
            <section class="course-category" aria-label="${escapeHtml(category.name)}">
              <p class="course-category-title"><strong>${escapeHtml(category.name)}</strong>${category.status === "planned" ? `<small>${escapeHtml(categoryStatus)}</small>` : ""}</p>
              ${categoryCourses.length > 0
                ? `<ul>${categoryCourses
                    .map((course) =>
                      renderCourseItem({ curriculum, course, category, currentCourseId }),
                    )
                    .join("")}</ul>`
                : `<p class="course-category-empty">${escapeHtml(categoryStatus)}</p>`}
            </section>
          `;
        })
        .join("")}
    </nav>
  `;
}

export function renderLanguageNavigation({
  curriculum,
  currentLanguageId,
  currentCourseId = null,
}) {
  return renderCourseNavigation({
    curriculum,
    currentCourseId:
      currentCourseId ??
      (curriculum?.courses ?? []).find((course) => course.id === currentLanguageId)?.id ??
      null,
  });
}
