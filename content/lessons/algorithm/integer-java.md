# Java로 정수 계산하기: 오버플로와 나머지

## 학습 목표

- `int`·`long`의 범위와 오버플로를 알고 `Math`의 정확한 계산 메서드·`floorMod`·`BigInteger` 중 상황에 맞는 도구를 고를 수 있습니다.

## 한줄 요약

Java의 정수는 범위를 넘으면 조용히 엉뚱한 값이 되므로 중간값의 크기를 먼저 가늠해 `long`·나머지 연산·`Math`의 정확한 계산 메서드·`BigInteger` 중에서 고릅니다.

## 먼저 확인할 개념

[나머지와 최대공약수](#/learn/algorithm/number-theory-and-geometry) · [소수](#/learn/algorithm/prime) · [경우의 수](#/learn/algorithm/combinatorics) · [진법과 비트](#/learn/algorithm/base-and-bits) · [계산 전에 정하는 숫자 타입](#/learn/java/wiki-numeric-operations)

## 오버플로란

**오버플로**는 계산 결과가 타입이 담을 수 있는 범위를 넘어서 엉뚱한 값으로 바뀌는 현상입니다.
앞의 수학 문서들에서는 나머지·최대공약수·조합을 손으로 계산했습니다.
이번에는 그 계산을 Java로 옮길 때 가장 먼저 부딪히는 문제인 정수의 범위부터 보겠습니다.

Java의 정수 타입은 크기가 정해져 있습니다.

| 타입 | 비트 | 가장 작은 값 | 가장 큰 값 |
| --- | --- | --- | --- |
| `int` | 32 | -2,147,483,648 | 2,147,483,647 (약 2.1 × 10⁹) |
| `long` | 64 | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 (약 9.2 × 10¹⁸) |

가장 큰 값에 1을 더하면 어떻게 될지 예상해 보세요.

```text
int 최댓값: 2147483647
최댓값 + 1: -2147483648
```

더한 결과가 가장 작은 음수로 바뀌었습니다.
정수는 비트 개수가 정해져 있어서 자동차 계기판의 주행 거리처럼 끝에 닿으면 반대쪽 끝으로 넘어가기 때문입니다.

![int의 범위를 가로 막대로 나타낸 그림. 왼쪽 끝은 -2,147,483,648이고 오른쪽 끝은 2,147,483,647이다. 오른쪽 끝에서 1을 더하면 화살표가 막대 위로 돌아 왼쪽 끝으로 넘어간다. 아래에는 훨씬 긴 long의 막대가 약 9.2 × 10¹⁸까지 이어진다.](content/assets/algorithm/math-java-int-range.png)

더 무서운 점은 Java가 오버플로를 알려 주지 않는다는 것입니다.
예외도 경고도 없이 계산이 계속 진행됩니다.
`25!`을 `long`으로 계산해 보면 이 점이 분명해집니다.

```java
long plain = 1;
for (int i = 1; i <= 25; i++) {
    plain *= i;
}
System.out.println("25! long: " + plain);
```

```text
25! long: 7034535277573963776
```

실제 `25!`은 15,511,210,043,330,985,984,000,000으로 26자리 수입니다.
그런데 출력은 19자리 양수라서 얼핏 보면 틀린 줄도 모릅니다.
그래서 오버플로는 결과를 보고 알아차리기보다 계산 전에 크기를 가늠해서 막아야 합니다.

## 오버플로를 막는 방법

크기를 가늠했다면 상황에 따라 세 가지 방법 중 하나를 고릅니다.

### long으로 먼저 바꾸기

중간값이 `int` 범위를 넘지만 `long` 범위 안이라면 계산 전에 `long`으로 바꿉니다.
여기서 순서가 중요합니다.
`long x = a * b;`처럼 결과만 `long`에 담으면 곱셈은 이미 `int`로 끝난 뒤라서 소용이 없습니다.
`(long) a * b`처럼 곱하기 전에 한쪽을 `long`으로 바꿔야 곱셈 자체가 `long`에서 일어납니다.

### Math의 정확한 계산 메서드

범위를 넘으면 안 되는 계산이라면 `Math.addExact`·`Math.multiplyExact`를 씁니다.
이 메서드들은 결과가 범위를 넘는 순간 `ArithmeticException`을 던집니다.

```java
try {
    Math.addExact(Integer.MAX_VALUE, 1);
} catch (ArithmeticException e) {
    System.out.println("addExact: " + e.getMessage());
}
```

```text
addExact: integer overflow
```

조용히 틀린 값이 나오는 대신 예외가 나므로 테스트할 때 문제를 바로 찾을 수 있습니다.
`subtractExact`·`negateExact`·`toIntExact`도 같은 방식으로 동작합니다.

### 나머지로 줄이기

문제가 `답을 1,000,000,007로 나눈 나머지`를 원한다면 곱할 때마다 나머지를 구합니다.
[나머지와 최대공약수](#/learn/algorithm/number-theory-and-geometry)에서 본 것처럼 곱셈은 중간에 나머지를 구해도 결과가 같기 때문입니다.

```java
static final int MOD = 1_000_000_007;

long remainder = 1;
for (int i = 1; i <= 25; i++) {
    remainder = remainder * i % MOD;
}
```

```text
25! 나머지: 440732388
```

`remainder`는 늘 `MOD`보다 작으므로 두 나머지를 곱해도 약 10¹⁸이라 `long`에 들어갑니다.
하지만 약 10¹⁸은 `int`에 담기지 않으므로 `remainder`는 반드시 `long`으로 둡니다.

## % 연산자의 음수 결과

나머지를 구할 때는 한 가지를 더 조심해야 합니다.
Java의 `%`는 결과의 부호가 나누어지는 수를 따라갑니다.
그래서 나누어지는 수가 음수이면 나머지도 음수가 나옵니다.

[나머지와 최대공약수](#/learn/algorithm/number-theory-and-geometry)에서는 나머지끼리 뺀 `7 - 8`이 음수가 되어 `m`을 한 번 더했습니다.
이번에는 빼는 순서를 바꾼 `(30 - 84) % 11`을 그대로 계산해 보겠습니다.
수학의 나머지는 1이지만 Java의 결과를 먼저 예상해 보세요.

```java
System.out.println("(30 - 84) % 11 = " + (30 - 84) % 11);
System.out.println("floorMod = " + Math.floorMod(30 - 84, 11));
```

```text
(30 - 84) % 11 = -10
floorMod = 1
```

![-55와 -44 사이에 -54가 놓인 수직선. 퍼센트 연산자는 0 쪽의 가까운 배수인 -44에서 재어 -54는 -44보다 10 작으므로 -10을 돌려준다. floorMod는 왼쪽의 가까운 배수인 -55에서 재어 -54는 -55보다 1 크므로 1을 돌려준다.](content/assets/algorithm/math-java-mod-negative.png)

`%`는 몫을 0 쪽으로 버리는 `/`와 짝을 이루므로 -54를 -44에서 잽니다.
반면 `Math.floorMod`는 몫을 더 작은 쪽으로 내리는 나눗셈과 짝을 이루므로 -55에서 잽니다.
그래서 `floorMod`의 결과는 나누는 수가 양수이면 늘 `0` 이상 `m` 미만입니다.
요일·원형 배열의 번호처럼 음수가 나오면 안 되는 나머지는 `Math.floorMod`로 구합니다.

> [!question]- Math.abs도 음수를 돌려줄 수 있나요?
> 한 가지 경우가 있습니다.
> `Math.abs(Integer.MIN_VALUE)`는 `-2147483648`을 그대로 돌려줍니다.
> `int`의 가장 작은 값을 양수로 바꾸면 2,147,483,648인데 이 수는 `int`의 가장 큰 값보다 1 크기 때문입니다.
>
> 이 경우를 예외로 알고 싶다면 `Math.absExact`를 씁니다.
> 좌표의 차이처럼 절댓값을 구할 값이 `int`의 끝에 닿을 수 있다면 `long`으로 바꾼 뒤 `Math.abs`를 부릅니다.

## BigInteger

그렇다면 나머지가 아닌 정확한 값 자체가 필요할 때는 어떻게 할까요?
**BigInteger**는 메모리가 허락하는 만큼 자릿수를 늘려 가며 정수를 정확히 담는 Java 클래스입니다.
`long`으로 틀렸던 `25!`을 다시 계산해 보겠습니다.

```java
BigInteger big = BigInteger.ONE;
for (int i = 2; i <= 25; i++) {
    big = big.multiply(BigInteger.valueOf(i));
}
System.out.println("25! BigInteger: " + big);
```

```text
25! BigInteger: 15511210043330985984000000
```

`BigInteger`는 객체이므로 `+`·`*` 대신 메서드를 부르고 결과는 새 객체로 돌아옵니다.
그래서 `big.multiply(...)`의 결과를 다시 `big`에 담아야 합니다.
앞의 수학 문서들에서 한 계산을 대신하는 메서드도 준비되어 있습니다.

| 메서드 | 하는 일 | 예 |
| --- | --- | --- |
| `add` · `subtract` · `multiply` · `divide` | 사칙연산 | `a.multiply(b)` |
| `mod(m)` | 0 이상의 나머지 | `big.mod(BigInteger.valueOf(MOD))` → 440732388 |
| `gcd(b)` | 최대공약수 | `84`와 `30` → 6 |
| `modPow(e, m)` | 거듭제곱의 나머지 | [빠른 거듭제곱](#/learn/algorithm/fast-power)을 대신함 |
| `isProbablePrime(c)` | 소수일 가능성 판별 | `29` → `true` |

다만 `BigInteger`는 자릿수만큼 계산이 느려지고 객체를 계속 만듭니다.
그래서 코딩테스트에서는 `long`이나 나머지로 해결되지 않을 때만 씁니다.

## 수학 개념을 Java로 구현

지금까지 본 도구로 앞의 수학 문서들에서 본 개념을 Java로 옮기면 이렇습니다.

| 개념 | Java 구현에서 챙길 점 |
| --- | --- |
| 최대공약수·최소공배수 | 값이 크면 `long`으로 받고 최소공배수는 `a / gcd(a, b) * b`로 나눈 뒤 곱함 |
| 소수 판별·에라토스테네스의 체 | 반복 조건을 `i * i <= n`으로 두고 `n`이 `int` 끝에 가까우면 `(long) i * i`로 비교 |
| 조합의 나머지 | 파스칼의 삼각형을 채울 때마다 `% MOD` |
| 2진수·비트 | `Integer.toBinaryString` · `Integer.parseInt(s, 2)` · `Integer.bitCount` |

최소공배수를 먼저 보겠습니다.
20억과 19억 9999만 9999의 최소공배수를 `long`으로 구하면 어떻게 될지 예상해 보세요.

```java
static long lcm(long a, long b) {
    return a / gcd(a, b) * b;
}
```

```text
lcm: 3999999998000000000
```

두 수는 최대공약수가 1이라서 최소공배수가 약 4 × 10¹⁸입니다.
`int`에는 담기지 않지만 `long`에는 들어가므로 매개변수부터 `long`으로 받았습니다.
`a * b / gcd`로 쓰면 곱셈 결과는 같아도 나눗셈 전에 더 큰 중간값이 생길 수 있어서 먼저 나눕니다.

조합의 나머지는 파스칼의 삼각형에 `% MOD` 한 번을 더하면 됩니다.

```java
c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD;
```

```text
1000C500 나머지: 159835829
```

`1000C500`은 300자리 수이지만 칸마다 나머지만 남겼으므로 `long` 배열로 충분합니다.

비트는 Java가 만들어 둔 메서드로 바로 확인할 수 있습니다.

```text
2진수 문자열: 1101
문자열을 수로: 13
켜진 비트 수: 3
```

`Integer.toBinaryString(13)`은 `1101`을 돌려주고 `Integer.parseInt("1101", 2)`는 거꾸로 13을 돌려줍니다.
`Integer.bitCount(13)`은 켜진 비트가 몇 개인지 세므로 비트마스크에서 부분집합의 원소 수를 셀 때 씁니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `IntegerCalculation.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.math.BigInteger;
>
> public class IntegerCalculation {
>     static final int MOD = 1_000_000_007;
>
>     static long gcd(long a, long b) {
>         while (b != 0) {
>             long r = a % b;
>             a = b;
>             b = r;
>         }
>         return a;
>     }
>
>     static long lcm(long a, long b) {
>         return a / gcd(a, b) * b;
>     }
>
>     static long[][] combinationTable(int n) {
>         long[][] c = new long[n + 1][n + 1];
>         for (int i = 0; i <= n; i++) {
>             c[i][0] = 1;
>             c[i][i] = 1;
>             for (int j = 1; j < i; j++) {
>                 c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD;
>             }
>         }
>         return c;
>     }
>
>     public static void main(String[] args) {
>         System.out.println("(30 - 84) % 11 = " + (30 - 84) % 11);
>         System.out.println("floorMod = " + Math.floorMod(30 - 84, 11));
>
>         System.out.println("int 최댓값: " + Integer.MAX_VALUE);
>         System.out.println("최댓값 + 1: " + (Integer.MAX_VALUE + 1));
>         System.out.println("long 최댓값: " + Long.MAX_VALUE);
>         System.out.println("abs(int 최솟값): " + Math.abs(Integer.MIN_VALUE));
>
>         try {
>             Math.addExact(Integer.MAX_VALUE, 1);
>         } catch (ArithmeticException e) {
>             System.out.println("addExact: " + e.getMessage());
>         }
>         try {
>             Math.multiplyExact(1_000_000_000, 3);
>         } catch (ArithmeticException e) {
>             System.out.println("multiplyExact: " + e.getMessage());
>         }
>
>         long plain = 1;
>         long remainder = 1;
>         for (int i = 1; i <= 25; i++) {
>             plain *= i;
>             remainder = remainder * i % MOD;
>         }
>         System.out.println("25! long: " + plain);
>         System.out.println("25! 나머지: " + remainder);
>
>         BigInteger big = BigInteger.ONE;
>         for (int i = 2; i <= 25; i++) {
>             big = big.multiply(BigInteger.valueOf(i));
>         }
>         System.out.println("25! BigInteger: " + big);
>         System.out.println("BigInteger 나머지: " + big.mod(BigInteger.valueOf(MOD)));
>         System.out.println("BigInteger gcd: " + BigInteger.valueOf(84).gcd(BigInteger.valueOf(30)));
>         System.out.println("BigInteger 소수: " + BigInteger.valueOf(29).isProbablePrime(20));
>
>         System.out.println("gcd: " + gcd(84, 30));
>         System.out.println("lcm: " + lcm(2_000_000_000, 1_999_999_999));
>         long[][] c = combinationTable(1000);
>         System.out.println("1000C500 나머지: " + c[1000][500]);
>
>         System.out.println("2진수 문자열: " + Integer.toBinaryString(13));
>         System.out.println("문자열을 수로: " + Integer.parseInt("1101", 2));
>         System.out.println("켜진 비트 수: " + Integer.bitCount(13));
>     }
> }
> ```
>
> ```text
> (30 - 84) % 11 = -10
> floorMod = 1
> int 최댓값: 2147483647
> 최댓값 + 1: -2147483648
> long 최댓값: 9223372036854775807
> abs(int 최솟값): -2147483648
> addExact: integer overflow
> multiplyExact: integer overflow
> 25! long: 7034535277573963776
> 25! 나머지: 440732388
> 25! BigInteger: 15511210043330985984000000
> BigInteger 나머지: 440732388
> BigInteger gcd: 6
> BigInteger 소수: true
> gcd: 6
> lcm: 3999999998000000000
> 1000C500 나머지: 159835829
> 2진수 문자열: 1101
> 문자열을 수로: 13
> 켜진 비트 수: 3
> ```

## 정수 계산 도구의 선택

어떤 도구를 쓸지는 중간값이 얼마나 커지는지와 문제가 무엇을 원하는지로 정합니다.

| 상황 | 고를 도구 |
| --- | --- |
| 중간값이 약 2.1 × 10⁹ 이하 | `int` |
| 중간값이 약 9.2 × 10¹⁸ 이하 | `long` (곱하기 전에 `(long)`으로 바꾸기) |
| 답을 `MOD`로 나눈 나머지만 원함 | `long` + 계산마다 `% MOD` |
| 음수가 나올 수 있는 나머지 | `Math.floorMod` |
| 범위를 넘으면 안 되고 넘었는지 알아야 함 | `Math.addExact` · `Math.multiplyExact` |
| 나머지가 아닌 정확한 큰 값이 필요 | `BigInteger` |

문제를 읽을 때 입력의 최댓값으로 곱셈 결과를 한 번 계산해 보는 습관을 들이면 오버플로의 대부분을 코드를 쓰기 전에 막을 수 있습니다.

## 정리

- `int`는 약 2.1 × 10⁹ · `long`은 약 9.2 × 10¹⁸까지 담고 범위를 넘으면 예외 없이 엉뚱한 값이 됩니다.
- `long`이 필요하면 곱하기 전에 바꾸고 넘었는지 알아야 하면 `Math.addExact`·`Math.multiplyExact`를 씁니다.
- `%`는 음수에서 음수 나머지를 돌려주므로 `0` 이상의 나머지가 필요하면 `Math.floorMod`를 씁니다.
- 나머지만 원하면 계산마다 `% MOD`를 하고 정확한 큰 값이 필요할 때만 `BigInteger`를 씁니다.

## 이어서 연습하기

[원형 트랙의 마지막 칸](#/coding-tests/java/algo-integer-01)에서 `Math.floorMod`와 `long`으로 음수 이동과 오버플로를 처리해 봅니다.
[빠른 거듭제곱](#/learn/algorithm/fast-power)에서 `aⁿ`을 `MOD`로 나눈 나머지를 `O(log n)`에 구해 봅니다.

## 공식 자료

- [Java 25 API: Math](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html)
- [Java 25 API: BigInteger](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigInteger.html)
- [Java 25 언어 명세: 정수 연산과 오버플로](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2)

## 핵심 질문 답

Java의 `int`와 `long`은 범위가 정해져 있고 범위를 넘으면 예외 없이 엉뚱한 값이 되므로 계산 전에 중간값의 크기를 가늠합니다.
중간값이 `long` 안이면 곱하기 전에 `long`으로 바꾸고 넘었는지 알아야 하면 `Math.addExact`·`Math.multiplyExact`를 씁니다.
답을 나머지로 원하면 계산마다 `% MOD`를 하고 음수가 나올 수 있으면 `Math.floorMod`로 `0` 이상의 나머지를 구합니다.
나머지가 아닌 정확한 큰 값이 필요할 때만 `BigInteger`를 씁니다.
