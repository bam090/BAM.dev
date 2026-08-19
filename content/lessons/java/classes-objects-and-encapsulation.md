# 03. 클래스·객체·생성자·캡슐화

## 학습 목표

- 클래스 선언과 `new` 표현식으로 생성된 객체를 구분할 수 있습니다.
- 필드와 메서드가 객체의 상태와 동작을 나타내는 방식을 설명할 수 있습니다.
- 생성자가 새 객체의 초기 상태를 정하는 과정을 읽을 수 있습니다.
- `private` 필드와 공개 메서드로 상태 변경 규칙을 보호할 수 있습니다.

## 먼저 관찰하기

```java
class LearningProgress {
    private final String learnerName;
    private int completedLessons;

    LearningProgress(String learnerName) {
        this.learnerName = learnerName;
        this.completedLessons = 0;
    }

    void completeOne() {
        completedLessons++;
    }

    int completedLessons() {
        return completedLessons;
    }
}
```

1. 클래스 이름, 필드, 생성자, 메서드를 각각 찾아보세요.
2. 생성자에 반환 타입이 없는 이유를 일반 메서드와 비교해 보세요.
3. 외부 코드가 `completedLessons`를 직접 음수로 바꿀 수 있나요?
4. `new LearningProgress("Bam")`에서 새로 만들어지는 것은 클래스인가요, 객체인가요?

## 클래스는 설계, 객체는 실행 중의 개별 상태

클래스 선언은 필드와 메서드, 생성자 같은 구성원을 정의합니다. 객체는 클래스 인스턴스 생성 표현식으로 만들어진 개별 인스턴스입니다.

```java
LearningProgress first = new LearningProgress("Bam");
LearningProgress second = new LearningProgress("Mina");
```

`first`와 `second`는 각각 다른 객체를 가리키는 참조 변수입니다. 같은 클래스의 설계를 따르지만 각 객체는 자신의 필드 상태를 가집니다.

클래스와 객체를 “틀과 제품”으로 비유할 수 있지만, 비유만으로는 부족합니다. 코드에서는 클래스 선언, `new` 표현식, 참조 변수, 객체의 필드와 메서드를 구체적으로 구분해야 합니다.

## 필드와 메서드로 책임 묶기

필드는 객체가 기억할 상태를, 메서드는 그 상태를 사용하거나 바꾸는 동작을 나타냅니다.

```java
class Counter {
    private int value;

    void increase() {
        value++;
    }

    int value() {
        return value;
    }
}
```

상태를 바꾸는 규칙을 `increase()` 안에 두면 호출자는 증가 방식보다 “무엇을 요청하는가”에 집중할 수 있습니다.

## 생성자로 유효한 시작 상태 만들기

생성자 이름은 클래스의 단순 이름과 같고 반환 타입을 적지 않습니다. 객체 생성 시 전달된 인수는 생성자 매개변수에 연결됩니다.

```java
class Course {
    private final String title;
    private final int totalLessons;

    Course(String title, int totalLessons) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("과정 이름이 필요합니다.");
        }
        if (totalLessons <= 0) {
            throw new IllegalArgumentException("교안 수는 양수여야 합니다.");
        }
        this.title = title;
        this.totalLessons = totalLessons;
    }
}
```

생성자에서 유효성 규칙을 확인하면 잘못된 시작 상태의 객체가 이후 코드로 퍼지는 것을 막을 수 있습니다. `this.title`은 현재 객체의 필드이고, 오른쪽 `title`은 생성자 매개변수입니다.

## 캡슐화는 변경 규칙 보호하기

`private` 필드는 해당 최상위 클래스의 본문 범위에서만 직접 접근할 수 있습니다. 캡슐화의 목적은 모든 필드에 단순 getter와 setter를 붙이는 것이 아니라, 객체가 지켜야 할 규칙을 공개 메서드 뒤에 두는 것입니다.

```java
class Wallet {
    private int balance;

    Wallet(int initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("초기 잔액은 음수일 수 없습니다.");
        }
        balance = initialBalance;
    }

    boolean spend(int amount) {
        if (amount <= 0 || amount > balance) {
            return false;
        }
        balance -= amount;
        return true;
    }

    int balance() {
        return balance;
    }
}
```

`setBalance(-100)`처럼 임의 상태를 허용하는 setter 대신 `spend()`가 금액과 잔액 규칙을 함께 지킵니다.

## 최소 구현

완료 수가 전체 교안 수를 넘지 않게 하는 메서드를 구현해 보세요.

```java
class StudyPlan {
    private final int totalLessons;
    private int completedLessons;

    StudyPlan(int totalLessons) {
        if (totalLessons <= 0) {
            throw new IllegalArgumentException("전체 교안 수는 양수여야 합니다.");
        }
        this.totalLessons = totalLessons;
    }

    boolean completeNext() {
        if (completedLessons >= totalLessons) {
            return false;
        }
        completedLessons++;
        return true;
    }
}
```

실행 전에 다음을 설명하세요.

1. 새 객체의 `completedLessons`는 어떤 초기값에서 시작하는가?
2. 이미 모두 완료했다면 어느 분기가 상태 변경을 막는가?
3. 외부 코드가 필드를 직접 바꾸지 못하는 이유는 무엇인가?

## 흔한 실수

- 생성자에 `void`를 붙이면 생성자가 아니라 같은 이름의 메서드가 됩니다.
- 매개변수와 필드 이름이 같을 때 `this.field`를 생략하면 의도한 필드 대입이 되지 않을 수 있습니다.
- 모든 필드를 공개하면 객체가 지켜야 할 조건을 우회할 수 있습니다.
- 참조 변수를 복사하면 객체 전체가 자동 복제되는 것이 아니라 같은 객체를 가리킬 수 있습니다.

## 확인 문제

1. 클래스 선언과 객체를 각각 코드의 어느 부분에서 확인할 수 있나요?
2. 생성자와 일반 메서드의 선언 형태에서 가장 눈에 띄는 차이는 무엇인가요?
3. `private` 필드가 상태 규칙을 보호하는 데 어떻게 도움이 되나요?
4. 단순 setter 대신 의도를 드러내는 `spend()`를 둔 이유를 설명해 보세요.
5. `StudyPlan.completeNext()`가 `boolean`을 반환하면 호출자는 어떤 정보를 얻나요?

## 공식 근거 자료

- [Java Language Specification SE 25 §8: 클래스](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java Language Specification SE 25 §8.2: 클래스 구성원](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.2)
- [Java Language Specification SE 25 §8.8: 생성자 선언](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8)
- [Java Language Specification SE 25 §15.9: 클래스 인스턴스 생성](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9)
