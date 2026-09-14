# try-with-resources: 자원 종료와 예외 보존

## 학습 목표

정상·예외 종료에서 자원을 닫고 여러 실패가 생겼을 때 남는 원인을 구분할 수 있습니다.

## 한줄 요약

try-with-resources는 준비된 자원을 역순으로 닫고 본문 실패와 닫기 실패를 구분해 보존합니다.

## 먼저 확인할 개념

[예외 처리와 전달](#/learn/java/wiki-exceptions) · [추상 클래스와 인터페이스의 역할](#/learn/java/wiki-abstract-interfaces)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 사용이 끝나는 시점에 닫기

파일이나 연결의 종료를 가비지 컬렉션 시점에 맡기면 필요한 때 바로 닫힌다는 보장이 없다.
AutoCloseable을 구현한 자원은 try-with-resources가 정상·예외 종료에서 close를 호출한다.

다음은 외부 파일을 만들지 않고 닫는 순서를 읽는 자립 예제다.

```java
final class TraceResource implements AutoCloseable {
    private final String name;
    TraceResource(String name) { this.name = name; }
    public void close() { System.out.println(name + " 닫기"); }
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

본문의 사용 뒤 둘째, 첫째의 역순으로 닫는다.
파일 문자 읽기로 확장하면 Path는 위치, Files는 읽기·쓰기, StandardCharsets.UTF_8은 바이트와 문자의 해석 규칙을 맡는다.
이 문서에서는 파일 I/O 실행 대신 위 작은 자원의 종료 계약을 읽는다.


## 여러 자원과 여러 실패가 겹칠 때

try-with-resources에 자원을 여러 개 선언하면 선언한 순서의 반대로 닫는다.
두 번째 자원을 준비하다 실패했다면 이미 준비된 첫 번째 자원은 닫지만, 준비되지 않은 자원에 `close()`를 호출하지는 않는다.

본문에서 예외가 발생하고 `close()`에서도 예외가 발생하면 본문 예외가 주 예외로 전달된다.
닫는 중의 예외는 주 예외 안에 억제된 예외(suppressed exception)로 보존되며 `getSuppressed()`로 확인할 수 있다.

`finally`는 잠금 해제나 임시 상태 복구처럼 반드시 해야 하지만 try-with-resources로 표현할 수 없는 정리에 사용할 수 있다.
다만 `finally`에서 `return`하거나 새 예외를 던지면 앞의 반환값이나 원래 예외를 가릴 수 있으므로 정리 작업에만 집중한다.

JVM이나 프로세스가 강제로 끝나는 모든 상황까지 `finally`와 `close()` 실행을 보장하는 것은 아니다.
따라서 중요한 데이터를 안전하게 저장하는 문제와 자원을 닫는 문제를 같은 것으로 보지 않는다.

## 이어서 연습하기

[람다와 함수형 인터페이스](#/learn/java/wiki-lambdas)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Exceptions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html)
- [Java Language Specification SE 25 — The try Statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20)
- [Java SE 25 API — Files](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html)

## 핵심 질문 답

AutoCloseable 자원은 try-with-resources에서 성공적으로 준비된 것만 역순으로 닫습니다. 본문과 close가 함께 실패하면 본문 오류가 주 예외이고 닫기 오류는 suppressed로 남습니다. 초기화가 실패한 자원 자체는 닫지 않습니다. finally의 return이나 throw는 앞의 결과를 덮을 수 있으므로 마무리에만 사용하고 프로세스 강제 종료까지 정리 실행을 보장하지는 않습니다.
