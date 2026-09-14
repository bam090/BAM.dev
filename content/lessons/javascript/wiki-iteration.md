# 배열 순회: 값·키·요소 처리 방식 고르기

## 학습 목표

배열의 값·속성 키·각 요소 처리라는 목적에 맞게 반복 방법을 고를 수 있습니다.

## 한줄 요약

for...of는 값을, for...in은 열거 가능한 문자열 키를 순회하고 forEach는 각 요소를 처리한 뒤 undefined를 반환합니다.

## 먼저 확인할 개념

[배열과 객체](#/learn/javascript/wiki-arrays-objects)과 [함수 값과 동기 콜백](#/learn/javascript/wiki-callbacks)을 먼저 확인해 보세요.

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
이 연결은 [프로토타입 문서](#/learn/javascript/wiki-object-model)에서 설명한다.

```js
for (const key in temperatures) {
  console.log(key);
}
```

배열의 요소 값을 읽는 목적이라면 `for...of`를 먼저 선택한다.

## forEach의 반환값과 콜백 결과는 다르다

`forEach()`는 새 배열을 반환하지 않습니다.
다음 코드에서 `result`는 `undefined`지만 콜백은 두 번 실행됩니다.

```javascript
const labels = [];
const result = [2, 4].forEach((number) => {
  labels.push(`${number}점`);
});

console.log(result, labels); // undefined, ["2점", "4점"]
```

위 코드에서 `labels`는 콜백이 직접 바꾼 배열입니다. 콜백에서 `return`을 쓰더라도 `forEach`가 그 값들을 새 배열로 모아 반환하지는 않습니다. 모든 변환 결과를 모으려면 다음 문서의 `map`을 사용합니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [결과 모양으로 배열 메서드 고르기](#/learn/javascript/wiki-array-methods)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Array Objects](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array-objects)
- [ECMAScript 2026 — `for-in` and `for-of` Statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-for-in-and-for-of-statements)
- [ECMAScript 2026 — Object Initializer](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)

## 핵심 질문 답

배열 요소 값이 필요하면 `for...of`, 직접 인덱스를 제어하려면 일반 `for`를 선택합니다. `for...in`은 값 대신 열거 가능한 문자열 키를 받으며 추가·상속 속성이 섞일 수 있습니다.
`forEach`는 콜백을 각 요소에 실행하지만 자체 반환값은 `undefined`입니다. 콜백의 `push`로 바깥 배열이 달라지는 것과 `forEach`가 새 배열을 반환하는 것은 다른 일입니다.
