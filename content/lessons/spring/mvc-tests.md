# MockMvc로 확인하는 MVC 테스트 범위

## 학습 목표

컨트롤러 직접 호출, MockMvc와 Boot 테스트가 실제로 통과하는 경로를 비교할 수 있습니다.

## 한줄 요약

MockMvc는 서버를 띄우지 않고도 DispatcherServlet을 통과하는 MVC 요청 처리를 검사합니다.

## 먼저 확인할 개념

[객체와 컨텍스트 테스트](#/learn/spring/unit-tests) · [입력 검증](#/learn/spring/validation) · [오류 응답](#/learn/spring/exception-handling)

## 직접 호출이 건너뛰는 처리

컨트롤러를 `new`로 만들고 메서드를 직접 호출하면 Java 메서드의 행동을 확인할 수 있다. 그러나 `@GetMapping`의 URL이나 JSON 변환, MVC 검증, 예외 처리기를 실제로 거친 것은 아니다.

```text
직접 호출: 테스트 → controller.read(7)
MVC 요청 검사: 테스트 → DispatcherServlet → 매핑·인수 처리 → 컨트롤러 → 응답 처리
```

`MockMvc`는 모의 Servlet 요청과 응답으로 두 번째 경로를 검사한다. 실제 HTTP 서버 없이 MVC의 매핑·변환·검증·응답을 확인할 수 있다. 단, 테스트에 준비한 컨트롤러와 MVC 설정의 범위 안에서 얻은 근거다.

## 필요한 범위만 준비한다

| 방법 | 확인하는 범위와 주의점 |
| --- | --- |
| 컨트롤러 직접 호출 | Java 메서드 행동. 요청 매핑이나 MVC 변환을 확인하지 않는다. |
| `@WebMvcTest`와 MockMvc | 웹 계층에 집중한 컨텍스트와 MVC 요청 흐름. 필요한 서비스 협력자는 따로 준비할 수 있다. |
| `@SpringBootTest` | Boot 설정을 사용한 애플리케이션 컨텍스트. 기본 `MOCK` 환경은 실제 서버를 시작하지 않는다. |

`@WebMvcTest`는 일반 서비스 Bean을 모두 자동으로 불러오는 전체 앱 검사가 아니다. `@SpringBootTest`를 붙였다고 MockMvc가 항상 준비되는 것도 아니다. 필요한 경우 `@AutoConfigureMockMvc` 같은 추가 구성을 사용한다.

MockMvc 검사를 통과했다고 실제 포트, 브라우저, 외부 서버 통신까지 확인했다고 쓰지 않는다. 반대로 실제 서버를 띄우지 않았다는 이유만으로 MVC를 전혀 검사하지 못한 것도 아니다. **어떤 경로를 통과했는가**가 기준이다.

직접 해볼 일: “잘못된 JSON 입력이 400으로 처리되는가”와 “내 컴퓨터의 포트로 브라우저가 접속되는가”에 필요한 검증 경로가 어떻게 다른지 적는다. 이 입문 묶음의 객관식으로 요청→변환→검증→응답의 경계를 다시 설명해 보자.

## 이어서 연습하기

입문 흐름의 마지막 문서입니다. 객체 연결부터 요청·응답·검증 경계까지 자신의 말로 이어 설명해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [MockMvc의 검사 경로](https://docs.spring.io/spring-framework/reference/testing/mockmvc/overview.html)
- [WebMvcTest와 SpringBootTest](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

컨트롤러 직접 호출은 MVC를 우회하므로 URL 매핑이나 입력 변환·검증을 확인하지 않습니다. MockMvc는 서버 없이 DispatcherServlet을 지나는 요청 처리를 검사합니다. WebMvcTest는 웹 계층에 집중하고 SpringBootTest의 기본 MOCK도 실제 서버를 시작하지 않으므로, 통과한 경로만 검증 근거로 설명해야 합니다.
