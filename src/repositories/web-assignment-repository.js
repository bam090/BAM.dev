export const WEB_ASSIGNMENT_STORAGE_PREFIX = 'bam.dev.web-assignments.v1.records.';
const STATUSES = new Set(['not_started', 'in_progress', 'self_completed']);

function storageKey(id, revision) {
  if (!/^web-assignment-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !Number.isSafeInteger(revision) || revision < 1) {
    throw new Error('과제 ID와 revision을 확인하세요.');
  }
  return `${WEB_ASSIGNMENT_STORAGE_PREFIX}${id}.${revision}`;
}
function validateInput(value) {
  if (!value || !STATUSES.has(value.status) || typeof value.reflection !== 'string' || value.reflection.length > 10000
      || !Array.isArray(value.checklist) || value.checklist.length > 100 || !value.checklist.every((item) => typeof item === 'boolean')) {
    throw new Error('진행 상태와 회고 입력을 확인하세요.');
  }
}
function browserStorage() {
  try { return globalThis.window?.localStorage ?? null; } catch { return null; }
}

// No fallback: a failed persistent write must not acknowledge a saved report.
export class LocalStorageWebAssignmentRepository {
  constructor(storage = browserStorage()) { this.storage = storage; }
  getPersistenceStatus() { return { isPersistent: Boolean(this.storage) }; }
  getProgress(id, revision) {
    const key = storageKey(id, revision);
    if (!this.storage) throw new Error('브라우저 저장소에 접근할 수 없습니다.');
    const raw = this.storage.getItem(key);
    if (raw === null) return null;
    const record = JSON.parse(raw);
    validateInput(record);
    if (record.assignmentId !== id || record.revision !== revision || typeof record.updatedAt !== 'string'
      || !Number.isFinite(Date.parse(record.updatedAt))) throw new Error('저장된 진행 기록을 읽을 수 없습니다.');
    return record;
  }
  saveProgress(id, revision, input) {
    const key = storageKey(id, revision);
    validateInput(input);
    // Re-read before writing so a blocked/corrupt record is never silently replaced.
    this.getProgress(id, revision);
    const record = { assignmentId: id, revision, status: input.status, reflection: input.reflection,
      checklist: [...input.checklist], updatedAt: new Date().toISOString() };
    this.storage.setItem(key, JSON.stringify(record));
    return record;
  }
}
