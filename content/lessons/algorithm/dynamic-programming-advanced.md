# 동적 계획법 2

## 학습 목표

- 두 개의 정보가 필요한 문제를 2차원 DP 상태로 표현할 수 있습니다.
- 상태, 점화식, 초기값과 계산 순서를 2차원 표에서 연결해 설명할 수 있습니다.
- 필요한 이전 상태가 제한적일 때 2차원 표를 1차원 배열로 줄일 수 있습니다.
- 이전 선택을 저장해 최종 값뿐 아니라 실제 선택 과정도 복원할 수 있습니다.

## 한줄 요약

상태를 구분하는 정보를 표에 담고, 계산에 필요한 이전 값과 경로 복원에 필요한 선택 정보를 목적에 맞게 남깁니다.

## 먼저 확인할 개념

[이분 탐색과 동적 계획법 1](#/learn/algorithm/binary-search-and-dynamic-programming)에서 상태·점화식·초기값을 먼저 확인하세요.
Java의 [배열](#/learn/java/wiki-arrays)과 [숫자 타입](#/learn/java/wiki-numeric-operations)을 사용해 비용을 저장합니다.

## 개념 연결

- 선행: `algo.dynamic-programming`, `java.arrays`, `java.control-flow`, `java.numeric-operations`
- 이 단원: `algo.dynamic-programming-advanced`
- 후속: `algo.weighted-graph`, `algo.shortest-path`, `algo.dijkstra`

## 두 개의 정보가 필요한 상태

동적 계획법 1에서는 `ways[step]`처럼 한 번호로 작은 문제를 구분했습니다.
현재 위치가 행과 열로 정해진다면 둘 중 하나를 빼서는 어느 위치의 답인지 구별할 수 없습니다.
상태에 필요한 정보를 빠뜨리면 서로 다른 작은 문제를 같은 것으로 취급하게 됩니다.

이번에는 비용이 적힌 격자의 왼쪽 위에서 오른쪽 아래로 이동합니다.
한 번에 오른쪽 또는 아래로만 움직이고, 시작 칸을 포함해 방문한 칸의 비용을 모두 더합니다.

`best[row][column]`은 **시작 칸부터 `(row, column)`까지의 최소 누적 비용**입니다.
행과 열이 모두 필요하므로 2차원 상태를 사용합니다.
2차원 DP라고 입력이 반드시 격자일 필요는 없으며, 상태를 구분하는 정보의 개수가 기준입니다.

**먼저 관찰해 보세요.** 오른쪽과 아래쪽으로만 이동한다면 `(1, 1)`에는 어느 두 칸에서 올 수 있을까요?
목적지의 최소 비용만 아는 것과 그 비용으로 이동한 경로까지 아는 것은 같은 정보일까요?

## 초기값·점화식·계산 순서

시작 상태는 `best[0][0] = costs[0][0]`입니다.
현재 칸에는 위쪽과 왼쪽에서만 올 수 있으므로 두 이전 비용 중 작은 값에 현재 비용을 더합니다.

```text
현재 칸의 최소 비용 = 현재 칸의 비용 + min(위쪽의 최소 비용, 왼쪽의 최소 비용)
```

첫 행에는 위쪽 칸이, 첫 열에는 왼쪽 칸이 없습니다.
존재하지 않는 방향은 `0`이 아니라 도달 불가 표시인 `INF`로 둬야 실제 경로보다 싸게 선택되는 일을 막을 수 있습니다.

Java의 정수형에는 무한대 값이 없습니다.
예제는 `long` 누적 비용을 사용하고 `Long.MAX_VALUE`를 도달 불가 표시 `INF`로 예약합니다.
유효한 경로 비용은 `INF`보다 작아야 하며, `INF`에 칸 비용을 더하지 않습니다.
`Math.addExact()`는 누적 덧셈이 `long` 범위를 넘으면 조용히 잘못된 값을 만드는 대신 예외를 냅니다.

위쪽과 왼쪽 상태가 먼저 준비되도록 **위에서 아래로, 각 행에서는 왼쪽에서 오른쪽으로** 계산합니다.

## 비용과 이전 선택을 함께 저장하기

최소 비용 표만으로는 어떤 이전 칸을 선택했는지 바로 알 수 없습니다.
`previous[row][column]`에 현재 최솟값을 만들 때 선택한 이전 좌표를 저장합니다.
목표에서 시작 칸까지 이전 좌표를 따라간 뒤 순서를 뒤집으면 이동 경로가 됩니다.

위쪽과 왼쪽 비용이 같으면 예제는 위쪽을 고릅니다.
어느 쪽을 골라도 최소 비용은 같지만 복원되는 경로는 달라질 수 있습니다.

## 비용만 필요할 때 한 행만 남기기

현재 칸을 계산하는 데 필요한 값은 바로 위쪽과 현재 행의 왼쪽뿐입니다.
최종 비용만 필요하다면 한 행 크기인 `long[] best`를 덮어쓰며 사용할 수 있습니다.

| 배열 위치 | 갱신 직전 담고 있는 값 |
| --- | --- |
| `best[column]` | 이전 행의 같은 열, 즉 위쪽 값 |
| `best[column - 1]` | 이미 갱신한 현재 행의 왼쪽 값 |

왼쪽에서 오른쪽으로 계산해야 이 관계가 유지됩니다.
반대로 계산하면 왼쪽 값이 아직 이전 행의 값이므로 다른 점화식을 계산하게 됩니다.
이 배열만 남기면 선택 정보가 사라져 전체 경로를 바로 복원할 수 없습니다.

## Java 예제: 경로를 보관하는 방법과 비용만 보관하는 방법

정식 Java 25 예제입니다.
입력은 한 칸 이상의 직사각형 `int` 비용 격자이며 벽은 없습니다.
누적 비용은 `long`으로 저장합니다.
오른쪽·아래로만 이동하므로 음수 칸 비용이 있어도 순환 없이 앞선 상태로부터 계산할 수 있습니다.

`Cell`은 좌표를, `RouteResult`는 비용·경로·표를 함께 보관하는 결과 객체입니다.
두 메서드가 같은 격자에서 같은 최소 비용을 내는지 비교해 보세요.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DynamicProgrammingExample {
    static final long INF = Long.MAX_VALUE;

    static final class Cell {
        final int row;
        final int column;

        Cell(int row, int column) {
            this.row = row;
            this.column = column;
        }

        @Override
        public String toString() {
            return "(" + row + ", " + column + ")";
        }
    }

    static final class RouteResult {
        final long cost;
        final List<Cell> path;
        final long[][] table;

        RouteResult(long cost, List<Cell> path, long[][] table) {
            this.cost = cost;
            this.path = path;
            this.table = table;
        }
    }

    static RouteResult findCheapestRoute(int[][] costs) {
        int rows = costs.length;
        int columns = costs[0].length;
        long[][] best = new long[rows][columns];
        for (long[] row : best) Arrays.fill(row, INF);
        Cell[][] previous = new Cell[rows][columns];
        best[0][0] = costs[0][0];

        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (row == 0 && column == 0) continue;
                long fromTop = row > 0 ? best[row - 1][column] : INF;
                long fromLeft = column > 0 ? best[row][column - 1] : INF;
                long earlierCost = Math.min(fromTop, fromLeft);
                if (earlierCost == INF) continue;
                best[row][column] = Math.addExact(earlierCost, costs[row][column]);
                previous[row][column] = fromTop <= fromLeft
                        ? new Cell(row - 1, column) : new Cell(row, column - 1);
            }
        }

        List<Cell> path = new ArrayList<>();
        Cell position = new Cell(rows - 1, columns - 1);
        while (position != null) {
            path.add(position);
            position = previous[position.row][position.column];
        }
        Collections.reverse(path);
        return new RouteResult(best[rows - 1][columns - 1], path, best);
    }

    static long findCheapestCost(int[][] costs) {
        int columns = costs[0].length;
        long[] best = new long[columns];
        Arrays.fill(best, INF);
        for (int row = 0; row < costs.length; row++) {
            for (int column = 0; column < columns; column++) {
                if (row == 0 && column == 0) {
                    best[0] = costs[0][0];
                    continue;
                }
                long fromTop = best[column];
                long fromLeft = column > 0 ? best[column - 1] : INF;
                long earlierCost = Math.min(fromTop, fromLeft);
                if (earlierCost == INF) continue;
                best[column] = Math.addExact(earlierCost, costs[row][column]);
            }
        }
        return best[columns - 1];
    }

    public static void main(String[] args) {
        int[][] costs = {{1, 4, 2}, {2, 1, 5}, {3, 2, 1}};
        RouteResult route = findCheapestRoute(costs);
        System.out.println(route.cost);
        System.out.println(route.path);
        System.out.println(Arrays.deepToString(route.table));
        System.out.println(findCheapestCost(costs));
    }
}
```

예상 출력:

```text
7
[(0, 0), (1, 0), (1, 1), (2, 1), (2, 2)]
[[1, 5, 7], [3, 4, 9], [6, 6, 7]]
7
```

## 실행 흐름에서 확인할 지점

1. 시작 칸은 `1`입니다. 첫 행은 왼쪽에서만 올 수 있어 `[1, 5, 7]`이 됩니다.
2. 두 번째 행의 첫 칸은 위에서 내려와 `3`이 됩니다. 가운데 칸은 위쪽 `5`보다 왼쪽 `3`을 선택해 `4`가 됩니다.
3. 두 번째 행은 `[3, 4, 9]`, 마지막 행은 `[6, 6, 7]`입니다.
4. 목표에서 이전 좌표를 따라가면 `(2, 2) → (2, 1) → (1, 1) → (1, 0) → (0, 0)`입니다.
5. 이 순서를 뒤집은 경로의 비용은 `1 + 2 + 1 + 2 + 1 = 7`입니다.
6. 1차원 배열도 행을 처리할 때마다 `[1, 5, 7]`, `[3, 4, 9]`, `[6, 6, 7]`로 바뀝니다.

두 방식의 시간은 모두 `O(rows × columns)`입니다.
경로와 표를 보관하면 추가 공간은 `O(rows × columns)`이고, 비용만 계산하는 두 번째 방식은 `O(columns)`입니다.

## 흔한 실수와 직접 확인하기

- `best`를 무엇의 최솟값인지 좌표까지 포함해 한 문장으로 설명하지 못하면 서로 다른 상태를 섞기 쉽습니다.
- 없는 방향의 비용을 `0`으로 두면 가짜 경로가 선택될 수 있습니다. 실제 비용 `0`과 `INF`를 구분하세요.
- 같은 행 배열을 여러 행에 대입하면 한 칸 수정이 다른 행에도 영향을 줍니다. 예제처럼 `new long[rows][columns]`로 만들고 행마다 초기화하세요.
- 1차원 배열을 오른쪽부터 갱신하거나 갱신 순서를 바꾸면 필요한 이전 값이 달라집니다.
- 최소 비용만 남겨 놓고 경로를 바로 출력할 수 있다고 생각하지 마세요. 선택 정보가 있는지 확인해야 합니다.

한 칸, 한 행, 한 열인 격자에서 초기값과 이전 위치를 추적해 보세요.
두 방향의 이전 비용이 같은 칸에서는 어떤 경로를 선택하며 왜 최소 비용은 바뀌지 않는지도 설명해 보세요.
메모리를 줄이기 전에 최종 비용만 필요한지 경로도 필요한지 먼저 정하세요.

## 이어서 학습하기

[가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra)에서 연결된 정점의 거리 후보를 갱신하는 방법을 확인하세요.
DP의 계산 순서와 달리, 그래프에서는 간선 조건에 맞는 처리 순서를 따로 정해야 합니다.

## 공식 자료

- [NIST: Dynamic Programming](https://xlinux.nist.gov/dads/HTML/dynamicprog.html)
- [Java 25: Arrays.fill](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25: Math.addExact](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html)
- [Java 25: Collections.reverse](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html)
- [Java 언어 명세 25: 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 격자·경로·비용 비교를 유지하고 Java의 정수 누적과 배열 표현으로 재구성했습니다.

## 핵심 질문 답

상태가 행과 열처럼 두 정보로 결정되면 두 정보를 모두 인덱스로 담아 작은 문제를 구분합니다.
각 상태의 뜻과 초기값을 정한 뒤 필요한 이전 상태가 먼저 준비되는 순서로 점화식을 계산합니다.
예제는 위쪽과 왼쪽의 최소 비용 중 작은 값에 현재 비용을 더하므로 위에서 아래로, 왼쪽에서 오른쪽으로 계산합니다.
최종 비용만 필요하면 한 행을 덮어쓸 수 있지만, 경로도 필요하면 선택한 이전 좌표를 보관하고 목표에서 거꾸로 따라간 뒤 뒤집어야 합니다.
