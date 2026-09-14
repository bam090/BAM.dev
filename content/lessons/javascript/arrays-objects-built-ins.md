# 04. 배열·객체·표준 내장 객체

## 학습 목표

- 배열과 객체를 언제 사용하는지 구분할 수 있습니다.
- 배열 메서드의 입력, 반환값, 원본 변경 여부를 확인하며 사용할 수 있습니다.
- 객체의 속성을 점 표기법과 대괄호 표기법으로 읽고 바꿀 수 있습니다.
- `String`, `Number`, `Math`, `Date`, `JSON` 같은 표준 내장 객체의 역할을 이해합니다.

## 왜 필요한가

사용자 한 명은 이름과 로그인 상태처럼 관련된 값을 묶어야 합니다.
사용자 목록은 이런 묶음을 여러 개 순서대로 저장해야 합니다.
실제 데이터는 주로 **객체 한 개**와 **객체가 들어 있는 배열**을 조합해 표현합니다.

## 배열

**배열**은 여러 값을 순서대로 저장하는 자료 구조입니다.
각 값의 위치인 **인덱스**는 `0`부터 시작합니다.

```javascript
const fruits = ["사과", "바나나", "오렌지"];

console.log(fruits[0]);     // "사과"
console.log(fruits.length); // 3

fruits.push("포도");
```

`length`는 배열에 든 값의 개수입니다.
함수가 아니므로 괄호를 붙이지 않습니다.
`push()`는 배열 끝에 값을 추가하고 원본 배열을 바꿉니다.

### 자주 사용하는 배열 메서드

**메서드**는 값과 함께 제공되는 함수입니다.
배열 메서드에는 각 요소를 처리할 **콜백 함수**, 즉 나중에 호출하도록 전달하는 함수를 자주 넘깁니다.

| 메서드 | 하는 일 | 반환값 | 메서드 자체가 원본을 바꾸나? |
| --- | --- | --- | --- |
| `forEach()` | 각 요소로 함수 실행 | `undefined` | 아니요 |
| `map()` | 각 요소를 다른 값으로 변환 | 새 배열 | 아니요 |
| `filter()` | 조건에 맞는 요소만 선택 | 새 배열 | 아니요 |
| `find()` | 조건에 맞는 첫 요소 찾기 | 요소 또는 `undefined` | 아니요 |
| `push()` | 끝에 요소 추가 | 변경된 길이 | 예 |
| `sort()` | 요소 순서 정렬 | 같은 배열 | 예 |

`forEach()`, `map()`, `filter()`, `find()` 자체는 원본을 바꾸지 않습니다.
다만 콜백 안에서 원본을 직접 바꾸는 코드를 작성하는 것은 별개의 동작입니다.

```javascript
const scores = [60, 85, 90];

const passed = scores.filter((score) => score >= 80);
const labels = scores.map((score) => `${score}점`);
const firstPerfect = scores.find((score) => score === 100);

console.log(passed);       // [85, 90]
console.log(labels);       // ["60점", "85점", "90점"]
console.log(firstPerfect); // undefined
```

`forEach()`는 새 배열을 반환하지 않습니다.
다음 코드에서 `result`는 `undefined`지만 콜백은 두 번 실행됩니다.

```javascript
const labels = [];
const result = [2, 4].forEach((number) => {
  labels.push(`${number}점`);
});

console.log(result, labels); // undefined, ["2점", "4점"]
```

숫자를 오름차순으로 정렬할 때는 비교 함수를 전달합니다.
`left - right`가 음수이면 `left`를 먼저 두므로 작은 수부터 정렬됩니다.
`sort()`는 원본도 바꾼다는 점을 기억합니다.

```javascript
const numbers = [10, 2, 30];
numbers.sort((left, right) => left - right);

console.log(numbers); // [2, 10, 30]
```

## 객체

**객체**는 서로 관련된 값을 `속성 이름: 값` 형태로 묶습니다.

```javascript
const user = {
  nickname: "bam",
  level: 2,
  key: "문자 그대로 key",
};

console.log(user.nickname);   // "bam"
console.log(user["nickname"]); // "bam"
```

- 점 표기법 `user.nickname`은 코드에 적힌 속성 이름을 그대로 사용합니다.
- 대괄호 표기법 `user[propertyName]`은 변수에 든 문자열을 속성 이름으로 사용할 수 있습니다.

```javascript
const propertyName = "nickname";

console.log(user.key);           // "문자 그대로 key"
console.log(user[propertyName]); // "bam"
```

## 참조와 얕은 복사

객체를 다른 변수에 대입하면 두 변수가 같은 객체를 가리킬 수 있습니다.

```javascript
const original = { name: "bam" };
const sameObject = original;

sameObject.name = "night";
console.log(original.name); // "night"
```

스프레드 문법 `{ ...original }`로 바깥 객체를 새로 만들 수 있지만, 안에 또 객체가 있으면 그 중첩 객체는 공유될 수 있습니다.
이를 **얕은 복사**라고 합니다.

```javascript
const first = { profile: { name: "bam" } };
const second = { ...first };

second.profile.name = "night";
console.log(first.profile.name); // "night"
```

## 표준 내장 객체

JavaScript는 자주 하는 작업을 위한 기본 도구를 제공합니다.

| 도구 | 역할 | 예 |
| --- | --- | --- |
| `String` | 값을 문자열로 변환하고 문자열 처리 | `String(42)`, `" hi ".trim()` |
| `Number` | 값을 숫자로 변환하고 숫자 확인 | `Number("42")`, `Number.isNaN(value)` |
| `Math` | 반올림, 최댓값 같은 수학 계산 | `Math.floor(3.9)`, `Math.max(3, 8)` |
| `Date` | 날짜와 시간을 표현 | `new Date()` |
| `JSON` | JavaScript 값과 JSON 문자열을 변환 | `JSON.stringify()`, `JSON.parse()` |

`new Date()`의 `new`는 새로운 날짜 객체를 만든다는 뜻입니다.

#### JSON

JSON은 데이터를 주고받을 때 쓰는 **문자열 형식**입니다.
JavaScript 객체와 모양이 비슷해도 같은 값은 아닙니다.

```javascript
const userData = { id: 1, nickname: "bam" };

const jsonText = JSON.stringify(userData);
const parsedUser = JSON.parse(jsonText);

console.log(typeof jsonText);   // "string"
console.log(parsedUser.nickname); // "bam"
```

> **나중에 참고 — 첫 학습에서는 건너뛰어도 됩니다.**
> `JSON.stringify()`에는 JSON으로 표현 가능한 JavaScript 값을 전달해야 합니다.
> 자기 자신을 다시 가리키는 순환 참조나 끝에 `n`을 붙여 표현하는 큰 정수 값 `BigInt`는 별도 변환하지 않으면 `TypeError`가 발생합니다.

```javascript
const circularData = {};
circularData.self = circularData;

JSON.stringify(circularData); // TypeError
```

`BigInt`의 오류도 별도로 실행해 확인할 수 있습니다.

```javascript
JSON.stringify({ count: 1n }); // TypeError
```

## 실행 흐름

```javascript
const posts = [
  { id: 1, title: "HTML", published: true },
  { id: 2, title: "CSS", published: false },
  { id: 3, title: "JavaScript", published: true },
];

const publishedTitles = posts
  .filter((post) => post.published)
  .map((post) => post.title);

console.log(publishedTitles); // ["HTML", "JavaScript"]
```

1. `filter()`가 `published`가 참인 객체만 새 배열에 담습니다.
2. `map()`이 남은 객체에서 `title`만 꺼내 새 배열을 만듭니다.
3. 원본 `posts` 배열은 바뀌지 않습니다.

## 최소 코드

```javascript
const products = [
  { name: "키보드", price: 30000 },
  { name: "마우스", price: 15000 },
];

const names = products.map((product) => product.name);
console.log(names); // ["키보드", "마우스"]
```

## 흔한 실수

### 1. `map()`에서 값을 반환하지 않기

중괄호가 있는 콜백에서 새 값을 만들려면 `return`이 필요합니다.

```javascript
const wrong = [1, 2].map((number) => {
  number * 2; // return이 없어 [undefined, undefined]
});
```

### 2. `forEach()`가 새 배열을 반환한다고 생각하기

`forEach()`의 반환값은 `undefined`입니다.
변환된 새 배열이 필요하면 `map()`을 사용합니다.

### 3. `sort()`가 원본을 유지한다고 생각하기

`sort()`는 원본 배열을 바꿉니다.
원본을 남겨야 한다면 먼저 배열을 복사한 뒤 정렬합니다.

### 4. JSON 문자열과 객체를 같다고 생각하기

`'{"name":"bam"}'`은 문자열이고, `{ name: "bam" }`은 객체입니다.

## 확인 포인트

1. 순서 있는 여러 값은 배열, 이름으로 구분할 값은 객체로 표현했나요?
2. 사용한 배열 메서드의 반환값과 원본 변경 여부를 확인했나요?
3. 변수에 든 속성 이름은 대괄호 표기법으로 읽었나요?
4. JSON을 사용할 때 문자열과 JavaScript 값을 구분했나요?

## 확인 문제

1. 사용자 한 명과 사용자 여러 명을 각각 객체와 배열로 표현해 보세요.
2. `map()`, `filter()`, `forEach()`의 반환값은 어떻게 다른가요?
3. `user.key`와 `user[propertyName]`이 서로 다른 속성을 읽을 수 있는 이유는 무엇인가요?
4. 얕은 복사에서 중첩 객체가 공유될 수 있다는 말은 무엇을 뜻하나요?
5. `JSON.stringify()`와 `JSON.parse()`는 각각 어느 방향으로 변환하나요?

## 공식 자료

- [MDN: 인덱스 기반 컬렉션](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
- [MDN: 객체 다루기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN: 표준 내장 객체](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)
- [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

공식 자료 확인일: 2026-08-18

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

사용자 한 명은 이름이나 로그인 상태처럼 속성 이름으로 구분하는 객체로 표현합니다.
사용자 여러 명은 이런 사용자 객체를 순서대로 담은 배열로 표현합니다.

### 답변 2

`map()`은 각 요소를 변환한 새 배열을 반환하고, `filter()`는 조건을 통과한 요소만 담은 새 배열을 반환합니다.
`forEach()`는 각 요소에 함수를 실행하지만 반환값은 `undefined`입니다.

### 답변 3

점 표기법의 `user.key`는 문자 그대로 `key`라는 속성을 읽습니다.
대괄호 표기법의 `user[propertyName]`은 변수 `propertyName`에 들어 있는 문자열을 속성 이름으로 사용합니다.

### 답변 4

얕은 복사는 바깥 객체만 새로 만들기 때문에, 안쪽의 중첩 객체는 원본과 복사본이 같은 객체를 가리킬 수 있다는 뜻입니다.
따라서 한쪽에서 그 중첩 객체를 바꾸면 다른 쪽에서도 변경이 보일 수 있습니다.

### 답변 5

`JSON.stringify()`는 JavaScript 값을 JSON 문자열로 바꿉니다.
`JSON.parse()`는 JSON 문자열을 JavaScript 값으로 바꿉니다.
