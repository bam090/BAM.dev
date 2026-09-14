# 컴포넌트 탐색 범위

## 학습 목표

시작 클래스의 패키지 위치를 보고 기본 탐색에 포함되는 컴포넌트를 판정할 수 있습니다.

## 한줄 요약

@Service가 있어도 탐색 범위 밖이면 기본 컴포넌트 탐색으로 등록되지 않습니다.

## 먼저 확인할 개념

[Bean 등록](#/learn/spring/bean-registration) · [Boot 시작점](#/learn/spring/boot-start)

## 시작 패키지에서 아래로 찾는다

기본 `@SpringBootApplication`은 그 클래스가 있는 패키지를 컴포넌트 탐색의 기준으로 삼는다. 추가 탐색 설정이나 명시적 등록이 없는 다음 구조를 살펴보자.

```text
com.example.study
├── StudyApplication          (@SpringBootApplication)
├── notice.NoticeService      (@Service)
└── web.NoticeController      (@RestController)
com.example.shared
└── SharedFormatter           (@Component)
```

`com.example.study`와 그 하위 패키지의 컴포넌트는 기본 탐색에 포함된다. 형제 패키지인 `com.example.shared`는 이 기본 범위 밖이다. 클래스 파일이 프로젝트 안에 있다는 이유만으로 전부 등록되지는 않는다.

## 패키지 경계와 Java import

시작 클래스를 앱 코드의 공통 상위 패키지에 두면 탐색 기준을 파악하기 쉽다. 필요한 경우 탐색 범위를 명시하거나 설정에서 필요한 클래스를 등록할 수 있지만, 먼저 실제 패키지 선언과 탐색 기준을 확인한다.

Java의 `import com.example.shared.SharedFormatter;`는 소스에서 타입 이름을 사용할 수 있게 하는 문법이다. 컴포넌트 탐색이나 Bean 등록을 수행하지 않는다. `@Import`라는 Spring 설정 어노테이션과도 구별한다.

패키지를 선언하지 않는 기본 패키지는 탐색 범위가 지나치게 넓어지는 문제를 만들 수 있으므로 사용하지 않는 편이 좋다.

직접 해볼 일: `StudyApplication`이 `com.example.study.boot`로 이동하면 기존 서비스가 기본 탐색에 들어오는지 패키지 트리로 그려 본다. 파일의 화면 위치가 아니라 `package` 선언을 기준으로 판단한다.

## 이어서 연습하기

[외부 설정과 @ConfigurationProperties](#/learn/spring/external-config)에서 이어지는 판단을 확인해 보세요.
핵심 질문에 먼저 답한 뒤 이 문서에 연결된 객관식에서 선택한 이유를 비교해 보세요.

## 공식 자료

- [Boot 코드와 시작 클래스 위치](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)
- [컴포넌트 탐색](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)

2026-09-14 공식 문서를 확인해 밤데브용으로 새로 작성했습니다. Spring Boot 4.1.1·Spring Framework 7.0.9·Java 25 정식 기준이며, 코드와 요청은 실행하지 않은 읽기 예제입니다.

## 핵심 질문 답

기본 컴포넌트 탐색은 @SpringBootApplication 클래스의 패키지와 하위 패키지에서 시작합니다. @Service가 붙어도 그 범위 밖이고 별도 등록이 없으면 Bean으로 발견되지 않습니다. 실제 package 선언과 시작점의 위치를 확인해야 하며 Java import 한 줄은 Bean 등록을 대신하지 않습니다.
