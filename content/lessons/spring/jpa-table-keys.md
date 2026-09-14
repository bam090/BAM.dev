# 기본키와 외래키: 행 식별과 테이블 연결

## 학습 목표

표의 행·열·기본키·외래키를 읽고 이름이 같은 회원을 구별할 수 있습니다.

## 한줄 요약

기본키는 한 행을 구별하고 외래키는 다른 표의 행을 연결합니다.

## 먼저 확인할 개념

[JPA·Hibernate·Spring Data JPA의 역할](#/learn/spring/jpa-roles)

## 이름이 같아도 다른 회원이다

관계형 DB는 데이터를 표인 **테이블**에 담는다. 행은 개별 기록이고 열은 그 기록의 속성이다. 아래는 실행 결과가 아닌 설명용 데이터다.

회원 테이블:

| id | nickname |
| --- | --- |
| 7 | 밤 |
| 12 | 밤 |

주문 테이블:

| id | member_id | item |
| --- | --- | --- |
| 30 | 7 | 노트 |
| 31 | 12 | 펜 |

이름 “밤”만 보면 주문 30의 주인을 결정할 수 없다. `member_id = 7`을 회원의 `id = 7`과 연결하면 구별할 수 있다.

## 기본키와 외래키 읽기

**기본키**는 테이블 안에서 행을 유일하게 구별하는 값이다. 위 예제는 `id` 하나를 기본키로 사용하며 중복되거나 비어 있을 수 없다. 여러 열을 묶는 키도 있지만 이번에는 단일 키만 다룬다.

**외래키**는 다른 행을 가리키는 값의 연결을 표현한다. 여기서는 주문의 `member_id`가 회원의 기본키를 참조한다. 해당 외래키 제약이 실제 DB에 적용되었다면, 존재하지 않는 회원 키 99를 넣은 주문은 제약을 만족하지 못한다. 제약이 자동으로 회원 99를 만들어 주지는 않는다.

직접 해볼 일: 회원 7의 닉네임을 “구름”으로 바꾸어도 주문 30의 연결이 유지되는 이유를 적어 보자. 바뀌는 표시값과 그대로인 키를 따로 표시하면 된다.

## 연결과 표시값을 혼동하지 않기

외래키가 있다고 Java 객체가 자동 생성되는 것은 아니다. 키는 데이터의 연결이고, JPA 매핑은 그 연결을 객체 참조로 다루게 한다. 실제 테이블 생성·제약 적용과 삭제 시 동작은 별도 DB 계약이다. 어노테이션을 적었다는 사실만으로 운영 DB의 제약 적용까지 확인했다고 말하지 않는다.

## 이어서 연습하기

같은 이름의 회원과 그 회원의 주문은 어떤 값으로 구별하고 연결하나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-table-keys?concept=spring.jpa-table-keys)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [JPA Id API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/id)
- [JPA ManyToOne API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/manytoone)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

기본키는 이름 같은 표시값과 별도로 한 행을 구별합니다. 주문의 외래키가 회원의 기본키를 가리키므로 닉네임이 같거나 바뀌어도 연결할 회원을 식별할 수 있습니다. 외래키 제약이 적용된 경우 참조 대상의 존재도 확인하지만, 없는 회원을 자동으로 생성하지는 않습니다.
