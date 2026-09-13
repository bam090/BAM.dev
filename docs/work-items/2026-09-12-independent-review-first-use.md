# 독립 학습문서·객관식 첫 사용 구현 — 2026-09-12

## 작업과 승인 범위

- 작업 ID: `2026-09-12-independent-review-first-use`
- 유형: 학습 콘텐츠 포함 기능. 기존 승인 원문의 개념 발췌 접수를 포함하므로 문서 전용·일반 코드 경로로 축소하지 않는다.
- 변경 성격: 새 경험. 원문 발췌의 교육 내용은 유지하지만 개념 오버레이와 상태를 보존하는 문서 왕복은 지원 수준과 학습 행동 순서를 바꿀 수 있으므로 아래 전체 경험 카드를 검토한다. 독립 `content_validator`가 발췌·지원 수준 영향과 아래 새 E 근거를 확인해 콘텐츠 접수·지원 설계 범위를 PASS했다. 실행 동작의 판정은 별도 `test_engineer` 증거를 따른다. 새 교육 내용·복합문항 재분류·학습 성과 입증을 주장하지 않는다.
- 승인 근거: 설계 검토 뒤 bam의 ‘일단 그걸로 적용해봐’에 따라 아래 R1 첫 사용 범위를 구현한다. 이전 설계 전용 제한은 앞 작업의 이력이고 이번 R1 시작 승인은 전과목 반입·R2/R3·설치·Git 승인으로 확대하지 않는다.
- 현재 상태: R1 첫 사용 구현·발췌 접수와 독립 콘텐츠·실행·최종 통합 검증 PASS. 첫 통합의 4개 회귀 실패는 담당자 수정과 독립 23/23 확인 뒤 새 snapshot의 581/581·정적 build PASS로 해소했다. 첫 FAIL 이력은 아래에 보존한다. R2 이후 기능·설치형 MVP·배포·Git 완료를 주장하지 않는다.
- 정본: [R1 구현 계약](../designs/lesson-review.md#r1-첫-사용-구현-계약), [R1 발췌·세션 계약](../content-schema.md#r1-개념-발췌와-진행-세션-계약), [우선 완성 순서](../roadmap.md#학습문서객관식의-우선-완성-순서), [개발 파이프라인](../development-workflow.md).

### 사용자에게 완성할 흐름

홈 `#/`에서 소개와 ‘학습문서로 이동’·‘객관식 문제 풀기’ 두 주동작을 선택한다. `#/learn`은 문서 독립 목록, `#/review`는 객관식 독립 목록이며 과목·키워드 검색과 명확한 현재 위치를 제공한다. 문서를 먼저 읽지 않고 문제를 시작할 수 있다.

기존 JS 반입 문서 3개·13문항을 첫 완결 검증 묶음으로 사용한다. 한 문제씩·개별 채점은 재사용하며 기존 승인 원문의 그대로인 발췌로 관련 개념 오버레이를 열고 같은 탭의 학습문서로 이동한다. 문제 경유 문서만 유효 내부 토큰으로 ‘문제로 돌아가기’를 제공하고 선택·채점·해설·현재 문제·스크롤·초점을 복구한다. 직접 문서 진입에는 복귀가 없다. 같은 origin의 새로고침·재실행에도 진행 상태를 보존한다.

전체 보기·전체 채점·모름·헷갈림·생애 최초 시도 집계·복합문항 재분류·대량 반입은 후속 R2/R3다. 기존 콘텐츠·깊은 URL·다른 제품 진도는 유지한다. React·Java runner·새 의존성·설치·배포·Git 변경은 없다. 기존 dark token을 유지하고 모바일에서 단순한 탐색과 읽을 수 있는 본문·명확한 주동작을 제공한다.

## 학습 경험 카드

이 카드는 기존 내용을 다시 쓰는 계획이 아니라 R1 기능으로 바뀌는 학습 행동·지원의 근거다. 문항의 기존 정답·목표·선택지·개념 연결을 바꾸지 않는다. 원문·연결·지원 설계와 새 E 근거는 아래 독립 콘텐츠 검증을 통과했다. 실제 학습자의 설명·전이 성과는 검증하지 않았다.

| 필수 항목 | 이번 묶음의 검토 내용 |
| --- | --- |
| 작업 ID와 대상 콘텐츠 ID | 이 작업 ID의 기존 JS 반입 13문항·9개념. 실제 ID 목록은 아래 snapshot에 고정 |
| MVP에 필요한 이유 | 문서와 문제 중 원하는 서비스를 직접 선택하고 개념을 확인한 뒤 같은 풀이 맥락으로 돌아오게 해 학습 중 상태 유실과 반복 탐색을 줄임 |
| 선수 개념과 연결 교안 | 기존 `js-notes-functions`, `js-notes-values`, `js-notes-collections`와 문항의 기존 conceptId 연결 유지. 새 선수 내용을 가정하지 않음 |
| 학습자가 발견할 단서 | 문제 안의 기존 타입·코드·조건, 자신이 고른 보기, 채점 결과·선택지 해설에서 확인할 근거 |
| 새 접근 원자 A | 이번에 새 개념·문항을 작성하지 않으므로 새 원자 추가를 주장하지 않음 |
| 다시 사용하는 접근 원자 A | 기존 문제의 조건과 보기 비교, 기존 문서의 해당 개념 근거 찾기, 자신의 선택 이유와 근거 대조 |
| 새 순서 연결 E | 현재 문제의 전제·내 선택 확인→관련 개념의 승인 원문 발췌 참조→필요하면 전체 문서의 해당 절 확인→선택·채점·해설이 남은 같은 문제로 복귀→원래 판단과 근거 비교. 기존 새 탭 교안 링크와 view 전환 초기화 흐름에 없던 짧은 참조·정확한 복귀를 연결하는 후보 |
| 의미 있는 조건 변화 C | 문항의 입력·조건·정답을 바꾸지 않으므로 새 C는 주장하지 않음. 채점 전에도 개념을 참조할 수 있는 지원 변화는 검증 대상 |
| 무힌트 전이 확인 기회 T | 이번 UI·발췌 연결은 T 과제가 아니며 무힌트 독립 구현·전이 성과를 입증하지 않음 |
| 사다리 단계와 제공할 지원 | 기존 문항의 지원 단계를 승격하지 않는다. 개념 발췌·문서 근거로 지원을 더하는 형성 복습이며 채점 전 열람도 가능하므로 정답을 독립 숙달의 증거로 제시하지 않음 |
| 학습자가 자신의 말로 설명할 문장 | ‘내가 고른 보기의 어느 전제를 확인했고, 문서의 어떤 근거와 비교했는지’ 설명하는 행동을 관찰할 수 있도록 연결. 실제 설명·학습 성과 관찰은 이번 자동 검증으로 주장하지 않음 |
| 기존 콘텐츠와의 독립성 비교 | 신규 문항·새 개념으로 수량을 늘리지 않음. 동일 문항·정답·공식 근거를 유지하고 참조·복귀의 순서를 개선하는 기능 차이만 주장 |
| 잡아야 할 대표 오답·오개념 | 기존 문항의 대표 오답과 네 보기별 해설 유지. 오버레이만 보고 정답이 직접 노출되는지, 발췌 때문에 기존 문항의 근거가 왜곡되는지를 실제 문항별 확인 |
| 필요한 공개 사례와 독립 검증 범위 | 13문항→9개념→3문서 연결 전수 대조, 발췌의 원문 일치·문서 heading, 채점 전/후 참조·복귀, 직접 진입·잘못된 토큰·리로드·중복 완료 기록 방지. 기존 공개 문항만 사용 |
| 출처와 확인 날짜 | 이미 반입된 JS 교안과 2026-09-09 콘텐츠 검증 기록을 입력으로 사용. 2026-09-12 접수 범위·대조 증거는 별도 발췌 기록에 남기며 과거 승인만으로 현재 PASS를 대신하지 않음 |
| 사람의 판단이 필요한 항목 | 새로운 학습 내용을 생성하지 않는 현재 흐름 안에서 새 E·지원 수준 영향의 타당성을 독립 `content_validator`가 판정. 교육적 모호함이 실제 발견되면 bam에게 근거와 함께 반환 |

### 대상 ID snapshot

| 교안 | 기존 문항 ID | 기존 conceptId |
| --- | --- | --- |
| `js-notes-functions` | `quiz-javascript-notes-return-value`, `quiz-javascript-notes-early-return`, `quiz-javascript-notes-arrow-block-return` | `js.function-return` |
| `js-notes-functions` | `quiz-javascript-notes-sync-callback` | `js.callbacks` |
| `js-notes-functions` | `quiz-javascript-notes-function-boundary` | `js.function-side-effects` |
| `js-notes-values` | `quiz-javascript-notes-const-property` | `js.variables` |
| `js-notes-values` | `quiz-javascript-notes-string-addition` | `js.operators` |
| `js-notes-values` | `quiz-javascript-notes-switch-break`, `quiz-javascript-notes-loop-boundary` | `js.control-flow` |
| `js-notes-collections` | `quiz-javascript-notes-filter-map`, `quiz-javascript-notes-find-missing` | `js.array-methods` |
| `js-notes-collections` | `quiz-javascript-notes-filter-shared-object` | `js.object-sharing` |
| `js-notes-collections` | `quiz-javascript-notes-for-in-keys` | `js.iteration` |

## 경로 소유권과 인계 순서

| 역할 | 허용 쓰기 경로 | 순서·제한 |
| --- | --- | --- |
| 총괄 orchestrator | 없음 | 실제 파일·diff·명령을 읽어 범위·선행 조건·소유권을 조정 |
| 제품·설계 문서 담당 `design_document_author` → `first_use_document_closure` | `README.md`, `docs/README.md`, `docs/designs/lesson-review.md`, `docs/content-schema.md`, `docs/roadmap.md`, `docs/product-scope.md`, 이 카드. 후속 마감 담당에 `docs/architecture.md` 추가 | 초기 담당의 baseline·계약 작성과 실제 diff를 총괄이 확인한 뒤 후속 마감 담당에게 순차 인계. 코드·콘텐츠·테스트 수정 없음 |
| 제품 구현자 `first_use_implementation` | `src/app.js`, `src/core/navigation.js`, `src/ui/app-shell.js`, `src/ui/quiz-view.js`, `src/ui/markdown.js`, `styles/app.css`, 필요한 최소 신규 `src/core/review-navigation.js`·`src/ui/learning-catalog-view.js`·`src/repositories/review-session-repository.js` 등 총괄이 승인한 JS 경로 | 콘텐츠·테스트 수정 금지. 발췌 계약 확인 뒤 연결 구현 |
| 학습 문서 관리자 `source_inventory` | `content/review-concepts.json`, `docs/content-reviews/2026-09-12-review-excerpts.md`, `content/curriculum.json`의 `javascript-notes.name` 한 줄 | 기존 JS 원문의 그대로인 발췌·ID·출처·문서 연결 접수와 과정 표시명 `JavaScript 학습문서`만 변경. 교육 내용 새 작성·개작 금지 |
| 테스트 작성자 | 신규 `tests/app-independent-review.test.js`, `tests/review-session-repository.test.js`, `tests/review-navigation.test.js`, `tests/review-concepts.test.js`, `tests/learning-catalog-view.test.js`와 기존 `tests/quiz-view.test.js`. 첫 통합 FAIL 반환 후 `tests/language-navigation.test.js`·`tests/lesson-answer.test.js` 추가 | 제품·콘텐츠와 별도로 계약 기반 기대값 작성. 추가 소유 파일은 승인된 과정 표시명·출처 표시와 기존 교안 답안 공개 시점의 회귀 계약을 확인. 작성자는 최종 실행 검증과 통합 역할을 겸하지 않음 |
| `content_validator` | 없음 | 발췌·출처·의미 보존·기존 문항 연결·지원 수준·경험 카드의 새 E·변경 분류를 독립 확인 |
| `test_engineer` | 없음 | 검증 범위·기대값·필요한 focused 명령과 실제 브라우저·키보드·viewport 검증 |
| `project_integrator` | 없음 | 앞 단계 PASS와 전체 diff·보호 범위 확인 후 안전한 복제본 전체 gate 1회 |
| Git 담당 | 미배정·변경 권한 없음 | commit·push·PR·merge 없음 |

작성자·관리자와 최종 검증 역할은 분리한다. 같은 파일의 후속 수정은 총괄이 실제 diff를 확인한 뒤 순차로 소유권을 인계한다. 모든 밤위키·Code Quest 참고 경로와 `.git`은 변경 금지다. 코드·테스트·콘텐츠 담당은 서로의 소유 파일을 수정하지 않는다.

## 완료 조건과 검증 계획

- 두 서비스에 독립 진입하고 과목·키워드로 기존 문서·문제를 찾는다. 빈 목록의 해제 동작·현재 위치·저장 여부가 명확하다.
- 첫 JS 묶음에서 미채점 선택과 채점 후 해설 각각 개념→같은 탭 문서→문제 왕복이 가능하다. 문서 직접 진입·유효하지 않은 복귀 토큰에는 가짜 복귀 버튼이 없다.
- 새로고침·동일 origin 재실행에서 현재 문제·선택·채점·해설·위치·초점 상태가 복구되고 동일 답안을 중복 완료 기록으로 추가하지 않는다.
- 기존 교안·언어/단원 복습·Quest·코딩테스트·Web Project의 깊은 URL과 저장 기록을 보존한다. 저장 차단·데이터/콘텐츠 누락·유효하지 않은 상태는 실패 이유와 복구 동작으로 안내한다.
- 발췌는 승인된 기존 원문과 대조 가능하며 출처·안정 ID·문서 참조가 유효하다. 개인 맥락·비공개 기록·공개 금지 디자인을 제품에 반입하지 않는다.
- 실제 브라우저의 마우스·키보드, 320px·390px·데스크톱에서 모달 열기/닫기·focus 복귀·문서 왕복·긴 제목/보기/코드 읽기를 확인한다. 핵심 기능은 준비된 로컬 정적 자산만 사용한다.
- 각 작성·검증 역할은 영향 범위 focused 검사만 실행한다. 구체 명령·환경·결과는 아래 인계 기록에 추가하며 미실행 결과를 만들지 않는다.
- `project_integrator`는 통합된 최종 작업 상태의 안전한 복제본에서 `npm run check`를 한 번 실행한다. 실패하면 같은 snapshot을 반복 검사하지 않고 담당 역할로 반환하며, 실제 수정·독립 확인 후 새 최종 snapshot을 검증한다. 첫 FAIL 이력을 보존하고 수정 후 최종 gate와 구분한다. 원래 작업 폴더의 build 산출물·사용자 변경을 보존하며 에이전트는 Git 변경 명령을 실행하지 않는다.

## baseline과 실행 인계

- baseline: `/private/tmp/bam-first-use-baseline-20260912-_9oxxfa2/project`에 프로젝트 177파일 복제. `/private/tmp/bam-first-use-baseline-20260912-_9oxxfa2/manifest.json`에 모든 복제 파일 SHA·크기, 보호한 `.git`·원본 `dist` 1,476파일 SHA를 따로 기록했다.
- 기존 전체 untracked 상태이므로 위 baseline의 before/after와 새 파일 목록을 이번 변경 증거로 사용한다. 원본 자료·기존 파일 삭제나 Git 기준선 생성은 수행하지 않는다.
- 제품·발췌·테스트 인계, 독립 콘텐츠·실행 검증과 회귀 수정 후 최종 통합 PASS는 아래 증거를 따른다. 전체 gate는 첫 실패 snapshot과 수정된 최종 snapshot에서 각각 1회, 이 작업 합계 2회 실행했다.
- bam의 추가 판단: 이번 승인 범위를 넘는 새 콘텐츠·제품 선택이 생기면 정본과 실제 영향 근거로 반환한다. 이미 확정된 홈·독립 진입·사용자 편의·첫 개별 채점·문서 왕복을 다시 질문하지 않는다.


## 독립 검증과 실행 증거

### 콘텐츠 검증 — PASS

- 독립 보고서: `/private/tmp/bam-r1-independent-content-validation-20260912.json`.
- 기존 JS 교안 3개와 13문항에 연결된 개념 발췌 9개의 원문 일치·실제 heading·안정 ID·의미 연결·지원 설계·경험 카드를 확인했다. 기존 JS 본문·문항 파일은 baseline과 같고, curriculum 변경은 과정 표시명 한 줄뿐이다.
- `content/review-concepts.json` SHA-256: `f74306e33668b2b1919107b92d3eef44ed6e79e9d47e63dad5f5120f235e068e`.
- 발췌는 채점 전에도 참조할 수 있는 형성 복습 지원이며 새 교육 설명·문항·독립 숙달/T 성과를 생성하거나 입증하지 않았다. `js.control-flow` 발췌는 핵심 정리이고 switch·while의 세부 근거는 기존 전체 문서와 보기 해설에서 확인한다.
- 새 ECMAScript 사실 검증과 브라우저 실행은 이 콘텐츠 판정 범위가 아니다. 접수·원문 근거는 [발췌 기록](../content-reviews/2026-09-12-review-excerpts.md)에 둔다.

### 테스트 작성과 독립 실행 검증 — PASS

- 첫 통합 전 테스트 작성자는 6개 소유 파일에 계약 기반 기대값과 회귀 사례를 작성했다. 당시 diff·SHA는 `/private/tmp/bam-first-use-tests-author-final.diff`, `/private/tmp/bam-first-use-tests-author-final-manifest.json`이며 선택·초점 보완 명령 `node --test tests/app-independent-review.test.js tests/review-session-repository.test.js tests/focus.test.js tests/quiz-view.test.js`는 `/private/tmp/bam-first-use-tests-selection-focus.log`에서 41/41 PASS다. 작성자의 자체 결과를 독립 승인으로 사용하지 않았다.
- 독립 `test_engineer` 보고서: `/private/tmp/bam-first-use-independent-test-engineer-report.json`. Node `v24.17.0`, macOS `14.8.3` arm64에서 아래 focused 명령은 exit 0, 160/160 PASS, fail·skip 0이었다. 로그는 `/private/tmp/bam-first-use-independent-test-engineer-focused.log`다.

```bash
node --test tests/app-independent-review.test.js tests/review-session-repository.test.js tests/review-navigation.test.js tests/review-concepts.test.js tests/learning-catalog-view.test.js tests/quiz-view.test.js tests/navigation.test.js tests/app-quiz-review.test.js tests/app-shell.test.js tests/app-language-routing.test.js tests/app-view-lifecycle.test.js tests/accessibility.test.js tests/markdown.test.js tests/focus.test.js tests/browser-storage.test.js tests/progress-repository.test.js
```

- Codex 인앱 브라우저에서 `http://127.0.0.1:4189`의 원본 소스 개발 서버를 사용했다. 홈의 두 서비스, 문서 목록·과목과 콜백 검색·빈 검색 초기화, 콜백 1문항과 반환값 3문항의 선택·개별 채점·결과를 확인했다.
- 미채점 선택과 채점 후 네 보기 해설 펼침 각각 개념→해당 문서 절→문서 새로고침→문제 복귀와 문제 새로고침을 확인했다. 선택·채점·펼침·스크롤과 `quiz-related-concept` 초점이 유지됐고 직접 문서·잘못된 토큰 문서는 복귀 버튼을 제공하지 않았다.
- 실제 보기 카드 클릭과 Space 선택, 모달의 양끝 Tab·Shift+Tab 순환, Esc·배경 클릭 닫기와 트리거 초점 복귀를 확인했다. 초기 숨긴 1px radio 직접 도구 클릭 실패는 제품 선택 불능으로 확정되지 않았으며, 실제 label·Space 검증으로 정정했다.
- 320×780·390×844·1280×900과 기본 데스크톱에서 홈·목록·문서·문제·결과의 적용 범위를 확인했다. 문서 전체 가로 넘침이 없고 긴 코드·표는 내부 스크롤하며 모달 발췌·문서 버튼을 읽을 수 있었다. 마지막에 viewport override를 원복했다. 확인한 최종 흐름에는 console error·warning이 없었다.
- 이 브라우저·focused 검증 당시 소스·콘텐츠·테스트 SHA는 독립 보고서에 고정했다. 이후 통합 반환으로 바뀐 app 참조 1곳과 테스트 2파일의 최종 증거는 아래 회귀 수정 기록을 따른다. 모달 Tab 경계와 문서 복귀 초점, 선택 변경 시 저장 안내의 결함은 구현자에게 반환한 뒤 최종 focused·실제 흐름을 다시 확인했다.

### 검증 한계와 통합 인계

- 정확한 완료 기록 중복 수, 손상·버전/문항 변경, 저장 차단·용량 초과와 탭 충돌은 자동 focused 검사 근거다. 실제 브라우저의 저장 내용을 열거나 삭제하지 않았고 브라우저 고장 주입을 수행했다고 주장하지 않는다.
- 실제 브라우저에서 52문항 전부를 수동 채점하지 않았다. 첫 13문항·9개념의 링크·발췌·heading은 자동 전수 검사했고 실제 왕복은 위 1·3문항 묶음에서 확인했다. 학습 성과, 새 교육 사실 검증, 스크린리더 기기·실물 모바일, 설치 앱·네트워크 차단 오프라인 smoke는 미실행이다.
- R2 전부 보기·전체 채점·모름·헷갈림·문제별 불변 장기 이력, R3 복합 연결과 전과목 추가 반입은 미구현이다. 준비된 정적 파일을 로컬에서 사용한 증거와 설치형 오프라인 MVP 완료를 구분한다.
- `npm run check`와 build는 작성자·독립 실행 검증자가 수행하지 않았다. 별도 `project_integrator`의 첫 전체 gate와 보호 범위 결과는 아래에 기록한다. 에이전트가 Git 변경 명령을 실행하지 않았다는 사실을 `.git` 전체 바이트 불변으로 확대하지 않는다.
- 사용자 미리보기는 QA 기록과 origin이 다른 `http://localhost:4189/#/` 홈이다. 총괄이 두 서비스와 QA 진도 없는 홈을 직접 확인했다. 서버 명령은 `BAM_DEV_PORT=4189 node scripts/dev-server.mjs`이며 기존 기록용 `http://localhost:4175`는 덮어쓰거나 데이터를 이동하지 않았다. 같은 주소·브라우저 프로필을 유지해야 해당 기록을 이어 간다.


### 첫 통합 판정 — FAIL, 담당자 반환

- 독립 통합 보고서: `/private/tmp/bam-r1-integration-20260912-lyf7q3ue/integration-report.json`. 실행 snapshot은 같은 경로의 `project/`이며 원본 188개 소스 파일을 복제했다. Node `v24.17.0`, npm `11.13.0`, macOS `14.8.3` arm64에서 `npm run check`를 1회 실행했고 exit 1이었다. 로그는 `/private/tmp/bam-r1-integration-20260912-lyf7q3ue/npm-run-check.log`다.
- 콘텐츠 검증은 PASS, 테스트는 581개 중 577 PASS·4 FAIL·skip 0이었다. `&&` 연결이 테스트 실패에서 멈췄으므로 build는 **미실행**이다. 실패 결과를 통합 완료나 빌드 성공으로 기록하지 않는다.
- `tests/language-navigation.test.js` 1개는 승인된 과정 표시명 변경 전 기대값이었다. 나머지 3개는 `renderLesson`에 추가한 `window.location.hash` 직접 참조가 기존 격리 단위 환경에서 실패한 경우다. 구현자는 해당 참조를, 별도 테스트 작성자는 과정 표시명과 `tests/lesson-answer.test.js`의 기존 답안 공개 시점·개인 출처 경로/해시 비노출 기대값을 수정·검증하도록 반환받았다. 이는 새 기능 추가가 아닌 회귀 복구이며 별도 사용자 선택 gate를 추가하지 않는다.
- 통합자는 당시 코드·콘텐츠·테스트 13개 SHA와 고정 문서 8개 SHA를 대조했고, 로컬 문서 링크 293개에서 오류 0을 확인했다. gate 실행 전후 원본 소스 파일 변경·추가가 없었다.
- 원본 `dist` 82파일과 일반 Git 관리 파일 17개는 보호 검사에서 변경 0이었다. `.git`에서는 Codex 자동 checkpoint ref 1개 삭제·새 ref 1개와 관련 객체 41개 추가가 확인됐다. 사용자 branch·HEAD·원격 변경이나 에이전트 Git 변경 명령과 구분하며 `.git` 전체 불변을 주장하지 않는다. 상세 근거는 같은 통합 경로의 `protected-audit.json`이다.
- loopback 사전 검사에서 sandbox `EPERM`이 나왔으나 gate는 아직 시작하지 않은 상태였다. 승인된 임시 snapshot의 실행에서 첫 전체 gate를 수행했다. 원본 `dist` 빌드, Git 통합, 원격 CI·배포는 수행하지 않았다.
- 반환 뒤 담당자 회귀 수정 → focused 검사·독립 확인 → 수정된 새 snapshot에서 최종 `npm run check` 1회 → 최종 통합 PASS로 진행했다. 서로 다른 상태에서 실행한 첫 실패와 후속 성공은 전체 gate 합계 2회다. 이 절의 첫 FAIL 이력은 최종 성공과 별도로 유지한다.


### 회귀 수정 독립 검증 — PASS

- 보고서: `/private/tmp/bam-first-use-independent-repair-test-engineer-report.json`. 첫 통합 snapshot과 실제 diff를 대조했으며 제품 변경은 `src/app.js`의 `window.location.hash`를 `globalThis.window?.location?.hash`로 읽는 표현 한 곳뿐이다. 브라우저에서 같은 hash를 읽고, 격리 렌더링 환경에서는 기존 parser가 빈 route로 처리한다. 유효 토큰·세션·문항·문서 검증은 유지했다.
- 테스트 작성자는 승인된 과정 표시명 기대값 1곳과 출처 표시 테스트의 이름·assertion만 갱신했다. 기존 답안 공개 시점·교안 연결·escaping 기대값과 source fixture를 유지했고 `window`를 주입해 기존 격리 테스트를 우회하지 않았다.
- Node `v24.17.0`, macOS `14.8.3` arm64에서 아래 독립 focused 명령은 exit 0, 23/23 PASS, fail·skip 0이었다. 로그: `/private/tmp/bam-first-use-independent-repair-focused.log`.

```bash
node --test tests/lesson-answer.test.js tests/language-navigation.test.js tests/review-navigation.test.js tests/app-independent-review.test.js tests/review-concepts.test.js
```

- 기존 콘텐츠는 그대로이므로 독립 콘텐츠 PASS가 유지된다. 실제 브라우저에서 존재하는 `window.location`의 동작은 이 한 줄 수정으로 달라지지 않음을 검토했으며, 앞선 모달·키보드·320px/390px·왕복 증거를 유지했다. 이 회귀 수정 단계에서 브라우저 smoke를 다시 실행한 것으로 기록하지 않는다.
- 최종 제품 `src/app.js` SHA-256은 `1af8676c60925953ed379bb8dd3edcfb9ae2b6196d39ccce05911fb7d50c53bf`다. 테스트 작성자의 최종 8파일 manifest는 `/private/tmp/bam-first-use-tests-author-closure-manifest.json`이고 독립 회귀 검증자가 8/8 일치를 확인했다.

| 최종 테스트 파일 | SHA-256 |
| --- | --- |
| `tests/app-independent-review.test.js` | `c1fcf776a8a2a2c6b279719090e48dc8a7b68eca9be29647579d06b30a18568e` |
| `tests/review-session-repository.test.js` | `766683c3f4ee3dd4e7d967493c2f1c9d3e933168fa33216e68244f8175adcd7d` |
| `tests/review-navigation.test.js` | `10eb33c62790ac6324829c882bbeb979c04663ec50e30f918e207198cf68bdd4` |
| `tests/review-concepts.test.js` | `cc5dabbffd21850389073d0cb74115a4575214e7fcec318afb546319afe8d481` |
| `tests/learning-catalog-view.test.js` | `216812392ce2b84ebd9eb8fcf0c6f55a6d8103b874adfe4d3e18c1328b0c6734` |
| `tests/quiz-view.test.js` | `3c75711b37b915a5f5b20a992bb80bd4409f22c2335a9c3ee71c66db58b66fc9` |
| `tests/language-navigation.test.js` | `2db373d2be81c6e142141e923237d3fc126f4af31e1d89ccf1addf5fa3a5ab17` |
| `tests/lesson-answer.test.js` | `95f75220ca159564d9d587ce47830167e8eac82274e9b2bd4975e272869babb1` |


### 최종 통합 판정 — PASS

- 독립 보고서: `/private/tmp/bam-r1-integration-final-20260912-ui4aeo1g/integration-report.json`. 최종 snapshot은 같은 경로의 `project/` 188개 소스 파일이다. Node `v24.17.0`, npm `11.13.0`, macOS `14.8.3` arm64에서 `npm run check`를 최종 snapshot에 1회 실행해 exit 0이었다. 첫 FAIL을 포함한 이 작업의 전체 gate 실행은 합계 2회다.
- 실제 로그 `/private/tmp/bam-r1-integration-final-20260912-ui4aeo1g/npm-run-check.log`에서 콘텐츠 검증 PASS, 테스트 **581/581 PASS·fail 0·skip 0**, 정적 build 완료를 확인했다. 콘텐츠 수량은 기존 교안 34·객관식 52·Quest 18·코딩테스트 6·Web Project 1을 유지했다.
- build는 임시 snapshot의 `project/dist/`에만 생성했고 89개 산출물 모두 소스 SHA와 일치했다. gate 전후 원본 소스 변경·추가 0, 복제 소스 변경 0이었다. 원본 `dist` 82파일과 일반 Git 관리 파일 17개도 변경 0이며 `.git` 전체 바이트 불변은 주장하지 않는다. Codex 자동 checkpoint·객체 차이는 앞선 보호 검사와 같은 범위다. 세부 근거는 최종 통합 경로의 `protected-audit.json`이다.
- 통합자는 독립 콘텐츠·브라우저·160개 focused·23개 회귀 수정 증거와 전체 diff를 확인했고 미해결 finding 0, 로컬 문서 링크 293개 오류 0을 보고했다. 최종 실행은 확인된 loopback sandbox 제한 때문에 승인된 임시 snapshot에서 진행했다. 에이전트가 Git 변경 명령을 실행하거나 원본 `dist`를 재빌드하지 않았다.
- 통합자는 새 브라우저 smoke를 실행하지 않았고, 위 실제 브라우저·회귀 검토 증거를 사용했다. 총괄은 최신 원본 소스로 사용자용 `http://localhost:4189/#/` 홈을 새로고침해 두 서비스와 QA 진도가 없는 상태를 별도 확인했다. 이 홈 확인을 52문항 전체·실물 기기·설치형 오프라인 검증으로 확대하지 않는다.
- 최종 증거 마감은 이 작업 카드 한 파일에만 적용한다. 다른 정본 7개·제품·테스트·콘텐츠는 최종 gate 상태로 동결하고, 통합자는 카드의 증거 변경과 소스 SHA·링크를 확인한다. 전체 gate를 다시 반복하지 않는다. R2/R3, 설치·네트워크 차단·스크린리더 기기·실물 모바일·원격 CI·commit·PR·merge·배포의 미실행 한계는 위 기록대로 유지한다.
