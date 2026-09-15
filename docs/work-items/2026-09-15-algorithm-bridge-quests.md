# Algorithm Bridge 대표 세 문제의 Code Quest 편입

## 범위와 완료 경계

`[확정 결정]` 2026-09-15 bam이 대표 ARR-01·ARR-02·QUE-01을 기존 Java Code Quest에 편입하는 안을 승인했다. 유형은 **학습 콘텐츠 포함 기능**이다. 원본을 읽기 전용 출처로 삼아 문제·생각 질문·힌트·시작 코드·공개 사례를 편입하고, 필요한 배열 계약·코드 작성/저장 UI를 연결한다. 원본 프로젝트 전체를 복제하거나 기존 교안·객관식·코딩테스트를 다시 쓰지 않는다. Git 게시·DMG·지원 OS 확대는 포함하지 않는다.

`[현재 사실]` 작업 시작 시 Java pilot 한 개가 등록되어 있고 실제 격리 javac 종료/reap 실패로 capability는 고정 false다. 이 작업의 콘텐츠/정적 검증·작성 흐름은 독립 진행할 수 있으나 **학습자의 실제 Java 컴파일·공개 평가·완료 판정은 BLOCKED**다. 새 Java/javac 실행·profile 실험·false gate 변경은 하지 않는다. 종료 문제의 진단·재개는 [별도 런타임 카드](2026-09-15-java-code-quest-runtime.md#격리-실패와-재개-조건)를 따른다.

최소 완료 증거는 (1) 원본 출처·입력·공개 assertion·경험 카드 독립 검토, (2) 신규 JSON·schema·typed codec/관찰 비교 및 기존 pilot 보존 검사, (3) Java 없는 대표 데스크톱의 목록/상세·생각 질문·힌트·편집/초안 복원·전체 공개 데이터 접근·실행 차단·완료 불변, (4) 독립 문서 검토·통합 판정이다. 실제 JVM 실행 필수 검증은 별도 BLOCKED로 남기며 부분 PASS를 전체 실행 지원 완료로 바꾸지 않는다.

정본은 [제품 흐름](../designs/code-quest.md#algorithm-bridge-대표-세-문제-편입), [콘텐츠 계약](../content-schema.md#algorithm-bridge-java-배열-quest-편입), [비활성 실행 프로토콜](../decisions/0005-java-quest-local-runtime.md#배열-세-문제의-비활성-프로토콜-확장)이다. 같은 계약을 이 카드에서 다시 정의하지 않는다.

## 경로 소유권과 순서

| 역할 | 소유·검토 범위 | 인수 조건 |
| --- | --- | --- |
| 제품·설계 문서 담당 (Astra high) | Code Quest 정본·content-schema·ADR 0005 평가 프로토콜·이 카드·문서 지도/로드맵 연결 | 실행 차단 유지, 구현 가능한 최소 계약·출처·학습 카드 기록 |
| 콘텐츠 작성자 | `content/quests/java.json` 신규 3개와 원본 읽기/저작 인계 | 기존 pilot 보존, 원본 전체 공개 assertion·길이100000 보존, A/E/C/T·기준답안 후보 인계 |
| 제품 구현자 | Java schema·validator·도메인 계약·adapter·감독/Java runner의 비활성 배열 후보 | 세 exact signature·공개 데이터만 수용, 부정 codec 검사 가능, Java 실행 금지·false 유지 |
| UI 구현자 | 기존 Code Quest 탐색/상세·실행 진입점의 표시/작성/저장 경계 | capability와 무관한 작성, 실행 guard·완료 쓰기 차단, 전체 공개 값 접근 |
| 독립 테스트 작성자 | Java fixture·콘텐츠/codec/UI 영향 테스트 | 원본과 계약에서 기대값·대표 실패 test ID를 별도 확인 |
| content_validator | 원본·새 콘텐츠·카드 읽기 전용 | 목표·정확성·중복·출처·공개 assertion 독립 판정 |
| test_engineer | 콘텐츠 PASS 후 결합된 코드·테스트/대표 데스크톱 읽기 전용 검증 | 실제 실행·재사용·미실행 분리, Java/JDK 실행 금지 |
| 문서 검토자·project_integrator | 각각 독립 읽기 전용 문서 검토·최종 통합 | 같은 hash/revision의 증거만 재사용, 쓰기 역할과 분리 |

총괄이 실제 배정 시 겹치는 `src/app.js`·core/UI 등의 파일은 한 담당의 인계 뒤 순차 소유권을 넘긴다. 원본 조사·콘텐츠 작성은 병렬 진행할 수 있으나 schema/제품 구현은 이 문서 계약 기록 뒤 진행한다. 콘텐츠 생성자가 자신의 결과를 최종 승인하지 않는다. 작업 시작 때 이미 있던 dirty 파일·이전 작업 변경은 보존하며 검증은 이번 변경 영향에 한정한다.

## 출처와 보존

원본 project는 `algorithm-bridge`, 읽기 전용 경로는 `/Users/goonbam/study/grepp/algorithm-bridge`, revision은 `dadc227da923f339bbc92ca02109fefdbd1da4a7`이다. 아래는 콘텐츠 작성자가 2026-09-15 원본 Problem/Solution/Test와 guide를 읽고 전달한 파일 SHA-256이다. 로컬 경로는 관리 증거이며 제품 데이터·브라우저 route·실행 필수 경로가 아니다.

| 새 Quest ID | 원본 slot | 원본 문제·풀이·테스트 / 안내 |
| --- | --- | --- |
| `quest-java-bridge-arr-01` | ARR-01 | 아래 `ArrayProblem01` / `ArraySolution01` / `ArraySolution01Test` / `ArrayGuide` |
| `quest-java-bridge-arr-02` | ARR-02 | 아래 `ArrayProblem02` / `ArraySolution02` / `ArraySolution02Test` / `ArrayGuide` |
| `quest-java-bridge-que-01` | QUE-01 | 아래 `QueueProblem01` / `QueueSolution01` / `QueueSolution01Test` / `QueueGuide` |

| 원본 상대 경로 | SHA-256 |
| --- | --- |
| `src/main/java/bridge/array/ArrayGuide.java` | `a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968` |
| `src/main/java/bridge/queue/QueueGuide.java` | `dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329` |
| `src/main/java/bridge/array/onedimensional/problem/ArrayProblem01.java` | `b54a4a6119509a8ee76b21bba28555ff7979460e2598f4b6805152d4531b34ef` |
| `src/main/java/bridge/array/onedimensional/solution/ArraySolution01.java` | `f3921750e1b4af32db5c2fd70a9782794006e7f81132a1fa11c4d2d8640c73fa` |
| `src/test/java/bridge/array/onedimensional/test/ArraySolution01Test.java` | `56ff3512838f017d6ee4ac172dc6e82d88035d520932316f0a5793103b30d97b` |
| `src/main/java/bridge/array/onedimensional/problem/ArrayProblem02.java` | `5b9cbc7b6708c11ecffaca4e5a5cbfa05cc46a6416ae3c5146ba79fb5e2638af` |
| `src/main/java/bridge/array/onedimensional/solution/ArraySolution02.java` | `f0b329dad1174dcca25367fde05055c5e05259a134a8dd73e89d17f45270c817` |
| `src/test/java/bridge/array/onedimensional/test/ArraySolution02Test.java` | `9c8394392c6234c87f3ed44719e0013e4984f2a746224d5e5ed80573907d3309` |
| `src/main/java/bridge/queue/problem/QueueProblem01.java` | `e1f7be176d12677bc702374acd7f0c1cc28fee1242e16f0f7f411302d68e7fed` |
| `src/main/java/bridge/queue/solution/QueueSolution01.java` | `6ecfad8db7a26b4bac861f6e82bd38d6a2212d937a010c736ad5bafab246c5ba` |
| `src/test/java/bridge/queue/test/QueueSolution01Test.java` | `4899d6a30751d7430c3946e319dd197d3d540d0c82d5b3d89f579c1951af0b2e` |

원본의 Java 26 설정은 선행 조사 인계를 재사용했다. 작성자가 확인한 이 11개 파일에는 Java 26 전용 문법/API가 보이지 않았지만 Java 25 컴파일·실행은 하지 않았다. 원본 72개 전체의 호환성·정확성을 판정하지 않는다. 원본 바이트는 바꾸지 않고 단일 `Solution.solve` 형태로 필요한 3개만 파생한다.

## 학습 경험 설계

공통 `courseId=java`, `languageId=java`다. 기존 `quest-java-total-price` 객체와 기존 세 언어 콘텐츠·진도를 보존한다. 원본 세 문제의 L1 사다리를 유지하고 가까운 빈 상태·원본 보존 조건을 L2 관찰로 다루되 L3/L4나 전이 성과를 주장하지 않는다. 학습자는 생각 질문 후 메서드 본문을 직접 쓰고 concept→observation→implementation 순서로 힌트를 요청한다. class/static 선언과 기본 반환은 시작 틀이며 기준답안은 개발 fixture에만 둔다.

ARR-01·QUE-01은 반환 배열 값·길이·순서와 입력 불변·새 참조를 모두 공개한다. ARR-02에는 원본에 없는 입력 불변 의무를 추가하지 않는다. 특정 문법/API·복잡도는 source 문자열 채점으로 강제하지 않으며 QUE-01의 Queue/Deque·O(n)는 비채점 자기점검이다. 공개된 최대 길이 사례는 실제 값으로 보존하고 화면 요약 뒤에도 모든 값에 접근할 수 있어야 한다. 실제 Java 실행 없이 code 작성·저장은 제공하지만 학습 완료를 만들지 않는다.

아래 카드는 콘텐츠 작성자의 원본 조사와 기존 교안/객관식 비교를 인계받아 기록했다. 독립 content_validator의 반환 수정 후 PASS를 인수했다. 독립 사례와 대표오답의 실제 Java 실행은 아직 하지 않았으며 테스트 작성자/검증자의 별도 증거와 구분한다.

## ARR-01 — 기록 한 칸 바로잡기

- 작업·ID: Algorithm Bridge 첫 반입 / `quest-java-bridge-arr-01`, slug `bridge-arr-01`, revision 1, order 2.
- MVP 이유: 읽거나 정답을 선택하는 단계 뒤 배열을 직접 다루고, 값이 맞아도 입력을 훼손하면 계약을 지키지 못했음을 확인한다.
- 선수·연결: `java-concept-arrays` / `java.arrays`; 추가 선수 읽기 `#/learn/java/wiki-argument-values`. 두 교안의 실제 본문을 확인했다. 기존 Quest 선수는 강제하지 않는다.
- 학습자 단서: slotNumber는 1부터 세는 위치, 그 칸만 고친 새 배열, 원본 readings는 그대로.
- 새 A: 문제의 위치 번호를 배열 인덱스로 바꾸어 정확한 한 칸을 수정한다. 입력과 결과를 서로 다른 배열로 만든다.
- 재사용 A: 배열 생성·읽기·반환, 정수 대입.
- 새 E: 독립 배열 준비 → 위치 변환 → 한 칸 변경 → 결과 반환.
- C: 같은 값으로 수정해 반환값이 동일해도 새 참조가 필요하다. 원본 불변은 값 정답과 별개의 조건이다.
- T: 없음. 단계별 지원이 있는 직접 구현 연습이며 전이 관찰 과제로 세지 않는다.
- 사다리·지원: 원본 L1, 가까운 L2 원본 보존 조건 포함. 2번째 칸/첫·마지막 칸의 인덱스, 두 변수가 같은 배열인지 질문. 첫 힌트는 배열의 0 시작과 참조/값 구분.
- 자기 설명: “1부터 세는 위치를 인덱스로 바꾸고, 원본과 별개인 배열의 한 칸만 바꿔 반환했다.”
- 독립성: 기존 배열 교안은 생성·원소 접근·행별 순회, 객관식 `quiz-java-concept-arrays-creation-boundary`는 생성 문법 선택, `...-ragged-rows`는 2차원 행별 반복 조건 선택이다. 본 문제는 1차원 입력·위치·수정값을 받아 전체 배열을 직접 생성하고 불변/identity를 관찰한다. 기존 Java Quest 주문금액의 scalar 산술과 목표·입출력·조건·흐름이 다르다. 원본 책 경계의 배열 정렬/중복제거와 달리 정렬이나 중복제거 없이 한 칸만 바꾼다. 책의 원문·정답은 복제하지 않는다.
- 대표 오답: 입력을 수정해 그대로 반환; slotNumber를 0 시작으로 오해; 같은 값이면 입력 참조 반환; 같은 값인 모든 칸 수정.
- 공개 범위: 원본 6개 그대로 — 가운데/첫/마지막, 길이1·수정값동일, 중복값 중 한 칸, 최대길이100·값 -1000/0/940/1000. 모두 값+원본불변+새참조.
- 독립 후보: `[0,-8,11,23],4,940 → [0,-8,11,940]`; `[-1000],1,1000 → [1000]`; `[6,6],1,6 → [6,6]`와 새 참조.
- 출처·일자: 아래 출처 대응표의 ARR01 Problem/Solution/Test·ArrayGuide, 2026-09-15.
- 사람 판단: 요구가 아닌 clone 사용 강요 여부, 동일값 사례에서 identity 피드백을 초보자가 이해하는지. 실제 학습자 관찰 미실행.

## ARR-02 — 허용 범위 안의 기록 수

- 작업·ID: 같은 묶음 / `quest-java-bridge-arr-02`, slug `bridge-arr-02`, revision 1, order 3.
- MVP 이유: 배열을 하나씩 읽으며 두 조건을 동시에 적용하고 필요한 결과만 기억하는 작은 구현을 제공한다.
- 선수·연결: `java-concept-control-flow` / `java.control-flow`; 배열 교안 `#/learn/java/wiki-arrays` 추가 선수. 실제 ID·본문을 확인했다.
- 학습자 단서: minimum 이상이면서 maximum 이하, 두 경계를 포함, 반환은 개수.
- 새 A: 각 값이 닫힌 구간 안에 있을 때만 개수를 1 늘린다.
- 재사용 A: 배열 순회, if 분기, 정수 변수 초기화·반환.
- 새 E: 값 읽기 → 두 경계 함께 비교 → 해당할 때 개수 갱신 → 마지막 개수 반환.
- C: minimum=maximum이면 같은 값의 출현 횟수를 센다. 빈 입력이면 본문이 0번 실행되어 개수가 0이다.
- T: 없음. 힌트를 제공하는 L1 연습이다.
- 사다리·지원: 원본 L1. 무엇을 기억할지, AND/OR, 빈 배열 반복 횟수를 먼저 묻고 전체 정답은 제공하지 않는다.
- 자기 설명: “각 기록을 한 번씩 읽고 양쪽 경계를 모두 만족할 때만 개수를 늘렸다.”
- 독립성: 기존 조건반복 교안·`...control-flow-loop-update` 객관식은 반복값/횟수를 추적한다. 본 문제는 학습자가 배열→조건→누적 상태→int 결과를 직접 만든다. ARR01은 위치 지정과 새 배열 생성이므로 입력·결과·판단·상태가 다르다. 책 경계의 모의고사는 여러 대상별 패턴/점수/최고·동점자 선택이고 본 문제는 단일 구간의 개수이므로 전체 풀이를 대체하지 않는다.
- 대표 오답: >/<로 경계 제외; && 대신 ||; 맞는 값을 더해 개수 대신 합계 반환; 첫 일치에서 1 반환; 중복된 허용값을 하나만 세기.
- 공개 범위: 원본 6개 그대로 — 안팎 혼합, 양경계 포함, 빈 배열, 음수 범위 전부밖, 동일경계·중복·입력값 ±10000, 최대길이1000의 940 반복. 원본은 minimum/maximum 자체 범위를 좁히지 않았으므로 Java int 전 범위와 minimum≤maximum을 유지한다.
- 독립 후보: `[-10000,0,10000],-2147483648,2147483647 → 3`; `[5],5,5 → 1`; `[-4,-3,-2,2],-3,2 → 3`.
- 출처·일자: 아래 출처 대응표의 ARR02 Problem/Solution/Test·ArrayGuide, 2026-09-15.
- 사람 판단: 수치 범위와 닫힌 구간을 혼동하지 않는 설명인지. 전체 입력 불변을 채점 조건에 임의로 추가하지 않았는지.

## QUE-01 — 맨 앞 순번을 한 번 미루기

- 작업·ID: 같은 묶음 / `quest-java-bridge-que-01`, slug `bridge-que-01`, revision 1, order 4.
- MVP 이유: 자료구조 메서드를 읽고 고르는 단계에서 실제 순서 변화와 빈 상태를 다루는 구현으로 이어진다.
- 선수·연결: `java-concept-deque` / `java.deque`; 배열·반복 교안과 제네릭이 선수다. Queue와 ArrayDeque의 import는 제공한다. 교안의 Deque는 Queue를 지원하며 Queue 동작의 의미는 단계 힌트에서 설명한다.
- 학습자 단서: 맨 앞을 맨 뒤로 딱 한 번, 나머지 상대 순서 그대로, 빈 배열도 새 배열, 원본 불변.
- 새 A: 앞에서 꺼낸 값을 뒤에 넣어 순서를 한 칸 회전한다.
- 재사용 A: 입력 순서대로 값 읽기, 배열 생성·반환, 빈 상태 확인.
- 새 E: 입력 순서 저장 → 비어 있지 않으면 한 번 이동 → 현재 순서로 새 배열 만들기.
- C: 길이0이면 꺼낼 값 없음; 길이1이면 값은 그대로지만 새 참조; 중복값을 합치거나 버리지 않음; 최대길이100000에서 선형 순회.
- T: 없음. 원본 L1 및 가까운 빈 상태·원본 보존 조건이며 독립 전이로 세지 않는다.
- 사다리·지원: 먼저 꺼내기/다시 넣기 동작, 길이1 변화, 원본과 결과 구분을 생각한다. concept는 FIFO 의미, observation은 작은 큐와 빈 큐 흐름, implementation은 offer/poll와 결과 배열 단계를 순서대로 안내한다.
- 자기 설명: “맨 앞 값 하나만 꺼내 뒤에 다시 넣었고, 다른 값의 순서와 원본 배열을 지켰다.”
- 독립성: Deque 교안은 String 요청 둘의 삽입·한 개 제거, 객관식 `...deque-fifo-lifo`/`...deque-empty-read`는 호출 선택이다. 본 문제는 int[]를 입력 받아 큐 전체 회전 결과를 직접 int[]로 만들며 0/1/큰 배열에서도 불변/새 참조를 검증한다. ARR01과 달리 특정 값 수정이 아니라 모든 값의 순서 이동을 다룬다. 책 요세푸스는 K−1 이동·제거를 반복해 한 항목을 남기지만 본 문제는 제거 없이 1회 회전한 전체 배열이 결과다. 원문·정답을 복제하지 않는다.
- 대표 오답: 반대 방향 회전; 앞 값을 버림; 모든 값을 회전해 원래 순서 반환; 원본을 직접 회전; 길이≤1에서 원본 참조 반환.
- 공개 범위: 원본 5개 그대로 — 4원소, 빈 배열, 길이1의 940, 값범위 하한/0/940/상한, 길이100000의 `[0..99999] → [1..99999,0]`. 추가 여섯째는 `[7,7,2,7] → [7,2,7,7]`로 중복 유지 관찰 가능. 모든 공개 사례에서 값+원본불변+새참조.
- 독립 후보: `[3,9] → [9,3]`; `[-4,2,0,2,6] → [2,0,2,6,-4]`; `[0] → [0]`과 새 참조.
- 출처·일자: 아래 출처 대응표의 QUE01 Problem/Solution/Test·QueueGuide, 2026-09-15.
- 사람 판단: Queue 사용은 비채점 자기점검임을 명확히 분리했는지. 최대길이 공개 데이터를 축소하지 않고 learner가 전체 데이터·기대 순서를 확인할 수 있는지. Java 실제 실행은 차단 상태.


## 검사와 인계 기록

### 콘텐츠 검토·등록

`[현재 사실]` content_validator(Astra high)는 원본 17개 공개 사례와 QUE 중복 사례 1개, 최대 길이100000, 공개 값/원본 불변/새 참조, 교육 목표·지원·독립성을 읽기 전용으로 검토해 PASS했다. 최초 반환은 각 신규 문제 끝의 임시 “현재 Java 실행 준비 중” 문단이었다. 작성자는 세 문단만 삭제했고 검토자는 해당 수정과 교육 명세·공개 사례의 보존을 재확인했다. 실행 상태 안내는 UI의 동적 capability 표시가 담당한다. 작성자가 최종 승인하지 않았으며 총괄이 독립 PASS를 인수한 뒤 등록을 위임했다.

등록 담당의 `bridge-quest-author-receipt.md`와 `bridge-quest-registration-proof.json`을 인수했다. 승인된 신규 원고·fixture와 실제 등록 데이터의 deep equality, 기존 pilot 객체/fixture·텍스트 prefix·컬렉션 metadata·revision/order 보존, 원본 11파일 hash 불변이 PASS다. 새 큰 배열만 한 줄로 저장해 값은 그대로 보존했다.

| 등록 파일 | 등록 후 SHA-256 | 범위 |
| --- | --- | --- |
| `content/quests/java.json` | `f2236ffa379b332d5e3af0dec093e9eec4e99be304c9b9310f28d53bc4542e37` | pilot 뒤 신규 3개, 1,219,619 bytes/874줄 |
| `tests/fixtures/java-code-quest-solutions.js` | `9026eb804aaf8748f0b9aeeb0acd8ec3ea03dfcbf0e3a9531c1460e7dca75c98` | 기존 pilot 보존·신규 기준답안 3/대표오답 13/독립 후보 9 |

등록 담당이 실제 `npm run validate:content`를 실행해 exit 0을 확인했다. 등록 Code Quest 32개와 ID·schema·교안/개념 연결을 검사했으며 Java 실행/정답·대표오답의 지정 실패 PASS가 아니다. 전체 빌드·전체 check·새 JDK/Java·Electron 실행은 하지 않았다. 현재 제품 수량과 실행 가능 구분은 [README](../../README.md)에 반영한다.

### 제품·UI 구현의 자체 증거

데이터/평가 구현자의 `bam-algorithm-bridge-contract-implementation-receipt.md`를 인수했다. Java schema·core·validator·adapter·감독/Java runner의 비활성 후보를 구현했고 정확한 세 서명·int32/배열 범위·필수 관찰·기존 long 문자열·pilot4KiB/배열2MiB를 검사한다. Node 문법/codec 부정·경계/adapter 통계·관찰 누락 거부, 네 Quest의 고정 false fail-closed는 자체 PASS다. Java source 읽기 검사는 컴파일·reflection·stdin/fd3 실제 전송 증거가 아니다.

UI 구현자는 capability=false여도 Java 목록·상세·힌트·편집·초안을 제공하고 실행 handler/버튼은 차단했다. 큰 배열을 요약하고 전체 공개 데이터 접근을 제공하는 초기 구현을 인수했다. 후속 실제 데스크톱 확인에서 발견한 대형 DOM 결함은 아래 반환 기록으로 구분한다. 구현자의 자체 Node 5개 검사와 최대 사례 초기 HTML 24,946 bytes 측정은 인수했으며 독립 데스크톱 실행 PASS를 뜻하지 않는다. 관련 파일의 최종 hash와 독립 실행 조건은 아래 검증 receipt가 담당한다.

### 대표 데스크톱의 큰 공개 데이터 반환

실제 데스크톱 검증에서 QUE 최대 길이100000의 전체 공개 데이터를 readonly textarea에 약 237만 문자로 넣는 경로가 접근성 트리(AX) 읽기 10초 timeout을 일으켰다. 작은 초기 HTML과 Node 자체/독립 PASS는 이 사용자 동작 후의 대형 DOM 응답성을 입증하지 못했다.

반환 계약은 앞20개·전체 개수 요약과 사용자 클릭의 전체 공개 원본 JSON 다운로드다. Blob/objectURL을 다운로드/화면 이탈 수명주기에 맞춰 해제하고 큰 원문을 DOM에 삽입하지 않는다. 공개 값·기대값·관찰은 축소하지 않는다.

수정본은 버튼 클릭 때 `application/json` Blob에 전체 `{args, expected, observations}`를 담아 내려받는다. 임시 링크를 제거하고 `setTimeout(..., 0)`에서 objectURL을 해제한다. 영향 명령 `node --test tests/code-quest-view.test.js tests/app-code-quest-draft.test.js`는 **24/24 PASS**이며 실제 길이100000 데이터의 deep equality를 포함한다. 앞선 69개 focused 중 변경되지 않은 범위는 기존 독립 증거를 재사용했다.

| 수정 제품 파일 | SHA-256 |
| --- | --- |
| `src/app.js` | `413b0caa368ccbbd13a655e7df4f133dad4ce155da5a1892ab4f1eac40acdc08` |
| `src/ui/code-quest-view.js` | `a165402ba55f68c9972321ffd7ca5d2f64aee53aa77b8b3b93dae69a90528fa2` |

독립 데스크톱 재검은 **PASS**다. 최대 공개 사례 카드의 details/textarea는 0개, 다운로드 버튼은 1개이고 body HTML은 29,489자였다. 다운로드 후 AX 읽기는 0.26초로 끝났고 초점 유지·live 상태 안내·실행 버튼 비활성을 확인했다. 실제 다운로드 JSON은 2,377,918 bytes이며 등록된 QUE `publicTests[4]`와 deep equality: 입력 `[0..99999]`, 기대 `[1..99999,0]`, 두 observations가 모두 일치했다. 기존 편집·힌트·초안 저장·새로고침 복원 PASS는 변경 영향에 맞춰 재사용했다. 이 결과는 총괄이 인수한 독립 검증 메시지/최종 receipt에 근거하며 문서 담당이 같은 UI·테스트를 반복 실행하지 않았다. 실제 Java 실행 BLOCKED와 로컬 미게시 상태는 그대로다.

### 독립 실행·문서·통합 인수 경계

- content_validator: 반환 수정 후 PASS. 승인 원고에서 실제 등록 데이터로의 deep equality 증거를 재사용하며 같은 원본/교육 내용을 반복 검토하지 않는다.
- test_engineer: 콘텐츠 PASS와 실제 등록 파일에 대해 아래 Node focused 명령 **69/69 PASS, 실패 0, 1.04초**를 총괄의 독립 테스트 인계 메시지로 인수했다. Java 없는 대표 데스크톱 작성/저장/실행 차단 검증과 대형 JSON 다운로드 반환 재검은 위 범위에서 PASS했다. 통합은 이 인계와 독립 검증 receipt를 재사용하며 문서 기록 때문에 테스트를 반복하지 않는다.

  ```sh
  node --test tests/java-code-quest-contract.test.js tests/java-code-quest-runner-adapter.test.js tests/code-quest-view.test.js tests/app-code-quest-draft.test.js tests/app-language-routing.test.js tests/learning-catalog-view.test.js tests/code-quest-navigation-view.test.js tests/web-code-quest-router.test.js
  ```

- 문서 검토자 / project_integrator: 이 문서의 현재 상태 diff·상대 링크·과거 차단 경계·등록/실행 구분과 앞 단계 receipt를 각각 독립 인수한다. 마지막 검토/통합 판정은 동일 상태의 별도 receipt로 남기며 판정 문구를 이 카드에 다시 쓰기 위한 동일 검사 반복을 요구하지 않는다.
- 실제 Java 컴파일·정답/대표오답 실행·stdin/fd3 전송·격리·종료·앱에서 Java 완료: **BLOCKED**. 기존 고정 false gate와 새 Java/JDK 실행 금지를 유지하며 정적 codec·schema 검사로 대체하지 않는다.
- 게시: 이번 변경은 로컬 미게시다. commit·PR·merge·배포를 실행하거나 완료했다고 기록하지 않는다.
