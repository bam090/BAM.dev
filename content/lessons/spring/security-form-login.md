# 폼 로그인과 비밀번호 검증

## 학습 목표

- 기본 로그인 화면과 POST 폼의 요청 형식을 구분할 수 있습니다.
- UserDetailsService의 조회와 DaoAuthenticationProvider의 비밀번호 대조 역할을 설명할 수 있습니다.
- salt 때문에 달라지는 저장 문자열을 equals 대신 PasswordEncoder.matches로 대조할 수 있습니다.
- 단방향 비밀번호 저장과 알고리즘 식별자 보존 및 코드·로그 노출 경계를 설명할 수 있습니다.

## 먼저 확인할 개념

[JSON 요청 본문과 검증](#/learn/spring/request-body) · [인증과 인가](#/learn/spring/security-authentication-authorization)

## 기본 폼의 요청 형식

기본 formLogin에서 GET `/login`은 화면을 보여 주고 POST `/login`은 제출한 자격 증명을 처리합니다.
화면을 열었다는 사실만으로 인증이 완료되지는 않습니다.
다음은 가상 입력과 유효 CSRF 토큰을 함께 제출한 요청의 모양입니다.

```text
POST /login
Content-Type: application/x-www-form-urlencoded

username=learner&password=<입력값>&_csrf=<서버가 제공한 토큰>
```

기본 파라미터는 `username`과 `password`입니다.
같은 이름을 JSON 본문에 넣어도 폼 파라미터 요청과는 다릅니다.
기본 `UsernamePasswordAuthenticationFilter`가 MVC의 RequestBody처럼 JSON을 자동 변환하지는 않습니다.
직접 바꾼 화면과 처리 URL 및 파라미터 이름이 있다면 실제 설정으로 추적합니다.
별도 로그인 화면을 지정하면 그 화면은 애플리케이션이 준비합니다.

---

## 사용자 조회와 인증 제공자의 대조

```text
폼 파라미터 → 인증 필터 → AuthenticationManager
→ DaoAuthenticationProvider → UserDetailsService로 정보 조회
→ PasswordEncoder로 비밀번호 대조 → 인증 성공 또는 실패
```

UserDetailsService는 사용자 이름에 해당하는 인증용 정보를 조회합니다.
UserDetails에는 사용자명과 저장된 비밀번호 값 및 권한 등이 들어갑니다.
조회가 비밀번호 대조 자체를 대신하지 않으며 조회 구현이 반드시 DB나 JPA일 필요도 없습니다.
DaoAuthenticationProvider는 이 정보와 PasswordEncoder를 사용합니다.
조회에 성공해도 비밀번호가 틀리거나 계정 상태가 조건을 만족하지 않으면 인증에 실패할 수 있습니다.

---

## 비밀번호의 저장과 matches

PasswordEncoder는 저장을 위한 단방향 변환과 입력 대조를 맡습니다.
저장값을 원문으로 복호화해 로그인하는 방식이 아닙니다.
비밀번호 추측 비용을 높이는 적응형 해시를 사용합니다.
다음은 메서드 안에서 가상 입력 `submittedPassword`를 받은 읽기 예제입니다.

```java
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

PasswordEncoder encoder =
    PasswordEncoderFactories.createDelegatingPasswordEncoder();
String stored = encoder.encode(submittedPassword);
boolean matches = encoder.matches(submittedPassword, stored);
```

처음 저장할 때는 encode를 사용하고 로그인에서는 `matches(입력 원문, 기존 저장값)`으로 대조합니다.
**salt**는 같은 비밀번호도 같은 저장 문자열이 되지 않도록 해시에 함께 사용하는 값입니다.
salt를 새로 만드는 인코더는 같은 입력에도 다른 문자열을 만들 수 있으므로 다시 encode한 결과를 equals로 비교하지 않습니다.
DelegatingPasswordEncoder는 저장값의 `{id}`로 사용할 인코더를 구별합니다.
그 식별자를 임의로 잘라 내면 대조에 필요한 정보를 잃을 수 있습니다.

원문이나 복호화 가능한 비밀번호 및 빠른 일반 해시만으로 만든 값을 로그인 저장의 기본으로 삼지 않습니다.
실제 비밀번호와 저장값을 코드나 로그에 그대로 남기지 않습니다.
인코딩 비용은 환경에 맞춰 검토하며 전송 보호와 접근 권한도 별도로 준비합니다.

## 조회 이후 인증의 관찰

`사용자 조회 → 저장값 확보 → matches 대조 → 계정 상태와 인증 결과`를 따라갑니다.
직접 해볼 일은 같은 입력의 인코딩 문자열 A와 B가 다를 때 A에 대한 로그인 대조를 한 줄로 적는 것입니다.
입력과 저장값의 인수 위치를 표시하고 사용자 조회 성공만으로 인증 성공이 아닌 이유를 설명합니다.

## 정리

- 기본 로그인 필터는 username과 password 폼 파라미터를 읽습니다.
- 사용자 정보 조회 이후 Provider가 PasswordEncoder로 비밀번호를 대조합니다.
- 로그인 대조에는 matches를 쓰며 salt와 저장 형식을 보존하고 비밀번호 정보를 노출하지 않습니다.

## 이어서 연습하기

[세션 기반 로그인과 로그아웃](#/learn/spring/security-session-logout)에서 인증 상태가 다음 요청에 이어지는 경로를 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [폼 로그인](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html)
- [DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html)
- [비밀번호 저장과 PasswordEncoder](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
로그인과 인코딩 코드를 실행한 결과는 아닙니다.

## 핵심 질문 답

기본 로그인 필터는 username과 password 폼 파라미터를 읽으며 JSON 본문을 자동으로 읽지 않습니다.
UserDetailsService는 사용자 정보를 조회하고 DaoAuthenticationProvider가 PasswordEncoder로 비밀번호를 대조합니다.
로그인 입력은 기존 저장값과 matches로 비교해야 하며 salt 때문에 달라지는 encode 결과끼리 equals로 비교하지 않습니다.
조회 성공만으로 인증이 완료되지 않으며 비밀번호 원문이나 저장값을 로그에 노출하지 않습니다.
