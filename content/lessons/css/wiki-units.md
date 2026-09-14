# 길이 단위의 계산 기준

## 학습 목표

px·%·rem·em의 계산 기준을 찾고 같은 단위도 속성에 따라 기준이 달라지는 경우를 설명할 수 있습니다.

## 한줄 요약

길이 단위는 기준이 서로 다르며 특히 %는 속성별 기준, em은 사용하는 속성의 글자 크기 기준을 확인해야 합니다.

## 먼저 확인할 개념

[CSS의 역할과 적용](#/learn/css/wiki-css-basics)에서 속성과 값의 관계를 먼저 읽어 보세요.

## 단위 이름보다 기준을 찾는다

| 단위 | 먼저 찾을 기준 |
| --- | --- |
| `px` | CSS 기준 픽셀 |
| `%` | 해당 속성에서 정한 기준값 |
| `rem` | 루트 요소의 계산된 글자 크기 |
| `em` | 해당 요소의 글자 크기. font-size에 쓰면 부모 글자 크기 |

CSS의 1px은 물리 화면의 픽셀 한 칸과 언제나 같지는 않다.
기기 배율이나 확대 상태에 따라 여러 물리 픽셀로 표시될 수 있다.

`width: 80%`는 무조건 화면 너비의 80%가 아니다.
이 속성이 사용하는 포함 블록의 너비를 기준으로 하며, font-size나 transform의 백분율까지 같은 대상을 기준으로 삼지는 않는다.

## em과 rem을 같은 코드에서 비교한다

다음 예제에서 padding과 margin-block이 각각 어느 글자 크기를 참조하는지 먼저 찾아보자.

```css
html {
  font-size: 16px;
}

.card {
  font-size: 20px;
  padding: 1em;
  margin-block: 1rem;
  width: 80%;
}
```

padding의 em은 그 요소 자신의 계산된 글자 크기를 기준으로 한다.
rem은 루트 요소의 계산된 글자 크기를 기준으로 한다.
따라서 같은 숫자라도 단위의 기준이 다르면 계산 결과가 달라진다.

위 padding은 20px, margin-block은 16px이다.
루트의 16px은 계산을 비교하기 위한 예시이며, 사용자 글자 설정을 존중하려면 프로젝트에서 무리하게 고정하지 않는다.

## font-size의 em은 부모를 본다

```css
.notice {
  font-size: 1rem;
}

.notice h2 {
  font-size: 1.25em;
}
```

제목의 font-size에 쓴 em은 부모인 notice의 계산된 글자 크기를 따른다.
부모가 16px이면 제목은 20px이다.
반면 그 제목의 padding에 em을 쓰면 제목 자신의 계산된 글자 크기를 사용한다.

em을 언제나 부모 기준으로 외우지 않는다.
개발자 도구에서 최종 font-size와 값이 쓰인 속성을 함께 확인하면 기준을 찾기 쉽다.

### 선택 확장: 화면 영역 단위

vw와 vh는 viewport의 너비와 높이를 기준으로 한다.
높이에는 작은 영역의 svh, 큰 영역의 lvh, 현재 변하는 영역의 dvh도 있다.
기본 vh는 큰 viewport 기준이므로, 모바일 주소창이 보이는 순간의 높이와 항상 같다고 기대하지 않는다.

상대 단위를 골랐다는 사실만으로 반응형 배치가 완성되지는 않는다.
긴 내용과 확대된 글자를 넣었을 때도 읽을 수 있는지 확인한다.

## 이어서 연습하기

[읽기 쉬운 글꼴과 줄 간격](#/learn/css/wiki-typography)에서 계산한 글자 크기와 함께 읽기 조건을 살펴보세요.

## 공식 자료

- [CSS Values Level 4 — 글자 상대 길이](https://www.w3.org/TR/css-values-4/#font-relative-lengths)
- [CSS Values Level 4 — viewport 상대 길이](https://www.w3.org/TR/css-values-4/#viewport-relative-lengths)
- [CSS Values Level 4 — 백분율](https://www.w3.org/TR/css-values-4/#percentages)

## 핵심 질문 답

px는 CSS 기준 픽셀이고 %는 사용하는 속성의 기준값을 따릅니다.
rem은 루트의 계산된 글자 크기, em은 보통 그 요소의 계산된 글자 크기를 따르지만 font-size의 em은 부모 글자 크기를 사용합니다.
단위를 계산하기 전에 속성과 기준 요소를 함께 찾고 실제 콘텐츠에서도 결과를 확인합니다.
