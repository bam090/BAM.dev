# 코드에서 시간 복잡도 계산하기

## 학습 목표

- 반복문의 모양과 Java 컬렉션 메서드를 보고 코드의 시간 복잡도를 계산하고 입력 크기에 맞는 풀이인지 판단할 수 있습니다.

## 한줄 요약

반복문이 몇 겹인지와 반복할 때마다 범위가 어떻게 줄어드는지를 보면 시간 복잡도가 나오고 이를 입력 크기와 비교하면 풀이가 시간 안에 끝날지 알 수 있습니다.

## 먼저 확인할 개념

[자료구조와 알고리즘: 시간 복잡도로 고르기](#/learn/algorithm/data-structures-and-algorithms)

## 반복문으로 복잡도 세기

코드의 시간 복잡도는 입력 크기 `n`에 따라 반복이 몇 번 도는지 세어서 구합니다.
앞 문서에서는 복잡도의 뜻과 종류를 봤습니다.
이번에는 실제 코드에서 그 복잡도를 읽어 내는 방법을 익혀 보겠습니다.

대부분의 코드는 반복문의 모양만 봐도 복잡도가 보입니다.

![세 가지 반복 모양. 한 겹 반복은 n칸을 한 번씩 보아 O(n)이고 두 겹 반복은 칸마다 다시 n칸을 보아 O(n²)이며 반씩 줄이기는 볼 범위가 매번 절반이 되어 O(log n)이다](content/assets/algorithm/algo0-loop-shapes.png)

세 모양을 코드로 옮기고 반복 횟수를 세어 보겠습니다.

```java
static long single(int n) {
    long count = 0;
    for (int i = 0; i < n; i++) {
        count++;
    }
    return count;
}

static long nested(int n) {
    long count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            count++;
        }
    }
    return count;
}

static long halving(int n) {
    long count = 0;
    for (int i = n; i > 1; i /= 2) {
        count++;
    }
    return count;
}
```

`n`이 10·100·1,000일 때 세 함수가 각각 몇을 돌려줄지 먼저 예상해 보세요.

```text
n=10 | 한 겹: 10 | 두 겹: 100 | 반씩: 3
n=100 | 한 겹: 100 | 두 겹: 10000 | 반씩: 6
n=1000 | 한 겹: 1000 | 두 겹: 1000000 | 반씩: 9
```

`n`이 10배 커질 때마다 한 겹은 10배로 늘고 두 겹은 100배로 늘어납니다.
반면 반씩 줄이는 반복은 `n`이 1,000이 되어도 9번뿐입니다.
1,000을 계속 반으로 나누면 아홉 번쯤 나누었을 때 1에 가까워지기 때문이고 이 횟수가 바로 `log n`입니다.

### 복잡도를 합치는 규칙

반복문이 여러 개 섞여 있을 때는 아래 규칙으로 합칩니다.

| 코드 모양 | 계산 | 결과 |
| --- | --- | --- |
| 반복문을 차례로 두 번 씀 | `n + n = 2n` | `O(n)` |
| 반복문 안에 반복문 | `n × n` | `O(n²)` |
| 한 겹 반복 안에서 범위를 반씩 줄임 | `n × log n` | `O(n log n)` |
| 한 겹 반복 뒤에 두 겹 반복 | `n + n²` | `O(n²)` |

차례로 이어진 코드는 **더하고** 안에 들어간 코드는 **곱합니다**.
그다음 가장 크게 늘어나는 항만 남깁니다.

## Java 메서드의 숨은 비용

반복문이 보이지 않아도 복잡도가 숨어 있을 수 있습니다.
Java 컬렉션의 메서드 한 줄이 안에서 전체를 훑기도 하기 때문입니다.

| 메서드 | 복잡도 | 이유 |
| --- | --- | --- |
| `ArrayList`의 `get(i)` | `O(1)` | 번호로 바로 꺼냅니다 |
| `ArrayList`의 `contains(x)` | `O(n)` | 처음부터 하나씩 비교합니다 |
| `ArrayList`의 `remove(0)` | `O(n)` | 뒤의 원소를 한 칸씩 앞으로 당깁니다 |
| `HashSet`의 `contains(x)`·`add(x)` | 평균 `O(1)` | 해시로 칸을 바로 계산합니다 |
| `Collections.sort(list)`·`Arrays.sort(arr)` | `O(n log n)` | 효율적인 정렬 알고리즘을 씁니다 |

그래서 반복문 안에서 `ArrayList`의 `contains()`를 부르면 겉보기에는 한 겹이지만 실제로는 두 겹이 됩니다.
출석 기록에서 같은 이름이 두 번 나오는지 찾는 코드로 비교해 보겠습니다.

```java
static String findWithList(List<String> signIns) {
    List<String> seen = new ArrayList<>();
    for (String name : signIns) {
        if (seen.contains(name)) return name;
        seen.add(name);
    }
    return "없음";
}

static String findWithSet(List<String> signIns) {
    Set<String> seen = new HashSet<>();
    for (String name : signIns) {
        if (!seen.add(name)) return name;
    }
    return "없음";
}
```

```text
List로 찾은 중복: 민지
Set으로 찾은 중복: 민지
```

두 함수의 결과는 같습니다.
하지만 `findWithList`는 반복마다 `contains()`가 지금까지 본 이름을 전부 훑으므로 `O(n²)`입니다.
`findWithSet`은 반복마다 평균 한 번의 연산이라 `O(n)`입니다.
`HashSet`의 `add()`는 이미 있는 값이면 `false`를 돌려주므로 이것으로 중복을 바로 알 수 있습니다.

## 입력 크기로 풀이 고르기

이제 복잡도를 문제의 입력 크기와 비교해 보겠습니다.
대략적인 기준으로 컴퓨터는 1초에 1억 번 정도의 단순한 연산을 한다고 봅니다.
실제 속도는 언어와 채점 환경에 따라 다르지만 풀이를 고르는 기준으로는 충분합니다.

| 입력 크기 n | 1초 안에 끝나는 복잡도 (대략) |
| --- | --- |
| 10 이하 | `O(n!)` |
| 20 이하 | `O(2ⁿ)` |
| 500 이하 | `O(n³)` |
| 5,000 이하 | `O(n²)` |
| 1,000,000 이하 | `O(n log n)` |
| 100,000,000 이하 | `O(n)` |

예를 들어 출석 기록이 최대 10만 개인 문제라면 `findWithList`는 최악의 경우 10만 × 10만의 절반인 약 50억 번의 비교를 합니다.
1억 번의 50배이므로 시간 안에 끝나지 않습니다.
`findWithSet`은 10만 번 정도로 끝나므로 이 문제에는 `HashSet` 풀이를 골라야 합니다.

문제를 읽을 때 입력 크기부터 확인하는 습관을 들이면 코드를 다 쓰고 나서 시간 초과를 만나는 일을 줄일 수 있습니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `ComplexityInCode.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.HashSet;
> import java.util.List;
> import java.util.Set;
>
> public class ComplexityInCode {
>     static long single(int n) {
>         long count = 0;
>         for (int i = 0; i < n; i++) {
>             count++;
>         }
>         return count;
>     }
>
>     static long nested(int n) {
>         long count = 0;
>         for (int i = 0; i < n; i++) {
>             for (int j = 0; j < n; j++) {
>                 count++;
>             }
>         }
>         return count;
>     }
>
>     static long halving(int n) {
>         long count = 0;
>         for (int i = n; i > 1; i /= 2) {
>             count++;
>         }
>         return count;
>     }
>
>     static String findWithList(List<String> signIns) {
>         List<String> seen = new ArrayList<>();
>         for (String name : signIns) {
>             if (seen.contains(name)) return name;
>             seen.add(name);
>         }
>         return "없음";
>     }
>
>     static String findWithSet(List<String> signIns) {
>         Set<String> seen = new HashSet<>();
>         for (String name : signIns) {
>             if (!seen.add(name)) return name;
>         }
>         return "없음";
>     }
>
>     public static void main(String[] args) {
>         for (int n : new int[] {10, 100, 1000}) {
>             System.out.println("n=" + n + " | 한 겹: " + single(n) + " | 두 겹: " + nested(n) + " | 반씩: " + halving(n));
>         }
>
>         List<String> signIns = List.of("민지", "도윤", "서아", "민지");
>         System.out.println("List로 찾은 중복: " + findWithList(signIns));
>         System.out.println("Set으로 찾은 중복: " + findWithSet(signIns));
>     }
> }
> ```
>
> ```text
> n=10 | 한 겹: 10 | 두 겹: 100 | 반씩: 3
> n=100 | 한 겹: 100 | 두 겹: 10000 | 반씩: 6
> n=1000 | 한 겹: 1000 | 두 겹: 1000000 | 반씩: 9
> List로 찾은 중복: 민지
> Set으로 찾은 중복: 민지
> ```

## 정리

- 차례로 이어진 반복은 더하고 안에 들어간 반복은 곱한 뒤 가장 크게 늘어나는 항만 남깁니다.
- 범위를 매번 반으로 줄이는 반복은 `O(log n)`입니다.
- `ArrayList`의 `contains()`·`remove(0)`처럼 메서드 한 줄에 `O(n)`이 숨어 있을 수 있습니다.
- 1초에 약 1억 번을 기준으로 입력 크기와 복잡도를 비교해 풀이를 고릅니다.

## 공식 자료

- [Java 25 API: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java 25 API: HashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html)

## 핵심 질문 답

반복문이 몇 겹인지 보고 차례로 이어진 반복은 더하고 안에 들어간 반복은 곱해서 복잡도를 구합니다.
범위를 매번 반으로 줄이는 반복은 `O(log n)`이고 `ArrayList`의 `contains()`처럼 메서드 안에 숨은 반복도 함께 셉니다.
그렇게 구한 복잡도에 입력 크기를 넣어 1초에 약 1억 번을 넘는지 확인하면 풀이가 시간 안에 끝날지 판단할 수 있습니다.
