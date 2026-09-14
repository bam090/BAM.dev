# 이벤트 대상과 위임

## 학습 목표

안쪽 요소에서 발생한 이벤트를 부모에서 받고 담당 버튼과 데이터 ID를 안전하게 찾을 수 있습니다.

## 한줄 요약

target에서 시작해 담당 요소를 찾고, currentTarget과 포함 관계를 확인하면 부모 리스너로 자식의 동작을 처리할 수 있습니다.

## 먼저 확인할 개념

[DOM의 현재 값](#/learn/javascript/wiki-dom-properties) · [폼 입력에서 상태와 화면으로](#/learn/javascript/wiki-forms-state)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

HTML이 먼저 준비된 브라우저에서 해당 JavaScript를 실행합니다. 이 문서의 같은 예제는 제시한 순서로 연결하고, 독립 예제의 같은 변수 이름을 한 스크립트로 겹쳐 붙이지 않습니다.

## 이벤트 객체는 무슨 일이 일어났는지 알려 준다

리스너 함수가 받는 `event`는 방금 일어난 이벤트의 정보를 담은 객체다.

```html
<div id="counter-box">
  <button id="plus-button" type="button"><span>1 더하기</span></button>
</div>
```

```js
const counterBox = document.querySelector("#counter-box");

counterBox.addEventListener("click", (event) => {
  console.log(event.target);
  console.log(event.currentTarget);
});
```

버튼 안의 `span` 글자를 누르면 두 값은 다음처럼 다를 수 있다.

| 값 | 뜻 |
| --- | --- |
| `event.target` | 이벤트가 전달된 원래 대상. 이 예에서는 `span`일 수 있다. |
| `event.currentTarget` | 지금 실행 중인 리스너가 등록된 대상. 이 예에서는 `counterBox`다. |

현재 리스너가 맡은 요소가 필요하면 `currentTarget`을 사용한다.
사용자가 실제로 누른 안쪽 요소부터 찾고 싶으면 `target`에서 시작한다.

## 이벤트는 부모 쪽으로 전달될 수 있다

많은 이벤트는 대상에서 시작해 부모 요소 쪽으로 전달된다.
이 흐름을 버블링(bubbling), 곧 `안쪽에서 바깥쪽으로 올라가는 전달`이라고 한다.
모든 이벤트가 버블링하는 것은 아니며 `event.bubbles`로 그 여부를 확인할 수 있다.

버블링을 이용하면 목록의 버튼마다 리스너를 붙이지 않고 부모 하나에서 처리할 수 있다.
이를 이벤트 위임(event delegation), 곧 `부모가 자식의 이벤트를 대신 받는 방법`이라고 한다.

```html
<ul id="quick-card-list">
  <li><button type="button" data-card-id="1"><span>HTML 카드 보기</span></button></li>
  <li><button type="button" data-card-id="2"><span>JavaScript 카드 보기</span></button></li>
</ul>
```

```js
const quickCardList = document.querySelector("#quick-card-list");

quickCardList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-card-id]");

  if (!button || !quickCardList.contains(button)) return;

  const cardId = Number(button.dataset.cardId);

  if (!Number.isInteger(cardId)) return;

  console.log(cardId);
});
```

`event.target`은 모든 경우에 HTML 요소라고 보장되지 않으므로 먼저 `Element`인지 확인했다.
`closest()`는 현재 요소부터 부모 쪽으로 올라가며 선택자와 맞는 가장 가까운 요소를 찾는다.
버튼 안의 글자를 눌러도 버튼을 찾을 수 있다.
나중에 목록 항목이 추가되어도 부모 리스너 하나로 처리할 수 있다.

`data-card-id`는 요소에 작은 정보를 붙이는 사용자 정의 데이터 속성이고 `dataset.cardId`로 읽는다.
`dataset`으로 읽은 값은 문자열이므로 숫자 ID가 필요하면 `Number()`로 바꾼 뒤 정수인지 확인한다.
`contains()`는 찾은 버튼이 이 목록 안에 속하는지도 확인한다.

## 이어서 연습하기

[이벤트의 기본 동작 취소와 전파](#/learn/javascript/wiki-event-defaults)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [WHATWG DOM Standard — Events](https://dom.spec.whatwg.org/#events)
- [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [W3C UI Events](https://www.w3.org/TR/uievents/)

## 핵심 질문 답

target은 이벤트의 원래 대상이고 currentTarget은 지금 실행 중인 리스너가 등록된 대상입니다. 버블링하는 이벤트를 부모에서 받아 target이 Element인지 확인하고 closest로 버튼을 찾습니다. 그 버튼이 담당 목록 안에 있는지 contains로 확인한 뒤 dataset 문자열을 필요한 타입으로 바꾸고 검사합니다. 따라서 나중에 추가한 버튼도 같은 부모 리스너로 처리할 수 있습니다.
