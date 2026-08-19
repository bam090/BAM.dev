# 05. 예외·디버깅

## 학습 목표

- 예외가 정상 흐름을 중단하고 호출자 쪽으로 전파될 수 있음을 설명할 수 있습니다.
- 검사 예외와 비검사 예외가 컴파일 단계에서 다르게 다뤄지는 이유를 이해합니다.
- `try`·`catch`와 `throws` 중 책임에 맞는 처리 방식을 선택할 수 있습니다.
- 컴파일 오류·런타임 예외·잘못된 결과를 구분해 재현 입력과 관찰 지점을 기록할 수 있습니다.

## 먼저 관찰하기

```java
static int parseLevel(String text) {
    try {
        return Integer.parseInt(text);
    } catch (NumberFormatException error) {
        return 1;
    }
}
```

1. 정상 흐름과 예외 흐름은 각각 어느 `return`에 도달하나요?
2. 어떤 입력에서 `Integer.parseInt`가 숫자를 만들지 못할 수 있나요?
3. `catch`가 모든 예외를 잡지 않고 `NumberFormatException`만 잡는 이유는 무엇일까요?
4. 잘못된 입력을 항상 기본값 `1`로 바꾸는 것이 제품 요구사항에 맞는지도 별도로 판단해 보세요.

## 예외는 정상 흐름과 다른 완료 방식

문장이나 표현식이 예외를 던지면 현재의 정상 실행 흐름은 중단됩니다. 일치하는 `catch`가 있으면 그 블록에서 처리하고, 없으면 호출한 쪽으로 전파될 수 있습니다.

```java
static int divide(int total, int count) {
    if (count == 0) {
        throw new IllegalArgumentException("개수는 0일 수 없습니다.");
    }
    return total / count;
}
```

예외는 조건문을 대신하는 평범한 분기 도구가 아닙니다. 호출자가 지켜야 할 계약을 위반했거나 정상 결과를 만들 수 없는 상황인지 먼저 판단하세요.

## 검사 예외와 비검사 예외

Java의 예외 클래스 중 `RuntimeException`과 그 하위 클래스는 비검사 예외입니다. `Error` 계열도 비검사 예외입니다. 그 밖의 예외 클래스는 검사 예외이며, 컴파일러가 `catch`로 처리하거나 `throws`로 선언하는지를 확인합니다.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

static String loadText(Path path) throws IOException {
    return Files.readString(path);
}
```

`Files.readString`은 I/O 오류에서 `IOException`을 던질 수 있습니다. 위 메서드는 복구 방법을 임의로 정하지 않고 호출자에게 가능성을 `throws`로 전달합니다.

호출 지점에서 사용자에게 다른 경로를 요청하는 등 복구 책임이 있다면 구체적으로 처리할 수 있습니다.

```java
static String loadOrExplain(Path path) {
    try {
        return Files.readString(path);
    } catch (IOException error) {
        return "파일을 읽을 수 없습니다: " + path;
    }
}
```

실제 서비스에서는 예외 원인을 로그나 상위 계층에 보존할지, 사용자에게 어떤 정보를 노출할지 별도 정책이 필요합니다. 비어 있는 `catch`로 오류를 숨기지 마세요.

## try·catch와 throws 선택 질문

다음 순서로 판단하세요.

1. 이 메서드가 예외 상황을 실제로 복구할 수 있는가?
2. 대체 값이 요구사항에 정의되어 있는가?
3. 더 높은 계층이 파일 경로, 재시도, 사용자 안내를 더 잘 결정할 수 있는가?
4. 잡는다면 가장 구체적으로 어떤 예외를 처리해야 하는가?

`catch (Exception error)`로 모든 문제를 한꺼번에 삼키면 프로그래밍 오류까지 정상 결과처럼 보일 수 있습니다.

## 디버깅은 문제 종류부터 나누기

### 1. 컴파일 오류

- 클래스 파일 생성 전에 발생합니다.
- 진단의 파일·줄·기대 타입과 실제 타입을 확인합니다.
- 첫 진단을 고친 뒤 다시 컴파일해 연쇄 오류가 줄었는지 봅니다.

### 2. 런타임 예외

- 컴파일된 프로그램 실행 중 발생합니다.
- 예외 타입과 메시지를 읽고, 스택 추적에서 자신의 코드가 처음 등장하는 호출 지점을 찾습니다.
- 같은 입력으로 재현하고 해당 줄 직전의 값과 객체 상태를 확인합니다.

### 3. 잘못된 결과

- 프로그램이 끝나도 요구한 결과와 다릅니다.
- 입력, 예상값, 실제 확인값을 기록하고 메서드 경계마다 중간 값을 좁힙니다.
- 아직 실행하지 않은 출력은 실제값으로 기록하지 않습니다.

## 최소 구현

문자열을 1 이상인 레벨로 변환하고, 형식이나 범위가 잘못되면 `-1`을 반환합니다.

```java
static int parsePositiveLevel(String text) {
    try {
        int level = Integer.parseInt(text);
        return level > 0 ? level : -1;
    } catch (NumberFormatException error) {
        return -1;
    }
}
```

테스트할 입력을 세 부류로 나누어 보세요.

- 정상: 양의 정수 문자열
- 경계: `"0"`, 음수 문자열
- 형식 오류: 빈 문자열, 글자가 섞인 문자열

각 입력의 예상값을 먼저 쓰고 실제 실행 결과와 비교하세요.

## 흔한 실수

- 예외를 잡고 아무 처리도 하지 않아 실패 원인을 없앱니다.
- 검사 예외를 무조건 `RuntimeException`으로 감싸기만 하고 책임 경계를 설명하지 않습니다.
- 스택 추적의 마지막 줄만 보고 실제로 예외가 시작된 자기 코드 위치를 놓칩니다.
- 재현 입력 없이 코드를 여러 곳 동시에 바꿉니다.
- 잘못된 결과를 런타임 예외와 같은 문제로 취급합니다.

## 확인 문제

1. 검사 예외와 비검사 예외는 컴파일러의 처리 요구에서 어떻게 다른가요?
2. `Files.readString`을 호출하는 메서드가 `throws IOException`을 선언하는 의미는 무엇인가요?
3. `catch`에서 대체 값을 반환하기 전에 확인해야 할 제품 요구사항은 무엇인가요?
4. 컴파일 오류·런타임 예외·잘못된 결과를 각각 어느 단계에서 관찰하나요?
5. 디버깅할 때 재현 입력과 예상값을 먼저 기록하는 이유를 설명해 보세요.

## 공식 근거 자료

- [Java Language Specification SE 25 §11: 예외](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html)
- [Java Language Specification SE 25 §14.20: try 문](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20)
- [Java SE 25 API: `RuntimeException`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html)
- [Java SE 25 API: `Files.readString`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#readString(java.nio.file.Path))
- [Java SE 25 API: `Integer.parseInt`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#parseInt(java.lang.String))
