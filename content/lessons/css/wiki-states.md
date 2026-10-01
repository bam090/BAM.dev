# 상태 표시와 모션: 가상 클래스·가상 요소·transition

## 학습 목표

- 가상 클래스로 요소의 현재 상태를 골라 hover 없이도 포커스와 상태를 알아볼 수 있는 표시를 만들 수 있습니다.
- 가상 요소로 요소의 일부를 꾸미되 중요한 안내는 HTML에 남길 수 있습니다.
- 상태가 바뀌는 순간에 `transform`·`transition`·`animation` 가운데 목적에 맞는 도구로 움직임을 더할 수 있습니다.
- 동작 줄이기 설정에서 장식 움직임을 없애도 포커스와 상태 표시는 그대로 남길 수 있습니다.

## 먼저 확인할 개념

[CSS 기초: 적용 방법과 선택자](#/learn/css/wiki-css-basics)와 [읽기 쉬운 글자: 단위·글꼴·색](#/learn/css/wiki-units)을 먼저 확인해 보세요.
동작 줄이기에서 쓰는 조건문은 [유연한 배치와 미디어 쿼리](#/learn/css/wiki-responsive)와 같은 문법입니다.

## 상태 표시란

상태 표시는 요소가 지금 어떤 상태인지 화면에서 알아볼 수 있게 보여 주는 스타일입니다.
포인터가 버튼 위에 있는지·키보드 초점이 어디에 있는지·버튼을 누를 수 없는지가 모두 상태입니다.
사용자는 이 표시를 보고 무엇을 할 수 있는지 판단합니다.

CSS는 세 가지 도구로 상태 표시를 만듭니다.
가상 클래스는 요소의 상태를 고르고 가상 요소는 요소의 일부를 고릅니다.
그리고 모션은 한 상태에서 다른 상태로 바뀌는 과정을 움직임으로 보여 줍니다.

예를 들어 마을 행사 신청 폼을 만든다고 해 보겠습니다.
이 폼에는 네 가지 요구가 있습니다.

- 도움말 링크에 포인터를 올리거나 Tab으로 이동하면 알아볼 수 있게 합니다.
- 신청이 마감된 버튼은 누를 수 없는 상태로 보입니다.
- 이름 칸이 필수 입력이라는 것을 알립니다.
- 신청 버튼은 상태가 바뀔 때 살짝 떠오르되 동작 줄이기 설정을 존중합니다.

이 문서는 이 폼 하나로 가상 클래스와 가상 요소와 모션을 차례로 살펴봅니다.

---

## 가상 클래스의 종류

가상 클래스는 HTML에 class를 따로 붙이지 않아도 요소의 상태나 구조 조건을 선택합니다.
그래서 화면 너비나 입력 장치 능력을 묻는 미디어 쿼리와 달리 요소 하나하나의 상태를 고릅니다.
가상 클래스는 `:hover`처럼 콜론 하나로 적습니다.

| 가상 클래스 | 고르는 상태 | 구별할 점 |
| --- | --- | --- |
| `:hover` | 포인터가 위에 있음 | 터치 화면에서는 없거나 다르게 동작함 |
| `:focus` | 입력 초점을 가짐 | 마우스·키보드·스크립트 어느 쪽으로도 생김 |
| `:focus-visible` | 브라우저가 보이는 초점 표시가 필요하다고 판단함 | 키보드 전용 상태와 같은 뜻은 아님 |
| `:active` | 버튼 등을 누르고 있는 순간 | 현재 선택된 메뉴 상태와 다름 |
| `:disabled` | HTML이 정한 비활성 폼 상태 | class 이름이 disabled인 것과 다름 |
| `:checked` | 체크박스·라디오 등이 선택됨 | 실제 입력 상태를 고름 |

`:first-child`처럼 형제 가운데 첫 번째라는 구조 조건을 고르는 가상 클래스도 있습니다.

이 가운데 신청 폼에 필요한 `:hover`·`:focus-visible`·`:disabled`를 실제로 써 보겠습니다.

## 가상 클래스 사용법

다음 CSS는 `<a class="action-link" href="/help">도움말</a>`에 적용하는 규칙입니다.
포인터를 올렸을 때와 Tab으로 이동했을 때 어떤 표시가 생길지 예상해 보세요.

```css
.action-link {
  color: #5b34a8;
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

button:disabled {
  border: 3px solid navy;
}
```

마감된 버튼 두 개는 다음과 같이 적었습니다.

```html
<button id="first" class="disabled" type="button">첫째</button>
<button id="second" disabled type="button">둘째</button>
```

![위는 도움말 링크의 세 상태다. 기본은 보라 글자에 밑줄이 있고 hover는 밑줄만 굵어진다. focus-visible은 글자색과 같은 보라 테두리가 링크를 둘러싼다. 아래는 button disabled 규칙의 결과다. class가 disabled인 첫째 버튼은 테두리가 그대로이고 disabled 속성이 있는 둘째 버튼만 굵은 남색 테두리를 받았다.](content/assets/css/states-pseudo-classes.png)

hover에서는 밑줄만 굵어졌고 Tab으로 이동하자 링크 둘레에 테두리가 생겼습니다.
`currentColor`는 현재 글자색이라서 테두리가 링크 글자와 같은 색으로 그려집니다.
키보드 사용자는 이 테두리를 보고 현재 위치를 압니다.
그래서 대체 표시 없이 `outline: none`을 주면 키보드 위치를 잃게 됩니다.

`:focus-visible`은 브라우저가 보이는 초점 표시가 필요하다고 판단한 상태입니다.
보통 키보드로 이동할 때 이 상태가 되지만 키보드 전용이라는 뜻은 아닙니다.
실제 화면에서는 포커스 표시와 바로 맞닿는 색의 대비와 고정 요소에 가려지지 않는지도 확인합니다.

아래 버튼에서는 둘째만 테두리를 받았습니다.
`:disabled`는 HTML의 `disabled` 속성이 만든 실제 비활성 상태를 고르기 때문입니다.
첫째의 `class="disabled"`는 이름이 disabled인 클래스일 뿐이고 이 클래스를 고르는 선택자는 `.disabled`입니다.

> [!question]- hover에만 둔 안내는 누가 못 보나요?
> 터치 화면 사용자와 키보드 사용자는 hover 상태를 계속 유지할 수 없습니다.
> 그래서 중요한 설명이나 기능을 hover에만 숨기지 않습니다.
> 색 하나만 바꾸는 대신 밑줄·테두리·문구처럼 다른 단서도 함께 남깁니다.

가상 클래스는 요소 전체의 상태를 골랐습니다.
다음은 요소 전체가 아니라 요소의 일부를 고르는 가상 요소입니다.

---

## 가상 요소 사용법

신청 폼 안내문의 첫 줄을 굵게 하고 이름 칸이 필수 입력이라는 것을 별표로 알린다고 해 보겠습니다.

```css
p::first-line {
  font-weight: 700;
}

.required-label::after {
  content: " *";
}
```

CSS가 불러와지지 않으면 별표가 어떻게 될지 예상해 보세요.

![필수 입력 안내 비교다. 별표를 after로만 표시한 이름 칸은 CSS가 있으면 이름 뒤에 빨간 별표가 보이지만 CSS가 없으면 이름만 남는다. HTML에 이름 필수라고 적은 칸은 CSS가 있든 없든 필수라는 글자가 보인다.](content/assets/css/states-generated-label.png)

가상 요소는 첫 줄처럼 기존 요소의 특정 부분이나 CSS가 만드는 추상적인 부분을 선택합니다.
가상 클래스는 보통 콜론 하나로 적고 가상 요소는 콜론 두 개로 적습니다.
`::before`·`::after`의 content는 HTML 의미 구조를 대신하지 않습니다.
필수 입력 안내처럼 중요한 정보는 HTML에도 적고 생성된 별표를 유일한 안내로 쓰지 않습니다.

생성된 별표는 CSS가 없으면 사라졌습니다.
`::after`의 글자는 HTML 문서에 없고 CSS가 그려 넣은 것이기 때문입니다.
그래서 label 문구를 `이름 (필수)`처럼 HTML에 적고 입력 제약은 `required` 속성으로 유지합니다.

```html
<label for="name">이름 (필수)</label>
<input id="name" name="name" required>
```

> [!note]- 가상 요소를 콜론 하나로 적은 코드도 있나요?
> 오래된 코드에서는 `:before`·`:after`처럼 콜론 하나로 적기도 합니다.
> 브라우저는 `:before`·`:after`·`:first-line`·`:first-letter` 네 가지만 옛 표기로도 알아듣습니다.
> 그래서 가상 요소라는 것이 드러나도록 늘 콜론 두 개로 적습니다.

이제 신청 버튼의 상태가 바뀔 때 움직임을 더해 보겠습니다.

---

## 모션의 종류

CSS에서 움직임을 만드는 도구는 하는 일에 따라 셋으로 나뉩니다.

| 도구 | 하는 일 | 먼저 확인할 점 |
| --- | --- | --- |
| `transform` | 배치가 끝난 상자를 이동·확대·회전함 | 주변 요소를 밀어내야 하는가 |
| `transition` | 속성의 이전 값과 새 값 사이를 일정 시간에 걸쳐 이음 | 실제 값 변화와 지속 시간이 있는가 |
| `animation` | `@keyframes`로 여러 시점의 재생을 정함 | 반복이나 여러 단계가 정말 필요한가 |

다음은 `<button class="action" type="button">신청하기</button>`에 적용하는 규칙입니다.
포인터를 올리거나 Tab으로 이동하면 버튼이 0.25rem 떠오릅니다.
`@media (hover: hover)`는 포인터를 올려 둘 수 있는 기기에서만 hover 이동을 적용하는 조건입니다.

```css
.action {
  color: #5b34a8;
  background: #fff;
  border: 2px solid currentColor;
  transition: transform 180ms ease;
}

.action:hover {
  background: #f0ebfa;
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

버튼이 떠오를 때 아래 문단도 함께 움직일지 예상해 보세요.

![신청 버튼이 움직이는 세 장면이다. 첫째 기본 상태는 버튼이 점선으로 표시한 원래 자리에 있다. 둘째 포인터를 올리고 90ms 뒤에는 배경이 연보라로 바뀌었고 버튼이 0.25rem 가운데 대부분 올라가 있다. 셋째 Tab으로 이동하고 180ms 뒤에는 버튼이 0.25rem 올라가 포커스 테두리에 둘러싸여 있다. 세 장면 모두 아래 문단은 같은 자리에 있다.](content/assets/css/states-motion-transform.png)

배경은 바로 바뀌었고 이동만 180ms에 걸쳐 이어졌습니다.
`transition`에 `transform`만 적었기 때문입니다.
지속 시간의 기본값은 0s이므로 시간을 빼면 눈에 보이는 전환이 없습니다.
`transition: all` 대신 변할 속성을 구체적으로 적으면 의도하지 않은 움직임을 줄일 수 있습니다.

버튼이 떠올라도 아래 문단은 움직이지 않았습니다.
`transform`은 보이는 위치만 바꾸고 일반 흐름의 자리는 다시 계산하지 않기 때문입니다.
그래서 간격 자체를 바꾸고 싶다면 margin이나 배치 도구를 씁니다.

> [!note]- transform이 위치 지정에도 영향을 주나요?
> `transform`이 `none`이 아니면 그 요소는 새 쌓임 맥락을 만듭니다.
> 그리고 `absolute`나 `fixed`인 자손의 위치 기준 박스가 됩니다.
> 자세한 내용은 [CSS 위치 지정: position과 z-index](#/learn/css/wiki-positioning)에서 살펴봅니다.

그런데 움직임이 불편하거나 어지러운 사용자도 있습니다.
이런 사용자는 운영체제에서 동작 줄이기를 켜 둡니다.

## 동작 줄이기 사용법

키보드로 이동할 때는 `:focus-visible` 같은 분명한 표시로 현재 위치를 알아볼 수 있어야 합니다.
`prefers-reduced-motion: reduce`는 불필요한 움직임을 줄여 달라는 신호이며 포커스나 상태 정보까지 숨기라는 뜻이 아닙니다.
그래서 전환·장식 이동·반복은 줄이고 테두리·배경·문구 같은 필요한 단서는 남깁니다.

앞 CSS 뒤에 다음 규칙을 둡니다.

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

`transition: none`만 적었다면 버튼이 어떻게 보일지 예상해 보세요.

![동작 줄이기를 켠 브라우저에서 본 신청 버튼 세 경우다. 첫째 reduce 규칙이 없으면 포인터를 올린 버튼과 Tab으로 이동한 버튼이 모두 원래 자리보다 올라가 있다. 둘째 transition none만 추가해도 두 버튼은 여전히 올라가 있다. 셋째 transform none까지 추가하면 두 버튼이 원래 자리에 있고 포인터를 올린 버튼의 연보라 배경과 Tab으로 이동한 버튼의 포커스 테두리는 그대로 남아 있다.](content/assets/css/states-reduced-motion.png)

`transition: none`만 적은 둘째 경우에도 버튼은 올라가 있습니다.
전환을 없애면 중간 과정만 사라지고 `translateY(-0.25rem)`이라는 최종 값은 그대로이기 때문입니다.
그래서 사용자는 부드러운 이동 대신 갑자기 튀어 오르는 버튼을 보게 됩니다.
지속 시간만 0으로 바꾸는 것도 같은 결과이므로 hover와 focus에 적용한 이동 선언까지 `none`으로 바꿉니다.

셋째 경우에는 버튼이 제자리에 있습니다.
그래도 연보라 배경과 포커스 테두리가 남아 있어 상태와 키보드 위치를 알 수 있습니다.
이 규칙은 같은 선택자를 뒤에 적어 앞 규칙을 덮어쓰므로 반드시 앞 CSS보다 뒤에 둡니다.
Tab·Shift+Tab과 동작 줄이기 설정으로 움직임 없이도 현재 위치를 알아볼 수 있는지 직접 확인해 보세요.

> [!note]- 여러 시점을 재생하는 animation은 어떻게 줄이나요?
> `@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`처럼 시점을 정하고 `animation: pulse 1.2s ease-in-out`으로 재생합니다.
> 신청 버튼처럼 두 상태만 오가는 움직임에는 transition이면 충분합니다.
> 장식을 무한 반복하기 전에 꼭 필요한지 판단하고 reduce 조건에서는 그 요소의 `animation`도 `none`으로 바꿉니다.

> [!note]- no-preference는 무슨 뜻인가요?
> `prefers-reduced-motion: no-preference`는 사용자가 모션을 좋아한다는 뜻이 아닙니다.
> 동작 줄이기 설정을 알리지 않았다는 뜻입니다.
> 자동 재생·번쩍임·일시 정지 같은 다른 접근성 요구는 이 조건과 따로 확인합니다.

---

## 상태 표시와 모션의 활용

지금까지 신청 폼의 네 요구를 모두 풀었습니다.
실제 화면에서는 요구에서 거꾸로 도구를 찾아가면 됩니다.

| 요구 | 고를 도구 | 함께 확인할 것 |
| --- | --- | --- |
| 포인터를 올린 요소를 알린다 | `:hover` | 같은 정보를 hover 밖에서도 얻을 수 있는지 봅니다 |
| 키보드 위치를 보인다 | `:focus-visible`과 `outline` | 대비와 가려짐을 확인합니다 |
| 누를 수 없는 버튼을 표시한다 | HTML `disabled`와 `:disabled` | 클래스 이름만으로는 상태가 되지 않습니다 |
| 요소의 일부를 꾸민다 | `::first-line`·`::after` | 중요한 안내는 HTML에 적습니다 |
| 상태 변화를 부드럽게 잇는다 | `transform`과 `transition` | 변할 속성만 적습니다 |
| 동작 줄이기를 존중한다 | `prefers-reduced-motion: reduce` | 전환과 이동 선언을 함께 없애고 상태 표시는 남깁니다 |

움직임이 없어도 같은 정보와 조작 상태를 알아볼 수 있어야 상태 표시가 끝난 것입니다.

## 정리

- 가상 클래스는 hover·focus·disabled처럼 요소의 상태를 고르며 `:disabled`는 HTML 속성이 만든 실제 상태만 고릅니다.
- 가상 요소는 요소의 일부나 CSS가 만드는 부분을 고르며 생성된 content는 CSS가 없으면 사라지므로 중요한 안내는 HTML에 적습니다.
- 모션은 목적에 맞게 `transform`·`transition`·`animation`을 고르고 동작 줄이기에서는 전환과 이동 선언을 함께 없애되 포커스와 상태 표시는 남깁니다.

## 이어서 연습하기

[초점이 보이는 버튼 상태 만들기](#/quest/css/visible-keyboard-focus)에서 hover 없이도 알아볼 수 있는 버튼 상태를 직접 작성해 보세요.
다음으로 [CSS 레이아웃 종합 진단](#/learn/css/wiki-layout-review)에서 키보드와 사용자 설정도 화면을 판단하는 조건으로 함께 살펴보세요.

## 공식 자료

- [Selectors Level 4의 가상 클래스](https://www.w3.org/TR/selectors-4/#pseudo-classes)
- [CSS Transforms Module Level 1](https://www.w3.org/TR/css-transforms-1/)
- [Media Queries Level 5의 prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

## 핵심 질문 답

가상 클래스는 hover·focus·disabled처럼 요소의 상태를 고르고 가상 요소는 첫 줄이나 CSS가 만드는 부분을 고릅니다.
hover 없이도 정보와 기능에 닿을 수 있어야 하며 키보드로 이동할 때는 `:focus-visible` 표시로 현재 위치가 계속 보여야 합니다.
필수 입력처럼 중요한 안내는 생성된 content 하나에 맡기지 않고 HTML에 적습니다.
모션은 `transform`·`transition`·`animation` 가운데 목적에 맞게 고르고 동작 줄이기에서는 전환과 hover·focus의 이동 선언을 함께 없애되 배경·테두리 같은 상태 표시는 남깁니다.
