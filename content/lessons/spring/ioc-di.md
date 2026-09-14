# DI(의존성 주입): 필요한 객체를 외부에서 받기

## 학습 목표

컨테이너가 등록된 협력 객체를 찾아 서비스 생성자로 전달하는 흐름을 설명할 수 있습니다.

## 한줄 요약

DI는 객체가 필요한 협력자를 바깥에서 받고, Spring 컨테이너가 그 연결을 맡는 방식입니다.

## 먼저 확인할 개념

[조합과 생성자 주입](#/learn/java/wiki-composition-injection) · [Spring과 Boot](#/learn/spring/framework-boot)

## 필요한 역할을 생성자로 받는다

먼저 아래 서비스 안에서 `new ConsoleNotifier()`를 찾으려 해 보자. 서비스는 전송 방법을 고르지 않고 `Notifier`를 받는다.

같은 패키지에 아래 타입이 있고, 두 `@Component` 클래스가 탐색되어 등록된 상황을 읽는 예제다.

```java
import org.springframework.stereotype.Component;

interface Notifier { void send(String message); }
@Component
class ConsoleNotifier implements Notifier {
    public void send(String message) { System.out.println(message); }
}
@Component
class NoticeService {
    private final Notifier notifier;
    NoticeService(Notifier notifier) { this.notifier = notifier; }
    void announce() { notifier.send("학습 시작"); }
}
```

DI(의존성 주입)는 필요한 협력 객체를 외부에서 전달받는 것이다. 수동으로 생성자를 호출해도 DI가 가능하다. Spring에서는 컨테이너가 등록 정보를 읽고 객체를 만들며 필요한 의존성을 연결한다. 이렇게 생성과 연결의 제어를 컨테이너에 맡기는 것이 IoC(제어의 역전)의 한 모습이다.

## 등록에서 연결까지

이 예제에서 컨테이너는 `Notifier` 타입의 후보를 찾고 `ConsoleNotifier` 객체를 준비해 `NoticeService`의 생성자로 전달한다. 생성자가 하나인 Spring Bean은 생성자에 `@Autowired`를 쓰지 않아도 그 생성자를 사용한다.

인터페이스는 약속이지 구현 객체가 아니다. 필수 단일 `Notifier` 의존성을 요구하는데 등록된 후보가 없으면 서비스 Bean을 만들 수 없다. Spring이 임의로 인터페이스 구현을 작성하거나 `null`을 넣어 해결하지 않는다.

직접 해볼 일: 예제에서 객체를 **사용하는 자리**와 객체의 **등록을 알려 주는 자리**를 표시한다. 전송 구현만 교체할 때 서비스가 어떤 타입에 의존하는지 설명한다.

## 이어서 연습하기

[Bean을 등록하는 두 방법](#/learn/spring/bean-registration)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [의존성 주입](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [@Autowired와 생성자](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

Spring 컨테이너가 등록 정보를 바탕으로 협력 객체를 준비하고 서비스 생성자에 전달합니다. 서비스는 필요한 역할 타입을 선언하고 받은 객체를 사용합니다. 이 필수 의존성의 후보가 없으면 연결할 수 없으며, 인터페이스만 선언했다고 구현이 자동으로 생기지는 않습니다.
