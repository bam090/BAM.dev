import {
  buildCodingTestHash,
  buildLessonHash,
  buildMyPageHash,
  buildQuestHash,
  buildReviewHash,
  buildWebProjectHash,
} from "../core/navigation.js";
import { getCurrentCompletedQuestIds } from "../repositories/progress-repository.js";
import { renderJavaBrowserPreparation } from "./java-browser-preparation-view.js";
import { escapeHtml } from "./markdown.js";

const OUTCOME_LABELS = Object.freeze({
  passed: "통과",
  wrong_answer: "재도전 필요",
  syntax_error: "문법 오류",
  runtime_error: "실행 오류",
  timeout: "시간 초과",
  output_limit: "출력 한도 초과",
  cancelled: "실행 취소",
  engine_error: "실행 도구 오류",
});

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectionValues(value) {
  if (value instanceof Map) return [...value.values()];
  if (Array.isArray(value)) return value;
  return value && typeof value === "object" ? [value] : [];
}

function safeOutcome(value) {
  return typeof value === "string" && Object.hasOwn(OUTCOME_LABELS, value)
    ? OUTCOME_LABELS[value]
    : "결과 확인 필요";
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "날짜 확인 불가";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderTime(value) {
  return `<time datetime="${escapeHtml(value)}">${escapeHtml(formatDate(value))}</time>`;
}

function mapContent(collections, field) {
  return new Map(
    collectionValues(collections)
      .flatMap((collection) => safeArray(collection?.[field]))
      .filter((item) => typeof item?.id === "string")
      .map((item) => [item.id, item]),
  );
}

function mapQuizQuestions(collections) {
  const questions = new Map();
  for (const collection of collectionValues(collections)) {
    if (typeof collection?.languageId !== "string") continue;
    for (const question of safeArray(collection.questions)) {
      if (typeof question?.id !== "string") continue;
      questions.set(question.id, {
        languageId: collection.languageId,
        question,
      });
    }
  }
  return questions;
}

function renderEmpty(message) {
  return `<p class="my-page-empty">${escapeHtml(message)}</p>`;
}

function getCurrentSolvedProblemIds(progress, problemById) {
  return new Set(
    safeArray(progress?.completedCodingTestProblems)
      .filter(
        (completion) =>
          problemById.get(completion?.problemId)?.revision ===
          completion?.problemRevision,
      )
      .map((completion) => completion.problemId),
  );
}

function buildRetryItems({
  progress,
  questionById,
  lessonById,
  courseById,
  questById,
  problemById,
  projectById,
  webProjectState,
  completedQuestIds,
  solvedProblemIds,
}) {
  const items = [];
  const incorrectQuestionIds = safeArray(progress?.incorrectQuestionIds);

  const quizRetryByLesson = new Map();
  for (const questionId of incorrectQuestionIds) {
    const entry = questionById.get(questionId);
    const lesson = lessonById.get(entry?.question?.lessonId);
    const course = courseById.get(lesson?.courseId ?? lesson?.languageId);
    if (!entry || !lesson || !course) continue;
    const key = `${entry.languageId}:${lesson.id}`;
    const retry = quizRetryByLesson.get(key) ?? {
      key: `quiz-${key}`,
      kind: "객관식",
      title: `${course.name} · ${lesson.title}`,
      count: 0,
      href: buildReviewHash(entry.languageId, lesson.id),
    };
    retry.count += 1;
    quizRetryByLesson.set(key, retry);
  }
  for (const retry of quizRetryByLesson.values()) {
    items.push({
      ...retry,
      detail: `저장된 오답 ${retry.count}개 · 이 주제에서 다시 풀어 보세요.`,
    });
  }

  const seenQuestIds = new Set();
  for (const attempt of [...safeArray(progress?.questAttempts)].reverse()) {
    if (typeof attempt?.questId !== "string") continue;
    const quest = questById.get(attempt.questId);
    if (!quest || quest.revision !== attempt.questRevision) continue;
    if (seenQuestIds.has(attempt.questId) || completedQuestIds.has(attempt.questId)) {
      continue;
    }
    seenQuestIds.add(attempt.questId);
    items.push({
      key: `quest-${quest.id}`,
      kind: "Code Quest",
      title: quest.title,
      detail: `${safeOutcome(attempt.outcome)} · 공개 테스트 ${attempt.passed}/${attempt.total} 통과`,
      href: buildQuestHash(attempt.languageId, quest.slug),
    });
  }

  const seenProblemIds = new Set();
  for (const submission of [...safeArray(progress?.codingTestSubmissions)].reverse()) {
    if (typeof submission?.problemId !== "string") continue;
    const problem = problemById.get(submission.problemId);
    if (!problem || problem.revision !== submission.problemRevision) continue;
    if (seenProblemIds.has(submission.problemId) || solvedProblemIds.has(submission.problemId)) {
      continue;
    }
    seenProblemIds.add(submission.problemId);
    items.push({
      key: `coding-test-${problem.id}`,
      kind: "코딩테스트",
      title: problem.title,
      detail: `${safeOutcome(submission.outcome)} · 공개 테스트 ${submission.passed}/${submission.total} 통과`,
      href: buildCodingTestHash(submission.languageId, problem.slug),
    });
  }

  const seenProjectIds = new Set();
  for (const submission of [...safeArray(webProjectState?.submissions)].reverse()) {
    if (typeof submission?.projectId !== "string") continue;
    const project = projectById.get(submission.projectId);
    if (!project || project.revision !== submission.projectRevision) continue;
    if (seenProjectIds.has(submission.projectId)) continue;
    seenProjectIds.add(submission.projectId);
    const score = submission.report?.provisionalScore;
    const maxPoints = submission.report?.maxPoints;
    if (
      submission.report?.isComplete === true &&
      Number.isSafeInteger(score) &&
      score === maxPoints
    ) {
      continue;
    }
    items.push({
      key: `web-project-${project.id}`,
      kind: "Web Project",
      title: project.title,
      detail: Number.isSafeInteger(score)
        ? `자가평가 포함 임시 점수 ${score}/${maxPoints}점`
        : "평가를 끝까지 완료하지 않았습니다.",
      href: buildWebProjectHash(project.slug),
    });
  }

  return items;
}

function buildRecentActivities({
  languageById,
  progress,
  questById,
  problemById,
  projectById,
  webProjectState,
}) {
  const activities = [];

  for (const attempt of safeArray(progress?.quizAttempts)) {
    if (typeof attempt?.completedAt !== "string") continue;
    const language = languageById.get(attempt.languageId);
    activities.push({
      key: attempt.id,
      kind: "객관식",
      title: language ? `${language.name} 복습` : "이전 객관식 복습",
      detail: `${attempt.score}/${attempt.total} 정답`,
      at: attempt.completedAt,
      href: language ? buildReviewHash(language.id) : null,
    });
  }

  for (const attempt of safeArray(progress?.questAttempts)) {
    if (typeof attempt?.completedAt !== "string") continue;
    const quest = questById.get(attempt.questId);
    const languageName = languageById.get(attempt.languageId)?.name ?? "이전";
    activities.push({
      key: attempt.id,
      kind: "Code Quest",
      title: quest?.title ?? `${languageName} Code Quest`,
      detail: quest
        ? `${quest.revision === attempt.questRevision ? "" : "이전 버전 기록 · "}${safeOutcome(attempt.outcome)} · ${attempt.passed}/${attempt.total} 통과`
        : "이전 버전 · 현재 미제공 실습",
      at: attempt.completedAt,
      href: quest ? buildQuestHash(attempt.languageId, quest.slug) : null,
    });
  }

  for (const submission of safeArray(progress?.codingTestSubmissions)) {
    if (typeof submission?.completedAt !== "string") continue;
    const problem = problemById.get(submission.problemId);
    const languageName = languageById.get(submission.languageId)?.name ?? "이전";
    activities.push({
      key: submission.id,
      kind: "코딩테스트",
      title: problem?.title ?? `${languageName} 코딩테스트`,
      detail: problem
        ? `${problem.revision === submission.problemRevision ? "" : "이전 버전 기록 · "}${safeOutcome(submission.outcome)} · ${submission.passed}/${submission.total} 통과`
        : "이전 버전 · 현재 미제공 실습",
      at: submission.completedAt,
      href: problem
        ? buildCodingTestHash(submission.languageId, problem.slug)
        : null,
    });
  }

  for (const submission of safeArray(webProjectState?.submissions)) {
    if (typeof submission?.recordedAt !== "string") continue;
    const project = projectById.get(submission.projectId);
    const score = submission.report?.provisionalScore;
    activities.push({
      key: submission.submissionId,
      kind: "Web Project",
      title: project?.title ?? "이전 Web Project",
      detail: project
        ? `${project.revision === submission.projectRevision ? "" : "이전 버전 기록 · "}${Number.isSafeInteger(score) ? `자가평가 포함 임시 점수 ${score}/${submission.report.maxPoints}점` : "제출 평가 미완료"}`
        : "이전 버전 · 현재 미제공 실습",
      at: submission.recordedAt,
      href: project ? buildWebProjectHash(project.slug) : null,
    });
  }

  return activities
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 10);
}

export function renderMyPageNavigationLink({
  href = buildMyPageHash(),
  isCurrent = false,
} = {}) {
  return `<a class="sidebar-utility-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href)}"${isCurrent ? ' aria-current="page"' : ""}>내 학습 기록</a>`;
}

export function renderMyPageView({
  curriculum = {},
  progress = {},
  quizCollections = [],
  codeQuestCollections = [],
  codingTestCollections = [],
  webProjectCollection = {},
  webProjectState = {},
  nickname = "",
  javaPreparationState = "unavailable",
  javaPreparationMessage = "",
  isPersistent = true,
  storageReadErrors = [],
} = {}) {
  const categories = safeArray(curriculum.categories);
  const availableCategoryIds = new Set(
    categories.filter((category) => category?.status !== "planned").map((category) => category.id),
  );
  const languages = safeArray(curriculum.languages).filter(
    (language) => language?.status !== "planned",
  );
  const languageById = new Map(languages.map((language) => [language.id, language]));
  const declaredCourses = safeArray(curriculum.courses);
  const courses = declaredCourses.length > 0
    ? declaredCourses.filter(
        (course) =>
          course?.status !== "planned" &&
          languageById.has(course.languageId) &&
          (categories.length === 0 || availableCategoryIds.has(course.categoryId)),
      )
    : languages.map((language) => ({
        id: language.id,
        languageId: language.id,
        name: language.name,
        shortName: language.shortName,
        accent: language.accent,
      }));
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const allLessons = safeArray(curriculum.lessons);
  const allLessonById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));
  const lessons = allLessons.filter((lesson) => {
    const courseId = lesson?.courseId ?? lesson?.languageId;
    return courseById.has(courseId) && lesson?.archivedFromCatalog !== true;
  });
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const questionById = mapQuizQuestions(quizCollections);
  const questById = mapContent(codeQuestCollections, "quests");
  const problemById = mapContent(codingTestCollections, "problems");
  const projectById = mapContent(webProjectCollection, "projects");
  const completedLessonIds = new Set(safeArray(progress.completedLessonIds));
  const completedQuestIds = getCurrentCompletedQuestIds(progress, [...questById.values()]);
  const solvedProblemIds = getCurrentSolvedProblemIds(progress, problemById);
  const currentWebProjectSubmissions = safeArray(webProjectState.submissions).filter(
    (submission) =>
      projectById.get(submission?.projectId)?.revision === submission?.projectRevision,
  );
  const lastLesson =
    lessonById.get(progress.lastLessonId) ??
    lessons.find((lesson) => (lesson.courseId ?? lesson.languageId) === "javascript") ??
    lessons[0] ??
    null;

  const retryItems = buildRetryItems({
    progress,
    questionById,
    lessonById: allLessonById,
    courseById,
    questById,
    problemById,
    projectById,
    webProjectState,
    completedQuestIds,
    solvedProblemIds,
  });
  const activities = buildRecentActivities({
    languageById,
    progress,
    questById,
    problemById,
    projectById,
    webProjectState,
  });
  const archivedCompletedRecords = [...completedLessonIds].flatMap((lessonId) => {
    if (lessonById.has(lessonId)) return [];
    const lesson = allLessonById.get(lessonId);
    const courseId = lesson?.courseId ?? lesson?.languageId;
    const isAvailableArchive =
      lesson?.archivedFromCatalog === true && courseById.has(courseId);
    return [{
      key: lessonId,
      kind: isAvailableArchive ? "보관 문서" : "이전 문서",
      title: lesson?.title ?? "이름을 확인할 수 없는 이전 학습문서",
      detail: isAvailableArchive
        ? "완료 기록 · 현재 진도에 포함되지 않음"
        : "이전 문서 기록 · 현재 미제공",
      href: isAvailableArchive ? buildLessonHash(courseId, lesson.slug) : null,
    }];
  });
  const hasStorageReadError = safeArray(storageReadErrors).length > 0;
  const progressReadFailed = safeArray(storageReadErrors).includes("progress");
  const webProjectReadFailed = safeArray(storageReadErrors).includes("web-project");

  const courseProgress = courses
    .map((course) => {
      const courseLessons = lessons.filter(
        (lesson) => (lesson.courseId ?? lesson.languageId) === course.id,
      );
      if (courseLessons.length === 0) return "";
      const completed = courseLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
      const percent = Math.round((completed / courseLessons.length) * 100);
      const destination =
        courseLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ??
        courseLessons.at(-1);
      const language = languageById.get(course.languageId) ?? {};
      return `
        <li class="my-page-language-item">
          <div>
            <span class="language-badge language-badge--${escapeHtml(course.accent ?? language.accent ?? "")}">${escapeHtml(course.shortName ?? language.shortName ?? "")}</span>
            <span><strong>${escapeHtml(course.name)}</strong><small>${completed}/${courseLessons.length}개 문서 완료</small></span>
            <a href="${buildLessonHash(destination.courseId ?? destination.languageId, destination.slug)}">${completed === courseLessons.length ? "다시 보기" : "이어 학습"}</a>
          </div>
          <div class="progress-track" role="progressbar" aria-label="${escapeHtml(course.name)} 교안 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
            <span style="width: ${percent}%"></span>
          </div>
        </li>
      `;
    })
    .join("");

  const retryList = retryItems
    .map(
      (item) => `
        <li>
          <a class="my-page-record-link" href="${escapeHtml(item.href)}">
            <span><small>${escapeHtml(item.kind)}</small><strong>${escapeHtml(item.title)}</strong><em>${escapeHtml(item.detail)}</em></span>
            <b aria-hidden="true">→</b>
          </a>
        </li>
      `,
    )
    .join("");

  const activityList = activities
    .map((activity) => {
      const content = `<span><small>${escapeHtml(activity.kind)}</small><strong>${escapeHtml(activity.title)}</strong><em>${escapeHtml(activity.detail)}</em></span>${renderTime(activity.at)}`;
      return `<li>${activity.href
        ? `<a class="my-page-record-link" href="${escapeHtml(activity.href)}">${content}</a>`
        : `<div class="my-page-record-link is-unavailable">${content}</div>`}</li>`;
    })
    .join("");

  const archivedCompletedList = archivedCompletedRecords
    .map((record) => {
      const content = `<span><small>${escapeHtml(record.kind)}</small><strong>${escapeHtml(record.title)}</strong><em>${escapeHtml(record.detail)}</em></span>`;
      return `<li>${record.href
        ? `<a class="my-page-record-link" href="${escapeHtml(record.href)}">${content}<b aria-hidden="true">→</b></a>`
        : `<div class="my-page-record-link is-unavailable">${content}</div>`}</li>`;
    })
    .join("");

  const storageTitle = hasStorageReadError
    ? "저장된 기록을 읽지 못했습니다"
    : isPersistent
      ? "이 브라우저에 저장 중"
      : "현재 탭에만 임시 저장 중";
  const storageDescription = hasStorageReadError
    ? "현재 브라우저의 일부 학습 기록을 불러오지 못했습니다. 저장 상태를 확인한 뒤 다시 열어 주세요."
    : isPersistent
      ? "현재 기록은 이 브라우저에 보관됩니다."
      : "브라우저 영구 저장을 사용할 수 없어 탭을 닫으면 기록이 사라질 수 있습니다.";
  const storageBadge = hasStorageReadError
    ? "읽기 오류"
    : isPersistent
      ? "로컬 기록"
      : "저장 확인 필요";

  return `
    <main class="main-area service-main my-page" id="lesson-content" tabindex="-1" aria-labelledby="my-page-title">
      <header class="catalog-header my-page-header">
        <p class="eyebrow">내 학습 기록</p>
        <h1 id="my-page-title">마이페이지</h1>
        <p>완료한 학습과 최근 제출, 다시 도전할 항목을 이 브라우저의 실제 기록에서 확인합니다.</p>
        <p class="my-page-greeting" data-profile-greeting>안녕하세요, ${escapeHtml(nickname || "학습자")}님.</p>
        ${lastLesson ? `<a class="button button--primary my-page-continue" href="${buildLessonHash(lastLesson.courseId ?? lastLesson.languageId, lastLesson.slug)}">${progress.lastLessonId && lessonById.has(progress.lastLessonId) ? "최근 교안 이어 학습" : "첫 교안 시작"}</a>` : ""}
      </header>

      <section class="my-page-panel my-page-profile" aria-labelledby="my-page-profile-title">
        <header><p class="eyebrow">이 브라우저의 호칭</p><h2 id="my-page-profile-title">나를 부를 이름</h2></header>
        <form data-profile-nickname-form>
          <label for="profile-nickname">호칭</label>
          <div class="my-page-profile-actions">
            <input id="profile-nickname" name="nickname" type="text" value="${escapeHtml(nickname)}" autocomplete="off" aria-describedby="profile-nickname-help profile-nickname-status">
            <button class="button button--secondary" type="submit">호칭 저장</button>
          </div>
          <p id="profile-nickname-help">앞뒤 공백을 제외하고 최대 20자까지 저장합니다. 비우면 기본 호칭인 학습자로 돌아갑니다.</p>
          <p id="profile-nickname-status" data-profile-nickname-status role="status" aria-live="polite"></p>
        </form>
      </section>

      ${renderJavaBrowserPreparation({ id: "my-page-java", state: javaPreparationState, message: javaPreparationMessage })}

      <section class="my-page-local-status${hasStorageReadError ? " is-error" : isPersistent ? "" : " is-warning"}" aria-labelledby="my-page-storage-title"${hasStorageReadError ? ' role="status"' : ""}>
        <div>
          <h2 id="my-page-storage-title">${storageTitle}</h2>
          <p>${storageDescription} 계정 로그인과 기기 간 동기화는 아직 연결하지 않았습니다.</p>
        </div>
        <span>${storageBadge}</span>
      </section>

      <dl class="my-page-summary" aria-label="학습 기록 요약">
        <div><dt>완료한 교안</dt><dd>${progressReadFailed ? "<span>확인 불가</span>" : `${lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length}<span>/${lessons.length}</span>`}</dd></div>
        <div><dt>저장된 오답</dt><dd>${progressReadFailed ? "<span>확인 불가</span>" : `${safeArray(progress.incorrectQuestionIds).length}<span>개</span>`}</dd></div>
        <div><dt>완료한 Quest</dt><dd>${progressReadFailed ? "<span>확인 불가</span>" : `${completedQuestIds.size}<span>/${questById.size}</span>`}</dd></div>
        <div><dt>푼 코딩테스트</dt><dd>${progressReadFailed ? "<span>확인 불가</span>" : `${solvedProblemIds.size}<span>/${problemById.size}</span>`}</dd></div>
        <div><dt>Web Project 제출</dt><dd>${webProjectReadFailed ? "<span>확인 불가</span>" : `${currentWebProjectSubmissions.length}<span>건</span>`}</dd></div>
      </dl>

      <div class="my-page-grid">
        <section class="my-page-panel" aria-labelledby="my-page-progress-title">
          <header><p class="eyebrow">과정별 진도</p><h2 id="my-page-progress-title">교안 학습</h2></header>
          ${progressReadFailed ? renderEmpty("교안 진도 기록을 불러오지 못했습니다.") : courseProgress ? `<ul class="my-page-language-list">${courseProgress}</ul>` : renderEmpty("현재 제공하는 교안이 없습니다.")}
        </section>

        <section class="my-page-panel" aria-labelledby="my-page-retry-title">
          <header><p class="eyebrow">다음 연습</p><h2 id="my-page-retry-title">재도전 대상</h2></header>
          ${retryList ? `<ul class="my-page-record-list">${retryList}</ul>` : progressReadFailed || webProjectReadFailed ? renderEmpty("일부 재도전 기록을 불러오지 못했습니다.") : renderEmpty("지금 저장된 재도전 대상이 없습니다.")}
        </section>

        <section class="my-page-panel my-page-panel--wide" aria-labelledby="my-page-activity-title">
          <header><p class="eyebrow">최대 10건</p><h2 id="my-page-activity-title">최근 학습 기록</h2></header>
          ${activityList ? `<ul class="my-page-record-list">${activityList}</ul>` : progressReadFailed || webProjectReadFailed ? renderEmpty("일부 풀이 또는 제출 기록을 불러오지 못했습니다.") : renderEmpty("아직 저장된 풀이 또는 제출 기록이 없습니다.")}
        </section>

        ${archivedCompletedList ? `<details class="my-page-panel my-page-panel--wide my-page-archived">
          <summary>보관된 학습 기록 ${archivedCompletedRecords.length}개</summary>
          <p>현재 진도에는 포함되지 않는 완료 기록입니다.</p>
          <ul class="my-page-record-list">${archivedCompletedList}</ul>
        </details>` : ""}
      </div>
    </main>
  `;
}
