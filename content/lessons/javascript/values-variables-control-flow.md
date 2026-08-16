# 02. 값·변수·연산자·제어문

## 학습 목표

- 값, 타입, 변수의 관계를 설명할 수 있습니다.
- `const`와 `let`을 상황에 맞게 사용할 수 있습니다.
- 비교 연산의 결과로 조건문과 반복문의 흐름을 제어할 수 있습니다.
- 의도하지 않은 타입 변환과 반복문의 경계 오류를 피할 수 있습니다.

## 왜 필요한가

프로그램은 결국 **값을 읽고, 비교하고, 바꾸고, 반복해서 처리하는 과정**입니다. 입력값 검증, 로그인 상태 확인, 게시글 목록 출력도 모두 이 기본 흐름의 조합입니다.

## 비유: 이름표가 붙은 보관함과 갈림길

> **비유**  
> 값은 물건, 변수는 그 물건을 찾아가기 위한 이름표입니다. 연산자는 물건을 계산하거나 비교하는 도구이고, 조건문은 비교 결과에 따라 방향을 고르는 갈림길입니다.

실제 JavaScript 변수는 단순한 상자라기보다 값에 접근하도록 이름을 연결하는 바인딩입니다. 특히 객체는 변수에 객체 자체가 통째로 복사된다고 생각하면 참조 동작을 오해하기 쉽습니다.

## 정확한 설명

### 값과 타입

ECMAScript의 원시 값에는 다음 타입이 있습니다.

| 타입 | 예 | 설명 |
| --- | --- | --- |
| `string` | `"bam"` | 문자열 |
| `number` | `10`, `3.14`, `NaN` | 숫자 |
| `bigint` | `10n` | 큰 정수 |
| `boolean` | `true`, `false` | 참과 거짓 |
| `undefined` | `undefined` | 값이 아직 정해지지 않음 |
| `null` | `null` | 의도적으로 값이 없음을 표현 |
| `symbol` | `Symbol("id")` | 고유한 식별용 값 |

그리고 속성의 모음인 **객체 타입**이 있습니다. 배열과 함수도 객체 범주에 속합니다.

```javascript
const nickname = "bam";        // string
const age = 20;                 // number
const isLoggedIn = false;       // boolean
const selectedPost = null;      // null
const user = { id: 1, nickname: "bam" }; // object
```

JavaScript는 동적 타입 언어이므로 변수 선언에 타입을 적지 않고, 현재 연결된 값에 타입이 있습니다.

```javascript
let value = 10;
value = "열"; // 가능하지만, 읽는 사람이 흐름을 추적하기 어려울 수 있음
```

### `const`와 `let`

```javascript
const course = "JavaScript";
let progress = 0;

progress = progress + 1;
```

- `const`: 같은 이름에 다른 값을 다시 대입할 수 없습니다.
- `let`: 값을 다시 대입할 수 있습니다.
- 두 선언 모두 자신이 선언된 블록 `{}`을 기준으로 범위를 가집니다.

`const` 객체의 내부 속성은 바꿀 수 있습니다. 금지되는 것은 변수 자체에 다른 값을 다시 대입하는 일입니다.

```javascript
const user = { nickname: "bam" };
user.nickname = "night"; // 가능

// user = {};             // TypeError 발생
```

### 주요 연산자

```javascript
const total = 10 + 5;        // 15
const remainder = 10 % 3;    // 1
const isAdult = 20 >= 19;    // true
const isSame = 10 === 10;    // true
const canWrite = true && isAdult; // true
```

| 분류 | 연산자 예 | 역할 |
| --- | --- | --- |
| 산술 | `+`, `-`, `*`, `/`, `%` | 수 계산 |
| 비교 | `>`, `<`, `>=`, `<=`, `===`, `!==` | 비교 후 boolean 반환 |
| 논리 | `&&`, `||`, `!` | 조건 조합 또는 반전 |
| 대입 | `=`, `+=`, `-=` | 변수에 값 대입 |
| 선택 | `조건 ? 값1 : 값2` | 조건에 따라 값 선택 |
| null 병합 | `a ?? b` | `a`가 `null` 또는 `undefined`일 때 `b` 사용 |
| 선택적 연결 | `obj?.name` | 앞의 값이 `null`/`undefined`면 오류 대신 `undefined` 반환 |

`===`는 타입을 강제로 맞추지 않고 타입과 값을 모두 비교합니다.

```javascript
0 == false;  // true: 비교 과정에서 타입 변환
0 === false; // false: number와 boolean은 다른 타입
```

### 조건문

```javascript
const score = 82;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}
```

조건식은 boolean으로 평가됩니다. JavaScript에서는 다음 값들이 조건에서 거짓으로 취급됩니다.

```text
false, 0, -0, 0n, "", null, undefined, NaN
```

그 밖의 값은 참으로 취급됩니다. 빈 배열 `[]`과 빈 객체 `{}`도 참입니다. 단, 오래된 웹 호환성을 위해 남아 있는 `document.all`은 객체이면서 거짓으로 취급되는 특수한 예외이며 새 코드에서 사용하지 않습니다.

### 반복문

횟수나 인덱스가 필요하면 `for`를 사용할 수 있습니다.

```javascript
const scores = [80, 90, 70];

for (let index = 0; index < scores.length; index++) {
  console.log(scores[index]);
}
```

배열의 값을 순서대로 읽는 것이 목적이면 `for...of`가 더 직접적입니다.

```javascript
for (const score of scores) {
  console.log(score);
}
```

조건이 참인 동안 반복하려면 `while`을 사용합니다.

```javascript
let count = 3;

while (count > 0) {
  console.log(count);
  count--;
}
```

## 실행 흐름

```javascript
const prices = [1200, 800, 1500];
let total = 0;

for (const price of prices) {
  if (price >= 1000) {
    total += price;
  }
}

console.log(total); // 2700
```

1. `prices`에 숫자 세 개가 든 배열을 연결합니다.
2. 합계를 저장할 `total`을 `0`으로 시작합니다.
3. 첫 값 `1200`은 조건을 만족하므로 `total`이 `1200`이 됩니다.
4. 두 번째 값 `800`은 조건을 만족하지 않아 건너뜁니다.
5. 세 번째 값 `1500`을 더해 `total`이 `2700`이 됩니다.
6. 반복이 끝난 뒤 최종 합계를 출력합니다.

## 최소 코드

```javascript
const age = 18;
const hasPermission = true;

if (age >= 18 && hasPermission) {
  console.log("입장 가능");
} else {
  console.log("입장 불가");
}
```

## 흔한 실수

### 1. 비교 대신 대입하기

```javascript
if (score = 100) { /* ... */ }  // score에 100을 대입
if (score === 100) { /* ... */ } // score가 100인지 비교
```

### 2. `const`는 객체의 내부도 못 바꾼다고 생각하기

`const`는 재대입을 막습니다. 객체의 속성 변경까지 자동으로 막지는 않습니다.

### 3. 문자열 덧셈을 숫자 덧셈으로 생각하기

```javascript
"10" + 5;         // "105"
Number("10") + 5; // 15
```

사용자 입력 요소의 `value`는 문자열이므로 숫자 계산 전 변환이 필요할 수 있습니다.

### 4. 반복문의 마지막 값을 빠뜨리거나 넘기기

```javascript
for (let i = 0; i < items.length; i++) { /* 안전한 기본 형태 */ }
```

배열의 마지막 인덱스는 `length - 1`입니다. `i <= items.length`로 작성하면 마지막 반복에서 존재하지 않는 요소를 읽습니다.

### 5. Java와 JavaScript의 길이 표기를 섞기

```javascript
text.length;  // JavaScript 문자열의 길이 프로퍼티
list.length;  // JavaScript 배열의 길이 프로퍼티
```

JavaScript에서는 이 경우 `length()`가 아니라 괄호 없는 `length`를 사용합니다.

### 6. `||`와 `??`를 같은 의미로 생각하기

```javascript
const countA = 0 || 10; // 10
const countB = 0 ?? 10; // 0
```

`||`는 왼쪽이 거짓으로 평가되면 오른쪽을 사용하지만, `??`는 왼쪽이 `null` 또는 `undefined`일 때만 오른쪽을 사용합니다.

## 확인 문제

1. 원시 값과 객체의 차이를 자신의 말로 설명해 보세요.
2. `const user = { name: "bam" }`에서 `user.name`을 바꿀 수 있는 이유는 무엇인가요?
3. `"5" + 2`와 `Number("5") + 2`의 결과를 각각 예측해 보세요.
4. `0 || 100`과 `0 ?? 100`은 각각 어떤 값을 반환하나요?
5. 배열의 모든 값을 읽을 때 반복 조건을 `index < array.length`로 작성하는 이유는 무엇인가요?
