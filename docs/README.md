# BAM.dev 문서 지도

이 문서는 긴 대화 대신 프로젝트 문서에서 현재 목표, 범위, 설계와 작업 절차를 찾기 위한 시작점이다. 같은 사실을 여러 문서에 복사하지 않고 아래 정본에만 기록한다. **정본은 그 주제를 기록하는 유일한 위치라는 뜻이지, `[제안]`이 자동으로 확정됐다는 뜻은 아니다.**

## 우선순위

먼저 질문이 **현재 상태**인지 **정책·목표**인지 구분한다.

- 현재 구현·검증·Git·CI 상태는 bam의 최신 지시 다음으로 코드·콘텐츠·테스트·설정과 실제 명령 결과를 우선한다. 서술 문서가 다르면 실행 가능한 저장소 사실이 우선이며 차이를 기록한다.
- 정책·목표·작업 방식은 bam의 최신 지시 → [`AGENTS.md`](../AGENTS.md)의 확정 운영 규칙 → 아래 정본의 `[확정 결정]` → 채택된 [ADR](decisions/)과 작성 계약 순으로 판단한다.
- `[제안]`, `[추론]`, `[확인 필요]`, 날짜가 있는 검증·출처 기록, 과거 대화와 외부 참고 자료는 확정 결정을 대신하지 않는다.

과거 대화는 결정 배경을 찾는 보조 근거일 뿐이다. 실행하지 않은 결과나 존재하지 않는 Git·CI 성과를 만들지 않는다.

## 상태 표기

새로운 정책·계획 문서에서는 다음 표기를 사용한다.

| 표기 | 뜻 |
| --- | --- |
| `[현재 사실]` | 현재 저장소의 문서·코드·테스트·Git에서 직접 확인한 상태 |
| `[확정 결정]` | bam의 명시적 지시 또는 채택된 ADR로 확정된 규칙 |
| `[대체됨]` | 과거 확정됐지만 더 최신 결정으로 효력이 끝난 이력. 연결된 대체 결정만 현재 규칙으로 사용 |
| `[제안]` | 적용 전 검토가 필요한 설계 초안 |
| `[추론]` | 확인한 사실에서 도출했지만 명시적으로 확정되지 않은 판단 |
| `[확인 필요]` | 정보나 사람의 선택이 부족해 아직 결정할 수 없는 항목 |

날짜가 있는 검증 결과는 그 시점의 증거다. 이후 변경의 현재 통과 상태를 대신하지 않는다.

## 정본과 작업 라우팅

[`DEC-INSTRUCTIONS-01`](roadmap.md#2026-09-14-확정-운영-결정)에 따라 아래 표에서 이번 판단·변경에 해당하는 정본의 관련 절만 읽는다. 이미 확인한 내용은 변경되었거나 근거가 부족할 때 다시 확인하며, 읽기 전용 답변에는 변경 파이프라인을 적용하지 않는다.

| 찾으려는 내용 | 정본 | 언제 읽는가 |
| --- | --- | --- |
| 현재 제품 소개·실행 방법·구현 수량 | [`README.md`](../README.md) | 제품 소개·실행 방법·구현 수량이 필요한 경우 |
| 제품 목표, 오프라인 개인 학습 MVP 범위·비범위·완료 조건 | [`product-scope.md`](product-scope.md) | 기능 필요성과 MVP 포함 여부를 판단할 때 |
| 현재와 MVP 목표의 차이 | [`product-scope.md`](product-scope.md) | MVP gap을 판단할 때 |
| 전환 순서, MVP 이후 단계, bam 결정 대기 항목 | [`roadmap.md`](roadmap.md) | 우선순위나 다음 작업을 정할 때 |
| bam이 작성하는 교안의 단위·구조·문체·예제·출처·완료 조건과 제출 교안 관리 경계 | [`lesson-authoring.md`](lesson-authoring.md) | bam이 교안을 작성하거나 `learning_document_manager`가 제출 교안을 관리할 때 |
| 알고리즘 접근 방식·조합, 새 학습 경험, 반복과 중복 판정 | [`learning-content-design.md`](learning-content-design.md) | 교안·객관식·Code Quest·코딩테스트·웹과제를 만들거나 바꿀 때 |
| 작업 유형별 파이프라인, 역할, 증거, 완료·실패·통합 조건 | [`development-workflow.md`](development-workflow.md) | 변경을 시작할 때 해당 유형과 역할의 절 확인. 인계·반환 시에는 바뀐 범위와 무효화된 증거 확인 |
| 사람이 이해하기 쉬운 코드의 구현·검토 기준 | [`development-workflow.md`](development-workflow.md#사람이-이해하기-쉬운-코드-기준) | 제품 코드를 설계·구현·테스트·통합할 때 |
| 현재 런타임·저장소·평가 안전 경계 | [`architecture.md`](architecture.md) | 제품 코드나 평가 방식을 바꿀 때 |
| 프런트엔드 현재·목표 기술과 점진 이관 경계 | [`architecture.md`](architecture.md#목표-설치형-구조), [`roadmap.md`](roadmap.md#bam-결정-대기-목록) | UI 구현·의존성·빌드·Worker 경계를 바꿀 때 |
| 콘텐츠 데이터 계약과 안정 ID | [`content-schema.md`](content-schema.md) | 콘텐츠 파일·스키마·연결을 바꿀 때 |
| 독립 학습문서·객관식 진입, 키워드·풀이·개념·문서 왕복·재도전 | [`designs/lesson-review.md`](designs/lesson-review.md) | 학습 문서와 객관식 복습 흐름을 연결하거나 변경할 때 |
| `#/my` 학습 기록, 로컬 저장 표시·진도·재도전·기존 기록 호환 | [`designs/learning-history.md`](designs/learning-history.md) | 내 학습 기록 화면·저장 호환·기록 재진입을 변경할 때 |
| 객관식 표현·전제·선택지 작성 기준과 사용자 피드백 반영 | [`designs/lesson-review.md`](designs/lesson-review.md#객관식-문항-작성과-검토-기준) | 객관식을 생성·수정하거나 독립 검토할 때 반드시 읽음 |
| 전역 시각 언어·팔레트·semantic token·상태·대비 | [`designs/visual-design.md`](designs/visual-design.md) | UI 색상·theme·focus·상태 표현을 바꿀 때 |
| Code Quest 정보 구조·진도·학습 지도 | [`designs/code-quest.md`](designs/code-quest.md) | Code Quest UI·route·진도·탐색을 바꿀 때 |
| Code Quest 작성 형식 | [`code-quest-authoring.md`](code-quest-authoring.md) | Code Quest를 만들거나 바꿀 때 |
| 함수형 Quest 예제·공개 사례 표시 | [예제 가독성 계약](designs/code-quest.md#함수형-예제-가독성-개선), [작업 카드](work-items/2026-09-15-code-quest-example-readability.md) | 매개변수별 표·값 타입·전체 공개 데이터 접근과 해당 검증 상태를 확인할 때 |
| Java Quest 로컬 실행·차단 상태 | [ADR 0005](decisions/0005-java-quest-local-runtime.md), [작업 카드](work-items/2026-09-15-java-code-quest-runtime.md) | 번들 JDK·IPC·격리·종료 계약이나 현재 실행 실패·고정 비활성 gate·재개 조건을 확인할 때 |
| Algorithm Bridge 대표 Java Quest 편입 | [편입 작업 카드](work-items/2026-09-15-algorithm-bridge-quests.md), [배열 콘텐츠 계약](content-schema.md#algorithm-bridge-java-배열-quest-편입) | ARR-01·ARR-02·QUE-01의 원본 출처·학습 카드·typed 배열 평가 준비·실행 차단 상태의 코드 작성 흐름을 다룰 때 |
| 코딩테스트 목적·UI·공개 로컬 평가·진도 | [`designs/coding-test.md`](designs/coding-test.md) | 코딩테스트 제품 흐름이나 평가 표현을 바꿀 때 |
| 코딩테스트 문제 필드·작성 형식 | [`content-schema.md`](content-schema.md#코딩테스트-컬렉션) | 코딩테스트 문제·공개 테스트·실패 설명을 만들거나 바꿀 때 |
| Algorithm Bridge 원본72의 코딩테스트 전환 | [제품 계약](designs/coding-test.md#algorithm-bridge-코딩테스트-전환), [draft 데이터](content-schema.md#algorithm-bridge-java-코딩테스트-draft-계약), [전환 카드](work-items/2026-09-15-algorithm-bridge-coding-tests.md) | 전체 Quest 등록의 대체·원본 지원·옛 URL/초안 보존·Java 실행 차단과 실제 검증/게시 상태를 확인할 때 |
| 설치형 로컬 앱·오프라인·배포 경계 | [`designs/local-application.md`](designs/local-application.md) | 패키징·저장·업데이트·OS 통합을 설계할 때 |
| 밤위키 원본을 사용하는 외부 Git 웹과제 연결 계약 | [`designs/web-assignments.md`](designs/web-assignments.md) | 원본 과제·고정 시작 버전·BAM 연결과 공개 검증을 설계할 때 |
| 현재 인앱 Web Project 작성 형식 | [`web-project-authoring.md`](web-project-authoring.md) | 레거시 인앱 HTML·CSS 과제를 유지·수정할 때 |
| 문제 실행 검증의 날짜별 기록 | [`problem-verification.md`](problem-verification.md) | 과거 검증 범위와 한계를 확인할 때 |
| 콘텐츠·참고 자료의 출처 | [`reference-audit.md`](reference-audit.md), [`references/`](references/) | 출처·복제·검증 근거를 확인할 때 |
| 중요한 기술 결정과 대안 | [`decisions/`](decisions/) | 기존 기술 경계를 변경하거나 예외를 제안할 때 |

학습 콘텐츠와 제품 코드가 함께 바뀌면 학습 콘텐츠 경로를 따른다. 학습 콘텐츠 소급 감사·커버리지 증거는 Markdown만 바뀌어도 학습 콘텐츠 경로를 따르고, 그 밖의 문서만 바뀌면 문서·운영 규칙 경로를 따른다. 작업 분류의 상세 기준은 [`development-workflow.md`](development-workflow.md)가 정본이다.

`[확정 결정]` 교안 저작·관리 권한은 [`DEC-LESSON-AUTHORSHIP-01`](roadmap.md#2026-09-02-확정-운영-결정)을 따른다. 세부 책임과 금지 사항은 [`lesson-authoring.md`의 저작과 관리 책임 경계](lesson-authoring.md#저작과-관리-책임-경계), 역할 순서와 인계 증거는 [`development-workflow.md`](development-workflow.md)를 따른다. 제품·설계 문서 담당은 이 문서 지도의 제품 정본을 관리하는 별도 역할이다.

## 설계 문서화 범위

현재 다섯 영역의 제공 행동·남은 핵심과 설치형 MVP 구분은 [README의 상태 표](../README.md#현재-기능과-남은-범위), 완료 기준은 [제품 범위](product-scope.md#mvp-완료-조건)를 따른다. 현재 수량을 이 지도에 복제하지 않는다.

`[확정 결정]` 구현 전에 변경 가능한 제품 경계의 설계 정본을 먼저 작성한다. “프로젝트의 모든 부분”은 모든 함수나 파일을 해설한다는 뜻이 아니라, 사용자 흐름·데이터·실행·보안·배포 또는 여러 모듈에 영향을 주는 경계마다 다음 질문에 답한다는 뜻이다.

```text
현재 무엇이 구현되어 있는가?
왜 바꾸며 누구의 어떤 문제를 해결하는가?
목표 사용자 흐름과 상태는 무엇인가?
콘텐츠·데이터·실행·저장 계약은 무엇인가?
오프라인·접근성·모바일·안전 경계는 무엇인가?
기존 ID·URL·진도·파일을 어떻게 보존하는가?
자동 검증과 사람 판단으로 무엇을 통과해야 하는가?
아직 결정되지 않은 것은 무엇인가?
```

새 설계 문서는 기존 정본에 수용할 수 없고 독립된 변경 경계가 있을 때만 `docs/designs/`에 추가한다. 구현 세부만 설명하거나 다른 문서의 범위·결정·규칙을 복사하는 문서는 만들지 않는다.

| 제품 영역 | 현재 사실 정본 | 목표 설계 정본 | 커버리지 상태 |
| --- | --- | --- | --- |
| 제품 목표·MVP | [`product-scope.md`](product-scope.md) | 같은 문서 | 작성됨, 세부 결정 대기 |
| 교안 학습 구조 | 실제 교안·[`content-schema.md`](content-schema.md) | [`lesson-authoring.md`](lesson-authoring.md) | bam 집필 계약·제출 교안 관리 경계 작성. [HTML 원문 기반 개념 문서 작업](work-items/2026-09-13-html-concept-lessons.md)의 작은 단위·파생·질문/직접답과 연결을 반영했으며 독립 검증·통합 판정은 카드 참조. 후속 [CSS 개념 전환](work-items/2026-09-13-css-concept-lessons.md)도 같은 작은 파생·안정 ID 계약으로 콘텐츠와 연결을 반영했으며 독립 검증·통합 상태는 카드 참조. 후속 [JS·Java 개념/객관식 전환](work-items/2026-09-14-js-java-concepts-and-review.md)은 작은 교안·추가 문제·공유 상세 연결을 반영했고 독립 내용·콘텐츠 검사 및 작성자 focused는 통과. 독립 데스크톱 실행과 수정 후 최종 통합·정적 빌드·보존 검사도 통과. 실패 이력과 검증 한계는 카드 참조. 기존 교안 전체 소급 감사와 구분 |
| 학습 문서·객관식 복습 | 현재 교안·퀴즈 코드와 [`content-schema.md`](content-schema.md) | [`designs/lesson-review.md`](designs/lesson-review.md) | R1 홈·독립 목록·키워드/단원 탐색·개별 채점·개념/문서 왕복·진행 복구 구현. [보기·채점 첫 확장](work-items/2026-09-14-review-display-and-grading.md)의 두 보기·개별/전체 채점 코드를 반영했고 반환 수정 후 독립 데스크톱 검증·최종 통합·빌드·보존 검사 통과. 모름·헷갈림·문제별 시도 이력은 후속 목표. [첫 사용 작업 카드](work-items/2026-09-12-independent-review-first-use.md)의 실제 검증과 [앞선 설계 이력](work-items/2026-09-12-independent-review-design.md)을 구분. [JS·Java 후속 계약](designs/lesson-review.md#javascriptjava-개념-문서와-객관식-전환)의 같은 언어 과정 공유 상세 문서·검증된 키워드 카드/CTA 중복 제거를 구현. 기존 문항 소유와 복귀·세션 계약을 보존하며 독립 실행·수정 후 최종 통합 PASS와 검증 한계는 작업 카드 참조 |
| 학습 경험 포트폴리오 | 현재 콘텐츠·검증 기록 | [`learning-content-design.md`](learning-content-design.md) | 조건부 소급 범위·깊이 확정, 실제 release 대상 결정·감사 대기 |
| 전역 시각 시스템 | `styles/tokens.css`, `styles/app.css` | [`designs/visual-design.md`](designs/visual-design.md) | 밝은 아이보리/보라·어두운 차콜/라벤더, theme 선택과 승인 홈·목록·읽기 UI 반영. 독립 UI 검증·통합 gate PASS와 미실행 범위는 [시안 채택 작업 카드](work-items/2026-09-13-approved-preview-adoption.md) 참조. Ocean 적용은 과거 이력. 후속 [전체 화면 사이드바 통일](work-items/2026-09-14-global-service-sidebar.md)은 남은 실습·상태 화면까지 구현하고 독립 focused·대표 데스크톱 검증 PASS. 최종 독립 문서 검토·통합도 PASS이며 실제 검증 한계는 카드 참조 |
| 프런트엔드 기술 전환 | [`architecture.md`](architecture.md), `package.json` | [`architecture.md`](architecture.md#목표-설치형-구조), ADR 0001 | React·TypeScript 목표와 점진 이관 확정, 현재 Vanilla JavaScript·무의존성 기준선 유지, 도구체인·prototype·첫 화면 결정 대기 |
| Code Quest | [`architecture.md`](architecture.md), 현 Quest 스키마·코드 | [`designs/code-quest.md`](designs/code-quest.md) | 분리 유지. [데스크톱 탐색 첫 구현](work-items/2026-09-14-code-quest-navigation.md)의 과정·주제·진도·검색/필터·지도·홈/사이드바 연결 반영, 반환 수정 후 독립 focused·대표 데스크톱 검증 PASS. 최종 독립 문서 재검·통합 PASS이며 영구 스키마·모바일·설치 목표와 구분 |
| 코딩테스트 | [`architecture.md`](architecture.md), 현 coding-test 스키마·코드 | [`designs/coding-test.md`](designs/coding-test.md) | 분리 유지. JavaScript 실행과 Java 원문 열람·작성/저장·명시 초안 가져오기 구현. 독립 콘텐츠·관련 자동 검사·대표 UI·문서·통합 및 PR #22 CI PASS. 미병합과 Java 실행 BLOCKED는 [전환 카드](work-items/2026-09-15-algorithm-bridge-coding-tests.md)에서 구분 |
| 설치·오프라인 실행 | `README.md`, [`architecture.md`](architecture.md) | [`designs/local-application.md`](designs/local-application.md) | 별도 미게시 로컬 작업에서 `.app`·Java runner 후보 작성. 이번 브라우저 게시 범위에는 포함하지 않음. 실제 격리 javac 종료/회수 실패로 Java 지원 차단·미완료이며 [작업 카드](work-items/2026-09-15-java-code-quest-runtime.md)의 재개 조건을 따름. DMG·공식 설치 지원은 별도 범위 |
| 웹과제 | [`web-project-authoring.md`](web-project-authoring.md), ADR 0004 | [`designs/web-assignments.md`](designs/web-assignments.md) | 밤위키 원본 사용 확정. 기존 인앱 과제 유지, 원본별 고정 시작 버전·BAM 연결·공개 검증·오프라인 계약은 후속 |
| 저장·평가 안전 | [`architecture.md`](architecture.md), ADR 0002~0005 | 변경 시 해당 ADR | 기존 브라우저 경계와 비활성 Java 후보의 실제 격리 실패·재개 조건을 구분 |
| 개발·검증·Git·CI | [`development-workflow.md`](development-workflow.md) | 같은 문서와 [`roadmap.md`](roadmap.md) | `DEC-GIT-01` 게시 범위 확정·기존 원격 기준선 확인. 로컬·원격 대조와 실제 게시·CI 판정은 [게시 작업 카드](work-items/2026-09-13-github-publication.md) 참조 |

## ADR 목록

- [`0001-zero-runtime-dependencies.md`](decisions/0001-zero-runtime-dependencies.md): 1차 무의존성 구현 이력. 목표 프런트엔드 gate는 `DEC-FRONTEND-01`로 대체됨
- [`0002-browser-code-execution-boundary.md`](decisions/0002-browser-code-execution-boundary.md): 브라우저 JavaScript 실행 경계
- [`0003-inert-web-code-quest-evaluation.md`](decisions/0003-inert-web-code-quest-evaluation.md): HTML·CSS Code Quest 비실행 평가
- [`0004-local-web-project-evaluation.md`](decisions/0004-local-web-project-evaluation.md): 로컬 Web Project 평가와 저장
- [`0005-java-quest-local-runtime.md`](decisions/0005-java-quest-local-runtime.md): Java Quest 로컬 실행 후보와 실제 격리 실패·재개 경계

[Algorithm Bridge 대표 세 문제 편입](work-items/2026-09-15-algorithm-bridge-quests.md)은 기존 Java pilot을 보존해 콘텐츠·배열 계약·작성/저장 UI를 반영했다. 독립 콘텐츠 검토·등록/정적 검사는 PASS이며 Java 실제 채점은 BLOCKED다. 역할별 후속 검증·통합은 카드의 receipt로 판정한다.

`[대체됨]` 후속 [Algorithm Bridge 전체 편입](work-items/2026-09-15-algorithm-bridge-all-quests.md)은 대표 3개 제한을 대체하며 신규 69개의 원본 지원·공개 소스 열람·draft 작성/저장은 [draft 계약](content-schema.md#algorithm-bridge-전체-편입의-draft-계약)을 따른다. 당시 구현·검증 상태는 해당 카드에서 확인한다. 현재 등록 위치는 [코딩테스트 전환](work-items/2026-09-15-algorithm-bridge-coding-tests.md)으로 대체했다.

## 유지 규칙

[개념별 Code Quest 확장](work-items/2026-09-14-concept-code-quests.md)은 [품질 계약](designs/code-quest.md#개념별-직접-작성-경험-확장)에 따라 신규 콘텐츠를 추가하고 기존 문제를 보존했다. 독립 콘텐츠·실행·문서 최종 재검·통합 PASS를 인수했고 PR #21 병합은 [게시 기록](work-items/2026-09-13-github-publication.md#후속-게시-기록-2026-09-15)을 따른다. 최종 계약·실제 검사 범위는 작업 카드에서 확인한다.

[Spring Security·JPA 확장](work-items/2026-09-14-spring-security-jpa.md)은 공식 문서를 근거로 기존 Spring 과정 뒤에 작은 정적 문서·객관식을 추가하는 승인 범위다. [학습 흐름 계약](designs/lesson-review.md#spring-securityjpa-정적-학습-확장)에 따라 본문·문항·발췌를 작성하고 연결했다. 독립 내용·문서·대표 데스크톱 검증과 이번 전체 gate·빌드·보존 검사를 통과하고 최종 통합 PASS 판정을 받았다. 단위별 경험·출처·반환 수정·실제 검증 한계는 작업 카드에서 확인한다.

현재 [CSS 객관식·Spring 기초 작업](work-items/2026-09-14-css-quiz-spring-foundations.md)은 [복습 확장 계약](designs/lesson-review.md#css-객관식과-springspring-boot-기초-확장)의 본문·문항·연결·표시를 반영했다. 관리 연결 검사와 독립 내용·문서·데스크톱 검증, 수정 후 전체 gate·정적 빌드·보존 검사를 통과했다. 최초 실패·수정과 실제 검증 한계는 작업 카드에 구분한다. Spring 핵심·Spring Boot의 정적 문서·문항과 실제 실행 과제의 범위를 구분하며, 작성자 경험 계획·출처·단계별 증거는 작업 카드에서 확인한다.

- 사실이 바뀌면 표에서 지정한 정본 한 곳을 먼저 고치고, 다른 문서는 링크나 짧은 안내만 갱신한다.
- 현재 수량은 `content/curriculum.json`과 컬렉션을 읽는 검증 결과로 확인하고 [`README.md`](../README.md)에만 요약한다.
- 기능의 상태와 우선순위는 [`roadmap.md`](roadmap.md)에만 기록한다. 검증 기록을 로드맵으로 사용하지 않는다.
- 학습 경험의 필요성은 [`learning-content-design.md`](learning-content-design.md)의 경험 카드로 증명한다. 문제 개수를 먼저 목표로 삼지 않는다.
- bam의 교안 작성과 제출 교안 관리·검증은 [`lesson-authoring.md`](lesson-authoring.md)의 저작 경계, 의미 구조와 완료 조건을 따른다.
- 역할별 PASS는 [`development-workflow.md`](development-workflow.md)의 증거 묶음으로 남긴다. 역할 이름은 책임을 뜻하며 Custom Agent 파일 생성을 요구하지 않는다.
- 새 문서를 만들기 전에 이 지도에서 기존 정본에 추가할 수 있는지 확인한다.
