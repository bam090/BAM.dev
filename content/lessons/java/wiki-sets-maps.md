# Set과 Map으로 중복·키 다루기

## 학습 목표

중복 제거와 키별 값 갱신 요구를 구분하고 동등성·순서 조건을 확인할 수 있습니다.

## 한줄 요약

Set은 같은 값을 한 번 보관하고 Map은 같은 키의 값을 바꾸며 순서는 구현체에 따릅니다.

## 먼저 확인할 개념

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics) · [동등성과 해시](#/learn/java/wiki-equality-hashing)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

다음 문장 예제는 Java 25의 main 같은 메서드 안에 두고, 사용하는 소스 파일의 클래스 선언 앞에는 아래 import를 둡니다. 독립 예제의 같은 변수 이름을 한 블록에 겹쳐 선언하지 않습니다.

```java
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
```

## `Set`은 같은 값을 한 번만 보관한다

`Set`은 중복 원소를 허용하지 않는다.
완료한 과정 ID를 여러 번 추가해도 같은 값으로 판단되면 하나만 남는다.

```java
Set<String> completed = new HashSet<>();

completed.add("html-01");
completed.add("html-01");

System.out.println(completed.size()); // 1
```

`HashSet`은 원소의 `hashCode()`와 `equals()`를 사용해 같은 값인지 판단한다.
직접 만든 객체를 내용 기준으로 중복 처리하려면 앞 장에서 배운 두 메서드의 계약을 함께 지켜야 한다.

`Set`이라는 이름만으로 원소를 만나는 순서를 단정할 수 없다.

| 구현체 | 원소를 만나는 순서 |
| --- | --- |
| `HashSet` | 순서를 보장하지 않음 |
| `LinkedHashSet` | 삽입한 순서를 유지 |
| `TreeSet` | 원소의 자연 순서나 제공한 비교 기준으로 정렬 |

순서가 필요 없다면 `HashSet`, 삽입 순서를 남겨야 한다면 `LinkedHashSet`, 정렬된 상태가 필요하다면 `TreeSet`을 검토한다.

## `Map`은 키로 값을 찾는다

`Map<K, V>`는 키와 값을 한 쌍으로 저장한다.
키는 중복될 수 없지만 서로 다른 키가 같은 값을 가지는 것은 가능하다.

```java
Map<String, Integer> progress = new HashMap<>();

progress.put("java-01", 40);
progress.put("java-01", 80);

System.out.println(progress.get("java-01")); // 80
```

같은 키로 `put()`을 다시 호출하면 새 키가 하나 더 생기지 않고 기존 값이 바뀐다.
`HashMap`도 키의 `hashCode()`와 `equals()`를 이용하므로, 키로 사용하는 객체의 동등성 규칙이 조회 결과에 영향을 준다.

`HashMap`은 키를 만나는 순서를 보장하지 않는다.
삽입 순서가 필요하면 `LinkedHashMap`, 키의 정렬 순서가 필요하면 `TreeMap`을 검토한다.

키와 값을 함께 순회할 때는 `entrySet()`을 사용할 수 있다.

```java
for (Map.Entry<String, Integer> entry : progress.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

`Map`은 `Collection`이 아니지만 `keySet()`, `values()`, `entrySet()`으로 키·값·키-값 쌍의 컬렉션 보기를 제공한다.

## 이어서 연습하기

[Deque로 큐와 스택 사용하기](#/learn/java/wiki-deque)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

같은 완료 ID를 한 번만 세려면 Set, ID별 진행률을 갱신하고 찾으려면 Map을 사용합니다. 같은 Map 키로 put하면 기존 값이 바뀌고 다른 키의 값이 같은 것은 허용됩니다. Hash 계열은 equals/hashCode 계약을 사용하며 순서를 보장하지 않습니다. 삽입 순서는 LinkedHash 계열, 정렬 순서는 Tree 계열의 기준을 확인합니다.
