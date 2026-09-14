# 문자열의 값과 조립

## 학습 목표

String 반환값과 StringBuilder 변경을 구분하고 문자열 내용을 비교할 수 있습니다.

## 한줄 요약

String은 불변이므로 결과를 받아 쓰고 여러 단계의 조립에는 같은 빌더를 바꾸는 방법을 검토합니다.

## 먼저 확인할 개념

[타입과 변수의 값](#/learn/java/wiki-types-variables), [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow)을 먼저 확인해 보세요.

## 원본 문자열과 연산 결과를 구분한다

String 객체의 내용은 불변이므로 concat 같은 연산의 결과를 사용하려면 반환값을 받아야 한다.
StringBuilder의 append는 같은 빌더의 내용을 바꾸고 toString은 현재 내용을 나타내는 String을 만든다.
짧은 문자열 연결은 +로 읽기 쉽게 적고 여러 단계로 조립해야 할 때 StringBuilder를 검토한다.

```java
String title = "Java";
String fullTitle = title.concat(" 입문");
```

title이 가리키는 문자열은 그대로이고 fullTitle이 연결 결과를 받는다.
title 변수에 새 문자열을 다시 대입하는 것과 기존 String 객체를 바꾸는 것을 구분한다.

```java
String first = new String("완료");
String second = new String("완료");
boolean sameObject = first == second;
boolean sameText = first.equals(second);
```

두 번 new로 만든 객체는 다르지만 같은 문자 순서의 내용을 가진다.
문자열 리터럴의 ==가 우연히 true인 사례를 내용 비교 규칙으로 사용하지 않는다.
String.length()는 UTF-16 코드 단위 수이며 눈에 보이는 글자 수와 다를 수 있다.

## 여러 단계의 조립은 변경 대상을 찾는다

```java
StringBuilder builder = new StringBuilder();
for (int number = 1; number <= 3; number++) {
    if (number > 1) {
        builder.append(", ");
    }
    builder.append(number).append("장");
}
String result = builder.toString();
```

반복에서 같은 builder가 어떻게 바뀌고 마지막 String은 언제 만들어지는지 설명해 보자.
StringBuilder가 모든 코드에서 더 빠르다는 뜻은 아니다.

숫자 문자열을 계산할 값으로 바꿀 때는 `Integer.parseInt("25")`, 숫자를 문자열로 표현할 때는 `String.valueOf(25)`를 쓸 수 있다.
정수로 읽을 수 없는 문자열을 parseInt에 전달하면 NumberFormatException이 발생하므로 입력 조건을 먼저 확인한다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [메서드의 입력·출력 계약](#/learn/java/wiki-methods)

## 공식 자료

- [Java25 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)
- [Java25 메서드 호출](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)
- [Java25 String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)

## 핵심 질문 답

String 객체의 내용은 바뀌지 않으므로 concat 등의 반환값을 받아 사용하고 내용을 비교할 때는 equals를 씁니다.
짧은 연결에는 +를, 여러 번 조립할 때는 같은 내용을 변경하는 StringBuilder를 검토합니다.
append와 toString의 변경·반환을 구분하며 length는 UTF-16 단위라는 점과 숫자 변환 입력 조건도 확인합니다.
