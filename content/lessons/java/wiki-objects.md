# 클래스·객체·참조와 this

## 학습 목표

타입 선언과 실행 중 객체·참조 변수를 구분하고 대상 객체의 상태를 찾을 수 있습니다.

## 한줄 요약

클래스는 타입과 구현을 선언하고 인스턴스 필드와 메서드는 각 대상 객체의 상태를 다룹니다.

## 먼저 확인할 개념

[값 전달: 매개변수 재대입과 객체 변경](#/learn/java/wiki-argument-values)을 먼저 확인해 보세요.

## 타입 선언·실제 객체·참조를 구분한다

클래스는 타입과 구현의 선언이고 new로 만든 인스턴스는 실행 중 존재하는 객체다.
각 객체는 자신의 인스턴스 필드를 가지며 참조값을 다른 변수에 대입하면 새 객체가 아니라 같은 객체를 공유한다.
인스턴스 메서드의 대상은 호출할 때 점 앞의 참조로 정해지고 this는 그 대상 객체를 나타낸다.

```java
class StudySession {
    String title;
    String state = "READY";

    void start() {
        state = "RUNNING";
    }
}
```

`StudySession session;`은 변수 선언이고 `new StudySession()`은 객체를 만드는 표현식이다.

```java
StudySession first = new StudySession();
StudySession other = new StudySession();
StudySession same = first;
same.start();
```

first와 same은 같은 객체를, other는 별개의 객체를 가리킨다.
어느 참조로 읽어도 같은 객체의 state는 공유되지만 다른 객체의 state까지 바뀌지는 않는다.
참조값을 Java 코드에서 직접 계산할 수 있는 실제 주소 숫자라고 단정하지 않는다.

## 상태와 행동을 함께 둘 이유

객체별로 오래 유지할 상태와 변경 규칙이 함께 있다면 클래스의 책임으로 묶기 좋다.
입력을 받아 한 번 계산한 결과만 돌려주는 일은 작은 메서드로 충분할 수 있다.
필드와 매개변수 이름이 같다면 `this.title`과 `title`을 구별해 어느 값을 읽거나 바꾸는지 확인한다.
다음 단계에서는 생성자로 첫 상태를 준비하고 공개 행동으로만 상태를 바꾸게 만든다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [생성자와 올바른 첫 상태](#/learn/java/wiki-constructors)

## 공식 자료

- [Java25 클래스와 생성자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 유연한 생성자](https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html)
- [Java25 접근 제어](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6)

## 핵심 질문 답

클래스 선언, new로 만든 객체, 그 객체를 가리키는 참조 변수를 따로 구분합니다.
new를 두 번 실행하면 각 객체가 인스턴스 상태를 갖고 참조값만 대입하면 같은 객체를 공유합니다.
인스턴스 메서드는 호출 대상 객체의 상태를 다루며 this는 그 객체를 가리킵니다.
