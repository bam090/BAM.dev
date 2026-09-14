# final과 불변 객체

## 학습 목표

변수 재대입 금지와 객체 상태 불변을 구분할 수 있습니다.

## 한줄 요약

final은 참조의 재대입을 막으며 가리키는 객체의 변경까지 막으려면 별도의 설계가 필요합니다.

## 먼저 확인할 개념

[클래스·객체·참조와 this](#/learn/java/wiki-objects), [static과 인스턴스 멤버](#/learn/java/wiki-static-members)를 먼저 확인해 보세요.

## 재대입과 내부 변경을 구분한다

final 변수는 값이 정해진 뒤 다른 값으로 재대입할 수 없지만 final 참조가 가리키는 객체의 내부까지 자동으로 불변이 되지는 않는다.
불변 객체는 생성 뒤 관찰 가능한 상태가 바뀌지 않게 설계한 객체이며 가변 객체를 그대로 외부에 노출하는 경로도 확인해야 한다.
static final은 클래스 소속과 재대입 제한을 함께 나타내지만 모든 static final 필드가 언어 명세의 상수 변수는 아니다.

```java
final int[] progress = {40};
progress[0] = 70;
```

같은 배열의 원소는 바뀔 수 있다.
반면 `progress = new int[] {90};`은 final 변수에 새 참조를 대입하므로 허용되지 않는다.

## private final만으로 충분하지 않은 경우

```java
class Progress {
    private final int[] values = {40};

    int[] values() {
        return values;
    }
}
```

getter가 내부의 같은 배열 참조를 반환한다.
같은 패키지의 호출자가 `Progress session = new Progress();`로 객체를 만든 뒤 `session.values()[0] = 70;`을 실행하면 내부 배열의 값이 바뀐다.
참조를 재대입하지 않았다는 사실과 상태가 불변이라는 사실은 다르다.

불변 상태가 필요한지, 외부에 어떤 변경 경로를 공개하는지부터 판단한다.
값을 바꿔야 하는 객체까지 모두 불변으로 만들라는 뜻은 아니다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [equals와 hashCode: 객체의 동일성과 동등성](#/learn/java/wiki-equality-hashing)

## 공식 자료

- [Java25 패키지](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html)
- [Java25 클래스](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

## 핵심 질문 답

final은 이미 정한 변수에 다른 값을 대입하지 못하게 하지만 같은 객체의 원소나 내부 상태는 바뀔 수 있습니다.
불변 객체가 필요하다면 변경 메서드와 외부에 노출한 가변 참조까지 확인해야 합니다.
static final은 클래스 소속과 재대입 제한을 함께 표시하는 것이며 그 자체로 모든 상태를 불변으로 만들지는 않습니다.
