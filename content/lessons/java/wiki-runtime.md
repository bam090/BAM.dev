# JDK와 JVM: Java 컴파일과 실행

## 학습 목표

소스·클래스 파일·JDK·JVM의 역할과 실행 조건을 구분할 수 있습니다.

## 한줄 요약

javac가 Java 소스를 클래스 파일로 만들고 java가 호환되는 JVM에서 클래스를 실행합니다.

## 소스와 실행 도구를 구분한다

JDK는 javac와 java 같은 개발·실행 도구 모음이고, JVM은 클래스 파일을 실행하는 환경이다.
javac는 소스를 검사해 JVM 명령과 클래스·필드·메서드 등의 구조 정보가 담긴 클래스 파일로 만든다.
같은 클래스 파일도 그 버전과 필요한 API를 지원하는 JVM이 있어야 실행할 수 있다.

다음 예제는 이름 있는 클래스와 main을 사용하는 시작 형태다.
Java가 허용하는 모든 시작 형태를 이 한 예제로 설명하는 것은 아니다.

```java
public class OrderGuide {
    public static void main(String[] args) {
        System.out.println("주문 안내를 시작합니다.");
    }
}
```

공개 최상위 클래스 이름에 맞춰 파일을 `OrderGuide.java`로 저장한다.
main은 이 프로그램의 시작점이며 println은 값을 한 줄 출력한다.

```text
javac --release 25 OrderGuide.java
java OrderGuide
```

첫 명령은 Java 25 언어·공개 API 기준의 클래스 파일을 만들도록 요청한다.
두 번째 명령에는 `.class` 확장자 대신 클래스 이름을 쓴다.
소스 파일, 클래스 파일, 명령이 각각 어느 자리에 있는지 설명해 보자.

## 실행 환경이 같다는 말의 범위

클래스 파일은 특정 CPU의 기계어 파일이나 원본 글의 복사본이 아니다.
운영체제만 같아도 된다고 생각하지 말고 클래스 파일 버전과 API 지원도 확인한다.
파일 경로나 운영체제 전용 기능까지 자동으로 같아지는 것은 아니다.
컴파일러가 문법과 타입 문제를 찾더라도 모든 논리 오류를 찾아 주지는 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [타입과 변수의 값](#/learn/java/wiki-types-variables)

## 공식 자료

- [Java25 javac](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
- [Java25 언어 명세](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)

## 핵심 질문 답

JDK의 javac가 소스의 문법과 타입을 확인해 클래스 파일을 만들고 java 런처가 JVM을 시작해 클래스를 실행합니다.
클래스 파일에는 JVM 명령과 구조 정보가 있으며 이 예제에서는 클래스 이름과 파일명을 맞춥니다.
같은 파일도 해당 버전과 API를 지원하는 JVM이 필요하고 운영체제 전용 조건까지 자동으로 같아지지는 않습니다.
