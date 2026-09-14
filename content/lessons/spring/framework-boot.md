# Spring과 Spring Boot의 관계

## 학습 목표

Java, Spring Framework, Spring Boot가 맡는 일을 구분할 수 있습니다.

## 한줄 요약

Spring Boot는 Spring Framework 기반 애플리케이션의 시작과 구성을 돕습니다.

## 먼저 확인할 개념

[Java 실행 구조](#/learn/java/wiki-runtime) · [조합과 생성자 주입](#/learn/java/wiki-composition-injection)

## Java 위의 Spring, Spring 위의 Boot

알림 서비스가 전송 객체를 사용한다고 생각해 보자. 객체를 만들고 연결하는 일, HTTP 요청을 받는 일, 필요한 라이브러리와 기본 설정을 준비하는 일은 서로 다르다. 어느 부분을 직접 작성하고 어느 부분의 도움을 받을지 먼저 구분해야 한다.

| 대상 | 맡는 일 |
| --- | --- |
| Java | 클래스·메서드·타입으로 프로그램을 작성하고 JVM에서 실행한다. |
| Spring Framework | 객체를 관리하고 연결하는 컨테이너, 웹 요청을 처리하는 Spring MVC 등의 기반을 제공한다. |
| Spring Boot | Spring 기반 앱을 시작하기 쉽게 의존성 묶음과 조건에 따른 기본 구성을 제공한다. |

Boot를 쓰는 앱에서도 생성자로 협력 객체를 받고, 등록된 컨트롤러가 요청을 처리한다. Boot가 이러한 Spring 개념을 다른 규칙으로 바꾸는 것은 아니다. 반대로 Boot 없이도 Spring Framework를 사용하고 필요한 설정을 직접 준비할 수 있다.

## 역할부터 관찰하기

`Java 코드 작성 → 필요한 라이브러리와 설정 준비 → Spring 객체 연결 → 요청 처리`에서 Boot가 돕는 자리와 직접 작성할 업무 규칙의 자리를 짚어 보자. Boot는 어떤 상품에 할인을 적용할지 같은 제품 규칙까지 작성해 주지 않는다.

직접 해볼 일: “객체의 협력 관계를 연결한다”, “호환되는 라이브러리 구성을 준비한다”를 위 표의 담당과 연결하고 이유를 한 문장씩 적는다.

## 이 과정에서 다루는 범위

이 과정은 Spring 핵심, Boot 설정, Servlet 기반 Spring MVC의 입력·응답과 테스트 경계를 작은 문서와 객관식으로 학습한다. 이어서 [Security 접근 제어](#/learn/spring/security-authentication-authorization)와 [JPA 데이터 저장·조회](#/learn/spring/jpa-roles)를 정적 입문 묶음으로 다룬다. 실제 프로젝트 실행과 데이터베이스 운영은 별도 외부 웹과제에서 다룬다.

## 이어서 연습하기

[DI(의존성 주입): 필요한 객체를 외부에서 받기](#/learn/spring/ioc-di)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Spring Framework 개요](https://docs.spring.io/spring-framework/reference/overview.html)
- [Spring Boot 시스템 요구사항](https://docs.spring.io/spring-boot/system-requirements.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

Spring Boot는 Spring Framework를 바탕으로 앱의 시작과 구성을 돕습니다. 객체 연결과 웹 요청 처리의 의미는 여전히 Spring Framework를 따르므로 DI, Bean, MVC를 이해해야 설정과 오류를 설명할 수 있습니다. Boot 없이도 Spring을 사용할 수 있고, 업무 규칙은 개발자가 작성합니다.
