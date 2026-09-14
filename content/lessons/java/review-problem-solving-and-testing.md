# 06. 복습·문제 분해·테스트·복잡도

## 학습 목표

- 문제를 입력·출력·규칙·경계 사례로 나눌 수 있습니다.
- 각 책임을 작은 메서드와 명확한 타입 계약으로 표현할 수 있습니다.
- 정상·경계·잘못된 입력 사례를 독립적으로 확인하는 테스트를 작성할 수 있습니다.
- 반복 횟수를 기준으로 `O(1)`·`O(n)`·`O(n²)`의 차이를 설명할 수 있습니다.

## 먼저 관찰하기

요구사항은 “점수 배열에서 기준 이상인 점수의 개수를 반환한다”입니다.

```java
static int countAtLeast(int[] scores, int threshold) {
    int count = 0;

    for (int score : scores) {
        if (score >= threshold) {
            count++;
        }
    }

    return count;
}
```

1. 입력 타입과 출력 타입은 무엇인가요?
2. 배열이 비어 있으면 어떤 흐름으로 반환 지점에 도달하나요?
3. 점수가 기준과 정확히 같을 때 포함되나요?
4. 배열 원소가 두 배가 되면 조건 비교 횟수는 대략 어떻게 변하나요?

## 문제를 네 부분으로 나누기

코드를 쓰기 전에 다음을 한 문장씩 적습니다.

1. 입력: `int[] scores`, `int threshold`
2. 출력: 기준 이상인 원소의 개수인 `int`
3. 규칙: 모든 원소를 한 번씩 확인하고 `score >= threshold`면 증가
4. 경계: 빈 배열, 기준과 같은 값, 모두 미달, 모두 통과

요구사항이 모호하다면 구현 전에 확인해야 합니다. 예를 들어 `scores == null`을 빈 배열로 볼지 예외로 볼지는 언어가 자동으로 정해 주는 제품 규칙이 아닙니다.

## 작은 메서드로 책임 나누기

입력 검증과 계산을 한 덩어리에 숨기지 않고 이름으로 책임을 드러낼 수 있습니다.

```java
static int countAtLeast(int[] scores, int threshold) {
    requireScores(scores);

    int count = 0;
    for (int score : scores) {
        if (isAtLeast(score, threshold)) {
            count++;
        }
    }
    return count;
}

static void requireScores(int[] scores) {
    if (scores == null) {
        throw new IllegalArgumentException("점수 배열이 필요합니다.");
    }
}

static boolean isAtLeast(int score, int threshold) {
    return score >= threshold;
}
```

메서드를 무조건 잘게 나누는 것이 목표는 아닙니다. 이름이 규칙을 설명하고, 독립적으로 확인할 가치가 있는 책임인지 기준으로 나누세요.

## 외부 의존성 없는 최소 테스트

다음 보조 메서드는 학습용 최소 검사입니다. 전문 테스트 프레임워크를 대신하는 완전한 도구가 아니라, 예상값과 실제값을 명시적으로 비교하는 연습입니다.

```java
static void checkEquals(int expected, int actual, String label) {
    if (expected != actual) {
        throw new AssertionError(
            label + ": expected=" + expected + ", actual=" + actual
        );
    }
}

public static void main(String[] args) {
    checkEquals(2, countAtLeast(new int[]{59, 60, 90}, 60), "일반");
    checkEquals(0, countAtLeast(new int[]{}, 60), "빈 배열");
    checkEquals(1, countAtLeast(new int[]{60}, 60), "경계값");
}
```

실행 전에 각 호출의 예상값이 요구사항과 맞는지 설명하세요. 실행했다면 성공 여부만 적지 말고 사용한 JDK 버전, 명령, 실패한 사례의 실제 메시지를 기록하세요.

테스트 사례는 서로 독립적이어야 합니다. 앞 테스트가 바꾼 상태에 다음 테스트가 의존하면 실패 원인을 좁히기 어렵습니다.

## 복잡도는 입력 증가에 따른 작업량

시간 복잡도는 특정 컴퓨터에서 측정한 한 번의 밀리초가 아니라, 입력 크기 `n`이 커질 때 주요 작업 횟수가 어떻게 늘어나는지를 표현합니다.

### O(1)

`ArrayList.get(index)`처럼 입력 원소 수와 무관하게 일정한 단계로 위치에 접근하는 연산을 상수 시간이라고 설명할 수 있습니다. 이는 해당 구현의 API 계약을 근거로 해야 합니다.

### O(n)

`countAtLeast`는 배열의 각 원소를 한 번씩 확인하므로 원소 수에 비례해 비교가 늘어납니다.

```java
for (int score : scores) {
    if (score >= threshold) {
        count++;
    }
}
```

### O(n²)

모든 원소 쌍을 비교하는 중첩 반복은 입력이 커질 때 비교 횟수가 제곱에 비례할 수 있습니다.

```java
for (int left = 0; left < values.length; left++) {
    for (int right = left + 1; right < values.length; right++) {
        if (values[left] == values[right]) {
            return true;
        }
    }
}
```

중첩 반복문이 항상 무조건 `O(n²)`인 것은 아닙니다. 각 반복의 범위가 입력 크기와 어떻게 연결되는지 세어야 합니다.

`HashMap.get`과 `put`은 해시 함수가 원소를 버킷에 적절히 분산한다는 가정 아래 기본 연산이 상수 시간 성능을 제공합니다. 복잡도 설명에는 구현과 가정을 함께 적으세요.

## 최소 구현 과제

두 단계로 작성하세요.

1. `containsNegative(int[] numbers)`: 음수가 하나라도 있으면 `true`
2. 정상·빈 배열·첫 원소가 음수·마지막 원소가 음수인 테스트

구현 전에 다음을 결정합니다.

- 발견 즉시 반환해도 되는가?
- 빈 배열의 결과는 무엇인가?
- 모든 원소를 확인해야 하는 최악의 경우는 언제인가?
- 시간 복잡도와 추가 공간 복잡도는 무엇인가?

## 흔한 실수

- 예시 하나만 통과하고 구현이 끝났다고 판단합니다.
- 예상값을 코드 결과에 맞춰 바꾸어 요구사항 검증을 잃습니다.
- 여러 책임을 한 메서드에 넣어 실패 위치를 찾기 어렵게 만듭니다.
- 작은 입력의 한 번 측정만으로 Big-O를 결정합니다.
- 라이브러리 연산의 복잡도를 문서 확인 없이 추측합니다.

## 최종 확인 문제

1. 문제를 입력·출력·규칙·경계 사례로 나누는 이유를 설명해 보세요.
2. `countAtLeast`의 빈 배열과 기준값 동일 사례가 각각 무엇을 검증하나요?
3. 테스트 사례가 서로 독립적이어야 하는 이유는 무엇인가요?
4. 한 번의 배열 순회와 모든 원소 쌍 비교의 작업량 증가를 비교해 보세요.
5. `HashMap` 기본 연산을 상수 시간이라고 설명할 때 함께 적어야 할 가정은 무엇인가요?

## 공식 근거 자료

- [Java SE 25 API: `AssertionError`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AssertionError.html)
- [Java SE 25 API: `ArrayList` 성능 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html)
- [Java SE 25 API: `HashMap` 성능 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
