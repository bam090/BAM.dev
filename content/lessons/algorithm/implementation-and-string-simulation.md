# 시뮬레이션: 규칙을 그대로 코드로 옮기기

## 학습 목표

- 시뮬레이션 문제를 상태·규칙·순서로 나누어 코드로 옮길 수 있습니다.
- 격자에서 행렬 곱셈·방향 벡터 이동·대칭과 회전의 인덱스 변환을 계산할 수 있습니다.

## 한줄 요약

시뮬레이션은 문제에 적힌 규칙을 순서대로 적용해 상태를 바꿔 가는 풀이이고 격자 문제에서는 행렬 연산·좌표 연산·대칭과 회전 연산이 기본 도구입니다.

## 먼저 확인할 개념

[배열](#/learn/algorithm/array) · [그래프와 BFS·DFS](#/learn/algorithm/bfs-dfs-graph-grid) · [배열의 원소와 경계](#/learn/java/wiki-arrays)

## 시뮬레이션이란

**시뮬레이션**은 문제에 적힌 규칙을 한 단계씩 그대로 따라 하면서 상태가 어떻게 바뀌는지 계산하는 풀이입니다.
정렬이나 동적 계획법처럼 이름 붙은 기법을 쓰기보다 설명을 빠짐없이 코드로 옮기는 힘을 봅니다.
그래서 코딩테스트에서는 **구현 문제**라고도 부릅니다.

여기서 **상태**는 지금 이 순간을 설명하는 값의 모음입니다.
판 위의 숫자·로봇의 위치·로봇이 보는 방향이 모두 상태입니다.
**규칙**은 상태를 다음 상태로 바꾸는 방법이고 **순서**는 규칙을 적용하는 차례입니다.

예를 들어 1부터 9까지 적힌 3×3 판 위를 로봇이 돌아다니고 판 자체를 돌리거나 뒤집는 문제를 떠올려 보세요.
이 문서는 아래 판 하나를 처음부터 끝까지 사용합니다.

![1부터 9까지 적힌 3×3 판. 칸마다 행 번호와 열 번호로 된 좌표가 적혀 있고 아래로 갈수록 행 번호가 오른쪽으로 갈수록 열 번호가 커진다. 오른쪽에는 0행 2열은 3이고 1행 1열은 5이고 2행 0열은 7이라고 적혀 있다.](content/assets/algorithm/simulation-board.png)

Java에서는 이 판을 2차원 배열 `board`로 담고 `board[r][c]`로 `r`행 `c`열의 값을 읽습니다.
수학의 x·y 좌표와 달리 행 번호가 먼저 오고 행 번호는 아래로 갈수록 커집니다.
이 순서를 헷갈리면 로봇이 엉뚱한 방향으로 움직이기 때문에 가장 먼저 익혀 둡니다.

## 시뮬레이션 문제 나누기

시뮬레이션 문제는 설명이 길어서 읽다 보면 규칙 하나를 빠뜨리기 쉽습니다.
그래서 코드를 쓰기 전에 설명을 세 부분으로 나누어 적어 둡니다.

| 나눌 부분 | 스스로에게 묻는 질문 | 로봇 예제에서 |
| --- | --- | --- |
| 상태 | 지금 무엇을 기억해야 하나요 | 판 · 로봇의 행과 열 · 바라보는 방향 · 이미 지난 칸 |
| 규칙 | 한 단계에서 상태가 어떻게 바뀌나요 | 앞으로 한 칸 가고 벽이나 지난 칸을 만나면 오른쪽으로 돕니다 |
| 순서 | 무엇을 먼저 하고 언제 멈추나요 | 칸을 기록한 뒤 이동하고 모든 칸을 기록하면 멈춥니다 |

이렇게 적어 두면 상태는 변수가 되고 규칙은 반복문 안의 코드가 되고 순서는 반복문의 모양이 됩니다.
규칙이 복잡해 보여도 결국 한 단계를 정확히 구현한 뒤 그 단계를 여러 번 반복하는 구조입니다.

## 시뮬레이션의 종류

격자를 다루는 시뮬레이션 문제에는 자주 쓰이는 연산이 세 가지 있습니다.

| 종류 | 하는 일 | 예 |
| --- | --- | --- |
| 행렬 연산 | 2차원 배열끼리 더하거나 곱합니다 | 두 판을 합치기·행렬 곱셈 |
| 좌표 연산 | 방향에 따라 행과 열 번호를 바꿉니다 | 로봇 이동·달팽이 모양으로 채우기 |
| 대칭·회전 연산 | 판 전체를 뒤집거나 돌립니다 | 거울에 비친 판·90도 돌린 판 |

세 연산 모두 행 번호와 열 번호를 어떻게 계산하느냐가 핵심입니다.
하나씩 같은 판으로 살펴보겠습니다.

## 행렬 연산

**행렬**은 숫자를 행과 열로 늘어놓은 표이고 Java에서는 2차원 배열로 담습니다.
행렬 덧셈은 같은 위치의 값끼리 더하면 되므로 두 겹 반복문 하나로 끝납니다.
반면 행렬 곱셈은 계산하는 방법이 조금 다릅니다.

![board에 board를 곱하는 그림. 앞 행렬의 0행 1·2·3과 뒤 행렬의 0열 1·4·7을 같은 순서끼리 곱해 더하면 1 더하기 8 더하기 21로 30이 되고 이 값이 결과 행렬의 0행 0열에 들어간다.](content/assets/algorithm/simulation-matrix-multiply.png)

결과의 `r`행 `c`열은 앞 행렬의 `r`행과 뒤 행렬의 `c`열을 같은 순서끼리 곱해 더한 값입니다.
그래서 칸 하나를 채우는 데 반복이 한 번 더 필요하고 반복문이 세 겹이 됩니다.

```java
static int[][] multiply(int[][] a, int[][] b) {
    int n = a.length;
    int m = b[0].length;
    int[][] result = new int[n][m];
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < m; c++) {
            for (int k = 0; k < b.length; k++) {
                result[r][c] += a[r][k] * b[k][c];
            }
        }
    }
    return result;
}
```

그림에서 0행 0열은 30이었습니다.
0행 1열은 앞 행렬의 0행과 뒤 행렬의 1열인 2·5·8을 곱해 더한 값입니다.
실행하기 전에 0행 1열의 값을 먼저 계산해 보세요.

```text
곱셈: [[30, 36, 42], [66, 81, 96], [102, 126, 150]]
```

0행 1열은 1×2 + 2×5 + 3×8 = 36입니다.
가장 안쪽 반복의 `k`가 앞 행렬에서는 열 번호로 쓰이고 뒤 행렬에서는 행 번호로 쓰이는 점이 핵심입니다.
그래서 앞 행렬의 열 수와 뒤 행렬의 행 수가 같아야 곱셈을 할 수 있습니다.

행렬 연산 중에는 행과 열을 맞바꾸는 **전치**도 있습니다.
전치는 `result[c][r] = board[r][c]`로 만들고 3×3 판을 전치하면 원래 0열의 1·4·7이 0행이 됩니다.
전치는 뒤에서 회전을 설명할 때 다시 씁니다.

## 좌표 연산

**좌표 연산**은 현재 칸의 행·열 번호에 방향만큼의 변화를 더해 다음 칸을 구하는 계산입니다.
위·아래·왼쪽·오른쪽 네 방향을 `if` 문 네 개로 나누어 쓰면 코드가 길어지고 실수도 늘어납니다.
그래서 방향마다 행과 열이 얼마나 변하는지를 배열에 미리 적어 두는데 이것을 **방향 벡터**라고 합니다.

![왼쪽은 가운데 칸에서 네 방향으로 뻗은 화살표. 0번 위는 행 변화 -1과 열 변화 0이고 1번 오른쪽은 0과 1이고 2번 아래는 1과 0이고 3번 왼쪽은 0과 -1이다. 오른쪽은 3×3 판에서 1에서 출발해 벽이나 지난 칸을 만날 때마다 오른쪽으로 돌아 1·2·3·6·9·8·7·4·5 순서로 방문하는 나선 경로](content/assets/algorithm/simulation-direction.png)

방향을 위·오른쪽·아래·왼쪽 순서로 번호 매기면 시계 방향으로 한 바퀴 도는 순서가 됩니다.
그래서 오른쪽으로 도는 일은 방향 번호에 1을 더하는 것으로 끝납니다.
3번 왼쪽에서 한 번 더 돌면 0번 위로 돌아와야 하므로 `% 4`로 나머지를 구합니다.

```java
// 위·오른쪽·아래·왼쪽
static final int[] DR = {-1, 0, 1, 0};
static final int[] DC = {0, 1, 0, -1};
```

이제 그림 오른쪽의 로봇을 코드로 옮겨 보겠습니다.
로봇은 0행 0열에서 오른쪽을 보고 출발하고 앞 칸이 판 밖이거나 이미 지난 칸이면 오른쪽으로 돕니다.

```java
static List<Integer> spiral(int[][] board) {
    int n = board.length;
    int m = board[0].length;
    boolean[][] visited = new boolean[n][m];
    List<Integer> order = new ArrayList<>();
    int r = 0;
    int c = 0;
    int dir = 1;
    for (int step = 0; step < n * m; step++) {
        order.add(board[r][c]);
        visited[r][c] = true;
        int nr = r + DR[dir];
        int nc = c + DC[dir];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m || visited[nr][nc]) {
            dir = (dir + 1) % 4;
            nr = r + DR[dir];
            nc = c + DC[dir];
        }
        r = nr;
        c = nc;
    }
    return order;
}
```

앞에서 나눈 상태·규칙·순서가 코드에 그대로 보입니다.
상태는 `r`·`c`·`dir`·`visited`이고 규칙은 `if` 문이며 순서는 칸을 기록한 뒤 움직이는 반복문입니다.
로봇이 3에 도착했을 때 방향 번호가 몇으로 바뀔지 예상해 보세요.

```text
나선: [1, 2, 3, 6, 9, 8, 7, 4, 5]
```

3의 오른쪽은 판 밖이라서 방향이 1번 오른쪽에서 2번 아래로 바뀝니다.
4에서는 위의 1이 이미 지난 칸이라서 다시 오른쪽으로 돌아 마지막 칸인 5로 들어갑니다.

여기서 조건을 검사하는 순서가 중요합니다.
`nr < 0 || nr >= n`처럼 판 밖인지 먼저 확인하고 나서 `visited[nr][nc]`를 읽어야 합니다.
순서를 바꾸면 판 밖의 칸을 읽으려다 `ArrayIndexOutOfBoundsException`이 나기 때문입니다.
`||`는 앞 조건이 참이면 뒤 조건을 계산하지 않으므로 이 순서만 지키면 안전합니다.

## 대칭·회전 연산

**대칭**은 판을 거울에 비추듯 뒤집는 연산이고 **회전**은 판을 90도씩 돌리는 연산입니다.
두 연산 모두 새 판을 하나 만들고 옛 칸의 값을 새 위치에 옮겨 적는 방식으로 구현합니다.
판 안에서 값을 바로 바꾸면 아직 옮기지 않은 값을 덮어쓸 수 있기 때문입니다.

![원래 판과 좌우 대칭·상하 대칭·시계 방향 90도 회전한 판을 나란히 놓은 그림. 원래 0행의 1·2·3을 주황색으로 칠해 좌우 대칭에서는 3·2·1로 뒤집히고 상하 대칭에서는 맨 아래 행으로 가고 회전에서는 마지막 열로 옮겨 간 모습을 보여 준다. 판마다 옛 칸이 옮겨 갈 새 위치의 인덱스 식이 적혀 있다.](content/assets/algorithm/simulation-flip-rotate.png)

그림 아래의 식을 표로 옮기면 다음과 같습니다.
`n`은 행 수이고 `m`은 열 수입니다.

| 연산 | 옛 칸 `board[r][c]`가 가는 곳 | 새 판의 크기 |
| --- | --- | --- |
| 좌우 대칭 | `result[r][m - 1 - c]` | `n × m` |
| 상하 대칭 | `result[n - 1 - r][c]` | `n × m` |
| 시계 방향 90도 회전 | `result[c][n - 1 - r]` | `m × n` |

좌우 대칭은 행은 그대로 두고 열 번호만 끝에서부터 셉니다.
그래서 0열의 1은 2열로 가고 2열의 3은 0열로 옵니다.
상하 대칭은 반대로 열은 그대로 두고 행 번호만 끝에서부터 셉니다.

회전은 조금 더 생각해야 합니다.
시계 방향으로 돌리면 원래 0행이 맨 오른쪽 열이 되고 원래 0열이 맨 위 행이 됩니다.
즉 옛 행 번호 `r`은 새 열 번호 `n - 1 - r`이 되고 옛 열 번호 `c`는 새 행 번호가 됩니다.

```java
static int[][] rotateRight(int[][] board) {
    int n = board.length;
    int m = board[0].length;
    int[][] result = new int[m][n];
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < m; c++) {
            result[c][n - 1 - r] = board[r][c];
        }
    }
    return result;
}
```

원래 판의 2행 0열에 있는 7이 회전한 판의 어디로 갈지 식에 넣어 먼저 계산해 보세요.

```text
회전: [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
```

`r = 2`이고 `c = 0`이므로 7은 `result[0][0]`으로 갑니다.
결과에서도 7이 맨 왼쪽 위에 있습니다.
새 판을 `new int[m][n]`으로 만든 이유는 직사각형 판을 돌리면 행 수와 열 수가 서로 바뀌기 때문입니다.

회전은 앞에서 본 전치와 좌우 대칭을 차례로 적용한 것과 같습니다.
전치해서 0행이 1·4·7이 된 판을 좌우로 뒤집으면 0행이 7·4·1이 되어 회전 결과와 똑같아집니다.
180도 회전은 90도 회전을 두 번 하면 되고 반시계 방향 90도 회전은 세 번 하면 됩니다.

> [!question]- 반시계 방향으로 한 번에 돌리려면?
> 반시계 방향 90도 회전에서는 옛 칸 `board[r][c]`가 `result[m - 1 - c][r]`로 갑니다.
> 원래 0행이 맨 왼쪽 열이 되고 원래 마지막 열이 맨 위 행이 되기 때문입니다.
> 식이 헷갈리면 시계 방향 회전을 세 번 해도 같은 결과가 나옵니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `SimulationBoard.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.List;
>
> public class SimulationBoard {
>     static int[][] multiply(int[][] a, int[][] b) {
>         int n = a.length;
>         int m = b[0].length;
>         int[][] result = new int[n][m];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 for (int k = 0; k < b.length; k++) {
>                     result[r][c] += a[r][k] * b[k][c];
>                 }
>             }
>         }
>         return result;
>     }
>
>     static int[][] transpose(int[][] board) {
>         int n = board.length;
>         int m = board[0].length;
>         int[][] result = new int[m][n];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 result[c][r] = board[r][c];
>             }
>         }
>         return result;
>     }
>
>     // 위·오른쪽·아래·왼쪽
>     static final int[] DR = {-1, 0, 1, 0};
>     static final int[] DC = {0, 1, 0, -1};
>
>     static List<Integer> spiral(int[][] board) {
>         int n = board.length;
>         int m = board[0].length;
>         boolean[][] visited = new boolean[n][m];
>         List<Integer> order = new ArrayList<>();
>         int r = 0;
>         int c = 0;
>         int dir = 1;
>         for (int step = 0; step < n * m; step++) {
>             order.add(board[r][c]);
>             visited[r][c] = true;
>             int nr = r + DR[dir];
>             int nc = c + DC[dir];
>             if (nr < 0 || nr >= n || nc < 0 || nc >= m || visited[nr][nc]) {
>                 dir = (dir + 1) % 4;
>                 nr = r + DR[dir];
>                 nc = c + DC[dir];
>             }
>             r = nr;
>             c = nc;
>         }
>         return order;
>     }
>
>     static int[][] flipLeftRight(int[][] board) {
>         int n = board.length;
>         int m = board[0].length;
>         int[][] result = new int[n][m];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 result[r][m - 1 - c] = board[r][c];
>             }
>         }
>         return result;
>     }
>
>     static int[][] flipUpDown(int[][] board) {
>         int n = board.length;
>         int m = board[0].length;
>         int[][] result = new int[n][m];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 result[n - 1 - r][c] = board[r][c];
>             }
>         }
>         return result;
>     }
>
>     static int[][] rotateRight(int[][] board) {
>         int n = board.length;
>         int m = board[0].length;
>         int[][] result = new int[m][n];
>         for (int r = 0; r < n; r++) {
>             for (int c = 0; c < m; c++) {
>                 result[c][n - 1 - r] = board[r][c];
>             }
>         }
>         return result;
>     }
>
>     public static void main(String[] args) {
>         int[][] board = {
>             {1, 2, 3},
>             {4, 5, 6},
>             {7, 8, 9}
>         };
>
>         System.out.println("곱셈: " + Arrays.deepToString(multiply(board, board)));
>         System.out.println("전치: " + Arrays.deepToString(transpose(board)));
>         System.out.println("나선: " + spiral(board));
>         System.out.println("좌우: " + Arrays.deepToString(flipLeftRight(board)));
>         System.out.println("상하: " + Arrays.deepToString(flipUpDown(board)));
>         System.out.println("회전: " + Arrays.deepToString(rotateRight(board)));
>         System.out.println("전치 후 좌우: " + Arrays.deepToString(flipLeftRight(transpose(board))));
>     }
> }
> ```
>
> ```text
> 곱셈: [[30, 36, 42], [66, 81, 96], [102, 126, 150]]
> 전치: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
> 나선: [1, 2, 3, 6, 9, 8, 7, 4, 5]
> 좌우: [[3, 2, 1], [6, 5, 4], [9, 8, 7]]
> 상하: [[7, 8, 9], [4, 5, 6], [1, 2, 3]]
> 회전: [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
> 전치 후 좌우: [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
> ```

## 시뮬레이션의 활용

그렇다면 처음 보는 시뮬레이션 문제는 어떻게 시작하면 좋을까요?
설명을 코드로 옮기기 전에 아래 순서로 준비하면 규칙을 빠뜨리는 일이 줄어듭니다.

1. 설명을 상태·규칙·순서로 나누어 적습니다.
2. 격자라면 행과 열의 방향을 확인하고 방향 벡터의 순서를 정합니다.
3. 판을 뒤집거나 돌리는 규칙은 새 판에 옮겨 적는 인덱스 식으로 바꿉니다.
4. 입력 예제를 손으로 몇 단계 따라가 본 뒤 코드의 중간 상태와 비교합니다.

시뮬레이션은 풀이 방법이 문제에 이미 적혀 있어서 시간 복잡도보다 정확성이 먼저 문제가 됩니다.
다만 반복 횟수가 아주 크다면 같은 상태가 다시 나오는 주기를 찾는 등 계산을 줄일 방법을 함께 고민합니다.
입력이 문자열로 주어지는 시뮬레이션은 [문자열 시뮬레이션](#/learn/algorithm/string-simulation)에서 Java 문자열 도구와 함께 알아봅니다.

## 정리

- 시뮬레이션은 문제의 규칙을 한 단계씩 따라 하며 상태를 바꾸는 풀이이고 먼저 상태·규칙·순서로 나눕니다.
- 행렬 곱셈의 `r`행 `c`열은 앞 행렬의 `r`행과 뒤 행렬의 `c`열을 곱해 더한 값입니다.
- 방향 벡터 `DR`·`DC`를 시계 방향 순서로 두면 오른쪽으로 돌기가 `(dir + 1) % 4` 한 줄이 됩니다.
- 대칭과 회전은 새 판을 만들고 옛 칸 `board[r][c]`가 갈 새 위치를 인덱스 식으로 계산합니다.

## 이어서 연습하기

[문자열 시뮬레이션](#/learn/algorithm/string-simulation)에서 명령 문자열을 읽어 순서대로 적용해 봅니다.
[전광판 줄 밀기](#/coding-tests/java/bridge-sim-02)에서 2차원 배열의 행을 규칙대로 옮겨 봅니다.
[겹별 테두리 합](#/coding-tests/java/bridge-sim-03)에서 격자의 바깥 겹부터 안쪽 겹까지 좌표를 따라가 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

## 핵심 질문 답

시뮬레이션 문제는 설명을 상태·규칙·순서로 나눈 뒤 한 단계를 정확히 구현하고 그 단계를 반복해서 풉니다.
격자에서는 `board[r][c]`처럼 행을 먼저 쓰고 행렬 곱셈은 앞 행렬의 행과 뒤 행렬의 열을 곱해 더합니다.
이동은 방향 벡터에 방향 번호를 붙여 다음 칸을 계산하고 판 밖인지 먼저 확인한 뒤 칸을 읽습니다.
대칭과 회전은 새 판에 옛 칸이 갈 위치를 `result[c][n - 1 - r]` 같은 인덱스 식으로 옮겨 적습니다.
