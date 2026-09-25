# 아키텍처

## 현재 브라우저 구현 경계

`[현재 사실]` 화면과 도메인 모듈은 HTML·CSS·Vanilla JavaScript ES modules로 구현되어 있으며 `package.json`에는 React·TypeScript 또는 전용 프런트엔드 빌드 도구 의존성이 없다. Java 제품 runner·감독 코드·Electron shell의 로컬 prototype을 구현했고 검증 커널의 Java Quest·CT 실행과 대표 앱 검증을 인수했다. 정식 설치·지원 OS 선택은 현재 필수 범위가 아니다. Maven·Gradle은 추가하지 않았다.

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
            ├── coding-test JSON ─► 목록·작성·저장 (Java draft 실행 차단)
            │                         └── JavaScript 제출 ─► one-shot Worker
            │
            └── web-project JSON ─► 두 파일 편집·안전 미리보기·공개 평가
                                      │
                                      └──► WebProjectRepository ─► localStorage
```

객관식의 `review-concepts.json` 발췌는 개념 오버레이와 문서 절로 연결되고, 진행 상태는 별도 `LocalStorageReviewSessionRepository`로 저장합니다. 위 `ProgressRepository`의 완료 기록과 다른 제품 진도는 유지합니다.

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 카테고리 아래 과정(`courseId`)이 교안 순서와 학습 경로를 정하고 언어(`languageId`)가 예제·평가 실행 계약을 정합니다. 객관식·Quest·코딩테스트·Web Project를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다. Java는 정적 교안·객관식의 available 과정·언어이며 첫 Quest 데이터도 등록됐지만 실행 capability는 false입니다. 실행 평가 언어는 기존 JavaScript·HTML·CSS 3개입니다.

## 현재 브라우저 앱

- 해시 라우팅: 홈은 `#/`, 독립 문서·문제 목록은 `#/learn`·`#/review`입니다. 학습은 `#/learn/<course>/<lesson>`, 복습은 `#/review/<language>[/<lessonId>]`이며 선택적 `concept` query로 키워드를 고릅니다. 문서의 `review`·`section` query는 저장된 유효 문맥과 실제 문서·문항 연결을 검사해 복귀와 절 이동에 사용합니다. Quest 목록·문제는 `#/quest`와 기존 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`, Web Project 목록·과제는 `#/web-projects`와 `#/web-projects/<project>`를 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON 및 Web Project 컬렉션을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 채점 전에는 정답 해설을 렌더링하지 않고 채점 후 정답·선택한 오답의 근거를 먼저 표시하며 다른 보기 해설은 펼칠 수 있습니다. 채점 전후 관련 개념 발췌를 볼 수 있으므로 결과를 독립 숙달의 인증으로 사용하지 않습니다. 개념·문서 왕복·후속 기능 경계는 [학습 복습 설계](designs/lesson-review.md#r1-첫-사용-구현-계약)를 따릅니다.
- Quest 라우팅: `CodeQuestRunnerRouter`가 JavaScript의 기존 함수 요청과 `html-dom-v1`, `css-style-v1` 직접 소스 요청을 분리합니다. 공통 UI·진도 DTO는 유지하되 각 언어의 작성 단위와 평가기만 교체합니다.
- JavaScript Quest: 문제 계약, 시작 코드, 입출력 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 공개 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 구분합니다.
- HTML Quest: 학습자가 JavaScript 함수가 아닌 HTML 마크업을 작성합니다. doctype 검사는 source 첫 선언과 `DOMParser` 결과를 함께 사용해 정확한 HTML5 doctype인지 확인하고 나머지 구조 검사는 주 문서에 삽입하지 않은 `<template>`의 inert `DocumentFragment`에서 선택자·개수·속성·텍스트를 관찰합니다. 학습자 마크업의 스크립트는 실행하지 않습니다.
- CSS Quest: 학습자가 JavaScript 함수가 아닌 CSS 스타일시트를 작성합니다. 최상위 선언과 최상위 미디어 조건 검사는 constructed `CSSStyleSheet`의 CSSOM에서 수행하고, 계산 스타일 검사는 문제에 포함된 고정 HTML fixture와 학습자 스타일만 one-shot sandbox iframe에 넣어 수행합니다. 매 검사 뒤 iframe을 제거합니다.
- 코딩테스트: JavaScript·Java 별도 컬렉션을 함께 로드한다. Java72는 원본 공개 소스 열람과 초안 저장만 제공하고 UI·handler·adapter에서 실행·제출·완료를 차단한다. 명시된 legacy69 URL만 CT로 안내하고 옛 초안 가져오기는 CT 초안이 없는 경우만 허용한다. 기존 준비3 Quest는 유지한다. 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 공개 테스트 일부, 제출은 전부를 사용하며 `CodingTestRunnerAdapter`가 기존 Worker DTO에 투영한 뒤 문제 ID와 실행 모드로 결과를 복원합니다.
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

`[확정 결정]` 주 전달 방식은 GitHub 소스 clone/다운로드 후 기존 Node 정적 서버와 브라우저로 실행하는 것이다. 현재 UI·콘텐츠·Worker·진도 경계를 유지하며 React·TypeScript는 작은 표시 경계부터 이관한다. Java 25 runner의 Electron IPC prototype 증거에 더해, [DEC-SOURCE-JAVA-BROWSER-01](roadmap.md#2026-09-22-소스-java-브라우저-연결-설계)의 명시적 같은 포트 Java 연결을 검증한 macOS 커널·Chrome에서 실행했다. 시스템 JDK fallback은 허용하지 않는다. 구현과 실제 검증의 범위는 [2026-09-24 구현 카드](roadmap.md#2026-09-24-소스-java-브라우저-구현-승인과-착수)에 기록한다.

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

## 소스 Java 브라우저 연결 — SOURCE-JAVA-BROWSER-v1

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
