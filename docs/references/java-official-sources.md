# Java 교안 공식 문서 검증 기록

## 검증 기준

- 확인일: 2026-08-19
- 언어 규칙 기준: Oracle Java Language Specification, Java SE 25 Edition
- 표준 라이브러리 계약 기준: Java SE 25 & JDK 25 API Specification
- 컴파일 도구 기준: Java SE 25 `javac` 명령 문서
- 학습 예제의 필수 문법과 API는 Java 21에서 사용할 수 있는 기본 범위로 제한했습니다.
- 교안은 실행하지 않은 코드의 결과를 단정하지 않고, 예상→실행→비교 순서를 안내합니다.

## 전체 명세와 컴파일

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [Java SE 25 명세 색인](https://docs.oracle.com/en/java/javase/25/docs/specs/index.html) | Java 언어·가상 머신·표준 API와 도구 문서의 공식 진입점 | 전체 |
| [JLS §7.3 Compilation Units](https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.3) | Java 프로그램이 컴파일 단위로 구성되고 소스 파일에 저장되는 구조 | 01 |
| [`javac` 명령](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html) | `.java` 소스를 클래스 파일로 컴파일하는 흐름과 `--release`가 언어·대상·공개 API 릴리스를 함께 선택하는 계약 | 01, 05, 06 |

## 타입·변수·메서드

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [JLS §4 Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) | 기본 타입과 참조 타입, 변수와 표현식의 정적 타입, 참조 값과 `null` | 01, 04 |
| [JLS §4.5 Parameterized Types](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5) | 제네릭 클래스·인터페이스의 타입 인수와 매개변수화 타입 | 04 |
| [JLS §8.4 Method Declarations](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4) | 메서드의 이름·형식 매개변수·반환 결과 선언 | 01, 06 |
| [JLS §8.4.5 Method Result](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.5) | 반환 타입 또는 `void`, 값을 반환하는 메서드 본문의 완료 규칙 | 01 |

## 연산·제어문·배열

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [JLS §10 Arrays](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html) | 배열 타입, 생성, 구성 요소, 길이와 배열 접근 경계 | 02 |
| [JLS §14 Blocks, Statements, and Patterns](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html) | `if`, `for`, 향상된 `for`, `try` 문과 실행 흐름 | 02, 05, 06 |
| [JLS §15 Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html) | 산술·비교·논리 연산, 단축 평가, 배열 접근과 객체 생성 표현식 | 02, 03 |

## 클래스·객체·캡슐화

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [JLS §8 Classes](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) | 클래스 선언, 필드·메서드 구성원, 접근 제어 | 03 |
| [JLS §8.8 Constructor Declarations](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8) | 생성자 이름·매개변수·본문과 객체 초기화 규칙 | 03 |
| [JLS §15.9 Class Instance Creation Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9) | `new`를 통한 클래스 인스턴스 생성과 생성자 선택 | 03 |

## 컬렉션·제네릭

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [Java SE 25 API `List<E>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html) | 순서·0 기반 인덱스·중복과 `get`·`add`·`size`, `contains`의 동등성 검사 계약, `List.of` 불변경성 | 04 |
| [Java SE 25 API `ArrayList<E>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html) | 수정 가능한 목록 구현과 `get` 상수 시간, 끝 추가의 분할 상환 상수 시간, 그 밖의 기본 탐색 연산의 선형 시간 | 04, 06 |
| [Java SE 25 API `Map<K,V>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html) | 고유 키와 값 연결, `put`·`get`·`containsKey` 계약 | 04 |
| [Java SE 25 API `HashMap<K,V>`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html) | 반복 순서 비보장, 적절한 해시 분산 가정 아래 기본 연산의 상수 시간 성능 | 04, 06 |

## 예외·디버깅·테스트

| 공식 문서 | 확인한 내용 | 반영 교안 |
| --- | --- | --- |
| [JLS §11 Exceptions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html) | 예외 발생·전파, 검사 예외와 비검사 예외 분류, 컴파일 시점 검사 | 05 |
| [Java SE 25 API `RuntimeException`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html) | 합리적인 프로그램에서 보통 의무적으로 선언할 필요가 없는 비검사 예외 계층 | 05 |
| [Java SE 25 API `Files.readString`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#readString(java.nio.file.Path)) | UTF-8 텍스트 읽기와 `IOException` 계약 | 05 |
| [Java SE 25 API `Integer.parseInt`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#parseInt(java.lang.String)) | 문자열의 정수 변환과 `NumberFormatException` 계약 | 05 |
| [Java SE 25 API `AssertionError`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AssertionError.html) | 학습용 예상값 비교 실패를 명시하는 최소 오류 타입 | 06 |

## 문서 사용 시 주의

- Java SE 25 명세는 정확성 확인 기준이고, 교안의 필수 코드는 Java 21 호환 범위만 사용합니다.
- 공식 명세 전체는 입문자에게 방대하므로 각 교안은 질문과 직접 관련된 절만 쉬운 문장으로 풀었습니다.
- `ArrayList`와 `HashMap`의 시간 복잡도는 해당 구현과 문서에 적힌 가정을 함께 설명합니다.
- 예제의 파일 읽기, 콘솔 출력과 테스트 결과는 실제 실행 전에는 확인된 결과로 표현하지 않습니다.
- 정식 Java 코드 실행·채점 인프라의 격리와 비용 정책은 콘텐츠 계약과 별도로 검증해야 합니다.
