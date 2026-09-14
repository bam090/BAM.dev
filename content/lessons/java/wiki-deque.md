# Deque로 큐와 스택 사용하기

## 학습 목표

필요한 처리 순서와 빈 상태에 맞게 Deque의 넣고 꺼내는 연산을 선택할 수 있습니다.

## 한줄 요약

Deque는 양 끝을 사용해 FIFO와 LIFO를 표현하며 빈 상태를 값으로 받을지 예외로 받을지 구분합니다.

## 먼저 확인할 개념

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics) · [조건과 반복](#/learn/java/wiki-control-flow)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

다음 문장 예제는 Java 25의 main 같은 메서드 안에 두고, 사용하는 소스 파일의 클래스 선언 앞에는 아래 import를 둡니다. 독립 예제의 같은 변수 이름을 한 블록에 겹쳐 선언하지 않습니다.

```java
import java.util.Deque;
import java.util.ArrayDeque;
```

## `Deque`는 앞과 뒤에서 넣고 뺀다

`Deque`는 **double-ended queue**의 줄임말이며 앞과 뒤 양쪽에서 원소를 넣고 뺄 수 있다.

먼저 들어온 작업을 먼저 처리하는 큐인 FIFO(First-In, First-Out)로 사용할 때는 뒤에 넣고 앞에서 꺼낼 수 있다.

```java
Deque<String> waiting = new ArrayDeque<>();

waiting.offerLast("첫 번째 복습");
waiting.offerLast("두 번째 복습");

System.out.println(waiting.pollFirst()); // 첫 번째 복습
```

나중에 들어온 값을 먼저 꺼내는 스택인 LIFO(Last-In, First-Out)로 사용할 때는 `push()`, `pop()`, `peek()`를 사용할 수 있다.
새 코드에서 스택이나 일반 큐가 필요하면 오래된 `Stack` 클래스보다 `Deque`와 `ArrayDeque`를 먼저 검토한다.

`offerFirst/offerLast`, `pollFirst/pollLast`, `peekFirst/peekLast` 계열은 작업을 수행할 수 없을 때 특별한 값을 반환한다.
이에 대응하는 `addFirst/addLast`, `removeFirst/removeLast`, `getFirst/getLast` 계열은 예외를 던진다.
`ArrayDeque`는 `null` 원소를 허용하지 않으므로 `poll()`이 반환한 `null`을 비어 있다는 뜻으로 구분할 수 있다.

## 비어 있는 큐는 정상적인 상태일 수 있다

반복해서 대기 작업을 꺼내는 기능에서는 목록이 비는 순간이 자연스럽다.
`pollFirst()`의 반환이 null이면 처리할 항목이 없다고 판단할 수 있다.
항목을 확인만 하는 `peekFirst()`는 꺼내지 않으므로 다음 처리 순서를 바꾸지 않는다.
반대로 반드시 값이 있어야 하는 코드에서 비어 있는 상황을 예외로 드러내려면 removeFirst의 계약을 선택한다.
ArrayDeque에는 null 자체를 넣을 수 없으므로 실제 원소 null과 빈 상태가 섞이지 않는다.


## 이어서 연습하기

[컬렉션 선택: 보관 규칙과 연산 비용](#/learn/java/wiki-collection-choice)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

먼저 넣은 값을 먼저 처리하는 FIFO는 offerLast로 뒤에 넣고 pollFirst로 앞에서 꺼냅니다. 나중에 넣은 값을 먼저 꺼내는 LIFO는 같은 쪽에 push/pop합니다. 비어 있을 때 값을 돌려받으려면 poll/peek 계열을, 예외 계약이 필요하면 remove/get 계열을 구분합니다. ArrayDeque는 null 원소를 허용하지 않아 null 반환을 빈 상태로 읽을 수 있습니다.
