# 설치형 로컬 애플리케이션 설계

이 문서는 BAM.dev의 목표 배포 형태, 오프라인 경계, 로컬 데이터와 설치·업데이트 요구의 정본이다. 현재 브라우저 구현은 [`../architecture.md`](../architecture.md), 앱 chrome의 전역 색상·상태 표현은 [`visual-design.md`](visual-design.md), 제품 범위와 전환 순서는 [`../product-scope.md`](../product-scope.md)와 [`../roadmap.md`](../roadmap.md)가 담당한다. 결정 문구·이유·날짜의 정본은 [`DEC-DELIVERY-01`과 `DEC-PUBLIC-EVALUATION-01`](../roadmap.md#2026-08-29-확정-제품-결정), [`DEC-DESKTOP-PROTOTYPE-01`](../roadmap.md#2026-08-30-확정-제품-결정), [`DEC-LOCAL-EVALUATION-01`·`DEC-JAVA-CODING-TEST-01`·`DEC-JAVA-RUNTIME-01`](../roadmap.md#2026-09-02-확정-제품-결정), [`DEC-JAVA-VERSION-02`·`DEC-SPRING-BOOT-01`·`DEC-FRONTEND-01`·`DEC-JAVA-IMPLEMENTATION-01`](../roadmap.md#2026-09-04-확정-제품-결정)이고, 이 문서는 각 결정이 설치 경계에 미치는 효과를 풀어 쓴다.

## 결정 적용과 현재 차이

- `DEC-DELIVERY-01` 적용: 최종 사용자는 원격 운영 서버를 관리하지 않는 설치형 프로그램을 사용하며 학습 콘텐츠, 진도와 학습자 소스는 기본적으로 사용자 기기 안에 둔다.
- `DEC-PUBLIC-EVALUATION-01` 적용: BAM.dev 앱이 직접 계산·저장하는 결과에는 설치본 안에서 확인하고 실행하는 공개 평가만 사용한다. 외부 Git 웹과제는 고정된 실습 묶음에 함께 배포된 공개 로컬 검증을 사용하며 비공개·숨김 테스트나 원격 추가 채점을 사용하지 않는다.
- `DEC-DESKTOP-PROTOTYPE-01` 적용: 공식 지원 범위를 먼저 선언하지 않고 현재 검증 장비에서 Electron·DMG 단일 후보의 설치 capability를 측정한 뒤 `DEC-DESKTOP-01`을 결정한다.
- `DEC-LOCAL-EVALUATION-01` 적용: Code Quest와 별도 코딩테스트의 JavaScript 공개 테스트는 one-shot Worker에서 실행하며 두 제품은 내부 runner DTO·실행 추상화만 재사용한다. 설치형 MVP는 이 두 기능을 위해 Docker, Spring Boot, PostgreSQL, Nginx, 계정이나 사용자가 관리하는 수신 포트를 요구하지 않는다.
- `DEC-JAVA-CODING-TEST-01` 적용: Java 코딩테스트를 설치형 MVP에 포함하고 설치본의 공개 테스트만 사용자 기기에서 실행한다. JavaScript Worker를 Java 실행 방식으로 간주하지 않으며 구체 경계는 `DEC-JAVA-RUNNER-01`과 별도 ADR·prototype을 기다린다.
- `DEC-JAVA-RUNTIME-01` 적용: 설치 패키지가 `javac`를 제공하는 고정 JDK 또는 컴파일 가능한 축소 이미지를 포함하고 runner는 그 내부 경로만 사용한다. 시스템 JDK 요구나 이를 먼저 쓰는 prototype 경로는 두지 않는다.
- `DEC-JAVA-VERSION-02` 적용: 설치 패키지와 Java 교안·코딩테스트의 언어·표준 API 기준을 정식 Java 25 하나로 통일하고 preview를 허용하지 않는다.
- `DEC-JAVA-IMPLEMENTATION-01` 적용: Java 코딩테스트 로컬 runner는 Java 25로 작성하는 BAM.dev 제품 구성요소다. runner의 구체 구조와 연결 방식은 `DEC-JAVA-RUNNER-01`을 기다린다.
- `DEC-SPRING-BOOT-01` 적용: 앱 본체와 Java 코딩테스트 runner에는 Spring Boot를 포함하지 않는다. 교안은 정적 자산이고 실제 Spring Boot 실행은 외부 웹과제에서 시작한다.
- `DEC-FRONTEND-01` 적용: 목표 UI 소스는 HTML·CSS 기반의 React·TypeScript를 사용하고 JavaScript도 유지한다. 현재 Vanilla JavaScript·Worker·도메인 로직은 작은 화면·경계부터 점진 이관하며 설치 shell이나 Java runner와 합치지 않는다.
- `[현재 사실]` 현재 앱은 정적 HTML·CSS·Vanilla JavaScript지만 설치 프로그램은 아니다. 개발용 Node HTTP 서버를 실행하고 브라우저에서 `localhost`를 연다.
- `[현재 사실]` 현재 `package.json`에는 React·TypeScript와 전용 프런트엔드 빌드 도구 의존성이 없다.
- `[현재 사실]` 현재 Java 제품 소스, Maven·Gradle 설정과 Java 로컬 runner 구현은 없다.
- `[현재 사실]` 현재 검증 장비는 macOS 14.8.3·Apple Silicon(arm64)이다. 이 사실은 지원 OS 약속이 아니다.
- `[현재 사실]` Electron·DMG prototype, 관련 의존성과 패키지 산출물은 아직 없다.
- `[확인 필요]` 공식 지원 OS, 최종 desktop shell·설치 파일 형식, 서명·업데이트와 백업 방식은 prototype 증거 검토 뒤 정한다.

개발용 localhost와 제품 운영 서버를 구분한다. 개발자가 검증을 위해 로컬 서버를 쓰는 것은 가능하지만, 최종 사용자가 Node, Docker, 포트, 데이터베이스 또는 터미널 명령을 관리해야 한다면 설치형 완료로 보지 않는다.

## 서버 없음의 의미

설치형 MVP는 다음 원격 구성요소를 제품 필수 조건으로 두지 않는다.

- BAM.dev가 운영하는 API·웹 서버·데이터베이스
- 회원가입·로그인·세션과 원격 진도 동기화
- 원격 채점, 비공개·숨김 테스트, 원격 파일 저장과 텔레메트리
- 서버 비밀키, 서비스 역할 키와 원격 관리 콘솔

GitHub Releases나 과제 저장소처럼 정적 파일을 처음 내려받는 외부 배포 채널은 사용할 수 있다. 다만 이는 BAM.dev가 운영하는 런타임 서버가 아니며, 이미 설치한 핵심 앱의 학습 흐름은 네트워크 없이 동작해야 한다.

핵심 앱의 교안·문제·테스트·기대값·평가기와 진도를 설치본과 사용자 기기 안에 두므로 개인 학습 MVP에는 BAM.dev 런타임 서버가 필요하지 않다. 외부 웹과제도 최초 clone·fetch로 고정된 공개 검증을 받은 뒤 로컬에서 실행하며 평가 시점에 BAM.dev 서버를 호출하지 않는다. 대신 공인 점수, 변조 방지, 답안 비밀성, 부정행위 방지, 신원 확인, 중앙 제출 감사·복구와 기기 간 동기화는 제공하지 않는다. 로컬 결과를 인증·대회·보상 근거로 표현하지 않는다.

## 목표 실행 구조

```text
설치 패키지
├── 로컬 앱 shell
│   └── HTML·CSS + React·TypeScript 목표 UI의 정적 번들
├── 읽기 전용 콘텐츠·스키마·fixture
├── 공개 로컬 평가기
│   ├── JavaScript one-shot Worker
│   └── Java 25 제품 코드인 코딩테스트 로컬 runner 목표(번들 JDK 사용·미구현)
├── Java 컴파일·실행 도구체인 목표(JDK 25 LTS·정식 Java 25·미구현)
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
- Java 코딩테스트의 로컬 실행과 패키지 내부 JDK 25 LTS·정식 Java 25·preview 금지는 MVP 목표지만 현재 미구현이다. 정확한 JDK 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 파일·프로세스·네트워크·환경 변수·시간·메모리·출력 제한, 컴파일·호출 계약, shell↔runner IPC와 OS별 패키징을 다루는 `DEC-JAVA-RUNNER-01`, 별도 ADR과 prototype이 구현보다 선행되어야 한다.
- Java 정식 교안 과정·Code Quest·웹과제에 Java 코딩테스트 runner를 자동 적용하지 않는다. 그 제품 범위와 실행 계약은 `DEC-JAVA-01`에서 따로 결정한다.
- Spring Boot 실행을 설치 shell이나 Java 코딩테스트 runner에 추가하지 않는다. 향후 실제 실행은 별도 외부 웹과제 폴더에서 하며 BAM.dev는 그 프로젝트를 자동 실행하지 않는다.
- 설치 shell의 파일 열기나 폴더 선택 기능은 사용자가 명시적으로 선택한 경로에만 접근한다.

## 콘텐츠와 웹과제 배포

핵심 교안·객관식·Code Quest·코딩테스트 콘텐츠는 각 계약을 유지한 채 설치 파일에 포함해 오프라인으로 제공한다. 웹과제는 [`web-assignments.md`](web-assignments.md)의 별도 Git 저장소에서 clone할 수 있다.

이 둘의 오프라인 보장은 다르다.

- 핵심 앱: 설치 뒤 네트워크 없이 사용
- Git 웹과제: 최초 clone·fetch로 pinned starter·solution commit을 확보할 때는 네트워크가 필요하고, 확보 뒤에는 오프라인 구현·검증·정답 비교 가능
- 완전 오프라인 과제 시작: starter·solution snapshot과 비-Git 비교 안내를 설치 파일이나 별도 archive에 포함해야 하며 아직 결정되지 않음

BAM.dev 화면은 GitHub API 성공을 전제로 진입하거나 진도를 계산하지 않는다.

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
| [`DEC-WEB-OFFLINE-01`](../roadmap.md#bam-결정-대기-목록) | starter·solution snapshot과 Spring Boot 빌드 의존성 cache를 포함할 때의 설치 크기와 무네트워크 과제 시작 결과 |
| [`DEC-JAVA-RUNNER-01`](../roadmap.md#bam-결정-대기-목록) | JDK 25 LTS의 정확한 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·IPC·격리 계약, 패키지 크기와 지원 OS별 prototype 결과 |
| [`DEC-JAVA-01`](../roadmap.md#bam-결정-대기-목록) | Java 정식 교안 과정·Code Quest·웹과제와 Spring Boot 과정의 MVP 포함 시점·교안 범위·Code Quest 여부 |

전환 단계도 [`../roadmap.md`](../roadmap.md)에서만 관리한다.
