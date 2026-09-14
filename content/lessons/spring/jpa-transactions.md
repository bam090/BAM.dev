# 트랜잭션 안에서 변경 감지하기

## 학습 목표

활성 쓰기 트랜잭션·관리 상태에서 변경 감지를 설명하고 서비스 작업 단위의 경계를 고를 수 있습니다.

## 한줄 요약

쓰기 트랜잭션의 관리 엔티티 변경은 감지되며 여러 저장소 요청은 업무 단위로 묶어야 합니다.

## 먼저 확인할 개념

[save와 persist·merge 구분하기](#/learn/spring/jpa-save-merge)

## 함께 성공해야 하는 작업의 범위

**트랜잭션**은 여러 DB 작업을 한 성공·실패 단위로 묶는다. 예를 들어 회원 정보를 바꾸고 변경 이력을 남기는 작업이 함께 성공해야 한다면 서비스의 그 작업 전체에 경계를 둔다. Repository 메서드마다 개별 트랜잭션이 있다는 사실만으로 여러 호출의 전체 원자성이 생기지는 않는다.

다음 메서드는 등록된 서비스의 일부다. Spring 트랜잭션 관리자와 어노테이션 처리가 준비되어 있고, 다른 Bean이 프록시를 통해 호출하며 기존 트랜잭션은 없다. `members`는 주입된 Repository이고 `rename`은 매핑된 nickname만 바꾼다.

```java
@Transactional
public void renameMember(Long id, String nickname) {
    Member member = members.findById(id).orElseThrow();
    member.rename(nickname);
}
```

여기서 `@Transactional`은 `org.springframework.transaction.annotation.Transactional`이다. 일반 쓰기 트랜잭션에서 조회한 엔티티가 계속 관리 중이고 정상 커밋된다면, JPA는 영속 필드의 변경을 감지해 동기화한다. 이를 **변경 감지**, 흔히 dirty checking이라고 부른다. JPA 관점에서는 그 객체의 변경마다 save를 다시 호출해야만 감지되는 것은 아니다.

## 관리 상태부터 관찰하기

`트랜잭션 시작 → 조회한 관리 엔티티 → 필드 변경 → 동기화와 커밋`의 흐름에서 관리가 끝난 detached 객체로 바꾸면 어느 연결이 끊기는지 짚어 보자.

직접 해볼 일: 닉네임 변경과 이력 추가가 모두 같은 트랜잭션에 들어가도록 서비스 메서드의 시작·끝을 표시한다. 오류를 잡아 성공처럼 삼키면 어떤 성공·실패 판단이 가려지는지도 설명한다.

## 어노테이션만 보고 확정하지 않기

기본 프록시 방식에서는 같은 객체 안의 자기 호출이 새 트랜잭션 경계를 적용하지 않는다. 트랜잭션 활성화와 실제 호출 경로를 함께 확인한다. 기본 rollback 규칙은 RuntimeException과 Error이며 checked exception은 별도 규칙이 없으면 다르다.

`readOnly = true`는 읽기 의도를 전달하는 힌트와 최적화에 쓰인다. 쓰기를 반드시 차단하는 보안 규칙이 아니며, 이 설정에서 변경 감지가 일반 쓰기와 같다고 가정하지 않는다. 이번 예제의 전제는 일반 쓰기 트랜잭션이다.

## 이어서 연습하기

조회한 회원의 이름만 바꾸면 언제 저장 변경으로 이어지나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-transactions?concept=spring.jpa-transactions)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [Spring Data JPA 트랜잭션 경계](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [Spring의 @Transactional 적용과 호출 경로](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

활성 쓰기 트랜잭션에서 계속 관리 중인 엔티티의 영속 필드를 바꾸면 JPA가 변경을 감지해 동기화합니다. 따라서 JPA 관점에서는 매번 save를 다시 호출하는 것이 필수 조건은 아닙니다. 여러 저장소 작업이 함께 성공해야 한다면 서비스의 업무 단위에 실제 트랜잭션 경계를 두고 호출 경로와 실패 규칙도 확인해야 합니다.
