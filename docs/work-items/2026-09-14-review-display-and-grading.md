# 객관식 보기 방식과 채점 방식의 첫 확장

## 범위와 선행 계약

- 작업 ID: `2026-09-14-review-display-and-grading`.
- 유형: 일반 제품 기능·코드. 기존 문항·학습 목표·정답·보기별 근거는 불변이며 새 콘텐츠 경험·소급 감사가 아니다.
- 근거: `DEC-KEYWORD-REVIEW-01`, `DEC-REVIEW-GRADING-01`과 2026-09-14 bam의 후속 구현 지시. R2 첫 묶음으로 하나씩/전부 보기와 개별/전체 채점만 구현한다.
- 사용자 문제: 현재 한 문항씩 채점해야 다음 문항으로 갈 수 있어 여러 문항을 펼쳐 읽거나 답을 모은 뒤 확인하는 방식을 선택할 수 없다.
- 정본: [사용자 흐름](../designs/lesson-review.md#보기-방식과-채점-방식의-첫-확장), [v1 데이터 계약](../content-schema.md#보기채점-방식의-v1-확장), [일반 제품 기능 절차](../development-workflow.md#일반-제품-기능-또는-코드-변경).
- 기존 상태: 승인된 콘텐츠·sidebar·JS/Java 후속 변경을 포함한 현재 미커밋 작업물을 보존한다. 이 작업의 기준 snapshot은 `/private/tmp/bam-review-modes-start.json`이며 이전 묶음의 검사 통과를 이번 변경의 통과로 재사용하지 않는다.

## 소유권과 순서

| 역할 | 쓰기 경로 | 인계 조건 |
| --- | --- | --- |
| 제품·설계 문서 담당 | 이 카드, `docs/designs/lesson-review.md`, `docs/content-schema.md`, `docs/roadmap.md`, `docs/README.md`, `README.md`, `docs/architecture.md`의 문항 DOM ID 보안 문장 1곳 | 선행 계약 기록 후 구현 시작. 실제 diff와 검증 증거에 따라 최종 상태만 갱신 |
| 제품 구현자 | `src/app.js`, `src/ui/quiz-view.js`, `src/repositories/review-session-repository.js`, `styles/app.css` | 기존 코드·저장소를 확장하고 focused 결과와 diff 인계 |
| 테스트 작성자 | `tests/quiz-view.test.js`, `tests/review-session-repository.test.js`, `tests/app-independent-review.test.js` | 요구의 네 조합·보존·실패 경계 기대값과 focused 증거 인계 |
| 독립 `test_engineer` | 저장소 쓰기 없음 | 제품·테스트 기대값 감사, 필요한 데스크톱·키보드·복구 확인 |
| 독립 `project_integrator` | 저장소 쓰기 없음 | 앞 단계 증거·전체 diff·문서 정합성 대조, 안전한 복제본에서 최종 `npm run check` |

총괄은 읽기 전용이다. 겹치는 파일을 병렬 수정하지 않으며 결함은 해당 작성 역할로 반환한다. `content/`, 밤위키, 다른 제품·저장소, 의존성·빌드·CI·Git은 변경하지 않는다. 이번 Git 커밋·게시·병합 권한은 없다.

## 관찰 가능한 완료 조건

1. 기본 하나씩·개별 채점으로 바로 시작하고, 두 보기와 두 채점 방식을 각각 전환할 수 있다. 전부 보기에는 현재 고정 범위의 제목·개수와 동일 문제카드를 세로로 표시한다.
2. 네 조합에서 같은 세션·문항 순서·선택·채점·해설 펼침을 유지한다. 전부 보기의 radio·해설·개념 동작은 다른 카드의 상태를 바꾸지 않는다.
3. 하나씩·전체 채점에서는 미채점 문항 사이를 이동해 답을 모을 수 있다. 전체 채점은 선택한 미채점 문항만 처리하고 미응답·기채점은 제외하며 처리 수와 미응답 수를 안내한다.
4. 모든 문항이 채점된 뒤 사용자가 결과 보기를 선택할 때 기존 결과·완료 저장을 한 번만 수행한다. 모드 변경·문서 왕복·새로고침은 추가 완료 시도가 아니다.
5. 전부 보기의 비첫 카드에서도 실제 문항에 맞는 개념·문서를 열고 같은 문항·스크롤·초점으로 돌아온다. 직접 문서에는 복귀가 없으며 기존 토큰·콘텐츠 변경 검증을 유지한다.
6. 기존 v1 저장은 새 필드가 없어도 복구되고 낯선 보기/채점 값은 안전한 기본값으로 읽는다. 감지한 다중 탭 변경·저장 실패와 다른 진도 보존을 확인한다.
7. 기존 semantic token·코드 escape·키보드 조작·텍스트 상태 안내를 유지한다. 로컬 정적 자산과 저장소만 사용하고 모바일 구현·검사, 새 문항, 모름·헷갈림·즉시 재도전·버전 이력·v2·Java 실행·설치 앱은 추가하지 않는다.

## 검증과 현재 상태

`[현재 사실]` 지정한 제품 4파일과 테스트 3파일을 반영했다. 작성자 검사, 반환 수정 후 독립 `test_engineer`와 최종 `project_integrator` 판정을 모두 통과했다. 이전 JS·Java 묶음의 637/637 통과는 이번 제품 변경의 통과 증거가 아니다.

| 단계 | 실행과 결과 | 의미와 한계 |
| --- | --- | --- |
| 제품 구현자 | 수정 JS 3파일 `node --check`, 제품 4경로 `git diff --check` 통과. 실제 JS 3문항 render probe로 네 조합의 고유 ID·radio·label/aria 관계와 미채점 정답 비노출 확인 | 작성자 focused이며 브라우저·전체 suite 판정과 구분 |
| 테스트 작성자 최초 | `node --test tests/quiz-view.test.js tests/review-session-repository.test.js tests/app-independent-review.test.js tests/app-quiz-review.test.js tests/accessibility.test.js` → 83개 중 82개 통과·1개 실패 | 새 왕복 fixture가 캐시만 바꾸고 실제 fetch 경계에 다른 문항을 반환해 실패 |
| 테스트 반환 수정 | 해당 fixture를 fetch 경계에 주입한 뒤 1개 재실행에서 dialog rectangle stub 누락으로 실패. 같은 테스트 stub 보완 뒤 `node --test --test-name-pattern='전부 보기 두 번째 카드' tests/app-independent-review.test.js` → 1/1 통과 | 제품·계약·기대값 변경 없음. 앞선 82개와 수정된 1개의 통과 증거이며 최종 상태에서 83개를 전부 재실행했다고 주장하지 않음 |
| 독립 `test_engineer` | PASS. 별도 로컬 origin의 1280×720 데스크톱에서 네 조합·부분 채점·키보드·비첫 카드 문서 왕복·새로고침·결과 복구 확인 | 하단 채점 안내와 뒤쪽 문항의 보기 전환 초점이 화면 밖에 있던 최초 두 결함은 수정 후 실측 통과. 전체 보기 제목을 범위 개수로 표시하고 성공 안내의 중복 live/announce를 제거한 구조·단일 테스트도 확인 |
| 독립 `project_integrator` | PASS. `/private/tmp/bam-review-modes-integration-qnickcvs/workspace`에서 `npm run check` 1회 → exit 0, 645/645 통과·실패 0·skip 0, 콘텐츠 검사·정적 빌드 통과 | 승인된 데스크톱 smoke는 독립 검증 증거를 재사용. 원본 파일·dist·Git 상태와 복제본 정적 입력 보존 확인 |

최종 전체 검사는 교안 133개·객관식 157문항·Quest 18개·코딩테스트 6개·Web Project 1개를 확인했다. 복제본의 빌드 191파일은 현재 정적 입력 SHA·모드와 일치했고 검사 전후 원본 384파일·dist·HEAD·branch·index·status는 같았다. 원시 로그는 `/private/tmp/review-modes-integration-check.log`, 보존 결과는 `/private/tmp/review-modes-integration-preservation.json`에 기록했다.

마지막 성공 채점 안내는 사용 위치의 상태 문구에 초점을 주고 화면 안으로 이동하는 한 경로로 정리했다. 상단 live 속성·성공 중복 announce 제거 후 `node --test --test-name-pattern='전부 보기의 비연속 선택' tests/app-independent-review.test.js`가 1/1 통과했으며 무선택·실패 안내는 유지했다. 독립 UI의 문서 왕복·새로고침에서 선택·펼침·스크롤·초점이 유지됐고 2/4 결과 복구도 확인했다. 결과 저장 1회는 자동 기대값으로 검증했으며 실제 스크린리더 발화를 관찰한 것으로 표현하지 않는다.

제품은 같은 문항 카드·ID를 재사용하고 실제 동작한 카드로 문항을 식별한다. 긴 전부 보기 목록 끝에도 전체 채점을 제공하며 결과 보기는 전 문항 채점 후 사용자가 선택한다. 기존 완료 중복·충돌 방어를 유지한다. 테스트는 새 8개(view 2·repository 2·app 4)를 추가하고 기존 기대값을 보존/조정했다. 기존 파일의 모바일 메뉴·좁은 화면 단위 fixture가 회귀 실행에 포함됐지만 새 모바일 구현이나 실제 모바일 화면 PASS는 아니다.

보안 정본은 실제 `validateQuizCollection`의 `quiz-<language>-...` 형식·중복 검사와 일치하도록 문항 DOM ID 문장 1곳만 명확히 했다. 검증된 문항 ID+역할 접두사/접미사와 속성 escape를 쓰고 임의 HTML·CSS 선택자 삽입 금지와 나머지 평가·저장 안전 경계는 유지한다.

비교 자료는 `/private/tmp/review-modes-docs/start-verified/`와 `before-final/`, `baseline-manifest.json`에 보존했다. 시작 사본은 선행 설계 변경을 역으로 제거한 뒤 총괄의 시작 SHA와 바이트 일치를 확인했고, `before-final`은 이번 상태 갱신 직전의 실제 사본이다. 새 카드는 시작 시 존재하지 않았다. 제품·테스트 원시 diff와 검사 로그는 각각 `/private/tmp/review-modes-implementation.diff`, `/private/tmp/review-modes-tests.diff` 및 담당 역할의 보고 위치에 보존하며 정본에는 필요한 결과만 기록한다.

데스크톱 웹만 실제 화면 확인 대상이다. 새 교육 콘텐츠·Java 실행·모바일·설치형 MVP·Git 게시 검사는 이번 범위가 아니다. 실제 스크린리더·브라우저 저장 차단 주입·완전 동시 탭 경합과 콘텐츠 전수 재감사는 실행하지 않았다. 기존 저장 장애·충돌·서명 변경·완료 중복은 Node 기대값으로 확인했다. 이번 R2 첫 묶음은 로컬 구현 완료이며 나머지 R2 기록 기능과 Git 게시 완료를 뜻하지 않는다.
