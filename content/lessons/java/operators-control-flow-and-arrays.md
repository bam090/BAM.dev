# 02. 연산·제어문·배열

## 학습 목표

- 산술·비교·논리 연산자의 결과 타입과 평가 순서를 확인할 수 있습니다.
- `if`와 반복문이 `boolean` 조건으로 실행 흐름을 나누는 과정을 설명할 수 있습니다.
- 배열의 길이와 0부터 시작하는 인덱스 경계를 구분할 수 있습니다.
- 배열을 순회하며 합계나 개수를 계산하는 최소 메서드를 구현할 수 있습니다.

## 먼저 관찰하기

코드를 실행하기 전에 반복 횟수와 `passedCount`가 바뀌는 조건을 손으로 표시해 보세요.

```java
int[] scores = {55, 60, 90};
int passedCount = 0;

for (int index = 0; index < scores.length; index++) {
    if (scores[index] >= 60) {
        passedCount++;
    }
}
```

1. 첫 번째와 마지막으로 유효한 인덱스는 무엇인가요?
2. 반복 조건이 `index <= scores.length`라면 어떤 경계가 배열 밖을 가리키나요?
3. `scores[index] >= 60`은 어떤 타입의 값을 만드나요?
4. 점수가 정확히 `60`일 때 증가해야 하는지 요구사항과 비교해 보세요.

## 연산 결과의 타입부터 확인하기

산술 연산은 숫자 값을 계산하고, 비교 연산은 `boolean` 값을 만듭니다.

```java
int total = 7 + 5;
int quotient = 7 / 2;
boolean enough = total >= 10;
```

두 피연산자가 `int`인 나눗셈은 정수 나눗셈입니다. 소수 부분이 필요한 요구사항이라면 적어도 한쪽을 `double`로 바꾸는 등 타입을 의도적으로 설계해야 합니다.

```java
double average = (double) total / 2;
```

연산자를 많이 이어 붙이기 전에 중간 결과를 변수로 나누면 타입과 의미를 관찰하기 쉽습니다.

## 논리 연산과 단축 평가

`&&`는 왼쪽이 `true`일 때만 오른쪽을 평가하고, `||`는 왼쪽이 `false`일 때만 오른쪽을 평가합니다.

```java
boolean validIndex = index >= 0 && index < scores.length;
```

왼쪽부터 읽으면 “인덱스가 음수가 아니고, 배열 길이보다 작다”는 조건입니다. 단축 평가는 편리하지만, 오른쪽에 반드시 실행되어야 하는 상태 변경 코드를 넣으면 흐름을 이해하기 어려워집니다. 조건식은 가능하면 관찰 가능한 질문으로 유지하세요.

## 조건문으로 한 갈래 선택하기

```java
static String grade(int score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    }
    return "C";
}
```

`if` 조건은 `boolean` 표현식이어야 합니다. 위에서부터 처음 참인 갈래만 실행되므로 넓은 조건을 먼저 쓰면 뒤 조건이 도달하지 못할 수 있습니다. 경계값을 표로 적지 말고 실제 조건에 넣어 어느 갈래인지 한 단계씩 추적해 보세요.

## 반복문과 배열 경계

배열은 생성될 때 길이가 정해지고, 인덱스는 `0`부터 `length - 1`까지입니다.

```java
String[] topics = {"타입", "배열", "클래스"};

for (int index = 0; index < topics.length; index++) {
    String topic = topics[index];
    System.out.println(topic);
}
```

인덱스가 필요한 작업에는 기본 `for`문이 유용합니다. 위치가 필요하지 않고 모든 원소를 읽기만 한다면 향상된 `for`문이 더 단순합니다.

```java
for (String topic : topics) {
    System.out.println(topic);
}
```

두 예제의 출력을 아직 실행하지 않았다면 실제 출력이 확인되었다고 말하지 마세요. 각 반복에서 선택되는 원소를 먼저 적고, 실행 환경에서 확인한 뒤 예상과 비교하세요.

## 최소 구현

양수인 값의 개수를 세는 메서드를 완성해 보세요.

```java
static int countPositive(int[] numbers) {
    int count = 0;

    for (int number : numbers) {
        if (number > 0) {
            count++;
        }
    }

    return count;
}
```

관찰 순서:

1. 빈 배열이면 반복 본문은 몇 번 실행되는가?
2. `0`은 양수에 포함되는가?
3. 음수에서는 `count`가 바뀌는가?
4. 반환 타입 `int`와 실제 반환 값의 타입이 맞는가?

## 흔한 실수

### 배열 길이를 마지막 인덱스로 사용하기

`numbers.length`는 원소 개수이며 마지막 인덱스는 `numbers.length - 1`입니다. 순회 조건은 보통 `index < numbers.length`입니다.

### 정수 나눗셈 뒤에 형 변환하기

```java
double wrong = (double) (7 / 2);
```

괄호 안의 정수 나눗셈이 먼저 끝납니다. 소수 부분이 필요하면 나눗셈 전에 피연산자 타입을 바꿔야 합니다.

### 조건 경계를 말로만 확인하기

`>`와 `>=`는 경계값에서 결과가 달라집니다. 요구사항의 포함 여부를 확인하고 바로 아래·경계·바로 위 값을 각각 검토하세요.

## 확인 문제

1. `7 / 2`와 `7.0 / 2`는 어떤 타입의 연산인가요?
2. `index < values.length`가 배열 경계를 지키는 이유를 설명해 보세요.
3. 기본 `for`문과 향상된 `for`문을 각각 선택할 상황을 한 가지씩 적어 보세요.
4. `score > 60`과 `score >= 60`은 점수 `60`에서 어떻게 다른가요?
5. 빈 배열을 `countPositive`에 전달하면 어떤 흐름으로 반환 지점에 도달하는지 추적해 보세요.

## 공식 근거 자료

- [Java Language Specification SE 25 §10: 배열](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html)
- [Java Language Specification SE 25 §14: 블록과 문장](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html)
- [Java Language Specification SE 25 §15: 표현식과 연산자](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html)
