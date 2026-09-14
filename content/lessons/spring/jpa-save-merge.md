# save와 persist·merge 구분하기

## 학습 목표

기본 신규 판정 조건을 확인하고 merge가 반환한 관리 객체를 이어서 사용할 수 있습니다.

## 한줄 요약

save의 신규 판정과 merge가 반환하는 관리 객체를 구분해야 이후 변경을 놓치지 않습니다.

## 먼저 확인할 개념

[영속성 컨텍스트와 엔티티 상태](#/learn/spring/jpa-context-states)

## save가 선택하는 연산

Spring Data JPA의 기본 `save`는 새 엔티티로 판정하면 `EntityManager.persist`, 그렇지 않으면 `merge`를 사용한다. 기본 판정은 먼저 객체 타입인 `@Version` 속성이 있으면 그 null 여부를 보고, 그런 버전 속성이 없으면 식별자의 null 여부를 본다.

이번 예제는 `@Version`과 `Persistable` 구현이 없고 `@Id Long id`만 있는 기본 구성이다. 이 조건에서 `id == null`이면 새 엔티티로 판정한다. 직접 할당한 ID나 `Persistable.isNew()`를 쓰는 구성에는 이 단순 규칙을 그대로 적용하지 않는다.

## 관리 대상을 만들기와 상태 복사하기

| 연산 | 읽어야 할 차이 |
| --- | --- |
| `persist(newMember)` | 새 객체 자체를 관리 대상으로 삼는다. |
| `merge(detachedMember)` | 전달받은 상태를 관리 객체에 복사하고 그 관리 객체를 반환한다. |

다음은 기존 DB 행을 가진 분리된 `detachedMember`를 열린 컨텍스트의 활성 쓰기 트랜잭션에서 처리하는 읽기 예제다. `rename`은 매핑된 nickname 필드만 바꾸는 Member 메서드다.

```java
Member managedMember = em.merge(detachedMember);
managedMember.rename("구름");
```

관찰할 것: 두 번째 줄은 어느 참조를 바꾸는가? 분리된 인수를 merge에 넘겼다고 그 인수 객체 자체가 관리 상태로 바뀌지는 않는다. merge가 돌려준 관리 객체를 이어서 사용해야 한다. 이미 관리 중인 객체를 merge하는 경우와는 구분한다.

직접 해볼 일: 두 변수 옆에 “입력 상태의 출처”와 “이후 변경을 관리할 객체”를 적는다. Repository에서도 `Member saved = members.save(member)`처럼 반환값을 사용할 이유를 설명해 보자.

## merge를 수정 전용 명령으로 보지 않기

merge는 신규 상태도 다룰 수 있어 언제나 UPDATE만 한다는 뜻이 아니다. 반대로 화면에서 받은 부분 입력을 엔티티로 만들어 무턱대고 merge하면 수정 의도가 없는 필드까지 상태에 포함할 수 있다. 기존 엔티티를 조회하고 허용한 필드만 바꾸는 작업 흐름을 먼저 검토한다. 실제 SQL 시점과 저장 확정은 flush·트랜잭션 조건에 달려 있다.

## 이어서 연습하기

save에 넘긴 객체와 반환된 객체는 왜 구분해야 하나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-save-merge?concept=spring.jpa-save-merge)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Spring Data JPA의 엔티티 저장과 신규 판정](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [JPA EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

기본 save는 신규 판정에 따라 persist 또는 merge를 사용합니다. 버전 속성이나 Persistable 같은 다른 판정 조건이 없을 때만 null 식별자를 단순 기준으로 볼 수 있습니다. 분리된 객체를 merge하면 상태를 복사한 관리 객체가 반환되므로 그 반환값을 이어서 사용해야 하며, save 호출만으로 즉시 커밋을 뜻하지는 않습니다.
