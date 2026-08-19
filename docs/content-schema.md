# 콘텐츠 스키마

`content/curriculum.json`은 언어와 교안 메타데이터를 정의하고 본문은 별도 Markdown 파일로 둡니다.

## 언어

| 필드 | 의미 |
| --- | --- |
| `id` | URL과 연결에 쓰는 안정적인 소문자 ID |
| `name` | 사용자에게 보이는 이름 |
| `shortName` | 작은 배지용 이름 |
| `status` | `available`, `sample`, `planned` 중 하나 |
| `accent` | CSS에서 허용한 테마 키 |

`available`은 현재 단계에서 정식으로 제공하는 언어, `sample`은 계약의 언어 독립성을 확인하는 최소 콘텐츠, `planned`는 아직 탐색할 수 없는 예정 언어를 뜻합니다. `available`과 `sample` 언어에는 적어도 교안 하나와 객관식 컬렉션 하나가 있어야 합니다. 두 상태의 콘텐츠는 학습·복습 링크를 제공하며, `planned` 언어는 교안 파일이 미리 있어도 직접 탐색하거나 최근 학습 위치로 복원하지 않습니다.

## 교안

| 필드 | 의미 |
| --- | --- |
| `id` | 진도와 평가가 참조하는 변경하지 않는 ID |
| `languageId` | 언어 ID |
| `order` | 언어 안에서 1부터 시작하는 연속 순서 |
| `slug` | 해시 URL에 쓰는 고유 문자열 |
| `title` | 화면 제목 |
| `summary` | 목록에 보이는 한 문장 설명 |
| `essentialQuestion` | 학습을 이끄는 핵심 질문 |
| `objectives` | 확인 가능한 학습 목표 배열 |
| `estimatedMinutes` | 예상 학습 시간 |
| `conceptIds` | 퀴즈·Quest가 연결할 개념 ID 배열 |
| `contentFile` | 저장소 루트 기준 Markdown 경로 |
| `source` | 원본 성격과 검증일을 기록하는 메타데이터 |

새 교안을 추가하면 `npm run validate:content`로 필수 필드, ID·slug 중복, 순서 연속성, 콘텐츠 파일 존재 여부를 확인합니다. `contentFile`은 반드시 해당 언어의 `content/lessons/<languageId>/` 아래를 가리켜야 합니다. 외부 응답이 없어도 실행되어야 하는 교안 예제 데이터는 `content/fixtures/<languageId>/`에 프로젝트가 관리하는 정적 JSON으로 두고 same-origin 경로로 요청합니다. `content/` 전체가 빌드 결과에 포함되므로 별도 원격 API에 의존하지 않습니다.

## 객관식 컬렉션

`content/quizzes/<languageId>.json`은 언어별 객관식 문제를 정의합니다. 스키마는 특정 언어에 종속되지 않으며, 문항은 교안의 안정 ID로 근거를 연결합니다.

| 필드 | 의미 |
| --- | --- |
| `schemaVersion` | 현재 지원 버전 `1` |
| `languageId` | 파일명과 일치하는 언어 ID |
| `title` | 복습 화면 제목 |
| `questions` | 한 개 이상의 문항 배열 |
| `question.id` | `quiz-<languageId>-...` 형식의 전역 고유 ID |
| `lessonId` | 근거가 되는 교안 ID |
| `conceptId` | 해당 교안에 선언된 개념 ID |
| `difficulty` | `basic` 또는 `application` |
| `prompt` | 문제 본문 |
| `code` | 선택적 코드·마크업 예시 문자열 |
| `options` | 정확히 4개의 선택지 |

각 선택지는 `a`~`d` ID, 문구, `isCorrect` boolean, 개별 `feedback`을 가집니다. 문항마다 정답은 정확히 하나여야 하며 오답을 포함한 네 선택지 모두에 이유가 있어야 합니다. `npm run validate:content`는 저장소의 모든 객관식 JSON을 JSON Schema와 런타임 계약으로 검사하고 파일명·언어·교안·개념 참조와 전역 문항 ID 중복을 확인합니다. JavaScript 컬렉션의 14문항 분포와 기존 확인 문제 중복은 별도 콘텐츠 테스트로 한 번 더 검증합니다.

## Code Quest 컬렉션

`content/quests/<languageId>.json`은 학습한 개념을 언어의 실제 작성 단위로 구현하는 문제를 정의합니다. 공통 메타데이터는 `schemaVersion`, 실행 DTO와 맞추는 `contractVersion`, `languageId`, 화면 제목과 `quests` 배열입니다. HTML·CSS 컬렉션은 평가기를 고르는 `evaluationKind`도 가집니다. JavaScript·Java 함수/메서드 계약은 `content/schema/code-quest.schema.json`, HTML·CSS 직접 소스 계약은 `content/schema/web-code-quest.schema.json`을 따릅니다.

| 공통 필드 | 의미 |
| --- | --- |
| `evaluationKind` | HTML은 `html-dom-v1`, CSS는 `css-style-v1`. JavaScript·Java 컬렉션은 생략하고 `languageId`로 함수/메서드 실행기를 라우팅 |
| `quest.id` | `quest-<languageId>-...` 형식의 안정적인 전역 ID |
| `slug` | Quest 해시 URL에 쓰는 언어 내 고유 문자열 |
| `revision` | 계약·공개 테스트가 바뀔 때 올리는 양의 정수 |
| `order` | 언어 안에서 1부터 시작하는 연속 순서 |
| `lessonId` | 근거 교안의 안정 ID |
| `conceptIds` | 해당 교안에 실제 선언된 개념 ID 배열 |
| `difficulty` | `beginner`, `intermediate`, `advanced` 중 하나 |
| `starterCode` | 언어의 실제 편집 단위로 제공하는 시작 소스 |
| `failureExplanations` | 각 공개 테스트 ID에 정확히 하나 대응하는 실패 관찰 지점 |
| `hints` | `concept` → `observation` → `implementation` 순서의 단계별 힌트 |
| `commonMistakes` | 정답을 직접 노출하지 않는 대표 오개념 설명 |

### JavaScript 함수 Quest

JavaScript Quest는 `functionContract`, `entryPoint`, 인수·기대값을 가진 `examples`와 `publicTests`를 사용합니다. 각 예시와 공개 테스트의 `args` 개수는 함수 매개변수 개수와 같아야 합니다. JSON 입출력은 경로당 컨테이너 512단계와 테스트별 16 KiB 제한을 지킵니다. 학습자 함수는 테스트마다 새 Worker에서 호출되고 반환값을 기대값과 비교합니다.

### Java 정적 메서드 Quest

Java Quest는 `public class Solution`과 `public static <반환 타입> <entryPoint>(...)` 메서드를 포함한 전체 소스를 `starterCode`로 사용합니다. 매개변수와 반환값은 `int`, `boolean`, `String`, `int[]`, `String[]`만 허용합니다. 로컬 채점기는 `javac --release 21 -proc:none`로 컴파일하고, 화면에 공개된 각 테스트를 독립 JVM 프로세스에서 실행합니다.

### HTML·CSS 직접 소스 Quest

HTML·CSS Quest는 함수를 선언하지 않습니다. `instructions`, 문자열 배열 `requirements`, 실제 HTML 또는 CSS 문자열과 설명으로 구성된 `examples`, assertion 기반 `publicTests`를 사용합니다. 학습자 소스는 UTF-8 20 KiB 이하여야 합니다.

| 구분 | 추가 필드·공개 assertion |
| --- | --- |
| HTML `html-dom-v1` | 직접 마크업. `doctype-present`, `selector-exists`, `selector-count`, `attribute-equals`, `text-includes`, `nonblank-attribute-count`, `direct-child-text-equals` |
| CSS `css-style-v1` | 최대 32 KiB의 고정 `fixtureHtml`과 직접 스타일시트. `rule-declaration`, `media-rule-declaration`, `computed-style`, `computed-focus-style`, `computed-grid-column-count` |

HTML doctype은 source 첫 선언과 문서 파서 결과를 함께 확인하고, 나머지 구조는 inert template DOM에서 검사합니다. CSS 선언과 최상위 미디어 조건 assertion은 정확한 규칙 안의 최종 같은-selector 선언을 CSSOM에서 확인하고, 서로 다른 selector의 우선순위까지 적용된 최종 결과는 `computed-style`로 구분합니다. `computed-focus-style`은 실제 `:focus-visible` 상태를 활성화한 뒤 최종 계산값을 읽습니다. 계산 스타일은 안전 검사를 통과한 고정 fixture를 one-shot sandbox iframe에 넣어 검사합니다. `fixtureHtml`은 콘텐츠 계약의 일부이며 학습자가 수정하거나 실행 요청에서 교체할 수 없습니다.

HTML·CSS의 시작 코드·예시·fixture·학습자 소스는 평가 전에 공통 preflight를 통과해야 합니다. HTML은 비정상·미종료 주석, 실행 요소, 이벤트 속성, 문자 참조 우회를 포함한 meta refresh, `ping` 등 외부 리소스와 탐색을 시작할 수 있는 속성을 거부하며 `href`는 같은 문서의 `#fragment`만 허용합니다. CSS는 `@import`, `url()`, 외부 URL과 레거시 실행 구문을 거부합니다. 상세 경계와 한계는 [ADR 0003](decisions/0003-inert-web-code-quest-evaluation.md)에 기록합니다.

Quest 순서, ID·slug·공개 테스트 ID의 전역 고유성, 교안·개념 참조, 평가 종류와 언어의 일치, `failureExplanations`의 1:1 대응, 힌트 단계 순서는 `npm run validate:content`와 전용 콘텐츠 테스트로 검증합니다. 현재 콘텐츠는 JavaScript 5개, HTML 5개, CSS 4개, Java 5개입니다. 화면에 제공되는 모든 assertion·입력·기대값은 공개 테스트이며 비밀 또는 숨김 테스트라고 표현하지 않습니다. 전체 작성 규칙은 [Code Quest 작성 가이드](code-quest-authoring.md)를 따릅니다.

## 코딩테스트 컬렉션

`content/coding-tests/<languageId>.json`은 목록 검색·필터와 제출 채점에 사용하는 문제를 정의합니다. `content/schema/coding-test.schema.json`과 런타임 검증을 함께 적용합니다.

| 필드 | 의미 |
| --- | --- |
| `problem.id` | `coding-test-<languageId>-...` 형식의 안정적인 전역 ID |
| `slug`, `revision`, `order` | URL, 문제 계약 버전, 언어 내 연속 순서 |
| `lessonId`, `conceptIds` | 같은 언어의 근거 교안과 개념 |
| `difficulty` | `beginner`, `intermediate`, `advanced` |
| `type`, `tags` | 유형 필터 값과 검색용 주제 |
| `description`, `functionContract` | 문제 설명, 매개변수·반환·제한·목표 복잡도 |
| `entryPoint`, `starterCode` | 호출할 함수 이름과 초기 코드 |
| `examples` | 공개 테스트와 실제 입출력이 일치하는 예제 |
| `publicTests` | 제출 시 모두 실행하는 화면 공개 테스트 |
| `runTestIds` | 빠른 실행에 쓰는 `publicTests`의 진부분집합 |
| `failureExplanations` | 각 공개 테스트에 정확히 하나씩 대응하는 확인 지점 |

`테스트 실행`은 `runTestIds`가 가리키는 사례만, `제출 및 채점`은 `publicTests` 전체를 실행합니다. 둘 다 화면에 공개된 같은 데이터이며 비밀·숨김 테스트가 아닙니다. JavaScript는 one-shot Worker에서, Java는 로컬 격리 채점기에서 실행합니다. 언어별 기준 풀이, 공개 테스트와 중복되지 않는 독립 사례, 대표 오답은 `tests/*coding-test-content.test.js`로 실제 언어 런타임에서 검증합니다.

## Web Project 컬렉션

`content/web-projects/index.json`은 HTML·CSS를 함께 작성하는 작은 프로젝트를 정의합니다. `content/schema/web-project.schema.json`과 런타임 계약을 함께 적용하며, 프로젝트는 `web-project-` 안정 ID, URL용 `slug`, `revision`, 연속된 `order`와 실제 교안·개념을 가리키는 `conceptRefs`를 가집니다.

v1 프로젝트는 `index.html`과 `styles.css` 두 파일만 사용합니다. 공개 자동 기준은 HTML DOM·CSSOM assertion과 실패 설명을 포함하고 합계가 정확히 70점이어야 합니다. 사람이 미리보기를 보고 판단해야 하는 기준은 세 단계 자가평가 scale로 분리하며 합계가 정확히 30점이어야 합니다. 자동 평가기 오류·취소·미실행은 0점으로 확정하지 않고, 자가평가가 끝나기 전에는 전체 임시 점수를 숫자로 표시하지 않습니다.

시작 코드·기준답안·대표오답·학습자 제출은 같은 HTML·CSS source preflight와 파일 크기 제한을 통과해야 합니다. Web Project HTML에는 `style` 요소와 `style` 속성을 허용하지 않아 CSS 계산 기준이 `styles.css` 제출만 평가하게 합니다. 브라우저에 포함되는 assertion은 모두 공개 기준이며, 자세한 파일·제출·점수 계약과 독립 검증 절차는 [Web Project 작성 가이드](web-project-authoring.md)를 따릅니다.
