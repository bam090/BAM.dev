# 계산 전에 정하는 숫자 타입

## 학습 목표

승격·정수 나눗셈·오버플로를 고려해 계산 타입을 정할 수 있습니다.

## 한줄 요약

숫자는 연산 전에 타입이 맞춰지고 정수 계산의 손실은 결과 대입 타입만 바꿔도 복구되지 않습니다.

## 먼저 확인할 개념

[타입과 변수의 값](#/learn/java/wiki-types-variables)을 먼저 확인해 보세요.

## 결과를 받을 타입보다 계산할 타입을 본다

작은 정수형의 일반적인 수치 연산은 int로 승격될 수 있으며 정수끼리의 나눗셈은 소수 부분을 0에 가까운 방향으로 버린다.
계산이 끝난 뒤 결과를 double이나 long에 넣어도 이미 잃은 소수나 오버플로 이전 값을 복구하지 못한다.
더 큰 범위나 소수가 필요하다면 연산이 시작되기 전에 피연산자 타입을 바꿔야 한다.

```java
byte first = 10;
byte second = 20;
int sum = first + second;

double whole = 7 / 2;
double fraction = 7.0 / 2;
```

byte 두 개의 덧셈도 이 경우 int 계산이다.
whole에는 정수 나눗셈 결과를 double로 바꾼 3.0이, fraction에는 3.5가 대응한다.
`-7 / 2`는 아래쪽 정수가 아니라 0에 가까운 -3이 된다.

일반적인 이항 수치 연산에서는 double, float, long, int 순으로 필요한 공통 타입을 고른다.
문자열이 포함된 `+`는 숫자 계산이 아니라 문자열 연결이 될 수 있으므로 피연산자를 먼저 본다.

## 중간 결과도 범위 안에 있어야 한다

```java
int price = 2_000_000_000;
int quantity = 2;
long total = (long) price * quantity;
```

이 예에서는 곱하기 전에 price를 long으로 바꿔 long 곱셈을 한다.
`(long) (price * quantity)`는 int 곱셈이 먼저여서 같은 뜻이 아니다.
int 범위를 넘는 계산은 자동으로 long이 되거나 일반적인 오버플로 예외를 던지지 않는다.
입력과 중간 결과의 범위를 모두 확인한 뒤 타입을 정한다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow)

## 공식 자료

- [Java25 javac](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
- [Java25 언어 명세](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)

## 핵심 질문 답

계산에 들어가는 피연산자의 타입과 결과 범위를 먼저 확인합니다.
작은 정수는 int로 승격될 수 있고 정수 나눗셈은 소수를 버리며 int 오버플로는 자동으로 long이나 예외가 되지 않습니다.
더 큰 계산 범위나 소수가 필요하면 계산이 끝난 뒤가 아니라 연산 전에 피연산자의 타입을 바꿉니다.
