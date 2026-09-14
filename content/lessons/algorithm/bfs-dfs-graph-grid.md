# BFS·DFS와 그래프·격자 탐색

## 학습 목표

- 정점과 간선, 인접 리스트의 관계를 설명할 수 있습니다.
- BFS가 큐로 층별 탐색하는 흐름을 추적할 수 있습니다.
- DFS가 스택이나 재귀로 한 경로를 깊게 탐색하는 흐름을 추적할 수 있습니다.
- 격자를 그래프로 보고 방문 표시와 경계 검사를 적용할 수 있습니다.

## 한줄 요약

연결된 대상을 인접 리스트나 격자로 표현하고, BFS는 가까운 곳부터, DFS는 한 경로를 깊게 따라가며 방문합니다.

## 먼저 확인할 개념

[스택과 큐](#/learn/algorithm/stack-and-queue)의 처리 순서와 [재귀](#/learn/algorithm/brute-force-backtracking-recursion)의 호출·복귀를 먼저 확인하세요.
Java 배열 생성과 인덱스가 낯설다면 [배열의 원소와 경계](#/learn/java/wiki-arrays)를 읽어 보세요.

## 개념 연결

- 선행: `algo.stack`, `algo.queue`, `algo.recursion`, `java.arrays`
- 이 단원: `algo.graph-representation`, `algo.bfs`, `algo.dfs`, `algo.grid-traversal`
- 후속: `algo.tree`, `algo.tree-traversal`, `algo.simulation`, `algo.dijkstra`

## 연결 관계를 저장하기

친구 관계, 도로와 웹 페이지처럼 연결을 따라가는 문제에서는 **정점**이 대상이고 **간선**이 연결입니다.
각 정점에서 바로 갈 수 있는 이웃을 모아 저장한 것이 **인접 리스트**입니다.

예제의 정점 번호는 `0`부터 `3`까지입니다.
`int[][] graph = {{1, 2}, {0, 3}, {0, 3}, {1, 2}}`에서 `graph[0]`은 정점 `0`의 이웃 `1`, `2`입니다.
각 행의 길이는 정점마다 달라도 됩니다.

양방향 간선이라면 양쪽 정점의 목록에 서로를 넣습니다.
방향 그래프라면 이동 가능한 방향만 저장합니다.
번호를 배열 인덱스로 쓰므로 시작점과 모든 이웃 번호는 `0` 이상 `graph.length` 미만이어야 합니다.

**먼저 관찰해 보세요.** `0`에서 출발해 `1`과 `2`가 모두 `3`을 발견한다면 `3`을 두 번 처리하지 않으려면 무엇을 기록해야 할까요?

## BFS: 가까운 정점부터 확인하기

BFS는 큐로 먼저 발견한 정점부터 처리하는 **너비 우선 탐색**입니다.
Java에서는 `Deque<Integer> queue = new ArrayDeque<>()`로 큐를 만들고 `offerLast()`로 뒤에 넣고 `removeFirst()`로 앞에서 꺼냅니다.
`removeFirst()`는 빈 큐에서 예외가 나므로 반복 조건에서 `isEmpty()`를 확인합니다.

`distance`를 `Arrays.fill(distance, -1)`로 채워 아직 발견하지 않은 정점을 구분합니다.
시작점은 거리 `0`이고, 새로운 이웃은 **큐에 넣기 전에** 현재 거리보다 `1` 큰 값을 기록합니다.
이미 거리가 있으면 다른 경로에서 다시 발견해도 넣지 않습니다.

모든 간선 비용이 같을 때 이렇게 얻은 거리는 최소 간선 수입니다.
간선마다 비용이 다르면 일반 BFS로 최소 비용을 보장할 수 없습니다.

## DFS: 한 경로를 깊게 따라가기

DFS는 한 이웃의 탐색을 끝낸 뒤 돌아와 다음 이웃을 확인하는 **깊이 우선 탐색**입니다.
아래 예제는 재귀 호출 스택을 사용합니다.
정점의 재귀 호출에 들어오자마자 방문을 표시하고, 아직 방문하지 않은 이웃으로만 재귀 호출합니다.

이웃이 저장된 순서대로 `0 → 1 → 3 → 2`를 방문합니다.
이웃 목록의 순서가 달라지면 방문 순서도 달라질 수 있고, DFS가 구한 경로가 최단 경로인 것은 아닙니다.
매우 깊은 그래프에서는 재귀 호출이 `StackOverflowError`를 일으킬 수 있으므로 직접 스택을 관리하는 반복 구현을 고려합니다.
반복 구현에서도 재귀와 같은 순회가 필요하다면 다음에 확인할 이웃 위치까지 관리해야 합니다.

## 격자도 그래프로 보기

격자의 통과 가능한 칸을 정점으로, 상하좌우 이동을 간선으로 보면 같은 BFS를 적용할 수 있습니다.
예제에서 `S`는 시작점, `G`는 목표점, `#`은 벽이며 한 번의 이동 비용은 `1`입니다.

새 좌표를 계산한 뒤에는 **행·열 범위 → 벽 → 방문 여부** 순서로 검사합니다.
범위를 확인하기 전에 `grid[nextRow][nextColumn]`을 읽으면 배열 범위를 벗어날 수 있습니다.

거리 표는 `new int[rows][columns]`로 만들고 각 행을 따로 `-1`로 채웁니다.
같은 행 배열을 여러 행에 대입하면 한 칸을 바꿨을 때 다른 행도 함께 바뀌므로 피합니다.

## Java 예제: 방문 순서와 최소 이동 횟수

다음은 정식 Java 25 예제입니다.
그래프는 하나 이상의 정점과 유효한 이웃 번호를 가지며, 격자는 한 칸 이상의 직사각형이고 시작 칸 `(0, 0)`은 벽이 아니라고 가정합니다.
`BfsResult`는 방문 순서와 거리 배열을 함께 돌려주기 위한 작은 결과 객체입니다.

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;

public class GraphTraversalExample {
    static final class BfsResult {
        final List<Integer> order;
        final int[] distance;

        BfsResult(List<Integer> order, int[] distance) {
            this.order = order;
            this.distance = distance;
        }
    }

    static BfsResult bfs(int[][] graph, int start) {
        int[] distance = new int[graph.length];
        Arrays.fill(distance, -1);
        List<Integer> order = new ArrayList<>();
        Deque<Integer> queue = new ArrayDeque<>();
        distance[start] = 0;
        queue.offerLast(start);

        while (!queue.isEmpty()) {
            int current = queue.removeFirst();
            order.add(current);
            for (int next : graph[current]) {
                if (distance[next] != -1) continue;
                distance[next] = distance[current] + 1;
                queue.offerLast(next);
            }
        }
        return new BfsResult(order, distance);
    }

    static void visitDepthFirst(int[][] graph, int current,
                                boolean[] visited, List<Integer> order) {
        visited[current] = true;
        order.add(current);
        for (int next : graph[current]) {
            if (!visited[next]) {
                visitDepthFirst(graph, next, visited, order);
            }
        }
    }

    static List<Integer> dfs(int[][] graph, int start) {
        List<Integer> order = new ArrayList<>();
        visitDepthFirst(graph, start, new boolean[graph.length], order);
        return order;
    }

    static int[][] gridDistances(char[][] grid) {
        int rows = grid.length;
        int columns = grid[0].length;
        int[][] distance = new int[rows][columns];
        for (int[] row : distance) Arrays.fill(row, -1);
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        Deque<int[]> queue = new ArrayDeque<>();
        distance[0][0] = 0;
        queue.offerLast(new int[] {0, 0});

        while (!queue.isEmpty()) {
            int[] current = queue.removeFirst();
            int row = current[0];
            int column = current[1];
            for (int[] direction : directions) {
                int nextRow = row + direction[0];
                int nextColumn = column + direction[1];
                if (nextRow < 0 || nextRow >= rows
                        || nextColumn < 0 || nextColumn >= columns) continue;
                if (grid[nextRow][nextColumn] == '#') continue;
                if (distance[nextRow][nextColumn] != -1) continue;
                distance[nextRow][nextColumn] = distance[row][column] + 1;
                queue.offerLast(new int[] {nextRow, nextColumn});
            }
        }
        return distance;
    }

    public static void main(String[] args) {
        int[][] graph = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
        BfsResult result = bfs(graph, 0);
        System.out.println(result.order);
        System.out.println(Arrays.toString(result.distance));
        System.out.println(dfs(graph, 0));

        char[][] grid = {"S..#".toCharArray(), ".#..".toCharArray(),
                         "...G".toCharArray()};
        System.out.println(gridDistances(grid)[2][3]);
    }
}
```

예상 출력:

```text
[0, 1, 2, 3]
[0, 1, 1, 2]
[0, 1, 3, 2]
5
```

## 실행 흐름에서 확인할 지점

1. BFS는 `0`의 거리를 `0`으로 기록하고 큐에 넣습니다.
2. `0`의 이웃 `1`, `2`는 거리 `1`이 됩니다.
3. `1`에서 `3`을 발견하면 거리 `2`를 기록합니다. 이후 `2`에서 같은 `3`을 만나도 다시 넣지 않습니다.
4. DFS는 `0`의 첫 이웃 `1`, 그 이웃 `3`, 아직 방문하지 않은 `2`로 내려갑니다.
5. 격자에서는 `(0, 0) → (1, 0) → (2, 0) → (2, 1) → (2, 2) → (2, 3)`이 다섯 번의 이동으로 목표에 도착하는 경로 중 하나입니다.

한 시작점에서 닿을 수 없는 정점이나 칸의 거리는 `-1`로 남습니다.
그래프 전체가 여러 덩어리라면 한 번의 탐색으로 모든 덩어리를 방문하지 않습니다.

인접 리스트 BFS와 DFS는 각 정점과 간선을 한정된 횟수 확인하므로 시간은 `O(V + E)`입니다.
방문·거리·대기 공간은 `O(V)`이고, 재귀 DFS의 호출 공간도 최악에는 `O(V)`입니다.
상하좌우 격자는 각 칸의 방향 수가 고정되어 시간과 거리 표 공간이 `O(rows × columns)`입니다.

## 흔한 실수와 직접 확인하기

- BFS에서 꺼낸 뒤 방문을 표시하면 같은 정점이 큐에 중복으로 들어갈 수 있습니다. 넣는 시점을 확인하세요.
- DFS에 거리 배열만 붙인다고 최단 거리가 보장되지는 않습니다. 어떤 순서로 방문했는지 먼저 확인하세요.
- 양방향 간선을 한쪽만 저장하면 다른 쪽에서 돌아오는 연결이 사라집니다.
- 격자 바깥을 읽거나 같은 행 배열을 공유하지 않았는지 확인하세요.

시작점 하나만 있는 그래프, 닿을 수 없는 정점, 목표로 가는 길이 막힌 격자를 손으로 추적해 보세요.
BFS에서 처음 기록한 거리가 최소 간선 수인 이유와 DFS가 다른 방문 순서를 만드는 이유를 자신의 말로 설명해 보세요.

## 이어서 학습하기

[트리](#/learn/algorithm/tree-basics)에서 부모·자식 구조를 순회하며 BFS와 DFS의 차이를 다시 확인하세요.
이동 비용이 서로 다르다면 뒤의 [가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra)로 이어집니다.

## 공식 자료

- [Princeton Algorithms: Undirected Graphs](https://algs4.cs.princeton.edu/41graph/)
- [Java 25: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
- [Java 25: Arrays.fill](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 언어 명세 25: 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 예제의 연결 관계와 관찰 목표를 유지하고 Java로 설명·예제를 재구성했습니다.

## 핵심 질문 답

서로 연결된 정점이나 격자 칸은 이웃 관계와 방문 상태를 함께 저장해 탐색합니다.
인접 리스트는 각 정점의 이웃을 저장하고, 격자는 유효한 상하좌우 칸을 이웃으로 봅니다.
BFS는 큐에 넣을 때 방문·거리를 기록하며 가까운 정점부터 처리하고, DFS는 방문을 기록한 뒤 한 이웃의 탐색을 끝내고 다음 이웃으로 넘어갑니다.
이미 방문한 곳은 다시 탐색하지 않으며 격자 값은 범위를 먼저 확인한 뒤 읽습니다.
일반 BFS의 최단 거리 보장은 모든 이동 비용이 같을 때만 성립하고, 한 시작점으로는 연결되지 않은 곳까지 방문하지 못합니다.
