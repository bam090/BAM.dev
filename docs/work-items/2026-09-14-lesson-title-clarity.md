# 학습문서 제목 정리

`[현재 사실]` **상태: 47개 제목 변경 · 독립 검증 및 통합 완료**

현재 학습 목록에 노출되는 158개를 검토해 47개의 제목을 변경했다. 핵심 개념이 이미 분명한 111개는 유지했으며, 이 수에는 알고리즘 12개가 포함된다. 목록에서 제외된 archived 교안 21개도 보존했다.

## 문제와 승인 범위

`[확정 결정]` 2026-09-14 bam은 DI 문서의 제목을 「DI(의존성 주입): 필요한 객체를 외부에서 받기」로 바꾸고, 다른 학습문서도 같은 기준으로 정리한 뒤 변경할 제목을 보고하도록 승인했다.

기존 「객체를 만들고 연결하는 책임」처럼 행동만 적힌 제목으로는 실제 배울 개념을 알아보기 어려웠다. 이번 작업은 본문에서 다루는 핵심 개념이나 대표 API를 제목에 드러내는 **제목 표현 유지보수**다. 제목이 이미 분명한 문서는 유지하고, 익숙하지 않은 용어에는 짧은 설명을 붙인다. 기준은 [교안 제목 정본](../lesson-authoring.md#교안-제목)을 따른다.

변경은 제목 표시와 직접 참조 문구에 한정한다. 학습 목표·요약·본문의 교육 내용·예제·핵심 질문·정답·객관식 문항은 그대로 둔다. ID·개념 연결·순서·파일 경로·slug·route·출처·학습 기록도 보존하므로 새로운 학습 경험이나 진도 이관을 만들지 않는다. 과거 작업 기록과 원본 자료의 제목을 일괄 갱신하지 않는다.

## 완료 조건과 검증 상태

다음 세 조건을 변경 범위에 한해 확인한다.

- 아래 47개 제목이 실제 교안 제목 표시와 직접 참조 문구에 일관되게 반영된다.
- 실제 diff에서 제목 외의 학습 내용·연결·안정 ID·진도 계약과 archived 21개의 보존을 확인한다.
- 관련 문서 링크와 제목 기준의 정합성을 확인하고, 독립 내용 검증·focused 검사·통합 판정의 실제 결과를 기록한다.

독립 내용 검증과 최종 통합 검토를 통과했다. 변경한 제목 47개의 검색·목록 표시, 관련 개념 연결 52개, 관련 문제 카드 47개를 검사했다. 기존 Spring 문서·Java 언어·세션 관련 테스트 1개도 통과했으며, 이후 링크 문구 수정에는 그 결과를 재사용했다.

검토 중 발견한 조사 불일치 7곳과 Spring 링크 제목 변경 누락 28곳을 수정하고 재확인했다.

전체 제품 테스트·빌드, 브라우저·모바일 QA, Java·Spring 예제 실행과 공식 자료의 전체 재검증은 이번 작업에서 수행하지 않았다.

## 변경한 제목 47개

새 제목을 누르면 해당 교안을 열 수 있다. HTML 5개, CSS 2개, JavaScript 9개, Java 16개, Spring 15개다.

### HTML · 5개

| 기존 제목 | 새 제목 |
| --- | --- |
| 내용의 역할과 제목으로 문서 나누기 | [시맨틱 HTML: 내용의 역할과 제목 계층](../../content/lessons/html/wiki-semantic-structure.md) |
| 받을 값과 선택 관계에 맞는 입력 | [폼 컨트롤: 값과 선택에 맞는 입력 고르기](../../content/lessons/html/wiki-form-controls.md) |
| 내장 검증의 역할과 한계 | [HTML 폼 내장 검증의 역할과 한계](../../content/lessons/html/wiki-constraint-validation.md) |
| 제출되는 값과 보내는 방식 | [폼 제출: 보내는 값과 GET·POST 방식](../../content/lessons/html/wiki-form-submission.md) |
| 검사 결과를 구분하고 수정하기 | [HTML 검증: 문법·의미·접근성 점검](../../content/lessons/html/wiki-inspection.md) |

### CSS · 2개

| 기존 제목 | 새 제목 |
| --- | --- |
| 크기 제한과 넘침 | [overflow(넘침): 크기 제한과 내용 표시](../../content/lessons/css/wiki-overflow.md) |
| 움직임과 동작 줄이기 | [CSS 모션: 변형·전환·애니메이션과 동작 줄이기](../../content/lessons/css/wiki-motion.md) |

### JavaScript · 9개

| 기존 제목 | 새 제목 |
| --- | --- |
| 계산·비교와 조건의 값 | [연산자: 계산·비교와 조건의 값](../../content/lessons/javascript/wiki-operators.md) |
| 조건과 반복의 실행 경계 | [조건문과 반복문의 실행 범위](../../content/lessons/javascript/wiki-control-flow.md) |
| 값 순회·키 순회·각 요소 처리 | [배열 순회: 값·키·요소 처리 방식 고르기](../../content/lessons/javascript/wiki-iteration.md) |
| 스코프와 선언 전 접근 | [스코프와 호이스팅: 이름 탐색과 선언 전 접근](../../content/lessons/javascript/wiki-scope-hoisting.md) |
| 기본 동작 취소와 전파 | [이벤트의 기본 동작 취소와 전파](../../content/lessons/javascript/wiki-event-defaults.md) |
| 예외를 처리하는 위치 | [예외 처리: try·catch·finally의 역할](../../content/lessons/javascript/wiki-error-boundaries.md) |
| 의존 작업과 함께 기다리기 | [비동기 작업 조합: 순차 실행과 동시 시작](../../content/lessons/javascript/wiki-async-composition.md) |
| 동기 코드·microtask·task 순서 | [이벤트 루프: 동기 코드·microtask·task의 실행 순서](../../content/lessons/javascript/wiki-event-loop.md) |
| 입력부터 최신 화면까지 종합 | [데이터 흐름 종합: 입력부터 최신 화면까지](../../content/lessons/javascript/wiki-flow-review.md) |

### Java · 16개

| 기존 제목 | 새 제목 |
| --- | --- |
| Java 코드가 실행되기까지 | [JDK와 JVM: Java 컴파일과 실행](../../content/lessons/java/wiki-runtime.md) |
| 매개변수 재대입과 객체 변경 | [값 전달: 매개변수 재대입과 객체 변경](../../content/lessons/java/wiki-argument-values.md) |
| 객체의 값과 클래스의 값 | [static과 인스턴스 멤버](../../content/lessons/java/wiki-static-members.md) |
| 같은 객체와 같은 값 | [equals와 hashCode: 객체의 동일성과 동등성](../../content/lessons/java/wiki-equality-hashing.md) |
| 공통 상태와 역할 계약 | [추상 클래스와 인터페이스의 역할](../../content/lessons/java/wiki-abstract-interfaces.md) |
| 타입 인수와 안전한 보관 | [제네릭: 타입 인수로 저장·조회 타입 정하기](../../content/lessons/java/wiki-generics.md) |
| 중복된 값과 키를 다루기 | [Set과 Map으로 중복·키 다루기](../../content/lessons/java/wiki-sets-maps.md) |
| 먼저 넣은 값과 나중에 넣은 값 | [Deque로 큐와 스택 사용하기](../../content/lessons/java/wiki-deque.md) |
| 보관 규칙과 연산 비용으로 고르기 | [컬렉션 선택: 보관 규칙과 연산 비용](../../content/lessons/java/wiki-collection-choice.md) |
| 실패를 처리하거나 전달하기 | [예외 처리와 전달](../../content/lessons/java/wiki-exceptions.md) |
| 자원의 종료와 실패 보존 | [try-with-resources: 자원 종료와 예외 보존](../../content/lessons/java/wiki-resources.md) |
| 동작의 입력과 출력 전달하기 | [람다와 함수형 인터페이스](../../content/lessons/java/wiki-lambdas.md) |
| 값을 고르고 바꾸어 모으기 | [Stream으로 값을 고르고 바꾸어 모으기](../../content/lessons/java/wiki-streams.md) |
| 공유 상태에 필요한 보장 | [동시성: 공유 상태의 원자성·가시성·순서](../../content/lessons/java/wiki-shared-state.md) |
| 작업을 나누고 결과 모으기 | [ExecutorService와 Future로 작업 결과 모으기](../../content/lessons/java/wiki-tasks-results.md) |
| 테스트 실행·검증·협력 대역 | [JUnit·AssertJ·Mockito의 테스트 역할](../../content/lessons/java/wiki-test-tools.md) |

### Spring · 15개

| 기존 제목 | 새 제목 |
| --- | --- |
| 객체를 만들고 연결하는 책임 | [DI(의존성 주입): 필요한 객체를 외부에서 받기](../../content/lessons/spring/ioc-di.md) |
| 같은 타입 후보 중 하나 고르기 | [@Primary와 @Qualifier로 Bean 후보 선택하기](../../content/lessons/spring/bean-selection.md) |
| 설정값을 코드 밖에서 받기 | [외부 설정과 @ConfigurationProperties](../../content/lessons/spring/external-config.md) |
| HTTP 요청이 컨트롤러에 닿는 흐름 | [Spring MVC와 DispatcherServlet의 요청 처리](../../content/lessons/spring/mvc-flow.md) |
| JSON 요청을 객체로 받기 | [@RequestBody로 JSON 요청 본문 받기](../../content/lessons/spring/request-body.md) |
| 형식 변환 뒤 입력 검증 | [Bean Validation과 @Valid로 입력 검증하기](../../content/lessons/spring/validation.md) |
| MVC 테스트가 확인하는 범위 | [MockMvc로 확인하는 MVC 테스트 범위](../../content/lessons/spring/mvc-tests.md) |
| 컨트롤러 앞의 보안 필터 | [SecurityFilterChain과 보안 필터 흐름](../../content/lessons/spring/security-filter-chain.md) |
| 경로·메서드별 접근 규칙 | [요청 인가: 경로·HTTP 메서드별 접근 규칙](../../content/lessons/spring/security-request-rules.md) |
| 비밀번호 저장과 대조 | [PasswordEncoder: 비밀번호 해시 생성과 대조](../../content/lessons/spring/security-password-storage.md) |
| 로그인 상태와 로그아웃 | [세션 기반 로그인과 로그아웃](../../content/lessons/spring/security-session-logout.md) |
| 서비스 메서드의 권한 확인 | [@PreAuthorize로 서비스 메서드 인가하기](../../content/lessons/spring/security-method-authorization.md) |
| 행을 구별하고 다른 표와 연결하기 | [기본키와 외래키: 행 식별과 테이블 연결](../../content/lessons/spring/jpa-table-keys.md) |
| 연관 객체를 읽는 시점 | [지연 로딩(LAZY)과 즉시 로딩(EAGER)](../../content/lessons/spring/jpa-fetch-loading.md) |
| DB 회원 조회를 로그인에 연결하기 | [UserDetailsService: DB 회원 조회와 인증 연결](../../content/lessons/spring/jpa-member-login.md) |
