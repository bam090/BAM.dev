# ExecutorService와 Future로 작업 결과 모으기

## 학습 목표

작업·스레드·executor·Future의 역할을 나누고 완료된 결과를 한 곳에서 합칠 수 있습니다.

## 한줄 요약

작업이 결과를 반환하고 호출자가 완료를 확인해 합치면 불필요한 공유 갱신을 줄일 수 있습니다.

## 먼저 확인할 개념

[동시성: 공유 상태의 원자성·가시성·순서](#/learn/java/wiki-shared-state) · [람다와 함수형 인터페이스](#/learn/java/wiki-lambdas) · [예외 처리와 전달](#/learn/java/wiki-exceptions) · [try-with-resources: 자원 종료와 예외 보존](#/learn/java/wiki-resources)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 작업과 스레드와 실행 담당자를 나눈다

동시에 처리하는 코드를 읽을 때는 다음 세 역할을 나누면 흐름이 쉬워진다.

| 이름 | 쉬운 뜻 | Java의 대표 표현 |
| --- | --- | --- |
| 작업(task) | 해야 할 일 한 묶음 | `Runnable`, `Callable` |
| 스레드(thread) | 명령을 차례로 실행하는 흐름 | `Thread` |
| 실행 담당자(executor) | 제출된 작업을 어떤 스레드에서 실행할지 관리하는 객체 | `ExecutorService` |

`Runnable`은 반환값 없는 작업을 나타내고, `Callable<T>`는 작업이 끝나면 `T` 타입 결과를 돌려주며 검사 예외도 던질 수 있다.

동시성(concurrency)은 여러 작업이 진행되는 시간이 겹치도록 다루는 방식이다.
병렬성(parallelism)은 여러 작업이 실제 같은 순간에 서로 다른 실행 자원을 사용해 계산되는 경우다.

동시성 프로그램이라고 모든 문장이 실제 같은 순간에 실행되는 것은 아니다.
CPU(중앙 처리 장치) 수, 작업 종류, 실행 환경에 따라 한 스레드씩 번갈아 진행할 수도 있고 여러 스레드가 병렬로 진행할 수도 있다.

## happens-before는 보이는 순서를 정한다

happens-before는 Java 메모리 모델이 두 동작의 가시성과 순서를 설명하는 관계다.
동작 A가 동작 B보다 happens-before라면 B는 A가 남긴 메모리 효과를 명세가 정한 방식으로 볼 수 있다.
`Future<T>`는 제출한 작업이 나중에 돌려줄 `T` 타입 결과를 나타내며, `get()`은 그 작업이 정상적으로 끝나면 결과를 돌려준다.
작업 실패·취소 또는 기다리는 스레드의 중단이 발생하면 결과 대신 그 상황을 나타내는 예외를 던질 수 있다.

처음에는 다음 규칙을 기준으로 읽으면 된다.

- 한 스레드 안에서는 앞선 동작이 뒤의 동작보다 happens-before다.
- 같은 객체의 잠금을 푸는 동작은 나중에 그 잠금을 얻는 동작보다 happens-before다.
- `volatile` 변수에 쓰는 동작은 다른 스레드가 같은 변수를 뒤이어 읽는 동작보다 happens-before다.
- `Thread.start()`를 호출하기 전의 동작은 시작된 스레드의 동작보다 happens-before다.
- 스레드의 모든 동작은 다른 스레드가 해당 스레드의 `join()`을 성공적으로 마친 뒤의 동작보다 happens-before다.
- 실행 담당자에게 작업을 제출하기 전의 동작은 그 작업의 동작보다 앞서며, 작업의 동작은 해당 `Future.get()` 뒤의 동작보다 앞선다.

A가 B보다 앞서고 B가 C보다 앞서면 A도 C보다 happens-before다.
이 연결 덕분에 작업을 제출하기 전에 준비한 값과 `Future.get()`으로 받은 결과를 안전하게 이어서 사용할 수 있다.

`Thread.sleep()`은 현재 스레드를 잠시 쉬게 할 뿐 이런 관계를 만들지 않는다.
기다린 시간이 충분해 보인다는 이유로 공유 값이 보이거나 작업이 끝났다고 판단해서는 안 된다.

## 가장 먼저 공유 변경을 줄인다

공유 값을 잘 잠그는 것보다 각 작업이 자기 값만 계산하게 만들 수 있는지 먼저 본다.
다음 예제에서는 각 작업이 완료 결과 `1`을 반환하고, `main` 스레드만 결과를 합친다.
여기서 사용하는 `newVirtualThreadPerTaskExecutor()`는 제출한 작업마다 가상 스레드 하나를 시작하며, 가상 스레드의 목적과 한계는 뒤에서 다시 살펴본다.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class CompletedLessonCounter {
    public static void main(String[] args) throws Exception {
        List<Future<Integer>> results = new ArrayList<>();

        try (ExecutorService executor =
                     Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 100; i++) {
                results.add(executor.submit(() -> {
                    Thread.sleep(10);
                    return 1;
                }));
            }

            int completed = 0;

            for (Future<Integer> result : results) {
                completed += result.get();
            }

            System.out.println("완료 작업: " + completed);
        }
    }
}
```

코드의 흐름으로 예상하는 결과는 다음과 같다.

```text
완료 작업: 100
```

각 작업은 공유된 `completed`를 고치지 않고 자신의 결과만 반환한다.
이 예제의 `result.get()`은 정상 완료된 작업의 결과를 돌려주며, 작업 안의 동작이 `get()` 뒤의 계산에 보이도록 연결한다.

예제의 `sleep()`은 서버 응답처럼 기다리는 시간을 작게 흉내 낸 것일 뿐 동기화에 사용한 것이 아니다.
작업 완료 확인은 시간이 아니라 `Future.get()`이 맡는다.

## 가상 스레드는 기다리는 작업을 많이 다룬다

가상 스레드(virtual thread)는 Java의 `Thread`이지만 운영체제 스레드보다 훨씬 적은 비용으로 많은 수를 사용할 수 있게 만든 구현이다.
주로 네트워크나 파일 응답을 기다리는 작업이 많을 때, 한 요청을 익숙한 순차 코드로 표현하면서 처리량을 높이는 데 알맞다.

`Executors.newVirtualThreadPerTaskExecutor()`는 제출한 작업마다 새 가상 스레드를 시작한다.
가상 스레드는 값비싼 자원을 아끼려고 작은 수만 만들어 돌려 쓰는 대상이 아니므로 일반적인 스레드 풀처럼 묶어 둘 필요가 없다.

가상 스레드가 한 계산을 더 빠르게 만드는 것은 아니다.
오래 계산만 하는 CPU 중심 작업은 사용할 수 있는 CPU 수의 제한을 그대로 받고, 가상 스레드를 많이 만든다고 계산 능력이 늘지 않는다.

가상 스레드도 같은 Java 메모리 모델을 따른다.
여러 가상 스레드가 같은 가변 값을 잘못 갱신하면 플랫폼 스레드와 똑같이 경쟁 상태가 생긴다.

## 이어서 연습하기

[공개 계약에서 테스트 조건 찾기](#/learn/java/wiki-test-contracts)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java Language Specification SE 25 — Threads and Locks](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html)
- [Java SE 25 API — java.util.concurrent](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html)
- [Oracle Java SE 25 — Virtual Threads](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html)

## 핵심 질문 답

Runnable은 반환 없는 작업, Callable은 결과와 검사 예외를 전달할 수 있는 작업이며 executor가 실행을 맡고 Future가 결과를 나타냅니다. 각 작업이 자기 결과를 반환하게 하고 호출자가 Future.get의 정상 완료 뒤 합치면 공유 갱신을 줄일 수 있습니다. 실패·취소·중단은 별도로 처리합니다. 가상 스레드는 많은 대기 중심 작업에 유용하지만 한 CPU 계산을 자동으로 빠르게 하거나 데이터 경쟁을 없애지는 않습니다.
