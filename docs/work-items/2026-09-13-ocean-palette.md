# Ocean Blue Serenity 실제 적용 — 2026-09-13

## 작업과 상태

- 작업 ID: `2026-09-13-ocean-palette`. 유형은 **일반 제품 기능·코드**, 변경 성격 해당 없음이다. 교육 내용·동작을 새로 만들지 않는다.
- 승인: bam의 ‘설계 기록에 정한 팔레트를 실제 적용해 달라’는 요청. [확정 결정](../roadmap.md#2026-09-13-확정-제품-결정)과 [시각 적용 계약](../designs/visual-design.md#현재-어두운-ui에-적용하는-계약)을 따른다. 기존 어두운 방향 유지는 요청 범위를 넓히지 않는 총괄의 실행 판단이다. bam이 장기 기본 theme를 새로 선택했다는 뜻이 아니며 재선택을 요구하지 않는다.
- 현재 상태: **Ocean 팔레트 변경 범위의 구현·독립 실행·최종 통합 PASS**. 이번 항목은 전체 gate 1회에서 598/598 테스트와 정적 build를 통과했다. forced-colors 실제 실행과 전 상태의 접근성 인증은 아래 미검증 범위로 남기며 이전 자기 확인 작업의 597/597와 구분한다.
- 입력 정본: [문서 지도](../README.md), [제품 범위](../product-scope.md), [로드맵](../roadmap.md), [개발 절차](../development-workflow.md), [시각 정본](../designs/visual-design.md). 기존 무의존성·정적 실행·학습자 결과물 격리 경계를 유지한다.

## 완료할 범위

확정 9색을 `styles/tokens.css`의 primitive 한 곳에 정의하고 기존 semantic 토큰을 재사용한다. 배경은 깊은 navy, 표면은 French Blue, 본문은 밝은 cyan, 주요 행동은 turquoise와 navy 글자, 링크·focus는 밝은 cyan 계열이다. 정확한 조합은 구현자의 대비 계산과 독립 검증으로 정한다. 홈·카탈로그·문서·자기 확인·객관식·모달·레거시 실습 chrome의 브랜드 배경·글자·경계에 기존 raw 회색·파랑·민트가 남지 않게 확인한다.

성공·경고·오류·syntax·언어 배지는 보조 의미를 유지하고 새 배경에서 필요한 가독성만 보정한다. 파랑만으로 정오를 구분하지 않는다. 모든 화면의 구조·학습 코드·콘텐츠·ID·URL·진도·저장소는 유지하며 학습자가 만든 HTML/CSS 미리보기에는 제품 색을 주입하지 않는다. CSS 학습문서 분할·새 theme·의존성·설치·배포·Git·밤위키 수정은 비범위다.

## 소유권과 완료 기준

| 역할 | 허용 쓰기 경로 | 제한 |
| --- | --- | --- |
| 총괄 `/root` | 없음 | 실제 파일·diff·명령·계산을 확인하고 단계 인계 |
| 문서 `catalog_polish_docs` | `docs/designs/visual-design.md`, `docs/roadmap.md`, `docs/README.md`, 이 카드 | 구현 전 계약과 실제 증거 마감만 작성 |
| 제품 구현자 `ocean_palette_impl` | `styles/tokens.css`, `styles/app.css` | 색상·필요한 focus/상태 표시만 수정, 구조·콘텐츠·테스트 변경 금지 |
| 테스트 작성자 `self_check_tests` | `tests/accessibility.test.js`, `tests/markdown.test.js`의 코드 스포트라이트 검사 | 제품·콘텐츠 변경 금지. 대비 보정에 따른 기존 opacity 기대값 변경은 총괄의 추가 소유권 승인 뒤 수행 |
| 독립 `test_engineer` `catalog_polish_verify` | 없음 | 대비·raw 색상 잔존·대표 상태·브라우저·키보드·forced-colors 확인 |
| 독립 `project_integrator` `first_use_project_integrator` | 없음 | 앞 단계 PASS·전체 diff·보호 범위 확인 후 전체 gate 1회 |
| Git 담당 | 미배정·권한 없음 | commit·PR·merge·push 없음 |

겹치는 경로는 총괄의 실제 diff 검토 뒤 순차로 인계한다. 위 경로 외 파일, 콘텐츠·원문·공개 금지 자산·기존 `dist`·`.git`은 변경하지 않는다.

완료에는 9색 정확성·semantic 연결·브랜드 raw 값 제거, 실제 합성 배경에서 일반 글자 4.5:1·의미 있는 UI 경계와 focus 3:1, 색 외 상태 단서가 필요하다. 대표 홈·문서·문제·모달·실습 chrome의 기본/선택/hover/focus/disabled/정오·오류를 확인하고, 320px·390px·데스크톱의 읽기·키보드와 forced-colors를 실제 검증한다. 작성·검증 역할은 영향 범위 focused 검사만 실행하며 최종 독립 통합자가 안전한 `/private/tmp` 복제본에서 `npm run check`를 1회 수행한다. 원본 build 산출물은 보호하고 미실행 상태를 완료로 보고하지 않는다.

## baseline과 증거

`/private/tmp/bam-ocean-palette-20260913-crww5zzd/project`에 수정 전 소스 190파일을 복제하고 같은 폴더의 `manifest.json`에 소스와 보호 Git·dist 1,579파일 SHA를 기록했다. 기존 전체 untracked 상태를 새 Git 기준선으로 바꾸지 않았다. 정본·문서 지도 3파일은 현재 반영 사실과 작업 카드 참조로 동결했고, 최종 gate 뒤에는 이 카드의 증거만 마감한다. 추가 check·build·브라우저 검사는 수행하지 않는다.


- 초기 테스트 작성자 focused 결과: `/private/tmp/bam-ocean-palette-accessibility-tests.log`의 **16/16 PASS, 실패·건너뜀 0**. 실제 작성 diff와 SHA는 `/private/tmp/bam-ocean-palette-tests.diff`, `bam-ocean-palette-tests-manifest.json`에 있다. 작성자 결과이며 독립 검증·전체 gate를 대신하지 않는다.
- 후속 대비 보정: 코드 스포트라이트의 opacity 0.75에서 주석 대비가 4.344:1로 기준에 미달해 제품 값을 0.85로 올렸다. 기존 opacity 0.75를 기대하던 focused 검사는 **24/25 통과·1 실패**였고, 총괄이 `tests/markdown.test.js`의 해당 검사 소유권을 추가한 뒤 0.85~1 범위의 가독성 계약으로 갱신했다. 이 작성 단계 실패는 전체 gate 실패가 아니다.
- 수정 후 최종 작성자 검사: `/private/tmp/bam-ocean-palette-tests-final.log`에서 접근성·Markdown **37/37 PASS, 실패·건너뜀 0**. 위 테스트 diff·manifest는 두 파일의 최종 상태로 갱신됐다. 제품 diff와 `/private/tmp/bam-ocean-palette-impl/contrast-report.json`은 69개 대비 계산 PASS(텍스트 최저 4.544:1, 의미 있는 경계 최저 3.229:1), 콘텐츠 52파일·학습자 iframe 보호를 기록한다. 총괄의 69개 수학 재계산 오류는 0이다.
- 독립 `test_engineer` **팔레트 변경 범위 PASS**: `/private/tmp/bam-ocean-palette-independent-report.json`, `bam-ocean-palette-independent-focused.log`. 접근성·Markdown·shell·객관식·Web Project 화면의 5개 테스트 파일을 `node --test`로 실행해 **67/67 PASS, 실패 0**을 확인했다. Chrome 7개 대표 route의 320px·390px·1853px에서 선택·준비 중·본문·자기 확인·문제 정오 상태·모달·실습 chrome, 키보드 초점과 가로 넘침을 확인했다. 실제 합성 색의 대표 대비, 주석 opacity 0.85, 학습자 iframe의 고유 색상 유지와 콘솔 오류·경고 0을 확인했으며 사용자 localhost 기록은 변경하지 않았다.
- 독립 `project_integrator` **팔레트 변경 범위 PASS**: `/private/tmp/bam-ocean-palette-integration-20260913-hboma37i/integration-report.json`, 같은 폴더의 `npm-run-check.log`. 소스 191파일의 안전한 `project` 복제본에서 **`npm run check` 정확히 1회, exit 0, 598/598 PASS, 실패·건너뜀 0**. 콘텐츠 검증과 정적 build 89파일의 snapshot 바이트 일치를 확인했다. `smoke-built-assets.json`·`smoke-built-assets.log`는 build 89파일의 HTTP 응답·SHA와 진입 HTML/CSS/JS MIME PASS 및 임시 서버 종료를 기록한다.
- 전체 gate·정적 자산 smoke 중 원본·복제본 소스 변경 0, 콘텐츠 52파일과 원본 `dist` 82파일·일반 Git 17파일을 포함한 보호 1,579파일 변경 0, 문서 링크 226개 오류 0이다. 제품·테스트 SHA는 독립 실행 때와 일치하며 통합자는 브라우저를 다시 실행하지 않았다.

도구의 강제 색상 API 미지원으로 forced-colors는 기존 `Canvas`/`CanvasText` 규칙의 정적 검토만 했고 실제 브라우저 모드는 실행하지 않았다. 대비는 69개 계산과 대표 렌더링 상태의 확인이며 모든 픽셀·CSS 상태의 WCAG 인증을 뜻하지 않는다. 실제 모바일 기기·스크린리더·새 설치·오프라인·네트워크 장애·runner 실행·교육 감사·배포는 검증하지 않았다. Git commit·PR·merge·push와 밤위키·비공개 자산 변경은 없다.
