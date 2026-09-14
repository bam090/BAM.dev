# OAuth 2.0과 OIDC의 역할

## 학습 목표

외부 로그인 Client, Resource Server와 토큰별 사용 목적을 구분할 수 있습니다.

## 한줄 요약

OAuth 2.0은 API 접근 권한을 위임하고, OIDC는 그 위에 사용자 인증 정보를 주고받는 규칙을 더합니다.

## 먼저 확인할 개념

[인증과 인가를 나누어 보기](#/learn/spring/security-authentication-authorization) · [세션 기반 로그인과 로그아웃](#/learn/spring/security-session-logout)

## 누가 토큰을 받고 어디에 쓰는가

**OAuth 2.0**은 사용자의 자원에 접근할 권한을 다른 애플리케이션에 위임하는 틀이다. **OIDC(OpenID Connect)**는 OAuth 2.0 위에 사용자 인증 정보를 전달하는 규칙을 더한다. OAuth 2.0 자체를 언제나 같은 방식의 로그인 규약이라고 생각하지 않는다.

| 역할 | 작은 공지 서비스 예시 |
| --- | --- |
| Client | 외부 로그인을 이용하거나 토큰으로 API를 호출하는 웹앱 |
| Authorization Server | 권한 부여를 처리하고 토큰을 발급하는 서버 |
| Resource Server | 받은 접근 토큰을 검증해 보호된 공지 API를 제공하는 서버 |

하나의 앱이 여러 역할을 맡을 수는 있지만 역할이 같아지는 것은 아니다. `oauth2Login(...)`은 앱이 OAuth 2.0 또는 OIDC 로그인을 이용하도록 하는 Client 기능이다. 이것만으로 앱이 토큰 발급 서버가 되는 것은 아니다. Client 등록과 제공자 설정도 필요하다.

## ID 토큰과 접근 토큰은 받는 쪽이 다르다

OIDC의 **ID token**은 Client가 사용자 인증 결과를 확인하는 데 쓰는 토큰이다. **access token**은 보호된 API에 접근할 때 쓰는 토큰이다. 로그인 후 두 토큰을 함께 받았다고 아무 토큰이나 API에 보내지 않는다.

```text
Client → 외부 제공자의 로그인·동의 흐름
→ Client가 인증 결과 확인
→ API 접근에는 해당 API용 access token 사용
→ Resource Server가 검증하고 권한 판단
```

OIDC에서는 `openid` scope가 사용된다. 로그인한 사용자를 알게 되어도 우리 서비스의 관리자 권한까지 자동으로 생기는 것은 아니다. 앱 내부 사용자·권한 정책과 토큰이 허용한 API 범위를 따로 보아야 한다.

## 이번에 배울 경계를 정한다

외부 제공자의 Client 등록과 비밀값, 토큰 발급 서버 구현은 이 읽기 예제에 넣지 않는다. 역할을 구별한 다음 교안에서는 JWT 접근 토큰을 받는 API가 무엇을 검증하는지 본다.

직접 해볼 일: “외부 로그인 결과를 받는 웹앱”과 “Authorization: Bearer 요청을 받는 API” 옆에 각각 맡은 역할을 적는다. ID token을 API로 그대로 보내려는 설계에서 확인해야 할 토큰 목적도 한 문장으로 적는다.

## 이어서 연습하기

[JWT를 받는 API의 검증](#/learn/spring/security-jwt-resource-server)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [OAuth 2.0 역할과 구성](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [OAuth 2.0 로그인 구성](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

외부 로그인을 이용하는 앱은 Client, 접근 토큰을 받아 API를 보호하는 쪽은 Resource Server로 역할이 다릅니다. OAuth 2.0은 API 접근 권한을 위임하는 틀이며 OIDC는 사용자 인증 정보를 전달하는 규칙을 더합니다. ID token은 Client의 인증 결과 확인에, access token은 API 접근에 사용하므로 목적을 바꾸어 쓰지 않아야 합니다.
