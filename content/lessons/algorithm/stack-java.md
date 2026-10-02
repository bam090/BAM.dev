# Java로 스택 쓰기: ArrayDeque

## 학습 목표

- `ArrayDeque`의 `push`·`pop`·`peek`·`isEmpty`로 스택을 만들고 빈 스택에서 각 메서드가 어떻게 동작하는지 구분할 수 있습니다.
- `Stack` 클래스 대신 `Deque`를 쓰는 이유를 설명하고 `ArrayDeque`로 괄호 검사를 구현할 수 있습니다.

## 한줄 요약

Java에서 스택은 `Deque<E> stack = new ArrayDeque<>()`로 만들고 `push`·`pop`·`peek`으로 맨 앞을 top처럼 쓰며 빈 스택의 `pop`은 예외를 던지고 `peek`은 `null`을 돌려줍니다.

## 먼저 확인할 개념

[스택: 나중에 넣은 것부터 꺼내기](#/learn/algorithm/stack-and-queue) · [Deque로 큐와 스택 사용하기](#/learn/java/wiki-lists) · [예외 처리와 전달](#/learn/java/wiki-exceptions)

## ArrayDeque란

**ArrayDeque**는 양쪽 끝에서 값을 넣고 뺄 수 있는 `Deque`를 내부 배열로 만든 Java의 클래스입니다.
앞 문서에서는 배열과 `top` 변수로 스택을 직접 만들었습니다.
하지만 실제 코드에서는 이미 준비된 `ArrayDeque`를 씁니다.
칸이 모자라면 내부 배열을 스스로 키우고 넣기·꺼내기도 이미 검증되어 있기 때문입니다.

`Deque`는 double ended queue의 줄임말로 앞과 뒤 양쪽이 모두 열린 줄이라는 뜻입니다.
스택으로 쓸 때는 이 중 **맨 앞 한쪽만** top으로 씁니다.
양쪽이 다 열려 있어도 한쪽 끝에서만 넣고 빼면 그대로 LIFO가 되기 때문입니다.

예를 들어 코드 편집기가 괄호 `(`·`[`·`{`의 짝이 맞는지 검사하는 장면을 떠올려 보세요.
이 문서는 괄호 검사 하나로 끝까지 설명합니다.

## ArrayDeque의 스택 메서드

스택으로 쓸 때 필요한 메서드는 아래 다섯 가지입니다.
빈 스택에서 어떻게 동작하는지가 메서드마다 다르니 오른쪽 열까지 함께 봅니다.

| 메서드 | 하는 일 | 빈 스택에서 |
| --- | --- | --- |
| `push(x)` | 맨 앞(top)에 `x`를 넣습니다 | 그대로 넣습니다 |
| `pop()` | 맨 앞 값을 꺼내 돌려주고 지웁니다 | `NoSuchElementException`을 던집니다 |
| `peek()` | 맨 앞 값을 지우지 않고 돌려줍니다 | `null`을 돌려줍니다 |
| `isEmpty()` | 비었으면 `true`를 돌려줍니다 | `true` |
| `size()` | 담긴 값의 개수를 돌려줍니다 | `0` |

`push`·`pop`·`peek`은 모두 맨 앞 한곳만 건드리므로 평균 `O(1)`입니다.
반면 `contains(x)`는 처음부터 하나씩 비교하므로 `O(n)`입니다.

## ArrayDeque 사용법

변수 타입은 `Deque`로 쓰고 객체는 `ArrayDeque`로 만듭니다.
괄호 세 개를 차례로 넣은 뒤 들여다보고 꺼내 보겠습니다.

```java
Deque<Character> stack = new ArrayDeque<>();
stack.push('(');
stack.push('[');
stack.push('{');
System.out.println("스택: " + stack);
System.out.println("peek: " + stack.peek());
System.out.println("pop: " + stack.pop());
System.out.println("pop 뒤: " + stack + " | size: " + stack.size());
```

`(`·`[`·`{` 순서로 넣었을 때 스택을 출력하면 어떤 순서로 보일지 예상해 보세요.

```text
스택: [{, [, (]
peek: {
pop: {
pop 뒤: [[, (] | size: 2
```

넣은 순서와 반대로 `{`가 맨 왼쪽에 보입니다.
`push`가 값을 맨 앞에 넣기 때문에 출력의 **왼쪽 끝이 top**입니다.
그래서 `peek()`과 `pop()` 모두 가장 나중에 넣은 `{`를 돌려줍니다.

![여는 괄호 세 개를 차례로 push한 뒤 출력한 모습. ArrayDeque는 중괄호·대괄호·소괄호 순서로 보여 왼쪽 끝이 top이고 Stack 클래스는 소괄호·대괄호·중괄호 순서로 보여 오른쪽 끝이 top이다. 어느 쪽이든 peek과 pop은 같은 중괄호를 돌려준다.](content/assets/algorithm/stack-deque-print.png)

그림의 오른쪽처럼 뒤에서 볼 `Stack` 클래스는 같은 값을 반대 순서로 출력합니다.
출력 모양만 다를 뿐 두 스택 모두 top은 `{`입니다.

### 빈 스택

이번에는 스택을 모두 비운 뒤 `peek()`과 `pop()`을 불러 보겠습니다.

```java
stack.clear();
System.out.println("비었나요? " + stack.isEmpty());
System.out.println("빈 스택 peek: " + stack.peek());
try {
    stack.pop();
} catch (Exception e) {
    System.out.println("빈 스택 pop: " + e.getClass().getSimpleName());
}
```

```text
비었나요? true
빈 스택 peek: null
빈 스택 pop: NoSuchElementException
```

`peek()`은 볼 값이 없다는 뜻으로 `null`을 돌려주고 `pop()`은 꺼낼 값이 없으니 예외를 던집니다.
코딩테스트에서는 예외를 잡기보다 `pop()` 전에 `isEmpty()`로 먼저 확인하는 편이 코드가 읽기 쉽습니다.

`ArrayDeque`에는 `null`을 넣을 수 없고 `push(null)`을 하면 `NullPointerException`이 납니다.
`peek()`이 돌려주는 `null`이 "비어 있음"이라는 뜻으로 쓰이기 때문입니다.

## Stack 클래스 대신 Deque

Java에는 이름부터 스택인 `java.util.Stack` 클래스도 있습니다.
그런데 Java 25 API 문서는 `Stack`보다 `Deque`를 우선해서 쓰라고 안내합니다.
`Deque`와 그 구현 클래스가 더 완전하고 일관된 LIFO 스택 연산을 제공하기 때문입니다.

특히 `Stack`은 `Vector`라는 목록 클래스를 물려받았습니다.
그래서 스택에는 없어야 할 "중간에 끼워 넣기" 같은 목록 메서드까지 함께 열려 있습니다.

```java
Stack<Character> oldStack = new Stack<>();
oldStack.push('(');
oldStack.push('[');
oldStack.push('{');
System.out.println("Stack 클래스: " + oldStack);
oldStack.add(1, '?');
System.out.println("add(1, '?') 뒤: " + oldStack);
```

```text
Stack 클래스: [(, [, {]
add(1, '?') 뒤: [(, ?, [, {]
```

`add(1, '?')`가 스택의 중간에 값을 끼워 넣었습니다.
맨 위에서만 넣고 빼야 한다는 스택의 규칙이 코드 한 줄로 깨지는 셈입니다.
`Deque`에는 번호로 중간에 끼워 넣는 메서드가 없어서 `Deque` 변수로 쓰면 이런 실수가 줄어듭니다.

빈 스택에서의 동작도 다릅니다.
`Stack`의 `pop()`과 `peek()`은 둘 다 `EmptyStackException`을 던지지만 `ArrayDeque`의 `peek()`은 `null`을 돌려줍니다.
옛 코드를 `ArrayDeque`로 옮길 때 이 차이를 함께 확인합니다.

## Java로 괄호 검사 구현

이제 `ArrayDeque`로 세 종류의 괄호를 검사해 보겠습니다.
여는 괄호는 `push`하고 닫는 괄호를 만나면 `pop`한 여는 괄호와 종류가 맞는지 확인합니다.

```java
static boolean isBalanced(String text) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char ch : text.toCharArray()) {
        if (ch == '(' || ch == '[' || ch == '{') {
            stack.push(ch);
        } else if (ch == ')' || ch == ']' || ch == '}') {
            if (stack.isEmpty()) return false;
            char open = stack.pop();
            if (!isPair(open, ch)) return false;
        }
    }
    return stack.isEmpty();
}

static boolean isPair(char open, char close) {
    return (open == '(' && close == ')')
        || (open == '[' && close == ']')
        || (open == '{' && close == '}');
}
```

네 문자열 `{[()]}`·`([)]`·`(()`·`())` 가운데 올바른 괄호가 몇 개일지 먼저 골라 보세요.

```text
{[()]} → true
([)] → false
(() → false
()) → false
```

코드에서 `false`를 돌려주는 자리는 세 곳이고 실패한 세 문자열이 하나씩 그 자리에 걸립니다.

| 문자열 | 걸린 자리 | 이유 |
| --- | --- | --- |
| `([)]` | `isPair`가 `false` | `)`를 만났을 때 top은 `[`라서 종류가 다릅니다 |
| `(()` | 마지막 `stack.isEmpty()` | 다 읽었는데 `(`가 하나 남았습니다 |
| `())` | 반복 안의 `stack.isEmpty()` | 두 번째 `)`를 만났을 때 꺼낼 여는 괄호가 없습니다 |

`([)]`를 보면 스택이 왜 필요한지 알 수 있습니다.
여는 괄호와 닫는 괄호의 개수만 세면 짝이 맞아 보이지만 닫는 괄호는 늘 가장 최근에 열린 괄호와 짝을 이뤄야 합니다.
가장 최근 값을 꺼내 주는 스택이 이 규칙을 그대로 지켜 줍니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `BracketChecker.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayDeque;
> import java.util.Deque;
> import java.util.Stack;
>
> public class BracketChecker {
>     static boolean isBalanced(String text) {
>         Deque<Character> stack = new ArrayDeque<>();
>         for (char ch : text.toCharArray()) {
>             if (ch == '(' || ch == '[' || ch == '{') {
>                 stack.push(ch);
>             } else if (ch == ')' || ch == ']' || ch == '}') {
>                 if (stack.isEmpty()) return false;
>                 char open = stack.pop();
>                 if (!isPair(open, ch)) return false;
>             }
>         }
>         return stack.isEmpty();
>     }
>
>     static boolean isPair(char open, char close) {
>         return (open == '(' && close == ')')
>             || (open == '[' && close == ']')
>             || (open == '{' && close == '}');
>     }
>
>     public static void main(String[] args) {
>         Deque<Character> stack = new ArrayDeque<>();
>         stack.push('(');
>         stack.push('[');
>         stack.push('{');
>         System.out.println("스택: " + stack);
>         System.out.println("peek: " + stack.peek());
>         System.out.println("pop: " + stack.pop());
>         System.out.println("pop 뒤: " + stack + " | size: " + stack.size());
>
>         stack.clear();
>         System.out.println("비었나요? " + stack.isEmpty());
>         System.out.println("빈 스택 peek: " + stack.peek());
>         try {
>             stack.pop();
>         } catch (Exception e) {
>             System.out.println("빈 스택 pop: " + e.getClass().getSimpleName());
>         }
>
>         Stack<Character> oldStack = new Stack<>();
>         oldStack.push('(');
>         oldStack.push('[');
>         oldStack.push('{');
>         System.out.println("Stack 클래스: " + oldStack);
>         oldStack.add(1, '?');
>         System.out.println("add(1, '?') 뒤: " + oldStack);
>
>         for (String text : new String[] {"{[()]}", "([)]", "(()", "())"}) {
>             System.out.println(text + " → " + isBalanced(text));
>         }
>     }
> }
> ```
>
> ```text
> 스택: [{, [, (]
> peek: {
> pop: {
> pop 뒤: [[, (] | size: 2
> 비었나요? true
> 빈 스택 peek: null
> 빈 스택 pop: NoSuchElementException
> Stack 클래스: [(, [, {]
> add(1, '?') 뒤: [(, ?, [, {]
> {[()]} → true
> ([)] → false
> (() → false
> ()) → false
> ```

## 스택 구현의 선택

그렇다면 Java에서 스택이 필요할 때 무엇을 쓰면 될까요?

| 방법 | 쓰는 때 |
| --- | --- |
| `Deque<E> stack = new ArrayDeque<>()` | 새로 쓰는 코드와 코딩테스트 대부분 |
| `Stack<E>` | 이미 `Stack`으로 쓰인 옛 코드를 읽고 고칠 때 |
| 배열과 `top` 변수 | 최대 개수가 정해져 있고 `int` 같은 기본형을 그대로 담고 싶을 때 |

Java 25 API 문서는 `ArrayDeque`가 스택으로 쓸 때 `Stack`보다 빠를 가능성이 높다고도 설명합니다.
그래서 특별한 이유가 없으면 `ArrayDeque`를 쓰고 변수 타입은 `Deque`로 둡니다.
같은 `ArrayDeque`를 먼저 들어온 것부터 꺼내는 큐로 쓰는 방법은 [큐 활용 문서](#/learn/algorithm/queue-java)에서 이어집니다.

## 정리

- Java에서 스택은 `Deque<E> stack = new ArrayDeque<>()`로 만들고 `push`·`pop`·`peek`이 맨 앞을 top으로 씁니다.
- `ArrayDeque`를 출력하면 왼쪽 끝이 top이고 `null`은 넣을 수 없습니다.
- 빈 스택에서 `pop()`은 `NoSuchElementException`을 던지고 `peek()`은 `null`을 돌려주므로 꺼내기 전에 `isEmpty()`로 확인합니다.
- `Stack`은 목록 메서드까지 열려 있어 스택 규칙이 깨지기 쉬우므로 새 코드에서는 `Deque`를 씁니다.

## 이어서 연습하기

[겹쳐 쌓은 상자 기록의 첫 오류](#/coding-tests/java/bridge-stk-01)에서 괄호 검사와 같은 방식으로 맨 위 상자를 비교해 봅니다.
[여러 카드 더미의 합 상쇄](#/coding-tests/java/bridge-stk-05)에서 `ArrayDeque`로 값을 쌓고 꺼내 봅니다.
[처음 더 높은 표지까지 가장 긴 거리](#/coding-tests/java/bridge-stk-04)에서 스택에 인덱스를 담는 방법에 도전해 봅니다.

## 공식 자료

- [Java 25 API: ArrayDeque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
- [Java 25 API: Deque](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html)
- [Java 25 API: Stack](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Stack.html)

## 핵심 질문 답

Java에서 스택은 `Deque<E> stack = new ArrayDeque<>()`로 만들고 `push`로 맨 앞에 넣고 `pop`으로 꺼내며 `peek`으로 보기만 합니다.
빈 스택에서 `pop()`은 `NoSuchElementException`을 던지고 `peek()`은 `null`을 돌려주므로 꺼내기 전에 `isEmpty()`로 확인합니다.
`Stack` 클래스는 `Vector`를 물려받아 중간에 끼워 넣는 메서드까지 열려 있고 Java 문서도 `Deque`를 우선해서 쓰라고 안내하므로 새 코드에서는 `ArrayDeque`를 씁니다.
괄호 검사는 여는 괄호를 `push`하고 닫는 괄호에서 `pop`한 값과 종류를 비교한 뒤 끝에 스택이 비었는지 확인하면 됩니다.
