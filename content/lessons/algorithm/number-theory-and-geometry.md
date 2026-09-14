# 정수론과 기하학

## 학습 목표

- 약수와 배수의 관계를 나머지로 설명할 수 있습니다.
- 유클리드 알고리즘으로 두 양의 정수의 최대공약수를 구할 수 있습니다.
- 좌표와 외적 값을 이용해 세 점의 방향을 구분할 수 있습니다.
- 정수 범위와 좌표계 같은 입력 조건을 먼저 확인할 수 있습니다.

## 한줄 요약

나머지로 정수의 공약수 관계를 줄여 가고, 같은 기준점에서 만든 두 벡터의 외적으로 세 점의 방향을 판단합니다.

## 먼저 확인할 개념

- [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations): 계산 전에 `int`와 `long`의 범위를 확인합니다.
- [조건과 반복의 실행 경계](#/learn/java/wiki-control-flow): 나머지가 `0`이 될 때 반복을 멈춥니다.
- [클래스·객체·참조와 this](#/learn/java/wiki-objects): 한 점의 `x`, `y`를 같은 객체에 보관합니다.

## 개념 연결

- 선행: `algo.condition`, `algo.brute-force`
- 이 단원: `algo.number-theory`, `algo.geometry`
- 후속: `algo.binary-search`, `algo.graph-representation`

## 나머지로 약수와 배수를 확인한다

숫자나 좌표를 다룰 때는 계산식보다 먼저 관계와 입력 조건을 정합니다.
두 수가 정확히 나누어지는지, 세 점이 어느 방향으로 놓이는지 알면 필요한 판단을 짧은 계산으로 표현할 수 있습니다.
이 단원은 정수론·기하학 전체가 아니라 **최대공약수**와 **세 점의 방향**에 집중합니다.

양의 정수 `a`, `b`에서 `a % b == 0`이면 `b`는 `a`의 **약수**, `a`는 `b`의 **배수**입니다.
두 정수를 모두 나누어떨어지게 하는 양의 약수 중 가장 큰 값을 **최대공약수**라고 합니다.
`30 % 6`은 `0`이므로 `6`은 `30`의 약수입니다.

Java의 `%`는 몫이 아닌 **나머지** 연산자입니다.
정수 나눗셈의 나누는 수가 `0`이면 `/`와 `%` 모두 `ArithmeticException`을 발생시킵니다.
음수 피연산자의 나머지는 부호를 별도로 해석해야 하므로 아래 최대공약수 메서드는 두 입력을 양의 `int`로 제한합니다.

## 유클리드 알고리즘: 같은 공약수를 갖는 작은 쌍으로 바꾼다

`a`를 `b`로 나눈 나머지를 `r`이라고 하면 `a = b × 몫 + r`입니다.
`a`와 `b`를 모두 나누는 수는 `r`도 나눕니다.
반대로 `b`와 `r`을 모두 나누는 수는 `a`도 나누므로 두 쌍의 공약수는 같습니다.

이 관계를 `gcd(a, b) = gcd(b, a % b)`로 나타냅니다.
나머지는 이전의 나누는 수보다 작아지므로 같은 갱신을 반복하면 결국 나머지가 `0`이 됩니다.
그때의 나누는 수가 최대공약수입니다.

| 단계 | `left` | `right` | 나머지 | 다음 쌍 |
| --- | ---: | ---: | ---: | --- |
| 1 | 84 | 30 | 24 | `(30, 24)` |
| 2 | 30 | 24 | 6 | `(24, 6)` |
| 3 | 24 | 6 | 0 | `(6, 0)` |

`right`가 `0`이면 반복을 끝내고 `left`의 `6`을 반환합니다.
약수를 하나씩 모두 세지 않고 공약수 관계를 유지하면서 수의 쌍을 줄이는 방법입니다.

## 같은 기준점의 외적으로 방향을 판별한다

**계산 기하학**은 점·선분·도형 사이의 관계를 계산으로 판단하는 분야입니다.
점은 `x`와 `y`를 가진 `Point` 객체로 나타낼 수 있습니다.

세 점 `A`, `B`, `C`에서 같은 기준점 `A`로부터 `B - A`, `C - A` 두 벡터를 만듭니다.
2차원 외적 값은 다음과 같습니다.

`(B.x - A.x) × (C.y - A.y) - (B.y - A.y) × (C.x - A.x)`

오른쪽이 `x`의 양의 방향, 위쪽이 `y`의 양의 방향인 수학 좌표계에서 다음처럼 읽습니다.

| 외적 값 | `A → B → C`의 방향 |
| --- | --- |
| 양수 | 반시계 |
| 음수 | 시계 |
| `0` | 일직선 |

`A = (0, 0)`, `B = (3, 0)`, `C = (3, 2)`이면 두 벡터는 `(3, 0)`, `(3, 2)`입니다.
외적이 `3 × 2 - 0 × 3 = 6`으로 양수이므로 반시계입니다.
화면처럼 아래쪽으로 `y`가 커지는 좌표계라면 눈에 보이는 방향과 부호의 대응이 반대가 됩니다.

## 계산 타입은 중간 결과의 범위로 정한다

`int`는 `-2,147,483,648`부터 `2,147,483,647`까지의 정수를 나타냅니다.
`long`은 약 `-9.22 × 10^18`부터 `9.22 × 10^18`까지이며, 무제한 정수가 아닙니다.
일반 정수 연산은 범위를 넘었다고 자동으로 예외를 던지지 않으므로 오버플로를 미리 피해야 합니다.

예제의 각 좌표는 **`-1,000,000,000`부터 `1,000,000,000`까지인 정수**로 제한합니다.
좌표 차의 절댓값은 최대 `2 × 10^9`, 두 차의 곱은 최대 `4 × 10^18`입니다.
두 곱의 차에 대한 상한 `8 × 10^18`도 `long` 범위 안이므로 이 조건에서는 외적을 `long`으로 계산할 수 있습니다.

`(long) b.x - a.x`처럼 **뺄셈 전에** `long`으로 바꾸면 뒤의 곱셈도 `long`에서 진행됩니다.
`long cross = int값 * int값`처럼 결과 변수만 넓히면 곱셈은 이미 `int` 범위에서 끝나므로 충분하지 않습니다.
좌표 범위를 더 늘리거나 소수 좌표로 바꾸면 정수 오버플로·소수 오차와 비교 기준을 다시 설계해야 합니다.

## 예제: 최대공약수와 세 방향

다음은 `NumberGeometryExample.java`로 구성할 수 있는 Java 25 예제입니다.
`gcd`는 두 양의 `int`를 받고, `Point`는 앞에서 정한 좌표 범위를 검사합니다.
예상 결과를 보기 전에 외적의 부호를 직접 계산해 보세요.

```java
public class NumberGeometryExample {
    static int gcd(int a, int b) {
        if (a <= 0 || b <= 0) {
            throw new IllegalArgumentException("두 수는 양수여야 합니다.");
        }
        int left = a;
        int right = b;
        while (right != 0) {
            int remainder = left % right;
            left = right;
            right = remainder;
        }
        return left;
    }

    static final class Point {
        final int x;
        final int y;

        Point(int x, int y) {
            if (x < -1_000_000_000 || x > 1_000_000_000
                    || y < -1_000_000_000 || y > 1_000_000_000) {
                throw new IllegalArgumentException("좌표 범위를 벗어났습니다.");
            }
            this.x = x;
            this.y = y;
        }
    }

    static long cross(Point a, Point b, Point c) {
        long abX = (long) b.x - a.x;
        long abY = (long) b.y - a.y;
        long acX = (long) c.x - a.x;
        long acY = (long) c.y - a.y;
        return abX * acY - abY * acX;
    }

    static String direction(Point a, Point b, Point c) {
        long value = cross(a, b, c);
        if (value > 0) return "반시계";
        if (value < 0) return "시계";
        return "일직선";
    }

    public static void main(String[] args) {
        System.out.println(30 % 6 == 0);
        System.out.println(gcd(84, 30));
        Point a = new Point(0, 0);
        Point b = new Point(3, 0);
        Point c = new Point(3, 2);
        System.out.println(cross(a, b, c));
        System.out.println(direction(a, b, c));
        System.out.println(direction(a, c, b));
        System.out.println(direction(a, b, new Point(6, 0)));
    }
}
```

예상 출력:

```text
true
6
6
반시계
시계
일직선
```

## 흔한 실수와 확인할 지점

- `%`를 몫으로 해석하지 마세요. 결과가 `0`인지로 나누어떨어지는 관계를 봅니다.
- `left`를 먼저 바꾼 다음 나머지를 계산하면 이전 값을 잃습니다. 기존 두 값으로 나머지를 계산한 뒤 `(기존 right, 나머지)`로 바꿉니다.
- 외적의 두 벡터에서 기준점을 섞지 마세요. 둘 다 `A`에서 출발해야 합니다.
- 큰 수를 `long` 변수에 받기만 하면 안전하다고 생각하지 마세요. 뺄셈·곱셈이 어느 타입에서 수행되는지 확인합니다.
- 소수 좌표를 이 예제에 그대로 넣거나 외적이 정확히 `0`일 것이라고 가정하지 마세요. 이 예제의 계약은 범위가 정해진 정수 좌표입니다.
- `y`축이 어느 방향으로 커지는지 확인하지 않으면 시계·반시계 이름을 반대로 붙일 수 있습니다.

## 이어서 학습하기

[이분 탐색과 동적 계획법 1](#/learn/algorithm/binary-search-and-dynamic-programming)에서 범위와 작은 문제의 답을 활용해 반복 작업을 줄이는 방법을 봅니다.
방향 예제에서 `B`와 `C`를 바꾸면 왜 부호가 바뀌는지 두 곱의 위치로 설명해 보세요.

## 공식 자료

- [Princeton Introduction to Programming in Java: Euclid](https://introcs.cs.princeton.edu/java/23recursion/Euclid.java.html): Java로 표현한 유클리드 알고리즘.
- [Princeton Algorithms: Point2D](https://algs4.cs.princeton.edu/12oop/Point2D.java.html): 같은 기준점으로 방향과 면적을 계산하는 관계.
- [Oracle Java 25 언어 명세: 정수 타입과 연산](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2): 정수 범위와 오버플로.
- [Oracle Java 25 언어 명세: 나머지 연산자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17.3): 정수 나머지와 나누는 수 `0`의 동작.

공식 자료 확인일: 2026-09-14. 기존 BAM.dev의 최대공약수·방향 예제를 Java 25의 정수 타입과 입력 범위에 맞게 재구성했습니다.

## 핵심 질문 답

정수의 나눗셈 관계는 나머지로 확인합니다.
최대공약수는 모든 약수를 나열하는 대신 `(a, b)`를 같은 공약수를 가진 `(b, a % b)`로 반복해서 바꾸고, 나머지가 `0`일 때 남은 수를 사용합니다.

세 점의 방향은 같은 기준점에서 만든 두 벡터의 외적 부호로 판단합니다.
이를 정확하게 해석하려면 계산 전에 정수의 입력 범위, 중간 곱을 담을 타입, `y`축의 방향을 정해야 합니다.
