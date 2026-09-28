# 동적 계획법 2: 두 정보로 상태 만들고 선택 복원하기

## 학습 목표

- 행과 열처럼 두 정보가 필요한 문제를 2차원 DP 표로 풀고 이전 선택을 저장해 실제 경로를 복원할 수 있습니다.
- 계산에 필요한 이전 값만 남겨 2차원 표를 한 행짜리 배열로 줄일 수 있습니다.

## 한줄 요약

상태를 구분하는 데 정보가 두 개 필요하면 2차원 표를 만들고 경로가 필요하면 선택한 방향을 함께 저장하며 최종 값만 필요하면 한 행만 남겨 메모리를 줄입니다.

## 먼저 확인할 개념

[동적 계획법: 작은 답을 저장해 큰 답 만들기](#/learn/algorithm/binary-search-and-dynamic-programming) · [Java로 DP 표 채우기](#/learn/algorithm/dp-java) · [시뮬레이션: 규칙을 그대로 코드로 옮기기](#/learn/algorithm/implementation-and-string-simulation)

## 두 정보가 필요한 상태

**2차원 DP**는 상태 하나를 두 개의 번호로 구분해 2차원 표에 답을 저장하는 동적 계획법입니다.
앞 문서에서는 `dp[i]`처럼 계단 번호 하나로 상태를 구분했습니다.
그런데 위치가 행과 열로 정해지는 문제에서는 번호 하나만으로는 어느 칸의 답인지 알 수 없습니다.
그래서 `best[r][c]`처럼 두 번호로 상태를 나타냅니다.

예를 들어 배달 로봇이 비용이 적힌 격자의 왼쪽 위에서 출발해 오른쪽 아래까지 가는 문제를 떠올려 보세요.
로봇은 오른쪽이나 아래로만 한 칸씩 움직이고 지나간 칸의 비용을 모두 더합니다.
이 문서는 이 격자 하나로 끝까지 설명합니다.

![3×3 비용 격자. 첫 행은 1·4·2이고 둘째 행은 2·1·5이고 셋째 행은 3·2·1이다. 왼쪽 위가 출발이고 오른쪽 아래가 도착이다. 오른쪽에는 1행 1열 칸에 위쪽 0행 1열과 왼쪽 1행 0열에서만 화살표가 들어오는 모습이 있다.](content/assets/algorithm/dp-advanced-grid.png)

그림 오른쪽처럼 로봇은 어느 칸이든 위쪽이나 왼쪽에서만 들어옵니다.
오른쪽과 아래로만 움직이기 때문입니다.
이 점이 점화식을 세우는 열쇠가 됩니다.

## 2차원 DP 설계

상태부터 한 문장으로 정합니다.
`best[r][c]`는 **출발부터 `r`행 `c`열까지 오는 최소 누적 비용**입니다.
`r`행 `c`열에 오기 직전은 위쪽 칸이거나 왼쪽 칸이므로 두 칸의 답 중 작은 쪽에 지금 칸의 비용을 더합니다.

```text
best[r][c] = cost[r][c] + min(best[r - 1][c], best[r][c - 1])
```

![왼쪽은 cost 격자이고 가운데는 best 표로 첫 행은 1·5·7이고 둘째 행은 3·4·9이고 셋째 행은 6·6·7이다. best의 1행 1열은 위쪽 5와 왼쪽 3 중 작은 3에 cost 1을 더해 4가 된다. 표는 위 행부터 왼쪽에서 오른쪽으로 채운다.](content/assets/algorithm/dp-advanced-table.png)

초기값과 계산 순서도 그림에서 읽을 수 있습니다.

| 정할 것 | 배달 로봇 예제에서 |
| --- | --- |
| 초기값 | `best[0][0] = cost[0][0]` |
| 첫 행 | 위쪽 칸이 없으므로 왼쪽에서만 옵니다 |
| 첫 열 | 왼쪽 칸이 없으므로 위쪽에서만 옵니다 |
| 계산 순서 | 위 행부터 각 행은 왼쪽에서 오른쪽으로 채웁니다 |

계산 순서가 중요한 이유는 칸을 채울 때 위쪽과 왼쪽 칸이 이미 채워져 있어야 하기 때문입니다.
위 행부터 왼쪽에서 오른쪽으로 채우면 이 조건이 늘 지켜집니다.

## 선택 복원

`best` 표로 최소 비용이 7이라는 것은 알 수 있습니다.
그런데 어느 칸을 지나야 7이 되는지는 표만 보고 바로 알 수 없습니다.
그래서 칸을 채울 때마다 위쪽과 왼쪽 중 어느 쪽을 골랐는지를 `from` 표에 함께 적어 둡니다.
이렇게 저장한 선택을 따라가 실제 답을 만드는 일을 **선택 복원** 또는 **경로 복원**이라고 합니다.

```java
if (r == 0 && c == 0) {
    best[r][c] = cost[r][c];
} else if (r == 0) {
    best[r][c] = best[r][c - 1] + cost[r][c];
    from[r][c] = 'L';
} else if (c == 0) {
    best[r][c] = best[r - 1][c] + cost[r][c];
    from[r][c] = 'U';
} else if (best[r - 1][c] <= best[r][c - 1]) {
    best[r][c] = best[r - 1][c] + cost[r][c];
    from[r][c] = 'U';
} else {
    best[r][c] = best[r][c - 1] + cost[r][c];
    from[r][c] = 'L';
}
```

`U`는 위쪽에서 왔다는 뜻이고 `L`은 왼쪽에서 왔다는 뜻입니다.
위쪽과 왼쪽의 비용이 같으면 위쪽을 고르도록 `<=`를 썼습니다.
어느 쪽을 골라도 최소 비용은 같지만 복원되는 경로는 달라질 수 있습니다.

![best 표의 칸마다 어디서 왔는지 U 또는 L이 적혀 있다. 도착 2행 2열은 L이라 2행 1열로 가고 그 칸은 U라 1행 1열로 가고 그 칸은 L이라 1행 0열로 가고 그 칸은 U라 출발 0행 0열에 닿는다. 지나간 칸은 빨간색이고 비용은 1 더하기 2 더하기 1 더하기 2 더하기 1로 7이다.](content/assets/algorithm/dp-advanced-restore.png)

복원은 도착 칸에서 출발해 `from`을 따라 거꾸로 걷습니다.
`U`면 한 행 위로 가고 `L`이면 한 열 왼쪽으로 가다가 출발 칸에 닿으면 멈춥니다.
이렇게 모은 칸은 도착부터 출발 순서이므로 마지막에 뒤집습니다.

```java
static List<String> restorePath(int n, int m) {
    List<String> path = new ArrayList<>();
    int r = n - 1;
    int c = m - 1;
    while (true) {
        path.add("(" + r + "," + c + ")");
        if (r == 0 && c == 0) break;
        if (from[r][c] == 'U') r--;
        else c--;
    }
    Collections.reverse(path);
    return path;
}
```

그림의 빨간 칸을 보고 출력될 경로를 먼저 적어 보세요.

```text
best 표: [[1, 5, 7], [3, 4, 9], [6, 6, 7]]
최소 비용: 7
경로: [(0,0), (1,0), (1,1), (2,1), (2,2)]
```

도착 칸에서 거꾸로 따라가는 이유는 `from`의 각 칸에 그 칸까지 가장 싸게 오는 직전 칸이 적혀 있기 때문입니다.
출발에서 앞으로 가며 매번 싼 칸을 고르면 당장은 싸도 나중에 비싼 칸을 만날 수 있습니다.
반면 `from`은 끝까지 계산한 최적의 답에서 나온 선택이라서 거꾸로 따라가면 항상 최소 비용 경로가 나옵니다.

## 한 행만 남기기

경로 없이 최소 비용만 필요할 때도 있습니다.
이때는 표 전체를 들고 있을 필요가 없습니다.
칸 하나를 채우는 데 필요한 값은 바로 위쪽과 바로 왼쪽뿐이기 때문입니다.

그래서 한 행 크기의 배열 `row` 하나를 두고 행마다 왼쪽에서 오른쪽으로 덮어씁니다.
이렇게 이전 행 자리에 다음 행을 덮어써 메모리를 줄이는 방법을 흔히 **롤링 배열**이라고 부릅니다.

![배열 한 줄 row를 행마다 덮어쓰는 그림. 0행 뒤에는 1·5·7이고 1행 뒤에는 3·4·9이고 2행 뒤에는 6·6·7이다. 오른쪽은 1행 1열을 계산하는 순간으로 row의 0번 칸은 이미 이번 행의 새 값 3이고 1번 칸은 아직 이전 행의 옛 값 5이다. 둘 중 작은 3에 1을 더한 4를 1번 칸에 덮어쓴다.](content/assets/algorithm/dp-advanced-one-row.png)

그림 오른쪽처럼 `row[c]`를 덮어쓰기 직전에는 `row[c]`에 이전 행의 값이 남아 있습니다.
이것이 위쪽 값입니다.
그리고 `row[c - 1]`은 방금 이번 행의 값으로 바뀌었으므로 왼쪽 값입니다.

```java
static int oneRowCost(int[][] cost) {
    int m = cost[0].length;
    int[] row = new int[m];
    for (int r = 0; r < cost.length; r++) {
        for (int c = 0; c < m; c++) {
            if (r == 0 && c == 0) row[c] = cost[r][c];
            else if (r == 0) row[c] = row[c - 1] + cost[r][c];
            else if (c == 0) row[c] = row[c] + cost[r][c];
            else row[c] = Math.min(row[c], row[c - 1]) + cost[r][c];
        }
        System.out.println(r + "행 뒤 row: " + Arrays.toString(row));
    }
    return row[m - 1];
}
```

행이 끝날 때마다 `row`가 `best` 표의 그 행과 같아지는지 확인해 보세요.

```text
0행 뒤 row: [1, 5, 7]
1행 뒤 row: [3, 4, 9]
2행 뒤 row: [6, 6, 7]
한 행으로 구한 비용: 7
```

`best` 표의 세 행과 똑같이 바뀌고 최종 비용도 7입니다.
두 방법 모두 칸을 한 번씩 채우므로 시간은 `O(n × m)`입니다.
반면 메모리는 표 전체가 `O(n × m)`이고 한 행만 남기면 `O(m)`입니다.

다만 한 행만 남기면 이전 행의 선택이 사라져 경로를 복원할 수 없습니다.
그래서 메모리를 줄이기 전에 최종 값만 필요한지 경로도 필요한지 먼저 정합니다.
또 계산 순서를 오른쪽에서 왼쪽으로 바꾸면 `row[c - 1]`에 아직 이전 행의 값이 남아 있어 전혀 다른 식을 계산하게 됩니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `DeliveryRoute.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.Collections;
> import java.util.List;
>
> public class DeliveryRoute {
>     static int[][] best;
>     static char[][] from;
>
>     static void fillTable(int[][] cost) {
>         int n = cost.length;
>         int m = cost[0].length;
>         best = new int[n][m];
>         from = new char[n][m];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 if (r == 0 && c == 0) {
>                     best[r][c] = cost[r][c];
>                 } else if (r == 0) {
>                     best[r][c] = best[r][c - 1] + cost[r][c];
>                     from[r][c] = 'L';
>                 } else if (c == 0) {
>                     best[r][c] = best[r - 1][c] + cost[r][c];
>                     from[r][c] = 'U';
>                 } else if (best[r - 1][c] <= best[r][c - 1]) {
>                     best[r][c] = best[r - 1][c] + cost[r][c];
>                     from[r][c] = 'U';
>                 } else {
>                     best[r][c] = best[r][c - 1] + cost[r][c];
>                     from[r][c] = 'L';
>                 }
>             }
>         }
>     }
>
>     static List<String> restorePath(int n, int m) {
>         List<String> path = new ArrayList<>();
>         int r = n - 1;
>         int c = m - 1;
>         while (true) {
>             path.add("(" + r + "," + c + ")");
>             if (r == 0 && c == 0) break;
>             if (from[r][c] == 'U') r--;
>             else c--;
>         }
>         Collections.reverse(path);
>         return path;
>     }
>
>     static int oneRowCost(int[][] cost) {
>         int m = cost[0].length;
>         int[] row = new int[m];
>         for (int r = 0; r < cost.length; r++) {
>             for (int c = 0; c < m; c++) {
>                 if (r == 0 && c == 0) row[c] = cost[r][c];
>                 else if (r == 0) row[c] = row[c - 1] + cost[r][c];
>                 else if (c == 0) row[c] = row[c] + cost[r][c];
>                 else row[c] = Math.min(row[c], row[c - 1]) + cost[r][c];
>             }
>             System.out.println(r + "행 뒤 row: " + Arrays.toString(row));
>         }
>         return row[m - 1];
>     }
>
>     public static void main(String[] args) {
>         int[][] cost = {
>             {1, 4, 2},
>             {2, 1, 5},
>             {3, 2, 1}
>         };
>
>         fillTable(cost);
>         System.out.println("best 표: " + Arrays.deepToString(best));
>         System.out.println("최소 비용: " + best[2][2]);
>         System.out.println("경로: " + restorePath(3, 3));
>         System.out.println("한 행으로 구한 비용: " + oneRowCost(cost));
>     }
> }
> ```
>
> ```text
> best 표: [[1, 5, 7], [3, 4, 9], [6, 6, 7]]
> 최소 비용: 7
> 경로: [(0,0), (1,0), (1,1), (2,1), (2,2)]
> 0행 뒤 row: [1, 5, 7]
> 1행 뒤 row: [3, 4, 9]
> 2행 뒤 row: [6, 6, 7]
> 한 행으로 구한 비용: 7
> ```

## 코딩테스트 적용

2차원 DP는 격자 밖에서도 자주 나옵니다.
표의 두 번호가 무엇을 뜻하는지만 바뀔 뿐 설계 순서는 이 문서와 같습니다.

| 문제 유형 | 상태 `dp[a][b]`의 뜻 | 직전 상태 |
| --- | --- | --- |
| 격자 최소 비용 | `a`행 `b`열까지의 최소 비용 | 위쪽 칸 · 왼쪽 칸 |
| 장애물이 있는 격자 경로 수 | `a`행 `b`열까지 오는 경로 수 | 위쪽 칸 · 왼쪽 칸 · 장애물 칸은 0 |
| 배낭 문제 | 물건 `a`개까지 보고 무게 `b` 이하로 담은 최대 가치 | 물건 `a`를 담지 않은 상태 · 담은 상태 |
| 두 문자열 비교 | 앞 문자열 `a`글자와 뒤 문자열 `b`글자까지의 답 | 한 글자씩 줄인 상태 |
| 단계별 선택 | `a`단계에서 `b`번을 골랐을 때의 최고 점수 | 앞 단계에서 이어질 수 있는 선택들 |

문제를 풀 때는 아래 순서로 정리하면 흔들리지 않습니다.

1. 상태를 두 번호로 한 문장에 적습니다.
2. 지금 칸에 오기 직전의 상태를 모두 적어 점화식을 세웁니다.
3. 직전 상태가 없는 첫 행·첫 열이나 갈 수 없는 칸의 값을 정합니다.
4. 직전 상태가 먼저 채워지는 계산 순서를 정합니다.
5. 답만 필요한지 선택 과정도 필요한지 보고 `from` 표를 둘지 한 행만 남길지 정합니다.

## 정리

- 상태를 구분하는 데 정보가 두 개 필요하면 `best[r][c]` 같은 2차원 표를 만듭니다.
- 직전 상태가 먼저 채워지도록 위 행부터 왼쪽에서 오른쪽으로 계산합니다.
- 선택한 방향을 `from` 표에 저장하면 도착에서 거꾸로 따라가 실제 경로를 복원할 수 있습니다.
- 최종 값만 필요하면 한 행짜리 배열을 덮어써서 메모리를 `O(m)`으로 줄이지만 경로는 복원할 수 없습니다.

## 이어서 연습하기

[장애물을 피해 가는 배송 경로 수](#/coding-tests/java/bridge-dyn-03)에서 장애물 칸을 0으로 두고 경로 수 표를 채워 봅니다.
[마지막 조립 부품 고르기](#/coding-tests/java/bridge-dyn-04)에서 단계와 선택 두 정보로 상태를 만들어 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)
- [Java 25 API: Collections](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html)

## 핵심 질문 답

행과 열처럼 상태를 구분하는 정보가 두 개면 두 정보를 인덱스로 쓰는 2차원 표를 만들고 한 칸의 뜻을 한 문장으로 정합니다.
직전 상태인 위쪽과 왼쪽 중 작은 값에 지금 비용을 더하는 점화식을 세우고 첫 행·첫 열을 따로 처리한 뒤 위 행부터 왼쪽에서 오른쪽으로 채웁니다.
실제 경로가 필요하면 칸마다 고른 방향을 `from` 표에 저장해 도착에서 거꾸로 따라간 뒤 뒤집습니다.
최종 값만 필요하면 한 행짜리 배열을 왼쪽에서 오른쪽으로 덮어써 메모리를 줄입니다.
