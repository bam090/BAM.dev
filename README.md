# BAM.dev

BAM.dev는 프로그래밍 문법을 읽는 데서 멈추지 않고, 개념을 설명하고 직접 구현하며 한 명의 개발자로 성장하도록 돕는 학습 가이드입니다.

현재 구현 스냅샷에는 JavaScript·알고리즘·HTML·CSS 4개 기존 정식 과정, 원문을 가져온 **JavaScript 학습문서** 묶음과 Java 언어 독립성 검증 샘플이 있습니다. 전체 교안은 49개이며 기본 목록의 활성 교안 44개(JavaScript 7·반입 JavaScript 3·알고리즘 12·밤위키에서 파생한 HTML 15·CSS 6·Java 1)와 보관된 기존 HTML 5개를 구분합니다. 객관식 52문항(JavaScript 27·HTML 12·CSS 12·Java 1), Code Quest 18개(JavaScript 9·HTML 5·CSS 4), JavaScript 코딩테스트 6문제와 HTML·CSS Web Project 1개는 유지합니다. 구현 존재, MVP 완료와 Git 통합 상태는 서로 다른 판정이며 자세한 상태는 [제품 로드맵](docs/roadmap.md)을 따릅니다.

첫 화면에서 **학습문서로 이동** 또는 **객관식 문제 풀기**를 바로 선택합니다. 각 목록에서 과목과 키워드로 찾고, 문제는 한 문제씩 개별 채점합니다. 관련 개념을 확인하고 같은 탭의 학습문서를 다녀와도 선택·채점·해설·위치를 이어 갑니다. 전체 보기·전체 채점·모름·헷갈림은 후속 기능입니다.

Code Quest에서는 언어의 실제 작성 단위를 그대로 편집합니다. JavaScript는 함수를, HTML은 JavaScript 래퍼 없는 마크업을, CSS는 JavaScript 래퍼 없는 스타일시트를 작성합니다. HTML은 소스를 실행하지 않고 inert DOM과 doctype을 공개 검사하며, CSS는 안전 검사를 통과한 고정 HTML fixture에 스타일을 적용해 CSSOM 규칙·미디어 조건·계산 스타일을 공개 검사합니다. Web Project에서는 HTML과 CSS 두 파일을 함께 편집하고 안전 미리보기, 공개 자동 검사 70점과 자가평가 30점으로 결과를 점검합니다. 코딩테스트의 `테스트 실행`과 `제출 및 채점`을 포함해 브라우저에 전달되는 모든 테스트와 assertion은 공개됩니다.

[확정 결정 기록](docs/roadmap.md#2026-08-29-확정-제품-결정)에 따른 목표 제품은 서버를 운영하지 않고 설치해 쓰는 로컬 프로그램입니다. Code Quest와 코딩테스트는 서로 다른 학습 목적·화면·진도를 유지하고, 학습자 결과에는 설치본에 포함된 공개 테스트만 사용하며, 웹과제는 별도 Git 실습 폴더에서 수행합니다. 설치 앱과 Code Quest의 새 탐색 UI는 목표 설계이지 현재 구현 완료가 아닙니다. 자세한 적용 범위는 [제품 범위](docs/product-scope.md)를 따릅니다.

## 현재 개발 실행

현재 구현을 실행하려면 Node.js 20 이상이 필요합니다. 현재 화면은 HTML·CSS·Vanilla JavaScript이고 React·TypeScript나 전용 프런트엔드 빌드 의존성은 없습니다. 외부 운영 서버나 외부 패키지는 사용하지 않지만, 아직 설치 앱이 아니며 개발용 로컬 HTTP 서버를 엽니다. 목표 프런트엔드는 React·TypeScript를 작은 화면 경계부터 단계적으로 도입하며 정확한 도구체인과 첫 이관 범위는 아직 결정되지 않았습니다.

`npm run dev`의 기본 주소는 `http://localhost:4173`입니다. 이전 복습 기록을 `http://localhost:4175`에서 저장했다면 아래 명령으로 같은 주소를 사용합니다. 다른 서버가 포트를 사용 중이면 종료하거나 덮어쓰지 않습니다.

```bash
cd "/Users/goonbam/Documents/ChatGPT/bam dev"
BAM_DEV_PORT=4175 npm run dev
```

브라우저에서 [BAM.dev 홈](http://localhost:4175/#/)을 엽니다. 서버가 이미 실행 중이면 같은 주소만 열면 됩니다. 실행을 종료하려면 실행한 터미널에서 `Ctrl+C`를 누르고, 다시 사용할 때 같은 명령과 주소를 사용합니다. `localhost`와 `127.0.0.1`, 다른 포트·브라우저 프로필은 풀이 기록 저장소가 서로 다릅니다.

2026-09-12 첫 사용 미리보기는 [localhost:4189](http://localhost:4189/#/)에서 엽니다. 필요하면 `BAM_DEV_PORT=4189 npm run dev`로 실행합니다. 이 주소의 기록은 이전 `localhost:4175` 기록과 자동 합쳐지지 않으므로 이어서 사용할 때 같은 주소·브라우저 프로필을 유지합니다.

## 바로 복습하기

[홈](http://localhost:4175/#/)에서 [학습문서 목록](http://localhost:4175/#/learn)과 [객관식 문제 목록](http://localhost:4175/#/review)으로 독립적으로 이동합니다. HTML은 밤위키 승인 교안에서 필요한 개념을 나눈 새 문서를 기본 목록에 제공합니다. 기존 HTML 5개의 URL·진도는 보존하고, 새 문서에는 해당 핵심 질문의 직접답과 실제 연결된 객관식만 제공합니다. 기존 HTML 12문항 중 10개는 새 문서로 연결하며 DOM 중첩·`strong`/`em` 2개는 기존 문서 연결을 유지합니다. 직접 연결할 문제가 없는 문서는 준비 중임을 안내합니다. 구현·독립 검증의 구분은 [HTML 작업 카드](docs/work-items/2026-09-13-html-concept-lessons.md)를 따릅니다.

아래 JavaScript 원문 3개·13문항·개념 발췌 9개는 **앞선 첫 사용 작업의 범위**이며 현재 전체 공급량이나 HTML 반입 범위가 아닙니다. 다음 링크는 `localhost:4175` 서버가 실행 중일 때 사용할 수 있으며 미리보기에서도 같은 해시 경로로 열 수 있습니다.

| 단원 | 바로 열기 | 문항 | 확인하는 판단 |
| --- | --- | --- | --- |
| 값과 실행 흐름 | [문서 읽기](http://localhost:4175/#/learn/javascript-notes/values) · [문제 풀기](http://localhost:4175/#/review/javascript/js-notes-values) | 4 | const 속성 변경, 문자열 연결, switch 종료, 반복 경계 |
| 함수 | [문서 읽기](http://localhost:4175/#/learn/javascript-notes/functions) · [문제 풀기](http://localhost:4175/#/review/javascript/js-notes-functions) | 5 | 출력과 반환, 조기 반환, 동기 콜백, 화살표 반환, 함수의 외부 상태 변경 |
| 배열과 객체 | [문서 읽기](http://localhost:4175/#/learn/javascript-notes/collections) · [문제 풀기](http://localhost:4175/#/review/javascript/js-notes-collections) | 4 | filter→map 순서, find 미일치, 객체 공유, 키와 값 순회 |

객관식 목록에서 키워드·단원을 선택해 바로 시작하거나 문서의 **이 단원 객관식 풀기**로 이동합니다. 답을 고르고 **정답 확인**을 누르면 정답과 선택한 오답의 이유를 먼저 보고 다른 보기의 해설을 펼칠 수 있습니다. **관련 개념 → 학습문서에서 자세히 보기 → 문제로 돌아가기**로 같은 탭에서 왕복하며 선택·채점·펼친 해설·현재 문제·위치를 유지합니다. 문서를 직접 열었을 때는 문제 복귀 버튼이 없습니다.

진행 중 풀이는 홈·문제 목록의 **이어서 풀기**와 같은 주소의 새로고침으로 복구합니다. **다음 문제 → 결과 보기**까지 마친 기록은 기존 최근 완료 결과와 저장된 오답 다시 풀기에 남습니다. 발췌가 없는 문제의 오버레이에서는 기존 **관련 학습문서 요약**을 표시합니다. 연결된 문항이 없거나 검색 결과가 없으면 빈 상태와 다음 동작을 안내합니다.

앞선 JavaScript 원문의 모든 개념을 13문항으로 평가하는 것은 아닙니다. 그 원문에서 언급하는 후속 04·05 단원과 나머지 JavaScript Obsidian 문서는 해당 첫 사용 작업에 반입하지 않았습니다. 객관식 정답률은 독립 구현 능력·완전한 숙련을 인증하지 않습니다. JavaScript 원문별 해시·기존 문항 근거는 [이전 콘텐츠 기록](docs/content-reviews/2026-09-09-local-review.md), 개념 발췌의 원문·연결 근거는 [발췌 접수 기록](docs/content-reviews/2026-09-12-review-excerpts.md), 당시 검증과 범위는 [첫 사용 작업 카드](docs/work-items/2026-09-12-independent-review-first-use.md)를 참고합니다.

## 검증하기

```bash
npm run check
```

이 명령은 콘텐츠 스키마와 파일 연결을 검증하고, 단위 테스트를 실행한 뒤 `dist/` 빌드 결과를 만듭니다.

## 프로젝트 구조

```text
content/                 언어 비종속 메타데이터, 교안·fixture, 객관식·Quest·코딩테스트·Web Project
src/core/                콘텐츠·내비게이션·평가 도메인 로직
src/grading/             Worker 및 inert DOM·CSSOM 기반 Quest·코딩테스트 채점 어댑터
src/repositories/        사용자 진도 저장소 추상화와 localStorage 구현
src/ui/                  안전한 제한형 Markdown·평가 화면 렌더러
src/workers/             공개 JavaScript 테스트를 실행하는 일회성 Worker
styles/                  디자인 토큰과 반응형 앱 UI
scripts/                 로컬 서버, 콘텐츠 검증, 정적 빌드
tests/                   Node 내장 테스트 러너 기반 단위 테스트
docs/                    아키텍처·결정·참고자료 기록
```

문서의 정본과 작업별 읽기 순서는 [문서 지도](docs/README.md)에서 시작합니다. 현재 설계는 [아키텍처 문서](docs/architecture.md), 콘텐츠 데이터 형식은 [콘텐츠 스키마](docs/content-schema.md), 제품 범위와 단계는 [MVP 범위](docs/product-scope.md)와 [로드맵](docs/roadmap.md)을 참고합니다. 교안은 [교안 작성 계약](docs/lesson-authoring.md), 목표 제품 경계는 [시각 시스템](docs/designs/visual-design.md), [Code Quest](docs/designs/code-quest.md), [코딩테스트](docs/designs/coding-test.md), [설치형 앱](docs/designs/local-application.md), [외부 웹과제](docs/designs/web-assignments.md)가 담당합니다.

## 저장 정책

학습 완료, 최근 교안, 최근 객관식 시도 20개, 오답 재도전 대상, Quest 초안 20개와 최근 실행 50개·완료 ID, 코딩테스트 초안 20개와 최근 제출 50개·리비전별 완료 상태는 현재 `bam.dev.progress.v1` 키로 `localStorage`에 저장됩니다. Web Project는 별도 `bam.dev.web-projects.v1` 키에 최근 초안 10개와 source를 제외한 제출 요약 20개를 저장합니다. 사용자 소스는 실행·제출 기록에 중복 저장하지 않고 초안 저장소에만 보관합니다. 진행 중 객관식 세션 하나는 별도 `bam.dev.review-session.v1` 키에 저장합니다. 화면 코드는 저장소 구현 뒤에서만 브라우저 저장소를 사용합니다. 설치형 전환에서도 저장소 인터페이스와 기존 데이터를 보존하며 정확한 백업·복구 방식은 아직 결정하지 않았습니다. 브라우저 저장소가 차단되면 현재 탭의 메모리 저장소로 계속 동작하고 비영속 상태를 화면에 알립니다.

객관식은 **결과 화면까지 완료한 최근 시도 20개**와 **진행 중 세션 하나**를 분리해 저장합니다. 진행 중 선택·채점·해설·위치는 같은 주소·브라우저 프로필에서 복구하며 결과를 다시 열어도 완료 기록을 중복 추가하지 않습니다. 새로운 범위를 풀면 활성 세션은 그 범위로 바뀌므로 이전 미완료 범위를 이어가려면 먼저 **이어서 풀기**를 선택합니다. 문제 변경·손상된 저장 내용·다른 탭 변경은 안내를 확인하고 복구 또는 새 시작을 선택합니다. 사이트 데이터 삭제·저장 실패·메모리 모드에서는 재접속 복구를 보장하지 않습니다. 준비된 문서·문항은 프로젝트의 정적 파일이며, 앱 실행 중 옵시디언·외부 API에서 가져오지 않습니다.

## 참고 자료

UI 참고 코드에서는 구조, 색상, 간격, 사용자 흐름만 분석했습니다. 사용자가 직접 만든 Code Quest에서는 과정·주제·진도·문제 탐색기와 학습 지도 구조를 참고하되 원본 React 코드·서버·데이터베이스·비노출 테스트 계약은 가져오지 않습니다. BAM.dev의 별도 React·TypeScript 목표 결정은 [제품 로드맵](docs/roadmap.md#2026-09-04-확정-제품-결정)을 따릅니다. JavaScript 교안은 사용자가 제공한 읽기 전용 학습자료를 프로젝트 내부에 복제한 뒤, 오프라인 실행·접근성·설명 정확성을 위해 필요한 부분만 보완했습니다. 새 HTML 개념 문서는 **AI 집필·밤 승인(2026-09-02)**인 밤위키 교안에서 파생했으며 원문 구간·전체 해시·재구성 범위는 [HTML 작업 카드](docs/work-items/2026-09-13-html-concept-lessons.md)에 기록합니다. 기존 HTML 보관 교안과 CSS 교안은 WHATWG·W3C·MDN 표준 및 가이드, Java 샘플은 언어 명세를 근거로 프로젝트에서 작성한 별도 자료입니다. 앞선 원본·변경 내용과 프로젝트 문제·기준 답안·대표 오답 fixture의 출처는 [참고자료 감사 기록](docs/reference-audit.md)에 남겼습니다.
