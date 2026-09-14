# 배열과 객체로 정보 담기

## 학습 목표

순서로 찾을 값은 배열에, 이름으로 찾을 정보는 객체에 담고 원하는 값을 읽을 수 있습니다.

## 한줄 요약

배열은 인덱스로 순서 있는 요소를 찾고 객체는 속성 키로 한 대상의 정보를 찾습니다.

## 먼저 확인할 개념

[값과 타입](#/learn/javascript/wiki-values-types)과 [변수](#/learn/javascript/wiki-variables)를 먼저 확인해 보세요.

## 여러 값을 순서대로 담는 배열

아침, 점심, 저녁의 온도를 각각 다른 변수에 담으면 값이 늘어날수록 이름도 계속 늘어난다.

```js
const morning = 17;
const afternoon = 24;
const evening = 20;
```

여러 값을 순서대로 묶은 것을 **배열(array)**이라고 한다.
배열도 객체 타입에 속하지만, 순서 있는 모음을 표현한다는 선택 목적이 있다.

```js
const temperatures = [17, 24, 20];
```

배열 안의 각 값을 **요소(element)**라고 한다.
요소의 위치를 나타내는 번호를 **인덱스(index)**라고 하며 첫 번호는 `0`이다.

```js
console.log(temperatures[0]); // 17
console.log(temperatures[1]); // 24
console.log(temperatures[2]); // 20
```

배열의 `length` 속성은 배열의 길이를 나타낸다.

```js
console.log(temperatures.length); // 3
```

처음 배우는 빈칸 없는 배열에서는 `length`를 요소 수로 이해해도 흐름을 따라가기 쉽다.
다만 JavaScript 배열에는 중간이 빈 자리인 배열도 만들 수 있어서
`length`가 실제로 값이 들어 있는 자리 수와 언제나 같은 것은 아니다.

```js
const seats = [];
seats[2] = "예약";

console.log(seats.length); // 3
```

`0`번과 `1`번 자리는 비어 있지만 가장 높은 인덱스가 `2`라서 길이는 `3`이 된다.
처음에는 일부러 빈자리를 만드는 방식보다 값을 차례대로 담는 배열을 사용하는 편이 이해하기 쉽다.

## 한 대상의 정보를 이름으로 묶는 객체

부엌에 있는 재료 하나를 이름, 수량, 충분한지로 묶고 싶다고 하자.
값마다 의미가 다르므로 순서 번호보다 이름으로 찾는 편이 자연스럽다.

```js
const ingredient = {
  name: "토마토",
  count: 3,
  enough: true,
};
```

이처럼 이름과 값을 한 대상에 묶은 것을 **객체(object)**라고 한다.
`name`, `count`, `enough`처럼 객체 안의 값에 붙인 이름을 **속성 키(property key)**라고 하고,
그 이름과 값의 짝을 **속성(property)**이라고 한다.

## 점 표기법과 대괄호 표기법

코드에 속성 이름을 그대로 적을 수 있을 때는 **점 표기법(dot notation)**이 읽기 쉽다.

```js
console.log(ingredient.name);  // "토마토"
console.log(ingredient.count); // 3
```

실행 중에 속성 이름을 정해야 하면 **대괄호 표기법(bracket notation)**을 사용한다.

```js
const field = "count";
console.log(ingredient[field]); // 3
```

`ingredient.field`는 `field` 변수의 값인 `"count"`를 찾지 않는다.
글자 그대로 `field`라는 속성을 찾는다.
동적인 이름은 `ingredient[field]`처럼 대괄호 안에서 계산해야 한다.

JavaScript 객체의 속성 키는 문자열 또는 `Symbol`이다.
객체 리터럴에 숫자처럼 적은 키도 일반 속성 키가 될 때는 문자열로 바뀐다.

## 배열 안에 객체 담기

같은 종류의 대상이 여러 개 있고 순서도 중요하다면 객체들을 배열에 담을 수 있다.

```js
const pantry = [
  { name: "토마토", count: 3, enough: true },
  { name: "우유", count: 0, enough: false },
  { name: "달걀", count: 6, enough: true },
];
```

- `pantry`는 재료 여러 개의 순서를 담은 배열이다.
- 배열 요소 하나는 재료 한 개를 나타내는 객체다.
- 객체 속성은 그 재료의 이름 있는 상태다.

```js
console.log(pantry[1].name);   // "우유"
console.log(pantry[1].enough); // false
```

먼저 인덱스 `1`로 두 번째 객체를 찾고, 그 객체의 `name`과 `enough` 속성을 읽는다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [배열 순회: 값·키·요소 처리 방식 고르기](#/learn/javascript/wiki-iteration)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Array Objects](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array-objects)
- [ECMAScript 2026 — `for-in` and `for-of` Statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements)
- [ECMAScript 2026 — Object Initializer](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)

## 핵심 질문 답

온도 기록처럼 순서가 중요하면 배열을, 한 재료의 이름·수량처럼 역할이 다른 정보는 객체 속성으로 묶습니다. 여러 재료를 순서대로 관리하려면 객체들을 배열에 담습니다.
배열 인덱스는 0부터 시작하고, 빈자리가 있으면 `length`가 채워진 값의 개수와 다를 수 있습니다. 객체의 동적 속성 이름은 `item[field]`로 읽으며 `item.field`는 문자 그대로 field라는 속성을 찾습니다.
