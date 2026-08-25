# 01. JavaScript와 실행

## 학습 목표

- HTML, CSS, JavaScript가 웹 페이지에서 맡는 역할을 구분할 수 있습니다.
- JavaScript 언어 기능과 브라우저가 제공하는 Web API를 구분할 수 있습니다.
- HTML에서 JavaScript 파일을 불러오는 방법과 `defer`의 역할을 설명할 수 있습니다.
- 코드가 기본적으로 위에서 아래로 실행된다는 뜻을 이해합니다.

## JavaScript란?

JavaScript는 웹 페이지에 동작을 추가하는 프로그래밍 언어입니다.

- HTML은 제목, 버튼, 이미지 같은 **내용과 구조**를 만듭니다.
- CSS는 색상과 크기, 배치 같은 **모양**을 꾸밉니다.
- JavaScript는 버튼을 눌렀을 때 화면을 바꾸는 등의 **동작**을 만듭니다.

예를 들어 JavaScript를 사용하면 다음과 같은 일을 할 수 있습니다.

- 버튼을 누르면 문구 바꾸기
- 입력한 값 확인하기
- 서버에서 데이터를 받아 화면에 표시하기

처음부터 이 모든 기능을 만들 필요는 없습니다. JavaScript의 기본 문법과 브라우저가 미리 준비한 도구를 조합하면 됩니다.

## JavaScript 언어와 브라우저 도구

브라우저에서 실행하는 JavaScript 코드는 **언어의 공통 규칙**과 **브라우저가 제공하는 도구**를 함께 사용합니다.

- 값 저장, 덧셈, 조건문, 함수는 JavaScript의 언어 규칙입니다.
- `document`처럼 HTML을 찾고 바꾸는 기능은 브라우저가 제공하는 도구입니다.

이처럼 실행 환경이 미리 제공하여 코드에서 사용할 수 있는 도구를 **API**라고 합니다.

```javascript
const price = 1200;
const total = price + 300;    // JavaScript 언어 규칙에 따른 계산
console.log(total);           // 실행 환경이 제공하는 출력 도구
document.querySelector("h1"); // 브라우저가 제공하는 HTML 도구
```

코드 문법은 다음 단원부터 하나씩 배웁니다. 지금은 `total`을 계산하는 규칙과 값을 보여 주는 `console.log()`의 제공자가 다르다는 점만 살펴봅니다.

> **참고: ECMAScript는 무엇인가요?**
> `const`나 숫자 덧셈처럼 JavaScript의 핵심 문법과 동작을 정한 공통 표준입니다. 지금은 이름을 외우기보다 “JavaScript의 공통 규칙”이라고 이해하면 충분합니다.

### 실행 환경이란?

코드를 실제로 실행하고 필요한 도구를 제공하는 곳을 **실행 환경**이라고 합니다. 이 교안에서는 브라우저가 실행 환경입니다. Node.js도 JavaScript를 실행할 수 있지만, 웹 페이지가 없으므로 일반적인 Node.js 환경에는 `document`가 없습니다.

## 왜 필요한가

문법을 올바르게 작성해도 파일 경로가 틀리면 JavaScript 파일을 불러오지 못합니다. 또한 HTML 버튼이 만들어지기 전에 JavaScript가 그 버튼을 찾으면 원하는 요소를 얻을 수 없습니다.

따라서 오류를 찾을 때는 코드 내용뿐 아니라 다음 두 가지도 확인해야 합니다.

1. **어디에서 실행되는가?** — 브라우저에서 제공하는 기능을 사용하는 코드인가?
2. **언제 실행되는가?** — 필요한 HTML 요소가 만들어진 뒤에 실행되는가?

## HTML에서 스크립트 불러오기

외부 JavaScript 파일은 `script` 요소의 `src` 속성으로 불러옵니다.

```html
<script src="./main.js" defer></script>
```

`src`는 불러올 파일의 위치입니다. 이 예제에서는 HTML과 같은 폴더의 `main.js`를 불러옵니다.

`defer`를 사용하면 브라우저는 HTML을 계속 읽으면서 JavaScript 파일을 불러옵니다. HTML을 모두 읽고 파일도 준비되면 JavaScript를 실행하므로, HTML 아래쪽의 요소까지 준비된 뒤 코드가 실행됩니다.

위 예제에서 `defer`만 빼면 브라우저는 `script`를 만난 위치에서 HTML 읽기를 멈추고, 파일을 불러와 실행한 뒤 다시 HTML을 읽습니다.

## 최소 코드

같은 실행 흐름 안에서 JavaScript 문장은 기본적으로 위에서 아래로 하나씩 실행됩니다.

```javascript
console.log("첫 번째");
console.log("두 번째");
```

출력 순서는 `첫 번째 → 두 번째`입니다. 다만 이벤트나 비동기 작업의 결과를 처리하는 코드는 나중에 실행될 수 있습니다. 이 내용은 뒤의 DOM과 비동기 단원에서 배웁니다.

## 실행 흐름

다음 코드를 기준으로 흐름을 따라가 봅시다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>실행 확인</title>
    <script src="./main.js" defer></script>
  </head>
  <body>
    <h1>JavaScript 시작</h1>
  </body>
</html>
```

```javascript
const heading = document.querySelector("h1");
console.log(heading.textContent);
```

1. 브라우저가 HTML을 읽다가 `main.js`를 발견하고 파일을 불러오기 시작합니다.
2. `defer`가 있으므로 `<h1>`까지 HTML을 계속 읽습니다.
3. HTML을 모두 읽고 `main.js`도 준비되면 JavaScript를 실행합니다.
4. JavaScript가 첫 번째 `<h1>`을 찾아 `JavaScript 시작`을 Console에 보여 줍니다.

## 흔한 실수

### 1. 잘못된 파일 경로

```html
<script src="./js/mian.js" defer></script>
```

실제 파일이 `main.js`라면 `mian.js`라는 오타 때문에 요청이 404로 실패하고, 그 JavaScript 파일의 코드는 실행되지 않습니다. `defer`는 실행 시점만 바꾸므로 잘못된 경로를 고쳐 주지 않습니다.

### 2. 요소보다 먼저 실행하기

```html
<script>
  const button = document.querySelector("button"); // 아직 button이 없음
</script>
<button>확인</button>
```

이 시점의 결과는 `null`입니다. 스크립트를 요소 뒤에 두거나 외부 스크립트에 `defer`를 적용합니다.

## 확인 포인트

코드가 동작하지 않을 때는 다음 순서로 확인합니다.

1. `src`의 파일 이름과 위치가 실제 파일과 맞는가?
2. 브라우저 개발자 도구의 Console과 Network에 오류가 보이는가?
3. JavaScript가 찾는 HTML 요소가 실행 전에 준비됐는가?

## 확인 문제

1. `const price = 1200; const total = price + 300; console.log(total);`에서 계산 규칙과 출력 도구는 각각 누가 정하거나 제공할까요?
2. 외부 스크립트에 `defer`를 사용하면 HTML 읽기와 JavaScript 실행 순서는 어떻게 달라질까요?
3. `querySelector()`의 결과가 `null`일 때 확인할 항목을 두 가지 적어 보세요.

## 공식 자료

- [MDN: JavaScript가 뭔가요?](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Scripting/What_is_JavaScript)
- [Ecma International: ECMA-262 ECMAScript 2026 언어 명세](https://ecma-international.org/publications-and-standards/standards/ecma-262/)
- [WHATWG HTML Standard: script 요소와 defer](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)

공식 자료 확인일: 2026-08-18
