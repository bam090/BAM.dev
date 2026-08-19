# 04. 컬렉션·제네릭·List·Map

## 학습 목표

- 배열과 컬렉션의 크기·연산 계약 차이를 설명할 수 있습니다.
- 제네릭 타입 인수가 컬렉션 원소의 타입 계약을 드러내는 방식을 이해합니다.
- 순서와 인덱스가 필요한 경우 `List`를 선택하고 기본 연산을 사용할 수 있습니다.
- 고유한 키로 값을 찾는 경우 `Map`을 선택하고 `put`·`get`·`containsKey`를 구분할 수 있습니다.

## 먼저 관찰하기

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

List<String> topics = new ArrayList<>();
topics.add("타입");
topics.add("배열");

Map<String, Integer> scores = new HashMap<>();
scores.put("Bam", 80);
```

1. `List<String>`의 `String`은 어떤 값을 넣겠다는 계약인가요?
2. `topics`에서는 위치와 순서 중 무엇을 관찰할 수 있나요?
3. `scores`의 키 타입과 값 타입은 각각 무엇인가요?
4. `scores.put("Bam", 90)`을 추가하면 같은 키에 두 값이 공존할까요?

## 배열과 컬렉션 선택하기

배열은 생성 시 길이가 정해집니다. 컬렉션은 원소 추가·삭제 같은 연산을 인터페이스 계약으로 제공합니다.

```java
String[] fixedTopics = new String[3];
List<String> growingTopics = new ArrayList<>();
```

길이가 고정되고 인덱스로 다루는 단순 데이터에는 배열이 적합할 수 있습니다. 항목 수가 바뀌고 추가·삭제·검색 연산이 필요하다면 컬렉션을 검토하세요. “항상 컬렉션이 더 좋다”가 아니라 요구사항의 연산을 먼저 적는 것이 중요합니다.

## 제네릭으로 원소 타입 드러내기

```java
List<String> names = new ArrayList<>();
names.add("Bam");
// names.add(42); // String 목록의 타입 계약과 맞지 않음
```

`List<String>`의 타입 인수 `String`은 이 목록의 원소 타입을 드러냅니다. 값을 꺼낼 때도 `String` 계약을 사용할 수 있습니다.

```java
String firstName = names.get(0);
```

원시 타입인 `int`를 타입 인수로 직접 사용할 수는 없습니다. 숫자 목록에는 래퍼 클래스 `Integer`를 사용합니다.

```java
List<Integer> scores = new ArrayList<>();
scores.add(80);
```

## List: 순서와 위치가 있는 컬렉션

`List`는 순서가 있고 정수 인덱스로 원소에 접근합니다. 인덱스는 배열처럼 0부터 시작하며, 일반적으로 중복 원소도 허용합니다.

```java
List<String> lessons = new ArrayList<>();
lessons.add("타입");
lessons.add("배열");
lessons.add("타입");

String second = lessons.get(1);
int count = lessons.size();
boolean alreadyAdded = lessons.contains("타입");
```

`contains(value)`는 목록을 앞에서부터 확인하며 같은 원소가 있는지 알려 줍니다. `String` 원소는 `equals` 규칙으로 비교하므로 대소문자가 다른 문자열은 서로 다른 값입니다. `ArrayList`의 `contains`는 필요한 원소를 찾거나 목록 끝에 도달할 때까지 순서대로 비교하므로, 목록이 길어질수록 비교 횟수도 늘어날 수 있습니다.

변수 타입을 구현 클래스 `ArrayList<String>` 대신 인터페이스 `List<String>`로 선언하면 호출 코드는 필요한 목록 계약에 집중할 수 있습니다.

`List.of("타입", "배열")`이 만드는 목록은 수정할 수 없습니다. 이후 `add`가 필요한 예제라면 `new ArrayList<>()`처럼 수정 가능한 구현을 선택하세요.

## Map: 키로 값을 찾는 컬렉션

`Map<K, V>`는 키를 값에 연결합니다. 하나의 맵에는 같은 키가 하나만 존재하며, `put`으로 이미 존재하는 키를 넣으면 이전 값이 교체됩니다.

```java
Map<String, Integer> progress = new HashMap<>();
progress.put("java.types", 50);
progress.put("java.types", 100);

Integer percent = progress.get("java.types");
boolean hasQuiz = progress.containsKey("java.quiz");
```

`get` 결과가 `null`이라고 해서 항상 키가 없다고 단정할 수는 없습니다. `HashMap`은 `null` 값도 허용하므로 키 존재 여부를 구분해야 할 때는 `containsKey`를 사용하세요.

`HashMap`은 반복 순서를 보장하지 않습니다. 출력 순서가 요구사항이라면 순서를 보장하는 다른 구현의 계약을 검토해야 합니다.

## 최소 구현

완료 상태 맵에서 `true`인 값의 개수를 셉니다.

```java
static int countCompleted(Map<String, Boolean> progress) {
    int count = 0;

    for (boolean completed : progress.values()) {
        if (completed) {
            count++;
        }
    }

    return count;
}
```

관찰 질문:

1. 키가 하나도 없으면 반복 본문은 몇 번 실행되나요?
2. 값 타입이 `Boolean`인데 향상된 `for`문 변수는 왜 `boolean`으로 쓸 수 있나요?
3. 개수 계산에 키가 필요한가요, 값만 필요하나요?
4. `null` 값이 들어올 수 있는 계약이라면 현재 코드에 어떤 위험이 있나요?

## 흔한 실수

- `List.of()` 결과를 수정 가능한 목록으로 생각하고 `add`를 호출합니다.
- `Map.get()`의 `null`만 보고 키가 없다고 단정합니다.
- `HashMap`의 반복 순서를 입력 순서로 가정합니다.
- 제네릭을 생략한 원시 타입을 사용해 컴파일 시점의 원소 타입 검사를 약하게 만듭니다.
- 목록을 순회하면서 같은 목록을 구조적으로 수정해 예측하기 어려운 흐름을 만듭니다.

## 확인 문제

1. 고정 길이 배열과 `ArrayList` 중 항목 추가가 잦은 요구사항에 무엇을 선택할지 설명해 보세요.
2. `List<String>`에서 `String`이 제공하는 계약은 무엇인가요?
3. `List`와 `Map`을 선택하는 핵심 질문을 각각 하나씩 적어 보세요.
4. 같은 키로 `Map.put()`을 두 번 호출하면 어떤 계약에 따라 값이 바뀌나요?
5. `Map.get()`과 `containsKey()`를 함께 써야 하는 상황을 설명해 보세요.

## 공식 근거 자료

- [Java Language Specification SE 25 §4.5: 매개변수화 타입](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5)
- [Java SE 25 API: `List<E>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [Java SE 25 API: `ArrayList<E>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java SE 25 API: `Map<K,V>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)
- [Java SE 25 API: `HashMap<K,V>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
