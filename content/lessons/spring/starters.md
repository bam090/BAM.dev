# Starter와 자동구성

## 학습 목표

- 필요한 HTTP 처리와 입력 검증에 맞는 starter를 선택할 수 있습니다.
- Starter의 라이브러리 묶음과 Boot 의존성 관리의 버전 선택을 구분할 수 있습니다.
- 라이브러리·기존 Bean·설정 조건에 따른 자동구성을 설명할 수 있습니다.
- 직접 등록한 Bean이 해당 기본 구성의 적용 조건을 바꾸는 이유를 설명할 수 있습니다.

## 먼저 확인할 개념

[Boot 시작점과 컴포넌트 탐색](#/learn/spring/boot-start)

## Starter와 의존성 관리

HTTP 요청을 Spring MVC로 처리하려면 웹 프레임워크와 서버 라이브러리가 필요합니다.
**Starter**는 용도에 맞는 의존성을 한 묶음으로 준비하도록 돕습니다.
Spring Boot 4.1에서 다음 묶음의 역할을 구분합니다.

| 의존성 | 용도 |
| --- | --- |
| `spring-boot-starter-webmvc` | Spring MVC와 Tomcat을 사용하는 웹 구성 |
| `spring-boot-starter-validation` | Bean Validation 구현을 포함한 검증 지원 |
| `spring-boot-starter-test` | JUnit Jupiter 등 테스트 라이브러리 지원 |

Boot의 **의존성 관리**는 함께 사용할 라이브러리 버전 목록을 제공합니다.
이 관리가 적용된 빌드에서는 관리 대상의 버전을 각각 반복 지정하지 않을 수 있습니다.
Starter 이름만 적었다고 모든 빌드에 같은 버전 관리가 자동 적용되는 것은 아닙니다.
개별 버전을 바꾸면 호환성을 다시 확인하며 각각 최신이라는 이유로 안전한 조합이라고 단정하지 않습니다.

---

## 자동구성의 조건

**자동구성**은 클래스패스의 라이브러리와 기존 Bean 및 설정값 등의 조건을 보고 기본 구성을 선택합니다.
같은 Boot 버전과 starter를 사용해도 직접 등록한 Bean이 다르면 적용 결과가 달라질 수 있습니다.

다음은 조건을 읽기 위한 가상 사례이며 실제 Boot 기능이나 실행 로그가 아닙니다.

| 조건 | 앱 A | 앱 B |
| --- | --- | --- |
| 알림 라이브러리 | 있음 | 있음 |
| 직접 등록한 `Notifier` Bean | 없음 | 있음 |
| 기존 Notifier가 없을 때 기본 Bean 제공 | 조건 만족 | 조건 불만족 |

`@ConditionalOnMissingBean`은 지정한 Bean이 없을 때 적용하는 조건입니다.
이 조건의 자동구성은 사용자가 해당 타입을 등록하면 기본 Bean을 추가하지 않도록 만들 수 있습니다.
직접 등록한 Bean이 모든 자동구성을 취소하거나 Boot가 사용자 Bean을 항상 덮어쓰는 것은 아닙니다.
각 자동구성의 조건을 확인합니다.

## 라이브러리와 구성의 연결 관찰

`starter 선택 → 라이브러리 준비 → 자동구성 조건 평가 → Bean과 설정 준비`의 흐름을 따라갑니다.
표의 앱 A에 `Notifier`를 직접 등록했을 때 바뀌는 조건을 찾습니다.
직접 해볼 일은 HTTP 처리와 입력 검증에 필요한 starter의 역할을 나누고 Bean 등록으로 달라진 칸을 표시하는 것입니다.
업무 소스 작성과 API 동작 검증은 이 구성 선택 이후에도 필요합니다.

필요한 Bean이 없으면 라이브러리와 조건을 확인합니다.
외부 프로젝트에서 `--debug`로 조건 보고서를 확인할 수 있지만 오류를 자동 수정하는 스위치는 아닙니다.

## 정리

- Starter는 필요한 라이브러리를 묶고 의존성 관리는 사용할 버전을 맞춥니다.
- 자동구성은 라이브러리와 기존 Bean 등의 조건에 따라 기본 구성을 선택합니다.
- 직접 Bean을 등록했을 때는 바뀐 조건을 확인하며 모든 자동구성이 취소된다고 판단하지 않습니다.

## 이어서 연습하기

[외부 설정과 Profile](#/learn/spring/external-config)에서 현재 환경의 값과 구성 조건을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [빌드 시스템과 starter](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
- [자동구성의 적용과 교체](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
- [자동구성의 Bean 조건](https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
의존성 설치와 앱 실행을 수행한 결과는 아닙니다.

## 핵심 질문 답

Starter는 용도에 필요한 라이브러리를 묶고 Boot 의존성 관리는 함께 사용할 버전을 맞춥니다.
자동구성은 준비된 라이브러리와 기존 Bean 등의 조건을 보고 기본 구성을 선택합니다.
직접 Bean을 등록하면 해당 조건의 기본 제공이 물러날 수 있지만 모든 자동구성이 취소되지는 않습니다.
이 세 역할은 업무 규칙 작성이나 실제 API 검증을 대신하지 않습니다.
