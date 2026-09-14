# 힙과 그리디

## 학습 목표

- 최소 힙의 부모와 자식 사이 순서 규칙을 설명할 수 있습니다.
- 배열에서 힙의 부모와 자식 인덱스를 계산할 수 있습니다.
- 그리디가 현재 선택을 되돌리지 않는 문제 해결 방식임을 설명할 수 있습니다.
- 그리디 선택이 항상 정답인지 근거와 반례를 확인할 수 있습니다.

## 한줄 요약

힙은 우선하는 값을 위에 유지하고, 그리디는 현재 선택을 확정해도 전체 답을 잃지 않는 근거가 있을 때 사용합니다.

## 먼저 확인할 개념

- [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists): `ArrayList`의 `add`, `get`, `set`, `remove`를 사용합니다.
- [람다와 함수형 인터페이스](#/learn/java/wiki-lambdas): 두 값을 비교하는 동작을 전달합니다.
- [스택과 큐](#/learn/algorithm/stack-and-queue): 먼저 들어온 순서와 우선순위를 구분합니다.

## 개념 연결

- 선행: `algo.list`, `algo.dictionary`, `algo.hashing`
- 이 단원: `algo.heap`, `algo.priority-queue`, `algo.greedy`
- 후속: `algo.sorting`, `algo.two-pointers`, `algo.brute-force`

## 힙은 전체를 정렬하지 않고 맨 앞의 값을 관리한다

대기 중인 작업에서 매번 가장 급한 작업을 골라야 한다면 모든 값을 다시 살펴보는 일을 줄이고 싶습니다.
**우선순위 큐**는 들어온 시각이 아니라 정한 우선순위에 따라 다음 값을 꺼내는 규칙입니다.
일반 큐의 FIFO와 다르며, 우선순위가 같은 값끼리의 입력 순서도 자동으로 보장하지 않습니다.

**최소 힙**은 각 부모가 자신의 자식보다 작거나 같은 완전 이진 트리입니다.
완전 이진 트리는 위쪽부터, 같은 높이에서는 왼쪽부터 빈자리 없이 채운 트리입니다.
이 규칙을 따라 루트까지 올라가면 루트가 가장 작은 값임을 알 수 있습니다.
형제나 서로 다른 가지 사이에는 순서 조건이 없으므로 힙 전체가 오름차순 배열인 것은 아닙니다.

0부터 시작하는 배열 인덱스 `index`의 관계는 다음과 같습니다.

| 위치 | 계산 | 먼저 확인할 조건 |
| --- | --- | --- |
| 부모 | `(index - 1) / 2` | `index > 0`이어야 부모가 있음 |
| 왼쪽 자식 | `index * 2 + 1` | 계산한 인덱스가 현재 크기보다 작음 |
| 오른쪽 자식 | `index * 2 + 2` | 계산한 인덱스가 현재 크기보다 작음 |

여기서 `/`는 음수가 아닌 `int`끼리의 정수 나눗셈입니다.
삽입은 맨 끝에 값을 넣고 부모와 비교하며 위로 올립니다.
삭제는 루트를 꺼내고 마지막 값을 루트로 옮긴 뒤, 더 작은 자식과 비교하며 아래로 내립니다.
힙 순서를 복구하는 비교·교환은 한 번에 높이만큼 진행하므로 `O(log n)`입니다.
아래 `ArrayList` 기반 삽입은 내부 배열을 늘리는 비용까지 포함하면 분할 상환 기준으로 설명합니다.

## Java에서 우선순위 큐 생성하고 사용하기

알고리즘 문제를 풀 때는 `PriorityQueue<Integer> queue = new PriorityQueue<>();`로 정수 최소 우선순위 큐를 만들 수 있습니다.
`Integer`의 자연 순서는 숫자의 오름차순이므로 작은 값이 먼저 나옵니다.
큰 값부터 필요하면 생성자에 `Comparator.reverseOrder()`를 전달합니다.

| 목적 | 사용 방법 | 결과·주의점 |
| --- | --- | --- |
| 값 넣기 | `queue.offer(5)` | 우선순위에 맞춰 보관 |
| 다음 값 확인 | `queue.peek()` | 제거하지 않으며 비었으면 `null` |
| 다음 값 꺼내기 | `queue.poll()` | 제거하며 비었으면 `null` |
| 빈 상태 확인 | `queue.isEmpty()` | 비었으면 `true` |
| 현재 개수 | `queue.size()` | 저장한 원소 수 |

`PriorityQueue`에는 `null`을 넣을 수 없습니다.
빈 큐의 `poll()` 결과를 `int`에 바로 대입하면 `null`의 자동 언박싱 때문에 예외가 납니다.
꺼내기 전에 빈 상태를 확인하거나 `Integer`로 받아 `null`을 구분합니다.
`for-each` 순회나 큐 자체의 출력은 우선순위순이라는 보장이 없으며, 순서대로 처리하려면 `poll()`을 반복합니다.

객체의 우선순위는 `Comparator`로 정합니다.
예를 들어 종료 시각 기준은 `Comparator.comparingInt((Meeting meeting) -> meeting.end)`로 표현합니다.
두 `int`를 빼서 비교하면 큰 값에서 오버플로가 날 수 있으므로 `Integer.compare`나 `comparingInt`를 사용합니다.

## 그리디는 현재 선택을 되돌리지 않는다

**그리디**는 매 단계에서 선택 기준에 맞는 하나를 확정하고 이후에 되돌리지 않는 전략입니다.
힙은 값을 관리하는 자료구조이고 그리디는 답을 고르는 전략이므로, 힙을 쓴다고 자동으로 올바른 그리디가 되지는 않습니다.

겹치지 않는 회의를 최대한 많이 고른다고 합시다.
회의는 `start < end`인 시간 구간이며, 앞 회의가 끝나는 시각에 다음 회의를 시작할 수 있습니다.
모든 회의의 가치는 동일하고 **선택 개수**를 최대화합니다.

종료 시각이 가장 빠른 회의를 고르면 뒤에 남는 시간이 줄지 않습니다.
어떤 최적 일정의 첫 회의를 이 회의로 바꾸어도 뒤의 회의들을 유지할 수 있습니다.
같은 논리를 남은 회의에 반복할 수 있으므로 이 조건에서는 현재 선택을 확정할 수 있습니다.

회의마다 보상이 다르고 총보상을 최대화한다면 이 기준을 그대로 적용할 수 없습니다.
예를 들어 `[0, 2)`의 보상이 `1`, `[0, 3)`의 보상이 `100`이면 빨리 끝나는 회의를 고른 결과가 최대 보상이 아닙니다.
선택하려는 값이 개수인지 보상인지부터 확인해야 합니다.

## 예제: 직접 만든 힙과 표준 큐, 회의 선택

`5 → 2 → 7 → 1`을 넣을 때 `1`이 부모와 두 번 자리를 바꾸는 모습을 먼저 예상해 보세요.
다음 Java 25 예제는 힙의 내부 움직임을 직접 구현한 뒤, 같은 꺼내기 결과를 표준 `PriorityQueue`에서도 확인하는 구성입니다.
회의 선택은 모든 회의를 한 번 정렬하면 되므로 힙을 억지로 사용하지 않습니다.
코드는 `HeapAndGreedyExample.java` 파일 하나로 구성할 수 있습니다.

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class HeapAndGreedyExample {
    static void swap(List<Integer> heap, int left, int right) {
        int temporary = heap.get(left);
        heap.set(left, heap.get(right));
        heap.set(right, temporary);
    }

    static void pushMinHeap(List<Integer> heap, int value) {
        heap.add(value);
        int index = heap.size() - 1;
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap.get(parent) <= heap.get(index)) break;
            swap(heap, parent, index);
            index = parent;
        }
    }

    static Integer popMinHeap(List<Integer> heap) {
        if (heap.isEmpty()) return null;
        int minimum = heap.get(0);
        int last = heap.remove(heap.size() - 1);
        if (heap.isEmpty()) return minimum;
        heap.set(0, last);

        int index = 0;
        // 내부 노드에서만 자식 인덱스를 계산한다.
        while (index < heap.size() / 2) {
            int left = index * 2 + 1;
            int right = left + 1;
            int smaller = left;
            if (right < heap.size() && heap.get(right) < heap.get(left)) {
                smaller = right;
            }
            if (heap.get(index) <= heap.get(smaller)) break;
            swap(heap, index, smaller);
            index = smaller;
        }
        return minimum;
    }

    static final class Meeting {
        final String name;
        final int start;
        final int end;

        Meeting(String name, int start, int end) {
            if (start >= end) throw new IllegalArgumentException("start < end");
            this.name = name;
            this.start = start;
            this.end = end;
        }
    }

    static List<String> selectMeetings(List<Meeting> meetings) {
        List<Meeting> ordered = new ArrayList<>(meetings);
        ordered.sort(Comparator.comparingInt((Meeting meeting) -> meeting.end)
                .thenComparingInt(meeting -> meeting.start));
        List<String> selected = new ArrayList<>();
        int lastEnd = Integer.MIN_VALUE;
        for (Meeting meeting : ordered) {
            if (meeting.start < lastEnd) continue;
            selected.add(meeting.name);
            lastEnd = meeting.end;
        }
        return selected;
    }

    public static void main(String[] args) {
        List<Integer> heap = new ArrayList<>();
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        for (int value : new int[]{5, 2, 7, 1, 4}) {
            pushMinHeap(heap, value);
            queue.offer(value);
        }
        List<Integer> fromHeap = new ArrayList<>();
        List<Integer> fromQueue = new ArrayList<>();
        while (!heap.isEmpty()) fromHeap.add(popMinHeap(heap));
        while (!queue.isEmpty()) fromQueue.add(queue.poll());
        System.out.println(fromHeap);
        System.out.println(fromQueue);
        System.out.println(popMinHeap(heap));

        List<Meeting> meetings = List.of(
                new Meeting("E", 5, 8), new Meeting("A", 1, 4),
                new Meeting("D", 6, 7), new Meeting("B", 3, 5),
                new Meeting("C", 4, 6));
        System.out.println(selectMeetings(meetings));
        System.out.println(meetings.get(0).name);
    }
}
```

예상 출력:

```text
[1, 2, 4, 5, 7]
[1, 2, 4, 5, 7]
null
[A, C, D]
E
```

## 실행 흐름에서 볼 상태

힙에 `1`을 추가한 직후 `[2, 5, 7, 1]`은 `[2, 1, 7, 5]`, `[1, 2, 7, 5]`로 변합니다.
루트만 확인하는 것이 아니라 부모와 자식의 규칙을 복구한 결과입니다.
루트를 꺼낸 뒤에도 마지막 값을 내려 보내며 이 규칙을 다시 지킵니다.

회의는 종료 시각으로 `A → B → C → D → E` 순서가 됩니다.
`A`를 선택한 뒤 `B`는 겹쳐 건너뛰고, `C`와 `D`는 각각 직전 회의가 끝나는 시각에 시작하므로 선택합니다.
`E`는 `D`와 겹칩니다.
`new ArrayList<>(meetings)`로 목록을 복사했으므로 원본의 첫 회의는 계속 `E`입니다.
객체까지 복제한 것은 아니지만 이 예제는 회의 객체의 값을 바꾸지 않습니다.

## 흔한 실수와 확인할 지점

- 힙이나 `PriorityQueue` 전체가 정렬됐다고 생각하면 출력 순서를 잘못 해석합니다. 부모·자식 규칙과 반복 `poll()`을 구분하세요.
- 자식이 있는지 확인하지 않고 읽으면 인덱스 오류가 납니다. 왼쪽·오른쪽 경계를 각각 확인하세요.
- 작은 값이 빠른 우선순위인지 큰 값이 빠른 우선순위인지 정하지 않으면 큐가 반대로 작동합니다. 비교 기준을 먼저 적으세요.
- 빈 힙의 `null`을 숫자로 사용하지 마세요. 직접 만든 힙도 표준 큐도 꺼낼 값이 없는 경우를 구분합니다.
- 현재 이익이 크다는 설명만으로 그리디를 확정하지 마세요. 앞의 선택을 교체해도 이후 최적해를 잃지 않는 근거나 반례를 확인하세요.

## 이어서 학습하기

[정렬·투 포인터·슬라이딩 윈도우](#/learn/algorithm/sorting-two-pointers-sliding-window)에서 순서를 만든 뒤 탐색량을 줄이는 방법을 이어서 봅니다.
이 예제의 회의 시작·종료 시각을 한 번 바꾸고, 코드를 실행하기 전에 선택 결과가 달라지는 이유를 설명해 보세요.

## 공식 자료

- [Oracle Java 25: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html): 자연 순서·비교자, 빈 큐와 순회 계약.
- [Oracle Java 25: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html): 숫자 필드 비교와 동률 기준 연결.
- [Oracle Java 25: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html): 목록 복사와 원소 변경·삭제.
- [Princeton Algorithms: Priority Queues](https://algs4.cs.princeton.edu/24pq/): 힙의 순서와 위·아래로 복구하는 원리.

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 교안의 개념과 예제를 Java 25 기준으로 재구성했습니다.

## 핵심 질문 답

가장 작은 값을 반복해서 꺼내려면 부모가 자식보다 작거나 같은 최소 힙 규칙을 유지하거나, 자연 순서의 `PriorityQueue<Integer>`를 사용합니다.
전체 배열의 정렬이나 FIFO를 기대하지 않고 비교 기준과 빈 상태의 반환값을 확인해야 합니다.

현재의 선택을 확정하는 그리디는 그 선택으로 뒤의 최적해를 잃지 않는다는 근거가 필요합니다.
같은 가치의 회의 개수를 최대화할 때는 가장 일찍 끝나는 회의를 고르면 남은 시간을 줄이지 않지만, 회의별 보상이 다르면 같은 기준이 성립하지 않습니다.
