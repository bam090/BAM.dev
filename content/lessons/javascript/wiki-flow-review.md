# 데이터 흐름 종합: 입력부터 최신 화면까지

## 학습 목표

입력·상태·저장·요청·화면을 연결하고 저장 실패와 늦은 응답에도 현재 사용자의 선택을 유지할 수 있습니다.

## 한줄 요약

상태를 기준으로 한 방향으로 화면을 그리고, 저장 결과와 요청의 최신성을 확인해야 사용자의 현재 행동이 보존됩니다.

## 먼저 확인할 개념

[폼 입력에서 상태와 화면으로](#/learn/javascript/wiki-forms-state) · [이벤트 대상과 위임](#/learn/javascript/wiki-event-delegation) · [Web Storage의 저장과 복원](#/learn/javascript/wiki-web-storage) · [fetch 응답의 실패 경계](#/learn/javascript/wiki-fetch) · [비동기 화면의 진행 상태](#/learn/javascript/wiki-async-state)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

이 문서는 앞 단위의 연결을 보는 종합 예제입니다. 아래 HTML과 JavaScript 조각은 제시한 순서로 한 페이지에 연결하는 구조이며, `/api/learning-cards`는 실제 밤데브 API가 아닌 교안용 가정입니다. 외부 서버 구축은 이 학습의 필수 과제가 아닙니다.

HTML이 먼저 준비된 브라우저에서 해당 JavaScript를 실행합니다. 이 문서의 같은 예제는 제시한 순서로 연결하고, 독립 예제의 같은 변수 이름을 한 스크립트로 겹쳐 붙이지 않습니다.

## 한 기능도 네 단계로 나누어 읽는다

앞에서 배운 JavaScript는 서로 떨어진 기술 목록이 아니다.
작은 학습 카드 검색 기능도 다음 네 단계로 읽을 수 있다.

```text
입력 → 상태 → 판단 → 출력
```

입력은 폼, 저장소, 서버에서 들어온 값이다.
상태는 프로그램이 기억하는 현재 값이고, 판단은 검증과 조건 처리이며, 출력은 DOM·저장소·서버로 내보내는 결과다.

웹 화면의 사건을 중심으로 보면 다음처럼 이어진다.

```text
이벤트 → 입력 읽기 → 검증 → 상태 변경 → 저장·요청 → 최신 결과 확인 → render()
```

`render()`는 현재 상태를 DOM에 보여 주는 함수다.

처음부터 모든 코드를 한 함수에 넣기보다
`값을 계산하는 일`, `상태를 바꾸는 일`, `화면에 보여 주는 일`을 구분하면 어느 단계에서 문제가 생겼는지 찾기 쉬워진다.

## 상태가 기준이고 DOM은 그 결과다

상태(state)는 `지금 화면을 결정하는 프로그램의 값`이다.
DOM에 보이는 글을 다시 읽어 현재 상태를 알아내기보다 JavaScript 객체 하나를 기준으로 삼는다.

```js
const state = {
  query: "",
  phase: "idle",
  cards: [],
  completedCardIds: [],
  message: "검색어를 입력해 주세요.",
};

let latestRequestId = 0;
```

`phase`는 현재 비동기 작업의 단계를 나타낸다.

| 값 | 뜻 |
| --- | --- |
| `idle` | 아직 검색하지 않음 |
| `loading` | 응답을 기다리는 중 |
| `success` | 사용할 결과를 받음 |
| `error` | 요청이나 응답 처리에 실패함 |

DOM은 상태를 보여 주는 결과물이다.
누군가 화면의 문장을 임시로 바꾸더라도 다음 `render()`가 실행되면 상태에 맞는 모습으로 돌아온다.

## 계산과 화면 변경을 나눈다

값만 받아 값을 돌려주는 함수는 DOM 없이도 흐름을 읽기 쉽다.

```js
function normalizeQuery(text) {
  return text.trim();
}

function isLearningCardList(value) {
  return (
    Array.isArray(value) &&
    value.every((card) =>
      card !== null &&
      typeof card === "object" &&
      Number.isInteger(card.id) &&
      typeof card.topic === "string" &&
      typeof card.title === "string"
    )
  );
}
```

`normalizeQuery()`는 입력 모양을 정리한다.
`isLearningCardList()`는 서버에서 받은 값이 학습 카드 배열인지 확인한다.
두 함수는 화면을 직접 바꾸지 않는다.

DOM 변경은 `render()` 한곳에서 맡는다.

```html
<form id="card-search-form">
  <label for="card-query">학습 카드 검색어</label>
  <input id="card-query" name="query">
  <button type="submit">검색</button>
</form>

<p id="card-status" role="status"></p>
<ul id="card-list"></ul>
```

```js
const form = document.querySelector("#card-search-form");
const queryInput = document.querySelector("#card-query");
const status = document.querySelector("#card-status");
const cardList = document.querySelector("#card-list");

function render(focusCardId = null) {
  status.textContent = state.message;
  cardList.replaceChildren();

  if (state.phase !== "success") return;

  let buttonToFocus = null;

  for (const card of state.cards) {
    const item = document.createElement("li");
    const title = document.createElement("span");
    const toggleButton = document.createElement("button");
    const isCompleted = state.completedCardIds.includes(card.id);

    title.textContent = card.title;
    toggleButton.type = "button";
    toggleButton.dataset.cardId = String(card.id);
    toggleButton.textContent = isCompleted ? "완료 취소" : "완료";
    toggleButton.setAttribute(
      "aria-label",
      `${card.title} ${isCompleted ? "완료 취소" : "완료"}`,
    );

    if (card.id === focusCardId) {
      buttonToFocus = toggleButton;
    }

    item.append(title, " ", toggleButton);
    cardList.append(item);
  }

  buttonToFocus?.focus();
}
```

`replaceChildren()`은 기존 자식을 새 자식으로 바꾼다.
결과 목록만 다시 만들고 입력 중인 폼은 유지한다.
외부에서 온 카드 제목은 `innerHTML`로 해석하지 않고 `textContent`로 넣는다.
완료 ID가 배열에 있는지는 `includes()`로 확인한다.
버튼의 접근 가능한 이름에는 카드 제목도 넣어 여러 `완료` 버튼을 구분한다.
완료 버튼을 누른 뒤 목록을 다시 만들 때는 같은 카드의 새 버튼을 찾아 초점을 돌려줘 키보드 사용자가 위치를 잃지 않게 한다.

## 이벤트 리스너는 한 번만 등록한다

이벤트 리스너를 `render()` 안에서 계속 등록하면 render할 때마다 새 함수가 추가될 수 있다.
한 번 누른 버튼이 여러 번 처리되는 원인이 된다.

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const requestId = ++latestRequestId;
  const query = normalizeQuery(queryInput.value);

  if (query === "") {
    state.query = "";
    state.phase = "idle";
    state.cards = [];
    state.message = "검색어를 입력해 주세요.";
    render();
    return;
  }

  state.query = query;
  await searchLearningCards(query, requestId);
});

cardList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-card-id]");

  if (!button || !cardList.contains(button)) return;

  const cardId = Number(button.dataset.cardId);

  if (!Number.isInteger(cardId)) return;

  const wasCompleted = state.completedCardIds.includes(cardId);
  const nextIds = wasCompleted
    ? state.completedCardIds.filter((id) => id !== cardId)
    : [...state.completedCardIds, cardId];

  state.completedCardIds = nextIds;
  const saved = saveCompletedCardIds(nextIds);
  state.message = saved
    ? "완료 상태를 저장했습니다."
    : "화면에서는 바뀌었지만 브라우저 저장소에는 저장하지 못했습니다.";
  render(cardId);
});

state.completedCardIds = loadCompletedCardIds();
render();
```

이 리스너는 페이지 준비 때 한 번 등록한다.
이후에는 이벤트가 생길 때 상태를 바꾸고 필요한 함수를 호출한다.

render할 때마다 만든 새 화살표 함수는 서로 다른 함수이므로 리스너가 누적될 수 있다.
상태와 DOM 참조는 `const`나 `let`으로 선언해 우연한 전역 상태도 만들지 않는다.

## 완료 상태의 저장 결과를 따로 확인한다

완료한 카드 ID는 현재 화면의 JavaScript 상태에 있고, 다음 방문에도 남을 수 있게 하려면 별도로 저장해야 한다.
이 예에서는 작은 개인 편의 상태라고 보고 `localStorage`를 사용한다.
사용자가 저장소를 지우거나 브라우저 정책이 보관을 제한하면 사라질 수 있다.

```js
function saveCompletedCardIds(cardIds) {
  try {
    localStorage.setItem("completedLearningCardIds", JSON.stringify(cardIds));
    return true;
  } catch (error) {
    console.error("완료 상태를 저장하지 못했습니다.", error);
    return false;
  }
}

function loadCompletedCardIds() {
  try {
    const text = localStorage.getItem("completedLearningCardIds");

    if (text === null) return [];

    const value = JSON.parse(text);
    return Array.isArray(value) && value.every((id) => Number.isInteger(id))
      ? value
      : [];
  } catch (error) {
    return [];
  }
}
```

화면 상태는 저장 실패와 별개로 바뀔 수 있다.
그래서 예제는 저장에 성공했을 때와 화면에서만 바뀌었을 때의 안내를 다르게 보여 준다.
저장소 값을 읽을 때도 접근 실패와 값 부재를 처리하고, 파싱 뒤 `정수 ID 배열`인지 확인한다.

## 비동기 작업은 상태를 먼저 알린다

요청을 시작하면 결과가 오기 전에 `loading` 상태를 보여 준다.
성공하면 `success`, 실패하면 `error`로 바꾼다.

```js
async function searchLearningCards(query, requestId) {
  state.phase = "loading";
  state.message = "학습 카드를 찾는 중입니다.";
  state.cards = [];
  render();

  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`/api/learning-cards?${params}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = response.status === 204 ? [] : await response.json();

    if (!isLearningCardList(data)) {
      throw new TypeError("잘못된 학습 카드 응답");
    }

    if (requestId !== latestRequestId) return;

    state.cards = data.map((card) => ({ ...card }));
    state.phase = "success";
    state.message = `${state.cards.length}개의 학습 카드를 찾았습니다.`;
  } catch (error) {
    if (requestId !== latestRequestId) return;

    console.error(error);
    state.cards = [];
    state.phase = "error";
    state.message = "학습 카드를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
  } finally {
    if (requestId === latestRequestId) {
      render();
    }
  }
}
```

`/api/learning-cards`는 흐름을 설명하는 교안용 주소이며 현재 밤데브의 실제 API라고 주장하지 않는다.
`URLSearchParams`는 주소의 질의 문자열을 올바른 형식으로 만든다.
이 교안용 API는 본문이 없는 성공 응답인 204를 빈 목록이라는 뜻으로 정했다고 가정한다.
실제 API의 약속도 같다고 단정하면 안 된다.
그 밖의 성공 응답은 JSON을 읽는다.
응답 객체는 `{ ...card }`로 얕게 복사했으며, 안쪽의 중첩 객체까지 복사되는 것은 아니다.

## 늦게 도착한 예전 응답을 버린다

사용자가 `HTML`을 검색한 뒤 곧바로 `JavaScript`를 검색했다고 생각해 보자.
두 번째 요청이 먼저 끝날 수도 있다.

```text
HTML 요청 시작 → JavaScript 요청 시작 → JavaScript 응답 → 늦은 HTML 응답
```

마지막 HTML 응답을 그대로 반영하면 화면이 최신 검색어와 맞지 않게 된다.
이를 오래된 응답(stale response), 곧 `더 이상 현재 요청에 속하지 않는 늦은 결과`라고 한다.

`latestRequestId`는 제출할 때마다 번호를 올린다.
빈 검색어를 새로 제출해도 번호가 바뀌므로 앞선 요청은 더 이상 현재 요청이 아니다.
결과를 상태에 넣기 직전에 번호가 최신인지 확인하고, 아니면 화면을 바꾸지 않는다.

중단 신호를 만드는 `AbortController`로 이전 fetch를 멈추는 방법도 있다.
그러나 중단만 믿지 말고 최종 반영 전에 최신 요청인지 확인하면 중단할 수 없는 작업과 이미 도착한 결과도 거를 수 있다.
요청 중단은 이미 서버가 끝낸 변경을 되돌리지 않는다.

## render는 현재 상태만 보고 그린다

render는 요청이나 리스너 등록을 시작하지 않고 현재 상태를 보여 주는 일에 집중한다.
`idle`은 안내, `loading`은 진행 중 문장, `success`는 결과, `error`는 실패 안내로 표현한다.

`role="status"`는 초점을 옮기지 않고도 보조 기술에 상태 변화를 알린다.
네이티브 입력과 버튼을 사용해 키보드에서도 같은 흐름을 실행하고 포커스 표시는 없애지 않는다.

## 이어서 연습하기

같은 예제에서 성공·실패·빈 검색의 순서를 손으로 적어 보세요.
자료 구조의 선택 기준은 [Map·Set](#/learn/algorithm/hash-map-set)에서 별도로 살펴볼 수 있습니다.
이 문서의 핵심 질문에 답한 뒤 상태가 바뀌는 곳과 화면을 다시 그리는 곳을 짚어 보세요.

## 공식 자료

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)

## 핵심 질문 답

입력을 정리해 상태를 바꾸고 render는 그 상태만 보여 주게 합니다. 리스너는 한 번 등록하고 저장 성공과 메모리 변경을 따로 안내합니다. 제출 때마다 빈 검색도 요청 번호를 올려 이전 작업을 무효화하고 성공·catch·finally에서 최신 번호만 상태와 화면에 반영합니다. 목록 재생성 뒤에는 같은 카드 버튼에 초점을 돌려주고 외부 글자는 textContent로 표시합니다.
