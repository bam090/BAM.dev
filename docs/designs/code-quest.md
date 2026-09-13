# Code Quest 제품 설계

이 문서는 교안에 연결된 Code Quest의 정보 구조, 학습 위치, 탐색·진도와 기존 기능의 단계적 UI 개선 정본이다. 코딩테스트는 별도 [`coding-test.md`](coding-test.md), 문제 저작은 [`../code-quest-authoring.md`](../code-quest-authoring.md), 학습 경험 판정은 [`../learning-content-design.md`](../learning-content-design.md), 전역 색상·상태 표현은 [`visual-design.md`](visual-design.md)가 담당한다. 결정 문구·이유·날짜는 [`DEC-QUEST-SEPARATE-01`과 `DEC-QUEST-UI-01`](../roadmap.md#2026-08-29-확정-제품-결정), [`DEC-LOCAL-EVALUATION-01`](../roadmap.md#2026-09-02-확정-제품-결정)이 정본이다.

## 결정 적용과 현재 상태

- `DEC-QUEST-SEPARATE-01` 적용: Code Quest는 코딩테스트와 별도 목적·route·콘텐츠·UI·진도를 유지한다. 코딩테스트를 `심화 Code Quest`로 투영하지 않는다.
- `DEC-QUEST-UI-01` 적용: 사용자가 만든 Code Quest의 과정·주제·진도·문제 탐색기·학습 지도 정보 구조를 BAM.dev의 콘텐츠·접근성 경계에 맞게 반영한다.
- `DEC-PUBLIC-EVALUATION-01` 적용: Quest 결과에 영향을 주는 모든 assertion·입력·기대 동작은 설치본에 포함되고 확인 가능해야 하며 비공개·숨김 사례를 추가 실행하지 않는다.
- `DEC-LOCAL-EVALUATION-01` 적용: 설치형 MVP의 JavaScript Quest는 공개 테스트마다 새 one-shot Worker를 사용한다. 코딩테스트와 내부 runner DTO·실행 추상화를 재사용할 수 있지만 Docker·Spring Boot·PostgreSQL·Nginx·계정·사용자 관리 수신 포트를 요구하지 않고 제품 경계를 합치지 않는다. Java Code Quest 실행은 별도 결정 전까지 이 계약에 포함하지 않는다.
- `[현재 사실]` Code Quest는 언어별 JSON·schema, `#/quest/<language>/<quest>` route, runner router와 Quest 전용 초안·실행·완료 진도를 사용한다.
- `[현재 사실]` 현재 UI는 언어와 `order` 중심이며 과정·주제 탐색기와 학습 지도는 아직 구현되지 않았다.

설치형 앱 전환은 별도 결정이다. Code Quest를 개선해도 설치 프로그램이 되지 않으며, 설치·오프라인 경계는 [`local-application.md`](local-application.md)가 담당한다.

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

`[현재 사실]` Quest 초안과 `completedQuestIds` 자체는 revision을 저장하지 않는다. 보관 중인 `questAttempts`는 `questRevision`을 저장하므로 현재 또는 이전 revision의 PASS를 복원할 수 있다. 시도 보관 한도 밖에서는 완료 ID만 남아 revision을 알 수 없는 경우가 있다.

`[제안]` Code Quest 전용 진도 projection은 PASS attempt가 현재 revision과 같으면 `current_revision`, 이전이면 `older_revision`, 완료 ID만 있으면 `legacy_unversioned`로 판정한다. 뒤의 두 경우는 `이전 완료`로 표시하고 현재 revision을 다시 통과해야 완료로 승격한다. revision 없는 초안은 원본 source를 보존한 채 revision을 알 수 없다고 알리고 조용히 새 starter에 귀속하지 않는다.

상태 우선순위는 `현재 revision 완료 → 현재 초안·시도 진행 중 → 이전 완료 → 시작 전`이다. 이전 완료 기록이 있는 학습자가 현재 문제를 다시 풀면 주 상태는 `진행 중`으로 표시하고 이전 이력은 보조 상태로 유지한다.

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
- 키보드로 열기·이동·닫기 및 닫은 뒤 호출 버튼으로 초점 복원

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
- 탐색기와 학습 지도를 열면 제목 또는 첫 입력으로 초점을 옮기고 닫으면 호출 버튼으로 돌려보낸다.
- 320px 폭에서 과정→주제→문제→편집기→결과의 한 열 흐름을 유지한다.
- 최소 44px 조작 영역, 키보드 이동, 고대비와 reduced motion을 지원한다.

## Code Quest 전용 표시 모델

`[제안]` 현재 JSON을 바꾸기 전에 UI가 필요한 표시값을 Quest와 curriculum 관계에서 읽기 전용으로 계산한다. 이는 코딩테스트를 포함하는 통합 카탈로그가 아니다.

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

`courseId`는 검증된 `lessonId → courseId`, 초기 `topicId`는 검증된 `lessonId`에서 파생하고 제목·문구로 추론하지 않는다. 기존 `order`는 저장·복구용으로 보존하고 `displayOrder`가 필요하면 과정 안에서 기존 순서와 안정 ID로 결정론적으로 계산한다. 실제 필드 저장·route·표시 순서는 `DEC-QUEST-CATALOG-01`에서 확정한다.

## 단계적 개선

1. 현재 Quest JSON·route·runner·진도를 변경하지 않고 과정·주제·revision 표시 projection을 검증한다.
2. 과정·주제·상태 탐색기와 학습 지도를 기존 Quest 실행 화면에 추가한다.
3. 현재 URL·ID·order·초안·실행·완료를 보존하며 새 탐색 진입점을 연결한다.
4. 실제 브라우저에서 검색·직접 이동·focus·키보드·좁은 화면과 현재/이전 완료를 검증한다.
5. 검증된 이점이 있을 때만 표시값을 스키마에 저장할지 별도 결정한다.

코딩테스트 JSON, route, 실행 모드와 진도는 이 전환 대상이 아니다.

## 완료 조건

- 한 화면에서 과정·주제·현재 Quest를 확인할 수 있다.
- 검색·직접 이동·주제·상태 필터와 학습 지도를 키보드·모바일에서 사용할 수 있다.
- 현재 위치와 진행 상태, 주제 진도와 Code Quest 전체 진도의 의미가 섞이지 않는다.
- 기존 ID·URL·revision·초안·실행·완료가 보존되고 현재·이전·알 수 없는 revision 증거가 구분된다.
- 모든 평가 사례와 기대 동작이 공개 로컬 기준이며 원격·숨김 사례가 없다.
- Code Quest와 코딩테스트의 이름·route·콘텐츠·진도·완료율이 분리된다.
- 실제 브라우저 또는 설치 앱에서 접근성·좁은 화면·공개 실행을 검증한다.

## 확인이 필요한 선택

- Code Quest 과정·주제 탐색 진입점과 기존 URL 유지 방식
- `courseId`, `topicId`, `displayOrder`를 projection으로 둘지 실제 스키마에 저장할지
- legacy `difficulty`를 UI에 표시할지와 표시 의미
- `이전 완료`와 revision을 학습자에게 설명할 정확한 문구
- Java Code Quest를 언제 활성화하고 어떤 로컬 실행 경계를 사용할지

결정 상태는 [`../roadmap.md`](../roadmap.md#bam-결정-대기-목록)에서 관리한다.
