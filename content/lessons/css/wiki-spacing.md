# 간격의 주인과 margin 합침

## 학습 목표

padding·margin·부모 gap 중 간격을 관리할 위치를 고르고 세로 margin이 합쳐지는 조건을 설명할 수 있습니다.

## 한줄 요약

안쪽은 padding, 바깥은 margin, 반복 항목 사이는 부모 gap으로 관리하며 일반 흐름의 세로 margin은 조건에 따라 합쳐집니다.

## 먼저 확인할 개념

[박스 모델과 box-sizing](#/learn/css/wiki-box-model)의 네 영역과 [일반 흐름과 display](#/learn/css/wiki-display)의 배치 관계를 확인해 보세요.

## 어떤 간격을 바꾸려는가

| 필요한 간격 | 먼저 살필 위치 |
| --- | --- |
| 내용과 자신의 테두리 사이 | 그 요소의 padding |
| 한 박스의 테두리 바깥 | 그 요소의 margin |
| 같은 부모가 배치하는 반복 항목 사이 | Flexbox·Grid 부모의 gap |

```css
.card {
  padding: 1rem;
}

.card-list {
  display: grid;
  gap: 1.5rem;
}
```

카드 안쪽 공간은 카드가, 카드 목록의 반복 간격은 부모가 관리한다.
gap은 항목 사이 간격이며 목록 바깥의 여백까지 만들지는 않는다.
이 예제에서는 Grid의 열 설계보다 어느 요소에 간격을 선언하는지에 집중한다.

각 카드에 제각각 margin을 주기 전에 부모가 같은 간격을 관리할 수 있는지 살펴보자.
항목이 늘어나도 간격의 책임이 한곳에 있으면 바꿀 위치를 찾기 쉽다.

## 두 세로 margin이 항상 더해지지는 않는다

```css
.title {
  margin-bottom: 24px;
}

.description {
  margin-top: 16px;
}
```

일반 흐름에서 두 block 박스의 위아래 margin이 맞닿으면 조건에 따라 합쳐질 수 있다.
이 두 양수 margin이 합쳐지는 경우 간격은 40px이 아니라 더 큰 24px이 된다.
이를 margin collapsing이라고 한다.

가로 margin은 같은 방식으로 합쳐지지 않는다.
Flexbox와 Grid의 직접 자식 사이에서도 이 block margin 합침이 일어나지 않는다.
간격이 예상보다 작으면 개발자 도구의 박스 모델과 부모 배치 방식을 함께 확인한다.

### 선택 확장: 합침의 범위

같은 block formatting context 안에서 맞닿은 세로 margin이어도 모두 합쳐지는 것은 아니다.
부모와 자식 사이에 합쳐지는 경우도 있고 음수 margin이 섞이면 계산도 달라진다.
모든 margin을 큰 값 하나로 고르는 규칙으로 외우지 말고 먼저 실제 조건을 확인한다.

## 이어서 연습하기

[overflow(넘침): 크기 제한과 내용 표시](#/learn/css/wiki-overflow)에서 간격과 크기 때문에 내용이 박스 밖으로 나갈 때의 판단을 이어 보세요.

## 공식 자료

- [CSS Box Model Level 3](https://www.w3.org/TR/css-box-3/)
- [CSS 2.2 — margin 합침](https://www.w3.org/TR/CSS22/box.html#collapsing-margins)
- [CSS Box Alignment Level 3 — gap](https://www.w3.org/TR/css-align-3/#gaps)

## 핵심 질문 답

내용과 테두리 사이 간격은 padding, 박스 바깥은 margin, 반복되는 자식 사이 간격은 Flexbox나 Grid 부모의 gap으로 관리합니다.
일반 흐름에서 맞닿은 세로 margin은 조건에 따라 합쳐질 수 있으므로 무조건 더하지 않습니다.
부모 배치 방식과 실제 박스 모델을 확인하고 그 간격을 책임질 요소에 선언합니다.
