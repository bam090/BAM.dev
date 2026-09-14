# 가중 그래프와 다익스트라

## 학습 목표

- 가중 그래프의 경로 비용과 가중치가 없는 그래프의 간선 수를 구분할 수 있습니다.
- 간선 완화가 거리 후보를 더 작은 값으로 갱신하는 과정임을 설명할 수 있습니다.
- 다익스트라의 음수가 아닌 가중치 조건과 최소 우선순위 큐의 역할을 설명할 수 있습니다.
- 더 짧은 거리를 다시 넣을 때 생기는 오래된 큐 항목을 찾아 건너뛸 수 있습니다.

## 한줄 요약

음수가 아닌 가중 그래프에서 가장 작은 거리 후보부터 꺼내 간선을 완화하고, 오래된 후보를 건너뛰면 시작점의 최단 거리를 구할 수 있습니다.

## 먼저 확인할 개념

[BFS·DFS와 그래프·격자 탐색](#/learn/algorithm/bfs-dfs-graph-grid)의 인접 리스트와 [힙과 그리디](#/learn/algorithm/heap-and-greedy)의 우선순위 큐를 먼저 확인하세요.
누적 비용의 타입은 [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)을 참고하세요.

## 개념 연결

- 선행: `algo.graph-representation`, `algo.bfs`, `algo.heap`, `algo.priority-queue`, `java.arrays`, `java.numeric-operations`
- 이 단원: `algo.weighted-graph`, `algo.shortest-path`, `algo.dijkstra`
- 후속: 현재 과정의 마지막 단원이므로 새 후속 conceptId는 없습니다. 이후 최단 경로 문제에서 가중치 조건에 맞는 알고리즘을 선택하는 기준으로 사용합니다.

## 간선 수와 경로 비용 구분하기

같은 두 장소를 잇는 길이라도 거리·시간·비용은 다를 수 있습니다.
**가중 그래프**는 간선마다 이동 비용인 가중치가 붙은 그래프입니다.
경로의 비용은 지나간 간선 가중치의 합이며, **최단 경로**는 이 합이 가장 작은 경로입니다.

예제는 다음 방향 간선을 저장합니다.

| 출발 정점 | 도착 정점 | 가중치 |
| --- | --- | --- |
| 0 | 1 | 7 |
| 0 | 2 | 2 |
| 1 | 3 | 1 |
| 2 | 1 | 2 |
| 2 | 3 | 6 |

**먼저 예상해 보세요.** `0 → 1`은 간선 하나지만 비용은 `7`입니다.
`0 → 2 → 1`은 간선 둘이며 비용은 `4`입니다.
간선 수만 세는 일반 BFS로 두 경로의 최소 비용을 구할 수 있을까요?

## 거리 후보와 간선 완화

시작점의 거리는 `0`입니다.
아직 도달 방법을 모르는 정점은 `INF`로 표시합니다.
거리 배열에 적힌 숫자는 처음부터 확정된 답이 아니라 **지금까지 발견한 가장 작은 거리 후보**입니다.

현재 정점까지의 거리와 다음 간선의 가중치를 더해 새 후보를 만듭니다.

```text
새 후보 = 현재 정점까지의 거리 + 다음 간선의 가중치
```

새 후보가 저장된 거리보다 작을 때만 거리를 줄입니다.
이 작업이 **간선 완화**입니다.
거리를 줄인 뒤에는 새로운 후보를 우선순위 큐에도 넣어야 바뀐 우선순위로 처리할 수 있습니다.

## 가장 작은 후보부터 꺼내기

다익스트라는 거리 후보가 가장 작은 정점을 먼저 처리합니다.
Java의 `PriorityQueue`에 거리 기준 비교자를 주면 `poll()`로 가장 작은 후보를 꺼낼 수 있습니다.
반복자는 정렬 순서를 보장하지 않으므로 큐를 순서대로 처리할 때는 반복자가 아니라 `poll()`을 사용합니다.

**모든 간선 가중치는 `0` 이상이어야 합니다.**
음수 간선이 있으면 나중에 돌아오는 경로가 이미 가장 가깝다고 판단한 정점의 거리를 더 줄일 수 있습니다.
그러면 작은 거리부터 확정하는 근거가 무너지므로 조건에 맞는 다른 최단 경로 알고리즘이 필요합니다.

## 오래된 후보를 건너뛰는 이유

정점 `1`의 후보 `7`을 큐에 넣은 뒤 정점 `2`를 거치는 더 짧은 후보 `4`를 발견할 수 있습니다.
예제는 큐 내부의 예전 항목을 찾아 고치지 않고 새로운 후보를 하나 더 넣습니다.

나중에 거리 `7`인 항목을 꺼냈을 때 현재 거리 배열에는 `4`가 있으므로 오래된 후보입니다.
`current.distance != distance[current.vertex]`이면 이웃을 다시 확인하지 않고 건너뜁니다.
큐에 처음 넣었다는 이유로 방문 완료를 표시하면 이처럼 더 짧아지는 기회를 놓칩니다.

## Java 예제: PriorityQueue로 다익스트라 구현하기

정식 Java 25 예제입니다.
정점은 하나 이상이고 번호는 `0`부터 `graph.size() - 1`까지입니다.
간선은 `Edge` 객체의 도착 정점과 `long` 가중치로, 큐 항목은 `State` 객체의 정점과 `long` 거리 후보로 표현합니다.

`INF = Long.MAX_VALUE`는 도달 불가 표시로 예약합니다.
지원하는 가중치는 `0` 이상 `INF` 미만이고, 도달 가능한 정점의 실제 최단 비용도 `INF` 미만이어야 합니다.
`INF` 이상이 되는 후보는 범위 밖이므로 계산 전에 제외해 정수 넘침을 막습니다.
`INF`는 실제 무한대가 아니라 이 예제에서 정한 표시값입니다.

비교자는 `Comparator.comparingLong()`을 사용합니다.
두 거리를 빼서 `int`로 바꾸는 방식은 넘침이나 잘림 때문에 순서가 틀릴 수 있으므로 사용하지 않습니다.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class DijkstraExample {
    static final long INF = Long.MAX_VALUE;

    static final class Edge {
        final int to;
        final long weight;

        Edge(int to, long weight) {
            this.to = to;
            this.weight = weight;
        }
    }

    static final class State {
        final int vertex;
        final long distance;

        State(int vertex, long distance) {
            this.vertex = vertex;
            this.distance = distance;
        }
    }

    static long[] dijkstra(List<List<Edge>> graph, int start) {
        if (start < 0 || start >= graph.size()) {
            throw new IllegalArgumentException("시작 정점이 범위를 벗어났습니다.");
        }
        for (List<Edge> edges : graph) {
            for (Edge edge : edges) {
                if (edge.to < 0 || edge.to >= graph.size()) {
                    throw new IllegalArgumentException("도착 정점이 범위를 벗어났습니다.");
                }
                if (edge.weight < 0 || edge.weight == INF) {
                    throw new IllegalArgumentException("가중치는 0 이상 INF 미만이어야 합니다.");
                }
            }
        }

        long[] distance = new long[graph.size()];
        Arrays.fill(distance, INF);
        PriorityQueue<State> queue = new PriorityQueue<>(
                Comparator.comparingLong((State state) -> state.distance));
        distance[start] = 0;
        queue.offer(new State(start, 0));

        while (!queue.isEmpty()) {
            State current = queue.poll();
            if (current.distance != distance[current.vertex]) continue;

            for (Edge edge : graph.get(current.vertex)) {
                if (current.distance >= INF - edge.weight) continue;
                long candidate = current.distance + edge.weight;
                if (candidate >= distance[edge.to]) continue;
                distance[edge.to] = candidate;
                queue.offer(new State(edge.to, candidate));
            }
        }
        return distance;
    }

    public static void main(String[] args) {
        List<List<Edge>> graph = new ArrayList<>();
        for (int vertex = 0; vertex < 4; vertex++) {
            graph.add(new ArrayList<>());
        }
        graph.get(0).add(new Edge(1, 7));
        graph.get(0).add(new Edge(2, 2));
        graph.get(1).add(new Edge(3, 1));
        graph.get(2).add(new Edge(1, 2));
        graph.get(2).add(new Edge(3, 6));
        System.out.println(Arrays.toString(dijkstra(graph, 0)));
    }
}
```

예상 출력:

```text
[0, 4, 2, 5]
```

`graph.get(0).add(new Edge(1, 7))`은 `0 → 1` 간선을 저장합니다.
양방향 이동이라면 반대 방향 간선도 별도로 추가해야 합니다.

## 실행 흐름에서 확인할 지점

| 꺼낸 후보 `(정점, 거리)` | 확인 결과 |
| --- | --- |
| (0, 0) | 정점 1을 7로, 정점 2를 2로 갱신 |
| (2, 2) | 정점 1을 4로, 정점 3을 8로 갱신 |
| (1, 4) | 정점 3을 5로 갱신 |
| (3, 5) | 나가는 간선 없음 |
| (1, 7) | 현재 거리 4와 다른 오래된 후보이므로 건너뜀 |
| (3, 8) | 현재 거리 5와 다른 오래된 후보이므로 건너뜀 |

최종 거리는 `[0, 4, 2, 5]`입니다.
닿을 수 없는 정점의 값은 `INF`로 남으며 출력할 때 그 값을 도달 불가로 구분하면 됩니다.

입력의 정점 수를 `V`, 간선 수를 `E`라고 하면 각 간선의 성공한 완화에서 큐 항목을 최대 한 번 추가합니다.
오래된 항목을 건너뛰므로 같은 정점의 이웃을 반복해서 확장하지 않습니다.
이 구현의 시간은 `O(V + E log(E + 1))`, 그래프 입력을 제외한 추가 공간은 `O(V + E)`입니다.
간선이 없는 경우도 표현할 수 있도록 로그 안에 `1`을 더했습니다.

## 흔한 실수와 직접 확인하기

- 일반 BFS는 최소 간선 수를 구합니다. 간선 비용이 서로 다르다면 비용 합을 비교해야 합니다.
- 음수 간선 여부를 시작점에서 닿는 부분에만 기대지 말고 입력 계약으로 먼저 확인하세요.
- 큐에 처음 넣을 때 거리를 확정하면 나중에 더 짧아지는 후보를 반영하지 못합니다.
- 거리 배열만 줄이고 큐에 새 항목을 넣지 않으면 갱신된 정점을 제때 처리하지 못합니다.
- 오래된 후보를 처리하면 불필요한 간선 확인이 반복됩니다. 큐 항목과 현재 거리 배열을 비교하세요.
- `long`을 써도 범위는 유한합니다. 최대 경로 비용과 `INF`의 관계를 확인하고 넘치는 덧셈을 하지 마세요.

정점 하나인 그래프, 닿을 수 없는 정점, 가중치 `0`인 간선을 손으로 추적해 보세요.
예제에서 거리 `7`이 `4`로 바뀌는 이유와, 마지막에 `7`을 꺼내도 다시 처리하지 않는 이유를 자신의 말로 설명해 보세요.

## 이어서 학습하기

알고리즘 과정의 마지막 문서입니다.
[알고리즘 학습문서 목록](#/learn)으로 돌아가 문제의 단서에 따라 [BFS](#/learn/algorithm/bfs-dfs-graph-grid)와 다익스트라를 언제 선택할지 비교해 보세요.

## 공식 자료

- [Princeton Algorithms: Shortest Paths](https://algs4.cs.princeton.edu/44sp/)
- [Java 25: PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)
- [Java 25: Comparator.comparingLong](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)
- [Java 25: Arrays.fill](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 방향 그래프와 완화 과정을 유지하고 Java 표준 우선순위 큐·정수 거리로 재구성했습니다.

## 핵심 질문 답

이동 비용이 서로 다르면 간선 수 대신 가중치 합을 비교해야 합니다.
모든 가중치가 음수가 아닐 때 다익스트라는 시작점을 거리 `0`으로 두고 우선순위 큐에서 가장 작은 거리 후보부터 꺼냅니다.
현재 거리와 간선 가중치의 합이 이웃의 기존 거리보다 작으면 거리 배열을 줄이고 새 후보를 큐에 넣습니다.
큐에서 꺼낸 거리가 현재 거리 배열과 다르면 더 좋은 후보가 이미 반영된 오래된 항목이므로 건너뜁니다.
지원하는 정수 범위 안에서 이 과정을 반복하면 도달 가능한 정점의 최소 비용을 구하고, 도달 불가 정점은 `INF`로 구분할 수 있습니다.
