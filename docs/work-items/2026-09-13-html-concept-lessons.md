# HTML 개념 문서 전환 — 2026-09-13

## 작업 범위와 상태

- 작업 ID: `2026-09-13-html-concept-lessons`. 유형 **학습 콘텐츠 포함 기능**. 원문 기반 개념 문서와 직접 자기 확인을 추가하므로 경험 카드 전체를 검토한다. 기존 문항·실습은 유지보수 변경조차 하지 않는다.
- 승인: [`DEC-HTML-CONCEPT-LESSONS-01`](../roadmap.md#2026-09-13-확정-제품-결정). HTML부터 나누되 함께 이해할 내용은 유지한다는 최신 요청과 밤위키 학습자료 사용 요청이다. 별도 저작 재승인을 대기하지 않으며 다른 과목이나 전역 저작 권한으로 확대하지 않는다.
- 정본: [읽기·복귀 계약](../designs/lesson-review.md#html-개념-문서-전환), [데이터 계약](../content-schema.md#html-파생-교안의-전환-계약), [작은 파생 교안의 작성 경계](../lesson-authoring.md#승인된-html-파생-교안의-작은-단위).
- `[현재 사실]` 고정한 15개 파생 문서와 metadata·개념 매핑·제품·테스트를 반영했다. 초기 문서 검토, 독립 콘텐츠·실행·UI 검증과 수정 후 통합 gate·정적 빌드·보존 검사를 통과했다. 통합 1차의 실패와 보완도 아래에 유지한다. 현재 수량은 프로젝트 [README](../../README.md)에 구분하며 CSS 및 다른 과목 분할은 이번 범위 밖이다.

## 원본과 파생 경계

원본 루트는 **밤위키**이며 `source.originalPath`는 아래 `wiki/학습자료/밤데브 학습문서/01 HTML/` 뒤에 파일명을 붙인다. 사용자명 포함 절대 경로를 제품 데이터에 기록하지 않는다. 다음 해시는 2026-09-13 조사한 원본 파일 전체 바이트다.

| 원본 파일 | SHA-256 |
| --- | --- |
| 01 문서 구조와 의미.md | `f82cc33b90ac57d16f8bd76b7d024c462ff973620a195ba9aa0e438e257055f9` |
| 02 정보 관계에 맞는 요소.md | `ab88bd66727dfe62cadc8ca613fab58eb08a6f571bd4fcfcdbe16e9160d1ee77` |
| 03 HTML 폼으로 정보 입력받기.md | `1bbee578ebc10fe115b859c4a79bf54c8b08c5e0aa891ea4243831205d79f058` |
| 04 검사와 수정.md | `8e1415fe8663f5076e2322dd7ac1a0c18e8c738676eef761705e2de7c5831d06` |
| 05 HTML 개념 종합.md | `2bcdc48e97d744a585203cf6cdbf2f3574286440a84de29238aa67f9675c68db` |

보조 입력은 같은 폴더의 `HTML 출처와 교정 기록.md`와 `HTML 학습 안내 페이지.md`다. 원문 기여 귀속은 **AI 집필·밤 승인(2026-09-02)**이다. metadata의 `source.kind: user-authored`는 기존 반입 분류를 사용한 것이며 밤이 문장을 직접 집필했다는 뜻으로 해석하지 않는다. 교정 기록은 2026-09-02 공식 확인·승인과 정상 HTML 21예제의 과거 Checker 검사를 기록한다. 이번 실행 결과가 아니며 폼 제출·미디어 재생과 실제 초보 학습자의 이해는 당시에도 미검증이었다. 기존 제품 HTML 5교안은 해당 원문의 반입본이 아니므로 출처를 바꾸거나 위키 원문으로 대체하지 않는다.

새 문서는 `source.importMode: derived`로 표기한다. 원문 개념·예제·18개 교정 경계를 유지하고, 단위별 목표·요약·핵심 질문·직접답과 탐색 링크를 재구성한다. frontmatter, Obsidian 링크와 관리·승인 안내는 제품에 그대로 옮기지 않는다. 원문 코드 23블록의 내용과 설명 목적을 매핑으로 확인하며 의도적인 오류/수정 쌍을 정상 예제로 바꾸지 않는다. 외부 공식 자료와 원문 기록의 과거 검증은 이번 독립 검증과 구분한다.

독립 콘텐츠 검토에서 링크 문항의 선수인 `../` 상대 경로 설명 누락 1건을 반환했다. `wiki-links-buttons.md`에 별도 base가 없다는 전제, 상위 디렉터리 해석과 문항 정답을 복제하지 않는 도움말 예제를 [MDN 근거](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#parent-directory_relative)로 보완했고 재검토에서 해결됐다. 이는 이번 파생 보완이며 원문 해시·기존 문항은 바꾸지 않았다.

## 고정한 읽기 단위와 연결

아래 키마다 `id: html-notes-<키>`, `slug: wiki-<키>`, `contentFile: content/lessons/html/wiki-<키>.md`, `courseId/languageId: html`, `answerHeading: 핵심 질문 답`을 사용한다. `order`는 표 순서대로 6~20이며 화면에는 활성 문서의 1~15번째 위치로 보인다. 단위별 학습 능력·요약·질문·직접답의 정본은 새 metadata와 Markdown이고 이 표에 교육 문장을 중복 보관하지 않는다. 번호로 표시한 원문은 위 파일명의 01~05다.

| 읽기 순서·키 | 제목·함께 둘 범위 | 원문 본문 줄 | 먼저 읽을 키 | 연결할 기존 문항 ID |
| --- | --- | --- | --- | --- |
| 1. `markup` | HTML의 역할과 요소 읽기. 태그·요소·속성은 같은 한 줄을 함께 읽어야 구분할 수 있으므로 각각을 별도 문서로 나누지 않는다. | 01:16–31, 01:32–53 | 없음 | 직접 연결 없음 |
| 2. `document-skeleton` | HTML 문서의 기본 골격. 골격 코드는 한 세트로 읽어야 본문과 메타 정보의 차이가 드러난다. 설정별로 쪼개지 않는다. | 01:54–90 | `markup` | 직접 연결 없음 |
| 3. `semantic-structure` | 내용의 역할과 제목으로 문서 나누기. section/article/div와 제목은 같은 요구사항의 구조를 판단하는 비교 단위다. 태그별 분할을 피하고 원문의 완성 골격 예제를 함께 둔다. | 01:91–124, 01:125–143, 01:144–159, 01:160–212 | `document-skeleton` | `quiz-html-semantic-main` |
| 4. `links-buttons` | 링크와 버튼, 이동할 주소. a/href와 URL·목적 문구는 하나의 이동을 성립시키는 관계이고 button과의 비교가 선택 단서다. | 02:16–28, 02:29–63 | `markup`, `semantic-structure` | `quiz-html-link-destination` |
| 5. `image-alternatives` | 이미지의 목적과 대체 텍스트. 정보/기능/장식과 alt/figcaption 비교를 분리하면 같은 이미지에서의 선택 기준이 사라지므로 함께 둔다. | 02:16–28, 02:64–103 | `markup`, `links-buttons` | `quiz-html-alt-context` |
| 6. `lists` | 항목의 관계에 맞는 목록. ul/ol/dl은 서로 비교해야 올바르게 선택할 수 있어 목록 종류별로 나누지 않는다. | 02:16–28, 02:104–147 | `markup` | `quiz-html-list-order` |
| 7. `tables` | 행과 열의 관계를 나타내는 표. 표와 caption/머리글 관계는 하나의 데이터 구조이며 각각 나눌 이유가 없다. | 02:16–28, 02:148–188 | `lists` | `quiz-html-table-header-scope` |
| 8. `media-alternatives` | 미디어의 재생과 대체 정보. 오디오/비디오의 공통 선택은 시간 기반 정보의 접근이다. 자막·대본·대체 문구를 비교하는 한 단위로 유지한다. | 02:16–28, 02:189–215 | `links-buttons`, `image-alternatives` | 직접 연결 없음 |
| 9. `input-names` | 입력의 레이블과 제출 이름. label/for/id/name/value는 혼동을 바로잡기 위해 함께 비교해야 하는 한 입력의 관계다. 속성별 분할 금지. | 03:15–28, 03:29–58 | `markup` | `quiz-html-form-name-submission`, `quiz-html-label-association` |
| 10. `form-controls` | 받을 값과 선택 관계에 맞는 입력. 타입 선택과 radio/checkbox 그룹은 받을 데이터와 선택 개수라는 공통 판단이다. input 타입별로 쪼개지 않는다. | 03:59–78, 03:79–105 | `input-names` | 직접 연결 없음 |
| 11. `constraint-validation` | 내장 검증의 역할과 한계. 검증 속성별 나열보다 적용되는 값과 보장하지 않는 경계를 비교하는 하나의 판단을 유지한다. | 03:106–127 | `input-names`, `form-controls` | `quiz-html-validation-boundary` |
| 12. `form-submission` | 제출되는 값과 보내는 방식. 어떤 값이 제출에 참여하고 어떤 방식으로 보내지는지 한 흐름으로 읽는다. disabled/readonly 및 GET/POST 비교는 각각 분리하지 않는다. | 03:15–28, 03:200–210, 03:211–227 | `input-names`, `form-controls` | 직접 연결 없음 |
| 13. `form-flow` | 신청 폼을 끝까지 읽고 조작하기. 원문의 작은 완성 폼은 관계를 연결하는 E 복습 예제다. 줄 수를 줄이려고 코드를 조각내지 않고 앞의 짧은 개념 문서를 이은 가까운 복습으로 분리한다. | 03:128–199, 03:228–243 | `input-names`, `form-controls`, `constraint-validation`, `form-submission` | 직접 연결 없음 |
| 14. `inspection` | 검사 결과를 구분하고 수정하기. 문법/의미/접근성은 비교해야 검사 방법을 고를 수 있고 오류/수정본도 한 쌍이어야 한다. 이번 문서는 억지로 더 나누지 않는다. | 04:16–29, 04:30–49, 04:50–64, 04:65–123, 04:124–158, 04:159–175 | `semantic-structure`, `links-buttons`, `image-alternatives`, `tables`, `form-flow` | `quiz-html-checker-purpose` |
| 15. `integration` | HTML 개념을 요구사항에 연결하기. 원문 05의 목적 자체가 여러 개념의 연결·복습이므로 종합 문서를 그대로 하나의 흐름으로 유지한다. | 05:15–29, 05:30–54, 05:55–125, 05:126–151, 05:152–160 | `inspection` | `quiz-html-profile-structure-audit` |

원문별 선두 목표·한줄 요약과 하단 핵심 정리·실습 포인트·공식 자료는 그 원문에서 파생한 모든 단위의 재구성 근거로 함께 검토한다. 02장의 요소 선택표는 해당 관계만 각 단위에서 사용하고 종합 문서에 전체 관계를 연결한다. 04의 검사·수정과 05의 종합 문서는 각각 비교/연결 목적을 유지하며 더 나누지 않는다.

기존 HTML 객관식 12개 중 위 10개만 새 문서 직접 매핑이다. DOM 중첩과 `strong`/`em` 문항 2개는 원래 교안에 남긴다. 새 원문이 그 판단을 충분히 다루지 않는데도 연결을 만들어 범위를 위장하지 않는다. 문항 없는 문서에는 관련 문제 준비 중을 안내한다. 기존 Quest 5개는 기존 ID·revision·소유 교안과 공개 계약을 유지한 가까운 실습이며 새 문제나 새 T가 아니다. Web Project는 기존 교안 연결과 CSS 선수 범위를 유지한다.

## 경험 카드와 교안 보충 근거

경험 ID는 `HTML-CONCEPT-LESSONS-20260913`이다. 다음은 매핑 작성자가 제시하고 총괄이 원문과 대조한 **설계 근거**다. 독립 콘텐츠 검증에서 실제 기존/신규 내용과 대조해 카드 범위를 확인했으며, 실제 사용자의 학습 성과 PASS를 뜻하지 않는다. 문서 분할 자체는 새 경험의 근거로 세지 않는다.

| 항목 | 이 묶음의 근거 |
| --- | --- |
| 대상·MVP 이유 | 위 15개 ID. 기존 긴 문서 대신 승인된 위키 교안을 개념 단위로 읽고 그 질문에 직접 답할 수 있게 한다. |
| 선수·연결 교안 | 위 선수 키 표와 실제 기존 실습. CSS·JavaScript·서버 구현은 선수라고 암묵적으로 추가하지 않는다. |
| 발견할 단서 | 원하는 결과, 정보 사이의 관계, 레이블/제출 이름, 편집·제출·검증 참여 여부, 도구가 판단할 수 있는 규칙과 사람의 맥락 판단. |
| 새 A | 이름-설명 관계에 `dl/dt/dd`를 선택하고, 시간 기반 미디어에서 재생 기능과 별도로 자막·대본·대체 정보를 판단한다. 기존 제품에서의 부족한 범위와 원문 근거를 독립 검증한다. |
| 재사용 A | 역할에 맞는 요소, 링크/버튼, 순서 있는/없는 목록, 레이블과 제출 이름, 브라우저와 서버 검증의 경계를 구분한다. |
| 새 E | 짧은 입력 문서 뒤에서 목적→레이블→제출 이름→검증 안내→제출→키보드 확인의 원문 폼 흐름을 연결한다. 지원이 있는 복습이며 전이 성과를 주장하지 않는다. |
| 의미 있는 C | 이름-설명/순서 목록, 정보/기능/장식 이미지, 수량/숫자처럼 보이는 식별자, `disabled`/`readonly`, `required` 유무가 선택 구조·제출/검증 여부를 바꾼다. |
| T | 새 무힌트 전이 문제는 만들지 않는다. 기존 Quest 계약을 유지하고 안내가 있는 예제를 T로 바꾸어 세지 않는다. |
| 사다리·지원 | L0 관찰과 L1 이유·자기 설명, 폼/종합의 지원 있는 조합 복습. 필요하면 기존 가까운 실습으로 이동한다. 원문 전체 예제는 예제이며 미공개 Quest의 정답이라고 표시하지 않는다. |
| 자신의 말로 설명 | 어떤 요구나 조건 때문에 요소/속성을 선택했고 무엇까지 보장하지 않는지 설명한다. 각 문서는 그 범위에 맞는 질문과 직접답을 갖는다. |
| 독립성 비교 | 맥락은 승인 원문의 책모임/지역 행사, 목표는 문서별 직접 자기 확인, 입출력은 요구→관계→HTML, 조건은 위 C, 순서는 집중 개념 뒤 폼/종합 연결, 지원은 생각한 뒤 수동 답 보기다. 소재 변경이나 문서 개수는 추가 근거가 아니다. |
| 대표 오개념 | 시맨틱 요소만으로 접근성 완성, `/help`가 완전한 절대 URL, `name`이 접근 가능한 이름, `minlength/pattern`만으로 빈 값 금지, POST 암호화, ARIA 역할만으로 키보드 동작 생성. |
| 공개 사례·검증 | 원문 구간·코드·의도적 오류/수정 쌍, 18개 교정 경계, 목표와 직접답, 실제 10개 문항 연결. 콘텐츠/실행/통합 검증은 각각 독립 역할이 수행한다. |
| 출처·날짜 | 위 원문 전체 SHA와 2026-09-13 조사. 원문이 인용한 WHATWG·W3C·Nu Checker 자료를 독립 확인하며 원문의 2026-09-02 기록을 이번 검사로 표현하지 않는다. |
| 사람 판단 | 최신 분할·필요시 유지와 원문 기반 재구성 요청은 승인됨. 실제 사용자의 이해·전이 성과는 미확인이고, 정확성 결함은 작성 단계로 반환한다. |

교안 보충 카드의 ID·과정·순서·제목·질문·선수·목표·개념은 이 표와 신규 콘텐츠를 대조한다. 최소 예제·실수·다음 실습·출처는 각 원문 구간을 유지하고 11개 제목을 채우기 위한 분량 추가 없이 의미를 통합한다. 새 개념 후보 `html.media-accessibility`, `html.form-control-states`는 실제 해당 문서에 선언하고 문항이 없는 사실을 유지한다. HTML은 정적 코드 예제로 표시하며 가상 action·미디어 경로에 실제 제출·재생을 하지 않는다.

## 역할별 경로와 순서

| 역할·담당 | 쓰기 경로 또는 읽기 전용 책임 |
| --- | --- |
| 총괄 `/root` | 읽기 전용. 실제 원문·코드·매핑·diff·증거 대조와 GO/반환. |
| 제품·설계 문서 `/root/html_split_design` | `docs/designs/lesson-review.md`, `docs/content-schema.md`, `docs/lesson-authoring.md`, `docs/roadmap.md`, `docs/README.md`, 이 카드, `docs/learning-content-design.md` 등록부 1행. 검증 후 프로젝트 `README.md` 실제 수량 안내만 갱신 가능. |
| 원문 기반 콘텐츠 `/root/bam_reference_mockup` | `content/curriculum.json`, `content/review-concepts.json`, 위 신규 `content/lessons/html/wiki-*.md` 15개만. 기존 5 metadata에는 `archivedFromCatalog: true`만 추가. |
| 제품 구현 `/root/first_use_test_engineer` | `src/core/content.js`, `src/core/review-navigation.js`, `src/ui/learning-catalog-view.js`, `src/app.js`, `scripts/validate-content.mjs`, `content/schema/curriculum.schema.json`. 이름과 달리 이 묶음의 역할은 제품 작성이며 독립 검증을 겸하지 않는다. |
| 테스트 작성 `/root/html_split_test_writer` | `tests/content.test.js`, `tests/review-concepts.test.js`, `tests/learning-catalog-view.test.js`, `tests/lesson-answer.test.js`, `tests/app-independent-review.test.js`. 통합 1차에서 반환된 기존 수량 전제 보완에는 `tests/extension-content.test.js` 소유를 추가했다. 제품·콘텐츠와 분리된 요구 기반 기대값. |
| 초기 문서 검토·독립 콘텐츠 `/root/html_content_validator` | 읽기 전용. 초기 7문서·원문·매핑과 최종 교육 내용·출처·카드·문항 연결을 확인한다. |
| 독립 실행·UI `/root/html_test_engineer` | 읽기 전용. 콘텐츠 PASS 뒤 요구 기반 테스트와 실제 브라우저·키보드·좁은 화면을 확인한다. |
| 독립 통합 `/root/html_integrator` | 읽기 전용. 앞 두 검증과 분리하여 전체 diff·보존·최종 전체 gate 증거를 확인한다. |

문서 계약과 매핑을 총괄이 실제 확인한 뒤 서로 겹치지 않는 콘텐츠·제품·테스트 경로를 작성한다. 같은 파일의 수정 요청은 현재 담당에게 돌리고 diff 인계 후에만 소유를 바꾼다. 기존 HTML 본문, 다른 과목 전체, 객관식·Quest·Web Project JSON, 밤위키 원본/설정, mockup·색상, 패키지·의존성·Git·원본 `dist`는 변경 금지다. Git 쓰기·commit·PR·merge·배포 단계는 없다.

## 완료 기준과 검증 상태

1. 원문 5개에서 고정한 단위별 범위·선수·예제·교정 경계가 보존되고 목표/요약/질문/직접답이 맞는다. 출처는 실제 원본 상대 경로·전체 SHA·derived 경계를 기록한다.
2. HTML 기본 목록에는 새 활성 문서를, 기존 깊은 URL에는 원래 문서를 보여 준다. 활성/보관 번호·이전다음이 섞이지 않고 기존 완료를 새 ID에 복사하지 않는다.
3. 실제 10개 문항 연결과 2개 레거시 연결을 보존하며, 없는 문항은 준비 중으로 안내한다. 새 문서·기존 문서의 token 검증, 선택·채점·해설·복귀·새로고침과 시도 서명을 보존한다.
4. 핵심 답 보기와 수동 완료/해제를 분리한다. 실제 heading과 접힌 답의 section 이동, 키보드 focus, 320px 읽기·복귀·저장 실패 안내를 확인한다. HTML 예제는 텍스트로 표시하고 정적 로컬 자산을 사용한다.
5. 작성자는 영향받는 focused 검사만 수행한다. `content_validator` PASS 뒤 `test_engineer`가 관련 단위 검사와 실제 브라우저를 확인하며, 두 PASS 뒤 `project_integrator`가 원본 `dist`·Git·금지 콘텐츠를 보존하는 `/private/tmp` 복제본에서 전체 `npm run check`를 수행한다. 환경·정확한 명령·실제 수·미실행 범위를 기록한다.

| 단계 | 담당·판정 | 증거 |
| --- | --- | --- |
| 설계·매핑 | 총괄 매핑 확인·초기 독립 문서 PASS | 초기 7문서의 로컬 링크·앵커 174개 오류 0, 원문 해시·15단위·예제·교정 경계 확인. 임시 증거 `/private/tmp/bam-html-design-review.json`. 이후 상태 정리 diff는 최종 통합에서 별도 대조. |
| 콘텐츠·제품·테스트 작성 | 반영·작성자 focused 통과 | Node v24.17.0에서 `node --test tests/content.test.js tests/review-concepts.test.js tests/learning-catalog-view.test.js tests/lesson-answer.test.js tests/app-independent-review.test.js`: 61개 통과·실패 0. 임시 인계 `/private/tmp/bam-html-split-tests-handoff.json`과 실행 로그 `/private/tmp/bam-html-split-tests-focused.log`. 작성자 검사이며 독립 실행 PASS와 구분. |
| 독립 콘텐츠 검증 | `/root/html_content_validator` PASS | 15문서의 목표·요약·질문·직접답, 원문 7파일 SHA·23코드블록·18교정 경계, 45내부 링크·10개 직접 매핑과 기존 자료 불변 확인. `python3 /private/tmp/bam-html-content-static-review.py`: 정적 검사 291건·실패 0. `../` 선수 누락은 보완 후 해결. 임시 증거 `/private/tmp/bam-html-content-validation.json`·`/private/tmp/bam-html-content-static-review.json`. |
| 독립 실행·브라우저 검증 | `/root/html_test_engineer` PASS | 위 focused 명령 독립 재실행 61/61 및 `node scripts/validate-content.mjs` 통과. macOS 14.8.3·Node v24.17.0·Chrome의 격리 origin `127.0.0.1:4199`, 1920×1080/320×740에서 신규/기존 문서 왕복·선택/채점/펼침·초점/스크롤(823→823) 복구, 직접답과 수동 완료, 키보드·로컬 표/코드 스크롤, 미연결/위조 token 안내 확인. 콘솔 경고·오류 0. 임시 증거 `/private/tmp/bam-html-test-engineer.json`·`/private/tmp/bam-html-test-engineer-focused.log`. 실제 브라우저는 대표 문서·DOM 레거시 사례이며 15개 공통 흐름과 두 레거시 매핑은 focused 검사로 보완. 사용자 `localhost:4189` 기록은 미접촉. |
| 통합 1차 | `/root/html_integrator` FAIL·테스트 작성 단계 반환 | 안전한 복제본 `/private/tmp/bam-html-integration-5kjt_ut5/source`의 `npm run check`: 618개 중 617통과·1실패, 테스트 실패로 빌드 미실행. `tests/extension-content.test.js:35`가 전체 HTML을 기존 5교안으로 가정해 실제 20과 불일치했다. 원본 `dist`·Git 불변. 임시 증거 `/private/tmp/bam-html-integration-first-failure.json`. |
| 반환 테스트 재검증 | `/root/html_test_engineer` PASS | `tests/extension-content.test.js`의 기존 5·파생 15 계약 수정만 재감사하고 `node --test tests/extension-content.test.js` 독립 실행 5/5 통과. 기존 검사 강도를 낮추지 않았고 제품·콘텐츠는 변경하지 않았다. 임시 증거 `/private/tmp/bam-html-test-engineer-extension-addendum.json`. |
| 통합 수정 후 | `/root/html_integrator` 전체 gate·빌드·보존 PASS | `/private/tmp/bam-html-integration-final-2ddy_q_c/source`에서 수정한 최종 상태의 `npm run check`를 1회 실행(전체 작업의 2차 시도), exit 0. 콘텐츠 검사 후 테스트 618/618 통과·실패/건너뜀 0과 정적 빌드 완료. 같은 임시 폴더의 `full-check.log`·`full-check-result.json`에 실제 명령과 결과 기록. |
| 정적 산출물·변경 범위 | `/root/html_integrator` PASS | 정적 자산 106개가 소스 SHA와 일치하고 localhost HTTP GET 106/106 성공, 임시 서버 종료. 승인 37파일(콘텐츠 17·제품 6·테스트 6·문서 8)만 변경: 기존 21변경·16추가·누락 0. 실행 중 소스 211파일 불변, 원본 `dist` 82파일·Git 1,538파일·밤위키 54파일 불변. 같은 임시 폴더의 `build-smoke.json`·`integrity-before-doc-closure.json`이 증거이며 HTTP 검사를 실제 UI 검사로 대신하지 않는다. |

위 `/private/tmp` 경로는 이번 작업의 임시 실행·검토 증거이며 영구 배포 자산이 아니다. 이 카드에 실제 범위·명령·판정을 요약하며 원시 로그를 다른 정본에 복사하지 않는다. 마지막 상태·증거 문서 diff는 통합 담당에게 인계하며 코드·콘텐츠·테스트와 정적 산출물은 바꾸지 않았다. 실제 학습자 이해, 무힌트 전이 성과, 폼 서버 전송·미디어 재생, 설치 앱·전과목 정비·Git/CI는 이 작업의 PASS 주장이 아니다.
