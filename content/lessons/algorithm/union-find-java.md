# Java로 유니온 파인드 구현하기

## 학습 목표

- `int[] parent`·`int[] size`로 경로 압축과 크기 기준 합치기를 갖춘 유니온 파인드를 Java로 구현하고 연결 요소 수 세기와 사이클 판별에 쓸 수 있습니다.

## 한줄 요약

Java에는 유니온 파인드 클래스가 없어서 `parent`·`size` 배열과 `find`·`union` 메서드를 가진 작은 클래스를 직접 만들어 씁니다.

## 먼저 확인할 개념

[집합: 유니온 파인드로 그룹 합치기](#/learn/algorithm/union-find) · [배열의 원소와 경계](#/learn/java/wiki-arrays) · [클래스·객체·참조와 this](#/learn/java/wiki-objects)

## Java로 유니온 파인드 구현

Java의 유니온 파인드는 부모 배열·크기 배열·그룹 수를 필드로 가진 작은 클래스로 만듭니다.
앞 문서에서는 `parent` 배열 하나와 `find`·`union`으로 섬을 그룹으로 묶었습니다.
Java 표준 라이브러리에는 `HashSet`·`TreeSet` 같은 집합은 있지만 여러 그룹을 합치는 유니온 파인드는 없습니다.
그래서 코딩테스트에서는 필요한 만큼만 직접 짜서 씁니다.

이 문서는 친구 7명의 친구 관계를 예로 사용합니다.
친구 관계로 이어진 사람들을 한 **친구 무리**로 보고 무리가 몇 개인지와 두 사람이 같은 무리인지를 알아냅니다.

![민지 0 · 도윤 1 · 서아 2가 한 무리로 이어져 있고 하준 3 · 지우 4 · 예린 5 · 시우 6이 다른 무리로 이어져 있다. 서아와 민지를 잇는 {2, 0} 기록은 이미 같은 무리인 두 사람을 다시 잇는 빨간 점선으로 표시되어 있다. 무리 1은 3명이고 무리 2는 4명이다.](content/assets/algorithm/uf-java-friends.png)

사람 이름은 번호로 바꿔 배열 인덱스로 씁니다.
친구 관계는 두 번호를 담은 `int[][]`로 받습니다.

```java
String[] names = {"민지", "도윤", "서아", "하준", "지우", "예린", "시우"};
int[][] friendships = {{0, 1}, {1, 2}, {3, 4}, {2, 0}, {5, 6}, {4, 5}};
```

### 필드와 초기화

클래스에는 세 가지를 둡니다.

| 필드 | 뜻 | 처음 값 |
| --- | --- | --- |
| `int[] parent` | 각 사람의 부모 번호 | 자기 자신 |
| `int[] size` | 대표 칸에만 의미가 있는 무리의 사람 수 | 1 |
| `int groups` | 지금 남아 있는 무리 수 | 사람 수 |

```java
static class UnionFind {
    int[] parent;
    int[] size;
    int groups;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
        groups = n;
    }
}
```

처음에는 모두 혼자이므로 자기 자신이 대표이고 무리 크기는 1이며 무리 수는 사람 수와 같습니다.
문제의 번호가 1부터 시작하면 `new UnionFind(n + 1)`로 한 칸 크게 만들고 `0`번 칸은 쓰지 않으면 됩니다.

## find 구현

`find`는 대표를 찾으면서 경로 압축까지 해 둡니다.
재귀로 쓰는 방법과 반복문으로 쓰는 방법이 있습니다.

```java
int find(int x) {
    if (parent[x] == x) return x;
    parent[x] = find(parent[x]);
    return parent[x];
}

int findIterative(int x) {
    int root = x;
    while (parent[root] != root) {
        root = parent[root];
    }
    while (parent[x] != root) {
        int next = parent[x];
        parent[x] = root;
        x = next;
    }
    return root;
}
```

재귀 버전은 대표를 찾아 돌아오는 길에 부모를 대표로 덮어씁니다.
반복 버전은 먼저 첫 번째 `while`로 대표를 찾습니다.
그다음 두 번째 `while`로 같은 길을 다시 올라가며 지나는 칸의 부모를 대표로 바꿉니다.
`parent[x]`를 바꾸기 전에 `next`에 원래 부모를 담아 두어야 다음 칸으로 올라갈 수 있습니다.

| | 재귀 `find` | 반복 `findIterative` |
| --- | --- | --- |
| 코드 길이 | 세 줄로 짧습니다 | 반복문 두 개로 조금 깁니다 |
| 깊이가 매우 깊을 때 | 호출이 쌓여 `StackOverflowError`가 날 수 있습니다 | 호출이 쌓이지 않습니다 |
| 잘 맞는 경우 | 크기 기준 합치기를 함께 써서 트리가 낮을 때 | 합치기 규칙 없이 사슬이 길어질 수 있을 때 |

크기 기준 합치기를 함께 쓰면 트리 높이가 사람 수의 `log`를 넘지 않습니다.
그래서 보통은 짧은 재귀 버전으로 충분합니다.

## union 구현

`union`은 두 대표를 찾고 작은 무리의 대표를 큰 무리의 대표 아래에 붙입니다.

```java
boolean union(int a, int b) {
    int rootA = find(a);
    int rootB = find(b);
    if (rootA == rootB) return false;

    if (size[rootA] < size[rootB]) {
        int temp = rootA;
        rootA = rootB;
        rootB = temp;
    }
    parent[rootB] = rootA;
    size[rootA] += size[rootB];
    groups--;
    return true;
}
```

대표가 같으면 이미 같은 무리라서 아무것도 바꾸지 않고 `false`를 돌려줍니다.
대표가 다르면 `rootA`가 큰 쪽이 되도록 두 값을 바꾼 뒤 `rootB`를 그 아래에 붙입니다.
그리고 큰 쪽 대표의 `size`에 작은 쪽 크기를 더하고 `groups`를 하나 줄입니다.

![왼쪽은 union(4, 5) 전으로 4가 3을 · 6이 5를 가리키고 3번과 5번의 크기가 모두 2이다. 오른쪽은 union(4, 5) 뒤로 5가 3 아래로 들어가 3 아래에 4와 5가 있고 5 아래에 6이 있으며 3번의 크기가 4가 된다.](content/assets/algorithm/uf-java-size.png)

그림은 친구 관계 `{4, 5}`를 처리하는 순간입니다.
지우 `4`의 대표는 `3`이고 예린 `5`의 대표는 `5`이며 두 무리 모두 2명입니다.
크기가 같으면 바꾸지 않으므로 `5`가 `3` 아래로 들어가고 `size[3]`은 4가 됩니다.

여기서 주의할 점은 `size`가 대표 칸에서만 맞는 값이라는 것입니다.
`size[5]`는 합친 뒤에도 2로 남아 있지만 더는 무리 크기가 아닙니다.
그래서 무리 크기는 항상 `size[find(x)]`로 읽습니다.

같은 무리인지 묻는 메서드와 무리 크기를 읽는 메서드도 `find` 위에 한 줄씩 얹으면 됩니다.

```java
boolean connected(int a, int b) {
    return find(a) == find(b);
}

int groupSize(int x) {
    return size[find(x)];
}
```

`connected`에서 `parent[a] == parent[b]`처럼 바로 위 부모만 비교하면 틀립니다.
대표까지 올라가지 않으면 같은 무리인데도 부모가 달라 보일 수 있기 때문입니다.

## 연결 요소 수 세기

이제 친구 관계를 모두 처리해 친구 무리가 몇 개인지 세어 보겠습니다.

```java
UnionFind uf = new UnionFind(names.length);
for (int[] pair : friendships) {
    boolean merged = uf.union(pair[0], pair[1]);
    if (!merged) {
        System.out.println("이미 같은 무리: " + names[pair[0]] + "-" + names[pair[1]]);
    }
}

System.out.println("친구 무리 수: " + uf.groups);
System.out.println("민지와 서아: " + uf.connected(0, 2));
System.out.println("민지와 시우: " + uf.connected(0, 6));
System.out.println("시우네 무리 크기: " + uf.groupSize(6));
```

친구 관계 6개를 처리하면 무리는 몇 개가 될까요?
민지와 시우는 같은 무리일까요?
출력을 보기 전에 그림을 보며 예상해 보세요.

```text
이미 같은 무리: 서아-민지
친구 무리 수: 2
민지와 서아: true
민지와 시우: false
시우네 무리 크기: 4
```

처음 무리 수는 7이었습니다.
친구 관계 6개 중 `{2, 0}`을 뺀 5개가 서로 다른 무리를 합쳤으므로 `7 - 5 = 2`입니다.
이렇게 `union`이 `true`를 돌려줄 때만 `groups`를 줄이면 연결 요소 수가 저절로 맞춰집니다.

## 사이클 판별

출력 첫 줄의 `이미 같은 무리: 서아-민지`가 바로 사이클 판별입니다.
민지·도윤·서아는 `{0, 1}`과 `{1, 2}`로 이미 한 무리였습니다.
그런데 `{2, 0}`으로 서아와 민지를 한 번 더 이으면 `민지 → 도윤 → 서아 → 민지`로 돌아오는 길이 생깁니다.

`union`이 `false`를 돌려주는 순간이 곧 사이클을 만드는 간선을 만난 순간입니다.
그래서 "사이클이 생기는 첫 간선을 찾으라"는 문제는 반복문 안에서 `union`의 결과가 `false`인 첫 간선을 돌려주면 됩니다.

마지막으로 `parent` 배열을 찍어 보면 경로 압축이 실제로 일어난 흔적도 볼 수 있습니다.

```java
System.out.println("parent: " + Arrays.toString(uf.parent));
System.out.println("반복 find(6): " + uf.findIterative(6));
```

```text
parent: [0, 0, 0, 3, 3, 3, 3]
반복 find(6): 3
```

그림에서 시우 `6`의 부모는 `5`였습니다.
그런데 `connected(0, 6)`과 `groupSize(6)`이 `find(6)`을 부르면서 `parent[6]`을 대표 `3`으로 바꿔 두었습니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `FriendNetwork.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.Arrays;
>
> public class FriendNetwork {
>     static class UnionFind {
>         int[] parent;
>         int[] size;
>         int groups;
>
>         UnionFind(int n) {
>             parent = new int[n];
>             size = new int[n];
>             for (int i = 0; i < n; i++) {
>                 parent[i] = i;
>                 size[i] = 1;
>             }
>             groups = n;
>         }
>
>         int find(int x) {
>             if (parent[x] == x) return x;
>             parent[x] = find(parent[x]);
>             return parent[x];
>         }
>
>         int findIterative(int x) {
>             int root = x;
>             while (parent[root] != root) {
>                 root = parent[root];
>             }
>             while (parent[x] != root) {
>                 int next = parent[x];
>                 parent[x] = root;
>                 x = next;
>             }
>             return root;
>         }
>
>         boolean union(int a, int b) {
>             int rootA = find(a);
>             int rootB = find(b);
>             if (rootA == rootB) return false;
>
>             if (size[rootA] < size[rootB]) {
>                 int temp = rootA;
>                 rootA = rootB;
>                 rootB = temp;
>             }
>             parent[rootB] = rootA;
>             size[rootA] += size[rootB];
>             groups--;
>             return true;
>         }
>
>         boolean connected(int a, int b) {
>             return find(a) == find(b);
>         }
>
>         int groupSize(int x) {
>             return size[find(x)];
>         }
>     }
>
>     public static void main(String[] args) {
>         String[] names = {"민지", "도윤", "서아", "하준", "지우", "예린", "시우"};
>         int[][] friendships = {{0, 1}, {1, 2}, {3, 4}, {2, 0}, {5, 6}, {4, 5}};
>
>         UnionFind uf = new UnionFind(names.length);
>         for (int[] pair : friendships) {
>             boolean merged = uf.union(pair[0], pair[1]);
>             if (!merged) {
>                 System.out.println("이미 같은 무리: " + names[pair[0]] + "-" + names[pair[1]]);
>             }
>         }
>
>         System.out.println("친구 무리 수: " + uf.groups);
>         System.out.println("민지와 서아: " + uf.connected(0, 2));
>         System.out.println("민지와 시우: " + uf.connected(0, 6));
>         System.out.println("시우네 무리 크기: " + uf.groupSize(6));
>         System.out.println("parent: " + Arrays.toString(uf.parent));
>         System.out.println("반복 find(6): " + uf.findIterative(6));
>     }
> }
> ```
>
> ```text
> 이미 같은 무리: 서아-민지
> 친구 무리 수: 2
> 민지와 서아: true
> 민지와 시우: false
> 시우네 무리 크기: 4
> parent: [0, 0, 0, 3, 3, 3, 3]
> 반복 find(6): 3
> ```

## 유니온 파인드의 활용

연결을 다루는 도구는 유니온 파인드 말고도 있습니다.
문제에서 무엇을 묻는지 보고 고릅니다.

| 문제에서 묻는 것 | 고를 도구 |
| --- | --- |
| 값이 이미 나왔는지만 확인합니다 | `HashSet` |
| 연결을 하나씩 추가하며 같은 그룹인지 묻습니다 | 유니온 파인드 |
| 그룹 수나 그룹 크기를 셉니다 | 유니온 파인드 또는 BFS·DFS |
| 간선을 추가하다 사이클이 생기는 순간을 찾습니다 | 유니온 파인드 |
| 최단 거리나 방문 순서가 필요합니다 | BFS·DFS |
| 연결을 끊는 작업이 있습니다 | BFS·DFS로 다시 탐색 |

유니온 파인드는 합치기만 할 수 있고 한 번 합친 그룹을 다시 나누지는 못합니다.
그래서 연결이 끊기는 문제라면 끊긴 상태에서 다시 탐색하는 편이 맞습니다.
BFS·DFS를 Java로 쓰는 방법은 [Java로 그래프와 격자 탐색하기](#/learn/algorithm/grid-traversal)에서 알아봅니다.

## 정리

- Java에는 유니온 파인드가 없어서 `parent`·`size`·`groups`를 가진 작은 클래스를 직접 만듭니다.
- `find`는 경로 압축을 하고 `union`은 작은 무리의 대표를 큰 무리의 대표 아래에 붙인 뒤 합쳤는지를 `boolean`으로 돌려줍니다.
- 같은 무리인지는 `find(a) == find(b)`로 확인하고 무리 크기는 `size[find(x)]`로 읽습니다.
- `union`이 `true`일 때만 `groups`를 줄이면 연결 요소 수가 되고 `false`인 간선이 사이클을 만드는 간선입니다.

## 이어서 연습하기

[연결 뒤 남은 작업 구역 수](#/coding-tests/java/bridge-set-03)에서 `groups`로 남은 구역 수를 구해 봅니다.
[장비 연결 감사의 실패 요청 찾기](#/coding-tests/java/bridge-set-04)에서 연결과 확인이 섞인 요청을 순서대로 처리해 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: StackOverflowError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html)

## 핵심 질문 답

Java에서는 `int[] parent`와 `int[] size`를 필드로 가진 작은 클래스를 만들고 처음에 모든 원소가 자기 자신을 부모로 가리키게 합니다.
`find`는 부모를 따라 대표를 찾으면서 지나간 칸을 대표에 바로 연결하고 `union`은 작은 무리의 대표를 큰 무리의 대표 아래에 붙입니다.
`union`이 실제로 합쳤을 때만 그룹 수를 줄이면 연결 요소 수를 셀 수 있습니다.
`union`이 `false`를 돌려주는 간선은 이미 같은 그룹을 다시 잇는 것이므로 사이클을 만드는 간선입니다.
