# 박스 모델과 간격

## 학습 목표

- content·padding·border·margin 네 영역을 구분하고 테두리를 기준으로 간격이 안쪽인지 바깥인지 찾을 수 있습니다.
- `box-sizing`에 따라 선언한 `width`와 실제 박스 너비·content 너비를 계산할 수 있습니다.
- 안쪽·바깥·반복 항목 사이의 간격을 `padding`·`margin`·부모의 `gap` 가운데 알맞은 곳에 선언할 수 있습니다.
- 일반 흐름에서 세로 margin이 합쳐지는 조건과 Flexbox·Grid에서 합쳐지지 않는 차이를 설명할 수 있습니다.

## 먼저 확인할 개념

[읽기 쉬운 글자: 단위·글꼴·색](#/learn/css/wiki-units)에서 `px`·`rem`·`em` 같은 크기 값의 기준을 먼저 살펴보세요.

## 박스 모델이란

박스 모델은 브라우저가 화면에 그리는 요소를 네 겹의 사각형 상자로 다루는 방식입니다.
제목이든 문단이든 카드든 화면에 놓이는 요소는 모두 이런 상자를 만듭니다.
그래서 요소의 크기를 계산하거나 요소 사이를 띄울 때는 상자의 어느 겹을 바꾸는지부터 정해야 합니다.

네 겹은 안에서부터 content·padding·border·margin입니다.
이 가운데 padding과 margin은 둘 다 빈 공간이라 흔히 여백이라고 뭉뚱그려 부릅니다.
하지만 하나는 테두리 안쪽에 있고 하나는 바깥에 있어 크기 계산과 배치에 주는 영향이 다릅니다.

예를 들어 마을 소식 페이지에 주민 모임 안내 카드를 여러 장 놓는다고 해 보겠습니다.
이 페이지에는 네 가지 요구가 있습니다.

- 카드 하나의 테두리 바깥 너비를 정확히 300px로 맞춥니다.
- 카드 안에서 글자가 테두리에 붙지 않게 띄웁니다.
- 카드 여러 장과 카드 안의 버튼들을 같은 간격으로 띄웁니다.
- 카드 제목과 설명 사이의 세로 간격을 예상대로 만듭니다.

이 문서는 이 카드 하나로 박스의 영역과 크기 계산과 간격을 차례로 살펴봅니다.

## 박스의 네 영역

카드에 다음 규칙을 적었습니다.

```css
.meeting-card {
  width: 300px;
  padding: 20px;
  border: 5px solid navy;
  margin: 20px;
}
```

![주민 모임 카드가 네 겹으로 칠해져 있다. 가장 바깥의 줄무늬가 margin 20px이고 남색 선이 border 5px이며 초록이 padding 20px이고 가운데 파랑이 너비 300px인 content이다.](content/assets/css/box-areas.png)

| 영역 | 위치 | 카드에서 |
| --- | --- | --- |
| content | 글자나 이미지가 놓이는 내용 공간 | 파랑 · 너비 300px |
| padding | 내용과 테두리 사이의 안쪽 간격 | 초록 · 20px |
| border | padding을 둘러싼 테두리 | 남색 · 5px |
| margin | 테두리 바깥에서 다른 박스와 떨어지는 간격 | 줄무늬 · 20px |

바깥에서 안으로 보면 margin → border → padding → content 순서입니다.
padding에는 카드의 배경색이 칠해지지만 margin은 늘 투명하게 비어 있습니다.
padding은 박스의 일부이고 margin은 박스 바깥의 거리이기 때문입니다.
개발자 도구의 박스 모델 그림에서도 테두리를 기준으로 간격이 안쪽인지 바깥인지 찾을 수 있습니다.

네 영역을 구분했으니 이제 카드의 실제 너비를 계산해 볼 차례입니다.
그런데 `width: 300px`이 네 겹 가운데 어디까지를 가리키는지는 `box-sizing`이 정합니다.

## box-sizing의 종류

`box-sizing`은 `width`와 `height`가 박스의 어느 영역까지를 가리킬지 정하는 속성입니다.
값은 `content-box`와 `border-box` 두 가지입니다.
위 카드의 테두리 바깥 너비가 300px일지 먼저 계산해 보세요.

![같은 width 300px 카드 두 장이다. content-box 카드는 300px 눈금보다 넓어 테두리 바깥 너비가 350px이고 content 너비는 300px이다. border-box 카드는 눈금과 폭이 같아 테두리 바깥 너비가 300px이고 content 너비는 250px이다.](content/assets/css/box-sizing.png)

다른 규칙이 box-sizing을 바꾸지 않았다면 초기값은 content-box입니다.
content-box에서 width의 300px은 content 너비이므로 좌우 padding과 border를 더하면 테두리 바깥 너비는 350px입니다.

```text
content 300 + padding 20 × 2 + border 5 × 2 = 350px
```

margin 20px은 이 350px에 들어가지 않습니다.
margin은 테두리 바깥의 배치 간격이기 때문입니다.
테두리 바깥까지 잰 너비를 border box 너비라고 부릅니다.

같은 카드에 `box-sizing: border-box`를 더하면 결과가 달라집니다.

```css
.meeting-card {
  box-sizing: border-box;
}
```

border-box의 width에는 content와 좌우 padding·border가 포함됩니다.
content 너비를 구할 때는 width에서 좌우 padding과 border를 빼고 margin은 빼지 않습니다.
그래서 이 카드는 border box가 300px이고 content가 250px입니다.

```text
border box 300 - padding 20 × 2 - border 5 × 2 = content 250px
```

| 값 | `width`가 가리키는 곳 | 카드의 border box | 카드의 content |
| --- | --- | --- | --- |
| `content-box` | content만 | 350px | 300px |
| `border-box` | content + padding + border | 300px | 250px |

border-box로 바꿔도 margin까지 width 안으로 들어오지는 않습니다.
그래서 첫 요구인 테두리 바깥 너비 300px에는 `border-box`가 맞습니다.

> [!note]- padding과 border가 width보다 크면 어떻게 되나요?
> border-box에서 좌우 padding과 border의 합이 width보다 크면 content 너비는 음수가 되지 않고 0에서 멈춥니다.
> 그 대신 border box가 선언한 width보다 넓어집니다.

카드의 크기를 정했으니 이제 카드 안팎의 간격을 누가 맡을지 정할 차례입니다.

---

## 간격 사용법

간격을 바꾸기 전에 그 간격이 어디에 있는지부터 찾습니다.

| 필요한 간격 | 선언할 곳 |
| --- | --- |
| 내용과 자신의 테두리 사이 | 그 요소의 `padding` |
| 한 박스의 테두리 바깥 | 그 요소의 `margin` |
| 같은 부모가 배치하는 반복 항목 사이 | Flexbox·Grid 부모의 `gap` |

카드 목록과 카드 안의 버튼 줄에 간격을 적었습니다.
카드 목록의 가장자리와 버튼 줄의 가장자리에 각각 공간이 생길지 예상해 보세요.

```css
.card-list {
  display: grid;
  gap: 1.5rem;
}

.actions {
  display: flex;
  gap: 12px;
  padding: 20px;
}
```

![위는 카드 세 장이 Grid 목록에 놓인 모습이다. 카드 사이는 24px이고 목록 테두리와 첫 카드 사이는 0px이다. 아래는 버튼 세 개가 Flex 버튼 줄에 놓인 모습이다. 버튼 사이는 12px이고 테두리와 첫 버튼 사이는 padding으로 만든 20px이다.](content/assets/css/box-gap-padding.png)

카드 사이는 24px이지만 목록 테두리와 첫 카드 사이는 0px입니다.
gap은 항목과 항목 사이에만 생기고 목록 바깥의 여백까지 만들지는 않기 때문입니다.
그래서 버튼 줄처럼 가장자리 안쪽에도 공간이 필요하면 부모에 `padding`을 함께 적습니다.
버튼 사이 12px은 `gap`이 맡고 테두리 안쪽 20px은 `padding`이 맡습니다.

카드 안쪽 공간은 카드가 맡고 카드 사이 간격은 목록이 맡습니다.
각 카드에 제각각 margin을 주기 전에 부모가 같은 간격을 관리할 수 있는지 먼저 살펴봅니다.
간격을 맡은 곳이 한 군데이면 카드가 늘어나도 바꿀 위치를 찾기 쉽습니다.

margin은 한 박스의 테두리 바깥을 띄울 때 씁니다.
그런데 세로 margin 두 개가 맞닿으면 두 값을 더한 만큼 벌어지지 않을 때가 있습니다.

## margin 합침

카드 안의 제목과 설명에 세로 margin을 적었습니다.
두 박스 사이가 몇 px일지 먼저 예상해 보세요.

```css
.title {
  margin-bottom: 24px;
}

.description {
  margin-top: 16px;
}
```

![왼쪽은 부모가 display block이고 두 박스 사이가 24px이다. 오른쪽은 부모만 display grid로 바꿨고 두 박스 사이가 40px이다.](content/assets/css/box-margin-collapse.png)

부모가 block인 왼쪽은 40px이 아니라 24px입니다.
일반 흐름에서 위아래로 맞닿은 두 block 박스의 세로 margin은 조건에 따라 하나로 합쳐지기 때문입니다.
일반 흐름은 요소가 HTML 순서대로 위에서 아래로 쌓이는 기본 배치입니다.
두 양수 margin이 합쳐지면 둘 가운데 더 큰 값 하나만 남습니다.
이를 margin 합침(margin collapsing)이라고 합니다.

반면 부모만 grid로 바꾼 오른쪽은 24px과 16px을 더한 40px입니다.
Grid와 Flexbox의 직접 자식 사이에서는 margin이 합쳐지지 않습니다.
가로 margin도 이런 방식으로 합쳐지지 않습니다.
그래서 간격이 예상보다 작으면 개발자 도구의 박스 모델과 부모의 `display`를 함께 확인합니다.

> [!note]- margin이 합쳐지는 범위
> 부모와 첫 자식처럼 형제가 아닌 박스의 세로 margin도 합쳐질 수 있습니다.
> 다만 부모에 border나 padding이 있어 두 margin 사이를 막으면 합쳐지지 않습니다.
> 음수 margin이 섞이면 가장 큰 양수와 가장 작은 음수를 더한 값이 간격이 됩니다.
> 그래서 늘 큰 값 하나가 남는다고 외우기보다 실제 조건을 확인합니다.

---

## 박스 모델의 활용

지금까지 안내 카드의 네 요구를 박스 모델로 풀었습니다.
실제 페이지에서는 요구에서 거꾸로 영역과 속성을 찾아가면 됩니다.

| 요구 | 고를 값 | 함께 확인할 것 |
| --- | --- | --- |
| 테두리 바깥 너비를 정확히 맞춘다 | `box-sizing: border-box` | margin은 width에 들어가지 않습니다 |
| 내용 너비를 정확히 맞춘다 | `box-sizing: content-box` | 바깥 너비는 padding과 border만큼 커집니다 |
| 글자가 테두리에 붙지 않게 한다 | 그 요소의 `padding` | 배경색이 padding까지 칠해집니다 |
| 반복 항목 사이를 띄운다 | Flexbox·Grid 부모의 `gap` | 가장자리 공간은 부모의 `padding`으로 만듭니다 |
| 한 박스 바깥을 띄운다 | 그 요소의 `margin` | 일반 흐름의 세로 margin은 합쳐질 수 있습니다 |

크기가 예상과 다르면 padding이나 border를 빠뜨렸는지와 최종 `box-sizing`이 무엇인지 먼저 봅니다.
간격이 예상과 다르면 그 간격이 테두리 안쪽인지 바깥인지와 부모가 어떤 배치인지 봅니다.
두 경우 모두 개발자 도구의 박스 모델 그림에 실제 값이 나와 있습니다.

## 정리

- 박스는 안에서부터 content·padding·border·margin으로 이루어지고 padding은 테두리 안쪽 간격이며 margin은 바깥 간격입니다.
- `content-box`의 `width`는 content 너비이고 `border-box`의 `width`는 padding과 border까지 포함하며 margin은 두 경우 모두 바깥에 있습니다.
- 반복 항목 사이는 부모의 `gap`이 맡고 일반 흐름에서 맞닿은 세로 margin은 합쳐질 수 있지만 Flexbox·Grid의 직접 자식 사이에서는 합쳐지지 않습니다.

## 이어서 연습하기

[프로필 카드 크기](#/quest/css/profile-card-box)에서 요구한 바깥 너비를 기준으로 padding과 border의 범위를 확인해 보세요.
이어서 [일반 흐름과 넘침: display와 overflow](#/learn/css/wiki-display)에서 박스가 흐름 안에 놓이는 방식과 내용이 박스 밖으로 나갈 때를 살펴보세요.

## 공식 자료

- [CSS Box Model Level 3 — 박스 모델](https://www.w3.org/TR/css-box-3/#box-model)
- [CSS Box Sizing Level 3 — box-sizing](https://www.w3.org/TR/css-sizing-3/#box-sizing)
- [CSS 2.2 — margin 합침](https://www.w3.org/TR/CSS22/box.html#collapsing-margins)
- [CSS Box Alignment Level 3 — gap](https://www.w3.org/TR/css-align-3/#gaps)

## 핵심 질문 답

박스는 안에서부터 content·padding·border·margin으로 이루어지며 padding은 테두리 안쪽이고 margin은 바깥입니다.
`content-box`에서는 `width`가 content 너비이므로 좌우 padding과 border를 더해 바깥 너비를 구하고 `border-box`에서는 `width`에서 그 영역을 빼 content 너비를 구합니다.
margin은 두 경우 모두 border box 밖에 있으므로 너비 계산에 넣지 않습니다.
반복 항목 사이는 부모의 `gap`이 맡고 일반 흐름에서 맞닿은 세로 margin은 합쳐질 수 있으므로 부모 배치와 실제 박스 모델을 확인한 뒤 간격을 맡을 요소에 선언합니다.
