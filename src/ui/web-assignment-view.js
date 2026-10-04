import { escapeHtml } from './markdown.js';
import { buildLessonHash } from '../core/navigation.js';
import { buildWebAssignmentHash } from '../core/web-assignment.js';

const STATUS_LABELS = { not_started: '시작 전', in_progress: '진행 중', self_completed: '직접 완료 표시' };
function list(items) { return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`; }
function notes(title, items) { return `<section><h2>${title}</h2>${list(items)}</section>`; }

export function renderWebAssignmentListView({ collection, error = '' } = {}) {
  return `<main class="web-project-list-page web-assignment-page" id="lesson-content" tabindex="-1" aria-labelledby="web-assignment-title">
    <header class="web-project-list-header"><p class="eyebrow">외부 폴더에서 직접 구현</p><h1 id="web-assignment-title" tabindex="-1">외부 웹과제</h1>
    <p>고정 시작 자료를 내려받아 README를 읽고 구현하세요. 실행·오프라인 검증은 아직 완료되지 않았습니다.</p>
    <a href="#/web-projects">인앱 Web Project로 이동</a></header>
    ${error ? `<p role="alert">${escapeHtml(error)}</p>` : ''}
    <section class="web-project-list" aria-label="외부 웹과제 목록">${(collection?.assignments ?? []).map((assignment) => `
      <article class="web-project-card"><h2><a href="${buildWebAssignmentHash(assignment.id)}">${escapeHtml(assignment.title)}</a></h2>
      <p>${escapeHtml(assignment.summary)}</p><p>${escapeHtml(assignment.availability.label)}</p>
      <p>${escapeHtml(assignment.sourceVersion)} · revision ${assignment.revision}</p></article>`).join('') || '<p>외부 과제 자료가 없습니다.</p>'}</section></main>`;
}

export function renderWebAssignmentView({ assignment, curriculum, progress = null, error = '', readFailed = false }) {
  const checklist = progress?.checklist ?? [];
  const lessonLinks = assignment.lessonIds.map((id) => {
    const lesson = curriculum.lessons.find((item) => item.id === id);
    return `<li><a href="${escapeHtml(buildLessonHash(lesson.courseId, lesson.slug))}">${escapeHtml(lesson.title)}</a></li>`;
  }).join('');
  return `<main class="web-project-list-page web-assignment-page" id="lesson-content" tabindex="-1" aria-labelledby="web-assignment-title">
    <header class="web-project-list-header"><a href="#/web-assignments">외부 웹과제 목록</a><h1 id="web-assignment-title" tabindex="-1">${escapeHtml(assignment.title)}</h1><p>${escapeHtml(assignment.goal)}</p></header>
    <div class="web-assignment-details">
    <section aria-labelledby="web-assignment-availability"><h2 id="web-assignment-availability">${escapeHtml(assignment.availability.label)}</h2>${list(assignment.availability.notes)}</section>
    <section><h2>선수 개념 확인</h2>${list(assignment.prerequisiteNotes)}<ul>${lessonLinks}</ul></section>
    <section><h2>고정 시작 자료</h2><p><a href="./${escapeHtml(assignment.bundle.path)}" download>시작 자료 ZIP 내려받기</a> · <a href="./${escapeHtml(assignment.bundle.manifestPath)}" download>파일 manifest 내려받기</a></p>
    <dl><dt>원본</dt><dd>${escapeHtml(assignment.sourceId)} · ${escapeHtml(assignment.sourceVersion)} · revision ${assignment.revision}</dd>
    <dt>고정 commit</dt><dd><code>${escapeHtml(assignment.sourceCommit)}</code></dd><dt>참고 브랜치</dt><dd>${escapeHtml(assignment.sourceBranch)}</dd>
    <dt>루트 안내</dt><dd>${escapeHtml(assignment.readmePath)}</dd><dt>ZIP SHA-256</dt><dd><code>${escapeHtml(assignment.bundle.sha256)}</code></dd></dl>${list(assignment.startNotes)}</section>
    ${notes('원본과 AI 제공 범위', assignment.sourceNotes)}${notes('직접 구현할 파일', assignment.targetFiles)}
    <section><h2>필요한 도구</h2><dl>${Object.entries(assignment.toolchain).map(([name, version]) => `<dt>${escapeHtml(name)}</dt><dd>${escapeHtml(version)}</dd>`).join('')}</dl></section>
    <section><h2>공개 검증 안내</h2><p>외부 과제 폴더에서 직접 실행: <code>${escapeHtml(assignment.publicVerification.command)}</code></p><p>대상 주소: <code>${escapeHtml(assignment.publicVerification.baseUrl)}</code></p>${list(assignment.publicVerification.notes)}</section>
    ${notes('오프라인 준비와 실행 한계', assignment.offlineNotes)}
    <section><h2>내 진행과 회고</h2><p>이 브라우저에 별도로 저장하는 자기 보고입니다. 직접 완료 표시와 확인표는 공개 검증 PASS나 자동 채점 결과가 아닙니다. 다른 revision의 기록은 유지됩니다.</p>
    <p>입력한 뒤 저장 버튼을 누르세요. 저장하지 않고 이동하면 입력이 사라집니다.</p>
    <form data-web-assignment-form>
    <label for="web-assignment-status">내 진행</label><select id="web-assignment-status" name="status">${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${(progress?.status ?? 'not_started') === value ? ' selected' : ''}>${label}</option>`).join('')}</select>
    <fieldset><legend>직접 확인한 항목</legend>${assignment.publicVerification.manualChecks.map((item, index) => `<label class="web-assignment-check"><input type="checkbox" name="checklist" value="${index}"${checklist[index] === true ? ' checked' : ''}><span>${escapeHtml(item)}</span></label>`).join('')}</fieldset>
    <label for="web-assignment-reflection">${escapeHtml(assignment.reflectionPrompt)}</label><textarea id="web-assignment-reflection" name="reflection" rows="6" maxlength="10000">${escapeHtml(progress?.reflection ?? '')}</textarea>
    <button type="submit"${readFailed ? ' disabled' : ''}>진행·회고 저장</button>
    ${readFailed ? '<button type="button" data-web-assignment-retry>기존 기록 다시 읽기</button>' : ''}
    <p role="status" aria-live="polite" data-web-assignment-save-status>${escapeHtml(error || (progress ? '저장된 자기 보고를 불러왔습니다.' : '아직 저장한 기록이 없습니다.'))}</p>
    </form></section></div></main>`;
}
