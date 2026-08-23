# 05. 완전 탐색·백트래킹·재귀

## 학습 목표

- 완전 탐색이 가능한 후보를 모두 확인하는 방식임을 설명할 수 있습니다.
- 재귀 함수의 종료 조건과 더 작은 다음 문제를 작성할 수 있습니다.
- 선택, 재귀 호출, 선택 취소로 백트래킹 상태를 복원할 수 있습니다.
- 정답을 버리지 않는 조건에서만 가지치기를 적용할 수 있습니다.

## 왜 필요한가

어떤 문제는 한 번의 계산으로 정답을 고르기 어렵지만 가능한 선택의 수가 충분히 작습니다.
이때 후보를 체계적으로 모두 확인하면 빠뜨리지 않고 정답을 찾을 수 있습니다.
백트래킹은 정답이 될 수 없는 경로를 일찍 멈춰 불필요한 탐색을 줄입니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.sorting`
- 이 단원: `algo.brute-force`, `js.recursion`, `algo.backtracking`
- 후속: `algo.number-theory`, `algo.geometry`, `algo.binary-search`

## 완전 탐색

**완전 탐색**은 정답이 될 수 있는 후보를 빠짐없이 만들어 확인하는 방법입니다.
다음 예제는 서로 다른 두 위치를 모두 확인해 합이 `10`인 쌍을 찾습니다.

## 최소 예제

```javascript
const numbers = [3, 6, 7, 2];
const target = 10;
const pairs = [];

for (let left = 0; left < numbers.length; left += 1) {
  for (let right = left + 1; right < numbers.length; right += 1) {
    if (numbers[left] + numbers[right] === target) {
      pairs.push([numbers[left], numbers[right]]);
    }
  }
}

console.log(pairs); // [[3, 7]]
```

`right`를 `left + 1`에서 시작해 같은 위치를 두 번 고르지 않습니다.
두 반복문은 가능한 위치 쌍을 모두 확인하므로 이 예제의 시간 복잡도는 O(n²)입니다.
여기서 `n`은 배열의 값 개수이며, `O(n²)`은 값 개수가 늘 때 확인할 위치 쌍이 제곱에 비례해 늘 수 있다는 뜻입니다.
입력이 커지면 후보 수가 빠르게 늘 수 있으므로 제한된 입력 크기를 먼저 확인해야 합니다.

## 재귀

**재귀**는 함수가 더 작은 형태의 같은 문제를 해결하기 위해 자기 자신을 호출하는 방식입니다.
재귀 함수에는 호출을 멈추는 **종료 조건**과 문제가 종료 조건에 가까워지는 단계가 필요합니다.
다음 예제의 `number`는 `0` 이상의 정수라고 가정합니다.

```javascript
function sumTo(number) {
  if (number === 0) return 0;
  return number + sumTo(number - 1);
}

console.log(sumTo(5)); // 15
```

`sumTo(5)`는 `5 + sumTo(4)`로 바뀌고 같은 과정이 `sumTo(0)`까지 이어집니다.
`sumTo(0)`이 `0`을 반환하면 기다리던 호출들이 역순으로 계산을 마칩니다.
JavaScript의 가능한 재귀 깊이는 실행 환경과 코드에 따라 달라지므로 고정된 호출 횟수를 가정하지 않습니다.

## 백트래킹

**백트래킹**은 선택을 하나 추가해 탐색하고, 그 선택으로 정답을 만들 수 없으면 이전 상태로 돌아가 다른 선택을 시도하는 방법입니다.
정답이 될 수 없는 경로를 멈추는 판단을 **가지치기**라고 합니다.

다음 예제는 모두 양수인 배열에서 합이 `5`가 되는 조합을 찾습니다.
합이 이미 목표보다 크면 이후에 양수를 더해도 목표가 될 수 없으므로 안전하게 가지치기할 수 있습니다.

```javascript
const numbers = [2, 3, 5];
const target = 5;
const combinations = [];
const path = [];

function search(index, sum) {
  if (sum === target) {
    combinations.push([...path]);
    return;
  }

  if (sum > target || index === numbers.length) return;

  path.push(numbers[index]);
  search(index + 1, sum + numbers[index]);
  path.pop();

  search(index + 1, sum);
}

search(0, 0);
console.log(combinations); // [[2, 3], [5]]
```

`path.push()`는 현재 숫자를 고르는 단계입니다.
첫 번째 재귀 호출은 그 선택을 포함한 다음 문제를 탐색합니다.
`path.pop()`은 선택 전 상태로 되돌리는 단계입니다.
두 번째 재귀 호출은 현재 숫자를 고르지 않은 경우를 탐색합니다.

## 실행 흐름

1. `2`를 선택한 뒤 `3`을 선택하면 합이 `5`가 되어 `[2, 3]`을 복사해 저장합니다.
2. 호출이 돌아오면 `3`을 꺼내고 `3`을 선택하지 않은 경로를 확인합니다.
3. `2`를 선택한 상태에서 `5`까지 선택하면 합이 목표를 넘으므로 그 경로를 멈춥니다.
4. `2`와 `3`을 모두 선택하지 않은 경로에서 `5`를 선택해 `[5]`를 저장합니다.
5. 각 호출이 끝날 때 `path`를 이전 상태로 되돌렸으므로 다른 경로가 깨끗한 상태에서 시작합니다.

## 완전 탐색과 백트래킹의 차이

완전 탐색은 가능한 후보를 모두 확인한다는 문제 해결 원칙입니다.
백트래킹은 후보를 선택의 트리로 만들고 불가능한 경로를 되돌아오는 구현 방법입니다.
가지치기가 있어도 최악의 경우에는 모든 후보를 확인할 수 있습니다.
따라서 백트래킹을 사용했다는 이유만으로 항상 빠르다고 말할 수 없습니다.

## 흔한 실수

### 1. 종료 조건을 작성하지 않기

호출을 멈추는 조건이 없으면 재귀 호출이 계속 이어져 오류가 발생할 수 있습니다.

### 2. 문제가 종료 조건에 가까워지지 않기

재귀 호출의 `index`나 남은 크기 같은 값이 실제로 변하는지 확인합니다.

### 3. 현재 경로를 그대로 결과에 넣기

`combinations.push(path)`는 이후에도 바뀌는 같은 배열을 저장합니다.
현재 결과는 `combinations.push([...path])`처럼 복사해 저장합니다.

### 4. 선택을 되돌리지 않기

`push()`로 추가한 선택은 해당 경로 탐색이 끝난 뒤 `pop()`으로 제거해야 합니다.

### 5. 조건 없이 가지치기하기

예제의 `sum > target` 가지치기는 모든 수가 양수라는 조건에 의존합니다.
음수가 있다면 이후 합이 다시 작아질 수 있으므로 같은 가지치기를 사용할 수 없습니다.

## 확인 포인트

1. 가능한 후보를 빠짐없이 만들고 있나요?
2. 재귀의 종료 조건과 더 작은 문제로 가는 단계가 있나요?
3. 공유 상태를 바꾼 뒤 다음 경로 전에 원래 상태로 되돌렸나요?
4. 가지치기로 버린 경로에 정답이 없다는 근거가 있나요?

## 확인 문제

1. 완전 탐색을 사용하기 전에 입력 크기와 후보 수를 확인해야 하는 이유는 무엇인가요?
2. 재귀 함수에 종료 조건과 문제가 작아지는 단계가 모두 필요한 이유는 무엇인가요?
3. 백트래킹에서 `path.push()` 뒤에 `path.pop()`이 필요한 이유는 무엇인가요?
4. 양수 배열에서 사용한 `sum > target` 가지치기를 음수가 있는 배열에 그대로 적용하면 안 되는 이유는 무엇인가요?

## 공식 자료

- [University of Washington CSE 123: Exhaustive Search and Recursive Backtracking](https://courses.cs.washington.edu/courses/cse123/24su/lectures/13/13.pdf)
- [MIT OpenCourseWare: Recursive Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec15/)
- [MDN: InternalError — too much recursion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)

공식 자료 확인일: 2026-08-20

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

완전 탐색의 실행 시간은 만들어야 하는 후보 수에 직접 영향을 받습니다.
후보가 입력 크기에 따라 제곱이나 지수 형태로 늘 수 있으므로 제한 안에서 실행 가능한지 먼저 판단해야 합니다.

### 답변 2

종료 조건은 재귀 호출을 멈추고 실제 값을 반환하는 기준입니다.
각 호출에서 문제가 작아져야 결국 그 종료 조건에 도달할 수 있습니다.

### 답변 3

`path`는 여러 재귀 호출이 함께 사용하는 현재 선택 배열입니다.
한 경로의 탐색이 끝나면 `pop()`으로 선택을 되돌려야 다음 경로가 이전 선택의 영향을 받지 않습니다.

### 답변 4

모든 수가 양수이면 목표를 넘은 합은 이후 값을 더해도 작아지지 않습니다.
음수가 있으면 뒤에서 합이 다시 줄어 목표가 될 수 있으므로 그 경로를 미리 버리면 정답을 놓칠 수 있습니다.
