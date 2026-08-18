# 01. 타입과 메서드 계약

## 학습 목표

- Java의 타입을 기본 타입과 참조 타입으로 나누어 각 역할을 설명할 수 있습니다.
- 변수 선언에서 타입이 값의 종류와 가능한 연산을 제한한다는 뜻을 설명할 수 있습니다.
- 메서드 선언에서 매개변수 타입과 반환 타입을 찾아 입력·출력 계약으로 읽을 수 있습니다.
- 메서드가 선언한 반환 타입과 실제로 반환하는 값이 맞는지 확인할 수 있습니다.

## 20분 학습 순서

1. 3분: 코드를 먼저 관찰하고 타입을 표시합니다.
2. 6분: 기본 타입과 참조 타입의 역할을 구분합니다.
3. 7분: 메서드의 매개변수·반환 타입을 계약으로 읽습니다.
4. 4분: 최소 코드를 손으로 바꾸고 확인 문제에 답합니다.

> 이 교안은 Java 콘텐츠 구조를 확인하기 위한 읽기·추론 샘플입니다. 현재 페이지에서 Java 코드를 실행하거나 채점하지 않습니다. 실행하지 않은 결과를 맞다고 가정하지 말고, 먼저 타입 관계를 설명해 보세요.

## 먼저 관찰하기

아래 코드의 주석을 가린다고 생각하고 세 질문에 답해 보세요.

```java
int score = 80;
boolean passed = true;
String learner = "Bam";
int[] recentScores = {70, 80};
```

1. 타입 이름은 각 줄의 어디에 있나요?
2. `int`, `boolean`, `String`, `int[]` 중 Java가 미리 정의한 기본 타입은 무엇일까요?
3. `String`과 `int[]` 변수에는 객체 자체가 들어간다고 설명해야 할까요, 객체를 가리키는 참조 값이 들어간다고 설명해야 할까요?

답을 바로 외우기보다 선언의 왼쪽 타입과 오른쪽 값을 짝지어 보세요.

## 기본 타입과 참조 타입

Java의 타입은 크게 **기본 타입(primitive type)**과 **참조 타입(reference type)**으로 나뉩니다.

### 기본 타입: 값 자체를 다루는 정해진 종류

기본 타입은 Java 언어가 미리 정의합니다.

- 정수 계열: `byte`, `short`, `int`, `long`, `char`
- 실수 계열: `float`, `double`
- 논리값: `boolean`

```java
int level = 1;
boolean completed = false;
```

`level`은 `int` 값, `completed`는 `boolean` 값을 담습니다. 타입은 변수가 가질 수 있는 값과 그 값에 허용되는 연산을 제한하여, 맞지 않는 사용을 컴파일 단계에서 찾는 데 도움을 줍니다.

### 참조 타입: 객체를 가리키는 참조 값을 다루는 종류

클래스 타입, 인터페이스 타입, 배열 타입은 참조 타입입니다. `String`은 클래스 타입이고 `int[]`는 배열 타입이므로 둘 다 참조 타입입니다.

```java
String courseName = "Java 입문";
int[] scores = {70, 80};
```

`courseName`과 `scores`에는 각각 객체를 가리키는 참조 값이 들어갑니다. 참조 타입 변수에는 `null`이 들어갈 수도 있으므로, 그 참조로 객체의 기능을 사용하기 전에 실제 객체를 가리키는지 확인해야 하는 상황이 있습니다.

기본 타입과 참조 타입의 차이를 단순히 “작은 값과 큰 값”으로 나누면 안 됩니다. 핵심은 변수가 **기본 값**을 담는지, 객체를 가리키는 **참조 값**을 담는지입니다.

## 메서드 선언을 입력·출력 계약으로 읽기

다음 메서드는 점수와 통과 여부를 받아 안내 문장을 만듭니다. 아직 실행하지 말고 선언부부터 읽어 보세요.

```java
static String makeResult(int score, boolean passed) {
    if (passed) {
        return score + "점: 통과";
    }

    return score + "점: 재도전";
}
```

선언부를 왼쪽부터 나누면 다음과 같습니다.

- `static`: 이 샘플에서는 객체를 만들지 않고 호출할 수 있게 하는 변경자입니다.
- `String`: 메서드가 호출한 곳에 돌려주기로 선언한 **반환 타입**입니다.
- `makeResult`: 메서드 이름입니다.
- `int score`: `int` 값을 받는 첫 번째 **매개변수**입니다.
- `boolean passed`: `boolean` 값을 받는 두 번째 **매개변수**입니다.

메서드를 호출할 때 전달하는 값은 인수입니다.

```java
String message = makeResult(80, true);
```

여기서 `80`과 `true`는 인수이고, 각각 선언된 `int`, `boolean` 매개변수에 대응합니다. 호출 결과를 받는 `message`의 타입도 메서드의 반환 타입인 `String`과 맞습니다.

이를 작은 계약으로 읽어 보세요.

```text
입력: int 값 하나, boolean 값 하나
출력: String 참조 값 하나
```

반환 타입이 `void`라면 결과 값을 돌려주지 않는 메서드입니다. 반환 타입이 `void`가 아니라면 메서드가 정상적으로 끝나는 경로에서는 선언한 타입과 맞는 값을 `return`해야 합니다.

## 단계별로 타입 오류 좁히기

아래 코드는 반환 타입과 반환 표현식의 타입이 맞지 않습니다.

```java
static int makeLabel(int score) {
    return score + "점";
}
```

정답을 먼저 고치지 말고 다음 순서로 관찰하세요.

1. 선언된 반환 타입에 밑줄을 긋습니다: `int`
2. `return` 뒤 표현식이 만드는 값의 종류를 말합니다: 문자열 연결 결과
3. 두 타입이 같은지 비교합니다: `int`와 `String`은 다름
4. 요구사항을 정합니다: 점수가 붙은 문장을 돌려주려는가, 숫자만 돌려주려는가?
5. 요구사항이 문장 반환이라면 반환 타입을 `String`으로 바꿉니다.

```java
static String makeLabel(int score) {
    return score + "점";
}
```

컴파일 오류를 만났을 때 강제로 형 변환부터 시도하지 마세요. 먼저 매개변수 타입, 반환 타입, 실제 인수와 `return` 표현식의 타입을 차례로 비교하면 계약이 어긋난 지점을 좁힐 수 있습니다.

## 최소 코드 연습

다음 메서드의 빈칸에 들어갈 타입을 먼저 말로 설명한 뒤 작성해 보세요.

```java
static _____ isAdult(int age) {
    return age >= 19;
}
```

관찰 힌트:

1. 매개변수 `age`는 어떤 타입인가요?
2. 비교식 `age >= 19`가 만드는 값은 숫자인가요, 참·거짓인가요?
3. 그렇다면 반환 타입은 어떤 기본 타입이어야 하나요?

## 확인 문제

1. `int`, `boolean`, `String`, `int[]`를 기본 타입과 참조 타입으로 나누어 보세요.
2. 참조 타입 변수가 객체 자체가 아니라 참조 값을 담는다는 말을 자신의 표현으로 설명해 보세요.
3. `static String makeResult(int score, boolean passed)`에서 매개변수 타입 두 개와 반환 타입을 찾아보세요.
4. `makeResult("80", true)`가 선언된 입력 계약과 맞는지, 첫 번째 인수와 매개변수의 타입을 비교해 설명해 보세요.
5. `return age >= 19;`를 사용하는 메서드의 반환 타입을 고르고, 그렇게 판단한 관찰 근거를 말해 보세요.

## 공식 근거 자료

- [Java Language Specification SE 26 §4.1: 타입과 값의 종류](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html#jls-4.1)
- [Java Language Specification SE 26 §4.2: 기본 타입과 값](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html#jls-4.2)
- [Java Language Specification SE 26 §4.3: 참조 타입과 값](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html#jls-4.3)
- [Java Language Specification SE 26 §8.4.1: 형식 매개변수](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.4.1)
- [Java Language Specification SE 26 §8.4.5: 메서드 결과](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.4.5)
