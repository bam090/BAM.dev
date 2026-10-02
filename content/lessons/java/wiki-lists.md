# 컬렉션 선택: List·Set·Map·Deque

## 학습 목표

- 순서와 중복이 필요한 목록에 List를 쓰고 현재 크기와 위치 삭제·값 삭제를 구분할 수 있습니다.
- 같은 값을 한 번만 남길 때는 Set을 쓰고 키로 값을 찾고 갱신할 때는 Map을 쓰며 구현체의 순서 규칙을 확인할 수 있습니다.
- 처리 순서와 빈 상태에 맞게 Deque의 넣고 꺼내는 연산을 고를 수 있습니다.
- 필요한 보관 규칙과 자주 하는 연산의 비용으로 컬렉션을 골라 한 기능 안에서 역할을 나눌 수 있습니다.

## 먼저 확인할 개념

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics)와 [equals와 hashCode: 객체의 동일성과 동등성](#/learn/java/wiki-equality-hashing)을 먼저 확인해 보세요.

## 컬렉션이란

컬렉션은 여러 값을 한 객체에 모아 보관하고 꺼내는 자료구조입니다.
앞 문서에서는 `List<String>`처럼 타입 인수로 담을 값의 타입을 정했습니다.
이번에는 값을 어떤 규칙으로 보관할지에 따라 컬렉션을 고릅니다.

Java의 컬렉션 프레임워크(Collections Framework)는 여러 보관 규칙을 인터페이스와 구현 클래스로 제공합니다.
구현체 이름을 외우기 전에 다음 네 가지를 먼저 묻습니다.

1. 입력된 순서를 남겨야 하나요?
2. 같은 값을 여러 번 허용하나요?
3. 위치가 아니라 키로 값을 찾아야 하나요?
4. 앞과 뒤 중 어디에서 넣고 꺼내야 하나요?

예를 들어 복습 기능을 만든다고 해 보겠습니다.
이 기능에는 네 가지 요구가 있습니다.

- 공부할 과정을 순서대로 적고 같은 과정이 다시 나와도 됩니다.
- 완료한 과정 ID는 한 번만 셉니다.
- 과정 ID로 진행률을 바로 찾습니다.
- 먼저 들어온 복습 요청부터 처리합니다.

이 문서는 이 복습 기능 하나로 네 컬렉션과 그 선택 기준을 차례로 살펴봅니다.

## 컬렉션의 종류

| 인터페이스 | 보관 규칙 | 대표 구현체 | 복습 기능에서 |
| --- | --- | --- | --- |
| `List` | 순서를 유지하고 중복을 허용합니다 | `ArrayList` | 공부 순서 |
| `Set` | 같은 값을 한 번만 보관합니다 | `HashSet` | 완료한 과정 ID |
| `Map` | 키 하나에 값 하나를 짝지어 보관합니다 | `HashMap` | 과정 ID별 진행률 |
| `Deque` | 앞과 뒤 양쪽에서 넣고 뺍니다 | `ArrayDeque` | 복습 요청 대기열 |

`List`·`Set`·`Map`·`Deque`는 어떤 규칙으로 쓸지를 나타내는 인터페이스입니다.
`ArrayList`·`HashSet`·`HashMap`·`ArrayDeque`는 값을 실제로 보관하는 구현 클래스입니다.
변수를 인터페이스 타입으로 선언하면 사용하는 코드가 필요한 규칙을 중심으로 읽힙니다.
`Map`은 컬렉션 프레임워크의 일부이지만 `Collection`의 하위 타입은 아닙니다.

아래 예제는 Java 25의 `main` 같은 메서드 안에 두는 문장입니다.
소스 파일의 클래스 선언 앞에는 쓰는 타입의 import를 둡니다.

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
```

먼저 공부 순서를 적는 `List`부터 살펴보겠습니다.

---

## List 사용법

`List`는 원소의 순서를 유지하고 같은 값을 여러 번 저장할 수 있습니다.
각 원소에는 `0`부터 시작하는 인덱스로 접근합니다.

```java
List<String> order = new ArrayList<>();
order.add("HTML");
order.add("CSS");
order.add("HTML");

System.out.println(order.get(1)); // CSS
System.out.println(order.size()); // 3
```

`HTML`을 두 번 넣었으므로 크기는 `3`입니다.
`ArrayList`는 크기를 늘릴 수 있는 배열로 값을 보관하는 대표 `List` 구현체입니다.
인덱스로 자주 조회하고 주로 맨 뒤에 추가하는 목록이라면 먼저 검토하기 좋습니다.

`size()`는 현재 저장된 원소 수입니다.
이와 달리 용량(capacity)은 내부 배열이 다시 커지기 전까지 담을 수 있는 공간입니다.
`new ArrayList<>(10)`은 용량을 10으로 준비한 빈 목록이라서 `size()`는 `0`입니다.
그래서 이 목록에 바로 `get(0)`을 호출하면 유효한 원소가 없어 범위 예외가 발생합니다.
먼저 `add`로 원소를 넣고 현재 `size()`를 기준으로 접근합니다.

숫자 목록에서는 `remove`의 인수가 무엇이냐에 따라 뜻이 달라집니다.
두 호출 뒤에 무엇이 남을지 예상해 보세요.

```java
List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30));

numbers.remove(1);                   // 인덱스 1의 값 20 제거
numbers.remove(Integer.valueOf(10)); // 값 10 제거
```

남는 값은 `[30]`입니다.
첫 호출은 `int`를 넘겼으므로 `remove(int index)`가 선택되어 인덱스 1의 `20`을 지웁니다.
두 번째 호출은 `Integer` 객체를 넘겼으므로 `remove(Object value)`가 선택되어 값 `10`을 지웁니다.
숫자 `1`이라는 모양보다 인수가 `int`인지 `Integer`인지가 호출할 메서드를 가릅니다.

공부 순서처럼 같은 값이 다시 나와도 되는 목록에는 `List`가 맞습니다.
그런데 완료한 과정은 두 번 완료해도 한 번만 세어야 합니다.

---

## Set과 Map 사용법

`Set`은 중복 원소를 허용하지 않습니다.
같은 완료 ID를 여러 번 넣어도 같은 값으로 판단되면 하나만 남습니다.
`Map<K, V>`는 키와 값을 한 쌍으로 보관합니다.
키는 중복될 수 없지만 서로 다른 키가 같은 값을 갖는 것은 괜찮습니다.

다음 코드에서 `completed.size()`와 `progress.get("java-01")`이 무엇일지 예상해 보세요.

```java
Set<String> completed = new HashSet<>();
completed.add("html-01");
completed.add("html-01");

Map<String, Integer> progress = new HashMap<>();
progress.put("java-01", 40);
progress.put("java-01", 80);

System.out.println(completed.size());         // 1
System.out.println(progress.get("java-01")); // 80
```

`Set`에는 `html-01`이 하나만 남아 크기가 `1`입니다.
`Map`은 같은 키로 `put`을 다시 호출하면 새 키를 하나 더 만들지 않고 기존 값을 바꿉니다.
그래서 `java-01`의 진행률은 `80`입니다.

`HashSet`과 `HashMap`은 원소나 키의 `hashCode()`와 `equals()`로 같은 값인지 판단합니다.
그래서 직접 만든 객체를 내용 기준으로 중복 처리하거나 키로 쓰려면 앞 문서에서 본 두 메서드의 계약을 함께 지켜야 합니다.

`Set`이나 `Map`이라는 이름만으로 값을 만나는 순서를 알 수는 없습니다.
순서는 구현체가 정합니다.

| 필요한 순서 | `Set` 구현체 | `Map` 구현체 |
| --- | --- | --- |
| 순서가 필요 없음 | `HashSet` | `HashMap` |
| 넣은 순서 유지 | `LinkedHashSet` | `LinkedHashMap` |
| 자연 순서나 비교 기준으로 정렬 | `TreeSet` | `TreeMap` |

예를 들어 완료 ID를 중복 없이 처음 넣은 순서대로 다시 보여 줘야 한다면 `LinkedHashSet`을 고릅니다.

`Map`의 키와 값을 함께 순회할 때는 `entrySet()`을 씁니다.

```java
for (Map.Entry<String, Integer> entry : progress.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

`Map`은 `Collection`이 아니지만 `keySet()`·`values()`·`entrySet()`으로 키·값·키-값 쌍을 컬렉션처럼 볼 수 있습니다.

이제 완료와 진행률은 정리했습니다.
남은 요구는 들어온 복습 요청을 순서대로 처리하는 일입니다.

---

## Deque 사용법

`Deque`는 double-ended queue의 줄임말이며 앞과 뒤 양쪽에서 원소를 넣고 뺄 수 있습니다.
먼저 들어온 요청을 먼저 처리하는 방식을 큐(FIFO: First-In, First-Out)라고 합니다.
큐로 쓸 때는 뒤에 넣고 앞에서 꺼냅니다.

```java
Deque<String> waiting = new ArrayDeque<>();
waiting.offerLast("첫 번째 복습");
waiting.offerLast("두 번째 복습");

System.out.println(waiting.pollFirst()); // 첫 번째 복습
```

반대로 나중에 들어온 값을 먼저 꺼내는 방식을 스택(LIFO: Last-In, First-Out)이라고 합니다.
스택으로 쓸 때는 같은 쪽에서 `push()`·`pop()`·`peek()`을 씁니다.
새 코드에서 큐나 스택이 필요하면 오래된 `Stack` 클래스보다 `Deque`와 `ArrayDeque`를 먼저 검토합니다.

대기열은 비는 순간이 자연스럽게 찾아옵니다.
그래서 비어 있을 때 어떻게 알려 줄지에 따라 메서드를 고릅니다.

| 하는 일 | 할 수 없으면 특별한 값을 반환 | 할 수 없으면 예외를 던짐 |
| --- | --- | --- |
| 넣기 | `offerFirst` · `offerLast` | `addFirst` · `addLast` |
| 꺼내기 | `pollFirst` · `pollLast` | `removeFirst` · `removeLast` |
| 확인만 하기 | `peekFirst` · `peekLast` | `getFirst` · `getLast` |

`pollFirst()`가 `null`을 반환하면 처리할 요청이 없다고 판단할 수 있습니다.
`ArrayDeque`는 `null` 원소를 허용하지 않기 때문에 실제 원소 `null`과 빈 상태가 섞이지 않습니다.
`peekFirst()`는 꺼내지 않고 보기만 하므로 다음 처리 순서를 바꾸지 않습니다.
반대로 반드시 값이 있어야 하는 코드에서 빈 상태를 오류로 드러내려면 `removeFirst()`를 씁니다.

네 컬렉션을 하나씩 살펴보았습니다.
이제 복습 기능 전체를 한 코드로 이어 보겠습니다.

---

## 컬렉션의 선택과 비용

한 기능도 역할이 다르면 서로 다른 컬렉션을 씁니다.
복습 기능은 완료 여부를 `Set`으로 확인하고 진행률은 `Map`에서 찾으며 처리할 ID는 `Deque`에 들어온 순서대로 보관합니다.
값이 모두 학습 ID라는 이유로 한 컬렉션에 모든 역할을 맡기지 않습니다.

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

출력이 무엇일지 예상해 보세요.

```text
java: 40
```

첫 ID인 `html`은 완료 `Set`에 있으므로 건너뜁니다.
다음 ID인 `java`는 아직 완료하지 않았으므로 `Map`에서 찾은 진행률 `40`과 함께 출력합니다.
처리 순서는 `Deque`가 맡기 때문에 `Set`의 순회 순서는 결과에 영향을 주지 않습니다.

| 필요한 규칙 | 먼저 검토할 인터페이스와 구현체 |
| --- | --- |
| 순서와 중복을 유지하고 인덱스로 조회 | `List` · 보통 `ArrayList` |
| 중복을 없애고 포함 여부를 확인 | `Set` · 순서가 필요 없으면 `HashSet` |
| 키로 값을 저장하고 조회 | `Map` · 순서가 필요 없으면 `HashMap` |
| 먼저 들어온 작업부터 처리 | `Deque` · 보통 `ArrayDeque`의 뒤에 넣고 앞에서 꺼냄 |
| 나중에 들어온 작업부터 처리 | `Deque` · 보통 `ArrayDeque`를 스택으로 사용 |

컬렉션을 고를 때는 자주 하는 연산의 비용도 함께 봅니다.
비용은 인터페이스 이름 하나로 정해지지 않고 어떤 구현체에서 어느 연산을 하는지에 따라 달라집니다.
`O(1)`은 원소가 늘어도 작업량이 대체로 일정한 모양이고 `O(n)`은 원소 수에 비례해 작업량이 늘어나는 모양입니다.
상환(amortized) `O(1)`은 가끔 큰 작업이 있어도 여러 번의 작업을 평균하면 한 번당 일정한 비용이라는 뜻입니다.

| 구현체와 연산 | 일반적인 비용 | 필요한 조건이나 이유 |
| --- | --- | --- |
| `ArrayList.get(index)` | `O(1)` | 인덱스로 위치에 바로 접근합니다 |
| `ArrayList` 맨 뒤 추가 | 상환 `O(1)` | 가끔 내부 배열을 늘리는 작업이 있습니다 |
| `ArrayList` 중간 삽입·삭제 | `O(n)` | 뒤쪽 원소를 옮길 수 있습니다 |
| `HashSet.add` · `contains` · `remove` | `O(1)` | 해시 함수가 원소를 버킷에 고르게 나눈다는 조건이 필요합니다 |
| `HashMap.get` · `put` | `O(1)` | 해시 함수가 키를 버킷에 고르게 나눈다는 조건이 필요합니다 |
| `ArrayDeque` 양 끝 작업 | 대부분 상환 `O(1)` | 가끔 크기를 늘리는 작업이 있습니다 |
| `ArrayDeque.contains` | `O(n)` | 찾는 값을 만날 때까지 순회할 수 있습니다 |

예를 들어 `ArrayList`의 `get`은 `O(1)`이지만 `remove(0)`은 뒤 원소를 모두 앞으로 옮길 수 있어 `O(n)`입니다.
`HashSet`과 `HashMap`을 전체 순회하는 비용은 저장된 값의 수뿐 아니라 내부 버킷 용량의 영향도 받습니다.
성능이 중요한 선택은 실제 데이터 크기와 자주 하는 연산으로 측정해 확인합니다.

## 정리

- `List`는 순서와 중복을 유지하며 `size()`가 현재 원소 수이고 숫자 목록의 `remove`는 인수가 `int`인지 `Integer`인지로 위치 삭제와 값 삭제가 갈립니다.
- `Set`은 같은 값을 한 번만 남기고 `Map`은 같은 키의 값을 바꾸며 Hash 계열은 `equals`·`hashCode`를 쓰고 순서는 구현체가 정합니다.
- `Deque`는 뒤에 넣고 앞에서 꺼내면 큐이고 같은 쪽에서 넣고 꺼내면 스택이며 컬렉션은 필요한 규칙과 자주 하는 연산의 비용으로 고릅니다.

## 이어서 연습하기

아래 객관식 문제에서 각 컬렉션을 고른 이유를 확인해 보세요.

다음 개념: [예외 처리와 자원 정리](#/learn/java/wiki-exceptions)

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

순서·중복·키 조회·양 끝 처리 가운데 필요한 규칙을 먼저 정하고 `List`·`Set`·`Map`·`Deque`를 고릅니다.
`List`는 순서와 중복을 유지하며 준비한 용량은 원소 수가 아니고 `List<Integer>`의 `remove`는 `int` 인수면 위치를 `Integer` 인수면 같은 값을 지웁니다.
같은 값을 한 번만 세려면 `Set`을 쓰고 키별 값을 갱신하려면 `Map`을 쓰며 Hash 계열은 `equals`·`hashCode` 계약을 따르고 넣은 순서는 LinkedHash 계열이 정렬 순서는 Tree 계열이 지킵니다.
먼저 넣은 값을 먼저 처리하려면 `offerLast`로 넣고 `pollFirst`로 꺼내며 빈 상태를 값으로 받으려면 poll·peek 계열을 예외로 받으려면 remove·get 계열을 씁니다.
비용은 구현체와 연산을 함께 보아 `ArrayList.get`은 `O(1)`이고 중간 삭제는 `O(n)`이며 해시 조회의 `O(1)`은 고른 분산을 전제로 합니다.
