# 클래스와 객체: 참조·생성자·캡슐화

## 학습 목표

- 클래스 선언과 new로 만든 객체와 참조 변수를 구분하고 어느 객체의 상태가 바뀌는지 찾을 수 있습니다.
- 생성자로 객체의 첫 상태를 준비하고 Java 25에서 위임 호출 앞에 둘 수 있는 코드를 구분할 수 있습니다.
- 필드를 감추고 허용한 행동으로만 상태를 바꾸게 해서 상태 규칙을 객체 안에 모을 수 있습니다.

## 먼저 확인할 개념

[값 전달: 매개변수 재대입과 객체 변경](#/learn/java/wiki-argument-values)과 [메서드의 입력·출력 계약](#/learn/java/wiki-methods)을 먼저 확인해 보세요.

## 클래스와 객체란

클래스는 객체가 가질 상태와 행동을 적은 타입 선언이고 객체는 `new`로 그 선언에서 만든 실제 값입니다.
앞 문서에서는 메서드에 참조값이 복사되어 전달되는 모습을 보았습니다.
이번에는 그 참조가 가리키는 객체를 직접 만들고 지키는 방법을 살펴봅니다.

클래스에 적은 변수를 필드라고 하고 객체마다 따로 갖는 필드를 인스턴스 필드라고 합니다.
객체를 다른 말로 인스턴스라고도 부릅니다.

예를 들어 학습 세션을 나타내는 `StudySession`을 만든다고 해 보겠습니다.
세션에는 제목과 상태가 있습니다.
상태는 `READY`에서 시작해 `start`로 `RUNNING`이 되고 `complete`로 `DONE`이 됩니다.
이 문서는 이 세션 하나로 객체와 참조·생성자·캡슐화를 차례로 살펴봅니다.

## 클래스와 객체의 구성

`StudySession`의 첫 모습은 다음과 같습니다.

```java
class StudySession {
    String title;
    String state = "READY";

    void start() {
        state = "RUNNING";
    }
}
```

| 구성 | 예제에서 | 하는 일 |
| --- | --- | --- |
| 클래스 선언 | `class StudySession` | 타입과 구현을 선언합니다 |
| 인스턴스 필드 | `title` · `state` | 객체마다 따로 갖는 상태입니다 |
| 인스턴스 메서드 | `start()` | 호출 대상 객체의 상태를 다룹니다 |
| 객체 생성 | `new StudySession()` | 실행 중에 객체를 하나 만듭니다 |

`StudySession session;`은 변수를 선언할 뿐이고 `new StudySession()`이 객체를 만드는 표현식입니다.
그렇다면 객체를 여러 번 만들거나 참조를 다른 변수에 넣으면 무엇이 달라질까요?

---

## 객체와 참조 사용법

다음 코드를 실행한 뒤 세 변수의 `state`가 각각 무엇일지 예상해 보세요.

```java
StudySession first = new StudySession();
StudySession other = new StudySession();
StudySession same = first;
same.start();
```

`first.state`와 `same.state`는 `RUNNING`이고 `other.state`는 `READY`입니다.
`new`를 두 번 실행했으므로 객체는 두 개입니다.
`same = first`는 새 객체를 만들지 않고 `first`가 가진 참조값만 복사합니다.
그래서 `first`와 `same`은 같은 객체를 가리키고 어느 쪽으로 읽어도 같은 `state`를 봅니다.
반면 `other`는 별개의 객체라서 상태가 바뀌지 않습니다.

`same.start()`처럼 인스턴스 메서드를 부르면 점 앞의 참조가 호출 대상 객체를 정합니다.
메서드 안의 `this`는 바로 그 대상 객체를 가리킵니다.
참조값은 객체를 찾아가는 값이며 Java 코드에서 주소 숫자처럼 계산해 쓰지 않습니다.

> [!note]- 상태와 행동을 한 클래스에 묶을 때
> 객체마다 오래 유지할 상태와 그 상태를 바꾸는 규칙이 함께 있으면 클래스의 책임으로 묶기 좋습니다.
> 입력을 받아 한 번 계산한 결과만 돌려주는 일이라면 작은 메서드로도 충분합니다.

필드와 매개변수의 이름이 같으면 `this.title`과 `title`을 구별해야 어느 값을 읽고 바꾸는지 알 수 있습니다.
이 구별은 다음 절의 생성자에서 바로 쓰입니다.

---

## 생성자 사용법

생성자는 `new`로 객체를 만들 때 실행되어 객체의 첫 상태를 준비하는 코드입니다.
클래스와 이름이 같고 반환 타입을 적지 않습니다.
지금 `StudySession`은 제목 없이도 만들어집니다.
제목이 빈 세션이 생기지 않도록 생성자에서 먼저 검사해 보겠습니다.

```java
class StudySession {
    private final String title;
    private String state;

    StudySession(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목이 필요합니다.");
        }
        this(title, "READY");
    }

    private StudySession(String title, String state) {
        this.title = title;
        this.state = state;
    }
}
```

첫 생성자는 제목을 검사한 뒤 `this(...)`로 두 번째 생성자에게 초기화를 맡깁니다.
두 번째 생성자는 `this.title = title`처럼 매개변수 값을 같은 이름의 필드에 넣습니다.
그래서 빈 제목을 받으면 객체가 완성되기 전에 예외가 발생합니다.

| 위임 호출 | 맡기는 대상 |
| --- | --- |
| `this(...)` | 같은 클래스의 다른 생성자 |
| `super(...)` | 직접 상위 클래스의 생성자 |

한 생성자 본문에는 명시적 위임 호출을 최대 하나만 둘 수 있습니다.
위 예제처럼 위임 호출 앞에 검사 문장을 두는 형태는 Java 25의 정식 기능인 유연한 생성자 본문(flexible constructor bodies)이며 preview 옵션이 필요하지 않습니다.
위임 호출 앞의 문장과 호출 인수는 객체가 아직 만들어지는 중인 초기 구성 단계(early construction context)에 속합니다.
이 단계에서는 매개변수와 지역 변수로 인수를 검사하고 계산할 수 있습니다.
그러나 생성 중인 객체의 필드를 읽거나 인스턴스 메서드를 호출할 수는 없습니다.

> [!note]- 초기 구성 단계에서 필드에 값을 넣을 수 있나요?
> Java 25는 이 단계에서 현재 클래스에 선언한 필드에 제한적으로 첫 값을 대입하는 일을 허용합니다.
> 그래도 필드를 읽어 계산하거나 현재 객체의 메서드를 부르는 일은 허용하지 않습니다.
> 입문 예제에서는 위임받은 생성자에서 필드를 초기화하면 흐름이 단순합니다.

생성자를 만들 때 함께 기억할 규칙이 두 가지 있습니다.

- 생성자를 하나도 선언하지 않았을 때만 인수 없는 기본 생성자가 암시적으로 생깁니다.
  그래서 위처럼 매개변수 생성자를 선언했다면 `new StudySession()`은 컴파일되지 않고 `new StudySession("Java")`처럼 만들어야 합니다.
- `void StudySession(String title)`처럼 반환 타입을 적으면 생성자가 아니라 이름만 같은 일반 메서드가 됩니다.

이제 세션은 올바른 첫 상태로 태어납니다.
그런데 만들어진 뒤에 아무 코드나 `state`를 바꿀 수 있다면 첫 상태를 지킨 의미가 줄어듭니다.

---

## 캡슐화 사용법

캡슐화는 내부 상태를 감추고 객체가 허용한 행동으로만 상태 변경을 요청하게 만드는 설계입니다.
세션의 상태 규칙은 `READY`에서만 시작할 수 있고 `RUNNING`에서만 완료할 수 있다는 것입니다.
이 규칙을 세션의 공개 행동 안에 넣어 보겠습니다.

```java
class StudySession {
    private String state;

    public boolean start() {
        if (!state.equals("READY")) {
            return false;
        }
        state = "RUNNING";
        return true;
    }

    public boolean complete() {
        if (!state.equals("RUNNING")) {
            return false;
        }
        state = "DONE";
        return true;
    }

    public String state() {
        return state;
    }
}
```

`title` 필드와 두 생성자는 앞 절과 같으므로 생략했습니다.
생성자가 `state`를 `READY`로 시작하게 합니다.
새 세션에 `start` 없이 `complete`를 먼저 호출하면 무엇이 반환되고 `state()`는 무엇일지 예상해 보세요.

`complete()`는 `false`를 반환하고 `state()`는 그대로 `READY`입니다.
`complete`가 현재 상태를 먼저 검사하고 허용되지 않은 변경은 하지 않기 때문입니다.
허용되지 않은 행동에서 상태를 그대로 두는 것도 객체가 지키는 약속입니다.

필드를 `private`으로 감추는 것만으로는 이 규칙이 지켜지지 않습니다.
아무 값이나 넣는 `setState(String state)`를 공개하면 호출 코드가 `DONE`을 바로 넣어 규칙을 건너뛸 수 있기 때문입니다.
그래서 상태를 바꾸는 길은 `start`와 `complete`처럼 의미 있는 행동으로만 열어 둡니다.

| 접근 수준 | 사용할 수 있는 곳 |
| --- | --- |
| `private` | 그 멤버를 선언한 최상위 클래스 본문 안이며 안의 중첩 타입도 포함합니다 |
| `public` | 멤버를 가진 타입 자체에 접근할 수 있는 모든 코드 |

접근 제어자는 멤버를 쓸 수 있는 코드의 범위를 정할 뿐입니다.
상태가 어떤 순서로 바뀌어야 하는지는 메서드의 검사가 맡습니다.
그래서 생성자는 올바른 첫 상태를 맡고 공개 행동은 그 뒤의 변경 규칙을 맡도록 나눕니다.

## 정리

- 클래스는 타입 선언이고 `new`를 실행할 때마다 객체가 하나 생기며 참조를 대입하면 같은 객체를 공유합니다.
- 생성자는 객체가 완성되기 전에 입력을 검사해 첫 상태를 준비하고 Java 25에서는 위임 호출 앞에서 인수를 검사할 수 있습니다.
- 캡슐화는 필드를 감추고 상태를 검사하는 공개 행동으로만 변경을 허용해 규칙을 객체 안에 모읍니다.

## 이어서 연습하기

아래 객관식 문제에서 객체와 참조·생성자·캡슐화의 선택 이유를 확인해 보세요.

다음 개념: [패키지와 접근 범위](#/learn/java/wiki-packages-access)

## 공식 자료

- [Java25 클래스와 생성자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 유연한 생성자](https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html)
- [Java25 접근 제어](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6)

## 핵심 질문 답

클래스 선언과 `new`로 만든 객체와 그 객체를 가리키는 참조 변수를 따로 봅니다.
`new`를 두 번 실행하면 객체가 둘이고 참조만 대입하면 같은 객체를 공유하며 인스턴스 메서드는 점 앞의 참조가 가리키는 객체의 상태를 다룹니다.
생성자는 객체가 완성되기 전에 입력을 검사해 첫 상태를 준비하고 Java 25에서는 위임 호출 앞에서 인수를 검사할 수 있지만 생성 중인 객체의 필드를 읽거나 인스턴스 메서드를 부를 수는 없습니다.
필드를 감추는 것만으로는 부족하며 현재 상태를 검사하는 의미 있는 행동만 공개해야 상태 규칙이 객체 안에서 지켜집니다.
