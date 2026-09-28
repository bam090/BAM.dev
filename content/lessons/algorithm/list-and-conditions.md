# ArrayList와 LinkedList: 같은 목록을 만드는 두 방법

## 학습 목표

- `ArrayList`와 `LinkedList`의 내부 구조와 연산별 복잡도를 비교하고 상황에 맞는 구현을 고를 수 있습니다.
- 반복문과 조건문으로 목록에서 조건에 맞는 값만 골라 새 목록에 담을 수 있습니다.

## 한줄 요약

`ArrayList`는 내부 배열을 써서 번호로 꺼내기가 빠르고 `LinkedList`는 노드를 이어 써서 맨 앞에 넣고 빼기가 빠르며 보통은 `ArrayList`를 고릅니다.

## 먼저 확인할 개념

[배열: 번호로 바로 꺼내는 자료구조](#/learn/algorithm/array) · [코드에서 시간 복잡도 계산하기](#/learn/algorithm/time-complexity-in-code) · [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists)

## List란

**List**는 순서가 있는 목록에서 쓸 기능을 정해 둔 Java의 인터페이스입니다.
앞 문서에서는 만들 때 길이가 정해지는 배열을 봤습니다.
그런데 몇 개를 담을지 미리 모르거나 실행 중에 값을 넣고 빼야 할 때는 길이가 고정된 배열이 불편합니다.
그래서 Java는 크기가 알아서 늘고 주는 목록을 `List`로 제공합니다.

`List`는 인터페이스라서 `new List<>()`처럼 바로 만들 수는 없습니다.
실제로는 `List`의 규칙을 따르는 구현 클래스로 객체를 만듭니다.
대표적인 구현이 `ArrayList`와 `LinkedList`입니다.

```text
List<E>            목록의 공통 기능을 정한 인터페이스
├─ ArrayList<E>    내부 배열에 값을 담는 구현
└─ LinkedList<E>   값을 담은 노드를 앞뒤로 이어 담는 구현
```

두 구현은 `add()`·`get()`·`remove()` 같은 메서드를 똑같이 제공합니다.
하지만 값을 담는 방식이 달라서 같은 메서드라도 걸리는 시간이 다릅니다.
이 문서는 스터디 점수 기록 하나로 두 구현을 나란히 비교합니다.

## List 사용법

점수를 차례로 넣고 맨 앞에 점수 하나를 끼운 뒤 꺼내고 지워 보겠습니다.
같은 메서드를 `ArrayList`와 `LinkedList`에 똑같이 실행합니다.

```java
static void run(List<Integer> scores) {
    scores.add(72);
    scores.add(91);
    scores.add(84);
    scores.add(0, 65);
    System.out.println("목록: " + scores);
    System.out.println("get(2): " + scores.get(2));
    System.out.println("contains(84): " + scores.contains(84));
    scores.remove(0);
    System.out.println("remove(0) 뒤: " + scores);
}
```

`run(new ArrayList<>())`와 `run(new LinkedList<>())`의 출력이 같을지 다를지 먼저 예상해 보세요.

```text
[ArrayList]
목록: [65, 72, 91, 84]
get(2): 91
contains(84): true
remove(0) 뒤: [72, 91, 84]
[LinkedList]
목록: [65, 72, 91, 84]
get(2): 91
contains(84): true
remove(0) 뒤: [72, 91, 84]
```

두 구현의 결과는 한 글자도 다르지 않습니다.
매개변수를 `List<Integer>`로 받았기 때문에 어느 구현을 넘겨도 같은 코드가 그대로 동작합니다.
`add(0, 65)`는 0번 자리에 끼워 넣고 `remove(0)`은 0번 자리의 값을 지웁니다.

타입 인수에는 기본형 `int`를 쓸 수 없어서 `List<int>`가 아니라 `List<Integer>`로 씁니다.

> [!question]- remove(1)과 remove(Integer.valueOf(72))의 차이
> `List<Integer>`에는 `remove()`가 두 가지 있습니다.
> `remove(1)`처럼 `int`를 넘기면 1번 **자리**의 값을 지웁니다.
> `remove(Integer.valueOf(72))`처럼 `Integer` 객체를 넘기면 값이 72인 첫 **원소**를 지웁니다.
>
> ```java
> List<Integer> scores = new ArrayList<>(List.of(72, 91, 65));
> scores.remove(1);
> System.out.println(scores);
> scores.remove(Integer.valueOf(72));
> System.out.println(scores);
> ```
>
> ```text
> [72, 65]
> [65]
> ```

결과가 같다면 왜 구현이 두 가지나 있을까요?
답은 두 구현이 값을 안에 담는 방식에 있습니다.

## ArrayList와 LinkedList의 내부 구조

같은 목록 `[65, 72, 91, 84]`를 두 구현은 이렇게 담습니다.

![왼쪽 ArrayList는 칸이 여섯 개인 내부 배열의 0번부터 3번 칸에 65·72·91·84를 담고 뒤의 두 칸은 여유 칸으로 비워 둔다. 오른쪽 LinkedList는 65·72·91·84를 담은 노드 네 개가 앞뒤 화살표로 이어져 있고 맨 앞이 first이고 맨 뒤가 last다.](content/assets/algorithm/list-structure.png)

**ArrayList**는 이름 그대로 안에 배열을 하나 두고 그 배열에 값을 차례로 담습니다.
실제로 담긴 원소 수를 **크기**(`size()`)라고 하고 내부 배열이 다시 만들지 않고 담을 수 있는 칸 수를 **용량**이라고 합니다.
그림에서 크기는 4이고 뒤의 여유 칸 두 개까지 합친 용량은 6입니다.

**LinkedList**는 값 하나를 **노드**라는 작은 상자에 담고 노드끼리 앞뒤로 이어 붙입니다.
노드는 자기 값과 함께 앞 노드와 뒤 노드가 어디 있는지 기억합니다.
목록은 맨 앞 노드(`first`)와 맨 뒤 노드(`last`)만 알고 있고 나머지는 연결을 따라가서 찾습니다.

### ArrayList의 용량 증가

`ArrayList`도 결국 배열을 쓰는데 어떻게 크기가 늘어날까요?
앞 문서에서 본 것처럼 배열은 칸을 늘릴 수 없으니 더 큰 배열을 새로 만들어 옮깁니다.

![ArrayList의 내부 배열 네 칸이 65·72·91·84로 가득 찬 상태에서 add(58)을 하면 더 큰 새 배열을 만들어 네 값을 모두 복사하고 비어 있는 다음 칸에 58을 넣는다. 새 배열에는 여유 칸이 남는다.](content/assets/algorithm/list-grow.png)

이 복사는 `n`개를 모두 옮기므로 `O(n)`입니다.
하지만 새 배열은 여유 칸을 넉넉히 두고 만들기 때문에 복사는 칸이 모자랄 때만 가끔 일어납니다.
그래서 Java 문서는 `add()`로 끝에 넣는 일을 **평균적으로 상수 시간**이라고 설명하고 `n`개를 넣는 데 전체 `O(n)`이 걸린다고 적습니다.
정확히 몇 배로 키우는지는 명세에 정해져 있지 않습니다.

## 연산별 복잡도 비교

내부 구조가 다르면 같은 메서드도 하는 일이 달라집니다.
앞의 예제에서 쓴 `get(2)`와 `add(0, 65)`를 두 구현에서 나란히 보겠습니다.

![get(2)에서 ArrayList는 2번 칸으로 바로 가고 LinkedList는 first부터 연결을 두 번 따라가 91에 닿는다. 맨 앞에 65를 넣는 add에서 ArrayList는 72·91·84를 뒤쪽부터 한 칸씩 옮긴 뒤 0번 칸에 65를 넣고 LinkedList는 새 노드 65를 만들어 72 앞에 초록색 연결만 이어 준다.](content/assets/algorithm/list-get-add.png)

`get(2)`에서 `ArrayList`는 배열처럼 번호로 바로 갑니다.
반면 `LinkedList`는 번호를 계산할 방법이 없어서 연결을 한 칸씩 따라 걸어가야 합니다.
Java의 `LinkedList`는 앞과 뒤 중 가까운 쪽에서 출발하지만 그래도 걸어야 하는 칸 수는 `n`에 비례합니다.

`add(0, 65)`는 반대입니다.
`ArrayList`는 0번 칸을 비우려고 모든 원소를 한 칸씩 뒤로 옮깁니다.
`LinkedList`는 새 노드를 만들어 맨 앞 노드와 연결만 이어 주면 끝나므로 원소 수와 관계없이 빠릅니다.

두 구현의 연산별 복잡도를 모으면 다음과 같습니다.

| 연산 | `ArrayList` | `LinkedList` | 차이가 나는 이유 |
| --- | --- | --- | --- |
| `get(i)` | `O(1)` | `O(n)` | 번호로 바로 가는지 연결을 따라 걷는지 |
| `add(x)` 맨 끝에 넣기 | 평균 `O(1)` | `O(1)` | 둘 다 끝을 바로 압니다 |
| `add(0, x)` 맨 앞에 넣기 | `O(n)` | `O(1)` | 원소를 옮기는지 연결만 바꾸는지 |
| `remove(0)` 맨 앞 빼기 | `O(n)` | `O(1)` | 원소를 당기는지 연결만 바꾸는지 |
| `add(i, x)`·`remove(i)` 중간 | `O(n)` | `O(n)` | 옮기거나 그 자리까지 걸어가야 합니다 |
| `contains(x)` | `O(n)` | `O(n)` | 둘 다 처음부터 하나씩 비교합니다 |

마지막 두 줄을 눈여겨보세요.
`LinkedList`가 연결만 바꾸면 된다고 해서 중간에 넣기가 늘 빠른 것은 아닙니다.
넣을 자리를 찾으려면 먼저 그 자리까지 걸어가야 하기 때문입니다.

## ArrayList와 LinkedList의 선택

그렇다면 실제로는 어떤 구현을 골라야 할까요?
기준은 목록을 주로 어떻게 쓰는지입니다.

| 주로 하는 일 | 고를 구현 |
| --- | --- |
| 번호로 읽기·끝에 넣기·처음부터 끝까지 훑기 | `ArrayList` |
| 목록 맨 앞에서 자주 넣고 빼기 | `LinkedList` 또는 `ArrayDeque` |
| 어느 쪽인지 잘 모르겠음 | `ArrayList` |

코딩테스트와 실무에서 목록은 대부분 번호로 읽고 끝에 넣고 처음부터 훑는 용도입니다.
그래서 특별한 이유가 없으면 `ArrayList`를 씁니다.

맨 앞에서 넣고 빼는 일이 잦다면 그것은 대개 먼저 온 것부터 꺼내는 큐입니다.
Java 문서는 큐로 쓸 때 `ArrayDeque`가 `LinkedList`보다 빠를 가능성이 높다고 안내합니다.
큐를 Java로 쓰는 방법은 [큐 활용 문서](#/learn/algorithm/queue-java)에서 다룹니다.

## 조건에 맞는 값 골라 담기

이제 목록을 가장 자주 쓰는 모습을 보겠습니다.
점수 기록에서 80점 이상인 점수만 골라 새 목록에 담는 일입니다.
반복문으로 점수를 하나씩 읽고 조건문으로 담을지 말지를 고릅니다.

```java
static List<Integer> passed(List<Integer> scores, int minimum) {
    List<Integer> result = new ArrayList<>();
    for (int score : scores) {
        if (score >= minimum) {
            result.add(score);
        }
    }
    return result;
}
```

기록이 `[72, 91, 65, 84, 58]`일 때 `passed(scores, 80)`의 결과와 호출 뒤의 원래 목록을 예상해 보세요.

```text
80점 이상: [91, 84]
원래 목록: [72, 91, 65, 84, 58]
```

`for`는 목록을 앞에서부터 한 번씩 읽는 일을 맡고 `if`는 지금 읽은 점수를 담을지 고르는 일을 맡습니다.
그래서 결과에는 읽은 순서대로 `91`과 `84`만 들어갑니다.
원래 목록은 읽기만 했으니 그대로 남아 있습니다.
목록을 한 번 훑고 끝에 넣기만 하므로 전체 `O(n)`입니다.

원래 목록에서 80점 미만을 바로 지우고 싶을 수도 있습니다.
그런데 향상된 `for`로 목록을 읽는 도중에 그 목록의 `remove()`를 부르면 오류가 납니다.

```java
for (int score : scores) {
    if (score < 80) scores.remove(Integer.valueOf(score));
}
```

```text
Exception in thread "main" java.util.ConcurrentModificationException
```

읽고 있는 목록의 모양이 바뀌면 Java가 읽기를 멈추고 알리기 때문입니다.
그래서 보통은 이 문서처럼 조건에 맞는 값을 새 목록에 담습니다.
원래 목록을 꼭 고쳐야 한다면 조건에 맞는 값을 한 번에 지우는 `scores.removeIf(score -> score < 80)`을 씁니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `ScoreList.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.LinkedList;
> import java.util.List;
>
> public class ScoreList {
>     static void run(List<Integer> scores) {
>         scores.add(72);
>         scores.add(91);
>         scores.add(84);
>         scores.add(0, 65);
>         System.out.println("목록: " + scores);
>         System.out.println("get(2): " + scores.get(2));
>         System.out.println("contains(84): " + scores.contains(84));
>         scores.remove(0);
>         System.out.println("remove(0) 뒤: " + scores);
>     }
>
>     static List<Integer> passed(List<Integer> scores, int minimum) {
>         List<Integer> result = new ArrayList<>();
>         for (int score : scores) {
>             if (score >= minimum) {
>                 result.add(score);
>             }
>         }
>         return result;
>     }
>
>     public static void main(String[] args) {
>         System.out.println("[ArrayList]");
>         run(new ArrayList<>());
>         System.out.println("[LinkedList]");
>         run(new LinkedList<>());
>
>         List<Integer> scores = new ArrayList<>(List.of(72, 91, 65, 84, 58));
>         System.out.println("80점 이상: " + passed(scores, 80));
>         System.out.println("원래 목록: " + scores);
>     }
> }
> ```
>
> ```text
> [ArrayList]
> 목록: [65, 72, 91, 84]
> get(2): 91
> contains(84): true
> remove(0) 뒤: [72, 91, 84]
> [LinkedList]
> 목록: [65, 72, 91, 84]
> get(2): 91
> contains(84): true
> remove(0) 뒤: [72, 91, 84]
> 80점 이상: [91, 84]
> 원래 목록: [72, 91, 65, 84, 58]
> ```

## 정리

- `List`는 목록의 기능을 정한 인터페이스이고 `ArrayList`와 `LinkedList`는 같은 메서드를 다른 내부 구조로 제공합니다.
- `ArrayList`는 내부 배열이라 `get(i)`가 `O(1)`이고 칸이 모자라면 더 큰 배열로 옮겨 끝에 넣기가 평균 `O(1)`입니다.
- `LinkedList`는 노드 연결이라 맨 앞에 넣고 빼기가 `O(1)`이지만 `get(i)`와 중간 작업은 걸어가느라 `O(n)`입니다.
- 특별한 이유가 없으면 `ArrayList`를 쓰고 조건에 맞는 값은 `for`와 `if`로 골라 새 목록에 담습니다.

## 이어서 연습하기

[기준을 통과한 기록만 모으기](#/coding-tests/java/bridge-arr-04)에서 조건에 맞는 값만 골라 새 배열에 담아 봅니다.
[처음 등장한 기록만 남기기](#/coding-tests/java/bridge-arr-09)에서 조건을 하나 더 붙여 골라 봅니다.
[투 포인터와 슬라이딩 윈도우](#/learn/algorithm/two-pointers-sliding-window)에서 배열을 두 인덱스로 빠르게 훑는 방법을 익힙니다.

## 공식 자료

- [Java 25 API: List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [Java 25 API: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java 25 API: LinkedList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html)

## 핵심 질문 답

`ArrayList`는 내부 배열에 값을 담아서 `get(i)`가 `O(1)`이고 끝에 넣기도 평균 `O(1)`이지만 맨 앞이나 중간에 넣고 빼면 원소를 옮기느라 `O(n)`입니다.
`LinkedList`는 노드를 앞뒤로 이어 담아서 맨 앞에 넣고 빼기가 `O(1)`이지만 `get(i)`와 중간 작업은 그 자리까지 걸어가야 해서 `O(n)`입니다.
대부분의 목록은 번호로 읽고 끝에 넣고 처음부터 훑으므로 보통 `ArrayList`를 고릅니다.
조건에 맞는 값만 모을 때는 `for`로 하나씩 읽고 `if`로 고른 값을 새 목록에 담으면 원래 목록은 그대로 남습니다.
