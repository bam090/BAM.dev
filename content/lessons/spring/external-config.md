# 외부 설정과 Profile

## 학습 목표

- 같은 설정 키의 출처 우선순위를 적용해 최종 값을 판정할 수 있습니다.
- ConfigurationProperties의 접두사 바인딩과 타입 등록 조건을 설명할 수 있습니다.
- 활성 profile에 따라 적용되는 설정 파일을 판정할 수 있습니다.
- Profile의 Bean 포함 조건과 설정값 보호의 책임을 구분할 수 있습니다.

## 먼저 확인할 개념

[Boot 시작점과 컴포넌트 탐색](#/learn/spring/boot-start)

## 설정 출처와 환경별 파일

외부 설정은 Java 소스를 바꾸지 않고 실행 환경의 값을 전달하는 방법입니다.
Boot는 properties와 YAML 파일 및 환경 변수와 명령줄 등에서 값을 읽습니다.
다음은 실행 결과가 아닌 파일과 인수의 정적 비교입니다.

```properties
# application.properties
study.page-size=10
study.title=Spring
```

```properties
# application-local.properties
study.page-size=5
```

`--spring.profiles.active=local`로 local을 활성화하고 다른 덮어쓰기가 없다면 profile 전용 파일의 5가 적용됩니다.
파일이 존재하는 것만으로 profile이 활성화되지는 않습니다.
여기에 `--study.page-size=20`도 전달하면 기본 명령줄 설정 처리가 활성화된 조건에서 20이 파일 값보다 우선합니다.
값을 조사할 때는 활성 profile과 같은 키를 제공하는 출처를 함께 봅니다.

---

## ConfigurationProperties의 등록과 바인딩

개별 값은 `@Value`나 `Environment`로 읽을 수 있습니다.
관련 값은 접두사 아래를 `@ConfigurationProperties` 타입으로 묶습니다.
아래는 설정 속성 선언이며 파일 이름은 `StudyProperties.java`입니다.

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "study")
public record StudyProperties(int pageSize, String title) {}
```

`study.page-size`는 `pageSize`에 대응합니다.
어노테이션 선언에 더해 해당 타입의 등록이 필요합니다.
등록된 설정에서 `@EnableConfigurationProperties(StudyProperties.class)`를 사용하거나 `@ConfigurationPropertiesScan`으로 발견하도록 준비합니다.
생성자 바인딩도 이런 설정 속성 등록 방식을 전제로 합니다.

---

## Profile별 Bean 조건

다음 설정 클래스가 컴포넌트 탐색 범위 안에 있다고 가정합니다.

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration(proxyBeanMethods = false)
@Profile("local")
class LocalConfig {}
```

`@Profile("local")`은 local이 활성일 때 이 구성을 포함합니다.
서버 이름이나 디렉터리 이름만 보고 활성 상태를 결정하지 않습니다.
`spring.profiles.active`는 기본 설정이나 실행 인수처럼 profile 전용이 아닌 위치에 둡니다.
Profile은 선택 조건이며 설정 파일의 비밀값을 암호화하지 않습니다.
비밀값을 소스나 로그에 그대로 남기지 않습니다.

## 설정 선택 흐름의 관찰

`profile 활성화 → 대상 파일 선택 → 출처 우선순위 적용 → 타입 바인딩과 Bean 조건 판단`을 따라갑니다.
직접 해볼 일은 local만 활성이고 페이지 크기 인수도 있는 상황에서 최종 값과 `@Profile("production")` 구성의 포함 여부를 따로 적는 것입니다.
페이지 크기만 바꿀 때 Java 타입이 바뀌어야 하는지도 설명합니다.

## 정리

- 같은 키의 여러 설정 출처에는 우선순위를 적용합니다.
- ConfigurationProperties는 접두사 아래 값을 묶으며 별도의 타입 등록이 필요합니다.
- 활성 Profile이 전용 파일과 Bean을 선택하지만 비밀값을 보호하지는 않습니다.

## 이어서 연습하기

[Spring MVC 요청 흐름](#/learn/spring/mvc-flow)에서 준비된 객체들이 HTTP 요청을 처리하는 경로를 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [외부 설정과 설정 속성 등록](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Profile 활성화와 Bean 조건](https://docs.spring.io/spring-boot/reference/features/profiles.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
설정 바인딩과 앱 실행을 수행한 결과는 아닙니다.

## 핵심 질문 답

활성 profile이 사용할 파일과 Bean 조건을 정하고 같은 키의 여러 출처에는 우선순위를 적용합니다.
기본 명령줄 설정은 파일보다 우선하므로 파일 한 곳만 보고 최종 값을 판단하지 않습니다.
관련 값은 ConfigurationProperties로 묶되 등록과 바인딩을 준비해야 합니다.
Profile 전용 파일의 존재만으로 활성화되지 않으며 Profile은 비밀값 보호 기능도 아닙니다.
