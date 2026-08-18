# 02. 텍스트 의미와 링크

## 학습 목표

- 제목, 문단, `strong`, `em`을 보이는 모양이 아니라 의미에 따라 선택할 수 있습니다.
- `href`가 있는 `a` 요소가 이동할 목적지를 나타낸다는 것을 설명할 수 있습니다.
- 절대 URL, 상대 URL, 문서 내부 fragment 링크를 구분할 수 있습니다.
- 링크만 따로 읽어도 목적을 예측할 수 있는 문구를 작성할 수 있습니다.

## 45분 학습 순서

1. 5분: 모양만 같은 두 마크업을 비교합니다.
2. 12분: 제목·문단·강조의 의미를 구분합니다.
3. 15분: URL과 `href`가 연결되는 방식을 연습합니다.
4. 8분: 링크 문구와 새 창 사용을 점검합니다.
5. 5분: 확인 문제에 답합니다.

## 먼저 관찰하기

다음 두 코드는 CSS를 적용하면 비슷하게 보일 수 있습니다.

```html
<div class="large">HTML 학습 기록</div>
<div>오늘은 <span class="bold">링크</span>를 배웠습니다.</div>
```

```html
<h1>HTML 학습 기록</h1>
<p>오늘은 <strong>링크</strong>를 배웠습니다.</p>
```

화면을 보지 않고 코드만 읽는다면 어느 쪽에서 제목, 문단, 중요한 단어를 더 쉽게 찾을 수 있나요? HTML에서는 “어떻게 보이는가”보다 “이 내용이 어떤 역할인가”를 먼저 표현합니다.

## 텍스트 구조에 의미 붙이기

### 제목과 문단

`h1`부터 `h6`까지는 문서의 제목 계층을 나타냅니다. `p`는 하나의 문단을 나타냅니다.

```html
<h1>부산 여행 기록</h1>

<h2>첫째 날</h2>
<p>오전에는 해운대 해변을 걸었습니다.</p>

<h2>둘째 날</h2>
<p>미술관에서 전시를 관람했습니다.</p>
```

빈 줄이나 큰 글자만으로는 문서 구조가 생기지 않습니다. 콘텐츠의 상위·하위 관계에 맞는 제목과 실제 문단 요소를 사용합니다.

### `strong`과 `em`

```html
<p>출발 전에는 <strong>신분증을 반드시 확인하세요.</strong></p>
<p>저는 바다가 <em>정말</em> 보고 싶었습니다.</p>
```

- `strong`은 내용의 강한 중요성이나 긴급함을 나타냅니다.
- `em`은 문장에서 강세를 두어 의미를 달리 읽게 합니다.

두 요소의 기본 모양은 브라우저마다 굵게 또는 기울임꼴로 보일 수 있지만, 모양만을 위해 선택하지 않습니다. 시각적 표현만 바꾸려면 CSS를 사용합니다.

## `a`와 `href`로 목적지 연결하기

`a` 요소에 `href`가 있으면 사용자가 활성화하여 다른 자원이나 현재 문서의 위치로 이동할 수 있는 하이퍼링크가 됩니다.

```html
<a href="https://html.spec.whatwg.org/">HTML 표준 보기</a>
```

`href`가 없는 `a`는 이동할 목적지가 없는 placeholder입니다. 실제 이동 기능이 필요하다면 유효한 목적지를 `href`에 제공합니다. 현재 페이지에서 동작을 실행하려는 경우에는 링크 모양을 흉내 낸 요소보다 `button`이 더 알맞을 수 있습니다.

## URL 세 가지 구분하기

### 절대 URL

프로토콜과 호스트를 포함한 전체 주소입니다.

```html
<a href="https://developer.mozilla.org/ko/">MDN Web Docs 방문</a>
```

### 상대 URL

현재 문서의 URL을 기준으로 목적지를 계산합니다.

```html
<a href="notes/html.html">HTML 학습 노트 보기</a>
<a href="../index.html">학습 홈으로 돌아가기</a>
```

`notes/html.html`의 실제 목적지는 현재 문서가 어느 경로에 있는지에 따라 달라집니다. 파일을 옮길 때 상대 경로도 함께 점검해야 합니다.

### 문서 내부 fragment

`#` 뒤의 값은 같은 문서 안에서 일치하는 `id`를 가진 요소를 가리킵니다.

```html
<a href="#schedule">주간 일정으로 이동</a>

<h2 id="schedule">주간 일정</h2>
```

fragment 링크가 동작하려면 목적지 `id`가 실제로 존재해야 하며, 같은 문서에서 같은 `id`를 중복해서 사용하지 않습니다.

## 목적을 설명하는 링크 문구

화면 낭독기 사용자는 링크만 모아서 탐색할 수 있고, 모든 사용자는 문장을 훑어보며 목적지를 예측합니다.

```html
<!-- 목적을 알기 어려움 -->
<p>HTML 복습 자료를 보려면 <a href="review.html">여기</a>를 누르세요.</p>

<!-- 링크만 읽어도 목적을 예측할 수 있음 -->
<p><a href="review.html">HTML 복습 자료 보기</a></p>
```

“클릭”, “더 보기”처럼 문맥이 사라지면 뜻을 알기 어려운 표현을 반복하지 않습니다. 링크 문구는 목적지나 수행 결과를 구체적으로 설명합니다.

`target="_blank"`는 새 브라우징 맥락을 열 수 있어 사용자의 현재 탐색 흐름을 바꿉니다. 꼭 필요한 상황인지 먼저 판단하고, 사용한다면 새 창이나 새 탭에서 열린다는 사실을 문구로 안내하는 방식을 고려합니다.

## 직접 판단하기

```html
<article>
  <h1>이번 주 학습</h1>
  <p><strong>폼과 접근성</strong>을 먼저 복습합니다.</p>
  <p><a href="forms.html">폼과 접근성 복습 교안 열기</a></p>
  <p><a href="#practice">실습으로 이동</a></p>

  <section id="practice">
    <h2>실습</h2>
    <p>목적을 설명하는 링크 문구를 작성해 보세요.</p>
  </section>
</article>
```

다음을 설명해 보세요.

- `strong`으로 표시한 내용이 중요한 이유는 무엇인가요?
- 두 링크의 목적지는 어떤 기준으로 계산되나요?
- fragment 링크와 실제 `id`가 일치하나요?

## 흔한 혼동

- 글자를 크게 만들기 위해 제목 단계를 선택합니다. 제목 단계는 콘텐츠 계층으로 정하고 크기는 CSS로 조절합니다.
- 굵게 보이게 하려는 이유만으로 모든 문장을 `strong`으로 감쌉니다.
- 목적지가 필요한 링크에서 `href`를 빼고 클릭 이벤트에만 의존합니다.
- 현재 파일의 위치를 고려하지 않고 상대 URL을 복사합니다.
- fragment 링크의 값과 목적지 `id`를 다르게 작성합니다.
- 모든 링크 문구를 “여기”나 “더 보기”로 작성합니다.

## 확인 문제

1. `strong`과 단순한 굵은 글자 모양은 어떤 차이가 있나요?
2. `/guide/html.html` 문서에서 `href="practice/forms.html"`은 어떤 기준으로 계산되나요?
3. `href="#contact"`가 이동하려면 문서 안에 어떤 값이 필요하나요?
4. “여기 클릭”보다 “HTML 설치 안내 보기”가 더 나은 링크 문구인 이유를 설명해 보세요.
5. 다른 페이지로 이동하는 링크와 현재 페이지에서 메뉴를 여는 동작에는 각각 `a`, `button` 중 무엇이 더 알맞은가요?

## 공식 자료

- [WHATWG HTML Standard: `a` 요소와 텍스트 수준 의미](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- [WHATWG HTML Standard: 링크와 URL](https://html.spec.whatwg.org/multipage/links.html)
- [WHATWG HTML Standard: `strong` 요소](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-strong-element)
- [WHATWG HTML Standard: `em` 요소](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-em-element)
- [W3C WAI: 링크 목적 이해하기](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)

공식 자료 확인일: 2026-08-18
