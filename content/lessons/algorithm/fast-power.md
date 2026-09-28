# 빠른 거듭제곱: 지수를 반씩 줄이기

## 학습 목표

- 분할 정복과 지수의 2진수 표현으로 `aⁿ % m`을 `O(log n)`에 구하는 과정을 단계별로 설명할 수 있습니다.
- 빠른 거듭제곱으로 큰 지수의 나머지와 나눗셈 대신 곱할 역원을 구해 코딩테스트 문제에 적용할 수 있습니다.

## 한줄 요약

빠른 거듭제곱은 `aⁿ`을 `a^(n/2)`의 제곱으로 바꾸거나 지수를 2진수로 나눠 곱해서 곱셈 횟수를 `n`번에서 약 `log n`번으로 줄입니다.

## 먼저 확인할 개념

[나머지와 최대공약수](#/learn/algorithm/number-theory-and-geometry) · [진법과 비트](#/learn/algorithm/base-and-bits) · [Java로 정수 계산하기](#/learn/algorithm/integer-java) · [백트래킹](#/learn/algorithm/brute-force-backtracking-recursion)

## 빠른 거듭제곱이란

**빠른 거듭제곱**은 지수를 절반씩 줄여 가며 거듭제곱을 적은 곱셈으로 구하는 방법입니다.
앞 문서에서는 곱할 때마다 나머지를 구해 오버플로를 막았습니다.
하지만 지수가 10¹⁸처럼 크면 곱셈을 10¹⁸번 하는 것 자체가 시간 안에 끝나지 않습니다.

여기서 **거듭제곱** `aⁿ`은 `a`를 `n`번 곱한 값이고 `a`를 **밑**·`n`을 **지수**라고 부릅니다.
빠른 거듭제곱은 이 곱셈 횟수를 줄이는 방법입니다.

예를 들어 하루마다 소문을 들은 사람이 3배로 늘어난다고 해 보겠습니다.
13일 뒤에는 `3¹³`배가 되고 이 수를 1,000으로 나눈 나머지를 구하려고 합니다.
이 문서는 `3¹³ % 1000`으로 끝까지 설명합니다.

가장 쉬운 방법은 3을 13번 곱하면서 나머지를 구하는 것입니다.

```java
static long slowPower(long a, long n, long m) {
    long result = 1;
    for (long i = 0; i < n; i++) {
        result = result * a % m;
    }
    return result;
}
```

```text
반복 곱셈: 323
```

`3¹³`은 1,594,323이라 1,000으로 나눈 나머지는 323입니다.
그런데 이 방법은 지수가 `n`이면 곱셈을 `n`번 하므로 `O(n)`입니다.

## 분할 정복으로 지수 줄이기

곱셈을 줄이는 열쇠는 같은 계산을 다시 쓰는 것입니다.
`3¹³`은 `3⁶ × 3⁶ × 3`으로 나눌 수 있습니다.
`3⁶`을 한 번만 구하면 두 번 쓸 수 있으므로 곱셈을 크게 아낄 수 있습니다.

`aⁿ = a^(n/2) × a^(n/2)` 이고 `n`이 홀수이면 `a`를 한 번 더 곱합니다.
여기서 `n/2`는 나머지를 버린 몫입니다.
이렇게 큰 문제를 같은 모양의 작은 문제로 나눠 푸는 방법을 **분할 정복**이라고 합니다.

![3의 13제곱을 반씩 나누는 그림. 3의 13제곱은 3의 6제곱의 제곱에 3을 한 번 더 곱하고 3의 6제곱은 3의 3제곱의 제곱이며 3의 3제곱은 3의 1제곱의 제곱에 3을 곱하고 3의 1제곱은 3의 0제곱인 1의 제곱에 3을 곱한다. 지수가 13에서 6·3·1·0으로 절반씩 줄어든다.](content/assets/algorithm/math-power-split.png)

지수는 13 → 6 → 3 → 1 → 0으로 매번 절반이 됩니다.
그래서 단계 수는 약 `log₂ n`이고 한 단계마다 곱셈이 한두 번이라 전체는 `O(log n)`입니다.
지수가 10¹⁸이어도 약 60단계면 끝납니다.

코드로 옮기면 자기 자신을 지수 절반으로 부르는 재귀입니다.

```java
static long recursivePower(long a, long n, long m) {
    if (n == 0) return 1;
    long half = recursivePower(a, n / 2, m);
    long result = half * half % m;
    if (n % 2 == 1) result = result * a % m;
    return result;
}
```

`half`를 한 번만 구해서 두 번 곱하는 점이 핵심입니다.
`recursivePower(a, n / 2, m)`를 두 번 부르면 다시 `O(n)`이 되기 때문입니다.

## 지수를 2진수로 보기

같은 계산을 재귀 없이 반복문으로도 할 수 있습니다.
[진법과 비트](#/learn/algorithm/base-and-bits)에서 본 것처럼 13은 2진수로 `1101`이고 `8 + 4 + 1`입니다.
그래서 `3¹³ = 3⁸ × 3⁴ × 3¹`로 쪼갤 수 있습니다.

![13을 2진수 1101로 쓴 그림. 오른쪽부터 각 자리는 3의 1제곱·3의 2제곱·3의 4제곱·3의 8제곱에 대응하고 앞 칸을 제곱해서 다음 칸을 만든다. 비트가 1인 3의 1제곱·3의 4제곱·3의 8제곱만 골라 곱하면 3의 13제곱이다.](content/assets/algorithm/math-power-binary.png)

`3¹`·`3²`·`3⁴`·`3⁸`은 앞의 값을 제곱하기만 하면 차례로 만들어집니다.
그중 지수의 비트가 1인 자리만 결과에 곱하면 됩니다.
반복할 때마다 가장 낮은 비트를 보고 지수를 오른쪽으로 한 칸 밉니다.

```java
static long power(long a, long n, long m) {
    long result = 1;
    a %= m;
    while (n > 0) {
        if ((n & 1) == 1) result = result * a % m;
        a = a * a % m;
        n >>= 1;
    }
    return result;
}
```

`power(3, 13, 1000)`에서 변수가 어떻게 바뀌는지 표로 따라가 보겠습니다.
`a`는 1,000으로 나눈 나머지로 들고 다닙니다.

| 반복 | `n` (2진수) | 가장 낮은 비트 | `result` | 다음 `a` |
| --- | --- | --- | --- | --- |
| 1 | 13 (`1101`) | 1 → `3` 곱함 | 3 | 3² = 9 |
| 2 | 6 (`110`) | 0 → 곱하지 않음 | 3 | 9² = 81 |
| 3 | 3 (`11`) | 1 → `81` 곱함 | 243 | 81² = 6,561 → 561 |
| 4 | 1 (`1`) | 1 → `561` 곱함 | 243 × 561 = 136,323 → 323 | 끝 |

마지막 결과가 무엇일지 표를 보고 먼저 예상해 보세요.

```text
분할 정복: 323
2진수 반복: 323
```

세 방법 모두 323으로 같습니다.
곱셈은 반복 곱셈이 13번이고 2진수 반복은 반복 네 번 동안 결과에 세 번·밑에 네 번입니다.
지수가 커질수록 이 차이는 `n`과 `log n`의 차이로 벌어집니다.

두 방식은 같은 원리를 다르게 쓴 것입니다.

| | 분할 정복 (재귀) | 2진수 반복 |
| --- | --- | --- |
| 지수를 줄이는 방법 | `n / 2`로 재귀 호출 | `n >>= 1`로 한 칸 밀기 |
| 홀수 처리 | 돌아오면서 `a`를 한 번 더 곱함 | 가장 낮은 비트가 1이면 결과에 곱함 |
| 추가 메모리 | 재귀 깊이만큼 `O(log n)` | `O(1)` |
| 잘 맞는 곳 | 원리를 이해하고 설명할 때 | 코딩테스트에서 바로 쓰는 코드 |

## 빠른 거듭제곱의 활용

코딩테스트에서 빠른 거듭제곱은 크게 두 곳에 씁니다.

### 큰 지수의 나머지

지수가 10¹⁸인 `2^(10^18) % 1,000,000,007`을 구해 보겠습니다.
반복 곱셈이라면 끝나지 않는 계산이지만 `power`는 약 60번 반복으로 끝납니다.
결과가 맞는지 Java의 `BigInteger.modPow`로도 확인해 보겠습니다.

```text
2^(10^18) 나머지: 719476260
modPow 확인: 719476260
```

두 값이 같습니다.
`BigInteger.modPow`도 같은 일을 하지만 객체를 만드는 만큼 느리므로 코딩테스트에서는 `long`으로 쓴 `power`를 주로 씁니다.

### 나눗셈 대신 역원 곱하기

[경우의 수](#/learn/algorithm/combinatorics)의 조합 `nCr = n! / (r! × (n - r)!)`을 나머지로 구하려면 나눗셈이 문제입니다.
나머지 연산에서는 나눗셈의 성질이 성립하지 않기 때문입니다.
그래서 나누는 대신 곱하면 1이 되는 수인 **역원**을 곱합니다.

나누는 수 `m`이 1,000,000,007처럼 소수이고 `a`가 `m`의 배수가 아니면 `a`의 역원은 `a^(m-2) % m`입니다.
이 식은 `a^(m-1) % m`이 늘 1이라는 **페르마의 소정리**에서 나옵니다.
`a^(m-1)`을 `a`와 `a^(m-2)`의 곱으로 보면 `a^(m-2)`가 곱해서 1이 되는 수이기 때문입니다.
지수가 약 10⁹이라 빠른 거듭제곱이 꼭 필요합니다.

```java
long inverse = power(2, MOD - 2, MOD);
```

```text
2의 역원: 500000004
2 × 역원 나머지: 1
```

2와 500,000,004를 곱하면 1,000,000,008이고 이를 1,000,000,007로 나누면 1이 남습니다.
그래서 나머지 세계에서 `÷ 2`는 `× 500000004`와 같습니다.

이 방법으로 팩토리얼의 나머지를 미리 구해 두면 조합을 파스칼의 삼각형 없이 구할 수 있습니다.
`n! × (r! × (n - r)!)^(MOD-2)`를 모두 `MOD`로 나눈 나머지로 계산합니다.

```text
1000C500 나머지: 159835829
```

[Java로 정수 계산하기](#/learn/algorithm/integer-java)에서 파스칼의 삼각형으로 구한 값과 같습니다.
삼각형은 `O(n²)`이지만 이 방법은 팩토리얼 `O(n)`에 거듭제곱 `O(log MOD)`이라 `n`이 수십만이어도 빠릅니다.

| 문제에 나오는 말 | 쓰는 방법 |
| --- | --- |
| `aⁿ`을 `m`으로 나눈 나머지 · `n`이 매우 큼 | `power(a, n, m)` |
| 나머지로 구하는데 나눗셈이 있음 · `m`이 소수 | 역원 `power(b, m - 2, m)`을 곱함 |
| `n`이 큰 `nCr`의 나머지 | 팩토리얼 나머지 + 역원 |
| 피보나치 수의 `n`번째 · `n`이 매우 큼 | 행렬을 같은 방식으로 거듭제곱 |

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `FastPower.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.math.BigInteger;
>
> public class FastPower {
>     static final long MOD = 1_000_000_007;
>
>     static long slowPower(long a, long n, long m) {
>         long result = 1;
>         for (long i = 0; i < n; i++) {
>             result = result * a % m;
>         }
>         return result;
>     }
>
>     static long recursivePower(long a, long n, long m) {
>         if (n == 0) return 1;
>         long half = recursivePower(a, n / 2, m);
>         long result = half * half % m;
>         if (n % 2 == 1) result = result * a % m;
>         return result;
>     }
>
>     static long power(long a, long n, long m) {
>         long result = 1;
>         a %= m;
>         while (n > 0) {
>             if ((n & 1) == 1) result = result * a % m;
>             a = a * a % m;
>             n >>= 1;
>         }
>         return result;
>     }
>
>     static long combination(int n, int r) {
>         long[] fact = new long[n + 1];
>         fact[0] = 1;
>         for (int i = 1; i <= n; i++) {
>             fact[i] = fact[i - 1] * i % MOD;
>         }
>         long denominator = fact[r] * fact[n - r] % MOD;
>         return fact[n] * power(denominator, MOD - 2, MOD) % MOD;
>     }
>
>     public static void main(String[] args) {
>         System.out.println("반복 곱셈: " + slowPower(3, 13, 1000));
>         System.out.println("분할 정복: " + recursivePower(3, 13, 1000));
>         System.out.println("2진수 반복: " + power(3, 13, 1000));
>         System.out.println("3^13 = " + (long) Math.pow(3, 13));
>
>         System.out.println("2^(10^18) 나머지: " + power(2, 1_000_000_000_000_000_000L, MOD));
>         System.out.println("modPow 확인: " + BigInteger.TWO.modPow(BigInteger.TEN.pow(18), BigInteger.valueOf(MOD)));
>
>         long inverse = power(2, MOD - 2, MOD);
>         System.out.println("2의 역원: " + inverse);
>         System.out.println("2 × 역원 나머지: " + 2 * inverse % MOD);
>         System.out.println("1000C500 나머지: " + combination(1000, 500));
>     }
> }
> ```
>
> ```text
> 반복 곱셈: 323
> 분할 정복: 323
> 2진수 반복: 323
> 3^13 = 1594323
> 2^(10^18) 나머지: 719476260
> modPow 확인: 719476260
> 2의 역원: 500000004
> 2 × 역원 나머지: 1
> 1000C500 나머지: 159835829
> ```

## 정리

- 빠른 거듭제곱은 `aⁿ = a^(n/2) × a^(n/2)`에 홀수면 `a`를 더 곱하는 분할 정복으로 곱셈을 `O(log n)`번으로 줄입니다.
- 반복문으로 쓸 때는 지수를 2진수로 보고 밑을 계속 제곱하면서 비트가 1인 자리만 결과에 곱합니다.
- 곱할 때마다 나머지를 구하고 두 나머지의 곱이 `long` 안에 들어가도록 `long`으로 계산합니다.
- 나누는 수가 소수이면 `a^(m-2) % m`이 역원이라서 조합처럼 나눗셈이 있는 계산도 나머지로 구할 수 있습니다.

## 이어서 연습하기

[큰 지수의 나머지](#/coding-tests/java/algo-fast-power-01)에서 지수가 매우 클 때 빠른 거듭제곱으로 나머지를 구해 봅니다.
[나머지와 최대공약수](#/learn/algorithm/number-theory-and-geometry)로 돌아가 나머지 연산의 성질을 다시 확인해 봅니다.
[경우의 수](#/learn/algorithm/combinatorics)의 파스칼의 삼각형과 역원 방법을 같은 `nCr`로 비교해 봅니다.

## 공식 자료

- [Java 25 API: BigInteger](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigInteger.html)

## 핵심 질문 답

`aⁿ % m`은 지수를 절반으로 줄인 `a^(n/2)`를 한 번 구해 제곱하고 `n`이 홀수면 `a`를 한 번 더 곱해서 구합니다.
반복문으로는 지수를 2진수로 보고 밑을 계속 제곱하면서 비트가 1인 자리만 결과에 곱합니다.
어느 쪽이든 곱셈이 약 `log n`번이라 지수가 10¹⁸이어도 60번 정도의 반복으로 끝납니다.
코딩테스트에서는 큰 지수의 나머지와 소수 `m`에 대한 역원 `a^(m-2) % m`을 구할 때 씁니다.
