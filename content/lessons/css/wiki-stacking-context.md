# 쌓임 맥락과 z-index

## 학습 목표

겹친 요소의 부모 쌓임 맥락을 찾아 큰 z-index만으로 앞뒤를 바꿀 수 없는 이유를 설명할 수 있습니다.

## 한줄 요약

쌓임 맥락은 요소들을 한 묶음으로 다루며 자식의 z-index는 부모 묶음 밖의 전역 순위가 아닙니다.

## 먼저 확인할 개념

[relative와 absolute의 위치 기준](#/learn/css/wiki-positioning)을 먼저 확인해 보세요.

## 숫자보다 부모 묶음을 먼저 본다

쌓임 맥락은 여러 종이를 끼운 파일철과 비슷하다.
뒤 파일철 안에서 종이를 맨 앞으로 옮겨도 앞 파일철을 넘어오지는 못한다.
겹친 두 요소가 같은 쌓임 맥락에 참여하는지, 다른 부모 묶음에 속하는지부터 찾는다.

다음 예에서 `9999`를 가진 자식과 `2`인 앞 묶음 중 누가 앞에 보일지 예상해 보자.

```html
<div class="stack-demo">
  <section class="back-group">
    <div class="very-high">9999</div>
  </section>
  <section class="front-group">앞 묶음</section>
</div>
```

```css
.stack-demo { position: relative; min-height: 8rem; }

.back-group,
.front-group { position: absolute; width: 8rem; height: 5rem; }

.back-group {
  inset: 0 auto auto 0;
  z-index: 1;
  background: #d6e4ff;
}

.very-high {
  position: absolute;
  inset: 1rem auto auto 4rem;
  z-index: 9999;
  width: 6rem;
  height: 3rem;
  background: #ffec99;
}

.front-group {
  inset: 2rem auto auto 5rem;
  z-index: 2;
  background: #c3fae8;
}
```

두 부모는 각각 쌓임 맥락을 만든다.
바깥에서는 부모의 `1`과 `2`를 비교하므로 `.front-group`이 앞에 놓인다.
자식의 `9999`는 `.back-group` 안의 순서이며 앞 부모 묶음을 넘어가지 못한다.
자식 숫자를 키우기 전에 부모가 참여하는 맥락을 찾아야 하는 이유다.

## 새 묶음을 만드는 조건을 찾는다

대표 조건은 다음과 같다.

- 문서 루트 요소
- relative 또는 absolute이면서 `z-index`가 `auto`가 아닌 요소
- fixed 또는 sticky인 요소
- `opacity`가 1보다 작은 요소
- `transform`이 `none`이 아닌 요소

이 목록이 모든 조건은 아니다.
relative나 absolute만 적었다고 항상 새 묶음이 생기는 것도 아니다.
`auto`나 같은 값인 경우에는 CSS 그리기 순서와 문서 순서도 관여하므로 “나중 HTML이 언제나 앞”이라고 외우지 않는다.

## 이어서 연습하기

[CSS 레이아웃 종합 진단](#/learn/css/wiki-layout-review)에서 위치 기준과 부모 배치를 함께 점검해 보세요.
쌓임 맥락만 다루는 별도 Code Quest는 현재 연결되어 있지 않습니다.

## 공식 자료

- [CSS 2의 layered presentation](https://www.w3.org/TR/CSS2/visuren.html#z-index)
- [CSS Positioned Layout Module Level 3](https://www.w3.org/TR/css-position-3/)
- [CSS Transforms의 렌더링 모델](https://www.w3.org/TR/css-transforms-1/#transform-rendering)

## 핵심 질문 답

z-index는 페이지 전체에서 통하는 순위가 아니며 자식은 부모의 쌓임 묶음 안에서 비교됩니다.
다른 부모의 자식끼리 겹친다면 먼저 부모 묶음들이 바깥 맥락에서 어떤 순서인지 확인합니다.
예제에서는 부모의 1이 2보다 뒤여서 자식 9999도 앞 묶음을 넘지 못합니다.
숫자를 더하기 전에 조상의 position과 z-index, opacity, transform 등 쌓임 맥락을 만드는 조건을 찾습니다.
