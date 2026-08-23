# 08. BFS·DFS와 그래프·격자 탐색

## 학습 목표

- 정점과 간선, 인접 리스트의 관계를 설명할 수 있습니다.
- BFS가 큐로 층별 탐색하는 흐름을 추적할 수 있습니다.
- DFS가 스택이나 재귀로 한 경로를 깊게 탐색하는 흐름을 추적할 수 있습니다.
- 격자를 그래프로 보고 방문 표시와 경계 검사를 적용할 수 있습니다.

## 왜 필요한가

친구 관계, 도로, 웹 페이지 연결처럼 대상 사이의 연결을 따라가야 하는 문제가 많습니다.
미로와 게임 지도도 각 칸에서 이웃 칸으로 이동한다고 보면 같은 방식으로 다룰 수 있습니다.
BFS와 DFS를 익히면 연결된 곳을 빠짐없이 찾고 목적에 맞는 탐색 순서를 선택할 수 있습니다.

## 개념 연결

- 선행: `algo.stack`, `algo.queue`, `js.set-collection`
- 이 단원: `algo.graph-representation`, `algo.bfs`, `algo.dfs`, `algo.grid-traversal`
- 후속: `algo.tree`, `algo.tree-traversal`, `algo.heap`, `algo.dijkstra`

## 그래프와 인접 리스트

**그래프**는 대상인 **정점**과 정점 사이의 연결인 **간선**으로 이루어진 구조입니다.
각 정점에서 바로 갈 수 있는 이웃을 배열로 저장한 표현을 **인접 리스트**라고 합니다.

```javascript
const graph = [
  [1, 2],
  [0, 3],
  [0, 3],
  [1, 2],
];

console.log(graph[0]); // [1, 2]
console.log(graph[3]); // [1, 2]
```

이 그래프에서 정점 `0`은 정점 `1`, `2`와 연결되어 있습니다.
양방향 간선은 양쪽 정점의 이웃 목록에 서로를 모두 넣습니다.
한 방향으로만 이동할 수 있는 방향 그래프라면 반대 방향 연결을 자동으로 넣지 않습니다.

## BFS

**BFS**는 너비 우선 탐색을 뜻하며 시작점에서 가까운 정점부터 차례로 탐색합니다.
먼저 넣은 값을 먼저 꺼내는 큐를 사용하면 발견한 순서대로 정점을 처리할 수 있습니다.

## 최소 예제

```javascript
const graph = [
  [1, 2],
  [0, 3],
  [0, 3],
  [1, 2],
];

function bfs(adjacencyList, start) {
  const distance = Array(adjacencyList.length).fill(-1);
  const order = [];
  const queue = [start];
  let head = 0;
  distance[start] = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    order.push(current);

    for (const next of adjacencyList[current]) {
      if (distance[next] !== -1) continue;

      distance[next] = distance[current] + 1;
      queue.push(next);
    }
  }

  return { order, distance };
}

const result = bfs(graph, 0);
console.log(result.order); // [0, 1, 2, 3]
console.log(result.distance); // [0, 1, 1, 2]
```

`distance`가 `-1`이면 아직 발견하지 않은 정점입니다.
정점을 큐에 넣을 때 거리를 기록해 같은 정점이 큐에 여러 번 들어가지 않게 합니다.
배열 앞을 계속 제거하지 않고 `head` 인덱스를 옮겨 큐를 처리합니다.

## 실행 흐름

1. 시작점 `0`의 거리를 `0`으로 기록하고 큐에 넣습니다.
2. 정점 `0`을 처리하며 이웃 `1`, `2`의 거리를 `1`로 기록하고 큐에 넣습니다.
3. 정점 `1`을 처리하며 아직 발견하지 않은 정점 `3`의 거리를 `2`로 기록합니다.
4. 정점 `2`를 처리할 때 정점 `3`은 이미 발견되었으므로 다시 넣지 않습니다.
5. 정점 `3`까지 처리하면 탐색 순서는 `[0, 1, 2, 3]`이 됩니다.

가중치가 없는 그래프에서 BFS가 기록한 거리는 시작점부터 지나야 하는 최소 간선 수입니다.
간선마다 비용이 다른 가중 그래프의 최단 거리를 일반 BFS가 보장하지는 않습니다.

## DFS

**DFS**는 깊이 우선 탐색을 뜻하며 한 경로를 가능한 깊게 따라간 뒤 돌아와 다른 경로를 탐색합니다.
다음 예제는 재귀 깊이에 의존하지 않도록 배열을 스택으로 사용합니다.
재귀로 작성해도 한 이웃의 탐색을 끝낸 뒤 이전 호출로 돌아오므로 같은 깊이 우선 흐름을 만들 수 있습니다.

```javascript
const graph = [
  [1, 2],
  [0, 3],
  [0, 3],
  [1, 2],
];

function dfs(adjacencyList, start) {
  const visited = Array(adjacencyList.length).fill(false);
  const order = [];
  const stack = [start];
  visited[start] = true;

  while (stack.length > 0) {
    const current = stack.pop();
    order.push(current);

    for (let index = adjacencyList[current].length - 1; index >= 0; index -= 1) {
      const next = adjacencyList[current][index];

      if (visited[next]) continue;

      visited[next] = true;
      stack.push(next);
    }
  }

  return order;
}

console.log(dfs(graph, 0)); // [0, 1, 3, 2]
```

스택은 마지막에 넣은 정점을 먼저 꺼내므로 한 경로를 깊게 탐색합니다.
이웃을 역순으로 넣은 것은 작은 번호를 먼저 방문하는 예시 순서를 만들기 위해서입니다.
이웃 저장 순서가 바뀌면 BFS와 DFS의 방문 순서도 달라질 수 있지만 올바른 탐색일 수 있습니다.
DFS는 시작점에서 각 정점까지의 최단 거리를 보장하지 않습니다.

## 격자 탐색

**격자**는 행과 열로 이루어진 칸의 모음입니다.
통과할 수 있는 칸을 정점으로 보고 서로 이동할 수 있는 이웃 칸을 간선으로 보면 격자도 그래프입니다.

다음 예제에서 `#`은 지나갈 수 없는 벽이고 나머지 칸은 상하좌우로 이동할 수 있습니다.
이 예제의 격자는 한 행 이상이고 모든 행의 길이가 같다고 가정합니다.

```javascript
const grid = [
  "S..#",
  ".#..",
  "...G",
];
const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const rows = grid.length;
const columns = grid[0].length;
const distance = Array.from(
  { length: rows },
  () => Array(columns).fill(-1),
);
const queue = [[0, 0]];
let head = 0;
distance[0][0] = 0;

while (head < queue.length) {
  const [row, column] = queue[head];
  head += 1;

  for (const [rowChange, columnChange] of directions) {
    const nextRow = row + rowChange;
    const nextColumn = column + columnChange;
    const isOutside =
      nextRow < 0 ||
      nextRow >= rows ||
      nextColumn < 0 ||
      nextColumn >= columns;

    if (isOutside) continue;
    if (grid[nextRow][nextColumn] === "#") continue;
    if (distance[nextRow][nextColumn] !== -1) continue;

    distance[nextRow][nextColumn] = distance[row][column] + 1;
    queue.push([nextRow, nextColumn]);
  }
}

console.log(distance[2][3]); // 5
```

새 좌표로 격자 값을 읽기 전에 먼저 행과 열의 범위를 확인합니다.
방문하지 않은 통과 가능한 칸만 큐에 넣습니다.
모든 이동 비용이 한 칸으로 같으므로 BFS로 구한 `5`는 시작점에서 목표점까지의 최소 이동 횟수입니다.

인접 리스트를 사용하는 BFS와 DFS는 각 정점과 간선을 한정된 횟수만 확인하므로 O(V + E)입니다.
`V`는 정점 수, `E`는 간선 수이며 두 수가 늘어나는 만큼 작업량도 함께 늘어난다는 뜻입니다.
격자에서는 통과 가능한 칸의 수와 각 칸에서 확인하는 방향 수를 기준으로 실행량을 생각할 수 있습니다.

## 흔한 실수

### 1. 양방향 간선의 반대쪽 연결을 빠뜨리기

정점 `a`와 `b`가 양방향으로 연결되었다면 `a`의 목록에 `b`를, `b`의 목록에 `a`를 모두 넣습니다.

### 2. 방문 표시를 늦게 하기

BFS는 큐에 넣을 때 방문 또는 거리를 기록해야 같은 정점의 중복 삽입을 막을 수 있습니다.

### 3. BFS가 모든 최단 경로를 해결한다고 생각하기

일반 BFS의 최단 거리 보장은 모든 간선의 이동 비용이 같은 그래프에 한정됩니다.

### 4. DFS 방문 순서가 항상 같다고 생각하기

여러 이웃 중 어느 정점을 먼저 넣는지에 따라 방문 순서는 달라질 수 있습니다.

### 5. 격자 범위를 확인하기 전에 칸을 읽기

새 행과 열이 범위 안인지 확인한 뒤 `grid[nextRow][nextColumn]`을 읽습니다.

### 6. 같은 배열로 모든 거리 행을 채우기

`Array(rows).fill(Array(columns).fill(-1))`은 모든 행이 같은 배열을 가리킵니다.
`Array.from()`의 콜백으로 각 행을 따로 만들어야 합니다.

## 확인 포인트

1. 그래프가 방향 그래프인지 양방향 그래프인지 구분했나요?
2. 시작점을 큐나 스택에 넣을 때 방문 상태를 기록했나요?
3. 최단 거리가 필요하다면 간선의 비용이 모두 같은지 확인했나요?
4. 격자에서 범위, 벽, 방문 여부를 순서대로 확인했나요?

## 확인 문제

1. 인접 리스트는 그래프의 연결을 어떤 형태로 저장하나요?
2. BFS가 가중치 없는 그래프에서 최소 간선 수를 찾을 수 있는 이유는 무엇인가요?
3. BFS와 DFS가 같은 그래프에서 다른 방문 순서를 만들 수 있는 이유는 무엇인가요?
4. 격자 탐색에서 새 좌표의 범위를 먼저 확인해야 하는 이유는 무엇인가요?

## 공식 자료

- [MIT OpenCourseWare: Breadth-First Search](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec9/)
- [MIT OpenCourseWare: Depth-First Search](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec10/)
- [MDN: Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
- [MDN: Array.prototype.fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)

공식 자료 확인일: 2026-08-20

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

인접 리스트는 각 정점마다 바로 연결된 이웃 정점의 목록을 저장합니다.
양방향 그래프라면 한 간선을 양쪽 정점의 목록에 모두 기록합니다.

### 답변 2

BFS는 시작점에서 간선 수가 같은 정점들을 같은 단계에서 처리합니다.
그래서 가중치가 없는 그래프에서 정점을 처음 발견했을 때의 단계가 시작점부터의 최소 간선 수입니다.

### 답변 3

BFS는 큐로 가까운 정점부터 처리하고 DFS는 스택으로 한 경로를 깊게 처리합니다.
또한 이웃이 저장된 순서에 따라서도 실제 방문 순서가 달라질 수 있습니다.

### 답변 4

범위를 벗어난 행이나 열로 격자를 읽으면 존재하지 않는 위치에 접근하게 됩니다.
따라서 좌표가 유효한지 확인한 뒤 벽과 방문 여부를 검사해야 합니다.
