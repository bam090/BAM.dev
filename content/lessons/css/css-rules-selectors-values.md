# CSS 규칙·선택자·상속과 단위

## 학습 목표

- CSS 규칙을 선택자, 속성, 값으로 나누어 읽을 수 있습니다.
- 외부 스타일시트를 HTML 문서에 연결하고 경로를 확인할 수 있습니다.
- 타입·클래스·ID·속성 선택자와 주요 결합자의 차이를 설명할 수 있습니다.
- 상속되는 값과 상속되지 않는 값을 구분해 개발자 도구에서 확인할 수 있습니다.
- `px`, `%`, `em`, `rem`이 무엇을 기준으로 계산되는지 설명할 수 있습니다.

## 먼저 관찰하기

다음 HTML과 CSS를 읽고 어떤 문장이 파란색이 될지 먼저 예상해 보세요.

```html
<article class="notice">
  <h2 class="notice__title">학습 알림</h2>
  <p class="notice__message">복습할 내용이 있습니다.</p>
</article>
```

```css
.notice {
  color: royalblue;
}

.notice__title {
  font-size: 1.5rem;
}
```

`.notice` 규칙은 `article`을 선택합니다. `color`는 기본적으로 상속되는 속성이므로 제목과 문단도 파란색 글자를 사용합니다. 반면 부모에 `padding`이나 `border`를 지정해도 그 값이 자식에게 자동으로 상속되지는 않습니다.

## CSS 규칙 읽기

```css
.notice {
  color: royalblue;
  padding: 1rem;
}
```

- `.notice`: 어떤 요소에 규칙을 적용할지 정하는 **선택자**
- `{ ... }`: 선언을 모아 둔 **선언 블록**
- `color: royalblue;`: 하나의 **선언**
- `color`: 바꾸려는 **속성**
- `royalblue`: 속성에 전달하는 **값**

콜론은 속성과 값을 나누고 세미콜론은 선언을 나눕니다. 브라우저는 이해하지 못하는 속성이나 유효하지 않은 값을 만났을 때 보통 스타일시트 전체를 멈추지 않고 해당 선언을 무시합니다. 따라서 오류 창만 기다리지 말고 개발자 도구의 Styles 패널에서 선언이 인식됐는지 확인해야 합니다.

## 외부 스타일시트 연결하기

HTML의 `head`에서 CSS 파일을 연결합니다.

```html
<link rel="stylesheet" href="./styles.css" />
```

`href`는 현재 HTML 문서 위치를 기준으로 해석됩니다. CSS가 전혀 적용되지 않는다면 선택자를 고치기 전에 다음을 확인하세요.

1. 파일 이름과 대소문자가 실제 경로와 같은가?
2. 브라우저 Network 패널에서 CSS 요청이 성공했는가?
3. HTML에 작성한 `class`와 CSS 선택자의 이름이 같은가?

외부 파일을 사용하면 여러 문서가 같은 디자인 규칙을 공유하고 HTML의 구조와 CSS의 표현 책임을 나눌 수 있습니다.

## 기본 선택자

### 타입·클래스·ID 선택자

```css
p {
  line-height: 1.6;
}

.notice {
  padding: 1rem;
}

#main-title {
  scroll-margin-top: 2rem;
}
```

- 타입 선택자 `p`는 같은 요소 이름을 가진 모든 문단과 일치합니다.
- 클래스 선택자 `.notice`는 `class="notice"`인 여러 요소에 재사용할 수 있습니다.
- ID 선택자 `#main-title`은 `id="main-title"`인 문서 내 고유 요소와 일치합니다.

스타일은 역할과 상태를 조합하기 쉬운 클래스를 중심으로 작성하는 편이 관리하기 쉽습니다. ID는 문서 내 링크나 고유한 연결이 필요한 곳에 사용하고, 같은 ID를 여러 요소에 반복하지 않습니다.

### 속성 선택자

```css
input[required] {
  border-color: tomato;
}

input[type="email"] {
  background-color: aliceblue;
}
```

첫 규칙은 `required` 속성의 존재를, 둘째 규칙은 `type` 속성값을 확인합니다.

### 한 요소의 여러 조건과 후손을 구분하기

```html
<article class="card featured">
  <h2 class="featured">추천 과정</h2>
</article>
```

```css
.card.featured {
  border-color: royalblue;
}

.card .featured {
  color: royalblue;
}
```

`.card.featured`에는 공백이 없습니다. 두 클래스를 동시에 가진 같은 `article`과 일치합니다. `.card .featured`에는 공백이 있으므로 `.card` 안쪽의 별도 `.featured` 요소와 일치합니다.

### 요소 관계를 표현하는 결합자

```css
.card p { /* 모든 단계의 후손 p */ }
.card > h2 { /* 바로 아래 자식 h2 */ }
h2 + p { /* h2 바로 다음 형제 p */ }
h2 ~ p { /* h2 뒤에 오는 형제 p들 */ }
```

HTML 구조에 지나치게 의존하는 긴 선택자는 작은 마크업 변경에도 끊기기 쉽습니다. 먼저 의미 있는 클래스 하나로 표현할 수 있는지 확인하세요.

## 상속과 초기값

캐스케이드로 해당 요소에 직접 적용할 값이 정해지지 않았을 때, 상속되는 속성은 부모의 계산값을 전달받습니다.

```css
.course-card {
  color: #344054;
  font-family: system-ui, sans-serif;
}
```

`color`, `font-family`처럼 글자와 관련된 많은 속성은 상속됩니다. `width`, `margin`, `padding`, `border` 같은 레이아웃 속성은 대체로 상속되지 않습니다. 속성별 공식 문서의 `Inherited` 항목을 확인하는 습관을 들이세요.

```css
.child {
  color: inherit;
  margin: initial;
}
```

- `inherit`: 부모의 계산값을 명시적으로 사용합니다.
- `initial`: 해당 속성의 명세상 초기값을 사용합니다. 브라우저 기본 스타일과 항상 같은 뜻은 아닙니다.
- `unset`: 원래 상속되는 속성이면 `inherit`, 아니면 `initial`처럼 동작합니다.

## 길이 단위의 기준 찾기

| 단위 | 주된 기준 | 관찰 예 |
| --- | --- | --- |
| `px` | CSS 기준 픽셀 | 얇은 테두리, 작은 고정 간격 |
| `%` | 속성마다 정한 기준값 | 자식 너비가 포함 블록 너비에 비례 |
| `em` | 해당 요소의 글자 크기. `font-size`에서는 부모 글자 크기 | 글자와 함께 커지는 내부 간격 |
| `rem` | 루트 요소의 글자 크기 | 페이지 전체의 일관된 간격 |

```css
html {
  font-size: 16px;
}

.card {
  font-size: 20px;
  padding: 1em;
  margin-block: 1rem;
  width: 80%;
}
```

이 예에서 padding은 20px, margin은 16px입니다. `width: 80%`는 무조건 화면 너비의 80%가 아니라 해당 속성이 사용하는 포함 블록을 기준으로 계산됩니다. `1px`도 물리 화면의 픽셀 한 칸과 항상 같다는 뜻은 아닙니다.

## 사용자 정의 속성

반복하는 값에 이름을 붙이면 관계를 드러낼 수 있습니다.

```css
:root {
  --color-accent: #315efb;
  --space-card: 1rem;
}

.notice {
  color: var(--color-accent);
  padding: var(--space-card);
}
```

사용자 정의 속성은 기본적으로 상속되고 이름의 대소문자를 구분합니다. 이름만 만든다고 값의 단위나 색상 형식이 자동 검증되는 것은 아닙니다.

## 개발자 도구에서 확인할 순서

1. Elements 패널에서 실제 요소의 태그·클래스·속성을 확인합니다.
2. Styles 패널에서 선택자가 일치해 규칙이 나타나는지 봅니다.
3. Computed 패널에서 최종 `color`, `font-size`, `padding` 값을 확인합니다.
4. 상속된 값이라면 어느 조상에서 왔는지 추적합니다.
5. `em`, `rem`, `%`의 기준이 되는 요소와 값을 확인합니다.

## 흔한 실수

- HTML은 `class="card"`인데 CSS에 `#card`를 작성합니다.
- `.card.active`와 `.card .active`의 공백 차이를 놓칩니다.
- 모든 CSS 속성이 부모에서 자식으로 전달된다고 생각합니다.
- `%`를 언제나 뷰포트 기준으로 계산합니다.
- 중첩된 요소에서 `em`이 어느 글자 크기를 기준으로 하는지 확인하지 않습니다.
- CSS 파일 경로가 잘못됐는데 선택자만 계속 바꿉니다.

## 확인 문제

1. `.menu.active`와 `.menu .active`는 각각 어떤 요소와 일치하나요?
2. `.card > h2`와 `.card h2`의 범위 차이는 무엇인가요?
3. 부모의 `color`가 자식 글자에 적용될 수 있지만 `padding`은 자동 적용되지 않는 이유는 무엇인가요?
4. 글자 크기가 20px인 요소에서 `padding: 1em`은 몇 px인가요?
5. 루트 글자 크기가 16px일 때 `margin: 1.5rem`은 몇 px인가요?
6. CSS가 전혀 적용되지 않을 때 선택자보다 먼저 확인할 것은 무엇인가요?

## 공식 출처

- [W3C Selectors Level 4 — Selector syntax and structure](https://www.w3.org/TR/selectors-4/#structure)
- [W3C CSS Cascading and Inheritance Level 5 — Inheritance](https://www.w3.org/TR/css-cascade-5/#inheriting)
- [W3C CSS Values and Units Level 4](https://www.w3.org/TR/css-values-4/)
