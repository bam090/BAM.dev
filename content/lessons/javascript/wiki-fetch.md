# fetch 응답의 실패 경계

## 학습 목표

요청 실패·HTTP 실패·본문 파싱·데이터 형태 검증을 순서대로 나누어 처리할 수 있습니다.

## 한줄 요약

fetch가 Response를 줬어도 HTTP 상태와 본문 읽기·데이터 모양을 확인해야 사용할 결과인지 알 수 있습니다.

## 먼저 확인할 개념

[async·await와 실패 처리](#/learn/javascript/wiki-async-await) · [HTTP 요청·응답과 origin 경계](#/learn/javascript/wiki-http) · [JSON 변환과 데이터 검증](#/learn/javascript/wiki-json)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## JSON 문법이 맞아도 데이터가 쓸 수 있는 것은 아니다

`{"title":42}`는 올바른 JSON이다.
그러나 화면이 `title`을 문자열로 요구한다면 사용할 수 없다.
파싱은 문법만 확인하므로 필요한 필드와 타입은 따로 검증한다.

```js
function isLearningCard(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger(value.id) &&
    typeof value.topic === "string" &&
    typeof value.title === "string"
  );
}

function isLearningCardList(value) {
  return Array.isArray(value) && value.every(isLearningCard);
}

```

`typeof null`도 `"object"`이므로 객체 형태를 확인할 때 `value !== null`을 함께 검사한다.
서버와 저장소에서 읽은 값은 내 프로그램 밖에서 들어온 값이므로 믿고 사용하기 전에 필요한 모양을 확인한다.

## `fetch()`는 Response를 담을 Promise를 돌려준다

`fetch()`는 요청을 시작하고 나중에 Response를 알려 줄 Promise를 반환한다.
Response는 `상태 코드, 헤더, 본문을 읽는 기능을 담은 응답 객체`다.

가장 중요한 규칙은 다음과 같다.

> 서버가 404나 500을 응답해도 `fetch()` Promise는 보통 fulfilled된다.

404와 500도 서버에서 도착한 HTTP 응답이기 때문이다.
`fetch()`가 reject되는 주된 경우는 네트워크 실패, 브라우저가 CORS 때문에 응답 공유를 막은 경우,
요청 중단처럼 Response를 정상적으로 제공할 수 없는 경우다.

`response.ok`는 상태 코드가 200부터 299일 때만 `true`다.

```js
async function loadLearningCards() {
  let response;

  try {
    response = await fetch("/api/learning-cards");
  } catch (error) {
    return { ok: false, message: "서버에 연결하지 못했습니다." };
  }

  if (!response.ok) {
    return { ok: false, message: `HTTP ${response.status}` };
  }

  try {
    const data = response.status === 204 ? [] : await response.json();

    if (!isLearningCardList(data)) {
      return { ok: false, message: "데이터 모양이 올바르지 않습니다." };
    }

    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, message: "응답을 JSON으로 읽지 못했습니다." };
  }
}
```

`/api/learning-cards`는 흐름을 설명하기 위한 교안용 주소다.
현재 밤데브에 이 API가 실제로 존재한다고 뜻하지 않는다.
이 예에서 본문이 없는 `204`는 카드가 0개인 성공 결과로 정했다.
실제 API가 204를 어떤 뜻으로 쓰는지는 그 API의 약속을 확인해야 한다.

이 함수는 실패를 네 단계로 나눈다.

1. 요청 자체가 Response를 만들지 못함
2. Response는 왔지만 HTTP 상태가 성공 범위가 아님
3. 본문이 있는 성공 상태지만 JSON으로 읽지 못함
4. JSON은 맞지만 학습 카드 배열 모양이 아님

응답 본문은 기본적으로 한 번만 읽는다.
`response.json()`으로 소비한 같은 본문을 다시 `response.text()`로 읽을 수 없다.

## 이어서 연습하기

[데이터 흐름 종합: 입력부터 최신 화면까지](#/learn/javascript/wiki-flow-review)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)
- [WHATWG HTML Standard — Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

## 핵심 질문 답

먼저 요청이 Response를 제공했는지, 그다음 ok에 해당하는 2xx 상태인지 확인합니다. 404·500도 Response이므로 fetch가 자동으로 reject한다고 생각하면 안 됩니다. 본문이 없는 상태는 API 계약에 맞게 처리하고, 있는 본문은 json을 기다린 뒤 필요한 데이터 형태를 검사합니다. 같은 응답 본문은 보통 한 번만 소비하므로 파싱 결과를 재사용합니다.
