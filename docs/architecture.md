# 아키텍처

## 현재 경계

```text
curriculum.json + Markdown ──► 학습 화면 ─────────────────────────┐
            │                                                     │
            ├── quiz JSON ──► 검증·채점 ──► 객관식 화면 ──────────┤
            │                                                     ├──► ProgressRepository ──► localStorage
            ├── quest JSON ──► CodeQuestRunnerRouter ─────────────┤
            │                    ├── JavaScript ─► one-shot Worker │
            │                    ├── HTML ───────► inert DOM 검사  │
            │                    └── CSS ────────► CSSOM/iframe 검사
            │
            └── coding-test JSON ─► 목록·풀이·제출 ─► one-shot Worker
```

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 객관식·Quest·코딩테스트를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다. 현재 정식 언어는 JavaScript·HTML·CSS 3개이고 Java는 샘플 1개를 유지합니다.

## 브라우저 앱

- 해시 라우팅: 학습은 `#/learn/<language>/<lesson>`, 복습은 `#/review/<language>`, Quest는 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`을 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 선택 전에는 정답 정보를 화면에 렌더링하지 않고 채점 후 네 선택지의 근거를 모두 표시합니다.
- Quest 라우팅: `CodeQuestRunnerRouter`가 JavaScript의 기존 함수 요청과 `html-dom-v1`, `css-style-v1` 직접 소스 요청을 분리합니다. 공통 UI·진도 DTO는 유지하되 각 언어의 작성 단위와 평가기만 교체합니다.
- JavaScript Quest: 문제 계약, 시작 코드, 입출력 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 공개 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 구분합니다.
- HTML Quest: 학습자가 JavaScript 함수가 아닌 HTML 마크업을 작성합니다. doctype 검사는 source 첫 선언과 `DOMParser` 결과를 함께 사용해 정확한 HTML5 doctype인지 확인하고 나머지 구조 검사는 주 문서에 삽입하지 않은 `<template>`의 inert `DocumentFragment`에서 선택자·개수·속성·텍스트를 관찰합니다. 학습자 마크업의 스크립트는 실행하지 않습니다.
- CSS Quest: 학습자가 JavaScript 함수가 아닌 CSS 스타일시트를 작성합니다. 최상위 선언과 최상위 미디어 조건 검사는 constructed `CSSStyleSheet`의 CSSOM에서 수행하고, 계산 스타일 검사는 문제에 포함된 고정 HTML fixture와 학습자 스타일만 one-shot sandbox iframe에 넣어 수행합니다. 매 검사 뒤 iframe을 제거합니다.
- 코딩테스트: 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 공개 테스트 일부, 제출은 전부를 사용하며 `CodingTestRunnerAdapter`가 기존 Worker DTO에 투영한 뒤 문제 ID와 실행 모드로 결과를 복원합니다.
- 공개성: 브라우저에 내려가는 Quest·코딩테스트의 문제, assertion, 기대값은 개발자 도구로 확인할 수 있습니다. 모두 공개 테스트이며 비밀 또는 숨김 테스트로 표현하지 않습니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다. 학습 완료, 객관식 시도·오답 ID, Quest 초안·실행·완료와 코딩테스트 초안·제출·리비전별 완료를 `bam.dev.progress.v1` 안의 독립 배열로 관리합니다. Quest ID의 언어 네임스페이스로 HTML·CSS 상태를 기존 계약 안에서 구분하며 실행·제출 기록에는 사용자 소스를 저장하지 않습니다.
- 저장 장애: 브라우저 저장소 접근이 막히면 메모리 저장소로 전환하며 저장소 계약이 영속 여부를 화면에 제공합니다.
- 언어 전환: 사이드바의 공통 언어 내비게이션은 `available`과 `sample` 언어를 첫 교안으로 연결하고, `planned` 언어는 비활성 상태로 표시합니다.
- 반응형: 데스크톱은 208px 사이드바와 Quest 및 코딩테스트 분할 화면을 사용합니다. 모바일은 상단 메뉴, 오버레이 내비게이션과 문제→편집기→결과 1열 흐름을 사용합니다.

## Web Code Quest 안전 경계

HTML·CSS 소스, 작성 예시와 CSS 고정 fixture는 평가기 호출 전에 같은 보수적 preflight를 거칩니다. 학습자 소스는 UTF-8 20 KiB, fixture는 32 KiB, 한 요청의 공개 검사는 최대 20개입니다.

- HTML은 `script`, `iframe`, `object`, `embed`, `base`, `link`, meta refresh, `on*` 이벤트 속성, 네트워크·탐색을 시작할 수 있는 리소스 속성과 외부 URL을 거부합니다.
- CSS는 `@import`, `url()`, 외부 URL, `expression`, `behavior`, `-moz-binding`을 거부합니다.
- 계산 스타일 iframe은 `sandbox="allow-same-origin"`을 사용하되 스크립트 권한을 주지 않습니다. 고정 `srcdoc`의 CSP는 `default-src 'none'; style-src 'unsafe-inline'`이며 fixture와 학습자 CSS 외의 리소스를 넣지 않습니다.
- 실행 요청은 승인된 필드만 복제·재검증하고 동결합니다. HTML·CSS 평가에는 학습자 JavaScript를 동적 컴파일하는 단계가 없습니다.

이 경계는 위험한 입력과 우발적인 외부 요청을 줄이는 로컬 학습용 방어입니다. 완전한 HTML sanitizer나 권한 판단용 보안 샌드박스가 아니며, 복잡한 CSS가 같은 브라우저 프로세스의 자원을 소비하거나 브라우저별 CSS 정규화 차이가 생길 수 있습니다. 정식 보상·인증 판단에는 서버가 승인한 테스트와 격리 실행이 별도로 필요합니다.

## 향후 확장

- Java는 교안·객관식 샘플만 유지하며, 정식 Java 코드는 브라우저에서 실행하지 않고 7차의 격리된 채점 서비스로 전달합니다.
- Supabase 도입 시 원격 저장소 구현과 `bam.dev.progress.v1` 로컬 데이터의 원격 마이그레이션 계층만 추가합니다.
- Web Project는 자동 확인 가능한 구조·스타일 항목과 사람의 판단이 필요한 항목을 평가 계약에서 분리합니다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 퀴즈의 질문·코드·선택지·해설도 모두 이스케이프하고 콘텐츠 ID를 DOM ID나 CSS 선택자로 직접 사용하지 않습니다.
- JavaScript Quest의 사용자 코드는 주 실행 문맥에서 실행하지 않고 테스트마다 새 Worker에서 실행합니다. 이 경계는 DOM 응답성을 지키기 위한 것이며 악의적 코드를 완전히 격리하는 보안 샌드박스는 아닙니다.
- HTML·CSS Quest는 위 preflight와 inert DOM·CSSOM·one-shot iframe 경계를 사용하고, 위험 source를 평가 전에 거부합니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, 중복 없는 `aria-live`, 실행 결과 초점 이동, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.
