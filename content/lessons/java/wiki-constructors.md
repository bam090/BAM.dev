# 생성자와 올바른 첫 상태

## 학습 목표

생성자와 위임으로 초기 조건을 지키고 Java 25의 초기 구성 제한을 구분할 수 있습니다.

## 한줄 요약

생성자는 첫 상태를 준비하며 Java 25의 위임 전 인수 검사는 생성 중인 객체의 자유로운 사용을 허용하지 않습니다.

## 먼저 확인할 개념

[클래스·객체·참조와 this](#/learn/java/wiki-objects), [메서드의 입력·출력 계약](#/learn/java/wiki-methods)을 먼저 확인해 보세요.

## 생성자가 지킬 첫 조건을 정한다

생성자는 클래스와 이름이 같고 반환 타입을 쓰지 않으며 객체의 첫 상태를 준비한다.
생성자를 하나도 선언하지 않았을 때만 기본 생성자가 암시적으로 선언되므로 매개변수 생성자를 추가한 뒤 인수 없는 생성자를 자동으로 기대하지 않는다.
Java 25에서는 this나 super의 명시적 생성자 호출 앞에서 인수를 검사할 수 있지만 생성 중인 객체의 필드를 읽거나 인스턴스 메서드를 자유롭게 호출할 수는 없다.

```java
class StudySession {
    private final String title;
    private final String state;

    StudySession(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목이 필요합니다.");
        }
        this(title, "READY");
    }

    private StudySession(String title, String state) {
        this.title = title;
        this.state = state;
    }
}
```

이 예제는 Java 25의 정식 유연한 생성자 본문을 사용하며 preview 옵션을 전제로 하지 않는다.
빈 제목을 받은 객체가 완성되기 전에 검사하고, 통과한 매개변수를 다른 생성자에 전달한다.
`void StudySession(...)`처럼 void를 적으면 생성자가 아니라 일반 메서드다.

## 위임 전과 후의 경계를 읽는다

this(...)는 같은 클래스의 다른 생성자에, super(...)는 직접 상위 클래스 생성자에 초기화를 맡긴다.
명시적 위임 호출은 한 생성자 본문에 최대 하나다.
호출 인수와 그 앞 문장들이 early construction context에 속한다.

입문 예제에서는 매개변수와 지역값으로 인수를 준비하고 위임받은 생성자에서 필드를 초기화하면 흐름이 단순하다.
Java 25가 현재 클래스 필드의 제한된 초기 대입을 허용하는 경우까지 모두 금지한 것은 아니다.
그러나 필드를 읽어 계산하거나 현재 객체의 메서드를 호출하는 것과는 다르다.
필요 없는 경우까지 생성자 앞 준비 코드를 늘리지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [상태 규칙을 지키는 캡슐화](#/learn/java/wiki-encapsulation)

## 공식 자료

- [Java25 클래스와 생성자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 유연한 생성자](https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html)
- [Java25 접근 제어](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6)

## 핵심 질문 답

생성자로 객체가 지킬 첫 상태를 만들고 잘못된 입력을 객체가 완성되기 전에 검사합니다.
Java 25에서는 위임 호출 앞에 인수 검사·계산을 둘 수 있지만 현재 객체의 필드를 읽거나 인스턴스 메서드를 자유롭게 호출할 수는 없습니다.
제한된 초기 필드 대입의 허용과 읽기·호출을 구분하고, 필요한 경우에만 유연한 본문을 사용합니다.
