# JavaScript 학습문서 통합 작업 카드

## 현재 상태와 승인 범위

`[확정 결정]` 작업 ID는 `JS-INTEGRATE-20261002`이며 사용자에게 승인받은 JavaScript 교안 재구성 작업입니다.
유형은 학습 콘텐츠 포함 기능이며 기존 경험을 재사용하고 순서 연결 E를 강화하는 콘텐츠 변경으로 관리합니다.
단순 오탈자 유지보수나 신규 문항 추가로 분류하지 않습니다.
기준은 `02c363f473a92e8f1b21820cc199ae68e3848e24`입니다.
설계 인계 문서 `javascript-design.txt`의 세 쌍 통합을 채택하며 설계 인계 PASS를 본문 작성·독립 검증·통합 PASS로 확대하지 않습니다.

`[현재 사실]` 2026-10-02 본문 작성과 공용 메타데이터 반영을 마쳤으며 독립 내용 검증·실행 검증과 대표 앱 UI 검증에서 각 담당 범위의 PASS를 받았습니다.
최종 `curriculum.json`에서 JavaScript 활성 30편·보관 10편·등록 40편과 전체 활성 157편을 대조했으며 README의 수량과 일치합니다.
최종 프로젝트 통합은 심사 중입니다.
이 카드는 통합 PASS를 선언하지 않으며 최종 판정은 후속 프로젝트 통합 담당 보고서를 따릅니다.
과거 [JS·Java 개념 전환 카드](2026-09-14-js-java-concepts-and-review.md)의 수량·PASS·출처 확인일은 당시 기록으로 보존합니다.
이 작업은 새 학습 성과나 무힌트 전이 성과를 주장하지 않습니다.

## 범위와 역할

MVP 목적은 같은 판단을 위해 두 문서를 왕복하던 구간을 한 예제에서 비교하도록 만드는 것입니다.
JavaScript 활성 33편(runtime 1편과 concept 32편) 중 아래 세 쌍만 합칩니다.
그 결과는 활성 30편·보관 10편·등록 40편이며 숫자를 맞추기 위해 추가 병합하지 않습니다.
다른 과목을 유지하면 전체 활성 수량은 160편에서 157편으로 줄고 객관식은 전체 382문항·JavaScript 69문항을 유지합니다.

| 역할 | 소유 범위와 순서 |
| --- | --- |
| Astra 설계 담당 | 기준 본문·질문·선수·출처를 읽고 세 쌍 통합 설계를 인계합니다. |
| 승인된 본문 작성자 | `content/lessons/javascript/`의 받는 문서 세 편과 설계가 지정한 직접 연결 세 곳만 수정합니다. |
| 학습 문서 관리자 | 본문 인계를 받은 뒤 `content/curriculum.json`의 해당 metadata와 `content/review-concepts.json`의 지정 연결·발췌를 순차 반영합니다. |
| Astra 문서 작성자 | `README.md`의 JavaScript·전체 활성 숫자 세 곳과 이 카드만 작성합니다. |
| 테스트 작성자 | `tests/javascript-lesson-integration.test.js` 신규 회귀, `tests/js-java-concept-lessons.test.js`의 JS 통합 기대값, `tests/learning-catalog-view.test.js`의 승인된 수량 기대값 세 곳만 수정합니다. |
| 독립 검증자 | 내용·출처·실행·링크·진도·수량을 읽기 전용으로 검증하며 작성자와 분리합니다. |
| 프로젝트 통합 담당 | 최종 변경 범위와 독립 증거를 확인해 로컬 통합 완료를 판정합니다. |

공용 JSON과 README는 소유권 인계 없이 병렬 수정하지 않습니다.
본문·문서 작성자는 자신의 결과를 독립 승인하지 않습니다.
이 작업에서는 Git 게시를 수행하지 않습니다.

runtime·기존 보관 7편·새로 보관할 3편의 본문과 그림은 기준 바이트 그대로 보존합니다.
다른 과목·전체 풀이·Quest·문항 객체·사용자 풀이·원본·제품 코드·저장 키는 변경하지 않습니다.
테스트 변경은 위 테스트 작성자의 세 파일에 한정하며 기존 Java 기대값과 그 밖의 기대값을 보존합니다.
목록 테스트의 허용 수량 변경은 전체 활성 160→157·전체 보관 53→56·JavaScript 활성 33→30입니다.
새 lessonId·conceptId·slug·route·order를 만들거나 기존 order를 재번호하지 않습니다.

## ID와 발췌 연결

| 받는 lessonId / order | 보관할 lessonId | 새 활성 제목 | 받는 conceptIds |
| --- | --- | --- | --- |
| `js-concept-object-sharing` / 18 | `js-concept-shallow-copy` | 객체 공유와 얕은 복사 | `js.object-identity`, `js.shallow-copy`, `js.object-sharing` |
| `js-concept-event-delegation` / 25 | `js-concept-event-defaults` | 이벤트 대상·위임과 기본 동작 | `web.event-delegation`, `web.event-defaults` |
| `js-concept-async-await` / 31 | `js-concept-promise-chain` | Promise와 async·await의 결과 연결 | `js.async-failures`, `js.promise` |

받는 파일은 각각 `wiki-object-sharing.md`, `wiki-event-delegation.md`, `wiki-async-await.md`입니다.
보관 표시는 목록에서만 제외하며 기존 깊은 URL·문항 소유·source·order·본문을 유지합니다.
보관 ID의 완료 기록을 받는 ID로 복사하거나 초기화하지 않습니다.
받는 ID의 기존 완료 기록도 그대로 유지합니다.
`js.async-await`는 조합 문서의 기존 개념이므로 가져오지 않습니다.

아래 행은 `(lessonId, id)`로 구분하며 문항 소유 `lessonId`는 바꾸지 않습니다.

| 소유 lessonId / concept id | 새 documentLessonId | 유지할 heading |
| --- | --- | --- |
| `js-notes-collections` / `js.object-sharing` | `js-concept-object-sharing` | filter도 요소 객체까지 복제하지 않는다 |
| `js-concept-shallow-copy` / `js.shallow-copy` | `js-concept-object-sharing` | 바꿀 중첩 단계까지 새로 만들기 |
| `js-concept-event-defaults` / `web.event-defaults` | `js-concept-event-delegation` | 기본 동작 취소와 이벤트 전파 중단은 다른 일이다 |
| `js-06-async-fetch` / `js.promise` | `js-concept-async-await` | Promise는 나중 결과를 나타내는 객체다 |
| `js-concept-promise-chain` / `js.promise` | `js-concept-async-await` | Promise는 나중 결과를 나타내는 객체다 |

받는 쪽의 기존 네 행도 유지합니다.
객체의 `js.object-identity`는 `매개변수에 다른 객체를 다시 넣으면`, 이벤트의 `js-05-dom-events`·`js-concept-event-delegation` 소유 두 행은 `이벤트는 부모 쪽으로 전달될 수 있다`, 비동기의 `js.async-failures`는 `실패 처리`에 연결합니다.
위 아홉 행 중 본문이 달라진 excerpt는 최종 해당 절에서 정확히 발췌하며 새 설명으로 요약하지 않습니다.
기존 내용 heading과 보관 문서 heading을 유지하고 새 heading만 명사형으로 작성합니다.
`한줄 요약` 제거는 최신 작성 계약에 따른 예외이므로 해당 앵커 소비 여부를 별도 확인합니다.
`answerHeading=핵심 질문 답`과 접힌 직접답·문항 정답 경계를 유지합니다.

## 출처 계보

공개 원문과 원본 SHA는 [기존 공개 원문·보완 계보](2026-09-14-js-java-concepts-and-review.md#공개-원문과-보완-계보)를 재사용합니다.
원문 확인일이나 과거 실행 PASS를 이번 실행 결과로 바꾸지 않습니다.

| 병합 단위 | 기존 단위와 원문 구간 |
| --- | --- |
| 객체 공유·복사 | JSU11: JS04 15–113, 235–252 / JSU12: JS04 115–247, 254–286 및 JS03 241–254 |
| 이벤트 위임·기본 동작 | JSU18: JS06 226–296 / JSU19: JS06 298–315 |
| Promise·async·await | JSU23: JS08 49–121 / JSU24: JS08 123–143, 236–261 및 JS07 215–259 |

JSU24의 과거 표는 2026-09-26 보강 이전 이력입니다.
기준 `wiki-async-await.md`의 `loadMembers`·`loadAttendance`·성공/실패/출석 예제·then/await 비교표와 `async-await-timeline.png`·`async-try-timeline.png` 및 alt를 최신 근거로 보존합니다.
현재 source의 `kind=bam-authored`·`verifiedAt=2026-09-26`을 임의 변경하지 않습니다.
받는 문서의 source 하나에 모든 계보를 억지로 합치지 않고 아래 기준 본문 SHA와 보관 ID를 함께 추적합니다.

| 기준 본문 | 02c363f의 SHA-256 |
| --- | --- |
| `wiki-object-sharing.md` | `4dd94a009f9d95375ac83673f5bbc8ae694230520109cb69dfd90251cb03d0ba` |
| `wiki-shallow-copy.md` | `18f05fcbf33bcc1c0c43fc78141c8cdd426684c7425cf2fa8708f611c7e1d50d` |
| `wiki-event-delegation.md` | `683a1245733d6f9399ee6f19c19d266743d679c54af4c8d0453454f14df34856` |
| `wiki-event-defaults.md` | `04e0741af6e099c29665c9a399c3680721a51f59260d23cc39e1ce7cd2246ec0` |
| `wiki-async-await.md` | `1a51bdc7302270e79523ae36f52a1c638d3d9777f684c31492e4490ae34b70d6` |
| `wiki-promise-chain.md` | `85017a9da48268c860bbfb33ab5aef987913582125489ef634f9b9a543a72eec` |

공식 자료는 받는 문서마다 최대 세 개를 사용합니다.
객체는 기존 Language Types·Array and Object Initializers·CopyDataProperties, 이벤트는 WHATWG DOM Events·WHATWG HTML Forms·W3C UI Events, 비동기는 MDN async function·MDN await·ECMA-262 Promise Objects를 사용합니다.
다른 공식 URL은 보관 본문에 남기며 출처 확인일은 작성자가 실제 확인한 날짜만 기록합니다.
이 카드의 계보 대조일은 2026-10-02이며 공식 기술 출처의 새 확인 완료를 뜻하지 않습니다.
한국어는 [프로젝트 작성 기준](../lesson-authoring.md#한국어-작성-공통-기준)과 2026-10-02에 읽은 [fluent-korean 원문](https://raw.githubusercontent.com/snflkd/fluent-korean/main/plugins/fluent-korean/output-styles/fluent-korean.md)을 적용합니다.

## 경험 재사용과 학습 흐름

새 A와 새 T는 추가하지 않습니다.
L0 관찰 → L1 설명 → 기존 문항의 L1/L2 판단을 재사용하며 직접답은 기존 접힘 영역에 둡니다.
이름·숫자 변경을 새 조건 C로 계산하지 않습니다.
화면·키보드·오프라인은 기존 정적 교안·객관식·수동 완료 UI를 재사용하며 서버나 실행 기능을 추가하지 않습니다.
실제 지원 범위는 기존 제품 계약을 유지하며 이번 문서 변경만으로 추가 플랫폼 지원을 주장하지 않습니다.

| 항목 | 객체 공유·복사 | 이벤트 위임·기본 동작 | Promise·async·await |
| --- | --- | --- | --- |
| 선수 | variables·arrays-objects·array-methods | dom-properties·forms-state | function-return·callbacks·error-boundaries |
| 발견할 단서 | 같은 객체인지와 바뀌는 중첩 경로 | 클릭한 안쪽 요소와 담당 목록·취소할 동작 | 다음 단계가 필요로 하는 값과 실패를 받는 위치 |
| 재사용 A/C | 객체 정체성·변경 경로 추적·원본 보존 조건 | 담당 요소·포함 관계·취소 조건·전파 범위 | 결과 반환·상태 확정과 결과 추종·호출자 실패 처리 |
| 강화할 E | 공유 확인 → 복사 범위 선택 → 필요한 경로만 복사 | 담당 요소 확인 → 해당 동작 취소 → 부모 기록 확인 | 같은 결과를 then 반환과 await로 연결 → 오류 경계 비교 |
| 한 장면 | settings의 on·volume·display.brightness와 설정 목록 | 안쪽 span이 있는 type=button 카드 버튼과 같은 목록의 안내 링크 | 기존 회원 목록·출석 조회 |
| 자신의 말로 설명할 문장 | 한쪽 변경이 어디까지 전달되는지와 원본 보존에 필요한 복사 범위를 설명합니다. | 누른 대상과 취소할 브라우저 동작을 구분합니다. | 다음 단계와 호출자에게 값·실패가 이어지는 경로를 설명합니다. |
| 대표 오개념 | const 불변·매개변수 재대입 전파·새 배열의 요소 복제·무조건 깊은 복사 | target=currentTarget·모든 이벤트의 버블링·취소와 전파 중단 혼동 | resolved=fulfilled·비동기 executor·then의 동일 Promise·return 누락·프로그램 전체 await 중단·호출 줄 try만으로 rejection 처리 |
| 기존 문항 재사용 | JSQ07·JSQ08·JSQ09·L12 | JSQ18·JSQ19·JSQ20·L23 | JSQ26·JSQ27·JSQ28·L24 |

독립성은 새 문제 수가 아니라 같은 장면 안에서 앞 판단의 결과를 다음 판단에 사용하는 E에서 확인합니다.
forms-state의 폼 상태 정책, async-state의 UI 상태, async-composition의 작업 의존성·all/race, event-loop의 실행 순서는 별도 질문이므로 합치지 않습니다.
다른 활성 문서도 설계가 확인한 질문·선수·목표를 유지합니다.
순서는 array-methods → object-sharing → scope-hoisting, dom-properties → forms-state → event-delegation → errors-input, debugging → async-await → async-state → async-composition → event-loop입니다.

## 검증 조건과 남은 작업

사용자는 통합 문서에서 세 목표의 답을 찾고 기존 문항과 문서를 왕복할 수 있어야 합니다.
보관 깊은 URL과 기존 완료 기록은 계속 열려야 합니다.
본문 작성자는 단일 장면과 필수 의미를 확인하며 독립 검증자는 누락이 있으면 해당 작성자에게 반환합니다.
현재 사용자 판단을 다시 받아야 할 미결정은 없습니다.

| 범위 | 완료에 필요한 근거 | 현재 상태 |
| --- | --- | --- |
| 내용·출처 | 세 목표·단일 장면·필수 의미·공식 자료·출처 계보·기존 async 보강 보존 | 독립 내용 PASS: 목표 9개·직접 문항 9개와 legacy 3개·공식 출처 확인 |
| metadata | 활성 30·보관 10·등록 40, 전체 활성 157, 고유 ID/slug/order·concept 선언·본문 경로 | 반영 완료, 관리 검사와 독립 내용 검증 완료, README 실수량 일치 |
| 발췌·앵커 | 지정 다섯 연결과 기존 네 연결, 실제 본문 일치·heading 유일성·한줄 요약 앵커 소비 | 독립 내용 PASS: 9개 발췌 일치, 연결 5행·발췌 8행 변경, 관련 한줄 요약 앵커 소비 없음 |
| 불변 범위 | runtime·기존 보관·새 보관 본문·그림·다른 과목·문항 객체·전체 문항 집합의 기준 비교 | 관리·독립 내용 검증 완료, 독립 실행 담당이 최종 입력 해시 대조 |
| 로컬 예제 | 객체 정체성·매개변수·중첩 경로, Promise 성공·실패·return 누락의 독립 사례 | 독립 Node 22체크 PASS, 미처리 rejection 반례를 별도 프로세스로 확인 |
| 브라우저 | span 클릭·동적 버튼·링크 이동 취소와 부모 기록·전파 중단 차이, 깊은 URL·문항 왕복·완료 기록 | 독립 Chrome DOM 정상·경계 PASS, 대표 앱 UI PASS |
| 문서 | README 숫자 세 곳의 최소 diff, 카드 계보·상태·링크 | README 최소 diff 독립 PASS 통보, 수량 대조와 카드 증거 갱신 완료, 최종 카드 검토 대기 |
| 통합 | 위 증거의 최종 diff 적합성 및 로컬 통합 판정 | 심사 중, 후속 통합 담당 보고서 참조 |

## 실제 검증과 증거 재사용

아래 보고서는 작업 저장소 상위 인계 폴더의 2026-10-02 증거입니다.
문서 작성자는 보고서와 최종 수량을 대조했으며 각 담당자의 실행을 자신이 재실행한 것으로 기록하지 않습니다.

| 증거 | 직접 수행한 범위와 결과 |
| --- | --- |
| `javascript-content-validation.txt` | 독립 내용 PASS입니다. 기준 6본문·최종 본문·문항 12개·공식 원문과 최종 JSON을 대조하고 `python3 /tmp/js-independent-content-audit.py`를 exit 0으로 실행했습니다. 목표 9개·발췌 9개·기존 async 보강과 보호 파일을 확인했습니다. |
| `javascript-metadata-report.txt` | JSON 2개를 지정 범위에 반영한 뒤 관리 검사와 `npm run validate:content`를 exit 0으로 실행했습니다. 전체 등록 교안 213개·객관식 382문항·Quest 32개·코딩테스트 90개·Web Project 1개와 본문 보존을 확인했습니다. |
| `javascript-test-author-report.txt` | `node --test tests/javascript-lesson-integration.test.js tests/js-java-concept-lessons.test.js` 8/8과 별도 `node --test tests/learning-catalog-view.test.js` 17/17로 작성자 focused 총 25/25를 확인했습니다. 이는 독립 실행 승인과 구분합니다. |
| `javascript-test-engineer-report.txt` | 독립 실행 PASS입니다. 관련 기존 회귀 10/10·교안과 추가 경계의 Node 22체크·실제 Chrome DOM 정상/경계를 직접 실행했습니다. 반환할 결함과 실행 blocker는 없습니다. |
| `javascript-ui-verification.txt` | 대표 데스크톱 Chrome 앱 UI PASS입니다. 목록 30/157, 보관 URL 3개, donor 완료 보존과 receiver 미복사, 기존 선택·채점·문제 왕복, 목표 3개씩·CTA 3/2/2, 그림 2개, 키보드 초점, JS 69문항 정순/랜덤 진입을 확인했습니다. |

독립 실행 환경은 macOS 14.8.3·Node v24.17.0·Chrome 150.0.7871.125입니다.
Node 22는 버전이 아니라 직접 실행한 체크 수입니다.
독립 focused 명령은 아래와 같습니다.

```sh
node --test --test-name-pattern='첫 묶음의 13문항|문서 대상은 원래|같은 언어의 language|개념 검증은|문서 복귀 토큰|모든 소유자의|명시한 직접답만|등록 학습문서마다|목차로 접힌 답|답변 열람은 저장하지' tests/review-concepts.test.js tests/review-navigation.test.js tests/lesson-answer.test.js
node javascript-engineer-evidence/node-checks.mjs
```

첫 명령은 저장소에서, 둘째 명령은 상위 인계 폴더에서 실행했습니다.
실제 객체 8블록과 비동기 11개 출력 블록, 미처리 rejection 반례 및 추가 경계 2묶음을 확인했습니다.
Promise 콘솔 표시와 타이머 완료 시각을 모든 환경의 고정 결과로 일반화하지 않습니다.

독립 Chrome DOM 검증은 별도 localhost:4188 하네스에서 원문 HTML·JS를 실행했습니다.
실제 span·동적 버튼·잘못된 ID·링크 취소·stopPropagation·stopImmediatePropagation·passive·contains 경계를 확인했습니다.
취소 불가능한 이벤트와 Text node 대상은 하네스가 생성한 synthetic event이며 trusted 클릭으로 표현하지 않습니다.
앱 UI는 별도 localhost:4187 검증 origin에서 확인했으며 기존 사용자 origin을 조작하지 않았습니다.
그림 두 개는 lazy load 후 각각 naturalWidth 1520으로 로드됐고 앱 error 로그는 빈 배열이었습니다.

독립 실행 담당자는 동일 입력 해시를 대조해 작성자 focused 25/25, 관리자의 `validate:content`, 독립 내용 PASS와 대표 앱 UI 증거를 재사용했습니다.
재사용 테스트의 기대값과 기준 digest도 독립 감사했으며 같은 검사를 반복 실행한 것으로 기록하지 않았습니다.
본문·JSON·관련 테스트 등 입력 54개의 SHA-256 대조는 `javascript-engineer-evidence/input-hashes.json`에 있습니다.
내용 검증의 파일·목표·발췌 상세 근거는 `javascript-content-validation-receipt.json`에 있습니다.

## 미실행 범위와 최종 인계

전체 npm test/check/build, 무관한 과목의 전체 suite, review-session suite, 9발췌 각각의 브라우저 왕복 전수는 실행하지 않았습니다.
9연결 전수는 구조·발췌 검증과 회귀를 사용했으며 UI 왕복은 대표 3개를 확인했습니다.
모바일·다른 브라우저·실제 서버 네트워크·기존 사용자 origin·개인 밤위키 최신 원본은 이번 검증 완료 범위가 아닙니다.
스크린샷은 도구 출력으로 확인했으며 로컬 이미지 파일 저장을 주장하지 않습니다.

현재 내용·실행 단계의 반환 결함과 교육적 미결정은 없습니다.
최종 통합 담당자는 문서 갱신 후 동결 해시와 최종 diff를 대조하고 로컬 통합 결과를 별도 보고합니다.
이 카드는 해당 판정을 앞서 선언하지 않습니다.
본문·JSON·제품 코드·테스트가 이후 변경되면 영향을 받는 증거부터 다시 검증합니다.
Git 게시·commit·push·PR·merge·배포는 수행하지 않았습니다.
