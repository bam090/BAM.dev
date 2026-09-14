# 함수의 입력과 반환

## 학습 목표

인수가 매개변수로 들어가고 반환값이 호출한 자리에 돌아오는 과정과 종료 지점을 추적할 수 있습니다.

## 한줄 요약

return은 호출자에게 값을 돌려주고 함수를 끝내며, 콘솔 출력과 지역 변수 계산은 반환을 대신하지 않습니다.

## 먼저 확인할 개념

[const·let과 재대입](#/learn/javascript/wiki-variables)과 [조건과 반복](#/learn/javascript/wiki-control-flow)을 먼저 확인해 보세요.

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
객체 메서드와 `this`의 기본 관계는 [객체 모델](#/learn/javascript/wiki-object-model)에서 이어서 다룬다.

## 조기 반환 뒤의 호출도 실행되지 않는다

아래 `minutes`는 숫자이고 `format`에는 함수를 건넵니다. 콜백의 의미는 다음 문서에서 이어서 다룹니다.

```js
let calls = 0;
function describe(minutes, format) {
  if (minutes < 0) return "입력 확인";
  return format(minutes);
}
function format(minutes) {
  calls += 1;
  return `${minutes}분`;
}
const result = describe(-1, format);
console.log(result, calls);
```

예상 결과는 `"입력 확인", 0`입니다. 반환 이후 줄이 생략되므로 `format`도 호출되지 않았습니다. 같은 이름의 지역 변수에 값을 담는 것과 바깥 호출자에게 반환하는 것을 구분하세요.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [함수 값과 동기 콜백](#/learn/javascript/wiki-callbacks)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-function-definitions)
- [ECMAScript 2026 — Return Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-return-statement)
- [ECMAScript 2026 — ECMAScript Function Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects)

## 핵심 질문 답

인수는 호출할 때 건네는 값이고 매개변수는 함수 안에서 그 값을 사용할 이름입니다. `return`을 실행하면 그 값이 호출한 자리로 돌아가며 현재 함수가 끝납니다. 뒤의 콜백이나 상태 변경도 실행되지 않습니다.
출력만 하거나 지역 변수만 계산하고 끝나면 반환값은 `undefined`입니다. 화살표 함수는 표현식 본문을 자동 반환하지만 중괄호 본문에서는 `return`을 직접 써야 합니다.
