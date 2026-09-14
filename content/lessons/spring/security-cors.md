# 다른 출처의 브라우저 요청과 CORS

## 학습 목표

CORS 사전 확인과 실제 요청의 인증·인가·CSRF 책임을 구분할 수 있습니다.

## 한줄 요약

CORS는 브라우저의 다른 출처 접근을 조정하며, 사용자 인증이나 업무 권한을 부여하지 않습니다.

## 먼저 확인할 개념

[쿠키 인증과 CSRF 방어](#/learn/spring/security-csrf) · [@RequestBody로 JSON 요청 본문 받기](#/learn/spring/request-body)

## 출처는 브라우저가 코드를 읽은 자리다

**출처(Origin)**는 URL의 스킴, 호스트, 포트 조합이다. `https://study.example`에서 실행된 브라우저 코드가 `https://api.example`로 요청하면 다른 출처에 접근한다. **CORS**는 서버가 허용할 출처·메서드·헤더 등을 알려 브라우저의 교차 출처 접근을 조정하는 규약이다.

일부 요청은 실제 요청 전에 **preflight(사전 확인)**를 보낸다. 다음은 브라우저가 POST와 JSON 요청 헤더를 사용할 수 있는지 확인하는 모양이다.

```text
OPTIONS /notices
Origin: https://study.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

preflight에는 세션 쿠키가 포함되지 않는다. 이를 일반 로그인 요청처럼 먼저 검사해 미인증으로 막으면 실제 요청까지 도달하지 못한다. Spring Security 앞에서 CORS 처리가 이루어지도록 통합하고, 허용할 출처·메서드·헤더를 설정한다. 준비된 CORS 설정과 `http.cors(...)` 등의 통합은 이 순서를 구성하는 수단이다.

## 사전 확인 통과 뒤에도 실제 요청을 검사한다

```text
출처·메서드·헤더 사전 확인 → 브라우저의 실제 요청
→ 그 요청의 인증·권한·필요한 CSRF 검사 → 업무 처리
```

CORS를 통과해도 `notices.write`가 생기지 않는다. 쿠키를 포함한 요청을 허용하려면 credentials 관련 설정까지 맞아야 하고, 허용 출처를 신중히 좁혀야 한다. 쿠키 인증을 쓰는 변경 요청에는 CSRF 문제도 남는다.

CORS는 브라우저가 적용하는 규칙이므로 브라우저 밖의 클라이언트에 대한 서버 접근 제어를 대신하지 않는다. CORS 오류가 없다는 사실을 로그인 성공이나 API 권한의 증거로 사용하지 않는다. 또한 모든 교차 출처 요청이 preflight를 보내는 것도 아니다.

직접 해볼 일: 위 사전 확인과 실제 `POST /notices`를 두 줄로 나누고, 각각 “출처 허용 / 사용자 확인 / 쓰기 권한 / CSRF” 중 어떤 판단을 관찰해야 하는지 적는다. preflight 실패를 해결하기 위해 실제 API의 모든 인가 규칙을 공개로 바꾸지는 않는다.

## 이어서 연습하기

[@PreAuthorize로 서비스 메서드 인가하기](#/learn/spring/security-method-authorization)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Security와 CORS 통합](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)
- [Spring MVC CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

CORS는 브라우저가 다른 출처의 응답에 접근할 수 있는 조건을 조정하며 사용자 인증이나 권한을 대신하지 않습니다. 쿠키가 없는 preflight가 인증에서 먼저 막히지 않도록 CORS를 적절한 순서로 처리해야 합니다. 사전 확인을 통과한 실제 요청에도 인증·인가와 필요한 CSRF 검사는 각각 적용됩니다.
