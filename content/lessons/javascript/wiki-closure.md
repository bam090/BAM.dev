# 호출 뒤에도 이어지는 클로저

## 학습 목표

함수가 만들어진 환경의 상태가 이어지는 이유와 서로 다른 생성 호출의 독립 상태를 추적할 수 있습니다.

## 한줄 요약

클로저는 선언 위치의 바인딩을 계속 사용하므로 변경이 이어지고 새 생성 호출의 상태는 분리됩니다.

## 먼저 확인할 개념

[스코프와 호이스팅: 이름 탐색과 선언 전 접근](#/learn/javascript/wiki-scope-hoisting)을 먼저 확인해 보세요.

## 함수가 바깥 환경을 기억하는 클로저

함수 안에서 만든 함수는 자신이 만들어진 바깥 환경과 연결될 수 있다.
함수와 그 바깥 환경의 연결을 **클로저(closure)**라고 한다.

다음 함수는 도장을 찍은 횟수를 바깥에서 직접 만질 수 없게 감싼다.

```js
function makeStampBook() {
  let count = 0;

  return function stamp() {
    count = count + 1;
    return count;
  };
}

const blueBook = makeStampBook();

console.log(blueBook()); // 1
console.log(blueBook()); // 2
```

`makeStampBook()` 호출은 끝났지만 반환된 `stamp` 함수는 자신이 만들어진 환경의 `count`를 계속 사용할 수 있다.

클로저가 `count`의 첫 값 `0`을 사진처럼 복사해 얼려 둔 것은 아니다.
같은 바인딩을 계속 읽고 바꾸므로 첫 호출 뒤에는 `1`, 둘째 호출 뒤에는 `2`가 된다.

`makeStampBook()`을 다시 호출하면 새 환경과 새 `count`가 생긴다.
두 함수는 같은 코드를 실행해도 서로 다른 호출에서 만들어진 환경을 기억하므로 상태가 섞이지 않는다.

클로저가 실행 컨텍스트 전체를 영원히 붙들고 있다고 설명하는 것도 정확하지 않다.
함수 객체가 자신이 만들어질 때의 바깥 환경과 연결되고, 그 연결을 통해 필요한 바인딩을 찾는다고 이해하는 편이 안전하다.

## 같은 코드로 만들어도 상태는 독립이다

앞 예제의 `makeStampBook`을 다시 호출해 비교합니다.

```js
const redBook = makeStampBook();
const greenBook = makeStampBook();
console.log(redBook(), redBook(), greenBook());
```

예상 결과는 `1, 2, 1`입니다. 두 번째 `redBook()`은 기존 count를 이어 쓰지만 greenBook의 count는 다른 호출에서 시작했습니다.

## 호출 위치의 같은 이름을 읽지 않는다

```js
const message = "바깥";
function makeReader() {
  const message = "선언 위치";
  return () => message;
}
function run(reader) {
  const message = "호출 위치";
  return reader();
}
console.log(run(makeReader()));
```

예상 결과는 `"선언 위치"`입니다. 함수가 어디에서 호출되었는지 대신 어디에 작성되었는지를 따라 가장 가까운 바깥 이름을 찾습니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [prototype·class와 메서드 호출](#/learn/javascript/wiki-object-model)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Execution Contexts and Environment Records](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026 — ECMAScript Function Objects and Ordinary Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 — Objects and Classes Overview](https://tc39.es/ecma262/2026/multipage/overview.html#sec-objects)

## 핵심 질문 답

반환된 함수는 자신이 만들어진 환경의 필요한 이름에 계속 접근합니다. 첫 값을 사진처럼 고정한 것이 아니라 같은 바인딩을 읽고 바꾸므로 이전 호출의 변화가 다음 호출에 이어집니다.
바깥 함수를 다시 호출해 만든 함수는 별도의 환경을 사용합니다. 또한 호출한 함수에 같은 이름이 있어도 선언 위치의 가까운 환경에서 값을 찾습니다.
