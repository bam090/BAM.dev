# ADR 0005: Java Code Quest의 번들 JDK와 로컬 프로세스 평가

`[현재 사실]` 이 문서는 별도 미게시 로컬 작업의 Java/desktop 후보 설계와 격리 실패 이력이다. 아래 desktop 파일 경로·명령·해시는 당시 로컬 증거이며 이 브라우저 게시 작업본에 해당 소스·JDK·Electron·desktop 스크립트가 있다는 뜻이 아니다. 이 문서의 보존은 실행·설치 지원이나 실행 재개 승인이 아니다.

- 상태: `[확정 결정]` 2026-09-15 Java 실행 지원 요청의 제한된 prototype 계약. **실제 격리 prototype은 FAIL / BLOCKED이고 Java 실행 지원은 미완료**다. 아래 실행 절은 비활성 후보 계약이며 검증된 기능 설명이 아니다.
- 범위: macOS 14.8.3·Apple Silicon 검증 장비, 첫 Java Code Quest와 승인된 배열 3개의 비활성 실행 후보, 기존 정적 앱의 Electron shell. 제품 범위는 [`DEC-JAVA-QUEST-RUNTIME-01`](../roadmap.md#2026-09-15-java-실행-지원-결정)과 [배열 편입 계약](../content-schema.md#algorithm-bridge-java-배열-quest-편입), 실행·패키징 상태는 [작업 카드](../work-items/2026-09-15-java-code-quest-runtime.md)를 따른다.

## 선택과 이유

기존 Electron 후보를 유지하고 고정 배포 ZIP과 Node 내장 파일 기능으로 로컬 `.app`을 조립한다. DMG는 초기 설계 후보였으나 `hdiutil` 실행을 자동 승인 검토가 Java 실행 지원과 별도의 설치·패키징 승인 범위라는 이유로 거부했다. 재시도하지 않으며 이번 Java 실행 지원의 필수 완료 gate에서 분리한다. 로컬 `.app` 실행 검증과 Java 격리 성공은 여전히 필요하다. 별도 npm 패키저·React 이관·Swift UI·Maven·Gradle·HTTP 서버를 추가하지 않는다. WKWebView는 현재 Chromium Worker·동적 컴파일·custom origin 계약을 다시 검증할 경계가 커서 이번에 병행하지 않는다. Electron의 Chromium sandbox가 Java 자식 프로세스까지 보호한다고 가정하지 않는다.

## 현재 실행 판정과 재개 조건

`[현재 사실]` macOS 14.8.3 arm64에서 `sandbox-exec`로 시작한 번들 `javac`가 `UEs` 상태에 남았고 SIGKILL 발송 뒤에도 종료·reap을 관찰하지 못했다. 무격리 상태의 Java 제품 runner 컴파일만 통과했으며 실제 격리 학습자 컴파일·공개 평가·자원/파일/네트워크 부정 검증은 통과하지 못했다. 중간 profile별 hash가 보존되지 않아 최종 profile로 이전 PID의 원인을 확정할 수 없고, 독립 진단도 원인을 특정하지 못했다. 상세 관찰과 최종 파일 hash는 [작업 카드](../work-items/2026-09-15-java-code-quest-runtime.md#격리-실패와-재개-조건)를 따른다.

`desktop/runtime/supervisor.mjs`는 `ISOLATION_PROTOTYPE_VALIDATED = false`로 고정되어 있다. capability는 false이며 `runJavaQuest()`는 subprocess를 만들지 않고 `engine_error` / `java_isolation_unavailable` 및 공개 사례 `not_run`을 반환한다. 새 Java/JDK 실행과 추가 profile 실험은 중지했다. Java 콘텐츠·schema·프런트 연결의 정적 검사와 `.app` 생성이 이 gate를 해제하지 않는다.

재개 전에는 종료 불능 원인과 프로세스 회수 가능 상태를 확인하고 격리·수명주기 설계를 독립 검토해야 한다. 후보 감독 코드의 hard deadline·poison 처리는 무한 대기를 피하는 보완일 뿐 reap 성공이 아니다. `unreaped_process` 뒤 `finally`가 작업 디렉터리를 삭제하는 후보 경로도 보존·정리 순서를 고친 후 검증해야 한다. 성공한 독립 실행 환경과 동일 bundle/profile의 실제 종료·정리 및 필수 부정 검증 증거가 생기기 전에는 고정 false gate를 해제하지 않는다. 재부팅을 자동 실행하거나 신호 전송을 프로세스 정리 완료로 기록하지 않는다.

Java 25로 작성한 `BamQuestRunner`는 학습자 클래스의 허용된 정적 메서드 한 번을 호출한다. Electron main의 감독 코드는 고정 JDK 경로·sandbox·시간·출력·종료를 관리한다. 컴파일과 학습자 실행은 모두 sandbox가 적용된 별도 프로세스이며, 공개 테스트마다 새 JVM을 만든다. 부모가 학습자 클래스를 로드하지 않는다. Java Security Manager를 격리 수단으로 삼지 않는다.

## 고정 배포물과 업데이트

2026-09-15 공식 release와 assets에서 아래 버전·배포 파일·SHA-256을 확인했다. 표의 용량은 upstream 압축 파일 표시이며 설치 크기 측정은 아니다. 다운로드 후 **실제 바이트의 hash 일치 전에는 실행하거나 패키징하지 않는다**.

| 배포물 | 고정 파일과 SHA-256 | 출처·비용 |
| --- | --- | --- |
| Eclipse Temurin JDK `25.0.4.1+1`, HotSpot, macOS aarch64 | `OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.4.1_1.tar.gz`; `61979887f7506a24a57439ff99adb8b3a7fc89977d9cfe3b8984f58a981b7b9d` | [공식 release assets](https://github.com/adoptium/temurin25-binaries/releases/expanded_assets/jdk-25.0.4.1%2B1), [고정 다운로드](https://github.com/adoptium/temurin25-binaries/releases/download/jdk-25.0.4.1%2B1/OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.4.1_1.tar.gz). 약 130 MB. javac를 포함한 전체 JDK를 보존하며 축소 이미지 작업을 추가하지 않음 |
| Electron `44.3.0`, darwin arm64 | `electron-v44.3.0-darwin-arm64.zip`; `49b91ef265c603c8888500f807484b63816069c30f87ba2b403e7c87f0f45035` | [공식 release assets](https://github.com/electron/electron/releases/expanded_assets/v44.3.0), [고정 다운로드](https://github.com/electron/electron/releases/download/v44.3.0/electron-v44.3.0-darwin-arm64.zip). 약 124 MB. 기존 Chromium 기능 재사용의 대가로 shell 크기·보안 업데이트 비용이 생김 |

버전·URL·checksum·플랫폼은 `desktop/runtime-lock.json`에 정확히 고정한다. 다운로드는 개발/패키징 준비 때만 수행하고 앱 첫 실행·학습 중에는 네트워크를 사용하지 않는다. archive 경로 traversal·절대 경로·bundle 밖으로 나가는 symlink를 거부하고 JDK 내부의 정상 상대 symlink는 보존한다. 패키지의 `Contents/Resources/runtime/jdk/Contents/Home/bin/{java,javac}`만 해석한다. 임시 prototype도 동일한 `.app` staging 구조를 먼저 만들며 시스템 `JAVA_HOME`, `PATH`, `/usr/bin/java`, 자동 설치 fallback을 사용하지 않는다.

Temurin은 [공식 FAQ](https://adoptium.net/docs/faq)의 GPLv2 + Classpath Exception 및 배포물별 고지를 따른다. JDK `legal/`, `release`, 라이선스와 출처를 그대로 보존한다. Electron [MIT 라이선스](https://raw.githubusercontent.com/electron/electron/v44.3.0/LICENSE)와 Chromium 등 동봉된 제3자 고지도 보존한다. 바이너리를 외부 재배포할 때는 해당 JDK 빌드의 대응 소스 제공 조건까지 충족해야 하며 공급자 URL 하나를 기록한 것만으로 그 검사를 완료했다고 하지 않는다. 이번 로컬 prototype은 공개 배포·상용 서명·notarization 완료가 아니다.

자동 업데이트는 넣지 않는다. 이후 패키지 작성 시 JDK 25 보안 패치와 지원되는 Electron stable 보안 릴리스를 확인하고 lock을 명시적으로 갱신한다. 버전·JDK·OS·sandbox profile 변경은 영향을 받는 컴파일/격리/오프라인 smoke를 무효화한다. 검증한 이전 lock으로 되돌릴 수 있으며 사용자 진도를 삭제하지 않는다.

## 앱 origin과 최소 IPC

- 앱은 `bam://app/`의 고정 origin에서 `dist` 정적 자산만 제공한다. `standard`, `secure`, `supportFetchAPI`만 필요한 값으로 켜고 `bypassCSP`는 켜지 않는다. 요청 메서드·host·정규화 경로를 검사해 허용 자산 밖 접근과 traversal을 거부한다. `file://` 일반 접근·localhost·수신 포트는 제공하지 않는다. [Electron protocol 문서](https://www.electronjs.org/docs/latest/api/protocol)
- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`를 유지한다. 새 창·외부 navigation·권한 요청·원격 네트워크는 거부하고 임의 `shell.openExternal`도 노출하지 않는다. preload의 고정 함수만 노출하며 `ipcRenderer`, `fs`, `process`, 일반 실행 기능을 전달하지 않는다. [Electron 보안 지침](https://www.electronjs.org/docs/latest/tutorial/security)
- renderer CSP는 `eval`·`Function`을 거부한다. 기존 JavaScript one-shot Worker가 필요한 동적 컴파일 허용은 Worker 응답의 CSP에서만 제공한다. HTML/CSS sandbox·blob/data 사용은 기존 필요한 자원 종류로 제한하고 앱 전체의 `unsafe-eval`이나 web security 해제를 하지 않는다. Java 지원을 이유로 기존 JavaScript 평가기를 교체하지 않는다.

`window.bamJava`의 공개 API는 다음 세 가지로 제한한다. Java 없는 브라우저에서는 객체 자체가 없으며 웹 앱은 계속 동작한다.

| API | 계약 |
| --- | --- |
| `capabilities()` | `{contractVersion: 1, evaluationKind: "java-static-method-v1", available: boolean, reason?: string}`. main이 검증 장비·번들 파일·sandbox 초기화 가능 상태로 판정. 파일 경로·환경 변수는 반환하지 않음 |
| `run({requestId, questId, revision, source})` | plain record의 정확한 네 필드, source UTF-8 최대 20 KiB. main이 bundle의 Quest ID·revision을 찾아 **공개 테스트·서명·제한을 직접 선택**. renderer가 보낸 test/expected/경로/명령/환경/timeout/클래스명을 받아 실행하지 않음 |
| `cancel({requestId})` | 요청한 동일 webContents/mainFrame 소유의 실행만 취소. 그 밖의 PID나 실행을 지정할 수 없음 |

main은 모든 메시지의 실제 sender가 해당 BrowserWindow의 살아 있는 mainFrame이며 URL origin이 정확히 `bam://app`인지 검사한다. source는 데이터로 파일에 쓰며 shell 문자열로 조립하지 않는다. 앱 전체 Java 실행은 한 번에 하나이며 새 실행은 이전 실행 종료·정리 완료 후 시작한다. 새 요청에서 끝난 requestId 재사용/늦은 응답을 현재 결과로 수용하지 않는다. 창 닫기·종료·route 이탈 취소는 같은 cleanup 경로를 따른다.

## 첫 실행 콘텐츠와 프로토콜

첫 pilot의 콘텐츠는 `quest-java-total-price` 하나다. `Solution.java`의 `public class Solution` 안에 `public static long totalPrice(int price, int quantity, int shippingFee)`를 작성한다. 전체 source를 편집하지만 UI 안내와 starter는 메서드 본문을 첫 작성 위치로 보여 준다. Java 문법을 JS로 번역하거나 문자열 패턴으로 답안을 채점하지 않는다. [Java 콘텐츠 계약](../content-schema.md#java-정적-메서드-quest-pilot)이 데이터의 정본이다.

1. main이 생성한 UUID 임시 디렉터리에 고정 이름 `Solution.java`를 쓴다. 신뢰한 bundle에서 읽은 runner·manifest 경로와 직접 생성한 임시 경로만 subprocess 인수가 된다. 실행 환경은 새 allowlist로 만들고 `JAVA_TOOL_OPTIONS`, `_JAVA_OPTIONS`, `JDK_JAVA_OPTIONS`, `CLASSPATH`, `DYLD_*` 및 비밀 환경을 상속하지 않는다. HOME·TMPDIR·user.home·java.io.tmpdir는 해당 임시 공간으로 설정한다.
2. 번들 `javac`를 별도 compile profile 아래에서 `--release 25 -encoding UTF-8 -proc:none -implicit:none`과 명시적인 빈 classpath·고정 source/output 경로로 실행한다. `--enable-preview`·processor·사용자 compiler option을 받지 않는다. 컴파일 오류 출력은 제한된 일반 텍스트로만 보여 준다. [Java 25 javac 문서](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html)
3. 컴파일 성공 뒤 publicTests 순서대로 새 JVM에서 신뢰한 Java `BamQuestRunner`를 실행한다. runner classpath는 번들의 runner를 먼저, 이번 source의 classes를 뒤에 둔다. 서명은 public/static·int 3개·long 반환인지 확인한다. runner는 manifest에서 선택한 세 int 값을 전달하고 long 반환 또는 예외 종류를 내보낸다. 학습자 코드가 추가 파일·프로세스·네트워크를 얻도록 reflection/JNI 권한 예외를 만들지 않는다.
4. 구현된 비활성 후보의 자식 결과는 fd 3의 **4-byte big-endian payload 길이 + 단일 UTF-8 record**다. payload는 `returned\n<정규 10진 long>` 또는 `runtime_error\n<오류 설명의 padding 없는 base64url>`이며 부모가 각각 returned/actual 또는 runtime_error/message 객체로 해석한다. 길이·trailing byte·정규 정수/base64를 검사한다. stdout/stderr는 별도로 합산 제한하며 malformed record를 성공으로 추정하지 않는다. parser의 정적 검사는 통과했지만 실제 격리 JVM의 이 채널 전송은 미검증이다. `long`을 JS number로 변환하지 않는다.
5. 부모가 bundle의 expected와 actual을 비교해 공통 Quest 실행 결과를 만든다. 자식이 `passed`나 기대값을 결정하지 않는다. 정상 불일치는 `wrong_answer`; javac 오류는 `syntax_error`와 컴파일 단계 설명; 예외는 `runtime_error`; 감독이 끊은 시간/출력은 각각 `timeout`/`output_limit`; 사용자가 끊으면 `cancelled`; 부재·격리 실패·잘못된 프로토콜·비정상 실행기 종료는 `engine_error`; 미실행 사례는 `not_run`이다. 메모리 제한은 기존 DTO를 불필요하게 확장하지 않고 `runtime_error`에 제한 원인을 명시한다.
6. 끝난 프로세스를 reap하고 핸들·타이머를 닫은 뒤 임시 source/classes를 삭제해야 한다. timeout/취소에서는 process group 종료 후 잔여 프로세스가 없는지 확인한다. reap되지 않으면 성공한 cleanup으로 처리하지 않고 작업 공간을 보존하는 경로가 필요하며 현재 후보의 `finally`는 재활성화 전 보완 대상이다. 성공 기록은 전체 공개 사례 PASS 때만 기존 Quest 저장소에 넣는다.

자식 프로세스와 학습자 코드는 같은 JVM에 있으므로 프로토콜 spoofing까지 방지하는 인증 채점기가 아니다. 공개 입력을 하드코딩하거나 로컬 앱/진도/출력을 변조할 수 있는 자기학습 제품의 기존 한계는 유지한다. 이 한계가 renderer에 임의 OS 실행 권한을 주거나 격리를 생략하는 근거는 아니다.

### 배열 세 문제의 비활성 프로토콜 확장

`[확정 결정]` ARR-01·ARR-02·QUE-01 편입에 필요한 배열 입출력·원본 보존·새 참조 관찰만 추가한다. 아래는 구현 대상으로 고정한 **비활성 후보 계약**이며 실제 JVM 통과가 아니다. 기존 pilot의 argv·`returned\n<long>`·4 KiB frame, IPC 요청 네 필드, 고정 false gate와 격리·시간·stdout/stderr 제한을 유지한다. [공개 데이터 정본](../content-schema.md#algorithm-bridge-java-배열-quest-편입)에 없는 타입·관찰식을 해석하지 않는다.

1. 부모는 bundle에서 Quest ID/revision·서명·공개 입력을 선택한다. 새 배열 경로의 argv는 고정 `--array-v1`, `solve`, 세 허용 signature 중 하나(`int-array-int-int-to-int-array`, `int-array-int-int-to-int`, `int-array-to-int-array`)다. renderer가 signature·입력·expected를 지정하지 않는다.
2. 입력은 stdin 단일 binary record로 전달한다. 첫 signed int32 big-endian은 첫 배열의 길이, 뒤에는 길이만큼 signed int32 big-endian 원소, 3인수 서명에는 마지막 두 int32를 차례로 붙인다. 길이 0..100000·서명별 정확한 원소 수·후행 바이트 부재를 검사하며 최대 400012 byte다. argv에 대형 배열 문자열을 넣거나 임의 파일 경로·JSON 파서를 노출하지 않는다. 부모는 write 오류·조기 종료도 기존 감독 수명주기로 처리한다.
3. runner는 세 정확한 public/static 서명을 검증하고 호출 전에 첫 배열을 복제한다. 호출 뒤 값 동등성으로 `argument0Unchanged`, 참조 부등성으로 `returnNotArgument0`를 계산한다. ARR-02는 반환 int만 관찰한다. null 배열 반환이나 반환 타입 불일치는 runtime_error이며 예상 출력처럼 채우지 않는다.
4. fd 3의 외부 frame은 기존 4-byte big-endian payload 길이를 유지한다. 새 int 반환 payload는 `returned_int\n<정규 int32>`, 배열 반환은 `returned_int_array\n<정규 int32 CSV>\n<true|false>\n<true|false>`다. 두 boolean 순서는 원본 불변·새 참조다. 빈 배열은 CSV가 빈 문자열이다. 불필요한 공백·`+`·선행 0·소수·범위 초과·추가 record·trailing byte·관찰 누락을 거부하며 서명에 맞지 않는 반환 tag도 거부한다. runtime_error는 기존 base64url record를 유지한다.
5. 새 배열 경로에만 fd 3 payload 최대 2 MiB를 적용한다. 최대 100000개의 int32를 담기에 충분하며 read 중 상한을 검사한다. 기존 pilot payload 상한 4 KiB와 stdout+stderr 32 KiB는 늘리지 않는다. 배열 결과 길이는 최대 100000이고 비교는 전체 값·순서 및 필수 두 관찰을 포함한다. 원본 훼손·같은 참조이면 값이 맞아도 wrong_answer다.
6. 부모가 공개 expected/observations와 비교해 결과를 만들고 learner에게 실제 값과 실패 관찰을 설명한다. 자식은 expected·passed를 결정하지 않는다. 기존 long 문자열 비교도 정확히 유지한다. 큰 배열 UI는 [공개 데이터 표시 계약](../content-schema.md#algorithm-bridge-java-배열-quest-편입)으로 요약하되 모든 값에 접근할 수 있어야 한다.

Node 단위 검사는 최대 길이 입력/출력, 빈 배열, signed int32 경계, 짧거나 과한 입력, 잘못된 길이·tag·CSV·boolean·후행 데이터, 관찰 false/누락, 배열 값 불일치, 기존 long/pilot 호환을 확인한다. Java source 읽기·Node codec PASS를 Java 컴파일·reflection·stdin/fd3 전송·격리 PASS로 기록하지 않는다. 실제 배열 정답·대표오답 검증은 [재개 조건](#현재-실행-판정과-재개-조건)을 먼저 충족한 독립 실행에서 수행한다.

## macOS 격리와 자원 제한

prototype은 `/usr/bin/sandbox-exec`로 **JVM 시작 전에** deny-default profile을 적용한다. SBPL은 OS별 호환성 위험이 있고 `sandbox-exec`는 deprecated이므로 이번 검증 장비에서만 실측한 prototype이다. 이를 공식 지원 OS 전체의 장기 보안 보장으로 표현하지 않는다. SBPL의 deny-default·명시적 자원 허용과 compatibility 위험은 [Chromium의 macOS sandbox 설계](https://chromium.googlesource.com/chromium/src/+/main/sandbox/mac/seatbelt_sandbox_design.md)를 참고한다. 구체 profile의 PASS는 실제 Java 부정 실행으로만 얻는다.

| 경계 | prototype 계약과 검사 |
| --- | --- |
| 파일 읽기 | 번들 JDK·runner·해당 classes/source, 부팅에 필요한 시스템 library·명시한 OS 파일만 허용. 사용자 home·저장소·앱 진도·다른 실행 임시 폴더는 금지. 모든 앱 Resources나 `/Users`를 통째로 허용하지 않음 |
| 파일 쓰기 | javac는 현재 compile 임시 폴더만 허용하며 생성 파일 합계 1 MiB 초과를 감독해 종료. 학습자 JVM에는 일반 파일 쓰기를 허용하지 않고 표준 출력 pipe와 필요한 `/dev/null`만 사용. JDK·runner·classes·manifest·사용자 파일과 임시 폴더의 새 파일도 쓰기 거부. 외부 경로·rename·symlink 탈출은 OS 거부 검사 |
| 네트워크·IPC | TCP/UDP/outbound/inbound·loopback·Unix socket·불필요한 Mach/IPC 금지. JVM 부팅에 필요한 OS service 예외는 정확한 이름·이유·실제 영향 검사를 기록. 무네트워크 환경에서 성공해야 하며 localhost 예외 없음 |
| 프로세스 | 최초 실행할 번들 java/javac 외 exec 금지, 학습자 fork/ProcessBuilder 금지. 다른 프로세스 신호·조회·디버깅·attach를 허용하지 않음. 신뢰한 감독 코드만 자신의 자식 PID/group을 추적/종료 |
| 시간·동시 실행 | compile wall timeout 10초, 테스트별 JVM 시작을 포함해 3초, 한 suite 최대 6개 공개 사례를 순차 실행. 종료/취소 후 500ms 안에 남아 있으면 SIGKILL과 reap. 실제 느린 초기 실행 때문에 바꿀 때는 수치·이유를 카드에 먼저 기록 |
| 출력 | compile/runtime 각각 stdout+stderr 합산 32 KiB. 프로토콜 payload는 기존 pilot 4 KiB, 승인된 배열 경로만 2 MiB. stream 읽기 단계에서 byte를 세고 초과 즉시 종료. 전체 출력 뒤 잘라내는 방식으로 메모리를 무제한 사용하지 않음 |
| 메모리·스레드 | runtime `-Xmx64m`, `-Xss256k`, `-XX:MaxMetaspaceSize=64m`, `-XX:MaxDirectMemorySize=16m`, `-XX:ActiveProcessorCount=2`, `-XX:+ExitOnOutOfMemoryError`, `-XX:+DisableAttachMechanism`, `-XX:-UsePerfData`를 기본으로 고정. compile heap은 128 MiB. 부모가 최소 50ms 간격으로 자식 RSS를 관찰하고 runtime 256 MiB/compile 512 MiB 초과를 종료. 옵션·RSS 감시는 OS hard memory quota가 아니며 표본 사이 overshoot와 JVM 밖 native allocation의 한계를 숨기지 않음 |

실제 heap·direct/native memory·많은 thread 시도로 종료/호스트 응답을 확인한다. RSS 검사가 실패하거나 자식 식별이 불명확하면 해당 실행을 `engine_error`로 닫는다. 별도 VM 수준의 악성 native code·커널 취약점 방어를 입증하지 않았으며, 그 보장이 필요해지는 단계는 이 prototype 완료와 구분한다. Java source를 정규식으로 금지해 이 검사를 통과한 것처럼 만들지 않는다.

## prototype에서 먼저 입증할 것

제품 노출 전에 같은 번들·실제 profile·동일 launch 경로로 다음 증거를 남긴다. Codex 내부에서 중첩 sandbox가 `Operation not permitted`인 결과는 호스트 OS에서의 실패와 구분하고 허용된 도구 escalation으로 실제 실행을 확인한다. sandbox 적용 실패 시 무격리 fallback은 없다.

- 정상 정답·대표오답, 컴파일 오류·preview 거부, 런타임 예외, 무한 loop·출력 폭주·메모리/스레드 폭주·취소, `System.exit`·깨진 protocol이 명확한 상태로 끝남.
- 제한 밖 임시 canary 읽기/쓰기·rename/symlink 탈출, bundle JDK/classes 덮어쓰기, TCP/UDP/loopback/Unix socket, 자식 프로세스 실행, 환경 비밀/Java option 주입을 실제 Java 코드로 시도해 거부 확인. canary는 검증자가 만든 무해한 파일이며 실제 사용자 비밀을 읽지 않음.
- 테스트 사이 static state가 초기화되고, 실패/취소/창 닫기 뒤 JVM·javac·scratch가 남지 않음. 정상 답안이 계속 실행되며 UI가 응답함.
- renderer Node/임의 IPC·타 origin/frame·잘못된 request·unknown ID/revision·사용자 tests/argv·자산 traversal·원격 navigation 거부; renderer Function 거부와 기존 Worker 정상 실행을 각각 실제 관찰.
- `.app` bundle 경로에 공백·한글이 있어도 오프라인 실행·hash route·콘텐츠 fetch·기존 진도와 Java 초안의 앱 재실행 복원이 동작. 로컬 `.app` 생성·첫 실행 수명주기를 측정하고 서명/Gatekeeper 제약은 별도로 기록. DMG 생성·mount/copy는 이번 실행 gate와 분리된 미승인 패키징 범위다.

필수 격리 실패는 구현 역할로 반환한다. 전체 허용 profile·renderer 보안 해제·사용자 JDK·원격 서비스로 완료를 만들지 않는다. prototype PASS 후에도 공식 지원·M4/M6·공개 배포 승인은 자동으로 생기지 않는다.
