# 조회 메서드 이름과 JPQL

## 학습 목표

메서드 이름의 조건과 JPQL의 엔티티·속성 이름을 읽고 바인딩 값과 쿼리 구조를 구분할 수 있습니다.

## 한줄 요약

조회 메서드 이름과 JPQL은 엔티티 속성을 기준으로 읽고 사용자 값은 매개변수로 전달합니다.

## 먼저 확인할 개념

[Repository로 생성·조회·삭제 요청하기](#/learn/spring/jpa-repository-crud) · [엔티티와 식별자 매핑](#/learn/spring/jpa-entity-id)

## 저장 열과 Java 속성 이름 구분하기

`Member` 엔티티에 `@Column(name = "display_name") String nickname`과 `@Id Long id`가 있다고 하자. 조회 메서드 이름은 DB 열 이름이 아닌 **엔티티 속성**을 따라 만든다.

```java
public interface MemberRepository
        extends JpaRepository<Member, Long> {
    List<Member> findByNickname(String nickname);
}
```

`findByNickname("밤")`은 nickname 조건으로 조회하는 메서드다. 닉네임이 고유하다는 조건이 없으므로 여러 회원을 담는 List를 사용했다. 결과가 하나 이하여야 하는 조회와 결과가 여러 개인 조회의 반환 계약을 구분한다.

## 조건을 직접 적는 JPQL

JPQL은 엔티티와 그 속성을 대상으로 쓰는 조회 언어다. 다음은 같은 조건을 `@Query`로 표현하는 예제다. `@Query`는 Spring Data JPA, `@Param`은 Spring Data의 어노테이션이다.

```java
@Query("select m from Member m where m.nickname = :name")
List<Member> searchByName(@Param("name") String name);
```

`Member`는 여기서 기본 엔티티 이름이고 `nickname`은 Java 속성이다. `:name`은 실행 때 값을 받을 자리다. 위 선언은 SQL을 직접 쓰는 native query가 아니다. `members` 테이블과 `display_name` 열 이름을 그대로 바꾸어 넣지 않는다.

관찰할 것: `name` 인수에 공백이나 따옴표가 있어도 바꾸려는 것은 조건의 **값**이다. 사용자 입력을 쿼리 문자열에 이어 붙여 문법으로 만들지 않고 매개변수로 전달한다.

직접 해볼 일: `@Param`과 쿼리의 매개변수 이름을 같은 색 대신 같은 밑줄로 표시한다. 닉네임의 값을 바꾸어도 엔티티·속성 이름이 그대로인 이유를 설명한다.

## 메서드 이름으로 모든 조회를 늘리지 않기

조건 이름이 너무 길어 의도가 흐려지면 명시적 쿼리를 검토한다. JPQL도 DB 접근이므로 반환되는 수와 정렬·트랜잭션·연관 로딩을 따로 살펴야 한다. 값 바인딩으로 테이블명·속성명·정렬 구문 같은 쿼리 구조까지 임의로 바꾸는 것은 아니다.

## 이어서 연습하기

Java 속성과 DB 열 이름이 다를 때 조회 조건에는 어느 이름을 쓰나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-query-methods?concept=spring.jpa-query-methods)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Spring Data JPA 조회 메서드](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
- [조회 메서드와 페이징 반환 계약](https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

파생 조회 메서드 이름과 JPQL은 DB 열 이름이 아니라 엔티티 속성을 기준으로 조건을 표현합니다. JPQL의 엔티티 이름과 속성 이름은 쿼리 구조이고, 사용자 입력은 매개변수로 전달할 값입니다. 결과가 없거나 여러 개인 경우까지 포함해 반환 타입과 조회 조건을 함께 정해야 합니다.
