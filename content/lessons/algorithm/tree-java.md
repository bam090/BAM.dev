# Java에서 트리 활용하기: TreeMap·TreeSet

## 학습 목표

- 정렬된 순서나 가까운 값 조회가 필요할 때 TreeMap·TreeSet을 골라 쓸 수 있습니다.

## 한줄 요약

TreeMap과 TreeSet은 Java가 제공하는 이진 탐색 트리이고 값을 항상 크기 순서로 정렬해 둡니다.

## 먼저 확인할 개념

[트리: 부모와 자식으로 이어진 구조](#/learn/algorithm/tree-basics) · [HashMap·HashSet 쓰기](#/learn/algorithm/dictionary)

## TreeMap이란

**TreeMap**은 이진 탐색 트리로 만든 Java의 Map이고 키를 항상 작은 순서로 정렬해 둡니다.

앞 문서에서는 `Node`를 직접 만들어 트리를 연결했습니다.
하지만 트리 구조 자체를 다루는 문제가 아니라면 이렇게 직접 만들 일은 많지 않습니다.
Java에는 트리로 만든 `TreeMap`과 `TreeSet`이 이미 준비되어 있기 때문입니다.

`TreeMap`은 `HashMap`처럼 키와 값을 짝지어 저장합니다.
다른 점은 정의에서 말한 대로 키가 늘 작은 순서로 정렬되어 있다는 것입니다.
이진 탐색 트리는 왼쪽에 작은 값을 두고 오른쪽에 큰 값을 두기 때문에 왼쪽부터 읽기만 해도 정렬된 순서가 나옵니다.

그런데 값을 넣는 순서에 따라 트리가 한쪽으로만 길게 기울 수도 있습니다.
그러면 찾을 때 내려가야 하는 층이 늘어나 느려집니다.
그래서 `TreeMap`은 값을 넣거나 뺄 때 필요하면 스스로 균형을 다시 맞추는 레드-블랙 트리를 사용합니다.

![왼쪽은 14·9·11을 넣은 순서대로 매달아 한쪽으로 기운 트리이고 오른쪽은 TreeMap이 균형을 맞춰 11을 루트로 두고 왼쪽에 9 오른쪽에 14를 둔 트리. 아래에 작은 순서로 읽으면 9·11·14라고 적혀 있다.](content/assets/algorithm/treemap-balance.png)

아래 예제에서 `14`·`9`·`11` 순서로 넣으면 `TreeMap`은 가운데 값인 `11`을 루트로 올려 양쪽의 높이를 맞춥니다.
모양이 바뀌어도 왼쪽부터 읽으면 여전히 `9 → 11 → 14`로 정렬되어 있습니다.

`TreeSet`은 값 없이 키만 저장하는 `TreeMap`이라고 생각하면 됩니다.
정렬된 값의 모음만 필요할 때 씁니다.

## TreeMap의 메서드

정렬되어 있다는 점을 제대로 활용하는 것이 `TreeMap`의 메서드입니다.
크게 가장 작은 값이나 가까운 값을 찾는 메서드와 일부 범위만 잘라 내는 메서드로 나뉩니다.

| 메서드 | 돌려주는 것 |
| --- | --- |
| `firstKey()` · `lastKey()` | 가장 작은 키 · 가장 큰 키 |
| `ceilingKey(k)` | `k`와 같거나 큰 키 중 가장 작은 키 |
| `floorKey(k)` | `k`와 같거나 작은 키 중 가장 큰 키 |
| `headMap(k)` | `k`보다 작은 키만 모은 Map |
| `tailMap(k)` | `k`와 같거나 큰 키만 모은 Map |

`TreeSet`도 같은 역할의 메서드를 `first()`·`ceiling()`·`floor()`·`headSet()`처럼 이름만 바꿔서 제공합니다.

## TreeMap 사용법

회의실 예약을 시작 시각으로 저장하는 장면을 예로 들어 보겠습니다.
키는 시작 시각이고 값은 예약 이름입니다.

```java
TreeMap<Integer, String> reservations = new TreeMap<>();
reservations.put(14, "스터디");
reservations.put(9, "면접 연습");
reservations.put(11, "코드 리뷰");

System.out.println(reservations);
```

`14`·`9`·`11` 순서로 넣었습니다.
어떤 순서로 출력될지 예상해 보세요.

```text
{9=면접 연습, 11=코드 리뷰, 14=스터디}
```

넣은 순서와 관계없이 키가 작은 순서로 정렬되어 있습니다.
이제 표의 메서드로 예약을 찾아보겠습니다.

```java
System.out.println(reservations.firstKey());
System.out.println(reservations.ceilingKey(10));
System.out.println(reservations.floorKey(13));
System.out.println(reservations.headMap(12));
```

```text
9
11
11
{9=면접 연습, 11=코드 리뷰}
```

`firstKey()`는 가장 이른 예약인 9시를 돌려줍니다.
`ceilingKey(10)`은 10시 또는 그 뒤의 첫 예약인 11시를 돌려줍니다.
`floorKey(13)`은 13시 또는 그 전의 마지막 예약인 11시를 돌려줍니다.
`headMap(12)`는 12시 전의 예약만 잘라서 보여 줍니다.

조건에 맞는 키가 없으면 `null`이 돌아옵니다.
15시 이후에는 예약이 없으므로 `ceilingKey(15)`는 `null`입니다.
결과를 `int` 변수에 바로 담으면 오류가 나므로 `null`인지 먼저 확인합니다.

> [!note]- 전체 코드 보기
> 위 예제를 하나로 합친 프로그램입니다.
> `ReservationTreeMap.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.TreeMap;
>
> public class ReservationTreeMap {
>     public static void main(String[] args) {
>         TreeMap<Integer, String> reservations = new TreeMap<>();
>         reservations.put(14, "스터디");
>         reservations.put(9, "면접 연습");
>         reservations.put(11, "코드 리뷰");
>
>         System.out.println(reservations);
>         System.out.println(reservations.firstKey());
>         System.out.println(reservations.ceilingKey(10));
>         System.out.println(reservations.floorKey(13));
>         System.out.println(reservations.headMap(12));
>         System.out.println(reservations.ceilingKey(15));
>     }
> }
> ```
>
> ```text
> {9=면접 연습, 11=코드 리뷰, 14=스터디}
> 9
> 11
> 11
> {9=면접 연습, 11=코드 리뷰}
> null
> ```

## TreeMap의 활용

`TreeMap`과 `HashMap` 중 무엇을 쓸지는 순서가 필요한지로 정합니다.

| 필요한 것 | 고를 자료구조 |
| --- | --- |
| 키로 값을 찾기만 하면 됩니다 | `HashMap` |
| 정렬된 순서로 꺼내거나 가장 작은·큰 값을 찾습니다 | `TreeMap` |
| 어떤 값에 가장 가까운 값이나 범위를 찾습니다 | `TreeMap` |

`HashMap`은 키 순서를 보장하지 않습니다.
그래서 "10시 또는 그 뒤의 첫 예약"을 찾으려면 모든 키를 하나씩 확인해야 합니다.
`TreeMap`은 트리의 높이만큼만 내려가서 찾으므로 데이터가 많아도 빠르게 찾습니다.

예약 시간표·점수 순위·가격대별 상품 목록처럼 순서와 범위가 중요한 곳에서 `TreeMap`과 `TreeSet`을 씁니다.
단순히 키로 찾기만 한다면 평균적으로 더 빠른 `HashMap`이 낫습니다.

## 정리

- `TreeMap`·`TreeSet`은 균형을 맞추는 이진 탐색 트리라서 값을 항상 정렬해 둡니다.
- 가장 작은·큰 값은 `firstKey()`·`lastKey()`로 찾고 가까운 값은 `ceilingKey()`·`floorKey()`로 찾습니다.
- 순서나 범위가 필요하면 `TreeMap`을 쓰고 키로 찾기만 하면 `HashMap`을 씁니다.

## 이어서 연습하기

[가장 가까운 예약 시각 찾기](#/coding-tests/java/algo-tree-map-01)에서 `TreeSet`의 `floor`·`ceiling`으로 가장 가까운 값을 직접 찾아봅니다.
[우선순위 큐와 힙](#/learn/algorithm/priority-queue-heap)에서 트리 모양을 이용해 가장 급한 값부터 꺼내는 자료구조를 알아봅니다.

## 공식 자료

- [Java 25 API: TreeMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html)
- [Java 25 API: TreeSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html)

## 핵심 질문 답

`TreeMap`과 `TreeSet`은 균형 이진 탐색 트리라서 값을 항상 크기 순서로 정렬해 둡니다.
그래서 가장 작은 값이나 어떤 값에 가장 가까운 값을 트리의 높이만큼만 내려가서 찾습니다.
정렬된 순서나 범위 조회가 필요하면 `TreeMap`·`TreeSet`을 쓰고 키로 찾기만 하면 `HashMap`을 씁니다.
