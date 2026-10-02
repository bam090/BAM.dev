# 동시성: 공유 상태와 작업 결과 모으기

## 학습 목표

- 공유 값을 읽고 계산하고 쓰는 갱신에서 경쟁 상태를 찾고 원자성·가시성·순서를 구분할 수 있습니다.
- 보호할 범위에 맞게 불변 값·synchronized·원자 변수·volatile·스레드 안전 컬렉션을 고를 수 있습니다.
- happens-before 관계로 다른 스레드의 결과가 언제 보이는지 설명할 수 있습니다.
- 작업이 결과를 반환하게 하고 ExecutorService와 Future로 완료된 결과를 한 곳에서 모으며 가상 스레드가 맞는 작업을 고를 수 있습니다.

## 먼저 확인할 개념

[final과 불변 객체](#/learn/java/wiki-final-immutability)와 [람다와 Stream: 동작을 전달해 값 처리하기](#/learn/java/wiki-lambdas)를 먼저 확인해 보세요.
[예외 처리와 자원 정리](#/learn/java/wiki-exceptions)의 try-with-resources도 예제에서 다시 쓰입니다.

## 동시성이란

동시성(concurrency)은 여러 작업이 진행되는 시간이 겹치도록 다루는 방식입니다.
앞 문서에서는 Stream이 바깥 상태를 바꾸면 병렬 처리에서 위험하다는 것을 보았습니다.
이번에는 여러 작업이 같은 값을 다룰 때 무엇을 지켜야 하는지 살펴봅니다.

동시성과 비슷한 말로 병렬성(parallelism)이 있습니다.
병렬성은 여러 작업이 실제로 같은 순간에 서로 다른 실행 자원에서 계산되는 경우입니다.
동시성 프로그램이라고 모든 문장이 같은 순간에 실행되지는 않습니다.
CPU(중앙 처리 장치) 수와 작업 종류와 실행 환경에 따라 한 스레드씩 번갈아 진행할 수도 있고 여러 스레드가 병렬로 진행할 수도 있습니다.

예를 들어 학습 작업 100개를 동시에 처리하고 마친 작업의 수를 센다고 해 보겠습니다.
이 문서는 이 완료 횟수 세기 하나로 공유 상태의 위험과 보장 그리고 결과를 안전하게 모으는 방법을 차례로 살펴봅니다.

## 공유 상태와 경쟁 상태

두 작업이 한 장부의 완료 횟수를 동시에 올린다고 생각해 보겠습니다.
코드에는 `count++` 한 줄만 보여도 실제로는 값을 읽고 1을 더하고 결과를 쓰는 과정이 필요합니다.
두 작업이 다음 순서로 끼어들면 마지막 `count`는 무엇일지 예상해 보세요.

| 순서 | 작업 A | 작업 B | 공유된 `count` |
| --- | --- | --- | --- |
| 시작 |  |  | `0` |
| 1 | `0`을 읽습니다 |  | `0` |
| 2 |  | `0`을 읽습니다 | `0` |
| 3 | `1`을 씁니다 |  | `1` |
| 4 |  | `1`을 씁니다 | `1` |

두 작업이 모두 증가했지만 `count`는 `1`입니다.
두 작업이 같은 이전 값 `0`으로 계산했고 B의 쓰기가 A의 갱신을 덮었기 때문입니다.

이처럼 여러 작업이 함께 읽고 쓰는 바뀔 수 있는 값을 공유 가변 상태(shared mutable state)라고 합니다.
실행 순서에 따라 결과의 옳고 그름이 달라지는 문제를 경쟁 상태(race condition)라고 합니다.
그중 서로 다른 스레드가 같은 변수에 충돌하게 접근하고 적어도 하나가 쓰기이며 두 접근이 happens-before 관계로 정렬되지 않은 경우를 Java 언어 명세는 데이터 경쟁(data race)으로 정의합니다.
용어를 외우기보다 누가 같은 값을 쓰는지와 읽기와 쓰기 사이에 다른 작업이 끼어들 수 있는지를 먼저 찾습니다.

---

## 공유 상태의 보장

공유 상태가 안전하려면 세 가지 성질을 따로 확인합니다.

| 성질 | 뜻 | 놓치기 쉬운 예 |
| --- | --- | --- |
| 원자성(atomicity) | 다른 작업이 중간 상태를 보지 못하도록 한 덩어리로 처리됩니다 | `count++`은 보통 읽기와 쓰기가 나뉘므로 그 자체로 원자적이지 않습니다 |
| 가시성(visibility) | 한 스레드가 쓴 결과를 다른 스레드가 정해진 시점에 볼 수 있습니다 | 평범한 필드 변경이 다른 스레드에 언제 보일지는 동기화 없이 보장되지 않습니다 |
| 순서(ordering) | 메모리 작업이 다른 스레드에 어떤 순서로 관찰되는지 정해집니다 | 소스 코드의 위아래 순서를 다른 스레드도 같은 순서로 본다고 할 수 없습니다 |

보호 도구마다 보장하는 범위가 다릅니다.
그래서 먼저 보호할 상태와 한 덩어리여야 하는 작업을 정한 뒤 도구를 고릅니다.

| 선택 | 알맞은 상황 | 기억할 경계 |
| --- | --- | --- |
| 불변 값 | 만든 뒤 내용을 바꾸지 않고 여러 곳에서 읽습니다 | 객체가 불변이어도 그 참조를 다른 스레드에 전달하는 과정은 안전해야 합니다 |
| `synchronized` | 여러 필드나 여러 문장을 하나의 규칙으로 묶어야 합니다 | 같은 잠금을 써야 상호 배제와 가시성 보장이 이어집니다 |
| `AtomicInteger` 같은 원자 변수 | 숫자 하나의 증가처럼 지원되는 단일 연산을 원자적으로 처리합니다 | 여러 변수의 관계까지 보호하지 않습니다 |
| `volatile` | 한 스레드가 바꾼 상태 표시 값을 다른 스레드가 보게 합니다 | `count++` 같은 읽기·계산·쓰기 전체를 원자적으로 만들지 않습니다 |
| `ConcurrentHashMap` 같은 스레드 안전 컬렉션 | 여러 스레드가 컬렉션의 지원 연산을 함께 수행합니다 | 여러 메서드를 이어 만든 업무 규칙까지 한 덩어리로 만들지 않습니다 |

예를 들어 `containsKey()`로 확인한 뒤 `put()`하면 두 호출 사이에 다른 작업이 끼어들 수 있습니다.
`ConcurrentHashMap`에서 한 키의 확인과 저장을 함께 처리해야 한다면 `putIfAbsent()`나 `compute()`처럼 그 구현이 원자적으로 보장하는 단일 연산을 먼저 살핍니다.

두 값이 반드시 같이 바뀌어야 하는 경우도 있습니다.
예를 들어 진행률 `progress`를 올리면서 완료 시각 `completedAt`도 함께 기록해야 한다고 해 보겠습니다.
이때는 두 필드를 쓰는 쪽뿐 아니라 읽는 쪽도 같은 잠금 계약을 따라야 다른 스레드가 중간 조합을 보지 않습니다.
스레드 안전 컬렉션을 썼다는 사실만으로 컬렉션 밖의 필드와 함께 지킬 규칙까지 안전해지지는 않습니다.

---

## happens-before 관계

happens-before는 Java 메모리 모델이 두 동작의 가시성과 순서를 설명하는 관계입니다.
동작 A가 동작 B보다 happens-before라면 B는 A가 남긴 메모리 효과를 명세가 정한 방식으로 볼 수 있습니다.
처음에는 다음 규칙으로 읽으면 됩니다.

- 한 스레드 안에서는 앞선 동작이 뒤의 동작보다 happens-before입니다.
- 같은 객체의 잠금을 푸는 동작은 나중에 그 잠금을 얻는 동작보다 happens-before입니다.
- `volatile` 변수에 쓰는 동작은 다른 스레드가 같은 변수를 뒤이어 읽는 동작보다 happens-before입니다.
- `Thread.start()`를 호출하기 전의 동작은 시작된 스레드의 동작보다 happens-before입니다.
- 스레드의 모든 동작은 다른 스레드가 그 스레드의 `join()`을 성공적으로 마친 뒤의 동작보다 happens-before입니다.
- 실행 담당자에게 작업을 제출하기 전의 동작은 그 작업의 동작보다 앞서고 작업의 동작은 해당 `Future.get()` 뒤의 동작보다 앞섭니다.

A가 B보다 앞서고 B가 C보다 앞서면 A도 C보다 happens-before입니다.
이 연결 덕분에 작업을 제출하기 전에 준비한 값과 `Future.get()`으로 받은 결과를 안전하게 이어서 쓸 수 있습니다.

반면 `Thread.sleep()`은 현재 스레드를 잠시 쉬게 할 뿐 이런 관계를 만들지 않습니다.
기다린 시간이 충분해 보인다는 이유로 공유 값이 보이거나 작업이 끝났다고 판단할 수 없습니다.

이제 완료 횟수를 다시 세어 보겠습니다.
공유 값을 잘 잠그는 것보다 먼저 볼 것은 공유 변경 자체를 줄일 수 있는지입니다.

---

## ExecutorService와 Future 사용법

여러 작업을 다루는 코드는 세 역할로 나누면 읽기 쉽습니다.

| 이름 | 쉬운 뜻 | Java의 대표 표현 |
| --- | --- | --- |
| 작업(task) | 해야 할 일 한 묶음 | `Runnable` · `Callable` |
| 스레드(thread) | 명령을 차례로 실행하는 흐름 | `Thread` |
| 실행 담당자(executor) | 제출된 작업을 어떤 스레드에서 실행할지 관리하는 객체 | `ExecutorService` |

`Runnable`은 반환값 없는 작업이고 `Callable<T>`는 끝나면 `T` 타입 결과를 돌려주며 검사 예외도 던질 수 있는 작업입니다.
`Future<T>`는 제출한 작업이 나중에 돌려줄 `T` 타입 결과를 나타냅니다.
`get()`은 작업이 정상적으로 끝나면 그 결과를 돌려줍니다.
작업이 실패하거나 취소되거나 기다리는 스레드가 중단되면 결과 대신 그 상황을 나타내는 예외를 던질 수 있습니다.

다음 예제에서는 각 작업이 완료 결과 `1`을 반환하고 `main` 스레드만 결과를 합칩니다.

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

출력이 무엇일지 예상해 보세요.

```text
완료 작업: 100
```

각 작업은 공유된 `completed`를 고치지 않고 자기 결과만 반환합니다.
`result.get()`은 정상 완료된 작업의 결과를 돌려주고 작업 안의 동작이 `get()` 뒤의 계산에 보이도록 연결합니다.
그래서 앞에서 본 `count++`처럼 갱신을 잃을 일이 없습니다.

예제의 `sleep()`은 서버 응답처럼 기다리는 시간을 작게 흉내 낸 것이고 동기화에 쓴 것이 아닙니다.
작업 완료는 시간이 아니라 `Future.get()`으로 확인합니다.
`ExecutorService`는 `AutoCloseable`이므로 try-with-resources 블록이 끝날 때 닫힙니다.

## 가상 스레드의 활용

예제의 `Executors.newVirtualThreadPerTaskExecutor()`는 제출한 작업마다 새 가상 스레드를 시작합니다.
가상 스레드(virtual thread)는 Java의 `Thread`이지만 운영체제 스레드보다 훨씬 적은 비용으로 많은 수를 쓸 수 있게 만든 구현입니다.
그래서 값비싼 자원을 아끼려고 적은 수만 만들어 돌려 쓰는 일반 스레드 풀처럼 묶어 둘 필요가 없습니다.

가상 스레드는 네트워크나 파일 응답을 기다리는 작업이 많을 때 알맞습니다.
한 요청을 익숙한 순차 코드로 적으면서 처리량을 높일 수 있기 때문입니다.
반면 오래 계산만 하는 CPU 중심 작업은 쓸 수 있는 CPU 수의 제한을 그대로 받습니다.
가상 스레드를 많이 만든다고 한 계산이 더 빨라지거나 계산 능력이 늘지는 않습니다.

가상 스레드도 같은 Java 메모리 모델을 따릅니다.
여러 가상 스레드가 같은 가변 값을 잘못 갱신하면 플랫폼 스레드와 똑같이 경쟁 상태가 생깁니다.

## 정리

- `count++` 같은 읽기·계산·쓰기는 원자적이지 않으며 원자성·가시성·순서는 서로 다른 보장입니다.
- 숫자 하나는 원자 변수로 두 필드의 관계는 같은 잠금으로 보호하고 `volatile`과 `sleep`만으로 갱신을 안전하게 만들지 않습니다.
- 각 작업이 결과를 반환하게 하고 `Future.get()`의 정상 완료 뒤 한 곳에서 합치면 공유 갱신을 줄일 수 있으며 가상 스레드는 많은 대기 작업에 맞습니다.

## 이어서 연습하기

아래 객관식 문제에서 보호할 범위와 결과를 모으는 근거를 확인해 보세요.

다음 개념: [테스트: 계약에서 조건을 찾고 도구로 확인하기](#/learn/java/wiki-test-contracts)

## 공식 자료

- [Java Language Specification SE 25 — Threads and Locks](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html)
- [Java SE 25 API — java.util.concurrent](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html)
- [Oracle Java SE 25 — Virtual Threads](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html)

## 핵심 질문 답

읽기·계산·쓰기가 한 번의 갱신이어야 한다면 그 전체를 원자적으로 보호해야 하며 `volatile`만으로 `count++`는 원자적이 되지 않습니다.
숫자 하나는 `AtomicInteger`의 단일 연산을 검토하고 두 필드의 관계는 읽는 쪽과 쓰는 쪽이 같은 잠금 계약을 지켜야 합니다.
가능하면 공유 변경을 줄이고 잠금·`join`·`Future.get` 같은 happens-before 관계로 결과를 이어 받으며 `sleep` 시간만으로 동기화하지 않습니다.
각 `Callable` 작업이 자기 결과를 반환하게 하고 호출 스레드가 `Future.get()`의 정상 반환값을 합치며 실패·취소·중단은 따로 처리합니다.
가상 스레드는 많은 대기 중심 작업에 유용하지만 한 CPU 계산을 빠르게 하거나 데이터 경쟁을 없애지는 않습니다.
