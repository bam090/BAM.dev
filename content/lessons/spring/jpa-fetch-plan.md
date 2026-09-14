# N+1을 관찰하고 조회 계획 세우기

## 학습 목표

주어진 조회 패턴에서 N+1을 진단하고 화면에 필요한 연관 데이터를 위한 fetch 계획을 비교할 수 있습니다.

## 한줄 요약

목록 이후 연관 조회가 반복되는지 관찰하고 필요한 데이터에 맞는 fetch 계획을 고릅니다.

## 먼저 확인할 개념

[지연 로딩(LAZY)과 즉시 로딩(EAGER)](#/learn/spring/jpa-fetch-loading) · [조회 메서드 이름과 JPQL](#/learn/spring/jpa-query-methods)

## 목록 호출 한 번 뒤의 추가 조회

다음은 실행 로그가 아닌 **설명용 조회 기록**이다. 주문 3개가 서로 다른 회원을 가리키고, 회원이 미초기화 상태이며 캐시·배치 로딩·fetch join은 없다고 가정한다.

```text
주문 목록 조회                         1회
첫 주문의 회원 이름을 읽으며 회원 조회    1회
둘째 주문의 회원 이름을 읽으며 회원 조회  1회
셋째 주문의 회원 이름을 읽으며 회원 조회  1회
```

목록 1회 뒤에 각 결과의 연관을 읽으며 N회의 추가 조회가 생기는 형태를 **N+1 문제**라고 부른다. 이 가정에서는 총 4회지만 실제 횟수는 같은 회원 공유, 캐시, 배치 크기와 조회 계획에 따라 달라진다. Repository 호출 수만 세면 연관 접근에서 늘어난 요청을 놓칠 수 있다.

## 필요한 단일 연관을 함께 준비하기

회원 이름까지 필요한, 페이징 없는 주문 목록을 생각해 보자. `PurchaseOrder.member`는 회원 한 명을 가리키며 회원이 없는 주문도 포함해야 한다. JPQL의 다음 조회는 주문을 읽으며 member 연관을 함께 준비하는 의도다.

```java
@Query("select o from PurchaseOrder o left join fetch o.member")
List<PurchaseOrder> findWithMember();
```

`left`는 연결된 회원이 없는 주문도 남기는 선택이고, `fetch`는 연관 객체를 함께 준비하라는 의미다. 단순 join과 fetch join의 목적을 구분한다. 이 코드만으로 실제 DB에서 성능 개선이나 특정 SQL 개수를 측정했다고 말하지 않는다.

## 다른 선택도 비교하기

| 선택 | 검토할 상황 |
| --- | --- |
| fetch join | 이번 조회에서 필요한 연관을 명시한다. |
| EntityGraph | 함께 읽을 엔티티 속성의 범위를 지정한다. |
| DTO 조회 | 응답에 필요한 값만 조회한다. |
| 구현체의 배치 로딩 | 추가 조회를 여러 키씩 묶는 방법을 검토한다. |

직접 해볼 일: 주문 번호만 필요한 화면과 회원 이름도 필요한 화면을 나누고 위 선택의 이유를 적는다. 모든 연관을 EAGER로 바꾸는 것은 각 화면의 조회 계획을 대신하지 않는다.

한 번에 여러 컬렉션을 join하면 조합된 행 수가 크게 늘 수 있다. 단일 member 연관을 함께 읽는 이 예제를 모든 관계에 그대로 확대하지 않는다. 컬렉션 fetch와 페이징은 다음 문서의 조건도 확인한다.

## 이어서 연습하기

목록 조회 뒤에 연관 조회가 반복될 때 무엇을 바꿔야 하나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-fetch-plan?concept=spring.jpa-fetch-plan)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Hibernate의 연관 조회와 배치 로딩](https://docs.hibernate.org/orm/7.4/introduction/html_single/)

- [Spring Data JPA 조회 메서드](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

N+1은 목록을 읽은 뒤 각 결과의 연관을 접근하면서 추가 조회가 반복되는 패턴입니다. 먼저 필요한 데이터와 실제 조회 기록을 확인하고 fetch join, EntityGraph, DTO 조회나 배치 로딩을 비교합니다. 모든 관계를 EAGER로 바꾸거나 모든 연관을 한 번에 join하는 방식이 항상 해결책은 아닙니다.
