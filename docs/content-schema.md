# 콘텐츠 스키마

`content/curriculum.json`은 카테고리, 과정, 실행 언어와 교안 메타데이터를 정의하고 본문은 별도 Markdown 파일로 둡니다.

```text
category ──► course ──► lesson ──► Markdown
                  └──► language
```

카테고리는 사이드바의 큰 학습 영역, 과정은 교안 순서와 URL의 단위, 언어는 예제·Quest·평가기의 실행 계약입니다. 현재 알고리즘은 별도 `courseId: algorithm`을 가지면서 `languageId: java`를 사용합니다.

## 카테고리

| 필드 | 의미 |
| --- | --- |
| `id` | 과정이 참조하는 안정적인 소문자 ID |
| `name` | 사용자에게 보이는 이름 |
| `status` | `available`, `sample`, `planned` 중 하나 |
| `description` | 카테고리의 학습 범위 설명 |

## 과정

| 필드 | 의미 |
| --- | --- |
| `id` | URL, 교안 순서와 디렉터리에 쓰는 안정적인 소문자 ID |
| `categoryId` | 존재하는 카테고리 ID |
| `languageId` | 예제와 실행 평가에 사용할 존재하는 언어 ID |
| `name` | 사용자에게 보이는 과정 이름 |
| `shortName` | 작은 배지용 이름 |
| `status` | `available`, `sample`, `planned` 중 하나 |
| `accent` | CSS에서 허용한 테마 키 |
| `description` | 과정의 학습 범위 설명 |

`available`과 `sample` 과정에는 적어도 교안 하나가 있어야 합니다. `planned` 과정은 탐색 가능한 정식 과정으로 취급하지 않습니다.

## 언어

| 필드 | 의미 |
| --- | --- |
| `id` | URL과 연결에 쓰는 안정적인 소문자 ID |
| `name` | 사용자에게 보이는 이름 |
| `shortName` | 작은 배지용 이름 |
| `status` | `available`, `sample`, `planned` 중 하나 |
| `accent` | CSS에서 허용한 테마 키 |
| `description` | 언어의 지원·실행 범위 설명 |

`available`은 현재 단계에서 교안·객관식을 정식으로 탐색할 수 있는 언어, `sample`은 콘텐츠·라우팅 계약의 언어 독립성을 확인하는 최소 지원 표본, `planned`는 아직 탐색할 수 없는 예정 언어를 뜻합니다. 이 상태만으로 Code Quest·코딩테스트 실행 지원을 보장하지 않습니다. 현재 Code Quest 필수 제공 대상은 `javascript`, `html`, `css` 중 `available`인 언어이며 Java 정적 제공은 별개입니다. 과정의 노출 상태와 언어 상태는 별도 필드입니다.

## 교안

| 필드 | 의미 |
| --- | --- |
| `id` | 진도와 평가가 참조하는 변경하지 않는 ID |
| `courseId` | 교안이 속한 과정 ID |
| `languageId` | 해당 과정과 같은 실행 언어 ID |
| `order` | 과정 안에서 1부터 시작하는 연속 순서 |
| `slug` | 해시 URL에 쓰는 고유 문자열 |
| `title` | 화면 제목 |
| `summary` | 목록에 보이는 한 문장 설명 |
| `essentialQuestion` | 학습을 이끄는 핵심 질문 |
| `objectives` | 확인 가능한 학습 목표 배열 |
| `estimatedMinutes` | 예상 학습 시간 |
| `conceptIds` | 퀴즈·Quest가 연결할 개념 ID 배열 |
| `contentFile` | 저장소 루트 기준 Markdown 경로 |
| `source` | 원본 성격과 검증일을 기록하는 메타데이터 |

새 교안을 추가하면 `npm run validate:content`로 필수 필드, ID와 과정별 slug 중복, 과정별 순서 연속성, 카테고리·과정·언어 연결과 콘텐츠 파일 존재 여부를 확인합니다. `contentFile`은 반드시 해당 과정의 `content/lessons/<courseId>/` 아래를 가리켜야 합니다. 외부 응답이 없어도 실행되어야 하는 교안 예제 데이터는 `content/fixtures/<languageId>/`에 프로젝트가 관리하는 정적 JSON으로 두고 same-origin 경로로 요청합니다. `content/` 전체가 빌드 결과에 포함되므로 별도 원격 API에 의존하지 않습니다.

알고리즘 과정 교안은 Markdown의 `개념 연결` 섹션에서 `선행`, `이 단원`, `후속` conceptId를 안내합니다. `이 단원` ID는 커리큘럼의 `conceptIds`와 순서까지 같아야 하고, 선행·후속 ID는 실제 앞·뒤 교안에 선언되어야 합니다. 마지막 교안은 후속 ID를 만들지 않고 과정의 끝임을 명시합니다. 별도 스키마 필드를 추가하지 않고 기존 안정 ID와 과정별 교안 순서로 연결을 검증합니다.

### 원문 반입 출처

`[현재 사실]` `lesson.source`의 기존 `kind`·`verifiedAt`은 유지하고 아래 반입 필드 네 개를 선택적인 한 묶음으로 지원한다. 하나라도 있으면 네 개가 모두 필요하다. 기존 교안에는 새 필드를 강제로 소급하지 않는다. JSON Schema와 런타임 검사에 반영돼 있으며, 검증 증거는 [로컬 복습 작업 카드](work-items/2026-09-09-local-review.md)에서 확인한다.

| 선택 필드 | 반입 교안에 기록할 값 |
| --- | --- |
| `originalPath` | 기존 `profile/` 또는 아래 HTML 전환 계약의 `wiki/학습자료/밤데브 학습문서/` 아래 상대 Markdown 경로. 사용자 계정명이 포함된 절대경로, 역슬래시, 제어문자, 빈 경로 부분·`.`·`..`는 허용하지 않음 |
| `sha256` | 반입 시 원본 파일의 전체 바이트를 계산한 소문자 SHA-256 64자리. 발췌본이어도 원본 해시를 기록 |
| `importedAt` | 반입한 날짜 `YYYY-MM-DD` |
| `importMode` | `copy`, `excerpt` 또는 아래 HTML 전환 계약의 `derived`. 구조·의미 변경이나 제외가 있으면 기록에 범위를 설명 |

출처 필드가 없던 기존 교안과 안정 ID는 유효하게 유지한다. 반입한 파일·범위·변경·공식 사실 확인과 원문 해시는 해당 콘텐츠 검토 기록에 연결한다. 원문을 외부 API로 읽거나 자동 동기화하는 계약이 아니며, [학습 문서 복습 설계](designs/lesson-review.md#콘텐츠와-갱신)의 명시적 갱신을 따른다.

`npm run validate:content`는 `copy` 반입본의 SHA-256과 `source.sha256` 일치를 검사한다. 원본 파일은 자동으로 열지 않으므로 최초 반입·갱신 시 원본과의 바이트 일치는 별도로 확인한다. 반입본은 H1 시작·본문 500자 이상·기존 메타데이터 목표·파일/참조 유효성을 유지하되 기존 교안의 필수 절 형태로 재작성하지 않는다. 발췌본은 원본 전체 해시와 발췌 범위를 독립 검토하며 `copy`와 같은 본문 해시 일치를 요구하지 않는다.

### HTML 파생 교안의 전환 계약

`[확정 결정]` [HTML 개념 문서 전환](designs/lesson-review.md#html-개념-문서-전환)의 아래 확장은 기존 필수 필드와 저장 키를 유지한다. `[현재 사실]` 선택 필드·출처 허용 범위·명시적 답 절 검사와 개념 상세 문서 연결을 JSON Schema·런타임·콘텐츠 검사·화면에 반영했다. 독립 검증과 통합 완료는 별도이며 확정 ID·원문 구간·해시·연결과 실제 판정은 [작업 카드](work-items/2026-09-13-html-concept-lessons.md)를 따른다.

| 필드 | 계약 |
| --- | --- |
| `lesson.archivedFromCatalog` | 선택 boolean. `true`인 기존 HTML 5교안을 기본 문서 목록에서 제외한다. ID·slug·원본 파일·`order`·깊은 URL·진도와 실습 소유 관계는 유지한다. 누락은 활성 문서다. |
| `lesson.answerHeading` | 선택적인 비어 있지 않은 문자열. 새 HTML 파생 교안은 `핵심 질문 답`을 사용하며 Markdown에 같은 실제 `##` 절이 반드시 있어야 한다. 명시한 절이 없으면 콘텐츠 검증 실패이며 출처 종류로 답변을 추정해 대체하지 않는다. 필드가 없는 기존 교안만 종전 fallback을 유지한다. |
| `source.originalPath` | 기존 안전한 `profile/` 경로 외에 `wiki/학습자료/밤데브 학습문서/` 아래 실제 보관함 상대 Markdown 경로를 허용한다. 절대 경로·역슬래시·제어문자·빈 부분·`.`·`..`는 계속 금지한다. |
| `source.importMode` | 기존 `copy`·`excerpt`에 `derived`를 추가한다. `derived`는 승인 원문에 기초한 분할·재구성과 목표·질문·직접답 보완이며 원문과 같은 문장/바이트라고 주장하지 않는다. |
| `reviewConcept.documentLessonId` | 선택 필드. `lessonId`는 문항의 소유 교안, `documentLessonId`는 상세 읽기와 `heading`·`excerpt`의 실제 교안이다. 없으면 두 역할 모두 기존 `lessonId`를 사용한다. 두 교안 모두 존재하고 같은 개념 ID를 선언하며 실제 문항의 언어와 일치해야 한다. 기존 같은 과정 조건과 승인된 언어 과정 간 예외는 아래 [공유 상세 문서 계약](#javascriptjava-파생-교안과-공유-상세-문서)을 따른다. |

`source`의 네 반입 필드는 여전히 함께 필요하고 `sha256`은 **파생본이 아닌 원본 전체 바이트**의 해시다. `copy`만 제품 본문과 기록 해시의 일치를 요구하며, `excerpt`·`derived`는 원문 snapshot과 구간·제외·재작성 기록을 독립 대조한다. 실제 원문 확인일과 이번 검증일·반입일을 구분하고 기존 JS 반입 자료의 `profile/` 계보를 현재 HTML 계보로 덮어쓰지 않는다.

기존 HTML 5교안에는 보관 표시만 추가한다. 새 교안은 같은 `courseId: html` 배열의 `order: 6`부터 연속 추가하고 안정 ID를 새로 부여한다. 활성 목록에서 읽기 위치를 다시 계산할 뿐 내부 순서나 기존 ID를 재사용하지 않는다. 신규 문서의 완료 ID는 사용자가 직접 표시하기 전까지 없다.

기존 객관식·Quest·Web Project JSON과 문항 ID·`lessonId`·`conceptId`·내용·진행 서명은 그대로 유지한다. 신규 문서의 CTA는 위 개념 발췌 역관계에서 **실제 존재하는** 문항의 기존 `#/review/<language>/<lessonId>?concept=<conceptId>` 범위로 연결한다. 연결이 없는 문서는 빈 풀이를 시작하지 않는다. 복귀 검증은 기존 소유 교안과 명시된 상세 문서 중 실제 매핑된 대상만 허용하며 토큰·문항·세션 검증을 생략하지 않는다.

### CSS 파생 교안의 전환 계약

`[확정 결정]` [CSS 전환](designs/lesson-review.md#css-개념-문서-전환)은 위 HTML 데이터 계약을 새 스키마·저장 키 없이 재사용한다. 기존 CSS 6교안에는 `archivedFromCatalog: true`만 추가하고 ID·slug·`order`·본문·기존 문항/실습 관계를 유지한다. 새 문서는 같은 `courseId/languageId: css`에서 `order: 7`부터 추가하며 `id: css-notes-<키>`, `slug: wiki-<키>`, `contentFile: content/lessons/css/wiki-<키>.md`, `answerHeading: 핵심 질문 답`을 사용한다.

`source.originalPath`는 실제 밤위키 CSS 원문 상대 경로, `sha256`은 해당 원본 전체 바이트, `importMode`는 `derived`다. 새 CSS `reviewConcept`는 기존 문항 소유 `lessonId`를 보존하고 검증된 새 상세 문서를 `documentLessonId`로 연결한다. 원문 구간·최종 ID·실제 heading/발췌·문항 매핑과 검증 상태는 [CSS 작업 카드](work-items/2026-09-13-css-concept-lessons.md)에 둔다. 기존 CSS 본문을 이 원문의 반입본이라고 표시하거나 기존 완료·시도를 새 ID로 복사하지 않는다. 기존 문항 계약도 유지하되 `quiz-css-flex-axis.code`의 `writing-mode: horizontal-tb;` 한 줄 보완만 허용한다. 코드 서명 변경은 기존 진행 세션의 콘텐츠 변경 안전 처리에 맡기며 서명을 억지로 유지하거나 저장 키를 이관하지 않는다.

### JavaScript·Java 파생 교안과 공유 상세 문서

`[확정 결정]` [JS·Java 전환](designs/lesson-review.md#javascriptjava-개념-문서와-객관식-전환)은 기존 `derived`·보관·직접답 metadata와 정적 JSON 형식을 재사용한다. 공유 상세 문서·검증된 키워드 범위와 보관 처리는 현재 코드·JSON에 반영됐다. 최종 단위/문항 매핑·수량·독립 단계 판정은 [작업 카드](work-items/2026-09-14-js-java-concepts-and-review.md)가 담당한다.

- 새 ID는 `js-concept-<key>`·`java-concept-<key>`, slug는 `wiki-<key>`, 파일은 각각 `content/lessons/javascript/`·`content/lessons/java/` 아래다. 기존 order를 유지하고 JS 8부터, Java 2부터 연속 추가한다. 새 단위의 `answerHeading`은 실제 `핵심 질문 답` 절을 가리킨다.
- 기존 JS runtime은 ID·본문·활성을 유지하며 `answerHeading` 없이 기존 면접 답변 형식도 보존했다. 모든 기존 교안의 직접답 UI를 일괄 전환한 것으로 해석하지 않는다. 나머지 기존 JS·Java 교안에는 보관 표시만 추가한다. 기존 source·ID·slug·본문·완료·문항 소유 관계를 새 파생으로 덮어쓰지 않는다.
- 원문은 `wiki/학습자료/밤데브 학습문서/03 JavaScript/`·`04 Java/` 아래 실제 상대 경로이며 `importMode: derived`·원본 전체 SHA와 재구성 구간을 기록한다. 기존 source 날짜를 새 검증 PASS로 쓰지 않고 원문 기록일·이번 확인/반입일을 구분한다. 원본 경로 안전 검사와 `copy` 해시 계약은 유지한다.
- 공유 상세 문서는 **같은 `courseId`이거나**, 두 과정 모두 `categoryId: language`이고 같은 `languageId`일 때만 허용한다. 두 교안의 언어·concept 선언, 실제 문항의 `lessonId`·언어·concept, 실제 `heading`·발췌와 교안 존재 조건을 계속 검사한다. 알고리즘과 언어 과정 사이의 공유는 같은 실행 언어라도 허용하지 않는다.
- 목록/문서 CTA는 언어 내 해당 concept 문항 전부의 매핑이 같은 상세 문서·주제로 귀결될 때만 한 카드로 합치고 기존 v1 `lessonId: null` 언어+concept 선택을 사용한다. 조건이 성립하지 않으면 기존 소유별 묶음을 유지한다. 기존 소유 교안 URL·route 검증·문서 복귀 토큰 검사를 완화하지 않는다.
- 기존 JS 27개·Java 1개 문항 객체는 그대로 두고 새 객체만 해당 언어 컬렉션에 추가한다. 기존 문항 ID·진도 키는 유지하지만 범위의 문항 집합 변경은 활성 세션의 콘텐츠 서명을 바꿀 수 있으며 기존 변경 감지·안내 계약을 따른다. 문항 객체 보존을 모든 범위의 세션 서명 불변으로 주장하지 않는다.
- Java 언어·과정의 `status`는 현재 `available`이다. 이 값은 정적 학습문서·객관식 제공 상태이며 Java runner·코딩테스트·Spring·설치형 release 준비를 나타내지 않는다. 콘텐츠 검사는 Code Quest 필수 제공을 available인 JavaScript·HTML·CSS로 한정하고, 앱의 초기 Quest 로드·해시 진입·실제 열기도 같은 조건을 사용한다. 미제공 Java Quest는 기존 기본 JavaScript 교안으로 복귀한다. 별도 스키마 버전·저장 키·실행 의존성은 추가하지 않았다.

### CSS 객관식과 Spring 정적 콘텐츠

`[확정 결정]` [CSS·Spring 확장](designs/lesson-review.md#css-객관식과-springspring-boot-기초-확장)은 기존 schemaVersion 1·진도 키·route를 재사용한다. 이 계약을 콘텐츠와 검사·표시에 반영했다. 실제 ID·단위·출처·독립 검증 상태는 [작업 카드](work-items/2026-09-14-css-quiz-spring-foundations.md)에 둔다.

- CSS는 기존 `content/quizzes/css.json`에 새 문항만 추가한다. 기존 문항 객체·소유 교안은 유지하고 필요한 새 `reviewConcept`를 추가한다. 새 CSS 문항은 기존 교안의 conceptIds에 모두 연결되어 기존 교안 metadata를 수정하지 않았다. 기존 CSS 본문과 출처는 이번 작업의 시작 기준 그대로 보존한다.
- Spring은 `category.id: spring`, `course.id/categoryId: spring`, `course.languageId: java`, `course.name: Spring · Spring Boot`, `accent: java`를 사용한다. 실행 언어 `spring`이나 별도 Spring 퀴즈 컬렉션을 만들지 않는다. 과정의 `available`은 정적 문서·객관식 제공만 뜻한다.
- Spring 교안은 `id: spring-<key>`, `slug: <key>`, `contentFile: content/lessons/spring/<key>.md`, 과정 안의 연속 `order: 1`부터 추가한다. `conceptIds`는 `spring.*`, `answerHeading`은 실제 `핵심 질문 답` 절이다. 문서 URL은 `#/learn/spring/<slug>`다.
- 새 Spring 문항은 `quiz-java-spring-<key>-...` ID로 `content/quizzes/java.json`에 추가하고 `lessonId`는 새 Spring 교안을 가리킨다. 기존 Java 문항 객체는 보존한다. 새 문항의 `learningObjective`·네 보기의 정오와 이유·개념 연결을 검사하며 문제 URL은 기존 `#/review/java/<lessonId>?concept=<conceptId>`를 사용한다. Java 언어 전체 범위와 Java/Spring 주제별 범위는 서로 다른 선택이다.
- 같은 Java 언어라는 이유로 Spring과 Java 언어 과정의 상세 문서를 공유하지 않는다. Spring은 별도 카테고리이므로 기존 공유 조건 중 같은 과정 조건만 사용한다. 실제 같은 Spring 문서의 heading·원문 발췌를 연결하며 학습 문서 관리자가 교육 문장을 새로 만들지 않는다.
- Spring `source.kind`는 기존 허용값 `bam-authored`, `verifiedAt`은 공식 자료를 실제 확인한 날짜다. 이 값은 프로젝트의 새 작성 콘텐츠 분류이며 사용자의 직접 집필을 주장하지 않는다. 본문과 카드에 승인된 에이전트 새 저작·공식 URL·확인일을 기록한다. 대응하는 밤위키 원문이 없으므로 `originalPath`·`sha256`·`importedAt`·`importMode`는 만들지 않는다.

새 ID는 기존 완료나 시도를 상속하지 않는다. 기존 문항을 보존해도 추가 문항을 포함하는 활성 범위의 콘텐츠 서명은 바뀔 수 있으며, v1의 변경 감지·새 시작 안내를 유지한다. 빌드·Java/Spring 실행 의존성이나 새 스키마 버전은 추가하지 않는다.

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
| `learningObjective` | 선택 필드. 이번 신규 문항과 반입 교안(`source.originalPath` 존재)에 연결된 문항에는 필수인 관찰 가능한 학습 목표. 기존 문항은 교안 `objectives[0]`을 표시용 fallback으로 사용 |
| `difficulty` | `basic` 또는 `application` |
| `prompt` | 문제 본문 |
| `code` | 선택적 코드·마크업 예시 문자열 |
| `options` | 정확히 4개의 선택지 |

각 선택지는 `a`~`d` ID, 문구, `isCorrect` boolean, 개별 `feedback`을 가집니다. 문항마다 정답은 정확히 하나여야 하며 오답을 포함한 네 선택지 모두에 이유가 있어야 합니다. `npm run validate:content`는 저장소의 모든 객관식 JSON을 JSON Schema와 런타임 계약으로 검사하고 파일명·언어·교안·개념 참조와 전역 문항 ID 중복을 확인합니다. JavaScript 기초 과정의 난이도 분포와 기존 확인 문제 중복은 별도 콘텐츠 테스트로 한 번 더 검증합니다.

## R1 개념 발췌와 진행 세션 계약

`[확정 결정]` 아래는 [R1 첫 사용 범위](designs/lesson-review.md#r1-첫-사용-구현-계약)의 구현 계약이다. 현재 코드·발췌 파일에 적용돼 있으며, 실제 콘텐츠·실행·통합 검증 범위는 [첫 사용 작업 카드](work-items/2026-09-12-independent-review-first-use.md#독립-검증과-실행-증거)에 기록한다. 아래 전체 목표의 `conceptRefs`·문항 revision·시도 이력 이관을 R1에서 구현하지 않는다. 현재 보기·채점 선택은 아래 [v1 확장](#보기채점-방식의-v1-확장)만 추가했다.

### 개념 발췌 파일

`content/review-concepts.json`은 `{ schemaVersion: 1, concepts: [...] }` 형식이며 각 개념 항목은 다음 다섯 필드를 가진다. 이 버전은 객관식 컬렉션 v1과 별개의 파일 계약이다. 이 표는 최초 JS 발췌 범위의 계약이며, 현재 추가된 HTML 발췌와 선택 `documentLessonId`는 [HTML 전환 계약](#html-파생-교안의-전환-계약)을 함께 따른다.

| 필드 | R1 계약 |
| --- | --- |
| `id` | 연결 문항과 기존 교안에 실제 선언된 `conceptId`. 중복 없는 기존 JS 개념 9개로 시작 |
| `title` | 사용자에게 표시할 개념 이름. 원문 제목·키워드를 활용하는 탐색 label이며 `조건문·반복문`처럼 기존 단어를 조합할 수 있음. 새 교육 설명은 만들지 않음 |
| `lessonId` | 발췌 원문이자 상세 문서로 열 실제 교안 ID |
| `heading` | 해당 교안에 실제 존재하는 heading 텍스트. 링크 이동 시 허용된 문서의 heading과 대조 |
| `excerpt` | 이미 반입·승인된 기존 JS 교안 본문에서 그대로 가져온 발췌. 새 문장·예제·정답 생성이나 의미를 바꾸는 요약 없음 |

관리자는 발췌 구간·원문 대조·출처·ID·문서 연결을 [발췌 접수 기록](content-reviews/2026-09-12-review-excerpts.md)에 남긴다. UI 데이터에 개인 보관함 경로·비공개 기록을 넣지 않는다. 13개 기존 문항의 단일 `conceptId` 연결은 그대로 두며 복합문항으로 재분류하지 않는다. 발췌가 없는 다른 기존 문항·문서는 지우지 않고 단원 카드로 접근하며 오버레이에 `lesson.summary`를 **관련 학습문서 요약**으로 표시한다. 이를 검증된 개념 발췌로 표시하지 않는다. 런타임은 필수 문자열·교안 개념 참조·교안/개념 쌍 중복을 검사하고, 원문·실제 heading 일치는 독립 콘텐츠 검토와 `tests/review-concepts.test.js`가 확인한다. 객관식 v1 스키마 자체를 확장하지 않았다.

### 진행 세션

새 물리 키 `bam.dev.review-session.v1`은 별도 review-session 저장소 인터페이스 뒤에서 **활성 세션 하나**를 보존한다. 기존 `bam.dev.progress.v1`의 완료 시도·오답·다른 제품 진도는 변경하거나 초기화하지 않는다. R1 진행 중 상태와 기존 결과까지 완료한 시도 저장은 서로 다른 역할이다.

| 활성 세션 값 | R1 계약 |
| --- | --- |
| `id`·`questionIds`·`mode` | 내부 세션 ID와 시작 범위의 순서 있는 고유 문항 ID. 기존 전체 범위 `all` 또는 저장된 오답 `incorrect` 모드. 임의 외부 URL은 복귀 대상으로 받지 않음 |
| `contentSignature` | 선택 언어·단원·키워드 범위 문항 배열 전체의 `JSON.stringify` 값. 순서·본문·보기·정답·해설이 다르면 복구를 중단하고 현재 문제로 새 시작을 안내. 암호학적 서명이나 문항 revision·이전 버전 보관 기능은 아님 |
| `selectedOptionIds`·`gradedQuestionIds`·`currentIndex`·`screen`·`expandedQuestionIds` | 선택은 문항/보기 ID 쌍, 채점·펼침은 문항 ID 배열로 저장. 복구 시 유효한 보기·채점 상태와 현재 위치·문제/결과 화면을 재구성. 존재하지 않는 ID·선택·범위 밖 index는 유효 세션으로 처리하지 않음 |
| `scope` | 기존 언어·단원과 선택적 키워드 범위. route 변경이나 복구 시 검증된 ID로 해석 |
| `recordAttempted`·`persistenceStatus` | 결과까지 완료한 기존 시도 저장 요청 여부와 결과 저장 상태. 문서 왕복·새로고침이 동일 완료 시도를 다시 추가하지 않게 함 |
| `completedAt`·`recordedAnswers` | 기존 최근 완료 결과를 열었을 때 그 완료일과 문항별 기존 정오를 유지. 이미 기록된 점수를 현재 정답으로 소급 변경하는 기능이 아님 |
| `returnContext` | 문제에서 문서로 이동할 때 생성하는 `token`·`sessionId`·`lessonId`·`questionId`. 문서 URL의 토큰, 저장된 세션·대상 문서·실제 문항 연결과 복구 가능한 콘텐츠가 일치할 때만 복귀 허용 |
| `viewport` | `anchor`·카드의 `offset`·`scrollY`·`focusId`. 해당 카드 위치와 초점을 복구하며 대상이 없으면 관련 개념 버튼 또는 문제/결과 제목으로 이동 |

같은 origin·브라우저 프로필에서 선택·채점·탐색·문서 이동에 필요한 변경을 저장하고 새로고침·재실행으로 복구한다. 저장 차단·내용 손상·서명 불일치·누락 문항은 저장 성공이나 0점 완료로 위장하지 않고 안내하며 기존 완료 기록을 보존한다. 저장 직전에 마지막 읽은 값과 현재 값을 비교하고 `storage` 변경을 감지하면 오래된 탭의 쓰기를 거부해 저장된 풀이를 불러오도록 안내한다. Web Storage의 읽기·쓰기 사이를 트랜잭션으로 묶지 않으므로 완전히 동시인 쓰기의 원자성까지 보장하지 않는다. 상세 자동 검증과 실제 브라우저 검증의 구분은 작업 카드에 남긴다. 생애 최초·재도전 이벤트 ledger·모름·헷갈림은 이 키에 추측해 추가하지 않는다. 보기·채점 방식은 아래 제한된 v1 확장만 적용한다.

### 보기·채점 방식의 v1 확장

`[확정 결정]` [보기·채점 첫 확장](designs/lesson-review.md#보기-방식과-채점-방식의-첫-확장)은 기존 물리 키·`schemaVersion: 1`·활성 세션 하나를 유지한다. 선택적 `viewMode: single | all`과 `gradingMode: individual | batch`만 더하며 누락·낯선 값은 각각 `single`·`individual`로 복구한다. 기존 `mode: all | incorrect`는 문항 범위로 그대로 보존한다. 콘텐츠·문항 revision·제출 이벤트 스키마를 확장하지 않는다.

방식 변경은 세션 ID와 `questionIds`, `selectedOptionIds`, `gradedQuestionIds`, `expandedQuestionIds`, 기존 완료 기록을 유지하며 `currentIndex`는 실제 동작 카드에 맞춘다. 선택과 채점은 기존 문항/보기 ID로 구별한다. 전체 채점은 선택된 미채점 문항만 기존 채점 함수로 평가하고 미응답·기채점 문항은 건너뛴다. 모든 문항을 채점한 뒤 사용자가 결과 보기를 선택할 때까지 완료 시도를 저장하지 않는다. 결과 표시 시 `recordAttempted`를 포함한 기존 결과 저장·복구 계약을 유지한다.

`returnContext`와 `viewport`는 전부 보기의 실제 문항 카드도 가리킬 수 있다. 문서 왕복·새로고침에서 방식·위치·초점을 복구한다. 새 DOM ID는 두 보기에서 같은 문항 ID 접미사를 사용하고 구버전 `focusId`가 없으면 현재 카드의 동일 역할 조작 또는 제목으로 이동한다. 기존 토큰·문항·문서·콘텐츠 서명 검증은 완화하지 않는다. 저장 장애와 탭 충돌의 한계도 기존과 같다. 자동 기대값, 데스크톱 사용 검증과 최종 gate의 실제 결과는 [작업 카드](work-items/2026-09-14-review-display-and-grading.md)에 기록한다.

### 즉시 재도전과 첫 오답의 v1 확장

`[확정 결정]` [오답 즉시 재도전](designs/lesson-review.md#오답-문항의-즉시-재도전)은 기존 두 v1 저장 키와 콘텐츠 스키마를 유지하고 아래 선택 필드만 추가한다. `[현재 사실]` 활성 세션 복구·완료 입력 정규화·결과 재진입에 아래 필드를 반영했고 독립 focused 14/14와 대표 데스크톱 저장 왕복을 통과했다. [검증 증거](designs/lesson-review.md#오답-즉시-재도전의-검증-증거)와 최종 통합은 구분하며 생애 최초·전체 제출 원장 제안을 구현한 것으로 보지 않는다.

- 활성 세션의 `firstAttemptByQuestion`은 메모리에서 문항 ID별 Map, 저장할 때 `[questionId, { selectedOptionId, isCorrect }]` 쌍 배열이다. 문항의 첫 재도전 직전 현재 오답을 한 번만 넣으며 후속 재도전에도 유지한다. 새 세션에서는 비운다. 현재 선택·채점은 기존 필드가 담당한다.
- 완료 시도 `attempts[].answers[]`에는 같은 두 값을 가진 선택적 `firstAttempt` 객체를 보존한다. `recordQuizAttempt` 입력 정규화·기존 완료 읽기·결과 재진입·활성 결과 저장/복구까지 같은 객체를 유지한다. 현재 답의 `isCorrect`로 기존 점수·오답 ID를 계산하며 첫 오답은 이를 덮어쓰지 않는다. 기존 최근 완료 20개 보관 계약은 유지한다.
- 활성 세션 필드 누락은 빈 Map, 완료 답의 객체 누락은 첫 응답 정보 없음이다. 구기록에 필드를 일괄 생성하거나 과거 첫 응답을 추정하지 않는다. 필드가 있으면 쌍 배열·중복 문항·세션 범위·실제 보기 ID와 boolean을 검사하며 첫 오답의 `isCorrect`는 `false`여야 한다. 완료 기록은 기존 ID 형식 검사와 선택 객체의 형태를 검사하고 저장 당시 정오를 현재 콘텐츠로 다시 판정하지 않는다. 잘못된 추가 필드를 유효한 첫 응답으로 표시하지 않고 기존 손상 데이터 정책으로 처리한다.
- 완료 기록 재진입은 저장된 `firstAttempt`를 Map으로 옮겨 결과에 표시하며 재도전 버튼을 열지 않는다. 활성 세션의 기존 `contentSignature`, 완료 표시·중복 방지와 유효 복귀 검사는 완화하지 않는다. 첫 재도전의 저장 실패에서는 새 첫 오답 캡처와 대상 초기화를 함께 취소한다.

## 독립 학습문서·객관식 목표 계약

`[제안]` 아래는 [독립 학습문서·객관식 설계](designs/lesson-review.md)의 **목표 데이터 계약**이다. 현재 객관식 v1 JSON·validator에 구현된 필드가 아니며 후속 스키마 버전·구체 파일 배치는 해당 기능 시작 시 이관 검사와 함께 확정한다. 콘텐츠는 정적 읽기 전용 데이터, 풀이 기록과 활성 세션은 저장소 뒤의 사용자 데이터로 분리한다. 현재 R1의 별도 활성 세션 키와 기존 `ProgressRepository` 완료 기록은 위 계약을 따른다. 홈의 학습문서·객관식 서비스는 독립 목록을 가지며 같은 개념·문서 ID를 참조한다.

### 키워드와 문항

| 개체·필드 후보 | 계약 제안 |
| --- | --- |
| 개념 `id` | 기존 안정 `conceptId`를 키워드의 ID로 재사용. 제목·파일명·개인 노트 경로로 새 ID를 추론하지 않음 |
| 개념 `title`, `summary` | 사용자용 이름과 오버레이의 짧은 설명. bam 교안의 승인된 발췌·요약을 별도 콘텐츠 검증으로 접수 |
| 개념 `lessonRefs` | 검증된 `{ lessonId, anchor }` 배열. 문서 경로는 콘텐츠 ID로 해석하고 anchor 존재를 검사 |
| 개념 `revision`, `verificationRefs` | 요약의 버전과 출처·검증 기록 연결. 목록·계획만 존재하는 개념을 검증된 학습 본문으로 취급하지 않음 |
| 문항 `id`, `revision` | 기존 문항 ID 보존, 문구 변경도 추적할 콘텐츠 버전. 평가 의미 변경 여부는 변경 기록으로 별도 관리 |
| 문항 `conceptRefs` | `{ lessonId, conceptId }` 배열. 모든 교안·개념 연결이 실제로 존재해야 하며 중복 conceptId를 제거. 같은 개념의 추가 문서는 개념 `lessonRefs`로 연결 |
| 문항 `learningObjective` | 관찰 가능한 학습 목표. 기존 규칙의 신규·반입 문항 필수 조건 유지 |
| 문항 `kind`, `difficulty` | `kind` 후보는 `concept`, `code-reading`, `application`. 단일/복합 개념 여부·행동 유형·난이도는 독립. 현재 `difficulty: application`을 자동으로 행동 유형에 복사하지 않음 |
| 문항 `prompt`, `code`, `conditions` | 본문, 필요한 타입 선언·관련 코드, 입력·조건·버전·실행 환경. 기존 `code` 유지; 모든 문항에 불필요한 런타임 조건을 강제하지 않음 |
| 문항 `options` | 기존 네 선택지의 안정 ID·문구·단일 정답·보기별 `feedback` 보존. 정답·선택 오답 우선 표시는 UI 책임 |
| 문항 `provenance`, `verificationRefs` | 근거 자료 ID·revision·공식 출처·검증일·적용 버전·실제 실행 증거 또는 해당 없음 근거 연결. 개인 비공개 기록·디자인 자산 제외 |

단일/복합은 중복 없는 `conceptRefs`의 **고유 conceptId 수**로 판정한다. 한 개념이 문서 둘에 설명되어 있다는 이유만으로 복합문항이 되지 않는다. 단일 노트에서 여러 문제, 여러 노트에서 한 문제 모두 가능하다. 키워드 선택은 해당 conceptId를 참조하는 문항을 포함하고 문항 ID를 중복 집계하지 않는다. 현재 언어별 컬렉션을 유지하는 가장 작은 이관부터 시작하며 언어를 가로지르는 복합문항 컬렉션은 이 첫 설계의 구현 전제로 만들지 않는다.

출처의 반입 당시 `originalPath`·`sha256`은 역사적 증거로 보존한다. 현재 validator의 `profile/` 제한과 이동된 `wiki/학습자료/` 경로 차이는 **반입 전에 해결할 이관 gate**다. 제작용 출처 기록에는 원본 자료 ID·당시 경로·현재 위치·반입 revision·해시를 연결하고, 제품에는 허용된 출처 제목·공식 URL·검증일만 노출하는 방향을 제안한다. 개인 보관함 경로를 제품 route나 필수 런타임 경로로 사용하지 않는다. YAML 추가처럼 원문 바이트만 달라졌어도 해시를 재사용하지 않으며 기존 반입 해시를 현재 원문 해시로 덮어쓰지 않는다.

### 풀이 기록과 세션 계약 제안

| 개체 | 필요한 값과 불변식 |
| --- | --- |
| 제출 시도 | `id`/`submissionId`, `questionId`, `questionRevision`, `response: option 또는 unknown`, `selectedOptionId`(모름이면 null), `outcome: correct / incorrect / unknown`, `confusedAtSubmission`, `aidViewed`, `submittedAt`, 선택적 `previousAttemptId`. 제출 당시 내용을 보존하고 재도전으로 수정하지 않음 |
| 현재 문항 표시 | `questionId`별 현재 헷갈림 토글. 제출 이후 변경해도 과거 시도의 `confusedAtSubmission`은 보존 |
| 활성 세션 | 하나의 `sessionId`, 저장 버전, 시작 범위의 순서 있는 고유 `{ questionId, revision }` 목록, 과정·키워드·필터 snapshot, 보기 모드, 채점 방식, 현재 문항, 각 문항의 선택 중인 보기/모름·currentAttempt 참조·채점/해설 펼침·학습 지원 열람 상태 |
| 복귀 문맥 | 내부 복귀 토큰, 세션·문항 ID, 문서 ID·anchor, 카드 스크롤 기준·offset와 돌아올 초점. 문제 경유 동작에서만 생성하고 세션·문항 존재를 확인 |
| 집계 | 활성 세션 고유 문항 N, 현재 제출 결과가 있는 고유 문항 A(모름 포함), 정답 C. `A/N`, `C/A`, `C/N`을 목적별 표시하고 재도전 이벤트 수를 분모로 쓰지 않음 |

미응답은 시도를 만들지 않고 초안 선택도 제출 기록이 아니다. ‘모르겠어요’를 선택한 뒤 채점하면 명시적 `unknown` 시도로 저장한다. 즉시 재도전은 활성 세션과 다른 문항 상태를 유지하며 해당 문항의 새 초안을 열고 현재 결과 참조를 비운다. 그동안 해당 문항은 현재 회차 집계에서 미제출이고 이전 결과는 과거 기록에 남는다. 새 제출은 `previousAttemptId`로 이어지며 해당 문항의 현재 결과 참조만 갱신한다. 새 범위 시작은 이 동작과 구분한다.

보기 모드·채점 방식 전환은 초안·채점·해설을 보존하며 시도를 추가하지 않는다. 전체 채점은 아직 채점하지 않았고 보기 또는 모름을 명시 선택한 문항만 제출한다. 이미 채점한 카드는 제외하고 미응답은 그대로 남겨 ‘답한 n개 채점, 미응답 m개 남음’으로 알린다. 채점 시도 추가와 활성 세션의 결과 참조 갱신은 한 저장 갱신으로 처리하거나 안정된 `submissionId`로 복구 시 중복을 제거한다. 저장 실패·브라우저 재로딩·다중 탭을 실제 검증하지 않은 채 원자적 보장 완료로 표현하지 않는다.

현재·최초·최근 결과, 보조 필터 논리, 재도전·분모·오류 교정의 사용자 의미는 [풀이 기록과 집계](designs/lesson-review.md#풀이-기록과-집계)가 정본이다. 자세한 시도 보관량과 오류 교정 정책은 [로드맵](roadmap.md#bam-결정-대기-목록)의 미결정으로 유지한다. 보관량 제한으로 사라진 최초 시도를 새로 추정하지 않는다.

### 기존 v1과의 이관

1. 기존 객관식 컬렉션·교안·문항·개념 ID와 깊은 URL을 유지한다. 읽기 adapter에서 v1의 `{ lessonId, conceptId }`를 단일 `conceptRefs`로 바꾸는 방향으로 시작한다. 기존 파일에 목표 필드를 먼저 추가하지 않는다.
2. 기존 완료 시도와 오답 ID는 보존한다. 과거 기록에 없는 문항 revision·최초 시도·헷갈림·학습 지원 사용은 `unknown/기록 없음`으로 둔다. 과거 정답을 현재 revision의 정답 완료로 자동 승격하지 않는다.
3. 기존 `bam.dev.progress.v1`의 다른 제품 배열을 수정·초기화하지 않는다. 새 저장 형식의 읽기·쓰기를 분리하고 실제 legacy snapshot으로 보존·실패·되돌림을 검증한 뒤 전환한다. 저장소 인터페이스를 우회해 화면에서 직접 저장하지 않는다.
4. 문항 버전이 바뀌어도 과거 점수·정오답은 보존한다. 구버전 콘텐츠가 있으면 당시 근거를 연결하고, 없으면 현재 해설을 당시 해설처럼 대체하지 않는다. 현재 버전 재도전은 사용자 선택이다.
5. 구현 gate에는 새 필드·참조·고유 ID·revision 계약, 미응답/모름 구분, 제출 중복 방지, 고정 범위 집계, 문서 유입별 복귀·리로드, 저장 장애와 다른 기능 진도 보존을 포함한다.

## Code Quest 컬렉션

`content/quests/<languageId>.json`은 학습한 개념을 언어의 실제 작성 단위로 구현하는 문제를 정의합니다. 공통 메타데이터는 `schemaVersion`, 실행 DTO와 맞추는 `contractVersion`, `languageId`, 화면 제목과 `quests` 배열입니다. HTML·CSS 컬렉션은 평가기를 고르는 `evaluationKind`도 가집니다. JavaScript 함수 계약은 `content/schema/code-quest.schema.json`, HTML·CSS 직접 소스 계약은 `content/schema/web-code-quest.schema.json`을 따릅니다.

| 공통 필드 | 의미 |
| --- | --- |
| `evaluationKind` | HTML은 `html-dom-v1`, CSS는 `css-style-v1`. 기존 JavaScript 컬렉션은 생략하고 함수 실행기로 라우팅 |
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

### HTML·CSS 직접 소스 Quest

HTML·CSS Quest는 함수를 선언하지 않습니다. `instructions`, 문자열 배열 `requirements`, 실제 HTML 또는 CSS 문자열과 설명으로 구성된 `examples`, assertion 기반 `publicTests`를 사용합니다. 학습자 소스는 UTF-8 20 KiB 이하여야 합니다.

| 구분 | 추가 필드·공개 assertion |
| --- | --- |
| HTML `html-dom-v1` | 직접 마크업. `doctype-present`, `selector-exists`, `selector-count`, `attribute-equals`, `text-includes`, `nonblank-attribute-count`, `direct-child-text-equals` |
| CSS `css-style-v1` | 최대 32 KiB의 고정 `fixtureHtml`과 직접 스타일시트. `rule-declaration`, `media-rule-declaration`, `computed-style`, `computed-focus-style`, `computed-grid-column-count` |

HTML doctype은 source 첫 선언과 문서 파서 결과를 함께 확인하고, 나머지 구조는 inert template DOM에서 검사합니다. CSS 선언과 최상위 미디어 조건 assertion은 정확한 규칙 안의 최종 같은-selector 선언을 CSSOM에서 확인하고, 서로 다른 selector의 우선순위까지 적용된 최종 결과는 `computed-style`로 구분합니다. `computed-focus-style`은 실제 `:focus-visible` 상태를 활성화한 뒤 최종 계산값을 읽습니다. 계산 스타일은 안전 검사를 통과한 고정 fixture를 one-shot sandbox iframe에 넣어 검사합니다. `fixtureHtml`은 콘텐츠 계약의 일부이며 학습자가 수정하거나 실행 요청에서 교체할 수 없습니다.

HTML·CSS의 시작 코드·예시·fixture·학습자 소스는 평가 전에 공통 preflight를 통과해야 합니다. HTML은 비정상·미종료 주석, 실행 요소, 이벤트 속성, 문자 참조 우회를 포함한 meta refresh, `ping` 등 외부 리소스와 탐색을 시작할 수 있는 속성을 거부하며 `href`는 같은 문서의 `#fragment`만 허용합니다. CSS는 `@import`, `url()`, 외부 URL과 레거시 실행 구문을 거부합니다. 상세 경계와 한계는 [ADR 0003](decisions/0003-inert-web-code-quest-evaluation.md)에 기록합니다.

Quest 순서, ID·slug·공개 테스트 ID의 전역 고유성, 교안·개념 참조, 평가 종류와 언어의 일치, `failureExplanations`의 1:1 대응, 힌트 단계 순서는 `npm run validate:content`와 전용 콘텐츠 테스트로 검증합니다. 브라우저에 포함되는 모든 assertion과 기대값은 공개 테스트이며, 학습자 결과에는 이 테스트만 사용합니다. 비공개·숨김 테스트나 원격 추가 채점은 사용하지 않습니다. 현재 수량은 프로젝트 [`README.md`](../README.md), 전체 작성 규칙은 [Code Quest 작성 가이드](code-quest-authoring.md)를 따릅니다.

## 코딩테스트 컬렉션

`content/coding-tests/<languageId>.json`은 목록 검색·필터와 제출 채점에 사용하는 문제를 정의합니다. `content/schema/coding-test.schema.json`과 런타임 검증을 함께 적용합니다.

`[현재 사실]` 아래 계약은 현재 구현된 JavaScript 코딩테스트 형식이다. Java 코딩테스트 JSON·schema·runner·fixture는 아직 없으며 이 표를 Java 지원이 구현됐다는 근거로 사용하지 않는다.

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
| `publicTests` | 제출 시 모두 실행하는 브라우저 포함 공개 테스트 |
| `runTestIds` | 빠른 실행에 쓰는 `publicTests`의 부분집합 |
| `failureExplanations` | 각 공개 테스트에 정확히 하나씩 대응하는 확인 지점 |

`테스트 실행`은 `runTestIds`가 가리키는 사례만, `제출 및 채점`은 `publicTests` 전체를 실행합니다. 둘 다 같은 브라우저 공개 데이터이고 이것이 학습자 결과에 쓰이는 전체 집합입니다. 비공개·숨김 테스트나 원격 추가 채점은 사용하지 않습니다. 기준 풀이, 공개 테스트와 중복되지 않는 독립 사례, 대표 오답은 `tests/coding-test-content.test.js`에서 실제 JavaScript 런타임으로 검증합니다. 이 개발 fixture는 설치본의 학습자 답안에는 실행하지 않고 결과·완료에 영향을 주지 않습니다.

`[확정 결정]` `DEC-JAVA-CODING-TEST-01`에 따라 Java 코딩테스트 계약을 별도 언어 컬렉션으로 추가하는 것은 MVP 목표다. 안정 ID·revision·교안·개념 연결, `publicTests`만 완료에 사용하는 원칙과 Code Quest와의 분리는 유지한다. 승인된 Java 교안·개념 ID는 현재 커리큘럼에 존재한다. `DEC-MVP-01`이 실제 Java 코딩테스트 문제 묶음과 근거 연결을 정하기 전에 미승인 코딩테스트 문제 ID·근거 연결·실행 계약을 지어내지 않는다. Java 학습자 소스·공개 테스트 계약은 `DEC-JAVA-VERSION-02`에 따라 정식 Java 25 언어·표준 API와 preview 금지를 전제로 한다. Java의 소스 단위, 진입점, 인수·반환 직렬화, 컴파일·호출 결과와 오류 DTO도 현재 JavaScript `functionContract`를 그대로 복사하지 않는다. 실제 schemaVersion과 필드는 승인된 문제 묶음, `DEC-JAVA-RUNNER-01`, 별도 격리 ADR과 prototype 증거가 정해진 뒤 스키마 변경으로 제안한다.

## Web Project 컬렉션

`content/web-projects/index.json`은 HTML·CSS를 함께 작성하는 작은 프로젝트를 정의합니다. `content/schema/web-project.schema.json`과 런타임 계약을 함께 적용하며, 프로젝트는 `web-project-` 안정 ID, URL용 `slug`, `revision`, 연속된 `order`와 실제 교안·개념을 가리키는 `conceptRefs`를 가집니다.

v1 프로젝트는 `index.html`과 `styles.css` 두 파일만 사용합니다. 공개 자동 기준은 HTML DOM·CSSOM assertion과 실패 설명을 포함하고 합계가 정확히 70점이어야 합니다. 사람이 미리보기를 보고 판단해야 하는 기준은 세 단계 자가평가 scale로 분리하며 합계가 정확히 30점이어야 합니다. 자동 평가기 오류·취소·미실행은 0점으로 확정하지 않고, 자가평가가 끝나기 전에는 전체 임시 점수를 숫자로 표시하지 않습니다.

시작 코드·기준답안·대표오답·학습자 제출은 같은 HTML·CSS source preflight와 파일 크기 제한을 통과해야 합니다. Web Project HTML에는 `style` 요소와 `style` 속성을 허용하지 않아 CSS 계산 기준이 `styles.css` 제출만 평가하게 합니다. 브라우저에 포함되는 assertion은 모두 공개 기준이며, 자세한 파일·제출·점수 계약과 독립 검증 절차는 [Web Project 작성 가이드](web-project-authoring.md)를 따릅니다.

## 목표 계약과 현재 스키마의 관계

`[현재 사실]` 위 Code Quest, 코딩테스트와 Web Project 계약은 실제 코드·JSON Schema가 검증하는 현재 형식이다. 아래 목표 설계를 구현한 필드처럼 기존 JSON에 임의 추가하지 않는다.

### 분리된 Code Quest와 코딩테스트

`[확정 결정]` Code Quest와 코딩테스트는 별도 컬렉션·route·진도·완료율을 유지한다. 코딩테스트를 Code Quest 레코드로 정규화하거나 교차 기능 카탈로그를 만들지 않는다. 두 기능은 안정적인 `lessonId`·`conceptIds`로 교안과 연결하며 내부 실행기·결과 DTO만 재사용할 수 있다.

`[제안]` Code Quest UI에 필요한 값은 현재 Quest와 curriculum 관계에서 읽기 전용으로 계산한다. 정확한 저장 여부와 UI 표시는 `DEC-QUEST-CATALOG-01`에서 정한다.

- `courseId`: Quest의 `lessonId`가 속한 과정. 학습 순서·주제를 나타내는 과정과 예제·평가의 실행 언어를 구분한다.
- `topicId`: 검증된 교안·개념 관계로 묶는 Code Quest 전용 학습 주제. 제목·문제 문구에서 추론하지 않는다.
- `displayOrder`: Code Quest 과정·주제 안의 화면 표시·직접 이동 번호. 기존 `order`는 보존한다.

Quest의 기존 `id`, `revision`, `difficulty`, route와 진도는 보존한다. 현재 revision PASS, 이전 revision PASS와 revision을 알 수 없는 legacy 완료 ID를 구분하는 방식은 [`designs/code-quest.md`](designs/code-quest.md)와 `DEC-QUEST-CATALOG-01`에서 결정한다. 코딩테스트는 현재 `id`, revision, route와 별도 진도 계약을 그대로 사용하며 제품 흐름은 [`designs/coding-test.md`](designs/coding-test.md)가 담당한다.

### 외부 Git 웹과제

외부 과제의 목표 메타데이터는 현재 Web Project JSON과 다른 도메인이다. `assignmentId`, track, 선수 교안·Quest, 저장소 URL, 검증한 starter·solution ref와 commit, brief 경로, 순서 있는 요구사항·검증 명령을 연결한다. 정확한 schemaVersion과 파일 경로는 과제 저장소·branch 결정 후 확정하며, 그 전에는 현재 `content/web-projects/index.json`을 외부 과제 manifest로 재해석하지 않는다. 목표 계약은 [`designs/web-assignments.md`](designs/web-assignments.md)가 담당한다.
