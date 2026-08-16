# 06. Promise·async/await·fetch

## 학습 목표

- 동기 작업과 비동기 작업의 차이를 설명할 수 있습니다.
- Promise의 대기, 이행, 거부 상태와 체이닝 흐름을 이해합니다.
- `async` 함수와 `await`가 Promise를 다루는 문법임을 설명할 수 있습니다.
- `fetch()`에서 네트워크 실패와 HTTP 오류 응답을 구분하여 처리할 수 있습니다.

## 왜 필요한가

서버 응답, 타이머, 파일 읽기처럼 결과가 즉시 준비되지 않는 작업을 기다리는 동안 애플리케이션 전체를 멈출 수는 없습니다. 비동기 코드는 **나중에 도착할 결과를 어떻게 이어서 처리할지** 표현합니다.

## 비유: 음식 주문표

> **비유**  
> 음식을 주문하면 즉시 음식 대신 주문표를 받습니다. 주문표는 아직 조리 중인지, 완성됐는지, 실패했는지를 나중에 알려줍니다. Promise는 미래의 결과를 나타내는 주문표와 비슷합니다.

정확히는 Promise는 비동기 작업의 최종 완료 또는 실패와 그 결과 값을 나타내는 객체입니다. `await`는 주문이 끝날 때까지 프로그램 전체를 멈추는 것이 아니라, 현재 `async` 함수의 나머지 실행을 잠시 미룹니다.

## 정확한 설명

### 동기와 비동기

동기 코드는 앞의 작업이 끝난 뒤 다음 문장을 실행합니다.

```javascript
console.log("A");
console.log("B");
```

비동기 작업은 시작한 뒤 결과가 준비되었을 때 처리할 함수를 등록할 수 있습니다.

```javascript
console.log("시작");

setTimeout(() => {
  console.log("타이머 완료");
}, 0);

console.log("끝");
```

일반적인 출력 순서는 `시작 → 끝 → 타이머 완료`입니다. `0`밀리초는 콜백을 현재 실행 중인 코드보다 먼저 즉시 실행하라는 뜻이 아니라, 타이머 조건이 충족된 뒤 실행 대기열에 들어갈 수 있음을 뜻합니다.

### Promise의 상태

Promise는 다음 상태를 가집니다.

```text
pending(대기)
├─ fulfilled(이행): 결과 값 준비
└─ rejected(거부): 오류 이유 준비
```

한 번 이행되거나 거부된 Promise의 최종 상태는 다시 바뀌지 않습니다.

```javascript
const promise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve("작업 성공");
  } else {
    reject(new Error("작업 실패"));
  }
});
```

### Promise 체이닝

```javascript
promise
  .then((result) => {
    console.log(result);
    return "다음 값";
  })
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.error(error.message);
  })
  .finally(() => {
    console.log("작업 종료");
  });
```

- `then()`은 앞 Promise의 성공 값을 받아 처리합니다.
- `then()`의 반환값은 다음 체인의 성공 값이 됩니다.
- 처리 중 `throw`된 오류나 거부는 가까운 `catch()`로 전달됩니다.
- `catch()`에서 값을 반환하면 오류를 처리한 뒤 성공 흐름으로 체이닝을 이어갈 수 있습니다.
- `finally()`는 성공과 실패 여부에 관계없이 정리 작업을 실행하며, 결과 값을 변환하기 위한 용도로 사용하지 않습니다.

`then()`의 콜백 매개변수는 한 개지만 그 한 값이 배열일 수 있습니다.

```javascript
Promise.all([Promise.resolve(10), Promise.resolve(20)])
  .then(([first, second]) => {
    console.log(first + second); // 30
  });
```

`Promise.all()`은 전달받은 이터러블의 모든 작업이 이행되면 결과 배열로 이행하고, 하나라도 거부되면 그 이유로 거부됩니다.

### `async`와 `await`

`async` 함수는 호출할 때 항상 Promise를 반환합니다.

```javascript
async function getNumber() {
  return 10;
}

getNumber().then((number) => console.log(number));
```

`await`는 Promise가 처리될 때까지 현재 `async` 함수의 뒤쪽 실행을 미루고, 이행 값으로 계속 진행합니다.

```javascript
async function printNumber() {
  const number = await Promise.resolve(10);
  console.log(number);
}
```

거부된 Promise를 `await`하면 예외가 발생한 것처럼 처리되므로 `try...catch`를 사용할 수 있습니다.

```javascript
async function run() {
  try {
    const result = await Promise.resolve("완료");
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    console.log("종료");
  }
}
```

### 독립적인 작업을 함께 시작하기

서로 결과에 의존하지 않는 요청은 먼저 함께 시작하고 `Promise.all()`로 기다릴 수 있습니다.

```javascript
async function loadSummary() {
  const userRequest = fetch("/api/user/1");
  const postsRequest = fetch("/api/posts?userId=1");

  const [userResponse, postsResponse] = await Promise.all([
    userRequest,
    postsRequest,
  ]);

  return { userResponse, postsResponse };
}
```

두 번째 요청에 첫 번째 결과가 필요하다면 순차적으로 `await`해야 합니다. 무조건 병렬 처리하는 것이 정답은 아닙니다.

### `fetch()`의 흐름

`fetch()`는 HTTP 요청을 시작하고 `Response`로 이행하는 Promise를 반환합니다.

```javascript
async function getPosts() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  const posts = await response.json();
  return posts;
}
```

중요한 점은 서버가 `404`나 `500` 같은 HTTP 오류 상태를 보내도 `fetch()` Promise가 보통 자동으로 거부되지 않는다는 것입니다. 네트워크 요청 자체의 실패와 HTTP 오류 응답은 다르므로 `response.ok` 또는 `response.status`를 확인해야 합니다.

`response.json()`도 응답 본문을 읽고 JSON을 해석하는 비동기 작업이므로 Promise를 반환합니다.

### Promise 체이닝으로 같은 요청 작성하기

```javascript
function getPosts() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
      }

      return response.json();
    })
    .then((posts) => posts)
    .catch((error) => {
      console.error(error.message);
      throw error;
    });
}
```

`response.json()`을 `return`해야 다음 `then()`이 JSON 변환 완료 후의 데이터를 받습니다.

## 실행 흐름

```javascript
async function getCompletedTodoTitles(userId) {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}/todos`,
    );

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const todos = await response.json();

    todos
      .filter((todo) => todo.completed)
      .forEach((todo) => {
        console.log(`Completed Todo: ${todo.title}`);
      });
  } catch (error) {
    console.error(error.message);
  }
}
```

1. `async` 함수를 호출하면 Promise가 반환됩니다.
2. `fetch()`가 요청을 시작하고 `await`에서 함수의 나머지 실행이 잠시 미뤄집니다.
3. 응답이 오면 `response.ok`를 확인합니다.
4. 오류 상태이면 `throw`하고 `catch`로 이동합니다.
5. 성공 상태이면 `response.json()`의 완료를 기다립니다.
6. 배열에서 완료된 할 일만 `filter()`로 선택합니다.
7. `forEach()`로 제목을 하나씩 출력합니다.
8. 어느 단계에서든 잡을 수 있는 오류가 발생하면 `catch`가 처리합니다.

## 최소 코드

```javascript
async function loadUser() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users/1",
    );

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const user = await response.json();
    console.log(user.name);
  } catch (error) {
    console.error(error.message);
  }
}

loadUser();
```

## 흔한 실수

### 1. `Promise.all()`에 배열을 전달하지 않기

```javascript
await Promise.all([promiseA, promiseB]); // 올바른 기본 형태
```

`Promise.all(promiseA, promiseB)`처럼 여러 인수를 직접 전달하는 메서드가 아닙니다.

### 2. `response.json()`의 Promise를 기다리지 않기

```javascript
const data = await response.json();
```

`response.json()`은 즉시 최종 객체를 반환하는 동기 함수가 아닙니다.

### 3. `response.ok`를 검사하지 않기

`fetch()`가 이행됐다는 사실만으로 HTTP 요청이 성공 상태라는 뜻은 아닙니다.

### 4. 체이닝에서 값을 반환하지 않기

```javascript
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => console.log(data));
```

첫 `then()`이 JSON Promise를 반환해야 다음 단계가 변환 결과를 기다립니다.

### 5. `resolve()` 뒤의 `reject()`도 실행 결과를 바꾼다고 생각하기

Promise는 처음 이행 또는 거부된 상태로 확정됩니다. 두 함수를 차례로 호출하는 코드는 의미가 없고, 조건에 따라 하나만 호출해야 합니다.

### 6. `catch` 문법을 콜백처럼 쓰기

```javascript
try {
  // 작업
} catch (error) {
  console.error(error);
}
```

`catch { (error) => { ... } }` 형태가 아닙니다.

### 7. `return` 뒤에 코드를 작성하기

함수에서 `return`이 실행되면 그 아래 문장은 실행되지 않습니다. 출력이나 화면 반영이 필요하다면 `return`보다 먼저 하거나 호출한 곳에서 반환값을 처리합니다.

### 8. 독립 요청을 무조건 순차 실행하기

두 요청이 서로 의존하지 않으면 `Promise.all()`로 함께 시작할 수 있습니다. 다만 하나라도 실패하면 전체가 거부되는 특성도 함께 고려해야 합니다.

## 확인 문제

1. Promise의 세 가지 상태를 설명해 보세요.
2. `async` 함수가 일반 값을 `return`하면 호출한 곳에서는 무엇을 받나요?
3. `await`가 프로그램 전체를 멈추는 것이 아니라는 뜻을 설명해 보세요.
4. `fetch()`가 받은 HTTP 404 응답을 직접 검사해야 하는 이유는 무엇인가요?
5. `response.json()` 앞에 `await`가 필요한 이유는 무엇인가요?
6. 두 독립 요청을 `Promise.all()`로 처리할 때 얻는 장점과 주의점을 하나씩 적어 보세요.
