# 응답과 예외 처리

## 학습 목표

- Controller의 문자열 뷰 이름과 ResponseBody·RestController의 본문 반환을 구분할 수 있습니다.
- ResponseEntity의 HTTP 상태·헤더·본문 역할을 구분할 수 있습니다.
- 알려진 업무 예외를 의미에 맞는 상태와 응답 본문으로 표현할 수 있습니다.
- 개별 ExceptionHandler와 공통 Advice의 적용 범위 및 내부 정보 노출 경계를 설명할 수 있습니다.

## 먼저 확인할 개념

[JSON 요청 본문과 검증](#/learn/spring/request-body) · [Java 예외](#/learn/java/wiki-exceptions)

## 반환값과 HTTP 응답

일반 Controller의 String 반환은 뷰 이름으로 해석할 수 있습니다.
`@ResponseBody`가 적용되면 반환값을 응답 본문으로 처리합니다.
`@RestController`는 Controller와 ResponseBody의 역할을 묶습니다.
문자열을 반환하면 본문 문자열로 처리할 수 있으며 모든 반환값이 무조건 JSON 객체가 되는 것은 아닙니다.
표현 형식은 반환 타입과 준비된 메시지 변환기에 따라 달라집니다.

상태와 헤더 및 본문을 함께 정하려면 `ResponseEntity`를 사용합니다.
다음은 JSON 변환기가 준비된 등록 컨트롤러 안의 메서드 부분입니다.
요청 매핑은 생략했으므로 이 조각만으로 API가 노출되지는 않습니다.

```java
import org.springframework.http.ResponseEntity;

record NoticeView(long id, String title) {}

ResponseEntity<NoticeView> createdNotice() {
    NoticeView view = new NoticeView(7L, "이번 주 안내");
    return ResponseEntity.status(201).body(view);
}
```

201은 HTTP 상태이고 NoticeView는 본문 데이터입니다.
본문 안에 `"status": 201` 필드를 넣는 것만으로 실제 HTTP 상태가 바뀌지는 않습니다.

---

## 업무 예외와 공통 처리 범위

서비스가 공지 없음이라는 실패를 표현해도 HTTP로 알릴 상태와 본문은 별도로 정합니다.
다음은 예외 타입과 공통 처리의 읽기 예제입니다.
Advice가 Bean으로 등록되고 다른 처리기와 충돌하지 않는다고 가정합니다.

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

MVC는 해당 예외에 지정한 처리기로 상태 404와 본문을 만듭니다.
서비스가 직접 HTTP 응답 객체를 수정해야만 실패를 알릴 수 있는 것은 아닙니다.
컨트롤러 안의 ExceptionHandler는 해당 컨트롤러의 예외를 처리합니다.
ControllerAdvice는 여러 컨트롤러에 공통 정책을 적용하며 적용 대상을 제한할 수도 있습니다.
RestControllerAdvice는 처리 결과를 본문으로 쓰는 역할도 묶습니다.

## 성공·실패 응답의 관찰

`업무 결과 → 정상 반환 또는 예외 → 응답 처리 → 상태와 본문`으로 따라갑니다.
직접 해볼 일은 생성 성공의 201과 공지 없음의 404를 본문 내용과 따로 표시하는 것입니다.
두 컨트롤러가 같은 공지 없음 정책을 쓸 때 어느 위치에 한 번 정의할지 설명합니다.
모든 예외를 200으로 바꾸면 호출자가 성공과 실패를 구분하기 어렵습니다.
내부 스택 추적과 비밀 설정값은 오류 본문에 그대로 노출하지 않습니다.

## 정리

- 반환값의 본문 처리와 HTTP 상태 설정을 구분합니다.
- 알려진 업무 예외는 의미에 맞는 상태와 본문으로 변환합니다.
- 공통 정책은 Advice에 두고 실패를 성공으로 감추거나 내부 정보를 노출하지 않습니다.

## 이어서 연습하기

[객체·컨텍스트·MVC 테스트](#/learn/spring/unit-tests)에서 응답 검사가 실제로 거치는 경로를 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [ResponseBody와 RestController](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)
- [ResponseEntity](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html)
- [MVC 예외 처리와 Advice](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 HTTP 응답을 실행한 결과는 아닙니다.

## 핵심 질문 답

ResponseBody가 적용된 반환값은 본문으로 처리하고 ResponseEntity는 상태와 헤더도 표현합니다.
본문의 status 필드는 실제 HTTP 상태를 대신하지 않습니다.
알려진 업무 예외는 ExceptionHandler에서 실패의 의미에 맞는 상태와 본문으로 바꿀 수 있습니다.
공통 정책은 Advice에 두고 모든 실패를 성공 상태로 바꾸거나 내부 정보를 노출하지 않습니다.
