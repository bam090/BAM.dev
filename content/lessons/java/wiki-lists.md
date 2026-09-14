# 순서 있는 List의 크기와 삭제

## 학습 목표

List의 순서·중복·현재 크기를 읽고 숫자 목록의 위치 삭제와 값 삭제를 구분할 수 있습니다.

## 한줄 요약

List는 순서와 중복을 유지하며 ArrayList의 준비 용량은 현재 원소 수와 다릅니다.

## 먼저 확인할 개념

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics) · [메서드 계약](#/learn/java/wiki-methods) · [배열](#/learn/java/wiki-arrays)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

다음 문장 예제는 Java 25의 main 같은 메서드 안에 두고, 사용하는 소스 파일의 클래스 선언 앞에는 아래 import를 둡니다. 독립 예제의 같은 변수 이름을 한 블록에 겹쳐 선언하지 않습니다.

```java
import java.util.List;
import java.util.ArrayList;
```

## `List`는 순서와 중복이 필요한 목록이다

`List`는 원소의 순서를 유지하고 같은 값을 여러 번 저장할 수 있다.
각 원소에는 `0`부터 시작하는 인덱스로 접근한다.

```java
List<String> order = new ArrayList<>();
order.add("HTML");
order.add("CSS");
order.add("HTML");

System.out.println(order.get(1)); // CSS
System.out.println(order.size()); // 3
```

`ArrayList`는 크기를 늘릴 수 있는 배열을 사용하는 대표적인 `List` 구현체다.
인덱스로 자주 조회하고 주로 맨 뒤에 추가하는 일반 목록이라면 먼저 검토하기 좋다.

`size`는 현재 저장된 원소 수이고 **capacity**는 내부 배열이 다시 커지기 전까지 담을 수 있는 공간이다.
`new ArrayList<>(10)`은 용량을 10으로 준비한 빈 목록이므로 `size()`는 `0`이다.

`List<Integer>`에서는 `remove()`의 인수에 따라 뜻이 달라질 수 있다.

```java
List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30));

numbers.remove(1);                    // 인덱스 1의 값 20 제거
numbers.remove(Integer.valueOf(10)); // 값 10 제거
```

기본형 `int`를 넘기면 `remove(int index)`가 선택되고 `Integer` 객체를 넘기면 `remove(Object value)`가 선택된다.
숫자 목록에서는 위치 삭제와 값 삭제를 구분해 호출해야 한다.

## 준비 공간과 사용할 수 있는 원소

capacity는 나중에 담을 공간을 미리 준비하는 값이다.
`new ArrayList<>(10)` 다음에 `get(0)`을 호출할 수 있는 것은 아니다. 아직 원소가 없어 유효한 인덱스가 없기 때문이다.
먼저 add로 원소를 넣고 현재 size를 기준으로 접근한다.

위 삭제 예제는 `[10, 20, 30]`에서 인덱스 1을 지워 `[10, 30]`, 그다음 값 10을 지워 `[30]`이 되는 흐름이다.
숫자 1이라는 표시보다 그 인수가 int인지 Integer인지가 호출할 remove의 계약을 가른다.


## 이어서 연습하기

[Set과 Map으로 중복·키 다루기](#/learn/java/wiki-sets-maps)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

List는 순서와 중복을 유지하며 유효한 인덱스는 0부터 size()-1까지입니다. ArrayList의 생성자에 준비한 capacity는 원소 수가 아니므로 새 목록의 size는 0입니다. List<Integer>에서 int 인수의 remove는 위치를, Integer 객체 인수의 remove는 같은 값을 찾아 제거합니다. 삭제할 것이 위치인지 값인지 먼저 정합니다.
