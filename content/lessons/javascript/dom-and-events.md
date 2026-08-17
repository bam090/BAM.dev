# 05. DOM과 이벤트

## 학습 목표

- DOM이 HTML 문서를 객체 구조로 표현한 것임을 설명할 수 있습니다.
- 요소를 선택하고 내용, 클래스, 속성을 변경할 수 있습니다.
- 요소를 생성한 뒤 실제 문서에 추가하는 과정을 이해합니다.
- 이벤트 객체의 `target`과 `currentTarget`을 구분하고 이벤트 위임을 사용할 수 있습니다.

## 왜 필요한가

JavaScript가 웹 화면을 바꾸려면 HTML 문자열 자체가 아니라 브라우저가 만든 문서 객체를 찾아 조작해야 합니다. 버튼 클릭, 폼 제출, 목록 추가와 삭제는 모두 **DOM 선택 → 이벤트 등록 → 데이터 처리 → DOM 반영**의 흐름으로 구현합니다.

## 비유: 건물 안내도와 호출 벨

> **비유**  
> DOM은 건물의 방과 통로를 객체로 표시한 안내도이고, 이벤트는 특정 방에서 눌린 호출 벨입니다. JavaScript는 안내도에서 방을 찾아 글자를 바꾸거나, 벨이 울렸을 때 실행할 동작을 등록합니다.

정확히는 브라우저가 HTML을 분석하여 노드로 구성된 DOM 트리를 만들고, 이벤트가 발생하면 등록된 리스너를 이벤트 전달 규칙에 따라 호출합니다.

## 정확한 설명

### DOM은 브라우저 Web API

`document`, `Element`, `Node`는 ECMAScript의 기본 문법이 아니라 브라우저가 제공하는 DOM API입니다.

```html
<body>
  <h1 id="title">원래 제목</h1>
</body>
```

브라우저는 위 문서를 대략 다음과 같은 객체 관계로 표현합니다.

```text
document
└─ html
   └─ body
      └─ h1#title
         └─ "원래 제목"
```

### 요소 선택

```javascript
const title = document.querySelector("#title");
const items = document.querySelectorAll(".item");
```

- `querySelector()`는 선택자와 일치하는 첫 번째 `Element`를 반환하고, 없으면 `null`을 반환합니다.
- `querySelectorAll()`은 일치하는 요소들이 담긴 정적인 `NodeList`를 반환합니다. 일치하는 요소가 없으면 길이가 `0`인 목록입니다.

CSS 선택자 문법을 사용합니다.

```javascript
document.querySelector("h1");       // 태그
document.querySelector("#title");   // id
document.querySelector(".item");    // class
```

같은 요소를 여러 번 사용할 때 한 번 선택해 변수에 저장하면 의미가 분명해지고 선택을 반복하지 않아도 됩니다.

### 내용과 클래스 변경

```javascript
title.textContent = "변경된 제목";
title.classList.add("active");
title.classList.remove("hidden");
title.classList.toggle("highlight");
console.log(title.classList.contains("active"));
```

사용자 입력처럼 신뢰할 수 없는 문자열을 단순히 표시할 때는 `textContent`를 우선합니다. `innerHTML`은 문자열을 HTML로 해석하므로 필요한 경우에만 사용하고 입력값을 그대로 넣지 않습니다.

### 속성과 `dataset`

```javascript
const image = document.querySelector("img");
image.src = "./images/night.png";
image.alt = "밤하늘";
```

HTML의 `data-*` 속성은 `dataset`으로 읽고 쓸 수 있습니다.

```html
<button data-post-id="post-10">삭제</button>
```

```javascript
const button = document.querySelector("button");
console.log(button.dataset.postId); // "post-10"
```

`data-post-id`는 JavaScript에서 `dataset.postId`로 변환되고, 저장되는 값은 문자열입니다.

### 요소 생성과 추가

```javascript
const listItem = document.createElement("li");
listItem.textContent = "새 항목";

const list = document.querySelector("#item-list");
list.appendChild(listItem);
```

`createElement()`는 메모리에 요소 객체를 만들 뿐 화면에 자동으로 붙이지 않습니다. 부모 노드에 `appendChild()`나 `append()`로 추가해야 보입니다.

```text
요소 생성
→ 내용과 속성 설정
→ 부모 요소 선택
→ 부모의 자식으로 추가
→ 화면에 반영
```

### 이벤트 등록

```javascript
const changeButton = document.querySelector("#change-button");

changeButton.addEventListener("click", (event) => {
  console.log("버튼 클릭", event);
});
```

- 첫 번째 인수: 이벤트 종류를 나타내는 대소문자 구분 문자열
- 두 번째 인수: 이벤트가 발생했을 때 호출될 함수
- 이벤트 객체: 발생한 이벤트와 관련된 정보를 담은 객체

### 폼 제출과 `preventDefault()`

폼은 제출할 때 기본적으로 지정된 주소로 데이터를 보내며 페이지가 이동하거나 새로고침될 수 있습니다. JavaScript에서 처리하려면 기본 동작을 막습니다.

```javascript
const form = document.querySelector("#login-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const email = formData.get("email");
  console.log(email);
});
```

`event.currentTarget`은 현재 이벤트 리스너가 등록된 요소입니다. 위 예제에서는 `form`입니다.

### `target`, `currentTarget`, 이벤트 위임

이벤트가 자식 요소에서 발생하면 조상 요소 방향으로 전파될 수 있습니다.

```html
<ul id="item-list">
  <li>
    첫 번째
    <button type="button" data-action="delete" aria-label="첫 번째 항목 삭제">삭제</button>
  </li>
  <li>
    두 번째
    <button type="button" data-action="delete" aria-label="두 번째 항목 삭제">삭제</button>
  </li>
</ul>
```

```javascript
const list = document.querySelector("#item-list");

list.addEventListener("click", (event) => {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (!deleteButton) return;

  deleteButton.closest("li")?.remove();
});
```

- `event.target`: 이벤트가 처음 발생한 실제 요소
- `event.currentTarget`: 현재 리스너가 실행되고 있는 요소, 여기서는 `ul`

항목마다 리스너를 붙이지 않고 부모가 자식의 이벤트를 처리하는 방식을 **이벤트 위임**이라고 합니다. 나중에 추가된 삭제 버튼도 같은 부모 안에서 활성화되면 처리할 수 있습니다.

삭제 버튼 안의 아이콘처럼 더 안쪽 요소가 클릭될 수 있다면 `closest()`로 가장 가까운 버튼을 찾을 수 있습니다.

```javascript
const deleteButton = event.target.closest('[data-action="delete"]');
if (!deleteButton) return;
```

### 마우스 클릭만 가정하지 않기

`li`나 `div`처럼 본래 동작을 수행하는 요소가 아닌 곳에 클릭 리스너만 붙이면 키보드 사용자는 같은 기능을 실행하기 어렵습니다. 동작에는 기본 키보드 조작을 제공하는 `<button>`을 사용하고, 입력에는 목적을 알려 주는 보이는 `<label>`을 연결합니다. 네이티브 버튼은 마우스와 키보드 활성화를 모두 `click` 이벤트로 처리할 수 있으므로 같은 동작을 위한 별도 `keydown` 코드를 중복해서 만들 필요가 없습니다. 같은 이름의 삭제 버튼이 반복될 때는 `aria-label`에 항목 이름도 포함해 어떤 항목을 지우는지 구분합니다.

## 실행 흐름

다음은 입력값을 목록에 추가하고 삭제 버튼으로 지우는 예제입니다. 입력창에서 Enter를 누르거나 추가 버튼을 활성화하면 같은 `submit` 흐름이 실행됩니다.

```html
<form id="item-form">
  <label for="item-input">새 항목</label>
  <input id="item-input" name="item" />
  <button type="submit">추가</button>
</form>
<ul id="item-list"></ul>
```

```javascript
const form = document.querySelector("#item-form");
const input = document.querySelector("#item-input");
const list = document.querySelector("#item-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  const item = document.createElement("li");
  const label = document.createElement("span");
  const deleteButton = document.createElement("button");

  label.textContent = value;
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `${value} 삭제`);
  deleteButton.textContent = "삭제";

  item.append(label, " ", deleteButton);
  list.append(item);
  form.reset();
  input.focus();
});

list.addEventListener("click", (event) => {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (!deleteButton) return;

  deleteButton.closest("li")?.remove();
});
```

1. 보이는 `label`의 `for`와 입력의 `id`를 맞춰 입력 목적을 연결합니다.
2. 폼에 `submit` 리스너를 등록해 Enter와 추가 버튼을 같은 흐름으로 처리합니다.
3. 공백을 제거한 입력값이 비어 있으면 함수를 끝냅니다.
4. `li` 안에 안전한 텍스트와 네이티브 삭제 버튼을 만들고, 항목 이름을 포함한 접근 가능한 이름을 붙입니다.
5. 폼을 비우고 입력으로 포커스를 돌려 다음 항목을 바로 입력할 수 있게 합니다.
6. `ul`의 위임 리스너는 실제 활성화된 삭제 버튼을 찾아 가장 가까운 `li`를 삭제합니다.
7. 삭제 동작을 버튼으로 제공했기 때문에 포인터와 키보드 사용자가 같은 기능을 이용할 수 있습니다.

## 최소 코드

```javascript
const button = document.querySelector("#change-button");
const text = document.querySelector("#text");

button.addEventListener("click", () => {
  text.textContent = "변경되었습니다";
});
```

## 흔한 실수

### 1. 선택자 메서드를 프로퍼티처럼 쓰기

```javascript
document.querySelector.button;     // 잘못된 사용
document.querySelector("button"); // 올바른 호출
```

### 2. 없는 요소를 바로 조작하기

```javascript
const modal = document.querySelector("#model"); // 실제 id는 modal일 수 있음
modal.classList.add("open");                    // modal이 null이면 TypeError
```

선택자 철자와 스크립트 실행 시점을 확인합니다.

### 3. `createElement()`에 CSS 선택자를 넣기

```javascript
document.createElement("#li"); // 잘못됨
document.createElement("li");  // 태그 이름만 전달
```

### 4. 만든 요소를 문서에 추가하지 않기

`createElement()`와 `appendChild()`는 서로 다른 단계입니다. 자식으로 추가하지 않으면 콘솔에서 객체는 보여도 화면에는 나타나지 않습니다.

### 5. `querySelectorAll()` 결과에 한 번에 `style` 사용하기

```javascript
const links = document.querySelectorAll("a");

links.forEach((link) => {
  link.style.color = "red";
});
```

`NodeList`의 각 요소를 순회해야 합니다. 메서드 이름도 `forEach`처럼 대소문자를 정확히 작성합니다.

### 6. 이벤트 매개변수를 선언하지 않기

```javascript
list.addEventListener("click", () => {
  console.log(event.target); // 명시적으로 전달받지 않음
});
```

```javascript
list.addEventListener("click", (event) => {
  console.log(event.target);
});
```

### 7. `tagName` 철자와 대소문자

HTML 문서의 요소 `tagName`은 일반적으로 대문자 형태로 반환됩니다.

```javascript
if (event.target.tagName === "LI") { /* ... */ }
```

선택자 검사에는 `event.target.matches("li")`를 사용할 수도 있습니다.

## 확인 문제

1. `querySelector()`와 `querySelectorAll()`의 반환값 차이는 무엇인가요?
2. `createElement("li")`만 실행했을 때 요소가 화면에 보이지 않는 이유는 무엇인가요?
3. 사용자 입력을 단순 텍스트로 보여줄 때 `textContent`를 우선하는 이유는 무엇인가요?
4. `target`과 `currentTarget`을 목록 클릭 예제로 설명해 보세요.
5. 이벤트 위임은 동적으로 추가되는 요소를 처리할 때 왜 유용한가요?
