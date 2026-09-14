# Repository로 생성·조회·삭제 요청하기

## 학습 목표

JpaRepository의 엔티티·ID 타입을 읽고 CRUD 메서드와 빈 조회 결과를 구분할 수 있습니다.

## 한줄 요약

Repository의 타입 계약과 조회 결과의 빈 상태를 읽으면 기본 저장소 요청을 구분할 수 있습니다.

## 먼저 확인할 개념

[엔티티와 식별자 매핑](#/learn/spring/jpa-entity-id)

## 엔티티와 키 타입을 함께 약속하기

`Member`의 식별자는 `@Id Long id`라고 하자. Spring Data JPA Repository가 탐색·등록되고 DB 접근 구성이 준비된 앱에서 다음 인터페이스를 사용할 수 있다. 인터페이스를 적는 것만으로 DB 연결까지 준비되는 것은 아니다.

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository
        extends JpaRepository<Member, Long> {
}
```

`Member`는 저장소가 다루는 엔티티 타입이고 `Long`은 그 식별자 타입이다. Spring Data JPA가 공통 메서드 구현을 제공한다.

| 요청 | 의미 |
| --- | --- |
| `save(member)` | 신규 여부를 판정해 저장 상태를 반영하고 사용할 엔티티를 반환한다. |
| `findById(7L)` | 식별자 7에 해당하는 회원을 `Optional<Member>`로 찾는다. |
| `findAll()` | 회원들을 조회한다. 정렬 없는 호출의 순서는 보장하지 않는다. |
| `deleteById(7L)` | 식별자 7에 해당하는 회원의 삭제를 요청한다. |

CRUD는 생성·조회·수정·삭제를 묶어 부르는 말이다. 실제 변경의 확정은 트랜잭션과 함께 봐야 한다.

## 없는 결과를 관찰하기

```java
Optional<Member> found = members.findById(7L);
if (found.isEmpty()) {
    throw new IllegalArgumentException("회원을 찾을 수 없습니다.");
}
Member member = found.get();
```

여기서 `members`는 등록된 `MemberRepository`이고 `Optional`은 `java.util.Optional`이다. 해당 행이 없으면 `findById`는 빈 Optional을 반환한다. `get()` 전에 빈 상태를 검사한 이유를 설명해 보자. 더 짧게 쓰고 싶다면 `orElseThrow`로 같은 분기를 표현할 수 있다.

직접 해볼 일: 조회 실패를 호출자에게 전달하는 줄을 표시한다. 이 분기가 가입이나 HTTP 응답을 자동으로 만들어 주는지도 구분한다.

## 반환값과 업무 처리를 구분하기

빈 조회 결과를 자동 가입으로 바꾸면 읽기 요청이 쓰기 요청으로 변한다. 가입은 별도 업무 규칙으로 결정한다. 또한 `save`를 언제나 INSERT 한 번이나 즉시 커밋으로 해석하지 않는다. 다음 문서들에서 객체의 관리 상태와 저장 시점을 나누어 읽는다.

## 이어서 연습하기

회원 한 명을 조회할 때 어떤 타입과 없는 결과를 다뤄야 하나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-repository-crud?concept=spring.jpa-repository-crud)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [조회 메서드와 페이징 반환 계약](https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html)
- [Spring Data JPA의 엔티티 저장과 신규 판정](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [CrudRepository API](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

JpaRepository<Member, Long>은 Member 엔티티와 Long 식별자를 사용하는 저장소입니다. findById는 해당 회원이 없으면 빈 Optional을 반환하므로 호출자가 없는 경우를 처리해야 합니다. 저장소의 CRUD 요청과 가입 규칙·HTTP 응답·트랜잭션 확정은 각각 구분해야 합니다.
