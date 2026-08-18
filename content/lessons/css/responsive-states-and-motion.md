# 반응형·상태와 움직임 접근성

## 학습 목표

- 유연한 콘텐츠와 레이아웃을 먼저 적용한 뒤 필요한 분기점만 추가할 수 있습니다.
- 미디어 쿼리 조건이 참일 때 선언이 캐스케이드 후보가 되는 과정을 설명할 수 있습니다.
- 가상 클래스와 가상 요소의 역할을 구분할 수 있습니다.
- hover뿐 아니라 키보드 focus 상태가 보이도록 스타일을 작성할 수 있습니다.
- `transform`, `transition`, `animation`을 구분하고 동작 줄이기 설정을 존중할 수 있습니다.

## 반응형은 미디어 쿼리만 뜻하지 않습니다

같은 페이지는 작은 휴대전화, 넓은 모니터, 화면 확대, 세로·가로 모드에서 열립니다. 특정 화면 너비에 맞춘 고정 크기만 사용하면 다른 환경에서 가로 스크롤이나 잘린 내용이 생길 수 있습니다.

반응형 설계는 다음 세 층으로 접근하세요.

1. **유연한 콘텐츠**: 이미지와 박스가 부모보다 커지지 않게 합니다.
2. **유연한 레이아웃**: Flexbox와 Grid가 남는 공간을 나누게 합니다.
3. **필요한 분기점**: 콘텐츠가 실제로 불편해지는 지점에서 미디어 쿼리를 추가합니다.

```css
img {
  display: block;
  max-width: 100%;
  height: auto;
}

.page {
  width: min(100% - 2rem, 70rem);
  margin-inline: auto;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}
```

이 규칙만으로도 많은 너비 변화에 대응할 수 있습니다. 화면이 좁다고 곧바로 미디어 쿼리를 늘리기보다 어느 요소가 왜 불편한지 관찰하세요.

## viewport 설정

모바일 브라우저가 문서의 CSS 픽셀 너비를 기기 너비에 맞춰 다루도록 HTML `head`에 viewport 설정을 둡니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

이 코드는 CSS가 아니라 HTML 설정이지만 너비 기반 미디어 쿼리를 의도대로 사용하기 위한 중요한 전제입니다. 확대를 막는 설정은 사용자의 글자 확대를 방해할 수 있으므로 추가하지 않습니다.

## 미디어 쿼리와 모바일 우선

```css
.learning-layout {
  display: grid;
  gap: 1rem;
}

@media (min-width: 48rem) {
  .learning-layout {
    grid-template-columns: 2fr 1fr;
  }
}
```

기본값은 한 열입니다. 현재 환경에서 `min-width: 48rem` 조건이 참일 때만 안쪽 선언도 캐스케이드 후보가 됩니다. 선택자와 앞선 캐스케이드 기준이 같다면 뒤에 있는 두 열 선언이 적용됩니다.

작은 화면의 단순한 구조를 기본으로 두고 공간이 충분할 때 기능과 열을 늘리는 방식을 모바일 우선 접근이라고 부릅니다. 작은 화면에서 내비게이션을 `display: none`으로 숨기기만 해서는 안 됩니다. 열기 버튼, 키보드 조작과 상태 표현이 함께 필요합니다.

### 분기점은 콘텐츠로 정하기

고정된 기기 이름의 숫자를 외우기보다 다음 과정으로 분기점을 찾습니다.

1. 가장 좁은 지원 너비에서 시작합니다.
2. 화면을 천천히 넓힙니다.
3. 문장 길이, 카드 너비, 조작 요소 간격이 어색해지는 지점을 찾습니다.
4. 그 위치에 분기점을 두고 앞뒤 너비를 다시 확인합니다.

미디어 쿼리 조건에서 사용하는 `em`과 `rem`은 일반 선언과 달리 사용자 에이전트의 초기 글자 크기를 기준으로 평가됩니다. 페이지의 `html { font-size: ... }` 값으로 분기점을 억지로 바꾸려 하지 마세요.

## 상태를 고르는 가상 클래스

가상 클래스는 DOM에 별도 클래스를 추가하지 않아도 요소의 상태나 구조 조건을 선택합니다.

```css
.button:hover {
  background-color: #2448cc;
}

.button:focus-visible {
  outline: 3px solid #fdb022;
  outline-offset: 2px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

input:checked + label {
  font-weight: 700;
}

.course-card:first-child {
  border-color: royalblue;
}
```

- `:hover`: 포인터가 요소 위에 있는 상태
- `:focus-visible`: 브라우저가 눈에 보이는 포커스 표시가 필요하다고 판단한 상태
- `:disabled`: 폼 컨트롤이 비활성화되어 조작할 수 없는 상태
- `:checked`: 체크박스나 라디오가 선택된 상태
- `:first-child`: 형제 중 첫 번째인 구조적 상태

터치 환경에는 지속적인 hover가 없을 수 있습니다. 중요한 내용과 조작을 hover에서만 제공하지 말고, 키보드 사용자가 현재 위치를 알 수 있는 focus 스타일도 유지하세요. 기본 outline을 제거했다면 최소한 그보다 분명한 대체 표시가 있어야 합니다.

## 가상 요소

가상 요소는 기존 요소의 특정 부분이나 CSS가 만드는 추상적인 부분을 선택합니다.

```css
.required-label::after {
  content: " *";
  color: #d92d20;
}

p::first-line {
  font-weight: 700;
}
```

가상 클래스는 보통 콜론 하나, 가상 요소는 콜론 두 개로 씁니다. `::before`와 `::after`의 `content`는 표현을 보조할 수 있지만 중요한 안내의 유일한 전달 수단으로 삼지 않습니다. HTML의 의미 구조를 대신하지 못합니다.

## transform, transition, animation

세 도구의 역할을 구분하세요.

```text
요소를 이동·회전·확대·축소 → transform
두 상태 사이의 변화 연결 → transition
여러 시점의 독립된 재생 정의 → animation
```

### transform

```css
.card:hover {
  transform: translateY(-0.25rem) scale(1.01);
}
```

일반적인 transform은 요소의 시각적 좌표계를 바꾸지만 정상 흐름에서 주변 박스의 자리를 다시 계산해 밀어내지 않습니다. `transform` 값이 `none`이 아니면 새 stacking context를 만들 수 있습니다.

### transition

```css
.button {
  background-color: #315efb;
  transform: translateY(0);
  transition:
    background-color 150ms ease,
    transform 150ms ease;
}

.button:hover,
.button:focus-visible {
  background-color: #2448cc;
  transform: translateY(-2px);
}
```

`transition`은 속성값이 바뀔 때 중간값을 계산합니다. `transition: all`은 예상하지 않은 속성까지 움직이게 하므로 바꿀 속성을 구체적으로 적는 편이 안전합니다.

### animation

```css
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.status-dot {
  animation: pulse 1.2s ease-in-out infinite;
}
```

Animation은 `@keyframes`로 여러 시점의 값을 정의하고 지속 시간, 반복 횟수, 방향 등을 제어합니다. 장식 목적의 무한 반복은 꼭 필요한지 먼저 검토하세요.

## 동작 줄이기 설정 존중하기

움직임은 일부 사용자에게 멀미나 집중 방해를 일으킬 수 있습니다. 사용자가 운영체제에서 불필요한 동작 줄이기를 요청했다면 다음처럼 감지할 수 있습니다.

```css
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .status-dot {
    animation: none;
  }
}
```

앞에서 동작을 선언한 실제 선택자와 같거나 충분한 우선순위로 뒤에서 재정의해야 합니다. 모든 상태 변화를 숨기기보다 장식적인 이동과 반복을 제거하고 필요한 상태 변화는 즉시 보여 주세요.

## 반응형 확인표

- 320px 안팎의 좁은 화면에서 가로 스크롤이 생기지 않는가?
- 글자를 200% 확대해도 내용과 조작 요소가 잘리지 않는가?
- 긴 제목과 빈 내용에서도 카드가 겹치지 않는가?
- 포인터 없이 Tab 키로 현재 위치를 알 수 있는가?
- hover가 없어도 모든 정보와 기능에 접근할 수 있는가?
- 동작 줄이기 환경에서 장식 애니메이션이 제거되는가?
- CSS 시각 순서와 DOM 읽기 순서가 어긋나지 않는가?

## 흔한 실수

- 고정 width 하나로 모든 화면을 처리합니다.
- 미디어 쿼리를 기기 이름별 목록처럼 늘립니다.
- viewport 설정 없이 모바일 너비 결과를 단정합니다.
- hover에만 중요한 안내나 조작을 둡니다.
- 기본 focus outline을 대체 표시 없이 제거합니다.
- `transition: all`을 습관적으로 사용합니다.
- transform이 주변 요소를 밀어낼 것이라고 생각합니다.
- 무한 애니메이션을 만들고 reduced motion을 확인하지 않습니다.

## 확인 문제

1. 미디어 쿼리보다 먼저 적용할 반응형의 두 층은 무엇인가요?
2. `@media (min-width: 48rem)`의 선언은 언제 캐스케이드 후보가 되나요?
3. `:hover`와 `::after`는 각각 가상 클래스와 가상 요소 중 무엇인가요?
4. hover 스타일만 있고 focus 스타일이 없다면 어떤 사용자가 현재 위치를 놓칠 수 있나요?
5. transform으로 요소를 위로 옮기면 정상 흐름의 주변 요소도 함께 이동하나요?
6. transition과 animation은 각각 어떤 변화에 알맞나요?
7. `prefers-reduced-motion`을 확인해야 하는 이유를 설명해 보세요.

## 공식 출처

- [W3C Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/)
- [W3C Selectors Level 4 — Pseudo-classes](https://www.w3.org/TR/selectors-4/#pseudo-classes)
- [W3C CSS Transitions Level 1](https://www.w3.org/TR/css-transitions-1/)
- [W3C CSS Transforms Module Level 1](https://www.w3.org/TR/css-transforms-1/)
- [W3C CSS Animations Level 1](https://www.w3.org/TR/css-animations-1/)
- [MDN — Responsive web design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
