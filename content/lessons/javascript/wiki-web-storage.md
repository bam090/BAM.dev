# Web Storage의 저장과 복원

## 학습 목표

작은 편의 상태를 문자열로 저장·복원하고 부재·형태 오류·저장 실패를 구분해 안내할 수 있습니다.

## 한줄 요약

Web Storage는 origin별 문자열 저장소이므로 파싱과 검증을 거쳐 복원하고 실제 쓰기 성공 뒤에 저장 완료를 알립니다.

## 먼저 확인할 개념

[JSON 변환과 데이터 검증](#/learn/javascript/wiki-json) · [예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)을 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## 같은 origin 안의 문자열 저장소

origin은 scheme(통신 방식), host(호스트), port(포트)를 함께 비교하는 범위다.
`https://example.com`과 `http://example.com`은 통신 방식이 달라 같은 origin이 아니다.
프로그램의 현재 상태는 JavaScript 값이고, Web Storage에 넣는 표현은 문자열이다.
카드 내용의 기준 데이터와 완료·즐겨찾기 ID 같은 작은 편의 상태를 구분한다.


## 카드 즐겨찾기는 Web Storage에 문자열로 보관한다

Web Storage는 웹페이지가 브라우저에 이름과 값을 보관하는 기능이다.
두 저장소 모두 키와 값을 문자열로 다룬다.

| 저장소 | 기본 범위와 수명 |
| --- | --- |
| `localStorage` | 같은 origin에서 다시 열어도 남을 수 있음 |
| `sessionStorage` | 같은 origin의 현재 탭 세션 동안 사용 |

`localStorage`가 영구 보관을 보장한다는 뜻은 아니다.
사용자가 지우거나 브라우저가 정책에 따라 보관을 제한할 수 있다.

값이 없으면 `getItem()`은 `null`을 돌려준다.
배열이나 객체는 JSON 문자열로 바꾸어 저장하고 읽을 때 다시 파싱한다.
다음 예는 즐겨찾기한 학습 카드의 숫자 ID만 저장한다.

```js
function saveFavoriteCardIds(cardIds) {
  try {
    const text = JSON.stringify(cardIds);

    if (text === undefined) return false;

    localStorage.setItem("favoriteLearningCardIds", text);
    return true;
  } catch (error) {
    return false;
  }
}

function loadFavoriteCardIds() {
  try {
    const text = localStorage.getItem("favoriteLearningCardIds");

    if (text === null) return [];

    const value = JSON.parse(text);
    const isIdList = Array.isArray(value) &&
      value.every((id) => Number.isInteger(id));

    return isIdList ? value : [];
  } catch (error) {
    return [];
  }
}
```

저장소 접근, JSON 변환, 저장과 파싱에서 예외가 생길 수 있으므로 함께 처리한다.
파싱에 성공해도 `정수 ID의 배열`인지 다시 확인한다.
저장 성공 표시는 `saveFavoriteCardIds()`가 `true`를 돌려준 뒤에만 보여 준다.

즐겨찾기 ID는 이 브라우저에서 쓰는 작은 화면 편의 상태다.
카드 제목과 학습 내용의 기준 데이터까지 `localStorage`에 맡기지 않는다.
서버에서 받은 현재 카드 목록에 없는 ID라면 화면에서 제외하는 식으로 두 상태를 맞춘다.

## Web Storage는 작은 데이터베이스나 비밀 금고가 아니다

Web Storage 메서드는 동기식이다.
읽기와 쓰기가 끝날 때까지 현재 JavaScript가 기다리므로 크거나 자주 바뀌는 데이터를 계속 저장하면 화면 반응을 늦출 수 있다.

브라우저, 사용자 설정, 저장 모드에 모두 공통인 고정 용량은 없다.
저장 공간이 부족하거나 사용자가 저장을 막으면 `setItem()`이 `QuotaExceededError`를 던질 수 있다.
origin을 사용할 수 없거나 정책으로 접근이 막히면 저장소 접근에서 `SecurityError`가 생길 수도 있다.

같은 origin에서 실행되는 다른 스크립트도 저장값을 읽거나 바꿀 수 있고
Web Storage에는 JavaScript 읽기를 막는 보호가 없다.
비밀번호, 접근 토큰, 서버 권한의 기준처럼 노출되면 안 되는 비밀을 보관하지 않는다.

## 이어서 연습하기

[HTTP 요청·응답과 origin 경계](#/learn/javascript/wiki-http)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)
- [WHATWG HTML Standard — Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

## 핵심 질문 답

같은 origin의 작은 편의 상태를 JSON 문자열로 저장하며 getItem의 null은 값 부재로 처리합니다. 저장소 접근·변환·쓰기·읽기·파싱은 실패할 수 있고, 파싱한 뒤에도 정수 ID 배열처럼 필요한 모양을 검증합니다. 쓰기에 성공한 뒤에만 저장 완료라고 안내합니다. localStorage도 영구 보관·고정 용량을 보장하지 않고 같은 origin의 스크립트가 읽을 수 있어 비밀값은 넣지 않습니다.
