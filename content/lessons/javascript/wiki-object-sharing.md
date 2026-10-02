# 객체 공유와 얕은 복사

## 학습 목표

- 같은 객체의 공유와 변수·매개변수 재대입을 구분해 변경이 보이는 범위를 설명할 수 있습니다.
- 객체·배열의 얕은 복사 뒤에 새로 생긴 대상과 계속 공유되는 중첩 객체를 찾을 수 있습니다.
- 원본을 보존해야 하는 조건에서 바뀌는 경로의 객체만 새로 만들 수 있습니다.

## 먼저 확인할 개념

[const·let과 재대입](#/learn/javascript/wiki-variables) · [배열과 객체](#/learn/javascript/wiki-arrays-objects) · [배열 메서드](#/learn/javascript/wiki-array-methods)를 먼저 확인합니다.

## 객체 공유와 복사란

**객체 공유**는 여러 이름이 같은 객체를 사용하는 관계이고 **복사**는 기존 값을 다른 대상에 옮기는 일입니다.
설정을 바꿀 때는 이름만 추가했는지 새 객체를 만들었는지에 따라 원본에 보이는 변화가 달라집니다.

예를 들어 켜짐 여부·음량·화면 밝기를 담은 설정을 여러 코드에서 사용한다고 해 보겠습니다.
한쪽 설정을 바꾸었을 때 다른 쪽에서도 바뀔지 먼저 예상해 봅니다.
아래 예제는 같은 설정 장면을 이어서 사용하며 `const` 이름이 겹치는 블록은 각각 실행합니다.

## 원시값을 다른 변수에 대입할 때

숫자나 문자열 같은 **원시값(primitive value)**을 다른 변수에 대입하면 그 시점의 값이 새 변수에도 들어갑니다.
음량을 따로 꺼낸 뒤 다시 대입하면 원래 값도 바뀔지 예상해 봅니다.

```js
let firstVolume = 3;
let secondVolume = firstVolume;
secondVolume = 8;
console.log(firstVolume, secondVolume);

let firstLabel = "은하";
let secondLabel = firstLabel;
secondLabel = "여울";
console.log(firstLabel, secondLabel);
```

```text
3 8
은하 여울
```

한 변수의 재대입은 다른 변수를 다시 대입하지 않습니다.
원시값은 값 안쪽을 직접 고치는 대상이 아니므로 문자열도 새 값을 다시 대입합니다.

## 객체를 대입하면 같은 객체를 공유할 수 있다

이번에는 설정 객체에 이름을 하나 더 붙입니다.
속성을 바꾼 뒤 두 이름에서 읽은 값과 객체 비교 결과를 예상해 봅니다.

```js
const settings = { on: false, volume: 2, display: { brightness: 4 } };
const sharedSettings = settings;
sharedSettings.on = true;

console.log(settings.on, sharedSettings.on);
console.log(settings === sharedSettings);
console.log(settings === { on: true, volume: 2, display: { brightness: 4 } });
```

```text
true true
true
false
```

대입만 했으므로 새 객체는 생기지 않았습니다.
서로 다른 변수 이름이 같은 객체를 사용하는 관계를 **참조 공유(reference sharing)**라고 부릅니다.
객체끼리 `===`는 속성 내용이 아니라 바로 그 객체인지를 구분하는 **객체 정체성(identity)**을 비교합니다.
내용이 같아도 따로 만든 객체는 다른 객체입니다.

> [!note]- 객체 값과 참조의 뜻
> 변수 이름과 값의 연결을 **바인딩(binding)**이라고 합니다.
> 여기서 두 바인딩은 같은 객체 값을 공유합니다.
> 하나의 수납함에 이름표 두 개를 붙인 비유로 이해할 수 있지만 JavaScript가 사람이 읽을 수 있는 주소를 저장한다는 뜻은 아닙니다.
> 객체는 언어 타입 중 `Object` 타입의 값입니다.
> 명세의 `Reference Record`는 이름·속성의 접근을 기술하는 명세용 구조이며 별도의 JavaScript 언어 타입이 아닙니다.

## 재대입과 객체 변경은 다르다

`settings.on = true`는 같은 객체의 속성을 바꿉니다.
반면 `settings = { on: false }`는 그 이름을 다른 객체와 연결하는 재대입입니다.
`const`는 이름의 재대입을 막으며 객체의 속성 변경은 허용합니다.
따라서 앞 예제의 `sharedSettings.on = true`는 실행되지만 `const`로 선언한 이름에 새 객체를 대입하면 오류가 발생합니다.

## 매개변수에 다른 객체를 다시 넣으면

함수도 객체 값을 전달받습니다.
함수 안에서 매개변수에 새 설정을 대입했을 때 호출자의 원본과 반환값을 예상해 봅니다.

```js
function replaceSettings(settings) {
  settings = { on: true, volume: 2, display: { brightness: 4 } };
  return settings;
}
const original = { on: false, volume: 2, display: { brightness: 4 } };
const result = replaceSettings(original);
console.log(original.on, result.on, original === result);
```

```text
false true false
```

함수 안의 이름 `settings`를 새 객체와 연결했을 뿐 호출자의 `original` 이름은 바뀌지 않았습니다.
이와 달리 `settings.on = true`로 공유하던 객체의 속성을 바꾸면 호출자에게도 보입니다.
객체도 값으로 전달되므로 속성 변경과 이름 재대입을 구분해 변경 범위를 추적합니다.

---

## 펼침 문법으로 새 바깥 객체 만들기

원본이 직접 가진 속성 값을 새 객체에 옮길 때 **펼침 문법(spread syntax)**인 `...`를 사용합니다.
복사본의 켜짐 여부를 바꾼 뒤 원본도 바뀔지 예상해 봅니다.

```js
const settings = { on: false, volume: 2, display: { brightness: 4 } };
const copied = { ...settings };
copied.on = true;
console.log(settings === copied, settings.on, copied.on);
```

```text
false false true
```

`copied`는 새 바깥 객체입니다.
`on`은 각 객체가 가진 원시값이므로 복사본에서 바꿔도 원본 속성은 그대로입니다.
객체 펼침은 원본이 직접 가진 **열거 가능한(enumerable)** 속성들의 값을 옮깁니다.
프로토타입을 따라 찾는 속성이나 비열거 속성까지 같은 구조로 복제하는 기능은 아닙니다.
프로토타입 연결은 [객체 모델](#/learn/javascript/wiki-object-model)에서 이어서 확인합니다.

## 얕은 복사는 한 단계만 새로 만든다

앞에서 만든 `copied`의 음량과 밝기를 바꾸어 봅니다.
바깥 객체와 안쪽 `display` 중 어느 것이 새 객체인지 먼저 예상해 봅니다.

```js
console.log(settings === copied, settings.display === copied.display);
copied.volume = 5;
copied.display.brightness = 9;
console.log(settings.volume, settings.display.brightness);
```

```text
false true
2 9
```

바깥 객체는 새로 생겼지만 `display`에는 같은 안쪽 객체가 들어 있습니다.
이렇게 한 단계의 속성 값만 새 대상에 옮기는 복사를 **얕은 복사(shallow copy)**라고 합니다.
음량은 각 바깥 객체가 가진 값이라 원본에 전해지지 않지만 밝기는 공유한 `display`의 변경이라 원본에서도 보입니다.
`Object.assign({}, settings)`도 원본이 직접 가진 열거 가능한 속성 값을 새 빈 객체에 옮기는 얕은 복사입니다.

## 바꿀 중첩 단계까지 새로 만들기

원본의 밝기를 남겨 두려면 밝기까지 이어지는 경로의 객체를 새로 만듭니다.
아래 코드에서 원본과 새 설정의 밝기 및 `display` 비교 결과를 예상해 봅니다.

```js
const settings = { on: false, volume: 2, display: { brightness: 4 } };
const nextSettings = {
  ...settings,
  display: { ...settings.display, brightness: 9 },
};
console.log(settings.display.brightness, nextSettings.display.brightness);
console.log(settings.display === nextSettings.display);
```

```text
4 9
false
```

바깥 `settings`와 바뀌는 경로의 안쪽 `display`를 각각 새로 만들었습니다.
바뀌지 않는 다른 객체 속성이 있다면 필요한 경우 계속 공유할 수 있습니다.
모든 중첩 값을 무조건 깊게 복사할 필요는 없습니다.

## 배열 펼침도 안쪽 값을 그대로 옮긴다

설정을 목록에 담은 뒤 배열을 펼쳐 봅니다.
두 배열과 첫 요소 객체의 비교 결과를 예상해 봅니다.

```js
const settingsList = [{ on: false, volume: 2, display: { brightness: 4 } }];
const copiedList = [...settingsList];
console.log(settingsList === copiedList, settingsList[0] === copiedList[0]);
copiedList[0].on = true;
console.log(settingsList[0].on);
```

```text
false true
true
```

배열 펼침은 순회로 얻은 요소 값을 새 배열에 차례로 넣습니다.
객체 펼침이 직접 가진 열거 가능한 속성 값을 옮기는 것과 대상이 다릅니다.
새 바깥 배열을 만들었어도 요소 객체는 계속 공유합니다.

## filter도 요소 객체까지 복제하지 않는다

앞의 설정 목록에서 음량이 있는 설정만 고릅니다.
선택한 설정의 음량을 바꾼 뒤 원본 목록과의 관계를 예상해 봅니다.

```js
const selected = settingsList.filter(settings => settings.volume > 0);
selected[0].volume = 0;
console.log(settingsList[0].volume, selected === settingsList);
```

```text
0 false
```

`filter`는 새 바깥 배열을 만들지만 선택한 요소 객체까지 복제하지 않습니다.
객체 펼침은 직접 가진 열거 가능한 속성 값을 옮기고 배열 펼침은 순회로 얻은 요소 값을 새 배열에 넣습니다.
둘 다 중첩 객체를 자동 복제하지 않습니다.

## 원본을 바꿀지 새 값을 만들지 정하기

객체를 한곳에서 관리하고 이전 상태를 남길 필요가 없다면 직접 변경이 가장 단순할 수 있습니다.
여러 코드가 같은 객체를 사용하거나 변경 전후를 비교한다면 새 값을 만드는 편이 도움이 됩니다.
객체 정체성으로 상태 변경을 확인하거나 함수가 원본을 보존하기로 약속한 경우에도 바뀌는 경로를 복사합니다.
먼저 누가 객체를 공유하는지와 어느 단계가 바뀌는지를 확인합니다.

## 정리

- 같은 객체의 속성 변경은 공유되며 변수·매개변수의 재대입은 그 이름의 연결만 바꿉니다.
- 얕은 복사는 바깥 대상만 새로 만들고 중첩 객체나 배열 요소 객체는 계속 공유합니다.
- 원본을 보존하려면 바뀌는 경로의 객체를 필요한 단계만 새로 만듭니다.

## 이어서 연습하기

문서 아래의 객관식 복습에서 같은 객체인지와 바뀌는 경로를 먼저 판단합니다.
연결된 복사 실습에서는 원본 보존 조건을 확인한 뒤 필요한 객체를 선택합니다.
다음으로 [스코프와 호이스팅: 이름 탐색과 선언 전 접근](#/learn/javascript/wiki-scope-hoisting)을 살펴봅니다.

## 공식 자료

확인일: 2026-10-02입니다.

- [ECMAScript 2026 — Language Types and Reference Records](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 — Array and Object Initializers](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-array-initializer)
- [ECMAScript 2026 — CopyDataProperties](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-copydataproperties)

## 핵심 질문 답

같은 객체를 사용하는 이름은 그 객체의 속성 변경을 함께 봅니다.
객체끼리 `===`는 내용 대신 객체 정체성을 비교합니다.
변수나 매개변수에 다른 값을 재대입하면 그 이름의 연결만 바뀌고 호출자의 이름은 그대로입니다.
객체·배열의 얕은 복사는 새 바깥 대상을 만들지만 중첩 객체는 공유합니다.
`filter`의 새 배열도 선택한 요소 객체를 공유합니다.
원본을 보존해야 한다면 바뀔 속성까지 이어지는 경로의 객체를 필요한 단계만 새로 만듭니다.
직접 변경이 적절한 조건과 원본 보존이 필요한 조건을 먼저 구분합니다.
