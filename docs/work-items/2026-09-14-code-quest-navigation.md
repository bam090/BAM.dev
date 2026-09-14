# Code Quest 데스크톱 탐색

## 범위와 기준선

- 작업 ID: `2026-09-14-code-quest-navigation`
- 유형: 일반 제품 기능·코드. 학습 내용·목표·평가 계약을 변경하지 않아 새 경험 카드·콘텐츠 저작/승인 경로는 해당 없음.
- 사용자 승인: 기존 JavaScript·HTML·CSS Quest를 보존한 과정→주제→현재, 검색·번호 이동·주제/상태 필터·이어서/다음·관련 문서·실제 관계 학습 지도, 홈·사이드바 연결의 데스크톱 웹 구현.
- 정본: [첫 구현 계약](../designs/code-quest.md#데스크톱-탐색-첫-구현-계약). `DEC-QUEST-UI-01`·`DEC-QUEST-NAVIGATION-01`의 현재 UI 개선이며 M3의 React 이관·모바일·설치형 MVP 전체 완료와 구분한다.
- 실행 위치: `/Users/goonbam/Documents/ChatGPT/bam dev`, 시작 branch `codex/service-sidebar`, HEAD `b97260eb866a15a02a80531107eca4b2144d436b`.
- 시작 dirty 경로: `AGENTS.md`, `README.md`, `docs/content-schema.md`, `docs/designs/lesson-review.md`, `docs/development-workflow.md`, `docs/roadmap.md`, `docs/work-items/2026-09-13-github-publication.md`, `src/app.js`, `src/repositories/progress-repository.js`, `src/repositories/review-session-repository.js`, `src/ui/quiz-view.js`, `tests/app-quiz-review.test.js`, `tests/progress-repository.test.js`, `tests/quiz-view.test.js`, `tests/review-session-repository.test.js`.
- 보존 근거: 설계 시작 시 읽기 전용 `git status --short`·HEAD·branch와 위 파일 SHA-256을 `/tmp/bam-quest-navigation-design-baseline.json`에 기록했다. dirty는 이번 작업의 변경을 뜻하지 않는다. 기존 변경과 겹치는 `src/app.js`·`docs/roadmap.md`는 이번 부분 패치만 구분하며, 나머지는 담당의 기준선·최종 diff 증거로 보존을 판정한다.

## 소유권과 순서

| 순서·역할 | 허용 쓰기 범위 | 완료·인계 |
| --- | --- | --- |
| 제품·설계 문서 담당 (Astra) | 이 카드, `docs/designs/code-quest.md`, `docs/README.md`의 Quest 상태, `docs/architecture.md` 최소 문구, `docs/roadmap.md`의 Quest 항목 | 선행 계약·기준선·완료 조건, 후속 receipt의 실제 상태 반영 |
| 조사 담당 | 없음 | 현재 코드·연결·저장·테스트 경계의 읽기 전용 receipt |
| 제품 구현자 (Sol xhigh) | 총괄이 조사 인계 후 지정하는 Quest 도메인/UI·앱 연결·스타일 경로 | 구현과 기존 focused 검사. 테스트 파일 작성 금지 |
| 별도 테스트 작성자 | 총괄이 지정하는 Quest 단위·앱 연결 테스트 경로 | 계약에서 도출한 독립 기대값·focused 결과 |
| 독립 `test_engineer` | 없음 | 독립 기대값 감사·focused·실제 데스크톱 검증 |
| 독립 문서 검토자 | 없음 | 문서 diff·링크·상태·충돌 검토 |
| 독립 `project_integrator` | 없음 | 앞선 PASS·전체 diff·기준선 보존·소유권·미검증 연결 대조 |

총괄은 파일을 수정하지 않는다. 같은 경로는 선행 담당 인계·총괄 검토 후 순차 소유한다. 제품·테스트 경로의 구체 지정과 각 revision/hash는 해당 인계에 기록한다. 콘텐츠·schema·runner·저장 형식·기존 원문 및 범위 밖 dirty 변경은 금지다. `README.md`는 이 작업에서 수정하지 않는다. Git 상태 변경·commit·push·PR·merge는 모두 미승인으로 수행하지 않는다.

## 사용자 관찰 가능 완료 조건과 검증

- 홈·사이드바에서 Quest 목록에 진입하고 실제 과정·주제·현재 Quest 및 범위·분모를 알 수 있다. 콘텐츠 없는 과정은 활성 목록에 만들지 않는다.
- 검색·직접 번호 이동·주제/상태 필터·빈 결과·잘못된 번호가 동작하며 선택 과정 밖으로 섞이지 않는다. 기존 상세 URL·이어서/다음·문서 왕복·실제 관계 지도가 유효하다.
- 현재 revision PASS만 완료 분자에 포함한다. 이전 PASS·legacy 완료·진행 중·시작 전, revision 미상 초안과 현재 위치를 구별한다. 원본 source와 기존 진도·URL·ID·order·revision을 보존한다.
- 공개 테스트 실행과 저장·복구·취소의 기존 JS/HTML/CSS 계약을 유지한다. 목록·지도 열람은 저장 부작용이 없다. 코딩테스트 진도·분모·route와 섞지 않는다.
- 승인된 데스크톱에서 밝게/어둡게, 키보드·현재 위치 텍스트·focus·필터 결과 안내·진도 분모를 확인한다. 탐색기/지도가 overlay이면 열기·Escape·닫기 후 호출자 초점 복원을 검증하며, inline이면 해당 modal 의무 대신 자연스러운 키보드 순서를 확인한다.
- 자동 검사는 projection 관계/순서·상태/필터/번호/이어서·기존 route/초안 보존과 실제 변경 연결에 한정한다. 실제 데스크톱 검증은 대표 JS·HTML·CSS 실행 및 탐색·진도 fixture를 사용하고 결과·viewport·입력·환경을 기록한다. 공통 앱 변경은 홈/사이드바와 대표 기존 문서·객관식 진입 회귀만 추가한다.
- 정확한 focused 명령·대상 hash는 구현/테스트 인계에서 선정한다. 전체 테스트·빌드를 자동 반복하지 않으며 기존 유효 증거는 대상·의존 변경 여부로 재사용한다. 검증 뒤 수정은 영향 범위만 재확인한다.
- 정적 same-origin 데이터와 현재 런타임만 사용하며 새 네트워크·의존성·저장 키를 추가하지 않는다. 설치 후 오프라인·모바일·SQL·Java 실행·React·DB·서버·배포 검증은 미실행 범위다.

## 상태와 인계

`[현재 사실]` 선행 설계에 따라 제품 구현을 반영했고 구현자의 기존 focused 109개 검사는 통과했다. 세 UI 반환 수정 후 독립 `test_engineer` PASS를 받았다. 최종 독립 문서 재검과 `project_integrator` 통합 판정도 PASS를 받았다. 큰 사용자 선택은 현재 승인 범위 안에 없으며, 영구 스키마·초안 revision 저장·Java 실행 등의 후속 선택은 기존 결정 대기에 유지한다.

선행 조사 receipt(`/root/quest_inventory`)에서 JavaScript 9·HTML 5·CSS 4 Quest의 모든 lesson 연결과 concept 부분집합을 확인했다. 같은 JavaScript 언어에 복수 과정이 있으므로 언어를 과정으로 추정하지 않는다. 저장 근거는 `src/repositories/progress-repository.js`의 초안·시도·`completedQuestRevisions` 계약이다. 초안 revision은 없고, 완료 revision 근거는 시도 50개 보관 한도 밖에서도 유지한다. 기존 revision 1 legacy selector는 보존하며 이번 새 탐색 projection만 legacy를 이전 완료로 구분한다. 이 조사 receipt를 사용해 정본의 오래된 `questAttempts`만을 근거로 하는 설명을 수정했다.

설계 담당은 허용한 문서 5개만 부분 수정했고 `git diff --check`를 통과했다. 제품 실행·테스트·브라우저 검증은 미실행이다. 시작 dirty 파일 SHA-256 기록은 보존 증거의 입력이며 최종 통합 PASS를 대신하지 않는다. 문서 검토와 실제 구현·테스트의 최종 인계는 아래에 기록한다.

### 제품 구현 인계 반영

총괄이 확인한 `/root/quest_inventory` 구현 receipt를 근거로 현재 사실만 반영했다. 제품 소유 경로는 `src/core/code-quest.js`, `src/core/navigation.js`, `src/app.js`, `src/ui/code-quest-view.js`, `src/ui/learning-catalog-view.js`, `src/ui/app-shell.js`, `src/ui/service-sidebar-view.js`, `styles/app.css`의 8개다. 문서 담당은 제품 코드 상세 조사나 실행 검증을 중복하지 않았다.

- 구현: `#/quest` 과정·주제 목록, 검색·상태 필터·과정 번호 이동, 이어서 풀기, 같은 과정 이전/다음, 실제 lesson·concept 지도, 상세 breadcrumb·진도·교안, 홈·236px 사이드바 연결.
- 형태: 목록·학습 지도는 inline 영역이다. overlay 전용 열기·Escape·닫은 뒤 호출자 초점 복원은 N/A이며 토글의 실제 초점과 키보드 순서는 대표 데스크톱에서 독립 확인했다.
- 보존: 구현 receipt에서 기존 콘텐츠·ID·URL·order·source·저장·평가기 보존을 인계했다. 최종 기준선 보존 판정은 독립 통합 담당이 맡는다.
- 실행: 구현자 focused 109 PASS는 구현자 자체 결과이며 독립 PASS와 구분한다. 정확한 명령·대상 hash는 구현 receipt를 따르며 이 문서 갱신에서 다시 실행하지 않았다.
- 미실행: 문서 담당의 제품 테스트·브라우저 확인, 이번 작업의 모바일·SQL·Java runner·설치 앱·React·DB·서버·원격 게시. 독립 검증의 실행·재사용·한계는 아래 최종 인계에 기록한다.

### 반환 수정

- 독립 데스크톱 검사에서 번호 `99`를 입력하면 브라우저 native validation이 사용자 안내를 막는 FAIL을 반환했다. 제품 구현자가 번호 이동 form에 `novalidate`를 적용했고 관련 검사 5개 PASS를 인계했다. 이 첫 수정의 `src/ui/code-quest-view.js` SHA-256은 `bdd5337f5f4a0411a1ce826a8530154a25f53cd346477de9048e80fa686e13e7`이며 이후 수정된 최종 상태와 구분한다.
- 상세 `학습 지도 보기`의 fragment 링크가 SPA route를 덮어써 기본 교안으로 이동하는 FAIL을 반환했다. 버튼에서 지도 영역으로 focus·scroll을 옮기고 기존 URL을 유지하도록 수정했다.
- `이전 완료`만 표시해 older와 legacy의 근거를 구별할 수 없는 FAIL을 반환했다. 공통 설명에 `문제 버전 N에서 완료`와 `완료한 문제 버전 확인 불가`를 구분해 표시하도록 수정했다.
- 문서 검토는 inline 구현 설명과 무조건적인 overlay 초점 의무가 충돌해 FAIL을 반환했다. 설계 담당은 문제 탐색기·접근성 절의 두 문구를 overlay일 때로 조건화하고 inline의 초점 유지·자연스러운 키보드 순서를 명시했다. 문서 담당이 제품 검사를 다시 실행하거나 독립 재검 PASS를 대신하지 않는다.
- 기존 dirty `docs/roadmap.md` 보존은 이번 결정 문단 추가와 catalog 행 교체를 역으로 적용한 임시 복원본 `/tmp/bam-quest-navigation-roadmap-prechange-reconstructed.md`으로 확인했다. 최초 원문 사본은 없었지만 실제 패치의 두 변경만 제거한 복원본 SHA-256이 시작 manifest의 `289c511a2ac978de6925a7668ceeb3850e8fbb711ba914a7ef0aa316607626a0`과 일치했다. 실제 roadmap은 복원하거나 덮어쓰지 않았으며, 이 결과는 이번 두 hunk 밖의 기존 dirty 내용 보존 근거다.

### 독립 검증 최종 인계

`[현재 사실]` `/root/quest_verify`의 `test_engineer` 최종 판정은 PASS다. 제품 8경로·독립 테스트 7경로를 반영했으며 기준 HEAD는 위 시작 상태와 같다. 최종 독립 문서 재검·통합 판정도 PASS다.

| 최종 검증 대상 | SHA-256 |
| --- | --- |
| `src/app.js` | `88156fb64e4be26a95f0c015139fb631d95fe997655dba40da520620e07098ed` |
| `src/ui/code-quest-view.js` | `93deae5817bd44ce23cf794f1125fe397e5774c38cbc877be6185c80fe4536cf` |
| `tests/code-quest-navigation-view.test.js` | `6c6a4b36dd752fb9e9b342b0da73c05a762762b04cd2e01c59d3b70b17ac7809` |
| `tests/app-code-quest-navigation.test.js` | `f3ca19b560ee4700c380059006bfe20ba08896b919b3a39090ad38d2d684955c` |

- 실제 실행: 최초 focused 11파일 109/109, 두 UI 수정 후 view+app 6/6, 최종 view+기존 view 18/18, 최종 revision 회귀 4/4, `/tmp/verify-code-quest-revision.mjs`, view 문법 검사·diff 검사 PASS. 서로 겹치는 검사 수를 합산하지 않는다. 수정 영향 밖의 최초 증거는 재사용했고 변경된 부분만 다시 검사했다.
- 실제 앱: in-app browser 1440×1000 밝게/어둡게에서 과정·주제·실제 교안/concept 관계, 검색·결합 필터·빈 결과·초기화·번호 이동/뒤로가기·문서 왕복, 3px solid 키보드 초점, 지도 URL 유지·section 초점/스크롤, debounce 뒤 초안 복원, 홈·사이드바 연결과 별도 코딩테스트 route/진도 분리를 확인했다. 대표 공개 실행은 JavaScript 6/6·HTML 6/6·CSS 4/4 PASS이며 console warning/error는 0이었다.
- 반환된 번호 99·학습 지도 route·older/legacy 설명의 세 결함은 수정 뒤 모두 독립 재검 PASS다. 이전 완료는 알려진 버전 번호와 버전 미상 설명을 구분하며 현재 완료 분자에 포함되지 않음을 확인했다.
- revision 증거는 실제 projection·view·CSS를 사용한 `/tmp` 브라우저 fixture에서 목록·이어서·지도 표시를 확인하고 자동 회귀에서 상세 머리말·지도·현재 완료 분자 제외를 확인했다. live 앱의 old/legacy localStorage 주입은 브라우저 URL 보안 정책 때문에 미실행했으며 이 대체 검증과 구분한다.
- 시각 증거: `/tmp/bam-quest-verify-light-list.png`, `/tmp/bam-quest-verify-dark-list.png`, `/tmp/bam-quest-verify-no-results.png`, `/tmp/bam-quest-verify-map-focus.png`, `/tmp/bam-quest-verify-keyboard-focus.png`, `/tmp/bam-quest-verify-revision-evidence.png`.
- 미실행: 18문제 전수 실행·전체 check/build/tests·모바일·SQL·Java runner·설치 앱·React·DB·서버·Git/원격 게시. 선정한 필수 검증의 미해결 항목은 없으며 문서 담당은 이 결과를 재실행하지 않았다.

`/root/quest_doc_review`의 최종 독립 문서 재검과 `/root/quest_integrate`의 최종 `project_integrator` 판정은 PASS다. 통합 담당은 제품 8경로·테스트 7경로·문서 5경로의 전체 diff·소유권·연결, 기존 dirty 13파일 hash와 roadmap 복원 hash 일치, 세 UI 결함의 독립 수정 재검 PASS와 현재 대상 hash를 확인했다. 이번 갱신은 해당 판정의 상태 기록만 바꾸므로 유효한 제품 검증을 재실행하지 않는다.

독립 검증의 정확한 명령은 다음과 같다. 결과와 재사용 범위는 위 인계를 따른다.

```sh
node --test tests/code-quest-navigation.test.js tests/code-quest-navigation-view.test.js tests/app-code-quest-navigation.test.js tests/code-quest-core.test.js tests/navigation.test.js tests/code-quest-view.test.js tests/learning-catalog-view.test.js tests/app-shell.test.js tests/app-language-routing.test.js tests/app-code-quest-draft.test.js tests/accessibility.test.js
node --test tests/code-quest-navigation-view.test.js tests/app-code-quest-navigation.test.js
node --test tests/code-quest-navigation-view.test.js tests/code-quest-view.test.js
node --test tests/code-quest-navigation-view.test.js
node /tmp/verify-code-quest-revision.mjs
node --check src/ui/code-quest-view.js
git diff --check
```

## 후속 힌트 스크롤 보존과 게시

`[확정 결정]` 2026-09-14 bam은 전체 서비스 사이드바를 승인하고 커밋·push·병합을 요청했으며, 게시 전에 Code Quest 힌트 공개 시 스크롤을 유지하도록 추가 요청했다. 앞선 작업의 Git 미승인 문구는 당시 범위 기록이며 이번 명시적 후속 승인과 구분한다.

- 선행 계약: [단계 힌트 공개 시 읽던 위치 보존](../designs/code-quest.md#단계-힌트-공개-시-읽던-위치-보존). 첫째·둘째·마지막 힌트 공개 전후 `scrollX`·`scrollY`와 source를 보존하고 새 힌트 focus에는 스크롤 이동을 방지한다. 예약된 처리가 다른 route의 초점·스크롤을 바꾸지 않게 한다. 공개 순서·콘텐츠·실행·저장 계약은 변경하지 않는다.
- 소유권: 문서 담당은 이 카드와 `docs/designs/code-quest.md` 해당 절만 수정한다. 제품 담당은 `src/app.js`, 별도 테스트 작성자는 총괄이 지정한 영향 테스트를 맡고 독립 검증 이후 Git 담당이 게시한다. 원문·SHA 기준선은 `/tmp/bam-quest-hint-docs-baseline/`에 보관했다.
- 검증: 해당 focused와 대표 데스크톱 힌트 1·2·마지막 위치/source 보존 및 stale 비동기 처리 무영향에 한정한다. 전체 검사·빌드·모바일은 이번 수정의 필수 검사가 아니며 기존 유효 증거를 재사용한다.
- Git 읽기 전용 인계 시점은 `origin/dev` `cafc7fc`다. 원격 `.nojekyll`을 보존하고 이미 같은 README·객관식 즉시 재도전은 재변경하지 않는다. 미게시 `AGENTS.md`·개발 워크플로·운영 로드맵·게시 기록 변경은 이번 게시 범위에서 제외한다. 기존 dirty를 삭제하거나 덮어쓰지 않는다.

`[현재 사실]` 힌트 수정과 독립 검증은 PASS다. 후속 통합·Git 게시·병합은 아직 대기 중이다. 게시 후보 `/private/tmp/bam-quest-publication`의 `codex/quest-navigation-sidebar`에 최신 문서 반입을 준비하며 이를 게시 완료로 기록하지 않는다.

- 독립 focused: `node --test tests/app-code-quest-navigation.test.js tests/code-quest-view.test.js tests/app-code-quest-draft.test.js` 26/26과 diff 검사 PASS. 힌트 공개 순서, 즉시/예약 처리 후 위치·source·실행/저장 상태 보존, route 이동 후 stale 예약 처리의 초점·스크롤 무영향을 확인했다.
- 대표 데스크톱: Chrome 1440×1000, 어두운 theme, HTML `document-structure`. 접근성 버튼 클릭으로 힌트 1·2·3을 공개할 때마다 `(scrollX, scrollY) = (0, 922)` 유지, source 바이트 불변, 새 힌트 초점, 마지막 버튼 비활성·URL 보존·console 오류 0을 확인했다.
- 대상 SHA-256: `src/app.js` `f4fb46d5b7bab59b13f3e295eeb5a70780401a2d37eaf1d238b506179b2b3f5c`, `tests/app-code-quest-navigation.test.js` `9f519cd9741507d24c804e8c448d37a977f0ca135c584f2713dce1011d3ec552`. 근거는 `/tmp/bam-hint-scroll-tests-receipt.txt` 및 독립 `quest_verify` 최종 receipt다.
- 이번 문서 갱신은 검증 receipt를 재사용했고 제품 실행을 반복하지 않았다. 모바일·전체 검사·빌드는 이번 힌트 검증에서 미실행이며 통합·Git 결과를 대신하지 않는다.
