# 트리

## 학습 목표

- 트리의 노드·간선·루트·부모·자식·리프를 설명할 수 있습니다.
- 노드의 깊이와 트리의 높이를 간선 수 기준으로 구할 수 있습니다.
- 전위 순회와 레벨 순회의 방문 순서를 추적할 수 있습니다.
- 재귀 스택과 큐를 사용한 트리 순회의 차이를 설명할 수 있습니다.

## 한줄 요약

트리는 순환 없이 연결된 구조이며, 루트를 정하면 부모·자식 관계를 전위 순회나 레벨 순회로 읽을 수 있습니다.

## 먼저 확인할 개념

[BFS·DFS와 그래프·격자 탐색](#/learn/algorithm/bfs-dfs-graph-grid)의 방문 순서를 먼저 확인하세요.
예제의 노드 객체와 자식 목록은 [클래스·객체·참조](#/learn/java/wiki-objects)와 [List](#/learn/java/wiki-lists)로 표현합니다.

## 개념 연결

- 선행: `algo.graph-representation`, `algo.bfs`, `algo.dfs`, `algo.stack`, `algo.queue`, `java.objects`, `java.lists`
- 이 단원: `algo.tree`, `algo.tree-traversal`
- 후속: `algo.simulation`, `algo.dynamic-programming-advanced`

## 부모와 자식으로 읽는 연결

폴더 안의 하위 폴더나 메뉴의 하위 항목처럼 계층 관계를 읽을 때 트리가 유용합니다.
**트리**는 무방향 그래프로 볼 때 모든 노드가 연결되어 있고 순환이 없는 구조입니다.
두 노드 사이에는 하나의 단순 경로만 있습니다.

루트를 정하지 않은 트리에는 본래 위아래가 없습니다.
한 노드를 시작점인 **루트**로 정한 뒤 다음 관계를 읽습니다.

| 용어 | 뜻 |
| --- | --- |
| 노드 | 값을 담는 한 지점 |
| 간선 | 두 노드의 연결 |
| 루트 | 부모가 없는 시작 노드 |
| 부모·자식 | 루트에서 내려갈 때 바로 위·아래 노드의 관계 |
| 리프 | 자식이 없는 노드 |
| 서브트리 | 한 노드와 그 아래 모든 자손으로 이루어진 작은 트리 |

루트 하나만 있는 트리에서는 그 노드가 루트이면서 리프입니다.

## 깊이와 높이는 어떤 기준으로 셀까요?

이 문서는 **간선 수**를 기준으로 셉니다.
노드의 깊이는 루트에서 그 노드까지 지나는 간선 수이고, 트리의 높이는 가장 깊은 리프의 깊이입니다.
루트의 깊이는 `0`, 루트만 있는 트리의 높이도 `0`입니다.

예제에서 `A`의 자식은 `B`, `C`이고 `B`의 자식은 `D`, `E`입니다.
`B`, `C`의 깊이는 `1`, `D`, `E`의 깊이는 `2`이므로 트리의 높이는 `2`입니다.
자료에 따라 노드 수를 기준으로 높이를 세기도 하므로 문제의 기준을 먼저 확인합니다.

## 일반 트리와 이진 트리

일반 트리의 노드는 여러 자식을 가질 수 있습니다.
이진 트리는 각 노드가 최대 두 자식, 즉 왼쪽 자식과 오른쪽 자식을 갖습니다.

**자식이 최대 두 개라는 조건만으로 값이 정렬되지는 않습니다.**
이진 탐색 트리에는 키의 순서 규칙이, 힙에는 부모·자식 사이의 우선순위 규칙이 추가로 필요합니다.

## 전위 순회와 레벨 순회

순회는 정해진 규칙으로 각 노드를 방문하는 과정입니다.
전위 순회는 **현재 노드 → 첫 자식의 서브트리 → 다음 자식의 서브트리** 순서입니다.
한 자식의 탐색을 끝내고 돌아오므로 재귀 호출 스택으로 표현하기 쉽습니다.

레벨 순회는 **깊이가 같은 노드부터 발견한 순서대로** 처리합니다.
큐에 자식을 넣고 앞에서 하나씩 꺼내면 루트 다음에 자식들, 그다음에 손자들을 방문합니다.

**먼저 예상해 보세요.** `A` 다음에 `B`를 방문한 뒤, 전위 순회는 `C`와 `D` 중 어디로 가고 레벨 순회는 어디로 갈까요?

## Java 예제: 노드 객체를 만들고 순회하기

정식 Java 25 예제입니다.
`Node`는 값과 자식 목록을 보관하는 클래스입니다.
`new Node("A")`로 노드를 만들고 `children.add()`로 자식을 연결합니다.
예제는 같은 자식을 여러 부모에 연결하지 않고 부모로 돌아가는 참조도 저장하지 않는 유효한 트리입니다.

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class TreeTraversalExample {
    static final class Node {
        final String value;
        final List<Node> children = new ArrayList<>();

        Node(String value) {
            this.value = value;
        }
    }

    static void visitPreorder(Node node, List<String> result) {
        result.add(node.value);
        for (Node child : node.children) {
            visitPreorder(child, result);
        }
    }

    static List<String> preorder(Node root) {
        List<String> result = new ArrayList<>();
        if (root != null) visitPreorder(root, result);
        return result;
    }

    static List<String> levelOrder(Node root) {
        List<String> result = new ArrayList<>();
        if (root == null) return result;
        Deque<Node> queue = new ArrayDeque<>();
        queue.offerLast(root);
        while (!queue.isEmpty()) {
            Node current = queue.removeFirst();
            result.add(current.value);
            for (Node child : current.children) {
                queue.offerLast(child);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        Node a = new Node("A");
        Node b = new Node("B");
        Node c = new Node("C");
        Node d = new Node("D");
        Node e = new Node("E");
        a.children.add(b);
        a.children.add(c);
        b.children.add(d);
        b.children.add(e);

        System.out.println(preorder(a));
        System.out.println(levelOrder(a));
        System.out.println(preorder(null));
    }
}
```

예상 출력:

```text
[A, B, D, E, C]
[A, B, C, D, E]
[]
```

## 실행 흐름에서 확인할 지점

전위 순회는 `A`를 기록한 뒤 `B → D`로 내려갔다가 돌아옵니다.
다음 자식 `E`까지 방문한 뒤 `A`로 돌아와 `C`를 방문합니다.
현재 노드를 기록하는 `result.add()`를 자식의 재귀 호출보다 먼저 실행하기 때문에 이 순서가 됩니다.

레벨 순회는 큐의 앞에서 꺼내고 자식을 뒤에 넣습니다.

| 꺼낸 노드 | 추가한 자식 | 처리 후 큐 |
| --- | --- | --- |
| A | B, C | B, C |
| B | D, E | C, D, E |
| C | 없음 | D, E |
| D | 없음 | E |
| E | 없음 | 비어 있음 |

두 순회 모두 `n`개 노드를 한 번씩 처리하므로 시간은 `O(n)`입니다.
결과 목록은 둘 다 `O(n)` 공간을 사용합니다.
그 밖에 전위 순회의 재귀 호출 공간은 높이에, 레벨 순회의 큐 공간은 가장 넓은 층의 노드 수에 비례합니다.
한쪽으로 길게 이어지는 트리에서는 재귀 깊이 한계를 고려해야 합니다.

## 흔한 실수와 직접 확인하기

- 루트는 시작 위치이고 리프는 자식이 없는 상태입니다. 두 용어를 같은 뜻으로 쓰지 마세요.
- 전위 순회에서 자식을 먼저 처리하면 현재 노드를 먼저 방문한다는 규칙이 바뀝니다.
- 레벨 순회에서 큐 대신 스택을 쓰면 같은 깊이부터 처리하는 순서가 유지되지 않습니다.
- 부모 방향의 간선도 저장했다면 이전 노드를 제외하거나 방문 여부를 기록해야 합니다. 예제에 방문 배열이 없는 이유는 자식 방향만 따라가기 때문입니다.
- `ArrayDeque`에는 `null`을 넣을 수 없습니다. 예제는 빈 트리인 `root == null`을 큐 생성 전에 처리합니다.

루트 하나인 트리, 자식이 셋인 트리, 자식 하나로 길게 이어진 트리의 두 순회를 손으로 써 보세요.
각 노드의 깊이를 간선 수로 계산한 뒤 어떤 구조가 재귀 공간과 큐 공간을 많이 쓰는지 설명해 보세요.

## 이어서 학습하기

[구현과 문자열 시뮬레이션](#/learn/algorithm/implementation-and-string-simulation)에서 입력 규칙에 따라 상태를 바꾸는 순서를 정리하세요.

## 공식 자료

- [NIST: Tree](https://xlinux.nist.gov/dads/HTML/tree.html)
- [Princeton Algorithms: Graphs and Trees](https://algs4.cs.princeton.edu/41graph/)
- [Java 25: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
- [Java 25: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 트리와 순회 예제를 Java의 노드 객체·자식 목록·큐로 재구성했습니다.

## 핵심 질문 답

부모와 자식으로 이어진 유효한 트리는 각 노드의 자식 목록을 따라가며 방문합니다.
현재 노드를 먼저 처리하고 자식의 서브트리를 차례대로 끝내면 전위 순회이며, 예제에서는 `A, B, D, E, C`입니다.
큐로 같은 깊이의 노드부터 처리하면 레벨 순회이며 `A, B, C, D, E`입니다.
루트·부모·자식·리프 관계와 깊이의 기준을 먼저 정하고, 부모 방향도 탐색하는 표현이라면 되돌아가는 방문을 막아야 합니다.
