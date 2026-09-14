# CSS 모션: 변형·전환·애니메이션과 동작 줄이기

## 학습 목표

transform·transition·animation을 목적에 맞게 구분하고 움직임을 줄여도 포커스와 상태 표시를 유지할 수 있습니다.

## 한줄 요약

시각 변형·두 상태 전환·여러 시점 재생을 구분하고 동작 줄이기에서는 장식 움직임을 줄이되 정보는 남깁니다.

## 먼저 확인할 개념

[가상 클래스·가상 요소와 상태 표시](#/learn/css/wiki-states), [미디어 쿼리](#/learn/css/wiki-responsive)를 먼저 확인해 보세요.

## 변화의 목적에 맞는 도구를 고른다

| 도구 | 하는 일 | 먼저 확인할 점 |
| --- | --- | --- |
| transform | 배치가 끝난 상자를 이동·확대·회전 | 주변 일반 흐름의 자리를 밀어내려는 것인가? |
| transition | 속성의 이전 값과 새 값 사이를 일정 시간에 걸쳐 연결 | 실제 값 변화와 지속 시간이 있는가? |
| animation | keyframes로 여러 시점의 재생을 정의 | 반복이나 여러 단계가 정말 필요한가? |

일반적인 transform은 시각적 위치를 바꾸지만 주변 박스의 일반 흐름 자리를 다시 계산해 밀어내지 않는다.
값이 `none`이 아니면 쌓임 맥락과 자손의 위치 기준에도 영향을 줄 수 있다.
간격 자체를 바꾸고 싶다면 배치·간격 도구부터 검토한다.

## 상태를 먼저 보이고 이동을 더한다

다음은 `<button class="action" type="button">확인</button>`의 두 상태를 연결하는 예다.
움직임을 빼도 버튼의 상태와 키보드 위치를 알 수 있을지 먼저 찾아보자.

```css
.action {
  color: #174ea6;
  background: #fff;
  border: 2px solid currentColor;
  transition: transform 180ms ease;
}

.action:hover {
  background: #e8f0fe;
}

.action:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}

@media (hover: hover) {
  .action:hover {
    transform: translateY(-0.25rem);
  }
}

.action:focus-visible {
  transform: translateY(-0.25rem);
}
```

transition은 transform 값이 바뀔 때 180ms 동안 그 변화를 연결한다.
지속 시간의 기본값은 0s이므로 시간을 빼면 눈에 보이는 전환이 없다.
`transition: all` 대신 변할 속성을 구체적으로 정하면 의도하지 않은 이동을 줄일 수 있다.
`:focus-visible`은 브라우저가 보이는 초점 표시가 필요하다고 판단한 상태이며 단순히 키보드 전용이라는 뜻은 아니다.

## 움직임을 줄여도 상태는 남긴다

키보드로 이동할 때는 `:focus-visible` 등의 분명한 표시로 현재 위치를 알아볼 수 있어야 한다.
`prefers-reduced-motion: reduce`는 불필요한 움직임을 줄여 달라는 신호이며 포커스나 상태 정보까지 숨기라는 뜻이 아니다.
전환·장식 이동·반복은 줄이고 테두리·배경·문구 등 필요한 단서는 남긴다.

앞 CSS 뒤에 같은 상태 선택자로 다음 규칙을 둔다.

```css
@media (prefers-reduced-motion: reduce) {
  .action {
    transition: none;
  }

  .action:hover,
  .action:focus-visible {
    transform: none;
  }
}
```

이 예에서는 hover와 focus의 이동을 없애도 배경 변화와 포커스 테두리가 남는다.
지속 시간만 0으로 바꾸면 위치 자체는 계속 바뀔 수 있으므로 실제 이동 선언까지 확인한다.
Tab·Shift+Tab과 모션 감소 설정으로 움직임 없이도 현재 위치를 알아볼 수 있는지 확인해 보자.

## 선택 확장: 여러 시점의 재생

`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`처럼 시점을 정하고 `animation: pulse 1.2s ease-in-out`으로 재생할 수 있다.
여러 단계가 없는 앞 버튼 예에는 transition이면 충분하다.
장식의 무한 반복을 추가하기 전에 필요성을 판단하고, reduce 조건에서는 해당 요소의 animation도 none으로 재정의한다.

`no-preference`는 사용자가 모션을 좋아한다는 뜻이 아니라 감소 설정을 전달하지 않았다는 뜻이다.
이 조건 하나로 자동 재생·번쩍임·일시 정지 등 모든 접근성 요구가 해결되지는 않는다.

## 이어서 연습하기

[CSS 레이아웃 종합 진단](#/learn/css/wiki-layout-review)에서 키보드와 사용자 설정도 화면을 판단하는 조건으로 함께 살펴보세요.
모션만 다루는 별도 Code Quest는 현재 연결되어 있지 않습니다.

## 공식 자료

- [CSS Transitions Level 1](https://www.w3.org/TR/css-transitions-1/)
- [CSS Animations Level 1](https://www.w3.org/TR/css-animations-1/)
- [Media Queries의 prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

## 핵심 질문 답

상자를 시각적으로 옮기거나 변형할 때 transform, 두 상태의 값 변화를 이어 줄 때 transition, 여러 시점의 재생이 필요할 때 animation을 고릅니다.
동작 줄이기에서는 장식 이동·전환·반복을 줄이면서 상태를 알리는 배경·테두리·문구를 유지합니다.
특히 hover와 focus에 실제로 적용한 이동을 함께 없애고 키보드 포커스 표시는 지우지 않습니다.
모션이 없어도 같은 정보와 조작 상태를 알아볼 수 있어야 합니다.
