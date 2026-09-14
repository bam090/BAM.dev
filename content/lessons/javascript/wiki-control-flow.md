# 조건문과 반복문의 실행 범위

## 학습 목표

조건 분기와 반복의 시작·검사·변화·종료를 따라 실제 실행 범위를 판단할 수 있습니다.

## 한줄 요약

조건문은 실행할 갈래를 고르고 반복문은 조건을 검사하며 같은 흐름을 되풀이합니다.

## 먼저 확인할 개념

[연산자: 계산·비교와 조건의 값](#/learn/javascript/wiki-operators)을 먼저 확인해 보세요.

## 조건에 따라 길을 고르기

조건에 따라 다른 코드를 실행하는 일을 **조건 분기**라고 한다.
두 갈래나 몇 개의 범위를 나눌 때는 `if`가 잘 맞는다.

```js
const roomTemperature = 19;

if (roomTemperature < 18) {
  console.log("난방을 켭니다.");
} else if (roomTemperature > 26) {
  console.log("창문을 엽니다.");
} else {
  console.log("그대로 둡니다.");
}
```

하나의 값이 정해진 여러 값 가운데 무엇과 같은지 나눌 때는 `switch`도 사용할 수 있다.

```js
const signal = "노랑";

switch (signal) {
  case "빨강":
    console.log("멈춥니다.");
    break;
  case "노랑":
    console.log("주변을 살핍니다.");
    break;
  default:
    console.log("천천히 확인합니다.");
}
```

`break`는 맞는 갈래를 실행한 뒤 `switch` 밖으로 나가게 한다.
`break`를 빠뜨리면 다음 case의 코드까지 이어서 실행될 수 있다.
case 값은 엄격한 비교와 같은 방식으로 맞는지 확인하므로 숫자 `1`과 문자열 `"1"`은 같은 case가 아니다.

## 같은 일을 되풀이하기

같은 코드를 여러 번 실행하는 구조를 **반복문(loop)**이라고 한다.

반복 횟수를 세기 좋을 때는 `for`가 읽기 쉽다.

```js
for (let count = 1; count <= 3; count++) {
  console.log(count + "번째 종을 울립니다.");
}
```

어떤 조건이 참인 동안 계속할 때는 `while`이 잘 맞는다.

```js
let currentFloor = 1;
const destination = 4;

while (currentFloor < destination) {
  currentFloor = currentFloor + 1;
}

console.log(currentFloor); // 4
```

반복문에는 세 가지가 보여야 한다.

1. 어디에서 시작하는가
2. 언제까지 반복하는가
3. 한 번 돌 때 무엇이 바뀌는가

셋 중 하나가 빠지면 한 번도 실행되지 않거나 끝나지 않는 반복이 생길 수 있다.

## 요구사항을 네 칸으로 나누기

“1층에 있는 엘리베이터를 위쪽 요청층인 4층까지 올리고 도착 안내를 보여 준다”라는 말을 바로 코드로 쓰지 말고 네 부분으로 나눈다.
아래 예제는 위로 올라가는 경우만 다룬다.

| 구분 | 이 예에서의 내용 |
| --- | --- |
| 입력 | 현재 층보다 위에 있는 요청층 `4` |
| 상태 | 현재 층 `1` |
| 판단 | 현재 층이 요청한 층보다 낮은가? |
| 출력 | 도착한 층과 안내 문구 |

```js
const destination = 4;
let currentFloor = 1;

while (currentFloor < destination) {
  currentFloor = currentFloor + 1;
}

let message;

if (currentFloor === destination) {
  message = currentFloor + "층에 도착했습니다.";
} else {
  message = "요청한 층을 확인할 수 없습니다.";
}

console.log(message);
```

실행 결과는 다음과 같다.

```text
4층에 도착했습니다.
```

입력은 처음 들어온 값이다.
상태는 처리 중 기억하고 바뀔 수 있는 값이다.
판단은 어떤 길로 갈지 정한다.
출력은 처리 뒤 밖으로 보여 주거나 돌려줄 결과다.
이 네 칸은 JavaScript 문법이 강제하는 규칙이 아니라 요구사항을 놓치지 않게 돕는 생각 순서다.

## 한 번 더 실행되는 경계 확인하기

`for (let index = 0; index < 3; index++)`의 본문은 `0, 1, 2`에서 실행됩니다. 조건을 `index <= 3`으로 바꾸면 `3`에서도 실행됩니다. 시작값을 그대로 두었다면 비교 기호 하나가 실행 횟수를 바꿉니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [함수의 입력과 반환](#/learn/javascript/wiki-function-return)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — ECMAScript Language Types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [ECMAScript 2026 — Statements and Declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026 — Expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)

## 핵심 질문 답

조건문에서는 어떤 조건이나 case에 들어가는지 먼저 찾습니다. `switch`는 맞는 case부터 실행하며 `break`가 없으면 다음 코드로 이어질 수 있습니다.
반복문에서는 시작값·계속할 조건·매번 바뀌는 상태를 함께 봅니다. 예를 들어 `0`부터 `3` 미만까지 증가하면 세 번이지만 `3` 이하까지 증가하면 네 번입니다. 입력·상태·판단·출력으로 나누면 종료 뒤 결과까지 추적할 수 있습니다.
