# Java 코딩테스트 원본 JUnit 실행 작업 카드

**현재 판정: 검증한 macOS 커널의 Java CT 로컬 prototype 정상·오류·대표 앱 UI 독립 PASS.** 제품 CT gate를 true로 전환해 해당 검증 환경에서 실행을 활성화했다. 정상 72문제·168그룹·501 invocation은 기존 증거와 후속 실행을 결합한 결과다. 정확한 재사용·실행·한계는 아래 기록을 따른다. 이 판정은 정식 설치·OS 지원 확대·M4/M6 완료·Git 게시·최종 프로젝트 통합을 포함하지 않는다.

## 범위와 완료 기준

- 유형: 일반 제품 기능·평가 실행 연결. 원본 72개 문제와 JUnit 공개 평가 의미·학습 지원은 변경하지 않는다.
- 입력: 작업 사본 `/Users/goonbam/.codex/worktrees/java-quest-runtime-fix/bam dev`, `codex/java-coding-test-runtime`, 시작 revision `cdf82806e0bdc82b9138083aa4515d350957977d`.
- 정본: [ADR 0006](../decisions/0006-java-coding-test-local-runtime.md), [CT 제품 흐름](../designs/coding-test.md#java-원본-junit-실행-계약), [기존 안전 감독 ADR](../decisions/0005-java-quest-local-runtime.md).
- 완료: 원본 source/provider/helper를 그대로 사용한 72개 문제의 168개 공개 method와 그 안의 모든 invocation의 실제 실행·typed adapter·집계·오류/취소·회수와 대표 UI/CT 저장 경계가 독립 검증을 통과한다. 168개 method 묶음의 parameterized invocation 총수는 실제 결과로 기록한다.
- 보존: 원본 publicTestSource·본문·예시·L1~L4 지원·ID/revision·순서·원본 자료, Quest class provenance·32개 Quest와 JS CT, 기존 초안·제출·완료. 사용자 코드/테스트의 문자열 변환이나 숨김 채점을 금지한다.
- 제외: 원본 루트 변경, 학습 내용 생성, 시스템 JDK·서버·네트워크 채점·OS 확대·DMG·정식 설치 지원. 원래 브라우저와 앱 origin 사이 진도 자동 이전 없음.

## 역할과 소유 범위

| 역할 | 소유·책임 | 완료·반환점 |
| --- | --- | --- |
| Astra 문서 담당 | 이 카드·ADR 0006, 기존 coding-test 설계·architecture·roadmap·docs 지도·ADR 0005의 연결 절과 최종 사용자 범위의 README | 구현 전 계약·범위·증거 상태 작성. 제품·테스트·독립 승인·Git 금지 |
| 제품 구현 담당 | CT Java runner·typed adapter·manifest/provenance 및 필요한 기존 desktop 감독/IPC/build와 CT adapter/UI 연결 파일. 구체 파일은 총괄 인계에서 고정 | 원본 평가 의미·Quest 안전 경계를 보존한 작은 구현, 기존 영향 검사 인계. 새 테스트 파일·독립 승인 금지 |
| 테스트 작성 담당 | CT 원본 보존·manifest/adapter·결과 집계·IPC/저장·안전 수명주기 검사와 검증 전용 harness | 독립 기대값·고정 실제 시나리오와 상한 준비. 제품 수정·자기 결과 최종 승인 금지 |
| 독립 문서·안전 검토 | 읽기 전용 계약/diff 및 source·fake·staging preflight | 허용 경로·source/class/JAR 정합·selector·freshness·fail-closed·회수 경계를 확인. 결함은 작성자 반환 |
| 독립 실행/UI 검증 | 읽기 전용 검증, 승인된 복제 staging·전용 userData·공개 fixture만 실행 | 실행 전 고정된 횟수/원본 hash·출력·프로세스 회수·정리·UI/진도 증거. 실패 즉시 중단·보존 |
| 프로젝트 통합·Git | 각각 별도 역할. 통합은 읽기 전용, Git은 통합 PASS와 부여된 게시 범위 이후 | 기존 유효 증거 재사용·바뀐 영향만 확인. 실행 PASS를 merge 승인이나 정식 배포로 확대하지 않음 |

겹치는 파일은 선행 역할 인계 뒤 순차 수정한다. 제품·테스트 작성자는 자기 결과의 독립 검증자를 겸하지 않는다. 구현 중 원본 평가 의미 변경이 필요해지면 이 일반 기능 범위를 중지하고 콘텐츠 권한·검증 경로를 별도로 판단한다.

## 검증 순서와 중단 조건

기존 Quest gate=true는 변경하지 않고 새 제품 CT gate=false를 유지한다. 독립 preflight 이후 private clone의 명시 gate 전환·freeze·manifest로 실제 실행을 검증한 뒤, PASS 후 제품 CT gate 전환과 영향 검사를 수행한다. renderer/env 우회는 허용하지 않는다.

1. **source/fake:** 원본 소스 hash·72문제와 168 method의 manifest 대응, 12타입·참조 의미, 첫 공개 그룹 1개 run/전체 submit 선택, CT/Quest 분리, malformed/zero/skip/abort/provider 오류, 취소·busy·poison·회수와 source/class provenance를 확인한다. 실제 JVM 횟수는 별도 기록한다.
2. **독립 안전 preflight:** bundle JAR/hash/license·exact OS/JDK/profile·고정 DTO/selector/classpath·3초/64 MiB·fresh method JVM·전용 staging·기록/관찰 실패와 종료 경계를 확인한다. 실행 전에 정상·오류·취소·닫기 시나리오, javac/JVM/Electron 상한, 보존 대상 hash와 cleanup 조건을 고정한다. 검증 전 capability 차단을 확인한다.
3. **실제 실행:** 검증된 staging에서 작은 대표 묶음부터 시작하고 통과한 범위만 확장해 전체 72문제의 공개 method/invocation 결과를 확보한다. 원본 기준답안·대표 실패·컴파일/실행기/provider 오류·0/skip/abort·시간/출력·freshness·취소·회수를 구분한다. 실패·관찰 불명·상한 초과·artifact 불일치 시 즉시 중단하며 원본 receipt·scratch·userData와 poison을 보존한다. 재개는 수정과 독립 재검토 뒤 새 실행 계약으로 한다.
4. **독립 UI·통합:** 한 그룹 문제의 quick/전체 동일 안내와 일반 웹에서는 차단, 검증 앱에서는 부분 실행→전체 제출→결과→취소·창 닫기→재시작 복원을 확인한다. 전체 submit PASS만 CT 완료, run/실패/취소/skip/abort는 미완료이며 Quest 진도는 불변이다. 키보드 실행·취소·초점·텍스트 상태와 기존 JS CT/Quest 대표 영향만 확인한다. 이후 독립 문서·프로젝트 통합을 거친다.

각 단계는 실제 실행·재사용·미실행과 검증 대상 hash를 기록한다. 기존 Quest runtime PASS는 변경되지 않은 감독의 근거로만 재사용하고 CT JUnit 실행 PASS로 대신하지 않는다. 이 계획 당시 미완료였던 원본 호환 실행·invocation 수·대표 UI/저장 검증의 후속 결과는 아래 최신 증거를 따른다. 정식 재배포·설치 지원의 완료로 확대하지 않는다. 매 수정마다 무관한 전체 테스트·빌드를 반복하지 않는다.

## 2026-09-22 독립 실행과 앱 검증 인수

원시 증거는 검증 기기에 로컬 보관하며 게시하지 않았다. 공개 문서에는 결과 요약과 SHA-256을 기록한다.

| 범위 | 실제 검증과 재사용 | 독립 근거 SHA-256 |
| --- | --- | --- |
| 정상 기준답안 | 72문제·168개 공개 method 그룹·501 invocation PASS. 기존 61/147/412를 재사용하고 새 11/21/89를 실행한 결합 결과이며 전체 재실행이 아님 | 로컬 전용 receipt: `/private/tmp/bam-java-ct-recovery-isquxx75/combined-reference-evidence.json` `e9f7aff3520253fabbaaea501e6190479985c62ed4a92e800d16fa15c20d7676` |
| 최소 권한 보완 | javac 1회·JVM 1회, allow 2개·EPERM deny 3개 독립 PASS | 로컬 전용 receipt: `/private/tmp/bam-java-dev-focused-2u6a_8_c/receipt/independent-focused-execution.json` `b21b52923e4603213647336f59dfaacdc5e0faf0c460b55ddc1a1991effa1d38` |
| 오류 분류 | javac 6회·JVM 5회, wrong answer·syntax error·runtime error·timeout·cancel·output 제한 6종 PASS | 로컬 전용 receipt: `/private/tmp/bam-java-ct-error-recovery-fq4i6dl6/receipt/independent-errors-execution.json` `58fe325fc96da456675ed7834c61e1a127918d4fc603c0b251a97f8b02fd5667` |
| 대표 실제 앱 | Electron 2회·javac 3회·JVM 4회. quick 제출/완료 기록 0, submit 공개 2그룹·6 invocation PASS와 완료 1, UI 취소·회수, 재시작 후 source·PASS submission·completion 복원 PASS | 로컬 전용 receipt: `/private/tmp/bam-java-ct-ui-reviewed-entropy-limits-F6pD3s8J/receipt/independent-ui-execution.json` `181849d8d760f9cc4efc381f6a264d59ad07f45eb17f0c6f4aaff2dc01718c58` |

인수한 실행은 프로세스·observer 회수와 입력 불변, poison 없음이 확인됐다. 실제 앱의 상세 결과 카드는 session-only이며 재시작 후 카드 전체가 복원됐다고 주장하지 않는다. 창 닫기는 변경되지 않은 공유 종료 경로의 기존 PASS를 재사용했으며 이번 CT UI 실행에서 새로 관찰했다고 기록하지 않는다. 정상 전수 결과는 기준답안 공개 평가의 범위이고 모든 사용자 풀이·모든 화면을 전수 검증했다는 뜻이 아니다.

### sim06 실패와 최소 metadata 보완

선행 sim06 실패에서는 CSV→UUID→DRBG의 `ThreadedSeedGenerator` entropy 대기를 실제 관찰했다. 정확히 어떤 syscall이 거부됐는지는 관찰하지 못했으므로 직접 원인으로 확정하지 않는다. `runtime.sb`의 `/dev` metadata 허용 한 줄을 보완한 뒤 CSV 두 사례의 7·5 invocation이 각각 360.7·364.7ms로 통과했고 위 focused 권한 검사도 독립 PASS했다. 앞선 FAIL·POISON과 보존된 원본 receipt를 성공으로 바꾸거나 삭제하지 않는다. 변경 전 정상 증거와 보완 뒤 fresh 실행의 범위는 combined reference에 구분한다. 임의 시간·메모리 예산 상향이나 전역 권한 완화로 해결한 것으로 기록하지 않는다.

### 활성화와 남은 경계

기존 Quest gate=true는 유지하고 독립 실제 검증 뒤 제품 `CODING_TEST_PROTOTYPE_VALIDATED`를 false에서 true로 전환했다. `darwin/arm64`·검증 OS release `23.6.0`·kernel 전체 version 일치 제한과 번들 JDK 25·공유 단일 실행 잠금·poison/reap 경계는 유지한다. 제품 담당은 false→true 한 줄 변경과 `node --check` exit 0, 실제 UI 검증 앱의 staged supervisor와 바이트 동일함을 확인했다. 현재 supervisor SHA-256은 `36c34f0b009c510a6ace4821f13e661c8c3598345554af4993a689461ef3c080`이며 로컬 전용 receipt: `/private/tmp/bam-java-ct-gate-activation-UIN5x5vQ/HANDOFF.json`의 SHA-256은 `c54c21e58d1a62c1cdbbbacd363d12cec607757283e73742ffdb7f33216cc6ff`다. 최초 자동 승인 검토 거부는 실제 최종 receipt 확인 뒤 동일 패치의 정상 재검토 승인으로 해소했다. 문서 담당은 gate 실물과 hash를 읽기 전용으로 확인했으며 새 Java/Electron 실행을 하지 않았다.

웹은 Java 작성·저장만 제공한다. 정식 설치본 제공·공식 지원 OS 확대·DMG·공식 Electron 채택·전체 MVP 완료는 이 prototype 검증 범위 밖이다. 아래 PR #22/#23은 시작 기준선 이력이며 이번 CT 구현의 Git 게시나 최종 프로젝트 통합 완료 증거가 아니다.

## 인수한 기준 증거

- JUnit 6.1.3 JAR 크기·SHA-256·공식 checksum 일치·동봉 license를 임시 ZIP 읽기로 확인했다. [ADR 고정 metadata](../decisions/0006-java-coding-test-local-runtime.md#junit-고정-배포물), 로컬 `/private/tmp/bam-junit-6.1.3-metadata/metadata.json`. 이 조사의 Java/Electron 실행은 0이다.
- Git 담당이 PR [#22](https://github.com/bam090/BAM.dev/pull/22)의 merge `90fab24db3db58cd290b7afa16f9da968bffafb8`, [#23](https://github.com/bam090/BAM.dev/pull/23)의 merge `cdf82806e0bdc82b9138083aa4515d350957977d`와 양쪽 CI·Pages SUCCESS를 확인해 인계했다. 마지막 [CI](https://github.com/bam090/BAM.dev/actions/runs/35671542752)·[Pages](https://github.com/bam090/BAM.dev/actions/runs/35671542496)는 기준선 증거이며 새 CT 실행 구현의 검증 결과가 아니다. 병합 시각은 기록하지 않는다.
- Quest의 검증 커널 한정 prototype PASS와 과거 실패는 [기존 작업 카드](2026-09-15-java-code-quest-runtime.md)에 보존한다.

## 2026-09-22 상세 결과 복원과 오류 안내 후속 설계

**현재 판정: renderer/storage 구현·focused 13/13·독립 문구 검토·실제 Electron 상세 복원 검증 PASS.** 사용자는 재시작 후 상세 결과 복원과 오류 6종의 확인 안내를 요청했다. 저장/UI 개선과 공통 학습자 피드백 유지보수이며 새 문제·교안·채점 의미를 만들지 않는다. 기존 미게시 28경로 결과와 앞선 session-only 검증 이력은 보존한다. [제품 계약](../designs/coding-test.md#상세-결과-복원과-오류-안내)과 [저장 구조](../architecture.md#현재-브라우저-구현-경계)를 따른다.

| 역할 | 소유와 완료 기준 |
| --- | --- |
| `java_runtime_status_docs` / Astra medium | coding-test 설계·architecture 저장 절·이 후속 절만 작성. 현재 미구현과 선행 실행 PASS 구분 |
| `java_ct_ui_adapter` / Sol xhigh | 기존 repository/domain/공통 renderer의 상세 snapshot·복원·6안내 구현. source fingerprint·정규화·현재 API 조사 결과의 최소 계약을 문서 담당에 인계. engine/IPC/JDK 변경 금지 |
| `java_ct_contract_tests` / Sol xhigh | 저장·복원·안내·손상/용량/실패·진도 보존 테스트 작성. 제품 구현 및 독립 승인 금지 |
| `java_ct_document_review` | 읽기 전용 문서·content 검토: 안내의 정확성·원본 평가 의미 보존·실제 상태와 링크 확인 |
| `java_lifecycle_validation` / Astra high | 독립 저장/복원·오류 안내 검사와 대표 데스크톱 재시작 검증. 작성 역할 겸임 금지 |
| `java_final_integrator` / Astra medium | 앞 단계 증거와 한정 diff·기존 결과 보존을 읽기 전용으로 통합 판정 |

완료는 run/submit 마지막 상세 결과와 6종 오류 안내의 복원, 코드 변경 시 과거 결과 안내, revision 불일치 미복원, optional 필드 없는 기존 v1 수용, 개별 손상 제외, 20문제·64 KiB 경계, 과대/저장 실패 안내, reset 삭제와 기존 초안·제출·완료 불변으로 확인한다. 부분 실행의 상세 저장이 제출/완료를 만들거나 복원이 자동 실행을 시작해서는 안 된다. 예상/실제 값과 오류·Java 집계는 원래 결과를 보존한다.

source/fake·저장 테스트와 대표 데스크톱 재시작만 새로 검증한다. 기존 정상 72문제·6오류 Java 실행은 engine/IPC/JDK 불변 근거로 재사용하며 반복 실행하지 않는다. 모바일·새 OS·설치 지원·Git 권한은 없고 새 이력 화면·탭·범용 저장 프레임워크를 추가하지 않는다. 제품 조사 인계로 exact UTF-8 source의 lowercase SHA-256(정규화 없음), optional `codingTestResults`, get/save/clear 세 API와 repository clock을 확정했다. Web Crypto 실패는 결과를 버리지 않고 상세 저장 실패로 안내한다. 상태별 기본 원인/확인 안내를 사용하고 memory_limit·infrastructure처럼 실제 error.type이 있는 경우에만 해당 진단에 맞게 표시한다. 원래 오류 메시지는 escape하여 별도로 보존한다.

### 상세 결과 구현과 focused 검사 인수

단일 마지막 snapshot, 정확한 source fingerprint, 코드 변경 시 이전 결과 표시, reset 삭제와 오류 6종 안내를 구현했다. 문제당 마지막 결과 1개·최신 20문제·개별 UTF-8 64 KiB 제한을 유지하고 취소는 오답으로 처리하지 않으며 복원으로 새 제출·완료를 만들지 않는다. 제품 4파일·테스트 3파일의 SHA와 실제 focused 명령은 로컬 전용 receipt: `/private/tmp/bam-java-ct-result-contract-tests-20260922.json`에 보존한다. 저장 6/6·앱 연결 5/5·표시 2/2, 합계 13/13 PASS를 인수했다.

손상 snapshot의 최상위 outcome과 summary/tests가 불일치해도 복원되던 회귀는 최초 0/1 FAIL이었다. 제품 담당이 outcome 정합 검사를 추가한 뒤 같은 사례가 PASS했고 손상 항목만 제외하도록 보완했다. 원래 실패를 삭제하거나 처음부터 통과한 것으로 기록하지 않는다. 독립 문구 검토도 PASS했다.

이번 변경은 renderer/storage에 한정하며 Java·javac 새 실행은 0이다. 기존 정상 72문제·168그룹·501 invocation과 실제 오류 6종의 증거를 재사용했다. focused 검사는 기존 실제 오류 receipt에서 도출한 report DTO를 사용했으며 Java 실행을 반복하지 않았다. 실제 Electron 상세 카드 복원은 아래 기존 report replay 범위에서 독립 PASS했다. 선행 session-only 검증 이력과 최종 통합·Git 권한 경계는 유지한다.

### 실제 앱 상세 복원 검증 인수

기존 실제 report replay 기반 로컬 전용 receipt: `/private/tmp/bam-java-ct-result-replay-preflightfix-mNISElkX/receipt/independent-replay-execution.json` (SHA-256 `16b4e7bd1b7b1425c9d0ccfbf9672c135ecd7a74593d8d479a5f2031c9acc4b5`)를 인수했다. Electron 2회·replay 2회이며 재시작 replay와 Java·javac 새 실행은 각각 0회다. quick 상세 저장은 진도를 만들지 않았고, submit 저장 후 재시작에서 두 그룹의 5+1 invocation·mode·진도를 그대로 복원했다. 코드 편집 시 이전 코드 표시와 focus/caret 유지, reset 시 상세·초안 삭제와 기존 제출·완료·Quest 보존도 PASS했다. 복원은 새 제출·완료를 만들지 않았다.

앱 2개 종료 코드 0·프로세스 그룹 부재·observer 32개 회수·poison false·입력 파일 불변을 확인했고 제품 4파일은 focused 계약 receipt의 SHA와 같았다. 이 결과는 renderer/storage와 검증 환경의 앱 복원을 확인하며 새 채점·native IPC·정식 설치·추가 OS·Git 게시 완료를 뜻하지 않는다. 기존 Java 정상·오류 실행 증거와 선행 session-only 이력은 유지한다.

### 게시 전 P2 보완과 회귀 결과

`[현재 사실]` app의 digest 실패 후 route 보호와 복원 결과의 stale 표시에서 원문 코드로 돌아오는 처리 2건, main의 cleanup 대기 중 취소 예약 1건을 보완했다. 제품 SHA-256은 app `f02ff41c8e9c02f1cfdf54742bed9c2977645b7475e8c6684f1ebfc896fe07d6`, main `b98eb56ef66a26196dcf18c39b51d85b01ea1bc251f2e9cb243c0c0ff15949a7`이다.

전담 fake 회귀는 app 4/4 PASS이며 shell은 기존 3개 PASS와 테스트의 cross-realm 표현만 수정한 1/1 PASS를 합친 관련 4개 증거다. syntax·diff 검사도 PASS했다. 테스트 SHA-256은 app `91252c78cccf1343643ea8f63a83068f15f37f7db09173373a5cc32d36f2163f`, shell `3942cad57fe15af4f9920092bb6f052cb40d508bc0b505d9cb9b8d7cbfcff1c6`이다.

이번 보완은 fake/Node 검사로 확인했으며 새 Java·Electron 실행은 0이다. 앞선 native 정상 72문제·오류 6종과 실제 앱 replay는 이전 기준선의 검증이며 변경되지 않은 부분의 증거만 재사용한다. 해당 앱 binary로 최신 보완까지 실제 실행한 것은 아니다. 원래 실패와 과거 SHA 이력을 보존하며, `java_final_integrator`가 UI P2 2건의 delta·회귀 검토(app `f02ff41c…`/test `91252c78…`)를, `java_lifecycle_validation`이 main 취소 P2의 delta·회귀 검토(main `b98eb56e…`/test `3942cad5…`)를 각각 PASS로 인수했고 새 P1/P2와 새 실행은 0이며 Git 게시는 아직 완료하지 않았다.
