# Stream으로 값을 고르고 바꾸어 모으기

## 학습 목표

Stream 처리 순서와 원본·공유 상태 경계를 구분해 필요한 결과를 만들 수 있습니다.

## 한줄 요약

Stream은 소스에서 필요한 값을 처리해 결과를 만드는 일회성 흐름이며 저장소나 공유 상태 변경 도구가 아닙니다.

## 먼저 확인할 개념

[람다와 함수형 인터페이스](#/learn/java/wiki-lambdas) · [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists) · [매개변수와 객체 변경](#/learn/java/wiki-argument-values)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## Stream은 데이터를 보관하지 않는다

Stream은 목록을 담아 두는 새 상자가 아니라, 원본의 값이 여러 처리 단계를 지나 결과가 되는 통로다.
컬렉션이 데이터를 보관한다면 Stream은 그 데이터를 어떻게 처리할지 표현한다.

```text
소스 → 중간 연산 → 최종 연산
목록 → filter → map → toList
```

| 부분 | 역할 | 예 |
| --- | --- | --- |
| 소스 | 처리할 값을 제공한다. | `List`, 배열 |
| 중간 연산 | 값을 고르거나 바꾼 새 Stream을 돌려준다. | `filter`, `map`, `sorted` |
| 최종 연산 | 실제 결과를 만들거나 값을 소비한다. | `toList`, `count`, `sum` |

중간 연산은 지연될 수 있으며, `toList()` 같은 최종 연산이 결과를 요구할 때 소스 읽기가 시작된다.
최종 연산을 마친 Stream은 소비된 것이므로 다시 쓰지 않고 원본에서 새 Stream을 만든다.

## 학습 기록을 고르고 제목으로 바꾼다

다음 예제는 완료하지 않은 기록만 고른 뒤 제목 목록으로 바꾼다.

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

코드의 흐름으로 예상하는 결과는 다음과 같다.

```text
[예외, 동시성]
```

`filter()`는 조건이 `true`인 항목만 통과시키고, `map()`은 항목을 제목 문자열로 바꾼다.
`toList()`가 처리 결과를 새 목록으로 모으며 원본 `entries`의 구조는 그대로다.

## 원본 간섭과 공유 상태 변경을 나눈다

Stream의 비간섭(non-interference)은 파이프라인이 실행되는 동안 일반적인 소스를 바꾸지 않는다는 뜻이다.
예를 들어 `filter()` 안에서 같은 원본 `ArrayList`에 값을 추가하면 예외, 잘못된 결과 또는 명세에 맞지 않는 동작이 생길 수 있다.

또 다른 문제는 람다가 바깥의 바뀔 수 있는 상태에 의존하거나 그 상태를 변경하는 것이다.

```java
java.util.ArrayList<String> result = new java.util.ArrayList<>();

entries.stream()
        .map(StudyEntry::title)
        .forEach(result::add);
```

이 코드는 원본 `entries`를 바꾸지는 않지만, 결과를 바깥의 가변 목록에 몰래 쌓는다.
특히 병렬 처리에서는 호출 순서와 스레드가 달라질 수 있어 안전하지 않다.

이 목적에는 `entries.stream().map(StudyEntry::title).toList()`처럼 결과를 최종 연산에서 직접 받는 편이 분명하다.
소스를 바꾸는 비간섭 문제와 다른 공유 가변 상태를 읽고 쓰는 문제는 서로 관련되어 있지만 같은 뜻은 아니다.

## 만남 순서와 실제 처리 순서는 다르다

`List`처럼 순서가 있는 소스의 Stream에는 만남 순서(encounter order)가 있다.
순서를 보존하는 연산으로 목록을 만들면 결과도 그 만남 순서를 따른다.

그러나 병렬 Stream에서 각 람다가 실제로 어느 값부터, 어느 스레드에서 실행될지는 별도 문제다.
결과가 원본 순서와 맞아도 중간의 출력이나 외부 상태 변경이 같은 순서로 실행된다고 기대해서는 안 된다.

`stream()`은 기본적으로 순차 Stream을 만들고 `parallelStream()`은 병렬 실행이 가능한 Stream을 만든다.
병렬 Stream은 데이터 크기, 작업 비용, 분할과 결합 비용에 따라 더 느릴 수 있으며 공유 상태 문제도 없애 주지 않는다.

## 반복문과 Stream 가운데 무엇을 고를까

`고르기 → 바꾸기 → 모으기`처럼 데이터 처리 의도가 선명하면 Stream이 읽기 좋다.
여러 상태를 단계마다 바꾸거나 여러 이유로 `break`와 `continue`가 필요한 흐름은 반복문이 더 자연스러울 수 있다.

Stream을 쓴 코드가 반복문보다 자동으로 빠르거나 좋은 것은 아니다.
같은 결과를 내는 방법 가운데 처리 의도와 변경 지점을 더 쉽게 설명할 수 있는 쪽을 고른다.

## 중간 동작의 횟수를 결과 계약으로 삼지 않는다

최종 결과에 영향을 주지 않는 중간 연산은 구현이 최적화로 생략할 수 있다.
예를 들어 count가 소스 크기를 바로 알아낼 수 있으면 map이나 peek 안의 로그가 모든 원소마다 실행된다고 기대해서는 안 된다.
사용한 Stream은 다시 쓰지 않는다. 재사용을 감지하면 IllegalStateException을 던질 수 있지만 모든 재사용을 반드시 같은 방식으로 감지한다는 보장으로 읽지 않는다.
다시 처리할 때는 원본에서 새 Stream을 만든다.


## 이어서 연습하기

[날짜·시점·시간량 구분하기](#/learn/java/wiki-date-time)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java SE 25 API — java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html)
- [Java SE 25 API — java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)
- [Java SE 25 API — java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html)

## 핵심 질문 답

조건에 필요한 정보가 남아 있을 때 filter한 뒤 map으로 필요한 값으로 바꾸고 toList 같은 최종 연산으로 결과를 받습니다. Stream은 저장소가 아니며 한 번 사용한 흐름을 재사용하지 않습니다. 결과에 영향 없는 중간 행동은 생략될 수 있어 로그 횟수를 보장으로 쓰지 않습니다. 소스 변경과 바깥 가변 상태 누적을 피하고, 병렬 처리의 실행 순서·성능이 자동 보장된다고 생각하지 않습니다.
