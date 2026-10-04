import assert from "node:assert/strict";
import test from "node:test";
import { LocalStorageWebAssignmentRepository } from "../src/repositories/web-assignment-repository.js";

const id = "web-assignment-study-meetup-pin";
const key = (revision = 1) => `bam.dev.web-assignments.v1.records.${id}.${revision}`;
const progress = (reflection = "요청의 ID로 글의 상태를 바꿨습니다.") => ({ status: "in_progress", reflection, checklist: [true, false, false, true] });
function createStorage() {
  const values = new Map();
  return { values, getItem: (name) => values.get(name) ?? null, setItem: (name, value) => values.set(name, value) };
}

test("외부 자기 보고는 ID/revision별 키에만 저장하고 기존 기록과 다른 revision을 보존한다", () => {
  const storage = createStorage();
  storage.setItem("bam.dev.progress.v1", "old progress");
  storage.setItem("bam.dev.web-projects.v1", "old project");
  const repository = new LocalStorageWebAssignmentRepository(storage);
  assert.equal(repository.getProgress(id, 1), null);
  const saved = repository.saveProgress(id, 1, progress());
  assert.equal(saved.assignmentId, id);
  assert.equal(saved.revision, 1);
  assert.equal(saved.status, "in_progress");
  assert.ok(Number.isFinite(Date.parse(saved.updatedAt)));
  assert.deepEqual(JSON.parse(storage.getItem(key())), saved);
  assert.equal(repository.getProgress(id, 2), null);
  repository.saveProgress(id, 2, { ...progress("다음 버전"), status: "self_completed" });
  assert.equal(repository.getProgress(id, 1).reflection, progress().reflection);
  assert.equal(repository.getProgress(id, 2).status, "self_completed");
  assert.equal(storage.getItem("bam.dev.progress.v1"), "old progress");
  assert.equal(storage.getItem("bam.dev.web-projects.v1"), "old project");
  assert.equal(storage.values.size, 4);
});

test("저장된 checklist와 회고는 입력·조회 객체의 이후 수정에 영향받지 않는다", () => {
  const storage = createStorage();
  const repository = new LocalStorageWebAssignmentRepository(storage);
  const input = progress();
  repository.saveProgress(id, 1, input);
  input.checklist[0] = false;
  input.reflection = "변경";
  const read = repository.getProgress(id, 1);
  assert.equal(read.checklist[0], true);
  assert.equal(read.reflection, progress().reflection);
  assert.deepEqual(Object.keys(read).sort(), ["assignmentId", "revision", "status", "reflection", "checklist", "updatedAt"].sort());
  assert.equal(Object.hasOwn(read, "passed"), false);
  assert.equal(Object.hasOwn(read, "score"), false);
});

test("쓰기 실패 시 기존 기록·입력을 보존하며 성공처럼 반환하지 않고 재시도한다", () => {
  const storage = createStorage();
  const repository = new LocalStorageWebAssignmentRepository(storage);
  repository.saveProgress(id, 1, progress("기존 회고"));
  const original = storage.getItem(key());
  const setItem = storage.setItem;
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  const input = progress("저장 실패한 새 회고");
  assert.throws(() => repository.saveProgress(id, 1, input));
  assert.equal(storage.getItem(key()), original);
  assert.equal(input.reflection, "저장 실패한 새 회고");
  storage.setItem = setItem;
  repository.saveProgress(id, 1, input);
  assert.equal(repository.getProgress(id, 1).reflection, input.reflection);
});

test("기록 읽기 실패와 손상은 빈 기록으로 덮어쓰지 않는다", () => {
  const storage = createStorage();
  const repository = new LocalStorageWebAssignmentRepository(storage);
  repository.saveProgress(id, 1, progress("보존"));
  const original = storage.getItem(key());
  const getItem = storage.getItem;
  storage.getItem = () => { throw new Error("SecurityError"); };
  assert.throws(() => repository.getProgress(id, 1));
  assert.throws(() => repository.saveProgress(id, 1, progress("덮어쓰기")));
  storage.getItem = getItem;
  assert.equal(storage.getItem(key()), original);
  storage.setItem(key(), "{broken");
  assert.throws(() => repository.getProgress(id, 1));
  assert.throws(() => repository.saveProgress(id, 1, progress()));
  assert.equal(storage.getItem(key()), "{broken");
});

test("저장 입력은 자기 보고 상태·boolean checklist·제한된 회고만 받는다", () => {
  const storage = createStorage();
  const repository = new LocalStorageWebAssignmentRepository(storage);
  for (const invalid of [{ status: "passed" }, { reflection: "x".repeat(10001) }, { checklist: ["true"] }, { checklist: Array(101).fill(false) }]) {
    assert.throws(() => repository.saveProgress(id, 1, { ...progress(), ...invalid }));
  }
  assert.throws(() => repository.saveProgress("../private", 1, progress()));
  assert.throws(() => repository.saveProgress(id, 0, progress()));
  assert.equal(storage.values.size, 0);
});

test("다른 과제·revision 또는 PASS로 변조된 저장 기록을 현재 자기 보고로 읽지 않는다", () => {
  const storage = createStorage();
  const repository = new LocalStorageWebAssignmentRepository(storage);
  const valid = repository.saveProgress(id, 1, progress());
  for (const changes of [{ assignmentId: "web-assignment-other" }, { revision: 2 }, { status: "passed" }, { checklist: [1] }, { updatedAt: "yesterday" }]) {
    const corrupted = JSON.stringify({ ...valid, ...changes });
    storage.setItem(key(), corrupted);
    assert.throws(() => repository.getProgress(id, 1));
    assert.throws(() => repository.saveProgress(id, 1, progress()));
    assert.equal(storage.getItem(key()), corrupted);
  }
});
