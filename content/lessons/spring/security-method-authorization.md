# @PreAuthorize로 서비스 메서드 인가하기

## 학습 목표

메서드 인가 활성화와 프록시 호출 여부에 따라 검사 경계를 판단할 수 있습니다.

## 한줄 요약

메서드 인가는 서비스 호출에도 권한 조건을 두며, 기본 프록시를 통과하는 호출에 적용됩니다.

## 먼저 확인할 개념

[DI(의존성 주입): 필요한 객체를 외부에서 받기](#/learn/spring/ioc-di) · [요청 인가: 경로·HTTP 메서드별 접근 규칙](#/learn/spring/security-request-rules)

## URL 밖에서도 업무 행동을 보호한다

**메서드 인가(Method Authorization)**는 메서드 호출에 허용 조건을 두는 기능이다. 여러 컨트롤러가 같은 서비스의 공지 수정 메서드를 부른다면, 그 업무 행동을 서비스 경계에서도 검사할 수 있다.

등록된 설정 클래스에 `@EnableMethodSecurity`를 사용해 기능을 활성화하고, Spring이 관리하는 서비스의 메서드에 조건을 둔다. Boot Security starter만 있다는 사실로 메서드 인가가 기본 활성화되는 것은 아니다.

```java
@PreAuthorize("hasAuthority('notices.write')")
public void reviseTitle(long noticeId, String title) {
    // 공지 제목을 수정하는 업무 처리
}
```

`PreAuthorize`는 `org.springframework.security.access.prepost.PreAuthorize`, `EnableMethodSecurity`는 `org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity`다. 예제는 다중 인증 확장 없이 위 권한 조건만 사용한다. 외부 호출자가 주입받은 Bean을 통해 호출하면 메서드 본문 전에 `notices.write`를 확인한다. URL의 인가를 통과했어도 이 권한이 없으면 본문 실행 전에 거부될 수 있다.

## 프록시를 지나는가를 관찰한다

기본 방식은 **프록시**, 즉 실제 객체 앞에서 호출을 받아 검사를 수행하는 대리 객체를 사용한다.

```text
외부 호출자 → 주입받은 Bean 프록시 → 권한 검사 → 실제 메서드
같은 객체 안의 this.reviseTitle(...) → 실제 메서드
```

기본 프록시 방식에서는 같은 객체의 `this` 호출이 프록시를 다시 지나지 않는다. 직접 `new`로 만든 객체도 Spring이 구성한 검사 경로 밖이다. 어노테이션이 보인다는 이유만으로 모든 Java 호출이 보호된다고 말하지 않는다. 필요한 검사가 외부 Bean 호출 경계에서 수행되도록 역할을 정하고 그 경로로 확인한다.

## 요청 인가와 함께 읽는다

URL 인가는 HTTP 진입점을, 메서드 인가는 실제 호출 경계를 표현한다. 메서드 인가를 추가했다고 모든 HTTP 경로가 자동으로 보호되거나, 선언하지 않은 메서드에도 같은 조건이 생기지는 않는다.

직접 해볼 일: “컨트롤러가 주입받은 서비스 호출”과 “서비스 내부의 this 호출”에 화살표를 그려 프록시를 지나는 쪽을 표시한다. 어노테이션 위치뿐 아니라 기능 활성화와 호출 경로도 확인하는 이유를 적는다.

## 이어서 연습하기

[OAuth 2.0과 OIDC의 역할](#/learn/spring/security-oauth2-oidc)에서 다음 판단을 이어서 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [메서드 인가](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [Spring 프록시의 호출 경계](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Security 7.1.1·Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청·테스트는 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

메서드 인가는 서비스 같은 Spring Bean의 호출에도 권한 조건을 적용합니다. EnableMethodSecurity로 활성화하고 PreAuthorize로 실행 전 조건을 선언할 수 있습니다. 기본 프록시 방식에서는 외부에서 Bean 프록시를 거치는 호출이 검사되므로, 같은 객체의 this 호출이나 직접 new로 만든 객체도 같은 보호를 받는다고 가정하지 않아야 합니다.
