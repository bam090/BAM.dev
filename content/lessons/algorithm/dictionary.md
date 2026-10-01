# HashMap·HashSet 쓰기: 키로 세고 중복 막기

## 학습 목표

- `HashMap`의 put·get·getOrDefault·merge로 값을 저장하고 빈도를 셀 수 있고 없는 키와 `null` 값을 `containsKey`로 구분할 수 있습니다.
- `HashSet`의 add·contains로 중복을 확인하고 순서가 필요할 때 `LinkedHashMap`·`TreeMap`을 고를 수 있습니다.

## 한줄 요약

`HashMap`은 키로 값을 저장하고 찾는 해시 Map이고 `HashSet`은 같은 값을 한 번만 담는 해시 Set이며 둘은 빈도 세기와 중복 확인에 가장 많이 쓰입니다.

## 먼저 확인할 개념

[해시: 키로 바로 찾는 자료구조](#/learn/algorithm/hash-map-set) · [제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics)

## HashMap이란

**`HashMap`**은 키로 버킷을 정하는 해시 방식으로 `Map` 인터페이스를 구현한 Java 클래스입니다.
앞 문서에서는 이름으로 버킷 번호를 계산하고 충돌을 `equals()`로 구분하는 원리를 봤습니다.
이번에는 그 원리가 들어 있는 `HashMap`과 `HashSet`을 실제로 써 보겠습니다.

변수는 보통 `Map<String, Integer> counts = new HashMap<>();`처럼 만듭니다.
꺾쇠 안의 첫 번째 타입은 키의 타입이고 두 번째 타입은 값의 타입입니다.
`Map`은 인터페이스라서 객체는 `HashMap` 같은 구현 클래스로 만듭니다.

예를 들어 스터디 모임에서 간식 투표를 했다고 해 보겠습니다.
투표 용지 여섯 장에 붕어빵·호떡·붕어빵·군고구마·호떡·호떡이 차례로 적혀 있습니다.
이 문서는 이 투표 용지로 표를 세고 중복 투표를 막는 일을 끝까지 이어 갑니다.

## HashMap의 메서드

코딩테스트에서 자주 쓰는 `HashMap`의 메서드는 많지 않습니다.

| 메서드 | 하는 일 | 키가 없을 때 |
| --- | --- | --- |
| `put(k, v)` | 키에 값을 저장하고 같은 키가 있으면 값을 바꿉니다 | 새로 저장합니다 |
| `get(k)` | 키에 붙은 값을 돌려줍니다 | `null` |
| `getOrDefault(k, d)` | 키에 붙은 값을 돌려줍니다 | 기본값 `d` |
| `containsKey(k)` | 키가 있는지 알려 줍니다 | `false` |
| `merge(k, v, 함수)` | 키가 있으면 기존 값과 `v`를 함수로 합칩니다 | `v`를 저장합니다 |
| `remove(k)` | 키와 값을 지웁니다 | 아무 일도 하지 않고 `null` |
| `entrySet()` | 키와 값의 짝을 모두 돌려줍니다 | 해당 없음 |

`entrySet()`으로 모든 짝을 도는 일은 항목 수만큼 걸리지만 나머지 메서드는 해시로 버킷을 바로 찾기 때문에 평균 `O(1)`입니다.
이제 표를 세는 코드로 하나씩 써 보겠습니다.

## HashMap 사용법

가장 흔한 쓰임은 값마다 몇 번 나왔는지 세는 **빈도 세기**입니다.
간식 이름을 키로 두고 표 수를 값으로 둡니다.

![투표 용지 여섯 장 붕어빵·호떡·붕어빵·군고구마·호떡·호떡을 하나씩 읽으며 counts에 간식마다 표를 1씩 쌓는다. 결과는 붕어빵 2표·호떡 3표·군고구마 1표다.](content/assets/algorithm/dictionary-count.png)

```java
String[] votes = {"붕어빵", "호떡", "붕어빵", "군고구마", "호떡", "호떡"};

Map<String, Integer> counts = new HashMap<>();
for (String snack : votes) {
    counts.put(snack, counts.getOrDefault(snack, 0) + 1);
}
System.out.println("호떡: " + counts.get("호떡"));
System.out.println("붕어빵: " + counts.get("붕어빵"));
System.out.println("꿀떡: " + counts.getOrDefault("꿀떡", 0));
```

처음 나온 간식은 아직 키가 없습니다.
이때 `getOrDefault(snack, 0)`이 무엇을 돌려줄지 생각하며 출력을 예상해 보세요.

```text
호떡: 3
붕어빵: 2
꿀떡: 0
```

`getOrDefault`는 키가 없으면 기본값 `0`을 돌려줍니다.
그래서 처음 나온 간식은 `0 + 1`로 1표가 되고 다음부터는 기존 표 수에 1을 더합니다.
아무도 뽑지 않은 꿀떡도 오류 없이 `0`이 나옵니다.

같은 일을 `merge`로 한 줄에 쓸 수도 있습니다.

```java
Map<String, Integer> merged = new HashMap<>();
for (String snack : votes) {
    merged.merge(snack, 1, Integer::sum);
}
System.out.println("merge 결과: " + merged.equals(counts));
```

`merge`로 센 결과가 앞의 `counts`와 같을지 예상해 보세요.

```text
merge 결과: true
```

`merge(snack, 1, Integer::sum)`은 키가 없으면 `1`을 저장하고 키가 있으면 기존 값과 `1`을 더해서 저장하라는 뜻입니다.
`Integer::sum`은 두 정수를 더하는 메서드를 가리킵니다.
두 방법으로 센 결과가 같으므로 `true`가 나옵니다.

다 센 뒤 모든 간식의 표 수를 보려면 `entrySet()`으로 키와 값의 짝을 돌며 읽습니다.

```java
for (Map.Entry<String, Integer> entry : counts.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue() + "표");
}
```

간식이 투표 용지에 나온 순서대로 출력될지 예상해 보세요.

```text
호떡 → 3표
붕어빵 → 2표
군고구마 → 1표
```

투표 용지에는 붕어빵이 가장 먼저 나왔는데 출력은 호떡부터 시작합니다.
`HashMap`은 버킷 순서대로 돌기 때문에 넣은 순서를 지키지 않고 Java 공식 문서도 순서를 보장하지 않는다고 밝힙니다.
순서가 필요할 때 고르는 방법은 아래 순서가 필요한 Map 절에서 다룹니다.

## 없는 키와 null 값

`get()`이 `null`을 돌려주는 경우는 두 가지입니다.
키가 아예 없을 때와 키는 있는데 값으로 `null`을 저장해 두었을 때입니다.
`HashMap`은 값으로 `null`을 저장할 수 있기 때문에 이 두 경우가 섞입니다.

투표 메뉴에 호빵을 올려 두었지만 아직 표를 세지 않았다는 뜻으로 `null`을 넣어 보겠습니다.

```java
counts.put("호빵", null);
System.out.println("호빵 get: " + counts.get("호빵"));
System.out.println("꿀떡 get: " + counts.get("꿀떡"));
System.out.println("호빵 containsKey: " + counts.containsKey("호빵"));
System.out.println("꿀떡 containsKey: " + counts.containsKey("꿀떡"));
System.out.println("호빵 getOrDefault: " + counts.getOrDefault("호빵", 0));
counts.merge("호빵", 1, Integer::sum);
System.out.println("호빵 merge 뒤: " + counts.get("호빵"));
```

호빵과 꿀떡의 `get()` 결과가 어떻게 다를지 그리고 `getOrDefault("호빵", 0)`이 `0`을 돌려줄지 예상해 보세요.

```text
호빵 get: null
꿀떡 get: null
호빵 containsKey: true
꿀떡 containsKey: false
호빵 getOrDefault: null
호빵 merge 뒤: 1
```

`get()`만 보면 호빵과 꿀떡이 똑같이 `null`입니다.
둘을 구분하는 것은 키가 있는지 알려 주는 `containsKey()`입니다.

`getOrDefault`는 키가 있으면 그 값이 `null`이어도 그대로 돌려줍니다.
그래서 호빵은 기본값 `0` 대신 `null`이 나왔습니다.
이 `null`에 `+ 1`을 하면 `NullPointerException`이 나므로 값으로 `null`을 넣지 않는 편이 안전합니다.
반면 `merge`는 값이 `null`인 키를 없는 키처럼 다뤄서 `1`을 저장했습니다.

## HashSet 사용법

이번에는 한 사람이 두 번 투표하지 못하게 막아 보겠습니다.
투표한 사람의 이름만 기억하면 되므로 값이 필요 없는 `HashSet`을 씁니다.

| 메서드 | 하는 일 |
| --- | --- |
| `add(x)` | 새 값이면 넣고 `true`를 돌려주며 이미 있으면 넣지 않고 `false`를 돌려줍니다 |
| `contains(x)` | 값이 있는지 알려 줍니다 |
| `remove(x)` | 값을 지웁니다 |
| `size()` | 담긴 값의 개수를 돌려줍니다 |

```java
Set<String> voters = new HashSet<>();
System.out.println("민지 첫 투표: " + voters.add("민지"));
System.out.println("도윤 첫 투표: " + voters.add("도윤"));
System.out.println("민지 다시 투표: " + voters.add("민지"));
System.out.println("투표한 사람 수: " + voters.size());
System.out.println("서아 투표했나: " + voters.contains("서아"));
```

민지가 두 번째로 투표할 때 `add()`가 무엇을 돌려줄지 예상해 보세요.

```text
민지 첫 투표: true
도윤 첫 투표: true
민지 다시 투표: false
투표한 사람 수: 2
서아 투표했나: false
```

민지가 다시 투표하자 `add()`가 `false`를 돌려주었습니다.
그래서 `if (!voters.add(name))`처럼 쓰면 확인과 넣기를 한 번에 하면서 중복을 바로 알 수 있습니다.
`contains()`로 먼저 확인하고 `add()`를 따로 부르는 것보다 코드도 짧습니다.

## 순서가 필요한 Map

`HashMap`은 순서를 보장하지 않습니다.
출력 순서가 답에 영향을 주는 문제라면 순서를 지키는 다른 Map을 골라야 합니다.
같은 투표를 세 가지 Map에 담아 출력해 보겠습니다.

```java
Map<String, Integer> hash = new HashMap<>();
Map<String, Integer> linked = new LinkedHashMap<>();
Map<String, Integer> tree = new TreeMap<>();
for (String snack : votes) {
    hash.merge(snack, 1, Integer::sum);
    linked.merge(snack, 1, Integer::sum);
    tree.merge(snack, 1, Integer::sum);
}
System.out.println("HashMap: " + hash);
System.out.println("LinkedHashMap: " + linked);
System.out.println("TreeMap: " + tree);
```

세 Map의 출력 순서가 각각 어떻게 다를지 예상해 보세요.

```text
HashMap: {호떡=3, 붕어빵=2, 군고구마=1}
LinkedHashMap: {붕어빵=2, 호떡=3, 군고구마=1}
TreeMap: {군고구마=1, 붕어빵=2, 호떡=3}
```

![같은 투표를 세 Map에 담고 출력한 순서. HashMap은 호떡·붕어빵·군고구마로 순서를 보장하지 않고 LinkedHashMap은 처음 넣은 순서인 붕어빵·호떡·군고구마이고 TreeMap은 키의 가나다 순서인 군고구마·붕어빵·호떡이다.](content/assets/algorithm/dictionary-order.png)

`LinkedHashMap`은 키를 처음 넣은 순서를 기억합니다.
`TreeMap`은 키를 크기 순서로 정렬해 두며 문자열은 가나다 순서입니다.

| 필요한 것 | 고를 Map | 넣기·찾기 비용 |
| --- | --- | --- |
| 키로 찾기만 하면 됩니다 | `HashMap` | 평균 `O(1)` |
| 처음 넣은 순서대로 꺼내야 합니다 | `LinkedHashMap` | 평균 `O(1)` |
| 키의 정렬 순서나 가장 가까운 키가 필요합니다 | `TreeMap` | `O(log n)` |

Set도 같은 짝이 있어서 `HashSet`·`LinkedHashSet`·`TreeSet` 중에서 고릅니다.
`TreeMap`의 정렬과 가까운 값 찾기는 [TreeMap·TreeSet](#/learn/algorithm/tree-java)에서 자세히 다룹니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `SnackVote.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.HashMap;
> import java.util.HashSet;
> import java.util.LinkedHashMap;
> import java.util.Map;
> import java.util.Set;
> import java.util.TreeMap;
>
> public class SnackVote {
>     public static void main(String[] args) {
>         String[] votes = {"붕어빵", "호떡", "붕어빵", "군고구마", "호떡", "호떡"};
>
>         Map<String, Integer> counts = new HashMap<>();
>         for (String snack : votes) {
>             counts.put(snack, counts.getOrDefault(snack, 0) + 1);
>         }
>         System.out.println("호떡: " + counts.get("호떡"));
>         System.out.println("붕어빵: " + counts.get("붕어빵"));
>         System.out.println("꿀떡: " + counts.getOrDefault("꿀떡", 0));
>
>         Map<String, Integer> merged = new HashMap<>();
>         for (String snack : votes) {
>             merged.merge(snack, 1, Integer::sum);
>         }
>         System.out.println("merge 결과: " + merged.equals(counts));
>
>         for (Map.Entry<String, Integer> entry : counts.entrySet()) {
>             System.out.println(entry.getKey() + " → " + entry.getValue() + "표");
>         }
>
>         counts.put("호빵", null);
>         System.out.println("호빵 get: " + counts.get("호빵"));
>         System.out.println("꿀떡 get: " + counts.get("꿀떡"));
>         System.out.println("호빵 containsKey: " + counts.containsKey("호빵"));
>         System.out.println("꿀떡 containsKey: " + counts.containsKey("꿀떡"));
>         System.out.println("호빵 getOrDefault: " + counts.getOrDefault("호빵", 0));
>         counts.merge("호빵", 1, Integer::sum);
>         System.out.println("호빵 merge 뒤: " + counts.get("호빵"));
>
>         Set<String> voters = new HashSet<>();
>         System.out.println("민지 첫 투표: " + voters.add("민지"));
>         System.out.println("도윤 첫 투표: " + voters.add("도윤"));
>         System.out.println("민지 다시 투표: " + voters.add("민지"));
>         System.out.println("투표한 사람 수: " + voters.size());
>         System.out.println("서아 투표했나: " + voters.contains("서아"));
>
>         Map<String, Integer> hash = new HashMap<>();
>         Map<String, Integer> linked = new LinkedHashMap<>();
>         Map<String, Integer> tree = new TreeMap<>();
>         for (String snack : votes) {
>             hash.merge(snack, 1, Integer::sum);
>             linked.merge(snack, 1, Integer::sum);
>             tree.merge(snack, 1, Integer::sum);
>         }
>         System.out.println("HashMap: " + hash);
>         System.out.println("LinkedHashMap: " + linked);
>         System.out.println("TreeMap: " + tree);
>     }
> }
> ```
>
> ```text
> 호떡: 3
> 붕어빵: 2
> 꿀떡: 0
> merge 결과: true
> 호떡 → 3표
> 붕어빵 → 2표
> 군고구마 → 1표
> 호빵 get: null
> 꿀떡 get: null
> 호빵 containsKey: true
> 꿀떡 containsKey: false
> 호빵 getOrDefault: null
> 호빵 merge 뒤: 1
> 민지 첫 투표: true
> 도윤 첫 투표: true
> 민지 다시 투표: false
> 투표한 사람 수: 2
> 서아 투표했나: false
> HashMap: {호떡=3, 붕어빵=2, 군고구마=1}
> LinkedHashMap: {붕어빵=2, 호떡=3, 군고구마=1}
> TreeMap: {군고구마=1, 붕어빵=2, 호떡=3}
> ```

## 정리

- 빈도는 `getOrDefault(k, 0) + 1`이나 `merge(k, 1, Integer::sum)`으로 세고 모든 짝은 `entrySet()`으로 읽습니다.
- `get()`의 `null`만으로는 없는 키와 `null` 값을 구분할 수 없으므로 `containsKey()`로 키가 있는지 확인합니다.
- `HashSet`의 `add()`는 이미 있는 값이면 `false`를 돌려주므로 중복 확인과 넣기를 한 번에 할 수 있습니다.
- `HashMap`은 순서를 보장하지 않으므로 넣은 순서가 필요하면 `LinkedHashMap`을 쓰고 정렬 순서가 필요하면 `TreeMap`을 씁니다.

## 이어서 연습하기

[두 재고 목록의 남은 차이 수](#/coding-tests/java/bridge-hsh-02)에서 두 목록의 빈도를 세어 비교해 봅니다.
[마지막 보정값으로 기록 다시 계산하기](#/coding-tests/java/bridge-hsh-04)에서 같은 키에 새 값을 덮어쓰는 `put`을 써 봅니다.
[순환 점검 기록의 첫 오류](#/coding-tests/java/bridge-set-02)에서 `HashSet`으로 이미 나온 코드를 찾아봅니다.

## 공식 자료

- [Java 25 API: Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)
- [Java 25 API: HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
- [Java 25 API: HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html)

## 핵심 질문 답

빈도를 셀 때는 값을 키로 두고 `getOrDefault(k, 0) + 1`을 `put`하거나 `merge(k, 1, Integer::sum)`을 써서 키마다 횟수를 1씩 올립니다.
`get()`이 `null`을 돌려주면 키가 없는 것인지 값이 `null`인 것인지 알 수 없으므로 `containsKey()`로 키가 있는지 따로 확인합니다.
중복을 막을 때는 `HashSet`의 `add()`가 이미 있는 값에 `false`를 돌려주는 점을 이용해 확인과 넣기를 한 번에 합니다.
`HashMap`과 `HashSet`은 순서를 보장하지 않으므로 넣은 순서가 필요하면 `LinkedHashMap`을 쓰고 정렬 순서가 필요하면 `TreeMap`을 씁니다.
