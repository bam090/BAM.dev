# JSON 요청 본문과 검증

## 학습 목표

- RequestBody가 메시지 변환기로 JSON 본문을 Java 타입으로 읽는 흐름을 설명할 수 있습니다.
- Content-Type과 consumes의 요청 형식 조건을 Accept와 produces의 응답 형식 조건과 구분할 수 있습니다.
- DTO 제약과 Valid 및 검증 구현을 연결해 객체 검증의 적용 조건을 설명할 수 있습니다.
- 본문 변환 실패와 값 제약 위반 및 업무 조건 실패를 구분할 수 있습니다.

## 먼저 확인할 개념

[요청 매핑과 경로·쿼리 입력](#/learn/spring/request-mapping) · [Java 객체](#/learn/java/wiki-objects)

## 본문 형식과 Java 값 변환

JSON은 HTTP 요청의 본문에 담아 보낼 수 있습니다.
`Content-Type`은 보내는 본문의 형식이고 `Accept`는 클라이언트가 받을 수 있는 응답 형식입니다.
먼저 아래 요청의 메서드와 경로 및 본문 형식을 찾습니다.

```http
POST /notices
Content-Type: application/json

{"title":"이번 주 안내"}
```

다음은 등록된 컨트롤러 내부의 타입과 메서드입니다.
JSON 메시지 변환기와 Bean Validation 구현 및 MVC 검증 설정이 준비되어 있습니다.
로컬 오류 처리와 BindingResult 인수는 없다고 가정합니다.

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

record CreateNotice(@NotBlank String title) {}

@PostMapping(path = "/notices", consumes = "application/json")
String create(@Valid @RequestBody CreateNotice input) {
    return input.title();
}
```

`@RequestBody`는 메시지 변환기를 통해 본문을 `CreateNotice`로 읽습니다.
`consumes`는 요청 Content-Type에 맞춰 받을 형식을 제한합니다.
본문이 JSON처럼 보여도 `text/plain`으로 보내면 이 매핑의 형식 조건과 맞지 않습니다.
`produces`는 응답 형식 조건에 관여하므로 consumes와 구분합니다.

---

## 변환 이후의 값 검증

`{"title":"   "}`는 유효한 JSON이지만 공백뿐인 제목을 허용한다는 뜻은 아닙니다.
바인딩과 변환은 입력을 Java 값으로 읽는 일이고 검증은 그 값의 규칙을 확인하는 일입니다.
`@NotBlank`는 null이나 공백뿐인 제목을 금지하는 제약입니다.
`@Valid`는 요청 객체의 제약 검사를 적용하도록 합니다.
Boot의 `spring-boot-starter-validation`은 검증 구현을 준비하는 데 사용합니다.

제약 선언과 실제 검증 경로를 함께 확인합니다.
다른 검증 경로가 없고 이 인수의 Valid도 없다면 DTO 제약만으로 객체 검증이 자동 실행된다고 단정하지 않습니다.
위 전제의 기본 객체 검증에서 제약을 어기면 정상 메서드 호출 대신 400 응답으로 이어집니다.
실제 오류 처리 구성에 따라 응답 정책은 달라질 수 있습니다.

## 변환·제약·업무 조건의 관찰

`형식 조건 → 본문 변환 → 객체 제약 검사 → 업무 처리`를 따라갑니다.
직접 해볼 일은 깨진 JSON과 공백 제목 및 존재하지 않는 공지 id를 각 판단 단계에 연결하는 것입니다.
유효 JSON을 객체로 읽은 상황에서도 어떤 제약에서 멈출 수 있는지 설명합니다.
입력 제약을 통과해도 공지 존재 여부 같은 업무 조건은 별도로 확인합니다.

## 정리

- RequestBody는 요청 본문을 메시지 변환기로 Java 값으로 읽습니다.
- 유효한 JSON이어도 값 제약은 Valid와 검증 구현을 통해 따로 확인합니다.
- 입력 제약을 통과해도 공지 존재 여부 같은 업무 조건은 별도로 판단합니다.

## 이어서 연습하기

[응답과 예외 처리](#/learn/spring/responses)에서 정상 결과와 업무 실패의 응답을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [RequestBody의 변환과 검증](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [요청·응답 미디어 타입 조건](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
- [MVC 검증 조건](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 변환·검증 요청을 실행한 결과는 아닙니다.

## 핵심 질문 답

RequestBody는 준비된 변환기로 본문을 Java 객체로 읽고 consumes는 요청 형식을 제한합니다.
읽을 수 있는 JSON이어도 값 제약을 만족했는지는 별도입니다.
검증 구현을 준비한 뒤 DTO 제약과 Valid를 연결해 객체를 검사합니다.
이 제약을 통과해도 공지 존재 여부 같은 업무 조건은 따로 판단하며 실패 응답은 실제 처리 구성으로 확인합니다.
