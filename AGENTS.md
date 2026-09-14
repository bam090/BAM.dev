# BAM.dev 에이전트 운영 규칙

## 작업 전 문서 라우팅

1. [`docs/README.md`](docs/README.md)의 라우팅 표에서 이번 작업에 해당하는 정본·절만 읽는다. 제품 범위·우선순위를 판단할 때만 [`docs/product-scope.md`](docs/product-scope.md)·[`docs/roadmap.md`](docs/roadmap.md)의 관련 절을 확인한다.
2. 변경 작업은 [`docs/development-workflow.md`](docs/development-workflow.md#작업-유형-분류)에서 실제 영향에 맞게 분류한다. 읽기 전용 답변은 변경 파이프라인을 시작하지 않는다. 같은 작업에서 확인한 문서는 변경되었거나 판단 근거가 부족할 때 다시 읽고, 하위 역할은 자기 경로·판정에 필요한 원문과 diff를 독립 확인한다.
3. 학습 교안의 저작·승인 범위는 [`docs/lesson-authoring.md`](docs/lesson-authoring.md#저작과-관리-책임-경계), 학습 경험 변경은 [`docs/learning-content-design.md`](docs/learning-content-design.md)를 따른다. `learning_document_manager`는 접수·출처·ID·링크·상태와 검증 인계를 맡으며 교육 내용 보완은 권한을 받은 작성자에게 반환한다.
4. UI 색상·theme·focus·상태 표현은 [`docs/designs/visual-design.md`](docs/designs/visual-design.md), Code Quest·코딩테스트·설치형 앱·외부 웹과제는 각각 [`docs/designs/code-quest.md`](docs/designs/code-quest.md), [`docs/designs/coding-test.md`](docs/designs/coding-test.md), [`docs/designs/local-application.md`](docs/designs/local-application.md), [`docs/designs/web-assignments.md`](docs/designs/web-assignments.md)의 관련 절을 읽는다.
5. 제품 코드·실행 경계를 바꾸면 [`docs/architecture.md`](docs/architecture.md), 콘텐츠 형식·연결을 바꾸면 [`docs/content-schema.md`](docs/content-schema.md)와 해당 작성 가이드를 확인한다.

bam의 최신 명시적 지시가 먼저다. 현재 상태를 판단할 때는 실행 가능한 저장소 사실이 서술 문서보다 우선하고, 정책을 판단할 때는 효력이 유지되는 `[확정 결정]`만 의무 규칙으로 취급한다. `[대체됨]`은 최신 결정이 연결된 이력이며 현재 gate가 아니다. `[제안]`은 해당 결정 전까지 설계 초안이며 완료 gate로 강제하지 않는다. 목표 설계를 현재 구현 완료로 표현하지 않고, 충돌은 `[현재 사실]`, `[확정 결정]`, `[대체됨]`, `[제안]`, `[추론]`, `[확인 필요]`로 구분한다.

## 총괄·역할 경계

- bam의 명시적 선호에 따른 이 프로젝트의 모델 지정 예외로, `README.md`의 작성·수정·검토·통합·Git 게시 작업은 GPT-6 Astra를 명시 지정하고 추론 강도는 기본 `medium`, 필요시 상향한다. 기존 역할을 한 에이전트로 합치지 않으며 역할 독립성·승인·검증 재사용 규칙을 유지한다.
- [`DEC-ORCHESTRATION-01`](docs/roadmap.md#2026-09-02-확정-운영-결정)에 따라 총괄 orchestrator는 저장소 파일을 직접 수정하지 않고, 필요한 임시 하위 에이전트에게 문서·학습 문서 관리·시각 자산·콘텐츠·기능·테스트·독립 검증·프로젝트 통합·Git을 각각 위임한다.
- 작업 전에 하위 에이전트별 소유 파일·경로를 지정한다. 겹치는 파일이나 경로는 병렬로 수정하지 않고 선행 작업의 실제 diff를 총괄이 확인한 뒤 순차 인계한다.
- 총괄은 하위 에이전트의 보고만 신뢰하지 않고 실제 파일·diff·명령과 검증 증거를 독립 확인한 뒤 다음 단계 진행·반환을 결정한다.
- `learning_document_manager`는 bam이 작성한 학습 교안의 관리 역할이며, bam의 명시적 요청 없이 교육 내용을 생성하거나 재작성하지 않는다.

## 반드시 지킬 제품·기술 경계

- 초보 개발자가 개념을 자신의 말로 설명하고 직접 구현하도록 돕는다. 정답보다 개념, 관찰 지점과 단계별 힌트를 먼저 제공한다.
- [`DEC-CONTENT-01`](docs/roadmap.md#2026-08-30-확정-제품-결정)에 따라 새 학습 경험과 학습 행동을 의미 있게 바꾸는 콘텐츠는 경험 카드 전체 항목을 검토하고 새 A·E·C 또는 T 기회 중 하나 이상의 근거를 먼저 남긴다. release 차단 기존 콘텐츠는 M6 전 깊이별로 전수 지도하되 감사를 기존 PASS·전면 재작성·자동 삭제로 해석하지 않고, 차단 gap의 수정은 별도 작업으로 반환한다.
- 실행하지 않은 결과를 지어내지 않는다. [`DEC-PUBLIC-EVALUATION-01`](docs/roadmap.md#2026-08-29-확정-제품-결정)에 따라 BAM.dev 앱 결과에는 설치본의 공개 평가만, 외부 Git 웹과제에는 고정된 실습 묶음의 공개 로컬 검증만 사용한다. 비공개·숨김 테스트와 원격 추가 채점은 사용하지 않는다.
- [`DEC-LOCAL-EVALUATION-01`·`DEC-JAVA-CODING-TEST-01`·`DEC-JAVA-RUNTIME-01`](docs/roadmap.md#2026-09-02-확정-제품-결정)과 [`DEC-JAVA-VERSION-02`](docs/roadmap.md#2026-09-04-확정-제품-결정)에 따라 설치형 MVP의 JavaScript Code Quest·코딩테스트는 공개 테스트마다 one-shot Worker를 사용하고, Java 코딩테스트도 설치본의 공개 테스트만 사용자 기기에서 실행하는 필수 목표다. Java runner는 설치 패키지 내부의 JDK 25 LTS 계열 경로만 사용하고 Java 교안·코딩테스트 소스와 공개 테스트는 정식 Java 25 언어·표준 API 기준으로 preview 없이 컴파일·실행하며, 시스템 JDK나 이를 먼저 쓰는 prototype 경로를 요구하지 않는다. Java를 Worker로 실행한다고 가정하지 않으며 `DEC-JAVA-RUNNER-01`의 나머지 계약·격리 ADR·prototype 전에는 구현하지 않는다. 내부 runner DTO·실행 추상화만 재사용할 수 있고 두 제품 경계는 합치지 않으며 Docker·Spring Boot·PostgreSQL·Nginx·계정·사용자 관리 수신 포트를 요구하지 않는다.
- [`DEC-SPRING-BOOT-01`](docs/roadmap.md#2026-09-04-확정-제품-결정)에 따라 Spring Boot 과정은 향후 추가하되 교안은 정적 콘텐츠로 관리하고 실제 실행은 승인된 외부 Git 웹과제에서 시작한다. BAM.dev 앱 본체와 Java 코딩테스트 runner에는 Spring Boot를 포함하지 않으며 과정의 MVP 시점·교안 범위·Code Quest·과제·빌드·의존성·오프라인·공개 검증 계약을 확정된 것으로 가정하지 않는다.
- [`DEC-JAVA-IMPLEMENTATION-01`](docs/roadmap.md#2026-09-04-확정-제품-결정)에 따라 Java는 BAM.dev 제품 구현 언어이며 최소 Java 제품 구성요소인 코딩테스트 로컬 runner는 Java 25로 작성한다. 이는 학습자 소스의 Java 25 기준과 별도 계약이고 Spring Boot 사용 승인이 아니다. 현재 Java 제품 코드·빌드 설정·runner는 없으며 `DEC-JAVA-RUNNER-01` 전에는 구체 구조나 구현 완료를 가정하지 않는다.
- 접근성과 키보드 흐름은 변경 영향에 맞게 확인한다. 플랫폼별 구현·검사와 완료 판정은 승인된 대상에 한정하며, 제품 전체 모바일 지원 목표를 모든 개별 작업의 완료 조건으로 확대하지 않는다.
- [`DEC-FRONTEND-01`](docs/roadmap.md#2026-09-04-확정-제품-결정)에 따른 목표 UI는 HTML·CSS 기반의 React·TypeScript이며 JavaScript도 유지한다. 현재 HTML·CSS·Vanilla JavaScript와 검증된 Worker·도메인 로직을 전면 재작성하지 않고, `DEC-FRONTEND-MIGRATION-01`에서 버전·빌드·정적 번들·CSP·Worker·첫 이관 경계를 확정한 뒤 작은 화면부터 단계적으로 옮긴다. [`DEC-DELIVERY-01`](docs/roadmap.md#2026-08-29-확정-제품-결정)에 따른 목표 배포물은 원격 운영 서버·계정·원격 DB 없이 설치해 쓰는 로컬 프로그램이며 핵심 학습 흐름은 설치 후 오프라인이어야 한다.
- [`DEC-DESKTOP-PROTOTYPE-01`](docs/roadmap.md#2026-08-30-확정-제품-결정)에 따른 macOS 14.8.3·Apple Silicon은 prototype 검증 환경일 뿐 지원 OS가 아니고 Electron·DMG도 채택 기술이 아니다. 별도 구현 승인과 prototype 증거 없이 의존성을 추가하거나 설치 지원·완료를 주장하지 않으며, 공식 선택은 `DEC-DESKTOP-01`을 기다린다.
- 콘텐츠와 사용자 상태를 분리하고 안정적인 ID로 연결한다. 사용자 진도는 저장소 인터페이스 뒤의 `localStorage` 구현을 사용한다.
- 외부 의존성은 이점과 비용을 문서화한 뒤 정확한 버전으로 추가한다. Supabase 키, 서비스 역할 키와 비밀값을 커밋하지 않는다.
- [`DEC-CODE-QUALITY-01`](docs/roadmap.md#2026-09-04-확정-운영-결정)에 따라 새 코드와 실제 수정 코드는 [`사람이 이해하기 쉬운 코드 기준`](docs/development-workflow.md#사람이-이해하기-쉬운-코드-기준)을 통과해야 한다. 역할·의도·입출력·오류·부작용이 드러나는 작은 변경을 만들고, 미래용 추상화·불필요한 분할·해석하기 어려운 축약·클린 코드 명목의 전면 재작성을 하지 않는다.
- [`DEC-QUEST-SEPARATE-01`](docs/roadmap.md#2026-08-29-확정-제품-결정)에 따라 Code Quest와 코딩테스트는 별도 목적·콘텐츠·route·UI·진도를 유지한다. 내부 평가기 재사용을 제품 통합으로 해석하지 않는다.
- [`DEC-WEB-ASSIGN-01`](docs/roadmap.md#2026-08-29-확정-제품-결정)에 따른 웹과제는 별도 Git 실습 폴더에서 수행한다. 저장소·branch·Java 실행 계약이 확정되기 전에는 외부 저장소나 branch가 존재한다고 가정하지 않는다.

## 변경·검증 규칙

- 사용자가 만든 기존 변경과 읽기 전용 원본 자료를 삭제하거나 덮어쓰지 않는다. 복제본과 파생 콘텐츠는 출처를 기록한다.
- 변경 파일과 직접 영향받는 기능·의존관계만 검증하고, 이미 통과한 무관한 주제는 기존 증거를 재사용한다. 통합 때도 전체 테스트·빌드를 자동 반복하지 않으며 다른 가이드의 전체 gate 표현보다 [`공통 검증과 재검증`](docs/development-workflow.md#공통-검증과-재검증)의 변경 범위 선정 계약을 우선한다. 실제 실행·재사용·미실행 범위를 구분해 인계한다.
- 콘텐츠 추가·변경은 스키마, ID·순서·파일 경로·교안·개념 연결과 기준답안·대표오답을 함께 검증한다.
- 새 기능·콘텐츠는 기존 정본에 현재 상태, 목표, 사용자 흐름, 데이터·안전·접근성·오프라인, 마이그레이션과 검증 조건을 설계한 뒤 구현한다. 파일별 설명 문서를 만들지 않고 변경 가능한 제품 경계별 정본 하나를 둔다.
- 콘텐츠 생성자는 자신의 결과를 최종 승인할 수 없다. `content_validator`, `test_engineer`, `project_integrator`의 책임·금지·반환점은 [`docs/development-workflow.md`](docs/development-workflow.md)를 따른다.
- 현재 코드·테스트·Git·CI에서 확인하지 않은 기능, 통과, commit, PR, merge 또는 배포를 완료 사실로 기록하지 않는다.

## Git 흐름

- 목표 통합 브랜치는 `dev`이고 이후 기능 브랜치는 `codex/<feature>` 형식을 사용한다. `main`은 빈 초기 기준선 규칙을 유지한다.
- 0~3차의 `codex/js-foundation`·Draft PR 규칙은 역사적 특수 범위다. 현재 실제 Git 상태와의 차이는 [`docs/roadmap.md`](docs/roadmap.md)에 따르며 검증되지 않은 병합 이력을 만들지 않는다.
- 통과한 작은 변경만 `dev` 대상 PR로 올리고 커밋과 PR 설명은 한국어로 작성한다.
- force push, `reset --hard`, `clean`을 사용하지 않는다.
