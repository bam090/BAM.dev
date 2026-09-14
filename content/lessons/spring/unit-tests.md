# 객체 테스트와 Spring 연결 테스트

## 학습 목표

직접 생성한 객체 테스트가 확인하는 행동과 Spring 컨텍스트를 거쳐야 확인할 구성을 구별할 수 있습니다.

## 한줄 요약

new로 만든 객체의 행동 테스트와 컨테이너의 등록·주입 테스트는 서로 다른 근거를 제공합니다.

## 먼저 확인할 개념

[객체 연결과 DI](#/learn/spring/ioc-di) · [Java 테스트 도구](#/learn/java/wiki-test-tools)

## 검사 대상이 지나가는 경로를 본다

DI를 사용하면 Spring 없이도 객체를 만들고 협력자를 전달해 행동을 확인할 수 있다. 아래는 테스트할 객체의 예제이며 Spring 컨텍스트는 만들지 않는다.

```java
interface PrefixSource { String prefix(); }
class TitleService {
    private final PrefixSource source;
    TitleService(PrefixSource source) { this.source = source; }
    String title(String name) { return source.prefix() + name; }
}

// 테스트에서 준비할 입력과 객체
// TitleService service = new TitleService(() -> "학습: ");
// 비교할 호출: service.title("Spring")
```

이런 객체 테스트는 전달한 협력자와 메서드의 실제 행동을 확인하는 데 적합하다. 컨테이너나 외부 서버를 준비할 필요가 없는 작은 검사부터 시작할 수 있다.

## 객체 행동과 구성 연결을 구분한다

위 테스트가 통과하더라도 `TitleService`의 컴포넌트 탐색, Bean 등록, qualifier 선택이나 profile 구성을 확인한 것은 아니다. `new`로 객체를 만들며 컨테이너의 선택 과정을 우회했기 때문이다.

등록한 Bean들이 실제 설정 아래에서 연결되는지가 목적이면 Spring 컨텍스트를 불러 그 연결을 확인해야 한다. Boot 설정과 자동구성을 포함한 컨텍스트가 필요할 때는 `@SpringBootTest` 같은 지원을 선택할 수 있다. 단지 메서드의 문자열 계산만 검사하려는데 매번 전체 앱을 불러야 하는 것은 아니다.

직접 해볼 일: “제목 문자열을 합친다”와 “local profile에서 올바른 전송기가 주입된다” 중 컨텍스트의 판단을 꼭 거쳐야 하는 검사를 고른다. 객체의 계산은 실제로 유지하고 검사 범위 밖 협력만 대역으로 나누는 기존 Java 테스트 원칙도 적용한다.

## 이어서 연습하기

[MockMvc로 확인하는 MVC 테스트 범위](#/learn/spring/mvc-tests)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Spring 객체의 단위 테스트](https://docs.spring.io/spring-framework/reference/testing/unit.html)
- [Boot 애플리케이션 컨텍스트 테스트](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

new로 만든 서비스 테스트는 전달한 협력자와 객체 행동을 확인합니다. 컴포넌트 탐색이나 qualifier, profile에 따른 Bean 연결은 우회하므로 그 구성이 맞다는 근거가 되지 않습니다. 구성 연결이 검사 대상이면 필요한 Spring 컨텍스트를 불러 확인하고, 순수한 객체 행동은 작은 테스트로 검사할 수 있습니다.
