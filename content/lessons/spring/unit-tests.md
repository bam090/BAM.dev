# 객체·컨텍스트·MVC 테스트

## 학습 목표

- 직접 생성한 객체의 행동 검사와 Spring 컨텍스트의 구성 연결 검사를 구분할 수 있습니다.
- 컨트롤러 직접 호출과 MockMvc의 MVC 요청 경로를 비교할 수 있습니다.
- WebMvcTest와 SpringBootTest 기본 MOCK의 검사 범위를 설명할 수 있습니다.
- 통과한 테스트가 실제 서버와 브라우저 통신까지 확인했는지 근거의 한계를 설명할 수 있습니다.

## 먼저 확인할 개념

[객체 연결과 DI](#/learn/spring/ioc-di) · [Java 테스트 도구](#/learn/java/wiki-test-contracts) · [JSON 요청 본문과 검증](#/learn/spring/request-body) · [응답과 예외 처리](#/learn/spring/responses)

## 순수 객체의 행동 검사

DI를 사용하면 Spring 없이도 협력자를 전달해 객체 행동을 확인할 수 있습니다.
다음은 컨텍스트를 만들지 않는 객체 구성 예제입니다.

```java
interface PrefixSource { String prefix(); }

class TitleService {
    private final PrefixSource source;

    TitleService(PrefixSource source) { this.source = source; }
    String title(String name) { return source.prefix() + name; }
}

// 테스트에서 구성할 객체
// TitleService service = new TitleService(() -> "학습: ");
// 비교할 호출: service.title("Spring")
```

이 검사는 전달한 협력자와 메서드의 행동을 대상으로 합니다.
객체 계산은 실제로 유지하고 검사 범위 밖의 협력만 대역으로 나눕니다.
탐색과 Bean 등록 및 Qualifier와 Profile 선택은 우회하므로 구성 연결이 맞다는 근거는 아닙니다.
연결이 검사 대상이라면 필요한 Spring 컨텍스트를 준비합니다.

---

## MVC 요청 경로와 검사 범위

컨트롤러를 직접 호출하면 Java 메서드 행동은 확인하지만 URL 매핑과 JSON 변환 및 MVC 검증과 예외 처리는 거치지 않습니다.

```text
직접 호출: 테스트 → controller.read(7)
MVC 검사: 테스트 → DispatcherServlet → 매핑·인수 처리
          → 컨트롤러 → 응답 처리
```

MockMvc는 모의 Servlet 요청과 응답으로 두 번째 경로를 검사합니다.
실제 HTTP 서버를 띄우지 않아도 MVC 처리를 확인할 수 있지만 준비한 컨트롤러와 설정 범위 안의 근거입니다.

| 방법 | 확인할 범위 |
| --- | --- |
| 직접 생성한 객체 테스트 | 객체 행동을 검사하며 Spring 구성 선택은 우회합니다. |
| 컨트롤러 직접 호출 | Java 메서드 행동을 검사하며 MVC 처리는 우회합니다. |
| `@WebMvcTest`와 MockMvc | 웹 계층에 집중한 컨텍스트와 MVC 요청 처리를 검사합니다. |
| `@SpringBootTest` | Boot 설정을 사용하는 애플리케이션 컨텍스트를 검사합니다. 기본 MOCK 환경은 실제 서버를 시작하지 않습니다. |

WebMvcTest는 모든 서비스 Bean을 자동으로 불러오는 전체 앱 검사가 아닙니다.
필요한 서비스 협력자는 따로 준비할 수 있습니다.
SpringBootTest만으로 MockMvc가 항상 준비되는 것도 아니므로 필요한 경우 `@AutoConfigureMockMvc`를 추가합니다.

## 검사 목적과 통과 경로의 관찰

`확인할 조건 선택 → 필요한 경로 준비 → 호출 → 관찰한 결과 해석`을 따라갑니다.
직접 해볼 일은 제목 문자열 계산과 local Profile의 Bean 연결 및 깨진 JSON의 400 응답을 위 표에 연결하는 것입니다.
각 검사가 우회한 경로도 하나씩 적습니다.

MockMvc 성공을 실제 포트 접속과 브라우저 및 외부 서버 통신의 검증으로 확대하지 않습니다.
실제 서버가 없다는 이유로 MVC를 전혀 검사하지 못했다고 판단하지도 않습니다.
검증 근거는 실제로 통과한 경로를 기준으로 설명합니다.

## 정리

- 객체 직접 생성은 행동을 검사하며 Spring 구성 선택은 우회합니다.
- MockMvc는 실제 서버 없이 DispatcherServlet을 지나는 MVC 처리를 검사합니다.
- 테스트 성공의 근거는 준비한 설정과 실제로 통과한 경로에 한정합니다.

## 이어서 연습하기

[인증과 인가](#/learn/spring/security-authentication-authorization)에서 HTTP 요청 앞의 보안 판단을 시작합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Spring 객체의 단위 테스트](https://docs.spring.io/spring-framework/reference/testing/unit.html)
- [MockMvc 검사 경로](https://docs.spring.io/spring-framework/reference/testing/mockmvc/overview.html)
- [Boot 컨텍스트와 웹 계층 테스트](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
이 예제로 테스트를 작성하거나 실행한 결과는 아닙니다.

## 핵심 질문 답

객체 직접 생성은 행동을 확인하지만 Spring의 등록과 구성 선택을 우회합니다.
컨트롤러 직접 호출도 MVC 매핑과 입력·응답 처리를 우회합니다.
MockMvc는 실제 서버 없이 DispatcherServlet을 지나는 MVC 요청을 검사합니다.
WebMvcTest는 웹 계층에 집중하고 SpringBootTest의 기본 MOCK은 실제 서버를 띄우지 않으므로 목적에 맞는 경로를 준비하고 그 범위만 검증 근거로 설명합니다.
