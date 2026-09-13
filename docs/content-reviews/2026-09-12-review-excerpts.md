# R1 개념 오버레이 원문 발췌 접수 — 2026-09-12

## 범위와 관리 상태

`[현재 사실]` `learning_document_manager`가 기존 승인·반입된 JavaScript 교안 3개의 본문에서 9개 개념의 짧은 발췌를 접수했다. [R1 작업 카드](../work-items/2026-09-12-independent-review-first-use.md)의 구현 승인 범위 안에서 기존 13문항의 관련 개념을 연결한다. 새 교안·문항·정답·해설·교육적 요약을 작성하거나 기존 교육 내용을 고치지 않았다.

관리 결과는 [review-concepts.json](../../content/review-concepts.json)이다. 관리자의 원문·ID·경로 자체 점검을 마쳤고 독립 `content_validator`·`test_engineer`·`project_integrator` 판정은 대기한다. 이 문서는 자료 접수 증거이며 콘텐츠 최종 승인·사용자 숙달·신규 화면 검증 PASS를 대신하지 않는다. 학습 지원 노출이라는 제품 행동의 경험 분류와 검증은 R1 작업 카드에서 다룬다.

최초 쓰기 범위는 이 접수 기록과 위 JSON 두 파일이다. 이후 총괄의 명시적 추가 배정에 따라 `curriculum.json`의 `javascript-notes` 과정 이름만 `내 JavaScript 학습 문서`에서 `JavaScript 학습문서`로 바꿨다. 독립 서비스 탐색명 정리이며 과정 ID·순서·본문·출처·다른 metadata는 보존한다. 교안 3개, 기존 JavaScript 문항, 밤위키 원본과 개인·강사 자산은 수정하지 않았다. 제품 JSON에는 개인 경로·활동·수업 귀속·비공개 기록을 포함하지 않는다.

## 접수 계약

구현 담당 `first_use_implementation`과 `{ schemaVersion: 1, concepts: [{ id, title, lessonId, heading, excerpt }] }` 계약을 합의했다.

- `id`는 기존 문항의 `conceptId`이며 `lessonId`와 curriculum의 실제 관계를 유지한다.
- `heading`은 `##` 표기를 제외한 원문 소제목이다. 실제 문서 절 이동은 기존 Markdown heading ID 계산 규칙을 재사용하는 구현 책임이다.
- `excerpt`는 해당 소제목 아래 원문에 실제 존재하는 연속 구간이다. Markdown의 줄바꿈·인라인 코드·표는 그대로 보존한다. 여러 구간을 이어 새 설명을 만들지 않았다.
- `title`은 원문 소제목을 그대로 사용한다. 다만 `js.control-flow`는 총괄의 명시적 허용에 따라 원문 키워드를 조합한 탐색용 이름 `조건문·반복문`을 사용한다. 조건 분기 소제목만 쓰면 연결된 반복문 문항에서도 분기만 열리는 것으로 오해할 수 있기 때문이다. 이는 교육 본문의 재작성이나 새 개념 ID가 아니다.
- `js.control-flow` 발췌는 원문 271행의 본문 문장이다. 목록 번호 `3. `만 발췌 범위에서 제외했으며 문장 자체는 원문의 정확한 부분 문자열이다. `heading`은 그 문장이 있는 `핵심 정리`다.

R1에서는 정적 발췌 9개만 접수한다. 모든 기존 개념의 사전 구축·복합 개념 문항·전체 과목 원문 반입·새 코드 예제 생성은 하지 않았다. 문자열이 원문과 같다는 관리 점검만으로 문항별 지원의 충분성이나 교육적 정확성을 승인하지 않는다.

## 원본과 반입 관계

직접 발췌 원본은 저장소의 기존 반입본이다. [2026-09-09 원문 접수·기여·공식 검증 기록](2026-09-09-local-review.md#원본과-가져오기)의 출처와 저작 기여 구분을 유지한다. 기존 `source.kind: user-authored`를 bam이 모든 문장·예제를 단독 저작했다는 주장으로 확대하지 않는다.

| lessonId | 직접 발췌 원본 | 원본 SHA-256 |
| --- | --- | --- |
| `js-notes-values` | [values.md](../../content/lessons/javascript-notes/values.md) | `f8e8830657878543ffae84334a3c33d270ec2453f486e6a77d2fafafabf4cdc5` |
| `js-notes-functions` | [functions.md](../../content/lessons/javascript-notes/functions.md) | `c9fa256cdd5b7e364477f0bae0ae9d0a3a750a37dc59f7f511b0c822219683f0` |
| `js-notes-collections` | [collections.md](../../content/lessons/javascript-notes/collections.md) | `9186ad12699f3ac69f0231b18ab08627513f2cabe435d8a13757825bea8dd082` |

밤위키의 현재 자료 위치는 Vault 상대 `밤위키/wiki/학습자료/밤데브 학습문서/03 JavaScript/`의 `01 값과 실행 흐름.md`, `02 함수.md`, `03 배열과 객체.md`다. 세 원본을 읽기 전용으로 대조했으며 현재 위키 파일에는 `문서 유형`·`개념`을 담은 YAML 네 줄만 앞에 추가되어 있다. 교육 본문은 위 저장소 반입본과 같다. 기존 반입 경로·해시를 현재 위키 해시로 덮어쓰지 않았다.

| 현재 위키 파일 | 현재 SHA-256 |
| --- | --- |
| `01 값과 실행 흐름.md` | `39fdbd7cd80c55d751f45982bda0e935dae416d55cdad0022d55013de2e84a80` |
| `02 함수.md` | `2d8f8af7238851f1729099f7eab1229a8bd4dc4da576a6efe6daedf1ba953d70` |
| `03 배열과 객체.md` | `bf4e5809e5b8f39af9791d1e40aca9577276b1e717db877c7d18ec5d9228624e` |

기존 공식 출처·기술 검증은 2026-09-09 기록의 날짜와 범위로만 인계한다. 이번 원문 접수에서 외부 공식 문서를 새로 대조하거나 전체 JavaScript 교육적 정확성을 재검증했다고 기록하지 않는다.

## 발췌 범위와 기존 문항 연결

행 번호는 위 SHA의 저장소 원본 기준이다. 문항 접미사는 기존 `quiz-javascript-notes-` 뒤의 문자열이며 실제 문항 ID를 바꾸지 않는다.

| conceptId | lessonId | 실제 heading | 원문 발췌 행 | 연결 문항 접미사 |
| --- | --- | --- | --- | --- |
| `js.variables` | `js-notes-values` | 값을 기억하는 이름: 변수 | 86–87 | `const-property` |
| `js.operators` | `js-notes-values` | 값을 계산하고 비교하는 연산자 | 121–122 | `string-addition` |
| `js.control-flow` | `js-notes-values` | 핵심 정리 | 271, 목록 번호 제외 | `switch-break`, `loop-boundary` |
| `js.function-return` | `js-notes-functions` | 반환값은 호출한 곳으로 돌아간다 | 72–73 | `return-value`, `early-return`, `arrow-block-return` |
| `js.callbacks` | `js-notes-functions` | 함수도 값이다 | 151–152 | `sync-callback` |
| `js.function-side-effects` | `js-notes-functions` | 계산만 하는 함수와 바깥을 바꾸는 함수 | 227–230 | `function-boundary` |
| `js.array-methods` | `js-notes-collections` | `map`, `filter`, `find`는 목적이 다르다 | 207–213 | `filter-map`, `find-missing` |
| `js.object-sharing` | `js-notes-collections` | 원본을 바꾸는 동작과 새 값을 만드는 동작 | 237–241 | `filter-shared-object` |
| `js.iteration` | `js-notes-collections` | 배열을 차례대로 읽기 | 79–81 | `for-in-keys` |

원문에서 문장을 찾지 못해 임의로 보충한 항목은 없다. 발췌는 짧은 개념 확인이며 모든 연결 문항의 세부 규칙을 요약하는 새로운 교안이 아니다. 조기 반환·화살표 본문·순회 경계 등 더 자세한 내용은 원래 문서로 연결한다. 독립 검토에서 발췌 범위의 부족·오해 가능성을 발견하면 자료 관리 범위와 교육 내용 보완을 구분해 반환한다.

## 관리자의 focused 점검과 다음 인계

- 명령: `python3 /private/tmp/bam-review-excerpt-check-20260912.py > /private/tmp/bam-review-excerpt-check-20260912.log`, 종료 코드 0. 임시 스크립트와 로그는 재현용 관리 증거이며 제품에 포함하지 않는다.
- JSON 최상위·개념 필드, 문자열 값, 중복 없는 9개 ID, 기존 13문항과의 누락 없는 관계, curriculum의 lesson/concept 연결을 대조했다.
- 9개 발췌가 선언한 원문 heading 아래 실제 연속 부분 문자열임을 확인했다. 코드 fence·개인 경로가 없고, 짧은 본문·표를 임의 재작성하지 않았다.
- R1 baseline `/private/tmp/bam-first-use-baseline-20260912-_9oxxfa2/project`와 교안 3개·JavaScript 객관식 파일의 바이트가 같음을 확인했다. curriculum은 승인된 과정 이름 한 줄 변경 외 모든 바이트가 같다. 위키 원본 세 개의 차이도 YAML 네 줄 추가뿐임을 다시 대조했다.
- 제품 JSON SHA-256: `f74306e33668b2b1919107b92d3eef44ed6e79e9d47e63dad5f5120f235e068e`.
- 실행 코드의 신규 결과 검증은 N/A다. 실행 코드 발췌·문항 변경이 없으며 기존 코드 결과를 새로 실행한 것처럼 기록하지 않았다. 전체 `npm run check`·실제 브라우저 smoke는 이 관리자가 실행하지 않았다.
- 다음 단계: 작성자와 분리된 `content_validator`가 원문 범위·허용 출처·발췌 충분성·기존 문항과의 의미 연결을 읽기 전용으로 확인한다. 이후 `test_engineer`가 JSON·렌더링·문서 절·복귀 흐름을 확인하고 `project_integrator`가 통합된 최종 상태를 검증한다. 이 관리자는 자신의 산출물을 최종 승인하지 않는다.
