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

## 확장 검증 샘플

- 새 프로젝트 작성본: `content/lessons/html/document-structure-and-semantics.md`, `content/lessons/css/cascade-and-box-model.md`, `content/lessons/java/types-and-methods.md`와 언어별 객관식 파일
- 범위: HTML·CSS·Java 교안과 객관식 각 1개
- 원칙: 외부 교안이나 문제를 복사하지 않고 각 표준 문서를 근거로 프로젝트에서 새로 작성
- 공식문서 확인 기록일: 2026-08-18

HTML 샘플은 [WHATWG HTML Standard의 sections](https://html.spec.whatwg.org/multipage/sections.html), CSS 샘플은 [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/), [CSS Box Model Level 3](https://www.w3.org/TR/css-box-3/), [CSS Box Sizing Level 3](https://www.w3.org/TR/css-sizing-3/)을 확인했습니다. Java 샘플은 [Java Language Specification SE 26의 타입](https://docs.oracle.com/javase/specs/jls/se26/html/jls-4.html)과 [메서드 선언](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.4)을 확인했습니다. Java 코드를 브라우저에서 실행하거나 채점했다고 표현하지 않으며, 이번 게이트는 공통 콘텐츠·평가 계약만 검증합니다.
