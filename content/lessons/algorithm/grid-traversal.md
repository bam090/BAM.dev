# Java로 그래프와 격자 탐색하기

## 학습 목표

- `List<List<Integer>>` 인접 리스트와 `ArrayDeque`로 BFS·DFS를 구현하고 방향 배열과 범위 검사로 2차원 격자에서 최소 이동 횟수를 구할 수 있습니다.

## 한줄 요약

Java에서는 `ArrayList`를 겹쳐 인접 리스트를 만들고 `ArrayDeque`를 큐로 쓰면 BFS가 되고 스택으로 쓰면 DFS가 되며 격자는 `dr`·`dc` 방향 배열로 이웃 칸을 계산합니다.

## 먼저 확인할 개념

[그래프와 BFS·DFS](#/learn/algorithm/bfs-dfs-graph-grid) · [큐: 먼저 온 순서대로 꺼내는 자료구조](#/learn/algorithm/queue) · [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists) · [Deque로 큐와 스택 사용하기](#/learn/java/wiki-deque)

## Java로 인접 리스트 구현

Java의 인접 리스트는 정점마다 이웃 번호를 담는 `ArrayList<Integer>`를 하나씩 만들고 그 목록들을 다시 `List`에 담은 `List<List<Integer>>`입니다.
앞 문서에서는 이웃 목록을 `int[][]`로 미리 적어 두고 BFS와 DFS를 따라가 봤습니다.
하지만 코딩테스트에서는 이웃 목록 대신 간선 목록이 입력으로 주어집니다.
그래서 간선을 하나씩 읽어 인접 리스트를 직접 만들어야 합니다.

이 문서는 창고 로봇 하나를 예로 사용합니다.
로봇은 창고의 구역 사이를 통로로 오가고 창고 바닥에서는 칸 단위로 움직입니다.

![창고 구역 0부터 5까지 정점이 있고 통로가 0-1 · 0-2 · 1-3 · 2-3 · 3-4를 잇는다. 구역 5에는 통로가 없다. 오른쪽에는 graph 인접 리스트가 0은 1 · 2 · 1은 0 · 3 · 2는 0 · 3 · 3은 1 · 2 · 4 · 4는 3 · 5는 빈 목록으로 적혀 있다.](content/assets/algorithm/grid-warehouse-graph.png)

통로는 두 구역 번호를 담은 `int[][]`로 주어집니다.

```java
static List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }
    return graph;
}
```

먼저 구역 수만큼 빈 목록을 넣어 둡니다.
그래야 `graph.get(3)`처럼 번호로 목록을 꺼낼 수 있습니다.
통로는 양쪽으로 오갈 수 있으므로 `edge[0]`의 목록에 `edge[1]`을 넣고 `edge[1]`의 목록에도 `edge[0]`을 넣습니다.
일방통행이라면 두 번째 줄을 빼고 한쪽에만 넣습니다.

```java
int[][] passages = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
List<List<Integer>> graph = buildGraph(6, passages);
System.out.println("인접 리스트: " + graph);
```

통로 5개로 만든 인접 리스트가 어떻게 찍힐지 예상해 보세요.

```text
인접 리스트: [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3], []]
```

구역 `3`의 목록에는 통로 `1-3`·`2-3`·`3-4`에서 온 `1`·`2`·`4`가 들어 있습니다.
구역 `5`는 통로가 없어서 빈 목록 `[]`입니다.
문제의 번호가 1부터 시작하면 `n + 1`개의 목록을 만들고 `0`번은 비워 둡니다.

## ArrayDeque로 BFS 구현

BFS에 쓰는 큐는 `ArrayDeque`로 만듭니다.
`ArrayDeque`는 앞과 뒤 양쪽에서 넣고 뺄 수 있는 덱이고 큐로 쓸 때는 세 메서드만 알면 됩니다.

| 메서드 | 하는 일 |
| --- | --- |
| `offer(x)` | 뒤에 `x`를 넣습니다 |
| `poll()` | 앞에서 하나를 꺼내 돌려주고 비어 있으면 `null`을 돌려줍니다 |
| `isEmpty()` | 비어 있는지 확인합니다 |

구역 `0`에서 각 구역까지 통로를 몇 번 지나야 하는지 구해 보겠습니다.

```java
static int[] bfs(List<List<Integer>> graph, int start) {
    int[] distance = new int[graph.size()];
    Arrays.fill(distance, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    distance[start] = 0;
    queue.offer(start);

    while (!queue.isEmpty()) {
        int now = queue.poll();
        for (int next : graph.get(now)) {
            if (distance[next] != -1) continue;
            distance[next] = distance[now] + 1;
            queue.offer(next);
        }
    }
    return distance;
}
```

`Arrays.fill(distance, -1)`로 모든 칸을 `-1`로 채워 아직 닿지 않은 구역을 표시합니다.
그래서 `distance`가 방문 표시와 거리 기록을 함께 맡고 `visited` 배열을 따로 만들 필요가 없습니다.
이웃의 거리는 큐에 넣기 전에 적습니다.
꺼낼 때 적으면 같은 구역이 여러 이웃에게서 발견되어 큐에 두 번 들어갈 수 있기 때문입니다.

구역 `5`의 거리는 어떻게 나올지 생각하며 결과를 예상해 보세요.

```text
BFS 거리: [0, 1, 1, 2, 3, -1]
```

구역 `4`는 `0 → 1 → 3 → 4`로 통로 3개를 지나 닿습니다.
구역 `5`는 어떤 통로로도 닿을 수 없어서 처음 채운 `-1`이 그대로 남습니다.

## DFS 구현

DFS는 재귀로 쓰는 방법과 `ArrayDeque`를 스택으로 쓰는 방법이 있습니다.

```java
static void dfs(List<List<Integer>> graph, int now, boolean[] visited, List<Integer> order) {
    visited[now] = true;
    order.add(now);
    for (int next : graph.get(now)) {
        if (!visited[next]) dfs(graph, next, visited, order);
    }
}

static List<Integer> dfsWithStack(List<List<Integer>> graph, int start) {
    boolean[] visited = new boolean[graph.size()];
    List<Integer> order = new ArrayList<>();
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);

    while (!stack.isEmpty()) {
        int now = stack.pop();
        if (visited[now]) continue;
        visited[now] = true;
        order.add(now);
        for (int next : graph.get(now)) {
            if (!visited[next]) stack.push(next);
        }
    }
    return order;
}
```

스택 버전은 `push()`로 위에 넣고 `pop()`으로 위에서 꺼냅니다.
같은 구역이 스택에 두 번 들어갈 수 있으므로 꺼낸 뒤 `visited`를 먼저 확인하고 이미 방문했으면 건너뜁니다.

두 DFS의 방문 순서가 같을지 예상해 보세요.

```text
재귀 DFS: [0, 1, 3, 2, 4]
스택 DFS: [0, 2, 3, 4, 1]
```

순서가 다릅니다.
재귀는 목록의 첫 이웃 `1`로 먼저 들어갑니다.
반면 스택은 `1`·`2`를 차례로 넣은 뒤 나중에 넣은 `2`를 먼저 꺼내기 때문입니다.
둘 다 닿을 수 있는 구역을 모두 한 번씩 방문하니 방문한 구역을 세거나 모으는 문제에서는 어느 쪽을 써도 됩니다.
재귀와 같은 순서가 꼭 필요하면 이웃을 목록의 뒤에서부터 넣습니다.

| | 재귀 DFS | 스택 DFS |
| --- | --- | --- |
| 코드 | 짧고 읽기 쉽습니다 | 반복문과 스택을 직접 다룹니다 |
| 방문 표시 | 들어가자마자 표시합니다 | 꺼낸 뒤 확인하고 표시합니다 |
| 깊이가 수만 이상일 때 | 호출이 쌓여 `StackOverflowError`가 날 수 있습니다 | 호출이 쌓이지 않습니다 |

## 격자 BFS 구현

이제 창고 바닥으로 넘어가 보겠습니다.
바닥은 2차원 배열로 나타냅니다.
`0`은 지나갈 수 있는 칸이고 `1`은 선반이 놓인 벽입니다.

```java
int[][] floor = {
    {0, 0, 0, 1},
    {1, 1, 0, 1},
    {0, 0, 0, 0}
};
```

격자는 인접 리스트를 만들지 않고 지금 칸에서 이웃 칸을 계산합니다.
**방향 배열**은 위·아래·왼쪽·오른쪽으로 갈 때 행과 열이 얼마나 바뀌는지를 적어 둔 두 배열입니다.

![가운데 칸 (r, c)의 위는 (r-1, c) · 아래는 (r+1, c) · 왼쪽은 (r, c-1) · 오른쪽은 (r, c+1)이다. 오른쪽 표에 d가 0부터 3일 때 방향 위 · 아래 · 왼쪽 · 오른쪽과 dr은 -1 · 1 · 0 · 0 · dc는 0 · 0 · -1 · 1이 적혀 있다. 다음 칸은 현재 칸에 d번 방향의 dr과 dc를 더한 칸이다.](content/assets/algorithm/grid-directions.png)

```java
static int[] dr = {-1, 1, 0, 0};
static int[] dc = {0, 0, -1, 1};
```

`d`를 0부터 3까지 돌리면 `(r + dr[d], c + dc[d])`가 차례로 위·아래·왼쪽·오른쪽 칸이 됩니다.
네 방향을 `if` 네 개로 따로 쓰지 않아도 되니 코드가 짧아지고 실수도 줄어듭니다.

큐에는 칸 하나의 행과 열을 함께 넣어야 하므로 `int[] {행, 열}`을 넣습니다.

```java
static int[][] gridBfs(int[][] grid, int startRow, int startCol) {
    int rows = grid.length;
    int cols = grid[0].length;
    int[][] distance = new int[rows][cols];
    for (int[] row : distance) {
        Arrays.fill(row, -1);
    }
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    distance[startRow][startCol] = 0;
    queue.offer(new int[] {startRow, startCol});

    while (!queue.isEmpty()) {
        int[] now = queue.poll();
        for (int d = 0; d < 4; d++) {
            int nr = now[0] + dr[d];
            int nc = now[1] + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == 1) continue;
            if (distance[nr][nc] != -1) continue;
            distance[nr][nc] = distance[now[0]][now[1]] + 1;
            queue.offer(new int[] {nr, nc});
        }
    }
    return distance;
}
```

다음 칸을 계산한 뒤에는 세 가지를 차례로 확인합니다.

1. **범위 검사**로 행이 `0` 이상 `rows` 미만이고 열이 `0` 이상 `cols` 미만인지 봅니다.
2. 벽인지 봅니다.
3. 이미 거리가 적힌 칸인지 봅니다.

순서가 중요합니다.
범위를 확인하기 전에 `grid[nr][nc]`를 읽으면 격자 밖의 칸을 읽으려다 `ArrayIndexOutOfBoundsException`이 나기 때문입니다.
`||`는 앞의 조건이 참이면 뒤를 계산하지 않으므로 범위 검사를 한 줄에 모아 두면 안전합니다.

`distance`를 `-1`로 채울 때는 `Arrays.fill`이 1차원 배열만 채운다는 점에 주의합니다.
그래서 `for`로 행을 하나씩 꺼내 채웁니다.

시작 칸 `(0, 0)`에서 각 칸까지의 최소 이동 횟수를 예상해 보세요.
특히 두 칸 아래의 출구 `(2, 0)`까지 몇 번 걸릴지 생각해 보세요.

```text
[0, 1, 2, -1]
[-1, -1, 3, -1]
[6, 5, 4, 5]
출구 (2, 0)까지: 6
```

![창고 바닥 3행 4열에 시작 칸 (0, 0)부터 잰 최소 이동 횟수가 적혀 있다. 첫 행은 0 · 1 · 2 · 벽 · 둘째 행은 벽 · 벽 · 3 · 벽 · 셋째 행은 6 · 5 · 4 · 5이다. 출구 (2, 0)은 벽을 돌아가야 해서 6번 걸린다.](content/assets/algorithm/grid-bfs-distance.png)

출구는 시작 칸에서 두 칸 아래에 있지만 사이의 `(1, 0)`이 벽이라 바로 내려갈 수 없습니다.
그래서 오른쪽으로 돌아 `(1, 2)`를 지나 내려간 뒤 다시 왼쪽으로 와야 해서 6번이 걸립니다.
벽 칸은 한 번도 큐에 들어가지 않으므로 처음 채운 `-1`이 그대로 남습니다.
벽 칸과 닿을 수 없는 빈 칸을 결과에서 구분해야 한다면 벽 칸에는 다른 값을 적어 둡니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `WarehouseRobot.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayDeque;
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Deque;
> import java.util.List;
>
> public class WarehouseRobot {
>     static List<List<Integer>> buildGraph(int n, int[][] edges) {
>         List<List<Integer>> graph = new ArrayList<>();
>         for (int i = 0; i < n; i++) {
>             graph.add(new ArrayList<>());
>         }
>         for (int[] edge : edges) {
>             graph.get(edge[0]).add(edge[1]);
>             graph.get(edge[1]).add(edge[0]);
>         }
>         return graph;
>     }
>
>     static int[] bfs(List<List<Integer>> graph, int start) {
>         int[] distance = new int[graph.size()];
>         Arrays.fill(distance, -1);
>         ArrayDeque<Integer> queue = new ArrayDeque<>();
>         distance[start] = 0;
>         queue.offer(start);
>
>         while (!queue.isEmpty()) {
>             int now = queue.poll();
>             for (int next : graph.get(now)) {
>                 if (distance[next] != -1) continue;
>                 distance[next] = distance[now] + 1;
>                 queue.offer(next);
>             }
>         }
>         return distance;
>     }
>
>     static void dfs(List<List<Integer>> graph, int now, boolean[] visited, List<Integer> order) {
>         visited[now] = true;
>         order.add(now);
>         for (int next : graph.get(now)) {
>             if (!visited[next]) dfs(graph, next, visited, order);
>         }
>     }
>
>     static List<Integer> dfsWithStack(List<List<Integer>> graph, int start) {
>         boolean[] visited = new boolean[graph.size()];
>         List<Integer> order = new ArrayList<>();
>         Deque<Integer> stack = new ArrayDeque<>();
>         stack.push(start);
>
>         while (!stack.isEmpty()) {
>             int now = stack.pop();
>             if (visited[now]) continue;
>             visited[now] = true;
>             order.add(now);
>             for (int next : graph.get(now)) {
>                 if (!visited[next]) stack.push(next);
>             }
>         }
>         return order;
>     }
>
>     static int[] dr = {-1, 1, 0, 0};
>     static int[] dc = {0, 0, -1, 1};
>
>     static int[][] gridBfs(int[][] grid, int startRow, int startCol) {
>         int rows = grid.length;
>         int cols = grid[0].length;
>         int[][] distance = new int[rows][cols];
>         for (int[] row : distance) {
>             Arrays.fill(row, -1);
>         }
>         ArrayDeque<int[]> queue = new ArrayDeque<>();
>         distance[startRow][startCol] = 0;
>         queue.offer(new int[] {startRow, startCol});
>
>         while (!queue.isEmpty()) {
>             int[] now = queue.poll();
>             for (int d = 0; d < 4; d++) {
>                 int nr = now[0] + dr[d];
>                 int nc = now[1] + dc[d];
>                 if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
>                 if (grid[nr][nc] == 1) continue;
>                 if (distance[nr][nc] != -1) continue;
>                 distance[nr][nc] = distance[now[0]][now[1]] + 1;
>                 queue.offer(new int[] {nr, nc});
>             }
>         }
>         return distance;
>     }
>
>     public static void main(String[] args) {
>         int[][] passages = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
>         List<List<Integer>> graph = buildGraph(6, passages);
>         System.out.println("인접 리스트: " + graph);
>         System.out.println("BFS 거리: " + Arrays.toString(bfs(graph, 0)));
>
>         List<Integer> order = new ArrayList<>();
>         dfs(graph, 0, new boolean[graph.size()], order);
>         System.out.println("재귀 DFS: " + order);
>         System.out.println("스택 DFS: " + dfsWithStack(graph, 0));
>
>         int[][] floor = {
>             {0, 0, 0, 1},
>             {1, 1, 0, 1},
>             {0, 0, 0, 0}
>         };
>         int[][] distance = gridBfs(floor, 0, 0);
>         for (int[] row : distance) {
>             System.out.println(Arrays.toString(row));
>         }
>         System.out.println("출구 (2, 0)까지: " + distance[2][0]);
>     }
> }
> ```
>
> ```text
> 인접 리스트: [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3], []]
> BFS 거리: [0, 1, 1, 2, 3, -1]
> 재귀 DFS: [0, 1, 3, 2, 4]
> 스택 DFS: [0, 2, 3, 4, 1]
> [0, 1, 2, -1]
> [-1, -1, 3, -1]
> [6, 5, 4, 5]
> 출구 (2, 0)까지: 6
> ```

## 그래프 탐색 도구의 선택

같은 탐색이라도 입력 모양과 묻는 것에 따라 쓰는 Java 도구가 달라집니다.

| 상황 | 쓰는 도구 |
| --- | --- |
| 간선 목록이 주어진 그래프 | `List<List<Integer>>` 인접 리스트 |
| 칸으로 된 지도나 미로 | 2차원 배열과 `dr`·`dc` 방향 배열 |
| 최소 이동 횟수 | `ArrayDeque`를 큐로 쓴 BFS와 `-1`로 채운 거리 배열 |
| 닿는 곳 모두 찾기·덩어리 세기 | 재귀 DFS 또는 `ArrayDeque`를 스택으로 쓴 DFS |
| 탐색 깊이가 수만 이상 | 스택 DFS 또는 BFS |

격자 BFS의 시간은 칸 수에 비례하는 `O(행 × 열)`입니다.
칸마다 한 번만 큐에 들어가고 꺼낼 때마다 네 방향만 보기 때문입니다.
통로마다 걸리는 시간이 다르다면 BFS의 거리는 더 이상 가장 빠른 길이 아닙니다.
그때는 [가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra)로 넘어갑니다.

## 정리

- 인접 리스트는 정점 수만큼 `new ArrayList<>()`를 먼저 넣고 양방향 간선은 두 목록에 모두 넣습니다.
- BFS는 `ArrayDeque`의 `offer()`·`poll()`로 쓰고 `-1`로 채운 거리 배열에 큐에 넣기 전에 거리를 적습니다.
- DFS는 재귀로 짧게 쓰거나 `push()`·`pop()` 스택으로 쓰며 두 방법의 방문 순서는 다를 수 있습니다.
- 격자는 `dr`·`dc`로 이웃 칸을 계산하고 범위 검사를 먼저 한 뒤에 칸을 읽습니다.

## 이어서 연습하기

[창고 칸별 최소 이동표](#/coding-tests/java/bridge-gra-03)에서 격자 BFS로 칸마다 최소 이동 횟수를 채워 봅니다.
[양방향 통로의 최소 이동 횟수](#/coding-tests/java/bridge-gra-02)에서 인접 리스트 BFS를 써 봅니다.
[필수 점검소를 거친 목적지별 거리](#/coding-tests/java/bridge-gra-05)에서 BFS를 두 번 이어 붙여 봅니다.

## 공식 자료

- [Java 25 API: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
- [Java 25 API: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

## 핵심 질문 답

Java에서는 정점마다 `ArrayList`를 하나씩 만들어 `List<List<Integer>>` 인접 리스트를 만들고 양방향 간선은 두 목록에 모두 넣습니다.
BFS는 `ArrayDeque`를 큐로 써서 `offer()`·`poll()`로 가까운 정점부터 꺼내고 `-1`로 채운 거리 배열에 큐에 넣기 전에 거리를 적어 최소 이동 횟수를 구합니다.
DFS는 재귀나 `ArrayDeque`의 `push()`·`pop()`으로 한 길을 끝까지 따라갑니다.
격자에서는 `dr`·`dc` 방향 배열로 네 이웃 칸을 계산하고 범위·벽·방문 여부를 차례로 확인한 뒤에만 칸을 읽고 큐에 넣습니다.
