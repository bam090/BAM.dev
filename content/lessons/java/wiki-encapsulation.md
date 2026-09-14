# 상태 규칙을 지키는 캡슐화

## 학습 목표

객체가 허용한 행동을 통해서만 상태가 바뀌도록 책임을 모을 수 있습니다.

## 한줄 요약

private 필드와 의미 있는 공개 행동이 함께 있어야 상태 변경 규칙을 객체 안에서 지킬 수 있습니다.

## 먼저 확인할 개념

[생성자와 올바른 첫 상태](#/learn/java/wiki-constructors), [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow)을 먼저 확인해 보세요.

## 허용한 행동으로 상태를 바꾼다

캡슐화는 내부 상태를 감추고 객체가 허용한 행동으로만 상태 변경을 요청하게 만드는 설계다.
private 필드에 아무 값이나 넣는 setter를 다시 제공하면 상태 규칙을 지킨다고 볼 수 없다.
메서드가 현재 상태를 검사하고 허용된 변경만 수행해야 규칙이 여러 호출 코드에 흩어지지 않는다.

```java
class StudySession {
    private String state = "READY";

    public boolean start() {
        if (!state.equals("READY")) {
            return false;
        }
        state = "RUNNING";
        return true;
    }

    public boolean complete() {
        if (!state.equals("RUNNING")) {
            return false;
        }
        state = "DONE";
        return true;
    }

    public String state() {
        return state;
    }
}
```

처음 만든 객체에 complete부터 요청하면 어느 값이 반환되고 상태는 바뀌는지 살펴보자.
행동이 허용되지 않을 때 상태를 그대로 두는 것도 객체가 지킬 약속이다.

## 접근 범위와 규칙은 함께 필요하다

private 멤버는 그 멤버를 선언한 최상위 클래스 본문 안에서 접근할 수 있으며 중첩 타입도 그 안에 포함된다.
public 멤버도 선언을 가진 타입 자체에 접근할 수 있어야 사용할 수 있다.
접근 제어자는 사용할 코드의 범위를 정할 뿐 원하는 상태 순서를 자동으로 검증하지 않는다.
생성자는 올바른 첫 상태를, 공개 행동은 이후 변경 규칙을 맡도록 나눈다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [패키지와 접근 범위](#/learn/java/wiki-packages-access)

## 공식 자료

- [Java25 클래스와 생성자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 유연한 생성자](https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html)
- [Java25 접근 제어](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6)

## 핵심 질문 답

private은 외부의 직접 접근을 막지만 제한 없는 setter가 있으면 상태 규칙을 우회할 수 있습니다.
start와 complete처럼 의미 있는 행동을 공개하고 현재 상태에서 허용된 변경인지 객체가 검사해야 합니다.
생성자가 첫 조건을, 공개 행동이 이후 변경 규칙을 책임지도록 모읍니다.
