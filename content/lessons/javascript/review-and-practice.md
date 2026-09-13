# 07. 복습과 실습

## 학습 목표

- 값에서 화면까지 이어지는 JavaScript의 전체 데이터 흐름을 설명할 수 있습니다.
- 요구사항을 입력, 처리, 출력의 작은 단계로 나눌 수 있습니다.
- 배열·객체, DOM·이벤트, 비동기 요청을 연결한 코드를 스스로 설계할 수 있습니다.
- 실행 전에 예상 결과를 적고, 오류가 생긴 단계를 좁혀 확인할 수 있습니다.

## 왜 필요한가

문법을 각각 알아도 실제 기능을 만들 때 무엇부터 작성할지 막힐 수 있습니다.
기능 구현은 새 문법을 많이 쓰는 일이 아니라, 배운 개념을 **데이터가 이동하는 순서**에 맞게 연결하는 일입니다.

## 입력·처리·출력으로 나누기

“완료된 할 일의 제목을 화면에 보여 주세요”라는 요구사항을 세 단계로 나눠 봅시다.

```text
입력: 할 일 객체가 든 배열
→ 처리: filter()로 완료 항목 선택, map()으로 제목 추출
→ 출력: DOM 목록에 제목 표시
```

코드를 쓰기 전에 다음을 적으면 해야 할 일이 선명해집니다.

1. 입력값은 무엇이고 어떤 모양인가요?
2. 어떤 조건과 계산이 필요한가요?
3. 처리 결과는 무엇인가요?
4. 최종 결과를 어디에 보여 주나요?
5. 비동기 작업이라면 언제 결과가 준비되나요?

## 데이터와 화면 연결하기

JavaScript 객체의 값을 바꿔도 DOM 화면은 자동으로 바뀌지 않습니다.
반대로 화면의 글자만 바꾸면 원본 데이터는 그대로입니다.
기준 데이터를 먼저 바꾸고 그 데이터로 화면을 다시 그립니다.
이렇게 데이터에 맞춰 화면을 그리는 일을 **렌더링**이라고 합니다.

```html
<button id="point-button" type="button">1점 추가</button>
<output id="point-output"></output>
```

```javascript
const button = document.querySelector("#point-button");
const output = document.querySelector("#point-output");
const profile = { points: 10 };

function renderProfile() {
  output.textContent = String(profile.points);
}

button.addEventListener("click", () => {
  profile.points += 1;
  renderProfile();
});

renderProfile();
```

클릭할 때 `output.textContent = "11"`만 실행하면 화면과 `profile.points`가 서로 다른 값이 됩니다.
다음 렌더링에서 화면이 다시 `10`으로 돌아갈 수 있습니다.

## 오류를 단계별로 찾기

처음부터 모든 코드를 다시 보지 말고 데이터가 이동하는 경계를 차례로 확인합니다.

```text
1. 이벤트가 발생했나요?
2. 입력값을 올바르게 읽었나요?
3. 처리 함수가 예상 결과를 반환했나요?
4. 그 결과를 출력 함수가 올바른 DOM 요소에 표시했나요?
```

앞 단계가 정상이라는 증거가 있으면 다음 단계부터 확인합니다.
예를 들어 클릭 로그, 입력값, 계산 결과까지 맞는데 화면만 이전 값이라면 렌더 함수의 호출과 대상 요소를 확인합니다.

## 실행 흐름

다음 예제는 할 일을 데이터에 추가하고, 완료 상태를 바꾼 뒤 현재 데이터로 화면을 다시 그립니다.

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
  const todo = { id: nextTodoId, title: title, completed: false };
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
  const titleValue = formData.get("title");
  if (typeof titleValue !== "string") return;

  const title = titleValue.trim();
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

1. 폼 제출에서 제목을 읽어 할 일 객체를 배열에 넣습니다.
2. `renderTodos()`가 현재 배열로 목록을 다시 만듭니다.
3. 토글 버튼은 바꿀 항목의 ID를 `dataset`에 보관합니다.
4. 목록의 위임 리스너가 `list.contains()`로 찾은 버튼이 이 목록 안에 있는지 확인하고, ID에 맞는 객체의 상태를 바꿉니다.
5. 상태가 바뀌면 다시 렌더링해 데이터와 화면을 맞춥니다.

## 최소 코드

```javascript
const numbers = [1, 2, 3, 4];

function getEvenSquares(values) {
  return values
    .filter((value) => value % 2 === 0)
    .map((value) => value * value);
}

console.log(getEvenSquares(numbers)); // [4, 16]
```

입력 배열이 함수에 들어가고, 선택과 변환을 거쳐 새 배열로 반환됩니다.

## 실습 1. 값과 제어 흐름

숫자 배열에서 양수만 더해 반환하는 `sumPositiveNumbers()`를 작성하세요.

```javascript
const numbers = [-2, 3, 0, 5, -1];
console.log(sumPositiveNumbers(numbers)); // 8
```

확인할 점:

- 합계는 `0`에서 시작하나요?
- `return`이 반복문 밖에 있나요?
- 빈 배열을 넣으면 `0`을 반환하나요?

## 실습 2. 배열과 객체

사용자 배열에서 `active`가 `true`인 사용자의 이름만 새 배열로 반환하세요.
원본 배열은 바꾸지 않습니다.

```javascript
const users = [
  { id: 1, name: "Bam", active: true },
  { id: 2, name: "Night", active: false },
  { id: 3, name: "Moon", active: true },
];

console.log(getActiveUserNames(users)); // ["Bam", "Moon"]
```

`filter()`로 객체를 고른 뒤 `map()`으로 이름을 꺼내는 순서를 생각해 보세요.

## 실습 3. DOM과 이벤트

보이는 `<label>`이 연결된 입력창에 문자열을 입력하고 폼을 제출하면 목록에 항목을 추가하세요.

- 공백만 입력하면 추가하지 않습니다.
- Enter 또는 추가 버튼으로 같은 `<form>`의 `submit` 흐름을 실행합니다.
- 각 항목에 `<button type="button">` 삭제 버튼을 만듭니다.
- `aria-label`에는 항목 이름을 포함합니다.
- 목록의 위임 리스너에서 `event.target.closest()`로 삭제 버튼을 찾습니다.
- 사용자 입력은 `textContent`로 표시합니다.

확인 순서:

```text
요소 선택 → submit 등록 → 입력 확인 → 요소 생성 → 목록에 추가
→ 위임된 click에서 삭제 버튼 확인 → 해당 항목 삭제
```

## 실습 4. Promise와 `fetch()`

저장소의 연습용 JSON 파일에서 할 일 목록을 가져와 완료된 항목의 제목을 출력하는 `printCompletedTodoTitles()`를 작성하세요.

`GET`은 지정한 데이터를 읽어 오도록 요청하는 HTTP 방식입니다.

```text
GET ./content/fixtures/javascript/todos.json
```

- `async/await`와 `try...catch`를 사용합니다.
- `response.ok`가 거짓이면 상태 코드를 포함한 오류를 발생시킵니다.
- `response.json()`도 기다립니다.
- 외부 API나 인터넷 연결 없이 `npm run dev`의 로컬 주소에서 실행합니다.

```javascript
const TODO_FIXTURE_URL = "./content/fixtures/javascript/todos.json";

async function printCompletedTodoTitles() {
  try {
    // 요청 → HTTP 상태 확인 → JSON 변환 → 완료 항목 선택 → 제목 출력
  } catch (error) {
    console.error(error.message);
  }
}
```

## 실습 5. 종합 미니 기능

같은 할 일 JSON 파일을 불러와 검색어가 제목에 포함된 항목만 화면에 표시하세요.
이 실습은 앞의 네 실습이 익숙해진 뒤 진행합니다.

```text
로컬 할 일 요청
→ 원본 배열 저장
→ 검색 폼에서 검색어 읽기
→ filter()로 제목 검색
→ renderTodos(filteredTodos)로 화면 출력
```

기능을 세 함수로 나누어 보세요.

문자열의 `includes()`는 검색어가 들어 있으면 `true`를 반환합니다.
필터 조건은 `todo.title.includes(query)`처럼 작성할 수 있습니다.

```javascript
async function loadTodos() { /* 요청과 오류 처리 */ }
function filterTodos(todos, query) { /* 데이터 처리 */ }
function renderTodos(todos) { /* DOM 출력 */ }
```

## 흔한 실수

### 1. 입력과 출력을 정하지 않고 코드부터 쓰기

예시 데이터를 손으로 한 번 처리하고 입력·처리·출력의 모양을 먼저 적습니다.

### 2. 화면만 바꾸거나 데이터만 바꾸기

기준 데이터를 바꾼 뒤 그 데이터로 렌더 함수를 호출합니다.

### 3. 모든 코드를 이벤트 함수 하나에 넣기

입력 읽기, 데이터 처리, 화면 출력을 작은 함수로 나누면 각 단계의 값을 확인하기 쉽습니다.

### 4. 이미 확인한 단계부터 다시 조사하기

정상임을 확인한 다음 경계부터 조사합니다.
계산 결과까지 맞다면 출력 함수와 DOM 대상부터 확인합니다.

## 확인 포인트

1. 요구사항을 입력·처리·출력으로 나눴나요?
2. 실행 전에 예시 입력의 예상 결과를 적었나요?
3. 기준 데이터를 먼저 바꾸고 화면을 다시 그리나요?
4. 오류가 발생한 단계의 앞뒤 값을 확인했나요?
5. DOM과 비동기 코드를 각각 작은 함수로 나눴나요?

## 확인 문제

1. 기능을 입력·처리·출력으로 나누면 무엇이 쉬워지나요?
2. 데이터만 바꾸거나 DOM만 바꿀 때 어떤 문제가 생길 수 있나요?
3. 버튼을 눌렀는데 첫 번째 클릭 로그조차 없다면 어느 단계부터 확인해야 하나요?
4. “검색어로 할 일 제목을 찾아 화면에 표시한다”를 코드 없이 단계로 나눠 보세요.

## 최종 복습 체크리스트

- [ ] 값과 타입, `const`와 `let`의 차이를 설명할 수 있습니다.
- [ ] 조건과 반복의 실행 흐름을 예상할 수 있습니다.
- [ ] 함수의 입력과 반환값, 스코프를 설명할 수 있습니다.
- [ ] 배열과 객체를 구분하고 배열 메서드의 반환값을 확인합니다.
- [ ] DOM 요소를 선택하고 이벤트로 화면을 바꿀 수 있습니다.
- [ ] Promise와 `await`, `fetch()`의 흐름을 설명할 수 있습니다.
- [ ] 오류가 생긴 단계를 입력부터 출력까지 좁혀 확인할 수 있습니다.

## 공식 자료

- [MDN: JavaScript 안내서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN: String.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)
- [MDN: HTTP GET 메서드](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET)
- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

공식 자료 확인일: 2026-08-18

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

기능을 입력, 처리, 출력으로 나누면 각 단계의 역할과 데이터가 이동하는 경계가 분명해집니다.
그래서 기능을 작은 단위로 구현하고, 오류가 생긴 단계를 순서대로 좁혀 확인하기 쉬워집니다.

### 답변 2

데이터만 바꾸고 DOM을 다시 그리지 않으면 화면에 예전 값이 남을 수 있습니다.
DOM만 바꾸면 기준 데이터와 화면이 달라져 다음 렌더링에서 화면이 이전 값으로 돌아갈 수 있습니다.

### 답변 3

첫 번째 클릭 로그조차 없다면 입력인 이벤트 단계부터 확인합니다.
대상 요소를 올바르게 찾았는지, 리스너가 등록됐는지, 클릭 시 그 함수가 실행되는지를 순서대로 확인합니다.

### 답변 4

먼저 입력 요소에서 검색어를 읽고 할 일 데이터를 준비합니다.
각 할 일의 제목에 검색어가 포함되는지 확인해 새 배열로 걸러냅니다.
기존 목록을 비운 뒤 걸러진 항목으로 요소를 만들어 화면에 추가합니다.
