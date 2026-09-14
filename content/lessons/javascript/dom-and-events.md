# 05. DOM과 이벤트

## 학습 목표

- DOM이 HTML 문서를 객체 구조로 표현한 것임을 설명할 수 있습니다.
- 요소를 선택하고 내용, 클래스, 속성을 변경할 수 있습니다.
- 요소를 생성한 뒤 실제 문서에 추가하는 과정을 이해합니다.
- 이벤트 객체의 `target`과 `currentTarget`을 구분하고 이벤트 위임을 사용할 수 있습니다.

## 왜 필요한가

JavaScript가 화면을 바꾸려면 브라우저가 HTML로 만든 요소를 찾아야 합니다.
버튼 클릭, 폼 제출, 목록 추가는 모두 **요소 선택 → 이벤트 발생 → 데이터 처리 → 화면 변경**의 흐름으로 동작합니다.

## DOM이란?

**DOM(Document Object Model, 문서 객체 모델)**은 브라우저가 HTML 문서를 JavaScript로 다룰 수 있도록 객체의 트리로 표현한 것입니다.
`document`, `Element`, `Node`는 JavaScript 언어 문법이 아니라 브라우저가 제공하는 DOM API입니다.

```html
<body>
  <h1 id="title">원래 제목</h1>
</body>
```

```text
document
└─ html
   └─ body
      └─ h1#title
```

## 요소 선택하고 바꾸기

`querySelector()`는 CSS 선택자와 일치하는 첫 요소를 반환합니다.
일치하는 요소가 없으면 `null`입니다.
`querySelectorAll()`은 일치하는 요소의 목록을 반환합니다.

```javascript
const title = document.querySelector("#title");
const items = document.querySelectorAll(".item");
```

선택한 요소의 글과 클래스를 바꿀 수 있습니다.

```javascript
title.textContent = "변경된 제목";
title.classList.remove("hidden");
title.classList.add("active");

console.log(title.classList.contains("active")); // true
```

사용자 입력을 글자로 보여 줄 때는 `textContent`를 사용합니다.
`innerHTML`은 문자열을 HTML로 해석하므로 신뢰할 수 없는 입력을 그대로 넣지 않습니다.

HTML의 `data-*` 속성은 요소에 필요한 추가 정보를 저장합니다.
JavaScript에서는 `dataset`으로 읽으며 값은 문자열입니다.

```html
<button id="save" data-post-id="post-10" class="hidden">저장</button>
```

```javascript
const button = document.querySelector("#save");
button.classList.remove("hidden");
button.classList.add("active");

console.log(button.dataset.postId); // "post-10"
```

`data-post-id`처럼 하이픈으로 이어진 이름은 `dataset.postId`처럼 뒤 단어의 첫 글자를 대문자로 잇는 **camelCase 표기**로 바뀝니다.

## 요소 만들고 추가하기

`createElement()`는 새 요소 객체를 만들지만 화면에 자동으로 추가하지 않습니다.
부모 요소에 `append()`나 `appendChild()`로 붙여야 보입니다.

```javascript
const list = document.querySelector("#item-list");
const item = document.createElement("li");

item.textContent = "새 항목";
list.append(item);
```

```text
요소 만들기 → 내용과 속성 설정 → 부모에 추가 → 화면에 표시
```

## 이벤트와 폼

**이벤트**는 클릭이나 폼 제출처럼 브라우저에서 일어난 일입니다.
`addEventListener()`로 이벤트가 발생했을 때 실행할 함수를 등록합니다.

```javascript
const changeButton = document.querySelector("#change-button");

changeButton.addEventListener("click", (event) => {
  console.log("클릭", event);
});
```

폼의 `submit` 이벤트는 Enter와 제출 버튼을 같은 흐름으로 처리할 수 있습니다.
JavaScript에서 처리할 때 `preventDefault()`로 기본 제출 이동을 막습니다.
`FormData`는 `name`이 붙은 폼 입력값을 읽는 브라우저 도구입니다.

```html
<form id="login-form">
  <label for="email">이메일</label>
  <input id="email" name="email" type="email" />
  <button type="submit">로그인</button>
</form>
```

```javascript
const form = document.querySelector("#login-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  console.log(formData.get("email"));
});
```

## `target`, `currentTarget`, 이벤트 위임

이벤트가 자식 요소에서 시작하면 부모 방향으로 전달될 수 있습니다.

```html
<ul id="actions">
  <li>
    첫 번째
    <button type="button" data-action="delete" aria-label="첫 번째 항목 삭제">
      <span>삭제</span>
    </button>
  </li>
  <li>
    두 번째
    <button type="button" data-action="delete" aria-label="두 번째 항목 삭제">
      <span>삭제</span>
    </button>
  </li>
</ul>
```

```javascript
const actions = document.querySelector("#actions");

actions.addEventListener("click", (event) => {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (!deleteButton) return;

  console.log(deleteButton.dataset.action); // "delete"
});
```

- `event.target`: 이벤트가 처음 발생한 실제 요소이며, 위 예제에서 글자를 누르면 `span`입니다.
- `event.currentTarget`: 현재 리스너가 등록된 요소이며, 위 예제에서는 `ul`입니다.

부모에 리스너 하나를 등록해 자식의 이벤트를 처리하는 방식을 **이벤트 위임**이라고 합니다.
`closest()`는 실제로 누른 요소부터 부모 방향으로 가장 가까운 삭제 버튼을 찾습니다.

동작에는 `div`보다 네이티브 `<button>`을 사용합니다.
버튼은 마우스 클릭과 키보드 활성화를 기본으로 지원합니다.
입력에는 보이는 `<label>`을 연결하고, 반복되는 삭제 버튼은 `aria-label`에 항목 이름을 포함해 대상을 구분합니다.

## 실행 흐름

다음 예제는 폼으로 항목을 추가하고 목록의 위임 리스너로 삭제합니다.

예제에서 `setAttribute()`는 HTML 속성을 설정하고, `reset()`은 폼 입력을 초기화합니다.
`focus()`는 다음 입력을 위해 키보드 초점을 옮기며, `remove()`는 요소를 문서에서 삭제합니다.

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

  deleteButton.closest("li").remove();
});
```

1. 브라우저가 폼과 목록을 DOM 객체로 만듭니다.
2. 제출하면 공백을 제거한 입력값을 확인합니다.
3. `li`, 글자, 삭제 버튼을 만들어 목록에 추가합니다.
4. 목록에서 클릭이 발생하면 가장 가까운 삭제 버튼을 찾습니다.
5. 버튼이 들어 있는 `li`를 삭제합니다.

## 최소 코드

```html
<button id="change-button" type="button">문구 바꾸기</button>
<p id="text">바뀌기 전</p>
```

```javascript
const button = document.querySelector("#change-button");
const text = document.querySelector("#text");

button.addEventListener("click", () => {
  text.textContent = "변경되었습니다";
});
```

## 흔한 실수

### 1. 없는 요소를 바로 사용하기

```javascript
const modal = document.querySelector("#model"); // 실제 id가 modal이면 null
modal.classList.add("open"); // TypeError
```

선택자 철자와 스크립트 실행 시점을 먼저 확인합니다.

### 2. 만든 요소를 문서에 추가하지 않기

`createElement()`와 부모에 `append()`하는 것은 서로 다른 단계입니다.
추가하지 않으면 화면에 보이지 않습니다.

### 3. `target`을 항상 버튼이라고 생각하기

버튼 안의 `span`이나 아이콘을 누르면 `target`은 그 안쪽 요소일 수 있습니다.
이벤트 위임에서는 `closest()`로 원하는 버튼을 찾습니다.

## 확인 포인트

1. 선택자가 실제 HTML과 일치하고 결과가 `null`이 아닌가요?
2. 만든 요소를 부모 요소에 추가했나요?
3. 폼은 `submit`, 일반 동작은 네이티브 버튼을 사용했나요?
4. 위임 리스너에서 `target`과 `currentTarget`을 구분했나요?

## 확인 문제

1. DOM은 HTML과 JavaScript 사이에서 어떤 역할을 하나요?
2. `createElement("li")`만 실행하면 화면에 보이지 않는 이유는 무엇인가요?
3. `data-post-id`를 `dataset`으로 읽으면 어떤 이름과 타입의 값을 얻나요?
4. 삭제 버튼 안의 `span`을 눌렀을 때 `target`과 `currentTarget`은 무엇인가요?

## 공식 자료

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [MDN: 이벤트 소개](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events)
- [MDN: 이벤트 버블링](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling)
- [WHATWG HTML Standard: data-* 속성](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
- [WHATWG HTML Standard: 폼 요소](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI-ARIA: aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label)

공식 자료 확인일: 2026-08-18

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

DOM은 브라우저가 HTML 문서를 JavaScript로 다룰 수 있도록 객체의 트리로 표현한 것입니다.
JavaScript는 이 DOM 도구를 사용해 HTML 요소를 찾고 내용이나 상태를 바꿀 수 있습니다.

### 답변 2

`createElement("li")`는 새 `li` 요소 객체만 만들고 문서에 자동으로 추가하지는 않습니다.
화면에 보이게 하려면 부모 요소에 `append()`나 `appendChild()`로 붙여야 합니다.

### 답변 3

`data-post-id`는 `dataset.postId`로 읽으며, 얻는 값의 타입은 문자열입니다.

### 답변 4

삭제 버튼 안의 `span`을 누르면 `event.target`은 그 `span`이고, `event.currentTarget`은 리스너가 등록된 부모 `ul`입니다.
