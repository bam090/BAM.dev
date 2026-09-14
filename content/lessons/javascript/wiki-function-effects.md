# 계산과 부수 효과의 경계

## 학습 목표

입력·반환값·바깥 상태 변경을 구분해 계산과 표시의 책임을 나눌 수 있습니다.

## 한줄 요약

같은 입력의 계산 결과와 객체·화면·저장소를 바꾸는 동작을 분리하면 변화의 위치가 드러납니다.

## 먼저 확인할 개념

[함수의 입력과 반환](#/learn/javascript/wiki-function-return)을 먼저 확인해 보세요.

## 계산만 하는 함수와 바깥을 바꾸는 함수

같은 입력을 받으면 같은 결과를 내고 함수 밖의 상태를 바꾸지 않는 함수를 **순수 함수(pure function)**라고 부른다.
이것은 JavaScript가 강제하는 문법 종류가 아니라 함수를 나누는 설계 기준이다.

```js
function addTax(price) {
  return price * 1.1;
}
```

`addTax(1000)`은 바깥 상태가 같든 다르든 같은 결과를 계산하며 외부 값을 바꾸지 않는다.

다음 함수는 호출할 때마다 함수 밖의 `visitCount`를 바꾼다.

```js
let visitCount = 0;

function recordVisit() {
  visitCount = visitCount + 1;
  return visitCount;
}
```

프로그램에는 파일 저장, 화면 변경, 방문 횟수 기록처럼 바깥 상태를 바꾸는 함수도 필요하다.
이런 일을 **부수 효과(side effect)**라고 한다.
부수 효과가 무조건 나쁘다는 뜻은 아니다.
계산과 상태 변경을 구분해 두면 어느 함수가 무엇을 바꾸는지 찾기 쉬워진다.

함수를 나누기 전에는 세 가지를 먼저 정한다.

| 확인할 것 | 뜻 |
| --- | --- |
| 입력 | 함수가 일을 시작하려면 필요한 값 |
| 반환값 | 호출한 곳이 이어서 사용할 결과 |
| 바꾸는 상태 | 함수 밖에서 달라지는 값이나 화면 |

## 반환하면서 객체도 바꾸는 경우

```js
function addPoint(member) {
  member.points += 1;
  return member.points;
}
const member = { points: 2 };
const result = addPoint(member);
console.log(result, member.points);
```

예상 결과는 `3, 3`입니다. 숫자를 반환했다는 사실만으로 부수 효과가 없는 것은 아닙니다. 전달받은 객체의 속성 변경이 호출자에게도 보입니다. 이 공유 관계는 [같은 객체의 공유와 재대입](#/learn/javascript/wiki-object-sharing)에서 자세히 확인합니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [배열과 객체로 정보 담기](#/learn/javascript/wiki-arrays-objects)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-function-definitions)
- [ECMAScript 2026 — Return Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-return-statement)
- [ECMAScript 2026 — ECMAScript Function Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects)

## 핵심 질문 답

입력은 함수가 받을 값, 반환값은 호출자가 이어서 사용할 결과, 부수 효과는 함수 밖에서 관찰되는 상태나 화면의 변화입니다.
순수 함수는 같은 입력에 같은 결과를 내고 바깥 상태를 바꾸지 않습니다. 반환값이 맞아도 전달받은 공유 객체나 바깥 변수를 바꿨다면 순수 계산은 아닙니다. 표시·저장처럼 필요한 효과는 없애기보다 수행하는 위치를 분명히 합니다.
