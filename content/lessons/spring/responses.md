# 응답 본문과 상태 코드

## 학습 목표

반환값을 본문으로 처리하는 방식과 ResponseEntity의 상태·헤더·본문 역할을 구분할 수 있습니다.

## 한줄 요약

@RestController는 반환값을 응답 본문으로 연결하고 ResponseEntity는 상태와 헤더도 지정합니다.

## 먼저 확인할 개념

[JSON 요청 본문](#/learn/spring/request-body)

## 반환값을 어떻게 해석할지 정한다

Java 메서드가 문자열을 반환해도 MVC의 처리 방식에 따라 의미가 달라진다. 일반적인 `@Controller`의 String 반환은 뷰 이름으로 해석할 수 있다. `@ResponseBody`가 적용되면 반환값을 응답 본문으로 쓴다.

`@RestController`는 `@Controller`와 `@ResponseBody`를 묶은 어노테이션이다. 해당 컨트롤러 메서드가 `"hello"`를 반환하면 뷰를 찾을 이름이 아니라 본문 데이터로 처리한다. 반환 타입과 준비된 메시지 변환기에 따라 문자열이나 JSON 같은 표현으로 응답한다. 모든 반환값이 무조건 JSON 객체가 되는 것은 아니다.

## 상태와 본문을 따로 지정한다

아래는 생성 응답을 표현하는 메서드 부분 예제다. JSON을 쓸 수 있는 변환기가 있고 해당 메서드는 등록된 컨트롤러에 있다고 가정한다.

```java
record NoticeView(long id, String title) {}

ResponseEntity<NoticeView> createdNotice() {
    NoticeView view = new NoticeView(7L, "이번 주 안내");
    return ResponseEntity.status(201).body(view);
}
```

`ResponseEntity`는 `org.springframework.http.ResponseEntity` 타입이며 상태 코드·헤더·본문을 함께 표현한다. 예제의 201은 HTTP 상태 코드, `NoticeView`는 본문 데이터다. 이 부분 예제에는 요청 매핑이 없으므로 이것만으로 API가 노출되는 것은 아니다.

JSON에 `"status": 201`이라는 필드를 넣는 것과 실제 HTTP 상태를 201로 설정하는 것은 다르다. 본문 속 필드 이름만으로 HTTP 상태가 바뀌지는 않는다.

직접 해볼 일: “문자열 본문만 반환”, “생성 상태 201과 객체 본문 반환” 중 두 번째 요구에서 추가로 표현해야 할 정보를 적는다.

## 이어서 연습하기

[Bean Validation과 @Valid로 입력 검증하기](#/learn/spring/validation)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [@ResponseBody와 RestController](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)
- [ResponseEntity](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

@ResponseBody가 적용된 반환값은 응답 본문으로 처리되며 @RestController에는 그 역할이 포함됩니다. 일반 Controller의 문자열 뷰 이름과 구별해야 합니다. 상태 코드와 헤더까지 정하려면 ResponseEntity로 표현할 수 있고, 본문 안에 status라는 필드를 넣는 것만으로 HTTP 상태가 바뀌지는 않습니다.
