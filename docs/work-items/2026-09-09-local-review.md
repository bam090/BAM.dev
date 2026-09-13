# 2026-09-09 로컬 학습 문서·객관식 복습

## 작업 카드

- 작업 ID·유형: `2026-09-09-local-review` / 학습 콘텐츠 포함 기능 / 새 경험과 기존 UI 연결 보완.
- 우선 목표: bam이 이미 작성한 문서를 읽고 그 범위의 객관식을 풀어 실제 복습을 시작한다. 설치형 전체 MVP·프런트엔드 전환·전체 문서 정비는 이 작업의 완료 조건이 아니다.
- 현재·목표 정본: [학습 문서와 객관식 복습](../designs/lesson-review.md). 데이터 형식은 [콘텐츠 스키마](../content-schema.md), 역할·gate는 [개발 파이프라인](../development-workflow.md)을 따른다.
- 입력: 현재 저장소 코드·콘텐츠·테스트·Git, 보관함/profile 적용 규칙, 밤위키 관리·사용·index와 관련 실제 결과, 기존 학습 문서 중 반입 후보. 위키 계획과 과거 대화는 구현 완료 근거로 삼지 않는다.
- 첫 콘텐츠와 확장: JavaScript 함수 원문 한 단원으로 전체 흐름을 확인한 뒤 값과 실행 흐름·배열과 객체로 확장했다. 실제 단원·수량·실행 바로가기는 [README](../../README.md#바로-복습하기), 원문 해시·문항 경험·공식 근거는 [콘텐츠 기록](../content-reviews/2026-09-09-local-review.md)이 정본이다.
- 완료 조건: 정본의 사용자 행동 전부, 완료 기록의 재접속 유지, 미응답·빈 문항·로드 실패 처리, 필요한 회귀 검사와 독립 gate.
- 접근성·모바일·오프라인·데이터: 기존 키보드·focus·안전 Markdown을 유지하고 좁은 화면과 동일 origin 저장을 확인한다. 원본·기존 ID·진도 보존. 미완료 세션 재개·원격 동기화·백업은 제외.
- 금지: 옵시디언 원본 수정, 사적 경험·공개 금지 파일 반입, 비범위 제품 확장, 의존성 설치, 빌드·CI 변경, Git 쓰기·외부 공개·배포·결제.

## 경로 소유권과 순서

| 임시 역할 | 허용 쓰기 경로 | 순서·인계 |
| --- | --- | --- |
| 제품·설계 문서 담당 | `docs/designs/lesson-review.md`, 이 작업 카드, `docs/README.md`, `README.md`, `docs/content-schema.md` | 설계 선행 후 구현에 인계. 실제 코드·콘텐츠와 검증 증거를 받은 뒤 문서 상태 갱신 |
| 학습 문서 관리·콘텐츠 생성 | `content/curriculum.json`, 이번 반입 교안, 해당 객관식 컬렉션, `docs/content-reviews/` 이번 기록 | 원문 보존·출처/해시·경험 근거와 문항을 인계. 다른 경로 수정 금지 |
| 제품 구현 | `src/`, `styles/`, `content/schema/`, `scripts/validate-content.mjs` | 설계 후 기존 경계 안에서 구현. 테스트·문항 파일 수정 금지 |
| 테스트 작성 | `tests/`의 이번 영향 범위 | 구현자와 분리한 기대값. focused 검사 결과와 미실행 범위 인계 |
| `content_validator` | 없음 | 생성자와 독립, 콘텐츠·원문·공식 출처·정답 유일성·해설·범위·중복 판정 |
| `test_engineer` | 없음 | 콘텐츠 PASS 뒤 결합 상태의 focused 테스트·브라우저·기록 재접속 검증 |
| `project_integrator` | 없음 | 앞 두 PASS 뒤 전체 범위·문서·경로·증거 검토, 안전한 복제본에서 최종 `npm run check` 한 번과 필요한 smoke |
| 총괄 orchestrator | 없음 | 실제 파일·diff·명령을 독립 대조하고 단계 전환·실패 반환 |

겹치는 파일은 병렬 수정하지 않는다. 소유권을 바꿀 필요가 생기면 선행 역할 인계와 총괄의 실제 diff 검토 후 순차 할당한다. 작성·관리 역할은 검증 세 역할을 겸하지 않는다. 결함은 콘텐츠/제품/테스트/문서의 해당 최초 단계로 반환하며 설명·정답에 영향이 있으면 콘텐츠 검증부터 다시 확인한다.

콘텐츠 작성 완료와 총괄의 실제 diff 확인 뒤 `docs/content-reviews/2026-09-09-local-review.md`의 마지막 검증 인계 상태만 문서 담당에게 순차 인계했다. 문제·원문·경험 카드·작성자 검사 기록은 문서 담당의 수정 범위가 아니다.

최종 변경은 아래 32개 파일이다. 콘텐츠 기록의 마지막 상태 인계는 같은 파일의 순차 작업이므로 문서 수에 중복 집계하지 않는다.

| 분류 | 실제 변경 파일 |
| --- | --- |
| 제품·형식·검증 코드 10개 | `src/app.js`, `src/core/content.js`, `src/core/navigation.js`, `src/core/quiz.js`, `src/ui/quiz-view.js`, `src/ui/markdown.js`, `styles/app.css`, `content/schema/curriculum.schema.json`, `content/schema/quiz.schema.json`, `scripts/validate-content.mjs` |
| 테스트 11개 | 새 `tests/app-quiz-review.test.js`; 기존 `tests/app-language-routing.test.js`, `tests/navigation.test.js`, `tests/quiz-core.test.js`, `tests/quiz-view.test.js`, `tests/quiz-content.test.js`, `tests/content.test.js`, `tests/lesson-answer.test.js`, `tests/markdown.test.js`, 반환 후 수정한 `tests/accessibility.test.js`, `tests/language-navigation.test.js` |
| 콘텐츠와 근거 6개 | `content/curriculum.json`, `content/quizzes/javascript.json`, `content/lessons/javascript-notes/values.md`, `content/lessons/javascript-notes/functions.md`, `content/lessons/javascript-notes/collections.md`, `docs/content-reviews/2026-09-09-local-review.md` |
| 제품 문서 5개 | `README.md`, `docs/README.md`, `docs/content-schema.md`, `docs/designs/lesson-review.md`, 이 작업 카드 |

## 검증 계획

반복 중에는 교안·퀴즈 스키마/참조, 단원 route·filter, 채점·해설, 저장·오답 범위와 관련 회귀만 검사한다. 정확한 명령·실행 환경·통과 수·미실행 범위는 실행한 역할의 증거를 받아 아래에 기록한다. 통합 gate의 build가 기존 `dist/`를 재생성하므로 `project_integrator`는 안전한 복제본에서 실행한다.

브라우저 smoke는 첫 단원 본문→단원 복습→미응답 안내→정답/오답 채점→네 선택지 해설과 근거 문서→결과→오답만 재풀이→동일 origin 재접속 기록, 문제 없음·로드 실패, 키보드·좁은 화면을 포함한다. 이후 확장 단원도 본문·문항 연결과 필요한 검사를 확인한다. 준비된 콘텐츠를 읽고 푸는 데 외부 API·원격 호출을 요구하지 않는지 확인한다.

## 현재 증거 상태

`[현재 사실]` 원문 반입, 단원별 복습과 저장 결과·오답 재진입 구현을 마쳤고 독립 콘텐츠·실행·최종 통합 검증을 통과했다. bam은 README 실행 안내로 수록 문서를 읽고 문제를 풀 수 있다. 완료 범위는 이 로컬 복습 기능이며 설치형 전체 MVP나 Git 통합 완료가 아니다.

- 문서 수정 전 안전 snapshot: `/tmp/bam-review-docs.uIhOf3`의 `root-README.md`, `docs-README.md`, `content-schema.md`.
- 최종 문서 보강 직전 snapshot: `/tmp/bam-review-docs-final.WbT3tr`. 이는 로컬 작업 보호 사본이며 장기 배포 자료가 아니다.
- `[현재 사실]` 착수 시 Git은 `codex/js-foundation`의 첫 커밋 전 상태이고 작업 파일이 모두 untracked다. 이번 작업은 기존 파일을 보존하며 Git 쓰기·commit·push·PR·merge를 하지 않는다. 원격 CI 통과나 `dev` 통합 성과를 주장하지 않는다.
- Git·CI 목표 흐름은 [기존 개발 파이프라인](../development-workflow.md#gitci와의-연결)을 유지한다. 이번 로컬 사용 검증과 원격 통합 승인은 별개다.
- 총괄은 이번 저장소를 `BAM_DEV_PORT=4175 npm run dev`로 실행해 `http://localhost:4175` 응답을 확인했다. 기존 4173 서버는 다른 저장소의 실행이므로 변경하지 않았다. 기존 origin의 사용자 진도는 초기화하지 않으며, QA는 별도 origin 또는 임시 프로필로 격리한다.

## 독립 검증 인계

| 단계 | 판정 | 확인한 범위·증거 |
| --- | --- | --- |
| `content_validator` 첫 단원 | PASS | 함수 문항의 정답 유일성·네 선택지 해설·원문 범위·중복·공식 ECMA-262 근거. 독립 실행 결과 11개 assertion과 구조 30개 검사. 원문 바이트·해시 보존 확인 후 확장에 인계 |
| `content_validator` 확장 포함 최종 묶음 | PASS | 전 신규 문항의 구조·학습 목표·정답·해설·범위·중복을 독립 대조. 세 원문/반입본 바이트·SHA 동일, 기존 JavaScript 문항과 첫 함수 문항 불변. 추가 문항의 독립 결과 34개 assertion 통과 |
| `test_engineer` | PASS | 최종 문항 전부 실제 Chrome 제출, 탭 재열기·로컬 서버 실제 종료/재시작 후 기록 유지, 키보드·좁은 화면·대표 오류·기존 실행 문제 회귀. 아래 독립 실행 증거 참조 |
| `project_integrator` | PASS | 최초 전체 gate의 기존 테스트 기대값 실패를 테스트 작성에 반환하고 독립 재검증 후 수정된 통합 상태에서 전체 `npm run check` 통과. 콘텐츠 검증·549/549 테스트·정적 빌드 완료, 범위·문서·Git 보존 검토 |

콘텐츠 독립 검사 환경은 Node `v24.17.0`이다. 검증자는 임시 스크립트 파일을 만들지 않고 `node --input-type=module` 인라인 읽기 전용 `fs`·`crypto`·`assert` 검사와 `node:vm.runInNewContext`(1초 제한)로 실제 문항 코드를 대조했다. 독립 스크립트가 저장소에 제공됐다는 뜻은 아니다. 기술적 근거는 콘텐츠 기록의 TC39 공식 고정판 링크에서 확인한다. 첫 단원과 확장 단계의 검사는 다른 시점·일부 겹치는 범위이므로 숫자를 합산해 테스트 총량으로 표현하지 않는다.

## 독립 실행 증거

`test_engineer`가 Node `v24.17.0`에서 다음 focused 검사를 실행했다.

```bash
node --test tests/app-language-routing.test.js tests/app-quiz-review.test.js tests/content.test.js tests/lesson-answer.test.js tests/markdown.test.js tests/navigation.test.js tests/quiz-content.test.js tests/quiz-core.test.js tests/quiz-view.test.js tests/progress-repository.test.js tests/app-code-quest-draft.test.js tests/app-coding-test.test.js
```

결과는 143/143 통과, 실패·취소·skip 0이다. 실제 Chrome에서 확인한 범위는 다음과 같다.

- 세 단원의 신규 문항 전부 제출: 값과 실행 흐름 3/4 → 탭을 닫았다 다시 열어 저장된 3/4 확인 → 오답 한 문항 재풀이 1/1 → 오답 0. 함수 5/5. 배열과 객체 3/4와 오답 한 문항. 단원별 결과·오답이 서로 섞이지 않았다.
- 새 탭 근거 교안, 학습 목표·모든 선택지 해설, 미응답 안내·채점 버튼 비활성, 연결된 문제 없는 단원, 잘못된 단원 오류와 복귀를 확인했다. Space·Enter 키보드 조작과 채점·결과 초점 이동을 확인했다.
- 320px·390px 화면에서 문서 전체의 가로 overflow 0을 확인하고 viewport를 원복했다. 확인한 Chrome 로그에서 warnings/errors는 0이었다.
- 기존 Code Quest의 배송비 문제는 공개 Worker 평가 6/6, 기존 코딩테스트의 목표 단어 세기 문제는 공개 제출 6/6을 확인했다.
- 총괄이 이 저장소의 실행 세션 `1750`을 `Ctrl+C`로 실제 종료하고 같은 작업 경로에서 `BAM_DEV_PORT=4175 npm run dev`로 다시 실행했다(세션 `60152`). 그 뒤 검증자가 같은 QA 주소를 재로드해 배열과 객체의 최근 3/4·오답 한 문항·저장 날짜가 유지됨을 확인했다.

브라우저 검증은 별도 QA origin `http://127.0.0.1:4175`에서만 수행했다. QA 기록은 객관식 시도 4개·Quest 시도 1개·코딩테스트 제출 1개이며 사용자 `http://localhost:4175`의 기존 기록과 다른 저장소의 4173 서버는 변경하지 않았다.

HTTP 404·깨진 JSON·콘텐츠 계약 실패·저장 실패 시 결과 보존과 경고·미응답 비저장·다른 단원 오답 보존의 실패 주입은 **Node 테스트 harness**에서 통과했다. 실제 브라우저의 네트워크·quota 설정을 변경한 검사는 아니다. 브라우저 탭 재열기와 Node 서버 프로세스 재시작은 확인했지만 Chrome 전체 프로세스 종료·설치 앱 실행·OS별 패키지 검증은 수행하지 않았다.

## 통합 검증과 실패 반환

`project_integrator`는 사용자 작업 경로의 `dist/`를 재생성하지 않도록 안전한 복제본에서 `npm run check`를 실행했다. 전체 gate는 **최초 통합 상태 한 번, 실패 반환 후 수정된 통합 상태 한 번으로 총 두 번** 실행했다. 변경 없는 상태에서 전체 suite를 반복한 것이 아니다.

1. 최초 `/tmp/bam-review-integrated-drYeGr`에서는 콘텐츠 검증이 통과했지만 전체 테스트 548개 중 546개 통과·2개 실패였다. 실패는 `tests/accessibility.test.js`의 구식 소스 정규식 기대와 `tests/language-navigation.test.js`의 고정 과정 수 기대였다. `&&` 연결에 따라 이 시도의 build는 실행되지 않았다. 실패 로그 `/tmp/bam-review-integrated-drYeGr/check.log`는 보존했다.
2. 테스트 작성자에게 두 파일만 반환했다. 수정 전 snapshot은 `/tmp/bam-review-test-fix.zrm7bR`이다. 실패 검사를 삭제하거나 무력화하지 않고 실제 `openRoute` 다섯 사례·오답 재시도 두 모드, 정확한 여섯 과정 route·상태·`aria-current`를 관찰하도록 기대값을 강화했다.
3. 독립 `test_engineer`가 `node --test tests/accessibility.test.js tests/language-navigation.test.js tests/app-language-routing.test.js tests/app-quiz-review.test.js`를 실행해 34/34 통과를 확인했다. 최초 통합 snapshot 대비 `src/`·`content/`·`styles/`는 바뀌지 않아 앞 Chrome 전체 흐름·서버 재시작 검증의 대상 코드·콘텐츠가 유지됨을 확인했다.
4. 승인된 수정 상태를 `/tmp/bam-review-integrated-final-PxhEEB`에 복제한 뒤 Node `v24.17.0`에서 `npm run check`를 실행했다. 종료 코드 0, 콘텐츠 검증 통과, 전체 테스트 **549/549 통과·실패/취소/skip 0**, 정적 `dist/` 빌드 완료를 확인했다. 검증한 콘텐츠 집계는 README 현재 수량과 일치했다.

최종 전체 로그는 `/tmp/bam-review-integrated-final-PxhEEB/check.log`(56,832바이트)이며 SHA-256은 `64e86c755b8ef60243581f7f52faa79f1162bcd9d4689ee505e7740d5e9cad99`다. 원본 작업 경로의 `dist/`, Git 상태와 의존성 설치 상태는 변경하지 않았다. 이후 이 작업 카드의 결과 기록만 갱신하며, 통합 담당은 마지막 Markdown diff·링크를 확인하고 코드·콘텐츠가 불변인 상태에서 전체 gate를 다시 실행하지 않는다.

## 작성자 검사와 총괄 관찰

테스트 작성자가 Node `v24.17.0`에서 실행한 focused 명령은 다음과 같다. 독립 `test_engineer`의 승인과 구분한다.

```bash
node --test tests/app-quiz-review.test.js tests/app-language-routing.test.js tests/navigation.test.js tests/quiz-core.test.js tests/quiz-view.test.js tests/quiz-content.test.js tests/content.test.js tests/lesson-answer.test.js tests/progress-repository.test.js tests/algorithm-lessons.test.js tests/extension-content.test.js tests/app-view-lifecycle.test.js
```

결과: 120/120 통과. 단원 route·범위, 원문 metadata·줄바꿈·해설, 완료 시도·오답 저장·최근 결과, 기존 교안과 뷰 수명주기를 포함한다. 별도의 `node --test tests/markdown.test.js tests/quiz-view.test.js tests/lesson-answer.test.js`도 39/39 통과했지만 위 검사와 겹치므로 합산하지 않는다. 생성자의 코드 결과·원문 보호 검사 이력은 콘텐츠 기록에만 둔다.

총괄은 첫 함수 단원에서 문서→객관식→4/5 결과→재로드 후 최근 4/5→저장 오답 한 문항→재풀이 1/1→오답 0을 실제 브라우저로 확인했다. 이것은 확장 진행을 위한 실제 산출물 대조이며 독립 실행·통합 gate의 대체가 아니다. 사용자 `localhost:4175`의 기존 진도를 초기화하지 않고 QA는 `127.0.0.1:4175` 또는 임시 프로필에서 격리한다.

문서 담당은 위 여섯 문서의 로컬 링크 109개와 Markdown 제목 anchor 19개를 Node `fs`·`path` 인라인 검사로 대조해 누락 0을 확인했다. `content/curriculum.json`과 모든 객관식 JSON의 실제 집계를 README 수량과 대조했다. `git diff --check`는 통과했지만 전체 파일이 untracked여서 이번 변경의 공백·보존 검증을 대신하지 않는다. 문서 상태·역할 충돌의 독립 판단은 통합 검토에 인계한다.

## 제공 한계와 남은 작업

- 원문은 그대로 열람하지만 객관식은 README에 명시한 판단만 다룬다. 원문의 모든 개념·후속 단원·보관함 전체를 평가하거나 반입한 것은 아니다.
- 완료 시도만 동일 origin·브라우저 프로필에 유지한다. 진행 중 선택, 기기 간 동기화·백업, 사이트 데이터 삭제 후 복구는 지원하지 않는다.
- 이번 결과는 Node 로컬 서버에서 사용하는 복습 기능이며 설치 파일·공식 OS 지원·Java runner·React 전환은 완료하지 않았다.
- 독립 콘텐츠·실행·최종 통합 검증이 통과해 수록된 로컬 복습 흐름은 사용할 수 있다. 이후 학습 범위 확대나 설치형 전환은 별도 작업이다. 원격 CI·PR·`dev` 통합은 이번에 수행하지 않았다.
