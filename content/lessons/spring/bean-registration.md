# Bean을 등록하는 두 방법

## 학습 목표

직접 작성한 클래스와 생성 방법을 제어해야 하는 객체에 맞는 Bean 등록 방법을 선택할 수 있습니다.

## 한줄 요약

탐색할 클래스에는 @Component를, 객체 생성 과정을 설정하려면 @Bean 메서드를 사용합니다.

## 먼저 확인할 개념

[객체 연결과 DI](#/learn/spring/ioc-di)

## 관리할 객체를 등록한다

Spring 컨테이너가 생성·연결·관리하는 객체를 **Bean**이라고 한다. 클래스가 파일로 존재하는 것과 그 객체가 Bean으로 등록되는 것은 다르다.

직접 작성한 클래스에 `@Component`를 붙이고 컴포넌트 탐색 범위에 포함하면 등록 후보로 발견된다. `@Service`와 `@Controller`도 역할을 나타내는 특수한 컴포넌트 어노테이션이다.

외부 라이브러리의 클래스를 고칠 수 없거나 생성 인수를 직접 정해야 하면 설정 클래스의 `@Bean` 메서드를 사용할 수 있다. 아래는 시스템 시계를 Bean으로 제공하는 설정 예제다. `TimeConfig`가 컨테이너에 등록되었다고 가정한다.

```java
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class TimeConfig {
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
```

## 클래스 표시와 생성 경로를 구별한다

컨테이너는 위 메서드의 반환 객체를 Bean으로 관리한다. 다른 Bean을 만드는 데 시계가 필요하면 `@Bean` 메서드의 `Clock` 인수로 받을 수도 있다. 이때 메서드 인수도 컨테이너가 연결한다.

`@Component`가 붙은 클래스라도 일반 코드에서 `new`로 만든 별도 객체가 자동으로 관리되는 것은 아니다. “어느 클래스인가”와 함께 “누가 어떤 등록 경로로 만들었는가”를 확인해야 한다.

직접 해볼 일: 고칠 수 없는 외부 클래스의 생성자에 고정 값을 넘겨 등록해야 한다면 어디에 생성 코드를 둘지 적는다. 이미 등록한 것과 같은 역할을 다른 방식으로 또 등록하면 후보가 늘어날 수 있다는 점도 확인한다.

## 이어서 연습하기

[@Primary와 @Qualifier로 Bean 후보 선택하기](#/learn/spring/bean-selection)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [컴포넌트 탐색과 관리 객체](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)
- [@Bean 등록과 의존성](https://docs.spring.io/spring-framework/reference/core/beans/java/bean-annotation.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

직접 작성한 클래스를 탐색으로 등록할 때는 @Component 계열을 사용합니다. 외부 클래스처럼 어노테이션을 붙일 수 없거나 생성 방법을 정해야 하면 설정의 @Bean 메서드가 객체를 반환하게 합니다. 어느 방식이든 컨테이너에 등록된 객체가 관리 대상이며, 일반 코드에서 직접 new한 별도 객체까지 자동 관리되지는 않습니다.
