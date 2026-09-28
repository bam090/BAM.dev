# Java로 순열·조합 만들기

## 학습 목표

- `boolean[] visited`·시작 인덱스·`List` 경로로 순열·조합·부분집합을 만들고 결과를 복사해 모을 수 있습니다.
- 순서를 따지는지와 몇 개를 고르는지를 보고 순열·조합·부분집합 중 알맞은 모양을 고를 수 있습니다.

## 한줄 요약

순열은 방문 표시로 이미 고른 원소를 건너뛰고 조합은 시작 인덱스로 뒤쪽 원소만 고르며 둘 다 경로에 넣고 재귀한 뒤 빼서 되돌립니다.

## 먼저 확인할 개념

[백트래킹: 선택하고 되돌아오며 모든 경우 찾기](#/learn/algorithm/brute-force-backtracking-recursion) · [ArrayList와 LinkedList](#/learn/algorithm/list-and-conditions) · [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists)

## 순열·조합이란

**순열**은 원소를 순서를 따져 줄 세운 것이고 **조합**은 순서 없이 몇 개를 골라 묶은 것입니다.
앞 문서에서는 카드마다 고름·안 고름 갈래를 나누는 백트래킹으로 부분집합을 만들었습니다.
이번에는 같은 선택·재귀·되돌리기 틀에 조건 하나씩을 더해 순열과 조합을 Java로 만들어 봅니다.

예를 들어 친구 민지·도윤·서아 세 명이 있다고 해 보겠습니다.
세 명의 발표 순서를 정하는 일은 순열입니다.
민지·도윤과 도윤·민지는 발표 순서가 다르기 때문에 다른 경우로 셉니다.
반면 세 명 중 대표 두 명을 뽑는 일은 조합입니다.
민지·도윤을 뽑든 도윤·민지를 뽑든 같은 두 사람이기 때문입니다.

이 문서는 세 친구 예제 하나로 순열·조합·부분집합을 모두 만듭니다.
세 방법이 함께 쓰는 재료는 아래와 같습니다.

```java
static String[] friends = {"민지", "도윤", "서아"};
static List<String> path = new ArrayList<>();
static List<List<String>> results = new ArrayList<>();
```

`path`는 지금까지 고른 친구를 담는 경로이고 `results`는 완성된 경우를 모아 두는 목록입니다.

## Java로 순열 만들기

순열은 자리마다 아직 세우지 않은 친구 중 한 명을 고릅니다.
그래서 누구를 이미 세웠는지 기억해야 하고 이 일을 `boolean[] visited` 배열이 맡습니다.
`visited[i]`가 `true`이면 `i`번 친구는 이미 앞자리에 선 것입니다.

![순열 선택 트리. 시작에서 첫째 자리로 민지·도윤·서아가 갈라지고 둘째 자리에서는 남은 두 명 셋째 자리에서는 남은 한 명이 이어진다. 민지 아래에는 이미 방문한 민지가 빨간 점선으로 건너뛰어져 있고 끝 노드는 6개이다.](content/assets/algorithm/permutation-tree.png)

민지를 첫째 자리에 세우면 둘째 자리에서는 민지를 건너뛰고 도윤과 서아만 고를 수 있습니다.
자리가 하나 내려갈 때마다 고를 수 있는 사람이 한 명씩 줄어듭니다.

```java
static boolean[] visited = new boolean[friends.length];

static void permute(int depth) {
    if (depth == friends.length) {
        results.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < friends.length; i++) {
        if (visited[i]) continue;
        visited[i] = true;
        path.add(friends[i]);
        permute(depth + 1);
        path.remove(path.size() - 1);
        visited[i] = false;
    }
}
```

`depth`는 지금까지 채운 자리 수입니다.
세 자리를 모두 채우면 경로를 결과에 담고 돌아갑니다.
반복문은 매 자리에서 모든 친구를 확인하지만 `visited`가 `true`인 친구는 `continue`로 건너뜁니다.

재귀 호출 앞에서는 표시하고 넣으며 돌아온 뒤에는 빼고 표시를 지웁니다.
넣은 순서의 반대로 되돌리는 것입니다.
`visited[i] = false`를 빠뜨리면 첫 갈래에서 세운 친구가 영원히 방문한 상태로 남아 다른 갈래에서 고를 수 없게 됩니다.

`permute(0)`을 부른 뒤 결과를 출력하면 몇 개가 어떤 순서로 나올지 그림을 보며 예상해 보세요.

```text
순열 6개
[민지, 도윤, 서아]
[민지, 서아, 도윤]
[도윤, 민지, 서아]
[도윤, 서아, 민지]
[서아, 민지, 도윤]
[서아, 도윤, 민지]
```

첫째 자리 3명 · 둘째 자리 2명 · 셋째 자리 1명이라 3 × 2 × 1 = 6개입니다.
반복문이 앞 번호 친구부터 확인하기 때문에 그림의 왼쪽 갈래부터 차례로 나옵니다.

## Java로 조합 만들기

조합은 순서를 따지지 않으므로 민지·도윤을 만든 뒤에 도윤·민지를 다시 만들면 안 됩니다.
그래서 한 번 고른 친구보다 **뒤에 있는 친구만** 고르도록 반복을 시작할 번호 `start`를 넘깁니다.

![조합 선택 트리. 시작(0)에서 민지(1)·도윤(2)·서아(3)로 갈라지고 민지 아래에는 도윤과 서아가 도윤 아래에는 서아가 이어진다. 서아 뒤에는 남은 친구가 없다. 끝 노드는 민지와 도윤 · 민지와 서아 · 도윤과 서아의 3개이다.](content/assets/algorithm/combination-tree.png)

괄호 안의 수는 그 자리에서 다음 반복이 시작할 번호 `start`입니다.
처음 호출은 0번부터 시작하고 친구를 고른 뒤에는 그 친구 바로 다음 번호부터 시작합니다.
도윤을 첫째로 고르면 반복은 2번부터 시작하므로 앞에 있는 민지는 다시 보지 않습니다.

```java
static void combine(int start, int r) {
    if (path.size() == r) {
        results.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i < friends.length; i++) {
        path.add(friends[i]);
        combine(i + 1, r);
        path.remove(path.size() - 1);
    }
}
```

순열과 달라진 곳은 두 군데입니다.
반복이 `0`이 아니라 `start`에서 시작하고 다음 호출에 `i + 1`을 넘깁니다.
뒤쪽만 보기 때문에 같은 친구를 두 번 고를 일이 없어서 `visited`도 필요 없습니다.

`combine(0, 2)`로 대표 두 명을 뽑으면 결과가 몇 개일지 예상해 보세요.

```text
조합 3개: [[민지, 도윤], [민지, 서아], [도윤, 서아]]
```

순열이었다면 두 자리 순서가 3 × 2 = 6개였을 것입니다.
조합은 같은 두 사람을 순서만 바꾼 경우를 한 번만 세므로 절반인 3개입니다.

## Java로 부분집합 만들기

부분집합은 친구마다 함께 갈지 말지를 정한 모든 경우이고 아무도 가지 않는 경우도 포함합니다.
앞 문서의 카드 예제와 같은 고름·안 고름 두 갈래 모양입니다.

```java
static void subsets(int index) {
    if (index == friends.length) {
        results.add(new ArrayList<>(path));
        return;
    }
    path.add(friends[index]);
    subsets(index + 1);
    path.remove(path.size() - 1);

    subsets(index + 1);
}
```

```text
부분집합 8개: [[민지, 도윤, 서아], [민지, 도윤], [민지, 서아], [민지], [도윤, 서아], [도윤], [서아], []]
```

세 명이 각각 두 갈래이므로 2 × 2 × 2 = 8개입니다.
마지막 `[]`는 세 명을 모두 고르지 않은 경우입니다.

## 결과 담기와 되돌리기

세 코드 모두 결과를 담을 때 `path`를 그대로 넣지 않고 `new ArrayList<>(path)`로 복사했습니다.
`path`는 모든 호출이 함께 쓰는 목록 하나라서 그대로 넣으면 같은 목록을 여러 번 가리키게 되기 때문입니다.
순열 코드에서 복사만 빼고 실행해 보겠습니다.

```java
results.add(path);   // 복사하지 않고 그대로 담음
```

```text
복사 없이 담은 순열: [[], [], [], [], [], []]
```

결과가 6개 담기기는 했지만 모두 빈 목록입니다.
탐색이 끝나면 되돌리기로 `path`가 비어 있고 결과 6칸이 모두 그 빈 `path` 하나를 가리키기 때문입니다.
그래서 경로를 결과에 담을 때는 항상 그 순간의 내용을 복사합니다.

되돌리기에 쓰는 `path.remove(path.size() - 1)`도 눈여겨볼 만합니다.
`List`의 `remove(int)`는 값이 아니라 **위치**를 받아 그 위치의 원소를 지웁니다.
`List<Integer>`로 숫자를 담을 때 `path.remove(3)`이라고 쓰면 값 `3`이 아니라 3번 위치를 지우므로 마지막 위치를 `path.size() - 1`로 적습니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `FriendPicks.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.List;
>
> public class FriendPicks {
>     static String[] friends = {"민지", "도윤", "서아"};
>     static List<String> path = new ArrayList<>();
>     static List<List<String>> results = new ArrayList<>();
>     static boolean[] visited = new boolean[friends.length];
>
>     static void permute(int depth) {
>         if (depth == friends.length) {
>             results.add(new ArrayList<>(path));
>             return;
>         }
>         for (int i = 0; i < friends.length; i++) {
>             if (visited[i]) continue;
>             visited[i] = true;
>             path.add(friends[i]);
>             permute(depth + 1);
>             path.remove(path.size() - 1);
>             visited[i] = false;
>         }
>     }
>
>     static void permuteWithoutCopy(int depth) {
>         if (depth == friends.length) {
>             results.add(path);
>             return;
>         }
>         for (int i = 0; i < friends.length; i++) {
>             if (visited[i]) continue;
>             visited[i] = true;
>             path.add(friends[i]);
>             permuteWithoutCopy(depth + 1);
>             path.remove(path.size() - 1);
>             visited[i] = false;
>         }
>     }
>
>     static void combine(int start, int r) {
>         if (path.size() == r) {
>             results.add(new ArrayList<>(path));
>             return;
>         }
>         for (int i = start; i < friends.length; i++) {
>             path.add(friends[i]);
>             combine(i + 1, r);
>             path.remove(path.size() - 1);
>         }
>     }
>
>     static void subsets(int index) {
>         if (index == friends.length) {
>             results.add(new ArrayList<>(path));
>             return;
>         }
>         path.add(friends[index]);
>         subsets(index + 1);
>         path.remove(path.size() - 1);
>
>         subsets(index + 1);
>     }
>
>     public static void main(String[] args) {
>         permute(0);
>         System.out.println("순열 " + results.size() + "개");
>         for (List<String> order : results) {
>             System.out.println(order);
>         }
>
>         results.clear();
>         permuteWithoutCopy(0);
>         System.out.println("복사 없이 담은 순열: " + results);
>
>         results.clear();
>         combine(0, 2);
>         System.out.println("조합 " + results.size() + "개: " + results);
>
>         results.clear();
>         subsets(0);
>         System.out.println("부분집합 " + results.size() + "개: " + results);
>     }
> }
> ```
>
> ```text
> 순열 6개
> [민지, 도윤, 서아]
> [민지, 서아, 도윤]
> [도윤, 민지, 서아]
> [도윤, 서아, 민지]
> [서아, 민지, 도윤]
> [서아, 도윤, 민지]
> 복사 없이 담은 순열: [[], [], [], [], [], []]
> 조합 3개: [[민지, 도윤], [민지, 서아], [도윤, 서아]]
> 부분집합 8개: [[민지, 도윤, 서아], [민지, 도윤], [민지, 서아], [민지], [도윤, 서아], [도윤], [서아], []]
> ```

## 순열·조합의 선택

그렇다면 문제를 받았을 때 셋 중 무엇을 만들어야 할까요?
순서가 결과를 바꾸는지와 몇 개를 고르는지를 차례로 확인합니다.

| 문제에서 확인할 것 | 고를 모양 | 쓰는 도구 | 세 친구에서 |
| --- | --- | --- | --- |
| 순서가 다르면 다른 답입니다 | 순열 | `boolean[] visited` | 모두 세우면 6개 |
| 순서와 관계없이 정해진 수만큼 고릅니다 | 조합 | 시작 인덱스 `start` | 2명이면 3개 |
| 몇 개를 고를지 정해지지 않았습니다 | 부분집합 | 고름·안 고름 두 갈래 | 8개 |

예를 들어 "세 과목의 공부 순서를 정해 총 피로도를 가장 낮게" 같은 문제는 순서가 결과를 바꾸므로 순열입니다.
"카드 두 장을 골라 합이 가장 크게" 같은 문제는 어떤 순서로 골라도 합이 같으므로 조합입니다.

만들 경우가 몇 개인지는 코드를 쓰기 전에 공식으로 먼저 세어 볼 수 있습니다.
경우가 너무 많으면 시간 안에 모두 만들 수 없기 때문입니다.
순열·조합의 개수를 공식으로 세는 방법은 [경우의 수](#/learn/algorithm/combinatorics)에서 다룹니다.

## 정리

- 순열은 `boolean[] visited`로 이미 세운 원소를 건너뛰고 돌아오면 표시를 지웁니다.
- 조합은 다음 호출에 `i + 1`을 넘겨 뒤쪽 원소만 고르므로 같은 묶음을 두 번 만들지 않습니다.
- 결과에는 `new ArrayList<>(path)`로 그 순간의 경로를 복사해 담고 되돌리기는 `path.remove(path.size() - 1)`로 합니다.
- 순서가 답을 바꾸면 순열 · 정해진 수만큼 고르면 조합 · 고를 수가 자유로우면 부분집합을 만듭니다.

## 이어서 연습하기

[곱으로 잠금 번호 만들기](#/coding-tests/java/bridge-bkt-02)에서 순서가 다른 경우를 한 번만 세는 조합을 만들어 봅니다.
[에너지 조절 장치 점검 순서](#/coding-tests/java/bridge-bkt-03)에서 순서를 따지는 탐색을 연습합니다.

## 공식 자료

- [Java 25 API: List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [Java 25 API: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)

## 핵심 질문 답

순열은 자리마다 `boolean[] visited`로 아직 세우지 않은 원소만 골라 경로에 넣고 재귀한 뒤 경로에서 빼고 표시를 지웁니다.
조합은 다음 호출에 시작 인덱스 `i + 1`을 넘겨 앞에서 고른 원소보다 뒤에 있는 원소만 고르므로 같은 묶음을 순서만 바꿔 다시 만들지 않습니다.
부분집합은 원소마다 고름·안 고름 두 갈래로 나눕니다.
세 방법 모두 완성된 경로는 `new ArrayList<>(path)`로 복사해 결과에 담아야 되돌리기 뒤에도 내용이 남습니다.
