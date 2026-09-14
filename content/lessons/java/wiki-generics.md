# 제네릭: 타입 인수로 저장·조회 타입 정하기

## 학습 목표

타입 인수와 raw type을 구분해 저장·조회 계약을 컴파일 단계에 드러낼 수 있습니다.

## 한줄 요약

제네릭은 담을 타입을 미리 약속하지만 null이나 객체 상태 같은 모든 오류를 막지는 않습니다.

## 먼저 확인할 개념

[추상 클래스와 인터페이스의 역할](#/learn/java/wiki-abstract-interfaces) · [타입과 변수](#/learn/java/wiki-types-variables)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

다음 문장 예제는 Java 25의 main 같은 메서드 안에 두고, 사용하는 소스 파일의 클래스 선언 앞에는 아래 import를 둡니다. 독립 예제의 같은 변수 이름을 한 블록에 겹쳐 선언하지 않습니다.

```java
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Deque;
import java.util.ArrayDeque;
```

## 제네릭은 저장할 타입을 미리 약속한다

다음 목록은 문자열만 저장한다는 약속을 코드에 표시한다.

```java
List<String> courseTitles = new ArrayList<>();

courseTitles.add("HTML");
// courseTitles.add(25); // 컴파일 오류
```

`List<String>`의 `String`은 실제로 사용할 **타입 인수(type argument)**다.
`List<E>`를 선언한 쪽의 `E`는 사용할 때 정해질 자리를 나타내는 **타입 매개변수(type parameter)**다.

오른쪽의 빈 꺾쇠괄호 `<>`는 왼쪽 문맥에서 타입 인수를 추론하게 하는 **다이아몬드(diamond)** 문법이다.
제네릭 타입 인수에는 기본형을 직접 쓸 수 없으므로 `List<int>`가 아니라 래퍼 타입인 `List<Integer>`를 사용한다.

제네릭은 잘못된 타입을 넣는 실수를 컴파일할 때 발견하고 값을 꺼낼 때 불필요한 형변환을 줄인다.
`null`, 잘못된 인덱스, 객체의 상태 규칙처럼 타입 일치와 다른 문제까지 모두 막아 주지는 않는다.

### raw type은 타입 검사를 약하게 만든다

타입 인수를 생략한 제네릭 타입을 **raw type**이라고 한다.

```java
List raw = new ArrayList();
raw.add("HTML");
raw.add(25);

List<String> titles = raw; // unchecked 경고
```

raw type은 제네릭이 없던 오래된 코드와 연결하기 위해 남아 있다.
`List<Object>`의 짧은 표기가 아니며, 컴파일러가 타입 안전성을 확인할 정보가 줄어든다.

위 코드에서 숫자를 문자열 목록처럼 꺼내면 실행 중 `ClassCastException`이 생길 수 있다.
새 코드에서는 경고를 숨기기보다 `List<String>`처럼 타입 인수를 적는다.

## 인터페이스는 규칙을, 구현체는 저장 방법을 정한다

주요 관계를 역할 중심으로 단순화하면 다음과 같다.

```text
Collection
├─ List
├─ Set
└─ Queue
   └─ Deque

Map  ← Collection과 별도인 키-값 구조
```

실제 Java 25 타입 계층에는 중간 인터페이스가 더 있다.
처음에는 `Map`이 컬렉션 프레임워크의 일부이지만 `Collection`의 하위 타입은 아니라는 점을 구분하면 된다.

`List`, `Set`, `Map`, `Deque`는 어떤 규칙으로 사용할지를 나타내는 인터페이스다.
`ArrayList`, `HashSet`, `HashMap`, `ArrayDeque`는 데이터를 실제로 보관하는 구현 클래스다.

```java
List<String> order = new ArrayList<>();
Set<String> completed = new HashSet<>();
Map<String, Integer> progress = new HashMap<>();
Deque<String> waiting = new ArrayDeque<>();
```

변수를 인터페이스 타입으로 선언하면 사용하는 코드는 필요한 규칙을 중심으로 읽힌다.
구현체를 바꿔도 그 인터페이스가 약속한 메서드만 사용한 코드는 변경을 줄일 수 있다.

## 이어서 연습하기

[순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java SE 25 — Collections Framework Overview](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/doc-files/coll-overview.html)
- [Java SE 25 `java.util` API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html)

## 핵심 질문 답

List<String>처럼 타입 인수를 적으면 저장·조회 타입을 컴파일 단계에 확인할 수 있습니다. 기본형은 타입 인수로 직접 쓰지 않고 Integer 같은 래퍼를 사용합니다. raw type은 List<Object>의 줄임말이 아니라 타입 검사가 약해진 호환 방식이며 unchecked 경고를 숨기면 실행 중 잘못된 형변환으로 이어질 수 있습니다. 제네릭도 null·인덱스·객체 상태 규칙까지 모두 보장하지 않습니다.
