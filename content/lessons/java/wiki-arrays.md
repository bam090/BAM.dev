# 배열의 원소와 경계

## 학습 목표

배열 생성·유효 인덱스·행별 길이를 구분해 원소에 접근할 수 있습니다.

## 한줄 요약

배열은 고정 길이 객체이며 배열 안의 각 배열은 서로 다른 길이를 가질 수 있습니다.

## 먼저 확인할 개념

[타입과 변수의 값](#/learn/java/wiki-types-variables), [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow)을 먼저 확인해 보세요.

## 배열 생성과 유효한 위치를 구분한다

배열 변수 선언만으로 배열 객체가 만들어지지는 않으며, 배열은 생성 뒤 길이가 바뀌지 않는 객체다.
유효한 인덱스는 0부터 length-1까지이고 원소 변경과 배열 길이 변경은 다른 일이다.
다차원 배열은 배열을 원소로 담으므로 각 행의 길이가 서로 다를 수 있다.

```java
int[] scores;
scores = new int[] {70, 80, 90};
scores[1] = 85;
int count = scores.length;
```

선언과 동시에 초기화할 때는 `int[] scores = {70, 80, 90};`처럼 적을 수 있다.
선언이 끝난 뒤에는 중괄호만 대입하지 않고 `new int[]`로 배열을 만든다.
배열의 길이는 메서드가 아닌 length 필드이므로 괄호를 붙이지 않는다.
음수나 length 이상의 인덱스를 사용하면 실행 중 범위를 벗어난 접근 예외가 발생한다.

## 현재 행의 길이를 사용한다

```java
int[][] weekly = {{70, 80}, {90}, {60, 75, 85}};
for (int[] day : weekly) {
    for (int score : day) {
        System.out.println(score);
    }
}
```

바깥 길이와 각 행의 길이를 따로 세어 보자.
인덱스 반복을 쓴다면 첫 행 길이가 아니라 현재 행의 length를 검사한다.
이 예에서는 모든 행이 실제 배열이며, null인 행까지 자동으로 읽을 수 있는 것은 아니다.
더 긴 배열이 필요하면 새 배열을 만들고 값을 옮긴다.
Java 코드가 특정한 물리 메모리 배치를 보장한다고 설명하지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [문자열의 값과 조립](#/learn/java/wiki-strings)

## 공식 자료

- [Java25 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)
- [Java25 메서드 호출](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)
- [Java25 String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)

## 핵심 질문 답

변수만 선언했는지 배열 객체까지 만들었는지 구분하고 인덱스가 0 이상 length 미만인지 확인합니다.
배열 길이는 고정이지만 원소는 바꿀 수 있고, 더 긴 배열은 새로 만들어야 합니다.
배열 안의 배열은 행마다 길이가 다를 수 있으므로 현재 행의 길이를 사용합니다.
