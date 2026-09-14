# 날짜·시점·시간량 구분하기

## 학습 목표

날짜·한순간·지역 규칙·시간량을 구분하고 불변 시간값의 반환값을 사용할 수 있습니다.

## 한줄 요약

날짜와 시간 타입은 담을 정보의 뜻으로 고르며 지역 없는 날짜·시각만으로 한순간을 확정할 수 없습니다.

## 먼저 확인할 개념

날짜·시간은 필요한 때 선택해 읽는 확장 주제입니다. [문자열](#/learn/java/wiki-strings) · [final과 불변](#/learn/java/wiki-final-immutability)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## 선택 확장: 날짜와 시간은 뜻으로 고른다

날짜와 시간은 모두 시계처럼 보여도 담는 정보가 다르다.

| 타입 | 담는 뜻 | 밤데브 예시 |
| --- | --- | --- |
| `LocalDate` | 시간대 없는 달력 날짜 | 학습 마감일 |
| `Instant` | 시간선 위의 한순간 | 서버에 기록한 저장 시점 |
| `ZoneId` | 지역의 시간대 규칙 | 저장 시점을 서울 시각으로 표시할 규칙 |
| `Duration` | 초와 나노초를 바탕으로 한 시간량 | 제한 시간 30분 |

`ZoneId`만으로 날짜와 시각이 생기지는 않는다.
`Instant`에 지역 규칙을 적용하면 해당 지역에서 읽을 수 있는 `ZonedDateTime`을 얻는다.

`LocalDateTime`은 날짜와 시각을 담지만 UTC 오프셋이나 시간대를 담지 않는다.
따라서 값 하나만으로는 서울과 파리 중 어느 지역의 시각인지, 시간선 위의 어느 순간인지 정할 수 없다.

`java.time`의 주요 타입은 불변이다.
`plusDays()` 같은 메서드는 원본을 고치는 대신 새 값을 돌려주므로 계산 결과를 계속 쓰려면 반환값을 받아야 한다.

## 날짜를 하루 뒤로 옮긴 값 받기

```java
import java.time.LocalDate;
public class DateDemo {
    public static void main(String[] args) {
        LocalDate deadline = LocalDate.of(2026, 9, 14);
        LocalDate next = deadline.plusDays(1);
        System.out.println(deadline);
        System.out.println(next);
    }
}
```

deadline은 9월 14일을 유지하고 next가 9월 15일을 나타낸다.
기존 변수로 다음 날짜를 계속 사용하려면 `deadline = deadline.plusDays(1)`처럼 결과를 받아야 한다.
이 계산에는 현재 시스템 시각이나 기본 시간대가 필요하지 않다.
날짜만 필요한 마감일에 시점과 시간대를 억지로 넣기보다 표현하려는 정보부터 구분한다.


## 이어서 연습하기

[동시성: 공유 상태의 원자성·가시성·순서](#/learn/java/wiki-shared-state)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [Java SE 25 API — java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html)
- [Java SE 25 API — java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)
- [Java SE 25 API — java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html)

## 핵심 질문 답

달력 날짜는 LocalDate, 시간선의 한순간은 Instant, 지역 규칙은 ZoneId, 시간량은 Duration으로 표현합니다. LocalDateTime에는 시간대·오프셋이 없어 한순간을 정하려면 추가 정보가 필요합니다. Instant에 ZoneId를 적용하면 해당 지역 시각을 얻습니다. 주요 java.time 값은 불변이므로 plusDays 같은 연산의 반환값을 받아 사용합니다.
