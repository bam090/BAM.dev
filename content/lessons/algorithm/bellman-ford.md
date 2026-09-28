# 벨만-포드: 음수 간선이 있는 최단 경로

## 학습 목표

- 모든 간선을 `V - 1`번 완화하는 벨만-포드로 음수 간선이 있는 그래프의 최단 거리를 구하고 한 번 더 완화해 음수 사이클을 찾을 수 있습니다.
- 다익스트라와 벨만-포드를 가중치 조건과 시간 복잡도로 비교해 문제에 맞는 쪽을 고를 수 있습니다.

## 한줄 요약

벨만-포드는 모든 간선을 정점 수보다 하나 적은 횟수만큼 반복해서 완화해 음수 간선이 있어도 최단 거리를 구하고 그 뒤에도 거리가 줄어들면 음수 사이클이 있다고 판단합니다.

## 먼저 확인할 개념

[가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra) · [그래프와 BFS·DFS](#/learn/algorithm/bfs-dfs-graph-grid) · [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)

## 벨만-포드란

**벨만-포드**는 그래프의 모든 간선을 정해진 횟수만큼 되풀이해 완화해서 한 출발점에서 모든 정점까지의 최단 거리를 구하는 알고리즘입니다.
앞 문서의 다익스트라는 가장 가까운 정점부터 확정했기 때문에 음수 간선이 있으면 확정한 거리가 틀어졌습니다.
벨만-포드는 어떤 정점도 미리 확정하지 않고 모든 간선을 몇 번이고 다시 완화합니다.
그래서 거리가 나중에 줄어드는 음수 간선이 있어도 결국 맞는 값에 닿습니다.

여기서 **음수 간선**은 지나가면 비용이 오히려 줄어드는 간선입니다.
**음수 사이클**은 한 바퀴 돌았을 때 가중치의 합이 음수가 되는 사이클입니다.

예를 들어 게임 속 마을 네 곳을 오가며 골드를 쓰는 장면을 떠올려 보세요.
대부분의 길은 통행료로 골드를 내야 하지만 어떤 길은 지나가면 보상으로 골드를 받습니다.
마을 `0`에서 출발해 각 마을까지 골드를 가장 적게 쓰는 길을 찾아야 합니다.

이 문서는 아래 지도 하나를 처음부터 끝까지 사용합니다.

![마을 0부터 3까지 정점 4개와 방향 간선 5개가 있다. 0에서 1은 4골드 · 0에서 2는 5골드 · 1에서 3은 2골드 · 2에서 1은 -3골드 · 2에서 3은 4골드이다. -3은 골드를 받는 길로 빨간색으로 표시되어 있다.](content/assets/algorithm/bellman-graph.png)

`2 → 1` 길은 `-3`이라서 지나가면 골드 3을 받습니다.
그래서 마을 `1`까지는 바로 가는 4골드보다 `0 → 2 → 1`로 돌아가는 `5 + (-3) = 2`골드가 더 쌉니다.

## 벨만-포드 동작

벨만-포드가 하는 일은 단순합니다.

1. 출발점의 거리를 `0`으로 두고 나머지는 `INF`로 둡니다.
2. 간선 목록 전체를 한 번 훑으며 모든 간선을 완화합니다.
3. 2번을 `V - 1`번 반복합니다.

간선 목록은 아래 순서로 둡니다.
완화는 앞 문서와 똑같이 `distance[from] + 비용`이 `distance[to]`보다 작으면 `distance[to]`를 줄이는 일입니다.

```java
int[][] roads = {{0, 1, 4}, {0, 2, 5}, {1, 3, 2}, {2, 1, -3}, {2, 3, 4}};
```

![모든 간선을 한 번씩 완화할 때마다 바뀌는 distance 표. 처음은 0 · INF · INF · INF이다. 1번째 반복 뒤 0 · 2 · 5 · 6이고 2번째 반복 뒤 0 · 2 · 5 · 4이며 3번째 반복 뒤에도 0 · 2 · 5 · 4로 변화가 없다. 각 반복에서 줄어든 칸이 빨간색이다.](content/assets/algorithm/bellman-rounds.png)

1번째 반복에서 간선을 순서대로 보면 어떻게 바뀌는지 하나씩 따라가 보겠습니다.

| 완화한 간선 | 계산 | 바뀐 거리 |
| --- | --- | --- |
| `0 → 1` (4) | `0 + 4 = 4` | `1`은 4 |
| `0 → 2` (5) | `0 + 5 = 5` | `2`는 5 |
| `1 → 3` (2) | `4 + 2 = 6` | `3`은 6 |
| `2 → 1` (-3) | `5 + (-3) = 2` | `1`은 4에서 2 |
| `2 → 3` (4) | `5 + 4 = 9` | 6보다 커서 그대로 |

`1 → 3` 간선은 `distance[1]`이 아직 4일 때 이미 지나가 버렸습니다.
그래서 `1`이 2로 줄어든 결과는 이번 반복에서 `3`까지 전해지지 못합니다.
2번째 반복에서 `1 → 3`을 다시 보면 `2 + 2 = 4`가 되어 `3`이 6에서 4로 줄어듭니다.
3번째 반복에서는 아무것도 바뀌지 않습니다.

### V - 1번 반복하는 이유

그렇다면 왜 하필 `V - 1`번일까요?
음수 사이클이 없으면 최단 길은 같은 정점을 두 번 지날 필요가 없기 때문입니다.
그래서 최단 길은 정점을 최대 `V`개 지나고 간선은 최대 `V - 1`개 지납니다.
반복 한 번마다 최단 길이 간선 하나만큼 더 멀리 반영됩니다.
1번째 반복이 끝나면 간선을 1개 이하로 쓰는 길 중 가장 짧은 거리가 모두 반영되고 2번째 반복이 끝나면 간선을 2개 이하로 쓰는 길까지 반영됩니다.
결국 `V - 1`번이면 어떤 최단 길이든 끝까지 반영됩니다.

예제의 마을은 4곳이라 3번 반복합니다.
중간에 한 번이라도 아무 거리도 바뀌지 않으면 그 뒤로도 바뀔 것이 없으니 일찍 멈춰도 됩니다.

## 음수 사이클 감지

음수 사이클이 있으면 최단 거리라는 답 자체가 없어집니다.
돌 때마다 비용이 줄어드니 계속 돌면 비용을 끝없이 낮출 수 있기 때문입니다.

지도에 `3 → 2`로 가면 골드 6을 받는 길을 하나 더해 보겠습니다.

![앞의 지도에 3에서 2로 가는 -6골드 간선이 더해져 2 → 1 → 3 → 2 사이클이 빨간색으로 표시되어 있다. 한 바퀴 비용은 -3 + 2 - 6 = -7이라 돌수록 골드가 쌓인다.](content/assets/algorithm/bellman-negative-cycle.png)

`2 → 1 → 3 → 2`를 한 바퀴 돌면 `-3 + 2 - 6 = -7`로 골드 7을 받습니다.
이 사이클을 계속 돌면 마을 `1`·`2`·`3`까지의 비용은 한없이 작아집니다.

벨만-포드는 이것을 한 번 더 완화해 보는 방법으로 찾아냅니다.
음수 사이클이 없다면 `V - 1`번 반복한 뒤의 거리는 이미 최단 거리라서 더 줄어들 수 없습니다.
그런데 `V`번째로 모든 간선을 봤을 때 여전히 줄어드는 거리가 있다면 끝없이 줄어드는 길이 있다는 뜻입니다.
그래서 그 그래프에는 출발점에서 닿을 수 있는 음수 사이클이 있습니다.

## Java로 벨만-포드 구현

벨만-포드는 인접 리스트 없이 간선 목록 `int[][]`를 그대로 씁니다.
정점마다 이웃을 볼 필요 없이 간선 전체를 순서대로 훑기만 하면 되기 때문입니다.

```java
static final long INF = Long.MAX_VALUE;

static long[] bellmanFord(int n, int[][] edges, int start) {
    long[] distance = new long[n];
    Arrays.fill(distance, INF);
    distance[start] = 0;

    for (int round = 1; round <= n - 1; round++) {
        boolean changed = false;
        for (int[] edge : edges) {
            int from = edge[0];
            int to = edge[1];
            int cost = edge[2];
            if (distance[from] == INF) continue;
            if (distance[from] + cost < distance[to]) {
                distance[to] = distance[from] + cost;
                changed = true;
            }
        }
        if (!changed) break;
    }

    for (int[] edge : edges) {
        int from = edge[0];
        if (distance[from] == INF) continue;
        if (distance[from] + edge[2] < distance[edge[1]]) {
            return null;
        }
    }
    return distance;
}
```

바깥 반복문이 `V - 1`번을 돌고 안쪽 반복문이 간선 전체를 한 번씩 완화합니다.
`changed`는 이번 반복에서 거리가 하나라도 줄었는지 기록해 일찍 멈추게 해 줍니다.
반복이 끝난 뒤의 마지막 `for`가 음수 사이클 검사이고 여기서도 거리가 줄면 `null`을 돌려줍니다.

코드에서 눈여겨볼 줄은 `if (distance[from] == INF) continue;`입니다.
아직 닿지 않은 정점에서 나가는 간선은 완화하면 안 됩니다.
`INF`에 음수 비용을 더하면 `INF`보다 조금 작은 값이 되어 닿지도 않은 정점이 닿은 것처럼 보이기 때문입니다.
양수 비용을 더하면 `long` 범위를 넘어 음수가 되는 오류도 생깁니다.

거리를 `long`으로 둔 이유도 있습니다.
음수 간선이 많거나 음수 사이클이 있으면 반복할 때마다 거리가 계속 작아져서 `int` 범위를 벗어날 수 있기 때문입니다.

두 지도로 실행하면 어떤 결과가 나올지 예상해 보세요.
음수 사이클이 없는 지도는 반복마다 거리를 찍어 봅니다.
전체 코드의 `bellmanFord`는 이를 위해 반복마다 거리를 출력할지 정하는 `showRounds` 값을 하나 더 받습니다.

```text
1번째 반복: [0, 2, 5, 6]
2번째 반복: [0, 2, 5, 4]
3번째 반복: [0, 2, 5, 4]
최소 골드: [0, 2, 5, 4]
음수 사이클이 있습니다
```

첫 지도는 표에서 따라간 그대로 3번째 반복에서 바뀐 것이 없어 멈추고 `[0, 2, 5, 4]`가 답이 됩니다.
`3 → 2` 길을 더한 지도는 3번 반복한 뒤에도 거리가 계속 줄어들어 음수 사이클로 판단합니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `GoldRoute.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.Arrays;
>
> public class GoldRoute {
>     static final long INF = Long.MAX_VALUE;
>
>     static long[] bellmanFord(int n, int[][] edges, int start, boolean showRounds) {
>         long[] distance = new long[n];
>         Arrays.fill(distance, INF);
>         distance[start] = 0;
>
>         for (int round = 1; round <= n - 1; round++) {
>             boolean changed = false;
>             for (int[] edge : edges) {
>                 int from = edge[0];
>                 int to = edge[1];
>                 int cost = edge[2];
>                 if (distance[from] == INF) continue;
>                 if (distance[from] + cost < distance[to]) {
>                     distance[to] = distance[from] + cost;
>                     changed = true;
>                 }
>             }
>             if (showRounds) {
>                 System.out.println(round + "번째 반복: " + show(distance));
>             }
>             if (!changed) break;
>         }
>
>         for (int[] edge : edges) {
>             int from = edge[0];
>             if (distance[from] == INF) continue;
>             if (distance[from] + edge[2] < distance[edge[1]]) {
>                 return null;
>             }
>         }
>         return distance;
>     }
>
>     static String show(long[] distance) {
>         StringBuilder text = new StringBuilder("[");
>         for (int i = 0; i < distance.length; i++) {
>             if (i > 0) text.append(", ");
>             text.append(distance[i] == INF ? "INF" : String.valueOf(distance[i]));
>         }
>         return text.append("]").toString();
>     }
>
>     public static void main(String[] args) {
>         int[][] roads = {{0, 1, 4}, {0, 2, 5}, {1, 3, 2}, {2, 1, -3}, {2, 3, 4}};
>         long[] gold = bellmanFord(4, roads, 0, true);
>         System.out.println("최소 골드: " + show(gold));
>
>         int[][] withLoop = {{0, 1, 4}, {0, 2, 5}, {1, 3, 2}, {2, 1, -3}, {2, 3, 4}, {3, 2, -6}};
>         long[] result = bellmanFord(4, withLoop, 0, false);
>         System.out.println(result == null ? "음수 사이클이 있습니다" : show(result));
>     }
> }
> ```
>
> ```text
> 1번째 반복: [0, 2, 5, 6]
> 2번째 반복: [0, 2, 5, 4]
> 3번째 반복: [0, 2, 5, 4]
> 최소 골드: [0, 2, 5, 4]
> 음수 사이클이 있습니다
> ```

## 다익스트라와 벨만-포드 비교

두 알고리즘 모두 간선 완화로 최단 거리를 구합니다.
차이는 완화하는 순서와 그 순서가 요구하는 조건에 있습니다.

| | 다익스트라 | 벨만-포드 |
| --- | --- | --- |
| 완화 순서 | 가장 가까운 정점부터 확정하며 완화합니다 | 모든 간선을 `V - 1`번 되풀이해 완화합니다 |
| 쓰는 도구 | 인접 리스트와 `PriorityQueue` | 간선 목록 배열 |
| 음수 간선 | 쓸 수 없습니다 | 쓸 수 있습니다 |
| 음수 사이클 | 찾지 못합니다 | 한 번 더 완화해서 찾습니다 |
| 시간 복잡도 | `O(E log V)` | `O(V × E)` |

정점이 1,000개이고 간선이 10,000개라면 다익스트라는 대략 `10,000 × 10`인 10만 번 정도로 끝납니다.
벨만-포드는 `1,000 × 10,000`으로 1,000만 번이 필요합니다.
그래서 음수 간선이 없으면 다익스트라를 쓰고 음수 간선이 있을 때만 벨만-포드를 씁니다.

## 벨만-포드의 활용

코딩테스트에서 벨만-포드가 필요한 문제는 대개 이런 단서가 있습니다.

- 시간을 거꾸로 돌리는 길·보상을 주는 길처럼 비용이 음수인 간선이 나옵니다.
- "무한히 줄일 수 있으면 `-1`을 출력하라"처럼 음수 사이클이 있을 때의 답을 따로 정해 둡니다.
- 정점 수가 수백 개 정도로 작아서 `O(V × E)`로도 시간 안에 끝납니다.

문제를 풀 때는 세 가지를 확인합니다.
닿지 않은 정점에서 나가는 간선은 `INF` 확인으로 건너뜁니다.
거리 합이 커지거나 음수로 크게 작아질 수 있으므로 `long`을 씁니다.
음수 사이클 검사는 `V - 1`번 반복을 모두 마친 뒤에 한 번 더 간선 전체를 훑어서 합니다.

실무에서는 여러 통화를 바꿔 가며 거래할 때 한 바퀴 돌면 돈이 늘어나는 경로를 찾는 문제가 음수 사이클 찾기와 같은 모양입니다.

## 정리

- 벨만-포드는 어떤 정점도 미리 확정하지 않고 모든 간선을 `V - 1`번 완화해서 음수 간선이 있어도 최단 거리를 구합니다.
- 최단 길은 간선을 최대 `V - 1`개 지나므로 `V - 1`번 반복이면 충분하고 한 번도 바뀌지 않으면 일찍 멈춰도 됩니다.
- `V - 1`번 뒤에도 거리가 줄어드는 간선이 있으면 출발점에서 닿을 수 있는 음수 사이클이 있습니다.
- 음수 간선이 없으면 `O(E log V)`인 다익스트라를 쓰고 음수 간선이 있을 때만 `O(V × E)`인 벨만-포드를 씁니다.

## 이어서 연습하기

[보상 길이 있는 배달 비용](#/coding-tests/java/algo-bellman-ford-01)에서 음수 간선과 음수 사이클이 있는 그래프에서 최단 비용을 직접 구해 봅니다.
[가중 그래프와 다익스트라](#/learn/algorithm/weighted-graphs-dijkstra)의 도로망을 간선 목록으로 바꿔 벨만-포드로 풀고 같은 답이 나오는지 확인해 봅니다.

## 공식 자료

- [Princeton Algorithms: Shortest Paths](https://algs4.cs.princeton.edu/44sp/)
- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: Long](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Long.html)

## 핵심 질문 답

벨만-포드는 출발점의 거리를 0으로 두고 모든 간선을 정점 수보다 하나 적은 횟수만큼 반복해서 완화합니다.
어떤 정점도 미리 확정하지 않기 때문에 음수 간선 때문에 거리가 나중에 줄어들어도 다음 반복에서 반영됩니다.
최단 길은 간선을 최대 `V - 1`개 지나므로 그만큼 반복하면 모든 최단 거리가 구해집니다.
그 뒤에 한 번 더 완화했을 때도 거리가 줄어들면 한 바퀴 돌 때마다 비용이 줄어드는 음수 사이클이 있다고 판단합니다.
