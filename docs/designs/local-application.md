# 소스 실행과 로컬 데이터 보호 — 설치 prototype 이력

이 문서는 소스 실행의 데이터 보호 경계와 과거 설치 prototype 설계·검증 이력을 보존한다. 현재 전달 결정은 [로드맵](../roadmap.md#2026-09-22-소스-전달-방식-정정), 실제 소스 구조는 [아키텍처](../architecture.md)를 따른다.

## 현재 전달 방식과 이 문서의 적용 범위

`[확정 결정]` [DEC-SOURCE-DISTRIBUTION-01](../roadmap.md#2026-09-22-소스-전달-방식-정정)에 따라 GitHub 소스를 clone/다운로드해 기존 명령으로 실행하는 것이 주 전달 방식이다. 아래 설치형 필수·설치 후 오프라인·Electron/DMG·공증·OS 선택·설치형 완료 조건은 `[대체됨]` 이력이며 현재 release gate나 기본 후속 작업이 아니다. 기존 코드·실행/포장 receipt·실패 이력은 그대로 보존한다. 모든 shell을 폐기하거나 온라인 전용으로 바꾸는 결정은 아니다. 로컬 실행·서버/계정 없는 사용은 유지하며 최초 다운로드와 이후 네트워크 요구를 구분한다. 오프라인 품질 범위는 소스 전달 방식에서 재정의해야 한다.

데이터 원본 보존·저장 실패 ack 금지·검증된 입력만 복원·진도 분리 원칙은 유지한다. INSTALL-DATA-v2의 desktop 단일 profile/instance/window admission과 파일 I/O는 브라우저에 구현된 보장이 아니다. 소스 실행 origin·복수 탭 writer 배제·backup/export/import의 허용 API·구버전 writer·quizHistory 호환은 별도 설계·검증이 필요하다. 아래 desktop 모델 조건부 PASS는 새 브라우저 환경의 보장으로 이전하지 않는다. 새로운 Java 실행 연결 또한 미결정이며 기존 Electron IPC prototype과 웹 작성·저장을 구분한다.

## 결정 적용과 현재 차이

- `[대체됨]` DEC-DELIVERY-01의 설치형 필수 해석은 GitHub 소스 전달로 대체됐다. 학습 콘텐츠·개인 진도·학습자 소스의 로컬 보호 원칙은 유지한다.
- `DEC-PUBLIC-EVALUATION-01` 적용: BAM.dev 앱이 직접 계산·저장하는 결과에는 설치본 안에서 확인하고 실행하는 공개 평가만 사용한다. 외부 Git 웹과제는 고정된 실습 묶음에 함께 배포된 공개 로컬 검증을 사용하며 비공개·숨김 테스트나 원격 추가 채점을 사용하지 않는다.
- `DEC-DESKTOP-PROTOTYPE-01` 적용: 공식 지원 범위를 먼저 선언하지 않고 현재 검증 장비에서 Electron·DMG 단일 후보의 설치 capability를 측정한 뒤 `DEC-DESKTOP-01`을 결정한다.
- `DEC-LOCAL-EVALUATION-01` 적용: Code Quest와 별도 코딩테스트의 JavaScript 공개 테스트는 one-shot Worker에서 실행하며 두 제품은 내부 runner DTO·실행 추상화만 재사용한다. 설치형 MVP는 이 두 기능을 위해 Docker, Spring Boot, PostgreSQL, Nginx, 계정이나 사용자가 관리하는 수신 포트를 요구하지 않는다.
- `DEC-JAVA-CODING-TEST-01` 적용: Java 코딩테스트를 설치형 MVP에 포함하고 설치본의 공개 테스트만 사용자 기기에서 실행한다. JavaScript Worker를 Java 실행 방식으로 간주하지 않으며 구체 경계는 `DEC-JAVA-RUNNER-01`과 별도 ADR·prototype을 기다린다.
- `DEC-JAVA-RUNTIME-01` 적용: 설치 패키지가 `javac`를 제공하는 고정 JDK 또는 컴파일 가능한 축소 이미지를 포함하고 runner는 그 내부 경로만 사용한다. 시스템 JDK 요구나 이를 먼저 쓰는 prototype 경로는 두지 않는다.
- `DEC-JAVA-VERSION-02` 적용: 설치 패키지와 Java 교안·코딩테스트의 언어·표준 API 기준을 정식 Java 25 하나로 통일하고 preview를 허용하지 않는다.
- `DEC-JAVA-IMPLEMENTATION-01` 적용: Java 코딩테스트 로컬 runner는 Java 25로 작성하는 BAM.dev 제품 구성요소다. runner의 구체 구조와 연결 방식은 `DEC-JAVA-RUNNER-01`을 기다린다.
- `DEC-SPRING-BOOT-01` 적용: 앱 본체와 Java 코딩테스트 runner에는 Spring Boot를 포함하지 않는다. 교안은 정적 자산이고 실제 Spring Boot 실행은 외부 웹과제에서 시작한다.
- `DEC-FRONTEND-01` 적용: 목표 UI 소스는 HTML·CSS 기반의 React·TypeScript를 사용하고 JavaScript도 유지한다. 현재 Vanilla JavaScript·Worker·도메인 로직은 작은 화면·경계부터 점진 이관하며 설치 shell이나 Java runner와 합치지 않는다.
- `[현재 사실]` 현재 UI는 정적 HTML·CSS·Vanilla JavaScript다. 공개 GitHub Pages·개발용 Node HTTP 서버의 브라우저 경로와 로컬 Electron prototype이 있으며, 일반 사용자용 설치 지원 완료와는 구분한다.
- `[현재 사실]` 현재 `package.json`에는 React·TypeScript와 전용 프런트엔드 빌드 도구 의존성이 없다.
- `[현재 사실]` Java 제품 runner·감독 코드·SBPL과 Electron shell 소스가 있다. 검증 커널의 Java Quest와 Java 코딩테스트 prototype은 활성화되었으며 실제 검증 범위는 각각 [Quest 작업 카드](../work-items/2026-09-15-java-code-quest-runtime.md)와 [코딩테스트 작업 카드](../work-items/2026-09-22-java-coding-test-runtime.md)를 따른다. Maven·Gradle 설정은 없다.
- `[현재 사실]` 현재 검증 장비는 macOS 14.8.3·Apple Silicon(arm64)이다. 이 사실은 지원 OS 약속이 아니다.
- `[현재 사실]` 저장소에는 Java runtime과 Electron shell·시험용 DMG 포장 소스가 있으며 JDK·Electron 바이너리와 설치 산출물은 포함하지 않는다. 로컬 `.app` 실행과 시험용 DMG 생성·verify 증거는 있으나 실제 설치·재패키징 뒤 기록 보존·정식 설치 지원은 미완료다.
- `[확인 필요]` 공식 지원 OS, 최종 desktop shell·설치 파일 형식, 서명·업데이트와 백업 방식은 prototype 증거 검토 뒤 정한다.

현재 사용자는 소스를 받은 뒤 기존 `npm run dev`로 정적 서버를 시작한다. 이 Node 명령 사용은 정상 소스 실행 흐름이며 원격 운영 서버·Java 실행 API 도입을 뜻하지 않는다.

## Java 실행을 위한 첫 로컬 prototype

`[확정 결정]` [DEC-JAVA-QUEST-RUNTIME-01](../roadmap.md#2026-09-15-java-실행-지원-결정)은 첫 Java Quest 실제 실행과 그에 필요한 로컬 Electron prototype의 착수를 승인한다. 정식 지원 OS·서명·업데이트·M4/M6 전체 승인은 범위에 포함하지 않는다. 이번 완료 목표는 현재 Mac의 로컬 `.app`에서 번들 JDK로 첫 Quest를 실행하고 공개 결과·초안/진도·격리·취소·오프라인 경계를 검증하는 것이다. **현재 검증 커널의 Java Quest prototype은 활성 UI·취소·창 닫기·재시작 복원을 독립 PASS**했다. 정식 설치본과 공식 지원 OS의 완료를 뜻하지 않는다. 근거는 [runtime 작업 카드](../work-items/2026-09-15-java-code-quest-runtime.md#2026-09-22-활성-java-quest-앱-검증-pass)를 따른다. 초기 DMG 후보는 자동 승인 검토가 Java 실행 지원과 별도 설치·패키징 범위라고 거부했으므로 재시도하지 않고 필수 완료 gate에서 분리했다.

## 서버 없음의 의미

설치형 MVP는 다음 원격 구성요소를 제품 필수 조건으로 두지 않는다.

- BAM.dev가 운영하는 API·웹 서버·데이터베이스
- 회원가입·로그인·세션과 원격 진도 동기화
- 원격 채점, 비공개·숨김 테스트, 원격 파일 저장과 텔레메트리
- 서버 비밀키, 서비스 역할 키와 원격 관리 콘솔

GitHub Releases나 과제 저장소처럼 정적 파일을 처음 내려받는 외부 배포 채널은 사용할 수 있다. 다만 이는 BAM.dev가 운영하는 런타임 서버가 아니며, 이미 설치한 핵심 앱의 학습 흐름은 네트워크 없이 동작해야 한다.

핵심 앱의 교안·문제·테스트·기대값·평가기와 진도를 설치본과 사용자 기기 안에 두므로 개인 학습 MVP에는 BAM.dev 런타임 서버가 필요하지 않다. 외부 웹과제는 [밤위키 원본 활용 계약](web-assignments.md)의 승인된 전달 방식으로 고정 시작점·공개 검증을 확보한 뒤 로컬에서 실행하며 평가 시점에 BAM.dev 서버를 호출하지 않는다. 대신 공인 점수, 변조 방지, 답안 비밀성, 부정행위 방지, 신원 확인, 중앙 제출 감사·복구와 기기 간 동기화는 제공하지 않는다. 로컬 결과를 인증·대회·보상 근거로 표현하지 않는다.

## 목표 실행 구조

```text
설치 패키지
├── 로컬 앱 shell
│   └── HTML·CSS + React·TypeScript 목표 UI의 정적 번들
├── 읽기 전용 콘텐츠·스키마·fixture
├── 공개 로컬 평가기
│   ├── JavaScript one-shot Worker
│   └── Java 25 코딩테스트 로컬 runner(번들 JDK·검증 커널 한정 prototype)
├── Java 컴파일·실행 도구체인(JDK 25 후보 번들·Quest/코딩테스트 prototype 검증)
└── 사용자 데이터 저장 경계
    ├── 진도·설정
    ├── Quest 초안·결과 요약
    ├── 코딩테스트 초안·결과 요약
    └── 결정된 백업·복구 경로
```

현재 UI·콘텐츠 도메인·Worker는 한 번에 폐기하지 않는다. React·TypeScript는 승인된 작은 화면·UI 경계부터 도입하고, 프레임워크와 무관한 콘텐츠·진도·평가 계약은 기존 JavaScript를 포함해 보존한다. 데스크톱 shell은 빌드된 정적 자산을 표시하고 OS 기능을 좁은 포트로 제공하는 외곽 계층이며, shell 선택이나 Java runner 때문에 화면·도메인 로직을 다시 작성하지 않는다.

정확한 React·TypeScript 버전, 빌드 도구·의존성, 정적 번들·오프라인 경로, renderer CSP와 Worker 로딩, 첫 이관 화면·rollback은 [`DEC-FRONTEND-MIGRATION-01`](../roadmap.md#bam-결정-대기-목록)에서 결정한다. 이 증거 없이 설치 prototype에 새 도구체인이 이미 포함됐다고 가정하지 않는다.

`[확정 결정]` 첫 설치형 버전은 사용자가 관리하는 수신 포트를 요구하지 않는다. `[제안]` 번들 자산은 앱 전용 origin 또는 자원 프로토콜로 읽고 외부에서 접근 가능한 네트워크 포트를 열지 않는다. 선택한 shell의 기술 제약 때문에 내부 프로세스가 필요하면 수명주기, 접근 범위, 인증, 포트 노출과 종료를 별도 ADR에서 설명해야 한다.

## 우선 capability prototype 계약

이 prototype은 설치 기술을 채택하거나 MVP 지원 OS를 선언하기 위한 구현이 아니라, 결정에 필요한 증거를 만드는 제한된 실험이다. 입력은 현재 정적 빌드, 공개 평가기, `localStorage` 저장소, 현재 검증 장비와 [`reference-audit.md`](../reference-audit.md#설치-shell-후보-조사)의 후보 조사다. Electron·DMG 하나만 먼저 검증하며, 병렬로 Windows·Linux·Intel Mac 패키지나 Tauri prototype을 만들지 않는다. Electron 후보가 아래 필수 gate를 안전하게 만족하지 못할 때만 후보 선택 단계로 돌아간다.

정확한 Electron·패키징 도구 버전과 라이선스는 prototype 구현이 별도로 허용되어 의존성을 추가하는 변경에서 고정한다. 자동 업데이트, 원격 텔레메트리, 계정, 서버와 일반 파일 시스템 접근은 prototype 범위가 아니다.

| 검증 영역 | PASS 조건 | 다음 결정에 넘길 증거 |
| --- | --- | --- |
| 패키지·수명주기 | 현재 검증 장비에서 `.app`과 DMG를 만들고 터미널 없이 설치·첫 실행·종료·재실행할 수 있다. | 산출물 식별자·크기, 사용 명령, 설치·실행 체크리스트와 실패 로그 |
| 앱 origin·자산 | 표준·보안·fetch 가능한 앱 전용 origin 또는 동등한 격리 경계에서 상대 경로 fetch, ES module, MIME·404 처리와 hash route가 동작하며 localhost·수신 포트를 열지 않는다. | origin·protocol 설정, 네트워크·포트 관찰, 교안·문제·fixture 로드 결과 |
| JavaScript 실행 | module Worker와 그 import, 동적 함수 컴파일, timeout·취소와 공개 결과가 기존 브라우저 계약대로 동작한다. renderer에는 실제 제한적 CSP를 적용해 `eval`·`Function`을 거부하고, 필요한 동적 컴파일 예외는 Worker 응답·문맥에만 최소화한다. 앱 전체 CSP나 web security를 끄지 않는다. | 대표 Code Quest·코딩테스트 실행/실패/timeout 기록, 적용 header·CSP와 renderer 거부·Worker 허용의 부정/긍정 검사 |
| Java 코딩테스트 | 패키지 내부 JDK 25 LTS 계열로 정식 Java 25 언어·표준 API를 preview 없이 컴파일·실행하고, `DEC-JAVA-RUNNER-01`·격리 ADR에서 승인한 runner로 수신 포트·원격 서버 없이 공개 테스트의 정답·대표오답·컴파일 오류·런타임 오류·시간 초과·출력 제한·취소·runner 장애를 서로 구분한다. | 정확한 JDK 배포판·패치·출처·재배포 라이선스, 정식 Java 25·preview 금지와 시스템 `JAVA_HOME`·`PATH` 비의존, 패키지 증가량, shell↔runner 허용 경계, 프로세스·파일·네트워크·시간·메모리·출력 격리와 잔여 프로세스 정리 결과, 콘텐츠·테스트 ID별 PASS·FAIL |
| HTML·CSS 평가 | `DOMParser`, constructed `CSSStyleSheet`, 일회성 채점 sandbox iframe과 `:focus-visible` 관찰이 기존 공개 평가 계약대로 동작한다. 현재 인앱 Web Project의 별도 `sandbox=""`·`srcdoc` 미리보기도 자체 제한 정책 아래 script·외부 요청 없이 표시된다. | HTML·CSS 기준답안·대표오답과 focus 상태, Web Project 미리보기·네트워크의 실제 패키지 결과 |
| renderer 격리 | renderer에서 Node·`fs`·`process`와 불필요한 IPC를 노출하지 않고 context isolation·sandbox를 유지한다. 외부 navigation, 새 창, 권한 요청과 원격 네트워크는 기본 거부한다. | shell 보안 설정, 허용 API 목록, navigation·권한·네트워크 부정 검증 결과 |
| 오프라인 | 설치가 끝난 뒤 네트워크를 차단한 첫 실행에서 교안→객관식→Code Quest→코딩테스트 핵심 흐름을 완료할 수 있다. | 차단 조건, 사용한 콘텐츠 ID, 각 단계 결과와 네트워크 요청 기록 |
| 데이터 정체성 | 앱 ID·origin·저장 위치가 고정되고 종료·재실행과 같은 후보의 재패키징 뒤 `localStorage` 진도·초안이 보존된다. | 전후 데이터 fixture, 앱 ID·origin·저장 경로와 migration 필요 여부 |
| UX·비용 | 키보드, 확대, 고대비, 스크린 리더 핵심 흐름과 좁은 창을 확인하고 패키지 크기·첫 실행 시간을 측정한다. | 환경·측정 방법·수치, 접근성 체크리스트와 차단 결함 목록 |

필수 capability, 격리, 오프라인 또는 데이터 보존을 전역 보안 완화나 localhost로만 충족할 수 있으면 FAIL이다. 패키지 크기·첫 실행 시간·서명 비용처럼 허용 한계가 아직 없는 항목은 수치를 숨기지 않고 bam의 사람 판단으로 넘긴다. PASS도 공식 지원 선언은 아니며, bam이 증거와 배포 비용을 검토해 `DEC-DESKTOP-01`을 확정하고 필요한 ADR을 채택해야 다음 설치 구현으로 진행한다.

## 로컬 데이터

- `ProgressRepository`와 Web Project 저장소 같은 도메인 인터페이스는 유지한다.
- 현재 `localStorage` 구현은 목표 shell에서 실제로 영속되는지, 앱 origin과 업데이트 뒤에도 같은 데이터에 접근하는지 검증해야 한다.
- 앱 제거·업데이트·경로 변경으로 데이터가 사라질 수 있으므로 데이터 보존과 복구는 MVP gate다. 정확한 방식이 export/import인지 OS별 백업인지 여부는 `DEC-DESKTOP-01`에서 정한다.
- 학습자 소스는 필요 이상으로 실행·결과 기록에 복제하지 않는다.
- 계정이 없으므로 “동기화됨”, “서버에 제출됨”, “검증된 점수”라고 표시하지 않는다.
- 손상되거나 이전 버전인 데이터는 검증·마이그레이션하고, 실패하면 원본을 보존한 채 복구 선택을 제공한다.

## 코드 실행 경계

설치 앱이라는 이유로 학습자 코드에 OS 파일·네트워크·프로세스 권한을 자동으로 부여하지 않는다.

- JavaScript Code Quest와 코딩테스트는 제품·진도를 분리한 채 현재 공개 Worker 실행 경계를 재사용한다.
- HTML·CSS Quest는 inert DOM, 제한된 CSSOM·sandbox iframe 경계를 보존한다.
- 외부 웹과제는 사용자가 선택한 로컬 폴더와 IDE에서 실행하며 BAM.dev가 자동 실행하지 않는다.
- `[현재 사실]` Java 코딩테스트는 번들 JDK 25·preview 금지·공개 JUnit 테스트를 사용하는 검증 커널 한정 prototype으로 구현·활성화되었다. [ADR 0006](../decisions/0006-java-coding-test-local-runtime.md)과 [작업 카드](../work-items/2026-09-22-java-coding-test-runtime.md)가 실행·격리·UI 검증 범위를 정한다. 이 결과는 공식 지원 OS, 정식 설치·업데이트·보안 패치 정책의 확정을 대신하지 않는다.
- Java 정식 교안 과정·Code Quest·웹과제에 Java 코딩테스트 runner를 자동 적용하지 않는다. 그 제품 범위와 실행 계약은 `DEC-JAVA-01`에서 따로 결정한다.
- Spring Boot 실행을 설치 shell이나 Java 코딩테스트 runner에 추가하지 않는다. 향후 실제 실행은 별도 외부 웹과제 폴더에서 하며 BAM.dev는 그 프로젝트를 자동 실행하지 않는다.
- 설치 shell의 파일 열기나 폴더 선택 기능은 사용자가 명시적으로 선택한 경로에만 접근한다.

## 콘텐츠와 웹과제 배포

핵심 교안·객관식·Code Quest·코딩테스트 콘텐츠는 각 계약을 유지한 채 설치 파일에 포함해 오프라인으로 제공한다. 웹과제는 [`web-assignments.md`](web-assignments.md)의 밤위키 원본 활용 계약에 따라 고정 시작 버전과 승인된 전달 방식을 별도로 정한다.

이 둘의 오프라인 보장은 다르다.

- 핵심 앱: 설치 뒤 네트워크 없이 사용
- Git 웹과제: 원본의 고정 시작점·공개 검증·도구/의존성과 승인된 비교 자료를 사전 확보한다. 원격 전달을 택했을 때의 최초 clone·fetch와 이후 오프라인 실행 경계를 구분한다.
- 완전 오프라인 과제 시작: 선정 원본·필요 도구·의존성을 설치 파일이나 별도 묶음으로 제공할지 미결정이며 이미 있는 로컬 과제에 원격 공개를 강제하지 않는다.

BAM.dev 화면은 GitHub API 성공을 전제로 진입하거나 진도를 계산하지 않는다.

## 기존 앱의 시험용 DMG 포장

`[확정 결정]` 이미 검증한 `.app`을 시험용 DMG로 포장하는 후속 작업을 승인한다. `[현재 사실]` 포장 CLI를 구현했고 기존 앱의 시험용 DMG 생성·verify를 독립 검증했다. 정식 Electron·지원 OS·배포 형식 채택이나 설치 완료를 뜻하지 않는다.

- CLI는 `npm run desktop:package -- --app <existing.app> --output <new.dmg>`로 한다. macOS의 `hdiutil`을 사용하며 새 의존성을 추가하지 않는다.
- 입력 앱의 서명·provenance·symlink를 검사한 뒤 임시 위치에 복사하고 hash 동일성을 확인한다. 복사본으로 UDZO 이미지를 생성한 뒤 `hdiutil verify`를 수행한다.
- 출력 DMG나 receipt가 이미 있으면 거부한다. 실패 시 이번 실행이 만든 산출물만 정리하며 원본 앱·개인 자료는 변경하지 않는다. mount·Java/Electron 실행·bootstrap·네트워크 접근은 수행하지 않는다.
- receipt에는 앱·DMG의 hash와 identity, 명령 결과를 기록하고 ad-hoc 서명·미공증 상태 및 실제 설치·오프라인·기록 보존 미검증을 명시한다. 기존 기록 보존과 실제 설치 검증은 별도 다음 단계이며 포장 성공으로 PASS 처리하지 않는다.

검증한 packager SHA-256은 `adeed24bcf042761297289aac0eaf8d2abc15a3575761b4edbf7362439416f15`다. focused 21개는 20개 PASS와 테스트의 canonical 기대값 수정 뒤 1개 PASS를 재사용한 결과이며 독립 코드 P2 수정 검토도 PASS했다. 실제 CLI·create·verify는 각각 1회, exit 0이었다. DMG는 305,235,051 bytes, SHA-256 `764a6e5f52074bc9cc33afaeca8f459aa978f280ddeef3b6aabf355f20cd8d7c`다. source·upstream 원본 불변과 staging 정리를 확인했고 Java·Electron·mount·network 실행은 0이다. 로컬 전용 receipt: `/private/tmp/bam-package-validation-v5NRM2/independent-packaging-review.json` (SHA-256 `516f180ce4b00cb34c0b609be99133eee496da4bd51daf880d6b8c6ce8ca3adb`). 시험용 ad-hoc·미공증 상태이며 실제 설치·오프라인 첫 실행·재포장 후 기록 보존·정식 배포는 여전히 미검증이다.

## 설치·업데이트 계약

최종 패키징 기술과 지원 범위는 위 prototype 증거를 먼저 수집한 뒤 비교하고 `DEC-DESKTOP-01` 및 필요한 ADR로 결정한다.

| 항목 | 확인할 질문 |
| --- | --- |
| 대상 OS | macOS, Windows, Linux 중 MVP 필수 범위는 무엇인가 |
| 패키지 크기 | shell과 실행기가 초보 학습자에게 감당 가능한가 |
| 서명·경고 | 설치 경고와 코드 서명을 어떻게 다루는가 |
| 업데이트 | 수동 새 버전 설치인지, 서명된 자동 업데이트인지 |
| 데이터 보존 | 업데이트·다운그레이드·재설치에서 진도와 초안이 보존되는가 |
| 오프라인 | 첫 실행과 모든 핵심 학습 흐름이 네트워크 없이 가능한가 |
| 접근성 | OS 확대·고대비·키보드·스크린 리더와 webview가 호환되는가 |
| 개발 비용 | 새 도구체인·의존성·보안 업데이트 비용이 서버 절감 이점을 넘지 않는가 |

외부 패키징 의존성은 이 비교와 정확한 버전 고정, 라이선스·업데이트 비용 기록 없이 추가하지 않는다.

## 설치·기록 보호 상세 설계 — INSTALL-DATA-v2

`[대체됨: desktop 적용 가정]` 이 절은 소스 전달 정정 전에 만든 후속 구현·독립 시뮬레이션 계약의 이력이다. 데이터 보호 불변조건은 참고하되 현재 구현 착수 계약으로 사용하지 않는다. 읽기 전용 조사에서 제안한 `INSTALL-DATA-v1`의 동시 쓰기 가정을 보완하며, 구현·실제 설치·백업 복구 PASS를 뜻하지 않는다. 첫 범위는 현재 검증 macOS prototype의 **desktop 단일 profile·단일 instance·단일 window에서 협조하는 단일 writer와 진도 한 키**다. 모바일, 자동 업데이트, 새 DB·의존성, 웹 복수 tab 잠금, 임의 profile migration·삭제는 포함하지 않는다. 공식 OS·Electron 채택과 비용은 계속 `DEC-DESKTOP-01`의 결정 대상이다.

### 현재 사실과 사용자 흐름

`[현재 사실]` 진도는 `src/repositories/progress-repository.js`의 `bam.dev.progress.v1` 한 키·`schemaVersion: 1`에 저장한다. `getProgress()`는 손상 JSON이나 미지원 스키마를 빈 진도로 읽고, 이후 mutator의 `#save()`가 그 상태를 저장할 수 있다. `browser-storage.js`는 저장 실패 시 메모리로 전환할 수 있다. 따라서 현재 정상화·저장 API만으로 안전한 import나 디스크 저장 성공을 판정할 수 없다. 백업·복원 배제 구간은 아직 구현되지 않았다.

| 사용자 흐름 | 순서와 화면에서 구분할 결과 |
| --- | --- |
| 첫 설치 | 검증된 DMG 확인 → 앱 복사 → 이미지 분리 → 네트워크가 차단된 첫 실행 → 포함 자산·저장·종료·재시작 확인. OS가 실행을 거부하면 설치 차단으로 기록하며 앱이 뜨지 않은 기능을 PASS 처리하지 않는다. |
| 같은 후보 재패키징 | 기존 앱의 실행·저장을 끝내고 runner 회수 확인 → 기록 백업 → 새 앱 identity·서명·provenance 확인 → 앱 파일만 교체 → 같은 profile에서 이전 기록 비교. 원래 앱과 백업은 확인 전 보존한다. |
| 진도 백업 | 포함·제외 범위와 학습자 소스 포함을 안내 → 쓰기 배제 → 현재 진도 snapshot → 사용자가 선택한 새 파일에 저장·재읽기 → 파일 위치와 확인 결과 표시. 파일 선택 취소는 기록을 바꾸지 않는다. |
| 진도 복원 | 선택한 파일 검증 → 기존/복원할 기록의 개수·버전·제외 범위 미리보기 → 현재 기록의 복구 백업 저장 → 진도 한 키 교체·확인 → 화면 재로딩. 복원은 새 제출·공개 평가·완료를 생성하지 않는다. |
| 기록 이상 | “기록을 읽을 수 없어 원본을 보호 중” 또는 “현재 세션에만 임시 저장됨”을 표시하고 읽기·원본 내보내기·복구 선택을 제공한다. 빈 진도로 자동 초기화하거나 성공 저장으로 표시하지 않는다. |

설치 identity는 bundle identifier, 앱 이름, `bam://app` origin, 실제 `userData` 경로, 저장 키·스키마의 조합으로 기록한다. Electron의 기본 `userData`는 앱 이름의 영향을 받으므로 bundle identifier만 같다고 저장 위치가 같다고 추정하지 않는다. 현재 경로를 실측한 뒤 그대로 유지하며, Chromium 저장소와 별도 앱 파일을 분리하라는 권고를 기존 profile 이동 승인으로 해석하지 않는다. [Electron app 문서](https://www.electronjs.org/docs/latest/api/app)

ad-hoc DMG 생성·verify는 일반 사용자의 오프라인 Gatekeeper 통과 증거가 아니다. 정식 배포에는 Developer ID·공증·ticket stapling 등 별도 검토가 필요하고, 계정·비용·외부 업로드 승인 전에 이를 실행하지 않는다. 오프라인 OS 차단과 앱 내부 오프라인 자산 실패를 서로 다른 결과로 기록한다. [Apple 배포 안내](https://developer.apple.com/documentation/xcode/packaging-mac-software-for-distribution), [공증 흐름](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow)

### 데이터·파일 계약

`[제안]` 최초 import/export는 `bam.dev.progress.v1`만 대상으로 한다. 통합 제안인 optional `quizHistory`도 같은 키의 snapshot에 포함한다. 이 필드를 추가하는 릴리스는 import validator의 보존·검사를 함께 제공해야 하며, 이를 이해하지 못하는 검증기는 해당 입력 전체를 거부하고 필드를 조용히 삭제하지 않는다. theme와 일시적 review-session, 다른 도메인 저장소, Chromium profile 전체와 실행 scratch는 제외한다. UI와 파일에도 이 범위를 명시하며 모든 앱 데이터의 백업이라고 표현하지 않는다. 여러 키를 연속 쓰는 것을 하나의 원자적 복원이라고 표현하지 않는다. 기존 도메인 ID와 Quest/코딩테스트 구분, 콘텐츠 revision, 기록 시각은 보존하며 현재 콘텐츠와 연결되지 않는 기록을 조용히 삭제하거나 현재 답안의 통과로 재해석하지 않는다.

객관식의 prepare/commit/cancel·owner/generation 저장도 아래 공통 writer 배제에 포함한다. 복원된 `quizHistory`의 활성 토큰을 그대로 제출 가능 상태로 되살리지 않는다. 재시작·복원 후 새 owner/generation과 이전 활성 토큰 무효화의 저장이 확정되기 전 submit을 막는 세부 계약은 [객관식 저장 설계](lesson-review.md)를 따른다. 이 계약은 새 구현의 목표이며 기존 구버전 binary의 안전한 쓰기를 보장하지 않는다.

| 필드 | 제안 형식과 검증 |
| --- | --- |
| `format`, `formatVersion`, `scope` | 각각 `bam-progress-backup`, `1`, `progress-only`. 알 수 없는 형식·버전·범위는 거부한다. |
| `kind` | `snapshot` 또는 `recovery-before-restore`. 손상 원본을 담은 recovery 파일은 정상 진도로 바로 import하지 않는다. |
| `createdAt`, `appVersion`, `contentVersion` | 생성 시각과 당시 앱·콘텐츠 식별자. 내보낸 기록의 출처이며 파일 신뢰·새 평가 PASS의 증명은 아니다. |
| `storageKey`, `schemaVersion`, `raw` | 고정 키, 해석 가능한 경우 원본 스키마, 정확한 저장 문자열 또는 키 부재를 뜻하는 `null`. 정상 snapshot은 엄격한 schema 1 검증을 통과해야 한다. |
| `rawSha256`, `rawBytes` | 문자열의 UTF-8 bytes 기준 SHA-256·길이. 부재는 `raw: null`, hash도 `null`, 길이 0으로 빈 문자열과 구분한다. |
| `sourceIdentity` | 앱 ID·origin·profile 식별 근거. 이 필드를 경로 접근 명령으로 사용하지 않는다. 다른 profile의 정상 snapshot 복원은 별도 확인 대상이며 원래 profile의 crash 복구로 오인하지 않는다. |
| recovery 추가 필드 | `operationId`, `targetRawSha256`, `targetRawBytes`. `raw`에는 교체 전 값 B를 담고, 선택한 import 파일에는 목표 값 N을 보존한다. recovery 파일은 commit 성공 여부를 주장하지 않는다. |

파일은 UTF-8 JSON, 제안 상한 16 MiB다. 읽기 전에 파일 크기를 제한하고 파싱 뒤 문자열·배열·필드 타입과 기존 저장 스키마의 한도를 검증한다. 상한 초과·알 수 없는 필드/버전·정상화 과정에서 값이 탈락하는 입력은 자동 잘라내지 않고 실패로 반환한다. 일반적인 `normalizeProgress()` 호출을 엄격한 import 검증으로 대체하지 않는다. checksum은 우발적 손상 확인용이며 서명이나 진위 인증이 아니다. 백업 파일에 평문 학습자 소스가 포함됨을 알려준다.

파일 I/O는 사용자가 선택한 파일만 대상으로 하고 renderer에 일반 경로 읽기·쓰기 API를 주지 않는다. 신규 파일을 기본으로 하며 기존 백업은 덮어쓰지 않는다. 저장·close·재읽기와 bytes/hash 확인이 끝나기 전에는 백업 성공이나 기존 raw 교체를 허용하지 않는다. 파일 저장 확인과 아래 저장소 ack 모두 전원 손실 시 내구성을 보증하지 않으며, 실제 flush·Chromium 정책 검증은 별도다.

### writer admission과 복원 순서

Web Storage의 한 키 교체는 read-modify-write 잠금이 아니다. 표준은 다른 window/agent cluster와의 locking을 가정하지 말라고 명시하며 `setItem()`은 저장 불가 시 quota 오류를 낼 수 있다. 따라서 마지막 readback이나 `storage` 이벤트만으로 동시 writer를 배제했다고 주장하지 않는다. [HTML Web Storage 표준](https://html.spec.whatwg.org/multipage/webstorage.html)

`[제안]` desktop에서 같은 profile의 앱 중복 실행을 막고, 하나의 진도 writer만 허용한다. 기존 Java 실행 lock은 모든 진도 writer의 lock이 아니므로 그대로 대체 사용하지 않는다. 저장소 진입점에 작은 배제 상태와 generation을 두고 모든 read-modify-write mutator가 이를 거치게 한다. 대상에는 초안 autosave·reset·교안/객관식 기록·Quest/코딩테스트 제출·상세 결과 저장·삭제가 포함된다. UI 버튼 비활성화만으로 충족하지 않으며 우회 writer가 남거나 배제를 확보하지 못하면 restore를 비활성화한다. 웹 복수 tab에는 이 복원 기능을 제공하지 않고 desktop 한정임을 알린다.

1. `idle → quiescing`: 중복 백업/복원 진입을 거부하고 새 grade·mutator admission을 닫는다. 이미 편집한 미저장 초안은 마지막 한 번 저장·영속 확인하거나 사용자가 원본을 내보낼 때까지 진행을 막는다. 취소 대기 중 실행이 있으면 기존 수명주기로 종료·회수를 확인한다.
2. 기존 쓰기 작업을 마친 뒤 generation을 올려 `exclusive`로 진입한다. 이전 generation의 autosave timer·grade 응답은 저장소에서 거부하고 재개 후에도 자동 재생하지 않는다. 단일 인스턴스·단일 writer 소유를 잃으면 이후 단계를 중단한다.
3. primary 저장소에서 B를 읽고 `persistent / empty-new / volatile / recovery-required`를 구분한다. volatile이면 일반 restore를 막고 임시 snapshot 내보내기만 제공한다. 손상 raw를 복원으로 교체하려면 먼저 그 정확한 raw의 recovery 백업을 저장한다.
4. 엄격히 검증한 N과 미리보기를 제시하고 사용자가 확인한다. 기록을 병합하지 않는다. 키 부재를 나타내는 recovery 자료는 자동으로 삭제 작업으로 변환하지 않는다.
5. B와 N의 식별 정보를 담은 새 recovery 파일을 저장·재읽기 확인한다. 실패·취소하면 K는 B 그대로다. 기존 백업과 선택한 입력 파일은 변경하지 않는다.
6. exclusive 소유와 generation을 확인하고 primary K가 여전히 B인지 대조한다. 다르면 `conflict`로 멈추고 새 값을 보존한다. 이 비교는 배제의 보조 검사이며 compare-and-swap 구현이라고 주장하지 않는다.
7. `committing`: K에 N을 단 한 번 쓴다. 이 시점 이후 취소는 “처리 확인 중”으로 표시하며 취소됐다는 이유로 B를 자동 재기록하지 않는다. memory fallback 성공을 primary commit으로 취급하지 않는다.
8. primary K의 정확한 N 일치와 영속 저장소 상태를 확인해야 `acknowledged`다. 이는 현재 세션의 저장 확인이며 fsync 증명은 아니다. 새 저장 상태로 UI를 읽어 들이고 새 generation으로 writer를 재개한다. 원래 recovery 백업은 성공 후에도 자동 삭제하지 않는다.
9. 실패·충돌·결과 불명은 `recovery-required`로 남겨 쓰기를 계속 차단한다. 자동 재시도·queue replay·empty 초기화는 없다. commit 전 사용자 취소이고 B가 그대로이며 배제가 유지됐다면 새 generation으로 정상 쓰기를 재개할 수 있다.

### 재진입·중단·다운그레이드

복구 우선순위는 현재 raw 보존 → 원래 B 백업과 입력 N 보존 → 사용자가 선택한 같은 작업 recovery 파일의 identity/hash 확인 → 현재 값 C 판별이다. recovery 파일을 자동 검색하거나 이전 작업의 파일을 자동 선택하는 시스템은 첫 구현에 포함하지 않는다. 앱 종료 중 전원 손실까지 기존 프로세스 회수 계약이 보장한다고 확대하지 않는다.

| 재진입 시 관찰 | 동작 |
| --- | --- |
| C = B, B ≠ N | 미적용으로 안내한다. 사용자 재확인과 새 exclusive 구간 없이 다시 쓰지 않는다. |
| C = N, B ≠ N | 목표 값이 현재 존재함을 확인한다. crash 이전 ack나 실제 disk flush 여부는 추정하지 않는다. 새 평가·제출을 만들지 않는다. |
| B = N = C | 데이터 변경 없는 복원으로 표시하며 write 발생 여부를 추정하지 않는다. |
| C가 B/N 모두와 다름·읽기 실패·손상 | C를 보존하고 쓰기를 막는다. B나 N으로 자동 덮어쓰지 않는다. 사용자가 C까지 별도 보존한 뒤 명시적으로 복구를 선택해야 한다. |
| backup 저장 실패·quota·memory fallback | 교체 전이면 B를 유지한다. 교체 시도 후면 primary C를 다시 확인하고 위 분기로 간다. 메모리 N과 durable B를 구분한다. |

같은 스키마의 앱 교체도 기존 앱과 자식 프로세스가 종료된 상태에서만 한다. 앱 복사/서명/identity 검사 실패 시 원래 앱·profile을 그대로 두며 재패키징을 profile 초기화 수단으로 쓰지 않는다. 콘텐츠 revision이 달라져도 과거 기록을 현재 평가 결과로 승격하지 않는다.

`[확인 필요]` 구버전 앱은 새 `minReader` 필드를 이해하지 못할 수 있으므로 필드 하나로 안전한 downgrade가 보장되지 않는다. 권장안은 구버전이 현재 profile을 열지 않게 하고 구버전 당시 백업과 별도 profile에서만 재개하는 것이다. 그 분리 실행 수단이 구현·검증되기 전에는 downgrade를 지원하지 않는다고 안내한다. 사용자가 임의로 구버전을 실행하는 상황까지 현 앱이 차단한다고 주장하지 않는다. 새 profile 경로·migration·제거 후 데이터 삭제는 별도 승인 대상이다.

### OS·격리 변경과 오프라인 실패

현재 exact kernel·번들 JDK·runner/provenance·profile 검사를 유지한다. OS/kernel/JDK/격리 profile 변경으로 증거가 맞지 않으면 Java capability를 unavailable로 닫고, 원인과 재검증 필요를 표시한다. 학습자 오답으로 분류하거나 시스템 JDK·네트워크 실행·제한 상향으로 우회하지 않는다. 기록 읽기·편집·백업은 저장 상태가 허용하는 범위에서 유지한다. poison 또는 회수 불명은 실행 재개를 막고 원래 증거·scratch를 보존하며, 앱 재시작을 안전 회수의 증거로 삼지 않는다. 변경된 실행 경계의 필요한 검사만 다시 선정한다.

오프라인 첫 실행에서 누락된 번들 자산은 경로·상태·MIME과 화면 실패를 기록하고 원격 다운로드로 숨기지 않는다. OS 실행 차단, 앱 자산 누락, Java unavailable, 저장 불가를 각각 다른 상태로 표시한다. 기존 실행 PASS를 다시 전부 수행하는 대신 설치 위치·기본 profile·네트워크 차단처럼 달라진 조건의 대표 흐름만 후속 계획으로 고정한다.

### 작은 구현 순서와 검증 인계

| 순서 | 작은 수정 대상 | 완료 기준 |
| --- | --- | --- |
| 1. 원본 보호 | `src/repositories/progress-repository.js`, `browser-storage.js` 및 직접 호출부 | missing/corrupt/unsupported/volatile 구분, corrupt 원본의 다음 save 차단, memory-only를 saved로 표시하지 않음. |
| 2. writer 배제 | `desktop/main.cjs`의 profile 중복 실행 경계, 저장소 admission·`src/app.js`의 timer/grade 결과 연결 | 모든 mutator가 같은 배제를 통과하고 late generation 저장 0, 중복 진입·소유 상실 시 복원 0. runner 수명주기는 기존 경계를 재사용. |
| 3. 한 키 백업·복원 | 저장소의 엄격한 snapshot 검증, 좁은 main/preload 파일 선택·저장 경계와 UI | backup 검증 전 기존 raw 교체 0, 잘못된 입력·quota·취소·충돌에서 원본 보존, 확인된 primary 값만 ack. 키보드·focus·상태 안내 포함. |
| 4. 설치·교체 관찰 | 기존 packager·일회성 독립 검증 준비물 | 원본 앱/profile 보호, 설치 뒤 첫 오프라인 실행, 같은 후보 재패키징 뒤 실제 기본 profile의 기록 비교. 포장 PASS와 분리. |
| 5. 결정 반환 | 이 설계의 증거와 미결정 목록 | 비용·OS·공증·업데이트·downgrade 지원을 별도 결정. 시뮬레이션 PASS만으로 실제 설치·전원 손실 내구성을 선언하지 않음. |

독립 시뮬레이션은 정상 복원, 미지원 schema·corrupt JSON, backup 선택 취소·부분 쓰기·재읽기 불일치, quota와 memory fallback, 각 단계 crash, B=N, 외부 값 C, commit 전후 취소, autosave/grade의 늦은 응답, 중복 복원, writer 소유 상실·새 앱 인스턴스, 구버전이 새 필드를 무시하는 경우를 다룬다. 각 trace는 B/N/C·generation·admission·backup 확인·primary write·ack·원본 파일 보존을 관찰한다. 배제 미확보면 commit 0, backup 확인 전 commit 0, 늦은 generation 쓰기 0, 결과 불명 시 자동 덮기 0을 필수 불변조건으로 둔다.

`[이력]` 당시 설계 시점에는 독립 시뮬레이션이 미실행이었다. 후속 desktop 가정 모델의 조건부 PASS는 [로드맵 집계](../roadmap.md#남은-작업의-작은-구현-순서와-시뮬레이션)를 따르며 새 소스 브라우저 환경의 재검증은 미실행이다. 계약 식별자는 `INSTALL-DATA-v2`이며 동결 문서 SHA-256은 인계에서 별도로 고정한다. 모델의 단일 키 old/new 교체·파일 확인·프로세스 배제는 시험 가정이고, 실제 Chromium 저장 정책·디스크 flush·전원 손실·Gatekeeper·설치·profile 동일성은 별도 실제 검증이 남는다.

## 단계적 전환

1. 현재 정적 빌드를 변경하지 않고 설치 shell이 요구하는 자산·라우팅·저장·평가 capability를 감사한다.
2. `DEC-FRONTEND-MIGRATION-01`에서 승인한 가장 작은 화면·UI 경계로 React·TypeScript 정적 번들, CSP·Worker·기존 route·진도 공존과 rollback을 검증한다.
3. 현재 검증 장비에서 Electron·DMG 단일 후보로 위 prototype 계약을 수행한다.
4. PASS·FAIL과 비용을 기록하고 bam이 `DEC-DESKTOP-01`과 필요한 ADR을 결정한다. FAIL이면 보안 경계를 낮추지 않고 후보 선택으로 돌아간다.
5. 선택한 shell만 기존 브라우저 개발 흐름과 병행하는 설치 빌드 출력으로 추가한다.
6. 확정한 데이터 migration과 백업·복구 경로를 검증한다.
7. 분리된 Code Quest와 코딩테스트, 접근성·좁은 창과 확정 지원 OS별 smoke를 통과시킨다.
8. 설치본이 충분히 검증된 뒤에만 일반 학습자의 Node localhost 실행 안내를 보조 개발 경로로 내린다.

## 설치형 완료 조건

- `DEC-DESKTOP-01`에서 확정한 지원 OS에서 설치·실행·종료·재실행을 터미널이나 Docker 없이 수행한다.
- 핵심 학습 콘텐츠와 공개 평가가 네트워크 없이 동작한다.
- JavaScript와 Java 코딩테스트가 각자의 승인된 실행 경계에서 전체 공개 테스트를 로컬로 수행하고 Java runner의 컴파일·실행·격리·종료와 장애 계약이 지원 OS에서 검증된다.
- 앱이 원격 API·DB·인증·텔레메트리·비공개 또는 숨김 평가를 요구하지 않고, 네트워크 실패 때 서버 채점으로 우회하지 않는다.
- 업데이트와 재실행 뒤 진도·초안이 보존되고, 결정된 백업·복구 경로가 실제로 작동한다.
- 설치 앱이 불필요한 포트, 파일, 네트워크 또는 프로세스 권한을 열지 않는다.
- 키보드, 좁은 창, 확대, 고대비와 스크린 리더 핵심 흐름을 실제 패키지에서 확인한다.
- 패키징 의존성·라이선스·서명·업데이트 비용이 ADR과 운영 문서에 기록된다.

## bam의 결정이 필요한 항목

결정 질문·권장안·상태의 정본은 [`roadmap.md`의 결정 대기 목록](../roadmap.md#bam-결정-대기-목록) 한 곳이다. 이 설계는 다음 결정에 필요한 설치 증거만 넘긴다.

| 결정 | 이 문서에서 넘길 증거 |
| --- | --- |
| [`DEC-DESKTOP-01`](../roadmap.md#bam-결정-대기-목록) | prototype PASS·FAIL, 패키지 크기·첫 실행 시간, 격리·오프라인·데이터 보존 결과와 서명·notarization 비용 |
| [`DEC-FRONTEND-MIGRATION-01`](../roadmap.md#bam-결정-대기-목록) | React·TypeScript·빌드 도구 후보와 정확한 버전·라이선스, 정적 출력·CSP·Worker·기존 route·진도 공존, 첫 이관 경계와 rollback 결과 |
| [`DEC-WEB-OFFLINE-01`](../roadmap.md#bam-결정-대기-목록) | 선정 원본의 시작 버전·공개 검증·승인된 비교 자료와 빌드 의존성을 포함할 때의 설치 크기·무네트워크 시작 결과 |
| [`DEC-JAVA-RUNNER-01`](../roadmap.md#bam-결정-대기-목록) | JDK 25 LTS의 정확한 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·IPC·격리 계약, 패키지 크기와 지원 OS별 prototype 결과 |
| [`DEC-JAVA-01`](../roadmap.md#bam-결정-대기-목록) | Java 정식 교안 과정·Code Quest·웹과제와 Spring Boot 과정의 MVP 포함 시점·교안 범위·Code Quest 여부 |

전환 단계도 [`../roadmap.md`](../roadmap.md)에서만 관리한다.
