# 문서 하단 자기 확인과 완료 표시 — 2026-09-13

## 작업과 현재 상태

- 작업 ID: `2026-09-13-lesson-self-check`.
- 유형: **일반 제품 기능·코드**, 변경 성격 해당 없음. 기존 답안 표시 순서와 자기 확인 UI를 명료하게 하며 원문 교육 내용·문항·학습 목표의 생성·수정과 새 A/E/C/T 경험·학습 성과 판정을 하지 않는다.
- 승인 입력: bam의 문서 하단 실제 핵심 질문 표시, 클릭해 답 확인, 스스로 맞다고 판단한 뒤 별도 학습 완료 표시 요청. [확정 결정](../roadmap.md#2026-09-13-확정-제품-결정)과 [제품 계약](../designs/lesson-review.md#문서-하단-자기-확인과-완료-표시)을 따른다. 기존 [개발 절차](../development-workflow.md)·[아키텍처](../architecture.md)·[콘텐츠 계약](../content-schema.md)·[시각 기준](../designs/visual-design.md)을 유지한다.
- 현재 상태: **구현·독립 실행·최종 통합 검증 PASS**. 이번 항목은 전체 gate 1회에서 597/597 테스트와 정적 build를 통과했다. 미결정·남은 제품 작업은 없으며 이전 작업의 594/594와 구분한다.
- 개선 전 현행: 완료 버튼이 `completedLessonIds` 갱신과 `면접 답변 예시` 표시를 함께 제어한다. 이번 계약은 이 결합만 대체하며 객관식의 채점·해설 계약은 유지한다.

## 완료할 흐름과 보존 경계

모든 34교안의 하단에 기존 `lesson.essentialQuestion`과 먼저 자신의 말로 답해 보는 안내를 표시한다. 반입 3교안의 정확한 `## 핵심 정리`는 ‘핵심 질문 답 확인하기’, 기존 31교안의 정확한 `## 면접 답변 예시`는 ‘답변 예시 확인하기’로 펼친다. 자료 안내는 각각 핵심 정리 또는 확인 문제의 답변 예시라고 명확히 표시하며 후자를 핵심 질문 전용 직접답으로 위장하지 않는다. 원문 교육 문장·코드·heading ID는 그대로 유지한다. 두 절이 없으면 빈 버튼·새 답안 없이 자신의 설명과 완료 선택만 제공한다.

네이티브 `details`는 완료 여부와 무관하게 새 진입 때 접혀 있고 답변 열람은 진도를 저장하지 않는다. 완료 표시·해제는 별도 영역의 버튼이며 열람 여부로 잠그지 않는다. 같은 화면에서 완료 변경으로 다시 렌더링할 때 현재 펼침을 유지하고 새 진입은 접힘으로 시작한다. 명시적인 `section` 이동 대상이 접힌 영역 안에 있을 때만 해당 영역을 열고 기존 스크롤·초점을 수행한다. 기존 `js.control-flow`가 참조하는 ‘핵심 정리’ 앵커를 이 예외로 보존한다. 저장 성공·해제·실패의 실제 상태를 안내한다.

기존 콘텐츠 파일·문서/개념 ID·앵커, `completedLessonIds`·저장 키, 문제 왕복·풀이 상태에는 마이그레이션이 없다. 앞선 작업의 답안 공개 시점 보존은 그 작업의 이력이며 이번 요청에 따른 완료-공개 분리로 대체한다. 신규 콘텐츠 반입·원문 수정·외부 실행·의존성·팔레트·설치·배포는 포함하지 않는다.

## 소유권과 검증

| 역할 | 허용 쓰기 경로 | 제한·순서 |
| --- | --- | --- |
| 총괄 `/root` | 없음 | 실제 baseline·파일·diff·명령을 대조하고 다음 단계 인계 |
| 문서 `catalog_polish_docs` | `docs/designs/lesson-review.md`, `docs/roadmap.md`, 이 카드 | 코드 착수 전 설계 기록, 실제 검증 뒤 증거 마감 |
| 제품 구현자 | `src/app.js`, `src/ui/markdown.js`, `styles/app.css` | 설계 인계 뒤 구현, 콘텐츠·테스트 수정 금지 |
| 테스트 작성자 | `tests/lesson-answer.test.js`, `tests/markdown.test.js` | 독립 기대값 작성, 제품·콘텐츠 수정 금지 |
| 독립 `test_engineer` | 없음 | 실제 diff·원문 보존·focused 검사·브라우저 확인 |
| 독립 `project_integrator` | 없음 | 앞 단계 PASS·전체 diff·문서·보호 범위 확인 후 전체 gate 1회 |
| Git 담당 | 미배정·권한 없음 | commit·push·PR·merge 없음 |

서로의 소유 파일은 수정하지 않으며 겹치는 경로의 추가 변경은 총괄의 실제 diff 검토 뒤 순차로 인계한다. `content/` 전체와 밤위키 원문·설정, 공개 금지 자산, 원본 `dist`, `.git`, 새 의존성·설정·설치·배포는 변경 금지다.

완료 증거는 실제 핵심 질문 표시, 기존 두 종류 자료의 정확한 경계·문장·앵커, 초기 접힘, 열람 무저장, 완료·해제의 독립성, 재렌더링 펼침 유지·재진입 접힘, 두 절이 없는 경우, 기존 진도·문제 왕복과 저장 실패다. 실제 브라우저의 키보드·초점과 320px·390px·데스크톱에서 긴 질문·코드·답변을 확인한다. 정적 로컬 자산만 사용하며 새 답변을 지어내지 않았는지 원문과 대조한다.

작성자·검증자는 영향 범위 focused 검사만 수행했다. 독립 `project_integrator`가 최종 snapshot의 안전한 `/private/tmp` 복제본에서 `npm run check`를 1회 실행해 통과했고 원본 `dist`를 보호했다. 전체 gate 뒤에는 이 카드의 결과 증거만 마감하며 check·build를 재실행하지 않는다.

## baseline

`/private/tmp/bam-lesson-self-check-20260913-4hwh58i5/project`에 수정 전 소스 189파일을 복제했다. 같은 폴더의 `manifest.json`에 소스와 보호 Git·dist 1,563파일 SHA를 기록했다. 기존 전체 untracked 파일과 Git 상태를 새 기준선으로 바꾸지 않고 실제 diff로 이번 변경만 확인한다. Codex 자동 checkpoint 변화는 수동 Git 작업과 구분한다.

## 인계와 실행 증거

- 제품 작성 인계: `/private/tmp/bam-self-check-impl.diff`, `bam-self-check-impl-manifest.json`, `bam-self-check-impl-content-audit.json`, `bam-self-check-impl-focused.log`. 제품 3파일 변경, 콘텐츠 52파일 바이트 불변, 영향 범위 기존 회귀 **30/30 PASS, 실패·건너뜀 0**이다.
- 테스트 작성 인계: `/private/tmp/bam-lesson-self-check-tests.diff`, `bam-lesson-self-check-tests-manifest.json`, `bam-lesson-self-check-tests-final.log`. 소유 2파일에 실제 저장소의 완료·해제·저장 실패, 원문 절 이동·코드 블록 경계 등을 검증했다. 작성자 focused 검사는 두 번 모두 통과했고 최종 결과는 **31/31 PASS, 실패·건너뜀 0**이다. 전체 gate 실행은 아니다.
- 독립 실행 **PASS**: `/private/tmp/bam-self-check-independent-report.json`, `bam-self-check-independent-focused.log`. 교안 답변·Markdown·독립 복습·문제 복습·진도 저장소·복귀 경로·view lifecycle의 7개 테스트 파일을 `node --test`로 실행해 **83/83 PASS, 실패·건너뜀 0**을 확인했다. 콘텐츠 52파일 바이트 불변과 기존 핵심 정리 3개·확인 문제 답변 예시 31개의 표시 경계도 대조했다.
- 실제 Chrome QA의 320px·390px·1853px에서 기본 접힘·키보드 펼침·별도 완료/해제·재렌더링 펼침 유지·새로고침 접힘·초점을 확인했다. `js.control-flow`의 접힌 핵심 정리 앵커가 열리고, 문서 왕복 후 미채점·채점 선택과 관련 개념 초점이 유지됐다. 콘솔 오류·경고 0이며 사용자 `localhost:4189` 기록은 건드리지 않았다.
- 독립 통합 **PASS**: `/private/tmp/bam-self-check-integration-20260913-riuc1wn_/integration-report.json`, 같은 폴더의 `npm-run-check.log`. 소스 190파일의 안전한 `project` 복제본에서 **`npm run check` 정확히 1회, exit 0, 597/597 PASS, 실패·건너뜀 0**. 콘텐츠 검증과 정적 build 89파일의 snapshot 바이트 일치를 확인했다. 제품 3파일·테스트 2파일 SHA는 독립 실행 때와 동일하다.
- 전체 gate 중 원본·복제본 소스 변경 0, 콘텐츠 52파일 및 원본 `dist` 82파일·일반 Git 17파일을 포함한 보호 1,563파일 변경 0, 문서 링크 183개 오류 0이다. 통합자는 독립 브라우저 증거를 검토했으며 브라우저 검사를 다시 실행하지 않았다.

저장 실패·열람 무저장은 단위 검사로 확인했고 브라우저 저장 오류 주입은 하지 않았다. 전체 교안·문항의 수동 교육 감사, 실제 모바일 기기·스크린리더, 설치·새 오프라인 환경·네트워크 장애·배포는 검증하지 않았다. 새 교육 내용·학습 성과, Git commit·PR·merge·push 완료를 주장하지 않는다.
