# 외부 설정과 @ConfigurationProperties

## 학습 목표

같은 설정 키의 출처 우선순위를 적용하고 접두사별 값을 타입에 묶는 방법을 설명할 수 있습니다.

## 한줄 요약

외부 설정은 같은 코드를 다른 값으로 사용할 수 있게 하며 여러 출처의 우선순위가 적용됩니다.

## 먼저 확인할 개념

[Boot 시작점](#/learn/spring/boot-start)

## 코드 대신 설정값을 바꾼다

학습 페이지의 크기를 바꿀 때마다 Java 소스를 고칠 필요는 없다. Boot는 `application.properties`, YAML, 환경 변수, 명령줄 등에서 설정값을 읽을 수 있다.

다음은 파일 내용과 실행 인수의 **정적 비교**다. 두 출처 외의 덮어쓰기는 없고 명령줄 설정 처리는 기본대로 활성화되었다고 가정한다.

```properties
# application.properties
study.page-size=10
```

```text
명령줄 인수: --study.page-size=20
```

Boot의 기본 우선순위에서 명령줄 설정은 파일의 같은 키보다 우선한다. 값을 조사할 때는 파일 한 곳만 보지 말고 어떤 출처가 같은 키를 제공하는지 확인한다.

## 관련 설정을 한 타입으로 묶는다

`@Value`로 개별 값을 받거나 `Environment`에서 읽을 수 있다. 관련 값이 여럿이면 `@ConfigurationProperties`로 접두사 아래 값을 한 타입에 묶는다. 아래 `record`는 두 값을 함께 보관하는 Java 데이터 타입이다.

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "study")
public record StudyProperties(int pageSize, String title) {}
```

이 어노테이션을 썼다는 사실만으로 등록이 끝났다고 생각하지 않는다. 예를 들어 등록된 설정 클래스의 `@EnableConfigurationProperties(StudyProperties.class)`로 해당 타입을 활성화하거나 `@ConfigurationPropertiesScan`을 사용해야 한다. 생성자 바인딩은 이런 설정 속성 등록 방식을 전제로 한다.

직접 해볼 일: `study.title`과 `study.page-size` 중 `pageSize`에 대응하는 키를 적고, 같은 키를 실행 인수로 바꿀 때 Java 클래스가 바뀌는지 설명한다.

## 이어서 연습하기

[Profile로 환경별 구성 고르기](#/learn/spring/profiles)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [외부 설정과 설정 속성 등록](https://docs.spring.io/spring-boot/reference/features/external-config.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

외부 설정을 사용하면 Java 코드를 바꾸지 않고 실행 환경의 값을 전달할 수 있습니다. 같은 키가 여러 출처에 있으면 우선순위를 적용하며, 기본 명령줄 설정은 파일보다 우선합니다. 관련 값은 @ConfigurationProperties로 묶을 수 있지만 해당 타입의 등록과 바인딩도 활성화해야 합니다.
