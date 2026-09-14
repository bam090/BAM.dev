# Profile로 환경별 구성 고르기

## 학습 목표

활성 profile에 따라 적용되는 설정 파일과 Bean의 포함 조건을 판정할 수 있습니다.

## 한줄 요약

Profile은 특정 환경에서 사용할 설정과 Bean을 선택하는 조건입니다.

## 먼저 확인할 개념

[외부 설정](#/learn/spring/external-config)

## 활성 환경에 맞는 구성을 고른다

개발할 때는 작은 페이지, 다른 환경에서는 큰 페이지를 쓰고 싶다고 하자. 코드의 같은 설정 키를 유지하면서 환경별 값을 나눌 수 있다.

```properties
# application.properties
study.page-size=10
```

```properties
# application-local.properties
study.page-size=5
```

여기에 `--spring.profiles.active=local`로 `local`을 활성화하고 다른 덮어쓰기 설정은 없다고 가정한다. 기본 설정에 이어 활성 profile의 설정이 적용되므로 `study.page-size`에는 local의 값이 반영된다. 파일이 존재하는 것만으로 해당 profile이 활성화되지는 않는다.

## Bean에도 환경 조건을 붙인다

아래 클래스는 컴포넌트 탐색 범위에 포함된 설정 클래스 예제다.

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration(proxyBeanMethods = false)
@Profile("local")
class LocalConfig {}
```

`@Profile("local")`은 local이 활성인 경우에 이 구성을 포함한다. 단순한 디렉터리 이름이나 배포 서버의 이름을 보고 자동 판단하는 것이 아니다. 실제 활성 profile과 구성 조건을 확인한다.

`application-local.properties` 안에서 local을 켜려고 하기보다, profile을 선택하는 `spring.profiles.active`는 기본 설정이나 실행 인수 등 profile 전용이 아닌 위치에 둔다. Profile은 설정 선택 기능이며 파일 내용을 암호화하는 기능은 아니다.

직접 해볼 일: 위 예제에서 local을 비활성화하고 다른 profile도 쓰지 않는다면 어떤 파일의 페이지 값이 남는지 설명한다. `@Profile("production")` 설정이 local만 활성일 때 포함되는지도 판단한다.

## 이어서 연습하기

[Spring MVC와 DispatcherServlet의 요청 처리](#/learn/spring/mvc-flow)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Profile의 활성화와 Bean 조건](https://docs.spring.io/spring-boot/reference/features/profiles.html)
- [Profile별 설정 파일](https://docs.spring.io/spring-boot/reference/features/external-config.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

local 전용 설정은 local profile이 활성화되었을 때 적용됩니다. 파일이 존재하는 것과 활성화는 다릅니다. 같은 방식으로 @Profile이 붙은 Bean이나 설정은 활성 profile 조건을 만족해야 포함됩니다. 활성 상태와 설정 출처를 함께 확인해야 최종 구성을 설명할 수 있습니다.
