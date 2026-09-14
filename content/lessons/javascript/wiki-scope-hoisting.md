# 스코프와 호이스팅: 이름 탐색과 선언 전 접근

## 학습 목표

선언 위치에 따라 이름을 찾고 let·const의 선언 전 접근 오류를 설명할 수 있습니다.

## 한줄 요약

이름은 작성된 코드의 가까운 범위부터 찾고, let·const는 선언 평가 전까지 사용할 수 없습니다.

## 먼저 확인할 개념

[const·let과 재대입](#/learn/javascript/wiki-variables)과 [함수의 입력과 반환](#/learn/javascript/wiki-function-return)을 먼저 확인해 보세요.

## 이름이 보이는 범위: 스코프

변수 이름을 코드의 모든 곳에서 사용할 수 있는 것은 아니다.
한 이름을 찾을 수 있는 코드 범위를 **스코프(scope)**라고 한다.

```js
const outside = "현관";

function showRoom() {
  const inside = "거실";
  console.log(outside);
  console.log(inside);
}

showRoom();
// console.log(inside); // 함수 밖에서는 inside를 찾을 수 없다.
```

`showRoom` 안에서는 바깥의 `outside`와 함수 안의 `inside`를 모두 찾을 수 있다.
함수 밖에서는 함수 안에 선언한 `inside`를 찾을 수 없다.

### 전역 스코프

일반 script 코드의 가장 바깥 범위를 **전역 스코프(global scope)**라고 한다.
전역 이름은 여러 곳에서 보일 수 있으므로 편리하지만, 코드가 커질수록 누가 값을 바꿨는지 찾기 어려워질 수 있다.
ES module의 가장 바깥 이름은 전역 스코프가 아니라 그 모듈의 범위에 속한다.

전역 스코프의 모든 이름이 곧 `window`나 `globalThis`라는 전역 객체의 속성이라는 뜻은 아니다.
최상위 `let`과 `const`도 전역 객체의 속성과 다르게 관리될 수 있다.

### 함수 스코프

함수의 매개변수와 함수 본문에 적힌 이름을 함수 밖에서 볼 수 없게 하는 코드 범위를
**함수 스코프(function scope)**라고 한다.
이 범위는 함수가 소스 코드의 어디에 정의됐는지를 따른다.
함수를 호출할 때마다 실제 값을 담을 별도의 실행 환경이 만들어지므로 여러 호출의 매개변수 값이 섞이지 않는다.

```js
function greet(name) {
  const message = `${name} 님, 반갑습니다.`;
  return message;
}
```

`name`과 `message`는 이 함수 안에서 사용한다.
더 안쪽 블록에서 선언한 이름은 그 좁은 블록 범위를 따른다.

### 블록 스코프

`if`나 `for`의 본문처럼 여러 문장을 중괄호로 묶은 구역을 **블록(block)**이라고 한다.
`let`과 `const`는 선언된 블록 안에서만 보인다.
객체·함수·class에 쓰인 모든 중괄호가 같은 블록 문법이라는 뜻은 아니다.

```js
if (true) {
  const cup = "파란 컵";
  let count = 2;
  console.log(cup, count);
}

// console.log(cup); // 블록 밖에서는 찾을 수 없다.
```

`if`, `for`, `while`의 중괄호 안에도 블록 스코프가 생길 수 있다.

## 같은 이름은 가까운 곳부터 찾는다

안쪽과 바깥쪽에 같은 이름이 있으면 JavaScript는 현재 위치에서 가장 가까운 이름부터 찾는다.

```js
const place = "마당";

function showPlace() {
  const place = "부엌";

  if (true) {
    const item = "주전자";
    console.log(place, item);
  }
}

showPlace(); // "부엌 주전자"
```

블록 안에서 `place`를 찾는다.

1. 현재 블록에 `place`가 있는지 본다.
2. 없으므로 둘러싼 함수 범위에서 찾는다.
3. 함수 안의 `"부엌"`을 찾았으므로 거기에서 멈춘다.

바깥의 `"마당"`까지 가지 않는다.
안쪽 선언이 같은 이름의 바깥 선언을 가리는 일을 **섀도잉(shadowing)**이라고 한다.

함수를 어디에서 호출했는지가 아니라, 함수를 코드의 어디에 작성했는지가 바깥 범위를 정한다.
이런 규칙을 **어휘적 스코프(lexical scope)**라고 한다.
여기서 어휘적이라는 말은 소스 코드에 적힌 중첩 위치를 따른다는 뜻이다.

## 이름을 찾을 때 사용하는 환경

JavaScript가 현재 이름과 바깥 이름을 찾도록 이어 둔 환경을
입문 설명에서는 **어휘적 환경(lexical environment)**이라고 부른다.
ECMAScript 2026 명세는 이름과 값의 연결인 **바인딩(binding)**을
**환경 레코드(Environment Record)**라는 내부 구조로 설명한다.
현재 환경에 이름이 없으면 연결된 바깥 환경으로 올라간다.

이 환경은 JavaScript 코드에서 속성을 읽고 쓰는 평범한 객체가 아니다.
브라우저의 JavaScript 실행 장치인 **엔진(engine)**이 반드시 명세 그림과 똑같은 객체를 만들어야 한다는 뜻도 아니다.
언어 동작을 설명하기 위한 규칙이다.

## 함수가 실행될 때 필요한 정보 묶음

함수를 호출하면 JavaScript는 실행할 코드, 이름을 찾을 환경, 호출이 끝난 뒤 돌아갈 위치 등을 추적한다.
이 실행 상태의 묶음을 **실행 컨텍스트(execution context)**라고 한다.
같은 함수도 호출할 때마다 각자의 매개변수 값을 가진 별도의 실행이므로, 함수 하나에 영원히 하나의 실행 컨텍스트가 붙는 것은 아니다.

실행 컨텍스트도 JavaScript 코드가 직접 열어 보는 일반 객체가 아니다.
명세와 엔진이 실행 흐름을 설명하고 관리하기 위한 개념이다.

## 호이스팅은 코드 이동이 아니다

함수 선언을 코드보다 앞에서 호출할 수 있는 모습을 **호이스팅(hoisting)**이라고 설명하는 자료가 많다.

```js
sayHello();

function sayHello() {
  console.log("안녕하세요.");
}
```

JavaScript가 선언문 글자를 실제로 파일 위쪽으로 옮기는 것은 아니다.
코드 본문을 실행하기 전에 선언 종류에 따라 바인딩을 만들고 초기화하는 규칙이 있기 때문에 이렇게 보인다.

`let`과 `const`도 블록 환경을 만들 때 바인딩은 준비되지만 선언을 평가하기 전에는 접근할 수 없다.

```js
// console.log(count); // 선언을 평가하기 전이라 오류가 난다.
const count = 1;
```

함수 선언, `var`, `let`, `const`가 준비되고 초기화되는 시점은 서로 다르다.
따라서 “모든 선언이 위로 올라간다”라는 한 문장으로 실행 결과를 예측하면 틀리기 쉽다.

## 바깥 이름이 있어도 초기화 전에는 읽지 못한다

다음은 오류를 관찰하는 예이며 수정된 해법이 아닙니다.

```js
const count = 10;
{
  console.log(count);
  const count = 2;
}
```

블록 안에 선언된 `count`가 바깥의 같은 이름보다 우선하지만 아직 초기화되지 않았으므로 `ReferenceError`가 발생합니다. 현재 범위에 이름이 없는 상황과, 있는데 아직 쓸 수 없는 상황을 구분하세요.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [호출 뒤에도 이어지는 클로저](#/learn/javascript/wiki-closure)을 살펴보세요.

## 공식 자료

- [MDN — let의 초기화 전 접근](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [ECMAScript 2026 — Execution Contexts and Environment Records](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026 — ECMAScript Function Objects and Ordinary Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 — Objects and Classes Overview](https://tc39.es/ecma262/2026/multipage/overview.html#sec-objects)

## 핵심 질문 답

현재 범위에서 가장 가까운 선언을 찾고 없으면 코드상 바깥 범위로 이동합니다. 안쪽에 같은 이름이 선언되어 있으면 그 이름이 바깥 이름을 가립니다.
`let`·`const`의 이름은 준비되어 있어도 선언을 평가하기 전에는 초기화되지 않아 읽을 수 없습니다. 이때 바깥의 같은 이름으로 건너뛰지 않습니다. 함수 선언과 변수 선언의 준비 규칙 차이를 코드가 실제로 이동한 것으로 설명하지 않습니다.
