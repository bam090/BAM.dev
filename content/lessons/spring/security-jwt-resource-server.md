# JWT를 받는 API의 검증

## 학습 목표

JWT의 서명·발급자·시간·대상 검증과 scope 기반 인가를 구분할 수 있습니다.

## 한줄 요약

JWT 내용을 읽는 것과 신뢰하는 것은 다르며, 검증 후에도 요청에 필요한 권한을 확인합니다.

## 먼저 확인할 개념

[OAuth 2.0과 OIDC의 역할](#/learn/spring/security-oauth2-oidc) · [요청 인가: 경로·HTTP 메서드별 접근 규칙](#/learn/spring/security-request-rules)

## 읽을 수 있는 내용이 곧 증거는 아니다

**JWT(JSON Web Token)**는 claim이라는 항목으로 정보를 담는 토큰 형식이다. 일반적인 서명 JWT의 payload는 내용을 읽을 수 있지만, 읽혔다는 사실만으로 발급자를 믿거나 권한을 허용할 수는 없다. 서명은 무결성 확인에 사용하며 본문을 비밀로 만드는 암호화와 다르다.

Spring Security의 JWT Resource Server는 `Authorization: Bearer <접근 토큰>` 요청을 처리하고 `JwtDecoder`를 통해 토큰을 검증한다. Boot의 기본 Resource Server 구성을 사용하는 읽기 예제에서 다음 값의 역할을 나누어 보자.

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://id.example
spring.security.oauth2.resourceserver.jwt.audiences=notice-api
```

주소와 이름은 가상 표기다. 실제 제공자 등록·키 통신을 수행한 예제가 아니다.

| 확인 항목 | 확인하는 질문 |
| --- | --- |
| 서명과 신뢰하는 키·알고리즘 | 허용한 발급자의 검증 방식으로 진위를 확인했는가? |
| `iss` | 설정한 발급자가 보낸 토큰인가? |
| `exp`, `nbf` | 현재 사용할 수 있는 시간 범위인가? |
| `aud` | 이 API를 대상으로 발급된 토큰인가? |

기본 issuer 기반 구성은 서명·발급자·시간을 확인한다. 위 `audiences`는 기대 대상을 지정해 `aud`도 검증하도록 하는 설정이다. 발급자가 같아도 다른 API를 위한 토큰을 받아들이면 안 된다. 사용자 정의 decoder를 쓰면 어떤 검증을 구성했는지도 직접 확인해야 한다.

## 유효한 토큰 뒤에 권한 판단이 남는다

기본 scope 변환은 `notices.read`를 `SCOPE_notices.read` authority로 연결한다.

```text
서명·claim 검증 → 인증 정보 구성
→ scope를 authority로 변환 → 요청의 권한 조건과 비교
```

읽기 scope만 있는 유효 토큰으로 쓰기 API를 호출했다면 토큰이 유효하다는 사실과 별개로 인가를 거부할 수 있다. 만료 검사와 로그아웃에 따른 즉시 폐기도 같은 기능이 아니다. JWT 형식만 선택하면 모든 보안 문제가 해결된다고 생각하지 않는다.

직접 해볼 일: 서명·발급자·시간은 맞지만 `aud`가 `other-api`인 토큰을 위 설정과 비교한다. 이어서 검증을 통과한 토큰에 읽기 scope만 있을 때 쓰기 요청에 부족한 조건을 적는다.

## 이어서 연습하기

[보안 테스트가 확인하는 경로](#/learn/spring/security-tests)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [JWT Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [RFC 7519 JWT](https://www.rfc-editor.org/rfc/rfc7519.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

JWT는 내용을 읽는 것만으로 신뢰할 수 없으며 서명과 발급자, 유효 시간, 기대 대상을 올바른 설정으로 검증해야 합니다. issuer-uri와 audiences는 발급자와 API 대상 확인에 서로 다른 역할을 합니다. 검증 후에도 scope에서 얻은 authority를 요청 권한과 비교하므로 유효한 읽기 토큰이 모든 쓰기 작업을 허용하지는 않습니다.
