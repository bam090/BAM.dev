# async·await와 실패 처리

## 학습 목표

async의 호출 결과를 기다리고 Promise의 실패를 await 경계나 catch에서 처리할 수 있습니다.

## 한줄 요약

async는 Promise를 반환하고 await는 현재 함수의 이어질 실행을 미루며 rejection을 받을 자리를 만듭니다.

## 먼저 확인할 개념

[Promise 상태와 반환 연결](#/learn/javascript/wiki-promise-chain) · [예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)을 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## `async`와 `await`는 Promise 흐름을 순서대로 읽게 한다

함수 앞의 `async`는 `이 함수가 항상 Promise를 돌려준다`는 표시다.

```js
async function getCount() {
  return 3;
}

async function showCount() {
  const count = await getCount();
  console.log(`${count}개`);
}

showCount();
console.log("다른 코드는 계속 실행됩니다.");
```

`getCount()`가 숫자 `3`을 반환해도 호출 결과는 Promise다.
`await`는 결과가 정해질 때까지 `showCount()`의 다음 줄만 미루며 프로그램 전체를 멈추지 않는다.

## 동기 오류와 비동기 실패는 잡는 자리가 다르다

동기 실행은 현재 줄에서 차례대로 끝나는 실행이다.
현재 `try` 안에서 동기적으로 던져진 오류는 그 `catch`가 받을 수 있다.

Promise는 `나중에 도착할 결과를 나타내는 객체`이고 rejection은 그 Promise의 실패 상태다.
이처럼 나중에 전달되는 실패는 동기 `try`만 둘러싼다고 자동으로 잡히지 않는다.

```js
async function loadMember() {
  throw new Error("회원 정보를 불러오지 못했습니다.");
}

let memberPromise;

try {
  memberPromise = loadMember();
  console.log("async 함수는 Promise를 반환했습니다.");
} catch (error) {
  console.log("이곳은 Promise의 실패를 받지 못합니다.");
}

memberPromise.catch((error) => {
  console.error("Promise에서 실패를 처리했습니다.", error);
});
```

`async` 함수는 오류를 호출자에게 바로 던지는 대신 rejected Promise를 돌려준다.
그 Promise를 `await`하는 자리를 `try...catch`로 감싸거나 `.catch()`를 연결해야 한다.

```js
async function showMember() {
  try {
    const member = await loadMember();
    console.log(member);
  } catch (error) {
    console.error(error);
  }
}

showMember();
```

여기서는 `나중에 도착하는 실패는 그 결과를 기다리는 자리에서 처리한다`는 점을 기억하면 된다.

## 실패는 rejection으로 이어진다

Promise의 실패 상태를 rejection이라고 한다.
`.catch()`를 연결하거나 `await`하는 곳에 `try...catch`를 두어 처리한다.

```js
function readBrokenResponse() {
  return Promise.reject(new Error("응답을 읽지 못했습니다."));
}

async function showLessons() {
  try {
    const lessons = await readBrokenResponse();
    console.log(lessons);
  } catch (error) {
    console.error(error);
  } finally {
    console.log("읽기 작업을 마쳤습니다.");
  }
}

showLessons();
```

`async` 함수 안에서 오류를 던지면 함수 호출 자체가 동기적으로 던지는 것이 아니라 반환된 Promise가 rejected된다.
호출하는 쪽도 그 Promise를 기다리거나 `.catch()`를 연결해야 한다.

## 이어서 연습하기

[비동기 화면의 진행 상태](#/learn/javascript/wiki-async-state)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)
- [ECMAScript 2026 — Async Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-async-function-definitions)
- [WHATWG HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 핵심 질문 답

async 함수는 일반값을 return해도 Promise를 반환하고 내부 throw도 반환 Promise의 rejection으로 이어집니다. 호출만 감싼 동기 try는 그 실패를 받지 못합니다. await하는 자리를 try/catch로 감싸거나 반환 Promise에 catch를 연결합니다. await는 프로그램 전체가 아니라 현재 async 함수의 다음 실행을 미루므로 다른 동기 코드는 계속됩니다.
