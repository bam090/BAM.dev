import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import test from "node:test";
import {
  validateWebAssignmentCollection,
  loadWebAssignmentCollection,
  findWebAssignmentById,
  buildWebAssignmentHash,
  buildWebAssignmentListHash,
  parseWebAssignmentHash,
} from "../src/core/web-assignment.js";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const curriculum = await readJson("content/curriculum.json");
const collection = await readJson("content/web-assignments/index.json");
const assignment = collection.assignments[0];
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("외부 과제는 고정 원본과 실제 선수 여섯 문서를 연결하되 실행 대기다", () => {
  assert.equal(validateWebAssignmentCollection(collection, curriculum), collection);
  assert.equal(assignment.id, "web-assignment-study-meetup-pin");
  assert.equal(assignment.sourceCommit, "313b5be982bdc2296326cbed5319733fad5b05fe");
  assert.deepEqual(assignment.lessonIds, ["java-concept-objects", "algo-list-conditions", "spring-boot-start", "spring-mvc-flow", "spring-request-mapping", "spring-request-parameters"]);
  assert.equal(assignment.availability.status, "execution-verification-pending");
  assert.equal(findWebAssignmentById(collection, assignment.id), assignment);
  assert.equal(findWebAssignmentById(collection, "web-assignment-missing"), null);
});

const invalidCases = [
  ["schemaVersion", (value) => { value.schemaVersion = 99; }],
  ["중복 ID", (value) => { value.assignments.push(structuredClone(value.assignments[0])); }],
  ["위험한 ID", (value) => { value.assignments[0].id = "web-assignment-../x"; }],
  ["revision", (value) => { value.assignments[0].revision = 0; }],
  ["이동하는 commit", (value) => { value.assignments[0].sourceCommit = "main"; }],
  ["없는 선수", (value) => { value.assignments[0].lessonIds[0] = "missing-lesson"; }],
  ["없는 개념", (value) => { value.assignments[0].conceptIds[0] = "missing.concept"; }],
  ["원격 묶음", (value) => { value.assignments[0].bundle.path = "https://example.com/starter.zip"; }],
  ["상위 경로", (value) => { value.assignments[0].bundle.path = "content/web-assignments/assets/../starter.zip"; }],
  ["인코딩 경로", (value) => { value.assignments[0].bundle.manifestPath = "content/web-assignments/assets/%2e%2e/private.json"; }],
  ["절대 경로", (value) => { value.assignments[0].readmePath = "/Users/private/README.md"; }],
  ["TODO 상위 경로", (value) => { value.assignments[0].targetFiles[0] = "../private.java"; }],
  ["SHA 누락", (value) => { value.assignments[0].bundle.sha256 = ""; }],
];
for (const [name, change] of invalidCases) {
  test(`외부 과제 검증은 ${name}을 거부한다`, () => {
    const invalid = structuredClone(collection);
    change(invalid);
    assert.throws(() => validateWebAssignmentCollection(invalid, curriculum));
  });
}

test("외부 과제 loader는 고정 컬렉션만 읽고 실패 응답·잘못된 자료를 거부한다", async () => {
  const requests = [];
  const loaded = await loadWebAssignmentCollection(curriculum, { fetchImpl: async (path) => {
    requests.push(path);
    return { ok: true, json: async () => structuredClone(collection) };
  } });
  assert.deepEqual(loaded, collection);
  assert.equal(requests.length, 1);
  assert.match(String(requests[0]), /content\/web-assignments\/index\.json$/);
  await assert.rejects(loadWebAssignmentCollection(curriculum, { fetchImpl: async () => ({ ok: false, status: 404 }) }));
  await assert.rejects(loadWebAssignmentCollection(curriculum, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }));
});

test("외부 route는 인앱 route와 구분하고 추가 세그먼트·위험한 ID를 받지 않는다", () => {
  assert.equal(buildWebAssignmentListHash(), "#/web-assignments");
  assert.equal(buildWebAssignmentHash(assignment.id), `#/web-assignments/${assignment.id}`);
  assert.deepEqual(parseWebAssignmentHash("#/web-assignments"), { kind: "list" });
  assert.deepEqual(parseWebAssignmentHash(buildWebAssignmentHash(assignment.id)), { kind: "assignment", id: assignment.id });
  for (const hash of ["#/web-projects", "#/web-projects/learning-board", "#/web-assignments/../x", `#/web-assignments/${assignment.id}/extra`, "#/web-assignments/%2e%2e"]) {
    assert.equal(parseWebAssignmentHash(hash), null, hash);
  }
  assert.throws(() => buildWebAssignmentHash("../private"));
});

// Read central-directory entries without executing or extracting the starter.
function readZipFiles(zip) {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(end >= 0, "ZIP end record");
  const entries = [];
  let cursor = zip.readUInt32LE(end + 16);
  for (let index = 0; index < zip.readUInt16LE(end + 10); index += 1) {
    assert.equal(zip.readUInt32LE(cursor), 0x02014b50);
    const method = zip.readUInt16LE(cursor + 10);
    const compressedBytes = zip.readUInt32LE(cursor + 20);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const local = zip.readUInt32LE(cursor + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const compressed = zip.subarray(start, start + compressedBytes);
    assert.ok(method === 0 || method === 8, "supported fixed ZIP compression");
    entries.push({
      path: zip.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8"),
      mode: (zip.readUInt32LE(cursor + 38) >>> 16).toString(8),
      bytes: method === 0 ? compressed : inflateRawSync(compressed),
    });
    cursor += 46 + nameLength + zip.readUInt16LE(cursor + 30) + zip.readUInt16LE(cursor + 32);
  }
  return entries;
}

test("고정 ZIP은 manifest와 정확한 19파일·바이트·mode·해시가 일치한다", async () => {
  const manifest = await readJson(assignment.bundle.manifestPath);
  const zip = await readFile(new URL(`../${assignment.bundle.path}`, import.meta.url));
  assert.equal(sha256(zip), assignment.bundle.sha256);
  assert.equal(manifest.bundleSha256, assignment.bundle.sha256);
  for (const key of ["revision", "sourceId", "sourceVersion", "sourceCommit"]) assert.equal(manifest[key], assignment[key]);
  assert.equal(manifest.assignmentId, assignment.id);
  assert.equal(manifest.bundlePath, assignment.bundle.path);
  assert.equal(manifest.prefix, assignment.bundle.prefix);
  const entries = readZipFiles(zip);
  assert.equal(entries.length, 19);
  assert.equal(manifest.files.length, assignment.bundle.fileCount);
  assert.deepEqual(entries.map(({ path }) => path).sort(), manifest.files.map(({ path }) => `${manifest.prefix}${path}`).sort());
  for (const file of manifest.files) {
    const entry = entries.find(({ path }) => path === `${manifest.prefix}${file.path}`);
    assert.equal(entry.bytes.length, file.bytes, file.path);
    assert.equal(sha256(entry.bytes), file.sha256, file.path);
    assert.equal(entry.mode, file.mode, file.path);
  }
  assert.equal(manifest.files.find(({ path }) => path === "verify.py").sha256, "4320ca7b31c35b61ea211df4dfe37ef17874f8a8a8d364a84af4e76d45db4559");
});
