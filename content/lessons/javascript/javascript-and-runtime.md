# 01. JavaScript와 실행

## 학습 목표

- JavaScript와 ECMAScript의 관계를 설명할 수 있습니다.
- JavaScript 언어와 브라우저 Web API를 구분할 수 있습니다.
- HTML에서 JavaScript 파일을 불러오는 순서와 `defer`의 역할을 설명할 수 있습니다.
- 코드가 기본적으로 위에서 아래로 실행된다는 뜻을 이해합니다.

## 왜 필요한가

문법을 올바르게 작성해도 스크립트 경로가 틀렸거나, HTML 요소가 만들어지기 전에 JavaScript가 요소를 찾으면 화면이 동작하지 않습니다. 코드를 고치기 전에 **어디에서 언제 실행되는 코드인지** 판단할 수 있어야 오류의 원인을 찾을 수 있습니다.

## 비유: 언어와 작업장의 도구

> **비유**  
> JavaScript 언어는 작업자가 따르는 공통 작업 규칙이고, 브라우저는 작업장을 제공하는 운영자입니다. 변수와 함수는 공통 규칙에 속하지만, `document`와 `fetch()`는 브라우저 작업장에 준비된 도구입니다.

비유는 큰 그림을 위한 설명입니다. 정확히는 ECMAScript 명세가 언어의 문법과 의미를 정의하고, 브라우저가 DOM과 Fetch 같은 Web API를 제공합니다.

## 정확한 설명

### JavaScript와 ECMAScript

- **ECMAScript**는 JavaScript 언어의 문법, 타입, 연산, 객체 등의 표준을 정의한 명세입니다.
- **JavaScript**는 이 표준을 구현하여 브라우저나 Node.js 같은 실행 환경에서 사용하는 프로그래밍 언어입니다.
- JavaScript는 실행 중에 값의 타입이 결정되는 동적 타입 언어입니다.

### 실행 환경

같은 JavaScript 문법이라도 실행 환경이 제공하는 기능은 다를 수 있습니다.

```javascript
const message = "안녕하세요"; // JavaScript 언어
console.log(message);          // 실행 환경이 제공하는 console 사용
```

브라우저에서는 다음과 같은 객체를 사용할 수 있습니다.

```javascript
document.querySelector("h1"); // DOM API
fetch("/api/posts");          // Fetch API
```

반면 브라우저가 아닌 실행 환경에서는 `document`가 존재하지 않을 수 있습니다.

### HTML에서 스크립트 불러오기

외부 JavaScript 파일은 `script` 요소의 `src` 속성으로 불러옵니다.

```html
<script src="./main.js" defer></script>
```

일반적인 외부 스크립트에 `defer`를 사용하면 브라우저는 HTML 분석과 스크립트 다운로드를 함께 진행하고, HTML 문서 분석이 끝난 뒤 스크립트를 문서에 작성된 순서대로 실행합니다.

```text
HTML 분석 시작
├─ HTML 분석 계속
└─ main.js 다운로드
        ↓
HTML 분석 완료
        ↓
main.js 실행
        ↓
DOMContentLoaded 발생
```

`defer`를 쓰지 않은 일반 스크립트는 브라우저가 해당 위치에서 HTML 분석을 잠시 멈추고 스크립트를 내려받아 실행할 수 있습니다.

### 기본 실행 순서

JavaScript 문장은 기본적으로 위에서 아래로 하나씩 실행됩니다.

```javascript
console.log("첫 번째");
console.log("두 번째");
console.log("세 번째");
```

출력 순서는 `첫 번째 → 두 번째 → 세 번째`입니다. 다만 이벤트 처리 함수나 비동기 작업은 등록만 해 두었다가 조건이 충족된 뒤 실행될 수 있습니다. 이 차이는 뒤의 DOM과 비동기 단원에서 다룹니다.

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

1. 브라우저가 HTML을 위에서 아래로 분석합니다.
2. `main.js`를 발견하고 다운로드하지만 `defer` 때문에 HTML 분석을 계속합니다.
3. `<h1>`을 포함한 DOM 구성이 끝납니다.
4. `main.js`가 실행됩니다.
5. `querySelector()`가 첫 번째 `h1` 요소를 반환합니다.
6. 요소의 `textContent`인 `JavaScript 시작`을 출력합니다.

## 최소 코드

```javascript
const courseName = "JavaScript";
console.log("학습 시작:", courseName);
```

- 문자열 값 `"JavaScript"`를 만듭니다.
- 그 값을 `courseName`이라는 이름에 연결합니다.
- `console.log()`로 현재 값을 확인합니다.

## 흔한 실수

### 1. Java와 JavaScript를 같은 언어로 생각하기

이름이 비슷하지만 서로 다른 언어입니다. 문법 일부가 닮아 보여도 타입 체계와 실행 방식, 사용하는 생태계가 다릅니다.

### 2. 잘못된 파일 경로

```html
<script src="./js/mian.js" defer></script>
```

실제 파일이 `main.js`라면 오타 때문에 아무 코드도 실행되지 않습니다. 브라우저 개발자 도구의 Console과 Network에서 오류를 확인해야 합니다.

### 3. 요소보다 먼저 실행하기

```html
<script>
  const button = document.querySelector("button"); // 아직 button이 없음
</script>
<button>확인</button>
```

이 시점의 결과는 `null`입니다. 스크립트를 요소 뒤에 두거나 외부 스크립트에 `defer`를 적용합니다.

### 4. 콘솔의 `undefined`를 무조건 오류로 생각하기

개발자 도구는 식의 평가 결과를 함께 보여줄 수 있습니다. 값을 반환하지 않는 선언이나 함수의 결과가 `undefined`라고 표시되는 것 자체는 오류 메시지가 아닙니다. 실제 오류는 보통 `TypeError`, `ReferenceError`, `SyntaxError` 같은 이름과 위치를 함께 표시합니다.

## 확인 문제

1. JavaScript 언어와 브라우저 Web API의 차이를 한 문장씩 설명해 보세요.
2. `document.querySelector()`는 ECMAScript 언어 자체의 기능일까요, 브라우저가 제공하는 기능일까요?
3. 외부 스크립트에 `defer`를 사용하면 HTML 분석과 스크립트 실행 순서는 어떻게 달라질까요?
4. `querySelector()`의 결과가 `null`일 때 확인할 항목을 두 가지 적어 보세요.

