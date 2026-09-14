# 외부 Git 웹과제 설계

이 문서는 BAM.dev 웹과제의 학습 흐름, 별도 Git 저장소, 과제 폴더·참조·정답 비교 계약의 목표 설계 정본이다. 현재 앱 안의 HTML·CSS Web Project 계약은 [`../web-project-authoring.md`](../web-project-authoring.md)와 [ADR 0004](../decisions/0004-local-web-project-evaluation.md)에 남긴다. 결정 문구·이유·날짜의 정본은 [`DEC-WEB-ASSIGN-01`](../roadmap.md#2026-08-29-확정-제품-결정)과 [`DEC-SPRING-BOOT-01`](../roadmap.md#2026-09-04-확정-제품-결정)이고, 이 문서는 그 결정이 외부 과제 경계에 미치는 효과를 풀어 쓴다.

## 결정 적용과 현재 차이

- `DEC-WEB-ASSIGN-01` 적용: 학습자는 HTML·CSS·JavaScript·Java 실습 폴더를 내려받아 로컬 도구에서 요구사항을 구현하고, BAM.dev 안내에 따라 자신의 코드와 검증된 solution commit을 비교한다.
- `DEC-SPRING-BOOT-01` 적용: 향후 Spring Boot의 실제 실행은 앱 본체나 Java 코딩테스트 runner가 아니라 별도 외부 Git 웹과제에서 시작한다. 연결 교안은 앱 안의 정적 콘텐츠다.
- `[현재 사실]` 현재 BAM.dev Web Project는 앱 내부에서 HTML과 CSS 두 파일만 편집·평가하며 JavaScript를 허용하지 않는다.
- `[현재 사실]` 외부 과제 저장소와 Java·Spring Boot 외부 과제는 아직 존재하지 않는다.
- `[확인 필요]` 한 저장소인지 언어별 저장소인지, 정확한 branch·tag 구조, Java·Spring Boot 과제 계약과 기존 인앱 Web Project의 최종 처리 방식은 아직 확정되지 않았다.

기존 인앱 Web Project를 즉시 삭제하거나 완료된 새 흐름으로 표현하지 않는다. 새 외부 과제의 starter, 정답·검증과 복구 흐름이 실제로 준비될 때까지 현재 구현은 레거시 학습 경로로 유지한다.

BAM.dev의 과제 안내·진도 화면은 [`visual-design.md`](visual-design.md)의 전역 색상·상태 계약을 따른다. 학습자가 만드는 HTML·CSS 결과물과 clone한 과제 UI에는 BAM.dev 팔레트를 강제하지 않는다.

## 학습자 흐름

```text
BAM.dev에서 선수 교안·Quest와 과제 목표 확인
→ 저장소와 정확한 starter 참조 확인
→ pinned starter·solution commit을 포함하도록 저장소 clone·fetch
→ 자신의 work 브랜치 만들기
→ 요구사항을 순서대로 구현·commit
→ 공개 검증 명령과 수동 체크리스트 실행
→ 자신의 결과를 먼저 설명
→ solution 참조와 diff·commit 흐름 비교
→ BAM.dev에서 로컬 완료·회고 기록
```

solution 참조는 시도 전에 자동 checkout하거나 화면에 전체 코드를 먼저 노출하지 않는다. 공개 저장소이므로 답안을 보려는 사용자를 기술적으로 막는다고 주장하지 않고, 학습 순서와 공개 정책으로 안내한다. archive는 Git 이력·branch·commit 비교를 제공하지 않으므로 기본 학습 흐름이 아니다. `DEC-WEB-OFFLINE-01`에서 archive 배포를 채택하면 폴더 복사·수동 비교만 제공하는 별도 비-Git 대체 흐름으로 표시한다.

## 권장 최소 저장소 모델

`[제안]` 서버·저장소 운영 부담을 줄이기 위해 먼저 하나의 별도 저장소 `bam-dev-assignments`에 네 트랙을 둔다. Java의 도구체인·릴리스 주기가 실제로 독립 운영을 요구할 때만 저장소 분리를 다시 판단한다.

```text
bam-dev-assignments/
├── README.md
├── assignments.json
├── html/<assignment-id>/
├── css/<assignment-id>/
├── javascript/<assignment-id>/
└── java/<assignment-id>/
```

`[제안]` 중앙 저장소의 최소 참조는 다음과 같다.

```text
main                                  카탈로그·공통 사용법
starter/<track>/<assignment-id>       보호하는 게시용 기초 뼈대 참조
solution/<track>/<assignment-id>      보호하는 게시용 정답 참조
```

학습자는 starter에서 자신의 로컬 `work/<assignment-id>` 브랜치를 만들고 중앙 저장소에 직접 push하지 않는다. 원격 백업이나 공유가 필요하면 자신의 fork를 사용한다.

`dev`를 starter와 학습자 통합 대상으로 동시에 쓰지 않는다. BAM.dev 본 저장소에서 `dev`는 통합 브랜치이고, starter에 구현 결과를 계속 합치면 더 이상 재현 가능한 기초 뼈대가 아니기 때문이다.

요구사항별 중앙 branch를 모두 만들지 않는다. `brief.md`에 요구사항 순서를 기록하고 solution branch에는 요구사항별 작은 commit을 남긴다. branch와 tag 이름은 이동할 수 있으므로 배포 정본은 항상 commit SHA다. 중간 정답 이름이 꼭 필요할 때만 `solution/<track>/<assignment-id>/v<revision>/step-01` 같은 버전 tag를 만들고 해당 commit SHA도 manifest에 고정한다.

이 branch 모델은 bam이 결정하기 전까지 생성 지시가 아닌 초안이다. 이번 문서 작업에서는 GitHub 저장소나 branch를 만들지 않는다.

## 과제 메타데이터 계약

BAM.dev의 과제 안내와 외부 저장소는 안정 ID와 commit으로 연결한다.

```text
assignmentId / revision
track / title / summary
prerequisiteLessonIds / conceptIds / prerequisiteQuestIds
newExperienceIds
repoUrl
starterRef / starterCommit
solutionRef / solutionCommit
briefPath
requiredFiles / requiredTools
orderedSteps[]: id / requirement / acceptance
verificationCommands[]
manualChecks[]
solutionRevealPolicy
estimatedMinutes
```

branch 이름만 저장하면 branch가 움직여 과제 내용이 달라질 수 있으므로, 배포된 과제는 검증한 commit SHA도 함께 고정한다. 과제 저장소의 starter·solution을 먼저 검증한 뒤 BAM.dev manifest가 그 commit을 가리키게 한다.

## 트랙별 과제 계약

### HTML

- `brief/article.md`처럼 한 주제의 내용과 정보 관계를 제공한다.
- 학습자는 내용을 복사해 붙이는 것이 아니라 제목·구역·목록·링크·폼 등 의미에 맞는 HTML 구조를 선택한다.
- CSS와 JavaScript가 없어도 문서 순서와 레이블이 이해되어야 한다.
- 검증은 문법 전체를 보증한다고 과장하지 않고 선언한 의미 구조·접근성 체크와 사람 검토를 분리한다.

### CSS

- 승인된 HTML 뼈대를 고정하고 학습자는 CSS 파일을 작성한다.
- 교안에서 배운 선택자, cascade, box model, Flex, Grid, 반응형, 초점 표시를 실제 화면에 조합한다.
- 특정 픽셀 복제보다 좁은 화면·키보드·내용 증가에서 유지되는 동작을 완료 조건으로 둔다.
- HTML 뼈대를 임의 변경해야만 통과하는 요구는 CSS 과제와 분리한다.

### JavaScript

- 기본 HTML·CSS와 로컬 fixture를 제공하고 외부 API 없이 동작하게 한다.
- 댓글 등록·조회·수정·삭제, 게시물 좋아요처럼 요구사항을 독립 단계로 나눈다.
- 각 단계는 상태 원본, 이벤트, DOM 반영, 빈 값·중복 클릭·새로고침 같은 경계를 명시한다.
- 서버가 없는 과제에서 원격 저장을 약속하지 않는다. 영속성이 필요하면 `localStorage` 또는 메모리 경계를 요구사항에 명시한다.
- 정답은 한 번에 큰 완성 commit이 아니라 요구사항별 작은 commit으로 비교할 수 있게 한다.

### Java

- `[확정 결정]` 뼈대 → 요구사항 구현 → 정답 비교라는 학습 흐름은 JavaScript와 같다.
- `[확인 필요]` 첫 Java 과제가 콘솔·도메인 로직과 메모리 저장소인지, 이후 Spring Boot 과제보다 어떤 순서로 제공할지 정해야 한다.
- 서버 운영 부담과 현재 Java 샘플 상태를 고려한 권장 초안은 댓글·좋아요 도메인을 클래스·컬렉션·서비스와 테스트로 구현하고 원격 서버·DB 없이 실행하는 형태다.
- JDK 25 도구체인의 정확한 제공 방식, 빌드 도구, 테스트 명령과 IDE 독립 실행 계약을 확정하기 전에는 Java 과제를 배포 완료로 표시하지 않는다.

### Spring Boot

- `[확정 결정]` 교안은 BAM.dev 앱 안의 정적 콘텐츠로 제공하고 실제 Spring Boot 프로젝트 실행은 외부 웹과제 폴더에서 시작한다. 앱 본체나 Java 코딩테스트 runner에 Spring Boot를 포함하지 않는다.
- `[현재 사실]` Spring Boot 교안·Code Quest·과제 ID·저장소·starter·solution·빌드와 공개 검증은 아직 없다.
- `[확인 필요]` MVP 포함 시점·정확한 교안 범위·Code Quest 여부는 `DEC-JAVA-01`, 과제 ID·저장소·starter/solution·빌드 도구·공개 테스트는 `DEC-WEB-REPO-01`, 의존성·버전·오프라인 cache는 `DEC-WEB-OFFLINE-01`에서 정한다.
- 과제에 로컬 HTTP 실행이 필요해도 학습자가 외부 폴더에서 시작·종료하며 BAM.dev 앱의 상시 서버나 Java 코딩테스트 runner로 취급하지 않는다.

## BAM.dev 웹과제 페이지

과제 페이지는 다음을 제공한다.

- 이 과제가 MVP 학습 흐름에서 필요한 이유와 새 A/E/C/T
- 선수 교안·Code Quest·코딩테스트 중 실제 연결 대상과 현재 학습 위치
- 필요한 Git·런타임 도구와 사전 확인 방법
- 저장소 URL, 고정 starter·solution commit을 로컬에 확보하는 안전한 clone·fetch·switch 명령
- 폴더·파일 구조와 수정 가능·금지 경로
- 순서 있는 요구사항과 관찰 가능한 완료 조건
- 실행할 공개 검증 명령과 수동 접근성·모바일 체크리스트
- 정답을 보기 전 자기 설명·commit 안내
- 고정 solution 참조와 commit별 비교 방법
- 처음 clone·fetch에는 인터넷이 필요하며, 두 pinned commit의 로컬 존재를 확인한 뒤 구현·검증·정답 비교는 오프라인이라는 경계

BAM.dev는 MVP에서 GitHub API로 branch를 조회하거나 사용자의 로컬 Git 상태를 자동 판정하지 않는다. 명령을 자동 실행하지 않고 복사 가능한 안내로 제공하며, 완료는 학습자의 로컬 체크와 회고로 기록한다.

## 검증과 인계

외부 과제는 두 저장소의 증거가 필요하다.

1. 과제 저장소: starter가 요구사항의 정답을 미리 포함하지 않는지, solution과 공개 검증이 통과하는지, 단계별 commit이 독립적인지 확인한다.
2. BAM.dev 저장소: manifest의 ID·concept·URL·ref·commit·경로가 실제 과제 저장소와 일치하는지 확인한다.

콘텐츠 생성자는 자신의 starter·solution을 최종 승인할 수 없다. `content_validator`는 교육 목표·중복·정답 누출과 설명을, `test_engineer`는 실제 clone·checkout·검증 명령을, `project_integrator`는 두 저장소의 고정 참조와 문서·버전 정합성을 확인한다.

## 완료 조건

- 새 폴더에서 문서만 따라 starter를 받을 수 있다.
- starter에는 요구사항의 완성 코드가 없고 필요한 로컬 자산은 모두 들어 있다.
- 네트워크를 끊기 전에 pinned starter·solution commit과 필요한 로컬 자산을 확보했음을 확인하며, 그 뒤 구현·검증·정답 비교가 오프라인에서 가능하다.
- 요구사항마다 입력·상태·사용자 행동과 완료 조건이 관찰 가능하다.
- solution은 모든 공개 검증을 통과하고 요구사항별 commit 또는 고정 중간 참조를 제공한다.
- branch 이름뿐 아니라 검증한 commit이 BAM.dev에 고정된다.
- 학습자의 work를 중앙 starter나 solution branch에 push하지 않는다.
- HTML·CSS는 접근성과 모바일, JavaScript·Java는 상태·오류·데이터 경계를 포함한다.

## bam의 결정이 필요한 항목

- 한 저장소에 네 트랙을 둘지 언어별 저장소로 나눌지
- 권장 `starter/solution` 보호 branch + 고정 commit 모델을 채택할지, 중간 정답 version tag가 필요한지
- 최초 GitHub 접속 없이 시작하도록 starter를 설치본에 포함할지
- 현재 인앱 Web Project를 병행·이관·종료 중 어떻게 처리할지
- Java·Spring Boot 과제의 포함 순서, ID, 저장소·starter/solution과 공개 검증
- JDK 25 도구체인 제공 방식, Spring Boot 빌드 도구·의존성 버전과 오프라인 cache

결정 ID와 구현 순서는 [`../roadmap.md`](../roadmap.md)가 담당한다.
