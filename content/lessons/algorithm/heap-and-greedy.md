# 10. 힙과 그리디

## 학습 목표

- 최소 힙의 부모와 자식 사이 순서 규칙을 설명할 수 있습니다.
- 배열에서 힙의 부모와 자식 인덱스를 계산할 수 있습니다.
- 그리디가 현재 선택을 되돌리지 않는 문제 해결 방식임을 설명할 수 있습니다.
- 그리디 선택이 항상 정답인지 근거와 반례를 확인할 수 있습니다.

## 왜 필요한가

대기 중인 작업에서 매번 가장 급한 작업을 골라야 할 때 배열 전체를 처음부터 다시 살펴보는 코드는 불필요한 비교를 반복합니다.
힙은 가장 우선하는 값을 빠르게 찾도록 돕고, 우선순위 큐를 구현할 때 자주 사용됩니다.
그리디는 현재 선택을 나중에 되돌리지 않고 답을 만드는 전략입니다.
그리디가 맞는 문제에서는 짧고 빠른 풀이가 되지만, 선택 기준이 틀리면 그럴듯한 오답이 됩니다.

## 개념 연결

- 선행: `algo.sorting`, `algo.tree`, `algo.tree-traversal`에서 배운 순서 규칙과 부모·자식 구조를 사용합니다.
- 이 단원: `algo.heap`, `algo.priority-queue`, `algo.greedy`를 사용해 우선순위 처리와 선택 전략을 익힙니다.
- 후속: `algo.dynamic-programming-advanced`, `algo.weighted-graph`, `algo.dijkstra`에서 상태 설계와 최소 비용 탐색으로 이어집니다.

## 힙과 우선순위 큐

**우선순위 큐**는 먼저 들어온 값이 아니라 우선순위가 가장 높은 값을 먼저 꺼내는 처리 규칙입니다.
가장 작은 숫자를 먼저 꺼내는 우선순위 큐는 **최소 힙**으로 구현할 수 있습니다.
최소 힙은 각 부모가 자신의 자식보다 작거나 같은 완전 이진 트리입니다.
**완전 이진 트리**는 위쪽부터 채우고 같은 높이에서는 왼쪽부터 빈자리를 채우는 트리입니다.
최소 힙의 맨 위인 루트에는 항상 가장 작은 값이 있습니다.
배열의 인덱스가 `index`일 때 부모와 자식의 위치는 다음처럼 계산할 수 있습니다.

```text
부모: Math.floor((index - 1) / 2)
왼쪽 자식: index * 2 + 1
오른쪽 자식: index * 2 + 2
```

힙은 부모와 자식 사이의 순서만 보장하므로 배열 전체가 오름차순인 것은 아닙니다.
값을 넣을 때는 배열 끝에 추가한 뒤 부모와 비교하며 위로 올립니다.
가장 작은 값을 꺼낼 때는 루트를 제거하고 마지막 값을 루트로 옮긴 뒤 더 작은 자식과 비교하며 아래로 내립니다.
이 예제의 삽입과 삭제는 한 번에 트리 높이만큼 이동하므로 각각 `O(log n)` 시간에 실행됩니다.
여기서 `n`은 힙에 든 값의 개수이며, 값이 두 배 가까이 늘 때 트리 높이는 대략 한 단계만 늘어납니다.

## 그리디

**그리디**는 매 단계에서 지금 가장 좋아 보이는 선택을 하고 그 선택을 되돌리지 않는 문제 해결 전략입니다.
모든 문제에서 현재의 최선이 전체의 최선으로 이어지는 것은 아닙니다.
따라서 그리디를 사용하기 전에 선택 기준이 끝까지 유리하다는 근거를 설명하거나 작은 반례가 없는지 확인해야 합니다.
이 단원에서는 겹치지 않는 회의를 가장 많이 선택하는 문제를 사용합니다.
종료 시간이 가장 빠른 회의를 먼저 고르면 이후 회의에 남겨 두는 시간이 가장 많습니다.
어떤 최적 일정의 첫 회의보다 더 일찍 끝나는 회의를 골라도 이후에 사용할 수 있는 시간은 줄지 않습니다.
따라서 첫 선택을 바꿔도 회의 수를 잃지 않고, 같은 판단을 남은 회의에 반복할 수 있습니다.

## 최소 예제 1. 최소 힙으로 작은 값부터 꺼내기

다음 코드는 숫자를 최소 힙에 넣고 작은 값부터 모두 꺼냅니다.
전체 코드를 읽기 전에 값이 들어갈 때의 배열 상태부터 따라가 봅시다.
`5 → 2 → 7 → 1` 순서로 넣으면 `[5] → [2, 5] → [2, 5, 7] → [2, 1, 7, 5] → [1, 2, 7, 5]`로 바뀝니다.
새 값 `1`이 부모와 두 번 자리를 바꾸어 루트까지 올라가는 흐름입니다.

```javascript
function pushMinHeap(heap, value) {
  heap.push(value);
  let index = heap.length - 1;

  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);

    if (heap[parentIndex] <= heap[index]) break;

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
      heap[leftIndex] < heap[smallerIndex]
    ) {
      smallerIndex = leftIndex;
    }

    if (
      rightIndex < heap.length &&
      heap[rightIndex] < heap[smallerIndex]
    ) {
      smallerIndex = rightIndex;
    }

    if (smallerIndex === index) break;

    [heap[index], heap[smallerIndex]] = [heap[smallerIndex], heap[index]];
    index = smallerIndex;
  }

  return minimum;
}

const heap = [];

for (const value of [5, 2, 7, 1, 4]) {
  pushMinHeap(heap, value);
}

const ascending = [];

while (heap.length > 0) {
  ascending.push(popMinHeap(heap));
}

console.log(ascending); // [1, 2, 4, 5, 7]
```

## 최소 예제 2. 종료 시간이 빠른 회의 선택하기

다음 코드는 종료 시간이 빠른 순서로 회의를 살펴보고, 이미 고른 회의와 겹치지 않을 때만 선택합니다.

```javascript
function selectMeetings(meetings) {
  const orderedMeetings = [...meetings].sort(
    (left, right) => left.end - right.end || left.start - right.start,
  );
  const selectedNames = [];
  let lastEnd = -Infinity;

  for (const meeting of orderedMeetings) {
    if (meeting.start < lastEnd) continue;

    selectedNames.push(meeting.name);
    lastEnd = meeting.end;
  }

  return selectedNames;
}

const meetings = [
  { name: "E", start: 5, end: 8 },
  { name: "A", start: 1, end: 4 },
  { name: "D", start: 6, end: 7 },
  { name: "B", start: 3, end: 5 },
  { name: "C", start: 4, end: 6 },
];

console.log(selectMeetings(meetings)); // ["A", "C", "D"]
console.log(meetings[0].name); // "E"
```

`[...meetings]`는 바깥 배열을 복사하므로 `sort()`가 입력 배열의 순서를 바꾸지 않습니다.

## 단계별 실행 흐름

### 최소 힙

1. `5`를 넣으면 비교할 부모가 없으므로 루트가 됩니다.
2. `2`를 넣으면 부모 `5`보다 작으므로 두 값을 바꿉니다.
3. `7`을 넣으면 부모 `2`보다 크므로 그 자리에 멈춥니다.
4. `1`을 넣으면 부모를 따라 위로 이동해 루트가 됩니다.
5. 루트 `1`을 꺼내면 마지막 값을 루트로 옮기고 더 작은 자식과 바꾸며 최소 힙 규칙을 복구합니다.
6. 같은 삭제를 반복하면 `1 → 2 → 4 → 5 → 7` 순서로 값이 나옵니다.

### 회의 선택

1. 입력 배열을 복사한 뒤 종료 시간이 빠른 순서로 정렬합니다.
2. 가장 먼저 끝나는 `A`를 선택하고 `lastEnd`를 `4`로 바꿉니다.
3. `B`는 시작 시간 `3`이 `4`보다 작아 겹치므로 건너뜁니다.
4. `C`는 시작 시간과 `lastEnd`가 모두 `4`이므로 선택할 수 있습니다.
5. `D`도 `C`가 끝나는 시간 `6`에 시작하므로 선택합니다.
6. 선택 결과는 `A`, `C`, `D`가 됩니다.

## 흔한 실수

### 1. 힙 배열 전체가 정렬됐다고 생각하기

최소 힙은 부모가 자식보다 작거나 같다는 규칙만 보장합니다.
정렬된 결과가 필요하면 루트 값을 반복해서 꺼내야 합니다.

### 2. 존재하지 않는 자식과 비교하기

자식 인덱스가 `heap.length`보다 작은지 확인한 뒤 값을 읽어야 합니다.

### 3. 빈 힙에서 꺼낸 값을 숫자라고 생각하기

이 예제의 `popMinHeap([])`은 꺼낼 값이 없으므로 `undefined`를 반환합니다.

### 4. `sort()`가 입력 배열을 그대로 둔다고 생각하기

`sort()`는 호출한 배열의 순서를 바꾸므로 원본이 필요하면 먼저 배열을 복사합니다.

### 5. 현재 가장 큰 이익만 고르면 언제나 정답이라고 생각하기

그리디는 선택 기준이 전체 최적해로 이어진다는 근거가 있는 문제에서만 사용합니다.

## 확인 포인트

1. 힙의 루트와 부모·자식 사이에서 지켜야 할 규칙을 말할 수 있나요?
2. 삽입 뒤에는 위로 이동하고 삭제 뒤에는 아래로 이동하는 이유를 설명할 수 있나요?
3. 우선순위 큐의 꺼내는 순서가 일반 큐와 어떻게 다른지 설명할 수 있나요?
4. 그리디 선택 기준에 대한 근거나 반례를 확인했나요?
5. 정렬 전에 입력 배열을 보존해야 하는지 판단했나요?

## 확인 문제

1. 최소 힙의 루트가 가장 작은 값이어도 배열 전체가 정렬됐다고 말할 수 없는 이유는 무엇인가요?
2. 최소 힙에 새 값을 넣은 뒤 어느 방향으로 이동시키며 무엇과 비교하나요?
3. 우선순위 큐와 최소 힙은 어떤 관계인가요?
4. 겹치지 않는 회의를 가장 많이 고를 때 종료 시간이 빠른 회의를 먼저 선택할 수 있는 이유는 무엇인가요?

## 공식 자료

- [NIST Dictionary of Algorithms and Data Structures: heap](https://xlinux.nist.gov/dads/HTML/heap.html)
- [NIST Dictionary of Algorithms and Data Structures: priority queue](https://xlinux.nist.gov/dads/HTML/priorityque.html)
- [NIST Dictionary of Algorithms and Data Structures: greedy algorithm](https://xlinux.nist.gov/dads/HTML/greedyalgo.html)
- [MDN: Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN: Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Math.floor()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)
- [ECMAScript Language Specification: Array.prototype.sort](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)

공식 자료 확인일: 2026-08-20

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

최소 힙은 각 부모가 자신의 자식보다 작거나 같다는 관계만 보장합니다.
형제끼리나 서로 다른 가지의 값은 순서가 정해지지 않으므로 배열 전체가 오름차순인 것은 아닙니다.

### 답변 2

새 값은 배열 끝에 넣은 뒤 부모보다 작으면 자리를 바꾸며 루트 방향으로 올립니다.
부모보다 크거나 같아 최소 힙 규칙을 만족하면 이동을 멈춥니다.

### 답변 3

우선순위 큐는 우선순위가 가장 높은 값을 먼저 꺼내는 동작 규칙입니다.
최소 힙은 가장 작은 값을 루트에 유지하므로 작은 값의 우선순위가 높은 큐를 구현하는 방법이 될 수 있습니다.

### 답변 4

가장 빨리 끝나는 회의를 먼저 고르면 다음 회의를 배치할 수 있는 남은 시간을 가장 많이 확보합니다.
최적 일정의 첫 회의를 더 일찍 끝나는 회의로 바꿔도 이후 선택 가능성이 줄지 않으므로 같은 선택을 반복해 최대 개수를 얻을 수 있습니다.
