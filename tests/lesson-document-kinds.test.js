import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getLessonsForCourse, validateCurriculum } from "../src/core/content.js";
import { getLearningCatalogItems } from "../src/ui/learning-catalog-view.js";
import { renderSidebarContext } from "../src/ui/service-sidebar-view.js";

const curriculum = JSON.parse(await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"));

function withLessons(changeLessons) {
  const copy = structuredClone(curriculum);
  changeLessons(copy.lessons);
  return copy;
}

function treeApplication(lessons) {
  return lessons.find((lesson) => lesson.id === "algo-tree-java");
}

test("현재 커리큘럼의 개념·활용 문서 계층은 검증을 통과한다", () => {
  assert.deepEqual(validateCurriculum(curriculum), []);
});

test("하위 문서는 같은 과정의 대표 개념문서만 부모로 가지고 부모 안에서 1부터 이어진다", () => {
  const cases = [
    [(lessons) => { treeApplication(lessons).documentKind = "exercise"; }, /documentKind는 concept, application, advanced/],
    [(lessons) => { delete treeApplication(lessons).parentLessonId; }, /활용·심화 문서에는 parentLessonId가 필요합니다/],
    [(lessons) => { treeApplication(lessons).parentLessonId = "missing-lesson"; }, /같은 과정의 교안을 가리켜야 합니다/],
    [(lessons) => { treeApplication(lessons).parentLessonId = "js-concept-async-await"; }, /같은 과정의 교안을 가리켜야 합니다/],
    [(lessons) => {
      lessons.push({ ...structuredClone(treeApplication(lessons)), id: "algo-tree-java-nested", slug: "tree-java-nested", parentLessonId: "algo-tree-java" });
    }, /키워드를 대표하는 개념문서를 가리켜야 합니다/],
    [(lessons) => { treeApplication(lessons).order = 2; }, /algo-09-tree의 하위 문서 order는 1부터 연속되어야 합니다/],
    [(lessons) => { treeApplication(lessons).keyword = "트리 활용"; }, /하위 문서는 keyword 대신 부모 문서의 keyword를 따릅니다/],
    [(lessons) => { lessons.find((lesson) => lesson.id === "algo-09-tree").keyword = " "; }, /keyword는 비어 있지 않은 문자열이어야 합니다/],
  ];
  for (const [change, expected] of cases) {
    const errors = validateCurriculum(withLessons(change));
    assert.ok(errors.some((error) => expected.test(error)), `${expected}: ${errors.join(" | ")}`);
  }
});

test("하위 문서를 추가해도 다른 단원 번호는 바뀌지 않고 부모 바로 뒤에서 읽는다", () => {
  const slugs = getLessonsForCourse(curriculum, "algorithm").map((lesson) => lesson.slug);
  assert.equal(slugs.indexOf("tree-java"), slugs.indexOf("tree-basics") + 1);
  const units = getLessonsForCourse(curriculum, "algorithm").filter((lesson) => lesson.parentLessonId === undefined);
  assert.deepEqual(units.map((lesson) => lesson.order), Array.from({ length: units.length }, (_, index) => index + 1));
});

test("사이드바는 대표 개념문서만 번호로 세고 하위 문서는 종류를 붙여 들여 쓴다", () => {
  const items = getLearningCatalogItems({ curriculum, kind: "learn" });
  const html = renderSidebarContext({ current: "learn", items, topicId: "algorithm", activeHref: "#/learn/algorithm/tree-java" });
  const entries = [...html.matchAll(/<li( class="is-child")?><a href="([^"]+)"[^>]*><span class="sidebar-document-number" aria-hidden="true">([^<]+)<\/span>/g)]
    .map(([, child, href, marker]) => [href, marker, Boolean(child)]);
  assert.deepEqual(entries.find(([href]) => href === "#/learn/algorithm/tree-basics"), ["#/learn/algorithm/tree-basics", "05", false]);
  assert.deepEqual(entries.find(([href]) => href === "#/learn/algorithm/tree-java"), ["#/learn/algorithm/tree-java", "활용", true]);
  // 트리의 하위 문서(활용·심화)는 모두 번호 없이 부모 아래에 이어진다.
  const afterTree = entries.findIndex(([href]) => href === "#/learn/algorithm/tree-java") + 1;
  if (entries[afterTree]) assert.deepEqual(entries[afterTree], ["#/learn/algorithm/priority-queue-heap", "심화", true]);
});

test("알고리즘 과정은 0번부터 단원 번호를 보여 주고 잘못된 시작 번호를 거부한다", () => {
  const items = getLearningCatalogItems({ curriculum, kind: "learn" });
  const html = renderSidebarContext({ current: "learn", items, topicId: "algorithm", activeHref: "#/learn/algorithm/data-structures-and-algorithms" });
  assert.match(html, /href="#\/learn\/algorithm\/data-structures-and-algorithms"[^>]*><span class="sidebar-document-number" aria-hidden="true">00<\/span>/);
  assert.match(html, /<li class="is-child"><a href="#\/learn\/algorithm\/time-complexity-in-code"[^>]*><span class="sidebar-document-number" aria-hidden="true">활용<\/span>/);
  const javascript = renderSidebarContext({ current: "learn", items, topicId: "javascript", activeHref: "#/learn/javascript/javascript-and-runtime" });
  const javascriptNumbers = [...javascript.matchAll(/<span class="sidebar-document-number" aria-hidden="true">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(javascriptNumbers.slice(0, 3), ["01", "02", "03"], "보관 문서로 비는 order가 있어도 번호를 건너뛰지 않는다");

  const invalid = structuredClone(curriculum);
  invalid.courses.find((course) => course.id === "algorithm").unitNumberStart = 2;
  assert.ok(validateCurriculum(invalid).some((error) => /unitNumberStart는 0 또는 1/.test(error)));
});
