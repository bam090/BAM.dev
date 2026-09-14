# 주제 탐색과 문서 읽기 개선 — 2026-09-13

## 작업 범위

- 작업 ID: `2026-09-13-learning-navigation-polish`
- 유형: **일반 제품 기능·코드**, 변경 성격 해당 없음. 교육 문장·문항·학습 목표의 의미·해설 지원과 공개 시점은 바꾸지 않고 표시·탐색만 조정한다. 새 학습 경험이나 콘텐츠 소급 감사 PASS를 주장하지 않는다.
- 승인 입력: bam의 2026-09-13 네 가지 UI 요청과 첨부 화면, 기존 `javascript-notes/values` 교안. 확정 결정은 [로드맵](../roadmap.md#2026-09-13-확정-제품-결정), 현재·목표 계약은 [복습 설계](../designs/lesson-review.md#주제-탐색과-문서-읽기-개선)에 둔다.
- R1의 사용자 편의 개선이다. 현재 상태는 **구현·독립 실행·최종 통합 검증 PASS**다. 이번 최종 snapshot은 전체 gate 1회에서 594/594 테스트와 정적 build를 통과했으며 앞 작업의 581/581 PASS와 구분한다.
- 입력 정본: [문서 지도](../README.md), [제품 범위](../product-scope.md), [개발·검증 절차](../development-workflow.md), [시각 시스템](../designs/visual-design.md), [아키텍처](../architecture.md), [콘텐츠 계약](../content-schema.md). 기존 무의존성·정적 실행·평가 경계 ADR을 유지한다.

## 완료 조건

1. 모든 기존 shell의 브랜드가 `BAM.dev` 단일 홈 링크로 보이고 키보드로 이동한다.
2. 문서·문제 목록 모두 검색 다음에 큰 주제가 나온다. 처음에는 전체 카드를 숨기고, 주제를 고르면 해당 카드만 보인다. 주제 없이 전체 검색, 선택 주제 내 검색과 검색 초기화가 가능하다. JavaScript 두 과정은 같은 주제, 알고리즘은 별도이며 Java 샘플·미제공 주제의 상태가 정확하다.
3. 기존 메타 목표가 표시되던 반입 교안은 원문 목표와 기존 메타 목표를 제목 하나 아래에 모은다. 일반 교안은 원문 목표만 옮긴다. 제목·소개 다음에 원문 한줄 요약(없으면 기존 핵심 질문), 학습 목표, 복습 링크를 순서대로 표시하고 옮긴 내용을 본문에 반복하지 않는다. 원문에 없는 교육 문장을 만들지 않는다. 상단 출처가 사라지고 문서 목록 하단은 일부 자료의 밤위키 출처만 정확히 안내한다.
4. 큰 개념 사이 여백이 문단 사이보다 넓고 기존 문장·코드·표·heading ID·답안 공개 시점을 보존한다. 문제→개념→문서→복귀의 기존 상태가 유지된다.
5. 320px·390px·데스크톱에서 주제 버튼·본문이 잘리지 않고 긴 코드·표만 내부 스크롤한다. 검색·주제·초기화·문서 진입·브랜드를 키보드로 조작하며 현재 선택·준비 중을 색 이외의 단서로 읽을 수 있다.

## 경로 소유권과 순서

| 역할 | 허용 쓰기 경로 | 제한·인계 |
| --- | --- | --- |
| 총괄 `/root` | 없음 | 실제 baseline·파일·diff·명령을 독립 대조하고 다음 역할로 인계 |
| 문서 `catalog_polish_docs` | `docs/designs/lesson-review.md`, `docs/roadmap.md`, 이 카드 | 코드 착수 전 최소 계약 기록, 최종 검증 뒤 같은 경로에서 상태 마감 |
| 구현 `catalog_polish_impl` | `src/app.js`, `src/ui/app-shell.js`, `src/ui/learning-catalog-view.js`, `src/ui/markdown.js`, `styles/app.css` | 교육 원문·콘텐츠 JSON·테스트 수정 금지. 소유 코드와 영향 범위 focused 검사만 수행 |
| 테스트 작성자 | `tests/learning-catalog-view.test.js`, `tests/lesson-answer.test.js`, `tests/app-shell.test.js`, `tests/app-independent-review.test.js`, `tests/markdown.test.js` | 제품·콘텐츠 변경 금지. 자신이 쓴 테스트의 독립 검증을 겸하지 않음 |
| 독립 `test_engineer` | 없음 | 요구·실제 diff·독립 기대값과 focused 검사, 실제 브라우저·키보드·viewport를 검증 |
| 독립 `project_integrator` | 없음 | 앞 단계 PASS·전체 diff·문서·보호 범위 확인 후 안전한 복제본에서 전체 gate 1회 |
| Git 담당 | 미배정·권한 없음 | commit·push·PR·merge 없음 |

서로의 파일을 병렬로 수정하지 않는다. 추가·겹치는 경로는 총괄이 실제 diff를 읽은 뒤 별도 인계한다. `content/` 전체, 밤위키·Code Quest 원본, `.git`, 원본 `dist`, 새 의존성·설정·설치·배포는 변경 금지다. 팔레트 적용과 R2 후속 기능도 포함하지 않는다.

## 데이터·검증 계약

기존 콘텐츠 파일·course/lesson/concept ID·깊은 URL·heading ID·풀이 세션과 progress 저장 키를 보존한다. 주제는 목록의 표시용 그룹이며 영구 데이터 마이그레이션이 없다. 코드 블록이나 후반 본문의 같은 제목을 선두 요약으로 잘못 추출하지 않아야 한다. 기존 답안 예시 공개 시점을 앞당기지 않는다. 새 외부 요청 없이 정적 로컬 콘텐츠를 사용한다. 새 학습 설명·목표·의미 변경이 필요한 경우 bam에게 반환하며 확정된 네 가지 UI 요청을 다시 묻지 않는다.

작성자·검증자는 카탈로그, shell, 교안 표시·markdown과 관련 라우팅의 focused 검사를 수행하고 실제 명령·결과를 아래에 인계한다. 최종 `project_integrator`만 통합된 snapshot의 안전한 `/private/tmp` 복제본에서 `npm run check`를 1회 수행한다. 실패하면 담당자에게 반환하고 실패 증거를 남기며 실제 수정·독립 확인 후 새 최종 snapshot의 검증을 구분한다. 원본 `dist`를 갱신하지 않는다.

## baseline과 진행 증거

- `/private/tmp/bam-learning-polish-20260913-wcqq7adb/project`: 수정 전 소스 188파일 복제. 같은 폴더의 `manifest.json`에 소스와 보호 Git·dist 1,542파일 SHA를 기록했다.
- 기존 전체 untracked Git 상태를 새 기준선·커밋으로 바꾸지 않고 위 baseline과 실제 diff로 변경 범위를 확인한다. Codex 자동 checkpoint 변화가 있다면 수동 Git 변경과 구분해 기록한다.
- 문서 선행 기록 후 제품 5파일·테스트 5파일을 반영하고 총괄이 실제 diff를 확인했다. 아래 독립 실행·통합 PASS 뒤 이 카드의 결과 증거만 마감하며 다른 정본·제품·테스트는 동결했다.
- 제품 인계: `/private/tmp/bam-catalog-polish-impl.diff`, `bam-catalog-polish-impl-manifest.json`. 같은 임시 폴더의 `bam-catalog-polish-impl-content-audit.json`에서 콘텐츠 52파일의 바이트 불변을 확인했다. 교육 내용의 새 검증·감사 PASS를 뜻하지 않는다.
- 테스트 작성 인계: `/private/tmp/bam-catalog-polish-tests.diff`, `bam-catalog-polish-tests-manifest.json`, `bam-catalog-polish-tests-final.log`. 승인된 5개 테스트 파일의 focused 결과는 **54/54 PASS, 실패·건너뜀 0**이다. 작성자 결과이며 독립 검증과 전체 gate를 대신하지 않는다.
- 실제 브라우저에서 신규 안내의 조사 오류와 390px 화면의 앵커 제목이 고정 헤더에 5.375px 가리는 현상을 발견해 구현자에게 반환했다. 안내 문구와 제목의 `scroll-margin-top`을 88px로 수정했으며 제품의 최종 SHA는 위 구현 manifest를 따른다. 독립 검증자가 최종 문구와 320px·390px의 앵커 가림 해소를 실제 브라우저에서 재확인했다. 이 수정은 전체 gate 전이며 이번 전체 gate 실패 이력은 없다.

## 최종 검증 증거

- 독립 `test_engineer` **PASS**: `/private/tmp/bam-catalog-polish-independent-report.json`, `bam-catalog-polish-independent-focused.log`. 카탈로그·교안 답안·shell·독립 복습·Markdown·기존 문제 복습·복귀 경로·세션·접근성·view lifecycle의 10개 테스트 파일을 `node --test`로 실행해 **91/91 PASS, 실패·건너뜀 0**을 확인했다. 이후 안내 문구와 앵커 CSS만 수정했으며 해당 경로는 위 실제 브라우저 재검증으로 확인했다.
- 실제 인앱 브라우저 1280px·390px·320px에서 두 목록의 초기/주제/검색/초기화, JS 과정 묶음과 알고리즘 분리·준비 중 상태, 목표·요약 1회 표시, 키보드·내부 코드/표 스크롤, 미채점·채점 후 문서 왕복과 새로고침·선택·펼친 해설·복귀 초점을 확인했다. 콘솔 오류·경고 0이며 콘텐츠 52파일의 바이트 불변도 독립 확인했다. 총괄은 사용자 `localhost:4189` 탭을 새로고침해 주제 선택과 `values` 상단 배치를 확인했다.
- 독립 `project_integrator` **PASS**: `/private/tmp/bam-catalog-polish-integration-20260913-ognpced3/integration-report.json`, 같은 폴더의 `npm-run-check.log`. 소스 189파일의 안전한 `project` 복제본에서 **`npm run check` 1회, exit 0**. 콘텐츠 검증은 교안 34·객관식 52·Quest 18·코딩테스트 6·Web Project 1을 통과했고 **594/594 테스트 PASS, 실패·건너뜀 0**, 복제본 정적 build 89파일의 원본 SHA 일치를 확인했다.
- 통합 전후 원본 소스 변경 0, 콘텐츠 52파일 변경 0, 원본 `dist` 82파일·일반 Git 17파일을 포함한 보호 1,542파일 변경 0, 문서 링크 179개 오류 0이다. 전체 gate 뒤 변경은 이 카드의 증거 기록뿐이며 check·build를 재실행하지 않는다.

이번 검증은 제품 UI 범위다. 전체 34교안·52문항의 수동 전수 확인, 레거시 실습 화면의 브라우저 전수 확인, 실제 모바일 기기·스크린리더, 설치·네트워크 차단·저장 오류 주입은 수행하지 않았다. 새 교육적 정확성·학습 효과 감사, 원격 CI·commit·PR·merge·배포 완료를 주장하지 않는다. 밤위키 원문·설정과 기존 콘텐츠·진도 계약을 유지하며 R2 기능·팔레트 적용은 후속 범위다.
