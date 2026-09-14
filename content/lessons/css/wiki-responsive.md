# 유연한 배치와 미디어 쿼리

## 학습 목표

콘텐츠가 흐를 수 있는 크기를 먼저 정하고 배치를 바꿔야 하는 조건에 미디어 쿼리를 적용할 수 있습니다.

## 한줄 요약

유연한 크기와 배치를 먼저 사용하고 내용이 불편해지는 분기점에서 미디어 쿼리로 선언 후보를 추가합니다.

## 먼저 확인할 개념

[Grid로 행과 열 만들기](#/learn/css/wiki-grid), [캐스케이드와 명시도](#/learn/css/wiki-cascade)를 먼저 확인해 보세요.

## 미디어 쿼리보다 먼저 내용이 흐르게 한다

부모보다 큰 고정 너비 때문에 넘친다면 화면별 규칙을 늘리기 전에 크기부터 바꾼다.
이미지는 부모보다 커지지 않게 하고 목록은 유동적인 너비와 최대 너비를 함께 둔다.

```css
img {
  max-width: 100%;
  height: auto;
}

.notice-list {
  box-sizing: border-box;
  width: 100%;
  max-width: 60rem;
  margin-inline: auto;
  padding-inline: 1rem;
}
```

이후 Flexbox의 줄바꿈이나 Grid의 유동적인 열만으로 충분한지 확인한다.
고정 너비를 그대로 둔 채 `overflow: hidden`으로 자르는 것은 내용을 읽을 수 있게 만드는 해결이 아니다.

## 조건이 참일 때 선언 후보가 된다

미디어 쿼리는 현재 환경이 조건을 만족할 때만 안쪽 선언을 캐스케이드 후보로 추가한다.
`min-width: 48rem`은 기준 이상, `max-width: 48rem`은 기준 이하의 너비를 뜻한다.
후보가 된 선언의 최종 적용 여부는 다른 선언과의 캐스케이드 비교로 결정된다.

다음 목록에는 일반 흐름에 있는 자식 카드가 두 개 이상 있고, 다른 충돌 규칙은 없다고 가정한다.

```css
.learning-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 48rem) {
  .learning-layout {
    grid-template-columns: 2fr 1fr;
  }
}
```

기본은 한 열이고 기준 이상에서는 두 열 선언도 후보가 된다.
이 예에서는 같은 작성자의 일반 선언이며 중요도·레이어·명시도가 같으므로 뒤 선언이 적용된다.
자식 개수나 hover 상태를 검사하는 조건은 아니다.

48rem은 이 예의 분기점이지 모든 기기의 정답이나 이번 화면에서 측정한 값이 아니다.
창 너비를 연속해서 바꾸며 제목·버튼·열 관계가 불편해지는 곳을 찾고 그 앞뒤를 확인해 보자.

## viewport와 확대의 전제를 확인한다

모바일 브라우저에서 초기 표시 영역을 기기 너비에 맞추려면 HTML의 head에 다음 설정을 둔다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

이 설정만으로 배치가 완성되는 것은 아니며 확대를 막는 설정은 덧붙이지 않는다.
긴 문구·이미지·페이지 확대·글자 확대에도 내용과 조작 요소가 남는지 확인한다.
미디어 쿼리의 em·rem은 작성한 html 글자 크기가 아닌 사용자 에이전트나 사용자 설정의 초기 글자 크기를 기준으로 한다.

### 선택 확장: 화면 높이가 필요할 때

모바일 주소창 등의 변화 때문에 `100vh`가 지금 가리지 않고 보이는 높이와 다를 수 있다.
`svh`는 작은 viewport, `lvh`는 큰 viewport, `dvh`는 현재 변하는 viewport의 높이를 기준으로 한다.
먼저 내용이 늘어날 수 있게 만들고 고정 화면 높이가 꼭 필요한 경우에만 이 차이를 검토한다.

## 이어서 연습하기

[반응형 코스 Grid](#/quest/css/responsive-course-grid) — 기본 열과 조건이 맞을 때의 열을 직접 작성하는 실습입니다.

## 공식 자료

- [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/)
- [CSS Values의 viewport 단위](https://www.w3.org/TR/css-values-4/#viewport-relative-lengths)
- [WAI Reflow 이해하기](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## 핵심 질문 답

이미지와 박스의 유연한 크기, Flexbox나 Grid의 자연스러운 배치로 먼저 해결합니다.
그래도 내용이 읽기 어려워지는 지점에서 미디어 쿼리를 추가하며 분기점은 기기 이름보다 콘텐츠로 정합니다.
조건이 참이면 안쪽 선언이 후보가 되고 최종 적용은 캐스케이드가 결정합니다.
min-width는 기준 이상, max-width는 기준 이하이며 viewport 설정·긴 내용·확대 상황도 함께 확인합니다.
