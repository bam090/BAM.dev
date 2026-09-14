# 보안 테스트가 확인하는 경로

## 학습 목표

보안 필터 포함 여부와 인증 대역·CSRF 조건에 따라 테스트 근거를 설명할 수 있습니다.

## 한줄 요약

보안 테스트는 실제 검사 경로를 포함하고, 인증·권한·CSRF 조건을 분리해야 원인을 설명할 수 있습니다.

## 먼저 확인할 개념

[MockMvc로 확인하는 MVC 테스트 범위](#/learn/spring/mvc-tests) · [@PreAuthorize로 서비스 메서드 인가하기](#/learn/spring/security-method-authorization) · [쿠키 인증과 CSRF 방어](#/learn/spring/security-csrf) · [JWT를 받는 API의 검증](#/learn/spring/security-jwt-resource-server)

## 무엇을 통과시키고 무엇을 실패시킬까

**보안 테스트**는 사용자 상태와 요청 조건을 준비해 보안 정책이 의도대로 허용·거부하는지 확인한다. MockMvc에 실제 보안 필터 연결을 포함해야 요청 인가와 CSRF 검사 경로를 확인할 수 있다. 직접 구성한 MockMvc에서는 `springSecurity()` 통합 등 필요한 설정을 사용한다. 필터가 빠진 성공 결과는 그 필터의 보안 정책을 검증한 결과가 아니다.

공지 작성 권한을 검사할 때에는 다른 조건을 고정해야 한다.

| 사례 | 인증 | 쓰기 권한 | CSRF 토큰 | 확인 목표 |
| --- | --- | --- | --- | --- |
| 정상 요청 | 있음 | 있음 | 유효 | 허용 경로 |
| 권한 거부 | 있음 | 없음 | 유효 | 인가 규칙 |
| CSRF 거부 | 있음 | 있음 | 누락·잘못됨 | CSRF 규칙 |

본문과 MVC 매핑은 세 사례 모두 유효하다고 가정한다. 토큰과 권한이 모두 없으면 403 하나만 보고 어느 검사를 통과했는지 판단하기 어렵다.

## 인증 대역으로 확인하는 범위를 안다

다음은 보안 필터가 포함된 MockMvc에서 쓸 수 있는 요청 구성 조각이다. 관련 static 메서드는 `SecurityMockMvcRequestPostProcessors`에 있다. `mvc`와 import 등 테스트 준비 코드는 생략한 읽기 예제다.

```java
mvc.perform(post("/notices")
    .with(user("reader").authorities(
        new SimpleGrantedAuthority("notices.read")))
    .with(csrf())
    .param("title", "변경 공지"));
```

`SimpleGrantedAuthority`는 `org.springframework.security.core.authority`의 타입이다. 컨트롤러가 title 폼 파라미터를 읽고 공지 작성의 인가 규칙이 쓰기 권한을 요구하는 상황이라면 권한 부족을 확인할 수 있다. `user(...)`는 테스트용 인증 상태를 준비하므로 실제 비밀번호 로그인을 거친 것은 아니다. `csrf()`는 유효한 토큰을 넣어 권한 판단을 방해하는 별도 실패를 줄인다.

JWT API의 `jwt()`도 토큰 인증 대역을 준비하는 도구다. scope에 따른 인가를 검사할 수 있지만 실제 JWT 문자열의 서명 검증을 수행했다는 근거는 아니다. 실제 decoder의 검증, 외부 키 조회, 브라우저 통신은 해당 경로를 별도로 확인해야 한다.

직접 해볼 일: “쓰기 권한이 없으면 거부되는가”를 확인할 테스트에서 고정할 조건과 바꿀 조건을 표에 표시한다. 이어서 `jwt()`로 통과한 결과에서 확인한 것과 아직 확인하지 않은 것을 한 문장씩 적는다. 이 교안의 예제는 실행하지 않았으며 테스트 작성·실행은 별도 실습 범위다.

## 이어서 연습하기

Security 입문 흐름의 마지막 문서입니다. 요청, 인증 정보, 인가 조건과 테스트 경로를 자신의 말로 이어 설명해 보세요. 다음 [JPA의 역할](#/learn/spring/jpa-roles)에서는 데이터 저장·조회 흐름을 시작합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [MockMvc와 보안 설정](https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/setup.html)
- [CSRF 테스트](https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/csrf.html)
- [OAuth 2.0과 JWT 테스트](https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/oauth2.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

보안 정책을 확인하려면 테스트가 보안 필터 경로를 포함해야 하며 인증·권한·CSRF 조건을 분리해야 합니다. 권한 거부를 검사할 때는 유효 CSRF 토큰 등 다른 조건을 갖추어 원인을 구분합니다. user나 jwt 같은 인증 대역은 인가 판단을 돕지만 실제 비밀번호 로그인이나 JWT 서명 검증까지 통과했다는 근거는 아닙니다.
