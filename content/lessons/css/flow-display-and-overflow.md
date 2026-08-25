# 정상 흐름·display와 overflow

## 학습 목표

- CSS를 추가하지 않았을 때 요소가 정상 흐름에서 배치되는 방식을 설명할 수 있습니다.
- `block`, `inline`, `inline-block`, `none`의 차이를 구분할 수 있습니다.
- 요소 안쪽과 요소 사이의 간격에 `padding`, `margin`, `gap`을 알맞게 선택할 수 있습니다.
- 내용이 박스를 넘을 때 고정 높이와 `overflow`가 만드는 결과를 예측할 수 있습니다.

## 먼저 정상 흐름을 관찰하기

브라우저는 HTML을 읽은 뒤 각 요소가 만드는 박스를 기본 규칙에 따라 배치합니다. 별도 레이아웃을 적용하지 않은 문서에서 제목과 문단 같은 블록은 보통 위에서 아래로 쌓이고, 링크나 강조처럼 인라인 내용은 문장 안에서 이어집니다. 이를 **정상 흐름(normal flow)** 이라고 부릅니다.

```html
<article>
  <h2>CSS 배치 원리</h2>
  <p>먼저 <a href="#display">정상 흐름</a>을 관찰합니다.</p>
</article>
```

다음 질문에 답해 보세요.

1. 제목과 문단은 왜 서로 다른 줄에 놓일까요?
2. 링크는 왜 문장 중간에 이어질까요?
3. CSS가 늦게 불러와져도 문서의 읽는 순서는 유지되나요?

정상 흐름은 없애야 할 기본값이 아니라 읽기 좋은 문서를 만드는 출발점입니다. 먼저 HTML 순서만으로 내용을 이해할 수 있게 만든 뒤 필요한 부분에만 다른 레이아웃을 적용하세요.

## display가 정하는 두 가지 역할

`display`는 요소 자신이 주변 흐름에 어떻게 참여하는지와, 필요한 경우 직접 자식을 어떤 방식으로 배치할지를 정합니다.

### block

```css
.panel {
  display: block;
}
```

블록 박스는 정상 흐름에서 보통 새 줄에 놓이고 사용할 수 있는 가로 공간을 채우는 경향이 있습니다. `width`, `height`, 상하좌우 padding과 margin이 배치에 반영됩니다.

### inline

```css
.keyword {
  display: inline;
}
```

인라인 박스는 글자처럼 같은 줄 안에서 흐릅니다. 일반적인 비대체 인라인 요소에는 `width`와 `height`가 원하는 방식으로 적용되지 않습니다. 줄이 좁아지면 내용이 여러 줄로 나뉠 수도 있습니다.

### inline-block

```css
.badge {
  display: inline-block;
  width: 5rem;
  padding: 0.25rem 0.5rem;
}
```

`inline-block`은 같은 줄에 놓이면서도 너비·높이와 네 방향 간격을 하나의 박스처럼 다루고 싶을 때 유용합니다. 짧은 배지나 라벨을 만들 때 관찰하기 쉽습니다.

### none

```css
.is-hidden {
  display: none;
}
```

`display: none`인 요소는 박스를 만들지 않아 레이아웃 공간에서 빠지고 일반적으로 접근성 트리에서도 제외됩니다. 화면에서만 보이지 않게 하면서 보조 기술에는 내용을 남기려는 목적과는 다릅니다.

## 바깥 표시 방식과 안쪽 레이아웃을 구분하기

```css
.actions {
  display: flex;
}
```

`.actions` 요소는 바깥 정상 흐름에서 하나의 박스로 참여하고, 그 **직접 자식**은 flex item이 됩니다. 손자 요소까지 자동으로 flex item이 되는 것은 아닙니다. `grid`도 마찬가지로 직접 자식의 안쪽 배치 방식을 바꿉니다.

`display`는 HTML의 의미를 바꾸는 도구가 아닙니다. 예를 들어 `div { display: inline; }`을 작성해도 그 요소가 의미 있는 링크나 버튼으로 바뀌지는 않습니다.

## 간격의 주인을 정하기

간격을 모두 “여백”이라고만 부르면 어느 박스가 책임져야 하는지 놓치기 쉽습니다.

```text
내용과 자신의 테두리 사이 → padding
한 요소와 주변 형제 사이 → margin
같은 부모가 배치하는 자식 사이 → 부모의 gap
```

```css
.card {
  padding: 1rem;
}

.card-list {
  display: grid;
  gap: 1.5rem;
}
```

카드 내부 공간은 카드 자신의 padding으로, 카드 목록의 반복 간격은 목록 부모의 `gap`으로 관리하면 책임이 분명합니다.

### 세로 margin이 합쳐지는 경우

일반 흐름의 블록 사이에서는 위아래 margin이 단순히 더해지지 않고 합쳐질 수 있습니다. 이를 margin collapsing이라고 합니다.

```css
.first {
  margin-bottom: 2rem;
}

.second {
  margin-top: 1rem;
}
```

두 블록 사이가 항상 3rem이라고 단정할 수 없습니다. 반복 목록에서는 부모의 `gap`을 사용하거나 한 방향 margin만 관리하면 결과를 예측하기 쉽습니다. 가로 margin은 같은 방식으로 상쇄되지 않습니다.

## 내용이 박스를 넘을 때

콘텐츠 길이는 번역, 글자 확대, 사용자 입력에 따라 달라집니다. 높이를 고정하면 내용이 박스 밖으로 넘칠 수 있습니다.

```css
.summary {
  height: 5rem;
  overflow: visible;
}
```

`overflow`의 대표 값은 다음과 같습니다.

| 값 | 결과 |
| --- | --- |
| `visible` | 기본적으로 넘친 내용을 박스 밖에도 표시할 수 있음 |
| `hidden` | 넘친 부분을 잘라 표시하지 않음 |
| `auto` | 실제로 넘칠 때 스크롤 방법을 제공함 |
| `scroll` | 넘침 여부와 관계없이 스크롤 컨테이너가 됨 |

설명처럼 길이를 미리 알 수 없는 콘텐츠에는 고정 `height`보다 내용이 높이를 결정하게 두는 편이 안전합니다. 제한이 정말 필요하다면 `max-height`와 `overflow: auto`를 함께 검토하세요.

```css
.log-panel {
  max-height: 12rem;
  overflow: auto;
}
```

스크롤 영역을 만들었다면 키보드와 보조 기술 사용자가 그 내용을 탐색할 수 있는지 실제로 확인해야 합니다.

## 최소 실습

```html
<section class="tag-panel">
  <h2>학습 키워드</h2>
  <div class="tag-list">
    <span class="tag">선택자</span>
    <span class="tag">캐스케이드</span>
    <span class="tag">박스 모델</span>
  </div>
  <p class="tag-panel__description">
    설명이 길어져도 글자가 잘리지 않는지 확인해 보세요.
  </p>
</section>
```

```css
* {
  box-sizing: border-box;
}

.tag-panel {
  width: min(100%, 30rem);
  padding: 1rem;
  border: 1px solid #98a2b3;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e0e7ff;
}
```

값을 하나씩 바꾸어 관찰하세요.

1. `.tag`를 `inline`으로 바꾸면 너비와 세로 간격은 어떻게 달라지나요?
2. `.tag-list`의 `gap`을 지우고 각 자식에 margin을 주면 간격 책임이 어디로 이동하나요?
3. 설명에 `height: 2rem; overflow: hidden`을 주고 글자를 확대하면 무엇이 사라지나요?

## 개발자 도구에서 볼 것

- Computed 패널에서 최종 `display` 값
- Layout 패널에서 flex/grid의 직접 자식 범위
- Box Model 그림에서 padding과 margin의 위치
- 스크롤 크기와 실제 보이는 영역의 차이
- `display: none` 전후의 접근성 트리 변화

## 흔한 실수

- 인라인 요소에 `width`를 주고 브라우저가 값을 무시한다고만 생각합니다.
- 부모에 `display: flex`를 주면 모든 후손이 flex item이 된다고 생각합니다.
- 카드 사이 간격을 모든 자식의 제각각인 margin으로 관리합니다.
- margin collapsing이 있는데 두 세로 margin을 항상 더합니다.
- 사용자 콘텐츠 길이를 모른 채 고정 높이와 `overflow: hidden`으로 글자를 자릅니다.
- `display: none`을 시각적으로만 숨기는 방법으로 사용합니다.

## 확인 문제

1. 정상 흐름에서 블록과 인라인 내용은 각각 어떻게 배치되는 경향이 있나요?
2. 같은 줄에 놓이면서 `width`와 `height`를 적용하려면 어떤 display 값이 알맞나요?
3. `display: flex`를 지정한 요소의 어느 범위가 flex item이 되나요?
4. 카드 자체 안쪽 간격과 카드 목록의 반복 간격은 각각 어떤 속성으로 관리하는 것이 자연스러운가요?
5. 길이를 알 수 없는 설명에 고정 height와 `overflow: hidden`을 함께 쓰면 어떤 문제가 생길 수 있나요?
6. `display: none`이 시각적 결과 외에 접근성에 미치는 영향을 설명해 보세요.

## 공식 출처

- [W3C CSS Display Module Level 3](https://www.w3.org/TR/css-display-3/)
- [W3C CSS Box Model Module Level 3](https://www.w3.org/TR/css-box-3/)
- [W3C CSS Overflow Module Level 3](https://www.w3.org/TR/css-overflow-3/)
