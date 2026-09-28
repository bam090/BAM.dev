# 스택: 나중에 넣은 것부터 꺼내기

## 학습 목표

- 스택의 LIFO 규칙과 `push`·`pop`·`peek`이 스택을 어떻게 바꾸는지 설명할 수 있습니다.
- 괄호 짝 맞추기나 되돌리기처럼 가장 최근 값을 먼저 처리해야 하는 문제에서 스택을 떠올릴 수 있습니다.

## 한줄 요약

스택은 가장 나중에 넣은 값을 가장 먼저 꺼내는 LIFO 자료구조이고 넣기·꺼내기·보기가 모두 맨 위 한곳에서 `O(1)`에 일어납니다.

## 먼저 확인할 개념

[자료구조와 알고리즘: 시간 복잡도로 고르기](#/learn/algorithm/data-structures-and-algorithms) · [배열: 번호로 바로 꺼내는 자료구조](#/learn/algorithm/array)

## 스택이란

**스택**은 가장 나중에 넣은 값을 가장 먼저 꺼내는 자료구조입니다.
배열은 아무 칸이나 번호로 꺼낼 수 있지만 스택은 꺼낼 수 있는 자리가 맨 위 한곳뿐입니다.
이렇게 꺼내는 순서를 자료구조가 정해 두면 "가장 최근 것부터 처리한다"는 규칙을 코드에서 따로 챙기지 않아도 됩니다.

스택의 맨 위를 **top**이라고 합니다.
값을 넣는 일과 꺼내는 일이 모두 top에서 일어납니다.
나중에 들어온 것이 먼저 나간다는 뜻의 영어 Last In First Out을 줄여 **LIFO**라고 부릅니다.

![Stack은 Last In First Out이라서 나중에 들어온 것이 먼저 나간다. 통 안에 아래부터 1·2·3이 쌓여 있고 넣기와 꺼내기가 모두 위쪽 입구에서 일어난다. 1·2·3 순서로 들어오면 3·2·1 역순으로 나간다.](content/assets/algorithm/stack-lifo.png)

접시를 쌓아 두고 맨 위 접시부터 꺼내는 모습과 같습니다.
1·2·3 순서로 넣으면 꺼낼 때는 3·2·1 순서로 나옵니다.

예를 들어 웹 브라우저의 뒤로 가기 기록을 떠올려 보세요.
홈에서 검색 페이지로 가고 다시 상품 페이지로 들어갔다면 뒤로 가기를 눌렀을 때 가장 최근에 본 상품 페이지부터 떠나 검색 페이지로 돌아옵니다.
이 문서는 이 방문 기록 하나로 끝까지 설명합니다.

## 스택의 연산

스택이 하는 일은 네 가지뿐입니다.

| 연산 | 하는 일 | 방문 기록에서 |
| --- | --- | --- |
| `push(x)` | top에 `x`를 올립니다 | 새 페이지로 이동합니다 |
| `pop()` | top의 값을 꺼내 돌려주고 스택에서 지웁니다 | 뒤로 가기로 지금 페이지를 떠납니다 |
| `peek()` | top의 값을 꺼내지 않고 보기만 합니다 | 지금 보고 있는 페이지를 확인합니다 |
| `isEmpty()` | 스택이 비었는지 알려 줍니다 | 더 돌아갈 페이지가 있는지 확인합니다 |

세 페이지를 방문한 뒤 뒤로 가기를 한 번 누르면 스택은 이렇게 바뀝니다.

![방문 기록 스택이 바뀌는 다섯 단계. 1단계 push 홈 · 2단계 push 검색 · 3단계 push 상품으로 위에 하나씩 쌓인다. 4단계 pop은 맨 위의 상품을 꺼내 스택에는 홈과 검색이 남는다. 5단계 peek은 맨 위의 검색을 꺼내지 않고 보기만 한다.](content/assets/algorithm/stack-push-pop.png)

`push`를 할 때마다 새 값이 이전 값 위에 올라가고 top이 한 칸 위로 이동합니다.
4단계의 `pop()`은 맨 위의 `상품`을 꺼내므로 top은 그 아래의 `검색`으로 내려옵니다.
반면 5단계의 `peek()`은 `검색`을 보기만 하고 꺼내지 않으니 스택은 4단계와 같습니다.

`pop`과 `peek`의 차이는 값을 스택에서 지우느냐 하나뿐입니다.
지금 페이지를 확인만 하고 싶은데 `pop`을 부르면 기록이 사라지니 둘을 구분해서 씁니다.

### 빈 스택

4단계에서 뒤로 가기를 두 번 더 누르면 `검색`과 `홈`까지 꺼내져 스택이 비게 됩니다.
빈 스택에는 꺼낼 값이 없으므로 이때 `pop`을 부르면 오류가 납니다.
그래서 꺼내기 전에 `isEmpty()`로 비었는지 먼저 확인합니다.

코딩테스트에서도 빈 스택을 확인하는 한 줄이 답을 가르는 경우가 많습니다.
아래 괄호 검사처럼 "꺼낼 것이 없다"는 사실 자체가 답이 되기도 하기 때문입니다.

## 배열로 스택 구현

스택이 어떻게 모든 연산을 맨 위 한곳에서 해내는지 배열로 직접 만들어 보겠습니다.
값을 담을 배열 `data`와 맨 위 칸의 번호를 기억하는 `top` 두 가지만 있으면 됩니다.

![칸이 5개인 배열 data의 0번부터 2번 칸에 홈·검색·상품이 들어 있고 3번과 4번 칸은 비어 있다. top은 2를 가리킨다.](content/assets/algorithm/stack-array.png)

`top`은 처음에 `-1`로 두어 아직 아무 칸도 쓰지 않았다는 것을 나타냅니다.
`push`는 `top`을 한 칸 올린 뒤 그 칸에 값을 넣고 `pop`은 `top` 칸의 값을 꺼낸 뒤 `top`을 한 칸 내립니다.

```java
static class ArrayStack {
    String[] data = new String[5];
    int top = -1;

    void push(String page) {
        top++;
        data[top] = page;
    }

    String pop() {
        String page = data[top];
        data[top] = null;
        top--;
        return page;
    }

    String peek() {
        return data[top];
    }

    boolean isEmpty() {
        return top == -1;
    }
}
```

`홈`·`검색`·`상품`을 차례로 `push`한 뒤 `peek`과 `pop`을 부르면 무엇이 나올지 예상해 보세요.

```java
ArrayStack history = new ArrayStack();
history.push("홈");
history.push("검색");
history.push("상품");
System.out.println("지금 페이지: " + history.peek());

System.out.println("뒤로 가기: " + history.pop());
System.out.println("지금 페이지: " + history.peek());

history.pop();
history.pop();
System.out.println("기록이 비었나요? " + history.isEmpty());
```

```text
지금 페이지: 상품
뒤로 가기: 상품
지금 페이지: 검색
기록이 비었나요? true
```

`pop()`은 떠나는 페이지인 `상품`을 돌려주고 그 뒤의 `peek()`은 돌아온 `검색`을 보여 줍니다.
남은 두 페이지까지 꺼내면 `top`이 다시 `-1`이 되어 `isEmpty()`가 `true`를 돌려줍니다.
이 상태에서 `pop()`을 한 번 더 부르면 `data[-1]`을 읽게 되어 `ArrayIndexOutOfBoundsException`이 납니다.

세 연산 모두 `top` 칸 하나만 건드리고 다른 원소를 옮기지 않습니다.
배열의 맨 끝에 넣고 빼는 일이 `O(1)`이었던 것처럼 스택의 `push`·`pop`·`peek`도 모두 `O(1)`입니다.

> [!question]- 스택이 가득 차면?
> 이 예제의 `data`는 칸이 5개라서 여섯 번째 `push`를 하면 넣을 칸이 없습니다.
> 길이가 고정된 배열로 만든 스택은 이럴 때를 대비해 `isFull()` 같은 확인을 따로 둡니다.
>
> Java가 제공하는 `ArrayDeque`는 칸이 모자라면 내부 배열을 스스로 키우므로 `isFull()`이 없습니다.
> 실제 코드에서는 이 문서처럼 직접 만들지 않고 `ArrayDeque`를 씁니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `BrowserHistory.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> public class BrowserHistory {
>     static class ArrayStack {
>         String[] data = new String[5];
>         int top = -1;
>
>         void push(String page) {
>             top++;
>             data[top] = page;
>         }
>
>         String pop() {
>             String page = data[top];
>             data[top] = null;
>             top--;
>             return page;
>         }
>
>         String peek() {
>             return data[top];
>         }
>
>         boolean isEmpty() {
>             return top == -1;
>         }
>     }
>
>     public static void main(String[] args) {
>         ArrayStack history = new ArrayStack();
>         history.push("홈");
>         history.push("검색");
>         history.push("상품");
>         System.out.println("지금 페이지: " + history.peek());
>
>         System.out.println("뒤로 가기: " + history.pop());
>         System.out.println("지금 페이지: " + history.peek());
>
>         history.pop();
>         history.pop();
>         System.out.println("기록이 비었나요? " + history.isEmpty());
>     }
> }
> ```
>
> ```text
> 지금 페이지: 상품
> 뒤로 가기: 상품
> 지금 페이지: 검색
> 기록이 비었나요? true
> ```

Java에서 스택을 쓰는 방법은 [Java로 스택 쓰기](#/learn/algorithm/stack-java)에서 알아봅니다.

## 스택의 활용

그렇다면 코딩테스트에서는 언제 스택을 떠올려야 할까요?
기준은 **가장 최근에 넣은 값과 비교하거나 가장 최근 상태로 되돌아가야 하는지**입니다.
대표적인 예가 괄호 짝 맞추기입니다.

괄호 문자열 `(()())`가 올바르게 짝지어졌는지 확인한다고 해 보겠습니다.
여는 괄호를 만나면 스택에 넣고 닫는 괄호를 만나면 가장 최근에 넣은 여는 괄호를 꺼내 짝을 지웁니다.

| 읽은 문자 | 한 일 | 스택 (오른쪽이 top) |
| --- | --- | --- |
| `(` | push | `(` |
| `(` | push | `(` `(` |
| `)` | pop으로 짝 지우기 | `(` |
| `(` | push | `(` `(` |
| `)` | pop으로 짝 지우기 | `(` |
| `)` | pop으로 짝 지우기 | 비어 있음 |

끝까지 읽었을 때 스택이 비어 있으면 모든 괄호가 짝을 찾은 것입니다.
반대로 `())`처럼 닫는 괄호를 만났는데 스택이 비어 있거나 `(()`처럼 다 읽고도 여는 괄호가 남아 있으면 올바르지 않은 괄호입니다.
닫는 괄호는 늘 가장 최근에 열린 괄호와 짝을 이루기 때문에 LIFO인 스택이 딱 맞습니다.

같은 생각으로 풀리는 문제를 모으면 다음과 같습니다.

| 쓰는 곳 | 스택에 넣는 것 | 꺼내는 때 |
| --- | --- | --- |
| 괄호 짝 맞추기 | 여는 괄호 | 닫는 괄호를 만날 때 |
| 되돌리기(실행 취소) | 지금까지 한 작업 | 되돌리기를 누를 때 가장 최근 작업부터 |
| 뒤로 가기 | 방문한 페이지 | 뒤로 가기를 누를 때 |
| 깊이 우선 탐색(DFS) | 다음에 방문할 노드 | 가장 최근에 발견한 갈래부터 |

DFS는 한 갈래를 끝까지 내려간 뒤 가장 가까운 갈림길로 돌아오는데 이것이 바로 가장 최근 상태로 되돌아가는 일입니다.
재귀 호출도 나중에 부른 함수부터 끝나는 스택 구조로 쌓입니다.
트리에서 이 순서를 확인하려면 [트리: 부모와 자식으로 이어진 구조](#/learn/algorithm/tree-basics)를 봅니다.

반대로 먼저 들어온 것부터 차례로 처리해야 한다면 스택이 아니라 큐를 씁니다.
큐는 [큐](#/learn/algorithm/queue)에서 다룹니다.

## 정리

- 스택은 가장 나중에 넣은 값을 가장 먼저 꺼내는 LIFO 자료구조이고 넣기와 꺼내기가 모두 top에서 일어납니다.
- `push`는 top에 올리고 `pop`은 top을 꺼내 지우며 `peek`은 top을 보기만 합니다.
- 빈 스택에서는 꺼낼 값이 없으므로 `pop` 전에 `isEmpty()`로 확인합니다.
- 가장 최근 값과 비교하거나 최근 상태로 되돌아가야 하는 문제에서 스택을 떠올립니다.

## 이어서 연습하기

[Java로 스택 쓰기](#/learn/algorithm/stack-java)에서 `ArrayDeque`로 괄호 검사를 구현해 봅니다.
[겹쳐 쌓은 상자 기록의 첫 오류](#/coding-tests/java/bridge-stk-01)에서 맨 위 상자와 꺼낸 번호를 비교해 봅니다.
[거꾸로 찾은 체크포인트 경로](#/coding-tests/java/bridge-stk-02)에서 거꾸로 만난 순서를 스택으로 뒤집어 봅니다.

## 공식 자료

- [Java 25 API: Deque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html)

## 핵심 질문 답

스택은 가장 나중에 넣은 값을 가장 먼저 꺼내는 LIFO 자료구조입니다.
`push`로 top에 올리고 `pop`으로 top을 꺼내며 `peek`으로 top을 보기만 하고 세 연산 모두 맨 위 한곳만 건드리므로 `O(1)`입니다.
빈 스택에서는 꺼낼 값이 없으니 `isEmpty()`로 먼저 확인합니다.
괄호 짝 맞추기·되돌리기·뒤로 가기·DFS처럼 가장 최근 값과 비교하거나 가장 최근 상태로 돌아가야 하는 문제에 스택을 씁니다.
