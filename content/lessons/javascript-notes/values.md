# 01 값과 실행 흐름

## 학습 목표

사람이 말로 적은 요구사항을 JavaScript가 처리할 수 있는 값과 실행 순서로 어떻게 바꾸는지 알아보자.

## 한줄 요약

들어오는 값, 기억할 상태, 판단할 조건, 내보낼 결과를 차례로 나누면 긴 요구사항도 작은 코드로 옮길 수 있다.

## JavaScript는 값을 다룬다

JavaScript 코드가 다루는 글자, 숫자, 참과 거짓 같은 한 조각의 정보를 **값(value)**이라고 한다.
값마다 할 수 있는 일이 다르다.
숫자는 더할 수 있고, 글자는 이어 붙일 수 있다.
값의 종류를 **타입(type)**이라고 한다.

```js
"밤 산책"   // 문자열: 글자
3           // 숫자
true        // 불리언: 참 또는 거짓
```

JavaScript의 정확한 언어 타입은 여덟 가지다.

| 타입 | 쉬운 뜻 | 예 |
| --- | --- | --- |
| `String` | 글자 묶음 | `"밤 산책"` |
| `Number` | 보통 사용하는 숫자 | `3`, `1.5`, `NaN` |
| `Boolean` | 참 또는 거짓 | `true`, `false` |
| `Undefined` | 아직 값이 정해지지 않음 | `undefined` |
| `Null` | 일부러 비어 있음을 표시함 | `null` |
| `BigInt` | 아주 큰 정수를 정확히 다룰 때 쓰는 수 | `10n` |
| `Symbol` | 다른 키와 겹치지 않는 고유한 키 | `Symbol("id")` |
| `Object` | 여러 값을 이름이나 순서로 묶은 대상 | `{ name: "밤" }` |

처음에는 문자열, 숫자, 불리언, `undefined`, `null`, 객체를 자주 만난다.
`BigInt`와 `Symbol`은 필요한 상황이 왔을 때 더 배워도 된다.

`NaN`은 “유효한 숫자 결과가 아님”을 나타내는 특별한 숫자 값이다.
예를 들어 숫자로 바꿀 수 없는 글자를 수치 계산에 사용하면 만날 수 있다.

### 원시값과 객체

객체가 아닌 일곱 타입의 값을 **원시값(primitive value)**이라고 한다.
원시값 자체는 안쪽을 고칠 수 없는 값이다.
변수가 다른 원시값을 기억하게 바꾸는 것은 가능하지만, 원래 값의 일부를 뜯어 고치는 일은 할 수 없다.

객체는 여러 값을 한 대상에 묶는다.

```js
const lamp = {
  color: "노랑",
  on: false,
};

lamp.on = true;
```

`lamp`가 기억하는 객체 안의 `on` 값은 바뀌었다.
객체를 여러 이름이 함께 가리킬 때 어떤 변화가 공유되는지는 04장에서 자세히 다룬다.

`null`은 원시값이다.
`typeof null`의 결과가 역사적인 이유로 `"object"`이지만, 이것을 보고 `null`이 객체라고 판단하면 안 된다.

## 값을 기억하는 이름: 변수

값을 다시 사용하려면 이름을 붙여 둔다.
이렇게 값을 기억하는 이름을 **변수(variable)**라고 한다.

```js
const destination = 4;
let currentFloor = 1;
```

- `const`는 그 이름에 다른 값을 다시 넣지 않을 때 사용한다.
- `let`은 실행 중에 그 이름이 기억하는 값을 바꿔야 할 때 사용한다.
- 처음 이름을 만드는 일을 **선언(declaration)**이라고 한다.
- 이름에 값을 넣는 일을 **대입(assignment)**이라고 한다.

```js
let currentFloor = 1; // 선언하면서 1을 대입한다.
currentFloor = 2;     // 이미 있는 변수에 2를 대입한다.
```

`const`는 이름의 재대입을 막는다.
객체 안의 값까지 얼리는 기능은 아니다.

```js
const lamp = { on: false };
lamp.on = true;       // 가능하다.
// lamp = { on: true }; // 다른 객체를 다시 대입하므로 오류가 난다.
```

## 값을 계산하고 비교하는 연산자

값을 계산하거나 비교하는 기호를 **연산자(operator)**라고 한다.

```js
const total = 3 + 2;       // 5
const rest = 7 - 4;        // 3
const area = 3 * 4;        // 12
const half = 8 / 2;        // 4
const same = total === 5;  // true
```

`=`와 `===`는 역할이 다르다.

- `=`는 오른쪽 값을 왼쪽 이름이나 속성에 넣는다.
- `===`는 두 값의 타입과 값을 엄격하게 비교한다.

객체끼리 `===`로 비교할 때는 속성 내용이 닮았는지가 아니라 같은 객체인지를 본다.

`+`도 값의 타입에 따라 결과가 달라진다.

```js
console.log(2 + 1);     // 3
console.log("2" + 1);  // "21"
```

한쪽이 문자열이면 `+`는 글자를 이어 붙일 수 있다.
숫자 덧셈을 원한다면 입력이 실제 숫자인지 먼저 확인해야 한다.

### 논리 연산자와 truthy·falsy

조건을 이어 붙일 때 `&&`, `||`, `!` 같은 **논리 연산자(logical operator)**를 사용한다.

```js
const hasKey = true;
const doorOpen = false;

console.log(hasKey && doorOpen); // false
console.log(hasKey || doorOpen); // true
console.log(!doorOpen);          // true
```

`if` 같은 조건 자리에서는 값이 참처럼 취급되는지 거짓처럼 취급되는지를 확인한다.
참처럼 취급되는 값을 **truthy**, 거짓처럼 취급되는 값을 **falsy**라고 부른다.
이것은 새로운 타입이 아니라 불리언으로 바꾸어 판단한 결과다.

falsy인 값은 `false`, `0`, `-0`, `0n`, 빈 문자열 `""`, `null`, `undefined`, `NaN`이다.
그 밖의 일반 객체는 truthy다.
빈 배열 `[]`과 빈 객체 `{}`도 truthy다.

`&&`와 `||`는 언제나 불리언을 돌려주는 것도 아니다.
필요한 만큼만 계산한 뒤 피연산자 가운데 하나를 결과로 돌려준다.

```js
console.log("이름" || "손님"); // "이름"
console.log("" || "손님");     // "손님"
```

## 조건에 따라 길을 고르기

조건에 따라 다른 코드를 실행하는 일을 **조건 분기**라고 한다.
두 갈래나 몇 개의 범위를 나눌 때는 `if`가 잘 맞는다.

```js
const roomTemperature = 19;

if (roomTemperature < 18) {
  console.log("난방을 켭니다.");
} else if (roomTemperature > 26) {
  console.log("창문을 엽니다.");
} else {
  console.log("그대로 둡니다.");
}
```

하나의 값이 정해진 여러 값 가운데 무엇과 같은지 나눌 때는 `switch`도 사용할 수 있다.

```js
const signal = "노랑";

switch (signal) {
  case "빨강":
    console.log("멈춥니다.");
    break;
  case "노랑":
    console.log("주변을 살핍니다.");
    break;
  default:
    console.log("천천히 확인합니다.");
}
```

`break`는 맞는 갈래를 실행한 뒤 `switch` 밖으로 나가게 한다.
`break`를 빠뜨리면 다음 case의 코드까지 이어서 실행될 수 있다.
case 값은 엄격한 비교와 같은 방식으로 맞는지 확인하므로 숫자 `1`과 문자열 `"1"`은 같은 case가 아니다.

## 같은 일을 되풀이하기

같은 코드를 여러 번 실행하는 구조를 **반복문(loop)**이라고 한다.

반복 횟수를 세기 좋을 때는 `for`가 읽기 쉽다.

```js
for (let count = 1; count <= 3; count++) {
  console.log(count + "번째 종을 울립니다.");
}
```

어떤 조건이 참인 동안 계속할 때는 `while`이 잘 맞는다.

```js
let currentFloor = 1;
const destination = 4;

while (currentFloor < destination) {
  currentFloor = currentFloor + 1;
}

console.log(currentFloor); // 4
```

반복문에는 세 가지가 보여야 한다.

1. 어디에서 시작하는가
2. 언제까지 반복하는가
3. 한 번 돌 때 무엇이 바뀌는가

셋 중 하나가 빠지면 한 번도 실행되지 않거나 끝나지 않는 반복이 생길 수 있다.

## 요구사항을 네 칸으로 나누기

“1층에 있는 엘리베이터를 위쪽 요청층인 4층까지 올리고 도착 안내를 보여 준다”라는 말을 바로 코드로 쓰지 말고 네 부분으로 나눈다.
아래 예제는 위로 올라가는 경우만 다룬다.

| 구분 | 이 예에서의 내용 |
| --- | --- |
| 입력 | 현재 층보다 위에 있는 요청층 `4` |
| 상태 | 현재 층 `1` |
| 판단 | 현재 층이 요청한 층보다 낮은가? |
| 출력 | 도착한 층과 안내 문구 |

```js
const destination = 4;
let currentFloor = 1;

while (currentFloor < destination) {
  currentFloor = currentFloor + 1;
}

let message;

if (currentFloor === destination) {
  message = currentFloor + "층에 도착했습니다.";
} else {
  message = "요청한 층을 확인할 수 없습니다.";
}

console.log(message);
```

실행 결과는 다음과 같다.

```text
4층에 도착했습니다.
```

입력은 처음 들어온 값이다.
상태는 처리 중 기억하고 바뀔 수 있는 값이다.
판단은 어떤 길로 갈지 정한다.
출력은 처리 뒤 밖으로 보여 주거나 돌려줄 결과다.
이 네 칸은 JavaScript 문법이 강제하는 규칙이 아니라 요구사항을 놓치지 않게 돕는 생각 순서다.

## 핵심 정리

1. 값에는 타입이 있고, 타입에 따라 가능한 계산과 비교가 달라진다.
2. `const`와 `let`은 값에 이름을 붙이며, 바뀔 필요가 있는 이름만 `let`으로 둔다.
3. 조건문은 실행할 길을 고르고 반복문은 같은 흐름을 필요한 만큼 되풀이한다.
4. 요구사항은 입력·상태·판단·출력으로 나누면 코드의 순서가 보인다.

## 밤데브에서 연습할 포인트

밤데브에서는 짧은 요구사항에서 입력과 상태를 먼저 구분하고, 조건의 경계와 반복의 시작·종료·변화 지점을 코드로 연결한다.
구현 결과뿐 아니라 왜 `const`·`let`, 조건문, 반복문을 골랐는지도 함께 다룬다.

## 공식 자료

- [ECMAScript 2026 — ECMAScript Language Types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [ECMAScript 2026 — Statements and Declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026 — Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
