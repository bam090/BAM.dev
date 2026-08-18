# ADR 0003: HTML·CSS Quest는 inert DOM과 제한된 CSS 평가기로 검사한다

- 상태: 채택
- 날짜: 2026-08-18

## 맥락

5차 HTML·CSS 정식 과정의 Code Quest는 학습자가 실제 HTML 마크업과 CSS 스타일시트를 작성하게 해야 합니다. 기존 JavaScript Quest처럼 모든 답안을 JavaScript 함수로 감싸면 언어의 작성 단위가 왜곡되고, DOM 문자열을 반환하는 문제는 의미·접근성·캐스케이드·반응형 규칙을 정확히 관찰하기 어렵습니다.

1~5차는 외부 채점 서버 없이 로컬에서 동작해야 합니다. 동시에 학습자 HTML·CSS를 BAM.dev 주 문서에 그대로 삽입하거나 실행해서는 안 되며, 브라우저로 전달되는 검사와 기대값을 비밀 테스트라고 표현할 수도 없습니다.

## 결정

공통 `run(request, { signal }) -> Promise<GradeReport>` 포트와 Quest 진도 계약은 유지하고 `CodeQuestRunnerRouter`가 평가 종류에 따라 구현을 선택합니다.

- 기존 JavaScript 컬렉션: 함수 소스를 테스트마다 one-shot Worker에서 실행
- `html-dom-v1`: 직접 HTML source를 실행하지 않고 문서 구조를 관찰
- `css-style-v1`: 직접 CSS source를 고정 HTML fixture에 적용해 선언과 최종 스타일을 관찰

HTML·CSS 실행 요청은 `evaluationKind`, 언어, Quest ID·revision, `suite: "public"`, 학습자 source와 assertion 목록을 명시합니다. CSS 요청의 `fixtureHtml`은 학습자 입력이 아니라 승인된 콘텐츠에서 복사합니다. 요청은 허용된 own data field만 사본으로 만들고 재검증·동결한 뒤 평가합니다.

## HTML 평가

doctype은 source 첫 선언의 모양과 `DOMParser.parseFromString(source, "text/html")`이 만든 문서의 `doctype`을 함께 확인합니다. 선언은 `<!doctype html>` 형태여야 하고 파서 결과의 이름이 HTML이며 공개·시스템 식별자가 없는 경우만 승인합니다. 이 이중 검사는 파서가 `<!doctype html foo>` 같은 잘못된 선언을 HTML doctype으로 복구해 주는 경계를 막습니다. 나머지 검사는 학습자 source를 `<template>`에 파싱한 inert `DocumentFragment`에서 수행합니다.

- `doctype-present`
- `selector-exists`
- `selector-count`
- `attribute-equals`
- `text-includes`
- `nonblank-attribute-count`
- `direct-child-text-equals`

`template.content`는 BAM.dev 주 문서에 연결하지 않습니다. 학습자 HTML의 스크립트는 실행하지 않고 선택자·개수·속성·정규화한 텍스트처럼 선언된 구조만 관찰합니다. 공백 속성은 trim한 뒤 세고, 직접 자식 텍스트 검사는 지정한 서로 다른 자식과 단 하나의 직접 텍스트 요소를 연결하며 `hidden`·`aria-hidden` 텍스트를 제외합니다. HTML 파서의 오류 복구 때문에 이 평가를 포괄적인 HTML 유효성 검사로 표현하지 않습니다.

## CSS 평가

CSS 선언 검사는 constructed `CSSStyleSheet.replaceSync()`로 만든 CSSOM을 사용합니다. `rule-declaration`은 최상위의 정확한 선택자 규칙들에서 `!important`와 source order를 반영한 최종 같은-selector 선언을, `media-rule-declaration`은 최상위의 정규화한 미디어 조건과 그 직접 자식 규칙들에서 같은 값을 확인합니다. 따라서 같은 선언을 미디어 조건 밖에 두거나 다른 조건부 그룹의 비활성 분기 안에 중첩한 반응형 오답은 통과하지 않습니다. 이 두 검사는 서로 다른 selector의 전체 캐스케이드 승자를 흉내 내지 않으며 우선순위·상속까지 적용된 결과가 필요하면 `computed-style`을 사용합니다.

`computed-style`은 다음 one-shot iframe에서 확인합니다.

1. 화면 밖에 새 iframe을 만들고 `sandbox="allow-same-origin"`을 적용하되 스크립트 권한은 주지 않습니다.
2. 고정 `srcdoc`에 `default-src 'none'; style-src 'unsafe-inline'` CSP를 적용합니다.
3. 위험 source 검사를 통과한 콘텐츠의 고정 HTML fixture와 학습자 `<style>`만 삽입합니다.
4. 대상 요소의 `getComputedStyle()` 값을 읽고 iframe을 제거합니다.

`computed-focus-style`은 같은 iframe에서 키보드 입력 요소로 `:focus-visible` 상태를 먼저 만들고 대상에 초점을 옮긴 뒤 `getComputedStyle()` 값을 읽습니다. 따라서 더 구체적인 selector나 `!important`가 요구 초점선을 지우면 실패합니다. fixture는 최대 UTF-8 32 KiB이고 문제 콘텐츠·실행 요청 양쪽에서 다시 검사합니다. CSSOM과 계산 스타일이 색상·공백 같은 값을 정규화할 수 있으므로 같은 브라우저가 정규화한 기대값과 비교합니다.

## source preflight

HTML·CSS starter code, 작성 예시, 기준 답안·대표 오답, CSS fixture와 학습자 source에는 같은 보수적 preflight를 적용합니다. 학습자 source는 UTF-8 20 KiB, 한 요청의 공개 테스트는 최대 20개입니다.

- HTML은 null 문자, 브라우저가 다르게 복구할 수 있는 비정상·미종료 주석, `script`·`iframe`·`object`·`embed`, `base`·`link`, 문자 참조 우회를 포함한 meta refresh, `on*` 이벤트 속성, `src`·`srcset`·`poster`·`data`·`action`·`formaction`·`ping`, 외부 URL·`@import`·`url()`을 거부합니다. `href`·`xlink:href`는 같은 문서의 `#fragment`만 허용합니다.
- CSS는 null 문자, `@import`, `url()`, 외부 URL, `expression`, `behavior`, `-moz-binding`을 거부합니다.

preflight를 통과하지 못한 source는 DOM·CSS 평가 어댑터를 호출하기 전에 거부합니다. 모든 검사 assertion과 기대값은 정적 콘텐츠로 브라우저에 전달하며 전부 공개 테스트입니다.

## 보안 경계와 한계

이 결정은 HTML·CSS를 권한 있는 코드로 실행하지 않고 위험한 외부 리소스 경로를 줄이기 위한 로컬 학습 경계입니다. 완전한 sanitizer나 권한 판단용 보안 샌드박스는 아닙니다.

- 보수적 문자열 preflight는 안전한 예제를 과하게 거부할 수 있고 HTML·CSS 전체 문법의 의미를 증명하지 않습니다.
- 복잡한 선택자나 스타일 계산은 같은 브라우저 프로세스의 CPU·메모리를 사용합니다.
- `CSSStyleSheet`, sandbox iframe, CSP, CSS 값 정규화는 브라우저 구현과 정책의 영향을 받으며 capability가 없으면 `engine_error`로 보고합니다.
- HTML 파서는 잘못된 마크업을 복구할 수 있으므로 선언한 assertion 통과가 전체 문법·접근성 품질을 보증하지 않습니다.
- 브라우저에 전달한 문제·fixture·assertion·기대값은 사용자가 확인하거나 변조할 수 있습니다. 비밀키, 서버 권한과 비밀 테스트를 포함하지 않습니다.

현재 결과는 로컬 학습 피드백에만 사용합니다. 인증·보상·정식 채점처럼 신뢰가 필요한 판단은 서버가 승인한 테스트를 조회하고 CPU·메모리·네트워크·파일시스템 제한을 적용하는 별도 격리 실행기가 필요합니다.

## 결과

- 학습자는 JavaScript 래퍼 없이 실제 HTML과 CSS를 작성합니다.
- HTML 의미 구조, doctype, 폼 연결과 CSS 캐스케이드·박스·레이아웃·미디어 조건을 관찰 가능한 공개 assertion으로 평가할 수 있습니다.
- JavaScript Worker runner와 HTML·CSS Web runner가 같은 결과·진도 UI를 공유합니다.
- 고정 fixture와 공개 assertion을 기준 답안·대표 오답 fixture로 독립 회귀 검증할 수 있습니다.
- 지원 assertion 밖의 접근성 품질, 시각적 완성도와 구현 방식은 자동 통과로 과장하지 않고 비채점 자기점검 또는 이후 Web Project 평가로 분리해야 합니다.
