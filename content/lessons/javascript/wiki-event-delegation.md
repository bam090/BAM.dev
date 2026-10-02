# 이벤트 대상·위임과 기본 동작

## 학습 목표

- target과 currentTarget을 구분하고 closest·포함 관계·데이터 ID 검사로 담당 요소를 찾을 수 있습니다.
- 나중에 추가한 항목의 버블링하는 이벤트를 부모 리스너 하나로 처리할 수 있습니다.
- 기본 동작을 취소할 때와 다른 리스너의 실행을 막을 때를 구분하고 실제 취소 여부를 확인할 수 있습니다.

## 먼저 확인할 개념

[DOM의 현재 값](#/learn/javascript/wiki-dom-properties) · [폼 입력에서 상태와 화면으로](#/learn/javascript/wiki-forms-state)를 먼저 확인합니다.

## 이벤트 위임과 기본 동작이란

**이벤트 위임**은 부모에 등록한 리스너로 자식의 이벤트를 처리하는 방법이고 **기본 동작**은 링크 이동처럼 브라우저가 이벤트에 따라 수행하는 행동입니다.
부모에서 클릭을 처리할 때는 담당 요소를 찾는 일과 브라우저 동작을 취소하는 일을 구분합니다.

예를 들어 학습 카드 목록에서 카드 보기 버튼과 안내 미리보기 링크를 함께 제공한다고 해 보겠습니다.
버튼 안의 글자를 눌렀을 때 어느 요소를 읽어야 할지 먼저 예상해 봅니다.
다음 HTML을 준비한 브라우저에서 JavaScript 블록을 순서대로 한 번씩 실행합니다.

## 이벤트 객체는 무슨 일이 일어났는지 알려 준다

리스너가 받는 `event`는 방금 일어난 이벤트의 정보를 담은 객체입니다.

```html
<div id="link-area">
  <ul id="quick-card-list">
    <li><button type="button" data-card-id="1"><span>HTML 카드 보기</span></button></li>
    <li><button type="button" data-card-id="2"><span>JavaScript 카드 보기</span></button></li>
  </ul>
</div>
```

```js
const quickCardList = document.querySelector("#quick-card-list");

quickCardList.addEventListener("click", (event) => {
  console.log(event.target);
  console.log(event.currentTarget);
});
```

버튼 안의 `span` 글자를 누르면 두 값은 다음처럼 다를 수 있습니다.

| 값 | 뜻 |
| --- | --- |
| `event.target` | 이벤트의 원래 대상이며 이 예에서는 누른 `span`입니다. |
| `event.currentTarget` | 지금 실행 중인 리스너가 등록된 대상이며 이 예에서는 `quickCardList`입니다. |

현재 리스너가 맡은 요소가 필요하면 `currentTarget`을 사용합니다.
사용자가 누른 안쪽 요소부터 담당 버튼을 찾으려면 `target`에서 시작합니다.

## 이벤트는 부모 쪽으로 전달될 수 있다

많은 이벤트는 대상에서 시작해 부모 요소 쪽으로 전달됩니다.
이 흐름을 **버블링(bubbling)**이라고 합니다.
모든 이벤트가 버블링하는 것은 아니므로 `event.bubbles`로 여부를 확인합니다.

버블링하는 클릭을 부모에서 받으면 버튼마다 리스너를 붙이지 않아도 됩니다.
다음 리스너가 안쪽 `span`을 눌렀을 때도 담당 버튼의 ID를 찾을지 예상해 봅니다.

```js
quickCardList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-card-id]");
  if (!button || !quickCardList.contains(button)) return;

  const cardId = Number(button.dataset.cardId);
  if (!Number.isInteger(cardId)) return;

  console.log(cardId);
});
```

`event.target`은 모든 경우에 HTML 요소라고 보장되지 않으므로 먼저 `Element`인지 확인합니다.
`closest()`는 현재 요소부터 부모 쪽으로 올라가며 선택자에 맞는 가장 가까운 요소를 찾습니다.
따라서 버튼 안의 글자를 눌러도 버튼을 찾습니다.
`contains()`는 찾은 버튼이 담당 목록 안에 있는지 확인합니다.

선택자에 맞는 요소가 목록 바깥 조상일 수도 있습니다.
이때 `currentTarget`이 목록이라는 사실만으로 그 조상이 담당 요소가 되지는 않습니다.
요소를 찾은 뒤 포함 관계를 확인해야 목록 밖 동작을 잘못 처리하지 않습니다.

`data-card-id`는 요소에 작은 정보를 붙이는 사용자 정의 데이터 속성입니다.
`dataset.cardId`로 읽은 값은 문자열이므로 숫자 ID가 필요하면 `Number()`로 변환하고 정수인지 검사합니다.
문자열 ID가 존재한다는 사실과 담당 목록에 속한다는 사실도 별개입니다.

## 나중에 추가한 카드

이제 같은 목록에 카드 하나를 추가합니다.
새 버튼에 별도 리스너를 등록하지 않아도 ID를 처리할지 확인해 봅니다.

```js
const newItem = document.createElement("li");
const newButton = document.createElement("button");
newButton.type = "button";
newButton.dataset.cardId = "3";
const newLabel = document.createElement("span");
newLabel.textContent = "CSS 카드 보기";
newButton.append(newLabel);
newItem.append(newButton);
quickCardList.append(newItem);
```

새 버튼의 클릭도 목록으로 버블링하므로 앞에서 등록한 부모 리스너가 처리합니다.
`type="button"`인 이 버튼에는 폼을 제출하는 기본 동작이 없습니다.
기본 동작 취소는 다음 안내 링크에서 따로 살펴봅니다.

---

## 기본 동작 취소와 이벤트 전파 중단은 다른 일이다

브라우저는 이벤트에 따라 기본 동작을 수행할 수 있습니다.
링크를 누르면 주소로 이동하고 폼을 제출하면 데이터를 보내는 일이 예입니다.

- `event.preventDefault()`는 취소 가능한 기본 동작을 취소합니다.
- `event.stopPropagation()`은 이벤트가 다른 요소로 더 전달되는 것을 막습니다.
- `event.stopImmediatePropagation()`은 전파와 같은 요소에 뒤이어 실행될 리스너까지 막습니다.

`preventDefault()`는 버블링을 멈추지 않습니다.
반대로 `stopPropagation()`은 링크 이동이나 폼 제출을 취소하지 않습니다.
`stopPropagation()`을 호출해도 같은 요소의 다른 리스너는 실행될 수 있습니다.

이벤트가 취소 가능한지는 `event.cancelable`로 확인하고 실제 취소 여부는 `event.defaultPrevented`로 확인합니다.
`{ passive: true }`로 등록한 리스너는 기본 동작을 취소하지 않겠다는 조건이므로 그 안의 `preventDefault()`에는 취소 효과가 없습니다.
`cancelable`이 `true`여도 현재 리스너의 passive 조건을 함께 확인해야 합니다.

전파 중단은 다른 기능의 리스너까지 막을 수 있으므로 필요한 경우에만 사용합니다.
위임에서는 먼저 담당 요소인지 확인하고 관계없는 이벤트는 그대로 전달합니다.

## 이동만 취소하고 기록은 남기는 예

같은 카드 목록에 안내 링크를 추가합니다.
링크 이동을 취소한 뒤에도 목록 바깥의 기록 리스너가 실행될지 예상해 봅니다.
아래 리스너는 passive로 등록하지 않았으며 사용자가 보통의 취소 가능한 클릭으로 링크를 활성화한다고 가정합니다.

```js
const guideItem = document.createElement("li");
const link = document.createElement("a");
link.id = "preview-link";
link.href = "/guide";
link.textContent = "안내 미리보기";
guideItem.append(link);
quickCardList.append(guideItem);

const area = document.querySelector("#link-area");
link.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("현재 화면에서 안내를 보여 줍니다.");
  console.log(event.cancelable, event.defaultPrevented);
});
area.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || !link.contains(event.target)) return;
  console.log("안내 링크를 눌렀습니다.");
});
```

주소 이동은 취소되지만 이벤트는 계속 전달되므로 바깥 영역의 기록 리스너도 실행됩니다.
목록의 버튼 처리 리스너는 링크에서 담당 버튼을 찾지 못하므로 ID 처리를 건너뜁니다.

같은 장면에서 취소 대신 `stopPropagation()`만 호출하면 바깥 기록은 막지만 주소 이동은 취소하지 못합니다.
`stopImmediatePropagation()`은 같은 요소의 후속 리스너까지 막지만 역시 기본 동작 취소를 대신하지 않습니다.
passive 리스너 안에서 `preventDefault()`를 호출해도 취소할 수 없으므로 호출 여부만으로 성공을 판단하지 않습니다.

## 정리

- target에서 담당 요소를 찾고 currentTarget·closest·포함 관계·데이터 ID를 각각 확인합니다.
- 버블링하는 클릭은 나중에 추가한 카드도 같은 부모 리스너로 처리합니다.
- 기본 동작 취소와 전파 중단을 따로 선택하고 cancelable·passive·defaultPrevented로 취소 조건과 결과를 확인합니다.

## 이어서 연습하기

핵심 질문에 답한 뒤 아래 객관식 복습에서 담당 영역과 기본 동작 취소 조건을 판단합니다.
다음으로 [입력 검증과 오류 종류](#/learn/javascript/wiki-errors-input)를 살펴봅니다.

## 공식 자료

확인일: 2026-10-02입니다.

- [WHATWG DOM Standard — Events](https://dom.spec.whatwg.org/#events)
- [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [W3C UI Events](https://www.w3.org/TR/uievents/)

## 핵심 질문 답

target은 이벤트의 원래 대상이고 currentTarget은 지금 실행 중인 리스너가 등록된 대상입니다.
target이 Element인지 확인한 뒤 closest로 담당 요소를 찾고 contains로 목록 안에 속하는지 확인합니다.
dataset 문자열은 필요한 타입으로 변환하고 검사합니다.
버블링하는 이벤트라면 나중에 추가한 카드도 같은 부모 리스너로 처리합니다.
링크 이동만 취소하려면 취소 가능한 이벤트를 passive가 아닌 리스너에서 preventDefault로 취소합니다.
이 호출은 버블링을 멈추지 않으므로 부모의 기록 리스너도 실행됩니다.
stopPropagation은 다른 요소로의 전파를 막고 stopImmediatePropagation은 같은 요소의 후속 리스너까지 막습니다.
두 메서드는 기본 동작 취소를 대신하지 않습니다.
cancelable과 passive 조건을 확인하고 defaultPrevented로 실제 취소 여부를 확인합니다.
