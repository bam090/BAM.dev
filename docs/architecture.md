# 아키텍처

## 현재 브라우저 구현 경계

`[현재 사실]` 2026-09-26 브라우저 Java 17의 실제 준비·취소·실행 UI와 약 47 MiB 자산 수신을 연결했다. 독립 제품 경로에서 Java Quest 4개의 공개 사례 24개, Java CT 72문제의 공개 JUnit 메서드 그룹 168개·호출 501개를 통과해 해당 ID/revision의 지원 gate를 열었다. 42번째 CT의 기준 풀이는 원본의 Java 25 `List.removeLast()`만 Java 17용 파생본으로 바꿔 검증했으며 문제·공개 JUnit 원본은 유지했다. Pages 하위 경로에서는 첫 CT 제출·새로고침 후 결과/진도 복원을, 별도 제품 UI 진단에서는 취소·시간 초과·컴파일/실행 오류를 확인했다. 실제 확인 환경은 macOS의 Chrome이며 공개 사이트 게시·다른 브라우저 지원·임의 Java 코드의 모든 보안 경계 입증은 별도다. 아래 native Java 25 설명은 별도 이력으로 보존한다.

`[현재 사실]` 화면과 도메인 모듈은 HTML·CSS·Vanilla JavaScript ES modules로 구현되어 있으며 `package.json`에는 React·TypeScript 또는 전용 프런트엔드 빌드 도구 의존성이 없다. Java 제품 runner·감독 코드·Electron shell의 로컬 prototype을 구현했고 검증 커널의 Java Quest·CT 실행과 대표 앱 검증을 인수했다. 정식 설치·지원 OS 선택은 현재 필수 범위가 아니다. Maven·Gradle은 추가하지 않았다.

```text
curriculum.json + Markdown ──► 학습 화면 ─────────────────────────┐
            │                                                     │
            ├── quiz JSON ──► 검증·채점 ──► 객관식 화면 ──────────┤
            │                                                     ├──► ProgressRepository ──► localStorage
            ├── quest JSON ──► CodeQuestRunnerRouter ─────────────┤
            │                    ├── JavaScript ─► one-shot Worker │
            │                    ├── HTML ───────► inert DOM 검사  │
            │                    ├── CSS ────────► CSSOM/iframe 검사
            │                    └── Java ───────► 브라우저 Java 17 공개 평가
            │
            ├── coding-test JSON ─► 목록·작성·저장
            │                         ├── JavaScript 제출 ─► one-shot Worker
            │                         └── Java 공개 JUnit ─► 브라우저 Java 17
            │
            └── web-project JSON ─► 두 파일 편집·안전 미리보기·공개 평가
                                      │
                                      └──► WebProjectRepository ─► localStorage
```

객관식의 `review-concepts.json` 발췌는 개념 오버레이와 문서 절로 연결되고, 진행 상태는 별도 `LocalStorageReviewSessionRepository`로 저장합니다. 위 `ProgressRepository`의 완료 기록과 다른 제품 진도는 유지합니다.

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 카테고리 아래 과정(`courseId`)이 교안 순서와 학습 경로를 정하고 언어(`languageId`)가 예제·평가 실행 계약을 정합니다. 객관식·Quest·코딩테스트·Web Project를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다. Java Quest·코딩테스트의 검증된 ID/revision은 Java 17 환경을 실제로 준비한 세션에서만 실행 가능하다. 저장된 풀이 기록의 유효성은 RAM 준비 상태와 분리한다.

## 현재 브라우저 앱

- 해시 라우팅: 홈은 `#/`, 독립 문서·문제 목록은 `#/learn`·`#/review`입니다. 학습은 `#/learn/<course>/<lesson>`, 복습은 `#/review/<language>[/<lessonId>]`이며 선택적 `concept` query로 키워드를 고릅니다. 문서의 `review`·`section` query는 저장된 유효 문맥과 실제 문서·문항 연결을 검사해 복귀와 절 이동에 사용합니다. Quest 목록·문제는 `#/quest`와 기존 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`, Web Project 목록·과제는 `#/web-projects`와 `#/web-projects/<project>`를 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON 및 Web Project 컬렉션을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 채점 전에는 정답 해설을 렌더링하지 않고 채점 후 정답·선택한 오답의 근거를 먼저 표시하며 다른 보기 해설은 펼칠 수 있습니다. 채점 전후 관련 개념 발췌를 볼 수 있으므로 결과를 독립 숙달의 인증으로 사용하지 않습니다. 개념·문서 왕복·후속 기능 경계는 [학습 복습 설계](designs/lesson-review.md#r1-첫-사용-구현-계약)를 따릅니다.
- Quest 라우팅: `CodeQuestRunnerRouter`가 JavaScript의 기존 함수 요청과 `html-dom-v1`, `css-style-v1` 직접 소스 요청을 분리합니다. 공통 UI·진도 DTO는 유지하되 각 언어의 작성 단위와 평가기만 교체합니다.
- JavaScript Quest: 문제 계약, 시작 코드, 입출력 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 공개 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 구분합니다.
- HTML Quest: 학습자가 JavaScript 함수가 아닌 HTML 마크업을 작성합니다. doctype 검사는 source 첫 선언과 `DOMParser` 결과를 함께 사용해 정확한 HTML5 doctype인지 확인하고 나머지 구조 검사는 주 문서에 삽입하지 않은 `<template>`의 inert `DocumentFragment`에서 선택자·개수·속성·텍스트를 관찰합니다. 학습자 마크업의 스크립트는 실행하지 않습니다.
- CSS Quest: 학습자가 JavaScript 함수가 아닌 CSS 스타일시트를 작성합니다. 최상위 선언과 최상위 미디어 조건 검사는 constructed `CSSStyleSheet`의 CSSOM에서 수행하고, 계산 스타일 검사는 문제에 포함된 고정 HTML fixture와 학습자 스타일만 one-shot sandbox iframe에 넣어 수행합니다. 매 검사 뒤 iframe을 제거합니다.
- 코딩테스트: JavaScript·Java 별도 컬렉션을 함께 로드한다. Java 72문제는 원본 공개 소스를 보존하고 브라우저 Java 17 준비 뒤 검증된 ID/revision에서 실행·제출·완료를 제공한다. 명시된 legacy69 URL만 CT로 안내하고 옛 초안 가져오기는 CT 초안이 없는 경우만 허용한다. 기존 준비3 Quest는 유지한다. 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 첫 공개 그룹, 제출은 전체 공개 그룹을 사용하며 별도 Java provider 결과를 `JavaCodingTestRunnerAdapter`가 기존 DTO에 투영한다.
- Web Project: `index.html`과 `styles.css`를 하나의 제출 snapshot으로 만들고, 보수적인 source preflight 뒤 sandbox 미리보기와 HTML DOM·CSSOM 평가 어댑터에 전달합니다. 공개 자동 기준 70점과 검증되지 않은 자가평가 30점을 별도 결과로 계산하며, 평가기 오류·취소·미실행은 0점으로 확정하지 않습니다.
- 공개성: 브라우저에 내려가는 Quest·코딩테스트·Web Project의 문제, assertion, 기대값은 개발자 도구로 확인할 수 있습니다. 학습자 결과에는 이 공개 테스트·공개 기준만 사용하며 비공개·숨김 테스트나 원격 추가 채점을 사용하지 않습니다. `tests/fixtures/`의 독립 사례는 제품 콘텐츠를 검증하는 개발 증거일 뿐 설치본의 학습자 결과에는 실행하지 않습니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다. 학습 완료, 객관식 시도·오답 ID, Quest 초안·실행·완료와 코딩테스트 초안·제출·리비전별 완료를 `bam.dev.progress.v1` 안의 독립 배열로 관리합니다. Quest ID의 언어 네임스페이스로 HTML·CSS 상태를 기존 계약 안에서 구분하며 실행·제출 기록에는 사용자 소스를 저장하지 않습니다.
- 코딩테스트 상세 결과 저장: `[확정 결정]` 기존 `bam.dev.progress.v1`의 optional 독립 배열에 문제 ID/revision/language·실행 source fingerprint·mode·finishedAt과 표시용 마지막 결과만 저장한다. 최신 20문제 각 1개·개별 UTF-8 64 KiB 상한, 개별 손상 제외·revision 불일치 복원 금지·이전 코드 안내·reset 삭제·run과 제출/완료 분리·저장 실패 시 기존 진도/화면 보존을 적용한다. source/JUnit 원문·IPC 권한은 복제하지 않는다. `[현재 사실]` renderer/storage 구현·focused 검사와 기존 실제 report replay 기반 Electron 재시작 상세 복원 검증을 완료했다. Java·javac 새 실행은 0이다. 필드 의미·안내와 검증 범위는 [CT 복원 계약](designs/coding-test.md#상세-결과-복원과-오류-안내)을 따른다.
- 객관식 진행 저장: 별도 `bam.dev.review-session.v1` 키의 활성 세션 하나에 선택·채점·현재 문항·해설 펼침·스크롤·초점·복귀 문맥을 보존합니다. 문항 내용이 달라지거나 저장 상태가 유효하지 않으면 자동 재채점 대신 새 시작을 안내합니다. 기존 최근 완료 시도 20개와 오답 ID는 `bam.dev.progress.v1`을 그대로 사용하며, 결과 복구를 새 완료 시도로 중복 기록하지 않습니다. 실제 필드·감지 가능한 탭 충돌과 동시 쓰기 한계는 [R1 세션 계약](content-schema.md#진행-세션)이 정본입니다.
- Web Project 저장: `WebProjectRepository` 계약과 `LocalStorageWebProjectRepository` 구현을 분리합니다. 초안은 프로젝트·리비전별 `bam.dev.web-projects.v1.records.v1.draft.*`, 제출 요약은 프로젝트·리비전·제출 ID별 `bam.dev.web-projects.v1.records.v1.submission.*` 독립 키에 저장해 서로 다른 레코드가 하나의 read-modify-write 경합으로 함께 사라지지 않게 합니다. `bam.dev.web-projects.v1`은 기존 aggregate v1 데이터를 처음 읽을 때 레코드로 옮기는 입력이자, 이후 탭 간 변경 알림용 manifest입니다. 최신 source는 최대 10개 초안에만, source·assertion·배점을 제외한 불변 제출 요약은 최대 20개 저장합니다.
- Web Project 동시성: 서로 다른 초안과 프로젝트·리비전·제출 ID가 다른 제출은 독립 키라 보존되며 manifest는 레코드 탐색 보조 정보일 뿐 진실 원본이 아닙니다. 같은 프로젝트·revision 초안은 `expectedDraftToken`으로 발견 가능한 stale 쓰기를 거부합니다. legacy aggregate는 해당 독립 레코드가 아직 없을 때만 가져오며, 레코드가 생긴 뒤에는 그것을 진실 원본으로 유지합니다. 다만 Web Storage에는 compare-and-set 트랜잭션이 없으므로 같은 초안 레코드의 토큰 확인 직후 또는 같은 복합 제출 ID의 존재 확인 직후 두 탭이 동시에 쓰는 극히 좁은 구간은 last-write-wins입니다. 강한 단일 사용자 로컬 원자성이 필요해지면 IndexedDB 트랜잭션이나 Web Locks를 사용하는 저장소 구현을 별도 설계합니다.
- 저장 장애: 브라우저 저장소 접근이 막히면 메모리 저장소로 전환하며 저장소 계약이 영속 여부를 화면에 제공합니다.
- 과정 전환: 공통 서비스 사이드바와 제품별 본문 탐색에서 기존 유효한 과정·교안·실습 링크를 제공합니다. 준비 중인 과정을 새 활성 서비스로 만들지 않습니다.
- 화면 탐색: [전체 화면 계약](designs/visual-design.md#전체-화면의-서비스-사이드바-통일)에 따라 홈·학습문서·객관식·Quest·코딩테스트·기존 Web Project·내 학습 기록과 로딩/오류 화면에 같은 236px 서비스 shell을 적용했습니다. 기존 분할 편집기·본문 문맥 링크·저장/평가 경계와 모바일 fallback을 보존합니다. Quest의 페이지 내부 탐색·학습 지도는 [Quest 설계](designs/code-quest.md#데스크톱-탐색-첫-구현-계약)를 따릅니다. 대표 데스크톱 12개 route와 변경 영향 검사는 독립 PASS이며 최종 독립 문서 검토·통합도 PASS입니다. 근거와 미실행 범위는 [작업 카드](work-items/2026-09-14-global-service-sidebar.md)를 따릅니다.

## 목표 설치형 구조

`[대체됨]` 제목은 기존 링크를 위해 유지한다. 설치 shell을 필수로 둔 구조는 [DEC-SOURCE-DISTRIBUTION-01](roadmap.md#2026-09-22-소스-전달-방식-정정)로 대체됐으며 아래는 현재 소스 실행과 별도 prototype의 관계다.

외부 과제는 [밤위키 원본 활용 계약](designs/web-assignments.md)에 따라 고정 시작 버전과 공개 검증을 확인한 뒤 연결한다. 현재 외부 과제 manifest·BAM 연결은 미구현이며 기존 인앱 Web Project의 데이터·진도와 구분한다.

`[대체됨]` GitHub 소스 clone/다운로드와 Node 정적 서버를 주 사용 경로로 둔 결정은 [브라우저 직접 실행 결정](roadmap.md#2026-09-26-브라우저-직접-java-실행)으로 대체됐다. 아래 구조와 native Java 25 검증은 기존 구현 이력이며 새 브라우저 runtime의 지원 근거가 아니다. 현재 UI·콘텐츠·Worker·진도 경계를 유지하며 React·TypeScript는 작은 표시 경계부터 이관한다. Java 25 runner의 Electron IPC prototype 증거에 더해, [DEC-SOURCE-JAVA-BROWSER-01](roadmap.md#2026-09-22-소스-java-브라우저-연결-설계)의 명시적 같은 포트 Java 연결을 검증한 macOS 커널·Chrome에서 실행했다. 시스템 JDK fallback은 허용하지 않는다. 구현과 실제 검증의 범위는 [2026-09-24 구현 카드](roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수)에 기록한다.

```text
소스 → 기존 정적 서버 → 브라우저
├── 정적 UI·콘텐츠(React·TypeScript 점진 이관 목표)
├── 교안·객관식
├── Code Quest ──────────► CodeQuestRunnerRouter
├── 코딩테스트 ──────────► CodingTestRunnerAdapter
│   ├── JavaScript ──────► one-shot Worker
│   └── Java ────────────► 기본 정적 서버·GitHub Pages: 작성·저장 / 검증 커널 Chrome의 opt-in `dev:java`: 공개 평가·취소
├── 공개 로컬 평가기·테스트
└── Repository 포트
    ├── Quest 상태 ──────► 로컬 사용자 데이터
    └── 코딩테스트 상태 ─► 로컬 사용자 데이터

밤위키 원본 웹과제 ── 승인된 시작 버전 확보 ──► 사용자 실습 폴더·IDE
                                      └──► 향후 Spring Boot 실제 실행 경계
```

- 소스 실행의 origin·데이터 보호 재설계와 기존 설치 prototype 이력은 [`designs/local-application.md`](designs/local-application.md)를 따른다.
- Code Quest의 과정·주제·문제 탐색은 [`designs/code-quest.md`](designs/code-quest.md), 별도 코딩테스트의 목록·풀이·공개 로컬 평가는 [`designs/coding-test.md`](designs/coding-test.md)가 정본이다.
- 외부 HTML·CSS·JavaScript·Java 실습 폴더와 Git 경계는 [`designs/web-assignments.md`](designs/web-assignments.md)가 정본이다.
- 현재의 분리된 route·JSON·진도 배열은 유지할 제품 경계다. JavaScript Code Quest와 코딩테스트는 공개 테스트마다 새로 만드는 one-shot Worker와 runner DTO·실행 추상화를 내부에서 재사용할 수 있지만, 문제 레코드·진도 배열·완료율은 합치지 않는다. 저장소 인터페이스와 `bam.dev.progress.v1` 물리 키의 내부 재사용도 제품 통합을 뜻하지 않는다.
- React는 화면 구성 경계에 도입하는 목표이며 학습자 코드를 renderer에서 실행하거나 기존 Worker 실행 계약을 대체하는 JavaScript runner가 아니다. TypeScript 도입도 저장 포맷·콘텐츠 스키마·route·공개 평가 DTO를 자동 변경하는 근거가 아니다. 정확한 버전·빌드 도구·정적 출력, CSP·Worker import 방식, JavaScript와 TypeScript의 공존 경계, 첫 이관 화면·rollback은 `DEC-FRONTEND-MIGRATION-01`과 후속 ADR·prototype 전까지 구현 계약으로 간주하지 않는다.
- Java 25로 작성하는 로컬 runner는 BAM.dev의 제품 코드다. runner 자체의 구현 언어와 학습자 소스·공개 테스트의 Java 25 기준은 서로 다른 계약이다. 첫 Quest의 클래스·프로토콜·IPC·격리 후보는 ADR 0005로 구체화했으며 검증 커널의 로컬 Java Quest prototype 활성 UI 검증은 독립 PASS다. 코딩테스트 전체와 추가 OS 계약은 `DEC-JAVA-RUNNER-01`의 후속 범위다. Spring Boot를 이 구성요소에 추가하지 않는다.
- 기본 소스 실행은 Node 정적 서버의 안내된 명령을 사용하며 Java API를 열지 않는다. 별도 `dev:java` 명시 연결은 검증 커널의 Chrome에서 확인했고, Docker·Spring Boot·PostgreSQL·Nginx·계정은 필요하지 않다.
- Java 코딩테스트의 로컬 runner는 [ADR 0006](decisions/0006-java-coding-test-local-runtime.md)의 원본 JUnit·별도 CT capability/IPC·method별 fresh JVM 계약으로 구현했고 검증 커널의 정상·오류·대표 앱 실행을 독립 PASS했다. CT gate는 해당 환경에 한정해 활성화하며 상세 증거·재사용·미지원 범위는 [CT 작업 카드](work-items/2026-09-22-java-coding-test-runtime.md)를 따른다. 설치 패키지 내부의 JDK 25 LTS 계열 경로만 사용하고 학습자 소스·공개 테스트는 정식 Java 25 언어·표준 API 기준으로 preview 없이 컴파일·실행한다. [`DEC-JAVA-RUNNER-01`](roadmap.md#bam-결정-대기-목록), 별도 격리 ADR과 설치 prototype이 정확한 JDK 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·호출·IPC·프로세스·파일·네트워크·시간·메모리·출력 제한 및 OS별 패키징의 정식 배포 범위를 검증할 때까지 설치 지원 완료를 주장하지 않는다.
- Spring Boot는 앱 본체나 Java 코딩테스트 runner의 의존성·실행 모드가 아니다. 향후 교안은 정적 콘텐츠로 읽고 실제 Spring Boot 실행은 사용자가 받은 외부 웹과제 폴더에서 시작하며 BAM.dev가 그 코드를 자동 실행하지 않는다.

실제로 지원하는 공개 평가 사례·기대값·실행기와 진도를 로컬 경계 안에 두면 BAM.dev가 운영하는 런타임 서버는 필요하지 않다. 이 구조는 로컬 자기학습 결과를 제공하지만 공인 점수, 변조 방지, 부정행위 방지, 신원 확인, 중앙 제출 감사와 기기 간 동기화를 보장하지 않는다.

## Java Code Quest 로컬 prototype 경계

이 게시 후보는 아래 desktop 소스를 포함한다. 검증 커널의 로컬 prototype 실행 증거이며 일반 브라우저 Java 실행이나 정식 설치본 제공을 뜻하지 않는다.

`[확정 결정]` [DEC-JAVA-QUEST-RUNTIME-01](roadmap.md#2026-09-15-java-실행-지원-결정)에 따라 첫 Java Quest 실행 후보를 작성했다. `[현재 사실]` 후속 runtime·배열 공개 평가와 Java 미실행 앱 기본 검증을 인수했다. 현 후보는 검증한 `darwin/arm64`·OS release·kernel version이 모두 일치할 때만 허용하고 읽기 실패·불일치는 capability/run 공통 경계에서 파일 접근·spawn 전에 차단한다. 검증 커널의 Java Quest 활성 UI·취소·창 닫기·복원은 독립 PASS다. 정식 설치 지원과 최종 프로젝트 통합·Git 게시 완료는 별개다. 정확한 증거와 과거 실패는 [작업 카드](work-items/2026-09-15-java-code-quest-runtime.md#2026-09-22-활성-java-quest-앱-검증-pass)를 따른다.

기존 renderer의 Quest UI·저장소는 유지하고 Java adapter만 좁은 preload bridge에 연결한다. renderer는 Quest ID·revision·source·requestId만 전달하고 Electron main이 bundle의 공개 manifest·고정 JDK·제한을 선택한다. 별도 sandbox javac가 정식 Java 25를 컴파일한 뒤 각 공개 테스트마다 새로운 sandbox JVM의 Java 제품 코드 `BamQuestRunner`를 실행한다. renderer나 감독 프로세스에서 learner class를 로드하지 않는다. 실제 반환과 bundle 기대값 비교는 부모에서 수행하며 진도는 기존 Quest 전용 배열에만 기록한다.

앱 shell은 `bam://app` 정적 자산 origin을 제공하고 HTTP 포트를 열지 않는다. Node·일반 IPC·파일 시스템을 renderer에 노출하지 않으며 renderer CSP와 기존 JavaScript Worker의 제한된 동적 컴파일 문맥을 분리한다. Java 없는 일반 브라우저는 기존 세 언어 평가를 계속 제공한다. capability가 없는 Java route는 실행 불가 안내를 제공하고 거짓 PASS·완료를 만들지 않는다.

선택된 runtime·정확한 artifact·통신·compile/run protocol·sandbox·timeout/output/memory·cleanup·실제 부정 검증은 [ADR 0005](decisions/0005-java-quest-local-runtime.md), Java 데이터는 [콘텐츠 계약](content-schema.md#java-정적-메서드-quest-pilot), 장기 설치 목표는 [로컬 앱 설계](designs/local-application.md)가 정본이다. 별도 로컬 prototype의 설치 산출물·실패 이력은 위 ADR와 작업 카드에서 확인한다. 이 첫 Quest prototype 범위에서는 Java 코딩테스트 UI·콘텐츠·완료율·Spring·React 이관·원격 서비스를 추가하지 않았다. 이후 승인된 [CT 작성용 전환](designs/coding-test.md#algorithm-bridge-코딩테스트-전환)은 별도 브라우저 범위다.

## 브라우저 직접 Java 실행 — BROWSER-JAVA-v1

`[확정 결정]` [DEC-BROWSER-JAVA-01](roadmap.md#2026-09-26-브라우저-직접-java-실행)에 따라 목표 흐름은 README 시작하기의 GitHub Pages 링크 → 문제 선택 → 코드 작성 → 브라우저 안에서 실행·공개 채점·취소다. clone·Node·JDK 설치·localhost 서버·별도 연결 버튼을 요구하지 않는다. bam의 후속 정정으로 브라우저 학습자 소스·실행 기준은 Java 17로 고정한다. Java 21 후보는 채택하지 않으며 추가 버전 변경을 임의로 하지 않는다. 이 결정은 원본 교안·문제·공개 JUnit 테스트의 재작성이나 native Java 25 이력 변경을 뜻하지 않는다.

`[현재 사실]` 제품은 CheerpJ 4.3·ECJ 3.33과 Java 17용 신뢰 helper로 브라우저 안에서 컴파일·공개 평가를 수행한다. 고정 버전 자산을 준비한 뒤 opaque iframe의 일회용 Worker에서 실행하며 결과는 부모가 검증한 typed DTO로 받는다. 아래 초기 후보·차단점 기록은 당시 단계의 이력이고 현재 지원 범위는 문서 첫머리와 [범위 확장](#java-quest원본-junit-범위-확장)의 검증 결과를 따른다. 미채택 TeaVM Java 21 실험은 후속 구현 경로가 아니다. CheerpJ [공식 라이선스](https://cheerpj.com/docs/licensing)의 Community 조건과 외부 CDN `cjrtnc.leaningtech.com`을 따르며 runtime을 자체 호스팅하지 않는다. 최초 다운로드에는 네트워크가 필요하고 완전 오프라인을 보장하지 않는다.

`[현재 사실]` 2026-09-26 격리된 임시 prototype의 실제 Chrome에서 CheerpJ 4.3 runtime `17.0.19-internal`을 확인했다. `com.sun.tools.javac.Main`은 ClassNotFound, `ToolProvider.getSystemJavaCompiler()`는 null이어서 해당 runtime의 내장 컴파일러는 확인되지 않았다. 별도 ECJ 3.33 임시 로드는 성공했고 `BatchCompiler`·`java.base`를 확인했으나, `-17` 컴파일은 `/lt/17/release` 부재와 JrtFileSystem 관련 오류로 exit -1을 반환했다. 근거는 임시 검증 산출물 `/private/tmp/bam-java17-browser-probe/chrome-ecj-result.json` 및 검증 담당 인계이며 제품 의존성을 추가한 결과가 아니다. 앞선 인앱 브라우저의 약 70초 초기화·컴파일 대기 시간 초과는 지원 부재의 근거로 사용하지 않는다. 원본 JUnit·문제 변경과 학습자 답안 실행은 0이며 컴파일·공개 채점·취소·격리 수용 조건은 아직 충족하지 않았다. 이후 공식 SDK 분리 가능성을 읽기 전용으로 확인했으며, 이 CheerpJ/ECJ 결과는 browser Java 지원·제품 통합·release 완료를 뜻하지 않는다.

`[현재 사실]` Java 17 후속 읽기 전용 검증에서 CheerpJ의 기존 `jrt:/` 파일 시스템으로 실제 `java.base/java/lang/Object.class`(1493 bytes)·`Record.class`(239 bytes)를 읽었고 둘 다 major 61이었다. Java 파일 조회로 `/lt/17/release` 없음·`/lt/17/lib/modules` 존재도 확인했다. ECJ 3.33 공식 JSR199 소스에는 명시 `PLATFORM_CLASS_PATH` JAR를 사용해 기본 JRT 경로를 건너뛰는 분기가 있으므로 다음 검증 가능성이 남아 있지만 컴파일 성공 증거는 아니다. 두 번의 제한된 시도는 ECJ를 포함한 `cheerpjRunLibrary` 준비에서 각각 115초 전체 대기·85초 준비 상한으로 종료돼 실제 클래스 JAR 생성·JSR199 컴파일·고정 소스 실행/stdout 단계에 도달하지 못했다. CDN module range 요청은 계속됐으며 외부 POST는 0이었다. 서버와 브라우저를 닫고 반복 재시도를 중단했다. 근거는 `/private/tmp/bam-java17-browser-probe/receipt.md`(SHA-256 `2475579b0ccc91dab56c9cd993d1d65145e78eaf0fd4ae31759a0d14ed75587a`)와 그 원시 기록이다. Java 17 경로의 가능·불가능을 단정하지 않으며 준비 지연과 미실행 file-manager 동작은 별도 불확실성으로 남긴다. native 실행·원격 컴파일·전체 JDK 다운로드·제품 코드 변경은 없었다.

`[현재 사실]` 이후 단일 ECJ library 준비는 182.3초에 성공했고 같은 Java 17 JRT에서 실제 클래스 25개를 임시 JAR(66,888 bytes)로 만들었다. 진단 catch만 보완한 후속 실행에서는 준비 270.0초 뒤 `EclipseCompiler.getStandardFileManager`의 실제 `java.lang.NullPointerException`을 확인했다. `/lt/17/release` 부재 후 JRT 초기화가 실패하며 명시 platform JAR 설정 전에 중단되는 경로다. 앞선 JS TypeError는 Java 예외 proxy의 문자열 변환 과정에서 생긴 진단 오류였다. 근거는 `/private/tmp/bam-java17-browser-probe/chrome-ecj-jsr-single-bounded-retry-result.json`(SHA-256 `766d6580447c5474c7c19126085ce9c5d06f19f51903237a0a67d175163dc18e`)이다. 따라서 startup 시간 초과를 Java 17 불가능으로 판단하지 않으며, 현재 확인된 차단점은 기본 file manager의 JRT 초기화다. 학습자 컴파일·class 61 출력·실행은 아직 도달하지 못했다.

`[확정 결정]` bam은 실제 Java 17 라이브러리를 직접 전달하는 adapter 방향의 진행을 승인했다. `[제안]` 기본 file manager 생성을 피하고 ECJ의 기존 `FileSystem`에 실제 Java 17 클래스 JAR만 전달해 low-level `Compiler`의 이름 탐색 환경으로 재사용한다. 새 StandardJavaFileManager 구현보다 작은 trusted helper 한 개를 먼저 검증하며, ECJ 3.33의 내부 API 의존과 미검증 module/API 범위를 명시한다. 초기 adapter의 준비 방법은 신뢰된 고정 helper만 ECJ `-source 8 -target 8`과 실제 Java 17 클래스 JAR의 bootclasspath로 컴파일해 Java 17 VM에서 로드하는 가설이다. 이는 Java 8 runtime/API 대체가 아니며 학습자 소스·compliance·target은 Java 17, preview off로 유지한다. helper class 52의 생성·로드와 학습자 class 61/minor 0·실제 stdout을 별도 판정한다. 가짜 release·API stub·class header 패치·native/원격 컴파일은 사용하지 않는다. 이 bootstrap 가설의 최소 fixed-source 실증을 먼저 하고, 추가 custom 구현 확대 전 초기 로딩·유지 비용·격리·취소·라이선스로 후보 채택 여부를 다시 판단한다. 구현·성공·최선의 경로로 확정한 것은 아니다.

`[현재 사실]` 후속 `-proc:none`·no-preload 진단에서 helper compiler는 실행됐으나 기존 25-class JAR의 `IllegalArgumentException`·`IOException` 등 실제 표준 클래스 누락으로 실패했다. 이후 실제 Java 17 JRT 클래스 91개를 담은 231,381-byte JAR(SHA-256 `2127023461f6c1884db3a174f4470512a506651f6660ad30ffc5523d7898c1c4`)를 확보하고 major 61을 확인했다. 이 보완본의 후속 no-preload·`-proc:none` 세션은 300초 준비 상한에서 끝났으며 module 요청 51개 중 49개 완료·ECJ JAR GET 5개 상태였다. helper 컴파일 결과는 없고 학습자 소스도 제공하지 않았으므로 클래스 보완의 충분성·학습자 class 61 생성·실제 Java 실행은 판정하지 않는다. 당시 추가 반복 실행을 중단했고 제품 Java 상태는 unavailable로 유지했다.

`[확정 결정]` bam의 계속 진행 요청에 따라 Java 17 실제 문제 실행 검증을 재개한다. `[제안]` 같은 cold 준비를 300초마다 끊어 반복하지 않고 기존 persistent cache·확인된 91-class JAR를 재사용한 단일 준비를 최대 15분·수신 128 MiB로 관찰한다. 이는 고정된 신뢰 helper의 진단 예산이며 제품 실행 시간 제한이 아니다. 30~60초마다 단계·새로 완료한 range·수신량을 확인하고 시간 상한만으로 불가능을 판정하지 않는다. 기존 JAR로 compiler 결과에 먼저 도달하며 추가 클래스 누락이 확인될 때만 실제 Java 17 java.base 공급 범위를 검토한다. 성공 세션의 `cjGetRuntimeResources()`를 보존해 이후 공식 preload 입력으로 쓰며 현재 세션을 재초기화하지 않는다. 학습자 코드의 실행 제한은 준비 다운로드와 분리하고 네트워크 활동으로 연장하지 않는다. helper class 52 → 고정 학습자 class 61/minor 0·실제 stdout → 원본 첫 Quest 공개 6개 → 오류·취소·격리 → 실제 제품 준비/실행 연결 순서로 증거를 남긴다. 기존 UI preview 서버는 유지하며 해당 runtime 실험을 제품 ready로 표시하지 않는다.

`[현재 사실]` 미채택 TeaVM Java 21 실험은 [공식 teavm-javac](https://github.com/konsoletyper/teavm-javac)의 브라우저 compiler로 class major 65(Java 21)를 생성하고 `generateWebAssembly`로 변환한 WASM을 실제 Chrome Worker에서 실행했다. 이는 Java 21 언어·표준 API 전체 지원이나 Java 17 JVM 호환을 입증하지 않는다. `quest-java-total-price`의 기존 기준답안 소스는 그대로 컴파일하고 별도 신뢰된 정적 wrapper로 호출했으며, 원본 공개 6개를 각각 fresh Worker·WASM 인스턴스에서 실행해 BigInt 기반 10진 정수 비교로 6/6 일치했다. 최댓값 `20001000000`을 포함하며 Worker 6개 종료 후 활성 Worker는 0이었다. 임시 정적 서버에서 해당 실행의 네트워크는 GET 17·POST 0·외부 요청 0이었다. 이는 해당 고정 소스 실행의 관찰이며 임의 학습자 코드의 통신 차단 증거가 아니다.

근거는 `/private/tmp/teavm-javac-probe/RESULT.md`와 `quest-result.json`이다. 검증 compiler WASM SHA-256은 `a79245353ac623df4fde5740bb2bedacedc9c98544253f01aa4b63268f9cb8ba`, 생성된 Quest WASM은 `c6a861c12a29e077f378e152bfe82bcc20000ac719e328dbf44cc0898311f7a8`이며 SDK·runtime·원본 source/publicTests의 정확한 hash는 같은 receipt에 있다. 공식 playground URL은 가변 자산이므로 고정 릴리스로 표현하지 않고 실제 내려받은 바이트로 식별한다. TeaVM compiler의 Apache-2.0 및 포함 OpenJDK의 GPLv2 with Classpath Exception 고지를 보존해야 한다. 제품 의존성·원본 문제·JUnit 변경은 0이며, 대표오답·오류·static 상태 부정 검증·실행 중 취소·interop/네트워크 격리·CT/JUnit·GitHub Pages 게시와 제품 통합은 아직 검증하지 않았다. 정상 종료 후 Worker 폐기를 무한 루프 취소 PASS로 확대하지 않는다.

`[현재 사실]` 후속 고정 `Main` 진단에서 HTTP Worker 응답에 `default-src 'none'; connect-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'none'` CSP를 적용하자 `load(app.wasm)`가 `compiler.wasm-runtime.js:1:8092`의 `new Function`에서 EvalError로 실패했다. stdout 0·GET 3·POST 0·외부 요청 0·종료 후 활성 Worker 0을 확인했다. 근거는 `/private/tmp/teavm-javac-probe/csp-runtime-result.json`이다. 현재 고정된 기본 runtime은 임의 JS 문자열 실행을 허용하지 않는 안전 gate를 통과하지 못해 추가 불신 소스 실행과 제품 활성화를 중단했다. `unsafe-eval`을 열어 우회하지 않는다. 앞선 Quest 6개 PASS는 고정 소스의 기능 증거로 보존하며 이 실패를 Java 브라우저 실행 일반의 불가능으로 확대하지 않는다. 이 Java 21 경로는 미채택 이력으로 보존하며 재개하지 않는다. Java 17 후보는 별도 호환성·안전 검증을 따른다.

### 컴파일·실행 분리와 후속 gate

`[현재 사실]` 후속 Java 17 고정 record의 class 61/minor 0·실제 stdout `17`, 원본 첫 Quest의 공개 6개·대표 int overflow 오답을 확인했다. 예외가 발생해도 CheerpJ 종료 코드가 0인 사례가 있어 exit만으로 성공 판정하지 않는다. typed method 호출은 원본 공개 6개와 `9007199254740993L`을 JS bigint로 정확히 운반했다. 별도 opaque iframe(`allow-scripts`, same-origin 권한 없음)의 Worker에서도 고정 `Solution.class`를 `/str`로 전달하고 `runLibrary('/str/')` 한 번으로 공개 6개 typed 결과가 일치했다. class는 265 bytes·major 61/minor 0·SHA-256 `e7d0b1dd87634c2c0c887c58212956bb521a092577cec4d6cc99653e054f08ae`, opaque 결과는 `/private/tmp/bam-java17-opaque-fs-probe/result-solution.json`(SHA-256 `f2e027b105ac975c4913e6526558d1a146409f28b9f99de840bfde87e1bd2c1d`)이다. 동일 실행에서 serviceWorker 접근 오류가 있어도 결과는 완료됐으므로 그 오류를 앞선 대기 원인으로 확정하지 않는다. 이들은 고정 소스의 기능 증거이며 사례별 fresh 상태·취소·학습자 네트워크/interop 격리·제품 연결은 아직 PASS가 아니다.

`[현재 사실]` 앞선 persistent profile 진단 중 Playwright `context.route`를 등록한 실행은 [공식 문서](https://playwright.dev/docs/api/class-browsercontext#browser-context-route)에 따라 HTTP cache가 비활성화된 계측 조건이다. 기록한 수십 초·수분을 실사용 cold/warm 성능으로 일반화하지 않는다. `responseContentLengthSum`도 응답 헤더의 합이며 실전송량이 아니다. 성능 수치와 byte 상한 판정에는 각 영수증의 실제 계측 방식을 구분한다.

`[현재 사실]` 후속 JRT 이름 탐색 adapter는 기존 `jrt:/modules/java.base`의 실제 class bytes로 record·원본 Solution·List/Map 소스를 Java 17 class 61로 컴파일했고, 별도 compiler Worker에서 학습자 class를 실행하지 않고 부모로 반환했다. bootstrap class 52 helper와 학습자 class 61을 구분한다. Java 21 `String.splitWithDelimiters` API 거부도 확인했다. 다른 module·exports·원본 JUnit 지원을 입증한 것은 아니다. 근거는 `/private/tmp/bam-java17-browser-probe/chrome-jrt-compiler-result.json`, `chrome-compiler-worker-result.json`, `chrome-jrt-api-negative-result.json`이다.

`[현재 사실]` opaque Worker의 유한 Java 호출 Promise pending 중 취소·후발 결과 거부·새 VM의 static/property 초기화를 확인했다(`result-cancel.json`, SHA-256 `71d30263c58f4c738e67bb14a3929f9c3b5279d4c2d922416b903c8b30789eff`). Java sleep 내부 진입까지 관찰한 것은 아니다. 후속 cache-only prototype은 부모가 공식 CDN 자산 11개·42,614,911 bytes를 먼저 준비하고 executor의 `connect-src 'none'` 아래 원본 공개 6개를 private MessagePort의 bigint 결과로 통과했다. raw postMessage 위조는 채점에서 무시했고 실행기 외부 요청은 0이었다. 별도 고정 fetch·WebSocket·external importScripts·dynamic import 부정 검사는 CSP로 차단됐다. 근거는 `/private/tmp/bam-java17-opaque-fs-probe/result-cache-only.json`(SHA-256 `69aa32e5d857d9e33da99d52066f9ba9201568498d1dd0b7688aa16c20673e06`)과 `result-cache-csp-negative.json`(SHA-256 `117d138b29a3f4c81910c4e62eb879fac108f8927c628047fa04bf11d8d9e61d`)이다. 새 cache-only 경로의 취소·중첩 Worker·Java→JS interop와 실제 제품 연결은 후속 검증이며 앞선 취소 PASS를 자동 승계하지 않는다.

`[확정 결정]` 승인된 브라우저 Java 17 제품 연결은 다음 경계를 따른다. 첫 Quest 검증을 다른 Java 문제·CT 전체 완료나 최종 게시 조건 충족으로 확대하지 않는다.

- 준비: `java-browser-assets.js`의 고정 버전·URL·hash·크기 manifest를 한 곳에서 관리한다. 부모가 학습자 입력과 무관한 공식 CDN 자산을 세션 RAM에 준비하고 executor에 전달한다. 실행 중 cache miss는 외부 fallback 없이 engine error다. 임의 URL·query·header·body를 부모 fetch에 전달하는 RPC는 없다. runtime 원본 본문을 변경하거나 저장소에 재배포하지 않는다. 짧은 bootstrap은 CheerpJ 4.3 내부 초기화 API에 의존하므로 버전 변경 때 재검증한다. 실제 사용 메모리와 최초 네트워크 비용을 표시하며 완전 오프라인·재방문 캐시를 보장하지 않는다.
- 컴파일: `java-browser-compiler.js`와 일회용 compiler Worker는 고정 ECJ 3.33·신뢰 helper만 로드하고 `proc:none`, source/compliance/target 17, preview off로 컴파일한다. 학습자 class는 실행하지 않는다. helper의 `compile(String source)`는 첫 Quest의 고정 `Solution.java`를 받아 `{status, diagnostics, classesBase64}` JSON 문자열을 typed return으로 돌려주고 class output은 메모리에만 모은다. 공개 JS API `compileJava({source,className}, {signal,assets})`는 `{status, diagnostics, classes}`를 반환하며 classes는 binary name별 Uint8Array다. 기본 패키지의 Solution뿐 아니라 nested·추가 package-private class도 빠짐없이 전달하고 compile_error에서는 빈 classes만 반환한다. 콘솔·exit·marker·이전 `/files` 산출물로 성공을 판정하지 않는다. client는 현재 runId·정확한 schema·class 61/minor 0을 검사하고 valid→invalid 요청에서 이전 class를 재사용하지 않는다. 초기 상한은 UTF-8 source 128 KiB, diagnostics 32 KiB/100개, class 합계 8 MiB/256개이며 VM heap 보장과 구분한다. 실제 제한 집행을 검증한다. ECJ 출처·라이선스·helper source/hash를 함께 보존하고 임시 JRT 추출 ZIP은 제품에 넣지 않는다.
- 실행: `java-browser-provider.js`는 기존 `capabilities/run/cancel` DTO를 제공한다. 검증된 Quest ID·revision만 허용하고 공개 사례마다 새 opaque iframe/Worker VM을 사용한다. iframe은 `allow-scripts`만 갖고 executor는 준비 자산만 읽는다. class bytes는 `/str`에 주입하며 부모가 입력·기대값·test ID를 소유한다. private port는 strict closure에 숨기고 bound send를 사용한다. raw 메시지와 오래된 generation은 채점·진도에 반영하지 않는다. typed primitive 반환·오류를 부모가 비교하며 long은 bigint로 유지한다. compile 오류·runtime 오류·취소·timeout·미지원 상태를 구분하고 종료 시 port·Worker·iframe을 회수한다.
- UI: 동일 provider 상태를 마이페이지·Quest·CT에 연결한다. 실제 준비는 `idle → preparing → ready | error`, 취소는 준비 요청 abort·generation 폐기 후 idle이다. 중복 준비를 막고 다운로드 중에도 읽기·편집·저장을 유지한다. ready는 해당 세션의 자산·compiler 초기화와 검증된 실행 capability 준비를 뜻하며 localStorage에 저장하지 않는다. 같은 앱의 route 이동은 준비 상태를 유지하지만 새로고침·탭 종료 뒤에는 RAM 자산이 사라져 다시 준비한다. 현재 준비 자산은 약 47 MiB이며 다운로드 상태는 실제 수신량을 표시한다. 개별 문제 지원은 별도이므로 미지원 Quest·CT는 이유를 표시하고 실행을 막는다. 준비 취소·오류·route 이동·재시도에서 초안과 호칭을 보존한다. 상태는 텍스트와 접근 가능한 알림으로 제공하고 가짜 진행률을 만들지 않는다. native와 명시적 opt-in 경로는 우선순위·계약을 보존한다.

`[현재 사실]` cache-only 경로에서 취소·늦은 결과·사례별 fresh 상태, 자산 요청 차단과 부모 저장소 접근 거부를 확인했고 Pages 하위 경로의 실제 풀이·저장·복원도 통과했다. 검증된 Quest 4개·CT 72개만 ID/revision으로 활성화했다. Java→JS 반사 후보 하나는 생성자 접근이 거부됐지만 임의 학습자 코드의 모든 interop·네트워크·저장소 우회 경로가 입증된 것은 아니다. CT 25번째의 연속 검증 컴파일은 180초에 시간 초과했으나 해당 문제 단독 재검은 58.6초에 통과했다. 동시 Chrome 작업과 연속 VM 실행 중 어느 쪽이 원인인지는 확정하지 않았으며 제한 시간을 늘리지 않았다. 준비 예산으로 학습자 실행 제한을 연장하지 않고 opaque runtime의 eval 허용을 main 페이지 정책으로 확대하지 않는다.

### Java Quest·원본 JUnit 범위 확장

`[현재 사실]` 동일 제품 경로의 원본 Quest 4개는 공개 사례 24/24를 통과했다. CT는 원본 72문제의 공개 JUnit 메서드 그룹 168/168·호출 501/501을 확인했다. 단, `coding-test-java-bridge-bkt-01`의 원본 Java 25 기준 풀이에 있는 `List.removeLast()`는 Java 17에서 컴파일되지 않아, 이 문제의 **기준 풀이 검증만** `remove(size - 1)`로 바꾼 파생본을 사용했다. 문제·원본 공개 JUnit 소스와 제품 코드는 바꾸지 않았다. 검증된 ID/revision의 제품 지원 gate를 열었으며 다른 버전의 언어/API·브라우저 지원으로 확대하지 않는다.

`[현재 사실]` 첫 Java CT의 원본 JUnit 6.1.3 parameterized method를 패키지 adapter·기존 SolutionInvoker와 함께 class 61로 컴파일하고, 별도 Worker에서 원본 5 invocation PASS와 대표오답 5개 실패를 확인했다. `/str`의 하위 디렉터리 직접 주입은 지원되지 않아 검증된 class bytes를 메모리 JAR로 묶는 방식으로 실행했다. 근거는 `/private/tmp/bam-java17-product-compiler/ct-execute-receipt.json`(SHA-256 `6391d40177b16ed4f750a605e4761bacfda5577e32521fef07b44dc5d1a01f70`)과 `ct-execute-wrong-receipt.json`(SHA-256 `951db34c7f20152f77edf62aee1dced9c67734c8cb48bbb5516f182cf214bfff`)이다. 이는 원본 JUnit 기능의 대표 증거이며 cache-only opaque 제품 경로·전체 CT 검증을 대체하지 않는다.

`[확정 결정]` 첫 Quest 이후에는 같은 compiler·opaque executor를 다음과 같이 확장한다. 원본 소스·공개 평가·Java 17 기준은 유지한다.

- compiler의 `compileJavaSources({sources:[{path,source}],entryClass,profile}, {signal,assets})`를 기존 내부 구현으로 제공하고 첫 Quest `compileJava` 호출은 작은 wrapper로 유지한다. trusted provider만 `quest` 또는 `junit` 고정 classpath profile을 선택한다. source 경로는 원본 manifest와 고정 adapter 경로에 한정하고 중복·절대경로·상위 이동을 거부한다. 원본 공개 test/provider/helper와 필요한 typed adapter를 함께 컴파일하되 annotation processor·학습자 class 실행은 허용하지 않는다. 기존 source/output 상한은 묶음 전체에 적용한다.
- 산출물은 검증된 dotted binary name별 bytes다. 패키지·nested class를 빠짐없이 메모리 JAR에 넣고 `/str`의 단일 JAR로 전달한다. JAR 경로는 검증한 이름에서만 생성하고 학습자 산출물이 신뢰 runner/helper를 덮는 이름 충돌을 거부한다. compiler 담당은 작은 class-JAR utility와 신뢰 JUnit runner·정확한 JUnit 6.1.3 자산 출처를 소유하고, 공통 manifest는 provider 담당 한 명이 유지한다. 임의 URL·사용자 classpath·runtime 저장소 재배포는 추가하지 않는다.
- CT runner는 고정 공개 testClass·method·signature로 원본 JUnit을 선택하고 typed JSON으로 outcome, discovered/started/finished/passed/wrong/runtime/skipped/aborted/infrastructure, planStarted/planFinished, message를 반환한다. 부모는 기존 CT adapter의 invocation 계약으로 엄격히 변환하고 누락·불일치·infrastructure 오류를 PASS로 처리하지 않는다. `run`은 기존 첫 공개 method, `submit`은 전체 공개 method를 선택한다. 각 method는 새 VM을 사용하고 해당 method의 parameterized invocation은 같은 VM에서 실행한다. 기존 배열 identity·입력 불변·tolerance 평가를 바꾸지 않는다.
- Quest도 원본 signature·typed 반환·필수 배열 관찰을 유지해 기존 Java 문제별로 확대한다. 각 공개 사례의 새 VM, CSP·private port·취소·generation 검사는 공통 executor를 재사용한다. 대표 CT의 정상/오답/오류와 원본 provider·배열·freshness를 먼저 확인한 뒤 설치된 Java Quest와 CT의 문제 ID/revision별 전체 공개 평가 목록을 검증한다. 지원한 문제만 capability에 반영하고, 대표 문제나 첫 Quest만 통과한 상태를 사용자가 요청한 Java 문제 지원 완성·push 조건 충족으로 판정하지 않는다. 통합 경로 취소·늦은 결과·초안 보존과 실제 정적 브라우저 풀이도 검증한다.

### 마이페이지 호칭과 공통 Java 준비 UI

`[확정 결정]` bam은 로그인 없이 `#/my`에서 호칭을 이 브라우저에 저장하고, 마이페이지·Java Quest·Java 코딩테스트 문제 화면에 같은 Java 17 환경 준비 버튼과 상태를 제공하도록 승인했다. 준비 전에도 문제 읽기·코드 작성·초안 저장을 유지한다. 시스템 JDK 설치·탐색, localhost 자동 연결, 계정·서버 전송은 하지 않는다. 기존 [학습 기록](designs/learning-history.md)의 진도·재도전·저장 오류 표현은 유지한다.

- 호칭: `bam.dev.profile.nickname.v1`에 문자열 하나만 저장한다. 기존 BrowserStorage를 주입한 작은 호칭 repository로 읽기·저장·초기화하고 기존 progress 키에 섞지 않는다. 앞뒤 공백을 제거한 최대 20 Unicode 글자를 허용하며 제어문자는 거부한다. 빈 값 저장은 키를 지워 기본 호칭으로 돌아간다. 손상된 저장값은 기본 호칭으로 읽고 자동 덮어쓰지 않는다. 기본 표시는 `학습자`이며 모든 출력은 HTML escape한다. 저장 버튼으로 확정하고 실제 persistent 상태에 따라 `이 브라우저에 저장했습니다` 또는 `현재 화면에서만 유지됩니다`를 알린다. 읽기/렌더만으로 저장하지 않고 다른 origin이나 기기로 이전하지 않는다.
- 공통 준비 UI: 기존 view에 같은 순수 렌더 함수를 사용하고 앱이 상태 하나를 소유한다. 표제는 `Java 17 실행 환경`, 버튼은 `Java 환경 준비`다. provider 도입 전 상태는 `unavailable`이며 버튼을 disabled로 표시하고 `브라우저에서 Java를 실행하는 기능을 준비하고 있습니다. 지금은 문제를 읽고 코드를 작성·저장할 수 있습니다.`를 바로 옆에 설명한다. 가짜 다운로드·진행률·지연 Promise·준비 완료 표시·준비 클릭을 흉내 내는 이벤트를 만들지 않는다. provider 부재 시 unavailable UI는 임시 중간 산출물이며 사용자의 실제 준비·실행 목표 완료가 아니다. runtime 검증을 통과하면 같은 UI에 실제 준비 동작을 이어 연결한다.
- 후속 실제 상태: provider가 있을 때만 `idle → preparing → ready | error`로 전이한다. `idle`은 준비 가능, `preparing`은 실제 작업 중 중복 클릭 차단, `error`는 실제 실패 설명·재시도다. `ready`는 현재 세션의 검증된 Java 17 capability가 제공될 때만 인정하며 localStorage에 ready를 저장하지 않는다. 환경 준비와 개별 문제 지원은 별도이므로 ready가 draft-only 문제나 미지원 CT를 실행 가능으로 바꾸지 않는다. 이 전이는 위 제품 연결 단계에서 실제 provider와 함께 구현하며 준비 자산만으로 미검증 문제를 활성화하지 않는다.
- 기존 native/명시적 opt-in transport 코드는 보존한다. 기본 Pages 화면에서는 기존 `로컬 Java 연결`·Java 서버 주소 안내를 새 browser 준비 패널로 대체하되 runtime capability·실행·완료 gate를 완화하지 않는다. 실제 native/opt-in 환경의 별도 실행 증거를 browser 준비 완료로 사용하지 않는다.
- 범위와 검증: `src/app.js`, `src/ui/my-page-view.js`, `src/ui/code-quest-view.js`, `src/ui/coding-test-view.js`의 연결과 작은 공통 준비 view·호칭 repository, 필요한 기존 스타일만 변경한다. 레이블·native 버튼·상태 설명의 키보드/스크린리더 흐름과 기존 semantic token을 사용한다. 호칭 저장·초기화·메모리 fallback·재방문·escape, 세 화면의 동일 unavailable 표시, 추가 다운로드/로컬 연결 0, Java 실행 gate 불변·초안 보존을 focused 검사와 대표 실제 브라우저 흐름으로 확인한다. 전체 학습 콘텐츠와 runtime 실험은 이 UI 변경의 검증 범위가 아니다.

`[현재 사실]` 호칭 repository·공통 준비 view와 기존 앱/문제 view·사이드바·스타일을 포함한 제품 파일 8개의 UI 구현을 독립 인수했다. `http://localhost:41746` preview에서 `#/my` 호칭 trim·이모지 포함 저장/새로고침 복원·escape·21글자 거부·빈값 기본 호칭 복귀, Java Quest/CT의 unavailable 표시와 읽기·편집·route 왕복 후 초안 보존이 PASS했다. 작성자의 focused 63개 PASS와 변경 JavaScript syntax 검사를 재사용했다. 브라우저 저장 실패 강제 검사는 실제 화면에서 실행하지 않았으며 native/명시적 opt-in 실행은 기존 코드를 보존했지만 이번에 재검증하지 않았다. 이 기록은 독립 UI 검증 인계이며 문서 작성자가 반복 실행한 결과가 아니다. 당시 unavailable UI는 중간 산출물이었다. 이후 실제 준비 provider를 연결했고 현재 검증 범위는 문서 첫머리의 최신 사실을 따른다.

### 재사용·격리·상태

기존 Quest/CT adapter의 `capabilities/run/cancel`과 요청·결과 DTO를 browser bridge의 접점으로 사용한다. ID/revision·공개 manifest·초안·진도·route·제출 규칙은 유지한다. Quest 공개 사례마다 새 VM 또는 WASM 인스턴스 상태를, CT 공개 method마다 새 VM 상태를 보장하며 parameterized method 내부 invocation은 같은 VM에서 실행한다. CT의 고정 JUnit 6.1.3·원본 test/provider/helper·typed adapter·배열 identity/입력 불변·tolerance를 바꾸지 않는다. 선정 후보에서 소스·표준 API·reflection·JUnit 호환이 입증되지 않은 문제는 지원 완료로 표시하지 않는다. `long`은 JS number로 축소하지 않는다.

브라우저 runtime 자산을 가져오는 권한과 학습자 Java의 네트워크 권한을 분리한다. 학습자 코드는 외부·loopback 통신, JS interop를 통한 UI/저장소 접근, 사용자 파일·프로세스 접근을 얻지 못해야 한다. 사용자 소스·개인 자료를 CDN이나 원격 컴파일/채점 서비스에 전송하지 않는다. WASM/JVM이라는 이름만으로 격리 PASS를 판정하지 않으며 실제 노출 API와 부정 검증을 확인한다. localhost token/session·OS sandbox·process group 종료를 브라우저 보장으로 그대로 인용하지 않는다.

한 번에 한 실행만 허용하고 준비 중·준비 실패·실행 중·취소·결과를 구분한다. 부모가 UI 응답을 유지하면서 learner 실행을 강제로 종료할 수 있어야 하며 종료 후 새 VM으로 재실행한다. 오래된 request 결과는 저장하지 않는다. 정상/오답·컴파일 오류·런타임 오류·timeout·output_limit·cancelled·engine_error·not_run 분류, 전체 공개 평가 PASS만 완료 기록하는 규칙을 유지한다. 준비·실행 실패 때 초안은 보존한다. 기존 native의 10초 compile·사례/CT method 3초·64 MiB heap·32 KiB 출력 수치를 무근거로 브라우저 보장에 복사하지 않는다. prototype에서 초기 다운로드/VM 준비와 compile/run 시간을 분리 측정하고 실제 집행 가능한 시간·출력·메모리 상한 및 차이를 기록한다.

### 최소 prototype 수용과 중단

1. 운영 제품과 분리한 정적 페이지에서 고정된 무해 Java 17 소스를 실제 컴파일·실행하고 버전·출력·시간·네트워크 요청을 확인한다. native Java/javac나 원격 실행을 사용하지 않는다. 이 첫 진단은 임의 학습자 코드 격리 PASS가 아니다.
2. GitHub Pages와 같은 정적 호스팅 조건에서 첫 `quest-java-total-price`의 공개 6개, 큰 long 정확도, 대표오답·컴파일 오류·예외를 실제 실행한다. 특별한 서버 응답 헤더·로컬 연결을 가정하지 않는다. 최초 준비와 실패 복구는 화면에 보인다.
3. 강제 종료 경로를 확인한 뒤에만 제한된 loop·출력/메모리 압박을 검사한다. 취소·화면 이동·다시 실행에서 UI 응답·VM 폐기·늦은 결과 차단·거짓 완료 0과 초안 보존을 확인한다. 학습자 네트워크/JS interop·저장소/파일 접근 차단을 실제 브라우저에서 독립 확인한다.
4. CT 지원은 원본 JUnit의 MethodSource·CsvSource·package-private class·배열/중첩 배열·identity·tolerance·method 간 freshness의 대표 검증부터 진행한다. 72문제 전체 활성화는 공개 168 method 그룹과 실제 invocation의 누락 없는 검증 뒤에만 가능하다. 대표 PASS를 전체 PASS로 확대하지 않는다.

컴파일 부재·원본 평가 호환 실패·강제 종료 불가·학습자 통신/interop 차단 불가·Pages에서 필요한 실행 조건 부재는 해당 후보의 실패다. 실패 증거를 보존하고 제품 활성화를 멈춘다. 원본 테스트 재작성·Java 결과 모사·무격리·원격 채점·유료 라이선스 구매로 우회하지 않는다. 확인된 브라우저와 문제만 지원 범위로 기록하고 공개 배포 완료는 실제 게시·실행 증거로 별도 판정한다.

## 소스 Java 브라우저 연결 — SOURCE-JAVA-BROWSER-v1

`[대체됨]` 아래의 준비·localhost 연결은 이전 구현과 검증 이력이다. 새 기본 사용자 흐름은 [BROWSER-JAVA-v1](#브라우저-직접-java-실행--browser-java-v1)을 따르며 기존 Java 25 실행 증거는 새 browser runtime 검증을 대신하지 않는다.

`[확정 결정]` [DEC-SOURCE-JAVA-IMPLEMENTATION-01](roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수)은 2026-09-24 bam의 “작업시작해”로 이 설계의 구현 착수를 승인했다. 기존 브라우저 방향과 조건부 모델 근거는 유지한다. source/fake·독립 검토·Java 없는 HTTP/브라우저 부정검증을 먼저 마치며 기존 문제·공개 테스트·평가 의미는 바꾸지 않는다. 실제 listener·준비 compile·Java/UI 검증은 각각의 선행 gate와 실행 증거로 판정한다.

`[확정 결정]` GitHub 소스를 가져와 기존 브라우저로 쓰는 흐름을 유지한다. `[제안]` 다음 계약은 opt-in Java 연결의 설계와 독립 검증 대상이다. 준비 명령·HTTP API·브라우저 연결 소스가 작성됐고 검증한 macOS 커널의 Chrome에서 Java Quest·CT 공개 평가와 취소를 확인했다. 이는 다른 OS·브라우저나 모든 문제의 지원 완료를 뜻하지 않는다. Electron·`.app`·DMG 생성은 이 경로의 필수 준비물이 아니다. 공개 GitHub Pages에는 로컬 연결을 자동 탐색·요청하는 기능을 넣지 않는다.

### 현재 진입점과 portable 준비

`[현재 사실]` 기본 `npm run dev`는 `127.0.0.1`의 단일 포트(`BAM_DEV_PORT`, 기본 4173)에서 GET/HEAD 정적 파일을 제공하고 `http://localhost:<port>`를 안내한다. 별도 opt-in Java transport·client와 준비·연결 명령을 작성했고 승인된 검증 환경에서 실제 Java Quest 서버·Chrome 화면을 실행했다. `desktop/main.cjs`가 trusted manifest·owner·공유 lock을 연결하고, `supervisor.mjs`는 전달받은 `bundleRoot` 아래 JDK/runner와 자기 모듈 옆 profile을 사용한다. `desktop:bootstrap`은 전체 Electron 앱을 빌드·실행하며 portable runtime 다운로드 명령이 아니다.

| 단계 | 제안 사용자 흐름과 실패 시 동작 |
| --- | --- |
| 소스 확보 | GitHub clone 또는 ZIP 해제 → Node.js 20 이상 → 기존 `npm run dev`. 기본 웹 동작은 유지하며 Java API를 열지 않는다. |
| 명시적 준비 | `npm run java:prepare -- --artifacts <고정자료폴더> --runtime <전용새폴더>`가 lock에 고정된 JDK/JUnit·라이선스를 검사하고 Quest/CT trusted source를 감독 아래 컴파일한다. 실제 검증은 `/private/tmp`의 새 `runtime-second`에 한정했다. 이는 예시 명령의 일반 사용자 출력 경로가 아니며 시스템 JDK도 사용하지 않는다. |
| 명시적 연결 서버 | `npm run dev:java -- --runtime <준비폴더>`는 기존 정적 handler와 같은 listener·같은 포트를 사용하고 준비본 검증 후 Java 모드를 연다. 검증 환경에서는 실제 Quest 화면을 실행했다. 포트 충돌이면 종료하며 기존 서버를 죽이거나 다른 포트로 자동 이동하지 않는다. |
| 브라우저 연결 | 기존 `http://localhost:<port>`에서 사용자가 “로컬 Java 연결”을 선택한다. 준비 안 됨·환경 불일치·다른 탭 소유·회수 중을 구분한다. 연결 전에도 정적 자료·작성·저장은 유지한다. |

최초 자료 확보의 네트워크와 평가 중 네트워크를 분리한다. 첫 구현은 lock에 고정된 배포 자료를 사용자가 사전 확보하고 준비 명령은 offline 검증·해제·컴파일만 수행하는 안을 권장한다. 자동 다운로드의 허용 host·redirect·hash·오프라인 cache 정책은 구현 전 별도 확정하며 이 설계로 네트워크 실행을 시작하지 않는다. `desktop/runtime-lock.json`의 Temurin JDK 25.0.4.1+1·JUnit 6.1.3의 정확한 archive/JAR hash·라이선스를 재사용하고 Electron archive는 요구하지 않는다.

준비 출력은 기존 supervisor가 읽는 `Resources/runtime/{jdk,java-runner,java-ct-runner,profiles}`와 runtime lock·trusted 콘텐츠 snapshot을 보존하는 전용 root로 한다. HTTP 요청으로 root·path·classpath·JDK·프로필을 선택하지 않는다. 서버의 로컬 시작 설정만 root를 정하며 canonical 경로·내부 symlink·실행 파일·소스/전체 class/provenance·공개 manifest hash를 검증한다. 다운로드·부분 해제·compile 실패는 완성 receipt를 만들지 않고 기존 준비본을 보존한다. 새 준비본은 새 경로에서 완성한 뒤 선택한다. `.bam-runtime` 같은 이름은 제안이며 정적 허용 root·백업·Git 게시 대상에서 제외해야 한다.

Quest runner와 JUnit/trusted tests/typed adapter 선컴파일도 실제 child 실행이다. 기존 full Electron build의 직접 `execFile(javac)`를 안전 감독 검증 없이 옮기지 않는다. 모든 준비 compile에 정확한 argv/env·deadline·abort·group/observer 회수·raw와 source/class provenance를 고정하는 기존 수명주기를 적용해야 한다. 검증된 동일 byte artifact 재사용과 새 컴파일 receipt를 구분한다. 준비 뒤 평가는 원래 Java 25/preview 금지·공개 테스트·3초/64MiB·sandbox·poison/reap 조건을 유지한다.

첫 실행 후보는 기존 검증 `darwin/arm64`·exact kernel·고정 JDK 조건만 재사용한다. portable은 폴더 위치를 옮길 수 있다는 뜻이며 Windows/Linux/다른 커널 지원 약속이 아니다. 환경 불일치는 Java unavailable이고 시스템 `JAVA_HOME`/`PATH` fallback이나 profile 완화는 없다. 추가 플랫폼·보안 업데이트 정책은 후속 결정이다.

### 새 HTTP 권한과 token bootstrap

이 API는 정적 서버의 편의 기능이 아니라 로컬 코드 실행 권한의 새 경계다. 운영 서버·계정·원격 채점은 만들지 않지만 로컬 listener가 코드 실행 요청을 받는다는 차이를 명시한다. 첫 모델은 같은 사용자 기기의 악성 외부 웹페이지와 잘못된 요청을 방어 대상으로 한다. 학습자 JavaScript는 같은 origin에서 실행되더라도 비신뢰 입력이며 아래 격리 대상이다. 사용자가 신뢰한 UI 소스 자체의 변조, 악성 확장 프로그램, 이미 사용자 권한을 가진 로컬 프로세스까지 token으로 격리한다고 주장하지 않는다.

Java 모드에서는 정적 자산·bootstrap·API 모두 `Host: localhost:<고정port>`의 정확한 단일 값만 허용하고 bind는 `127.0.0.1`로 유지한다. proxy/forwarded header로 이를 덮어쓰지 않는다. 정적 GET/HEAD 탐색에는 Origin을 요구하지 않는다. 권한 bootstrap과 API는 브라우저 기본 fetch mode인 `cors`의 same-origin POST로 호출하며, `Origin: http://localhost:<고정port>`·JSON content type·고정 custom header(`X-Bam-Java: 1` 제안)를 요구한다. Origin이 없거나 `null`·다중값·다른 host/port면 거부한다. `Sec-Fetch-Site: same-origin`은 추가 거부 조건이며 token/Origin 검사를 대신하지 않는다. Fetch Metadata를 제공하지 않는 브라우저는 초기 Java 연결 지원 밖으로 안내하고 검사를 조용히 완화하지 않는다. 다른 origin의 preflight에 CORS 권한을 주지 않으며 CORS만 권한 검사로 삼지 않는다. same-origin GET/HEAD에서 Origin이 생략될 수 있다는 점을 bootstrap GET 허용으로 우회하지 않는다. [Fetch 표준](https://fetch.spec.whatwg.org/)

`localhost`를 `127.0.0.1`로 안내하거나 포트를 자동 변경하면 localStorage origin이 달라진다. 기존 URL을 유지하고 사용자가 포트를 명시 변경하면 기록이 다른 origin에 남음을 안내한다. 브라우저 저장을 새 origin으로 자동 복사·초기화하지 않는다.

1. 사용자의 연결 동작 후 `/api/java/session`에 위 same-origin 조건의 POST를 보낸다. bootstrap body는 정확히 `{}`이고 `X-Bam-Java: 1`과 아래 일회용 `X-Bam-Java-Bootstrap` capability을 요구한다. 발급 전 session Authorization은 없지만 무권한 bootstrap은 허용하지 않는다. 서버가 Java opt-in·준비 상태·owner 부재·학습자 격리 gate·bootstrap capability를 확인한 뒤 암호학적 난수 256-bit token, `sessionId`, 새 서버 시작마다 다른 `serverEpoch`를 반환한다. UI 클릭은 안내 동작이며 서버 보안 판단을 대체하지 않는다.
2. token은 JSON 응답과 이후 `Authorization` header에만 싣는다. 응답은 `Cache-Control: no-store`, redirect 없음, credential cookie 없음이다. URL/query/hash·HTML 삽입·console/서버 로그·local/sessionStorage·백업에 token을 쓰지 않는다. 브라우저 JS 메모리와 서버 메모리에서만 유지한다.
3. 첫 범위는 서버 하나의 Java owner session 하나다. 다른 탭의 bootstrap은 409이며 기존 세션을 탈취·취소하지 않는다. 탭 간 token 공유·전달을 구현하지 않는다. reload는 새 세션이며 이전 token 복구나 pending run 자동 재전송을 하지 않는다.
4. 제안 heartbeat는 5초 간격, 마지막 정상 heartbeat 뒤 15초 lease다. 서버의 monotonic 시간으로 검사하고 실패한 인증 요청은 lease를 연장하지 않는다. background throttling·절전으로 lease가 끊기면 안전 취소될 수 있음을 안내한다. 이 수치는 모델 입력이며 실제 브라우저 검사 뒤 확정한다. 정상 heartbeat도 Java case deadline을 늘리지 않는다.
5. 명시 release·탭 종료의 best-effort release·lease 만료 시 세션 admission을 닫는다. 실행이 있으면 아래 회수를 끝낸 뒤 token을 폐기하고 새 owner를 받는다. 회수 불명 상태에서는 새 token 발급도 막는다.

Java 모드 정적 handler는 허용 root의 canonical 경로 밖을 가리키는 symlink를 거부하고 runtime·scratch·receipt를 제공하지 않는다. token/source를 error trace에 남기지 않으며, API 요청 body를 로깅하지 않는다. 공개 콘텐츠나 결과 문자열은 현재 UI의 escape 경계를 유지한다.

### 학습자 Worker의 비권한 경계와 활성화 gate

`[제안]` 초기 설계에서는 학습자 Worker 격리의 실제 브라우저 부정검증 전 bootstrap·Java start를 0으로 둔다. 이후 격리 Worker·navigation capability의 실제 Chrome 부정검증은 독립 인수했다(범위는 [구현 카드](roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수)). Origin/custom header·UI 클릭·owner 부재만으로 UI와 학습자 Worker를 구별할 수 없다는 경계는 유지한다. 감독 preflight와 승인 뒤 제품 Java gate는 열렸으며 검증 대상은 확인된 환경에 한정한다.

- 첫 구현은 학습자 JavaScript 실행을 고정된 self-contained classic Worker entry 하나로 묶는다. trusted evaluator의 필요한 코드는 그 자산에 포함하며 module import에 `script-src 'self'`를 열어주지 않는다. Worker entry의 실제 HTTP 응답에 `Content-Security-Policy: default-src 'none'; connect-src 'none'; script-src 'unsafe-eval'; worker-src 'none'`을 적용한다. `unsafe-eval`은 기존 학습자 Function 평가에 필요한 Worker 내부 권한일 뿐 URL script source·UI 권한을 허용하지 않는다. `importScripts`·동적 import·하위 Worker/SharedWorker와 blob/data 경유 생성을 허용하지 않는다. CSP는 UI 문서만이 아니라 Worker 응답 자체에 적용해야 하며 적용 실패 시 Java 모드는 비활성이다. [CSP3](https://www.w3.org/TR/CSP/)
- 기존 module Worker를 포함한 모든 학습자 실행 진입점·캐시·후속 실행문맥을 식별한다. Java 모드에서 제한 없는 옛 entry를 새로 만들 수 없어야 한다. UI의 worker-src도 정확한 격리 entry로 제한하며 임의 URL/blob/data Worker를 열지 않는다. 학습자 결과의 postMessage는 제한된 결과 DTO로만 처리하고 URL fetch·bootstrap·run을 대신 수행하는 명령으로 해석하지 않는다. bootstrap capability·session token·인증 header는 Worker 메시지나 공개 자산에 넣지 않는다.
- 이전 서버/탭에서 살아 있던 제한 없는 Worker는 새 응답 CSP로 소급 격리되지 않는다. terminal secret 입력 대신 정확한 Host와 `Sec-Fetch-Mode: navigate`·`Sec-Fetch-Dest: document`·`Sec-Fetch-Site: none|same-origin`이 모두 있는 top-level HTML 응답에만 256-bit 일회용 bootstrap capability를 전달한다. iframe/script/Worker/fetch 요청이나 same-site/cross-site·헤더 누락에는 비밀을 보내지 않으며 fallback은 없다. 외부 링크로 들어온 읽기 화면은 유지하되 Java 연결은 정확한 주소의 명시적 재진입으로 안내하고 자동 이동하지 않는다. `frame-ancestors 'none'`으로 프레임 삽입을 막고 `Cache-Control: no-store`와 `Vary: Sec-Fetch-Mode, Sec-Fetch-Dest`를 설정한다. 브라우저의 Sec-* 헤더는 스크립트가 위조할 수 없고 Worker fetch가 navigate/document 요청으로 바뀌지 않는다는 경계를 사용한다. [Fetch Metadata](https://www.w3.org/TR/fetch-metadata/)의 브라우저 요청 보장이며 로컬 OS 프로세스·확장 프로그램 방어로 확대하지 않는다.
- capability는 응답의 고정된 nonce 적용 초기화 코드로 UI 메모리에만 인수하고 임시 DOM 전달 요소는 즉시 제거한다. URL·정적 JS 파일·저장소·백업·로그·Worker 메시지에는 남기지 않는다. UI는 `X-Bam-Java-Bootstrap`으로 session POST에 제출한다. session token은 기존대로 JSON 응답·Authorization에서만 다루며 HTML에 넣지 않는다. capability 수명은 제안 60초이고 serverEpoch에 결합하며 서버가 원자적으로 1회 소비한다. owner가 없을 때 새 정상 navigation은 미사용 이전 capability를 무효화한다. owner가 있으면 새 capability를 발급하지 않고 연결 중 안내/409를 제공하며 소유권을 빼앗지 않는다. reload는 기존 owner의 release·lease 회수 뒤 새 navigation/새 세션으로 연결하고 token·run을 자동 복원하지 않는다. 만료·used nonce·이전 epoch·캐시/BFCache 복귀의 오래된 값은 거부하고 실행은 0이다. 현재 pending 초안의 저장 성공을 확인한 뒤 사용자의 명시적 새로고침/재연결을 안내하며, 저장 실패 시 화면·초안을 보존하고 자동 이동·자동 Java 실행은 하지 않는다. 읽기만 하는 탭은 owner를 자동 획득하지 않는다. Java origin을 제어하는 Service Worker가 없어야 하며 등록/제어 없음과 no-store 동작을 실제 브라우저에서 확인하기 전 gate는 false다. page XSS·신뢰 UI 소스 변조는 별도 신뢰 경계이며 학습자 코드는 이 예외에 넣지 않는다.
- 실제 브라우저 gate는 Java child 대신 무해한 API 관찰 경계를 사용해 검증한다. owner 없는 때·UI owner가 있는 때·release 후·서버 재시작 뒤의 learner fetch/XHR/WebSocket/EventSource, importScripts/import, nested Worker·blob/data, 오래 살아 있는 옛 Worker, 위조 결과 메시지로 bootstrap/run·토큰 탈취·UI 대리 실행을 시도한다. 현재 격리 Worker에서는 네트워크 요청이 차단되고, 옛 Worker 요청도 navigation capability 없이 bootstrap 발급 0이어야 한다. fetch의 Sec-* 위조 시도, iframe·script·Worker HTML 요청, no-store/Vary·새로고침·used/expired nonce·기존 owner·Service Worker 제어 여부도 확인한다. 정상 top-level UI만 capability 교환·인증에 성공하고 학습자 정상 평가·취소는 유지해야 한다. 지원 브라우저별 실제 응답 header·요청 관찰·후발 메시지 차단 증거가 필요하며 정책 문자열이나 논리 gate fixture PASS로 대체하지 않는다.

### 요청·중복·결과 계약

제안 endpoint는 `/api/java/session`, `/api/java/capabilities`, `/api/java/run`, `/api/java/cancel`, `/api/java/heartbeat`, `/api/java/release`로 제한한다. bootstrap 외에는 token과 `sessionId`를 검사한다. 임의 명령·파일·테스트·환경 변수를 실행하는 endpoint는 없다. 경로명과 명령명은 구현 전 변경 가능하지만 권한·수명주기 불변조건은 유지한다.

run envelope는 `{ sessionId, kind, request }`이며 kind는 Quest/CT 두 종류다. 내부 request는 기존 Quest의 `{questId, revision, source, requestId}` 또는 CT의 `{problemId, revision, source, requestId, mode}`를 그대로 사용한다. `runId = requestId`이며 서버가 canonical DTO 전체의 digest를 계산한다. source는 UTF-8 20KiB, HTTP body는 32KiB 상한을 읽는 도중 적용한다. 길이 header만 믿지 않고 chunked 입력도 제한하며 body 수신 timeout 제안은 5초다. 알 수 없는 필드·형식·mode·revision은 실행 전에 거부한다. 문제/선택된 공개 테스트는 서버가 시작 때 고정한 trusted manifest만 해석하고 client의 source 외 실행 자료를 신뢰하지 않는다.

| 요청 상태 | 서버 동작 |
| --- | --- |
| 새 유효 runId, slot 비어 있음 | 첫 await/spawn 전에 세션의 ID와 digest를 예약하고 전역 Quest/CT 공통 slot을 소유한다. 실행 queue·자동 이전 실행 취소는 없다. |
| 같은 session/runId·같은 digest, pending | 202 pending만 반환하고 child를 다시 시작하지 않는다. 최초 run 응답은 완료까지 유지하며 사용자가 pending 조회를 반복해도 새 실행이 되지 않는다. |
| 같은 ID·다른 digest | 409 conflict, 기존 실행·결과 보존. source 수정 후 재실행은 새 ID를 사용한다. |
| 같은 ID·보존된 terminal receipt | 동일 receipt 반환, 실행·새 제출·완료 추가 0. client도 동일 ID의 중복 저장을 막는다. |
| 다른 실행 진행 중 | 409 busy. 다른 탭/owner의 cancel은 403. 소유 세션의 cancel만 해당 runId를 중단한다. |
| 이미 지난 ID의 상세 receipt가 없음 | 410 expired. 기억에서 사라졌다는 이유로 같은 ID를 새 실행으로 받지 않는다. |

서버 메모리 제한 제안은 세션당 seen-ID/digest tombstone 128개, terminal report는 최근 1개와 active run만 보존하는 것이다. 128개를 쓰면 새 run은 429이고, active 회수 완료 후 명시 재연결한다. 세션 만료 시 old token으로 ID를 재사용할 수 없다. 이 제한은 기존 학습 기록 보관 정책을 변경하지 않으며 서버에 source나 사용자 진도를 영구 저장하지 않는다. body/header 수신 시간·세션 수·report 상한도 구현 전 검사값으로 고정하고 무제한 연결/결과 캐시를 두지 않는다.

응답은 `serverEpoch/sessionId/runId/kind/sourceSha256/revision`과 기존 report를 결합한다. 브라우저 adapter는 이 값과 현재 화면의 실행 generation이 모두 일치할 때만 결과를 표시·저장한다. 편집·다른 문제 이동·취소·재연결로 오래된 결과가 되면 새 성공/완료로 저장하지 않는다. quick/submit·Quest/CT의 기존 진도 분리는 유지하며 중복 receipt 수신을 새로운 제출로 만들지 않는다. 서버 재시작·연결 손실은 결과 불명이지 학습자 오답이나 성공이 아니다.

### slot·abort·서버 종료

상태는 `disabled → ready → owned-idle → running → aborting/reaping → owned-idle`이며 세션 종료는 회수 후 `ready`, 회수 불명은 `poisoned`로만 간다. lock은 HTTP 연결의 존재가 아니라 실제 실행·회수 완료를 기준으로 유지한다. pre-start cancel도 예약된 실행에서 찾아 기존 already-aborted의 cancelled/not_run 결과를 사용하며 javac/JVM launch는 0이어야 한다.

최초 run 응답이 정상적으로 완료되기 전 연결이 끊기거나 lease가 만료되면 abort한다. Node의 요청 `IncomingMessage.close`는 정상 body 완료에도 발생하므로 그 이벤트만으로 cancel하지 않는다. upload 중단은 `req.complete`/aborted 상태로, 원소유 run 응답 이탈은 `ServerResponse.close`와 정상 `finish`를 구분해 판단한다. 중복 pending 조회 응답의 종료는 원소유 응답 이탈이 아니며, 여러 종료 이벤트가 와도 abort·cleanup은 한 번만 시작한다. `finish`도 브라우저의 결과 수신·저장 ack를 뜻하지 않는다. 실제 TCP/browser 검증은 순수 상태 모델 밖이다. [Node HTTP 요청 close](https://nodejs.org/api/http.html#event-close_3), [응답 close/finish](https://nodejs.org/api/http.html#class-httpserverresponse)

재전송이나 heartbeat가 이미 aborting인 run을 되살리지 못한다. pagehide/release는 보조 수단이며 브라우저 close event 전달만으로 회수를 보장하지 않는다. 원래 runner의 TERM→유예→KILL→최종 관찰·observer 종료·scratch 정리와 raw 보존 순서를 유지한다. 정상 결과도 회수가 확인된 뒤에만 terminal로 내보내고 slot을 해제한다.

Ctrl+C/SIGTERM·서버 종료 요청은 admission 차단→세션 무효화→active abort→회수 완료→listener 종료 순서다. 먼저 `process.exit()`하여 detached JVM을 남기지 않는다. HTTP host 자체의 예기치 않은 종료에는 기존 검증용 외부 감독에서 사용한 정확한 owned PID/PGID·실행 경로/workroot 관찰과 별도 회수 경계를 좁게 재사용하는 안을 preflight해야 한다. 이 감독의 실제 제품 연결이 확인되기 전에는 강제 종료 안전을 PASS하거나 실제 실행을 허용하지 않는다. 범용 process manager·추가 port·넓은 process kill은 만들지 않는다.

poison·회수 불명은 Java admission을 닫고 raw와 해당 scratch를 보존한다. 첫 child spawn 전에 해당 checkout의 비공개 감독 상태 위치에 미완료 marker를 기록·확인하고 실패하면 launch하지 않는다. HTTP host와 독립된 회수 관찰이 owned child/group/observer 부재를 확인한 뒤에만 이를 완료로 닫는다. PID 기록 전 host 종료도 marker가 남으므로 재시작 시 unknown으로 닫힌다. 새로운 epoch/token·runtime 폴더 선택·포트 변경으로 이 blocker를 초기화하지 않는다. 같은 checkout의 Java opt-in host 중복 소유도 거부해야 하며 다른 사용자 프로그램까지 전역 잠금한다고 주장하지 않는다.

서버 재시작은 미완료 marker와 독립 회수 증거를 먼저 읽고, 증거 부재·해석 실패·남은 owned 실행·cleanup unknown이면 slot을 unavailable로 인수한다. 새 token 발급과 launch는 0이고 원래 raw를 보존한다. 정확한 소유를 확인한 회수 또는 부재 증거 없이 marker를 삭제하거나 수동 재실행 안내로 우회하지 않는다. 구체 marker·감독 인계와 부모 종료 후 회수 연결은 독립 preflight의 필수 반환점이다. 다른 프로세스를 추정해 종료하거나 사용자 기록을 cleanup하지 않는다.

### 오류·UX·단계별 검증

| 응답/상태 | 사용자 안내·저장 의미 |
| --- | --- |
| 400/413/415 | 요청 형식·크기·content type 오류. Java child 0, 학습 결과 생성 0. |
| 401/403 | 세션 만료·token/Host/Origin/owner 거부. 자동 재연결·자동 실행 없이 연결 상태만 안내. |
| 409/410/429 | 다른 실행/세션 사용 중·ID conflict·지난 결과 만료·세션 한도. 기존 자료를 보존하고 명시 취소/재연결 선택 제공. |
| capability unavailable / 503 | opt-in 안 됨, 자료 누락·불일치, 미검증 OS, 회수 중/poison을 구분. 작성·정적 열람·저장은 유지하되 실행 버튼은 닫음. default dev의 API 부재는 정상 웹 모드다. |
| terminal HTTP 200 | 실행 완료의 운반 성공이며 정답을 뜻하지 않음. 기존 report의 wrong_answer·syntax_error·runtime_error·timeout·output_limit·cancelled/not_run·engine_error 분류를 그대로 해석. |
| 연결 중단·500/서버 재시작 | “실행 결과를 확인하지 못함”으로 표시. 원문 초안 보존, 거짓 성공/완료/학습자 오답 저장 0, 자동 재실행 0. |

| 단계 | 작은 수정 경계·완료 조건 |
| --- | --- |
| 1. 계약 모델 | Host/Origin/token·ID reservation·shared slot·abort/reap·stale generation의 순수 모델. wrong origin/bootstrap, duplicate pending/terminal/conflict, cancel 전후 race, lease/stop, unknown reap, active/cleanup-unknown 상태에서 restart, old epoch replay, port 충돌을 별도 oracle로 검사. 정상 req.close와 응답 이탈의 의미를 구분하되 모델 PASS는 실제 HTTP/OS 증거가 아님. |
| 2. source/fake | `scripts/dev-server.mjs`의 기본 정적 동작 보존, opt-in handler·좁은 transport adapter·runtime 준비 함수. 실제 listener/Java 없이 boundary fake로 거부·한도·상태·중복 저장을 검사하고 독립 코드 검토. |
| 3. 실행 없는 준비 구조 검토 | Electron 없는 root·canonical path·archive/hash/license·전체 class provenance와 Quest/JUnit/trusted compile의 감독·회수 계획을 검토한다. clone/ZIP·한글 공백 경로·원본 보존 조건을 고정하되 listener·compile·Java 실행 없이 child 0으로 진행한다. |
| 4. HTTP/브라우저 preflight | 고정 origin·token 비노출·cross-origin/DNS rebinding형 요청 거부·body timeout/상한·tab lease·서버 중단·외부 감독 회수를 승인된 후보에서 확인. 실제 listener도 이 단계 이전에 실행하지 않음. 학습자 Worker 격리·navigation capability·nested/import/옛 Worker 우회 부정검증을 Java 활성화 선행 gate로 독립 인수. 실제 Java child는 아직 실행하지 않음. |
| 5. 준비 compile과 최소 실제 Java 연결 | bam의 문서 승인 및 4단계 실제 브라우저 부정검증 PASS 뒤, 감독·회수 preflight를 통과한 준비 compile을 먼저 수행하고 실제 Java 연결을 검증한다. 기존 엔진 byte/profile/공개 tests 불변 증거를 재사용하고 새 transport·root·정상 UI/취소/서버 종료/재시작 stale 거부를 영향 검증한다. 바뀐 JDK·profile·source/class 정합이 있으면 관련 격리·실행 검사를 다시 선정한다. |

`[현재 사실]` 기존 Java 정상·오류·격리·Electron IPC UI 증거는 해당 엔진과 환경에 한정해 재사용한다. 새 HTTP 권한·소스 브라우저 경계의 실제 Chrome 부정검증은 [구현 카드](roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수)에 기록됐다. 검증 전용 stage의 단일 Quest compile 뒤 감독의 연속 예약 문제를 수정하고, CT 신뢰 소스의 준비본 경로 누락을 고쳤다. 고정 JDK/JUnit으로 새 `runtime-second`의 Quest·CT trusted compile 각 1회와 완료 receipt 검증을 통과했다. 검증한 커널의 Chrome에서 실제 Quest 공개 테스트 6/6, CT `bridge-arr-01`의 빠른 1/1·전체 제출 2/2 그룹, 취소 결과 미반영과 새로고침 뒤 초안 보존을 확인했다. CT Java child가 실제 시작한 뒤의 취소도 exit/close·그룹 부재·독립 observer 확인과 함께 PASS했다. 이 범위 밖의 플랫폼·문제 전체를 검증한 것은 아니다.

기존 인증·수명주기 논리 모델은 조건부 PASS(요청 사례 47개, BFS 4,316상태·29,124활성 전이, 경계 20개, 변형 11/11 검출)를 인수했다. 로컬 전용 결과: `/private/tmp/bam-source-java-simulation-vbtik4h4/FINAL.json` (SHA-256 `6ba71736f9478fdef0a89daa03aaed0439a7d1935f51c5e4edd920f9c45763eb`). 이 모델은 same-origin trustedIdentity를 가정했으므로 학습자 Worker의 bootstrap 접근 차단을 증명하지 않는다. 추가 navigation 논리 fixture 1회는 부정 navigation 19건·경계 17묶음·불량변형 5/5 검출을 PASS했다. 로컬 전용 receipt: `/private/tmp/bam-source-java-simulation-vbtik4h4/navigation-receipt.json` (SHA-256 `28c4d58ef8a63524a4bc23a1b32fc5e0227a966c5879d25d23a98b0f3554b393`). none/same-origin 발급·capability 1회/60초/epoch·새 navigation/owner/reload 전이의 논리 검사이며 합성 Sec-* 헤더를 신뢰했다. 실제 헤더 위조 불가·Worker CSP·Service Worker·캐시·pending 초안 저장/재연결 UI는 이 논리 검사의 증명 범위 밖이며, 후속 Chrome 검증은 별도 증거다. 기존 FINAL/BFS는 재실행하지 않았다. 감독 native Node fixture는 TERM·IPC kill/restart absence를 통과했고, 정상 close·빈 그룹 shutdown·owned-child shutdown도 후속 수정에서 독립 PASS했다(세부 receipt는 구현 카드). 과거 정상 close 실패와 첫 portable 준비 실패·CT capability 실패는 이력으로 보존한다. 제품 Java gate는 승인과 preflight 뒤 열렸지만 최초 다운로드 자동화, 추가 브라우저·플랫폼 지원과 lease 수치는 제안/확인 필요 상태다. 시스템 JDK·격리 완화·원격 연결은 대안으로 두지 않는다.

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
- Java 정적 교안·객관식 available 제공과 실제 실행은 구분한다. 첫 Java Quest의 배포물·컴파일·IPC·격리 계약과 prototype 착수는 `DEC-JAVA-QUEST-RUNTIME-01`·ADR 0005로 구체화했다. CT prototype의 실행 증거는 ADR 0006과 작업 카드에 보존한다. 새 소스 Java 브라우저 연결은 위 v1 계약의 구현 착수가 승인됐으며 실제 검증과 release 콘텐츠 묶음 확정은 남아 있다. 추가 OS·설치는 현재 필수 gate가 아니다.
- Spring Boot 과정의 향후 추가와 외부 웹과제 실행 위치는 확정됐지만 과정·과제는 현재 구현되어 있지 않다. MVP 포함 시점·교안 범위·Code Quest 여부와 과제 저장소·빌드·의존성·오프라인·공개 검증 계약은 `DEC-JAVA-01`·`DEC-WEB-REPO-01`·`DEC-WEB-OFFLINE-01`에서 결정한다.
- `[대체됨]` Electron·DMG·공증·OS 선택은 현재 release gate가 아니다. 기존 앱과 시험용 DMG 포장 검증은 보존한다. Java의 기존 브라우저 유지 방향은 확정했고 새 HTTP 경계는 위 설계를 따른다. 소스 브라우저 writer/backup 계약은 별도 미결정이며 과거 desktop 모델 PASS를 재사용해 지원 완료로 표시하지 않는다.
- 현재 인앱 Web Project를 외부 Git 웹과제와 병행할지, 검증 뒤 대체할지 결정해야 한다.
- Code Quest의 [데스크톱 탐색 첫 구현](designs/code-quest.md#데스크톱-탐색-첫-구현-계약)은 기존 Quest·curriculum·진도를 읽기 전용으로 파생하고 기존 상세 URL에 `#/quest` 진입점을 더하는 승인 범위다. 저장·스키마·평가기 변경 없이 구현하며, 과정·주제·표시 순서의 영구 저장은 `DEC-QUEST-CATALOG-01`의 후속 선택이다. 실제 구현·검증 상태는 작업 카드에서 구분한다.
- 코딩테스트의 전체 공개 테스트 동작을 학습자 UI에서 어떤 용어와 펼침 상태로 보여 줄지는 [`designs/coding-test.md`](designs/coding-test.md)의 확인 항목이다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 퀴즈의 질문·코드·선택지·해설도 모두 이스케이프합니다. `validateQuizCollection`에서 형식·중복을 검증한 문항 ID에는 역할 접두사·접미사를 붙여 고유 DOM ID와 radio 그룹을 만들고 HTML 속성도 이스케이프합니다. 임의 문자열을 HTML이나 CSS 선택자에 직접 삽입하지 않습니다.
- JavaScript Quest의 사용자 코드는 주 실행 문맥에서 실행하지 않고 테스트마다 새 Worker에서 실행합니다. 이 경계는 DOM 응답성을 지키기 위한 것이며 악의적 코드를 완전히 격리하는 보안 샌드박스는 아닙니다.
- HTML·CSS Quest는 위 preflight와 inert DOM·CSSOM·one-shot iframe 경계를 사용하고, 위험 source를 평가 전에 거부합니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, 중복 없는 `aria-live`, 실행 결과 초점 이동, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.

## 첫 React 표시 경계와 rollback 제안

`[제안]` 첫 이관은 실행·저장이 없는 학습문서 목록의 표시 부분 하나다. 기존 app이 데이터 조회·route·저장소를 소유하고 새 화면은 목록/필터 props와 탐색 callback만 받는다. Worker·Java IPC·채점·진도 스키마·기존 hash URL은 바꾸지 않는다. 정확한 React·TypeScript·빌드 도구 버전과 라이선스·정적 번들·CSP 계약은 `DEC-FRONTEND-MIGRATION-01`에서 구현 전에 고정한다.

`mountList(props, onNavigate)`/`unmountList()`는 책임을 설명하는 최소 경계다. mount 실패 시 기존 목록을 표시하고 unmount 뒤의 지연 callback은 무시한다. 첫 시범 동안 기존 renderer와 자산을 유지해 동일 입력·URL로 되돌릴 수 있게 한다. 상태/저장 형식 변경이 없으므로 rollback에 데이터 역변환을 요구하지 않는다. 시뮬레이션은 mount 실패·탐색 직전 해제·후발 callback·반복 mount/unmount·rollback의 저장 불변을 확인한다. 실제 완료에는 정적 자산 경로·CSP·목록/검색·키보드/초점·기존 브라우저 흐름의 영향 검증이 필요하다. 현재는 제안이며 이관·시뮬레이션 PASS가 아니다.
