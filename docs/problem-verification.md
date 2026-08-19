# 문제 검증 기록

검증일: 2026-08-19

## 결론

현재 제공되는 객관식 50문항, Code Quest 19문제, JavaScript·Java 코딩테스트 12문제의 정답·기대값·실패 설명 연결을 전수 확인했습니다. 스키마 통과만으로 검증 완료를 판단하지 않고, JavaScript·Java 실행 문제는 기준 풀이·공개 사례·독립 사례·대표 오답을 실제 런타임으로 실행하고 HTML·CSS 직접 소스 문제는 기준 답안과 대표 오답을 각 공개 assertion 평가기에 통과시켰습니다.

| 문제군 | 전수 결과 | 독립 검증 근거 |
| --- | --- | --- |
| 객관식 50문항 | 정답키 50/50 일치, 선택지 200/200에 판정과 개별 이유 | JavaScript 14·HTML 12·CSS 12·Java 12문항의 스키마, 교안·개념 연결, 단일 정답과 feedback 자동 검증 |
| JavaScript Code Quest 5문제 | 기준 풀이·기대값 일치, 대표 오답 7개가 의도한 사례에서 실패 | 선언 사례 47개와 별도 생성 사례 16,114개 실행, 공개/추가 사례 교차 중복 회귀 검사 |
| HTML Code Quest 5문제 | 기준 마크업 5/5가 공개 검사 30개 통과, 대표 오답 5/5가 지정 검사에서 실패 | doctype·inert DOM 선택자·개수·속성·텍스트 assertion과 위험 source preflight 검증 |
| CSS Code Quest 4문제 | 기준 스타일시트 4/4가 공개 검사 19개 통과, 대표 오답 10/10이 지정 검사에서 실패 | CSSOM 선언·미디어 조건·계산 스타일 계약, 고정 fixture preflight와 대표 오답 실행 |
| Java Code Quest 5문제 | 공개 테스트 29개와 독립 사례 6개 기준 풀이 통과 | Java 21 컴파일·실행, 대표 오답 5개가 선언한 사례에서 정확히 실패 |
| JavaScript 코딩테스트 6문제 | 공개 테스트 38개와 독립 사례 7개 기준 풀이 통과 | 문제별 대표 오답 실행, starter code가 완성 답안이 아님을 검사 |
| Java 코딩테스트 6문제 | 공개 테스트 38개와 독립 사례 7개 기준 풀이 통과 | Java 21 컴파일·실행, 대표 오답 6개와 starter code 미완성 검증 |

HTML 기준 답안 5개와 대표 오답 5개는 `tests/fixtures/html-code-quest-solutions.js`, CSS 기준 답안 4개와 대표 오답 10개는 `tests/fixtures/css-code-quest-solutions.js`에 있습니다. fixture는 빌드 대상이 아니며, 콘텐츠의 공개 검사와 독립적으로 답안·오답의 의도를 고정하는 회귀 자료입니다.

## 감사에서 발견하고 수정한 항목

- 배송비 JavaScript Code Quest의 추가 검증 한 건이 공개 테스트와 입력·기대값까지 같았습니다. 입력을 독립 사례로 교체하고, 모든 JavaScript Quest에서 공개 테스트와 추가 검증 사이의 ID 및 `args + expected` 중복을 자동 거부하도록 회귀 테스트를 추가했습니다.
- HTML 문서 구조 Quest는 `<template>` 조각만으로 doctype을 관찰할 수 없습니다. `doctype-present` assertion을 추가하고 source 첫 선언과 `DOMParser` 결과를 함께 확인해 잘못된 추가 토큰, 공개·시스템 식별자가 없는 정확한 HTML5 doctype만 승인합니다.
- HTML 접근성 폼 Quest는 form의 존재와 전역 선택자를 따로 검사하면 서로 떨어진 빈 요소나 여러 form에 분산한 컨트롤도 통과할 수 있었습니다. 고유한 `newsletter-signup` form을 정확히 하나 요구하고 label·input·button을 그 직접 자식으로 한정하며 보이는 레이블·버튼 텍스트까지 공개 검사합니다.
- CSS 반응형 Quest는 선언값만 검사하면 같은 규칙을 미디어 조건 밖에 작성한 오답도 통과할 수 있습니다. `media-rule-declaration` assertion을 추가해 최상위 `(min-width: 48rem)`과 `(min-width: 72rem)` 조건 안의 선언을 각각 검사하고, 조건을 제거·변경하거나 비활성 `@supports` 안에 중첩한 오답으로 회귀 검증합니다.
- CSS 계산 스타일은 학습자 마크업이 아니라 문제별 고정 fixture에만 적용합니다. fixture도 학습자 HTML과 같은 위험 source preflight를 통과시키고 실행 요청에서 콘텐츠의 정식 값을 복사해 교체를 막습니다.
- 격자 로봇 코딩테스트의 남쪽·서쪽 이동 벡터가 기존 사례에서 실행되지 않았습니다. 문제 리비전을 2로 올리고 두 방향 공개 테스트, 별도 결합 검증 사례와 해당 벡터를 뒤집은 대표 오답을 추가했습니다.
- Java 객관식은 교안의 오류 예시와 수정 방향을 그대로 활용하므로 새 문제로서의 자극은 낮습니다. 정답과 모든 오답 설명은 정확하며, 이는 정확성 결함이 아닌 향후 콘텐츠 다양화 항목으로 남깁니다.

## Java 문제 검증 (7차)

Java Code Quest 5문제와 Java 코딩테스트 6문제는 모두 `public class Solution`의 `public static` 메서드를 진입점으로 사용합니다. 매개변수와 반환값은 격리 채점기가 Java 리터럴로 안전하게 바꿀 수 있는 `int`, `boolean`, `String`, `int[]`, `String[]`만 허용했습니다. 화면에 제공되는 실행·제출 사례는 전부 공개 테스트이며 각 공개 테스트에 학습자용 실패 설명이 정확히 하나씩 연결됩니다.

| 문제군 | 공개 테스트 | 독립 사례 | 대표 오답 검증 |
| --- | ---: | ---: | --- |
| Java Code Quest 5문제 | 29개 | 6개 | 대표 오답 5개가 선언한 공개 테스트에서 정확히 실패 |
| Java 코딩테스트 6문제 | 38개 | 7개 | 대표 오답 6개가 선언한 공개 테스트에서 정확히 실패 |

`tests/fixtures/java-code-quest-solutions.js`와 `tests/fixtures/java-coding-test-solutions.js`에 콘텐츠 JSON과 분리한 기준 풀이, 독립 사례, 대표 오답을 기록했습니다. `tests/fixtures/java-fixture-runner.js`는 JSON 인수와 기대값을 허용 타입의 Java 리터럴로 변환하고, 임시 디렉터리에서 `javac --release 21`로 `Solution.java`와 검증 하네스를 컴파일한 뒤 실제 반환값을 비교합니다. 기준 풀이 11개는 공개 테스트와 독립 사례 총 80개를 모두 통과했고, starter code 11개는 컴파일·호출 가능하지만 전체 공개 테스트의 완성 답안은 아님을 확인했습니다.

Java 전용 검증 명령은 다음과 같습니다.

```bash
node --test \
  tests/java-code-quest-content.test.js \
  tests/java-coding-test-content.test.js
```

## 실제 실행한 콘텐츠 검증

```bash
node --test \
  tests/quiz-content.test.js \
  tests/extension-content.test.js \
  tests/code-quest-content.test.js \
  tests/html-code-quest-content.test.js \
  tests/css-code-quest-content.test.js \
  tests/coding-test-content.test.js \
  tests/java-code-quest-content.test.js \
  tests/java-coding-test-content.test.js
```

위 명령은 75개 테스트가 모두 통과했습니다. 이어서 `npm run check`에서 콘텐츠 검증과 정적 빌드가 통과했고, 전체 자동 테스트 589개 중 587개가 통과했으며 실패는 0개였습니다. 기본 실행에서 환경 의존 통합 테스트 2개는 skip되며, 같은 테스트를 별도로 활성화해 Docker 채점 5/5와 loopback HTTP 1/1 통과를 확인했습니다.

실제 브라우저에서는 HTML 문서 구조 기준 답안 6/6, 접근성 폼 기준 답안 6/6, CSS 반응형 기준 답안 5/5가 통과했습니다. `<!doctype html foo>`는 5/6, 여러 form에 컨트롤을 분산한 오답은 2/6, 비활성 `@supports` 안에 미디어 규칙을 중첩한 오답은 3/5로 실패했으며 각 실패 설명을 확인했습니다. Java에서는 Code Quest 기준 풀이 6/6, 코딩테스트 실행 3/3과 제출 6/6이 브라우저에서 실제 API와 Docker 채점기를 거쳐 통과했습니다. 390px 모바일 화면에서 메뉴·편집기·실행 결과와 가로 넘침 없음을 확인했고 콘솔 warning/error는 0건이었습니다.

브라우저에 포함된 Quest·코딩테스트의 실행·제출 테스트는 모두 공개 테스트입니다. 화면과 문서 어디에서도 이를 비밀 또는 숨김 테스트라고 표현하지 않습니다.
