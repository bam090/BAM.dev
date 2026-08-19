# 01. 타입·컴파일·메서드 계약

## 학습 목표

- 기본 타입과 참조 타입이 표현하는 값의 역할을 구분할 수 있습니다.
- 변수의 선언 타입과 대입되는 값의 타입 관계를 설명할 수 있습니다.
- 메서드의 매개변수 타입과 반환 타입을 입력·출력 계약으로 읽을 수 있습니다.
- 소스 파일이 컴파일되어 클래스 파일이 되는 흐름과 컴파일 오류의 의미를 설명할 수 있습니다.

## 먼저 관찰하기

다음 코드를 실행하기 전에 타입 이름, 변수 이름, 메서드 이름에 각각 표시해 보세요.

```java
public class ScoreGuide {
    static String makeLabel(int score) {
        return score + "점";
    }

    public static void main(String[] args) {
        int currentScore = 80;
        String label = makeLabel(currentScore);
        System.out.println(label);
    }
}
```

1. `currentScore`가 담을 수 있는 값의 종류는 어디에 적혀 있나요?
2. `makeLabel`이 받는 값과 돌려주는 값의 타입은 무엇인가요?
3. `makeLabel("80")`처럼 호출하면 어느 계약이 어긋날까요?
4. 파일 이름을 `ScoreGuide.java`로 정한 이유를 공개 클래스 이름과 연결해 설명해 보세요.

## 소스 코드에서 실행까지

Java 소스 파일의 확장자는 `.java`입니다. `javac`는 소스의 선언과 표현식을 읽고 타입·문법 규칙을 검사한 뒤, 성공하면 JVM에서 실행할 클래스 파일을 만듭니다.

```text
ScoreGuide.java
      ↓ javac --release 21 ScoreGuide.java
ScoreGuide.class
      ↓ java ScoreGuide
JVM에서 main 메서드 실행
```

`--release 21`은 Java 21 언어 규칙과 해당 릴리스의 공개 API를 기준으로 컴파일하도록 요청합니다. 위 명령을 아직 실행하지 않았다면 클래스 파일이 만들어졌다고 단정하지 마세요. 먼저 파일 경로와 JDK 버전을 확인하고, 컴파일러가 보여 준 실제 진단을 읽어야 합니다.

컴파일 오류는 “프로그램이 실행되다가 실패했다”는 뜻이 아닙니다. 문법, 타입, 접근 규칙처럼 실행 전에 확인할 수 있는 계약을 만족하지 못해 클래스 파일 생성 단계가 완료되지 않았다는 뜻입니다.

## 기본 타입과 참조 타입

Java의 타입은 크게 기본 타입과 참조 타입으로 나뉩니다.

- 기본 타입: `byte`, `short`, `int`, `long`, `char`, `float`, `double`, `boolean`
- 참조 타입: 클래스 타입, 인터페이스 타입, 배열 타입

```java
int level = 1;
boolean completed = false;
String learner = "Bam";
int[] recentScores = {70, 80};
```

`level`과 `completed`는 기본 값을 담습니다. `learner`와 `recentScores`는 객체를 가리키는 참조 값을 담습니다. `String`은 클래스 타입이고 `int[]`는 배열 타입이므로 둘 다 참조 타입입니다.

기본 타입과 참조 타입을 “작은 데이터와 큰 데이터”로 나누지 마세요. 핵심은 변수가 기본 값을 담는지, 객체를 가리키는 참조 값을 담는지입니다. 참조 타입에는 `null`이 대입될 수 있으므로 객체의 기능을 호출하기 전에 실제 객체를 가리키는지 고려해야 합니다.

## 변수 선언을 계약으로 읽기

```java
int retryCount = 2;
String courseName = "Java";
```

선언의 왼쪽 타입은 변수가 가질 수 있는 값과 허용되는 연산을 제한합니다.

```java
// int retryCount = "두 번";  // 선언 타입과 대입 값의 타입이 다름
```

오류를 만났다면 무조건 형 변환을 붙이기보다 다음을 먼저 확인하세요.

1. 변수의 선언 타입은 무엇인가?
2. 오른쪽 표현식이 만드는 값의 타입은 무엇인가?
3. 이 값이 선언 타입에 대입될 수 있는가?
4. 요구사항 자체가 숫자인가, 문자열인가?

## 메서드의 입력·출력 계약

```java
static String makeResult(int score, boolean passed) {
    if (passed) {
        return score + "점: 통과";
    }
    return score + "점: 재도전";
}
```

- `String`: 반환 타입
- `makeResult`: 메서드 이름
- `int score`, `boolean passed`: 형식 매개변수
- `makeResult(80, true)`의 `80`, `true`: 호출 인수

이를 다음 계약으로 읽을 수 있습니다.

```text
입력: int 값 하나, boolean 값 하나
출력: String 참조 값 하나
```

반환 타입이 `void`가 아니라면 정상적으로 끝나는 실행 경로는 선언한 타입과 대입 가능한 값을 `return`해야 합니다. `void`는 결과 값을 돌려주지 않는다는 뜻입니다.

## 최소 구현

빈칸의 타입과 조건을 먼저 말로 설명한 뒤 작성해 보세요.

```java
static boolean isPassing(int score) {
    return score >= 60;
}
```

확인 순서:

1. 입력 `score`는 `int`입니다.
2. `score >= 60`의 결과는 `boolean`입니다.
3. 반환 타입과 `return` 표현식의 타입이 일치합니다.
4. 경계값 `59`, `60`, `61`에서 어떤 조건이 참인지 실행 전에 예상합니다.

## 흔한 실수

### 반환 타입만 보고 본문을 확인하지 않기

```java
static int makeLabel(int score) {
    return score + "점";
}
```

문자열 연결 결과는 `String`인데 반환 타입은 `int`입니다. 요구사항이 문장 반환이라면 반환 타입을 `String`으로 고쳐야 합니다.

### 출력과 반환을 같은 것으로 생각하기

`System.out.println(value)`는 값을 출력하지만 호출자에게 결과 값을 돌려주지는 않습니다. 다른 메서드에서 결과를 이어 사용해야 한다면 반환 타입과 `return`을 설계하세요.

### 컴파일 성공을 정답 보장으로 생각하기

컴파일러는 타입·문법 계약을 확인하지만 요구사항을 올바르게 구현했는지까지 증명하지 않습니다. 컴파일 뒤에는 경계 사례를 포함한 테스트가 필요합니다.

## 확인 문제

1. `int`, `boolean`, `String`, `int[]`를 기본 타입과 참조 타입으로 나누어 보세요.
2. 선언 `String label = makeLabel(80);`의 변수 타입, 인수 타입, 반환 타입을 각각 찾아보세요.
3. `static boolean isPassing(int score)`를 입력·출력 계약 한 문장으로 설명해 보세요.
4. 컴파일 오류와 프로그램 실행 중 발생한 오류는 어느 단계가 다른가요?
5. `--release 21`을 사용하는 이유를 언어 규칙과 공개 API 기준으로 설명해 보세요.

## 공식 근거 자료

- [Java Language Specification SE 25 §4: 타입·값·변수](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html)
- [Java Language Specification SE 25 §8.4: 메서드 선언](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4)
- [Java Language Specification SE 25 §8.4.5: 메서드 결과](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.5)
- [Java SE 25 `javac` 명령 문서](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
