# 2026-09-09 로컬 학습 문서·객관식 복습 콘텐츠

## 범위와 상태

`[확정 결정]` 이번 사용자 요청은 기존 학습 문서를 재작성하지 않고 가져와 읽기 → 단원별 객관식 → 정오·선택지별 해설 → 관련 문서 → 오답 재풀이를 실제 사용할 수 있게 하는 작은 구현이다. 전체 MVP 감사·설치 패키지·학습 과정 완성을 주장하지 않는다. 일반 제품 흐름은 [로컬 복습 설계](../designs/lesson-review.md)가 정본이다.

`[현재 사실]` 첫 제공 단원은 `javascript-notes` 과정의 `js-notes-functions`다. 기존 `javascript` 과정의 함수·스코프·클로저 교안과 기존 문항 ID·진도는 그대로 유지한다. 새로운 과정은 기존 학습 문서의 명시적인 읽기 전용 가져오기 묶음이며, 기존 과정의 교안 대체나 전체 과정 승격이 아니다.

첫 단원의 흐름 확인 후 `js-notes-values`와 `js-notes-collections`를 추가했다. 제공 콘텐츠는 원문 3개와 객관식 13문항이며 세 단원 전체를 최종 승인한 검증은 아래 독립 인계 상태로 구분한다.

작성 순서: 이 범위·사다리·경험 카드 → 원본 복사와 문항 생성 → 작성자와 분리된 내용 검증 → 실행 검증 → 통합 검증. 작성자는 자신의 문항을 최종 승인하지 않는다. 독립 판정은 아래 검증 인계에 남긴다.

## 원본과 가져오기

경로는 Obsidian Vault 기준 상대 경로이며 개인 계정의 절대 경로를 공유 콘텐츠에 넣지 않는다. 원본은 수정하지 않는다. 해시는 UTF-8 파일의 원래 바이트 SHA-256이며 가져온 Markdown도 동일해야 한다. `source.verifiedAt`은 이 작업의 출처·내용 확인 날짜이지 학습자의 숙련 증거가 아니다.

| lessonId | 원본 경로 | 원본 SHA-256 | 가져온 파일 |
| --- | --- | --- | --- |
| `js-notes-values` | `profile/경험/학습/밤데브 학습문서/03 JavaScript/01 값과 실행 흐름.md` | `f8e8830657878543ffae84334a3c33d270ec2453f486e6a77d2fafafabf4cdc5` | [values.md](../../content/lessons/javascript-notes/values.md) |
| `js-notes-functions` | `profile/경험/학습/밤데브 학습문서/03 JavaScript/02 함수.md` | `c9fa256cdd5b7e364477f0bae0ae9d0a3a750a37dc59f7f511b0c822219683f0` | [functions.md](../../content/lessons/javascript-notes/functions.md) |
| `js-notes-collections` | `profile/경험/학습/밤데브 학습문서/03 JavaScript/03 배열과 객체.md` | `9186ad12699f3ac69f0231b18ab08627513f2cabe435d8a13757825bea8dd082` | [collections.md](../../content/lessons/javascript-notes/collections.md) |

가져오기 일자: 2026-09-09. 방식: 본문 byte 동일 복사. 제목·설명·예제·절을 원문 그대로 유지하며 11절 형식으로 개작하지 않는다. 원문 저작/교정 이력은 Vault의 `profile/경험/학습/밤데브 학습문서/03 JavaScript/JavaScript 출처와 교정 기록.md`에서 추적한다. 해당 기록의 2026-09-03 승인 표기는 출처 기록에 있는 사실이며, 이번 제품 통합 PASS를 대신하지 않는다. 이번 MCQ와 문항별 학습 목표·경험 카드는 AI가 새로 작성한다.

`source.kind: user-authored`는 현재 스키마의 사용자 제공 학습 원문 분류를 재사용한 것이며, bam이 모든 문장·예제를 단독 저작했다는 주장이 아니다. 원본 기여 기록은 bam의 학습 목적·설명 기준·승인 절차·챕터 범위·자료 제공과 AI의 공식 근거 대조·교정 목록·재배열·제품 한계 조사·기록 문장 구성을 구분한다. 이 구분을 좁혀 기록하며 개인 기여 원장 본문을 앱 콘텐츠로 가져오거나 새로운 사용자 성과로 쓰지 않는다.

명시적 갱신은 원본 재독해·허용 범위 확인 → 기존 `source.sha256`와 새 원본 비교 → 의미 변경과 연관 문제 영향 확인 → 같은 ID의 안전한 갱신 또는 별도 ID 판단 → 독립 재검증 순서다. 실시간 동기화·API·검색 DB는 사용하지 않는다. 개인정보·개인 경험·강사 비공개 초기 퍼블리싱 디자인·이미지·파일은 가져오지 않는다.

## 밤위키에서 확인한 것

`schema/관리규칙.md`, `schema/사용방법.md`, `schema/정본지도.md`, `wiki/index.md`, `wiki/outputs/implementation/2026-09-09-0~2단계-구현결과.md`를 읽었다. 밤위키는 기존 학습 정본을 ID로 연결하고 SHA·출처·작업 원장을 남기는 수동 운영 체계이며, 결과물 문서는 세 업무 스킬과 공통 파일 처리기의 설치·검증 결과를 구분한다. 자연어 의미 판단은 AI 작업이며 서버가 자동 승인하는 것이 아니다. 이번 앱은 밤위키 API·Java/Spring 실습 실행기·개인 맥락을 복사하지 않고 기존 정본 재사용과 명시적 해시 추적 원칙을 적용한다.

JavaScript 출처 기록이 조사했던 다른 BAM.dev 경로의 Git·콘텐츠 수·테스트 결과는 현재 저장소 상태로 사용하지 않는다. 이번 구현 사실은 이 저장소의 실제 파일과 새 검증 결과로만 판단한다.

## 첫 단원의 학습 사다리

핵심 질문: 여러 번 필요한 계산과 판단을 입력과 결과를 가진 작은 동작으로 어떻게 나누는가?

선수: 기존 `js-02-values-control-flow`의 값·변수·조건 또는 이번에 가져온 `js-notes-values`. 이번 함수 단원의 원문에는 함수 선언·호출부터 설명되어 있다. 순수 함수와 동기 콜백을 실제 개별 코드의 입력·반환·변경 지점으로 읽되, 함수형 프로그래밍 전체나 비동기 과정을 평가하지 않는다.

| 단계 | 대상 | 학습 행동 | 지원 |
| --- | --- | --- | --- |
| L0 | 원문 예제 | 호출한 자리로 돌아오는 값과 콘솔 표시를 따로 관찰한다. | 완성된 작은 예제와 단계별 설명 |
| L1 | return·동기 콜백 문항 | 결과가 돌아오는 위치와 즉시 호출 순서를 추적한다. | 짧은 코드, 제출 후 모든 선택지 피드백 |
| L2 | 조기 반환·본문 형태·함수 경계 문항 | 조건 때문에 호출/반환/상태 변경이 달라지는 지점을 판단한다. | 요구사항과 작은 코드만 제공, 풀이 힌트 없음 |

객관식은 L1/L2 개념 판단·결과 예측의 형성 평가다. 코드를 독립 구현하는 L4나 T 성과를 증명하지 않으며, 정답률을 완전한 숙련으로 표현하지 않는다.

## 문제별 경험 카드

공통 작업 ID: `LOCAL-REVIEW-20260909`. 모든 문항의 MVP 필요성은 이미 읽은 함수 설명에서 짧은 판단·피드백·오답 회상으로 이어지는 첫 복습 사용을 가능하게 하는 것이다. 학습 목표는 각 문항의 `learningObjective`가 정본이며 이 표는 그 목표를 추가할 차별 근거다. 연결 교안은 `js-notes-functions`, 출처·확인 날짜는 아래 공식 검증이다. 전체 정답 코드를 작성하는 실행 평가 계약은 N/A이고, 제시한 JS 코드의 결과·오류만 별도 임시 Node 실행으로 대조한다.

| 문항 ID (`quiz-javascript-notes-` 뒤) | 단서·새 A / 재사용 A | 새 E / 의미 있는 C | T·단계·자기 설명 | 기존 콘텐츠와 독립성·대표 오개념·검증 |
| --- | --- | --- | --- | --- |
| `return-value` | 콘솔에 값을 보였지만 반환문이 없음. 새 A: 표시된 값과 호출 결과를 분리한다. 재사용: 함수 호출을 읽는다. | E 없음. C: 식이 계산되어도 반환하지 않으면 호출 결과로 전달되지 않는다. | T 없음, L1. “출력은 했지만 호출자가 받은 값은 별개다.” | 기존 `arrow-return`은 표현식 본문의 암시 반환이며 출력/반환 분리를 묻지 않는다. 출력값을 반환값으로 오해하는 선택지, Node 결과 6 다음 undefined. |
| `early-return` | 음수 입력 검사 뒤 콜백 호출. 새 A: 첫 return 이후 경로를 제외한다. 재사용: 조건·반환 추적. | E: 입력 검사 → 허용된 경우에만 콜백. C: 거부 입력은 콜백의 부수 효과도 발생시키지 않는다. | T 없음, L2. “이 조건에서는 뒤 함수를 호출하지 않는다.” | 기존 함수 문항에는 종료 조건과 콜백 부수 효과가 없다. return 뒤도 실행/입력 검사만 건너뜀 오개념, Node 결과 입력 확인과 calls 0. |
| `sync-callback` | 함수를 인수로 전달하고 받은 함수가 두 번 직접 호출함. 새 A: 함수 값 전달과 실제 호출을 구분. 재사용: 반환 계산. | 새 E: 첫 콜백의 반환 → 둘째 콜백의 인수. C: 동기 호출이며 비동기 예약 없음. | T 없음, L1. “콜백은 받은 쪽이 호출하며 이 코드는 즉시 두 번 계산한다.” | 기존 lexical-scope 문항과 반환 환경이 다르며 callback=비동기 오개념을 추가 검증. Node 결과 12. |
| `arrow-block-return` | 표현식에 중괄호를 추가한 뒤 undefined. 새 A 없음; 재사용: 호출 결과 추적. | E 없음. C: 표현식 본문 → 블록 본문으로 바뀌면 return을 명시해야 한다. | T 없음, L2. “화살표라도 블록의 계산식이 자동 반환되지는 않는다.” | 기존 `arrow-return`과 반대 본문 계약에서 실패 원인을 찾는다. 이름·상수만 바꾼 출력 예측이 아니며 중괄호/const/문자열 탓 오개념을 구분. Node 결과 undefined, return 수정 시 8. |
| `function-boundary` | 같은 계산 결과를 여러 화면에서 쓰되 외부 누적 상태를 바꾸지 않음. 새 A: 입력·반환·부수 효과로 함수 경계를 고른다. | E 없음. C: 반환값이 같아도 외부 값 변경 여부가 요구사항을 좌우한다. | T 없음, L2. “결과를 돌려주는 것과 바깥을 바꾸는 일을 구분한다.” | 기존 함수 문항은 외부 상태 보존 요구가 없다. 출력만 제공/누적 상태 변경/반환 없음의 대표 오답을 실제 코드와 대조. |

독립성 비교는 소재뿐 아니라 목표·결과 모양·입출력·제약·호출 순서·지원 수준을 함께 봤다. 숫자나 함수 이름만 바꾼 문제는 넣지 않는다. 사람의 판단은 첫 사용 뒤 문장 난도·분량·실제 오개념 적합성이다. 현재 원문 선수 설명이 부족하다는 사용자 피드백은 원문 재작성 대신 해당 범위를 bam에게 반환한다.

## 공식 검증 근거

확인일 2026-09-09, ECMA-262 ECMAScript 2026 고정판. Console 출력 자체는 실행 환경의 도구이며 ECMAScript 언어 기능이라고 하지 않는다. 문제의 코드 실행 환경에는 `console.log`가 제공됨을 전제로 한다.

- [Return statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-return-statement): 반환 completion과 함수 종료, return-value·early-return 근거.
- [Function / arrow definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-arrow-function-definitions): 표현식/블록 함수 본문의 반환과 함수 정의, arrow-block-return 근거.
- [ECMAScript function objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects): 호출·인수 전달·호출 결과, sync-callback·function-boundary 근거.

## 두 단원 확장 설계

총괄이 첫 함수 단원의 문서→5문항→4/5 채점→재로드 후 최근 결과→저장 오답1개→정답 재풀이 후 오답0 흐름을 확인하고 첫 단원 독립 콘텐츠 PASS를 확인한 뒤, 같은 방식의 두 단원 확대를 승인했다. 여기서는 새 본문을 집필하지 않고 준비된 원문을 그대로 가져온다. 순서는 `js-notes-values`(1) → `js-notes-functions`(2) → `js-notes-collections`(3)이며 기존 함수의 ID·slug·본문·문항을 바꾸지 않는다.

확장 공통 작업 ID는 `LOCAL-REVIEW-20260909-EXPAND`다. 필요성은 첫 함수 복습의 선수인 값·제어 흐름과 다음인 배열 처리까지 짧은 반복 사용으로 이어주는 것이다. 카드의 목표 정본은 문항 `learningObjective`, 교안 원문은 아래 가져오기 표, 출처는 이 절의 공식 근거다. 미완성 타 언어·DOM·비동기·Spring·개인 경험은 범위 밖이다.

| 단계 | 값과 실행 흐름 | 배열과 객체 | 지원 |
| --- | --- | --- | --- |
| L0 | 원문 예제의 값·상태·조건·출력 관찰 | 원문 예제의 배열/객체·결과 모양 관찰 | 원문 설명·예제 그대로 |
| L1 | binding과 속성, 숫자와 문자열 구분 | 키와 값 순회 구분 | 짧은 코드, 제출 전 답 미노출 |
| L2 | switch 종료와 반복 경계 판단 | 검색 실패·변환 순서·공유 객체 판단 | 작은 상황·계약, 제출 뒤 선택지별 해설 |

선수는 값과 실행 흐름에는 기초 코드 읽기, 배열과 객체에는 위 값과 실행 흐름 및 함수 단원이다. 모두 T 없음: 객관식만으로 구현 시작·독립 숙련을 판정하지 않는다. 사람 판단은 실제 복습 후 난도·읽기 길이·오개념 적합성이다. 기술 검증은 전 문항 단일 정답·4옵션 해설·원문 범위·중복 대조와 제시 코드 실제 Node 실행이며 공개 학습자 코드 채점 계약은 N/A다.

| 문항 ID (`quiz-javascript-notes-` 뒤) | 연결 교안 | 단서·새 A / 재사용 A | 새 E / 의미 있는 C | 단계·자기 설명 | 독립성·대표 오답·예상 검증 |
| --- | --- | --- | --- | --- | --- |
| `const-property` | `js-notes-values` | const 이름이 같은 객체를 계속 가리킴. 새 A: binding 재대입과 속성 변경 분리. 재사용: 값 추적. | E 없음. C: 객체 속성의 변경은 이름의 재대입이 아님. | L1. “const라도 그 객체의 속성은 바뀔 수 있다.” | 기존 strict-equality/truthy와 다른 불변성 오해. 정상 true, TypeError 아님. |
| `string-addition` | `js-notes-values` | 초기 count가 따옴표로 감싼 문자열. 새 A: 피연산자 타입에서 덧셈/연결 선택. | E 없음. C: 숫자처럼 보이는 문자열이므로 1을 더해도 숫자 증가가 아님. | L1. “기억한 값의 타입부터 확인한다.” | 기존 엄격 동등·truthy 문제를 복제하지 않고 + 의미를 묻는다. 결과 문자열 "21". |
| `switch-break` | `js-notes-values` | 일치 case 뒤 break가 빠짐. 새 A: 분기 진입 후 종료점을 추적. | E: 일치 분기 → 다음 case 본문. C: 뒤 case 값이 달라도 break 전에는 이어 실행. | L2. “맞는 case를 찾는 것과 그 뒤 멈추는 것은 다르다.” | 기존 if/반복 카운트와 달리 fall-through 오개념. 출력 저장, 다음 처리. |
| `loop-boundary` | `js-notes-values` | 3회 처리 요구인데 0부터 <=3 검사. 새 A: 시작·종료·갱신을 함께 추적. | E 없음. C: 목표와 같은 값에서도 한 번 더 본문 실행. | L2. “조건을 검사할 때의 값으로 횟수를 센다.” | 기존 truthy 순회와 달리 반복 종료 결함을 고친다. 기존4회, <3으로3회. |
| `filter-map` | `js-notes-collections` | 미완료 항목의 제목 배열 필요. 새 A: 결과 모양에서 선택/변환 구분. 재사용: 콜백·속성 읽기. | 새 E: 객체에서 조건 선택 → 남은 객체의 제목 변환. C: 먼저 제목만 남기면 완료 정보를 잃음. | L2. “조건에 필요한 정보를 남긴 채 고른 뒤 바꾼다.” | 기존 computed-property/forEach 출력과 달리 연산 순서 요구. 정답 배열 ["함수", "배열"]. |
| `find-missing` | `js-notes-collections` | 일치하는 항목이 없는 검색. 새 A: 값 없음 반환을 먼저 확인한 뒤 속성 읽기. | E: 검색 → 결과 없음 검사 → 표시. C: 객체 아닌 undefined가 돌아옴. | L2. “검색 성공을 가정하고 속성을 읽지 않는다.” | filter-map의 배열 결과와 구별. undefined 확인만 정답, 빈 배열/null 오해 배제. |
| `filter-shared-object` | `js-notes-collections` | filter 결과의 첫 객체 속성을 변경. 새 A: 바깥 배열과 안쪽 객체 정체성 분리. | E 없음. C: 새 배열이어도 원본과 객체 공유. | L2. “바깥 모음이 새것이어도 안쪽 대상은 같을 수 있다.” | const 속성은 binding 규칙, 이 문항은 두 배열을 잇는 공유 상태 흐름. 원본 count도0, 배열은 서로 다름. |
| `for-in-keys` | `js-notes-collections` | 배열에 for...in 사용. 새 A: 순회가 주는 키와 값을 구별. 재사용: 문자열 연결. | E 없음. C: for...of의 요소 대신 인덱스 문자열 키를 받음. | L1. “배열의 값이 필요하면 for...of를 고른다.” | 기존 computed-property는 동적 lookup, 이 문항은 순회 계약. 추가 속성 없는 보통 배열에서 출력 "01". |

배열의 동적 속성 접근은 기존 `computed-property` 문항과 같은 판단이어서 추가 후보에서 제외했다. `forEach` 반환값을 상수만 바꿔 다시 묻는 문제도 생성하지 않는다.

확장 공식 확인일: 2026-09-09, ECMAScript 2026 고정판.

- [Statements and declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html): lexical declaration, switch/break, while, for-in/for-of 계약. const-property·switch-break·loop-boundary·for-in-keys 근거.
- [Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html): 속성 대입 및 문자열 + 평가. const-property·string-addition 근거.
- [Array objects](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array-objects): filter가 선택한 값을 새 배열에 넣는 것, map 결과와 find 미일치 undefined. 배열 처리 3문항 근거.

## 검증 인계

- 생성자 관리 점검: 원본 경로·SHA·허용 범위·목표 연결 확인. `cmp`로 함수 원본과 가져온 파일의 바이트 동일 확인(exit 0); `shasum -a 256 content/lessons/javascript-notes/functions.md` 결과는 위 SHA와 동일하다.
- 생성자 focused 검사: Node `v24.17.0`, `node --input-type=module`의 임시 읽기 전용 검사에서 실제 JSON 문항 코드를 `node:vm`의 새 context(1초 제한)에 실행했다. 5문항의 단일 정답·4개 고유 선택지·학습 목표·피드백을 확인했고, 결과/상태 12개 assertion이 통과했다. return-value는 `[6, undefined]`, early-return은 `message = "입력 확인" / calls = 0`, sync-callback은 `12`, arrow는 `before(4) = 8 / after(4) = undefined`, 함수 경계는 C만 `90` 반환·total `0`·콘솔 출력 없음이라는 계약을 만족한다. 이것은 작성자 점검이며 독립 승인이나 실제 UI 검증이 아니다.
- 기존 콘텐츠 보존: 작업 직전 `/tmp` 보호 사본과 새 JSON에서 `javascript-notes` 묶음을 제외한 레코드를 구조 비교했다. 기존 과정·교안·14개 JavaScript 문항은 내용과 상대 순서가 동일하다. 원본 Vault에는 쓰기 명령을 실행하지 않았다.
- 생성 후 `npm run validate:content` 통과: 이 시점 저장소는 교안 32개·객관식 44문항이었다. 수량은 첫 단원 반입 시점의 검사 로그이지 이후 확장된 현재 총량의 정본이 아니다.
- 확장 생성자 focused 검사: 같은 Node 환경에서 새 8문항의 실제 코드와 선택지 코드를 실행해 결과·오류·원본 보존·수정 전후 23개 assertion 통과. 값 단원은 `true`, 문자열 `"21"`, switch의 `저장 → 다음 처리`, while `4회 → 조건 수정 후 3회`를 확인했다. 배열 단원은 filter→map의 제목 배열, find 미일치와 잘못된 속성 접근 TypeError, 새 배열/공유 객체, for-in `"01"`과 for-of `"HTMLCSS"`를 확인했다. 최종 13문항 전부 단일 정답·옵션 고유성·피드백·목표를 확인했다.
- 확장 가져오기·보존 검사: 3개 원본/복사본의 바이트·SHA 동일, 기존 교안·과정·14문항 및 첫 함수 5문항 불변을 Node `assert`로 확인했다. 함수 metadata는 승인된 order `1 → 2` 외에는 동일하다. 확장 후 `npm run validate:content` 통과: 검사 시점 34교안·52객관식. 전체 테스트·빌드는 생성자 범위에서 실행하지 않았다.
- `content_validator`, `test_engineer`, `project_integrator`의 최신 독립 판정·환경·검증 증거는 [작업 카드의 독립 검증 인계](../work-items/2026-09-09-local-review.md#독립-검증-인계)에만 기록한다. 이 문서는 생성자의 관리·자체 검사 이력과 콘텐츠 근거를 보존하며 독립 결과를 복제하지 않는다.

생성자의 focused 검사 통과만으로 이 단계들을 PASS로 바꾸지 않는다.
