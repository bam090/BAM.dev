# Singleton Bean과 요청별 상태

## 학습 목표

Singleton Bean의 공유 범위를 설명하고 요청별 값을 필드에 보관할 때의 위험을 찾을 수 있습니다.

## 한줄 요약

Singleton은 컨테이너의 같은 Bean을 공유하므로 요청별 값을 인스턴스 필드에 섞지 않아야 합니다.

## 먼저 확인할 개념

[Bean 후보 선택](#/learn/spring/bean-selection) · [Java 공유 상태](#/learn/java/wiki-shared-state)

## 같은 Bean의 같은 객체를 공유한다

Spring의 기본 Bean scope는 `singleton`이다. 같은 컨테이너 안에서 같은 Bean 정의로 요청하면 같은 인스턴스를 공유한다. “이 Java 클래스의 객체가 JVM 전체에 하나뿐”이라는 뜻은 아니다. 독립된 두 컨테이너는 각자 같은 클래스의 Bean을 가질 수 있다.

| scope | 객체를 나누는 경계 |
| --- | --- |
| singleton | 컨테이너 안의 Bean 정의마다 공유 인스턴스 |
| prototype | 컨테이너가 해당 Bean을 요청받아 생성할 때마다 새 인스턴스 |
| request | 웹을 인식하는 컨테이너에서 HTTP 요청마다 별도 인스턴스 |

## 요청값이 필드를 덮는 순간

아래는 singleton 서비스의 상태 보관 방식만 드러낸 예제다.

```java
class GreetingService {
    private String currentName;
    void remember(String name) { currentName = name; }
    String greeting() { return "안녕하세요, " + currentName; }
}
```

요청 A가 `remember("밤")`, 요청 B가 `remember("별")`, 다시 A가 `greeting()`을 부르는 순서를 손으로 따라가 보자. 공유 필드에는 마지막에 쓴 값이 남는다.

요청 하나에 필요한 값은 메서드 매개변수와 지역 변수로 전달하는 편이 명확하다. 예를 들어 `greeting(String name)`이 전달받은 이름으로 결과를 만들면 이 요청값을 공유 필드에 저장할 필요가 없다. 다만 지역 변수가 가리키는 **객체 자체**가 공유된 가변 객체라면 별도의 공유 상태 검토가 필요하다.

singleton 등록은 동기화나 스레드 안전을 자동 보장하지 않는다. 무조건 scope를 바꾸기 전에 공유하면 안 되는 값이 어디에 머무는지 먼저 찾는다. 직접 해볼 일: 위 필드를 제거하고 이름을 인수로 받는 메서드 선언을 적는다.

## 이어서 연습하기

[Spring Boot 시작점 읽기](#/learn/spring/boot-start)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Bean scope](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

Singleton 서비스는 같은 컨테이너의 같은 Bean 인스턴스를 공유하므로 요청별 값을 필드에 보관하면 다른 요청의 값으로 바뀔 수 있습니다. 요청값은 인수와 지역 값으로 전달하고 공유 가변 객체가 남는지 확인합니다. Singleton이라는 등록 방식만으로 동시성 안전이 보장되지는 않습니다.
