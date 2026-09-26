# 브라우저 Java 17 컴파일러 자산

- ECJ: `org.eclipse.jdt:ecj:3.33.0`; 원본 JAR `https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.33.0/ecj-3.33.0.jar`, 원본 POM `https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.33.0/ecj-3.33.0.pom`.
- ECJ JAR SHA-256 `f7686c4960cf70c2ebc5c500a73a8cfc04541b730c18f1c5c21329889b137f45` (3,160,927 bytes); POM SHA-256 `266c17d4f1cbd10b71bdec390e1f64acdc95e61d618cf4a2ea86ea903337bf88`.
- ECJ 라이선스: Eclipse Public License 2.0. POM과 JAR의 `about.html`에 명시돼 있으며 공식 `EPL-2.0.txt`를 함께 보존한다.
- JUnit: 저장소 `desktop/runtime-lock.json`과 동일한 `junit-platform-console-standalone:6.1.3`; 원본 JAR `https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/6.1.3/junit-platform-console-standalone-6.1.3.jar`, SHA-256 `e62b96ac475dbcde8599ea905d088f65d90778f86e259b856a49fa5c4ea256ec` (2,997,949 bytes). JAR의 `META-INF` 라이선스·공지 파일은 `junit-notices/`에 원본 바이트로 보존한다. JUnit 본체는 EPL-2.0이며 포함 구성요소 고지는 해당 파일을 따른다.

우리 신뢰 helper 소스는 `runtime/java-browser/compiler/JrtCompiler.java`(SHA-256 `8900d02f22897c93fa16a095de4c10657127f8defd37500fcfb99198f693f876`)다. CheerpJ 4.3의 Java 17 `jrt:/modules/java.base` 실제 표준 클래스와 위 ECJ를 이용해 브라우저 안에서 `-8 -bootclasspath /files/java17-bootstrap.jar -classpath /app/ecj-3.33.0.jar -proc:none`으로 helper만 class 52로 빌드했다. 학습자 소스는 별도로 source/compliance/target 17, preview off, annotation processor off로 컴파일한다. 빌드용 Java 17 클래스 ZIP은 제품에 포함하지 않는다. CheerpJ runtime도 저장소에 복제하지 않고 공식 4.3 CDN에서 로드한다.

| 신뢰 class | bytes | SHA-256 | Java class major |
| --- | ---: | --- | ---: |
| `JrtCompiler.class` | 6665 | `ec720b7421b94d8b37723d81379194b2e760257f0d620cd2e7897bf624eac771` | 52 |
| `JrtCompiler$JrtNames.class` | 4463 | `943cc4fe7caea186c9857b5a0fe4a3f74be71a75ac3d508c73f6288a1cffcfde` | 52 |
| `JrtCompiler$1.class` | 3411 | `964d4182e7ec5f297f153a2f8fee9527f7d808b849dde13868c8a3c881b4bd5b` | 52 |
| `CtBrowserRunner.class` | 8398 | `c5973d28cb64f9a71b897c4cbba3bdff3068489878b966cfe05f52f59196f6bb` | 61 |

`CtBrowserRunner.java` 소스 SHA-256은 `74e707314e2c8ea68afaca7c162e0de0cc20de250462d6e702685383abed7c62`이다. 브라우저 ECJ에서 실제 Java 17 JRT·고정 JUnit JAR와 원본 첫 CT 공개 Test·adapter·SolutionInvoker를 함께 제공해 class 61/minor 0으로 빌드했다. 신뢰 runner는 원본 테스트를 바꾸지 않고 JUnit `selectMethod`의 실행·집계를 typed JSON으로 돌려준다. 제품의 컴파일 Worker는 학습자 class를 로드하거나 실행하지 않는다.

현재 이름 탐색은 `java.base`의 `java`/`javax` 패키지와 고정 JUnit JAR에 한정된다. 위 helper 단독 빌드 증거만으로 Java 17 모든 모듈·API나 CT 72개 지원을 주장하지 않는다. CT 72문제·공개 JUnit 메서드 그룹 168개·호출 501개는 별도 제품 경로 전수 검증으로 확인했으며, 그중 42번째 기준 풀이는 원본 Java 25 API 한 곳을 Java 17용으로 바꾼 파생본을 사용했다. `/str`은 패키지 하위 디렉터리를 받지 않으므로 검증된 class bytes는 메모리 JAR로 묶어 별도 실행 Worker에 전달한다.
