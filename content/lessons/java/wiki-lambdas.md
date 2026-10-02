# 람다와 Stream: 동작을 전달해 값 처리하기

## 학습 목표

- 전달할 동작의 입력과 반환 모양에 맞는 함수형 인터페이스를 고르고 람다로 그 계약을 채울 수 있습니다.
- Stream의 소스·중간 연산·최종 연산을 구분해 값을 고르고 바꾸어 결과로 모을 수 있습니다.
- Stream이 원본과 바깥 상태를 바꾸지 않아야 하는 이유와 실행 순서·횟수에 기대면 안 되는 경계를 설명할 수 있습니다.

## 먼저 확인할 개념

[상속·인터페이스·조합: 타입 관계 고르기](#/learn/java/wiki-inheritance-dispatch)와 [컬렉션 선택: List·Set·Map·Deque](#/learn/java/wiki-lists)를 먼저 확인해 보세요.
[값 전달: 매개변수 재대입과 객체 변경](#/learn/java/wiki-argument-values)도 공유 객체 변경을 이해하는 데 도움이 됩니다.

## 람다란

람다 표현식(lambda expression)은 실행할 동작을 값처럼 전달하는 식이며 매개변수와 화살표 `->`와 실행할 내용으로 이루어집니다.
앞 문서에서는 실패를 다루는 방법을 보았습니다.
이번에는 목록을 처리하는 방법 자체를 바꿔 끼우는 방법을 살펴봅니다.

값은 같아도 처리 방법은 상황마다 달라집니다.
같은 학습 기록 목록에서 어떤 때는 완료하지 않은 항목만 고르고 어떤 때는 제목만 꺼내야 합니다.
Java에서는 이런 동작을 함수형 인터페이스(functional interface) 타입으로 전달합니다.
함수형 인터페이스는 람다가 채울 추상 메서드를 하나만 가진 인터페이스입니다.

예를 들어 학습 기록 목록에서 완료하지 않은 항목의 제목만 모은다고 해 보겠습니다.
이 문서는 이 목록 하나로 람다와 함수형 인터페이스와 Stream을 차례로 살펴봅니다.

## 함수형 인터페이스의 종류

먼저 직접 만든 함수형 인터페이스입니다.
타입 선언은 클래스 밖이나 멤버 위치에 두고 람다를 쓰는 문장은 `main` 같은 메서드 안에 둡니다.

```java
@FunctionalInterface
interface TitleRule {
    boolean matches(String title);
}
```

```java
TitleRule shortTitle = title -> title.length() <= 10;
```

`shortTitle`의 타입이 `TitleRule`이므로 컴파일러는 이 람다가 문자열 하나를 받아 `boolean`을 돌려줘야 한다는 것을 압니다.
이렇게 람다는 대입되는 자리의 대상 타입이 정한 계약을 채웁니다.
`@FunctionalInterface`는 인터페이스를 함수형으로 만드는 표시가 아닙니다.
조건을 만족하면 애너테이션이 없어도 람다의 대상 타입이 될 수 있습니다.
애너테이션을 붙이면 추상 메서드를 잘못 하나 더 추가했을 때 컴파일러가 알려 줍니다.

자주 쓰는 동작 모양은 `java.util.function` 패키지에 이미 있습니다.

| 함수형 인터페이스 | 동작의 모양 | 뜻 |
| --- | --- | --- |
| `Predicate<T>` | `T → boolean` | 조건에 맞는지 판단합니다 |
| `Function<T, R>` | `T → R` | 값을 다른 값으로 바꿉니다 |
| `Consumer<T>` | `T → 반환값 없음` | 값을 받아 사용합니다 |
| `Supplier<T>` | `입력 없음 → T` | 값을 만들어 제공합니다 |

그래서 문자열의 길이가 10 이하인지 판단하는 동작은 직접 만들지 않아도 `Predicate<String>`으로 전달할 수 있습니다.

## 람다 사용법

람다 본문이 여러 문장이면 중괄호로 감싼 블록 람다로 씁니다.
다음 문장에는 `import java.util.function.Function;`이 필요합니다.

```java
Function<String, Integer> length = text -> {
    return text.length();
};
int size = length.apply("Java");
```

`size`는 `4`입니다.
`Function<String, Integer>`는 문자열을 받아 `Integer`로 표현할 수 있는 값을 돌려주는 계약입니다.
블록 람다는 계산식을 적기만 해서는 결과를 반환하지 않으므로 `return`으로 값을 돌려줘야 합니다.
반환 없는 출력이면 `Consumer`를 쓰고 입력 없이 새 값을 제공하면 `Supplier`를 쓰는 것처럼 호출자가 필요한 입출력 모양을 먼저 확인합니다.

기존 메서드 하나를 그대로 연결할 때는 메서드 참조(method reference)를 쓸 수 있습니다.
예를 들어 문자열을 받는 `text -> text.length()`는 알맞은 함수형 타입 자리에서 `String::length`로 쓸 수 있습니다.
다만 메서드 참조가 인수의 흐름을 오히려 숨긴다면 람다를 그대로 둡니다.
짧은 표현보다 동작이 바로 읽히는지가 기준입니다.

이제 동작을 전달할 수 있게 되었습니다.
이 동작들을 목록의 값에 차례로 적용하는 도구가 Stream입니다.

---

## Stream 사용법

Stream은 원본의 값이 여러 처리 단계를 지나 결과가 되는 일회성 흐름입니다.
컬렉션이 데이터를 보관한다면 Stream은 그 데이터를 어떻게 처리할지 표현합니다.

```text
소스 → 중간 연산 → 최종 연산
목록 → filter → map → toList
```

| 부분 | 역할 | 예 |
| --- | --- | --- |
| 소스 | 처리할 값을 제공합니다 | `List` · 배열 |
| 중간 연산 | 값을 고르거나 바꾼 새 Stream을 돌려줍니다 | `filter` · `map` · `sorted` |
| 최종 연산 | 실제 결과를 만들거나 값을 소비합니다 | `toList` · `count` · `sum` |

중간 연산은 바로 실행되지 않을 수 있습니다.
`toList()` 같은 최종 연산이 결과를 요구할 때 소스 읽기가 시작됩니다.

이제 학습 기록 목록에서 완료하지 않은 항목의 제목만 모아 보겠습니다.

```java
import java.util.List;
import java.util.function.Predicate;

final class StudyEntry {
    private final String title;
    private final boolean completed;

    StudyEntry(String title, boolean completed) {
        this.title = title;
        this.completed = completed;
    }

    String title() {
        return title;
    }

    boolean completed() {
        return completed;
    }
}

public class StudyReport {
    public static void main(String[] args) {
        List<StudyEntry> entries = List.of(
                new StudyEntry("예외", false),
                new StudyEntry("Stream", true),
                new StudyEntry("동시성", false)
        );

        Predicate<StudyEntry> notCompleted =
                entry -> !entry.completed();

        List<String> remainingTitles = entries.stream()
                .filter(notCompleted)
                .map(StudyEntry::title)
                .toList();

        System.out.println(remainingTitles);
    }
}
```

출력이 무엇일지 예상해 보세요.

```text
[예외, 동시성]
```

`filter()`는 조건이 `true`인 항목만 통과시키고 `map()`은 항목을 제목 문자열로 바꿉니다.
`toList()`가 처리 결과를 새 목록으로 모으며 원본 `entries`는 그대로입니다.
순서가 중요합니다.
`map`으로 먼저 제목만 남기면 `filter`에 필요한 `completed` 정보가 사라지기 때문입니다.
그래서 조건에 필요한 정보가 남아 있을 때 먼저 고르고 그다음에 바꿉니다.

최종 연산을 마친 Stream은 소비된 것이므로 다시 쓰지 않습니다.
다시 처리할 때는 원본에서 새 Stream을 만듭니다.
재사용을 감지하면 `IllegalStateException`을 던질 수 있지만 모든 재사용을 같은 방식으로 감지한다는 보장은 없습니다.

---

## Stream의 원본과 공유 상태

Stream은 처리하는 동안 원본과 바깥 상태를 건드리지 않을 때 가장 안전합니다.
여기에는 서로 관련 있지만 다른 두 문제가 있습니다.

첫째는 원본 간섭입니다.
Stream의 비간섭(non-interference)은 파이프라인이 실행되는 동안 일반적인 소스를 바꾸지 않는다는 뜻입니다.
예를 들어 `filter()` 안에서 같은 원본 `ArrayList`에 값을 추가하면 예외나 잘못된 결과 또는 명세에 맞지 않는 동작이 생길 수 있습니다.

둘째는 바깥 가변 상태 변경입니다.
다음 코드는 원본 `entries`는 바꾸지 않지만 결과를 바깥의 가변 목록에 쌓습니다.

```java
java.util.ArrayList<String> result = new java.util.ArrayList<>();

entries.stream()
        .map(StudyEntry::title)
        .forEach(result::add);
```

순차 Stream에서는 원하는 대로 동작하는 것처럼 보일 수 있습니다.
그러나 병렬 처리로 바뀌면 호출 순서와 스레드가 달라질 수 있어 안전하지 않습니다.
이 목적에는 `entries.stream().map(StudyEntry::title).toList()`처럼 결과를 최종 연산에서 직접 받는 편이 분명합니다.

실행 순서와 횟수에도 기대지 않습니다.
`List`처럼 순서가 있는 소스의 Stream에는 만남 순서(encounter order)가 있습니다.
순서를 보존하는 연산으로 목록을 만들면 결과도 그 만남 순서를 따릅니다.
그러나 병렬 Stream에서 각 람다가 어느 값부터 어느 스레드에서 실행될지는 별개의 문제입니다.
그래서 결과가 원본 순서와 맞아도 중간의 출력이나 외부 상태 변경이 같은 순서로 실행된다고 기대할 수 없습니다.

또 최종 결과에 영향을 주지 않는 중간 연산은 구현이 최적화로 생략할 수 있습니다.
예를 들어 `count()`가 소스 크기를 바로 알 수 있으면 `map`이나 `peek` 안의 로그가 원소마다 실행되지 않을 수 있습니다.
그래서 중간 동작의 실행 횟수를 결과 계약으로 삼지 않습니다.

> [!note]- 병렬 Stream은 항상 더 빠른가요?
> `stream()`은 기본적으로 순차 Stream을 만들고 `parallelStream()`은 병렬 실행이 가능한 Stream을 만듭니다.
> 병렬 Stream은 데이터 크기와 작업 비용과 분할·결합 비용에 따라 오히려 느릴 수 있습니다.
> 공유 상태 문제도 없애 주지 않습니다.

## 반복문과 Stream의 선택

`고르기 → 바꾸기 → 모으기`처럼 데이터 처리 의도가 선명하면 Stream이 읽기 좋습니다.
반면 단계마다 여러 상태를 바꾸거나 여러 이유로 `break`와 `continue`가 필요한 흐름은 반복문이 더 자연스럽습니다.
Stream을 쓴 코드가 반복문보다 자동으로 빠르거나 좋은 것은 아닙니다.
같은 결과를 내는 방법 가운데 처리 의도와 변경 지점을 더 쉽게 설명할 수 있는 쪽을 고릅니다.

## 정리

- 람다는 대상 함수형 인터페이스의 추상 메서드 하나를 채우며 조건 판단에는 `Predicate`를 쓰고 값 변환에는 `Function`을 쓰는 것처럼 입출력 모양으로 인터페이스를 고릅니다.
- Stream은 소스에서 중간 연산을 거쳐 최종 연산으로 결과를 만드는 일회성 흐름이며 조건에 필요한 정보가 있을 때 `filter`하고 `map`한 뒤 `toList`로 받습니다.
- 처리 중에는 원본과 바깥 가변 상태를 바꾸지 않고 병렬 실행 순서나 중간 동작의 횟수를 결과 계약으로 삼지 않습니다.

## 이어서 연습하기

아래 객관식 문제에서 함수형 인터페이스와 Stream 연산을 고른 이유를 확인해 보세요.

다음 개념: [날짜·시점·시간량 구분하기](#/learn/java/wiki-date-time)

## 공식 자료

- [Java SE 25 API — java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html)
- [Java SE 25 API — java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)

## 핵심 질문 답

전달할 동작의 입력과 반환 모양에 맞는 함수형 인터페이스를 먼저 고릅니다.
조건 판단은 `Predicate`이고 값 변환은 `Function`이며 반환 없는 사용은 `Consumer`이고 입력 없는 제공은 `Supplier`입니다.
람다는 대상 인터페이스의 추상 메서드 하나를 채우고 `@FunctionalInterface`는 그 조건을 검사하게 하며 반환이 필요한 블록 람다는 값을 `return`해야 합니다.
값을 처리 단계로 이을 때는 조건에 필요한 정보가 남아 있을 때 `filter`하고 `map`으로 바꾼 뒤 `toList` 같은 최종 연산으로 결과를 받으며 한 번 쓴 Stream은 다시 쓰지 않습니다.
처리 중에는 소스를 바꾸거나 바깥 가변 상태에 결과를 쌓지 않고 결과에 영향 없는 중간 동작의 횟수나 병렬 실행 순서를 보장으로 여기지 않습니다.
