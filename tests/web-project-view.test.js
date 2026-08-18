import assert from "node:assert/strict";
import test from "node:test";
import {
  getWebProjectDraftStatusMessage,
  renderWebProjectListView,
  renderWebProjectNavigationLink,
  renderWebProjectView,
} from "../src/ui/web-project-view.js";

const project = {
  id: "web-project-example",
  title: "반응형 <보드>",
  summary: "HTML & CSS",
  difficulty: "beginner",
  estimatedMinutes: 90,
  instructions: "두 파일을 완성하세요.",
  requirements: ["main 사용", "Grid 사용"],
  files: [
    { path: "index.html", languageId: "html", starterSource: "" },
    { path: "styles.css", languageId: "css", starterSource: "" },
  ],
  automaticCriteria: [
    {
      id: "auto-main",
      title: "main 영역",
      description: "main이 있습니다.",
      failureMessage: "main을 추가하세요.",
    },
  ],
  manualCriteria: [
    {
      id: "manual-readable",
      title: "가독성",
      description: "읽기 쉬운지 확인합니다.",
      maxPoints: 10,
      scale: [
        { id: "not-yet", label: "아직", description: "개선해야 합니다.", points: 0 },
        { id: "meets", label: "충족", description: "잘 읽힙니다.", points: 10 },
      ],
    },
  ],
};

function render(overrides = {}) {
  return renderWebProjectView({
    project,
    files: [
      { path: "index.html", languageId: "html", source: "<main>hello</main>" },
      { path: "styles.css", languageId: "css", source: "main { display: grid; }" },
    ],
    manualAssessments: [
      { criterionId: "manual-readable", status: "pending", levelId: null },
    ],
    ...overrides,
  });
}

test("Web Project 내비게이션은 제출 기록과 현재 상태를 표시한다", () => {
  const html = renderWebProjectNavigationLink({
    href: "#/web-projects",
    isCurrent: true,
    submittedCount: 1,
    totalCount: 2,
  });
  assert.match(html, /aria-current="page"/);
  assert.match(html, /1\/2 제출 기록/);
});

test("목록은 시작 전·초안·제출 상태를 구분하고 문자열을 escape한다", () => {
  const html = renderWebProjectListView({
    title: "<Web>",
    items: [
      { project, href: "#/web-projects/example", status: { hasDraft: true } },
      { project: { ...project, id: "two", title: "two" }, status: { submissionCount: 2 } },
      { project: { ...project, id: "three", title: "three" } },
    ],
  });
  assert.match(html, /&lt;Web&gt;/);
  assert.match(html, /반응형 &lt;보드&gt;/);
  assert.match(html, /초안 저장됨/);
  assert.match(html, /제출 기록 2건/);
  assert.match(html, /시작 전/);
});

test("상세 화면은 두 파일 탭·편집기·안전 미리보기·자가평가를 제공한다", () => {
  const html = render();
  assert.match(html, /data-web-project-file-tab="index\.html"[^>]*aria-pressed="true"/);
  assert.match(html, /data-web-project-file-tab="styles\.css"[^>]*aria-pressed="false"/);
  assert.match(html, /<label class="sr-only" for="web-project-source">index\.html 코드<\/label>/);
  assert.match(html, /class="web-project-file-tabs" role="group" aria-label="편집할 파일 선택"/);
  assert.match(html, /data-web-project-source/);
  assert.match(html, /<iframe[^>]*data-web-project-preview[^>]*sandbox=""[^>]*referrerpolicy="no-referrer"/);
  assert.match(html, /role="group" aria-label="미리보기 너비"/);
  assert.doesNotMatch(html, /srcdoc=/);
  assert.match(html, /<fieldset class="web-project-manual-criterion">/);
  assert.match(html, /data-web-project-manual="manual-readable"/);
  assert.doesNotMatch(html, /checked/);
});

test("파일 선택과 자가평가 선택을 원본 손실 없이 표시한다", () => {
  const html = render({
    activeFilePath: "styles.css",
    files: [
      { path: "index.html", source: "<main></main>" },
      { path: "styles.css", source: "main > a { color: red; }" },
    ],
    manualAssessments: [
      { criterionId: "manual-readable", status: "self_assessed", levelId: "meets" },
    ],
  });
  assert.match(html, /styles\.css"[^>]*aria-pressed="true"/);
  assert.match(html, /main &gt; a \{ color: red; \}/);
  assert.match(html, /value="meets"[^>]*checked/);
});

test("실행 중에는 편집과 중복 실행을 막고 취소 동작만 제공한다", () => {
  const html = render({ isRunning: true, executionMode: "submit" });
  assert.match(html, /data-web-project-source[^>]*disabled/);
  assert.match(html, /data-web-project-cancel/);
  assert.match(html, /제출 평가 중… 취소/);
  assert.doesNotMatch(html, /data-web-project-run/);
  assert.doesNotMatch(html, /data-web-project-submit/);
});

test("실제 runner shape 결과는 이름 있는 영역에 outcome·부분 점수·제출 제한을 표시한다", () => {
  const html = render({
    report: {
      automaticResults: [
        { criterionId: "auto-main", outcome: "invalid_source", error: { learnerMessage: "script를 제거하세요." } },
      ],
      score: {
        provisionalScore: null,
        maxPoints: 100,
        automatic: {
          earnedPoints: 0,
          maxPoints: 70,
          criteria: [
            { criterionId: "auto-main", earnedPoints: 0, maxPoints: 5 },
          ],
        },
      },
    },
  });
  assert.match(html, /data-web-project-results tabindex="-1" aria-labelledby=/);
  assert.doesNotMatch(html, /aria-live=/);
  assert.match(html, /소스 안전 검사 실패/);
  assert.match(html, /script를 제거하세요/);
  assert.match(html, /0\/5점/);
  assert.match(html, /자동 0\/70 · 자가평가 대기\/30/);
  assert.match(html, /확정된 검증 점수가 아닌 임시 점수/);
  assert.match(html, /제출 기록을 저장할 수/);
});

test("알 수 없는 상태는 안전한 안내로 대체한다", () => {
  assert.equal(
    getWebProjectDraftStatusMessage("constructor"),
    getWebProjectDraftStatusMessage("starter"),
  );
  const html = render({
    report: {
      criterionResults: [{ criterionId: "auto-main", outcome: "constructor" }],
      score: { provisionalScore: null, maxPoints: 100 },
    },
  });
  assert.match(html, /평가 도구 오류/);
});

test("다른 탭 초안 충돌을 영구 저장 성공처럼 표시하지 않는다", () => {
  assert.match(getWebProjectDraftStatusMessage("conflict"), /충돌/);
  assert.match(render({ draftStatus: "conflict" }), /is-warning[^>]*>다른 탭의 변경과 충돌/);
  assert.match(render(), /data-web-project-error role="alert" aria-atomic="true"/);
});
