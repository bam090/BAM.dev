# 예외 처리: try·catch·finally의 역할

## 학습 목표

오류를 복구하거나 안내할 수 있는 경계에서 받고 원래 결과를 보존하며 마무리할 수 있습니다.

## 한줄 요약

catch는 실패를 받아 의미 있게 처리하고, finally는 앞의 반환값과 오류를 덮지 않는 마무리를 맡습니다.

## 먼저 확인할 개념

[입력 검증과 오류 종류](#/learn/javascript/wiki-errors-input)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## `try`, `catch`, `finally`의 역할

`try`는 실패할 수 있는 작업을 실행한다.
그 안에서 예외가 전달되면 `catch`가 받는다.
`finally`는 성공과 실패 어느 쪽에서도 필요한 마무리 작업을 맡는다.
`catch`는 오류를 받는 자리일 뿐, 실행됐다는 사실만으로 오류가 해결된 것은 아니다.

```js
function isPreferences(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value.theme === "light" || value.theme === "dark")
  );
}

function readPreferences(text) {
  try {
    const preferences = JSON.parse(text);

    if (!isPreferences(preferences)) {
      throw new TypeError("설정 모양이 올바르지 않습니다.");
    }

    return preferences;
  } catch (error) {
    console.error("설정 내용을 읽지 못했습니다.", error);
    return { theme: "light" };
  } finally {
    console.log("설정 읽기를 마쳤습니다.");
  }
}
```

`JSON.parse()`의 성공은 JSON 문법이 맞다는 뜻일 뿐, 설정으로 쓸 수 있는 모양이라는 뜻은 아니다.
이 함수는 파싱한 값이 객체이고 `theme`이 허용한 문자열인지도 확인한다.
문법이 깨졌거나 모양이 틀리면 오류를 기록하고 안전한 기본 설정을 돌려준다.
마지막 로그는 성공과 실패 모두에서 실행된다.

`finally`에는 파일 닫기, 진행 상태 정리처럼 결과와 상관없이 필요한 마무리를 둔다.
`finally` 안에서 `return`하거나 새 오류를 던지면 앞에서 반환하려던 값이나 전달하던 오류를 덮어쓸 수 있다.

```js
function badExample() {
  try {
    return "try의 결과";
  } finally {
    return "finally의 결과";
  }
}

console.log(badExample()); // "finally의 결과"
```

이 코드는 따라 사용할 방법이 아니라 피해야 할 모습을 보여 준다.
`finally`에서는 반환하지 않는다는 규칙을 두면 앞의 결과를 잃는 실수를 막기 쉽다.

## 오류는 처리할 수 있는 곳에서 잡는다

오류가 생긴 바로 그 줄에서 모든 것을 처리해야 하는 것은 아니다.
그 함수가 복구 방법을 모르면 호출한 쪽으로 전달하는 편이 낫다.

```js
function parseMenu(text) {
  const menu = JSON.parse(text);

  if (!Array.isArray(menu)) {
    throw new TypeError("메뉴는 배열이어야 합니다.");
  }

  return menu;
}

function showMenu(text, output) {
  try {
    const menu = parseMenu(text);
    output.textContent = `${menu.length}개의 메뉴를 불러왔습니다.`;
  } catch (error) {
    console.error(error);
    output.textContent = "메뉴를 읽지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
  }
}
```

`parseMenu()`는 화면에 무엇을 보여 줄지 모른다.
화면을 맡은 `showMenu()`가 오류를 받아 사용자 안내로 바꾼다.
이처럼 오류를 의미 있게 복구하거나 알릴 수 있는 경계에서 처리한다.

다음과 같은 빈 처리는 피한다.

```js
try {
  JSON.parse(text);
} catch (error) {
  // 아무 일도 하지 않음
}
```

오류를 빈 `catch`로 삼키면 프로그램은 실패했는데 겉으로만 계속 움직인다.
이후 데이터가 왜 비었는지 찾기도 어려워진다.
복구할 수 없다면 적절한 곳에서 기록하고 다시 던지거나, 더 바깥 처리 지점에 맡긴다.

## 이어서 연습하기

[실제 값으로 디버깅하기](#/learn/javascript/wiki-debugging)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Error Objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-error-objects)
- [ECMAScript 2026 — throw와 try 문](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-try-statement)
- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)

## 핵심 질문 답

오류를 의미 있게 복구하거나 사용자에게 알릴 수 있는 호출 경계에서 catch합니다. 파싱 성공만으로 필요한 데이터 모양이 보장되지는 않으므로 형태도 검사합니다. finally에는 성공·실패 공통 정리를 두되 return이나 throw로 앞의 결과를 덮지 않습니다. 빈 catch로 숨기기보다 복구·안내·재전달 중 책임에 맞는 행동을 정합니다.
