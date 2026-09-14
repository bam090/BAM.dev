# 독립 학습문서·객관식 설계 작업 카드 — 2026-09-12

## 작업과 범위

- 작업 ID: `2026-09-12-independent-review-design`
- 유형: 문서·운영 규칙. 변경 성격: 해당 없음. 교육 내용 생성·수정·소급 감사·커버리지 승인 아님.
- 목적: 전달문과 실제 구현을 대조하고 홈의 두 독립 서비스, 사용자 편의, 키워드 문제·피드백·개념·문서 왕복·기록의 첫 완성 범위를 설계한다.
- 상태: `[현재 사실]` 설계 문서 작성·독립 문서 재검·통합 검증 PASS. 제품 구현 시작·신규 기능 검증·전체 콘텐츠 정확성 재감사 완료 아님.
- 현재·목표 정본: [복습 설계](../designs/lesson-review.md), [데이터 계약](../content-schema.md#독립-학습문서객관식-목표-계약), [범위](../product-scope.md#첫-학습-서비스-범위), [결정·순서](../roadmap.md#2026-09-12-확정-제품-결정).
- 사용자 관찰 가능 완료 조건: 실제 기능·확정 요구·제안·미결정을 구분하고 홈→문서 또는 문제, 문제→개념→문서→상태 복귀, 두 모드/채점·재도전·분모를 검토 가능한 문서로 설명한다. 이번 제품 동작의 구현 완료 조건과 구분한다.
- 접근성·모바일·오프라인·데이터 영향: 화면·행동·실패·이관의 목표 계약만 문서화. 실제 제품 상태·학습 기록은 변경하지 않는다.

### 경로 소유권과 순서

| 단계·담당 | 쓰기 범위 | 다음 단계 조건 |
| --- | --- | --- |
| 총괄 orchestrator | 없음. 실제 자료·Git·명령을 읽고 범위·순서·인계 조정 | 전달문·최신 지시·소유권 고정 |
| 제품·설계 문서 담당 `design_document_author` | `docs/designs/lesson-review.md`, `docs/content-schema.md`, `docs/product-scope.md`, `docs/roadmap.md`, `docs/README.md`, 이 작업 카드 | 변경 전 복제본·실제 diff를 총괄이 확인한 뒤 읽기 전용 검토로 인계 |
| 문서 검토자 `implementation_audit` | 없음. 정본 중복·링크·규칙·현재 구현과의 충돌 focused 검토 | 작성자에게 결함 반환 또는 문서 검토 PASS |
| `project_integrator` `source_inventory` | 없음. 독립 문서 검토 뒤 전체 gate | 안전한 복제본에서 `npm run check` 한 번과 범위·증거 정합성 확인 |
| Git 담당 | 이번에는 미배정·변경 권한 없음 | commit·push·PR·merge 수행하지 않음 |

변경 금지: 모든 밤위키·Code Quest 참고 프로젝트 경로, 교육 콘텐츠, 제품 코드, tests, 빌드·CI·의존성 설정, `.git`, 소유권 표 밖 파일. 같은 파일을 동시에 편집하지 않고 수정 반환 시 총괄이 소유권을 순차 재배정한다. 독립 검증 뒤 증거를 이 카드에 기록하는 일도 문서 담당에게 순차 인계한다.

## 입력과 조사 근거

- 사용자 지정 전달문 `Obsidian Vault/밤위키/schema/가이드/밤데브 설계 작업 전달문.md` 전체와 이 작업의 후속 요구: 홈 소개+두 서비스 독립 진입, 사용자 편의 최우선·Code Quest 참고 UI 개선, 개별/전체 채점 선택·지연 시 개별 선행.
- 저장소 `AGENTS.md`, 문서 지도·범위·로드맵·개발 파이프라인·학습 저작/설계·아키텍처·시각 설계와 기존 복습 정본. 최신 지시로 09-09 구현 승인 이력을 이번 설계 범위와 분리한다.
- 원래 프로젝트 경로에서 조사했다. 총괄은 `codex/js-foundation`의 첫 커밋 전·전체 untracked, `main`·`dev`·원격 없음 상태를 직접 확인했다. 별도 worktree가 미커밋 변경을 포함한다고 가정하지 않았다.
- 구현 근거: `src/app.js`, `src/core/quiz.js`, `src/ui/quiz-view.js`, `src/repositories/progress-repository.js`, 실제 curriculum·quizzes·schema·관련 테스트. quiz의 기존 `all`은 문제 범위이며 여러 카드 보기 구현이 아니다.
- 조사 snapshot: 교안 34(HTML 5, CSS 6, JS 기존 7+반입 3, 알고리즘 12, Java 샘플 1), 객관식 52(HTML 12, CSS 12, JS 기존 14+반입 13, Java 1), 알고리즘 객관식 없음. 현재 전체 수량의 유지 정본은 [README](../../README.md)다.
- 첫 기능 검증 재료는 반입 JS 3문서·13문항. `js.function-return`은 3문항, `js.control-flow`·`js.array-methods`는 각 2문항이지만 다른 키워드의 복수문항·복합 참조 완료를 뜻하지 않는다. 복합 연결 후보의 교육적 판정은 이번에 하지 않았다.
- 밤위키 제품용 자료 inventory는 번호 있는 본문 35(HTML 5, CSS 7, JS 10, Java 10, 알고리즘 3), 별도 안내·계획 19다. 기존 승인 기록과 오늘의 기술 검증·제품 반입은 별개이고 알고리즘 자료는 승인 대기 기록이다. 이번에 전체 자료를 검증·반입하지 않았다.
- 총괄·자료 조사에서 반입한 JS 원문의 현재 hash 차이는 앞 YAML 네 줄 추가이며 교육 본문은 같음을 확인했다. 반입 당시 경로·해시와 현재 원문 위치·revision은 구분하여 보존한다. HTML 폼·CSS 박스·JS 함수 대표 비교에서 전면 재생성 필요 근거를 확인하지 않았다.
- 개념 노트의 ‘개인용’·‘활성’·공식 출처 대조 기록을 공개 허용·현재 제품 검증으로 바꾸지 않았다. 개인 수업 프로젝트 맥락은 제품에 옮기지 않고 공개 가능한 기술 내용과 공식 근거를 별도 접수하는 설계만 제안했다. 과거 자료의 Docker runner·CI·632검사 주장은 현재 저장소 구현 근거로 사용하지 않았다.
- Code Quest `frontend/src/App.tsx`의 문제 탐색기에서 과정·주제/단계·검색·상태 필터·번호 이동·현재 문제 표시 구조를 읽었다. 이번 실제 실행·시각 smoke는 하지 않았다. BAM.dev 편의에 맞춰 구조를 줄여 쓰는 참고이며 코드·자산·서버·평가 계약 반입이 아니다.
- 외부 UI 참고: [shadcn/ui](https://ui.shadcn.com/)의 카드·대화상자 구성 참고와 [humanizer 저장소](https://github.com/blader/humanizer) 존재를 확인했다. [Coolors trending](https://coolors.co/palettes/trending)은 403으로 현재 페이지 확인 실패. 기존 확정 Ocean 팔레트를 유지하며 새 색상 선택을 주장하지 않는다. 세션 카탈로그·로컬 SKILL 경로 조사에서 taste/humanizer를 찾지 못해 설치·적용하지 않았다.

## 작성과 검증 인계

- 변경 전 baseline: `/private/tmp/bam-independent-review-baseline-l44x0jrh`. 기존 다섯 문서의 원본과 신규 카드의 부재를 기록한 `manifest.json` 보존. Git이 전부 untracked이므로 이 복제본과 최종 문서의 before/after diff로 사용자 기존 내용을 구분한다.
- 문서 담당: 허용된 여섯 Markdown만 편집. 기존 2026-09-10 객관식 작성·피드백 절을 유지한다. 출처·사용자 판단·실행 gate는 연결하고 세부 데이터 필드는 스키마 제안 한 곳에 둔다.
- 구현 조사 focused 검증: 읽기 전용 담당이 Node 24.17.0에서 `node --test tests/quiz-core.test.js tests/quiz-view.test.js tests/app-quiz-review.test.js tests/progress-repository.test.js tests/navigation.test.js tests/browser-storage.test.js`를 실행해 **85/85 통과**. 로그 `/tmp/bam-review-focused-20260912.log`를 총괄이 직접 대조했다. 기존 동작 근거이며 새 목표 기능 PASS나 전체 gate가 아니다.
- 작성자 focused 확인: before/after diff, 최신 요구 반영·09-10 절 보존과 변경 경로 확인. 독립 문서 링크·정합성 검증을 대신하지 않는다. 전체 `npm run check`는 작성자가 실행하지 않았다.
- 독립 문서 최초 검토: 여섯 문서의 링크·앵커 246개(역참조 102개 포함) 오류 0. 로그 `/tmp/bam-review-doc-links-20260912.log`. 정합성 2건은 작성자에게 반환: 전체 채점의 무조건 완료 gate와 개념·문서 연결 검증의 R3 후행.
- 반환 수정: 개별 선행 완료에서 전체 채점 검증을 미적용·후속 미완료로 구분하고 R1 구현 전 최소 개념·승인 발췌·문서 절 참조 확인을 추가했다. R3는 대표 범위 확장으로 정리했다. 사용자 편의를 위해 결과 주 표시는 정답/답한 수·풀이 수로 줄이고 총범위 점수·최초/최근 통계는 접은 상세로 제안했다. 독립 재검토 PASS: 링크·앵커 246개 오류 0, `/tmp/bam-review-doc-links-final-20260912.log`. 두 반환 사항의 수정과 검토 대상 여섯 문서 SHA 일치를 확인했다.
- 통합 전체 gate PASS: `project_integrator`가 `/private/tmp/bam-review-integration-20260912-5yinybn4/project`에서 `npm run check`를 정확히 한 번 실행해 exit 0. 콘텐츠 검증은 교안 34·객관식 52·Quest 18·코딩테스트 6·Web Project 1, Node 테스트는 **549/549 통과·실패 0·skip 0**, 정적 빌드 완료. 로그 `/private/tmp/bam-review-integration-20260912-5yinybn4/npm-run-check.log`, 보고서 `/private/tmp/bam-review-integration-20260912-5yinybn4/integration-report.json`을 총괄과 문서 담당이 읽어 대조했다.
- 검증 실행 전후 보존 증거: 원본 1,642파일 SHA 동일(`.git` 1,383·원본 `dist` 82 포함), 복제본 소스 177파일 동일, 검토한 여섯 문서 SHA 일치, 09-10 작성·피드백 절 바이트 보존. 문서 전용 통합 PASS이며 새 UI·설치 패키지·Java 실행 smoke는 적용되지 않고 전체 콘텐츠 정확성 재감사도 수행하지 않았다.
- 위 검증 뒤 작업 카드에 실행 결과만 추가했다. 제품·설계 계약과 나머지 다섯 문서는 변경하지 않았다. 이 증거 추가는 `project_integrator`의 focused diff·SHA 대조로 마감하며 전체 `npm run check`를 다시 실행하지 않는다.
- 제품 구현·신규 교육 문항·새로고침/두 모드/모달/전체 채점의 실제 동작 검증, 전체 콘텐츠 정확성 재감사, commit·PR·merge·배포는 미실행이다.

## 남은 판단과 다음 인계

확정된 홈·독립 서비스·사용자 편의·두 보기·두 채점 방식·문서 왕복·헷갈림·모름·자율 재도전·과정 순서를 다시 질문하지 않는다. 문항 수·행동 유형 비율·확장 키워드와 보관/교정 정책은 [로드맵 미결정](../roadmap.md#bam-결정-대기-목록)에만 관리한다. JS 재료를 먼저 쓰는 내부 검증 순서는 사용자 공급 범위 확정이나 새로운 질문 gate가 아니다. 문서 검토·통합 뒤 bam에게 설계를 전달하고 구현은 별도 시작 요청 이후 진행한다.
