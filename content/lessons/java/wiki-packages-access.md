# 패키지와 접근 범위

## 학습 목표

패키지 이름과 접근 제어를 구분해 다른 코드에서 사용할 수 있는 멤버를 판단할 수 있습니다.

## 한줄 요약

패키지는 이름·접근 경계이며 import는 이름을 줄여 쓸 뿐 접근 권한을 늘리지 않습니다.

## 먼저 확인할 개념

[상태 규칙을 지키는 캡슐화](#/learn/java/wiki-encapsulation)을 먼저 확인해 보세요.

## 이름을 줄이는 일과 접근 권한을 나눈다

패키지는 관련 타입의 이름과 접근 경계를 만들며 import는 전체 타입 이름을 짧게 적도록 도울 뿐 접근 권한을 주지 않는다.
최상위 클래스는 public 또는 package 접근으로 선언하고 멤버의 private·protected 규칙과 구분한다.
private 멤버에는 그 멤버를 선언한 최상위 클래스 본문 안의 중첩 타입도 접근할 수 있다.

다음은 `bamdev/course/Course.java`에 두는 일반적인 프로젝트 파일 예다.

```java
package bamdev.course;

public class Course {
    private String title;

    String internalTitle() {
        return title;
    }

    public String displayTitle() {
        return title;
    }
}
```

전체 이름은 bamdev.course.Course다.
다른 패키지에서 이 타입을 import해도 접근 제어자가 없는 internalTitle은 공개되지 않는다.
폴더를 맞추는 것은 일반적인 파일 구성 규칙이며 패키지 자체를 단순 폴더 이름으로만 이해하지 않는다.

## 멤버를 사용할 수 있는 범위

| 접근 수준 | 범위 |
| --- | --- |
| private | 선언을 가진 최상위 클래스 본문 안 |
| 제어자 없음 | 같은 패키지 |
| protected | 같은 패키지, 다른 패키지에서는 하위 클래스 코드와 대상에 추가 조건 |
| public | 선언한 타입에도 접근 가능할 때 외부 공개 |

표는 멤버 접근의 큰 그림이며 멤버를 가진 타입에 접근할 수 있다는 전제가 있다.
특히 protected를 아무 하위 클래스에서 아무 상위 객체의 멤버나 읽을 수 있다는 뜻으로 넓히지 않는다.
먼저 실제 패키지와 선언한 타입·멤버의 접근 수준을 표시한 뒤 호출 위치를 확인해 보자.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [static과 인스턴스 멤버](#/learn/java/wiki-static-members)

## 공식 자료

- [Java25 패키지](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html)
- [Java25 클래스](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

## 핵심 질문 답

import는 긴 타입 이름을 짧게 적게 할 뿐 멤버의 접근 권한을 늘리지 않습니다.
호출 위치의 패키지, 타입 자체의 접근 가능 여부, 멤버의 접근 수준을 차례로 확인합니다.
최상위 타입과 멤버의 규칙은 다르며 private의 중첩 타입 범위와 protected의 추가 조건도 구분합니다.
