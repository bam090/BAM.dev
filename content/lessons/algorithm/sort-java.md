# Java로 정렬하기: Arrays.sort·List.sort·Comparator

## 학습 목표

- `Arrays.sort`·`Collections.sort`·`List.sort`로 배열과 리스트를 정렬하고 `Comparator`로 내림차순과 여러 기준을 지정할 수 있습니다.
- 기본형 배열과 객체 정렬의 알고리즘·안정성 차이를 알고 문제에 맞는 정렬 방법을 고를 수 있습니다.

## 한줄 요약

Java는 배열을 `Arrays.sort`로 리스트를 `List.sort`로 정렬하고 정렬 기준은 `Comparator`의 `comparing`·`thenComparing`·`reversed`로 조립합니다.

## 먼저 확인할 개념

[정렬 알고리즘: 값을 순서대로 늘어놓기](#/learn/algorithm/sorting-two-pointers-sliding-window) · [ArrayList와 LinkedList](#/learn/algorithm/list-and-conditions) · [람다와 함수형 인터페이스](#/learn/java/wiki-lambdas)

## Java의 정렬 메서드란

**Java의 정렬 메서드**는 배열이나 리스트를 받아 `O(n log n)` 정렬 알고리즘으로 넘겨받은 대상 자체를 정렬해 주는 표준 라이브러리 메서드입니다.
앞 문서에서는 삽입·병합·힙·계수 정렬을 직접 구현하며 원리를 봤습니다.
코딩테스트와 실무에서는 이런 정렬을 직접 쓰지 않고 이미 검증된 표준 메서드를 부릅니다.
대신 무엇을 기준으로 정렬할지는 우리가 알려 줘야 합니다.

정렬할 대상에 따라 쓰는 메서드가 다릅니다.

| 정렬 대상 | 쓰는 메서드 |
| --- | --- |
| 배열 `int[]`·`String[]`·`Integer[]` | `Arrays.sort(배열)` |
| 리스트 `List<T>` | `Collections.sort(리스트)` 또는 `리스트.sort(기준)` |

예를 들어 코딩테스트 모의고사에 다섯 명이 참가했고 각자의 점수와 푸는 데 걸린 시간이 있다고 해 보겠습니다.
이 문서는 이 참가자 기록으로 끝까지 설명합니다.

| 이름 | 점수 | 걸린 시간(분) |
| --- | --- | --- |
| 서아 | 70 | 40 |
| 도윤 | 95 | 55 |
| 하준 | 80 | 30 |
| 민지 | 95 | 35 |
| 지우 | 70 | 50 |

최종 목표는 점수가 높은 순서로 순위를 매기고 점수가 같으면 더 빨리 푼 사람을 앞에 두는 것입니다.

## Arrays.sort 사용법

점수만 모아 `int[]`로 정렬해 보겠습니다.

```java
int[] scores = {70, 95, 80, 95, 70};
Arrays.sort(scores);
System.out.println(Arrays.toString(scores));
```

```text
[70, 70, 80, 95, 95]
```

`Arrays.sort`는 새 배열을 돌려주지 않고 넘겨받은 배열 자체를 정렬합니다.
그래서 원래 순서가 필요하면 `scores.clone()`으로 복사한 배열을 정렬합니다.

그런데 순위표는 높은 점수가 먼저여야 합니다.
`Arrays.sort`에 정렬 기준을 함께 넘기면 되지만 `int[]` 같은 기본형 배열에는 기준을 받는 `Arrays.sort`가 없습니다.
그래서 내림차순이 필요하면 `Integer[]`처럼 객체 배열로 담고 `Comparator.reverseOrder()`를 넘깁니다.

```java
Integer[] boxed = {70, 95, 80, 95, 70};
Arrays.sort(boxed, Comparator.reverseOrder());
System.out.println(Arrays.toString(boxed));
```

```text
[95, 95, 80, 70, 70]
```

`int[]`를 그대로 두고 싶다면 오름차순으로 정렬한 뒤 뒤에서부터 읽는 방법도 있습니다.

## List 정렬 사용법

리스트는 `Collections.sort`나 리스트의 `sort` 메서드로 정렬합니다.
참가자 이름을 리스트에 담아 두 방법을 모두 써 보겠습니다.

```java
List<String> names = new ArrayList<>(List.of("서아", "도윤", "하준", "민지", "지우"));
Collections.sort(names);
System.out.println(names);
names.sort(Comparator.reverseOrder());
System.out.println(names);
```

어떤 순서로 출력될지 예상해 보세요.
문자열은 사전 순서로 비교합니다.

```text
[도윤, 민지, 서아, 지우, 하준]
[하준, 지우, 서아, 민지, 도윤]
```

`Collections.sort(names)`는 문자열이 기본으로 가진 순서인 사전순으로 정렬합니다.
이렇게 값이 스스로 가진 비교 순서를 **기본 순서**라고 합니다.
`names.sort(기준)`은 넘긴 기준으로 정렬하고 기준 자리에 `null`을 넘기면 기본 순서를 씁니다.
Java 문서에 따르면 `Collections.sort`는 안에서 `List.sort`를 부르므로 두 방법의 결과는 같습니다.

`List.of(...)`로 만든 리스트는 바꿀 수 없어서 정렬하면 오류가 납니다.
그래서 `new ArrayList<>(...)`로 한 번 감싼 뒤 정렬합니다.

## Comparator 사용법

**Comparator**는 두 값을 받아 어느 쪽이 앞인지 알려 주는 정렬 기준 객체입니다.
참가자처럼 이름·점수·시간을 함께 가진 객체는 무엇으로 정렬할지 스스로 알 수 없기 때문에 `Comparator`로 기준을 알려 줍니다.

참가자 한 명은 `record`로 만듭니다.

```java
record Entry(String name, int score, int minutes) {}
```

`Comparator`는 직접 비교식을 쓰기보다 아래 메서드로 조립하는 편이 읽기 쉽고 실수도 적습니다.

| 메서드 | 만드는 기준 |
| --- | --- |
| `Comparator.comparing(Entry::name)` | 이름 오름차순 |
| `Comparator.comparingInt(Entry::score)` | 점수 오름차순 (`int` 값을 꺼낼 때) |
| `기준.reversed()` | 그 기준을 거꾸로 |
| `기준.thenComparingInt(Entry::minutes)` | 앞 기준이 같을 때만 시간으로 한 번 더 비교 |
| `Comparator.reverseOrder()` | 기본 순서의 반대 |

`Entry::score`는 참가자에서 점수를 꺼내는 메서드 참조이고 `e -> e.score()`와 같은 뜻입니다.

이제 점수가 높은 순서로 정렬해 보겠습니다.

```java
entries.sort(Comparator.comparingInt(Entry::score).reversed());
```

```text
점수 내림차순: [도윤, 민지, 하준, 서아, 지우]
```

95점인 도윤과 민지는 점수가 같습니다.
이때 둘의 순서는 원래 목록에서 도윤이 앞에 있었으므로 도윤이 먼저입니다.
`List.sort`는 기준이 같은 원소의 원래 순서를 지키는 **안정 정렬**이기 때문입니다.

> [!question]- 람다로 쓰면 reversed()에서 오류가 나는 이유는?
> `Comparator.comparingInt(e -> e.score()).reversed()`처럼 람다를 쓰면 컴파일 오류가 납니다.
> `.reversed()`가 뒤에 붙으면 Java가 `e`의 타입을 `Entry`로 추론하지 못하고 `Object`로 보기 때문입니다.
>
> `Entry::score`처럼 메서드 참조를 쓰거나 `(Entry e) -> e.score()`로 타입을 적어 주면 해결됩니다.

## 여러 기준 정렬

순위표를 완성하려면 점수가 같을 때 시간이 짧은 사람을 앞에 두어야 합니다.
`thenComparingInt`로 두 번째 기준을 이어 붙입니다.

```java
entries.sort(Comparator.comparingInt(Entry::score).reversed()
        .thenComparingInt(Entry::minutes));
```

95점 두 사람의 순서가 어떻게 바뀔지 예상해 보세요.

```text
점수 내림차순 · 시간 오름차순: [민지, 도윤, 하준, 서아, 지우]
```

![여러 기준 정렬. 원래 순서 서아·도윤·하준·민지·지우가 점수 내림차순으로 정렬되면 같은 95점인 도윤이 민지보다 먼저 오고 시간 오름차순을 더하면 35분인 민지가 55분인 도윤보다 먼저 온다.](content/assets/algorithm/sort-java-multi-key.png)

점수로 먼저 비교하고 점수가 같을 때만 시간을 비교합니다.
그래서 35분 걸린 민지가 55분 걸린 도윤보다 앞으로 왔습니다.
`reversed()`는 바로 앞까지 조립된 기준 전체를 뒤집기 때문에 점수에만 붙이려면 `thenComparing` 앞에 둡니다.

안정 정렬을 이용하면 같은 결과를 두 번의 정렬로도 만들 수 있습니다.
**덜 중요한 기준으로 먼저** 정렬하고 더 중요한 기준으로 나중에 정렬하는 것입니다.

```java
twoSteps.sort(Comparator.comparingInt(Entry::minutes));
twoSteps.sort(Comparator.comparingInt(Entry::score).reversed());
```

```text
시간순 뒤 점수순: [민지, 도윤, 하준, 서아, 지우]
```

두 번째 정렬에서 95점 두 사람은 점수가 같으므로 첫 번째 정렬의 순서인 시간순이 그대로 남습니다.
보통은 `thenComparing` 한 번으로 쓰는 편이 뜻이 분명하지만 안정 정렬이 왜 중요한지 보여 주는 예입니다.

비교식을 직접 쓸 때는 흔한 실수가 하나 있습니다.
`(a, b) -> a - b`처럼 빼기로 비교하면 값의 차이가 `int` 범위를 넘을 때 부호가 뒤집힙니다.

```java
Comparator<Integer> bySubtract = (a, b) -> a - b;
System.out.println(bySubtract.compare(2_000_000_000, -2_000_000_000));
System.out.println(Integer.compare(2_000_000_000, -2_000_000_000));
```

```text
-294967296
1
```

20억이 -20억보다 크니 양수가 나와야 하지만 빼기 결과가 넘쳐서 음수가 됐습니다.
그래서 직접 비교할 때는 `Integer.compare`를 쓰고 가능하면 `comparingInt`로 조립합니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `ContestSort.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Collections;
> import java.util.Comparator;
> import java.util.List;
>
> public class ContestSort {
>     record Entry(String name, int score, int minutes) {}
>
>     static List<String> names(List<Entry> entries) {
>         List<String> result = new ArrayList<>();
>         for (Entry e : entries) result.add(e.name());
>         return result;
>     }
>
>     public static void main(String[] args) {
>         int[] scores = {70, 95, 80, 95, 70};
>         Arrays.sort(scores);
>         System.out.println("int[] 오름차순: " + Arrays.toString(scores));
>
>         Integer[] boxed = {70, 95, 80, 95, 70};
>         Arrays.sort(boxed, Comparator.reverseOrder());
>         System.out.println("Integer[] 내림차순: " + Arrays.toString(boxed));
>
>         List<String> names = new ArrayList<>(List.of("서아", "도윤", "하준", "민지", "지우"));
>         Collections.sort(names);
>         System.out.println("이름 오름차순: " + names);
>         names.sort(Comparator.reverseOrder());
>         System.out.println("이름 내림차순: " + names);
>
>         List<Entry> entries = new ArrayList<>(List.of(
>                 new Entry("서아", 70, 40),
>                 new Entry("도윤", 95, 55),
>                 new Entry("하준", 80, 30),
>                 new Entry("민지", 95, 35),
>                 new Entry("지우", 70, 50)));
>
>         List<Entry> byScore = new ArrayList<>(entries);
>         byScore.sort(Comparator.comparingInt(Entry::score).reversed());
>         System.out.println("점수 내림차순: " + names(byScore));
>
>         List<Entry> ranking = new ArrayList<>(entries);
>         ranking.sort(Comparator.comparingInt(Entry::score).reversed()
>                 .thenComparingInt(Entry::minutes));
>         System.out.println("점수 내림차순 · 시간 오름차순: " + names(ranking));
>
>         List<Entry> twoSteps = new ArrayList<>(entries);
>         twoSteps.sort(Comparator.comparingInt(Entry::minutes));
>         twoSteps.sort(Comparator.comparingInt(Entry::score).reversed());
>         System.out.println("시간순 뒤 점수순: " + names(twoSteps));
>
>         Comparator<Integer> bySubtract = (a, b) -> a - b;
>         System.out.println("빼기 비교: " + bySubtract.compare(2_000_000_000, -2_000_000_000));
>         System.out.println("Integer.compare: " + Integer.compare(2_000_000_000, -2_000_000_000));
>     }
> }
> ```
>
> ```text
> int[] 오름차순: [70, 70, 80, 95, 95]
> Integer[] 내림차순: [95, 95, 80, 70, 70]
> 이름 오름차순: [도윤, 민지, 서아, 지우, 하준]
> 이름 내림차순: [하준, 지우, 서아, 민지, 도윤]
> 점수 내림차순: [도윤, 민지, 하준, 서아, 지우]
> 점수 내림차순 · 시간 오름차순: [민지, 도윤, 하준, 서아, 지우]
> 시간순 뒤 점수순: [민지, 도윤, 하준, 서아, 지우]
> 빼기 비교: -294967296
> Integer.compare: 1
> ```

## 정렬 메서드의 복잡도

Java 25 API 문서는 정렬 대상에 따라 다른 알고리즘을 쓴다고 설명합니다.

| 정렬 대상 | 알고리즘 (API 문서의 구현 설명) | 복잡도 | 안정 정렬 |
| --- | --- | --- | --- |
| `int[]`·`long[]`·`double[]` 같은 기본형 배열 | Dual-Pivot Quicksort | `O(n log n)` | 해당 없음 |
| `Integer[]`·`String[]` 같은 객체 배열 | 안정적이고 적응형인 반복 병합 정렬 (TimSort) | `O(n log n)` · 거의 정렬되면 약 `n`번 비교 | 예 |
| `List.sort`·`Collections.sort` | 객체 배열과 같은 병합 정렬 | `O(n log n)` | 예 |

기본형 배열은 퀵 정렬을 개선한 Dual-Pivot Quicksort를 쓰며 문서는 모든 데이터에서 `O(n log n)` 성능을 낸다고 설명합니다.
기본형 값은 같은 숫자끼리 구별할 방법이 없으니 안정성을 따질 필요가 없습니다.
반면 객체는 점수가 같아도 서로 다른 사람일 수 있기 때문에 문서가 안정 정렬을 보장합니다.
앞의 예제에서 95점인 도윤과 민지의 원래 순서가 지켜진 것도 이 보장 덕분입니다.

## 정렬 방법의 선택

그렇다면 문제를 받았을 때 어떤 형태로 정렬하면 될까요?

| 하고 싶은 일 | 쓰는 코드 |
| --- | --- |
| 숫자 배열을 오름차순으로 | `Arrays.sort(int배열)` |
| 숫자를 내림차순으로 | `Integer[]`에 `Arrays.sort(배열, Comparator.reverseOrder())` |
| 리스트를 기본 순서로 | `Collections.sort(리스트)` |
| 객체를 필드 하나로 | `리스트.sort(Comparator.comparingInt(Entry::score))` |
| 여러 기준으로 | `comparing…(첫 기준).thenComparing…(다음 기준)` |
| 배열의 일부 구간만 | `Arrays.sort(배열, 시작, 끝)` (끝은 포함하지 않음) |

정렬은 `O(n log n)`이므로 입력이 100만 개여도 시간 안에 끝납니다.
다만 반복문 안에서 매번 정렬하면 정렬 비용이 반복 횟수만큼 곱해지므로 한 번 정렬해 두고 여러 번 쓰는 방식을 먼저 생각합니다.

## 정리

- 배열은 `Arrays.sort`로 리스트는 `List.sort`나 `Collections.sort`로 정렬하며 둘 다 넘긴 대상 자체를 바꿉니다.
- 기본형 배열에는 기준을 넘길 수 없으므로 내림차순이 필요하면 `Integer[]`로 담아 `Comparator.reverseOrder()`를 씁니다.
- `Comparator`는 `comparing`·`comparingInt`로 기준을 만들고 `reversed`로 뒤집으며 `thenComparing`으로 다음 기준을 잇습니다.
- 객체 정렬은 안정 정렬이라 기준이 같은 원소는 원래 순서를 지키고 빼기 대신 `Integer.compare`로 비교합니다.

## 이어서 연습하기

[검토 요청 순서 정하기](#/coding-tests/java/bridge-srt-03)에서 두 점수로 여러 기준 정렬을 해 봅니다.
[그룹별 새 항목 수 보고하기](#/coding-tests/java/bridge-srt-06)에서 개수와 이름 두 기준으로 정렬한 뒤 처리해 봅니다.
[이분 탐색](#/learn/algorithm/binary-search)에서 정렬된 배열로 값을 빠르게 찾아봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [Java 25 API: Collections](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html)
- [Java 25 API: Comparator](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)

## 핵심 질문 답

배열은 `Arrays.sort`로 리스트는 `List.sort`나 `Collections.sort`로 정렬하고 정렬 기준은 `Comparator`로 넘깁니다.
`comparingInt`로 첫 기준을 만들고 `reversed`로 내림차순을 만든 뒤 `thenComparing`으로 기준이 같을 때의 다음 기준을 이어 붙이면 여러 기준 정렬이 됩니다.
기본형 배열은 Dual-Pivot Quicksort로 정렬되고 기준을 받지 않으므로 내림차순이 필요하면 `Integer[]`로 담습니다.
객체 배열과 리스트는 병합 정렬 계열의 안정 정렬이라 기준이 같은 원소의 원래 순서가 지켜집니다.
