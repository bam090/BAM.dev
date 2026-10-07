# 기본순열 단계 실험실 작업 카드

- **작업 ID·유형:** `BACKTRACKING-TRACE-20261007`, 학습 콘텐츠 포함 기능·새 경험입니다.
- **설계 정본·MVP 이유:** [기본순열 단계 실험실](../designs/lesson-review.md#2026-10-07-기본순열-단계-실험실)의 경험 카드·화면 계약·수용 기준을 따릅니다. 새 알고리즘이나 전이 성과는 주장하지 않습니다.
- **현재 상태:** 선행 설계·경험 카드에 따라 202개 snapshot과 문서 부속 native dialog를 구현했습니다. 콘텐츠 독립 검토는 PASS이며 실행 검증의 세부 범위는 아래 인계에 기록합니다. 독립 실행 검증도 PASS이며 통합 판정은 아직 받지 않았습니다.
- **사용자 승인:** `dev` 기반 `codex/` 실험 브랜치에서 고정 `nums = [1,2,3]`의 내장 실험실을 구현합니다. 현재 작업 브랜치는 `codex/permutation-trace-lab`입니다.
- **경로 소유권:** 설계 담당은 이 카드와 `docs/designs/lesson-review.md`의 해당 절만 수정합니다. 제품 담당은 총괄이 지정한 `src/`·`styles/` 경로, 독립 테스트 작성자는 총괄이 지정한 `tests/` 경로를 맡습니다. 설계 인계 후 구현하고 변경 경로가 겹치면 선행 담당 인계 후 순차 수정합니다.
- **변경 금지:** 기존 `content/` 학습 교안·문항·진도 데이터, Java 17 runner·평가 계약·로그인·개인 Sites와 공유 설정·의존성은 바꾸지 않습니다. 전체 UI 개편·임의 Java 실행·배포·PR·merge는 하지 않습니다.
- **입력 정본:** `AGENTS.md`, `docs/README.md`, `docs/development-workflow.md`, `docs/learning-content-design.md`, `docs/lesson-authoring.md`의 한국어 기준, 현재 브라우저 아키텍처, 시각 설계의 theme·상태 표현과 학습문서 복귀 계약을 확인했습니다.
- **검증 순서:** 제품·콘텐츠와 테스트 작성자를 분리합니다. 작성하지 않은 `content_validator`가 교육적 정확성을, `test_engineer`가 focused 자동 검사와 실제 브라우저를, `project_integrator`가 전체 diff·문서·선정된 증거를 판정합니다. 설계 작성자는 자기 결과를 최종 승인하지 않습니다.
- **focused 범위:** trace의 프레임·공유값·복사본·복귀/복구·최종 순서·경계 조작과 문서 진입/복귀를 검사합니다. 제품 코드 인계 시 실제 경로와 실행 명령을 확정하며 같은 증거는 재사용합니다. 무관한 전체 교안 감사·runner 전수 검사·전체 suite 재실행은 기본 조건으로 추가하지 않습니다.
- **플랫폼·저장:** 기존 브라우저 화면에서 키보드·초점·좁은 화면·light/dark를 확인합니다. 재생 상태는 일시적이며 새 진도·영속 저장·migration은 없습니다. 실제 검증 환경과 미실행 환경을 구분합니다.
- **Git 권한:** 이 설계 담당은 Git 상태를 변경하지 않습니다. 사용자 승인 범위의 브랜치 작업만 별도 Git 담당이 수행하며 커밋·게시 권한은 총괄이 실제 승인 범위로 판단합니다.
- **남은 판단:** 이번 최소 실험의 필수 사용자 결정은 없습니다. 독립 문서 검토·통합 판정은 후속 인계가 필요합니다.

## 구현과 검증 인계

`[현재 사실]` 2026-10-07 콘텐츠 독립 검토와 `test_engineer`의 변경 범위 검증은 PASS입니다.
제품 구현은 `src/core/permutation-trace.js`, `src/ui/permutation-lab-view.js`, `src/app.js`, `styles/app.css`에 한정했고 독립 테스트 작성자는 `tests/permutation-trace.test.js`, `tests/permutation-lab-view.test.js`를 추가했습니다.

### 자동 검사와 빌드

독립 검증은 Linux의 Node v24.19.0에서 아래 명령으로 수행했습니다.
두 테스트 묶음에서 신규 11개가 겹치므로 고유 검사 수는 95개입니다.

```sh
node --test tests/permutation-trace.test.js tests/permutation-lab-view.test.js tests/algorithm-lessons.test.js tests/app-independent-review.test.js tests/app-quiz-review.test.js tests/review-navigation.test.js
node --test tests/permutation-trace.test.js tests/permutation-lab-view.test.js tests/navigation.test.js tests/app-view-lifecycle.test.js
```

첫 묶음은 74/74 PASS이며 로그는 `/tmp/permutation-independent-tests.log`입니다.
둘째 묶음은 32/32 PASS이며 로그는 `/tmp/permutation-lifecycle-audit.log`입니다.
안전한 전체 복제본 `/tmp/bam-build-audit`에서 `npm run build`를 실행해 PASS했으며 로그는 `/tmp/bam-build-audit.log`입니다.

작성자 자체 검사는 별도 증거이며 독립 검사 수에 더하지 않습니다.
테스트 작성자는 신규 두 파일과 `tests/navigation.test.js`, `tests/app-language-routing.test.js`, `tests/app-view-lifecycle.test.js`, `tests/review-navigation.test.js`를 `node --test`로 실행해 47개를 통과했습니다(`/tmp/permutation-focused-tests.log`).
이후 root 호출과 반환 주체의 assertion을 테스트에 보강하고 신규 두 파일만 다시 실행해 11개를 통과했습니다(`/tmp/permutation-new-tests.log`).
제품 작성자는 같은 신규 11개와 기존 `tests/navigation.test.js`·`tests/lesson-answer.test.js`의 40개를 통과했습니다.
당시 작성자 명령에 포함한 `tests/app.test.js`는 존재하지 않아 검사되지 않았으며 40개는 실제 출력의 navigation 17개와 lesson-answer 23개만 센 값입니다.

### 실제 브라우저

`BAM_DEV_PORT=4173 npm run dev`로 로컬 앱을 열고 Chromium 151 headless/CDP에서 `node /tmp/bam-browser-audit.mjs`를 실행했습니다.
1440×1000과 390×844에서 두 백트래킹 문서와 light/dark를 확인했습니다.

- Enter로 다음 단계 진행, Tab의 대화상자 내부 이동, Escape와 닫기 버튼, 이전·다음·처음부터와 최종 여섯 결과를 확인했습니다.
- 첫 복사 31단계 → 반환 32단계의 공유값 유지 → 경로 제거 33단계 → 사용 표시 해제 34단계를 확인했습니다.
- 문서 URL·기존 DOM·스크롤 735px·진입 버튼 초점·답 펼침 상태와 localStorage가 보존됐고 다른 route로 이동하면 대화상자가 제거됐습니다.
- 좁은 화면에서 페이지 가로 넘침과 runtime exception은 모두 0이었습니다.

감사 결과는 `/tmp/bam-browser-audit.json`과 `/tmp/bam-browser-audit.log`이며 화면 증거는 `/tmp/bam-desktop-light.png`, `/tmp/bam-desktop-dark.png`, `/tmp/bam-mobile-light.png`, `/tmp/bam-mobile-dark.png`입니다.
최종 UI 파일 `src/ui/permutation-lab-view.js`의 SHA-256은 `f7fb2150506417c38f10c813a67994a4c5c398259a4a24a275fca5a23095acaf`입니다.
이 `/tmp` 자료는 현재 검증 환경의 증거이며 저장소에 영구 보관한 자산이 아닙니다.

### 검증 한계와 남은 단계

실제 JDK를 통한 Java 실행, 물리 휴대폰, Safari·Firefox는 확인하지 않았습니다.
실제 객관식 풀이의 전 과정을 문서와 왕복하는 검사는 실행하지 않았으며 URL의 복귀 토큰 query 보존과 기존 review 자동 회귀로 직접 영향을 확인했습니다.
콘텐츠 데이터는 변경하지 않았고 focused `algorithm-lessons` 검사로 관련 연결을 확인했으므로 `validate:content` 전수 검사와 전체 `npm run check`는 실행하지 않았습니다.
독립 문서 검토와 최종 통합 판정은 후속 단계이며 커밋·push·PR·merge·배포는 이 기록 시점에 미실행입니다.

## 선택형 예측 후속 작업

- **작업 ID·분류·기준선:** `BACKTRACKING-PREDICT-20261007`, 학습 콘텐츠 포함 기능이며 기존 새 경험의 지원 방식 보완입니다. 기준선은 `codex/permutation-trace-lab`의 `97e8c51`입니다. 앞선 검증 기록은 기본 실험실의 과거 증거로 유지하며 새 예측 UI 통과로 재사용하지 않습니다.
- **사용자 승인·설계:** 작은 선택형 path 예측 한 사례를 추가합니다. [정본의 선택형 예측 계약](../designs/lesson-review.md#선택형-path-예측-한-사례)에 사용자가 지정한 첫 `return` 직후 질문과 다음 `path.remove` 직후 대조를 정했으며 응답 강제 없이 건너뛰기와 기존 자유 이동을 유지합니다.
- **소유·순서:** 설계 담당은 기존 두 문서의 후속 절만, 제품 담당은 총괄이 지정한 실험실 UI와 필요한 한정 스타일만, 독립 테스트 작성자는 관련 테스트만 수정합니다. 정본 인계 → 제품·테스트 작성 → 콘텐츠·실행 독립 검증 → 문서·통합 판정 순서로 진행합니다.
- **보존·비범위:** Java 코드·trace·기존 교안·runner·공통 UI·진도·외부 공유 설정을 보존합니다. 선택은 대화상자 안의 일시 상태이며 로그인·서버·저장·분석·원격 전송·의존성·배포·PR·merge는 추가하지 않습니다.
- **완료·검사:** 정본 수용 기준에 따라 응답/무응답/건너뛰기의 단계 동등성, 반환/복구 값, 선택 변경과 상태 초기화, 기존 여섯 결과·문서 복귀·초점·좁은 화면·theme를 확인합니다. 새 UI의 focused 증거를 수집하고 불변인 모델의 이전 검증은 변경 여부를 확인해 재사용합니다.
- **현재 상태·남은 판정:** `src/ui/permutation-lab-view.js`와 `styles/app.css`의 한정 변경으로 후속 구현을 마쳤고 독립 콘텐츠 검토는 PASS입니다. 독립 실행 검증도 PASS이며 문서 검토·통합은 후속 인계를 기다립니다. 추가 사용자 결정은 없습니다.


### 후속 검증 기록

`[현재 사실]` 테스트 작성자는 아래 명령으로 기존 core 6개와 예측 UI를 포함한 view 10개를 검사해 16/16 PASS를 확인했습니다.
신규 예측 검사는 5개이며 작성자 자체 검사와 독립 실행 검증을 구분합니다.

```sh
node --test tests/permutation-trace.test.js tests/permutation-lab-view.test.js
```

로그는 `/tmp/permutation-prediction-tests.log`입니다.
32단계의 반환 후 `[1,2,3]` 질문과 33단계의 경로 제거 후 `[1,2]` 대조, 선택 변경·미응답·건너뛰기·초점·초기화와 202개 snapshot·최종 여섯 결과 보존을 확인했습니다.


`[현재 사실]` 후속 `test_engineer`는 같은 두 테스트 파일을 독립 실행해 16/16 PASS를 확인했습니다(`/tmp/bam-prediction-tests.log`).
Linux·Node v24.19.0에서 수행했으며 작성자 16개와 더해 32개로 집계하지 않습니다.
안전한 복제본 `/tmp/bam-prediction-build`에서 `npm run build`를 실행해 PASS했습니다(`/tmp/bam-prediction-build.log`).

실제 브라우저 검증은 `node /tmp/bam-prediction-browser.mjs`로 Chromium 151 CDP의 1440×1000·390×844와 light/dark에서 수행해 73개 assertion을 통과했습니다.
Enter로 선택하는 동작도 별도로 확인했습니다.

- 첫 반환 32단계의 질문과 경로 제거 33단계의 실제값 대조, 두 선택과 선택 변경, 미응답 다음 진행을 확인했습니다.
- 선택 후 건너뛰기는 선택을 지우고 다음 단계로 이동하며 초점을 `다음`에 돌려줬습니다. 이전·처음부터·닫기·Escape·route 이동에서 일시 응답이 초기화됐습니다.
- 예측 질문은 첫 반환 한 사례에만 나타났고 202개 snapshot·최종 여섯 결과가 유지됐습니다. 문서 DOM·스크롤 735px·URL·답 펼침·진입 초점 복원을 확인했습니다.
- 이번 예측 조작으로 발생한 저장소 쓰기·네트워크 요청·runtime exception은 모두 0이었습니다.

결과는 `/tmp/bam-prediction-browser.json`이며 화면 증거는 `/tmp/bam-prediction-desktop-light.png`, `/tmp/bam-prediction-desktop-dark.png`, `/tmp/bam-prediction-mobile-light.png`, `/tmp/bam-prediction-mobile-dark.png`입니다.
이 자료는 현재 `/tmp` 검증 환경의 파일이며 저장소 영구 자산이 아닙니다.

core·app·content·runtime·desktop·package가 바뀌지 않았으므로 기존 라우팅 회귀의 증거를 재사용했습니다.
실제 JDK·물리 휴대폰·Safari·Firefox·실제 객관식 전체 왕복은 실행하지 않았습니다.
콘텐츠 불변에 따라 전체 `validate:content`와 전체 `npm run check`도 재실행하지 않았습니다.
이는 이번 선택형 예측 변경의 독립 검증 결과이며 학습자의 오개념 감소를 관찰한 성과는 아닙니다.
후속 독립 문서 검토·통합 판정과 이번 변경의 커밋·push·PR·merge·배포는 이 기록 시점에 미실행입니다.
