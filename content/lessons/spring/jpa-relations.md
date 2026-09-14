# 연관관계의 주인과 외래키

## 학습 목표

many-to-one 외래키 매핑과 mappedBy의 방향을 읽고 양쪽 객체 참조를 일관되게 맞출 수 있습니다.

## 한줄 요약

양방향 일대다 관계에서는 다대일 쪽이 외래키 변경을 결정하고 양쪽 참조는 코드가 맞춥니다.

## 먼저 확인할 개념

[기본키와 외래키: 행 식별과 테이블 연결](#/learn/spring/jpa-table-keys) · [영속성 컨텍스트와 엔티티 상태](#/learn/spring/jpa-context-states)

## 주문의 회원과 회원의 주문 목록

주문 여러 개가 한 회원을 가리키면 주문에서 회원은 **다대일** 관계다. 아래는 유효한 두 엔티티에서 관계 필드만 발췌한 예제다. 두 타입에는 별도의 `@Entity`, 식별자와 무인자 생성자가 있고, 매핑 어노테이션은 `jakarta.persistence`의 타입이다.

```java
// PurchaseOrder의 필드
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id")
private Member member;

// Member의 필드
@OneToMany(mappedBy = "member")
private List<PurchaseOrder> orders = new ArrayList<>();
```

`PurchaseOrder.member`가 주문 테이블의 `member_id`를 매핑한다. `Member.orders`의 `mappedBy = "member"`는 반대편 **Java 필드 이름**을 가리킨다. `member_id`라는 DB 열 이름을 적는 자리가 아니다.

이 양방향 관계에서는 다대일인 `PurchaseOrder.member`가 관계의 주인이다. “주인”은 업무상 더 중요한 객체라는 뜻이 아니라 DB 관계 변경을 결정하는 쪽이라는 뜻이다.

## 한 연결을 양쪽에서 일관되게 보기

회원이 아직 없는 관리 주문 `order`와 관리 회원 `member`를 같은 쓰기 트랜잭션에서 연결한다고 하자. 두 메서드는 각각 위 참조와 목록을 변경하는 일반 Java 메서드다.

```java
order.setMember(member);
member.addOrder(order);
```

첫 줄은 외래키를 정하는 소유 필드를 맞추고, 둘째 줄은 현재 메모리에서 회원의 주문 목록도 맞춘다. inverse인 목록에만 넣은 변경에 DB 관계 갱신을 기대하지 않는다.

직접 해볼 일: 위 코드의 둘째 줄만 남겼을 때 메모리 목록과 소유 필드가 어떻게 어긋나는지 그려 본다. 기존 회원을 다른 회원으로 바꾸는 작업이라면 이전 회원의 목록도 정리해야 한다.

## 탐색·전파·삭제는 별도 규칙이다

연관관계 매핑이 있다고 연관된 새 객체를 자동으로 저장하거나 삭제하는 것은 아니다. cascade와 orphanRemoval은 별도 설정이다. 이번에는 두 객체가 이미 관리 중이고 저장·삭제 전파를 추가하지 않은 관계 변경만 읽는다. 처음부터 필요 없는 양방향 관계를 만들거나 모든 관계에 삭제 전파를 붙이지 않는다.

## 이어서 연습하기

양방향 관계에서 어느 필드를 바꿔야 DB 연결 변경을 표현하나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-relations?concept=spring.jpa-relations)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [JPA ManyToOne API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/manytoone)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [JPA OneToMany API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/onetomany)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

양방향 일대다·다대일 매핑에서는 다대일 필드가 외래키 변경을 결정하는 주인이고, mappedBy는 그 Java 필드를 가리킵니다. 소유 필드를 바꾸어 DB 연결 변경을 표현하고 반대편 목록도 함께 맞춰 메모리 관계를 일관되게 유지합니다. 저장·삭제 전파는 별도 설정입니다.
