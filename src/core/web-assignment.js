const ASSIGNMENT_ID = /^web-assignment-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT_FIELDS = ['title', 'summary', 'goal', 'sourceId', 'sourceVersion', 'sourceBranch', 'reflectionPrompt'];
const NOTE_FIELDS = ['prerequisiteNotes', 'startNotes', 'sourceNotes', 'offlineNotes'];

function requireValue(condition, field) {
  if (!condition) throw new Error(`외부 과제 데이터가 올바르지 않습니다: ${field}`);
}
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
function strings(value) { return Array.isArray(value) && value.length > 0 && value.every(text); }
function safePath(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(value)
    && value.split('/').every((part) => part !== '.' && part !== '..');
}

export function validateWebAssignmentCollection(collection, curriculum) {
  requireValue(collection?.schemaVersion === 1 && Array.isArray(collection.assignments), 'schemaVersion/assignments');
  const ids = new Set();
  const lessons = new Map((curriculum?.lessons ?? []).map((lesson) => [lesson.id, lesson]));
  for (const assignment of collection.assignments) {
    requireValue(assignment && ASSIGNMENT_ID.test(assignment.id) && !ids.has(assignment.id), 'id');
    ids.add(assignment.id);
    requireValue(Number.isSafeInteger(assignment.revision) && assignment.revision > 0, 'revision');
    requireValue(assignment.kind === 'external-git' && assignment.delivery === 'local-bundle', 'kind/delivery');
    for (const field of TEXT_FIELDS) requireValue(text(assignment[field]), field);
    for (const field of NOTE_FIELDS) requireValue(strings(assignment[field]), field);
    requireValue(/^[a-f0-9]{40}$/.test(assignment.sourceCommit), 'sourceCommit');
    requireValue(safePath(assignment.readmePath), 'readmePath');
    requireValue(strings(assignment.targetFiles) && assignment.targetFiles.every(safePath), 'targetFiles');
    requireValue(strings(assignment.lessonIds) && new Set(assignment.lessonIds).size === assignment.lessonIds.length
      && assignment.lessonIds.every((id) => lessons.has(id)), 'lessonIds');
    const concepts = new Set(assignment.lessonIds.flatMap((id) => lessons.get(id).conceptIds ?? []));
    requireValue(strings(assignment.conceptIds) && assignment.conceptIds.every((id) => concepts.has(id)), 'conceptIds');
    const bundle = assignment.bundle;
    for (const [field, extension] of [['path', '.zip'], ['manifestPath', '.manifest.json']]) {
      requireValue(safePath(bundle?.[field]) && bundle[field].startsWith('content/web-assignments/assets/')
        && bundle[field].endsWith(extension), `bundle.${field}`);
    }
    requireValue(/^[a-f0-9]{64}$/.test(bundle.sha256), 'bundle.sha256');
    requireValue(typeof bundle.prefix === 'string' && bundle.prefix.endsWith('/') && safePath(bundle.prefix.slice(0, -1)), 'bundle.prefix');
    requireValue(Number.isSafeInteger(bundle.fileCount) && bundle.fileCount > 0, 'bundle.fileCount');
    requireValue(assignment.toolchain && ['java', 'springBoot', 'gradle', 'dependencyManagement', 'python']
      .every((key) => text(assignment.toolchain[key])), 'toolchain');
    const verification = assignment.publicVerification;
    requireValue(text(verification?.command) && strings(verification.notes) && strings(verification.manualChecks)
      && verification.manualChecks.length <= 100, 'publicVerification');
    requireValue(/^http:\/\/(?:localhost|127\.0\.0\.1):\d{1,5}$/.test(verification.baseUrl), 'publicVerification.baseUrl');
    requireValue(assignment.availability?.status === 'execution-verification-pending'
      && text(assignment.availability.label) && strings(assignment.availability.notes), 'availability');
  }
  return collection;
}

export async function loadWebAssignmentCollection(curriculum, { fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl('./content/web-assignments/index.json');
  if (!response.ok) throw new Error('외부 과제 목록을 불러오지 못했습니다.');
  return validateWebAssignmentCollection(await response.json(), curriculum);
}
export function findWebAssignmentById(collection, id) {
  return collection?.assignments?.find((assignment) => assignment.id === id) ?? null;
}
export function buildWebAssignmentListHash() { return '#/web-assignments'; }
export function buildWebAssignmentHash(id) {
  if (!ASSIGNMENT_ID.test(id)) throw new Error('외부 과제 ID가 올바르지 않습니다.');
  return `${buildWebAssignmentListHash()}/${id}`;
}
export function parseWebAssignmentHash(hash) {
  if (/^#\/web-assignments\/?$/.test(hash)) return { kind: 'list' };
  const match = /^#\/web-assignments\/([^/]+)\/?$/.exec(hash);
  return match && ASSIGNMENT_ID.test(match[1]) ? { kind: 'assignment', id: match[1] } : null;
}
