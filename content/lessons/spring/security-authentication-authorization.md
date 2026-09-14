# 인증과 인가를 나누어 보기

## 학습 목표

인증 결과와 기능별 권한 판단을 구분할 수 있습니다.

## 한줄 요약

인증은 누구인지 확인하고, 인가는 그 사용자가 해당 행동을 할 수 있는지 판단합니다.

## 먼저 확인할 개념

[Spring MVC와 DispatcherServlet의 요청 처리](#/learn/spring/mvc-flow)

## 사용자를 확인한 뒤 행동을 확인한다

**인증(Authentication)**은 요청자가 누구인지 확인하는 일이다. **인가(Authorization)**는 그 요청자에게 지금 하려는 행동을 허용할지 판단하는 일이다. 로그인에 성공했다는 사실과 공지를 수정할 수 있다는 사실은 다르다.

공지 앱에 로그인한 사용자가 있다고 하자. 이 사용자에게는 공지 읽기 권한인 `notices.read`만 주어졌고, 수정에는 `notices.write`가 필요하다.

```text
로그인 성공 → 확인된 사용자와 권한을 보관
공지 수정 요청 → notices.write가 있는지 판단 → 없으면 거부
```

여기서 로그인은 성공했지만 수정은 허용되지 않는다. 반대로 공개 공지에는 로그인 없이 읽도록 정한 인가 규칙을 둘 수 있다.

## 인증 결과에서 무엇을 읽는가

`Authentication`은 인증 요청 또는 인증 결과를 표현한다. 인증이 끝난 상태를 볼 때는 사용자 정보인 `principal`과 부여된 권한인 `authorities`를 구분해서 읽는다. `SecurityContext`가 이 인증 정보를 담고, `SecurityContextHolder`가 현재 처리 흐름에서 그 컨텍스트에 접근하도록 돕는다.

권한 문자열은 서버가 부여한 값이다. 브라우저가 본문에 `"role":"ADMIN"`을 써 보냈다는 이유로 관리자 권한으로 받아들이지 않는다. `hasAuthority("notices.write")`는 해당 권한 문자열을 검사하고, 기본 `hasRole("ADMIN")`는 `ROLE_ADMIN` 권한을 검사한다. 두 표기법의 접두사를 섞지 않는다.

## 거부 이유부터 관찰하기

미인증 사용자가 보호된 자원을 요청하면 인증을 시작하도록 안내할 수 있다. 이미 인증됐지만 필요한 권한이 없으면 접근을 거부한다. 폼 로그인은 로그인 페이지로 이동시킬 수 있고 API용 구성은 401 응답을 보낼 수 있으므로, **미인증이면 언제나 같은 HTTP 응답**이라고 외우지 않는다.

직접 해볼 일: “로그인하지 않은 방문자”와 “로그인했지만 수정 권한이 없는 사용자”가 공지 수정을 요청할 때 부족한 조건을 한 문장씩 적는다. 이 묶음은 사용자 확인과 접근 판단을 배우는 정적 자료이며, 다중 인증 설정은 다루지 않는다.

## 이어서 연습하기

[SecurityFilterChain과 보안 필터 흐름](#/learn/spring/security-filter-chain)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Servlet 인증 구조](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [HTTP 요청 인가](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

인증은 요청자가 누구인지 확인하고, 인가는 그 요청자에게 현재 행동을 허용할지 판단합니다. 로그인에 성공해도 수정 권한이 없으면 수정 요청은 거부될 수 있습니다. 인증 결과의 사용자 정보와 권한을 나누어 읽고, 미인증 안내와 권한 부족 응답은 실제 설정에 맞춰 설명해야 합니다.
