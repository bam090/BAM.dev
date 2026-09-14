# JPA·Hibernate·Spring Data JPA의 역할

## 학습 목표

표준·구현체·저장소 지원의 역할을 저장 흐름에 연결할 수 있습니다.

## 한줄 요약

JPA는 객체 저장의 표준이고 Hibernate는 구현체이며 Spring Data JPA는 Repository 작성을 돕습니다.

## 먼저 확인할 개념

[Spring과 Spring Boot의 관계](#/learn/spring/framework-boot) · [DI(의존성 주입): 필요한 객체를 외부에서 받기](#/learn/spring/ioc-di)

## 객체 저장에는 여러 역할이 있다

회원 객체를 만들었다고 프로그램 종료 뒤에도 값이 남는 것은 아니다. 관계형 DB에 값을 남기려면 객체의 필드와 표의 열을 연결하고, 조회·변경 요청을 DB가 처리할 수 있게 전달해야 한다. 이런 연결을 객체와 관계형 데이터의 매핑, **ORM**이라고 부른다.

| 이름 | 회원 저장에서 맡는 일 |
| --- | --- |
| JPA, 현재 이름은 Jakarta Persistence | 엔티티 매핑과 저장·조회·상태 관리 API의 표준 계약이다. |
| Hibernate ORM | JPA 계약을 구현하고 매핑·상태를 바탕으로 DB 접근을 수행하는 구현체다. |
| Spring Data JPA | JPA를 이용하는 Repository 인터페이스의 구현과 반복되는 저장소 작업을 돕는다. |
| 관계형 DB | 실제 행을 저장하고 SQL과 제약 조건을 처리한다. |

## 호출 순서에서 관찰하기

`서비스 → MemberRepository → JPA의 EntityManager → Hibernate → DB`는 Hibernate를 선택한 앱에서 저장 요청을 따라가는 개념 흐름이다. `EntityManager`는 엔티티를 조회하고 관리 상태를 다루는 JPA API다. Repository는 그 작업을 편하게 요청하는 입구다.

직접 해볼 일: 위 흐름에 “저장소 메서드 선언”, “표준 API”, “실제 구현”, “행 보관”을 붙여 보자. 업무상 가입을 허용할지 판단하는 서비스의 책임도 별도로 찾아보자.

## 같은 이름처럼 쓰지 않기

JPA 자체가 DB이거나 SQL 없이 동작하는 저장 장치는 아니다. Spring Data JPA 없이 `EntityManager`를 직접 사용할 수 있고, JPA 구현체도 Hibernate만 있는 것은 아니다. Boot는 호환되는 라이브러리와 설정을 준비하는 일을 도울 뿐 DB 모델과 업무 규칙을 대신 설계하지 않는다.

## 이어서 연습하기

회원 객체를 DB에 저장할 때 JPA, Hibernate, Repository는 어떤 일을 나누나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-roles?concept=spring.jpa-roles)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [Spring Boot 관리 의존성 버전](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html)
- [Hibernate 7.4 호환 범위](https://hibernate.org/orm/releases/7.4/)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

JPA는 엔티티의 매핑과 상태 관리에 관한 표준 계약이고, Hibernate는 그 계약을 수행하는 구현체입니다. Spring Data JPA는 JPA를 이용하는 Repository 작성을 돕고, 실제 행은 DB가 보관합니다. 편의 계층인 Spring Data JPA 없이도 JPA를 사용할 수 있습니다.
