# 람다와 함수형 인터페이스

## 학습 목표

전달할 동작의 입력·출력에 맞는 함수형 인터페이스와 람다를 읽을 수 있습니다.

## 한줄 요약

람다는 대상 함수형 인터페이스의 한 추상 메서드 계약을 채웁니다.

## 먼저 확인할 개념

[추상 클래스와 인터페이스의 역할](#/learn/java/wiki-abstract-interfaces) · [메서드 계약](#/learn/java/wiki-methods)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

TitleRule 선언은 클래스 밖이나 허용된 멤버 위치에, shortTitle을 만드는 문장은 main 같은 메서드 안에 둡니다. 아래 타입 선언과 사용 예제는 함께 읽습니다.

## 값뿐 아니라 처리 방법도 바뀔 수 있다

학습 기록 목록에서 `완료하지 않은 항목만 고르기`와 `제목만 꺼내기`를 생각해 보자.
목록은 같아도 어떤 항목을 고르고 어떤 결과로 바꿀지는 상황마다 달라진다.

Java에서는 실행할 동작을 함수형 인터페이스(functional interface) 타입으로 전달할 수 있다.
함수형 인터페이스는 람다가 채울 하나의 추상 메서드 계약을 가진 인터페이스다.

```java
@FunctionalInterface
interface TitleRule {
    boolean matches(String title);
}
```

`@FunctionalInterface`가 인터페이스를 함수형으로 만드는 것은 아니다.
조건을 만족하면 애너테이션이 없어도 람다의 대상 타입이 될 수 있지만, 애너테이션을 붙이면 추상 메서드를 잘못 추가했을 때 컴파일러가 알려 준다.

## 람다는 동작 계약을 채우는 문법이다

람다 표현식(lambda expression)은 매개변수, 화살표 `->`, 실행할 내용으로 이루어진다.

```java
TitleRule shortTitle = title -> title.length() <= 10;
```

`shortTitle`의 타입이 `TitleRule`이므로 컴파일러는 람다가 문자열 하나를 받고 `boolean`을 돌려줘야 한다는 사실을 안다.
람다는 대상 타입 없이 공중에 떠 있는 독립 함수가 아니다.

자주 쓰는 동작 모양은 `java.util.function` 패키지에 준비되어 있다.

| 함수형 인터페이스 | 동작의 모양 | 뜻 |
| --- | --- | --- |
| `Predicate<T>` | `T → boolean` | 조건에 맞는지 판단한다. |
| `Function<T, R>` | `T → R` | 값을 다른 값으로 바꾼다. |
| `Consumer<T>` | `T → 반환값 없음` | 값을 받아 사용한다. |
| `Supplier<T>` | `입력 없음 → T` | 값을 만들어 제공한다. |

기존 메서드 하나를 그대로 연결할 때는 메서드 참조(method reference)를 사용할 수 있다.
예를 들어 문자열을 받는 `text -> text.length()`는 적절한 함수형 타입 자리에서 `String::length`로 쓸 수 있다.

메서드 참조가 인수의 흐름을 더 숨긴다면 람다를 유지해도 된다.
짧은 표현보다 동작이 바로 읽히는지가 선택 기준이다.

## 반환 모양까지 맞춘다

아래 문장 예제에는 `import java.util.function.Function;`이 필요하며 main 같은 메서드 안에 둔다.

```java
Function<String, Integer> length = text -> {
    return text.length();
};
int size = length.apply("Java");
```

String을 받아 Integer로 표현할 수 있는 길이를 돌려주는 계약이다.
블록 람다는 계산식을 적기만 한다고 결과를 자동 반환하지 않는다.
반환 없는 출력은 Consumer, 입력 없이 새 값을 제공하는 동작은 Supplier처럼 호출자가 필요한 입출력 모양을 먼저 확인한다.


## 이어서 연습하기

[Stream으로 값을 고르고 바꾸어 모으기](#/learn/java/wiki-streams)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java SE 25 API — java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html)
- [Java SE 25 API — java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)
- [Java SE 25 API — java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html)

## 핵심 질문 답

전달할 동작의 입력과 반환 모양에 맞는 함수형 인터페이스를 먼저 고릅니다. 조건 판단은 Predicate, 값 변환은 Function, 반환 없는 사용은 Consumer, 입력 없이 제공하면 Supplier입니다. 람다는 대상 인터페이스의 한 추상 메서드 계약을 채우며 @FunctionalInterface는 그 조건을 검사하게 합니다. 반환이 필요한 블록 람다는 값을 return해야 합니다.
