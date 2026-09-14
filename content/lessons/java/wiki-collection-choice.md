# 컬렉션 선택: 보관 규칙과 연산 비용

## 학습 목표

데이터 이름 대신 순서·중복·키·처리 방향과 자주 할 연산으로 컬렉션을 선택할 수 있습니다.

## 한줄 요약

컬렉션 선택과 비용은 인터페이스 이름이 아니라 필요한 규칙·구현체·연산 조건을 함께 봅니다.

## 먼저 확인할 개념

[순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists) · [Set과 Map으로 중복·키 다루기](#/learn/java/wiki-sets-maps) · [Deque로 큐와 스택 사용하기](#/learn/java/wiki-deque)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 보관함을 고르기 전에 필요한 규칙부터 묻는다

서랍을 정리할 때도 물건에 따라 보관 방법이 달라진다.
공부할 순서를 적으려면 같은 항목이 다시 나와도 되는 목록이 필요하고, 완료한 과정만 세려면 중복을 막아야 한다.

과정 ID로 진행률을 바로 찾고 싶다면 ID와 진행률을 한 쌍으로 저장해야 한다.
먼저 들어온 복습 요청부터 처리하고 싶다면 넣는 쪽과 꺼내는 쪽도 정해야 한다.

Java의 **컬렉션 프레임워크(Collections Framework)**는 이런 여러 보관 규칙을 인터페이스와 구현 클래스로 제공한다.
구현체 이름부터 외우지 말고 다음 네 가지를 먼저 묻는다.

1. 입력된 순서를 남겨야 하는가?
2. 같은 값을 여러 번 허용하는가?
3. 위치가 아니라 키로 값을 찾아야 하는가?
4. 앞과 뒤 중 어디에서 넣고 꺼내야 하는가?

## 선택 순서

| 필요한 규칙 | 먼저 검토할 인터페이스와 구현체 |
| --- | --- |
| 순서와 중복을 유지하고 인덱스로 조회 | `List`, 보통 `ArrayList` |
| 중복을 없애고 포함 여부를 확인 | `Set`, 순서가 필요 없으면 `HashSet` |
| 키로 값을 저장하고 조회 | `Map`, 순서가 필요 없으면 `HashMap` |
| 먼저 들어온 작업부터 처리 | `Deque`, 보통 `ArrayDeque`의 뒤에 넣고 앞에서 꺼냄 |
| 나중에 들어온 작업부터 처리 | `Deque`, 보통 `ArrayDeque`를 스택으로 사용 |

같은 데이터도 사용하는 방법이 다르면 알맞은 컬렉션이 달라질 수 있다.
데이터 이름보다 순서·중복·조회 키·삽입과 삭제 위치를 먼저 설명한 뒤 구현체를 고른다.

## 완료 확인을 다음 처리로 연결하기

한 복습 기능도 역할이 다르면 서로 다른 도구를 쓸 수 있다.
완료 ID의 중복을 Set으로 확인하고 ID별 진행률은 Map에서 찾으며 처리할 ID는 Deque에 들어온 순서대로 보관한다.
대기 ID를 pollFirst로 꺼낸 다음 완료 여부를 검사하고, 필요한 경우 해당 ID의 진행률을 조회한다.
자료의 이름이 모두 학습 ID라고 한 컬렉션에 모든 역할을 강요하지 않는다.

```java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ReviewQueueDemo {
    public static void main(String[] args) {
        Set<String> completedIds = new HashSet<>();
        completedIds.add("html");
        Map<String, Integer> progressById = new HashMap<>();
        progressById.put("java", 40);
        Deque<String> pendingIds = new ArrayDeque<>();
        pendingIds.offerLast("html");
        pendingIds.offerLast("java");

        while (!pendingIds.isEmpty()) {
            String id = pendingIds.pollFirst();
            if (!completedIds.contains(id)) {
                System.out.println(id + ": " + progressById.get(id));
            }
        }
    }
}
```

이 예제에서 아직 완료하지 않은 ID인 `java`에는 진행률 `40`이 등록되어 있다. 첫 ID인 `html`은 완료 Set에 있으므로 건너뛰고, 다음 ID인 `java`는 Map의 진행률과 함께 표시한다. 예상 출력은 `java: 40`이다. Set의 순회 순서는 사용하지 않으며 처리 순서는 Deque가 맡는다.


## 구현체와 연산 조건을 함께 보고 비용을 말한다

자료구조의 비용은 인터페이스 이름 하나로 정해지지 않는다.
어떤 구현체에서 어느 연산을 하는지, 해시가 값을 잘 나누는지 같은 조건을 함께 밝혀야 한다.

여기서 `O(1)`은 원소가 늘어도 작업량이 대체로 일정한 모양이고, `O(n)`은 원소 수에 비례해 작업량이 늘어나는 모양이다.
**상환(amortized) O(1)**은 가끔 큰 작업이 있어도 여러 번의 작업 전체를 평균하면 한 번당 일정한 비용이 된다는 뜻이다.

| 구현체와 연산 | 일반적인 비용 | 필요한 조건이나 이유 |
| --- | --- | --- |
| `ArrayList.get(index)` | `O(1)` | 인덱스로 위치에 접근 |
| `ArrayList` 맨 뒤 추가 | 상환 `O(1)` | 가끔 내부 배열을 늘리는 작업 포함 |
| `ArrayList` 중간 삽입·삭제 | `O(n)` | 뒤쪽 원소를 옮길 수 있음 |
| `HashSet.add/contains/remove` | `O(1)` | 해시 함수가 원소를 버킷에 알맞게 분산한다는 조건 |
| `HashMap.get/put` | `O(1)` | 해시 함수가 키를 버킷에 알맞게 분산한다는 조건 |
| `ArrayDeque` 양 끝 작업 | 대부분 상환 `O(1)` | 크기를 늘리는 작업이 가끔 발생 |
| `ArrayDeque.contains` | `O(n)` | 찾는 값을 만날 때까지 순회할 수 있음 |

`HashSet`과 `HashMap`의 전체 순회 비용은 저장된 값의 수뿐 아니라 내부 버킷 용량의 영향도 받을 수 있다.
성능이 중요한 선택은 실제 데이터 크기와 자주 하는 연산을 기준으로 측정한다.

## 이어서 연습하기

[예외 처리와 전달](#/learn/java/wiki-exceptions)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

순서·중복·키 조회·양 끝 처리 가운데 필요한 규칙을 먼저 정하고 List·Set·Map·Deque를 선택합니다. 완료 여부는 Set, ID별 값은 Map, 처리 순서는 Deque처럼 같은 기능에서도 역할을 나눌 수 있습니다. 비용은 구현체와 연산을 함께 봅니다. ArrayList get은 O(1)이지만 중간 삭제는 이동 때문에 O(n)일 수 있고 맨 뒤 추가는 상환 O(1)입니다. 해시 조회의 일반 O(1)은 적절한 분산 조건이 필요합니다.
