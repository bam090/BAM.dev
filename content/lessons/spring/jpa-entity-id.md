# 엔티티와 식별자 매핑

## 학습 목표

엔티티 선언·기본 생성자·식별자와 열 매핑을 코드에서 찾을 수 있습니다.

## 한줄 요약

엔티티 매핑은 Java 상태와 테이블을 연결하며 @Id가 영속 식별자를 지정합니다.

## 먼저 확인할 개념

[기본키와 외래키: 행 식별과 테이블 연결](#/learn/spring/jpa-table-keys)

## Java 클래스에 저장 계약 표시하기

다음은 Jakarta Persistence 3.2의 매핑을 읽기 위한 클래스다. DB와 생성 전략의 실행 환경은 준비하지 않았으며 실행 결과를 뜻하지 않는다.

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

`@Entity`는 JPA가 다룰 엔티티임을 표시한다. `@Table`은 테이블을, `@Column`은 열 이름을 지정한다. 위에서는 Java의 `nickname`이 DB의 `display_name`과 연결된다. `@Id`를 필드에 두었으므로 이 예제는 필드를 통해 저장 상태에 접근한다.

`@Id`는 식별자를 표시하고 `@GeneratedValue`는 식별자 생성 방식을 JPA에 맡기는 매핑이다. 생성 전략과 DB에 따라 값이 준비되는 시점이 다르므로 `new Member("밤")`만으로 키나 DB 행이 생겼다고 가정하지 않는다.

## 먼저 찾고 작게 바꾸기

관찰할 것: `id`와 `nickname` 중 이름 변경 이후에도 같은 회원임을 식별할 값은 어느 것인가? 직접 해볼 일: `display_name`을 `nickname_text`로 바꾸는 매핑을 종이에 적고, 그 수정만으로 실제 DB 구조도 바뀌었다고 할 수 있는지 설명한다.

## 엔티티 클래스의 경계

표준 JPA 엔티티에는 `public` 또는 `protected` 무인자 생성자가 필요하다. 클래스는 `final`이 아니어야 하고 영속 필드와 메서드에도 표준의 비 final 요구를 지킨다. `record`, enum, 인터페이스를 엔티티로 선언하지 않는다. record를 요청 DTO로 사용한 앞선 MVC 예제와는 계약이 다르다.

필드 이름이 `id`라는 사실만으로 식별자가 지정되지 않는다. 반대로 모든 객체를 엔티티로 만들 필요도 없다. HTTP 입력·응답 DTO와 영속 객체는 각자의 역할로 구분한다.

## 이어서 연습하기

평범한 Java 객체를 JPA가 다룰 회원으로 표시하려면 무엇이 필요한가요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-entity-id?concept=spring.jpa-entity-id)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [JPA Entity API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entity)
- [JPA Id API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/id)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

JPA 엔티티는 @Entity와 매핑으로 Java 상태를 테이블에 연결하고, @Id로 영속 식별자를 지정합니다. 표준 요구에 맞는 클래스와 무인자 생성자도 필요합니다. @GeneratedValue는 키 생성의 매핑이며, 객체를 new로 만들었다는 사실만으로 DB 저장이 완료되지는 않습니다.
