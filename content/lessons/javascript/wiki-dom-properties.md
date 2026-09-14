# DOM의 현재 값을 읽고 바꾸기

## 학습 목표

준비된 DOM 요소를 찾고 현재 입력값·글·클래스·데이터 속성을 목적에 맞게 읽고 바꿀 수 있습니다.

## 한줄 요약

HTML은 처음 문서이고 DOM은 현재 구조이며, 입력 프로퍼티와 원래 속성은 서로 다른 값을 가질 수 있습니다.

## 먼저 확인할 개념

[HTML 문서의 기본 골격](#/learn/html/wiki-document-skeleton)과 [객체의 속성](#/learn/javascript/wiki-arrays-objects)을 먼저 확인해 보세요.

## 예제를 실행하기 전

이 문서의 각 HTML을 브라우저 문서에 먼저 준비한 뒤 대응하는 JavaScript를 실행합니다. `defer`로 연결한 스크립트나 요소 아래의 스크립트처럼 요소가 이미 만들어진 시점이 필요합니다. 예제 묶음은 각각 독립 실행합니다.

## HTML과 DOM은 같은 것이 아니다

HTML은 웹페이지의 처음 모습을 글로 적은 문서다.
브라우저는 이 HTML을 읽고 화면에서 다룰 수 있는 나무 모양의 구조를 만든다.
이 구조를 DOM(Document Object Model), 곧 `문서 객체 모델`이라고 한다.

```html
<p id="weather">오늘 날씨를 불러오는 중입니다.</p>
```

```js
const weather = document.querySelector("#weather");
weather.textContent = "오늘은 맑습니다.";
```

`document`는 현재 웹 문서를 나타내는 객체다.
`querySelector()`는 CSS 선택자와 맞는 첫 번째 요소를 찾는다.
`textContent`는 요소 안의 글을 읽거나 바꾸는 프로퍼티다.
프로퍼티는 객체가 가지고 있는 값을 뜻한다.

위 코드를 실행하면 화면의 문장은 바뀐다.
그러나 서버에서 받은 원래 HTML 파일까지 자동으로 고쳐지는 것은 아니다.
HTML은 처음 재료이고, DOM은 브라우저 안에서 바뀔 수 있는 현재 모습이다.

## 요소는 찾고, 읽고, 필요한 부분만 바꾼다

DOM을 다룰 때는 보통 다음 순서로 생각한다.

1. 바꿀 요소를 찾는다.
2. 현재 값을 읽거나 새 값을 만든다.
3. 필요한 프로퍼티나 속성을 바꾼다.

```html
<button id="lamp-button" type="button">불 켜기</button>
<p id="lamp-state">꺼짐</p>
```

```js
const lampButton = document.querySelector("#lamp-button");
const lampState = document.querySelector("#lamp-state");

lampButton.addEventListener("click", () => {
  lampState.textContent = "켜짐";
});
```

`addEventListener()`는 특정 일이 일어났을 때 실행할 함수를 등록한다.
이때 `click`처럼 브라우저가 알려 주는 일을 이벤트(event)라고 한다.
위 예에서는 버튼이 활성화되면 등록한 함수가 실행되고 문장이 `켜짐`으로 바뀐다.

사용자에게서 받은 글을 화면에 단순한 글로 보여 줄 때는 `innerHTML`보다 `textContent`를 먼저 사용한다.
`innerHTML`은 문자열을 HTML로 해석하므로, 믿을 수 없는 값을 넣으면 원하지 않는 요소나 스크립트가 만들어질 수 있다.

## HTML 속성과 DOM 프로퍼티는 늘 같은 값이 아니다

HTML 태그 안에 적은 값을 속성(attribute)이라고 한다.
브라우저가 만든 객체에서 읽는 값을 프로퍼티(property)라고 한다.
둘이 서로 비치는 경우도 있지만 언제나 같은 현재 값을 뜻하지는 않는다.

```html
<input id="nickname" value="밤">
```

```js
const nickname = document.querySelector("#nickname");

nickname.value = "새벽";

console.log(nickname.getAttribute("value")); // "밤"
console.log(nickname.value);                 // "새벽"
```

`value` 속성에는 HTML에 적힌 처음 값이 남아 있다.
`.value` 프로퍼티에는 현재 입력값이 들어 있다.
폼에서 사용자가 지금 입력한 값을 읽을 때는 보통 프로퍼티를 사용한다.

## 없는 요소를 바로 사용하지 않기

`querySelector()`는 선택자에 맞는 첫 요소를 반환하고 없으면 `null`을 반환합니다. 철자와 실행 시점을 확인하고, 선택적인 요소라면 존재할 때만 사용합니다.

```js
const notice = document.querySelector("#notice");
if (notice !== null) {
  notice.textContent = "준비 완료";
}
```

## 클래스와 data 속성 읽기

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

`classList.add`는 클래스를 추가하고 `remove`는 제거합니다. `contains("active")`는 active 클래스가 현재 있는지 불리언으로 확인합니다. `dataset.postId`는 숫자로 자동 변환되지 않습니다.

## 만든 요소는 부모에 추가하기

다음 HTML을 먼저 준비합니다.

```html
<ul id="item-list"></ul>
```

`createElement()`는 새 요소 객체를 만들지만 화면에 자동으로 추가하지 않습니다.
부모 요소에 `append()`나 `appendChild()`로 붙여야 보입니다.

```javascript
const list = document.querySelector("#item-list");
const item = document.createElement("li");

item.textContent = "새 항목";
list.append(item);
```

`createElement`로 만들기만 하면 문서에 연결되지 않습니다. `append`까지 실행한 뒤 부모 목록에서 새 항목을 확인하세요.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [폼 입력에서 상태와 화면으로](#/learn/javascript/wiki-forms-state)을 살펴보세요.

## 공식 자료

- [MDN — Document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
- [MDN — HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
- [WHATWG DOM Standard — Events](https://dom.spec.whatwg.org/#events)
- [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [W3C UI Events](https://www.w3.org/TR/uievents/)

## 핵심 질문 답

HTML은 받은 문서이고 DOM은 브라우저가 만든 현재 구조입니다. 요소를 찾은 뒤 현재 입력은 `.value`, 단순한 글은 `textContent`, 클래스는 `classList`로 다룹니다.
입력의 원래 value 속성과 현재 value 프로퍼티는 달라질 수 있습니다. `dataset` 값은 문자열이며 `data-post-id`는 `dataset.postId`로 읽습니다. 없는 요소는 null이고, 새 요소는 부모에 추가해야 화면에 연결됩니다.
