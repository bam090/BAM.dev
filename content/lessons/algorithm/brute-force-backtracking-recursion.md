# 백트래킹: 선택하고 되돌아오며 모든 경우 찾기

## 학습 목표

- 완전 탐색·재귀·백트래킹의 관계를 설명하고 선택 트리로 탐색 순서를 따라갈 수 있습니다.
- 선택·재귀 호출·되돌리기로 백트래킹을 구성하고 정답이 될 수 없는 갈래를 가지치기할 수 있습니다.

## 한줄 요약

백트래킹은 재귀로 한 갈래씩 선택해 끝까지 내려간 뒤 선택을 되돌려 다른 갈래를 확인하는 완전 탐색이고 정답이 될 수 없는 갈래는 가지치기로 일찍 멈춥니다.

## 먼저 확인할 개념

[자료구조와 알고리즘: 시간 복잡도로 고르기](#/learn/algorithm/data-structures-and-algorithms) · [스택](#/learn/algorithm/stack-and-queue) · [트리: 부모와 자식으로 이어진 구조](#/learn/algorithm/tree-basics) · [메서드의 입력·출력 계약](#/learn/java/wiki-methods)

## 완전 탐색이란

**완전 탐색**은 답이 될 수 있는 경우를 하나도 빠뜨리지 않고 모두 확인해서 답을 찾는 방법입니다.
영어로는 브루트 포스(brute force)라고 부르며 무식하게 힘으로 푼다는 뜻입니다.
답을 한 번에 고를 규칙이 보이지 않을 때 가장 먼저 떠올릴 수 있는 방법이기 때문에 모든 탐색의 출발점이 됩니다.

예를 들어 숫자 카드 `5`·`2`·`3`이 있고 몇 장을 골라 합이 `5`가 되는 경우를 모두 찾는다고 해 보겠습니다.
이 문서는 이 카드 세 장으로 끝까지 설명합니다.

카드마다 고르거나 고르지 않는 두 가지 선택이 있습니다.
카드가 세 장이니 경우는 2 × 2 × 2 = 8가지입니다.
가장 단순한 방법은 반복문을 카드 수만큼 겹쳐서 8가지를 모두 만들어 보는 것입니다.

```java
int[] cards = {5, 2, 3};
int target = 5;

int cases = 0;
for (int a = 1; a >= 0; a--) {
    for (int b = 1; b >= 0; b--) {
        for (int c = 1; c >= 0; c--) {
            cases++;
            int sum = a * cards[0] + b * cards[1] + c * cards[2];
            if (sum == target) {
                System.out.println("찾음: " + a + " " + b + " " + c);
            }
        }
    }
}
System.out.println("확인한 경우: " + cases);
```

`a`·`b`·`c`는 각 카드를 골랐으면 1이고 고르지 않았으면 0입니다.
합이 `5`가 되는 경우가 몇 개일지 먼저 세어 보세요.

```text
찾음: 1 0 0
찾음: 0 1 1
확인한 경우: 8
```

첫 줄은 `5` 한 장만 고른 경우이고 둘째 줄은 `2`와 `3`을 고른 경우입니다.
8가지를 모두 확인했기 때문에 빠뜨린 답이 없다고 확신할 수 있습니다.

그런데 이 코드에는 한계가 있습니다.
카드가 네 장이 되면 반복문을 한 겹 더 써야 하고 카드 수가 입력으로 주어지면 반복문을 몇 겹 쓸지 미리 정할 수 없습니다.
그래서 "카드 한 장을 고를지 정하고 나머지 카드는 같은 방법으로 처리한다"라는 규칙을 한 번만 쓰고 되풀이하게 만들어야 합니다.
이 되풀이가 바로 재귀입니다.

## 재귀와 호출 스택

**재귀**는 메서드가 자기 자신을 다시 호출해서 같은 모양의 더 작은 문제를 푸는 방식입니다.
큰 문제를 한 조각과 나머지로 나누고 나머지는 자기 자신에게 맡기는 것입니다.

카드 세 장의 합을 재귀로 구해 보겠습니다.
`total(index)`는 `index`번 카드부터 끝까지의 합을 돌려주는 메서드입니다.

```java
static int total(int index) {
    if (index == cards.length) return 0;
    return cards[index] + total(index + 1);
}
```

`total(0)`은 `5 + total(1)`이 되고 `total(1)`은 `2 + total(2)`가 됩니다.
이렇게 문제가 한 장씩 작아지다가 카드가 남지 않으면 멈춥니다.

재귀에는 두 가지가 꼭 있어야 합니다.

| 필요한 것 | 뜻 | `total`에서 |
| --- | --- | --- |
| 종료 조건 | 더 부르지 않고 바로 답을 돌려주는 조건 | `index == cards.length`이면 `0` |
| 작아지는 호출 | 호출할 때마다 종료 조건에 한 걸음씩 가까워지는 변화 | `index + 1`로 호출 |

종료 조건이 없거나 호출이 작아지지 않으면 메서드가 끝없이 자기 자신을 부릅니다.

그렇다면 `total(0)`은 결과가 나올 때까지 어디서 기다릴까요?
Java는 아직 끝나지 않은 호출을 **호출 스택**이라는 곳에 차례로 쌓아 둡니다.

![왼쪽은 total(0)·total(1)·total(2)·total(3)이 아래에서 위로 쌓인 호출 스택이고 맨 위 total(3)이 0을 반환한다. 오른쪽은 돌아올 때 total(3)부터 0·3·5·10 순서로 계산이 끝나는 모습](content/assets/algorithm/backtracking-call-stack.png)

`total(0)`은 `total(1)`의 결과를 기다리며 스택에 남고 `total(1)`은 다시 `total(2)`를 기다립니다.
맨 위의 `total(3)`이 `0`을 돌려주면 그제야 바로 아래 호출이 `3 + 0`을 계산하고 끝납니다.
이렇게 나중에 쌓인 호출부터 끝나는 모습이 스택의 후입선출 그대로입니다.
그림의 계산 순서를 따라 `total(0)`이 돌려줄 값을 예상해 보세요.

```text
카드 합계: 10
```

> [!question]- 재귀가 너무 깊어지면?
> 호출 스택에 쌓을 수 있는 호출 수에는 한계가 있습니다.
> 종료 조건을 빠뜨리거나 호출이 아주 깊어지면 스택이 가득 차서 `StackOverflowError`가 나고 프로그램이 멈춥니다.
>
> 카드 세 장처럼 깊이가 입력 크기만큼인 탐색은 괜찮습니다.
> 하지만 1부터 100만까지 더하는 일처럼 단순히 긴 반복은 재귀보다 반복문으로 쓰는 편이 안전합니다.

이제 재귀를 이용해 카드를 고르는 경우를 모두 만들어 보겠습니다.

## 백트래킹이란

**백트래킹**은 선택을 하나씩 해 나가며 한 갈래를 끝까지 탐색한 뒤 마지막 선택을 되돌려 다른 갈래를 탐색하는 방법입니다.
백(back)은 뒤로 돌아간다는 뜻이고 트래킹(tracking)은 길을 따라간다는 뜻입니다.
완전 탐색을 재귀로 구현하는 가장 흔한 모양이라서 코딩테스트에서는 두 이름을 함께 씁니다.

카드 예제의 선택을 모두 그려 보면 아래와 같은 트리가 됩니다.
이런 그림을 **선택 트리** 또는 **상태 공간 트리**라고 부릅니다.

![카드 5·2·3을 차례로 고를지 정하는 선택 트리. 맨 위 합 0에서 왼쪽 갈래는 고름이고 오른쪽 점선 갈래는 안 고름이다. 맨 아래 끝 노드 8개의 합은 10·7·8·5·5·2·3·0이고 합이 5인 끝 노드 두 개가 초록색이다.](content/assets/algorithm/backtracking-choice-tree.png)

한 층을 내려갈 때마다 카드 한 장의 선택이 정해집니다.
왼쪽 갈래는 그 카드를 고른 경우이고 오른쪽 점선 갈래는 고르지 않은 경우입니다.
맨 아래 끝 노드 8개가 앞에서 반복문으로 만든 8가지 경우와 정확히 같습니다.

백트래킹은 이 트리를 깊이 우선 탐색(DFS)으로 돕니다.
[트리](#/learn/algorithm/tree-basics)의 전위 순회처럼 가장 왼쪽 갈래를 끝까지 내려간 뒤 가까운 갈림길로 돌아와 다음 갈래로 갑니다.

### 선택·재귀·되돌리기

백트래킹 코드는 세 단계가 한 묶음입니다.

```java
static List<Integer> path = new ArrayList<>();

static void search(int index, int sum) {
    if (index == cards.length) {
        if (sum == target) System.out.println("찾음: " + path);
        return;
    }

    path.add(cards[index]);                  // 1. 선택
    search(index + 1, sum + cards[index]);   // 2. 재귀
    path.remove(path.size() - 1);            // 3. 되돌리기

    search(index + 1, sum);                  // 고르지 않은 갈래
}
```

`path`는 지금까지 고른 카드를 담는 목록입니다.
카드를 골라 `path`에 넣고 다음 카드로 재귀 호출한 뒤 돌아오면 넣었던 카드를 다시 뺍니다.
그다음 같은 카드를 고르지 않은 갈래로 다시 재귀 호출합니다.

`search(0, 0)`을 부르면 어떤 순서로 답이 출력될지 선택 트리에서 왼쪽 갈래부터 따라가며 예상해 보세요.

```text
찾음: [5]
찾음: [2, 3]
```

왼쪽 갈래부터 내려가므로 `5`를 고른 쪽의 답이 먼저 나옵니다.
`path`가 어떻게 바뀌는지 처음 몇 단계만 따라가 보겠습니다.

| 단계 | 한 일 | `path` |
| --- | --- | --- |
| 1 | `5` 선택 | `[5]` |
| 2 | `2` 선택 | `[5, 2]` |
| 3 | `3` 선택 뒤 끝에 도착하고 되돌리기 | `[5, 2]` |
| 4 | `3` 안 고름 · 끝에 도착 · 합 7 | `[5, 2]` |
| 5 | 돌아와 `2` 되돌리기 | `[5]` |
| 6 | `2` 안 고름 · `3` 선택 뒤 되돌리기 | `[5]` |
| 7 | `3` 안 고름 · 끝에 도착 · 합 5라서 출력 | `[5]` |

되돌리기가 핵심입니다.
`path`는 모든 호출이 함께 쓰는 목록 하나이기 때문에 넣은 카드를 빼지 않으면 다음 갈래에 이전 갈래의 카드가 남습니다.
예를 들어 5단계에서 `2`를 빼지 않았다면 `2`를 고르지 않은 갈래인데도 `path`에 `2`가 남아 `[5, 2]`로 출력됩니다.
반면 `index`와 `sum`은 호출마다 새 값으로 넘기는 매개변수라서 돌아오면 저절로 이전 값입니다.

### 가지치기

선택 트리를 다시 보면 `5`를 고른 순간 합이 이미 `5`라서 답을 찾았습니다.
카드는 모두 양수라서 그 아래에서 카드를 더 고르면 합이 커지기만 합니다.
그런데도 앞의 코드는 그 아래 노드를 모두 방문합니다.

**가지치기**는 정답이 될 수 없는 갈래를 알아본 순간 그 아래로 내려가지 않고 멈추는 것입니다.
트리의 가지를 잘라 낸다는 뜻에서 붙은 이름입니다.

![같은 선택 트리에서 5를 고른 노드가 합 5로 답을 찾은 뒤 그 아래 노드 6개를 빨간 점선 상자로 잘라 낸 모습. 방문한 노드는 9개이다.](content/assets/algorithm/backtracking-pruning.png)

코드는 메서드 첫머리에 조건 두 줄만 바꾸면 됩니다.

```java
static void search(int index, int sum) {
    if (sum == target) {
        System.out.println("찾음: " + path);
        return;
    }
    if (sum > target || index == cards.length) return;

    path.add(cards[index]);
    search(index + 1, sum + cards[index]);
    path.remove(path.size() - 1);

    search(index + 1, sum);
}
```

합이 목표와 같으면 답을 출력하고 바로 돌아갑니다.
합이 목표를 넘었거나 카드가 남지 않았을 때도 돌아갑니다.
두 코드가 메서드를 몇 번 호출하는지 세어 보면 차이가 보입니다.

```text
가지치기 전 호출: 15
가지치기 후 호출: 9
```

찾은 답은 똑같이 `[5]`와 `[2, 3]`이고 호출은 15번에서 9번으로 줄었습니다.
카드가 많아지면 잘려 나가는 가지도 커지기 때문에 가지치기의 효과는 더 커집니다.

가지치기에는 반드시 근거가 있어야 합니다.
이 예제의 근거는 카드가 모두 양수라는 점입니다.
만약 `-1` 같은 음수 카드가 있다면 합이 `5`를 넘었다가 다시 `5`로 돌아올 수 있으니 같은 조건으로 자르면 답을 놓칩니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `CardSearch.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.List;
>
> public class CardSearch {
>     static int[] cards = {5, 2, 3};
>     static int target = 5;
>     static List<Integer> path = new ArrayList<>();
>     static int calls = 0;
>
>     static void loopSearch() {
>         int cases = 0;
>         for (int a = 1; a >= 0; a--) {
>             for (int b = 1; b >= 0; b--) {
>                 for (int c = 1; c >= 0; c--) {
>                     cases++;
>                     int sum = a * cards[0] + b * cards[1] + c * cards[2];
>                     if (sum == target) {
>                         System.out.println("찾음: " + a + " " + b + " " + c);
>                     }
>                 }
>             }
>         }
>         System.out.println("확인한 경우: " + cases);
>     }
>
>     static int total(int index) {
>         if (index == cards.length) return 0;
>         return cards[index] + total(index + 1);
>     }
>
>     static void searchAll(int index, int sum) {
>         calls++;
>         if (index == cards.length) {
>             if (sum == target) System.out.println("찾음: " + path);
>             return;
>         }
>
>         path.add(cards[index]);
>         searchAll(index + 1, sum + cards[index]);
>         path.remove(path.size() - 1);
>
>         searchAll(index + 1, sum);
>     }
>
>     static void search(int index, int sum) {
>         calls++;
>         if (sum == target) {
>             System.out.println("찾음: " + path);
>             return;
>         }
>         if (sum > target || index == cards.length) return;
>
>         path.add(cards[index]);
>         search(index + 1, sum + cards[index]);
>         path.remove(path.size() - 1);
>
>         search(index + 1, sum);
>     }
>
>     public static void main(String[] args) {
>         loopSearch();
>
>         System.out.println("카드 합계: " + total(0));
>
>         searchAll(0, 0);
>         System.out.println("가지치기 전 호출: " + calls);
>
>         calls = 0;
>         search(0, 0);
>         System.out.println("가지치기 후 호출: " + calls);
>     }
> }
> ```
>
> ```text
> 찾음: 1 0 0
> 찾음: 0 1 1
> 확인한 경우: 8
> 카드 합계: 10
> 찾음: [5]
> 찾음: [2, 3]
> 가지치기 전 호출: 15
> 찾음: [5]
> 찾음: [2, 3]
> 가지치기 후 호출: 9
> ```

## 백트래킹의 종류

카드 예제는 카드마다 고를지 말지를 정했습니다.
코딩테스트의 백트래킹 문제는 대부분 무엇을 고르고 순서를 따지는지에 따라 세 가지 모양 중 하나입니다.

| 종류 | 만드는 것 | 카드 `5`·`2`·`3`에서 | 경우의 수 |
| --- | --- | --- | --- |
| 부분집합 | 각 원소를 고를지 말지 정한 모든 묶음 | `[]` · `[5]` · `[5, 2]` … | `2ⁿ` |
| 순열 | 순서를 따져 줄 세운 모든 경우 | `[5, 2, 3]` · `[5, 3, 2]` · `[2, 5, 3]` … | `n!` |
| 조합 | 순서 없이 `r`개를 고른 모든 경우 | 2장이면 `[5, 2]` · `[5, 3]` · `[2, 3]` | `n`개 중 `r`개를 고르는 수 `nCr` |

이 문서의 카드 예제는 부분집합 모양입니다.
순열은 이미 고른 원소를 다시 고르지 않도록 방문 표시를 하고 조합은 앞에서 고른 원소보다 뒤에 있는 원소만 고릅니다.
Java에서 쓰는 방법은 [Java로 순열·조합 만들기](#/learn/algorithm/permutations-combinations-java)에서 알아봅니다.

## 백트래킹의 활용

그렇다면 어떤 문제를 백트래킹으로 풀어야 할까요?
기준은 입력 크기입니다.
완전 탐색은 경우를 모두 만들기 때문에 입력이 조금만 커져도 경우의 수가 폭발적으로 늘어납니다.

| 모양 | 입력 크기 `n` | 경우의 수 | 1초 안에 가능한가 |
| --- | --- | --- | --- |
| 부분집합 | 20 | 약 100만 | 가능합니다 |
| 부분집합 | 30 | 약 10억 | 어렵습니다 |
| 순열 | 10 | 약 363만 | 가능합니다 |
| 순열 | 12 | 약 4억 8천만 | 어렵습니다 |

그래서 문제의 `n`이 10~20 정도로 작으면 백트래킹을 먼저 떠올립니다.
입력 크기와 복잡도를 비교하는 기준은 [코드에서 시간 복잡도 계산하기](#/learn/algorithm/time-complexity-in-code)의 표와 같습니다.
가지치기를 잘하면 실제 호출 수는 이보다 훨씬 줄어듭니다.

백트래킹으로 자주 푸는 문제는 다음과 같습니다.

- 숫자를 골라 목표 합이나 곱을 만드는 경우 찾기
- 사람이나 작업의 순서를 모두 따져 가장 좋은 순서 찾기
- 서로 겹치지 않게 배치하기 (체스판에 퀸 놓기·일정 배정)
- 미로에서 가능한 길을 모두 따라가 보기

입력이 커서 모든 경우를 만들 수 없다면 같은 계산을 저장해 두는 [동적 계획법](#/learn/algorithm/binary-search-and-dynamic-programming)이나 매번 가장 좋은 것을 고르는 [그리디](#/learn/algorithm/heap-and-greedy)를 검토합니다.

## 정리

- 완전 탐색은 답이 될 수 있는 경우를 모두 확인하고 재귀는 같은 모양의 더 작은 문제를 자기 자신에게 맡깁니다.
- 재귀에는 종료 조건과 작아지는 호출이 있어야 하고 끝나지 않은 호출은 호출 스택에 쌓입니다.
- 백트래킹은 선택 트리를 깊이 우선으로 돌며 선택·재귀·되돌리기를 반복합니다.
- 가지치기는 정답이 될 수 없다는 근거가 있는 갈래를 일찍 멈춰 호출 수를 줄입니다.

## 이어서 연습하기

[Java로 순열·조합 만들기](#/learn/algorithm/permutations-combinations-java)에서 순열·조합·부분집합을 직접 만들어 봅니다.
[가까운 기록 쌍 세기](#/coding-tests/java/bridge-arr-10)에서 모든 쌍을 확인하는 완전 탐색을 연습합니다.
[선택 점수의 모든 합](#/coding-tests/java/bridge-bkt-01)에서 고름·안 고름 갈래로 모든 합을 만들어 봅니다.

## 공식 자료

- [Java 25 API: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java 25 API: StackOverflowError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html)

## 핵심 질문 답

완전 탐색은 답이 될 수 있는 경우를 빠짐없이 확인하는 방법이고 선택마다 갈래가 나뉘는 문제는 재귀로 구현합니다.
재귀는 종료 조건과 작아지는 호출로 멈추며 끝나지 않은 호출은 호출 스택에 쌓였다가 나중에 부른 것부터 끝납니다.
백트래킹은 이 재귀로 선택 트리를 깊이 우선으로 돌면서 선택하고 재귀 호출한 뒤 선택을 되돌려 다음 갈래가 이전 갈래의 영향을 받지 않게 합니다.
정답이 될 수 없다는 근거가 있는 갈래는 가지치기로 일찍 멈춰 탐색량을 줄입니다.
