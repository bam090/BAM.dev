# 확정된 학습 서비스 변경의 GitHub 게시

작업 ID는 `GITHUB-PUBLICATION-20260913`이다. bam의 2026-09-13 “깃헙에 올리자 지금 변경되고 확정된부분들” 요청에 따라 검증된 로컬 제품·콘텐츠·운영 문서를 별도 브랜치에 게시하고 기존 `dev`와의 차이를 Draft PR로 보여 준다. 새 기능·교안 작성이나 기존 원격 기능의 폐기 승인은 아니다. 운영 문서 변경과 Git 게시 준비는 [개발 절차](../development-workflow.md), 게시 권한은 [`DEC-GIT-01`](../roadmap.md#bam-결정-대기-목록)을 따른다.

## 기준선과 범위

`[현재 사실]` 게시 시작 시 원본 로컬은 첫 커밋 전 `codex/js-foundation`이며 원격 설정이 없었다. 이 로컬 상태를 기존 GitHub 이력이 없다는 뜻으로 해석하지 않는다.

| 확인 대상 | 2026-09-13 조사 결과 |
| --- | --- |
| 기존 원격 | 공개 [bam090/BAM.dev](https://github.com/bam090/BAM.dev), 기본 브랜치 `dev`, 게시 권한 확인 |
| 원격 `dev` | `db1a5f430f45fc0f60277a0a1ddc7f38fc21c7a0` |
| 원격 `main` | `7b2055478c381e098dd99da528d24f0e43582575`, 파일 0개의 초기 기준선 |
| 기존 PR | 1~16의 `MERGED` 상태 확인. 이번 작업의 병합 이력이 아님 |
| 검증된 로컬 | 앞선 [HTML 통합 작업](2026-09-13-html-concept-lessons.md)의 소스 manifest 211파일과 게시 시작 스냅샷이 일치 |
| 초기 파일 대조 | 원격 190·로컬 211: 동일 61·공유 경로 차이 97·로컬에만 53·원격에만 32 |
| 격리된 Git 작업 | 기존 원격을 복제한 `/private/tmp/bam-github-publish-20260913`의 `codex/approved-learning-updates`에 초기 211파일 복사. 아직 새 commit·push·PR 없음 |

초기 비교에서 원격에만 Java 교안·Quest·코딩테스트·로컬 grader, My Page와 관련 테스트·문서가 있었다. **이번 브랜치는 검증된 로컬 스냅샷을 보관하므로 원격 전용 32파일은 PR diff에 삭제로 표시된다. 기존 `dev`와 원격 이력에는 그대로 남으며, 이 표시는 기능 폐기 승인이나 통합 완료가 아니다.** 공통 97파일의 차이도 공개된 diff에서 확인하고 실제 통합은 별도로 판단한다. 초기 근거는 임시 보고 `/private/tmp/bam-github-discovery.json`, `/private/tmp/bam-github-tree-comparison.json`, `/private/tmp/bam-github-snapshot-preparation.json`이다. 저장소·브랜치·과거 PR의 실제 API 자료는 각각 `/private/tmp/bam-github-repository.json`, `/private/tmp/bam-github-branches.json`, `/private/tmp/bam-github-pr-history.json`이다.

게시 재료는 앞선 작업에서 검증한 로컬 소스·제품 파생 콘텐츠·확정 및 미결정을 구분한 설계 문서와 이번 최소 운영 문서다. 밤위키 원본·개인 비공개 기록·공개 금지 디자인 자산·로컬 설정·`.git`·`dist`·의존성 캐시·임시 검증 로그는 게시 파일에 포함하지 않는다. 현재 UI·HTML 학습 문서·문제 왕복 등 검증 범위는 앞선 각 작업 카드를 유지하며, 과목 전체 정비·설치 앱·Java runner 구현 완료를 새로 주장하지 않는다.

## 역할과 게시 순서

| 역할 | 소유 경로·책임 |
| --- | --- |
| 총괄 `/root` | 읽기 전용. 원격·로컬·각 보고의 실제 근거 대조, 게시 후보 범위와 단계 판정 |
| 운영 문서 `/root/github_publish_docs` | `docs/roadmap.md`, `docs/development-workflow.md`, `docs/README.md`, 이 카드만 작성. 제품·콘텐츠·테스트·Git 쓰기 금지 |
| 독립 문서·게시 범위 검토 `/root/github_publication_review` | 읽기 전용. 최종 4문서 diff·링크·앵커·규칙·게시 범위와 PR 설명 확인. 전체 gate와 Git 쓰기 금지 |
| Git `/root/github_publish` | 격리 사본의 기존 원격 이력·feature 관리와 승인 범위 복사. 게시 검증 PASS 뒤 한국어 commit·push·`dev` 대상 Draft PR, 실제 식별자 인계 |
| 독립 통합 `/root/html_integrator` | 읽기 전용. 문서 링크·규칙·스냅샷 diff·이력·보존과 앞선 검증 증거 확인, 안전한 스냅샷 복제본에서 이번 게시 묶음의 전체 `npm run check` 1회 및 필요한 smoke. 원격 기능 결합 검증을 수행한 것으로 해석하지 않음 |

운영 문서 diff 동결·독립 확인 후 Git 담당에게 순차 인계한다. 원본 작업 파일을 덮어쓰지 않으며 `main`과 기존 `dev` 이력을 보존한다. commit·push·Draft PR은 스냅샷의 게시 검증 PASS 뒤 수행하고 merge하지 않는다. 게시 뒤 원본 로컬의 파일 tree가 게시 commit과 같을 때만 Git 담당이 원격·참조·index를 연결할 수 있으며, 아직 수행한 성과는 아니다. 향후 원격 기능과 통합하려면 별도 범위·작성·검증 판단이 필요하다.

## 게시 시작 시점의 검증·인계 기록

| 항목 | 현재 근거·판정 |
| --- | --- |
| 앞선 로컬 제품 검증 | HTML 통합 PASS: `npm run check` 618/618·정적 빌드, 산출물 106개의 SHA·HTTP 확인. `/private/tmp/bam-html-integration-report.json`. 원격 결합 후보의 PASS를 대신하지 않음 |
| 원격·스냅샷 대조 | 원격 기준선·로컬 211파일 일치 확인. 스냅샷 별도 게시·기존 `dev` 보존·원격 전용 32파일 미포함을 Draft PR에 명시하는 범위 고정 |
| 이번 문서·스냅샷 게시 검증 | 미실행. 최종 문서 diff·스냅샷 범위를 고정한 뒤 독립 통합 수행 |
| 새 commit·push·PR·CI | 미실행. 수행 뒤 실제 SHA·PR·CI 결과를 인계하며 성공을 미리 기록하지 않음 |

완료 기준은 승인된 스냅샷만 게시하고 원본 로컬·밤위키·기존 원격 이력을 보존하며, 실제 Draft PR과 CI 결과를 확인하는 것이다. 원격 기능의 결합과 M0 전체 완료는 이 게시만으로 주장하지 않는다. 이번 문서 정정은 실행 동작·사용자 데이터·접근성·모바일·오프라인 계약을 바꾸지 않는다. 앞선 UI 증거를 재사용할 때는 제품 파일의 동일성을 확인한다. 임시 보고와 로컬 gate는 GitHub CI 실행이나 배포 완료 증거가 아니다. 이 표는 게시 시작 시점의 인계 기록으로 유지하고, 이후 실제 commit·PR·CI 식별자와 결과는 PR 및 Git 담당의 인계 결과에 기록한다.
