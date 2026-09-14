# fixed와 sticky의 차이

## 학습 목표

fixed와 sticky의 흐름 참여·위치 기준을 구분하고 붙지 않는 원인을 확인할 수 있습니다.

## 한줄 요약

fixed는 흐름에서 빠져 기준 영역에 고정되고 sticky는 자리를 남긴 채 스크롤 영역과 자신의 containing block(위치 기준 박스) 범위 안에서 붙습니다.

## 먼저 확인할 개념

[relative와 absolute의 위치 기준](#/learn/css/wiki-positioning), [overflow(넘침): 크기 제한과 내용 표시](#/learn/css/wiki-overflow)를 먼저 확인해 보세요.

## 화면에 고정할지 영역 안에서 붙일지 고른다

도움말 버튼을 화면 모서리에 유지하는 일과 긴 목록의 제목을 해당 목록 안에서만 붙이는 일은 다르다.
전자는 보통 fixed, 후자는 sticky를 먼저 검토한다.

```css
.help-button {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}

.schedule-title {
  position: sticky;
  top: 0;
  background: white;
}
```

fixed 요소는 일반 흐름에서 빠진다.
보통 viewport를 기준으로 하므로 페이지를 스크롤해도 같은 자리에 보이지만, 조상의 `transform` 같은 속성이 fixed의 위치 기준을 만들 수도 있다.
“fixed는 언제나 화면 기준”이라고 단정하지 않는다.

sticky 요소는 원래 공간을 유지한다.
스크롤 중 `top: 0` 경계에 닿으면 가까운 스크롤 영역과 자신의 위치 기준 박스가 허용하는 범위에서 붙어 보인다.
실제로 relative에서 fixed로 바뀌는 것은 아니다.

## sticky가 붙지 않을 때 확인한다

스크롤 상자에서 현재 보이는 영역을 `scrollport`라고 한다.
sticky는 가까운 스크롤 컨테이너의 scrollport를 따르므로 원하는 페이지 스크롤이 기준인지부터 살핀다.

1. 움직일 축에 `top`처럼 `auto`가 아닌 inset이 있는가?
2. 실제로 스크롤할 거리가 있는가?
3. 조상의 `overflow`가 예상과 다른 스크롤 컨테이너를 만들었는가?
4. 자신의 위치 기준 박스가 너무 짧아 움직일 범위가 없는가?

자신의 위치 기준 박스 범위를 벗어난 뒤에도 계속 화면에 붙어 있어야 하는 요구를 sticky에 기대하지 않는다.
그렇다고 fixed로 바꾸기 전에 흐름에서 빠져도 되는지 다시 판단한다.

## 붙인 요소가 내용을 가리지 않아야 한다

화면을 확대하거나 제목을 길게 바꾸고 고정 요소가 본문·버튼·키보드 포커스를 가리는지 확인해 보자.
고정된 요소의 높이가 바뀌어도 뒤의 내용을 읽고 조작할 수 있어야 한다.
숫자 위치가 맞는 것만으로 고정 배치가 끝난 것은 아니다.

## 이어서 연습하기

[쌓임 맥락과 z-index](#/learn/css/wiki-stacking-context)에서 고정 요소와 다른 요소가 겹칠 때 앞뒤를 판단해 보세요.
fixed·sticky만 다루는 별도 Code Quest는 현재 연결되어 있지 않습니다.

## 공식 자료

- [CSS Positioned Layout의 fixed와 sticky](https://www.w3.org/TR/css-position-3/)
- [CSS Overflow Module Level 3](https://www.w3.org/TR/css-overflow-3/)
- [CSS Transforms의 렌더링 모델](https://www.w3.org/TR/css-transforms-1/#transform-rendering)

## 핵심 질문 답

보통 화면에 계속 고정할 요소는 흐름에서 빠지는 fixed를, 자신의 영역 안에서만 붙일 요소는 자리를 유지하는 sticky를 검토합니다.
fixed도 transform이 있는 조상 등을 기준으로 삼을 수 있으므로 실제 위치 기준을 확인합니다.
sticky는 inset·스크롤 거리·가까운 스크롤 컨테이너·자신의 containing block(위치 기준 박스)이 허용하는 이동 범위를 확인합니다.
어느 방식을 쓰든 확대된 내용과 키보드 포커스를 가리지 않아야 합니다.
