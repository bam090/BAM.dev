# Bean Validation과 @Valid로 입력 검증하기

## 학습 목표

JSON 변환과 값의 제약 검사를 구별하고 @Valid로 객체 검증이 적용되는 조건을 설명할 수 있습니다.

## 한줄 요약

JSON으로 읽을 수 있는 입력도 별도의 값 제약을 만족해야 합니다.

## 먼저 확인할 개념

[요청 본문 변환](#/learn/spring/request-body)

## 읽을 수 있는 값과 허용하는 값

`{"title":"   "}`는 JSON 형식으로 읽을 수 있지만 공백뿐인 제목을 허용할지는 다른 문제다. **바인딩·변환**은 입력을 Java 값으로 읽는 일이고, **검증**은 그 값이 정한 규칙을 지키는지 확인하는 일이다.

아래는 등록된 컨트롤러 내부의 예제다. Bean Validation 구현과 MVC 검증 설정이 준비되어 있고, 별도의 오류 처리나 `BindingResult` 인수는 없다고 가정한다. `PostMapping`과 `RequestBody`는 Spring 웹 어노테이션이다.

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

record CreateNotice(@NotBlank String title) {}

@PostMapping("/notices")
String create(@Valid @RequestBody CreateNotice input) {
    return input.title();
}
```

DTO의 `@NotBlank`는 제목이 null이나 공백뿐인 값이면 안 된다는 제약이다. `@Valid`는 이 요청 객체의 제약 검사를 적용하도록 한다. Boot의 `spring-boot-starter-validation`은 이런 검증 구현을 준비하는 데 쓰는 묶음이다.

## 선언과 실행 지점을 함께 본다

제약 어노테이션은 규칙 선언이다. DTO에 제약을 적는 것과 실제 요청 처리 중 검증을 적용하는 것은 구분한다. 다른 검증 경로가 없는데 인수의 `@Valid`까지 빠져 있다면, DTO 제약이 있다는 이유만으로 이 MVC 객체 검증이 자동 실행된다고 단정하지 않는다.

위처럼 객체 인수를 검증하고 로컬 오류 처리가 없는 기본 흐름에서 제약 위반은 정상 메서드 처리 대신 400 응답으로 이어진다. 실제 예외 처리 구성을 바꾸면 응답 정책도 달라질 수 있다.

형식·기본 제약을 통과해도 “수정하려는 공지가 존재하는가” 같은 업무 조건은 별도다. 직접 해볼 일: 깨진 JSON, 공백 제목, 존재하지 않는 공지 id를 각각 변환·입력 제약·업무 판단으로 분류한다.

## 이어서 연습하기

[예외를 HTTP 오류로 바꾸기](#/learn/spring/exception-handling)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [MVC 검증의 적용 조건](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)
- [RequestBody 검증과 기본 오류 응답](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [Boot 검증 지원](https://docs.spring.io/spring-boot/reference/io/validation.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

JSON 변환은 입력을 Java 객체로 읽는 일이며 값의 유효성을 모두 보장하지 않습니다. 검증 구현이 준비된 상태에서 DTO의 제약과 요청 인수의 @Valid를 연결해 규칙을 검사합니다. 기본 객체 검증에 실패하면 정상 처리 대신 오류 응답으로 이어지고, 공지 존재 여부 같은 업무 조건은 별도로 판단합니다.
