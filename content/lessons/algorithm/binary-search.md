# 이분 탐색: 정렬된 범위를 절반씩 버리며 찾기

## 학습 목표

- 정렬된 배열에서 `lo`·`hi`·`mid`로 범위를 절반씩 줄여 값과 경계(lower bound)를 찾고 `Arrays.binarySearch`의 반환값을 해석할 수 있습니다.
- 조건이 한 번 바뀐 뒤 계속 유지되는 문제에서 답의 범위를 이분 탐색하는 매개변수 탐색을 적용할 수 있습니다.

## 한줄 요약

이분 탐색은 정렬된 범위의 가운데를 확인해 답이 있을 수 없는 절반을 버리는 탐색이고 값뿐 아니라 조건이 바뀌는 경계와 문제의 답 자체도 `O(log n)` 번의 확인으로 찾습니다.

## 먼저 확인할 개념

[코드에서 시간 복잡도 계산하기](#/learn/algorithm/time-complexity-in-code) · [정렬 알고리즘: 값을 순서대로 늘어놓기](#/learn/algorithm/sorting-two-pointers-sliding-window) · [Java로 정렬하기: Arrays.sort·List.sort·Comparator](#/learn/algorithm/sort-java)

## 이분 탐색이란

**이분 탐색**은 정렬된 범위의 가운데 값을 확인하고 답이 있을 수 없는 절반을 버리기를 반복해 값을 찾는 방법입니다.
이분(二分)은 둘로 나눈다는 뜻이고 영어로는 binary search라고 합니다.
앞 문서들에서 정렬을 배운 이유 중 하나가 바로 이 탐색입니다.
정렬되어 있어야 가운데 값 하나만 보고도 한쪽 절반을 통째로 버릴 수 있기 때문입니다.

예를 들어 택배 상자 일곱 개가 무게 순서대로 줄 서 있다고 해 보겠습니다.
무게는 `[2, 4, 4, 7, 9, 12, 15]`이고 이 문서는 이 상자 줄 하나로 끝까지 설명합니다.

무게가 `9`인 상자를 찾을 때 처음부터 하나씩 보면 다섯 번째에서 찾습니다.
반면 가운데 상자부터 보면 이야기가 달라집니다.

![이분 탐색으로 9를 찾는 세 단계. 1단계는 인덱스 0부터 6까지에서 가운데 3번의 7을 보고 7이 9보다 작아 왼쪽을 버린다. 2단계는 4부터 6까지에서 가운데 5번의 12를 보고 12가 9보다 커서 오른쪽을 버린다. 3단계는 4번 하나가 남아 9를 찾는다.](content/assets/algorithm/binary-search-range.png)

1단계에서 가운데 `7`은 `9`보다 작습니다.
배열이 정렬되어 있으니 `7`과 그 왼쪽은 모두 `9`보다 작아서 답이 될 수 없습니다.
그래서 왼쪽 절반을 한 번에 버리고 오른쪽만 남깁니다.
2단계에서는 가운데 `12`가 `9`보다 크니 `12`와 그 오른쪽을 버립니다.

한 번 볼 때마다 남은 범위가 절반으로 줄기 때문에 `n`개 중에서 찾는 데 약 `log n`번이면 충분합니다.
상자가 100만 개여도 20번 정도만 확인하면 됩니다.

## Java로 이분 탐색 구현

그림의 과정을 코드로 옮겨 보겠습니다.
남은 범위의 왼쪽 끝을 `lo` · 오른쪽 끝을 `hi` · 가운데를 `mid`라고 부릅니다.

```java
static int binarySearch(int[] a, int target) {
    int lo = 0;
    int hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        System.out.println("lo=" + lo + " hi=" + hi + " mid=" + mid + " 값=" + a[mid]);
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

가운데 값이 목표보다 작으면 `lo`를 `mid + 1`로 옮겨 왼쪽을 버리고 크면 `hi`를 `mid - 1`로 옮겨 오른쪽을 버립니다.
`lo`가 `hi`를 넘어서면 남은 범위가 없다는 뜻이므로 `-1`을 돌려줍니다.

`mid`를 `(lo + hi) / 2`가 아니라 `lo + (hi - lo) / 2`로 계산한 데에는 이유가 있습니다.
`lo`와 `hi`가 둘 다 15억이면 두 수를 더한 30억이 `int`의 최댓값인 약 21억을 넘기 때문입니다.
차이를 먼저 구하면 이런 넘침이 생기지 않습니다.

`9`와 `8`을 찾으면 각각 어떤 값이 출력될지 그림을 보며 예상해 보세요.

```text
lo=0 hi=6 mid=3 값=7
lo=4 hi=6 mid=5 값=12
lo=4 hi=4 mid=4 값=9
9의 위치: 4
lo=0 hi=6 mid=3 값=7
lo=4 hi=6 mid=5 값=12
lo=4 hi=4 mid=4 값=9
8의 위치: -1
```

`9`는 세 번 만에 4번 위치에서 찾았습니다.
`8`도 같은 길을 가다가 마지막에 `9`가 `8`보다 크니 `hi`가 3이 되고 `lo`가 `hi`를 넘어 `-1`로 끝납니다.

## 경계 찾기

그런데 코딩테스트에서는 값이 있는지보다 **어디부터 조건을 만족하는지**를 더 자주 묻습니다.
예를 들어 "무게가 4 이상인 상자는 몇 번째부터인가"나 "무게가 4인 상자는 몇 개인가" 같은 질문입니다.
앞의 코드는 `4`가 두 개일 때 둘 중 하나를 찾으면 바로 멈추기 때문에 이런 질문에 답하기 어렵습니다.

**lower bound**는 정렬된 배열에서 목표 값 이상인 원소가 처음 나오는 위치입니다.

![경계 찾기. 위쪽은 4 이상이 처음 나오는 경계가 1이고 그 왼쪽 2만 4보다 작다. 아래쪽은 8 이상이 처음 나오는 경계가 4로 8은 없고 7과 9 사이에 경계가 있다.](content/assets/algorithm/binary-search-lower-bound.png)

경계의 왼쪽은 모두 목표보다 작고 경계부터 오른쪽은 모두 목표 이상입니다.
`8`처럼 배열에 없는 값이어도 경계는 있고 그 값을 넣는다면 들어갈 자리를 가리킵니다.

```java
static int lowerBound(int[] a, int target) {
    int lo = 0;
    int hi = a.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```

앞의 코드와 다른 곳이 세 군데 있습니다.

| | 값 찾기 | 경계 찾기 |
| --- | --- | --- |
| 처음 `hi` | `a.length - 1` | `a.length` (모든 값이 작으면 경계가 배열 끝) |
| 반복 조건 | `lo <= hi` | `lo < hi` (`lo`와 `hi`가 만나면 그곳이 경계) |
| 가운데가 목표 이상일 때 | 같으면 바로 반환 · 크면 `hi = mid - 1` | `hi = mid` (`mid`가 경계일 수 있으니 남김) |

반복하는 동안 `lo` 왼쪽은 늘 목표보다 작고 `hi`부터 오른쪽은 늘 목표 이상입니다.
두 경계가 만나는 곳이 바로 처음으로 목표 이상이 되는 위치입니다.

```text
4 이상이 처음 나오는 위치: 1
8 이상이 처음 나오는 위치: 4
4의 개수: 2
```

`4`의 개수는 `lowerBound(5) - lowerBound(4)`로 구했습니다.
`5` 이상이 시작하는 위치 3에서 `4` 이상이 시작하는 위치 1을 빼면 그 사이에 있는 `4`의 개수가 됩니다.

## Arrays.binarySearch 사용법

Java에는 이분 탐색 메서드가 이미 있습니다.
`Arrays.binarySearch(배열, 값)`은 정렬된 배열에서 값을 찾아 위치를 돌려줍니다.

```java
System.out.println("Arrays.binarySearch 9: " + Arrays.binarySearch(weights, 9));
System.out.println("Arrays.binarySearch 8: " + Arrays.binarySearch(weights, 8));
```

`9`의 결과는 예상하기 쉽습니다.
그렇다면 배열에 없는 `8`은 무엇을 돌려줄까요?

```text
Arrays.binarySearch 9: 4
Arrays.binarySearch 8: -5
```

값이 없으면 `-(넣을 위치) - 1`을 돌려줍니다.
`8`을 넣을 위치는 앞에서 구한 경계 4이므로 `-(4) - 1 = -5`입니다.
그래서 결과가 0 이상이면 찾은 것이고 음수이면 `-(결과) - 1`로 넣을 위치를 되살릴 수 있습니다.

Java 25 API 문서는 두 가지를 분명히 적어 둡니다.
배열이 정렬되어 있지 않으면 결과를 알 수 없고 같은 값이 여러 개이면 그중 어느 것을 찾을지 보장하지 않습니다.
그래서 같은 값의 첫 위치나 개수가 필요하면 앞의 `lowerBound`를 직접 씁니다.

## 매개변수 탐색

이분 탐색은 배열 안의 값만 찾는 도구가 아닙니다.
**문제의 답 자체를 범위로 보고** 이분 탐색할 수도 있으며 이것을 **매개변수 탐색**이라고 부릅니다.

상자 줄로 문제를 하나 만들어 보겠습니다.
상자는 줄 선 순서대로 트럭에 싣고 한 트럭이 가득 차면 다음 트럭에 싣습니다.
트럭 3대로 모든 상자를 옮기려면 트럭 한 대의 적재량은 최소 얼마여야 할까요?

적재량을 하나 정하면 트럭이 몇 대 필요한지는 쉽게 셀 수 있습니다.

```java
static int trucksNeeded(int[] weights, int capacity) {
    int trucks = 1;
    int load = 0;
    for (int w : weights) {
        if (load + w > capacity) {
            trucks++;
            load = 0;
        }
        load += w;
    }
    return trucks;
}
```

```text
적재량 20이면 트럭 4대
적재량 21이면 트럭 3대
```

여기서 중요한 성질이 하나 있습니다.
적재량을 늘리면 트럭 수는 줄거나 그대로이지 늘어나지 않습니다.
그래서 "트럭 3대로 충분한가"라는 질문의 답은 적재량이 작을 때는 불가능이다가 어느 값부터는 계속 가능입니다.

![적재량 15부터 24까지 칸이 늘어서 있고 15부터 20까지는 불가능 · 21부터는 가능이다. 처음으로 가능해지는 21이 답이고 적재량 21이면 2·4·4·7 · 9·12 · 15로 나누어 트럭 3대에 싣는다.](content/assets/algorithm/binary-search-parametric.png)

그림은 가능과 불가능이 한 번만 바뀌는 모양입니다.
이 모양은 앞에서 본 경계 찾기와 같습니다.
그래서 적재량 범위에서 처음으로 가능해지는 값을 lower bound처럼 이분 탐색으로 찾습니다.

```java
static int minCapacity(int[] weights, int maxTrucks) {
    int lo = Arrays.stream(weights).max().getAsInt();
    int hi = Arrays.stream(weights).sum();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (trucksNeeded(weights, mid) <= maxTrucks) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

적재량은 가장 무거운 상자 `15`보다 작을 수 없고 모든 상자의 합 `53`이면 트럭 한 대로 충분합니다.
그래서 답의 범위는 `15`부터 `53`까지입니다.
가운데 적재량으로 가능하면 더 작은 값이 답일 수 있으니 `hi`를 줄이고 불가능하면 `lo`를 올립니다.

범위가 어떻게 줄어드는지 따라가 보겠습니다.

| `lo` | `hi` | 확인한 적재량 | 필요한 트럭 | 결과 |
| --- | --- | --- | --- | --- |
| 15 | 53 | 34 | 2대 | 가능이라 `hi = 34` |
| 15 | 34 | 24 | 3대 | 가능이라 `hi = 24` |
| 15 | 24 | 19 | 4대 | 불가능이라 `lo = 20` |
| 20 | 24 | 22 | 3대 | 가능이라 `hi = 22` |
| 20 | 22 | 21 | 3대 | 가능이라 `hi = 21` |
| 20 | 21 | 20 | 4대 | 불가능이라 `lo = 21` |

```text
최소 적재량: 21
```

적재량 39가지를 모두 확인하는 대신 여섯 번만 확인하고 답 21을 찾았습니다.
적재량의 범위가 10억까지 넓어져도 확인은 30번 정도면 끝납니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `ParcelSearch.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.Arrays;
>
> public class ParcelSearch {
>     static int binarySearch(int[] a, int target) {
>         int lo = 0;
>         int hi = a.length - 1;
>         while (lo <= hi) {
>             int mid = lo + (hi - lo) / 2;
>             System.out.println("lo=" + lo + " hi=" + hi + " mid=" + mid + " 값=" + a[mid]);
>             if (a[mid] == target) return mid;
>             if (a[mid] < target) lo = mid + 1;
>             else hi = mid - 1;
>         }
>         return -1;
>     }
>
>     static int lowerBound(int[] a, int target) {
>         int lo = 0;
>         int hi = a.length;
>         while (lo < hi) {
>             int mid = lo + (hi - lo) / 2;
>             if (a[mid] < target) lo = mid + 1;
>             else hi = mid;
>         }
>         return lo;
>     }
>
>     static int trucksNeeded(int[] weights, int capacity) {
>         int trucks = 1;
>         int load = 0;
>         for (int w : weights) {
>             if (load + w > capacity) {
>                 trucks++;
>                 load = 0;
>             }
>             load += w;
>         }
>         return trucks;
>     }
>
>     static int minCapacity(int[] weights, int maxTrucks) {
>         int lo = Arrays.stream(weights).max().getAsInt();
>         int hi = Arrays.stream(weights).sum();
>         while (lo < hi) {
>             int mid = lo + (hi - lo) / 2;
>             if (trucksNeeded(weights, mid) <= maxTrucks) hi = mid;
>             else lo = mid + 1;
>         }
>         return lo;
>     }
>
>     public static void main(String[] args) {
>         int[] weights = {2, 4, 4, 7, 9, 12, 15};
>
>         System.out.println("9의 위치: " + binarySearch(weights, 9));
>         System.out.println("8의 위치: " + binarySearch(weights, 8));
>
>         System.out.println("4 이상이 처음 나오는 위치: " + lowerBound(weights, 4));
>         System.out.println("8 이상이 처음 나오는 위치: " + lowerBound(weights, 8));
>         System.out.println("4의 개수: " + (lowerBound(weights, 5) - lowerBound(weights, 4)));
>
>         System.out.println("Arrays.binarySearch 9: " + Arrays.binarySearch(weights, 9));
>         System.out.println("Arrays.binarySearch 8: " + Arrays.binarySearch(weights, 8));
>
>         System.out.println("적재량 20이면 트럭 " + trucksNeeded(weights, 20) + "대");
>         System.out.println("적재량 21이면 트럭 " + trucksNeeded(weights, 21) + "대");
>         System.out.println("최소 적재량: " + minCapacity(weights, 3));
>     }
> }
> ```
>
> ```text
> lo=0 hi=6 mid=3 값=7
> lo=4 hi=6 mid=5 값=12
> lo=4 hi=4 mid=4 값=9
> 9의 위치: 4
> lo=0 hi=6 mid=3 값=7
> lo=4 hi=6 mid=5 값=12
> lo=4 hi=4 mid=4 값=9
> 8의 위치: -1
> 4 이상이 처음 나오는 위치: 1
> 8 이상이 처음 나오는 위치: 4
> 4의 개수: 2
> Arrays.binarySearch 9: 4
> Arrays.binarySearch 8: -5
> 적재량 20이면 트럭 4대
> 적재량 21이면 트럭 3대
> 최소 적재량: 21
> ```

## 이분 탐색의 활용

그렇다면 어떤 문제에서 이분 탐색을 떠올려야 할까요?
세 가지 신호를 확인합니다.

| 문제의 신호 | 쓰는 방법 | 상자 예제에서 |
| --- | --- | --- |
| 정렬된 배열에서 값이 있는지 찾습니다 | 값 찾기 · `Arrays.binarySearch` | 무게 9인 상자의 위치 |
| 어떤 값 이상·이하가 몇 번째부터인지 또는 몇 개인지 셉니다 | 경계 찾기 (lower bound) | 무게 4인 상자의 개수 |
| "최소 얼마면 되는가"·"최대 얼마까지 되는가"를 묻고 답이 커질수록 가능 여부가 한 번만 바뀝니다 | 매개변수 탐색 | 트럭 3대에 필요한 최소 적재량 |

매개변수 탐색이 필요한 문제는 입력 범위에서도 신호가 보입니다.
답의 범위가 10억처럼 커서 하나씩 확인할 수 없는데 답 하나를 정하면 가능한지는 `O(n)`에 확인할 수 있을 때입니다.
그러면 전체는 `O(n log 범위)`로 끝납니다.

이분 탐색을 쓰기 전에는 반드시 정렬되어 있는지 또는 가능 여부가 한 번만 바뀌는지를 확인합니다.
정렬되지 않은 배열이라면 먼저 한 번 정렬하고 여러 번 찾는 방식으로 씁니다.

## 정리

- 이분 탐색은 정렬된 범위의 가운데를 보고 답이 없는 절반을 버려 `O(log n)`에 찾습니다.
- `mid`는 `lo + (hi - lo) / 2`로 계산하고 값을 찾을 때는 `lo <= hi`까지 반복합니다.
- lower bound는 목표 이상이 처음 나오는 위치이고 `hi = a.length`·`lo < hi`·`hi = mid`로 구합니다.
- `Arrays.binarySearch`는 없는 값에 `-(넣을 위치) - 1`을 돌려주며 답이 커질수록 가능 여부가 한 번만 바뀌는 문제는 답의 범위를 이분 탐색합니다.

## 이어서 연습하기

[점수 구간 인원 세기](#/coding-tests/java/algo-binary-search-01)에서 하한과 상한 경계를 이분 탐색으로 찾아 구간 안의 개수를 세어 봅니다.
[위상 정렬](#/learn/algorithm/topological-sort)에서 선후 관계가 있는 작업의 순서를 정해 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

## 핵심 질문 답

이분 탐색은 정렬된 범위의 가운데 값을 확인해 답이 있을 수 없는 절반을 버리므로 `n`개에서 약 `log n`번 만에 찾습니다.
값이 여러 개이거나 없는 값의 자리가 필요하면 목표 이상이 처음 나오는 경계인 lower bound를 찾고 `Arrays.binarySearch`는 없는 값에 `-(넣을 위치) - 1`을 돌려줍니다.
"최소 얼마면 되는가"를 묻고 답이 커질수록 가능 여부가 한 번만 바뀌는 문제는 답의 범위 자체를 이분 탐색하는 매개변수 탐색으로 풉니다.
