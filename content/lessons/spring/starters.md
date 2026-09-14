# Starter와 의존성 버전

## 학습 목표

필요한 기능의 starter를 선택하고 Boot 의존성 관리가 버전 선택을 돕는 이유를 설명할 수 있습니다.

## 한줄 요약

Starter는 용도에 맞는 라이브러리 묶음이며, Boot의 의존성 관리는 함께 사용할 버전을 맞춥니다.

## 먼저 확인할 개념

[Boot 시작점](#/learn/spring/boot-start)

## 기능에 필요한 라이브러리를 묶는다

Servlet 기반 HTTP 요청을 Spring MVC로 처리하려면 웹 프레임워크와 서버 관련 라이브러리가 필요하다. 각각 찾아 조합하는 부담을 줄이는 의존성 묶음이 **starter**다.

Spring Boot 4.1 기준으로 이 입문 흐름에서 구별할 묶음은 다음과 같다.

| 의존성 이름 | 주요 용도 |
| --- | --- |
| `spring-boot-starter-webmvc` | Spring MVC와 Tomcat을 사용하는 웹 구성 |
| `spring-boot-starter-validation` | Bean Validation 구현을 포함한 검증 지원 |
| `spring-boot-starter-test` | JUnit Jupiter 등 테스트 라이브러리 지원 |

starter는 컨트롤러나 할인 계산 같은 업무 소스를 대신 작성하지 않는다.

## 묶음 선택과 버전 선택은 다르다

Boot는 특정 버전과 함께 사용할 의존성 버전 목록을 제공한다. Boot의 의존성 관리가 적용된 빌드라면 관리 대상 라이브러리마다 버전을 반복해서 정하지 않을 수 있다. 그러나 그 관리를 적용하지 않은 빌드가 이름만 보고 자동으로 같은 버전을 쓰는 것은 아니다.

기본 조합에서 특정 라이브러리만 임의 버전으로 바꾸면 호환성을 다시 확인해야 한다. “각각 최신이니 함께 안전하다”는 판단은 충분하지 않다. 먼저 어떤 Boot 버전의 관리가 적용되는지 확인한다.

직접 해볼 일: HTTP 요청 처리와 `@NotBlank` 입력 검증이 모두 필요할 때 위 표에서 필요한 역할을 나누어 표시한다. starter를 선택했다는 사실과 작성한 API가 올바르게 동작한다는 사실도 구분한다.

## 이어서 연습하기

[자동구성의 조건 읽기](#/learn/spring/auto-configuration)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [빌드 시스템, 의존성 관리와 starter](https://docs.spring.io/spring-boot/reference/using/build-systems.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

Starter는 특정 용도에 필요한 라이브러리를 한 의존성 묶음으로 제공합니다. Boot의 의존성 관리는 함께 사용할 버전을 맞추는 별도 역할을 합니다. Servlet MVC에는 webmvc 묶음을 살피고 입력 검증 구현도 필요한지 확인해야 하며, 개별 라이브러리 버전을 바꾸면 호환성 검토가 다시 필요합니다.
