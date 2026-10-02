# 테이블 키와 엔티티 식별자

## 학습 목표

- 테이블의 행·열·기본키를 읽고 이름이 같은 회원을 구별할 수 있습니다.
- 외래키로 연결할 회원을 찾고 실제 DB 제약과 표시값을 구분할 수 있습니다.
- Entity·Id·Table·Column을 코드에서 찾아 Java 상태와 DB 매핑을 설명할 수 있습니다.
- 엔티티의 무인자 생성자·비 final 요구와 객체 생성만으로 저장이 완료되지 않는 경계를 설명할 수 있습니다.

## 먼저 확인할 개념

[JPA·Hibernate·Spring Data JPA의 역할](#/learn/spring/jpa-roles)

## 행과 열 및 테이블 키

관계형 DB의 테이블은 표이고 행은 개별 기록이며 열은 기록의 속성입니다.
다음은 설명용 데이터이며 조회 실행 결과는 아닙니다.

| 회원 id | nickname |
| --- | --- |
| 7 | 밤 |
| 12 | 밤 |

| 주문 id | member_id | item |
| --- | --- | --- |
| 30 | 7 | 노트 |
| 31 | 12 | 펜 |

**기본키**는 테이블 안에서 행을 유일하게 구별하는 값입니다.
이 예제의 단일 id는 중복되거나 비어 있을 수 없습니다.
닉네임은 같을 수 있으므로 주문의 주인을 이름만으로 결정하지 않습니다.
**외래키**는 다른 행을 가리키는 값의 연결을 표현합니다.
주문의 member_id 7은 회원의 기본키 7과 연결됩니다.
외래키 제약이 실제 DB에 적용됐다면 존재하지 않는 회원 99를 참조한 주문은 제약을 만족하지 못하며 제약이 회원을 자동 생성하지도 않습니다.

---

## Java 엔티티와 식별자 매핑

엔티티 매핑은 Java 상태와 테이블 및 열을 연결합니다.
다음은 `Member.java`의 매핑을 읽는 예제이며 DB와 생성 전략의 실행 환경은 준비하지 않았습니다.

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "display_name")
    private String nickname;

    protected Member() {}

    public Member(String nickname) {
        this.nickname = nickname;
    }
}
```

`@Entity`는 JPA가 다룰 엔티티를 표시하고 Table과 Column은 테이블과 열을 지정합니다.
Java 속성 nickname은 DB 열 display_name에 대응합니다.
`@Id`를 필드에 두었으므로 이 예제는 필드로 영속 상태에 접근합니다.
필드 이름이 id라는 사실만으로 식별자가 지정되지는 않습니다.
GeneratedValue는 식별자 생성 방식을 맡기는 매핑이며 전략과 DB에 따라 값이 준비되는 시점이 다릅니다.
`new Member("밤")`만으로 식별자나 DB 행이 생겼다고 판단하지 않습니다.

## 엔티티 클래스와 DB 계약의 경계

표준 JPA 엔티티에는 public 또는 protected 무인자 생성자가 필요합니다.
클래스와 모든 메서드 및 영속 인스턴스 필드는 final이 아니어야 합니다.
record와 enum 및 인터페이스를 엔티티로 선언하지 않습니다.
HTTP DTO에 record를 사용하는 계약과 엔티티 계약은 다르므로 모든 객체를 엔티티로 만들지 않습니다.

외래키 자체가 Java 객체를 생성하지 않으며 연관 매핑은 데이터의 연결을 객체 참조로 다루도록 합니다.
어노테이션을 적었다는 사실만으로 운영 DB의 테이블과 제약이 적용됐다고 말하지 않습니다.

## 행 식별과 객체 매핑의 관찰

`행의 기본키 확인 → 외래키의 대상 확인 → 엔티티 Id와 열 매핑 확인`을 따라갑니다.
직접 해볼 일은 회원 7의 이름이 바뀌어도 주문 30의 연결이 유지되는 이유를 적는 것입니다.
이어서 display_name을 nickname_text로 바꾸는 매핑을 적고 Java 선언의 수정과 실제 DB 구조 변경을 구분합니다.

## 정리

- 기본키는 행을 식별하고 외래키는 다른 행을 연결합니다.
- 엔티티와 Id 및 열 매핑은 Java 객체의 저장 계약을 표시합니다.
- 객체 생성과 어노테이션 선언만으로 실제 DB 저장이나 제약 적용이 확인되지는 않습니다.

## 이어서 연습하기

[Repository의 CRUD](#/learn/spring/jpa-repository-crud)에서 엔티티와 키 타입을 저장소 요청에 연결합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [Entity API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entity)
- [Id API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/id)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 SQL 및 DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

기본키는 행을 식별하고 외래키는 다른 행의 키를 참조하므로 이름이 같거나 바뀌어도 회원과 주문의 연결을 구별할 수 있습니다.
Java에서는 Entity와 테이블·열 매핑 및 Id로 영속 식별자를 표시합니다.
엔티티는 무인자 생성자와 비 final 요구 등 표준 계약을 지켜야 합니다.
객체 생성과 매핑 선언만으로 DB 저장이나 실제 제약 적용이 완료되지는 않습니다.
