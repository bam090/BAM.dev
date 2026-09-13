# 03. 함수·스코프·클로저

## 학습 목표

- 함수의 매개변수, 인수, 반환값을 구분할 수 있습니다.
- 함수 선언문, 함수 표현식, 화살표 함수의 기본 차이를 이해합니다.
- 스코프가 변수의 사용 가능 범위를 정한다는 것을 설명할 수 있습니다.
- 클로저가 함수와 선언 당시의 렉시컬 환경의 결합이라는 뜻을 이해합니다.

## 왜 필요한가

같은 코드를 여러 번 복사하면 수정할 곳도 늘어납니다.
함수는 동작에 이름을 붙여 다시 사용하게 해 줍니다.
스코프와 클로저를 알면 변수를 어디에서 쓸 수 있고, 함수가 어떤 값을 계속 기억하는지도 이해할 수 있습니다.

## 함수의 입력과 출력

**함수**는 필요한 값을 받아 정해진 일을 하고 결과를 돌려주는 코드 묶음입니다.

```javascript
function add(left, right) {
  return left + right;
}

const result = add(3, 5);
```

- `left`, `right`: 함수를 만들 때 정하는 **매개변수**
- `3`, `5`: 함수를 호출할 때 전달하는 **인수**
- `return`: 결과를 호출한 곳에 돌려주고 함수 실행을 끝내는 문장
- `result`: 반환된 값 `8`을 저장한 변수

`return`을 작성하지 않은 함수는 `undefined`를 반환합니다.
`console.log()`로 값을 보여 주는 것과 값을 `return`하는 것은 서로 다른 일입니다.

## 함수를 만드는 세 가지 형태

```javascript
// 함수 선언문
function greet(name) {
  return `안녕하세요, ${name}`;
}

// 함수 표현식
const greetExpression = function (name) {
  return `안녕하세요, ${name}`;
};

// 화살표 함수
const greetArrow = (name) => `안녕하세요, ${name}`;
```

백틱으로 만든 문자열에서 `${name}`은 현재 `name` 값을 문자열 안에 넣습니다.
**표현식**은 하나의 값을 만드는 코드입니다.
화살표 함수의 본문이 중괄호 없는 표현식 하나라면 그 결과를 자동으로 반환합니다.

| 형태 | 처음에는 이렇게 이해하세요 |
| --- | --- |
| 함수 선언문 | 이름을 붙여 만든 기본 함수 |
| 함수 표현식 | 함수를 값으로 만드는 표현식이며, 이 예제에서는 이름 없는 함수를 변수에 저장 |
| 화살표 함수 | 짧게 쓸 수 있는 함수 표현식 |

함수 선언문은 선언이 적힌 줄보다 앞에서도 호출할 수 있습니다.
`const`에 저장하는 함수 표현식과 화살표 함수는 변수가 만들어진 뒤에 호출해야 합니다.
처음에는 어떤 형태든 **정의한 다음 호출하는 순서**로 작성하면 읽기 쉽습니다.

JavaScript에서 함수도 값처럼 변수에 저장하고, 다른 함수의 인수로 전달하거나, 함수의 반환값으로 사용할 수 있습니다.

## 스코프

**스코프**는 변수 이름을 사용할 수 있는 범위입니다.

```javascript
const globalMessage = "바깥 변수";

function printMessage() {
  const functionMessage = "함수 변수";

  if (true) {
    const blockMessage = "블록 변수";
    console.log(globalMessage, functionMessage, blockMessage);
  }

  // console.log(blockMessage); // 블록 밖에서는 사용할 수 없음
}
```

안쪽 범위에서는 바깥 변수를 찾을 수 있지만, 바깥 범위에서는 안쪽에만 선언된 변수를 찾을 수 없습니다.

```text
전역 범위
└─ 함수 범위
   └─ 블록 범위
```

## 렉시컬 스코프와 클로저

함수가 바깥 변수를 찾을 때는 **호출된 위치가 아니라 작성된 위치**를 기준으로 합니다.
이를 **렉시컬 스코프**라고 합니다.

**렉시컬 환경**은 함수가 만들어진 위치에서 사용할 수 있었던 변수들의 관계입니다.
처음에는 “함수가 만들어질 때 보이던 바깥 변수를 기억한다”라고 이해하면 충분합니다.

```javascript
function createCounter() {
  let count = 0;

  return function increase() {
    count += 1;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
```

`createCounter()` 실행이 끝난 뒤에도 반환된 `increase` 함수는 작성 당시의 `count`에 접근합니다.
함수와 이 렉시컬 환경의 결합을 **클로저**라고 합니다.

클로저는 바깥 값의 사진을 한 번 찍어 두는 것이 아닙니다.
같은 `count` 변수를 계속 사용하므로 변경된 값이 다음 호출에도 이어집니다.

## 실행 흐름

위의 `createCounter()`를 다시 따라가 봅시다.

1. `createCounter()`를 호출해 `count`를 `0`으로 만듭니다.
2. 안쪽 함수 `increase`를 반환해 `counter`에 저장합니다.
3. `counter()`를 처음 호출하면 `count`가 `1`이 되고 `1`을 반환합니다.
4. 두 번째 호출도 같은 `count`를 사용하므로 `2`를 반환합니다.

## 최소 코드

```javascript
const makeLabel = (score) => `${score}점`;

console.log(makeLabel(80)); // "80점"
```

## 흔한 실수

### 1. 출력과 반환을 같은 것으로 생각하기

```javascript
function add(left, right) {
  console.log(left + right); // 보여 주지만 반환하지 않음
}

const result = add(1, 2); // undefined
```

다른 코드에서 결과를 사용하려면 `return left + right`가 필요합니다.

### 2. 반복 중 너무 일찍 `return`하기

```javascript
function firstItem(items) {
  for (const item of items) {
    return item; // 첫 번째 반복에서 함수 전체가 끝남
  }
}
```

`return`은 반복문만이 아니라 현재 함수 실행 전체를 끝냅니다.

### 3. 스코프 밖의 변수 사용하기

```javascript
if (true) {
  const message = "완료";
}

// console.log(message); // 블록 밖에서는 사용할 수 없음
```

## 확인 포인트

1. 함수가 받을 값과 반환할 값이 분명한가요?
2. 결과를 다른 곳에서 쓴다면 `console.log()`가 아니라 `return`했나요?
3. 변수를 선언된 스코프 안에서 사용하고 있나요?
4. 클로저가 기억하는 변수는 함수가 작성된 위치에서 찾을 수 있나요?

## 확인 문제

1. 매개변수, 인수, 반환값의 차이를 설명해 보세요.
2. 중괄호가 없는 한 줄 화살표 함수에서는 어떤 동작이 생략되어 있나요?
3. 안쪽 스코프에서는 바깥 변수를 찾을 수 있지만 반대 방향은 안 되는 이유는 무엇인가요?
4. `createCounter()`의 `count`가 호출 사이에 이어지는 이유를 클로저라는 말로 설명해 보세요.

## 공식 자료

- [MDN: 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: JavaScript 문법과 스코프](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variable_scope)
- [MDN: 클로저](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)

공식 자료 확인일: 2026-08-18

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

매개변수는 함수를 정의할 때 받을 값에 붙인 이름이고, 인수는 함수를 호출할 때 실제로 전달하는 값입니다.
반환값은 함수가 `return`으로 호출한 곳에 돌려주는 결과입니다.

### 답변 2

중괄호가 없는 한 줄 화살표 함수에서는 표현식 결과를 돌려주는 `return`이 생략되어 있습니다.

### 답변 3

스코프는 바깥에서 안쪽으로 중첩되므로 안쪽 코드는 자신에게 없는 이름을 바깥 스코프에서 찾을 수 있습니다.
반대로 안쪽에서 선언한 변수는 그 스코프 밖에서 사용할 수 없으므로 바깥 코드에서는 찾을 수 없습니다.

### 답변 4

`createCounter()`가 반환한 함수는 만들어질 때 보이던 `count`와 그 렉시컬 환경을 계속 기억하는 클로저입니다.
그래서 `createCounter()` 실행이 끝난 뒤에도 같은 `count`를 읽고 바꿀 수 있어 호출 사이에 값이 이어집니다.
