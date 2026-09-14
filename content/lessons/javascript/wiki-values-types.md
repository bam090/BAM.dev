# 값과 타입 구분하기

## 학습 목표

값의 타입을 확인하고 원시값과 객체, 숫자와 숫자처럼 보이는 문자열을 구분할 수 있습니다.

## 한줄 요약

타입은 값의 종류이며 숫자처럼 보이는 글자도 문자열이고 null은 원시값입니다.

## 먼저 확인할 개념

[JavaScript와 실행](#/learn/javascript/javascript-and-runtime)에서 언어 규칙과 실행 환경을 먼저 구분해 보세요.

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
객체를 여러 이름이 함께 가리킬 때 어떤 변화가 공유되는지는 [같은 객체의 공유와 재대입](#/learn/javascript/wiki-object-sharing)에서 자세히 다룬다.

`null`은 원시값이다.
`typeof null`의 결과가 역사적인 이유로 `"object"`이지만, 이것을 보고 `null`이 객체라고 판단하면 안 된다.

## 겉모양과 타입을 함께 확인하기

아래 코드는 `console`이 제공되는 환경에서 실행합니다. 숫자처럼 보이는 글자와 숫자를 따로 관찰해 보세요.

```js
console.log(typeof "3", typeof 3);
console.log(typeof NaN, typeof null);
```

첫 줄의 예상 결과는 `"string", "number"`, 둘째 줄은 `"number", "object"`입니다. 둘째 결과만으로 `NaN`을 정상 계산 결과, `null`을 객체로 분류하면 안 됩니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [const·let과 재대입](#/learn/javascript/wiki-variables)을 살펴보세요.

## 공식 자료

- [MDN — typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [ECMAScript 2026 — ECMAScript Language Types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [ECMAScript 2026 — Statements and Declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026 — Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)

## 핵심 질문 답

값의 겉모양 대신 타입과 실제 연산 결과를 확인합니다. `"3"`은 문자열이고 `3`은 숫자입니다. 객체를 제외한 일곱 타입은 원시값이며 `null`도 여기에 속합니다.
`typeof`는 타입을 살피는 도구지만 `typeof null`이 `"object"`인 예외가 있습니다. `NaN` 역시 숫자 타입의 특별한 값이므로 `"number"`라는 결과만으로 유효한 숫자라고 결론 내리지 않습니다.
