# 결과 모양으로 배열 메서드 고르기

## 학습 목표

필요한 결과가 전체 변환·여러 선택·하나 찾기인지 정하고 배열 메서드와 처리 순서를 선택할 수 있습니다.

## 한줄 요약

map은 변환한 배열, filter는 선택한 배열, find는 첫 요소나 undefined를 반환합니다.

## 먼저 확인할 개념

[배열과 객체](#/learn/javascript/wiki-arrays-objects)과 [함수 값과 동기 콜백](#/learn/javascript/wiki-callbacks)을 먼저 확인해 보세요.

## 예제에서 사용할 자료

다음 객체 배열을 먼저 준비한 뒤 이 문서의 메서드 예제를 실행합니다.

```js
const pantry = [
  { name: "토마토", count: 3, enough: true },
  { name: "우유", count: 0, enough: false },
  { name: "달걀", count: 6, enough: true },
];
```

## `map`, `filter`, `find`는 목적이 다르다

배열을 처리할 때는 원하는 결과의 모양부터 정한다.

### 모든 요소를 다른 모습으로 바꾸는 `map`

`map`은 각 요소를 콜백 함수로 바꾸어 새 배열을 만든다.

```js
const names = pantry.map(ingredient => ingredient.name);

console.log(names); // ["토마토", "우유", "달걀"]
```

객체 배열에서 이름만 필요했기 때문에 결과는 문자열 배열이 된다.
원래 `pantry` 배열은 그대로 남는다.

### 조건에 맞는 요소들을 고르는 `filter`

`filter`는 콜백 결과가 truthy인 요소들만 모아 새 배열을 만든다.

```js
const emptyIngredients = pantry.filter(ingredient => !ingredient.enough);

console.log(emptyIngredients.length); // 1
```

일치하는 요소가 없으면 빈 배열을 돌려준다.
여러 개를 고르는 메서드이므로 결과는 언제나 배열이다.

### 처음 맞는 요소 하나를 찾는 `find`

`find`는 조건에 처음 맞는 요소 하나를 돌려준다.

```js
const firstEmpty = pantry.find(ingredient => !ingredient.enough);

console.log(firstEmpty.name); // "우유"
```

맞는 요소가 없으면 `undefined`를 돌려준다.
따라서 결과가 없을 수 있는 상황에서는 속성을 읽기 전에 확인해야 한다.

```js
const missing = pantry.find(ingredient => ingredient.name === "소금");

if (missing === undefined) {
  console.log("소금을 찾지 못했습니다.");
}
```

세 메서드를 결과 기준으로 비교하면 다음과 같다.

| 필요한 결과 | 메서드 | 결과 |
| --- | --- | --- |
| 모든 요소를 바꾼 목록 | `map` | 새 배열 |
| 조건에 맞는 여러 요소 | `filter` | 새 배열 |
| 처음 맞는 요소 하나 | `find` | 요소 하나 또는 `undefined` |

## 원본을 바꾸는 동작과 새 값을 만드는 동작

배열 메서드가 모두 같은 방식으로 움직이지는 않는다.

```js
const colors = ["남색", "회색"];

colors.push("하양");
console.log(colors); // ["남색", "회색", "하양"]
```

`push`는 원래 배열에 요소를 추가한다.
이런 동작을 **변경(mutation)**이라고 한다.

```js
const colors = ["남색", "회색"];
const labels = colors.map(color => `색상: ${color}`);

console.log(colors); // ["남색", "회색"]
console.log(labels); // ["색상: 남색", "색상: 회색"]
```

`map`은 새 바깥 배열을 만든다.
`filter`, `slice`, `toSorted`도 새 배열을 만드는 쪽이고,
`push`, `pop`, `splice`, `sort`, `reverse`는 원본 배열을 바꾸는 쪽이다.

다만 새 배열이 생겼다고 해서 안쪽 객체까지 새로 복사된 것은 아니다.

```js
const sameIngredients = pantry.filter(ingredient => ingredient.enough);

console.log(sameIngredients[0] === pantry[0]); // true
```

두 배열은 다르지만 그 안의 첫 객체는 같은 객체다.
참조 공유와 복사 범위는 [얕은 복사](#/learn/javascript/wiki-shallow-copy)에서 이어서 설명한다.

## 선택에 필요한 정보를 먼저 보존하기

```js
const emptyNames = pantry
  .filter(ingredient => ingredient.count === 0)
  .map(ingredient => ingredient.name);
console.log(emptyNames);
```

예상 결과는 `["우유"]`입니다. 먼저 이름만 남기면 `count`로 검사할 재료 객체를 잃으므로 수량 검사부터 합니다. `map`·`filter` 자체는 원본을 바꾸지 않지만 콜백 안에 직접 변경을 넣으면 그 코드는 실행됩니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [같은 객체의 공유와 재대입](#/learn/javascript/wiki-object-sharing)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Array Objects](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array-objects)
- [ECMAScript 2026 — `for-in` and `for-of` Statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements)
- [ECMAScript 2026 — Object Initializer](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)

## 핵심 질문 답

모든 요소를 다른 모습으로 바꾸면 `map`, 조건에 맞는 여러 요소를 고르면 `filter`, 첫 요소 하나를 찾으면 `find`를 사용합니다. 일치가 없을 때 `filter`는 빈 배열, `find`는 `undefined`를 반환합니다.
수량으로 고른 뒤 이름만 남기려면 객체의 수량 정보가 있을 때 `filter`하고 그다음 `map`합니다. 새 배열을 만드는 메서드라도 콜백이 원본이나 공유 객체를 바꾸는지는 따로 확인합니다.
