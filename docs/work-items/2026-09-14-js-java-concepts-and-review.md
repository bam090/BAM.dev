# JavaScript·Java 개념 문서와 객관식 확장

## 상태와 승인 범위

`[확정 결정]` bam의 “자바스크립트랑 자바도 고고”와 2026-09-14 “개선된 수정 방안으로 진행하고 문서도 업데이트해 놔. 객관식 문제도 추가해 놔” 요청을 한 작업 묶음으로 진행한다. 문제와 보기는 처음 읽었을 때 판단 대상과 요구 행동을 알아볼 수 있게 작성한다. 원문 기반 문서 분할·목표·요약·핵심 질문·직접답·선수·문제 연결의 재구성은 이번 범위의 명시적 승인이다.

`[현재 사실]` 새 개념 문서·문항·공유 상세 연결과 보관 처리를 로컬 코드·JSON에 반영했다. 독립 `content_validator`의 정적 내용 판정은 PASS_CONTENT_REVIEW이며 반환 수정 후 `validate:content`와 테스트 작성자의 focused 67/67도 통과했다. 독립 `test_engineer`는 실제 데스크톱 JS·Java 왕복을 확인해 PASS_TEST_ENGINEER로 판정했다. 독립 문서 검토는 PASS_DOC_FINAL_STATE이며 `project_integrator`는 두 차례 반환 수정 후 전체 gate 637/637·정적 빌드·보존 검사를 통과해 최종 통합을 PASS_PROJECT_INTEGRATION으로 판정했다. Git 게시·merge·배포는 수행하지 않았다.

## 작업 카드

| 항목 | 이번 계약 |
| --- | --- |
| 작업 ID·유형 | `JS-JAVA-CONCEPTS-REVIEW-20260914`, 학습 콘텐츠 포함 기능 |
| 성격·필요성 | 승인 원문의 의미 단위 재구성, 기존 학습 경험 재사용과 누락된 개념 판단 문제 추가. 학습문서·객관식 첫 제공 범위에 속하며 설치형 release 전체 완료와는 별개 |
| 현재·목표 정본 | [학습 복습](../designs/lesson-review.md#javascriptjava-개념-문서와-객관식-전환), [데이터 계약](../content-schema.md#javascriptjava-파생-교안과-공유-상세-문서), [저작 계약](../lesson-authoring.md#승인된-javascriptjava-파생-교안의-작은-단위) |
| 원문 | 밤위키 `wiki/학습자료/밤데브 학습문서/03 JavaScript/`와 `04 Java/`의 공개 승인 교안. 읽기 전용이며 개인 `profile` 기록을 새 제품 원문으로 읽거나 반입하지 않음 |
| 새 교안 범위 | 각 언어 32개 의미 단위 반영. 비교쌍·선수·하나의 핵심 판단으로 정했으며 실제 단위·근거는 아래 표에 기록 |
| 보존·보관 | 기존 JS runtime 1개는 활성·본문 그대로, 나머지 JS 9개와 Java 1개는 보관 표시만 추가. 기존 교안 ID·URL·순서·본문·완료와 기존 문항 JS 27개·Java 1개 객체를 보존 |
| 새 ID·순서 | `js-concept-<key>`·`java-concept-<key>`, `wiki-<key>` slug, `content/lessons/<courseId>/wiki-<key>.md`. 과정 `javascript`의 order 8~39, `java`의 order 2~33. 기존 내부 order 유지 |
| 목표·직접답 | 새 단위마다 한 판단의 목표·한줄 요약·`essentialQuestion`·`answerHeading: 핵심 질문 답`·선수·작은 예제·오개념·출처를 정렬. runtime은 기존 ID·본문·활성을 유지하며 별도 최소 표시 보완 검토 전에는 답변 metadata를 바꾸지 않음 |
| 객관식 | 각 단위에서 구별되는 약 두 판단을 검토하되 기존 문항으로 충족하면 재사용. 새 문항만 각 언어 JSON에 추가. 모든 새 문항은 아래 경험 기준과 [문항 작성 기준](../designs/lesson-review.md#객관식-문항-작성과-검토-기준)을 충족 |
| 제품 변경 | 같은 언어·언어 카테고리 안의 공유 상세문서 매핑, 안전하게 확인된 동일 개념 묶음의 카드·CTA 중복 제거. 기존 v1 언어+개념 풀이 route 재사용 |
| 완료 행동 | 주제에서 개념 문서를 찾고 한 목표·질문·직접답으로 학습한 뒤 실제 문항을 풀며 같은 개념 상세 절과 원래 문제 상태를 왕복. 기존 깊은 URL과 수동 완료·풀이 이력 유지 |
| 접근성·플랫폼·오프라인 | 데스크톱 웹 우선, 기존 키보드·초점·접힌 답·상태 안내 유지. 정적 교안·JSON·기존 저장소 재사용. 모바일 구현·검사·디자인 변경 없음 |
| Java 제공 상태 | 새 정적 문서·객관식 제공과 연결을 반영해 언어·과정 `available`로 표시. Java 실행기·Spring·설치 지원·MVP release 완료를 뜻하지 않음 |
| 경로 소유권 | 문서 담당: 이 카드와 관련 기존 정본. 언어별 작성자: 지정 새 교안·문항 fragment. 관리자: curriculum·review-concepts·quiz 조립. 제품 구현자: 공유 연결·목록 코드. 테스트 작성자: 영향받는 테스트. 겹치는 경로는 실제 diff 확인 뒤 순차 인계 |
| 독립 역할·순서 | 작성·관리/필요 제품·테스트 변경 → `content_validator` → `test_engineer` → `project_integrator`. 작성자는 자기 산출물을 승인하지 않으며 세 검증 역할은 분리 |
| 검사 | 작성 중 schema·ID·관련 focused 검사, 독립 내용·정답·대표 오답·문서 연결 감사, 대표 데스크톱 왕복. 전체 gate·재검증은 [공통 규칙](../development-workflow.md#공통-검증과-재검증)에 따라 안전한 최종 통합 위치에서 수행 |
| 비범위·Git | HTML·CSS·알고리즘·Quest·코딩테스트·웹과제·평가기·기존 저장 키·위키 폴더/설정·비공개 자료·금지 디자인 자산 보존. Git 게시·merge·배포·새 의존성 추가 없음 |
| bam 판단 | 현재 위 범위에 추가 사용자 결정 없음. 승인 원문 밖 보충이나 학습 계약을 크게 바꾸는 새 미결정만 반환 |

## 묶음 학습 경험 설계

| 경험 카드 항목 | 집필 전 기준 |
| --- | --- |
| 대상 | `js-concept-*`·`java-concept-*`의 승인 단위와 연결된 신규 객관식. 개별 문항 ID·경험 차이는 작성자 인계에서 고정 |
| 선수·연결 교안 | 각 언어의 값·실행 기초 → 함수/메서드·자료 표현 → 상태·객체·오류 → 언어별 비동기/자원/종합 흐름. 단위별 실제 선수는 원문 매핑으로 확인 |
| 발견할 단서 | 주어진 값의 타입·상태 공유 여부·호출 순서·반환 형태·실패 위치·입출력 조건. 문제는 이 단서를 빠짐없이 제시하되 정답 판단을 주석으로 알려 주지 않음 |
| 새 A | 기존 28문항이 다루지 않은 조건에서 타입·자료 구조·상태 경계·실패 처리 위치를 선택하는 실제 행동. 이름·소재만 바꾼 문제는 새 A로 인정하지 않음 |
| 재사용 A | 기존 타입·연산·조건·반환·배열 변환·DOM·비동기와 Java 타입/메서드 판단. 새 단위의 직접답 지원은 기존 경험 재사용과 구분 |
| 새 E | 입력 해석 → 타입/모양 확인 → 상태 변경 → 결과 반환/표시, 또는 자원 획득 → 사용 → 실패 처리/정리 등 기존 문항이 확인하지 않은 연결을 선택하는 기회 |
| 의미 있는 C | 공유 객체/새 바깥 복사, 반환/바깥 변경, 부재/실패, HTTP 상태/본문 모양, Java 참조/값 비교·컬렉션 순서·예외/자원 종료처럼 판단이 달라지는 조건 |
| T | 이번 객관식은 선택지가 있는 L1/L2·일부 지원 있는 L3다. 무힌트 구현·전이 성과를 주장하지 않으며 L4 추가를 개수 채우기 위해 요구하지 않음 |
| 사다리·지원 | 교안의 L0 관찰과 작은 예제 → 단일 판단 L1 → 조건 변화 L2. 필요한 경우 가까운 행동 연결 L3. 답변은 접힌 직접답·채점 뒤 보기별 이유로 제공 |
| 자기 언어 설명 | “이 조건에서는 어떤 값/상태/결과를 기준으로 이 동작을 선택하며, 다른 보기가 적용되지 않는 이유는 무엇인가?”를 해당 개념의 구체적 대상에 맞게 설명 |
| 독립성 비교 | 기존 문항의 대상·조건·요구 결과·필요 판단을 비교한다. 같은 판단이면 재사용하고, 각 신규 문항은 새 A/E/C 중 최소 한 근거를 인계한다. 단순 분할·문서 수·보기 수는 근거가 아님 |
| 대표 오개념 | 타입과 표시 모양 혼동, 반환과 출력 혼동, binding 재대입과 공유 객체 변경 혼동, 비동기 시작/완료 순서 혼동, Java `==`/내용 동등성·오버로딩/오버라이딩·순서 보장/관측 결과 혼동 |
| 공개·독립 검증 | 네 보기·정확히 한 정답·모든 보기의 이유·충분한 타입/코드/조건·정답 누설 없음. 원문/공식 근거와 손 추적, 대표 JS 코드 실행을 교차 확인하며 출력·컴파일 미실행을 구분 |
| 출처·확인일 | 실제 공개 원문의 전체 SHA·원문 절·기존 제품 보완·새 재구성 구간을 단위별 기록. 원문의 과거 승인·공식 확인 날짜를 이번 파생 예제 실행 PASS로 쓰지 않음 |
| 현재 고정값·남은 판정 | 새 문항 105개와 실제 발췌를 작성·조립 결과로 고정했다. 독립 내용·데스크톱 실행 PASS와 남은 통합 판정을 구분하며 새 사용자 gate는 없음 |

신규 문항은 작성자가 집필 전에 기존 문항 대비 새 A/E/C 근거를 fragment에 남긴 뒤 생성했다. 아래 개별 등록부에 실제 문항 ID와 근거를 합쳤다. 기존 문항을 수정해야만 해결되는 결함은 보존 계약과 충돌하므로 별도로 반환하며 기존 정답·보기 객체를 조용히 고치지 않는다.

## 연결·상태 보존과 검증 경계

- `reviewConcept.lessonId`는 문항 소유 교안이다. `documentLessonId`는 실제 발췌·heading·상세 읽기 대상이며 둘의 역할을 합치거나 문항 소유를 새 문서로 옮기지 않는다.
- 같은 과정이면 기존 계약을 따른다. 다른 과정은 두 과정 모두 `categoryId: language`이고 같은 `languageId`인 경우에만 허용한다. 같은 JavaScript 언어라도 알고리즘 과정으로 건너갈 수 없다. 양쪽 교안의 존재·concept 선언, 실제 문항의 소유·언어, heading·발췌의 정확성을 계속 검증한다.
- 한 언어의 해당 concept 문항 전부가 같은 상세 문서와 주제로 확인된 경우에만 목록·문서 CTA를 한 키워드 묶음으로 합친다. `lessonId: null`인 기존 v1 언어+개념 route로 전체 해당 문항을 풀며, 조건을 증명할 수 없으면 기존 소유별 카드를 유지한다. 기존 소유 단원 URL도 계속 유효하다.
- 이 묶음은 카드 중복 제거와 문제 범위 선택이다. 문제 전부 보기 UI·전체 채점·새 복합 개념 schema·v2 진행 저장을 추가하지 않는다.
- 새 문항 추가로 언어 전체·키워드 세션의 문항 집합 서명이 바뀔 수 있다. 기존 콘텐츠 변경 안내·복구 안전 계약을 따르며, 기존 28문항 객체·완료 기록 보존을 모든 활성 세션의 무조건 동일 상태 보존으로 표현하지 않는다. 저장 키·원문 완료를 새 ID로 복사하거나 초기화하지 않는다.
- Java 교안·문항은 정식 Java 25 기준으로 preview 없이 작성한다. 이번 앱은 정적 코드를 보여 주며 Java 코드를 실행하지 않는다. Java 컴파일·실행 계약이 이번 정적 검토에 적용되지 않으면 N/A와 이유를 남기고 컴파일 성공을 주장하지 않는다. 원문·공식 근거·손 추적에 의한 정확성 감사는 유지한다.

## 현재 반영과 보존

전체 교안은 133개이며 활성 112개(HTML 15·CSS 20·JavaScript 33·Java 32·알고리즘 12)와 보관 21개를 구분한다. JavaScript 활성은 기존 runtime 1개와 새 32개다. 객관식은 전체 157문항(JS 69·Java 64·HTML 12·CSS 12)이며 이번 추가는 JS 42·Java 63의 105문항이다. 실제 소유 교안·개념별 발췌는 105 pair다. Code Quest 18개·JavaScript 코딩테스트 6개·Web Project 1개는 이번에 추가하지 않았다.

조립 직전 미커밋 CSS 작업까지 포함한 기존 69본문은 SHA가 모두 같으며 기존 52문항 객체도 보존했다. 관리자는 기존 JS 27·Java 1문항을 사전 객체와 대조했고, 총괄은 시작 시점 52문항 전체 객체의 불변을 별도 비교했다. 관리자는 그 뒤 HTML/CSS 파일 SHA도 재확인했다. HTML·CSS·알고리즘과 선행 사이드바 변경을 이번 새 작업으로 계산하지 않는다.

기존 JS 9개와 Java 1개에는 `archivedFromCatalog: true`만 추가했다. ID·slug·내부 order·본문·source·objectives·conceptIds와 깊은 URL·진도는 그대로다. 기존 `js-01-runtime`은 활성·본문·metadata를 보존했으며 `면접 답변 예시` 형식과 `answerHeading` 없는 상태도 유지했다. 모든 기존 문서가 새 직접답 UI로 통일된 것은 아니다. 새 완료 상태는 사용자가 별도로 표시한다.

기존 저장 키와 복귀 토큰·세션·문항·대상 문서 검사를 유지했다. 문항 집합이 커진 키워드 세션에는 기존 콘텐츠 변경 안내가 적용되며 기존 문제 객체 보존을 모든 활성 세션의 서명 불변으로 주장하지 않는다.

제품의 `getReviewDocumentLesson`은 같은 과정 또는 같은 언어의 language 카테고리 과정 사이만 상세 문서를 연결한다. `getKeywordReviewScope`는 여러 소유자의 같은 concept 문항 전부가 실제 동일 문서·주제로 확인될 때만 기존 v1 언어+개념 범위를 쓴다. 단일 소유자 또는 누락·불일치 매핑은 기존 소유 범위를 유지한다. 목록 카드와 문서 CTA는 이 범위의 같은 URL만 한 번 표시하며, 다른 conceptId는 같은 문서여도 합치지 않는다. 검색에 새 문항이 걸려도 카드 문항 수는 확인된 전체 키워드 범위를 유지한다.

Java `available`은 정적 문서·객관식 상태다. 콘텐츠 검사의 Code Quest 필수 제공과 앱의 초기 Quest 컬렉션 로드·해시 진입·실제 열기는 모두 현재 `javascript`, `html`, `css` 중 available인 언어로 제한한다. 미제공 Java Quest는 기존 기본 JavaScript 교안으로 복귀하며 Java 정적 학습·객관식은 계속 제공한다. 해당 세 언어의 Quest 누락 오류와 모든 컬렉션의 schema·ID·공개 테스트·runner 검사는 유지한다. Java runner·Spring·설치 앱·React 이관·새 capability 스키마·외부 의존성은 추가하지 않았다.

## 공개 원문과 보완 계보

아래 JS01~JS10은 공개 승인 `wiki/학습자료/밤데브 학습문서/03 JavaScript/`, J01~J10은 `04 Java/` 아래 파일이다. 경로는 curriculum source.originalPath와 같으며 SHA는 원본 **전체 바이트**다. 줄 범위는 원문 frontmatter를 포함한다. JS의 source.verifiedAt은 2026-09-02, Java는 2026-09-03, 이번 importedAt은 모두 2026-09-14다. 원문의 확인·승인일을 이번 파생 예제 실행 PASS로 바꾸지 않았다.

`source.kind: user-authored`는 승인 원문의 반입 분류다. 이번 목표·요약·질문·직접답·작은 예제·문항은 사용자가 명시적으로 요청한 AI 파생 작성이며 `importMode: derived`로 관리한다. 원문의 의미와 필요한 조건을 재구성한 것이며 모든 문장이 밤이 직접 쓴 원문이라는 뜻은 아니다. 비공개 개인 기록·강사의 금지 자산·원문 설정은 반입하거나 변경하지 않았다.

| 출처 키 | 공개 원문 파일 | 원본 SHA-256 |
| --- | --- | --- |
| `JS01` | 01 값과 실행 흐름.md | `39fdbd7cd80c55d751f45982bda0e935dae416d55cdad0022d55013de2e84a80` |
| `JS02` | 02 함수.md | `2d8f8af7238851f1729099f7eab1229a8bd4dc4da576a6efe6daedf1ba953d70` |
| `JS03` | 03 배열과 객체.md | `bf4e5809e5b8f39af9791d1e40aca9577276b1e717db877c7d18ec5d9228624e` |
| `JS04` | 04 참조 공유와 복사.md | `12705d4f8a535d8c47afcc08eca010e6ffc0c624c2c9d0fb631a61d940e5aa09` |
| `JS05` | 05 스코프·클로저·객체 모델.md | `d37a775d9e14ece4db55ca58b0cf9fa5ef424f9b8908acd6402f246b9bec6aff` |
| `JS06` | 06 DOM·폼·이벤트.md | `165e138a12883e07244d8138d2d08330bb2ffe85e9e23d44c4dc653eeb3e490c` |
| `JS07` | 07 오류와 디버깅.md | `7180cb8e1e3e59d0f04080e976f269fe6633d58eecc8ff648607274b81896dde` |
| `JS08` | 08 비동기 흐름.md | `100ab9179962654d71a0d95b4b44ded8a90492be30dec85083850c6b841806a4` |
| `JS09` | 09 데이터 보존과 HTTP.md | `a4c648fa9543f8cc32399a62deb4a1b4fadf69ec3d9247df42f04f9dbbc26a59` |
| `JS10` | 10 JavaScript 흐름 종합.md | `559e7f5aea97325d0c5e6435d3f57dd57f3484a25082aa5e7312be8e8ad4a16e` |
| `J01` | 01 Java란 무엇인가.md | `f99781e3ad03e4dd949538e426083fb8716038d6b8c2e0e36b384292fc9ec18c` |
| `J02` | 02 배열·문자열·메서드.md | `16ff16658ac8efb7fd6b92275d94ff76e0c767c0b8f4aa5a689c20aa3f2cdbb4` |
| `J03` | 03 클래스·객체와 캡슐화.md | `9c89c66e0c8a0f1382d7cab00bba6080cd2820ef3ce2666b664e3e4bb37c9acc` |
| `J04` | 04 static·final과 객체 비교.md | `9901786150d68d05087621cce2fa72fba396a2112c9abb88e783b121830ec210` |
| `J05` | 05 상속·인터페이스와 다형성.md | `347bf0700b273faee3ee68a7af4633597035b478340e8c0b317b0610c2343ce3` |
| `J06` | 06 제네릭과 컬렉션.md | `0623b42da32a253ab2750aa93dd6e190614deb0869d95d904e9051ec415b15c2` |
| `J07` | 07 예외와 자원 정리.md | `a849953fd7843789ca1beec966f9a14f8b5718de9a80c7e27d5b3223674a09e9` |
| `J08` | 08 람다·Stream과 날짜·시간.md | `c4cbfc4995f1ce5b3127d8d7424b05365de76863c89df251dcbffb6b60f0ebd1` |
| `J09` | 09 여러 작업과 공유 상태.md | `bc84352b8c1f9140bfc1a6e86db3df0f8b18b8b43400e7df9a99d9d89bde684e` |
| `J10` | 10 테스트와 Java 흐름 정리.md | `1957b34641de4cad3439169930c810e8f4defc691c4a4ff12a1ab9f36537de44` |

기존 제품 보완은 아래 보존 본문에서 가져왔다. 위키 원문으로 출처를 덮어쓰지 않으며 상세 사용 절은 단위 표에 남긴다. PJS1은 새 원고 보완이 아니라 활성 runtime과 기존 두 문항의 self 발췌 근거다.

| 보완 키 | 기존 제품 본문 | 보존 SHA-256 |
| --- | --- | --- |
| `PJS1` | [javascript-and-runtime.md](../../content/lessons/javascript/javascript-and-runtime.md) | `b2f320742ccb657022d1cfd0cd1964676ddb54f2127bb7cb6881bb971a0c5e8c` |
| `PJS2` | [values-variables-control-flow.md](../../content/lessons/javascript/values-variables-control-flow.md) | `11da9652f2139d0b176d4aea4788b06fb470be50022b804dd08072eef9fbaddf` |
| `PJS3` | [functions-scope-closure.md](../../content/lessons/javascript/functions-scope-closure.md) | `562e9e8c7441a0cb14b4ee363351f8fd97bee1ca80d99707693145e0ead021ed` |
| `PJS4` | [arrays-objects-built-ins.md](../../content/lessons/javascript/arrays-objects-built-ins.md) | `b0ab5deb35ea73a1766062f269132416697e2930fbfc19f8061aea97deda77f3` |
| `PJS5` | [dom-and-events.md](../../content/lessons/javascript/dom-and-events.md) | `cd28ae933b6b37e3bcac91234d03081c2ba4905f81f44b9abfa83b9aadf7a47c` |
| `PJS6` | [async-await-fetch.md](../../content/lessons/javascript/async-await-fetch.md) | `55aeb7ad3ac44841aedabe68a69710c3a8dc89fa9cc26a5f7aa172709741fb06` |
| `PJS7` | [review-and-practice.md](../../content/lessons/javascript/review-and-practice.md) | `20343ef86b7ff0a724e586e6dda557519b773972eef147d1efde99e3ae3b1ed4` |
| `PJ1` | [types-and-methods.md](../../content/lessons/java/types-and-methods.md) | `c9401fbfb815e197eaa09a54d64dd88ae0b29dcd2d268c93f7b7a6ce982cf112` |

## 단위와 문항 연결

단위별 목표·요약·핵심 질문·직접답의 문구 정본은 [curriculum](../../content/curriculum.json)과 아래 실제 본문이다. 여기서는 해당 문구를 다시 복제하지 않고 ID·범위·연결을 추적한다. JS 새 ID는 `js-concept-<key>`·order 8~39, Java는 `java-concept-<key>`·order 2~33이며 slug는 공통 `wiki-<key>`다. `JSQ`·`JQ`는 아래 신규 문항 등록부, `L`은 기존 28문항 매핑의 행 번호다. 단위 표의 모든 문항은 실제 문항 소유와 발췌로 해당 문서에 연결된다.

| 단위 | key·실제 학습문서 | 원문 절·보완 계보 | 연결 문항 등록 |
| --- | --- | --- | --- |
| `JSU01` | `values-types` · [값과 타입 구분하기](../../content/lessons/javascript/wiki-values-types.md) | JS01 15–68 | `JSQ01`, `JSQ02` |
| `JSU02` | `variables` · [const·let과 재대입](../../content/lessons/javascript/wiki-variables.md) | JS01 70–97; 보완 JS04 92–113 | `L06`, `JSQ03` |
| `JSU03` | `operators` · [계산·비교와 조건의 값](../../content/lessons/javascript/wiki-operators.md) | JS01 99–155; 보완 PJS2 43–51, 64–123, 161–172 | `L07`, `L16`, `L17` |
| `JSU04` | `control-flow` · [조건과 반복의 실행 경계](../../content/lessons/javascript/wiki-control-flow.md) | JS01 157–269 | `L08`, `L09` |
| `JSU05` | `function-return` · [함수의 입력과 반환](../../content/lessons/javascript/wiki-function-return.md) | JS02 15–139, 178–205, 244–274 | `L01`, `L02`, `L04`, `L18` |
| `JSU06` | `callbacks` · [함수 값과 동기 콜백](../../content/lessons/javascript/wiki-callbacks.md) | JS02 141–176, 244–274 | `L03`, `JSQ04` |
| `JSU07` | `function-effects` · [계산과 부수 효과의 경계](../../content/lessons/javascript/wiki-function-effects.md) | JS02 207–243; 보완 JS04 235–252 | `L05`, `JSQ05` |
| `JSU08` | `arrays-objects` · [배열과 객체로 정보 담기](../../content/lessons/javascript/wiki-arrays-objects.md) | JS03 15–59, 97–158 | `L20`, `JSQ06` |
| `JSU09` | `iteration` · [값 순회·키 순회·각 요소 처리](../../content/lessons/javascript/wiki-iteration.md) | JS03 61–95; 보완 PJS4 34–73 | `L13`, `L21` |
| `JSU10` | `array-methods` · [결과 모양으로 배열 메서드 고르기](../../content/lessons/javascript/wiki-array-methods.md) | JS03 160–287; 보완 PJS4 34–49 | `L10`, `L11` |
| `JSU11` | `object-sharing` · [같은 객체의 공유와 재대입](../../content/lessons/javascript/wiki-object-sharing.md) | JS04 15–113, 235–252 | `JSQ07`, `JSQ08` |
| `JSU12` | `shallow-copy` · [얕은 복사와 바꿀 경로](../../content/lessons/javascript/wiki-shallow-copy.md) | JS04 115–247, 254–286; 보완 JS03 241–254 | `L12`, `JSQ09` |
| `JSU13` | `scope-hoisting` · [스코프와 선언 전 접근](../../content/lessons/javascript/wiki-scope-hoisting.md) | JS05 16–132, 168–191 | `JSQ10`, `JSQ11` |
| `JSU14` | `closure` · [호출 뒤에도 이어지는 클로저](../../content/lessons/javascript/wiki-closure.md) | JS05 81–111, 134–166; 보완 PJS3 96–124 | `L19`, `JSQ12` |
| `JSU15` | `object-model` · [prototype·class와 메서드 호출](../../content/lessons/javascript/wiki-object-model.md) | JS05 193–283 | `JSQ13`, `JSQ14` |
| `JSU16` | `dom-properties` · [DOM의 현재 값을 읽고 바꾸기](../../content/lessons/javascript/wiki-dom-properties.md) | JS06 15–89, 294–296; 보완 PJS5 33–88, 244–256 | `L22`, `JSQ15` |
| `JSU17` | `forms-state` · [폼 입력에서 상태와 화면으로](../../content/lessons/javascript/wiki-forms-state.md) | JS06 91–224, 317–335 | `JSQ16`, `JSQ17` |
| `JSU18` | `event-delegation` · [이벤트 대상과 위임](../../content/lessons/javascript/wiki-event-delegation.md) | JS06 226–296 | `L23`, `JSQ18` |
| `JSU19` | `event-defaults` · [기본 동작 취소와 전파](../../content/lessons/javascript/wiki-event-defaults.md) | JS06 298–315 | `JSQ19`, `JSQ20` |
| `JSU20` | `errors-input` · [입력 검증과 오류 종류](../../content/lessons/javascript/wiki-errors-input.md) | JS07 15–110 | `JSQ21`, `JSQ22` |
| `JSU21` | `error-boundaries` · [예외를 처리하는 위치](../../content/lessons/javascript/wiki-error-boundaries.md) | JS07 112–213 | `JSQ23`, `JSQ24` |
| `JSU22` | `debugging` · [실제 값으로 디버깅하기](../../content/lessons/javascript/wiki-debugging.md) | JS07 261–311 + 제품 review-and-practice 65–77; 보완 PJS7 65–77 | `L27`, `JSQ25` |
| `JSU23` | `promise-chain` · [Promise 상태와 반환 연결](../../content/lessons/javascript/wiki-promise-chain.md) | JS08 49–121 | `L24`, `JSQ26` |
| `JSU24` | `async-await` · [async·await와 실패 처리](../../content/lessons/javascript/wiki-async-await.md) | JS08 123–143, 236–261 + JS07 215–259; 보완 JS07 215–259 | `JSQ27`, `JSQ28` |
| `JSU25` | `async-state` · [비동기 화면의 진행 상태](../../content/lessons/javascript/wiki-async-state.md) | JS08 144–234 | `JSQ29`, `JSQ30` |
| `JSU26` | `async-composition` · [의존 작업과 함께 기다리기](../../content/lessons/javascript/wiki-async-composition.md) | JS08 263–321 + JS09 240–276 + 제품 async-await-fetch 129–151; 보완 JS09 240–276, PJS6 129–151 | `L25`, `JSQ31` |
| `JSU27` | `event-loop` · [동기 코드·microtask·task 순서](../../content/lessons/javascript/wiki-event-loop.md) | JS08 15–47, 323–339 | `JSQ32`, `JSQ33` |
| `JSU28` | `json` · [JSON 변환과 데이터 검증](../../content/lessons/javascript/wiki-json.md) | JS09 43–125 | `JSQ34`, `JSQ35` |
| `JSU29` | `web-storage` · [Web Storage의 저장과 복원](../../content/lessons/javascript/wiki-web-storage.md) | JS09 16–42, 127–194 | `JSQ36`, `JSQ37` |
| `JSU30` | `http` · [HTTP 요청·응답과 origin 경계](../../content/lessons/javascript/wiki-http.md) | JS09 196–239, 298–308, 39–41 | `JSQ38`, `JSQ39` |
| `JSU31` | `fetch` · [fetch 응답의 실패 경계](../../content/lessons/javascript/wiki-fetch.md) | JS09 240–297 + 101–125 | `JSQ40`, `JSQ41` |
| `JSU32` | `flow-review` · [입력부터 최신 화면까지 종합](../../content/lessons/javascript/wiki-flow-review.md) | JS10 15–352 + 제품 review-and-practice 33–77; 보완 PJS7 33–77 | `L26`, `JSQ42` |
| `JU01` | `runtime` · [Java 코드가 실행되기까지](../../content/lessons/java/wiki-runtime.md) | J01 15–79 | `JQ01`, `JQ02` |
| `JU02` | `types-variables` · [타입과 변수의 값](../../content/lessons/java/wiki-types-variables.md) | J01 80–121; PJ1 기본/참조 타입 설명은 보완 계보 | `JQ03`, `JQ04` |
| `JU03` | `numeric-operations` · [계산 전에 정하는 숫자 타입](../../content/lessons/java/wiki-numeric-operations.md) | J01 122–161; J10 117–144의 long 중간 계산은 선택 보완 | `JQ05`, `JQ06` |
| `JU04` | `control-flow` · [조건과 반복의 실행 경계](../../content/lessons/java/wiki-control-flow.md) | J01 162–269 | `JQ07`, `JQ08` |
| `JU05` | `arrays` · [배열의 원소와 경계](../../content/lessons/java/wiki-arrays.md) | J02 15–72; PJ1 73–101의 선언 후 new int[] 보완 | `JQ09`, `JQ10` |
| `JU06` | `strings` · [문자열의 값과 조립](../../content/lessons/java/wiki-strings.md) | J02 73–138 | `JQ11`, `JQ12` |
| `JU07` | `methods` · [메서드의 입력·출력 계약](../../content/lessons/java/wiki-methods.md) | J02 139–211·238–276; PJ1 106–197 계약 불일치 보완 | `L28`, `JQ13` |
| `JU08` | `argument-values` · [매개변수 재대입과 객체 변경](../../content/lessons/java/wiki-argument-values.md) | J02 212–237·238–296 | `JQ14`, `JQ15` |
| `JU09` | `objects` · [클래스·객체·참조와 this](../../content/lessons/java/wiki-objects.md) | J03 15–86·246–252 | `JQ16`, `JQ17` |
| `JU10` | `constructors` · [생성자와 올바른 첫 상태](../../content/lessons/java/wiki-constructors.md) | J03 87–153 | `JQ18`, `JQ19` |
| `JU11` | `encapsulation` · [상태 규칙을 지키는 캡슐화](../../content/lessons/java/wiki-encapsulation.md) | J03 154–252 | `JQ20`, `JQ21` |
| `JU12` | `packages-access` · [패키지와 접근 범위](../../content/lessons/java/wiki-packages-access.md) | J04 15–58 | `JQ22`, `JQ23` |
| `JU13` | `static-members` · [객체의 값과 클래스의 값](../../content/lessons/java/wiki-static-members.md) | J04 59–99·173–249의 공유카운트만 | `JQ24`, `JQ25` |
| `JU14` | `final-immutability` · [final과 불변 객체](../../content/lessons/java/wiki-final-immutability.md) | J04 100–130·251–263 | `JQ26`, `JQ27` |
| `JU15` | `equality-hashing` · [같은 객체와 같은 값](../../content/lessons/java/wiki-equality-hashing.md) | J04 131–172·173–249의 equals/hashCode부분 | `JQ28`, `JQ29` |
| `JU16` | `inheritance-dispatch` · [상속과 실제 객체의 메서드](../../content/lessons/java/wiki-inheritance-dispatch.md) | J05 15–90·185–283에서 하위 kind만 | `JQ30`, `JQ31` |
| `JU17` | `abstract-interfaces` · [공통 상태와 역할 계약](../../content/lessons/java/wiki-abstract-interfaces.md) | J05 91–157·285–298 | `JQ32`, `JQ33` |
| `JU18` | `composition-injection` · [조합·위임과 생성자 주입](../../content/lessons/java/wiki-composition-injection.md) | J05 158–184·185–298에서 CompletionService흐름 | `JQ34`, `JQ35` |
| `JU19` | `generics` · [타입 인수와 안전한 보관](../../content/lessons/java/wiki-generics.md) | J06 31–98 | `JQ36`, `JQ37` |
| `JU20` | `lists` · [순서 있는 List의 크기와 삭제](../../content/lessons/java/wiki-lists.md) | J06 99–131 | `JQ38`, `JQ39` |
| `JU21` | `sets-maps` · [중복된 값과 키를 다루기](../../content/lessons/java/wiki-sets-maps.md) | J06 132–188·211–268의 해당관계 | `JQ40`, `JQ41` |
| `JU22` | `deque` · [먼저 넣은 값과 나중에 넣은 값](../../content/lessons/java/wiki-deque.md) | J06 189–210 | `JQ42`, `JQ43` |
| `JU23` | `collection-choice` · [보관 규칙과 연산 비용으로 고르기](../../content/lessons/java/wiki-collection-choice.md) | J06 15–30·69–98·270–312 | `JQ44`, `JQ45` |
| `JU24` | `exceptions` · [실패를 처리하거나 전달하기](../../content/lessons/java/wiki-exceptions.md) | J07 15–124 | `JQ46`, `JQ47` |
| `JU25` | `resources` · [자원의 종료와 실패 보존](../../content/lessons/java/wiki-resources.md) | J07 125–215 | `JQ48`, `JQ49` |
| `JU26` | `lambdas` · [동작의 입력과 출력 전달하기](../../content/lessons/java/wiki-lambdas.md) | J08 15–58 | `JQ50`, `JQ51` |
| `JU27` | `streams` · [값을 고르고 바꾸어 모으기](../../content/lessons/java/wiki-streams.md) | J08 59–173 | `JQ52`, `JQ53` |
| `JU28` | `date-time` · [날짜·시점·시간량 구분하기](../../content/lessons/java/wiki-date-time.md) | J08 174–192 | `JQ54`, `JQ55` |
| `JU29` | `shared-state` · [공유 상태에 필요한 보장](../../content/lessons/java/wiki-shared-state.md) | J09 15–35·54–88·139–156 | `JQ56`, `JQ57` |
| `JU30` | `tasks-results` · [작업을 나누고 결과 모으기](../../content/lessons/java/wiki-tasks-results.md) | J09 36–53·67–138·157–169 | `JQ58`, `JQ59` |
| `JU31` | `test-contracts` · [공개 계약에서 테스트 조건 찾기](../../content/lessons/java/wiki-test-contracts.md) | J10 15–58·114–219의계약·231–255 | `JQ60`, `JQ61` |
| `JU32` | `test-tools` · [테스트 실행·검증·협력 대역](../../content/lessons/java/wiki-test-tools.md) | J10 59–113·175–229 | `JQ62`, `JQ63` |

Java PJ1의 types-variables 보완은 기존 기본/참조 타입 설명, arrays는 73~101행의 선언 후 생성, methods는 106~197행의 입력·반환 계약이다. numeric-operations의 J10 117~144행은 계산 전 long 변환의 보완 계보다. 비교할 두 개념이나 종합 흐름이 판단에 필요한 경우는 함께 두었으며 문서 수를 늘리는 근거로 삼지 않았다. 각 문서의 선수·다음 문서·공식 자료와 직접답은 본문에 남아 있다.

## 신규 문항별 경험 등록

아래는 지정 작성자가 문항을 만들기 전에 남긴 A/E/C와 기존 판단 대비 근거를 해당 **실제 문항 ID**에 연결한 기록이다. 기존 판단을 이름·상수만 바꾸어 새 경험으로 세지 않았고 재사용으로 충족한 JS 연산·분기·반환·순회·배열 메서드에는 문제를 채우지 않았다. Java의 기존 한 문항은 반환 타입 계약이며 새 문항은 아래 다른 판단을 다룬다. 정답·세 오답의 전체 문구는 실제 [JS 퀴즈](../../content/quizzes/javascript.json)·[Java 퀴즈](../../content/quizzes/java.json)가 정본이고 이 표에 복제하지 않는다.

분할 자체와 기존 학습 행동은 재사용이며 새 기회는 아래 구체적인 조건·선택·연결이다. 객관식은 선택지·코드·채점 뒤 이유를 제공하는 L1/L2와 일부 지원 있는 L3이므로 무힌트 구현·T·실제 숙달 성과를 뜻하지 않는다. `PASS_CONTENT_REVIEW`는 105문항의 조건·단일 정답·보기별 이유·문서 충분성을 독립 검토한 정적 내용 판정이다.

| 등록 | 실제 새 문항 ID | 단위·근거 유형 | 작성자가 남긴 새 판단·조건·연결 근거 |
| --- | --- | --- | --- |
| `JSQ01` | `quiz-javascript-concept-values-types-numeric-text` | `JSU01` · C | 겉모양이 같은 두 값을 연산하기 전에 typeof로 구분한다. 기존 문자열 덧셈 문제는 연산 후 결과를 묻는다. |
| `JSQ02` | `quiz-javascript-concept-values-types-typeof-limit` | `JSU01` · C | typeof 결과가 정상 숫자 여부·원시/객체 구분의 충분조건이 아닌 경계를 판단한다. 기존 truthy 값 개수와 다른 조건이다. |
| `JSQ03` | `quiz-javascript-concept-variables-reassign-counter` | `JSU02` · A | 기존 const 속성 변경 결과를 넘어 재대입과 속성 변경이 함께 있는 코드에서 선언 대상을 선택한다. |
| `JSQ04` | `quiz-javascript-concept-callbacks-function-or-result` | `JSU06` · C | 기존 정상 동기 콜백 두 번 호출과 달리 전달값이 함수에서 숫자로 바뀌었을 때 실패 위치를 판단한다. |
| `JSQ05` | `quiz-javascript-concept-function-effects-shared-input-change` | `JSU07` · C | 기존 외부 total·콘솔 경계에서 입력 객체를 통한 간접 상태 변경으로 조건을 바꿔 순수성의 경계를 적용한다. |
| `JSQ06` | `quiz-javascript-concept-arrays-objects-ordered-records` | `JSU08` · A | 기존 동적 키 읽기와 달리 순서와 레코드 필드를 함께 만족하는 자료 모양을 선택한다. |
| `JSQ07` | `quiz-javascript-concept-object-sharing-identity` | `JSU11` · C | 기존 filter 새 배열/요소 공유 문제와 달리 복사 도구 없이 객체 정체성 자체를 비교한다. |
| `JSQ08` | `quiz-javascript-concept-object-sharing-parameter-reassignment` | `JSU11` · C | 기존 속성 변경 공유에서 매개변수 재대입으로 행동이 바뀌었을 때 호출자 상태가 보존되는 경계를 판단한다. |
| `JSQ09` | `quiz-javascript-concept-shallow-copy-copy-path` | `JSU12` · C | 기존 filter 공유 결과를 관찰하는 판단에서 원본 보존 조건을 충족할 변경 경로를 직접 선택한다. |
| `JSQ10` | `quiz-javascript-concept-scope-hoisting-block-name` | `JSU13` · C | 기존 함수 렉시컬 스코프와 달리 블록이 끝난 뒤 바깥 이름이 유지되는 범위를 비교한다. |
| `JSQ11` | `quiz-javascript-concept-scope-hoisting-before-initialization` | `JSU13` · C | 가까운 이름을 찾을 수 있는 정상 경우와 초기화되지 않은 이름이 있는 경우를 비교해 바깥 fallback 오개념을 확인한다. |
| `JSQ12` | `quiz-javascript-concept-closure-independent-state` | `JSU14` · C | 기존 선언 위치의 문자열 읽기에서 변경이 이어지는 바인딩과 두 생성 호출의 독립성을 함께 판단한다. |
| `JSQ13` | `quiz-javascript-concept-object-model-state-and-method` | `JSU15` · A | 기존 문항에 없는 class 개별 상태와 prototype 메서드 공유를 한 출력에서 비교한다. |
| `JSQ14` | `quiz-javascript-concept-object-model-detached-method` | `JSU15` · C | 정상 객체 메서드 호출과 떼어낸 호출의 조건 차이를 적용한다. 기존 27문항에는 this 호출 관계 문제가 없다. |
| `JSQ15` | `quiz-javascript-concept-dom-properties-current-input` | `JSU16` · C | 기존 dataset·classList에서 입력 attribute와 현재 property가 달라지는 조건으로 확장한다. |
| `JSQ16` | `quiz-javascript-concept-forms-state-form-data` | `JSU17` · C | 단일 값과 다중 선택에 따라 get/getAll 선택이 달라진다. |
| `JSQ17` | `quiz-javascript-concept-forms-state-submit-path` | `JSU17` · E | 프로그램 제출 요청을 내장 검증과 submit 처리로 연결한다. |
| `JSQ18` | `quiz-javascript-concept-event-delegation-scope-check` | `JSU18` · C | 선택자 일치와 담당 목록 포함 여부를 나누어 판단한다. |
| `JSQ19` | `quiz-javascript-concept-event-defaults-cancel-navigation` | `JSU19` · A | 기본 동작과 전파를 각각 목적에 맞게 고른다. |
| `JSQ20` | `quiz-javascript-concept-event-defaults-passive` | `JSU19` · C | cancelable만으로 취소 성공을 보장할 수 없음을 판단한다. |
| `JSQ21` | `quiz-javascript-concept-errors-input-empty-number` | `JSU20` · E | 입력 정리와 빈칸 검사 후 숫자 변환을 연결한다. |
| `JSQ22` | `quiz-javascript-concept-errors-input-error-kind` | `JSU20` · A | 문법·이름·값의 동작 중 첫 조사 대상을 구분한다. |
| `JSQ23` | `quiz-javascript-concept-error-boundaries-finally-result` | `JSU21` · C | 마무리 절의 반환 유무에 따라 전달되는 결과가 달라진다. |
| `JSQ24` | `quiz-javascript-concept-error-boundaries-recover-location` | `JSU21` · E | 실패 전달을 복구·안내 가능한 호출 경계에 연결한다. |
| `JSQ25` | `quiz-javascript-concept-debugging-breakpoint` | `JSU22` · A | 기존 출력 단계 조사와 달리 계산 전 타입의 첫 어긋남을 찾는다. |
| `JSQ26` | `quiz-javascript-concept-promise-chain-return-chain` | `JSU23` · E | 비동기 함수 호출과 결과 Promise 반환을 연결한다. |
| `JSQ27` | `quiz-javascript-concept-async-await-returned-promise` | `JSU24` · A | 값 3과 3을 전달하는 Promise를 구분한다. |
| `JSQ28` | `quiz-javascript-concept-async-await-catch-rejection` | `JSU24` · E | 실패한 Promise를 기다리는 위치와 오류 처리를 연결한다. |
| `JSQ29` | `quiz-javascript-concept-async-state-loading-first` | `JSU25` · E | loading 상태 변경→render→await 순서를 연결한다. |
| `JSQ30` | `quiz-javascript-concept-async-state-failed-list` | `JSU25` · C | 실패 화면에 이전 성공 자료를 남길지 명시한 요구에 맞춰 판단한다. |
| `JSQ31` | `quiz-javascript-concept-async-composition-race-reject` | `JSU26` · C | 첫 성공과 첫 settled를 구분하고 결과 확정과 작업 취소를 분리한다. |
| `JSQ32` | `quiz-javascript-concept-event-loop-order` | `JSU27` · E | 등록과 콜백 실행을 서로 다른 단계로 연결한다. |
| `JSQ33` | `quiz-javascript-concept-event-loop-microtask-chain` | `JSU27` · C | 짧은 콜백 하나와 끝없이 추가되는 대기열의 조건을 구분한다. |
| `JSQ34` | `quiz-javascript-concept-json-shape` | `JSU28` · A | 문법 성공과 기능에 필요한 데이터 형태를 구분한다. |
| `JSQ35` | `quiz-javascript-concept-json-omitted-value` | `JSU28` · C | 같은 값도 들어 있는 위치에 따라 결과 표현이 달라진다. |
| `JSQ36` | `quiz-javascript-concept-web-storage-restore-types` | `JSU29` · E | 부재/파싱/배열 형태/요소 타입 검사를 연결한다. |
| `JSQ37` | `quiz-javascript-concept-web-storage-save-failure` | `JSU29` · C | 화면 상태와 다음 방문 복원 가능 상태가 달라진 상황을 판별한다. |
| `JSQ38` | `quiz-javascript-concept-http-empty-body` | `JSU30` · C | 성공 상태와 본문 존재를 구분한다. |
| `JSQ39` | `quiz-javascript-concept-http-cors` | `JSU30` · A | CORS·인증/권한·no-cors의 각 역할을 고른다. |
| `JSQ40` | `quiz-javascript-concept-fetch-http-status` | `JSU31` · A | Response 부재와 성공 범위 밖 HTTP 상태를 구분한다. |
| `JSQ41` | `quiz-javascript-concept-fetch-consume-body` | `JSU31` · C | 첫 읽기 전후 본문 소비 상태의 차이를 판단한다. |
| `JSQ42` | `quiz-javascript-concept-flow-review-empty-search` | `JSU32` · E | 입력 검증·단조 증가하는 요청 번호·늦은 결과 적용을 연속된 사용자 제출 흐름으로 연결한다. |
| `JQ01` | `quiz-java-concept-runtime-compile-launch` | `JU01` · A | 소스 파일을 클래스 파일로 만든 뒤 실행할 도구 순서를 고른다. 도구·산출물·클래스 이름을 연결하는 첫 판단이다. |
| `JQ02` | `quiz-java-concept-runtime-class-compatibility` | `JU01` · A | 같은 클래스 파일을 옮길 때 JVM 버전 지원을 확인한다. 앞 문항의 명령 순서와 달리 실행 환경의 호환 조건을 판단한다. |
| `JQ03` | `quiz-java-concept-types-variables-primitive-reference` | `JU02` · A | 선언한 타입으로 기본 값과 참조값을 구분한다. 기존 반환 타입 문항에는 없는 변수의 값 종류 판단이다. |
| `JQ04` | `quiz-java-concept-types-variables-definite-assignment` | `JU02` · A | 지역 변수를 읽는 모든 경로의 대입 여부를 확인한다. 기본·참조 구분과 별개로 미대입 경로를 찾아 수정한다. |
| `JQ05` | `quiz-java-concept-numeric-operations-division` | `JU03` · A | 피연산자 타입으로 나눗셈의 소수 유지 여부를 판단한다. 단순 결과 타입 암기 대신 계산 시점의 타입을 대조한다. |
| `JQ06` | `quiz-java-concept-numeric-operations-intermediate-overflow` | `JU03` · A | 곱셈 전에 long으로 변환해 중간 오버플로를 피한다. 나눗셈과 다른 범위 실패이며 변환을 언제 해야 하는지 선택한다. |
| `JQ07` | `quiz-java-concept-control-flow-switch-result` | `JU04` · A | int switch 표현식이 처리하지 못하는 입력 경로를 보완한다. 메서드 반환 계약만이 아니라 선택식의 결과 경로를 확인한다. |
| `JQ08` | `quiz-java-concept-control-flow-loop-update` | `JU04` · A | 계속 조건과 갱신을 함께 추적해 실행 횟수를 찾는다. 선택 경로 문항과 달리 반복 뒤의 상태를 손으로 추적한다. |
| `JQ09` | `quiz-java-concept-arrays-creation-boundary` | `JU05` · A | 선언 이후 배열 객체를 만드는 대입식을 고른다. 타입 선언과 객체 생성을 분리하는 새로운 문법 판단이다. |
| `JQ10` | `quiz-java-concept-arrays-ragged-rows` | `JU05` · A | 행마다 다른 길이의 배열을 현재 행 길이로 순회한다. 생성 문법과 별개로 실제 접근 경계를 선택한다. |
| `JQ11` | `quiz-java-concept-strings-returned-value` | `JU06` · A | 불변 문자열 연산의 반환값 사용 여부를 추적한다. 변수와 객체 상태를 구분하며 반환값을 버린 호출을 관찰한다. |
| `JQ12` | `quiz-java-concept-strings-builder-state` | `JU06` · A | 빌더 변경과 이전에 만든 문자열 값을 구분한다. String 반환값 문항과 달리 가변 빌더와 불변 결과의 시간 경계를 판단한다. |
| `JQ13` | `quiz-java-concept-methods-input-contract` | `JU07` · A | 오버로드를 구분할 수 있는 매개변수 구성을 선택한다. 기존 quiz-java-method-return은 입력 고정·반환 계약 수정을 이미 평가하므로 재사용한다. 새 문항은 이름/반환만 바꾸는 중복 선언을 구분한다. |
| `JQ14` | `quiz-java-concept-argument-values-parameter-rebind` | `JU08` · A | 기본 타입 매개변수 재대입이 호출자 변수를 바꾸지 않음을 추적한다. 기존 반환 타입 문제와 달리 호출 전후 값의 소유 위치를 판단한다. |
| `JQ15` | `quiz-java-concept-argument-values-shared-array` | `JU08` · A | 배열 원소 변경과 매개변수의 새 배열 대입을 구분한다. 기본값 복사와 비교해 참조값 복사의 관찰 결과를 평가한다. |
| `JQ16` | `quiz-java-concept-objects-separate-instances` | `JU09` · A | 두 번 생성한 객체의 인스턴스 상태를 따로 추적한다. 메서드 매개변수 전달 없이 객체 생성 횟수와 대상 상태를 판단한다. |
| `JQ17` | `quiz-java-concept-objects-same-reference` | `JU09` · A | 참조 대입으로 같은 객체를 가리키는 두 이름을 찾는다. 앞 문항의 별도 생성과 달리 참조 대입의 공유 여부를 판단한다. |
| `JQ18` | `quiz-java-concept-constructors-default-constructor` | `JU10` · A | 생성자 선언이 있는 클래스의 인수 없는 생성 가능 여부를 판단한다. 메서드와 생성자 구별 및 기본 생성자의 조건을 새롭게 평가한다. |
| `JQ19` | `quiz-java-concept-constructors-early-validation` | `JU10` · A | Java 25에서 위임 전 매개변수 검사가 허용되는지 판단한다. 기본 생성자 유무와 별개로 정식 Java 25의 초기 구성 경계를 평가한다. |
| `JQ20` | `quiz-java-concept-encapsulation-state-transition` | `JU11` · A | 허용되지 않은 상태 변경 요청 뒤 반환값과 상태를 추적한다. private 암기 대신 공개 행동의 사전조건을 직접 적용한다. |
| `JQ21` | `quiz-java-concept-encapsulation-meaningful-action` | `JU11` · A | 무제한 setter가 객체 규칙을 우회하는 경로임을 판단한다. 앞 문항의 실행 추적과 달리 규칙을 보존하는 공개 API를 고른다. |
| `JQ22` | `quiz-java-concept-packages-access-import-access` | `JU12` · A | 다른 패키지의 package 접근 멤버를 사용할 수 없는 이유를 찾는다. 객체 내부 상태 규칙과 달리 호출 위치별 접근 가능성을 평가한다. |
| `JQ23` | `quiz-java-concept-packages-access-nested-private` | `JU12` · A | 중첩 클래스 코드가 바깥 클래스의 private 멤버를 사용하는 범위를 판단한다. 패키지 경계 문항과 달리 동일 최상위 선언의 중첩 접근을 구분한다. |
| `JQ24` | `quiz-java-concept-static-members-shared-count` | `JU13` · A | 클래스 공유 카운트와 객체별 값을 구분한다. 두 객체 문항의 독립 필드 판단에 static 공유 축을 더한다. |
| `JQ25` | `quiz-java-concept-static-members-static-receiver` | `JU13` · A | static 메서드가 객체 필드를 사용할 때 필요한 참조를 고른다. 공유 필드 계산과 별개로 현재 객체가 없다는 호출 조건을 평가한다. |
| `JQ26` | `quiz-java-concept-final-immutability-rebind-vs-mutate` | `JU14` · A | final 배열 참조의 재대입과 원소 변경을 구분한다. static 공유 여부와 별개로 final이 제한하는 대입 대상을 판단한다. |
| `JQ27` | `quiz-java-concept-final-immutability-mutable-exposure` | `JU14` · A | private final 가변 배열을 그대로 반환하면 외부 변경 경로가 생김을 찾는다. 배열 final 문법을 객체의 공개 경로와 연결하는 적용 판단이다. |
| `JQ28` | `quiz-java-concept-equality-hashing-identity-value` | `JU15` · A | 다른 객체에 정의한 equals와 == 결과를 구분한다. 같은 참조 문항과 달리 재정의한 논리 동등성 기준을 적용한다. |
| `JQ29` | `quiz-java-concept-equality-hashing-hash-contract` | `JU15` · A | 동등성과 해시 사이에서 반드시 성립할 방향을 찾는다. 앞 문항의 두 비교 결과와 달리 equals/hashCode 공동 계약을 평가한다. |
| `JQ30` | `quiz-java-concept-inheritance-dispatch-dynamic-method` | `JU16` · A | 상위 타입 변수로 호출한 재정의 인스턴스 메서드를 선택한다. 오버로드와 다르게 실제 객체에 의한 구현 선택을 평가한다. |
| `JQ31` | `quiz-java-concept-inheritance-dispatch-static-field-boundary` | `JU16` · A | 필드·static 메서드 선택을 인스턴스 메서드 동적 선택과 구분한다. 앞 문항에서 얻은 동적 선택 규칙을 모든 멤버로 확대하는 오류를 교정한다. |
| `JQ32` | `quiz-java-concept-abstract-interfaces-shared-state-role` | `JU17` · A | 객체별 공통 필드·생성자·구현이 필요한 경우와 서로 다른 클래스가 같은 역할을 제공하는 경우를 구분하여 도구를 선택한다. |
| `JQ33` | `quiz-java-concept-abstract-interfaces-interface-implementation` | `JU17` · C | 본문 없는 인터페이스 메서드와 실제 구현 선언을 비교하여 public 계약을 지키는 선언을 고른다. |
| `JQ34` | `quiz-java-concept-composition-injection-has-a` | `JU18` · A | 서비스가 전송기를 사용하는 관계를 보고 상속 관계와 필드를 통한 위임을 구분한다. |
| `JQ35` | `quiz-java-concept-composition-injection-replace-collaborator` | `JU18` · E | 완료 처리 결과를 전송기에 넘기는 흐름에서 생성자 인수로 협력 객체를 교체하는 경계를 판단한다. |
| `JQ36` | `quiz-java-concept-generics-type-argument` | `JU19` · A | 정수 목록이라는 요구와 실제 추가 값의 타입을 대조하고 기본형을 타입 인수로 사용할 수 없음을 판단한다. |
| `JQ37` | `quiz-java-concept-generics-raw-warning` | `JU19` · C | raw 목록을 타입이 지정된 목록으로 넘긴 비교 사례에서 unchecked 경고가 나타내는 타입 정보 손실을 판단한다. |
| `JQ38` | `quiz-java-concept-lists-capacity-size` | `JU20` · A | 초기 용량을 지정하되 값을 추가하지 않은 목록에서 원소 수와 접근 가능 위치를 구분한다. |
| `JQ39` | `quiz-java-concept-lists-remove-overload` | `JU20` · C | 같은 remove 이름에 int와 Integer 인수를 주어 위치 삭제와 값 삭제로 달라지는 결과를 비교한다. |
| `JQ40` | `quiz-java-concept-sets-maps-duplicate-policy` | `JU21` · A | 같은 ID를 반복 저장한 사례로 Set의 중복 제거와 Map의 같은 키에 대한 값 갱신을 구분한다. |
| `JQ41` | `quiz-java-concept-sets-maps-ordering` | `JU21` · C | 중복 제거에 삽입 순서 유지 조건을 추가했을 때 HashSet 대신 LinkedHashSet이 필요한 이유를 판단한다. |
| `JQ42` | `quiz-java-concept-deque-fifo-lifo` | `JU22` · A | 먼저 등록한 작업부터 처리한다는 요구를 양 끝의 추가·제거 조합으로 옮긴다. |
| `JQ43` | `quiz-java-concept-deque-empty-read` | `JU22` · C | 빈 대기열에서 예외 대신 null을 받되 항목을 제거해야 한다는 조건으로 pollFirst와 조회·제거 메서드를 구분한다. |
| `JQ44` | `quiz-java-concept-collection-choice-workload-cost` | `JU23` · A | 같은 ArrayList라도 인덱스 조회와 앞쪽 삭제의 작업 비용이 다른 이유를 판단한다. |
| `JQ45` | `quiz-java-concept-collection-choice-combined-storage` | `JU23` · E | 완료 여부 확인 결과를 진행률 조회와 다음 요청 처리로 연결하는 흐름에서 Set·Map·Deque의 보관 역할을 나눈다. |
| `JQ46` | `quiz-java-concept-exceptions-checked-contract` | `JU24` · A | 검사 예외를 선언한 메서드의 호출 위치를 보고 catch 또는 throws로 계약을 충족하는 방법을 판단한다. |
| `JQ47` | `quiz-java-concept-exceptions-preserve-cause` | `JU24` · E | 숫자 변환 실패를 도메인 오류로 전달할 때 원래 예외를 원인으로 보존하는 경계를 판단한다. |
| `JQ48` | `quiz-java-concept-resources-close-order` | `JU25` · A | 두 자원이 모두 성공적으로 초기화된 구체 조건에서 try-with-resources의 역순 종료를 판단한다. |
| `JQ49` | `quiz-java-concept-resources-suppressed-failure` | `JU25` · C | 본문 실패와 종료 실패가 함께 발생한 비교 사례에서 주 예외와 억제 예외가 보존되는 방식을 판단한다. |
| `JQ50` | `quiz-java-concept-lambdas-target-contract` | `JU26` · A | 문자열 입력과 boolean 출력이라는 구체 모양으로 함수형 인터페이스를 선택한다. |
| `JQ51` | `quiz-java-concept-lambdas-expression-result` | `JU26` · C | 문자열 반환이 필요한 블록 람다에서 출력만 하는 문장과 값을 반환하는 문장을 비교한다. |
| `JQ52` | `quiz-java-concept-streams-pipeline-shape` | `JU27` · A | 완료 여부를 판단할 수 있는 객체를 제목 문자열로 바꾸기 전에 필터링해야 하는 처리 순서를 선택한다. |
| `JQ53` | `quiz-java-concept-streams-shared-effects` | `JU27` · E | 변환 결과를 다음 표시 단계로 넘길 때 병렬 처리 가능 조건에서도 외부 가변 목록에 누적하지 않는 결과 수집 방식을 선택한다. |
| `JQ54` | `quiz-java-concept-date-time-meaning-type` | `JU28` · A | 달력 날짜·정확한 순간·시간량이라는 서로 다른 정보 요구를 시간 타입에 연결한다. |
| `JQ55` | `quiz-java-concept-date-time-returned-time` | `JU28` · C | 같은 plusDays 호출에서 반환값을 버리는 경우와 저장하는 경우를 비교하여 불변 객체의 사용 결과를 판단한다. |
| `JQ56` | `quiz-java-concept-shared-state-lost-update` | `JU29` · A | 명시된 읽기·쓰기 순서를 손으로 추적하여 증가 연산의 갱신 손실 원인을 설명한다. |
| `JQ57` | `quiz-java-concept-shared-state-guarantee-scope` | `JU29` · C | 단일 값의 가시성·증가와 두 필드의 일관된 갱신을 비교하여 필요한 잠금 범위를 판단한다. |
| `JQ58` | `quiz-java-concept-tasks-results-completion-evidence` | `JU30` · A | 작업이 제출되었다는 사실과 Future의 정상 반환을 구분하여 결과 합산의 완료 근거를 선택한다. |
| `JQ59` | `quiz-java-concept-tasks-results-virtual-thread-fit` | `JU30` · C | 다수의 대기 작업과 하나의 CPU 계산을 비교하여 가상 스레드가 적합한 작업 조건을 판단한다. |
| `JQ60` | `quiz-java-concept-test-contracts-boundary-case` | `JU31` · A | 정상값과 거부값만 있는 검증에서 허용 범위 양 끝의 결과라는 새 경계 판단을 추가한다. |
| `JQ61` | `quiz-java-concept-test-contracts-observable-contract` | `JU31` · C | 내부 구현이 바뀌었지만 공개 계약이 같은 비교 사례에서 유지할 검증 대상을 판단한다. |
| `JQ62` | `quiz-java-concept-test-tools-tool-role` | `JU32` · A | 테스트 발견·실행, 결과 비교, 외부 협력 대역이라는 각 필요를 도구의 책임에 연결한다. |
| `JQ63` | `quiz-java-concept-test-tools-mock-boundary` | `JU32` · E | 실제 계산 결과를 알림 요청으로 넘기는 서비스에서 계산은 실제 객체로 확인하고 외부 전송 경계는 대역으로 분리한다. |

## 기존 문항 소유와 상세 문서 매핑

아래 28문항의 ID·소유 lessonId·conceptId·prompt·code·보기·정답·피드백 객체를 보존했다. `documentLessonId`만 실제 새 문서로 연결하며 runtime 둘은 기존 문서에 self 연결한다. `JSU`·`JU`는 위 실제 본문 링크, runtime은 [보존 본문](../../content/lessons/javascript/javascript-and-runtime.md)이다. 기존 HTML/CSS 24문항은 이번 매핑 대상이 아니며 객체를 변경하지 않았다.

| 등록 | 기존 문항 ID | 보존 소유 lessonId · conceptId | 상세 대상 · 실제 heading |
| --- | --- | --- | --- |
| `L01` | `quiz-javascript-notes-return-value` | `js-notes-functions` · `js.function-return` | `JSU05` · 반환값은 호출한 곳으로 돌아간다 |
| `L02` | `quiz-javascript-notes-early-return` | `js-notes-functions` · `js.function-return` | `JSU05` · 반환값은 호출한 곳으로 돌아간다 |
| `L03` | `quiz-javascript-notes-sync-callback` | `js-notes-functions` · `js.callbacks` | `JSU06` · 함수도 값이다 |
| `L04` | `quiz-javascript-notes-arrow-block-return` | `js-notes-functions` · `js.function-return` | `JSU05` · 반환값은 호출한 곳으로 돌아간다 |
| `L05` | `quiz-javascript-notes-function-boundary` | `js-notes-functions` · `js.function-side-effects` | `JSU07` · 반환하면서 객체도 바꾸는 경우 |
| `L06` | `quiz-javascript-notes-const-property` | `js-notes-values` · `js.variables` | `JSU02` · 값을 기억하는 이름: 변수 |
| `L07` | `quiz-javascript-notes-string-addition` | `js-notes-values` · `js.operators` | `JSU03` · 값을 계산하고 비교하는 연산자 |
| `L08` | `quiz-javascript-notes-switch-break` | `js-notes-values` · `js.control-flow` | `JSU04` · 핵심 질문 답 |
| `L09` | `quiz-javascript-notes-loop-boundary` | `js-notes-values` · `js.control-flow` | `JSU04` · 핵심 질문 답 |
| `L10` | `quiz-javascript-notes-filter-map` | `js-notes-collections` · `js.array-methods` | `JSU10` · `map`, `filter`, `find`는 목적이 다르다 |
| `L11` | `quiz-javascript-notes-find-missing` | `js-notes-collections` · `js.array-methods` | `JSU10` · `map`, `filter`, `find`는 목적이 다르다 |
| `L12` | `quiz-javascript-notes-filter-shared-object` | `js-notes-collections` · `js.object-sharing` | `JSU12` · filter도 요소 객체까지 복제하지 않는다 |
| `L13` | `quiz-javascript-notes-for-in-keys` | `js-notes-collections` · `js.iteration` | `JSU09` · 배열을 차례대로 읽기 |
| `L14` | `quiz-javascript-01-ecmascript-runtime` | `js-01-runtime` · `js.ecmascript` | `runtime` · 3. 브라우저가 준비한 도구 |
| `L15` | `quiz-javascript-01-script-path` | `js-01-runtime` · `js.script-loading` | `runtime` · 4. HTML과 JavaScript 파일 연결하기 |
| `L16` | `quiz-javascript-02-strict-equality` | `js-02-values-control-flow` · `js.operators` | `JSU03` · 값을 계산하고 비교하는 연산자 |
| `L17` | `quiz-javascript-02-truthy-values` | `js-02-values-control-flow` · `js.values-types` | `JSU03` · 조건에 맞는 값의 개수 세기 |
| `L18` | `quiz-javascript-03-arrow-return` | `js-03-functions-scope-closure` · `js.functions` | `JSU05` · 화살표 함수 |
| `L19` | `quiz-javascript-03-lexical-scope` | `js-03-functions-scope-closure` · `js.closure` | `JSU14` · 함수가 바깥 환경을 기억하는 클로저 |
| `L20` | `quiz-javascript-04-computed-property` | `js-04-collections` · `js.objects` | `JSU08` · 점 표기법과 대괄호 표기법 |
| `L21` | `quiz-javascript-04-foreach-result` | `js-04-collections` · `js.arrays` | `JSU09` · forEach의 반환값과 콜백 결과는 다르다 |
| `L22` | `quiz-javascript-05-dataset-classlist` | `js-05-dom-events` · `web.dom` | `JSU16` · 클래스와 data 속성 읽기 |
| `L23` | `quiz-javascript-05-nested-delegation` | `js-05-dom-events` · `web.event-delegation` | `JSU18` · 이벤트는 부모 쪽으로 전달될 수 있다 |
| `L24` | `quiz-javascript-06-first-settlement` | `js-06-async-fetch` · `js.promise` | `JSU23` · Promise는 나중 결과를 나타내는 객체다 |
| `L25` | `quiz-javascript-06-dependent-await` | `js-06-async-fetch` · `js.async-await` | `JSU26` · 다음 입력이 준비됐는지 먼저 본다 |
| `L26` | `quiz-javascript-07-state-render` | `js-07-review-practice` · `js.data-flow` | `JSU32` · 상태가 기준이고 DOM은 그 결과다 |
| `L27` | `quiz-javascript-07-output-debugging` | `js-07-review-practice` · `js.debugging` | `JSU22` · 정상임을 확인한 다음 경계 살피기 |
| `L28` | `quiz-java-method-return` | `java-01-types-methods` · `java.methods` | `JU07` · 선언과 호출의 계약을 대조한다 |

기존 notes 9개 발췌 pair는 ID·제목·소유를 유지하고 실제 heading/excerpt·documentLessonId를 갱신했다. 나머지는 실제 문항 소유 pair로 전달된 템플릿을 복제했다. 새 소유 문항이 없는 템플릿은 발췌 레코드로 등록하지 않았다. truthy의 `js.values-types`는 operators, filter 공유의 `js.object-sharing`은 shallow-copy, 의존적 await의 `js.async-await`는 async-composition에 연결된다. 새 타입 구분·객체 동일성·async 실패 ID와 합치지 않았다. 반환과 화살표 함수의 서로 다른 concept도 같은 문서를 보더라도 각 제목·발췌를 유지한다.

## 반환 수정과 검증 이력

| 반환 | 발견한 문제 | 지정 역할의 수정과 재확인 |
| --- | --- | --- |
| JS 빈 검색 지속 조건 | `quiz-javascript-concept-flow-review-empty-search`의 초기 질문은 빈 검색 한 번만 요구했지만 오답 근거는 이후 ID 재사용까지 가정 | 작성자가 이후 새 검색에도 과거 번호를 재사용하지 않는 조건을 prompt에 추가. 코드·정답·보기는 유지했고 content_validator가 정답 C의 유일성과 실제 JSON 반영을 재확인 |
| Java static 접근 보기 | `lesson.title`·`Lesson.title`이 검사기의 소문자 정규화에서 중복으로 처리되어 Java 컬렉션 등록 실패 | Java A 작성자로 역할을 재부여해 네 보기를 현재 객체·매개변수 객체·클래스 이름·대상 생략의 병렬 설명으로 명확화. 대소문자 의미·코드·목표·정답 b 유지, b/c 해설·해당 경험 근거만 정렬. 독립 내용 재검토 완료 |
| Java 정적 상태와 Quest 검사 | 모든 available 언어에 Code Quest를 강제하여 새 Java 정적 제공 계약과 충돌 | 제품 구현자로 역할을 재부여해 현재 Quest 필수 3언어와 available 조건을 결합하는 작은 allowlist 추가. Java를 위한 임시 예외·새 capability·runner를 만들지 않고 다른 Quest·공개 평가 검증 보존 |

첫 `npm run validate:content`는 위 Java static 접근 보기와 Quest 콘텐츠 검사 두 원인으로 실패했다. Java 개념에 문항이 없다는 연쇄 오류는 Java 컬렉션 등록 실패 때문이었다. 작성자·제품 구현자·관리자를 순차로 지정해 각각 수정한 뒤 실패를 해소하는 재검사 1회를 수행했고 PASS다. 최초 실패를 지우거나 같은 통과 상태를 불필요하게 반복하지 않았다.

최종 통합에서는 별도의 두 실패를 수정한 뒤 통과했다. 두 실패 모두 콘텐츠 검증은 통과했지만 테스트 단계에서 중단되어 빌드는 실행되지 않았다.

| 전체 gate 시도 | 실제 결과 | 반환 수정과 최소 재확인 |
| --- | --- | --- |
| 1차 | 637개 중 635 PASS·2 FAIL. Java available을 Quest 지원으로 해석하여 미제공 컬렉션을 로드하고 Quest route를 허용한 실제 제품 회귀 | `src/app.js`의 작은 공통 조건으로 available과 JS·HTML·CSS 지원을 함께 검사하고 loader·route·실제 열기에 재사용. 기존 JS fallback과 Java 정적 학습·객관식 유지. 영향 라우팅 검사 **9/9 PASS**, 독립 test_engineer가 실제 diff·기대값·로그를 확인 |
| 2차 | 637개 중 636 PASS·1 FAIL. `accessibility.test.js`가 이전 available-only guard의 소스 문자열을 요구 | 실제 정상/거부 행동은 위 라우팅 검사에서 유지. 중복된 구현 문자열 assertion 하나만 제거하고 parse·slug·fallback·canonical 검사는 유지. 해당 이름의 focused 검사 **1/1 PASS**, 독립 검토에서 기존 행동 검사 근거 재확인 |
| 3차 | 안전한 최종 복제본에서 `npm run check` **exit 0**, 637 PASS·0 FAIL·0 skip, 정적 빌드 완료. 전체 명령 약 2.232초 | 빌드 191개 파일이 복제 원본과 정확히 일치하고 새 64본문 포함. 통합 검사 전후 원본 301개 파일·기존 dist·Git index/HEAD/status 변화 0, `git diff --check` 통과 |

통합자는 이미 통과한 독립 데스크톱 관찰을 재사용했고 동일 브라우저 확인을 반복하지 않았다. 실패 수정으로 무효화된 전체 gate만 재실행했으며 최초·두 번째 로그를 보존했다. 위 보존 비교는 최종 통합 검사 전후 기준이다. 그 뒤의 이 결과 문서 갱신을 제품 파일 변경이나 새 제품 gate로 계산하지 않는다.

## 검증 증거와 남은 판정

| 단계·담당 | 실제 범위와 결과 | 남은 범위·한계 |
| --- | --- | --- |
| 작성·관리 | 네 작성자 fragment와 새 metadata 64개·문항 105개 deep equality, 기존 69본문 SHA·기존 문항 보존, 실제 ID/order/파일·원문 SHA·heading/excerpt·선수/다음 문서·문항 연결 확인 | 구조와 관리 확인이며 교육 내용 자기 승인 아님 |
| content_validator | 64본문·105새문항 전부 읽기, 공개 원문 필요 구간·공식 Java25 계약·손 추적, 두 문항 보완의 최종 실제 JSON 대조. **PASS_CONTENT_REVIEW** | Java 실제 컴파일·실행과 독립 UI 실행 PASS 아님 |
| 콘텐츠 검사 | `npm run validate:content`: 최초 FAIL → 반환 수정 → PASS. 최종 교안 133·객관식 157·Quest 18·코딩테스트 6·Web Project 1 | 전체 테스트·build는 아래 통합자 결과로 구분 |
| 제품 작성자 focused | 임시 독립 fixture probe, review-navigation/review-concepts 기존 9/9, app 구문 검사와 반환된 Quest 조건 수정 후 구문 검사 통과 | 새 실제 데이터의 브라우저 왕복·전체 통합은 이 역할에서 미실행 |
| 테스트 작성자 focused | 아래 지정 8파일 명령 1회, **67 tests·67 pass·0 fail·0 skipped**, 약 0.90초. 공유 범위 거부·카드 중복/누락·기존 owner·왕복·변조 거부·서명 변경·완료 독립·64개 교안 연결 기대값 확인. 통합 반환 후 라우팅 9/9 및 구현 문자열 assertion 수정의 단일 검사 1/1도 통과 | 작성자 자체 실행이며 독립 test_engineer 판정과 구분. 기존 모바일 메뉴 fixture 2개도 실제 실행됐지만 새 모바일 구현·테스트·브라우저 작업은 없음 |
| 독립 문서 검토 | 지침·스킬 변경 절의 **PASS_DOC_INSTRUCTION_REVIEW**와 최종 수량·단위64·경험105·기존매핑28·계보·연결의 **PASS_DOC_FINAL_STATE**. 후속 Java 현재 상태 5파일·6위치 보완도 재검토 PASS | 문서 정합 판정이며 콘텐츠 실행·통합 gate를 대신하지 않음 |
| test_engineer | **PASS_TEST_ENGINEER**. 영향 테스트의 의미·기존 67/67 증거·공유 연결과 추가 validator diff 감사, 격리된 실제 데스크톱의 JS/Java 대표 흐름 확인. 통합 반환의 Quest 지원 조건·영향 테스트·9/9 로그와 두 번째 단일 assertion 보완을 추가 검토해 PASS 유지 | 동일 통과 focused와 브라우저 흐름을 반복 실행하지 않았으며 Java 실행·실서버/CORS·저장소 장애·모바일은 미실행 |
| project_integrator | **PASS_PROJECT_INTEGRATION**. 실제 diff·문서 정합과 보존 근거를 감사하고, 위 두 반환 수정 뒤 안전한 복제본의 `npm run check` 637/637·정적 빌드·파일/Git 보존 검사 통과. 독립 데스크톱 관찰 증거 재사용 | 로컬 제품 묶음 통합 판정이며 Java 실행기·설치형 MVP·모바일 지원·Git 게시 완료를 뜻하지 않음 |

독립 데스크톱 관찰은 1280×720 Codex 인앱 브라우저와 별도 `127.0.0.1:45972` origin에서 수행해 사용자 `localhost:4189` 탭·진도를 조작하지 않았다. JS 변수 카드 1개·2문항 → 기존 문제 오답 선택·채점·해설 펼침 → 새 변수 문서의 실제 절·초점 → 같은 문제의 선택·채점·펼침·복귀 초점 보존을 확인했다. Java는 32문서 목록 → methods 직접답 접힘·열람과 완료 분리 → Tab/Space 수동 완료 → 공유 CTA 1개에서 기존/새 2문항 → 새로고침 후 완료 유지와 보관 원문 미완료의 독립성을 확인했다. 주제 유지·JS69/Java64 표시·가독성과 초점에서 미해결 제품 실패는 없었다.

최초 임시 서버는 sandbox의 listen EPERM으로 시작하지 못했고 정식 승인된 동일 로컬 서버로 확인했다. 초기 접속 오류 페이지의 URL policy 차단을 우회하지 않고 정상 제품 탭에서 검증했으며, 중복 이름 locator는 실제 최근 문서 영역으로 좁혀 해결했다. 검증자가 만든 정상 탭과 서버만 종료했다. 이는 환경 시행착오이며 제품 PASS 범위를 확대하지 않는다. 상세 증거는 `/private/tmp/js-java-test-verification.md`이고 핵심 관찰은 위에 보존한다.

테스트 작성자가 실행한 명령은 다음과 같다. 이름 제외 패턴을 넣었으나 실제 로그에서 기존 모바일 fixture 두 개가 실행됐으므로 제외됐다고 기록하지 않는다.

```sh
node --test --test-name-pattern='^(?!모바일|메뉴와 밝기 조작)' tests/review-navigation.test.js tests/review-concepts.test.js tests/learning-catalog-view.test.js tests/quiz-content.test.js tests/extension-content.test.js tests/app-independent-review.test.js tests/language-navigation.test.js tests/js-java-concept-lessons.test.js
```

반환 후 focused 명령은 각각 한 번 실행했고 결과는 9/9와 1/1이었다.

```sh
node --test tests/app-language-routing.test.js
node --test --test-name-pattern='Code Quest 라우트는 잘못된 slug와 지원하지 않는 언어를 안전하게 복귀시킨다' tests/accessibility.test.js
```

최종 통합 명령은 격리 복제본 `/private/tmp/bam-js-java-integration-tfpx3o01`에서 Node v24.17.0·npm 11.13.0으로 실행한 `npm run check`이며 콘텐츠 검사→전체 테스트→정적 빌드 순서다. 원시 증거는 `/private/tmp/js-java-integration-check.log`, `js-java-integration-check-attempt2.log`, `js-java-integration-check-attempt3.json`·`.log`, `js-java-integration-preservation-attempt3.json`에 보존했다. 이 결과를 기록하면서 제품 검사를 다시 실행하지 않았다.

작성자의 대표 JS 관찰값 11개·14개는 독립 내용 검토에서 코드·예상값·한계와 대조했다. 모든 JS 예제를 실행했다고 주장하지 않는다. 실제 DOM/FormData/passive 브라우저, 실서버·네트워크/CORS, 저장소 장애, Java 컴파일·실행은 해당 작성·정적 내용 검토에서 미실행이다. Java는 정식 Java 25·preview 없음으로 교안과 판단을 검토했으며 이번 정적 문서/객관식에 없는 runner 실행 계약을 완료했다고 쓰지 않는다. 실제 학습자 이해·독립 구현·전체 release 콘텐츠 소급 감사도 이번 PASS의 의미가 아니다.

지속해서 필요한 판정과 수량·출처·문항별 근거는 이 카드에 남겼다. 세부 원시 증거는 로컬 인계 `/private/tmp/js-java-management-evidence.json`, `js-java-content-validation.md`, `js-java-question-review-ledger.json`, `js-java-test-author-review.md`, `js-java-focused-tests.log`, `js-java-product-implementation.md`, `js-java-doc-review.md`에서 확인할 수 있다. 로컬 임시 파일은 이 카드의 정본을 대체하지 않는다.

## 운영 지침과 스킬 개선의 실제 상태

`DEC-INSTRUCTIONS-01`에 따른 저장소 라우팅·승인 범위·focused/통합 검증·독립 역할·플랫폼 경계 개선을 반영했다. 독립 문서 검토는 관련 변경 절과 링크 22개를 확인하여 PASS_DOC_INSTRUCTION_REVIEW로 판정했다. 필수 검증·보안 도구의 차단·새 외부 전송·유료 실행·Git 권한 경계를 완화하지 않았다.

별도 승인으로 Ponytail·Visualize·OpenAI Docs SKILL.md 3개와 OpenAI Docs 참조 3개, **6개 파일**을 준비된 원본·수정 SHA와 비교해 로컬 적용했다. 최초 적용 시점 6개 일치는 총괄과 적용 보고서의 증거다. 이후 독립 검토 시점에는 4개만 초기 적용 SHA와 같고 Ponytail SKILL.md·OpenAI Docs SKILL.md 2개에는 후속 변경이 있었다. 현재도 6개가 모두 최초 적용본과 동일하다고 표현하지 않으며 변경 주체는 독립 검토에서 확인하지 못했다.

Ponytail의 현재 후속 변경은 관련 변경 지점·흐름부터 읽고 공유 계약이 불명확할 때 범위를 넓히며 고정 3줄 출력과 중복 선독을 강제하지 않는다. OpenAI Docs는 기존 자동화 실행에 불필요한 지식 스킬을 적용하지 않고 실제 인증 API 요청 전에 필요한 권한을 확인한다. 독립 검토는 두 후속 변경이 이번 취지와 비밀값 보호·권한·필요 검증을 유지한다고 확인했다. Visualize의 inline 출력·CSP·네트워크·접근성 경계와 공식 OpenAI 출처 범위도 유지했다.

스킬 자동 검사 `quick_validate.py`는 PyYAML 부재로 검사 시작 전에 실패했다. 기존 Ruby/Psych로 frontmatter 형식·필수 필드·미변경 metadata를 대체 확인했으며 새 패키지를 설치하지 않았다. 이를 자동 스킬 검사 PASS나 새 세션의 자동 스킬 선택 실측으로 표시하지 않는다. 버전별 플러그인 캐시·시스템 관리 위치는 앱/플러그인 업데이트·재설치로 교체될 수 있고 자동 재적용 설정은 만들지 않았다. 현재 세션 설명의 즉시 갱신 여부도 미확인이다.
