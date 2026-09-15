# Java Code Quest 실행 지원 작업 카드

`[현재 사실]` 이 문서는 별도 미게시 로컬 작업의 Java/desktop 후보 설계와 격리 실패 이력이다. 아래 desktop 파일 경로·명령·해시는 당시 로컬 증거이며 이 브라우저 게시 작업본에 해당 소스·JDK·Electron·desktop 스크립트가 있다는 뜻이 아니다. 이 문서의 보존은 실행·설치 지원이나 실행 재개 승인이 아니다.

**현재 판정: Java 실행 지원 미완료 / 실제 격리 prototype FAIL·BLOCKED.** 후보 코드와 정적 콘텐츠는 보존하되 capability를 고정 false로 유지하고 추가 Java/JDK 실행을 중지했다. 부분 검사 PASS를 제품 지원 완료로 해석하지 않는다.

## 목표·승인·완료 경계

- 유형: 학습 콘텐츠 포함 기능. bam의 2026-09-15 “Java 실행 지원” 선택으로 문제 설계에 머물지 않고 첫 Java Quest를 실제 로컬 컴파일·실행에 연결한다.
- 결정/정본: [DEC-JAVA-QUEST-RUNTIME-01](../roadmap.md#2026-09-15-java-실행-지원-결정), [ADR 0005](../decisions/0005-java-quest-local-runtime.md), [Quest 설계](../designs/code-quest.md#java-직접-작성과-로컬-실행-pilot), [Java schema 계약](../content-schema.md#java-정적-메서드-quest-pilot), [장기 설치 목표](../designs/local-application.md).
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

아래는 콘텐츠 생성자의 2026-09-15 원고에서 인계한 카드다. 설계 담당은 L2·상품 소계→배송비의 E 방향을 승인했고 독립 정적 콘텐츠 검토도 PASS했다. 등록 데이터가 승인 원고와 같다는 인계를 바탕으로 그 정적 검토를 재사용한다. 실제 Java 평가 검증은 미완료다.

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

승인 원고를 `content/quests/java.json`과 `tests/fixtures/java-code-quest-solutions.js`에 등록했다. 한 Quest, 공개 6개·예시 3개·힌트 3개·기준답안 1개·대표오답 6개·독립 사례 5개다. 공개 입력은 일반·큰 곱·최대·0수량·배송비0·전부0이며 가격0 등은 독립 개발 사례로 구분한다. 산술/JSON/오답 모델 대조·독립 정적 내용 검토와 등록 schema 검사는 PASS했지만 실제 격리 Java 컴파일·공개/독립 사례·대표오답 실행은 통과하지 못했다. source·타입·서명·10진 long 운반은 콘텐츠 schema 계약을 따른다. 독립 사례는 학습자 답안에 실행하지 않는다.

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
| sandbox 실제 관찰 | 최초 Codex 내부 중첩 EPERM과 별개로, 이후 호스트의 허용된 실제 sandbox javac가 `UEs`로 남아 SIGKILL 뒤 종료·reap을 확인하지 못함. 원인 특정 실패, 추가 Java/JDK 실행 중지 |
| 선행 설계 | 이 카드와 ADR·기존 정본의 pilot 계약 기록. 설계 담당의 소유 7개 Markdown 내부 파일/앵커 자체 검사 PASS, 기준선 대비 변경 diff·SHA receipt 생성. 선행 독립 정적 문서·위험 검토 PASS; 실제 격리 성공을 뜻하지 않음 |
| 콘텐츠·schema | 승인 원고와 등록 데이터 동일 인계에 따라 독립 정적 내용 PASS 재사용. Java 1개 포함 등록 29개 콘텐츠 검사 PASS. 실행 가능한 Quest는 Java를 제외한 기존 28개 |
| 프런트 연결 | 구현 담당 focused 77개 PASS 인계 뒤 테스트 담당이 stale routing 기대 1개를 수정했다. 관련 5파일 39/39, 후속 테스트 이름 수정 뒤 adapter 4/4 재검 PASS를 인계받았다. Java 프로세스 없이 Node의 계약·mock·비활성 gate를 확인한 범위이며 독립 test_engineer와 최종 통합은 별도 receipt로 판정한다 |
| runtime | 후보 구현·무격리 제품 runner 컴파일·false gate/프로토콜 parser 검사는 통과. 실제 격리 compiler 종료/회수 실패로 Java capability는 고정 false이며 공개 평가·필수 부정실행 검증 미완료 |
| shell·로컬 산출물 | 로컬 `.app` 빌드와 ad-hoc 서명 PASS 인계. 앱의 독립 실행/UI·Java 지원 PASS로 확대하지 않음. DMG는 hdiutil 자동 승인 검토 거부로 미생성·재시도하지 않음 |
| 독립 진단·최종 통합 | 독립 격리 진단은 원인을 특정하지 못해 BLOCKED. 문서/남은 정적 검사 후 비활성 상태의 보존·중단 통합만 예정이며 Java 제품 지원 PASS는 아님 |

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

현재 `ISOLATION_PROTOTYPE_VALIDATED = false`는 bundle 파일을 열거나 subprocess를 만들기 전에 차단한다. capability는 `available:false`, 실행 결과는 `engine_error` / `java_isolation_unavailable`와 공개 사례 `not_run`이다. 이 거부 동작·syntax check·프로토콜 parser 확인은 신규 Java 프로세스 없이 수행한 부분 검사다. Java 공개/독립 사례·대표오답, fresh JVM/state 초기화, 시간·출력·메모리·취소, 파일·네트워크·프로세스 부정 canary의 실제 PASS 증거는 없다.

후보 감독 코드는 `exit`와 `close`를 구분하고 hard deadline 뒤 `unreaped_process`와 process-wide poison으로 후속 실행을 차단하도록 보완했다. 종료를 관찰하지 못한 결과의 signal은 null로 남겨 발송 신호와 실제 종료를 구분한다. **후보 `finally`의 unreaped 상태 뒤 작업 디렉터리 삭제는 재활성화 전 보완·검증할 사항**이며 현재 false gate 아래에서는 그 실행 경로를 호출하지 않는다.

재개에는 종료 불능의 원인·호스트 프로세스 상태 확인, 격리/회수·cleanup 계약의 독립 재검토와 보완, 성공한 독립 실행 환경이 필요하다. 같은 bundle/profile/launch 경로에서 compile→public 실행과 실제 종료·reap 및 필수 부정 검증을 통과한 뒤에만 gate 변경을 검토한다. JavaScript로 Java 결과를 모사하거나 무격리/system JDK/원격 fallback으로 우회하지 않는다. 재부팅이나 강제 종료 확대를 자동으로 수행하지 않는다. DMG 승인은 이 runtime 실패를 해결하는 조건이 아니며 별도 패키징 제약이다.
