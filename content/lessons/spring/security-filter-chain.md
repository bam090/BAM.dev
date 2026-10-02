# 보안 필터 체인과 요청 인가

## 학습 목표

- 요청에 처음 일치하는 SecurityFilterChain과 컨트롤러 전에 멈추는 지점을 설명할 수 있습니다.
- securityMatcher의 체인 범위와 requestMatchers의 인가 조건을 구분할 수 있습니다.
- HTTP 메서드·경로·선언 순서로 처음 적용할 인가 규칙을 선택할 수 있습니다.
- 체인 미일치와 앞 규칙에 가려진 관리 경로 및 permitAll 이후 남는 보안 조건을 찾을 수 있습니다.

## 먼저 확인할 개념

[Spring MVC 요청 흐름](#/learn/spring/mvc-flow) · [인증과 인가](#/learn/spring/security-authentication-authorization) · [요청 매핑과 입력](#/learn/spring/request-mapping)

## MVC 앞의 보안 필터

Servlet 필터는 다음 단계로 요청을 넘기기 전후에 작업합니다.
Spring Security는 인증과 인가 및 CSRF 등의 보안 필터를 사용합니다.
`DelegatingFilterProxy`가 Servlet 컨테이너와 Spring Bean을 연결하고 `FilterChainProxy`가 요청에 적용할 `SecurityFilterChain`을 선택합니다.

```text
요청 → Servlet 필터 연결 → 선택한 SecurityFilterChain의 필터들
     → DispatcherServlet → 컨트롤러 → 응답
```

필터가 요청을 거부하면 컨트롤러에 도달하지 않을 수 있습니다.
컨트롤러에 기록이 없으면 매핑뿐 아니라 앞의 필터에서 멈췄는지도 확인합니다.
MVC의 ExceptionHandler만으로 MVC 밖의 모든 보안 실패를 처리하지는 않습니다.

## 체인의 선택 범위

다음 두 체인은 표의 순서로 검사한다고 가정합니다.

| 순서 | securityMatcher의 범위 | 대상 |
| --- | --- | --- |
| 1 | `/api/**` | API 요청 |
| 2 | 모든 요청 | 앞 체인과 맞지 않은 나머지 |

`GET /api/notices`는 처음 맞는 1번 체인만 사용합니다.
두 체인의 규칙을 합치지 않습니다.
`GET /help`는 2번 체인으로 갑니다.
어느 체인에도 맞지 않는 요청은 Spring Security의 보호를 받지 못할 수 있으므로 전체 보호 범위를 확인합니다.
체인 범위는 `securityMatcher`이고 체인 안의 인가 조건은 `requestMatchers`입니다.

---

## 체인 안의 요청 인가 규칙

다음은 준비된 `HttpSecurity http`의 설정 조각입니다.
컨텍스트 경로와 Servlet 경로의 추가 접두사는 없다고 가정합니다.
`HttpMethod`는 `org.springframework.http.HttpMethod`입니다.

```java
http.authorizeHttpRequests(authorize -> authorize
    .requestMatchers(HttpMethod.GET, "/notices/**").permitAll()
    .requestMatchers(HttpMethod.POST, "/notices/**")
        .hasAuthority("notices.write")
    .anyRequest().denyAll()
);
```

GET 읽기는 인가상 공개이고 POST 쓰기에는 `notices.write`가 필요합니다.
DELETE는 두 규칙에 맞지 않아 마지막 규칙에서 거부됩니다.
요청 인가 규칙은 선언 순서에서 처음 일치한 하나를 적용합니다.
더 구체적인 경로라도 뒤에 있으면 앞 규칙에 가려질 수 있습니다.
`permitAll()`은 이 인가 규칙에서 인증을 요구하지 않는다는 뜻입니다.
컨트롤러를 만들거나 보안 필터 전체를 없애는 기능이 아니므로 필요한 CSRF 검사도 남습니다.
`authenticated()`도 모든 업무 권한을 부여하지 않습니다.

다음은 규칙 순서를 관찰하는 반례입니다.

```java
http.authorizeHttpRequests(authorize -> authorize
    .requestMatchers("/notices/**").authenticated()
    .requestMatchers("/notices/admin/**").hasAuthority("notices.manage")
    .anyRequest().denyAll()
);
```

관리 경로도 첫 규칙에 맞으므로 뒤의 관리 권한 검사가 적용되지 않습니다.
더 구체적인 경로가 자동으로 우선하지 않으며 의도한 관리 규칙을 앞에 둬야 합니다.

## 체인과 규칙의 연속 관찰

`처음 맞는 체인 선택 → 그 체인의 보안 검사 → 처음 맞는 인가 규칙 → 허용 또는 거부`를 따라갑니다.
필터의 실제 순서는 구성에 따라 정해지므로 CSRF가 인가 이후에만 검사된다고 가정하지 않습니다.
직접 해볼 일은 한 요청의 체인 번호와 인가 규칙을 따로 적고 관리 경로 반례의 두 규칙을 바꾸는 것입니다.
인가상 허용된 POST에도 별도로 필요한 조건을 설명합니다.

## 정리

- 처음 일치한 SecurityFilterChain 하나를 선택합니다.
- 체인 안의 인가 규칙도 선언 순서에서 처음 맞는 규칙을 적용합니다.
- permitAll은 필터 전체나 CSRF 검사를 없애지 않으며 체인에서 빠진 요청도 확인해야 합니다.

## 이어서 연습하기

[폼 로그인과 비밀번호 검증](#/learn/spring/security-form-login)에서 인증 정보를 준비하는 흐름을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Servlet 보안 필터 구조](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [복수 체인과 선택 범위](https://docs.spring.io/spring-security/reference/servlet/configuration/java.html)
- [HTTP 요청 인가](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 보안 요청을 실행한 결과는 아닙니다.

## 핵심 질문 답

FilterChainProxy는 처음 일치한 SecurityFilterChain 하나를 선택하며 거부된 요청은 MVC에 도달하지 않을 수 있습니다.
선택된 체인의 요청 인가는 메서드와 경로를 비교해 선언 순서에서 처음 맞는 규칙을 적용합니다.
체인 범위와 인가 규칙을 따로 읽고 어떤 체인에도 맞지 않는 요청이 없는지 확인합니다.
구체적인 경로를 뒤에 두면 앞 규칙에 가려질 수 있으며 permitAll도 CSRF 등 다른 보안 검사를 없애지는 않습니다.
