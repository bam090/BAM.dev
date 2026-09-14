# relative와 absolute의 위치 기준

## 학습 목표

요소의 원래 자리를 남길지 판단하고 absolute 요소가 따를 위치 기준을 찾을 수 있습니다.

## 한줄 요약

relative는 원래 자리를 남기고 absolute는 흐름에서 빠져 가까운 위치 기준 박스를 따릅니다.

## 먼저 확인할 개념

[일반 흐름과 display](#/learn/css/wiki-display), [박스 모델과 box-sizing](#/learn/css/wiki-box-model)을 먼저 확인해 보세요.

## 원래 자리를 남길지 먼저 정한다

`top`·`right`·`bottom`·`left`는 위치 기준에서 떨어질 거리를 정하며, 네 방향을 함께 적는 축약 속성이 `inset`이다.
같은 `top`을 써도 현재 `position`에 따라 의미가 달라진다.

| 값 | 일반 흐름의 자리 | 위치 기준 |
| --- | --- | --- |
| static | 남음 | 기본 배치, inset이 적용되지 않음 |
| relative | 남음 | 일반 흐름에 놓인 자신의 원래 위치 |
| absolute | 빠짐 | absolute의 위치 기준 박스를 만드는 가까운 조상 |

`position: relative; top: 0.25rem;`은 원래 공간을 남기고 보이는 위치를 옮긴다.
뒤 요소가 그 빈자리로 올라오지는 않는다.
relative는 이동값 없이 absolute 자손의 기준을 만들기 위해서도 쓴다.

## 카드가 배지의 위치 기준이 된다

absolute의 위치와 백분율 크기를 계산하는 기준 박스를 `containing block`이라고 한다.
다음 예에서 배지와 제목이 같은 자리를 차지하지 않도록 어느 요소가 공간을 마련하는지 살펴보자.

```html
<article class="notice-card">
  <h2>마을 회의</h2>
  <span class="new-badge">새 소식</span>
</article>
```

```css
.notice-card {
  position: relative;
  padding-right: 5rem;
}

.new-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
```

배지는 흐름에서 빠지고 카드가 만든 기준 박스의 위·오른쪽에서 각각 0.5rem 떨어진 곳에 놓인다.
카드의 오른쪽 padding은 제목이 배지 아래로 들어가지 않도록 확보한 공간이다.
이 값은 예시다. 글자 크기와 배지 문구가 달라져도 충분한지 확인해야 한다.

absolute가 항상 바로 위 부모를 기준으로 삼는 것은 아니다.
여기서는 relative인 카드가 기준을 만들지만 `transform` 같은 속성도 기준을 만들 수 있다.
기준을 만드는 조상이 없다면 문서를 처음 배치하는 초기 기준 박스까지 거슬러 올라간다.

## 서로 밀어내야 한다면 흐름에 둔다

배지 길이를 알 수 없거나 제목과 배지가 서로 공간을 내주어야 한다면 둘을 absolute로 겹치지 않는다.
[Flexbox](#/learn/css/wiki-flexbox)나 [Grid](#/learn/css/wiki-grid)로 일반 흐름에 두는 편이 안전하다.
페이지 전체를 고정 좌표로 줄 세우면 내용 길이가 바뀔 때 관계를 유지하기 어렵다.

## 이어서 연습하기

[상품 카드 레이아웃](#/quest/css/product-card-layout) — Flexbox와 함께 카드의 흐름과 배지의 기준을 작성하는 실습입니다.

## 공식 자료

- [CSS Positioned Layout Module Level 3](https://www.w3.org/TR/css-position-3/)
- [CSS Transforms의 렌더링 모델](https://www.w3.org/TR/css-transforms-1/#transform-rendering)

## 핵심 질문 답

원래 자리를 남긴 채 보이는 위치만 옮기려면 relative를, 흐름에서 빼 특정 기준점에 놓으려면 absolute를 검토합니다.
absolute의 가까운 위치 기준 박스를 찾아야 하며 예제에서는 relative인 카드가 그 기준입니다.
배지가 흐름에서 빠지므로 제목과 겹치지 않을 공간도 마련해야 합니다.
문구 길이에 따라 서로 밀어내야 한다면 Flexbox나 Grid로 흐름에 두는 편이 알맞습니다.
