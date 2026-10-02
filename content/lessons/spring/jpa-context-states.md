# 영속성 상태와 save

## 학습 목표

- new·managed·detached·removed의 엔티티 상태를 구분할 수 있습니다.
- 한 컨텍스트의 식별자별 관리 원칙과 detach·clear·remove의 차이를 설명할 수 있습니다.
- save의 Version·ID 기본 신규 판정과 Persistable 등의 별도 판정 조건을 구분할 수 있습니다.
- persist와 merge를 비교하고 분리된 입력 대신 merge가 반환한 관리 객체를 이어서 사용할 수 있습니다.

## 먼저 확인할 개념

[Repository의 CRUD](#/learn/spring/jpa-repository-crud)

## 영속성 컨텍스트와 엔티티 상태

영속성 컨텍스트는 JPA가 엔티티 객체를 관리하는 범위입니다.
같은 컨텍스트에서는 한 영속 식별자에 대응하는 관리 객체를 하나로 유지합니다.
DB 전체의 복사본이나 모든 요청이 공유하는 전역 캐시는 아닙니다.

다음은 회원 7이 존재하는 같은 열린 컨텍스트의 예제입니다.
중간 clear와 detach 및 삭제와 외부 변경은 없으며 em은 이 컨텍스트의 EntityManager입니다.

```java
Member first = em.find(Member.class, 7L);
Member second = em.find(Member.class, 7L);
boolean sameObject = first == second;
```

이 조건에서는 같은 식별자의 관리 객체를 받습니다.
서로 다른 컨텍스트에서 얻은 객체도 항상 같은 참조라는 뜻은 아닙니다.

| 상태 | 의미 |
| --- | --- |
| new·비영속 | 새로 만들었고 아직 컨텍스트가 관리하지 않습니다. |
| managed·영속 | 현재 컨텍스트의 관리 대상입니다. |
| detached·준영속 | 영속 식별자는 있으나 현재 컨텍스트의 관리에서 벗어났습니다. |
| removed·삭제 예정 | 관리 엔티티에 삭제를 요청했습니다. |

persist는 새 객체를 관리 대상으로 삼습니다.
detach는 지정 객체를 분리하고 clear는 모든 관리 엔티티를 분리합니다.
detach와 clear는 Java 변수를 지우지 않고 DB 행을 삭제하지도 않습니다.
remove는 DB 행의 삭제를 요청하는 연산입니다.
ID가 남아 있어도 detached 객체의 필드 변경만으로 변경 감지가 이어지지는 않습니다.
컨텍스트 수명과 트랜잭션 연동은 구성에 따라 달라집니다.

---

## save의 신규 판정

Spring Data JPA의 save는 새 엔티티로 판정하면 persist를 사용하고 그렇지 않으면 merge를 사용합니다.
기본 판정은 객체 타입의 Version 속성이 있으면 그 null 여부를 먼저 확인합니다.
그런 버전 속성이 없으면 식별자의 null 여부를 봅니다.
원시 타입 Version 속성은 이 null 판정에 사용할 수 없습니다.

Version과 Persistable 구현이 없고 Id가 Long인 기본 구성에서는 null ID를 새 엔티티로 판정합니다.
직접 할당한 ID나 `Persistable.isNew()`를 쓰는 경우에는 이 단순 규칙을 그대로 적용하지 않습니다.

## persist와 merge의 관리 객체

persist는 새 객체 자체를 관리 대상으로 삼습니다.
merge는 전달받은 상태를 관리 객체에 복사하고 그 관리 객체를 반환합니다.
다음은 기존 행이 있는 detachedMember를 열린 컨텍스트의 활성 쓰기 트랜잭션에서 처리하는 예제입니다.
rename은 매핑된 nickname 필드만 바꾸는 Member 메서드입니다.

```java
Member managedMember = em.merge(detachedMember);
managedMember.rename("구름");
```

분리된 입력을 merge에 넘겼다고 그 입력 객체 자체가 관리 상태가 되지는 않습니다.
이후 변경에는 반환된 managedMember를 사용합니다.
Repository에서도 `Member saved = members.save(member)`처럼 반환값을 이어서 사용할 이유가 있습니다.
이미 관리 중인 객체를 merge하는 경우와는 구분합니다.

merge는 신규 상태도 다루므로 수정 전용 UPDATE 명령은 아닙니다.
부분 입력을 엔티티로 만들어 무턱대고 merge하면 수정 의도가 없는 필드까지 포함할 수 있습니다.
기존 엔티티를 조회해 허용한 필드만 바꾸는 흐름을 먼저 검토합니다.
save 호출이 즉시 SQL 실행과 커밋을 뜻하지도 않습니다.

## 상태에서 저장 연산까지의 관찰

`관리 상태 확인 → 신규 판정 → persist 또는 merge → 이후 변경할 객체 선택`을 따라갑니다.
직접 해볼 일은 두 변수에 입력의 출처와 이후 관리할 객체를 표시하는 것입니다.
이어서 clear 후 first 변수와 DB 행이 각각 남는지 설명하고 그 객체의 수정이 자동 감지되는지도 판단합니다.

## 정리

- ID의 존재와 현재 컨텍스트의 관리 상태를 구분합니다.
- save는 신규 판정에 따라 persist 또는 merge를 선택합니다.
- 분리된 상태를 merge할 때는 반환된 관리 객체에 이후 변경을 적용합니다.

## 이어서 연습하기

[트랜잭션과 flush](#/learn/spring/jpa-transactions)에서 변경 동기화와 확정 시점을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)
- [Spring Data JPA의 저장과 신규 판정](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 SQL 및 DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

같은 컨텍스트는 식별자별 관리 객체를 하나로 유지하며 분리된 객체의 ID 존재와 관리 상태는 다릅니다.
save는 기본 Version·ID 판정이나 별도로 정한 신규 판정에 따라 persist 또는 merge를 선택합니다.
분리된 입력을 merge하면 상태를 복사한 관리 객체가 반환되므로 그 반환값을 이어서 사용합니다.
clear는 행 삭제가 아니며 save만으로 변경이 즉시 커밋됐다고 판단하지 않습니다.
