# 함수 값과 동기 콜백

## 학습 목표

함수 자체를 전달하는 것과 함수를 호출한 결과를 전달하는 것을 구분할 수 있습니다.

## 한줄 요약

콜백은 받은 쪽이 호출하는 함수이며 전달했다고 바로 실행되거나 반드시 비동기가 되는 것은 아닙니다.

## 먼저 확인할 개념

[함수의 입력과 반환](#/learn/javascript/wiki-function-return)에서 호출과 반환을 먼저 확인해 보세요.

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

## 함수와 호출 결과를 바꾸어 전달하지 않기

```js
function apply(value, change) {
  return change(value);
}
function addOne(value) {
  return value + 1;
}

console.log(apply(4, addOne));
```

`addOne`은 함수 값이라서 `change(4)`로 호출할 수 있습니다. `addOne(4)`를 대신 전달하면 숫자 `5`가 들어가므로 받은 쪽의 `change(value)`에서 숫자를 함수처럼 호출하려다 오류가 납니다.

콜백을 호출할지는 받은 쪽의 조건에 달려 있습니다. 입력을 검사한 뒤 조기 반환하면 그 뒤의 콜백 호출은 실행되지 않습니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [계산과 부수 효과의 경계](#/learn/javascript/wiki-function-effects)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-function-definitions)
- [ECMAScript 2026 — Return Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-return-statement)
- [ECMAScript 2026 — ECMAScript Function Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects)

## 핵심 질문 답

`change`를 인수로 쓰면 함수 값을 전달하고 `change(3)`을 쓰면 먼저 실행한 결과를 전달합니다. 받은 쪽이 괄호를 붙여 호출해야 함수 본문이 실행됩니다.
콜백이 현재 함수 호출 안에서 바로 두 번 실행된다면 그 반환값도 순서대로 연결됩니다. 콜백이라는 이름만으로 타이머나 비동기 처리가 생기는 것은 아닙니다.
