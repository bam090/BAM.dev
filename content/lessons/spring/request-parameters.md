# 경로 변수와 쿼리 파라미터

## 학습 목표

경로 변수와 쿼리 값을 해당 인수에 연결하고 값 누락과 타입 변환 실패를 구분할 수 있습니다.

## 한줄 요약

경로의 자리는 @PathVariable, 쿼리나 폼 파라미터는 @RequestParam으로 받습니다.

## 먼저 확인할 개념

[요청 매핑](#/learn/spring/request-mapping)

## 값이 들어온 위치를 먼저 찾는다

`/notices/7?page=2`에서 `7`은 경로의 일부이고 `2`는 이름이 page인 쿼리 값이다. 두 값을 같은 방식으로 가져오지 않는다.

다음은 등록된 컨트롤러 안에 두는 메서드 부분이다. 필요한 어노테이션은 `org.springframework.web.bind.annotation` 패키지의 것을 사용한다.

```java
@GetMapping("/notices/{id}")
String read(
        @PathVariable("id") long id,
        @RequestParam(name = "page", defaultValue = "1") int page) {
    return id + ":" + page;
}
```

`@PathVariable("id")`는 매핑의 `{id}` 부분을 읽는다. `@RequestParam`은 쿼리 또는 폼 파라미터를 읽는다. 이름을 명시하면 컴파일러가 매개변수 이름을 보존했는지에 기대지 않고 입력 출처를 알 수 있다.

## 누락과 변환 실패를 구분한다

`@RequestParam`은 기본적으로 값을 요구한다. `defaultValue`를 주면 값이 없거나 빈 값일 때 그 기본값을 사용한다. 필요한 경우 `Optional` 같은 타입으로 선택적 입력임을 표현할 수도 있다.

그러나 `page=abc`는 누락이 아니다. 일반적인 `int` 변환으로 읽을 수 없는 값이므로 기본 변환에서는 메서드 인수를 준비하다 실패한다. 자동으로 0이나 기본값 1로 고쳐 주지 않는다. 반대로 `page=-1`은 int로 변환할 수 있지만 페이지 범위로 허용할지는 추가 검증의 문제다.

직접 해볼 일: page가 없는 요청, `page=abc`, `page=-1`을 “기본값”, “변환 실패”, “변환 후 범위 판단”으로 나누어 적는다.

## 이어서 연습하기

[@RequestBody로 JSON 요청 본문 받기](#/learn/spring/request-body)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [경로 변수와 요청 매핑](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
- [@RequestParam](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

경로의 7은 @PathVariable("id")로, 쿼리의 2는 @RequestParam으로 받습니다. 문자열 입력을 선언한 Java 타입으로 변환한 뒤 메서드에 전달합니다. 누락에 대한 기본값과 abc 같은 변환 실패는 다르며, -1처럼 변환 가능한 값의 허용 범위는 별도로 검증해야 합니다.
