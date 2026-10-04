# 첫 밤위키 외부 웹과제 연결 작업 카드

**현재 판정: 고정 묶음의 앱 연결 구현·독립 콘텐츠·실행·문서 검토·통합 PASS. 실제 Spring 실행·오프라인 검증 대기.** 전체 과제 지원·과제 PASS·설치형 MVP 완료를 주장하지 않는다.

## 범위와 인수

- 유형: 학습 콘텐츠 포함 기능 / 원본 기반 새 연결 경험. M5 첫 외부 과제 시범이며 교안 생성 작업이 아니다.
- 승인: 2026-09-15 밤위키 고정 시작 원본 선정·BAM 연결·검증 요청. 원본 v1 최초 AI starter 19파일만 파생 묶음으로 제공한다. 원본·사용자 풀이·운영/템플릿/예약·SQL/ERD·개인 자료·정답은 수정·반입하지 않는다.
- 정본: [외부 웹과제 설계](../designs/web-assignments.md#첫-원본의-고정-시작과-전달), [데이터 계약](../content-schema.md#외부-git-웹과제), [결정](../roadmap.md#2026-09-15-웹과제-원본-활용-결정).
- 선정 receipt: `/tmp/bamwiki-assignment-selection.md`; 고정 파일 목록 `/tmp/bamwiki-assignment-starter-manifest.json`; 원본 보존 `/tmp/bamwiki-assignment-source-preservation.json`. 원본 프로젝트 `2026-09-10-스터디모임/02-pin-board`의 commit `313b5be982bdc2296326cbed5319733fad5b05fe`에서 19개 blob을 확인했다. 현재 branch/dirty 파일과 후속 공동 풀이는 사용하지 않는다.
- 원본 보존 인수: 조사 전후 HEAD `259e3c60978cacec54753e472f880ab6b8ad242f`, 네 ref와 dirty README/Controller가 동일했다. 전체 원본 재조사 대신 이 receipt를 재사용하며 반입 담당은 필요한 19blob과 보존 기준만 대조한다.
- 목표: 자료 다운로드·README로 시작, 실제 선수 여섯 교안 이동, 공개 검증·오프라인 한계 이해, 별도 자가 진행/회고 저장. 기존 인앱 과제·초안·제출·진도 보존. 원본 실행 PASS는 별도 단계다.

| 임시 역할 | 소유·범위 | 완료·반환 |
| --- | --- | --- |
| 설계 문서 작성 | 외부 설계·schema 외부 절·본 카드·roadmap | 원본 근거·학습 경험과 구현 선행 계약. 내용 최종 승인은 하지 않음 |
| 원본 묶음 작성 | `content/web-assignments/**`의 고정 ZIP·manifest·컬렉션 | 19blob 바이트·mode·제외 범위·source/ZIP hash, 사용자 원본 보존. 학습 원문 재작성 금지 |
| 제품 구현 | 별도 loader/validator/저장소/route·웹과제 목록·상세, 필요한 정적 빌드 연결 | 기존 인앱 route/저장 보존, source 읽기/명령 자동 실행 없음. 테스트 작성자와 파일 분리 |
| 콘텐츠 독립 검토 | 원본·manifest·연결 데이터/화면 문구 읽기 | 목표·지원·선수 공백·정답 누출·원문 충실성 판정 |
| 테스트 작성·독립 실행 | 총괄이 겹치지 않는 focused 테스트/검증 범위 지정 | ZIP/해시/ID/route/저장·대표 데스크톱과 아래 실제 공개 실행 판정 구분 |
| 프로젝트 통합 | 선행 receipt·변경 범위·미해결 점 | 실제 PASS만 통합. Git 작업은 별도 승인·역할이며 이 카드 작성은 게시하지 않음 |

같은 경로는 선행 receipt 후 순차 인수한다. 검증은 변경 schema/자산·대표 route·키보드/저장 오류와 기존 인앱 회귀를 중심으로 선정한다. 이번 전체 회귀 실행은 아래 사용자 요청 예외를 따른다. 재시작 전 Java·Gradle·Spring·HTTP 검증은 보류한다. 공개 verify의 AST/가짜 opener 검사는 가능하나 과제 실행 PASS가 아니다.

## 앱 연결 재개와 판정 경계

- `[확정 결정]` 사용자의 이번 명시적 승인은 이미 반입된 묶음의 앱 연결, 오래된 상태 문서 정정, loader·validator·목록·상세·다운로드·실제 선수 이동, ID/revision별 자기보고 진행·확인표·회고 저장과 실패 처리다. 기존 인앱 URL·초안·제출·진도는 보존한다.
- `[현재 사실]` `content/web-assignments/index.json`과 `assets/study-meetup-pin-v1-313b5be.zip`·`.manifest.json`이 추적된 파일로 존재한다. 독립 콘텐츠 검토 역할이 기존 ZIP 19파일의 해시·bytes·mode 일치를 직접 확인했다. 원본 Git·과거 receipt 재조회는 수행하지 않았다. 과거 `/tmp` receipt의 현재 존재 여부를 반입 사실이나 앱 연결의 선행 조건으로 삼지 않는다.
- 설계 판정: 기존 카드의 새 E·C와 목표·선수·지원 근거를 재사용한다. 실제 Spring/공개 verify/offline gate는 전체 과제 지원·PASS 판정에 남겨 두며 승인된 정적 연결의 착수 gate로 확대하지 않는다. 상세 route·저장·오류·검증 범위는 [앱 연결 계약](../designs/web-assignments.md#단일-원본-앱-연결-계약), 데이터는 [스키마](../content-schema.md#외부-git-웹과제)를 따른다.
- 비범위: source Git·선정 receipt 재생성, 원문 교안/과제 재작성, Spring·Gradle·HTTP 실행, 네트워크 범위 확대, push·PR·merge·deploy. 실제 실행 재개는 아래 과거 실행 절차와 별도 승인을 따른다.
- 이번 역할 소유: Astra 설계 담당은 외부 설계·schema 외부 절·본 카드와 architecture의 외부 연결 관련 문장·문서 지도의 웹과제 행·roadmap의 관련 workflow 해시/근거 연결, 구현 담당은 loader·저장소·UI·앱 연결, 독립 테스트 작성자는 focused 테스트를 맡는다. 독립 콘텐츠 검토→읽기 전용 실행 검증→문서 검토·통합 판정 순서로 인계한다. Git 게시는 수행하지 않는다.
- 인계 상태: 앱 연결 구현과 독립 콘텐츠·실행·문서 검토·통합은 아래 인계 절의 범위에서 PASS다. 기존 전체 테스트 998 PASS·2 SKIP와 빌드 PASS는 기준선 근거로만 사용했다. 사용자가 요청한 전체 회귀 검사는 공통 focused 원칙의 이번 작업 예외로 수행했으며 최초 실패와 영향 재검사 결과를 아래에 구분했다.

## 선정 담당에게 인수한 학습 경험 카드

아래는 선정 receipt의 설계 카드이며 교육 내용·사용자 성과의 최종 승인이나 새 교안 저작을 뜻하지 않는다.

| 항목 | 내용 |
| --- | --- |
| 작업·대상 | 첫 외부 밤위키 연결 / `web-assignment-study-meetup-pin` revision 1 |
| MVP 이유 | 정적 Spring 개념을 외부 폴더 네 파일의 요청·상태·화면 연결로 이어주는 첫 원본 단위. 전체 Spring 실행·설치 MVP 완료 아님 |
| 선수 | `java-concept-objects`, `algo-list-conditions`, `spring-boot-start`, `spring-mvc-flow`, `spring-request-mapping`, `spring-request-parameters`와 외부 Thymeleaf 조건·text·반복/Model. 사용자 수행 여부 미확인 |
| 단서 | 고정/일반 두 구역, POST 상태 변경, 새로고침 조회, 없는 ID 404·GET 405, 메모리 재시작 초기화 |
| 새 A / 재사용 A | 새 A 단독 주장 없음. 객체 상태 읽기/변경, 조건별 목록 분류, 경로값을 HTTP 인수로 받기 재사용 |
| 새 E | URL의 ID→객체 상태 반전→저장소 목록 분류→POST 뒤 GET→Thymeleaf 버튼/구역 반영을 네 파일에 직접 연결 |
| C | 같은 ID 재클릭은 반전, 새로고침은 무변경. 없는 ID·GET 요청은 상태 보존, 한 글이 두 목록에 동시에 포함되지 않는 불변식 |
| T | 별도 무힌트 전이 증명은 주장하지 않음 |
| 사다리·지원 | 지원 있는 L2~L3 조합 과제. 원문 요구·변수명·계약·기반 구현·공개 검사, 선택 hints.md 제공. 완성 코드 없음 |
| 자기 설명 | 버튼 요청의 ID가 어떤 글을 바꾸고, 그 변경이 다음 GET과 두 목록에 어떻게 보이는지 설명한다 |
| 독립성 | 인앱 HTML/CSS나 정적 Spring 객관식과 달리 외부 네 파일의 실제 HTTP 상태와 view 조합. 숙달·무힌트 성과를 단정하지 않음 |
| 대표 오답 | 항상 false 접근자/빈 setter, 양쪽 목록의 동일 글, 원본 목록 삭제, GET 변경, redirect 누락, 고정 버튼 문구 불변, 없는 ID에서 다른 글 변경 |
| 공개·독립 범위 | 기존 verify 초기 세 글→2번 고정→동일 GET 반복→해제→전체 고정→없는 ID/GET→전체 해제. 수동 1·3 순차 고정·빈 목록·키보드·새로고침·재시작 초기화 |
| 출처·날짜 | 최초 Git `313b5be…`, 원본 v1 manifest·명세, 2026-09-15 선정 읽기 receipt |
| 사람 판단 | 콘텐츠 검토자가 원본문맥·지원·선수 공백·정답 누출, 실행 검증자가 정상·오류·상태 복구를 독립 확인. 실제 학습 성과 미확인 |

## 재시작 후 실행 검증

1. 사용자의 재시작 완료와 잔존 Java 부재를 확인한다. 14:55 KST 예정 시간 도달은 확인을 대신하지 않는다. 앱 Java runner 격리 복구와 외부 과제의 승인된 수동 실행을 혼동하지 않는다.
2. 원본/사용자 풀이와 다른 새 임시 폴더에 ZIP 19파일 exact hash·mode를 대조하고 지정 JDK 21·wrapper 준비를 확인한다. 시스템 기본 JDK나 앱 Java 25를 자동 변경하지 않는다.
3. 고정 starter를 실제 빌드하고 대상 서버임을 확인한 로컬 127.0.0.1:8086에서 초기 GET 세 글·POST 미구현 실패를 관찰한다. TODO가 남은 starter의 공개 verify 실패는 예상 상태이며 과제 결함이나 PASS로 왜곡하지 않는다.
4. 별도 검증용 완성 fixture가 필요하면 승인된 작성·검증 역할을 분리해 만들고 사용자 풀이를 사용하지 않는다. 정상·대표오답과 원문 공개 verify를 같은 환경에서 검사한다. fixture는 학습자 ZIP에 넣지 않는다.
5. 사전 다운로드 이후 offline 빌드·시작·verify·실제 화면/키보드를 확인한다. ZIP의 원본 wrapper는 의존성 캐시를 포함하지 않으므로 최초부터 완전 offline 시작 가능하다고 표시하지 않는다.
6. 시작한 서버를 종료하고 PID·포트 해제를 확인한다. 실패 시 검증 폴더와 근거를 보존하고 원본·사용자 풀이를 수정하지 않는다.

원문 `verify.py` SHA-256은 `4320ca7b31c35b61ea211df4dfe37ef17874f8a8a8d364a84af4e76d45db4559`다. 선정 담당의 정적 확인상 HTTP loopback만 허용하고 redirect를 따르지 않으며 POST가 글 상태를 바꾼다. 과거 2026-09-10 JDK 21.0.12.1 offline/완성 코드/375px 증거는 과거 자료이며 현재 호스트·고정 ZIP의 실행 PASS로 재사용하지 않는다.

## 현재 검사와 남은 판정

인수한 선정 검사는 고정 19blob SHA/bytes, 과거 manifest의 18파일 동일·bat 줄바꿈 동치, 원문 README/TODO/verify 정적 확인, 선수 ID/route와 원본 보존이다. 실행한 선정 담당과 증거는 위 receipt에 있다. 위 내용은 최초 선정 단계의 증거다. 후속 반입 사실과 이번 앱 연결의 승인·판정 경계는 위 재개 절을 따른다. 이 설계 문서 갱신 역할은 원본이나 ZIP을 재생성하지 않고 제품 코드·Java/Gradle/Python HTTP·브라우저·Git 작업을 수행하지 않았다. 독립 앱 검증과 실제 과제 실행·오프라인 검증은 별도 판정한다.


## 앱 연결 독립 검증 인계

- 콘텐츠 검토: 기존 ZIP 19파일의 SHA-256·bytes·mode, 정답 누출 없음, 선수 여섯 교안 연결과 원문 목표·지원 보존을 독립 확인했다. `self_completed`와 제품의 실행 재검증 대기를 구분하는 앱 표시는 범위 내 PASS다.
- 독립 focused 검사: 외부 연결 관련 34개 PASS를 인수했다. 구현자·테스트 작성자의 자체 결과와 구분한다.
- 독립 Chromium 데스크톱 검사: Chromium 151.0.7922.173에서 인앱 목록→외부 목록, 상세·제목 초점·대기 표시, 선수 이동, ZIP 다운로드 해시 일치, 키보드 저장·새로고침·기존/다른 revision 보존, 쓰기 실패 입력 보존·재시도, 읽기 실패 쓰기 차단·재시도, 기존 인앱 편집기까지 8흐름 PASS를 확인했다. page error와 외부 요청은 없었다. 증거는 `/tmp/bam-external-ui/result.json`과 `list.png`, `detail.png`, `write-failure.png`다. 이 임시 경로는 이번 인계 근거이며 배포 파일이 아니다.
- 기존 기록 보존 추가 검사: 실제 인앱 Web Project 초안을 수정·저장한 뒤 외부 자기보고를 저장해 외부 키 이외의 저장 값 전체가 유지되고, 돌아온 편집기에 같은 초안이 복원됨을 확인했다. Tab으로 확인표에 이동해 Space로 변경하는 키보드 동작도 PASS다. 증거는 `/tmp/bam-assignment-legacy-ui.log`다.
- 전체 회귀: `npm test` 1,034개 중 1,031 PASS·1 FAIL·2 SKIP를 인수했다. 실패는 외부 연결 관련 문서 갱신으로 `workflow-state.test.js`의 architecture 전체 파일 해시가 오래된 것 한 건이며, SKIP 2개는 native guard 검사다. 기존 runtime·React·전체 pilot 범위와 단계는 유지하고 관련 파일 해시·설명만 고쳤다. 수정 후 독립 재검사 `node --test tests/workflow-state.test.js` 11 PASS·0 FAIL·0 SKIP와 `npm run check:workflow -- docs/roadmap.md` PASS를 확인했다. 로그는 `/tmp/bam-assignment-workflow-retest.log`·`/tmp/bam-assignment-workflow-final.log`다. 전체 실행과 영향 검사 결과를 합치면 1,032 PASS·2 SKIP이며 전체 테스트를 다시 실행한 결과는 아니다. 전체 회귀 로그는 `/tmp/bam-assignment-full.log`다.
- `npm run validate:content`와 `npm run build`는 독립 PASS다. 로그는 `/tmp/bam-assignment-content.log`·`/tmp/bam-assignment-build.log`다. focused 정확한 명령은 `node --test tests/web-assignment-content.test.js tests/web-assignment-repository.test.js tests/web-assignment-view.test.js tests/app-web-assignment.test.js`이며 `/tmp/bam-assignment-focused.log`에 있다.
- 최종 독립 문서 검토 PASS: 변경 6문서의 추가 링크 13개·앵커, workflow 해시, 검사 로그와 수치·지원 경계를 확인했다. 최종 통합 PASS: 전체 변경 16경로(문서 6·제품 6·테스트 4), 원본 콘텐츠·묶음 자산 보존과 독립 증거를 확인했다. 앱 연결 범위의 남은 차단점은 없으며 실제 외부 과제 실행 지원의 완료를 뜻하지 않는다. source Git·receipt 재생성, 실제 Spring·Gradle·공개 HTTP verify·오프라인 실행·다른 브라우저 지원·Git 게시·배포는 수행하지 않았다.
