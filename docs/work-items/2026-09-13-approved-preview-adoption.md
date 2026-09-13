# 승인 시안의 실제 UI 적용 — 2026-09-13

## 작업과 현재 상태

- 작업 ID: `2026-09-13-approved-preview-adoption`. 유형 **일반 제품 기능·코드**, 변경 성격 해당 없음. 기존 교육 내용의 표시와 제품 탐색·theme를 개선하며 교안·문항을 생성·개작하지 않는다.
- 승인: bam의 최종 시안 채택 요청 ‘좋은데? 이 시안대로 가자.’. [`DEC-APPROVED-PREVIEW-01`](../roadmap.md#2026-09-13-확정-제품-결정)이 과거 Ocean 브랜드·단일 theme 후보와 중복 목표 배치를 대체한다.
- 현재 상태: **제품 반영·focused 검사·독립 UI 검증·전체 통합 gate PASS**. 구현 전 정본 계약을 작성하고 총괄 diff 확인·독립 문서 검토를 통과한 뒤 구현했다. 최종 문서는 동결된 제품·테스트의 실제 검증 증거만 기록하며, 마감 diff·링크·제품 SHA의 독립 최종 확인은 후속 단계다. 설치형 MVP 전체 완료를 뜻하지 않는다.
- MVP 필요성: 기존 R1 홈·독립 학습문서/객관식 흐름의 사용자 편의·읽기 가독성 개선. R2 이후 풀이 기능이나 설치형 MVP 완료와 구분한다.
- 입력 정본: [문서 지도](../README.md), [제품 범위](../product-scope.md), [로드맵](../roadmap.md), [개발 절차](../development-workflow.md), [시각 계약](../designs/visual-design.md#채택-시안의-색상과-theme-계약), [복습 계약](../designs/lesson-review.md#채택-시안의-홈목록읽기-계약), [아키텍처](../architecture.md), [콘텐츠 스키마](../content-schema.md).
- 승인 시안의 읽기 전용 원본: `/Users/goonbam/.codex/visualizations/2026/09/12/01a0953b-61b5-76d3-85a1-1ebc258d83a4/bam-reference-preview.html`. 제품에는 외형·승인 문구를 적용하며 목업의 JavaScript 1문서·1문항·임시 기록·비교 tweak는 복사하지 않는다.

## 변경 범위와 보호 범위

홈·문서 목록·객관식 목록·읽기·풀이 화면과 공통 탐색·theme가 대상이다. 기존 semantic token·Vanilla JavaScript·로컬 폰트·정적 자산을 재사용한다. 기존 전체 콘텐츠·준비 중·샘플·검색·이어서 풀기·깊은 URL, 실제 개념 모달·문서 왕복·완료와 세션 저장·공개 시점은 보존한다. 제목 아래 목표와 한줄 요약은 원문·기존 필드의 표시 위치만 바꾸고 목표를 임의로 한 문장으로 개작하지 않는다. 모든 기존 heading 앵커를 유지한다.

Code Quest·코딩테스트·인앱 Web Project는 공통 token·shell의 가독성 회귀만 확인하며 기능·route·평가기를 변경하지 않는다. CSS 6교안의 개념별 분할은 기존 미완료의 별도 작업이다. 교육 콘텐츠·개념 발췌·원문·기준답안·대표오답·ID·과정 순서·학습자 코드·기존 진도 키, 밤위키의 폴더·템플릿·수집·예약 설정·비공개 기록·공개 금지 디자인 자산·원본 `dist`·`.git`은 변경하지 않는다. 새 의존성·React·TypeScript 이관·Java runner·설치·배포·commit·PR·push는 비범위다.

## 역할과 경로 소유권

| 역할 | 허용 쓰기 경로 | 인계 경계 |
| --- | --- | --- |
| 총괄 `/root` | 없음 | 실제 baseline·파일·diff·명령·검증 증거를 확인하고 단계 진행 또는 반환 |
| 최초 설계 문서 `adopt_preview_docs` → 최종 문서 마감 `bam_reference_mockup` | `docs/designs/visual-design.md`, `docs/designs/lesson-review.md`, `docs/roadmap.md`, `docs/README.md`, 이 카드 | 최초 계약 작성·동결 뒤 순차 소유권 인계. 최종 마감은 QA·통합 증거 GO 이후 문서만 수정 |
| 초기 독립 문서 검토 `bam_mockup_review` | 없음 | 결정 대체·원문 보존·범위·마이그레이션·접근성 계약 PASS. 총괄이 실제 diff·최종 SHA 확인 |
| 제품 구현 `bam_reference_mockup` | 아래 제품 7파일 | 계약 검토 GO 뒤 구현하고 동결. 교육 콘텐츠·테스트·문서 쓰기 금지였으며 문서 마감 역할은 구현·독립 검증 종료 뒤 별도로 인계 |
| 테스트 작성 `first_use_test_engineer` | 아래 테스트 6파일 | 확정된 계약과 API에 따라 제품과 겹치지 않는 경로에서 병렬 작성. 제품·콘텐츠 쓰기 금지 |
| 독립 UI QA `reading_palette_preview` | 원본 쓰기 없음 | 별도 origin의 theme·본문·목차·모달 왕복·키보드·320px/1024px 및 대표 실습 화면 검증 |
| 독립 통합 `first_use_document_closure` | 원본 쓰기 없음 | 안전한 복제본에서 최종 전체 gate 1회, 보호 범위 불변 확인. 최종 문서 diff·링크와 제품 SHA를 별도로 확인 |
| Git 담당 | 미배정·권한 없음 | commit·PR·merge·push·기준선 조작 없음 |

실제 제품 변경은 `styles/tokens.css`, `styles/app.css`, `src/app.js`, `src/ui/app-shell.js`, `src/ui/learning-catalog-view.js`, `src/ui/theme.js`, `src/repositories/theme-preference-repository.js`의 7파일이다. 뒤의 theme 2파일은 신규이며 `src/ui/markdown.js`는 허용 후보로 읽었으나 변경하지 않았다.

실제 테스트 변경은 `tests/accessibility.test.js`, `tests/app-independent-review.test.js`, `tests/app-shell.test.js`, `tests/learning-catalog-view.test.js`, `tests/lesson-answer.test.js`, `tests/theme.test.js`의 6파일이다. 구현과 테스트는 계약 확정 뒤 서로 다른 경로에서 병렬 진행했고, 같은 경로를 병렬로 수정하지 않았다. 총괄이 실제 파일·diff와 검증 증거를 확인해 단계별로 인계했다. 문서 마감 중 제품·테스트 13파일은 동결 상태를 유지하며 교육 문장·정책을 새로 결정하지 않는다.

## 사용자 관찰 가능 완료 조건

- 홈의 승인 문구·의도한 줄바꿈·데스크톱 한 줄 제목과 두 서비스 독립 진입, 단일 BAM.dev·공통 메뉴·하단 문구가 일치한다.
- 검색 → 주제 → 결과 카드가 기존 전체 데이터와 상태를 유지하며 빈 결과·준비 중·샘플·이어서 풀기를 명확히 보여 준다.
- 제목 아래 목표와 한줄 요약의 역할이 구분되고 원문 내용이 유실·중복되지 않는다. 실제 heading 목차·기존 앵커·하단 질문·독립 답 열람·수동 완료가 동작한다.
- 객관식의 기존 선택·채점·정답/선택한 오답 해설·실제 개념 모달·문서 왕복·조건부 복귀·새로고침 기록이 보존된다.
- light/dark 초기 OS 선택·명시적 선택·로컬 재실행 복구·잘못된 값·저장 실패를 검증한다. 저장 실패에도 현재 theme와 기존 풀이 상태를 보존하고 거짓 저장 성공 안내를 하지 않는다.
- 본문 4.5:1, 의미 있는 UI 경계·focus 3:1 이상의 실제 대비·비색상 상태 단서와 키보드 조작을 확인한다. 320px·1024px에서 목차·긴 문장·메뉴·카드가 잘리지 않고 코드·표만 내부 스크롤을 사용한다. 다른 세 실습 제품의 공통 chrome 가독성도 확인한다.
- 외부 자산·런타임 요청을 추가하지 않고 학습자 미리보기에는 제품 theme를 주입하지 않는다. 로컬 진도 키·콘텐츠·원문·원본 `dist`·Git 변경이 없음을 baseline으로 대조한다.

## 검증 실행과 실제 증거

`[현재 사실]` 2026-09-13, 제품 구현자와 테스트 작성자의 focused 검사 및 독립 QA를 통과한 최종 소스를 동결했다. 아래 결과는 총괄이 보고서·실제 diff·명령 로그를 직접 확인한 범위다.

| 단계 | 실제 명령·환경·결과 | 증거 |
| --- | --- | --- |
| 초기 설계 검토 | 총괄의 5문서 실제 diff 확인 뒤 `bam_mockup_review` 독립 PASS, 최종 SHA 일치 | `/private/tmp/bam-approved-preview-docs.diff`, `/private/tmp/bam-approved-preview-docs-final-sha.json` |
| focused 회귀 | `node --test tests/theme.test.js tests/accessibility.test.js tests/app-independent-review.test.js tests/app-shell.test.js tests/learning-catalog-view.test.js tests/lesson-answer.test.js` — 독립 실행 **62/62 PASS**, 실패 0 | `/private/tmp/bam-approved-preview-independent-focused.log` |
| 실제 UI | Chrome, `http://127.0.0.1:4198`, 밝게·어둡게의 320px·1024px — **PASS**. 사용자 origin `4189`의 기록을 건드리지 않고 QA 탭 종료·viewport 복구 | `/private/tmp/bam-approved-preview-independent-report.json` |
| 전체 통합 | Node `v24.17.0`·npm `11.13.0`, Darwin arm64. 안전한 `/private/tmp/bam-approved-preview-integration-final-yj5_4lw1/project`에서 **`npm run check` 1회**, exit 0 | 같은 상위 폴더의 `integration-report.json`, `npm-run-check.log` |
| 콘텐츠·테스트·빌드 | 기존 34교안·52문항·18Quest·6코딩테스트·1Web Project 구조 검증 PASS. 테스트 **608/608 PASS**, 실패·skip 0. 복제본 빌드 91파일 모두 source SHA 일치 | 위 통합 보고서·로그 |

독립 UI에서 승인 홈 문구와 1024px 한 줄 제목, 320px 자연 줄바꿈, 문서 34개·문제 52개의 실제 목록·검색·초기화·샘플·준비 중·이어서 풀기를 확인했다. 읽기의 원문 목표·요약과 실제 h2 목차, 답 열람의 무저장·수동 완료·재진입 접힘, 정답/선택 오답 해설과 키보드 채점, 실제 모달의 Tab 순환·Escape 초점 복구, 문제에서 문서로 이동해 새로고침한 뒤 풀이·선택·초점을 복원하는 왕복이 통과했다. theme 변경은 열린 답·메뉴·선택을 유지했고 Web Project의 textarea·iframe `srcdoc`도 동일했다. Code Quest·코딩테스트·Web Project의 대표 화면에 가로 넘침이 없었으며 console 경고·오류는 관찰되지 않았다.

실제 합성 배경을 반영한 대표 텍스트 최소 대비는 읽기 light 4.93:1·dark 5.51:1, 객관식의 평면·불투명 상태 light 4.99:1·dark 6.16:1이었다. focus는 양쪽 theme에서 3px outline·3px offset이며 canvas 대비 light 6.369:1·dark 8.782:1이었다. 코드 비선택 행의 opacity 0.95 합성 최소는 light 4.698:1·dark 6.247:1이다. 전체 gradient의 픽셀별 전수 대비를 검증했다는 의미는 아니다.

기준선과 보호 범위는 다음 증거로 대조했다.

- 최초 설계 기준선: `/private/tmp/bam-approved-preview-docs-baseline-20260913/manifest.json`. 최종 문서 마감 직전 5파일 복제·SHA: `/private/tmp/bam-approved-preview-docs-closure-before/manifest.json`.
- 제품 수정 전 복제·SHA: `/private/tmp/bam-approved-preview-before/manifest.json`. 실제 제품 diff·최종 SHA: `/private/tmp/bam-approved-preview-implementation.diff`, `/private/tmp/bam-approved-preview-implementation-report.json`.
- 통합 보호 기준선: `/private/tmp/bam-approved-preview-integration-preflight-b981ajyj/protected-before.json`. 동결 소스 195파일 기준선: `/private/tmp/bam-approved-preview-integration-final-yj5_4lw1/source-before.json`.
- 독립 QA의 제품·테스트 13파일과 미변경 `markdown.js` 총 14개 SHA가 동결 상태와 일치했다. 통합 전후 원본·복제본 source의 추가·삭제·변경은 없고 지정한 제품·테스트 13경로 밖의 변경은 없었다. 원본 `dist` 82파일·`content` 52파일·`.git` 1511파일과 route·진도·package 등 보호 계약 8파일, 승인 시안 원본이 그대로임을 `protected-audit.json`에서 확인했다. 빌드 생성물은 원본에 복사하지 않았다.
- 현재 Git은 첫 커밋 전 `codex/js-foundation`, 전체 untracked·remote 없음이다. Git 쓰기·commit·PR·push·merge를 수행하거나 존재하는 것으로 기록하지 않았다. 밤위키와 교육 콘텐츠는 변경하지 않았다.

OS 초기값과 명시적 선택의 새로고침 유지·상태 보존은 실제 UI에서 확인했다. OS 변경·잘못된 저장값·읽기/쓰기 차단·용량 실패는 컨트롤러·저장소 테스트로 확인했으며 호스트 OS나 실제 브라우저 저장 정책을 바꿔 시험한 것은 아니다. forced-colors와 네이티브 의미 구조는 정적 검토만 했고 실제 forced-colors 에뮬레이션·스크린리더는 미실행이다. 모든 기기·브라우저 조합, 교육 내용 전수 감사, 설치·배포·실제 네트워크 단절 상태의 전체 오프라인 실행도 미실행이다. CSS 6교안의 개념별 분할과 R2 이후 기능은 이 검증으로 완료 처리하지 않는다.

최종 5문서 마감은 위 gate 이후의 증거 기록이다. 제품·테스트를 바꾸거나 전체 `npm run check`를 다시 실행하지 않는다. 통합자는 마감 diff·문서 링크·제품 SHA의 읽기 확인으로 이 후속 단계를 마친다. bam의 추가 디자인 선택은 필요하지 않다.
