# 값 전달: 매개변수 재대입과 객체 변경

## 학습 목표

호출 뒤 바뀌는 값이 매개변수인지 공유된 객체 내용인지 구분할 수 있습니다.

## 한줄 요약

Java는 참조값도 복사해 전달하므로 매개변수 재대입과 같은 객체의 변경은 호출자에게 다르게 보입니다.

## 먼저 확인할 개념

[메서드의 입력·출력 계약](#/learn/java/wiki-methods), [배열의 원소와 경계](#/learn/java/wiki-arrays)을 먼저 확인해 보세요.

## 매개변수에 복사되는 값을 따라간다

Java는 기본형 값과 참조값 모두 복사해서 새 매개변수에 전달한다.
복사된 참조로 같은 객체의 내용을 바꾸면 호출한 쪽에서도 보이지만 매개변수에 다른 참조를 대입해도 호출자의 변수는 재대입되지 않는다.
따라서 기본형은 값 전달이고 참조형은 참조 전달이라고 나누지 않는다.

```java
static void addBonus(int score) {
    score += 10;
}

static void changeFirst(int[] scores) {
    scores[0] = 100;
}

static void replace(int[] scores) {
    scores = new int[] {0};
}
```

호출 코드는 다음과 같다고 하자.

```java
int score = 70;
int[] scores = {70, 80};
addBonus(score);
changeFirst(scores);
replace(scores);
```

addBonus는 복사된 숫자만 바꾸므로 호출자의 score는 70이다.
changeFirst는 같은 배열의 첫 원소를 바꾸므로 호출자의 배열에서 100이 보인다.
replace는 자기 매개변수만 새 배열을 가리키게 하므로 호출자의 배열은 그대로다.

## 이름과 객체를 따로 그린다

호출자 변수, 매개변수, 배열 객체를 각각 그린 뒤 대입과 원소 변경 화살표를 구분해 보자.
changeFirst의 예제는 배열이 null이 아니고 원소가 하나 이상 있다는 조건이 필요하다.
메서드에 참조를 보낸다고 객체 전체가 복제되거나 모든 입력이 안전해지는 것은 아니다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [클래스·객체·참조와 this](#/learn/java/wiki-objects)

## 공식 자료

- [Java25 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)
- [Java25 메서드 호출](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)
- [Java25 String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)

## 핵심 질문 답

Java는 인수의 값 자체를 새 매개변수에 복사하며 참조 타입이면 참조값을 복사합니다.
복사한 참조로 같은 배열의 원소를 바꾸면 호출한 쪽에서도 보입니다.
매개변수에 새 숫자나 새 객체 참조를 대입하는 것만으로 호출한 쪽 변수가 재대입되지는 않습니다.
