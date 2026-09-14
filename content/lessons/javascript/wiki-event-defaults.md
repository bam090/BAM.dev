# 이벤트의 기본 동작 취소와 전파

## 학습 목표

브라우저의 이동·제출을 취소할 때와 다른 리스너의 실행을 막을 때를 구분할 수 있습니다.

## 한줄 요약

preventDefault는 취소 가능한 기본 동작을, 전파 중단 메서드는 이벤트를 받는 리스너의 범위를 다룹니다.

## 먼저 확인할 개념

[이벤트 대상과 위임](#/learn/javascript/wiki-event-delegation)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## 기본 동작 취소와 이벤트 전파 중단은 다른 일이다

브라우저는 이벤트와 함께 기본 동작을 실행할 수 있다.
링크를 누르면 주소로 이동하고, 폼을 제출하면 데이터를 보내는 일이 예다.

- `event.preventDefault()`는 취소할 수 있는 기본 동작을 취소한다.
- `event.stopPropagation()`은 이벤트가 다른 요소로 더 전달되는 것을 막는다.
- `event.stopImmediatePropagation()`은 같은 요소에 뒤이어 등록된 리스너의 실행까지 막는다.

`preventDefault()`를 호출했다고 버블링이 멈추지는 않는다.
반대로 `stopPropagation()`을 호출했다고 폼 제출 같은 기본 동작이 취소되는 것도 아니다.

이벤트가 취소 가능한지는 `event.cancelable`로 확인할 수 있다.
취소에 성공했는지는 `event.defaultPrevented`로 확인한다.
passive 리스너처럼 기본 동작을 취소할 수 없도록 등록된 경우에는 `preventDefault()`가 효과가 없다.

전파 중단은 다른 기능의 리스너까지 막을 수 있으므로 꼭 필요한 경우에만 사용한다.
이벤트 위임에서는 먼저 대상이 내가 처리할 버튼인지 확인하고, 관계없는 이벤트는 그대로 둔다.

## 이동만 취소하고 기록은 남기는 예

다음 HTML이 준비된 브라우저에서 스크립트를 한 번 실행한다.
링크 리스너는 passive로 등록하지 않았고, 사용자가 보통의 click으로 활성화한다고 가정한다.

```html
<div id="link-area"><a id="preview-link" href="/guide">안내 미리보기</a></div>
```

```js
const link = document.querySelector("#preview-link");
const area = document.querySelector("#link-area");
link.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("현재 화면에서 안내를 보여 줍니다.");
});
area.addEventListener("click", () => {
  console.log("안내 링크를 눌렀습니다.");
});
```

주소 이동은 취소되지만 부모의 기록 리스너도 실행된다.
반대로 전파 중단만 사용하면 부모 기록은 막아도 주소 이동을 취소하지 못한다.
`cancelable`이 true여도 passive 리스너 안에서는 기본 동작을 취소할 수 없다.
이때 preventDefault를 호출했다는 사실을 취소 성공으로 해석하면 안 된다.


## 이어서 연습하기

[입력 검증과 오류 종류](#/learn/javascript/wiki-errors-input)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [WHATWG DOM Standard — Events](https://dom.spec.whatwg.org/#events)
- [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [W3C UI Events](https://www.w3.org/TR/uievents/)

## 핵심 질문 답

취소 가능한 링크 이동은 passive가 아닌 리스너에서 preventDefault로 취소합니다. 이 호출은 버블링을 멈추지 않습니다. stopPropagation은 다른 요소로의 전파를, stopImmediatePropagation은 같은 요소에 남은 리스너까지 막으며 기본 동작 취소를 대신하지 않습니다. cancelable과 passive 조건을 확인하고 필요하면 defaultPrevented로 실제 취소 여부를 확인합니다.
