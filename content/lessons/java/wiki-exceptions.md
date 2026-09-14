# 예외 처리와 전달

## 학습 목표

실패를 복구할 책임과 정보를 보고 처리·전달·원인 보존을 결정할 수 있습니다.

## 한줄 요약

예외는 정상 흐름의 중단을 알리며 처리할 수 없다면 성공 값으로 숨기지 않고 원인을 전달합니다.

## 먼저 확인할 개념

[메서드 계약](#/learn/java/wiki-methods) · [상속과 실제 객체의 메서드](#/learn/java/wiki-inheritance-dispatch)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 실패를 성공처럼 넘기면 문제가 커진다

학습 기록 파일이 없거나 기록 안의 진행률이 숫자가 아닐 수 있다.
이때 빈 문자열이나 `0`을 정상 결과처럼 돌려주면 호출한 코드는 실패를 알아차리지 못하고 잘못된 화면을 만들 수 있다.

Java의 예외(exception)는 `지금의 정상 흐름을 계속할 수 없다`고 알리는 객체다.
예외가 발생하면 그다음 문장을 건너뛰고, 해당 예외를 처리할 수 있는 `catch`를 호출 흐름에서 찾는다.

```text
화면 표시 → 기록 읽기 → 숫자 변환
                         ↓ 실패
화면 표시 ← 예외 전달 ← 예외 발생
```

알맞은 `catch`를 찾으면 그 블록을 실행한다.
예외가 발생한 문장으로 돌아가서 자동으로 다시 시도하는 것은 아니다.

## 검사 예외와 비검사 예외

Java에서 던질 수 있는 객체는 `Throwable`의 하위 타입이다.
처음에는 다음 세 갈래를 구분하면 된다.

```text
Throwable
├─ Error
└─ Exception
   ├─ RuntimeException
   └─ 그 밖의 Exception 하위 타입
```

| 구분 | 뜻 | 호출하는 코드의 의무 |
| --- | --- | --- |
| 검사 예외(checked exception) | `RuntimeException`과 `Error` 계열이 아닌 예외 | `catch`로 처리하거나 `throws`로 전달한다고 선언해야 한다. |
| 비검사 예외(unchecked exception) | `RuntimeException`과 `Error`의 하위 타입 | 컴파일러가 처리나 전달 선언을 강제하지 않는다. |
| `Error` | JVM이나 실행 환경의 심각한 문제를 나타내는 경우가 많다. | 일반 애플리케이션에서 넓게 잡아 평소 복구 대상으로 삼지 않는다. |

`IOException`은 파일을 읽는 작업처럼 호출자가 다른 파일을 고르거나 사용자에게 실패를 알릴 수 있는 경계에서 자주 만나는 검사 예외다.
`IllegalArgumentException`은 메서드가 약속한 범위에 맞지 않는 인수를 받았음을 나타내는 비검사 예외다.

검사 여부는 실패가 더 심각한지를 매기는 등급이 아니다.
호출자가 처리 또는 전달을 컴파일할 때 명시해야 하는지의 차이다.

## 네 문법의 역할을 나눈다

| 문법 | 하는 일 |
| --- | --- |
| `try` | 실패할 수 있는 정상 작업을 시도한다. |
| `catch` | 지정한 타입의 예외를 받아 실제 복구나 실패 응답으로 바꾼다. |
| `throw` | 예외 객체 하나를 지금 던진다. |
| `throws` | 메서드가 호출자에게 전달할 수 있는 검사 예외 등을 선언한다. |

다음 메서드는 클래스 안에 선언한다. `requirePositive(3)`은 `3`을 반환하고, `requirePositive(0)`은 값을 반환하는 대신 예외를 던진다.

```java
static int requirePositive(int value) {
    if (value <= 0) {
        throw new IllegalArgumentException("양수만 사용할 수 있습니다.");
    }
    return value;
}
```

`throw`는 실행 흐름을 실제로 바꾼다.
반면 `throws IOException`은 메서드의 계약을 보여 줄 뿐 그 문장 자체가 예외를 만들지는 않는다.

여러 `catch`가 필요하면 더 구체적인 하위 타입을 먼저 둔다.
`Exception`을 먼저 잡으면 뒤의 구체적인 예외도 이미 잡힌 셈이 되어 컴파일할 수 없거나, 서로 다른 복구 방법을 한곳에 섞게 된다.

## 처리할 곳과 전달할 곳을 고른다

예외를 잡을지는 `여기서 실제로 무엇을 할 수 있는가`로 판단한다.

- 다른 입력을 요청하거나 대체 값을 정할 수 있으면 현재 위치에서 처리한다.
- 실패 이유를 화면의 오류 응답으로 바꿀 책임이 있으면 현재 위치에서 처리한다.
- 필요한 정보나 책임이 없으면 원인을 숨기지 말고 호출자에게 전달한다.

다음과 같은 빈 `catch`는 실패를 해결하지 않는다.
이 블록은 `main` 같은 메서드 안에 놓는 예제다.

```java
try {
    Integer.parseInt("숫자 아님");
} catch (Exception error) {
    // 실패 사실과 원인을 모두 숨긴다.
}
```

오류를 출력하기만 한 뒤 성공한 것처럼 다음 처리를 이어 가는 것도 위험하다.
처리했다면 사용할 수 있는 대체 결과를 만들고, 처리하지 못했다면 실패가 위로 전달되게 해야 한다.

## 사용자 정의 예외에는 프로그램의 뜻을 담는다

표준 예외만으로 호출자가 실패를 구분하기 어렵다면 의미 있는 이름의 예외를 만들 수 있다.

```java
final class InvalidStudyRecordException extends IllegalArgumentException {
    InvalidStudyRecordException(String message) {
        super(message);
    }

    InvalidStudyRecordException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

숫자 변환에서 생긴 `NumberFormatException`을 학습 기록의 형식 오류로 바꿀 때 원래 예외를 `cause`로 넣으면 실패 지점과 호출 경로가 보존된다.
스택 트레이스(stack trace)는 예외가 어느 메서드들을 거쳐 전달됐는지 보여 주는 호출 경로 기록이다.
원래 메시지만 새 문자열에 붙이고 예외 객체를 버리면 타입과 스택 트레이스 정보를 잃는다.

기존 표준 예외가 뜻을 충분히 나타낸다면 새 타입을 만들 필요는 없다.
사용자 정의 예외는 이름을 늘리기 위한 문법이 아니라 호출자가 따로 구분할 실패를 표현하는 도구다.

## 이어서 연습하기

[try-with-resources: 자원 종료와 예외 보존](#/learn/java/wiki-resources)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Exceptions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html)
- [Java Language Specification SE 25 — The try Statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20)
- [Java SE 25 API — Files](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html)

## 핵심 질문 답

복구할 입력이나 책임이 있는 경계에서 catch하고 그렇지 않으면 호출자에게 원인을 전달합니다. 검사 예외는 처리하거나 throws로 선언해야 하지만 검사 여부가 심각도 순위는 아닙니다. throw는 실제 예외를 던지고 throws는 전달 계약을 선언합니다. 오류를 다른 의미로 감쌀 때 cause에 원래 예외를 남기며 빈 catch나 성공값으로 실패를 숨기지 않습니다.
