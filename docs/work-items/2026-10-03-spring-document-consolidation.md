# Spring 학습문서 통합

## 범위와 기준 상태

- 작업 ID: `SPRING-CONSOLIDATION-20261003`, 설계 revision: `r2`, 검증 기록 revision: `r3` (독립 내용·실행 검증과 공용 통합 결과 반영).
- 기준: `origin/dev`의 `02c363f473a92e8f1b21820cc199ae68e3848e24`.
- 작업 분류: 학습 콘텐츠 포함 기능. 기존 개념을 묶어 읽는 순서를 바꾸므로 경험 카드를 작성합니다.
- `[확정 결정]` 사용자는 Spring 문서 병합과 Codex의 작성·독립 검증을 요청했습니다. 원격 게시·PR 병합·배포는 이번 승인 범위에 포함되지 않습니다.
- `[현재 사실]` 원본 저장소는 `/Users/goonbam/Documents/ChatGPT/bam dev`이며 별도 복제본의 `codex/spring-document-consolidation`에서 작업합니다.
- `[현재 사실]` 기준에는 Spring 정적 교안 46개와 `content/quizzes/java.json`의 Spring 문항 92개가 있습니다. Spring은 Java 실행 언어 아래의 독립 과정입니다.
- `[현재 사실]` 설계자는 Spring 46개의 목표·선수·구조와 병합 후보 본문을 확인했습니다. 아래 표는 구현에 적용한 통합 단위이며 실제 검증 결과와 최종 통합 대기는 문서 끝에서 구분합니다.

[개발 워크플로](../development-workflow.md), [교안 작성 계약](../lesson-authoring.md), [콘텐츠 형식](../content-schema.md#css-객관식과-spring-정적-콘텐츠), [학습 경험 설계](../learning-content-design.md)를 적용합니다.
이번 작업은 새 Spring 실행 환경이나 문제를 추가하지 않습니다.

## 진단과 통합 단위

각 문서는 대부분 독립된 목표를 가지므로 단어가 겹친다는 이유로 제거하지 않습니다.
다만 같은 입력에서 연속으로 판단해야 하는 내용을 별도 페이지로 나누면서 배경·선수·응답 경계 설명이 반복됩니다.
다음 묶음은 앞 단계의 결과를 곧바로 뒤 단계의 입력으로 사용하는 관계가 명확합니다.
대표 문서에 두 목표와 반례를 모두 남기고 공통 배경만 한 번 설명합니다.
표의 `key`는 `spring-<key>` ID와 `content/lessons/spring/<key>.md`를 뜻합니다.

| 대표 key | 흡수 key | 통합 제목안·핵심 질문 | 보존할 판단과 통합 이유 |
| --- | --- | --- | --- |
| `boot-start` | `component-scan` | Spring Boot 시작점과 컴포넌트 탐색: 시작 클래스는 어떤 객체를 발견하는가? | `main`과 `run`, 설정·자동구성·탐색, 서버 시작 조건을 보존합니다. 같은 시작 클래스의 패키지가 Bean 발견 여부를 결정하므로 패키지 트리와 Java import 반례를 바로 이어 읽습니다. |
| `starters` | `auto-configuration` | Starter와 자동구성: 라이브러리 선택은 어떤 기본 설정으로 이어지는가? | 의존성 묶음·버전 관리와 조건부 구성의 책임을 구분합니다. 클래스패스·직접 등록 Bean 조건을 이어 관찰하되 starter가 모든 Bean을 강제로 만드는 것으로 설명하지 않습니다. |
| `external-config` | `profiles` | 외부 설정과 Profile: 현재 환경에 어떤 값과 Bean이 적용되는가? | 설정 출처 우선순위·타입 바인딩을 보존합니다. 활성 profile의 파일과 Bean 조건을 같은 설정 선택 흐름에서 비교합니다. 비밀값 노출·`@ConfigurationProperties` 등록 조건을 유지합니다. |
| `request-mapping` | `request-parameters` | 요청 매핑과 경로·쿼리 입력: 어느 메서드가 어떤 값을 받는가? | 경로·HTTP 메서드로 대상 선택 후 경로 변수·쿼리 값을 연결합니다. 매핑 실패·필수값 누락·타입 변환 실패를 서로 구분합니다. |
| `request-body` | `validation` | JSON 요청 본문과 검증: 읽을 수 있는 값은 언제 허용되는가? | Content-Type·메시지 변환과 `@Valid` 제약 검사는 별도 단계입니다. 유효 JSON이지만 제약을 어긴 값과 읽을 수 없는 입력을 비교합니다. |
| `responses` | `exception-handling` | 응답과 예외 처리: 성공과 업무 실패를 HTTP로 어떻게 표현하는가? | `@ResponseBody`·`ResponseEntity`의 상태·헤더·본문과 알려진 예외의 응답 매핑을 연결합니다. 개별/공통 처리 범위·예외 정보 노출 경계를 남깁니다. |
| `unit-tests` | `mvc-tests` | 객체·컨텍스트·MVC 테스트: 통과한 테스트는 무엇을 확인하는가? | 순수 객체→컨텍스트 연결→DispatcherServlet의 실제 통과 경로를 비교합니다. 직접 호출·MockMvc·WebMvcTest·SpringBootTest 기본 MOCK의 검증 한계를 모두 보존합니다. |
| `security-filter-chain` | `security-request-rules` | 보안 필터 체인과 요청 인가: 어떤 체인과 규칙이 요청을 판단하는가? | 첫 체인 선택 뒤 체인 안의 첫 인가 규칙 선택이라는 두 순서를 연결합니다. `securityMatcher`와 `requestMatchers`, 규칙 순서 반례·미일치 보호 범위·permitAll과 CSRF의 차이를 보존합니다. |
| `security-form-login` | `security-password-storage` | 폼 로그인과 비밀번호 검증: 조회한 사용자 정보는 어떻게 인증되는가? | 폼 요청 형식→UserDetailsService 조회→Provider의 PasswordEncoder 대조를 연결합니다. salt로 다른 인코딩값·matches·평문/복호화/equals 오개념·로그 노출 경계를 보존합니다. |
| `jpa-table-keys` | `jpa-entity-id` | 테이블 키와 엔티티 식별자: 행의 식별을 Java 객체에 어떻게 표시하는가? | 동명이인·행/열·기본키/외래키 관찰을 엔티티·기본 생성자·식별자·열 매핑으로 잇습니다. PK와 표시값, Java 객체 참조와 DB 식별자를 구분합니다. |
| `jpa-context-states` | `jpa-save-merge` | 영속성 상태와 save: 이후 변경은 어느 객체가 관리하는가? | new/managed/detached/removed 뒤 persist/merge를 비교합니다. 기본 신규 판정의 Version·ID·Persistable 조건, 분리된 입력과 merge 반환 객체의 차이를 보존합니다. |
| `jpa-transactions` | `jpa-flush-commit` | 트랜잭션과 flush: 객체 변경은 언제 DB에 반영되고 확정되는가? | 활성 쓰기 트랜잭션·관리 상태·변경 감지→flush→commit/rollback을 연결합니다. 프록시 호출·readOnly 한계·오류 시점·flush와 clear·다른 트랜잭션 가시성의 차이를 남깁니다. |

이 12쌍을 적용하면 활성 문서는 34개가 됩니다.
34개는 목표 수량이 아니라 위 관계를 적용한 결과입니다.
작성 중 한 핵심 질문에서 벗어나는 내용이 확인되면 문서 수를 맞추지 말고 해당 묶음을 설계로 반환합니다.

다음 22개는 독립 문서로 유지합니다.

`framework-boot`, `ioc-di`, `bean-registration`, `bean-selection`, `singleton-state`, `mvc-flow`, `security-authentication-authorization`, `security-session-logout`, `security-csrf`, `security-cors`, `security-method-authorization`, `security-oauth2-oidc`, `security-jwt-resource-server`, `security-tests`, `jpa-roles`, `jpa-repository-crud`, `jpa-relations`, `jpa-fetch-loading`, `jpa-query-methods`, `jpa-fetch-plan`, `jpa-pagination`, `jpa-member-login`.

독립 유지 근거는 다음과 같습니다.

- 객체의 등록 방법·단일 후보 선택·공유 상태는 서로 다른 관찰과 실패 조건을 요구합니다. DI 개념 소개를 이 세 주제로 과도하게 늘리지 않습니다.
- MVC 전체 흐름은 입력·응답 문서의 선수이므로 HTTP 세부사항과 합치지 않습니다.
- 인증/인가는 보안 전체의 선수입니다. 세션 지속·CSRF·CORS는 저장 상태·위협·브라우저 조건이 다르므로 하나의 보안 설정으로 뭉치지 않습니다.
- 메서드 인가는 프록시 호출 경계, OAuth/OIDC는 주체와 토큰 역할, JWT는 검증과 scope 인가, 보안 테스트는 증거의 범위가 핵심입니다.
- JPA 역할·CRUD·연관관계·로딩·쿼리·fetch 계획·페이징은 단계마다 선택 조건이 달라집니다. 특히 fetch 계획은 JPQL 선수도 필요하므로 LAZY/EAGER 문서에 합쳐 선수 관계를 거꾸로 만들지 않습니다.
- 회원 조회와 인증 연결은 JPA와 Security를 종합하는 현재 마지막 문서로 유지합니다.

## 경험 카드와 학습 흐름

- 대상 ID: 표의 12개 대표 ID와 12개 보관 ID. 기존 46개 개념·92개 문항의 의미를 유지합니다.
- MVP 필요성: 짧은 페이지를 오가며 놓치기 쉬운 앞뒤 판단을 한 화면에서 이어 설명하게 합니다. Spring 정적 읽기와 복습을 지원하며 실행형 MVP 승격을 주장하지 않습니다.
- 선수: Java 객체·생성자 주입·공유 상태·메서드·예외·테스트와 각 표에 포함되지 않은 앞 교안입니다.
- 발견할 단서: 패키지 위치·클래스패스·활성 profile·입력 위치/형식·상태 코드·테스트 경로·매처 순서·인코딩값·식별자/관리 상태·트랜잭션 경계입니다.
- 새 A: 추가하지 않습니다. 두 문서의 기존 관찰·선택 행동을 재사용합니다.
- 새 E: 대표 문서 안에서 시작점→발견, 의존성→자동구성, 설정 출처→환경 조건, 매핑→인수, 본문 변환→제약, 처리 결과→HTTP 응답, 검사 목적→실제 통과 경로, 체인→규칙, 사용자 조회→비밀번호 대조, 행 식별→엔티티, 상태→저장 연산, 변경 감지→동기화→확정을 이어 추적하게 합니다. 단순 파일 합치기를 새 경험으로 세지 않고 각 결합 관찰 질문을 본문에 둡니다.
- C: 기존 반례를 보존합니다. 미등록 클래스, 직접 Bean 제공, 설정 덮어쓰기, 누락/잘못된 타입, 유효 JSON의 제약 위반, 알려진 업무 실패, 우회된 MVC, 앞 규칙에 가려진 관리 경로, salt와 문자열 비교, 동명이인, detached 인수 변경, flush 뒤 rollback이 해당합니다.
- T: 새 무힌트 전이 과제를 추가하지 않습니다. 정적 자기 설명과 기존 객관식이 주는 근거를 넘어 전이 성과를 주장하지 않습니다.
- 사다리·지원: L0의 손 추적과 L1의 기존 객관식을 유지합니다. 본문 관찰 뒤 접힌 직접답을 비교하고 실제 연결 문항으로 이동합니다.
- 자기 설명: 표의 핵심 질문에 두 단계의 책임과 실패 경계를 포함하여 답합니다. 직접답은 하나의 `## 핵심 질문 답` 절에서 전체 목표에 답합니다.
- 독립성: 소재·입출력·기존 목표·제약·지원 수준을 유지하고 앞뒤 처리 흐름을 같은 관찰에 연결합니다. 문항 추가·난이도 변경·정답 공개 확대는 없습니다.
- 대표 오개념·공개 사례: 표의 반례와 기존 92개 문항의 보기·정답·해설을 대조합니다. 실행 로그를 꾸미지 않습니다.
- 출처: 기준의 각 교안 `공식 자료`, 두 Spring 선행 작업 카드와 해당 공식 문서입니다. 작성자는 변경된 기술 설명의 공식 근거를 다시 확인해 실제 확인 날짜를 기록합니다.
- 사람의 판단: 이미 승인된 통합은 재승인 대기가 없습니다. 새 주제·문제·실행 방식이 필요해지면 범위 변경으로 반환합니다.

대표 문서는 기존 대표 위치에 남기고 읽기 순서를 유지합니다.
`boot-start`에서 `component-scan`을 먼저 설명해도 등록 개념은 이미 앞에서 배웠으므로 선수 역전이 없습니다.
`unit-tests`는 MVC 입력·응답 뒤에 있어 함께 읽을 준비가 되어 있습니다.
묶음 안에서 자신을 선수나 다음 문서로 연결하는 링크는 제거하고 문서 내부 설명으로 바꿉니다.
유지 문서가 보관 대상의 옛 URL을 가리키면 해당 링크만 대표 URL로 바꾸되 보관 본문은 그대로 남깁니다.

## 보존과 공용 메타데이터 인계

HTML·Java의 기존 보존 패턴을 재사용합니다.
근거는 `tests/fixtures/html-merged-lessons.js`, `tests/fixtures/java-merged-lessons.js`, `tests/lesson-answer.test.js`의 보관 URL·완료 기록 검사와 `tests/review-concepts.test.js`의 상세 문서 연결 검사입니다.

1. 기존 46개 `id`, `slug`, `contentFile`, `order`와 46개 URL을 삭제·재할당하지 않습니다. 보관 문서는 `archivedFromCatalog: true`만 추가합니다. 숨긴 항목 때문에 order에 빈칸이 생기는 기존 방식도 유지합니다.
2. 흡수하는 12개 원문 파일은 바이트 단위로 보존합니다. 대표 12개 본문만 재구성하며 기준 commit으로 이전 대표 내용의 계보를 보존합니다.
3. 대표 metadata의 `title`, `summary`, `essentialQuestion`, `objectives`를 합친 의미에 맞춥니다. `conceptIds`는 두 문서의 합집합이고 새 concept ID는 만들지 않습니다. `answerHeading`, source.kind와 기존 출처 성격을 유지합니다. 본문 목표와 metadata 목표를 일치시킵니다. `estimatedMinutes`는 스키마 필수 필드만 유지하고 화면이나 본문에 시간을 추가하지 않습니다.
4. `review-concepts.json`의 각 Spring concept `id`와 소유 `lessonId`는 그대로 둡니다. 흡수 문서 concept의 `documentLessonId`를 대표 ID로 지정하고 변경 대표의 `heading`·`excerpt`를 실제 본문에 맞춥니다. 발췌를 metadata 담당자가 새로 쓰지 않으며 작성자 확정 본문에서 가져옵니다.
5. `content/quizzes/java.json`의 기존 92개 Spring 문항을 포함해 모든 문항 객체·ID·lessonId·conceptId·정답·해설·revision을 그대로 둡니다. 옛 복습 URL·진행 세션과 전체 풀이 범위를 보존합니다.
6. 저장 키·저장된 완료 ID·문항 시도 이력·활성 세션 서명을 변경하지 않습니다. 보관 완료를 대표 완료로 자동 합치거나 미완료를 완료로 승격하지 않습니다.
7. 공용 JSON과 README는 조정 담당의 단일 작성으로 순차 통합합니다. 이 작업 담당은 변경 요청과 정확한 발췌를 전달하고 파일을 직접 수정하지 않습니다. README 수량은 조정 담당이 동시 JavaScript 작업까지 합친 실제 값으로 산출합니다.

## 역할별 쓰기 경로

| 역할 | 소유 경로 | 인계 |
| --- | --- | --- |
| Astra 설계 | 이 작업 카드만 | 범위·12쌍 매핑·검증 계약 |
| Spring 작성자 | 대표 12개의 `content/lessons/spring/*.md`와 선수/다음 링크만 조정할 독립 유지 Spring 문서 | 각 대표의 목표·요약·질문·concept별 heading/발췌·공식 출처 최대 3개·코드 검토 근거 |
| 공용 문서 관리자·조정 담당 | `content/curriculum.json`, `content/review-concepts.json`, 필요 README | JS 담당 인계와 충돌하지 않는 순차 반영 및 확정 revision |
| 독립 테스트 작성자 | 총괄이 별도 지정한 Spring 관련 테스트·fixture | 12쌍 명시 매핑과 기준 46개 route/92문항의 독립 기대값 |
| content_validator | 읽기 전용 | 정확성·목표 보존·E·공식 출처·선수 흐름 PASS/FAIL |
| test_engineer | 읽기 전용 | 결합된 콘텐츠/메타데이터의 정적 검사와 실제 UI 증거 |
| project_integrator | 읽기 전용 | 전체 diff·소유권·재사용/미실행 구분·로컬 통합 판정 |

`.agents/skills`와 `memory_summary.md`는 실제 원본·복제본과 확인한 로컬 경로에서 발견하지 못했습니다.
대신 저장소가 지정한 [fluent-korean 원문 URL](https://raw.githubusercontent.com/snflkd/fluent-korean/main/plugins/fluent-korean/output-styles/fluent-korean.md)과 `/Users/goonbam/.claude/projects/-Users-goonbam-Documents-ChatGPT-bam-dev/memory/lesson-korean-style.md`를 확인했습니다.
오래된 기억의 출처 절 삭제 지시는 이번 명시적 공식자료 최대 3개 기준으로 대체합니다.
교안에는 합니다체·문장별 줄바꿈·명사형 소제목과 필요한 쉼표만 적용합니다.

## 검증과 완료 조건

- 내용: 12쌍의 원문 목표·예제·조건·오개념·직접답을 대조합니다. 예제의 import·타입·선수 조건과 API 버전을 공식 문서로 확인합니다. 읽기 예제의 정적 검토와 실제 컴파일/앱 실행을 구분합니다.
- 출처: 변경 문서마다 직접 관련된 공식 자료를 최대 3개 남깁니다. 링크가 많다는 이유로 핵심 조건을 삭제하지 않고 묶음을 지지하는 공식 상위 문서/명세를 선정합니다. 확인하지 않은 버전이나 날짜를 새 확인 사실로 기록하지 않습니다.
- 구조: [문서 나누기와 합치기](../lesson-authoring.md#문서-나누기와-합치기)의 확정 계약을 대표 12개 문서 모두에 적용합니다. `## 학습 목표`는 본문의 주제별로 하나씩 3~4개 목록으로 쓰며 metadata objectives와 같은 의미여야 합니다. 학습 목표가 있는 본문에는 `## 한줄 요약`을 두지 않고 summary는 목록 카드와 요약 창에만 사용합니다. 문서 끝에는 `## 정리`를 요점 3줄 목록으로 두고 `## 핵심 질문 답`을 정확히 하나 둡니다. 여러 주제 사이에는 `---`을 한 줄 두되 정리·이어서 연습하기·공식 자료·핵심 질문 답 앞에는 두지 않습니다. 문서 끝의 문제 버튼은 개념마다 하나씩 연결합니다. 필수 의미를 긴 반복 절로 늘리지 않고 선수에 보관 문서 또는 자신을 남기지 않으며 모든 다음 링크가 실제 존재해야 합니다.
- 보존: 기준 46개 ID·URL 해석, 보관 12개 본문 불변, 기존 문항 객체 불변, concept 소유 ID 보존, 상세 문서·실제 발췌 일치를 검사합니다. 전체 풀이의 기존 문항 범위·서명을 대조합니다.
- 자동 검사 후보: `npm run validate:content`, `node --test tests/css-spring-content.test.js tests/review-concepts.test.js tests/lesson-answer.test.js`와 독립 작성된 Spring 통합 fixture 검사입니다. 결과와 실행 범위는 검사자가 실제 명령 기준으로 기록합니다.
- 실제 UI: Spring 목록의 활성 34개, 대표 문서의 목표·본문·접힌 직접답, 대표/옛 URL, 기존 보관 완료 표시, 객관식 복습의 문항→개념→대표 문서→복귀와 답안 보존을 확인합니다. 설정·MVC·Security·JPA에서 대표 사례를 고릅니다. 키보드 접기/펼치기·초점·좁은 화면 코드/표 넘침을 변경 본문 범위에서 관찰합니다.
- 회귀: HTML·Java의 기존 본문·문항·관련 공통 코드가 불변임을 diff로 확인해 선행 증거를 재사용합니다. 공용 연결에 영향받는 대표 경로와 전체 풀이 왕복을 추가 확인합니다. Spring 앱·DB·Security 실제 실행과 무관한 Java runner 전체 재시험은 이번 정적 통합의 완료 조건이 아닙니다.
- 빌드: 콘텐츠와 공용 metadata 확정 후 필요하면 정적 빌드에서 경로 누락을 확인합니다. 공유 코드가 바뀌지 않았다면 전체 제품 테스트를 자동 반복하지 않습니다.
- 경계: 이미지·외부 실행·계정·새 저장 구조·네트워크 의존성을 추가하지 않습니다. 로컬 읽기와 기존 오프라인 콘텐츠 제공 방식을 유지합니다.

## 작성·반환·재검증 기록

`[현재 사실]` 기준 `02c363f`에서 대표 12개를 통합하고 유지 문서 6개의 선수·다음 링크를 고쳤습니다.
변경 범위는 본문 18개·테스트 4개·공용 JSON 2개·README 1개·이 카드 1개로 총 26개 파일입니다.
공용 JSON은 조정 담당이 순차 통합했고 README는 Astra 담당의 독립 검토를 통과했습니다.

작성 r1의 독립 내용 검토에서 다음 3건이 반환됐습니다.

1. 대표 12개에 확정된 병합 구조 계약을 적용해야 했습니다. 작성 r2는 각 문서의 목표를 4개 목록으로 맞추고 한줄 요약을 제거했으며 정리 3줄·주제 구분선·직접답 1개를 갖췄습니다.
2. `spring.profiles` 발췌의 열린 코드 펜스를 제거하고 활성 Profile에 따른 Bean·설정 조건을 완결된 문장으로 인계했습니다.
3. `spring.security-request-rules` 발췌가 GET/POST/DELETE와 첫 인가 규칙·선언 순서를 설명하도록 고쳤습니다.

독립 content_validator는 작성 r2와 실제 최종 JSON을 읽기 전용으로 대조해 **PASS**로 판정했습니다.
형식·목표·정리·발췌 변경에 영향받는 내용을 재검하고 불변인 r1 기술 검토는 재사용했습니다.
원문 24개·유지 22개 문서·92개 문항을 대조했으며 통합 쌍과 관련된 48문항의 근거 및 독립 유지 문서가 지원하는 44문항의 근거를 보존했습니다.
공식 Spring Boot·Framework·Security·Data JPA와 Jakarta Persistence 자료에서 적용 조건과 반례를 확인했고 변경 대표 문서의 공식 자료는 각 2~3개입니다.

검증자는 기존 46개 ID·slug·파일 경로·order, concept 소유, 보관 12개 원문과 Java 문항 파일 전체의 바이트 보존을 확인했습니다.
24개 concept의 heading·excerpt·상세 연결은 실제 대표 본문과 일치합니다.
활성 문서의 자기 선수 링크·보관 선수 링크·존재하지 않는 Spring 링크·선수 order 역전은 없었습니다.
이 내용 판정은 읽기 예제의 정적 검토이며 실제 Spring 앱 실행 증거와 구분합니다.

## 독립 실행 검증 결과

**test_engineer: PASS**입니다.
macOS·Node v24.17.0·CUA Chrome extension에서 별도 `localhost:4189`를 사용했습니다.
동시 JavaScript 검증 origin과 분리했으며 검증 서버는 종료했습니다.

| 명령 | 실제 결과와 반환 이력 |
| --- | --- |
| `npm run validate:content` | PASS. 교안 213개·객관식 382문항을 포함한 콘텐츠 schema 검사를 수행했습니다. |
| `node --test tests/spring-document-consolidation.test.js tests/css-spring-content.test.js tests/review-concepts.test.js tests/lesson-answer.test.js tests/extension-content.test.js tests/learning-catalog-view.test.js tests/review-navigation.test.js tests/quiz-view.test.js` | 최초 91개 중 90 PASS·1 FAIL. `lesson-answer.test.js`의 CSS+Spring 활성 수 기대값이 종전 57이어서 실패했습니다. |
| `node --test tests/lesson-answer.test.js` | 독립 테스트 작성자가 CSS11+Spring34=45로 기대값을 수정한 뒤 영향받은 파일만 재실행해 23/23 PASS. 앞 실행의 불변 통과 결과와 합쳐 선정된 91검사의 유효 결과는 모두 PASS입니다. |
| `BAM_DEV_PORT=4189 npm run dev` | 최초 sandbox 실행은 listen EPERM이었으나 정상 권한 요청이 승인된 뒤 같은 명령으로 서버를 실행했습니다. 도구 제한을 우회하지 않았습니다. |

독립 테스트는 기준의 12쌍 매핑·46개 identity/URL/order·Java 문항 객체·concept 소유·보관 원문 hash를 기대값으로 사용했습니다.
현재 구현의 결과를 복사해 기대값을 만드는 방식은 사용하지 않았습니다.

실제 UI에서 다음을 확인했습니다.

- Spring 목록의 표시와 실제 카드가 34개이며 기존 46개 문제 묶음·92문항은 유지됐습니다.
- 설정 `external-config`, MVC `request-body`, Security `security-filter-chain`, JPA `jpa-context-states`에서 제목·통합 목표·각 개념의 문제 링크·기본 접힌 직접답을 확인했습니다. 설정 문서의 답은 Enter로 펼치고 Space로 접었으며 초점도 유지됐습니다.
- 기존 `spring-profiles` 복습에서 b를 선택하고 채점한 뒤 개념 발췌→대표 `external-config`의 Profile 절→문항으로 왕복했습니다. 선택 b·채점 상태·정답 결과가 유지됐습니다.
- Spring 전부 보기에서 실제 92문항을 확인했습니다. 첫 문항의 a 선택→개념→framework-boot→복귀와 새로고침 후에도 92문항·전부 보기·선택 a가 유지됐습니다.
- 옛 profiles URL의 보관 원문·접힌 답·문제 링크가 열렸습니다. 보관 문서 완료를 새로고침에서 복구했으며 대표 문서는 미완료로 남았습니다. 대표도 별도로 완료한 뒤 복구돼 두 완료 ID가 합쳐지지 않았습니다.
- 390×844 viewport에서 위 네 분야의 문서 폭은 390으로 넘치지 않았습니다. 긴 코드는 pre 내부에서, Security·JPA 표는 table-scroll 내부에서 스크롤됐습니다. 임시 viewport 설정은 복구했습니다.
- HTML 의미 구조의 기존 문제·개념·대표 문서 왕복과 Java 객체 문항 b 채점 뒤 왕복·결과 보존을 확인했습니다.
- 캡처된 브라우저 error·warn은 0건입니다. 테스트용 완료·선택 상태는 별도 검증 origin에만 남습니다.

공통 `src`·`styles`·`content/quizzes`·HTML/Java 본문은 기준 대비 diff가 없었습니다.
영향 없는 기술 내용과 기존 공통 기능의 선행 증거는 재사용하고 연결에 영향받는 대표 UI만 위 범위에서 확인했습니다.
화면 캡처는 도구 결과로 표시했으며 별도 스크린샷 파일을 만들었다고 주장하지 않습니다.

## 동결 파일과 증거

| 대상 | SHA-256 |
| --- | --- |
| `content/curriculum.json` | `f0b92b6f2c23d2f03191f6a08b6af4d5edb5cfe3af382f4e1d566734ef280190` |
| `content/review-concepts.json` | `770dc4930f30cfd2cff07393eebdbbd373ea3bbe43fcb0471e1dbe3e825820a9` |
| `README.md` | `409c533c84ca2996001ca3e703d9bb40f5d85cb44b9cb59fb916073ace006238` |
| `tests/spring-document-consolidation.test.js` | `ae25e38229f7b75d2996c23ac38126ac1dfd4b48a754775bff251d5f08d895dd` |
| `tests/lesson-answer.test.js` | `409f230dd215ff54b063b17c68cf8330dc9699a105b4ddddc7c8989325e5a498` |

상세 독립 내용 보고서는 `/tmp/spring-content-review-r2-final.md`와 같은 이름의 `.json`에 있습니다.
기존 기술 검토는 `/tmp/spring-content-review-r1.md`, 실행 보고서는 `/tmp/spring-runtime-review-final.md`, 최초·재실행 로그는 `/tmp/spring-runtime-focused.log`와 `/tmp/spring-runtime-retest.log`에 있습니다.
임시 파일이 없어져도 범위·반환·핵심 결과·동결 식별자를 확인할 수 있도록 이 카드에 위 결과를 보존했습니다.

## 현재 인계 상태와 미실행 범위

공용 JSON의 정적 통합, Astra README 독립 검토, content_validator와 test_engineer는 PASS입니다.
project_integrator의 사전 정적 검토는 PASS이며 **최종 카드와 실행 증거를 포함한 최종 통합 판정은 대기 중**입니다.
이 상태를 최종 snapshot 승인이나 로컬 통합 최종 PASS로 표현하지 않습니다.

Spring Boot·Security 서버·DB·HTTP 예제의 실제 실행과 예제 컴파일은 수행하지 않았습니다.
정적 읽기 콘텐츠의 API·타입·조건 검토와 BAM.dev 화면에서의 실행 검증을 구분합니다.
전체 제품 테스트·Java runner 재시험·정적 build·원격 CI·실제 모바일 기기는 실행하지 않았습니다.
확인한 Chrome과 viewport의 결과를 다른 브라우저·운영체제·실기기 지원 완료로 확대하지 않습니다.
커밋·원격 게시·PR 병합·배포는 수행하지 않았으며 이번 승인 범위에 포함되지 않습니다.
