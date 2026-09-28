# 문자열 시뮬레이션: Java로 명령 문자열 처리하기

## 학습 목표

- 명령 문자열을 `split`·`trim`·`Integer.parseInt`로 나누고 `StringBuilder`에 순서대로 적용할 수 있습니다.

## 한줄 요약

문자열 시뮬레이션은 입력 문자열을 명령 조각으로 나눈 뒤 바꿀 수 없는 `String` 대신 `StringBuilder`에 명령을 차례로 적용해 상태를 바꿔 갑니다.

## 먼저 확인할 개념

[시뮬레이션: 규칙을 그대로 코드로 옮기기](#/learn/algorithm/implementation-and-string-simulation) · [문자열의 값과 조립](#/learn/java/wiki-strings)

## 문자열 시뮬레이션이란

**문자열 시뮬레이션**은 입력이나 상태가 문자열인 시뮬레이션 문제를 Java 문자열 도구로 푸는 일입니다.
앞 문서에서는 격자 위의 상태를 규칙대로 바꾸었습니다.
이번에는 상태가 글자들의 줄이고 규칙은 문자열로 적힌 명령입니다.

문자열 문제는 두 단계로 나누면 쉬워집니다.
먼저 입력 문자열을 풀이에 쓸 데이터로 바꾸고 그다음 그 데이터를 규칙대로 적용합니다.
첫 단계처럼 문자열을 필요한 조각과 숫자로 바꾸는 일을 **파싱**이라고 합니다.

예를 들어 전광판에 보여 줄 글자를 명령으로 편집하는 문제를 떠올려 보세요.
명령은 쉼표로 구분된 문자열 하나로 주어집니다.

```text
ADD VED, ADD MAB, REVERSE, INSERT 3 .
```

`ADD`는 글자를 끝에 붙이고 `REVERSE`는 전체를 뒤집고 `INSERT 3 .`은 3번 칸에 `.`을 끼워 넣습니다.
이 문서는 이 전광판 하나로 끝까지 설명합니다.

## Java 문자열 도구

전광판 문제에 쓰는 도구는 크게 세 묶음입니다.
문자열을 읽고 나누는 `String`의 메서드·숫자로 바꾸는 `Integer.parseInt`·글자를 고치는 `StringBuilder`의 메서드입니다.

| 도구 | 하는 일 | 전광판 예제에서 |
| --- | --- | --- |
| `s.split(",")` | 구분자로 나누어 `String[]`로 돌려줍니다 | 명령 네 개로 나누기 |
| `s.trim()` | 앞뒤 공백을 지운 새 문자열을 돌려줍니다 | `" ADD MAB"`의 앞 공백 지우기 |
| `s.charAt(i)` | `i`번 글자 하나를 `char`로 돌려줍니다 | 글자를 하나씩 읽기 |
| `s.length()` | 글자 수를 돌려줍니다 | 반복 범위 정하기 |
| `s.substring(i)` | `i`번부터 끝까지 잘라 새 문자열을 돌려줍니다 | 글자를 한 칸씩 밀기 |
| `Integer.parseInt(s)` | 숫자 문자열을 `int`로 바꿉니다 | `"3"`을 `3`으로 |
| `sb.append(x)` | 끝에 붙입니다 | `ADD` 명령 |
| `sb.insert(i, x)` | `i`번 칸에 끼워 넣습니다 | `INSERT` 명령 |
| `sb.reverse()` | 앞뒤를 뒤집습니다 | `REVERSE` 명령 |
| `sb.toString()` | 지금 내용을 `String`으로 돌려줍니다 | 편집이 끝난 뒤 꺼내기 |

`String`의 메서드는 원래 문자열을 고치지 않고 새 문자열을 돌려줍니다.
반면 `StringBuilder`의 메서드는 자기 자신의 내용을 바로 고칩니다.
이 차이가 왜 중요한지는 조금 뒤에 살펴봅니다.

## 문자열을 풀이용 데이터로 바꾸기

먼저 명령 문자열을 명령 하나하나로 나누어 보겠습니다.

![명령 문자열 하나를 split 쉼표와 trim으로 ADD VED·ADD MAB·REVERSE·INSERT 3 . 네 명령으로 나누고 INSERT 3 .을 다시 split 공백으로 INSERT·3·. 세 조각으로 나눈 뒤 Integer.parseInt로 문자열 3을 정수 3으로 바꾸는 과정](content/assets/algorithm/string-simulation-parse.png)

그림처럼 쉼표로 한 번 나누고 각 조각을 다시 공백으로 나눕니다.
쉼표 뒤에 공백이 있으므로 두 번째 조각부터는 앞에 공백이 붙어 있어서 `trim()`으로 지워 줍니다.

```java
static List<String[]> parse(String commandText) {
    List<String[]> commands = new ArrayList<>();
    for (String piece : commandText.split(",")) {
        String command = piece.trim();
        if (command.isEmpty()) continue;
        commands.add(command.split(" "));
    }
    return commands;
}
```

명령마다 몇 조각으로 나뉠지 먼저 세어 보세요.

```text
[ADD, VED]
[ADD, MAB]
[REVERSE]
[INSERT, 3, .]
```

`REVERSE`는 인자가 없으니 한 조각이고 `INSERT`는 위치와 글자까지 세 조각입니다.
명령마다 조각 수가 다르므로 첫 조각인 명령 이름을 보고 나머지 조각을 어떻게 읽을지 정합니다.
위치를 뜻하는 `"3"`은 아직 문자열이라서 `Integer.parseInt`로 정수로 바꾼 뒤에 씁니다.

그런데 `split`에 넘기는 구분자는 그냥 글자가 아니라 글자의 패턴을 적는 **정규식**입니다.
정규식에서 `.`은 아무 글자 하나를 뜻합니다.
점으로 나누려는 두 줄의 결과가 어떻게 다를지 예상해 보세요.

```java
System.out.println("split(\".\"): " + Arrays.toString("BAM.DEV".split(".")));
System.out.println("split(\"\\\\.\"): " + Arrays.toString("BAM.DEV".split("\\.")));
```

```text
split("."): []
split("\\."): [BAM, DEV]
```

`split(".")`은 모든 글자를 구분자로 보기 때문에 빈 조각만 남고 결국 빈 배열을 돌려줍니다.
글자 그대로의 점으로 나누려면 `split("\\.")`처럼 점 앞에 `\\`를 붙입니다.

## String과 StringBuilder

이제 명령을 적용할 차례입니다.
그 전에 전광판의 글자를 `String`에 담을지 `StringBuilder`에 담을지 정해야 합니다.

![왼쪽은 String greeting이 가리키는 BAM에 concat을 하면 BAMDEV라는 새 문자열이 따로 만들어지고 담지 않으면 사라져 greeting은 여전히 BAM인 모습. 오른쪽은 StringBuilder sb가 가리키는 객체 하나에 append로 DEV가 바로 붙는 모습](content/assets/algorithm/string-simulation-immutable.png)

Java의 `String`은 한 번 만들면 내용을 바꿀 수 없습니다.
그래서 `concat`이나 `+`로 이어 붙이면 원래 문자열은 그대로 두고 새 문자열을 하나 더 만듭니다.

```java
String greeting = "BAM";
greeting.concat("DEV");
System.out.println(greeting);
```

`greeting`에 무엇이 출력될지 예상해 보세요.

```text
BAM
```

`concat`이 만든 `"BAMDEV"`를 어디에도 담지 않았기 때문에 `greeting`은 그대로 `BAM`입니다.
결과를 쓰려면 `greeting = greeting.concat("DEV");`처럼 다시 담아야 합니다.
명령을 적용할 때마다 이렇게 새 문자열을 만들면 글자가 길수록 복사하는 양도 늘어납니다.

반면 `StringBuilder`는 객체 하나의 내용을 그 자리에서 고칩니다.
명령을 여러 번 적용하는 시뮬레이션에는 `StringBuilder`가 잘 맞습니다.

## 명령 문자열 적용

파싱한 명령을 `StringBuilder`에 하나씩 적용해 보겠습니다.
명령 이름에 따라 할 일이 달라지므로 `switch`로 나눕니다.

```java
static void apply(StringBuilder board, String[] parts) {
    switch (parts[0]) {
        case "ADD" -> board.append(parts[1]);
        case "REVERSE" -> board.reverse();
        case "INSERT" -> board.insert(Integer.parseInt(parts[1]), parts[2]);
        default -> throw new IllegalArgumentException("알 수 없는 명령: " + parts[0]);
    }
}
```

`switch`는 문자열을 `equals`로 비교하므로 `==`로 비교할 때처럼 내용이 같은데 다르다고 판단하는 일이 없습니다.
모르는 명령이 들어오면 조용히 넘어가지 않고 예외로 알려 줍니다.

```java
StringBuilder board = new StringBuilder();
for (String[] parts : commands) {
    apply(board, parts);
    System.out.println(String.join(" ", parts) + " → " + board);
}
```

명령 네 개를 차례로 적용한 뒤 전광판에 무엇이 남을지 먼저 적어 보세요.

```text
ADD VED → VED
ADD MAB → VEDMAB
REVERSE → BAMDEV
INSERT 3 . → BAM.DEV
```

![명령마다 StringBuilder의 글자가 바뀌는 모습. ADD VED 뒤에는 V·E·D이고 ADD MAB 뒤에는 끝에 M·A·B가 붙고 REVERSE 뒤에는 B·A·M·D·E·V로 뒤집히고 INSERT 3 . 뒤에는 3번 칸에 점이 들어가 B·A·M·.·D·E·V가 된다. 마지막 줄 아래에 0부터 6까지 인덱스가 적혀 있다.](content/assets/algorithm/string-simulation-builder.png)

`REVERSE`가 섞여 있던 글자를 `BAMDEV`로 되돌립니다.
`INSERT 3 .`은 3번 칸에 있던 `D`와 그 뒤의 글자를 한 칸씩 뒤로 밀고 그 자리에 `.`을 넣습니다.
명령의 순서를 바꾸면 결과도 달라지므로 시뮬레이션에서는 입력 순서를 그대로 지킵니다.

> [!question]- insert의 위치가 글자 수보다 크면?
> `insert`의 위치는 0부터 현재 글자 수까지만 쓸 수 있습니다.
> 글자 수와 같은 위치는 끝에 붙이는 것과 같습니다.
> 그보다 큰 위치를 주면 `StringIndexOutOfBoundsException`이 납니다.
> 문제에서 위치가 범위를 벗어날 수 있다고 하면 적용하기 전에 `board.length()`와 비교합니다.

## charAt으로 한 글자씩 읽기

편집이 끝난 전광판은 글자가 왼쪽으로 한 칸씩 흘러가며 보입니다.
맨 앞 글자를 떼어 맨 뒤에 붙이면 한 칸 흐른 모습이 됩니다.

```java
static String scrollLeft(String text) {
    return text.substring(1) + text.charAt(0);
}
```

`substring(1)`은 1번 글자부터 끝까지이고 `charAt(0)`은 맨 앞 글자 하나입니다.
`BAM.DEV`를 세 번 흘려보내면 어떻게 될지 예상해 보세요.

```text
흐름 1: AM.DEVB
흐름 2: M.DEVBA
흐름 3: .DEVBAM
```

`charAt`은 반복문으로 글자를 하나씩 검사할 때도 씁니다.
전광판에서 점을 빼고 알파벳이 몇 개인지 세려면 `Character.isLetter`로 글자인지 확인합니다.

```java
static int countLetters(String text) {
    int count = 0;
    for (int i = 0; i < text.length(); i++) {
        if (Character.isLetter(text.charAt(i))) count++;
    }
    return count;
}
```

```text
글자 수: 6
```

`charAt`이 돌려주는 것은 `String`이 아니라 `char`입니다.
그래서 한 글자와 비교할 때는 `text.charAt(i) == 'A'`처럼 작은따옴표를 씁니다.

> [!note]- 전체 코드 보기
> 이 문서의 예제를 하나로 합친 프로그램입니다.
> `MessageBoard.java`로 저장해 실행해 볼 수 있습니다.
>
> ```java
> import java.util.ArrayList;
> import java.util.Arrays;
> import java.util.List;
>
> public class MessageBoard {
>     static List<String[]> parse(String commandText) {
>         List<String[]> commands = new ArrayList<>();
>         for (String piece : commandText.split(",")) {
>             String command = piece.trim();
>             if (command.isEmpty()) continue;
>             commands.add(command.split(" "));
>         }
>         return commands;
>     }
>
>     static void apply(StringBuilder board, String[] parts) {
>         switch (parts[0]) {
>             case "ADD" -> board.append(parts[1]);
>             case "REVERSE" -> board.reverse();
>             case "INSERT" -> board.insert(Integer.parseInt(parts[1]), parts[2]);
>             default -> throw new IllegalArgumentException("알 수 없는 명령: " + parts[0]);
>         }
>     }
>
>     static String scrollLeft(String text) {
>         return text.substring(1) + text.charAt(0);
>     }
>
>     static int countLetters(String text) {
>         int count = 0;
>         for (int i = 0; i < text.length(); i++) {
>             if (Character.isLetter(text.charAt(i))) count++;
>         }
>         return count;
>     }
>
>     public static void main(String[] args) {
>         String greeting = "BAM";
>         greeting.concat("DEV");
>         System.out.println(greeting);
>
>         String commandText = "ADD VED, ADD MAB, REVERSE, INSERT 3 .";
>         List<String[]> commands = parse(commandText);
>         for (String[] parts : commands) {
>             System.out.println(Arrays.toString(parts));
>         }
>
>         StringBuilder board = new StringBuilder();
>         for (String[] parts : commands) {
>             apply(board, parts);
>             System.out.println(String.join(" ", parts) + " → " + board);
>         }
>
>         String text = board.toString();
>         for (int i = 0; i < 3; i++) {
>             text = scrollLeft(text);
>             System.out.println("흐름 " + (i + 1) + ": " + text);
>         }
>         System.out.println("글자 수: " + countLetters(board.toString()));
>         System.out.println("split(\".\"): " + Arrays.toString("BAM.DEV".split(".")));
>         System.out.println("split(\"\\\\.\"): " + Arrays.toString("BAM.DEV".split("\\.")));
>     }
> }
> ```
>
> ```text
> BAM
> [ADD, VED]
> [ADD, MAB]
> [REVERSE]
> [INSERT, 3, .]
> ADD VED → VED
> ADD MAB → VEDMAB
> REVERSE → BAMDEV
> INSERT 3 . → BAM.DEV
> 흐름 1: AM.DEVB
> 흐름 2: M.DEVBA
> 흐름 3: .DEVBAM
> 글자 수: 6
> split("."): []
> split("\\."): [BAM, DEV]
> ```

## 문자열 도구 고르기

그렇다면 문제를 풀 때 어떤 도구를 먼저 꺼내야 할까요?
기준은 문자열을 읽기만 하는지 계속 고치는지입니다.

| 하려는 일 | 고를 도구 |
| --- | --- |
| 입력을 구분자로 나누어 명령·숫자로 바꿉니다 | `split` · `trim` · `Integer.parseInt` |
| 글자를 하나씩 검사하거나 세어 봅니다 | `charAt` · `length` |
| 글자를 여러 번 붙이고 끼우고 뒤집습니다 | `StringBuilder` |
| 한두 번 이어 붙이거나 잘라 새 값을 만듭니다 | `String`의 `+` · `substring` |
| 글자 하나를 여러 번 바꿔 적습니다 | `toCharArray()`로 만든 `char[]` |

특히 반복문 안에서 `+`로 문자열을 계속 이어 붙이면 매번 새 문자열을 만들어 입력이 클 때 느려질 수 있습니다.
그럴 때는 `StringBuilder`에 `append`로 모은 뒤 마지막에 `toString()`을 한 번만 부릅니다.

## 정리

- 문자열 시뮬레이션은 입력을 명령과 숫자로 파싱한 뒤 명령을 순서대로 적용합니다.
- `split`의 구분자는 정규식이라서 점처럼 뜻이 있는 글자는 `"\\."`처럼 적습니다.
- `String`은 바꿀 수 없어서 메서드가 새 문자열을 돌려주고 `StringBuilder`는 `append`·`insert`·`reverse`로 그 자리에서 고칩니다.
- `charAt`은 `char` 하나를 돌려주므로 작은따옴표로 비교합니다.

## 이어서 연습하기

[전광판 명령 스크립트](#/coding-tests/java/algo-string-01)에서 명령 문자열을 나누고 `StringBuilder`로 전광판 글자를 바꿔 봅니다.
[수치 조절 기록](#/coding-tests/java/bridge-sim-01)에서 명령 문자열을 읽어 값을 순서대로 바꿔 봅니다.

## 공식 자료

- [Java 25 API: String](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html)
- [Java 25 API: StringBuilder](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html)
- [Java 25 API: Integer](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html)

## 핵심 질문 답

먼저 명령 문자열을 `split`으로 나누고 `trim`으로 공백을 지운 뒤 숫자 조각은 `Integer.parseInt`로 바꿔 풀이용 데이터로 만듭니다.
`split`의 구분자는 정규식이므로 점 같은 글자는 `"\\."`처럼 적어야 합니다.
`String`은 바꿀 수 없으니 여러 번 고칠 상태는 `StringBuilder`에 담고 `append`·`insert`·`reverse`로 명령을 입력 순서대로 적용합니다.
글자 하나를 읽거나 셀 때는 `charAt`으로 `char`를 꺼내 작은따옴표로 비교합니다.
