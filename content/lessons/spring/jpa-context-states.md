# 영속성 컨텍스트와 엔티티 상태

## 학습 목표

new·managed·detached·removed 상태와 한 컨텍스트의 식별자별 관리 원칙을 구분할 수 있습니다.

## 한줄 요약

영속성 컨텍스트는 엔티티를 관리하며 DB에 행이 있다는 사실과 객체가 관리된다는 사실은 다릅니다.

## 먼저 확인할 개념

[Repository로 생성·조회·삭제 요청하기](#/learn/spring/jpa-repository-crud)

## 행의 식별자와 Java 객체를 연결하는 범위

**영속성 컨텍스트**는 JPA가 엔티티 객체를 관리하는 범위다. 같은 컨텍스트에서는 한 영속 식별자에 대응하는 관리 객체를 하나로 유지한다. DB 전체를 복사한 저장소나 모든 요청이 공유하는 전역 캐시는 아니다.

아래는 기존 회원 7이 있는 같은 열린 컨텍스트에서 읽는 예제다. 중간에 `clear`, `detach`, 삭제, 외부 변경은 없다. `em`은 이 컨텍스트의 `EntityManager`다.

```java
Member first = em.find(Member.class, 7L);
Member second = em.find(Member.class, 7L);
boolean sameObject = first == second;
```

관찰할 것: 두 호출이 같은 식별자를 관리 범위 안에서 찾고 있다. 이 조건에서는 같은 관리 객체를 받는다. 서로 다른 컨텍스트에서 얻은 객체에도 항상 `==`가 참이라는 뜻은 아니다.

## 네 상태를 나누어 읽기

| 상태 | 뜻 |
| --- | --- |
| new, 비영속 | 새로 만들었고 아직 컨텍스트가 관리하지 않는다. |
| managed, 영속 | 컨텍스트가 관리하고 있는 엔티티다. |
| detached, 준영속 | 영속 식별자는 있지만 현재 컨텍스트의 관리에서 벗어났다. |
| removed, 삭제 예정 | 관리 중이던 엔티티에 삭제를 요청한 상태다. |

`persist`는 새 객체를 관리 대상으로 삼는다. `detach`는 지정 객체를, `clear`는 컨텍스트의 모든 관리 엔티티를 분리한다. `remove`는 DB 행의 삭제를 요청하는 연산이므로 `detach`와 다르다.

직접 해볼 일: 위 조회 뒤 `em.clear()`를 호출했다고 표시하고, `first`라는 Java 변수와 DB 회원 행이 각각 사라지는지 생각해 보자. clear는 Java 변수를 지우거나 DB 행을 삭제하는 연산이 아니다.

## ID가 있다고 늘 저장되는 것은 아니다

분리된 객체의 값을 바꾸는 것만으로 JPA 변경 감지가 이어지지는 않는다. 따라서 “ID가 있다”와 “현재 관리 객체다”를 나누어 확인해야 한다. 컨텍스트의 수명과 트랜잭션 연동 방식은 구성에 따라 다르므로 서로 다른 요청의 컨텍스트가 항상 같다고 가정하지 않는다.

## 이어서 연습하기

같은 ID를 다시 읽는 것과 객체의 관리가 끝나는 것은 어떻게 다른가요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-context-states?concept=spring.jpa-context-states)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [JPA EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

같은 영속성 컨텍스트에서는 같은 식별자의 관리 엔티티를 하나로 유지합니다. clear나 detach로 분리되면 Java 객체와 DB 행이 남아 있어도 그 객체는 현재 관리 대상이 아닙니다. 객체의 ID 존재, 관리 상태, 삭제 요청 상태를 나누어야 변경 반영을 설명할 수 있습니다.
