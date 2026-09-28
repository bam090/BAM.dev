# 문제 검증 기록

검증일: 2026-08-23

## 결론

현재 제공되는 객관식 39문항, Code Quest 18문제, JavaScript 코딩테스트 6문제의 정답·기대값·실패 설명 연결을 전수 확인했습니다. 스키마 통과만으로 검증 완료를 판단하지 않고, JavaScript 실행 문제는 기준 풀이와 독립 사례를 실제 런타임으로 실행하고 HTML·CSS 직접 소스 문제는 기준 답안과 대표 오답을 각 공개 assertion 평가기에 통과시켰습니다.

| 문제군 | 전수 결과 | 독립 검증 근거 |
| --- | --- | --- |
| 객관식 39문항 | 정답키 39/39 일치, 선택지 156/156에 판정과 개별 이유 | JavaScript 14·HTML 12·CSS 12·Java 1문항의 스키마, 교안·개념 연결, 정답 수와 feedback 자동 검증 |
| JavaScript Code Quest 9문제 | 공개 테스트 54개와 추가 검증 29개에서 기준 풀이 통과, 대표 오답 11개가 지정 사례에서 실패 | 선언 사례 83개 실행, 신규 해시 Quest 생성 사례 1,475개와 반복 실행 2,950회 대조, 공개/추가 사례 교차 중복 회귀 검사 |
| HTML Code Quest 5문제 | 기준 마크업 5/5가 공개 검사 30개 통과, 대표 오답 5/5가 지정 검사에서 실패 | doctype·inert DOM 선택자·개수·속성·텍스트 assertion과 위험 source preflight 검증 |
| CSS Code Quest 4문제 | 기준 스타일시트 4/4가 공개 검사 19개 통과, 대표 오답 10/10이 지정 검사에서 실패 | CSSOM 선언·미디어 조건·계산 스타일 계약, 고정 fixture preflight와 대표 오답 실행 |
| JavaScript 코딩테스트 6문제 | 공개 테스트 38개와 독립 사례 7개 기준 풀이 통과 | 문제별 대표 오답 실행, starter code가 완성 답안이 아님을 검사 |

HTML 기준 답안 5개와 대표 오답 5개는 `tests/fixtures/html-code-quest-solutions.js`, CSS 기준 답안 4개와 대표 오답 10개는 `tests/fixtures/css-code-quest-solutions.js`에 있습니다. fixture는 빌드 대상이 아니며, 콘텐츠의 공개 검사와 독립적으로 답안·오답의 의도를 고정하는 회귀 자료입니다.

## 해시 적용 Code Quest 확장

`js-09-hash-map-set` 교안에 연결한 네 문제는 같은 빈도 계산을 반복하지 않고, 문제 문장에서 조회 기준과 저장 정보를 정하는 사고를 다음 순서로 바꿉니다.

| 단계 | 조회 기준과 저장 정보 | 사용자 난이도 점수 | 판정 |
| --- | --- | ---: | --- |
| 등록 코드 판별 | 등록 코드의 존재 여부만 `Set`에 저장 | 3점 | 기초형 |
| 보관함 번호 조회 | `studentId → lockerNumber`를 `Map`에 저장 | 4점 | 기초형 |
| 목표 횟수 최초 도달 | `code → 현재 횟수`를 갱신한 직후 판단 | 6점 | 응용형 |
| 미충족 요청 | `code → 남은 수량`을 요청 순서대로 소비 | 8점 | 응용형 |

네 문제는 대상 수준 메타데이터로 `difficulty: beginner`를 유지합니다. 위 기초형·응용형은 정석 풀이의 규칙 해석, 데이터 구성, 상태, 예외, 효율성, 결과 생성 점수를 합산한 별도 사고 난이도입니다.

신규 공개 테스트 24개와 추가 검증 12개에서 기준 풀이 36/36이 통과했습니다. 각 사례를 두 번 실행한 72회에서 결과가 같았고, 기준 풀이가 전달받은 배열과 중첩 객체를 바꾸지 않았습니다. 대표 오답 4개는 공개 테스트 24회 중 선언한 8회만 실패하고 나머지 16회는 통과했습니다. 별도 작은 입력 1,475개를 독립 oracle과 대조하고 같은 함수 인스턴스로 두 번씩 실행한 2,950회에서도 결과와 입력 불변성이 일치했습니다.

브라우저 채점은 반환값만 비교하므로 특정 풀이가 실제로 `Map`·`Set`을 사용했는지, 기록된 기대 복잡도를 만족하는지, 인수를 변경했는지는 합격 조건으로 보장하지 않습니다. 자료구조 선택과 복잡도는 학습 힌트와 기준 풀이 검토 근거이며, 입력 불변성은 기준 풀이의 독립 검증 결과입니다.

## 감사에서 발견하고 수정한 항목

- 배송비 JavaScript Code Quest의 추가 검증 한 건이 공개 테스트와 입력·기대값까지 같았습니다. 입력을 독립 사례로 교체하고, 모든 JavaScript Quest에서 공개 테스트와 추가 검증 사이의 ID 및 `args + expected` 중복을 자동 거부하도록 회귀 테스트를 추가했습니다.
- HTML 문서 구조 Quest는 `<template>` 조각만으로 doctype을 관찰할 수 없습니다. `doctype-present` assertion을 추가하고 source 첫 선언과 `DOMParser` 결과를 함께 확인해 잘못된 추가 토큰, 공개·시스템 식별자가 없는 정확한 HTML5 doctype만 승인합니다.
- HTML 접근성 폼 Quest는 form의 존재와 전역 선택자를 따로 검사하면 서로 떨어진 빈 요소나 여러 form에 분산한 컨트롤도 통과할 수 있었습니다. 고유한 `newsletter-signup` form을 정확히 하나 요구하고 label·input·button을 그 직접 자식으로 한정하며 보이는 레이블·버튼 텍스트까지 공개 검사합니다.
- CSS 반응형 Quest는 선언값만 검사하면 같은 규칙을 미디어 조건 밖에 작성한 오답도 통과할 수 있습니다. `media-rule-declaration` assertion을 추가해 최상위 `(min-width: 48rem)`과 `(min-width: 72rem)` 조건 안의 선언을 각각 검사하고, 조건을 제거·변경하거나 비활성 `@supports` 안에 중첩한 오답으로 회귀 검증합니다.
- CSS 계산 스타일은 학습자 마크업이 아니라 문제별 고정 fixture에만 적용합니다. fixture도 학습자 HTML과 같은 위험 source preflight를 통과시키고 실행 요청에서 콘텐츠의 정식 값을 복사해 교체를 막습니다.
- 격자 로봇 코딩테스트의 남쪽·서쪽 이동 벡터가 기존 사례에서 실행되지 않았습니다. 문제 리비전을 2로 올리고 두 방향 공개 테스트, 별도 결합 검증 사례와 해당 벡터를 뒤집은 대표 오답을 추가했습니다.
- Java 객관식은 교안의 오류 예시와 수정 방향을 그대로 활용하므로 새 문제로서의 자극은 낮습니다. 정답과 모든 오답 설명은 정확하며, 이는 정확성 결함이 아닌 향후 콘텐츠 다양화 항목으로 남깁니다.

## 실제 실행한 콘텐츠 검증

```bash
node --test \
  tests/quiz-content.test.js \
  tests/extension-content.test.js \
  tests/code-quest-content.test.js \
  tests/html-code-quest-content.test.js \
  tests/css-code-quest-content.test.js \
  tests/coding-test-content.test.js
```

위 명령은 52개 테스트가 모두 통과했습니다. 이어서 `npm run check`에서 콘텐츠 검증, 전체 자동 테스트 524/524와 정적 빌드가 통과했습니다. 2026-08-18 브라우저 검증에서는 HTML 문서 구조 기준 답안 6/6, 접근성 폼 기준 답안 6/6, CSS 반응형 기준 답안 5/5가 통과했습니다. `<!doctype html foo>`는 5/6, 여러 form에 컨트롤을 분산한 오답은 2/6, 비활성 `@supports` 안에 미디어 규칙을 중첩한 오답은 3/5로 실패했으며 각 실패 설명을 확인했습니다. 360px 1열·모바일 메뉴·가로 넘침 없음과 콘솔 warning/error 0건도 확인했습니다.

브라우저에 포함된 Quest·코딩테스트의 실행·제출 테스트는 모두 공개 테스트이며 이것이 학습자 결과에 사용하는 전체 사례입니다. 비공개·숨김 테스트나 원격 추가 채점을 사용하지 않습니다. 아래 기준 풀이·독립 사례·대표 오답 검증은 콘텐츠와 평가기를 확인하는 개발 증거이며 설치본의 학습자 답안에는 실행하지 않습니다.

## 2026-09-28 PR #32 알고리즘 교안·Java 코딩테스트 통합 검증

`[현재 사실]` 독립 콘텐츠 검토에서 신규 12개 경험 근거·연결·발췌와 반환 수정 대상 7개 교안을 PASS로 인수했다. 아래는 독립 실행·UI·감독 인계를 재사용한 기록이며 문서 담당이 같은 Java 실행을 반복하지 않았다. 이 검증 시점에는 PR이 미병합이었으며 원격 게시·정식 설치·다른 OS/브라우저 지원 완료를 뜻하지 않는다.

| 범위 | 실제 결과와 재사용 범위 |
| --- | --- |
| 브라우저 Java 17 기준 풀이 | 신규 12개·공개 method 그룹 32개 PASS. 1~5번의 변경되지 않은 정상 경로 증거를 재사용하고 6~12번은 최종 분류 helper로 실행했다. 문자열 문제 기준 풀이도 수정 후 재검했다. |
| 브라우저 시작 코드 | 신규 12개 모두 `wrong_answer`. |
| 브라우저 대표 오답 | 최종 문제별 선택 12개는 `wrong_answer` 11개·문자열 문제 `runtime_error` 1개. 빠른 거듭제곱의 선형 반복 오답은 별도 `timeout`으로 거부했고 이후 축약하지 않은 base 오답도 실제 `wrong_answer`로 확인했다. fixture 후보 36개 중 실제 14개를 실행했으며 나머지 22개는 미실행이다. |
| 로컬 Java 25 | 신규 기준 풀이 12개·32그룹·97 invocation PASS. 문제별 대표 오답 12개는 `wrong_answer` 11개·문자열 `runtime_error` 1개다. 후보 36개 중 나머지 24개와 시작 코드의 별도 Java 25 실행은 이 증거에 포함하지 않는다. |
| 감독·안전 | 로컬 감독 guard receipt 88개, 잔류 프로세스 0, guard closed를 인수했다. 브라우저 실패 분류 경계와 기존 bridge 오답·학습자 예외를 직접 확인했다. 준비 이후 실행 자산의 임의 네트워크 fallback은 추가하지 않았다. |
| 실제 제품 UI | 별도 Chrome 150 프로필의 신규 TreeMap 문제에서 run 1/1·submit 3/3, reload 후 원본 source·제출 상세 복원 PASS. 수정한 draft로 재준비·실행·취소 후 source 보존·취소 표시, reload 후 수정 draft와 이전 제출의 stale 경고 복원 PASS. RAM 준비 상태가 reload에 사라지는 기존 계약도 확인했고 page error는 0이었다. |

최초 실패를 성공 기록으로 덮어쓰지 않는다. 공식 runtime의 `tzdb.dat` 누락은 고정 자산 추가로 보완했다. optional bridge `LearnerFailure` 타입 직접 참조로 생긴 listener 실패와 authored의 직접 학습자 예외를 infrastructure로 분류하던 결함은 수정 후 실제 오답·예외 경계로 재검했다. 거듭제곱 선형 오답의 정상 timeout을 `wrong_answer`만 기대하던 개발 harness의 실패 문자열은 당시 receipt에 보존한다. 이 timeout을 숨기기 위해 성공 오답으로 바꿔 기록하지 않고 후속 오답 실행을 별도 증거로 구분한다.

기존 72개 전수, 전체 36개 대표 오답, 다른 브라우저·OS와 정식 설치는 이번 신규 PASS가 아니다. UI는 위 대표 문제 흐름의 검증이며 12개 전체 UI 순회로 확대하지 않는다. 학습자 채점은 문제에 공개된 JUnit만 사용하고 개발용 독립 사례를 숨은 채점으로 연결하지 않았다.

### 인수한 receipt

경로는 이번 개발 검증 증거의 위치이며 제품 실행에 필요한 경로가 아니다. 아래 SHA-256은 해당 인계 파일을 식별한다.

| 증거 파일 | SHA-256 |
| --- | --- |
| `/private/tmp/bam-pr32-independent-java-final.json` · 최종 독립 범위·판정 | `65300224259d83e2bd123dacf622f6656b7c7ad259aded2dd0bf938e8abc1529` |
| `/private/tmp/bam-pr32-native25-authored-result.json` | `b5416fe5d3a2a8dca4bbb31c8bc8217b38fcf6bf82e26f000a5bc3112a556b2b` |
| `/private/tmp/bam-pr32-browser-authored-result.json` · 최초 부분 실행·실패 보존 | `8f07c4f278a46803bed6a169c8beb63f85a1dc34fddf533bd54b62f274767bab` |
| `/private/tmp/bam-pr32-browser-authored-resume-result.json` · 후속 정상·timeout 보존 | `286843f15c5460ceb50169c502b042e0e0fa02a5eb19d03d3b3b39b1f536d5c8` |
| `/private/tmp/bam-pr32-runtime-classification-result.json` | `b7c291d4b4170079ba9e085163ed87395c9ea245e8b566aaa476ad05765311e8` |
| `/private/tmp/bam-pr32-browser-fastpower-wrong2-detail.json` | `754c580714e75c48c6b09971a14ab26e302e67050c634eafa12146f42c48d8cc` |
| `/private/tmp/bam-pr32-authored-ui-result.json` | `a6643e5294dd3ecc8bc62ea96b4111f65370a484b041b4c4fa86585b0e255a8d` |
| `/private/tmp/bam-pr32-authored-ui-cancel-result.json` | `36fabd7e81e7583b86fc82d9cbdb43c02c9bef1a74710f238aba2d77abbce55f` |
