# 06. Promise·async/await·fetch

## 학습 목표

- 동기 작업과 비동기 작업의 차이를 설명할 수 있습니다.
- Promise의 대기, 이행, 거부 상태와 체이닝 흐름을 이해합니다.
- `async` 함수와 `await`가 Promise를 다루는 문법임을 설명할 수 있습니다.
- `fetch()`에서 네트워크 실패와 HTTP 오류 응답을 구분하여 처리할 수 있습니다.

## 왜 필요한가

서버 응답이나 타이머의 결과는 바로 준비되지 않을 수 있습니다.
비동기 코드는 다른 일을 멈추지 않으면서 **나중에 도착할 결과를 이어서 처리하는 방법**입니다.

## 동기와 비동기

**동기** 코드는 앞 문장이 끝난 뒤 다음 문장을 실행합니다.
**비동기** 작업은 결과를 기다리는 동안 다른 코드를 계속 실행할 수 있습니다.

```javascript
console.log("시작");

setTimeout(() => {
  console.log("타이머 완료");
}, 0);

console.log("끝");
```

일반적인 출력 순서는 `시작 → 끝 → 타이머 완료`입니다.
`0`밀리초여도 현재 실행 중인 코드보다 먼저 실행하라는 뜻은 아닙니다.

## Promise

**Promise**는 나중에 성공하거나 실패할 작업의 결과를 나타내는 객체입니다.

```text
pending(대기)
├─ fulfilled(이행): 성공 값이 준비됨
└─ rejected(거부): 실패 이유가 준비됨
```

Promise는 처음 이행되거나 거부되면 그 최종 상태가 다시 바뀌지 않습니다.

```javascript
const ticket = new Promise((resolve, reject) => {
  resolve("완료");
  reject(new Error("실패"));
});

ticket
  .then((value) => console.log(value))
  .catch((error) => console.error(error.message));

// "완료"만 출력
```

- `resolve(value)`는 Promise를 이행시키고 값을 `then()`으로 보냅니다.
- `reject(reason)`는 Promise를 거부시키고 이유를 `catch()`로 보냅니다.
- `new Error("메시지")`는 오류 객체를 만들고, `error.message`로 그 설명을 읽습니다.

### Promise 체이닝

`then()`을 이어 쓰면 앞 단계의 결과를 다음 단계로 전달할 수 있습니다.
이를 **체이닝**이라고 합니다.

`Promise.resolve(10)`은 값 `10`으로 이미 이행된 Promise를 만들어 흐름을 연습할 때 사용할 수 있습니다.

```javascript
Promise.resolve(10)
  .then((number) => number * 2)
  .then((number) => console.log(number)) // 20
  .catch((error) => console.error(error.message));
```

- 일반 값을 반환하면 다음 `then()`이 그 값을 받습니다.
- Promise를 반환하면 그 작업이 끝난 뒤 다음 단계가 실행됩니다.
- 오류를 던지거나 Promise가 거부되면 `catch()`로 이동합니다.

## `async`와 `await`

`async`를 붙인 함수는 항상 Promise를 반환합니다.

```javascript
async function getNumber() {
  return 10;
}

getNumber().then((number) => console.log(number)); // 10
```

`await`는 Promise의 결과가 준비될 때까지 **현재 `async` 함수의 나머지 실행**을 미룹니다.
프로그램 전체를 멈추는 것은 아닙니다.

```javascript
async function printNumber() {
  const number = await Promise.resolve(10);
  console.log(number);
}

printNumber();
```

거부된 Promise를 `await`하면 오류처럼 처리되므로 `try...catch`로 다룰 수 있습니다.

`try` 블록에서 코드를 실행하다 오류가 발생하면 나머지를 건너뛰고 `catch` 블록에서 그 오류를 처리합니다.
`throw`는 그 자리에서 오류를 발생시켜 `catch`로 보냅니다.

## 독립 작업과 의존 작업

두 작업에 서로의 결과가 필요 없다면 Promise를 먼저 만들고 `Promise.all()`로 함께 기다릴 수 있습니다.

```javascript
async function loadSummary() {
  const profileTask = Promise.resolve({ nickname: "bam" });
  const progressTask = Promise.resolve({ completed: 5 });

  const results = await Promise.all([
    profileTask,
    progressTask,
  ]);

  const profile = results[0];
  const progress = results[1];
  return { profile: profile, progress: progress };
}
```

반대로 주문 목록을 구할 때 `user.id`가 필요하다면 사용자 데이터를 먼저 받아야 합니다.
다음 예제는 외부 서버 없이 그 실행 순서를 확인할 수 있습니다.

```javascript
async function getUser() {
  return { id: "user-1" };
}

async function getOrders(userId) {
  return [{ id: "order-1", userId: userId }];
}

async function loadOrders() {
  const user = await getUser();
  const orders = await getOrders(user.id);
  return orders;
}

loadOrders().then((orders) => console.log(orders));
```

두 번째 작업이 첫 번째 결과에 의존하므로 이 경우에는 순서대로 기다립니다.
실제 `fetch()`를 사용한다면 먼저 받은 `Response`에 `await response.json()`을 적용해 사용자 데이터를 얻은 뒤 `user.id`로 두 번째 요청을 만듭니다.

## `fetch()`의 흐름

**HTTP**는 브라우저와 서버가 데이터를 주고받을 때 사용하는 규칙입니다.
`fetch()`는 HTTP 요청을 시작하고 응답 정보를 담은 `Response` 객체로 이행하는 Promise를 반환합니다.

요청 자체를 완료하지 못한 네트워크 실패에서는 Promise가 거부될 수 있습니다.
반면 서버가 `404`나 `500`을 보냈다는 이유만으로는 보통 거부되지 않고 `Response`를 받으므로 `response.ok`를 확인해야 합니다.

이 교안은 저장소의 `./content/fixtures/javascript/todos.json`을 사용합니다.
`npm run dev`로 BAM.dev를 실행하면 인터넷이나 외부 API 없이 연습할 수 있습니다.
HTML 파일을 `file://`로 직접 열지 말고 로컬 개발 서버 주소에서 실행합니다.

## 실행 흐름

```javascript
const TODO_FIXTURE_URL = "./content/fixtures/javascript/todos.json";

async function loadTodos() {
  try {
    const response = await fetch(TODO_FIXTURE_URL);

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const todos = await response.json();
    console.log(`${todos.length}개 항목을 불러왔습니다.`);
  } catch (error) {
    console.error(error.message);
  }
}

loadTodos();
```

1. `loadTodos()`를 호출하면 Promise가 반환됩니다.
2. `fetch()`가 요청을 시작하고 함수의 나머지 실행이 잠시 미뤄집니다.
3. 응답을 받으면 `response.ok`를 확인합니다.
4. HTTP 오류 상태이면 오류를 만들어 `catch`로 이동합니다.
5. 성공 상태이면 `response.json()`을 기다린 뒤 항목 수를 출력합니다.
6. 요청이나 변환 중 오류가 발생하면 `catch`가 처리합니다.

## 최소 코드

```javascript
async function getMessage() {
  return "완료";
}

getMessage().then((message) => console.log(message)); // "완료"
```

## 흔한 실수

### 1. `response.json()`을 기다리지 않기

`async` 함수 안에서 `const data = await response.json();`처럼 기다립니다.
`response.json()`은 즉시 최종 객체를 주는 함수가 아니라 Promise를 반환합니다.

### 2. `response.ok`를 확인하지 않기

`fetch()`가 이행됐다는 사실만으로 HTTP 상태가 성공이라는 뜻은 아닙니다.

### 3. 체이닝에서 Promise를 반환하지 않기

```javascript
function loadData(url) {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(data));
}
```

첫 `then()`이 JSON Promise를 반환해야 다음 단계가 변환 결과를 기다립니다.

### 4. 처음 확정된 Promise 상태가 다시 바뀐다고 생각하기

먼저 `resolve()`된 Promise를 뒤의 `reject()`가 거부 상태로 바꾸지는 못합니다.

### 5. 의존하는 요청을 동시에 시작하기

두 번째 요청 주소에 첫 번째 결과가 필요하면 첫 결과를 받은 뒤 두 번째 요청을 시작해야 합니다.
독립적인 작업일 때만 함께 기다리는 방식을 고려합니다.

## 확인 포인트

1. `async` 함수의 호출 결과를 Promise로 다루고 있나요?
2. 필요한 Promise 앞에 `await`를 사용했나요?
3. `fetch()` 뒤에 `response.ok`를 확인했나요?
4. `Response`와 `response.json()`으로 얻는 데이터를 구분했나요?
5. 두 작업이 독립적인지, 앞 결과에 의존하는지 확인했나요?

## 확인 문제

1. Promise의 세 상태와 한 번 확정된 뒤의 특징을 설명해 보세요.
2. `await`가 프로그램 전체를 멈추지 않는다는 말은 무슨 뜻인가요?
3. 서버가 HTTP 404를 보내도 `response.ok`를 직접 확인해야 하는 이유는 무엇인가요?
4. 두 비동기 작업을 `Promise.all()`로 함께 기다릴 때와 순서대로 기다릴 때의 차이는 무엇인가요?

## 공식 자료

- [MDN: Promise 사용하기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN: async 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
- [MDN: Fetch API 사용하기](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

공식 자료 확인일: 2026-08-18

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

Promise는 대기 중, 이행됨, 거부됨의 세 상태를 가집니다.
한 번 이행되거나 거부되어 확정되면 이후의 처리로 상태나 결과가 바뀌지 않습니다.

### 답변 2

`await`는 Promise의 결과가 준비될 때까지 현재 `async` 함수의 나머지 실행을 미룹니다.
그러는 동안에도 프로그램의 다른 코드는 계속 실행될 수 있으므로 프로그램 전체를 멈추는 것은 아닙니다.

### 답변 3

`fetch()`는 서버가 HTTP 404나 500을 보내더라도 응답을 받았다면 보통 `Response`로 이행합니다.
따라서 `response.ok`를 확인해 성공 범위의 상태인지 직접 판단해야 합니다.

### 답변 4

서로 독립적인 작업은 함께 시작한 뒤 `Promise.all()`로 결과를 기다릴 수 있습니다.
두 번째 작업에 첫 번째 결과가 필요하면 첫 결과를 받은 뒤 두 번째 작업을 시작해 순서대로 기다려야 합니다.
