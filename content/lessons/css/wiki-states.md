# 가상 클래스·가상 요소와 상태 표시

## 학습 목표

요소의 상태와 표현되는 부분을 구분하고 hover 없이도 상태를 알아볼 수 있는 표시를 고를 수 있습니다.

## 한줄 요약

가상 클래스는 요소의 상태나 조건을, 가상 요소는 특정 부분을 선택하며 중요한 정보는 HTML과 보이는 상태 표시로 유지합니다.

## 먼저 확인할 개념

[선택자로 원하는 요소 찾기](#/learn/css/wiki-selectors), [색과 대비로 정보 전달하기](#/learn/css/wiki-color-contrast)를 먼저 확인해 보세요.

## 지금 요소가 어떤 상태인지 고른다

가상 클래스는 DOM에 별도 class를 붙이지 않고 요소의 상태나 구조 조건을 선택한다.
화면 너비·입력 장치 능력을 묻는 미디어 쿼리와 개별 요소 상태를 구별한다.

| 가상 클래스 | 뜻 | 구별할 점 |
| --- | --- | --- |
| :hover | 포인터가 위에 있음 | 터치에서는 없거나 다를 수 있음 |
| :focus | 입력 초점을 가짐 | 마우스·키보드·스크립트로 생길 수 있음 |
| :focus-visible | 브라우저가 보이는 초점 표시가 필요하다고 판단함 | 키보드 전용이라고 단정하지 않음 |
| :active | 버튼 등을 누르고 있는 순간 | 현재 메뉴 선택 상태와 다름 |
| :disabled | HTML이 정의한 비활성 폼 상태 | class 이름만 disabled인 것과 다름 |
| :checked | 체크박스·라디오 등이 선택됨 | 실제 입력 상태를 선택함 |

`:first-child`처럼 형제 중 첫 번째라는 구조 조건을 고르는 가상 클래스도 있다.

## hover가 없어도 위치를 알아야 한다

다음 CSS는 `<a class="action-link" href="/help">도움말</a>`에 적용하는 예다.
포인터를 올렸을 때와 Tab으로 이동했을 때 어떤 표시가 남을지 살펴보자.

```css
.action-link {
  color: #174ea6;
  background-color: #fff;
  text-underline-offset: 0.2em;
}

.action-link:hover {
  text-decoration-thickness: 0.15em;
}

.action-link:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}
```

`currentColor`는 현재 글자색이다.
실제 화면에서는 포커스 표시와 바로 맞닿는 색의 대비, 고정 요소에 가려지는지도 확인한다.
대체 표시 없는 `outline: none`은 현재 키보드 위치를 잃게 할 수 있다.

중요한 설명이나 기능을 hover에만 숨기지 않는다.
색 하나만 바꾸는 대신 밑줄·테두리·문구처럼 다른 단서도 남긴다.

## 가상 요소는 요소의 부분을 다룬다

```css
p::first-line {
  font-weight: 700;
}

.required-label::after {
  content: " *";
}
```

가상 요소는 첫 줄처럼 기존 요소의 특정 부분이나 CSS가 만드는 추상적인 부분을 선택한다.
가상 클래스는 보통 콜론 하나, 가상 요소는 두 개로 적는다.
`::before`·`::after`의 content는 HTML 의미 구조를 대신하지 않는다.
필수 입력 안내처럼 중요한 정보는 HTML에도 명시하고 생성된 별표만 유일한 안내로 쓰지 않는다.

## 이어서 연습하기

[CSS 모션: 변형·전환·애니메이션과 동작 줄이기](#/learn/css/wiki-motion)에서 상태 표시를 남긴 채 장식 움직임을 조절해 보세요.
가상 클래스·가상 요소만 다루는 별도 Code Quest는 현재 연결되어 있지 않습니다.

## 공식 자료

- [Selectors Level 4의 가상 클래스](https://www.w3.org/TR/selectors-4/#pseudo-classes)
- [CSS Pseudo-Elements Module Level 4](https://www.w3.org/TR/css-pseudo-4/)
- [WAI Focus Visible 이해하기](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

## 핵심 질문 답

가상 클래스는 hover·focus·checked처럼 요소의 상태나 조건을 고르고, 가상 요소는 첫 줄이나 생성되는 부분을 고릅니다.
hover 없이도 정보와 기능에 도달할 수 있어야 하며 키보드로 이동할 때는 포커스가 계속 보여야 합니다.
focus-visible은 브라우저가 보이는 표시가 필요하다고 판단한 상태이며 중요한 안내를 색이나 생성된 content 하나로만 전달하지 않습니다.
