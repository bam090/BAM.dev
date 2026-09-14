# 입력 검증과 오류 종류

## 학습 목표

입력으로 고칠 수 있는 실패를 먼저 검사하고 오류 이름과 발생 시점으로 조사 대상을 좁힐 수 있습니다.

## 한줄 요약

예상 가능한 입력은 조건으로 확인하고, 예외는 오류의 종류와 발생 위치를 단서로 처리합니다.

## 먼저 확인할 개념

[값과 타입](#/learn/javascript/wiki-values-types) · [계산과 비교](#/learn/javascript/wiki-operators) · [함수의 입력과 반환](#/learn/javascript/wiki-function-return)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## 오류는 모두 같은 모습이 아니다

코드가 실행되지 않거나 실행 중에 멈추면 브라우저는 오류(error), 곧 `정상적으로 계속 실행할 수 없는 상황`을 알려 준다.
오류의 이름은 어디부터 확인할지 정하는 첫 단서다.

| 오류 이름 | 쉬운 뜻 | 작은 예 |
| --- | --- | --- |
| `SyntaxError` | 코드나 입력 문자열의 문법을 해석할 수 없음 | `JSON.parse("{")` |
| `ReferenceError` | 현재 범위에서 찾을 수 없는 이름을 사용함 | 선언하지 않은 `memberName` 읽기 |
| `TypeError` | 그 값으로 할 수 없는 동작을 시도함 | `null.name` 읽기 |

```js
function getErrorName(work) {
  try {
    work();
  } catch (error) {
    return error.name;
  }
}

console.log(getErrorName(() => JSON.parse("{"))); // "SyntaxError"
console.log(getErrorName(() => memberName));       // "ReferenceError"
console.log(getErrorName(() => null.name));        // "TypeError"
```

소스 코드 자체의 문법이 틀리면 브라우저가 그 스크립트를 실행하기 전에 멈출 수 있다.
반면 `JSON.parse("{")`는 실행 중 받은 문자열을 JSON 문법으로 읽다가 `SyntaxError`를 만든다.
같은 오류 이름이라도 언제 생겼는지 함께 봐야 한다.

브라우저마다 오류 메시지 문장이 조금 다를 수 있다.
`Cannot read...` 같은 전체 문구를 외우기보다 오류 이름, 파일, 줄, 그때 사용한 값을 확인한다.

## 잘못된 입력과 예외를 구분한다

사용자가 나이를 비워 두거나 글자를 입력하는 일은 충분히 예상할 수 있다.
이런 경우는 프로그램이 망가진 것이 아니라 입력이 조건에 맞지 않는 것이다.
먼저 검사하고 사용자가 고칠 수 있는 안내를 돌려준다.

```js
function readAge(text) {
  const normalized = text.trim();

  if (normalized === "") {
    return {
      ok: false,
      message: "나이는 0 이상의 정수로 입력해 주세요.",
    };
  }

  const age = Number(normalized);

  if (!Number.isInteger(age) || age < 0) {
    return {
      ok: false,
      message: "나이는 0 이상의 정수로 입력해 주세요.",
    };
  }

  return {
    ok: true,
    value: age,
  };
}
```

`Number.isInteger()`는 값이 정수인지 확인한다.
이 함수는 예상 가능한 입력을 `성공 또는 안내`로 나누며 예외를 던지지 않는다.

예외(exception)는 정상 흐름으로 계속하기 어려워 별도 처리가 필요한 사건이다.
필요한 데이터가 반드시 있어야 하는데 사라졌거나, JSON이 깨졌거나, 요청이 실패한 경우가 예다.

입력 검증과 예외 처리를 모두 `try...catch`에 넣으면
어떤 실패가 사용자가 고칠 입력인지, 어떤 실패가 프로그램이나 외부 작업의 문제인지 구분하기 어려워진다.

## `Error` 객체와 `throw`

`Error`는 오류의 이름과 설명을 담는 기본 객체다.
`throw`는 현재 정상 실행을 멈추고 실패를 바깥쪽 처리 지점으로 전달한다.

```js
function getTicketPrice(ticket) {
  if (!ticket) {
    throw new Error("표 정보가 없습니다.");
  }

  return ticket.price;
}
```

JavaScript는 문자열이나 숫자도 던질 수 있다.
그러나 `throw new Error(...)`처럼 `Error` 객체를 사용하면 오류라는 뜻이 분명하고 디버깅 정보도 얻기 쉽다.

오류 설명에는 개발자가 다음 행동을 정할 수 있는 내용을 쓴다.
사용자에게 보여 줄 문장과 개발자가 조사할 문장은 목적이 다를 수 있다.
화면에는 안전하고 이해할 수 있는 안내를 보여 주고, 내부 경로나 비밀값이 들어갈 수 있는 자세한 오류는 그대로 노출하지 않는다.
사용자 화면과 외부 로그에는 비밀번호, 토큰, 개인정보를 남기지 않는다.

## 숫자 변환 전에 빈칸을 검사하는 이유

위 `readAge(text)`는 text가 문자열이라는 입력 계약으로 작성했다.
`Number("")`나 `Number("   ")`는 0이 되므로 변환 결과만 보면 누락된 입력과 실제 0을 구분할 수 없다.
`trim()` → 빈 문자열 검사 → 숫자 변환 → 정수와 범위 검사 순서가 필요하다.
여기서 JSON은 값을 표현하는 문자열 형식이며, `JSON.parse()`는 그 문자열을 읽는 함수라는 정도만 사용한다.
예제의 미선언 이름과 null 접근은 오류를 관찰하기 위한 반례이지 그대로 제품에 넣을 코드가 아니다.


## 이어서 연습하기

[예외 처리: try·catch·finally의 역할](#/learn/javascript/wiki-error-boundaries)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Error Objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-error-objects)
- [ECMAScript 2026 — throw와 try 문](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-try-statement)
- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)

## 핵심 질문 답

문자열 입력은 trim으로 정리한 뒤 빈칸을 먼저 검사하고 Number 변환 결과의 정수·범위를 확인합니다. Number가 빈 문자열을 0으로 바꿀 수 있어 변환부터 하면 누락 입력을 놓칩니다. SyntaxError는 문법, ReferenceError는 이름 찾기, TypeError는 그 값으로 할 수 없는 동작의 단서입니다. 소스 문법 오류는 스크립트 실행 전, JSON.parse의 오류는 실행 중에 생길 수 있습니다.
