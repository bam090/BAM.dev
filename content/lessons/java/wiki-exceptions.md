# 예외 처리와 자원 정리

## 학습 목표

- 검사 예외와 비검사 예외를 구분하고 try·catch·throw·throws의 역할을 나눌 수 있습니다.
- 실패를 복구할 책임과 정보가 있는 곳에서 처리하고 그렇지 않으면 원인을 남겨 호출자에게 전달할 수 있습니다.
- try-with-resources로 자원을 닫는 순서와 본문 실패·닫기 실패가 함께 생겼을 때 남는 예외를 설명할 수 있습니다.

## 먼저 확인할 개념

[메서드의 입력·출력 계약](#/learn/java/wiki-methods)과 [상속·인터페이스·조합: 타입 관계 고르기](#/learn/java/wiki-inheritance-dispatch)를 먼저 확인해 보세요.

## 예외란

예외(exception)는 지금의 정상 흐름을 계속할 수 없다고 알리는 객체입니다.
앞 문서에서는 메서드가 반환 타입으로 결과를 약속하는 모습을 보았습니다.
그런데 약속한 결과를 만들 수 없는 경우도 있습니다.

예를 들어 학습 기록 파일을 읽어 진행률을 화면에 보여 준다고 해 보겠습니다.
파일이 없을 수도 있고 기록 안의 진행률이 숫자가 아닐 수도 있습니다.
이때 빈 문자열이나 `0`을 정상 결과처럼 돌려주면 호출한 코드는 실패를 알아차리지 못하고 잘못된 화면을 만듭니다.
이 문서는 이 학습 기록 읽기 하나로 예외의 종류·처리와 전달·자원 정리를 차례로 살펴봅니다.

예외가 발생하면 그다음 문장을 건너뛰고 그 예외를 처리할 수 있는 `catch`를 호출 흐름에서 찾습니다.

```text
화면 표시 → 기록 읽기 → 숫자 변환
                         ↓ 실패
화면 표시 ← 예외 전달 ← 예외 발생
```

알맞은 `catch`를 찾으면 그 블록을 실행합니다.
예외가 발생한 문장으로 돌아가서 자동으로 다시 시도하지는 않습니다.

## 예외의 종류

Java에서 던질 수 있는 객체는 모두 `Throwable`의 하위 타입입니다.
처음에는 다음 세 갈래를 구분하면 됩니다.

```text
Throwable
├─ Error
└─ Exception
   ├─ RuntimeException
   └─ 그 밖의 Exception 하위 타입
```

| 구분 | 뜻 | 호출하는 코드의 의무 |
| --- | --- | --- |
| 검사 예외(checked exception) | `RuntimeException`과 `Error` 계열이 아닌 예외 | `catch`로 처리하거나 `throws`로 전달한다고 선언해야 합니다 |
| 비검사 예외(unchecked exception) | `RuntimeException`과 `Error`의 하위 타입 | 컴파일러가 처리나 전달 선언을 강제하지 않습니다 |
| `Error` | JVM이나 실행 환경의 심각한 문제를 나타내는 경우가 많습니다 | 일반 애플리케이션에서 넓게 잡아 평소 복구 대상으로 삼지 않습니다 |

`IOException`은 파일 읽기처럼 호출자가 다른 파일을 고르거나 사용자에게 실패를 알릴 수 있는 곳에서 자주 만나는 검사 예외입니다.
`IllegalArgumentException`은 메서드가 약속한 범위에 맞지 않는 인수를 받았음을 나타내는 비검사 예외입니다.
검사 여부는 실패가 얼마나 심각한지를 매기는 등급이 아닙니다.
호출자가 처리나 전달을 컴파일할 때 명시해야 하는지의 차이입니다.

---

## 예외 처리와 전달

예외를 다루는 문법은 네 가지입니다.

| 문법 | 하는 일 |
| --- | --- |
| `try` | 실패할 수 있는 정상 작업을 시도합니다 |
| `catch` | 지정한 타입의 예외를 받아 실제 복구나 실패 응답으로 바꿉니다 |
| `throw` | 예외 객체 하나를 지금 던집니다 |
| `throws` | 메서드가 호출자에게 전달할 수 있는 검사 예외 등을 선언합니다 |

다음 메서드는 클래스 안에 선언합니다.
`requirePositive(3)`과 `requirePositive(0)`이 각각 어떻게 끝날지 예상해 보세요.

```java
static int requirePositive(int value) {
    if (value <= 0) {
        throw new IllegalArgumentException("양수만 사용할 수 있습니다.");
    }
    return value;
}
```

`requirePositive(3)`은 `3`을 반환합니다.
`requirePositive(0)`은 값을 반환하는 대신 `IllegalArgumentException`을 던집니다.
`throw`는 실행 흐름을 실제로 바꾸기 때문입니다.
반면 메서드 선언의 `throws IOException`은 전달할 수 있다는 계약을 보여 줄 뿐 그 자체로 예외를 만들지 않습니다.
그래서 `throws IOException`으로 선언된 메서드를 부르는 쪽은 그 예외를 `catch`하거나 자신도 `throws IOException`을 선언해야 컴파일됩니다.

여러 `catch`가 필요하면 더 구체적인 하위 타입을 먼저 둡니다.
`Exception`을 먼저 잡으면 뒤의 구체적인 예외도 이미 잡힌 셈이 되어 컴파일되지 않거나 서로 다른 복구 방법이 한곳에 섞입니다.

그렇다면 예외는 어디에서 잡아야 할까요?
기준은 그 자리에서 실제로 무엇을 할 수 있느냐입니다.

- 다른 입력을 요청하거나 대체 값을 정할 수 있으면 현재 위치에서 처리합니다.
- 실패 이유를 화면의 오류 응답으로 바꿀 책임이 있으면 현재 위치에서 처리합니다.
- 필요한 정보나 책임이 없으면 원인을 남긴 채 호출자에게 전달합니다.

다음 빈 `catch`는 실패를 해결하지 못합니다.

```java
try {
    Integer.parseInt("숫자 아님");
} catch (Exception error) {
    // 실패 사실과 원인을 모두 숨긴다.
}
```

이 블록은 실패 사실과 원인을 모두 숨깁니다.
오류를 출력만 하고 성공한 것처럼 다음 처리를 이어 가는 것도 같은 문제를 만듭니다.
처리했다면 쓸 수 있는 대체 결과를 만들고 처리하지 못했다면 실패가 위로 전달되게 합니다.

표준 예외만으로 호출자가 실패를 구분하기 어렵다면 뜻이 드러나는 이름의 예외를 만들 수 있습니다.

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

진행률 변환에서 생긴 `NumberFormatException`을 학습 기록의 형식 오류로 바꿀 때는 원래 예외를 `cause`로 넣습니다.
예를 들어 `catch` 안에서 `throw new InvalidStudyRecordException("진행률 형식 오류", cause);`처럼 던집니다.
그러면 원래 예외의 타입과 스택 트레이스가 보존됩니다.
스택 트레이스(stack trace)는 예외가 어느 메서드들을 거쳐 전달됐는지 보여 주는 호출 경로 기록입니다.
원래 메시지만 새 문자열에 붙이고 예외 객체를 버리면 이 정보를 잃습니다.

기존 표준 예외가 뜻을 충분히 나타낸다면 새 타입을 만들 필요는 없습니다.
사용자 정의 예외는 호출자가 따로 구분해야 하는 실패를 표현할 때 씁니다.

학습 기록을 읽다가 실패하면 원인은 이렇게 전달할 수 있습니다.
그런데 실패한 순간 열어 둔 파일은 누가 닫아야 할까요?

---

## try-with-resources 사용법

try-with-resources는 `try` 괄호 안에서 준비한 자원을 블록이 끝날 때 자동으로 닫는 문법입니다.
파일이나 연결을 닫는 일을 가비지 컬렉션에 맡기면 필요한 때 바로 닫힌다는 보장이 없습니다.
`AutoCloseable`을 구현한 자원은 try-with-resources가 정상 종료와 예외 종료 모두에서 `close()`를 호출합니다.

실제 학습 기록 파일을 읽을 때는 `Path`가 파일 위치를 나타내고 `Files`가 읽기·쓰기를 맡으며 `StandardCharsets.UTF_8`이 바이트를 문자로 해석하는 규칙을 맡습니다.
여기서는 파일을 만들지 않고 닫는 순서만 보이는 작은 자원으로 확인합니다.

```java
final class TraceResource implements AutoCloseable {
    private final String name;

    TraceResource(String name) {
        this.name = name;
    }

    @Override
    public void close() {
        System.out.println(name + " 닫기");
    }
}

public class ResourceDemo {
    public static void main(String[] args) {
        try (TraceResource first = new TraceResource("첫째");
             TraceResource second = new TraceResource("둘째")) {
            System.out.println("사용");
        }
    }
}
```

출력 순서를 예상해 보세요.

```text
사용
둘째 닫기
첫째 닫기
```

자원을 여러 개 선언하면 선언한 순서의 반대로 닫습니다.
두 번째 자원을 준비하다 실패했다면 이미 준비된 첫 번째 자원만 닫고 준비되지 않은 자원에는 `close()`를 호출하지 않습니다.

본문과 `close()`가 함께 실패하면 어떤 예외가 남을까요?
본문에서 생긴 예외가 주 예외로 전달됩니다.
닫는 중에 생긴 예외는 주 예외 안에 억제된 예외(suppressed exception)로 보존되며 `getSuppressed()`로 확인할 수 있습니다.
예를 들어 본문이 `IllegalArgumentException`을 던지고 `close()`가 `IllegalStateException`을 던지면 바깥에서 잡은 예외는 `IllegalArgumentException`이고 그 suppressed 목록에 `IllegalStateException`이 있습니다.

> [!note]- finally는 언제 쓰나요?
> `finally`는 잠금 해제나 임시 상태 복구처럼 반드시 해야 하지만 try-with-resources로 표현할 수 없는 정리에 씁니다.
> `finally`에서 `return`하거나 새 예외를 던지면 앞의 반환값이나 원래 예외를 가릴 수 있으므로 정리 작업만 둡니다.
> JVM이나 프로세스가 강제로 끝나는 상황까지 `finally`와 `close()` 실행이 보장되지는 않습니다.
> 그래서 중요한 데이터를 안전하게 저장하는 문제와 자원을 닫는 문제는 따로 다룹니다.

## 정리

- 검사 예외는 `catch`하거나 `throws`로 선언해야 하고 `throw`는 예외를 실제로 던지며 `throws`는 전달 계약을 선언합니다.
- 복구할 정보와 책임이 있는 곳에서 처리하고 그렇지 않으면 `cause`로 원인을 남겨 전달하며 빈 `catch`로 실패를 숨기지 않습니다.
- try-with-resources는 준비된 자원만 역순으로 닫고 본문과 닫기가 함께 실패하면 본문 예외가 주 예외이고 닫기 예외는 suppressed로 남습니다.

## 이어서 연습하기

아래 객관식 문제에서 예외를 처리하거나 전달한 이유와 자원이 닫히는 순서를 확인해 보세요.

다음 개념: [람다와 Stream: 동작을 전달해 값 처리하기](#/learn/java/wiki-lambdas)

## 공식 자료

- [Java Language Specification SE 25 — Exceptions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html)
- [Java Language Specification SE 25 — The try Statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20)
- [Java SE 25 API — Files](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html)

## 핵심 질문 답

복구할 입력이나 책임이 있는 곳에서 `catch`하고 그렇지 않으면 원인을 남겨 호출자에게 전달합니다.
검사 예외는 처리하거나 `throws`로 선언해야 하지만 검사 여부가 심각도 순위는 아니며 `throw`는 실제 예외를 던지고 `throws`는 전달 계약을 선언합니다.
예외를 다른 의미로 감쌀 때는 `cause`에 원래 예외를 남기고 빈 `catch`나 성공 값으로 실패를 숨기지 않습니다.
`AutoCloseable` 자원은 try-with-resources에서 준비된 것만 역순으로 닫히고 본문과 `close()`가 함께 실패하면 본문 예외가 주 예외이며 닫기 예외는 suppressed로 남습니다.
