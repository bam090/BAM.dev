# ADR 0005: 로컬 Docker Java 채점 경계

- 상태: 승인
- 날짜: 2026-08-19

## 맥락

Java 학습 코드는 브라우저 Worker에서 직접 실행할 수 없다. 외부 유료 채점 서비스나 원격 계정을 추가하지 않으면서 Quest와 코딩테스트의 기존 결과 DTO를 유지하려면, 정적 개발 서버 옆에 교체 가능한 로컬 실행 경계가 필요하다.

Security Manager는 JDK 24에서 영구적으로 비활성화되었으므로 Java 프로세스 안의 보안 경계로 사용할 수 없다. [JEP 486](https://openjdk.org/jeps/486)은 Security Manager에 의존하는 격리 설계를 새 기능의 기반으로 삼을 수 없음을 명시한다.

## 결정

브라우저의 `BrowserJavaCodeQuestRunner`는 same-origin `/api/java/execute`에만 JSON을 POST한다. 개발 서버는 `Host`가 `localhost`, `127.0.0.1`, `[::1]` 중 하나인지 확인하고, `Origin`의 authority와 `Sec-Fetch-Site`도 교차 확인한다. 요청과 응답은 기존 Code Quest 식별자와 `outcome`, `tests`, `summary`, `durationMs`, `limitsApplied`, `error`를 유지한다.

Java 요청에는 canonical `functionContract`에서 정규화한 `parameterTypes`와 `returnType`을 넣는다. 지원 타입은 `int`, `boolean`, `String`, `int[]`, `String[]`뿐이다. 학습자 소스 계약은 다음과 같다.

- 패키지 없는 `public class Solution`
- 문제의 `public static` entry point 하나
- 공개 콘텐츠에 포함된 테스트만 실행하며 서버가 테스트를 추가하지 않음

각 요청은 별도 임시 디렉터리를 만들고 `Solution.java`, 생성한 `BamJavaHarness.java`, 컴파일 결과를 분리한다. 컴파일은 다음 핵심 옵션을 고정한다.

```text
javac -proc:none -encoding UTF-8 --release 21
```

실행 JVM은 `-Xms16m -Xmx64m -Xss256k -XX:ActiveProcessorCount=1 -XX:-UsePerfData`를 적용한다. 컴파일·테스트·전체 실행 시간, 프로세스별·전체 출력, 반환값, 동시 실행 수를 제한한다. 옵션의 의미는 Oracle의 Java 21 [`javac` 문서](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html)와 [`java` 문서](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)를 기준으로 한다.

Java 21 실행 환경은 tag가 아닌 content digest로 고정한 로컬 이미지 `maven@sha256:3a4ab3276a087bf276f79cae96b1af04f53731bec53fb2e651aca79e4b10211e`만 사용한다. Docker client는 운영체제의 로컬 Unix socket만 자동 탐지하고 빈 client config를 사용해 원격 context를 따르지 않는다. 표준 경로가 아닌 로컬 설치는 `BAM_JAVA_DOCKER_EXECUTABLE`과 `BAM_JAVA_DOCKER_SOCKET`에 각각 절대 경로만 지정할 수 있으며 TCP 원격 daemon은 허용하지 않는다. 실행 전 daemon과 정확한 이미지가 이미 로컬에 있는지 검사하며 `--pull=never`를 고정한다. daemon이나 이미지가 없으면 설치·실행 안내와 함께 `engine_error`로 fail-closed하고, host JDK나 무격리 프로세스로 전환하는 환경 변수는 제공하지 않는다.

컴파일과 각 공개 테스트는 예측할 수 없는 고유 이름의 별도 컨테이너를 `docker create` 후 `docker start --attach`로 실행한다. 공통 경계는 `--network=none`, read-only root filesystem, `--cap-drop=ALL`, `no-new-privileges`, PID 64개, CPU 1개, 고정 memory/swap, 64 MiB `/tmp` tmpfs와 host의 non-root uid:gid다. host에서는 요청 임시 디렉터리 하나만 `/workspace`에 bind한다. 컴파일 컨테이너만 class 출력을 위해 이 mount를 쓸 수 있고, 테스트 컨테이너는 read-only로 다시 mount해 학습자 코드가 다음 테스트의 class나 harness를 바꾸지 못하게 한다.

채점 marker token은 argv·환경 변수·JVM system property에 넣지 않는다. Node가 `docker start --attach --interactive`의 stdin으로 한 줄만 전달하고 harness가 학습자 메서드를 부르기 전에 읽은 뒤 stdin을 닫는다. harness 내부 JDK 타입은 완전 수식하며 충돌하는 타입 선언을 preflight에서 거부한다. 응답 parser는 해당 token marker가 정확히 하나일 때만 결과로 승인한다.

정상 종료뿐 아니라 컴파일 실패, 런타임 오류, 취소, 시간·출력 초과에서도 정확한 고유 컨테이너 이름에만 `docker rm -f`를 적용하고 짧게 재확인·재시도한다. 그 뒤 요청 임시 디렉터리를 삭제한다. 컨테이너 생성과 실행을 분리하므로 client 종료와 생성 요청이 경합하는 구간에도 이름을 먼저 추적한다. 정리가 확인되지 않으면 학습자 정답으로 승인하지 않고 `engine_error`로 중단한다.

기존 `sandbox-exec` 후보는 네트워크와 쓰기를 막을 수 있었지만, 엄격한 파일 읽기 allowlist가 일부 JDK의 `javac`를 종료하기 어려운 상태로 만들었고 기능 자체도 폐기 예정이라 실행 경계에서 완전히 제거했다. strict 프로필이나 무격리 fallback을 호출하는 코드 경로는 남기지 않는다.

컴파일 전에 lexical preflight를 수행한다. 주석·문자열·문자 리터럴·text block을 공백으로 치환한 다음 토큰을 검사하므로 설명에 위험 API 이름이 있다는 이유만으로 거부하지 않는다. 다만 Java Unicode escape는 lexical analysis 전에 해석되어 토큰 검사를 우회할 수 있으므로 `\uNNNN` 표기 자체를 위치와 관계없이 fail-closed로 거부한다. 다음 범주는 보수적으로 거부한다.

- `package`, 추가 `public` top-level 타입, `native`, harness 예약 타입 shadowing
- `System.exit`, `System.load`, `System.loadLibrary`
- `Runtime`, `ProcessBuilder`, `ProcessHandle`, 추가 스레드 API
- 파일·네트워크 API
- reflection, class loading, `Unsafe`, `jdk.attach`, `com.sun.tools.attach`

## 보안 한계

이 설계는 로컬 개인 학습 중 host 파일 접근·네트워크 요청·무한 실행을 줄이는 다층 방어다. preflight는 Java 파서나 증명 가능한 보안 경계가 아니며, Docker daemon 자체는 host에서 강한 권한을 가진다. 이 로컬 경계는 신뢰하지 않는 여러 사용자의 코드를 받는 공개 서비스, 강한 다중 테넌트 격리, 정식 인증·보상 판정에 사용하지 않는다. Docker daemon 장애가 정리 시점까지 계속되면 정확한 이름의 컨테이너 정리가 지연될 수 있으므로 Docker Desktop에서 해당 이름을 확인해야 한다.

브라우저로 전달되는 문제와 테스트는 모두 공개다. 이 로컬 서버가 별도의 비밀·숨김 테스트를 보관하거나 추가한다고 표현하지 않는다.

## 원격 배포 검토(보류)

대화형 채점 API를 원격으로 옮긴다면 안정적인 HTTPS endpoint를 제공하는 [Cloud Run Service](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)가 요청·응답 모델에 더 가깝다. 반면 [Cloud Run Job](https://docs.cloud.google.com/run/docs/create-jobs)은 요청을 수신하는 서버가 아니라 작업을 실행하고 종료하는 모델이므로 브라우저의 동기 실행 API를 직접 대체하지 못한다. 2026-08-19에 확인한 [Cloud Run 가격 문서](https://cloud.google.com/run/pricing)는 us-central1 request-based Service 무료 구간을 월 180,000 vCPU초·360,000 GiB초·200만 요청, Job 무료 구간을 월 240,000 vCPU초·450,000 GiB초로 안내하지만 Job 실행 인스턴스당 최소 1분 과금 경계가 있다. 무료 구간 초과, Cloud Build, Artifact Registry 등의 비용도 별도일 수 있다. [OCI Functions](https://docs.oracle.com/en-us/iaas/Content/Functions/Concepts/functionsoverview.htm)도 관리형 다중 테넌트 실행, 클라우드 계정·IAM과 과금 경계를 전제로 한다.

이번 단계는 무료 로컬 실행만 승인된 범위다. 따라서 클라우드 프로젝트·계정·Service·Job·Function을 만들거나 배포하지 않으며, 원격 운영 환경과 비용 승인은 별도 단계로 보류한다.

## 결과

- 외부 채점 서비스·계정·과금 없이, Docker Desktop과 고정 이미지가 준비된 로컬 환경에서 Java 21 호환 코드를 채점할 수 있다.
- Docker daemon이나 고정 이미지가 없는 환경과 정적 배포에서는 학습 콘텐츠를 읽을 수 있지만 Java 실행은 명시적으로 실패한다.
- 향후 원격 채점기로 교체해도 브라우저와 UI의 report DTO는 유지할 수 있다.
- 다중사용자 실행이 필요해지면 OS 컨테이너 또는 별도 VM 기반 서비스와 별도의 신뢰 경계를 설계해야 한다.
