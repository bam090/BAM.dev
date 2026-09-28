# Java로 큐 쓰기: Queue와 ArrayDeque

## 학습 목표

- `Queue`와 `ArrayDeque`로 큐를 만들고 빈 큐에서 예외를 던지는 메서드와 특별한 값을 돌려주는 메서드를 구분해 쓸 수 있습니다.

## 한줄 요약

Java에서는 `Queue` 인터페이스 변수에 `ArrayDeque` 객체를 담아 큐를 만들고 `offer`·`poll`·`peek`으로 넣고 꺼내고 확인합니다.

## 먼저 확인할 개념

[큐: 먼저 온 순서대로 꺼내는 자료구조](#/learn/algorithm/queue) · [추상 클래스와 인터페이스의 역할](#/learn/java/wiki-abstract-interfaces)

## Queue와 ArrayDeque

**`Queue`**는 큐가 가져야 할 메서드를 정해 둔 Java의 인터페이스이고 **`ArrayDeque`**는 그 메서드를 실제로 구현한 클래스입니다.
앞 문서에서는 카페 줄로 큐가 먼저 넣은 값을 먼저 꺼낸다는 것을 확인했습니다.
이번에는 Java에서 큐를 만들고 다루는 방법을 프린터의 인쇄 대기열 하나로 알아보겠습니다.

인터페이스는 무엇을 할 수 있는지만 정하고 어떻게 할지는 정하지 않습니다.
그래서 `new Queue<>()`처럼 인터페이스로는 객체를 만들 수 없고 구현 클래스가 필요합니다.
보통은 변수 타입을 `Queue`로 두고 오른쪽에 `ArrayDeque`를 씁니다.

```java
Queue<String> jobs = new ArrayDeque<>();
jobs.offer("보고서");
jobs.offer("사진");
jobs.offer("과제");
System.out.println("대기열: " + jobs);
System.out.println("다음 작업: " + jobs.peek());
System.out.println("인쇄 시작: " + jobs.poll());
System.out.println("남은 대기열: " + jobs);
```

`peek()`과 `poll()`이 무엇을 돌려주고 대기열이 어떻게 남을지 예상해 보세요.

```text
대기열: [보고서, 사진, 과제]
다음 작업: 보고서
인쇄 시작: 보고서
남은 대기열: [사진, 과제]
```

가장 먼저 넣은 보고서가 가장 먼저 인쇄됩니다.
변수 타입을 `Queue`로 두었기 때문에 이 변수로는 큐의 메서드만 쓸 수 있습니다.
덕분에 코드를 읽는 사람도 이 변수가 큐로 쓰인다는 것을 바로 알 수 있습니다.

## Queue의 메서드

`Queue`에는 넣기·꺼내기·보기마다 메서드가 두 개씩 있습니다.
두 메서드는 하는 일이 같고 **할 수 없을 때 알리는 방법**만 다릅니다.

![인쇄 대기열의 앞(head)에서 꺼내는 remove·poll과 앞을 보기만 하는 element·peek이 있고 뒤(tail)에 넣는 add·offer가 있다. 빨간 이름은 할 수 없으면 예외를 던지고 파란 이름은 특별한 값을 돌려준다.](content/assets/algorithm/queue-java-methods.png)

| 할 일 | 할 수 없으면 예외를 던짐 | 할 수 없으면 특별한 값을 돌려줌 |
| --- | --- | --- |
| 뒤에 넣기 | `add(e)` | `offer(e)` → `false` |
| 앞에서 꺼내기 | `remove()` | `poll()` → `null` |
| 앞을 보기 | `element()` | `peek()` → `null` |

꺼내기와 보기를 할 수 없는 경우는 큐가 비어 있을 때입니다.
빈 대기열로 두 방법을 비교해 보겠습니다.

```java
Queue<String> empty = new ArrayDeque<>();
System.out.println("poll(): " + empty.poll());
System.out.println("peek(): " + empty.peek());
try {
    empty.remove();
} catch (NoSuchElementException e) {
    System.out.println("remove(): NoSuchElementException");
}
try {
    empty.element();
} catch (NoSuchElementException e) {
    System.out.println("element(): NoSuchElementException");
}
```

빈 대기열에서 네 메서드가 각각 어떻게 반응할지 예상해 보세요.

```text
poll(): null
peek(): null
remove(): NoSuchElementException
element(): NoSuchElementException
```

`poll()`과 `peek()`은 조용히 `null`을 돌려주고 `remove()`와 `element()`는 예외를 던집니다.
그래서 큐가 비는 일이 자연스러운 반복에서는 `poll()`을 쓰고 비어 있으면 안 되는 곳에서는 `remove()`로 잘못을 바로 드러냅니다.

넣기를 할 수 없는 경우는 크기가 정해진 큐가 가득 찼을 때입니다.
`ArrayDeque`는 필요하면 스스로 커지기 때문에 가득 차는 일이 없습니다.
크기를 정해 두는 `ArrayBlockingQueue`에 칸 두 개를 주고 세 번째 작업을 넣어 보면 차이가 보입니다.

```java
Queue<String> tray = new ArrayBlockingQueue<>(2);
tray.offer("보고서");
tray.offer("사진");
System.out.println("offer(): " + tray.offer("과제"));
try {
    tray.add("과제");
} catch (IllegalStateException e) {
    System.out.println("add(): IllegalStateException");
}
```

칸이 모두 찬 상태에서 `offer()`와 `add()`가 어떻게 다를지 예상해 보세요.

```text
offer(): false
add(): IllegalStateException
```

`offer()`는 넣지 못했다는 뜻으로 `false`를 돌려주고 `add()`는 예외를 던집니다.
코딩테스트에서는 크기가 정해진 큐를 쓸 일이 드물어서 보통 `offer`·`poll`·`peek` 세 개로 충분합니다.

## ArrayDeque와 LinkedList

`LinkedList`도 `Queue`를 구현하기 때문에 `Queue<String> jobs = new LinkedList<>();`처럼 큐로 쓸 수 있습니다.
그런데 두 클래스는 `null`을 다루는 방식이 다릅니다.

```java
Queue<String> linked = new LinkedList<>();
linked.offer(null);
System.out.println("LinkedList 크기: " + linked.size());
System.out.println("LinkedList poll(): " + linked.poll());
try {
    jobs.offer(null);
} catch (NullPointerException e) {
    System.out.println("ArrayDeque offer(null): NullPointerException");
}
```

두 클래스에 `null`을 넣으면 각각 어떻게 될지 예상해 보세요.

```text
LinkedList 크기: 1
LinkedList poll(): null
ArrayDeque offer(null): NullPointerException
```

`LinkedList`는 `null`을 값으로 넣을 수 있습니다.
그래서 `poll()`이 `null`을 돌려주면 큐가 빈 것인지 `null`이라는 값을 꺼낸 것인지 구분할 수 없습니다.
반면 `ArrayDeque`는 `null`을 넣는 순간 예외를 던지므로 `poll()`의 `null`은 언제나 빈 큐라는 뜻입니다.

Java 공식 문서는 `ArrayDeque`가 큐로 쓸 때 `LinkedList`보다 빠를 가능성이 높다고 설명합니다.
그래서 큐가 필요하면 먼저 `ArrayDeque`를 고릅니다.

| 필요한 것 | 고를 클래스 |
| --- | --- |
| 먼저 넣은 순서대로 꺼내는 큐 | `ArrayDeque` |
| 크기를 정해 두고 가득 차면 넣지 않는 큐 | `ArrayBlockingQueue` |
| 우선순위가 높은 값부터 꺼내는 큐 | `PriorityQueue` |

`PriorityQueue`는 이름에 큐가 들어가지만 먼저 넣은 순서를 지키지 않습니다.
자세한 내용은 [우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 다룹니다.

## 큐의 활용

이제 큐로 인쇄 대기열을 흉내 내 보겠습니다.
프린터는 한 번에 2장씩만 인쇄합니다.
다 인쇄하지 못한 작업은 남은 장 수를 들고 줄 맨 뒤로 다시 섭니다.
이렇게 한 작업이 프린터를 오래 붙잡지 않고 모두가 돌아가며 조금씩 처리됩니다.

![프린터가 대기열 앞에서 보고서 5장을 poll로 꺼내 2장을 인쇄한다. 남은 3장은 offer로 줄 맨 뒤에 다시 서고 다음 줄은 사진 2장·과제 3장·보고서 3장이 된다.](content/assets/algorithm/queue-round-robin.png)

작업마다 이름과 남은 장 수를 함께 담아야 하므로 `record`로 작은 타입을 만듭니다.

```java
record PrintJob(String name, int pagesLeft) {
}
```

```java
Queue<PrintJob> printer = new ArrayDeque<>();
printer.offer(new PrintJob("보고서", 5));
printer.offer(new PrintJob("사진", 2));
printer.offer(new PrintJob("과제", 3));

int turn = 1;
while (!printer.isEmpty()) {
    PrintJob job = printer.poll();
    int printed = Math.min(2, job.pagesLeft());
    int left = job.pagesLeft() - printed;
    if (left > 0) {
        printer.offer(new PrintJob(job.name(), left));
        System.out.println(turn + "회차: " + job.name() + " " + printed + "장 인쇄 → " + left + "장 남아 뒤로");
    } else {
        System.out.println(turn + "회차: " + job.name() + " " + printed + "장 인쇄 → 완료");
    }
    turn++;
}
```

어떤 작업이 가장 먼저 끝날지 예상해 보세요.
보고서가 가장 먼저 인쇄를 시작한다는 점이 힌트입니다.

```text
1회차: 보고서 2장 인쇄 → 3장 남아 뒤로
2회차: 사진 2장 인쇄 → 완료
3회차: 과제 2장 인쇄 → 1장 남아 뒤로
4회차: 보고서 2장 인쇄 → 1장 남아 뒤로
5회차: 과제 1장 인쇄 → 완료
6회차: 보고서 1장 인쇄 → 완료
```

가장 먼저 시작한 보고서가 가장 늦게 끝났습니다.
회차마다 대기열이 어떻게 바뀌는지 보면 이유가 보입니다.

| 회차 | 꺼낸 작업 | 인쇄 뒤 | 회차가 끝난 뒤 대기열 |
| --- | --- | --- | --- |
| 1 | 보고서 5장 | 3장 남아 뒤로 | 사진 2 · 과제 3 · 보고서 3 |
| 2 | 사진 2장 | 완료 | 과제 3 · 보고서 3 |
| 3 | 과제 3장 | 1장 남아 뒤로 | 보고서 3 · 과제 1 |
| 4 | 보고서 3장 | 1장 남아 뒤로 | 과제 1 · 보고서 1 |
| 5 | 과제 1장 | 완료 | 보고서 1 |
| 6 | 보고서 1장 | 완료 | 비어 있음 |

보고서는 남은 장이 있을 때마다 이미 기다리던 작업들 뒤에 섰습니다.
그래서 장 수가 적은 사진이 먼저 끝나고 장 수가 많은 보고서가 마지막에 끝납니다.
이처럼 꺼낸 값을 다시 뒤에 넣으면 여러 대상을 공평하게 돌아가며 처리할 수 있고 순번이 도는 게임이나 차례대로 나누어 처리하는 문제에 그대로 쓰입니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `PrintQueue.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayDeque;
> import java.util.LinkedList;
> import java.util.NoSuchElementException;
> import java.util.Queue;
> import java.util.concurrent.ArrayBlockingQueue;
>
> public class PrintQueue {
>     record PrintJob(String name, int pagesLeft) {
>     }
>
>     public static void main(String[] args) {
>         Queue<String> jobs = new ArrayDeque<>();
>         jobs.offer("보고서");
>         jobs.offer("사진");
>         jobs.offer("과제");
>         System.out.println("대기열: " + jobs);
>         System.out.println("다음 작업: " + jobs.peek());
>         System.out.println("인쇄 시작: " + jobs.poll());
>         System.out.println("남은 대기열: " + jobs);
>
>         Queue<String> empty = new ArrayDeque<>();
>         System.out.println("poll(): " + empty.poll());
>         System.out.println("peek(): " + empty.peek());
>         try {
>             empty.remove();
>         } catch (NoSuchElementException e) {
>             System.out.println("remove(): NoSuchElementException");
>         }
>         try {
>             empty.element();
>         } catch (NoSuchElementException e) {
>             System.out.println("element(): NoSuchElementException");
>         }
>
>         Queue<String> tray = new ArrayBlockingQueue<>(2);
>         tray.offer("보고서");
>         tray.offer("사진");
>         System.out.println("offer(): " + tray.offer("과제"));
>         try {
>             tray.add("과제");
>         } catch (IllegalStateException e) {
>             System.out.println("add(): IllegalStateException");
>         }
>
>         Queue<String> linked = new LinkedList<>();
>         linked.offer(null);
>         System.out.println("LinkedList 크기: " + linked.size());
>         System.out.println("LinkedList poll(): " + linked.poll());
>         try {
>             jobs.offer(null);
>         } catch (NullPointerException e) {
>             System.out.println("ArrayDeque offer(null): NullPointerException");
>         }
>
>         Queue<PrintJob> printer = new ArrayDeque<>();
>         printer.offer(new PrintJob("보고서", 5));
>         printer.offer(new PrintJob("사진", 2));
>         printer.offer(new PrintJob("과제", 3));
>
>         int turn = 1;
>         while (!printer.isEmpty()) {
>             PrintJob job = printer.poll();
>             int printed = Math.min(2, job.pagesLeft());
>             int left = job.pagesLeft() - printed;
>             if (left > 0) {
>                 printer.offer(new PrintJob(job.name(), left));
>                 System.out.println(turn + "회차: " + job.name() + " " + printed + "장 인쇄 → " + left + "장 남아 뒤로");
>             } else {
>                 System.out.println(turn + "회차: " + job.name() + " " + printed + "장 인쇄 → 완료");
>             }
>             turn++;
>         }
>     }
> }
> ```
>
> ```text
> 대기열: [보고서, 사진, 과제]
> 다음 작업: 보고서
> 인쇄 시작: 보고서
> 남은 대기열: [사진, 과제]
> poll(): null
> peek(): null
> remove(): NoSuchElementException
> element(): NoSuchElementException
> offer(): false
> add(): IllegalStateException
> LinkedList 크기: 1
> LinkedList poll(): null
> ArrayDeque offer(null): NullPointerException
> 1회차: 보고서 2장 인쇄 → 3장 남아 뒤로
> 2회차: 사진 2장 인쇄 → 완료
> 3회차: 과제 2장 인쇄 → 1장 남아 뒤로
> 4회차: 보고서 2장 인쇄 → 1장 남아 뒤로
> 5회차: 과제 1장 인쇄 → 완료
> 6회차: 보고서 1장 인쇄 → 완료
> ```

## 정리

- 큐는 `Queue<String> queue = new ArrayDeque<>();`처럼 `Queue` 타입 변수에 `ArrayDeque` 객체를 담아 만듭니다.
- `offer`·`poll`·`peek`은 할 수 없을 때 `false`·`null`을 돌려주고 `add`·`remove`·`element`는 예외를 던집니다.
- `ArrayDeque`는 `null`을 받지 않으므로 `poll()`의 `null`은 언제나 빈 큐라는 뜻입니다.
- 꺼낸 값을 다시 `offer`로 뒤에 넣으면 여러 대상을 돌아가며 처리할 수 있습니다.

## 이어서 연습하기

[맨 앞 순번을 한 번 미루기](#/coding-tests/java/bridge-que-01)에서 `poll`로 꺼낸 값을 `offer`로 맨 뒤에 넣어 봅니다.
[검수 순서에서 낮은 점수 빼기](#/coding-tests/java/bridge-que-02)에서 맨 앞 값을 맨 뒤로 보내며 줄을 돌려 봅니다.
[주문의 수령 회차 정하기](#/coding-tests/java/bridge-que-03)에서 맨 앞 주문을 기준으로 이어진 주문을 함께 꺼내 봅니다.
[두 검사대에서 시료 꺼내기](#/coding-tests/java/bridge-que-04)에서 큐 두 개의 앞을 비교해 봅니다.
[우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 들어온 순서 대신 우선순위로 꺼내는 큐를 알아봅니다.

## 공식 자료

- [Java 25 API: Queue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Queue.html)
- [Java 25 API: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
- [Java 25 API: LinkedList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html)
- [Java 25 API: ArrayBlockingQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html)

## 핵심 질문 답

Java에서는 `Queue` 인터페이스 타입 변수에 `ArrayDeque` 객체를 담아 큐를 만듭니다.
`offer`로 뒤에 넣고 `poll`로 앞에서 꺼내며 `peek`으로 앞을 확인합니다.
이 세 메서드는 할 수 없을 때 `false`나 `null`을 돌려주고 `add`·`remove`·`element`는 같은 일을 하되 예외를 던집니다.
`ArrayDeque`는 `null`을 받지 않아서 `poll()`이 `null`을 돌려주면 큐가 비었다고 믿을 수 있으므로 반복문에서 빈 큐를 안전하게 다룰 수 있습니다.
