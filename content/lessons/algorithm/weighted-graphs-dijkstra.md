# 12. 가중 그래프와 다익스트라

## 학습 목표

- 가중 그래프의 경로 비용과 가중치가 없는 그래프의 간선 수를 구분할 수 있습니다.
- 간선 완화가 거리 후보를 더 작은 값으로 갱신하는 과정임을 설명할 수 있습니다.
- 다익스트라의 음수가 아닌 가중치 조건과 최소 우선순위 큐의 역할을 설명할 수 있습니다.
- 더 짧은 거리를 다시 넣을 때 생기는 오래된 큐 항목을 찾아 건너뛸 수 있습니다.

## 왜 필요한가

같은 두 장소를 연결하는 길이라도 거리, 시간이나 비용은 서로 다를 수 있습니다.
간선의 개수만 세는 BFS는 모든 이동을 같은 비용으로 취급하므로 가중치가 서로 다른 그래프의 최소 비용을 보장하지 않습니다.

다익스트라 알고리즘은 현재까지 발견한 거리 후보 중 가장 작은 것부터 확인하고, 그 정점을 거쳐 가는 더 짧은 경로를 찾으면 이웃의 거리를 갱신합니다.
따라서 음수가 아닌 가중치를 가진 그래프에서 한 시작점부터 다른 모든 정점까지의 최소 비용을 구할 수 있습니다.

## 개념 연결

- 선행: `algo.graph-representation`, `algo.bfs`, `algo.heap`, `algo.priority-queue`, `js.arrays`에서 배운 인접 리스트, 그래프 탐색과 최소 힙을 사용합니다.
- 이 단원: `algo.weighted-graph`, `algo.shortest-path`, `algo.dijkstra`로 가중치가 있는 경로의 최소 비용을 구합니다.
- 후속: 현재 과정의 마지막 단원이므로 새 후속 conceptId는 없습니다. 이후 최단 경로 문제에서 가중치 조건에 맞는 알고리즘을 선택하는 기준으로 사용합니다.

## 가중 그래프와 최단 경로

**가중 그래프**는 각 간선에 이동 비용인 **가중치**가 붙은 그래프입니다.
경로의 비용은 그 경로에 포함된 모든 간선 가중치의 합입니다.
**최단 경로**는 간선 수가 가장 적은 경로가 아니라 가중치 합이 가장 작은 경로입니다.

이 단원에서는 인접 리스트의 각 간선을 `[도착 정점, 가중치]`로 저장합니다.

```javascript
const graph = [
  [[1, 7], [2, 2]],
  [[3, 1]],
  [[1, 2], [3, 6]],
  [],
];

console.log(graph[0]); // [[1, 7], [2, 2]]
```

위 그래프는 방향 그래프입니다.
예를 들어 `[1, 7]`은 현재 정점에서 정점 `1`로 가는 비용이 `7`이라는 뜻입니다.
양방향 그래프라면 반대 방향 간선도 별도로 이웃 목록에 넣어야 합니다.

## 거리 후보와 완화

시작점의 거리는 `0`, 아직 도달 방법을 모르는 정점의 거리는 `Infinity`로 시작합니다.
처음 저장한 값은 확정된 답이 아니라 지금까지 발견한 가장 작은 **거리 후보**입니다.

현재 정점까지의 거리가 `currentDistance`이고 다음 간선의 가중치가 `weight`라면 다음 정점으로 가는 새 후보는 다음과 같습니다.

```text
candidate = currentDistance + weight
```

새 후보가 저장된 거리보다 작으면 더 짧은 경로를 찾은 것이므로 거리를 바꿉니다.
이처럼 간선을 통해 현재 거리 후보를 더 작은 값으로 낮추는 작업을 **완화**라고 합니다.

## 다익스트라와 우선순위 큐

다익스트라는 거리 후보가 가장 작은 정점을 먼저 처리합니다.
최솟값을 먼저 꺼내는 **최소 우선순위 큐**를 사용하면 다음에 처리할 정점을 효율적으로 고를 수 있습니다.

다익스트라의 최단 거리 보장은 모든 간선 가중치가 `0` 이상일 때만 성립합니다.
음수 간선이 있으면 나중에 확인한 경로가 이미 가장 가깝다고 판단한 정점의 거리를 더 줄일 수 있어, 작은 거리부터 확정하는 근거가 무너집니다.
음수 가중치가 있는 그래프에는 조건에 맞는 다른 알고리즘을 사용해야 합니다.

## 오래된 큐 항목이 생기는 이유

우선순위 큐 안에 `[7, 1]`이 들어간 뒤 정점 `1`까지의 더 짧은 거리 `4`를 발견할 수 있습니다.
이 예제는 큐 안의 기존 항목을 찾아 수정하는 대신 새 항목 `[4, 1]`을 추가합니다.
그러면 나중에 `[7, 1]`을 꺼냈을 때 현재 저장된 거리 `4`와 일치하지 않는 오래된 항목임을 알 수 있습니다.

오래된 항목으로 이웃을 다시 확인할 필요가 없으므로 다음 조건으로 건너뜁니다.

```text
if (queuedDistance !== distance[current]) continue;
```

## 최소 예제

JavaScript에는 기본 내장 우선순위 큐가 없으므로 숫자 거리로 비교하는 최소 힙을 함께 사용합니다.
그래프에는 정점이 하나 이상 있어야 하며 정점은 `0`부터 `graph.length - 1`까지의 정수로 표현합니다.
간선 가중치는 `0` 이상의 유한한 `Number`이고, 누적 경로 비용도 필요한 정밀도와 유한 범위 안에 머문다고 가정합니다.

```javascript
function pushMinHeap(heap, item) {
  heap.push(item);
  let index = heap.length - 1;

  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);

    if (heap[parentIndex][0] <= heap[index][0]) break;

    [heap[parentIndex], heap[index]] = [heap[index], heap[parentIndex]];
    index = parentIndex;
  }
}

function popMinHeap(heap) {
  if (heap.length === 0) return undefined;
  if (heap.length === 1) return heap.pop();

  const minimum = heap[0];
  heap[0] = heap.pop();
  let index = 0;

  while (true) {
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    let smallerIndex = index;

    if (
      leftIndex < heap.length &&
      heap[leftIndex][0] < heap[smallerIndex][0]
    ) {
      smallerIndex = leftIndex;
    }

    if (
      rightIndex < heap.length &&
      heap[rightIndex][0] < heap[smallerIndex][0]
    ) {
      smallerIndex = rightIndex;
    }

    if (smallerIndex === index) break;

    [heap[index], heap[smallerIndex]] = [heap[smallerIndex], heap[index]];
    index = smallerIndex;
  }

  return minimum;
}

function dijkstra(graph, start) {
  if (!Array.isArray(graph) || graph.length === 0) {
    throw new RangeError("그래프에는 정점이 하나 이상 필요합니다.");
  }

  if (!Number.isInteger(start) || start < 0 || start >= graph.length) {
    throw new RangeError("시작 정점이 그래프 범위를 벗어났습니다.");
  }

  for (const edges of graph) {
    for (const [next, weight] of edges) {
      if (!Number.isInteger(next) || next < 0 || next >= graph.length) {
        throw new RangeError("도착 정점이 그래프 범위를 벗어났습니다.");
      }

      if (!Number.isFinite(weight) || weight < 0) {
        throw new RangeError("가중치는 0 이상의 유한한 숫자여야 합니다.");
      }
    }
  }

  const distance = Array(graph.length).fill(Infinity);
  const queue = [];
  distance[start] = 0;
  pushMinHeap(queue, [0, start]);

  while (queue.length > 0) {
    const [queuedDistance, current] = popMinHeap(queue);

    if (queuedDistance !== distance[current]) continue;

    for (const [next, weight] of graph[current]) {
      const candidate = queuedDistance + weight;

      if (!Number.isFinite(candidate)) {
        throw new RangeError("누적 경로 비용이 Number의 유한 범위를 벗어났습니다.");
      }

      if (candidate >= distance[next]) continue;

      distance[next] = candidate;
      pushMinHeap(queue, [candidate, next]);
    }
  }

  return distance;
}

const graph = [
  [[1, 7], [2, 2]],
  [[3, 1]],
  [[1, 2], [3, 6]],
  [],
];

console.log(dijkstra(graph, 0)); // [0, 4, 2, 5]
```

큐에는 `[시작점부터의 거리 후보, 정점]` 순서로 저장합니다.
최소 힙은 배열의 첫 번째 값인 거리 후보를 비교합니다.

이 구현은 더 짧은 거리를 발견할 때마다 새 큐 항목을 넣습니다.
각 간선은 현재 최단 거리인 정점에서 한 번 확인되고, 성공한 완화는 간선 수보다 많을 수 없습니다.
큐에 중복 항목을 허용하는 이 예제의 시간 복잡도는 `O((V + E) log(V + E + 1))`, 추가 공간은 `O(V + E)`입니다.
`V`는 정점 수이고 `E`는 간선 수입니다.
`+ 1`은 간선이 없는 `E = 0`인 그래프에서도 로그 항을 정의하기 위한 표기입니다.
간선이 없어도 시작 정점의 거리는 `0`이고, 도달할 수 없는 나머지 정점의 거리는 `Infinity`로 남습니다.

## 단계별 실행 흐름

시작점은 `0`입니다.

1. 거리는 `[0, Infinity, Infinity, Infinity]`, 큐는 `[[0, 0]]`으로 시작합니다.
2. 정점 `0`을 꺼내 간선을 완화하면 정점 `1`의 거리는 `7`, 정점 `2`의 거리는 `2`가 됩니다.
3. 큐에서 가장 작은 `[2, 2]`를 꺼냅니다. 정점 `2`를 거치면 정점 `1`의 거리가 `7`에서 `4`로, 정점 `3`의 거리가 `Infinity`에서 `8`로 줄어듭니다.
4. `[4, 1]`을 꺼내 정점 `1`에서 정점 `3`으로 이동하면 새 후보는 `5`이므로 거리를 `8`에서 `5`로 줄입니다.
5. `[5, 3]`을 꺼내지만 정점 `3`에는 나가는 간선이 없습니다.
6. 나중에 `[7, 1]`을 꺼내면 큐의 거리 `7`과 현재 거리 `4`가 다르므로 오래된 항목으로 판단해 건너뜁니다.
7. `[8, 3]`도 현재 거리 `5`와 다르므로 건너뜁니다.
8. 큐가 비면 시작점 `0`부터 각 정점까지의 최소 비용 `[0, 4, 2, 5]`가 남습니다.

## 흔한 실수

### 1. 가중치가 다른 그래프에 일반 BFS 사용하기

BFS는 지나간 간선 수를 기준으로 가까운 정점을 처리합니다.
간선마다 비용이 다르면 간선 수가 적은 경로가 최소 비용 경로라는 보장이 없습니다.

### 2. 음수 가중치를 확인하지 않기

다익스트라는 음수가 아닌 간선이라는 조건으로 가장 작은 거리 후보를 안전하게 처리합니다.
음수 간선이 하나라도 있으면 이 알고리즘의 최단 거리 보장을 사용할 수 없습니다.

### 3. 정점을 큐에 처음 넣을 때 거리가 확정됐다고 생각하기

정점 `1`은 처음에 거리 `7`로 들어가지만 정점 `2`를 거치며 `4`로 줄어듭니다.
처음 발견한 순간에는 더 짧은 경로가 남아 있을 수 있습니다.

### 4. 완화한 거리를 배열에만 기록하기

거리를 줄인 뒤 새 `[거리, 정점]`을 큐에도 넣어야 그 정점이 새로운 우선순위로 처리됩니다.

### 5. 오래된 큐 항목으로 이웃을 다시 확인하기

큐에 기록된 거리와 현재 거리 배열이 다르면 더 좋은 항목이 이미 들어간 상태입니다.
오래된 항목을 건너뛰면 불필요한 간선 확인을 피할 수 있습니다.

### 6. 양방향 간선을 한쪽에만 저장하기

양방향 이동이 가능한 그래프라면 두 정점의 인접 리스트에 반대 방향 간선을 각각 저장합니다.

## 확인 포인트

1. 경로의 비용을 간선 가중치의 합으로 계산했나요?
2. 모든 가중치가 `0` 이상인지 다익스트라 실행 전에 확인했나요?
3. 새 거리 후보가 더 작을 때만 거리 배열과 큐를 함께 갱신했나요?
4. 큐에서는 거리 후보가 가장 작은 항목을 먼저 꺼내나요?
5. 큐의 거리와 현재 거리 배열이 다른 오래된 항목을 건너뛰나요?

## 확인 문제

1. 가중치가 서로 다른 그래프에서 간선 수가 가장 적은 경로와 최소 비용 경로가 다를 수 있는 이유는 무엇인가요?
2. 간선 완화는 어떤 값을 비교하고 언제 거리 배열을 바꾸나요?
3. 다익스트라에서 음수 가중치를 허용할 수 없는 이유는 무엇인가요?
4. 같은 정점의 거리 후보가 우선순위 큐에 여러 개 들어갈 수 있는 이유와 오래된 항목을 확인하는 방법은 무엇인가요?

## 공식 자료

- [MIT OpenCourseWare 6.006: Weighted Shortest Paths](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec11/)
- [MIT OpenCourseWare 6.006: Dijkstra's Algorithm](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec13/)
- [MDN: Number.isFinite()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite)

공식 자료 확인일: 2026-08-23

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

가중 그래프의 경로 비용은 지나간 간선 수가 아니라 각 간선 가중치의 합입니다.
따라서 간선을 적게 지나도 비싼 간선이 포함되면 더 많은 간선을 지나는 경로보다 총비용이 클 수 있습니다.

### 답변 2

현재 정점까지의 거리와 간선 가중치를 더해 다음 정점으로 가는 새 후보를 만듭니다.
새 후보가 저장된 거리보다 작을 때만 거리 배열을 줄이고 새 거리 후보를 우선순위 큐에 넣는 과정이 완화입니다.

### 답변 3

다익스트라는 가장 작은 거리 후보를 먼저 처리하면 그보다 짧은 경로가 나중에 나타나지 않는다는 성질을 사용합니다.
음수 간선이 있으면 나중 경로가 거리를 더 줄일 수 있어 이 성질과 최단 거리 보장이 깨집니다.

### 답변 4

더 짧은 거리를 발견할 때 기존 큐 항목을 수정하지 않고 새 항목을 넣으면 같은 정점의 후보가 여러 개 남습니다.
항목을 꺼냈을 때 큐의 거리와 현재 거리 배열을 비교하고, 두 값이 다르면 더 긴 오래된 후보이므로 건너뜁니다.
