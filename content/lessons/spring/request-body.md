# @RequestBody로 JSON 요청 본문 받기

## 학습 목표

JSON 본문을 @RequestBody로 받는 흐름과 Content-Type 조건의 역할을 설명할 수 있습니다.

## 한줄 요약

@RequestBody는 메시지 변환기를 통해 HTTP 본문을 지정한 Java 타입으로 읽습니다.

## 먼저 확인할 개념

[경로와 쿼리 입력](#/learn/spring/request-parameters) · [Java 객체](#/learn/java/wiki-objects)

## 본문과 입력 형식을 함께 읽는다

쿼리 값과 달리 JSON은 HTTP 요청의 본문에 담아 보낼 수 있다. `Content-Type`은 보낸 본문의 형식을 나타낸다. 아래 요청의 본문은 제목 한 개를 담는 JSON이다.

```http
POST /notices
Content-Type: application/json

{"title":"이번 주 안내"}
```

다음은 컨트롤러 안의 타입·메서드 부분 예제다. 이 DTO를 읽을 JSON 메시지 변환기가 준비되어 있고, 어노테이션은 `org.springframework.web.bind.annotation` 패키지의 것을 사용한다고 가정한다. record는 전달할 값을 묶는 Java 데이터 타입이다.

```java
record CreateNotice(String title) {}

@PostMapping(path = "/notices", consumes = "application/json")
String create(@RequestBody CreateNotice input) {
    return input.title();
}
```

`@RequestBody`는 메시지 변환기를 통해 본문을 읽고 `CreateNotice` 인수를 준비한다. `@RequestParam`으로 JSON 객체의 필드를 자동 추출하는 흐름과 혼동하지 않는다.

## 형식 조건과 내용 검증

`consumes`는 요청의 `Content-Type`을 기준으로 받을 형식을 제한한다. 위 매핑에 `Content-Type: text/plain`으로 보내면 본문 글자가 JSON처럼 생겼더라도 선언한 형식 조건과 맞지 않는다.

`Accept`는 클라이언트가 받을 수 있는 **응답** 형식을 알리는 헤더다. 이를 요청 본문의 형식인 `Content-Type`과 구별한다. 응답 매핑의 `produces`는 응답 형식 조건에 관여한다.

JSON을 객체로 읽을 수 있다고 해서 제목이 비어도 된다는 뜻은 아니다. 형식 변환 뒤의 내용 검증은 별도다. 직접 해볼 일: 요청에서 메서드, 경로, 본문 형식, 전달값을 각각 표시한다.

## 이어서 연습하기

[응답 본문과 상태 코드](#/learn/spring/responses)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [@RequestBody와 메시지 변환](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [요청·응답 미디어 타입 조건](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

@RequestBody는 준비된 메시지 변환기를 통해 HTTP 본문을 지정한 Java 타입으로 읽습니다. JSON 본문에는 그에 맞는 Content-Type과 변환 지원이 필요합니다. consumes는 요청 형식 조건이고, 객체로 변환되었다는 사실만으로 제목 같은 값의 제약까지 만족한 것은 아닙니다.
