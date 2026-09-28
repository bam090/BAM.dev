# 트리: 부모와 자식으로 이어진 구조

## 학습 목표

- 예제 트리에서 루트·부모·자식·리프와 깊이·높이를 찾을 수 있습니다.
- 깊이 우선(DFS)과 너비 우선(BFS) 순회의 차이를 설명하고 상황에 맞는 순회를 고를 수 있습니다.

## 한줄 요약

트리는 사이클 없이 부모와 자식으로 이어진 계층 구조이고 순회는 한 갈래를 끝까지 내려가는 DFS와 가까운 층부터 도는 BFS로 나뉩니다.

## 먼저 확인할 개념

[스택](#/learn/algorithm/stack-and-queue) · [큐](#/learn/algorithm/queue) · [클래스와 객체](#/learn/java/wiki-objects)

## 트리란

**트리**는 값이 부모와 자식 관계로 이어져 위에서 아래로 갈래를 치는 자료구조입니다.
배열과 리스트가 값을 한 줄로 늘어놓는 것과 달리 트리는 한 값 아래에 여러 값이 매달립니다.

예를 들어 컴퓨터의 폴더를 떠올려 보세요.
폴더 안에 폴더가 있고 그 안에 또 파일이 들어 있습니다.
이렇게 한 곳에서 여러 갈래로 뻗어 나가는 모양이 바로 트리입니다.

이 문서는 아래 트리 하나를 처음부터 끝까지 사용합니다.

![A가 맨 위에 있고 아래로 B와 C가 있으며 B 아래에 D와 E가 있고 C 아래에 F가 이어진 트리. 층마다 깊이 0·1·2가 표시되어 있고 A는 루트이고 D·E·F는 리프로 표시되어 있다.](content/assets/algorithm/tree-example.png)

그림의 원 하나하나가 값을 담은 **노드**이고 노드를 잇는 선이 **간선**입니다.
맨 위의 `A`에서 출발해 선을 따라 내려가면 모든 노드에 닿을 수 있습니다.

트리에는 한 가지 중요한 조건이 있습니다.
출발한 곳으로 다시 돌아오는 길인 **사이클**이 없어야 합니다.
만약 `F`와 `A`를 잇는 선을 하나 더 그으면 `A → C → F → A`로 한 바퀴 돌아 제자리에 오는 길이 생깁니다.
이렇게 사이클이 하나라도 생기는 순간 그 구조는 트리가 아니라 일반 그래프가 됩니다.

> [!question]- 사이클이란?
> 사이클은 간선을 따라가다가 출발한 노드로 다시 돌아오는 길입니다.
> 아래 그림에서 빨간 길을 따라가면 `A`에서 출발해 다시 `A`로 돌아옵니다.
>
> ![예제 트리에 F에서 A로 가는 점선을 하나 더 그어 A에서 C와 F를 거쳐 다시 A로 돌아오는 사이클이 생긴 모습](content/assets/algorithm/tree-cycle.png)
>
> 그래프에는 이런 사이클이 있을 수 있습니다.
> 그래서 그래프를 탐색할 때는 같은 노드를 두 번 방문하지 않도록 `visited`로 표시해 둡니다.
> 이 방문 표시는 [그래프와 BFS·DFS](#/learn/algorithm/bfs-dfs-graph-grid)에서 자세히 다룹니다.
>
> 트리에는 사이클이 없으므로 노드가 `N`개이면 간선은 항상 `N - 1`개입니다.
> 예제 트리도 노드 6개에 간선 5개입니다.

사이클이 없다는 조건 덕분에 트리는 다루기가 한결 쉬워집니다.
자식만 따라 내려가면 언젠가 반드시 끝에 닿기 때문입니다.
그래서 트리를 탐색할 때는 그래프처럼 `visited` 배열을 들고 다닐 필요가 없습니다.

## 트리의 용어

트리를 설명하는 용어는 몇 개 되지 않습니다.
예제 트리를 보면서 표의 오른쪽 열을 하나씩 찾아보면 금방 익숙해집니다.

![예제 트리. A는 루트이고 D·E·F는 리프이고 층마다 깊이 0·1·2가 표시되어 있다.](content/assets/algorithm/tree-example.png)

| 용어 | 뜻 | 예제 트리에서 |
| --- | --- | --- |
| 루트 | 부모가 없는 맨 위 노드 | `A` |
| 부모·자식 | 간선으로 바로 이어진 위·아래 노드 | `B`의 부모는 `A`이고 자식은 `D`·`E` |
| 형제 | 부모가 같은 노드 | `B`와 `C` |
| 리프 | 자식이 없는 노드 | `D`·`E`·`F` |
| 서브트리 | 한 노드와 그 아래 모든 노드 | `B`·`D`·`E`는 `B`를 루트로 하는 작은 트리 |
| 깊이 | 루트에서 그 노드까지 지나는 간선 수 | `A`는 0 · `B`는 1 · `D`는 2 |
| 높이 | 루트에서 가장 깊은 리프까지의 간선 수 | 이 트리의 높이는 2 |

깊이는 위에서 아래로 세고 높이는 가장 아래에서 위로 셉니다.
다만 자료에 따라 간선 대신 노드 수로 높이를 세기도 하니 문제를 풀 때는 기준부터 확인합니다.

## 트리의 종류

같은 트리라도 자식을 몇 개까지 가질 수 있는지와 값을 어떻게 배치하는지에 따라 이름이 달라집니다.

| 종류 | 조건 | 예 |
| --- | --- | --- |
| 일반 트리 | 자식 수에 제한이 없습니다 | 폴더 구조·회사 조직도 |
| 이진 트리 | 자식이 최대 두 개이고 `left`·`right`로 구분합니다 | 이 문서의 예제 트리 |
| 이진 탐색 트리 | 이진 트리 중에서 왼쪽 서브트리 값 < 부모 값 < 오른쪽 서브트리 값을 지킵니다 | 크기 순서가 필요한 검색 |

코딩테스트에서 가장 자주 만나는 형태는 이진 트리입니다.
이진 탐색 트리도 결국 이진 트리에 값을 놓는 규칙 하나를 더한 것이니 이진 트리부터 익혀 두면 됩니다.

## Java로 트리 구현

이제 예제 트리를 Java 코드로 옮겨 보겠습니다.
노드 하나는 값과 두 자식을 가리키는 칸으로 만듭니다.

```java
class Node {
    String value;
    Node left;
    Node right;

    Node(String value) {
        this.value = value;
    }
}
```

자식이 없는 칸은 `null`로 남겨 둡니다.
노드를 만든 다음 자식 칸에 하나씩 연결하면 그림과 같은 트리가 됩니다.

```java
Node a = new Node("A");
Node b = new Node("B");
Node c = new Node("C");
a.left = b;
a.right = c;
b.left = new Node("D");
b.right = new Node("E");
c.right = new Node("F");
```

여기서 눈여겨볼 점은 `a` 하나만 알면 나머지 노드에 전부 갈 수 있다는 것입니다.
그래서 트리를 다른 메서드에 넘길 때는 보통 루트 노드 하나만 넘깁니다.

## 트리 순회

배열은 인덱스 순서대로 읽으면 끝이지만 트리는 갈래가 여러 개라서 어떤 순서로 읽을지 정해야 합니다.
이렇게 모든 노드를 한 번씩 방문하는 일을 **순회**라고 합니다.
여기서 **방문**은 노드를 지나가는 것이 아니라 그 노드의 값을 실제로 처리하는 순간을 말합니다.

순회 방법은 크게 두 가지입니다.
한 갈래를 끝까지 내려간 뒤 돌아오는 **깊이 우선 탐색(DFS)**과 가까운 층을 모두 본 뒤 한 층씩 내려가는 **너비 우선 탐색(BFS)**입니다.
같은 트리를 두 방법으로 돌면 방문 순서가 이렇게 달라집니다.

![왼쪽은 깊이 우선 탐색으로 A·B·D·E·C·F 순서로 방문하며 한 갈래를 끝까지 내려가는 모습이고 오른쪽은 너비 우선 탐색으로 A·B·C·D·E·F 순서로 층마다 방문하는 모습](content/assets/algorithm/tree-dfs-bfs.png)

DFS는 `A`에서 `B`를 거쳐 `D`까지 한 번에 내려갑니다.
더 내려갈 곳이 없으면 가장 가까운 갈림길인 `B`로 돌아와 `E`를 보고 그다음에야 오른쪽 `C`로 넘어갑니다.
반면 BFS는 `A`를 본 뒤 한 층 아래의 `B`와 `C`를 모두 보고 나서야 그 아래층으로 내려갑니다.

두 방법의 차이는 다음 노드를 어디에 기억해 두느냐에서 나옵니다.

| | 깊이 우선 탐색 (DFS) | 너비 우선 탐색 (BFS) |
| --- | --- | --- |
| 가는 방향 | 한 갈래를 끝까지 내려간 뒤 돌아옵니다 | 가까운 층을 모두 본 뒤 내려갑니다 |
| 기억하는 도구 | 재귀 호출 또는 스택 | 큐 |
| 트리 순회 | 전위·중위·후위 순회 | 레벨 순회 |
| 잘 맞는 문제 | 끝까지 들어가 봐야 답이 나오는 문제 | 루트에서 가장 가까운 답을 찾는 문제 |

DFS가 스택을 쓰는 이유는 재귀 호출이 나중에 부른 함수부터 끝나는 스택 구조로 쌓이기 때문입니다.
그래서 가장 최근에 들어간 갈래부터 마무리하고 돌아 나옵니다.
BFS는 먼저 넣은 것을 먼저 꺼내는 큐를 쓰기 때문에 먼저 발견한 가까운 층부터 차례로 방문합니다.

### 깊이 우선: 전위·중위·후위 순회

깊이 우선 순회는 방문하는 시점에 따라 다시 세 가지로 나뉩니다.
세 순회 모두 재귀로 왼쪽 자식을 먼저 내려간 뒤 오른쪽 자식으로 가는 길은 똑같습니다.
다른 점은 딱 하나로 자기 자신을 출력하는 줄이 어디에 있느냐입니다.

```java
// 전위: 자신 → 왼쪽 → 오른쪽
static void preOrder(Node node) {
    if (node == null) return;
    System.out.print(node.value + " ");
    preOrder(node.left);
    preOrder(node.right);
}

// 중위: 왼쪽 → 자신 → 오른쪽
static void inOrder(Node node) {
    if (node == null) return;
    inOrder(node.left);
    System.out.print(node.value + " ");
    inOrder(node.right);
}

// 후위: 왼쪽 → 오른쪽 → 자신
static void postOrder(Node node) {
    if (node == null) return;
    postOrder(node.left);
    postOrder(node.right);
    System.out.print(node.value + " ");
}
```

첫 줄의 `if (node == null) return;`은 자식이 없는 칸에 도착하면 되돌아가라는 뜻입니다.
트리에는 사이클이 없으니 이 한 줄만으로 재귀가 반드시 멈춥니다.

코드를 실행하기 전에 `preOrder(a)`의 결과를 먼저 종이에 적어 보세요.
위 그림의 DFS 순서가 힌트입니다.
그다음 중위와 후위도 예상해 보세요.

```text
전위: A B D E C F
중위: D B E A C F
후위: D E B F C A
```

전위는 부모를 먼저 방문하니 루트 `A`가 맨 앞에 옵니다.
후위는 자식을 모두 방문한 뒤에 부모를 방문하니 `A`가 맨 뒤로 갑니다.
중위는 왼쪽 서브트리를 다 본 다음 부모를 방문하니 `A`가 가운데에 자리합니다.

### 너비 우선: 레벨 순회

레벨 순회는 그림을 책 읽듯이 윗줄부터 왼쪽에서 오른쪽으로 읽는 순서입니다.
이번에는 재귀 대신 큐를 사용합니다.

```java
static void levelOrder(Node root) {
    Queue<Node> queue = new ArrayDeque<>();
    queue.add(root);

    while (!queue.isEmpty()) {
        Node node = queue.poll();
        System.out.print(node.value + " ");
        if (node.left != null) queue.add(node.left);
        if (node.right != null) queue.add(node.right);
    }
}
```

```text
레벨: A B C D E F
```

반복할 때마다 큐 앞에서 노드 하나를 꺼내 방문하고 그 자식들을 큐 뒤에 넣습니다.
큐가 어떻게 바뀌는지 따라가 보면 한 층을 다 방문한 뒤에야 다음 층으로 내려가는 이유가 보입니다.

| 꺼내서 방문한 노드 | 뒤에 넣은 자식 | 방문 뒤 큐 |
| --- | --- | --- |
| `A` | `B`·`C` | `B` `C` |
| `B` | `D`·`E` | `C` `D` `E` |
| `C` | `F` | `D` `E` `F` |
| `D` | 없음 | `E` `F` |
| `E` | 없음 | `F` |
| `F` | 없음 | 비어 있음 |

`B`의 자식 `D`·`E`는 큐에 들어가도 이미 기다리던 `C` 뒤에 섭니다.
그래서 같은 층의 `C`가 먼저 방문되고 그 뒤에 아래층이 이어집니다.

> [!note]- 전체 코드 보기
> 위 코드 조각을 하나로 합친 프로그램입니다.
> `TreeTraversal.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayDeque;
> import java.util.Queue;
>
> public class TreeTraversal {
>     static class Node {
>         String value;
>         Node left;
>         Node right;
>
>         Node(String value) {
>             this.value = value;
>         }
>     }
>
>     static void preOrder(Node node) {
>         if (node == null) return;
>         System.out.print(node.value + " ");
>         preOrder(node.left);
>         preOrder(node.right);
>     }
>
>     static void inOrder(Node node) {
>         if (node == null) return;
>         inOrder(node.left);
>         System.out.print(node.value + " ");
>         inOrder(node.right);
>     }
>
>     static void postOrder(Node node) {
>         if (node == null) return;
>         postOrder(node.left);
>         postOrder(node.right);
>         System.out.print(node.value + " ");
>     }
>
>     static void levelOrder(Node root) {
>         Queue<Node> queue = new ArrayDeque<>();
>         queue.add(root);
>
>         while (!queue.isEmpty()) {
>             Node node = queue.poll();
>             System.out.print(node.value + " ");
>             if (node.left != null) queue.add(node.left);
>             if (node.right != null) queue.add(node.right);
>         }
>     }
>
>     public static void main(String[] args) {
>         Node a = new Node("A");
>         Node b = new Node("B");
>         Node c = new Node("C");
>         a.left = b;
>         a.right = c;
>         b.left = new Node("D");
>         b.right = new Node("E");
>         c.right = new Node("F");
>
>         System.out.print("전위: ");
>         preOrder(a);
>         System.out.println();
>         System.out.print("중위: ");
>         inOrder(a);
>         System.out.println();
>         System.out.print("후위: ");
>         postOrder(a);
>         System.out.println();
>         System.out.print("레벨: ");
>         levelOrder(a);
>         System.out.println();
>     }
> }
> ```
>
> ```text
> 전위: A B D E C F
> 중위: D B E A C F
> 후위: D E B F C A
> 레벨: A B C D E F
> ```

## 트리 순회의 활용

그렇다면 실제로는 어떤 순회를 골라야 할까요?
기준은 부모와 자식 중 무엇을 먼저 처리해야 하는지입니다.

| 순회 | 먼저 처리하는 것 | 쓰는 곳 |
| --- | --- | --- |
| 전위 | 부모 | 폴더 구조를 위에서부터 출력하기·트리 복사하기 |
| 중위 | 왼쪽 서브트리 | 이진 탐색 트리의 값을 작은 순서대로 꺼내기 |
| 후위 | 자식 | 폴더 용량 합계 구하기·폴더 삭제하기 |
| 레벨 | 가까운 층 | 루트에서 가장 가까운 노드 찾기·층별로 묶어 처리하기 |

폴더 용량을 예로 들어 보겠습니다.
폴더 하나의 용량을 알려면 그 안에 든 폴더들의 용량부터 알아야 합니다.
그래서 자식을 먼저 처리하는 후위 순회를 씁니다.
폴더를 지울 때도 안을 먼저 비워야 하므로 같은 이유로 후위 순회입니다.

트리는 코딩테스트 밖에서도 자주 만납니다.
웹페이지의 HTML 요소 구조인 DOM도 트리이고 데이터베이스가 값을 빨리 찾으려고 만드는 인덱스도 트리 모양입니다.

## 정리

- 트리는 사이클 없이 부모와 자식으로 이어진 구조라서 `visited` 없이 끝까지 내려갈 수 있습니다.
- DFS는 재귀나 스택으로 한 갈래를 끝까지 내려가고 BFS는 큐로 가까운 층부터 방문합니다.
- 전위·중위·후위는 자기 자신을 방문하는 시점만 다른 DFS이고 레벨 순회는 BFS입니다.
- 순회는 부모와 자식 중 무엇을 먼저 처리해야 하는지를 보고 고릅니다.

## 이어서 연습하기

[Java에서 트리 활용하기: TreeMap·TreeSet](#/learn/algorithm/tree-java)에서 Java가 제공하는 트리를 써 봅니다.
[나무 끝 상자의 값 합계](#/coding-tests/java/bridge-tre-01)에서 리프를 찾아 값을 더해 봅니다.

## 공식 자료

- [Java 25 API: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)

## 핵심 질문 답

부모와 자식으로 이어진 구조는 순회로 모든 노드를 한 번씩 방문합니다.
한 갈래를 끝까지 내려가는 깊이 우선 탐색(DFS)은 재귀나 스택을 쓰고 전위·중위·후위 순회가 여기에 속합니다.
가까운 층부터 방문하는 너비 우선 탐색(BFS)은 큐를 쓰고 레벨 순회가 여기에 속합니다.
부모를 먼저 처리해야 하면 전위를 쓰고 자식 결과가 먼저 필요하면 후위를 씁니다.
가장 가까운 답을 찾을 때는 레벨 순회를 씁니다.
