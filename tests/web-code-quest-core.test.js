import assert from "node:assert/strict";
import test from "node:test";
import {
  assertValidWebCodeQuestCollection,
  createWebCodeQuestExecutionRequest,
  findWebCodeQuestBySlug,
  findWebCodeQuestSourceIssue,
  getWebCodeQuestsInOrder,
  loadWebCodeQuestCollection,
  validateWebCodeQuestExecutionRequest,
  validateWebCodeQuestCollection,
  WEB_CODE_QUEST_EVALUATION_KINDS,
} from "../src/core/web-code-quest.js";

const curriculum = {
  languages: [
    { id: "html", status: "sample" },
    { id: "css", status: "sample" },
  ],
  lessons: [
    {
      id: "html-01-semantics",
      languageId: "html",
      conceptIds: ["html.semantics"],
    },
    {
      id: "css-01-box-model",
      languageId: "css",
      conceptIds: ["css.box-model"],
    },
  ],
};

function createHints() {
  return [
    { level: 1, stage: "concept", title: "개념", content: "역할을 먼저 확인하세요." },
    { level: 2, stage: "observation", title: "관찰", content: "현재 구조를 살펴보세요." },
    { level: 3, stage: "implementation", title: "구현", content: "작은 단위부터 작성하세요." },
  ];
}

function createHtmlCollection() {
  return {
    schemaVersion: 1,
    contractVersion: 1,
    evaluationKind: "html-dom-v1",
    languageId: "html",
    title: "HTML Code Quest",
    quests: [
      {
        id: "quest-html-semantic-profile",
        slug: "semantic-profile",
        revision: 1,
        order: 1,
        lessonId: "html-01-semantics",
        conceptIds: ["html.semantics"],
        difficulty: "beginner",
        estimatedMinutes: 15,
        title: "의미 있는 프로필 구조",
        summary: "콘텐츠 역할에 맞는 요소를 사용합니다.",
        instructions: "main 안에 제목과 소개 문단을 작성하세요.",
        starterCode: "<main>\n  <h1>프로필</h1>\n</main>",
        requirements: ["main 요소를 한 개 사용합니다.", "소개 문단을 포함합니다."],
        examples: [
          {
            source: "<main><h1>프로필</h1><p>소개</p></main>",
            explanation: "주요 콘텐츠를 main으로 묶었습니다.",
          },
        ],
        publicTests: [
          {
            id: "html-profile-main-exists",
            label: "main 요소",
            assertion: { kind: "selector-exists", selector: "main" },
          },
          {
            id: "html-profile-main-count",
            label: "main 개수",
            assertion: { kind: "selector-count", selector: "main", expected: 1 },
          },
          {
            id: "html-profile-heading-level",
            label: "제목 수준",
            assertion: {
              kind: "attribute-equals",
              selector: "h1",
              attribute: "data-level",
              expected: "primary",
            },
          },
          {
            id: "html-profile-introduction",
            label: "소개 문구",
            assertion: { kind: "text-includes", selector: "p", expected: "소개" },
          },
        ],
        failureExplanations: [
          { testId: "html-profile-main-exists", message: "주요 콘텐츠 영역이 필요합니다." },
          { testId: "html-profile-main-count", message: "main은 문서에 하나만 둡니다." },
          { testId: "html-profile-heading-level", message: "제목의 역할 표시를 확인하세요." },
          { testId: "html-profile-introduction", message: "소개 문단 내용을 확인하세요." },
        ],
        hints: createHints(),
        commonMistakes: [
          { id: "html-main-missing", title: "main 누락", explanation: "div만으로 역할을 표현했습니다." },
        ],
      },
    ],
  };
}

function createCssCollection() {
  return {
    schemaVersion: 1,
    contractVersion: 1,
    evaluationKind: "css-style-v1",
    languageId: "css",
    title: "CSS Code Quest",
    quests: [
      {
        id: "quest-css-profile-card",
        slug: "profile-card",
        revision: 1,
        order: 1,
        lessonId: "css-01-box-model",
        conceptIds: ["css.box-model"],
        difficulty: "beginner",
        estimatedMinutes: 15,
        title: "프로필 카드 박스",
        summary: "박스 크기의 기준을 설정합니다.",
        instructions: ".card의 box-sizing과 padding을 작성하세요.",
        starterCode: ".card {\n  box-sizing: border-box;\n}",
        fixtureHtml: '<article class="card"><h1>프로필</h1></article>',
        requirements: ["border-box를 사용합니다.", "padding을 16px로 설정합니다."],
        examples: [
          {
            source: ".card { box-sizing: border-box; padding: 16px; }",
            explanation: "선언한 너비 안에 padding을 포함합니다.",
          },
        ],
        publicTests: [
          {
            id: "css-card-box-sizing-rule",
            label: "box-sizing 선언",
            assertion: {
              kind: "rule-declaration",
              selector: ".card",
              property: "box-sizing",
              expected: "border-box",
            },
          },
          {
            id: "css-card-padding-rule",
            label: "padding 선언",
            assertion: {
              kind: "rule-declaration",
              selector: ".card",
              property: "padding",
              expected: "16px",
            },
          },
          {
            id: "css-card-computed-sizing",
            label: "계산된 box-sizing",
            assertion: {
              kind: "computed-style",
              selector: ".card",
              property: "box-sizing",
              expected: "border-box",
            },
          },
        ],
        failureExplanations: [
          { testId: "css-card-box-sizing-rule", message: "box-sizing 선언을 확인하세요." },
          { testId: "css-card-padding-rule", message: "padding 값을 확인하세요." },
          { testId: "css-card-computed-sizing", message: "최종 계산값을 확인하세요." },
        ],
        hints: createHints(),
        commonMistakes: [
          { id: "css-content-box", title: "기본 박스", explanation: "padding이 너비 밖에 더해집니다." },
        ],
      },
    ],
  };
}

test("HTML·CSS 직접 소스 컬렉션을 공통 메타데이터와 평가 종류로 승인한다", () => {
  assert.deepEqual(validateWebCodeQuestCollection(createHtmlCollection(), curriculum), []);
  assert.deepEqual(validateWebCodeQuestCollection(createCssCollection(), curriculum), []);
  assert.doesNotThrow(() => assertValidWebCodeQuestCollection(createHtmlCollection(), curriculum));
});

test("doctype과 media 조건부 선언 assertion을 계약에 보존하고 expected를 파생한다", () => {
  const htmlCollection = createHtmlCollection();
  htmlCollection.quests[0].publicTests[0].assertion = { kind: "doctype-present" };
  assert.deepEqual(validateWebCodeQuestCollection(htmlCollection, curriculum), []);
  const htmlRequest = createWebCodeQuestExecutionRequest(
    htmlCollection,
    htmlCollection.quests[0],
    "<!doctype html><main><h1>프로필</h1></main>",
    "doctype-request-one",
  );
  assert.deepEqual(htmlRequest.tests[0].assertion, { kind: "doctype-present" });
  assert.equal(htmlRequest.tests[0].expected, true);

  const cssCollection = createCssCollection();
  cssCollection.quests[0].publicTests[0].assertion = {
    kind: "media-rule-declaration",
    condition: "(min-width: 48rem)",
    selector: ".card",
    property: "display",
    expected: "grid",
  };
  assert.deepEqual(validateWebCodeQuestCollection(cssCollection, curriculum), []);
  const cssRequest = createWebCodeQuestExecutionRequest(
    cssCollection,
    cssCollection.quests[0],
    "@media (min-width: 48rem) { .card { display: grid; } }",
    "media-request-one",
  );
  assert.deepEqual(cssRequest.tests[0].assertion, {
    kind: "media-rule-declaration",
    condition: "(min-width: 48rem)",
    selector: ".card",
    property: "display",
    expected: "grid",
  });
  assert.equal(cssRequest.tests[0].expected, "grid");
  assert.ok(Object.isFrozen(cssRequest.tests[0].assertion));

  cssCollection.quests[0].publicTests[0].assertion.condition = " ";
  assert.ok(
    validateWebCodeQuestCollection(cssCollection, curriculum).some((error) =>
      error.includes("condition은 1~200자"),
    ),
  );
});

test("계산된 Grid 열 개수 assertion은 viewport와 기대 범위를 검증해 실행 요청에 보존한다", () => {
  const cssCollection = createCssCollection();
  cssCollection.quests[0].publicTests[0].assertion = {
    kind: "computed-grid-column-count",
    selector: ".card",
    viewportWidth: 768,
    expected: 3,
  };

  assert.deepEqual(validateWebCodeQuestCollection(cssCollection, curriculum), []);
  const request = createWebCodeQuestExecutionRequest(
    cssCollection,
    cssCollection.quests[0],
    ".card { display: grid; grid-template-columns: repeat(3, 1fr); }",
    "grid-columns-request-one",
  );
  assert.deepEqual(request.tests[0].assertion, {
    kind: "computed-grid-column-count",
    selector: ".card",
    viewportWidth: 768,
    expected: 3,
  });
  assert.equal(request.tests[0].expected, 3);
  assert.ok(Object.isFrozen(request.tests[0].assertion));

  for (const [field, value, expectedMessage] of [
    ["viewportWidth", 319, "viewportWidth는 320~1920"],
    ["viewportWidth", 1921, "viewportWidth는 320~1920"],
    ["viewportWidth", 768.5, "viewportWidth는 320~1920"],
    ["expected", 0, "expected는 1~12"],
    ["expected", 13, "expected는 1~12"],
  ]) {
    const invalid = structuredClone(cssCollection);
    invalid.quests[0].publicTests[0].assertion[field] = value;
    assert.ok(
      validateWebCodeQuestCollection(invalid, curriculum).some((error) =>
        error.includes(expectedMessage),
      ),
    );
  }
});

test("공백 속성·직접 자식 텍스트·focus 계산 스타일 assertion을 계약에 보존한다", () => {
  const htmlCollection = createHtmlCollection();
  htmlCollection.quests[0].publicTests[0].assertion = {
    kind: "nonblank-attribute-count",
    selector: "progress",
    attribute: "aria-label",
    expected: 3,
  };
  htmlCollection.quests[0].publicTests[1].assertion = {
    kind: "direct-child-text-equals",
    selector: ".learning-board",
    childSelector: "article.learning-card",
    childIndex: 1,
    textSelector: "h2",
    expected: "CSS",
  };
  assert.deepEqual(validateWebCodeQuestCollection(htmlCollection, curriculum), []);
  const htmlRequest = createWebCodeQuestExecutionRequest(
    htmlCollection,
    htmlCollection.quests[0],
    "<main><progress aria-label=\"HTML 진도\"></progress></main>",
    "html-declarative-request",
  );
  assert.deepEqual(htmlRequest.tests[0].assertion, htmlCollection.quests[0].publicTests[0].assertion);
  assert.equal(htmlRequest.tests[0].expected, 3);
  assert.deepEqual(htmlRequest.tests[1].assertion, htmlCollection.quests[0].publicTests[1].assertion);
  assert.equal(htmlRequest.tests[1].expected, true);

  const cssCollection = createCssCollection();
  cssCollection.quests[0].publicTests[2].assertion = {
    kind: "computed-focus-style",
    selector: ".card-link",
    property: "outline",
    expected: "3px solid #2563eb",
  };
  assert.deepEqual(validateWebCodeQuestCollection(cssCollection, curriculum), []);
  const cssRequest = createWebCodeQuestExecutionRequest(
    cssCollection,
    cssCollection.quests[0],
    ".card-link:focus-visible { outline: 3px solid #2563eb; }",
    "css-focus-request",
  );
  assert.deepEqual(cssRequest.tests[2].assertion, cssCollection.quests[0].publicTests[2].assertion);
  assert.equal(cssRequest.tests[2].expected, "3px solid #2563eb");

  const invalidChildIndex = structuredClone(htmlCollection);
  invalidChildIndex.quests[0].publicTests[1].assertion.childIndex = -1;
  assert.match(
    validateWebCodeQuestCollection(invalidChildIndex, curriculum).join("\n"),
    /childIndex는 0~99/,
  );
  const invalidAttribute = structuredClone(htmlCollection);
  invalidAttribute.quests[0].publicTests[0].assertion.attribute = "bad attribute";
  assert.match(
    validateWebCodeQuestCollection(invalidAttribute, curriculum).join("\n"),
    /attribute 형식/,
  );
});

test("evaluationKind·언어·교안·assertion과 CSS fixture 계약 불일치를 거부한다", () => {
  const mismatchedLanguage = createHtmlCollection();
  mismatchedLanguage.languageId = "css";
  assert.ok(
    validateWebCodeQuestCollection(mismatchedLanguage, curriculum).some((error) =>
      error.includes("evaluationKind와 languageId"),
    ),
  );

  const crossedLesson = createHtmlCollection();
  crossedLesson.quests[0].lessonId = "css-01-box-model";
  assert.ok(
    validateWebCodeQuestCollection(crossedLesson, curriculum).some((error) =>
      error.includes("언어가 컬렉션 언어"),
    ),
  );

  const wrongAssertion = createHtmlCollection();
  wrongAssertion.quests[0].publicTests[0].assertion = {
    kind: "computed-style",
    selector: "main",
    property: "display",
    expected: "block",
  };
  assert.ok(
    validateWebCodeQuestCollection(wrongAssertion, curriculum).some((error) =>
      error.includes("허용되지 않습니다"),
    ),
  );

  const missingFixture = createCssCollection();
  delete missingFixture.quests[0].fixtureHtml;
  assert.ok(
    validateWebCodeQuestCollection(missingFixture, curriculum).some((error) =>
      error.includes("fixtureHtml"),
    ),
  );
});

test("위험 HTML 요소·이벤트·리소스와 CSS URL·@import를 사전 차단한다", () => {
  for (const source of [
    "<script>alert(1)</script>",
    "<iframe srcdoc=\"x\"></iframe>",
    "<object></object>",
    "<embed>",
    "<button onclick=\"bad()\">실행</button>",
    '<button title=">" onfocus="bad()">실행</button>',
    '<meta http-equiv="&#114;efresh" content="0;&#117;rl=&#104;ttps&#58;//example.com">',
    '<!--><meta http-equiv="&#114;efresh" content="0;url=https://example.com">',
    '<!-- --!><a href="https://example.com">외부</a>',
    "<img src=\"/avatar.png\">",
    "<a href=\"https://example.com\">외부</a>",
    "<a href=\"/collect\">상대 경로</a>",
    "<a href=\"relative\">상대 경로</a>",
    "<a href=\"&#104;ttps://example.com\">엔티티 우회</a>",
    "<a ping=\"/collect\" href=\"#profile\">전송 링크</a>",
    "<style>.card { background: url(/x.png); }</style>",
  ]) {
    assert.ok(
      findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.HTML, source),
      source,
    );
  }

  for (const source of [
    '<!--><main style="display: grid"></main>',
    '<!-- --!><style>main { display: grid; }</style>',
  ]) {
    assert.equal(
      findWebCodeQuestSourceIssue(
        WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
        source,
        { disallowInlineStyles: true },
      )?.code,
      "malformed_comment",
      source,
    );
  }

  for (const source of [
    '@import "https://example.com/a.css";',
    ".card { background: url(/x.png); }",
    ".card { behavior: url(x.htc); }",
  ]) {
    assert.ok(
      findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.CSS, source),
      source,
    );
  }
  assert.equal(
    findWebCodeQuestSourceIssue(
      WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
      '<a href="#profile">프로필</a>',
    ),
    null,
  );
  for (const source of [
    "<p>one= 은 일반 텍스트입니다.</p>",
    '<article data-on-state="ready">안전한 데이터 속성</article>',
  ]) {
    assert.equal(
      findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.HTML, source),
      null,
      source,
    );
  }
});

test("인라인 style 제한은 Web Project용 명시 옵션에서만 적용한다", () => {
  for (const source of [
    "<style>.card { display: grid; }</style><main class=\"card\"></main>",
    '<main class="card" style="display: grid"></main>',
  ]) {
    assert.equal(
      findWebCodeQuestSourceIssue(WEB_CODE_QUEST_EVALUATION_KINDS.HTML, source),
      null,
      source,
    );
    assert.equal(
      findWebCodeQuestSourceIssue(
        WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
        source,
        { disallowInlineStyles: true },
      )?.code,
      "inline_style",
      source,
    );
  }

  assert.equal(
    findWebCodeQuestSourceIssue(
      WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
      '<main data-style="grid">style=은 설명 문구입니다.</main>',
      { disallowInlineStyles: true },
    ),
    null,
  );
});

test("잘못된 languageId와 비문자열 questId를 예외 없이 검증 오류로 반환한다", () => {
  const invalidCollection = createHtmlCollection();
  invalidCollection.languageId = "[";
  const collectionErrors = validateWebCodeQuestCollection(invalidCollection, curriculum);
  assert.ok(collectionErrors.some((error) => error.includes("languageId 형식")));
  assert.ok(!collectionErrors.includes("Web Code Quest 콘텐츠를 안전하게 검증할 수 없습니다."));

  const collection = createHtmlCollection();
  const request = createWebCodeQuestExecutionRequest(
    collection,
    collection.quests[0],
    '<main><h1 data-level="primary">프로필</h1><p>소개</p></main>',
    "invalid-quest-id-request",
  );
  const invalidRequest = { ...request, questId: 7 };
  assert.doesNotThrow(() => validateWebCodeQuestExecutionRequest(invalidRequest));
  assert.ok(
    validateWebCodeQuestExecutionRequest(invalidRequest).some((error) =>
      error.includes("questId 형식"),
    ),
  );
});

test("CSS fixtureHtml은 CSS가 아니라 HTML 보안 프리플라이트로 검사한다", () => {
  for (const fixtureHtml of [
    "<script>bad()</script>",
    '<article onmouseover="bad()">카드</article>',
    '<img src="/avatar.png">',
    '<form action="/submit"><button>제출</button></form>',
  ]) {
    const collection = createCssCollection();
    collection.quests[0].fixtureHtml = fixtureHtml;
    assert.ok(
      validateWebCodeQuestCollection(collection, curriculum).some((error) =>
        error.includes("fixtureHtml"),
      ),
      fixtureHtml,
    );
    assert.throws(
      () =>
        createWebCodeQuestExecutionRequest(
          collection,
          collection.quests[0],
          ".card { display: block; }",
          "unsafe-fixture-request",
        ),
      /fixtureHtml/,
    );
  }
});

test("사용자 source의 UTF-8 20KiB 경계와 빈 입력을 거부한다", () => {
  assert.ok(findWebCodeQuestSourceIssue("html-dom-v1", " "));
  assert.equal(findWebCodeQuestSourceIssue("html-dom-v1", `<p>${"a".repeat(20_000)}</p>`), null);
  assert.equal(
    findWebCodeQuestSourceIssue("html-dom-v1", `<p>${"가".repeat(7_000)}</p>`)?.code,
    "source_too_large",
  );
});

test("실행 요청은 canonical Quest의 선언형 공개 테스트만 복제·동결한다", () => {
  const collection = createHtmlCollection();
  const decoy = structuredClone(collection.quests[0]);
  decoy.publicTests[0].assertion.selector = "script";
  const source = '<main><h1 data-level="primary">프로필</h1><p>소개</p></main>';
  const request = createWebCodeQuestExecutionRequest(
    collection,
    decoy,
    source,
    "web-quest-request-one",
  );

  assert.equal(request.evaluationKind, "html-dom-v1");
  assert.equal(request.fixtureHtml, null);
  assert.equal(request.tests[0].assertion.selector, "main");
  assert.equal(request.tests[0].expected, true);
  assert.equal(request.tests[1].expected, 1);
  assert.ok(Object.isFrozen(request));
  assert.ok(Object.isFrozen(request.tests));
  assert.ok(Object.isFrozen(request.tests[0].assertion));
  assert.deepEqual(Object.keys(request.tests[0]).sort(), [
    "assertion",
    "expected",
    "id",
    "label",
  ]);

  assert.throws(() =>
    createWebCodeQuestExecutionRequest(
      collection,
      { id: "quest-html-not-in-collection" },
      source,
      "web-quest-request-two",
    ),
  );
  assert.throws(() =>
    createWebCodeQuestExecutionRequest(
      collection,
      collection.quests[0],
      "<script>bad()</script>",
      "web-quest-request-three",
    ),
  );
});

test("HTML·CSS 컬렉션 경로만 fetch하고 응답 언어를 재검증한다", async () => {
  const requests = [];
  const collection = createHtmlCollection();
  const loaded = await loadWebCodeQuestCollection("html", curriculum, async (url) => {
    requests.push(url);
    return { ok: true, async json() { return collection; } };
  });
  assert.equal(loaded, collection);
  assert.deepEqual(requests, ["./content/quests/html.json"]);
  await assert.rejects(() => loadWebCodeQuestCollection("javascript", curriculum, async () => null));
});

test("slug 조회와 order 정렬은 입력 컬렉션을 변경하지 않는다", () => {
  const collection = createHtmlCollection();
  const second = structuredClone(collection.quests[0]);
  second.id = "quest-html-second";
  second.slug = "second";
  second.order = 2;
  second.publicTests.forEach((publicTest) => {
    publicTest.id = `${publicTest.id}-second`;
  });
  second.failureExplanations.forEach((explanation) => {
    explanation.testId = `${explanation.testId}-second`;
  });
  collection.quests = [second, collection.quests[0]];

  assert.deepEqual(getWebCodeQuestsInOrder(collection).map((quest) => quest.order), [1, 2]);
  assert.deepEqual(collection.quests.map((quest) => quest.order), [2, 1]);
  assert.equal(findWebCodeQuestBySlug(collection, "second"), second);
  assert.equal(findWebCodeQuestBySlug(collection, "../second"), null);
});
