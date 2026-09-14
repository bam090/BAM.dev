# 리스트와 조건문: 여러 값에서 조건에 맞는 값 찾기

## 학습 목표

- `List<Integer>`와 `ArrayList`로 여러 점수를 저장하고 위치와 개수를 확인할 수 있습니다.
- `for`로 값을 차례대로 읽고 `if`로 조건에 맞는 값만 처리할 수 있습니다.

## 한줄 요약

`List`는 값의 순서를 유지하고, 반복문은 각 값을 읽으며, 조건문은 그 값을 처리할지 고릅니다.

## 먼저 확인할 개념

[조건과 반복의 실행 경계](#/learn/java/wiki-control-flow), [제네릭: 타입 인수로 저장·조회 타입 정하기](#/learn/java/wiki-generics), [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists)를 먼저 확인해 보세요.

## 개념 연결

- 선행: `java.control-flow`, `java.generics`, `java.lists`
- 이 단원: `algo.list`, `algo.condition`
- 후속: `algo.dictionary`, `algo.stack`, `algo.queue`

## 순서가 있는 여러 값을 담는다

**리스트(list)**는 여러 값을 순서대로 저장하는 구조입니다. 몇 번째 값인지가 중요하거나 전체 값을 차례대로 확인할 때 알맞습니다.
Java의 `List`는 순서 있는 목록의 기능을 정한 인터페이스이고, `ArrayList`는 그 규칙을 따르는 구현 클래스입니다.

`List<Integer> scores = new ArrayList<>();`에서 왼쪽은 정수 목록을 사용하겠다는 뜻이고, 오른쪽은 실제로 값을 담을 객체를 만듭니다.
타입 인수에는 기본형 `int`를 직접 넣지 않으므로 `List<int>`가 아닌 `List<Integer>`로 씁니다.

| 할 일 | 이 문서의 코드 | 관찰할 점 |
| --- | --- | --- |
| 끝에 점수 추가 | `scores.add(72)` | 추가한 값은 목록 끝에 놓입니다. |
| 위치로 점수 읽기 | `scores.get(0)` | 첫 인덱스는 `0`입니다. |
| 개수 확인 | `scores.size()` | 마지막 유효 인덱스는 `size() - 1`입니다. |
| 빈 목록 확인 | `scores.isEmpty()` | 값이 하나도 없으면 `true`입니다. |

이 예제의 `ArrayList`는 원소를 추가할 수 있지만 모든 `List`가 수정 가능한 것은 아닙니다.
값의 개수가 고정된 배열과의 비교는 [배열의 원소와 경계](#/learn/java/wiki-arrays)에서 더 살펴볼 수 있습니다.

## 읽는 순서와 처리할 조건을 나눈다

점수가 `72`, `91`, `84` 순서로 들어 있습니다. 이 가운데 `80점 이상`인 값만 출력하려면 어떤 부분이 필요할지 먼저 나누어 보세요.

- 목록은 원래 점수와 순서를 보관합니다.
- `for`는 점수를 하나씩 읽습니다.
- `if`는 현재 점수가 기준을 만족하는지 판단합니다.

다음 코드를 `ListConditionsDemo.java`에 저장할 수 있습니다. Java 25의 정식 문법과 표준 API만 사용하는 예제입니다.

```java
import java.util.ArrayList;
import java.util.List;

public class ListConditionsDemo {
    public static void main(String[] args) {
        List<Integer> scores = new ArrayList<>();
        scores.add(72);
        scores.add(91);
        scores.add(84);

        System.out.println("첫 점수: " + scores.get(0));
        System.out.println("점수 개수: " + scores.size());

        for (int score : scores) {
            if (score >= 80) {
                System.out.println("조건에 맞는 점수: " + score);
            }
        }

        System.out.println("빈 목록인가: " + scores.isEmpty());
    }
}
```

예상 출력:

```text
첫 점수: 72
점수 개수: 3
조건에 맞는 점수: 91
조건에 맞는 점수: 84
빈 목록인가: false
```

`72`는 조건을 만족하지 않아 출력하지 않고, `91`과 `84`는 읽은 순서대로 출력합니다.
조건문은 출력 여부만 고르므로 원래 목록의 값이나 개수는 바뀌지 않습니다.
이 예제에는 `null` 점수가 없으며, `for`에서 읽은 `Integer` 값은 `int`로 바뀌어 비교됩니다.

조건문 자체가 모든 값을 순회해 주는 것은 아닙니다. 반대로 반복문만 있다고 해서 원하는 값만 골라지는 것도 아닙니다.

## 이어서 연습하기

예제에서 값을 보관하는 곳, 하나씩 읽는 곳, 출력 여부를 결정하는 곳을 나누어 자신의 말로 설명해 보세요.
위치 대신 이름이나 ID로 값을 찾아야 할 때는 [딕셔너리: 키로 값 저장하고 찾기](#/learn/algorithm/dictionary)로 이어집니다.

## 공식 자료

- [Java SE 25 — List](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [Java SE 25 — ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java Language Specification SE 25 — The enhanced for statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2)

사용자 원문 「01 배열(Array)과 List」를 바탕으로 조건 선택 예제를 연결했습니다. 원문 확인일: 2026-09-14.

## 핵심 질문 답

`List<Integer>`에 값의 순서를 보관하고 `for`로 점수를 하나씩 읽은 뒤 `if`로 처리 여부를 결정합니다.
`new ArrayList<>()`로 만든 목록에 `add()`로 넣고, `get()`으로 위치의 값을, `size()`로 개수를 확인합니다.
80점 이상일 때만 출력하면 `91`, `84`가 원래 순서대로 나오며, 출력에서 제외된 `72`도 목록에는 그대로 남아 있습니다.
