# JavaScript 교안 공식 문서 검증 기록

## 검증 기준

- 확인일: 2026-08-18
- JavaScript 언어 규칙은 ECMAScript 명세와 MDN JavaScript 문서를 대조했습니다.
- 브라우저 기능은 WHATWG 표준과 MDN Web API 문서를 대조했습니다.
- 교안에는 실제 설명을 확인하는 데 사용한 자료만 남겼습니다.
- 공식 문장을 복사하지 않고 초보자가 이해하기 쉬운 말로 다시 설명했습니다.

## 01. JavaScript와 실행

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: JavaScript가 뭔가요?](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) | HTML·CSS·JavaScript의 역할과 브라우저에서 JavaScript가 하는 일 |
| [Ecma International: ECMA-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/) | JavaScript 핵심 문법과 동작을 정의하는 ECMAScript 표준 |
| [WHATWG HTML Standard: script 요소](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element) | 외부 스크립트의 `src`와 클래식 스크립트의 `defer` 실행 시점 |
| [WHATWG DOM Standard](https://dom.spec.whatwg.org/) | `document`와 DOM이 브라우저에서 제공되는 문서 도구라는 점 |
| [WHATWG Console Standard](https://console.spec.whatwg.org/) | `console.log()`가 실행 환경이 제공하는 출력 기능이라는 점 |

## 02. 값·변수·연산자·제어문

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: JavaScript 문법과 타입](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) | 값의 타입, 동적 타입, `const`·`let`과 블록 스코프 |
| [MDN: 표현식과 연산자](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators) | 산술·비교·논리·대입 연산과 엄격 동등 비교 |
| [MDN: 반복과 순회](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) | `for`, `for...of`와 반복 흐름 |
| [MDN: 거짓으로 평가되는 값](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) | 조건식에서 거짓으로 평가되는 값과 그 밖의 값의 참 평가 |
| [MDN: HTMLInputElement.value](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value) | 입력 요소의 `value`가 문자열이라는 점 |

## 03. 함수·스코프·클로저

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) | 매개변수·인수·반환값과 세 함수 작성 형태 |
| [MDN: 변수 스코프](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variable_scope) | 전역·함수·블록 범위에서 이름을 찾는 규칙 |
| [MDN: 클로저](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) | 선언 위치를 기준으로 바깥 변수에 접근하는 렉시컬 스코프와 클로저 |

## 04. 배열·객체·표준 내장 객체

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: 인덱스 기반 컬렉션](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) | 배열의 순서, 인덱스, `length`와 배열 메서드 |
| [MDN: 객체 다루기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) | 객체 속성과 점·대괄호 표기법 |
| [MDN: 표준 내장 객체](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) | `String`, `Number`, `Math`, `Date`, `JSON`의 역할 |
| [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) | JSON 문자열 변환과 순환 참조·BigInt의 오류 경계 |

## 05. DOM과 이벤트

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [WHATWG DOM Standard](https://dom.spec.whatwg.org/) | DOM 트리, 요소 선택·생성·추가와 이벤트 전달 |
| [MDN: 이벤트 소개](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) | 이벤트 등록과 이벤트 객체의 `target` |
| [MDN: 이벤트 버블링](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) | 이벤트 버블링, `target`·`currentTarget`과 이벤트 위임 |
| [WHATWG HTML Standard: data-* 속성](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes) | `data-*` 속성과 `dataset` 이름·문자열 값 변환 |
| [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) | 폼에서 `name`이 붙은 입력값을 읽는 방법 |
| [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | 텍스트 내용 변경과 `innerHTML`과의 차이 |
| [WHATWG HTML Standard: 폼 요소](https://html.spec.whatwg.org/multipage/forms.html) | `label`, 입력 요소와 네이티브 버튼의 관계 |
| [WAI-ARIA: aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label) | 반복 버튼의 대상을 구분하는 접근 가능한 이름 |

## 06. Promise·async/await·fetch

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: Promise 사용하기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) | Promise 상태, 체이닝, 오류 전달과 동시 작업 처리 |
| [MDN: async 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) | `async` 함수의 Promise 반환과 `await`의 실행 흐름 |
| [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) | 지연 시간이 `0`이어도 현재 실행 중인 코드보다 먼저 실행되지 않는 타이머 흐름 |
| [MDN: Fetch API 사용하기](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | `Response`, `response.ok`, `response.json()` 처리 |
| [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/) | 네트워크 실패와 HTTP 오류 응답의 구분 |

## 07. 복습과 실습

이 페이지는 앞 단원의 규칙을 새 예제에 연결합니다. 언어 흐름은 [MDN JavaScript 안내서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide), 화면 처리는 [WHATWG DOM Standard](https://dom.spec.whatwg.org/), 요청 처리는 [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)와 대조했습니다.

| 공식 자료 | 확인한 내용 |
| --- | --- |
| [MDN: String.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes) | 문자열 안에 검색어가 있는지 `true` 또는 `false`로 확인하는 방법 |
| [MDN: HTTP GET 메서드](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET) | 지정한 데이터를 읽어 오도록 요청하는 HTTP 방식 |

## 문서 사용 시 주의

- 명세는 구현의 정확한 기준이지만 입문자가 처음부터 전부 읽기에는 어렵습니다. 교안에서는 핵심 규칙만 쉬운 문장으로 풀었습니다.
- 실행 환경과 브라우저 버전에 따라 사용할 수 있는 기능이 다를 수 있으므로 실제 프로젝트에서는 대상 환경을 별도로 확인합니다.
- 교안의 예제는 학습용 최소 코드입니다. 실제 서비스에서는 입력 검증, 접근성, 보안과 오류 표시를 추가로 고려합니다.
