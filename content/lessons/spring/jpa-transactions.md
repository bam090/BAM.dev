# 트랜잭션과 flush

## 학습 목표

- 함께 성공할 저장소 작업에 서비스의 트랜잭션 경계를 정할 수 있습니다.
- 활성 쓰기 트랜잭션에서 관리 엔티티의 변경 감지를 설명할 수 있습니다.
- flush 동기화와 commit 확정 및 rollback을 구분할 수 있습니다.
- 실제 프록시 호출·readOnly·실패 규칙과 DB 제약 오류 시점을 확인할 이유를 설명할 수 있습니다.

## 먼저 확인할 개념

[영속성 상태와 save](#/learn/spring/jpa-context-states)

## 업무 단위와 변경 감지

트랜잭션은 여러 DB 작업을 한 성공·실패 단위로 묶습니다.
회원 변경과 변경 이력이 함께 성공해야 한다면 서비스의 전체 업무에 경계를 둡니다.
Repository 메서드의 개별 트랜잭션만으로 여러 호출 전체의 원자성이 생기지는 않습니다.

다음은 등록된 서비스의 메서드 부분입니다.
트랜잭션 관리자와 어노테이션 처리가 준비되어 있으며 다른 Bean이 프록시로 호출하고 기존 트랜잭션은 없습니다.
members는 주입된 Repository이고 rename은 매핑된 nickname만 바꿉니다.

```java
import org.springframework.transaction.annotation.Transactional;

@Transactional
public void renameMember(Long id, String nickname) {
    Member member = members.findById(id).orElseThrow();
    member.rename(nickname);
}
```

일반 쓰기 트랜잭션에서 조회한 엔티티가 계속 관리 중이면 JPA는 영속 필드 변경을 감지합니다.
이를 변경 감지 또는 dirty checking이라고 부릅니다.
JPA 관점에서는 그 객체의 변경마다 save를 다시 호출해야만 감지되는 것은 아닙니다.
detached 객체로 바꾸면 같은 변경 감지 경로가 이어지지 않습니다.

---

## flush와 확정의 구분

flush는 컨텍스트 변경을 DB와 동기화하는 단계이고 commit은 트랜잭션을 확정하는 단계입니다.
다음은 일반 트랜잭션 테이블의 데이터 변경만 다루는 개념 흐름입니다.
DDL과 외부 API 및 비트랜잭션 저장은 없다고 가정합니다.

```text
쓰기 트랜잭션 시작 → 관리 객체의 nickname 변경
→ flush 성공 → 아직 커밋하지 않음 → rollback
```

DB로 변경을 보낸 이후에도 이 트랜잭션은 끝나지 않았습니다.
이 조건에서 rollback하면 데이터 변경은 확정되지 않습니다.
SQL 전달과 성공적인 커밋을 구분합니다.

EntityManager의 flush로 동기화를 요청할 수 있고 커밋 과정에서도 필요한 동기화를 수행합니다.
기본 AUTO 모드는 조회 결과에 영향을 주는 미반영 변경을 조회에 반영하도록 처리합니다.
모든 조회 앞에서 무조건 같은 SQL을 보낸다는 뜻은 아닙니다.
제약 위반의 오류 시점은 ID 생성과 구현체 및 DB 제약 등에 따라 save와 flush 또는 commit에서 달라질 수 있습니다.

flush는 clear처럼 관리 객체를 분리하지 않으며 매번 독립 트랜잭션을 만들지도 않습니다.
다른 트랜잭션에서 변경이 보이는지는 격리 수준과 DB 계약이 필요하므로 flush 성공만으로 판단하지 않습니다.

## 호출 경로와 실패 규칙

기본 프록시 방식의 자기 호출은 프록시를 거치지 않으므로 새 트랜잭션 경계를 적용하지 않습니다.
어노테이션뿐 아니라 활성화와 실제 호출 경로를 확인합니다.
별도 규칙이 없는 기본 rollback 대상은 RuntimeException과 Error이며 checked exception에는 다른 규칙이 적용될 수 있습니다.
오류를 잡아 성공처럼 삼키면 실패가 트랜잭션 경계에 전달되지 않을 수 있습니다.

readOnly는 읽기 의도의 힌트와 최적화에 사용하며 쓰기를 반드시 차단하는 보안 규칙은 아닙니다.
readOnly의 변경 감지를 일반 쓰기 트랜잭션과 같다고 가정하지 않습니다.
위 예제는 일반 쓰기 트랜잭션을 전제로 합니다.

## 변경·동기화·확정의 관찰

`실제 경계 시작 → 관리 객체 변경 → flush → commit 또는 rollback`을 따라갑니다.
직접 해볼 일은 닉네임 변경과 이력 추가를 같은 성공·실패 단위로 묶고 각 화살표에 객체 변경과 DB 동기화 및 확정 여부를 표시하는 것입니다.
flush 후 rollback하는 흐름에서 save 반환이나 SQL 전달만으로 최종 성공을 판단할 수 없는 이유를 설명합니다.

## 정리

- 활성 쓰기 트랜잭션의 관리 엔티티 변경은 JPA가 감지합니다.
- flush는 동기화이고 commit은 확정이므로 flush 후에도 rollback할 수 있습니다.
- 업무 단위의 실제 경계와 호출 경로 및 실패 규칙을 함께 확인합니다.

## 이어서 연습하기

[연관관계와 외래키](#/learn/spring/jpa-relations)에서 관리 객체 사이의 연결 변경을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Spring Data JPA 트랜잭션 경계](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [Transactional의 호출 경로와 규칙](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Data JPA 4.1.1·Spring Framework 7.0.9·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 SQL 및 DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

활성 쓰기 트랜잭션에서 계속 관리 중인 엔티티의 변경은 JPA가 감지하므로 매번 save를 호출하는 것이 필수 조건은 아닙니다.
flush는 DB 동기화이며 commit은 확정이므로 일반 트랜잭션의 데이터 변경은 flush 후에도 rollback할 수 있습니다.
함께 성공할 작업에 실제 트랜잭션 경계를 두고 프록시 호출과 실패 규칙을 확인해야 합니다.
readOnly와 flush는 각각 쓰기 차단이나 관리 해제를 뜻하지 않으며 SQL 전달만으로 최종 성공과 다른 트랜잭션의 관찰을 보장하지 않습니다.
