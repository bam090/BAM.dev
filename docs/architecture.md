# 아키텍처

## 현재 브라우저 구현 경계

`[현재 사실]` 화면과 도메인 모듈은 HTML·CSS·Vanilla JavaScript ES modules로 구현되어 있으며 `package.json`에는 React·TypeScript 또는 전용 프런트엔드 빌드 도구 의존성이 없다. 현재 저장소에는 Java 제품 소스, Maven·Gradle 설정이나 Java 로컬 runner 구현도 없다.

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
            ├── coding-test JSON ─► 목록·풀이·제출 ─► one-shot Worker
            │
            └── web-project JSON ─► 두 파일 편집·안전 미리보기·공개 평가
                                      │
                                      └──► WebProjectRepository ─► localStorage
```

객관식의 `review-concepts.json` 발췌는 개념 오버레이와 문서 절로 연결되고, 진행 상태는 별도 `LocalStorageReviewSessionRepository`로 저장합니다. 위 `ProgressRepository`의 완료 기록과 다른 제품 진도는 유지합니다.

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 카테고리 아래 과정(`courseId`)이 교안 순서와 학습 경로를 정하고 언어(`languageId`)가 예제·평가 실행 계약을 정합니다. 객관식·Quest·코딩테스트·Web Project를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다. 현재 Java도 정적 교안·객관식의 available 과정·언어로 제공하며, 실행 평가 언어는 기존 JavaScript·HTML·CSS 3개입니다. Java 실행기는 아직 없습니다.

## 현재 브라우저 앱

- 해시 라우팅: 홈은 `#/`, 독립 문서·문제 목록은 `#/learn`·`#/review`입니다. 학습은 `#/learn/<course>/<lesson>`, 복습은 `#/review/<language>[/<lessonId>]`이며 선택적 `concept` query로 키워드를 고릅니다. 문서의 `review`·`section` query는 저장된 유효 문맥과 실제 문서·문항 연결을 검사해 복귀와 절 이동에 사용합니다. Quest는 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`, Web Project 목록·과제는 `#/web-projects`와 `#/web-projects/<project>`를 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON 및 Web Project 컬렉션을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 채점 전에는 정답 해설을 렌더링하지 않고 채점 후 정답·선택한 오답의 근거를 먼저 표시하며 다른 보기 해설은 펼칠 수 있습니다. 채점 전후 관련 개념 발췌를 볼 수 있으므로 결과를 독립 숙달의 인증으로 사용하지 않습니다. 개념·문서 왕복·후속 기능 경계는 [학습 복습 설계](designs/lesson-review.md#r1-첫-사용-구현-계약)를 따릅니다.
- Quest 라우팅: `CodeQuestRunnerRouter`가 JavaScript의 기존 함수 요청과 `html-dom-v1`, `css-style-v1` 직접 소스 요청을 분리합니다. 공통 UI·진도 DTO는 유지하되 각 언어의 작성 단위와 평가기만 교체합니다.
- JavaScript Quest: 문제 계약, 시작 코드, 입출력 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 공개 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 구분합니다.
- HTML Quest: 학습자가 JavaScript 함수가 아닌 HTML 마크업을 작성합니다. doctype 검사는 source 첫 선언과 `DOMParser` 결과를 함께 사용해 정확한 HTML5 doctype인지 확인하고 나머지 구조 검사는 주 문서에 삽입하지 않은 `<template>`의 inert `DocumentFragment`에서 선택자·개수·속성·텍스트를 관찰합니다. 학습자 마크업의 스크립트는 실행하지 않습니다.
- CSS Quest: 학습자가 JavaScript 함수가 아닌 CSS 스타일시트를 작성합니다. 최상위 선언과 최상위 미디어 조건 검사는 constructed `CSSStyleSheet`의 CSSOM에서 수행하고, 계산 스타일 검사는 문제에 포함된 고정 HTML fixture와 학습자 스타일만 one-shot sandbox iframe에 넣어 수행합니다. 매 검사 뒤 iframe을 제거합니다.
- 코딩테스트: 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 공개 테스트 일부, 제출은 전부를 사용하며 `CodingTestRunnerAdapter`가 기존 Worker DTO에 투영한 뒤 문제 ID와 실행 모드로 결과를 복원합니다.
- Web Project: `index.html`과 `styles.css`를 하나의 제출 snapshot으로 만들고, 보수적인 source preflight 뒤 sandbox 미리보기와 HTML DOM·CSSOM 평가 어댑터에 전달합니다. 공개 자동 기준 70점과 검증되지 않은 자가평가 30점을 별도 결과로 계산하며, 평가기 오류·취소·미실행은 0점으로 확정하지 않습니다.
- 공개성: 브라우저에 내려가는 Quest·코딩테스트·Web Project의 문제, assertion, 기대값은 개발자 도구로 확인할 수 있습니다. 학습자 결과에는 이 공개 테스트·공개 기준만 사용하며 비공개·숨김 테스트나 원격 추가 채점을 사용하지 않습니다. `tests/fixtures/`의 독립 사례는 제품 콘텐츠를 검증하는 개발 증거일 뿐 설치본의 학습자 결과에는 실행하지 않습니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다. 학습 완료, 객관식 시도·오답 ID, Quest 초안·실행·완료와 코딩테스트 초안·제출·리비전별 완료를 `bam.dev.progress.v1` 안의 독립 배열로 관리합니다. Quest ID의 언어 네임스페이스로 HTML·CSS 상태를 기존 계약 안에서 구분하며 실행·제출 기록에는 사용자 소스를 저장하지 않습니다.
- 객관식 진행 저장: 별도 `bam.dev.review-session.v1` 키의 활성 세션 하나에 선택·채점·현재 문항·해설 펼침·스크롤·초점·복귀 문맥을 보존합니다. 문항 내용이 달라지거나 저장 상태가 유효하지 않으면 자동 재채점 대신 새 시작을 안내합니다. 기존 최근 완료 시도 20개와 오답 ID는 `bam.dev.progress.v1`을 그대로 사용하며, 결과 복구를 새 완료 시도로 중복 기록하지 않습니다. 실제 필드·감지 가능한 탭 충돌과 동시 쓰기 한계는 [R1 세션 계약](content-schema.md#진행-세션)이 정본입니다.
- Web Project 저장: `WebProjectRepository` 계약과 `LocalStorageWebProjectRepository` 구현을 분리합니다. 초안은 프로젝트·리비전별 `bam.dev.web-projects.v1.records.v1.draft.*`, 제출 요약은 프로젝트·리비전·제출 ID별 `bam.dev.web-projects.v1.records.v1.submission.*` 독립 키에 저장해 서로 다른 레코드가 하나의 read-modify-write 경합으로 함께 사라지지 않게 합니다. `bam.dev.web-projects.v1`은 기존 aggregate v1 데이터를 처음 읽을 때 레코드로 옮기는 입력이자, 이후 탭 간 변경 알림용 manifest입니다. 최신 source는 최대 10개 초안에만, source·assertion·배점을 제외한 불변 제출 요약은 최대 20개 저장합니다.
- Web Project 동시성: 서로 다른 초안과 프로젝트·리비전·제출 ID가 다른 제출은 독립 키라 보존되며 manifest는 레코드 탐색 보조 정보일 뿐 진실 원본이 아닙니다. 같은 프로젝트·revision 초안은 `expectedDraftToken`으로 발견 가능한 stale 쓰기를 거부합니다. legacy aggregate는 해당 독립 레코드가 아직 없을 때만 가져오며, 레코드가 생긴 뒤에는 그것을 진실 원본으로 유지합니다. 다만 Web Storage에는 compare-and-set 트랜잭션이 없으므로 같은 초안 레코드의 토큰 확인 직후 또는 같은 복합 제출 ID의 존재 확인 직후 두 탭이 동시에 쓰는 극히 좁은 구간은 last-write-wins입니다. 강한 단일 사용자 로컬 원자성이 필요해지면 IndexedDB 트랜잭션이나 Web Locks를 사용하는 저장소 구현을 별도 설계합니다.
- 저장 장애: 브라우저 저장소 접근이 막히면 메모리 저장소로 전환하며 저장소 계약이 영속 여부를 화면에 제공합니다.
- 과정 전환: 사이드바는 카테고리별 과정을 표시하고, 카테고리와 과정이 모두 탐색 가능하며 첫 교안이 있을 때 해당 교안으로 연결합니다. `planned` 카테고리·과정은 비활성 상태로 표시합니다.
- 화면 탐색: 홈·문서/문제 목록·교안·객관식의 데스크톱은 [236px 탐색 사이드바](designs/visual-design.md#승인된-탐색-시안-적용)를 사용하며, 기존 실습 화면의 208px 사이드바·분할 화면과 모바일 상단 메뉴·오버레이·1열 fallback은 보존합니다.

## 목표 설치형 구조

`[확정 결정]` [`DEC-DELIVERY-01`](roadmap.md#2026-08-29-확정-제품-결정), [`DEC-LOCAL-EVALUATION-01`·`DEC-JAVA-CODING-TEST-01`·`DEC-JAVA-RUNTIME-01`](roadmap.md#2026-09-02-확정-제품-결정), [`DEC-JAVA-VERSION-02`·`DEC-SPRING-BOOT-01`·`DEC-FRONTEND-01`·`DEC-JAVA-IMPLEMENTATION-01`](roadmap.md#2026-09-04-확정-제품-결정)에 따라 목표 배포물은 원격 API·DB·계정 없이 설치해 사용하는 로컬 프로그램이며 코딩테스트는 JavaScript와 Java를 지원한다. 목표 UI 소스는 HTML·CSS 기반의 React·TypeScript를 사용하고 JavaScript도 유지한다. 별도 제품 구성요소인 Java 코딩테스트 로컬 runner는 Java 25로 작성한다. 현재 정적 UI·콘텐츠·평가 도메인과 Worker를 전면 재작성하지 않고 작은 화면·경계부터 이관하며 설치 shell을 바깥 계층에 둔다.

```text
설치 앱 shell
├── 번들된 정적 UI·콘텐츠(React·TypeScript 점진 이관 목표)
├── 교안·객관식
├── Code Quest ──────────► CodeQuestRunnerRouter
├── 코딩테스트 ──────────► CodingTestRunnerAdapter
│   ├── JavaScript ──────► one-shot Worker
│   └── Java ────────────► Java 25 제품 코드인 로컬 runner 목표(번들 JDK·미구현·나머지 계약 대기)
├── 공개 로컬 평가기·테스트
└── Repository 포트
    ├── Quest 상태 ──────► 로컬 사용자 데이터
    └── 코딩테스트 상태 ─► 로컬 사용자 데이터

외부 Git 웹과제 ── 최초 clone/fetch ──► 사용자 실습 폴더·IDE
                                      └──► 향후 Spring Boot 실제 실행 경계
```

- 설치·업데이트·앱 origin·로컬 데이터 계약은 [`designs/local-application.md`](designs/local-application.md)가 정본이다.
- Code Quest의 과정·주제·문제 탐색은 [`designs/code-quest.md`](designs/code-quest.md), 별도 코딩테스트의 목록·풀이·공개 로컬 평가는 [`designs/coding-test.md`](designs/coding-test.md)가 정본이다.
- 외부 HTML·CSS·JavaScript·Java 실습 폴더와 Git 경계는 [`designs/web-assignments.md`](designs/web-assignments.md)가 정본이다.
- 현재의 분리된 route·JSON·진도 배열은 유지할 제품 경계다. JavaScript Code Quest와 코딩테스트는 공개 테스트마다 새로 만드는 one-shot Worker와 runner DTO·실행 추상화를 내부에서 재사용할 수 있지만, 문제 레코드·진도 배열·완료율은 합치지 않는다. 저장소 인터페이스와 `bam.dev.progress.v1` 물리 키의 내부 재사용도 제품 통합을 뜻하지 않는다.
- React는 화면 구성 경계에 도입하는 목표이며 학습자 코드를 renderer에서 실행하거나 기존 Worker 실행 계약을 대체하는 JavaScript runner가 아니다. TypeScript 도입도 저장 포맷·콘텐츠 스키마·route·공개 평가 DTO를 자동 변경하는 근거가 아니다. 정확한 버전·빌드 도구·정적 출력, CSP·Worker import 방식, JavaScript와 TypeScript의 공존 경계, 첫 이관 화면·rollback은 `DEC-FRONTEND-MIGRATION-01`과 후속 ADR·prototype 전까지 구현 계약으로 간주하지 않는다.
- Java 25로 작성할 로컬 runner는 BAM.dev의 제품 코드다. runner 자체의 구현 언어 결정과 runner가 학습자 소스·공개 테스트를 Java 25로 컴파일하는 콘텐츠 실행 기준은 서로 다른 계약이다. 정확한 클래스·프로토콜·빌드 도구·IPC·격리는 `DEC-JAVA-RUNNER-01`과 후속 ADR 전까지 정하지 않으며 Spring Boot를 이 구성요소에 추가하지 않는다.
- 설치형 MVP의 두 기능과 Java 코딩테스트는 Docker, Spring Boot, PostgreSQL, Nginx, 계정이나 사용자가 관리하는 수신 포트를 요구하지 않는다. 개발용 Node localhost는 개발 도구일 수 있지만 최종 사용자의 설치·실행 요구사항이 아니다.
- Java 코딩테스트의 로컬 runner는 확정된 목표 경계지만 현재 구현이 아니다. 설치 패키지 내부의 JDK 25 LTS 계열 경로만 사용하고 학습자 소스·공개 테스트는 정식 Java 25 언어·표준 API 기준으로 preview 없이 컴파일·실행한다. [`DEC-JAVA-RUNNER-01`](roadmap.md#bam-결정-대기-목록), 별도 격리 ADR과 설치 prototype이 정확한 JDK 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·호출·IPC·프로세스·파일·네트워크·시간·메모리·출력 제한 및 OS별 패키징을 검증할 때까지 구체 구현과 완료를 주장하지 않는다.
- Spring Boot는 앱 본체나 Java 코딩테스트 runner의 의존성·실행 모드가 아니다. 향후 교안은 정적 콘텐츠로 읽고 실제 Spring Boot 실행은 사용자가 받은 외부 웹과제 폴더에서 시작하며 BAM.dev가 그 코드를 자동 실행하지 않는다.

모든 학습자 평가 사례·기대값·실행기와 진도를 설치본 안에 두면 BAM.dev가 운영하는 런타임 서버는 필요하지 않다. 이 구조는 로컬 자기학습 결과를 제공하지만 공인 점수, 변조 방지, 부정행위 방지, 신원 확인, 중앙 제출 감사와 기기 간 동기화를 보장하지 않는다.

## Web Code Quest 안전 경계

HTML·CSS 소스, 작성 예시와 CSS 고정 fixture는 평가기 호출 전에 같은 보수적 preflight를 거칩니다. 학습자 소스는 UTF-8 20 KiB, fixture는 32 KiB, 한 요청의 공개 검사는 최대 20개입니다.

- HTML은 `script`, `iframe`, `object`, `embed`, `base`, `link`, 문자 참조 우회를 포함한 meta refresh, `on*` 이벤트 속성, `src`·`srcset`·`poster`·`data`·`action`·`formaction`·`ping`과 외부 URL을 거부합니다. `href`·`xlink:href`는 같은 문서의 `#fragment`만 허용합니다.
- CSS는 `@import`, `url()`, 외부 URL, `expression`, `behavior`, `-moz-binding`을 거부합니다.
- 계산 스타일 iframe은 `sandbox="allow-same-origin"`을 사용하되 스크립트 권한을 주지 않습니다. 고정 `srcdoc`의 CSP는 `default-src 'none'; style-src 'unsafe-inline'`이며 fixture와 학습자 CSS 외의 리소스를 넣지 않습니다.
- 실행 요청은 승인된 필드만 복제·재검증하고 동결합니다. HTML·CSS 평가에는 학습자 JavaScript를 동적 컴파일하는 단계가 없습니다.
- Web Project HTML은 제출 CSS만 계산 스타일 기준에 영향을 주도록 `style` 요소와 `style` 속성을 추가로 거부합니다. 이 제한은 독립 HTML Code Quest에는 적용하지 않습니다.

이 경계는 위험한 입력과 우발적인 외부 요청을 줄이는 로컬 학습용 방어입니다. 완전한 HTML sanitizer나 권한 판단용 보안 샌드박스가 아니며, 복잡한 CSS가 같은 브라우저 프로세스의 자원을 소비하거나 브라우저별 CSS 정규화 차이가 생길 수 있습니다. BAM.dev는 원격 신뢰 경계를 두지 않으므로 이 결과를 정식 보상·인증 판단으로 사용하지 않습니다.

## 목표 전환에서 아직 결정할 경계

- 목표 프런트엔드는 React·TypeScript로 확정됐지만 현재 구현과 도구체인은 Vanilla JavaScript 기준이다. 정확한 React·TypeScript 버전, 빌드 도구·의존성·라이선스, 정적 번들·오프라인 출력, CSP와 one-shot Worker 통합, 기존 모듈 공존·이관 단위, 첫 화면과 rollback 증거는 `DEC-FRONTEND-MIGRATION-01`에서 결정한다. 이 결정 전에는 전체 UI 재작성이나 기존 Worker·도메인 로직 폐기를 시작하지 않는다.
- Java는 현재 승인된 정적 교안·객관식을 available로 제공하며 Java 제품 코드·코딩테스트 콘텐츠·runner·설치 지원은 없다. Java 코딩테스트의 MVP 포함, 설치 패키지 내부 JDK 25 LTS 계열과 정식 Java 25·preview 금지 기준은 확정됐지만 정확한 JDK 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·호출 계약, shell↔runner 경계와 IPC, 격리·OS별 패키징은 `DEC-JAVA-RUNNER-01`과 별도 ADR·prototype 증거가 필요하다. 현재 정적 교안 제공과 별개로 설치형 MVP의 과정 범위 및 Java Code Quest·웹과제의 포함 시점은 `DEC-JAVA-01`에서 구분한다.
- Spring Boot 과정의 향후 추가와 외부 웹과제 실행 위치는 확정됐지만 과정·과제는 현재 구현되어 있지 않다. MVP 포함 시점·교안 범위·Code Quest 여부와 과제 저장소·빌드·의존성·오프라인·공개 검증 계약은 `DEC-JAVA-01`·`DEC-WEB-REPO-01`·`DEC-WEB-OFFLINE-01`에서 결정한다.
- [`DEC-DESKTOP-PROTOTYPE-01`](roadmap.md#2026-08-30-확정-제품-결정)에 따라 현재 Mac에서 Electron·DMG 단일 후보를 먼저 검증한다. 이는 구현·채택·지원 선언이 아니며, 공식 OS·shell·설치 형식·업데이트와 export/import를 포함한 백업·복구 방식은 prototype 증거 뒤 `DEC-DESKTOP-01`이 확정될 때까지 목표 구현으로 취급하지 않는다.
- 현재 인앱 Web Project를 외부 Git 웹과제와 병행할지, 검증 뒤 대체할지 결정해야 한다.
- Code Quest 전용 과정·주제·표시 순서를 현재 관계에서 파생할지 저장할지는 `DEC-QUEST-CATALOG-01`에서 결정한다.
- 코딩테스트의 전체 공개 테스트 동작을 학습자 UI에서 어떤 용어와 펼침 상태로 보여 줄지는 [`designs/coding-test.md`](designs/coding-test.md)의 확인 항목이다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 퀴즈의 질문·코드·선택지·해설도 모두 이스케이프합니다. `validateQuizCollection`에서 형식·중복을 검증한 문항 ID에는 역할 접두사·접미사를 붙여 고유 DOM ID와 radio 그룹을 만들고 HTML 속성도 이스케이프합니다. 임의 문자열을 HTML이나 CSS 선택자에 직접 삽입하지 않습니다.
- JavaScript Quest의 사용자 코드는 주 실행 문맥에서 실행하지 않고 테스트마다 새 Worker에서 실행합니다. 이 경계는 DOM 응답성을 지키기 위한 것이며 악의적 코드를 완전히 격리하는 보안 샌드박스는 아닙니다.
- HTML·CSS Quest는 위 preflight와 inert DOM·CSSOM·one-shot iframe 경계를 사용하고, 위험 source를 평가 전에 거부합니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, 중복 없는 `aria-live`, 실행 결과 초점 이동, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.
