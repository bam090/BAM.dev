# Algorithm Bridge 코딩테스트 전환

## 범위와 상태

`[확정 결정]` bam은 원본72를 코딩테스트로 정리하고 검증 후 커밋·푸시하도록 승인했다. 학습 콘텐츠 포함 기능 경로이며 [제품 설계](../designs/coding-test.md#algorithm-bridge-코딩테스트-전환)·[데이터 계약](../content-schema.md#algorithm-bridge-java-코딩테스트-draft-계약)을 구현 전에 기록했다. 기존32 Quest·JS CT6·원본·사용자 상태를 보존하고 신규69 Quest만 이동한다. 원본3은 별도 CT로 추가하며 준비Quest 링크를 유지한다.

`[현재 사실]` Java72 등록·별도 schema·목록/상세·원문/typed 예시/힌트·작성저장·legacy69 URL/명시 초안 가져오기·related3·3중 실행 차단을 구현했다. 독립 콘텐츠·관련 자동 검사·대표 데스크톱·문서·통합 PASS와 PR #22 Draft·원격 CI PASS를 인수했다. 정확한 대상·실패 이력·미병합 경계는 [최종 결과](#최종-독립-검증과-git-게시-결과)에 기록한다. Java/JDK/desktop 실행·채점·정식 설치 지원은 이번 웹 게시 범위 밖이며 Java 실행 BLOCKED를 유지한다.

## 출처와 학습 경험

원본은 읽기 전용 `/Users/goonbam/study/grepp/algorithm-bridge`, revision `dadc227da923f339bbc92ca02109fefdbd1da4a7`이다. 원본 인벤토리는 `/tmp/bridge-all-inventory.json`, 기존69 내용은 `/tmp/bridge-all-author/quests.json`, 독립 내용 검토는 `/tmp/bridge-all-content-review.md`와 [전체Quest 카드](2026-09-15-algorithm-bridge-all-quests.md)의 경험/출처 대응표를 재사용한다. 원본 파일은 수정하거나 실행하지 않는다.

이번 재분류 자체의 새 A/E/C/T는 없다. 기존69의 경험 카드·원본 L지원·대표오답·공개 사례는 [기존 전체Quest 카드의 학습 경험·출처 대응표](2026-09-15-algorithm-bridge-all-quests.md#학습-경험출처-대응표)를 재사용한다. 해당 카드의 `quest-java-bridge-<slot>`이 새 `coding-test-java-bridge-<slot>`의 선행 기록이다. 제품의 legacyQuestId는 이 관계를 명시하며 순서는 원본 전체 순서로 복구했다. 원본3도 준비Quest와 교육 목표가 중복인 **승인된 원본 재게재 유지보수**이며 새 경험·지원 축소·무힌트 전이로 계상하지 않는다. 독립 검토자가 이 분류와 원본 계약을 확인했다.

## 역할과 완료 기준

설계 담당은 본 카드와 CT/Quest/schema/roadmap/문서 지도만 소유한다. 콘텐츠 담당은 원본72·fixture·대응과 경험 증거, 제품 담당은 schema/domain/adapter·다중 컬렉션·UI/URL/저장 연결을 맡는다. 독립 콘텐츠 검토자는 원본72와 새 분류·연결을, 실행 검증자는 영향 검사와 1024/1440 데스크톱을 검증한다. 통합·Git은 별도 역할이다.

필수 검사는 원본순서1~72·ID/교안/개념·공개원문/typed 값·원본3 지원·0힌트·69 legacy/3 related 대응, Quest32/JS CT6/원본229파일 보존, CT 작성저장/재진입·옛URL·명시적 가져오기/기존CT초안 우선·상태 미합산, capability=true에서도 UI/handler/adapter 실행 및 완료 차단이다. 기존 동일 내용 PASS는 hash/조건이 일치할 때만 재사용한다. Java 실행·Java25 호환·다른 OS/모바일·공식 설치는 미검증으로 남긴다. 최종 검증 후 실제 커밋/원격 hash를 인계하며 게시하지 않은 것을 게시 완료로 기록하지 않는다.

## 인계 기록

- 설계: 승인 계약을 구현 전에 기록했고 실제 콘텐츠/제품 구현 상태를 반영했다.
- 제품: 구현 담당의 최종 receipt `1a6b3a55cb0243112843008561988244e25c714fc84197b4a869cbe31ec93814`는 IMPLEMENTATION_COMPLETE / FOCUSED_REGRESSION_PASS다. collection/schema/domain/adapter·다중 언어 UI·legacy69/related3·가져오기 덮어쓰기 금지·실행 차단을 확인했다. 등록 검사 Quest32/CT78, 기존 focused55/55·직접 영향49/49 PASS다.
- 반환/수정: 독립 테스트 최초130개 중129 PASS/1 FAIL은 화면을 연 뒤 생긴 최신 CT 초안을 가져오기 클릭 시 재확인하지 않은 문제였다. src/app.js에서 저장 직전 현재 CT 초안을 다시 읽고 존재/읽기 실패 시 가져오기를 막도록 수정했다. 수정 후 해당 회귀1/1·가져오기 양경로2/2·직접 app10/10·syntax/diff-check PASS. 당시 app SHA는 `fe73734eed9fa35864e6f8846784d6919a7cde43c54ef8b6730177e98f4cefba`다. 130개 전체를 재실행한 것으로 기록하지 않으며 독립 화면/최종 통합은 별도다.
- 콘텐츠: 2026-09-15 독립 content_validator PASS. 신규72 ID/순서/서명/지원·원본 전체 Test/Problem/Solution·출처 hash·명시 대응을 확인했다. 기존69는 ID/order·instructions→description·type/tags/legacy와 fixture 대응키/상대경로 이외 deep equal하여 이전 내용 PASS를 재사용했다. Java 기존4 deep equal, 신규3 원본과 선수 교안을 독립 검토했다.
- 콘텐츠 PASS 대상 SHA-256: Java CT `092c36e1e571d7fd1f72f9ca0527dccad56e2b39845df6b894080e5c9f21b51a`, Java Quest `f2236ffa379b332d5e3af0dec093e9eec4e99be304c9b9310f28d53bc4542e37`, [개발 fixture](../../tests/fixtures/algorithm-bridge-coding-test-solutions.json) `74563080bdc70117acd1454d5ae9b047f60bf414e225f6efb18378cfc3c9d168`.
- 검토 원장 해시: 작성자 경험 카드 `935ae5e98357e43866e45c78efa28cb22bb1e404abe2ae8f177a8145276365de`, 출처 대응표 `57ac8a84df85128ead0c91489bb3be4a95b8d91a24942dcd52f577e02da32322`. 아래 지속 기록은 원본3의 판정과 전체72 대응을 담으며 기존69 경험 전문을 중복 저장하지 않는다.
- 실제 난이도는 원본 지원 L1 beginner16·L2 beginner15·L3 intermediate24·L4 intermediate17이다. 이전 독립 검토 대응을 유지하는 승인 예외이며 L과 난이도는 별개다. 원본 무힌트는23개이며 공개 메서드 수를 실제 실행 사례/통과 수로 세지 않는다.
- 남은 판정: test_engineer의 제품/상태 보존·1024/1440 UI, 독립 문서 검토, project_integrator, 최종 dev 기준 게시 snapshot·커밋/푸시. Java 컴파일·실제 채점·Java25 호환·설치/다른 OS는 BLOCKED/미검증.

## 브라우저 게시 경계

원격 dev 기준선은 `3d2f4b90f834d2fe400de69d048f3bf133015645`이며 PR #21 “개념별 Code Quest 10개 추가”가 병합된 상태를 게시 사전조사에서 확인했다. 원격 `.nojekyll`과 기존 게시/PASS 이력을 보존한다. 현재 로컬 전체를 덮어 복사하지 않고 최종 허용 파일만 dev 기반 별도 작업본에 반입한다. 이번 범위는 웹 콘텐츠·제품·테스트·관련 문서이며 desktop/**·desktop 스크립트·package의 desktop 추가·실행 바이너리는 제외한다. 로컬 후보와 실패 이력은 원본 작업본에 보존한다. 이 기록은 새 커밋·푸시·merge 완료가 아니며 사용자가 승인한 이번 Git 행동은 검증 후 커밋·푸시다.

## 원본3 유지보수 검토

세 문제 모두 원본 L1의 세 단계 힌트와 Problem의 질문·stub를 유지하고 Solution 본문은 개발 fixture에만 둔다. 준비Quest와 동일 소재·반환·입력·제약·오답이며 별도 CT 작성 위치와 원본 전체 공개 Test를 제공한다. 독립성 차이를 새 학습 경험으로 만들지 않는다. 실제 실행 없이 원본 assertion과 손계산으로 다음 계약을 확인했다.

| 대상 | 선수 개념·설명할 문장 | 원본 공개 계약·독립 손계산 | 대표 오개념 |
| --- | --- | --- | --- |
| ARR-01 | java-concept-arrays / java.arrays. 위치에서1을 빼는 이유와 다른 배열이 필요한 이유 | 지정 칸만 고친 새 배열·입력 보존·첫/끝·최대 길이. [5,8,5],2,-4 → [5,-4,5], 원본 불변 | 참조만 대입해 원본을 변경; slotNumber를 그대로 인덱스로 사용 |
| ARR-02 | java-concept-control-flow / java.control-flow. 양끝과 중복을 각각 세는 이유 | 양끝 포함·빈 입력0·같은 경계·길이 상한. [-2,0,0,3,4],[0,3] →3; 엄격 비교 변이는0 | 양끝을 제외하거나 같은 값을 한 번만 셈 |
| QUE-01 | java-concept-deque / java.deque. 앞의 한 원소를 뒤에 다시 넣는 이유 | 빈/한 원소·새 배열/입력 불변·최대 길이. [4,4,-2] → [4,-2,4]; offer(first) 누락은 [4,-2] | 꺼낸 첫 원소를 다시 넣지 않음 |

원본 QUE-01 starter의 import 없는 상태도 보존한다. 작성·저장 제공과 컴파일 성공은 별개다. 독립 검토는 ArrayGuide·QueueGuide 및 위 선수 교안의 내용도 확인했으며, 선수 교안만으로 문제의 모든 풀이를 제공한다고 판정하지 않는다.


### 원본3 출처 파일과 hash

아래 경로는 위 원본 revision의 저장소 상대 경로이며 런타임 의존 경로가 아니다. 기존69의 동일 정보는 선행 전체Quest 카드의 대응표에 보존한다.

| slot | 구분 | 원본 상대 경로 | SHA-256 |
| --- | --- | --- | --- |
| ARR-01 | problem | `src/main/java/bridge/array/onedimensional/problem/ArrayProblem01.java` | `b54a4a6119509a8ee76b21bba28555ff7979460e2598f4b6805152d4531b34ef` |
| ARR-01 | solution | `src/main/java/bridge/array/onedimensional/solution/ArraySolution01.java` | `f3921750e1b4af32db5c2fd70a9782794006e7f81132a1fa11c4d2d8640c73fa` |
| ARR-01 | test | `src/test/java/bridge/array/onedimensional/test/ArraySolution01Test.java` | `56ff3512838f017d6ee4ac172dc6e82d88035d520932316f0a5793103b30d97b` |
| ARR-01 | guide | `src/main/java/bridge/array/ArrayGuide.java` | `a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968` |
| ARR-02 | problem | `src/main/java/bridge/array/onedimensional/problem/ArrayProblem02.java` | `5b9cbc7b6708c11ecffaca4e5a5cbfa05cc46a6416ae3c5146ba79fb5e2638af` |
| ARR-02 | solution | `src/main/java/bridge/array/onedimensional/solution/ArraySolution02.java` | `f0b329dad1174dcca25367fde05055c5e05259a134a8dd73e89d17f45270c817` |
| ARR-02 | test | `src/test/java/bridge/array/onedimensional/test/ArraySolution02Test.java` | `9c8394392c6234c87f3ed44719e0013e4984f2a746224d5e5ed80573907d3309` |
| ARR-02 | guide | `src/main/java/bridge/array/ArrayGuide.java` | `a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968` |
| QUE-01 | problem | `src/main/java/bridge/queue/problem/QueueProblem01.java` | `e1f7be176d12677bc702374acd7f0c1cc28fee1242e16f0f7f411302d68e7fed` |
| QUE-01 | solution | `src/main/java/bridge/queue/solution/QueueSolution01.java` | `6ecfad8db7a26b4bac861f6e82bd38d6a2212d937a010c736ad5bafab246c5ba` |
| QUE-01 | test | `src/test/java/bridge/queue/test/QueueSolution01Test.java` | `4899d6a30751d7430c3946e319dd197d3d540d0c82d5b3d89f579c1951af0b2e` |
| QUE-01 | guide | `src/main/java/bridge/queue/QueueGuide.java` | `dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329` |

### 전체72 ID·순서·출처 대응

CT ID는 아래 slot 소문자에 `coding-test-java-bridge-`를 붙인다. 준비3의 related 및 옮긴69의 legacy ID는 `quest-java-bridge-`와 같은 slot이다. 전체 원본 Problem/Solution/Test/Guide 경로·hash는 준비3은 바로 위 표, 나머지는 선행 전체Quest 카드의 동일 slot 항목으로 확인한다. [등록 컬렉션](../../content/coding-tests/java.json)과 [개발 fixture](../../tests/fixtures/algorithm-bridge-coding-test-solutions.json)에 실제 새 ID·출처 상대 경로가 연결되어 있어 임시 파일 없이 대조할 수 있다.

| 원본 순서 | slot | 연결 | 원본 지원 | 주제 / CT 유형 |
| ---: | --- | --- | --- | --- |
| 1 | ARR-01 | related | L1 | array / array |
| 2 | ARR-02 | related | L1 | array / array |
| 3 | ARR-03 | legacy | L2 | array / array |
| 4 | ARR-04 | legacy | L2 | array / array |
| 5 | ARR-05 | legacy | L3 | array / array |
| 6 | ARR-06 | legacy | L4 | array / array |
| 7 | ARR-07 | legacy | L1 | array / array |
| 8 | ARR-08 | legacy | L2 | array / array |
| 9 | ARR-09 | legacy | L2 | array / array |
| 10 | ARR-10 | legacy | L3 | array / array |
| 11 | ARR-11 | legacy | L3 | array / array |
| 12 | ARR-12 | legacy | L3 | array / array |
| 13 | STK-01 | legacy | L1 | stack / simulation |
| 14 | STK-02 | legacy | L2 | stack / simulation |
| 15 | STK-03 | legacy | L3 | stack / simulation |
| 16 | STK-04 | legacy | L4 | stack / simulation |
| 17 | STK-05 | legacy | L3 | stack / simulation |
| 18 | QUE-01 | related | L1 | queue / simulation |
| 19 | QUE-02 | legacy | L2 | queue / simulation |
| 20 | QUE-03 | legacy | L3 | queue / simulation |
| 21 | QUE-04 | legacy | L4 | queue / simulation |
| 22 | HSH-01 | legacy | L1 | hash / object |
| 23 | HSH-02 | legacy | L2 | hash / object |
| 24 | HSH-03 | legacy | L3 | hash / object |
| 25 | HSH-04 | legacy | L3 | hash / object |
| 26 | HSH-05 | legacy | L4 | hash / object |
| 27 | HSH-06 | legacy | L3 | hash / object |
| 28 | TRE-01 | legacy | L1 | tree / search |
| 29 | TRE-02 | legacy | L2 | tree / search |
| 30 | TRE-03 | legacy | L3 | tree / search |
| 31 | TRE-04 | legacy | L4 | tree / search |
| 32 | SET-01 | legacy | L1 | set / object |
| 33 | SET-02 | legacy | L3 | set / object |
| 34 | SET-03 | legacy | L1 | set / object |
| 35 | SET-04 | legacy | L4 | set / object |
| 36 | GRA-01 | legacy | L1 | graph / search |
| 37 | GRA-02 | legacy | L2 | graph / search |
| 38 | GRA-03 | legacy | L3 | graph / search |
| 39 | GRA-04 | legacy | L3 | graph / search |
| 40 | GRA-05 | legacy | L4 | graph / search |
| 41 | GRA-06 | legacy | L4 | graph / search |
| 42 | BKT-01 | legacy | L1 | backtracking / search |
| 43 | BKT-02 | legacy | L2 | backtracking / search |
| 44 | BKT-03 | legacy | L3 | backtracking / search |
| 45 | BKT-04 | legacy | L3 | backtracking / search |
| 46 | BKT-05 | legacy | L4 | backtracking / search |
| 47 | SRT-01 | legacy | L1 | sorting / sorting |
| 48 | SRT-02 | legacy | L3 | sorting / sorting |
| 49 | SRT-03 | legacy | L2 | sorting / sorting |
| 50 | SRT-04 | legacy | L3 | sorting / sorting |
| 51 | SRT-05 | legacy | L4 | sorting / sorting |
| 52 | SRT-06 | legacy | L4 | sorting / sorting |
| 53 | TWP-01 | legacy | L1 | twopointer / array |
| 54 | TWP-02 | legacy | L2 | twopointer / array |
| 55 | TWP-03 | legacy | L3 | twopointer / array |
| 56 | TWP-04 | legacy | L4 | twopointer / array |
| 57 | SIM-01 | legacy | L1 | simulation / simulation |
| 58 | SIM-02 | legacy | L2 | simulation / simulation |
| 59 | SIM-03 | legacy | L3 | simulation / simulation |
| 60 | SIM-04 | legacy | L3 | simulation / simulation |
| 61 | SIM-05 | legacy | L4 | simulation / simulation |
| 62 | SIM-06 | legacy | L4 | simulation / simulation |
| 63 | DYN-01 | legacy | L1 | dynamicprogramming / simulation |
| 64 | DYN-02 | legacy | L2 | dynamicprogramming / simulation |
| 65 | DYN-03 | legacy | L3 | dynamicprogramming / simulation |
| 66 | DYN-04 | legacy | L4 | dynamicprogramming / simulation |
| 67 | GRE-01 | legacy | L1 | greedy / simulation |
| 68 | GRE-02 | legacy | L2 | greedy / simulation |
| 69 | GRE-03 | legacy | L3 | greedy / simulation |
| 70 | GRE-04 | legacy | L3 | greedy / simulation |
| 71 | GRE-05 | legacy | L4 | greedy / simulation |
| 72 | GRE-06 | legacy | L4 | greedy / simulation |

## 최종 독립 검증과 Git 게시 결과

`[현재 사실]` 2026-09-15 후속 receipt를 인수했다. 아래 결과는 해당 snapshot의 검증·원격 조회 기록이며 이후 PR 상태를 실시간 확인한 결과가 아니다. 위 단계별 대기·최초 실패 기록을 보존하고 이 절에서 완료한 범위를 구분한다.

- 독립 test_engineer: 수정 후 관련 자동 검사 **130/130 PASS**. Chrome 1024/1440 light/dark 목록·상세·원문 다운로드·Java 작성/저장·키보드, JavaScript Worker 실행/제출·재진입, legacy URL과 두 탭의 최신 CT 초안 우선 보존 PASS. 기존 Quest 초안·시도·완료 불변과 Java 제출/완료 미생성을 확인했다. app SHA-256 `fe73734eed9fa35864e6f8846784d6919a7cde43c54ef8b6730177e98f4cefba`, UI receipt SHA-256 `8ec5ba4b104bd2050e42f221937b49c7695d66ef1f61696f037539bcc9431274`.
- 독립 문서: 전체 Quest 카드 대체 표시·표 연결 반환 2건 수정 후 **PASS**. 당시 변경 문서의 링크 323개·등록/실행 구분·출처와 과거 증거 보존을 확인했다. receipt SHA-256 `ea47d8097f9b3e0f680401ceac729bed3128993ec6269dadd506f699503ebbc1`.
- 독립 통합: 승인 브라우저 snapshot 42경로와 후속 테스트 2경로를 인수해 **PASS**. 원본과 게시본의 제품 hash 일치에 근거해 독립 증거를 재사용했다. 별도 미게시 desktop 후보·운영 변경 전체의 통합 PASS가 아니다.
- 최초 게시 commit `ac2158958d5fb87923e01bd07ee6d69be0c4770b`의 원격 CI는 734/737 PASS·3FAIL이었다. 접근성·공통 셸 테스트의 낡은 정적 기대값/fixture를 실제 CT 분리 계약에 맞춰 정정했고 독립 기대값 감사·focused 20/20 PASS를 인수했다. 테스트 삭제·skip이나 제품 요구 완화는 없었다.
- 후속 commit `90fae824f2129fcfe36686b4a2fcef9029a60c17`의 [push CI](https://github.com/bam090/BAM.dev/actions/runs/34926736557)와 [PR CI](https://github.com/bam090/BAM.dev/actions/runs/34926739883)는 모두 success. Node 22·Ubuntu의 `npm run check`에서 콘텐츠 검증·**737/737 PASS**·정적 빌드 완료를 확인했다.
- [PR #22](https://github.com/bam090/BAM.dev/pull/22)는 최종 게시 receipt에서 OPEN·Draft, base `dev`, head 위 후속 commit이다. `dev`는 `3d2f4b90f834d2fe400de69d048f3bf133015645`를 유지했다. **병합·Pages 배포는 수행하지 않았다.**

근거는 `/tmp/bridge-ct-desktop-receipt.md`, `/tmp/bridge-ct-publication-integration.md`, `/tmp/bridge-ct-ci-integration.md`, `/tmp/bridge-ct-publish-receipt.md`의 최종 인수 기록이다. 원본 작업 폴더의 `src`·`content`·`styles`가 게시 head와 같다는 후속 자료 조사에 따라 동일 제품 증거를 재사용했다. Java/JDK·실제 Java 컴파일/채점·desktop/설치·모바일·다른 OS는 이번 검증 PASS에 포함하지 않으며 Java 실행은 **BLOCKED**다.

## 브라우저 게시 작업본 준비

`[현재 사실]` 게시 담당이 원격 dev `3d2f4b90f834d2fe400de69d048f3bf133015645`에서 `codex/bridge-coding-tests` 브랜치와 `/private/tmp/bam-bridge-ct-publication` 작업본을 준비했다. 명시 허용 파일만 반입했으며 원격 기존 게시/PASS 이력과 `.nojekyll`을 보존한다. 후속 독립 자동 검사130/130·콘텐츠검사 Quest32/CT78 PASS를 총괄이 인수했다. 독립 UI·문서·최종 통합과 커밋·푸시는 아직 대기다. 이 절은 준비 사실이며 Git 게시 완료 기록이 아니다.

## 최종 독립 검증 결과

`[현재 사실]` 2026-09-15 독립 test_engineer **PASS**. 수정 후 관련 자동 검사130/130, 콘텐츠 검사 Quest32·CT78을 통과했다. Chrome 1024/1440의 light/dark 목록·상세·원본 소스/다운로드·Java 초안 저장/재진입·키보드, 기존 JavaScript Worker 실행·제출을 확인했다. legacy URL의 canonical 전환, 두 탭에서 클릭 시점의 최신 CT 초안을 보존하는 가져오기와 기존 Quest 초안/시도/완료 불변도 통과했다. 검증 대상 app SHA는 `fe73734eed9fa35864e6f8846784d6919a7cde43c54ef8b6730177e98f4cefba`이며 콘텐츠/제품 대상은 위 구현·콘텐츠 인계 해시와 일치한다. 독립 UI receipt SHA-256은 `8ec5ba4b104bd2050e42f221937b49c7695d66ef1f61696f037539bcc9431274`다.

게시 문서 독립 검토도 반환2건 수정 후 **PASS**다. 전체Quest 카드의 대체/과거 검증 표시와 경험 표 연결을 재검했고 나머지12문서·기존323링크 PASS를 재사용했다. 문서 검토 receipt SHA-256은 `ea47d8097f9b3e0f680401ceac729bed3128993ec6269dadd506f699503ebbc1`다. 이 최종 결과는 위 단계별 대기 기록을 해당 검증 범위에서 갱신하며 최초 실패 이력을 삭제하지 않는다.

Java/JDK·실제 Java 컴파일/채점·desktop/설치·모바일·다른 OS는 미실행이며 Java 실행은 계속 **BLOCKED**다. 최종 통합은 마감 중이고 커밋·푸시는 아직 완료하지 않았다. 이 절은 검증 기록만 추가하며 제품·출처·사용자 상태를 바꾸지 않는다.
