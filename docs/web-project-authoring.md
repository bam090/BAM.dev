# Web Project 저작 계약

Web Project는 HTML과 CSS를 함께 작성해 작은 화면을 완성하는 6차 과제다. v1은 브라우저 안에서만 실행하며 학습자 JavaScript와 외부 리소스를 허용하지 않는다. 콘텐츠 원본은 `content/web-projects/index.json`, JSON Schema는 `content/schema/web-project.schema.json`, 방어적 런타임 검증은 `src/core/web-project.js`가 담당한다.

## 컬렉션과 프로젝트

컬렉션은 다음 네 필드만 가진다.

| 필드 | 계약 |
| --- | --- |
| `schemaVersion` | `1` |
| `contractVersion` | `1` |
| `title` | 비어 있지 않은 제목 |
| `projects` | 한 개 이상의 프로젝트 배열 |

프로젝트는 다음 필드를 모두 제공하며 추가 필드를 허용하지 않는다.

| 필드 | 계약 |
| --- | --- |
| `id` | `web-project-`로 시작하는 안정적인 kebab-case ID |
| `slug` | route에서 사용하는 안정적인 kebab-case 값 |
| `revision` | 제출 호환성을 판정하는 1 이상의 정수 |
| `order` | 배열에서 1부터 빈틈없이 이어지는 순서 |
| `title`, `summary`, `instructions` | 학습자가 과제 범위와 평가 방식을 알 수 있는 설명 |
| `difficulty` | `beginner`, `intermediate`, `advanced` 중 하나 |
| `estimatedMinutes` | 10~480분 |
| `requirements` | 중복 없는 요구사항 문자열 |
| `conceptRefs` | 실제 curriculum 교안·개념 연결 |
| `files` | HTML 하나와 CSS 하나 |
| `automaticCriteria` | 공개 자동 평가 기준, 합계 70점 |
| `manualCriteria` | 자가점검 기준, 합계 30점 |

`conceptRefs`는 `{ "lessonId", "conceptIds" }`만 가진다. 모든 `lessonId`는 `content/curriculum.json`에 존재해야 하고, 각 `conceptId`는 연결한 교안이 선언한 개념이어야 한다. 서로 다른 언어의 교안을 한 프로젝트에 연결할 수 있다.

## 파일 계약

v1은 정확히 두 파일을 사용한다.

```json
[
  {
    "path": "index.html",
    "languageId": "html",
    "starterSource": "<!doctype html>..."
  },
  {
    "path": "styles.css",
    "languageId": "css",
    "starterSource": ".page { ... }"
  }
]
```

경로는 프로젝트 루트 기준 상대 POSIX 경로다. `/index.html`, `../index.html`, `a/../index.html`, 역슬래시, 빈 경로 구간을 거부한다. HTML 경로는 `.html`, CSS 경로는 `.css`로 끝나야 하며 중복 경로를 허용하지 않는다.

파일 하나의 UTF-8 크기는 20 KiB, 제출 전체는 64 KiB 이하다. 시작 코드, 기준답안, 대표오답, 학습자 제출은 모두 기존 HTML·CSS source preflight를 통과해야 한다.

- HTML은 브라우저가 다르게 복구할 수 있는 비정상·미종료 주석, script·iframe·object·embed, base·link, 문자 참조 우회를 포함한 meta refresh, 이벤트 핸들러, `src`·`srcset`·`poster`·`data`·`action`·`formaction`·`ping`, 외부 URL을 거부한다. `href`·`xlink:href`는 같은 문서의 `#fragment`만 허용한다.
- CSS는 `@import`, `url()`, 외부 URL과 레거시 실행 구문을 거부한다.

미리보기와 평가기는 `index.html` source와 `styles.css` source를 브라우저 안에서 직접 결합한다. 따라서 HTML에 `<link rel="stylesheet">`를 작성하지 않는다. Web Project HTML의 `<style>` 요소와 `style` 속성도 거부해 CSS 자동 기준에는 제출한 `styles.css`만 영향을 주게 한다. 이 추가 제한은 독립 HTML Code Quest에는 적용하지 않는다. 이는 v1 로컬 sandbox의 의도적인 경계이며 실제 배포용 파일 연결을 가르치는 계약이 아니다.

## 공개 자동 평가 70점

자동 기준은 다음 필드만 가진다.

```json
{
  "id": "auto-css-grid",
  "order": 1,
  "title": "Grid 레이아웃",
  "description": "학습 보드가 Grid인지 확인합니다.",
  "failureMessage": "대상 선택자의 display 선언을 다시 확인하세요.",
  "maxPoints": 10,
  "filePath": "styles.css",
  "evaluationKind": "css-style-v1",
  "assertion": {
    "kind": "rule-declaration",
    "selector": ".learning-board",
    "property": "display",
    "expected": "grid"
  }
}
```

`order`는 배열에서 1부터 이어져야 하고, ID는 프로젝트 안에서 자동·수동 기준 전체에 걸쳐 고유해야 한다. `filePath`는 정식 프로젝트 파일을 가리킨다. HTML 파일은 `html-dom-v1`, CSS 파일은 `css-style-v1`만 사용할 수 있다. 모든 assertion과 배점은 학습자에게 공개된다.

지원하는 assertion은 Web Code Quest와 같은 제한된 데이터 DTO다.

| 평가 종류 | assertion kind |
| --- | --- |
| HTML | `doctype-present`, `selector-exists`, `selector-count`, `attribute-equals`, `text-includes`, `nonblank-attribute-count`, `direct-child-text-equals` |
| CSS | `rule-declaration`, `media-rule-declaration`, `computed-style`, `computed-focus-style`, `computed-grid-column-count` |

JavaScript 함수나 실행 문자열을 assertion에 넣을 수 없다. 공개 자동 기준의 각 `maxPoints`는 양의 안전한 정수이고 합계는 정확히 70이어야 한다. 수동 기준도 고유 ID와 양의 배점을 사용하며, 각 3단계 scale은 0점부터 해당 기준의 `maxPoints`까지 엄격히 오름차순이어야 한다.

반응형 Grid의 실제 열 수를 채점할 때는 `computed-grid-column-count`를 사용한다. 이 assertion은 `selector`, 320~1920 정수인 `viewportWidth`, 1~12 정수인 `expected`를 가진다. 지정한 너비의 sandbox iframe에서 최종 `grid-template-columns` 트랙 수를 세므로, 특정 CSS 문자열이나 미디어 쿼리 작성 방식 대신 뒤의 override까지 반영된 화면 동작을 평가한다.

접근 가능한 이름처럼 공백을 값으로 인정하면 안 되는 속성은 `nonblank-attribute-count`로 trim 이후 유효한 요소 수를 확인한다. 여러 직접 카드의 제목처럼 구조와 문구를 함께 묶어야 할 때는 `direct-child-text-equals`를 사용하고, 요구사항에 `childIndex`가 뜻하는 순서를 명시한다. 키보드 초점선은 선언 존재가 아니라 `computed-focus-style`로 실제 `:focus-visible` 상태의 최종 계산값을 확인한다.

## 자가점검 30점

자동으로 신뢰성 있게 판단하기 어려운 의미 명확성, 반응형 사용성, 시각적 위계는 수동 기준으로 분리한다.

```json
{
  "id": "manual-responsive-usability",
  "order": 1,
  "title": "반응형 사용성",
  "description": "좁고 넓은 화면을 직접 확인합니다.",
  "maxPoints": 10,
  "scale": [
    { "id": "not-yet", "label": "아직 어려움", "description": "...", "points": 0 },
    { "id": "partly", "label": "일부 충족", "description": "...", "points": 5 },
    { "id": "meets", "label": "충족", "description": "...", "points": 10 }
  ]
}
```

각 scale은 정확히 세 단계다. 첫 단계는 0점, 중간 단계는 0점보다 크고 `maxPoints`보다 작으며, 마지막 단계는 `maxPoints`와 같아야 한다. 점수는 오름차순이어야 한다. 모든 수동 기준의 합계는 정확히 30점이다.

로컬 버전의 상태는 다음 둘뿐이다.

- `pending`과 `levelId: null`: 아직 확인하지 않음
- `self_assessed`와 정식 scale의 `levelId`: 학습자가 직접 확인함

자가점검을 사람 검토나 서버 검증 결과로 표현하지 않는다.

## 제출 snapshot

`createWebProjectSubmission(collection, project, input)`은 컬렉션에서 같은 ID의 정식 프로젝트를 다시 찾고 다음 입력만 받는다.

```json
{
  "submissionId": "submission-responsive-plan-001",
  "submittedAt": "2026-08-18T01:02:03.000Z",
  "files": [
    { "path": "index.html", "source": "..." },
    { "path": "styles.css", "source": "..." }
  ],
  "manualAssessments": [
    { "criterionId": "manual-responsive-usability", "status": "pending", "levelId": null }
  ]
}
```

생성된 제출에는 `contractVersion`, 정식 `projectId`, `projectRevision`이 추가된다. 정식 파일과 수동 기준이 하나씩 모두 있어야 한다. 알 수 없는 파일·기준·level을 거부한다. 제출은 assertion, criterion 정의, 배점을 포함할 수 없으며 모든 중첩 객체와 배열을 동결한다.

저장된 plain DTO를 다시 사용할 때는 `snapshotWebProjectSubmission(collection, project, submission)`으로 같은 계약과 현재 revision을 재검증한다.

## 점수 계약

`scoreWebProject(project, evaluation)`은 정식 배점만 사용한다.

```js
scoreWebProject(project, {
  automaticResults: [{ criterionId: "auto-css-grid", outcome: "passed" }],
  manualAssessments: [
    { criterionId: "manual-responsive-usability", status: "self_assessed", levelId: "meets" },
  ],
});
```

자동 outcome은 `passed`, `failed`, `invalid_source`, `engine_error`, `cancelled`, `not_run`만 허용한다. `passed`는 기준 배점, `failed`와 `invalid_source`는 0점이다. `engine_error`, `cancelled`, `not_run`은 점수를 확정하지 않으며 `earnedPoints`가 `null`이다.

자동 기준이 모두 확정되고 수동 기준이 모두 `self_assessed`일 때만 `provisionalScore`가 숫자다. 그 전에는 0으로 대신하지 않고 `null`을 사용한다. 로컬 보고서의 `isVerified`는 항상 `false`다.

## route와 저장소 통합

도메인 계약은 route나 저장소를 직접 변경하지 않는다. 화면 통합에서는 `#/web-projects`와 `#/web-projects/:slug`를 사용하고, 저장은 기존 진행 키가 아닌 `bam.dev.web-projects.v1` 전용 저장소로 분리한다. 목록용 제출 기록에는 원문 source·assertion·배점 정의를 넣지 않는다. 자세한 이유는 [ADR 0004](decisions/0004-local-web-project-evaluation.md)를 따른다.

## 독립 검증 절차

새 프로젝트를 추가할 때 다음을 모두 제공한다.

- 모든 공개 자동 기준을 통과하는 기준답안 파일
- 정상적인 source지만 일부 기준에서 실패하는 대표오답
- 대표오답마다 실패해야 하는 자동 기준 ID 목록
- 자동 70점, 수동 30점, 총 100점 회귀 테스트
- `pending`과 평가기 오류가 0점으로 기록되지 않는 테스트
- 위험 source, 경로 traversal, 추가 필드, 배점·assertion 주입 거부 테스트

검증 명령은 다음과 같다.

```bash
node --test tests/web-project-content.test.js tests/web-project-core.test.js tests/web-project-scoring.test.js
npm run check
```
