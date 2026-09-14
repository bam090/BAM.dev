# 조건과 반복의 실행 경계

## 학습 목표

분기와 반복에서 실행할 갈래·계속할 조건·갱신 순서를 추적할 수 있습니다.

## 한줄 요약

조건은 실행할 길을 고르고 반복은 시작값·계속 조건·갱신으로 같은 흐름의 종료를 정합니다.

## 먼저 확인할 개념

[타입과 변수의 값](#/learn/java/wiki-types-variables), [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)을 먼저 확인해 보세요.

## 실행할 길과 계속할 조건을 찾는다

if의 조건은 boolean이며 하나의 if-else 사슬은 위에서 처음 참인 갈래 하나를 실행한다.
switch 표현식은 결과값을 만들어야 하므로 가능한 입력을 처리해야 하며, 아래 int 예제는 나머지 입력을 default로 받는다.
반복문은 시작값·계속할 조건·한 번 실행할 때의 갱신을 함께 읽어 종료를 판단한다.

```java
static String orderMessage(int requested, int stock) {
    if (requested <= 0) {
        return "수량 확인";
    } else if (requested <= stock) {
        return "주문 가능";
    } else {
        return "재고 부족";
    }
}
```

요청 수량이 0일 때 어느 갈래가 먼저 선택되는지 살펴보자.
조건의 순서는 결과에 영향을 줄 수 있다.

```java
static String boxSize(int quantity) {
    return switch (quantity) {
        case 1 -> "작은 상자";
        case 2, 3 -> "중간 상자";
        default -> "큰 상자";
    };
}
```

모든 switch에서 default가 무조건 필요하다고 외우지는 않는다.
이 예에서는 범위가 넓은 int의 나머지 입력도 문자열 결과를 만들어야 하므로 필요하다.

## 반복은 갱신까지 한 흐름이다

```java
int packed = 0;
while (packed < 3) {
    packed++;
}
```

조건을 검사할 때의 값은 0, 1, 2, 3으로 바뀌고 마지막에는 본문을 실행하지 않는다.
반복 횟수와 변화가 분명하면 `for (int count = 0; count < 3; count++)`로 같은 경계를 표현할 수 있다.
조건에 영향을 주는 값이 바뀌지 않으면 끝나지 않을 수 있다.

요구사항을 입력·저장할 상태·분기 조건·결과로 나누고, 반복 뒤의 상태를 직접 표로 적어 보자.
if와 반복문을 나열하는 것보다 어느 값이 언제 변하는지 설명하는 것이 먼저다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [배열의 원소와 경계](#/learn/java/wiki-arrays)

## 공식 자료

- [Java25 javac](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
- [Java25 언어 명세](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)

## 핵심 질문 답

if는 boolean 조건의 첫 참 갈래를 고르고 switch 표현식은 처리할 입력마다 결과를 만들어야 합니다.
반복은 시작값·계속 조건·갱신을 묶어 읽고 마지막 검사가 거짓이 되는 값을 찾습니다.
입력에서 어떤 상태가 바뀌고 어떤 결과를 내는지 정하면 분기와 반복의 경계를 설명할 수 있습니다.
