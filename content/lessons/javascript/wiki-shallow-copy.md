# 얕은 복사와 바꿀 경로

## 학습 목표

얕은 복사 뒤 공유되는 중첩 객체를 찾고 원본을 보존할 변경 경로까지 새로 만들 수 있습니다.

## 한줄 요약

펼침은 새 바깥 대상을 만들지만 안쪽 객체는 공유하므로 원본 보존에는 바뀌는 경로의 복사가 필요합니다.

## 먼저 확인할 개념

[같은 객체의 공유와 재대입](#/learn/javascript/wiki-object-sharing)과 [배열 메서드](#/learn/javascript/wiki-array-methods)를 먼저 확인해 보세요.

## 펼침 문법으로 새 바깥 객체 만들기

객체의 현재 속성들을 다른 새 객체에 펼쳐 넣을 때 `...`를 사용한다.
이를 **펼침 문법(spread syntax)**이라고 한다.

```js
const original = {
  color: "노랑",
  on: false,
};

const copied = { ...original };

console.log(original === copied); // false
```

`copied`는 새 객체다.
바깥 객체가 다르므로 한 단계 안의 원시값 속성을 바꿔도 원본 속성은 그대로다.

```js
copied.on = true;

console.log(original.on); // false
console.log(copied.on);   // true
```

객체 펼침은 원본이 직접 가지고 있으며 목록으로 꺼낼 수 있게 표시된
**열거 가능한(enumerable)** 속성들의 값을 새 객체로 복사한다.
다른 객체와의 프로토타입 연결을 따라 찾는 속성이나 숨겨진 비열거 속성까지 똑같은 객체 구조로 복제하는 기능은 아니다.
프로토타입 연결은 [객체 모델](#/learn/javascript/wiki-object-model)에서 설명한다.

## 얕은 복사는 한 단계만 새로 만든다

객체 안에 다른 객체가 들어 있으면 펼침 문법은 안쪽의 안쪽까지 따라가며 새로 만들지 않는다.

```js
const original = {
  volume: 2,
  display: {
    brightness: 4,
  },
};

const copied = { ...original };

console.log(original === copied);                 // false
console.log(original.display === copied.display); // true
```

바깥 객체는 새로 생겼지만 `display` 속성에는 같은 안쪽 객체가 들어 있다.
이렇게 한 단계의 속성 값만 새 대상에 옮기는 복사를 **얕은 복사(shallow copy)**라고 한다.

```js
copied.volume = 5;
copied.display.brightness = 9;

console.log(original.volume);             // 2
console.log(original.display.brightness); // 9
```

- `volume`은 바깥 객체가 각각 가진 원시값이므로 `copied.volume`만 바뀐다.
- `display`는 같은 안쪽 객체를 공유하므로 밝기 변경이 `original`에서도 보인다.

`Object.assign({}, original)`도 새 빈 객체에 원본의 직접 가진 열거 가능한 속성 값을 옮길 수 있다.
이 방법도 얕은 복사이며 중첩 객체를 깊게 복제하지 않는다.

## 배열 펼침도 안쪽 값을 그대로 옮긴다

배열의 펼침 문법은 새 바깥 배열을 만들고 기존 요소 값들을 차례로 넣는다.

```js
const original = [
  { name: "손전등", ready: false },
];

const copied = [...original];

console.log(original === copied);       // false
console.log(original[0] === copied[0]); // true
```

두 배열은 다르지만 첫 번째 요소 객체는 같다.

```js
copied[0].ready = true;

console.log(original[0].ready); // true
```

새 배열을 만들었다는 사실만으로 요소 객체까지 새 객체가 되지는 않는다.

## 바꿀 중첩 단계까지 새로 만들기

원본을 남겨 두면서 중첩된 `brightness`만 바꾼 새 설정을 만들려면 바뀌는 길에 있는 객체도 새로 만든다.

```js
const settings = {
  volume: 2,
  display: {
    brightness: 4,
  },
};

const nextSettings = {
  ...settings,
  display: {
    ...settings.display,
    brightness: 9,
  },
};

console.log(settings.display.brightness);     // 4
console.log(nextSettings.display.brightness); // 9
console.log(settings.display === nextSettings.display); // false
```

이 코드는 모든 중첩 값을 무조건 깊게 복사하지 않는다.
변경할 길에 있는 바깥 `settings`와 안쪽 `display`만 새로 만든다.
바뀌지 않은 다른 객체 속성이 있었다면 필요에 따라 계속 공유할 수 있다.

## 원본을 바꿀지 새 값을 만들지 정하기

원본 변경이 언제나 틀린 것은 아니다.
그 객체를 한곳에서만 관리하고 이전 상태를 남길 필요가 없다면 직접 변경이 가장 단순할 수 있다.

새 값을 만드는 편이 도움이 되는 상황도 있다.

- 여러 코드가 같은 객체를 함께 사용할 때
- 변경 전과 변경 후를 비교해야 할 때
- 상태가 바뀌었는지를 객체 정체성으로 확인하는 코드와 함께 쓸 때
- 함수가 받은 원본을 바꾸지 않는다는 약속을 지켜야 할 때

중요한 것은 “무조건 복사한다”가 아니라 누가 같은 객체를 공유하고 어느 단계가 바뀌어야 하는지 먼저 아는 것이다.

## filter도 요소 객체까지 복제하지 않는다

```js
const items = [{ count: 2 }];
const selected = items.filter(item => item.count > 0);
selected[0].count = 0;
console.log(items[0].count, selected === items);
```

예상 결과는 `0, false`입니다. 새 바깥 배열과 같은 안쪽 객체를 따로 추적하세요. 객체 펼침은 직접 가진 열거 가능한 속성 값을 옮기고, 배열 펼침은 순회로 얻은 요소 값을 새 배열에 넣습니다. 둘 다 중첩 객체를 자동 복제하지 않습니다.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [스코프와 호이스팅: 이름 탐색과 선언 전 접근](#/learn/javascript/wiki-scope-hoisting)을 살펴보세요.

## 공식 자료

- [ECMAScript 2026 — Language Types and Reference Records](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 — Array and Object Initializers](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-array-initializer)
- [ECMAScript 2026 — CopyDataProperties](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-copydataproperties)

## 핵심 질문 답

객체나 배열을 펼치면 바깥 대상은 새로 생기지만 안에 들어 있던 객체는 계속 공유할 수 있습니다. `filter`의 새 배열도 선택한 요소 객체까지 복제하지 않습니다.
원본의 중첩 값을 보존하려면 바뀔 속성까지 이어지는 객체를 필요한 단계만 새로 만듭니다. 바깥 설정과 display를 함께 펼쳐야 display.brightness 변경이 원본에 전해지지 않습니다. 모든 값을 무조건 깊게 복사할 필요는 없습니다.
