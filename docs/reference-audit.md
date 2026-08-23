# 참고자료 감사 기록

## UI 참고 코드

- 읽기 전용 원본: 사용자가 제공한 별도 `Developer Learning Guide` UI 참고 프로젝트
- 분석 파일: `src/app/App.tsx`, `src/styles/theme.css`, `src/styles/fonts.css`
- 재사용한 개념: 다크 대시보드 구조, 208px 사이드바, 768px 학습 본문, 16~32px 간격 체계, 파랑/민트 상태색, 이전·다음 학습 흐름
- 재사용하지 않은 것: React 컴포넌트, MUI·Radix·Tailwind 의존성, 아이콘 패키지, 정적 화면 데이터
- 보완: 한국어 `lang`, 모바일 드로어, 키보드 접근, focus ring, 진행률 의미, `aria-live`, 충분한 대비

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

## 알고리즘 과정

- 새 프로젝트 작성본: `content/lessons/algorithm/` 교안 12개
- 범위: 기본 자료구조, 구현·문자열, 해시, 정렬 패턴, 완전 탐색·백트래킹, 정수론·기하, 이분 탐색·동적 계획법, 그래프 탐색, 트리, 힙·그리디, 2차원 동적 계획법, 다익스트라
- 코드 블록: JavaScript 실행 코드 39개, `text` 예시를 포함한 fenced 코드 블록 43개
- 원칙: 외부 문제의 문구·예제·답안을 복제하지 않고 작은 입력과 실행 흐름을 프로젝트에서 직접 작성
- 공식·권위 자료 확인 기록일: 이전 교안 6개 2026-08-20, 이전 교안 2개와 신규 교안 4개 2026-08-23

이전 알고리즘 교안 8개의 안정적인 lesson ID는 유지하고 정수론·기하, 트리, 동적 계획법 2, 가중 그래프·다익스트라 4개 단원을 추가했습니다. 현재 평가 콘텐츠가 이 8개 ID를 직접 참조하지는 않습니다. 선수 순서는 구현을 기초부로 옮기고, 정렬을 `sort()` 기반 그리디보다 먼저, 트리를 힙보다 먼저 학습하도록 구성했습니다.

JavaScript API 동작은 [ECMAScript 명세](https://tc39.es/ecma262/)와 [MDN JavaScript 참고서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)를 확인했습니다. 자료구조와 알고리즘의 정의·적용 조건·복잡도는 [MIT OpenCourseWare 6.006 강의 자료](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-notes/)와 각 교안에 기록한 NIST 자료를 교차 확인했습니다. 교안의 모든 JavaScript 코드 블록은 독립된 Node 실행 문맥에서 실행하며, 신규 4개 교안은 문서에 적은 출력도 함께 검증합니다.

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

## Java 정식 확장

- 새 프로젝트 작성본: `content/lessons/java/` 교안 6개, Java 객관식 12문항, Code Quest 5문제, 코딩테스트 6문제
- 범위: 타입·컴파일·메서드, 연산·제어문·배열, 클래스·객체·캡슐화, 컬렉션·제네릭, 예외·디버깅, 문제 분해·테스트·복잡도
- 검증 fixture: Quest 기준 풀이 5개·독립 사례 6개·대표 오답 5개, 코딩테스트 기준 풀이 6개·독립 사례 7개·대표 오답 6개
- 원칙: 외부 교안이나 문제의 문구·입출력·테스트·답안을 복제하지 않고 Java SE 공식 명세와 API 계약을 근거로 프로젝트에서 새로 작성
- 공식문서 확인 기록일: 2026-08-19
- 상세 검증 기록: `docs/references/java-official-sources.md`

교안의 언어 규칙은 [Java Language Specification SE 25](https://docs.oracle.com/javase/specs/jls/se25/html/)에서, `List`·`Map`·예외·파일 읽기 API는 [Java SE 25 API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/module-summary.html)에서 확인했습니다. 학습 예제의 필수 문법과 API는 Java 21 호환 범위로 제한했습니다. Java 객관식은 각 교안의 안정적인 `lessonId`와 `conceptId`에 연결해 새로 작성했고, 정답 하나와 모든 오답의 구체적인 실패 이유를 포함합니다.

Java Quest와 코딩테스트도 연결 교안의 개념을 직접 연습하도록 BAM.dev에서 새로 작성했습니다. `tests/fixtures/java-code-quest-solutions.js`와 `tests/fixtures/java-coding-test-solutions.js`의 기준 풀이·독립 사례·대표 오답 역시 외부 문제 사이트나 답안을 옮기지 않은 프로젝트 자체 검증 자료입니다. 공개 테스트 67개와 독립 사례 13개를 Java 21로 실제 컴파일·실행했고, 대표 오답 11개가 선언한 사례에서 실패하는지 별도로 확인했습니다. 브라우저와 빌드 결과에 포함되는 사례는 모두 공개 테스트입니다.
