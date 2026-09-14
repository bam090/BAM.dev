# 완전 탐색·백트래킹·재귀

## 학습 목표

- 완전 탐색이 가능한 후보를 모두 확인하는 방식임을 설명할 수 있습니다.
- 재귀 메서드의 종료 조건과 더 작은 다음 문제를 작성할 수 있습니다.
- 선택, 재귀 호출, 선택 취소로 백트래킹 상태를 복원할 수 있습니다.
- 정답을 버리지 않는 조건에서만 가지치기를 적용할 수 있습니다.

## 한줄 요약

후보를 빠짐없이 만드는 구조를 먼저 정하고, 종료 조건·상태 복원·안전한 가지치기로 재귀 탐색을 관리합니다.

## 먼저 확인할 개념

- [메서드의 입력·출력 계약](#/learn/java/wiki-methods): 호출한 메서드가 받을 값과 돌려줄 값을 읽습니다.
- [값 전달: 매개변수 재대입과 객체 변경](#/learn/java/wiki-argument-values): 여러 호출이 같은 목록 객체를 사용할 때의 변경을 구분합니다.
- [순서 있는 List의 크기와 삭제](#/learn/java/wiki-lists): 선택 경로의 마지막 원소를 추가·삭제합니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.sorting`
- 이 단원: `algo.brute-force`, `algo.recursion`, `algo.backtracking`
- 후속: `algo.number-theory`, `algo.geometry`, `algo.binary-search`

## 완전 탐색: 후보를 빠짐없이 만든다

한 번의 계산으로 정답을 고를 근거가 없어도 가능한 선택 수가 충분히 작다면 모든 후보를 확인할 수 있습니다.
**완전 탐색**은 정답이 될 수 있는 후보를 빠짐없이 만들고 조건을 검사하는 접근입니다.

`[3, 6, 7, 2]`에서 서로 다른 두 위치의 합이 `10`인 쌍을 찾는다고 합시다.
왼쪽 위치 `left`마다 오른쪽 위치를 `left + 1`부터 확인하면 같은 위치를 두 번 고르거나 같은 위치 쌍을 뒤집어 반복하지 않습니다.
확인할 쌍은 `n(n - 1) / 2`개이므로 탐색 시간은 `O(n²)`입니다.

입력이 커지면 후보 수가 빠르게 늘어납니다.
반복문을 작성하기 전에 입력 크기와 대략 몇 개의 후보를 만들지 확인해야 합니다.
이 예제는 **위치 쌍**을 찾으므로 같은 값이 다른 위치에 있으면 같은 값의 쌍이 결과에 여러 번 나타날 수 있습니다.

## 재귀: 작은 문제의 답이 돌아오기를 기다린다

**재귀**는 메서드가 같은 형태의 더 작은 문제를 풀기 위해 자신을 호출하는 방식입니다.
멈추는 **종료 조건**과 매번 그 조건에 가까워지는 변화가 모두 필요합니다.

`sumTo(5)`를 `5 + sumTo(4)`로 나타내고, `sumTo(0)`은 `0`으로 정해 봅시다.
호출은 `5 → 4 → 3 → 2 → 1 → 0`으로 내려갑니다.
`0`이 반환되면 기다리던 호출들이 역순으로 덧셈을 마쳐 `15`가 됩니다.

Java는 아직 끝나지 않은 호출의 정보를 호출 스택에 유지합니다.
종료 조건이 없거나 깊이가 너무 크면 `StackOverflowError`가 발생할 수 있습니다.
허용 깊이는 실행 환경과 메서드 구성에 따라 달라지므로 특정 횟수까지 항상 안전하다고 가정하지 않습니다.
이 단원의 작은 입력은 흐름을 관찰하기 위한 예제이며, 긴 단순 합에는 반복문이나 계산식을 검토합니다.

## 백트래킹: 선택하고 돌아와 상태를 복원한다

**백트래킹**은 선택을 추가해 한 갈래를 탐색한 뒤 이전 상태로 돌아와 다른 선택을 확인하는 방법입니다.
정답이 될 수 없는 갈래를 일찍 멈추는 판단을 **가지치기**라고 합니다.

모든 값이 양수인 `[2, 3, 5]`에서 각 위치를 최대 한 번 선택해 합이 `5`인 조합을 찾습니다.
현재 위치를 고르는 갈래와 고르지 않는 갈래를 모두 확인합니다.
합이 이미 목표보다 크다면 이후에 양수를 더해도 작아지지 않으므로 그 갈래를 버릴 수 있습니다.

| 단계 | Java 코드의 의미 |
| --- | --- |
| 선택 | `path.add(numbers[index])`로 현재 경로에 추가 |
| 선택한 다음 문제 | `index + 1`과 증가한 합으로 재귀 호출 |
| 선택 취소 | `path.remove(path.size() - 1)`로 마지막 위치 삭제 |
| 선택하지 않은 다음 문제 | 같은 이전 합과 `index + 1`로 재귀 호출 |
| 완성된 경로 보관 | `new ArrayList<>(path)`로 그 시점의 내용을 복사 |

`List<Integer>.remove(int)`의 인수는 값이 아닌 **위치**입니다.
따라서 마지막 값을 지우는 의도를 `path.size() - 1`로 나타냅니다.
현재 경로를 그대로 결과에 넣으면 이후의 선택 취소가 같은 목록 객체를 바꿉니다.
복사본을 저장해야 발견 당시의 조합이 남습니다.

## 예제: 모든 쌍, 재귀 합, 양수 조합 찾기

두 수의 합과 선택 경로의 합은 `long`으로 계산합니다.
조합 입력은 양수로만 구성하고 목표는 `0` 이상으로 제한합니다.
목표 `0`에는 아무것도 고르지 않는 빈 조합 하나가 대응합니다.
음수·0 원소를 허용하는 문제는 가지치기와 종료 조건을 다시 설계해야 하므로 이 메서드에서는 거부합니다.

아래는 `BacktrackingExample.java`로 구성할 수 있는 Java 25 예제입니다.
재귀 호출 전후 `path`와 `sum`을 직접 적어 보면서 읽어 보세요.

```java
import java.util.ArrayList;
import java.util.List;

public class BacktrackingExample {
    static List<List<Integer>> findPairs(int[] numbers, long target) {
        List<List<Integer>> pairs = new ArrayList<>();
        for (int left = 0; left < numbers.length; left++) {
            for (int right = left + 1; right < numbers.length; right++) {
                if ((long) numbers[left] + numbers[right] == target) {
                    pairs.add(List.of(numbers[left], numbers[right]));
                }
            }
        }
        return pairs;
    }

    static long sumTo(int number) {
        if (number < 0) throw new IllegalArgumentException("number >= 0");
        if (number == 0) return 0L;
        return number + sumTo(number - 1);
    }

    static List<List<Integer>> findCombinations(int[] numbers, long target) {
        if (target < 0) throw new IllegalArgumentException("target >= 0");
        for (int value : numbers) {
            if (value <= 0) throw new IllegalArgumentException("양수 원소만 사용");
        }
        List<List<Integer>> combinations = new ArrayList<>();
        search(numbers, target, 0, 0L, new ArrayList<>(), combinations);
        return combinations;
    }

    static void search(int[] numbers, long target, int index, long sum,
                       List<Integer> path, List<List<Integer>> combinations) {
        if (sum == target) {
            combinations.add(new ArrayList<>(path));
            return;
        }
        if (sum > target || index == numbers.length) return;

        path.add(numbers[index]);
        search(numbers, target, index + 1, sum + numbers[index], path, combinations);
        path.remove(path.size() - 1);

        search(numbers, target, index + 1, sum, path, combinations);
    }

    public static void main(String[] args) {
        System.out.println(findPairs(new int[]{3, 6, 7, 2}, 10));
        System.out.println(sumTo(5));
        System.out.println(sumTo(0));
        System.out.println(findCombinations(new int[]{2, 3, 5}, 5));
        System.out.println(findCombinations(new int[]{2, 3, 5}, 0));
        System.out.println(findCombinations(new int[0], 5));
    }
}
```

예상 출력:

```text
[[3, 7]]
15
0
[[2, 3], [5]]
[[]]
[]
```

## 실행 흐름에서 볼 상태

1. `2`를 고르고 `3`을 고르면 합이 `5`입니다. `[2, 3]`의 복사본을 보관합니다.
2. 호출이 돌아오면 `3`을 제거해 `[2]`로 복원하고, `3`을 고르지 않는 갈래를 봅니다.
3. `[2, 5]`는 합이 `7`이므로 양수 조건에 의해 그 갈래를 멈춥니다.
4. `2`와 `3`을 모두 고르지 않은 갈래에서 `[5]`를 발견합니다.
5. 각 선택 뒤에 취소가 있으므로 다음 갈래는 이전 선택의 영향을 받지 않습니다.

`sum`과 `index`는 기본형 값으로 각 호출에 전달됩니다.
반면 `path`는 같은 목록 객체를 가리키므로 내용 변경은 다른 호출에서도 보입니다.
따라서 메서드가 돌아온다는 사실만으로 목록이 저절로 복원되지는 않습니다.

## 흔한 실수와 적용 경계

- 종료 조건만 쓰고 `index`나 남은 크기를 바꾸지 않으면 같은 문제를 반복합니다. 다음 호출이 실제로 작아지는지 확인하세요.
- `combinations.add(path)`는 발견한 순간의 복사본이 아닙니다. 저장한 객체와 탐색 중인 객체가 같은지 확인하세요.
- `add` 뒤의 선택 취소를 빠뜨리면 다른 갈래의 합과 경로가 어긋납니다. 호출 전후 경로가 같은지 비교하세요.
- 음수가 있는 배열에는 `sum > target` 가지치기를 그대로 쓰면 안 됩니다. `[6, -1]`은 합 `5`가 될 수 있는데, 첫 합 `6`에서 멈추면 놓칩니다.
- 양수만 허용하므로 목표를 달성한 뒤 바로 반환해도 이후의 추가 선택이 같은 합을 만들 수 없습니다. `0`까지 허용하면 이 종료 판단도 다시 봐야 합니다.
- 백트래킹을 썼다고 항상 빠른 것은 아닙니다. 각 위치를 고르거나 고르지 않는 후보는 최대 `2^n`개이고 결과 경로를 복사하는 비용도 있습니다.

## 이어서 학습하기

[정수론과 기하학](#/learn/algorithm/number-theory-and-geometry)에서 모든 후보를 만들기 전에 수와 좌표의 관계로 계산할 수 있는 조건을 살펴봅니다.
현재 예제에서는 선택 취소 한 줄을 지웠다고 가정하고, 어떤 시점부터 `path`와 `sum`의 의미가 달라지는지 설명해 보세요.

## 공식 자료

- [Princeton Introduction to Programming in Java: Recursion](https://introcs.cs.princeton.edu/java/23recursion/): 종료 조건, 작은 문제와 재귀 탐색의 흐름.
- [Oracle Java 25: ArrayList](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html): 복사 생성자, 위치 삭제와 목록 변경.
- [Oracle Java 25: StackOverflowError](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html): 너무 깊은 재귀 호출의 오류.

공식 자료 확인일: 2026-09-14. 기존 BAM.dev의 후보 생성·재귀·상태 복원 예제를 Java 25 기준으로 재구성했습니다.

## 핵심 질문 답

모든 후보를 빠뜨리지 않으려면 각 위치에서 가능한 선택을 나누고 모든 갈래를 확인해야 합니다.
재귀에는 종료 조건과 그쪽으로 가까워지는 변화가 필요하며, 공유 경로에 선택을 추가했다면 돌아온 뒤 취소해서 다음 갈래의 시작 상태를 복원합니다.
완성된 경로는 이후 변경의 영향을 받지 않게 복사해 보관합니다.

불필요한 탐색은 버릴 갈래에 정답이 없다는 근거가 있을 때 줄입니다.
양수만 더하는 문제에서는 목표를 넘은 합이 다시 작아질 수 없어 가지치기가 가능하지만, 음수가 들어오면 같은 근거가 사라집니다.
