# 예외를 HTTP 오류로 바꾸기

## 학습 목표

알려진 업무 예외를 상태 코드와 응답 본문으로 바꾸고 공통 오류 처리의 범위를 선택할 수 있습니다.

## 한줄 요약

예외 처리는 실패를 없애는 일이 아니라 호출자가 이해할 HTTP 응답으로 변환하는 일입니다.

## 먼저 확인할 개념

[응답 상태와 본문](#/learn/spring/responses) · [Java 예외](#/learn/java/wiki-exceptions)

## 업무 실패를 응답 정책과 연결한다

서비스에서 공지를 찾지 못하면 “찾지 못함”을 표현할 수 있다. HTTP로 요청한 클라이언트에는 해당 실패를 어떤 상태와 본문으로 알릴지 별도로 정한다.

다음은 공통 예외 처리 예제다. 서비스가 던지는 `NoticeMissingException` 타입이 아래와 같고, advice가 Bean으로 등록되며 다른 처리기와 충돌하지 않는다고 가정한다.

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

class NoticeMissingException extends RuntimeException {}

@RestControllerAdvice
class NoticeErrors {
    @ExceptionHandler(NoticeMissingException.class)
    ResponseEntity<String> notFound() {
        return ResponseEntity.status(404).body("공지를 찾을 수 없습니다.");
    }
}
```

MVC가 해당 예외를 처리할 때 `@ExceptionHandler`로 지정한 메서드가 404 상태와 본문을 만든다. 서비스가 직접 HTTP 응답 객체를 수정해야만 오류를 알릴 수 있는 것은 아니다.

## 공통 처리와 개별 처리

컨트롤러 안의 `@ExceptionHandler`는 그 컨트롤러의 예외 처리에 적용된다. `@ControllerAdvice`에 두면 여러 컨트롤러에 적용할 수 있고, `@RestControllerAdvice`는 그 결과를 본문으로 처리하는 역할도 묶는다. 필요하면 적용 대상을 제한할 수 있다.

모든 예외를 잡아 무조건 200으로 바꾸면 클라이언트가 성공과 실패를 구분하기 어렵다. 알려진 실패의 의미와 상태를 맞추고, 사용자에게 도움이 되는 설명을 제공한다. 내부 스택 추적이나 비밀 설정값을 오류 본문에 그대로 넣는 것도 적절하지 않다.

직접 해볼 일: 두 컨트롤러에서 같은 “공지 없음” 정책을 사용한다면 어디에 한 번 정의할지 고른다. 오류 본문에 성공 메시지를 넣었을 때 생길 혼동도 설명한다.

## 이어서 연습하기

[객체 테스트와 Spring 연결 테스트](#/learn/spring/unit-tests)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [MVC 예외 처리](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
- [Controller Advice의 범위](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

서비스의 알려진 예외를 MVC의 @ExceptionHandler에서 HTTP 상태와 본문으로 변환할 수 있습니다. 여러 컨트롤러에 같은 정책을 적용하려면 ControllerAdvice 계열에 둡니다. 실패의 의미에 맞는 상태와 메시지를 전달해야 하며 모든 예외를 성공 응답으로 바꾸는 것은 올바른 오류 처리가 아닙니다.
