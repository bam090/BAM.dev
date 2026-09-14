# equals와 hashCode: 객체의 동일성과 동등성

## 학습 목표

참조 동일성과 논리적 같음을 구분하고 동등성·해시 계약을 함께 지킬 수 있습니다.

## 한줄 요약

equals로 같은 값인 객체는 같은 해시코드를 가져야 하지만 같은 해시코드가 같은 값을 뜻하지는 않습니다.

## 먼저 확인할 개념

[문자열의 값과 조립](#/learn/java/wiki-strings), [final과 불변 객체](#/learn/java/wiki-final-immutability)을 먼저 확인해 보세요.

## 동일성과 동등성의 계약을 나눈다

참조형의 ==는 같은 객체를 가리키는지 보고 Object.equals의 기본 구현도 필드 내용을 자동 비교하지 않는다.
서로 다른 객체를 같은 값으로 취급하려면 equals를 그 기준으로 재정의하고 같은 값인 객체가 같은 hashCode를 반환하게 해야 한다.
해시코드가 같아도 equals가 true라는 뜻은 아니며 서로 다른 값의 해시 충돌이 가능하다.

```java
final class CourseId {
    private final String value;

    CourseId(String value) {
        if (value == null) {
            throw new IllegalArgumentException("ID가 필요합니다.");
        }
        this.value = value;
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof CourseId id && value.equals(id.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
```

같은 문자열을 넣고 두 번 new로 만든 CourseId는 서로 다른 객체지만 위 equals로는 같은 값이다.
어느 필드가 동등성에 쓰이는지, hashCode도 같은 기준을 쓰는지 확인해 보자.

## 해시 기반 보관에서 필요한 약속

equals는 자기 자신과 같음, 대칭성, 추이성, 비교 정보가 같은 동안 일관성, null과 같지 않음을 지켜야 한다.
HashSet과 HashMap은 해시로 후보를 좁히고 동등성도 확인하므로 equals만 바꾸면 보관·조회 계약을 어길 수 있다.
해시 기반 컬렉션에 넣은 뒤 비교에 쓰는 필드가 바뀌지 않게 설계하는 편이 안전하다.
해시가 같다는 한 사실만으로 중복을 확정하지 않는다.

## 이어서 연습하기

아래 객관식 문제에서 선택의 이유를 확인해 보세요.

다음 개념: [상속과 실제 객체의 메서드](#/learn/java/wiki-inheritance-dispatch)

## 공식 자료

- [Java25 패키지](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html)
- [Java25 클래스](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html)
- [Java25 Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

## 핵심 질문 답

같은 객체인지 볼 때는 ==를, 프로그램에서 같은 값으로 볼 기준은 equals로 판단합니다.
equals로 같은 값이면 반드시 같은 hashCode를 반환해야 하지만 같은 해시라는 이유만으로 같은 값은 아닙니다.
동등성 계약을 함께 지키고 해시 기반 보관 중 비교에 쓰는 상태가 바뀌는 경계도 확인합니다.
