# Java로 DP 표 채우기

## 학습 목표

- 문제에 맞는 `int[]`·`long[]`·2차원 배열로 DP 표를 만들고 반복문이나 재귀와 메모 배열로 채울 수 있습니다.

## 한줄 요약

Java에서 DP 표는 배열로 만들고 답의 크기에 맞춰 `int`와 `long`을 고르며 두 정보가 필요하면 2차원 배열을 쓰고 재귀로 풀 때는 메모 배열을 `-1`로 채워 둡니다.

## 먼저 확인할 개념

[동적 계획법: 작은 답을 저장해 큰 답 만들기](#/learn/algorithm/binary-search-and-dynamic-programming) · [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)

## DP 표 만들기

Java에서 **DP 표**는 부분 문제의 답을 담는 배열이고 칸 번호가 곧 상태입니다.
앞 문서에서는 피보나치 수로 상태·점화식·초기값·계산 순서를 정했습니다.
이번에는 그 설계를 Java 배열로 옮길 때 무엇을 골라야 하는지 살펴봅니다.

예를 들어 계단을 한 번에 한 칸 또는 두 칸씩 올라 `n`번 계단에 도착하는 문제를 떠올려 보세요.
이 문서는 이 계단 하나로 끝까지 설명합니다.
마지막 한 걸음이 한 칸이었다면 `n - 1`번에서 왔고 두 칸이었다면 `n - 2`번에서 왔습니다.
그래서 `n`번까지 오는 방법의 수는 `ways[n] = ways[n - 1] + ways[n - 2]`입니다.

표를 만들 때는 아래 세 가지를 먼저 정합니다.

| 정할 것 | 고르는 기준 | 계단 예제에서 |
| --- | --- | --- |
| 배열 크기 | 가장 큰 상태 번호 + 1 | `n`번 계단까지 쓰므로 `new long[n + 1]` |
| 칸의 타입 | 답이 `int` 범위를 넘을 수 있는지 | 방법의 수가 빠르게 커지므로 `long` |
| 빈 칸의 값 | 아직 계산하지 않은 칸을 무엇으로 표시할지 | 반복문으로 채우면 기본값 0 그대로 |

Java 배열은 만들 때 모든 칸이 0으로 채워집니다.
그래서 합이나 개수를 구하는 표는 따로 초기화하지 않아도 되지만 최솟값을 구하는 표나 메모 배열은 0이 진짜 답과 헷갈릴 수 있어 다른 값으로 채워 둡니다.
0번 칸을 바닥으로 쓰면 `ways[n]`의 번호가 계단 번호와 같아져서 읽기 쉽습니다.

## 계단 오르기

계단 오르기를 `int[]` 표로 먼저 채워 보겠습니다.
바닥인 0번에 머무는 방법과 1번 계단에 오르는 방법은 한 가지씩이므로 두 칸의 초기값은 1입니다.

```java
static int countWaysInt(int n) {
    int[] ways = new int[n + 1];
    ways[0] = 1;
    ways[1] = 1;
    for (int i = 2; i <= n; i++) {
        ways[i] = ways[i - 1] + ways[i - 2];
    }
    return ways[n];
}
```

`n`이 45일 때와 46일 때 결과가 어떻게 나올지 예상해 보세요.

```text
int 45칸: 1836311903
int 46칸: -1323752223
```

방법의 수가 음수로 나왔습니다.
`int`는 약 21억까지만 담을 수 있는데 46칸의 방법 수는 약 29억이라서 넘친 값이 음수로 돌아갔기 때문입니다.
이렇게 범위를 넘는 것을 **오버플로**라고 하고 Java는 오류 없이 틀린 값을 그대로 돌려줍니다.

그래서 값이 빠르게 커지는 DP 표는 `long[]`으로 만듭니다.
코드는 `int`를 `long`으로 바꾼 것이 전부입니다.

```text
long 46칸: 2971215073
long 91칸: 7540113804746346429
long 92칸: -6246583658587674878
```

`long`은 약 922경까지 담아서 91칸까지는 정확합니다.
하지만 92칸에서는 `long`도 넘칩니다.
그래서 코딩테스트의 경우의 수 문제는 보통 `1,000,000,007` 같은 수로 나눈 나머지를 답하라고 하고 칸마다 나머지를 구해 저장합니다.

> [!question]- 오버플로를 바로 알아차리려면?
> `Math.addExact(a, b)`는 더한 값이 타입의 범위를 넘으면 틀린 값을 돌려주는 대신 `ArithmeticException`을 던집니다.
> 범위를 넘지 않는다고 확신할 수 없을 때 `+` 대신 쓰면 오버플로를 바로 알 수 있습니다.

## 최소 비용 계단 오르기

이번에는 계단마다 밟는 비용이 있고 꼭대기까지 가는 비용의 합을 가장 적게 만드는 문제입니다.
이동 규칙은 그대로 한 칸 또는 두 칸입니다.

![0번 바닥부터 6번 계단까지 올라가는 계단 그림. 1번부터 6번 계단의 비용은 3·1·4·1·5·2이고 아래 DP 표는 0·3·1·5·2·7·4이다. 0·2·4·6번 계단이 초록색으로 칠해져 있고 이 계단을 밟으면 비용 1 더하기 1 더하기 2로 4가 되어 가장 적다.](content/assets/algorithm/dp-java-min-cost.png)

`dp[i]`는 `i`번 계단까지 오는 최소 비용입니다.
`i`번에 오기 직전은 `i - 1`번이나 `i - 2`번이므로 둘 중 적은 쪽에 `i`번의 비용을 더합니다.

```java
static int[] minCostTable(int[] cost) {
    int n = cost.length - 1;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = cost[1];
    for (int i = 2; i <= n; i++) {
        dp[i] = Math.min(dp[i - 1], dp[i - 2]) + cost[i];
    }
    return dp;
}
```

비용 배열 `{0, 3, 1, 4, 1, 5, 2}`에서 0번 칸은 바닥이라 비용이 0입니다.
표를 직접 채워 본 뒤 결과와 비교해 보세요.

```text
최소 비용 표: [0, 3, 1, 5, 2, 7, 4]
꼭대기까지 최소 비용: 4
```

`dp[3]`은 `dp[2]`의 1과 `dp[1]`의 3 중 작은 1에 3번 계단의 비용 4를 더해 5입니다.
이렇게 앞 두 칸만 보면 되므로 표 전체를 한 번 훑는 `O(n)`에 끝납니다.
이 문제는 비용의 합이 크지 않으므로 `int[]`로 충분합니다.

## 2차원 배열로 만드는 표

규칙이 하나 더 붙으면 번호 하나로는 상태를 구분할 수 없을 때가 있습니다.
이번에는 두 칸 이동을 연달아 할 수 없다는 규칙을 더해 보겠습니다.
그러면 지금 계단에 한 칸으로 왔는지 두 칸으로 왔는지에 따라 다음에 할 수 있는 이동이 달라집니다.

이럴 때 `long[][] dp = new long[n + 1][2]`처럼 2차원 배열을 씁니다.
`dp[i][0]`은 `i`번에 한 칸 이동으로 도착한 방법의 수이고 `dp[i][1]`은 두 칸 이동으로 도착한 방법의 수입니다.

![두 칸 이동을 연달아 할 수 없는 계단의 2차원 표. 행은 0번부터 5번 계단까지이고 왼쪽 열은 한 칸으로 도착 오른쪽 열은 두 칸으로 도착이다. 값은 차례로 1과 0·1과 0·1과 1·2와 1·3과 1·4와 2이다. 5번 행의 왼쪽 칸은 4번 행 두 칸의 합인 4이고 오른쪽 칸은 3번 행 왼쪽 칸과 같은 2이며 5칸의 방법 수는 6이다.](content/assets/algorithm/dp-java-2d-table.png)

한 칸 이동은 앞 칸에 어떻게 왔든 할 수 있으므로 `dp[i - 1]`의 두 칸을 모두 더합니다.
두 칸 이동은 직전 이동이 한 칸이었을 때만 할 수 있으므로 `dp[i - 2][0]`만 가져옵니다.
바닥은 한 칸 이동으로 도착한 것처럼 `dp[0][0] = 1`로 두어 첫 이동으로 두 칸을 오를 수 있게 합니다.

```java
static long[][] noDoubleTwo(int n) {
    long[][] dp = new long[n + 1][2];
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++) {
        dp[i][0] = dp[i - 1][0] + dp[i - 1][1];
        if (i >= 2) dp[i][1] = dp[i - 2][0];
    }
    return dp;
}
```

```text
2차원 표: [[1, 0], [1, 0], [1, 1], [2, 1], [3, 1], [4, 2]]
5칸 방법 수: 6
```

마지막 답은 두 열을 더한 `dp[5][0] + dp[5][1]`입니다.
2차원 배열을 출력할 때는 `Arrays.toString` 대신 `Arrays.deepToString`을 써야 안쪽 배열의 값까지 보입니다.
두 정보로 상태를 만드는 방법은 [동적 계획법 2](#/learn/algorithm/dynamic-programming-advanced)에서 격자 문제로 더 자세히 다룹니다.

## 재귀와 메모 배열

점화식을 재귀로 떠올리는 편이 쉽다면 메모이제이션으로 구현합니다.
이때는 아직 계산하지 않은 칸을 표시할 값이 필요합니다.

```java
static long[] memo;

static long countWaysMemo(int n) {
    if (n <= 1) return 1;
    if (memo[n] != -1) return memo[n];
    memo[n] = countWaysMemo(n - 1) + countWaysMemo(n - 2);
    return memo[n];
}
```

```java
memo = new long[46 + 1];
Arrays.fill(memo, -1);
System.out.println("메모 46칸: " + countWaysMemo(46));
```

앞에서 `long[]` 표로 구한 46칸의 답과 같을지 예상해 보세요.

```text
메모 46칸: 2971215073
```

`Arrays.fill(memo, -1)`로 모든 칸을 -1로 채운 이유는 답이 0인 칸과 아직 계산하지 않은 칸을 구분하려는 것입니다.
방법의 수나 비용은 음수가 될 수 없으므로 -1은 계산 전이라는 표시로 안전합니다.

다만 재귀는 호출이 끝나기 전까지 스택에 쌓입니다.
`n`이 수만 이상으로 커지면 스택이 넘쳐 `StackOverflowError`가 날 수 있습니다.
그래서 입력이 큰 문제는 같은 점화식을 반복문으로 채우는 편이 안전합니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `StairsDp.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.Arrays;
>
> public class StairsDp {
>     static int countWaysInt(int n) {
>         int[] ways = new int[n + 1];
>         ways[0] = 1;
>         ways[1] = 1;
>         for (int i = 2; i <= n; i++) {
>             ways[i] = ways[i - 1] + ways[i - 2];
>         }
>         return ways[n];
>     }
>
>     static long countWays(int n) {
>         long[] ways = new long[n + 1];
>         ways[0] = 1;
>         ways[1] = 1;
>         for (int i = 2; i <= n; i++) {
>             ways[i] = ways[i - 1] + ways[i - 2];
>         }
>         return ways[n];
>     }
>
>     static int[] minCostTable(int[] cost) {
>         int n = cost.length - 1;
>         int[] dp = new int[n + 1];
>         dp[0] = 0;
>         dp[1] = cost[1];
>         for (int i = 2; i <= n; i++) {
>             dp[i] = Math.min(dp[i - 1], dp[i - 2]) + cost[i];
>         }
>         return dp;
>     }
>
>     static long[][] noDoubleTwo(int n) {
>         long[][] dp = new long[n + 1][2];
>         dp[0][0] = 1;
>         for (int i = 1; i <= n; i++) {
>             dp[i][0] = dp[i - 1][0] + dp[i - 1][1];
>             if (i >= 2) dp[i][1] = dp[i - 2][0];
>         }
>         return dp;
>     }
>
>     static long[] memo;
>
>     static long countWaysMemo(int n) {
>         if (n <= 1) return 1;
>         if (memo[n] != -1) return memo[n];
>         memo[n] = countWaysMemo(n - 1) + countWaysMemo(n - 2);
>         return memo[n];
>     }
>
>     public static void main(String[] args) {
>         System.out.println("int 45칸: " + countWaysInt(45));
>         System.out.println("int 46칸: " + countWaysInt(46));
>         System.out.println("long 46칸: " + countWays(46));
>         System.out.println("long 91칸: " + countWays(91));
>         System.out.println("long 92칸: " + countWays(92));
>
>         int[] cost = {0, 3, 1, 4, 1, 5, 2};
>         int[] dp = minCostTable(cost);
>         System.out.println("최소 비용 표: " + Arrays.toString(dp));
>         System.out.println("꼭대기까지 최소 비용: " + dp[6]);
>
>         long[][] table = noDoubleTwo(5);
>         System.out.println("2차원 표: " + Arrays.deepToString(table));
>         System.out.println("5칸 방법 수: " + (table[5][0] + table[5][1]));
>
>         memo = new long[46 + 1];
>         Arrays.fill(memo, -1);
>         System.out.println("메모 46칸: " + countWaysMemo(46));
>     }
> }
> ```
>
> ```text
> int 45칸: 1836311903
> int 46칸: -1323752223
> long 46칸: 2971215073
> long 91칸: 7540113804746346429
> long 92칸: -6246583658587674878
> 최소 비용 표: [0, 3, 1, 5, 2, 7, 4]
> 꼭대기까지 최소 비용: 4
> 2차원 표: [[1, 0], [1, 0], [1, 1], [2, 1], [3, 1], [4, 2]]
> 5칸 방법 수: 6
> 메모 46칸: 2971215073
> ```

## DP 표 고르기

그렇다면 문제를 받았을 때 어떤 표를 만들어야 할까요?
상태가 몇 개의 정보로 정해지는지와 답이 얼마나 커지는지를 보고 고릅니다.

| 상황 | 고를 표와 구현 |
| --- | --- |
| 상태가 번호 하나이고 답이 약 21억을 넘지 않습니다 | `int[] dp = new int[n + 1]` |
| 경우의 수처럼 답이 빠르게 커집니다 | `long[]` 또는 칸마다 나머지 구하기 |
| 상태를 구분하는 정보가 두 개입니다 | `new long[n + 1][k]` 같은 2차원 배열 |
| 최솟값을 구하고 갈 수 없는 칸이 있습니다 | `Arrays.fill`로 아주 큰 값을 채운 뒤 시작 |
| 점화식을 재귀로 떠올리기 쉽고 입력이 작습니다 | 재귀 함수와 `-1`로 채운 메모 배열 |
| 입력이 커서 재귀가 깊어집니다 | 같은 점화식을 반복문으로 채우기 |

## 정리

- DP 표의 크기는 가장 큰 상태 번호 + 1로 만들고 0번 칸을 바닥으로 쓰면 번호를 그대로 읽을 수 있습니다.
- `int`는 약 21억에서 넘쳐 음수가 되므로 경우의 수는 `long`을 쓰거나 나머지를 구해 저장합니다.
- 상태에 정보가 두 개 필요하면 2차원 배열을 쓰고 `Arrays.deepToString`으로 확인합니다.
- 메모 배열은 `Arrays.fill(memo, -1)`로 계산 전 표시를 하고 입력이 크면 반복문으로 바꿉니다.

## 이어서 연습하기

[사진 묶음 인쇄 최소 비용](#/coding-tests/java/bridge-dyn-02)에서 한 장 또는 두 장씩 고르는 최소 비용 표를 채워 봅니다.
[동적 계획법 2](#/learn/algorithm/dynamic-programming-advanced)에서 격자 위의 2차원 DP와 선택 복원을 이어서 배웁니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: Math](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html)

## 핵심 질문 답

Java에서 DP 표는 가장 큰 상태 번호 + 1 크기의 배열로 만들고 초기값을 적은 뒤 반복문으로 점화식을 계산 순서대로 적용합니다.
답이 `int` 범위를 넘으면 조용히 음수가 되므로 경우의 수처럼 빠르게 커지는 답은 `long[]`에 담거나 칸마다 나머지를 구합니다.
상태를 구분하는 정보가 두 개면 `new long[n + 1][2]` 같은 2차원 배열을 씁니다.
재귀로 풀 때는 메모 배열을 `Arrays.fill(memo, -1)`로 채워 계산 전 칸을 표시하고 입력이 커서 재귀가 깊어지면 반복문으로 바꿉니다.
