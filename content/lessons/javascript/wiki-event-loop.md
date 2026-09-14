# 이벤트 루프: 동기 코드·microtask·task의 실행 순서

## 학습 목표

같은 실행 안의 동기 코드와 Promise 반응·타이머 콜백 순서를 나누어 예측할 수 있습니다.

## 한줄 요약

현재 동기 코드가 끝난 뒤 microtask를 처리하고 다음 task로 넘어가므로 타이머 0도 바로 끼어들지 않습니다.

## 먼저 확인할 개념

[Promise 상태와 반환 연결](#/learn/javascript/wiki-promise-chain)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## 어떤 일은 나중에 끝난다

덧셈이나 문자열 만들기는 실행한 자리에서 곧바로 결과가 나온다.
이런 흐름을 동기(synchronous), 곧 `현재 일이 끝나야 다음 줄로 가는 실행`이라고 한다.

서버 응답, 파일 읽기, 사용자의 다음 행동처럼 끝나는 시점을 지금 알 수 없는 일도 있다.
이런 흐름을 비동기(asynchronous), 곧 `결과가 나중에 도착할 수 있는 실행`이라고 한다.

비동기 작업을 시작한 뒤에도 브라우저는 다른 JavaScript와 사용자 입력을 처리할 수 있다.
결과가 도착하면 미리 연결해 둔 함수가 이어서 실행된다.

```js
console.log("주문을 받았습니다.");

setTimeout(() => {
  console.log("음료가 준비됐습니다.");
}, 0);

console.log("다음 주문을 받습니다.");
```

출력 순서는 다음과 같다.

```text
주문을 받았습니다.
다음 주문을 받습니다.
음료가 준비됐습니다.
```

대기 시간이 `0`이어도 등록한 함수가 현재 실행 중인 코드보다 먼저 끼어들지는 않는다.

`setTimeout()`은 정한 대기 시간이 지난 뒤 실행할 함수를 등록한다.
시간이 지났다는 사실은 함수가 현재 코드보다 먼저 실행된다는 뜻이 아니다.

## 현재 코드 뒤에는 microtask와 task가 이어진다

브라우저는 할 일을 차례로 꺼내 실행한다.
클릭 이벤트나 타이머 콜백처럼 비교적 큰 실행 단위를 task라고 한다.
Promise 반응처럼 현재 JavaScript가 끝난 직후 처리하는 작은 대기 단위를 microtask라고 한다.

입문 단계에서는 다음 순서로 이해할 수 있다.

```text
현재 동기 JavaScript
→ Promise의 then·catch 같은 microtask
→ 다음 타이머·이벤트 같은 task
```

이 설명은 기본 흐름을 읽기 위한 모형이다.
종류가 다른 모든 task 사이에 하나의 세밀한 전체 순서가 있다고 단정하지 않는다.
microtask가 계속 새 microtask를 만들면 브라우저가 화면을 그리거나 다음 이벤트를 처리하는 시점도 늦어질 수 있다.

## 같은 task에서 등록한 순서 읽기

브라우저에서 다음 전체 블록을 한 번 실행한다. 다른 작업이 끼어드는 네트워크 예제가 아니다.

```js
console.log("시작");
setTimeout(() => console.log("타이머"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("끝");
```

현재 코드의 시작·끝이 먼저 나오고 Promise 반응 뒤에 타이머가 나온다.
등록 줄이 위에 있다는 이유만으로 타이머 콜백이 먼저 실행되는 것은 아니다.
실제 콜백이 수행될 시점과 등록한 시점을 나눠 화살표로 적어 보자.


## 이어서 연습하기

[JSON 변환과 데이터 검증](#/learn/javascript/wiki-json)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)
- [ECMAScript 2026 — Async Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-async-function-definitions)
- [WHATWG HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 핵심 질문 답

같은 task에서 실행 중인 동기 코드를 먼저 끝내고 Promise의 then·catch 같은 microtask를 처리한 뒤 다음 타이머 task를 진행합니다. 타이머 0은 즉시 실행이 아니며 실제 시간을 보장하지도 않습니다. microtask가 계속 새 microtask를 만들면 다음 task와 화면 갱신도 늦어질 수 있습니다. 서로 다른 종류의 모든 task에 이 한 예의 세부 순서를 일반화하지 않습니다.
