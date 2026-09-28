# 투 포인터와 슬라이딩 윈도우: 배열을 한 번에 훑기

## 학습 목표

- 정렬된 배열에서 투 포인터로 두 값의 합을 찾고 `O(n²)`이 `O(n)`으로 줄어드는 이유를 설명할 수 있습니다.
- 연속 구간 문제에서 길이가 고정된 윈도우와 길이가 바뀌는 윈도우를 구분해 구현할 수 있습니다.

## 한줄 요약

투 포인터는 정렬된 배열의 양 끝에서 답이 될 수 없는 쪽을 버리며 좁혀 가고 슬라이딩 윈도우는 연속 구간을 밀며 빠지는 값과 들어오는 값만 반영해서 둘 다 배열을 `O(n)`에 훑습니다.

## 먼저 확인할 개념

[배열: 번호로 바로 꺼내는 자료구조](#/learn/algorithm/array) · [ArrayList와 LinkedList: 같은 목록을 만드는 두 방법](#/learn/algorithm/list-and-conditions) · [코드에서 시간 복잡도 계산하기](#/learn/algorithm/time-complexity-in-code)

## 투 포인터란

**투 포인터**는 배열 위의 두 인덱스를 조건에 따라 한 방향으로만 움직이며 답을 찾는 방법입니다.
앞 문서들에서는 배열과 목록을 처음부터 끝까지 한 번 훑는 반복을 봤습니다.
그런데 두 값의 짝을 찾는 문제는 보통 반복문 안에 반복문을 넣게 되고 입력이 크면 시간 안에 끝나지 않습니다.
투 포인터는 이 두 겹 반복을 한 겹으로 줄이는 방법입니다.

여기서 **포인터**는 배열의 어느 칸을 가리키고 있는지 나타내는 인덱스 변수를 말합니다.
이 문서에서는 왼쪽 끝을 가리키는 `left`와 오른쪽 끝을 가리키는 `right` 두 개를 씁니다.

예를 들어 일주일 동안 공부한 시간을 분 단위로 적은 기록이 있다고 해 보겠습니다.
이 문서는 이 기록 하나로 끝까지 설명합니다.

```java
int[] minutes = {20, 60, 10, 50, 35, 80, 0};  // 월 화 수 목 금 토 일
```

첫 번째 질문은 "합이 정확히 85분이 되는 두 날의 공부 시간은?"입니다.
가장 먼저 떠오르는 방법은 반복문 두 겹으로 가능한 두 날의 짝을 모두 확인하는 것입니다.
이 방법은 값이 `n`개일 때 짝을 최대 `n(n - 1) / 2`개 확인하므로 `O(n²)`입니다.
이제 투 포인터로 같은 답을 더 적게 확인해 찾아보겠습니다.

## 투 포인터로 두 값의 합 찾기

투 포인터를 쓰려면 먼저 배열을 정렬해야 합니다.
두 날의 공부 시간 합만 궁금하니 날짜 순서가 바뀌어도 상관없습니다.
정렬하면 `[0, 10, 20, 35, 50, 60, 80]`이 됩니다.

`left`는 가장 작은 값에서 출발하고 `right`는 가장 큰 값에서 출발합니다.
그다음 두 값의 합을 목표와 비교해 한쪽을 한 칸 옮깁니다.

- 합이 목표보다 작으면 `left`를 오른쪽으로 옮겨 합을 키웁니다.
- 합이 목표보다 크면 `right`를 왼쪽으로 옮겨 합을 줄입니다.
- 합이 목표와 같으면 답을 찾은 것입니다.

![정렬한 기록 0·10·20·35·50·60·80에서 합이 85인 두 값을 찾는 여섯 단계. 1단계 0과 80의 합 80이 작아 left를 옮기고 2단계 10과 80의 합 90이 커 right를 옮긴다. 3단계 10과 60은 70 · 4단계 20과 60은 80이라 left를 옮기고 5단계 35와 60은 95라 right를 옮긴다. 6단계 35와 50의 합이 85로 답을 찾는다. 지나간 값은 회색으로 버려진다.](content/assets/algorithm/twp-pair-trace.png)

그림의 회색 칸은 한 번 지나가면 다시 보지 않습니다.
1단계에서 `0 + 80 = 80`은 85보다 작습니다.
`0`과 짝지을 수 있는 가장 큰 값인 `80`과 더해도 모자라니 `0`은 어떤 값과 짝지어도 답이 될 수 없습니다.
그래서 `0`을 버리고 `left`를 옮깁니다.

2단계의 `10 + 80 = 90`은 반대로 85보다 큽니다.
`80`과 짝지을 수 있는 가장 작은 값인 `10`과 더해도 넘치니 이번에는 `80`을 버리고 `right`를 옮깁니다.
정렬되어 있기 때문에 이렇게 한쪽을 통째로 버려도 답을 놓치지 않습니다.

```java
static int[] pairByTwoPointers(int[] sorted, int target) {
    int left = 0;
    int right = sorted.length - 1;
    while (left < right) {
        int sum = sorted[left] + sorted[right];
        if (sum == target) return new int[] {sorted[left], sorted[right]};
        if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return new int[0];
}
```

모든 짝을 확인하는 방법과 투 포인터가 각각 몇 번 비교할지 예상해 보세요.
전체 코드에서는 비교할 때마다 횟수를 세도록 했습니다.

```text
정렬한 기록: [0, 10, 20, 35, 50, 60, 80]
모든 쌍 확인: [35, 50] | 비교 16번
투 포인터: [35, 50] | 비교 6번
```

두 방법 모두 `35`와 `50`을 찾았지만 투 포인터는 그림의 여섯 단계만큼만 비교했습니다.
`while (left < right)`는 두 포인터가 만나면 멈추게 해서 같은 날을 두 번 고르지 않게 하고 답이 없으면 빈 배열을 돌려주게 합니다.

## 투 포인터가 O(n)인 이유

7개 값으로 만들 수 있는 짝은 모두 21개입니다.
그 21개를 표로 펼치면 투 포인터가 무엇을 버리는지 한눈에 보입니다.

![행은 left 값 0부터 60까지이고 열은 right 값 10부터 80까지인 표에 두 값의 합 21개가 적혀 있다. 투 포인터는 오른쪽 위 80에서 출발해 90·70·80·95를 거쳐 85에 닿기까지 여섯 칸만 확인하고 나머지 칸은 회색으로 남는다.](content/assets/algorithm/twp-pair-grid.png)

표에서 아래로 한 칸 가면 `left`가 커지고 왼쪽으로 한 칸 가면 `right`가 작아집니다.
합이 목표보다 작아 `left`를 옮기면 그 행에 남은 칸을 모두 버리는 셈입니다.
합이 목표보다 커서 `right`를 옮기면 그 열에 남은 칸을 모두 버리는 셈입니다.

그래서 한 번 비교할 때마다 행 하나나 열 하나가 통째로 사라집니다.
두 포인터는 한 방향으로만 움직이고 합쳐서 최대 `n - 1`번 움직이면 만나므로 투 포인터는 `O(n)`입니다.
값이 10만 개라면 모든 짝은 약 50억 개이지만 투 포인터는 10만 번 안쪽에서 끝납니다.
정렬에 드는 `O(n log n)`을 더해도 `O(n²)`보다 훨씬 빠릅니다.

이번에는 두 값의 짝이 아니라 연속된 여러 날을 묻는 질문으로 넘어가 보겠습니다.

## 슬라이딩 윈도우란

**슬라이딩 윈도우**는 배열의 연속 구간을 창문처럼 잡고 한 칸씩 밀면서 구간의 값을 이전 결과에서 고쳐 나가는 방법입니다.
투 포인터가 두 인덱스를 양 끝에서 좁혀 온다면 슬라이딩 윈도우는 두 인덱스가 같은 방향으로 나란히 움직입니다.
이때 두 인덱스 사이의 연속 구간을 **윈도우**라고 부릅니다.

두 번째 질문은 "연속 3일 동안 가장 많이 공부한 시간은?"입니다.
이번에는 연속된 날이 중요하므로 기록을 정렬하지 않고 날짜 순서 그대로 씁니다.

![월부터 일까지의 기록 20·60·10·50·35·80·0 위에 3칸짜리 점선 창이 있다. 첫 창은 월·화·수로 합 90이고 한 칸 밀면 월의 20이 빠지고 목의 50이 들어와 120이 된다. 다시 밀면 화의 60이 빠지고 금의 35가 들어와 95가 된다.](content/assets/algorithm/twp-window-slide.png)

창을 한 칸 밀면 창 안의 값 두 개는 그대로이고 맨 앞의 값 하나가 빠지고 새 값 하나가 들어옵니다.
그래서 매번 3일을 다시 더하지 않고 이전 합에서 빠진 값을 빼고 들어온 값을 더하면 됩니다.

```java
static int maxWindowSum(int[] minutes, int days) {
    int windowSum = 0;
    for (int i = 0; i < days; i++) {
        windowSum += minutes[i];
    }
    int maxSum = windowSum;
    for (int right = days; right < minutes.length; right++) {
        windowSum = windowSum - minutes[right - days] + minutes[right];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```

창의 합이 `90 → 120 → 95 → 165 → 115`로 바뀐다고 할 때 결과를 예상해 보세요.

```text
연속 3일 최대: 165분
```

목·금·토의 `50 + 35 + 80 = 165`가 가장 큽니다.
구간마다 3일을 새로 더하면 창 길이가 `k`일 때 `O(n × k)`이지만 이 방법은 한 칸 밀 때 두 값만 계산하므로 `O(n)`입니다.
`maxSum`을 `0`이 아니라 첫 창의 합으로 시작하는 이유는 기록에 음수가 있어도 올바른 최댓값을 얻기 위해서입니다.

### 길이가 바뀌는 윈도우

세 번째 질문은 "공부 시간이 110분 이상이 되는 가장 짧은 연속 기간은?"입니다.
이번에는 창의 길이가 정해져 있지 않습니다.
그래서 오른쪽 끝을 한 칸씩 늘리다가 합이 목표 이상이 되면 왼쪽 끝을 당겨 창을 줄여 봅니다.

```java
static int shortestDays(int[] minutes, int goal) {
    int left = 0;
    int windowSum = 0;
    int best = Integer.MAX_VALUE;
    for (int right = 0; right < minutes.length; right++) {
        windowSum += minutes[right];
        while (windowSum >= goal) {
            best = Math.min(best, right - left + 1);
            windowSum -= minutes[left];
            left++;
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}
```

오른쪽 끝이 늘어날 때마다 창이 어떻게 바뀌는지 따라가 보면 다음과 같습니다.

| 오른쪽 끝 | 더한 뒤 합 | 110 이상일 때 왼쪽을 당긴 과정 | 가장 짧은 길이 |
| --- | --- | --- | --- |
| 월 `20` | 20 | 없음 | 없음 |
| 화 `60` | 80 | 없음 | 없음 |
| 수 `10` | 90 | 없음 | 없음 |
| 목 `50` | 140 | 월~목 4일 기록 → 월을 빼서 120 · 화~목 3일 기록 → 화를 빼서 60 | 3 |
| 금 `35` | 95 | 없음 | 3 |
| 토 `80` | 175 | 수~토 4일 기록 → 수를 빼서 165 · 목~토 3일 기록 → 목을 빼서 115 · 금~토 2일 기록 → 금을 빼서 80 | 2 |
| 일 `0` | 80 | 없음 | 2 |

```text
110분을 채우는 가장 짧은 기간: 2일
```

금·토의 `35 + 80 = 115`가 가장 짧은 답입니다.
`left`와 `right`는 둘 다 앞으로만 움직이고 각각 최대 `n`번 움직이므로 안쪽에 `while`이 있어도 전체는 `O(n)`입니다.

이 방법은 값이 모두 0 이상일 때만 맞습니다.
값이 0 이상이면 창을 줄일 때 합이 늘어나지 않으므로 이미 지나온 왼쪽 끝으로 돌아갈 필요가 없기 때문입니다.
음수가 섞여 있으면 창을 줄였는데 합이 커질 수 있어서 이 규칙이 깨집니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `StudyMinutes.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.Arrays;
>
> public class StudyMinutes {
>     static int bruteChecks = 0;
>     static int pointerChecks = 0;
>
>     static int[] pairByBruteForce(int[] sorted, int target) {
>         for (int i = 0; i < sorted.length; i++) {
>             for (int j = i + 1; j < sorted.length; j++) {
>                 bruteChecks++;
>                 if (sorted[i] + sorted[j] == target) return new int[] {sorted[i], sorted[j]};
>             }
>         }
>         return new int[0];
>     }
>
>     static int[] pairByTwoPointers(int[] sorted, int target) {
>         int left = 0;
>         int right = sorted.length - 1;
>         while (left < right) {
>             pointerChecks++;
>             int sum = sorted[left] + sorted[right];
>             if (sum == target) return new int[] {sorted[left], sorted[right]};
>             if (sum < target) {
>                 left++;
>             } else {
>                 right--;
>             }
>         }
>         return new int[0];
>     }
>
>     static int maxWindowSum(int[] minutes, int days) {
>         int windowSum = 0;
>         for (int i = 0; i < days; i++) {
>             windowSum += minutes[i];
>         }
>         int maxSum = windowSum;
>         for (int right = days; right < minutes.length; right++) {
>             windowSum = windowSum - minutes[right - days] + minutes[right];
>             maxSum = Math.max(maxSum, windowSum);
>         }
>         return maxSum;
>     }
>
>     static int shortestDays(int[] minutes, int goal) {
>         int left = 0;
>         int windowSum = 0;
>         int best = Integer.MAX_VALUE;
>         for (int right = 0; right < minutes.length; right++) {
>             windowSum += minutes[right];
>             while (windowSum >= goal) {
>                 best = Math.min(best, right - left + 1);
>                 windowSum -= minutes[left];
>                 left++;
>             }
>         }
>         return best == Integer.MAX_VALUE ? 0 : best;
>     }
>
>     public static void main(String[] args) {
>         int[] minutes = {20, 60, 10, 50, 35, 80, 0};
>
>         int[] sorted = Arrays.copyOf(minutes, minutes.length);
>         Arrays.sort(sorted);
>         System.out.println("정렬한 기록: " + Arrays.toString(sorted));
>         System.out.println("모든 쌍 확인: " + Arrays.toString(pairByBruteForce(sorted, 85)) + " | 비교 " + bruteChecks + "번");
>         System.out.println("투 포인터: " + Arrays.toString(pairByTwoPointers(sorted, 85)) + " | 비교 " + pointerChecks + "번");
>
>         System.out.println("연속 3일 최대: " + maxWindowSum(minutes, 3) + "분");
>         System.out.println("110분을 채우는 가장 짧은 기간: " + shortestDays(minutes, 110) + "일");
>     }
> }
> ```
>
> ```text
> 정렬한 기록: [0, 10, 20, 35, 50, 60, 80]
> 모든 쌍 확인: [35, 50] | 비교 16번
> 투 포인터: [35, 50] | 비교 6번
> 연속 3일 최대: 165분
> 110분을 채우는 가장 짧은 기간: 2일
> ```

## 투 포인터와 슬라이딩 윈도우의 선택

두 방법은 모두 인덱스 두 개로 배열을 한 번만 훑는다는 점이 같습니다.
다른 점은 무엇을 보고 포인터를 옮기느냐입니다.

| | 투 포인터 (양 끝에서 좁히기) | 슬라이딩 윈도우 |
| --- | --- | --- |
| 포인터가 움직이는 방향 | 양 끝에서 가운데로 | 둘 다 같은 방향으로 |
| 먼저 필요한 조건 | 배열이 정렬되어 있어야 합니다 | 연속 구간이어야 하고 순서를 바꾸면 안 됩니다 |
| 포인터를 옮기는 기준 | 합이 작으면 `left` · 크면 `right` | 창에서 빠지는 값과 들어오는 값 |
| 잘 맞는 문제 | 정렬된 배열에서 두 값의 합 찾기 | 연속 `k`개의 합·조건을 채우는 가장 짧거나 긴 구간 |

문제에서 두 수의 짝을 찾고 순서를 바꿔도 되면 정렬한 뒤 투 포인터를 떠올립니다.
연속된 구간을 묻는다면 슬라이딩 윈도우를 떠올리고 원래 이웃하던 값이 흩어지지 않도록 정렬하지 않습니다.

## 정리

- 투 포인터는 정렬된 배열의 양 끝에서 출발해 합이 작으면 `left`를 크면 `right`를 옮깁니다.
- 한 번 비교할 때마다 답이 될 수 없는 행이나 열을 통째로 버리므로 `O(n²)`이 `O(n)`으로 줄어듭니다.
- 슬라이딩 윈도우는 연속 구간을 밀면서 빠지는 값을 빼고 들어오는 값을 더해 `O(n)`에 구간을 모두 봅니다.
- 길이가 바뀌는 윈도우는 합이 목표 이상이 되면 왼쪽을 당기고 값이 0 이상일 때 올바르게 동작합니다.

## 이어서 연습하기

[두 정렬 기록의 공통 번호 모으기](#/coding-tests/java/bridge-twp-01)에서 두 배열 위의 포인터를 함께 움직여 봅니다.
[목표에 가장 가까운 두 값의 합 찾기](#/coding-tests/java/bridge-twp-02)에서 양 끝에서 좁히는 투 포인터를 써 봅니다.
[기준 합을 채우는 가장 짧은 구간 찾기](#/coding-tests/java/bridge-twp-03)에서 길이가 바뀌는 윈도우를 구현해 봅니다.
[한계 이하인 위치 쌍 세기](#/coding-tests/java/bridge-twp-04)에서 한 번의 비교로 여러 쌍을 세어 봅니다.

## 공식 자료

- [Java 25 API: Arrays](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html)

## 핵심 질문 답

정렬된 배열에서 두 값의 합이 목표보다 작으면 작은 쪽 값은 어떤 값과 짝지어도 모자라고 크면 큰 쪽 값은 어떤 값과 짝지어도 넘칩니다.
그래서 투 포인터는 한 번 비교할 때마다 한쪽 값을 버리고 두 포인터가 만날 때까지 최대 `n - 1`번만 움직이므로 모든 짝을 보는 `O(n²)`이 `O(n)`으로 줄어듭니다.
연속 구간을 다룰 때는 슬라이딩 윈도우로 창을 밀면서 빠지는 값과 들어오는 값만 반영해 `O(n)`에 모든 구간을 봅니다.
두 값의 짝을 찾고 순서를 바꿔도 되면 투 포인터를 쓰고 순서를 지켜야 하는 연속 구간이면 슬라이딩 윈도우를 씁니다.
