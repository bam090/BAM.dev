# 상속과 초기값

## 학습 목표

부모의 계산값을 이어받는 상속과 inherit·initial·unset의 차이를 설명할 수 있습니다.

## 한줄 요약

상속 여부는 속성마다 정해지며 inherit은 부모 계산값, initial은 명세 초기값, unset은 상속 여부에 맞는 값을 사용합니다.

## 먼저 확인할 개념

[캐스케이드와 명시도](#/learn/css/wiki-cascade)는 같은 요소의 선언 중 하나를 고르는 과정입니다.
이 문서에서는 부모와 자식 사이에 값이 이어지는 경우를 봅니다.

## 부모의 어떤 값이 이어지는가

이 예제에서는 제목과 문단에 color나 border를 직접 정하지 않았다.
카드에 규칙을 추가했을 때 자식에도 테두리가 생길지 먼저 예상해 보자.

```html
<article class="meeting-card">
  <h2>저녁 책모임</h2>
  <p>오늘 저녁 7시에 만납니다.</p>
</article>
```

```css
.meeting-card {
  color: #243b53;
  border: 2px solid #bcccdc;
}
```

상속은 자식에 값이 직접 정해지지 않았을 때 상속되는 속성이 부모의 계산된 값을 이어받는 과정이다.
color는 상속되므로 제목과 문단도 같은 글자색을 쓰지만, border는 상속되지 않아 자식마다 테두리가 생기지 않는다.

부모가 작성한 CSS 문장 전체를 자식에게 복사하는 것은 아니다.
모든 글자 속성은 상속되고 모든 박스 속성은 상속되지 않는다고 단정하지 말고, 속성 문서의 상속 여부를 확인한다.

## 값을 명시적으로 다시 정한다

| 값 | 동작 |
| --- | --- |
| `inherit` | 원래 상속되는 속성인지와 관계없이 부모의 계산값을 사용한다. |
| `initial` | 해당 속성의 명세에 정해진 초기값을 사용한다. |
| `unset` | 원래 상속되는 속성이면 inherit, 아니면 initial처럼 작동한다. |

```css
.child {
  color: inherit;
  margin: initial;
}
```

`initial`은 브라우저가 h1이나 ul에 제공한 기본 모양으로 돌아가라는 뜻이 아니다.
요소 종류의 기본 스타일과 속성 자체의 초기값은 다르다.

개발자 도구에서 자식의 최종 color를 확인한 뒤 어느 조상에게서 왔는지 추적해 보자.
자식에 직접 정한 color가 있다면 부모에게서 자동으로 이어받는 경우와 나누어 확인한다.

### 선택 확장: 이름 붙인 값도 상속된다

반복되는 값에 `--`로 시작하는 이름을 붙이고 var로 사용할 수 있다.

```css
:root {
  --color-accent: #315efb;
}

.notice {
  color: var(--color-accent);
}
```

이처럼 일반적으로 선언한 사용자 정의 속성은 기본적으로 상속되며 이름의 대소문자를 구분한다.
이름만 붙였다고 색이나 단위 형식이 자동으로 검증되는 것은 아니다.

## 이어서 연습하기

[학습 알림 스타일](#/quest/css/learning-notice)에서 어떤 요소를 선택하고 어떤 값이 자식에게 이어지는지 함께 확인해 보세요.

## 공식 자료

- [CSS Cascade Level 5 — 상속](https://www.w3.org/TR/css-cascade-5/#inheriting)
- [CSS Cascade Level 5 — 초기화 키워드](https://www.w3.org/TR/css-cascade-5/#defaulting-keywords)
- [CSS Custom Properties Level 1](https://www.w3.org/TR/css-variables-1/)

## 핵심 질문 답

자식에 직접 값이 정해지지 않았을 때 상속되는 속성은 부모의 계산값을 이어받습니다.
inherit은 부모 값을 명시적으로 사용하고 initial은 속성 명세의 초기값을 사용합니다.
unset은 원래 상속되는 속성에서 inherit, 그렇지 않은 속성에서 initial처럼 동작하므로 먼저 그 속성의 상속 여부를 확인합니다.
