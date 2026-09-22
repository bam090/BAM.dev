# Code Quest 작성 계약

Code Quest는 교안의 개념을 학습자가 언어의 실제 작성 단위로 직접 구현하며 경험을 쌓도록 돕는 콘텐츠다. HTML은 마크업, CSS는 스타일시트, JavaScript는 함수 또는 기능 코드, 알고리즘은 선택한 실행 언어의 풀이 코드를 작성한다. 읽기만 하거나 선택지만 고르는 활동은 완료로 세지 않는다.

학습자 정보 구조와 진도는 [`designs/code-quest.md`](designs/code-quest.md), 코딩테스트 제품은 [`designs/coding-test.md`](designs/coding-test.md), 새 경험 판정은 [`learning-content-design.md`](learning-content-design.md), 현재 필드는 [`content-schema.md`](content-schema.md#code-quest-컬렉션)가 정본이다.

## 코딩테스트와의 분리

`[확정 결정]` [`DEC-QUEST-SEPARATE-01`](roadmap.md#2026-08-29-확정-제품-결정)에 따라 Code Quest와 코딩테스트를 하나의 기초·심화 제품이나 통합 진도로 합치지 않는다. 명시적으로 승인된 [Algorithm Bridge 재분류](roadmap.md#2026-09-15-algorithm-bridge-전체-편입-결정)는 원본 지원과 기존 URL·초안을 보존하는 별도 유지보수이며 일반적인 자동 변환 승인이 아니다.

- Code Quest는 `content/quests/<languageId>.json`과 해당 Code Quest schema를 사용한다.
- 코딩테스트는 `content/coding-tests/<languageId>.json`과 [`코딩테스트 스키마·작성 형식`](content-schema.md#코딩테스트-컬렉션), [`코딩테스트 제품 설계`](designs/coding-test.md)를 사용한다.
- 두 기능은 `lessonId`·`conceptIds`로 같은 교안과 연결할 수 있지만 ID·order·route·초안·결과·완료율은 분리한다.
- Code Quest의 `difficulty`는 이 컬렉션 안의 메타데이터이며 코딩테스트와의 제품 단계가 아니다.
- `practiceLevel`, `sourceKind`와 교차 기능 통합 카탈로그 필드를 만들지 않는다.

## 문제를 쓰기 전 필수 설계

새 문제는 경험 카드와 함께 다음 정보를 고정한다.

```text
courseId / languageId:
lessonId / conceptIds:
학습 주제와 Quest 순서:
선수 교안·Quest:
새 A/E/C/T 또는 필요한 반복 근거:
학습자가 발견할 단서:
starter가 제공하는 범위:
힌트 공개 정책:
공개 사례와 경계:
완료 판정:
기준답안·독립 사례·대표오답:
키보드·모바일 편집·결과 흐름:
```

`courseId`는 학습 과정, `languageId`는 작성·평가 계약을 정한다. 현재 JSON에 없는 `courseId`·주제 표시값은 구현된 필드처럼 콘텐츠에 임의 추가하지 않고 작업 카드와 [`designs/code-quest.md`](designs/code-quest.md)의 표시 모델에 먼저 기록한다.

콘텐츠 유형이나 `difficulty`만으로 새 학습 경험을 증명하지 않는다. 새 A, 새 E, 의미 있는 C, 새 T 확인 기회 또는 필요한 반복의 구체적 차이가 없으면 문제를 추가하지 않는다.

## 컬렉션과 안정적인 연결

`[현재 사실]` 문제 설명, 시작 소스, 단계별 힌트와 학습자 평가에 사용하는 공개 테스트는 `content/quests/<languageId>.json`에 있다. 기준답안·독립 사례·대표오답은 빌드 대상이 아닌 `tests/fixtures/`에 둔다.

컬렉션은 `schemaVersion`, `contractVersion`, `languageId`, 선택적인 `evaluationKind`, 화면 제목과 `quests` 배열을 가진다. 각 Quest는 다음 계약을 지킨다.

- `id`: `quest-<languageId>-...` 네임스페이스의 변경하지 않는 전역 ID
- `slug`: 언어 안의 고유 URL 문자열
- `revision`: 문제·공개 평가 의미가 바뀔 때 올리는 양의 정수
- `order`: 현재 언어 컬렉션 안에서 1부터 이어지는 순서
- `lessonId`, `conceptIds`: 같은 언어의 실제 교안과 선언 개념 연결
- `difficulty`, `estimatedMinutes`, `title`, `summary`, `instructions`, `starterCode`
- `failureExplanations`: 공개 테스트 ID별로 정답 대신 다시 관찰할 지점
- `hints`: `concept → observation → implementation` 순서의 3~5단계 힌트
- `commonMistakes`: 전체 정답을 노출하지 않는 대표 오개념

한 번 배포한 ID를 일괄 개명하거나 이전 진도를 새 revision에 조용히 귀속하지 않는다. `order`와 표시 순서를 분리할 필요가 생기면 `DEC-QUEST-CATALOG-01`을 먼저 결정한다.

## JavaScript 함수 Quest

JavaScript Quest는 `functionContract`, `entryPoint`, 인수·기대값을 가진 `examples`와 `publicTests`를 사용한다. 시작 코드는 `entryPoint`와 같은 이름의 함수를 선언하고 매개변수 이름·순서는 함수 계약에 맞춘다.

입력과 반환은 유한한 숫자를 포함하는 순환 없는 JSON 호환 값이어야 한다. 한 경로의 컨테이너 깊이는 루트 0 기준 512단계, 테스트별 입력·기대값·실제 반환은 UTF-8 compact JSON 16 KiB 이하다. 함수는 strict FunctionBody로 검사·실행하며 공개 테스트마다 새 Worker에서 호출한다.

공개 테스트 DTO는 다음 네 필드만 사용한다.

```json
{
  "id": "stable-test-id",
  "label": "학습자가 읽을 테스트 이름",
  "args": ["함수에", "전달할", "인수"],
  "expected": "JSON 호환 기대값"
}
```

정상값뿐 아니라 최소·최대, 빈 값, 조건 경계와 대표 오답을 구분하는 사례를 포함한다.

## HTML 직접 마크업 Quest

HTML 컬렉션은 `evaluationKind: "html-dom-v1"`을 사용한다. 학습자는 함수가 아니라 HTML source를 작성하고 `requirements`, 실제 마크업 예시와 공개 assertion을 확인한다.

지원 assertion은 `doctype-present`, `selector-exists`, `selector-count`, `attribute-equals`, `text-includes`, `nonblank-attribute-count`, `direct-child-text-equals`다. doctype은 source 첫 선언과 파서 결과를 함께 확인하고, 나머지는 BAM.dev 주 문서에 연결하지 않은 inert template DOM에서 관찰한다. HTML 파서의 오류 복구 때문에 assertion 통과를 포괄적인 문법·접근성 검증이라고 표현하지 않는다.

## CSS 직접 스타일시트 Quest

CSS 컬렉션은 `evaluationKind: "css-style-v1"`을 사용한다. 학습자는 함수가 아니라 CSS source를 작성하고 콘텐츠가 제공한 최대 32 KiB `fixtureHtml`에 적용한다. fixture는 학습자가 바꾸거나 실행 요청에서 교체할 수 없다.

지원 assertion은 `rule-declaration`, `media-rule-declaration`, `computed-style`, `computed-focus-style`, `computed-grid-column-count`다. 선언 검사는 CSSOM, 최종 계산값은 script 권한 없는 one-shot sandbox iframe에서 읽고 매번 제거한다. 브라우저 정규화 차이가 있으므로 기대값도 같은 CSSOM·계산 스타일 경계를 사용한다.

## Web source preflight

HTML·CSS starter, 예시, 기준답안, 대표오답, fixture와 학습자 source는 같은 보수적 preflight를 통과한다. 학습자 source는 UTF-8 20 KiB, 한 실행의 공개 테스트는 최대 20개다.

- HTML은 실행 요소, 이벤트 속성, meta refresh, 외부 요청·탐색 속성, 비정상 주석과 null 문자를 거부한다. 링크는 같은 문서의 `#fragment`만 허용한다.
- CSS는 null 문자, `@import`, `url()`, 외부 URL과 레거시 실행 구문을 거부한다.

이 경계는 위험한 입력과 외부 요청을 줄이는 로컬 학습용 방어이며 완전한 sanitizer나 악성 코드 격리가 아니다. 상세 계약은 [ADR 0003](decisions/0003-inert-web-code-quest-evaluation.md)을 따른다.

## 공개 평가와 결과

`[확정 결정]` [`DEC-PUBLIC-EVALUATION-01`](roadmap.md#2026-08-29-확정-제품-결정)에 따라 Quest 완료에 영향을 주는 문제·assertion·입력·기대 동작은 모두 설치본에 포함하고 확인 가능하게 한다. 원격 서버가 추가 사례를 실행하거나 결과를 보정하지 않는다.

실행 요청은 안정 실행 ID, 계약 버전, Quest ID·revision, 언어, `suite: "public"`, 학습자 source와 공개 테스트를 가진다. 허용 필드만 복제·재검증·동결하고 원본 객체를 평가 중 다시 읽지 않는다. 결과는 테스트별 `passed`, `wrong_answer`, `syntax_error`, `runtime_error`, `timeout`, `output_limit`, `cancelled`, `engine_error`, `not_run` 중 해당 상태와 기대값·실제값을 제공한다.

브라우저나 설치 앱에 전달된 데이터는 사용자가 확인·변조할 수 있으므로 결과는 로컬 자기학습 피드백이다. 공인 점수·인증·부정행위 방지 또는 서버 검증 결과라고 표현하지 않는다.

## 독립 검증

개발 fixture는 Quest마다 다음을 보관한다.

- 모든 공개 테스트를 통과하는 기준답안
- 공개 사례와 중복되지 않는 콘텐츠 검증용 독립 사례
- 정상 실행되지만 지정된 공개 테스트에서 실패하는 대표오답과 실패 ID

독립 사례와 대표오답은 문제·평가기의 품질을 검증할 뿐 학습자 source에 실행하거나 완료 결과에 사용하지 않는다. 따라서 비공개 채점 사례가 아니며 설치본에 포함하지 않는다.

자동 검증은 JSON Schema와 런타임 계약, ID·slug·order, 교안·개념 연결, 공개 테스트와 실패 설명의 1:1 관계, 힌트 순서, preflight, 기준답안 통과와 대표오답의 지정 실패를 확인한다. 특정 요소·메서드 사용이나 포괄적 접근성처럼 assertion으로 관찰하지 않는 요구는 자동 합격으로 과장하지 않고 비채점 자기점검으로 분리한다.

```bash
npm run check
```

새 문제는 교안 실습, 확인 문제, 객관식, 기존 Code Quest, 별도 코딩테스트와 웹과제의 입력·판단·결과·지원 수준을 비교하고 중복 감사 근거를 남긴다. 작성자와 분리된 `content_validator`, `test_engineer`, `project_integrator`가 순서대로 PASS해야 한다.
