# Promise와 async·await의 결과 연결

## 학습 목표

- Promise의 상태와 executor·반응 콜백의 실행 시점을 구분할 수 있습니다.
- then 콜백의 반환값·Promise·오류가 다음 단계로 이어지는 과정을 설명할 수 있습니다.
- async 함수가 반환하는 Promise를 await하거나 catch로 받아 결과와 실패를 처리할 수 있습니다.

## 먼저 확인할 개념

[함수의 입력과 반환](#/learn/javascript/wiki-function-return) · [함수 값과 동기 콜백](#/learn/javascript/wiki-callbacks) · [예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)를 먼저 확인합니다.

## async·await란

**async·await**는 시간이 걸리는 작업의 결과를 기다렸다가 그 결과로 다음 코드를 이어서 실행하게 해 주는 JavaScript 문법입니다.

서버에서 데이터를 받아오는 일처럼 시간이 걸리는 작업은 결과가 바로 나오지 않습니다.
그래서 JavaScript는 이런 작업을 시작만 해 두고 결과를 기다리지 않은 채 다음 코드로 넘어갑니다.
이렇게 결과가 나중에 도착하는 작업을 **비동기 작업**이라고 부릅니다.

비동기 작업은 결과 대신 "나중에 결과를 알려 주겠다"는 약속인 **Promise**를 먼저 돌려줍니다.
async·await를 쓰면 이 약속의 결과가 도착할 때까지 기다렸다가 받은 값을 일반 변수처럼 쓸 수 있습니다.

예를 들어 스터디 모임 앱이 서버에서 회원 목록을 받아와 화면에 보여 준다고 해 보겠습니다.
이 문서에서는 진짜 서버 대신 1초 타이머로 결과를 주는 함수를 사용하겠습니다.
타이머는 정확한 완료 시각을 보장하지 않으므로 실제 결과는 실행 환경에 따라 늦게 도착할 수 있습니다.
같은 함수 이름을 다시 정의하는 블록은 앞 정의를 바꾸어 실행하고 성공·실패 예제는 각각 실행합니다.

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

바로 출력하면 회원 이름 대신 아직 결과가 정해지지 않은(pending) Promise를 봅니다.
위 표시는 Node.js 콘솔의 예이며 브라우저에서는 표시 형식이나 객체를 펼친 시점에 따라 달라질 수 있습니다.
결과는 1초 뒤에야 도착하는데 `console.log`가 그보다 먼저 실행되었기 때문입니다.

회원 이름을 쓰려면 Promise 안의 결과가 도착할 때까지 기다려야 합니다.
이 기다리는 일을 맡는 것이 바로 async·await입니다.

## Promise는 나중 결과를 나타내는 객체다

**Promise**는 나중에 도착할 성공값이나 실패 이유를 나타내는 객체입니다.
회원 결과를 기다리는 동안과 결과가 도착한 뒤의 상태를 구분합니다.

| 상태 | 뜻 |
| --- | --- |
| `pending` | 아직 결과가 정해지지 않았습니다. |
| `fulfilled` | 성공값이 정해졌습니다. |
| `rejected` | 실패 이유가 정해졌습니다. |

fulfilled와 rejected를 합쳐 **settled**라고 합니다.
한 번 settled된 Promise는 다른 결과로 다시 바뀌지 않습니다.
다른 Promise의 결과를 따르도록 확정된 **resolved** 상태는 그 결과를 기다리는 동안 아직 pending일 수 있습니다.
따라서 resolved와 fulfilled는 항상 같은 뜻이 아닙니다.

Promise를 만드는 `new Promise(...)`에 전달한 함수를 **executor**라고 하며 이 함수는 즉시 실행됩니다.
반면 `.then()`의 반응 콜백은 현재 동기 코드가 끝난 뒤 실행됩니다.
같은 회원 조회에서 출력 순서를 먼저 예상해 봅니다.

```js
console.log("1. 시작");
const membersPromise = new Promise((resolve) => {
  console.log("2. executor 실행");
  resolve(loadMembers());
});
membersPromise.then((members) => {
  console.log(`4. then 실행: 회원 ${members.length}명`);
});
console.log("3. 현재 코드 끝");
```

```text
1. 시작
2. executor 실행
3. 현재 코드 끝
4. then 실행: 회원 3명
```

executor에서 `resolve(loadMembers())`를 호출하면 바깥 Promise가 회원 조회 Promise의 결과를 따릅니다.
이 시점에는 결과를 따르기로 정해졌지만 회원은 아직 도착하지 않았습니다.
Promise를 만들었다는 이유로 executor의 무거운 동기 계산이 나중으로 미뤄지는 것은 아닙니다.
그 계산은 여전히 현재 실행을 막습니다.

## `then()`은 다음 Promise를 만든다

`.then()`은 원래 Promise를 그대로 돌려주는 대신 새 Promise를 만듭니다.
콜백이 반환한 값이 다음 단계의 입력이 됩니다.
회원 수를 두 배의 준비 수량으로 바꾸었을 때 결과를 예상해 봅니다.

```js
loadMembers()
  .then((members) => members.length)
  .then((count) => count * 2)
  .then((count) => `${count}명분`)
  .then((label) => console.log(label));
```

```text
6명분
```

- 일반 값을 반환하면 다음 Promise가 그 값으로 fulfilled됩니다.
- Promise를 반환하면 다음 단계는 그 Promise의 결과를 기다립니다.
- 오류를 던지면 다음 Promise가 rejected됩니다.

회원 조회 다음에 출석 조회를 연결할 때도 같은 규칙을 사용합니다.

```js
function loadAttendance(name) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${name} 출석 12회`), 1000);
  });
}
```

중괄호가 있는 화살표 함수는 값을 자동으로 반환하지 않습니다.
다음 반례에서 두 번째 `then`이 받을 값을 예상해 봅니다.

```js
loadMembers()
  .then((members) => { loadAttendance(members[0]); })
  .then((attendance) => console.log(attendance));
```

```text
undefined
```

출석 조회를 시작했지만 그 Promise를 반환하지 않았습니다.
따라서 다음 단계는 출석 결과를 기다리지 않고 콜백의 반환값인 `undefined`를 받습니다.
이어질 값이나 Promise가 있으면 블록에서 `return`으로 전달합니다.
이 장면의 올바른 연결은 아래 `then과 await 비교`에서 확인합니다.

콜백에서 오류를 던졌을 때는 실패가 다음 Promise로 이어집니다.
같은 회원 결과를 받아도 아래 흐름은 성공 출력 대신 실패 처리를 실행합니다.

```js
loadMembers()
  .then(() => { throw new Error("회원 표시 실패"); })
  .catch((error) => console.log(error.message));
```

```text
회원 표시 실패
```

---

## async와 await의 역할

async·await는 이름처럼 두 키워드가 한 쌍으로 움직입니다.

| 키워드 | 붙이는 곳 | 하는 일 |
| --- | --- | --- |
| `async` | 함수 선언 앞 | 이 함수가 Promise를 돌려준다고 표시합니다. 함수 안에서 `await`를 쓸 수 있게 됩니다. |
| `await` | Promise 앞 | 결과가 도착할 때까지 그 async 함수를 잠시 멈춥니다. 도착한 결과를 값으로 꺼내 줍니다. |

이 문서의 일반 스크립트 예제에서는 `await`를 `async` 함수 안에 씁니다.
모듈에서는 예외적으로 최상위에서도 `await`를 사용할 수 있습니다.
또 `async` 함수는 숫자 하나를 `return`해도 호출한 쪽에는 항상 Promise로 전달됩니다.
이 점은 뒤에서 실패를 처리할 때 다시 중요해집니다.
같은 회원 수를 바로 반환하더라도 호출 결과가 숫자인지 Promise인지 먼저 예상해 봅니다.

```js
async function getMemberCount() {
  return 3;
}
const countResult = getMemberCount();
console.log(countResult instanceof Promise);
countResult.then((count) => console.log(count));
```

```text
true
3
```

`return 3`은 Promise가 전달할 성공값을 정합니다.
호출자는 `await`나 `then`으로 숫자 3을 받습니다.

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

앞에서 정의한 `loadAttendance()`를 그대로 사용합니다.

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

두 코드는 같은 결과를 내며 1초 타이머 두 개를 차례로 기다립니다.
실제로 이어지는 시각은 타이머와 실행 환경에 따라 달라질 수 있습니다.
차이는 읽는 방식에 있습니다.

| | `.then()` | `await` |
| --- | --- | --- |
| 코드 모양 | 결과를 받을 함수를 `.then()`에 넘겨 이어 붙입니다 | 일반 코드처럼 위에서 아래로 한 줄씩 씁니다 |
| 결과를 쓰는 곳 | 콜백의 매개변수로 받고 반환해 다음 콜백에 전달합니다 | 변수에 담아 다음 줄에서 바로 씁니다 |
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
반환한 Promise의 실패가 처리되지 않은 상태로 남습니다.
브라우저 콘솔에는 `Uncaught (in promise) Error: 서버에 연결하지 못했습니다`처럼 미처리 실패가 표시될 수 있습니다.
표시 형식은 실행 환경에 따라 달라지며 이 반례는 성공 예제와 따로 실행합니다.
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
`시간이_걸리는_작업()` 자리에 요청 코드가 들어갑니다.
`fetch`에서는 응답 상태·본문 읽기·자료 검증도 필요하므로 [fetch 응답의 실패 경계](#/learn/javascript/wiki-fetch)에서 이어서 확인합니다.

## 정리

- Promise의 상태와 executor의 즉시 실행을 구분하며 then 콜백은 현재 동기 코드 뒤에 실행됩니다.
- then은 새 Promise를 만들고 콜백의 반환값·Promise·오류를 다음 단계로 연결합니다.
- async 함수의 결과는 Promise이며 await로 기다리는 자리의 try·catch나 호출자의 catch로 실패를 받습니다.

## 이어서 연습하기

[비동기 화면의 진행 상태](#/learn/javascript/wiki-async-state)에서 불러오는 중·성공·실패를 화면 상태로 나누어 봅니다.

## 공식 자료

확인일: 2026-10-02입니다.

- [MDN: async function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/await)
- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)

## 핵심 질문 답

Promise는 pending에서 성공값이 정해진 fulfilled나 실패 이유가 정해진 rejected가 됩니다.
두 상태는 settled이며 한 번 정해진 결과는 다시 바뀌지 않습니다.
다른 Promise의 결과를 따르도록 resolved된 상태는 아직 pending일 수 있습니다.
executor는 즉시 실행하고 then의 반응 콜백은 현재 동기 코드 뒤에 실행합니다.
then은 새 Promise를 만들며 일반 반환값·반환한 Promise의 결과·던진 오류를 다음 단계에 연결합니다.
블록에서 return을 빠뜨리면 다음 단계는 그 작업을 기다리지 않고 undefined를 받습니다.
async 함수는 숫자를 반환해도 호출자에게 Promise를 돌려줍니다.
await는 그 함수의 실행을 잠시 멈추어 성공값을 받고 바깥 코드는 계속 실행됩니다.
실패한 Promise는 await하는 줄에서 오류로 전달되므로 그 줄을 try·catch로 감쌉니다.
호출하는 줄만 try로 감싸면 나중에 도착하는 실패를 받지 못하므로 호출자는 반환한 Promise에 catch를 붙일 수도 있습니다.
finally는 성공과 실패에 관계없이 로딩 표시를 끄는 등 마무리할 일을 처리합니다.
