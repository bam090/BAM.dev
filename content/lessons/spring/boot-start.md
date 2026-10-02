# Spring Boot 시작점과 컴포넌트 탐색

## 학습 목표

- SpringApplication.run이 주 구성 클래스와 실행 인수로 컨텍스트를 시작하는 역할을 설명할 수 있습니다.
- SpringBootApplication의 주 구성·자동구성·컴포넌트 탐색 역할을 구분할 수 있습니다.
- 웹 라이브러리와 환경을 보고 웹 서버 시작의 조건을 설명할 수 있습니다.
- 시작 패키지를 기준으로 컴포넌트 탐색 범위를 판정하고 Java import와 Bean 등록을 구분할 수 있습니다.

## 먼저 확인할 개념

[Bean 등록](#/learn/spring/bean-registration) · [Singleton과 공유 상태](#/learn/spring/singleton-state)

## Boot의 시작 구성

다음은 Java 25에서 읽는 시작 클래스 예제입니다.

```java
package com.example.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudyApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyApplication.class, args);
    }
}
```

`main`은 Java 프로그램의 시작점입니다.
`SpringApplication.run`은 주 구성 클래스와 실행 인수를 받아 Bean과 설정을 관리하는 `ApplicationContext`를 시작합니다.
`@SpringBootApplication`은 다음 세 역할을 묶습니다.

| 어노테이션 | 역할 |
| --- | --- |
| `@SpringBootConfiguration` | 주 구성 클래스에서 Bean과 추가 구성을 정의합니다. |
| `@EnableAutoConfiguration` | 조건에 맞는 Boot 기본 구성을 사용합니다. |
| `@ComponentScan` | 시작 클래스의 패키지를 기준으로 컴포넌트를 탐색합니다. |

웹 라이브러리와 환경에 따라 컨텍스트 종류가 달라집니다.
MVC 웹 앱은 내장 Servlet 서버와 함께 시작하도록 구성할 수 있고 웹 서버가 없는 Boot 앱도 있습니다.
`run` 호출만 보고 항상 HTTP 포트가 열린다고 판단하지 않습니다.
서비스마다 시작 어노테이션을 붙일 필요도 없습니다.

---

## 시작 패키지와 탐색 범위

별도 탐색 설정이나 명시적 등록이 없는 다음 구조에서 등록될 클래스를 먼저 골라 봅니다.

```text
com.example.study
├── StudyApplication          (@SpringBootApplication)
├── notice.NoticeService      (@Service)
└── web.NoticeController      (@RestController)
com.example.shared
└── SharedFormatter           (@Component)
```

기본 탐색에는 `com.example.study`와 하위 패키지의 컴포넌트가 포함됩니다.
형제 패키지인 `com.example.shared`는 범위 밖입니다.
`@Service`가 있어도 탐색 범위 밖이고 별도 등록이 없다면 기본 탐색으로 발견되지 않습니다.

시작 클래스를 앱 코드의 공통 상위 패키지에 두면 탐색 기준을 읽기 쉽습니다.
필요한 클래스를 명시적으로 등록하거나 탐색 범위를 지정할 수도 있습니다.
패키지를 선언하지 않은 기본 패키지는 탐색 범위가 지나치게 넓어질 수 있으므로 피합니다.

Java `import`는 소스에서 타입 이름을 사용하게 하는 문법입니다.
컴포넌트 탐색이나 Bean 등록을 수행하지 않으며 Spring 설정의 `@Import`와도 다릅니다.

## 시작점과 등록 범위의 관찰

`main → run → 구성과 탐색 → Bean 연결` 순서에서 시작 클래스를 `com.example.study.boot`로 옮겼다고 가정합니다.
기존 서비스가 새 시작 패키지 아래에 있는지 실제 `package` 선언으로 판단합니다.
직접 해볼 일은 주 구성 클래스와 실행 인수를 표시하고 패키지 이동 때문에 발견되지 않을 클래스를 찾는 것입니다.
서버 시작 여부에는 패키지 위치 외에 어떤 웹 구성 정보가 필요한지도 적습니다.

## 정리

- run은 주 구성 클래스와 실행 인수로 컨텍스트를 시작합니다.
- 기본 컴포넌트 탐색은 시작 클래스의 패키지와 하위 패키지를 대상으로 합니다.
- Java import는 Bean 등록을 대신하지 않으며 웹 서버 시작에는 별도의 웹 구성 조건이 필요합니다.

## 이어서 연습하기

[Starter와 자동구성](#/learn/spring/starters)에서 라이브러리 선택과 기본 구성의 조건을 확인합니다.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 판단 이유를 비교합니다.

## 공식 자료

- [Boot 시작 어노테이션](https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html)
- [SpringApplication과 웹 환경](https://docs.spring.io/spring-boot/reference/features/spring-application.html)
- [시작 클래스의 패키지 위치](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)

2026-10-02 공식 문서를 확인해 승인된 범위에서 기존 두 교안을 통합했습니다.
Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준의 정적 읽기 자료입니다.
코드와 서버 시작을 실행한 결과는 아닙니다.

## 핵심 질문 답

SpringApplication.run은 주 구성 클래스와 실행 인수를 바탕으로 컨텍스트를 시작합니다.
@SpringBootApplication은 주 구성과 자동구성 및 컴포넌트 탐색을 묶습니다.
기본 탐색은 시작 클래스의 패키지와 하위 패키지를 대상으로 하므로 어노테이션이 있어도 범위 밖이면 별도 등록이 필요합니다.
Java import는 등록을 대신하지 않으며 웹 서버 시작 여부는 웹 라이브러리와 환경으로 따로 판단합니다.
