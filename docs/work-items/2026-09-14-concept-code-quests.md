# 개념별 Code Quest 직접 작성 경험 확장

## 후속 검증·게시 인수

`[현재 사실]` 2026-09-15 독립 콘텐츠·실행·문서 최종 재검과 로컬 통합 **PASS**를 인수했다. 승인된 신규 10개와 직접 영향 범위·기존 18개 보존·반환 수정은 게시 작업본의 통합 기록을 따른다. 후속 사용자 Git 승인으로 PR #21이 병합됐으며 정확한 revision과 확인 조건은 [게시 기록](2026-09-13-github-publication.md#후속-게시-기록-2026-09-15)에 둔다. 아래 생성 전·최초 실패·통합 대기·로컬 미게시 표현은 각 단계 당시 이력이며 현재 대기 상태가 아니다. 교육 경험과 원본 보존·실행 범위는 재작성하지 않는다.

## 현재 판정과 게시 인수 기준

`[현재 사실]` 2026-09-15 독립 콘텐츠·실행·문서 최종 재검 및 로컬 통합 **PASS**를 인수했다. 통합 근거는 `/tmp/bam-quest-expansion-integration-receipt.md`이며 승인 신규 10개와 직접 영향 콘텐츠/fixture 6·테스트 6·문서 6의 변경 범위, 기존 18개 보존, 반환 수정 및 증거 재사용을 확인했다. 아래 생성 전·최초 실패·로컬 미게시 기록은 각 단계 당시의 이력이다.

`[확정 결정]` 로컬 통합 뒤 bam이 이번 신규 10개의 commit·push·PR·merge를 승인했다. Git 담당은 `/private/tmp/bam-concept-quest-publication`의 `codex/concept-code-quests`에서 기존 `dev` SHA `896a306469983a373b8c03591419c5e00a26ef0f`를 기준으로 승인된 18개 파일의 작업 delta만 게시한다. `/tmp/bam-concept-publication-manifest.json`의 인계 범위를 사용하며 원본 작업 폴더의 무관한 dirty 변경, 특히 로드맵 전체 변경을 가져오지 않는다. 문서 담당은 이 게시 사본의 승인·통합 상태 문구만 갱신하고 원본을 동시에 수정하지 않는다.

문서 작성 시점에는 게시 진행 중이며 commit·push·PR·CI·merge 완료를 주장하지 않는다. Git 담당이 이번 게시 대상 diff/hash, commit SHA, PR URL, 해당 CI·독립 검토 결과 및 실제 merge SHA를 별도 최종 receipt로 반환하고 총괄이 인수한 결과가 게시 판정이다. 이 절의 진행 표기는 그 receipt 이전 상태이며 실제 결과를 기록하기 위해 같은 승인 문서를 반복 커밋할 필요는 없다. 승인 사본의 문서 상태 변경은 독립 문서 재검·범위 통합 확인 뒤 게시한다. 앞선 PR #20 결과를 신규 10개의 게시 결과로 재사용하지 않는다.

## 범위와 완료 조건

- 작업 ID: `CONCEPT-CODE-QUESTS-20260914`; 유형: 학습 콘텐츠 포함 기능, 새 경험.
- 승인 근거: bam의 개념별 Code Quest 추가 요청과 Astra가 학습자의 이해·풀이를 고려해 충분히 설계·작성하라는 지시. 문제 수 할당이나 모든 concept에 하나씩 추가하는 요청으로 해석하지 않는다.
- MVP 이유: 기존 개념 학습 뒤 실제 작성으로 옮길 때 필요한 입력 관찰·첫 행동·경계 판단을 연습한다. 기존 문제와 다른 A/E/C/T 근거가 확인된 후보만 추가한다. 전체 release 커버리지 감사나 학습 성과 입증과 구분한다.
- 정본: [Code Quest 확장 계약](../designs/code-quest.md#개념별-직접-작성-경험-확장), [작성 계약](../code-quest-authoring.md), [경험 설계](../learning-content-design.md), [콘텐츠 스키마](../content-schema.md#code-quest-컬렉션), [학습 콘텐츠 파이프라인](../development-workflow.md#학습-콘텐츠가-포함된-기능).
- 기준선: 기존 JavaScript 9·HTML 5·CSS 4 Quest를 수정하지 않는다. 작성 담당의 콘텐츠 snapshot/hash와 문서 담당의 `/tmp/concept-code-quests-docs-baseline/hashes.json`으로 시작 상태를 보존한다. 기존 사용자 dirty 변경은 이번 diff와 구분한다.
- 관찰 가능한 완료: 새 Quest에서 학습자가 만들 결과·첫 행동·완료 기준을 설명할 수 있도록 전제·예시·starter·단계 힌트·실패 관찰점이 일치한다. 실제 교안/개념과 탐색에 연결되고 기준답안은 공개·독립 사례를 통과하며 대표오답은 의도한 공개 사례에서 실패한다.
- 데이터·안전: 기존 ID·slug·order·revision·source·진도 불변, 언어별 order 뒤 append. 기존 공개 로컬 평가·정적 콘텐츠·저장 인터페이스 재사용. 전체 분모 증가는 신규 문제 추가로 설명하고 기존 완료 이력을 보존한다.
- 대상 플랫폼: 현재 데스크톱 웹의 대표 새 문제에서 키보드·설명/편집/힌트/결과·교안/다음 문제 연결. 모바일·설치 앱은 미실행 범위이며 이번 완료 gate가 아니다.
- 금지: 기존 교안 본문 재작성, 기존 18문제 개작, SQL·Java runner·UI/평가 엔진·React·서버/DB·의존성. 최초 로컬 작성에서 제외한 Git 작업은 후속 승인 범위만 별도로 허용한다. 정확성상 다른 경계 수정이 필요하면 담당에게 근거와 최소 범위를 반환한다.

## 역할과 순차 인계

| 역할 | 소유·검토 범위 | 완료·반환 기준 |
| --- | --- | --- |
| 총괄 Astra | 읽기 전용 분류·범위·경험 설계 승인·인계 통합 | 카드 근거 확인 뒤 생성 시작 인계. 저장소 직접 수정 없음 |
| 제품·설계 문서 담당 Astra | 이 카드, `docs/designs/code-quest.md`, 등록부·문서 지도·로드맵의 관련 상태, root README의 검증된 수량 | 선행 계약과 후보 경험 카드 기록. README 기존 변경 보존, 수량은 실제 검증 후 갱신 |
| 콘텐츠 생성자 Astra | `content/quests/{javascript,html,css}.json`의 append, 해당 `tests/fixtures/` 기준답안·독립 사례·대표오답 | 개념 공백·중복 비교와 문제별 경험 설계 선행. 자체 검사·hash 인계, 최종 승인 금지 |
| 독립 테스트 작성자 | 총괄이 지정하는 새 Quest 직접 영향 테스트 경로 | 승인 계약에서 기대값 도출, 정상·대표 실패·경계 검증. 콘텐츠/제품 수정 없음 |
| 독립 `content_validator` Astra | 새 콘텐츠·경험 카드·실제 연결 교안·출처·중복 비교 읽기 전용 | 정확성·설명·난이도·A/E/C/T·지원·평가 전제 PASS 또는 정확한 반환 위치 |
| 독립 `test_engineer` | 콘텐츠 PASS 뒤 실행 계약·fixture·영향 테스트·대표 데스크톱 읽기 전용 | 공개/독립 기준답안·대표오답과 필요한 UI 실행, 재현 조건·미실행 범위 기록 |
| 독립 문서 검토자 | 변경 문서의 링크·앵커·상태·역할·정본 충돌 읽기 전용 | 문서 담당의 변경만 검토, 범위 밖 전체 감사 없음 |
| 독립 `project_integrator` | 선행 PASS와 전체 작업 diff·소유권·보존·직접 연결 읽기 전용 | 선정된 영향 범위의 실행·재사용 증거 확인, 미검사 연결만 추가 확인 |

같은 경로는 선행 담당의 변경·hash·미해결 인계 뒤 순차 수정한다. 테스트 작성·콘텐츠 검증·실행 검증·통합을 생성자와 합치지 않는다. 최초 로컬 작성 범위에는 Git 담당이 없었으며 commit·push·PR·merge를 수행하지 않았다. 후속 사용자 Git 승인은 아래 게시 인수 기준을 따른다.

## 경험 설계와 생성 전 판정

아래 개별 카드는 생성 전 승인 설계다. 공개 사례 배분·assertion과 요구의 최종 조정은 [최종 콘텐츠 계약](#최종-콘텐츠-계약)에서 설명하며 해당 항목은 최종 계약을 따른다.

`[현재 사실]` 2026-09-15 총괄 Astra가 작성자의 JavaScript 3·HTML 3·CSS 4 후보를 아래 보완 조건과 함께 승인했다. 기존 작업 ID와 파일명은 2026-09-14를 유지한다. 이 절은 생성 전 설계 근거이며 콘텐츠 생성·독립 검증·최종 통합 PASS가 아니다. 예정 추가 후 합계는 28개이고 root README의 현재 수량은 실제 생성·검증 전에는 바꾸지 않는다. 작성자 조사·출처 확인일은 2026-09-14이며 이후 생성·검증 기록에는 실제 날짜를 사용한다.

승인된 대상은 아래 10개 ID와 순서에 한정한다. 내용 생성은 이 카드 인계 뒤 `content/quests/{javascript,html,css}.json`과 `tests/fixtures/{code-quest-solutions,html-code-quest-solutions,css-code-quest-solutions}.js`에서 수행한다. 기존 18개 기준선은 `/tmp/bam-quest-expansion-baseline.json`이다.

### 승인 보완과 공통 항목 해석

- 필요한 명세를 추측시키지 않는다. 태그·id·값·정확한 선언을 채점하면 요구에 공개하고 완성 코드만 감춘다. CSS cascade는 계산 결과를 만족하는 다른 유효 해법도 허용한다.
- 중첩 설정의 주요 채점 목표는 반환한 전/후 전체값의 보존이다. 원본 불변·객체 정체성은 비채점 자기점검이며 공개 통과가 이를 보장한다고 쓰지 않는다.
- JSON은 정상·문법 실패·모양 실패를 짧은 입출력 예시로 나누고, overflow는 긴 문자열·누적 로그의 서로 다른 원인을 단계별 예시로 설명한다.
- 일반 상태의 `outline: none`은 이번 고정 fixture에서 대체 초점 표시를 완성하는 조건에 한정한다. 일반 웹의 기본 초점 표시 제거를 권장하지 않는다.
- 모든 후보의 T는 해당 없음이다. 개념/관찰/구현 힌트가 있는 L1~L3 직접 작성이며 무힌트 새 계약 전이나 학습 성과를 주장하지 않는다. 선수 Quest 잠금은 없고 아래 선수 교안·개념을 회상하도록 안내한다.
- 완료 기준은 각 카드의 공개 계약 통과다. 독립 개발 사례는 콘텐츠 품질 검사이며 학습자 채점에 추가하지 않는다. 키보드·모바일·안전·역할·승인 대상 플랫폼은 이 카드의 공통 범위를 각 후보에 적용한다.
- 아래 출처는 작성자가 해당 교안 원문과 공식 문서를 확인한 receipt를 인수한 것이다. 문서 담당이 출처를 다시 검증한 결과로 표현하지 않으며 독립 콘텐츠 검토자가 해당 근거를 확인한다. 교안 파일명만 적은 항목은 연결된 lessonId의 실제 curriculum 경로를 뜻한다.

아래 보충 표는 개별 카드에서 압축한 새/재사용 A와 E의 구분이다. 새 경험이 없는 칸은 별도 기여가 없다는 뜻이며, 존재하지 않는 원자를 만들어 채우지 않는다.

| 후보 | 새 A | 재사용 A | 새 E 또는 비해당 근거 |
| --- | --- | --- | --- |
| number-only-double | 타입에 따라 연산 진입을 통제 | 비교·함수 반환 | 타입 검사 결과를 연산 허용으로 연결 |
| copy-nested-settings | 전/후 전체값을 함께 구성 | 펼침·속성 읽기 | 바뀔 경로 구성→전/후 배치 |
| read-string-list | 별도 새 원자 없음 | 파싱·예외 처리·타입·배열 검사 | 문법→배열→모든 요소 검사→상태 반환 |
| description-pairs | 이름과 설명의 관계를 마크업으로 표현 | 요소 중첩·텍스트 작성 | 별도 새 연결 없음, 한 관계 작성 L1 |
| single-choice-group | 하나의 질문에 상호배타 선택지를 연결 | 입력 속성·명시적 label | 그룹→공통 name→각 value·label 연결 |
| form-value-states | 수정 제한과 제출 참여를 구별 | name/value·불리언 속성 | 별도 새 연결 없음, 상태 C가 추가 근거 |
| cascade-status | 겹치는 규칙을 추적해 승자를 수정 | 선택자 매칭·색상 선언 | 별도 새 연결 없음, 일반 상태 보존 C가 추가 근거 |
| readable-overflow | 별도 새 원자 없음 | 줄바꿈·높이 상한·스크롤 | 가로 문자열과 세로 로그 원인 구분→각 처리 연결 |
| visible-keyboard-focus | 포인터와 초점 표시 상태를 구분 | 상태 선택자·외곽선 선언 | 별도 새 연결 없음, 포인터 없는 초점 C가 추가 근거 |
| column-axis-alignment | 방향을 먼저 보고 축별 공간 배분 | Flexbox·간격·정렬 | 방향 확인→주축/교차축 정렬 연결 |

### 공통 설계와 검증

- 모든 후보는 실제 curriculum lessonId/conceptIds를 확인했다. JS 함수·HTML inert DOM·CSS CSSOM/계산 스타일만 사용한다. 교안·엔진·스키마·UI·진도 변경은 없다.
- 새 경험은 L1~L3 직접 구현이며 T=없음. 힌트는 모두 처음 접힘, concept→observation→implementation의 3단계, 한 번에 하나 공개. 설명과 첫 예시는 기대 결과와 채점에 필요한 태그·id·속성·값·제약을 명시하며 완성 정답 코드만 숨긴다. 정확한 CSS 선언을 요구할 때는 해당 속성으로 연습하는 문제임을 먼저 알린다.
- 선수 교안은 문제 안내에서 제목·개념을 짧게 안내한다. 특정 기존 Quest 완료를 잠금 조건으로 만들지 않는다. 새 문제들의 order는 JS10~12, HTML6~8, CSS5~8. 주제는 실제 교안·개념 관계로 계산하며 임의 필드를 만들지 않는다.
- HTML은 외부 전송/실제 클릭/제출 동작을 실행하지 않고 요구한 마크업 관계만 공개 assertion으로 확인한다. CSS는 고정 fixture·선언·계산값을 확인하며 시각적 접근성 전체 PASS를 주장하지 않는다.
- 기존 단독 교안 예제/확인·객관식은 주로 주어진 코드의 판별이다. 아래 새 과제는 지원을 줄여 직접 구현하고 지정된 실패/경계를 보도록 하되 이 형식 차이만을 새 경험 근거로 삼지 않는다. 각 C/E를 따로 적었다.
- 공개 사례와 다른 입력/주변 요소의 독립 개발 사례, 기준답안, 정상 실행되는 대표오답과 정확한 실패 ID를 fixture에 둔다. 학습자 채점은 publicTests만 쓴다.
- 키보드·결과: 기존 textarea/힌트버튼/실행·다시시도 흐름 재사용, 짧은 소스와 요구목록. 승인 대상 데스크톱에서 첫 문제·새 교안 그룹·상세 실행·힌트·실패 수정 확인은 독립 test_engineer 담당. 모바일은 이번 검증 범위 아님.
- 소유 예정: content/quests/{javascript,html,css}.json, tests/fixtures/{code-quest-solutions,html-code-quest-solutions,css-code-quest-solutions}.js. 테스트코드/문서는 다른 담당 소유.
- 자동 검증: validate:content, 기존 세 콘텐츠 focused suite, 새 기준답안/대표오답/독립 사례 실행, 첫18 레코드 canonical hash 보존. JS legacy 10~25줄/분 일괄 전제는 새 문제를 부풀리지 않고 독립 테스트 작성자가 기존 ID 검사를 보존하며 새 ID에 맞는 최소 계약으로 분리할 필요가 있다.

### 1. quest-javascript-number-only-double / number-only-double

- 과정/언어: javascript/javascript. order10. 목표: 값의 겉모양 대신 타입을 검사한 뒤 숫자 연산을 시작한다. lessonId=js-concept-values-types, conceptIds=[js.type-identification]. 선수: 값과 타입, 조건문, 함수의 입력과 반환.
- MVP 필요: 숫자처럼 보이는 외부 값에 연산부터 적용해 예상치 못한 변환이 생기는 기초 오류를 직접 드러낸다.
- 단서/첫 행동: 숫자 3은 6, 문자열 "3"은 null, false도 null이라는 계약표를 비교한다. 숫자인지 확인하는 조건부터 만든다.
- A 새로 적용: 타입 조건에 맞는 입력만 연산 경로로 통과시킨다. 재사용 A: 비교·함수 반환. E: 타입 검사→숫자에만 두 배 연산. C: 0은 유효한 숫자이지만 "0"/false/null/배열은 거부하며 truthiness나 자동 변환으로 판정할 수 없다. T 없음. L2, beginner, 약 7분.
- 계약/예: doubleNumberOnly(value), 입력 JSON 값(유한 숫자 -1000~1000, 짧은 문자열·불리언·null·작은 배열/객체); 숫자면 두 배, 나머지는 null. 예 3→6, "3"→null, 0→0. starter는 동일 함수의 return null만 제공.
- 단계 힌트: 값의 모습과 타입 구분→0/false/"3"가 조건에서 어떻게 나뉘는지→typeof 비교 후 두 반환 경로를 구성. 정답 코드 없음.
- 설명 문장: “숫자처럼 보이더라도 먼저 실제 타입을 확인해야 자동 변환으로 들어오는 값을 막을 수 있다.”
- 독립성 6차원: (소재) 값 입력 (목표) 타입 이름 출력이 아닌 연산 허용 (입출력) 단일 JSON 값→숫자/null (조건) 0 허용·coercible 배열/문자열 거부 (흐름) 분류 결과가 실행 여부를 결정 (지원) 주어진 typeof 결과 객관식→빈 함수 작성. 기존 numeric-text/typeof-limit 객관식, 배송비의 이미 숫자인 입력과 다르다.
- 공개/오답: 양수·음수·0·숫자문자열·빈문자열·false·null·[3]·{}; 숫자로 변환부터 하는 오답, truthy 숫자만 받는 오답. 독립 사례 소수/다른 문자열/경계±1000. 기준답안 4~6줄, O(1)/O(1).
- 출처: content/lessons/javascript/wiki-values-types.md; ECMAScript typeof https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-typeof-operator (2026-09-14 확인). 사람 판단: 타입 조건과 연산 조건이 한 작은 문제로 읽히는지.

### 2. quest-javascript-copy-nested-settings / copy-nested-settings

- 과정/언어 javascript/javascript. order11. lessonId=js-concept-shallow-copy, conceptIds=[js.shallow-copy,js.object-sharing]. 목표: 바꿀 경로를 찾아 중첩 속성을 바꾸고 전/후 결과를 모두 보존한다. 선수: 객체 공유, 배열 메서드, 얕은 복사.
- MVP 필요: 펼침 한 번이면 중첩 원본도 보존된다고 오해하는 지점을 실행 결과로 드러낸다.
- 단서: original.settings.volume은 처음 값, updated.settings.volume만 새 값이며, 다른 속성도 모두 결과에 남는다.
- 새 A: 보존할 전 상태와 변경할 후 상태를 함께 구성한다. 재사용 A: 객체 펼침·속성 읽기. E: 변경 경로 새로 구성→같은 반환 객체에 전/후 배치. C: 기존 밝기 객관식의 고정된 두 속성과 달리 이름을 미리 나열하지 않은 추가 속성이 바깥/안쪽에 존재하고 모두 남아야 한다. T 없음. L2, beginner, 12분.
- 계약: previewVolumeChange(profile, volume), profile={name,settings:{volume,...},...}, 새 volume 정수0~10. {original: profile의 입력값, updated: settings.volume만 바뀐 전체값} 반환. 입력 자체를 바꾸지 않는 것이 학습 목표지만 현재 public runner는 반환 두 값의 보존만 판정하므로 객체 정체성/모든 입력 불변성을 채점했다고 주장하지 않는다. 자기점검에 함수 종료 뒤 원본도 그대로인지 확인한다. 원본 값을 변형 전 복제하고 입력을 바꾸는 대체 구현은 공개 출력계약만으로 배제되지 않는 한계를 기록한다.
- starter: 함수와 return {original:profile,updated:profile}. 힌트: 바깥과 안쪽 참조 분리→두 경로의 값/추가 필드 비교→바뀔 경로의 각 객체를 새로 구성.
- 설명: “바깥 객체만 복사하면 안쪽 객체를 공유하므로 바뀌는 경로를 새로 만들고 나머지 필드를 남긴다.”
- 독립성: (소재) 설정 미리보기 (목표) 전/후 전체값 비교 (입출력) 알려진 경로+추가필드 객체→두 전체객체 (조건)0 경계/동일 값/알려지지 않은 필드 유지 (흐름)경로 복사 후 두 상태 반환 (지원)밝기 객관식의 완성 코드 선택→실제 구현. 기존 median의 배열 정렬, hash의 소비와 달리 중첩 기록 보존을 관찰한다.
- 공개/오답: 기본 변경,0,10,같은값,바깥/안쪽 추가필드. 대표오답 바깥만복사 후 안쪽 변경; 필요한 name/volume만 재작성해 추가필드 유실. 독립 사례 다른 추가값/배열값 보존. 기준 O(k)/O(k), k=바깥+settings 직접 속성 수; 깊은 복사 의무 없음.
- 출처: wiki-shallow-copy.md 및 https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-copydataproperties (2026-09-14). 사람 판단: 입력 불변성 평가 한계 명시, 추가필드 조건이 불필요한 퍼즐이 아닌지.

### 3. quest-javascript-read-string-list / read-string-list

- 과정/언어 javascript/javascript. order12. lessonId=js-concept-json, conceptIds=[js.json]. 목표: JSON 문법 실패와 파싱 뒤 모양 실패를 구분한다. 선수: JSON·타입·배열·try/catch.
- MVP 필요: 파싱 성공을 데이터 사용 가능과 혼동하지 않도록 실패 위치를 드러낸다.
- 단서: "[\"함수\"]"는 ok, "[1]"은 shape-error, "["는 syntax-error. 첫 행동은 텍스트를 파싱하고 그 성공/실패를 나눈다.
- 새 E: 문법 읽기→배열 확인→모든 항목 문자열 확인→결과 상태 구성. 재사용 A: try/catch·타입·배열 관찰. C: 같은 실패 반환 하나로 뭉개지 않고 문법 실패/사용할 수 없는 모양을 구별하며 빈 배열은 성공이다. T 없음. L3, intermediate,18분.
- 계약: readStringList(text), 길이0~2000 문자열. 반환 {status:"ok",values:문자열배열} 또는 {status:"syntax-error"|"shape-error",values:[]}; 빈 문자열 요소·중복·순서 그대로 허용한다. JSON 값 전체 문법을 직접 파서로 구현할 필요 없음. starter return {status:"shape-error",values:[]}.
- 힌트: 문자열 형식과 프로그램 모양 구분→[1]/null/[]/깨진 괄호의 실패 위치 관찰→parse를 try/catch에서 처리하고 성공 뒤 배열·각 요소 검사. 완성 코드 없음.
- 설명: “JSON을 읽을 수 있다는 사실과 문자열 목록으로 쓸 수 있다는 사실은 별개다.”
- 독립성: (소재) 문자열목록 복원 (목표) 3가지 상태+결과배열 (입출력) JSON문자열→상태객체 (조건) 문법/모양 실패와 빈성공 구별 (흐름) 검사 단계의 서로 다른 실패 분기 (지원) title 타입 객관식의 파싱 완료 전제→전 과정을 구현. 코딩테스트 6개의 문자열계수·누적·정렬·탐색·상태기계와 중복 없음.
- 공개/오답: 정상2개/빈배열/빈문자열요소/중복, 깨진 JSON, 유효 JSON null/object/숫자배열/혼합. 대표오답 파싱 성공값 전부허용, 파싱 예외를 shape-error로 처리, 빈배열 거부. 독립 다른 escaped문자열과 공백JSON. 기준 O(n)/O(n), n=입력문자열 길이.
- 출처: wiki-json.md; https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json.parse (2026-09-14). 사람 판단: 한 문제에 실패 단계가 과도하지 않은지, try/catch를 선수로 명시.

### 4. quest-html-description-pairs / description-pairs

- html/html, order6, lessonId=html-notes-lists, conceptIds=[html.lists]. 목표: 이름·설명의 짝을 구조로 표현한다. 선수: 요소/속성, 목록.
- A: 표시 모양 대신 항목 사이의 관계를 선택한다. C: 기존 ol 순서와 table 행열이 아니라 한 이름에 설명을 붙이는 dl 관계. E 없음,T없음,L1 beginner8분.
- 단서: '형식—HTML', '실습—Code Quest' 두 이름/값 쌍. dl#course-info 안에 dt,dd,dt,dd 직접 자식을 차례로 작성한다. starter는 텍스트 요구만 있는 주석. 설명 목록을 작성한다고 안내하고 dl/dt/dd·필수 id·내용·쌍 순서를 요구에 명시한다. 완성 마크업만 숨긴다.
- 힌트: 목록의 정보관계→각 이름 뒤 설명인지→dl 안 dt/dd 쌍. 설명문: “순서가 중요한 단계나 행열 표가 아니라 이름과 값의 쌍이라 설명 목록을 쓴다.”
- 독립성: 소재 과정정보/목표 쌍관계/입출력 두쌍텍스트→DOM/조건 서로 다른 이름·값 혼동/흐름 관계선택→구조/지원 ol객관식·표Quest→짧은 독립작성. 같은 들여쓰기만 만든 ul 오답과 dt를 모두 먼저놓는 오답 검출.
- 공개: dl#course-info 1개·정확한직접자식 dt/dd 개수/순서/텍스트. 기준 dt+dd가 두 번. 독립 주변 장식 div 추가에도 통과, 쌍의 값 바꾸면 실패. inert DOM 구조만 확인.
- 출처 wiki-lists.md; https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element (2026-09-14). 사람 판단 용어목록의 텍스트정확계약 명료성.

### 5. quest-html-single-choice-group / single-choice-group

- html/html,order7,lessonId=html-notes-form-controls,conceptIds=[html.form-controls]. 목표: 한 질문에서 하나만 선택하는 입력그룹을 작성한다. 선수 입력레이블·제출name.
- A: 관련 선택지들을 하나의 질문/동일 제출이름/서로 다른 제출값으로 연결. C: 이메일 단일입력에서 둘 중 하나만 선택하는 그룹으로 변경, 다른 질문의 name과 혼동하면 그룹이 갈라진다. T없음,L2 beginner12분.
- 계약: form#pace-form 안 fieldset#pace-group, 첫 legend '학습 속도', radio#pace-steady value=steady와 #pace-fast value=fast, 같은 name=pace, 두 명시적 label(for) '차근차근'/'빠르게', 제출버튼type=submit. required는 이번 목표아니므로요구하지않음. starter form/submit만제공.
- 단서 두 선택은동시에고를수없어야함, 화면문구와 제출값구별. 힌트 하나/여러선택관계→name과value구별→radio그룹과fieldsetlegend관계. 설명 “같은 질문의 radio는 name을 공유하고 선택값은 각 value로 구분한다.”
- 독립성: 소재학습속도/목표상호배타선택/입출력두선택→그룹마크업/조건동일name서로다른value/흐름관계정의→그룹과label/지원 완성radio교안→잘못되기쉬운연결을직접작성. 기존 이메일폼·통합textarea에는상호배타그룹없음.
- 공개: 그룹/첫legend/정확한radio두개/각name·value·label연결/submit. 오답 다른name,checkbox두개,중복value. 독립 구조주변문단·그룹순서변형에서관계유지. 실제selection·제출·스크린리더전체검증은하지않음.
- 출처 wiki-form-controls.md; https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio), https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element (2026-09-14). 사람 판단 state실행으로과장하지않기.

### 6. quest-html-form-value-states / form-value-states

- html/html,order8,lessonId=html-notes-form-submission,conceptIds=[html.form-control-states]. 목표: 수정을 막는 두 상태의 의도를 구분해 마크업에 반영한다. 선수: 입력name/label·form-controls.
- A: '수정 불가' 뒤 제출포함 여부까지 비교한다. C: 둘다사용자수정불가지만 readonly는일반제출에포함,disabled는제외. 기존 이메일required에는없음. T없음,L2 beginner10분.
- 계약 form#booking-form, input#booking-code type=text name=bookingCode value=BAM-204(제출포함/수정불가); input#old-code type=text name=oldCode value=OLD-10(제출제외/수정불가); 명시적label과submit은starter제공. readonly/disabled선택은학습자. 공개조건은readonly있고disabled없음/disabled있고readonly없음+기본속성유지.
- 단서 이름값이있어도상태에따라전송목록포함여부다름. 힌트 제출포함질문→disabled/readonly차이→대상text입력에알맞은boolean속성. 설명 “수정을막는목적은같아도제출에남겨야하면readonly,제외할입력은disabled를고른다.”
- 독립성 소재예약확인/목표상태구별/입출력2개텍스트input→서로다른상태/조건동일수정불가의상이한제출참여/흐름제출의도→속성/지원 읽기표→연결상태직접작성.
- 공개: 두입력의고정name/value/type·상태·label. 오답둘다disabled,둘다readonly. 독립 disabled="false"도존재하면disabled임을오답으로잡음. 실제서버전송·FormData결과는채점하지않고정적상태속성확인으로명시.
- 출처 wiki-form-submission.md; https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-disabled 및 https://html.spec.whatwg.org/multipage/input.html#attr-input-readonly (2026-09-14). 사람판단상태실행범위와설명차이.

### 7. quest-css-cascade-status / cascade-status

- css/css,order5,lessonId=css-notes-cascade,conceptIds=[css.cascade]. 목표: 일반/긴급상태의겹치는선언을분리해계산결과를맞춘다. 선수selector·cascade.
- A: 한요소에일치하는여러규칙을찾고이긴규칙을수정. C: 한긴급문단만고치는동시에일반문단의색은보존해야해모든.message색변경은실패. T없음,L2 beginner10분.
- fixture: p.message, p.message.urgent 두개. starter `.message.urgent {color: #9a3412;} .message {color: #1e293b;}`와수정공간. 최종일반색#1e293b·긴급색#b91c1c 요구. 특정selector나!important사용금지는채점하지않음; 자기점검으로명시도근거설명. 예상결과와관찰용HTML제공.
- 힌트 겹친규칙후보→긴급색과일반색분리확인→상태조건이있는규칙수정. 설명 “같은중요도의규칙은명시도와작성순서로이기므로마지막규칙만추가하는것이충분하지않다.”
- 독립성 소재두상태/목표오류수정+형제보존/입출력잘못된CSS→두계산색/조건같은base선택자공유/흐름후보추적→대상만수정/지원 승자객관식→실제수정. 기존notice상속은규칙충돌없음.
- 공개computed-style 일반/긴급 color + base background? 범위불필요라색2검사와긴급두번째동일조건요소추가로3이상충족. 오답base뒤덮기,낮은명시도urgent만뒤추가. 독립 다른태그의같은class에서일반/긴급값확인. 특정선택자사용강요안함.
- 출처 wiki-cascade.md; https://www.w3.org/TR/css-cascade-5/#cascade-sort (2026-09-14). 사람판단요구와computed평가정합성.

### 8. quest-css-readable-overflow / readable-overflow

- css/css,order6,lessonId=css-notes-overflow,conceptIds=[css.overflow]. 목표: 서로다른넘침원인에맞게전체내용을읽을방법을고른다. 선수box-model.
- 새 E: 긴문자열은줄바꿈허용→길이불명로그는높이상한+스크롤. C: 같은hidden처방으로는두영역의정보가사라진다. T없음,L2 beginner12분.
- fixture: 너비고정된.token-panel의긴공백없는p.token과짧은것/긴것두.log-panel. starter width·margin 기본만. 요구 .token overflow-wrap:anywhere·white-space:normal, .log-panel max-height:96px·overflow-y:auto, height:auto(짧을때불필요한고정높이없음). 선언계약임을명시. 높이상한예시텍스트는짧은HTML+기대행동.
- 힌트 가로문자열/세로누적구분→hidden이놓치는내용→줄바꿈규칙과높이상한/스크롤선언. 설명 “줄을나눌수없는문자열과높이가누적되는로그는넘침원인이다르다.”
- 독립성 소재두영역/목표양쪽내용보존/입출력고정fixture→CSS/조건한방법이두영역에통하지않음/흐름원인분류→각해결/지원 로그조합·문자열단일선택객관식→조건둘을비교적용. 기존box너비계산과구분.
- 공개 rule-declaration +computed-style overflow-wrap/white-space/overflow-y/max-height. 오답hidden,nowrap,고정height. 독립 길이가다른fixture/원치않는최종override. 실제스크롤키보드전체동작·가시내용손실전수검증은독립브라우저범위외면미실행기록.
- 출처 wiki-overflow.md; https://www.w3.org/TR/css-overflow-3/#overflow-properties, https://www.w3.org/TR/css-text-3/#overflow-wrap-property (2026-09-14). 사람판단한주요개념가까운두조건/명시선언평가한계.

### 9. quest-css-visible-keyboard-focus / visible-keyboard-focus

- css/css,order7,lessonId=css-notes-states,conceptIds=[css.pseudo-classes]. 목표: hover와별도로실제focus-visible상태의보이는표시작성. 선수selector·상태·대비.
- A: 포인터상태와초점표시상태를분리해선택. C: 평상시outline이없어도focus-visible에서는테두리가나타나야하고:hover만꾸미는답은실패. T없음,L2 beginner10분.
- fixture button.focus-action type=button. starter색·배경만, 평상시outline:none명시(문제과정에서대체초점표시완성필요). 요구 focus-visible outline-width3px/style solid/color#1d4ed8/offset3px. 일반상태outline없음/초점상태computed를검사; hover없는키보드조건설명. 필요한 focus-visible 상태와 채점 속성·값을 요구에 명시하고 완성 코드는 숨긴다.
- 힌트 상태와요소부분구분→Tab초점시hover없어도보일단서→focus-visible규칙에서outline과offset설정. 설명 “hover가아닌초점표시상태에외곽선을주어현재위치를찾게한다.”
- 독립성 소재동작버튼/목표상태전환표시/입출력고정버튼→정상/초점계산값/조건포인터없는상태/흐름상태선택→표시/지원교안예시읽기·disabled객관식→실제강제focus-visible평가. 기존CSSQuest에상태채점없음.
- 공개computed-focus-style 4속성+평상시computed-style. 오답hover만,outline:none로덮기,outline색만변경(두께없음). 독립다른버튼문구/뒤선언충돌. 브라우저focus-visible평가가실제강제상태를읽는현재구현을재사용. 포괄WCAG통과주장없음.
- 출처 wiki-states.md; https://www.w3.org/TR/selectors-4/#the-focus-visible-pseudo, https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html (2026-09-14). 사람판단기본outline:none이완성후안전하며학습중실행과접근성설명정합.

### 10. quest-css-column-axis-alignment / column-axis-alignment

- css/css,order8,lessonId=css-notes-flexbox,conceptIds=[css.flexbox]. 목표: column의세로주축/가로교차축을기준으로서로다른정렬을작성한다. 선수display·spacing·Flexbox.
- A: 방향을먼저정한후남은공간을주축/교차축에맞게분배. C: 기존상품카드의actions row space-between과달리column에서세로가운데·가로시작을구분. T없음,L2 beginner10분.
- fixture 높이240px 너비240px parent.column-actions, 버튼2개. writing-mode:horizontal-tb·direction:ltr고정. starter크기·방향만제공. 요구display:flex,flex-direction:column,justify-content:center,align-items:flex-start,gap12px; 정확한 속성·값을 연습한다는 선언 계약을 요구에 명시하며, 설명은“버튼은위아래,묶음은세로가운데,왼쪽맞춤,사이12px”부터시작.
- 힌트 주축찾기→세로남은공간/가로버튼끝관찰→주축justify/교차align에대응. 설명 “column에서justify는세로,align은가로이므로가로정렬이라는암기대신축을먼저찾는다.”
- 독립성 소재세로행동버튼/목표서로다른축정렬/입출력fixture→5선언/조건충분한높이·column·가로쓰기고정/흐름방향→주/교차정렬/지원축객관식→시각조건에서직접값결정. 기존상품카드는column설정만검사하고column정렬두축을동시에구별하지않음.
- 공개computed-style/선언의5값,오답justify와align교환,row유지. 독립버튼3개·텍스트길이차이에도동일정렬속성. 기하배치정밀픽셀평가는현재assertion에없고computed속성까지만합격범위.
- 출처 wiki-flexbox.md; https://www.w3.org/TR/css-flexbox-1/#flex-direction-property (2026-09-14). 사람판단문제글에좌표조건이충분하고축의답이첫설명에과도노출되지않는지.

### 조사한 기존 포트폴리오

- Code Quest 원형18: JS 배송비/숫자경로/중앙값/연속압축/다음작업/해시4, HTML구조/내비/목록표/이메일폼/통합프로필, CSS상속알림/박스크기/배치카드/반응형Grid.
- coding-tests/javascript: 목표단어세기/재고누적/최장증가구간/상품정렬/이진탐색/격자로봇. 새3개와입출력·판단·결과가겹치지않음.
- web-projects/index: 반응형학습계획보드(HTML구조+CSSGrid/media). 새HTML세개관계/상태와CSS신규focus/axis/overflow/cascade를같은공개계약으로평가하지않음.
- 관련교안원문과quiz실제문구확인. 단순filter→title배열 후보는 기존 quiz-javascript-notes-filter-map과 계약이 같아 폐기. readAge를숫자만바꾼입력검증후보도교안완성예제와차이가작아폐기. 이미지alt/외부링크는preflight와목표불일치로이번묶음에서제외.

## 검증 선정과 증거

새 Quest의 schema·ID/slug/order·lesson/concept·힌트 순서·공개 테스트와 실패 설명·preflight, 기준답안 공개/독립 통과와 대표오답 지정 실패를 검증한다. 새 Quest와 직접 영향받는 탐색·수량/fixture 기대값의 focused 검사만 실행하며 정확한 명령은 담당이 실제 경로와 도구를 확인한 뒤 receipt에 기록한다. 기존 18개 내용 보존은 snapshot/hash로 확인한다. 변경되지 않은 기존 평가기·진도·모바일·다른 교과의 PASS는 관련 대상이 같을 때 재사용하고 전체 검사·빌드를 자동 반복하지 않는다.

### 최종 콘텐츠 계약

`[현재 사실]` 2026-09-15 작성자가 승인된 신규 10개를 콘텐츠·개발 fixture 6개 파일에 추가했다. 기존 18개 레코드의 deep canonical 값과 기존 fixture 원문 복원 SHA-256 보존을 확인했다. 현재 합계는 JavaScript 12·HTML 8·CSS 8이며 root README 수량에 반영했다. 근거는 `/tmp/bam-quest-expansion-author-receipt.md`, 대상 SHA-256은 `/tmp/bam-quest-expansion-author-hashes.json`, 기준선은 `/tmp/bam-quest-expansion-baseline.json`이다. 작성 receipt의 기준 HEAD는 `b97260eb866a15a02a80531107eca4b2144d436b`이며 신규 추가분은 로컬 미게시 상태다. 앞선 PR #20의 탐색·힌트 작업 완료를 이번 신규 콘텐츠 게시로 해석하지 않는다.

현재 콘텐츠 계약의 공개 테스트 상한은 문제당 6개다. 최초 초과 작성과 JSON 예시 불일치는 수정 후 `npm run validate:content`로 PASS했다. 별도 개발 사례로 이동한 조건은 학습자 source에 추가 실행하지 않으며 공개 결과만 완료 판정에 사용한다. 아래 표는 선행 카드에서 변경한 실제 공개·개발 계약이다.

| 신규 Quest | 최종 공개 계약 | 독립 사례·평가 한계 |
| --- | --- | --- |
| number-only-double | 6개: 양수 3·0·숫자 문자열·false·null·배열 [3] | 음수·빈 문자열·객체는 독립으로 이동. 소수·±1000도 독립 사례 |
| copy-nested-settings | 5개: 기본 변경·0·10·동일값·추가 속성; 반환 전/후 전체값 비교 | 원본 불변·참조 정체성은 비채점 자기점검 |
| read-string-list | 6개: 정상 목록·빈 배열·깨진 JSON·null·숫자 배열·혼합 배열; 안내의 세 결과 예시와 일치 | 빈 입력·빈 문자열 요소·중복은 독립으로 이동. 공백·escape·최대 2000자도 독립 |
| description-pairs | 6개: 목록 1개·직접 자식 4개·각 dt/dd의 순서와 텍스트 | dl·id·태그·내용·쌍 순서는 요구에 공개, 완성 마크업만 숨김 |
| single-choice-group | 6개: 첫 legend·각 radio의 type/name/value·각 label 연결/문구·submit | 정확 그룹/입력 수 강제 제거. form 아래 fieldset은 descendant 관계로 허용하고 legend·input·label의 fieldset 내 직접 관계 유지. 실제 선택·제출 실행은 채점 안 함 |
| form-value-states | 6개: form 1개·두 입력의 기본 속성과 서로 반대인 상태·각 label·submit | `:not([attr])`로 반대 속성 부재도 검사. `disabled="false"` 오답은 공개 실패. 서버 전송은 검사 안 함 |
| cascade-status | 4개: 일반 2개·긴급 2개의 최종 색 | 계산 결과를 만족하는 다른 유효 해법 허용 |
| readable-overflow | 6개: 문자열 overflow-wrap/white-space, 긴/짧은 로그 max-height, 긴 로그 overflow-y 계산값과 `.log-panel`의 `height: auto` 정확 선언 | 정확 선언 요구는 height:auto만. 다른 속성은 같은 계산 결과 허용. 너비 180px·margin 0은 fixture에 고정. 최종 픽셀 높이·전체 가시성/키보드 동작 보장 아님 |
| visible-keyboard-focus | 5개: 일반 outline-style, focus-visible width/style/color/offset 계산값 | shorthand·longhand·currentColor도 같은 계산값이면 허용. 평상시 outline 없음은 이번 fixture 조건에 한정 |
| column-axis-alignment | 5개: display/flex-direction/justify-content/align-items/gap 계산값 | 정확 selector 선언 강제 없음. 크기 240px·writing-mode·direction은 fixture 고정. 모든 픽셀 좌표를 채점하지 않음 |

### 2026-09-15 생성·검증 인계

- 작성자 `npm run validate:content` PASS: 정식 언어 4·교안 187·객관식 284·Quest 28·코딩테스트 6·Web Project 1. 이는 계약 검사이며 모든 기준답안의 실행 PASS를 뜻하지 않는다.
- 초기 JS focused 16/18의 두 실패는 기존 전체 문제의 시간 10~25분·답안 10~25줄 고정 기대값이었다. 독립 테스트 작성자에게 반환했고 최종 JS focused 18/18 및 신규 공개/독립 기준답안·대표오답 정확 실패 PASS를 작성자 receipt에서 재사용했다.
- 독립 콘텐츠 검토의 radio 반환은 설명에 없는 form 직접 자식 제약이었다. 작성자가 공개 selector 5곳을 descendant 관계로 수정하고 감싼 fieldset의 독립 유효 사례를 추가했다. 수정 전 HTML focused 6/6은 최종 radio 실행 근거로 재사용하지 않는다.
- 독립 `content_validator` Astra의 최종 메시지 receipt를 총괄이 인수했다: 신규 10개 정적 PASS, 공개 55개·독립 20개 시나리오·대표오답 25개, 연결 교안·관련 객관식·A/E/C/T·힌트·명세 검토. radio descendant 수정도 재검 PASS다. 검사 대상 6개 hash는 작성자 최종 hash 파일과 일치한다. 콘텐츠 검토자는 실행과 기존 18개 보존 검사를 수행하지 않았으며 해당 증거는 작성자·독립 실행 역할과 구분한다.
- 독립 `test_engineer` 최종 실행 PASS를 인수했으며 독립 문서 최종 재검·로컬 통합 PASS를 인수했다. 작성자와 문서 담당은 전체 check/build·대표 브라우저를 중복 실행하지 않았다. 앞선 PR #20의 `dev` merge SHA는 `896a306469983a373b8c03591419c5e00a26ef0f`이며 이번 추가분의 게시 SHA가 아니다.
- HTML은 실제 DOM 관계, CSS는 지정 선언/계산값, JS는 공개 입력/반환까지만 합격 범위다. 전체 접근성·원본 불변·학습 성과·모바일·설치 앱 PASS로 확대하지 않는다.

### 독립 실행 최종 판정

2026-09-15 독립 `test_engineer` 최종 **PASS** receipt `/tmp/bam-quest-expansion-runtime-receipt.md`를 인수했다. Receipt SHA-256은 `666a457c458955498cc0ef1b5befd4536863f3c8f9696e2386168c9ddb379212`다. 수정된 focus 대표오답 3개만 Chrome 150의 실제 `BrowserWebCodeQuestRunner`·sandbox iframe·focus-visible 계산 스타일로 재실행해 모두 `wrong_answer`, 기대 실패 목록 exactMatch 3/3, 실행 오류 0을 확인했다.

기존 Chromium 152의 기준답안 10개·공개 55/55·독립 20시나리오/27assertion·대표오답 22개·대표 UI PASS는 유지된 소스·평가 조건·나머지 fixture hash에 따라 재사용했다. 수정 후 대표오답은 최종 25/25 정확 판정이다. 브라우저 버전과 재실행/재사용 범위를 구분하며 아래 최초 FAIL 이력은 삭제하지 않는다. 독립 문서 최종 재검·로컬 통합도 PASS를 인수했다. 신규 콘텐츠의 Git 게시를 승인받아 진행 중이며 실제 결과는 아래 게시 인수 기준을 따른다.

### 독립 실행의 최초 반환과 수정

2026-09-15 쓰기 없는 `test_engineer`의 `/tmp/bam-quest-expansion-runtime-receipt.md` 최초 판정은 **FAIL**이다. Node v24.17.0에서 `node --test tests/code-quest-content.test.js tests/html-code-quest-content.test.js tests/css-code-quest-content.test.js`를 독립 실행해 30/30 PASS했고, 콘텐츠·fixture·테스트 hash가 같은 테스트 작성자의 탐색 포함 focused 44/44를 재사용했다. 정확한 명령·대상 hash·격리 harness는 해당 receipt를 따른다.

Chromium 152 Codex in-app browser의 실제 Worker·DOMParser·CSSStyleSheet·one-shot sandbox iframe에서 신규 기준답안 10개의 공개 55/55, 독립 20/20 시나리오·27/27 assertion이 통과했다. radio의 wrapper 대안도 독립 2/2·공개 6/6 PASS다. 새 HTML·CSS starter 7개는 모두 오답이며 대표오답 25개도 모두 거부했다. 단, 아래 CSS focus 3개의 fixture 기대 실패 목록이 실제 계산값과 달라 전체 실행 판정을 FAIL로 반환했다. 나머지 대표오답 22개의 정확 실패 목록은 일치했다.

| 대표오답 | 수정 전 기대 실패 | 실제 실패·수정 후 기대 |
| --- | --- | --- |
| focus-styles-hover-only | width·style·color·offset | style·color·offset |
| focus-later-removes-outline | width·style·color | style·color |
| focus-color-without-line | width·style | style |

`outline-style: none`이어도 계산된 width는 3px로 남았고 시각적 선이 없는 오류는 style 검사가 잡았다. 작성자는 `tests/fixtures/css-code-quest-solutions.js`의 세 기대 목록에서 `visible-keyboard-focus-focus-width`만 제거했다. 소스·학습자 콘텐츠·공개 조건·다른 fixture는 불변이다. 수정 파일 SHA-256은 `13ba93273615a7be854615556b1e35d5f26945201a01e8a713828554cbdc2284`이며 작성자 최종 hash receipt에 반영했다. 독립 `content_validator`는 해당 diff와 복원 hash를 재검해 전체 정적 PASS를 유지했다. 수정 후 이 세 대표오답만 실제 실행해 PASS했고 나머지 변경 없는 PASS를 재사용한다.

대표 데스크톱에서는 언어별 목록 수량·기존 진도 보존, 새 JS/HTML/CSS 대표 상세의 제목·순서·공개 수·이전/다음·교안/concept 링크, CSS 제목→목록 링크 Tab 이동과 첫 힌트의 초점·starter 보존을 확인했다. 기존 앱에서는 실행·제출·초기화·source 입력을 하지 않았으며 실제 평가 실행은 격리 harness에서 수행했다. 같은 `src/app.js` hash의 힌트 scroll/source 보존 증거는 재사용했다. 전체 check/build·모바일·설치 앱·무관 교과 검사는 미실행이다.

독립 문서 검토자는 수정 전 `authored-state-receipt.json`의 문서 6개 hash와 변경 로컬 링크/앵커 13개, 상태·역할·최종 계약 정합성을 PASS했다. 이후 변경된 상태 절도 독립 재검 PASS했고 독립 `project_integrator`의 로컬 통합 PASS를 인수했다. 게시 사본에서 바꾼 아래 승인·상태 문구는 문서 담당과 분리된 역할이 해당 diff만 재검한다. 추가 사용자 승인이 필요한 사항은 현재 없다.
