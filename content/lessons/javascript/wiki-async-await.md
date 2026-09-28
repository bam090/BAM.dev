# async·await로 비동기 결과 기다리기

## 학습 목표

async 함수에서 await로 비동기 결과를 기다리고 실패를 try·catch로 처리할 수 있습니다.

## 한줄 요약

async·await는 Promise의 결과가 도착할 때까지 기다렸다가 다음 줄을 실행하게 해 주는 문법입니다.

## 먼저 확인할 개념

[Promise 상태와 반환 연결](#/learn/javascript/wiki-promise-chain) · [예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)

## async·await란

**async·await**는 시간이 걸리는 작업의 결과를 기다렸다가 그 결과로 다음 코드를 이어서 실행하게 해 주는 JavaScript 문법입니다.

서버에서 데이터를 받아오는 일처럼 시간이 걸리는 작업은 결과가 바로 나오지 않습니다.
그래서 JavaScript는 이런 작업을 시작만 해 두고 결과를 기다리지 않은 채 다음 코드로 넘어갑니다.
이렇게 결과가 나중에 도착하는 작업을 **비동기 작업**이라고 부릅니다.

비동기 작업은 결과 대신 "나중에 결과를 알려 주겠다"는 약속인 **Promise**를 먼저 돌려줍니다.
async·await를 쓰면 이 약속의 결과가 도착할 때까지 기다렸다가 받은 값을 일반 변수처럼 쓸 수 있습니다.

예를 들어 스터디 모임 앱이 서버에서 회원 목록을 받아와 화면에 보여 준다고 해 보겠습니다.
이 문서에서는 진짜 서버 대신 1초 뒤에 결과를 주는 함수를 사용하겠습니다.

```js
function loadMembers(serverIsDown = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (serverIsDown) {
        reject(new Error("서버에 연결하지 못했습니다"));
      } else {
        resolve(["민지", "도윤", "서아"]);
      }
    }, 1000);
  });
}
```

`loadMembers()`도 비동기 작업이라서 회원 목록 대신 Promise를 먼저 돌려줍니다.
`true`를 넘기면 서버가 멈춘 상황이 되어 1초 뒤에 실패합니다.

그렇다면 결과를 기다리지 않고 바로 출력하면 어떻게 될까요?
실행하기 전에 먼저 예상해 보세요.

```js
const members = loadMembers();
console.log(members);
```

```text
Promise { <pending> }
```

회원 이름 대신 아직 결과가 정해지지 않은(pending) Promise가 출력됩니다.
결과는 1초 뒤에야 도착하는데 `console.log`가 그보다 먼저 실행되었기 때문입니다.

회원 이름을 쓰려면 Promise 안의 결과가 도착할 때까지 기다려야 합니다.
이 기다리는 일을 맡는 것이 바로 async·await입니다.

## async와 await의 역할

async·await는 이름처럼 두 키워드가 한 쌍으로 움직입니다.

| 키워드 | 붙이는 곳 | 하는 일 |
| --- | --- | --- |
| `async` | 함수 선언 앞 | 이 함수가 Promise를 돌려준다고 표시합니다. 함수 안에서 `await`를 쓸 수 있게 됩니다. |
| `await` | Promise 앞 | 결과가 도착할 때까지 그 async 함수를 잠시 멈춥니다. 도착한 결과를 값으로 꺼내 줍니다. |

그래서 `await`는 `async`를 붙인 함수 안에서만 씁니다.
또 `async` 함수는 숫자 하나를 `return`해도 호출한 쪽에는 항상 Promise로 전달됩니다.
이 점은 뒤에서 실패를 처리할 때 다시 중요해집니다.

## async·await 사용법

이제 회원 목록을 받아와 출력하는 함수를 직접 만들어 보겠습니다.
순서는 세 단계입니다.

1. 결과를 기다릴 함수 앞에 `async`를 붙입니다.
2. Promise를 돌려주는 호출 앞에 `await`를 붙입니다.
3. 꺼낸 결과를 변수에 담아 다음 줄에서 씁니다.

```js
async function showMembers() {
  console.log("불러오는 중...");
  const members = await loadMembers();
  console.log(`회원 ${members.length}명: ${members.join(", ")}`);
}

showMembers();
console.log("다른 버튼도 계속 누를 수 있습니다.");
```

코드에 `console.log`가 세 번 나옵니다.
어떤 순서로 찍힐지 먼저 예상해 보세요.

```text
불러오는 중...
다른 버튼도 계속 누를 수 있습니다.
회원 3명: 민지, 도윤, 서아
```

맨 아래에 있는 `console.log`가 두 번째로 찍혔습니다.
시간 순서대로 그려 보면 이유가 보입니다.

![시간 흐름 그림. showMembers 줄에서 1번 불러오는 중이 먼저 찍히고 await에서 1초 동안 멈춥니다. 그동안 바깥 코드 줄에서 2번 다른 버튼도 계속 누를 수 있습니다가 바로 실행됩니다. 1초 뒤 결과가 도착하면 showMembers가 이어서 3번 회원 3명을 출력합니다.](content/assets/javascript/async-await-timeline.png)

`await`를 만나면 `showMembers()`는 그 줄에서 잠시 멈춥니다.
하지만 멈추는 것은 이 함수 하나뿐이고 바깥 코드는 기다리지 않고 계속 실행됩니다.
그러다 1초 뒤 결과가 도착하면 `showMembers()`가 멈췄던 줄부터 이어서 실행됩니다.
덕분에 목록을 기다리는 동안에도 사용자는 화면의 다른 버튼을 누를 수 있습니다.

## then과 await 비교

사실 Promise의 결과는 `await` 말고 `.then()`으로도 받을 수 있습니다.
두 방법의 차이는 기다릴 일이 두 번 이상 이어질 때 잘 드러납니다.

예를 들어 회원 목록을 받은 다음 첫 번째 회원의 출석 기록을 다시 받아온다고 해 보겠습니다.
출석 기록을 주는 `loadAttendance()`도 `loadMembers()`처럼 1초 뒤에 결과를 주는 함수입니다.

```js
function loadAttendance(name) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${name} 출석 12회`), 1000);
  });
}
```

먼저 `.then()`으로 쓰면 다음과 같습니다.

```js
loadMembers()
  .then((members) => loadAttendance(members[0]))
  .then((attendance) => {
    console.log(attendance);
  });
```

같은 일을 `await`로 쓰면 이렇게 바뀝니다.

```js
async function showFirstAttendance() {
  const members = await loadMembers();
  const attendance = await loadAttendance(members[0]);
  console.log(attendance);
}

showFirstAttendance();
```

```text
민지 출석 12회
```

두 코드는 같은 결과를 내고 둘 다 약 2초가 걸립니다.
차이는 읽는 방식에 있습니다.

| | `.then()` | `await` |
| --- | --- | --- |
| 코드 모양 | 결과를 받을 함수를 `.then()`에 넘겨 이어 붙입니다 | 일반 코드처럼 위에서 아래로 한 줄씩 씁니다 |
| 결과를 쓰는 곳 | 넘긴 함수의 매개변수 안에서만 씁니다 | 변수에 담아 다음 줄에서 바로 씁니다 |
| 실패 처리 | `.catch()`를 이어 붙입니다 | `try·catch`로 감쌉니다 |
| 잘 맞는 경우 | 결과를 한 번 받아 짧게 처리할 때 | 기다릴 일이 여러 번 이어질 때 |

둘 중 하나가 틀린 것은 아닙니다.
`await`도 결국 Promise를 기다리는 방법이라서 같은 Promise를 어느 쪽으로든 받을 수 있습니다.
다만 기다릴 일이 늘어날수록 `await` 쪽이 순서대로 읽기 쉽습니다.

## 실패 처리

지금까지는 결과가 잘 도착하는 경우만 봤습니다.
이번에는 서버가 멈춰서 실패가 도착하는 경우를 보겠습니다.

기다리던 작업이 실패하면 `await`한 줄에서 오류가 발생합니다.
그래서 평소처럼 `try·catch`로 감싸면 실패를 받을 수 있습니다.

```js
async function showMembers() {
  console.log("불러오는 중...");
  try {
    const members = await loadMembers(true);
    console.log(`회원 ${members.length}명`);
  } catch (error) {
    console.log(`불러오지 못했습니다: ${error.message}`);
  } finally {
    console.log("로딩 표시를 끕니다.");
  }
}

showMembers();
```

```text
불러오는 중...
불러오지 못했습니다: 서버에 연결하지 못했습니다
로딩 표시를 끕니다.
```

`await loadMembers(true)`에서 실패가 도착하면 바로 아래 줄은 건너뛰고 `catch`로 이동합니다.
`finally`는 성공하든 실패하든 마지막에 실행됩니다.
그래서 로딩 표시 끄기처럼 결과와 상관없이 항상 해야 하는 일을 `finally`에 둡니다.

여기서 한 가지 주의할 점이 있습니다.
`try`는 반드시 `await`하는 줄을 감싸야 합니다.
아래처럼 함수를 호출하는 줄만 감싸면 `catch`가 실행되지 않습니다.

```js
async function showMembers() {
  const members = await loadMembers(true);
  console.log(`회원 ${members.length}명`);
}

try {
  showMembers();
} catch (error) {
  console.log("여기서 잡았습니다.");
}
```

"여기서 잡았습니다."는 끝내 출력되지 않습니다.
대신 1초 뒤 브라우저 콘솔에 `Uncaught (in promise) Error: 서버에 연결하지 못했습니다` 오류만 표시됩니다.
두 경우를 시간 순서로 나란히 놓으면 차이가 분명해집니다.

![두 줄로 비교한 시간 흐름 그림. 위 줄은 호출하는 줄만 감싼 try로 try가 0초 무렵에 바로 끝나고 1초 뒤 실패가 도착했을 때는 받을 곳이 없습니다. 아래 줄은 await 줄을 감싼 try로 결과를 기다리는 동안 try가 계속 열려 있어 1초 뒤 도착한 실패를 catch가 받습니다.](content/assets/javascript/async-try-timeline.png)

호출은 Promise를 돌려주고 곧바로 끝나기 때문에 실패가 도착하기도 전에 `try`를 빠져나갑니다.
반면 `await`하는 줄을 감싸면 결과를 기다리는 동안 `try`가 계속 열려 있어서 늦게 도착한 실패도 받을 수 있습니다.

함수 안에서 실패를 처리하지 않았다면 호출한 쪽에서 받는 방법도 있습니다.
돌려받은 Promise에 `.catch()`를 붙이면 됩니다.

```js
showMembers().catch((error) => {
  console.log(`호출한 쪽에서 받았습니다: ${error.message}`);
});
```

```text
호출한 쪽에서 받았습니다: 서버에 연결하지 못했습니다
```

## async·await의 활용

서버에서 데이터를 받아와 화면에 보여 주는 곳이라면 async·await를 흔히 만납니다.
회원 목록·게시글·검색 결과처럼 받아오는 내용은 달라도 코드의 모양은 거의 같습니다.

```text
async function 화면에_보여_주기() {
  로딩 표시 켜기
  try {
    const 결과 = await 시간이_걸리는_작업();
    결과를 화면에 그리기
  } catch (error) {
    실패 메시지 보여 주기
  } finally {
    로딩 표시 끄기
  }
}
```

앞에서 만든 `showMembers()`도 이 모양을 그대로 따릅니다.
뒤에서 배울 `fetch`로 실제 서버에 요청할 때도 마찬가지입니다.
`시간이_걸리는_작업()` 자리에 `fetch(주소)`가 들어갈 뿐입니다.

## 정리

- `async`는 함수 앞에 붙이고 `await`는 Promise 앞에 붙입니다.
- `await`는 프로그램 전체가 아니라 그 async 함수 하나만 멈추고 바깥 코드는 계속 실행됩니다.
- 기다릴 일이 여러 번 이어지면 `.then()`보다 `await`가 위에서 아래로 읽기 쉽습니다.
- 실패는 `await`하는 줄을 `try·catch`로 감싸거나 호출한 쪽에서 `.catch()`로 받습니다.

## 이어서 연습하기

[비동기 화면의 진행 상태](#/learn/javascript/wiki-async-state)에서 불러오는 중·성공·실패를 화면 상태로 나누어 봅니다.

## 공식 자료

- [MDN: async function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/await)

## 핵심 질문 답

async 함수는 결과를 바로 주지 않고 Promise를 돌려줍니다.
그래서 결과는 `await`로 기다려서 받거나 `.then()`으로 받습니다.
실패도 나중에 도착하므로 호출하는 줄만 `try`로 감싸면 잡히지 않습니다.
`await`하는 줄을 `try·catch`로 감싸거나 호출한 쪽에서 돌려받은 Promise에 `.catch()`를 붙여서 받습니다.
