# 스택과 큐: 값을 꺼내는 순서

## 학습 목표

- 스택의 LIFO와 큐의 FIFO 순서를 구분하고 다음 처리 대상에 맞게 선택할 수 있습니다.
- `Deque`와 `ArrayDeque`로 스택·큐를 만들고 넣기·확인·꺼내기·빈 상태를 구분할 수 있습니다.

## 한줄 요약

스택은 마지막에 넣은 값을, 큐는 먼저 넣은 값을 꺼내며, `ArrayDeque`에 적용하는 메서드 조합으로 그 순서를 지킵니다.

## 먼저 확인할 개념

[리스트와 조건문: 여러 값에서 조건에 맞는 값 찾기](#/learn/algorithm/list-and-conditions), [메서드의 입력·출력 계약](#/learn/java/wiki-methods), [Deque로 큐와 스택 사용하기](#/learn/java/wiki-deque)를 먼저 확인해 보세요.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `java.methods`, `java.deque`
- 이 단원: `algo.stack`, `algo.queue`
- 후속: `algo.hashing`, `algo.map-collection`, `algo.set-collection`

## 스택은 마지막에 넣은 값을 먼저 꺼낸다

**스택(Stack)**은 후입선출, 즉 **LIFO(Last In, First Out)** 규칙을 따릅니다. 실행 취소나 괄호 검사처럼 가장 최근 상태가 다음 처리 대상일 때 사용합니다.
스택에서는 값을 넣는 `push()`, 다음 값을 보는 `peek()`, 값을 꺼내는 `pop()`이 같은 끝을 사용합니다.
`peek()`은 값을 남겨 두고 확인하지만 `pop()`은 반환한 값을 스택에서 제거합니다.

![스택에 1, 2, 3을 차례로 넣으면 3, 2, 1 순서로 꺼냅니다. 넣기와 꺼내기는 같은 끝에서 일어납니다.](content/assets/algorithm/stack-lifo.png)

## 큐는 먼저 넣은 값을 먼저 꺼낸다

**큐(Queue)**는 선입선출, 즉 **FIFO(First In, First Out)** 규칙을 따릅니다. 대기 작업이나 너비 우선 탐색처럼 먼저 들어온 순서를 유지할 때 사용합니다.
이 문서의 큐는 뒤에 `offer()`로 넣고 앞의 값을 `peek()`으로 확인하거나 `poll()`로 꺼냅니다.

![큐에 1, 2, 3을 차례로 넣으면 1, 2, 3 순서로 꺼냅니다. 새 값은 뒤에 넣고 오래 기다린 값은 앞에서 꺼냅니다.](content/assets/algorithm/queue-fifo.png)

Java의 `Queue` 인터페이스를 구현했다고 모든 객체가 FIFO인 것은 아닙니다. 여기서는 `ArrayDeque`를 위 메서드 조합으로 사용하므로 FIFO입니다.
들어온 순서와 관계없이 가장 중요한 값을 꺼내야 한다면 뒤에서 배울 우선순위 큐가 필요합니다.

## 객체 생성과 주요 메서드

`Deque`는 양쪽 끝에서 넣고 뺄 수 있는 기능을 정한 인터페이스이고, `ArrayDeque`는 실제 저장을 담당하는 구현 클래스입니다.
`Deque<String> stack = new ArrayDeque<>();`처럼 생성하고 사용할 규칙을 정합니다. 새 스택 코드에서는 오래된 `java.util.Stack`보다 `Deque`를 먼저 검토합니다.

| 할 일 | 스택 | FIFO 큐 |
| --- | --- | --- |
| 빈 객체 생성 | `Deque<String> stack = new ArrayDeque<>();` | `Deque<String> queue = new ArrayDeque<>();` |
| 값 넣기 | `stack.push(value)` | `queue.offer(value)` |
| 다음 값 확인 | `stack.peek()` | `queue.peek()` |
| 값 꺼내기 | `stack.pop()` | `queue.poll()` |
| 남은 개수 | `stack.size()` | `queue.size()` |
| 빈 상태 | `stack.isEmpty()` | `queue.isEmpty()` |

스택의 `push()`·`pop()`은 앞쪽을 함께 사용합니다. 큐의 `offer()`는 뒤에 넣고 `poll()`은 앞에서 꺼냅니다.
메서드 조합을 섞으면 처리 순서가 달라집니다. 특히 `offer()`로 넣고 `pop()`으로 꺼내는 동작을 스택이라고 부르면 안 됩니다.

## 빈 상태는 예외 또는 특별값으로 알린다

| `ArrayDeque`에서 시도한 동작 | 빈 상태의 결과 |
| --- | --- |
| `pop()` | `NoSuchElementException` |
| `peek()` | `null` |
| `poll()` | `null` |

빈 상태가 생길 수 있는 스택은 `isEmpty()`를 확인한 뒤 `pop()`합니다.
큐의 `poll()` 결과가 `null`이면 꺼낼 값이 없다는 뜻입니다.
`ArrayDeque`는 `null` 원소를 금지하며 넣으면 `NullPointerException`이 발생하므로, `peek()`·`poll()`의 `null`을 저장된 값과 혼동하지 않습니다.

큐의 `offer()`가 모든 삽입 오류를 `false`로 바꾸는 것은 아닙니다. `ArrayDeque`는 필요에 따라 커지며, 여기에 `null`을 넣는 잘못은 `offer()`에서도 예외가 됩니다.

## 같은 값의 순서와 실제 처리 흐름 비교하기

다음 예제의 `hasBalancedParentheses`는 문자열의 `(`와 `)`만 검사하고 다른 문자는 무시합니다.
`processJobs`는 기존 대기 작업 뒤에 새 작업을 붙여 FIFO를 유지합니다. 다음 코드를 `StackQueueDemo.java`에 저장할 수 있습니다.

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class StackQueueDemo {
    public static void main(String[] args) {
        Deque<String> stack = new ArrayDeque<>();
        stack.push("홈");
        stack.push("검색");
        stack.push("상세");
        System.out.println("스택 다음 값: " + stack.peek());
        System.out.println("스택에서 꺼낸 값: " + stack.pop());
        System.out.println("스택 남은 개수: " + stack.size());

        Deque<String> queue = new ArrayDeque<>();
        queue.offer("첫째");
        queue.offer("둘째");
        System.out.println("큐 다음 값: " + queue.peek());
        System.out.println("큐에서 꺼낸 값: " + queue.poll());
        System.out.println("큐가 비었는가: " + queue.isEmpty());

        System.out.println(hasBalancedParentheses("(a + b) * (c - d)"));
        System.out.println(hasBalancedParentheses("(()"));
        System.out.println(hasBalancedParentheses(")("));
        System.out.println(processJobs(List.of("분석", "검토")));
    }

    static boolean hasBalancedParentheses(String text) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char character : text.toCharArray()) {
            if (character == '(') {
                stack.push(character);
                continue;
            }

            if (character == ')') {
                if (stack.isEmpty()) return false;
                stack.pop();
            }
        }

        return stack.isEmpty();
    }

    static List<String> processJobs(List<String> initialJobs) {
        Deque<String> queue = new ArrayDeque<>(initialJobs);
        List<String> completed = new ArrayList<>();

        while (!queue.isEmpty()) {
            String job = queue.poll();
            completed.add(job);

            if (job.equals("분석")) queue.offer("보고");
        }

        return completed;
    }
}
```

예상 출력:

```text
스택 다음 값: 상세
스택에서 꺼낸 값: 상세
스택 남은 개수: 2
큐 다음 값: 첫째
큐에서 꺼낸 값: 첫째
큐가 비었는가: false
true
false
false
[분석, 검토, 보고]
```

괄호 예제에서는 여는 괄호를 저장하고 닫는 괄호에서 가장 최근 여는 괄호를 제거합니다.
빈 스택에서 닫는 괄호가 나오면 즉시 실패하고, 끝까지 읽은 뒤 여는 괄호가 남아 있어도 실패합니다.

작업 예제에서는 `분석`을 처리할 때 `보고`가 뒤에 들어갑니다. 이미 대기하던 `검토`가 먼저 처리된 뒤 `보고`가 나옵니다.
반복 조건은 현재 큐의 빈 상태를 확인하므로 처리 중 추가된 작업도 놓치지 않습니다. 원래 입력 `List`는 변경하지 않습니다.
이 예제는 한 스레드에서 동작하며 문자열과 작업 목록·원소가 `null`이 아닌 입력을 사용합니다.

## 이어서 연습하기

값을 보기만 한 줄과 실제로 제거한 줄을 구분하고, 괄호 예제의 두 실패 경계를 자신의 말로 설명해 보세요.
꺼낼 순서 대신 키로 조회할 정보나 중복 여부가 중요하면 [해시와 Map·Set](#/learn/algorithm/hash-map-set)에서 이어서 살펴봅니다.

## 공식 자료

- [Java SE 25 — Deque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html)
- [Java SE 25 — ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)

사용자 원문 「02 스택·큐(Stack / Queue)」를 바탕으로 기존 괄호·작업 처리 예제를 Java로 옮겼습니다. 원문·Java 25 API 확인일: 2026-09-14.

## 핵심 질문 답

가장 최근 값을 먼저 처리하면 LIFO인 스택, 가장 오래 기다린 값을 먼저 처리하면 FIFO인 큐를 선택합니다.
둘 다 `Deque` 변수에 `new ArrayDeque<>()`로 만든 객체를 연결할 수 있습니다. 스택은 `push()`·`peek()`·`pop()`, 큐는 `offer()`·`peek()`·`poll()` 조합을 사용합니다.
`peek()`은 제거하지 않고, `size()`와 `isEmpty()`로 남은 상태를 확인합니다. 빈 스택의 `pop()`은 예외를 던지고 `peek()`·`poll()`은 `null`을 돌려주며 `ArrayDeque`에는 `null`을 저장하지 않습니다.
