# prototype·class와 메서드 호출

## 학습 목표

객체의 개별 상태와 프로토타입의 공유 메서드를 구분하고 호출 대상에 따른 this를 판단할 수 있습니다.

## 한줄 요약

객체는 자기에게 없는 속성을 프로토타입에서 찾고, class 인스턴스는 상태를 따로 가지며 메서드를 공유할 수 있습니다.

## 먼저 확인할 개념

[배열과 객체](#/learn/javascript/wiki-arrays-objects)과 [클로저](#/learn/javascript/wiki-closure)를 먼저 확인해 보세요.

## 객체는 동작을 어디에서 찾을까

객체의 속성 값으로 둔 함수를 **메서드(method)**라고 부른다.
객체가 요청받은 속성을 직접 가지고 있지 않으면 연결된 다른 객체에서 찾을 수 있는데,
이 연결 대상이 **프로토타입(prototype)**이다.
없으면 다음 프로토타입으로 올라가고 `null`에 닿으면 검색을 끝낸다.
이 검색 길이 **프로토타입 체인(prototype chain)**이다.

## `class`도 프로토타입 모델을 사용한다

`class`는 같은 모양의 객체를 만들고 메서드를 함께 정의하기 편한 문법이다.

```js
class Lamp {
  constructor(name) {
    this.name = name;
  }

  label() {
    return `이름: ${this.name}`;
  }
}

const deskLamp = new Lamp("책상 등");
const bedLamp = new Lamp("침대 등");

console.log(deskLamp.label()); // "이름: 책상 등"
console.log(bedLamp.label());  // "이름: 침대 등"
```

`new Lamp("책상 등")`은 새 객체를 만들고 `constructor`를 실행해 그 객체의 초기 상태를 정한다.
각 객체는 자기 `name`을 가지지만 `label` 메서드는 보통 `Lamp.prototype`에 한 번 놓여 여러 객체가 공유한다.

```js
console.log(deskLamp.label === bedLamp.label); // true
console.log(Object.getPrototypeOf(deskLamp) === Lamp.prototype); // true
```

JavaScript의 `class`는 프로토타입과 별개의 객체 모델이 아니다.
기존 프로토타입 모델을 사용하지만 생성자와 상속 등에 관한 자체 규칙도 있다.

## `this`는 호출 관계에서 정해진다

일반 함수의 `this`는 함수를 어디에 적었는지만으로 고정되지 않고 어떻게 호출했는지에 따라 정해진다.
`deskLamp.label()`에서는 점 앞의 `deskLamp`가 호출 대상이므로 `label` 안의 `this`가 그 객체와 연결된다.
메서드를 다른 변수에 떼어 놓고 호출하면 이 관계가 사라지므로 원래 객체가 자동 유지된다고 생각하면 안 된다.

화살표 함수는 자기만의 `this`를 만들지 않고 만들어진 바깥 환경의 `this`를 사용한다.
먼저 점 앞의 호출 대상과 일반 메서드의 `this`를 구분하고, 아래에서 떼어낸 호출을 비교한다.

## 작은 흐름 하나로 연결하기

클로저와 `class`는 모두 상태와 동작을 이어 줄 수 있지만 상태를 두는 자리가 다르다.

```js
function makeStampBook() {
  let count = 0;
  return () => ++count;
}

class StampBook {
  constructor() {
    this.count = 0;
  }

  stamp() {
    return ++this.count;
  }
}

const closedBook = makeStampBook();
const firstBook = new StampBook();
const secondBook = new StampBook();

console.log(closedBook(), closedBook());
console.log(firstBook.stamp(), secondBook.count);
console.log(firstBook.stamp === secondBook.stamp);
```

실행 결과는 다음과 같다.

```text
1 2
1 0
true
```

클로저의 `count`는 함수가 기억한 환경에 있다.
`class`로 만든 각 객체의 `count`는 각 인스턴스에 있다.
**인스턴스(instance)**는 `new`로 만든 개별 객체라는 뜻이다.
두 인스턴스의 상태는 따로 있지만 `stamp` 메서드는 프로토타입에서 공유한다.

## 떼어낸 class 메서드의 호출

앞 Lamp 예제에 이어 아래 코드를 실행하면 오류가 납니다. class의 메서드 본문은 엄격 모드로 동작합니다.

```js
const readLabel = deskLamp.label;
readLabel();
```

객체 없이 호출하면 이 메서드의 `this`는 `undefined`입니다. 따라서 `this.name`을 읽을 때 `TypeError`가 발생합니다. 이 예를 모든 비엄격 일반 함수의 this 결과로 확대하지 마세요.

## 이어서 연습하기

문서 아래의 객관식 복습 버튼으로 문제를 풀어 보세요. 제시된 조건과 값을 먼저 확인하고, 선택한 결과가 나오는 이유를 설명해 보세요.

다음으로 [DOM의 현재 값을 읽고 바꾸기](#/learn/javascript/wiki-dom-properties)을 살펴보세요.

## 공식 자료

- [MDN — class 본문과 메서드](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [ECMAScript 2026 — Execution Contexts and Environment Records](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026 — ECMAScript Function Objects and Ordinary Objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 — Objects and Classes Overview](https://tc39.es/ecma262/2026/multipage/overview.html#sec-objects)

## 핵심 질문 답

객체가 직접 가진 속성부터 찾고 없으면 프로토타입 연결을 따라가며 `null`에서 검색을 끝냅니다. class도 이 모델을 사용합니다. 인스턴스의 상태는 각각 둘 수 있고 class 본문에 정의한 일반 메서드는 프로토타입에서 공유됩니다.
일반 메서드의 `this`는 호출 관계를 봅니다. `deskLamp.label()`은 deskLamp를 대상으로 호출하지만 메서드를 떼어 호출하면 그 연결이 자동 유지되지 않습니다. 화살표 함수는 자기 this 대신 만들어진 바깥 환경의 this를 사용합니다.
