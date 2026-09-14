# 03 배열과 객체

## 학습 목표

여러 값의 순서와 한 대상의 이름 있는 정보를 JavaScript에서 어떻게 나누어 담는지 알아보자.

## 한줄 요약

순서대로 모아야 하면 배열을, 한 대상의 특징을 이름으로 구분해야 하면 객체를 먼저 생각한다.

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

## 배열을 차례대로 읽기

배열의 모든 값을 한 번씩 읽을 때 반복문을 사용한다.

```js
const temperatures = [17, 24, 20];

for (let index = 0; index < temperatures.length; index++) {
  console.log(temperatures[index]);
}
```

인덱스가 필요 없고 값만 차례로 읽는다면 `for...of`가 더 곧바로 읽힌다.

```js
for (const temperature of temperatures) {
  console.log(temperature);
}
```

여기에서 `temperature`에는 `17`, `24`, `20`이 차례로 들어간다.

`for...in`은 역할이 다르다.
이것은 객체에서 목록으로 꺼낼 수 있게 표시된 **열거 가능한(enumerable)** 문자열 속성 키를 순회한다.
배열에 사용하면 값이 아니라 `"0"`, `"1"`, `"2"` 같은 키를 받는다.
배열이 직접 가진 추가 속성뿐 아니라 다른 객체와의 연결을 따라 찾는 속성도 섞일 수 있는데,
이 연결은 05장의 프로토타입에서 설명한다.

```js
for (const key in temperatures) {
  console.log(key);
}
```

배열의 요소 값을 읽는 목적이라면 `for...of`를 먼저 선택한다.

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

### 점 표기법과 대괄호 표기법

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
참조 공유와 복사 범위는 다음 장에서 이어서 설명한다.

## 작은 흐름 하나로 연결하기

재료 목록에서 부족한 재료 이름만 새 배열로 만드는 흐름이다.

```js
const pantry = [
  { name: "토마토", count: 3 },
  { name: "우유", count: 0 },
  { name: "달걀", count: 6 },
];

const emptyNames = pantry
  .filter(ingredient => ingredient.count === 0)
  .map(ingredient => ingredient.name);

console.log(emptyNames.join(", "));
console.log(pantry.length);
```

실행 결과는 다음과 같다.

```text
우유
3
```

먼저 `filter`가 수량이 `0`인 객체들로 새 배열을 만든다.
다음 `map`이 그 객체의 이름만 꺼내 새 문자열 배열을 만든다.
원래 `pantry`의 길이는 바뀌지 않는다.

이 장에서는 `Map`과 `Set`을 다루지 않는다.
이름으로 빠르게 찾거나 중복을 관리할 자료구조를 고르는 기준은 알고리즘의 해시 챕터에서 다룬다.

## 핵심 정리

1. 여러 값의 순서가 중요하면 배열을 사용하고, 한 대상의 이름 있는 정보는 객체로 묶는다.
2. 배열은 `0`부터 시작하는 인덱스로 요소를 찾고 객체는 속성 키로 값을 찾는다.
3. `map`, `filter`, `find`는 필요한 결과 모양에 따라 구분한다.
4. 메서드를 고를 때 원본을 바꾸는지 새 바깥 배열을 만드는지도 함께 확인한다.

## 밤데브에서 연습할 포인트

밤데브에서는 주어진 데이터에서 배열과 객체의 역할을 나누고,
필요한 결과가 전체 변환·여러 항목 선택·한 항목 찾기 중 무엇인지에 따라 순회 방법을 고른다.
원본 배열과 안쪽 객체가 바뀌는지도 결과와 함께 추적한다.

## 공식 자료

- [ECMAScript 2026 — Array Objects](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array-objects)
- [ECMAScript 2026 — `for-in` and `for-of` Statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements)
- [ECMAScript 2026 — Object Initializer](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)
