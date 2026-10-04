import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderWebAssignmentListView, renderWebAssignmentView } from "../src/ui/web-assignment-view.js";

const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));
const collection = JSON.parse(await readFile(new URL("../content/web-assignments/index.json", import.meta.url), "utf8"));
const assignment = collection.assignments[0];
const render = (extra = {}) => renderWebAssignmentView({ assignment, curriculum, progress: null, error: null, readFailed: false, ...extra });

test("외부 과제 목록은 독립 경로와 실행·오프라인 대기 상태를 안내한다", () => {
  const html = renderWebAssignmentListView({ collection });
  assert.ok(html.includes(`href="#/web-assignments/${assignment.id}"`));
  assert.ok(html.includes(assignment.title));
  assert.match(html, /실행.*대기|재검증 대기/);
  assert.doesNotMatch(html, /자동 채점 완료|검증 PASS 완료/);
});

test("상세는 다운로드·manifest·여섯 선수 route와 외부 실행 한계를 보여 준다", () => {
  const html = render();
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => new URL(match[1], "https://bam.example/app/").href);
  for (const path of [assignment.bundle.path, assignment.bundle.manifestPath]) assert.ok(hrefs.includes(new URL(path, "https://bam.example/app/").href), path);
  assert.match(html, /\bdownload(?:[\s=>])/);
  assert.ok(html.includes(assignment.sourceCommit));
  assert.ok(html.includes(assignment.bundle.sha256));
  for (const id of assignment.lessonIds) {
    const lesson = curriculum.lessons.find((entry) => entry.id === id);
    assert.ok(lesson, id);
    assert.ok(html.includes(`href="#/learn/${lesson.courseId ?? lesson.languageId}/${lesson.slug}"`), id);
  }
  for (const text of ["Thymeleaf", "README.md", "python3 verify.py", "오프라인", "Java", "21"]) assert.ok(html.includes(text), text);
  assert.match(html, /자동 실행하거나 채점하지 않습니다/);
  assert.match(html, /실제 빌드.*완료되지 않았습니다/);
});

test("상세는 자기 보고·회고와 네 확인란을 표시하고 완료 표시가 제품 검증 상태를 바꾸지 않는다", () => {
  const html = render({ progress: { assignmentId: assignment.id, revision: 1, status: "self_completed", reflection: "직접 설명", checklist: [true, false, true, false], updatedAt: "2026-10-04T00:00:00.000Z" } });
  assert.match(html, /자기 보고|자가/);
  assert.match(html, /직접 설명/);
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, assignment.publicVerification.manualChecks.length);
  assert.equal((html.match(/\bchecked(?:[\s=>])/g) ?? []).length, 2);
  assert.match(html, /<label[^>]*for=/);
  assert.match(html, /<textarea[^>]*id=/);
  assert.match(html, /실행.*대기|재검증 대기/);
  assert.match(html, /공개 검증 PASS나 자동 채점 완료가 되지 않습니다/);
});

test("과제 제목·회고·오류를 HTML로 실행하지 않고 문자로 표시한다", () => {
  const reflection = '</textarea><script>alert("private")</script>';
  const html = render({
    assignment: { ...assignment, title: "<img src=x onerror=alert(1)>" },
    progress: { status: "in_progress", reflection, checklist: [] },
    error: "<script>error</script>",
  });
  assert.doesNotMatch(html, /<script>|<img src=x/);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&lt;img"));
});

test("읽기 실패는 오류·재시도와 저장 차단을 표시한다", () => {
  const html = render({ error: "기존 기록 읽기 실패", readFailed: true });
  assert.match(html, /기존 기록 읽기 실패/);
  assert.match(html, /role="alert"|aria-live="(?:polite|assertive)"/);
  assert.match(html, /다시|재시도/);
  assert.match(html, /disabled/);
});
