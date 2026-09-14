# 추상 클래스와 인터페이스의 역할

## 학습 목표

공통 상태·구현과 여러 클래스의 역할 요구를 보고 추상 클래스와 인터페이스를 선택할 수 있습니다.

## 한줄 요약

추상 클래스는 공통 상태와 구현을, 인터페이스는 여러 객체가 제공할 역할을 나타냅니다.

## 먼저 확인할 개념

[상속과 실제 객체의 메서드](#/learn/java/wiki-inheritance-dispatch)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 추상 클래스는 공통 부분과 미완성 부분을 함께 둔다

가까운 종류의 객체들이 공통 상태와 구현을 가지면서 일부 행동만 다르다면 **추상 클래스(abstract class)**를 사용할 수 있다.

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
```

추상 클래스는 필드, 생성자, 구현된 메서드와 구현이 없는 추상 메서드를 함께 가질 수 있다.
다만 `new LearningItem(...)`처럼 추상 클래스 자체의 객체는 직접 만들 수 없다.

구체 하위 클래스는 물려받은 추상 메서드를 구현해야 한다.
구현하지 않는다면 그 하위 클래스도 `abstract`로 선언해야 한다.

추상 클래스의 생성자는 하위 객체를 만들 때 실행되어 공통 상태를 초기화한다.
추상 클래스를 직접 생성할 수 없다는 사실과 생성자가 없다는 설명은 서로 다르다.

## 인터페이스는 객체가 제공할 역할을 약속한다

**인터페이스(interface)**는 서로 다른 클래스가 제공할 공통 행동을 타입으로 선언한다.

아래 두 타입 선언은 같은 패키지에 둔다. 이어지는 변수 선언은 `main` 같은 메서드 안에서 사용하는 문장이다.

```java
interface Notifier {
    void send(String message);
}

final class ConsoleNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("알림: " + message);
    }
}
```

클래스가 인터페이스를 따를 때는 `implements`를 사용한다.
한 클래스는 여러 인터페이스를 구현할 수 있고, 인터페이스가 다른 인터페이스를 확장할 때는 `extends`를 사용한다.

인터페이스는 직접 객체로 만들 수 없고 인스턴스 필드나 생성자를 가지지 않는다.
본문 없이 선언한 일반 인터페이스 메서드는 암시적으로 `public abstract`이므로 구현 메서드도 `public`이어야 한다.

인터페이스의 필드는 암시적으로 `public static final`이다.
현대 Java의 인터페이스에는 `default`, `static`, `private` 메서드로 일부 구현을 둘 수도 있지만, 객체별 공통 상태를 저장하는 용도는 아니다.

인터페이스 타입의 변수에는 그 역할을 구현한 여러 객체를 담을 수 있다.
객체가 사라지거나 다른 객체로 변하는 것이 아니라, 같은 객체를 공통 역할의 관점에서 사용하는 것이다.

```java
Notifier notifier = new ConsoleNotifier();
```

`Notifier` 같은 상위 역할 타입의 참조를 특정 구현 타입으로 좁혀 보는 형변환을 **다운캐스팅(downcasting)**이라고 한다.
실제 객체가 요청한 구현 타입이 아니면 실행 중 `ClassCastException`이 발생한다.
다운캐스팅을 반복한다면 공통 역할에 필요한 메서드가 빠졌는지 먼저 살펴본다.
다형성의 장점은 구체 클래스가 무엇인지 캐내지 않고 공통 행동을 요청하는 데 있다.

## 상속·인터페이스·조합을 고르는 기준

| 상황 | 먼저 검토할 방법 |
| --- | --- |
| 가까운 타입들이 공통 상태와 구현을 가지며 자연스러운 상위·하위 관계임 | 상속과 추상 클래스 |
| 서로 다른 클래스가 같은 행동 역할을 제공해야 함 | 인터페이스 |
| 한 객체가 다른 객체를 부품이나 협력자로 사용함 | 조합 |
| 협력 객체를 교체하거나 바깥에서 선택해야 함 | 인터페이스 타입을 받는 생성자 주입 |

코드를 재사용할 수 있다는 이유만으로 상속을 선택하지 않는다.
하위 객체를 상위 타입이 필요한 곳에 넣어도 그 타입이 약속한 의미와 규칙을 지키는지 확인한다.

구현이 하나뿐이고 교체할 이유도 없다면 모든 클래스 앞에 인터페이스를 만드는 것이 오히려 이해할 파일만 늘릴 수 있다.
실제로 달라지는 행동이나 외부 협력의 경계가 있을 때 역할 분리를 검토한다.

## 이어서 연습하기

[조합·위임과 생성자 주입](#/learn/java/wiki-composition-injection)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java Language Specification SE 25 — Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html)
- [Java Language Specification SE 25 — Method Invocation Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)

## 핵심 질문 답

가까운 타입들이 객체별 공통 상태와 구현을 공유하면 추상 클래스를 검토하고, 서로 다른 클래스가 같은 역할을 제공해야 하면 인터페이스를 사용합니다. 추상 클래스는 직접 생성할 수 없지만 생성자로 하위 객체의 공통 상태를 준비할 수 있습니다. 인터페이스에는 인스턴스 필드나 생성자가 없고 본문 없는 일반 메서드는 public abstract여서 구현도 public이어야 합니다. 실제 필요 없이 모든 클래스에 인터페이스를 추가하지 않습니다.
