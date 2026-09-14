# const·let과 재대입

## 학습 목표

이름의 재대입과 객체 속성 변경을 구분해 const와 let을 선택할 수 있습니다.

## 한줄 요약

const는 이름의 재대입을 막고 let은 허용하며, 객체 속성 변경은 별도로 판단합니다.

## 먼저 확인할 개념

[값과 타입 구분하기](#/learn/javascript/wiki-values-types)에서 값과 객체를 먼저 확인해 보세요.

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

## 바뀌는 대상을 먼저 정하기

```js
let count = 0;
const lamp = { on: false };

count = count + 1;
lamp.on = true;
```

`count`는 새로운 숫자를 기억하므로 `let`입니다. `lamp`는 같은 객체를 계속 사용하므로 `const`를 유지해도 됩니다. 속성이 바뀐다는 이유만으로 이름을 모두 `let`으로 바꾸지는 않습니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [연산자: 계산·비교와 조건의 값](#/learn/javascript/wiki-operators)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — ECMAScript Language Types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [ECMAScript 2026 — Statements and Declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026 — Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)

## 핵심 질문 답

`count = 2`처럼 이름이 기억할 값을 바꾸는 것은 재대입입니다. 이 변화가 필요하면 `let`, 필요하지 않으면 `const`를 사용합니다.
`lamp.on = true`는 같은 객체의 속성을 바꾸므로 `const lamp`에서도 가능합니다. `lamp = { on: true }`는 이름에 다른 객체를 다시 넣는 동작이므로 `const`에서는 허용되지 않습니다.
