# Java Code Quest 실행 지원 작업 카드

**현재 판정: 검증한 커널의 로컬 Java Quest prototype 독립 실행 PASS.** 정상 공개 6개·취소·창 닫기·재시작 복원과 프로세스 회수·scratch 정리를 확인했다. 이전 격리·harness·stale artifact 실패와 부분 PASS는 이력으로 보존한다. Java 코딩테스트·정식 OS/설치본·DMG·공식 Electron 채택·M4/M6 완료는 이 판정에 포함하지 않는다. 이 실행 판정은 Git 게시·최종 프로젝트 통합을 포함하지 않는다.

## 2026-09-22 활성 Java Quest 앱 검증 PASS

`[현재 사실]` `/private/tmp/bam-java-ui-runner-fix-2o7k8due`의 [독립 실행 판정](/private/tmp/bam-java-ui-runner-fix-2o7k8due/receipt/independent-execution-review.json)(SHA-256 `e3b874294ec0bbc6cce0c428791e422fd55f04d1b21cb27882ab0982ed1c1b9e`)은 검증 커널에 한정한 로컬 Java Quest prototype PASS다. 실제 Electron 2회·javac 3회·JVM 8회(정상 6·취소 1·창 닫기 1)이며 restore 단계 Java 실행과 제품 runner 재컴파일은 0회다. 정상 공개 6개·UI 결과·성공 저장과 재시작 복원, marker 뒤 cancel/close에서 제품 abort·TERM·exit 143/signal null·close, 취소 1개와 `not_run` 5개·거짓 성공 없음이 확인됐다. 창 닫기 IPC 응답 전달 자체는 관찰하지 않았으며 종료·회수와 재시작 상태의 증거로 판정했다.

Java 11개 그룹·Electron·제품 observer 28개·외부 observer 50개를 회수했고 scratch 3개를 삭제했다. poison false이며 37개 파일·11개 트리와 class 불변을 확인했다. helper `46b582…`·main `57de1f…`·profile은 앞선 검증과 동일하다. `darwin/arm64`·OS release `23.6.0`·kernel 전체 version 일치 제한은 유지한다. 이 증거는 Java 코딩테스트·정식 지원 OS·설치본 제공·DMG·Electron 공식 채택이나 M4/M6 완료를 뜻하지 않는다.

`[현재 사실]` 앞선 `/private/tmp/bam-java-ui-integration-delta-llzvt44f`는 `FAIL_STOPPED_PRESERVED/unexpected_java_counts`였다. [독립 실패 판정](/private/tmp/bam-java-ui-integration-delta-llzvt44f/receipt/independent-execution-review.json)(SHA-256 `1182f6a7ad99d9196de855bddd0eb94c0a38cda200523def14b819386c075ed1`)에서 정상 공개 6개·UI 결과·성공 저장만 부분 PASS했고, 오래된 bundle class `c182b435…`가 `array-v1`을 지원하지 않아 marker 전에 거부된 원인을 확인했다. 실제 javac 2회·JVM 8회·Electron 1회, 취소 클릭·의도한 창 닫기·restore는 0회다. 앱과 Java 10개 그룹·제품 observer 22개·외부 observer 39개를 회수했고 29개 파일·11개 트리 불변을 확인했으며 실패 scratch·userData·poison 상태를 보존했다. 원본 실패를 후속 PASS로 바꾸지 않는다.

후속 staging은 배열 공개 평가 PASS 때의 runner class를 Java 실행 없이 재사용했다. main class SHA-256은 `0cbf8bd964a21b0cc9c8e4a3b16a89573adabc95a464c4263a538f39f306e9a7`, ArrayInput class는 `03fd37549035d23bc174c5f57b0a3977a4afa903a3983be9fa0b96129c802803`이며 source `efa09472…`와 기존 배열 판정 `175a7d…`의 identity를 연결했다. 이는 새 runner 컴파일 증거가 아니다. 최신 `scripts/desktop-build.mjs`(SHA-256 `260a64816f1901f8be9cc09b14ae64538bb38224ea4b3762b842fd0767b00b19`)는 full compile 뒤 source/class receipt를 기록하고 runtime-only staging에서 missing/stale·변조·누락·extra·symlink를 거부한다. 신규 focused 4/4 독립 PASS의 preflight receipt SHA-256은 `90f339e781560df99efa7899d44a99982d4d1107155eb41dd765fac6d4d9e356`이다. 실제 staging 호출의 builder `222a…`와 metadata 검사 보완 후 최종 verifier `260a…`는 준비 단계가 다르며, 최종 clone 검증 PASS와 세부 정합성은 위 독립 실행 판정을 따른다.

## 2026-09-22 앱 기본 검증과 OS 제한 후보

`[현재 사실]` `desktop/main.cjs`의 `.md` MIME 한 항목을 보완한 Java 미실행 앱에서 Electron 2회(PID 50627/50634), Java·javac 0회로 독립 PASS를 받았다. Markdown 응답 200·`text/markdown`·원문 일치와 DOM, 진도·초안 재시작 복원, 실제 origin·Node 미노출·preload API 3개·기존 Worker 1회·IPC 거부·CSP data 차단을 확인했다. child·group·observer 회수, poison false·원본 불변도 확인했다. 당시 앱의 Java gate는 false였으므로 이 결과는 활성 Java UI PASS가 아니다. 근거는 [독립 앱 판정](/private/tmp/bam-java-app-check-md-ilyiz9qe/independent-execution-review.json)(SHA-256 `56d92ea24b9a40d0ce89e489eb18cf86ad3b33aa98859448eec22e713c335ca3`), 대상 main SHA-256은 `57de1fdbcfa523eb2e6179a382653dde4fb6ab672b257554656c43692b006d04`다. 이전 tGqkAv 앱 FAIL과 원본은 아래 이력으로 보존한다.

`[현재 사실]` 현 supervisor 후보(SHA-256 `46b582dbce36100d800dc683b9a7f6f667651c375c9ba88ddbfe47ebc6701165`)는 prototype gate를 true로 바꾸되 `darwin/arm64`, 검증 OS release `23.6.0`과 kernel 전체 version이 모두 일치할 때만 허용한다. OS 읽기 실패·불일치는 capability와 run의 공통 resolver에서 `realpath`·`mkdtemp`·spawn 전에 차단한다. 독립 focused 1개 PASS(99.902ms, 테스트 SHA-256 `ced844d9af66abeb90ffc6bfe71a516db7e12ef822d24ce0148caaf2e2a0ca6c`)를 인수했다. OS receipt는 `/private/tmp/bam-java-app-check-md-ilyiz9qe`에 보존하며 SHA-256은 `b18bac6e25a0d6849d451da3aa520e8b8ccf4b75af0e6fd0ddf759beab9056e4`다. launch/profile/lifecycle은 변경되지 않아 기존 독립 증거를 재사용한다. 이 시점에는 실제 OS 일치 조건의 활성 UI가 미검증이었다. 후속 결과는 위 활성 앱 PASS 절을 따르며 정식 OS 지원 결정은 아니다.

`[현재 사실]` 이 사전 검토 시점의 최종 활성 Java UI 검증은 정상 공개 6개·취소 1개·창 닫기 1개와 재시작 후 기록을 대상으로 준비 중이다. 실행 상한은 javac 3회·JVM 8회·Electron 2회다. `/private/tmp/bam-java-ui-integration-uYmVe8`의 [독립 사전 판정](/private/tmp/bam-java-ui-integration-uYmVe8/receipt/independent-preflight-review.json)(SHA-256 `7d8dec80a7e69845a285e6655e1741618a046bee0e231f7670a0b2009ca1e604`)은 검증 entry의 exit 143/null 오판, 회수 경계 밖 tracker 초기화, 관찰·기록 오류 시 journal fallback 누락으로 FAIL했다. 실제 Java·Electron·ps·signal·approval·attempt는 모두 0이며 이 실패는 제품의 기존 PASS를 무효화하지 않는다. 새 검증 root에서 이 세 결함만 보완한 뒤 독립 사전 검토와 실제 실행 결과를 인수해야 한다. 이후 실행 실패와 보완 뒤 독립 실행 PASS는 위 최신 절에 기록한다. 이 사전 검토 FAIL은 보존한다.

문서 상태 정리는 위 독립 인계의 재사용이며 제품 실행을 반복하지 않았다. staging·앱·OS 제한 후보의 증거와 최종 활성 검증을 구분하고, 공식 OS·Electron 채택·DMG·M4/M6·Java 코딩테스트 완료로 확대하지 않는다.

## 2026-09-22 단계 4 격리 canary 실행과 독립 판정

`[현재 사실]` 소비된 one-shot `/private/tmp/bam-java-canary-aQMyur`의 원본 판정은 `FAIL_STOPPED_POISONED`다. 실제 javac 1회(PID 45412), canary JVM 1회(PID 45473), 동일 helper의 native 양성 대조 1회(PID 45409), worker(PID 45411)를 실행했다. 환경 7·파일 12·네트워크 10·프로세스 1의 실제 probe 30개가 모두 시도됐지만, `ProcessBuilder`의 `posix_spawn failed, error: 0 (none)` 오류를 harness가 기대한 deny 형식으로 분류하지 못해 `60 !== 61`에서 중단했다. complete marker와 `returned 3`은 만들지 않았고 자동 재시도하지 않았다.

`[현재 사실]` 독립 검토자는 같은 JVM PID·시각의 OS `process-fork` deny 1건과 동일 helper의 native 양성 대조를 결합해 **관찰된 단계 4 격리 효과만** `PASS_OBSERVED_STEP4_ISOLATION_EFFECTS_ONLY`로 판정했다. Unix socket 생성은 같은 PID·경로의 `file-write-create`에서 차단된 효과로 확인했으며 `network-bind` 규칙 자체가 입증됐다고 확대하지 않는다. 환경 제거, 외부 file 경계, TCP·UDP·loopback·Unix connect/bind 시도, 자식 생성 차단에 남은 unknown은 없다는 독립 판정이지만 제품 활성화나 전체 격리 보장을 뜻하지 않는다.

근거는 [독립 OS deny 판정](/private/tmp/bam-java-canary-aQMyur-os-deny-review.json)(SHA-256 `205c89b21868c1975517394ecd41c5d4ca89de046be498c3e6d64b88dc080f49`), [원본 execution receipt](/private/tmp/bam-java-canary-aQMyur/receipt/execution-receipt.json)(SHA-256 `31fe6228d78477d7c016d288c9034c7625736e4d7f966017259f8fbf0a6fe803`), [parse 전 raw canary](/private/tmp/bam-java-canary-aQMyur/receipt/raw-canary.json)(SHA-256 `a12509dd9d5957cb24e62f237ebd1053de87e4058715ba991adfb6ca32b9b300`)다. 고정 static target 26개의 hash·원시 receipt hash·canary source hash는 일치했다. 생성 class 2개의 전후 hash는 coordinator 메모리에만 있었고 pre-cleanup publication이 실행되지 않아 영속 증거가 없으므로 class 불변 검증 완료를 주장하지 않는다.

javac·JVM·native control은 exit·close·그룹 부재, worker는 exit·close와 reap, 외부 observer 15개는 exit 0·close를 확인했다. harness poison true·제품 poison false이며 cleanup은 시작하지 않고 work를 보존했다. 이 canary의 정상 scratch 삭제를 주장하지 않으며 정상 cleanup은 변경되지 않은 이전 `/private/tmp/bam-java-loop-lifecycle-GybY5h` 증거만 재사용한다. 원본 snapshot은 소비됐고 수정·재실행하지 않는다.

## 2026-09-22 단계 5 결과 분류·배열 공개 평가 PASS와 앱 사전 검토

`[현재 사실]` 소비된 `/private/tmp/bam-java-outcomes-TxJEdi`의 원본은 preview 진단문구 기대 불일치로 `FAIL_STOPPED_POISONED`이며 work를 보존했다. 그러나 실제 return type 오류와 preview 비활성 컴파일은 각각 `syntax_error`로 독립 PASS했고 javac 2회·JVM 0회였다. 이 두 실행을 반복하지 않고 `/private/tmp/bam-java-outcomes-rest-SDUwT0`에서 나머지 fixture를 javac 1회·fresh JVM 8회 실행해 wrong answer, fresh static reset과 runtime error, `System.exit` 7/0, 출력 제한, heap/direct OOME, READY 뒤 thread timeout 분류를 모두 독립 PASS했다. 9개 child group·내부/외부 observer·worker를 회수했고 class hash 불변·cleanup 완료·제품과 harness poison false를 확인했다. 두 근거를 합친 단계 5 실제 수는 javac 3회·JVM 8회다. 근거는 [첫 두 compile 독립 판정](/private/tmp/bam-java-outcomes-TxJEdi/independent-execution-review.json)(SHA-256 `862aa02a7bc738a0dbeffaf491ddef5cb537e87ec54cd609ef7e241f3d911b84`)과 [나머지 matrix 독립 판정](/private/tmp/bam-java-outcomes-rest-SDUwT0/independent-execution-review.json)(SHA-256 `dca2137636c29f7647385c5ea3683b845325f1f5cd8c17cc309b523d525f622c`)이다.

`[현재 사실]` `/private/tmp/bam-java-array-runtime-Yqoh92`에서 기준답안 3개와 대표오답 3개를 javac 6회·JVM 21회 실행했다. 공개 사례 18개는 모두 PASS, 동일 값이지만 입력 alias를 반환한 ARR-01·경계를 제외한 ARR-02·작은 입력 원본을 반환한 QUE-01은 각각 `wrong_answer`였다. 빈 배열·100000개 배열과 값 동일/새 참조 관찰을 포함했고 모든 child·group·observer·worker 회수, class/source hash 불변, cleanup 완료, 양쪽 poison false를 확인했다. 실제 2 MiB 초과 동작은 실행하지 않았다. 근거는 [독립 배열 판정](/private/tmp/bam-java-array-runtime-Yqoh92/independent-execution-review.json)(SHA-256 `175a7d955cb28f399961100a5f1054e10b68da90ec775503bd8d80534058cf4a`)과 [원본 execution receipt](/private/tmp/bam-java-array-runtime-Yqoh92/receipt/execution-receipt.json)(SHA-256 `03aaad7cfdaca3c1bdc8c8d413432949bdf7c237e2c5c96657dfd8feb4e9eabf`)다.

`[현재 사실]` 당시 배열 검증의 supervisor SHA-256은 `1c61e9bc706c41d6d9284cb51b0b8e1913818b58e0c06086ad0b203c867e5b0d`다. exit code가 0이 아니고 fd 3 프로토콜 파싱에 실패했을 때 stdout의 `OutOfMemoryError`도 메모리 제한 안내로 분류하는 한 분기만 추가했다. 별도 작성 회귀 1개와 독립 검토자가 기존/수정 결과의 raw 8개를 재분류한 검사에서 heap 안내만 바뀌고 나머지는 동일함을 확인했으며 Java는 반복 실행하지 않았다. [독립 preflight](/private/tmp/bam-java-array-runtime-Yqoh92/independent-preflight-review.json)(SHA-256 `c7161156b4431fb373baadf0ce5d1f3283b20561ab57d6e8e39c50425ec2e0dc`)에서 기존 단계 5 raw 8건과 focused 38건을 재사용했고 이후 Yqoh92 실제 검증을 수행했다.

`[현재 사실]` 보완한 `/private/tmp/bam-java-app-check-tGqkAv`를 실제 Electron 1회 실행했으나 lesson route timeout으로 FAIL했다. 앱은 exit 0·close였고 process group·observer를 모두 회수했으며 restore 단계와 Java 실행은 0회다. 원본 앱·검증 clone·전용 userData를 보존했고 gate는 false다. `desktop/main.cjs`의 MIME 목록과 protocol 응답 경로(33, 223~231행)에 `.md`가 없는 사실은 정적으로 확정했지만, 이번 timeout의 직접 원인이 404 또는 DOM 미생성인지는 원시 응답을 기록하지 않아 추론이다. 이 시점에는 신규 `.md` 제공 패치와 실패 관찰 보완이 준비 중이었다. 후속 PASS 범위는 [앱 기본 검증](#2026-09-22-앱-기본-검증과-os-제한-후보)으로 구분한다. 근거는 [독립 실행 판정](/private/tmp/bam-java-app-check-tGqkAv/independent-execution-review.json)(SHA-256 `8fb43c5045ebe91ebc6b00f464a33f1cd02d14ef015ce1ab00f98c7d3098d199`)다.

`[현재 사실]` 별도 staging 수정은 `scripts/desktop-build.mjs`의 앱 복사에 `verbatimSymlinks: true`를 추가하고 기존 `assertSafeTree`를 유지했다. 대상 SHA-256 `83b1950de0dba0a390d93b3353cca50683022b5e5b8e9ec592bd048f5857ede4`의 Java 미실행 staging 1회에서 상대 symlink 14개 보존·원본 불변과 codesign/strict verify exit 0을 독립 확인했다. [독립 staging 판정](/private/tmp/bam-java-staging-independent-fq1hEY/independent-staging-review.json)의 SHA-256은 `0dc8f12a6b6a3a630babd751d6a1b57d787f1c8e73fb66fd711e4532d0b6c77b`다. 이전 tGqkAv 작성자의 sign/verify PASS 기록은 raw stdout/stderr가 없고 오류 문구가 출력돼 미확인이며 이 후속 PASS와 구분한다.

## 2026-09-22 timeout/cancel 회수와 안전 정리 PASS

`[현재 사실]` 새 검증본 `/private/tmp/bam-java-loop-lifecycle-GybY5h/`에서 javac 1회(PID 41929, exit 0), timeout JVM 1회(PID 41994, READY 관찰 뒤 timeout·exit 143), cancel JVM 1회(PID 42070, READY 관찰 뒤 cancelled·exit 143)를 실행했다. 모두 exit·close·그룹 부재·observer 회수를 확인했고 외부 ps 25회도 전부 exit 0·close였다. worker 41925의 exit 0·close와 cleanup 완료·workRoot 부재를 확인했으며 harness/제품 poison은 모두 false다. 단계 2·3의 실제 PASS를 인수하며 문서 담당은 검사를 재실행하지 않았다.

근거는 [execution receipt](/private/tmp/bam-java-loop-lifecycle-GybY5h/receipt/execution-receipt.json)(SHA-256 `a159323d709161f54af84ae2fc9e73ce8f9c87279cc0276fd37f29c881b6293d`)와 [삭제 전 증거](/private/tmp/bam-java-loop-lifecycle-GybY5h/receipt/pre-cleanup-evidence.json)(SHA-256 `695ef44fc4689a12026168cf84ca1e03eaedb8ea18e5354a69c4b5419ade991c`)다. 검증한 supervisor(`617cc96…`, SHA-256 접두)는 종료 전의 오래된 관측을 폐기하고 새 관측으로 종료를 판정한다. lifecycle·java-desktop-runtime-contract의 독립 38 PASS도 재사용했다. 이후 후보(`a23a50a1…`, SHA-256 접두)의 기존 `createEnvironment` `__test` 참조 추가는 제품 동작·권한을 바꾸지 않았고, 후속 단계 4의 원본 실패와 독립 판정은 [단계 4 기록](#2026-09-22-단계-4-격리-canary-실행과-독립-판정)을 따른다. 아래 `lingering_process` FAIL·당시 원인 미확정 기록과 정상 JVM 부분 PASS는 보존한다.

## 2026-09-21 timeout/cancel 준비 compile 중단

`[현재 사실]` 고정된 `/private/tmp/bam-java-loop-lifecycle-8cb4wW` 검증본을 한 번 실행했으며 실제 횟수는 javac 1회·JVM 0회다. PID 40323은 exit 0·close였지만 `terminationReason`이 기대한 null 대신 `lingering_process`여서 첫 단계에서 `FAIL_STOPPED`로 중단했다. 원시 그룹 관찰은 23:54:26.317 KST부터 부재였고 최종 26.623에도 부재였으며 observer close·unreaped false를 기록했다. worker 40322도 exit 1·close로 회수됐다. 당시에는 종료·회수 관찰과 실패 판정을 구분하고 원인 미확정으로 별도 Astra 읽기 전용 진단에 반환했다.

근거는 [execution receipt](/private/tmp/bam-java-loop-lifecycle-8cb4wW/receipt/execution-receipt.json)(SHA-256 `59604dd5122cdb5ea147d392c6056a869b6b1faa6c0779595331c01aeaa8062c`), 같은 receipt 디렉터리의 raw-compile 기록(SHA-256 `75e18e9a0aaa4e247ff754bbb2d66b15dc722f05ee988e49f99c5204df6c5137`), [events](/private/tmp/bam-java-loop-lifecycle-8cb4wW/receipt/events.jsonl) 인계다. cleanup은 시작하지 않았고 workRoot와 `Solution.class`를 보존했다. harness poison true·제품 poison false이며 timeout/cancel은 실행하지 않았고 재시도도 없다. 아래 정상 JVM `returned 3` 부분 PASS와 과거 실패 증거는 유지한다.

## 2026-09-21 정상 runtime 부분 PASS와 검증 도구 오류

`[현재 사실]` 새 검증본 `/private/tmp/bam-java-runtime-cPf9Rt/`에서 javac 0회·JVM 1회를 실행했다. PID 38586의 exit 0·close·그룹 부재와 `returned 3`을 관찰했고 제품 결과는 `passed`다. worker 38585도 회수됐으며 최종 관련 Java/PID 부재와 class 3개의 실행 전후 hash 불변을 인수했다. 이번에는 parse 전 [원시 runtime receipt](/private/tmp/bam-java-runtime-cPf9Rt/receipt/raw-runtime-execution.json)(SHA-256 `57b49b6873cc063196583e3bad523c3ae12231c7838b7c509bbba5492171f049`)를 atomic하게 보존해 stdout/stderr 각각 0 bytes임을 확인했다. 첫 runtime 실패의 stdout/stderr 미확인 이력과 구분한다.

`[현재 사실]` 제품 runtime 관찰은 부분 PASS지만 harness의 `{status: 'WORKER_PASS', ...result}` 조립에서 `result.status`가 덮어써 coordinator는 FAIL로 종료했다. 원본 [execution receipt](/private/tmp/bam-java-runtime-cPf9Rt/receipt/execution-receipt.json)(SHA-256 `b012de0711eb7e7f0acfa2df8605fbbdda0cbba1a7221e86729975f9646898ee`)는 cleanup 미시작·workRoot 보존·harness poison true·제품 poison false를 기록한다. 정상 JVM을 다시 실행하지 않았다. 당시 별도 새 검증본의 javac 1회·timeout JVM 1회·cancel JVM 1회를 준비했으며 이후 결과는 [준비 compile 중단 기록](#2026-09-21-timeoutcancel-준비-compile-중단)을 따른다. 기존 첫 runtime 실패·compile PASS 증거는 보존한다.

## 2026-09-21 첫 runtime 실행 실패와 회수

`[현재 사실]` 승인된 one-shot을 한 번 실행했다. runner compile(PID 35308)과 fixture compile(PID 35369)은 각각 exit 0·close·그룹 부재를 확인했지만 runtime JVM(PID 35378)은 exit 1·close·fd3 frame 부재로 실패했다. runtime stdout/stderr는 `parseProtocol` 예외 이전의 원시 결과를 보존하지 않아 미확인이다. 이전의 stdout/stderr가 비었다는 기록은 정정한다. worker(PID 35307)도 회수됐고 최종 관련 PID·그룹 부재를 확인했다. 실행 결과는 FAIL이며 종료·회수 관찰 성공과 구분한다. 원본 [execution receipt](/private/tmp/bam-java-runtime-6q9cnJ/execution-receipt.json)의 SHA-256은 `3dcb4753c651e7678ce3b945a5d2df7f862e897cc45971a037c29bc311f068e8`이다.

`[현재 사실]` 이 실패 직후 cleanup은 시작하지 않았고 workRoot를 보존했다. harness poison은 true, 제품 poison은 false였으며 해당 검증본은 재실행하지 않았다. [읽기 전용 진단](/private/tmp/bam-java-startup-35378-diagnosis.json)(SHA-256 `e04c3f49eae90804e3fde420a829546aeeeb5243ba43b03f2cb9822069d4bedb`)과 [deny 원문](/private/tmp/bam-java-startup-35378-deny.json)(SHA-256 `67e703e3cb55444df842a75fc2defc33fe23b447aeecf26f3bcd1f8136193556`)에서 `/var`·`/private/tmp`·해당 workRoot의 `tmp` metadata 거부를 확인했다. 이는 JDK/bin만 포함했던 metadata 범위 누락 가설을 지지하지만 exit 1의 단독·직접 원인으로 확정하지 않는다. 기존 compile PASS·과거 실패 증거와 false gate를 유지하며 timeout/cancel·canary·전체 결과 분류 검증은 미진행이다.

`[확정 결정]` 최소 보완은 runtime의 여섯 trusted 필드 `jdkRoot`·`executable`·`runnerRoot`·`classesRoot`·`homeRoot`·`tempRoot`를 canonical 경로로 고정하고, JDK root·executable의 부모 디렉터리·나머지 root와 각 ancestor의 중복 없는 합집합을 runtime 전용 32개 metadata literal로 전달하는 것이다. 초과하면 실행 전 차단하고 빈 슬롯은 JDK root로 채운다. compile의 기존 16개 슬롯은 유지하며 static metadata에는 관찰된 `/var`만 추가한다. 생성한 workRoot를 realpath로 정규화한 뒤 helper·argv·env·cwd에 같은 경로를 사용한다. 데이터 읽기·쓰기·network·process·IPC 권한은 바꾸지 않는다.

이 실패 뒤 단일 검증 계약은 진단 때 회수한 class 3개의 현재 hash와 기존 compile PASS·source/compiler/profile/launch 출처를 고정해 새 workRoot에 복제하고 runtime 직전·직후 전체 class 목록·hash를 확인하는 것이었다. hash가 원래 compile 완료 때 기록됐다고 주장하지 않는다. 기존 증거는 보존하고 poison된 harness·attempt는 재사용하지 않는다. focused fake 검사와 독립 metadata/manifest 검토 후 javac 0회·runtime JVM 1회만 허용했으며 실제 결과는 [정상 runtime 부분 PASS 기록](#2026-09-21-정상-runtime-부분-pass와-검증-도구-오류)을 따른다. harness는 `parseProtocol` 전에 stdout/stderr/fd3 bytes·종료 증거를 포함한 원시 결과를 atomic하게 보존해야 한다. 실패·관찰 불명·새 권한 필요 시 보존·중단하고 자동 허용 확대나 재시도를 하지 않는다.

## 2026-09-21 격리 compile 부분 PASS와 runtime 후속 검증

`[현재 사실]` JDK 상위 경로의 metadata 보완 뒤 검토된 단일 격리 compile은 `PASS_COMPILE_ONLY`다. 독립 `test_engineer`가 `/private/tmp/bam-java-step1-metadata-v7kxuz/execution-receipt.json`(SHA-256 `4ac7487b4a115d50d1506f58c1f0a474070615815704a339b510d235db930595`)과 후속 그룹 부재 기록을 재사용 PASS로 인수했다. PID 30944의 exit 0·close·전체 그룹 부재·observer 회수, class major 69, 삭제 전 증거의 atomic publication과 workRoot 삭제를 확인한 범위다. 문서 담당은 Java·프로세스 검사를 다시 실행하지 않았다. 기존 UEs·SIGSEGV 실패 증거는 보존하며 이번 PASS로 과거 원인을 모두 해결했다고 판단하지 않는다.

`[대체됨]` 첫 runtime 실행 전에는 `supervisor.mjs`의 trusted JDK ancestor 계산을 java/javac에 공유하고 `runtime.sb`에 같은 literal metadata 허용만 적용하기로 했다. 이 준비 인수 시점에는 후속 보완의 완료·실제 runtime PASS를 주장하지 않았다. 이후 한 번의 실패와 새 runtime metadata 범위·다음 단일 실행 계약은 [최신 실패·진단 기록](#2026-09-21-첫-runtime-실행-실패와-회수)을 따른다. 제품 구현과 fake 검사는 별도 담당이다.

1. 대칭 보완과 focused 독립 검사 뒤 Java를 실행하지 않는 별도 staging을 준비한다. runner source/class 대응과 fixture class를 확인하고 필요한 격리 compile을 별도 계수한 뒤, exact artifact/profile/launch·공개 fixture·기대 결과를 고정해 정상 runtime 한 번부터 검증한다. public false gate를 유지하고 내부 공유 감독·runner 경로를 사용한다.
2. 정상 runtime의 exit·close·그룹/observer 회수·fd3 결과가 PASS면 공개 loop fixture로 timeout과 cancel을 각각 한 번 검증한다. 정상·timeout·cancel의 안전 삭제를 함께 확인하고, 회수 불명·cleanup 실패의 보존/poison은 fake 증거와 실제 관찰을 구분한다.
3. 앞 단계 PASS 뒤 공개된 무해 file/network/process/environment canary, 실제 공개 기준답안·대표오답·컴파일 오류·무한 loop의 결과 분류를 순차 검증한다. 각 사례·spawn 수를 사전에 고정하고 미실행·연결 거절을 격리 PASS로 쓰지 않는다.

각 실행의 증거는 삭제 전에 atomic하게 보존한다. hash/launch 불일치·관찰 불명·미회수·격리 실패·잘못된 결과이면 보존·중단하고 자동 재시도하지 않으며, 회수 불명/cleanup 실패는 process-wide poison한다. 이번 실행 외 프로세스와 기존 증거는 건드리지 않는다. 요청한 단계 2~5와 [ADR의 필수 prototype 검증](../decisions/0005-java-quest-local-runtime.md#prototype에서-먼저-입증할-것)을 선택한 Quest 범위에서 독립 PASS한 뒤에만 false gate 변경을 검토한다. CT source-full 실행·채점은 별도 후속 계약이며 현재 미완료다.

## 2026-09-21 감독 후보 정적 보완 인수

`[현재 사실]` 아래 2026-09-15 재개 준비와 `/private/tmp/bam-java-supervisor-independent-review.md`는 수정 전 검사·FAIL 이력이다. 후속 후보는 leader의 `exit`·`close`와 descendant를 포함한 process group 부재를 구분하고, leader 종료 뒤에도 필요한 그룹 회수를 이어 간다. 보조 `ps` observer에는 deadline·취소·강제 종료·close 확인을 두며 그룹 RSS를 합산한다. 그룹·observer 회수 불명 또는 cleanup 실패이면 작업 공간 보존과 process-wide poison으로 후속 실행을 차단한다. `scripts/desktop-build.mjs --runtime-only`는 기존 앱과 분리한 staging으로 runtime을 준비하는 경로이며, 일반 build의 javac 실행과 구분한다.

독립 `test_engineer`의 팀 인계를 인수했다. 아래 네 파일의 `node --check` PASS, fake lifecycle 25개와 desktop runtime contract 3개로 **focused 28 PASS / 정적 독립 검토 PASS**, diff-check PASS다. 문서 담당은 해당 검사를 반복 실행하지 않았다. 인계 대상 SHA-256은 다음과 같으며 별도 최신 파일 receipt는 생성하지 않았다.

| 파일 | SHA-256 |
| --- | --- |
| `desktop/runtime/supervisor.mjs` | `9f36ad1d6184ab1f213aaae347436e45a54c05158b8e5945d603c03e2e158fdf` |
| `scripts/desktop-build.mjs` | `327fdc09572d3931a2f42413f00a643122069b14b0cdafbaeb683aefbd562daa` |
| `tests/java-supervisor-lifecycle.test.js` | `84415c73cea331a22c43999bd726f66e03b709003e5ab250dca478ed65cb4760` |
| `tests/java-desktop-runtime-contract.test.js` | `31617f0a7247ab1cb75d5f341a41cd1b5aea6e9302953c621d4dfd9b2506460b` |

**이 정적 보완 인수 당시 실제 Java 실행은 BLOCKED였다.** 해당 검사는 Java·javac·sandbox·Electron·실제 `ps`·signal을 실행하지 않았고 당시 실제 staging·OS 그룹 회수·격리 PASS 및 재개 순서의 실제 단계 1도 주장하지 않았다. 이후의 제한 compile 결과와 남은 활성화 조건은 [최신 부분 PASS 기록](#2026-09-21-격리-compile-부분-pass와-runtime-후속-검증)을 따른다.

## 2026-09-15 실행 재개 준비 인수

`[확정 결정]` 후속 Java 실행·채점 요청에 따라 [감독 보존 계약](../decisions/0005-java-quest-local-runtime.md#실행-재개를-위한-감독-보존-계약)의 정적 수정과 검사를 먼저 진행한다. 구현 소유는 `desktop/runtime/supervisor.mjs`, 별도 테스트 담당은 focused lifecycle/기존 runtime contract 테스트, 이 문서 담당은 ADR·작업 카드다. public API·false gate·SBPL·bundle lock·Java source·Quest/CT 콘텐츠·기존 UI/저장은 이번 감독 패치에서 변경하지 않는다. 현재 작업은 일반 제품 수명주기 결함 수정이며 CT 채점 확장은 별도 후속 실행 계약이다.

`[현재 사실]` 14:04 KST 진단 인계에서 PID 7840·8672·9399·10208·11179가 모두 `UEs`로 남았고 boot는 07:44:03 KST였다. 원인은 미확정이다. 사용자는 14:55 KST Mac 재시작을 예정했으나 완료 확인이 아니다. 재시작 전 새 Java/JDK/javac/Gradle/Spring/sandbox/Electron 실행과 kill 재시도를 보류한다. 이 문서 작성자는 호스트 프로세스 검사를 재실행하지 않고 아래 진단 receipt를 인수했다.

근거는 `/private/tmp/bam-java-activation-design.md`이며 당시 supervisor SHA-256 `0462fe7a186544774b5a0df893f6cdb838555b413fb6cd200374db4f35812a87`, Java runner `efa094724d2078b19b2ef92f0a99ba409aee746f9da58d6c22ab9d90f1922402`다. 아래 예전 파일표는 당시 실패 기록이고 현재 코드 전체의 hash로 재사용하지 않는다.

`[현재 사실]` 작업 공간 보존·cleanup 오류 구조화의 최초 패치 `72341de40acd9ec093d7e68420c68157437e459304de4a3390777b7f8db3ae69`는 독립 fake 검토에서 반환 뒤 늦은 출력·exit가 signal/timer를 다시 만드는 결함으로 FAIL·구현 반환됐다. 근거 `/tmp/bam-java-preservation-independent.md`를 보존한다. 무조건 `finally` 삭제는 이미 제거됐지만 그 사실만으로 준비 패치 전체가 PASS인 것은 아니었다.

후속 제품 작성자는 완료 후 이벤트·timer·RSS await 복귀를 막는 `settled` guard를 보완했다. 최종 supervisor SHA-256은 `38880f23c49050031e4306def3b70e54e984a592a557c1d38e8968bb4c0d3b73`이며 `/tmp/bam-java-supervisor-preservation.md`가 근거다. 작성자 실행 `node --check desktop/runtime/supervisor.mjs` PASS, `node --test tests/java-supervisor-lifecycle.test.js` 5 PASS/0 FAIL(테스트 SHA-256 `ff6cba56c9ea6dc44e03a5a91fe4202122dc4b679b04a0ee503832c5e35bec80`), 추가 fake RSS 늦은 응답에서 signal 0·active timer 0을 인수했다. **현재 판정은 작성자 검사 PASS / 최종 독립 재검 대기**다. 문서 담당은 제품 검사를 반복 실행하거나 이 결과를 독립 PASS로 바꾸지 않았다.

false gate·SBPL·runtime lock은 위 제품 receipt의 고정값을 유지하고 새 Java/JDK/sandbox 실행은 0이다. 보조 `ps` deadline/cancellation과 전체 process group 회수는 활성화 전 미해결이다. 직접 child의 exit+close와 fake 검사만으로 OS 회수·격리 성공을 주장하지 않는다. 기존 UEs 원인은 미해결이며 실제 Java 실행·채점은 계속 BLOCKED다.

## 재시작 후 인수와 실행 재개 순서

1. 사용자의 재시작 완료를 받은 뒤 새 boottime와 이전 javac 부재를 읽기 전용으로 확인한다. 14:55가 지났다는 이유만으로 완료를 추정하지 않는다. 재시작은 호스트 복구 조치이며 격리 PASS가 아니다.
2. 독립 검토자가 감독의 workRoot 보존·cleanup 오류·poison·timer, 보조 ps deadline/cancellation, process group 회수와 정확한 bundle/profile/launch를 검토한다. fake child Node 검사는 정상·timeout/취소 회수·미회수·close 없음·error·늦은 이벤트·삭제 실패를 포함하되 OS 격리 PASS로 대체하지 않는다.
3. 종료 불능 원인 또는 재발 방지를 시험할 검증 가능한 가설과 독립 검토가 없으면 새 JDK 실행을 계속 보류한다. 준비되면 exact OS/bundle/profile/argv/env/hash·기대 종료 조건을 보존하고 무해한 최소 compile 한 번부터 제한 실행한다. 외부 observer와 hard deadline으로 종료·그룹·scratch 회수를 확인하고 실패 즉시 보존·poison·중단한다. profile 시행착오를 연속 발사하지 않는다.
4. 같은 artifact/profile/launch에서 compile 회수 PASS 후 공개 정상/오답·오류 분류, fresh JVM/state, 시간·출력·메모리·취소, 파일·네트워크·프로세스/환경 부정 canary를 독립 검증한다. 미회수·격리 실패가 하나라도 있으면 gate를 유지한다.
5. 독립 실제 PASS 후에만 고정 false gate 변경을 검토한다. 그다음 [CT source-full 선행 계약](../decisions/0005-java-quest-local-runtime.md#java-코딩테스트-실행-확장의-선행-계약)을 확정·구현하고 대표 CT→72개 원본 JUnit 메서드 묶음 168개 전체와 타입 12개·freshness·UI 결과/CT 저장 분리를 검증한다. 현재 invocation 총수·JUnit artifact·adapter·fresh 단위는 미확정이고 CT 실행/채점은 완료가 아니다.

외부 밤위키 과제는 사용자의 후속 지시로 중단했으며 재시작 후에도 자동으로 재개하지 않는다. Java 작업에서도 자동 재시작·자동 예약·DMG·무격리 또는 시스템 JDK fallback을 추가하지 않는다.

## 목표·승인·완료 경계

- 유형: 학습 콘텐츠 포함 기능. bam의 2026-09-15 “Java 실행 지원” 선택으로 문제 설계에 머물지 않고 첫 Java Quest를 실제 로컬 컴파일·실행에 연결한다.
- 결정/정본: [DEC-JAVA-QUEST-RUNTIME-01](../roadmap.md#2026-09-15-java-실행-지원-결정), [ADR 0005](../decisions/0005-java-quest-local-runtime.md), [Quest 설계](../designs/code-quest.md#java-직접-작성과-로컬-실행-pilot), [Java schema 계약](../content-schema.md#java-정적-메서드-quest-pilot), [설치 prototype](../designs/local-application.md#java-실행을-위한-첫-로컬-prototype).
- 첫 포함: `quest-java-total-price` revision 1, macOS 14.8.3 arm64 검증 장비의 Electron·번들 JDK·Java 25 제품 runner. 공개 평가만 사용한다.
- 완료: 선행 설계→동일 번들/launch 경로의 실제 컴파일·격리 prototype→첫 Quest 콘텐츠/schema/UI 연결→독립 콘텐츠·실행/보안·대표 데스크톱 흐름→통합 판정과 로컬 산출물. 작성/다운로드/수학적 모델 통과를 실제 Java PASS로 바꾸지 않는다.
- 제외: Java 코딩테스트 콘텐츠·SQL·모바일·Spring 실행·React 이관·새 DB/원격 채점·사용자 관리 포트·공식 지원 OS·공개 바이너리 배포·서명/notarization·M4/M6 전체 승인. 기존 브라우저 진도와 다른 origin인 앱 진도를 자동 이전하지 않는다.

## 기준선과 보존

선행 조사 시 HEAD는 `b97260eb866a15a02a80531107eca4b2144d436b`, branch `codex/service-sidebar`이며 기존 dirty/미추적 변경이 있다. 별도 Git 담당의 기존 게시 작업과 이 원본 작업 트리의 차이는 보존한다. 이번 설계 담당은 제품 코드·Git 상태를 바꾸지 않는다. 기존 문서 본문을 대체하지 않고 새 pilot 결정/계약과 과거 범위의 적용 관계를 패치한다.

설계 전 소유 문서 복사와 hash는 `/tmp/bam-java-runtime-design-baseline/receipt.json`에 남겼다. 예전 `/tmp/bam-java-quest-scope-20260915.md`는 이번 후속 턴에서 사라져 파일 PASS로 재사용하지 않았으며 대화의 조사 결론과 현재 원문/소스로 필요한 경계만 확인했다. 기존 교안·객관식·Quest ID·본문·진도 키와 과거 검증 기록을 재작성하지 않는다.

## 역할·경로 소유와 인계 순서

| 역할 | 소유 경로·책임 | 완료/인계 |
| --- | --- | --- |
| Astra 설계 문서 | 이 카드, `docs/decisions/0005-java-quest-local-runtime.md`, `docs/designs/{code-quest,local-application}.md`, `docs/{architecture,roadmap,content-schema}.md` | 범위·실행·격리·schema 계약 선행, 현재 사실/미검증 구분. 최종 제품 승인을 겸하지 않음 |
| 환경 준비 | `/private/tmp/bam-java-runtime-artifacts/`만 | 공식 archive hash/version/라이선스 receipt. repo 수정·runner 검증 없음 |
| Sol runtime 구현 | `desktop/runtime/**`의 Java runner·SBPL·감독 모듈, 임시 prototype 실행 자료 | ADR대로 실제 compile/run·자원/격리·cleanup 구현. 테스트 소스 작성과 독립 최종 검증은 다른 역할 |
| Sol shell/패키징 | `desktop/main*`, `desktop/preload*`, `desktop/runtime-lock.json`, desktop 패키지/빌드 설정, `scripts/*desktop*`, `.gitignore`, 필요한 `package.json` 명령 | 로컬 `.app`·origin·좁은 IPC·runtime module 연결. DMG는 자동 승인 검토 거부 뒤 별도 범위로 분리. `desktop/runtime/**`는 수정하지 않음 |
| Astra 콘텐츠 생성 | `/tmp/bam-java-pilot-{content,fixtures,experience}-20260915.*` 원고 | 경험 카드·starter·공개/독립/대표오답. 실제 repo 등록은 인계 뒤 소유권을 받은 역할 |
| 후속 frontend/schema·등록 | main이 prototype 경계 확인 뒤 개별 파일로 지정 | `src` Java adapter/router/capability, Java schema/validator·content 등록. 구현 역할은 테스트 파일을 함께 작성하지 않음 |
| 테스트 작성·독립 내용/보안·실행 검증 | main이 겹치지 않는 테스트/읽기 범위로 별도 지정 | 기존 증거를 재사용하고 변경 경계의 실측·독립 콘텐츠 판정. 부정검증을 정적 문자열 검사로 대체하지 않음 |
| 프로젝트 통합·Git | 선행 receipt 인계 뒤 별도 역할 | 현재 diff·hash·연결·미해결 판정. Git 게시 여부는 실제 승인/근거로만 기록 |

runtime의 내부 함수/Promise·취소 연결은 두 구현 담당이 합의하고 같은 경로를 동시에 수정하지 않는다. privileged bridge와 학생 프로토콜은 ADR의 범위를 넓히지 않는다. schema/content/frontend 등록은 격리 proof 없이 Java 실행 UI를 활성화하지 않는다.

## 첫 문제 경험 카드

아래는 콘텐츠 생성자의 2026-09-15 원고에서 인계한 카드다. 설계 담당은 L2·상품 소계→배송비의 E 방향을 승인했고 독립 정적 콘텐츠 검토도 PASS했다. 등록 데이터가 승인 원고와 같다는 인계를 바탕으로 그 정적 검토를 재사용한다. 당시 실제 Java 평가 검증은 미완료였으며 후속 공개 평가 결과는 위 최신 실행 기록을 따른다.

| 항목 | 내용 |
| --- | --- |
| 작업 ID와 대상 콘텐츠 ID | 첫 Java Code Quest pilot / `quest-java-total-price` |
| MVP에 필요한 이유 | 정수 계산 타입을 읽고 선택하는 단계에서, 선언된 Java 메서드 입력·반환 계약에 맞게 직접 계산 코드를 작성하고 공개 결과를 관찰하는 첫 기회를 제공한다. Java 실행기 전체나 이후 과정의 완성을 의미하지 않는다. |
| 선수 개념과 연결 교안 | 주 연결은 `java-concept-numeric-operations` / `java.numeric-operations`. 선수 읽기는 `content/lessons/java/wiki-types-variables.md`, `wiki-numeric-operations.md`, `wiki-methods.md`. 마지막 두 보조 개념 ID를 주 교안의 `conceptIds`에 임의로 추가하지 않는다. |
| 학습자가 발견할 단서 | 세 입력은 int이지만 가격×수량은 int 범위를 넘는다. 배송비는 수량과 독립된 주문 전체 금액이다. 수량 0에서도 배송비를 더한다. 서명·범위·예시·공개 입력과 기대값을 처음부터 제시한다. |
| 새 접근 원자 A | 없음. 곱셈 전 범위/타입 판단을 새 원자라고 주장하지 않는다. |
| 다시 사용하는 접근 원자 A | 입력과 중간 결과의 범위를 비교하고 계산 전에 충분한 타입으로 넓히기; 매개변수와 return의 입력·반환 계약 읽기. |
| 새 순서 연결 E | 상품 가격과 수량으로 충분한 범위의 상품 금액을 만든 뒤, 그 결과에 수량과 독립된 배송비를 한 번 더하여 long으로 반환한다. 이미 제시된 식의 선택을 넘어 이 두 계산을 메서드 본문에 직접 연결한다. 공개 실행·수정은 이 E를 연습하는 지원 조건이지 새 원자의 수를 늘리는 근거가 아니다. |
| 의미 있는 조건 변화 C | 기존 교안의 int 중간 곱 오버플로는 재사용한다. 상품 금액에 더하는 배송비가 상품 수량과 독립이라는 계약으로 `(가격+배송비)×수량` 및 0수량 조기반환이 달라진 결과를 낸다. 별도 새 C를 필수 추가 근거로 주장하지 않고 E의 계약 조건으로 다룬다. |
| 무힌트 전이 확인 기회 T | 없음. 숫자 타입 주제·서명·단계 힌트를 제공하므로 L4/전이 확인이나 전이 성과를 주장하지 않는다. |
| 사다리 단계와 지원 | L2 행동+조건. 전체 Solution 클래스와 고정 메서드 서명을 starter로 제공하고 본문 작성에 집중한다. 공개 예시는 일반·큰 곱·0수량 3개, 테스트는 최대 6개. 힌트 concept→observation→implementation 3개이며 앞단계에 전체 답안을 노출하지 않는다. |
| 학습자가 자신의 말로 설명할 문장 | “입력은 각각 int에 들어가도 곱은 int보다 클 수 있다. 곱하기 전 계산 타입을 넓히고, 상품 금액에 주문 배송비를 한 번 더해 반환한다.” 비채점 회고 기준이며 자동 성취로 기록하지 않는다. |
| 기존 콘텐츠와 독립성 비교 | `wiki-numeric-operations.md`는 이미 `(long) price * quantity` 예제를 설명한다. `quiz-java-concept-numeric-operations-intermediate-overflow`는 같은 소재에서 한 줄 후보 4개 중 선택한다. 새 Quest의 차이는 소재/상수 변경이나 overflow A 자체가 아니라, 상품 소계→독립 배송비 합산→메서드 반환의 E를 선택지 없이 작성하는 것과 공개 실행/수정 지원이다. 기존 methods 객관식은 오버로드 선언을 판별하며 이 E를 구현하지 않는다. 이번 원고는 기존 28 Quest와 원본 교안·객관식을 수정하지 않는다. |
| 잡아야 할 대표 오답·오개념 | 반환타입만 long, 곱 뒤 cast, 곱 뒤 0L, 배송비에도 수량 곱, 수량 0이면 배송비 제거, 배송비 누락. 앞 3개는 같은 큰 입력에서 실패하는 익숙한 오개념의 서로 다른 표현이며 서로 독립적인 새 A로 세지 않는다. |
| 필요한 공개 사례와 독립 범위 | 공개 6개: 일반·int 넘는 곱·모든 입력 최댓값·0수량/유료배송·배송비0·전체0. 개발 독립 5개: 가격0/수량양수, int 최대 결과, 그 바로 다음 결과, 비정형 큰 값, 수량1. 기준답안1·대표오답6. 독립 사례를 학습자에게 실행하거나 완료 판정에 사용하지 않는다. |
| 출처와 확인 날짜 | 아래 교안/객관식 및 Oracle Java SE 25 명세, 2026-09-15 확인. |
| 사람 판단 필요 | E가 첫 작성 경험으로 충분한지, 입문자의 설명만으로 첫 행동이 보이는지, 배송비 계약이 현실 상점의 묵시적 정책으로 오해되지 않는지, 힌트가 너무 빠르게 답을 주는지. 독립 내용 검토와 데스크톱 사용 흐름으로 판단한다. |

### 콘텐츠 산출물과 평가 경계

승인 원고를 `content/quests/java.json`과 `tests/fixtures/java-code-quest-solutions.js`에 등록했다. 한 Quest, 공개 6개·예시 3개·힌트 3개·기준답안 1개·대표오답 6개·독립 사례 5개다. 공개 입력은 일반·큰 곱·최대·0수량·배송비0·전부0이며 가격0 등은 독립 개발 사례로 구분한다. 당시 산술/JSON/오답 모델 대조·독립 정적 내용 검토와 등록 schema 검사는 PASS했지만 실제 격리 Java 컴파일·공개/독립 사례·대표오답 실행은 통과하지 못했다. 이후 정상 공개 6개 PASS는 위 활성 앱 기록을 따르며 이 문장으로 미실행 독립 사례·대표오답의 추가 PASS를 주장하지 않는다. source·타입·서명·10진 long 운반은 콘텐츠 schema 계약을 따른다. 독립 사례는 학습자 답안에 실행하지 않는다.

## 검증 범위와 반환점

| 검사 | 포함 범위·판정 근거 |
| --- | --- |
| 선행 문서 | 최신 승인과 과거 제외의 관계, 단일 정본 링크, exact artifact/라이선스, IPC·sandbox·메모리 한계, schema·첫 카드 일치. 작성자 자체 링크 확인 뒤 독립 검토 |
| runtime prototype | ADR의 compile/run 오류·timeout/output/memory/thread·취소·System.exit·state 초기화·잔여 프로세스/임시 파일. 실제 번들·profile·JVM 코드로 정상/부정 실행 |
| 보안 부정 검사 | 무해한 외부 canary 파일 접근/변경·symlink·JDK/classes 쓰기·TCP/UDP/loopback/Unix socket·ProcessBuilder·환경 주입·broken protocol·타 request 취소. 실제 OS 거부와 정상 답안 재실행을 함께 확인 |
| 콘텐츠·공개 평가 | 실제 Java 기준답안 공개 6 + 개발 독립 5, 대표오답 6의 지정 실패, 올바른 다른 표현 수용, schema/ID/순서/교안/개념/힌트·실패 설명 |
| shell/기존 연결 | custom origin의 상대 fetch·ES module·기존 JS Worker·HTML/CSS 대표, renderer Function/Node/불필요 IPC/외부 이동 거부, Java 없는 웹 capability·deep link 안내 |
| 데스크톱 경험 | 목록→설명→메서드 편집→힌트→실행/취소→공개 기대/실제→교안/다음 행동, 키보드/초점·연속 실행/실패 복구·앱 재실행 초안/진도·오프라인 |
| 로컬 산출물 | 로컬 `.app` 생성·공백/한글 경로·첫 실행·패키지/시작 비용과 서명/Gatekeeper 제약. DMG 생성·mount/copy는 자동 승인 검토 거부로 별도 미승인 패키징 범위이며 Java 실행 필수 gate에서 제외. 미실행 OS/실행/공개 배포를 완료로 쓰지 않음 |

파일·suite 범위는 실제 diff에 따라 담당자가 인계한다. 기존 무관한 전과목 테스트/전체 빌드를 매 단계 반복하지 않는다. 기존 검사가 변경 경계 전체를 덮는다는 구체 근거가 있으면 receipt를 재사용하고 hash 뒤 변경·충돌·미검증 연결만 다시 확인한다. 필수 격리 FAIL은 구현에 반환하며 전역 보안 완화나 시스템 JDK fallback으로 진행하지 않는다.

## 현재 증거와 남은 단계

| 단계 | 상태·근거 |
| --- | --- |
| 사용자 범위 | `[확정 결정]` Java 실행 지원 및 필요한 첫 local prototype. 단순 문제 문서화에서 멈추지 않음 |
| 환경·artifact 준비 | `[현재 사실]` 담당 receipt PASS. macOS 14.8.3 build 23J220 arm64, CLT16.2/SDK15.2, full Xcode 없음, Node24.17.0. JDK archive 136,355,078 bytes·Electron archive 129,788,539 bytes로 ADR SHA 일치. env-i absolute bundle java/javac 25.0.4.1·Electron Info/version 44.3.0·arm64와 LICENSE/NOTICE 확인 |
| 환경 receipt | `/private/tmp/bam-java-runtime-artifacts/RECEIPT.md`, SHA-256 `82c9e24efdb9d66878ce3525460eef5546326f0460424c9d64b6e6105d82cf47`. archive와 추출본은 같은 디렉터리에 있으며 repo 변경·Electron 실행·runner/격리 검사는 하지 않음 |
| sandbox 실제 관찰 | 2026-09-15 실제 sandbox javac의 `UEs`·종료/reap 미확인은 실패 이력으로 보존한다. 이후 제한된 compile·정상 JVM·단계 2·3 PASS와 단계 4 원본 FAIL/격리 효과 한정 독립 PASS는 최신 날짜별 기록을 따르며 과거 원인을 해결했다고 단정하지 않음 |
| 선행 설계 | 이 카드와 ADR·기존 정본의 pilot 계약 기록. 설계 담당의 소유 7개 Markdown 내부 파일/앵커 자체 검사 PASS, 기준선 대비 변경 diff·SHA receipt 생성. 선행 독립 정적 문서·위험 검토 PASS; 실제 격리 성공을 뜻하지 않음 |
| 콘텐츠·schema | 승인 원고와 등록 데이터 동일 인계에 따라 독립 정적 내용 PASS 재사용. Java 1개 포함 등록 29개 콘텐츠 검사 PASS. 실행 가능한 Quest는 Java를 제외한 기존 28개 |
| 프런트 연결 | 구현 담당 focused 77개 PASS 인계 뒤 테스트 담당이 stale routing 기대 1개를 수정했다. 관련 5파일 39/39, 후속 테스트 이름 수정 뒤 adapter 4/4 재검 PASS를 인계받았다. Java 프로세스 없이 Node의 계약·mock·비활성 gate를 확인한 범위이며 독립 test_engineer와 최종 통합은 별도 receipt로 판정한다 |
| runtime | 격리 compile·정상 JVM·단계 2·3·단계 5 실제 PASS. 단계 4 원본 harness는 `FAIL_STOPPED_POISONED`, 관찰된 30개 격리 효과만 독립 PASS이며 class 전후 hash 영속 증거와 cleanup은 없음. 단계 5는 기존 compile 2건을 재실행하지 않고 합계 javac 3·JVM 8로 충족했고 supervisor OOME 안내 보완은 raw 재분류로 확인함 |
| 배열 공개 평가 | 승인된 Quest 3개의 기준답안 공개 사례 18개 PASS와 대표오답 3개 `wrong_answer`, javac 6·JVM 21, 회수·cleanup·poison false를 독립 인수함. 100000개 배열은 포함했지만 실제 2 MiB 초과 경계는 실행하지 않음 |
| shell·로컬 산출물 | 상대 symlink 14개 보존·원본 불변·strict sign과 후속 Java 미실행 앱의 Markdown·기존 Worker·IPC/CSP·진도/초안 복원은 독립 PASS. tGqkAv 앱 FAIL과 이전 raw 없는 sign 미확인은 보존한다. 검증 커널의 활성 Java UI는 후속 독립 PASS이며 DMG·공식 채택은 미완료 |
| 독립 진단·최종 통합 | 단계 4 원본 FAIL과 격리 효과 한정 PASS를 함께 유지한다. OS 제한 prototype의 활성 Java UI는 독립 PASS이며 최종 프로젝트 통합·Git 게시와 구분한다. Java 코딩테스트 72개 실행은 별도 미완료 |

## 격리 실패와 재개 조건

실행 담당의 최종 receipt는 `/private/tmp/bam-java-runtime-implementation-receipt.md`이며 SHA-256은 `c30607d704a88d32c4425283586da3c647256c8e4878bde9041ff0f1225dbbdc`다. 당시 worktree HEAD는 `b97260eb866a15a02a80531107eca4b2144d436b`이지만 공유 작업 트리의 다른 변경과 구분하기 위해 아래 대상 파일 hash를 판정 기준으로 사용한다.

| 대상 | 최종 SHA-256 |
| --- | --- |
| `desktop/runtime/supervisor.mjs` | `1734cc740a09555c185360564b04490b8c4f2a328b6732a4b8cb0302c38c66e8` |
| `desktop/runtime/JavaBamQuestRunner.java` | `9875cb36a26eb7ab31b4a14df1f4a9bdb64c828fa33b2d200dfdf170ca7f708f` |
| `desktop/runtime/profiles/compile.sb` | `3831f59e22a3dbc69fcc8ae782decf409ebf0dc301cfa01a53bbb5f463b689c7` |
| `desktop/runtime/profiles/runtime.sb` | `d2315c0346813b07a5be334ab09ab7ae8d9ed83bdc79d4b1f248d716da990c13` |
| `content/quests/java.json` | `aefac56a188272fec894d62a074099e9b0ee71d128e9fc107874ddd69c67851e` |
| `tests/fixtures/java-code-quest-solutions.js` | `a910eaffeb38a015865bd16ff39f7023d65b46921f638c5f16944e3500784e10` |
| `content/schema/java-code-quest.schema.json` | `28f1d42e5a2271952601433753afc085b31b3882baaa06aba8f2b59b94d8e87d` |

실제 조건은 macOS 14.8.3 (23J220) arm64·Node 24.17.0·Temurin 25.0.4.1+1과 `.app` staging의 내부 JDK 경로다. 격리 전 제품 runner의 javac 컴파일은 class version 69.0으로 통과했다. 이후 deny-default sandbox에서 learner source 컴파일이 진행되지 않았고, 2026-09-15 08:16:24 KST 관찰에서 PID `7840`, `8672`, `9399`, `10208`, `11179`가 모두 `UEs`로 남았다. 메인의 후속 읽기 전용 확인에서도 잔존했다. SIGKILL 발송은 종료 증거가 아니며 이 프로세스들이 회수됐다고 보고하지 않는다.

중간 profile을 단계별 hash로 보존하지 못했으므로 최종 profile hash만으로 앞선 PID의 실패 원인을 확정할 수 없다. unified log의 경로/Mach deny 관찰은 진단 재료이며 특정 허용 규칙 누락이 원인이라고 단정하지 않는다. 독립 Astra 진단 역시 원인을 특정하지 못했다. profile을 더 넓히거나 새 JDK 프로세스를 반복 실행하는 실험은 중지했다.

실패 당시 `ISOLATION_PROTOTYPE_VALIDATED = false`로 bundle 접근·subprocess를 차단했다. 이후 compile·정상 JVM·timeout/cancel·단계 5·배열 공개 평가와 Java 미실행 앱 검증을 인수했고, 현재는 [검증 커널의 활성 Java Quest prototype PASS](#2026-09-22-활성-java-quest-앱-검증-pass) 상태다. 과거 실패 원인 전체 해소나 Java 코딩테스트·공식 OS·DMG·제품 통합 완료를 주장하지 않는다.

당시 후보 감독 코드는 `exit`와 `close`를 구분하고 hard deadline 뒤 `unreaped_process`와 process-wide poison으로 후속 실행을 차단하도록 보완했다. 종료를 관찰하지 못한 결과의 signal은 null로 남겨 발송 신호와 실제 종료를 구분했다. **수정 전에는 unreaped 뒤에도 `finally`가 작업 디렉터리를 삭제하는 결함이 있었다.** 그 후 보존·cleanup 구조화 패치와 늦은 이벤트 결함의 반환·재검사는 [재개 준비 기록](#2026-09-15-실행-재개-준비-인수)에 구분하며, 당시 고정 false gate를 유지했다. 현재 상태는 위 OS 제한 후보 절을 따른다.

재개에는 종료 불능의 원인·호스트 프로세스 상태 확인, 격리/회수·cleanup 계약의 독립 재검토와 보완, 성공한 독립 실행 환경이 필요하다. 같은 bundle/profile/launch 경로에서 compile→public 실행과 실제 종료·reap 및 필수 부정 검증을 통과한 뒤에만 gate 변경을 검토한다. JavaScript로 Java 결과를 모사하거나 무격리/system JDK/원격 fallback으로 우회하지 않는다. 재부팅이나 강제 종료 확대를 자동으로 수행하지 않는다. DMG 승인은 이 runtime 실패를 해결하는 조건이 아니며 별도 패키징 제약이다.
