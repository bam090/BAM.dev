# 폼 입력에서 상태와 화면으로

## 학습 목표

폼의 제출값을 검증해 상태에 반영하고 같은 상태로 목록과 안내를 갱신할 수 있습니다.

## 한줄 요약

폼은 입력을 모으고, 이벤트 처리 함수는 상태를 바꾸며, render는 그 상태를 화면에 보여 줍니다.

## 먼저 확인할 개념

[DOM의 현재 값](#/learn/javascript/wiki-dom-properties) · [배열과 객체](#/learn/javascript/wiki-arrays-objects)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

HTML이 먼저 준비된 브라우저에서 해당 JavaScript를 실행합니다. 이 문서의 같은 예제는 제시한 순서로 연결하고, 독립 예제의 같은 변수 이름을 한 스크립트로 겹쳐 붙이지 않습니다.

## 학습 카드를 필터링하고 폼으로 추가한다

폼(form)은 여러 입력을 한 번에 제출하는 HTML 구조다.
제출 버튼의 클릭만 따로 처리하기보다 폼의 `submit` 이벤트를 받으면 버튼 클릭과 Enter 제출을 같은 흐름으로 다룰 수 있다.

```html
<label for="topic-filter">보여 줄 주제</label>
<select id="topic-filter">
  <option value="all">전체</option>
  <option value="html">HTML</option>
  <option value="javascript">JavaScript</option>
</select>

<form id="card-form">
  <label for="card-title">새 학습 카드 제목</label>
  <input id="card-title" name="title" required>

  <label for="card-topic">주제</label>
  <select id="card-topic" name="topic">
    <option value="html">HTML</option>
    <option value="javascript">JavaScript</option>
  </select>

  <button type="submit">카드 추가</button>
</form>

<p id="card-status" role="status"></p>
<ul id="card-list"></ul>
```

```js
const topicFilter = document.querySelector("#topic-filter");
const cardForm = document.querySelector("#card-form");
const cardStatus = document.querySelector("#card-status");
const cardList = document.querySelector("#card-list");

const state = {
  filter: "all",
  cards: [
    { id: 1, topic: "html", title: "의미 있는 구조" },
    { id: 2, topic: "javascript", title: "함수" },
  ],
  nextCardId: 3,
  message: "",
};

function renderCards() {
  const visibleCards = state.filter === "all"
    ? state.cards
    : state.cards.filter((card) => card.topic === state.filter);

  topicFilter.value = state.filter;
  cardList.replaceChildren();

  for (const card of visibleCards) {
    const item = document.createElement("li");
    item.textContent = `${card.title} (${card.topic})`;
    cardList.append(item);
  }

  cardStatus.textContent = state.message || `${visibleCards.length}개가 보입니다.`;
}

topicFilter.addEventListener("change", (event) => {
  state.filter = event.currentTarget.value;
  state.message = "";
  renderCards();
});

cardForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const titleEntry = formData.get("title");
  const topicEntry = formData.get("topic");
  const title = typeof titleEntry === "string" ? titleEntry.trim() : "";
  const topic = topicEntry === "html" || topicEntry === "javascript"
    ? topicEntry
    : "";

  if (title === "" || topic === "") {
    state.message = "카드 제목과 주제를 확인해 주세요.";
    renderCards();
    return;
  }

  state.cards.push({ id: state.nextCardId, topic, title });
  state.nextCardId += 1;
  state.filter = "all";
  state.message = `${title} 카드를 추가했습니다.`;
  cardForm.reset();
  renderCards();
});

renderCards();
```

`FormData`는 폼에서 제출할 이름과 값을 모아 주는 브라우저 기능이다.
`name="title"`과 `name="topic"`이 데이터의 이름이 된다.
같은 `name`이 여러 번 사용될 수 있으므로 여러 값을 모두 읽어야 할 때는 `getAll()`을 사용한다.

이 예의 흐름은 다음과 같다.

```text
필터 변경 또는 폼 제출
→ 현재 입력값 확인
→ state.filter 또는 state.cards 변경
→ renderCards()가 현재 상태에 맞는 목록 표시
```

`state`는 화면을 결정하는 현재 값을 모아 둔 객체다.
화면의 목록을 다시 읽어 프로그램 상태로 삼지 않고, 상태를 바꾼 뒤 `renderCards()`가 그 결과를 보여 주게 했다.
카드를 추가하면 전체 필터로 돌아와 방금 추가한 카드도 바로 보인다.
`renderCards()` 안에서는 새 이벤트 리스너를 등록하지 않는다.
리스너는 한 번 등록하고 상태가 바뀔 때마다 화면만 다시 그린다.

브라우저의 `required` 같은 내장 검증은 값이 완전히 비어 있는 흔한 실수를 먼저 알려 준다.
공백만 입력한 경우나 허용하지 않은 주제처럼 기능에 맞는 조건은 JavaScript에서도 확인한다.
네이티브 `select`, `input`, 제출 버튼을 사용했으므로
키보드로 항목을 고르고 Enter로 제출하는 흐름도 확인할 수 있다.
사용자가 브라우저를 거치지 않고 값을 보낼 수도 있으므로 서버는 입력을 다시 검증해야 한다.

### `requestSubmit()`과 `submit()`은 다르다

JavaScript로 폼 제출을 시작해야 한다면 차이를 알아야 한다.

- `form.requestSubmit()`은 제출 버튼을 누른 것처럼 `submit` 이벤트를 거친다. 폼 검증이 활성화되어 있으면 내장 검증도 먼저 거친다.
- `form.submit()`은 폼 검증과 `submit` 이벤트를 건너뛰고 제출 절차를 시작한다.

평소 사용자 제출 흐름을 그대로 실행하려면 `requestSubmit()`이 의도에 더 잘 맞는다.

폼에 `novalidate`가 있거나 사용한 제출 버튼에 `formnovalidate`가 있으면
`requestSubmit()`도 내장 검증을 건너뛴다.
따라서 `requestSubmit()`이라는 이름만 보고 검증이 언제나 실행된다고 생각하면 안 된다.

## 제출값의 타입과 입력 방법 확인하기

`FormData.get()`은 값이 없으면 `null`, 일반 입력이면 문자열, 파일 입력이면 `File`을 돌려줄 수 있다.
따라서 문자열 메서드를 바로 호출하지 않고 위 예처럼 `typeof titleEntry === "string"`을 먼저 확인한다.
`id`는 요소를 찾거나 label과 연결하는 이름이고, 폼 데이터의 키는 `name`이다.
여러 선택값이 같은 name으로 제출되면 첫 값만 받는 `get()` 대신 `getAll()`로 배열을 얻는다.

텍스트의 현재 값은 `input` 이벤트에서 `.value`로 읽는다.
`keydown`만 모으면 한글 조합 입력, 붙여넣기, 음성 입력을 빠뜨릴 수 있다.
이 예의 필터는 선택이 확정된 `change`에서 읽고, 추가 폼은 제출 때 입력을 모은다.
`role="status"`는 초점을 옮기지 않고 바뀐 안내를 전달하며 폼 자체를 보존하면 입력 중 커서도 잃지 않는다.


## 이어서 연습하기

[이벤트 대상과 위임](#/learn/javascript/wiki-event-delegation)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [WHATWG DOM Standard — Events](https://dom.spec.whatwg.org/#events)
- [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [W3C UI Events](https://www.w3.org/TR/uievents/)

## 핵심 질문 답

제출 버튼의 click만 받기보다 폼의 submit에서 입력을 모읍니다. FormData는 name으로 값을 찾으며 문자열·File·부재를 구분하고 여러 값은 getAll로 읽습니다. 값을 정리하고 기능 조건을 검사한 뒤 state를 바꾸고 render를 호출합니다. 리스너는 준비할 때 한 번 등록하며 입력 요소와 초점을 불필요하게 다시 만들지 않습니다.
