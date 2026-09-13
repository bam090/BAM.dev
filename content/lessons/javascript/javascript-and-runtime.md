# 01. JavaScript와 실행

## 학습 목표

- HTML은 내용, CSS는 모양, JavaScript는 동작을 맡는다는 것을 이해합니다.
- JavaScript의 공통 규칙과 브라우저가 준비한 도구를 구분합니다.
- HTML과 JavaScript 파일을 연결하고, HTML이 준비된 뒤 코드를 실행할 수 있습니다.
- 간단한 코드는 첫 줄부터 아래로 차례대로 실행된다는 것을 이해합니다.


## 1. HTML, CSS, JavaScript가 하는 일

웹 페이지에 `시작 전`이라는 글자가 있다고 생각해 보세요.

- **HTML**은 화면에 글자를 놓습니다.
- **CSS**는 글자의 색과 크기를 꾸밉니다.
- **JavaScript**는 `시작 전`을 `JavaScript 실행 완료`로 바꿉니다.

HTML은 **내용**, CSS는 **모양**, JavaScript는 **동작**을 맡는다고 기억하면 됩니다.

## 2. ECMAScript는 무엇인가요?

여러 브라우저가 JavaScript 코드를 같은 규칙으로 이해해야 합니다.
그래서 JavaScript가 따라야 할 공통 규칙을 정했습니다.
그 공통 규칙의 이름이 **ECMAScript**입니다.

ECMAScript라는 코드를 따로 작성하는 것은 아닙니다.
“ECMAScript는 JavaScript의 공통 규칙이다”라고만 기억하면 됩니다.

## 3. 브라우저가 준비한 도구

JavaScript 코드는 실제로 움직일 장소가 필요합니다.
이번 예제에서는 **브라우저**가 그 장소입니다.
코드가 실제로 움직이는 장소를 **실행 환경**이라고 부릅니다.

브라우저는 웹 페이지를 다룰 수 있는 도구도 준비해 둡니다.
그중 `document`는 화면의 HTML을 찾고 바꿀 때 쓰는 도구입니다.
브라우저가 미리 준비한 이런 도구를 **Web API**라고 부릅니다.

딱 두 가지만 구분해 보세요.

- ECMAScript는 JavaScript를 작성하는 **공통 규칙**입니다.
- `document`는 브라우저가 준비한 **도구**입니다.

## 4. HTML과 JavaScript 파일 연결하기

HTML 파일과 JavaScript 파일은 다음 한 줄로 연결합니다.

```html
<script src="./main.js" defer></script>
```

- `script`는 JavaScript를 사용하겠다는 뜻입니다.
- `src="./main.js"`는 `main.js` 파일의 위치를 알려 줍니다.
- `defer`는 HTML을 끝까지 읽은 뒤 JavaScript를 실행하라는 뜻입니다.

지금처럼 `src`로 연결한 일반 JavaScript 파일은 다음 순서로 준비됩니다.

1. 브라우저가 HTML을 읽습니다.
2. `main.js`를 발견하면 파일을 불러옵니다.
3. `defer`가 있으므로 HTML을 끝까지 읽습니다.
4. HTML이 준비되면 `main.js`를 실행합니다.

## 5. 코드는 어느 줄부터 실행될까요?

지금 배우는 간단한 코드는 첫 줄부터 아래로 차례대로 실행됩니다.
요리 순서의 1번을 한 뒤 2번을 하는 것과 같습니다.
나중에 실행 순서가 달라지는 코드도 배우지만, 지금은 위에서 아래로 읽으면 됩니다.

## 실행 가능한 최소 예제

같은 폴더에 `index.html`과 `main.js`를 만드세요.

`index.html`에는 다음 코드를 작성합니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>실행 확인</title>
    <script src="./main.js" defer></script>
  </head>
  <body>
    <h1 id="title">시작 전</h1>
  </body>
</html>
```

`main.js`에는 다음 코드를 작성합니다.

```javascript
console.log("1. JavaScript 시작");
document.querySelector("#title").textContent = "JavaScript 실행 완료";
console.log("2. JavaScript 끝");
```

가운데 줄을 천천히 나누어 읽어 보세요.

- `document`는 현재 웹 페이지를 가리킵니다.
- `querySelector("#title")`은 `id`가 `title`인 HTML을 찾습니다.
- `textContent = "JavaScript 실행 완료"`는 찾은 곳의 글자를 바꿉니다.

`index.html`을 브라우저에서 열면 화면의 글자가 `JavaScript 실행 완료`로 바뀝니다.
브라우저의 Console에는 다음 두 줄이 보입니다.

```text
1. JavaScript 시작
2. JavaScript 끝
```

Console은 코드가 실행되었는지 확인하는 점검 화면입니다.

## 실행 흐름

1. 브라우저가 `index.html`을 읽습니다.
2. `main.js`를 발견하고 파일을 불러옵니다.
3. `defer`가 있으므로 `시작 전`이라는 HTML까지 먼저 준비합니다.
4. JavaScript 첫 줄이 `1. JavaScript 시작`을 출력합니다.
5. 둘째 줄이 화면의 글자를 `JavaScript 실행 완료`로 바꿉니다.
6. 마지막 줄이 `2. JavaScript 끝`을 출력합니다.

## 간단 Q&A

**Q. ECMAScript를 새로 배워야 하나요?**

A. 아닙니다. ECMAScript는 JavaScript가 따르는 공통 규칙의 이름입니다.

**Q. `document`는 누가 준비한 도구인가요?**

A. 브라우저가 웹 페이지를 찾고 바꿀 수 있도록 준비한 도구입니다.

**Q. 화면의 글자가 바뀌지 않으면 무엇을 확인해야 하나요?**

A. `main.js`의 위치와 이름, `defer`, HTML의 `id="title"`과 JavaScript의 `"#title"`이 같은지 확인합니다.

## 확인 문제

예제를 보지 않고 자신의 말로 답해 보세요.

1. HTML, CSS, JavaScript는 각각 어떤 일을 하나요?
2. ECMAScript와 `document`는 무엇이 다른가요?
3. `src`와 `defer`는 각각 어떤 일을 하나요?
4. 예제의 JavaScript 세 줄은 어떤 순서로 실행되나요?

## 핵심 요약

- HTML은 내용, CSS는 모양, JavaScript는 동작을 맡습니다.
- ECMAScript는 JavaScript의 공통 규칙입니다.
- `document`는 브라우저가 준비한 도구입니다.
- `src`는 파일 위치를 알려 주고, `defer`는 HTML이 준비된 뒤 코드를 실행하게 합니다.
- 지금 배운 간단한 코드는 위에서 아래로 실행됩니다.

## 공식 자료

- [MDN: JavaScript가 뭔가요?](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Scripting/What_is_JavaScript)
- [ECMAScript 언어 명세: Overview](https://tc39.es/ecma262/multipage/overview.html)
- [MDN: script 요소](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script)

공식 자료 확인일: 2026-08-24

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 아래 내용을 면접관에게 설명하듯 읽어 보세요.

### 답변 1

HTML은 화면에 글과 버튼 같은 내용을 놓습니다.
CSS는 그 내용의 색과 크기 같은 모양을 꾸밉니다.
JavaScript는 화면의 글자를 바꾸는 것과 같은 동작을 만듭니다.

### 답변 2

ECMAScript는 JavaScript가 따라야 하는 공통 규칙입니다.
`document`는 브라우저가 웹 페이지를 찾고 바꾸도록 준비한 도구입니다.
하나는 언어의 규칙이고, 다른 하나는 브라우저의 도구입니다.

### 답변 3

`src`는 불러올 JavaScript 파일의 위치를 알려 줍니다.
`defer`는 HTML을 끝까지 준비한 뒤 JavaScript를 실행하게 합니다.
그래서 예제에서는 `<h1>`이 준비된 다음 JavaScript가 실행됩니다.

### 답변 4

첫 줄이 `1. JavaScript 시작`을 출력합니다.
둘째 줄이 화면의 글자를 `JavaScript 실행 완료`로 바꿉니다.
마지막 줄이 `2. JavaScript 끝`을 출력합니다.
