# 지연 로딩(LAZY)과 즉시 로딩(EAGER)

## 학습 목표

LAZY와 EAGER의 계약을 구분하고 관리 범위가 끝난 미초기화 연관의 조회 요구를 찾을 수 있습니다.

## 한줄 요약

LAZY와 EAGER는 로딩 시점의 계약이며 추가 조회가 가능한 범위와 SQL 형태를 함께 살펴야 합니다.

## 먼저 확인할 개념

[연관관계의 주인과 외래키](#/learn/spring/jpa-relations)

## 객체 참조를 따라갈 때 필요한 데이터

주문 목록에 주문 번호만 표시할 때와 회원 이름도 표시할 때 필요한 데이터는 다르다. 연관 객체를 언제 준비할지 정하는 것이 **fetch 전략**이다.

| 설정 | JPA 계약 |
| --- | --- |
| EAGER | 연관 데이터를 즉시 준비해야 한다는 요구다. |
| LAZY | 처음 접근할 때 준비하도록 미룰 수 있다는 힌트다. 구현체는 앞서 읽을 수도 있다. |

이 설정만으로 JOIN 한 번인지 별도 SELECT인지 결정되지 않는다. EAGER를 “항상 한 번의 JOIN”으로, LAZY를 “절대 미리 읽지 않음”으로 암기하지 않는다.

## 참조가 있어도 읽을 범위는 필요하다

다음은 Hibernate에서 `order.member`가 LAZY 연관인 상황이다. 회원은 아직 초기화되지 않았고 연결된 Session이 닫혔으며, 외부에서 지연 로딩을 허용하는 별도 설정도 없다고 하자.

```text
서비스 안에서 주문만 조회
→ Session 종료
→ 화면용 변환 중 order.getMember().getNickname() 접근
```

이 조건에서는 필요한 추가 조회를 완료할 수 없고 `LazyInitializationException`이 발생할 수 있다. 이 예외 이름과 처리 조건은 Hibernate의 동작이다. 모든 JPA 구현체가 같은 예외를 쓴다는 뜻은 아니다.

화면에 회원 이름이 필요하다면 서비스의 조회 범위 안에서 필요한 데이터를 준비하고 응답 DTO로 옮기는 방법을 검토한다. 명시적 fetch 조회나 DTO 조회도 가능하며 다음 문서에서 비교한다.

직접 해볼 일: 위 흐름에서 회원 이름을 DTO로 복사할 위치를 표시한다. 주문 번호만 필요한 화면에도 회원을 항상 읽을 필요가 있는지 설명한다.

## 화면까지 엔티티를 넘기기 전에

엔티티를 그대로 응답 변환에 넘기면 어느 연관을 접근하는지에 따라 예상 밖 조회나 로딩 실패가 생길 수 있다. 필요한 데이터와 조회 범위를 먼저 정한다. 실제 발생 여부는 초기화 상태·컨텍스트 수명·구현체 설정으로 확인하며, 코드 한 줄만 보고 쿼리 개수나 실패를 보장하지 않는다.

## 이어서 연습하기

LAZY로 둔 연관 객체는 언제든 추가로 읽을 수 있나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-fetch-loading?concept=spring.jpa-fetch-loading)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Hibernate LazyInitializationException API](https://docs.hibernate.org/orm/7.4/javadocs/org/hibernate/LazyInitializationException.html)

- [JPA FetchType API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/fetchtype)
- [JPA EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

LAZY는 연관 데이터를 나중에 읽도록 미룰 수 있다는 힌트이고 EAGER는 즉시 준비하라는 요구입니다. 두 설정은 SQL이 JOIN 한 번이라는 보장이 아닙니다. 미초기화 연관을 사용하려면 추가 조회가 가능한 범위가 필요하므로 화면에 필요한 값을 그 범위 안에서 준비하는 방법을 검토해야 합니다.
