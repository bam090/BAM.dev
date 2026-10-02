# 요청 매핑과 경로·쿼리 입력

## 학습 목표

- 클래스와 메서드 경로를 결합하고 HTTP 메서드까지 비교해 요청 대상을 판정할 수 있습니다.
- 경로 변수와 쿼리·폼 값을 해당 메서드 인수에 연결할 수 있습니다.
- 필수 파라미터 누락과 defaultValue 적용 조건을 구분할 수 있습니다.
- 매핑 실패와 타입 변환 실패 및 변환 후 범위 판단을 구분할 수 있습니다.

## 먼저 확인할 개념

[Spring MVC 요청 흐름](#/learn/spring/mvc-flow)

## 경로와 HTTP 메서드의 매핑

`@RequestMapping`은 요청 조건과 컨트롤러 메서드를 연결합니다.
다음은 등록된 컨트롤러의 정적 읽기 예제입니다.

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notices")
class NoticeController {
    @GetMapping("/{id}")
    String read(
            @PathVariable("id") long id,
            @RequestParam(name = "page", defaultValue = "1") int page) {
        return id + ":" + page;
    }

    @PostMapping("/{id}")
    String revise(@PathVariable("id") long id) {
        return "변경 요청: " + id;
    }
}
```

클래스 경로와 메서드 경로를 결합하면 두 메서드의 경로 형태는 `/notices/{id}`로 같습니다.
GET과 POST 조건이 다르므로 같은 URL에서도 요청 메서드에 따라 대상이 달라집니다.
Java 메서드 이름을 URL처럼 비교하지 않습니다.
실제 매핑에는 파라미터와 헤더 및 미디어 타입 조건도 사용할 수 있습니다.
같은 메서드에 `@GetMapping`과 `@PostMapping`을 겹쳐 붙이지 않습니다.
여러 HTTP 메서드가 필요하면 `@RequestMapping`의 method 조건으로 표현합니다.

---

## 입력 위치와 인수 변환

`GET /notices/7?page=2`에서 7은 경로의 일부이고 2는 이름이 page인 쿼리 값입니다.
`@PathVariable("id")`는 `{id}`를 읽습니다.
`@RequestParam`은 쿼리나 폼 파라미터를 읽으며 JSON 본문의 필드를 자동 추출하는 기능이 아닙니다.
이름을 명시하면 컴파일러의 매개변수 이름 보존 여부에 기대지 않고 입력 출처를 알 수 있습니다.

| page 입력 | 기본 변환에서 읽을 판단 |
| --- | --- |
| 누락 또는 빈 값 | 예제의 defaultValue인 1을 사용합니다. |
| `abc` | int 변환에 실패하므로 인수를 준비하지 못합니다. |
| `-1` | int 변환은 가능하며 허용 범위는 별도 검증 대상입니다. |

`@RequestParam`은 기본적으로 값을 요구합니다.
defaultValue나 선택적 타입 등의 설정이 없는 필수 파라미터가 누락되면 입력 준비에 실패할 수 있습니다.
`abc`를 누락으로 보고 1이나 0으로 고쳐 주지는 않습니다.

## 매핑과 값 준비의 관찰

`요청 조건 비교 → 대상 메서드 선택 → 입력 위치 확인 → 타입 변환 → 호출` 순서로 따라갑니다.
직접 해볼 일은 GET과 POST에 같은 URL을 대입해 대상 메서드를 찾고 page의 세 입력을 표와 연결하는 것입니다.
GET 매핑만 남았을 때 POST를 보내는 매핑 실패와 GET의 `page=abc` 변환 실패가 어느 단계에서 다른지 설명합니다.

## 정리

- 경로와 HTTP 메서드를 함께 비교해 요청 처리 대상을 고릅니다.
- PathVariable과 RequestParam은 서로 다른 입력 위치를 읽습니다.
- 누락과 변환 실패 및 변환 후 범위 판단은 서로 다른 조건입니다.

## 이어서 연습하기

[JSON 요청 본문과 검증](#/learn/spring/request-body)에서 본문 변환 이후의 값 제약을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [요청 매핑과 경로 변수](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
- [RequestParam](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 HTTP 요청을 실행한 결과는 아닙니다.

## 핵심 질문 답

클래스 경로와 메서드 경로를 결합하고 HTTP 메서드까지 비교해 처리 대상을 고릅니다.
경로 값은 PathVariable로 읽고 쿼리나 폼 값은 RequestParam으로 읽어 인수 타입으로 변환합니다.
매핑 실패와 값 누락 및 타입 변환 실패는 다른 단계의 실패입니다.
변환 가능한 음수 값의 허용 범위도 별도로 판단해야 합니다.
