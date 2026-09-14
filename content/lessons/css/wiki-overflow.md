# overflow(넘침): 크기 제한과 내용 표시

## 학습 목표

넘침의 원인을 구분하고 크기 제한·줄바꿈·스크롤 중 내용을 보존하는 방법을 선택할 수 있습니다.

## 한줄 요약

넘침은 고정 크기·긴 콘텐츠·최소 크기부터 확인하고 필요한 줄바꿈이나 스크롤로 내용을 읽을 수 있게 유지합니다.

## 먼저 확인할 개념

[박스 모델과 box-sizing](#/learn/css/wiki-box-model)에서 너비에 포함되는 영역을 먼저 확인해 보세요.

## 크기에는 아래와 위의 한계가 있다

```css
.notice {
  width: 100%;
  max-width: 32rem;
}
```

width는 기본 크기, min-width는 줄어들 수 있는 아래 한계, max-width는 커질 수 있는 위 한계다.
고정 너비 하나만 정하기보다 내용이 길거나 부모가 좁아질 때 어디까지 줄고 커져야 하는지 생각한다.
padding과 border가 있다면 최종 box-sizing도 함께 확인한다.

## 끊기 어려운 문자열부터 관찰한다

다음 예제는 공백과 하이픈이 없는 긴 ASCII 문자열을 넣었다.
카드의 너비는 줄어들 수 있어도 문자열이 끊길 곳이 없으면 밖으로 나갈 수 있다.

```html
<article class="notice">
  <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789</p>
</article>
```

```css
.notice {
  box-sizing: border-box;
  width: 100%;
  max-width: 20rem;
  padding: 1rem;
  border: 2px solid #8aa4bd;
}
```

원인이 끊기 어려운 문자열이면 필요한 위치에서 줄바꿈할 수 있게 한다.

```css
.notice p {
  overflow-wrap: anywhere;
}
```

이 선언 전후에 문자열 전체를 읽을 수 있는지 비교해 보자.
어떤 넘침이든 이 한 줄로 해결되는 것은 아니다.
부모보다 큰 고정 크기, 빠뜨린 padding·border 계산, 이미지, Flex·Grid 자식의 기본 최소 크기도 원인이 될 수 있다.

## overflow는 넘친 부분의 표시를 정한다

| 값 | 주요 동작 |
| --- | --- |
| `visible` | 넘친 내용을 기본적으로 박스 밖에도 보여 준다. |
| `auto` | 실제로 넘치면 스크롤할 수 있게 한다. |
| `scroll` | 넘침 여부와 관계없이 스크롤할 수 있는 영역을 만든다. |
| `hidden` | 넘친 부분을 자르고 직접 스크롤하는 UI를 제공하지 않는다. 프로그램 스크롤은 가능하다. |
| `clip` | 넘친 부분을 자르고 프로그램 스크롤도 허용하지 않는다. |

내용을 자르는 것은 원인을 해결하는 것과 다르다.
가려진 곳에 버튼이나 링크가 있다면 사용자가 기능에 도달하지 못할 수 있다.

## 제한된 높이에서도 전체 내용을 읽게 한다

로그처럼 길이를 알 수 없는 내용에는 필요한 최대 높이와 스크롤을 함께 검토한다.

```css
.log-panel {
  max-height: 12rem;
  overflow: auto;
}
```

max-height는 내용이 짧을 때 필요한 높이를 쓰면서 최대 높이를 제한한다.
overflow auto를 함께 쓰면 제한을 넘는 내용을 스크롤해 확인할 수 있다.
고정 height와 hidden으로 자르면 직접 읽을 수 있는 스크롤 수단이 사라진다.

스크롤 영역을 만들었다면 키보드와 보조 기술로도 그 내용을 탐색할 수 있는지 확인한다.
설명 문단처럼 높이를 제한할 필요가 없다면 내용이 자연스럽게 늘어나게 두는 편이 단순하다.

## 이어서 연습하기

[Flexbox로 한 축 정렬하기](#/learn/css/wiki-flexbox)에서 항목이 줄어들거나 다음 줄로 이동할 수 있는 조건을 살펴보세요.

## 공식 자료

- [CSS Overflow Level 3](https://www.w3.org/TR/css-overflow-3/#overflow-properties)
- [CSS Text Level 3 — overflow-wrap](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)
- [CSS Box Sizing Level 3](https://www.w3.org/TR/css-sizing-3/)

## 핵심 질문 답

고정 크기·긴 문자열·박스 계산·자식의 최소 크기 중 무엇이 넘침을 만드는지 먼저 확인합니다.
긴 문자열은 필요한 줄바꿈을 허용하고, 높이 제한이 필요한 로그는 max-height와 overflow auto로 전체 내용을 읽을 수 있게 합니다.
hidden이나 clip으로 자르는 것은 원인 해결과 다르므로 가려지는 정보와 조작 수단까지 확인합니다.
