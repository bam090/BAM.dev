# 04. 정렬·투 포인터·슬라이딩 윈도우

## 학습 목표

- 숫자 정렬에서 비교 함수가 필요한 이유를 설명할 수 있습니다.
- 투 포인터의 두 위치가 어떤 조건으로 이동하는지 추적할 수 있습니다.
- 슬라이딩 윈도우의 구간 합을 이전 값에서 갱신할 수 있습니다.
- 정렬 여부와 연속 구간 조건을 문제에서 먼저 확인할 수 있습니다.

## 왜 필요한가

배열의 모든 조합이나 모든 연속 구간을 매번 처음부터 조사하면 같은 값을 여러 번 확인하게 됩니다.
값을 순서대로 놓거나 이미 계산한 구간 정보를 재사용하면 불필요한 반복을 줄일 수 있습니다.
코딩 테스트에서는 문제의 입력이 정렬되어 있는지와 구간이 연속되어 있는지를 먼저 살피는 습관이 중요합니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.hashing`
- 이 단원: `algo.sorting`, `algo.two-pointers`, `algo.sliding-window`
- 후속: `algo.brute-force`, `algo.number-theory`, `algo.binary-search`

## 정렬

**정렬**은 값을 정해진 기준에 맞게 순서대로 배치하는 일입니다.
JavaScript의 `sort()`에 전달하는 **비교 함수**는 두 값 중 어느 값을 앞에 둘지 정합니다.
**시간 복잡도**는 입력 크기가 커질 때 필요한 작업량이 어떻게 늘어나는지 나타내는 표기입니다.
이 단원에서 `n`은 배열의 값 개수이며, `O(n)`은 값 개수에 비례해 작업량이 늘어난다는 뜻입니다.

숫자를 오름차순으로 정렬할 때는 `(left, right) => left - right`를 사용합니다.
원본을 남기려면 먼저 배열을 복사합니다.

```javascript
const numbers = [10, 2, 30, 4];
const sortedNumbers = [...numbers].sort((left, right) => left - right);

console.log(sortedNumbers); // [2, 4, 10, 30]
console.log(numbers); // [10, 2, 30, 4]
```

비교 함수를 생략하면 요소를 문자열로 바꾼 뒤 글자 코드 순서로 비교합니다.
정확히는 JavaScript가 문자열을 저장할 때 사용하는 기본 숫자 단위인 UTF-16 코드 단위를 비교합니다.
따라서 `[10, 2, 30]`을 숫자 크기대로 정렬하려면 비교 함수가 필요합니다.
`sort()` 자체는 원본 배열을 바꾸며, 사용되는 정렬 알고리즘과 시간 복잡도는 JavaScript 명세가 하나로 고정하지 않습니다.

## 투 포인터

**투 포인터**는 배열의 두 위치를 가리키는 인덱스를 조건에 따라 움직이는 방법입니다.
다음 예제는 오름차순으로 정렬된 배열에서 합이 `9`인 두 수를 찾습니다.

```javascript
const numbers = [1, 2, 4, 7, 11];
const target = 9;
let left = 0;
let right = numbers.length - 1;
let answer = null;

while (left < right) {
  const sum = numbers[left] + numbers[right];

  if (sum === target) {
    answer = [numbers[left], numbers[right]];
    break;
  }

  if (sum < target) {
    left += 1;
  } else {
    right -= 1;
  }
}

console.log(answer); // [2, 7]
```

합이 목표보다 작으면 더 큰 합이 필요하므로 왼쪽 포인터를 오른쪽으로 옮깁니다.
합이 목표보다 크면 더 작은 합이 필요하므로 오른쪽 포인터를 왼쪽으로 옮깁니다.
이 판단은 배열이 오름차순이라는 조건 때문에 가능합니다.
두 포인터가 각각 한 방향으로만 움직이므로 이 탐색 부분은 O(n)입니다.
정렬부터 해야 하는 문제라면 전체 작업에는 정렬 비용도 포함해야 합니다.

## 슬라이딩 윈도우

**슬라이딩 윈도우**는 배열이나 문자열의 연속된 구간을 창문처럼 옮기며 필요한 값을 갱신하는 방법입니다.
다음 예제는 길이가 `3`인 연속 구간 중 가장 큰 합을 구합니다.

## 최소 예제

```javascript
const numbers = [2, 1, 5, 1, 3, 2];
const windowSize = 3;
let windowSum = 0;

for (let index = 0; index < windowSize; index += 1) {
  windowSum += numbers[index];
}
let maxSum = windowSum;

for (let right = windowSize; right < numbers.length; right += 1) {
  const left = right - windowSize;
  windowSum -= numbers[left];
  windowSum += numbers[right];
  maxSum = Math.max(maxSum, windowSum);
}

console.log(maxSum); // 9
```

첫 구간의 합은 `2 + 1 + 5`인 `8`입니다.
창문이 한 칸 움직일 때마다 빠지는 값 하나를 빼고 들어오는 값 하나를 더합니다.
모든 구간의 합을 처음부터 다시 계산하지 않으므로 이 예제는 O(n)에 처리됩니다.

## 실행 흐름

1. 인덱스 `0`부터 `2`까지의 합 `8`을 `windowSum`과 `maxSum`에 저장합니다.
2. 오른쪽 인덱스가 `3`이 되면 왼쪽에서 빠지는 `2`를 빼고 새로 들어오는 `1`을 더합니다.
3. 같은 방식으로 창문을 한 칸씩 옮기며 현재 합과 최대 합을 비교합니다.
4. 구간 `[5, 1, 3]`의 합 `9`가 가장 크므로 `9`를 출력합니다.

## 언제 어떤 방법을 선택할까

| 관찰한 조건 | 먼저 떠올릴 방법 |
| --- | --- |
| 값을 순서대로 비교해야 함 | 정렬 |
| 정렬된 배열의 양쪽 또는 두 배열을 함께 탐색함 | 투 포인터 |
| 길이 또는 조건을 만족하는 연속 구간을 탐색함 | 슬라이딩 윈도우 |

이 표는 출발점을 고르는 기준이며 모든 문제에 자동으로 적용되는 공식은 아닙니다.
포인터를 옮겨도 버린 범위에 정답이 없다는 근거를 문제 조건에서 확인해야 합니다.

## 흔한 실수

### 1. 숫자 정렬에서 비교 함수를 생략하기

숫자 크기순 정렬에는 `(left, right) => left - right` 같은 비교 함수가 필요합니다.

### 2. `sort()`가 원본을 유지한다고 생각하기

원본이 필요하다면 `[...numbers].sort(...)`처럼 복사본을 정렬합니다.

### 3. 정렬되지 않은 배열에 합 찾기 규칙을 그대로 사용하기

합의 크기에 따라 한쪽 포인터를 옮기는 판단은 정렬 상태에 의존합니다.

### 4. 슬라이딩 윈도우를 연속되지 않은 선택에 사용하기

슬라이딩 윈도우가 관리하는 범위는 시작과 끝 사이의 연속 구간입니다.

### 5. 구간 크기의 경계를 확인하지 않기

고정 크기 창문은 크기가 양수이고 배열 길이보다 크지 않은지 먼저 확인해야 합니다.

## 확인 포인트

1. 입력 배열이 이미 정렬되어 있는지 확인했나요?
2. `sort()`가 원본을 바꿔도 되는지 확인했나요?
3. 포인터를 움직인 뒤 버리는 범위에 정답이 없다는 근거가 있나요?
4. 슬라이딩 윈도우의 구간이 연속되어 있고 갱신 값이 정확한가요?

## 확인 문제

1. 숫자 배열을 `sort()`로 오름차순 정렬할 때 비교 함수가 필요한 이유는 무엇인가요?
2. 정렬된 배열에서 두 수의 합이 목표보다 작을 때 왼쪽 포인터를 옮기는 이유는 무엇인가요?
3. 고정 크기 슬라이딩 윈도우가 모든 구간의 합을 다시 계산하지 않아도 되는 이유는 무엇인가요?
4. 투 포인터 탐색 전에 정렬이 필요하다면 전체 작업을 O(n)이라고만 말하면 안 되는 이유는 무엇인가요?

## 공식 자료

- [MDN: Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MIT OpenCourseWare: Introduction to Algorithms — Sorting](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-notes/)
- [Purdue University: Introduction to Competitive Programming](https://www.cs.purdue.edu/homes/ninghui/courses/390_Fall19/lectures.html)

공식 자료 확인일: 2026-08-20

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

비교 함수를 생략한 `sort()`는 값을 문자열로 바꾸어 비교하므로 숫자의 크기순과 다른 결과가 나올 수 있습니다.
숫자 오름차순 정렬에는 두 수의 차를 반환하는 비교 함수를 전달합니다.

### 답변 2

배열이 오름차순이므로 현재 합이 작을 때 왼쪽 값을 더 큰 값으로 바꿔야 목표에 가까워질 수 있습니다.
그래서 왼쪽 포인터를 오른쪽으로 한 칸 옮깁니다.

### 답변 3

창문이 한 칸 이동하면 이전 구간과 새 구간의 대부분이 같습니다.
빠진 값 하나를 빼고 들어온 값 하나를 더하면 새 구간의 합을 구할 수 있습니다.

### 답변 4

두 포인터가 한 방향으로 움직이는 탐색 부분만 보면 O(n)입니다.
입력을 먼저 정렬해야 한다면 전체 비용에는 JavaScript 실행 환경에서 수행되는 정렬 비용도 포함해야 합니다.
