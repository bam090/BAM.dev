# CSS 개념 문서 전환 — 2026-09-13

## 작업 범위와 상태

- 작업 ID: `2026-09-13-css-concept-lessons`. 유형은 **학습 콘텐츠 변경**이다. 승인된 밤위키 원문을 의미 단위로 재편하고 목표·요약·핵심 질문·직접답과 실제 객관식 연결을 함께 맞춘다.
- 승인: [`DEC-CSS-CONCEPT-LESSONS-01`](../roadmap.md#2026-09-13-확정-제품-결정). bam의 “css문서도 분리 ㄱㄱ”와 앞선 필요한 경우에만 분할·원문 사용·질문/직접답/문제 연결 동시 조정 요청이다. 이번 CSS 파생 범위의 명시적 교육 내용 재구성 승인이고 전역 저작 권한은 바꾸지 않는다.
- 정본: [읽기·왕복](../designs/lesson-review.md#css-개념-문서-전환), [안정 ID·파생 출처](../content-schema.md#css-파생-교안의-전환-계약), [작은 교안 작성 경계](../lesson-authoring.md#승인된-css-파생-교안의-작은-단위).
- `[현재 사실]` 기존 제품 CSS 6교안과 밤위키 CSS 승인 원문 7개는 다른 자료다. 원문 매핑 20단위와 12개념 연결을 총괄이 확인했고 아래 계약을 고정했다. 새 본문 20개와 metadata·개념 연결을 반영하고 관리 콘텐츠 검사를 통과했다. 독립 콘텐츠·문서 검토와 focused/대표 데스크톱 검증은 통과했다. 최초 통합 gate에서 반환한 기존 테스트 기대값 2건을 보완했고 수정 상태의 최종 gate·정적 빌드·보존 검사를 통과했다. 예제 계산 실행의 한계는 아래에 구분한다. 현재 수량은 프로젝트 [README](../../README.md)에 요약한다. Git 게시·병합·배포는 이번 작업에 없다.

## 원본·단위·연결의 고정

밤위키의 `wiki/학습자료/밤데브 학습문서/02 CSS/` 아래 다음 원문을 2026-09-13 확인했다. 해시는 파일 전체 바이트이며 `source.sha256`은 파생본 해시가 아니다. 번호 원문 7개 외에 안내·교정 기록 2개도 읽었다. 교정 기록의 2026-09-02 공식 확인·2026-09-03 승인 이력은 이번 콘텐츠 검증 결과가 아니다. 기록의 `frontmatter 없음`과 달리 현재 원본에는 frontmatter가 있으며 이를 제품에 그대로 반입하지 않는다.

| 키 | 원본 파일 | SHA-256 |
| --- | --- | --- |
| W01 | 01 CSS란 무엇인가.md | `a0602272210ea778a7b02a197b6b6acb273f064f55b90ad75042503c54e02df1` |
| W02 | 02 값과 표현.md | `a8f1a1cf892c1745624664199bdd25485a084eecbcf4ea74f17a53171edec375` |
| W03 | 03 박스와 일반 흐름.md | `fab9b2908fd2408e68b78a329e5f92e688d8f76490492acecfe5950f5c7a4d3d` |
| W04 | 04 Flexbox와 Grid.md | `dcf11789e0367dbda3850d3fa024f62daadeded30c5ef95ae751a53b4c56f1ed` |
| W05 | 05 position 속성과 요소가 겹치는 순서.md | `796ed33afa8efc1160a195bbdc70d77915485cef81be6d07f2d89425d70e6247` |
| W06 | 06 반응형 상태와 모션.md | `a14b6e4a93cf9ecc50c0069a652649173f918826f803985e95046d9a9e757d3b` |
| W07 | 07 CSS 레이아웃 판단 정리.md | `053d5e847c2c418dbf84e78fca5d1b8f7f6770dbabc17d99e01aeea124179626` |
| 보조 | CSS 출처와 교정 기록.md | `3d35e4f4519ae86363d682a765139ccae1f3ed18e4be75c1aa5497edbb2b4a2b` |
| 보조 | CSS 학습 안내 페이지.md | `cd1ed2c9f5ee782e6a71a0fa6cc92dc3b03f4005a1bf8fcccffa408ebe2a358e` |

기존 제품의 보완 근거는 `content/lessons/css/` 아래 P1 `css-rules-selectors-values.md`, P2 `cascade-and-box-model.md`, P3 `flow-display-and-overflow.md`, P4 `position-flex-and-grid.md`, P5 `responsive-states-and-motion.md`, P6 `review-and-practice.md`다. 위키에 없는 선택자 대비·계산·넘침·모션/상태·도구 조합의 선수 설명은 이 계보를 함께 남긴다. 원문·기존 제품 본문은 보존하고 새 파일만 `derived`로 기록한다.

각 단위의 `courseId/languageId`는 `css`, `id`는 `css-notes-<키>`, `slug`는 `wiki-<키>`, `contentFile`은 `content/lessons/css/wiki-<키>.md`, `answerHeading`은 `핵심 질문 답`이다. 기존 6 metadata에는 `archivedFromCatalog: true`만 추가한다.

총괄이 원문·스키마와 대조한 다음 20단위를 고정했다. 순서에 6을 더한 값이 내부 `order: 7~26`이며 화면 읽기 위치는 활성 묶음의 1~20이다. 각 단위의 최종 목표·요약·질문·직접답은 metadata·Markdown이 정본이고 아래는 작성 범위·보충 근거다.

| 순서 | 제목 / 고정 slug | 원문 절·줄과 보완 계보 | 핵심 질문 및 직접답이 다룰 범위 |
| --- | --- | --- | --- |
| 1 | CSS의 역할과 적용 / `wiki-css-basics` | W01 16–109(역할·외부/내부/inline·규칙); P1 36–70(문법 오류·파일 경로·Network) | CSS는 HTML의 의미와 어떤 역할을 나누며 규칙을 어떻게 연결하고 읽는가? 직접답: 표현 책임, 외부 파일을 먼저 쓰는 이유, 선택자·속성·값, 연결 실패 확인. CSS 방식 3개를 별도 문서로 나누지 않음. |
| 2 | 선택자로 원하는 요소 찾기 / `wiki-selectors` | W01 111–125; P1 72–143(기본·속성·같은 요소 여러 조건/후손/자식/형제) | 같은 요소의 조건과 요소 사이 관계를 선택자로 어떻게 구분하는가? 직접답에 `.card.featured`와 `.card .featured`를 서로 다른 대상으로 설명. 상태 상세는 뒤 문서로 연결. |
| 3 | 캐스케이드와 명시도 / `wiki-cascade` | W01 127–229; P2 59–85,192–202(조건 범위·!important 진단) | 한 요소의 같은 속성에 선언이 겹치면 무엇부터 비교하는가? 적용 여부→출처·중요도·레이어→명시도→동률 순서. 일반 작성자 예제 범위와 inline/important 예외를 명시. layer는 선택 확장으로 간단히 유지. |
| 4 | 상속과 초기값 / `wiki-inheritance` | W01 231–258; P1 145–169,197–214(사용자 정의 속성) | 자식에 직접 정한 값이 없을 때 어떤 값이 이어지고 inherit/initial/unset은 어떻게 다른가? 부모 계산값·속성별 상속 여부·브라우저 기본 스타일과 초기값 차이를 직접답으로. 사용자 정의 속성은 ‘상속되는 이름 붙인 값’ 선택 확장으로 짧게 유지; 별도 문서/새 문제로 늘리지 않음. |
| 5 | 길이 단위의 계산 기준 / `wiki-units` | W02 16–106; P1 171–195(명확한 em/rem 계산 예) | px·%·rem·em은 무엇을 기준으로 계산되는가? font-size의 em과 padding의 em 기준 차이 포함. viewport 단위는 선택 확장으로 유지. 단위별 쪼개기 금지: 비교가 핵심. |
| 6 | 읽기 쉬운 글꼴과 줄 간격 / `wiki-typography` | W02 108–132,163–191 중 글꼴·line-height 예제,195–202 | 앞 글꼴이 없거나 글자가 커져도 읽히려면 무엇을 정하는가? 대체 후보·일반계열·단위 없는 line-height·사용자 간격 확대 관찰. webfont는 선택 확장. 임의 외부 폰트 다운로드/제품 의존성 없음. |
| 7 | 색과 대비로 정보 전달하기 / `wiki-color-contrast` | W02 134–161,163–191 중 색 예제,195–202 | 글자·배경색과 상태를 어떤 기준으로 고르는가? 실제 대비·색 이외 단서·opacity 전체 합성과 배경 알파 차이를 포함. WCAG 수치/예외는 원문의 범위를 유지. |
| 8 | 박스 모델과 box-sizing / `wiki-box-model` | W03 16–73; P2 87–154 | 선언한 width가 어떤 영역까지 포함하며 실제 바깥 너비는 어떻게 계산하는가? 네 영역, content-box/border-box 비교, margin 제외. 두 box-sizing은 같이 유지. |
| 9 | 일반 흐름과 display / `wiki-display` | W03 75–100,198–205; P3 10–96(비대체 inline의 width/height·none 접근성 경계) | 같은 줄·새 줄·공간 없음 중 필요한 배치를 display로 어떻게 정하는가? HTML 의미와 배치 구분, inline/block/inline-block/none 비교, flex/grid 직접 자식 범위. visibility는 선택 확장. |
| 10 | 간격의 주인과 margin 합침 / `wiki-spacing` | W03 115–140; P3 98–138; W04 63–73 | 내용 안쪽·박스 바깥·반복 항목 사이 간격은 누가 관리하는가? padding/margin/부모 gap 선택, 양수 세로 margin 합침 조건·Flex/Grid 예외. 박스 너비 계산과는 다른 ‘간격의 책임/조건’ 판단으로 분리. |
| 11 | 크기 제한과 넘침 / `wiki-overflow` | W03 102–113,142–196; P3 140–171(최대 높이·auto 로그) | 넘친 내용을 읽을 수 있게 유지하려면 어떤 원인과 크기 제한을 확인하는가? 긴 문자열·min/max·box sizing 원인, auto/hidden/clip 구분, max-height+auto. 하이픈 원문 결함 아래 참고. |
| 12 | Flexbox로 한 축 정렬하기 / `wiki-flexbox` | W04 35–138,213–227 | 부모와 직접 자식을 찾은 뒤 주축·교차축·간격·줄바꿈을 어떻게 정하는가? row/column은 글쓰기 방향을 전제로 설명. grow/shrink/basis·자동 최소 크기는 같은 배치의 선택 확장; 최종 너비 비율 오해 경계. |
| 13 | Grid로 행과 열 만들기 / `wiki-grid` | W04 140–211,217–227 | 행과 열 관계를 가진 항목의 트랙과 남은 공간을 어떻게 정의하는가? 직접 자식·fr·gap·repeat/minmax/auto-fit 순서, HTML/키보드 순서 경계. Flex와 별도 핵심 질문이나 선택 기준을 짧게 상호 연결. |
| 14 | relative와 absolute의 위치 기준 / `wiki-positioning` | W05 16–94,136–145(absolute 예외만) | 원래 자리를 남길지와 무엇을 기준으로 배치할지를 어떻게 정하는가? static/relative/absolute, containing block, 카드 배지 공간 확보. 배지 길이 모를 때 Flex/Grid를 고르는 비적용 조건. |
| 15 | fixed와 sticky의 차이 / `wiki-fixed-sticky` | W05 96–149 | 화면에 고정할 때와 영역 안에서 붙게 할 때 무엇이 다른가? 흐름 참여, inset, 실제 스크롤 거리·조상 overflow·containing block, transformed 조상의 fixed 기준 예외. 둘을 비교해야 하므로 한 문서. |
| 16 | 쌓임 맥락과 z-index / `wiki-stacking-context` | W05 151–229 | 자식 z-index가 커도 다른 부모 묶음 앞으로 못 나오는 이유는 무엇인가? 같은 맥락/부모 묶음 비교와 생성 조건. 일반 위치 결정과 별도의 앞뒤 판단으로 분리. |
| 17 | 유연한 배치와 미디어 쿼리 / `wiki-responsive` | W06 17–96,230–247; P5 11–88(이미지·viewport 전제·min-width 예) | 유연한 크기로 해결할 문제와 분기점이 필요한 문제를 어떻게 구분하는가? 콘텐츠 기반 breakpoint·조건이 참일 때만 선언 후보, min/max 비교·cascade 전제. viewport 고급은 선택 확장. 이번 제품 모바일 작업과 CSS 개념 설명은 구별. |
| 18 | 가상 클래스·가상 요소와 상태 표시 / `wiki-states` | W06 98–156; P5 90–145(가상 요소) | 현재 요소 상태와 CSS가 표현하는 부분을 어떻게 구분해 표시하는가? hover/focus-visible/active/disabled/checked, pseudo-class vs pseudo-element, 중요 정보의 유일 수단 금지. 상태별 문서 분할 없음. |
| 19 | 움직임과 동작 줄이기 / `wiki-motion` | W06 158–228; P5 147–235(animation 예·focus 상태 보존) | transform·transition·animation을 어떻게 고르고 동작 줄이기에서 무엇을 남기는가? 배치 이동과 시각 변형 구분, 상태 정보와 focus 표시는 보존, 장식 이동·전환·반복만 조정. 세 API를 분할하면 비교가 끊기므로 유지. |
| 20 | CSS 레이아웃 종합 진단 / `wiki-layout-review` | W07 17–173,235–260; W04 17–33; P4 220–237·239–269, P6 57–148에서 ‘목록 Grid/내부 Flex/배지 relative+absolute’ 관계만 짧게 보완 | 화면이 어긋났을 때 어떤 증거를 어떤 순서로 찾아 도구를 고르는가? 연결→규칙→박스→부모 배치→넘침→환경의 진단 흐름, 카드 관계에 따라 Grid/Flex/position을 조합하는 판단. 종합이라는 하나의 목적이므로 더 잘게 나누지 않음. 여러 전체 구현 실습은 복사하지 않고 구 교안에 보존. |

원문 선두 목표·요약과 끝의 정리·실습·출처는 각 파생 단위의 범위로 다시 연결한다. W07 175–233의 `resolved value`·JavaScript 측정·Bootstrap 선택 확장은 초급 필수 문서로 늘리지 않고 이번 반입에서 이연한다. P6의 여러 대형 구현 실습도 새 종합에 전부 복제하지 않고 기존 URL에 보존한다.

파생본에만 반영할 교정은 W03 142–176의 긴 문자열 예다. 하이픈이 있으면 줄바꿈 기회가 생기므로 하이픈 없는 충분히 긴 ASCII 문자열로 교체하고 원문과 다른 부분임을 표시한다. W06의 분기점은 예시값이며 이번 제품에서 직접 측정했다고 쓰지 않는다.

### 작성에서 확인한 파생·보완 경계

`[현재 사실]` 2026-09-13 시작한 작업에서 작성자 A는 표의 1~11, 작성자 B는 12~20에 해당하는 새 본문과 접수용 metadata·발췌를 작성했다. 2026-09-14에 새 파일 20개와 작성자 인계를 대조했다. 본문 작성과 관리 조립은 완료했으나 독립 콘텐츠 검증·제품 통합 판정은 아래 단계 표와 구분한다.

`source.kind: user-authored`는 승인된 사용자 제공 자료의 기존 반입 분류이며 bam이 모든 문장을 직접 집필했다는 뜻이 아니다. 원문은 AI 기여와 bam 승인 이력이 있는 자료이고 이번 파생 문장은 CSS 분할 승인 범위에서 작성자 A/B가 재구성했다. metadata의 `verifiedAt: 2026-09-02`는 원문의 공식 확인일, 2026-09-03은 원문 승인일, `importedAt: 2026-09-13`은 이 작업의 반입 표기다. 2026-09-14 이후 수행하는 독립 검증을 앞선 날짜로 소급 PASS하지 않는다.

아래는 계획표 외에 실제 작성에서 확인한 변경이며 상세 문장·질문·답의 정본은 콘텐츠에 둔다. 작성자 임시 인계는 `/private/tmp/css-author-a-notes.md`, `/private/tmp/css-author-b-notes.md`다.

| 범위 | 실제 보완·교정 |
| --- | --- |
| 규칙·선택자·캐스케이드·상속 | P1의 연결 실패 관찰과 동일 요소/후손 비교를 보완했다. 캐스케이드 예제는 같은 작성자 일반 규칙과 레이어·전환·애니메이션·scope 제외 조건을 명시했다. 상속 예제는 단독으로 읽히는 HTML과 자식에 직접 선언이 없다는 조건을 제시하고 사용자 정의 속성은 작은 선택 확장으로 유지했다. |
| 단위·글자·색·박스 | P1 독립 계산 예제를 사용하고 W02 글꼴 fallback·줄 간격 확대·색 이외 단서·opacity 경계를 남겼다. 새 `css.typography`·`css.color-contrast`에는 문항을 만들지 않았다. 박스 역산은 P2 계보와 음수 content 크기가 되지 않는 명세 경계를 보완했다. |
| display·간격·넘침 | P3의 비대체 inline/inline-block·직접 자식·none 접근성, 간격 책임·margin 합침 조건과 로그의 `max-height`+`auto`를 보완했다. 원문의 하이픈/한글 넘침 예제만 하이픈 없는 108자 ASCII로 교정했고 원본은 보존했다. |
| Flex·Grid·위치·쌓임 | Flex 본문은 가로 글쓰기 조건을 명시했다. 카드 배지의 padding은 예시이며 길이 변경을 확인하도록 남겼다. 독립 검토 반환에 따라 sticky를 단순 부모 제한으로 읽을 수 있는 요약·본문·직접답·확인표 4곳을 자신의 containing block(위치 기준 박스) 경계로 정밀화했고 접수 summary도 맞췄다. |
| 환경·상태·모션·종합 | P5의 이미지 크기·viewport·`min-width:48rem` 조건·가상 요소·animation을 보완했다. 모션은 실제 본문에 키보드 focus와 reduce에서 상태 표시 보존을 함께 둔다. 종합은 P4/P6의 목록 Grid·내부 Flex·배지 position 관계를 함께 설명하며 오류 예제의 부모 너비·자식 수·글쓰기·box-sizing 전제를 명시했다. 대형 전체 실습과 JS 측정·Bootstrap 확장은 복제하지 않았다. |

작성자 자체 형식 점검은 metadata 목표/요약 일치·실제 절 발췌·H1/펜스·직접답 구조를 확인한 자료이며 독립 교육 검토가 아니다. B의 최초 형식 보고서 해시는 sticky 정밀화 전 판본이므로 최종 파일 근거로 재사용하지 않는다. 긴 문자열의 실제 관찰과 문서/문제·서명·진도 보존은 독립 역할에 남긴다.

### 실제 객관식 연결과 한 문항의 조건 보완

| 기존 question ID | 새 대표 slug | 충분성 / 반드시 남길 풀이 근거 |
| --- | --- | --- |
| quiz-css-selector-compound-descendant | wiki-selectors | W01 표만으로 불충분. P1 111–143의 동일 요소와 공백 후손 대비를 보완해야 충분. class/id 오답도 P1 74–109 포함. |
| quiz-css-unit-inheritance-context | wiki-units | W02 64–94와 P1 180–195로 충분. padding em은 자신의 글자, rem은 루트. 20px·24px 계산 원리 포함. |
| quiz-css-cascade-winner | wiki-cascade | W01 127–193 및 P2 59–75로 충분. 문제의 일반 작성자·중요도·레이어 조건과 명시도 우선 비교 명시. |
| quiz-css-border-box | wiki-box-model | W03 41–73과 P2 108–154로 충분. margin 빼지 않음, 좌우 padding/border 빼는 계산. |
| quiz-css-display-formatting | wiki-display | W03 90–100만으론 inline-block 너비·높이의 명시적 근거가 약함. P3 36–81을 보완하면 충분. |
| quiz-css-overflow-spacing-choice | wiki-overflow | W03에는 max-height+auto 예 없음. P3 140–171의 짧은 로그 예를 보완하면 충분. |
| quiz-css-flex-axis | wiki-flexbox | W04 47–89 충분. 일반 가로 글쓰기의 column에서 주축은 세로라는 전제를 명확하게 설명. |
| quiz-css-grid-position-choice | wiki-layout-review | 단독 Grid 문서는 불충분. P4 220–237·239–269와 W05 65–94의 카드 배지 관계를 종합에 남겨야 충분. 기존 concept ID와 문항 구조를 유지하고 종합 문서가 실제 도구 선택 범위를 함께 설명한다. |
| quiz-css-media-query-condition | wiki-responsive | W06은 max-width 예뿐. P5 55–88의 min-width:48rem 두 열 예/전제를 보완하면 충분. |
| quiz-css-focus-motion-accessibility | wiki-motion | 모션만 설명하면 부족. W06 129–156 상태 개념을 선수 연결하고 P5 168–235의 focus-visible+reduce 조합/동등한 실제 설명을 본문에 짧게 남겨야 충분. |
| quiz-css-debugging-cascade-step | wiki-layout-review | W07 28–50/P6 41–55가 직접 근거. 취소선→이긴 선언 비교와 적용 미일치 구별. |
| quiz-css-layout-tool-choice | wiki-layout-review | W04 17–33에 P4 220–237/P6 99–148의 목록 Grid·내부 버튼 Flex 연결을 보완하면 충분. |

기존 문항의 `lessonId`를 새 문서 ID로 바꾸지 않는다. CSS 개념 12개에 `documentLessonId`와 실제 `heading`·`excerpt`를 추가해 위 상세 문서로 연결한다. 나머지 문서는 해당 범위 문항이 없다는 사실을 유지한다. 기존 Quest 4개·Web Project는 원래 소유 교안과 공개 계약의 가까운 실습이며 새 문제나 T가 아니다.

보존의 유일한 예외는 `quiz-css-flex-axis.code`의 `.menu` 규칙에 **`writing-mode: horizontal-tb;` 한 줄**을 넣는 유지보수다. `column` 주축을 세로로 풀이하려면 가로 글쓰기 조건이 필요하다는 기존 ‘풀이에 필요한 조건 명시’ 요구를 충족한다. ID·prompt·선택지·정답·해설·소유 교안과 나머지 11문항은 유지한다. 이 문항의 코드 서명은 달라지므로 해당 문항을 포함한 진행 세션은 기존 콘텐츠 변경 안전 경고·새 시작 안내 대상일 수 있다. 기존 채점 결과를 새 코드에 조용히 적용하거나 서명 검사를 우회하지 않으며 다른 문항·기존 완료 기록은 초기화하지 않는다. focused 검증에서 변경 필드가 이 코드 한 줄뿐인지, 변경한 문항은 서명 불일치로 안전하게 처리되고 미변경 문항은 같은 서명을 유지하는지 확인한다.

## 경험 카드와 교안 보충 근거

경험 ID는 `CSS-CONCEPT-LESSONS-20260913`이다. 아래는 원문·기존 본문 비교에 근거한 설계이며 독립 콘텐츠 검증이나 실제 학습자 성과를 대신하지 않는다. 기존 P6 10–55에는 규칙→박스→배치·환경의 진단과 도구 순서가 이미 있으므로 이를 새 E로 세지 않는다. W02 108–161의 글꼴 대체·단위 없는 줄 간격·실제 대비·색 이외 단서는 기존 제품 6교안에 충분하지 않은 조건 비교를 보충한다.

| 항목 | 이 묶음의 근거 |
| --- | --- |
| 대상·MVP 이유 | 위 `css-notes-*` 20개 ID. 한 개념의 판단과 질문·직접답을 찾아 읽고 실제 관련 문항으로 확인한다. 문서 수 자체는 목표가 아니다. |
| 선수·연결 교안 | 위 단위 표의 필요한 개념만 선수로 링크한다. CSS 규칙·선택자→캐스케이드/상속, 박스/display→배치와 넘침, 상태→모션, 앞 개념→종합이다. 원문 밖 JavaScript 실행·프레임워크를 필수 선수로 추가하지 않는다. |
| 발견할 단서 | 선택자 일치·취소선·계산값, 너비에 포함되는 영역, 부모와 직접 자식, 축·트랙·기준 조상, 실제 스크롤 영역, 글꼴 제공 여부·줄 간격 확대·색 이외의 정보. |
| 새 A | 새 접근 원자를 별도 성과로 주장하지 않는다. 선택·계산·관찰은 기존 CSS 경험을 재사용하고 실제 추가 근거는 아래 C다. |
| 재사용 A | 규칙 찾기, 캐스케이드 비교, 단위 계산, 박스·간격·넘침 관찰, 배치 도구 선택, 상태·모션과 키보드 표시 구분. |
| E | 전체 진단 순서는 P6에 이미 있다. 짧은 개념을 읽은 뒤 W07 원문의 오류→가설→수정 관계와 P4/P6 도구 선택을 다시 연결하는 지원 있는 복습이며 신규 E로 과장하지 않는다. |
| 의미 있는 C | W02 108–161: 앞 글꼴을 사용할 수 없거나 글리프가 없을 때 대체 후보, 요소 글자 크기·사용자 줄 간격이 바뀔 때 단위 없는 line-height와 내용 보존, 색을 구분하기 어려울 때 문구·모양 등 추가 단서, 배경만 투명하게 할 때와 opacity로 내용까지 합성할 때의 선택이 달라진다. 기존 6교안보다 이 판단과 적용 경계를 명시적으로 제공한다. |
| T | 새 무힌트 문제·독립 전이 과제 없음. 기존 문항/Quest와 지원 있는 진단 예제를 새 T로 세지 않는다. |
| 사다리·지원 | L0 코드·화면 조건 관찰, L1 선택 이유·자기 설명, 안내 있는 종합 복습. 질문을 먼저 생각한 뒤 사용자가 직접답을 펼치며 완료는 별도 자가 선택이다. |
| 자신의 말로 설명 | 어느 조건을 보고 그 속성·값·배치 도구를 골랐고 다른 조건에서는 무엇을 다시 확인할지 설명한다. 문서의 핵심 질문과 직접답이 같은 판단을 다룬다. |
| 독립성 비교 | 맥락·코드 대부분은 승인 원문과 기존 제품의 재사용이다. 범위는 집중 개념/비교쌍과 진단으로 구분하고, 추가 조건 C와 단위별 직접답 지원을 명시한다. 제목·소재·상수·분할 개수는 독립성 근거가 아니다. |
| 대표 오개념 | 마지막 선언이 항상 우선, important가 명시도 점수, border-box가 margin 포함, em이 언제나 부모 글자 기준, column이 글쓰기 방향과 무관하게 세로, 큰 z-index면 다른 부모 묶음 앞으로 이동, fixed가 항상 viewport 기준, 색/hover만으로 상태 전달, 동작 줄이기가 focus 표시도 제거. |
| 공개 사례·독립 검증 | 위 원문 구간·보완 계보·의도적 오류/수정 쌍·단위별 직접답·12개념 연결, 긴 문자열 교정, flex-axis의 명시적 글쓰기 조건과 서명 경계. 원문 기준 관찰과 현재 실행 결과를 구분한다. |
| 출처·날짜 | 위 원문 전체 SHA와 2026-09-13 조사·반입. 실제 공식 자료 확인·검증일은 독립 역할이 수행한 근거대로 남기며 과거 승인일로 소급 PASS하지 않는다. |
| 사람 판단 | CSS 분할·필요시 함께 유지·원문 기반 재구성은 승인됨. 실제 사용자 이해·전이 성과는 미확인이다. 근거 부족·범위 충돌은 작성/설계 단계로 반환한다. |

교안 보충 카드의 과정·ID·순서·제목·질문·목표·concept ID는 위 매핑과 작성자가 인계하는 metadata에 연결한다. 필요한 선수는 새 문서의 `먼저 확인할 개념`, 최소 예제·실수·범위·직접답·다음 실습·출처는 해당 Markdown에 둔다. 11개 표준 제목을 채우는 중복 문장을 추가하지 않는다. 짧은 개념 안에서도 비교에 필요한 전제와 반례를 지우지 않는다. 원시 HTML/CSS는 텍스트이며 외부 폰트·Bootstrap·이미지를 제품 의존성으로 가져오지 않는다.

## 역할·소유 경로와 순서

| 역할 | 쓰기 경로 또는 읽기 전용 책임 |
| --- | --- |
| 총괄 `/root` | 읽기 전용. 실제 원본·계약·diff·증거 대조와 인계·반환. |
| 원문 매핑 | 읽기 전용 원본·기존 본문 비교와 임시 매핑. 새 단위·원문 경계·경험 근거 제안. |
| 제품·설계 문서 `/root/css_split_docs` | 이 카드, `docs/designs/lesson-review.md`, `docs/content-schema.md`, `docs/lesson-authoring.md`, `docs/roadmap.md`, `docs/README.md`, `README.md`, `docs/learning-content-design.md`의 CSS 등록부 1행. |
| 원문 기반 작성 A·B | A는 위 표 1~11, B는 12~20의 신규 `content/lessons/css/wiki-*.md`와 각각의 임시 접수 fragment. 서로 겹치지 않으며 교육 내용 보완은 해당 작성자로 반환. |
| 학습 문서 관리 | `content/curriculum.json`, `content/review-concepts.json`만 조립. 작성자가 인계한 metadata·출처·ID·heading/발췌·문항 관계를 접수하고 본문 교육 내용을 작성하지 않음. |
| 문항 유지보수 작성자 B | 총괄의 추가 소유권 위임으로 `content/quizzes/css.json`의 `quiz-css-flex-axis.code`에 글쓰기 조건 한 줄만 변경. 기존 문항의 나머지 필드·다른 11문항은 유지. |
| 테스트 작성 | `tests/lesson-answer.test.js`, `tests/review-concepts.test.js`, `tests/app-independent-review.test.js`에 콘텐츠와 분리된 계약 기대값. 반환 후 `tests/learning-catalog-view.test.js`의 활성 총수·CSS 보관/활성 기대값 3줄을 추가 소유했다. 최초 통합 반환에서는 같은 파일의 HTML 개념 범위 필터 1줄과 `tests/extension-content.test.js`의 제목·CSS 파생수·보관 기대값 3줄만 추가 소유했다. |
| `content_validator` | 읽기 전용. 작성자와 분리하여 원문·정확성·범위·예제·질문/직접답·경험 카드·연결을 검증. |
| `test_engineer` | 읽기 전용. 콘텐츠 PASS 뒤 관련 테스트 기대값·실제 문서/문제 연결과 필요한 데스크톱 흐름을 감사. |
| `project_integrator` | 읽기 전용. 두 PASS 뒤 전체 diff·보존·문서 링크와 안전한 복제본의 최종 `npm run check` 1회. |

새 교육 내용은 승인 범위의 작성자가 담당하고 문서 관리자가 임의 보완하지 않는다. 겹치는 수정은 담당자의 실제 diff 인계 뒤 순차로 처리한다. 기존 미커밋 주제 자동 연결의 `src/app.js`, `tests/app-independent-review.test.js`, `docs/designs/lesson-review.md`, `docs/work-items/2026-09-13-service-sidebar.md` 변경은 보호한다. CSS 작성 때문에 이전 변경을 되돌리지 않는다. 새 제품 코드·스키마·의존성·색상·위키 원본/설정·다른 과목·위 한 줄 예외 외 기존 문항/실습·Git·원본 `dist` 수정은 범위 밖이다.

## 완료 기준과 검증 상태

1. 고정한 원문별 의미 범위·예제·선수·적용 경계가 새 단위에 빠짐없이 연결되고 목표·요약·핵심 질문·직접답이 대응한다. 비교쌍과 종합 흐름을 문서 수 때문에 나누지 않는다.
2. 실제 원본 상대 경로·전체 SHA·derived 경계를 기록하고 기존 CSS 6본문·문항·Quest·Web Project 계약과 기존 HTML·주제 연결 변경을 보존한다. 문항 변경은 위 글쓰기 조건 한 줄 예외만 허용하고 서명 불일치의 안전 경계를 확인한다.
3. CSS 기본 목록·검색·사이드바와 이전/다음에는 새 활성 문서를 표시하며 보관된 기존 URL도 정상으로 연다. 기존 완료를 새 ID에 복사하지 않는다.
4. 실제 개념 매핑·heading/발췌·관련 문제 링크와 연결 없음 안내를 검증한다. 문제→개념→문서→문제의 유효 token·선택·채점·해설과 CSS 주제 연결을 보존한다.
5. 접힌 직접답 열람과 수동 학습 완료/해제를 분리하고 데스크톱 키보드·정적 코드 표시·목차·선수 링크를 확인한다. 원문 설명의 화면 예시를 이번 실제 실행 결과로 표현하지 않는다.
6. 작성자 focused 검사, 독립 `content_validator`→`test_engineer`→`project_integrator` 순서를 지킨다. 최종 통합 전체 gate는 안전한 복제본에서 1회만 실행하고 정확한 명령·결과·미실행 범위를 기록한다. 모바일·전체 suite 반복은 하지 않는다.

| 단계 | 상태 | 증거 |
| --- | --- | --- |
| 설계·원문 매핑 | 고정 | 총괄 원문/스키마 대조와 임시 계획 `/private/tmp/css-split-plan.md`. 독립 사전 근거 `/private/tmp/css-source-validation.md`는 실제 공식 자료·원문·문항·20단위를 대조했으며 아직 없는 새 파생 콘텐츠 PASS는 아님 |
| 콘텐츠 작성·관리 조립 | 반영·관리 focused 통과 | 2026-09-14. A/B 본문과 접수 fragment를 조립하고 기존 CSS metadata에는 보관 표시만 추가. `npm run validate:content` 1회 exit 0. 임시 근거 `/private/tmp/css-content-management.json`·원시 로그 `/private/tmp/css-content-management-validate.log`. 관리 PASS이며 독립 교육 검증·전체 gate와 구분 |
| 테스트 작성 | 반영·반환 해소 | 총괄이 발견한 카탈로그 활성 총수 `44` 누락은 작성자에게 반환해 `58`로 바꾸고 CSS 보관 6·활성 20 기대값을 추가했다. 수정은 기존 테스트의 3줄이며 제품·콘텐츠 변경 없음. 실행은 아래 독립 역할이 수행 |
| 독립 콘텐츠 검증 | PASS_CONTENT_REVIEW | 2026-09-14. 20본문·질문/직접답·20metadata·12발췌·원문/제품 계보 일치, sticky 반환 수정과 나머지 19본문 불변 확인. `/private/tmp/css-content-validation.md`·`/private/tmp/css-content-final-review.json`. CSS 예제 실행·사용자 학습 성과 PASS는 아님 |
| 독립 문서 검토 | PASS | 2026-09-14. 추가 CSS 계약의 실제 수량·보존·역할과 로컬 링크 33개 오류 없음. `/private/tmp/css-document-review.md`·`/private/tmp/css-document-review-evidence.json`. 권고한 교안 작성 계약의 Flex 한 줄 예외 링크를 보강했으며 이후 상태표 변경은 통합에서 대조 |
| 독립 테스트·웹 확인 | PASS_FOCUSED_AND_DESKTOP | 2026-09-14, Node v24.17.0. focused 9개 통과 후 위 카탈로그 반환 테스트 1개만 추가 통과. 실제 1280×720에서 CSS 목록·직접답·완료/해제·CSS 자동 주제·오답/개념/새 문서 왕복·옛 URL 확인. `/private/tmp/css-test-verification.md`, 원시 로그 `/private/tmp/css-focused-tests.log`·`/private/tmp/css-catalog-focused-tests.log` |
| 최초 통합 | FAIL_INTEGRATION_TEST_EXPECTATIONS | 2026-09-14. `/private/tmp/css-integration-qk2_v12w/repo`에서 `npm run check` 1회: 콘텐츠 검사 성공, 630검사 중 628통과·2실패, exit 1. 테스트 실패로 빌드는 미실행. `/private/tmp/css-integration-initial-review.md`·`/private/tmp/css-integration-check-result.json`·원시 로그 `/private/tmp/css-integration-check.log` |
| 최종 통합 | PASS_INTEGRATION | 2026-09-14. 수정 snapshot `/private/tmp/css-integration-recheck-drhhmux9/repo`에서 `npm run check` 1회 exit 0, 630/630 통과·정적 빌드 127파일. 최초 실패 1회 + 수정 후 통과 1회로 전체 실행 총 2회이며 최초 실패 기록을 보존했다. `/private/tmp/css-integration-review.md`·`/private/tmp/css-integration-recheck-result.json`·원시 로그 `/private/tmp/css-integration-recheck.log` |

### 독립 실행 범위와 미실행 한계

독립 `test_engineer`가 콘텐츠 PASS 뒤 아래 명령을 한 번 실행해 9/9 통과했다. 이후 카탈로그 기대값 반환을 수정한 뒤 해당 테스트 1개만 실행해 1/1 통과했다. 기존 9검사·브라우저·콘텐츠 검사를 반복하지 않았다.

```sh
node --test --test-name-pattern='CSS|탐색 사이드바 객관식 전환|개념 발췌는 대상 heading' tests/lesson-answer.test.js tests/review-concepts.test.js tests/app-independent-review.test.js
node --test --test-name-pattern='문서 목록은 활성 문서만 나열하고 보관 교안의 메타데이터와 깊은 URL은 남긴다' tests/learning-catalog-view.test.js
```

데스크톱 확인은 `BAM_DEV_PORT=45971 node scripts/dev-server.mjs`로 연 임시 origin의 1280×720에서 수행했다. 사용자 `localhost:4189`의 저장 상태는 조작하지 않았다. 목록의 CSS20·새 사이드바 문서, 첫 문서의 1/20·관련 문제 없음, 답 열람의 무저장·키보드 완료/해제·목차 초점, 서비스 전환의 CSS 자동 선택, 오답 채점→관련 개념→새 선택자 문서→선택/채점/다른 해설/초점 복구와 옛 CSS URL을 실제 확인했다. 브라우저 오류/경고는 없었고 임시 완료 표시는 해제했으며 검증 탭·서버를 닫았다.

대표 CSS 예제의 별도 실행 페이지는 브라우저가 data URL 탐색을 보안 정책으로 거절했고 우회하지 않았다. 따라서 준비한 ASCII 줄바꿈 전후·박스 계산·축·예제 포커스/모션의 실제 CSS 계산과 화면 결과는 **미검증**이다. 현재 브라우저 도구는 reduced-motion 환경 전환도 지원하지 않아 별도 실행하지 않았다. 제품 화면의 focus ring 확인을 교안 예제의 reduce 실행으로 대신하지 않는다. 이번 PASS는 정적 교안의 핵심 제품 흐름과 계약에 한정하며 모든 CSS 예제 실행·모바일 제품 검사·전체 통합·실제 학습자 이해를 통과했다고 표현하지 않는다.

### 최초 통합 반환과 최소 테스트 보완

최초 `npm run check`는 CSS 파생 문서가 없던 시점의 기대값 두 곳에서 실패했다. `tests/extension-content.test.js`는 CSS 파생 0개와 보관되지 않은 기존 CSS를 기대하므로 제목과 CSS 파생 20·보관 true의 3줄을 수정했다. `tests/learning-catalog-view.test.js`의 HTML 목록 테스트는 새 상세 문서가 있는 전체 과목 개념을 순회하므로 `html.` 개념만 순회하도록 1줄을 한정했다. 기존 출처·순서·본문·직접답·HTML 12문항 누락/중복 검사는 보존했다. 수정은 독립 테스트 작성자가 담당했으며 제품·교육 내용은 바꾸지 않았다. 변경된 두 테스트의 독립 focused 확인과 최종 통합은 별도로 기록한다.

독립 `test_engineer`가 실제 diff·기존 실패 로그를 읽고 아래 변경 테스트만 1회 실행해 exit 0, 2/2 통과했다. 원시 로그는 `/private/tmp/css-gate-return-focused-tests.log`, 기대값 감사와 판정은 `/private/tmp/css-test-verification.md` 마지막 절에 있다. focused 누계는 최초 9 + 카탈로그 1 + 통합 반환 2이며 앞선 검사·UI를 반복하지 않았다. 수정 snapshot의 최종 전체 gate 통과는 위 통합 행과 구분해 기록하며, CSS 예제 계산·reduced-motion 환경 미검증 한계는 그대로다.

```sh
node --test --test-name-pattern='HTML·CSS의 보관·파생 교안은 같은 과정의 연속 순서와 공식 출처를 유지한다|HTML 목록에서 새 개념 카드와 기존 보완 문항은 12개 문제를 각각 한 번만 가리킨다' tests/extension-content.test.js tests/learning-catalog-view.test.js
```

최종 빌드·보존 증거 `/private/tmp/css-integration-recheck-verification.json`에서 빌드 127파일과 동결 소스 트리의 경로/바이트 일치, 새 CSS20본문·새 상세 문서 연결, 원본 2037파일·밤위키9원문·Git·기존 dist82 보존을 확인했다. 이 결과는 정적 자산 빌드와 보존 판정이며 교안 CSS 예제 계산 실행을 대신하지 않는다. focused 9+1+2와 전체 gate 최초 실패1·수정 후 통과1 이력은 유지하며 이번 변경은 로컬 반영 상태다. Git 게시·병합·배포는 하지 않았다.
