# 가중 그래프와 다익스트라

## 학습 목표

- 거리 배열과 간선 완화로 가장 가까운 후보부터 확정하는 다익스트라를 따라가고 `PriorityQueue`로 구현할 수 있습니다.
- 음수 간선이 있으면 다익스트라를 쓸 수 없는 이유를 설명하고 벨만-포드가 필요한 상황을 구분할 수 있습니다.

## 한줄 요약

다익스트라는 음수 간선이 없는 가중 그래프에서 우선순위 큐로 지금까지 가장 가까운 정점을 꺼내 확정하고 그 정점의 간선으로 이웃의 거리를 줄여 나가며 최단 거리를 구합니다.

## 먼저 확인할 개념

[그래프와 BFS·DFS](#/learn/algorithm/bfs-dfs-graph-grid) · [Java로 그래프와 격자 탐색하기](#/learn/algorithm/grid-traversal) · [우선순위 큐와 힙: 가장 급한 값부터 꺼내기](#/learn/algorithm/priority-queue-heap)

## 가중 그래프의 최단 경로

**최단 경로**는 가중 그래프에서 지나는 간선의 가중치 합이 가장 작은 길입니다.
앞 문서에서는 BFS로 간선을 가장 적게 지나는 거리를 구했습니다.
그런데 간선마다 거리·시간·비용 같은 **가중치**가 붙으면 간선 수가 적은 길이 가장 싼 길이 아닐 수 있습니다.

예를 들어 배달 기사가 동네 `0`에서 출발해 다른 동네로 가장 빨리 가는 길을 찾는다고 생각해 보세요.
동네 사이의 도로는 일방통행이고 도로마다 걸리는 시간이 분 단위로 정해져 있습니다.

이 문서는 아래 도로망 하나를 처음부터 끝까지 사용합니다.

![동네 0부터 4까지 정점 5개와 일방통행 도로가 있다. 0에서 1은 7분 · 0에서 2는 2분 · 2에서 1은 2분 · 1에서 3은 1분 · 2에서 3은 6분 · 3에서 4는 3분 · 1에서 4는 8분이다. 0 → 1로 바로 가면 7분이지만 0 → 2 → 1로 돌아가면 4분이라 빨간색으로 표시되어 있다.](content/assets/algorithm/dijkstra-graph.png)

동네 `1`까지는 도로 하나로 바로 가면 7분이 걸립니다.
반면 `2`를 거쳐 도로 두 개로 돌아가면 `2 + 2 = 4`분이면 됩니다.
BFS는 간선 수만 세므로 도로 하나로 닿는 `0 → 1`을 먼저 발견하고 그 7분을 답으로 삼습니다.
그래서 가중치가 있는 그래프에는 가중치의 합을 비교하는 다른 방법이 필요합니다.

## 거리 배열과 간선 완화

가장 빠른 길을 찾으려면 동네마다 지금까지 알아낸 가장 짧은 시간을 적어 두는 **거리 배열** `distance`가 필요합니다.
출발지는 `0`으로 두고 나머지는 아직 가는 방법을 모르므로 아주 큰 값인 `INF`로 둡니다.

그다음 할 일은 한 가지입니다.
동네 `u`까지 걸리는 시간을 알고 있을 때 `u`에서 `v`로 가는 도로를 보고 `v`까지의 시간을 줄일 수 있는지 확인합니다.

```text
후보 = distance[u] + (u에서 v로 가는 도로의 시간)
후보 < distance[v]이면 distance[v] = 후보
```

이렇게 더 짧은 길을 찾았을 때 거리를 줄이는 일을 **간선 완화**라고 합니다.
예를 들어 `distance[2]`가 2이고 `2 → 1` 도로가 2분이면 후보는 4입니다.
`distance[1]`에 7이 적혀 있었다면 4가 더 작으므로 `distance[1]`을 4로 줄입니다.

최단 경로 알고리즘들은 모두 이 완화를 반복합니다.
다른 점은 어떤 순서로 완화하느냐입니다.

## 다익스트라 알고리즘

**다익스트라**는 아직 확정하지 않은 정점 중 거리가 가장 작은 정점을 골라 확정하고 그 정점에서 나가는 간선을 모두 완화하는 일을 반복하는 알고리즘입니다.
여기서 **확정**은 그 정점까지의 최단 거리가 더 이상 바뀌지 않는다고 정하는 것입니다.

가장 가까운 정점을 확정해도 되는 이유는 모든 가중치가 0 이상이기 때문입니다.
지금 가장 가까운 동네보다 더 먼 동네를 거쳐서 돌아오면 그 먼 동네까지의 시간에 0 이상의 도로 시간이 더해지므로 지금보다 짧아질 수 없습니다.

동네 `0`에서 출발해 단계마다 `distance`가 어떻게 바뀌는지 따라가 보겠습니다.

![동네별 거리 배열이 단계마다 바뀌는 표. 처음은 0 · ∞ · ∞ · ∞ · ∞이다. 0을 확정하면 0 · 7 · 2 · ∞ · ∞가 된다. 2를 확정하면 0 · 4 · 2 · 8 · ∞가 된다. 1을 확정하면 0 · 4 · 2 · 5 · 12가 된다. 3을 확정하면 0 · 4 · 2 · 5 · 8이 되고 4를 확정한 뒤에도 그대로이다. 확정된 칸은 초록색이고 그 단계에 줄어든 후보는 빨간색이다.](content/assets/algorithm/dijkstra-steps.png)

| 확정한 동네 | 완화한 도로 | 바뀐 거리 |
| --- | --- | --- |
| `0` (거리 0) | `0 → 1`·`0 → 2` | `1`은 7 · `2`는 2 |
| `2` (거리 2) | `2 → 1`·`2 → 3` | `1`은 7에서 4 · `3`은 8 |
| `1` (거리 4) | `1 → 3`·`1 → 4` | `3`은 8에서 5 · `4`는 12 |
| `3` (거리 5) | `3 → 4` | `4`는 12에서 8 |
| `4` (거리 8) | 없음 | 없음 |

처음 `0`을 확정하면 `1`에 7이 적힙니다.
하지만 7은 아직 후보일 뿐입니다.
다음으로 가장 가까운 `2`를 확정하고 `2 → 1` 도로를 완화하니 `1`이 4로 줄어듭니다.
이렇게 가까운 동네부터 확정하면서 먼 동네의 후보가 점점 줄어들고 마지막에 `[0, 4, 2, 5, 8]`이 남습니다.

## Java로 다익스트라 구현

그렇다면 확정하지 않은 동네 중 가장 가까운 곳은 어떻게 빨리 찾을까요?
매번 배열 전체를 훑으면 정점 수만큼 시간이 듭니다.
그래서 가장 작은 값을 바로 꺼내 주는 우선순위 큐 `PriorityQueue`를 씁니다.

그래프는 앞 문서의 인접 리스트에 가중치를 더해 `List<List<int[]>>`로 만듭니다.
`int[] {도착 동네, 걸리는 시간}` 하나가 도로 하나입니다.

```java
int[][] roads = {{0, 1, 7}, {0, 2, 2}, {2, 1, 2}, {1, 3, 1}, {2, 3, 6}, {3, 4, 3}, {1, 4, 8}};
List<List<int[]>> graph = new ArrayList<>();
for (int i = 0; i < 5; i++) {
    graph.add(new ArrayList<>());
}
for (int[] road : roads) {
    graph.get(road[0]).add(new int[] {road[1], road[2]});
}
```

일방통행이라 `road[0]`의 목록에만 넣었습니다.
양방향 도로라면 `road[1]`의 목록에도 `{road[0], road[2]}`를 넣습니다.

우선순위 큐에는 `int[] {동네, 그때의 거리}`를 넣고 거리가 작은 것부터 나오도록 비교 기준을 줍니다.

```java
static final int INF = Integer.MAX_VALUE;

static int[] dijkstra(List<List<int[]>> graph, int start) {
    int[] distance = new int[graph.size()];
    Arrays.fill(distance, INF);
    PriorityQueue<int[]> queue = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    distance[start] = 0;
    queue.offer(new int[] {start, 0});

    while (!queue.isEmpty()) {
        int[] now = queue.poll();
        int town = now[0];
        int dist = now[1];
        if (dist > distance[town]) continue;

        for (int[] road : graph.get(town)) {
            int next = road[0];
            int candidate = dist + road[1];
            if (candidate < distance[next]) {
                distance[next] = candidate;
                queue.offer(new int[] {next, candidate});
            }
        }
    }
    return distance;
}
```

`Comparator.comparingInt(a -> a[1])`는 배열의 두 번째 칸인 거리를 기준으로 작은 것부터 꺼내라는 뜻입니다.
`poll()`은 큐에서 거리가 가장 작은 후보를 꺼냅니다.
완화에 성공하면 줄어든 거리로 새 후보를 큐에 넣습니다.

### 오래된 후보 건너뛰기

코드의 `if (dist > distance[town]) continue;` 한 줄은 **오래된 후보**를 걸러 냅니다.
`PriorityQueue`는 이미 들어 있는 후보의 거리를 고칠 수 없습니다.
그래서 동네 `1`은 처음에 `(1, 7)`로 들어가고 나중에 더 짧은 길을 찾으면 `(1, 4)`가 하나 더 들어갑니다.
`(1, 4)`가 먼저 나와 처리된 뒤 `(1, 7)`이 나오면 이미 `distance[1]`이 4이므로 7은 더 이상 쓸모가 없습니다.

후보를 꺼낼 때마다 한 줄씩 출력하도록 고쳐 실행해 보겠습니다.
출력을 보기 전에 어느 후보가 건너뛰어질지 먼저 예상해 보세요.

```text
꺼냄 (0, 0)
꺼냄 (2, 2)
꺼냄 (1, 4)
꺼냄 (3, 5)
꺼냄 (1, 7) 오래된 후보라 건너뜀
꺼냄 (4, 8)
꺼냄 (3, 8) 오래된 후보라 건너뜀
꺼냄 (4, 12) 오래된 후보라 건너뜀
최단 시간: [0, 4, 2, 5, 8]
```

동네마다 처음 꺼낸 후보가 곧 확정된 거리이고 그 뒤에 나온 같은 동네의 후보는 모두 건너뜁니다.
`(4, 8)`과 `(3, 8)`처럼 거리가 같은 후보는 어느 쪽이 먼저 나와도 결과가 같습니다.
이 한 줄이 없으면 오래된 후보로 이웃을 다시 완화하느라 시간이 낭비됩니다.

간선 수를 `E`·정점 수를 `V`라고 하면 완화에 성공할 때마다 큐에 하나씩 넣으므로 시간은 `O(E log V)` 정도입니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `DeliveryDijkstra.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Comparator;
> import java.util.List;
> import java.util.PriorityQueue;
>
> public class DeliveryDijkstra {
>     static final int INF = Integer.MAX_VALUE;
>
>     static int[] dijkstra(List<List<int[]>> graph, int start) {
>         int[] distance = new int[graph.size()];
>         Arrays.fill(distance, INF);
>         PriorityQueue<int[]> queue = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
>         distance[start] = 0;
>         queue.offer(new int[] {start, 0});
>
>         while (!queue.isEmpty()) {
>             int[] now = queue.poll();
>             int town = now[0];
>             int dist = now[1];
>             if (dist > distance[town]) {
>                 System.out.println("꺼냄 (" + town + ", " + dist + ") 오래된 후보라 건너뜀");
>                 continue;
>             }
>             System.out.println("꺼냄 (" + town + ", " + dist + ")");
>
>             for (int[] road : graph.get(town)) {
>                 int next = road[0];
>                 int candidate = dist + road[1];
>                 if (candidate < distance[next]) {
>                     distance[next] = candidate;
>                     queue.offer(new int[] {next, candidate});
>                 }
>             }
>         }
>         return distance;
>     }
>
>     public static void main(String[] args) {
>         int[][] roads = {{0, 1, 7}, {0, 2, 2}, {2, 1, 2}, {1, 3, 1}, {2, 3, 6}, {3, 4, 3}, {1, 4, 8}};
>         List<List<int[]>> graph = new ArrayList<>();
>         for (int i = 0; i < 5; i++) {
>             graph.add(new ArrayList<>());
>         }
>         for (int[] road : roads) {
>             graph.get(road[0]).add(new int[] {road[1], road[2]});
>         }
>
>         int[] distance = dijkstra(graph, 0);
>         System.out.println("최단 시간: " + Arrays.toString(distance));
>     }
> }
> ```
>
> ```text
> 꺼냄 (0, 0)
> 꺼냄 (2, 2)
> 꺼냄 (1, 4)
> 꺼냄 (3, 5)
> 꺼냄 (1, 7) 오래된 후보라 건너뜀
> 꺼냄 (4, 8)
> 꺼냄 (3, 8) 오래된 후보라 건너뜀
> 꺼냄 (4, 12) 오래된 후보라 건너뜀
> 최단 시간: [0, 4, 2, 5, 8]
> ```

## 음수 간선과 다익스트라

다익스트라가 가장 가까운 정점을 바로 확정할 수 있었던 근거는 가중치가 0 이상이라는 점이었습니다.
그런데 거치면 오히려 비용이 줄어드는 **음수 간선**이 있으면 이 근거가 무너집니다.

![정점 0에서 1로 가는 간선은 2 · 0에서 2로 가는 간선은 5 · 2에서 1로 가는 간선은 -4이다. 가장 가까운 1을 거리 2로 확정한 뒤 2를 거리 5로 꺼내 2 → 1 간선을 보면 1까지 5 + (-4) = 1이 되어 확정했던 거리 2보다 더 짧은 길이 나중에 나타난다.](content/assets/algorithm/dijkstra-negative.png)

다익스트라는 가장 가까운 `1`을 거리 2로 먼저 확정합니다.
그런데 더 먼 `2`를 거쳐 `-4`짜리 간선으로 돌아오면 `5 + (-4) = 1`로 `1`까지 더 짧게 갈 수 있습니다.
확정한 거리가 나중에 틀린 값이 되는 것입니다.
이미 `1`의 거리로 다른 정점들을 완화해 두었다면 그 값들도 모두 다시 고쳐야 합니다.

> [!question]- 이 문서의 코드로 실행하면?
> 위 `dijkstra` 코드에 이 그래프를 넣으면 `[0, 1, 5]`로 맞는 답이 나옵니다.
> 줄어든 후보 `(1, 1)`을 큐에 다시 넣고 꺼내서 `1`을 한 번 더 처리하기 때문입니다.
> 하지만 이것은 확정한 정점을 다시 여는 일이라서 더는 가까운 정점부터 한 번씩 확정하는 다익스트라가 아닙니다.
> 그래프에 따라 같은 정점을 아주 많이 다시 처리해 느려지고 음수 사이클이 있으면 거리가 끝없이 줄어들어 멈추지 않습니다.

그래서 음수 간선이 하나라도 있는 그래프에서는 다익스트라의 결과를 믿을 수 없습니다.
이럴 때는 모든 간선을 여러 번 완화하는 [벨만-포드](#/learn/algorithm/bellman-ford)를 씁니다.

## 다익스트라의 활용

코딩테스트에서 최단 거리를 묻는 문제를 만나면 먼저 간선의 가중치부터 확인합니다.

| 간선의 가중치 | 고를 알고리즘 |
| --- | --- |
| 없거나 모두 같습니다 | BFS |
| 서로 다르고 모두 0 이상입니다 | 다익스트라 |
| 음수가 있습니다 | 벨만-포드 |

다익스트라를 쓸 때는 몇 가지를 함께 챙깁니다.

- 출발점 하나에서 모든 정점까지의 거리를 한 번에 구하므로 출발점이 하나인지 확인합니다.
- 양방향 도로라면 간선을 양쪽 목록에 모두 넣습니다.
- 거리 합이 `int` 범위를 넘을 수 있으면 `distance`와 큐의 거리를 `long`으로 바꿉니다.
- 탐색이 끝난 뒤에도 `INF`로 남은 정점은 출발점에서 닿을 수 없는 정점입니다.

지도 앱의 길 찾기나 네트워크에서 데이터가 가장 빨리 도착하는 경로를 고르는 일도 같은 생각을 바탕으로 합니다.

## 정리

- 가중 그래프의 최단 경로는 간선 수가 아니라 가중치의 합으로 비교하므로 BFS로는 구할 수 없습니다.
- 간선 완화는 `distance[u] + 가중치`가 `distance[v]`보다 작을 때 `distance[v]`를 줄이는 일입니다.
- 다익스트라는 `PriorityQueue`로 가장 가까운 후보를 꺼내 확정하고 꺼낸 거리가 `distance`보다 크면 오래된 후보로 보고 건너뜁니다.
- 음수 간선이 있으면 확정한 거리가 나중에 줄어들 수 있어 다익스트라 대신 벨만-포드를 씁니다.

## 이어서 연습하기

[벨만-포드](#/learn/algorithm/bellman-ford)에서 음수 간선이 있는 그래프의 최단 거리를 구해 봅니다.
[양방향 통로의 최소 이동 횟수](#/coding-tests/java/bridge-gra-02)를 다시 풀며 가중치가 모두 같을 때는 BFS로 충분한 이유를 확인해 봅니다.

## 공식 자료

- [Java 25 API: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)
- [Java 25 API: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)
- [Princeton Algorithms: Shortest Paths](https://algs4.cs.princeton.edu/44sp/)

## 핵심 질문 답

간선마다 가중치가 다르면 간선 수가 아니라 가중치의 합이 가장 작은 길을 찾아야 합니다.
다익스트라는 출발점의 거리를 0으로 두고 우선순위 큐에서 가장 가까운 후보를 꺼내 확정한 뒤 그 정점에서 나가는 간선을 완화해 이웃의 거리를 줄입니다.
큐에서 꺼낸 거리가 거리 배열보다 크면 이미 더 짧은 길이 반영된 오래된 후보이므로 건너뜁니다.
이 방법은 모든 가중치가 0 이상일 때만 맞고 음수 간선이 있으면 확정한 거리가 나중에 줄어들 수 있어 벨만-포드를 써야 합니다.
