# Spring Security·JPA 정적 학습 확장

## 범위와 선행 계약

`[확정 결정]` bam의 2026-09-14 “Security 이건 추가하자”와 JPA·Spring Data JPA까지 포함하는 후속 “그거까지 ㄱㄱ”에 따라 공식 문서를 근거로 입문자가 읽을 수 있는 작은 개념 문서와 객관식을 새로 작성한다. Security와 JPA를 구분되는 학습 묶음으로 구성하고, 마지막에는 DB 회원 조회와 Security 연결의 책임을 정적으로 설명한다. [확장 설계](../designs/lesson-review.md#spring-securityjpa-정적-학습-확장)가 제품 경계의 정본이다.

| 항목 | 이번 계약 |
| --- | --- |
| 작업 ID·유형 | `2026-09-14-spring-security-jpa` · 학습 콘텐츠 포함 기능 / 새 경험 |
| 필요성 | 승인된 Spring 후속 학습에서 보안·영속성의 개념과 책임 구분을 제공. 설치형 release 차단 묶음 확정과 별개 |
| 입력 정본 | [학습 흐름](../designs/lesson-review.md#spring-securityjpa-정적-학습-확장), [Spring 데이터 계약](../content-schema.md#css-객관식과-spring-정적-콘텐츠), [새 교안 저작](../lesson-authoring.md#승인된-springspring-boot-새-교안의-작은-단위), [경험 설계](../learning-content-design.md#콘텐츠를-쓰기-전에-할-설계) |
| 시작 기준선 | `/private/tmp/bam-security-start-df0xl4ll/baseline.json`과 `workspace/` 복제본. 기존 미커밋 변경·추가 파일 보존. 이전 검사는 이번 통과를 대신하지 않음 |
| 현재·목표 | 시작 시 Spring 핵심·Boot 정적 과정이 존재. Security·JPA의 26단위·52문항과 26개 발췌를 작성하고 공유 JSON에 조립했다. 독립 내용·문서·대표 데스크톱 검증과 이번 전체 gate·빌드·보존 검사를 통과하고 `PROJECT_INTEGRATOR_PASS` 판정을 받음 |
| 사용자 관찰 가능 완료 | Spring 목록에서 새 문서를 찾아 목표·선수·질문·직접답을 읽고 실제 관련 문제에 진입. 개념→문서→문제 왕복과 수동 완료 표시·유효 진행 복구 유지 |
| 데이터·오프라인 | 번들 Markdown·JSON, 기존 schemaVersion 1·route·저장소 사용. 공식 링크 없이 읽기·풀이 가능. 새 ID는 기존 완료·시도를 상속하지 않으며 변경된 문항 집합은 기존 콘텐츠 서명 안내 적용 |
| 대상·안전 | 데스크톱 웹의 정적 읽기·객관식. 앱 로그인·DB 연결·Java/Spring 실행, 새 의존성·런타임·서버·설치·모바일·Git·밤위키 수정은 범위 밖 |
| 보존·예외 | 기존 ID·URL·완료 이력·문항 객체 보존. 기존 `framework-boot.md`의 첫 범위 안내 문단만 최신 학습 범위에 맞게 지정 작성자가 수정 |
| 남은 사람 결정 | 이번 정적 저작의 재승인은 필요 없음. 외부 실행 과제·배포·설치형 release 묶음은 기존 별도 결정 유지 |

## 역할과 경로 소유권

| 순서·역할 | 소유 경로 또는 읽기 범위 | 인계 조건 |
| --- | --- | --- |
| 총괄 orchestrator | 저장소 읽기와 조정만 | 작성자 계획·실제 파일·diff·명령 증거 확인 뒤 단계 전환 |
| 제품·설계 문서 담당 | 이 카드, `docs/designs/lesson-review.md`, `docs/roadmap.md`, `docs/README.md`, `README.md`, 필요한 `docs/lesson-authoring.md` 연결 | 선행 설계 기록 후 작성자 계획·실제 검증 결과만 순차 반영 |
| Security 콘텐츠 작성자 | 새 `content/lessons/spring/security-*.md`, 기존 `framework-boot.md` 첫 범위 안내 문단, 임시 계획·metadata·문항 조각 | 공식 출처와 경험·교안 보충 계획을 먼저 확인. Security 본문·문항·정답/오답·연결 인계 |
| JPA 콘텐츠 작성자 | 새 `content/lessons/spring/jpa-*.md`, 임시 계획·metadata·문항 조각 | JPA·Spring Data JPA와 최종 Security 연결의 공식 근거·경험·본문·문항 인계. Security 마지막 순서 뒤 배치 |
| 학습 문서 관리자 | `content/curriculum.json`, `content/review-concepts.json`, `content/quizzes/java.json` | 확정 단위·순서와 완성 원고를 받은 뒤 단독 조립. Spring `course.description` 한 문장은 작성자의 목록용 원고로 확장하고 다른 course 필드는 보존. 실제 본문 발췌·ID·출처·링크 관리. 교육 보완은 작성자 반환 |
| 테스트 작성자 | `tests/extension-content.test.js`, `tests/learning-catalog-view.test.js`, `tests/lesson-answer.test.js`, `tests/app-independent-review.test.js` | 승인 계획으로 기존 수량 기대값 갱신과 catalog의 Security·JPA 검색 두 사례 보강. 새 테스트 파일·제품·콘텐츠 수정 없음. 실행 결과는 별도 기록 |
| 문서 검토자 | 이번 문서 diff·정본·링크 읽기만 | 현재/목표·소유 범위·정합성 확인 |
| `content_validator` → `test_engineer` → `project_integrator` | 서로 독립된 읽기 전용 역할 | 교육·출처·경험 → 콘텐츠/테스트 계약·필요한 대표 데스크톱 흐름 → 최종 통합 순차 판정 |
| Git 담당 | 이번 작업 쓰기 권한 없음 | commit·PR·CI·merge·게시 완료를 주장하지 않음 |

통합 JSON은 관리자가 단독 소유한다. 겹치는 경로는 선행 인계와 총괄의 실제 diff 확인 뒤 순차로 넘긴다. 작성·관리·테스트 작성 역할은 이번 묶음의 독립 검증 역할을 겸하지 않는다.

## 작성자 경험 계획과 최종 연결

`[현재 사실]` 총괄이 확인한 Security `lesson-plan.json`·`experience-cards.json`과 JPA 최신 `prewrite-plan.json`의 승인 계획으로 작성했다. Security 12단위·24문항(order 21~32), JPA 14단위·28문항(order 33~46)의 최종 본문·metadata·문항·직접답 발췌를 인계받아 실제 공유 JSON과 대조했다. 아래 단위의 제목·질문·목표와 문항 ID는 최종 조각에 맞췄고 경험 근거는 작성자 카드의 표현을 보존했다. 작성·조립과 독립 검증의 실제 판정은 아래 증거 표에서 구분한다.

| 묶음 | 이번 추가 범위 | 연결 상태 |
| --- | --- | --- |
| Security | 12문서·24문항·12발췌 | Spring order 21~32. CV의 HttpMethod 표현 반환 수정까지 실제 Java 문항에 반영 |
| JPA·Spring Data JPA | 14문서·28문항·14발췌 | Spring order 33~46. 마지막 단위가 실제 Security 선수 문서로 연결 |
| 전체 | 26문서·52문항·26발췌 | 최종 조각과 실제 조립 객체 일치. 현재 전체 제공 수량은 [README](../../README.md)에만 요약 |

### 공통 경험과 교안 보충 계약

경험 ID는 `SPRING-SECURITY-JPA-20260914`다. 아래는 작성자 계획의 공통 필드와 단위·문항별 차이를 합쳐 읽는 기록이다. 단위표는 최종 교안 목표를 기록한다. Security의 계획 자기 설명과 최종 문항별 학습목표를 구분하며 JPA는 단위 목표가 두 문항의 자기 설명·학습목표와 일치한다. 선수 열과 소유 교안이 각 문항의 연결 대상이다. Security의 공개 사례는 문항별 단서이며 JPA의 최소 예제·단서는 단위표에 둔다. 공식 확인일은 모두 2026-09-14다. 문서 담당이 새 경험 판정을 덧붙이지 않았다.

| 공통 필드 | Security 작성자 계획 | JPA 작성자 계획 |
| --- | --- | --- |
| 필요성 | 사용자가 승인한 정적 Spring 후속 입문: 접근제어 오개념을 구체 요청에 적용한다. 전체 MVP release 차단 범위·실행기 완료를 주장하지 않는다. | bam이 승인한 Spring 정적 입문 확장. 객체와 MVC를 배운 학습자가 저장 상태·조회 비용·DB회원 인증 연결을 자신의 말로 구분하도록 돕는다. 설치형 전체 release 범위·실행기 완료 주장은 하지 않는다. |
| 재사용 A | 기존 Spring 40문항의 Bean·주입·매핑·요청표현·검증경로 읽기 | 기존 Java 객체/참조/인터페이스/제네릭과 기존 Spring Bean/DI/MVC의 역할 경계 관찰. |
| 기존 콘텐츠와 차이 | 기존 Spring 40문항의 DI·Boot 설정·MVC 입출력·일반 테스트 읽기를 재사용한다. 각 문항의 새 A와 보안 조건 C는 기존 40문항에서 판단하지 않았다. | 기존 Spring 20교안/40문항은 DI·Bean·Boot설정·MVC입출력·테스트경계를 다룸. JPA의 표키/영속상태/신규판정/flush/관계/조회비용은 없음. Security 별도 묶음은 필터·인증·인가·저장암호 검증 담당; 마지막 문서만 DB조회→인증모델 변환이라는 새 E를 추가하며 Security 원리 반복을 줄임. |
| 지원·사다리 | 교안 L0 관찰·짧은 직접작성 → 문항 L1 단일판단/L2 조건변경. 정답 전 핵심질문, 선택 이후 보기별 이유와 실제 교안 직접답 제공. | L0 관찰 예제와 L1 기본 판단·L2 조건 판단의 두 객관식. E는 지원 있는 연결 판단이며 실제 구현 숙달·전이 성과는 주장하지 않는다. |
| T·성과 | N/A: 선택형 L1/L2 확인이며 무힌트 구현 전이·학습성과를 주장하지 않는다. | 이번은 L0 읽기 예제와 L1 기본 판단·L2 조건 판단이며 E는 지원 있는 연결 판단이다. 외부 실제 구현·무힌트 T와 학습 성과는 미검증이다. |
| 독립 검증 | 모든 24문항: 4 병렬선택지, 1정답, 보기별근거, 전제·직접답·발췌·출처; 실제 Java/Boot/JUnit/서버실행 N/A(정적범위). 관리 이후 독립 content_validator→test_engineer→project_integrator. | 공식 1차 자료와 코드/표 전제를 정적 대조. 4개 병렬 선택지·유일정답·보기별 이유·질문내 타입/tx/신규판정/fetch조건·본문직접답/실제연결을 독립 검토. Java/SQL/DB/Boot/Security서버 실행·성능·학습성과 검증은 없음. |
| 본문 의미 구조 | 학습목표·한줄요약·선수 / 작은 관찰과 요청·상태 흐름 / 선택단서·작은 읽기예제·직접해볼일 / 실수·적용경계 / 관련객관식·후속문서 / 공식출처·미실행 / 접힌 핵심질문답 | 학습목표·요약·선수 → 개념/작은예제/관찰과직접작은행동 → 오개념/적용경계 → 실제2문항 → 공식출처 → 유일핵심질문답 |
| 연결 실습 | 이 단원 소유 2객관식과 다음 Security 교안. 실행 Quest·codingtest·외부웹과제 연결 N/A: 현재 승인된 실습 대상이 없음. | 이 문서에 실제 신설할 아래2개객관식. 존재하지않는실행과제링크없음. 실제실행은승인외부과제에서별도 |
| 접근성·오프라인 | 기존 Markdown·코드·텍스트표·접힌답 UI 재사용. 색에만 의존하지 않고 공식 링크 없이 읽기·풀기 가능. 대상 데스크톱, 모바일 미검증. | 기존Markdown/표/코드/객관식UI 재사용. 색상/키보드/저장/실행/UI변경없음. 정적빌드포함, 외부출처는선택링크; 모바일검증주장없음 |
| 사람 결정 | 12단위·24판단과 order 21~32 배정 확인. 이후 콘텐츠 검증은 독립 역할에 인계. | root의 14단위/28판단 승인과 Security 선수·order33~46 배정 완료. 이후 콘텐츠 검증은 독립 역할에 인계. |

승인된 에이전트의 새 저작으로 기존 `source.kind: bam-authored`를 사용한다. 위키 원문·반입 SHA를 만들지 않는다. 정적 기준은 정식 Java 25·preview 없음, Spring Boot 4.1.1·Framework 7.0.9·Security 7.1.1·Spring Data JPA 4.1.1·Jakarta Persistence API 3.2.0·Hibernate 7.4.5.Final이다. 작성자 자료와 독립 예비 검토가 [SRC01] · [SRC02] · [SRC03]에서 확인한 조합이며 의존성 채택·컴파일·DB·서버 실행 결과가 아니다.

### Security 단위·선수·최종 연결

각 단위는 `courseId: spring`·`languageId: java`이며 파일과 slug는 아래 문서 링크의 파일명에서 확장자만 뺀 값이다. 최종 교안 목표와 계획 당시 자기 설명 문장을 구분해 보존한다. 최소 읽기 예제는 해당 단위 첫 문항의 공개 단서다.

| 순서·문서·ID | 질문·목표 | 선수 conceptId | 두 문항 ID | 공식 출처 |
| --- | --- | --- | --- | --- |
| 21 · [인증과 인가를 나누어 보기](../../content/lessons/spring/security-authentication-authorization.md)<br>`spring-security-authentication-authorization`<br>`spring.security-authentication-authorization` | 로그인한 사용자가 모든 기능을 쓸 수 있을까요?<br>최종 교안 목표: 인증 결과와 기능별 권한 판단을 구분할 수 있습니다.<br>계획 자기 설명: 인증 결과와 기능별 권한 판단을 구분한다. | `spring.mvc-flow` | `quiz-java-spring-security-authentication-authorization-identity`<br>`quiz-java-spring-security-authentication-authorization-response` | [SRC04] · [SRC05] |
| 22 · [컨트롤러 앞의 보안 필터](../../content/lessons/spring/security-filter-chain.md)<br>`spring-security-filter-chain`<br>`spring.security-filter-chain` | 컨트롤러가 실행되지 않았는데 보안 응답이 나오는 이유는 무엇일까요?<br>최종 교안 목표: 요청에 적용되는 보안 체인과 컨트롤러 전에 멈추는 지점을 설명할 수 있습니다.<br>계획 자기 설명: 요청에 적용되는 체인을 고르고 컨트롤러 전 차단을 설명한다. | `spring.mvc-flow` · `spring.security-authentication-authorization` | `quiz-java-spring-security-filter-chain-before-controller`<br>`quiz-java-spring-security-filter-chain-first-chain` | [SRC06] · [SRC07] |
| 23 · [경로·메서드별 접근 규칙](../../content/lessons/spring/security-request-rules.md)<br>`spring-security-request-rules`<br>`spring.security-request-rules` | 여러 접근 규칙이 같은 요청과 맞으면 무엇을 적용할까요?<br>최종 교안 목표: HTTP 메서드·경로·선언 순서로 적용할 인가 규칙을 선택할 수 있습니다.<br>계획 자기 설명: HTTP 메서드·경로·선언 순서로 첫 인가 규칙을 선택한다. | `spring.request-mapping` · `spring.security-filter-chain` | `quiz-java-spring-security-request-rules-method`<br>`quiz-java-spring-security-request-rules-order` | [SRC05] |
| 24 · [로그인 폼이 인증으로 이어지는 과정](../../content/lessons/spring/security-form-login.md)<br>`spring-security-form-login`<br>`spring.security-form-login` | 로그인 폼을 보여 주는 일과 자격 증명을 확인하는 일은 어떻게 다를까요?<br>최종 교안 목표: 기본 폼의 요청 형식과 사용자 조회·비밀번호 대조 역할을 구분할 수 있습니다.<br>계획 자기 설명: 기본 폼 표시·POST 처리·사용자조회·비밀번호 비교를 구분한다. | `spring.request-body` · `spring.security-authentication-authorization` | `quiz-java-spring-security-form-login-request-format`<br>`quiz-java-spring-security-form-login-provider` | [SRC08] · [SRC09] · [SRC10] |
| 25 · [비밀번호 저장과 대조](../../content/lessons/spring/security-password-storage.md)<br>`spring-security-password-storage`<br>`spring.security-password-storage` | 같은 비밀번호를 다시 인코딩한 문자열이 다르면 로그인 실패일까요?<br>최종 교안 목표: 비밀번호 저장값의 단순 문자열 비교와 PasswordEncoder의 대조를 구분할 수 있습니다.<br>계획 자기 설명: 인코딩 결과의 단순 비교 대신 matches로 입력과 저장값을 대조한다. | `spring.security-form-login` | `quiz-java-spring-security-password-storage-matches`<br>`quiz-java-spring-security-password-storage-storage` | [SRC11] · [SRC12] |
| 26 · [로그인 상태와 로그아웃](../../content/lessons/spring/security-session-logout.md)<br>`spring-security-session-logout`<br>`spring.security-session-logout` | 로그인 후 상태는 어디에 이어지고 로그아웃은 무엇을 지울까요?<br>최종 교안 목표: 세션을 통한 인증 지속과 표준 로그아웃의 상태 정리를 설명할 수 있습니다.<br>계획 자기 설명: 세션 기반 인증 지속과 서버 측 로그아웃 정리를 추적한다. | `spring.security-form-login` | `quiz-java-spring-security-session-logout-persist`<br>`quiz-java-spring-security-session-logout-logout` | [SRC13] · [SRC14] |
| 27 · [쿠키 인증과 CSRF 방어](../../content/lessons/spring/security-csrf.md)<br>`spring-security-csrf`<br>`spring.security-csrf` | 로그인한 브라우저의 요청에도 CSRF 토큰을 확인하는 이유는 무엇일까요?<br>최종 교안 목표: 세션 인증·인가와 변경 요청의 CSRF 검사를 별도 조건으로 판단할 수 있습니다.<br>계획 자기 설명: 브라우저 자동 쿠키 전송과 변경 요청의 별도 의도 확인을 구분한다. | `spring.security-session-logout` · `spring.request-mapping` | `quiz-java-spring-security-csrf-missing-token`<br>`quiz-java-spring-security-csrf-permit-all` | [SRC15] · [SRC16] |
| 28 · [다른 출처의 브라우저 요청과 CORS](../../content/lessons/spring/security-cors.md)<br>`spring-security-cors`<br>`spring.security-cors` | CORS를 허용하면 로그인과 권한 검사도 통과할까요?<br>최종 교안 목표: CORS 사전 확인과 실제 요청의 인증·인가·CSRF 책임을 구분할 수 있습니다.<br>계획 자기 설명: 출처·preflight 판단과 인증·인가·CSRF의 책임을 나눈다. | `spring.security-csrf` · `spring.request-body` | `quiz-java-spring-security-cors-preflight`<br>`quiz-java-spring-security-cors-actual-request` | [SRC17] · [SRC18] |
| 29 · [서비스 메서드의 권한 확인](../../content/lessons/spring/security-method-authorization.md)<br>`spring-security-method-authorization`<br>`spring.security-method-authorization` | URL을 통과한 뒤 서비스 메서드에서도 권한을 확인할 수 있을까요?<br>최종 교안 목표: 메서드 인가 활성화와 프록시 호출 여부에 따라 검사 경계를 판단할 수 있습니다.<br>계획 자기 설명: 메서드 인가 활성화와 프록시를 거치는 호출 경계를 판단한다. | `spring.ioc-di` · `spring.security-request-rules` | `quiz-java-spring-security-method-authorization-authority`<br>`quiz-java-spring-security-method-authorization-proxy` | [SRC19] · [SRC20] |
| 30 · [OAuth 2.0과 OIDC의 역할](../../content/lessons/spring/security-oauth2-oidc.md)<br>`spring-security-oauth2-oidc`<br>`spring.security-oauth2-oidc` | 외부 로그인과 토큰을 받는 API는 같은 역할일까요?<br>최종 교안 목표: 외부 로그인 Client, Resource Server와 토큰별 사용 목적을 구분할 수 있습니다.<br>계획 자기 설명: OAuth2 client·resource server·authorization server와 OIDC 식별 역할을 구분한다. | `spring.security-authentication-authorization` · `spring.security-session-logout` | `quiz-java-spring-security-oauth2-oidc-roles`<br>`quiz-java-spring-security-oauth2-oidc-token-purpose` | [SRC21] · [SRC22] · [SRC23] |
| 31 · [JWT를 받는 API의 검증](../../content/lessons/spring/security-jwt-resource-server.md)<br>`spring-security-jwt-resource-server`<br>`spring.security-jwt-resource-server` | JWT의 내용을 읽을 수 있으면 믿어도 될까요?<br>최종 교안 목표: JWT의 서명·발급자·시간·대상 검증과 scope 기반 인가를 구분할 수 있습니다.<br>계획 자기 설명: JWT 서명·발급자·시간·대상 검증과 scope 인가를 나눈다. | `spring.security-oauth2-oidc` · `spring.security-request-rules` | `quiz-java-spring-security-jwt-resource-server-audience`<br>`quiz-java-spring-security-jwt-resource-server-scope` | [SRC24] · [SRC25] |
| 32 · [보안 테스트가 확인하는 경로](../../content/lessons/spring/security-tests.md)<br>`spring-security-tests`<br>`spring.security-tests` | 권한과 CSRF 실패를 테스트에서 어떻게 구분할까요?<br>최종 교안 목표: 보안 필터 포함 여부와 인증 대역·CSRF 조건에 따라 테스트 근거를 설명할 수 있습니다.<br>계획 자기 설명: 보안 필터 포함 여부와 인증대역·CSRF 조건을 분리하여 테스트 근거를 설명한다. | `spring.mvc-tests` · `spring.security-method-authorization` · `spring.security-csrf` · `spring.security-jwt-resource-server` | `quiz-java-spring-security-tests-isolate-authz`<br>`quiz-java-spring-security-tests-mock-jwt` | [SRC26] · [SRC27] · [SRC28] |

### Security 문항별 경험과 최종 학습목표

개별 `newE`가 없는 행은 E 없음이다. 단서와 새 A/E/C·오개념은 작성자 경험 카드의 표현을 유지한다. 첫 열의 최종 학습목표는 실제 문항의 `learningObjective`를 그대로 옮겼다.

| 문항 ID | 공개 단서·사례 | 새 A/E/C | 대표 오답·오개념 |
| --- | --- | --- | --- |
| `quiz-java-spring-security-authentication-authorization-identity`<br>최종 학습목표: 확인된 사용자와 부여된 권한을 나누어 요청 허용 여부를 판단할 수 있다. | 사용자 확인 성공·읽기 권한만 있는 사용자의 수정 요청 | A: 확인된 신원과 부여된 권한을 따로 읽는다.<br>E: 없음<br>C: 로그인 성공 뒤 쓰기 권한이 없는 조건 | 로그인에 성공하면 모든 쓰기 기능을 사용할 수 있다. |
| `quiz-java-spring-security-authentication-authorization-response`<br>최종 학습목표: 미인증과 인증된 사용자의 권한 부족에서 필요한 대응을 구분할 수 있다. | 같은 보호 자원에서 미인증과 인증됐으나 권한부족을 비교 | A: 인증 시작과 접근 거부의 원인을 구분한다.<br>E: 없음<br>C: 응답 방식은 form/API 설정마다 달라 상태코드만으로 단정하지 않는다. | 미인증과 권한 부족은 원인도 같고 어떤 설정에서도 응답 방식이 같다. |
| `quiz-java-spring-security-filter-chain-before-controller`<br>최종 학습목표: 보안 필터에서 끝난 요청과 MVC 내부의 처리를 구별할 수 있다. | 권한 거부되어 컨트롤러 관찰 지점에 도달하지 않은 요청 | A: 보안 필터와 DispatcherServlet의 순서를 추적한다.<br>E: 없음<br>C: MVC 예외 처리기로 모든 필터 실패를 처리한다는 오해 | 모든 HTTP 실패는 컨트롤러에 먼저 도달하므로 MVC advice가 처리한다. |
| `quiz-java-spring-security-filter-chain-first-chain`<br>최종 학습목표: 겹치는 요청 조건에서 처음 일치한 SecurityFilterChain 하나를 선택할 수 있다. | 순서 1 /api/** 체인과 순서 2 전체 체인에 겹치는 /api/notices | A: 처음 일치한 SecurityFilterChain 하나를 선택한다.<br>E: 없음<br>C: 겹치는 체인의 규칙을 합산하지 않는다. | 한 요청이 여러 SecurityFilterChain에 맞으면 그 체인을 모두 이어 실행한다. |
| `quiz-java-spring-security-request-rules-method`<br>최종 학습목표: 메서드와 경로를 함께 적용해 쓰기 요청의 인가 조건을 찾을 수 있다. | GET 공개 읽기와 POST 쓰기권한, 나머지 거부의 요청 비교 | A: 메서드와 경로를 함께 맞추고 필요한 authority를 고른다.<br>E: 없음<br>C: 읽기 허용이 쓰기 허용으로 확장되지 않는다. | GET으로 공개된 경로는 POST도 같은 권한으로 사용할 수 있다. |
| `quiz-java-spring-security-request-rules-order`<br>최종 학습목표: 선언 순서가 겹치는 경로의 인가 판단에 미치는 영향을 설명할 수 있다. | /notices/** authenticated가 /notices/admin/** hasAuthority보다 앞선 GET | A: 선언 순서에서 첫 일치를 찾는다.<br>E: 없음<br>C: 더 구체적이어도 뒤쪽 규칙이 자동 우선하지 않는다. | 인가 규칙은 선언 순서와 무관하게 가장 구체적인 경로가 자동 우선한다. |
| `quiz-java-spring-security-form-login-request-format`<br>최종 학습목표: 기본 폼 필터가 읽는 입력과 JSON 요청 본문을 구분할 수 있다. | 기본 formLogin에 JSON body로 username/password를 보낸 요청 | A: 기본 필터가 읽는 폼 파라미터와 JSON 변환 경로를 구별한다.<br>E: 없음<br>C: 유효 CSRF 포함, 사용자 정의 필터·파라미터 변경 없음 | 기본 폼 로그인 필터가 JSON 본문의 username과 password도 자동으로 읽는다. |
| `quiz-java-spring-security-form-login-provider`<br>최종 학습목표: 사용자 조회와 비밀번호 대조의 책임을 연결할 수 있다. | DaoAuthenticationProvider가 사용하는 UserDetailsService·PasswordEncoder | A: 사용자정보 조회 결과를 비밀번호 대조에 연결한다.<br>E: 사용자 조회→자격증명 대조<br>C: 사용자 발견이 비밀번호 일치나 권한부여 완료가 아니다. | UserDetailsService가 사용자를 찾았으면 비밀번호가 달라도 인증 성공이다. |
| `quiz-java-spring-security-password-storage-matches`<br>최종 학습목표: salt가 있는 비밀번호 저장값을 PasswordEncoder로 올바르게 대조할 수 있다. | salt를 쓰는 encoder로 두 번 만든 서로 다른 저장문자열 | A: 원문 입력과 저장 문자열을 matches에 올바른 순서로 전달한다.<br>E: 없음<br>C: 다른 salt로 encode 결과가 달라도 원문 같음이 가능 | 같은 비밀번호를 encode한 문자열끼리 달라지면 로그인 입력도 틀린 것이다. |
| `quiz-java-spring-security-password-storage-storage`<br>최종 학습목표: 비밀번호 로그인에 필요한 저장 방식과 불필요한 원문 보관을 구분할 수 있다. | 회원 비밀번호를 보관하고 나중에 로그인 확인할 설계 | A: 적응형 단방향 저장값과 원문·복호화 저장을 구분한다.<br>E: 없음<br>C: 로그·소스에 원문을 남기거나 일반 빠른 해시를 대체재로 삼지 않는다. | 나중에 로그인하려면 서버에 원문 또는 복호화 가능한 비밀번호가 있어야 한다. |
| `quiz-java-spring-security-session-logout-persist`<br>최종 학습목표: 세션 쿠키와 서버에 보관한 인증 상태의 연결을 설명할 수 있다. | 기본 세션 formLogin 성공 후 후속 요청이 세션ID 쿠키를 전달 | A: 서버 저장 인증을 다음 요청에 연결한다.<br>E: 없음<br>C: 브라우저가 Authentication 객체나 비밀번호를 그대로 보낸다고 오해하지 않는다. | 세션 쿠키에 Authentication 객체나 원문 비밀번호가 들어가 다음 요청으로 전달된다. |
| `quiz-java-spring-security-session-logout-logout`<br>최종 학습목표: 기본 CSRF 활성 상태에서 로그아웃 확인과 실제 처리를 구분할 수 있다. | CSRF 기본 활성·표준 로그아웃에서 GET과 유효token POST 비교 | A: 확인화면과 세션무효화·SecurityContext 정리를 구분한다.<br>E: 없음<br>C: UI 링크만 숨기는 일은 서버 로그아웃이 아니다. | 로그아웃 화면을 열거나 버튼을 숨기면 서버의 세션 인증도 끝난다. |
| `quiz-java-spring-security-csrf-missing-token`<br>최종 학습목표: 인증·권한이 있어도 CSRF 토큰 누락으로 변경 요청이 거부될 수 있음을 판단할 수 있다. | 세션 인증·쓰기권한·유효본문 POST에서 CSRF token만 없음 | A: 권한 조건과 CSRF 조건을 독립적으로 검사한다.<br>E: 없음<br>C: 기본 CSRF·기본 AccessDeniedHandler·다른거부조건없음 | 로그인했고 쓰기 권한이 있으면 CSRF 토큰이 없어도 변경 요청이 통과한다. |
| `quiz-java-spring-security-csrf-permit-all`<br>최종 학습목표: 인가의 permitAll과 CSRF 보호가 별도 조건임을 적용할 수 있다. | 인가상 permitAll인 공개 POST지만 CSRF 기본 활성 | A: permitAll과 다른 보안 필터 적용을 구분한다.<br>E: 없음<br>C: 공개 URL과 CSRF 보호 해제가 같은 뜻이 아니다. | permitAll은 해당 경로의 CSRF를 비롯한 모든 보안 필터를 해제한다. |
| `quiz-java-spring-security-cors-preflight`<br>최종 학습목표: 쿠키가 없는 preflight를 인증 전에 CORS 정책으로 처리해야 하는 이유를 판단할 수 있다. | 허용된 출처의 쿠키없는 OPTIONS 사전확인 요청이 인증에서 차단 | A: CORS를 보안 인증 판단보다 앞에서 처리할 필요를 찾는다.<br>E: 없음<br>C: 실제 요청 인가를 공개로 바꾸는 해결과 구분 | 쿠키 없는 preflight를 처리하려면 실제 API의 모든 인증 규칙을 공개로 바꿔야 한다. |
| `quiz-java-spring-security-cors-actual-request`<br>최종 학습목표: 출처 허용이 실제 요청의 사용자 권한을 부여하지 않음을 판단할 수 있다. | CORS 통과 뒤 권한없는 사용자의 실제 GET 요청 | A: 브라우저 출처 허용 결과를 실제 요청 권한 검사와 구분한다.<br>E: 없음<br>C: 출처 허용은 사용자 권한·신뢰를 부여하지 않는다. | CORS에서 출처를 허용하면 그 출처 사용자의 실제 요청 권한도 생긴다. |
| `quiz-java-spring-security-method-authorization-authority`<br>최종 학습목표: 요청 인가 통과와 메서드 실행 전 권한 조건을 따로 판단할 수 있다. | EnableMethodSecurity 활성·Bean 프록시 외부 호출·PreAuthorize write | A: 메서드 실행 전 authority를 검사한다.<br>E: 없음<br>C: URL 인가 통과라도 메서드 권한부족이면 본문 실행 전 거부 | URL 인가를 통과하면 서비스 메서드의 권한 조건은 더 이상 확인하지 않는다. |
| `quiz-java-spring-security-method-authorization-proxy`<br>최종 학습목표: 기본 프록시 방식에서 자기 호출이 메서드 인가를 우회할 수 있음을 식별할 수 있다. | 같은 객체 this 호출과 외부에서 주입받은 Bean 호출 비교 | A: 기본 proxy 기반 메서드 검사 경계를 찾는다.<br>E: 없음<br>C: 직접new와 self invocation은 같은 보장이라 주장하지 않는다. | 같은 객체의 this 호출도 외부 Bean 프록시 호출과 똑같이 메서드 인가를 거친다. |
| `quiz-java-spring-security-oauth2-oidc-roles`<br>최종 학습목표: 외부 로그인을 이용하는 Client와 토큰을 검증하는 Resource Server의 역할을 구분할 수 있다. | 외부 발급자의 로그인 결과를 사용하는 웹앱·토큰 받는 API | A: 요청 방향과 토큰 역할로 Client와 Resource Server를 구분한다.<br>E: 없음<br>C: oauth2Login이 토큰발급 서버 구현이라는 오해 | oauth2Login을 켜면 웹앱이 외부 API용 토큰을 발급하는 Authorization Server가 된다. |
| `quiz-java-spring-security-oauth2-oidc-token-purpose`<br>최종 학습목표: OIDC ID token과 API access token의 사용 목적을 구분할 수 있다. | OIDC ID token과 API용 access token을 받은 client | A: ID token의 사용자 인증 정보와 access token의 API 접근 용도를 구분한다.<br>E: 없음<br>C: ID token을 API bearer로 무조건 대체하지 않는다. | OIDC ID token과 API access token은 언제나 같은 용도로 교환해서 쓸 수 있다. |
| `quiz-java-spring-security-jwt-resource-server-audience`<br>최종 학습목표: 신뢰 서명과 발급자·시간을 만족해도 API 대상이 다르면 거부해야 함을 판단할 수 있다. | 신뢰서명·iss·시간은 맞지만 명시 설정한 aud가 다른 토큰 | A: 이 API 대상으로 발급한 토큰인지 검증한다.<br>E: 없음<br>C: issuer-uri만으로 모든 서비스 대상 확인이 끝난다고 오해하지 않는다. | 서명·발급자·시간이 맞는 JWT면 어떤 API를 대상으로 발급됐어도 받을 수 있다. |
| `quiz-java-spring-security-jwt-resource-server-scope`<br>최종 학습목표: 검증된 JWT의 scope와 요청 인가에 필요한 authority를 연결할 수 있다. | 유효 JWT scope=notices.read·기본 SCOPE_ 매핑, write 필요 | A: 토큰 검증 결과의 scope를 API 인가에 연결한다.<br>E: 검증된 토큰→scope 기반 인가<br>C: 토큰 유효성과 모든 업무권한 허용을 구분 | JWT 검증에 성공하면 scope에 없는 쓰기 기능도 허용해야 한다. |
| `quiz-java-spring-security-tests-isolate-authz`<br>최종 학습목표: POST 권한 거부 테스트에서 다른 실패 조건을 통제할 수 있다. | 쓰기 권한 거부만 확인할 POST 테스트·필터 포함·올바른본문 | A: 인증사용자·유효CSRF를 준비하고 대상권한만 제거한다.<br>E: 없음<br>C: CSRF 누락 403을 권한거부 검증으로 오인하지 않는다. | POST 테스트가 403이면 CSRF 누락 여부와 무관하게 권한 규칙을 검증한 것이다. |
| `quiz-java-spring-security-tests-mock-jwt`<br>최종 학습목표: MockMvc jwt 인증 대역으로 검증한 범위를 실제 JWT 서명 검증과 구별할 수 있다. | MockMvc jwt()로 구성한 scope 테스트 | A: 인증대역의 인가검사와 실제 JWT서명검증 범위를 구별한다.<br>E: 없음<br>C: jwt() 통과를 실제 decoder·issuer통신·암호검증 PASS로 확대하지 않는다. | MockMvc jwt()로 만든 인증이 통과하면 실제 JWT 서명과 발급자 통신도 검증됐다. |

### JPA 단위·선수·최종 연결

모든 단위의 `courseId: spring`·`languageId: java`, 파일·slug 관계와 지원·연결 방식은 위 공통 계약을 따른다. 선수 slug는 같은 Spring 과정의 실제 문서이며 마지막 단위가 Security의 `security-form-login`·`security-password-storage`와 연결된다. 최소 예제는 실행하지 않은 정식 Java 25·필요 프레임워크 조건의 읽기 예제다.

| 순서·문서·ID | 질문·목표 | 선수 문서 | 최소 예제·공개 단서 | 두 문항 ID | 공식 출처 |
| --- | --- | --- | --- | --- | --- |
| 33 · [JPA·Hibernate·Spring Data JPA의 역할](../../content/lessons/spring/jpa-roles.md)<br>`spring-jpa-roles`<br>`spring.jpa-roles` | 회원 객체를 DB에 저장할 때 JPA, Hibernate, Repository는 어떤 일을 나누나요?<br>목표: 표준·구현체·저장소 지원의 역할을 저장 흐름에 연결할 수 있습니다. | [framework-boot](../../content/lessons/spring/framework-boot.md) · [ioc-di](../../content/lessons/spring/ioc-di.md) | MemberRepository → JPA EntityManager → Hibernate → DB 역할 그림을 글/표로 읽기 | `quiz-java-spring-jpa-roles-responsibility`<br>`quiz-java-spring-jpa-roles-without-repository` | [SRC29] · [SRC02] · [SRC03] |
| 34 · [행을 구별하고 다른 표와 연결하기](../../content/lessons/spring/jpa-table-keys.md)<br>`spring-jpa-table-keys`<br>`spring.jpa-table-keys` | 같은 이름의 회원과 그 회원의 주문은 어떤 값으로 구별하고 연결하나요?<br>목표: 표의 행·열·기본키·외래키를 읽고 이름이 같은 회원을 구별할 수 있습니다. | [jpa-roles](../../content/lessons/spring/jpa-roles.md) | 회원 2행과 주문 2행 표: member.id와 orders.member_id 연결 | `quiz-java-spring-jpa-table-keys-primary-key`<br>`quiz-java-spring-jpa-table-keys-foreign-key` | [SRC29] · [SRC30] · [SRC31] |
| 35 · [엔티티와 식별자 매핑](../../content/lessons/spring/jpa-entity-id.md)<br>`spring-jpa-entity-id`<br>`spring.jpa-entity-id` | 평범한 Java 객체를 JPA가 다룰 회원으로 표시하려면 무엇이 필요한가요?<br>목표: 엔티티 선언·기본 생성자·식별자와 열 매핑을 코드에서 찾을 수 있습니다. | [jpa-table-keys](../../content/lessons/spring/jpa-table-keys.md) | public non-final Member, protected 무인자 생성자, @Entity @Table @Id @GeneratedValue @Column 작은 코드 | `quiz-java-spring-jpa-entity-id-mapping`<br>`quiz-java-spring-jpa-entity-id-constructor` | [SRC32] · [SRC30] |
| 36 · [Repository로 생성·조회·삭제 요청하기](../../content/lessons/spring/jpa-repository-crud.md)<br>`spring-jpa-repository-crud`<br>`spring.jpa-repository-crud` | 회원 한 명을 조회할 때 어떤 타입과 없는 결과를 다뤄야 하나요?<br>목표: JpaRepository의 엔티티·ID 타입을 읽고 CRUD 메서드와 빈 조회 결과를 구분할 수 있습니다. | [jpa-entity-id](../../content/lessons/spring/jpa-entity-id.md) | MemberRepository extends JpaRepository<Member,Long>; findById(7L) Optional 처리와 save/deleteById 표 | `quiz-java-spring-jpa-repository-crud-id-type`<br>`quiz-java-spring-jpa-repository-crud-missing` | [SRC33] · [SRC34] |
| 37 · [영속성 컨텍스트와 엔티티 상태](../../content/lessons/spring/jpa-context-states.md)<br>`spring-jpa-context-states`<br>`spring.jpa-context-states` | 같은 ID를 다시 읽는 것과 객체의 관리가 끝나는 것은 어떻게 다른가요?<br>목표: new·managed·detached·removed 상태와 한 컨텍스트의 식별자별 관리 원칙을 구분할 수 있습니다. | [jpa-repository-crud](../../content/lessons/spring/jpa-repository-crud.md) | 한 em, 같은 Member PK find 두 번; clear 후 기존 참조 비교. 외부변경없음·동일 컨텍스트 전제 | `quiz-java-spring-jpa-context-states-same-identity`<br>`quiz-java-spring-jpa-context-states-detached` | [SRC35] · [SRC29] |
| 38 · [save와 persist·merge 구분하기](../../content/lessons/spring/jpa-save-merge.md)<br>`spring-jpa-save-merge`<br>`spring.jpa-save-merge` | save에 넘긴 객체와 반환된 객체는 왜 구분해야 하나요?<br>목표: 기본 신규 판정 조건을 확인하고 merge가 반환한 관리 객체를 이어서 사용할 수 있습니다. | [jpa-context-states](../../content/lessons/spring/jpa-context-states.md) | 기본 판정·@Version 없음·Persistable 없음·Long id; new null id vs existing detached non-null id; merge return | `quiz-java-spring-jpa-save-merge-new-detection`<br>`quiz-java-spring-jpa-save-merge-merge-return` | [SRC34] · [SRC35] |
| 39 · [트랜잭션 안에서 변경 감지하기](../../content/lessons/spring/jpa-transactions.md)<br>`spring-jpa-transactions`<br>`spring.jpa-transactions` | 조회한 회원의 이름만 바꾸면 언제 저장 변경으로 이어지나요?<br>목표: 활성 쓰기 트랜잭션·관리 상태에서 변경 감지를 설명하고 서비스 작업 단위의 경계를 고를 수 있습니다. | [jpa-save-merge](../../content/lessons/spring/jpa-save-merge.md) | Spring proxy 외부 호출 @Transactional service에서 find+rename; tx manager설정됨·readOnly=false; unchecked failure rollback | `quiz-java-spring-jpa-transactions-dirty-check`<br>`quiz-java-spring-jpa-transactions-work-unit` | [SRC36] · [SRC29] |
| 40 · [flush와 커밋의 차이](../../content/lessons/spring/jpa-flush-commit.md)<br>`spring-jpa-flush-commit`<br>`spring.jpa-flush-commit` | DB로 변경을 보낸 뒤에도 트랜잭션을 되돌릴 수 있나요?<br>목표: 영속성 컨텍스트 동기화와 트랜잭션 확정을 구분하고 flush 시점의 오류 가능성을 설명할 수 있습니다. | [jpa-transactions](../../content/lessons/spring/jpa-transactions.md) | 활성 쓰기 tx em.persist → em.flush → rollback; 일반 transaction 지원 table/DDL 외부효과 제외 | `quiz-java-spring-jpa-flush-commit-rollback`<br>`quiz-java-spring-jpa-flush-commit-constraint` | [SRC35] · [SRC29] |
| 41 · [연관관계의 주인과 외래키](../../content/lessons/spring/jpa-relations.md)<br>`spring-jpa-relations`<br>`spring.jpa-relations` | 양방향 관계에서 어느 필드를 바꿔야 DB 연결 변경을 표현하나요?<br>목표: many-to-one 외래키 매핑과 mappedBy의 방향을 읽고 양쪽 객체 참조를 일관되게 맞출 수 있습니다. | [jpa-table-keys](../../content/lessons/spring/jpa-table-keys.md) · [jpa-context-states](../../content/lessons/spring/jpa-context-states.md) | Order.member @ManyToOne @JoinColumn; Member.orders @OneToMany(mappedBy="member"); persistedmanaged 양측, cascade제외 | `quiz-java-spring-jpa-relations-owner`<br>`quiz-java-spring-jpa-relations-both-sides` | [SRC31] · [SRC29] |
| 42 · [연관 객체를 읽는 시점](../../content/lessons/spring/jpa-fetch-loading.md)<br>`spring-jpa-fetch-loading`<br>`spring.jpa-fetch-loading` | LAZY로 둔 연관 객체는 언제든 추가로 읽을 수 있나요?<br>목표: LAZY와 EAGER의 계약을 구분하고 관리 범위가 끝난 미초기화 연관의 조회 요구를 찾을 수 있습니다. | [jpa-relations](../../content/lessons/spring/jpa-relations.md) | Hibernate 미초기화 proxy, session종료, 외부lazyload없음 명시; 서비스 안 DTO 구성 | `quiz-java-spring-jpa-fetch-loading-fetch-contract`<br>`quiz-java-spring-jpa-fetch-loading-closed-context` | [SRC37] · [SRC35] |
| 43 · [조회 메서드 이름과 JPQL](../../content/lessons/spring/jpa-query-methods.md)<br>`spring-jpa-query-methods`<br>`spring.jpa-query-methods` | Java 속성과 DB 열 이름이 다를 때 조회 조건에는 어느 이름을 쓰나요?<br>목표: 메서드 이름의 조건과 JPQL의 엔티티·속성 이름을 읽고 바인딩 값과 쿼리 구조를 구분할 수 있습니다. | [jpa-repository-crud](../../content/lessons/spring/jpa-repository-crud.md) · [jpa-entity-id](../../content/lessons/spring/jpa-entity-id.md) | Member nickname→display_name; findByNickname; @Query select m from Member m where m.nickname=:name | `quiz-java-spring-jpa-query-methods-derived-name`<br>`quiz-java-spring-jpa-query-methods-jpql-bind` | [SRC38] · [SRC33] |
| 44 · [N+1을 관찰하고 조회 계획 세우기](../../content/lessons/spring/jpa-fetch-plan.md)<br>`spring-jpa-fetch-plan`<br>`spring.jpa-fetch-plan` | 목록 조회 뒤에 연관 조회가 반복될 때 무엇을 바꿔야 하나요?<br>목표: 주어진 조회 패턴에서 N+1을 진단하고 화면에 필요한 연관 데이터를 위한 fetch 계획을 비교할 수 있습니다. | [jpa-fetch-loading](../../content/lessons/spring/jpa-fetch-loading.md) · [jpa-query-methods](../../content/lessons/spring/jpa-query-methods.md) | 가정trace 주문1쿼리+서로다른회원3개각1쿼리,캐시없음; to-one joinfetch vs entitygraph/batch/DTO 선택 | `quiz-java-spring-jpa-fetch-plan-diagnose`<br>`quiz-java-spring-jpa-fetch-plan-to-one-plan` | [SRC38] · [SRC29] |
| 45 · [Page와 Slice로 목록 나누기](../../content/lessons/spring/jpa-pagination.md)<br>`spring-jpa-pagination`<br>`spring.jpa-pagination` | 전체 페이지 수가 필요한 목록과 다음 묶음만 필요한 목록은 어떻게 다르나요?<br>목표: Page·Slice와 페이지 번호·정렬 조건을 읽고 count와 연관 조회 조건을 따로 검토할 수 있습니다. | [jpa-query-methods](../../content/lessons/spring/jpa-query-methods.md) · [jpa-fetch-plan](../../content/lessons/spring/jpa-fetch-plan.md) | PageRequest.of(0,20, Sort.by("nickname").and(Sort.by("id"))); Page vs Slice; DB변경없음 | `quiz-java-spring-jpa-pagination-page-slice`<br>`quiz-java-spring-jpa-pagination-order` | [SRC33] · [SRC39] |
| 46 · [DB 회원 조회를 로그인에 연결하기](../../content/lessons/spring/jpa-member-login.md)<br>`spring-jpa-member-login`<br>`spring.jpa-member-login` | DB에서 찾은 회원은 어떻게 비밀번호 인증에 사용되나요?<br>목표: Repository 조회·UserDetailsService 변환·PasswordEncoder 검증의 경계를 설명할 수 있습니다. | [jpa-query-methods](../../content/lessons/spring/jpa-query-methods.md) · [jpa-transactions](../../content/lessons/spring/jpa-transactions.md) · [security-form-login](../../content/lessons/spring/security-form-login.md) · [security-password-storage](../../content/lessons/spring/security-password-storage.md) | 고유 username으로 저장회원 찾기, encodedPassword와 authority를 transaction안에서 UserDetails로구성, DaoAuthenticationProvider가검증; raw반환없음 | `quiz-java-spring-jpa-member-login-lookup-boundary`<br>`quiz-java-spring-jpa-member-login-not-found` | [SRC09] · [SRC38] |

### JPA 문항별 경험

각 문항은 L1 기본 판단 또는 L2 조건 판단이며 E는 지원 있는 연결 판단이다. `N/A`와 재사용 A는 작성자 원문의 판정이며, 해당 행의 C/E가 추가 근거인 경우 이를 새 A로 바꾸지 않는다.

| 문항 ID | 판단할 상황·조건 | 새 A/E/C | 대표 오답·오개념 |
| --- | --- | --- | --- |
| `quiz-java-spring-jpa-roles-responsibility` | Repository 인터페이스의 저장 요청을 받았을 때 규칙과 실제 SQL 처리 주체를 고른다. | A: 표준/구현체/저장소지원 3층을 처음 구분하는 A<br>E: N/A<br>C: N/A | 세 라이브러리를 DB 자체로 혼동 |
| `quiz-java-spring-jpa-roles-without-repository` | JPA EntityManager를 직접 사용하는 앱에 Spring Data JPA가 없는 경우 가능한 구조를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 편의 계층이 없는 조건에서도 JPA 구현체가 필요함을 판단 | JPA와 Spring Data JPA를 반드시 동시에 사용 |
| `quiz-java-spring-jpa-table-keys-primary-key` | 이름은 같은 두 회원의 주문을 연결할 키를 고른다. | A: A: 표시값이 아닌 행 식별키로 관계를 읽기<br>E: N/A<br>C: N/A | 이름만 같으면 같은 회원 |
| `quiz-java-spring-jpa-table-keys-foreign-key` | 주어진 회원 키에 없는 member_id가 들어오는 주문을 외래키 제약 조건에서 판단한다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 참조 대상 부재와 FK 제약을 적용 | 외래키가 회원을 자동 생성 |
| `quiz-java-spring-jpa-entity-id-mapping` | @Entity @Table @Id @Column이 붙은 Member에서 nickname 값과 행 식별자를 고른다. | A: A: Java 속성과 DB 열/식별자 매핑 읽기<br>E: N/A<br>C: N/A | 필드명 id만 있으면 자동 식별 |
| `quiz-java-spring-jpa-entity-id-constructor` | record를 엔티티로 쓰려는 제안 대신 표준 JPA 요구를 만족하는 선언을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: Java 데이터 표현과 JPA entity 클래스 계약의 차이 | record는 모든 framework data형식에 사용 가능 |
| `quiz-java-spring-jpa-repository-crud-id-type` | Long 식별자인 MemberRepository 제네릭과 findById 인수 구성을 고른다. | A: A: 엔티티와 ID 두 타입 계약 읽기<br>E: N/A<br>C: N/A | ID 타입 자리에 엔티티의 이름 타입 |
| `quiz-java-spring-jpa-repository-crud-missing` | 없는 키에 대한 findById 반환을 Optional.empty 조건으로 읽고 호출자 분기를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 없는 행일 때 새 회원 자동 생성/무조건 get 거부 | 없는 행을 null/new Member로 처리 |
| `quiz-java-spring-jpa-context-states-same-identity` | 같은 열린 컨텍스트에서 같은 PK를 두 번 find하고 중간 clear가 없을 때 객체 관계를 고른다. | A: A: 영속 ID당 관리 객체 하나 원칙<br>E: N/A<br>C: N/A | find마다 무조건 새 Java 객체 |
| `quiz-java-spring-jpa-context-states-detached` | 기존 행을 조회한 뒤 clear하고 참조를 수정했을 때 자동 변경 반영 여부를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: DB 행 존재와 managed 상태의 분리 | ID가 있으면 영원히 변경감지 |
| `quiz-java-spring-jpa-save-merge-new-detection` | @Version·Persistable이 없는 Long id 엔티티를 기본 save가 받았고 id=null일 때 선택하는 연산을 고른다. | A: A: 기본 신규 판정 규칙 적용<br>E: N/A<br>C: N/A | save 항상 INSERT/항상 merge |
| `quiz-java-spring-jpa-save-merge-merge-return` | existing row detached 객체를 merge한 뒤 변경할 참조를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: detached 인수가 managed로 바뀌는 것이 아닌 상태 복사 결과 사용 | merge 인수 자체가 영속화됨 |
| `quiz-java-spring-jpa-transactions-dirty-check` | 쓰기 tx에서 조회한 관리 엔티티를 rename하고 정상 커밋할 때 save 재호출 유무의 의미를 고른다. | A: A: managed 속성 변경을 작업 단위 커밋과 연결<br>E: N/A<br>C: N/A | set 메서드마다 SQL 즉시실행/항상 save 필수 |
| `quiz-java-spring-jpa-transactions-work-unit` | 두 변경을 함께 성공/실패시킬 서비스에서 트랜잭션 경계 위치를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: 여러 repository 호출을 하나의 업무 트랜잭션에 포함<br>C: N/A | repository 각각의 tx만 있으면 전체원자성 |
| `quiz-java-spring-jpa-flush-commit-rollback` | flush 성공 뒤 rollback한 일반 트랜잭션의 데이터 변경 상태를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: DB 전달 완료와 확정 상태 분리 | flush=commit |
| `quiz-java-spring-jpa-flush-commit-constraint` | 고유값 중복이 있는 저장 후 flush에서 제약 오류가 드러난 상황에서 실패를 판단할 지점을 고른다. | A: A: Java 객체 변경과 동기화 실패를 분리하여 tx 종료까지 확인<br>E: N/A<br>C: N/A | save 메서드가 반환하면 이후 실패 불가 |
| `quiz-java-spring-jpa-relations-owner` | 위 매핑에서 DB FK 변경을 결정하는 Java 속성을 고른다. | A: A: mappedBy가 가리키는 소유 필드 찾기<br>E: N/A<br>C: N/A | 목록이 있는쪽이 항상 주인 |
| `quiz-java-spring-jpa-relations-both-sides` | 새 주문을 기존회원에 연결하는 helper에서 owner와 inverse를 모두 맞출 행동을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: FK지시 변경→메모리 역참조 일관성 연결<br>C: N/A | inverse 목록만 add해도 연결 변경 보장 |
| `quiz-java-spring-jpa-fetch-loading-fetch-contract` | EAGER/LAZY를 설정했을 때 보장되는 읽기 시점과 SQL형태를 고른다. | A: A: 로딩시점 계약을 JOIN전략과 분리<br>E: N/A<br>C: N/A | EAGER=항상한번JOIN, LAZY=무조건 SQL미실행 |
| `quiz-java-spring-jpa-fetch-loading-closed-context` | Hibernate LAZY 연관이 미초기화이고 session종료 조건에서 화면 필요 데이터를 준비할 위치를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 객체 참조 존재와 추가조회가능범위 분리 | 엔티티를 화면에 넘기면 닫힌session자동재연결 |
| `quiz-java-spring-jpa-query-methods-derived-name` | Entity nickname 및 DB display_name이 주어졌을 때 유효한 파생 메서드를 고른다. | A: A: 객체속성으로 조건 생성<br>E: N/A<br>C: N/A | DB열명을 메서드에 적용 |
| `quiz-java-spring-jpa-query-methods-jpql-bind` | 명시 @Query JPQL 조건에 사용자 입력을 값으로 넘기는 방식을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: 엔티티속성 언어→parameter binding 연결<br>C: N/A | 입력을 쿼리문자열로 직접결합/SQL표명을 JPQL에 사용 |
| `quiz-java-spring-jpa-fetch-plan-diagnose` | 상세 전제가 제공된 1+N 가상 조회 기록에서 반복 조회 원인을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: 목록결과→각연관접근→추가조회 수 연결<br>C: N/A | repository 호출한번=SQL한번 |
| `quiz-java-spring-jpa-fetch-plan-to-one-plan` | 페이징없는 주문+회원명 목록에 유효한 JPQL left join fetch o.member 사용 이유를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 필요연관은 함께준비하되 다수컬렉션동시fetch 위험구분 | 모든연관을 EAGER로 변경하면 모두해결 |
| `quiz-java-spring-jpa-pagination-page-slice` | 총건수 없이 다음묶음유무만 필요한 동일조건조회에 Page/Slice 반환 선택을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 반환계약의 총량요구로 count필요성 판단 | Page와 Slice항상같은총건수보장 |
| `quiz-java-spring-jpa-pagination-order` | 닉네임 중복·DB불변 조건에서 첫페이지의 안정적 정렬과 0기반인수를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: 페이지범위→전체정렬→고유키tie-breaker 연결<br>C: N/A | 0기반/중복정렬/collectionfetch제한의 무조건일반화 |
| `quiz-java-spring-jpa-member-login-lookup-boundary` | 등록된 DaoAuthenticationProvider 경로에서 JPA repository가 찾은 회원정보를 넘길 지점을 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: E: 저장조회→UserDetails구성→Security인증으로 데이터경계연결<br>C: N/A | repository가로그인성공판정/인가를대신 |
| `quiz-java-spring-jpa-member-login-not-found` | username회원없음 조건에서 UserDetailsService 처리와 자동가입 여부를 고른다. | A: 공통 판단은 같은 교안에서 재사용, 아래 C/E가 추가근거<br>E: N/A<br>C: C: 조회실패를 인증용실패로전달하고가입과분리 | 없는회원자동생성/평문저장/해시equals |

### 작성 근거의 공식 출처

아래 링크는 작성자 계획의 원래 URL이다. 버전·표준과 구현체별 조건은 본문·문항의 독립 검토에서 대조하며, 링크 확인 자체를 교육 내용의 최종 승인으로 사용하지 않는다.

[SRC01]: https://docs.spring.io/spring-boot/system-requirements.html
[SRC02]: https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
[SRC03]: https://hibernate.org/orm/releases/7.4/
[SRC04]: https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html
[SRC05]: https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html
[SRC06]: https://docs.spring.io/spring-security/reference/servlet/architecture.html
[SRC07]: https://docs.spring.io/spring-security/reference/servlet/configuration/java.html
[SRC08]: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html
[SRC09]: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html
[SRC10]: https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html
[SRC11]: https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html
[SRC12]: https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/crypto/password/PasswordEncoder.html
[SRC13]: https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html
[SRC14]: https://docs.spring.io/spring-security/reference/servlet/authentication/logout.html
[SRC15]: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html
[SRC16]: https://docs.spring.io/spring-security/reference/features/exploits/csrf.html
[SRC17]: https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html
[SRC18]: https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html
[SRC19]: https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html
[SRC20]: https://docs.spring.io/spring-framework/reference/core/aop/proxying.html
[SRC21]: https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html
[SRC22]: https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html
[SRC23]: https://openid.net/specs/openid-connect-core-1_0.html
[SRC24]: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
[SRC25]: https://www.rfc-editor.org/rfc/rfc7519.html
[SRC26]: https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/setup.html
[SRC27]: https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/csrf.html
[SRC28]: https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/oauth2.html
[SRC29]: https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html
[SRC30]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/id
[SRC31]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/manytoone
[SRC32]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entity
[SRC33]: https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html
[SRC34]: https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html
[SRC35]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager
[SRC36]: https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html
[SRC37]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/fetchtype
[SRC38]: https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html
[SRC39]: https://docs.hibernate.org/orm/7.4/whats-new/

## 검증 범위와 증거

| 단계 | 실제 근거와 상태 | 한계·남은 판정 |
| --- | --- | --- |
| Security 작성자 | 12본문·24문항·96보기·12직접답 발췌 작성. `python3`에서 작성자 `self-check.py`를 compile/exec한 정적 자체 점검 통과. ID·순서·목표/요약·직접답·두 문항·한 정답·보기 피드백·코드 fence·실제 링크·연속 발췌 확인 | 작성자의 자체 점검이며 독립 내용·실행·통합 PASS 아님 |
| JPA 작성자 | `python3 /private/tmp/bam-jpa-authoring/finalize.py`, `node /private/tmp/bam-jpa-authoring/check.mjs` 통과. 14본문·28문항·14발췌와 schema/runtime 수용·연속 order·실제 선수·목표·직접답·고유 ID·보기/피드백·최종 SHA 확인 | 최초 Node 임시 검사는 validator 반환값을 오류 배열로 오독해 실패. 실제 유효 개념 배열을 확인하도록 검사 스크립트만 수정 후 재실행 통과. 독립 승인 아님 |
| 관리 조립·문서 대조 | 관리자 `FINAL_MANAGER_FOCUSED_PASS`: 기존 JSON Schema·runtime curriculum/quiz/review 계약 수용, Security·JPA 최종 조각과 실제 조립 객체 일치, 기존 153교안·232문항·151개념 객체와 상대 순서 보존 확인. 기존 과정 필드는 승인된 Spring `description`만 변경 | 관리 범위의 검사 결과이며 독립 내용·실행·통합 PASS 아님. 문서 담당도 최종 조각과 실제 대응 객체·수량을 읽어 대조 |
| 독립 내용·문서 | `CONTENT_VALIDATOR_STATIC_PASS`·`DOCUMENT_REVIEW_PASS`. 26본문·52문항·208보기/해설·26직접답 발췌, A/E/C·선수·목표·첫 독해·유일 정답과 공식 출처를 전수 대조. 6문서 diff·영구 경험표·실제 수량·상대 링크 289개 확인 | 유일한 콘텐츠 반환인 `quiz-java-spring-security-request-rules-method`의 `HTTP 메서드 enum`→`HTTP 메서드 타입` 수정 반영 확인. 목표·코드·보기·정답·피드백 보존. 정적 내용 판정이며 Java/Spring/DB 실행 결과 아님 |
| 독립 실행 | `test_engineer PASS`. Node v24.17.0의 작성자 명령 `node --test tests/extension-content.test.js tests/learning-catalog-view.test.js tests/lesson-answer.test.js tests/app-independent-review.test.js` 원로그 69 PASS와 실제 diff·SHA를 독립 감사. 변경 없는 UI 40파일의 hash로 이전 채점·완료·복구 증거 재사용. Chrome 1853×796에서 Security CSRF·JPA 회원 로그인 문서의 실제 두 문항씩과 JPA 개념→문서→문제 키보드 왕복·초점 복구, 콘솔 warning/error 0 확인 | 69건을 검증자가 재실행한 결과는 아님. `BAM_DEV_PORT=4316 node scripts/dev-server.mjs`와 별도 QA 탭을 사용한 뒤 종료. 사용자 4189 탭·저장 상태 유지. 공식 출처를 열지 않은 로컬 흐름이며 완전 네트워크 차단·설치형 오프라인 검증 아님 |
| 최종 통합 | `PROJECT_INTEGRATOR_PASS`. 안전한 `/private/tmp/bam-security-jpa-integrator/workspace`에서 Node v24.17.0·npm 11.13.0으로 이번 `npm run check` 1회 실행, exit 0·651/651·콘텐츠 179교안/284문항·정적 빌드 완료. `POST_GATE_PRESERVATION_AND_BUILD_PASS`: 원본·복제본 351소스 무변경, 빌드 237파일 원본 일치와 새 26본문 포함, 기존 객체 보존 확인 | 원본 `dist` 82파일·`.git` 1,951파일과 branch·HEAD·Git 상태는 통합 준비 시점 이후 보존 확인. 작업 시작부터의 Git/dist 보존으로 확대하지 않음. 이전 작업의 651/651과 별도 실행이다. 전체 gate의 실패·재실행 없음 |

기존 개념 24개 변경 지적은 CV·TE의 임시 비교 helper가 `id`만 키로 써서 생긴 오탐이었다. 실제 `(lessonId, id)` 복합키와 기존 151객체의 원문 배열 대조로 동일함을 확인해 철회했으며 저장소 변경·복구는 없었다. Markdown에 문항 ID가 직접 있어야 한다던 CTA helper도 실제 연결 계약으로 정정했다. JPA 작성자 임시 검사와 TE의 임시 UTF-8 보고서 기록 오류는 검사·기록 도구의 오류이며 제품 테스트 실패가 아니다.

작성자·관리 근거는 `/private/tmp/bam-security-authoring/HANDOFF.md`, `/private/tmp/bam-jpa-authoring/handoff.md`, `/private/tmp/bam-security-manager/final-contract-check.json`에 있다. 독립 내용·문서는 `/private/tmp/bam-security-jpa-validator/full-content-reading.md`·`final-document-review.json`, 실행은 `/private/tmp/bam-security-jpa-independent-test/report.md`·`browser-observations.json`, 통합 실행·보존은 `/private/tmp/bam-security-jpa-integrator/gate-result.json`·`npm-check.log`·`post-gate-audit.json`·`report.md`·`integration-summary.json`에 기록했다.

작성자·검증자는 위험에 직접 관련된 focused 검사를 사용하고 전체 gate는 통합 최종 상태에서 실행한다. 검증 후 결과 기록만 바뀌면 문서 diff·링크·증거 정합성을 확인한다. 정적 예제의 Java/Spring/DB 실행은 실행 계약이 없어 `N/A`이며 Java 컴파일·Boot/Security/JUnit·SQL/DB·성능·모바일·설치·Git 결과는 주장하지 않는다.
