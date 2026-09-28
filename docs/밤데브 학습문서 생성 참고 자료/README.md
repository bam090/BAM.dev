# 밤데브 학습문서 생성 참고 자료

공개 교육 페이지의 설명 구조와 학습 흐름을 살펴본 조사 메모다. 아래 적용 아이디어는 검토 후보이며, 채택된 교안 작성 규칙이나 기존 교안의 수정 지시가 아니다. 외부 페이지의 문구·그림·코드를 복사하지 않고 설명 방식만 참고한다.

확인일: 2026-09-24

## 우선 참고할 4개

1. [LearningJavaScript.org — Async and Promises](https://learningjavascript.org/lessons/08-async-and-promises): 출력 예측, 원인 가설, 직접 구현으로 이어지는 흐름.
2. [University of Helsinki Java Programming MOOC — Printing](https://java-programming.mooc.fi/part-1/2-printing/): 한 줄 코드와 출력에서 실행 가능한 전체 프로그램으로 확장하는 설명.
3. [Understand JS — Functions](https://understandjs.dev/functions): 하나의 상점 예시를 이어 쓰며 실행 단계와 변수 변화를 보여주는 방식.
4. [The Odin Project — JavaScript 강좌 목차](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript): DOM·비동기·테스트·자료구조 등의 개념과 프로젝트를 연결하는 순서. 개별 교안이 아닌 강좌 목차다.

## 문체 참고 (조사 메모)

밤데브 교안의 말투가 AI처럼 느껴진다는 사용자 피드백이 있었다. [함수·스코프·클로저](../../content/lessons/javascript/functions-scope-closure.md), [async·await와 실패 처리](../../content/lessons/javascript/wiki-async-await.md), [타입과 변수의 값](../../content/lessons/java/wiki-types-variables.md)은 목표·요약·정의를 빠르게 제시해 명확하다. 다만 정의와 규칙을 비슷한 문장 형태로 연달아 설명하는 부분에서는 학습자가 처한 상황과 직접 해 볼 행동이 뒤로 밀릴 수 있다.

- [LearningJavaScript.org 비동기 교안](https://learningjavascript.org/lessons/08-async-and-promises)은 데이터 로딩 중 화면이 멈춘다는 장면에서 시작해 출력 예측과 실패 원인 질문으로 설명을 이끈다. 다만 페이지가 길고 정리 상자 등 반복 형식도 있다.
- [Helsinki Java 출력 교안](https://java-programming.mooc.fi/part-1/2-printing/)은 한 줄 코드와 출력을 바로 붙이고, 초보자의 오류를 자연스러운 학습 과정으로 다루는 담담한 어조가 눈에 띈다.
- [Understand JS 함수 교안](https://understandjs.dev/functions)은 앞서 다룬 상품 가격 변수에서 같은 상점 상황을 이어 가며, 함수의 역할을 행동으로 드러내는 소제목과 변수 상태를 보라는 안내를 쓴다.
- [The Odin Project Block and Inline 교안](https://www.theodinproject.com/lessons/foundations-block-and-inline)은 앞 교안과 학습자가 만든 Recipe 페이지를 다시 불러오고, 처음부터 보기 좋게 만들 필요는 없다고 부담을 낮춘다. 위의 [JavaScript 강좌 목차](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript)는 문체 분석 대상이 아니다.

다음 교안 작업에서 검토할 방향은 필수 의미 구조를 유지하면서 실제 장면이나 문제로 도입하고, 같은 예시를 이어 쓰며, 학습자가 관찰할 행동을 직접 말하는 것이다. 정의·요약·격려를 같은 형태로 반복하는 부분은 줄인다. 외부 글의 문장을 번역하거나 코드·그림을 복사하지 않는다. 이는 문체 참고 후보이며 확정된 교안 작성 규칙이 아니다.

## 1. Interneting Is Hard — Basic Web Pages

- **주제·링크:** [HTML로 기본 웹페이지 만들기](https://internetingishard.netlify.app/html-and-css/basic-web-pages/)
- **확인한 방식:** `<title>`, 문단, 제목, 목록을 작은 변경으로 차례로 추가한다. 각 변경 뒤에 브라우저에서 보이는 결과 그림을 두고, 화면에 보이지 않는 `<title>`은 탭에서 확인하도록 알려 준다.
- **밤데브 적용 아이디어:** 긴 완성 코드 전에 요소 하나를 추가하는 짧은 예제를 두고, 바로 아래에 예상 화면과 관찰할 위치를 붙인다. HTML 의미 구조 교안이라면 `header`나 `nav`를 추가한 직후 DOM 구조와 화면에서 확인할 점을 연결할 수 있다.
- **주의점:** 편집기 안내 등 작성 시점의 도구 설명은 그대로 따르지 않는다. 단계와 결과를 가까이 배치하는 설명 방식만 참고한다.

## 2. Josh W. Comeau — An Interactive Guide to Flexbox

- **주제·링크:** [Flexbox의 배치 원리를 조작하며 살펴보는 글](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/)
- **확인한 방식:** 긴 글 앞에 세부 목차를 두고, `flex-direction`, 정렬, 크기 증가·축소를 각각 조작하는 예시로 설명한다. 컨테이너 너비나 속성 값을 바꿀 때 배치가 어떻게 달라지는지 같은 자리에서 관찰하게 한다.
- **밤데브 적용 아이디어:** CSS 교안에서 한 예제의 조건을 하나씩 바꾼 전후 결과를 나란히 놓고, 결과를 보기 전에 ‘어느 요소가 어디로 이동할까?’를 예상하게 한다. 글이 길다면 개념별로 관찰 지점을 짧게 끊고 목차에서 원하는 부분으로 이동하게 한다.
- **주의점:** 원문은 분량이 길고 일부 시연이 큰 화면에 적합하다고 안내한다. 밤데브에는 짧은 예시와 작은 화면에서도 읽히는 결과 표시를 검토한다.

## 3. The Odin Project — Block and Inline

- **주제·링크:** [CSS의 block·inline 배치 방식](https://www.theodinproject.com/lessons/foundations-block-and-inline)
- **보조 링크:** [JavaScript 강좌 목차](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript) — 개별 교안이 아니라 개념과 프로젝트의 배치 순서를 확인하는 자료.
- **확인한 방식:** 이전 교안과 연결하는 도입, 이번에 배울 항목, 짧은 개념 설명과 예시, 과제 순서로 이어진다. 과제에서는 앞서 만든 Recipe 페이지에 CSS를 추가하도록 해 새 개념을 기존 결과물에 적용하게 한다.
- **밤데브 적용 아이디어:** 교안 마지막에 막연한 새 과제 대신 앞선 결과물의 구체적인 부분을 수정하게 하고, 적용한 속성이나 요소가 만든 변화를 자신의 말로 설명하도록 안내한다.
- **주의점:** 원문 과제의 상당 부분은 외부 읽을거리와 CodePen·GitHub 실습을 사용한다. 밤데브의 오프라인 학습 흐름에 적용할 때는 필요한 설명·예시·확인 방법을 교안이나 설치본 안에서 제공해야 한다.

## 4. LearningJavaScript.org — Async and Promises

- **주제·링크:** [JavaScript 비동기 처리와 Promise](https://learningjavascript.org/lessons/08-async-and-promises)
- **확인한 방식:** `setTimeout` 예제에서 출력 순서를 먼저 예측하게 한 뒤 이유를 설명한다. 콜백 연결 예제에서는 멈추는 원인을 수정 전에 가설로 적게 하고, 끝에서는 빈 비동기 함수 세 개를 직접 구현하며 배운 내용을 응용한다.
- **밤데브 적용 아이디어:** 이벤트 루프 교안의 코드 옆에 ‘실행 전에 출력 순서를 적기 → 실제 결과와 비교하기 → 차이가 난 이유를 설명하기’를 붙인다. 비동기 흐름의 오류 예제에는 수정 전 원인 가설을 쓰게 하고, 마지막에 작은 구현 과제로 이어갈 수 있다.
- **주의점:** 한 페이지에서 콜백부터 `async/await`와 구현 과제까지 다뤄 분량이 길다. 밤데브에는 한 교안의 핵심 질문에 필요한 부분만 골라 짧게 적용한다.

## 5. Understand JS — Functions

- **주제·링크:** [JavaScript 함수의 선언·인자·반환·스코프](https://understandjs.dev/functions)
- **확인한 방식:** 상품 가격과 상점 예시를 이어 쓰면서 함수 선언에서 콜백까지 확장한다. 각 절의 코드에는 다음 단계 버튼과 변수 상태 표시가 있고, 끝에는 해당 절의 핵심을 짧은 목록으로 정리한다.
- **밤데브 적용 아이디어:** 함수·스코프 교안에서 예시 상황을 유지하며 입력값과 반환값만 단계적으로 바꾼다. 각 실행 단계에 현재 줄, 변수 값, 출력 결과를 가까이 보여주고 절 끝에 학습자가 자신의 말로 정리할 핵심 질문을 둘 수 있다.
- **주의점:** 단계별 실행 화면을 그대로 구현하는 데 목적을 두지 않는다. 같은 예시의 연속성과 변수 변화의 가시성을 교안 형식과 구현 범위에 맞게 검토한다.

## 6. University of Helsinki Java Programming MOOC — Printing

- **주제·링크:** [Java에서 문자열 출력하기](https://java-programming.mooc.fi/part-1/2-printing/)
- **확인한 방식:** 학습 목표를 먼저 보여준 뒤 `System.out.println` 한 줄과 실제 출력을 바로 붙인다. 이후 이 한 줄이 들어갈 `class`·`main`의 전체 프로그램 형태를 제시하고, 점·따옴표·세미콜론을 빠뜨리는 초보자의 흔한 오류를 설명한다.
- **밤데브 적용 아이디어:** Java 교안에서 먼저 관찰할 한 줄과 출력을 보여주고, 곧이어 실행 가능한 전체 Java 파일에서 그 줄의 위치를 표시한다. 컴파일 오류 예시는 잘못된 문자와 오류가 발생하는 위치를 함께 확인하게 할 수 있다.
- **주의점:** 원문의 TMC·NetBeans 실행 방법은 해당 과정의 편집기 환경에 묶여 있다. 밤데브의 Java 실행 계약에 맞는 안내만 별도로 작성한다.

## 7. 캡틴판교 — 이벤트 버블링, 이벤트 캡처 그리고 이벤트 위임까지

- **주제·링크:** [브라우저 이벤트 전파와 위임](https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/)
- **확인한 방식:** 처음에 배울 항목을 밝히고, 중첩된 `div`의 같은 클릭 예제로 버블링과 캡처의 실행 순서를 비교한다. 이어 할 일 목록에 동적 항목을 추가했을 때 기존 리스너가 작동하지 않는 문제를 보여준 뒤, 상위 요소의 이벤트 위임으로 해결한다. 끝에는 체크박스 이벤트만 감지하도록 바꾸는 작은 도전을 남긴다.
- **밤데브 적용 아이디어:** DOM 이벤트 교안에서 동일한 HTML을 유지한 채 리스너 옵션만 바꾸고 출력 순서를 나란히 보여준다. 이어 새 항목 추가로 실패를 먼저 관찰한 다음, 이벤트 위임을 적용하고 학습자가 `event.target`을 확인해 대상 요소를 구분하도록 안내할 수 있다.
- **주의점:** 예제의 문제 상황과 해결 흐름을 참고하되 긴 코드 전체를 한 번에 제시하지 않는다. 이벤트 전파와 대상 판별을 별도 관찰 지점으로 나눌지 검토한다.

## 8. HEROPY — CSS Flex 완벽 가이드

- **주제·링크:** [Flex Container와 Item의 속성·축·정렬](https://www.heropy.dev/p/Ha29GI)
- **확인한 방식:** 먼저 Container와 Item의 역할 및 적용 속성을 그림으로 구분한다. 속성별 의미와 기본값은 표로 찾기 쉽게 정리하고, 주 축·교차 축과 시작점·끝점은 방향별 그림으로 설명한다.
- **밤데브 적용 아이디어:** CSS Flex 교안의 첫 화면에 ‘부모 Container에 주는 속성 / 자식 Item에 주는 속성’을 짧은 도식과 표로 보여준다. 정렬 예제에는 현재 주 축·교차 축만 표시해 `justify-content`와 `align-items`를 선택할 단서를 줄 수 있다.
- **주의점:** 사용자는 이미지가 큰 영역을 차지해 글의 가독성이 떨어질 수 있다고 평가했다. 밤데브에서는 그림 수와 크기를 줄이고, 각 그림을 바로 설명하는 코드·문장과 가깝게 배치하는 방향을 검토한다.
