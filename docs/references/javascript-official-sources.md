# JavaScript 교안 공식 문서 검증 기록

## 검증 기준

- 확인일: 2026-08-15
- 언어 규칙의 최우선 기준: TC39의 ECMAScript 언어 명세
- 브라우저 API와 학습 설명의 기준: MDN Web Docs의 직접 관련 가이드와 API 레퍼런스
- 교안에서는 ECMAScript가 정의하는 언어 기능과 브라우저가 제공하는 Web API를 구분했습니다.
- 아래에는 교안 작성 과정에서 실제로 열어 질문과 직접 관련된 내용을 확인한 문서만 기록했습니다.

## 언어와 실행

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [ECMAScript Language Specification - ECMAScript Data Types and Values](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html) | TC39의 현재 명세 초안에서 ECMAScript 언어 타입, 원시 타입과 Object, 타입 변환과 비교의 기준 확인 | 01, 02, 04 |
| [MDN - JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) | 문법과 타입, 제어 흐름, 함수, 객체, Promise로 이어지는 공식 학습 범위 | 전체 구성 |
| [MDN - JavaScript language overview](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Language_overview) | 동적 타입, 함수가 호출 가능한 객체라는 점, 배열이 특별한 객체라는 점, 엄격 동등 비교 | 01, 02, 03, 04 |
| [MDN - Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) | 원시 타입과 객체, 동적 타입, 변수 선언과 배열 리터럴 | 02, 04 |
| [MDN - `<script>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script) | 클래식 외부 스크립트의 `defer` 실행 시점과 문서 순서 보장, `DOMContentLoaded`와의 관계 | 01 |
| [MDN - Add JavaScript to your web page](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Add_JavaScript_to_your_web_page) | 일반 스크립트의 파싱 시 실행과 이후 요소 접근 문제, 외부 스크립트의 `defer` 사용 | 01 |

## 값, 변수, 연산자, 제어 흐름

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [MDN - Statements and declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements) | 선언문과 제어문 종류, `let`·`const`의 블록 범위 | 02 |
| [MDN - `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) | `let`의 블록 스코프와 초기화 전 접근 제한 | 02, 03 |
| [MDN - Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) | `if...else`, 블록, `try...catch`의 기본 흐름 | 02, 06 |
| [MDN - Expressions and operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators) | 비교·논리·대입 연산자, 선택적 연결과 스프레드 문법 | 02, 04 |
| [MDN - Nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) | `??`는 왼쪽이 `null` 또는 `undefined`일 때만 오른쪽을 반환함 | 02, 07 |
| [MDN - Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) | `?.` 앞의 참조가 nullish이면 오류 대신 `undefined`로 단축 평가됨 | 02 |
| [MDN - Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) | boolean 문맥에서 거짓으로 변환되는 값의 목록 | 02 |

## 함수, 스코프, 클로저

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [MDN - Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions) | 함수 선언·표현식·화살표 함수의 형태, 함수 선언의 호이스팅, 화살표 함수의 의미 차이 | 03 |
| [MDN - Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) | 화살표 함수가 자체 `this`, `arguments`, `super` 바인딩을 갖지 않고 생성자로 쓸 수 없다는 점 | 03 |
| [MDN - Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope) | 전역, 모듈, 함수, 블록 스코프와 안쪽·바깥쪽 범위의 접근 관계 | 03 |
| [MDN - Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) | 클로저는 함수와 함수가 선언된 렉시컬 환경의 결합이며 바깥 실행 종료 후에도 접근을 유지한다는 점 | 03 |

## 배열, 객체, 표준 내장 객체

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [MDN - Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) | 객체 속성, 객체 리터럴, 점·대괄호 속성 접근 | 04 |
| [MDN - Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | 배열의 `length`와 배열 메서드, 배열이 순서 있는 값을 다루는 특별한 객체라는 점 | 04 |
| [MDN - `Array.prototype.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) | 각 요소에 콜백을 적용한 결과로 새 배열을 만든다는 점 | 04, 07 |
| [MDN - `Array.prototype.filter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) | 조건을 만족하는 요소의 얕은 복사본으로 새 배열을 만든다는 점 | 04, 07 |
| [MDN - `Array.prototype.sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) | 원본 배열을 제자리 정렬하며, 기본 정렬은 문자열 변환 후 비교하고 숫자 정렬에는 비교 함수가 필요하다는 점 | 04 |
| [MDN - `Array.prototype.toSorted()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) | 원본을 변경하지 않고 정렬한 새 배열을 반환한다는 점 | 04 |
| [MDN - `JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) | JavaScript 값을 JSON 문자열로 변환하는 동작과 표현 제한 | 04 |
| [MDN - `JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) | JSON 문자열을 JavaScript 값으로 변환하고 잘못된 JSON에서 `SyntaxError`가 발생한다는 점 | 04 |
| [MDN - `Date.prototype.getMonth()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth) | 지역 시간 기준 월을 `0`부터 `11`까지 반환한다는 점 | 04 |

## DOM과 이벤트

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [MDN - `DOMContentLoaded`](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event) | 문서 분석과 지연 스크립트 실행 후 발생하며 이미지 로딩까지 기다리지는 않는다는 점 | 01, 05 |
| [MDN - `Document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) | 첫 일치 요소 또는 `null`을 반환하고, 잘못된 선택자는 `SyntaxError`를 발생시킨다는 점 | 05 |
| [MDN - Selection and traversal on the DOM tree](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Selection_and_traversal_on_the_DOM_tree) | `querySelectorAll()`이 정적 `NodeList`를 반환하고 결과가 없으면 빈 목록이라는 점 | 05 |
| [MDN - `Document.createElement()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement) | 지정한 태그 이름의 새 `Element`를 생성하지만 문서에 자동 삽입하지 않는다는 점 | 05 |
| [MDN - `EventTarget.addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) | 이벤트 종류와 리스너 함수 등록, 리스너에 Event 객체가 전달되는 동작 | 05 |
| [MDN - `Event.target`](https://developer.mozilla.org/en-US/docs/Web/API/Event/target) | 이벤트가 처음 전달된 요소이며 이벤트 위임에서 `currentTarget`과 다를 수 있다는 점 | 05 |
| [MDN - `Event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) | 취소 가능한 이벤트의 기본 동작을 막되 이벤트 전파 자체를 막지는 않는다는 점 | 05 |
| [MDN - `Node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | 노드와 자손의 텍스트 내용을 읽고 바꾸는 프로퍼티의 동작 | 05, 07 |
| [MDN - `Element.innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) | 문자열을 HTML로 해석해 자손을 교체하는 동작, 신뢰할 수 없는 입력에서의 XSS 위험, 일반 텍스트에는 `textContent`를 권장한다는 점 | 05 |
| [MDN - `Element.closest()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) | 현재 요소부터 조상 방향으로 선택자와 일치하는 가장 가까운 요소를 찾는 동작 | 05, 07 |
| [MDN - `Element.classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) | 클래스 토큰을 다루는 `DOMTokenList`와 `add`, `remove`, `toggle`, `contains` | 05 |
| [MDN - `HTMLElement.dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) | `data-*` 속성의 대시 이름이 camelCase 프로퍼티로 대응되고 값은 문자열로 설정된다는 점 | 05, 07 |
| [MDN - `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) | 폼 필드와 값을 나타내는 키·값 쌍을 구성하고 `get()` 등으로 읽는 동작 | 05, 07 |

## Promise와 Fetch

| 공식 문서 | 확인한 내용 | 반영 문서 |
| --- | --- | --- |
| [MDN - Using promises](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises) | Promise의 비동기 결과 표현, 체이닝, 오류 처리, `async/await`의 관계 | 06 |
| [MDN - `Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) | Promise 이터러블을 받아 모두 이행되면 결과 배열로 이행하고 하나라도 거부되면 거부되는 동작 | 06 |
| [MDN - `async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) | `async` 함수는 항상 Promise를 반환하고 `await`로 함수 내부의 비동기 흐름을 이어가는 동작 | 06 |
| [MDN - `Window.fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) | `Response`로 이행하는 Promise를 반환하며 HTTP 오류 상태만으로는 보통 거부되지 않는다는 점 | 06, 07 |
| [MDN - Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | `response.ok` 검사, 응답 본문 메서드가 Promise를 반환하는 요청 처리 흐름 | 06, 07 |
| [MDN - `Window.setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) | 타이머가 비동기적으로 콜백을 예약하며 지연 시간이 `0`이어도 현재 코드보다 즉시 먼저 실행되지 않는다는 점 | 06 |

## 문서 사용 시 주의

- ECMAScript 명세는 언어 구현의 정확한 기준이지만 입문자가 처음부터 전부 읽기에는 어렵습니다. 이 교안은 명세의 핵심 규칙을 MDN의 설명과 대조해 쉬운 문장으로 풀었습니다.
- MDN의 브라우저 호환성 표는 실행 환경에 따라 달라질 수 있습니다. 실제 프로젝트에서는 대상 브라우저와 런타임 버전을 별도로 확인해야 합니다.
- 교안의 비유는 이해를 돕기 위한 것이며, 기술의 공식 정의를 대체하지 않습니다.
- 예제 코드는 학습을 위한 최소 코드입니다. 실제 서비스에서는 입력 검증, 접근성, 보안, 오류 표시, 테스트와 같은 요구사항을 더 고려해야 합니다.
