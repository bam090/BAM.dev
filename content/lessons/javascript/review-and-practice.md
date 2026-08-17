# 07. 복습과 실습

## 학습 목표

- 값에서 화면까지 이어지는 JavaScript의 전체 데이터 흐름을 설명할 수 있습니다.
- 요구사항을 입력, 처리, 출력의 작은 단계로 나눌 수 있습니다.
- 배열·객체, DOM·이벤트, 비동기 요청을 연결한 코드를 스스로 설계할 수 있습니다.
- 실행 전에 예상 결과를 적고, 오류가 생긴 단계를 좁혀 확인할 수 있습니다.

## 왜 필요한가

문법을 각각 알고 있어도 실제 기능을 만들 때 무엇부터 작성해야 하는지 막힐 수 있습니다. 기능 구현은 새로운 문법을 많이 쓰는 일이 아니라, 이미 배운 개념을 **데이터의 이동 순서**에 맞게 연결하는 일입니다.

## 비유: 택배 분류 과정

> **비유**  
> 프로그램은 택배를 처리하는 과정과 비슷합니다. 먼저 들어온 물건을 확인하고(입력), 목적에 따라 분류하고 포장한 뒤(처리), 알맞은 곳에 보냅니다(출력). 문제가 생기면 전체 창고를 무작정 고치는 대신 어느 단계에서 멈췄는지 확인합니다.

실제 코드에서는 입력이 함수 인수, 폼 값, API 응답일 수 있고, 출력이 반환값, 콘솔, DOM 변경일 수 있습니다.

## 정확한 설명

### 기능을 세 단계로 나누기

예를 들어 “완료된 할 일의 제목을 화면에 보여 주세요”라는 요구사항은 다음처럼 나눕니다.

```text
입력
└─ 할 일 객체가 든 배열

처리
├─ completed가 true인 객체 선택: filter()
└─ 각 객체의 title 추출: map()

출력
└─ DOM 요소를 만들어 목록에 추가
```

복잡한 기능도 먼저 다음 질문에 답하면 구조가 보입니다.

1. 입력값의 타입과 모양은 무엇인가요?
2. 어떤 조건을 검사해야 하나요?
3. 원본 데이터를 바꿔야 하나요, 새 결과를 만들어야 하나요?
4. 최종 결과는 반환, 저장, 출력 중 어디로 가나요?
5. 비동기 작업이라면 언제 결과가 준비되나요?

### 데이터와 화면은 서로 다른 상태

배열에 값을 추가해도 DOM 화면이 자동으로 바뀌지는 않습니다.

```text
JavaScript 데이터 변경
≠
DOM 자동 변경
```

데이터가 바뀐 뒤 화면을 다시 그리는 함수를 호출해야 합니다.

```javascript
const todos = [];
let nextTodoId = 1;

function createTodo(title) {
  const todo = { id: nextTodoId, title, completed: false };
  nextTodoId += 1;
  return todo;
}

function addTodo(title) {
  todos.push(createTodo(title));
  renderTodos();
}
```

`Date.now()`만 ID로 사용하면 같은 밀리초에 추가된 항목의 ID가 겹칠 수 있습니다. 이 로컬 세션 예제는 하나씩 증가하는 카운터로 ID를 만들기 때문에 연속해서 추가해도 항목을 구분할 수 있습니다.

반대로 DOM만 바꾸고 배열을 바꾸지 않으면 다음 렌더링에서 변경 내용이 사라질 수 있습니다. 애플리케이션에서 어떤 데이터를 기준으로 화면을 만드는지 정해야 합니다.

### 오류를 단계별로 찾기

```text
1. 이벤트가 발생했나요?
2. 요소를 올바르게 선택했나요?
3. 입력값을 읽었나요?
4. 조건식 결과가 예상과 같은가요?
5. 배열·객체 모양이 예상과 같은가요?
6. 비동기 결과를 기다렸나요?
7. DOM 반영 함수를 호출했나요?
```

각 단계에서 필요한 최소 값만 `console.log()`로 확인합니다. 모든 값을 한꺼번에 출력하면 원인을 찾기 더 어려울 수 있습니다.

## 실행 흐름

다음 예제는 할 일 추가와 완료 상태 변경을 연결합니다.

```html
<form id="todo-form">
  <label for="todo-title">할 일</label>
  <input id="todo-title" name="title" />
  <button type="submit">추가</button>
</form>
<ul id="todo-list"></ul>
```

```javascript
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-title");
const list = document.querySelector("#todo-list");
const todos = [];
let nextTodoId = 1;

function createTodo(title) {
  const todo = { id: nextTodoId, title, completed: false };
  nextTodoId += 1;
  return todo;
}

function toggleTodo(id) {
  const todo = todos.find((currentTodo) => currentTodo.id === id);
  if (!todo) return false;

  todo.completed = !todo.completed;
  return true;
}

function renderTodos() {
  list.textContent = "";

  todos.forEach((todo) => {
    const item = document.createElement("li");
    const status = document.createElement("span");
    const toggleButton = document.createElement("button");
    const actionLabel = todo.completed ? "미완료로 변경" : "완료로 변경";

    status.textContent = todo.completed ? `완료: ${todo.title}` : todo.title;
    toggleButton.type = "button";
    toggleButton.dataset.action = "toggle";
    toggleButton.dataset.id = String(todo.id);
    toggleButton.setAttribute(
      "aria-label",
      `${todo.title} ${actionLabel}`,
    );
    toggleButton.textContent = actionLabel;

    item.append(status, " ", toggleButton);
    list.append(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const title = (formData.get("title") ?? "").trim();
  if (!title) return;

  todos.push(createTodo(title));
  event.currentTarget.reset();
  input.focus();
  renderTodos();
});

list.addEventListener("click", (event) => {
  const toggleButton = event.target.closest('[data-action="toggle"]');
  if (!toggleButton || !list.contains(toggleButton)) return;

  const id = Number(toggleButton.dataset.id);

  if (toggleTodo(id)) renderTodos();
});
```

1. 페이지를 읽을 때 요소, 빈 배열과 세션 ID 카운터를 준비하고 이벤트를 등록합니다.
2. 폼을 제출하면 기본 이동을 막고 제목을 읽습니다.
3. 빈 값이 아니면 `createTodo()`로 고유한 ID를 가진 할 일 객체를 배열에 추가합니다.
4. 입력창을 초기화하고 `renderTodos()`를 호출합니다.
5. 렌더 함수는 현재 배열을 기준으로 상태 문구와 항목별 이름을 가진 토글 버튼을 만듭니다.
6. 목록의 위임 리스너는 실제로 활성화된 토글 버튼의 `dataset.id`를 읽습니다.
7. `toggleTodo()`가 해당 객체의 `completed`만 바꾸면 다시 렌더링합니다.

## 최소 코드

배운 개념을 가장 작게 연결하면 다음과 같습니다.

```javascript
const numbers = [1, 2, 3, 4];

function getEvenSquares(values) {
  return values
    .filter((value) => value % 2 === 0)
    .map((value) => value * value);
}

console.log(getEvenSquares(numbers)); // [4, 16]
```

```text
배열 입력
→ 함수 호출
→ 조건에 맞는 값 선택
→ 값 변환
→ 새 배열 반환
```

## 실습 1. 값과 제어 흐름

### 요구사항

숫자 배열을 받아 양수만 더한 값을 반환하는 `sumPositiveNumbers()`를 작성하세요.

```javascript
const numbers = [-2, 3, 0, 5, -1];
console.log(sumPositiveNumbers(numbers)); // 8
```

### 풀이 방향

1. 합계를 `0`으로 시작합니다.
2. `for...of`로 숫자를 하나씩 읽습니다.
3. 숫자가 `0`보다 클 때만 합계에 더합니다.
4. 반복이 끝난 뒤 합계를 반환합니다.

### 스스로 확인할 것

- `return`이 반복문 안에 들어가 첫 번째 값에서 끝나지 않았나요?
- 입력 배열을 비워도 `0`을 반환하나요?

## 실습 2. 배열과 객체

### 요구사항

사용자 배열에서 활성 상태인 사용자의 이름만 새 배열로 반환하세요. 원본 배열은 바꾸지 않습니다.

```javascript
const users = [
  { id: 1, name: "Bam", active: true },
  { id: 2, name: "Night", active: false },
  { id: 3, name: "Moon", active: true },
];

console.log(getActiveUserNames(users)); // ["Bam", "Moon"]
```

### 풀이 방향

```text
사용자 객체 배열
→ filter(): active가 true인 객체
→ map(): 각 객체의 name
→ 이름 배열 반환
```

### 스스로 확인할 것

- `filter()`의 콜백이 boolean으로 평가될 값을 반환하나요?
- `map()`의 콜백에서 `name`을 반환했나요?

## 실습 3. DOM과 이벤트

### 요구사항

보이는 `<label>`이 연결된 입력창에 문자열을 입력하고 폼을 제출하면 목록에 항목을 추가하세요.

- 공백만 입력하면 추가하지 않습니다.
- 추가 후 입력창을 비웁니다.
- Enter 또는 추가 버튼으로 같은 `<form>`의 `submit` 흐름을 실행합니다.
- 각 항목에 `<button type="button">` 삭제 버튼을 만들고, `aria-label`에는 항목 이름을 포함합니다.
- 목록의 위임 리스너에서 삭제 버튼을 활성화한 항목만 삭제합니다.
- 사용자 입력은 `textContent`로 넣습니다.

### 풀이 방향

```text
초기화
→ form, input, ul을 한 번씩 선택

폼 submit
→ preventDefault()
→ value 읽기
→ trim()
→ 빈 값 검사
→ li, span, 삭제 button 생성
→ span.textContent 설정
→ 삭제 button의 type, data-action, aria-label 설정
→ ul에 추가
→ form.reset() 후 입력창에 focus()

목록 클릭
→ event.target.closest()로 삭제 button 확인
→ button.closest("li")를 remove()
```

### 스스로 확인할 것

- 실제 HTML의 `id`와 선택자가 일치하나요?
- `<label for>`와 입력의 `id`가 일치하나요?
- `createElement("#li")`가 아니라 `createElement("li")`인가요?
- 반복되는 삭제 버튼의 접근 가능한 이름으로 대상을 구분할 수 있나요?
- `li` 클릭에만 의존하지 않고 네이티브 버튼을 사용했나요?

## 실습 4. Promise와 `fetch()`

### 요구사항

저장소의 로컬 fixture에서 할 일 목록을 가져와 완료된 항목의 제목을 출력하는 `printCompletedTodoTitles()`를 작성하세요.

```text
GET ./content/fixtures/javascript/todos.json
```

- `async/await`와 `try...catch`를 사용합니다.
- `response.ok`가 거짓이면 상태 코드를 포함한 오류를 발생시킵니다.
- JSON 변환 결과에서 `completed`가 `true`인 항목만 골라 `title`을 출력합니다.
- 외부 API나 인터넷 연결 없이 `npm run dev`의 로컬 주소에서 실행합니다.

### 뼈대 코드

```javascript
const TODO_FIXTURE_URL = "./content/fixtures/javascript/todos.json";

async function printCompletedTodoTitles() {
  try {
    // 1. TODO_FIXTURE_URL의 fetch() 결과 기다리기
    // 2. response.ok 검사하기
    // 3. response.json() 결과 기다리기
    // 4. 완료된 항목만 골라 title 출력하기
  } catch (error) {
    console.error(error.message);
  }
}
```

### 스스로 확인할 것

- 외부 주소 대신 `TODO_FIXTURE_URL`을 요청했나요?
- `response.json()`도 `await`했나요?
- 오류 검사보다 먼저 본문을 사용하고 있지는 않나요?
- fixture 경로의 `todos.json`을 존재하지 않는 이름으로 잠시 바꾸면 HTTP 오류 흐름으로 이동하나요?

## 실습 5. 종합 미니 기능

### 요구사항

게시글 목록을 불러와 검색어가 제목에 포함된 게시글만 화면에 출력하세요.

1. 페이지가 준비되면 게시글 API를 호출합니다.
2. 받은 배열을 변수에 보관합니다.
3. 검색 폼을 제출하면 기본 동작을 막습니다.
4. 검색어의 앞뒤 공백을 제거하고 소문자로 바꿉니다.
5. 제목에도 같은 변환을 적용한 뒤 `includes()`로 검사합니다.
6. 검색 결과를 렌더 함수에 전달합니다.
7. 결과가 없으면 “검색 결과가 없습니다.”를 표시합니다.

### 설계 표

| 구분 | 값 또는 함수 |
| --- | --- |
| 원본 데이터 | `posts` 배열 |
| 사용자 입력 | 검색 폼의 `query` 값 |
| 데이터 처리 | `filter()` |
| 항목 생성 | `createElement()`과 `textContent` |
| 화면 출력 | `renderPosts(list)` |
| 오류 처리 | `try...catch`, 오류 문구 표시 |

### 먼저 작성할 함수

```javascript
async function loadPosts() { /* 요청과 오류 처리 */ }
function filterPosts(posts, query) { /* 순수한 데이터 가공 */ }
function renderPosts(posts) { /* DOM 출력 */ }
```

데이터 요청, 데이터 가공, DOM 출력을 나누면 각 함수가 한 가지 책임에 집중하고 오류 위치도 찾기 쉬워집니다.

## 흔한 실수

### 1. 요구사항을 읽자마자 반복문부터 작성하기

입력과 출력의 모양을 먼저 적지 않으면 무엇을 반복해야 하는지 모호해집니다. 예시 데이터를 직접 한 번 손으로 처리한 뒤 반복 규칙을 찾습니다.

### 2. 데이터 변경 후 렌더링하지 않기

배열에 `push()`한 사실만으로 화면은 바뀌지 않습니다. 데이터 변경 뒤 렌더 함수를 호출합니다.

### 3. 렌더 함수가 데이터를 다시 변경하기

렌더 함수는 가능한 한 전달받은 데이터를 화면에 표현하는 일에 집중합니다. 출력 과정에서 원본 배열을 예상치 않게 정렬하거나 삭제하지 않도록 주의합니다.

### 4. 모든 코드를 이벤트 함수 하나에 넣기

입력 읽기, 데이터 검증, 저장, 렌더링을 작은 함수로 나누면 각 단계의 입력과 반환값을 확인하기 쉬워집니다.

### 5. 콘솔 출력만 보고 기능이 완성됐다고 생각하기

콘솔로 데이터를 확인한 다음에는 요구사항의 최종 출력 위치가 반환값인지 DOM인지 확인해야 합니다.

### 6. 비동기 함수의 결과를 일반 값처럼 즉시 사용하기

`async` 함수의 호출 결과는 Promise입니다. `await`하거나 `then()`으로 처리해야 최종 값을 사용할 수 있습니다.

## 확인 문제

1. 기능을 입력, 처리, 출력으로 나누면 어떤 점이 좋아지나요?
2. 배열에 객체를 추가한 뒤 화면이 자동으로 바뀌지 않는 이유는 무엇인가요?
3. 데이터 처리 함수와 DOM 렌더 함수를 나누면 어떤 오류를 더 쉽게 찾을 수 있나요?
4. 서버 요청에서 성공한 데이터와 오류를 각각 어느 흐름으로 보내야 하나요?
5. 다음 기능을 말로 설계해 보세요: “로그인 버튼을 누르면 입력값을 검사하고, 성공하면 사용자 이름을 헤더에 표시한다.”

## 최종 복습 체크리스트

- [ ] 원시 타입과 객체를 구분할 수 있습니다.
- [ ] `const`와 `let`의 선택 이유를 설명할 수 있습니다.
- [ ] 조건식과 반복문의 실행 순서를 말할 수 있습니다.
- [ ] 함수의 입력, 반환값, 스코프를 설명할 수 있습니다.
- [ ] 배열 메서드의 반환값과 원본 변경 여부를 확인합니다.
- [ ] DOM 요소가 없을 때 `null`이 될 수 있음을 알고 있습니다.
- [ ] 이벤트의 `target`과 `currentTarget`을 구분합니다.
- [ ] Promise 체이닝에서 값을 다음 단계로 반환할 수 있습니다.
- [ ] `async` 함수가 Promise를 반환한다는 것을 알고 있습니다.
- [ ] `fetch()` 뒤에 `response.ok`와 `response.json()`을 각각 처리합니다.
