# Flexbox로 한 축 정렬하기

## 학습 목표

배치하는 부모와 직접 자식을 찾고 주축·교차축을 기준으로 정렬과 줄바꿈을 정할 수 있습니다.

## 한줄 요약

Flexbox는 한 축의 항목을 배치하며 justify-content는 주축, align-items는 교차축을 따릅니다.

## 먼저 확인할 개념

[일반 흐름과 display](#/learn/css/wiki-display), [간격의 주인과 margin 합침](#/learn/css/wiki-spacing)을 먼저 확인하면 부모가 배치를 맡는 이유를 이해하기 쉽습니다.

## 부모와 직접 자식을 찾는다

메뉴 링크를 한 줄로 정리하려면 링크들을 담은 부모에 `display: flex`를 둔다.
부모가 `flex container`, 일반 흐름에 있는 바로 아래 자식들이 `flex item`이 된다.
링크 안의 글자까지 별도의 flex item이 되는 것은 아니다.

```html
<nav class="menu" aria-label="마을 소식">
  <a href="/news">소식</a>
  <a href="/meetings">모임</a>
  <a href="/help">도움말</a>
</nav>
```

```css
.menu {
  writing-mode: horizontal-tb;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
```

`gap`은 항목 사이의 간격이다. 메뉴 바깥까지 띄우지는 않는다.
`flex-wrap: wrap`은 공간이 부족할 때 다음 줄로 이동할 수 있게 한다.
가로쓰기에서 `flex-direction`의 기본값인 `row`는 가로 방향으로 항목을 놓는다.

## 정렬하기 전에 축을 확인한다

Flexbox의 `justify-content`는 주축의 남은 공간을 나누고, `align-items`는 교차축에서 항목을 맞춘다.
가로쓰기인 `writing-mode: horizontal-tb`에서 `flex-direction: column`을 쓰면 주축은 세로, 교차축은 가로다.
따라서 `justify-content`를 항상 가로 정렬이라고 외우지 않는다.

앞 예의 부모에 `flex-direction: column`을 추가하고 개발자 도구의 Flex 오버레이로 축을 확인해 보자.
주축에 남는 공간이 없다면 `space-between`을 써도 추가로 나눌 공간이 없다는 점도 함께 본다.

## 선택 확장: 항목의 크기와 줄어들 범위

```css
.menu a {
  flex: 1 1 10rem;
}
```

세 값은 차례로 남는 공간을 받는 `grow`, 부족한 공간을 줄이는 계산에 쓰는 `shrink`, 계산 전 기본 크기인 `basis`다.
`flex-grow: 2`는 최종 너비가 언제나 두 배라는 뜻이 아니다. 기본 크기·콘텐츠·최소와 최대 크기도 계산에 참여한다.

긴 문자열 때문에 항목이 줄지 않는다면 자동 최소 크기를 먼저 확인한다.
정말 줄여도 되는 항목에만 `min-width: 0`을 쓰고 `overflow-wrap: anywhere` 등으로 내용도 읽을 수 있게 한다.
넘침을 숨겨서 정렬이 끝났다고 판단하지 않는다.

## 순서와 적용 범위를 확인한다

`order`나 역방향 배치는 화면 순서를 바꿀 수 있지만 HTML 읽기·키보드 이동 순서를 같은 방식으로 바꾸지는 않는다.
의미 있는 순서는 HTML에 먼저 맞춘다.
여러 줄 사이에서 열까지 맞춰야 한다면 [Grid](#/learn/css/wiki-grid)를 검토한다.

## 이어서 연습하기

[상품 카드 레이아웃](#/quest/css/product-card-layout) — [relative와 absolute](#/learn/css/wiki-positioning)도 읽은 뒤, 카드의 흐름과 배지의 기준을 함께 작성하는 실습입니다.

## 공식 자료

- [CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/)
- [CSS Box Alignment Module Level 3](https://www.w3.org/TR/css-align-3/)

## 핵심 질문 답

먼저 항목들을 담은 부모에 Flexbox를 적용하고 일반 흐름에 있는 직접 자식이 배치 대상인지 확인합니다.
글쓰기 방향과 flex-direction으로 주축을 찾은 뒤 justify-content로 주축, align-items로 교차축 정렬을 정합니다.
항목 사이는 gap으로 띄우고 줄바꿈이 필요하면 wrap을 허용합니다.
가로쓰기의 column은 세로 주축이며, 크기 제한·긴 콘텐츠·HTML과 키보드 순서도 함께 확인해야 합니다.
