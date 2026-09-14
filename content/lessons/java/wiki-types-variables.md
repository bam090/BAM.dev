# 타입과 변수의 값

## 학습 목표

기본 값과 참조값을 구분하고 지역 변수를 읽기 전에 값이 정해졌는지 확인할 수 있습니다.

## 한줄 요약

타입은 값과 연산을 제한하며 지역 변수는 읽기 전에 모든 가능한 경로에서 초기화되어야 합니다.

## 먼저 확인할 개념

[JDK와 JVM: Java 컴파일과 실행](#/learn/java/wiki-runtime)을 먼저 확인해 보세요.

## 값의 종류와 초기화를 확인한다

int와 boolean 같은 기본 타입 변수는 기본 값을, String과 배열 같은 참조 타입 변수는 참조값을 다룬다.
참조값은 객체를 가리키거나 null일 수 있으며 참조 타입을 단순히 큰 값을 담는 타입이라고 나누지 않는다.
메서드의 지역 변수는 읽기 전에 모든 가능한 실행 경로에서 값이 정해져 있어야 한다.

```java
int price = 3500;
boolean available = true;
String title = "Java 입문";
int[] scores = {70, 80};
```

타입과 변수 이름을 적는 일은 선언, 첫 값을 넣는 일은 초기화다.
이미 있는 변수에 다시 값을 넣는 일은 대입이며 `=`과 비교용 `==`는 다르다.
코드에 직접 적은 3500·true·문자열 같은 값 표기는 리터럴이다.

| 기본 타입 | 먼저 볼 역할 |
| --- | --- |
| byte, short, int, long | 정수 |
| float, double | 부동소수점 수 |
| char | UTF-16 코드 단위 하나 |
| boolean | true 또는 false |

String은 클래스 타입이고 int[]는 배열 타입이므로 둘 다 참조 타입이다.
char 하나가 사람이 보는 모든 글자 하나와 같다고 단정하지 않는다.

## 값이 정해진 경로를 따라간다

```java
static int chooseTotal(boolean ready) {
    int total;
    if (ready) {
        total = 10;
    } else {
        total = 0;
    }
    return total;
}
```

ready가 어느 값이어도 return 전에 total이 정해지는지 확인해 보자.
else의 대입을 없애면 false 경로에서 값을 읽기 전에 정하지 못한다.
필드와 배열 원소의 생성 시 기본값 규칙을 지역 변수에 적용하지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)

## 공식 자료

- [Java25 javac](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
- [Java25 언어 명세](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)

## 핵심 질문 답

선언한 타입이 기본 값인지 참조값인지, 어떤 값을 넣고 연산할 수 있는지 먼저 확인합니다.
String과 배열은 참조 타입이며 null일 수도 있습니다.
지역 변수는 모든 가능한 경로에서 읽기 전에 값이 정해져야 하고 필드·배열의 기본값 규칙을 그대로 적용하지 않습니다.
