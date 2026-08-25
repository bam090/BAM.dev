# 01. 리스트·조건문·딕셔너리·스택과 큐

## 학습 목표

- 리스트와 딕셔너리가 각각 어떤 데이터를 저장하는지 설명할 수 있습니다.
- 조건문으로 자료구조의 상태에 따라 처리 흐름을 나눌 수 있습니다.
- 스택의 LIFO와 큐의 FIFO 순서를 구분할 수 있습니다.
- 배열로 스택과 머리 인덱스를 사용하는 큐를 구현할 수 있습니다.

## 왜 필요한가

알고리즘은 입력을 저장하고, 조건을 확인하고, 정해진 순서로 값을 처리하는 과정입니다.
여러 값을 순서대로 다룰 때는 리스트, 이름이나 ID로 값을 찾을 때는 딕셔너리가 필요합니다.
같은 값들을 저장해도 가장 최근 값을 먼저 꺼낼지, 먼저 들어온 값을 먼저 꺼낼지에 따라 스택과 큐로 나뉩니다.

## 개념 연결

- 선행: `js.arrays`, `js.objects`, `js.functions`, `js.control-flow`
- 이 단원: `algo.list`, `algo.condition`, `algo.dictionary`, `algo.stack`, `algo.queue`
- 후속: `algo.simulation`, `algo.string-processing`, `algo.hashing`

## 풀이의 기본 도구

### 리스트: 순서가 있는 여러 값

**리스트(list)**는 여러 값을 순서대로 저장하는 구조입니다. JavaScript에서는 보통 배열로 표현합니다. 몇 번째 값인지가 중요하거나 전체 값을 차례로 확인할 때 알맞습니다.

```javascript
const scores = [72, 91, 84];

console.log(scores[0]); // 72
console.log(scores.length); // 3
```

### 조건문: 상태에 따라 흐름 나누기

**조건문**은 조건식이 `true`인지 `false`인지에 따라 실행할 코드를 고릅니다. 자료구조가 비었는지, 현재 값이 기준을 만족하는지처럼 다음 행동을 결정할 때 사용합니다.

```javascript
const waitingCount = 2;

if (waitingCount > 0) {
  console.log("처리할 값이 있습니다.");
} else {
  console.log("대기 중인 값이 없습니다.");
}
```

### 딕셔너리: 키로 값 찾기

**딕셔너리(dictionary)**는 `키 → 값` 관계를 저장하는 일반적인 자료구조 이름입니다. JavaScript에 `Dictionary`라는 내장 타입이 따로 있는 것은 아닙니다. 문자열 키가 정해진 간단한 정보는 객체로, 키의 타입이 다양하거나 추가·삭제가 잦은 관계는 다음 단원의 `Map`으로 표현할 수 있습니다.

```javascript
const pointsByName = {
  민지: 3,
  지수: 5,
};

console.log(pointsByName["지수"]); // 5
```

먼저 필요한 정보가 순서인지, 키와 값의 관계인지, 값을 꺼내는 순서인지 말로 정한 뒤 자료구조를 고릅니다.

## 먼저 꺼내는 순서부터 보기

스택과 큐는 값을 어디에 저장했는지보다 어떤 값을 먼저 꺼내는지가 핵심인 처리 규칙입니다.

| 자료 구조 | 꺼내는 규칙 | 대표 상황 |
| --- | --- | --- |
| 스택 | 마지막에 넣은 값을 먼저 꺼냄 | 실행 취소, 괄호 검사 |
| 큐 | 먼저 넣은 값을 먼저 꺼냄 | 대기 작업, 너비 우선 탐색 |

## 스택: 마지막에 넣은 값부터 꺼내기

**스택**은 마지막에 넣은 값을 먼저 꺼내는 후입선출 구조입니다.
후입선출은 영어로 Last In, First Out이며 줄여서 **LIFO**라고 합니다.
값을 넣는 동작은 보통 `push`, 값을 꺼내는 동작은 보통 `pop`이라고 부릅니다.

JavaScript 배열의 `push()`와 `pop()`을 사용하면 배열 끝을 스택의 꼭대기로 삼을 수 있습니다.

```javascript
const pageHistory = [];

pageHistory.push("홈");
pageHistory.push("검색");
pageHistory.push("상세");

console.log(pageHistory[pageHistory.length - 1]); // "상세"
console.log(pageHistory.pop()); // "상세"
console.log(pageHistory.pop()); // "검색"
console.log(pageHistory); // ["홈"]
```

배열 끝을 읽으면 값을 제거하지 않고 다음에 나올 값을 확인할 수 있습니다.
이 동작은 보통 **peek**이라고 부릅니다.

## 큐: 먼저 넣은 값부터 꺼내기

**큐**는 먼저 넣은 값을 먼저 꺼내는 선입선출 구조입니다.
선입선출은 영어로 First In, First Out이며 줄여서 **FIFO**라고 합니다.
값을 넣는 동작은 보통 `enqueue`, 값을 꺼내는 동작은 보통 `dequeue`라고 부릅니다.

JavaScript에는 이름이 `Queue`인 표준 내장 컬렉션이 없습니다.
작은 예제에서는 배열 끝에 `push()`하고 배열 앞에서 `shift()`할 수 있습니다.
입력이 큰 반복 처리에서는 배열을 그대로 두고 다음에 읽을 위치인 **머리 인덱스**를 늘리는 방식도 사용할 수 있습니다.

```javascript
const waitingJobs = ["업로드", "변환", "알림"];
let head = 0;

while (head < waitingJobs.length) {
  const currentJob = waitingJobs[head];
  head += 1;
  console.log(currentJob);
}

console.log(head); // 3
console.log(waitingJobs.length - head); // 0
```

머리 인덱스 앞의 값은 이미 처리한 것으로 봅니다.
남은 큐의 길이는 전체 배열 길이가 아니라 `배열 길이 - 머리 인덱스`입니다.

ECMAScript 명세의 `shift()`는 첫 값을 꺼낸 뒤 나머지 값의 인덱스를 앞쪽으로 옮기는 동작을 정의합니다.
머리 인덱스를 사용하면 반복할 때마다 배열 앞을 삭제하지 않고 다음에 읽을 위치만 바꿀 수 있습니다.

## 실행 흐름

### 스택으로 괄호 순서 확인하기

여는 괄호를 만나면 스택에 넣고 닫는 괄호를 만나면 최근 여는 괄호를 꺼냅니다.

```javascript
function hasBalancedParentheses(text) {
  const stack = [];

  for (const character of text) {
    if (character === "(") {
      stack.push(character);
      continue;
    }

    if (character === ")") {
      if (stack.length === 0) return false;
      stack.pop();
    }
  }

  return stack.length === 0;
}

console.log(hasBalancedParentheses("(a + b) * (c - d)")); // true
console.log(hasBalancedParentheses("(()")); // false
console.log(hasBalancedParentheses(")(")); // false
```

1. 여는 괄호를 만날 때마다 스택의 길이가 늘어납니다.
2. 닫는 괄호를 만나면 가장 최근 여는 괄호 하나를 제거합니다.
3. 스택이 비었는데 닫는 괄호가 나오면 짝이 맞지 않으므로 바로 `false`를 반환합니다.
4. 문자열을 모두 읽은 뒤 스택이 비어 있어야 모든 여는 괄호의 짝이 맞습니다.

### 큐로 도착 순서대로 작업하기

처리 중 새 작업이 생겨도 배열 끝에 추가하면 기존 대기 작업 뒤에서 처리됩니다.

```javascript
function processJobs(initialJobs) {
  const queue = [...initialJobs];
  const completed = [];
  let head = 0;

  while (head < queue.length) {
    const job = queue[head];
    head += 1;
    completed.push(job);

    if (job === "분석") queue.push("보고");
  }

  return completed;
}

console.log(processJobs(["분석", "검토"])); // ["분석", "검토", "보고"]
```

1. `분석`과 `검토`가 이 순서로 큐에 들어 있습니다.
2. `분석`을 먼저 처리하면서 새 작업 `보고`를 배열 끝에 넣습니다.
3. 머리 인덱스가 다음 위치로 이동해 기존 두 번째 작업인 `검토`를 처리합니다.
4. 마지막으로 나중에 들어온 `보고`를 처리합니다.

## 최소 코드

다음 코드는 같은 두 값을 스택과 큐에서 서로 다른 순서로 꺼냅니다.

```javascript
const stack = [];
stack.push("첫째");
stack.push("둘째");
console.log(stack.pop()); // "둘째"

const queue = ["첫째", "둘째"];
let head = 0;
console.log(queue[head]); // "첫째"
head += 1;
```

스택은 가장 최근 값인 `둘째`를 먼저 꺼냅니다.
큐는 가장 먼저 들어온 값인 `첫째`를 먼저 읽습니다.

## 흔한 실수

### 1. 스택의 양쪽 끝을 섞어 사용하기

`push()`로 배열 끝에 넣었다면 `pop()`으로 같은 끝에서 꺼냅니다.
넣는 쪽과 꺼내는 쪽을 섞으면 의도한 LIFO 순서가 깨집니다.

### 2. 큐에서 `pop()`으로 꺼내기

큐의 다음 값은 가장 먼저 들어온 값입니다.
배열 끝의 `pop()`을 사용하면 나중에 들어온 값이 먼저 나와 스택처럼 동작합니다.

### 3. 빈 구조에서 꺼낸 결과를 바로 사용하기

빈 배열에서 `pop()`이나 `shift()`를 호출하면 `undefined`를 반환합니다.
꺼내기 전에 `length`나 남은 큐 길이를 확인합니다.

### 4. 머리 인덱스를 사용하면서 전체 배열 길이를 남은 개수로 생각하기

처리한 값이 배열에 남아 있으므로 `queue.length`만 보면 실제 대기 개수보다 크게 보입니다.
남은 개수는 `queue.length - head`로 계산합니다.

## 확인 포인트

1. 값의 순서가 필요한지, 키와 값의 관계가 필요한지 먼저 정했나요?
2. 자료구조의 상태에 따라 달라지는 행동을 조건문으로 나눴나요?
3. 스택에서는 같은 배열 끝에 `push()`하고 `pop()`하나요?
4. 큐의 반복 조건과 빈 구조에서 값을 꺼내는 경우를 확인했나요?

## 확인 문제

1. 리스트와 딕셔너리는 각각 어떤 기준으로 값을 저장하고 찾나요?
2. 조건문은 자료구조를 처리하는 흐름에서 어떤 역할을 하나요?
3. 스택의 LIFO와 큐의 FIFO는 값을 꺼내는 순서가 어떻게 다른가요?
4. JavaScript 배열로 스택과 큐를 구현할 때 각각 어느 위치를 사용하나요?

## 공식 자료

- [MDN: Indexed collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
- [MDN: Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [Princeton Algorithms: Bags, Queues, and Stacks](https://algs4.cs.princeton.edu/13stacks/)

공식 자료 확인일: 2026-08-23

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

리스트는 값의 순서를 유지하며 위치로 값을 찾고, 딕셔너리는 이름이나 ID 같은 키에 값을 연결해 찾습니다. 따라서 순서가 중요하면 리스트, 키와 값의 관계가 중요하면 딕셔너리를 선택합니다.

### 답변 2

조건문은 자료구조가 비었는지 또는 현재 값이 기준을 만족하는지를 확인하고 다음 행동을 선택합니다. 예를 들어 스택이 비어 있지 않을 때만 값을 꺼내도록 흐름을 나눌 수 있습니다.

### 답변 3

스택은 마지막에 넣은 값을 먼저 꺼내는 LIFO 구조이고, 큐는 먼저 넣은 값을 먼저 꺼내는 FIFO 구조입니다. 필요한 처리 순서를 먼저 확인한 뒤 둘 중 하나를 선택합니다.

### 답변 4

스택은 배열 끝에 `push()`하고 같은 끝에서 `pop()`합니다. 큐는 배열 끝에 값을 추가하고 머리 인덱스가 가리키는 값을 읽은 뒤 인덱스를 늘리면 먼저 들어온 순서를 유지할 수 있습니다.
