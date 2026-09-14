# 조합·위임과 생성자 주입

## 학습 목표

바뀌는 협력 역할을 생성자로 받아 구현을 교체할 수 있도록 책임을 나눌 수 있습니다.

## 한줄 요약

가진 객체에 일을 위임하고 역할 타입으로 전달받으면 사용하는 코드와 구체 구현의 결합을 줄일 수 있습니다.

## 먼저 확인할 개념

[추상 클래스와 인터페이스의 역할](#/learn/java/wiki-abstract-interfaces) · [캡슐화](#/learn/java/wiki-encapsulation)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 가진 협력자에게 일을 맡긴다

상속은 한 종류이다(is-a), 조합은 가지고 사용한다(has-a)는 관계다.
완료 서비스는 알림 전송기의 한 종류가 아니라 전송기에게 일을 부탁하는 객체다.
필드로 협력자를 가지고 send를 호출해 맡기는 것이 위임이다.

아래 선언들은 같은 패키지의 Java 25 예제다. 별도 프레임워크 없이 역할과 연결을 읽을 수 있다.

```java
interface Notifier { void send(String message); }
final class ConsoleNotifier implements Notifier {
    public void send(String message) { System.out.println(message); }
}
final class PreviewNotifier implements Notifier {
    public void send(String message) { System.out.println("미리보기: " + message); }
}
final class CompletionService {
    private final Notifier notifier;
    CompletionService(Notifier notifier) { this.notifier = notifier; }
    void complete(String title) { notifier.send(title + " 완료"); }
}
public class InjectionDemo {
    public static void main(String[] args) {
        CompletionService service = new CompletionService(new PreviewNotifier());
        service.complete("Java");
    }
}
```

호출하는 쪽이 필요한 객체를 생성자로 전달하는 것이 수동 생성자 주입이다.
서비스는 구체 전송기를 직접 만들지 않고 Notifier의 약속으로 호출한다.
new PreviewNotifier 대신 new ConsoleNotifier를 전달해도 서비스의 완료 처리 코드는 같다.
구현을 결정하는 자리와 사용하는 자리를 나눴기 때문이다.


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

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java Language Specification SE 25 — Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html)
- [Java Language Specification SE 25 — Method Invocation Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)

## 핵심 질문 답

서비스가 알림 전송기를 사용하는 관계는 상속보다 협력 객체를 필드로 가지는 조합으로 표현합니다. 서비스는 Notifier 역할에 send를 위임하고 생성자로 그 구현 객체를 받습니다. 호출자가 new로 구현을 골라 전달하면 서비스 코드를 바꾸지 않고 협력자를 교체할 수 있습니다. 이는 Spring 같은 프레임워크 없이도 가능한 수동 생성자 주입입니다.
