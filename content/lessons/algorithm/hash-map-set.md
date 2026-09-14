# 해시와 Map·Set

## 학습 목표

- 해시와 동등성 비교가 후보를 좁히고 같은 키를 구분하는 과정을 설명할 수 있습니다.
- 횟수를 저장하는 `Map`과 존재 여부를 저장하는 `Set`을 조합할 수 있습니다.
- `HashMap`·`HashSet`의 순회 순서와 평균 비용에 대한 보장 범위를 구분할 수 있습니다.

## 한줄 요약

해시는 찾을 후보를 좁히고 동등성 비교로 같은 값을 확인하며, `Map`은 키별 정보, `Set`은 중복 없는 원소를 보관합니다.

## 먼저 확인할 개념

[딕셔너리: 키로 값 저장하고 찾기](#/learn/algorithm/dictionary), [equals와 hashCode: 객체의 동일성과 동등성](#/learn/java/wiki-equality-hashing), [Set과 Map으로 중복·키 다루기](#/learn/java/wiki-sets-maps)를 먼저 확인해 보세요.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.dictionary`, `java.equality-hashing`
- 이 단원: `algo.hashing`, `algo.map-collection`, `algo.set-collection`
- 후속: `algo.heap`, `algo.priority-queue`, `algo.greedy`

## 해시는 모든 값을 비교하기 전에 후보를 좁힌다

여러 투표에서 간식별 득표 수를 매번 처음부터 세는 대신 `간식 이름 → 표 수`를 기억할 수 있습니다.
**해시 함수**는 키에서 **해시값**을 만들고, 해시 테이블은 그 값을 이용해 후보 묶음인 **버킷**을 좁힙니다.
해시값 자체가 항상 최종 저장 위치인 것은 아닙니다.

`null`이 아닌 키를 찾는 흐름을 따라가 보세요.

1. 키의 `hashCode()`로 해시코드를 얻습니다.
2. 해시코드를 이용해 키가 있을 만한 후보 버킷을 좁힙니다.
3. 후보의 키가 `equals()` 기준으로 같은지 확인합니다.
4. 같은 키를 찾으면 연결된 값을 사용합니다.

서로 다른 키가 같은 해시코드를 내거나 같은 후보 버킷에 모이는 것을 **해시 충돌**이라고 합니다.
충돌이 생겼다고 두 키가 같은 키가 되는 것은 아닙니다. 동등성 비교로 구분합니다.

## equals와 hashCode의 약속을 함께 지킨다

`a.equals(b)`가 `true`이면 두 객체의 해시코드는 반드시 같아야 합니다. 반대로 해시코드가 같다는 사실만으로 두 객체가 동등한 것은 아닙니다.
직접 만든 키의 동등성을 재정의한다면 `hashCode()`도 같은 기준을 따라야 합니다.

`Object`의 기본 `equals()`는 같은 객체를 가리키는지 판단하지만 `String`은 문자열 내용을 비교합니다.
따라서 별도로 만든 `String` 객체여도 내용이 같다면 `HashMap`의 같은 키나 `HashSet`의 같은 원소로 취급할 수 있습니다.

키로 저장한 객체의 동등성 기준을 나중에 바꾸면 조회 동작을 믿을 수 없습니다. `Map`은 키로 사용 중인 객체가 `equals()` 결과에 영향을 주도록 변경된 경우의 동작을 정해 두지 않습니다.
키나 중복 판단 원소에는 `String`처럼 바뀌지 않는 값을 사용하거나 동등성에 쓰는 필드를 변경하지 않도록 합니다.

## 횟수와 존재 여부는 다른 정보다

`Map`과 `Set`은 저장 규칙을 정한 Java 인터페이스이고, `HashMap`과 `HashSet`은 해시를 사용하는 구현체입니다. 모든 `Map`과 `Set`이 해시를 사용하는 것은 아닙니다.

| 필요한 정보 | 구조 | 이 예제에서 저장할 값 |
| --- | --- | --- |
| 간식마다 받은 표 수 | `Map<String, Integer>` | 간식 이름과 표 수 |
| 이미 투표한 사용자 | `Set<String>` | 사용자 ID |

`Set.add()`는 새 원소를 넣으면 `true`, 이미 동등한 원소가 있으면 `false`를 반환합니다. `contains()`는 존재 여부를 확인하고 `size()`는 서로 다른 원소 수를 알려 줍니다.
반복 횟수가 필요하면 `Set`만으로는 부족하고 `Map`의 값에 횟수를 보관해야 합니다.

## 중복 투표를 제외하고 표 수를 늘린다

먼저 사용자 ID를 `Set`에서 확인하고 새로운 사용자일 때만 `Map`의 표 수를 늘립니다.
아래 코드를 `SnackVoteDemo.java`에 저장할 수 있습니다. 표 수에는 `null`을 저장하지 않으며, `getOrDefault(snack, 0)`은 아직 저장하지 않은 간식의 시작값을 `0`으로 정합니다.

```java
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class SnackVoteDemo {
    public static void main(String[] args) {
        Map<String, Integer> votesBySnack = new HashMap<>();
        Set<String> votedUserIds = new HashSet<>();

        vote(votesBySnack, votedUserIds, "user-01", "호떡");
        vote(votesBySnack, votedUserIds, "user-02", "붕어빵");
        vote(votesBySnack, votedUserIds, new String("user-01"), "붕어빵");

        System.out.println("호떡: " + votesBySnack.getOrDefault("호떡", 0));
        System.out.println("붕어빵: " + votesBySnack.getOrDefault("붕어빵", 0));
        System.out.println("투표한 사용자 수: " + votedUserIds.size());
    }

    static void vote(
            Map<String, Integer> votesBySnack,
            Set<String> votedUserIds,
            String userId,
            String snack
    ) {
        if (!votedUserIds.add(userId)) {
            System.out.println(userId + ": 이미 투표했습니다.");
            return;
        }

        int currentVotes = votesBySnack.getOrDefault(snack, 0);
        votesBySnack.put(snack, currentVotes + 1);
    }
}
```

예상 출력:

```text
user-01: 이미 투표했습니다.
호떡: 1
붕어빵: 1
투표한 사용자 수: 2
```

세 번째 호출의 `new String("user-01")`은 별도 객체를 만들지만 내용은 앞의 ID와 같습니다. 이를 관찰하기 위한 예제이며 평소 문자열마다 새 객체를 만들 필요는 없습니다.
`Set.add()`가 `false`를 반환해 메서드가 끝나므로 붕어빵 표 수는 늘어나지 않습니다.
`Set`의 판단 결과가 `Map`을 갱신할지 결정한다는 순서를 확인해 보세요.

## 순회 순서와 비용에는 조건이 있다

`HashMap`과 `HashSet`은 순회 순서를 보장하지 않습니다. 지금 입력 순서처럼 보여도 같은 순서가 계속 유지된다고 가정하지 않습니다.
예제는 전체 컬렉션의 출력 순서에 기대지 않고 필요한 키와 개수만 조회합니다.
입력 순서나 정렬 순서가 결과에 필요하다면 그 순서를 보장하는 구현체를 따로 선택해야 합니다.

`HashMap`의 `get()`·`put()`, `HashSet`의 `add()`·`contains()` 같은 기본 연산은 해시가 원소를 잘 분산한다는 조건에서 보통 평균 `O(1)`로 설명합니다.
충돌이 한곳에 몰리거나 저장 공간을 늘려 재배치할 때는 작업량이 커질 수 있으므로 모든 한 번의 연산이 항상 일정한 시간이라고 단정하지 않습니다.

## 이어서 연습하기

예제의 상태를 `사용자 ID의 존재 여부`와 `간식별 표 수`로 나누어 설명해 보세요.
같은 객체인지와 같은 값인지를 다시 확인하려면 [equals와 hashCode: 객체의 동일성과 동등성](#/learn/java/wiki-equality-hashing)을 참고합니다.
다음 [힙과 그리디](#/learn/algorithm/heap-and-greedy)에서는 입력 순서가 아닌 우선순위로 다음 값을 고릅니다.

## 공식 자료

- [Java SE 25 — Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)
- [Java SE 25 — Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)
- [Java SE 25 — HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
- [Java SE 25 — HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html)

사용자 원문 「03 해시(Hash)와 Map·Set」을 바탕으로 작성했습니다. 원문·Java 25 API 확인일: 2026-09-14.

## 핵심 질문 답

해시로 후보 버킷을 좁히고 `equals()`로 같은 키나 원소인지 확인합니다. 동등한 객체는 같은 해시코드를 가져야 하지만 같은 해시코드만으로 동등성이 확정되지는 않습니다.
횟수처럼 키마다 연결할 정보가 있으면 `Map`, 이미 보았는지만 필요하면 `Set`을 선택합니다. 예제는 사용자 ID를 먼저 확인해 중복을 막고 새 투표만 표 수에 반영합니다.
`HashMap`·`HashSet`의 순회 순서는 보장되지 않으며 빠른 평균 조회에도 적절한 해시 분산과 동등성 계약이라는 조건이 있습니다.
