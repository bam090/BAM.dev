# Spring Boot 시작점 읽기

## 학습 목표

SpringApplication.run과 @SpringBootApplication의 역할을 나누고 웹 서버 시작의 조건을 설명할 수 있습니다.

## 한줄 요약

main이 Boot 시작을 요청하고, 설정·자동구성·컴포넌트 탐색으로 애플리케이션 컨텍스트를 준비합니다.

## 먼저 확인할 개념

[Singleton과 공유 범위](#/learn/spring/singleton-state)

## 시작 코드가 가리키는 구성

다음은 Java 25에서 읽는 최소 시작 클래스 예제다.

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

`main`은 Java 프로그램의 시작점이다. `SpringApplication.run`에는 주 구성 클래스와 실행 인수를 전달한다. Boot는 이를 바탕으로 Spring의 `ApplicationContext`, 즉 Bean과 설정을 관리하는 애플리케이션 컨텍스트를 시작한다.

`@SpringBootApplication`은 세 역할을 묶는다.

- `@SpringBootConfiguration`: 주 구성 클래스에서 Bean이나 다른 구성을 정의한다.
- `@EnableAutoConfiguration`: 조건에 맞는 Boot 기본 구성을 사용한다.
- `@ComponentScan`: 시작 클래스의 패키지를 기준으로 컴포넌트를 탐색한다.

## Boot 시작과 웹 서버 시작을 구분한다

웹 관련 라이브러리와 웹 환경에 따라 컨텍스트 종류가 달라진다. Spring MVC 기반 웹 앱은 내장 Servlet 서버와 함께 시작하도록 구성할 수 있지만, Boot는 웹 서버가 없는 일반 애플리케이션도 지원한다. `run` 호출만 보고 항상 HTTP 포트가 열린다고 판단하지 않는다.

모든 클래스에 `@SpringBootApplication`을 붙일 필요도 없다. 서비스는 자기 역할에 맞게 등록하고 주 구성은 시작점에서 정한다.

직접 해볼 일: 위 코드에서 Java 시작점, 주 구성 클래스, 실행 인수가 각각 어디에 있는지 표시한다. 서버가 필요한지 판단하기 전에 확인할 정보도 적는다.

## 이어서 연습하기

[Starter와 의존성 버전](#/learn/spring/starters)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [@SpringBootApplication](https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html)
- [SpringApplication과 웹 환경](https://docs.spring.io/spring-boot/reference/features/spring-application.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

SpringApplication.run은 주 구성 클래스와 실행 인수를 바탕으로 애플리케이션 컨텍스트를 시작합니다. @SpringBootApplication은 주 구성, 조건에 따른 자동구성, 컴포넌트 탐색을 묶습니다. 웹 서버가 시작되는지는 웹 라이브러리와 환경 구성에 달려 있으므로 모든 Boot 앱에 서버가 필요한 것은 아닙니다.
