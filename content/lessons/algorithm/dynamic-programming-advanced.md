# 11. 동적 계획법 2

## 학습 목표

- 두 개의 정보가 필요한 문제를 2차원 DP 상태로 표현할 수 있습니다.
- 상태, 점화식, 초기값과 계산 순서를 2차원 표에서 연결해 설명할 수 있습니다.
- 필요한 이전 상태가 제한적일 때 2차원 표를 1차원 배열로 줄일 수 있습니다.
- 이전 선택을 저장해 최종 값뿐 아니라 실제 선택 과정도 복원할 수 있습니다.

## 왜 필요한가

동적 계획법 1에서는 `ways[step]`처럼 한 개의 번호로 상태를 나타냈습니다.
하지만 현재 위치가 행과 열로 정해지거나, 몇 번째 값까지 확인했는지와 남은 양을 함께 알아야 하는 문제도 있습니다.
이때 상태에 필요한 정보를 하나 빼면 서로 다른 작은 문제를 같은 상태로 취급해 잘못된 답을 만들 수 있습니다.

또한 최솟값만 구하는 것과 그 최솟값을 만든 선택까지 보여 주는 것은 다른 요구입니다.
필요한 상태만 남겨 메모리를 줄이는 방법과, 선택을 복원하기 위해 정보를 보존하는 방법을 함께 이해해야 목적에 맞는 DP를 설계할 수 있습니다.

## 개념 연결

- 선행: `algo.dynamic-programming`, `js.arrays`, `js.control-flow`에서 배운 상태, 점화식, 초기값, 계산 순서와 배열 반복을 사용합니다.
- 이 단원: `algo.dynamic-programming-advanced`로 2차원 상태, 메모리 절약과 선택 복원을 익힙니다.
- 후속: `algo.weighted-graph`, `algo.shortest-path`, `algo.dijkstra`에서 거리 상태를 갱신하고 이전 위치를 기록하는 방식과 연결됩니다.

## 2차원 상태가 필요한 때

**상태**는 저장한 작은 문제의 답이 무엇을 뜻하는지 정한 문장입니다.
상태를 구분하는 데 두 개의 값이 필요하면 2차원 상태로 표현할 수 있습니다.

다음 예제에서는 비용이 적힌 격자의 왼쪽 위에서 오른쪽 아래로 이동합니다.
한 번에 오른쪽이나 아래쪽으로만 움직일 수 있다고 가정합니다.

`best[row][column]`의 뜻을 다음처럼 정합니다.

> 시작 칸부터 `(row, column)`까지 이동하는 데 필요한 최소 누적 비용

행과 열 중 하나라도 빠지면 어느 칸까지 온 비용인지 구분할 수 없으므로 두 정보가 모두 필요합니다.
2차원 상태라고 해서 입력이 반드시 격자여야 하는 것은 아닙니다.
상태를 구별하는 데 필요한 정보의 개수가 상태의 차원을 정합니다.

## 초기값, 점화식과 계산 순서

시작 칸까지의 비용은 그 칸의 비용 자체입니다.
아직 도달 방법을 계산하지 않은 칸은 가능한 비용보다 큰 `Infinity`로 시작합니다.

현재 칸에는 위쪽이나 왼쪽에서만 올 수 있으므로 점화식은 다음과 같습니다.

```text
best[row][column]
= costs[row][column]
  + Math.min(best[row - 1][column], best[row][column - 1])
```

첫 번째 행에는 위쪽 칸이 없고 첫 번째 열에는 왼쪽 칸이 없습니다.
존재하지 않는 방향의 비용을 `Infinity`로 보면 실제로 올 수 있는 방향이 선택됩니다.

현재 상태는 위쪽과 왼쪽 상태에 의존합니다.
따라서 위에서 아래로, 각 행에서는 왼쪽에서 오른쪽으로 계산해야 필요한 값이 먼저 준비됩니다.

## 최소 예제 1. 최소 비용과 이동 경로 구하기

다음 함수는 최소 누적 비용을 표에 저장하고, 각 칸을 만들 때 선택한 이전 칸을 `previous`에 기록합니다.
입력은 한 칸 이상이며 모든 행의 길이가 같은 숫자 격자라고 가정합니다.

```javascript
function findCheapestRoute(costs) {
  const rows = costs.length;
  const columns = costs[0].length;
  const best = Array.from(
    { length: rows },
    () => Array(columns).fill(Infinity),
  );
  const previous = Array.from(
    { length: rows },
    () => Array(columns).fill(null),
  );

  best[0][0] = costs[0][0];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (row === 0 && column === 0) continue;

      const fromTop = row > 0 ? best[row - 1][column] : Infinity;
      const fromLeft = column > 0 ? best[row][column - 1] : Infinity;

      if (fromTop <= fromLeft) {
        best[row][column] = costs[row][column] + fromTop;
        previous[row][column] = [row - 1, column];
      } else {
        best[row][column] = costs[row][column] + fromLeft;
        previous[row][column] = [row, column - 1];
      }
    }
  }

  const path = [];
  let position = [rows - 1, columns - 1];

  while (position !== null) {
    path.push(position);
    const [row, column] = position;
    position = previous[row][column];
  }

  path.reverse();

  return {
    cost: best[rows - 1][columns - 1],
    path,
    table: best,
  };
}

const costs = [
  [1, 4, 2],
  [2, 1, 5],
  [3, 2, 1],
];
const route = findCheapestRoute(costs);

console.log(route.cost); // 7
console.log(route.path); // [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]
console.log(route.table); // [[1, 5, 7], [3, 4, 9], [6, 6, 7]]
```

`previous[row][column]`은 현재 최솟값을 만들 때 어느 칸에서 왔는지 저장합니다.
마지막 칸부터 이전 칸을 따라 시작점까지 돌아간 뒤 배열을 뒤집으면 실제 이동 순서가 됩니다.
위쪽과 왼쪽 비용이 같을 때 이 예제는 위쪽을 선택하지만, 어느 쪽을 선택해도 최소 비용은 같습니다.

## 메모리 줄이기

최종 비용만 필요하다면 모든 행의 표를 계속 보관할 필요가 없습니다.
현재 칸을 계산할 때 필요한 것은 바로 위쪽 값과 현재 행의 왼쪽 값뿐입니다.

`best[column]`을 한 행씩 덮어쓰면 다음 두 값이 동시에 남습니다.

- 덮어쓰기 전 `best[column]`: 이전 행의 위쪽 값
- 이미 덮어쓴 `best[column - 1]`: 현재 행의 왼쪽 값

이 관계를 지키려면 각 행을 왼쪽에서 오른쪽으로 계산해야 합니다.

## 최소 예제 2. 최종 비용만 구하기

```javascript
function findCheapestCost(costs) {
  const columns = costs[0].length;
  const best = Array(columns).fill(Infinity);

  for (let row = 0; row < costs.length; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (row === 0 && column === 0) {
        best[0] = costs[0][0];
        continue;
      }

      const fromTop = best[column];
      const fromLeft = column > 0 ? best[column - 1] : Infinity;
      best[column] = costs[row][column] + Math.min(fromTop, fromLeft);
    }
  }

  return best[columns - 1];
}

const costs = [
  [1, 4, 2],
  [2, 1, 5],
  [3, 2, 1],
];

console.log(findCheapestCost(costs)); // 7
```

두 예제 모두 모든 칸을 한 번씩 계산하므로 시간 복잡도는 `O(rows × columns)`입니다.
첫 번째 예제는 비용 표와 이전 위치를 저장하므로 `O(rows × columns)`의 추가 공간이 필요합니다.
두 번째 예제는 비용만 보관하므로 `O(columns)`의 추가 공간을 사용합니다.

1차원 배열만 남기면 이전 선택 정보가 사라지므로 이 배열만으로 전체 경로를 바로 복원할 수 없습니다.
경로도 필요하면 `previous`를 보관하거나, 비용을 구한 뒤 필요한 상태를 다시 계산하는 별도 과정이 필요합니다.

## 단계별 실행 흐름

비용 격자는 `[[1, 4, 2], [2, 1, 5], [3, 2, 1]]`입니다.

1. 시작 상태 `best[0][0]`을 `1`로 정하고 나머지는 `Infinity`로 둡니다.
2. 첫 번째 행은 왼쪽에서만 올 수 있어 `[1, 5, 7]`이 됩니다.
3. 두 번째 행의 첫 칸은 위에서 내려와 `3`이 되고, 가운데 칸은 위쪽 `5`보다 왼쪽 `3`이 작아 `4`가 됩니다.
4. 두 번째 행을 모두 계산하면 `[3, 4, 9]`가 됩니다.
5. 마지막 행은 `[6, 6, 7]`이 되어 목표 칸의 최소 비용은 `7`입니다.
6. 목표 칸의 이전 위치를 거꾸로 따라가면 `(2, 2) → (2, 1) → (1, 1) → (1, 0) → (0, 0)`입니다.
7. 이 순서를 뒤집어 시작점부터 목표점까지의 경로를 얻습니다.
8. 1차원 예제에서는 각 행을 처리한 뒤 `best`가 차례로 `[1, 5, 7]`, `[3, 4, 9]`, `[6, 6, 7]`로 바뀝니다.

## 흔한 실수

### 1. 상태의 뜻을 좌표 없이 정하기

`best`가 무엇의 최솟값인지 행과 열까지 포함해 한 문장으로 정해야 합니다.

### 2. 존재하지 않는 이전 상태를 `0`으로 두기

최솟값 문제에서 갈 수 없는 방향을 `0`으로 두면 실제 경로보다 더 작은 값으로 잘못 선택될 수 있습니다.
이 예제에서는 도달할 수 없다는 뜻으로 `Infinity`를 사용합니다.

### 3. 1차원 배열을 오른쪽에서 왼쪽으로 갱신하기

이 점화식은 현재 행의 왼쪽 값이 먼저 계산되어야 합니다.
반대 순서로 갱신하면 `best[column - 1]`이 아직 이전 행의 값이라 다른 점화식을 계산하게 됩니다.

### 4. 모든 행이 같은 배열을 가리키게 만들기

`Array(rows).fill(Array(columns).fill(Infinity))`는 한 행을 여러 번 참조합니다.
한 칸을 바꾸면 다른 행도 함께 바뀌므로 `Array.from()`의 콜백으로 각 행을 따로 만듭니다.

### 5. 비용만 저장하고 경로도 바로 알 수 있다고 생각하기

최종 숫자에는 어떤 이전 상태를 선택했는지가 남지 않습니다.
경로가 필요하면 이전 위치를 저장하는 등 복원 정보를 준비해야 합니다.

### 6. 항상 2차원 표를 유지하기

최종 값만 필요하고 현재 상태가 제한된 이전 행에만 의존한다면 필요한 행만 남길 수 있습니다.
다만 메모리를 줄일 때는 덮어쓰기 순서와 복원 가능성을 함께 확인해야 합니다.

## 확인 포인트

1. 상태를 구분하는 데 필요한 정보를 빠짐없이 문장으로 정했나요?
2. 점화식이 참조하는 상태가 먼저 계산되는 순서인가요?
3. 도달할 수 없는 상태와 실제 비용 `0`을 구분했나요?
4. 메모리를 줄인 뒤에도 필요한 이전 값이 덮어써지지 않나요?
5. 최종 값뿐 아니라 선택 과정도 필요하다면 복원 정보를 저장했나요?

## 확인 문제

1. 이 예제에서 `best[row][column]`은 무엇을 뜻하며 왜 두 개의 인덱스가 필요한가요?
2. 현재 칸의 최소 비용을 위쪽과 왼쪽 칸으로 계산할 수 있는 이유와 올바른 계산 순서는 무엇인가요?
3. 2차원 비용 표를 1차원 배열로 줄일 수 있는 조건과 왼쪽에서 오른쪽으로 갱신해야 하는 이유는 무엇인가요?
4. 최소 비용만 저장한 배열과 실제 경로를 복원할 수 있는 자료의 차이는 무엇인가요?

## 공식 자료

- [NIST Dictionary of Algorithms and Data Structures: dynamic programming](https://xlinux.nist.gov/dads/HTML/dynamicprog.html)
- [MIT OpenCourseWare 6.006: Dynamic Programming Recitation 15](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/6022dc36557c5e5df2ad0a77e9463855_MIT6_006S20_r15.pdf)
- [MIT OpenCourseWare 6.006: Dynamic Programming, Part 2](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec16/)
- [MDN: Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
- [MDN: Array.prototype.fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [MDN: Infinity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity)

공식 자료 확인일: 2026-08-23

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

`best[row][column]`은 시작점부터 해당 행과 열의 칸까지 가는 최소 누적 비용입니다.
현재 위치를 구분하려면 행과 열이 모두 필요하므로 두 개의 인덱스를 가진 상태로 표현합니다.

### 답변 2

현재 칸에는 위쪽과 왼쪽에서만 올 수 있으므로 두 이전 비용 중 작은 값에 현재 칸의 비용을 더합니다.
필요한 위쪽과 왼쪽 값이 준비되도록 위에서 아래로, 각 행에서는 왼쪽에서 오른쪽으로 계산합니다.

### 답변 3

현재 상태가 이전 행과 현재 행의 왼쪽 값에만 의존하고 최종 비용만 필요하다면 한 행 크기의 배열만 남길 수 있습니다.
왼쪽에서 오른쪽으로 갱신해야 왼쪽 칸은 현재 행의 새 값이고 현재 칸은 덮어쓰기 전 위쪽 값인 상태를 유지할 수 있습니다.

### 답변 4

최소 비용 배열에는 결과 숫자만 남으므로 어떤 칸을 선택했는지 알 수 없습니다.
실제 경로가 필요하면 각 상태의 이전 위치를 함께 저장하고 목표점부터 거꾸로 따라간 뒤 순서를 뒤집습니다.
