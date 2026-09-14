# PasswordEncoder: 비밀번호 해시 생성과 대조

## 학습 목표

비밀번호 저장값의 단순 문자열 비교와 PasswordEncoder의 대조를 구분할 수 있습니다.

## 한줄 요약

비밀번호는 복구할 원문 대신 단방향 저장값으로 보관하고, matches로 입력과 대조합니다.

## 먼저 확인할 개념

[로그인 폼이 인증으로 이어지는 과정](#/learn/spring/security-form-login)

## 복호화 대신 일치 여부를 확인한다

**PasswordEncoder**는 비밀번호를 저장하기 위한 단방향 변환과 입력 대조를 맡는다. 단방향이라는 말은 저장값을 원문으로 복호화해서 로그인한다는 뜻이 아니라는 의미다. 비밀번호 저장에는 추측을 반복하는 비용을 높이는 적응형 해시를 사용한다.

다음은 이미 메서드 안에서 `submittedPassword`라는 가상 입력 문자열을 받은 상황의 읽기 예제다. 실제 비밀번호나 저장값을 코드·로그에 적는 예제가 아니다.

```java
PasswordEncoder encoder =
    PasswordEncoderFactories.createDelegatingPasswordEncoder();
String stored = encoder.encode(submittedPassword);
boolean matches = encoder.matches(submittedPassword, stored);
```

타입은 `org.springframework.security.crypto.password.PasswordEncoder`, 팩토리는 `org.springframework.security.crypto.factory.PasswordEncoderFactories`다. 처음 저장할 때는 `encode`, 나중에 로그인 입력을 확인할 때는 `matches(입력 원문, 저장값)`을 사용한다. 저장값에는 알고리즘 식별자와 salt 등 대조에 필요한 정보가 포함될 수 있다.

## 같은 입력인데 저장 문자열이 달라도 되는 이유

**salt**는 같은 비밀번호가 항상 같은 저장값이 되는 것을 막기 위해 해시에 함께 사용하는 값이다. salt를 새로 만드는 인코더는 같은 입력도 매번 다른 문자열을 만들 수 있다. 따라서 다시 `encode`한 결과를 기존 문자열과 `equals`로 비교하는 방식은 로그인 대조에 맞지 않는다.

```text
최초 입력 → encode → 저장값 보관
로그인 입력 + 기존 저장값 → matches → 일치 여부
```

`DelegatingPasswordEncoder`는 `{id}` 형식의 식별자를 보고 저장 형식에 맞는 인코더로 대조할 수 있게 한다. 저장 문자열 앞부분을 임의로 잘라 내면 그 선택에 필요한 정보를 잃을 수 있다.

## 보관할 값과 남기지 않을 값을 정한다

원문, 복호화 가능한 비밀번호, 빠른 일반 해시만으로 만든 값을 로그인용 저장 설계의 기본으로 삼지 않는다. 인코딩 비용은 대상 환경에서 검토해야 하며 팩토리 호출 하나가 모든 운영 보안을 완성하지는 않는다. 전송 보호와 접근 권한도 별도 책임이다.

직접 해볼 일: 같은 입력으로 만든 저장값 A와 B가 다르다고 가정하고, A에 대한 로그인 일치 여부를 확인할 한 줄을 `matches`로 적는다. 어느 인수가 사용자의 입력이고 어느 인수가 저장값인지 표시한다.

## 이어서 연습하기

[세션 기반 로그인과 로그아웃](#/learn/spring/security-session-logout)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [비밀번호 저장](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [PasswordEncoder API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/crypto/password/PasswordEncoder.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

같은 입력의 인코딩 문자열이 달라도 그것만으로 로그인 실패라고 판단하지 않습니다. 비밀번호는 단방향 저장값으로 보관하고 PasswordEncoder.matches로 로그인 입력과 대조합니다. salt 때문에 encode 결과가 달라질 수 있으므로 결과끼리 equals로 비교하지 않습니다. 입력 원문과 기존 저장값의 순서를 지키고 저장 형식에 필요한 정보를 보존해야 합니다.
