# 큐: 먼저 온 순서대로 꺼내는 자료구조

## 학습 목표

- 큐의 FIFO 순서와 offer·poll·peek이 하는 일을 설명하고 같은 입력에서 스택과 꺼내는 순서가 어떻게 다른지 비교할 수 있습니다.
- 대기열 처리나 너비 우선 탐색처럼 먼저 들어온 것부터 처리해야 하는 문제에서 큐를 떠올릴 수 있습니다.

## 한줄 요약

큐는 먼저 넣은 값을 먼저 꺼내는 FIFO 자료구조이고 뒤에 넣고 앞에서 꺼내기 때문에 들어온 순서대로 처리해야 하는 대기열과 BFS에 씁니다.

## 먼저 확인할 개념

[자료구조와 알고리즘](#/learn/algorithm/data-structures-and-algorithms) · [스택](#/learn/algorithm/stack-and-queue)

## 큐란

**큐**는 먼저 넣은 값을 먼저 꺼내는 자료구조입니다.
이 규칙을 영어로 First In First Out이라고 하고 줄여서 **FIFO**라고 부릅니다.
들어온 순서를 그대로 지켜서 처리해야 하는 일이 많기 때문에 큐는 스택과 함께 가장 기본이 되는 자료구조로 꼽힙니다.

예를 들어 카페 계산대 앞의 줄을 떠올려 보세요.
먼저 줄을 선 손님이 먼저 주문하고 새로 온 손님은 줄 맨 뒤에 섭니다.
이 문서는 민지·도윤·서아가 차례로 줄을 서고 나중에 하준이 도착하는 장면 하나로 끝까지 설명합니다.

![민지·도윤·서아가 한 줄로 서 있다. 맨 앞 민지 쪽은 poll로 앞에서 꺼내는 쪽이고 맨 뒤 서아 쪽으로 새로 온 하준이 offer로 들어온다. 맨 앞 위에는 peek이 앞을 보기만 한다고 적혀 있다.](content/assets/algorithm/queue-front-rear.png)

줄에서 값이 나가는 쪽을 **앞(front)**이라고 하고 값이 들어오는 쪽을 **뒤(rear)**라고 합니다.
큐는 넣는 곳과 꺼내는 곳이 서로 반대편에 있습니다.
그래서 먼저 들어온 값이 늘 앞쪽에 모이고 가장 오래 기다린 값부터 나갑니다.

> [!question]- front·rear와 head·tail은 같은 뜻인가요?
> 같은 자리를 부르는 다른 이름입니다.
> Java 공식 문서는 값이 나가는 앞을 **head**라고 하고 값이 들어오는 뒤를 **tail**이라고 부릅니다.
> 자료마다 front·rear와 head·tail을 섞어 쓰니 둘 다 알아 두면 문서를 읽기 편합니다.

## 큐의 종류

카페 줄처럼 한쪽으로 넣고 반대쪽으로 꺼내는 큐를 기본 큐라고 합니다.
이 기본 규칙을 조금씩 바꾼 큐도 있습니다.

| 종류 | 규칙 | 쓰는 곳 |
| --- | --- | --- |
| 기본 큐 | 뒤에 넣고 앞에서 꺼냅니다 | 대기열·너비 우선 탐색 |
| 원형 큐 | 배열의 끝과 처음을 이어 붙여 앞에서 비운 칸을 다시 씁니다 | 크기가 정해진 대기열을 배열로 직접 만들기 |
| 덱 (Deque) | 앞과 뒤 양쪽에서 넣고 꺼낼 수 있습니다 | 큐와 스택을 한 도구로 쓰기 |
| 우선순위 큐 | 들어온 순서가 아니라 우선순위가 높은 값부터 꺼냅니다 | 가장 급한 작업 먼저 처리하기 |

이 문서는 기본 큐를 다룹니다.
뒤에서 쓰는 Java의 `ArrayDeque`는 이름 그대로 덱이라서 큐로도 스택으로도 쓸 수 있습니다.
우선순위 큐는 [우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 자세히 다룹니다.

이제 기본 큐가 하는 일을 연산별로 살펴보겠습니다.

## 큐의 연산

기본 큐가 하는 일은 세 가지로 정리됩니다.

| 연산 | 하는 일 | 카페 줄에서 |
| --- | --- | --- |
| `offer` | 뒤에 값을 넣습니다 | 새 손님이 줄 맨 뒤에 섭니다 |
| `poll` | 앞의 값을 꺼내고 줄에서 지웁니다 | 맨 앞 손님이 주문하고 줄을 떠납니다 |
| `peek` | 앞의 값을 보기만 하고 지우지 않습니다 | 다음 손님이 누구인지 확인만 합니다 |

`poll`과 `peek`은 둘 다 맨 앞 값을 돌려줍니다.
다른 점은 `poll`은 그 값을 줄에서 빼고 `peek`은 그대로 둔다는 것입니다.

연산을 하나씩 실행하면서 줄이 어떻게 바뀌는지 따라가 보겠습니다.

![연산마다 바뀌는 큐. offer로 민지·도윤·서아가 차례로 뒤에 붙고 peek은 민지를 보기만 한다. poll은 민지를 꺼내 줄이 도윤·서아가 되고 offer로 하준이 도윤·서아 뒤에 붙는다.](content/assets/algorithm/queue-steps.png)

`peek()`을 한 뒤에도 줄은 그대로입니다.
반면 `poll()`을 하면 민지가 빠지고 도윤이 새 맨 앞이 됩니다.
하준은 줄 중간에 끼어들지 못하고 서아 뒤에 섭니다.

이 흐름을 코드로 옮기면 다음과 같습니다.
Java에서 큐를 쓰는 자세한 방법은 [Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 알아보고 여기서는 동작만 확인합니다.

```java
Queue<String> line = new ArrayDeque<>();
line.offer("민지");
line.offer("도윤");
line.offer("서아");
System.out.println("줄: " + line);

System.out.println("맨 앞 확인: " + line.peek());
System.out.println("주문 받음: " + line.poll());
System.out.println("남은 줄: " + line);

line.offer("하준");
System.out.println("하준 도착: " + line);
```

실행하기 전에 `peek()`과 `poll()`이 각각 누구를 돌려줄지 예상해 보세요.

```text
줄: [민지, 도윤, 서아]
맨 앞 확인: 민지
주문 받음: 민지
남은 줄: [도윤, 서아]
하준 도착: [도윤, 서아, 하준]
```

줄을 출력하면 왼쪽이 앞이고 오른쪽이 뒤입니다.
`peek()`과 `poll()`은 둘 다 민지를 돌려주지만 `poll()` 뒤에만 민지가 줄에서 사라졌습니다.

## 빈 큐

줄에 아무도 없을 때 꺼내려고 하면 어떻게 될까요?
꺼낼 값이 없으니 큐는 비어 있다는 사실을 어떤 방법으로든 알려 줘야 합니다.

알리는 방법은 두 가지입니다.
하나는 오류를 내서 알리는 방법이고 다른 하나는 값이 없다는 뜻의 특별한 값을 돌려주는 방법입니다.
Java의 `poll()`은 두 번째 방법을 써서 `null`을 돌려줍니다.

```java
while (!line.isEmpty()) {
    System.out.println("주문 받음: " + line.poll());
}
System.out.println("빈 줄에서 꺼내기: " + line.poll());
```

```text
주문 받음: 도윤
주문 받음: 서아
주문 받음: 하준
빈 줄에서 꺼내기: null
```

`isEmpty()`는 큐가 비었는지 확인합니다.
그래서 `while (!line.isEmpty())`는 줄이 빌 때까지 앞에서부터 한 명씩 꺼내는 반복입니다.
큐를 쓰는 코드는 대부분 이 모양으로 반복하기 때문에 빈 큐를 먼저 확인하는 습관이 중요합니다.

오류를 내는 방법은 `remove()` 같은 다른 메서드가 맡습니다.
두 방법의 차이는 [Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 표로 비교합니다.

## 큐와 스택의 비교

[스택](#/learn/algorithm/stack-and-queue)은 큐와 반대로 나중에 넣은 값을 먼저 꺼냅니다.
두 자료구조에 같은 이름을 같은 순서로 넣고 꺼내는 순서를 비교해 보겠습니다.

![왼쪽 큐는 민지·도윤·서아를 뒤에 넣고 앞에서 꺼내 민지·도윤·서아 순서로 나온다. 오른쪽 스택은 같은 순서로 넣지만 맨 위에서 넣고 꺼내므로 서아·도윤·민지 순서로 나온다.](content/assets/algorithm/queue-vs-stack.png)

```java
Queue<String> queue = new ArrayDeque<>();
Deque<String> stack = new ArrayDeque<>();
for (String name : new String[] {"민지", "도윤", "서아"}) {
    queue.offer(name);
    stack.push(name);
}

List<String> fromQueue = new ArrayList<>();
while (!queue.isEmpty()) {
    fromQueue.add(queue.poll());
}
List<String> fromStack = new ArrayList<>();
while (!stack.isEmpty()) {
    fromStack.add(stack.pop());
}
System.out.println("큐에서 꺼낸 순서: " + fromQueue);
System.out.println("스택에서 꺼낸 순서: " + fromStack);
```

두 자료구조에서 하나씩 꺼내면 어떤 순서가 나올지 예상해 보세요.

```text
큐에서 꺼낸 순서: [민지, 도윤, 서아]
스택에서 꺼낸 순서: [서아, 도윤, 민지]
```

넣은 순서는 같은데 꺼낸 순서는 정반대입니다.
큐는 넣는 곳과 꺼내는 곳이 달라서 들어온 순서가 그대로 유지됩니다.
반면 스택은 한쪽 끝에서만 넣고 꺼내기 때문에 들어온 순서가 뒤집힙니다.

| | 큐 | 스택 |
| --- | --- | --- |
| 꺼내는 규칙 | 먼저 넣은 것부터 (FIFO) | 나중에 넣은 것부터 (LIFO) |
| 넣는 곳과 꺼내는 곳 | 뒤에 넣고 앞에서 꺼냅니다 | 맨 위에서 넣고 꺼냅니다 |
| 먼저 나오는 값 | 가장 오래 기다린 값 | 가장 최근에 넣은 값 |
| 잘 맞는 문제 | 대기열·너비 우선 탐색 | 괄호 검사·실행 취소·깊이 우선 탐색 |

문제를 읽다가 둘 중 무엇을 써야 할지 헷갈리면 값 세 개를 직접 넣어 보세요.
다음에 처리할 값이 가장 먼저 넣은 값이라면 큐이고 가장 나중에 넣은 값이라면 스택입니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `CafeQueue.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayDeque;
> import java.util.ArrayList;
> import java.util.Deque;
> import java.util.List;
> import java.util.Queue;
>
> public class CafeQueue {
>     public static void main(String[] args) {
>         Queue<String> line = new ArrayDeque<>();
>         line.offer("민지");
>         line.offer("도윤");
>         line.offer("서아");
>         System.out.println("줄: " + line);
>
>         System.out.println("맨 앞 확인: " + line.peek());
>         System.out.println("주문 받음: " + line.poll());
>         System.out.println("남은 줄: " + line);
>
>         line.offer("하준");
>         System.out.println("하준 도착: " + line);
>
>         while (!line.isEmpty()) {
>             System.out.println("주문 받음: " + line.poll());
>         }
>         System.out.println("빈 줄에서 꺼내기: " + line.poll());
>
>         Queue<String> queue = new ArrayDeque<>();
>         Deque<String> stack = new ArrayDeque<>();
>         for (String name : new String[] {"민지", "도윤", "서아"}) {
>             queue.offer(name);
>             stack.push(name);
>         }
>
>         List<String> fromQueue = new ArrayList<>();
>         while (!queue.isEmpty()) {
>             fromQueue.add(queue.poll());
>         }
>         List<String> fromStack = new ArrayList<>();
>         while (!stack.isEmpty()) {
>             fromStack.add(stack.pop());
>         }
>         System.out.println("큐에서 꺼낸 순서: " + fromQueue);
>         System.out.println("스택에서 꺼낸 순서: " + fromStack);
>     }
> }
> ```
>
> ```text
> 줄: [민지, 도윤, 서아]
> 맨 앞 확인: 민지
> 주문 받음: 민지
> 남은 줄: [도윤, 서아]
> 하준 도착: [도윤, 서아, 하준]
> 주문 받음: 도윤
> 주문 받음: 서아
> 주문 받음: 하준
> 빈 줄에서 꺼내기: null
> 큐에서 꺼낸 순서: [민지, 도윤, 서아]
> 스택에서 꺼낸 순서: [서아, 도윤, 민지]
> ```

## 큐의 활용

그렇다면 코딩테스트에서는 언제 큐를 떠올려야 할까요?
단서는 먼저 들어온 것이나 먼저 발견한 것을 먼저 처리해야 한다는 조건입니다.

첫 번째는 **대기열**입니다.
주문·인쇄 작업·서버 요청처럼 도착한 순서대로 처리하는 문제는 큐에 넣고 앞에서부터 꺼내면 됩니다.
처리하는 도중에 새 일이 생겨도 큐 뒤에 넣기만 하면 순서가 저절로 지켜집니다.
꺼낸 일을 다시 뒤에 넣으면 여러 일을 돌아가며 조금씩 처리할 수도 있는데 이 방법은 [Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 만들어 봅니다.

두 번째는 **너비 우선 탐색(BFS)**입니다.
BFS는 출발점에서 가까운 곳부터 차례로 방문하는 탐색입니다.
새로 발견한 곳을 큐 뒤에 넣고 앞에서부터 꺼내 방문하면 먼저 발견한 가까운 곳이 먼저 처리됩니다.
[트리](#/learn/algorithm/tree-basics)의 레벨 순회와 [그래프 탐색](#/learn/algorithm/bfs-dfs-graph-grid)에서 이 방법을 그대로 씁니다.

## 정리

- 큐는 먼저 넣은 값을 먼저 꺼내는 FIFO 자료구조입니다.
- `offer`는 뒤에 넣고 `poll`은 앞에서 꺼내며 `peek`은 앞을 보기만 합니다.
- 빈 큐에서 `poll()`은 `null`을 돌려주므로 반복할 때는 `isEmpty()`로 먼저 확인합니다.
- 같은 입력을 넣으면 큐는 넣은 순서대로 꺼내고 스택은 거꾸로 꺼냅니다.

## 이어서 연습하기

[Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 `Queue`와 `ArrayDeque`를 자세히 써 봅니다.
[검수 순서에서 낮은 점수 빼기](#/coding-tests/java/bridge-que-02)에서 큐로 차례를 처리해 봅니다.
[주문의 수령 회차 정하기](#/coding-tests/java/bridge-que-03)와 [두 검사대에서 시료 꺼내기](#/coding-tests/java/bridge-que-04)도 이어서 풀어 봅니다.

## 공식 자료

- [Java 25 API: Queue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Queue.html)
- [Java 25 API: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)

## 핵심 질문 답

큐는 먼저 넣은 값을 먼저 꺼내는 FIFO 규칙을 따릅니다.
값은 `offer`로 뒤에 넣고 `poll`로 앞에서 꺼내며 `peek`으로는 앞의 값을 지우지 않고 확인합니다.
넣는 곳과 꺼내는 곳이 반대편에 있어서 들어온 순서가 그대로 지켜지고 같은 입력을 스택에 넣으면 꺼내는 순서가 거꾸로 됩니다.
그래서 도착한 순서대로 처리하는 대기열과 가까운 곳부터 방문하는 BFS에 큐를 씁니다.
