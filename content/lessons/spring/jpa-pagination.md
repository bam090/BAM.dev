# Page와 Slice로 목록 나누기

## 학습 목표

Page·Slice와 페이지 번호·정렬 조건을 읽고 count와 연관 조회 조건을 따로 검토할 수 있습니다.

## 한줄 요약

Page는 전체 규모를, Slice는 다음 데이터의 존재를 다루며 페이징에는 정렬 조건도 필요합니다.

## 먼저 확인할 개념

[조회 메서드 이름과 JPQL](#/learn/spring/jpa-query-methods) · [N+1을 관찰하고 조회 계획 세우기](#/learn/spring/jpa-fetch-plan)

## 화면이 필요한 정보부터 정하기

회원 목록을 20명씩 읽더라도 “전체 12페이지 중 1페이지”와 “더 보기”는 요구하는 정보가 다르다.

| 반환 타입 | 목록 외에 다루는 정보 |
| --- | --- |
| Page<Member> | 전체 건수와 전체 페이지 수를 제공한다. 이를 위한 count 조회가 필요할 수 있다. |
| Slice<Member> | 다음 묶음이 있는지 제공한다. 전체 건수는 제공하지 않는다. |

Spring Data는 Slice의 다음 데이터 존재를 확인하기 위해 요청 크기보다 하나 더 읽는 방식을 사용한다. Page라고 항상 count SQL을 정확히 한 번 실행한다고 단정하지 않는다. 결과에서 총량을 알 수 있는 경우의 최적화도 있다.

## 범위와 정렬 같이 읽기

```java
PageRequest first = PageRequest.of(
    0, 20, Sort.by("nickname").and(Sort.by("id")));
```

`PageRequest`와 `Sort`는 `org.springframework.data.domain`의 타입이다. 첫 인수 0은 첫 페이지, 20은 한 페이지의 요청 크기다. 위 정렬은 nickname 오름차순 뒤 id 오름차순을 적용한다.

닉네임이 같은 회원이 있을 수 있으므로 고유한 id를 마지막 기준으로 더했다. 데이터가 바뀌지 않는 조건에서도 nickname만 정렬하면 동률끼리의 순서를 확정할 수 없다. 동시에 데이터가 추가·삭제되는 상황의 페이지 이동 문제까지 이 정렬만으로 해결되지는 않는다.

직접 해볼 일: “전체 건수는 필요 없고 다음 목록 버튼만 필요하다”는 요구에 맞는 반환 타입을 적고, 같은 닉네임 두 행의 앞뒤를 정할 필드를 찾는다.

## 컬렉션 fetch와 함께 쓰는 경우

JPA 3.2 표준은 컬렉션 fetch join에 setFirstResult·setMaxResults를 적용한 효과를 정하지 않는다. Hibernate 7.4에서는 서브쿼리 안의 limit·offset을 지원하는 DB에서 이 조합을 SQL로 처리하도록 개선했다. 공식 문서의 예외 DB는 Sybase ASE다.

따라서 “컬렉션 fetch와 페이징은 항상 메모리에서 처리된다”는 옛 규칙으로 판단하지 않는다. 구현체·버전·DB와 페이지의 count·정렬·결과 크기를 확인하고, 필요한 경우 부모 ID를 먼저 페이지로 구한 뒤 연관을 별도 조회하는 방법도 비교한다. 이 문서는 그 실제 쿼리를 실행·측정하지 않았다.

## 이어서 연습하기

전체 페이지 수가 필요한 목록과 다음 묶음만 필요한 목록은 어떻게 다르나요? 먼저 자신의 말로 답한 뒤 [이 문서의 두 객관식](#/review/java/spring-jpa-pagination?concept=spring.jpa-pagination)에서 판단 이유를 비교해 보세요.

## 공식 자료

- [조회 메서드와 페이징 반환 계약](https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html)
- [Hibernate 7.4의 컬렉션 fetch와 페이징 변경](https://docs.hibernate.org/orm/7.4/whats-new/)
- [Jakarta Persistence 3.2 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html)
- [PageRequest API](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/PageRequest.html)

2026-09-14 공식 문서를 확인해 승인된 범위에서 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Data JPA 4.1.1·Jakarta Persistence 3.2·Java 25 정식 기준의 정적 읽기 자료입니다. Hibernate 구현체를 언급하는 부분은 Boot 관리 버전 7.4.5.Final을 기준으로 구분하며, 코드·SQL·DB·Spring 앱을 실행한 결과는 아닙니다.

## 핵심 질문 답

전체 건수와 페이지 수가 필요하면 Page를, 다음 묶음이 있는지만 필요하면 Slice를 검토합니다. 페이지 번호는 0부터 시작하며 동률을 구별할 정렬 기준도 필요합니다. 컬렉션 fetch를 함께 사용할 때는 JPA 표준의 보장 범위와 구현체·버전·DB의 지원을 따로 확인해야 합니다.
