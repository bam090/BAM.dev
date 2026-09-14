# 박스 모델과 box-sizing

## 학습 목표

content·padding·border·margin을 구분하고 box-sizing에 따라 선언한 너비와 실제 박스 너비를 계산할 수 있습니다.

## 한줄 요약

content-box의 width는 내용 너비이고 border-box의 width는 padding과 border까지 포함하며 margin은 두 경우 모두 바깥에 있습니다.

## 먼저 확인할 개념

[길이 단위의 계산 기준](#/learn/css/wiki-units)에서 크기 값의 기준을 먼저 살펴보세요.

## 박스에는 네 영역이 있다

| 영역 | 위치 |
| --- | --- |
| content | 텍스트나 이미지가 놓이는 내용 공간 |
| padding | 내용과 테두리 사이의 안쪽 간격 |
| border | padding을 둘러싼 테두리 |
| margin | 테두리 바깥에서 다른 박스와 떨어지는 간격 |

바깥에서 안으로 보면 margin → border → padding → content다.
개발자 도구의 박스 모델 그림에서 테두리를 기준으로 간격이 안쪽인지 바깥인지 찾아보자.

## content-box는 내용의 너비다

다음 카드의 테두리 바깥까지의 너비가 300px일지 먼저 계산해 보자.

```css
.notice {
  width: 300px;
  padding: 20px;
  border: 5px solid navy;
}
```

다른 규칙이 box-sizing을 바꾸지 않았다는 조건에서 초기값은 content-box다.
width의 300px은 content 너비이므로 좌우 padding과 border를 더하면 border box는 350px이다.

```text
content 300 + padding 20 × 2 + border 5 × 2 = 350px
```

margin이 있어도 위 350px에는 포함되지 않는다.
margin은 테두리 바깥의 배치 간격이다.

## border-box는 테두리까지 포함한다

앞의 규칙에 다음 선언을 추가한다.

```css
.notice {
  box-sizing: border-box;
}
```

border-box의 width에는 content와 좌우 padding·border가 포함된다.
content 너비를 구할 때는 그 width에서 좌우 padding과 border를 빼며 margin은 빼지 않는다.

같은 코드에서는 border box가 300px이고 content가 250px이다.

```text
border box 300 - padding 20 × 2 - border 5 × 2 = content 250px
```

border-box로 바꿔도 margin까지 width 안으로 들어오지는 않는다.
padding과 border의 합이 선언한 크기보다 크면 content는 음수가 되지 않고 바깥 크기가 더 커질 수 있다.

## 계산과 실제 박스를 비교한다

같은 카드에서 box-sizing만 바꾸어 개발자 도구의 박스 모델과 비교해 보자.
너비가 예상과 다르면 padding·border를 빠뜨렸는지, 최종 box-sizing이 무엇인지 먼저 확인한다.
간격을 모두 여백 하나로 기억하면 계산에 포함할 영역을 놓치기 쉽다.

## 이어서 연습하기

[프로필 카드 크기](#/quest/css/profile-card-box)에서 요구한 바깥 너비를 기준으로 padding과 border의 범위를 확인해 보세요.

## 공식 자료

- [CSS Box Model Level 3 — 박스 모델](https://www.w3.org/TR/css-box-3/#box-model)
- [CSS Box Sizing Level 3 — box-sizing](https://www.w3.org/TR/css-sizing-3/#box-sizing)

## 핵심 질문 답

content-box에서는 width가 내용 너비이므로 좌우 padding과 border를 더해 바깥 너비를 구합니다.
border-box에서는 width에 padding과 border가 포함되므로 내용 너비를 구할 때 그 영역을 뺍니다.
margin은 두 경우 모두 border box 밖에 있으므로 content 너비 계산에 포함하지 않습니다.
