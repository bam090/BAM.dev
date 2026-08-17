# 04. 배열·객체·표준 내장 객체

## 학습 목표

- 배열과 객체를 언제 사용하는지 구분할 수 있습니다.
- 배열 메서드의 입력, 반환값, 원본 변경 여부를 확인하며 사용할 수 있습니다.
- 객체의 속성을 점 표기법과 대괄호 표기법으로 읽고 바꿀 수 있습니다.
- `String`, `Number`, `Math`, `Date`, `JSON` 같은 표준 내장 객체의 역할을 이해합니다.

## 왜 필요한가

게시글 한 개는 제목, 내용, 작성자처럼 서로 관련된 값을 묶어야 하고, 게시글 목록은 이런 묶음을 여러 개 순서대로 저장해야 합니다. 실제 애플리케이션의 데이터는 대부분 **객체 한 개**와 **객체가 들어 있는 배열**의 조합으로 다룹니다.

## 비유: 명단과 작성 카드

> **비유**  
> 배열은 순서가 있는 명단이고, 객체는 `이름: 값` 칸이 있는 작성 카드입니다. 사용자 한 명은 작성 카드로, 여러 사용자는 카드가 순서대로 꽂힌 명단으로 표현할 수 있습니다.

정확히는 배열도 객체의 한 종류이며, 정수 인덱스와 `length`를 특별하게 다루는 배열 전용 동작을 가집니다.

## 정확한 설명

### 배열

배열은 여러 값을 순서대로 저장합니다. 인덱스는 `0`부터 시작합니다.

```javascript
const fruits = ["사과", "바나나", "오렌지"];

console.log(fruits[0]);     // "사과"
console.log(fruits.length); // 3
```

`length`는 함수가 아니라 프로퍼티이므로 괄호를 붙이지 않습니다.

```javascript
fruits.push("포도"); // 마지막에 추가, 원본 배열 변경
```

### 자주 사용하는 배열 메서드

```javascript
const scores = [60, 85, 90];

const passed = scores.filter((score) => score >= 80);
const labels = scores.map((score) => `${score}점`);
const firstPerfect = scores.find((score) => score === 100);
```

| 메서드 | 하는 일 | 반환값 | 원본 배열 |
| --- | --- | --- | --- |
| `forEach()` | 각 요소로 함수를 실행 | `undefined` | 콜백 내용에 따라 달라짐 |
| `map()` | 각 요소를 다른 값으로 변환 | 새 배열 | 변경하지 않음 |
| `filter()` | 조건을 만족하는 요소만 선택 | 새 배열 | 변경하지 않음 |
| `find()` | 조건을 만족하는 첫 요소 검색 | 요소 또는 `undefined` | 변경하지 않음 |
| `some()` | 하나라도 조건을 만족하는지 확인 | boolean | 변경하지 않음 |
| `every()` | 모두 조건을 만족하는지 확인 | boolean | 변경하지 않음 |
| `push()` | 끝에 요소 추가 | 변경된 길이 | 변경함 |
| `sort()` | 요소 순서 정렬 | 같은 배열 | **변경함** |
| `toSorted()` | 요소 순서를 복사해 정렬 | 새 배열 | 변경하지 않음 |
| `join()` | 요소를 문자열로 연결 | 문자열 | 변경하지 않음 |

콜백 함수는 배열 메서드가 나중에 호출할 수 있도록 전달하는 함수입니다.

```javascript
const doubled = [1, 2, 3].map((number) => number * 2);
// [2, 4, 6]
```

### 숫자 정렬

`sort()`의 기본 정렬은 요소를 문자열로 바꾼 뒤 비교하므로 숫자 정렬에는 비교 함수를 전달해야 합니다.

```javascript
const numbers = [10, 2, 30];

numbers.sort((a, b) => a - b);
console.log(numbers); // [2, 10, 30]
```

- 비교 결과가 음수이면 `a`가 `b`보다 앞에 옵니다.
- 양수이면 `b`가 `a`보다 앞에 옵니다.
- `0`이면 두 요소의 순서를 바꿀 필요가 없음을 뜻합니다.

원본을 유지하려면 복사한 뒤 정렬하거나 `toSorted()`를 사용할 수 있습니다.

```javascript
const sorted = [...numbers].sort((a, b) => a - b);
```

### 객체

객체는 관련된 값을 이름이 있는 속성으로 묶습니다.

```javascript
const user = {
  id: 1,
  nickname: "bam",
  isLoggedIn: true,
};

console.log(user.nickname);      // 점 표기법
console.log(user["nickname"]);  // 대괄호 표기법
```

속성 이름을 변수로 결정해야 할 때는 대괄호 표기법을 사용합니다.

```javascript
const propertyName = "nickname";
console.log(user[propertyName]);
```

중첩된 객체는 접근 경로를 차례로 따라갑니다.

```javascript
const member = {
  name: "bam",
  company: {
    name: "Code Lab",
  },
};

console.log(member.company.name);
```

### 참조와 얕은 복사

두 변수가 같은 객체를 가리키면 한쪽에서 바꾼 속성이 다른 쪽에서도 보입니다.

```javascript
const original = { name: "bam" };
const sameObject = original;

sameObject.name = "night";
console.log(original.name); // "night"
```

스프레드 문법으로 바깥 객체를 새로 만들 수 있습니다.

```javascript
const copied = { ...original };
```

하지만 이것은 **얕은 복사**입니다. 중첩 객체까지 모두 새로 만드는 것은 아닙니다.

```javascript
const first = { profile: { name: "bam" } };
const second = { ...first };

second.profile.name = "night";
console.log(first.profile.name); // "night"
```

### 표준 내장 객체

ECMAScript는 자주 필요한 작업을 위한 표준 내장 객체를 제공합니다.

#### 문자열 `String`

```javascript
const title = "  JavaScript 시작  ";

console.log(title.trim());          // 앞뒤 공백 제거
console.log(title.includes("Java")); // 포함 여부
console.log(title.toLowerCase());   // 소문자로 변환한 새 문자열
```

문자열은 원시 값이며 메서드는 기존 문자열을 직접 바꾸지 않고 새 값을 반환합니다.

#### 숫자 `Number`와 `Math`

```javascript
const input = "42";
const number = Number(input);

console.log(Number.isNaN(number)); // false
console.log(Math.floor(3.9));      // 3
console.log(Math.max(3, 8, 5));    // 8
```

`Math`는 생성자로 사용하지 않고 정적 프로퍼티와 메서드를 사용하는 내장 객체입니다.

#### 날짜 `Date`

```javascript
const now = new Date();

console.log(now.getFullYear());
console.log(now.getMonth() + 1); // getMonth()는 0부터 시작
console.log(now.toISOString());
```

날짜와 시간은 시간대와 형식에 따라 결과가 달라질 수 있습니다. 저장에는 표준화된 문자열을 사용하고, 표시할 때 사용자 지역에 맞게 변환하는 방식을 고려합니다.

#### JSON

JSON은 데이터를 교환하기 위한 텍스트 형식입니다.

```javascript
const userData = { id: 1, nickname: "bam" };

const jsonText = JSON.stringify(userData);
const parsedUser = JSON.parse(jsonText);
```

```text
JSON으로 표현 가능한 JavaScript 값
→ JSON.stringify()
→ JSON 문자열
→ JSON.parse()
→ JavaScript 값
```

모든 JavaScript 값이 JSON 문자열로 바뀌는 것은 아닙니다. 순환 참조가 있는 객체를 그대로 전달하거나 `BigInt` 값을 별도 변환 없이 포함하면 `JSON.stringify()`는 `TypeError`를 일으킵니다.

```javascript
const circularData = {};
circularData.self = circularData;

JSON.stringify(circularData); // TypeError
```

위 코드와 별도로 다음 코드도 실행해 확인할 수 있습니다.

```javascript
JSON.stringify({ count: 1n }); // TypeError
```

따라서 직렬화할 값이 JSON으로 표현 가능한 구조인지 먼저 확인해야 합니다. 반대 방향에서도 `JSON.parse()`에 올바르지 않은 JSON 문자열을 넣으면 `SyntaxError`가 발생할 수 있습니다.

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

1. `filter()`가 게시글 객체를 하나씩 검사합니다.
2. `published`가 `true`인 객체만 새 배열에 담습니다.
3. `map()`이 남은 각 객체에서 `title`을 꺼냅니다.
4. 제목만 들어 있는 새 배열을 반환합니다.
5. 원본 `posts` 배열은 그대로 유지됩니다.

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

### 1. `map()`에서 반환하지 않기

```javascript
const wrong = [1, 2].map((number) => {
  number * 2; // return이 없음
});
// [undefined, undefined]
```

중괄호를 사용한 콜백에서 새 값을 만들려면 `return`이 필요합니다.

### 2. `forEach()`가 새 배열을 반환한다고 생각하기

`forEach()`의 반환값은 `undefined`입니다. 변환된 새 배열이 필요하면 `map()`을 사용합니다.

### 3. 객체에 배열처럼 `length`가 있다고 생각하기

일반 객체에는 배열의 `length`가 없습니다. 속성 목록이 필요하다면 목적에 따라 `Object.keys()`, `Object.values()`, `Object.entries()`를 사용합니다.

### 4. `sort()`가 원본을 유지한다고 생각하기

`sort()`는 원본 배열의 순서를 변경합니다. 원본이 필요하다면 먼저 복사하거나 `toSorted()` 지원 환경을 확인해 사용합니다.

### 5. JSON과 JavaScript 객체를 같은 값으로 생각하기

```javascript
const objectValue = { name: "bam" }; // 객체
const jsonText = '{"name":"bam"}'; // 문자열
```

둘은 모양이 비슷하지만 타입과 용도가 다릅니다.

### 6. 얕은 복사가 중첩 객체도 분리한다고 생각하기

`{ ...object }`와 `[...array]`는 바깥 컨테이너를 새로 만들지만, 내부에 들어 있는 객체 참조는 공유할 수 있습니다.

## 확인 문제

1. 사용자 한 명과 사용자 여러 명을 각각 객체와 배열로 어떻게 표현할지 적어 보세요.
2. `map()`과 `filter()`는 각각 어떤 새 배열을 만드나요?
3. `find()`가 조건을 만족하는 값을 찾지 못하면 무엇을 반환하나요?
4. 숫자 배열을 오름차순으로 정렬할 때 비교 함수가 필요한 이유는 무엇인가요?
5. `JSON.stringify()`와 `JSON.parse()`는 각각 어느 방향의 변환인가요?
6. 스프레드 문법의 복사가 얕은 복사라는 말은 무엇을 뜻하나요?
