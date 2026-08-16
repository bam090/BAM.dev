# 03. 함수·스코프·클로저

## 학습 목표

- 함수의 매개변수, 인수, 반환값을 구분할 수 있습니다.
- 함수 선언문, 함수 표현식, 화살표 함수의 기본 차이를 이해합니다.
- 스코프가 변수의 사용 가능 범위를 정한다는 것을 설명할 수 있습니다.
- 클로저가 함수와 선언 당시의 렉시컬 환경의 결합이라는 뜻을 이해합니다.

## 왜 필요한가

회원가입, 로그인, 목록 렌더링처럼 서로 다른 기능을 한 파일에 계속 이어 쓰면 코드가 길어지고 수정 범위를 찾기 어려워집니다. 함수는 동작을 이름 붙여 재사용하게 하고, 스코프와 클로저는 데이터가 어디에서 보이고 얼마나 오래 유지되는지를 결정합니다.

## 비유: 조리법과 출입 가능한 작업실

> **비유**  
> 함수는 재료를 받아 결과를 만드는 조리법입니다. 스코프는 각 조리법이 사용할 수 있는 작업실의 범위이고, 클로저는 조리법이 원래 작업실의 보관함 열쇠를 계속 기억하는 것과 비슷합니다.

정확히는 함수가 생성될 때의 렉시컬 환경에 대한 참조를 유지하기 때문에, 바깥 함수 실행이 끝난 뒤에도 필요한 바깥 변수에 접근할 수 있습니다.

## 정확한 설명

### 함수의 입력과 출력

```javascript
function add(left, right) {
  return left + right;
}

const result = add(3, 5);
```

- `left`, `right`: 함수를 정의할 때 적는 **매개변수(parameter)**
- `3`, `5`: 함수를 호출할 때 전달하는 **인수(argument)**
- `return left + right`: 호출한 곳에 값을 돌려주고 함수 실행을 종료
- `result`: 반환된 `8`을 저장

`return`을 작성하지 않은 함수의 반환값은 `undefined`입니다.

### 함수를 만드는 세 가지 기본 형태

함수 선언문:

```javascript
function greet(name) {
  return `안녕하세요, ${name}`;
}
```

함수 표현식:

```javascript
const greet = function (name) {
  return `안녕하세요, ${name}`;
};
```

화살표 함수:

```javascript
const greet = (name) => {
  return `안녕하세요, ${name}`;
};
```

표현식이 하나이고 그 값을 바로 반환할 때는 다음처럼 줄일 수 있습니다.

```javascript
const double = (number) => number * 2;
```

화살표 함수는 짧은 표기법만 다른 것이 아닙니다. 자신만의 `this`, `arguments`, `super` 바인딩을 가지지 않으므로 객체 메서드나 생성자처럼 `this`가 중요한 코드에서는 일반 함수와 바꾸기 전에 동작을 확인해야 합니다.

### 선언 이전 호출

함수 선언문은 해당 스코프가 준비될 때 함수 정의가 초기화되므로 선언이 적힌 줄보다 앞에서 호출할 수 있습니다.

```javascript
sayHello();

function sayHello() {
  console.log("안녕하세요");
}
```

반면 `const`에 저장한 함수 표현식은 변수가 초기화되기 전에 사용할 수 없습니다.

```javascript
// sayHello(); // ReferenceError

const sayHello = function () {
  console.log("안녕하세요");
};
```

코드를 읽기 쉽게 하기 위해 호출보다 정의를 먼저 배치하는 방식도 널리 사용됩니다.

### 스코프

스코프는 이름을 어디에서 사용할 수 있는지 정하는 범위입니다.

```javascript
const globalMessage = "전체에서 사용";

function printMessage() {
  const functionMessage = "함수 안에서 사용";

  if (true) {
    const blockMessage = "블록 안에서 사용";
    console.log(globalMessage, functionMessage, blockMessage);
  }

  // console.log(blockMessage); // ReferenceError
}
```

안쪽 스코프에서는 바깥 스코프의 이름을 찾을 수 있지만, 바깥쪽에서는 안쪽에만 선언된 이름을 찾을 수 없습니다.

```text
전역 스코프
└─ 함수 스코프
   └─ 블록 스코프
```

### 렉시컬 스코프와 클로저

JavaScript 함수가 접근할 수 있는 바깥 범위는 **함수를 호출한 위치가 아니라 함수를 선언한 위치**를 기준으로 정해집니다. 이를 렉시컬 스코프라고 합니다.

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

`createCounter()` 실행은 끝났지만, 반환된 `increase` 함수는 자신이 선언된 환경의 `count`에 계속 접근합니다. 이 결합이 클로저입니다.

클로저는 다음과 같은 경우에 사용됩니다.

- 여러 내부 함수가 함께 사용할 값 숨기기
- 호출 사이에 상태 유지하기
- 이벤트 처리 함수가 바깥 변수 기억하기
- 모듈의 공개 기능과 내부 기능 분리하기

```javascript
const Auth = (() => {
  const privateMessage = "외부에서 직접 접근하지 않음";

  const getMessage = () => privateMessage;

  return { getMessage };
})();

console.log(Auth.getMessage());
```

위 코드는 IIFE(즉시 실행 함수 표현식)가 한 번 실행되고, 외부에는 `getMessage`만 공개합니다. `getMessage`가 `privateMessage`를 계속 사용할 수 있는 이유가 클로저입니다. 다만 브라우저 클라이언트 코드에 숨겼다고 해서 보안 비밀이 되는 것은 아닙니다. 사용자가 내려받은 JavaScript 코드는 개발자 도구 등으로 확인할 수 있습니다.

## 실행 흐름

```javascript
function createAdder(base) {
  return (number) => base + number;
}

const addTen = createAdder(10);
const answer = addTen(5);
console.log(answer); // 15
```

1. `createAdder(10)`을 호출합니다.
2. 매개변수 `base`에 `10`이 연결됩니다.
3. `base + number`를 계산하는 화살표 함수를 반환합니다.
4. 반환된 함수를 `addTen`에 저장합니다.
5. `addTen(5)`를 호출합니다.
6. 내부 함수의 `number`는 `5`, 기억하고 있는 `base`는 `10`입니다.
7. `15`를 반환하여 `answer`에 저장합니다.

## 최소 코드

```javascript
const calculateTotal = (price, quantity) => {
  const total = price * quantity;
  return total;
};

console.log(calculateTotal(1200, 3)); // 3600
```

## 흔한 실수

### 1. 반환과 출력을 같은 것으로 생각하기

```javascript
function add(a, b) {
  console.log(a + b); // 화면에 출력하지만 값을 반환하지 않음
}

const result = add(1, 2); // undefined
```

다른 코드에서 결과를 사용하려면 `return a + b`가 필요합니다.

### 2. 반복문 안에서 너무 일찍 `return`하기

```javascript
function printAll(items) {
  for (const item of items) {
    return item; // 첫 번째 반복에서 함수 전체가 끝남
  }
}
```

`return`은 반복문만 끝내는 것이 아니라 현재 함수 실행을 끝냅니다.

### 3. 스코프 밖의 변수 사용하기

```javascript
if (true) {
  const message = "완료";
}

// console.log(message); // ReferenceError
```

### 4. 화살표 함수와 일반 함수의 `this`를 같다고 생각하기

화살표 함수는 바깥 렉시컬 환경의 `this`를 사용합니다. 객체의 현재 인스턴스를 `this`로 사용해야 하는 메서드라면 일반 메서드 문법이 더 알맞을 수 있습니다.

### 5. 클로저가 모든 바깥 값을 복사한다고 생각하기

클로저는 값을 한 번 복사해 얼려 두는 개념이 아니라, 렉시컬 환경의 바인딩에 접근합니다. 그래서 예제의 `count`가 호출할 때마다 변경된 값을 이어서 사용합니다.

## 확인 문제

1. 매개변수와 인수의 차이는 무엇인가요?
2. `return`을 생략한 함수는 무엇을 반환하나요?
3. 함수 선언문과 `const`에 저장한 함수 표현식을 선언 전에 호출할 때 어떤 차이가 있나요?
4. 안쪽 스코프에서 바깥 변수를 찾을 수 있지만 반대는 안 되는 이유를 범위 관점에서 설명해 보세요.
5. `createCounter()`의 `count`가 호출 사이에 유지되는 이유를 클로저라는 용어를 사용해 설명해 보세요.

