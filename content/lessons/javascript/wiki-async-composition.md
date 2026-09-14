# 비동기 작업 조합: 순차 실행과 동시 시작

## 학습 목표

작업의 입력 의존성을 보고 순차 실행과 동시 시작을 고르며 all·race의 실패와 취소를 구분할 수 있습니다.

## 한줄 요약

다음 작업이 앞 결과를 필요로 하면 차례대로 기다리고, 독립 작업은 함께 시작하되 결과 확정과 취소를 구분합니다.

## 먼저 확인할 개념

[async·await와 실패 처리](#/learn/javascript/wiki-async-await)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## 다음 입력이 준비됐는지 먼저 본다

두 번째 작업이 첫 번째 결과의 ID를 필요로 하면 첫 결과를 받은 뒤 시작한다.
독립 작업은 먼저 모두 시작한 다음 함께 기다릴 수 있다.

다음 코드는 서버 없이 결과를 제공하는 연습용 함수다. 각각의 함수를 정의한 뒤 전체 블록을 실행한다.

```js
async function loadMember() { return { id: 7 }; }
async function loadReservations(memberId) { return [{ memberId, seat: "A1" }]; }
async function loadMemberPage() {
  const member = await loadMember();
  const reservations = await loadReservations(member.id);
  return { member, reservations };
}
loadMemberPage().then(console.log);
```

HTTP 응답으로 사용자를 받는 경우에는 중간 단계가 하나 더 있다.
아래는 성공 JSON 응답을 주는 API가 있다고 가정한 흐름 조각이며, 밤데브의 실제 API나 실행용 외부 실습이 아니다.

```js
async function loadOrders() {
  const userResponse = await fetch("/api/user");
  const user = await userResponse.json();
  const ordersResponse = await fetch(`/api/orders?userId=${user.id}`);
  return await ordersResponse.json();
}
```

fetch의 성공값은 상태·헤더·본문 읽기를 가진 Response다.
`response.json()`도 Promise를 반환하므로 await한 데이터에서 user.id를 읽는다.
실제 오류·본문 검증은 [fetch 문서](#/learn/javascript/wiki-fetch)에서 다룬다.

## 독립 작업은 시작한 뒤 함께 기다린다

```js
async function loadWeather() { return "맑음"; }
async function loadNotices() { return ["오늘 모임"]; }
async function loadHome() {
  const weatherPromise = loadWeather();
  const noticesPromise = loadNotices();
  return await Promise.all([weatherPromise, noticesPromise]);
}
loadHome().then(console.log);
```

Promise.all의 결과 배열은 완료 순서가 아니라 넣은 순서로 정렬된다.
하나가 reject되면 all도 reject되지만 이미 시작한 나머지 작업은 자동으로 취소되지 않는다.
호출할 때 하나씩 await하면 독립 작업도 차례로 기다리게 된다.


## `Promise.race()`는 첫 성공이 아니라 첫 완료를 따른다

`Promise.race()`는 여러 Promise 가운데 가장 먼저 settled된 Promise의 결과를 따른다.

```js
const fastFailure = Promise.reject(new Error("빠른 실패"));
const laterSuccess = new Promise((resolve) => {
  setTimeout(() => resolve("느린 성공"), 100);
});

Promise.race([fastFailure, laterSuccess])
  .then(console.log)
  .catch((error) => console.error(error.message));
```

첫 번째로 정해진 결과가 실패이므로 race도 reject된다.
`첫 번째 성공값`을 찾는 기능으로 이해하면 안 된다.
빈 배열을 전달하면 결과가 정해질 Promise가 없어 계속 pending 상태로 남는다.

또한 race에서 이기지 못한 작업이 자동으로 멈추지는 않는다.
Promise 자체에는 모든 작업에 공통으로 쓸 수 있는 취소 버튼이 없다.
작업을 실제로 중단하려면 그 API가 중단 요청을 전달하는 `AbortSignal` 같은 방법을 지원해야 한다.

## 이어서 연습하기

[이벤트 루프: 동기 코드·microtask·task의 실행 순서](#/learn/javascript/wiki-event-loop)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)
- [ECMAScript 2026 — Async Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-async-function-definitions)
- [WHATWG HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 핵심 질문 답

두 번째 작업에 첫 결과의 ID가 필요하면 첫 결과까지 기다린 후 시작합니다. HTTP에서는 Response 자체가 데이터가 아니므로 response.json()도 기다려야 합니다. 독립 작업은 먼저 시작해 Promise.all로 입력 순서의 결과를 받습니다. all은 하나의 rejection에도 실패하고 race는 첫 성공이 아닌 첫 settled 결과를 따릅니다. 둘 다 다른 작업을 자동으로 취소하지 않습니다.
