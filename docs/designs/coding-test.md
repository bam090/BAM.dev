# 코딩테스트 제품 설계

이 문서는 Code Quest와 분리된 코딩테스트의 학습 목적, 사용자 흐름, 공개 로컬 평가, 진도와 완료 조건의 정본이다. 필드·스키마는 [`../content-schema.md`](../content-schema.md#코딩테스트-컬렉션), 학습 경험 필요성은 [`../learning-content-design.md`](../learning-content-design.md), 실행 안전 경계는 [`../architecture.md`](../architecture.md)와 [ADR 0002](../decisions/0002-browser-code-execution-boundary.md)가 담당한다. 결정 문구·이유·날짜는 [`DEC-QUEST-SEPARATE-01`과 `DEC-PUBLIC-EVALUATION-01`](../roadmap.md#2026-08-29-확정-제품-결정), [`DEC-LOCAL-EVALUATION-01`·`DEC-JAVA-CODING-TEST-01`·`DEC-JAVA-RUNTIME-01`](../roadmap.md#2026-09-02-확정-제품-결정), [`DEC-JAVA-VERSION-02`·`DEC-SPRING-BOOT-01`·`DEC-JAVA-IMPLEMENTATION-01`](../roadmap.md#2026-09-04-확정-제품-결정)이 정본이다.

## 결정 적용과 현재 상태

- `DEC-QUEST-SEPARATE-01` 적용: 코딩테스트는 Code Quest의 `심화` 경로나 하위 유형이 아니라 별도의 목적·route·콘텐츠·UI·진도를 가진다.
- `DEC-PUBLIC-EVALUATION-01` 적용: 학습자 결과에 영향을 주는 모든 테스트·기대 동작은 설치본에 포함되고 확인할 수 있어야 하며, 원격·비공개·숨김 사례를 추가 실행하지 않는다.
- `DEC-LOCAL-EVALUATION-01` 적용: JavaScript MVP는 공개 테스트마다 새 one-shot Worker를 사용한다. Code Quest와 내부 runner DTO·실행 추상화를 재사용할 수 있지만 Docker·Spring Boot·PostgreSQL·Nginx·계정·사용자 관리 수신 포트를 요구하지 않고 제품 경계를 합치지 않는다.
- `DEC-JAVA-CODING-TEST-01` 적용: Java도 설치형 MVP의 코딩테스트 필수 지원 언어다. 공개 테스트만 사용자 기기에서 실행하며, JavaScript Worker 계약을 Java 실행 방식으로 복사하지 않는다. Java 정식 교안 과정·Code Quest·웹과제의 포함 결정과도 분리한다.
- `DEC-JAVA-RUNTIME-01` 적용: Java runner는 설치 패키지 내부의 `javac` 포함 고정 JDK 경로만 사용하고 시스템 JDK나 prototype용 별도 경로를 요구하지 않는다. LTS 계열과 콘텐츠 컴파일 기준은 `DEC-JAVA-VERSION-02`, 정확한 배포판·패치와 나머지 runner 계약은 `DEC-JAVA-RUNNER-01`이 담당한다.
- `DEC-JAVA-VERSION-02` 적용: 번들 도구체인과 Java 학습자 소스·공개 테스트의 언어·표준 API 기준은 정식 Java 25 하나이며 preview를 허용하지 않는다.
- `DEC-JAVA-IMPLEMENTATION-01` 적용: Java 코딩테스트 로컬 runner 자체도 Java 25로 작성하는 BAM.dev 제품 구성요소다. 이번 72개 원본 JUnit 실행의 클래스 연결·프로토콜·IPC·격리는 [ADR 0006](../decisions/0006-java-coding-test-local-runtime.md)으로 구현 전 계약을 고정한다. 정식 설치·추가 OS는 계속 별도다.
- `DEC-SPRING-BOOT-01` 적용: Java 코딩테스트 runner에는 Spring Boot를 포함하거나 Spring 애플리케이션 실행 모드를 추가하지 않는다. 실제 Spring Boot 실행은 별도 외부 웹과제의 경계다.
- `[현재 사실]` 현재 JavaScript 코딩테스트는 별도 JSON Schema, `#/coding-tests` route, 목록·필터, 초안·제출·revision별 완료 진도와 `CodingTestRunnerAdapter`를 사용한다.
- `[현재 사실]` JavaScript의 `테스트 실행`은 공개 테스트 일부를, `제출 및 채점`은 같은 문제의 공개 테스트 전체를 로컬 Worker에서 실행한다. 서버로 소스나 결과를 보내지 않는다.
- `[현재 사실]` 전환 시작 당시 코딩테스트 콘텐츠와 동작하는 runner는 JavaScript에만 있었다. 당시 로컬 Java Quest는 격리 실패로 비활성이었다. 이후 검증 커널의 Quest prototype은 PASS했지만 Java 코딩테스트 실행·정식 설치 지원은 별도다. 아래 승인된 Java draft 편입의 실제 상태는 전환 카드로 갱신한다.
- `[확정 결정]` Java 코딩테스트의 문제·공개 테스트·runner·설치 패키지 경계를 MVP 목표에 추가한다. 실제 문제 묶음과 핵심 완료 행동은 `DEC-MVP-01`, 실행 방식은 `DEC-JAVA-RUNNER-01`과 별도 격리 ADR·prototype 증거가 확정될 때까지 구현 완료로 간주하지 않는다.

내부에서 Code Quest의 Worker runner와 결과 형식을 재사용하는 것은 제품 통합이 아니다. 화면 명칭, URL, 데이터 원본, 저장 진도와 학습 목적을 서로 섞지 않는다.

## Code Quest와의 경계

### Algorithm Bridge 코딩테스트 전환

`[확정 결정]` 2026-09-15 bam의 재분류 승인으로 원본 Algorithm Bridge 72문제를 별도 Java 코딩테스트로 제공한다. 종전 [전체 Quest 편입](code-quest.md#algorithm-bridge-전체-문제-편입)을 대체하며 문제 선택과 독립 코드 작성을 코딩테스트 목록에서 시작한다. 원본 지문·L1~L4 지원·공개 판정 근거를 보존하고 분류 변경만으로 새 학습 성과를 주장하지 않는다.

- 현재 목록은 기존 JavaScript와 원본 순서의 Java 작성용 콘텐츠다. 수량은 [README](../../README.md)에만 요약한다. 기존 Quest 32개(다른 세 언어 28개·Java pilot 1개·준비 3개)는 보존한다. ARR-01·ARR-02·QUE-01의 기존 Quest는 준비 경험으로 연결하고 나머지 69개만 Quest 목록에서 옮긴다.
- Java·유형·난이도·작성 상태로 탐색한 뒤 지문→서명·제약·typed 예시→원본 공개 Test 전체→코드 작성·저장→재진입으로 이어진다. 원본 힌트는 `원본 학습 지원`으로 기본 접힘 제공하며 0개도 정상이다. L1 안내를 삭제하거나 L3/L4에 새 힌트를 만들지 않는다.
- 아래 전환 단계에서 Java72는 모두 `작성·저장 가능 / 실행·채점 미지원`이다. 검증 전에는 이 차단을 유지하며 후속 활성화 범위는 아래 [원본 JUnit 계약](#java-원본-junit-실행-계약)을 따른다. UI는 실행·제출을 제공하지 않고 미지원 사유를 텍스트로 알리며 handler와 adapter도 요청 생성 전에 차단한다. capability를 true로 바꿔도 Java 소스가 Worker에 들어가거나 실행·제출·완료 기록이 생겨서는 안 된다. 공개 Test는 읽기/다운로드 자료이며 결과나 통과 수가 아니다.
- canonical URL은 `#/coding-tests/java/bridge-<slot>`이다. 옛 Quest URL은 실제 Quest lookup을 우선한다. 준비3은 그대로 열고, 없는69에만 명시된 `legacyQuestId` 대응으로 canonical URL을 replace하여 이동 이유를 알린다. 알 수 없는 URL은 기존 오류 흐름을 유지한다.
- `bam.dev.progress.v1`의 기존 `codingTestDrafts`·`codingTestSubmissions`·`completedCodingTestProblems`와 ID/revision 계약을 재사용하며 새 저장 키를 만들지 않는다. 옛 Quest 초안·시도·완료를 삭제하지 않는다. 대응하는 옛69 초안이 있고 CT 초안이 없을 때만 `이전 Code Quest 초안 가져오기` 버튼을 제공한다. 누른 시점에도 CT 초안 존재를 재확인하고 덮어쓰지 않는다. 시도·완료는 복사하거나 합산하지 않는다.
- 정적 번들과 로컬 저장만 사용하고 원본 저장소나 외부 응답에 의존하지 않는다. 공개 소스는 escape하며 코드 영역은 독립 가로 스크롤, label·펼침 상태·저장/이동 안내는 키보드와 텍스트를 제공한다.
- 검증은 1024px·1440px 데스크톱의 탐색→상세→원문→편집/저장·재진입, 옛 URL·명시 가져오기·CT 초안 우선·0힌트·키보드와 72개 source/타입/연결·Quest32/JS CT6/진도 보존·3중 실행 차단이다. 모바일·다른 OS·Java/JDK 실행·설치 지원은 이번 완료 조건이 아니다.

`[현재 사실]` 선행 설계에 따라 Java72 등록·다중 컬렉션·작성/저장·옛 URL/명시 초안 가져오기·실행 차단을 구현했다. 독립 콘텐츠·관련 자동 검사·대표 UI·문서·통합과 PR #22 원격 CI는 PASS다. 당시 PR은 Draft였으며 이후 PR #22·#23의 병합과 CI·Pages SUCCESS를 인수했다. 실제 merge 식별자는 [후속 실행 카드](../work-items/2026-09-22-java-coding-test-runtime.md#인수한-기준-증거)를 따른다. 이후 검증 커널의 Java CT 정상·오류·대표 앱 실행도 독립 PASS했으며 그 결과는 아래 원본 JUnit 실행 절을 따른다. 아래 기존 Java 부재·gate 서술은 이 시작 기준과 향후 실행 지원에 관한 것으로, 승인된 draft 편입을 막지 않는다. 실제 구현·검증·게시 상태는 [전환 카드](../work-items/2026-09-15-algorithm-bridge-coding-tests.md)를 따른다. 실패하면 CT 등록·전환 UI 변경을 반환하고 원본·기존 사용자 상태를 보존한다. Java 실행 재개·채점 계약은 별도다.

| 구분 | Code Quest | 코딩테스트 |
| --- | --- | --- |
| 목적 | 교안 개념을 실제 작성 단위로 연습 | 문제 단서에서 접근을 고르고 독립 풀이를 완성 |
| 진입 | 교안·학습 주제와 가까운 연결 | 별도 문제 목록·검색·필터 |
| 지원 | starter, 단계별 힌트, 실패 후 재관찰 지점 | starter와 공개 사례, 첫 시도 전 전체 풀이 순서 비노출 |
| 현재 데이터 | `content/quests/` | `content/coding-tests/` |
| 현재 route | `#/quest/...` | `#/coding-tests/...` |
| 현재 진도 | Quest 초안·실행·완료 | 코딩테스트 초안·제출·revision별 완료 |

`difficulty`가 같거나 실행기를 공유해도 두 기능의 진도와 완료율을 합치지 않는다. 서로 연결할 때는 실제 `lessonId`·`conceptIds`와 링크를 사용하고, 코딩테스트를 Code Quest ID나 `practiceLevel`로 변환하지 않는다.

## Java 원본 JUnit 실행 계약

`[확정 결정]` 2026-09-22 후속 구현은 [ADR 0006](../decisions/0006-java-coding-test-local-runtime.md)의 원본 JUnit 선컴파일·typed adapter·method별 fresh JVM 계약을 따른다. `[현재 사실]` 이 계약의 CT runner·IPC·UI를 구현했고 검증 커널의 정상·오류·대표 앱 실행을 독립 PASS해 CT capability를 활성화했다. 실행 수·재사용·한계는 작업 카드가 정본이다. 문제·공개 Test·학습 지원의 의미를 바꾸지 않는다.

검증 앱에서는 첫 공개 그룹 하나를 `테스트 실행`으로, 해당 문제의 전체 공개 그룹을 `제출 및 채점`으로 선택한다. 한 그룹 문제는 두 실행의 범위가 같음을 알린다. parameterized invocation은 원본 method 안에서 모두 실행·집계하며 168개 method 묶음을 invocation 총수로 표시하지 않는다. 실제 실행이 0이거나 skip/abort/누락·실행기 오류이면 성공으로 표시하지 않는다. 일부 실행 성공은 완료가 아니고 전체 submit의 모든 공개 결과 PASS만 기존 CT revision 완료로 기록한다.

원본 `codingTestDrafts`·`codingTestSubmissions`·`completedCodingTestProblems`와 안정 ID를 사용하며 Quest 진도를 합치거나 기존 사용자 상태를 지우지 않는다. 실행·취소·오류 상태는 텍스트와 키보드로 확인할 수 있게 하고 취소·창 닫기·재시작 복원에서 거짓 성공을 막는다. 선행 검증에서는 source·PASS submission·completion을 재시작 후 복원했고 상세 결과 카드는 session-only였다. 후속 상세 복원의 구현·검증 상태는 [상세 결과 복원 계약](#상세-결과-복원과-오류-안내)을 따른다. 일반 웹은 Java 작성/저장과 미지원 안내를 유지한다. 단계별 역할·실행 상한·원본 보존·실패 중단과 검증 증거는 [작업 카드](../work-items/2026-09-22-java-coding-test-runtime.md) 한 곳에서 관리한다.

## 학습자 흐름

```text
코딩테스트 목록에서 JavaScript 또는 Java와 난이도·유형·상태 확인
→ 문제 계약·예시·제약 읽기
→ 접근과 흐름을 스스로 정하고 코드 작성
→ 공개 테스트 일부로 빠르게 확인
→ 전체 공개 테스트로 로컬 결과 확인
→ 실패 사례의 기대값·실제값·확인 지점 검토
→ 수정하거나 연결 교안·Code Quest로 돌아가기
```

현재 내부 실행 모드 이름 `submit`은 서버 제출을 뜻하지 않는다. 학습자 UI에서는 `이 기기에서 전체 공개 테스트 확인`처럼 실행 위치와 범위를 설명하고, 네트워크 업로드·공인 채점·교사 검증처럼 표현하지 않는다.

## 목록과 문제 화면

목록은 다음을 제공한다.

- 현재 지원 언어, 난이도, 문제 유형과 풀이 상태 필터
- 제목·설명·태그 검색과 현재 결과 수
- 시작 전·초안 있음·현재 revision 완료 상태
- 문제별 언어·난이도·유형·연결 교안

문제 화면은 다음 순서를 유지한다.

1. 제목, 문제 설명, 함수 계약, 제약과 예시
2. 학습자가 자신의 접근을 정리할 수 있는 문제 작업 영역
3. 명시적인 label이 있는 코드 편집기
4. 공개 테스트 일부 실행과 취소
5. 전체 공개 테스트 실행과 취소
6. 테스트별 기대값·실제값·실패 설명을 가진 결과 영역
7. 다시 풀기, 목록, 연결 교안·Code Quest 중 실제 가능한 다음 행동

문제 유형 자체가 L3·L4 학습 경험을 자동 증명하지 않는다. 각 문제의 A/E/C/T, 지원 수준과 기존 콘텐츠 차이는 학습 경험 카드로 검증한다.

## 공개 로컬 평가 계약

- 학습자 결과의 분자·완료 상태에 영향을 주는 사례는 문제의 `publicTests`에만 있다.
- `runTestIds`는 빠른 확인에 쓰는 `publicTests`의 부분집합이며 별도 비공개 suite가 아니다. 현재 콘텐츠는 전체보다 작은 집합을 사용하지만 스키마가 이를 일반 불변식으로 강제하지는 않는다.
- 전체 확인은 해당 revision의 `publicTests`를 모두 로컬에서 실행한다.
- 문제, 입력, 기대값, 실패 설명과 적용 제한은 번들된 데이터에서 확인할 수 있다.
- 실행 결과는 테스트별 상태, 기대값, 실제값, 오류·취소·미실행을 숨기지 않는다.
- 원격 서버가 보관한 추가 사례, 비밀키, 원격 점수 보정이나 사후 채점을 사용하지 않는다.

`tests/fixtures/`의 기준답안·독립 사례·대표오답은 콘텐츠 제작자가 문제와 공개 평가를 검증하는 개발 증거다. 설치본의 학습자 답안에 실행하지 않고 점수·완료에 영향을 주지 않으므로 숨김 채점 테스트가 아니다. 이 구분을 문서와 인계 증거에 명시한다.

## 상세 결과 복원과 오류 안내

`[확정 결정]` 2026-09-22 사용자 요청에 따라 현재 단일 마지막 결과 패널을 재시작 후 복원하고 오류 6종에 원인과 확인할 점을 안내한다. 새 탭·결과 이력 UI·문제·교안·채점 기준은 추가하지 않는다. `[현재 사실]` 단일 상세 snapshot·정확한 source fingerprint·이전 코드 표시·reset·6종 안내를 구현했고 focused 13/13과 독립 문구 검토 PASS를 인수했다. 기존 실제 report replay를 사용한 Electron 상세 저장·재시작 복원·이전 코드 표시·reset 검증도 독립 PASS했다. 이 검증에서 Java·javac는 새로 실행하지 않았다. 근거는 [후속 작업 기록](../work-items/2026-09-22-java-coding-test-runtime.md#2026-09-22-상세-결과-복원과-오류-안내-후속-설계)을 따른다.

### 저장과 복원

- 기존 `bam.dev.progress.v1`에 독립 optional `codingTestResults` 배열을 추가한다. snapshot은 문제 ID·revision·language·실행 source fingerprint·mode·finishedAt과 UI에 필요한 요약, 각 공개 테스트 상태, Java 그룹/invocation 집계, JavaScript 기대/실제 값과 오류만 보관한다. 사용자 source·JUnit 원문·IPC 실행 권한을 복제하지 않으며 snapshot을 실행 요청으로 사용하지 않는다.
- 최신 20문제의 마지막 결과 하나씩만 유지한다. 각 snapshot은 직렬화한 UTF-8 기준 64 KiB 이내로 제한한다. 큰 결과를 잘라 다른 판정처럼 저장하지 않고 “결과가 커서 상세 내용을 저장하지 못했습니다. 현재 화면에서 확인해 주세요.”라고 안내한다. 기존 판정·제출·완료와 현재 화면의 결과는 보존한다.
- 배열이 없는 기존 v1도 유효하다. 개별 snapshot이 손상됐으면 해당 항목만 제외하고 다른 진도를 초기화하지 않는다. ID·language·revision이 일치하는 마지막 유효 결과만 복원하고 revision이 다르면 복원하지 않는다. 복원은 새 제출·완료·실행으로 기록하지 않는다.
- 현재 코드와 실행 source fingerprint가 다르면 “이 결과는 이전 코드로 실행한 결과입니다. 현재 코드를 확인하려면 다시 실행하세요.”라고 안내한다. 자동 재실행하지 않는다. fingerprint는 실행 당시 source의 정확한 UTF-8 바이트를 lowercase SHA-256으로 계산하며 trim·NFKC 정규화하지 않는다. 기존 coding-test 도메인에 async `createCodingTestSourceFingerprint(source, crypto = globalThis.crypto)` 한 함수만 두고 Web Crypto 부재·digest 실패는 현재 실행 결과를 보존한 상세 저장 실패로 처리한다. repository는 `getCodingTestResult(problemId, problemRevision)`·`saveCodingTestResult(input)`·`clearCodingTestResult(problemId)`만 추가하며 `finishedAt`은 repository clock이 부여한다. 저장 input은 식별자·revision·languageId·sourceFingerprint·mode와 필요한 report projection만 받는다. 별도 범용 저장 추상화를 만들지 않는다.
- 문제 reset 시 해당 상세 snapshot도 삭제한다. `run` 결과 저장은 제출·완료 배열과 독립이며 `submit`은 기존 전체 공개 PASS 규칙을 유지한다. 저장 실패는 화면 결과·기존 진도를 유지하고 “상세 결과를 저장하지 못했습니다. 현재 화면의 결과와 기존 학습 기록은 유지됩니다.”라고 알린다. 실패한 상세 저장 때문에 기존 기록을 빈 값으로 덮어쓰지 않는다.
- 브라우저와 macOS prototype의 공통 renderer·저장 경계에 적용한다. 웹 Java의 실행 미지원, 앱의 검증 커널 제한은 그대로다. engine·IPC·JDK·sandbox·공개 평가 의미는 변경하지 않는다.

### 오류별 확인할 점

아래 안내는 실제 상태·오류 메시지와 함께 표시한다. 관찰하지 않은 원인을 확정하거나 정답 코드를 제공하지 않는다.

| 상태 | 원인과 다음 확인 안내 |
| --- | --- |
| 오답 | “실패한 공개 테스트의 기대값·실제값과 문제 조건을 비교해 보세요.” |
| 컴파일·문법 오류 | “오류 위치를 확인하고 기호, 이름, 타입이 맞는지 살펴보세요.” |
| 실행 중 오류 | “오류 메시지를 확인해 보세요. 표시된 사유에 따라 배열 범위, null 사용, 메모리 사용 등을 점검하세요.” |
| 시간 초과 | “실행 시간 제한을 넘었습니다. 반복문의 종료 조건과 입력 크기에 따른 반복량을 확인해 보세요.” |
| 취소 | “사용자가 실행을 중단했습니다. 오답이나 성공으로 판정하지 않았습니다. 준비되면 다시 실행하세요.” |
| 출력 제한 | “출력량 제한을 넘었습니다. 디버그 출력을 줄이고 필요한 출력만 남겨 보세요.” |

실행기·provider·protocol 등 infrastructure 오류는 “실행기 문제로 결과를 확인하지 못했습니다.”로 구분하고 학습자 오답으로 표시하지 않는다. 미실행은 “이 테스트는 실행되지 않았습니다.”로 표시한다. 복원된 오류도 같은 안내를 사용하며 상태·원래 오류를 새 안내로 덮어쓰지 않는다. 키보드 흐름·기존 결과 패널과 상태 알림을 유지한다.

## 로컬 결과의 한계

공개 로컬 평가는 개인 학습에 필요한 설명 가능성과 오프라인 실행을 우선한다. 다음은 보장하지 않는다.

- 테스트·기대값·진도·시간이 사용자가 보거나 수정하지 않은 원본이라는 증명
- 답안 비밀성, 부정행위 방지, 작성자 신원과 독립 수행 증명
- 공인 점수·자격·보상·교사 승인과 감사 가능한 중앙 제출 이력
- 중앙 백업, 기기 간 동기화와 서버 복구
- 악의적 코드에 대한 프로세스·컨테이너 수준의 강한 격리

따라서 결과를 `로컬 학습 확인`으로 표현한다. 이후 인증·경쟁·보상 기능이 필요해지면 현재 결정과 충돌하는 별도 제품 결정으로 다시 검토하며, 현재 MVP에 서버 채점을 미리 설계하지 않는다.

## 진도와 revision

- 초안은 문제 ID와 revision을 함께 보존하고 다른 revision에 조용히 적용하지 않는다.
- 실행만으로 제출 기록이나 완료를 만들지 않는다.
- 전체 공개 테스트를 모두 통과한 현재 revision만 완료로 센다.
- 이전 revision의 완료는 학습 이력으로 보존하되 현재 완료와 구분한다.
- 결과 기록에는 사용자 소스를 중복 저장하지 않고 초안 저장소를 사용한다.
- Code Quest 진도와 합쳐 하나의 완료율로 표시하지 않는다.

## 오프라인·안전 경계

JavaScript 코딩테스트는 각 공개 테스트를 one-shot Worker에서 실행하고 시간·입출력·출력·횟수 제한, 취소와 실행 ID 검증을 유지한다. 설치 shell은 Worker 문맥의 필요한 동적 컴파일 capability만 좁게 허용하고 학습자 코드에 Node, 파일시스템, 프로세스, JDK 또는 privileged IPC를 노출하지 않는다.

Worker는 완전한 악성 코드 격리가 아니다. 앱 origin에는 민감한 쿠키·토큰·비밀과 권한 API를 두지 않으며, 네트워크 차단과 CSP는 선택한 shell에서 실제 검증한 범위만 주장한다.

### Java 코딩테스트 목표 경계

`[확정 결정]` Java 코딩테스트도 원격 서버·Docker·Spring Boot·PostgreSQL·Nginx 또는 사용자가 관리하는 수신 포트 없이 설치 앱 안에서 시작하고, 설치본에 포함된 공개 테스트만 사용자 기기에서 실행한다. 공개 평가의 문제·입력·기대값·제한과 실패 근거는 JavaScript와 같은 투명성 원칙을 따르지만 실행 엔진은 같은 Worker라고 가정하지 않는다.

`[현재 사실]` Java 코딩테스트 schema·문제·개발 fixture와 읽기/작성/저장 UI는 등록됐다. 검증 커널의 Java CT runner·IPC·대표 앱 실행은 독립 PASS했다. 다음 정식 설치 목표의 gate는 해당 prototype 증거와 구분하며 공식 설치 지원을 완료한 것으로 보지 않는다. 승인된 draft72의 등록을 다시 막는 조건은 아니다.

1. 이번 draft72의 문제·근거 연결 승인은 위 전환 계약으로 충족한다. `DEC-MVP-01`에서 설치형 실제 실행 묶음과 핵심 완료 행동을 확정한다. 이미 승인된 정적 Java 교안·개념 ID와 별개로 미승인 코딩테스트 문제 ID·근거 연결·실행 계약을 지어내지 않는다. 정적 과정의 제공 상태를 설치형 코딩테스트 묶음의 승인으로 해석하지 않는다.
2. `DEC-JAVA-RUNNER-01`에서 JDK 25 LTS의 정확한 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 패키지 크기와 업데이트 비용을 결정한다. JRE-only 구성, 시스템 `JAVA_HOME`·`PATH` 의존, Java 25가 아닌 호환 기준과 preview 활성화는 후보가 아니다.
3. 별도 격리 ADR에서 소스 단위·진입점·컴파일·호출·결과 DTO, shell↔runner 경계와 IPC 허용 목록을 결정한다.
4. 같은 ADR과 prototype에서 runner 작업 폴더 수명주기, 프로세스·파일·네트워크·환경 변수·시간·메모리·출력 제한, 취소·강제 종료와 잔여 프로세스 정리를 검증한다.
5. 승인된 지원 OS와 실제 설치 패키지에서 정식 Java 25 언어·표준 API 기준과 preview 금지를 확인하고 첫 실행·오프라인·컴파일 오류·런타임 오류·시간 초과·취소·정답·대표오답을 재현한다.
6. 공개 테스트와 기대값을 숨기지 않고, runner 장애·미실행을 오답이나 0점으로 기록하지 않으며 현재 revision의 전체 공개 테스트 PASS만 완료로 저장한다.

prototype 결과에는 runtime·compiler의 정확한 버전·출처·라이선스, 패키지 증가량, 실행 명령과 권한, 사용한 콘텐츠·테스트 ID, OS별 PASS·FAIL과 미검증 범위를 남긴다. 이 증거와 `content_validator`, `test_engineer`, `project_integrator`의 독립 PASS 전에는 Java 코딩테스트 지원 또는 설치 완료를 주장하지 않는다.

## 접근성·모바일

- 목록·필터 결과와 실행 상태를 색만으로 표시하지 않는다.
- 편집기, 빠른 실행, 전체 확인, 취소와 결과의 키보드 순서가 예측 가능해야 한다.
- 실행 결과는 이름 있는 단일 focus 영역으로 이동하고 기대값·실제값·원인을 텍스트로 제공한다.
- 320px 폭에서 문제→편집기→결과의 한 열 흐름과 코드 가로 스크롤을 보존한다.
- 실행 중에도 코드 선택·복사와 취소가 가능하며 reduced motion·고대비를 지원한다.

## 완료 조건

- Code Quest와 다른 이름·route·JSON·진도·완료율을 유지한다.
- 빠른 실행과 전체 확인이 같은 공개 테스트의 선택 집합·전체 집합임을 화면에서 설명한다.
- 서버 요청 없이 전체 공개 테스트, 오류·취소·진도 저장이 설치 앱에서 동작한다.
- JavaScript와 Java가 각각 승인된 실행 경계로 동작하고, Java의 컴파일 오류·런타임 오류·시간 초과·출력 제한·runner 장애를 오답과 구분한다.
- JDK 25 LTS의 정확한 배포판·패치 버전·재배포 라이선스·패키지 비용, 정식 Java 25·preview 금지와 지원 OS별 격리·오프라인 증거가 남는다.
- 현재 revision과 이전 revision, 실행과 완료가 섞이지 않는다.
- 목록 검색·필터, 키보드, 320px, 고대비와 결과 focus가 실제 화면에서 검증된다.
- 기준답안·독립 사례·대표오답으로 공개 평가의 정확성을 검증하되 개발 fixture를 학습자 채점에 사용하지 않는다.
- `content_validator`, `test_engineer`, `project_integrator`가 각 책임 범위에서 PASS하고 bam이 최종 UX를 승인한다.

## 확인이 필요한 선택

- `제출 및 채점` 버튼을 `전체 공개 테스트 확인`으로 바꿀지, 기존 용어에 로컬 설명을 추가할지
- 전체 공개 테스트를 문제 화면에서 기본 펼침, 접힌 목록 또는 별도 보기 중 어떻게 노출할지
- 이전 revision 완료를 목록에서 어떤 라벨로 표시할지
- `DEC-MVP-01`: 승인된 draft72와 구분한 설치형 실제 실행 묶음과 관찰 가능한 핵심 완료 행동
- `DEC-JAVA-RUNNER-01`: JDK 25 LTS의 정확한 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·호출·IPC·격리·OS별 패키징 계약

기능 상태와 우선순위는 [`../roadmap.md`](../roadmap.md)가 관리한다.
