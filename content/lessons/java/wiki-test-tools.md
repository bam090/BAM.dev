# JUnit·AssertJ·Mockito의 테스트 역할

## 학습 목표

테스트 실행 틀·assertion·협력 대역의 역할을 나누고 필요한 도구만 고를 수 있습니다.

## 한줄 요약

JUnit은 테스트 실행 틀, AssertJ는 결과 비교 표현, Mockito는 외부 협력 대역을 맡습니다.

## 먼저 확인할 개념

[공개 계약에서 테스트 조건 찾기](#/learn/java/wiki-test-contracts) · [조합·위임과 생성자 주입](#/learn/java/wiki-composition-injection)를 먼저 확인하면 예제의 전제를 이해하기 쉽습니다.

## JUnit 5는 테스트의 실행 틀을 만든다

IDE(Integrated Development Environment, 통합 개발 환경)는 코드를 작성하고 실행하는 개발 프로그램이고, 빌드 도구는 컴파일·테스트 실행·필요한 라이브러리 준비 같은 작업을 자동화한다.
테스트 엔진은 테스트를 찾아 실행하며, assertion(검증문)은 실제 결과가 기대한 조건과 같은지 확인한다.

JUnit 5에서 JUnit Platform은 IDE나 빌드 도구가 테스트 엔진을 실행할 수 있는 기반을 제공한다.
JUnit Jupiter는 `@Test` 같은 애너테이션, 생명 주기, 기본 assertion과 Jupiter 테스트를 실행하는 엔진을 제공한다.

처음에는 다음 역할을 구분하면 된다.

| 기능 | 역할 |
| --- | --- |
| `@Test` | 해당 메서드가 확인할 테스트임을 표시한다. |
| `Assertions` | 실제 값이 기대와 같은지, 예외가 발생했는지 등을 확인한다. |
| `@BeforeEach`·`@AfterEach` | 각 테스트 전후에 반복해야 하는 준비와 정리를 실행한다. |
| `@BeforeAll`·`@AfterAll` | 한 테스트 클래스 전체의 시작과 끝에 한 번씩 준비하고 정리한다. |

기본 테스트 인스턴스 생명 주기에서 `@BeforeAll`과 `@AfterAll` 메서드는 보통 `static`이어야 한다.
테스트 클래스마다 인스턴스를 하나만 쓰는 생명 주기를 명시하면 인스턴스 메서드로 둘 수도 있다.

공통 준비가 짧지 않게 반복될 때 `@BeforeEach`를 사용하면 된다.
객체 하나를 바로 만드는 편이 더 잘 읽힌다면 생명 주기 메서드를 억지로 추가할 필요는 없다.

각 테스트는 다른 테스트의 실행 결과나 실행 순서에 기대지 않게 만든다.
한 테스트가 남긴 공유 상태를 다음 테스트가 사용하면 따로 실행했을 때 결과가 달라질 수 있다.

## AssertJ는 검증 문장을 읽기 쉽게 만든다

JUnit Jupiter의 `Assertions.assertEquals(expected, actual)`만으로도 값을 비교할 수 있다.
AssertJ는 `assertThat(actual).isEqualTo(expected)`처럼 실제 값에서 시작해 조건을 이어 쓰는 assertion 라이브러리다.

이 표현은 AssertJ의 정적 assertThat 메서드를 사용한 예다. 아래 비교 예제에서 타입과 import를 함께 확인한다.

AssertJ는 테스트를 찾거나 실행하지 않는다.
JUnit 테스트 안에서 결과를 더 읽기 쉽게 표현하고, 실패했을 때 비교 정보를 보여 주는 역할을 맡는다.

문자열, 목록, 예외처럼 값의 종류에 맞는 검증 메서드를 이어 쓸 수 있다.
그러나 한 assertion에 관련 없는 조건을 길게 붙이기보다 테스트 이름과 검증할 사실을 한 방향으로 맞춘다.

## Mockito는 협력자의 자리를 잠시 대신한다

서비스 객체가 이메일 전송기나 외부 저장소에 일을 부탁한다면 테스트할 때 실제 외부 시스템까지 호출하고 싶지 않을 수 있다.
Mockito의 Mock 객체는 해당 협력자와 같은 타입 자리에 놓여 테스트에 필요한 응답과 호출 기록을 제공한다.

| Mockito 동작 | 쉬운 뜻 |
| --- | --- |
| `mock(Type.class)` | 실제 협력자 대신 사용할 객체를 만든다. |
| `when(...).thenReturn(...)` | 지정한 호출에 돌려줄 값을 미리 정한다. |
| `verify(...)` | 기대한 협력 요청이 실제로 있었는지 확인한다. |

Mock은 계산 결과가 이미 분명하고 빠른 객체까지 모두 가짜로 바꾸는 도구가 아니다.
할인 계산기는 실제 객체로 확인하고, 알림 전송처럼 테스트 범위를 벗어난 협력 경계만 Mock으로 바꾸면 무엇을 검증하는지 더 잘 보인다.

## 도구의 역할만 읽는 작은 예

다음은 JUnit Jupiter와 AssertJ가 준비된 별도 테스트 프로젝트에서의 읽기 예제다.
밤데브에 라이브러리를 설치하거나 앱 안에서 실행하라는 요구가 아니다.
두 검증문은 같은 정수 비교를 각 도구의 표현으로 확인한다.

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.assertj.core.api.Assertions.assertThat;
class PriceTest {
    @Test
    void comparesPrice() {
        int actualPrice = 8_000;
        assertEquals(8_000, actualPrice);
        assertThat(actualPrice).isEqualTo(8_000);
    }
}
```

설명용으로 두 표현을 함께 둔 것이며 실제 테스트에서 같은 비교를 중복할 필요는 없다.
빠른 실제 계산기는 그대로 검증하고 외부 전송 협력자만 대역으로 바꿀 수 있다.
Mockito verify는 send에 올바른 메시지를 요청했는지 확인할 뿐 실제 이메일 도착이나 계산 정답을 보장하지 않는다.


## 세 도구의 자리를 다시 구분한다

| 도구 | 이 예제에서 맡은 일 | 맡지 않은 일 |
| --- | --- | --- |
| JUnit Jupiter 5.14.4 | `@Test`로 테스트를 표시하고 Jupiter 테스트를 실행할 규칙을 제공한다. | 외부 알림 객체를 대신 만들지 않는다. |
| AssertJ Core 3.27.7 | 반환값과 예외를 읽기 쉬운 assertion으로 확인한다. | 테스트를 발견하거나 생명 주기를 관리하지 않는다. |
| Mockito 5.23.0 | 알림 협력자를 대신하고 전달된 메시지를 검증한다. | 할인 계산의 정답을 대신 판단하거나 테스트를 실행하지 않는다. |

도구가 세 개라는 이유로 모든 테스트에 세 개를 모두 사용할 필요는 없다.
확인할 사실이 단순한 순수 계산이면 JUnit과 하나의 assertion만으로 충분하며, 실제 협력 경계를 떼어 내야 할 때만 Mockito를 더한다.

## 이어서 연습하기

[공개 계약에서 테스트 조건 찾기](#/learn/java/wiki-test-contracts)에서 이어지는 판단을 확인해 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 보기마다 맞거나 틀린 이유를 비교해 보세요.

## 공식 자료

- [JUnit 5.14.4 User Guide — Overview](https://docs.junit.org/5.14.4/overview.html)
- [AssertJ Core Reference](https://assertj.github.io/doc/)
- [Mockito 5.23.0 API](https://javadoc.io/static/org.mockito/mockito-core/5.23.0/org.mockito/org/mockito/package-summary.html)

## 핵심 질문 답

JUnit Platform/Jupiter는 테스트 실행 틀과 생명 주기·기본 assertion을 제공하고 AssertJ는 결과 비교 표현을 읽기 좋게 합니다. Mockito는 실제 외부 협력 대신 응답과 호출 확인을 제공하는 대역을 만듭니다. 빠르고 결정적인 계산은 실제 객체로 확인하고 필요한 외부 경계만 대역으로 바꿉니다. verify는 협력 요청 확인이며 계산 정답이나 실제 외부 전송 성공을 대신 증명하지 않습니다.
