# 전역 서비스 사이드바 작업 카드

- 작업 ID·유형: `2026-09-13-service-sidebar`, 일반 제품 기능·코드. 변경 성격은 해당 없음이며 교육 내용·평가 행동을 변경하지 않는다.
- 필요성·승인: bam의 ‘우리 사이드바 만들자’ 요청과 `DEC-USABILITY-01`에 따라 기존 세 서비스의 이동·현재 위치를 항상 찾기 쉽게 한다. 이후 ‘굿 승인할게’로 탐색 시안을 승인하여 문서·문제 검색, 주제·문서 바로 이동과 최근 문서·서비스 복귀를 실제 제품에 적용한다. 설치형 MVP·후속 학습 기능을 완료했다고 주장하지 않는다.
- 설계 정본: [전역 서비스 사이드바](../designs/visual-design.md#전역-서비스-사이드바). 작업 시작 스냅샷은 `b01f5262`이며 기존 상단 서비스 탐색·820px 모바일 메뉴 동작을 직접 확인했다.
- 보존 경계: 승인 홈 문구·theme·주제/검색·문서 내부 목차·풀이/초안·콘텐츠/ID/route/저장 키·기존 실습. 원문·커리큘럼·비공개 자산·평가기·의존성·설치·원격 통합은 변경하지 않는다.

## 경로 소유권과 순서

| 순서·역할 | 소유·허용 경로 | 인계 조건 |
| --- | --- | --- |
| 1 제품·설계 문서 담당 | `docs/designs/visual-design.md`, `docs/designs/lesson-review.md`, `docs/roadmap.md`, `docs/architecture.md`의 화면 탐색 1문장, 이 카드 | 총괄이 실제 설계 diff를 확인한 뒤 구현 시작 |
| 2 제품 코드 담당 | `src/ui/app-shell.js`, `src/ui/learning-catalog-view.js`, `src/ui/service-sidebar-view.js`(표시 helper 1개), `src/app.js`, `styles/app.css` | 기존 모바일 동작 재사용, focused 검사와 실제 diff 인계 |
| 3 테스트 작성 담당 | `tests/app-shell.test.js`, `tests/app-independent-review.test.js`, `tests/accessibility.test.js` 또는 이 경계의 최소 focused 테스트 파일 | 승인 탐색·상태 보존의 최소 계약 검사. 제품 소유 파일 수정 금지 |
| 4 독립 `test_engineer` | 읽기 전용 검증, 검증 증거를 총괄에 전달 | 필요한 focused 검사·대표 데스크톱 검색/이동/복귀·키보드 확인 뒤 PASS/FAIL과 미실행 범위 명시 |
| 5 별도 `project_integrator` | 읽기 전용 diff·보존·증거 대조, 안전한 복제본 검증 | 새 검색·route 상태를 포함한 최종 묶음의 `npm run check` 1회 후 통합 판정. 모바일·추가 콘텐츠 재감사 없음 |
| Git 담당 | 총괄이 허용한 Git 작업만 | 독립 검증·통합 뒤 `codex/service-sidebar`의 승인 변경을 한국어 commit으로 만들고 기존 `dev` 대상 Draft PR #17의 `codex/approved-learning-updates`를 fast-forward해 갱신. 로컬 작업 branch 유지, 중복 PR·merge·배포·원격 기능 통합은 포함하지 않음 |

총괄은 저장소를 직접 수정하지 않는다. 겹치는 경로는 담당자의 실제 diff 인계를 확인한 뒤 순차 이전한다. 문서 담당의 최종 결과 반영도 구현·검증 보고와 총괄 대조 후 수행하며, 기록된 역할명이 자체 PASS를 뜻하지 않는다.

## 관찰 가능한 완료 조건과 검증

- `[확정 결정]` 최신 승인 범위는 [236px 탐색 사이드바](../designs/visual-design.md#승인된-탐색-시안-적용)와 [탐색 상태·복귀 계약](../designs/lesson-review.md#탐색-사이드바의-상태와-복귀)이다. 실제 데이터의 검색·빈 결과, 주제 선택·가까운 최대 5문서·전체 목록, 최근 본 문서 최대 2개, 서비스별 마지막 주제와 유효 route 복귀를 확인한다.
- 기존 학습 목표·선행 개념·본문·오른쪽 목차·문서 면과 문제의 선택·채점·해설·복귀 토큰·진도·초안·저장 키를 보존한다. 새 탐색 상태는 같은 앱 실행 중 메모리에만 두며 가짜 최근 기록·진도나 새 콘텐츠를 만들지 않는다.
- 검색·주제·링크의 이름과 현재 위치, Tab·Enter·Escape·목적 화면 초점을 대표 데스크톱에서 확인한다. 기존 theme token·외부 요청 없는 정적 콘텐츠·모바일 fallback을 유지한다.
- 최신 ‘모바일 하지 마’·‘테스트는 최대한 최소한’ 지시에 따라 새 모바일 UI·모바일 검사·추가 콘텐츠 재감사는 하지 않는다. 필요한 구문·핵심 focused 검사와 짧은 데스크톱 smoke를 중복 없이 실행한 뒤 최종 `project_integrator`만 안전한 복제본에서 `npm run check`를 1회 수행한다. 작업자·검증자의 전체 suite 반복은 금지하며 앞선 읽기 배치의 gate 보류나 초기 622개 PASS를 새 검색·route 상태의 검증 면제·통과로 재사용하지 않는다. 실제 명령·결과·미실행 범위를 인계하고 실패는 원인 담당에게 반환한다.
- 사용자 시안 승인은 확보됐다. 독립 검증·통합 뒤 승인된 변경의 GitHub 게시를 진행하며 구현 완료·검증 PASS·게시 성공은 각각 실제 증거로만 기록한다.

## 후속: 학습 주제를 객관식으로 연결

`[확정 결정]` 사용자 요청에 따라 [탐색 상태 계약](../designs/lesson-review.md#탐색-사이드바의-상태와-복귀)의 학습문서→객관식 전환을 보정한다. 현재 구체 주제를 객관식 목록에 적용하고 이전 검색어를 비우되 유효한 문제 복귀 문맥을 우선한다. 일반 제품 코드 변경이며 교육 내용·모바일·저장/URL 스키마·의존성은 변경하지 않는다. `[현재 사실]` `src/app.js` 9줄과 테스트의 새 시나리오 2개·서비스 클릭 helper 보정을 반영했고 총괄이 실제 diff를 대조했다. focused·전체 gate와 독립 데스크톱 UI 확인을 통과했다.

이번 소유권은 문서 담당이 이 카드·`docs/designs/lesson-review.md`, 구현 담당이 `src/app.js`와 필요한 기존 사이드바 shell, 테스트 담당이 `tests/app-independent-review.test.js`다. 기존 독립 통합 담당이 계약·diff를 감사하고 안전한 복제본의 최종 `npm run check`를 1회 수행한다. 최소 focused 확인 외 모바일·추가 콘텐츠 감사·중복 전체 검사는 하지 않으며, 이번 변경은 로컬 완료 범위로 Git 게시 권한을 행사하지 않는다. 아래 완료·게시 준비 기록은 이 후속 변경 전 탐색 시안 적용의 증거다.

- 후속 focused는 처음 **2/3 PASS**였다. 실패 1건은 HTML 문서 로드 때 이미 생기는 collection을 비어 있다고 가정한 테스트 사전조건 오류로, 실제 빈 collection의 HTML 목록 첫 진입으로 보정한 뒤 해당 검사만 **1/1 PASS**했다. 기존 토큰·fallback 검사는 처음부터 통과했다. 로그: `/private/tmp/bam-review-topic-focused.log`, `/private/tmp/bam-review-topic-focused-corrected.log`.
- 안전 복제본 `/private/tmp/bam-review-topic-integration-vriup5a2/`의 `full-check-result.json`·`full-check.log`에서 이번 후속 전체 `npm run check` **1회**, exit 0, **628/628 PASS**와 정적 빌드 완료를 확인했다. 이번 Git 작업·모바일 추가 검사는 실행하지 않았다.
- 독립 데스크톱 UI **PASS**: 별도 `localhost:4201`의 Chrome 1920×1024에서 HTML 두 번째 문서→객관식 HTML 12문제, CSS 문서→객관식 CSS 12문제 선택과 목적 본문 초점, console error/warn 0건을 확인했다. 임시 탭을 닫았으며 사용자 `localhost:4189`·저장값은 조작하지 않았다. 증거 폴더: `/private/tmp/bam-review-topic-integration-vriup5a2/`.

## 실제 진행·증거

`[현재 사실]` 2026-09-13, 후속 탐색 시안 승인과 정본 선행 기록 뒤 제품 코드 5개 파일에 실제 검색·탐색·상태 복귀를 반영했고 총괄이 실제 diff를 대조했다. 테스트 작성자는 기존 2개 파일에 탐색 시나리오 3개를 추가하고 바뀐 markup의 기존 기대값 3개를 보정했다.

- 후속 focused 검사: `node --test --test-name-pattern='탐색 사이드바|브랜드는|서비스 사이드바는|새 HTML 문서는' tests/app-shell.test.js tests/app-independent-review.test.js`를 1회 실행해 **6/6 PASS**를 확인했다. 테스트 작성자의 인계 결과이며 원시 stdout 파일은 보관하지 않았다. 독립 검증자는 테스트 기대값·제품 경로를 대조하고 같은 자동검사를 중복 실행하지 않았다.
- 후속 독립 검증 **PASS**: 별도 `localhost:4201`의 1280×720 데스크톱에서 검색·빈 결과, Tab/Enter/Escape, 주제·최근 문서·서비스 왕복과 답 펼침·`scrollY: 2439` 복원을 확인했다. console error/warn 0건, 정본 로컬 링크·앵커 90개 오류 0건이다. 증거: `/private/tmp/bam-sidebar-adoption-independent-review.json`. 사용자 `localhost:4189` 상태는 건드리지 않았고 모바일·추가 theme/브라우저·교육 내용 재감사·실제 채점/토큰 왕복의 브라우저 재순회는 미실행이다.
- 후속 최종 통합 **PASS**: 안전한 복제본의 `npm run check`는 첫 실행 **625/626**으로 실패했다. 기존 보안 검사가 합법적인 사이드바 SVG까지 금지한 경계를 `tests/lesson-answer.test.js` 3줄에서 실제 원문 표시 영역으로 보정하고, 독립 기대값 검토·focused **1/1 PASS** 뒤 재시도했다. 최종 실행은 exit 0, **626/626 PASS**, 정적 빌드 **107파일**이며 전체 gate는 실패를 포함해 **총 2회**다. 증거: `/private/tmp/bam-sidebar-adoption-integration-final-f1om32h3/`의 `integration-review.json`, `full-check-result.json`, `full-check.log`.
- 승인된 13경로와 전체 214파일 보존 검토를 통과했고 총괄이 원본 214파일 SHA의 최종 manifest 일치를 다시 확인했다. 이 시점은 **GitHub 게시 준비 완료**이며 게시·merge·배포 완료가 아니다. 아래 수치와 명령은 **초기 세 서비스 사이드바**의 과거 증거다.

`[현재 사실]` 초기에는 설계 diff 확인 후 제품 3개 파일과 테스트 2개 파일에 사이드바를 반영했다. 당시 독립 `test_engineer`의 제품·테스트 대조와 실제 UI 검증은 PASS이며 차단 결함은 없었다.

- 독립 focused 검사: `node --test tests/app-shell.test.js tests/app-independent-review.test.js tests/accessibility.test.js tests/theme.test.js tests/focus.test.js` → exit 0, **48/48 PASS**, 실패·생략 0. 증거: `/private/tmp/bam-service-sidebar-test-engineer.json`, `/private/tmp/bam-service-sidebar-test-engineer-focused.log`.
- 실제 UI: macOS 14.8.3 arm64·Chrome의 독립 로컬 주소에서 1920×1080·390×844·820/821×844·320×740 대표 화면과 두 theme을 확인했다. 고정 사이드바·sticky 상단·현재 위치, 초기 닫힘, Tab 순환·Escape/닫기/배경 클릭·폭 전환 초점, footer 포함 `inert`·스크롤 잠금, 검색/주제·선택/채점/해설·문서 왕복·기존 Quest 초안 보존을 통과했다. 새 탐색 글자 대비는 light 현재/비활성 5.75/5.97:1, dark 6.55/7.80:1이었다.
- 전체 gate: 별도 `project_integrator`가 안전한 복제본 `/private/tmp/bam-sidebar-integration-_q_w1drh/source`에서 `npm run check`를 **1회** 실행해 exit 0, **622/622 PASS**, 실패·생략 0과 정적 빌드 완료를 확인했다. 증거: 같은 작업 폴더의 `full-check-result.json`, `full-check.log`. 자산·원본 보존의 최종 대조 판정은 아직 이 기록에 포함하지 않았다.
- 한계: 모든 화면 폭×theme 조합을 전수 검사하지 않았다. 실제 forced-colors 렌더링은 지원 도구 부재로 미실행했고 기존 CSS·비색상 단서만 대조했다. 열린 메뉴 중 비동기 목록 완료는 단위 검사로 확인했으며 브라우저 지연을 강제하지 않았다. 다른 브라우저/OS·설치 앱·전체 콘텐츠/평가기 재감사·공개 Quest 평가 실행은 이번 실제 UI 범위 밖이다.
- Git: 현재 브랜치는 `codex/service-sidebar`다. 이번 사이드바 작업의 commit·push·PR 생성과 원격 기능 통합은 실행하지 않았다.
