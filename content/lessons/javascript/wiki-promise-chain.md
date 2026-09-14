# Promise 상태와 반환 연결

## 학습 목표

Promise의 확정 상태와 then의 반환을 추적해 다음 단계가 받는 값이나 실패를 설명할 수 있습니다.

## 한줄 요약

Promise의 결과는 한 번 정해지며 then이 만든 다음 Promise에는 콜백의 반환값이나 오류가 이어집니다.

## 먼저 확인할 개념

[함수의 입력과 반환](#/learn/javascript/wiki-function-return) · [함수 값과 동기 콜백](#/learn/javascript/wiki-callbacks)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## Promise는 나중 결과를 나타내는 객체다

Promise는 `나중에 성공값이나 실패 이유를 알려 주겠다는 객체`다.
Promise에는 세 상태가 있다.

| 상태 | 뜻 |
| --- | --- |
| `pending` | 아직 결과가 정해지지 않음 |
| `fulfilled` | 성공값이 정해짐 |
| `rejected` | 실패 이유가 정해짐 |

fulfilled와 rejected를 합쳐 settled, 곧 `결과가 정해진 상태`라고 한다.
한 번 settled된 Promise는 다른 결과로 다시 바뀌지 않는다.
`resolved`를 언제나 `fulfilled`와 같은 뜻으로 단정하지 않는다.
다른 Promise를 따르도록 정해졌지만 아직 그 결과를 기다리는 상태도 있을 수 있다.

Promise를 만드는 함수인 executor는 즉시 실행된다.
executor는 `new Promise(...)` 안에 전달한 함수다.
그러나 `.then()`에 전달한 함수는 현재 동기 코드가 끝난 뒤 실행된다.

```js
console.log("1. 시작");

const result = new Promise((resolve) => {
  console.log("2. executor 실행");
  resolve("4. then 실행");
});

result.then((message) => {
  console.log(message);
});

console.log("3. 현재 코드 끝");
```

이 예에서 `resolve("4. then 실행")`는 문자열을 성공값으로 전달한다.
출력은 `1 → 2 → 3 → 4` 순서다.
Promise를 만들어도 executor 안의 무거운 동기 계산은 여전히 현재 실행을 막는다.

## `then()`은 다음 Promise를 만든다

`.then()`은 같은 Promise를 되돌려 주는 것이 아니라 새 Promise를 만든다.
앞 단계가 반환한 값이 다음 단계의 입력이 된다.

```js
Promise.resolve(4)
  .then((number) => number * 2)
  .then((number) => `${number}개`)
  .then((label) => {
    console.log(label); // "8개"
  });
```

각 단계는 다음 규칙으로 이어진다.

- 일반 값을 반환하면 다음 Promise가 그 값으로 fulfilled된다.
- 오류를 던지면 다음 Promise가 rejected된다.
- Promise를 반환하면 다음 단계는 그 Promise의 결과를 기다린다.

```js
function loadTitle() {
  return Promise.resolve("저녁 모임");
}

Promise.resolve()
  .then(() => loadTitle())
  .then((title) => {
    console.log(title);
  });
```

Promise를 기다려야 하는 단계에서 `return`을 빠뜨리면 다음 단계는 그 작업을 기다리지 않고 `undefined`를 받는다.
중괄호가 있는 화살표 함수는 값을 자동으로 반환하지 않으므로 이어질 값이나 Promise가 있다면 `return`을 적는다.

## 이어서 연습하기

[async·await와 실패 처리](#/learn/javascript/wiki-async-await)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)
- [ECMAScript 2026 — Async Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-async-function-definitions)
- [WHATWG HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 핵심 질문 답

pending에서 fulfilled나 rejected가 되면 settled되어 결과가 다시 바뀌지 않습니다. 다른 Promise를 따르는 resolved 상태는 아직 pending일 수 있습니다. executor는 즉시 실행하지만 then 반응은 현재 동기 코드 뒤에 실행합니다. 콜백이 일반값을 반환하면 그 값, Promise를 반환하면 그 결과, 오류를 던지면 실패가 다음 단계로 이어집니다. 블록에서 return을 빠뜨리면 undefined가 이어집니다.
