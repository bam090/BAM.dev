# 메서드의 입력·출력 계약

## 학습 목표

메서드 선언과 호출의 입력·반환 타입을 대조해 계약이 맞는지 확인할 수 있습니다.

## 한줄 요약

메서드는 받은 값과 돌려줄 값의 타입을 선언하며 호출 선택은 인수와 매개변수 구성에 따릅니다.

## 먼저 확인할 개념

[배열의 원소와 경계](#/learn/java/wiki-arrays), [문자열의 값과 조립](#/learn/java/wiki-strings)을 먼저 확인해 보세요.

## 선언과 호출의 계약을 대조한다

매개변수는 전달받은 값을 담는 변수이고 인수는 호출할 때 보내는 값이나 표현식이다.
반환 타입은 호출한 곳에 돌려줄 값의 타입이며 void가 아닌 메서드는 정상 종료하는 경로에서 그 타입과 맞는 값을 반환해야 한다.
오버로딩은 매개변수 타입·개수·순서가 다른 같은 이름의 메서드를 제공하며 반환 타입이나 매개변수 이름만으로는 구분하지 못한다.

```java
static String makeLabel(int score) {
    return score + "점";
}

String message = makeLabel(80);
```

입력은 int이고 결과는 문자열 연결로 만든 String이다.
본문을 그대로 두고 반환 타입을 int로 적으면 선언과 return 표현식의 타입이 맞지 않는다.
강제 형 변환부터 붙이지 말고 문장을 반환하려는지 숫자를 반환하려는지 요구사항부터 확인한다.

void는 아무 일도 하지 않는다는 뜻이 아니라 호출 결과로 받을 값이 없다는 뜻이다.
return은 결과를 돌려주고 현재 메서드를 끝낸다.

## 입력 모양이 달라졌을 때

```java
static int add(int left, int right) {
    return left + right;
}

static double add(double left, double right) {
    return left + right;
}
```

각 호출의 인수 타입과 매개변수 구성을 대조해 보자.
서로 관련 없는 일을 같은 이름으로 숨기기 위한 기능은 아니다.
실제 객체가 어떤 재정의 메서드를 실행하는 오버라이딩은 뒤 문서에서 구분한다.

## 사용할 수 있는 이름의 범위

매개변수는 메서드 본문에서, if 블록 안에 선언한 지역 변수는 그 블록 범위에서 사용할 수 있다.
블록 밖에서 필요한 결과라면 바깥에 결과 변수를 선언하고 모든 필요한 경로에서 값을 정한다.
스코프는 이름을 사용할 수 있는 코드 영역이며 객체가 메모리에서 사라지는 시각을 뜻하지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [값 전달: 매개변수 재대입과 객체 변경](#/learn/java/wiki-argument-values)

## 공식 자료

- [Java25 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)
- [Java25 메서드 호출](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)
- [Java25 String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)

## 핵심 질문 답

선언한 매개변수 타입과 실제 인수, 반환 타입과 return 표현식의 타입을 차례로 대조합니다.
void는 결과값이 없고 그 밖의 메서드는 정상 종료 경로에서 맞는 값을 반환해야 합니다.
오버로딩은 매개변수 구성으로 구분하므로 이름이나 반환 타입만 바꾸지 않으며 사용하는 변수의 스코프도 확인합니다.
