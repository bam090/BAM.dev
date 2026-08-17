# Code Quest 작성 계약

Code Quest는 교안의 개념을 학습자가 작은 순수 함수로 직접 구현하도록 돕는 콘텐츠입니다. 문제 설명, 시작 코드, 단계별 힌트와 브라우저에 전달되는 공개 테스트는 `content/quests/<languageId>.json`에 두고, 기준 풀이와 대표 오답은 빌드 대상이 아닌 `tests/fixtures/`에 둡니다.

## 컬렉션과 안정적인 연결

컬렉션은 다음 값을 가집니다.

| 필드 | 의미 |
| --- | --- |
| `schemaVersion` | 콘텐츠 스키마 버전. 현재 값은 `1`입니다. |
| `contractVersion` | 채점 요청 계약 버전. 현재 값은 `1`입니다. |
| `languageId` | 파일명과 커리큘럼 언어 ID에 연결되는 값입니다. |
| `title` | 컬렉션의 화면 제목입니다. |
| `quests` | 해당 언어의 Quest 배열입니다. |

각 Quest의 `id`와 `slug`는 소문자, 숫자, 하이픈만 사용하고 한 번 배포한 뒤 의미를 바꾸지 않습니다. `id`는 `quest-<languageId>-...` 네임스페이스를 사용합니다. 문제나 테스트의 의미가 달라지면 같은 ID에서 `revision`을 올려 이전 실행 결과와 구분합니다. `order`는 언어 컬렉션 안에서 1부터 빈틈없이 이어집니다.

`lessonId`는 같은 언어의 교안을 가리키고, 모든 `conceptIds`는 그 교안이 선언한 개념 ID 안에서 선택합니다. 현재 JavaScript 세트는 Worker에서 결과를 결정적으로 비교할 수 있는 값·제어 흐름, 배열·객체, 입력-처리-출력 분해에 집중합니다.

## 문제 계약

Quest는 다음 내용을 함께 제공해야 합니다.

- `difficulty`, `estimatedMinutes`: 대상 수준과 예상 풀이 시간
- `title`, `summary`, `instructions`: 문제 설명과 정책 우선순위
- `functionContract`: 매개변수, 반환값, 입력 범위, 예상 시간·공간 복잡도
- `entryPoint`, `starterCode`: 채점기가 호출할 함수와 학습자가 편집할 시작 코드
- `examples`: 실제 공개 테스트와 같은 입출력 쌍 및 설명
- `publicTests`: 학습자가 실행하고 결과를 확인할 3~6개 테스트
- `failureExplanations`: 공개 테스트 ID별 학습자용 실패 관찰 지점
- `hints`: 개념 → 관찰 → 구현 순서의 3단계 이상 힌트
- `commonMistakes`: 정답 코드를 노출하지 않는 대표 오답 설명

입력은 순환 없는 JSON 호환 값이어야 합니다. `undefined`, `NaN`, `Infinity`, `BigInt`, 함수, `Date`, `Map`, `Set`, 비어 있는 항목이 있는 배열은 함수 입출력 계약에 사용하지 않습니다. 한 경로의 컨테이너는 루트를 깊이 0으로 세어 총 512단계까지만 허용하고 513단계부터 거부합니다. 테스트별 `args`, `expected`, 실제 반환값은 각각 UTF-8 compact JSON 기준 16 KiB 이하여야 합니다. 같은 객체를 여러 위치에서 참조하는 alias/DAG는 JSON으로 펼쳐질 각 위치의 바이트를 모두 합산하며 순환 참조는 허용하지 않습니다. 채점 결과는 JSON 값 계약이므로 객체 참조 동일성 자체를 평가하지 않습니다.

시작 코드는 `entryPoint`와 같은 이름의 함수를 선언하며, 매개변수 이름과 순서는 `functionContract.parameters`에 맞춥니다. 소스는 strict FunctionBody로 실행되고 실행 전 strict Script 문법 검사도 통과해야 하므로 최상위 `return`은 `syntax_error`입니다. 문자열·템플릿·주석과 중첩 함수 안의 `return`은 정상적으로 허용하며, 유효한 최상위 `arguments`와 `var await`도 오탐으로 거부하지 않습니다.

힌트는 다음 순서를 지킵니다.

1. `concept`: 어떤 개념을 떠올려야 하는지 설명합니다.
2. `observation`: 예시나 경계값에서 무엇을 비교할지 안내합니다.
3. `implementation`: 다음 한두 구현 단계를 제시하되 전체 정답을 제공하지 않습니다.

## 공개 테스트와 채점 요청

`publicTests`의 각 항목은 채점 요청의 테스트 DTO와 같은 네 필드만 가집니다.

```json
{
  "id": "stable-test-id",
  "label": "학습자가 읽을 테스트 이름",
  "args": ["함수에", "전달할", "인수"],
  "expected": "JSON 호환 기대값"
}
```

화면은 컬렉션의 `failureExplanations`를 `testId`로 연결할 수 있습니다. runner 요청에는 설명을 섞지 않고 다음 값만 전달합니다.

```text
contractVersion: 1
requestId: 실행마다 만드는 안정적인 요청 ID
questId: Quest의 안정적인 ID
questRevision: Quest의 revision
languageId: javascript
suite: public
source: 학습자가 편집한 코드
entryPoint: Quest의 함수 이름
tests: publicTests에서 id, label, args, expected만 투영한 배열
```

각 테스트의 `args` 항목 수와 순서는 `functionContract.parameters`와 같아야 합니다.

테스트는 정상값뿐 아니라 최솟값, 최댓값, 조건 경계와 빈 배열 같은 예외적인 경계를 포함합니다. 실패 설명은 정답을 대신 제시하지 않고, 학습자가 어느 조건이나 반환 형태를 다시 관찰할지 알려 줍니다.

## 현재 범위에서 제외하는 문제

현재 채점기는 함수 인수와 반환값을 테스트마다 새 Worker에서 비교합니다. 다음 문제는 이 계약으로 핵심 개념을 정확하게 평가하기 어렵거나 결과가 실행 환경에 따라 달라질 수 있어 JavaScript 첫 세트에서 제외합니다.

- DOM 조작과 이벤트: 문서 구조, 포커스, 이벤트 전파를 함수 반환값만으로 평가할 수 없습니다.
- 실제 `fetch()`와 네트워크: 연결 상태와 원격 응답이 결과에 영향을 줍니다.
- 시간, locale, 난수 의존 코드: 같은 입력에도 실행 시점과 환경에 따라 결과가 달라질 수 있습니다.
- 호출 사이의 상태나 클로저를 평가하는 문제: 공개 테스트마다 실행 문맥이 초기화됩니다.
- 함수, `undefined`, 특수 객체를 반환하는 문제: 현재 결과 비교 계약의 JSON 값 범위를 벗어납니다.

Worker는 로컬 학습 피드백을 위한 실행 경계이며 권한 판단을 위한 보안 경계가 아닙니다. 브라우저에 제공되는 문제와 테스트는 개발자 도구에서 확인할 수 있습니다.

## 독립 검증

`tests/fixtures/code-quest-solutions.js`는 Quest마다 다음 자료를 보관합니다.

- 모든 공개 테스트와 추가 독립 검증 사례를 통과하는 기준 풀이
- 기준 풀이의 예상 시간·공간 복잡도
- 정상적으로 실행되지만 지정된 공개 테스트에서 잘못된 값을 반환하는 대표 오답
- 정상값, 최솟값, 최댓값, 예외적 경계의 테스트 ID 목록

기준 풀이는 초보자가 시작 코드에서 10~25줄 안에 작성할 수 있는 형태를 사용합니다. 테스트는 실제 JavaScript 실행기를 통해 기준 풀이와 대표 오답을 호출하고 반환값을 비교합니다.

출력 비교만으로는 학습자 코드의 특정 메서드 사용, 시간·공간 복잡도, 인수 변경 여부를 강제할 수 없습니다. 따라서 현재 Quest의 합격 조건은 반환값으로 관찰 가능한 요구사항만 사용합니다. 이런 구현 특성이 추가 학습 목표로 필요하다면 자동 채점 조건과 분리한 비채점 자기점검 항목으로 명시해야 하며, 공개 테스트 통과만으로 달성했다고 표현하지 않습니다.

새 컬렉션을 추가한 뒤 다음 명령으로 스키마, 파일명·언어, 전역 ID·slug·순서, 교안·개념 연결, 채점 DTO, 기준 풀이와 대표 오답을 함께 검증합니다.

```bash
npm run check
```

## JavaScript 첫 세트의 중복 감사

첫 세트는 기존 교안의 `sumPositiveNumbers`, `getActiveUserNames`, `getEvenSquares`, 게시글 검색, DOM 할 일, same-origin 로컬 fixture를 사용하는 `fetch()` 실습과 다른 함수 계약을 사용합니다. 기존 객관식이 실행 결과를 선택하는 활동이라면, Quest는 입력과 반환 계약을 읽고 함수를 직접 완성하는 활동입니다.

의미상 중복은 문구 비교만으로 확정할 수 없습니다. 새 문제를 추가할 때는 교안 실습, 확인 문제, 객관식 컬렉션과 입력·처리 규칙·반환 형태를 함께 비교하고 감사 결과를 검토 기록에 남깁니다.
