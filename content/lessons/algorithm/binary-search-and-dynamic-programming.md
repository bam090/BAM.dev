# 이분 탐색과 동적 계획법 1

## 학습 목표

- 이분 탐색이 적용되는 정렬·단조 조건을 확인할 수 있습니다.
- 반열린 구간의 left, middle, right 변화를 추적할 수 있습니다.
- DP의 상태, 점화식, 초기값과 계산 순서를 설명할 수 있습니다.
- 메모이제이션과 바텀업 방식의 공통 목적을 설명할 수 있습니다.

## 한줄 요약

이분 탐색은 답이 있을 경계를 좁히고, 동적 계획법은 뜻이 정해진 작은 상태의 답을 저장해 반복 계산을 줄입니다.

## 먼저 확인할 개념

- [배열의 원소와 경계](#/learn/java/wiki-arrays): 길이와 유효 인덱스를 구분합니다.
- [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations): 인덱스 계산과 경우의 수의 범위를 확인합니다.
- [완전 탐색·백트래킹·재귀](#/learn/algorithm/brute-force-backtracking-recursion): 작은 문제와 재귀 호출을 연결합니다.

## 개념 연결

- 선행: `algo.sorting`, `algo.brute-force`, `algo.recursion`, `algo.number-theory`
- 이 단원: `algo.binary-search`, `algo.dynamic-programming`
- 후속: `algo.graph-representation`, `algo.tree`, `algo.dynamic-programming-advanced`

## 이분 탐색: 답이 있을 수 없는 절반을 버린다

**이분 탐색**은 정렬된 범위의 가운데를 확인하고 답이 있을 방향만 남기는 탐색입니다.
오름차순 배열에서 어떤 값 이상이 처음 나타나는 위치를 찾으면, 중복값의 첫 위치도 확인할 수 있습니다.

이 예제의 탐색 범위는 왼쪽은 포함하고 오른쪽은 제외하는 **반열린 구간** `[left, right)`입니다.
처음에는 `left = 0`, `right = sortedValues.length`로 모든 인덱스를 포함합니다.
가운데는 `left + (right - left) / 2`로 계산합니다.
음수가 아닌 `int` 나눗셈은 소수 부분을 버리며, 먼저 차를 구하는 형태는 `left + right`의 오버플로를 피합니다.

| 가운데 값의 조건 | 바꾸는 값 | 근거 |
| --- | --- | --- |
| 목표값보다 작음 | `left = middle + 1` | 가운데와 그 왼쪽 값은 모두 목표보다 작음 |
| 목표값보다 크거나 같음 | `right = middle` | 첫 경계가 가운데 또는 그보다 왼쪽에 있음 |

`right = middle`로 바꾸면 가운데는 다음에 조사할 인덱스 구간에서는 빠지지만, **첫 위치가 될 수 있는 경계값**으로 남습니다.
반복 중에는 `left`보다 작은 인덱스의 값이 목표보다 작고, `right` 이상인 인덱스의 값은 목표 이상입니다.
`left == right`가 되면 그 경계를 얻으며, 실제 값이 목표와 같은지 마지막으로 확인합니다.
경계가 배열 길이일 수도 있으므로 먼저 인덱스 범위를 검사합니다.

이 원리는 `거짓 → 참`처럼 결과가 한 방향으로만 바뀌는 **단조 조건**의 경계에도 사용할 수 있습니다.
매 단계에서 조사 범위를 절반가량 줄이므로 이 탐색은 `O(log n)`입니다.
정렬이 필요하다면 전체 비용에 정렬도 포함해야 합니다.

## 동적 계획법: 작은 답의 뜻과 계산 순서를 정한다

**동적 계획법(DP)**은 반복해서 필요한 작은 문제의 답을 저장하고 큰 답을 만드는 방법입니다.
배열만 만들었다고 DP가 되는 것은 아닙니다.
먼저 다음을 정해야 합니다.

| 정할 것 | 계단 예제에서의 뜻 |
| --- | --- |
| 상태 | `ways[step]`: 정확히 `step`칸에 도착하는 방법의 수 |
| 초기값 | `ways[0] = 1`, `ways[1] = 1` |
| 점화식 | `ways[step] = ways[step - 1] + ways[step - 2]` |
| 계산 순서 | 필요한 이전 두 칸을 먼저 계산하도록 작은 칸부터 채움 |

한 번에 한 칸 또는 두 칸을 오릅니다.
마지막에 한 칸 올랐다면 `step - 1`에서, 두 칸 올랐다면 `step - 2`에서 왔습니다.
두 경우는 겹치지 않고 마지막 이동을 빠짐없이 포함하므로 방법 수를 더할 수 있습니다.
`ways[0]`의 `1`은 아무 이동도 하지 않고 출발 위치에 머무는 한 가지 방법입니다.

초기값부터 반복문으로 표를 채우는 방법을 **바텀업·상향식 DP**라고 합니다.
필요한 답을 재귀로 요청하면서 이미 구한 값을 저장하는 방식은 **메모이제이션**입니다.
계산 순서는 다르지만 한 번 구한 상태를 재사용한다는 목적은 같습니다.
이 단원은 표의 흐름을 직접 볼 수 있는 바텀업 방식으로 구현합니다.

## 예제: 중복값의 첫 위치와 계단의 경우의 수

`findFirstPosition`은 오름차순 `int[]`에서 첫 위치를 찾고, 값이 없으면 `-1`을 반환합니다.
빈 배열에서도 범위를 벗어나 읽지 않습니다.
Java의 `Arrays.binarySearch`는 중복값의 첫 위치를 보장하지 않으므로 이 예제의 계약을 그대로 대신하지는 못합니다.

계단의 경우의 수는 빠르게 커지므로 `long[]`을 사용합니다.
이 예제는 `0 <= steps <= 91`로 제한합니다.
`91`칸의 방법 수는 `7,540,113,804,746,346,429`로 `long` 안에 들어가지만, `92`칸은 `12,200,160,415,121,876,738`로 `Long.MAX_VALUE`를 넘습니다.
더 큰 입력을 지원하려면 수 표현부터 바꾸어야 하며, 일반 덧셈이 오버플로를 자동으로 알려 줄 것이라 기대하지 않습니다.

다음은 `BinarySearchDpExample.java`로 구성할 수 있는 Java 25 예제입니다.

```java
import java.util.Arrays;

public class BinarySearchDpExample {
    static int findFirstPosition(int[] sortedValues, int target) {
        int left = 0;
        int right = sortedValues.length;
        while (left < right) {
            int middle = left + (right - left) / 2;
            if (sortedValues[middle] >= target) {
                right = middle;
            } else {
                left = middle + 1;
            }
        }
        if (left < sortedValues.length && sortedValues[left] == target) {
            return left;
        }
        return -1;
    }

    static long countWays(int steps) {
        if (steps < 0 || steps > 91) {
            throw new IllegalArgumentException("0 <= steps <= 91");
        }
        long[] ways = new long[steps + 1];
        ways[0] = 1L;
        if (steps >= 1) ways[1] = 1L;
        for (int step = 2; step <= steps; step++) {
            ways[step] = ways[step - 1] + ways[step - 2];
        }
        return ways[steps];
    }

    public static void main(String[] args) {
        System.out.println(findFirstPosition(new int[]{1, 2, 2, 2, 3}, 2));
        System.out.println(findFirstPosition(new int[]{1, 3, 5, 7}, 4));
        System.out.println(findFirstPosition(new int[0], 1));
        long[] answers = {countWays(0), countWays(1), countWays(2), countWays(5)};
        System.out.println(Arrays.toString(answers));
        System.out.println(countWays(91));
    }
}
```

예상 출력:

```text
1
-1
-1
[1, 1, 2, 8]
7540113804746346429
```

## 실행 흐름에서 볼 상태

첫 위치 탐색의 입력은 `[1, 2, 2, 2, 3]`, 목표는 `2`입니다.

| 조사 구간 | 가운데 인덱스·값 | 다음 경계 |
| --- | --- | --- |
| `[0, 5)` | `2`·`2` | `right = 2` |
| `[0, 2)` | `1`·`2` | `right = 1` |
| `[0, 1)` | `0`·`1` | `left = 1` |

두 경계가 `1`에서 만나면 그 인덱스의 값이 `2`임을 확인하고 반환합니다.
처음 같은 값을 발견한 인덱스 `2`에서 멈췄다면 첫 위치를 놓쳤을 것입니다.

계단은 `ways[0] = 1`, `ways[1] = 1`에서 시작합니다.
이후 `ways[2] = 2`, `ways[3] = 3`, `ways[4] = 5`, `ways[5] = 8`을 순서대로 만듭니다.
각 상태를 한 번 채우므로 시간과 표의 공간은 모두 `O(steps)`입니다.

## 흔한 실수와 확인할 지점

- 정렬·단조 조건 없이 가운데를 보고 절반을 버리면 정답을 놓칩니다. 버리는 범위의 모든 값에 같은 판단이 적용되는지 확인하세요.
- 닫힌 구간과 반열린 구간의 갱신을 섞지 마세요. 여기서 `left = middle`이면 같은 인덱스를 다시 확인하며 끝나지 않을 수 있습니다.
- 가운데가 목표와 같다고 즉시 반환하면 첫 위치라는 계약을 놓칩니다. 더 왼쪽의 경계를 찾습니다.
- 마지막 경계가 배열 길이면 그 위치의 원소는 없습니다. `left < sortedValues.length`를 먼저 확인합니다.
- DP의 상태 뜻을 생략하면 초기값과 점화식을 맞출 수 없습니다. 한 칸이 무엇을 센 값인지 문장으로 적습니다.
- `steps == 0`인데 `ways[1]`에 무조건 접근하면 범위를 벗어납니다. 가장 작은 입력부터 확인합니다.
- 그리디는 현재 선택을 확정하지만 DP는 필요한 여러 작은 상태의 답을 모읍니다. 두 전략을 같은 이유로 적용하지 않습니다.

## 이어서 학습하기

[BFS·DFS와 그래프·격자 탐색](#/learn/algorithm/bfs-dfs-graph-grid)에서 연결 관계를 저장하고 방문 순서에 따라 탐색하는 방법을 이어서 봅니다.
현재 이분 탐색 입력의 목표를 `0`과 `4`로 바꾸었다고 가정하고, 최종 경계가 각각 어디이며 왜 `-1`이 되는지 설명해 보세요.

## 공식 자료

- [Princeton Algorithms: Programming Model](https://algs4.cs.princeton.edu/11model/): Java 이분 탐색과 탐색 범위.
- [Princeton Introduction to Programming in Java: Recursion](https://introcs.cs.princeton.edu/java/23recursion/): 메모이제이션과 동적 계획법의 재사용.
- [Oracle Java 25: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html): `binarySearch`의 정렬 전제와 중복값 계약.
- [Oracle Java 25 언어 명세: 정수 타입과 연산](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2): 고정 정수 범위와 오버플로.

공식 자료 확인일: 2026-09-14. 기존 BAM.dev의 첫 위치 탐색과 계단 점화식을 Java 25 기준으로 재구성했습니다.

## 핵심 질문 답

이분 탐색은 정렬 또는 단조 조건을 바탕으로 답이 있을 경계를 저장하고, 가운데를 비교해 답이 없는 절반을 버립니다.
반열린 구간의 포함·제외 규칙과 중복값의 첫 위치라는 반환 계약을 유지해야 합니다.

동적 계획법은 각 상태의 뜻을 정하고 초기값·점화식·계산 순서에 따라 작은 답을 저장합니다.
계단 예제는 이전 한 칸과 두 칸의 방법 수를 더해 현재 답을 만들며, 메모이제이션과 바텀업 모두 이미 계산한 답을 재사용합니다.
입력 크기에 맞는 저장 타입을 선택해야 계산한 답을 잃지 않습니다.
