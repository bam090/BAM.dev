# SecurityFilterChain과 보안 필터 흐름

## 학습 목표

요청에 적용되는 보안 체인과 컨트롤러 전에 멈추는 지점을 설명할 수 있습니다.

## 한줄 요약

보안 필터는 MVC 앞에서 요청을 검사하며, 처음 일치한 SecurityFilterChain의 필터들을 적용합니다.

## 먼저 확인할 개념

[Spring MVC와 DispatcherServlet의 요청 처리](#/learn/spring/mvc-flow) · [인증과 인가를 나누어 보기](#/learn/spring/security-authentication-authorization)

## 요청이 MVC에 도착하기 전

Servlet **필터(Filter)**는 요청을 다음 처리 단계로 넘기기 전후에 작업하는 구성요소다. Spring Security는 여러 보안 필터로 인증, 인가, CSRF 같은 검사를 수행한다. `SecurityFilterChain`은 한 요청에 적용할 보안 필터 묶음이다.

```text
요청 → Servlet 필터 연결 → Spring Security의 필터들
     → DispatcherServlet → 컨트롤러 → 응답
```

보안 필터가 요청을 거부하면 컨트롤러에 도달하지 않을 수 있다. 컨트롤러 관찰 지점에 아무 기록이 없다고 URL 매핑부터 틀렸다고 단정하지 말고, 어느 필터에서 요청이 끝났는지 본다. MVC의 `@ExceptionHandler`만으로 MVC 밖의 모든 보안 실패를 처리하는 것도 아니다.

## 체인 선택과 체인 안의 필터를 구분한다

Servlet 컨테이너와 Spring Bean을 연결하는 `DelegatingFilterProxy` 뒤에서, `FilterChainProxy`가 요청에 맞는 `SecurityFilterChain`을 선택한다. 다음은 두 체인의 선택 조건을 줄여 적은 표다.

| 검사 순서 | 체인 선택 조건 | 이 체인이 맡는 요청 |
| --- | --- | --- |
| 1 | `/api/**` | API 경로 |
| 2 | 모든 요청 | 앞 체인과 맞지 않은 나머지 |

`GET /api/notices`는 1번에서 처음 일치하므로 1번 체인만 적용된다. 2번도 경로에 맞는다고 두 체인의 규칙을 합치지 않는다. 선택한 체인 **안에서는** 구성된 보안 필터들이 필요한 순서로 이어진다.

체인 선택 범위는 `securityMatcher`, 선택된 체인 안의 인가 조건은 `authorizeHttpRequests`의 `requestMatchers`로 표현한다. 범위를 좁힌 체인만 두고 나머지 요청과 맞는 체인을 빠뜨리면 그 나머지는 Spring Security의 보호를 받지 못할 수 있다.

직접 해볼 일: 표에 `GET /help`를 넣어 어느 체인을 선택하는지 적는다. 다음에는 그 체인 안에서 인증·인가 판단 뒤 컨트롤러로 넘어갈 수 있는지 따로 표시한다. 이 입문에서는 직접 필터를 구현하기보다 적용 범위와 순서를 읽는다.

## 이어서 연습하기

[요청 인가: 경로·HTTP 메서드별 접근 규칙](#/learn/spring/security-request-rules)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Servlet 보안 필터 구조](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Java 설정과 복수 체인](https://docs.spring.io/spring-security/reference/servlet/configuration/java.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

보안 필터는 DispatcherServlet과 컨트롤러보다 앞에서 요청을 검사하므로, 거부된 요청은 컨트롤러에 도달하지 않을 수 있습니다. FilterChainProxy는 처음 일치한 SecurityFilterChain 하나를 선택하고 그 안의 필터들을 적용합니다. 체인 선택 범위와 체인 내부 인가 규칙을 구분하고, 보호 범위에서 빠진 요청이 없는지 확인해야 합니다.
