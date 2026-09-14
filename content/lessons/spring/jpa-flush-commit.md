# flush와 커밋의 차이

## 학습 목표

영속성 컨텍스트 동기화와 트랜잭션 확정을 구분하고 flush 시점의 오류 가능성을 설명할 수 있습니다.

## 한줄 요약

flush는 DB와의 동기화이고 커밋은 트랜잭션 확정이므로 서로 같은 단계가 아닙니다.

## 먼저 확인할 개념

[트랜잭션 안에서 변경 감지하기](#/learn/spring/jpa-transactions)

## 보낸 변경과 확정된 변경

회원 이름을 바꿨을 때 Java 객체의 상태가 바뀌는 순간과 DB에 변경을 보내는 순간은 같지 않을 수 있다. **flush**는 영속성 컨텍스트의 변경을 DB와 동기화하는 단계다. **commit**은 트랜잭션의 변경을 확정하는 단계다.

아래는 트랜잭션을 지원하는 일반 테이블의 데이터 변경만 다루는 개념 흐름이다. DDL·외부 API·비트랜잭션 저장은 없다고 하자.

```text
쓰기 트랜잭션 시작
→ 관리 중인 회원의 nickname 변경
→ flush 성공
→ 아직 커밋하지 않음
→ rollback
```

관찰할 것: DB로 변경을 보낸 이후에도 같은 트랜잭션이 끝나지 않았다. 이 조건에서 rollback하면 그 트랜잭션의 데이터 변경은 확정되지 않는다. “SQL을 보냈다”는 사실과 “성공적으로 커밋됐다”는 사실은 다르다.

## flush는 언제 필요한가

`EntityManager.flush()`로 동기화를 요청할 수 있다. 커밋 과정에서도 필요한 변경을 동기화하며, 기본 AUTO 모드에서는 조회 결과에 영향을 주는 미반영 변경을 조회에 반영하도록 처리한다. 이를 “모든 조회 앞에서 무조건 같은 SQL을 보낸다”로 해석하지 않는다.

예를 들어 중복될 수 없는 회원명이 DB에 이미 있다면, 새로운 상태가 제약에 맞는지는 실제 동기화 시점에 드러날 수 있다. 오류가 persist/save·flush·commit 중 어느 지점에서 드러나는지는 ID 생성·구현체·DB 제약 등에 영향을 받는다.

직접 해볼 일: 흐름의 각 화살표에 “객체 변경”, “DB 동기화”, “확정 또는 취소”를 표시한다. `save` 반환 뒤에도 트랜잭션 종료 결과를 확인해야 하는 이유를 적는다.

## flush가 하지 않는 일

flush는 컨텍스트를 비우는 `clear`가 아니고, 변경마다 독립 트랜잭션을 만드는 명령도 아니다. flush를 성공했다고 다른 세션에서 그 변경이 항상 보인다고 단정하지 않는다. 다른 트랜잭션에서의 관찰은 격리 수준과 DB 계약까지 필요하며 이번 범위에서는 다루지 않는다.

## 이어서 연습하기

DB로 변경을 보낸 뒤에도 트랜잭션을 되돌릴 수 있나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-flush-commit?concept=spring.jpa-flush-commit)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [JPA EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

flush는 관리 중인 변경을 DB와 동기화하지만 트랜잭션을 확정하지는 않습니다. 따라서 일반 트랜잭션의 데이터 변경은 flush 이후에도 rollback할 수 있습니다. 제약 오류가 동기화나 커밋에서 드러날 수 있으므로 save 반환이나 SQL 전달만으로 최종 성공을 판단하지 않습니다.
