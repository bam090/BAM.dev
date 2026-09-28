# 해시: 키로 바로 찾는 자료구조

## 학습 목표

- 해시 함수·버킷·충돌이 무엇인지 설명하고 해시로 찾기가 평균 `O(1)`인 이유를 말할 수 있습니다.
- 키에 값을 붙이는 Map과 중복 없이 모으는 Set을 구분하고 equals와 hashCode를 함께 맞춰야 하는 이유를 설명할 수 있습니다.

## 한줄 요약

해시는 키로 버킷 번호를 계산해 저장 위치를 바로 찾는 방법이고 이 방법으로 만든 Map은 키에 값을 붙이며 Set은 중복 없는 값을 모읍니다.

## 먼저 확인할 개념

[자료구조와 알고리즘](#/learn/algorithm/data-structures-and-algorithms) · [배열](#/learn/algorithm/array) · [equals와 hashCode: 객체의 동일성과 동등성](#/learn/java/wiki-equality-hashing)

## 해시란

**해시**는 키를 계산해서 나온 번호로 값을 저장할 칸을 정하고 찾을 때도 같은 계산으로 그 칸에 바로 가는 방법입니다.
여기서 **키**는 값을 찾을 때 쓰는 이름표이고 키로 번호를 만드는 계산을 **해시 함수**라고 합니다.
해시 함수가 만든 번호는 **해시값**이라고 하고 값을 담아 두는 칸 하나하나는 **버킷**이라고 합니다.

해시가 필요한 이유는 배열에서 값을 찾는 방법과 비교하면 보입니다.
배열은 몇 번째 칸에 있는지 모르면 처음부터 하나씩 비교해야 해서 `O(n)`이 걸립니다.
반면 해시는 키만 알면 칸 번호를 계산할 수 있어서 다른 칸을 볼 필요가 없습니다.

예를 들어 스터디 모임에서 사람마다 출석 횟수를 적어 둔다고 해 보겠습니다.
이름을 키로 삼아 보관함 번호를 계산하고 그 보관함에 출석 횟수를 넣어 두는 것입니다.
이 문서는 민지·도윤·서아·하준 네 사람의 출석 기록 하나로 끝까지 설명합니다.

## 해시 함수와 버킷

해시 함수가 이름으로 칸을 정하는 과정을 그림으로 보겠습니다.
이 문서에서는 버킷을 10개 두고 해시값을 10으로 나눈 나머지를 버킷 번호로 씁니다.

![민지라는 이름이 해시 함수를 거쳐 해시값 1543492가 되고 10으로 나눈 나머지 2가 버킷 번호가 된다. 오른쪽의 0번부터 9번까지 버킷 가운데 2번 버킷에 민지 → 3이 들어 있다.](content/assets/algorithm/hash-bucket.png)

Java에서는 모든 객체가 해시값을 돌려주는 `hashCode()` 메서드를 가지고 있습니다.
네 사람의 이름으로 해시값과 버킷 번호를 직접 구해 보겠습니다.

```java
String[] names = {"민지", "도윤", "서아", "하준"};
for (String name : names) {
    int hash = name.hashCode();
    System.out.println(name + " → 해시값 " + hash + " → " + Math.floorMod(hash, 10) + "번 버킷");
}
```

`Math.floorMod(hash, 10)`은 해시값을 10으로 나눈 나머지입니다.
해시값이 음수여도 나머지가 0부터 9 사이로 나오게 해 줍니다.

```text
민지 → 해시값 1543492 → 2번 버킷
도윤 → 해시값 1477600 → 0번 버킷
서아 → 해시값 1583016 → 6번 버킷
하준 → 해시값 1744552 → 2번 버킷
```

같은 문자열은 언제 계산해도 같은 해시값이 나옵니다.
그래서 민지의 출석 횟수를 찾을 때도 다시 계산하면 2번 버킷이 나오고 그 칸만 열어 보면 됩니다.

좋은 해시 함수는 서로 다른 키를 여러 버킷에 고르게 흩어 놓습니다.
키가 한 버킷에 몰리지 않아야 어느 칸을 열어도 비교할 항목이 적기 때문입니다.

> [!question]- Java의 HashMap도 10으로 나누나요?
> 아닙니다.
> 10으로 나누는 계산은 원리를 보여 주려고 이 문서에서 고른 방법입니다.
> Java의 `HashMap`은 해시값을 한 번 더 섞은 뒤 버킷 수에 맞춰 칸을 정하고 버킷 수도 상황에 따라 늘립니다.
> 키로 번호를 계산해 칸을 정한다는 원리는 같습니다.

그런데 출력을 다시 보면 민지와 하준이 둘 다 2번 버킷입니다.
서로 다른 키가 같은 칸을 가리키면 어떻게 해야 할까요?

## 해시 충돌

서로 다른 키가 같은 버킷을 가리키는 일을 **해시 충돌**이라고 합니다.
버킷 수는 정해져 있고 키는 훨씬 다양하므로 충돌은 피할 수 없습니다.
그래서 해시는 충돌이 생겨도 키를 구분하는 방법을 함께 가지고 있습니다.

![민지와 하준은 해시값이 다르지만 둘 다 2번 버킷이 된다. 2번 버킷에는 민지 → 3 뒤에 하준 → 5가 줄줄이 이어져 있고 0번에는 도윤 → 1 · 6번에는 서아 → 2가 있다. 같은 버킷의 항목은 equals로 이름을 비교해 찾는다.](content/assets/algorithm/hash-collision.png)

가장 많이 쓰는 방법은 같은 버킷에 들어온 항목을 줄줄이 이어 두는 **체이닝**입니다.
하준을 찾을 때는 먼저 계산으로 2번 버킷에 간 뒤 그 안에 이어진 항목을 하나씩 보며 이름이 같은지 비교합니다.
이때 두 키가 정말 같은지 판단하는 메서드가 `equals()`입니다.

정리하면 해시로 값을 찾는 과정은 두 단계입니다.

1. `hashCode()`로 해시값을 구해 버킷을 고릅니다.
2. 그 버킷 안에서 `equals()`로 같은 키를 찾습니다.

해시값은 후보가 있는 칸을 좁혀 주고 최종 확인은 `equals()`가 합니다.
그래서 해시값이 같다고 해서 같은 키라는 뜻은 아닙니다.

> [!question]- 해시값까지 완전히 같은 문자열도 있나요?
> 있습니다.
> `"Aa"`와 `"BB"`는 서로 다른 문자열인데 해시값이 둘 다 `2112`입니다.
>
> ```text
> Aa와 BB의 해시값: 2112 2112
> ```
>
> 이런 두 키도 같은 버킷에 이어 두고 `equals()`로 구분하므로 값이 섞이지 않습니다.
> 체이닝 말고 충돌이 나면 비어 있는 다른 버킷을 찾아 넣는 **개방 주소법**도 있습니다.

## 해시의 시간 복잡도

키가 버킷에 고르게 흩어져 있으면 한 버킷에 든 항목은 몇 개 되지 않습니다.
그래서 해시로 넣기·찾기·지우기는 평균 `O(1)`입니다.
사람이 네 명이든 10만 명이든 계산 한 번과 몇 번의 비교로 끝나기 때문입니다.

| 상황 | 찾기 비용 | 이유 |
| --- | --- | --- |
| 키가 고르게 흩어짐 | 평균 `O(1)` | 버킷마다 항목이 몇 개뿐입니다 |
| 모든 키가 한 버킷에 몰림 | 최악 `O(n)` | 그 버킷의 항목을 모두 비교해야 합니다 |

항목이 늘어나면 한 버킷에 이어지는 항목도 길어집니다.
그래서 Java의 `HashMap`은 기본 설정에서 항목 수가 버킷 수의 0.75배를 넘으면 버킷을 약 두 배로 늘리고 항목을 다시 나누어 담습니다.
다시 담는 순간에는 시간이 조금 더 들지만 자주 일어나지 않아서 평균은 `O(1)`로 유지됩니다.

## 해시의 종류: Map과 Set

해시를 쓰는 자료구조는 무엇을 담느냐에 따라 두 가지로 나뉩니다.
키에 값을 붙여 두는 **Map**과 값 자체를 중복 없이 모아 두는 **Set**입니다.

![왼쪽 Map은 민지 → 3회 · 도윤 → 1회 · 하준 → 5회처럼 이름마다 출석 횟수를 붙여 두고 키는 겹치지 않지만 값은 겹쳐도 된다. 오른쪽 Set은 오늘 출석한 민지와 도윤만 담고 민지를 한 번 더 넣으려 하면 이미 있어서 넣지 않는다.](content/assets/algorithm/hash-map-set.png)

| | Map | Set |
| --- | --- | --- |
| 담는 것 | 키와 값의 짝 | 값 하나 |
| 중복 | 키는 겹치지 않고 값은 겹쳐도 됩니다 | 같은 값은 한 번만 담깁니다 |
| 해시를 쓰는 곳 | 키로 버킷을 정합니다 | 값으로 버킷을 정합니다 |
| 출석 기록에서 | 이름마다 출석 횟수 | 오늘 출석한 사람의 이름 |
| Java 클래스 | `HashMap` | `HashSet` |

Set이 중복을 막을 수 있는 이유도 해시에 있습니다.
값을 넣기 전에 해당 버킷에 같은 값이 이미 있는지 `equals()`로 확인하고 있으면 넣지 않기 때문입니다.

```java
Map<String, Integer> attendance = new HashMap<>();
attendance.put("민지", 3);
attendance.put("도윤", 1);
attendance.put("서아", 2);
attendance.put("하준", 5);
System.out.println("민지 출석: " + attendance.get("민지"));
System.out.println("하준 출석: " + attendance.get("하준"));

Set<String> today = new HashSet<>();
today.add("민지");
today.add("도윤");
today.add("민지");
System.out.println("오늘 출석한 사람 수: " + today.size());
System.out.println("서아 출석: " + today.contains("서아"));
```

앞의 10칸 계산에서 민지와 하준은 같은 버킷이었습니다.
두 사람의 출석 횟수가 제대로 나올지 그리고 Set에 민지를 두 번 넣으면 몇 명이 될지 예상해 보세요.

```text
민지 출석: 3
하준 출석: 5
오늘 출석한 사람 수: 2
서아 출석: false
```

실제 `HashMap`은 10칸 계산과 다르게 칸을 정하므로 두 사람이 다른 버킷에 들어갈 수도 있습니다.
그래도 같은 버킷에 모이는 키는 `equals()`로 구분하기 때문에 어느 경우든 값이 섞이지 않습니다.
Set에는 민지를 두 번 넣었지만 한 번만 담겨서 두 명입니다.
Java에서 `HashMap`과 `HashSet`의 메서드를 쓰는 자세한 방법은 [HashMap·HashSet 쓰기](#/learn/algorithm/dictionary)에서 알아봅니다.

## equals와 hashCode의 약속

지금까지 본 과정에서 `hashCode()`는 버킷을 고르고 `equals()`는 같은 키인지 확인했습니다.
그래서 두 메서드 사이에는 꼭 지켜야 할 약속이 있습니다.
**`equals()`로 같은 두 객체는 반드시 같은 `hashCode()`를 돌려줘야 합니다.**

`String`은 이 약속을 이미 지키고 있습니다.
하지만 직접 만든 클래스를 키로 쓸 때는 두 메서드를 함께 정의해야 합니다.

```java
static class PlainMember {
    String name;

    PlainMember(String name) {
        this.name = name;
    }
}

static class Member {
    String name;

    Member(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object other) {
        if (!(other instanceof Member member)) return false;
        return name.equals(member.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
```

`PlainMember`는 두 메서드를 정의하지 않은 클래스이고 `Member`는 이름이 같으면 같은 사람으로 보도록 두 메서드를 함께 정의한 클래스입니다.
두 클래스로 이름이 민지인 객체를 두 번씩 만들어 `HashSet`에 넣어 보겠습니다.

```java
Set<PlainMember> plain = new HashSet<>();
plain.add(new PlainMember("민지"));
plain.add(new PlainMember("민지"));
System.out.println("약속 없는 클래스: " + plain.size() + "명");

Set<Member> members = new HashSet<>();
members.add(new Member("민지"));
members.add(new Member("민지"));
System.out.println("약속을 지킨 클래스: " + members.size() + "명");
```

```text
약속 없는 클래스: 2명
약속을 지킨 클래스: 1명
```

`PlainMember`는 `Object`에서 물려받은 기본 `equals()`를 씁니다.
기본 `equals()`는 이름이 같아도 따로 만든 객체면 다르다고 판단하므로 민지가 두 명으로 담깁니다.
반면 `Member`는 이름으로 버킷을 고르고 이름으로 비교하므로 두 번째 민지를 같은 사람으로 알아봅니다.

만약 `equals()`만 정의하고 `hashCode()`를 빠뜨리면 약속이 깨집니다.
같은 민지라도 해시값이 달라서 대부분 다른 버킷을 찾아가고 그 버킷에는 비교할 민지가 없기 때문입니다.
그래서 `equals()`를 정의할 때는 같은 필드로 `hashCode()`도 함께 정의합니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `HashAttendance.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.HashMap;
> import java.util.HashSet;
> import java.util.Map;
> import java.util.Objects;
> import java.util.Set;
>
> public class HashAttendance {
>     static class PlainMember {
>         String name;
>
>         PlainMember(String name) {
>             this.name = name;
>         }
>     }
>
>     static class Member {
>         String name;
>
>         Member(String name) {
>             this.name = name;
>         }
>
>         @Override
>         public boolean equals(Object other) {
>             if (!(other instanceof Member member)) return false;
>             return name.equals(member.name);
>         }
>
>         @Override
>         public int hashCode() {
>             return Objects.hash(name);
>         }
>     }
>
>     public static void main(String[] args) {
>         String[] names = {"민지", "도윤", "서아", "하준"};
>         for (String name : names) {
>             int hash = name.hashCode();
>             System.out.println(name + " → 해시값 " + hash + " → " + Math.floorMod(hash, 10) + "번 버킷");
>         }
>
>         Map<String, Integer> attendance = new HashMap<>();
>         attendance.put("민지", 3);
>         attendance.put("도윤", 1);
>         attendance.put("서아", 2);
>         attendance.put("하준", 5);
>         System.out.println("민지 출석: " + attendance.get("민지"));
>         System.out.println("하준 출석: " + attendance.get("하준"));
>
>         Set<String> today = new HashSet<>();
>         today.add("민지");
>         today.add("도윤");
>         today.add("민지");
>         System.out.println("오늘 출석한 사람 수: " + today.size());
>         System.out.println("서아 출석: " + today.contains("서아"));
>
>         System.out.println("Aa와 BB의 해시값: " + "Aa".hashCode() + " " + "BB".hashCode());
>
>         Set<PlainMember> plain = new HashSet<>();
>         plain.add(new PlainMember("민지"));
>         plain.add(new PlainMember("민지"));
>         System.out.println("약속 없는 클래스: " + plain.size() + "명");
>
>         Set<Member> members = new HashSet<>();
>         members.add(new Member("민지"));
>         members.add(new Member("민지"));
>         System.out.println("약속을 지킨 클래스: " + members.size() + "명");
>     }
> }
> ```
>
> ```text
> 민지 → 해시값 1543492 → 2번 버킷
> 도윤 → 해시값 1477600 → 0번 버킷
> 서아 → 해시값 1583016 → 6번 버킷
> 하준 → 해시값 1744552 → 2번 버킷
> 민지 출석: 3
> 하준 출석: 5
> 오늘 출석한 사람 수: 2
> 서아 출석: false
> Aa와 BB의 해시값: 2112 2112
> 약속 없는 클래스: 2명
> 약속을 지킨 클래스: 1명
> ```

## 해시의 활용

그렇다면 코딩테스트에서는 언제 해시를 떠올려야 할까요?
단서는 **이미 나왔는지**나 **몇 번 나왔는지**를 빠르게 알아야 한다는 조건입니다.

| 문제의 단서 | 쓰는 것 | 하는 일 |
| --- | --- | --- |
| 이미 본 값인지 확인해야 합니다 | Set | 본 값을 담아 두고 `contains`로 확인합니다 |
| 서로 다른 값이 몇 개인지 셉니다 | Set | 모두 넣은 뒤 크기를 봅니다 |
| 값마다 몇 번 나왔는지 셉니다 | Map | 값을 키로 두고 횟수를 값으로 둡니다 |
| 이름이나 ID로 정보를 찾아야 합니다 | Map | ID를 키로 두고 정보를 값으로 둡니다 |

이런 문제를 배열로 풀면 값마다 전체를 다시 훑어서 `O(n²)`이 되기 쉽습니다.
해시에 담아 두면 확인 한 번이 평균 `O(1)`이라서 전체가 `O(n)`으로 줄어듭니다.

다만 해시는 넣은 순서나 크기 순서를 기억하지 않습니다.
정렬된 순서나 가장 가까운 값이 필요하면 [트리로 만든 TreeMap](#/learn/algorithm/tree-java)을 씁니다.

## 정리

- 해시는 해시 함수로 키의 버킷 번호를 계산해 그 칸에 바로 가므로 넣기·찾기가 평균 `O(1)`입니다.
- 서로 다른 키가 같은 버킷을 가리키는 충돌은 같은 칸에 이어 두고 `equals()`로 구분합니다.
- Map은 키에 값을 붙이고 Set은 같은 값을 한 번만 담으며 Java에서는 `HashMap`과 `HashSet`이 해시로 만든 구현입니다.
- `equals()`로 같은 객체는 같은 `hashCode()`를 돌려줘야 하므로 두 메서드는 늘 함께 정의합니다.

## 이어서 연습하기

[HashMap·HashSet 쓰기](#/learn/algorithm/dictionary)에서 Java의 해시 메서드를 자세히 써 봅니다.
[반대 코드 짝이 처음 완성된 위치](#/coding-tests/java/bridge-hsh-01)와 [체험 보드의 서로 다른 배지 채우기](#/coding-tests/java/bridge-set-01)에서 Set으로 이미 나온 값을 확인해 봅니다.
[두 재고 목록의 남은 차이 수](#/coding-tests/java/bridge-hsh-02)에서 Map으로 횟수를 세어 봅니다.

## 공식 자료

- [Java 25 API: Object](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)
- [Java 25 API: HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
- [Java 25 API: HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html)

## 핵심 질문 답

해시는 해시 함수로 키의 해시값을 구하고 그 값으로 버킷 번호를 계산해 그 칸에 바로 갑니다.
서로 다른 키가 같은 버킷에 모이는 충돌이 생기면 같은 칸에 이어 두고 `equals()`로 키를 구분합니다.
키가 버킷에 고르게 흩어져 있으면 비교할 항목이 몇 개뿐이라 넣기와 찾기가 평균 `O(1)`입니다.
Map은 이 원리로 키에 값을 붙여 두고 Set은 값으로 버킷을 정해 같은 값이 이미 있으면 넣지 않으며 두 경우 모두 `equals()`로 같은 객체는 같은 `hashCode()`를 돌려줘야 합니다.
