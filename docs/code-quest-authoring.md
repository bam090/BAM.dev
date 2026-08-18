# Code Quest 작성 계약

Code Quest는 교안의 개념을 학습자가 언어의 실제 작성 단위로 직접 구현하도록 돕는 콘텐츠입니다. JavaScript 학습자는 작은 순수 함수를, HTML 학습자는 마크업을, CSS 학습자는 스타일시트를 작성합니다. HTML·CSS 소스를 JavaScript 함수 문자열로 감싸지 않습니다.

문제 설명, 시작 소스, 단계별 힌트와 브라우저에 전달되는 공개 테스트는 `content/quests/<languageId>.json`에 둡니다. 기준 답안과 대표 오답은 빌드 대상이 아닌 `tests/fixtures/`에 둡니다. 브라우저에 전달되는 문제·assertion·기대값은 개발자 도구에서 확인할 수 있으므로 모든 언어에서 공개 테스트라고 부릅니다.

## 컬렉션과 안정적인 연결

컬렉션은 다음 값을 가집니다.

| 필드 | 의미 |
| --- | --- |
| `schemaVersion` | 콘텐츠 스키마 버전. 현재 값은 `1` |
| `contractVersion` | 채점 요청 계약 버전. 현재 값은 `1` |
| `languageId` | 파일명과 커리큘럼 언어 ID에 연결되는 값 |
| `evaluationKind` | HTML은 `html-dom-v1`, CSS는 `css-style-v1`. 기존 JavaScript 함수 컬렉션은 생략 |
| `title` | 컬렉션의 화면 제목 |
| `quests` | 해당 언어의 Quest 배열 |

각 Quest의 `id`와 `slug`는 소문자, 숫자, 하이픈만 사용하고 한 번 배포한 뒤 의미를 바꾸지 않습니다. `id`는 `quest-<languageId>-...` 네임스페이스를 사용합니다. 문제나 공개 테스트의 의미가 달라지면 같은 ID에서 `revision`을 올려 이전 실행 결과와 구분합니다. `order`는 언어 컬렉션 안에서 1부터 빈틈없이 이어집니다.

`lessonId`는 같은 언어의 교안을 가리키고, 모든 `conceptIds`는 그 교안이 선언한 개념 ID 안에서 선택합니다. `difficulty`, `estimatedMinutes`, `title`, `summary`, `instructions`, `starterCode`를 제공하고 다음 학습 지원 필드를 함께 작성합니다.

- `failureExplanations`: 공개 테스트 ID별로 정답 대신 다시 관찰할 지점을 설명합니다.
- `hints`: `concept` → `observation` → `implementation` 순서를 지키는 3~5단계 힌트입니다.
- `commonMistakes`: 전체 정답을 노출하지 않는 대표 오개념입니다.

## JavaScript 함수 계약

JavaScript Quest는 다음 필드를 추가합니다.

- `functionContract`: 매개변수, 반환값, 입력 범위, 예상 시간·공간 복잡도
- `entryPoint`: 채점기가 호출할 함수 이름
- `examples`: 인수·기대값·설명이 있는 예시 1~3개
- `publicTests`: `id`, `label`, `args`, `expected`로 구성된 공개 테스트 3~6개

입력과 반환은 순환 없는 JSON 호환 값이어야 합니다. `undefined`, `NaN`, `Infinity`, `BigInt`, 함수, `Date`, `Map`, `Set`, 비어 있는 항목이 있는 배열은 함수 입출력 계약에 사용하지 않습니다. 한 경로의 컨테이너는 루트를 깊이 0으로 세어 총 512단계까지만 허용하고 513단계부터 거부합니다. 테스트별 `args`, `expected`, 실제 반환값은 각각 UTF-8 compact JSON 기준 16 KiB 이하여야 합니다. 같은 객체를 여러 위치에서 참조하는 alias/DAG는 JSON으로 펼쳐질 각 위치의 바이트를 모두 합산하며 순환 참조는 허용하지 않습니다.

시작 코드는 `entryPoint`와 같은 이름의 함수를 선언하며, 매개변수 이름과 순서는 `functionContract.parameters`에 맞춥니다. 소스는 strict FunctionBody로 실행되고 실행 전 strict Script 문법 검사도 통과해야 하므로 최상위 `return`은 `syntax_error`입니다. 공개 테스트마다 새 Worker에서 함수를 호출하고 반환값을 비교합니다.

JavaScript 공개 테스트 DTO는 다음 네 필드만 사용합니다.

```json
{
  "id": "stable-test-id",
  "label": "학습자가 읽을 테스트 이름",
  "args": ["함수에", "전달할", "인수"],
  "expected": "JSON 호환 기대값"
}
```

각 테스트의 `args` 항목 수와 순서는 `functionContract.parameters`와 같아야 합니다. 정상값뿐 아니라 최솟값, 최댓값, 조건 경계와 빈 배열 같은 예외적인 경계를 포함합니다.

## HTML 직접 마크업 계약

HTML 컬렉션은 `evaluationKind: "html-dom-v1"`을 사용합니다. Quest는 `requirements` 문자열 배열과 실제 마크업·설명으로 된 `examples`를 제공하며, `starterCode`와 학습자 답안도 HTML 자체입니다. 함수 선언, `entryPoint`, 인수·반환값은 없습니다.

지원하는 공개 assertion은 다음과 같습니다.

| `kind` | 검사 내용 |
| --- | --- |
| `doctype-present` | source 첫 선언이 정확한 HTML5 doctype이고 파서 결과에 공개·시스템 식별자가 없는지 확인 |
| `selector-exists` | inert DOM에서 선택자와 일치하는 요소가 하나 이상인지 확인 |
| `selector-count` | 일치하는 요소의 개수 확인 |
| `attribute-equals` | 첫 일치 요소의 속성 문자열 확인 |
| `text-includes` | 첫 일치 요소의 정규화한 텍스트에 문구가 포함되는지 확인 |

doctype 이외의 검사는 학습자 HTML을 BAM.dev 주 문서에 넣지 않고 `<template>`의 inert `DocumentFragment`에서 수행합니다. HTML 파서는 오류 복구를 하므로 “문법적으로 완벽하다”를 포괄적으로 판정한다고 표현하지 않고, 문제에 선언한 관찰 가능한 구조만 평가합니다. `<script>`를 비롯한 위험 source는 파싱 전에 거부하며 학습자 스크립트를 실행하지 않습니다.

## CSS 직접 스타일시트 계약

CSS 컬렉션은 `evaluationKind: "css-style-v1"`을 사용합니다. Quest는 `requirements`, 실제 스타일시트·설명으로 된 `examples`, 고정 `fixtureHtml`을 제공합니다. `starterCode`와 학습자 답안은 CSS 자체이고 JavaScript 함수로 감싸지 않습니다.

`fixtureHtml`은 문제가 승인한 최대 32 KiB의 정적 마크업입니다. 콘텐츠·실행 요청 검증에서 위험 요소와 리소스 속성을 거부하고, 실행 요청을 만들 때 컬렉션의 정식 fixture만 복사하므로 학습자가 교체할 수 없습니다.

지원하는 공개 assertion은 다음과 같습니다.

| `kind` | 검사 내용 |
| --- | --- |
| `rule-declaration` | CSSOM에서 정확한 선택자의 선언 속성·값 확인 |
| `media-rule-declaration` | 정규화한 `@media` 조건 안의 선택자 선언 확인 |
| `computed-style` | 고정 fixture에 스타일을 적용한 뒤 최종 계산 스타일 확인 |

선언·미디어 조건 검사는 constructed `CSSStyleSheet`에서 수행합니다. `rule-declaration`은 최상위의 정확한 선택자 규칙들 가운데 요구한 속성·값 선언이 하나라도 존재하는지를 확인하며 전체 캐스케이드 승자를 추론하지 않습니다. `media-rule-declaration`은 최상위의 정확히 같은 미디어 조건과 그 직접 자식 규칙에서 같은 방식으로 확인합니다. 따라서 `@supports` 같은 다른 조건부 그룹 안에 중첩된 `@media`는 승인하지 않습니다. 우선순위·상속까지 적용된 최종 결과가 목표라면 `computed-style`을 사용합니다. 계산 스타일 검사는 매번 새 sandbox iframe을 만들고 고정 fixture와 학습자 `<style>`만 넣은 뒤 결과를 읽고 iframe을 제거합니다. iframe에는 스크립트 권한이 없고 `default-src 'none'; style-src 'unsafe-inline'` CSP가 적용됩니다. 브라우저가 CSS 값을 정규화할 수 있으므로 평가기는 같은 브라우저의 CSSOM·계산 스타일 정규화를 거친 값과 비교합니다.

## Web source preflight

HTML·CSS 시작 코드, 작성 예시, 기준 답안, 대표 오답, CSS fixture와 학습자 제출은 평가 전에 같은 보수적 preflight를 통과해야 합니다. 학습자 source 최대 크기는 UTF-8 20 KiB이고 한 요청의 공개 테스트는 최대 20개입니다.

- HTML: null 문자, `script`·`iframe`·`object`·`embed`, 기준 URL이나 외부 문서를 가져오는 `base`·`link`, meta refresh, `on*` 이벤트 속성, `src`·`srcset`·`poster`·`data`·`action`·`formaction`, 외부 URL·`@import`·`url()`을 거부합니다.
- CSS: null 문자, `@import`, `url()`, 외부 URL, `expression`, `behavior`, `-moz-binding`을 거부합니다.

preflight와 iframe CSP는 위험한 입력과 외부 요청을 줄이는 로컬 학습용 경계이며 완전한 sanitizer나 권한 판단용 보안 샌드박스가 아닙니다. 복잡한 CSS의 자원 사용과 브라우저별 CSS 구현 차이는 남습니다. 자세한 결정과 한계는 [ADR 0003](decisions/0003-inert-web-code-quest-evaluation.md)을 따릅니다.

## 실행 요청과 결과

공통 실행 요청은 안정적인 `requestId`, `contractVersion`, `questId`, `questRevision`, `languageId`, `suite: "public"`, 학습자 `source`와 공개 테스트를 가집니다. HTML·CSS 요청은 명시적인 `evaluationKind`를 추가하고 HTML은 `fixtureHtml: null`, CSS는 승인된 `fixtureHtml`을 사용합니다. 요청은 허용 필드만 사본으로 만든 뒤 재검증·동결하고, 원본 객체를 평가 중 다시 읽지 않습니다.

`CodeQuestRunnerRouter`는 JavaScript 함수 요청을 Worker runner로, HTML·CSS 요청을 Web runner로 전달합니다. Web runner도 테스트별 `passed`, `wrong_answer`, `syntax_error`, `cancelled`, `engine_error`, `not_run`과 기대값·실제값을 공통 report 형태로 반환합니다. HTML·CSS는 학습자 코드를 실행하지 않으므로 JavaScript의 무한 루프·console 출력 제한을 그대로 적용한다고 표현하지 않습니다.

## 독립 검증

fixture 파일은 Quest마다 다음 자료를 보관합니다.

- 모든 공개 테스트를 통과하는 기준 답안
- 정상적으로 파싱되지만 지정된 공개 테스트에서 실패하는 대표 오답
- 대표 오답이 실패해야 하는 공개 테스트 ID 목록

현재 `tests/fixtures/code-quest-solutions.js`에는 JavaScript 기준 풀이 5개와 기존 독립 사례·대표 오답이 있습니다. `html-code-quest-solutions.js`에는 기준 마크업 5개와 대표 오답 5개, `css-code-quest-solutions.js`에는 기준 스타일시트 4개와 대표 오답 10개가 있습니다. 이 fixture는 빌드 결과에 포함하지 않습니다.

자동 검증은 컬렉션 스키마와 런타임 계약, ID·slug·order, 교안·개념 연결, 공개 테스트와 실패 설명의 1:1 관계, 힌트 단계, preflight, 기준 답안 통과, 대표 오답의 지정 실패를 확인합니다. 특정 요소·선택자·메서드 사용이나 포괄적 접근성 품질처럼 현재 assertion으로 관찰하지 않는 요구는 합격 조건으로 달성했다고 표현하지 않고 비채점 자기점검으로 분리합니다.

```bash
npm run check
```

새 문제를 추가할 때는 교안 실습, 확인 문제, 객관식 컬렉션과 입력·처리 규칙·결과 형태를 함께 비교하고 중복 감사 결과를 검토 기록에 남깁니다.
