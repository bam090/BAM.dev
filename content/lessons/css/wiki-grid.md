# Grid로 행과 열 만들기

## 학습 목표

행과 열의 관계를 보고 Grid의 트랙·간격·남은 공간을 정의할 수 있습니다.

## 한줄 요약

Grid는 부모가 직접 자식의 행과 열을 배치하며 fr은 사용할 수 있는 남은 공간의 몫입니다.

## 먼저 확인할 개념

[일반 흐름과 display](#/learn/css/wiki-display), [overflow(넘침): 크기 제한과 내용 표시](#/learn/css/wiki-overflow)를 먼저 확인해 보세요.

## 부모에 열을 정의한다

모임 시간을 두 열로 맞추는 예다.
HTML의 어느 요소가 배치를 맡고 어떤 요소들이 각 칸에 들어갈지 먼저 찾아보자.

```html
<section class="schedule" aria-label="주민 모임 시간">
  <article>월요일 오전</article>
  <article>월요일 저녁</article>
  <article>수요일 오전</article>
  <article>수요일 저녁</article>
</section>
```

```css
.schedule {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
```

`.schedule`이 `grid container`, 일반 흐름에 있는 직접 자식 `article`들이 `grid item`이다.
`display: grid`만으로 원하는 여러 열이 생기는 것은 아니다. 여기서는 `grid-template-columns`가 두 열을 정했다.
행과 열을 나누는 선이 `grid line`, 두 선 사이의 한 행이나 열이 `track`이다.

## fr은 남은 공간의 몫이다

`fr`은 고정 트랙·간격·콘텐츠의 크기 조건 등을 처리한 뒤 사용할 수 있는 남은 공간을 나눈다.
따라서 `1fr 1fr`을 전체 부모 너비의 고정된 50%씩이라고 설명하지 않는다.
개발자 도구의 Grid 오버레이를 켜고 열 사이 `gap`도 공간을 차지하는지 확인해 보자.

## 선택 확장: 반복과 최소 크기

```css
.schedule {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
```

`repeat(2, ...)`는 같은 열을 두 번 정의하고, `minmax(0, 1fr)`은 최소를 0으로 두고 남은 공간의 한 몫을 받게 한다.
열이 줄어들어도 긴 문자열이 읽히는지는 별도 문제다. 줄바꿈과 넘침을 함께 확인한다.

원하는 카드 최소 크기는 유지하면서 가능한 열 수를 고르게 할 수도 있다.

```css
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 1rem;
}
```

`auto-fit`은 들어갈 수 있는 반복 열 수를 조정한다.
`min(100%, 14rem)`은 부모가 14rem보다 좁을 때 최소 열 크기 때문에 부모를 넘는 일을 피한다.
함수 이름보다 어떤 최소 크기와 열 관계가 필요한지 먼저 설명한다.

## 화면 순서가 읽는 순서를 대신하지 않는다

Grid 위치 지정은 화면 순서를 바꾸지만 HTML의 읽기·키보드 순서를 자동으로 같게 만들지 않는다.
순서가 의미를 가지면 HTML부터 맞춘다.
한 줄이나 한 열의 정렬만 필요하다면 [Flexbox](#/learn/css/wiki-flexbox)로 충분할 수 있다.

## 이어서 연습하기

[반응형 코스 Grid](#/quest/css/responsive-course-grid) — [미디어 쿼리](#/learn/css/wiki-responsive)를 읽은 뒤 열 수를 조건에 따라 바꾸는 실습입니다.

## 공식 자료

- [CSS Grid Layout Module Level 2](https://www.w3.org/TR/css-grid-2/)
- [CSS Grid의 접근성](https://www.w3.org/TR/css-grid-2/#accessibility)

## 핵심 질문 답

항목들을 담은 부모에 Grid를 적용하고 직접 자식의 행과 열 관계에 맞게 트랙을 정의합니다.
gap도 공간을 차지하며 fr은 여러 크기 조건을 처리한 뒤 남은 공간의 몫입니다.
같은 열은 repeat로 반복하고 필요할 때 minmax와 auto-fit으로 최소 크기와 열 수를 정합니다.
열만 줄여 놓고 내용이 넘치는지 놓치거나 CSS 화면 순서를 HTML 읽기 순서로 착각하지 않아야 합니다.
