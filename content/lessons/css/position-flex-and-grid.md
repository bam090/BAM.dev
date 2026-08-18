# position·Flexbox·Grid

## 학습 목표

- 정상 흐름으로 해결할 부분과 별도 배치가 필요한 부분을 구분할 수 있습니다.
- `static`, `relative`, `absolute`, `fixed`, `sticky`의 기준점과 흐름 참여 여부를 설명할 수 있습니다.
- Flexbox의 주축과 교차축을 `flex-direction`에 따라 찾을 수 있습니다.
- 한 축 중심 배치에는 Flexbox, 행과 열을 함께 설계할 때는 Grid를 선택할 수 있습니다.
- 시각 순서를 바꿀 때 DOM의 읽기·키보드 순서를 함께 점검할 수 있습니다.

## 레이아웃 도구를 고르는 순서

추가 CSS가 없는 문서는 정상 흐름으로 읽힙니다. 레이아웃을 시작할 때 모든 요소를 좌표로 옮기기보다 다음 순서로 요구사항을 나누세요.

1. HTML 순서만으로 내용을 이해할 수 있게 만듭니다.
2. 메뉴나 버튼 묶음처럼 한 방향 정렬이 필요하면 Flexbox를 검토합니다.
3. 카드 목록처럼 행과 열을 함께 설계하면 Grid를 검토합니다.
4. 다른 내용 위에 겹치거나 화면에 고정해야 할 때만 `position`을 사용합니다.

이 순서를 따르면 콘텐츠가 늘거나 화면이 좁아져도 요소가 자연스럽게 자리를 다시 계산할 수 있습니다.

## position과 기준점

### static

```css
.card {
  position: static;
}
```

초기값입니다. 정상 흐름에 따라 배치되고 `top`, `right`, `bottom`, `left` 같은 inset 속성으로 이동하지 않습니다.

### relative

```css
.card {
  position: relative;
}
```

`relative`인 요소는 정상 흐름에서 원래 자리를 유지합니다. inset으로 보이는 위치를 조금 옮길 수도 있지만, 실무에서는 절대 배치 자식의 위치 기준을 만드는 용도로 자주 사용합니다.

### absolute

```html
<article class="course-card">
  <span class="course-card__badge">NEW</span>
  <h2>CSS 기초</h2>
</article>
```

```css
.course-card {
  position: relative;
}

.course-card__badge {
  position: absolute;
  inset-block-start: 0.75rem;
  inset-inline-end: 0.75rem;
}
```

`absolute` 요소는 정상 흐름에서 빠져 원래 자리를 남기지 않습니다. 위치 기준은 보통 `position: static`이 아닌 가장 가까운 조상에서 찾습니다. 카드에 `relative`를 주지 않으면 배지가 의도하지 않은 먼 조상을 기준으로 놓일 수 있습니다.

### fixed와 sticky

```css
.help-button {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}

.section-heading {
  position: sticky;
  top: 0;
}
```

- `fixed`는 일반적으로 뷰포트를 기준으로 고정되고 정상 흐름에서 빠집니다.
- `sticky`는 평소 정상 흐름에 참여하다가 스크롤 경계에 닿으면 스크롤 컨테이너 안에서 붙습니다.

`sticky`에는 `top: 0` 같은 임계 위치가 필요합니다. 조상의 `overflow`와 실제 스크롤 영역도 동작에 영향을 줍니다. `fixed`도 변형된 조상 등 포함 블록 조건에 따라 기준이 달라질 수 있으므로 개발자 도구에서 확인하세요.

## 겹침과 stacking context

```css
.dialog {
  position: fixed;
  z-index: 10;
}
```

`z-index` 숫자가 페이지 전체에서 단순 비교된다고 생각하면 문제를 놓칠 수 있습니다. 요소는 각자의 **stacking context** 안에서 쌓이고, `position`, `transform`, `opacity` 등의 조건이 새 stacking context를 만들 수 있습니다.

겹침이 예상과 다를 때는 큰 숫자를 먼저 넣지 말고 다음을 확인하세요.

1. 비교하는 두 요소가 같은 stacking context 안에 있는가?
2. 조상에 `transform`, `opacity`, `z-index`가 있는가?
3. 불필요한 겹침을 DOM과 레이아웃 구조로 없앨 수 있는가?

## Flexbox: 한 축의 공간 나누기

부모에 `display: flex`를 지정하면 직접 자식이 flex item이 됩니다.

```html
<nav class="menu" aria-label="주요 메뉴">
  <a href="#learn">학습</a>
  <a href="#review">복습</a>
  <a href="#quest">Quest</a>
</nav>
```

```css
.menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

### 주축과 교차축

```css
.menu {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
```

- `flex-direction: row`: 주축은 가로, 교차축은 세로입니다.
- `flex-direction: column`: 주축은 세로, 교차축은 가로입니다.
- `justify-content`: 주축에서 남는 공간을 분배합니다.
- `align-items`: 한 줄의 교차축에서 item을 정렬합니다.
- `gap`: item 사이 간격을 부모가 관리합니다.

`justify-content`를 무조건 가로 정렬로 외우면 column에서 틀립니다. 먼저 `flex-direction`으로 주축을 찾으세요.

### 줄바꿈과 item 크기

```css
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  flex: 0 1 auto;
}
```

공간이 부족할 때 `flex-wrap: wrap`은 item을 다음 줄로 보낼 수 있게 합니다. `flex` 단축 속성은 늘어남, 줄어듦, 기본 크기를 함께 표현합니다. 긴 콘텐츠가 줄어들지 않아 넘친다면 item의 자동 최소 크기와 `min-width`도 확인하세요.

## Grid: 행과 열을 함께 설계하기

```html
<section class="course-grid">
  <article>HTML</article>
  <article>CSS</article>
  <article>JavaScript</article>
</section>
```

```css
.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

Grid는 가로 열과 세로 행이라는 두 축을 함께 제어합니다.

- `grid-template-columns`: 열 track의 개수와 크기
- `grid-template-rows`: 행 track의 크기
- `fr`: 남은 공간을 나누는 몫
- `repeat()`: 반복되는 track 표현
- `gap`: 행과 열 사이의 간격

### 공간에 맞춰 열 수 조절하기

```css
.course-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 16rem), 1fr)
  );
  gap: 1rem;
}
```

각 열은 최대한 16rem의 최소 크기를 원하지만, 컨테이너가 더 좁으면 `min(100%, 16rem)` 덕분에 부모 너비 안으로 줄어들 수 있습니다. 공간이 넓어지면 브라우저가 들어갈 수 있는 열 수를 늘립니다.

특정 item을 모든 열에 걸치게 할 수도 있습니다.

```css
.course-card--featured {
  grid-column: 1 / -1;
}
```

## 도구 선택표

| 요구사항 | 먼저 검토할 도구 | 관찰 기준 |
| --- | --- | --- |
| 제목과 문단을 읽는 순서 | 정상 흐름 | 추가 배치가 정말 필요한가? |
| 메뉴·버튼을 한 줄 또는 한 열로 정렬 | Flexbox | 주축이 하나인가? |
| 카드의 행과 열을 함께 설계 | Grid | 두 축의 track 관계가 필요한가? |
| 카드 모서리에 배지 겹치기 | relative + absolute | 기준 부모가 분명한가? |
| 화면 모서리에 도움 버튼 고정 | fixed | 콘텐츠를 가리거나 키보드 초점을 방해하지 않는가? |
| 스크롤 중 제목을 영역 안에 유지 | sticky | 임계 inset과 스크롤 컨테이너가 있는가? |

Flexbox와 Grid는 경쟁 도구가 아닙니다. 바깥 카드 목록은 Grid, 카드 내부 버튼 행은 Flexbox처럼 함께 사용할 수 있습니다.

## 시각 순서와 읽는 순서

Flexbox의 `order`나 Grid 배치로 보이는 순서를 바꿔도 DOM 순서와 키보드 초점 순서가 자동으로 같은 모양으로 바뀌지 않습니다. 중요한 읽기·작업 순서는 HTML에서 먼저 올바르게 정하고, CSS 재배치는 의미와 조작 순서를 어긋나게 하지 않는 범위에서 사용하세요.

## 최소 실습

```css
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: 1rem;
}

.product {
  position: relative;
  padding: 1.5rem;
  border: 1px solid #d0d5dd;
}

.product__badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.product__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
```

개발자 도구의 Flexbox·Grid overlay를 켜고 주축, track, gap을 확인하세요. 카드 제목을 길게 바꾸고 화면을 좁혀도 배지와 버튼이 내용을 가리지 않는지 관찰합니다.

## 흔한 실수

- 정상 흐름이나 Flexbox로 가능한 배치를 모두 absolute로 만듭니다.
- absolute 자식의 기준 부모에 relative를 빠뜨립니다.
- `justify-content`를 언제나 가로 정렬로 외웁니다.
- 자식에 `display: flex`를 주면 그 자식 자신이 부모 안에서 정렬된다고 생각합니다.
- `display: grid`만 쓰면 자동으로 여러 열이 된다고 생각합니다.
- 큰 `z-index` 숫자로 stacking context 문제를 덮습니다.
- CSS로 보이는 순서만 바꾸고 키보드·읽기 순서를 확인하지 않습니다.

## 확인 문제

1. relative와 absolute는 정상 흐름에서 원래 자리를 각각 유지하나요?
2. absolute 배지의 위치 기준을 카드로 만들려면 카드에 무엇을 지정할 수 있나요?
3. `flex-direction: column`일 때 `justify-content`는 어느 방향을 정렬하나요?
4. flex item은 flex 컨테이너의 어느 범위까지인가요?
5. 행과 열을 함께 설계하는 카드 목록에는 Flexbox와 Grid 중 무엇을 먼저 검토하나요?
6. 시각적 순서를 CSS로 바꿨을 때 DOM과 키보드 초점 순서를 확인해야 하는 이유는 무엇인가요?

## 공식 출처

- [W3C CSS Positioned Layout Module Level 3](https://www.w3.org/TR/css-position-3/)
- [W3C CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/)
- [W3C CSS Grid Layout Module Level 2](https://www.w3.org/TR/css-grid-2/)
- [W3C CSS Display Module Level 3 — Reordering and accessibility](https://www.w3.org/TR/css-display-3/#order-accessibility)
- [MDN — Introduction to CSS layout](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction)
