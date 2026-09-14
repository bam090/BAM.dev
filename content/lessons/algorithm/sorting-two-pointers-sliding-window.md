# 정렬·투 포인터·슬라이딩 윈도우

## 학습 목표

- Java의 숫자 기본 정렬과 비교자가 필요한 정렬을 구분할 수 있습니다.
- 투 포인터의 두 위치가 어떤 조건으로 이동하는지 추적할 수 있습니다.
- 슬라이딩 윈도우의 구간 합을 이전 값에서 갱신할 수 있습니다.
- 정렬 여부와 연속 구간 조건을 문제에서 먼저 확인할 수 있습니다.

## 한줄 요약

값의 순서로 버릴 범위를 판단하고, 연속 구간은 빠지는 값과 들어오는 값만 반영해 탐색량을 줄입니다.

## 먼저 확인할 개념

- [배열의 원소와 경계](#/learn/java/wiki-arrays): 고정 길이 배열과 유효 인덱스를 확인합니다.
- [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow): 포인터가 언제 이동하고 반복이 언제 끝나는지 읽습니다.
- [람다와 함수형 인터페이스](#/learn/java/wiki-lambdas): 정렬 기준을 전달하는 비교자를 읽습니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.heap`
- 이 단원: `algo.sorting`, `algo.two-pointers`, `algo.sliding-window`
- 후속: `algo.brute-force`, `algo.number-theory`, `algo.binary-search`

## 정렬: 먼저 비교할 순서를 만든다

배열의 모든 쌍이나 연속 구간을 매번 처음부터 조사하면 같은 값을 반복해서 확인하게 됩니다.
값을 순서대로 놓거나 이전 구간의 합을 재사용하려면, 먼저 **순서를 바꾸어도 되는지**와 **연속된 구간인지**를 확인해야 합니다.

**정렬**은 기준에 맞게 값을 순서대로 배치하는 일입니다.
Java의 `Arrays.sort(int[])`는 비교자를 전달하지 않아도 숫자를 오름차순으로 정렬합니다.
이 메서드는 전달한 배열을 바꾸므로 원본이 필요하면 `Arrays.copyOf(numbers, numbers.length)`로 복사한 배열을 정렬합니다.

| 정렬 대상·목적 | 사용하는 형태 |
| --- | --- |
| `int[]`의 숫자 오름차순 | `Arrays.sort(numbers)` |
| `Integer[]`의 숫자 내림차순 | `Arrays.sort(numbers, Comparator.reverseOrder())` |
| 객체 목록의 특정 `int` 필드 순서 | `list.sort(Comparator.comparingInt(item -> item.score))` |

비교자를 받는 배열 정렬은 `Integer[]` 같은 **참조 타입 배열**용입니다.
`int[]`에 비교자를 넣는 오버로드는 없습니다.
직접 숫자 비교자를 작성할 때는 `Integer.compare(left, right)`처럼 비교 결과를 만들며, `left - right`의 오버플로로 순서가 뒤집히지 않도록 합니다.

이 단원에서 `n`은 원소 수입니다.
정렬 비용과 정렬 후의 탐색 비용은 별도로 계산합니다.
예제의 `Arrays.sort(int[])`는 Java 25 문서의 구현 설명에서 `O(n log n)` 성능을 갖는 정렬이며, 이후의 투 포인터 탐색은 `O(n)`입니다.

## 투 포인터: 한쪽을 버릴 근거를 찾는다

**투 포인터**는 두 인덱스를 조건에 따라 움직이는 방법입니다.
오름차순 배열 `[1, 2, 4, 7, 11]`에서 서로 다른 두 위치의 합이 `9`인 쌍을 찾는다고 합시다.
처음에는 가장 왼쪽과 가장 오른쪽을 봅니다.

- 현재 합이 `9`보다 작으면, 현재 왼쪽 값은 지금 오른쪽 값보다 작은 어느 값과 더해도 목표에 못 미칩니다. 따라서 왼쪽 위치를 버리고 `left`를 늘립니다.
- 현재 합이 `9`보다 크면, 현재 오른쪽 값은 지금 왼쪽 값보다 큰 어느 값과 더해도 목표를 넘습니다. 따라서 오른쪽 위치를 버리고 `right`를 줄입니다.
- 같으면 찾은 두 값을 반환합니다.

이 근거는 정렬 상태에 의존합니다.
두 위치를 한 방향으로만 옮기므로 탐색은 `O(n)`이며, `left < right`로 같은 위치를 두 번 고르지 않습니다.
이 예제는 쌍의 **값**을 반환합니다. 원래 인덱스가 필요한 문제라면 정렬 전에 값과 인덱스를 함께 보관해야 합니다.

## 슬라이딩 윈도우: 겹치는 구간의 계산을 재사용한다

**슬라이딩 윈도우**는 시작과 끝 사이의 연속 구간을 옮기며 정보를 갱신하는 방법입니다.
`[2, 1, 5, 1, 3, 2]`에서 길이 `3`인 연속 구간의 최대 합을 찾는다고 합시다.

첫 합은 `2 + 1 + 5 = 8`입니다.
오른쪽으로 한 칸 옮기면 빠지는 `2`를 빼고 들어오는 `1`을 더해 다음 합 `7`을 얻습니다.
모든 구간을 다시 더할 필요가 없으므로 전체를 `O(n)`에 처리합니다.

고정 크기 창은 값에 음수가 있어도 같은 갱신을 사용할 수 있습니다.
최대 합을 `0`으로 시작하지 않고 **첫 구간의 실제 합**으로 시작해야 모두 음수인 입력도 다룹니다.
합 조건에 따라 창 크기를 늘리고 줄이는 다른 문제는 음수 유무 등에 따라 이동 근거가 달라지므로, 이 고정 크기 예제와 구분합니다.

## 예제: 정렬, 합이 같은 두 수, 고정 구간의 최대 합

두 수의 덧셈과 구간 합은 `long`으로 계산합니다.
특히 `(long) sorted[left] + sorted[right]`처럼 **덧셈 전에** 타입을 넓힙니다.
덧셈이 끝난 뒤 `long`에 대입해도 이미 `int`에서 넘친 값은 복구되지 않습니다.

`findPair`의 입력은 오름차순 `int[]`이며, 찾는 쌍이 없으면 길이 `0`인 배열을 반환합니다.
`maxWindowSum`은 `1 <= windowSize <= numbers.length`를 요구하고 벗어나면 `IllegalArgumentException`을 발생시킵니다.
다음은 `SortingWindowExample.java`로 구성할 수 있는 Java 25 예제입니다.

```java
import java.util.Arrays;
import java.util.Comparator;

public class SortingWindowExample {
    static int[] findPair(int[] sorted, long target) {
        int left = 0;
        int right = sorted.length - 1;
        while (left < right) {
            long sum = (long) sorted[left] + sorted[right];
            if (sum == target) return new int[]{sorted[left], sorted[right]};
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[0];
    }

    static long maxWindowSum(int[] numbers, int windowSize) {
        if (windowSize <= 0 || windowSize > numbers.length) {
            throw new IllegalArgumentException("1 <= windowSize <= length");
        }
        long windowSum = 0;
        for (int index = 0; index < windowSize; index++) {
            windowSum += numbers[index];
        }
        long maxSum = windowSum;
        for (int right = windowSize; right < numbers.length; right++) {
            int left = right - windowSize;
            windowSum -= numbers[left];
            windowSum += numbers[right];
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] original = {10, 2, 30, 4};
        int[] ascending = Arrays.copyOf(original, original.length);
        Arrays.sort(ascending);
        Integer[] descending = {10, 2, 30, 4};
        Arrays.sort(descending, Comparator.reverseOrder());
        System.out.println(Arrays.toString(ascending));
        System.out.println(Arrays.toString(original));
        System.out.println(Arrays.toString(descending));
        System.out.println(Arrays.toString(findPair(new int[]{1, 2, 4, 7, 11}, 9)));
        System.out.println(Arrays.toString(findPair(new int[0], 9)));
        System.out.println(maxWindowSum(new int[]{2, 1, 5, 1, 3, 2}, 3));
        System.out.println(maxWindowSum(new int[]{-5, -2, -4}, 2));
    }
}
```

예상 출력:

```text
[2, 4, 10, 30]
[10, 2, 30, 4]
[30, 10, 4, 2]
[2, 7]
[]
9
-6
```

## 실행 흐름에서 볼 상태

투 포인터는 `(1, 11)`의 합 `12`가 크므로 오른쪽을 줄입니다.
`(1, 7)`의 합 `8`이 작으므로 왼쪽을 늘리고, `(2, 7)`에서 `9`를 찾습니다.
버린 값으로 만들 수 있는 합의 범위를 설명할 수 있어야 이동을 이해한 것입니다.

고정 창의 합은 `8 → 7 → 9 → 6`으로 바뀝니다.
각 단계에서 `windowSum`은 현재 길이 `3` 구간의 합이고, `maxSum`은 지금까지 확인한 구간 중 가장 큰 합입니다.
구간 `[5, 1, 3]`에서 나온 `9`가 최종 결과입니다.

## 흔한 실수와 선택 기준

- `int[]` 정렬에 비교자가 반드시 필요하다고 생각하지 마세요. 기본 숫자 오름차순은 `Arrays.sort`만으로 됩니다.
- 정렬할 배열과 보존할 배열이 같은 객체인지 확인하세요. `int[] copy = original`은 복사가 아닙니다.
- 정렬되지 않은 배열에서 합이 크고 작다는 이유로 한쪽을 버리면 정답을 놓칠 수 있습니다.
- 연속되지 않은 원소 선택에 고정 창을 사용하지 마세요. 창은 시작부터 끝까지 빠짐없이 포함합니다.
- 빈 배열이나 `0`·과도한 창 크기에는 첫 구간이 존재하지 않습니다. 계산 전에 계약을 확인합니다.
- 배열을 먼저 정렬하면 원래의 연속 구간이 사라집니다. 원본 순서의 최대 구간 합을 구할 때는 정렬하면 안 됩니다.

## 이어서 학습하기

[완전 탐색·백트래킹·재귀](#/learn/algorithm/brute-force-backtracking-recursion)에서 안전하게 버릴 근거가 없을 때 후보를 빠짐없이 확인하는 방법을 봅니다.
이 예제에서는 창 크기를 `1` 또는 배열 전체 길이로 바꾸었을 때 빠지는 값과 들어오는 값이 있는지 먼저 설명해 보세요.

## 공식 자료

- [Oracle Java 25: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html): 기본형·객체 배열 정렬, 복사와 출력.
- [Oracle Java 25: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html): 역순과 필드 기준 비교.
- [Oracle Java 25 언어 명세: 정수 타입과 연산](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2): `int`·`long` 계산과 오버플로 경계.

공식 자료 확인일: 2026-09-14. 기존 BAM.dev의 입력·탐색 예제를 보존하고 Java의 정렬·타입 계약에 맞게 재구성했습니다.

## 핵심 질문 답

값이 정렬되어 있다면 두 포인터의 현재 합을 기준으로 정답이 없는 쪽을 버릴 수 있습니다.
정렬부터 해야 한다면 원본 순서가 필요한지 확인하고 정렬 비용도 포함합니다.

연속 구간의 크기가 고정되어 있다면 이전 합에서 빠지는 값을 빼고 새 값을 더해 다음 구간의 합을 만듭니다.
두 방법 모두 이미 아는 정보를 재사용하지만, 투 포인터의 이동 근거와 창의 연속성·크기 조건을 먼저 확인해야 합니다.
