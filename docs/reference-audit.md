# 참고자료 감사 기록

날짜별 출처·비교·미반입 기록은 해당 시점의 이력이다. 현재 시각 기준은 [승인 시안](designs/visual-design.md#승인된-탐색-시안-적용), Algorithm Bridge 반입과 검증은 [CT 전환](work-items/2026-09-15-algorithm-bridge-coding-tests.md), 웹과제 원본 방향은 [최신 출처 확인](#밤위키-웹과제-원본-확인-2026-09-15)을 따른다. 과거 부재·미복제 기록을 현재 상태로 해석하지 않는다.

## 프로젝트 색상 참고

- bam이 직접 선택한 팔레트: `Ocean Blue Serenity`, 2026-08-29
- 사용자가 제공한 탐색 출처: [Coolors Trending Palettes](https://coolors.co/palettes/trending)
- 적용 정본: [`designs/visual-design.md`](designs/visual-design.md)
- 사용 경계: 외부 페이지의 설명·화면을 복제하지 않고 bam이 명시한 이름·순서·HEX만 프로젝트 primitive 후보로 기록

Trending 목록은 내용이 바뀔 수 있으므로 프로젝트 결정의 근거는 bam의 명시적 선택이다. 정확한 아홉 색 값, 의미 token 후보와 대비 제한은 시각 설계 정본에서만 관리한다.

## 설치 shell 후보 조사

- 조사일: 2026-08-30
- 현재 검증 장비: macOS 14.8.3, Apple Silicon(arm64)
- 적용 결정: [`DEC-DESKTOP-PROTOTYPE-01`](roadmap.md#2026-08-30-확정-제품-결정)
- 상세 prototype gate: [`designs/local-application.md`](designs/local-application.md#우선-capability-prototype-계약)

[Electron 공식 소개](https://www.electronjs.org/docs/latest/)는 Chromium과 Node.js를 포함해 HTML·CSS·JavaScript 데스크톱 앱을 만드는 구조를 설명한다. [공식 패키징 튜토리얼](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging)은 Electron Forge를 통한 배포 패키징을 안내하고, [Forge DMG Maker](https://www.electronforge.io/config/makers/dmg)는 macOS `.dmg` 산출물을 제공한다. 기존 BAM.dev가 Chromium의 module Worker, DOM·CSSOM과 정적 web API 동작에 의존하므로 첫 호환성 검증 후보로 삼을 근거가 있다.

이는 곧바로 안전하거나 채택됐다는 뜻이 아니다. [Electron 보안 지침](https://www.electronjs.org/docs/latest/tutorial/security)에 따라 원격 콘텐츠를 Node와 함께 실행하지 않고 context isolation·sandbox를 유지하며 navigation·새 창·권한을 제한해야 한다. 번들 자산에는 [`protocol` API](https://www.electronjs.org/docs/latest/api/protocol/)의 표준·보안·fetch 가능한 앱 전용 scheme 또는 동등한 origin 경계를 검증해야 한다. Electron의 지원 OS는 버전에 따라 바뀐다. 예를 들어 [Electron 44 안내](https://www.electronjs.org/blog/electron-44-0)는 macOS 12 지원 종료와 macOS 13 이상 요구를 명시하므로 정확한 버전과 공식 지원 OS를 함께 고정해야 한다.

[Tauri 사전 요구사항](https://v2.tauri.app/start/prerequisites/)은 Rust와 OS별 시스템 의존성을 요구하고, [webview 버전 문서](https://v2.tauri.app/reference/webview-versions/)는 플랫폼의 시스템 webview를 사용한다고 설명한다. [Tauri DMG 배포 문서](https://v2.tauri.app/distribute/dmg/)와 [Windows installer 문서](https://v2.tauri.app/distribute/windows-installer/)처럼 여러 설치 형식을 제공하지만, 현재 저장소에는 Rust 도구체인이 없고 시스템 webview별 module Worker·DOM·CSSOM 차이를 새로 검증해야 한다. 따라서 작은 설치 크기 가능성은 후속 비교 가치가 있지만 첫 prototype을 병렬로 늘리는 근거로 사용하지 않는다.

[Apple notarization 문서](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)는 외부 배포 전 소프트웨어 검사 절차를 설명한다. 이는 공개 배포·설치 신뢰의 결정 항목이지 BAM.dev 런타임 서버 요구가 아니다. 서명·notarization 계정과 비용 범위는 prototype capability와 별도로 bam이 결정한다.

조사 결론은 Electron·DMG를 현재 장비의 **첫 후보**로 좁힌 것이며 공식 shell, 지원 OS, 설치 파일 채택이 아니다. prototype 결과를 기록한 뒤 [`DEC-DESKTOP-01`](roadmap.md#bam-결정-대기-목록)을 닫는다.

## UI 참고 코드

- 읽기 전용 원본: 사용자가 제공한 별도 `Developer Learning Guide` UI 참고 프로젝트
- 분석 파일: `src/app/App.tsx`, `src/styles/theme.css`, `src/styles/fonts.css`
- 재사용한 개념: 다크 대시보드 구조, 208px 사이드바, 768px 학습 본문, 16~32px 간격 체계, 파랑/민트 상태색, 이전·다음 학습 흐름
- 재사용하지 않은 것: React 컴포넌트, MUI·Radix·Tailwind 의존성, 아이콘 패키지, 정적 화면 데이터
- 보완: 한국어 `lang`, 모바일 드로어, 키보드 접근, focus ring, 진행률 의미, `aria-live`, 충분한 대비

## Code Quest 학습 UI 참고

- 사용자 소유·사용 허락 원본: `/Users/goonbam/Documents/Code Quest`
- 원격 출처: `https://github.com/goonbam090/code-quest.git`
- 확인 버전과 날짜: commit `c5b1da7`, 2026-08-29
- 확인 범위: `frontend/src/App.tsx`, `frontend/src/components/LearningReview.tsx`, `frontend/src/lib/problemNavigation.ts`, `frontend/src/styles.css`, 관련 UI 테스트
- 라이선스: MIT, 원본 `LICENSE` 확인
- 첨부 참고 화면: 과정·주제·현재 문제·진도와 문제 탐색기가 열린 Code Quest 화면. 상단의 `"ChatGPT" started debugging this browser` 회색 막대는 브라우저 디버깅 오버레이이므로 제품 UI에서 제외

채택한 것은 과정·주제·문제의 계층, 분모가 있는 영역 진도, 검색·번호 이동·주제·상태 필터, 현재 위치와 시작·완료 상태, 교안 개념과 Quest를 연결하는 학습 지도, 초점 복원과 모바일 단일 열 원칙이다. 초안·시도에 근거한 `진행 중`과 위치·진행의 분리는 BAM.dev가 추가한 목표 설계다. 목표 정보 구조는 [`designs/code-quest.md`](designs/code-quest.md)에 작성했다.

React·TypeScript·CodeMirror 구성요소 코드와 다크·보라색 외형을 원본에서 직접 복사하지 않는다. BAM.dev가 별도로 [`DEC-FRONTEND-01`](roadmap.md#2026-09-04-확정-제품-결정)에 따라 React·TypeScript를 목표 기술로 선택한 것은 이 출처 코드를 채택했다는 뜻이 아니다. 원본의 Docker Compose, Nginx, Spring Boot, PostgreSQL, Chromium·Java·Deno runner와 로컬 서버 구조는 별도 Code Quest 저장소의 현재 사실이지 BAM.dev 앱 본체나 코딩테스트 runner의 현재·목표 구조가 아니다. BAM.dev는 [`DEC-LOCAL-EVALUATION-01`](roadmap.md#2026-09-02-확정-제품-결정)에 따라 두 제품의 분리를 유지하면서 JavaScript one-shot Worker와 내부 runner DTO·실행 추상화만 재사용 가능한 가벼운 설치형 로컬 경계를 사용한다. 향후 Spring Boot 실제 실행은 [`DEC-SPRING-BOOT-01`](roadmap.md#2026-09-04-확정-제품-결정)에 따른 별도 외부 웹과제에서만 시작한다. 원본의 비노출 테스트 표현은 공개 저장소에서의 UI 노출 범위를 뜻하지만, BAM.dev는 브라우저·설치 앱에 전달되는 모든 검사와 기대값을 공개 테스트·공개 기준으로 표현한다.

2026-09-02에는 Java 코딩테스트 목표 검토를 위해 같은 commit의 `java-runner/src/JavaRunnerServer.java`, `docker-compose.yml`, `.github/workflows/ci.yml`과 README 실행·채점 설명을 추가로 확인했다. 컴파일과 실행 결과를 UI 프로세스에서 분리하고 시간·메모리·출력·프로세스 제한과 기준답안 회귀를 검증한다는 **원리**는 `DEC-JAVA-RUNNER-01`·격리 ADR·prototype의 검토 입력으로 채택한다. 그러나 원본의 Docker 서비스, HTTP runner, 토큰, Spring 중계, PostgreSQL 진도와 비노출 테스트는 BAM.dev에 채택하지 않는다. BAM.dev의 Java 코딩테스트는 `DEC-JAVA-RUNTIME-01`·`DEC-JAVA-VERSION-02`에 따라 설치 패키지 내부 JDK 25 LTS 계열의 정식 Java 25 언어·표준 API와 preview 금지를 사용하며 공개 테스트만 사용자 기기에서 실행하고 사용자가 관리하는 수신 포트를 요구하지 않는 목표다. 정확한 JDK 배포판·재배포 라이선스·패치 버전·보안 업데이트 정책, 컴파일·IPC·격리·OS별 패키징은 아직 미결정이다. 이 참고 기록은 Java 문제·runner·JDK·설치 지원이 구현됐거나 검증됐다는 증거가 아니다.

원본 학습 지도는 명시적 데이터가 없을 때 문제 문구에서 개념을 추론할 수 있다. BAM.dev는 이 방식을 채택하지 않는다. Code Quest 학습 지도는 번들된 curriculum·Quest의 검증된 `lessonId`·`conceptIds` 관계에서 과정·주제를 파생하며, 코딩테스트는 별도 목록·진도를 유지한다. 저장할 Code Quest 전용 `courseId`·`topicId`·`displayOrder` 계약은 `DEC-QUEST-CATALOG-01` 결정 전까지 구현 사실로 만들지 않고, 교안 보충 카드와 경험 카드는 저작·검증 근거로만 사용한다.

## 기존 JavaScript 학습자료

- 읽기 전용 원본: 사용자가 제공한 별도 JavaScript 학습자료 폴더
- 새 프로젝트 복제본: `content/lessons/javascript/`
- 범위: 본교안 7개와 공식문서 검증 기록
- 원칙: 원본 파일을 이동·변경하지 않고, 런타임은 새 프로젝트 내부 복제본만 참조
- 공식문서 확인 기록일: 2026-08-17

복제본은 원문을 그대로 배포하는 데서 끝내지 않고 다음 범위만 학습 서비스에 맞게 보완했습니다.

- 외부 JSONPlaceholder 요청을 `content/fixtures/javascript/todos.json`의 same-origin 정적 데이터로 교체해 1~3차를 오프라인에서 실행 가능하게 했습니다.
- `todos.json`의 세 항목은 외부 응답을 복사하지 않고 프로젝트 검증용으로 직접 작성했습니다. `content/`와 함께 빌드 결과에 포함됩니다.
- DOM 할 일 예제는 보이는 label, native 버튼, 항목별 접근 가능한 이름과 버튼 이벤트 위임을 사용하도록 보완했습니다.
- `JSON.stringify()`의 순환 참조·`BigInt` 실패 경계와 ECMAScript/호스트 API 구분을 실행 예제와 객관식 근거에 추가했습니다.
- 위 변경은 새 프로젝트 복제본에만 적용했으며 읽기 전용 원본은 수정하지 않았습니다.

객관식 문제는 원본에 완성된 정답 데이터가 없어 2차에서 별도 스키마로 작성했으며, 교안 근거·코드 실행 결과·모든 오답 설명을 독립 검증했습니다. Code Quest 5개도 3차에서 교안 개념을 바탕으로 새로 작성했습니다. 외부 문제의 문구·입출력·테스트를 복사하지 않았으며, 별도 콘텐츠 계약과 기준 풀이·대표 오답 fixture로 공개 테스트와 추가 경계를 독립 검증했습니다.

## 알고리즘 과정 확장

아래는 2026-08-20·2026-08-23에 JavaScript 과정으로 처음 작성한 당시의 출처·검증 이력입니다.

- 새 프로젝트 작성본: `content/lessons/algorithm/`의 알고리즘 교안(현재 수량은 프로젝트 [`README.md`](../README.md) 참조)
- 범위: 스택·큐, 해시, 힙·그리디, 정렬·투 포인터·슬라이딩 윈도우, 완전 탐색·백트래킹·재귀, 정수론·기하학, 이분 탐색·동적 계획법 1, BFS·DFS·그래프·격자, 트리, 구현·문자열 시뮬레이션, 동적 계획법 2, 가중 그래프·다익스트라
- 원칙: 외부 문제의 문구·예제·답안을 복제하지 않고 작은 입력과 실행 흐름을 프로젝트에서 새로 작성
- 교안 메타데이터의 공식·권위 자료 확인일: 2026-08-20 또는 2026-08-23

JavaScript API 동작은 [ECMAScript 명세](https://tc39.es/ecma262/)와 [MDN JavaScript 참고서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)를 확인했습니다.
자료구조와 알고리즘의 정의·적용 조건·복잡도는 [MIT OpenCourseWare 6.006 강의 자료](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-notes/)를 중심으로 검증했습니다.
당시 알고리즘 교안은 별도 `algorithm` 과정에서 JavaScript를 사용했고, 각 문서의 `개념 연결`에서 선행·현재·후속 conceptId를 안내했습니다. 당시 `tests/algorithm-lessons.test.js`는 과정의 연결과 JavaScript 예제를 독립 실행 문맥에서 검증했습니다.

2026-09-14에는 [알고리즘 Java 전환과 기초 문서 분리](designs/lesson-review.md#알고리즘-java-전환과-기초-문서-분리)에 따라 활성 교안 14개를 Java 기준으로 전환했습니다. 밤위키 Java 원문 3개에서 기초 교안 4개를 파생하고, 나머지 기존 제품 교안 10개를 Java로 변환했습니다. 기존 `js-09-hash-map-set`의 JavaScript 본문은 연결된 JavaScript Code Quest 4개를 위해 보관 교안으로 유지합니다. 현재 `tests/algorithm-lessons.test.js`의 검사는 Java 메타데이터·선수 개념·직접답 등 정적 계약을 확인합니다. 실제 Java 컴파일·실행 결과는 별도의 변경 범위 검증 기록으로 구분하며, 이 출처 기록만으로 실행 통과를 주장하지 않습니다.

2026-08-23에는 `js-09-hash-map-set`의 적용 연습으로 JavaScript Code Quest 4개를 기존 컬렉션 뒤에 추가했습니다. 단계는 `Set` 존재 조회, `Map` 값 조회, 순회 중 빈도 갱신, 중복 수량 소비로 구분했습니다. 기존 교안의 단어·태그 빈도 및 단순 중복 판별, 기존 코딩테스트의 목표 단어 카운트·고정 카테고리 누적·좌표 방문 문제와 다른 입력·처리·결과 계약을 사용하며, 외부 문제의 문구·예시·테스트를 복사하지 않았습니다.

### 승인된 스택·큐 시각화

2026-09-14 bam이 직접 작성한 아래 두 PNG를 각 개념의 설명 뒤, 코드 예제 앞에 사용하는 것을 승인했습니다. Obsidian 원본은 변경하지 않고 바이트 그대로 `content/assets/algorithm/`에 복사했습니다. 표의 SHA-256은 원본과 제품 복사본이 같습니다. 다른 Obsidian 시각 자료의 사용 승인을 포함하지 않습니다.

| 그림 | Obsidian Vault 내 원본 경로 | 제품 경로 | SHA-256 |
| --- | --- | --- | --- |
| 스택 LIFO | `첨부파일/이미지/Pasted image 20260825005654.png` | `content/assets/algorithm/stack-lifo.png` | `8b16ca5628ab364a5ab8b4a728d6204f1d6796a9aa71b7008f225ba9912ab056` |
| 큐 FIFO | `첨부파일/이미지/Pasted image 20260825123743.png` | `content/assets/algorithm/queue-fifo.png` | `b3bdf4791af30b10310ab2dbe425ed89049b2de9c831d7b2f5e0cc085fca95fe` |

## 문서 중심 개발 체계 참고

- 읽기 전용 참고 프로젝트: `/Users/goonbam/study/grepp/algorithm-bridge`
- 확인 버전과 날짜: commit `8972c7e`, 2026-08-27
- 확인 문서: `AGENTS.md`, `README.md`, `references/book-problem-boundaries.md`, `book-problem-approaches.md`, `learning-ladder-design.md`, `problem-generation-contract.md`

참고 프로젝트의 Java 문제·정답·테스트나 특정 책의 카탈로그를 복제하지 않았습니다. 접근 원자·순서 연결·무힌트 전이, 지원 감소, 문제 필요성 근거, 생성·검증 책임 분리와 증거 인계라는 문서화 원칙만 분석했습니다. BAM.dev에 채택·수정한 기준의 정본은 [`learning-content-design.md`](learning-content-design.md), [`lesson-authoring.md`](lesson-authoring.md)와 [`development-workflow.md`](development-workflow.md)입니다.

## HTML·CSS 정식 확장

- 새 프로젝트 작성본: `content/lessons/html/` 교안 5개, `content/lessons/css/` 교안 6개, 언어별 객관식 각 12문항과 Code Quest HTML 5개·CSS 4개
- 검증 fixture: HTML 기준 답안 5개·대표 오답 5개, CSS 기준 답안 4개·대표 오답 10개
- 원칙: 외부 교안이나 문제의 문구·입출력·테스트를 복사하지 않고 교안에 명시한 표준과 접근성 가이드를 근거로 프로젝트에서 새로 작성
- 공식문서 확인 기록일: 2026-08-18

HTML 교안은 다음 범위의 링크를 각 문서 끝에 직접 기록했습니다.

- 문법·DOM·문서 구조: [WHATWG HTML 문법](https://html.spec.whatwg.org/multipage/syntax.html), [DOM과 의미](https://html.spec.whatwg.org/multipage/dom.html), [section과 landmark 요소](https://html.spec.whatwg.org/multipage/sections.html)
- 텍스트·링크·데이터 구조: [WHATWG 링크](https://html.spec.whatwg.org/multipage/links.html), [이미지와 대체 텍스트](https://html.spec.whatwg.org/multipage/images.html), [목록](https://html.spec.whatwg.org/multipage/grouping-content.html), [표](https://html.spec.whatwg.org/multipage/tables.html)
- 폼·검토: [WHATWG 폼](https://html.spec.whatwg.org/multipage/forms.html), [입력 요소](https://html.spec.whatwg.org/multipage/input.html), [HTML 파싱](https://html.spec.whatwg.org/multipage/parsing.html)
- 접근성 관찰: [W3C WAI 링크 목적](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html), [이미지 대체 텍스트 결정 트리](https://www.w3.org/WAI/tutorials/images/decision-tree/), [표 머리글](https://www.w3.org/WAI/tutorials/tables/two-headers/), [폼 레이블](https://www.w3.org/WAI/tutorials/forms/labels/), [기초 접근성 점검](https://www.w3.org/WAI/test-evaluate/preliminary/)

CSS 교안은 다음 범위의 W3C 표준과 MDN 학습 자료를 교차 확인했습니다.

- 규칙·선택자·값·캐스케이드: [Selectors Level 4](https://www.w3.org/TR/selectors-4/#structure), [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/), [CSS Values and Units Level 4](https://www.w3.org/TR/css-values-4/), [MDN 기본 선택자](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_selectors)
- 박스·흐름·배치: [CSS Box Model Level 3](https://www.w3.org/TR/css-box-3/), [CSS Display Level 3](https://www.w3.org/TR/css-display-3/), [CSS Overflow Level 3](https://www.w3.org/TR/css-overflow-3/), [CSS Positioned Layout Level 3](https://www.w3.org/TR/css-position-3/), [Flexbox Level 1](https://www.w3.org/TR/css-flexbox-1/), [Grid Level 2](https://www.w3.org/TR/css-grid-2/)
- 반응형·상태·동작·계산값: [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/), [CSS Transitions Level 1](https://www.w3.org/TR/css-transitions-1/), [CSS Transforms Level 1](https://www.w3.org/TR/css-transforms-1/), [CSS Animations Level 1](https://www.w3.org/TR/css-animations-1/), [CSSOM `getComputedStyle()`](https://www.w3.org/TR/cssom-1/#dom-window-getcomputedstyle), [MDN 반응형 웹 디자인](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

HTML·CSS 객관식과 Quest는 위 교안의 안정적인 `lessonId`·`conceptId`에 연결해 새로 작성했습니다. 기준 답안과 대표 오답도 프로젝트 로컬 fixture이며 외부 문제의 답안이나 테스트를 복제하지 않았습니다. 브라우저에 내려가는 구조·스타일 assertion은 모두 공개 검사입니다.

## Java 확장 검증 샘플

- 새 프로젝트 작성본: `content/lessons/java/types-and-methods.md`와 Java 객관식 1문항
- 범위: 공통 교안·객관식 계약의 언어 독립성을 유지하는 읽기·추론 샘플
- 공식문서 확인 기록일: 2026-08-18
- 2026-09-14 복원 출처: `db1a5f430f45fc0f60277a0a1ddc7f38fc21c7a0`의 기존 Java 교안 5개와 `docs/references/java-official-sources.md`를 바이트 그대로 복원하고 보관 목록으로만 등록했습니다.

당시 Java 샘플은 [Java Language Specification SE 26의 타입](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html)과 [메서드 선언](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.4)을 확인했다. 이 URL은 과거 출처 기록이며 현재 Java 25 기준을 바꾸지 않는다. 이후 [JS·Java 개념 전환](work-items/2026-09-14-js-java-concepts-and-review.md)으로 정적 Java 과정을 제공했고 [CT 전환](work-items/2026-09-15-algorithm-bridge-coding-tests.md)으로 원본 문제의 열람·작성·저장을 추가했다. 별도 로컬 Java runner 후보는 격리 실패로 비활성이며 실제 실행·정식 설치는 미완료다. Java 25·preview 금지, 정확한 후보 artifact와 재개 조건은 [런타임 ADR](decisions/0005-java-quest-local-runtime.md), 정식 제품 범위는 [로드맵](roadmap.md#bam-결정-대기-목록)을 따른다. 날짜별 샘플 검증을 현재 교안·Java 컴파일 전체 PASS로 확대하지 않는다.

## 밤위키 웹과제 원본 확인 (2026-09-15)

`[현재 사실]` 읽기 전용 자료 조사에서 밤위키 `schema/자동운영/웹과제-운영.md`의 2026-09-14 확정 운영 방식을 확인했다. 원본 SHA-256은 `dac40d6dd34bcdfccd99b02cfd5337a9360d572b12ff1a13f1997b0258c093a1`이다. 한 과제 프로젝트·한 Git, 개념별/종합 독립 시작 브랜치, 같은 루트 README, 고정 시작 commit·버전·AI 제공 범위와 원격 공개 별도 경계는 [BAM 웹과제 계약](designs/web-assignments.md)에 반영한다.

확인한 비SQL 웹코딩 원본 후보는 `wiki/outputs/review/study-tools/v1/명세.md`의 스터디 도구함과 `wiki/outputs/review/study-meetup-20260910/v1/pin-명세.md`의 스터디 안내판이다. 보존 명세·starter와 실제 사용자 풀이 폴더를 구분했다. 후자의 README는 독립 연습과 Java 21·Spring Boot·로컬 공개 검증을 안내하지만 실제 브랜치/commit·기동·검사를 이번에 실행하지 않았다. BAM의 Java 25 계약 변경이나 후보의 BAM 반입·제공 완료를 뜻하지 않는다.

개인 경험 본문·사용자 풀이를 전수 열람하거나 복제하지 않았다. SQL/ERD·Excalidraw/PNG를 반입하지 않았고 원본 운영·예약·템플릿을 수정하지 않았다. 선택할 과제·고정 시작 버전·BAM ID·선수 연결·전달/공개·실행/오프라인 계약은 후속 미결정이다. 이 조사와 문서 정리는 콘텐츠 전체의 교육적 검증이 아니다. 근거는 `/tmp/bam-project-data-web-audit.md`와 해당 manifest다.
