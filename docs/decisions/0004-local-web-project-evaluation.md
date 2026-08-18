# ADR 0004: 로컬 Web Project 평가 경계

- 상태: 승인
- 결정일: 2026-08-18
- 적용 범위: 6차 Web Project v1

## 배경

Web Project는 한 함수나 한 HTML/CSS 조각을 확인하는 Code Quest보다 큰 과제다. 여러 파일을 함께 완성하고, 자동으로 관찰할 수 있는 구조·스타일과 사람이 화면을 보며 판단해야 하는 사용성을 구분해야 한다. 현재 서비스는 외부 서버 없이 동작해야 하며, 수동 검토자나 신뢰할 수 있는 서버 채점 결과는 아직 없다.

기존 Code Quest `GradeReport`는 통과한 테스트 개수를 중심으로 하므로 자동 70점, 수동 30점, 부분 점수, 미평가 상태를 정확히 표현하지 못한다. 기존 진행 저장 키에 새 필드를 섞으면 이전 탭이 모르는 필드를 제거한 채 다시 저장할 위험도 있다.

## 결정

### 독립 도메인

Web Project는 별도의 `schemaVersion: 1`, `contractVersion: 1`, 콘텐츠·제출·점수 DTO를 사용한다. Code Quest 콘텐츠 DTO와 `GradeReport`를 확장하거나 변형하지 않는다. 다만 이미 검증된 다음 저수준 경계는 재사용한다.

- `findWebCodeQuestSourceIssue`: HTML·CSS source 사전 검사
- `getWebAssertionExpected`: 공개 assertion 기대값 파생
- HTML DOM 및 CSS style 공개 assertion 평가 adapter

### 두 파일과 실행 경계

v1 프로젝트는 HTML 파일 하나와 CSS 파일 하나를 가진다. 파일당 UTF-8 20 KiB, 제출 전체 64 KiB 상한과 안전한 상대 POSIX 경로를 적용한다. 학습자 JavaScript는 실행하지 않으며 제출 계약에도 JavaScript 파일을 허용하지 않는다.

미리보기와 평가기는 제출된 HTML을 격리된 문서 구조로 사용하고 제출 CSS를 브라우저 안에서 직접 주입해 두 파일을 결합한다. `index.html`의 `<link>` 요소는 사용하지 않는다. 기존 HTML preflight가 `link`를 외부 문서 로딩 가능 요소로 차단하기 때문이다. 또한 Web Project HTML의 `<style>` 요소와 `style` 속성을 거부해 CSS 자동 기준을 `styles.css` 제출에만 귀속한다. 이 추가 제한은 독립 HTML Code Quest에는 적용하지 않는다. 화면은 이 결합 방식을 학습자에게 명시해야 한다. 실제 배포 파일에서 stylesheet를 연결하는 방법을 가르치는 과제는 안전한 로컬 `href` 정책과 별도 평가 계약을 설계한 뒤 추가한다.

### 공개 자동 평가 70점

자동 기준은 정식 프로젝트 정의에만 존재한다. 각 기준은 ID, 순서, 대상 파일, 평가 종류, 공개 assertion, 실패 설명, 배점을 가진다. 제출은 assertion이나 배점을 포함할 수 없다. runner는 정식 정의의 기준만 snapshot하여 실행한다.

자동 결과 상태는 다음 여섯 가지다.

| 상태 | 의미 | 점수 확정 |
| --- | --- | --- |
| `passed` | 공개 assertion 통과 | 해당 배점 |
| `failed` | 공개 assertion 실패 | 0점 |
| `invalid_source` | source preflight 실패 | 0점 |
| `engine_error` | 평가기 자체 오류 | 미확정 |
| `cancelled` | 사용자가 평가 취소 | 미확정 |
| `not_run` | 앞선 중단으로 실행하지 않음 | 미확정 |

`engine_error`, `cancelled`, `not_run`은 학습자의 실패로 간주하지 않으며 0점으로 계산하지 않는다.

### 자가점검 30점

로컬 단계에는 신뢰할 수 있는 사람 검토자가 없으므로 수동 기준은 `pending` 또는 `self_assessed`만 사용한다. 각 기준의 scale은 정확히 세 단계이며 0점, 중간 점수, 최대 점수를 명시한다. `self_assessed` 점수는 학습자의 자가점검 결과이지 서버나 검토자가 확인한 점수가 아니다.

자동 기준이 모두 확정되고 수동 기준이 모두 `self_assessed`일 때만 `provisionalScore`를 숫자로 제공한다. 하나라도 미확정이면 전체 점수는 `null`이다. 모든 로컬 보고서의 `isVerified`는 항상 `false`다.

### 라우팅과 저장 경계

프로젝트 목록은 `#/web-projects`, 개별 과제는 `#/web-projects/:slug` 형태의 별도 route로 연결한다. 기존 학습·Quest route를 재사용하지 않는다.

진행 저장은 기존 `bam.dev.progress.v1`과 분리한다. 단일 aggregate JSON을 읽고 다시 쓰면 두 탭이 서로 다른 프로젝트를 갱신해도 마지막 쓰기가 다른 탭의 전체 상태를 지울 수 있으므로, 정식 저장은 다음 독립 키를 사용한다.

- 초안: `bam.dev.web-projects.v1.records.v1.draft.<projectId>@<revision>`
- 제출 요약: `bam.dev.web-projects.v1.records.v1.submission.<projectId>@<revision>@<submissionId>`
- 호환 manifest·변경 신호: `bam.dev.web-projects.v1`

원문 source는 프로젝트·revision별 최신 draft에만 저장하고 최근 10개를 유지한다. 제출은 source·assertion·배점을 제외한 요약 DTO를 제출 ID별 append-only 레코드로 저장하고 최근 20개를 유지한다. manifest는 탭 간 `storage` 이벤트와 키 열거가 불가능한 저장소의 보조 색인으로만 사용하며, 레코드가 진실 원본이다. 따라서 manifest 갱신이 경합해도 브라우저 저장소와 메모리 저장소의 키 열거로 서로 다른 초안·제출을 다시 발견한다.

기존 `bam.dev.web-projects.v1` aggregate v1은 첫 읽기에서 검증·정규화한 뒤 독립 레코드로 지연 마이그레이션한다. 레코드 쓰기를 먼저 끝낸 뒤 같은 키를 v2 manifest로 교체하므로 중간 실패에서도 이미 옮긴 데이터는 남는다.

같은 프로젝트·revision 초안에는 `expectedDraftToken` 비교를 유지해 이미 관찰한 외부 변경을 덮어쓰지 않는다. legacy aggregate는 대응하는 독립 레코드가 없을 때만 가져오며, 독립 레코드가 생긴 뒤에는 이를 authoritative 원본으로 유지한다. 다만 Web Storage는 `getItem`과 `setItem`을 하나의 compare-and-set 트랜잭션으로 묶지 못한다. 같은 초안의 토큰 확인 직후 또는 같은 프로젝트·revision·제출 ID의 존재 확인 직후 두 탭이 동시에 쓰는 좁은 경합은 last-write-wins이며, 서로 다른 레코드의 유실을 막는 것이 로컬 동기 API의 보장 범위다. manifest 경합 뒤 레코드를 다시 발견하는 보장은 실제 Web Storage처럼 물리 키를 열거할 수 있는 `MemoryStorage`와 `ResilientBrowserStorage` 구현에 적용된다. 강한 같은-레코드 원자성이 필요하면 IndexedDB 트랜잭션, Web Locks를 포함한 비동기 계약, 또는 원격 저장소 구현을 사용한다.

## 결과

- 기존 Code Quest 계약을 깨지 않고 자동·수동·부분 점수를 표현할 수 있다.
- 브라우저에 전달된 모든 assertion은 공개 평가이며 비밀 테스트라고 부르지 않는다.
- 취소나 평가기 오류가 학습자의 0점으로 왜곡되지 않는다.
- 로컬 단계에서 사람 검토를 받은 것처럼 표시하지 않는다.
- `<link>` 없는 로컬 결합은 실제 배포 구조와 다르므로 UI와 저작 문서에서 계속 설명해야 한다.
- JavaScript Web Project가 필요해지면 네트워크가 차단된 별도 실행 sandbox와 ADR이 선행되어야 한다.

## 검토한 대안

### 기존 Code Quest DTO와 GradeReport 확장

단일 source·통과 개수 계약에 자동/수동 루브릭을 억지로 결합하면 두 기능의 불변식이 약해지므로 채택하지 않았다.

### `index.html`에서 `styles.css`를 link

실제 웹 문서 작성 흐름에는 가깝지만 현재 preflight의 외부 리소스 차단 경계를 느슨하게 만든다. 안전한 프로젝트 내부 URL 해석과 탐색 차단을 별도로 설계하기 전에는 채택하지 않는다.

### 학습자 JavaScript 실행

DOM·네트워크·저장소 권한과 무한 실행을 다루는 별도 sandbox가 필요하다. v1 범위를 넘어가므로 채택하지 않았다.

### 로컬 자가점검을 검증된 수동 점수로 표시

실제 검토자가 없는데 검증된 결과처럼 보이므로 채택하지 않았다. Supabase와 사용자 소유권, 검토 권한이 준비된 이후 별도 상태를 추가한다.
