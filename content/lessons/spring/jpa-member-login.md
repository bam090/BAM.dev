# UserDetailsService: DB 회원 조회와 인증 연결

## 학습 목표

Repository 조회·UserDetailsService 변환·PasswordEncoder 검증의 경계를 설명할 수 있습니다.

## 한줄 요약

DB 회원 조회 결과를 UserDetails로 연결하고 비밀번호 검증은 Spring Security의 인증 흐름에 맡깁니다.

## 먼저 확인할 개념

[조회 메서드 이름과 JPQL](#/learn/spring/jpa-query-methods) · [트랜잭션 안에서 변경 감지하기](#/learn/spring/jpa-transactions) · [폼 로그인과 인증 정보 조회](#/learn/spring/security-form-login) · [비밀번호 저장과 검증](#/learn/spring/security-password-storage)

## 저장된 회원에서 인증용 정보로

앞선 JPA 교안은 저장·조회를, Security 교안은 인증·인가를 다뤘다. 이제 등록된 `DaoAuthenticationProvider`가 `UserDetailsService`와 `PasswordEncoder`를 사용하는 사용자명·비밀번호 인증 경로를 연결해 보자.

```text
입력된 사용자명
→ UserDetailsService가 MemberRepository로 저장 회원 조회
→ username·저장된 비밀번호 인코딩값·권한을 UserDetails로 구성
→ DaoAuthenticationProvider가 PasswordEncoder로 비밀번호 검증
→ 인증 결과를 Security 흐름으로 전달
```

JPA는 회원을 조회하는 한 가지 구현 방법이다. 메모리나 JDBC로 조회할 수도 있으므로 Spring Security 사용에 JPA가 필수인 것은 아니다.

## 조회와 변환만 담은 작은 예제

다음은 등록된 서비스의 메서드 부분이다. `members.findByUsername`은 `Optional<Member>`를 반환하고 username에는 고유성 계약이 있다. 읽기 트랜잭션과 해당 조회 구성이 준비되어 프록시를 거쳐 호출되며, getter는 `String` 값만 반환한다. `authority`는 저장된 한 권한 문자열이다.

```java
@Override
@Transactional(readOnly = true)
public UserDetails loadUserByUsername(String username) {
    Member member = members.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("회원 없음"));

    return User.withUsername(member.getUsername())
        .password(member.getEncodedPassword())
        .authorities(member.getAuthority())
        .build();
}
```

이 메서드는 Spring Security의 `UserDetailsService`를 구현한다. `User`, `UserDetails`, `UsernameNotFoundException`은 `org.springframework.security.core.userdetails`의 타입이고 `@Transactional`은 Spring의 어노테이션이다. `User`는 인증용 값 객체를 만드는 Security 타입으로, JPA의 Member 엔티티와 구분한다.

관찰할 것: 메서드는 입력 비밀번호를 인수로 받지 않는다. 저장 회원을 찾아 인증용 정보를 돌려주는 책임이다. 비밀번호 검증은 설정된 `DaoAuthenticationProvider`가 `PasswordEncoder.matches`를 통해 수행한다.

## 저장·인증·응답의 경계

`encodedPassword`에는 가입·변경 시 호환되는 PasswordEncoder로 인코딩해 저장한 값을 사용한다. 로그인 때마다 다시 인코딩한 문자열을 equals로 비교하거나 평문으로 바꾸지 않는다. 이 인증용 정보와 엔티티를 HTTP 응답이나 로그에 그대로 노출하지 않는다.

회원이 없으면 조회 실패를 인증 흐름으로 전달하며 자동 가입하지 않는다. 사용자에게 보이는 실패 메시지는 Security의 실패 처리에서 별도로 다룬다. 실제 회원 모델에 잠금·비활성·만료 상태가 있으면 그 상태도 UserDetails 계약으로 옮겨야 한다. 위 최소 예제는 그런 상태가 없는 모델만 가정한다.

직접 해볼 일: 흐름에서 Repository가 끝나는 곳과 비밀번호 검증이 시작하는 곳을 표시한다. DB 조회 성공만으로 인증이나 URL 접근 허용까지 성공했다고 할 수 없는 이유를 적는다.

## 이어서 연습하기

DB에서 찾은 회원은 어떻게 비밀번호 인증에 사용되나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-member-login?concept=spring.jpa-member-login)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [DaoAuthenticationProvider의 인증 흐름](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html)
- [Spring Data JPA 조회 메서드](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
- [UserDetailsService의 조회 책임](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html)
- [UserDetailsService API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/core/userdetails/UserDetailsService.html)
- [Spring Security 비밀번호 저장과 검증](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

UserDetailsService는 Repository로 저장 회원을 찾고 사용자명·저장된 비밀번호 인코딩값·권한 등을 UserDetails로 구성합니다. 설정된 DaoAuthenticationProvider가 PasswordEncoder로 입력 비밀번호를 검증하므로 조회 성공과 인증 성공은 다릅니다. 회원이 없으면 실패를 전달하며 자동 가입하지 않고, JPA는 이 조회를 구현하는 선택지 중 하나입니다.
