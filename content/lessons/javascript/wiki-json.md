# JSON 변환과 데이터 검증

## 학습 목표

JavaScript 값과 JSON 문자열을 변환하고 파싱 뒤 필드·타입을 확인해 사용할 수 있는 데이터를 고를 수 있습니다.

## 한줄 요약

JSON은 일부 값을 표현하는 문자열 형식이며 문법이 맞아도 프로그램이 요구하는 데이터 모양은 따로 검사해야 합니다.

## 먼저 확인할 개념

[값과 타입](#/learn/javascript/wiki-values-types) · [배열과 객체](#/learn/javascript/wiki-arrays-objects) · [예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)을 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## JSON은 객체가 아니라 문자열 형식이다

JSON(JavaScript Object Notation)은 `값을 글자로 표현하는 형식`이다.
이름에 JavaScript가 들어 있지만 특정 언어의 살아 있는 객체가 아니다.

JSON은 문자열, 숫자, `true`, `false`, `null`, 배열, 문자열 이름을 가진 객체를 표현한다.
함수, `undefined`, 고유한 식별값을 만드는 Symbol, 큰 정수용 BigInt를 일반 JSON 값으로 그대로 표현할 수 없고,
`NaN`과 `Infinity`도 JSON 숫자가 아니다.

```js
const learningCard = {
  id: 1,
  topic: "javascript",
  title: "함수",
  note: null,
};

const text = JSON.stringify(learningCard);

console.log(text);
// {"id":1,"topic":"javascript","title":"함수","note":null}
```

`JSON.stringify()`는 JavaScript 값을 JSON 문자열로 바꾼다.
직렬화(serialization), 곧 `메모리의 값을 저장하거나 전송할 수 있는 표현으로 바꾸는 일`이라고도 한다.

```js
const restored = JSON.parse(text);

console.log(restored.title); // "함수"
```

`JSON.parse()`는 JSON 문자열을 JavaScript 값으로 바꾼다.
문자열이 JSON 문법에 맞지 않으면 `SyntaxError`를 던진다.

## `JSON.stringify()`에서 사라지거나 바뀌는 값이 있다

```js
const sample = {
  missing: undefined,
  notANumber: NaN,
  greet() {},
};

console.log(JSON.stringify(sample));          // {"notANumber":null}
console.log(JSON.stringify([undefined, NaN])); // [null,null]
console.log(JSON.stringify(undefined));        // undefined
```

객체 프로퍼티의 `undefined`, 함수, Symbol은 빠지고 배열의 같은 값은 `null`이 된다.
`NaN`과 `Infinity`도 `null`이 된다.
최상위 `undefined`, 함수, Symbol은 JSON 문자열 대신 JavaScript의 `undefined`를 반환한다.
BigInt와 자기 자신을 다시 가리키는 순환 참조는 기본 직렬화에서 `TypeError`를 일으킨다.

메서드와 prototype 관계도 원래 모습 그대로 되살아나지 않는다.
매우 큰 정수는 Number의 정확한 범위를 넘어 자릿수를 잃을 수 있다.
따라서 JSON 왕복을 모든 값에 쓸 수 있는 깊은 복사 방법으로 사용하지 않는다.

## JSON 문법이 맞아도 데이터가 쓸 수 있는 것은 아니다

`{"title":42}`는 올바른 JSON이다.
그러나 화면이 `title`을 문자열로 요구한다면 사용할 수 없다.
파싱은 문법만 확인하므로 필요한 필드와 타입은 따로 검증한다.

```js
function isLearningCard(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger(value.id) &&
    typeof value.topic === "string" &&
    typeof value.title === "string"
  );
}

function isLearningCardList(value) {
  return Array.isArray(value) && value.every(isLearningCard);
}

```

`typeof null`도 `"object"`이므로 객체 형태를 확인할 때 `value !== null`을 함께 검사한다.
서버와 저장소에서 읽은 값은 내 프로그램 밖에서 들어온 값이므로 믿고 사용하기 전에 필요한 모양을 확인한다.

## 이어서 연습하기

[Web Storage의 저장과 복원](#/learn/javascript/wiki-web-storage)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)
- [WHATWG HTML Standard — Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

## 핵심 질문 답

stringify는 값을 JSON 문자열로, parse는 JSON 문자열을 값으로 바꿉니다. 객체의 undefined·함수·Symbol 값은 빠지고 배열에서는 null이 되며 NaN·Infinity도 null이 됩니다. 기본 처리의 BigInt와 순환 참조는 실패하고 메서드·prototype도 그대로 복원되지 않으므로 보편적인 깊은 복사가 아닙니다. 파싱 뒤에는 필요한 객체·배열 형태와 필드의 타입을 검사합니다.
