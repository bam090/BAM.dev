# @Primary와 @Qualifier로 Bean 후보 선택하기

## 학습 목표

단일 의존성의 타입 후보를 @Qualifier 또는 @Primary 조건으로 좁힐 수 있습니다.

## 한줄 요약

같은 타입의 Bean이 여러 개면 그중 무엇을 원하는지 선택 조건을 확인합니다.

## 먼저 확인할 개념

[Bean 등록](#/learn/spring/bean-registration)

## 타입을 찾은 뒤 후보를 좁힌다

메일 전송기와 미리보기 전송기가 모두 `Notifier`를 구현한다고 생각해 보자. `Notifier` 하나를 받는 생성자에 어느 객체를 넣어야 할까?

아래는 생성자 부분 예제다. `NoticeService`는 등록된 Bean이고, `Notifier` 후보는 `mail` qualifier가 붙은 Bean 하나와 `preview` qualifier가 붙은 Bean 하나뿐이라고 가정한다.

```java
import org.springframework.beans.factory.annotation.Qualifier;

class NoticeService {
    private final Notifier notifier;
    NoticeService(@Qualifier("preview") Notifier notifier) {
        this.notifier = notifier;
    }
}
```

`@Qualifier`는 타입에 맞는 후보 중 지정한 특성을 가진 후보로 범위를 좁힌다. 위 생성자는 `preview` 후보를 요구한다. 타입과 무관한 아무 객체를 이름만 보고 넣는 기능은 아니다.

## 기본 선택과 명시적 선택

`@Primary`는 여러 후보 중 **하나의 값을 주입하는 자리**에서 기본적으로 우선할 Bean을 표시한다. qualifier 같은 다른 제한이 없고 타입 후보 중 primary가 정확히 하나면 그 후보가 선택된다. 다른 Bean을 삭제하거나 등록을 취소하는 기능은 아니다.

타입 후보가 둘인데 구별할 조건이 없으면 모호성으로 연결에 실패할 수 있다. 소스 파일 순서나 “먼저 눈에 보이는 클래스”를 선택 규칙으로 삼지 않는다. 실제 시스템에는 이름 등 다른 선택 규칙도 있으므로 문제에서는 필요한 조건을 명시한다.

직접 해볼 일: 기본 전송은 메일이지만 특정 서비스만 미리보기를 써야 한다면, 전체 기본 선택과 해당 생성자의 선택을 각각 어디에 표시할지 설명한다.

## 이어서 연습하기

[Singleton Bean과 요청별 상태](#/learn/spring/singleton-state)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Qualifier의 후보 제한](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html)
- [@Primary 우선 선택](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-primary.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

컨테이너는 먼저 필요한 타입의 후보를 찾습니다. 특정 용도의 후보가 필요하면 주입 지점의 @Qualifier로 범위를 좁힙니다. 추가 제한이 없는 단일 의존성에서는 타입 후보 중 정확히 하나의 @Primary가 기본 선택이 됩니다. @Primary는 나머지 Bean을 없애지 않습니다.
