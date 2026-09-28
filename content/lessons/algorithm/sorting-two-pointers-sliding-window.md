# 정렬 알고리즘: 값을 순서대로 늘어놓기

## 학습 목표

- 삽입·병합·힙·계수 정렬이 값을 어떤 방법으로 순서대로 놓는지 같은 배열로 따라가며 설명할 수 있습니다.
- 시간 복잡도·추가 메모리·안정성을 기준으로 정렬 알고리즘을 비교하고 상황에 맞는 정렬을 고를 수 있습니다.

## 한줄 요약

정렬은 값을 기준에 따라 순서대로 늘어놓는 일이고 삽입·병합·힙·계수 정렬은 순서를 만드는 방법이 달라서 속도·메모리·안정성이 서로 다릅니다.

## 먼저 확인할 개념

[코드에서 시간 복잡도 계산하기](#/learn/algorithm/time-complexity-in-code) · [배열](#/learn/algorithm/array) · [우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap) · [백트래킹: 선택하고 되돌아오며 모든 경우 찾기](#/learn/algorithm/brute-force-backtracking-recursion)

## 정렬이란

**정렬**은 여러 값을 정해진 기준에 따라 순서대로 다시 늘어놓는 일입니다.
작은 값부터 놓으면 **오름차순**이고 큰 값부터 놓으면 **내림차순**입니다.

정렬이 중요한 이유는 정렬된 데이터가 다른 알고리즘의 출발점이 되기 때문입니다.
값이 순서대로 놓여 있으면 가장 작은 값과 가장 큰 값은 양 끝에 있고 같은 값은 서로 붙어 있습니다.
그래서 중앙값 찾기·중복 찾기·가까운 두 값 찾기 같은 문제가 정렬 한 번으로 쉬워집니다.

예를 들어 5점 만점 퀴즈를 본 다섯 명의 점수가 `[4, 2, 5, 1, 2]`라고 해 보겠습니다.
이 문서는 이 점수 배열 하나를 네 가지 정렬 알고리즘으로 정렬해 보며 끝까지 설명합니다.
모두 같은 결과인 `[1, 2, 2, 4, 5]`에 도착하지만 가는 길은 서로 다릅니다.

## 정렬 알고리즘의 종류

정렬 알고리즘은 아주 많지만 이 문서에서는 생각하는 방식이 서로 다른 네 가지를 봅니다.

| 정렬 | 순서를 만드는 방법 |
| --- | --- |
| 삽입 정렬 | 값을 하나씩 꺼내 이미 정렬된 앞부분의 알맞은 자리에 끼웁니다 |
| 병합 정렬 | 배열을 반으로 계속 나눈 뒤 정렬하며 다시 합칩니다 |
| 힙 정렬 | 가장 작은 값이 늘 맨 위에 오는 힙에 넣고 하나씩 꺼냅니다 |
| 계수 정렬 | 값을 비교하지 않고 값마다 몇 번 나왔는지 셉니다 |

코드는 동작 원리를 보여 주는 최소한만 적었습니다.
Java에서 실제로 정렬할 때는 직접 구현하지 않고 표준 메서드를 쓰며 그 방법은 [Java로 정렬하기](#/learn/algorithm/sort-java)에서 알아봅니다.

### 삽입 정렬

**삽입 정렬**은 카드 게임에서 손에 든 카드를 정리하듯 값을 하나씩 앞쪽의 알맞은 자리에 끼워 넣는 정렬입니다.
배열의 앞부분을 이미 정렬된 구역으로 두고 뒤에서 값을 하나씩 가져와 그 구역을 넓혀 갑니다.

![삽입 정렬 단계. 시작 4·2·5·1·2에서 1회차에 2를 4 앞에 끼워 2·4·5·1·2 가 되고 2회차에 5는 그 자리 그대로이며 3회차에 1을 맨 앞까지 옮겨 1·2·4·5·2 가 되고 4회차에 뒤의 2를 앞의 2 바로 뒤에 끼워 1·2·2·4·5 가 된다. 초록은 정렬된 앞부분이고 주황은 끼워 넣은 값이다.](content/assets/algorithm/sorting-insertion.png)

```java
static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}
```

`key`는 이번에 끼워 넣을 값입니다.
`while`문은 `key`보다 큰 앞쪽 값을 한 칸씩 뒤로 밀어 자리를 만들고 멈춘 곳에 `key`를 넣습니다.

3회차에서 `1`은 앞의 `2`·`4`·`5`를 모두 한 칸씩 밀어야 맨 앞에 들어갑니다.
이렇게 값마다 앞쪽을 최대 전부 밀 수 있어서 최악의 경우 `O(n²)`입니다.
반대로 2회차의 `5`처럼 이미 제자리인 값은 한 번 비교하고 끝납니다.
그래서 거의 정렬된 배열에서는 `O(n)`에 가깝게 빨라집니다.

### 병합 정렬

**병합 정렬**은 배열을 더 나눌 수 없을 때까지 반으로 나눈 뒤 정렬된 두 조각을 하나로 합치기를 반복하는 정렬입니다.
큰 문제를 같은 모양의 작은 문제로 나누어 푸는 재귀의 대표적인 예입니다.

![병합 정렬. 위쪽 나누기 구역에서 4·2·5·1·2가 4·2와 5·1·2로 나뉘고 다시 한 칸씩 될 때까지 나뉜다. 아래쪽 합치기 구역에서 2·4와 1·2가 만들어지고 5와 1·2가 1·2·5로 합쳐진 뒤 마지막에 1·2·2·4·5가 된다.](content/assets/algorithm/sorting-merge.png)

한 칸짜리 배열은 그 자체로 정렬되어 있습니다.
그래서 한 칸이 될 때까지 나눈 뒤 합치기만 잘하면 됩니다.

```java
static int[] mergeSort(int[] a) {
    if (a.length <= 1) return a;
    int mid = a.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(a, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(a, mid, a.length));
    return merge(left, right);
}

static int[] merge(int[] left, int[] right) {
    int[] result = new int[left.length + right.length];
    int i = 0, j = 0, k = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result[k++] = left[i++];
        else result[k++] = right[j++];
    }
    while (i < left.length) result[k++] = left[i++];
    while (j < right.length) result[k++] = right[j++];
    return result;
}
```

`merge`는 두 조각의 맨 앞 값만 비교해 작은 쪽을 결과에 옮깁니다.
두 조각이 이미 정렬되어 있으니 맨 앞끼리만 비교해도 가장 작은 값을 고를 수 있기 때문입니다.
마지막 합치기에서 `[2, 4]`와 `[1, 2, 5]`를 비교하면 `1`·`2`·`2`·`4`·`5` 순서로 옮겨집니다.

반씩 나누면 층이 `log n`개 생기고 층마다 합치는 일은 `n`번입니다.
그래서 병합 정렬은 입력이 어떻게 놓여 있든 늘 `O(n log n)`입니다.
대신 합칠 때 결과를 담을 배열이 따로 필요해서 `O(n)`의 메모리를 더 씁니다.

### 힙 정렬

**힙 정렬**은 힙이라는 자료구조에 값을 모두 넣은 뒤 가장 작은 값부터 하나씩 꺼내서 정렬하는 방법입니다.
**힙**은 부모가 자식보다 항상 작거나 같도록 값을 트리 모양으로 유지하는 자료구조라서 맨 위에 언제나 가장 작은 값이 있습니다.

Java의 `PriorityQueue`가 바로 이 힙으로 만든 우선순위 큐입니다.
우선순위 큐는 넣은 순서와 관계없이 우선순위가 가장 높은 값을 먼저 꺼내 주기 때문에 하나씩 꺼내기만 해도 정렬이 됩니다.

![왼쪽은 4·2·5·1·2를 넣은 최소 힙으로 맨 위가 1이고 그 아래 2와 5 · 2 아래에 4와 2가 있다. 오른쪽은 하나씩 꺼낸 값 1·2·2·4·5와 꺼낸 뒤 남은 값이 차례로 줄어드는 모습이다.](content/assets/algorithm/sorting-heap.png)

```java
static int[] heapSort(int[] a) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : a) heap.add(x);
    int[] result = new int[a.length];
    for (int i = 0; i < result.length; i++) {
        result[i] = heap.poll();
    }
    return result;
}
```

`poll()`로 맨 위 값을 꺼내면 힙은 남은 값 중 가장 작은 값을 다시 맨 위로 올립니다.
이 정리가 트리의 높이만큼인 `O(log n)`이고 값 `n`개를 넣고 꺼내므로 전체는 `O(n log n)`입니다.

이 코드는 원리를 보이려고 우선순위 큐를 따로 만들었습니다.
원래의 힙 정렬은 배열 자체를 힙으로 바꾼 뒤 맨 위 값을 배열 끝과 바꾸는 방식이라 메모리를 거의 더 쓰지 않습니다.
힙이 값을 넣고 꺼낼 때 어떻게 모양을 유지하는지는 [우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 자세히 다룹니다.

### 계수 정렬

**계수 정렬**은 값끼리 비교하지 않고 값마다 몇 번 나왔는지 센 뒤 작은 값부터 그 횟수만큼 적어 정렬하는 방법입니다.
계수(計數)는 수를 센다는 뜻입니다.

![계수 정렬. 입력 4·2·5·1·2에서 0점부터 5점까지 칸 6개짜리 개수 배열에 0·1·2·0·1·1을 세고 0점부터 개수만큼 차례로 적어 출력 1·2·2·4·5를 만든다.](content/assets/algorithm/sorting-counting.png)

```java
static int[] countingSort(int[] a, int max) {
    int[] count = new int[max + 1];
    for (int x : a) count[x]++;

    int[] result = new int[a.length];
    int k = 0;
    for (int value = 0; value <= max; value++) {
        for (int c = 0; c < count[value]; c++) {
            result[k++] = value;
        }
    }
    return result;
}
```

점수는 0점부터 5점까지이므로 칸 6개짜리 `count` 배열을 만듭니다.
`2`점이 두 번 나왔으니 `count[2]`는 `2`가 됩니다.

계수 정렬은 값 `n`개를 한 번 세고 값의 범위 `k`칸을 한 번 훑으므로 `O(n + k)`입니다.
비교하는 정렬보다 빠를 수 있지만 값의 범위가 작은 정수일 때만 쓸 수 있습니다.
점수가 0점부터 10억 점까지라면 칸 10억 개짜리 배열이 필요하기 때문입니다.

네 정렬을 모두 실행하면 결과가 어떻게 나올지 예상해 보세요.
전체 코드에서는 삽입 정렬이 회차마다 배열을 출력하고 계수 정렬이 개수 배열을 출력하게 했습니다.

```text
1회차: [2, 4, 5, 1, 2]
2회차: [2, 4, 5, 1, 2]
3회차: [1, 2, 4, 5, 2]
4회차: [1, 2, 2, 4, 5]
병합 정렬: [1, 2, 2, 4, 5]
힙 정렬: [1, 2, 2, 4, 5]
개수 배열: [0, 1, 2, 0, 1, 1]
계수 정렬: [1, 2, 2, 4, 5]
```

네 방법 모두 같은 결과에 도착했습니다.
그렇다면 무엇이 다를까요?

## 안정 정렬

점수만 보면 결과가 같지만 점수 뒤에 사람이 있다면 이야기가 달라집니다.
점수의 주인이 민지 4 · 도윤 2 · 서아 5 · 하준 1 · 지우 2라고 해 보겠습니다.
도윤과 지우는 둘 다 2점이고 원래 명단에서는 도윤이 먼저입니다.

**안정 정렬**은 기준 값이 같은 원소끼리는 원래 순서를 그대로 지켜 주는 정렬입니다.
같은 명단을 병합 정렬 계열인 Java의 `List.sort`와 힙인 `PriorityQueue`로 각각 정렬해 보겠습니다.

```java
List<Student> merged = new ArrayList<>(students);
merged.sort(byScore);

PriorityQueue<Student> heap = new PriorityQueue<>(byScore);
heap.addAll(students);
```

`byScore`는 점수만 비교하는 기준입니다.
두 방법에서 도윤과 지우 중 누가 먼저 나올지 예상해 보세요.

```text
병합 계열 정렬: 하준1 도윤2 지우2 민지4 서아5
힙에서 꺼내기: 하준1 지우2 도윤2 민지4 서아5
```

병합 계열 정렬에서는 원래 순서대로 도윤이 먼저입니다.
앞에서 본 `merge`처럼 두 값이 같으면 `left[i] <= right[j]`로 왼쪽 조각의 값을 먼저 옮기기 때문입니다.
반면 힙은 값을 꺼낼 때마다 트리 안에서 자리를 바꾸기 때문에 같은 점수의 순서가 뒤섞여 지우가 먼저 나왔습니다.

안정성은 여러 기준으로 차례로 정렬할 때 중요합니다.
이름순으로 정렬해 둔 명단을 다시 점수순으로 안정 정렬하면 같은 점수 안에서는 이름순이 그대로 남습니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `QuizSort.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Comparator;
> import java.util.List;
> import java.util.PriorityQueue;
>
> public class QuizSort {
>     record Student(String name, int score) {}
>
>     static void insertionSort(int[] a) {
>         for (int i = 1; i < a.length; i++) {
>             int key = a[i];
>             int j = i - 1;
>             while (j >= 0 && a[j] > key) {
>                 a[j + 1] = a[j];
>                 j--;
>             }
>             a[j + 1] = key;
>             System.out.println(i + "회차: " + Arrays.toString(a));
>         }
>     }
>
>     static int[] mergeSort(int[] a) {
>         if (a.length <= 1) return a;
>         int mid = a.length / 2;
>         int[] left = mergeSort(Arrays.copyOfRange(a, 0, mid));
>         int[] right = mergeSort(Arrays.copyOfRange(a, mid, a.length));
>         return merge(left, right);
>     }
>
>     static int[] merge(int[] left, int[] right) {
>         int[] result = new int[left.length + right.length];
>         int i = 0, j = 0, k = 0;
>         while (i < left.length && j < right.length) {
>             if (left[i] <= right[j]) result[k++] = left[i++];
>             else result[k++] = right[j++];
>         }
>         while (i < left.length) result[k++] = left[i++];
>         while (j < right.length) result[k++] = right[j++];
>         return result;
>     }
>
>     static int[] heapSort(int[] a) {
>         PriorityQueue<Integer> heap = new PriorityQueue<>();
>         for (int x : a) heap.add(x);
>         int[] result = new int[a.length];
>         for (int i = 0; i < result.length; i++) {
>             result[i] = heap.poll();
>         }
>         return result;
>     }
>
>     static int[] countingSort(int[] a, int max) {
>         int[] count = new int[max + 1];
>         for (int x : a) count[x]++;
>         System.out.println("개수 배열: " + Arrays.toString(count));
>
>         int[] result = new int[a.length];
>         int k = 0;
>         for (int value = 0; value <= max; value++) {
>             for (int c = 0; c < count[value]; c++) {
>                 result[k++] = value;
>             }
>         }
>         return result;
>     }
>
>     public static void main(String[] args) {
>         int[] scores = {4, 2, 5, 1, 2};
>
>         insertionSort(scores.clone());
>         System.out.println("병합 정렬: " + Arrays.toString(mergeSort(scores)));
>         System.out.println("힙 정렬: " + Arrays.toString(heapSort(scores)));
>         System.out.println("계수 정렬: " + Arrays.toString(countingSort(scores, 5)));
>
>         List<Student> students = List.of(
>                 new Student("민지", 4), new Student("도윤", 2), new Student("서아", 5),
>                 new Student("하준", 1), new Student("지우", 2));
>         Comparator<Student> byScore = Comparator.comparingInt(Student::score);
>
>         List<Student> merged = new ArrayList<>(students);
>         merged.sort(byScore);
>         System.out.print("병합 계열 정렬:");
>         for (Student s : merged) System.out.print(" " + s.name() + s.score());
>         System.out.println();
>
>         PriorityQueue<Student> heap = new PriorityQueue<>(byScore);
>         heap.addAll(students);
>         System.out.print("힙에서 꺼내기:");
>         while (!heap.isEmpty()) {
>             Student s = heap.poll();
>             System.out.print(" " + s.name() + s.score());
>         }
>         System.out.println();
>     }
> }
> ```
>
> ```text
> 1회차: [2, 4, 5, 1, 2]
> 2회차: [2, 4, 5, 1, 2]
> 3회차: [1, 2, 4, 5, 2]
> 4회차: [1, 2, 2, 4, 5]
> 병합 정렬: [1, 2, 2, 4, 5]
> 힙 정렬: [1, 2, 2, 4, 5]
> 개수 배열: [0, 1, 2, 0, 1, 1]
> 계수 정렬: [1, 2, 2, 4, 5]
> 병합 계열 정렬: 하준1 도윤2 지우2 민지4 서아5
> 힙에서 꺼내기: 하준1 지우2 도윤2 민지4 서아5
> ```

## 정렬 알고리즘 비교

네 정렬을 선택에 필요한 기준으로 나란히 놓으면 다음과 같습니다.
`n`은 값의 개수이고 `k`는 값의 범위입니다.

| 정렬 | 최선 | 평균 | 최악 | 추가 메모리 | 안정 정렬 | 잘 맞는 경우 |
| --- | --- | --- | --- | --- | --- | --- |
| 삽입 정렬 | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | 예 | 값이 적거나 거의 정렬된 배열 |
| 병합 정렬 | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | 예 | 늘 같은 속도와 안정성이 필요할 때 |
| 힙 정렬 | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | 아니요 | 메모리를 아끼거나 작은 값부터 몇 개만 꺼낼 때 |
| 계수 정렬 | `O(n + k)` | `O(n + k)` | `O(n + k)` | `O(n + k)` | 예 (누적 개수로 구현할 때) | 값이 좁은 범위의 정수일 때 |

힙 정렬의 추가 메모리 `O(1)`은 배열 안에서 힙을 만드는 원래 방식의 값입니다.
이 문서의 코드처럼 `PriorityQueue`를 따로 만들면 `O(n)`을 더 씁니다.
계수 정렬의 추가 메모리는 개수 배열 `k`칸과 결과 배열 `n`칸을 더한 값입니다.
또 이 문서의 코드는 숫자만 다시 적었지만 사람과 점수처럼 값에 딸린 정보가 있으면 누적 개수를 이용해 원래 순서를 지키며 옮깁니다.

## 정렬의 활용

그렇다면 코딩테스트에서는 어떤 정렬을 직접 구현해야 할까요?
대부분은 직접 구현하지 않습니다.
Java의 `Arrays.sort`와 `List.sort`가 이미 `O(n log n)` 정렬을 제공하기 때문입니다.
그래서 알고리즘의 원리를 아는 목적은 구현보다 **고르는 기준**을 갖는 데 있습니다.

- 입력이 100만 개라면 `O(n²)`인 삽입 정렬로는 시간 안에 끝나지 않으므로 `O(n log n)` 정렬을 씁니다.
- 같은 값의 원래 순서를 지켜야 하면 안정 정렬인지 확인합니다.
- 값이 0~100 같은 좁은 범위라면 계수 정렬처럼 세기만 해서 더 빠르게 풉니다.
- 전체를 정렬하지 않고 가장 작은 몇 개만 필요하면 우선순위 큐에서 그만큼만 꺼냅니다.

정렬은 다른 알고리즘의 준비 단계로도 자주 쓰입니다.
정렬된 배열에서는 [이분 탐색](#/learn/algorithm/binary-search)으로 값을 빠르게 찾을 수 있고 [투 포인터](#/learn/algorithm/two-pointers-sliding-window)로 두 값을 양 끝에서 좁혀 가며 찾을 수 있습니다.

## 정리

- 정렬은 값을 기준에 따라 순서대로 늘어놓는 일이고 다른 알고리즘의 출발점이 됩니다.
- 삽입 정렬은 앞쪽에 끼워 넣고 병합 정렬은 나눈 뒤 합치며 힙 정렬은 힙에서 가장 작은 값부터 꺼내고 계수 정렬은 값마다 개수를 셉니다.
- 병합·힙 정렬은 늘 `O(n log n)`이고 삽입 정렬은 최악 `O(n²)`이며 계수 정렬은 값의 범위가 작을 때 `O(n + k)`입니다.
- 안정 정렬은 같은 값의 원래 순서를 지키고 병합·삽입 정렬은 안정적이지만 힙 정렬은 그렇지 않습니다.

## 이어서 연습하기

[Java로 정렬하기](#/learn/algorithm/sort-java)에서 `Arrays.sort`와 `Comparator`로 여러 기준 정렬을 해 봅니다.
[기록의 중앙값 찾기](#/coding-tests/java/bridge-arr-08)에서 정렬한 뒤 가운데 값을 찾아봅니다.
[반복 측정값만 정리하기](#/coding-tests/java/bridge-srt-01)에서 값의 개수를 세고 정렬해 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)

## 핵심 질문 답

삽입 정렬은 값을 하나씩 정렬된 앞부분에 끼워 넣고 병합 정렬은 반으로 나눈 뒤 정렬하며 합칩니다.
힙 정렬은 가장 작은 값이 늘 맨 위에 있는 힙에서 하나씩 꺼내고 계수 정렬은 값마다 나온 횟수를 세어 차례로 적습니다.
병합·힙 정렬은 늘 `O(n log n)`이지만 병합 정렬은 메모리를 더 쓰는 대신 안정적이고 힙 정렬은 안정적이지 않습니다.
삽입 정렬은 거의 정렬된 작은 배열에 알맞고 계수 정렬은 값이 좁은 범위의 정수일 때 가장 빠릅니다.
