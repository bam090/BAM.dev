# 로그인 폼이 인증으로 이어지는 과정

## 학습 목표

기본 폼의 요청 형식과 사용자 조회·비밀번호 대조 역할을 구분할 수 있습니다.

## 한줄 요약

로그인 화면은 입력을 받고, 인증 필터와 인증 제공자는 전달된 자격 증명을 확인합니다.

## 먼저 확인할 개념

[@RequestBody로 JSON 요청 본문 받기](#/learn/spring/request-body) · [인증과 인가를 나누어 보기](#/learn/spring/security-authentication-authorization)

## 화면과 로그인 처리는 다른 단계다

**폼 로그인(Form Login)**은 브라우저가 사용자 이름과 비밀번호를 폼으로 제출하는 인증 흐름이다. 기본 `formLogin` 구성에서 `GET /login`은 로그인 화면을 보여 주고, `POST /login`은 제출한 자격 증명을 처리한다. 화면을 봤다는 사실만으로 로그인한 것은 아니다.

아래는 기본 로그인 필터가 받는 폼 요청의 모양을 줄여 적은 것이다. 값은 가상 표기이며 유효한 CSRF 토큰이 함께 제출된 상황이다.

```text
POST /login
Content-Type: application/x-www-form-urlencoded

username=learner&password=<입력값>&_csrf=<서버가 제공한 토큰>
```

기본 파라미터 이름은 `username`, `password`다. 같은 글자를 JSON 본문에 넣어 보낸 요청은 이 폼 요청과 다르다. 기본 `UsernamePasswordAuthenticationFilter`가 MVC의 `@RequestBody`처럼 JSON을 자동으로 객체로 읽는다고 생각하지 않는다.

## 사용자 조회 뒤 비밀번호를 대조한다

```text
폼 파라미터 → 인증 필터 → AuthenticationManager
→ DaoAuthenticationProvider
→ UserDetailsService로 사용자 정보 조회
→ PasswordEncoder로 입력 비밀번호와 저장값 대조
→ 인증 성공 또는 실패
```

`UserDetailsService`는 사용자 이름에 해당하는 인증용 정보를 찾는다. 이름, 저장된 비밀번호 값, 권한 등을 담은 `UserDetails`를 제공하며 비밀번호 대조 자체를 대신하지 않는다. `DaoAuthenticationProvider`는 이 정보와 `PasswordEncoder`를 사용한다. 사용자가 조회되어도 비밀번호가 틀리거나 계정 상태 조건이 맞지 않으면 인증에 실패할 수 있다.

이 조회 역할은 특정 데이터 저장 방식에 묶이지 않는다. 여기서는 DB나 회원가입 구현 없이 역할만 읽는다.

## 기본값과 직접 바꾼 값을 구별한다

별도 로그인 화면을 지정하면 그 화면을 만드는 책임도 애플리케이션에 있다. 화면 URL, 처리 URL, 파라미터 이름을 바꿨다면 실제 설정으로 추적해야 한다. 기본 폼 요청을 JSON 로그인 구현으로 그대로 옮길 수는 없다.

직접 해볼 일: “로그인 화면 만들기 / 사용자 찾기 / 입력 비밀번호 대조하기”를 위 흐름의 담당에 연결한다. JSON 본문을 보내고 로그인 실패가 났을 때 먼저 요청의 `Content-Type`과 입력이 놓인 위치를 비교해 본다.

## 이어서 연습하기

[PasswordEncoder: 비밀번호 해시 생성과 대조](#/learn/spring/security-password-storage)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [폼 로그인](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html)
- [DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html)
- [UserDetailsService](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

로그인 화면은 사용자 입력을 받는 단계이고 POST 처리에서는 인증 필터가 자격 증명을 읽어 인증을 요청합니다. 기본 폼 로그인은 username과 password 폼 파라미터를 사용하며 JSON 본문을 자동으로 읽지 않습니다. DaoAuthenticationProvider는 UserDetailsService로 사용자 정보를 조회하고 PasswordEncoder로 비밀번호를 대조하므로, 사용자 조회 성공만으로 인증이 끝나지 않습니다.
