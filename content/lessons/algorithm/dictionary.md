# 딕셔너리: 키로 값 저장하고 찾기

## 학습 목표

- `Map`과 `HashMap`의 역할을 구분하고 `put()`과 `get()`으로 키에 연결된 값을 저장·조회할 수 있습니다.
- `containsKey()`로 키가 없는 경우와 값이 `null`로 저장된 경우를 구분할 수 있습니다.

## 한줄 요약

딕셔너리는 키에 값을 연결하는 구조이며, Java에서는 `Map`을 구현한 객체로 저장·조회하고 키의 존재를 확인합니다.

## 먼저 확인할 개념

[제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics), [Set과 Map으로 중복·키 다루기](#/learn/java/wiki-sets-maps), [리스트와 조건문: 여러 값에서 조건에 맞는 값 찾기](#/learn/algorithm/list-and-conditions)를 먼저 확인해 보세요.

## 개념 연결

- 선행: `java.generics`, `java.sets-maps`, `algo.list`
- 이 단원: `algo.dictionary`
- 후속: `algo.hashing`, `algo.map-collection`, `algo.set-collection`

## 위치 대신 키로 찾는다

**딕셔너리(dictionary)**는 `키 → 값` 관계를 저장하는 자료구조 이름입니다. 이름이나 ID에 연결된 값을 찾을 때 사용합니다.
`지수`의 점수를 알고 싶다면 몇 번째에 저장됐는지보다 어느 키에 연결됐는지가 중요합니다.

Java의 `Map<K, V>`는 키와 값을 연결하는 인터페이스입니다. `HashMap<K, V>`은 이를 해시 방식으로 구현한 클래스입니다.
`Map<String, Integer> pointsByName = new HashMap<>();`는 문자열 키에 정수 값을 연결할 객체를 만듭니다.
왼쪽의 `Map`과 오른쪽의 `HashMap`을 같은 종류의 이름으로 혼동하지 마세요.

Java에는 오래된 추상 클래스 `java.util.Dictionary`도 있지만, 이 교안의 일반 자료구조 용어와 같은 뜻으로 사용하지 않습니다. 새 코드에서는 `Map` 인터페이스를 사용합니다.

| 할 일 | 코드 | 뜻 |
| --- | --- | --- |
| 저장 또는 변경 | `pointsByName.put("지수", 5)` | 같은 키가 있으면 연결된 값을 바꿉니다. |
| 값 조회 | `pointsByName.get("지수")` | 키에 연결된 값을 돌려줍니다. |
| 키 존재 확인 | `pointsByName.containsKey("지수")` | 해당 키가 있으면 `true`입니다. |

## 없는 키와 아직 값이 없는 키를 구분한다

`HashMap`의 `get()`은 없는 키에 대해 `null`을 반환합니다. 하지만 `HashMap`에는 값으로 `null`을 저장할 수도 있습니다.
따라서 `get()` 결과만으로 두 경우를 구분하지 않고 키의 존재를 따로 확인합니다.

다음 코드를 `DictionaryDemo.java`에 저장할 수 있습니다.

```java
import java.util.HashMap;
import java.util.Map;

public class DictionaryDemo {
    public static void main(String[] args) {
        Map<String, Integer> pointsByName = new HashMap<>();
        pointsByName.put("민지", 3);
        pointsByName.put("지수", 5);

        System.out.println("지수 점수: " + pointsByName.get("지수"));
        pointsByName.put("지수", 6);
        System.out.println("변경한 점수: " + pointsByName.get("지수"));

        System.out.println("수빈 조회: " + pointsByName.get("수빈"));
        System.out.println("수빈 키 있음: " + pointsByName.containsKey("수빈"));

        pointsByName.put("다현", null);
        System.out.println("다현 조회: " + pointsByName.get("다현"));
        System.out.println("다현 키 있음: " + pointsByName.containsKey("다현"));
    }
}
```

예상 출력:

```text
지수 점수: 5
변경한 점수: 6
수빈 조회: null
수빈 키 있음: false
다현 조회: null
다현 키 있음: true
```

`지수`를 다시 저장하면 별도의 지수 항목을 추가하지 않고 값이 `6`으로 바뀝니다.
`수빈`과 `다현`의 조회 결과는 모두 `null`이지만, `다현`의 키는 실제로 저장되어 있습니다.
이처럼 `containsKey()`가 참이라는 사실도 값이 숫자임을 보장하지 않습니다. `Integer` 값을 계산에 쓰려면 `null`이 아닌지도 확인해야 합니다.
모든 `Map` 구현체가 `null`을 허용하는 것은 아니므로 여기의 설명은 `HashMap`에 한정합니다.

## 이어서 연습하기

이름과 점수를 연결할 때 키와 값을 각각 무엇으로 정했는지 설명해 보세요.
값을 꺼낼 순서는 [스택과 큐: 값을 꺼내는 순서](#/learn/algorithm/stack-and-queue)에서, 해시·동등성·중복 판단은 [해시와 Map·Set](#/learn/algorithm/hash-map-set)에서 이어서 살펴봅니다.

## 공식 자료

- [Java SE 25 — Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)
- [Java SE 25 — HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
- [Java SE 25 — Dictionary](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Dictionary.html)

사용자 원문 「03 해시(Hash)와 Map·Set」의 키·값 기초를 바탕으로 작성했습니다. 원문·Java 25 API 확인일: 2026-09-14.

## 핵심 질문 답

이름이나 ID로 찾을 때는 위치 대신 키에 값을 연결합니다. `Map` 인터페이스를 사용하는 `HashMap` 객체를 만들고 `put()`으로 저장·변경하며 `get()`으로 조회합니다.
`HashMap`에서 `get()`이 `null`을 돌려주면 키가 없을 수도 있고 값이 `null`일 수도 있으므로 `containsKey()`로 키의 존재를 확인합니다.
이는 딕셔너리라는 일반 자료구조를 표현하는 방법이며 오래된 `java.util.Dictionary`를 새로 사용하는 뜻이 아닙니다.
