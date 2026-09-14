# 일반 흐름과 display

## 학습 목표

같은 줄·새 줄·숨김 요구에 맞는 display 값을 고르고 HTML 의미와 박스 배치를 구분할 수 있습니다.

## 한줄 요약

display는 박스가 주변 흐름에 참여하는 방식과 안쪽 배치를 정하며 HTML 요소의 의미를 바꾸지는 않습니다.

## 먼저 확인할 개념

[박스 모델과 box-sizing](#/learn/css/wiki-box-model)에서 요소가 차지하는 영역을 먼저 구분해 보세요.

## 일반 흐름에서 시작한다

```html
<h2>오늘의 마을 소식</h2>
<p>도서관은 오후 8시에 문을 닫습니다.</p>
<a href="/library">자세히 보기</a>
```

별도 배치를 정하지 않으면 제목과 문단은 보통 새 줄에 놓이고 링크는 글줄 안에서 이어진다.
이처럼 문서 순서를 바탕으로 박스가 놓이는 기본 배치가 일반 흐름이다.
HTML 순서만으로도 내용을 이해할 수 있게 만든 뒤 필요한 곳에 다른 배치를 적용한다.

## 같은 줄에 놓일지 새 줄에 놓일지

| display 값 | 입문 단계에서 관찰할 차이 |
| --- | --- |
| `block` | 일반 흐름에서 보통 새 줄에 놓이며 width·height로 크기를 다룬다. |
| `inline` | 글줄 안에서 흐르며 일반적인 비대체 인라인 요소의 width·height는 block처럼 적용되지 않는다. |
| `inline-block` | 글줄 안에 하나의 박스로 놓이며 width·height와 네 방향 padding을 다룰 수 있다. |
| `none` | 박스를 만들지 않아 레이아웃 공간에서도 빠진다. |

inline-block은 같은 줄에 놓이면서도 너비·높이를 가진 하나의 박스로 다룰 수 있다.
일반적인 비대체 inline은 글줄의 흐름이 우선이고 block은 보통 새 줄에 놓인다.

```css
.badge {
  display: inline-block;
  width: 5rem;
  padding: 0.25rem 0.5rem;
}
```

문장 안의 span 배지에 적용한다고 생각해 보자.
같은 코드에서 inline으로 바꾸면 width가 같은 방식으로 작동하는지, block으로 바꾸면 줄이 어떻게 나뉘는지 비교한다.

## 바깥 흐름과 자식 배치를 나눈다

`display: flex`인 요소는 주변 흐름에 하나의 박스로 참여하면서 바로 아래 자식을 flex item으로 배치한다.
grid도 직접 자식의 안쪽 배치 규칙을 바꾼다.
손자까지 자동으로 직접 배치 항목이 되는 것은 아니다.

display를 바꿔도 HTML 의미가 바뀌지는 않는다.
div를 inline으로 표시한다고 링크나 버튼으로 바뀌지 않으므로 의미에 맞는 HTML 요소를 먼저 선택한다.

## 숨김에는 공간 외의 영향도 있다

display none은 요소의 박스를 없애며 일반적으로 접근성 트리에서도 제외한다.
화면에서만 숨기고 보조 기술에 내용을 남기려는 목적과는 다르다.

선택 확장으로 visibility hidden은 공간을 남기지만 그려지지 않으며 보통 조작·읽기 대상에서도 빠진다.
visibility를 상속받은 자손이 visible로 다시 보일 수 있으므로 공간 유무만으로 모든 접근성 결과를 단정하지 않는다.
중요한 기능은 실제 브라우저와 보조 기술에서도 확인한다.

## 이어서 연습하기

[간격의 주인과 margin 합침](#/learn/css/wiki-spacing)에서 배치된 박스 사이의 간격을 누가 관리할지 살펴보세요.

## 공식 자료

- [CSS Display Level 3](https://www.w3.org/TR/css-display-3/)
- [CSS 2.2 — visibility](https://www.w3.org/TR/CSS22/visufx.html#visibility)

## 핵심 질문 답

일반 흐름에서 새 줄의 박스는 block, 글줄 안의 내용은 inline을 먼저 생각합니다.
같은 줄을 유지하면서 width와 height를 다루려면 inline-block, 박스와 공간을 없애려면 none을 사용합니다.
display는 HTML 의미를 바꾸지 않으며 숨길 때는 보조 기술과 조작에 미치는 영향도 확인합니다.
