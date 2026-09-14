# 구현과 문자열 시뮬레이션

## 학습 목표

- 구현과 시뮬레이션 문제가 무엇을 평가하는지 설명할 수 있습니다.
- 문제의 입력, 상태, 한 단계의 변화와 출력을 구분할 수 있습니다.
- 문자열 입력을 필요한 단위로 나누고 순서대로 처리할 수 있습니다.
- 경계값과 상태 갱신 순서를 예제로 검증할 수 있습니다.

## 한줄 요약

문자열 입력을 값으로 나누고, 다음 상태가 규칙을 만족할 때만 현재 상태를 갱신하면 설명 속 절차를 코드로 옮길 수 있습니다.

## 먼저 확인할 개념

[리스트와 조건문](#/learn/algorithm/list-and-conditions)으로 값을 차례로 확인하는 흐름을 익히세요.
문자열을 읽는 Java 메서드는 [문자열의 값과 조립](#/learn/java/wiki-strings), 숫자 범위는 [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)에서 확인할 수 있습니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.grid-traversal`, `java.strings`, `java.numeric-operations`
- 이 단원: `algo.simulation`, `algo.string-processing`
- 후속: `algo.dynamic-programming-advanced`, `algo.weighted-graph`, `algo.dijkstra`

## 문제를 네 부분으로 나누기

구현 문제는 특별한 공식보다 주어진 조건과 절차를 빠뜨리지 않고 코드로 옮기는 능력을 확인합니다.
**시뮬레이션**은 규칙을 순서대로 적용하면서 현재 상태가 바뀌는 과정을 따라가는 방법입니다.

로봇의 이동 명령을 읽는 문제라면 먼저 다음 네 부분을 구분합니다.

| 구분 | 예제의 내용 |
| --- | --- |
| 입력 | 쉼표로 구분된 `R 3, R 4, L 2, L 9` 명령 |
| 상태 | 현재 위치와 실제로 머문 위치 기록 |
| 규칙 | 오른쪽·왼쪽으로 이동하되 허용 범위를 벗어나면 그 명령을 무시 |
| 출력 | 마지막 위치와 이동이 반영된 위치 목록 |

**먼저 예상해 보세요.** `0`에서 시작해 `0` 이상 `8` 이하로만 움직일 때 네 명령 뒤에 어디에 있을까요?
`L 9`가 범위를 벗어났다면 그 직전 위치까지 되돌려야 할까요, 아니면 상태를 바꾸지 않으면 될까요?

## 문자열을 풀이용 데이터로 바꾸기

문자열을 필요한 조각과 숫자로 바꾸는 과정을 **파싱**이라고 합니다.
예제의 명령은 쉼표로 나누고 각 조각의 앞뒤 공백을 제거합니다.
빈 조각은 제외한 뒤 방향과 거리를 공백으로 나눕니다.

| Java 표현 | 읽는 내용 |
| --- | --- |
| `commandText.split(",")` | 쉼표로 나눈 문자열 배열 |
| `piece.trim()` | 조각 앞뒤의 공백을 제거한 문자열 |
| `command.split("\\s+")` | 하나 이상의 공백으로 구분된 방향·거리 |
| `Integer.parseInt(parts[1])` | 거리 문자열을 `int` 정수로 변환 |
| `"R".equals(direction)` | 방향 문자열의 내용이 `R`인지 비교 |
| `commands.charAt(index)` | 해당 인덱스의 `char` 값 하나 |

`String.split()`의 구분자는 정규식입니다.
Java 문자열 안에서 `\s+`를 정규식에 전달하려면 소스에는 `"\\s+"`로 씁니다.
문자열 내용은 `==` 대신 `equals()`로 비교합니다.
`"4" + 1`은 문자열 `"41"`이므로 계산하려면 먼저 숫자로 변환해야 합니다.

`charAt()`과 `length()`의 기준은 UTF-16 코드 단위입니다.
아래의 `F`, `L`, `R` 같은 ASCII 명령은 한 `char`로 읽을 수 있습니다.
이모지 등 보조 문자는 두 코드 단위를 차지할 수 있으므로 임의의 유니코드 문자를 세는 문제까지 이 방식으로 일반화하지 않습니다.

## 다음 상태를 먼저 계산하기

현재 위치가 `2`일 때 `R 3`의 다음 위치는 `5`, `L 1`의 다음 위치는 `1`입니다.
이 계산과 실제 반영을 구분하면 경계를 벗어난 명령을 되돌리는 코드가 필요 없습니다.

1. 방향과 거리로 다음 위치를 계산합니다.
2. 다음 위치가 최솟값 이상, 최댓값 이하인지 확인합니다.
3. 조건을 통과했을 때만 현재 위치를 바꾸고 기록에 추가합니다.

앞 명령의 결과가 다음 명령의 시작 상태가 됩니다.
문제에서 동시 처리를 요구하지 않았다면 명령 순서를 바꾸지 않습니다.

## Java 예제: 명령을 순서대로 적용하기

정식 Java 25 예제입니다.
이 예제의 위치·거리는 정수이며 거리는 `0` 이상 `Integer.MAX_VALUE` 이하입니다.
입력 문자열은 `null`이 아니고, 명령은 방향과 거리 두 토큰으로 구성됩니다.
빈 조각은 제외하고 알 수 없는 방향은 무시합니다.
숫자로 바꿀 수 없는 거리·음수 거리·잘못된 토큰 수는 예외로 알립니다.

위치와 거리의 덧셈은 계산 **전에** 위치를 `long`으로 넓혀 `int` 덧셈의 넘침을 피합니다.
허용된 `int` 위치 범위 안인지 확인한 뒤에만 다시 `int`로 저장합니다.

```java
import java.util.ArrayList;
import java.util.List;

public class StringSimulationExample {
    static final class SimulationResult {
        final int position;
        final List<Integer> visited;

        SimulationResult(int position, List<Integer> visited) {
            this.position = position;
            this.visited = visited;
        }
    }

    static List<String> parseCommands(String commandText) {
        List<String> commands = new ArrayList<>();
        for (String piece : commandText.split(",")) {
            String command = piece.trim();
            if (!command.isEmpty()) commands.add(command);
        }
        return commands;
    }

    static SimulationResult simulateRobot(String commandText,
                                           int minPosition, int maxPosition) {
        if (minPosition > maxPosition) {
            throw new IllegalArgumentException("위치 범위가 올바르지 않습니다.");
        }
        int position = minPosition;
        List<Integer> visited = new ArrayList<>();
        visited.add(position);

        for (String command : parseCommands(commandText)) {
            String[] parts = command.split("\\s+");
            if (parts.length != 2) {
                throw new IllegalArgumentException("방향과 거리를 입력하세요.");
            }
            String direction = parts[0];
            int distance = Integer.parseInt(parts[1]);
            if (distance < 0) {
                throw new IllegalArgumentException("거리는 0 이상이어야 합니다.");
            }

            long nextPosition;
            if ("R".equals(direction)) {
                nextPosition = (long) position + distance;
            } else if ("L".equals(direction)) {
                nextPosition = (long) position - distance;
            } else {
                continue;
            }
            if (nextPosition < minPosition || nextPosition > maxPosition) continue;
            position = (int) nextPosition;
            visited.add(position);
        }
        return new SimulationResult(position, visited);
    }

    static int countForwardMoves(String commands) {
        int count = 0;
        for (int index = 0; index < commands.length(); index++) {
            if (commands.charAt(index) == 'F') count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(parseCommands(" R 2, L 1, R 3 "));
        SimulationResult result = simulateRobot("R 3, R 4, L 2, L 9", 0, 8);
        System.out.println(result.position);
        System.out.println(result.visited);
        System.out.println(countForwardMoves("FFLFR"));
    }
}
```

예상 출력:

```text
[R 2, L 1, R 3]
5
[0, 3, 7, 5]
3
```

## 실행 흐름에서 확인할 지점

| 명령 | 반영 전 위치 | 계산한 다음 위치 | 반영 여부 |
| --- | --- | --- | --- |
| R 3 | 0 | 3 | 범위 안이므로 반영 |
| R 4 | 3 | 7 | 범위 안이므로 반영 |
| L 2 | 7 | 5 | 범위 안이므로 반영 |
| L 9 | 5 | -4 | 범위 밖이므로 현재 위치 유지 |

`visited`는 지나간 모든 칸이 아니라 **시작 위치와 반영한 명령의 도착 위치**를 기록합니다.
거리 `0`인 명령도 허용되므로 같은 위치가 연속해서 기록될 수 있습니다.

`countForwardMoves()`의 상태는 `count` 하나입니다.
문자열을 앞에서부터 읽다가 `'F'`를 만났을 때만 증가하므로 `FFLFR`에서 `3`이 됩니다.

## 흔한 실수와 직접 확인하기

- 문자열 방향을 `==`로 비교하면 내용이 같은 다른 문자열 객체를 놓칠 수 있습니다. `equals()`인지 확인하세요.
- 숫자 문자열을 변환하지 않으면 덧셈이 아니라 연결이 됩니다.
- `(long) (position + distance)`는 `int` 계산이 끝난 뒤 변환합니다. 한 피연산자를 먼저 `long`으로 바꿔야 합니다.
- 현재 위치를 먼저 바꾸면 무시해야 하는 이동을 되돌려야 합니다. 후보를 검사한 다음 반영하세요.
- `0` 이상 `8` 이하에는 양 끝값도 포함됩니다. 경계와 같은 값을 잘못 제외하지 마세요.

빈 명령 문자열, 정확히 `8`에 도착하는 명령, `9`로 벗어나는 명령을 손으로 추적해 보세요.
각 단계의 예상 위치와 기록을 먼저 적은 뒤 코드의 결과와 비교하면 규칙이 빠진 지점을 찾기 쉽습니다.

## 이어서 학습하기

[동적 계획법 2](#/learn/algorithm/dynamic-programming-advanced)에서 여러 정보로 결정되는 상태와 이전 선택을 보관하는 방법으로 이어집니다.

## 공식 자료

- [Java 25: String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)
- [Java 25: Integer.parseInt](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html)
- [Java 언어 명세 25: 숫자 연산](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2)

공식 자료 확인일: 2026-09-14. 기존 BAM.dev 로봇 명령과 문자 개수 예제를 Java 문자열·정수 규칙에 맞춰 재구성했습니다.

## 핵심 질문 답

긴 문제 설명은 입력, 계속 기억할 상태, 한 단계의 규칙, 최종 출력으로 나누어 실행 가능한 단계로 옮깁니다.
문자열 명령은 구분자로 나누고 공백을 정리한 뒤 숫자 부분을 변환합니다.
그다음 입력 순서대로 다음 상태를 계산하고, 경계를 통과한 경우에만 현재 상태를 갱신합니다.
마지막으로 빈 입력·최솟값·최댓값·범위를 벗어나는 입력의 예상 상태를 비교해 조건과 처리 순서가 일치하는지 확인합니다.
