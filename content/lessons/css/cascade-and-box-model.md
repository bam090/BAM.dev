# 01. 캐스케이드와 박스 모델

## 학습 시간

약 20분

- 0~3분: 겹치는 선언을 먼저 관찰하기
- 3~9분: cascade가 한 값을 고르는 순서 익히기
- 9~16분: content, padding, border, margin 구분하기
- 16~20분: 최소 코드를 바꾸고 확인 문제 풀기

## 학습 목표

- 같은 요소의 같은 속성에 여러 선언이 적용될 때, 어떤 선언부터 비교해야 하는지 설명할 수 있습니다.
- 일반적인 작성자 스타일 안에서 specificity와 작성 순서를 구분할 수 있습니다.
- content, padding, border, margin의 위치와 역할을 구분할 수 있습니다.
- `content-box`와 `border-box`에서 `width`가 가리키는 범위를 계산할 수 있습니다.

## 먼저 관찰하기

아래 HTML과 CSS를 읽되, 바로 실행하지 말고 먼저 두 질문에 답해 보세요.

```html
<p id="notice" class="message">저장되었습니다.</p>
```

```css
#notice {
  color: royalblue;
}

.message {
  color: tomato;
}
```

1. 두 선택자는 같은 요소를 선택하나요?
2. 둘 다 `color`를 선언한다면, 뒤에 적힌 값이 항상 이길까요?

두 규칙은 모두 같은 문단에 적용됩니다. 하지만 이 예에서는 앞에 있는 `#notice`의 `color`가 선택됩니다. 두 선언이 같은 작성자 스타일이며, `!important`와 cascade layer를 쓰지 않은 조건에서는 ID 선택자의 specificity가 클래스 선택자보다 높기 때문입니다.

이번에는 다음 코드의 결과를 예상해 보세요.

```css
.message {
  color: royalblue;
}

.message {
  color: tomato;
}
```

두 선언의 앞선 조건과 specificity가 같으므로 나중에 나타난 `tomato`가 선택됩니다. 즉, **뒤에 썼다는 사실은 앞의 비교 기준들이 모두 같을 때만** 승패를 정합니다.

## Cascade: 겹친 선언에서 한 값을 고르는 과정

Cascade는 한 요소의 한 속성에 후보 선언이 여러 개일 때 우선순위를 비교해 하나의 cascaded value를 고르는 과정입니다.

초보 단계에서는 다음 관찰 순서가 유용합니다.

1. **같은 요소와 같은 속성인가?** 선택자가 그 요소와 실제로 일치하는지, 조건부 규칙이 활성화됐는지 확인합니다.
2. **출처와 중요도가 같은가?** 브라우저 기본 스타일, 사용자 스타일, 작성자 스타일과 `!important` 여부가 specificity보다 먼저 비교됩니다. Cascade layer도 이 앞 단계에 영향을 줍니다.
3. **specificity가 같은가?** 같은 앞 조건 안에서는 더 구체적인 선택자가 이깁니다. 일반적으로 ID, 클래스·속성·가상 클래스, 타입·가상 요소의 수를 각각 비교합니다.
4. **그래도 같은가?** 같은 조건과 specificity라면 문서 순서에서 나중에 나타난 선언이 이깁니다.

`!important`는 specificity 점수를 높이는 문법이 아닙니다. 중요도가 다른 그룹으로 선언을 옮기므로 더 앞 단계에서 비교됩니다. 원인을 확인하지 않고 `!important`를 덧붙이면 다음 수정이 더 어려워질 수 있습니다.

> 이 샘플은 `@layer`, `@scope`, Shadow DOM, 애니메이션과 전환을 사용하지 않는 일반 작성자 스타일을 중심으로 합니다. 전체 cascade에는 캡슐화 문맥, 요소에 직접 연결된 스타일, layer, scope proximity 같은 비교 기준도 있습니다.

### 개발자 도구에서 볼 것

스타일이 예상과 다를 때는 숫자 암기보다 다음을 차례로 관찰해 보세요.

- Elements 또는 Inspector에서 **원하는 요소를 선택했는가?**
- Styles 패널에서 **어떤 `color` 선언이 취소선으로 표시되는가?**
- 이긴 선언과 진 선언에 `!important`나 layer 차이가 있는가?
- 선택자의 ID, 클래스·속성·가상 클래스, 타입·가상 요소 부분이 어떻게 다른가?
- 같은 specificity라면 어느 선언이 더 나중에 오는가?

## 박스 모델: 요소 주위의 네 영역

CSS 박스는 안쪽에서 바깥쪽으로 다음 영역을 가집니다.

```text
margin
  border
    padding
      content
```

| 영역 | 관찰 기준 | 대표 역할 |
| --- | --- | --- |
| content | 텍스트나 이미지가 놓이는 가장 안쪽 영역 | 실제 내용의 공간 |
| padding | content와 border 사이 | 내용과 테두리 사이의 안쪽 여백 |
| border | padding을 둘러싼 선 영역 | 박스의 경계 표시 |
| margin | border 바깥 | 다른 박스와의 바깥 간격 |

`background`는 기본적으로 content와 padding 아래에 그려지고 border 아래까지 이어질 수 있지만, margin은 항상 투명합니다. 따라서 배경색이 보이는 여백인지부터 관찰하면 padding과 margin을 구분하는 데 도움이 됩니다.

### `width`가 어느 영역을 재는가

다음 값을 먼저 계산해 보세요.

```css
.card {
  width: 240px;
  padding: 16px;
  border: 2px solid royalblue;
  margin: 12px;
}
```

CSS의 `box-sizing` 초기값은 `content-box`입니다. 따라서 일반적인 요소에서 별도 변경이 없다면 `width: 240px`은 content 너비입니다.

```text
border box 너비
= content 240
+ 좌우 padding 16 × 2
+ 좌우 border 2 × 2
= 276px
```

좌우 margin까지 단순히 포함한 가로 배치 공간은 `276 + 12 × 2 = 300px`입니다. Margin은 border box에 포함되지 않습니다.

`box-sizing: border-box`로 바꾸면 같은 `width: 240px`이 padding과 border를 포함한 border box 너비가 됩니다.

```css
.card {
  box-sizing: border-box;
  width: 240px;
  padding: 16px;
  border: 2px solid royalblue;
}
```

```text
content 너비
= border box 240
- 좌우 padding 16 × 2
- 좌우 border 2 × 2
= 204px
```

`border-box`여도 margin은 `width` 안에 들어오지 않습니다.

## 최소 코드

다음 코드를 작은 HTML 파일에 붙여 넣고 브라우저 개발자 도구로 `.card`의 computed width와 box model 그림을 관찰해 보세요.

```html
<section class="lesson">
  <article class="card">Cascade부터 확인하세요.</article>
</section>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .lesson .card {
    border-color: royalblue;
  }

  .card {
    width: 240px;
    padding: 16px;
    border: 2px solid tomato;
    margin: 12px;
  }
</style>
```

관찰 질문:

1. `.card` 규칙이 나중에 있어도 border 색이 `royalblue`인 이유는 무엇인가요?
2. border box 너비 240px 안에서 content 너비는 몇 px인가요?
3. `box-sizing: border-box` 선언을 지우면 border box 너비는 어떻게 달라지나요?
4. `margin`을 30px로 바꾸면 content 너비도 줄어드나요?

## 흔한 실수

### 1. 무조건 마지막 선언이 이긴다고 생각하기

작성 순서는 앞선 cascade 기준이 모두 같을 때 비교합니다. 먼저 적용 여부, 출처·중요도·layer, specificity를 확인하세요.

### 2. `!important`를 specificity로 설명하기

`!important`는 선택자를 더 구체적으로 만들지 않습니다. 중요도 단계가 달라지는 것입니다.

### 3. padding과 margin을 모두 "여백"으로만 기억하기

Padding은 content와 border 사이이고, margin은 border 바깥입니다. 배경과 테두리를 함께 켜서 어느 쪽 공간인지 관찰해 보세요.

### 4. `border-box`가 margin까지 포함한다고 생각하기

`border-box`는 content, padding, border를 포함하지만 margin은 포함하지 않습니다.

## 확인 문제

1. 같은 요소의 `color` 후보가 세 개라면 무엇부터 비교해야 하는지 순서대로 말해 보세요.
2. `.notice`와 `#notice`가 같은 요소에 적용되는 일반 작성자 규칙이고 다른 앞 조건이 같다면 어느 쪽 specificity가 더 높은가요?
3. `.card { width: 200px; padding: 10px; border: 2px solid; }`가 `content-box`일 때 border box의 가로 너비를 계산해 보세요.
4. 같은 코드가 `border-box`일 때 content의 가로 너비를 계산해 보세요.
5. 요소 사이의 바깥 간격을 바꾸고 싶을 때 padding과 margin 중 무엇을 먼저 살펴봐야 하나요? 이유도 설명해 보세요.

## 공식 출처

- [W3C CSS Cascading and Inheritance Level 5 — Cascade Sorting Order](https://www.w3.org/TR/css-cascade-5/#cascade-sort)
- [W3C CSS Box Model Module Level 3 — The CSS Box Model](https://www.w3.org/TR/css-box-3/#box-model)
- [W3C CSS Box Sizing Module Level 3 — `box-sizing`](https://www.w3.org/TR/css-sizing-3/#box-sizing)
