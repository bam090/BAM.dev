# 요청 인가: 경로·HTTP 메서드별 접근 규칙

## 학습 목표

HTTP 메서드·경로·선언 순서로 적용할 인가 규칙을 선택할 수 있습니다.

## 한줄 요약

요청의 메서드와 경로를 읽고, 선언된 순서에서 처음 맞는 인가 규칙을 적용합니다.

## 먼저 확인할 개념

[경로와 HTTP 메서드 매핑](#/learn/spring/request-mapping) · [SecurityFilterChain과 보안 필터 흐름](#/learn/spring/security-filter-chain)

## 요청마다 필요한 권한을 정한다

**요청 인가 규칙**은 HTTP 요청의 조건과 허용 기준을 연결한다. 아래는 이미 준비된 `HttpSecurity http`에 인가 규칙을 추가하는 읽기 예제다. Servlet Security의 Lambda DSL이며, 컨텍스트 경로와 Servlet 경로에 추가 접두사는 없다고 본다.

```java
http.authorizeHttpRequests(authorize -> authorize
    .requestMatchers(HttpMethod.GET, "/notices/**").permitAll()
    .requestMatchers(HttpMethod.POST, "/notices/**")
        .hasAuthority("notices.write")
    .anyRequest().denyAll()
);
```

`HttpMethod`는 `org.springframework.http.HttpMethod`다. `GET /notices/7`은 인가상 공개이고, `POST /notices/7`에는 `notices.write`가 필요하다. 두 규칙에 맞지 않는 요청은 마지막 규칙에서 거부된다. 이는 **인가 판단**이며 POST의 CSRF 검사 같은 다른 보안 조건도 따로 충족해야 한다.

## 더 구체적인 경로가 자동으로 우선하지 않는다

규칙은 선언 순서대로 확인하고 처음 일치한 하나를 적용한다. 다음과 같은 순서는 의도와 다를 수 있다.

```java
http.authorizeHttpRequests(authorize -> authorize
    .requestMatchers("/notices/**").authenticated()
    .requestMatchers("/notices/admin/**").hasAuthority("notices.manage")
    .anyRequest().denyAll()
);
```

`GET /notices/admin/7`도 첫 규칙에 맞는다. 뒤쪽 경로가 더 구체적이어도 관리 권한 검사를 자동으로 우선하지 않는다. 관리 경로를 먼저 검사하도록 순서를 정하고, 허용 목록에 없는 요청의 기준까지 적어야 의도가 드러난다.

## 같은 URL에서도 행동을 나누어 본다

`permitAll()`은 그 인가 규칙에서 인증을 요구하지 않는다는 뜻이다. 컨트롤러를 새로 만들거나 요청 형식을 바꾸지 않고, 보안 필터 전체를 없애지도 않는다. `authenticated()`도 로그인한 사용자에게 모든 업무 권한을 부여하는 명령은 아니다.

직접 해볼 일: 첫 예제에 `GET /notices/7`, `POST /notices/7`, `DELETE /notices/7`을 대입하고 “처음 맞은 규칙 / 필요한 권한”을 적는다. 이어서 두 번째 예제에서 관리 규칙이 먼저 평가되도록 두 줄의 위치를 바꿔 본다.

## 이어서 연습하기

[로그인 폼이 인증으로 이어지는 과정](#/learn/spring/security-form-login)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [HTTP 요청 인가](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

요청 인가는 HTTP 메서드와 경로를 조건에 맞춘 뒤 선언 순서에서 처음 일치한 규칙을 적용합니다. 더 구체적인 경로가 뒤에 있어도 자동으로 우선하지 않습니다. 공개 읽기와 쓰기 권한을 나누고 나머지 요청의 기준을 명시해야 하며, 인가상 허용되어도 CSRF 같은 다른 검사는 별도로 적용됩니다.
