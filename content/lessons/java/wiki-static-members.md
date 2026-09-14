# static과 인스턴스 멤버

## 학습 목표

객체별 상태와 클래스 공유 상태를 나누고 static 메서드의 대상 객체 유무를 설명할 수 있습니다.

## 한줄 요약

인스턴스 멤버는 객체마다 존재하고 static 멤버는 클래스에 속하지만 접근 권한은 별도입니다.

## 먼저 확인할 개념

[클래스·객체·참조와 this](#/learn/java/wiki-objects), [패키지와 접근 범위](#/learn/java/wiki-packages-access)을 먼저 확인해 보세요.

## 값의 소속과 호출 대상을 찾는다

인스턴스 필드는 객체마다 따로 존재하고 static 필드는 클래스에 속한다.
static 메서드에는 현재 대상 객체가 없으므로 this를 사용할 수 없고 객체 상태가 필요하면 참조를 명시적으로 받아야 한다.
static은 소속을 정하는 말이며 public처럼 접근 권한을 정하거나 객체를 자동 생성하는 말이 아니다.

```java
class Course {
    private static int createdCount;
    private String title;

    Course(String title) {
        this.title = title;
        createdCount++;
    }

    static int createdCount() {
        return createdCount;
    }

    String title() {
        return title;
    }
}
```

단일 스레드에서 새 과정 두 개를 만든다면 각 객체의 title과 공유 createdCount를 따로 추적해 보자.
정적 메서드는 `Course.createdCount()`처럼 클래스 이름으로 부르면 소속이 드러난다.

## 공유해야 할 이유가 있는가

과정마다 다른 제목을 static으로 만들면 모든 과정이 같은 저장 공간을 보게 된다.
공유가 필요 없는 가변 상태를 편의를 위해 static으로 두지 않는다.
여러 스레드가 카운트를 함께 바꾸는 안전성은 별도의 동시성 문제이며 static이 자동으로 보호하지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [final과 불변 객체](#/learn/java/wiki-final-immutability)

## 공식 자료

- [Java25 패키지](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html)
- [Java25 클래스](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

## 핵심 질문 답

객체마다 다른 상태는 인스턴스 필드에 두고 클래스 전체가 공유할 이유가 있는 값은 static을 검토합니다.
static 메서드에는 현재 객체인 this가 없으므로 객체 상태가 필요하면 참조를 받아 사용합니다.
소속과 접근 권한은 별개이며 공유 가변 상태의 안전성까지 자동으로 보장하지 않습니다.
