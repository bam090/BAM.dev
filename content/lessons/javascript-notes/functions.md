# 02 함수

## 학습 목표

여러 번 필요한 계산과 판단을 입력과 결과를 가진 작은 동작으로 어떻게 나누는지 알아보자.

## 한줄 요약

함수는 값을 받아 한 가지 일을 하고 결과를 돌려주는, 이름 붙인 코드 묶음이다.

## 함수가 필요한 이유

온도를 섭씨에서 화씨로 바꾸는 계산을 여러 곳에서 쓴다고 하자.

```js
const morning = 18 * 9 / 5 + 32;
const evening = 23 * 9 / 5 + 32;
```

계산식이 짧아도 여러 곳에 흩어지면 고칠 때 빠뜨리기 쉽다.
같은 뜻의 동작을 한곳에 모으고 이름을 붙이면 코드를 읽는 사람도 의도를 알 수 있다.
이 코드 묶음을 **함수(function)**라고 한다.

```js
function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}

const morning = toFahrenheit(18);
const evening = toFahrenheit(23);
```

## 함수를 선언하고 호출하기

아래처럼 `function` 뒤에 이름을 적어 함수를 정의하는 문법을
**함수 선언(function declaration)**이라고 한다.
함수 표현식과 화살표 함수처럼 함수를 정의하는 다른 문법도 있다.

```js
function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}
```

- `toFahrenheit`는 함수 이름이다.
- `celsius`는 함수가 사용할 입력에 붙인 이름이다.
- 중괄호 안은 함수를 불렀을 때 실행할 코드다.

함수 이름 뒤에 괄호를 붙여 실행하는 일을 **호출(call)**이라고 한다.

```js
const result = toFahrenheit(18);
console.log(result); // 64.4
```

함수 정의에 적은 입력 이름을 **매개변수(parameter)**라고 한다.
함수를 호출할 때 실제로 건네는 값을 **인수(argument)**라고 한다.

```js
function add(left, right) { // left와 right는 매개변수다.
  return left + right;
}

add(2, 3); // 2와 3은 인수다.
```

인수를 빠뜨리면 대응하는 매개변수에는 보통 `undefined`가 들어간다.
따라서 필요한 입력이 무엇인지 함수 경계에서 분명히 정하는 편이 좋다.

## 반환값은 호출한 곳으로 돌아간다

`return`은 함수가 만든 값을 호출한 곳으로 돌려준다.
이를 **반환값(return value)**이라고 한다.

```js
function makeLabel(name) {
  return `${name} 님의 우산`;
}

const label = makeLabel("나래");
console.log(label); // "나래 님의 우산"
```

백틱 `` ` ``으로 감싼 문자열 안의 `${name}`은 `name` 값을 그 자리에 넣는다.
이런 문자열을 **템플릿 리터럴(template literal)**이라고 한다.

실행 흐름은 다음 순서다.

1. `makeLabel("나래")`를 호출한다.
2. 인수 `"나래"`가 매개변수 `name`에 들어간다.
3. 함수가 문자열을 만든다.
4. `return`이 문자열을 호출한 자리로 돌려준다.
5. 그 값이 `label`에 대입된다.

`return`을 만나면 현재 함수의 실행은 바로 끝난다.
이 성질을 이용해 처리할 수 없는 경우를 앞에서 끝내는 방식을 **조기 반환(early return)**이라고 한다.

```js
function makeLabel(name) {
  if (name === "") {
    return "이름이 없습니다.";
  }

  return `${name} 님의 우산`;
}

console.log(makeLabel(""));     // "이름이 없습니다."
console.log(makeLabel("나래")); // "나래 님의 우산"
```

함수가 `return`을 실행하지 않고 끝나면 반환값은 `undefined`다.

### `return`과 출력은 다르다

`return`은 값을 호출한 코드가 이어서 사용하게 한다.
`console.log`는 개발자가 값을 눈으로 확인하도록 콘솔에 표시한다.
콘솔은 브라우저나 서버에서 JavaScript를 실행하는 Node.js 같은 실행 환경이 제공하는 도구다.

```js
function showLabel(name) {
  console.log(`${name} 님의 우산`);
}

function getLabel(name) {
  return `${name} 님의 우산`;
}

const shown = showLabel("나래");
const received = getLabel("나래");

console.log(shown);    // undefined
console.log(received); // "나래 님의 우산"
```

화면에 보였다는 사실과 호출자가 값을 받았다는 사실은 서로 다르다.

## 함수도 값이다

JavaScript에서는 함수도 값처럼 다룰 수 있다.
변수에 담거나 다른 함수에 인수로 건네거나 함수의 반환값으로 돌려줄 수 있다.

```js
function addOne(number) {
  return number + 1;
}

const change = addOne;
console.log(change(4)); // 5
```

다른 코드가 나중에 호출하도록 함수에 건네는 함수를 **콜백 함수(callback function)**라고 한다.
“나중”은 시간이 오래 지난 뒤라는 뜻이 아니라, 받은 쪽이 알맞은 자리에서 호출한다는 뜻이다.

```js
function changeTwice(value, change) {
  const once = change(value);
  return change(once);
}

function addOne(number) {
  return number + 1;
}

console.log(changeTwice(3, addOne)); // 5
```

실행 순서는 `3 → 4 → 5`다.
`changeTwice`가 실행되는 동안 `addOne`을 바로 두 번 호출하므로
이 콜백은 **동기적(synchronous)**으로 작동한다.
동기적이라는 말은 현재 호출 흐름 안에서 차례로 끝난다는 뜻이다.
일이 끝날 때까지 그 자리에 붙잡혀 있지 않고 나중에 결과를 받는 방식을 **비동기적(asynchronous)**이라고 한다.
콜백이라고 해서 반드시 비동기적으로 실행되는 것은 아니다.

## 화살표 함수

짧은 함수를 값으로 만들 때 **화살표 함수(arrow function)** 문법을 자주 사용한다.

```js
const double = number => number * 2;

console.log(double(4)); // 8
```

중괄호 없이 표현식 하나만 쓰면 그 표현식의 값이 자동으로 반환된다.

```js
const double = number => number * 2;
```

중괄호를 쓰면 필요한 값을 `return`으로 직접 돌려줘야 한다.

```js
const double = number => {
  return number * 2;
};
```

화살표 함수는 일반 함수의 글자 수만 줄인 문법은 아니다.
화살표 함수는 자기만의 `this`를 만들지 않는다.
`this`는 일반 함수가 호출될 때 그 호출과 연결된 대상을 가리키는 특별한 값이다.
객체 메서드와 `this`의 기본 관계는 05장에서 이어서 다룬다.

## 계산만 하는 함수와 바깥을 바꾸는 함수

같은 입력을 받으면 같은 결과를 내고 함수 밖의 상태를 바꾸지 않는 함수를 **순수 함수(pure function)**라고 부른다.
이것은 JavaScript가 강제하는 문법 종류가 아니라 함수를 나누는 설계 기준이다.

```js
function addTax(price) {
  return price * 1.1;
}
```

`addTax(1000)`은 바깥 상태가 같든 다르든 같은 결과를 계산하며 외부 값을 바꾸지 않는다.

다음 함수는 호출할 때마다 함수 밖의 `visitCount`를 바꾼다.

```js
let visitCount = 0;

function recordVisit() {
  visitCount = visitCount + 1;
  return visitCount;
}
```

프로그램에는 파일 저장, 화면 변경, 방문 횟수 기록처럼 바깥 상태를 바꾸는 함수도 필요하다.
이런 일을 **부수 효과(side effect)**라고 한다.
부수 효과가 무조건 나쁘다는 뜻은 아니다.
계산과 상태 변경을 구분해 두면 어느 함수가 무엇을 바꾸는지 찾기 쉬워진다.

함수를 나누기 전에는 세 가지를 먼저 정한다.

| 확인할 것 | 뜻 |
| --- | --- |
| 입력 | 함수가 일을 시작하려면 필요한 값 |
| 반환값 | 호출한 곳이 이어서 사용할 결과 |
| 바꾸는 상태 | 함수 밖에서 달라지는 값이나 화면 |

## 작은 흐름 하나로 연결하기

다음 함수는 머문 시간을 받아 안내 문구를 만든다.
음수는 올바른 시간이 아니므로 조기 반환한다.
숫자를 문구로 꾸미는 함수는 콜백으로 받는다.

```js
function describeStay(minutes, format) {
  if (minutes < 0) {
    return "시간을 확인해 주세요.";
  }

  return format(minutes);
}

const asMessage = minutes => `${minutes}분 머물렀습니다.`;

console.log(describeStay(15, asMessage));
console.log(describeStay(-1, asMessage));
```

실행 결과는 다음과 같다.

```text
15분 머물렀습니다.
시간을 확인해 주세요.
```

`describeStay`는 입력 검사와 호출 순서를 맡는다.
실제 문구를 만드는 동작은 `asMessage`가 맡는다.
이 예제의 콜백은 호출 중에 곧바로 실행된다.

## 핵심 정리

1. 함수는 입력을 받아 한 가지 일을 수행하고 필요한 결과를 반환하는 코드 묶음이다.
2. `return`은 현재 함수 실행을 끝내고 값을 호출한 곳으로 돌려준다.
3. 함수는 값이므로 다른 함수에 콜백으로 건넬 수 있으며, 콜백은 동기일 수도 있다.
4. 입력·반환값·바꾸는 상태를 먼저 정하면 함수의 경계가 선명해진다.

## 밤데브에서 연습할 포인트

밤데브에서는 한 덩어리의 계산을 작은 함수로 나누고, 각 함수의 매개변수·반환값·부수 효과를 구분한다.
조기 반환과 동기 콜백의 실행 순서도 반환 결과와 함께 추적한다.

## 공식 자료

- [ECMAScript 2026 — Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-function-definitions)
- [ECMAScript 2026 — Return Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-return-statement)
- [ECMAScript 2026 — ECMAScript Function Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects)
