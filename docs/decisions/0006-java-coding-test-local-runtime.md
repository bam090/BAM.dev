# ADR 0006: Java 코딩테스트의 원본 JUnit 공개 평가

- 상태: `[확정 결정]` 2026-09-22 후속 Java 코딩테스트 실행 요청의 구현 전 계약. `[현재 사실]` CT runner·typed adapter·IPC·UI 연결과 검증 커널의 정상·오류·대표 앱 검증을 독립 PASS했고 해당 환경의 CT gate를 활성화했다. 실행·재사용·상세 결과 복원 한계는 작업 카드를 따른다. 정식 설치·OS 확대·Git 완료를 뜻하지 않는다.
- 범위: 기존 Java 72문제의 원본 공개 JUnit 소스를 변환하지 않는 로컬 실행. Quest와 별도 capability·IPC·manifest·결과·진도를 사용한다.
- 실행 안전 정본: [ADR 0005](0005-java-quest-local-runtime.md). 단계별 증거·역할·중단 조건: [작업 카드](../work-items/2026-09-22-java-coding-test-runtime.md).

## 선택과 보존

Java 25 CT 제품 runner와 typed packaged adapter를 두고 기존 Quest의 안전 감독 경계를 재사용한다. 원본 `publicTestSource`, provider/helper, 최대 길이 생성, identity·입력 불변·tolerance assertion은 그대로 선컴파일한다. 원본 `bridge.*.solution.*` 호출에 대응하는 adapter가 기본 package의 학습자 `Solution.solve`를 reflection으로 호출한다. Java 언어의 package 접근 제한을 넘는 연결만 맡으며 원본 테스트나 사용자 소스를 문자열 치환하지 않는다.

정적 조사상 starter 72개는 모두 기본 package `public class Solution`의 `public static solve`이며 서명은 50종이다. 168개 공개 method의 이름 중복/overload는 없지만 테스트 class 19개가 package-private이므로 public class만 탐색해 누락하지 않는다. parameterized 72개는 MethodSource 70개·CsvSource 2개이며 provider는 로컬 단순 이름이다. 이 조사는 실제 호환 실행 PASS가 아니다.

인수·반환 배열과 중첩 배열은 복사·JSON 왕복 없이 같은 참조를 전달한다. 원본 객체의 변경·alias·새 참조 assertion과 primitive/배열 타입을 보존한다. 실패 예외를 성공값으로 대체하지 않는다. 대상 12타입의 정확한 메서드 서명과 adapter 대응은 고정 manifest로 검증하고 임의 클래스·메서드·classpath 입력은 허용하지 않는다. 원본 테스트에 없는 검사를 학습자 채점에 추가하지 않는다.

문제 ID·revision·순서·본문·공개 Test 소스·예시·L1~L4 지원, 기존 Quest·CT 초안/제출/완료를 보존한다. 기존 Java draft는 검증 전까지 실행 차단을 유지한다. 이 변경은 원본 평가 의미를 바꾸지 않는 일반 제품 기능이며 새 교육 콘텐츠를 만들지 않는다.

## JUnit 고정 배포물

[공식 릴리스](https://github.com/junit-team/junit-framework/releases/tag/r6.1.3)의 GA 6.1.3(2026-08-07)과 [Console standalone 문서](https://docs.junit.org/6.1.3/running-tests/console-launcher.html)에 따라 JAR 하나를 앱 bundle에 고정한다.

| 항목 | 값 |
| --- | --- |
| 좌표 | `org.junit.platform:junit-platform-console-standalone:6.1.3` |
| 파일 | `junit-platform-console-standalone-6.1.3.jar` |
| URL | [Maven Central 고정 JAR](https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/6.1.3/junit-platform-console-standalone-6.1.3.jar) |
| SHA-256 | `e62b96ac475dbcde8599ea905d088f65d90778f86e259b856a49fa5c4ea256ec` |
| 크기 | 2,997,949 bytes |
| 확인 | 임시 다운로드 바이트의 계산값과 [공식 checksum](https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/6.1.3/junit-platform-console-standalone-6.1.3.jar.sha256) 일치. JAR 실행은 하지 않음 |

포함 모듈은 Jupiter API/engine/params, Platform commons/console/engine/launcher/reporting/suite API·engine, Vintage 6.1.3, JUnit 4.13.2, APIguardian 1.1.2, Hamcrest-core 1.3, OpenTest4J 1.3.0, reporting SPI 0.2.5다. relocated FastCSV 4.2.0·picocli 4.7.7도 포함하며 버전은 [공식 태그의 dependency 목록](https://github.com/junit-team/junit-framework/blob/r6.1.3/gradle/libs.versions.toml)과 JAR 내용으로 확인했다. JSpecify·Kotlin은 manifest의 optional import이며 이 Java 작업을 위해 별도 추가하지 않는다.

JAR 내부 `META-INF/LICENSE.md`(EPL-2.0), `LICENSE-junit4`(EPL-1.0), `LICENSE-hamcrest`(BSD), `LICENSE-fastcsv`(MIT), `LICENSE-picocli.md`·`LICENSE-open-test-reporting.md`(Apache-2.0), `LICENSE-notice.md`와 출처·소스 취득 안내를 패키지 고지에 보존한다. 다운로드·업데이트는 개발/패키징 준비 때만 수행하고 학습 중 네트워크는 0이다. 버전 변경은 hash·license·원본 호환성·영향 실행을 다시 검토하며 자동 최신 버전을 쓰지 않는다.

단일 JAR는 오프라인 classpath와 무결성 검증을 단순하게 하고 Maven/Gradle 추가를 피한다. 비용은 약 3 MB와 미사용 Vintage/JUnit4를 포함한 업데이트·고지 관리다. 실행 engine은 Jupiter로 제한한다. JUnit 6의 최소 Java 17은 번들 Java 25 기준을 낮추지 않는다. [JUnit 6 이전 안내](https://github.com/junit-team/junit-framework/wiki/Upgrading-to-JUnit-6.0)의 제거된 deprecated API·JRE 조건·nullability 변경은 실제 원본 컴파일/실행으로 확인하며 호환성을 추측하지 않는다.

## 실행 단위와 결과 계약

1. 신뢰된 bundle manifest가 문제 ID/revision과 공개 testId를 정확한 class/method에 연결한다. `run`은 첫 공개 method 그룹 하나를 고정 `runTestIds`로 선택하고(한 그룹 문제는 전체와 동일), `submit`은 해당 revision의 전체 공개 method 목록을 순서대로 실행한다. renderer가 selector·provider·경로를 구성하지 않는다.
2. 공개 method마다 새 격리 JVM을 만든다. 한 parameterized method의 invocation들은 그 JVM에서 실행·집계한다. invocation마다 fresh JVM이라고 주장하지 않으며 method 사이 static 상태는 새 JVM으로 분리한다. discovery/provider/helper도 같은 격리 내부에서 실행한다.
3. 부모는 요청 ID·문제/revision·선택 testId·method 대응·실행 순서와 집계 결과를 대조한다. invocation 총수는 실제 실행으로 확정하며 기존 168개 method 묶음을 invocation 수로 표시하지 않는다. 누락·중복·다른 ID·깨진 protocol·0 discovery·skip·abort·provider/infrastructure 오류는 성공이 아니다.
4. 컴파일 오류는 기존 컴파일 오류 분류, assertion 실패는 `wrong_answer`, 학습자 예외는 `runtime_error`, 0/skip/abort·provider/infrastructure/protocol 오류는 `engine_error`, 실제 사용자 취소는 `cancelled`로 구분한다. 시간·출력·메모리 제한과 미실행은 기존 감독 결과를 보존한다. JUnit 콘솔 문자열이나 exit 0만으로 PASS하지 않고 구조화 결과·필수 개수·상태와 종료/회수 증거를 함께 확인한다.
5. `run` 성공은 완료를 기록하지 않는다. `submit`의 해당 revision 전체 공개 method와 실제 invocation이 빠짐없이 PASS한 경우에만 기존 CT 완료를 기록한다. 취소·창 닫기·오류 뒤 후속 method는 `not_run`이며 거짓 성공을 만들지 않는다.

CT 전용 capability·IPC·bundle manifest와 결과 경로를 둔다. 요청 DTO는 `problemId`, `revision`, `source`, `requestId`, `mode`만 허용하며 실행 선택은 신뢰 manifest에서 정한다. Quest의 ID·IPC·진도에 CT 요청을 보내거나 두 기능의 완료를 합치지 않는다. renderer는 JUnit·파일·process·일반 IPC를 직접 다루지 않으며 기존 main-frame/origin·요청 검증을 유지한다. 웹에 native host·개발 서버 exec endpoint·시스템 JDK fallback을 추가하지 않는다.

## 안전·산출물·활성화

최소 runtime metadata 보완과 그 실제 검증은 [작업 카드](../work-items/2026-09-22-java-coding-test-runtime.md#sim06-실패와-최소-metadata-보완)에 기록한다. 기존 exact OS/kernel·darwin/arm64 제한, 번들 JDK 25, `--release 25`·preview off·processor off, 고정 classpath, compile/runtime profile, 시간·출력·메모리·프로세스 경계를 유지한다. 기존 3초·64 MiB를 공개 method 그룹 상한으로 유지한다. JUnit overhead가 이 예산에 맞는지는 새 실제 검증 gate이며 임의로 상향하지 않는다. main의 activeRun/cancel 잠금은 Quest·CT가 공유한다. Quest와 CT를 포함해 한 번에 한 실행만 허용하고 취소·창 닫기·종료의 abort→TERM→회수 및 관찰 불명/cleanup 실패의 poison을 보존한다. signal 발송을 reap으로 계산하지 않는다. 새 JAR/class 읽기 경로가 기존 profile에 맞는지 사전 검토하며 권한을 자동 확대하지 않는다.

기존 Quest class 2개의 provenance와 CT runner·adapter·원본 test/provider/helper class의 provenance는 별도로 관리한다. CT source·JUnit JAR·빌드 조건·정확한 class 목록/hash를 bundle receipt에 연결하고 missing/stale·변조·누락·extra·symlink를 거부한다. runtime-only staging은 기존 검증 class의 재사용을 새 컴파일로 기록하지 않는다. 현재 Quest provenance를 CT class로 덮어쓰지 않는다.

기존 Quest 검증 gate=true를 유지한 채 CT gate=false로 source/fake 구현을 시작했다. 이후 독립 실제 검증을 인수해 제품 CT gate=true로 전환했다. 아래는 같은 단계의 재검증에도 적용하는 활성화 계약이다. 독립 preflight 뒤 실제 검증용 private clone에서만 CT gate를 명시 전환하고 freeze·manifest에 기록한다. 실제 PASS 뒤에만 제품 CT gate를 전환하고 영향 검사를 수행한다. renderer/env로 gate를 우회하지 않는다. CT capability는 검증 전 차단한다. source/fake 검사→독립 안전 preflight→고정 staging 실제 실행→독립 UI·최종 통합 순서를 따르며 각 실행 사례·상한·예상 결과·회수·원본 보존을 사전에 고정한다. 실패하면 즉시 중단·증거 보존 후 해당 역할에 반환하고 무단 재시도·우회하지 않는다. 검증한 환경만 활성화하며 OS 확대·정식 설치본·DMG·서버·Spring·원격 채점은 범위 밖이다.
