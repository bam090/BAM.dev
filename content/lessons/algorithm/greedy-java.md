# Java로 그리디 선택 구현하기

## 학습 목표

- `Comparator`로 정렬 기준을 정해 앞에서부터 고르고 `PriorityQueue`로 매번 가장 좋은 값을 꺼내 그리디를 구현할 수 있습니다.

## 한줄 요약

Java의 그리디는 `Comparator.comparingInt`로 기준을 정해 정렬한 뒤 앞에서부터 고르거나 `PriorityQueue`에 넣어 매번 가장 좋은 값을 꺼내는 두 모양으로 구현합니다.

## 먼저 확인할 개념

[그리디: 지금 가장 좋은 선택으로 답 만들기](#/learn/algorithm/heap-and-greedy) · [Java로 정렬하기: Arrays.sort·List.sort·Comparator](#/learn/algorithm/sort-java) · [우선순위 큐와 힙: 가장 급한 값부터 꺼내기](#/learn/algorithm/priority-queue-heap)

## 그리디 구현의 두 모양

**그리디 구현**은 정한 기준대로 후보를 줄 세우고 가장 좋은 후보부터 확정해 나가는 코드입니다.
앞 문서에서는 스터디 카페의 거스름돈과 스터디룸 예약으로 그리디의 기준과 정당성을 확인했습니다.
이번에는 같은 스터디 카페 예제를 Java 표준 API로 구현해 보겠습니다.

그리디 코드는 거의 두 모양 중 하나입니다.

| 모양 | 쓰는 도구 | 잘 맞는 경우 |
| --- | --- | --- |
| 정렬한 뒤 앞에서부터 고르기 | `List.sort` · `Arrays.sort` · `Comparator` | 후보가 처음에 모두 주어지고 기준이 바뀌지 않을 때 |
| 매번 가장 좋은 값 꺼내기 | `PriorityQueue` | 후보가 중간에 새로 들어오거나 고른 뒤 다시 넣어야 할 때 |

두 모양 모두 기준을 코드로 적는 일이 핵심입니다.
그 기준을 적는 도구가 `Comparator`입니다.

## Comparator로 정렬 기준 정하기

예약은 이름·시작 시각·끝나는 시각을 가진 `record`로 만듭니다.

```java
record Meeting(String name, int start, int end) {}
```

`record`는 값을 담는 클래스를 짧게 만드는 문법입니다.
필드를 읽을 때는 `m.end()`처럼 필드 이름과 같은 메서드를 부릅니다.

`Comparator`는 두 값을 받아 어느 쪽이 앞에 와야 하는지 알려 주는 비교 규칙입니다.
그리디에서 자주 쓰는 메서드는 아래와 같습니다.

| 메서드 | 만드는 비교 규칙 |
| --- | --- |
| `Comparator.comparingInt(Meeting::end)` | 끝나는 시각이 작은 것이 앞 |
| `.thenComparingInt(Meeting::start)` | 앞 기준이 같으면 시작 시각이 작은 것이 앞 |
| `.reversed()` | 지금까지 만든 순서를 거꾸로 |
| `Comparator.reverseOrder()` | `Integer`·`String` 같은 값을 큰 것부터 |
| `Integer.compare(a, b)` | 두 `int`를 비교해 음수·0·양수를 돌려줌 |

회의실 배정의 기준은 끝나는 시각이고 끝나는 시각이 같으면 시작 시각으로 정합니다.

```java
sorted.sort(Comparator.comparingInt(Meeting::end)
        .thenComparingInt(Meeting::start));
```

![넣은 순서 A 1~4 · B 3~5 · C 0~6 · D 5~7 · E 8~9 · F 5~9를 끝나는 시각 순서로 정렬하면 A·B·C·D·F·E가 된다. 끝이 9로 같은 E와 F는 시작이 빠른 F가 앞에 온다.](content/assets/algorithm/greedy-java-comparator.png)

`E`와 `F`는 둘 다 9시에 끝나서 첫 기준으로는 순서가 정해지지 않습니다.
그래서 두 번째 기준인 시작 시각을 보고 5시에 시작하는 `F`를 앞에 둡니다.
문제에서 동점일 때의 순서를 정해 주면 이렇게 `thenComparing`으로 그대로 적습니다.

> [!question]- 두 수를 빼서 비교하면 안 되나요?
> `(a, b) -> a.end() - b.end()`처럼 빼서 비교하는 코드도 자주 보입니다.
> 하지만 값이 크면 뺄셈이 `int` 범위를 넘어 부호가 뒤집힙니다.
> 20억에서 -20억을 빼면 40억이 아니라 음수가 나옵니다.
>
> ```text
> 빼기 비교: -294967296
> Integer.compare: 1
> ```
>
> 그래서 `Integer.compare`나 `Comparator.comparingInt`를 쓰면 이런 실수를 피할 수 있습니다.

## 정렬한 뒤 앞에서부터 고르기

정렬 기준을 정했으니 회의실 배정을 완성합니다.
정렬된 목록을 앞에서부터 보며 마지막으로 고른 예약이 끝난 뒤에 시작하는 예약만 고릅니다.

```java
static List<String> selectMeetings(List<Meeting> meetings) {
    List<Meeting> sorted = new ArrayList<>(meetings);
    sorted.sort(Comparator.comparingInt(Meeting::end)
            .thenComparingInt(Meeting::start));
    List<String> selected = new ArrayList<>();
    int lastEnd = 0;
    for (Meeting m : sorted) {
        if (m.start() >= lastEnd) {
            selected.add(m.name());
            lastEnd = m.end();
        }
    }
    return selected;
}
```

`new ArrayList<>(meetings)`로 복사한 뒤 정렬하는 이유는 `List.of`로 만든 목록은 바꿀 수 없어서 바로 `sort`하면 예외가 나기 때문입니다.
복사본을 정렬하면 원래 목록의 순서도 그대로 남습니다.

```text
고른 예약: [A, D, E]
```

`D`를 고른 뒤 `lastEnd`는 7이 되고 다음 `F`는 5시에 시작하므로 건너뜁니다.
그다음 `E`는 8시에 시작하므로 고릅니다.

## PriorityQueue로 매번 가장 좋은 값 꺼내기

이번에는 질문을 바꿔 모든 예약을 받으려면 스터디룸이 몇 개 필요한지 구해 보겠습니다.
예약을 시작 시각 순서로 보면서 지금 쓰고 있는 방 중 **가장 빨리 끝나는 방**을 계속 확인해야 합니다.
이렇게 매번 가장 작은 값을 꺼내야 할 때 `PriorityQueue`를 씁니다.

| 메서드 | 하는 일 |
| --- | --- |
| `offer(x)` | 값을 넣습니다 |
| `peek()` | 가장 앞의 값을 꺼내지 않고 봅니다 · 비었으면 `null` |
| `poll()` | 가장 앞의 값을 꺼냅니다 · 비었으면 `null` |
| `size()` · `isEmpty()` | 들어 있는 개수와 비었는지 |

`new PriorityQueue<>()`는 작은 값이 앞에 오고 `new PriorityQueue<>(Comparator.reverseOrder())`는 큰 값이 앞에 옵니다.
큐와 힙의 동작은 [우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 자세히 다룹니다.

![0부터 10까지의 시간 축에 방 세 개를 그린 그림. 방 1은 C 0~6 뒤에 E 8~9를 쓰고 방 2는 A 1~4 뒤에 D 5~7을 쓰고 방 3은 B 3~5 뒤에 F 5~9를 쓴다. 새 예약이 오면 가장 빨리 끝나는 방을 peek으로 보고 끝났으면 poll로 빼서 다시 쓰며 필요한 방은 3개이다.](content/assets/algorithm/greedy-java-rooms.png)

큐에는 방마다 끝나는 시각을 넣습니다.
새 예약이 올 때 큐 앞의 끝나는 시각이 새 예약의 시작 시각보다 늦지 않으면 그 방은 비었으므로 꺼내고 새 예약의 끝나는 시각을 넣습니다.

```java
static int countRooms(List<Meeting> meetings) {
    List<Meeting> sorted = new ArrayList<>(meetings);
    sorted.sort(Comparator.comparingInt(Meeting::start));
    PriorityQueue<Integer> endTimes = new PriorityQueue<>();
    int rooms = 0;
    for (Meeting m : sorted) {
        if (!endTimes.isEmpty() && endTimes.peek() <= m.start()) {
            endTimes.poll();
        }
        endTimes.offer(m.end());
        rooms = Math.max(rooms, endTimes.size());
        System.out.println(m.name() + " 시작 " + m.start() + " → 끝나는 시각 " + endTimes);
    }
    return rooms;
}
```

`B`가 들어온 뒤 큐 앞에 어떤 값이 있을지 먼저 예상해 보세요.

```text
C 시작 0 → 끝나는 시각 [6]
A 시작 1 → 끝나는 시각 [4, 6]
B 시작 3 → 끝나는 시각 [4, 6, 5]
D 시작 5 → 끝나는 시각 [5, 6, 7]
F 시작 5 → 끝나는 시각 [6, 7, 9]
E 시작 8 → 끝나는 시각 [7, 9, 9]
필요한 방: 3
```

`B`가 들어온 뒤 출력이 `[4, 6, 5]`로 정렬되어 있지 않습니다.
`PriorityQueue`를 출력하면 내부 배열의 순서가 보일 뿐이고 보장되는 것은 맨 앞이 가장 작다는 것 하나입니다.
그래서 순서대로 처리할 때는 출력이나 `for` 문이 아니라 `peek()`과 `poll()`로 앞에서부터 꺼냅니다.

`D`가 오면 큐 앞의 4가 5 이하이므로 `A`가 쓰던 방을 비우고 `D`의 끝나는 시각 7을 넣습니다.
큐의 크기가 동시에 쓰는 방의 수이고 가장 컸을 때가 3이므로 방은 3개 필요합니다.
예약이 `n`개면 정렬이 `O(n log n)`이고 큐에 넣고 빼는 일이 한 번에 `O(log n)`이라 전체도 `O(n log n)`입니다.

## 거스름돈 구현

마지막으로 거스름돈입니다.
동전 종류가 섞여서 주어지면 큰 동전부터 쓰도록 먼저 내림차순으로 정렬합니다.

```java
static int[] giveChange(int amount, Integer[] coins) {
    Arrays.sort(coins, Comparator.reverseOrder());
    int[] counts = new int[coins.length];
    for (int i = 0; i < coins.length; i++) {
        counts[i] = amount / coins[i];
        amount %= coins[i];
    }
    return counts;
}
```

`Arrays.sort`에 `Comparator`를 넘기려면 배열이 `int[]`가 아니라 `Integer[]`여야 합니다.
`int[]`는 기본 타입 배열이라 작은 것부터 정렬하는 `Arrays.sort(arr)`만 쓸 수 있기 때문입니다.

동전을 하나씩 빼는 대신 `/`로 몇 개 쓸지 한 번에 구하고 `%`로 남은 금액을 구합니다.
1260원을 넣으면 동전마다 몇 개가 나올지 예상해 보세요.

```text
동전: [500, 100, 50, 10]
개수: [2, 2, 1, 1]
```

1260을 500으로 나누면 몫이 2이고 나머지가 260입니다.
이어서 260을 100으로 나누면 2와 60이 되고 같은 방법으로 50원 1개와 10원 1개가 나옵니다.
금액이 아주 커도 동전 종류 수만큼만 반복하므로 빠르게 끝납니다.
다만 이 방법이 가장 적은 개수를 보장하는 것은 앞 문서에서 확인한 것처럼 큰 동전이 작은 동전의 배수일 때뿐입니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `StudyRoomGreedy.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Comparator;
> import java.util.List;
> import java.util.PriorityQueue;
>
> public class StudyRoomGreedy {
>     record Meeting(String name, int start, int end) {}
>
>     static List<String> selectMeetings(List<Meeting> meetings) {
>         List<Meeting> sorted = new ArrayList<>(meetings);
>         sorted.sort(Comparator.comparingInt(Meeting::end)
>                 .thenComparingInt(Meeting::start));
>         List<String> selected = new ArrayList<>();
>         int lastEnd = 0;
>         for (Meeting m : sorted) {
>             if (m.start() >= lastEnd) {
>                 selected.add(m.name());
>                 lastEnd = m.end();
>             }
>         }
>         return selected;
>     }
>
>     static int countRooms(List<Meeting> meetings) {
>         List<Meeting> sorted = new ArrayList<>(meetings);
>         sorted.sort(Comparator.comparingInt(Meeting::start));
>         PriorityQueue<Integer> endTimes = new PriorityQueue<>();
>         int rooms = 0;
>         for (Meeting m : sorted) {
>             if (!endTimes.isEmpty() && endTimes.peek() <= m.start()) {
>                 endTimes.poll();
>             }
>             endTimes.offer(m.end());
>             rooms = Math.max(rooms, endTimes.size());
>             System.out.println(m.name() + " 시작 " + m.start() + " → 끝나는 시각 " + endTimes);
>         }
>         return rooms;
>     }
>
>     static int[] giveChange(int amount, Integer[] coins) {
>         Arrays.sort(coins, Comparator.reverseOrder());
>         int[] counts = new int[coins.length];
>         for (int i = 0; i < coins.length; i++) {
>             counts[i] = amount / coins[i];
>             amount %= coins[i];
>         }
>         return counts;
>     }
>
>     public static void main(String[] args) {
>         List<Meeting> meetings = List.of(
>             new Meeting("A", 1, 4),
>             new Meeting("B", 3, 5),
>             new Meeting("C", 0, 6),
>             new Meeting("D", 5, 7),
>             new Meeting("E", 8, 9),
>             new Meeting("F", 5, 9)
>         );
>         System.out.println("고른 예약: " + selectMeetings(meetings));
>         System.out.println("필요한 방: " + countRooms(meetings));
>
>         Integer[] coins = {10, 500, 50, 100};
>         int[] counts = giveChange(1260, coins);
>         System.out.println("동전: " + Arrays.toString(coins));
>         System.out.println("개수: " + Arrays.toString(counts));
>
>         int big = 2_000_000_000;
>         int small = -2_000_000_000;
>         System.out.println("빼기 비교: " + (big - small));
>         System.out.println("Integer.compare: " + Integer.compare(big, small));
>     }
> }
> ```
>
> ```text
> 고른 예약: [A, D, E]
> C 시작 0 → 끝나는 시각 [6]
> A 시작 1 → 끝나는 시각 [4, 6]
> B 시작 3 → 끝나는 시각 [4, 6, 5]
> D 시작 5 → 끝나는 시각 [5, 6, 7]
> F 시작 5 → 끝나는 시각 [6, 7, 9]
> E 시작 8 → 끝나는 시각 [7, 9, 9]
> 필요한 방: 3
> 동전: [500, 100, 50, 10]
> 개수: [2, 2, 1, 1]
> 빼기 비교: -294967296
> Integer.compare: 1
> ```

## 그리디 구현 고르기

그렇다면 문제를 받았을 때 어느 모양으로 구현할까요?
후보가 언제 주어지고 기준이 바뀌는지를 봅니다.

| 문제의 모양 | 구현 |
| --- | --- |
| 후보가 처음에 모두 주어지고 한 기준으로 한 번만 줄 세우면 됩니다 | 복사한 목록을 `sort`한 뒤 반복문으로 고르기 |
| 동점일 때의 순서가 정해져 있습니다 | `comparingInt(...).thenComparingInt(...)` |
| 처리하는 동안 후보가 새로 생기거나 사라집니다 | `PriorityQueue`에 넣고 `peek`·`poll` |
| 가장 큰 값부터 꺼내야 합니다 | `new PriorityQueue<>(Comparator.reverseOrder())` |
| 같은 것을 여러 번 쓸 수 있습니다 | `/`로 개수를 한 번에 구하고 `%`로 남은 양 구하기 |

## 정리

- 그리디는 정렬한 뒤 앞에서부터 고르거나 `PriorityQueue`로 매번 가장 좋은 값을 꺼내는 두 모양으로 구현합니다.
- 기준은 `Comparator.comparingInt`로 적고 동점 규칙은 `thenComparingInt`로 잇고 값의 뺄셈 대신 `Integer.compare`를 씁니다.
- `PriorityQueue`는 맨 앞만 가장 작다고 보장하므로 `peek`·`poll`로 꺼내며 처리합니다.
- `Comparator`로 배열을 정렬하려면 `int[]` 대신 `Integer[]`를 씁니다.

## 이어서 연습하기

[점검실 예약 고르기](#/coding-tests/java/bridge-gre-01)에서 동점 규칙까지 `Comparator`로 적어 예약을 골라 봅니다.
[오류 출처 묶음 고르기](#/coding-tests/java/bridge-gre-05)에서 개수 내림차순과 이름 사전순을 함께 쓰는 정렬 기준을 연습합니다.
[산책로 빈 구간 덮기](#/coding-tests/java/bridge-gre-06)에서 이미 덮인 구간을 정렬한 뒤 첫 빈 위치부터 새 덮개를 놓아 봅니다.

## 공식 자료

- [Java 25 API: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)
- [Java 25 API: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)
- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

## 핵심 질문 답

후보가 처음에 모두 주어지면 `Comparator.comparingInt`로 기준을 정하고 `thenComparingInt`로 동점 규칙을 이어 정렬한 뒤 앞에서부터 조건에 맞는 것을 고릅니다.
처리하는 동안 후보가 들어오고 나가면 `PriorityQueue`에 넣고 `peek`으로 가장 좋은 값을 확인한 뒤 `poll`로 꺼냅니다.
`PriorityQueue`는 맨 앞만 보장하므로 출력 순서를 믿지 않고 꺼내면서 처리합니다.
비교는 뺄셈 대신 `Integer.compare`를 쓰고 `Comparator`로 배열을 정렬할 때는 `Integer[]`를 씁니다.
