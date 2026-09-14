# 같은 객체의 공유와 재대입

## 학습 목표

같은 객체를 공유하는 이름을 찾고 속성 변경과 변수 재대입이 전달되는 범위를 구분할 수 있습니다.

## 한줄 요약

객체 대입은 같은 객체를 공유할 수 있지만 한 변수나 매개변수의 재대입이 다른 이름까지 바꾸지는 않습니다.

## 먼저 확인할 개념

[const·let과 재대입](#/learn/javascript/wiki-variables)과 [배열과 객체](#/learn/javascript/wiki-arrays-objects)를 먼저 확인해 보세요.

## 원시값을 다른 변수에 대입할 때

숫자나 문자열 같은 **원시값(primitive value)**을 다른 변수에 대입하면 그 시점의 값이 새 변수에도 들어간다.

```js
let first = 3;
let second = first;

second = 8;

console.log(first);  // 3
console.log(second); // 8
```

`second`에 `8`을 다시 대입해도 `first`는 그대로 `3`이다.
두 변수는 서로 다른 이름이고, 한 변수의 재대입이 다른 변수를 다시 대입하지는 않는다.

문자열도 같다.

```js
let firstName = "은하";
let secondName = firstName;

secondName = "여울";

console.log(firstName);  // "은하"
console.log(secondName); // "여울"
```

원시값은 값 안쪽을 직접 고치는 대상이 아니다.
변수에 다른 값을 다시 대입할 뿐이다.

## 객체를 대입하면 같은 객체를 공유할 수 있다

객체를 다른 변수에 대입한다고 해서 속성을 하나씩 복사한 새 객체가 생기지는 않는다.

```js
const firstLamp = {
  color: "노랑",
  on: false,
};

const secondLamp = firstLamp;

secondLamp.on = true;

console.log(firstLamp.on);  // true
console.log(secondLamp.on); // true
```

`firstLamp`와 `secondLamp`는 서로 다른 변수 이름이지만 같은 객체를 사용한다.
같은 대상을 함께 가리키는 이 관계를 **참조 공유(reference sharing)**라고 부른다.

하나의 수납함에 이름표 두 개를 붙였다고 생각하면 첫 모습을 이해하기 쉽다.
어느 이름표를 따라가도 같은 수납함을 연다.
다만 JavaScript가 실제로 수납함이나 사람이 읽을 수 있는 주소를 저장한다는 뜻은 아니다.
정확히는 두 **바인딩(binding)**, 즉 변수 이름과 값의 연결이 같은 객체 값을 공유한다.

객체가 같은지 확인할 때 `===`는 속성 내용이 아니라 **객체 정체성(identity)**을 비교한다.
객체 정체성은 “바로 그 객체인가”를 구분하는 성질이다.

```js
const left = { on: false };
const right = { on: false };
const same = left;

console.log(left === right); // false
console.log(left === same);  // true
```

`left`와 `right`는 내용이 같아 보여도 따로 만든 객체다.
`same`만 `left`와 같은 객체를 공유한다.

입문 자료에서 “변수에 객체의 참조값이 들어간다”라고 줄여 말하기도 한다.
그러나 ECMAScript의 언어 타입에 별도의 `Reference` 타입이 있는 것은 아니다.
객체는 `Object` 타입의 값이며, 이 장에서 “참조”라는 말은 같은 객체 정체성을 공유하는 관계를 설명한다.

## 재대입과 객체 변경은 다르다

다음 두 동작을 구분해야 한다.

```js
let lamp = { on: false };

lamp.on = true;        // 같은 객체의 속성을 바꾼다.
lamp = { on: false };  // 변수에 다른 객체를 다시 대입한다.
```

첫 줄은 원래 객체를 변경한다.
둘째 줄은 새 객체를 만들고 `lamp`가 그 객체를 기억하게 한다.

`const`는 재대입을 막지만 객체 속성 변경을 막지는 않는다.

```js
const lamp = { on: false };

lamp.on = true;          // 가능하다.
// lamp = { on: true };  // 재대입이므로 오류가 난다.
```

## 매개변수에 다른 객체를 다시 넣으면

```js
function replaceLamp(lamp) {
  lamp = { on: true };
  return lamp;
}
const original = { on: false };
const result = replaceLamp(original);
console.log(original.on, result.on, original === result);
```

예상 결과는 `false, true, false`입니다. 함수 안의 이름 `lamp`를 새 객체와 연결했을 뿐 호출자의 `original` 이름은 바뀌지 않았습니다. 이와 달리 `lamp.on = true`로 원래 객체의 속성을 바꾸면 밖에서도 보입니다.

객체도 값으로 전달됩니다. 이를 단순히 “함수 안에서 바꾸면 밖의 변수도 모두 바뀐다”라고 외우지 말고, 속성을 바꿨는지 이름을 재대입했는지 구분하세요.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [얕은 복사와 바꿀 경로](#/learn/javascript/wiki-shallow-copy)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Language Types and Reference Records](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 — Array and Object Initializers](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-array-initializer)
- [ECMAScript 2026 — CopyDataProperties](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-copydataproperties)

## 핵심 질문 답

두 이름이 같은 객체를 사용하면 어느 이름으로 속성을 바꿔도 같은 객체의 변경을 봅니다. 객체끼리 `===`는 속성 내용 대신 같은 객체인지 비교합니다.
변수에 새 값을 재대입하는 것은 그 이름의 연결만 바꿉니다. 함수 매개변수에 새 객체를 재대입해도 호출자의 변수가 재대입되지는 않지만, 공유하던 객체의 속성을 바꾸면 호출자에게 보입니다.
