# 우선순위 큐와 힙: 가장 급한 값부터 꺼내기

## 학습 목표

- 최소 힙이 배열에 저장되는 모양과 값을 넣고 꺼낼 때 `O(log n)`만큼 자리를 바꾸는 과정을 설명할 수 있습니다.
- `PriorityQueue`로 최소 힙과 최대 힙을 만들고 작업 스케줄과 k번째 값 찾기 문제에 적용할 수 있습니다.

## 한줄 요약

우선순위 큐는 우선순위가 가장 높은 값부터 꺼내는 큐이고 Java의 `PriorityQueue`는 이를 최소 힙으로 구현해 넣기와 꺼내기를 `O(log n)`에 처리합니다.

## 먼저 확인할 개념

[배열](#/learn/algorithm/array) · [큐: 먼저 온 순서대로 꺼내는 자료구조](#/learn/algorithm/queue) · [트리: 부모와 자식으로 이어진 구조](#/learn/algorithm/tree-basics)

## 우선순위 큐란

**우선순위 큐**는 들어온 순서와 상관없이 우선순위가 가장 높은 값을 먼저 꺼내는 큐입니다.
[Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 본 인쇄 대기열은 먼저 온 작업부터 처리했습니다.
그런데 실제 일에는 늦게 들어와도 먼저 처리해야 하는 급한 작업이 있습니다.

예를 들어 오늘 할 일 목록에 작업마다 우선순위 번호를 붙였다고 해 보겠습니다.
번호가 작을수록 급한 작업입니다.
이 문서는 우선순위가 5·2·7·1·4인 작업 다섯 개와 나중에 들어오는 3번 작업 하나로 끝까지 설명합니다.

| 작업 | 기획서 | 발표 | 코드 리뷰 | 회의록 | 테스트 | 버그 수정 (나중에 들어옴) |
| --- | --- | --- | --- | --- | --- | --- |
| 우선순위 | 5 | 2 | 7 | 1 | 4 | 3 |

매번 가장 작은 번호를 찾으려고 목록 전체를 훑으면 한 번 꺼낼 때마다 `O(n)`이 걸립니다.
목록을 정렬해 두는 방법도 있지만 새 작업이 들어올 때마다 알맞은 자리를 찾아 끼워 넣어야 해서 넣을 때마다 `O(n)`이 걸립니다.
우선순위 큐는 이 두 일을 모두 `O(log n)`에 처리하는데 그 비결이 **힙**이라는 자료구조입니다.

## 힙이란

**힙**은 부모가 항상 자식보다 작거나 같도록 값을 놓은 완전 이진 트리입니다.
이렇게 부모가 더 작은 힙을 **최소 힙**이라고 하고 반대로 부모가 더 큰 힙을 **최대 힙**이라고 합니다.

앞의 [트리](#/learn/algorithm/tree-basics) 문서에서 부모와 자식으로 이어진 구조와 자식이 최대 두 개인 이진 트리를 배웠습니다.
**완전 이진 트리**는 그 이진 트리를 위층부터 채우고 같은 층에서는 왼쪽부터 빈칸 없이 채운 모양입니다.
힙은 이 모양을 지키면서 값의 크기 규칙 하나를 더한 트리입니다.

작업 다섯 개의 우선순위를 최소 힙에 넣으면 다음과 같은 모양이 됩니다.

![최소 힙. 맨 위에 1이 있고 그 아래 2와 7이 있으며 2 아래에 5와 4가 있다. 오른쪽에는 같은 힙을 배열에 담은 1·2·7·5·4가 0번부터 4번 칸에 들어 있고 i번 칸의 자식은 2i+1번과 2i+2번이며 부모는 (i-1)/2번이라고 적혀 있다.](content/assets/algorithm/heap-array.png)

부모가 자식보다 작다는 규칙을 따라 위로 올라가면 맨 위에는 늘 가장 작은 값이 옵니다.
그래서 가장 급한 작업을 찾을 때는 맨 위 하나만 보면 됩니다.
다만 형제끼리나 다른 갈래끼리는 크기 규칙이 없습니다.
그림에서 `7`이 `5`와 `4`보다 위에 있는 것처럼 힙 전체가 정렬되어 있는 것은 아닙니다.

완전 이진 트리는 빈칸 없이 채우기 때문에 배열에 한 줄로 담을 수 있습니다.
위층부터 왼쪽에서 오른쪽으로 읽은 순서대로 0번 칸부터 넣으면 됩니다.

| 찾을 칸 | 계산 | 예: 1번 칸의 `2` |
| --- | --- | --- |
| 왼쪽 자식 | `2 × i + 1` | 3번 칸의 `5` |
| 오른쪽 자식 | `2 × i + 2` | 4번 칸의 `4` |
| 부모 | `(i - 1) / 2` (나머지는 버림) | 0번 칸의 `1` |

계산 한 번으로 부모와 자식 칸을 바로 찾을 수 있으니 노드를 연결하는 참조를 따로 둘 필요가 없습니다.
이제 이 배열에 값을 넣고 꺼낼 때 힙이 어떻게 규칙을 지키는지 보겠습니다.

## 힙에 값 넣기

나중에 들어온 버그 수정 작업의 우선순위 `3`을 넣어 보겠습니다.
힙은 새 값을 먼저 배열의 맨 끝 칸에 넣습니다.
완전 이진 트리의 모양을 지키려면 빈칸 없이 이어서 채워야 하기 때문입니다.

![왼쪽은 맨 끝 칸인 7의 자식 자리에 3을 넣은 모습으로 부모 7보다 작아 교환한다. 오른쪽은 3이 7과 자리를 바꿔 한 층 올라간 모습으로 부모 1보다 커서 멈춘다. 배열은 1·2·7·5·4·3에서 1·2·3·5·4·7이 된다.](content/assets/algorithm/heap-insert.png)

그런데 맨 끝에 넣은 `3`은 부모 `7`보다 작아서 규칙이 깨졌습니다.
그래서 부모와 자리를 바꿉니다.
한 층 올라간 `3`을 다시 새 부모 `1`과 비교하면 이번에는 `3`이 더 크므로 여기서 멈춥니다.

정리하면 넣기는 **맨 끝에 넣고 부모보다 작으면 위로 올리기**를 반복합니다.
최악의 경우에도 맨 아래에서 맨 위까지 한 번 올라가면 끝납니다.

## 힙에서 값 꺼내기

이번에는 가장 급한 작업을 꺼내 보겠습니다.
가장 작은 값은 맨 위에 있으니 맨 위의 `1`을 꺼냅니다.
그러면 맨 위가 비는데 이 빈자리는 배열의 맨 끝 값인 `7`로 채웁니다.
맨 끝 칸이 하나 줄어야 빈칸 없는 모양이 유지되기 때문입니다.

![세 단계 그림. 첫째 1을 꺼내고 끝의 7을 맨 위로 올린 뒤 작은 자식 2와 교환한다. 둘째 7이 한 층 내려가 작은 자식 4와 교환한다. 셋째 7에게 자식이 없어 멈추고 새 맨 위는 2다. 배열은 7·2·3·5·4에서 2·7·3·5·4를 거쳐 2·4·3·5·7이 된다.](content/assets/algorithm/heap-poll.png)

맨 위에 올라온 `7`은 자식 `2`·`3`보다 커서 규칙이 깨졌습니다.
이때는 두 자식 중 **더 작은 자식**과 자리를 바꿉니다.
더 작은 `2`가 부모가 되어야 `3`보다도 작다는 규칙이 지켜지기 때문입니다.
한 층 내려간 `7`은 다시 자식 `5`·`4` 중 작은 `4`와 자리를 바꾸고 더는 자식이 없어서 멈춥니다.

정리하면 꺼내기는 **맨 위를 꺼내고 맨 끝 값을 올린 뒤 작은 자식보다 크면 아래로 내리기**를 반복합니다.

넣기와 꺼내기는 모두 한 갈래를 따라 한 층씩 움직입니다.
완전 이진 트리는 층마다 칸이 두 배씩 늘어나서 값이 `n`개일 때 높이가 약 `log n`입니다.
그래서 자리를 바꾸는 횟수도 최대 `log n`번입니다.

| 방법 | 새 작업 넣기 | 가장 급한 작업 꺼내기 | 가장 급한 작업 보기 |
| --- | --- | --- | --- |
| 목록 그대로 두기 | `O(1)` | `O(n)` | `O(n)` |
| 정렬된 목록 유지하기 | `O(n)` | `O(1)` | `O(1)` |
| 힙 | `O(log n)` | `O(log n)` | `O(1)` |

힙은 넣기와 꺼내기를 모두 빠르게 처리하기 때문에 넣고 꺼내는 일이 계속 섞여 일어나는 문제에 잘 맞습니다.

## Java로 우선순위 큐 쓰기

Java의 `PriorityQueue`가 바로 힙으로 만든 우선순위 큐입니다.
따로 정하지 않으면 작은 값이 먼저 나오는 최소 힙입니다.
`Queue`를 구현하므로 [Java로 큐 쓰기](#/learn/algorithm/queue-java)에서 본 `offer`·`poll`·`peek`을 그대로 씁니다.

```java
PriorityQueue<Integer> heap = new PriorityQueue<>();
for (int priority : new int[] {5, 2, 7, 1, 4}) {
    heap.offer(priority);
}
System.out.println("맨 위: " + heap.peek());
System.out.println("힙 배열: " + heap);

heap.offer(3);
System.out.println("3을 넣은 뒤: " + heap);
System.out.println("꺼낸 값: " + heap.poll());
System.out.println("꺼낸 뒤: " + heap);
```

위 그림과 같은 배열이 나올지 예상해 보세요.

```text
맨 위: 1
힙 배열: [1, 2, 7, 5, 4]
3을 넣은 뒤: [1, 2, 3, 5, 4, 7]
꺼낸 값: 1
꺼낸 뒤: [2, 4, 3, 5, 7]
```

출력은 힙이 내부에 담아 둔 배열 순서라서 그림과 똑같습니다.
여기서 눈여겨볼 점은 `[1, 2, 7, 5, 4]`가 정렬된 순서가 아니라는 것입니다.
`PriorityQueue`를 출력하거나 `for`문으로 돌면 이 배열 순서가 나옵니다.
Java 공식 문서도 이렇게 돌 때의 순서는 정해져 있지 않다고 설명합니다.
작은 순서대로 받으려면 `poll()`을 반복해야 합니다.

```java
List<Integer> order = new ArrayList<>();
while (!heap.isEmpty()) {
    order.add(heap.poll());
}
System.out.println("남은 값을 꺼낸 순서: " + order);
```

```text
남은 값을 꺼낸 순서: [2, 3, 4, 5, 7]
```

### 최대 힙과 객체의 우선순위

큰 값부터 꺼내고 싶다면 생성자에 `Comparator.reverseOrder()`를 넘겨 최대 힙을 만듭니다.
`Comparator`는 두 값 중 무엇이 앞인지 정하는 비교 규칙이고 `reverseOrder()`는 원래 순서를 뒤집은 규칙입니다.

```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
for (int priority : new int[] {5, 2, 7, 1, 4}) {
    maxHeap.offer(priority);
}
List<Integer> maxOrder = new ArrayList<>();
while (!maxHeap.isEmpty()) {
    maxOrder.add(maxHeap.poll());
}
System.out.println("최대 힙에서 꺼낸 순서: " + maxOrder);
```

같은 다섯 값을 최대 힙에 넣고 `poll()`을 반복하면 어떤 순서가 나올지 예상해 보세요.

```text
최대 힙에서 꺼낸 순서: [7, 5, 4, 2, 1]
```

실제 작업은 번호만이 아니라 이름도 함께 가지고 있습니다.
이렇게 값이 객체라면 무엇을 기준으로 비교할지 `Comparator`로 알려 줘야 합니다.
`Comparator.comparingInt(Task::priority)`는 작업의 우선순위 번호를 꺼내 작은 번호가 앞이 되게 비교하라는 뜻입니다.

```java
record Task(String name, int priority) {
}

PriorityQueue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
```

`PriorityQueue`에는 `null`을 넣을 수 없습니다.
그래서 `poll()`과 `peek()`이 `null`을 돌려주면 `ArrayDeque`와 마찬가지로 큐가 비었다는 뜻입니다.

## 우선순위 큐의 활용

코딩테스트에서 우선순위 큐를 쓰는 대표적인 장면은 두 가지입니다.

### 작업 스케줄

첫 번째는 새 일이 계속 들어오는 중에 매번 가장 급한 일을 골라 처리하는 문제입니다.
작업 다섯 개를 넣고 가장 급한 하나를 처리한 뒤 버그 수정이 새로 들어오는 장면을 코드로 옮겨 보겠습니다.

```java
tasks.offer(new Task("기획서", 5));
tasks.offer(new Task("발표", 2));
tasks.offer(new Task("코드 리뷰", 7));
tasks.offer(new Task("회의록", 1));
tasks.offer(new Task("테스트", 4));
System.out.println("오늘 할 일: " + tasks.poll().name());
tasks.offer(new Task("버그 수정", 3));
while (!tasks.isEmpty()) {
    Task task = tasks.poll();
    System.out.println("다음 할 일: " + task.name() + " (" + task.priority() + ")");
}
```

버그 수정은 가장 늦게 들어왔습니다.
몇 번째로 처리될지 예상해 보세요.

```text
오늘 할 일: 회의록
다음 할 일: 발표 (2)
다음 할 일: 버그 수정 (3)
다음 할 일: 테스트 (4)
다음 할 일: 기획서 (5)
다음 할 일: 코드 리뷰 (7)
```

버그 수정은 늦게 들어왔지만 우선순위가 3이라서 테스트·기획서·코드 리뷰보다 먼저 처리됩니다.
정렬은 처음에 한 번만 해 두면 끝이지만 이렇게 중간에 새 값이 들어오면 다시 정렬해야 합니다.
우선순위 큐는 새 값을 `O(log n)`에 넣기만 하면 되므로 이런 문제에 잘 맞습니다.

### k번째로 작은 값

두 번째는 값 가운데 k번째로 작은 값을 찾는 문제입니다.
여기서는 크기를 `k`로 제한한 **최대 힙**을 씁니다.
작은 값 `k`개만 남기고 그중 가장 큰 값을 맨 위에 두면 그 값이 바로 k번째로 작은 값이기 때문입니다.

```java
static int kthSmallest(int[] values, int k) {
    PriorityQueue<Integer> keep = new PriorityQueue<>(Comparator.reverseOrder());
    for (int value : values) {
        keep.offer(value);
        if (keep.size() > k) {
            keep.poll();
        }
    }
    return keep.peek();
}
```

작업 여섯 개의 우선순위 5·2·7·1·4·3에서 세 번째로 작은 값을 찾으면 무엇이 나올지 예상해 보세요.

```text
세 번째로 작은 값: 3
```

힙에 값이 `k`개를 넘으면 그중 가장 큰 값을 `poll()`로 버립니다.
그래서 끝까지 돌면 가장 작은 1·2·3만 남고 맨 위의 3이 답이 됩니다.
힙의 크기가 늘 `k` 이하라서 전체 비용은 `O(n log k)`이고 값이 아주 많아도 `k`개만 기억하면 됩니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `TaskPriority.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Comparator;
> import java.util.List;
> import java.util.PriorityQueue;
>
> public class TaskPriority {
>     record Task(String name, int priority) {
>     }
>
>     public static void main(String[] args) {
>         PriorityQueue<Integer> heap = new PriorityQueue<>();
>         for (int priority : new int[] {5, 2, 7, 1, 4}) {
>             heap.offer(priority);
>         }
>         System.out.println("맨 위: " + heap.peek());
>         System.out.println("힙 배열: " + heap);
>
>         heap.offer(3);
>         System.out.println("3을 넣은 뒤: " + heap);
>         System.out.println("꺼낸 값: " + heap.poll());
>         System.out.println("꺼낸 뒤: " + heap);
>
>         List<Integer> order = new ArrayList<>();
>         while (!heap.isEmpty()) {
>             order.add(heap.poll());
>         }
>         System.out.println("남은 값을 꺼낸 순서: " + order);
>
>         PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
>         for (int priority : new int[] {5, 2, 7, 1, 4}) {
>             maxHeap.offer(priority);
>         }
>         List<Integer> maxOrder = new ArrayList<>();
>         while (!maxHeap.isEmpty()) {
>             maxOrder.add(maxHeap.poll());
>         }
>         System.out.println("최대 힙에서 꺼낸 순서: " + maxOrder);
>
>         PriorityQueue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
>         tasks.offer(new Task("기획서", 5));
>         tasks.offer(new Task("발표", 2));
>         tasks.offer(new Task("코드 리뷰", 7));
>         tasks.offer(new Task("회의록", 1));
>         tasks.offer(new Task("테스트", 4));
>         System.out.println("오늘 할 일: " + tasks.poll().name());
>         tasks.offer(new Task("버그 수정", 3));
>         while (!tasks.isEmpty()) {
>             Task task = tasks.poll();
>             System.out.println("다음 할 일: " + task.name() + " (" + task.priority() + ")");
>         }
>
>         System.out.println("세 번째로 작은 값: " + kthSmallest(new int[] {5, 2, 7, 1, 4, 3}, 3));
>     }
>
>     static int kthSmallest(int[] values, int k) {
>         PriorityQueue<Integer> keep = new PriorityQueue<>(Comparator.reverseOrder());
>         for (int value : values) {
>             keep.offer(value);
>             if (keep.size() > k) {
>                 keep.poll();
>             }
>         }
>         return keep.peek();
>     }
> }
> ```
>
> ```text
> 맨 위: 1
> 힙 배열: [1, 2, 7, 5, 4]
> 3을 넣은 뒤: [1, 2, 3, 5, 4, 7]
> 꺼낸 값: 1
> 꺼낸 뒤: [2, 4, 3, 5, 7]
> 남은 값을 꺼낸 순서: [2, 3, 4, 5, 7]
> 최대 힙에서 꺼낸 순서: [7, 5, 4, 2, 1]
> 오늘 할 일: 회의록
> 다음 할 일: 발표 (2)
> 다음 할 일: 버그 수정 (3)
> 다음 할 일: 테스트 (4)
> 다음 할 일: 기획서 (5)
> 다음 할 일: 코드 리뷰 (7)
> 세 번째로 작은 값: 3
> ```

## 정리

- 힙은 부모가 자식보다 작거나 같은 완전 이진 트리라서 맨 위에 늘 가장 작은 값이 있고 배열 한 줄에 담을 수 있습니다.
- 넣기는 맨 끝에 넣고 위로 올리며 꺼내기는 맨 끝 값을 맨 위로 옮긴 뒤 아래로 내리고 둘 다 `O(log n)`입니다.
- `PriorityQueue`는 기본이 최소 힙이고 `Comparator.reverseOrder()`를 넘기면 최대 힙이 됩니다.
- 출력이나 `for`문의 순서는 정렬 순서가 아니므로 작은 순서대로 받으려면 `poll()`을 반복합니다.

## 이어서 연습하기

[그리디](#/learn/algorithm/heap-and-greedy)에서 매 순간 가장 좋은 값을 고를 때 우선순위 큐를 다시 만납니다.
[가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra)에서는 가장 가까운 지점부터 꺼내는 데 우선순위 큐를 씁니다.

## 공식 자료

- [Java 25 API: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)
- [Java 25 API: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)

## 핵심 질문 답

값이 계속 들어오는 중에 매번 가장 작은 값을 꺼내야 한다면 힙으로 만든 우선순위 큐를 씁니다.
힙은 부모가 자식보다 작거나 같은 완전 이진 트리라서 가장 작은 값이 늘 맨 위에 있고 배열 한 줄에 담깁니다.
새 값은 맨 끝에 넣고 부모보다 작으면 위로 올리며 꺼낼 때는 맨 끝 값을 맨 위로 옮긴 뒤 작은 자식과 바꾸며 아래로 내립니다.
두 일 모두 트리의 높이만큼만 움직이므로 `O(log n)`이고 Java에서는 `PriorityQueue`로 최소 힙을 만들고 `Comparator.reverseOrder()`로 최대 힙을 만듭니다.
