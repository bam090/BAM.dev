# Algorithm Bridge 전체 Code Quest 편입

## 범위와 상태

`[대체됨]` 이 카드의 전체69 Quest 등록 계약은 [Algorithm Bridge 코딩테스트 전환](2026-09-15-algorithm-bridge-coding-tests.md)으로 대체했다. 아래 Java73·전체101 수량과 등록/검증 PASS는 전환 전 당시 작업본의 이력이며 현재 수량이 아니다. 현재는 기존32 Quest를 보존하고 원본72를 별도 Java 코딩테스트로 제공한다. 아래 경험 카드·출처·검증 근거는 당시 대상에 대한 기록으로 보존하고 동일 내용 범위에서만 재사용한다. 신규 69개 경험 카드와 원본 229개 SHA-256은 영구 보존하며 현재 수량은 [README](../../README.md)에만 요약한다.

`[대체됨]` 당시 2026-09-15 bam의 전체 적용 요청은 [대표 세 문제 편입](2026-09-15-algorithm-bridge-quests.md)의 수량 제한을 대체한다. 작업 유형은 학습 콘텐츠 포함 기능이다. 원본 72개 중 기존 3개와 Java pilot을 보존하고 신규 69개를 같은 Java 컬렉션에 draft-only로 추가한다. 교안·객관식·코딩테스트·curriculum·저장소·supervisor·Java 프로세스를 변경하지 않는다. 실행 재개·Git 게시·Electron·빌드·설치·지원 OS 확대는 범위 밖이다.

`[현재 사실]` 당시 신규 69개의 독립 콘텐츠 검토 PASS 뒤 실제 등록을 완료했다. 제품 계약·읽기/작성 UI를 반영했고 선정한 정적 검사와 등록 연결 검사는 PASS다. 독립 데스크톱 검증도 PASS이며 독립 문서 검토·최종 통합은 아직 판정하지 않았다. Java 실행은 기존 격리 실패로 BLOCKED이며 신규 draft 타입의 실행 계약도 승인하지 않았다. 정본은 [제품 흐름](../designs/code-quest.md#algorithm-bridge-전체-문제-편입)과 [draft 데이터 계약](../content-schema.md#algorithm-bridge-전체-편입의-draft-계약)이다.

## 출처와 보존 기준

선행 인벤토리 `/tmp/bridge-all-inventory.json`의 상태는 `INVENTORY_COMPLETE_NOT_CONTENT_APPROVAL`이다. 원본은 읽기 전용 `/Users/goonbam/study/grepp/algorithm-bridge`, revision `dadc227da923f339bbc92ca02109fefdbd1da4a7`; BAM.dev 기준 revision은 `b97260eb866a15a02a80531107eca4b2144d436b`이다. 원본 229개 파일의 manifest는 `/tmp/bridge-all-source-sha256.txt`, SHA-256은 `34f7f5f3a950716ad3f91a4e953dfb98b9d874505d531807bd5267debafa79ce`다. 실제 hash 보존 재검은 독립 검증에 인계한다.

원본은 13주제 72문제이며 L1 16·L2 15·L3 24·L4 17이다. 주제별 수는 array 12, stack 5, queue 4, hash 6, tree 4, set 4, graph 6, backtracking 5, sorting 6, twopointer 4, simulation 6, dynamicprogramming 4, greedy 6이다. 기존 ARR-01·ARR-02·QUE-01의 ID·order·교안 연결은 유지한다. 신규 order 5~73은 원본 전체 순서와 같지 않으므로 대응표에 원본 slot을 명시한다.

당시 등록 검사에서 확인한 수량은 Java 73·전체 101·실행 가능 28이다. Java는 기존 런타임 차단 4개와 실행 미지원 draft 69개로 구분한다. 기존 32개 객체와 원본 229개 파일은 등록 담당의 보존 증거로 확인했다.

## 역할과 완료 조건

제품·설계 문서 담당은 Code Quest/content-schema 정본과 이 카드·문서 지도/로드맵 연결을 소유한다. 콘텐츠 작성자는 신규 69개·개발 fixture·경험/출처를 작성한다. 제품 계약 구현자는 schema·validator·domain/request builder·adapter, UI 구현자는 catalog·상세·submit을 담당한다. 겹치는 파일은 선행 인계 뒤 순차 수정한다. content_validator는 콘텐츠·원본·카드를, test_engineer는 변경 영향 검사·대표 데스크톱을 각각 독립 검토한다. 독립 문서 검토자와 project_integrator의 읽기 전용 판정을 끝으로 완료를 판단한다.

필수 검증은 신규 69개 schema·typed args/expected·0~5힌트·공개 소스 포함/escape/최대 입력 보존·전체 수량·ID/교안/개념 연결, 기존 32개 객체 및 원본 229개 hash 보존, 대표 데스크톱의 목록→상세→공개 원문→편집/저장→재진입·키보드와 draft guard다. capability=true를 주어도 UI/submit/request builder/adapter에서 draft 실행·완료가 생성되지 않아야 한다. 실제 Java 정답·대표오답·Java 25 호환·격리/프로세스 종료는 BLOCKED/미검증으로 남기며 정적 PASS로 대체하지 않는다.

## 학습 경험·출처 대응표

아래 부록은 독립 내용 PASS 대상인 작성자의 최종 경험 카드 원문이다. 원본 Problem/Solution/Test/guide와 실제 선수 교안의 한계, 새 A/E/C/T 기회·대표오답·손계산 사례를 담는다. 개발·검토 자료이며 앱의 힌트나 정답으로 배포하지 않는다. 카드의 작성 당시 초안·미검증 표기는 역할 경계 기록이며 최신 독립 판정은 다음 receipt를 따른다.

## 검사와 인계 기록

| 단계 | 실제 결과·재사용 범위 | 근거 |
| --- | --- | --- |
| 콘텐츠 독립 검토 | 신규 69개 원본·typed 예시·공개 Test·starter·카드·정적 반례 확인 후 PASS. 최초 REVISE의 설명 완전문장, ARR-03/GRE-01 카드, SET-02 반례를 수정하고 STK-02/GRA-01 인덱스 두 문구까지 재검 완료 | `/tmp/bridge-all-content-review.md`, SHA-256 `7d9948f4471bb5640903944ade8904de2df5a3ae048f77015852dc196219b6a6` |
| 승인 콘텐츠 등록 | 승인 원고와 신규 69개 deepEqual, 기존 Java 4개·metadata·기존 prefix 1,219,612바이트 보존. HTML 8·CSS 8·JS 12와 기존 fixture hash 불변. 원본 229개 manifest 일치 | `/tmp/bridge-all-author/registration-proof.json`, `/tmp/bridge-all-author/registration-receipt.md` |
| 등록 검사 | 등록 후 `npm run validate:content` 1회 PASS. 언어 4·교안 187·객관식 284·Quest 101·코딩테스트 6·WebProject 1 확인 | 위 등록 receipt; 같은 상태로 재실행하지 않음 |
| 계약 구현 자체 검사 | JS/MJS 문법·메모리 병합 schema/core·guard·UI 표시 확인, focused 56/56 PASS | `/tmp/bridge-all-contract-receipt.md`; 이후 테스트 담당이 제품/schema hash 동일함을 확인해 재사용 |
| 독립 테스트 작성 | 계약 18/18, 등록 연결 31/31 PASS. 최초 17/18에서 syntax span 때문에 연속 문자열을 기대한 테스트 1건을 수정하고 같은 명령 재실행 | `/tmp/bridge-all-tests-receipt.md`, SHA-256 `b6ea5441d2f346624ed8dc57fbca074ade1f2cb93a7917ddbcaeeb2db6e9ee04` |
| 독립 test_engineer | PASS. macOS Chrome 1024×900·1440×1000에서 목록 101개(알고리즘 69·Java 4·나머지 28), 실행 가능 28·알고리즘 0을 확인. 검색/주제 조합, L1/L3/L4 typed 예시·0힌트, 원본 소스 escape·키보드 열람/다운로드 상태, light/dark 확인. 새 초안 저장→새로고침→재진입과 기존 세 route/ARR-01 초안을 보존하며 완료 0·실행 비활성·console warning/error 0 확인. 같은 해시의 18+31·56 검사, 등록 검사와 원본 229개 보존 증거 재사용 | `/tmp/bridge-all-desktop-receipt.md`, SHA-256 `d492ea53c785aa82fdbfa903b6caf88f67465719028994e807e44e2750ca0854`. 별도 4317 origin 사용, 서버 종료 확인. Java/설치본/모바일 실행 PASS 아님 |
| 독립 문서·최종 통합 | 대기. 위 제품/콘텐츠 PASS로 대신하지 않음 | 해당 역할의 별도 receipt로 판정 |

계약 테스트 명령은 `node --test tests/algorithm-bridge-quests.test.js tests/java-code-quest-contract.test.js tests/java-code-quest-runner-adapter.test.js`, 등록 연결은 `node --test tests/app-code-quest-draft.test.js tests/code-quest-view.test.js tests/code-quest-navigation-view.test.js`다. 테스트 수정 전 최초 실패와 최종 PASS를 구분한다. 추가 전체 테스트·빌드·Git/CI는 실행하지 않았다. Java/JDK/javac·Electron·실제 기준답안/오답·Java 25 호환·격리/종료 검증은 BLOCKED/미실행이며 [기존 재개 조건](2026-09-15-java-code-quest-runtime.md#격리-실패와-재개-조건)을 유지한다. 로컬 미게시 상태다.

### 인수 대상 해시

| 대상 | SHA-256 |
| --- | --- |
| 승인 신규 원고 | `580e5049131196819f5d452bdaa105836eaf01bad224b7f6026f3480375833fa` |
| `content/quests/java.json` | `49a23ea76bc26d673b3e40573935b20165bd6e4fce3cefb46fc056d520e253ec` |
| 개발 fixture | `56742ce4b0368491ea02f05f5a3689d2a8996b8539f40aa8aed7293323a9ef1a` |
| 경험 카드 Markdown 원문 | `76e063bbc14621d7cf1a928a21fdde71e2eda5dc895d0cc649b4101de61e7e3f` |
| 경험 카드 JSON 원문 | `9a54d87dddce11afa9a31c1cfeee4847b192db77f05dcedaf5c0b38f1b4c296f` |

## 부록: 신규 69개 경험 카드

# Algorithm Bridge 신규 69개 경험 카드
작성자 초안. Java 실행 및 독립 교육 승인은 별도이며 이 문서는 PASS 판정이 아니다.
원본 72개 중 기존 ARR-01·ARR-02·QUE-01 보존, 신규 order 5..73.

## ARR-03 연속 기록의 변화량

ID: `quest-java-bridge-arr-03` / order 5 / L2

- MVP 이유: 원본 Algorithm Bridge의 연속 기록의 변화량 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 입력과 결과 인덱스가 다른 새 배열을 만든다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 원소가 n개면 이웃한 두 원소의 쌍은 몇 개인가? - 현재 값을 values[i]로 읽을 때 이전 값의 인덱스는 무엇인가? - 입력 인덱스 i에서 만든 변화량은 결과 배열의 어느 인덱스에 들어가는가? - 입력에 원소가 하나뿐이면 결과 길이는 얼마인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 이웃한 두 위치가 모두 필요하므로 인덱스를 쓰는 일반 for문이 알맞다. - 결과 길이를 미리 정확히 알 수 있어 바로 새 배열을 만들 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 입력과 결과 인덱스가 다른 새 배열을 만든다. 변화량에서 현재 값과 이전 값의 뺄셈 순서를 뒤집기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-02의 닫힌 구간에 속한 값의 개수 세기에서 이웃한 두 위치와 결과 위치 i-1의 대응으로 확장한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 변화량에서 현재 값과 이전 값의 뺄셈 순서를 뒤집기.
- 잡을 오답: 변화량에서 현재 값과 이전 값의 뺄셈 순서를 뒤집기
- 공개 검증: 이웃한 값의 변화량을 계산한다 / 길이 상한과 940을 포함한 연속 증가
- 독립 사례(손계산): `[[17, 11, 11, 26]]` → `[-6, 0, 15]`. 17→11은 -6, 같으면 0, 11→26은 15이며 결과는 세 칸이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 교안의 순서·반복·조건은 선수 기반이며 배열/행열/누적합 전문 개념 전체를 설명한다고 주장하지 않음. Java arrays 선수 링크와 원본 Guide의 문제 관련 설명 필요
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem03.java (SHA-256 88fe87fa16fd44fa4d322f5d60f0d1739e046b38bf65497ba8e2c178eefe4603); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution03.java (SHA-256 8a9041b458460ade95a359eadc2e03551879a27d39adb7eb2dcdb5779c7d8b26); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution03Test.java (SHA-256 e265d77b63775ef1ae04b43b33f34fe2d7d448f949053e191118a7a3b2de6f14); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-04 기준을 통과한 기록만 모으기

ID: `quest-java-bridge-arr-04` / order 6 / L2

- MVP 이유: 원본 Algorithm Bridge의 기준을 통과한 기록만 모으기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 고정 길이 배열에서 조건부 결과를 두 번 순회해 만든다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 새 배열을 만들기 전에 결과 길이를 어떻게 알 수 있는가? - 첫 번째 순회와 두 번째 순회에서는 각각 무엇을 해야 하는가? - 결과에 값을 넣을 위치는 입력 인덱스와 항상 같은가? - 조건을 만족하는 값이 하나도 없으면 어떤 배열을 반환해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 첫 번째 순회로 결과 길이를 알아낸 뒤 정확한 크기의 배열을 만들 수 있다. - 두 번째 순회에서 만난 순서대로 넣으면 별도의 정렬 없이 원래 순서가 유지된다.
- 새 E: 별도 새 E 주장 없음
- C: 고정 길이 배열에서 조건부 결과를 두 번 순회해 만든다. 기준과 같은 값은 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-03처럼 결과를 만들지만 길이를 먼저 모르므로 조건 통과 개수와 원래 순서를 연결한다.
- 지원: 원본 힌트 4개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 기준과 같은 값은 제외하기.
- 잡을 오답: 기준과 같은 값은 제외하기
- 공개 검증: 기준 이상인 값을 원래 순서로 고른다 / 최대 길이에서 값 범위의 하한·0·940·상한 확인
- 독립 사례(손계산): `[[17, 6, 17, 5, 21], 17]` → `[17, 17, 21]`. 17도 기준 이상이며 두 번 남고 6과 5는 제외한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem04.java (SHA-256 659aa00de58c73115ee716c9be3e56e0c037b521a46b9bb90df119b1133c220b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution04.java (SHA-256 d24388fc4e2b9ebb4ebc28f1f2a2ba5e176d2d271daf73f6590b20f4b120f88b); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution04Test.java (SHA-256 322eb90c94c7ef0a1251fa35f5b1ff2f373b240f0e8c3e2c42659c638b4f6adb); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-05 여러 구간의 기록 합

ID: `quest-java-bridge-arr-05` / order 7 / L3

- MVP 이유: 원본 Algorithm Bridge의 여러 구간의 기록 합 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 같은 구간 계산을 반복하지 않도록 전처리한다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 각 위치까지의 합을 미리 저장했다면, 구간 합은 어떤 두 값을 빼서 구할 수 있는가? - 첫 번째 값부터 시작하는 구간도 같은 식으로 처리하려면 누적 합 배열의 맨 앞에 어떤 값이 필요한가? - 1부터 세는 위치 번호와 Java 배열의 인덱스는 어떻게 연결되는가? - 왜 누적 합 배열과 결과 배열의 원소 타입이 long이어야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 누적 합은 첫 값부터 각 위치까지의 합을 한 번만 계산해 저장한다. - 구간 하나의 합을 두 누적 합의 차이로 바로 구할 수 있다.
- 새 E: 처음부터 각 위치까지의 합을 미리 저장한 뒤, 두 합의 차이로 각 구간의 합을 구해 반환한다.
- C: 같은 구간 계산을 반복하지 않도록 전처리한다. 구간 시작 값을 합에서 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-07의 서로 다른 행 합과 달리 같은 기록의 겹치는 구간을 여러 번 질문한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 구간 시작 값을 합에서 제외하기.
- 잡을 오답: 구간 시작 값을 합에서 제외하기
- 공개 검증: 각 질문의 구간 합을 계산한다 / 최대 길이의 값·질문과 int 범위를 넘는 구간 합
- 독립 사례(손계산): `[[17, -6, 11, 3], [[1, 4], [2, 2], [2, 4]]]` → `["25", "-6", "8"]`. 각 양끝 포함 합은 25,-6,8이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 교안의 순서·반복·조건은 선수 기반이며 배열/행열/누적합 전문 개념 전체를 설명한다고 주장하지 않음. Java arrays 선수 링크와 원본 Guide의 문제 관련 설명 필요
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem05.java (SHA-256 d41c0b0ec1137d2e4f85f4cc2860dc16b6e6ff4937d7960504427db100de0cc9); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution05.java (SHA-256 aa3a1ee491030c14fa43ead1b891007be30927e4c2d6924355088ffb6e74e746); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution05Test.java (SHA-256 4b46e7c7252b5cbc6201082e0189414a50e70ba33c66ab1060ba1b314e314270); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-06 가장 긴 연속 상승 기록

ID: `quest-java-bridge-arr-06` / order 8 / L4

- MVP 이유: 원본 Algorithm Bridge의 가장 긴 연속 상승 기록 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 힌트 없이 이웃 비교와 두 상태를 고른다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 상승이 이어지는지 확인하려면 현재 값과 어떤 값을 비교해야 하는가? - 상승이 이어질 때와 끊길 때 현재 구간 길이는 각각 어떻게 변하는가? - 현재 구간 길이와 별도로, 지금까지 가장 긴 길이를 계속 기억해야 하는 이유는 무엇인가? - 빈 배열과 원소 하나인 배열의 답은 각각 무엇인가? - 반복문을 쓰기 전에 예시를 따라가며 현재 길이와 가장 긴 길이가 어떻게 바뀌는지 표로 적어 보았는가?  이 문제에는 단계별 힌트가 없다. 앞 문제에서 연습한 인덱스 사용, 이웃한 값 비교, 값을 계속 기억하는 방법을 떠올려 의사 코드를 먼저 작성한 뒤 스스로 구현해 보자.
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 배열을 한 번 확인하면서 currentLength와 bestLength를 갱신하면 모든 상승 구간의 길이를 알 수 있다. - 실제 구간 원소를 따로 저장할 필요가 없으므로 추가 배열은 만들지 않는다.
- 새 E: 별도 새 E 주장 없음
- C: 힌트 없이 이웃 비교와 두 상태를 고른다. 같은 값도 상승 구간으로 세기를 허용하지 않는 계약이다.
- T: ARR-03의 이웃 변화량을 반환하는 지원 과제에서 엄격 상승의 현재 길이와 최고 길이를 스스로 선택한다.
- 기존 경험과 차이: ARR-03의 이웃 변화량을 반환하는 지원 과제에서 엄격 상승의 현재 길이와 최고 길이를 스스로 선택한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 같은 값도 상승 구간으로 세기.
- 잡을 오답: 같은 값도 상승 구간으로 세기
- 공개 검증: 가장 긴 연속 상승 길이를 구한다 / 최대 길이에서 값 하한부터 상한까지 계속 증가
- 독립 사례(손계산): `[[17, 18, 18, 19, 21, 4]]` → `3`. 같은 18에서 끊기고 두 번째 18,19,21의 길이가 3이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem06.java (SHA-256 1e5495acc338653d7da7ef2838073742f175863cd79dcbcf21cbd14fc91c5a2e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution06.java (SHA-256 ff1a91b26cac32ae5690fee2728f1aa093fe28f0963b18596b953fa02f1bd6df); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution06Test.java (SHA-256 80576338b360bd5183935d14115c76ecbdaf9c70d040a6132b49716101251cdd); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-07 날짜별 기록 합계

ID: `quest-java-bridge-arr-07` / order 9 / L1

- MVP 이유: 원본 Algorithm Bridge의 날짜별 기록 합계 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 길이가 다른 행을 포함한 2차원 반복을 익힌다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 결과 배열의 길이는 records의 무엇과 같아야 하는가? - records.length와 records[row].length는 각각 무엇을 뜻하는가? - 모든 행의 길이가 같다고 가정해도 되는가? - 바깥 반복문과 안쪽 반복문은 각각 무엇을 확인해야 하는가? - 한 행의 합을 저장하는 변수는 언제 0으로 다시 시작해야 하는가?
- 새 A: 행의 개수만큼 결과 배열을 만든 뒤, 각 행의 값을 모두 더해 같은 행 번호의 결과 칸에 저장하고 반환한다.
- 재사용 A: - 바깥 반복문으로 행을 하나씩 고르고, 안쪽 반복문으로 현재 행의 값을 모두 확인할 수 있다. - 안쪽 반복문의 끝을 records[row].length로 정하면 길이가 다른 행과 빈 행도 같은 코드로 처리할 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 길이가 다른 행을 포함한 2차원 반복을 익힌다. 앞 행의 합을 다음 행에 누적하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-02의 일차원 요약과 달리 행마다 초기화하며 빈 행과 서로 다른 행 길이를 처리한다.
- 지원: 원본 힌트 4개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 앞 행의 합을 다음 행에 누적하기.
- 잡을 오답: 앞 행의 합을 다음 행에 누적하기
- 공개 검증: 각 행의 합을 구한다 / 최대 행 수·행 길이·전체 원소 수
- 독립 사례(손계산): `[[[17, -6], [], [4], [3, 2, -1]]]` → `[11, 0, 4, 4]`. 행 길이 2,0,1,3을 각각 합산한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 교안의 순서·반복·조건은 선수 기반이며 배열/행열/누적합 전문 개념 전체를 설명한다고 주장하지 않음. Java arrays 선수 링크와 원본 Guide의 문제 관련 설명 필요
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/twodimensional/problem/ArrayProblem07.java (SHA-256 1a93719ed922949f91541457c1151153802ab0186aa5b65acdd606fdabe847af); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/twodimensional/solution/ArraySolution07.java (SHA-256 522cc9ed78314183c5e9430c296d034a6bc4b260e7d15f541bf187bd7372e557); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/twodimensional/test/ArraySolution07Test.java (SHA-256 14c54452547b526407b2e75cbbe01febf5339f157d7ee1749f146088eacdf850); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-08 기록의 중앙값 찾기

ID: `quest-java-bridge-arr-08` / order 10 / L2

- MVP 이유: 원본 Algorithm Bridge의 기록의 중앙값 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 정렬 배열 자체를 답으로 내지 않고 정렬을 중간 도구로 쓴다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 값이 섞여 있는 상태에서도 배열의 가운데 인덱스만 읽으면 중앙값이 되는가? - 정렬할 때 원본 배열을 지키려면 먼저 무엇을 해야 하는가? - 길이가 홀수인 배열에서 가운데 인덱스는 어떻게 구하는가? - 원소가 하나뿐이면 중앙값은 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 정렬하면 가운데 값의 위치를 바로 계산할 수 있다. - Arrays.sort()는 전달한 배열을 직접 바꾸므로, clone()으로 복사한 배열을 정렬해야 원본을 지킬 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 정렬 배열 자체를 답으로 내지 않고 정렬을 중간 도구로 쓴다. 입력 순서의 가운데 값을 중앙값으로 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-01의 새 배열 보존을 재사용하되 복사는 중간 도구이며 반환은 정렬된 가운데 값 하나다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 입력 순서의 가운데 값을 중앙값으로 반환하기.
- 잡을 오답: 입력 순서의 가운데 값을 중앙값으로 반환하기
- 공개 검증: 정렬한 값의 중앙값을 구한다 / 최대 길이와 일반 중간값 940
- 독립 사례(손계산): `[[17, -6, 31, 4, 11]]` → `11`. 정렬하면 -6,4,11,17,31이므로 가운데는 11이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 배열 정렬을 중간 도구로 사용하므로 정렬 교안에 연결
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem08.java (SHA-256 f247eff9e10bea37fc24316c572767410e8145fe59ba2b0b3ab27726c61bd2bf); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution08.java (SHA-256 b70bb91dec9aaafb2522eb46b03b6888c1037ac35396a1aa08764d0ef6aa2909); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution08Test.java (SHA-256 534704179accfa34f6ef7f0a790d0dd1430f3eb2b21cbb3251e66d6057b86fda); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-09 처음 등장한 기록만 남기기

ID: `quest-java-bridge-arr-09` / order 11 / L2

- MVP 이유: 원본 Algorithm Bridge의 처음 등장한 기록만 남기기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 중복 제거와 출력 순서를 따로 판단한다. 내림차순 결과는 만들지 않는다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 현재 값이 처음 나온 값인지 확인하려면 배열의 어느 구간을 보면 되는가? - 같은 값이 바로 옆이 아니라 멀리 떨어져 있어도 중복으로 찾아야 하는가? - 결과 배열을 만들기 전에 결과 길이를 어떻게 알 수 있는가? - 값을 정렬하면 처음 등장한 순서를 지킬 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 현재 값보다 앞에 같은 값이 없다면 그 값은 처음 등장한 값이다. - 첫 번째 순회로 결과 길이를 구하고, 두 번째 순회로 정확한 크기의 배열을 채울 수 있다. - 값의 범위와 배열 길이가 작으므로 앞부분을 직접 확인하는 방법으로 배열 연습에 집중한다.
- 새 E: 별도 새 E 주장 없음
- C: 중복 제거와 출력 순서를 따로 판단한다. 내림차순 결과는 만들지 않는다. 바로 앞 값만 비교해 떨어진 중복을 남기기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-04의 기준 통과 필터와 달리 판단 기준이 앞서 나온 값이며, SET-01과 달리 고유 개수가 아닌 순서 있는 값 배열이다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 바로 앞 값만 비교해 떨어진 중복을 남기기.
- 잡을 오답: 바로 앞 값만 비교해 떨어진 중복을 남기기
- 공개 검증: 처음 등장한 값만 원래 순서로 반환한다 / 최대 길이에서 처음 등장한 순서
- 독립 사례(손계산): `[[17, 6, 17, 31, 6, 4]]` → `[17, 6, 31, 4]`. 떨어진 중복 17과 6을 제외하고 최초 순서를 보존한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본은 이전 위치를 확인하는 중첩 반복이다. HashSet 학습으로 표시하거나 집합의 정렬 순서로 바꾸지 않는다. / 원본은 Set 없이 앞선 위치를 직접 비교하는 중첩 반복이다. 조건·순서 선수 연결이며 HashSet 구현을 배웠다고 표시하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem09.java (SHA-256 473b42c70240f6c0bf651b9e472ab63999b677faa1c475794cf8ffa3be5c0801); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution09.java (SHA-256 e8b8adfa55417b29ff9382470861764c50866937d5242daf4b6f04db685d6925); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution09Test.java (SHA-256 0718f47bfc6fd01e04df8080b6ffea4f8b001a5004760b503c54f6dc9386c4e9); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-10 가까운 기록 쌍 세기

ID: `quest-java-bridge-arr-10` / order 12 / L3

- MVP 이유: 원본 Algorithm Bridge의 가까운 기록 쌍 세기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 서로 다른 인덱스 쌍과 중복 결과 목록 생성을 분리한다.
- 선수: `js-12-brute-force-backtracking` / algo.brute-force
- 발견 단서: - 같은 두 위치를 순서만 바꾸어 두 번 세지 않으려면 두 번째 인덱스는 어디서 시작해야 하는가? - 두 값 중 어느 값이 더 큰지 모르는데 차이의 크기는 어떻게 구할 수 있는가? - 두 값이 같아도 서로 다른 위치라면 한 쌍이 될 수 있는가? - maxDifference와 정확히 같은 차이도 포함해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 배열 길이가 최대 300이라 모든 서로 다른 위치 쌍을 직접 확인할 수 있다. - 두 번째 인덱스를 i + 1부터 시작하면 자기 자신과 순서만 바뀐 같은 쌍을 함께 제외할 수 있다.
- 새 E: 첫 위치보다 뒤에 있는 두 번째 위치만 골라 모든 쌍을 확인하고, 두 값의 차이가 기준 이하면 개수를 늘려 반환한다.
- C: 서로 다른 인덱스 쌍과 중복 결과 목록 생성을 분리한다. 차이가 기준과 같은 위치 쌍을 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-03의 이웃 쌍과 달리 떨어진 모든 위치 쌍을 한 번씩 세며 동일 값의 다른 위치도 유지한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 차이가 기준과 같은 위치 쌍을 제외하기.
- 잡을 오답: 차이가 기준과 같은 위치 쌍을 제외하기
- 공개 검증: 차이가 기준 이내인 위치 쌍을 센다 / 최대 길이에서 모든 위치 쌍
- 독립 사례(손계산): `[[17, 21, 17, 24], 4]` → `4`. (0,1),(0,2),(1,2),(1,3) 네 위치 쌍이 조건을 만족한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem10.java (SHA-256 633649e83f68e38ddcf037fdab3c4fb719f5c105feb99630e6a200d6c4e843bb); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution10.java (SHA-256 253dc15a491f8c937fcd2761ed4929c47f5976e84d3ea7277c125fadaeef1198); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution10Test.java (SHA-256 09a9a2b2b6e6197d3880d7d2b6067af2d481156418d4966401da1f89826e003c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-11 반복 점검표 통과시키기

ID: `quest-java-bridge-arr-11` / order 13 / L3

- MVP 이유: 원본 Algorithm Bridge의 반복 점검표 통과시키기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. `%`, 여러 카운터, 결과 선택을 순서대로 연결한다. 최고 득점자 문제는 만들지 않는다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 길이가 짧은 점검표를 observations 끝까지 반복해서 읽으려면 어떤 계산이 필요한가? - 점검표마다 일치 개수를 따로 기억하려면 무엇을 만들 수 있는가? - 가장 많이 일치한 점검표가 아니라 어떤 점검표를 결과에 넣어야 하는가? - 결과 배열을 만들기 전에 통과한 점검표의 개수를 어떻게 알 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - i % 점검표길이는 i가 점검표 끝을 넘을 때 다시 0부터 시작하게 한다. - 점검표 번호와 같은 인덱스의 matchCounts에 개수를 저장하면 여러 개수를 섞지 않고 관리할 수 있다. - 통과 개수를 먼저 세면 고정 길이 배열을 정확한 크기로 만들 수 있다.
- 새 E: 각 점검표를 나머지 연산으로 반복해 일치 개수를 센 뒤, 기준 이상인 점검표 번호만 입력 순서대로 반환한다.
- C: `%`, 여러 카운터, 결과 선택을 순서대로 연결한다. 최고 득점자 문제는 만들지 않는다. 1부터 세는 점검표 번호를0부터 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-04의 필터 앞에 길이가 다른 반복 패턴별 일치 계산이 추가된다. 최고 득점자만 고르는 계약이 아니다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 1부터 세는 점검표 번호를0부터 반환하기.
- 잡을 오답: 1부터 세는 점검표 번호를0부터 반환하기
- 공개 검증: 기준 이상 일치한 점검표 번호를 반환한다 / 관찰·점검표 개수·점검표 길이 상한과 940
- 독립 사례(손계산): `[[3, 7, 3, 7, 3], [[3, 7], [3], [7, 3]], 3]` → `[1, 2]`. 첫 표는 5회, 둘째는 3회, 셋째는 0회 맞아 1,2번을 반환한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 교안의 순서·반복·조건은 선수 기반이며 배열/행열/누적합 전문 개념 전체를 설명한다고 주장하지 않음. Java arrays 선수 링크와 원본 Guide의 문제 관련 설명 필요
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/problem/ArrayProblem11.java (SHA-256 08d9e5b432041ced0bee92416627e18f492f48859668e8f4f82bd33e5c2d1447); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/onedimensional/solution/ArraySolution11.java (SHA-256 774712e1541164e61a0402f60e6269727be105adcf11b167aa7b9267b5682ce3); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/onedimensional/test/ArraySolution11Test.java (SHA-256 466507fc94d8271651b05d664c6832b0d75d7c6e4d7618e4205ec87dec222f3c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## ARR-12 같은 번호의 행과 열 합계

ID: `quest-java-bridge-arr-12` / order 14 / L3

- MVP 이유: 원본 Algorithm Bridge의 같은 번호의 행과 열 합계 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 행 하나와 열 하나를 대응시키되 행렬 곱 결과는 만들지 않는다.
- 선수: `algo-list-conditions` / algo.condition
- 발견 단서: - 결과 배열의 길이는 table의 무엇과 같아야 하는가? - index번째 행의 offset번째 값과 index번째 열의 offset번째 값은 각각 어떻게 읽는가? - 행과 열이 만나는 값은 왜 두 번 더해질 수 있는가? - 행이 없는 표와 한 칸짜리 표의 결과는 각각 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 바깥 반복문으로 결과 번호를 고르고, 안쪽 반복문으로 같은 번호의 행과 열을 함께 읽을 수 있다. - 행 값은 table[index][offset], 열 값은 두 인덱스를 바꾼 table[offset][index]로 읽는다.
- 새 E: 표의 크기만큼 결과 배열을 만든 뒤, 같은 번호의 행과 열을 함께 더하되 교차점은 한 번만 포함해 반환한다.
- C: 행 하나와 열 하나를 대응시키되 행렬 곱 결과는 만들지 않는다. 행과 열이 만나는 칸을 두 번 더하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-07의 행별 합과 달리 같은 번호의 열을 결합하고 교차 칸 중복을 제거한다.
- 지원: 원본 힌트 1개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 행과 열이 만나는 칸을 두 번 더하기.
- 잡을 오답: 행과 열이 만나는 칸을 두 번 더하기
- 공개 검증: 같은 번호의 행과 열을 교차해 합한다 / 최대 행·열과 일반 중간값 940
- 독립 사례(손계산): `[[[17, -2], [6, 11]]]` → `[21, 15]`. 0번은 17-2+6=21, 1번은 6+11-2=15이며 대각선은 한 번이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 교안의 순서·반복·조건은 선수 기반이며 배열/행열/누적합 전문 개념 전체를 설명한다고 주장하지 않음. Java arrays 선수 링크와 원본 Guide의 문제 관련 설명 필요
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/twodimensional/problem/ArrayProblem12.java (SHA-256 69a65b1edf3dd83b76e7faf2788b5edcc03c4d0afbf8d8df992e008b41d9748b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/twodimensional/solution/ArraySolution12.java (SHA-256 0e309b57deecbe1a914d8d0ef2995252021257cd9dffbd71b14467a27237e7b2); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/array/twodimensional/test/ArraySolution12Test.java (SHA-256 da53714b9c13c722b9ca6c980281af77edd34f86a7b7ddd8be5400d9e45ca389); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/array/ArrayGuide.java (SHA-256 a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## STK-01 겹쳐 쌓은 상자 기록의 첫 오류

ID: `quest-java-bridge-stk-01` / order 15 / L1

- MVP 이유: 원본 Algorithm Bridge의 겹쳐 쌓은 상자 기록의 첫 오류 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. `push`·`peek`·`pop`과 두 실패 시점을 함께 익힌다. 괄호 소재는 쓰지 않는다.
- 선수: `js-10-stack-queue` / algo.stack
- 발견 단서: - 양수 기록을 만났을 때 나중에 다시 확인해야 할 번호는 무엇인가? - 음수 기록의 번호는 가장 최근에 올린 상자 번호와 어떻게 비교할 수 있는가? - 빈 곳에서 꺼내려는 기록을 만나면 어떤 위치를 반환해야 하는가? - 반복이 끝난 뒤 스택에 번호가 남아 있다는 것은 무엇을 뜻하는가?
- 새 A: 양수 번호를 스택에 저장하고 음수 번호마다 최근 번호를 확인해 첫 오류 위치를 반환한 뒤, 끝까지 맞으면 남은 번호가 있는지 확인해 결과를 정한다.
- 재사용 A: - 스택은 가장 최근에 넣은 번호를 peek()로 확인하고 pop()으로 바로 꺼낼 수 있다. - ArrayDeque는 Java에서 스택 동작을 구현할 때 사용하는 표준 선택이다.
- 새 E: 별도 새 E 주장 없음
- C: `push`·`peek`·`pop`과 두 실패 시점을 함께 익힌다. 괄호 소재는 쓰지 않는다. 꺼내는 번호가 맨 위 번호인지 확인하지 않기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: 기존 큐 QUE-01의 앞 처리와 달리 마지막에 놓은 번호 및 처리 후 잔여 상태를 검사한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 꺼내는 번호가 맨 위 번호인지 확인하지 않기.
- 잡을 오답: 꺼내는 번호가 맨 위 번호인지 확인하지 않기
- 공개 검증: 쌓기와 꺼내기 순서를 검증한다 / 최대 길이 기록
- 독립 사례(손계산): `[[17, 31, -17]]` → `3`. 세 번째 기록에서 맨 위 31 대신 17을 꺼내려 하므로 위치 3이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/problem/StackProblem01.java (SHA-256 5bc844bf6a056cc279ac61ce42a07e3566cfe9d18eef17a0a70ceaac6ef406c2); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/solution/StackSolution01.java (SHA-256 1b6dc435453af2eb105472bd23f39ebade6ba300c4e5a55bd2f5443b7cecb513); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/stack/test/StackSolution01Test.java (SHA-256 e3c9ab2160b4db90b4675e1a4baea8d7a51595f9023d471ac125068f8e7a5da6); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/StackGuide.java (SHA-256 5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## STK-02 거꾸로 찾은 체크포인트 경로

ID: `quest-java-bridge-stk-02` / order 16 / L2

- MVP 이유: 원본 Algorithm Bridge의 거꾸로 찾은 체크포인트 경로 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 스택이 필요한 이유가 “역순 생성”임을 설명한다. 진법 변환 결과는 만들지 않는다.
- 선수: `js-10-stack-queue` / algo.stack
- 발견 단서: - destination에서 이전 번호를 따라가면 체크포인트를 어떤 순서로 만나게 되는가? - 거꾸로 만난 번호를 출발점부터 읽으려면 어디에 저장하면 좋은가? - 현재 체크포인트 번호로 previousCheckpoint의 인덱스를 찾으려면 무엇을 빼야 하는가? - 필요한 결과 배열의 길이는 언제 알 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 거꾸로 만난 번호를 스택에 넣으면 마지막에 넣은 출발점부터 꺼낼 수 있다. - 경로 길이를 미리 몰라도 스택에 모두 넣은 뒤 size()로 알 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 스택이 필요한 이유가 “역순 생성”임을 설명한다. 진법 변환 결과는 만들지 않는다. 도착점부터 찾은 경로를 그대로 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: STK-01의 오류 감지와 달리 발견 순서와 반환 순서가 반대여서 역순 재구성에 사용한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 도착점부터 찾은 경로를 그대로 반환하기.
- 잡을 오답: 도착점부터 찾은 경로를 그대로 반환하기
- 공개 검증: 가지가 있는 경로와 원본 보존 / 이전 체크포인트를 따라 경로를 복원한다 / 중간 번호 940 / 최대 길이의 긴 경로
- 독립 사례(손계산): `[[0, 1, 1, 3, 2, 5], 6]` → `[1, 2, 5, 6]`. 6→5→2→1의 역추적을 출발 순서 1,2,5,6으로 바꾼다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/problem/StackProblem02.java (SHA-256 72efc4e3942b6d9dee831162f417c6fd446586b677f98817d0a77e39a9184f4a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/solution/StackSolution02.java (SHA-256 6ff66d6d74a2b0f3a96a2182a548e46a109796642a47fd0bf2d18011047a5a14); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/stack/test/StackSolution02Test.java (SHA-256 f278b5f245ad569118699224ac2b7fe003393a4d190c9ec6bc27688a0fc3f25e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/StackGuide.java (SHA-256 5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## STK-03 원형 필름 작업의 시작점별 받침대 높이

ID: `quest-java-bridge-stk-03` / order 17 / L3

- MVP 이유: 원본 Algorithm Bridge의 원형 필름 작업의 시작점별 받침대 높이 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 원형 순회와 검증 상태 초기화를 연결한다. 괄호·회전 수 계약은 쓰지 않는다.
- 선수: `js-10-stack-queue` / algo.stack
- 발견 단서: - 한 시작점에서 offset번째로 확인할 배열 인덱스는 어떻게 구할 수 있는가? - 시작점이 바뀌면 이전 검사에 사용한 스택을 다시 써도 되는가? - 필름을 올린 뒤 현재 높이와 그 시작점의 최대 높이는 어떻게 갱신하는가? - 모든 기록이 맞아도 스택에 필름이 남으면 성공이라고 할 수 있는가? - 실패한 시작점과 성공한 시작점의 값을 결과 배열에서 어떻게 구분할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 나머지 연산으로 원형 인덱스를 만들 수 있다. - 시작점마다 새 스택을 사용하면 이전 검사의 필름이 섞이지 않는다. - 스택 크기는 현재 동시에 쌓인 필름 수와 같다.
- 새 E: 모든 원형 시작점을 고르고 시작점마다 새 스택으로 작업을 검증한 뒤, 성공하면 최대 높이를 실패하면 -1을 같은 위치의 결과에 저장해 반환한다.
- C: 원형 순회와 검증 상태 초기화를 연결한다. 괄호·회전 수 계약은 쓰지 않는다. 성공 여부만 반환하고 시작점별 최대 높이를 잃기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: STK-01의 검사를 시작점마다 독립 반복하고 원형 위치 변환 뒤 최대 높이를 기록한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 성공 여부만 반환하고 시작점별 최대 높이를 잃기.
- 잡을 오답: 성공 여부만 반환하고 시작점별 최대 높이를 잃기
- 공개 검증: 각 시작점의 독립 작업 결과를 구한다 / 번호 하한·중간·상한과 원본 보존 / 최대 길이와 최대 높이
- 독립 사례(손계산): `[[17, 31, -31, -17]]` → `[2, -1, -1, -1]`. 0번 시작은 최대 두 겹이며 나머지는 번호 불일치나 빈 곳 제거가 생긴다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: Problem 본문은 종료 뒤 잔여 필름의 실패를 생략한다. Solution의 종료 조건과 Test의 공개 기대값을 근거로 파생 instructions에 잔여 필름도 실패라고 명료화한다. 원본은 수정하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/problem/StackProblem03.java (SHA-256 b30b6d5a5d1ffbe46f8da44367a346277f6ce8f33da7097026837df95066343e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/solution/StackSolution03.java (SHA-256 f4c66c6fb17ca488aa63ac5be5e8de3989e5f6fb2e28b99971d3526738d540d4); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/stack/test/StackSolution03Test.java (SHA-256 62e253ea9132049d63bc01ba8e87bb8cfe6ece0ef15951eafefc8984fa32b69e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/StackGuide.java (SHA-256 5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## STK-04 처음 더 높은 표지까지 가장 긴 거리

ID: `quest-java-bridge-stk-04` / order 18 / L4

- MVP 이유: 원본 Algorithm Bridge의 처음 더 높은 표지까지 가장 긴 거리 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 단조 스택의 값이 아니라 인덱스를 선택하고 거리를 계산한다.
- 선수: `js-10-stack-queue` / algo.stack
- 발견 단서: - 거리 계산에는 표지의 높이만 필요한가, 그 높이가 있던 인덱스도 필요한가? - 현재 높이가 여러 이전 표지보다 높다면, 답을 찾은 이전 위치들을 한 번에 처리할 수 있는가? - 높이가 같은 표지는 문제에서 말하는 더 높은 표지인가? - 반복이 끝날 때까지 스택에 남은 위치는 어떤 뜻인가? - 길이 200,000에서 각 위치의 오른쪽을 끝까지 다시 확인해도 되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 답을 못 찾은 인덱스를 맨 아래에서 위로 갈수록 높이가 커지지 않는 순서로 스택에 둔다. - 더 높은 현재 값이 나오면 조건을 만족하는 이전 인덱스를 연속해서 꺼낼 수 있다. - 각 인덱스는 한 번 들어가고 한 번만 나오므로 모든 오른쪽 값을 다시 찾지 않는다.
- 새 E: 별도 새 E 주장 없음
- C: 단조 스택의 값이 아니라 인덱스를 선택하고 거리를 계산한다. 같은 높이를 더 높은 표지로 처리하기를 허용하지 않는 계약이다.
- T: STK-03의 새 스택 반복과 달리 오른쪽 첫 큰 값이 결정되는 위치와 거리를 무힌트로 선택한다.
- 기존 경험과 차이: STK-03의 새 스택 반복과 달리 오른쪽 첫 큰 값이 결정되는 위치와 거리를 무힌트로 선택한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 같은 높이를 더 높은 표지로 처리하기.
- 잡을 오답: 같은 높이를 더 높은 표지로 처리하기
- 공개 검증: 여러 위치의 첫 더 높은 표지와 원본 보존 / 더 높은 값을 처음 만나는 위치까지 거리를 구한다 / 최대 길이의 같은 높이
- 독립 사례(손계산): `[[17, 11, 11, 14, 20]]` → `4`. 17의 첫 더 높은 20까지 거리 4가 최댓값이다. 같은 11은 더 높지 않다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/problem/StackProblem04.java (SHA-256 074c8b75f1bc17b2c2940b74bac9b1cb14edf82b98fc33b98a0870d6af83854b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/solution/StackSolution04.java (SHA-256 343f6d9c3e8ff6ae399d6d0f96e5c163771d82afb5df02e7361f5b7b86ba1f5a); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/stack/test/StackSolution04Test.java (SHA-256 c4268faf706a793e65393af7cb3ad2b400eebddc0c14cc634ecdbd04b462bb28); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/StackGuide.java (SHA-256 5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## STK-05 여러 카드 더미의 합 상쇄

ID: `quest-java-bridge-stk-05` / order 19 / L3

- MVP 이유: 원본 Algorithm Bridge의 여러 카드 더미의 합 상쇄 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 원본 스택과 결과 스택의 역할을 연결하며 최근 값 연쇄 상쇄도 함께 익힌다.
- 선수: `js-10-stack-queue` / algo.stack
- 발견 단서: - 한 행의 마지막 값이 맨 위 카드라면 원본 스택에는 어떤 순서로 넣어야 하는가? - 선택한 원본 스택이 비어 있을 때 결과 스택도 바뀌어야 하는가? - 새 카드와 비교할 값은 결과 스택의 어느 위치에 있는가? - pop되는 순서와 문제에서 요구한 아래에서 위 순서는 같은가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 원본 더미와 결과 더미 모두 맨 위 값을 반복해서 확인하고 꺼내므로 스택이 맞다. - List에 각 Deque를 보관하면 지시된 더미를 번호로 바로 찾을 수 있다.
- 새 E: 각 행을 원본 스택으로 만든 뒤, 지시된 스택의 위 카드를 결과 스택 최근 카드와 비교해 저장하거나 둘 다 없애고, 남은 카드를 아래에서 위 순서로 반환한다.
- C: 원본 스택과 결과 스택의 역할을 연결하며 최근 값 연쇄 상쇄도 함께 익힌다. 원본 행의 첫 값을 맨 위로 읽기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: STK-01의 단일 기록과 달리 원본 더미의 맨 위와 결과 더미의 최근 값을 연결하고 반환 방향도 바꾼다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 원본 행의 첫 값을 맨 위로 읽기.
- 잡을 오답: 원본 행의 첫 값을 맨 위로 읽기
- 공개 검증: 원본 스택에서 꺼낸 카드의 상쇄 결과를 구한다 / 카드 하한·0·중간·상한과 원본 보존 / 행 50개와 전체 카드 수 0 / 행·행 길이·카드 합·지시 길이와 상쇄 합 상한
- 독립 사례(손계산): `[[[17, 6], [4, 13], []], [1, 2, 1, 2, 3], 19]` → `[17, 4]`. 6과13은 19로 상쇄된다. 다음 17과4의 합은21이므로 아래→위 [17,4]가 남고 빈 더미 선택은 무시한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/problem/StackProblem05.java (SHA-256 378f314231704370046e02487fcb99a0ec02abf892898af05f0430ec46faf29e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/solution/StackSolution05.java (SHA-256 f8d29698d8faf0c6cd9269aa7fdae4446e294799b09bb9b2e592adec0931de70); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/stack/test/StackSolution05Test.java (SHA-256 6e97c1c2720199f49e1c6b865cf2740203ae77a92458c066daa640baa6c6f5e8); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/stack/StackGuide.java (SHA-256 5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## QUE-02 검수 순서에서 낮은 점수 빼기

ID: `quest-java-bridge-que-02` / order 20 / L2

- MVP 이유: 원본 Algorithm Bridge의 검수 순서에서 낮은 점수 빼기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 회전과 제거 뒤 새 시작점을 연결한다. 마지막 생존자 계약은 쓰지 않는다.
- 선수: `js-10-stack-queue` / algo.queue
- 발견 단서: - 맨 앞 값을 맨 뒤로 한 번 보내면 줄의 순서는 어떻게 바뀌는가? - 이동 횟수가 현재 줄의 길이보다 클 때 같은 순서가 반복되는 주기는 얼마인가? - 점수가 removalLimit와 같으면 제거해야 하는가? - 제거한 뒤 새 맨 앞 값은 무엇이며, 큐가 비면 다음 명령은 어떻게 처리해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - Queue의 poll()과 offer()를 이어 쓰면 앞 값을 뒤로 한 번 옮길 수 있다. - 큐 길이만큼 옮기면 같은 순서로 돌아오므로 나머지만큼만 옮기면 된다.
- 새 E: 별도 새 E 주장 없음
- C: 회전과 제거 뒤 새 시작점을 연결한다. 마지막 생존자 계약은 쓰지 않는다. 점수가 제거 기준과 같은 경우 남기기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: 기존 QUE-01과 달리 현재 길이에 의존하는 회전과 조건부 제거가 다음 시작점을 바꾼다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 점수가 제거 기준과 같은 경우 남기기.
- 잡을 오답: 점수가 제거 기준과 같은 경우 남기기
- 공개 검증: 회전 명령 뒤 조건에 맞는 앞 값을 제거한다 / 최대 길이와 명령 수에서 모두 제거
- 독립 사례(손계산): `[[17, 4, 21], [4, 0, 2], 4]` → `[21, 17]`. 4회 회전 뒤 [4,21,17]에서4 제거; 이후0회와2회 회전 모두 [21,17]이고21은 남는다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/problem/QueueProblem02.java (SHA-256 78a1f3b0cb31a89f3b2007c01b72fbcd340d660c19e7d59111dc090479413968); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/solution/QueueSolution02.java (SHA-256 a00f822992b43ecf2eaff0083018220c1e9fe8f59f2f7d43be11609e5457b65e); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/queue/test/QueueSolution02Test.java (SHA-256 3a1e28698a3c74fa73abc93ca34d5336f492044923227c1539d8c523797065fd); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/QueueGuide.java (SHA-256 dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## QUE-03 주문의 수령 회차 정하기

ID: `quest-java-bridge-que-03` / order 21 / L3

- MVP 이유: 원본 Algorithm Bridge의 주문의 수령 회차 정하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 계산값과 원래 순서 장벽을 연결한다.
- 선수: `js-10-stack-queue` / algo.queue
- 발견 단서: - 주문 하나의 준비 시각은 어떤 두 값을 더해서 구하는가? - 뒤 주문이 먼저 준비되어도 맨 앞 주문보다 먼저 건넬 수 있는가? - 한 회차에 함께 들어올 수 있는지 비교할 기준 시각은 어느 주문이 정하는가? - 결과 배열의 같은 인덱스에는 무엇을 기록해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - Queue는 주문 순서를 지키면서 아직 처리하지 않은 맨 앞 준비 시각을 바로 볼 수 있다. - 앞 주문의 준비 시각 이하인 연속 주문만 같은 회차로 꺼내면 순서 장벽을 지킬 수 있다.
- 새 E: 주문별 준비 시각을 큐에 넣고, 맨 앞 준비 시각을 회차 기준으로 삼아 그 시각 이하인 연속 주문에 같은 회차 번호를 기록한다.
- C: 계산값과 원래 순서 장벽을 연결한다. 준비 시각이 회차 기준과 같은 주문을 다음 회차로 넘기기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: QUE-02의 순서 변경과 달리 원래 순서를 장벽으로 유지하고 회차 시작 시각을 고정해 연속 주문을 묶는다.
- 지원: 원본 힌트 1개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 준비 시각이 회차 기준과 같은 주문을 다음 회차로 넘기기.
- 잡을 오답: 준비 시각이 회차 기준과 같은 주문을 다음 회차로 넘기기
- 공개 검증: 앞 주문을 기준으로 수령 회차를 묶는다 / 최대 주문 수를 한 회차로 처리
- 독립 사례(손계산): `[[1, 3, 5, 7], [16, 2, 12, 11]]` → `[1, 1, 1, 2]`. 준비 시각17,5,17,18에서 첫 세 주문은17시각 회차, 마지막은18시각 새 회차다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/problem/QueueProblem03.java (SHA-256 adf0dfc21ea35513b0911309342e7d258e4f9c74bce3c3a626b68cc9ff5d7d40); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/solution/QueueSolution03.java (SHA-256 1420b922326ceebdc5651e24aa4c3137de097da7747b24961b2bd5435d8c2b97); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/queue/test/QueueSolution03Test.java (SHA-256 ba47a9d2a88763b92cc08db4d4f01a8d0a53c28e2171073e3335587f545b9806); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/QueueGuide.java (SHA-256 dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## QUE-04 두 검사대에서 시료 꺼내기

ID: `quest-java-bridge-que-04` / order 22 / L4

- MVP 이유: 원본 Algorithm Bridge의 두 검사대에서 시료 꺼내기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 각 큐의 내부 순서를 지키면서 선택한다.
- 선수: `js-10-stack-queue` / algo.queue
- 발견 단서: - 현재 필요한 시료 번호는 inspectionPlan의 어느 위치에서 확인하는가? - 각 검사대에서 지금 바로 꺼낼 수 있는 시료는 몇 개인가? - 첫 번째 검사대의 맨 앞과 일치하면 결과 배열에 어떤 값을 기록해야 하는가? - 두 검사대의 맨 앞이 모두 필요한 시료가 아니라면 부분 결과를 반환해도 되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - Queue 두 개를 사용하면 각 검사대의 내부 순서를 그대로 지킬 수 있다. - peek()로 두 맨 앞을 확인하고 일치하는 큐에서만 poll()하면 된다.
- 새 E: 별도 새 E 주장 없음
- C: 각 큐의 내부 순서를 지키면서 선택한다. 실패했는데 지금까지 기록한 부분 결과를 반환하기를 허용하지 않는 계약이다.
- T: QUE-03의 한 줄 처리에서 서로 다른 두 줄의 맨 앞 선택으로 확장하며 실패는 부분 결과 대신 [-1]이다.
- 기존 경험과 차이: QUE-03의 한 줄 처리에서 서로 다른 두 줄의 맨 앞 선택으로 확장하며 실패는 부분 결과 대신 [-1]이다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 실패했는데 지금까지 기록한 부분 결과를 반환하기.
- 잡을 오답: 실패했는데 지금까지 기록한 부분 결과를 반환하기
- 공개 검증: 두 검사대의 맨 앞 시료로 계획을 처리한다 / 최대 시료 수를 두 검사대에서 교대로 꺼내기
- 독립 사례(손계산): `[[17, 31], [6, 21], [17, 21]]` → `[-1]`. 17을 꺼낸 뒤 둘째 검사대 맨 앞은6이어서21을 꺼낼 수 없다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/problem/QueueProblem04.java (SHA-256 ea6e0d6808cc35864c0cee6daad9efce98c2e426d891956a5b363c29160b08da); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/solution/QueueSolution04.java (SHA-256 f84b8525f325ac9e251ab965b1f40dd514762e8a8bc85e15b630a4829ef2be9a); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/queue/test/QueueSolution04Test.java (SHA-256 0c979232a37485150ab8f6897170f91f6360b8f7d9c5310d57f9cdb1f58b90e4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/queue/QueueGuide.java (SHA-256 dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-01 반대 코드 짝이 처음 완성된 위치

ID: `quest-java-bridge-hsh-01` / order 23 / L1

- MVP 이유: 원본 Algorithm Bridge의 반대 코드 짝이 처음 완성된 위치 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 포함 확인 순서가 같은 원소 재사용을 막는 이유를 익힌다. 특정 합 존재 여부는 답으로 쓰지 않는다.
- 선수: `algo-hash-map-set` / algo.set-collection
- 발견 단서: - 현재 코드와 더해서 0이 되는 값은 무엇인가? - 현재 코드를 먼저 저장하면 코드 하나짜리 [0]을 잘못 짝으로 판단하지 않을까? - 배열 인덱스와 문제에서 요구한 1부터 센 위치는 어떻게 다른가? - 짝을 찾지 못했을 때 반환할 값은 무엇인가?
- 새 A: 현재 코드의 반대 값을 이전 코드 집합에서 확인하고, 짝이 없을 때 현재 코드를 저장하며, 처음 짝이 완성되는 위치를 반환한다.
- 재사용 A: 현재 값에 필요한 짝 계산 → 이전 값 집합에서 확인 → 현재 값 저장
- 새 E: 별도 새 E 주장 없음
- C: 포함 확인 순서가 같은 원소 재사용을 막는 이유를 익힌다. 특정 합 존재 여부는 답으로 쓰지 않는다. 0 하나를 자기 자신과 짝지어 바로 성공하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: STK-01은 최근 값과 비교하지만 여기서는 앞의 어느 위치라도 반대 값이면 되며 자기 자신 재사용을 금지한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 0 하나를 자기 자신과 짝지어 바로 성공하기.
- 잡을 오답: 0 하나를 자기 자신과 짝지어 바로 성공하기
- 공개 검증: 처음 완성된 반대 부호 짝의 위치를 구한다 / 배열 길이 상한
- 독립 사례(손계산): `[[17, 0, -31, 0, -17]]` → `4`. 0은 처음 나왔을 때 짝이 없고 네 번째0에서 최초 반대 짝이 완성된다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem01.java (SHA-256 a88381ac2d545065e43a6d856d8ee9c4552b7287f856799ed7e8dd4381f95650); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution01.java (SHA-256 76c766e1403563b0d928f1300429504a98173e54c85b22422e1e0cdf43bd5ca3); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution01Test.java (SHA-256 639fb8a76a6ccfac5f2a6fdedcfc40c31224f5bebbb67a35d58b93e4c62be764); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-02 두 재고 목록의 남은 차이 수

ID: `quest-java-bridge-hsh-02` / order 24 / L2

- MVP 이유: 원본 Algorithm Bridge의 두 재고 목록의 남은 차이 수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. `Set`이 아닌 빈도 맵이 필요한 중복 사례를 경험한다.
- 선수: `algo-hash-map-set` / algo.map-collection
- 발견 단서: - Set만 사용하면 같은 코드가 두 번 나온 사실을 기억할 수 있는가? - 준비 목록의 코드는 개수를 늘리고 실제 목록의 코드는 줄이면 무엇이 남는가? - 음수로 남은 개수도 차이에 포함해야 하지 않을까? - 두 배열의 길이가 같아도 내용은 다를 수 있지 않은가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 항목별 개수 저장 → 다른 흐름으로 증가·감소 → 남은 차이를 반환
- 새 E: 별도 새 E 주장 없음
- C: `Set`이 아닌 빈도 맵이 필요한 중복 사례를 경험한다. 양쪽에 남은 차이의 절댓값 대신 부호 있는 차이를 상쇄하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-01의 존재 여부에서 같은 코드의 횟수로 상태를 바꾸어 양쪽 차이를 모두 센다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 양쪽에 남은 차이의 절댓값 대신 부호 있는 차이를 상쇄하기.
- 잡을 오답: 양쪽에 남은 차이의 절댓값 대신 부호 있는 차이를 상쇄하기
- 공개 검증: 두 목록의 항목별 개수 차이를 더한다 / 두 배열 길이 상한
- 독립 사례(손계산): `[["p", "p", "q", "z"], ["p", "r", "r", "z"]]` → `4`. p 한 개와q 한 개가 부족하고r 두 개가 남아 총4이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem02.java (SHA-256 0c6fd82bf20e80f8090e7fc917c55fa141b049c642666d14a820d71069d6b26c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution02.java (SHA-256 0972309c97db050a1163a88cf84f40d784f2f816b99589ec95807133c09e5afb); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution02Test.java (SHA-256 7b748b5b36c1c68cc0e886a9074e5a63abacdac3bd74282e719487afe90e9089); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-03 순서가 달라도 같은 구성의 연속 구간 찾기

ID: `quest-java-bridge-hsh-03` / order 25 / L3

- MVP 이유: 원본 Algorithm Bridge의 순서가 달라도 같은 구성의 연속 구간 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 고정 창을 매번 새로 세지 않는 연결을 익힌다.
- 선수: `algo-hash-map-set` / algo.map-collection
- 발견 단서: - 값의 순서가 아니라 어떤 정보가 같아야 하는가? - 첫 번째 창의 길이는 무엇으로 정해야 하는가? - 창을 한 칸 옮길 때 빠지는 값과 새로 들어오는 값은 각각 어디에 있는가? - 개수가 0이 된 이름표를 Map에 남기면 두 개수표가 같다고 판단할 수 있는가? - 마지막으로 확인해야 할 창의 시작 위치는 어디인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 첫 고정 구간 빈도 생성 → 빠지는 값 감소·들어오는 값 증가 → 목표 빈도와 비교
- 새 E: pattern과 첫 창의 값별 개수를 만들고, 창을 옮길 때 빠지는 값은 줄이고 들어오는 값은 늘린 뒤, 두 개수표가 같은 시작 위치를 반환한다.
- C: 고정 창을 매번 새로 세지 않는 연결을 익힌다. 값의 종류만 같으면 횟수가 달라도 일치로 처리하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-02의 한 번 빈도 차이에서 고정 길이 연속 창의 제거·추가와 시작 위치 나열을 연결한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 값의 종류만 같으면 횟수가 달라도 일치로 처리하기.
- 잡을 오답: 값의 종류만 같으면 횟수가 달라도 일치로 처리하기
- 공개 검증: 패턴과 빈도가 같은 고정 구간의 위치를 구한다 / 길이 상한과 서로 다른 값 1,000개
- 독립 사례(손계산): `[[17, 6, 17, 6, 31, 17], [6, 17, 17]]` → `[1]`. 길이3인 첫 구간만17 두 개와6 한 개를 가진다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem03.java (SHA-256 7a73db2f5cc7d8b2d39d3d974c8c5fbcc0f33b79d63f921b23b5c4f7eb18ddc1); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution03.java (SHA-256 ea73638bc2cbf35b469d43117d448b9d0ab077a0b7e5d183fc708cf4a353911c); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution03Test.java (SHA-256 02d64421b7f01e6327fd54d5446da8c5b7160c2a4c761d96af9bf4efc306d829); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-04 마지막 보정값으로 기록 다시 계산하기

ID: `quest-java-bridge-hsh-04` / order 26 / L3

- MVP 이유: 원본 Algorithm Bridge의 마지막 보정값으로 기록 다시 계산하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 입력 즉시 출력할 수 없는 이유와 2회 순회를 익힌다.
- 선수: `algo-hash-map-set` / algo.map-collection
- 발견 단서: - 같은 ID에 값을 다시 put하면 Map에는 어떤 값이 남는가? - 첫 기록을 읽는 즉시 계산하면 뒤에서 바뀌는 계수를 알 수 있는가? - 결과는 장치별 묶음 순서인가, 처음 기록된 순서인가? - 두 int를 곱한 뒤 long에 담으면 곱셈 도중의 범위를 안전하게 지킬 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 안정 ID의 최신 속성 확정 → 두 번째 순회에서 사건을 최종 속성으로 변환
- 새 E: ID별 마지막 보정 계수를 먼저 저장하고, 기록을 다시 읽으며 각 측정값에 마지막 계수를 곱해 원래 순서로 반환한다.
- C: 입력 즉시 출력할 수 없는 이유와 2회 순회를 익힌다. 각 기록 당시 계수를 그대로 사용하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-03의 현재 창과 달리 미래의 마지막 계수가 앞선 출력에도 영향을 주므로 최종 상태 확정과 순서 복원이 분리된다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 각 기록 당시 계수를 그대로 사용하기.
- 잡을 오답: 각 기록 당시 계수를 그대로 사용하기
- 공개 검증: 장치 기록에 마지막 계수를 적용한다 / 기록 길이 상한
- 독립 사례(손계산): `[["p", "q", "p", "q"], [2, 5, 7, 3], [4, -2, 6, 0]]` → `["28", "-6", "42", "0"]`. 마지막 계수는p=7,q=3으로 모든 기록에 소급 적용한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem04.java (SHA-256 7d2f397835ec77eea10720e92f1b1028ac0212f813e9f2f8e42984016cc619d2); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution04.java (SHA-256 894a3334f3cf06eab7d72e68fc64ec5247a4c030e6aacaf9157b0d046b7fa638); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution04Test.java (SHA-256 cda35cc056082b321c00c1ebc6b1ea12ecbf4e7bd9d7bb1a2ab64ffba9917c4a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-05 팀별 작업 순서표 만들기

ID: `quest-java-bridge-hsh-05` / order 27 / L4

- MVP 이유: 원본 Algorithm Bridge의 팀별 작업 순서표 만들기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 두 단계 정렬 기준과 원래 ID 동점을 스스로 설계한다.
- 선수: `algo-hash-map-set` / algo.map-collection
- 발견 단서: - 팀의 전체 시간과 팀에 속한 작업 위치를 각각 어디에 모을 수 있는가? - 팀의 정렬 기준과 팀 안 작업의 정렬 기준은 어떻게 다른가? - 첫 번째 기준이 같을 때 어떤 기준을 다음으로 비교해야 하는가? - 작업 ID 대신 배열 위치를 묶어 두면 나머지 정보도 함께 비교할 수 있지 않은가? - 한 팀의 작업 수가 perTeamLimit보다 적을 때 몇 개를 선택해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 그룹별 합계·구성원 저장 → 그룹 순위 → 그룹 안 복합 순위 → 제한 개수 선택
- 새 E: 별도 새 E 주장 없음
- C: 두 단계 정렬 기준과 원래 ID 동점을 스스로 설계한다. 긴급도가 낮은 작업을 먼저 선택하기를 허용하지 않는 계약이다.
- T: HSH-04의 순서 복원과 달리 팀 합계 정렬과 팀 내부 다중 기준 정렬을 별도로 설계한다.
- 기존 경험과 차이: HSH-04의 순서 복원과 달리 팀 합계 정렬과 팀 내부 다중 기준 정렬을 별도로 설계한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 긴급도가 낮은 작업을 먼저 선택하기.
- 잡을 오답: 긴급도가 낮은 작업을 먼저 선택하기
- 공개 검증: 팀과 작업을 정해진 순서로 정렬한다 / 작업 길이와 팀별 제한 상한
- 독립 사례(손계산): `[["p2", "q1", "p1", "q2"], ["p", "q", "p", "q"], [4, 3, 2, 3], [7, 1, 7, 2], 1]` → `["p1", "q2"]`. 팀 합은각6으로p가 먼저; p는긴급도동점에서2분p1, q는긴급도2의q2를 고른다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다. / 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem05.java (SHA-256 26951872c775742d9bb471e40f20fc4a526c76b6f53b1ef8f2dfd98a42dd9719); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution05.java (SHA-256 2dd9773e9d4ee2d23af390ff63f35c321b220c0b4af152f6381a03b7b006fc05); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution05Test.java (SHA-256 d349157a23f4ec9fc6b52237ea9d257ec9f3c1b5f6e43faa9d6c1b5a55525d81); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## HSH-06 검수자마다 맡을 최우선 프로젝트 찾기

ID: `quest-java-bridge-hsh-06` / order 28 / L3

- MVP 이유: 원본 Algorithm Bridge의 검수자마다 맡을 최우선 프로젝트 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. `Map<대상, Set<출처>>`와 역전파를 연결한다.
- 선수: `algo-hash-map-set` / algo.map-collection, algo.set-collection
- 발견 단서: - 같은 검수자와 프로젝트의 중복 관계를 어떻게 한 번만 저장할 수 있는가? - 후보가 되려면 프로젝트마다 서로 다른 검수자가 몇 명 있어야 하는가? - 기준을 통과했어도 그 프로젝트를 검수하지 않은 사람에게 배정해도 되는가? - 우선순위가 같을 때 어떤 프로젝트 ID를 골라야 하는가? - 검수자별 선택을 reviewerOrder 순서에 맞추려면 ID의 위치를 어떻게 기억할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 대상별 고유 출처 수집 → 기준 판정 → 관련 출처에 결과 반영 → 원래 순서 반환
- 새 E: 프로젝트별 고유 검수자 집합을 만들고, 기준을 넘긴 프로젝트를 각 검수자의 현재 선택과 우선순위·ID 순으로 비교한 뒤, 검수자 목록 순서대로 반환한다.
- C: `Map<대상, Set<출처>>`와 역전파를 연결한다. 최소 검수자 수와 정확히 같은 프로젝트를 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-05의 단순 그룹과 달리 중복 관계를 제거한 후보 판정 결과를 참여자별 우선 선택으로 되돌린다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 최소 검수자 수와 정확히 같은 프로젝트를 제외하기.
- 잡을 오답: 최소 검수자 수와 정확히 같은 프로젝트를 제외하기
- 공개 검증: 검수자별 조건에 맞는 프로젝트를 고른다 / 프로젝트 길이 상한과 전체 우선순위 동점 / 검수자·관계 길이와 기준 상한
- 독립 사례(손계산): `[["v", "w", "x"], ["p", "q"], [9, 9], [["v", "p"], ["v", "p"], ["w", "p"], ["v", "q"], ["x", "q"]], 2]` → `["p", "p", "q"]`. 중복검수는한 번; 두 프로젝트 모두2명이고v는동점사전순p, w=p,x=q이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본 Problem의 선행 접근 요약 ‘이 문제에서 연습할 것’은 instructions에서 제외하고 문제 설명부터 제시한다. 별도 접근 방식 region과 Solution 해설도 클라이언트에 복제하지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/problem/HashProblem06.java (SHA-256 e7db1b9c35cbcd3f4882a47d009aa54c5877765da39776cdb9266acd11bd2a62); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/solution/HashSolution06.java (SHA-256 790124e584bcfe12329b37c590de13652897fb213d8280a4859f092919548afc); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/hash/test/HashSolution06Test.java (SHA-256 db969c719831d68e4bbb5e50ddb599e8ff881cad73156b0dcd0487d994336cc2); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/hash/HashGuide.java (SHA-256 1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TRE-01 나무 끝 상자의 값 합계

ID: `quest-java-bridge-tre-01` / order 29 / L1

- MVP 이유: 원본 Algorithm Bridge의 나무 끝 상자의 값 합계 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 완전 이진 트리 배열과 재귀 종료를 익힌다.
- 선수: `algo-09-tree` / algo.tree, algo.tree-traversal
- 발견 단서: - 배열의 0번 인덱스에서 시작할 때 왼쪽과 오른쪽 자식 인덱스는 어떻게 구하는가? - 계산한 자식 인덱스가 배열 길이 이상이면 무엇을 해야 하는가? - 현재 상자가 끝 상자인지는 두 자식 위치로 어떻게 알 수 있는가? - 값이 최대 100,000개이고 각 값이 클 때 합은 int에 안전한가?
- 새 A: 현재 인덱스가 배열 밖이면 멈추고, 자식이 없으면 현재 값을 반환하며, 자식이 있으면 왼쪽과 오른쪽 결과를 더해 반환한다.
- 재사용 A: - 인덱스 i에서 두 자식 인덱스를 계산하면 노드 객체 없이 트리를 따라갈 수 있다. - 같은 일을 왼쪽과 오른쪽에 반복하므로 재귀 함수로 표현하기 쉽다.
- 새 E: 별도 새 E 주장 없음
- C: 완전 이진 트리 배열과 재귀 종료를 익힌다. 자식이 하나라도 있는 노드를 끝 상자로 포함하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-07의 모든 행 합과 달리 자식 존재 여부가 포함 대상을 결정하는 트리 구조 조건이다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 자식이 하나라도 있는 노드를 끝 상자로 포함하기.
- 잡을 오답: 자식이 하나라도 있는 노드를 끝 상자로 포함하기
- 공개 검증: 자식이 둘인 완전한 세 층과 원본 보존 / 길이·값·트리 모양 경계 / 최대 길이와 int 범위를 넘는 합
- 독립 사례(손계산): `[[17, 31, 6, 4, 9]]` → `"19"`. 끝노드는 인덱스2,3,4의6,4,9로 합19이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/problem/TreeProblem01.java (SHA-256 c2920c1fb684bfd42884a606f6ed6e2e824794baff3572d8280344d23cf5f608); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/solution/TreeSolution01.java (SHA-256 df5219cdbbdcde389256b122f7e82228cfb50c70dcdea00f1167096aa551ad83); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/tree/test/TreeSolution01Test.java (SHA-256 a5e5c84ac30f6598ecbcf6dec9de8d97f5664452377514ad5047a63927025c84); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/TreeGuide.java (SHA-256 eac769fe309d2cb1f207df53062c9956a85b1fe5ea28fc7a2a76a15c0e641e9a)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TRE-02 목표 값의 방문 순번

ID: `quest-java-bridge-tre-02` / order 30 / L2

- MVP 이유: 원본 Algorithm Bridge의 목표 값의 방문 순번 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 전위·중위·후위의 차이를 재귀 코드가 아닌 방문 시점으로 이해한다. 세 결과를 한 번에 반환하지 않는다.
- 선수: `algo-09-tree` / algo.tree, algo.tree-traversal
- 발견 단서: - 왼쪽과 오른쪽 자식을 방문하는 재귀 호출은 어떤 부분이 항상 같은가? - visitMoment에 따라 현재 값을 목록에 넣는 한 줄은 어디로 이동해야 하는가? - 배열 밖 인덱스에 도착한 재귀 호출은 언제 끝나야 하는가? - 목표 값의 목록 인덱스를 문제에서 1부터 세는 순번으로 어떻게 바꾸는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 기록 한 줄의 위치를 옮기면 세 방문 시점의 차이를 직접 확인할 수 있다. - values의 값은 모두 다르므로 기록 목록에서 target의 위치는 하나뿐이다.
- 새 E: 별도 새 E 주장 없음
- C: 전위·중위·후위의 차이를 재귀 코드가 아닌 방문 시점으로 이해한다. 세 결과를 한 번에 반환하지 않는다. 방문 순번을0부터 세기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: TRE-01의 끝노드 조건과 달리 같은 트리에서 현재 값을 기록하는 시점 자체가 답을 바꾼다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 방문 순번을0부터 세기.
- 잡을 오답: 방문 순번을0부터 세기
- 공개 검증: BEFORE 방문 순번과 원본 보존 / 방문 시점과 입력 경계 / 최대 길이에서 AFTER의 뿌리는 마지막
- 독립 사례(손계산): `[[17, 31, 6, 4, 9], 31, "AFTER"]` → `3`. 후위 기록은4,9,31,6,17이므로31은3번째다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/problem/TreeProblem02.java (SHA-256 ce5d57981cfdf5fe35c3cb1e396b4f3f9f5a4d05da28132255f63db43274c0e0); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/solution/TreeSolution02.java (SHA-256 e6cf7ce63de115423894265e01b36efb5753753e913d7a50c61bd23af9be2174); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/tree/test/TreeSolution02Test.java (SHA-256 64c8557da16c9061a317047d1f6d3b994641498756e9f8a843a03aaeaf3c5a0d); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/TreeGuide.java (SHA-256 eac769fe309d2cb1f207df53062c9956a85b1fe5ea28fc7a2a76a15c0e641e9a)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TRE-03 두 상자의 가장 가까운 공통 보관 칸

ID: `quest-java-bridge-tre-03` / order 31 / L3

- MVP 이유: 원본 Algorithm Bridge의 두 상자의 가장 가까운 공통 보관 칸 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 전체 트리를 만들지 않고 부모 방향 수렴을 계산한다. 대진 소재는 쓰지 않는다.
- 선수: `algo-09-tree` / algo.tree
- 발견 단서: - 현재 칸 번호에서 부모 번호는 어떤 계산으로 구하는가? - 두 번호가 다를 때 더 큰 번호가 더 작은 번호의 조상이 될 수 있는가? - 한쪽만 부모로 이동했을 때 어느 이동 횟수를 늘려야 하는가? - 두 시작 번호가 처음부터 같다면 결과는 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 더 큰 번호는 더 작은 현재 번호의 조상이 될 수 없다. - 두 번호 중 큰 쪽만 부모로 올리면 건너뛴 공통 조상 없이 두 번호가 가까워진다.
- 새 E: 두 번호가 다르면 더 큰 번호를 2로 나눠 부모로 올리고 그쪽 이동 횟수를 늘린 뒤, 같아진 번호와 두 이동 횟수를 반환한다.
- C: 전체 트리를 만들지 않고 부모 방향 수렴을 계산한다. 대진 소재는 쓰지 않는다. 두 출발점의 이동 횟수를 뒤바꾸기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: TRE-02의 전체 순회와 달리 서로 깊이가 다른 두 번호의 부모 사슬만 수렴시킨다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 두 출발점의 이동 횟수를 뒤바꾸기.
- 잡을 오답: 두 출발점의 이동 횟수를 뒤바꾸기
- 공개 검증: 관계와 노드 번호 경계
- 독립 사례(손계산): `[37, 9]` → `[9, 2, 0]`. 37→18→9로두 번,9는이미공통칸이라0번 이동한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/problem/TreeProblem03.java (SHA-256 37144981b5342458ee36ef34aa7044fd8d9eac6249beae985f21fbb526ff7c08); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/solution/TreeSolution03.java (SHA-256 6356765ec2ebc0d3f2e9f7f8a1d3d4cba3b877bf1aef3650a487ad6d288e20a6); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/tree/test/TreeSolution03Test.java (SHA-256 c061b7d9a009c751f0c73fd4318adfc0593abf64e2668507202419ba96739bea); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/TreeGuide.java (SHA-256 eac769fe309d2cb1f207df53062c9956a85b1fe5ea28fc7a2a76a15c0e641e9a)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TRE-04 폴더 변경 영향 점수

ID: `quest-java-bridge-tre-04` / order 32 / L4

- MVP 이유: 원본 Algorithm Bridge의 폴더 변경 영향 점수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 매핑, 부모 사슬, 반복 사건, 순서 복원을 스스로 조합한다. 비율 판매 구조는 쓰지 않는다.
- 선수: `algo-09-tree` / algo.tree
- 발견 단서: - 사건 이름의 결과 위치를 매번 처음부터 찾지 않으려면 어떤 연결 정보가 필요한가? - 관계 행의 순서와 관계없이 자식 이름으로 부모 이름을 바로 찾으려면 무엇을 연결해야 하는가? - 부모 관계가 없는 뿌리에 도착했는지는 어떻게 알 수 있는가? - 같은 폴더에서 여러 사건이 생기면 이전 점수를 덮어써야 하는가, 더해야 하는가? - 누적 점수가 int 범위를 넘을 수 있는가? 결과를 outputOrder 순서로 만들려면 무엇을 기준으로 해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 이름과 결과 위치를 Map에 연결하면 매번 outputOrder 전체를 찾지 않아도 된다. - 자식 이름과 부모 이름을 별도 Map에 연결하면 관계 행 순서에 기대지 않아도 된다. - 뿌리는 자식으로 들어 있지 않으므로 부모 이름을 찾지 못했을 때 자연스럽게 멈출 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 매핑, 부모 사슬, 반복 사건, 순서 복원을 스스로 조합한다. 비율 판매 구조는 쓰지 않는다. 자식 변경을 부모와 뿌리에 누적하지 않기를 허용하지 않는 계약이다.
- T: TRE-03의 두 정수 부모 사슬과 달리 문자열 매핑·여러 사건 누적·요청 순서 복원이 함께 필요하다.
- 기존 경험과 차이: TRE-03의 두 정수 부모 사슬과 달리 문자열 매핑·여러 사건 누적·요청 순서 복원이 함께 필요하다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 자식 변경을 부모와 뿌리에 누적하지 않기.
- 잡을 오답: 자식 변경을 부모와 뿌리에 누적하지 않기
- 공개 검증: 분기된 부모 누적과 원본 보존 / 입력과 점수 경계 / 이름·관계·깊이·사건 수 상한과 long 누적
- 독립 사례(손계산): `[["leaf", "root", "mid"], [["leaf", "mid"], ["mid", "root"]], ["leaf", "root", "leaf"], [17, -4, -6]]` → `["11", "7", "11"]`. leaf와mid는17-6=11, root는11-4=7이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/problem/TreeProblem04.java (SHA-256 c09e4ad626671b7cf938ff72aeb2f7acdcab71a491872e41e0016151895169b6); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/solution/TreeSolution04.java (SHA-256 1c353cd69d1142f3516ad22e179287089aa4aa66a121a7cc34c5a0dd02925acb); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/tree/test/TreeSolution04Test.java (SHA-256 2a83d767003f5f7f38b6b8bc93cdc24d35fd1d425b1ce4769475a7f4a0375e2a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/tree/TreeGuide.java (SHA-256 eac769fe309d2cb1f207df53062c9956a85b1fe5ea28fc7a2a76a15c0e641e9a)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SET-01 체험 보드의 서로 다른 배지 채우기

ID: `quest-java-bridge-set-01` / order 33 / L1

- MVP 이유: 원본 Algorithm Bridge의 체험 보드의 서로 다른 배지 채우기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 중복 제거와 선택 가능한 수를 구분한다.
- 선수: `algo-hash-map-set` / algo.set-collection
- 발견 단서: - 같은 코드가 여러 번 나오면 보드에는 몇 개를 놓을 수 있는가? - 서로 다른 코드 수와 slotLimit 중 어느 값이 채운 칸 수의 한계가 되는가? - 빈 칸 수는 slotLimit와 채운 칸 수로 어떻게 구할 수 있는가? - 배지 코드가 음수나 0이어도 HashSet에 넣을 수 있는가?
- 새 A: 모든 배지 코드를 집합에 넣고, 고유 개수와 보드 칸 수 중 작은 값만큼 채운 뒤 채운 칸과 빈 칸을 반환한다.
- 재사용 A: - HashSet은 같은 코드를 여러 번 넣어도 한 번만 보관한다. - set.size()로 서로 다른 배지 코드의 개수를 바로 알 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 중복 제거와 선택 가능한 수를 구분한다. 배지 개수를 고유 종류 수로 사용하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-09의 첫 등장 배열과 달리 순서나값목록이아닌 고유종류와용량의두 수가목표다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 배지 개수를 고유 종류 수로 사용하기.
- 잡을 오답: 배지 개수를 고유 종류 수로 사용하기
- 공개 검증: 중복 배지와 남는 칸 및 원본 보존 / 배지와 슬롯 경계 / 길이 1과 슬롯 상한 / 최대 길이에서 1,000가지 중 940칸 채우기
- 독립 사례(손계산): `[[17, 17, 6, 31, 6], 2]` → `[2, 0]`. 고유3종이지만두 칸에2개만놓아빈칸0이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/problem/SetProblem01.java (SHA-256 7e3a3eefa727980baffde71f8545b9784a0159a2f1ef5bd05b8b4ed6f73d94c1); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/solution/SetSolution01.java (SHA-256 06908597c6ec606ca960ce630fd13bad3443c81af723317c0e21b25559c090c8); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/set/test/SetSolution01Test.java (SHA-256 436c2eebea27bf133629026c2130bbacaf87b566afa970c9700051e10984ed1a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/SetGuide.java (SHA-256 6e966d48c15d98903eed7bcbb59d190b1e60631923b574e5eec6d572b6d73b19)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SET-02 순환 점검 기록의 첫 오류

ID: `quest-java-bridge-set-02` / order 34 / L3

- MVP 이유: 원본 Algorithm Bridge의 순환 점검 기록의 첫 오류 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 집합과 순서 조건, 첫 실패 계산을 연결한다. 단어 게임은 쓰지 않는다.
- 선수: `algo-hash-map-set` / algo.set-collection
- 발견 단서: - 이미 나온 코드인지 빠르게 확인하려면 무엇을 기억해야 하는가? - 첫 번째 기록에도 앞 코드와의 차이 규칙을 적용해야 하는가? - 중복과 간격 오류가 여러 번 나오면 어느 기록만 반환해야 하는가? - 배열 인덱스 i를 1부터 세는 점검자 번호로 어떻게 바꿀 수 있는가? - 코드 차이가 allowedGap와 정확히 같으면 올바른가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - HashSet의 add()는 처음 본 값이면 true, 이미 있으면 false를 반환한다. - 배열을 앞에서부터 한 번만 확인하면 첫 오류에서 바로 멈출 수 있다.
- 새 E: 기록을 앞에서부터 보며 이미 본 코드와 앞 코드와의 간격을 확인하고, 처음 어긴 인덱스를 점검자 번호로 바꿔 코드와 함께 반환한다.
- C: 집합과 순서 조건, 첫 실패 계산을 연결한다. 단어 게임은 쓰지 않는다. 이미 나온 코드여도 인접 차이만 맞으면 통과시키기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-01의 짝 발견과 달리 고유성·인접차이·담당자순환 번호를 첫 실패에 결합한다.
- 지원: 원본 힌트 1개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 이미 나온 코드여도 인접 차이만 맞으면 통과시키기.
- 잡을 오답: 이미 나온 코드여도 인접 차이만 맞으면 통과시키기
- 공개 검증: 모든 기록이 올바르고 원본 보존 / 첫 오류와 입력 경계 / 점검자 940명이 한 바퀴 돈 뒤 담당 번호 / 최대 길이의 고유 연속 기록
- 독립 사례(손계산): `[[17, 21, 24, 17, 25], 2, 7]` → `[2, 17]`. 앞세 값은차이4,3으로정상; 네 번째17은차이7이지만중복이므로2번담당오류다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/problem/SetProblem02.java (SHA-256 e7f328595042902bdf622e0dc588ee476979294772eda9df5247ec5265ed655f); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/solution/SetSolution02.java (SHA-256 21861535cbd640851f1244526df99cb84a229deaa165aff7f48678b965fbb26e); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/set/test/SetSolution02Test.java (SHA-256 df908e8c449390f51cb7a99e63ed1ef59000b83449908492f3b1e28ea5980955); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/SetGuide.java (SHA-256 6e966d48c15d98903eed7bcbb59d190b1e60631923b574e5eec6d572b6d73b19)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SET-03 연결 뒤 남은 작업 구역 수

ID: `quest-java-bridge-set-03` / order 35 / L1

- MVP 이유: 원본 Algorithm Bridge의 연결 뒤 남은 작업 구역 수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 유니온-파인드의 최소 골격을 익힌다.
- 선수: `algo-09-tree` / algo.tree
- 발견 단서: - 처음에는 작업대마다 대표가 누구이며 구역은 몇 개인가? - 작업대 두 개가 이미 같은 구역인지 무엇을 비교해 알 수 있는가? - 연결할 때 작업대 자체와 최종 대표 중 무엇을 이어야 하는가? - 같은 구역을 다시 연결할 때 구역 수를 줄여도 되는가?
- 새 A: 각 작업대를 자기 대표로 시작하고, 연결마다 두 최종 대표가 다를 때만 합쳐 구역 수를 줄인 뒤 남은 구역 수를 반환한다.
- 재사용 A: - 유니온-파인드는 각 작업대의 최종 대표를 찾아 연결된 그룹을 관리한다. - 경로 압축과 큰 그룹 아래 붙이기를 사용하면 많은 연결도 빠르게 처리할 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 유니온-파인드의 최소 골격을 익힌다. 이미 같은 구역인 두 작업대를 이을 때도 구역 수를 줄이기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: SET-01의 값중복과달리 연결의추이성을 대표 사슬로표현하며 중복·자기연결은구역수를바꾸지않는다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 이미 같은 구역인 두 작업대를 이을 때도 구역 수를 줄이기.
- 잡을 오답: 이미 같은 구역인 두 작업대를 이을 때도 구역 수를 줄이기
- 공개 검증: 세 연결로 세 구역 남기기와 원본 보존 / 연결 모양과 개수 경계 / 작업대 0·940·999를 한 구역으로 연결 / 최대 작업대와 연결 수의 긴 연결
- 독립 사례(손계산): `[7, [[5, 3], [3, 1], [5, 1], [6, 6], [0, 2]]]` → `4`. 실제합침은5-3,3-1,0-2의3번뿐이라7-3=4구역이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 연결 교안은 실제 트리의 부모 사슬에 대한 선수 관계다. 유니온-파인드 교안을 완성했다고 주장하지 않는다. 원본 SetGuide의 연결 그룹 개념만 도입하며 SET-04의 풀이 순서는 제공하지 않는다. / 총괄 허용: 실제 tree 부모 사슬을 선수로 연결하고 원본 SetGuide 기반 문제 내 최소 도입을 제공한다. 연결 교안 자체는 유니온-파인드를 설명하지 않는다고 instructions에서 명시한다. 전용 concept 신설/HashSet 동등매핑/교안 재작성 금지. SET-04 L4 풀이 힌트0 유지.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/problem/SetProblem03.java (SHA-256 e23fe047e23ff8e2fe8da8c6a6bee25a3aba356b04298f60a5bf37f46639b864); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/solution/SetSolution03.java (SHA-256 6fa844d7ec727b4f9451c625124e1461b6968a1e0fcea585e75d08ef9bc3a1e7); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/set/test/SetSolution03Test.java (SHA-256 6087e61bd3ebec75bc131b12d828ec9d66829a172d45e1891e9314461c58c398); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/SetGuide.java (SHA-256 6e966d48c15d98903eed7bcbb59d190b1e60631923b574e5eec6d572b6d73b19)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SET-04 장비 연결 감사의 실패 요청 찾기

ID: `quest-java-bridge-set-04` / order 36 / L4

- MVP 이유: 원본 Algorithm Bridge의 장비 연결 감사의 실패 요청 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 연산 종류를 판별하고 항상 최종 대표를 비교한다. 책과 같은 숫자 명령·반환 계약은 쓰지 않는다.
- 선수: `algo-09-tree` / algo.tree
- 발견 단서: - 뒤에 나오는 LINK를 앞선 AUDIT보다 먼저 적용해도 되는가? - 두 장비의 바로 위 부모만 같으면 같은 그룹이라고 판단해도 되는가? - 같은 그룹을 다시 LINK할 때 그룹 수나 크기가 또 바뀌어도 되는가? - 결과에 기록하는 번호는 AUDIT만 센 번호인가, 모든 요청을 센 번호인가? - 실패 개수를 미리 모를 때 최대 크기의 배열과 실제 개수를 어떻게 함께 사용할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 유니온-파인드는 연결 요청과 같은 그룹 확인이 반복될 때 전체 그룹을 매번 다시 찾지 않는다. - find()에서 지나온 부모를 최종 대표로 바꾸면 같은 경로를 다시 확인하는 시간이 줄어든다.
- 새 E: 별도 새 E 주장 없음
- C: 연산 종류를 판별하고 항상 최종 대표를 비교한다. 책과 같은 숫자 명령·반환 계약은 쓰지 않는다. 실패 요청 번호를0부터 반환하기를 허용하지 않는 계약이다.
- T: SET-03의 최종개수에서 과거시점의조회와연결을순서대로섞고 실패요청번호만남기는무힌트기회다.
- 기존 경험과 차이: SET-03의 최종개수에서 과거시점의조회와연결을순서대로섞고 실패요청번호만남기는무힌트기회다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 실패 요청 번호를0부터 반환하기.
- 잡을 오답: 실패 요청 번호를0부터 반환하기
- 공개 검증: 요청 시점에 따른 실패 1·5와 원본 보존 / 요청 종류와 번호 경계 / 장비 0·940 연결 뒤 999 감사 실패와 원본 보존 / 최대 장비와 요청 수에서 압축된 연결 감사
- 독립 사례(손계산): `[4, ["AUDIT", "LINK", "AUDIT", "LINK", "AUDIT"], [0, 0, 0, 1, 0], [2, 1, 2, 2, 2]]` → `[1, 3]`. 처음과세 번째요청시0과2는다른그룹; 마지막은0-1-2가이어져성공한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 연결 교안은 실제 트리의 부모 사슬에 대한 선수 관계다. 유니온-파인드 교안을 완성했다고 주장하지 않는다. 원본 SetGuide의 연결 그룹 개념만 도입하며 SET-04의 풀이 순서는 제공하지 않는다. / 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다. / 총괄 허용: 실제 tree 부모 사슬을 선수로 연결하고 원본 SetGuide 기반 문제 내 최소 도입을 제공한다. 연결 교안 자체는 유니온-파인드를 설명하지 않는다고 instructions에서 명시한다. 전용 concept 신설/HashSet 동등매핑/교안 재작성 금지. SET-04 L4 풀이 힌트0 유지.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/problem/SetProblem04.java (SHA-256 730aeec66773a329646ce27827d322fccfce689b6b89b10e486aaf1caf55c97e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/solution/SetSolution04.java (SHA-256 9aa305e8ebac0453f50f7b9170efda17d489deefc229cb3aac9589a95221b413); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/set/test/SetSolution04Test.java (SHA-256 a5f143c24176167d8067b8aba7eedeba9aa0131f2c8daabe09517f30ff0f1026); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/set/SetGuide.java (SHA-256 6e966d48c15d98903eed7bcbb59d190b1e60631923b574e5eec6d572b6d73b19)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-01 단방향 연락망의 도달 요약

ID: `quest-java-bridge-gra-01` / order 37 / L1

- MVP 이유: 원본 Algorithm Bridge의 단방향 연락망의 도달 요약 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 표준 DFS 골격을 순회 순서 반환이 아닌 다른 목표에 사용한다.
- 선수: `js-13-bfs-dfs` / algo.graph-representation, algo.dfs
- 발견 단서: - 각 지점에서 바로 갈 수 있는 지점을 빠르게 찾으려면 간선을 어떤 모양으로 저장해야 하는가? - 같은 지점으로 돌아오는 연결이나 중복 연결이 있을 때 값을 여러 번 더하지 않으려면 무엇을 기억해야 하는가? - 지점 번호가 1부터 시작할 때 nodeValues의 인덱스로는 어떻게 바꾸는가? - 지점이 일렬로 100,000개 이어져도 안전하게 탐색하려면 재귀 대신 무엇을 사용할 수 있는가?
- 새 A: 단방향 간선을 인접 리스트에 담은 뒤, 출발 지점을 방문 표시하고 스택으로 도달한 지점을 한 번씩 확인해 개수와 값의 합을 반환한다.
- 재사용 A: - 인접 리스트는 현재 지점에서 갈 수 있는 이웃만 바로 확인하게 해 준다. - 반복 DFS는 도달 가능한 지점을 모두 찾으면서 Java 호출 스택을 사용하지 않는다. - 스택에 넣을 때 방문을 표시하면 같은 지점이 중복으로 쌓이지 않는다.
- 새 E: 별도 새 E 주장 없음
- C: 표준 DFS 골격을 순회 순서 반환이 아닌 다른 목표에 사용한다. 단방향 연락을 양방향으로 해석하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: TRE-01의 자식구조와달리 순환·중복·방향있는연결에서한번만포함할상태가필요하다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 단방향 연락을 양방향으로 해석하기.
- 잡을 오답: 단방향 연락을 양방향으로 해석하기
- 공개 검증: 일반 단방향 도달·고립 정점과 원본 보존 / 값·간선·방향 경계 / 정점·간선 상한과 long 누적
- 독립 사례(손계산): `[[17, -6, 31, 4], [[2, 1], [2, 3], [3, 2], [3, 3], [4, 2]], 2]` → `["3", "42"]`. 2에서1,3에가지만4로는갈수없어3개,합17-6+31=42이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem01.java (SHA-256 8afc3024d08ee6ed80c0261a01ee51b9dbf1167fd841d76078688c40210ac7d0); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution01.java (SHA-256 960030c0ef0b5ee52fa27048fbe72cbe5cb0155351bf3fe524c4dc44158d823f); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution01Test.java (SHA-256 793226625a823d77a3a3db0980870a8980c83149ae1250a433acb7f7303fcb95); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-02 양방향 통로의 최소 이동 횟수

ID: `quest-java-bridge-gra-02` / order 38 / L2

- MVP 이유: 원본 Algorithm Bridge의 양방향 통로의 최소 이동 횟수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 넣을 때 방문하는 이유와 동일 비용 최단 거리를 익힌다.
- 선수: `js-13-bfs-dfs` / algo.graph-representation, algo.bfs
- 발견 단서: - 간선 하나를 양방향 인접 리스트에 넣으려면 어느 두 목록을 고쳐야 하는가? - 통로 하나를 지날 때마다 거리가 1 늘어난다면 가까운 거리부터 확인하는 도구는 무엇인가? - 같은 지점이 큐에 여러 번 들어가지 않게 하려면 언제 거리를 기록해야 하는가? - 간선 입력 순서가 달라져도 최소 거리는 같아야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - BFS는 출발점에서 0칸, 1칸, 2칸 떨어진 지점 순서로 확인한다. - 따라서 한 지점의 거리를 처음 기록할 때가 그 지점까지의 최소 거리다.
- 새 E: 별도 새 E 주장 없음
- C: 넣을 때 방문하는 이유와 동일 비용 최단 거리를 익힌다. 도달할 수 없는 지점 거리를0으로 표시하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRA-01의 도달합계에서 동일비용의최소거리·도달불가표시로결과를바꾼다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 도달할 수 없는 지점 거리를0으로 표시하기.
- 잡을 오답: 도달할 수 없는 지점 거리를0으로 표시하기
- 공개 검증: 여러 경로 중 최소 거리와 원본 보존 / 간선 모양과 시작점 경계 / 중간 거리 940 / 정점·간선 상한과 최대 일렬 거리
- 독립 사례(손계산): `[5, [[3, 1], [1, 2], [3, 4], [4, 2], [3, 3]], 3]` → `[1, 2, 0, 1, -1]`. 3에서1,4는1통로;2는2통로;5는고립이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem02.java (SHA-256 266dc94cac8e0811d5c9bda8fc6af450c721156bd66f1deda40d5e3d8d814c5a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution02.java (SHA-256 228c8eb416c3de48434ca63a3856bc1651457b7ec4ca753ebdeb27b90ff345be); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution02Test.java (SHA-256 846c78ca622a8cc45107107ab8f7f5d8e4d437f453d3cf53d3ec671874b6d16b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-03 창고 칸별 최소 이동표

ID: `quest-java-bridge-gra-03` / order 39 / L3

- MVP 이유: 원본 Algorithm Bridge의 창고 칸별 최소 이동표 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 암시적 이웃과 도달 불가능 처리를 연결한다.
- 선수: `js-13-bfs-dfs` / algo.bfs, algo.grid-traversal
- 발견 단서: - 다음 칸을 읽기 전에 어떤 두 범위를 먼저 확인해야 하는가? - 벽과 아직 도달하지 못한 빈 칸을 결과에서 어떻게 구분할 것인가? - 한 칸까지의 최소 거리를 처음 확정할 수 있는 때는 언제인가? - 입력 grid를 거리표로 고쳐 써도 되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - BFS는 시작 칸에서 같은 이동 횟수만큼 떨어진 칸을 묶어 확인한다. - 거리표의 -1은 방문 여부도 함께 나타내므로 별도 boolean 배열이 필요 없다.
- 새 E: 벽과 미도달 칸을 구분한 거리표를 만든 뒤, 시작 칸을 큐에 넣고 네 방향의 범위 안 빈 칸에 현재 거리보다 1 큰 값을 처음 한 번만 기록해 반환한다.
- C: 암시적 이웃과 도달 불가능 처리를 연결한다. 벽과 도달할 수 없는 빈 칸을 같은 값으로 표시하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRA-02의 명시간선에서 격자좌표이웃을만들고 벽과미도달을서로다른값으로표현한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 벽과 도달할 수 없는 빈 칸을 같은 값으로 표시하기.
- 잡을 오답: 벽과 도달할 수 없는 빈 칸을 같은 값으로 표시하기
- 공개 검증: 벽을 돌아가는 거리표와 원본 보존 / 격자와 시작 위치 경계 / 한 행의 첫 위치와 마지막 위치 거리 / 행·열과 전체 칸 수 상한
- 독립 사례(손계산): `[[[0, 1, 0], [0, 1, 0]], 1, 0]` → `[[1, -2, -1], [0, -2, -1]]`. 왼쪽두칸만이어지며가운데는벽,오른쪽은열려있지만도달불가다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem03.java (SHA-256 d43b0d2f08349d581fa7e63a349b649af4c495b65787206e72a12fc06b0dc8c3); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution03.java (SHA-256 d9dc5e0d7560d4add8bf75239f9315154131695c150620d0895b47a64548bc9b); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution03Test.java (SHA-256 42d8936a8e49ec4cb353c5eb4d222ab033cad33a6304aedd82a80adeaabf39cb); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-04 각 장치가 속한 연결 묶음 크기

ID: `quest-java-bridge-gra-04` / order 40 / L3

- MVP 이유: 원본 Algorithm Bridge의 각 장치가 속한 연결 묶음 크기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 한 번의 탐색과 바깥 반복을 연결한다.
- 선수: `js-13-bfs-dfs` / algo.graph-representation, algo.dfs
- 발견 단서: - 한 번의 탐색으로 찾은 장치들을 같은 묶음으로 기억하려면 무엇을 모아야 하는가? - 아직 어떤 묶음에도 들어가지 않은 장치를 빠뜨리지 않으려면 탐색 밖에서 무엇을 반복해야 하는가? - 묶음의 장치를 모두 찾기 전에도 각 장치에 최종 크기를 쓸 수 있는가? - 연결이 하나도 없는 장치의 묶음 크기는 얼마인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 바깥 반복으로 미방문 장치를 찾고 DFS를 시작하면 모든 연결 묶음을 빠짐없이 찾는다. - 탐색 중 구성원을 모아 두면 크기를 안 뒤 각 구성원의 결과 칸에 같은 값을 쓸 수 있다.
- 새 E: 모든 장치를 번호순으로 확인하고, 아직 방문하지 않은 장치에서 탐색해 같은 묶음의 장치를 모은 뒤 그 장치들의 결과 칸에 묶음 크기를 저장해 반환한다.
- C: 한 번의 탐색과 바깥 반복을 연결한다. 첫 연결 묶음만 계산하고 고립 장치를0으로 남기기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRA-01의 시작점하나도달에서 모든미방문지점으로탐색을확장하고완성된묶음크기를각구성원에돌려준다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 첫 연결 묶음만 계산하고 고립 장치를0으로 남기기.
- 잡을 오답: 첫 연결 묶음만 계산하고 고립 장치를0으로 남기기
- 공개 검증: 여러 연결 묶음과 원본 보존 / 고립·중복·자기 간선 / 중간 정점 수 940과 간선 없음 / 정점·간선 상한의 하나로 이어진 묶음
- 독립 사례(손계산): `[6, [[2, 4], [4, 6], [2, 4], [3, 3]]]` → `[1, 3, 1, 3, 1, 3]`. 2,4,6은크기3;1,3,5는각고립크기1이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem04.java (SHA-256 fe009181fca881cc2d61ac8b63e8c0d0b833d4049d7990d00723bf94a53b1e91); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution04.java (SHA-256 4978d3b967a4bb4c2a21702461e6777484671e76ad77958165afbb16618bb26f); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution04Test.java (SHA-256 06ca1315dc6f5ea94ceec28e26f172b3e0613a7c959a6cf25b4c5edf4ef5f89c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-05 필수 점검소를 거친 목적지별 거리

ID: `quest-java-bridge-gra-05` / order 41 / L4

- MVP 이유: 원본 Algorithm Bridge의 필수 점검소를 거친 목적지별 거리 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 하나의 요구를 독립 탐색 두 번으로 분해한다. 미로 표식 구조는 쓰지 않는다.
- 선수: `js-13-bfs-dfs` / algo.graph-representation, algo.bfs
- 발견 단서: - 점검소를 지나지 않은 더 짧은 길을 답으로 사용할 수 있는가? - 길이 단방향이면 먼저 지나온 장소를 점검소 뒤에도 다시 갈 수 있다고 가정해도 되는가? - 목적지가 여러 개일 때 결과는 어떤 순서를 따라야 하는가? - 출발점과 점검소가 같은 번호라면 점검소까지 지나는 길은 몇 개인가? - 조건에 맞는 이동이 불가능한 목적지에는 어떤 값을 반환해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 전체 이동은 출발점→점검소와 점검소→목적지 두 구간으로 정확히 나뉜다. - 각 길의 비용이 1이므로 두 구간의 최소 거리는 각각 BFS로 구할 수 있다. - 점검소에서 한 번 BFS하면 모든 목적지의 둘째 구간 거리를 바로 읽을 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 하나의 요구를 독립 탐색 두 번으로 분해한다. 미로 표식 구조는 쓰지 않는다. 점검소에서 목적지까지의 거리 대신 출발점 거리를 더하기를 허용하지 않는 계약이다.
- T: GRA-02의 한번최단거리에서 필수중간점을경유하는두거리연결과목적지순서복원으로전이한다.
- 기존 경험과 차이: GRA-02의 한번최단거리에서 필수중간점을경유하는두거리연결과목적지순서복원으로전이한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 점검소에서 목적지까지의 거리 대신 출발점 거리를 더하기.
- 잡을 오답: 점검소에서 목적지까지의 거리 대신 출발점 거리를 더하기
- 공개 검증: 점검소 이후 여러 목적지와 원본 보존 / 경유지와 목적지 경계 / 거리 940·중복 목적지와 자기 간선 / 정점·간선 상한과 최대 일렬 거리
- 독립 사례(손계산): `[5, [[1, 2], [2, 3], [1, 4], [3, 4]], 1, 3, [4, 2, 3, 4]]` → `[3, -1, 2, 3]`. 필수3까지2통로;4까지추가1,2로돌아갈길없고3자체추가0이며중복4도보존한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem05.java (SHA-256 b8f6a410a5504b310b68bb52e3f1c175fee62299e4a44962387e574c6c632c20); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution05.java (SHA-256 fff369dc941bc284a2ede77e19e9572d2cb2290be99f59884d0de13ad580fca6); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution05Test.java (SHA-256 9123cfe3a1e0550c7427b3c4eac262dd1347437821f6207ec5f0fe14d1c9b73c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRA-06 비상 상자가 양쪽에 남는 통로 수

ID: `quest-java-bridge-gra-06` / order 42 / L4

- MVP 이유: 원본 Algorithm Bridge의 비상 상자가 양쪽에 남는 통로 수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 방문만 하는 DFS에서 결과를 부모로 올리는 후위 DFS로 전이한다.
- 선수: `js-13-bfs-dfs` / algo.graph-representation, algo.dfs
- 발견 단서: - 통로 하나를 막으면 트리는 몇 개의 연결 묶음으로 나뉘는가? - 조건을 만족하려면 나뉜 두 묶음에 각각 무엇이 하나 이상 있어야 하는가? - 비상 상자가 없는 구역도 두 구역을 잇는 연결 경로의 일부가 될 수 있는가? - 비상 상자가 0개이거나 1개뿐이면 조건을 만족하는 통로가 있을 수 있는가? - 구역이 100,000개일 때 확인해야 할 통로는 몇 개인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 반복 DFS의 방문 순서를 거꾸로 읽으면 자식 계산이 부모 계산보다 먼저 끝난다. - 자식 아래의 상자 수를 부모에게 더하면 통로를 실제로 끊지 않고 모든 경계를 한 번씩 판단한다.
- 새 E: 별도 새 E 주장 없음
- C: 방문만 하는 DFS에서 결과를 부모로 올리는 후위 DFS로 전이한다. 한쪽에 상자가 있으면 반대쪽 확인 없이 통로를 세기를 허용하지 않는 계약이다.
- T: GRA-04의 묶음크기와달리 트리자식의상자수를부모로올려 전체상자수와보완관계를비교한다.
- 기존 경험과 차이: GRA-04의 묶음크기와달리 트리자식의상자수를부모로올려 전체상자수와보완관계를비교한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 한쪽에 상자가 있으면 반대쪽 확인 없이 통로를 세기.
- 잡을 오답: 한쪽에 상자가 있으면 반대쪽 확인 없이 통로를 세기
- 공개 검증: 여러 분기의 양쪽 상자와 원본 보존 / 트리 모양과 상자 위치 경계 / 정점·깊이·상자 수 상한
- 독립 사례(손계산): `[6, [[1, 2], [2, 3], [2, 4], [4, 5], [4, 6]], [3, 5]]` → `3`. 두상자가갈라지는통로는2-3,2-4,4-5의3개다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/problem/GraphProblem06.java (SHA-256 7e4309da3136e7172f85540615eb6787254e3200d66bec412b234e7e56c27dbf); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/solution/GraphSolution06.java (SHA-256 34c1b0a0f0586be36d54590118bc643693421e729ec7423186968d44510a0dbe); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/graph/test/GraphSolution06Test.java (SHA-256 a836bc6ef5947890b28d5e3ad85b2f3a0003951a98e67502cde8546a6a0191c7); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/graph/GraphGuide.java (SHA-256 5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## BKT-01 선택 점수의 모든 합

ID: `quest-java-bridge-bkt-01` / order 43 / L1

- MVP 이유: 원본 Algorithm Bridge의 선택 점수의 모든 합 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 되돌아온 뒤 상태를 원래대로 돌리는 기본 흐름을 익힌다.
- 선수: `js-12-brute-force-backtracking` / algo.backtracking
- 발견 단서: - 한 위치에서 만들 수 있는 두 선택은 무엇인가? - 모든 위치를 확인했다는 사실은 어떤 값으로 알 수 있는가? - 선택한 값을 다음 깊이에서 사용하려면 어디에 담아야 하는가? - 재귀가 돌아온 뒤 다음 경우를 확인하기 전에 무엇을 지워야 하는가?
- 새 A: 현재 점수를 선택하고 재귀한 뒤 그 선택을 지우고, 같은 위치를 선택하지 않은 가지까지 확인해 모든 합을 반환한다.
- 재사용 A: - 한 선택 뒤에 다음 위치에서도 같은 두 선택을 반복하므로 재귀로 깊이를 옮길 수 있다. - 선택 목록에 값을 넣고 재귀한 뒤 지우면 같은 목록을 다음 가지에서도 다시 쓸 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 되돌아온 뒤 상태를 원래대로 돌리는 기본 흐름을 익힌다. 재귀 분기에서 선택한 값을 되돌리지 않기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-10의두위치쌍에서각위치선택/미선택의전체분기와복귀후상태복원을처음작성한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 재귀 분기에서 선택한 값을 되돌리지 않기.
- 잡을 오답: 재귀 분기에서 선택한 값을 되돌리지 않기
- 공개 검증: 선택 순서와 값 경계 / 최대 길이의 모든 선택 수
- 독립 사례(손계산): `[[17, -6, 17]]` → `[28, 11, 34, 17, 11, -6, 17, 0]`. 선택우선순서로111,110,101,100,011,010,001,000의합이며동일합도독립선택이라보존한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/problem/BacktrackingProblem01.java (SHA-256 c4884b5ca32ba81f76536e31ffd1e06da883bb94ed2b891c815efcda2b76808c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/solution/BacktrackingSolution01.java (SHA-256 12577ed065925ce2a718e70c027bea44e0ecf40f677508be57c10b0bdba8015c); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/backtracking/test/BacktrackingSolution01Test.java (SHA-256 8c4ce22743501a432630575fb3f060ecc369aec793595f58451fc13dd5885245); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/BacktrackingGuide.java (SHA-256 35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## BKT-02 곱으로 잠금 번호 만들기

ID: `quest-java-bridge-bkt-02` / order 44 / L2

- MVP 이유: 원본 Algorithm Bridge의 곱으로 잠금 번호 만들기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 순서만 다른 중복을 막고 가지치기한다. 합 10 계약은 쓰지 않는다.
- 선수: `js-12-brute-force-backtracking` / algo.backtracking
- 발견 단서: - 같은 카드 조합의 순서만 바뀐 결과를 다시 세지 않으려면 다음 확인을 어디서 시작해야 하는가? - 현재 곱이 target과 같아지면 무엇을 반환해야 하는가? - 모든 카드 값이 2 이상일 때 현재 곱이 target을 넘으면 뒤를 더 볼 필요가 있는가? - 다음 카드를 곱하기 전에 int 범위를 넘지 않으면서 target 초과를 어떻게 확인할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 다음 시작 위치를 넘기면 앞 카드를 다시 골라 순서만 다른 중복을 만들지 않는다. - 곱이 target을 넘기 전에 가지를 건너뛰면 필요 없는 선택을 줄일 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 순서만 다른 중복을 막고 가지치기한다. 합 10 계약은 쓰지 않는다. 같은 카드 조합을 고른 순서마다 다시 세기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: BKT-01의전체합나열에서양수곱목표·한번사용·순서중복제거라는가지조건이추가된다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 같은 카드 조합을 고른 순서마다 다시 세기.
- 잡을 오답: 같은 카드 조합을 고른 순서마다 다시 세기
- 공개 검증: 카드·목표 경계와 중복 없는 조합
- 독립 사례(손계산): `[[2, 5, 7, 10, 14], 70]` → `3`. 조합은5×14,7×10,2×5×7의3개이며순열은추가하지않는다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/problem/BacktrackingProblem02.java (SHA-256 20edbfbbd5c861109688cd561d5790f60f515464811bfcec8f9e3e11c45000d6); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/solution/BacktrackingSolution02.java (SHA-256 0f30435692ce5bb7d266b79fe30302510bf2dd140222e471fc2722eed25f3b7a); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/backtracking/test/BacktrackingSolution02Test.java (SHA-256 7a6342a9408fc107fa01d28f57e37415227c1f40f64893c00d87116769379e37); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/BacktrackingGuide.java (SHA-256 35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## BKT-03 에너지 조절 장치 점검 순서

ID: `quest-java-bridge-bkt-03` / order 45 / L3

- MVP 이유: 원본 Algorithm Bridge의 에너지 조절 장치 점검 순서 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 순열과 자원 조건을 연결하되 최대 수행 수를 직접 구하지 않는다. 최댓값 비교는 BKT-05의 완성 상태 평가에서 따로 익힌다.
- 선수: `js-12-brute-force-backtracking` / algo.backtracking
- 발견 단서: - 현재 에너지가 필요 에너지 이상이어도 변화량을 더한 값이 음수라면 점검할 수 있는가? - 한 번 점검한 장치를 같은 순서에서 다시 고르지 않게 무엇을 기억해야 하는가? - 가능한 순서 중 가장 앞선 순서를 얻으려면 후보를 어떤 번호부터 확인해야 하는가? - 모든 장치를 점검한 순간 현재 순서를 왜 복사해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - visited 배열은 현재 순서에서 이미 점검한 장치를 막는다. - 낮은 번호부터 재귀로 확인하고 첫 완성에서 멈추면 사전식 첫 순서가 된다.
- 새 E: 낮은 번호부터 아직 점검하지 않은 장치를 골라 에너지를 바꿔 재귀하고, 모든 장치를 점검한 첫 순서를 복사해 반환하며 실패한 선택은 취소한다.
- C: 순열과 자원 조건을 연결하되 최대 수행 수를 직접 구하지 않는다. 최댓값 비교는 BKT-05의 완성 상태 평가에서 따로 익힌다. 점검 후 에너지가 음수가 되는 순서를 허용하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: BKT-02의순서없는조합에서 순서에따른에너지변화와되돌리기·사전식첫완성조건이추가된다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 점검 후 에너지가 음수가 되는 순서를 허용하기.
- 잡을 오답: 점검 후 에너지가 음수가 되는 순서를 허용하기
- 공개 검증: 에너지 경계와 첫 실행 순서 / 최대 장치 수의 사전식 첫 순서
- 독립 사례(손계산): `[4, [3, 6, 2], [-4, 1, 4]]` → `[3, 2, 1]`. 1은4→0으로막힘,2는처음요구6미달.3으로4→8;다음1은8→4뒤2가불가이므로되돌려3→2→1의8→9→5로완성한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/problem/BacktrackingProblem03.java (SHA-256 a05f954c77290a70a692a9d8e2869529aef8b79a425fd3ec92aa7b2c19ee6a3c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/solution/BacktrackingSolution03.java (SHA-256 5ed791d25aa8dff4f519aa3150c603727089f629d1fb2100eca40422baf84f98); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/backtracking/test/BacktrackingSolution03Test.java (SHA-256 dfa72679229d7f8b55584a9277de59abcbd3ea29b5a720c177020a6d55045610); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/BacktrackingGuide.java (SHA-256 35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## BKT-04 담당자와 도구가 겹치지 않는 일정

ID: `quest-java-bridge-bkt-04` / order 46 / L3

- MVP 이유: 원본 Algorithm Bridge의 담당자와 도구가 겹치지 않는 일정 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 고정 깊이와 동시에 여러 충돌 조건을 관리한다. 퀸의 세 충돌을 그대로 쓰지 않는다.
- 선수: `js-12-brute-force-backtracking` / algo.backtracking
- 발견 단서: - 재귀 깊이 하나를 날짜 하나로 보면 언제 전체 일정이 완성되는가? - 현재 후보의 담당자와 도구를 각각 어디에 사용 중이라고 표시할 수 있는가? - 담당자는 비어 있지만 도구가 이미 사용 중이면 이 후보를 고를 수 있는가? - 한 후보로 남은 날짜를 배정하지 못하고 돌아오면 어떤 두 표시를 지워야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 담당자와 도구의 사용 여부를 각각 표시하면 두 중복 조건을 바로 확인할 수 있다. - 한 후보가 실패했을 때 두 표시를 지우고 다음 후보를 보면 가능한 모든 일정을 확인할 수 있다.
- 새 E: 날짜마다 담당자와 도구가 모두 비어 있는 후보 하나를 표시해 다음 날짜로 이동하고, 실패해 돌아오면 두 표시를 지워 전체 일정 가능 여부를 반환한다.
- C: 고정 깊이와 동시에 여러 충돌 조건을 관리한다. 퀸의 세 충돌을 그대로 쓰지 않는다. 담당자가 다르면 도구가 같아도 배정하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: BKT-03의자원값하나에서 날짜깊이별담당자와도구라는독립중복상태둘을함께복원한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 담당자가 다르면 도구가 같아도 배정하기.
- 잡을 오답: 담당자가 다르면 도구가 같아도 배정하기
- 공개 검증: 충돌 조건과 ID 경계 / 최대 날짜와 후보 수
- 독립 사례(손계산): `[[[17, 31], [17, 6], [31, 4]], [[4, 9], [9, 7], [7, 4]]]` → `true`. 날짜별후보1,1,1(0기반)에서담당31,6,4와도구9,7,4가각각고유하다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/problem/BacktrackingProblem04.java (SHA-256 6f0a385fd95f3b7d4a885b8d5ed8edb2407e6138ffae315ce5589886c0f5a5f4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/solution/BacktrackingSolution04.java (SHA-256 a11f03d093d52875d718b0f6ee4903052622c68f294a2326c54872f88aaac426); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/backtracking/test/BacktrackingSolution04Test.java (SHA-256 bc173623e24c0ccebf36a20fb9754a791372ee720d330c9322e3f33272103470); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/BacktrackingGuide.java (SHA-256 35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## BKT-05 프로젝트 연습 시간 배분

ID: `quest-java-bridge-bkt-05` / order 47 / L4

- MVP 이유: 원본 Algorithm Bridge의 프로젝트 연습 시간 배분 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 남은 자원, 완성 채점, 동점 규칙을 스스로 조합한다. 과녁 구조는 쓰지 않는다.
- 선수: `js-12-brute-force-backtracking` / algo.backtracking
- 발견 단서: - 한 프로젝트에 배정할 수 있는 시간 후보의 시작과 끝은 어디인가? - 다음 프로젝트로 이동할 때 남은 시간과 현재 점수는 어떻게 바뀌는가? - 모든 프로젝트의 배정을 마쳤는지 어떤 값으로 알 수 있는가? - 최고 점수가 같은 두 배열은 어떤 순서로 비교해야 하는가? - 더 좋은 배열을 찾았을 때 현재 배정 배열을 그대로 저장하면 이후 탐색에서 어떻게 되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - 한 프로젝트의 시간 후보를 하나 골라 다음 프로젝트로 이동하면 가능한 배정을 모두 확인할 수 있다. - 완성된 배정만 최고 결과와 비교하고 clone()으로 복사하면 이후 탐색의 변경에서 답을 지킬 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 남은 자원, 완성 채점, 동점 규칙을 스스로 조합한다. 과녁 구조는 쓰지 않는다. 점수와 사용 시간이 같을 때 사전식으로 더 큰 배정을 고르기를 허용하지 않는 계약이다.
- T: BKT-03의첫완성에서 모든완성후점수·사용시간·배열사전순의세비교로최선사본을보관한다.
- 기존 경험과 차이: BKT-03의첫완성에서 모든완성후점수·사용시간·배열사전순의세비교로최선사본을보관한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 점수와 사용 시간이 같을 때 사전식으로 더 큰 배정을 고르기.
- 잡을 오답: 점수와 사용 시간이 같을 때 사전식으로 더 큰 배정을 고르기
- 공개 검증: 점수·시간 경계와 동점 규칙 / 최대 프로젝트·후보·시간 한도
- 독립 사례(손계산): `[[[0, 5, 5], [0, 5, 10]], 2]` → `[0, 2]`. 점수10의[0,2]와[1,1]은시간2동점;첫위치가작은[0,2]를선택한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/problem/BacktrackingProblem05.java (SHA-256 493e59bd778533e3dc3e0bf4559e9e99995d801fe024fe069d65dd4a0cbbbcd7); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/solution/BacktrackingSolution05.java (SHA-256 1a18538d26a9bc0e75aa6d9b0949a8f8cd69a42de170884ceda611fd54bc04ff); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/backtracking/test/BacktrackingSolution05Test.java (SHA-256 5d80409051f511fb8435b00de5994ca7ecf1f1b4d500cf3fafc6fda21c140b70); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/backtracking/BacktrackingGuide.java (SHA-256 35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-01 반복 측정값만 정리하기

ID: `quest-java-bridge-srt-01` / order 48 / L1

- MVP 이유: 원본 Algorithm Bridge의 반복 측정값만 정리하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 비교 정렬 대신 빈도 배열을 고르는 조건을 익힌다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 측정값의 범위가 작고 정해져 있을 때 값마다 나온 횟수를 어디에 저장할 수 있는가? - 음수 측정값을 배열의 위치로 바꾸려면 어떤 값을 더해야 하는가? - 결과 배열의 길이는 언제 알 수 있는가? - 작은 값부터 결과에 담으려면 횟수 배열을 어느 방향으로 확인해야 하는가?
- 새 A: 값마다 나온 횟수를 저장하고, 최소 횟수를 만족하는 값의 결과 길이를 구한 뒤,
작은 값부터 나온 횟수만큼 새 배열에 담아 반환한다.
- 재사용 A: 제한된 값 범위의 개수 저장 → 값 순서대로 결과 복원
- 새 E: 별도 새 E 주장 없음
- C: 비교 정렬 대신 빈도 배열을 고르는 조건을 익힌다. 조건을 만족한 값을 횟수만큼 남기지 않고 한 번만 출력하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-04의값기준필터에서값범위의빈도기준을먼저계산하고출력순서를다시정한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 조건을 만족한 값을 횟수만큼 남기지 않고 한 번만 출력하기.
- 잡을 오답: 조건을 만족한 값을 횟수만큼 남기지 않고 한 번만 출력하기
- 공개 검증: 횟수 조건을 만족한 값만 정렬한다 / 최대 길이와 최소 횟수 상한을 처리한다
- 독립 사례(손계산): `[[17, -6, 17, 31, -6, 4, 17], 2]` → `[-6, -6, 17, 17, 17]`. 빈도2인-6두개와빈도3인17세개를작은값순으로반환한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem01.java (SHA-256 bbbca8790eeb3cfc962d4b6d43db49f5f1fa47eb3937d39b74f0184b69268134); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution01.java (SHA-256 d33a792e527a632e0a2b1d76a2daa337086c5272e1d78650eb63c235825c0843); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution01Test.java (SHA-256 7d3aae5889a6d73c24f4b356d02924d38cf088b22b25b6d3b854e5efd834979a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-02 두 기록에서 전체 순번의 값 찾기

ID: `quest-java-bridge-srt-02` / order 49 / L3

- MVP 이유: 원본 Algorithm Bridge의 두 기록에서 전체 순번의 값 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 두 포인터와 종료 뒤 처리를 익힌다. 합친 배열 자체가 아닌 선택 통계를 반환한다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 두 배열의 아직 확인하지 않은 값 중 가장 작은 값은 어디에 있는가? - 한 값을 선택한 뒤 어느 배열의 위치만 한 칸 옮겨야 하는가? - 한쪽 배열을 모두 확인했으면 다음 값은 어느 배열에서 골라야 하는가? - 합친 배열을 만들지 않고 몇 번째 값을 선택했는지 어떻게 기억할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 정렬된 두 흐름의 현재 값 비교 → 선택한 쪽 이동 → 한쪽이 끝나면 잔여 처리
- 새 E: 두 배열의 현재 값을 비교해 작은 쪽을 한 칸씩 이동하고, 한쪽이 끝나면 다른 쪽에서 계속 선택해 rank번째 값을 반환한다.
- C: 두 포인터와 종료 뒤 처리를 익힌다. 합친 배열 자체가 아닌 선택 통계를 반환한다. 1부터 세는 순번에서 하나 앞선 값을 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-08의복사정렬과달리이미정렬된두흐름에서필요순번까지만선택한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 1부터 세는 순번에서 하나 앞선 값을 반환하기.
- 잡을 오답: 1부터 세는 순번에서 하나 앞선 값을 반환하기
- 공개 검증: 정렬된 두 배열에서 주어진 순번의 값을 찾는다 / 두 배열 최대 길이에서 한쪽 잔여를 처리한다
- 독립 사례(손계산): `[[-6, 17, 31], [4, 17, 24], 5]` → `24`. 전체순서는-6,4,17,17,24,31이고5번째는24이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem02.java (SHA-256 9613f02b4796f9cee187ba61c0b8e856e84811921cd284ca9fe27f8ccc774625); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution02.java (SHA-256 6171d6f16abea6575baec8b83c2ee53f10cdee980c2b75bf46736748d4bf19ff); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution02Test.java (SHA-256 b5f8762b1284c77a1de11939ea502f035400b0a1cd860125b4749ea923f2f5af); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-03 검토 요청 순서 정하기

ID: `quest-java-bridge-srt-03` / order 50 / L2

- MVP 이유: 원본 Algorithm Bridge의 검토 요청 순서 정하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 동점 규칙을 빠뜨리지 않는 비교자를 익힌다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 첫 번째 정렬 기준은 어느 방향으로 비교해야 하는가? - 우선 점수가 같을 때 어떤 값을 다음으로 비교해야 하는가? - 두 점수가 모두 같을 때 입력 순서를 지키려면 비교 결과를 어떻게 해야 하는가? - ID만 따로 정렬하지 않고 같은 위치의 두 점수를 함께 확인할 방법은 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 주 기준 비교 → 같으면 보조 기준 비교 → 정렬
- 새 E: 별도 새 E 주장 없음
- C: 동점 규칙을 빠뜨리지 않는 비교자를 익힌다. 두 점수가 같을 때 입력 순서 대신 ID 사전순으로 바꾸기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-05의사전ID동점과달리 두점수가같을때원래입력순서가정답계약이다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 두 점수가 같을 때 입력 순서 대신 ID 사전순으로 바꾸기.
- 잡을 오답: 두 점수가 같을 때 입력 순서 대신 ID 사전순으로 바꾸기
- 공개 검증: 주 기준과 보조 기준으로 요청을 정렬한다 / 최대 길이의 완전 동점에서 입력 순서를 유지한다
- 독립 사례(손계산): `[["q", "p", "r"], [17, 17, 6], [4, 4, 0]]` → `["q", "p", "r"]`. q와p의두점수가같아입력순서q,p유지;우선6인r은뒤다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem03.java (SHA-256 809a8893ba3cdab87a5774713cbbfe0cb3735f981e836e7a407a395cb70f78ba); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution03.java (SHA-256 517ba2092075c22b2957cdd03647df25ffe10b7e743d81826e3b9b25cdd511cd); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution03Test.java (SHA-256 1090cf57595180d110a291e12d6f9f0a55e047ad5378160be3bb1a658678bf20); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-04 선택 구간의 값 간격표 만들기

ID: `quest-java-bridge-srt-04` / order 51 / L3

- MVP 이유: 원본 Algorithm Bridge의 선택 구간의 값 간격표 만들기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 정렬이 중간 단계인 변환을 익힌다. 자릿수 내림차순과 구간 K번째 계약은 쓰지 않는다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - Java에서 endIndex까지 포함해 복사하려면 복사의 끝 위치를 얼마로 정해야 하는가? - 입력 배열을 보존하면서 선택 구간만 정렬하려면 무엇을 따로 만들어야 하는가? - 정렬된 값이 m개라면 이웃한 두 값의 차이는 몇 개인가? - 결과의 index번째 값은 정렬된 배열의 어느 두 값을 빼야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 값을 작은 단위로 분해 또는 구간 복사 → 정렬 → 다른 형태의 결과로 재구성
- 새 E: 지정 구간을 새 배열로 복사하고, 복사한 값을 정렬한 뒤, 이웃한 값의 차이를 순서대로 담아 반환한다.
- C: 정렬이 중간 단계인 변환을 익힌다. 자릿수 내림차순과 구간 K번째 계약은 쓰지 않는다. 선택 구간의 끝 위치를 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-03의원래순서변화량에앞서 선택구간복사와정렬을연결한다. 범위는0기반양끝포함이다.
- 지원: 원본 힌트 1개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 선택 구간의 끝 위치를 제외하기.
- 잡을 오답: 선택 구간의 끝 위치를 제외하기
- 공개 검증: 선택한 구간을 정렬해 이웃 간격을 구한다 / 최대 길이 구간을 처리한다
- 독립 사례(손계산): `[[31, 17, -6, 4, 24], 1, 3]` → `[10, 13]`. 범위[17,-6,4]정렬은[-6,4,17]이고차이는10,13이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem04.java (SHA-256 bd38b78a6ae5a41fef1ae4b8e80105c173aae22251dbff143ab015ae438e3228); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution04.java (SHA-256 b4830a62b692781ad49cf98d4bb0c5fbe461128e7e73e83a06af77f6546cf870); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution04Test.java (SHA-256 3cd0e298439fb67db11d0bb87702e4b3ea5980d2cc4cc3eeb1132dd3492404c4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-05 가장 가까운 점검 시각 간격 찾기

ID: `quest-java-bridge-srt-05` / order 52 / L4

- MVP 이유: 원본 Algorithm Bridge의 가장 가까운 점검 시각 간격 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 전체 쌍을 보지 않아도 되는 근거를 설명한다. 접두어 계약은 쓰지 않는다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 점검이 최대 100_000개라면 모든 두 점검을 직접 확인하는 방식은 얼마나 많은 비교를 하는가? - 두 시각의 차이가 작다는 조건에서 숫자들이 가진 어떤 관계를 살펴봐야 하는가? - 같은 시각이 두 번 나오면 가능한 가장 작은 차이는 얼마인가? - 점검이 없거나 하나뿐이면 문제에서 어떤 값을 반환하라고 했는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 정렬로 관계 있는 항목을 이웃하게 만듦 → 이웃만 비교해 조건 판정
- 새 E: 별도 새 E 주장 없음
- C: 전체 쌍을 보지 않아도 되는 근거를 설명한다. 접두어 계약은 쓰지 않는다. 입력에서 이웃한 점검끼리만 비교하기를 허용하지 않는 계약이다.
- T: ARR-10의모든쌍개수에서 최소거리만필요한조건을보고정렬후이웃검사로스스로줄인다.
- 기존 경험과 차이: ARR-10의모든쌍개수에서 최소거리만필요한조건을보고정렬후이웃검사로스스로줄인다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 입력에서 이웃한 점검끼리만 비교하기.
- 잡을 오답: 입력에서 이웃한 점검끼리만 비교하기
- 공개 검증: 정렬 후 가장 가까운 검사 시각 간격을 찾는다 / 최대 길이 입력을 처리한다
- 독립 사례(손계산): `[[31, 17, -6, 24]]` → `7`. 정렬후차이는23,7,7로최소7이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem05.java (SHA-256 86d6896bbc77c0002d1198e422e34398a3dbb92547fddaac0b7ca3ddb4776bdc); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution05.java (SHA-256 ca62cc67d94dbee8b8a83c385ccab96f98d4b799925599a87caab931c3815c66); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution05Test.java (SHA-256 7b527863b8835abac667fe220ad416168911d7af1390e2f088a2e9a4bd192aae); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SRT-06 그룹별 새 항목 수 보고하기

ID: `quest-java-bridge-srt-06` / order 53 / L4

- MVP 이유: 원본 Algorithm Bridge의 그룹별 새 항목 수 보고하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 파싱·정렬·집합을 스스로 연결한다. 중괄호 튜플 문자열은 쓰지 않는다.
- 선수: `js-11-sorting-window` / algo.sorting
- 발견 단서: - 한 문자열에서 그룹 이름과 항목 목록을 구분하는 문자는 무엇인가? - 문제에서 그룹의 처리 순서를 정하는 기준은 몇 개인가? - 앞에서 나온 항목이 현재 그룹에 섞여 있으면 새 항목 수에는 포함되는가? - 한 그룹의 새 항목 수가 0이거나 2 이상일 수 있다는 조건이 결과에 어떤 영향을 주는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 구조 입력 파싱 → 묶음 크기순 처리 → 처음 본 값 추출 → 요구 결과로 재구성
- 새 E: 별도 새 E 주장 없음
- C: 파싱·정렬·집합을 스스로 연결한다. 중괄호 튜플 문자열은 쓰지 않는다. 앞서 본 항목을 매 그룹마다 지우기를 허용하지 않는 계약이다.
- T: HSH-03의빈도일치와달리문자열파싱후항목수·이름정렬과누적집합차이를다단계로연결한다.
- 기존 경험과 차이: HSH-03의빈도일치와달리문자열파싱후항목수·이름정렬과누적집합차이를다단계로연결한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 앞서 본 항목을 매 그룹마다 지우기.
- 잡을 오답: 앞서 본 항목을 매 그룹마다 지우기
- 공개 검증: 그룹을 크기순으로 처리해 새 항목 수를 계산한다 / 최대 그룹 수와 항목 수를 처리한다
- 독립 사례(손계산): `[["c:p,q", "a:p", "b:q,r", "d:r,s"]]` → `["a=1", "b=2", "c=0", "d=1"]`. a뒤본항목p; b가q,r추가; c는추가없음; d는s만새롭다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/problem/SortingProblem06.java (SHA-256 0c46980d821a7ea2840534199a7f681ba83a7a054699df0fba5de7fdf99daf77); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/solution/SortingSolution06.java (SHA-256 b98c34ce05466848f980a83bc991f0b4775c1b9ede58dd94521e7efd43937d94); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/sorting/test/SortingSolution06Test.java (SHA-256 7bcd73d80b170c6ab55673135812f2e7bac12049fb6665b8f07e6f21ab936c15); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/sorting/SortingGuide.java (SHA-256 51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TWP-01 두 정렬 기록의 공통 번호 모으기

ID: `quest-java-bridge-twp-01` / order 54 / L1

- MVP 이유: 원본 Algorithm Bridge의 두 정렬 기록의 공통 번호 모으기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 비교 결과에 따라 한쪽 또는 양쪽 위치를 움직이고, 같은 값이 반복되면 두 흐름에 함께 남은 횟수만큼만 기록한다. 전체 병합이나 순번 값은 반환하지 않는다.
- 선수: `js-11-sorting-window` / algo.two-pointers
- 발견 단서: - 두 배열의 아직 확인하지 않은 값 가운데 가장 앞의 값은 어디에 있는가? - 두 현재 값 중 한쪽이 작으면 어느 위치를 옮겨야 같은 값을 찾을 수 있는가? - 두 값이 같으면 어느 위치를 옮겨야 같은 번호를 다시 확인하지 않는가? - 한 배열을 모두 확인한 뒤에도 공통 번호를 더 찾을 수 있는가?
- 새 A: 두 배열의 현재 값을 비교해 작은 값이 있는 위치를 옮기고, 같으면 값을 기록한 뒤 두 위치를 모두 옮겨 공통 번호 배열을 반환한다.
- 재사용 A: 두 정렬 흐름의 현재 값 비교 → 작은 쪽 이동 → 같으면 기록하고 양쪽 이동
- 새 E: 별도 새 E 주장 없음
- C: 비교 결과에 따라 한쪽 또는 양쪽 위치를 움직이고, 같은 값이 반복되면 두 흐름에 함께 남은 횟수만큼만 기록한다. 전체 병합이나 순번 값은 반환하지 않는다. 공통 번호를 무조건 한 번만 남기기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: SRT-02의전체병합순번과달리두흐름에서같은값일때만양쪽하나씩소모해교집합중복개수를지킨다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 공통 번호를 무조건 한 번만 남기기.
- 잡을 오답: 공통 번호를 무조건 한 번만 남기기
- 공개 검증: 두 정렬 배열의 공통 번호를 찾는다 / 두 배열의 길이 상한을 처리한다
- 독립 사례(손계산): `[[-6, 17, 17, 31], [-6, -6, 17, 24, 31]]` → `[-6, 17, 31]`. 각값의양쪽최소빈도는모두1이며17도한번만담긴다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/problem/TwoPointerProblem01.java (SHA-256 896fa7b4cd74dc99f2c40cfd8f886b935a396a25b605ea51fc38de7793ad608c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/solution/TwoPointerSolution01.java (SHA-256 cad7737376fe709111b3457a11e6ef326efac399d5e8c156f62666fad0bdb207); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/twopointer/test/TwoPointerSolution01Test.java (SHA-256 998565cb72e202bb8b347ab5bbf3bed9fcb829fc83c3c936b81db6c86c14684d); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/TwoPointerGuide.java (SHA-256 f88c39998770aa73ae414b316876ee3a5978d5f37bed292d305f614e9c884e37)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TWP-02 목표에 가장 가까운 두 값의 합 찾기

ID: `quest-java-bridge-twp-02` / order 55 / L2

- MVP 이유: 원본 Algorithm Bridge의 목표에 가장 가까운 두 값의 합 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 정렬된 값의 단조성을 이용해 다시 볼 필요 없는 쪽을 고르고 최선의 합을 함께 기억한다. 추를 쌍으로 묶거나 보트 수를 구하지 않는다.
- 선수: `js-11-sorting-window` / algo.two-pointers
- 발견 단서: - 정렬된 배열의 가장 작은 값과 가장 큰 값은 어디에 있는가? - 현재 합이 target보다 작으면 어느 쪽을 옮겨야 합을 키울 수 있는가? - 현재 합이 target보다 크면 어느 쪽을 옮겨야 합을 줄일 수 있는가? - 같은 거리에 있는 두 합 가운데 어떤 합을 남겨야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 정렬된 한 흐름의 양끝 합 계산 → 목표와 거리 비교 → 합이 작으면 왼쪽, 크면 오른쪽 이동 → 가장 가까운 합 반환
- 새 E: 별도 새 E 주장 없음
- C: 정렬된 값의 단조성을 이용해 다시 볼 필요 없는 쪽을 고르고 최선의 합을 함께 기억한다. 추를 쌍으로 묶거나 보트 수를 구하지 않는다. 거리가 같은 합에서 더 큰 합을 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-10의쌍개수에서정렬단조성과현재최선합을결합하고같은거리면작은합조건을추가한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 거리가 같은 합에서 더 큰 합을 반환하기.
- 잡을 오답: 거리가 같은 합에서 더 큰 합을 반환하기
- 공개 검증: 정렬 배열에서 목표에 가장 가까운 합을 찾는다 / 길이 상한에서 마지막 두 값의 합을 찾는다
- 독립 사례(손계산): `[[-6, 4, 17, 31], "24"]` → `"25"`. 합21과25중목표24에더가까운25를고른다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/problem/TwoPointerProblem02.java (SHA-256 f443a89d469a675fe2827393d645e070f85127d6271326f65a9aa7d8ce7ffa7c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/solution/TwoPointerSolution02.java (SHA-256 8c3d3d95419d5a918bb45d7759d4f64f362507f7f081449729e18ae469b08034); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/twopointer/test/TwoPointerSolution02Test.java (SHA-256 7e95e0856270988812b864618392a73f06d8bcd343cea2386fe8631e866ba3f0); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/TwoPointerGuide.java (SHA-256 f88c39998770aa73ae414b316876ee3a5978d5f37bed292d305f614e9c884e37)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TWP-03 기준 합을 채우는 가장 짧은 구간 찾기

ID: `quest-java-bridge-twp-03` / order 56 / L3

- MVP 이유: 원본 Algorithm Bridge의 기준 합을 채우는 가장 짧은 구간 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 음수가 없는 조건이 가변 길이 구간에서 어느 쪽을 움직일지 결정하는 근거임을 익힌다. 고정 길이 빈도 비교는 쓰지 않는다.
- 선수: `js-11-sorting-window` / algo.two-pointers, algo.sliding-window
- 발견 단서: - 오른쪽에 새 값을 포함하면 현재 구간의 합은 어떻게 달라지는가? - 합이 target 이상일 때 어느 쪽을 옮겨야 더 짧은 구간을 확인할 수 있는가? - 왼쪽 값을 빼도 합이 target 이상이면 같은 오른쪽 끝에서 무엇을 더 확인해야 하는가? - 값이 모두 0 이상이라는 조건이 위치를 되돌리지 않아도 되는 이유는 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 오른쪽을 옮겨 구간 합 증가 → 기준에 도달한 동안 왼쪽을 옮겨 구간 축소 → 가장 짧은 위치 갱신
- 새 E: 오른쪽 위치를 옮기며 값을 합에 더하고, 합이 기준 이상인 동안 왼쪽 값을 빼며 구간을 줄여 가장 짧고 앞선 구간의 위치를 반환한다.
- C: 음수가 없는 조건이 가변 길이 구간에서 어느 쪽을 움직일지 결정하는 근거임을 익힌다. 고정 길이 빈도 비교는 쓰지 않는다. 1부터 세는 시작과 끝 위치를0부터 반환하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: HSH-03의고정길이빈도창에서음수없는합조건으로길이가변하는창과최단구간선택을무힌트조합한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 1부터 세는 시작과 끝 위치를0부터 반환하기.
- 잡을 오답: 1부터 세는 시작과 끝 위치를0부터 반환하기
- 공개 검증: 목표 합 이상인 가장 짧은 구간을 찾는다 / 길이와 목표 상한을 처리한다
- 독립 사례(손계산): `[[0, 17, 0, 6, 24, 0], "23"]` → `[5, 5]`. 24하나로기준을채워길이1이며위치는5다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/problem/TwoPointerProblem03.java (SHA-256 2bd1b717c5ca6aef32ed2379cabe159e7a3e5af9aaa827517650dfb5ea0a4bb1); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/solution/TwoPointerSolution03.java (SHA-256 3bc93491309c3cc8d55aa7de42f43bf559d7156454d1541c5f5f6b35fa3ab16d); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/twopointer/test/TwoPointerSolution03Test.java (SHA-256 8e44cf047de84dd9739df221c8f5195c9e6fe048d0c4368ea367d8b2e419a9fc); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/TwoPointerGuide.java (SHA-256 f88c39998770aa73ae414b316876ee3a5978d5f37bed292d305f614e9c884e37)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## TWP-04 한계 이하인 위치 쌍 세기

ID: `quest-java-bridge-twp-04` / order 57 / L4

- MVP 이유: 원본 Algorithm Bridge의 한계 이하인 위치 쌍 세기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 힌트 없이 정렬과 양끝 포인터를 고르고, 한 번의 비교로 여러 위치 쌍을 세는 연결을 완성한다. 항목을 한 번씩 배정하는 최소 보트 계약은 쓰지 않는다.
- 선수: `js-11-sorting-window` / algo.two-pointers
- 발견 단서: - 모든 위치 쌍을 하나씩 확인하면 최대 입력에서 비교 횟수는 얼마나 되는가? - 값의 크기 순서를 이용하면 한 번의 비교로 여러 쌍을 판단할 수 있는가? - 현재 확인한 값을 바꿀 때 더 확인할 쌍과 버려도 되는 쌍을 어떻게 구분할 수 있는가? - 최대 입력에서 위치 쌍의 개수는 int 범위를 넘는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 원본 복사·정렬 → 양끝 합 확인 → 한계 이하면 함께 가능한 여러 쌍을 더하고 왼쪽 이동 → 초과하면 오른쪽 이동
- 새 E: 별도 새 E 주장 없음
- C: 힌트 없이 정렬과 양끝 포인터를 고르고, 한 번의 비교로 여러 위치 쌍을 세는 연결을 완성한다. 항목을 한 번씩 배정하는 최소 보트 계약은 쓰지 않는다. 한 번의 유효 비교를 위치 쌍 하나로만 세기를 허용하지 않는 계약이다.
- T: ARR-10의차이기준전수쌍에서합상한·큰입력·한번비교로여러위치쌍을더하는무힌트연결이다.
- 기존 경험과 차이: ARR-10의차이기준전수쌍에서합상한·큰입력·한번비교로여러위치쌍을더하는무힌트연결이다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 한 번의 유효 비교를 위치 쌍 하나로만 세기.
- 잡을 오답: 한 번의 유효 비교를 위치 쌍 하나로만 세기
- 공개 검증: 한계 이하인 서로 다른 위치의 쌍을 센다 / 길이 상한에서 long 범위의 쌍 개수를 센다
- 독립 사례(손계산): `[[17, 6, 17, 4], "23"]` → `"5"`. 모든6쌍중17+17만34로탈락해5쌍이며같은17의두위치를따로센다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/problem/TwoPointerProblem04.java (SHA-256 c858af75828f501030a1d7040d7b48cb492a0cc7083190ce2bde9c6cf6bb198a); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/solution/TwoPointerSolution04.java (SHA-256 58f109365b69c9a5ddba75b233a1c34f6343f2c7eb5ab34746b915584777b1bd); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/twopointer/test/TwoPointerSolution04Test.java (SHA-256 2a44226f3142e543714563d40045082252cbfaa3eca7fe755979e9c1d5d55dd0); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/twopointer/TwoPointerGuide.java (SHA-256 f88c39998770aa73ae414b316876ee3a5978d5f37bed292d305f614e9c884e37)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-01 수치 조절 기록

ID: `quest-java-bridge-sim-01` / order 58 / L1

- MVP 이유: 원본 Algorithm Bridge의 수치 조절 기록 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 상태를 먼저 바꾸지 않는 경계 처리 순서를 익힌다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - "UP"과 "DOWN"은 각각 어떤 변화량으로 바꿀 수 있는가? - 현재 값을 바로 바꾸기 전에 어떤 후보 값을 먼저 계산해야 하는가? - 후보가 범위를 벗어나면 현재 값과 무시한 명령 수는 어떻게 달라지는가?
- 새 A: 명령을 변화량으로 바꾸고 후보 값을 계산한 뒤, 범위 안이면 확정하고 범위 밖이면 무시한 횟수를 늘려 최종 값과 함께 반환한다.
- 재사용 A: 명령을 변화량으로 바꿈 → 후보 상태 계산 → 범위 검사 → 유효할 때만 확정
- 새 E: 별도 새 E 주장 없음
- C: 상태를 먼저 바꾸지 않는 경계 처리 순서를 익힌다. 무시한 명령이 현재 값도 바꾸게 만들기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: QUE-02의대기순서상태와달리단일수치변경후범위밖후보를반영하지않는흐름이다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 무시한 명령이 현재 값도 바꾸게 만들기.
- 잡을 오답: 무시한 명령이 현재 값도 바꾸게 만들기
- 공개 검증: 명령을 범위 안에서만 적용한다 / 명령 최대 길이에서 거절 횟수를 누적한다
- 독립 사례(손계산): `[17, ["UP", "UP", "DOWN", "DOWN", "DOWN"], 16, 18]` → `[16, 2]`. 17→18,다음UP무시;DOWN으로17→16,마지막DOWN무시여서16과2회다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem01.java (SHA-256 59f62a28a76be1d400492ea1ba59a6f729b7750545f82b1b2928c51d5fa86a1b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution01.java (SHA-256 6648bbcd5b4307119d32fff89362dbf345f75d4bb1ab1f97b4f015c2e5dfc8a8); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution01Test.java (SHA-256 29cdd6ecde03208edf9b7e277e4e4fd8fdc9dd20383af9801a60691ddd70a0b3); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-02 전광판 줄 밀기

ID: `quest-java-bridge-sim-02` / order 59 / L2

- MVP 이유: 원본 Algorithm Bridge의 전광판 줄 밀기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 좌표 매핑과 원본·결과 분리를 익힌다. 90도 회전 결과는 만들지 않는다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - 한 번 밀 때 원본의 row, column 값은 새 배열의 몇 번 열로 이동하는가? - 오른쪽 끝을 넘어간 열을 0부터 다시 세려면 어떤 연산을 사용할 수 있는가? - 한 번의 변환 결과를 다음 반복의 입력으로 어떻게 이어갈 수 있는가? - 원본을 보존하려면 읽는 배열과 쓰는 배열이 같아도 되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 원본 좌표의 새 위치 계산 → 새 2차원 배열에 저장 → 변환 반복
- 새 E: 별도 새 E 주장 없음
- C: 좌표 매핑과 원본·결과 분리를 익힌다. 90도 회전 결과는 만들지 않는다. 겉 배열만 복사해 원본 행과 결과 행을 공유하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-07의행요약과달리행별좌표매핑을반복하고0회에도모든행이독립복사여야한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 겉 배열만 복사해 원본 행과 결과 행을 공유하기.
- 잡을 오답: 겉 배열만 복사해 원본 행과 결과 행을 공유하기
- 공개 검증: 행별 이동량에 따라 2차원 배열을 변환한다 / 최대 행·열과 많은 반복을 처리한다
- 독립 사례(손계산): `[[[17, 6, 31], [4, 9, 2]], 2]` → `[[6, 31, 17], [2, 4, 9]]`. 0행은두칸,1행은네칸즉한칸오른쪽으로움직인다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem02.java (SHA-256 46b55ddd986a395a7b8e0da94c8249192a646f962f7fe35d96cb60e9a8a43766); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution02.java (SHA-256 e41740e2c476eb33dc54db105453102e6922e8b17bd41702818a752db6a2a3e8); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution02Test.java (SHA-256 636c59866d5183be2be83dda9718207fb3c1fbde52eccf952e7bb0b09de2f826); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-03 겹별 테두리 합

ID: `quest-java-bridge-sim-03` / order 60 / L3

- MVP 이유: 원본 Algorithm Bridge의 겹별 테두리 합 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 방향과 축소되는 상태를 함께 관리한다. 달팽이 배열 생성은 쓰지 않는다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - 현재 겹의 위, 아래, 왼쪽, 오른쪽 경계를 어떤 변수로 기억할 수 있는가? - 윗줄을 더한 뒤 오른쪽 줄은 어느 행부터 확인해야 중복되지 않는가? - 한 줄이나 한 칸만 남으면 어떤 방향을 건너뛰어야 하는가? - 바깥 겹을 끝낸 뒤 다음 겹의 경계는 어떻게 달라지는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 네 경계를 기억 → 한 방향 처리 → 사용한 경계를 줄임 → 남은 범위 확인
- 새 E: 네 경계를 기준으로 현재 테두리의 네 방향을 중복 없이 더한 뒤, 경계를 안쪽으로 한 칸씩 줄이며 각 겹의 합을 반환한다.
- C: 방향과 축소되는 상태를 함께 관리한다. 달팽이 배열 생성은 쓰지 않는다. 테두리 모서리를 두 번 더하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-12의고정행열교차에서경계가줄어드는겹순회로확장하며한행·한열잔여의중복을막는다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 테두리 모서리를 두 번 더하기.
- 잡을 오답: 테두리 모서리를 두 번 더하기
- 공개 검증: 2차원 배열의 겹별 둘레 합을 구한다 / 최대 행·열의 둘레를 long으로 더한다
- 독립 사례(손계산): `[[[17, 6, 31], [4, 9, 2], [8, 1, 5]]]` → `["74", "9"]`. 바깥합17+6+31+4+2+8+1+5=74,안쪽중심9이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem03.java (SHA-256 21b567fe6d1ba45374c4c837374048d97f8e30dee9b91d8ef1e500c64f270a17); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution03.java (SHA-256 28264a7e6bb0984ecf1f9572c63cfd4b042d317d4c414fd021761f5bc81602cd); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution03Test.java (SHA-256 389026e29b7e36ad13ade3dbf3234ee56f1d2b31c690e75376bbe71d7d825293); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-04 숫자 상태 줄이기

ID: `quest-java-bridge-sim-04` / order 61 / L3

- MVP 이유: 원본 Algorithm Bridge의 숫자 상태 줄이기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 회차와 누적 변화량을 분리한다. 이진 문자열 변환은 쓰지 않는다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - 현재 수의 각 십진 자릿값을 차례로 꺼내려면 나눗셈과 나머지를 어떻게 사용할 수 있는가? - 한 번의 변환에서 다음 수와 0의 개수를 각각 어디에 저장할 수 있는가? - 변환 횟수와 0의 총개수는 언제 증가하는가? - 두 자리 이상인 수의 자릿값 합은 왜 원래 수보다 작아져 결국 종료되는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 현재 상태 분석 → 서로 다른 두 통계 갱신 → 다음 상태 생성 → 종료까지 반복
- 새 E: 현재 수의 자릿값 합과 0의 개수를 구하고 두 통계를 갱신한 뒤, 자릿값 합을 다음 상태로 삼아 한 자리 수가 될 때까지 반복한다.
- C: 회차와 누적 변화량을 분리한다. 이진 문자열 변환은 쓰지 않는다. 처음 수의0만 세고 다음 변환에서 생긴0을 누락하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: SIM-01의명령상태와달리수에서다음상태를생성하며회차초기값과전체누적을구분한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 처음 수의0만 세고 다음 변환에서 생긴0을 누락하기.
- 잡을 오답: 처음 수의0만 세고 다음 변환에서 생긴0을 누락하기
- 공개 검증: 숫자를 한 자리로 줄이는 과정을 검증한다
- 독립 사례(손계산): `["10009"]` → `[1, 2, 4]`. 10009→10에서0세개;10→1에서0한개로2회,누적0네개다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem04.java (SHA-256 07dcb3bea9ea8c7d0e633c4a851395d36631cb4e5f4200bdea0d14d39c79f032); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution04.java (SHA-256 d903cd8f153366be9f6a5ed06eeb8b33f9d31fe93f070a0501a46da23ec84e16); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution04Test.java (SHA-256 47e471e26a0ccd3c9b0ec7d6276f3e384918c0aca38e0c067497d92d1a24634b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-05 두 적재 구역의 경계 찾기

ID: `quest-java-bridge-sim-05` / order 62 / L4

- MVP 이유: 원본 Algorithm Bridge의 두 적재 구역의 경계 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 모든 위치를 다시 계산하지 않고 두 상태를 동시에 유지한다. 종류 수 동일 판정은 쓰지 않는다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - 두 구역에 짐이 하나 이상 있으려면 어디까지 경계로 확인해야 하는가? - 유효한 경계라고 판단하려면 두 구역의 합과 각 한도를 어떻게 비교해야 하는가? - 한 경계의 계산이 끝난 뒤 다음 경계에서 다시 사용할 수 있는 정보는 무엇인가? - 최대 입력의 전체 무게 합은 어떤 자료형에 안전하게 저장할 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 오른쪽 전체 요약 준비 → 경계를 한 칸 이동하며 양쪽 요약 갱신 → 각 경계 판정
- 새 E: 별도 새 E 주장 없음
- C: 모든 위치를 다시 계산하지 않고 두 상태를 동시에 유지한다. 종류 수 동일 판정은 쓰지 않는다. 한쪽 구역이 비어 있는 경계도 포함하기를 허용하지 않는 계약이다.
- T: ARR-05의여러독립질문과달리연속경계이동에서양쪽합을동시에유지하고빈구역을제외한다.
- 기존 경험과 차이: ARR-05의여러독립질문과달리연속경계이동에서양쪽합을동시에유지하고빈구역을제외한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 한쪽 구역이 비어 있는 경계도 포함하기.
- 잡을 오답: 한쪽 구역이 비어 있는 경계도 포함하기
- 공개 검증: 양쪽 용량을 만족하는 이동 경계를 센다 / 최대 길이에서 long 범위 누적합을 처리한다
- 독립 사례(손계산): `[[17, 6, 4, 9], "23", "13"]` → `1`. 1번뒤는오른쪽19로탈락;2번뒤왼23오른13성공;3번뒤왼27로탈락한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem05.java (SHA-256 abfc314f082c2b098d82bd1406610146c16b8b2c2b5735bdc5cb6ede5469c153); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution05.java (SHA-256 c7f61db43fdd1b56440fd4ccea3a878d2bebf334f675f9049c62b51bc61be7bc); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution05Test.java (SHA-256 fa341b63105286793b5a54525175ea41d0f354dbb7a93fc63c9a1e61006d5620); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## SIM-06 반복 작업 묶음 찾기

ID: `quest-java-bridge-sim-06` / order 63 / L4

- MVP 이유: 원본 Algorithm Bridge의 반복 작업 묶음 찾기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 가능한 후보를 모두 시뮬레이션하지 않고 수학적 후보만 확인한다. 테두리 격자는 쓰지 않는다.
- 선수: `js-08-implementation-simulation` / algo.simulation
- 발견 단서: - [2, 18]과 [18, 2]를 같은 쌍으로 볼 때 중복을 막을 기준은 무엇인가? - 두 수가 totalActions의 약수 쌍인지 확인하려면 어떤 관계를 검사해야 하는가? - 약수 쌍의 합과 reportInterval로 보고 간격 조건을 어떻게 판단할 수 있는가? - 조건을 만족하는 한 쌍을 찾은 뒤에도 나머지 후보를 확인해야 하는 이유는 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 대칭으로 줄인 후보 열거 → 기본 조건 확인 → 추가 조건으로 정답 판정
- 새 E: 별도 새 E 주장 없음
- C: 가능한 후보를 모두 시뮬레이션하지 않고 수학적 후보만 확인한다. 테두리 격자는 쓰지 않는다. 약수 쌍의 순서를 바꾼 경우를 두 번 세기를 허용하지 않는 계약이다.
- T: TWP-04의입력위치쌍과달리곱으로결정되는순서없는약수후보와합의배수조건을연결한다.
- 기존 경험과 차이: TWP-04의입력위치쌍과달리곱으로결정되는순서없는약수후보와합의배수조건을연결한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 약수 쌍의 순서를 바꾼 경우를 두 번 세기.
- 잡을 오답: 약수 쌍의 순서를 바꾼 경우를 두 번 세기
- 공개 검증: 약수 쌍의 보고 간격 조건을 검증한다
- 독립 사례(손계산): `["72", 5]` → `0`. 72의약수쌍합은73,38,27,22,18,17로어느것도5의배수가아니므로0이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/problem/SimulationProblem06.java (SHA-256 6cced78a0778238d66a03a445407f06fcb9e5b15d3541979b363b1a8a8ec9529); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/solution/SimulationSolution06.java (SHA-256 69e816e586cc9d4fe9d5edfd71c7d3e39113943b9b89afbb6062c4ffa03c2b5f); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/simulation/test/SimulationSolution06Test.java (SHA-256 b12b179a52f664864da84ed6436c817e982857942008670ea1372b60819909cb); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/simulation/SimulationGuide.java (SHA-256 3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## DYN-01 날짜별 누적 연습 점수표

ID: `quest-java-bridge-dyn-01` / order 64 / L1

- MVP 이유: 원본 Algorithm Bridge의 날짜별 누적 연습 점수표 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 상태·기저·계산 순서의 최소 흐름을 익힌다. 피보나치 수는 쓰지 않는다.
- 선수: `js-15-binary-search-dp` / algo.dynamic-programming
- 발견 단서: - answer[day]는 어떤 값을 뜻해야 하는가? - 계산하지 않아도 바로 적을 수 있는 첫 번째 값은 무엇인가? - day번째 값을 만들기 전에 어느 위치의 값이 준비되어 있어야 하는가? - 0일부터 lastDay일까지 담으려면 배열 길이는 얼마여야 하는가?
- 새 A: answer[day]를 day일까지의 누적 점수로 정하고 0일의 값을 저장한 뒤, 앞 날짜부터 주어진 계산식으로 다음 값을 채워 전체 배열을 반환한다.
- 재사용 A: - answer[day]를 day일까지의 누적 점수로 정하면, 이미 계산한 앞 칸 하나로 다음 칸을 만들 수 있다. - 작은 날짜부터 차례로 계산하면 필요한 앞 칸이 항상 준비되어 있다.
- 새 E: 별도 새 E 주장 없음
- C: 상태·기저·계산 순서의 최소 흐름을 익힌다. 피보나치 수는 쓰지 않는다. 0일의 초기 점수를0으로 두기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-05의입력누적과달리이전정답을다음정답의입력으로사용하는기저·전이상태를작성한다.
- 지원: 원본 힌트 4개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 0일의 초기 점수를0으로 두기.
- 잡을 오답: 0일의 초기 점수를0으로 두기
- 공개 검증: 날짜별 값을 점화식으로 계산한다
- 독립 사례(손계산): `[5]` → `[1, 2, 6, 15, 31, 56]`. 1에서날짜제곱1,4,9,16,25를순서대로더해0일부터5일까지보존한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem01.java (SHA-256 783c617005955ea837c02aebf0cc3f9e0d2945652f44ecf61b36f6b4dac39298); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution01.java (SHA-256 b444b11b5edf7b11319a9b7a067fa81c92dc85fd1474b03099580539de842b57); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution01Test.java (SHA-256 430ed51649c8965670b6ed5e52731fb2dea9c9a069202e216ec485311a4ed129); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/DynamicProgrammingGuide.java (SHA-256 fcaca1f5783accd4f61ea22c38b396e40bfd3653303216aec71e9a4d4c9efda9)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## DYN-02 사진 묶음 인쇄 최소 비용

ID: `quest-java-bridge-dyn-02` / order 65 / L2

- MVP 이유: 원본 Algorithm Bridge의 사진 묶음 인쇄 최소 비용 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 점화식을 외우지 않고 마지막 선택에서 도출한다. 타일 배치는 쓰지 않는다.
- 선수: `js-15-binary-search-dp` / algo.dynamic-programming
- 발견 단서: - 앞에서부터 count장의 사진을 모두 인쇄한 최소 비용을 어떤 칸에 저장할 것인가? - 마지막 사진을 한 장으로 인쇄했다면 그전에 몇 장이 끝나 있어야 하는가? - 마지막 두 사진을 묶음으로 인쇄했다면 그전에 몇 장이 끝나 있어야 하는가? - 사진이 0장 또는 1장일 때 바로 알 수 있는 답은 무엇인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - minimumCost[count]를 앞의 count장을 끝낸 최소 비용으로 정하면 마지막 행동을 두 경우로 나눌 수 있다. - 각 경우는 이미 계산한 count - 1장 또는 count - 2장의 최소 비용과 연결된다.
- 새 E: 별도 새 E 주장 없음
- C: 점화식을 외우지 않고 마지막 선택에서 도출한다. 타일 배치는 쓰지 않는다. 두 장 묶음을 한 장까지 계산한 비용에 덧붙여 중복 비용을 세기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRE-02의동질키트선택과달리이웃묶음이겹쳐이전한장·두장완성상태를비교해야한다.
- 지원: 원본 힌트 4개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 두 장 묶음을 한 장까지 계산한 비용에 덧붙여 중복 비용을 세기.
- 잡을 오답: 두 장 묶음을 한 장까지 계산한 비용에 덧붙여 중복 비용을 세기
- 공개 검증: 사진 한 장과 두 장 묶음의 최소 비용을 계산한다 / 사진 수 940과 일반 중간 비용을 처리한다 / 사진 수 상한에서 long 범위 결과를 계산한다
- 독립 사례(손계산): `[[17, 6, 4], [20, 7]]` → `"24"`. 전부낱장27,앞쌍20+4=24,뒤쌍17+7=24로최소24다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem02.java (SHA-256 3586106476f4e3e42e5d8525b1bf256c9b7521ce656f16269f347e2eaaf80bce); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution02.java (SHA-256 cdefd13cd2f226d4439694826010e7527925020058716594f613ad304d225b48); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution02Test.java (SHA-256 fe632724c29a4eb344a45ea1768e9943fd809d78ce36c6a1060f051e308b604e); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/DynamicProgrammingGuide.java (SHA-256 fcaca1f5783accd4f61ea22c38b396e40bfd3653303216aec71e9a4d4c9efda9)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## DYN-03 장애물을 피해 가는 배송 경로 수

ID: `quest-java-bridge-dyn-03` / order 66 / L3

- MVP 이유: 원본 Algorithm Bridge의 장애물을 피해 가는 배송 경로 수 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 상태가 참조하는 방향이 반복 순서를 결정함을 익힌다. 삼각형 구조는 쓰지 않는다.
- 선수: `algo-11-dynamic-programming-advanced` / algo.dynamic-programming-advanced
- 발견 단서: - ways[row][column]은 어떤 경로의 수를 뜻해야 하는가? - 현재 칸으로 바로 들어올 수 있는 이전 칸은 어디인가? - 위쪽과 왼쪽 값을 먼저 준비하려면 행과 열을 어느 방향으로 확인해야 하는가? - 장애물, 빈 창고, 막힌 출발 칸은 어떤 값으로 처리해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - ways[row][column]을 출발 칸에서 현재 칸까지 오는 경로 수로 정하면 두 이전 칸의 값을 재사용할 수 있다. - 위에서 아래, 왼쪽에서 오른쪽으로 채우면 필요한 두 이전 값이 항상 먼저 준비된다.
- 새 E: 각 칸까지의 경로 수를 저장할 2차원 표를 만든 뒤, 위쪽과 왼쪽 칸을 먼저 읽을 수 있는 방향으로 장애물을 건너뛰며 두 값을 더해 도착 칸의 값을 반환한다.
- C: 상태가 참조하는 방향이 반복 순서를 결정함을 익힌다. 삼각형 구조는 쓰지 않는다. 장애물 칸을 통과하는 경로도 더하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRA-03의사방최단거리와달리오른쪽·아래만허용된방향조건에서경로수의위·왼결과를합한다.
- 지원: 원본 힌트 2개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 장애물 칸을 통과하는 경로도 더하기.
- 잡을 오답: 장애물 칸을 통과하는 경로도 더하기
- 공개 검증: 장애물이 있는 창고의 이동 경로 수를 계산한다
- 독립 사례(손계산): `[[[0, 0, 1], [0, 0, 0]]]` → `2`. 첫칸에서아래-오른-오른과오른-아래-오른의두경로이며윗오른벽은통과못한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem03.java (SHA-256 4221909d34736ec2df0dc3669cd2293a458361ba7b5c9314bcb939647722cd33); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution03.java (SHA-256 bb12af1af56caf5a1f60b6a3745c1a84834c3a180648990aeb8a0a190e1b3ee1); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution03Test.java (SHA-256 15e75e99c58a6a694ec86f329ea2da551d2d4b5a492295969ca607a7bfb75f12); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/DynamicProgrammingGuide.java (SHA-256 fcaca1f5783accd4f61ea22c38b396e40bfd3653303216aec71e9a4d4c9efda9)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## DYN-04 마지막 조립 부품 고르기

ID: `quest-java-bridge-dyn-04` / order 67 / L4

- MVP 이유: 원본 Algorithm Bridge의 마지막 조립 부품 고르기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 하나의 최댓값이 아니라 상태별 최선이 필요한 이유를 고른다.
- 선수: `algo-11-dynamic-programming-advanced` / algo.dynamic-programming-advanced
- 발견 단서: - 한 단계가 끝났을 때 전체 최고점 하나만 기억하면 다음 부품의 호환 여부를 판단할 수 있는가? - 현재 부품마다 어떤 값을 따로 기억해야 하는가? - canFollow의 행과 열은 각각 앞 부품과 현재 부품 중 무엇인가? - 점수가 0인 상태와 도달할 수 없는 상태를 어떻게 구분할 것인가? - 마지막 부품의 최고 총점이 같을 때 어떤 순서로 답을 고를 것인가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: - bestScore[stage][part]를 stage 단계에서 part 부품으로 끝나는 최고 총점으로 정하면 필요한 이전 정보를 잃지 않는다. - 현재 부품과 호환되는 앞 부품의 상태만 비교하면 불가능한 조립 순서를 제외할 수 있다.
- 새 E: 별도 새 E 주장 없음
- C: 하나의 최댓값이 아니라 상태별 최선이 필요한 이유를 고른다. 최고 총점 자체를 반환하고 마지막 부품 번호를 잃기를 허용하지 않는 계약이다.
- T: DYN-02의사진수하나상태에서마지막부품별도달여부와최선점수를구분한다. 반환은총점이아닌부품번호다.
- 기존 경험과 차이: DYN-02의사진수하나상태에서마지막부품별도달여부와최선점수를구분한다. 반환은총점이아닌부품번호다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 최고 총점 자체를 반환하고 마지막 부품 번호를 잃기.
- 잡을 오답: 최고 총점 자체를 반환하고 마지막 부품 번호를 잃기
- 공개 검증: 호환 관계에 맞는 마지막 부품을 선택한다 / 단계·부품 상한에서 long 범위의 합계를 처리한다
- 독립 사례(손계산): `[[[17, 6], [4, 31]], [[false, true], [true, false]]]` → `1`. 0→1은48점,1→0은10점이어서마지막부품번호1을반환한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 초기 사다리의 최고값 상태 표현은 접근 근거이며 실제 반환은 최고 총점으로 끝나는 마지막 부품 번호다. 총점 자체를 반환하는 문제로 바꾸지 않는다. / 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem04.java (SHA-256 3dc3921b4234b4510533aab20bc16fe9d62418e0446f3446b17dfa7b06b1e3d4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution04.java (SHA-256 d60bf34165dde0ea0f8dc5f514181dd33b13e766825cf2654c9a184d863b483a); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution04Test.java (SHA-256 ac873310ad1b8fe94369965d21a42751d4fc9bd50fc6c1515bdcbc817a7a342c); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/dynamicprogramming/DynamicProgrammingGuide.java (SHA-256 fcaca1f5783accd4f61ea22c38b396e40bfd3653303216aec71e9a4d4c9efda9)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-01 점검실 예약 고르기

ID: `quest-java-bridge-gre-01` / order 68 / L1

- MVP 이유: 원본 Algorithm Bridge의 점검실 예약 고르기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 그리디는 반복문이 아니라 선택의 정당성임을 익힌다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 다음 예약이 들어갈 자리를 가장 많이 남기려면 어떤 예약을 먼저 끝내야 하는가? - 가장 짧은 예약을 먼저 고르면 앞뒤의 예약 두 개를 놓치는 경우가 있는가? - 현재 예약의 시작 시각이 마지막으로 고른 예약의 종료 시각과 같아도 고를 수 있는가? - 종료 시각이 같은 예약의 순서는 어떤 기준으로 정해야 하는가?
- 새 A: 종료 시각이 빠른 순서로 예약을 확인하고, 마지막 종료 시각 뒤에 시작할 수 있는 예약 번호만 반환한다.
- 재사용 A: 매 순간 선택 기준 제안 → 작은 반례 확인 → 기준이 안전한 조건 설명
- 새 E: 별도 새 E 주장 없음
- C: 그리디는 반복문이 아니라 선택의 정당성임을 익힌다. 끝나는 시각과 시작하는 시각이 같으면 겹친다고 제외하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L1 원본 지원 수준을 유지한다.
- 기존 경험과 차이: SRT-03의순서전체반환과달리끝시각순선택에서겹침제외가최대개수를만드는이유를설명한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 끝나는 시각과 시작하는 시각이 같으면 겹친다고 제외하기.
- 잡을 오답: 끝나는 시각과 시작하는 시각이 같으면 겹친다고 제외하기
- 공개 검증: 종료 시각을 기준으로 예약을 선택한다 / 최대 100000개의 연속 예약을 선택한다
- 독립 사례(손계산): `[[[17, 0, 4], [6, 1, 2], [31, 2, 4], [4, 4, 7]]]` → `[6, 31, 4]`. 먼저끝나는6뒤끝4인31을시작2에붙이고4번예약도끝시각4에바로이을수있다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem01.java (SHA-256 1ea1157bb0e8f09156340bf370511ea3b81ad5f940aabe1853fa89e00ba134d9); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution01.java (SHA-256 558a77a64c5056c0856ae79dd8d79485c43ee6189493323813b689dcd3757101); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution01Test.java (SHA-256 7cb11c1509620f642d7f0aef9d7f298ef86d93f63a4d4c60aa0b94e530c8152d); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-02 실습 키트 싸게 준비하기

ID: `quest-java-bridge-gre-02` / order 69 / L2

- MVP 이유: 원본 Algorithm Bridge의 실습 키트 싸게 준비하기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 고를 개수가 정해졌을 때 싼 선택이 안전한 이유와 `long` 누적을 익힌다. 예산 안의 최대 개수 계약은 쓰지 않는다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 모든 키트가 같다면 어떤 가격의 키트부터 골라야 총비용이 작아지는가? - requiredCount가 0이면 배열을 정렬하거나 값을 더할 필요가 있는가? - 원본 가격 순서를 보존하려면 무엇을 정렬해야 하는가? - 가격 100,000개를 더할 때 int만 사용해도 안전한가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 비용 오름차순 → 필요한 개수만큼 앞에서 선택 → 최소 총비용 반환
- 새 E: 별도 새 E 주장 없음
- C: 고를 개수가 정해졌을 때 싼 선택이 안전한 이유와 `long` 누적을 익힌다. 예산 안의 최대 개수 계약은 쓰지 않는다. 정확한 구매 개수보다 많은 키트 비용을 더하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L2 원본 지원 수준을 유지한다.
- 기존 경험과 차이: ARR-08의정렬중앙값에서정해진수만큼가장싼키트를선택하고합을long으로보존한다.
- 지원: 원본 힌트 3개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 정확한 구매 개수보다 많은 키트 비용을 더하기.
- 잡을 오답: 정확한 구매 개수보다 많은 키트 비용을 더하기
- 공개 검증: 필요한 개수만큼 가장 싼 키트를 선택한다 / 최대 100000개 비용을 long으로 누적한다
- 독립 사례(손계산): `[[17, 6, 31, 4], 2]` → `"10"`. 같은품질키트중4와6두개로비용10이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 문제의 명시 계약과 공개 Test를 함께 보존한다. 실제 성능·Java 컴파일은 확인하지 않았다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem02.java (SHA-256 71f80bfda06afa6e8f418897f1dc1c0a99a3b30cbe88223709e18fe78b159bc2); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution02.java (SHA-256 26ef2a7d30396ec439b2eaaf1de44335b58283970bf3cb42af770ef965350d0c); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution02Test.java (SHA-256 2d5d58b67aaa5d623fd50785ec3f7e89572260cb16f50d186170b9dcaf36f7eb); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-03 세정액 필요한 만큼 싸게 사기

ID: `quest-java-bridge-gre-03` / order 70 / L3

- MVP 이유: 원본 Algorithm Bridge의 세정액 필요한 만큼 싸게 사기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 비율을 직접 계산해 정렬과 부분 선택으로 연결한다. 용량 안에서 가치를 최대화하는 계약은 쓰지 않는다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 공급처마다 양과 전체 가격이 다르면 한 단위의 가격은 어떻게 계산하는가? - 마지막 공급처에서는 availableAmounts의 전부가 아니라 일부만 살 수 있는가? - 단위 비용이 같은 공급처는 어떤 순서로 골라야 결과가 하나로 정해지는가? - 비용순으로 골라도 결과 배열은 어떤 순서로 반환해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 전체 비용과 공급량으로 단위 비용 계산 → 낮은 순서로 선택 → 필요한 양의 마지막 일부만 선택 → 원래 순서의 사용량 반환
- 새 E: 공급처별 단위 비용을 계산해 낮은 순서로 고르고, 마지막에 필요한 양만 나누어 원래 공급처 순서로 반환한다.
- C: 비율을 직접 계산해 정렬과 부분 선택으로 연결한다. 용량 안에서 가치를 최대화하는 계약은 쓰지 않는다. 총 가격만 비교하고 판매량에 비례한 단위 비용을 구분하지 않기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: GRE-02의분할불가동질개수에서비율·부분구매·원래공급처순서복원을무힌트로연결한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 총 가격만 비교하고 판매량에 비례한 단위 비용을 구분하지 않기.
- 잡을 오답: 총 가격만 비교하고 판매량에 비례한 단위 비용을 구분하지 않기
- 공개 검증: 단위 비용이 낮은 공급처부터 필요한 양을 구매한다 / 최대 100000개 공급처에서 마지막 공급처의 절반을 구매한다
- 독립 사례(손계산): `[[3.0, 2.0, 4.0], [12.0, 8.0, 28.0], 4.0]` → `[3.0, 1.0, 0.0]`. 0,1공급처단위비용4동점이라번호0에서3,번호1에서1을사고단위7인2는0이다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem03.java (SHA-256 054a1bacde6cb9f1af28b7a22f192e80d4107043eabc56b5f2233c3f3c3337b6); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution03.java (SHA-256 fd31d3bd74a036c1c1c4de247bb4e24d8f729162ac24692e3d836790a596b541); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution03Test.java (SHA-256 9a1d233c91c60f8b143e7d171f0405ac3e35d9e8f17894117aebd2e57b822a71); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-04 균형 범위의 추 두 개 고르기

ID: `quest-java-bridge-gre-04` / order 71 / L3

- MVP 이유: 원본 Algorithm Bridge의 균형 범위의 추 두 개 고르기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 하한·상한에 따라 서로 다른 포인터를 움직여 유효한 쌍의 최대 개수를 구한다. 모든 항목을 운반하는 최소 보트 계약은 쓰지 않는다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 가장 가벼운 추와 가장 무거운 추의 합이 하한보다 작으면 어느 쪽을 바꿔야 하는가? - 그 합이 상한보다 크면 어느 쪽을 바꿔야 하는가? - 합이 허용 범위 안이면 두 추를 다시 사용할 수 있는가? - 추 하나가 남으면 쌍의 개수를 늘릴 수 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 정렬 → 양끝 합 확인 → 하한보다 작으면 가벼운 쪽 이동 → 상한보다 크면 무거운 쪽 이동 → 범위 안이면 쌍 확정
- 새 E: 무게를 정렬해 양끝 합을 확인하고, 낮으면 왼쪽, 높으면 오른쪽을 옮기며 범위 안일 때 두 추를 쌍으로 센다.
- C: 하한·상한에 따라 서로 다른 포인터를 움직여 유효한 쌍의 최대 개수를 구한다. 모든 항목을 운반하는 최소 보트 계약은 쓰지 않는다. 하나의 추를 여러 쌍에 중복 사용하기를 허용하지 않는 계약이다.
- T: 전이 성과를 주장하지 않는다. L3 원본 지원 수준을 유지한다.
- 기존 경험과 차이: TWP-04의모든위치쌍과달리한추한번사용과하한·상한이양끝이동및확정선택을바꾼다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 하나의 추를 여러 쌍에 중복 사용하기.
- 잡을 오답: 하나의 추를 여러 쌍에 중복 사용하기
- 공개 검증: 하한과 상한 사이의 합을 만드는 최대 쌍을 센다 / 최대 100000개 무게를 처리하고 원본을 보존한다
- 독립 사례(손계산): `[[17, 6, 31, 4, 9], 13, 23]` → `2`. 4+17=21,6+9=15의두쌍가능하며31은범위를넘긴다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem04.java (SHA-256 75ce68119a44c54c6ab7b4daab4fb6f21f9a927d3f2404b135c45969f0a5f0a2); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution04.java (SHA-256 72e69c1178df55f85375b1cd8a4f0d99cfd7eb2b832b4b0fbbedcbfb0b032b98); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution04Test.java (SHA-256 1e8ac25c48d30fa0c3399162fb641d5a149139eb078778dc87be91a476c939ac); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-05 오류 출처 묶음 고르기

ID: `quest-java-bridge-gre-05` / order 72 / L4

- MVP 이유: 원본 Algorithm Bridge의 오류 출처 묶음 고르기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 해시·정렬·목표 누적·조기 종료를 힌트 없이 연결한다. 목표를 채운 최소 종류 수만 반환하는 계약은 쓰지 않는다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 출처 하나를 고를 때 몇 개의 기록을 한꺼번에 조사할 수 있는가? - 적은 출처로 목표 기록 수에 도달하려면 어떤 출처부터 골라야 하는가? - 같은 기록 수를 가진 출처는 어떤 순서로 반환해야 하는가? - sourceLimit개의 출처를 골라도 targetRecords에 못 미치면 무엇을 반환해야 하는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 종류별 빈도 집계 → 큰 묶음부터 누적 → 목표 도달 또는 출처 수 상한에서 종료 → 성공한 실제 출처 이름 반환
- 새 E: 별도 새 E 주장 없음
- C: 해시·정렬·목표 누적·조기 종료를 힌트 없이 연결한다. 목표를 채운 최소 종류 수만 반환하는 계약은 쓰지 않는다. 목표를 채운 뒤에도 출처 수 제한까지 계속 선택하기를 허용하지 않는 계약이다.
- T: HSH-05의팀별고정개수와달리빈도순선택·누적목표·출처제한·실패빈배열이함께종료를결정한다.
- 기존 경험과 차이: HSH-05의팀별고정개수와달리빈도순선택·누적목표·출처제한·실패빈배열이함께종료를결정한다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 목표를 채운 뒤에도 출처 수 제한까지 계속 선택하기.
- 잡을 오답: 목표를 채운 뒤에도 출처 수 제한까지 계속 선택하기
- 공개 검증: 큰 출처 묶음부터 목표 기록 수를 채운다 / 한 출처의 940개 기록을 처리한다 / 최대 100000개의 동점 출처를 이름순으로 선택한다
- 독립 사례(손계산): `[["p", "q", "p", "r", "q", "p", "r"], 5, 2]` → `["p", "q"]`. p가3회,q와r이2회동점이므로p다음사전순q선택으로5회도달한다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem05.java (SHA-256 093c03d4b87ffe56bda84458374018dcf7505994ed2c796e931261a3fc46a4c4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution05.java (SHA-256 1f34f3a586ac4fd85cea30da091bb6b5b2aca0258594b8c461f46e67559b3592); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution05Test.java (SHA-256 4016d23be84b494fc3e2fcca10b922eda0a63032ad734645af75ab721472206b); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## GRE-06 산책로 빈 구간 덮기

ID: `quest-java-bridge-gre-06` / order 73 / L4

- MVP 이유: 원본 Algorithm Bridge의 산책로 빈 구간 덮기 계약을 직접 읽고 solve를 작성하는 기회를 보존한다. 점 단위 배열 없이 큰 범위를 구간 단위로 처리한다.
- 선수: `js-14-heap-greedy` / algo.greedy
- 발견 단서: - 현재 위치가 기존 구간 안에 있다면 어디까지 바로 건너뛸 수 있는가? - 첫 번째 빈 위치를 덮는 새 덮개는 어디서 시작해야 오른쪽을 가장 멀리 덮는가? - 겹친 기존 구간을 만났을 때 현재 위치를 뒤로 옮기면 안 되는 이유는 무엇인가? - 길이가 매우 커도 모든 위치를 배열로 만들 필요가 있는가?
- 새 A: 별도 새 A 주장 없음
- 재사용 A: 이미 덮인 구간 끝으로 이동 → 빈 구간이면 고정 폭을 최대한 덮고 점프
- 새 E: 별도 새 E 주장 없음
- C: 점 단위 배열 없이 큰 범위를 구간 단위로 처리한다. 겹치는 기존 구간을 만날 때 이미 덮은 위치로 돌아가기를 허용하지 않는 계약이다.
- T: SIM-03의모든칸순회와달리큰도로에서겹치는기존구간과최초빈위치를구간단위로전진시키는무힌트기회다.
- 기존 경험과 차이: SIM-03의모든칸순회와달리큰도로에서겹치는기존구간과최초빈위치를구간단위로전진시키는무힌트기회다.
- 지원: 원본 힌트 0개. Problem의 solve 기본 반환 stub만 Solution 클래스 안에 보존한다. 정답본문 없음.
- 자기 설명: 반환값이 무엇을 나타내는지 설명하고, 다음 오독이 왜 계약에 맞지 않는지 자신의 말로 설명한다: 겹치는 기존 구간을 만날 때 이미 덮은 위치로 돌아가기.
- 잡을 오답: 겹치는 기존 구간을 만날 때 이미 덮은 위치로 돌아가기
- 공개 검증: 이미 덮인 구간을 건너뛰며 빈 위치를 덮는다 / 최대 100000개의 기존 구간 사이를 덮는다
- 독립 사례(손계산): `[17, [[10, 12], [3, 5], [4, 7]], 4]` → `[0, 8, 13]`. 0덮개가0..3,기존구간이3..7,8덮개가8..11,기존이10..12,13덮개가13..16을덮는다.
- 완료 경계: 작성·저장·문제/typed 예제/원본 공개 검증 소스 열람까지만 제공한다. Java 실행은 BLOCKED이며 통과·완료 판정을 생성하지 않는다.
- 상호작용: 기존 키보드로 편집·초안 저장·접힌 힌트 열람 흐름을 사용한다. 이 작성 receipt는 UI·모바일·실행 검증 PASS가 아니며 연결 검증 담당에게 인계한다.
- 원본 한계·편집 판단: 원본에 단계별 풀이 힌트가 없다. 힌트·실패 설명·풀이 순서를 신규 추가하지 않으며 commonMistakes도 비워 선행 지원을 늘리지 않는다.
- 출처: /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/problem/GreedyProblem06.java (SHA-256 bcfc8dc864fd01ef137cc25e3947c1aca5c636497b86711d4fa12b3bd89f8592); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/solution/GreedySolution06.java (SHA-256 c216003f564f4b9d8325340bb3aba2c8766b58a47193cc41d131dc6bbadb6065); /Users/goonbam/study/grepp/algorithm-bridge/src/test/java/bridge/greedy/test/GreedySolution06Test.java (SHA-256 deefc10550548ba8e6f9d46ebd02bdf86b9dd08cb1d454495d2654aed2a755b4); /Users/goonbam/study/grepp/algorithm-bridge/src/main/java/bridge/greedy/GreedyGuide.java (SHA-256 56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787)
- 사람 판단: 문제별 비교가 새 A/E/C/T 또는 필요한 반복을 실제로 뒷받침하는지; 원본 L4/무힌트 L3의 접근 정보가 선공개되지 않는지; typed 예제와 독립 기대값의 의미·범위·순서; Problem/Solution/Test 불일치의 최소 보완 근거

## 부록: 원본 229개 파일 SHA-256

원본 revision은 위 출처 기준을 따른다. 아래 경로는 원본 root 기준 상대 경로이며 앱 런타임 의존성이 아니다. 원본 manifest를 바이트 변경 없이 수록한다.

```text
a4c4465f44b940ecfbdd3d009d997cbc548017eeeb9c45db05ec9e321ed7e968  src/main/java/bridge/array/ArrayGuide.java
b54a4a6119509a8ee76b21bba28555ff7979460e2598f4b6805152d4531b34ef  src/main/java/bridge/array/onedimensional/problem/ArrayProblem01.java
5b9cbc7b6708c11ecffaca4e5a5cbfa05cc46a6416ae3c5146ba79fb5e2638af  src/main/java/bridge/array/onedimensional/problem/ArrayProblem02.java
88fe87fa16fd44fa4d322f5d60f0d1739e046b38bf65497ba8e2c178eefe4603  src/main/java/bridge/array/onedimensional/problem/ArrayProblem03.java
659aa00de58c73115ee716c9be3e56e0c037b521a46b9bb90df119b1133c220b  src/main/java/bridge/array/onedimensional/problem/ArrayProblem04.java
d41c0b0ec1137d2e4f85f4cc2860dc16b6e6ff4937d7960504427db100de0cc9  src/main/java/bridge/array/onedimensional/problem/ArrayProblem05.java
1e5495acc338653d7da7ef2838073742f175863cd79dcbcf21cbd14fc91c5a2e  src/main/java/bridge/array/onedimensional/problem/ArrayProblem06.java
f247eff9e10bea37fc24316c572767410e8145fe59ba2b0b3ab27726c61bd2bf  src/main/java/bridge/array/onedimensional/problem/ArrayProblem08.java
473b42c70240f6c0bf651b9e472ab63999b677faa1c475794cf8ffa3be5c0801  src/main/java/bridge/array/onedimensional/problem/ArrayProblem09.java
633649e83f68e38ddcf037fdab3c4fb719f5c105feb99630e6a200d6c4e843bb  src/main/java/bridge/array/onedimensional/problem/ArrayProblem10.java
08d9e5b432041ced0bee92416627e18f492f48859668e8f4f82bd33e5c2d1447  src/main/java/bridge/array/onedimensional/problem/ArrayProblem11.java
f3921750e1b4af32db5c2fd70a9782794006e7f81132a1fa11c4d2d8640c73fa  src/main/java/bridge/array/onedimensional/solution/ArraySolution01.java
f0b329dad1174dcca25367fde05055c5e05259a134a8dd73e89d17f45270c817  src/main/java/bridge/array/onedimensional/solution/ArraySolution02.java
8a9041b458460ade95a359eadc2e03551879a27d39adb7eb2dcdb5779c7d8b26  src/main/java/bridge/array/onedimensional/solution/ArraySolution03.java
d24388fc4e2b9ebb4ebc28f1f2a2ba5e176d2d271daf73f6590b20f4b120f88b  src/main/java/bridge/array/onedimensional/solution/ArraySolution04.java
aa3a1ee491030c14fa43ead1b891007be30927e4c2d6924355088ffb6e74e746  src/main/java/bridge/array/onedimensional/solution/ArraySolution05.java
ff1a91b26cac32ae5690fee2728f1aa093fe28f0963b18596b953fa02f1bd6df  src/main/java/bridge/array/onedimensional/solution/ArraySolution06.java
b70bb91dec9aaafb2522eb46b03b6888c1037ac35396a1aa08764d0ef6aa2909  src/main/java/bridge/array/onedimensional/solution/ArraySolution08.java
e8b8adfa55417b29ff9382470861764c50866937d5242daf4b6f04db685d6925  src/main/java/bridge/array/onedimensional/solution/ArraySolution09.java
253dc15a491f8c937fcd2761ed4929c47f5976e84d3ea7277c125fadaeef1198  src/main/java/bridge/array/onedimensional/solution/ArraySolution10.java
774712e1541164e61a0402f60e6269727be105adcf11b167aa7b9267b5682ce3  src/main/java/bridge/array/onedimensional/solution/ArraySolution11.java
1a93719ed922949f91541457c1151153802ab0186aa5b65acdd606fdabe847af  src/main/java/bridge/array/twodimensional/problem/ArrayProblem07.java
69a65b1edf3dd83b76e7faf2788b5edcc03c4d0afbf8d8df992e008b41d9748b  src/main/java/bridge/array/twodimensional/problem/ArrayProblem12.java
522cc9ed78314183c5e9430c296d034a6bc4b260e7d15f541bf187bd7372e557  src/main/java/bridge/array/twodimensional/solution/ArraySolution07.java
0e309b57deecbe1a914d8d0ef2995252021257cd9dffbd71b14467a27237e7b2  src/main/java/bridge/array/twodimensional/solution/ArraySolution12.java
35eb34cfafaff299339ee8e9184e8b3a0511c0d56853b15ba3562ef53f6af5cd  src/main/java/bridge/backtracking/BacktrackingGuide.java
c4884b5ca32ba81f76536e31ffd1e06da883bb94ed2b891c815efcda2b76808c  src/main/java/bridge/backtracking/problem/BacktrackingProblem01.java
20edbfbbd5c861109688cd561d5790f60f515464811bfcec8f9e3e11c45000d6  src/main/java/bridge/backtracking/problem/BacktrackingProblem02.java
a05f954c77290a70a692a9d8e2869529aef8b79a425fd3ec92aa7b2c19ee6a3c  src/main/java/bridge/backtracking/problem/BacktrackingProblem03.java
6f0a385fd95f3b7d4a885b8d5ed8edb2407e6138ffae315ce5589886c0f5a5f4  src/main/java/bridge/backtracking/problem/BacktrackingProblem04.java
493e59bd778533e3dc3e0bf4559e9e99995d801fe024fe069d65dd4a0cbbbcd7  src/main/java/bridge/backtracking/problem/BacktrackingProblem05.java
12577ed065925ce2a718e70c027bea44e0ecf40f677508be57c10b0bdba8015c  src/main/java/bridge/backtracking/solution/BacktrackingSolution01.java
0f30435692ce5bb7d266b79fe30302510bf2dd140222e471fc2722eed25f3b7a  src/main/java/bridge/backtracking/solution/BacktrackingSolution02.java
5ed791d25aa8dff4f519aa3150c603727089f629d1fb2100eca40422baf84f98  src/main/java/bridge/backtracking/solution/BacktrackingSolution03.java
a11f03d093d52875d718b0f6ee4903052622c68f294a2326c54872f88aaac426  src/main/java/bridge/backtracking/solution/BacktrackingSolution04.java
1a18538d26a9bc0e75aa6d9b0949a8f8cd69a42de170884ceda611fd54bc04ff  src/main/java/bridge/backtracking/solution/BacktrackingSolution05.java
fcaca1f5783accd4f61ea22c38b396e40bfd3653303216aec71e9a4d4c9efda9  src/main/java/bridge/dynamicprogramming/DynamicProgrammingGuide.java
783c617005955ea837c02aebf0cc3f9e0d2945652f44ecf61b36f6b4dac39298  src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem01.java
3586106476f4e3e42e5d8525b1bf256c9b7521ce656f16269f347e2eaaf80bce  src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem02.java
4221909d34736ec2df0dc3669cd2293a458361ba7b5c9314bcb939647722cd33  src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem03.java
3dc3921b4234b4510533aab20bc16fe9d62418e0446f3446b17dfa7b06b1e3d4  src/main/java/bridge/dynamicprogramming/problem/DynamicProgrammingProblem04.java
b444b11b5edf7b11319a9b7a067fa81c92dc85fd1474b03099580539de842b57  src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution01.java
cdefd13cd2f226d4439694826010e7527925020058716594f613ad304d225b48  src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution02.java
bb12af1af56caf5a1f60b6a3745c1a84834c3a180648990aeb8a0a190e1b3ee1  src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution03.java
d60bf34165dde0ea0f8dc5f514181dd33b13e766825cf2654c9a184d863b483a  src/main/java/bridge/dynamicprogramming/solution/DynamicProgrammingSolution04.java
5cf569cd2ac9e945193999bd623a307cd257489f533d1094bde96eb20d4cd822  src/main/java/bridge/graph/GraphGuide.java
8afc3024d08ee6ed80c0261a01ee51b9dbf1167fd841d76078688c40210ac7d0  src/main/java/bridge/graph/problem/GraphProblem01.java
266dc94cac8e0811d5c9bda8fc6af450c721156bd66f1deda40d5e3d8d814c5a  src/main/java/bridge/graph/problem/GraphProblem02.java
d43b0d2f08349d581fa7e63a349b649af4c495b65787206e72a12fc06b0dc8c3  src/main/java/bridge/graph/problem/GraphProblem03.java
fe009181fca881cc2d61ac8b63e8c0d0b833d4049d7990d00723bf94a53b1e91  src/main/java/bridge/graph/problem/GraphProblem04.java
b8f6a410a5504b310b68bb52e3f1c175fee62299e4a44962387e574c6c632c20  src/main/java/bridge/graph/problem/GraphProblem05.java
7e4309da3136e7172f85540615eb6787254e3200d66bec412b234e7e56c27dbf  src/main/java/bridge/graph/problem/GraphProblem06.java
960030c0ef0b5ee52fa27048fbe72cbe5cb0155351bf3fe524c4dc44158d823f  src/main/java/bridge/graph/solution/GraphSolution01.java
228c8eb416c3de48434ca63a3856bc1651457b7ec4ca753ebdeb27b90ff345be  src/main/java/bridge/graph/solution/GraphSolution02.java
d9dc5e0d7560d4add8bf75239f9315154131695c150620d0895b47a64548bc9b  src/main/java/bridge/graph/solution/GraphSolution03.java
4978d3b967a4bb4c2a21702461e6777484671e76ad77958165afbb16618bb26f  src/main/java/bridge/graph/solution/GraphSolution04.java
fff369dc941bc284a2ede77e19e9572d2cb2290be99f59884d0de13ad580fca6  src/main/java/bridge/graph/solution/GraphSolution05.java
34c1b0a0f0586be36d54590118bc643693421e729ec7423186968d44510a0dbe  src/main/java/bridge/graph/solution/GraphSolution06.java
56831b49ac5317510fb676a96f8fa96e1d72b1f0b46d39e9afb304c92849d787  src/main/java/bridge/greedy/GreedyGuide.java
1ea1157bb0e8f09156340bf370511ea3b81ad5f940aabe1853fa89e00ba134d9  src/main/java/bridge/greedy/problem/GreedyProblem01.java
71f80bfda06afa6e8f418897f1dc1c0a99a3b30cbe88223709e18fe78b159bc2  src/main/java/bridge/greedy/problem/GreedyProblem02.java
054a1bacde6cb9f1af28b7a22f192e80d4107043eabc56b5f2233c3f3c3337b6  src/main/java/bridge/greedy/problem/GreedyProblem03.java
75ce68119a44c54c6ab7b4daab4fb6f21f9a927d3f2404b135c45969f0a5f0a2  src/main/java/bridge/greedy/problem/GreedyProblem04.java
093c03d4b87ffe56bda84458374018dcf7505994ed2c796e931261a3fc46a4c4  src/main/java/bridge/greedy/problem/GreedyProblem05.java
bcfc8dc864fd01ef137cc25e3947c1aca5c636497b86711d4fa12b3bd89f8592  src/main/java/bridge/greedy/problem/GreedyProblem06.java
558a77a64c5056c0856ae79dd8d79485c43ee6189493323813b689dcd3757101  src/main/java/bridge/greedy/solution/GreedySolution01.java
26ef2a7d30396ec439b2eaaf1de44335b58283970bf3cb42af770ef965350d0c  src/main/java/bridge/greedy/solution/GreedySolution02.java
fd31d3bd74a036c1c1c4de247bb4e24d8f729162ac24692e3d836790a596b541  src/main/java/bridge/greedy/solution/GreedySolution03.java
72e69c1178df55f85375b1cd8a4f0d99cfd7eb2b832b4b0fbbedcbfb0b032b98  src/main/java/bridge/greedy/solution/GreedySolution04.java
1f34f3a586ac4fd85cea30da091bb6b5b2aca0258594b8c461f46e67559b3592  src/main/java/bridge/greedy/solution/GreedySolution05.java
c216003f564f4b9d8325340bb3aba2c8766b58a47193cc41d131dc6bbadb6065  src/main/java/bridge/greedy/solution/GreedySolution06.java
1f61458108b49d057d68d5fecd5334cb5fbd60d3b8fef23d143b7332baad99ce  src/main/java/bridge/hash/HashGuide.java
a88381ac2d545065e43a6d856d8ee9c4552b7287f856799ed7e8dd4381f95650  src/main/java/bridge/hash/problem/HashProblem01.java
0c6fd82bf20e80f8090e7fc917c55fa141b049c642666d14a820d71069d6b26c  src/main/java/bridge/hash/problem/HashProblem02.java
7a73db2f5cc7d8b2d39d3d974c8c5fbcc0f33b79d63f921b23b5c4f7eb18ddc1  src/main/java/bridge/hash/problem/HashProblem03.java
7d2f397835ec77eea10720e92f1b1028ac0212f813e9f2f8e42984016cc619d2  src/main/java/bridge/hash/problem/HashProblem04.java
26951872c775742d9bb471e40f20fc4a526c76b6f53b1ef8f2dfd98a42dd9719  src/main/java/bridge/hash/problem/HashProblem05.java
e7db1b9c35cbcd3f4882a47d009aa54c5877765da39776cdb9266acd11bd2a62  src/main/java/bridge/hash/problem/HashProblem06.java
76c766e1403563b0d928f1300429504a98173e54c85b22422e1e0cdf43bd5ca3  src/main/java/bridge/hash/solution/HashSolution01.java
0972309c97db050a1163a88cf84f40d784f2f816b99589ec95807133c09e5afb  src/main/java/bridge/hash/solution/HashSolution02.java
ea73638bc2cbf35b469d43117d448b9d0ab077a0b7e5d183fc708cf4a353911c  src/main/java/bridge/hash/solution/HashSolution03.java
894a3334f3cf06eab7d72e68fc64ec5247a4c030e6aacaf9157b0d046b7fa638  src/main/java/bridge/hash/solution/HashSolution04.java
2dd9773e9d4ee2d23af390ff63f35c321b220c0b4af152f6381a03b7b006fc05  src/main/java/bridge/hash/solution/HashSolution05.java
790124e584bcfe12329b37c590de13652897fb213d8280a4859f092919548afc  src/main/java/bridge/hash/solution/HashSolution06.java
dda6dd6857236eaec54dee7dc8b2ff5f6a69efbed229e9f8a1b3e1942f46e329  src/main/java/bridge/queue/QueueGuide.java
e1f7be176d12677bc702374acd7f0c1cc28fee1242e16f0f7f411302d68e7fed  src/main/java/bridge/queue/problem/QueueProblem01.java
78a1f3b0cb31a89f3b2007c01b72fbcd340d660c19e7d59111dc090479413968  src/main/java/bridge/queue/problem/QueueProblem02.java
adf0dfc21ea35513b0911309342e7d258e4f9c74bce3c3a626b68cc9ff5d7d40  src/main/java/bridge/queue/problem/QueueProblem03.java
ea6e0d6808cc35864c0cee6daad9efce98c2e426d891956a5b363c29160b08da  src/main/java/bridge/queue/problem/QueueProblem04.java
6ecfad8db7a26b4bac861f6e82bd38d6a2212d937a010c736ad5bafab246c5ba  src/main/java/bridge/queue/solution/QueueSolution01.java
a00f822992b43ecf2eaff0083018220c1e9fe8f59f2f7d43be11609e5457b65e  src/main/java/bridge/queue/solution/QueueSolution02.java
1420b922326ceebdc5651e24aa4c3137de097da7747b24961b2bd5435d8c2b97  src/main/java/bridge/queue/solution/QueueSolution03.java
f84b8525f325ac9e251ab965b1f40dd514762e8a8bc85e15b630a4829ef2be9a  src/main/java/bridge/queue/solution/QueueSolution04.java
6e966d48c15d98903eed7bcbb59d190b1e60631923b574e5eec6d572b6d73b19  src/main/java/bridge/set/SetGuide.java
7e3a3eefa727980baffde71f8545b9784a0159a2f1ef5bd05b8b4ed6f73d94c1  src/main/java/bridge/set/problem/SetProblem01.java
e7f328595042902bdf622e0dc588ee476979294772eda9df5247ec5265ed655f  src/main/java/bridge/set/problem/SetProblem02.java
e23fe047e23ff8e2fe8da8c6a6bee25a3aba356b04298f60a5bf37f46639b864  src/main/java/bridge/set/problem/SetProblem03.java
730aeec66773a329646ce27827d322fccfce689b6b89b10e486aaf1caf55c97e  src/main/java/bridge/set/problem/SetProblem04.java
06908597c6ec606ca960ce630fd13bad3443c81af723317c0e21b25559c090c8  src/main/java/bridge/set/solution/SetSolution01.java
21861535cbd640851f1244526df99cb84a229deaa165aff7f48678b965fbb26e  src/main/java/bridge/set/solution/SetSolution02.java
6fa844d7ec727b4f9451c625124e1461b6968a1e0fcea585e75d08ef9bc3a1e7  src/main/java/bridge/set/solution/SetSolution03.java
9aa305e8ebac0453f50f7b9170efda17d489deefc229cb3aac9589a95221b413  src/main/java/bridge/set/solution/SetSolution04.java
3ad51d839925f628148a8beca9ce699f5a80eb0b16c36c36bc0cb71c07ec51ae  src/main/java/bridge/simulation/SimulationGuide.java
59f62a28a76be1d400492ea1ba59a6f729b7750545f82b1b2928c51d5fa86a1b  src/main/java/bridge/simulation/problem/SimulationProblem01.java
46b55ddd986a395a7b8e0da94c8249192a646f962f7fe35d96cb60e9a8a43766  src/main/java/bridge/simulation/problem/SimulationProblem02.java
21b567fe6d1ba45374c4c837374048d97f8e30dee9b91d8ef1e500c64f270a17  src/main/java/bridge/simulation/problem/SimulationProblem03.java
07dcb3bea9ea8c7d0e633c4a851395d36631cb4e5f4200bdea0d14d39c79f032  src/main/java/bridge/simulation/problem/SimulationProblem04.java
abfc314f082c2b098d82bd1406610146c16b8b2c2b5735bdc5cb6ede5469c153  src/main/java/bridge/simulation/problem/SimulationProblem05.java
6cced78a0778238d66a03a445407f06fcb9e5b15d3541979b363b1a8a8ec9529  src/main/java/bridge/simulation/problem/SimulationProblem06.java
6648bbcd5b4307119d32fff89362dbf345f75d4bb1ab1f97b4f015c2e5dfc8a8  src/main/java/bridge/simulation/solution/SimulationSolution01.java
e41740e2c476eb33dc54db105453102e6922e8b17bd41702818a752db6a2a3e8  src/main/java/bridge/simulation/solution/SimulationSolution02.java
28264a7e6bb0984ecf1f9572c63cfd4b042d317d4c414fd021761f5bc81602cd  src/main/java/bridge/simulation/solution/SimulationSolution03.java
d903cd8f153366be9f6a5ed06eeb8b33f9d31fe93f070a0501a46da23ec84e16  src/main/java/bridge/simulation/solution/SimulationSolution04.java
c7f61db43fdd1b56440fd4ccea3a878d2bebf334f675f9049c62b51bc61be7bc  src/main/java/bridge/simulation/solution/SimulationSolution05.java
69e816e586cc9d4fe9d5edfd71c7d3e39113943b9b89afbb6062c4ffa03c2b5f  src/main/java/bridge/simulation/solution/SimulationSolution06.java
51cbb5b97640779ed3af31c952174d56adb00a9c5f7f09392244c4eb84a81837  src/main/java/bridge/sorting/SortingGuide.java
bbbca8790eeb3cfc962d4b6d43db49f5f1fa47eb3937d39b74f0184b69268134  src/main/java/bridge/sorting/problem/SortingProblem01.java
9613f02b4796f9cee187ba61c0b8e856e84811921cd284ca9fe27f8ccc774625  src/main/java/bridge/sorting/problem/SortingProblem02.java
809a8893ba3cdab87a5774713cbbfe0cb3735f981e836e7a407a395cb70f78ba  src/main/java/bridge/sorting/problem/SortingProblem03.java
bd38b78a6ae5a41fef1ae4b8e80105c173aae22251dbff143ab015ae438e3228  src/main/java/bridge/sorting/problem/SortingProblem04.java
86d6896bbc77c0002d1198e422e34398a3dbb92547fddaac0b7ca3ddb4776bdc  src/main/java/bridge/sorting/problem/SortingProblem05.java
0c46980d821a7ea2840534199a7f681ba83a7a054699df0fba5de7fdf99daf77  src/main/java/bridge/sorting/problem/SortingProblem06.java
d33a792e527a632e0a2b1d76a2daa337086c5272e1d78650eb63c235825c0843  src/main/java/bridge/sorting/solution/SortingSolution01.java
6171d6f16abea6575baec8b83c2ee53f10cdee980c2b75bf46736748d4bf19ff  src/main/java/bridge/sorting/solution/SortingSolution02.java
517ba2092075c22b2957cdd03647df25ffe10b7e743d81826e3b9b25cdd511cd  src/main/java/bridge/sorting/solution/SortingSolution03.java
b4830a62b692781ad49cf98d4bb0c5fbe461128e7e73e83a06af77f6546cf870  src/main/java/bridge/sorting/solution/SortingSolution04.java
ca62cc67d94dbee8b8a83c385ccab96f98d4b799925599a87caab931c3815c66  src/main/java/bridge/sorting/solution/SortingSolution05.java
b98c34ce05466848f980a83bc991f0b4775c1b9ede58dd94521e7efd43937d94  src/main/java/bridge/sorting/solution/SortingSolution06.java
5d83c505c2dd945ae59fcea2dc38bc7e4abc2598c335be76308bd439a8cffb24  src/main/java/bridge/stack/StackGuide.java
5bc844bf6a056cc279ac61ce42a07e3566cfe9d18eef17a0a70ceaac6ef406c2  src/main/java/bridge/stack/problem/StackProblem01.java
72efc4e3942b6d9dee831162f417c6fd446586b677f98817d0a77e39a9184f4a  src/main/java/bridge/stack/problem/StackProblem02.java
b30b6d5a5d1ffbe46f8da44367a346277f6ce8f33da7097026837df95066343e  src/main/java/bridge/stack/problem/StackProblem03.java
074c8b75f1bc17b2c2940b74bac9b1cb14edf82b98fc33b98a0870d6af83854b  src/main/java/bridge/stack/problem/StackProblem04.java
378f314231704370046e02487fcb99a0ec02abf892898af05f0430ec46faf29e  src/main/java/bridge/stack/problem/StackProblem05.java
1b6dc435453af2eb105472bd23f39ebade6ba300c4e5a55bd2f5443b7cecb513  src/main/java/bridge/stack/solution/StackSolution01.java
6ff66d6d74a2b0f3a96a2182a548e46a109796642a47fd0bf2d18011047a5a14  src/main/java/bridge/stack/solution/StackSolution02.java
f4c66c6fb17ca488aa63ac5be5e8de3989e5f6fb2e28b99971d3526738d540d4  src/main/java/bridge/stack/solution/StackSolution03.java
343f6d9c3e8ff6ae399d6d0f96e5c163771d82afb5df02e7361f5b7b86ba1f5a  src/main/java/bridge/stack/solution/StackSolution04.java
f8d29698d8faf0c6cd9269aa7fdae4446e294799b09bb9b2e592adec0931de70  src/main/java/bridge/stack/solution/StackSolution05.java
eac769fe309d2cb1f207df53062c9956a85b1fe5ea28fc7a2a76a15c0e641e9a  src/main/java/bridge/tree/TreeGuide.java
c2920c1fb684bfd42884a606f6ed6e2e824794baff3572d8280344d23cf5f608  src/main/java/bridge/tree/problem/TreeProblem01.java
ce5d57981cfdf5fe35c3cb1e396b4f3f9f5a4d05da28132255f63db43274c0e0  src/main/java/bridge/tree/problem/TreeProblem02.java
37144981b5342458ee36ef34aa7044fd8d9eac6249beae985f21fbb526ff7c08  src/main/java/bridge/tree/problem/TreeProblem03.java
c09e4ad626671b7cf938ff72aeb2f7acdcab71a491872e41e0016151895169b6  src/main/java/bridge/tree/problem/TreeProblem04.java
df5219cdbbdcde389256b122f7e82228cfb50c70dcdea00f1167096aa551ad83  src/main/java/bridge/tree/solution/TreeSolution01.java
e6cf7ce63de115423894265e01b36efb5753753e913d7a50c61bd23af9be2174  src/main/java/bridge/tree/solution/TreeSolution02.java
6356765ec2ebc0d3f2e9f7f8a1d3d4cba3b877bf1aef3650a487ad6d288e20a6  src/main/java/bridge/tree/solution/TreeSolution03.java
1c353cd69d1142f3516ad22e179287089aa4aa66a121a7cc34c5a0dd02925acb  src/main/java/bridge/tree/solution/TreeSolution04.java
f88c39998770aa73ae414b316876ee3a5978d5f37bed292d305f614e9c884e37  src/main/java/bridge/twopointer/TwoPointerGuide.java
896fa7b4cd74dc99f2c40cfd8f886b935a396a25b605ea51fc38de7793ad608c  src/main/java/bridge/twopointer/problem/TwoPointerProblem01.java
f443a89d469a675fe2827393d645e070f85127d6271326f65a9aa7d8ce7ffa7c  src/main/java/bridge/twopointer/problem/TwoPointerProblem02.java
2bd1b717c5ca6aef32ed2379cabe159e7a3e5af9aaa827517650dfb5ea0a4bb1  src/main/java/bridge/twopointer/problem/TwoPointerProblem03.java
c858af75828f501030a1d7040d7b48cb492a0cc7083190ce2bde9c6cf6bb198a  src/main/java/bridge/twopointer/problem/TwoPointerProblem04.java
cad7737376fe709111b3457a11e6ef326efac399d5e8c156f62666fad0bdb207  src/main/java/bridge/twopointer/solution/TwoPointerSolution01.java
8c3d3d95419d5a918bb45d7759d4f64f362507f7f081449729e18ae469b08034  src/main/java/bridge/twopointer/solution/TwoPointerSolution02.java
3bc93491309c3cc8d55aa7de42f43bf559d7156454d1541c5f5f6b35fa3ab16d  src/main/java/bridge/twopointer/solution/TwoPointerSolution03.java
58f109365b69c9a5ddba75b233a1c34f6343f2c7eb5ab34746b915584777b1bd  src/main/java/bridge/twopointer/solution/TwoPointerSolution04.java
56ff3512838f017d6ee4ac172dc6e82d88035d520932316f0a5793103b30d97b  src/test/java/bridge/array/onedimensional/test/ArraySolution01Test.java
9c8394392c6234c87f3ed44719e0013e4984f2a746224d5e5ed80573907d3309  src/test/java/bridge/array/onedimensional/test/ArraySolution02Test.java
e265d77b63775ef1ae04b43b33f34fe2d7d448f949053e191118a7a3b2de6f14  src/test/java/bridge/array/onedimensional/test/ArraySolution03Test.java
322eb90c94c7ef0a1251fa35f5b1ff2f373b240f0e8c3e2c42659c638b4f6adb  src/test/java/bridge/array/onedimensional/test/ArraySolution04Test.java
4b46e7c7252b5cbc6201082e0189414a50e70ba33c66ab1060ba1b314e314270  src/test/java/bridge/array/onedimensional/test/ArraySolution05Test.java
80576338b360bd5183935d14115c76ecbdaf9c70d040a6132b49716101251cdd  src/test/java/bridge/array/onedimensional/test/ArraySolution06Test.java
534704179accfa34f6ef7f0a790d0dd1430f3eb2b21cbb3251e66d6057b86fda  src/test/java/bridge/array/onedimensional/test/ArraySolution08Test.java
0718f47bfc6fd01e04df8080b6ffea4f8b001a5004760b503c54f6dc9386c4e9  src/test/java/bridge/array/onedimensional/test/ArraySolution09Test.java
09a9a2b2b6e6197d3880d7d2b6067af2d481156418d4966401da1f89826e003c  src/test/java/bridge/array/onedimensional/test/ArraySolution10Test.java
466507fc94d8271651b05d664c6832b0d75d7c6e4d7618e4205ec87dec222f3c  src/test/java/bridge/array/onedimensional/test/ArraySolution11Test.java
14c54452547b526407b2e75cbbe01febf5339f157d7ee1749f146088eacdf850  src/test/java/bridge/array/twodimensional/test/ArraySolution07Test.java
da53714b9c13c722b9ca6c980281af77edd34f86a7b7ddd8be5400d9e45ca389  src/test/java/bridge/array/twodimensional/test/ArraySolution12Test.java
8c4ce22743501a432630575fb3f060ecc369aec793595f58451fc13dd5885245  src/test/java/bridge/backtracking/test/BacktrackingSolution01Test.java
7a6342a9408fc107fa01d28f57e37415227c1f40f64893c00d87116769379e37  src/test/java/bridge/backtracking/test/BacktrackingSolution02Test.java
dfa72679229d7f8b55584a9277de59abcbd3ea29b5a720c177020a6d55045610  src/test/java/bridge/backtracking/test/BacktrackingSolution03Test.java
bc173623e24c0ccebf36a20fb9754a791372ee720d330c9322e3f33272103470  src/test/java/bridge/backtracking/test/BacktrackingSolution04Test.java
5d80409051f511fb8435b00de5994ca7ecf1f1b4d500cf3fafc6fda21c140b70  src/test/java/bridge/backtracking/test/BacktrackingSolution05Test.java
430ed51649c8965670b6ed5e52731fb2dea9c9a069202e216ec485311a4ed129  src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution01Test.java
fe632724c29a4eb344a45ea1768e9943fd809d78ce36c6a1060f051e308b604e  src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution02Test.java
15e75e99c58a6a694ec86f329ea2da551d2d4b5a492295969ca607a7bfb75f12  src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution03Test.java
ac873310ad1b8fe94369965d21a42751d4fc9bd50fc6c1515bdcbc817a7a342c  src/test/java/bridge/dynamicprogramming/test/DynamicProgrammingSolution04Test.java
793226625a823d77a3a3db0980870a8980c83149ae1250a433acb7f7303fcb95  src/test/java/bridge/graph/test/GraphSolution01Test.java
846c78ca622a8cc45107107ab8f7f5d8e4d437f453d3cf53d3ec671874b6d16b  src/test/java/bridge/graph/test/GraphSolution02Test.java
42d8936a8e49ec4cb353c5eb4d222ab033cad33a6304aedd82a80adeaabf39cb  src/test/java/bridge/graph/test/GraphSolution03Test.java
06ca1315dc6f5ea94ceec28e26f172b3e0613a7c959a6cf25b4c5edf4ef5f89c  src/test/java/bridge/graph/test/GraphSolution04Test.java
9123cfe3a1e0550c7427b3c4eac262dd1347437821f6207ec5f0fe14d1c9b73c  src/test/java/bridge/graph/test/GraphSolution05Test.java
a836bc6ef5947890b28d5e3ad85b2f3a0003951a98e67502cde8546a6a0191c7  src/test/java/bridge/graph/test/GraphSolution06Test.java
7cb11c1509620f642d7f0aef9d7f298ef86d93f63a4d4c60aa0b94e530c8152d  src/test/java/bridge/greedy/test/GreedySolution01Test.java
2d5d58b67aaa5d623fd50785ec3f7e89572260cb16f50d186170b9dcaf36f7eb  src/test/java/bridge/greedy/test/GreedySolution02Test.java
9a1d233c91c60f8b143e7d171f0405ac3e35d9e8f17894117aebd2e57b822a71  src/test/java/bridge/greedy/test/GreedySolution03Test.java
1e8ac25c48d30fa0c3399162fb641d5a149139eb078778dc87be91a476c939ac  src/test/java/bridge/greedy/test/GreedySolution04Test.java
4016d23be84b494fc3e2fcca10b922eda0a63032ad734645af75ab721472206b  src/test/java/bridge/greedy/test/GreedySolution05Test.java
deefc10550548ba8e6f9d46ebd02bdf86b9dd08cb1d454495d2654aed2a755b4  src/test/java/bridge/greedy/test/GreedySolution06Test.java
639fb8a76a6ccfac5f2a6fdedcfc40c31224f5bebbb67a35d58b93e4c62be764  src/test/java/bridge/hash/test/HashSolution01Test.java
7b748b5b36c1c68cc0e886a9074e5a63abacdac3bd74282e719487afe90e9089  src/test/java/bridge/hash/test/HashSolution02Test.java
02d64421b7f01e6327fd54d5446da8c5b7160c2a4c761d96af9bf4efc306d829  src/test/java/bridge/hash/test/HashSolution03Test.java
cda35cc056082b321c00c1ebc6b1ea12ecbf4e7bd9d7bb1a2ab64ffba9917c4a  src/test/java/bridge/hash/test/HashSolution04Test.java
d349157a23f4ec9fc6b52237ea9d257ec9f3c1b5f6e43faa9d6c1b5a55525d81  src/test/java/bridge/hash/test/HashSolution05Test.java
db969c719831d68e4bbb5e50ddb599e8ff881cad73156b0dcd0487d994336cc2  src/test/java/bridge/hash/test/HashSolution06Test.java
4899d6a30751d7430c3946e319dd197d3d540d0c82d5b3d89f579c1951af0b2e  src/test/java/bridge/queue/test/QueueSolution01Test.java
3a1e28698a3c74fa73abc93ca34d5336f492044923227c1539d8c523797065fd  src/test/java/bridge/queue/test/QueueSolution02Test.java
ba47a9d2a88763b92cc08db4d4f01a8d0a53c28e2171073e3335587f545b9806  src/test/java/bridge/queue/test/QueueSolution03Test.java
0c979232a37485150ab8f6897170f91f6360b8f7d9c5310d57f9cdb1f58b90e4  src/test/java/bridge/queue/test/QueueSolution04Test.java
436c2eebea27bf133629026c2130bbacaf87b566afa970c9700051e10984ed1a  src/test/java/bridge/set/test/SetSolution01Test.java
df908e8c449390f51cb7a99e63ed1ef59000b83449908492f3b1e28ea5980955  src/test/java/bridge/set/test/SetSolution02Test.java
6087e61bd3ebec75bc131b12d828ec9d66829a172d45e1891e9314461c58c398  src/test/java/bridge/set/test/SetSolution03Test.java
a5f143c24176167d8067b8aba7eedeba9aa0131f2c8daabe09517f30ff0f1026  src/test/java/bridge/set/test/SetSolution04Test.java
29cdd6ecde03208edf9b7e277e4e4fd8fdc9dd20383af9801a60691ddd70a0b3  src/test/java/bridge/simulation/test/SimulationSolution01Test.java
636c59866d5183be2be83dda9718207fb3c1fbde52eccf952e7bb0b09de2f826  src/test/java/bridge/simulation/test/SimulationSolution02Test.java
389026e29b7e36ad13ade3dbf3234ee56f1d2b31c690e75376bbe71d7d825293  src/test/java/bridge/simulation/test/SimulationSolution03Test.java
47e471e26a0ccd3c9b0ec7d6276f3e384918c0aca38e0c067497d92d1a24634b  src/test/java/bridge/simulation/test/SimulationSolution04Test.java
fa341b63105286793b5a54525175ea41d0f354dbb7a93fc63c9a1e61006d5620  src/test/java/bridge/simulation/test/SimulationSolution05Test.java
b12b179a52f664864da84ed6436c817e982857942008670ea1372b60819909cb  src/test/java/bridge/simulation/test/SimulationSolution06Test.java
7d3aae5889a6d73c24f4b356d02924d38cf088b22b25b6d3b854e5efd834979a  src/test/java/bridge/sorting/test/SortingSolution01Test.java
b5f8762b1284c77a1de11939ea502f035400b0a1cd860125b4749ea923f2f5af  src/test/java/bridge/sorting/test/SortingSolution02Test.java
1090cf57595180d110a291e12d6f9f0a55e047ad5378160be3bb1a658678bf20  src/test/java/bridge/sorting/test/SortingSolution03Test.java
3cd0e298439fb67db11d0bb87702e4b3ea5980d2cc4cc3eeb1132dd3492404c4  src/test/java/bridge/sorting/test/SortingSolution04Test.java
7b527863b8835abac667fe220ad416168911d7af1390e2f088a2e9a4bd192aae  src/test/java/bridge/sorting/test/SortingSolution05Test.java
7bcd73d80b170c6ab55673135812f2e7bac12049fb6665b8f07e6f21ab936c15  src/test/java/bridge/sorting/test/SortingSolution06Test.java
e3c9ab2160b4db90b4675e1a4baea8d7a51595f9023d471ac125068f8e7a5da6  src/test/java/bridge/stack/test/StackSolution01Test.java
f278b5f245ad569118699224ac2b7fe003393a4d190c9ec6bc27688a0fc3f25e  src/test/java/bridge/stack/test/StackSolution02Test.java
62e253ea9132049d63bc01ba8e87bb8cfe6ece0ef15951eafefc8984fa32b69e  src/test/java/bridge/stack/test/StackSolution03Test.java
c4268faf706a793e65393af7cb3ad2b400eebddc0c14cc634ecdbd04b462bb28  src/test/java/bridge/stack/test/StackSolution04Test.java
6e97c1c2720199f49e1c6b865cf2740203ae77a92458c066daa640baa6c6f5e8  src/test/java/bridge/stack/test/StackSolution05Test.java
a5e5c84ac30f6598ecbcf6dec9de8d97f5664452377514ad5047a63927025c84  src/test/java/bridge/tree/test/TreeSolution01Test.java
64c8557da16c9061a317047d1f6d3b994641498756e9f8a843a03aaeaf3c5a0d  src/test/java/bridge/tree/test/TreeSolution02Test.java
c061b7d9a009c751f0c73fd4318adfc0593abf64e2668507202419ba96739bea  src/test/java/bridge/tree/test/TreeSolution03Test.java
2a83d767003f5f7f38b6b8bc93cdc24d35fd1d425b1ce4769475a7f4a0375e2a  src/test/java/bridge/tree/test/TreeSolution04Test.java
998565cb72e202bb8b347ab5bbf3bed9fcb829fc83c3c936b81db6c86c14684d  src/test/java/bridge/twopointer/test/TwoPointerSolution01Test.java
7e95e0856270988812b864618392a73f06d8bcd343cea2386fe8631e866ba3f0  src/test/java/bridge/twopointer/test/TwoPointerSolution02Test.java
8e44cf047de84dd9739df221c8f5195c9e6fe048d0c4368ea367d8b2e419a9fc  src/test/java/bridge/twopointer/test/TwoPointerSolution03Test.java
2a44226f3142e543714563d40045082252cbfaa3eca7fe755979e9c1d5d55dd0  src/test/java/bridge/twopointer/test/TwoPointerSolution04Test.java
```
