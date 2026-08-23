import {
  buildCodingTestHash,
  buildLessonHash,
  buildMyPageHash,
  buildQuestHash,
  buildReviewHash,
  buildWebProjectHash,
} from "../core/navigation.js";
import { getCurrentCompletedQuestIds } from "../repositories/progress-repository.js";
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
  languages,
  progress,
  questById,
  problemById,
  projectById,
  webProjectState,
  completedQuestIds,
  solvedProblemIds,
}) {
  const items = [];
  const incorrectQuestionIds = safeArray(progress?.incorrectQuestionIds);

  for (const language of languages) {
    const count = incorrectQuestionIds.filter((questionId) =>
      String(questionId).startsWith(`quiz-${language.id}-`),
    ).length;
    if (count === 0) continue;
    items.push({
      key: `quiz-${language.id}`,
      kind: "객관식",
      title: `${language.name} 복습`,
      detail: `저장된 오답 ${count}개 · 복습 화면에서 다시 풀어 보세요.`,
      href: buildReviewHash(language.id),
    });
  }

  const seenQuestIds = new Set();
  for (const attempt of [...safeArray(progress?.questAttempts)].reverse()) {
    if (typeof attempt?.questId !== "string") continue;
    const quest = questById.get(attempt.questId);
    if (!quest || quest.revision !== attempt.questRevision) continue;
    if (
      seenQuestIds.has(attempt.questId) ||
      completedQuestIds.has(attempt.questId)
    ) {
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
  for (const submission of [
    ...safeArray(progress?.codingTestSubmissions),
  ].reverse()) {
    if (typeof submission?.problemId !== "string") continue;
    const problem = problemById.get(submission.problemId);
    if (!problem || problem.revision !== submission.problemRevision) continue;
    if (
      seenProblemIds.has(submission.problemId) ||
      solvedProblemIds.has(submission.problemId)
    ) {
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
  for (const submission of [
    ...safeArray(webProjectState?.submissions),
  ].reverse()) {
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
    const language = languageById.get(attempt?.languageId);
    if (!language || typeof attempt?.completedAt !== "string") continue;
    activities.push({
      key: attempt.id,
      kind: "객관식",
      title: `${language.name} 복습`,
      detail: `${attempt.score}/${attempt.total} 정답`,
      at: attempt.completedAt,
      href: buildReviewHash(language.id),
    });
  }

  for (const attempt of safeArray(progress?.questAttempts)) {
    const quest = questById.get(attempt?.questId);
    if (!quest || typeof attempt?.completedAt !== "string") continue;
    activities.push({
      key: attempt.id,
      kind: "Code Quest",
      title: quest.title,
      detail: `${safeOutcome(attempt.outcome)} · ${attempt.passed}/${attempt.total} 통과`,
      at: attempt.completedAt,
      href: buildQuestHash(attempt.languageId, quest.slug),
    });
  }

  for (const submission of safeArray(progress?.codingTestSubmissions)) {
    const problem = problemById.get(submission?.problemId);
    if (!problem || typeof submission?.completedAt !== "string") continue;
    activities.push({
      key: submission.id,
      kind: "코딩테스트",
      title: problem.title,
      detail: `${safeOutcome(submission.outcome)} · ${submission.passed}/${submission.total} 통과`,
      at: submission.completedAt,
      href: buildCodingTestHash(submission.languageId, problem.slug),
    });
  }

  for (const submission of safeArray(webProjectState?.submissions)) {
    const project = projectById.get(submission?.projectId);
    if (!project || typeof submission?.recordedAt !== "string") continue;
    const score = submission.report?.provisionalScore;
    activities.push({
      key: submission.submissionId,
      kind: "Web Project",
      title: project.title,
      detail: Number.isSafeInteger(score)
        ? `자가평가 포함 임시 점수 ${score}/${submission.report.maxPoints}점`
        : "제출 평가 미완료",
      at: submission.recordedAt,
      href: buildWebProjectHash(project.slug),
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
  return `
    <nav class="my-page-nav" aria-label="마이페이지">
      <p class="nav-label">내 기록</p>
      <a class="my-page-nav-link${isCurrent ? " is-current" : ""}" href="${escapeHtml(href)}"${isCurrent ? ' aria-current="page"' : ""}>
        <span class="my-page-nav-icon" aria-hidden="true">ME</span>
        <span><strong>마이페이지</strong><small>학습 기록과 재도전</small></span>
      </a>
    </nav>
  `;
}

export function renderMyPageView({
  curriculum = {},
  progress = {},
  codeQuestCollections = [],
  codingTestCollections = [],
  webProjectCollection = {},
  webProjectState = {},
  isPersistent = true,
} = {}) {
  const languages = safeArray(curriculum.languages).filter(
    (language) => language?.status === "available",
  );
  const languageById = new Map(languages.map((language) => [language.id, language]));
  const lessons = safeArray(curriculum.lessons).filter((lesson) =>
    languageById.has(lesson?.languageId),
  );
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const questById = mapContent(codeQuestCollections, "quests");
  const problemById = mapContent(codingTestCollections, "problems");
  const projectById = mapContent(webProjectCollection, "projects");
  const completedLessonIds = new Set(safeArray(progress.completedLessonIds));
  const completedQuestIds = getCurrentCompletedQuestIds(
    progress,
    [...questById.values()],
  );
  const solvedProblemIds = getCurrentSolvedProblemIds(progress, problemById);
  const currentWebProjectSubmissions = safeArray(webProjectState.submissions).filter(
    (submission) =>
      projectById.get(submission?.projectId)?.revision ===
      submission?.projectRevision,
  );
  const lastLesson = lessonById.get(progress.lastLessonId) ?? lessons[0] ?? null;

  const retryItems = buildRetryItems({
    languages,
    progress,
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

  const languageProgress = languages
    .map((language) => {
      const languageLessons = lessons.filter(
        (lesson) => lesson.languageId === language.id,
      );
      if (languageLessons.length === 0) return "";
      const completed = languageLessons.filter((lesson) =>
        completedLessonIds.has(lesson.id),
      ).length;
      const percent = Math.round((completed / languageLessons.length) * 100);
      const destination =
        languageLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ??
        languageLessons.at(-1);
      return `
        <li class="my-page-language-item">
          <div>
            <span class="language-badge language-badge--${escapeHtml(language.accent)}">${escapeHtml(language.shortName)}</span>
            <span><strong>${escapeHtml(language.name)}</strong><small>${completed}/${languageLessons.length}단원 완료</small></span>
            <a href="${buildLessonHash(language.id, destination.slug)}">${completed === languageLessons.length ? "다시 보기" : "이어 학습"}</a>
          </div>
          <div class="progress-track" role="progressbar" aria-label="${escapeHtml(language.name)} 교안 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
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
    .map(
      (activity) => `
        <li>
          <a class="my-page-record-link" href="${escapeHtml(activity.href)}">
            <span><small>${escapeHtml(activity.kind)}</small><strong>${escapeHtml(activity.title)}</strong><em>${escapeHtml(activity.detail)}</em></span>
            ${renderTime(activity.at)}
          </a>
        </li>
      `,
    )
    .join("");

  return `
    <main class="web-project-list-page my-page" id="lesson-content" tabindex="-1" aria-labelledby="my-page-title">
      <header class="web-project-list-header my-page-header">
        <p class="eyebrow">내 학습 기록</p>
        <h1 id="my-page-title">마이페이지</h1>
        <p>완료한 학습과 최근 제출, 다시 도전할 항목을 이 브라우저의 실제 기록에서 확인합니다.</p>
        ${
          lastLesson
            ? `<a class="button button--primary my-page-continue" href="${buildLessonHash(lastLesson.languageId, lastLesson.slug)}">${progress.lastLessonId ? "최근 교안 이어 학습" : "첫 교안 시작"}</a>`
            : ""
        }
      </header>

      <section class="my-page-local-status${isPersistent ? "" : " is-warning"}" aria-labelledby="my-page-storage-title">
        <div>
          <h2 id="my-page-storage-title">${isPersistent ? "이 브라우저에 저장 중" : "현재 탭에만 임시 저장 중"}</h2>
          <p>${isPersistent ? "현재 기록은 이 브라우저에 보관됩니다." : "브라우저 영구 저장을 사용할 수 없어 탭을 닫으면 기록이 사라질 수 있습니다."} 계정 로그인과 기기 간 동기화는 아직 연결하지 않았습니다.</p>
        </div>
        <span>${isPersistent ? "로컬 기록" : "저장 확인 필요"}</span>
      </section>

      <dl class="my-page-summary" aria-label="학습 기록 요약">
        <div><dt>완료한 교안</dt><dd>${lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length}<span>/${lessons.length}</span></dd></div>
        <div><dt>저장된 오답</dt><dd>${safeArray(progress.incorrectQuestionIds).length}<span>개</span></dd></div>
        <div><dt>완료한 Quest</dt><dd>${[...questById.keys()].filter((id) => completedQuestIds.has(id)).length}<span>/${questById.size}</span></dd></div>
        <div><dt>푼 코딩테스트</dt><dd>${solvedProblemIds.size}<span>/${problemById.size}</span></dd></div>
        <div><dt>Web Project 제출</dt><dd>${currentWebProjectSubmissions.length}<span>건</span></dd></div>
      </dl>

      <div class="my-page-grid">
        <section class="my-page-panel" aria-labelledby="my-page-progress-title">
          <header><p class="eyebrow">언어별 진도</p><h2 id="my-page-progress-title">교안 학습</h2></header>
          <ul class="my-page-language-list">${languageProgress}</ul>
        </section>

        <section class="my-page-panel" aria-labelledby="my-page-retry-title">
          <header><p class="eyebrow">다음 연습</p><h2 id="my-page-retry-title">재도전 대상</h2></header>
          ${retryList ? `<ul class="my-page-record-list">${retryList}</ul>` : renderEmpty("지금 저장된 재도전 대상이 없습니다.")}
        </section>

        <section class="my-page-panel my-page-panel--wide" aria-labelledby="my-page-activity-title">
          <header><p class="eyebrow">최대 10건</p><h2 id="my-page-activity-title">최근 학습 기록</h2></header>
          ${activityList ? `<ul class="my-page-record-list">${activityList}</ul>` : renderEmpty("아직 저장된 풀이 또는 제출 기록이 없습니다.")}
        </section>
      </div>
    </main>
  `;
}
