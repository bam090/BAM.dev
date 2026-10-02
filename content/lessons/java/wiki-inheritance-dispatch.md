# 상속·인터페이스·조합: 타입 관계 고르기

## 학습 목표

- 상위 타입 변수로 하위 객체를 부를 때 선언 타입이 정하는 것과 실제 객체가 정하는 것을 구분할 수 있습니다.
- 공통 상태와 구현은 추상 클래스로 두고 여러 클래스가 제공할 역할은 인터페이스로 선언할 수 있습니다.
- 협력 객체를 필드로 가지고 일을 맡기는 조합과 생성자 주입으로 구현을 바꿔 끼울 수 있습니다.
- 상속·인터페이스·조합 가운데 요구에 맞는 관계를 고를 수 있습니다.

## 먼저 확인할 개념

[클래스와 객체: 참조·생성자·캡슐화](#/learn/java/wiki-objects)와 [메서드의 입력·출력 계약](#/learn/java/wiki-methods)을 먼저 확인해 보세요.

## 상속이란

상속은 기존 클래스의 멤버를 물려받아 그 클래스의 한 종류인 새 클래스를 만드는 타입 관계입니다.
앞 문서에서는 클래스 하나로 객체의 상태와 행동을 지켰습니다.
이번에는 여러 클래스가 공통 부분을 나누거나 서로 협력하는 관계를 다룹니다.

물려주는 클래스를 상위 클래스라고 하고 물려받는 클래스를 하위 클래스라고 합니다.
Java에서는 `extends`로 상위 클래스를 지정합니다.

예를 들어 학습 항목을 나타내는 `LearningItem`과 그 한 종류인 영상 수업 `VideoLesson`을 만든다고 해 보겠습니다.
수업을 마치면 완료 알림도 보내야 합니다.
이 문서는 이 학습 항목과 완료 알림 하나로 상속·추상 클래스·인터페이스·조합을 차례로 살펴봅니다.

## 상속과 오버라이딩 사용법

하위 클래스는 물려받은 메서드의 구현을 바꿀 수 있습니다.
이것을 오버라이딩(overriding)이라고 합니다.

```java
class LearningItem {
    String kind() {
        return "기본";
    }
}

class VideoLesson extends LearningItem {
    @Override
    String kind() {
        return "영상";
    }
}
```

다음 코드에서 `item.kind()`가 무엇을 돌려줄지 예상해 보세요.

```java
LearningItem item = new VideoLesson();
String kind = item.kind();
```

`kind`는 `"영상"`입니다.
변수의 선언 타입은 `LearningItem`이지만 실제 객체는 `VideoLesson`이기 때문입니다.

선언 타입과 실제 객체는 서로 다른 일을 정합니다.

| 정하는 것 | 기준 | 예제에서 |
| --- | --- | --- |
| 호출할 수 있는 멤버 | 변수의 선언 타입 | `LearningItem`에 있는 `kind()`를 부를 수 있습니다 |
| 실행되는 인스턴스 메서드 구현 | 실제 객체 | `VideoLesson`이 재정의한 `kind()`가 실행됩니다 |

상위 타입으로 바라본다고 객체가 잘리거나 다른 객체로 바뀌지는 않습니다.
같은 객체를 상위 타입의 약속으로 사용할 뿐입니다.

> [!note]- 필드와 static 메서드도 실제 객체를 따르나요?
> 실제 객체에 따라 구현이 골라지는 것은 재정의한 인스턴스 메서드뿐입니다.
> 하위 클래스가 같은 이름의 필드나 static 메서드를 다시 선언해도 상위 타입 변수로 접근하면 상위 클래스의 것이 쓰입니다.

오버라이딩은 물려받은 구현을 바꾸는 일이고 오버로딩은 같은 이름으로 받을 수 있는 매개변수 구성을 늘리는 일입니다.
오버라이딩에는 지켜야 할 규칙이 있습니다.

- 매개변수 구성은 상위 메서드와 같아야 하고 반환 타입·접근 수준·던지는 예외는 상위 메서드와 호환되어야 합니다.
- 상위 메서드보다 접근 범위를 좁힐 수 없고 `final` 메서드는 재정의할 수 없습니다.
- `@Override`는 이 메서드가 실제로 재정의인지 컴파일러가 검사하게 하는 표시입니다.

상속에 포함되지 않는 것도 있습니다.
일반 클래스는 직접 상위 클래스를 하나만 지정합니다.
상위 클래스의 `private` 멤버는 하위 클래스 코드에서 직접 쓸 수 없고 생성자도 상속되지 않습니다.
그래서 상위 클래스에 접근 가능한 인수 없는 생성자가 없다면 하위 생성자가 알맞은 `super(...)`를 호출해야 합니다.

상속은 코드를 재사용하려는 목적만으로 고르지 않습니다.
하위 객체를 상위 타입이 필요한 곳에 넣어도 상위 타입의 약속을 지키는 한 종류일 때 상속을 씁니다.
그렇다면 상위 클래스의 `kind()`처럼 기본 구현을 정할 수 없는 메서드는 어떻게 해야 할까요?

---

## 추상 클래스 사용법

추상 클래스(abstract class)는 공통 상태와 구현을 가지면서 일부 메서드를 하위 클래스에 남겨 두는 클래스입니다.
모든 학습 항목은 제목을 갖고 같은 형식의 완료 문장을 만듭니다.
그러나 종류 이름은 항목마다 다르므로 상위 클래스에서 정하지 않습니다.

```java
abstract class LearningItem {
    private final String title;

    LearningItem(String title) {
        this.title = title;
    }

    String completionMessage() {
        return kind() + " '" + title + "' 완료";
    }

    abstract String kind();
}

final class VideoLesson extends LearningItem {
    VideoLesson(String title) {
        super(title);
    }

    @Override
    String kind() {
        return "영상";
    }
}
```

`new VideoLesson("Java").completionMessage()`의 결과를 예상해 보세요.

결과는 `영상 'Java' 완료`입니다.
공통 구현인 `completionMessage`는 상위 클래스에 있고 그 안에서 부르는 `kind()`는 실제 객체인 `VideoLesson`의 구현이 실행되기 때문입니다.

추상 클래스는 필드·생성자·구현된 메서드와 본문 없는 추상 메서드를 함께 가질 수 있습니다.
다만 `new LearningItem(...)`처럼 추상 클래스 자체의 객체는 직접 만들 수 없습니다.
그래도 생성자는 있습니다.
하위 객체를 만들 때 `super(title)`로 실행되어 공통 상태인 제목을 초기화합니다.

구체 하위 클래스는 물려받은 추상 메서드를 모두 구현해야 합니다.
구현하지 않으면 그 하위 클래스도 `abstract`로 선언해야 합니다.

학습 항목의 공통 부분은 추상 클래스로 정리했습니다.
이제 완료 알림을 보내는 쪽을 살펴보겠습니다.
알림은 콘솔 출력이 될 수도 있고 미리보기 화면이 될 수도 있어서 학습 항목과는 다른 종류의 공통점이 필요합니다.

---

## 인터페이스 사용법

인터페이스(interface)는 서로 다른 클래스가 제공할 공통 행동을 타입으로 선언한 것입니다.
알림 전송기는 상태를 나눌 필요 없이 `send`라는 행동만 약속하면 됩니다.

```java
interface Notifier {
    void send(String message);
}

final class ConsoleNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println(message);
    }
}

final class PreviewNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("미리보기: " + message);
    }
}
```

클래스가 인터페이스를 따를 때는 `implements`를 씁니다.
한 클래스는 여러 인터페이스를 구현할 수 있고 인터페이스가 다른 인터페이스를 확장할 때는 `extends`를 씁니다.

본문 없이 선언한 일반 인터페이스 메서드는 암시적으로 `public abstract`입니다.
그래서 구현하는 `send`도 `public`이어야 합니다.
접근 제어자를 빼면 접근 범위가 좁아져 컴파일되지 않습니다.

| 비교 | 추상 클래스 | 인터페이스 |
| --- | --- | --- |
| 직접 객체 생성 | 할 수 없음 | 할 수 없음 |
| 인스턴스 필드·생성자 | 가질 수 있음 | 가질 수 없음 |
| 필드 | 객체별 상태를 둘 수 있음 | 암시적으로 `public static final` |
| 구현 | 일반 메서드 | `default` · `static` · `private` 메서드로 일부 가능 |
| 한 클래스가 따를 수 있는 수 | 직접 상위 클래스 하나 | 여러 인터페이스 |
| 잘 맞는 곳 | 가까운 종류의 공통 상태와 구현 | 서로 다른 클래스의 공통 역할 |

인터페이스 타입 변수에는 그 역할을 구현한 어느 객체든 담을 수 있습니다.

```java
Notifier notifier = new ConsoleNotifier();
```

`Notifier` 같은 역할 타입의 참조를 특정 구현 타입으로 좁혀 보는 형변환을 다운캐스팅(downcasting)이라고 합니다.
실제 객체가 요청한 구현 타입이 아니면 실행 중에 `ClassCastException`이 발생합니다.
다운캐스팅이 자주 필요하다면 공통 역할에 필요한 메서드가 빠졌는지 먼저 살펴봅니다.
다형성의 장점은 구체 클래스가 무엇인지 캐내지 않고 공통 행동을 요청하는 데 있기 때문입니다.

이제 알림 역할이 생겼습니다.
남은 문제는 수업 완료를 처리하는 쪽이 이 역할을 어떻게 사용하느냐입니다.

---

## 조합과 생성자 주입 사용법

조합은 한 객체가 다른 객체를 필드로 가지고 사용하는 관계입니다.
상속이 `한 종류이다(is-a)`라면 조합은 `가지고 사용한다(has-a)`입니다.
완료 서비스는 알림 전송기의 한 종류가 아니라 전송기에게 일을 부탁하는 객체이므로 조합이 맞습니다.

```java
final class CompletionService {
    private final Notifier notifier;

    CompletionService(Notifier notifier) {
        this.notifier = notifier;
    }

    void complete(String title) {
        notifier.send(title + " 완료");
    }
}

public class InjectionDemo {
    public static void main(String[] args) {
        CompletionService service = new CompletionService(new PreviewNotifier());
        service.complete("Java");
    }
}
```

출력이 무엇일지 예상해 보세요.

```text
미리보기: Java 완료
```

서비스는 필드로 가진 협력자에게 `send`를 맡겼습니다.
이렇게 가진 객체에 일을 넘기는 것을 위임이라고 합니다.

서비스는 구체 전송기를 직접 만들지 않고 생성자로 받습니다.
호출하는 쪽이 필요한 객체를 생성자로 전달하는 이 방식을 생성자 주입이라고 합니다.
`new PreviewNotifier()` 대신 `new ConsoleNotifier()`를 전달해도 서비스의 `complete` 코드는 그대로입니다.
구현을 고르는 자리와 사용하는 자리가 나뉘었기 때문입니다.
이 연결은 Spring 같은 프레임워크 없이 Java 코드만으로 만든 수동 생성자 주입입니다.

## 상속·인터페이스·조합의 선택

지금까지 학습 항목과 완료 알림을 세 가지 관계로 연결했습니다.
요구에서 거꾸로 찾아가면 어떤 관계를 고를지 정할 수 있습니다.

| 상황 | 먼저 검토할 방법 | 이 문서의 예 |
| --- | --- | --- |
| 가까운 타입들이 공통 상태와 구현을 갖고 자연스러운 상위·하위 관계입니다 | 상속과 추상 클래스 | `LearningItem`과 `VideoLesson` |
| 서로 다른 클래스가 같은 행동 역할을 제공해야 합니다 | 인터페이스 | `Notifier` |
| 한 객체가 다른 객체를 부품이나 협력자로 씁니다 | 조합 | `CompletionService`의 `notifier` 필드 |
| 협력 객체를 교체하거나 바깥에서 골라야 합니다 | 인터페이스 타입을 받는 생성자 주입 | `CompletionService(Notifier notifier)` |

반대로 구현이 하나뿐이고 바꿀 이유도 없다면 모든 클래스 앞에 인터페이스를 만들 필요는 없습니다.
이해해야 할 파일만 늘어날 수 있기 때문입니다.
실제로 달라지는 행동이나 외부 협력의 경계가 있을 때 역할을 나눕니다.

## 정리

- 선언 타입은 호출할 수 있는 멤버를 정하고 재정의한 인스턴스 메서드는 실제 객체의 구현이 실행됩니다.
- 가까운 종류의 공통 상태와 구현은 추상 클래스로 두고 서로 다른 클래스가 제공할 행동은 인터페이스로 선언합니다.
- 협력자는 필드로 가지고 일을 맡기며 인터페이스 타입을 생성자로 받으면 사용하는 코드를 바꾸지 않고 구현을 교체할 수 있습니다.

## 이어서 연습하기

아래 객관식 문제에서 상속·추상 클래스·인터페이스·조합의 선택 이유를 확인해 보세요.

다음 개념: [제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics)

## 공식 자료

- [Java Language Specification SE 25 — Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java Language Specification SE 25 — Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html)
- [Java Language Specification SE 25 — Method Invocation Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)

## 핵심 질문 답

상위 타입 변수로 부를 수 있는 멤버는 선언 타입이 정하고 재정의한 인스턴스 메서드는 실제 객체의 구현이 실행되며 필드와 static 메서드는 이 선택을 따르지 않습니다.
가까운 종류가 객체별 공통 상태와 구현을 나누면 추상 클래스를 쓰고 서로 다른 클래스가 같은 역할을 제공해야 하면 인터페이스를 쓰며 본문 없는 인터페이스 메서드는 `public abstract`라서 구현도 `public`이어야 합니다.
서비스가 알림 전송기를 사용하는 관계는 상속이 아니라 협력자를 필드로 가지고 일을 맡기는 조합이며 생성자로 인터페이스 구현을 받으면 서비스 코드를 바꾸지 않고 협력자를 교체할 수 있습니다.
