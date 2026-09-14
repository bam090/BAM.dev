# 경로와 HTTP 메서드 매핑

## 학습 목표

클래스와 메서드의 경로를 결합하고 HTTP 메서드 조건까지 적용해 요청 대상을 판정할 수 있습니다.

## 한줄 요약

요청 매핑은 URL 경로뿐 아니라 GET·POST 같은 HTTP 메서드도 함께 비교합니다.

## 먼저 확인할 개념

[MVC 요청 흐름](#/learn/spring/mvc-flow)

## 경로와 메서드를 함께 비교한다

다음은 등록된 컨트롤러의 정적 예제다. `RequestMapping`은 공통 경로, `GetMapping`과 `PostMapping`은 메서드별 조건을 표현한다.

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notices")
class NoticeController {
    @GetMapping("/latest")
    String readLatest() { return "최근 공지"; }

    @PostMapping("/latest")
    String replaceLatest() { return "변경 요청"; }
}
```

두 메서드의 최종 경로는 `/notices/latest`로 같다. 그러나 GET과 POST 조건이 다르므로 요청 메서드에 따라 다른 대상이 된다. Java 메서드 이름을 URL처럼 비교하지 않는다.

## 요청을 좁히는 조건

클래스 수준의 공통 경로에 메서드 경로를 결합하고, HTTP 메서드를 비교한다. 실제 매핑에는 요청 파라미터·헤더·미디어 타입 조건도 사용할 수 있다. `/notices/{id}`처럼 경로 일부를 변수로 받을 수도 있으며 다음 문서에서 다룬다.

같은 메서드에 `@GetMapping`과 `@PostMapping`을 겹쳐 붙여 두 요청을 허용하려 하지 않는다. 여러 HTTP 메서드가 필요한 이유가 있다면 `@RequestMapping`의 method 조건을 명시한다.

직접 해볼 일: `GET /notices/latest`와 `POST /notices/latest`가 각각 어느 메서드를 대상으로 하는지 적는다. 조회 메서드만 남겨 둔 상황에서 POST를 보내면, 경로가 같다는 이유만으로 조회 메서드를 호출할 수 있는지도 설명한다.

## 이어서 연습하기

[경로 변수와 쿼리 파라미터](#/learn/spring/request-parameters)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [요청 매핑](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

같은 URL이어도 GET과 POST 매핑은 서로 다른 조건입니다. 클래스의 공통 경로와 메서드 경로를 결합한 뒤 HTTP 메서드까지 만족하는 대상을 찾습니다. 경로만 같거나 Java 메서드 이름이 비슷하다는 이유로 호출되지 않습니다.
