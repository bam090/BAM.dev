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
            │                    ├── CSS ────────► CSSOM/iframe 검사
            │                    └── Java ───────► same-origin 로컬 Docker 채점기
            │
            ├── coding-test JSON ─► 목록·풀이·제출 ─┬► one-shot Worker (JavaScript)
            │                                        └► 로컬 Docker 채점기 (Java)
            │
            └── web-project JSON ─► 두 파일 편집·안전 미리보기·공개 평가
                                      │
                                      └──► WebProjectRepository ─► localStorage
```

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 객관식·Quest·코딩테스트·Web Project를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다. 현재 정식 언어는 JavaScript·HTML·CSS·Java 4개입니다.

## 브라우저 앱

- 해시 라우팅: 학습은 `#/learn/<language>/<lesson>`, 복습은 `#/review/<language>`, Quest는 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`, Web Project 목록·과제는 `#/web-projects`와 `#/web-projects/<project>`를 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON 및 Web Project 컬렉션을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 선택 전에는 정답 정보를 화면에 렌더링하지 않고 채점 후 네 선택지의 근거를 모두 표시합니다.
- Quest 라우팅: `CodeQuestRunnerRouter`가 JavaScript·Java 함수 요청과 `html-dom-v1`, `css-style-v1` 직접 소스 요청을 분리합니다. 공통 UI·진도 DTO는 유지하되 각 언어의 작성 단위와 평가기만 교체합니다.
- JavaScript Quest: 문제 계약, 시작 코드, 입출력 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 공개 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 구분합니다.
- Java Quest: `functionContract`의 타입을 `parameterTypes`·`returnType`으로 정규화하고 same-origin 로컬 API에 전달합니다. 로컬 서버는 고정 digest의 Java 21 Docker 이미지에서 별도 `Solution.java`와 harness를 `javac --release 21`로 컴파일하고 공개 테스트마다 제한된 컨테이너/JVM을 실행합니다. 브라우저 취소는 정확한 컨테이너 이름의 종료·정리로 전파합니다.
- HTML Quest: 학습자가 JavaScript 함수가 아닌 HTML 마크업을 작성합니다. doctype 검사는 source 첫 선언과 `DOMParser` 결과를 함께 사용해 정확한 HTML5 doctype인지 확인하고 나머지 구조 검사는 주 문서에 삽입하지 않은 `<template>`의 inert `DocumentFragment`에서 선택자·개수·속성·텍스트를 관찰합니다. 학습자 마크업의 스크립트는 실행하지 않습니다.
- CSS Quest: 학습자가 JavaScript 함수가 아닌 CSS 스타일시트를 작성합니다. 최상위 선언과 최상위 미디어 조건 검사는 constructed `CSSStyleSheet`의 CSSOM에서 수행하고, 계산 스타일 검사는 문제에 포함된 고정 HTML fixture와 학습자 스타일만 one-shot sandbox iframe에 넣어 수행합니다. 매 검사 뒤 iframe을 제거합니다.
- 코딩테스트: 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 공개 테스트 일부, 제출은 전부를 사용하며 `CodingTestRunnerAdapter`가 JavaScript Worker 또는 Java 로컬 runner를 선택한 뒤 문제 ID와 실행 모드로 결과를 복원합니다.
- Web Project: `index.html`과 `styles.css`를 하나의 제출 snapshot으로 만들고, 보수적인 source preflight 뒤 sandbox 미리보기와 HTML DOM·CSSOM 평가 어댑터에 전달합니다. 공개 자동 기준 70점과 검증되지 않은 자가평가 30점을 별도 결과로 계산하며, 평가기 오류·취소·미실행은 0점으로 확정하지 않습니다.
- 공개성: 브라우저에 내려가는 Quest·코딩테스트·Web Project의 문제, assertion, 기대값은 개발자 도구로 확인할 수 있습니다. 모두 공개 테스트 또는 공개 기준이며 비밀 또는 숨김 테스트로 표현하지 않습니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다. 학습 완료, 객관식 시도·오답 ID, Quest 초안·실행·호환용 완료 ID·리비전별 완료와 코딩테스트 초안·제출·리비전별 완료를 `bam.dev.progress.v1` 안의 독립 배열로 관리합니다. Quest 완료 selector는 현재 콘텐츠 리비전과 정확히 일치하는 기록만 사용하며, 리비전 정보가 없던 기존 완료 ID는 revision 1 콘텐츠에서만 보수적으로 인정합니다. Quest ID의 언어 네임스페이스로 HTML·CSS 상태를 기존 계약 안에서 구분하며 실행·제출 기록에는 사용자 소스를 저장하지 않습니다.
- Web Project 저장: `WebProjectRepository` 계약과 `LocalStorageWebProjectRepository` 구현을 분리합니다. 초안은 프로젝트·리비전별 `bam.dev.web-projects.v1.records.v1.draft.*`, 제출 요약은 프로젝트·리비전·제출 ID별 `bam.dev.web-projects.v1.records.v1.submission.*` 독립 키에 저장해 서로 다른 레코드가 하나의 read-modify-write 경합으로 함께 사라지지 않게 합니다. `bam.dev.web-projects.v1`은 기존 aggregate v1 데이터를 처음 읽을 때 레코드로 옮기는 입력이자, 이후 탭 간 변경 알림용 manifest입니다. 최신 source는 최대 10개 초안에만, source·assertion·배점을 제외한 불변 제출 요약은 최대 20개 저장합니다.
- Web Project 동시성: 서로 다른 초안과 프로젝트·리비전·제출 ID가 다른 제출은 독립 키라 보존되며 manifest는 레코드 탐색 보조 정보일 뿐 진실 원본이 아닙니다. 같은 프로젝트·revision 초안은 `expectedDraftToken`으로 발견 가능한 stale 쓰기를 거부합니다. legacy aggregate는 해당 독립 레코드가 아직 없을 때만 가져오며, 레코드가 생긴 뒤에는 그것을 진실 원본으로 유지합니다. 다만 Web Storage에는 compare-and-set 트랜잭션이 없으므로 같은 초안 레코드의 토큰 확인 직후 또는 같은 복합 제출 ID의 존재 확인 직후 두 탭이 동시에 쓰는 극히 좁은 구간은 last-write-wins입니다. 강한 교차 탭 보장은 실제 Web Storage처럼 키를 열거할 수 있는 `MemoryStorage`·`ResilientBrowserStorage` 구현을 전제로 합니다. 다중 사용자·강한 원자성이 필요해지면 저장소 구현을 IndexedDB 트랜잭션이나 원격 저장소로 교체합니다.
- 마이페이지: `#/my`는 두 로컬 저장소가 정규화한 읽기 전용 스냅샷으로 전체·언어별 교안 진도, 오답과 아직 통과하지 못한 항목, 최근 풀이·제출 10건을 집계합니다. Web Project 점수는 `isVerified: false` 계약에 따라 자가평가 포함 임시 점수로만 표시합니다. 계정·프로필을 꾸며내거나 `localStorage`를 직접 읽지 않습니다.
- 저장 장애: 브라우저 저장소 접근이 막히면 메모리 저장소로 전환하며 저장소 계약이 영속 여부를 화면에 제공합니다.
- 언어 전환: 사이드바의 공통 언어 내비게이션은 `available`과 `sample` 언어를 첫 교안으로 연결하고, `planned` 언어는 비활성 상태로 표시합니다.
- 반응형: 데스크톱은 208px 사이드바와 Quest·코딩테스트·Web Project 분할 화면을 사용합니다. 모바일은 상단 메뉴, 오버레이 내비게이션과 문제→편집기→결과 1열 흐름을 사용합니다.

## Web Code Quest 안전 경계

HTML·CSS 소스, 작성 예시와 CSS 고정 fixture는 평가기 호출 전에 같은 보수적 preflight를 거칩니다. 학습자 소스는 UTF-8 20 KiB, fixture는 32 KiB, 한 요청의 공개 검사는 최대 20개입니다.

- HTML은 `script`, `iframe`, `object`, `embed`, `base`, `link`, 문자 참조 우회를 포함한 meta refresh, `on*` 이벤트 속성, `src`·`srcset`·`poster`·`data`·`action`·`formaction`·`ping`과 외부 URL을 거부합니다. `href`·`xlink:href`는 같은 문서의 `#fragment`만 허용합니다.
- CSS는 `@import`, `url()`, 외부 URL, `expression`, `behavior`, `-moz-binding`을 거부합니다.
- 계산 스타일 iframe은 `sandbox="allow-same-origin"`을 사용하되 스크립트 권한을 주지 않습니다. 고정 `srcdoc`의 CSP는 `default-src 'none'; style-src 'unsafe-inline'`이며 fixture와 학습자 CSS 외의 리소스를 넣지 않습니다.
- 실행 요청은 승인된 필드만 복제·재검증하고 동결합니다. HTML·CSS 평가에는 학습자 JavaScript를 동적 컴파일하는 단계가 없습니다.
- Web Project HTML은 제출 CSS만 계산 스타일 기준에 영향을 주도록 `style` 요소와 `style` 속성을 추가로 거부합니다. 이 제한은 독립 HTML Code Quest에는 적용하지 않습니다.

이 경계는 위험한 입력과 우발적인 외부 요청을 줄이는 로컬 학습용 방어입니다. 완전한 HTML sanitizer나 권한 판단용 보안 샌드박스가 아니며, 복잡한 CSS가 같은 브라우저 프로세스의 자원을 소비하거나 브라우저별 CSS 정규화 차이가 생길 수 있습니다. 정식 보상·인증 판단에는 서버가 승인한 테스트와 격리 실행이 별도로 필요합니다.

## 로컬 Java 실행 경계

브라우저는 Java 코드를 실행하지 않고 loopback 개발 서버의 same-origin `/api/java/execute`만 호출합니다. API는 loopback `Host`, 일치하는 `Origin`, `Sec-Fetch-Site`를 확인해 DNS rebinding과 cross-site 호출을 거부합니다. 각 요청은 별도 임시 디렉터리에서 Java 21 대상으로 컴파일되고 공개 테스트마다 새 Docker 컨테이너와 JVM을 사용합니다.

서버는 local Docker socket과 고정 Java 21 image digest만 사용하며 `--pull=never`로 자동 다운로드를 막습니다. 컨테이너는 network none, read-only root, 모든 capability 제거, no-new-privileges, PID·CPU·memory/swap 상한, `/tmp` tmpfs, host non-root uid:gid를 적용합니다. host 임시 디렉터리 하나만 `/workspace`에 bind하고 테스트 단계에서는 read-only로 바꿉니다. source preflight, 64 MiB heap·256 KiB stack·1 active processor, 컴파일/테스트/전체 시간, 출력, 동시 실행 상한도 함께 적용합니다. raw Java Unicode escape, 패키지·추가 public 타입·native, harness 타입 shadowing, 프로세스·파일·네트워크·reflection·attach 위험 API는 컴파일 전에 거부합니다.

채점 token은 argv나 환경 변수가 아니라 container stdin으로 전달하고 harness가 학습자 메서드 호출 전에 읽고 닫습니다. 컨테이너는 create와 start를 분리해 이름을 먼저 추적하며 모든 종료 경로에서 정확한 이름으로 강제 삭제를 재확인한 뒤 임시 디렉터리를 삭제합니다. Docker daemon·고정 이미지·non-root uid:gid가 없거나 정리를 확인할 수 없으면 host JDK나 무격리 실행으로 전환하지 않고 `engine_error`를 반환합니다. Security Manager와 폐기 예정인 `sandbox-exec`는 사용하지 않습니다. 이 경계는 로컬 개인 학습용이며 강한 다중사용자 격리가 아닙니다. 상세 결정과 한계는 [ADR 0005](decisions/0005-local-java-grader.md)에 기록합니다.

## 향후 확장

- 공개 다중사용자 Java 채점이 필요해지면 로컬 Docker Desktop이 아니라 컨테이너 또는 VM 기반 원격 실행 경계를 별도로 설계합니다. 대화형 API 후보는 안정적인 HTTPS endpoint를 제공하는 [Cloud Run Service](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)이며, 요청을 수신하지 않고 실행 후 종료하는 [Cloud Run Job](https://docs.cloud.google.com/run/docs/create-jobs)은 직접 대체재가 아닙니다. Job은 [가격 문서](https://cloud.google.com/run/pricing)상 실행 인스턴스당 최소 1분 과금 경계도 있으므로 이번 무료 로컬 단계에서는 어떤 클라우드 리소스도 만들지 않고 배포 결정을 보류합니다. [OCI Functions](https://docs.oracle.com/en-us/iaas/Content/Functions/Concepts/functionsoverview.htm) 역시 계정·IAM·과금 승인이 필요한 별도 대안으로만 기록합니다.
- Supabase 도입 시 동기식 초안 저장 계약은 localStorage에 유지하고, 인증 뒤 원격 hydrate·동기화와 명시적인 로컬 데이터 가져오기를 담당하는 비동기 계층을 추가합니다. 원격 데이터가 있는 계정에 로컬 상태를 자동 병합하거나 덮어쓰지 않으며 검증 전 로컬 원본을 삭제하지 않습니다.
- Web Project에 학습자 JavaScript가 필요해지면 네트워크·DOM 권한과 무한 실행을 다루는 별도 sandbox 계약을 먼저 설계합니다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 퀴즈의 질문·코드·선택지·해설도 모두 이스케이프하고 콘텐츠 ID를 DOM ID나 CSS 선택자로 직접 사용하지 않습니다.
- JavaScript Quest의 사용자 코드는 주 실행 문맥에서 실행하지 않고 테스트마다 새 Worker에서 실행합니다. 이 경계는 DOM 응답성을 지키기 위한 것이며 악의적 코드를 완전히 격리하는 보안 샌드박스는 아닙니다.
- HTML·CSS Quest는 위 preflight와 inert DOM·CSSOM·one-shot iframe 경계를 사용하고, 위험 source를 평가 전에 거부합니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, 중복 없는 `aria-live`, 실행 결과 초점 이동, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.
