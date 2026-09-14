# 연산자: 계산·비교와 조건의 값

## 학습 목표

덧셈·엄격 비교·조건 판단에서 같은 값이 어떻게 다르게 처리되는지 설명할 수 있습니다.

## 한줄 요약

덧셈은 타입을, 엄격 비교는 타입과 값을, 조건은 truthy·falsy를 기준으로 결과를 만듭니다.

## 먼저 확인할 개념

[값과 타입](#/learn/javascript/wiki-values-types)과 [const·let과 재대입](#/learn/javascript/wiki-variables)을 먼저 확인해 보세요.

## 값을 계산하고 비교하는 연산자

값을 계산하거나 비교하는 기호를 **연산자(operator)**라고 한다.

```js
const total = 3 + 2;       // 5
const rest = 7 - 4;        // 3
const area = 3 * 4;        // 12
const half = 8 / 2;        // 4
const same = total === 5;  // true
```

`=`와 `===`는 역할이 다르다.

- `=`는 오른쪽 값을 왼쪽 이름이나 속성에 넣는다.
- `===`는 두 값의 타입과 값을 엄격하게 비교한다.

객체끼리 `===`로 비교할 때는 속성 내용이 닮았는지가 아니라 같은 객체인지를 본다.

`+`도 값의 타입에 따라 결과가 달라진다.

```js
console.log(2 + 1);     // 3
console.log("2" + 1);  // "21"
```

한쪽이 문자열이면 `+`는 글자를 이어 붙일 수 있다.
숫자 덧셈을 원한다면 입력이 실제 숫자인지 먼저 확인해야 한다.

### 논리 연산자와 truthy·falsy

조건을 이어 붙일 때 `&&`, `||`, `!` 같은 **논리 연산자(logical operator)**를 사용한다.

```js
const hasKey = true;
const doorOpen = false;

console.log(hasKey && doorOpen); // false
console.log(hasKey || doorOpen); // true
console.log(!doorOpen);          // true
```

`if` 같은 조건 자리에서는 값이 참처럼 취급되는지 거짓처럼 취급되는지를 확인한다.
참처럼 취급되는 값을 **truthy**, 거짓처럼 취급되는 값을 **falsy**라고 부른다.
이것은 새로운 타입이 아니라 불리언으로 바꾸어 판단한 결과다.

falsy인 값은 `false`, `0`, `-0`, `0n`, 빈 문자열 `""`, `null`, `undefined`, `NaN`이다.
그 밖의 일반 객체는 truthy다.
빈 배열 `[]`과 빈 객체 `{}`도 truthy다.

`&&`와 `||`는 언제나 불리언을 돌려주는 것도 아니다.
필요한 만큼만 계산한 뒤 피연산자 가운데 하나를 결과로 돌려준다.

```js
console.log("이름" || "손님"); // "이름"
console.log("" || "손님");     // "손님"
```

## 엄격 비교와 조건을 혼동하지 않기

`=`와 `===`는 하는 일이 다릅니다.

- `=`는 값을 대입합니다.
- `===`는 두 값을 비교하고 `true` 또는 `false`를 만듭니다.

`===`는 비교할 때 값의 타입을 자동으로 맞추지 않습니다.

```javascript
console.log(0 === false); // false
```

숫자 `0`과 참·거짓 값 `false`는 타입이 다르므로 결과는 `false`입니다.

`!==`는 `===`와 반대로 “두 값이 다른가?”를 확인합니다.
이 연산자도 비교할 때 타입을 자동으로 맞추지 않습니다.

```javascript
console.log(3 !== "3"); // true
```

숫자 3과 문자열 "3"은 타입이 다르므로 다르다는 비교 결과는 true입니다.

## 조건에 맞는 값의 개수 세기

`for...of`는 배열의 값을 하나씩 `value`에 넣습니다. 숫자 변수의 `+= 1`은 현재 값에 1을 더하고 다시 대입한다는 뜻입니다.

```js
const values = [0, "", [], {}];
let count = 0;

for (const value of values) {
  if (value) count += 1;
}
console.log(count);
```

`0`과 `""`은 falsy, 두 일반 객체는 truthy이므로 예상 결과는 `2`입니다. `0 === false`를 계산한 결과를 조건 변환과 혼동하지 마세요.

`0 && 10`은 왼쪽 값 `0`, `"이름" && 10`은 오른쪽 값 `10`을 돌려줍니다. `&&`는 왼쪽이 falsy면 오른쪽 계산을 생략하고, `||`는 왼쪽이 truthy면 오른쪽 계산을 생략합니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [조건문과 반복문의 실행 범위](#/learn/javascript/wiki-control-flow)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — ECMAScript Language Types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [ECMAScript 2026 — Statements and Declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026 — Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)

## 핵심 질문 답

먼저 어떤 연산을 하는지 구분합니다. `"2" + 1`은 문자열 연결로 `"21"`이 되지만 `0 === false`는 타입을 맞추지 않는 비교이므로 `false`입니다.
조건 자리의 truthy·falsy는 엄격 동등 비교와 다른 판단입니다. 빈 배열과 빈 객체도 truthy이며, `&&`와 `||`는 항상 불리언이 아니라 선택된 피연산자를 돌려줍니다.
