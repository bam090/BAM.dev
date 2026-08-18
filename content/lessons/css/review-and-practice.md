# CSS 복습과 실습

## 학습 목표

- CSS 문제를 속성 암기가 아니라 브라우저 처리 순서에 따라 진단할 수 있습니다.
- 선택자, 캐스케이드, 박스, 레이아웃과 반응형 개념을 한 화면에 연결할 수 있습니다.
- 요구사항을 관찰 가능한 작은 단계로 나누고 한 단계씩 구현할 수 있습니다.
- 키보드 포커스, 긴 콘텐츠, 확대 화면과 동작 줄이기를 완료 조건에 포함할 수 있습니다.

## 한 장으로 연결하기

CSS가 화면에 적용되는 과정을 다음 순서로 기억하세요.

```text
HTML과 CSS 파일 읽기
→ 현재 환경에서 유효한 규칙 확인
→ 선택자가 요소와 일치하는지 검사
→ 캐스케이드와 상속으로 최종값 결정
→ display와 박스 크기 계산
→ 정상 흐름·Flexbox·Grid·position으로 배치
→ 배경·글자·테두리와 효과 그리기
```

실제 브라우저 엔진은 성능을 위해 단계를 생략하거나 묶을 수 있습니다. 학습할 때는 문제를 위에서 아래로 좁히기 위한 관찰 지도라고 이해하면 됩니다.

| 보이는 문제 | 먼저 확인할 개념 |
| --- | --- |
| CSS가 전혀 적용되지 않음 | `<link>` 경로, 파일 요청 |
| 원하는 요소와 다른 요소가 바뀜 | 선택자와 결합자 |
| 선언이 취소선으로 표시됨 | 캐스케이드, specificity, 순서 |
| 자식 글자도 함께 바뀜 | 상속 |
| 박스가 지정 너비보다 큼 | box model, `box-sizing` |
| 같은 줄 또는 새 줄 배치가 다름 | `display` |
| 한 축 정렬이 어긋남 | Flexbox 주축·교차축 |
| 행과 열이 함께 어긋남 | Grid track |
| 배지가 카드가 아닌 화면을 기준으로 움직임 | position 기준 조상 |
| 좁은 화면에서만 넘침 | 유연한 크기, overflow, media query |
| 마우스에서는 보이지만 키보드에서는 안 보임 | hover와 focus 상태 |

## 개발자 도구 진단 순서

CSS가 예상과 다를 때 속성을 더 쓰기 전에 다음 순서로 확인하세요.

1. Network 패널에서 CSS 파일 요청이 성공했는지 봅니다.
2. Elements 패널에서 실제 태그·클래스·속성을 확인합니다.
3. Styles 패널에서 목표 규칙이 나타나는지 확인합니다.
4. 취소선이 있다면 같은 속성에서 이긴 선언을 찾습니다.
5. Computed 패널에서 최종값과 값의 출처를 확인합니다.
6. Box Model에서 content, padding, border, margin을 확인합니다.
7. Flexbox·Grid overlay로 축, track과 gap을 확인합니다.
8. 화면 너비, 글자 확대, 키보드와 사용자 설정을 바꿔 다시 확인합니다.

한 번에 여러 속성을 고치면 무엇이 원인이었는지 알기 어렵습니다. 가설 하나를 세우고 값 하나를 바꾼 뒤 결과를 기록하세요.

## 실습 1. 알림 카드 단계별 구현

다음 HTML은 수정하지 않고 CSS만 작성합니다.

```html
<article class="notice-card">
  <span class="notice-card__badge">NEW</span>
  <h2 class="notice-card__title">학습 알림</h2>
  <p>오늘 복습할 내용이 있습니다.</p>
  <div class="notice-card__actions">
    <button type="button">확인</button>
    <button type="button">나중에</button>
  </div>
</article>
```

### 요구사항

- 카드의 border box는 최대 30rem이며 좁은 부모보다 넓어지지 않습니다.
- 콘텐츠와 테두리 사이에는 1rem 간격이 있습니다.
- NEW 배지는 카드 오른쪽 위에 겹칩니다.
- 버튼 두 개는 한 줄로 놓이고 부모가 간격을 관리합니다.
- 키보드 focus 표시가 분명해야 합니다.

### 구현 순서

1. 모든 박스가 `border-box`를 사용하게 합니다.
2. 카드 너비, padding과 border만 먼저 작성합니다.
3. 카드가 배지의 위치 기준이 되게 합니다.
4. 배지를 absolute로 배치합니다.
5. 버튼 부모를 Flexbox로 만들고 `gap`을 지정합니다.
6. 버튼의 `:focus-visible` 상태를 만듭니다.
7. 제목을 길게 바꾸고 320px 너비에서 겹침을 확인합니다.

### 단계별 힌트

첫 힌트: 카드 자신이 배지의 기준이 되려면 어떤 `position` 값이 필요할까요?

두 번째 힌트: 버튼이 직접 자식인 요소에 `display: flex`를 적용해야 합니다.

세 번째 힌트: `width: min(100%, 30rem)`과 명시적인 focus outline을 각각 검토하세요.

## 실습 2. 반응형 강의 목록

```html
<section class="course-list">
  <article class="course-card">
    <img src="course-css.png" alt="CSS 카드 배치 예시" />
    <h2>CSS 기초</h2>
    <p>선택부터 반응형 레이아웃까지 연결합니다.</p>
    <div class="course-card__actions">
      <button type="button">담기</button>
      <a href="#details">자세히 보기</a>
    </div>
  </article>
</section>
```

### 요구사항

- 목록은 좁을 때 한 열이고 공간이 넓어지면 가능한 만큼 열이 늘어납니다.
- 한 열의 희망 최소 너비는 16rem이지만 아주 좁은 부모를 넘지 않습니다.
- 이미지가 카드보다 넓어지지 않고 원본 비율을 유지합니다.
- 카드 내부 조작 영역은 한 축 레이아웃을 사용합니다.
- CSS로 카드의 시각 순서를 바꾸지 않습니다.

### 관찰하며 구현하기

1. 이미지에 `max-width: 100%`와 비율을 유지할 값을 적용합니다.
2. 목록을 Grid로 만들되 먼저 한 열에서 확인합니다.
3. `repeat()`, `auto-fit`, `minmax()`로 열을 유연하게 정의합니다.
4. 조작 영역에는 Flexbox와 `gap`을 적용합니다.
5. 같은 구조의 카드를 두 개 더 복제합니다.
6. 제목을 한 글자와 매우 긴 문장으로 바꾸어 비교합니다.
7. 320px부터 화면을 넓히며 열 수가 바뀌는 지점을 기록합니다.

시작점만 필요하다면 다음 구조를 완성해 보세요.

```css
.course-list {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 16rem), 1fr)
  );
  /* 자식 사이 간격 */
}

.course-card__actions {
  /* 한 축 레이아웃 */
}
```

## 실습 3. 모바일 우선 학습 화면

```html
<main class="learning-page">
  <article class="learning-content">주요 교안</article>
  <aside class="learning-note">보조 설명</aside>
</main>
```

### 요구사항

- 기본은 읽기 순서와 같은 한 열입니다.
- 전체 본문은 넓은 화면에서도 70rem을 넘지 않습니다.
- 공간이 충분할 때만 `2fr 1fr` 두 열로 바뀝니다.
- 분기점은 기기 이름이 아니라 콘텐츠가 답답해지는 위치에서 정합니다.
- 장식적인 hover 이동은 focus에서도 상태를 이해할 수 있어야 합니다.
- 동작 줄이기 환경에서는 장식 이동과 transition을 제거합니다.

완성 후 화면만 보지 말고 Tab 키로 이동하고 브라우저의 동작 줄이기 설정을 켜서 확인하세요.

## 실습 4. 오류 원인 좁히기

```html
<article class="profile-card active">
  <span class="profile-card__name">Bam 개발자</span>
</article>
```

```css
/* A: 색이 바뀌지 않음 */
#profile-card {
  color: royalblue;
}

/* B: active 카드 자체가 아니라 안쪽 요소를 찾음 */
.profile-card .active {
  border-color: royalblue;
}

/* C: padding을 추가하자 300px보다 넓어짐 */
.profile-card {
  width: 300px;
  padding: 24px;
}

/* D: 이름에 width가 적용되지 않음 */
.profile-card__name {
  width: 100px;
}
```

정답 코드를 바로 쓰기 전에 각 문제를 어느 단계에서 확인할지 적어 보세요.

- A: HTML 속성과 선택자의 종류가 일치하는가?
- B: 공백이 같은 요소의 조건인지 후손 관계인지 확인했는가?
- C: `width`가 content box와 border box 중 무엇을 가리키는가?
- D: span의 바깥 display 방식이 무엇인가?

개발자 도구에서 원인을 확인한 뒤 최소 선언 하나만 바꾸어 해결하세요.

## 완료 기준

시각적으로 비슷하다는 이유만으로 완료하지 않습니다.

- 요구한 요소만 선택되었는가?
- `!important`나 큰 음수 margin으로 원인을 덮지 않았는가?
- 320px 너비와 200% 확대에서 가로 스크롤·잘림이 없는가?
- 긴 제목, 빈 설명, 카드 수 증가에도 레이아웃이 유지되는가?
- 키보드 focus가 보이고 DOM 순서대로 이동하는가?
- hover가 없어도 모든 정보와 기능을 사용할 수 있는가?
- 동작 줄이기 설정에서 불필요한 움직임이 사라지는가?
- 개발자 도구에서 최종값이 어느 규칙에서 왔는지 설명할 수 있는가?

## 흔한 실수

- 완성 화면을 한 번에 만들려고 모든 속성을 동시에 씁니다.
- CSS가 안 될 때 선택자를 계속 길게 만들거나 `!important`를 추가합니다.
- 레이아웃 문제를 큰 margin이나 absolute 좌표로 덮습니다.
- 좁은 화면 확인을 마지막까지 미룹니다.
- 예제의 숫자를 복사하고 현재 콘텐츠에 맞는지 관찰하지 않습니다.
- 시각 결과만 확인하고 키보드, 확대, 긴 콘텐츠와 사용자 설정을 놓칩니다.

## 확인 문제

1. CSS가 전혀 적용되지 않을 때와 선언이 취소선으로 보일 때의 확인 단계는 어떻게 다른가요?
2. 카드가 지정한 width보다 커졌다면 box model에서 무엇을 계산해야 하나요?
3. Flexbox와 Grid를 고르는 가장 기본적인 기준은 무엇인가요?
4. absolute 배지가 다른 영역을 기준으로 배치됐다면 어느 요소의 position을 확인해야 하나요?
5. 분기점 숫자는 특정 기기 이름과 콘텐츠가 불편해지는 위치 중 무엇을 기준으로 정해야 하나요?
6. hover 효과만 구현했을 때 발생할 수 있는 두 가지 사용성 문제는 무엇인가요?
7. 구현 완료 전에 긴 콘텐츠, 200% 확대와 키보드를 함께 확인해야 하는 이유를 자신의 말로 설명해 보세요.

## 공식 출처

- [W3C CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/)
- [W3C CSS Display Module Level 3](https://www.w3.org/TR/css-display-3/)
- [W3C CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/)
- [W3C CSS Grid Layout Module Level 2](https://www.w3.org/TR/css-grid-2/)
- [W3C Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/)
- [W3C CSS Object Model — `getComputedStyle()`](https://www.w3.org/TR/cssom-1/#dom-window-getcomputedstyle)
