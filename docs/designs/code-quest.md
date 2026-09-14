# Code Quest 제품 설계

이 문서는 교안에 연결된 Code Quest의 정보 구조, 학습 위치, 탐색·진도와 기존 기능의 단계적 UI 개선 정본이다. 코딩테스트는 별도 [`coding-test.md`](coding-test.md), 문제 저작은 [`../code-quest-authoring.md`](../code-quest-authoring.md), 학습 경험 판정은 [`../learning-content-design.md`](../learning-content-design.md), 전역 색상·상태 표현은 [`visual-design.md`](visual-design.md)가 담당한다. 결정 문구·이유·날짜는 [`DEC-QUEST-SEPARATE-01`과 `DEC-QUEST-UI-01`](../roadmap.md#2026-08-29-확정-제품-결정), [`DEC-LOCAL-EVALUATION-01`](../roadmap.md#2026-09-02-확정-제품-결정)이 정본이다.

## 결정 적용과 현재 상태

- `DEC-QUEST-SEPARATE-01` 적용: Code Quest는 코딩테스트와 별도 목적·route·콘텐츠·UI·진도를 유지한다. 코딩테스트를 `심화 Code Quest`로 투영하지 않는다.
- `DEC-QUEST-UI-01` 적용: 사용자가 만든 Code Quest의 과정·주제·진도·문제 탐색기·학습 지도 정보 구조를 BAM.dev의 콘텐츠·접근성 경계에 맞게 반영한다.
- `DEC-PUBLIC-EVALUATION-01` 적용: Quest 결과에 영향을 주는 모든 assertion·입력·기대 동작은 설치본에 포함되고 확인 가능해야 하며 비공개·숨김 사례를 추가 실행하지 않는다.
- `DEC-LOCAL-EVALUATION-01` 적용: 설치형 MVP의 JavaScript Quest는 공개 테스트마다 새 one-shot Worker를 사용한다. 코딩테스트와 내부 runner DTO·실행 추상화를 재사용할 수 있지만 Docker·Spring Boot·PostgreSQL·Nginx·계정·사용자 관리 수신 포트를 요구하지 않고 제품 경계를 합치지 않는다. Java Code Quest 실행은 별도 결정 전까지 이 계약에 포함하지 않는다.
- `[현재 사실]` Code Quest는 언어별 JSON·schema, `#/quest/<language>/<quest>` route, runner router와 Quest 전용 초안·실행·완료 진도를 사용한다.
- `[현재 사실]` `#/quest` 과정·주제 목록, 검색·상태 필터·과정 번호 이동, 이어서 풀기와 실제 교안·개념 관계 지도를 구현했다. 상세에는 과정→주제→현재 Quest, 진도·관련 교안과 같은 과정의 이전/다음 이동을 제공하고 홈·236px 서비스 사이드바에서 연결한다. 반환된 세 UI 결함을 수정하고 독립 focused·대표 데스크톱 검증 PASS를 받았다. 최종 독립 문서 재검·통합도 PASS이며 근거와 한계는 [작업 카드](../work-items/2026-09-14-code-quest-navigation.md)에서 구분한다.

설치형 앱 전환은 별도 결정이다. Code Quest를 개선해도 설치 프로그램이 되지 않으며, 설치·오프라인 경계는 [`local-application.md`](local-application.md)가 담당한다.

### 데스크톱 탐색 첫 구현 계약

`[확정 결정]` bam의 2026-09-14 구현 승인 범위는 기존 JavaScript·HTML·CSS Quest 내용을 보존한 데스크톱 웹 탐색 개선이다. 홈·서비스 사이드바에서 `#/quest` 목록으로 진입하고 과정→주제→현재 Quest, 검색·번호 이동·주제/상태 필터·이어서 풀기·다음 Quest·관련 문서·실제 관계 학습 지도를 제공한다. 기존 `#/quest/<language>/<quest>` URL은 그대로 유효하다. 현재 Vanilla JavaScript·정적 콘텐츠·저장소·평가기를 재사용하며 모바일 검증·SQL·Java runner·설치 앱·React 이관·DB·서버·시각 자산 추가·Git 게시는 이 작업에 포함하지 않는다. 진행과 검증 상태는 [작업 카드](../work-items/2026-09-14-code-quest-navigation.md)에 기록한다.

`[추론]` 승인 목표를 구현하기 위한 이번 최소 설계는 아래의 읽기 전용 projection이다. 검증된 Quest `lessonId`의 교안에서 `courseId`를 읽고 그 `lessonId` 자체를 주제로 사용한다. 표시 번호는 과정 안에서 기존 `order`와 안정 ID 순으로 계산하며 원본 order·ID·revision·source·저장 상태를 수정하지 않는다. 연결이 없거나 유효하지 않은 항목은 가짜 과정·주제로 추론하지 않고 기존 콘텐츠 검증 오류 경계로 반환한다. 스키마에 과정·주제·표시 번호를 영구 저장하는 선택은 후속 `DEC-QUEST-CATALOG-01`에 남긴다.

목록에서 과정을 고르면 해당 과정의 주제·Quest와 범위가 명시된 진도가 표시된다. 검색은 번호·제목·요약을 대상으로 하고 주제·상태 필터와 함께 적용한다. 번호 이동은 현재 과정의 전체 표시 번호를 기준으로 하며 숨겨진 필터 결과도 유효한 대상이면 기존 상세 URL로 이동한다. 빈 결과·유효하지 않은 번호는 입력을 보존하고 이유를 안내한다. 다음 Quest는 필터와 무관하게 같은 과정의 기존 순서에서 고르며 마지막에는 목록으로 돌아가는 행동을 제공한다. 이어서 풀기는 진행 중 항목을 우선하고, 없으면 현재 완료가 아닌 첫 항목, 모두 완료이면 첫 항목의 다시 풀기로 연결한다. 최근 활동 시각이 있는 진행 중 항목은 최근 순, 동률·시각 없음은 표시 순으로 고른다.

관련 문서는 실제 `lessonId`의 기존 문서 URL로 연결한다. 학습 지도는 연결 교안과 실제 `conceptIds`를 보여 주고 해당 관계의 Quest로 이동하게 하며, 추가 선수 관계나 학습 순서를 만들어 내지 않는다. 목록·지도 탐색만으로 초안 생성·완료 표시·시도 기록 쓰기를 하지 않는다. 실패 시 이번 탐색 UI와 연결만 되돌릴 수 있으며 사용자 콘텐츠와 저장 기록을 초기화하지 않는다.

`[현재 사실]` 이번 문제 탐색기와 학습 지도는 페이지 내부 영역으로 구현했으며 별도 overlay가 아니다. 아래 전체 목표 중 modal 열기·Escape·호출자 초점 복원은 이 형태에 적용하지 않는다. 실제 토글 버튼·입력의 초점 유지와 자연스러운 키보드 순서는 대표 데스크톱에서 확인했다. 지도 이동은 버튼으로 해당 영역에 초점·스크롤을 옮기며 상세 URL을 유지한다. 모바일·설치 앱·원격 게시는 구현자 검사 범위에 포함되지 않는다.

### 단계 힌트 공개 시 읽던 위치 보존

`[확정 결정]` 2026-09-14 bam의 후속 요청에 따라 Code Quest에서 다음 힌트를 공개할 때 현재 화면의 `scrollX`·`scrollY`를 유지한다. 새 힌트에 접근성 초점을 옮기는 경우에도 `preventScroll`을 사용해 읽던 위치를 바꾸지 않는다. 힌트 공개 순서·내용·학습자 source·실행/저장 계약은 그대로 두며, 이전 화면이 예약한 비동기 초점 처리가 route 이동 뒤 다른 화면의 초점이나 스크롤을 바꾸면 안 된다.

일반 제품 UI 수정으로 `src/app.js`의 힌트 공개 흐름과 별도 영향 테스트에 한정한다. 대표 데스크톱에서 첫째·둘째·마지막 힌트 공개 전후 위치와 source 보존, 지연 처리 전 route 이동의 무영향을 확인한다. 전체 검사·빌드·모바일 검사를 추가하지 않는다. 구현·검증·후속 게시 상태는 [기존 탐색 작업 카드](../work-items/2026-09-14-code-quest-navigation.md#후속-힌트-스크롤-보존과-게시)를 따른다.

`[현재 사실]` 힌트 스크롤 보존을 구현했고 독립 focused 26/26과 대표 데스크톱 검증을 통과했다. Chrome 1440×1000 어두운 theme의 HTML `document-structure`에서 힌트 1·2·3 공개마다 위치와 source를 보존했으며 새 힌트 초점·마지막 버튼 비활성도 확인했다. stale 비동기 처리의 무영향은 자동 회귀 검사로 확인했다. 후속 통합·Git 게시 결과는 아직 대기 중이며 상세 조건·hash·미실행 범위는 작업 카드를 따른다.

## 코딩테스트와의 분리 경계

두 기능의 목적·진입·지원·데이터·route·진도 비교는 [`coding-test.md`의 분리 경계](coding-test.md#code-quest와의-경계)가 정본이다. Code Quest는 교안에 가까운 실제 작성 연습이라는 자기 목적과 전용 콘텐츠·route·진도·완료율을 유지한다. 두 기능은 같은 교안·개념에 연결될 수 있고 내부 runner DTO·Worker 실행기 구현과 실행 추상화를 재사용할 수 있지만 서로의 문제 레코드로 변환하거나 교차 기능 카탈로그를 만들지 않는다.

## 학습자 정보 구조

Code Quest 화면은 다음 세 단계의 현재 위치를 한 문장과 탐색 UI로 보여 준다.

```text
과정 → 학습 주제 → 현재 Quest
```

예시는 `CSS / 선택자 / 3. 클래스 선택자`다. `languageId`는 작성·평가 계약을 정하고 `courseId`는 학습 과정을 구분한다. JavaScript 실행기를 공유하는 JavaScript 과정과 알고리즘 과정도 화면에서는 서로 다른 과정으로 식별해야 한다.

### 화면 영역

| 영역 | 학습자가 알아야 할 것 | 필수 동작 |
| --- | --- | --- |
| 과정 탐색 | 현재 Quest가 어떤 과정에 연결되는가 | 현재 과정 텍스트와 `aria-current`, 실제 콘텐츠가 있는 과정 이동 |
| 주제 탐색 | 과정 안에서 어떤 개념 묶음을 연습하는가 | 순서·완료 수·현재 주제 표시 |
| 현재 문제 머리말 | 현재 Quest 번호·제목·요약·연결 교안 | breadcrumb, 교안·학습 지도 이동 |
| 문제 탐색기 | 이 Code Quest 모음과 자신의 상태 | 번호·제목·내용 검색, 번호 이동, 주제·상태 필터 |
| 작업 공간 | 무엇을 작성하고 어떤 공개 기준으로 확인하는가 | 문제→편집기→공개 결과의 예측 가능한 초점 순서 |
| 다음 행동 | 지금 무엇을 해야 하는가 | 이어서 풀기, 다시 풀기, 다음 Quest·교안 또는 별도 코딩테스트 링크 |

첨부 Code Quest 화면의 보라색 외형이나 원본 React 구성요소 코드를 복사하지 않는다. 채택 대상은 위치, 진도, 탐색과 학습 지도라는 정보 관계다. BAM.dev 자체 구현은 [`DEC-FRONTEND-01`](../roadmap.md#2026-09-04-확정-제품-결정)의 React·TypeScript 점진 이관과 [`visual-design.md`](visual-design.md)의 외형을 따르며, 이는 참고 프로젝트 코드를 가져온다는 뜻이 아니다.

콘텐츠가 없는 과정은 완료 가능한 항목처럼 표시하지 않는다. Java Code Quest는 현재 없으며 `DEC-JAVA-01` 전에는 활성 과정으로 표현하지 않는다. Java 코딩테스트가 MVP 목표라는 `DEC-JAVA-CODING-TEST-01`도 Java Code Quest나 정식 Java 과정을 자동 포함하지 않는다.

## 난이도와 학습 지원

현재 `difficulty: beginner | intermediate | advanced`는 Code Quest 내부 메타데이터다. 코딩테스트와의 제품 관계나 `기초/심화` 경로를 뜻하지 않는다. UI에 표시할 정확한 의미가 정해지기 전에는 값의 이름만으로 지원 수준이나 A/E/C/T 단계를 주장하지 않는다.

각 Quest는 현재 계약의 starter, `concept → observation → implementation` 힌트와 공개 실패 설명을 사용한다. 문제의 L1~L4 수준은 기능명이나 `difficulty` 하나가 아니라 경험 카드의 새 A/E/C/T, 학습자가 받아야 하는 지원과 독립 판단 범위로 정한다.

## 위치와 진행 상태

현재 화면 위치와 학습 진행을 같은 상태로 취급하지 않는다.

- 위치: `현재` 또는 현재가 아님
- 진행: `시작 전 | 진행 중 | 이전 완료 | 완료`
- `진행 중`: 저장된 초안이나 실제 시도가 있고 현재 revision 완료 조건은 아직 통과하지 않음
- `완료`: 현재 revision의 공개 완료 조건을 통과한 증거가 있음
- `이전 완료`: PASS가 이전 revision이거나 완료 ID는 있지만 PASS revision 증거가 보관되지 않음

`[현재 사실]` Quest 초안과 `completedQuestIds` 자체는 revision을 저장하지 않는다. `completedQuestRevisions`는 Quest ID·revision·완료 시각을 보존하며 `questAttempts`도 `questRevision`을 저장한다. 완료 revision 레코드는 시도 보관 한도 밖에서도 남고, 이 두 곳에 근거가 없는 완료 ID만 revision 미상이다. 현재 저장소의 기존 `getCurrentCompletedQuestIds`는 revision 1의 legacy 완료 ID를 인정하는 호환 계약도 갖는다. 이번 탐색 표시에서는 이 selector·저장 동작을 바꾸지 않고 새 projection을 홈의 Quest 안내·목록·Quest 상세에 일관되게 사용해 legacy를 `이전 완료`로 구분한다. 다른 화면의 기존 집계는 이 작업의 변경 범위가 아니다.

`[추론]` 이번 읽기 전용 진도 projection은 `completedQuestRevisions` 또는 유효한 PASS attempt의 revision이 현재와 같으면 `current_revision`, 현재와 다른 완료 revision 근거만 있으면 `older_revision`, 완료 ID만 있으면 `legacy_unversioned`로 판정한다. PASS attempt는 `outcome === passed`, `total > 0`, `passed === total`을 모두 만족해야 한다. 뒤의 두 경우는 `이전 완료` 이력으로 보존하고 현재 revision을 다시 통과해야 완료로 승격한다. revision 없는 초안은 원본 source를 보존하고 `저장된 초안의 문제 버전은 확인할 수 없습니다`라고 안내한다. 과거 코드라고 단정하거나 현재 starter로 덮어쓰거나 현재 revision의 초안이라고 주장하지 않는다.

이번 상태 우선순위는 `현재 revision 완료 근거 → 현재 revision 시도 → 이전 PASS/legacy 완료 → 초안 또는 기타 시도 → 시작 전`이다. 이전 완료와 revision 미상의 초안만 함께 있으면 `이전 완료`를 유지하며 초안 존재·버전 미상을 보조 안내한다. attempt의 실제 `questRevision`이 현재와 같으면 `진행 중` 근거이며 이전 이력은 보조 상태다. 완료 이력이 없는 초안·기타 시도는 revision을 확정하지 않는 `진행 중`이다. 현재 revision PASS 이후 실패한 재시도나 초안이 있어도 이미 확인한 완료를 취소하지 않는다. 최근 활동은 배열 위치를 최신으로 가정하지 않고 초안 `updatedAt`·시도 `completedAt`으로 비교한다.

진도는 항상 범위와 분모를 함께 표시한다.

- `선택자 · 2/4 완료`
- `CSS Code Quest 전체 · 8/18 완료`

현재 완료율에는 `current_revision`만 포함한다. `older_revision`과 `legacy_unversioned`는 별도 상태·필터로 보존하고 현재 완료율을 부풀리지 않는다. 코딩테스트 완료 수를 Code Quest 분모에 넣지 않는다.

## 문제 탐색기와 학습 지도

문제 탐색기는 다음을 제공한다.

- 번호·제목·요약 검색
- 현재 과정 범위의 표시 번호로 직접 이동
- 주제와 `시작 전 | 진행 중 | 이전 완료 | 완료` 필터
- 현재 필터 결과 수
- 문제 번호, 제목, 짧은 요구, 현재 위치와 진행 상태
- 키보드 이동. overlay로 제공할 때에는 열기·닫기 및 닫은 뒤 호출 버튼으로 초점 복원

학습 지도는 문제 문구나 정규식으로 교안을 역추론하지 않는다. 번들된 curriculum의 lesson `courseId`·`conceptIds`와 Quest의 `lessonId`·`conceptIds` 관계를 검증해 다음 관계를 보여 준다.

```text
교안 개념 → 연결 Code Quest
```

실제로 연결된 코딩테스트나 웹과제가 있으면 별도 제품으로 이동하는 링크를 둘 수 있지만 Code Quest 단계·진도·분모로 포함하지 않는다. 추천 경로를 잠금 조건으로 바꾸려면 이유와 우회·복습 경로를 별도 결정해야 한다.

## 접근성·모바일 계약

- 현재 위치와 진행 상태를 색상만으로 구분하지 않는다.
- 진행률은 범위·분모 텍스트와 접근 가능한 `progressbar`를 함께 제공한다.
- 현재 과정·주제·문제에는 `aria-current`, 주제·상태 필터에는 `aria-pressed`를 사용한다.
- 검색·필터 결과 변화는 사용자의 입력을 방해하지 않는 상태 안내로 전달한다.
- 탐색기와 학습 지도를 overlay로 제공할 때에는 열면 제목 또는 첫 입력으로 초점을 옮기고 닫으면 호출 버튼으로 돌려보낸다. 이번 inline 영역은 토글·입력의 초점 유지와 자연스러운 키보드 순서를 검증한다.
- 320px 폭에서 과정→주제→문제→편집기→결과의 한 열 흐름을 유지한다.
- 최소 44px 조작 영역, 키보드 이동, 고대비와 reduced motion을 지원한다.

## Code Quest 전용 표시 모델

`[추론]` 이번 구현은 현재 JSON을 바꾸지 않고 UI가 필요한 표시값을 Quest와 curriculum 관계에서 읽기 전용으로 계산한다. 아래는 의미 계약이며 모든 값을 새 객체 필드로 저장할 의무는 없다. 이는 코딩테스트를 포함하는 통합 카탈로그가 아니다.

```text
id / revision / slug
courseId / languageId
lessonId / conceptIds
order / displayOrder
topicId
title / summary / difficulty / estimatedMinutes
progress: not_started | in_progress | previously_completed | completed
progressEvidence: current_revision | older_revision | legacy_unversioned | none
knownPassedRevision: positive integer | null
draftSourceRevision: positive integer | unknown | none
```

`courseId`는 검증된 `lessonId → courseId`, 초기 `topicId`는 검증된 `lessonId`에서 파생하고 제목·문구로 추론하지 않는다. 이번 표시 순서·기존 route 보존은 [첫 구현 계약](#데스크톱-탐색-첫-구현-계약)을 적용하며 영구 필드 저장은 `DEC-QUEST-CATALOG-01`의 후속 선택이다. legacy 난이도에 새 의미나 단계는 부여하지 않는다.

## 단계적 개선

1. 현재 Quest JSON·route·runner·진도를 변경하지 않고 과정·주제·revision 표시 projection을 검증한다.
2. 과정·주제·상태 탐색기와 학습 지도를 기존 Quest 실행 화면에 추가한다.
3. 현재 URL·ID·order·초안·실행·완료를 보존하며 새 탐색 진입점을 연결한다.
4. 실제 브라우저에서 검색·직접 이동·focus·키보드·좁은 화면과 현재/이전 완료를 검증한다.
5. 검증된 이점이 있을 때만 표시값을 스키마에 저장할지 별도 결정한다.

코딩테스트 JSON, route, 실행 모드와 진도는 이 전환 대상이 아니다.

## 완료 조건

아래는 제품의 전체 목표다. 이번 작업은 승인된 데스크톱 웹에서 검색·번호·필터·현재 위치·진도·문서/지도·홈/사이드바 연결·공개 실행·초안 보존을 검증하며, 모바일·설치 앱 목표를 이번 완료 gate로 확대하지 않는다.

- 한 화면에서 과정·주제·현재 Quest를 확인할 수 있다.
- 검색·직접 이동·주제·상태 필터와 학습 지도를 키보드·모바일에서 사용할 수 있다.
- 현재 위치와 진행 상태, 주제 진도와 Code Quest 전체 진도의 의미가 섞이지 않는다.
- 기존 ID·URL·revision·초안·실행·완료가 보존되고 현재·이전·알 수 없는 revision 증거가 구분된다.
- 모든 평가 사례와 기대 동작이 공개 로컬 기준이며 원격·숨김 사례가 없다.
- Code Quest와 코딩테스트의 이름·route·콘텐츠·진도·완료율이 분리된다.
- 실제 브라우저 또는 설치 앱에서 접근성·좁은 화면·공개 실행을 검증한다.

## 확인이 필요한 선택

- 검증 뒤 `courseId`, `topicId`, `displayOrder`를 실제 스키마에 저장할 이점이 있는지
- legacy `difficulty`를 UI에 표시할지와 표시 의미
- 이후 revision별 초안 저장을 도입할지와 기존 초안의 명시적 이전 방식
- Java Code Quest를 언제 활성화하고 어떤 로컬 실행 경계를 사용할지

결정 상태는 [`../roadmap.md`](../roadmap.md#bam-결정-대기-목록)에서 관리한다.
