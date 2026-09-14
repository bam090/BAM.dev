# 선택자로 원하는 요소 찾기

## 학습 목표

선택자에서 같은 요소의 조건과 후손·자식·형제 관계를 구분해 원하는 요소를 찾을 수 있습니다.

## 한줄 요약

선택자를 공백 없이 이으면 같은 요소의 조건을, 공백이나 결합자를 넣으면 요소 사이의 관계를 표현합니다.

## 먼저 확인할 개념

[CSS의 역할과 적용](#/learn/css/wiki-css-basics)에서 규칙의 선택자와 선언을 먼저 구분해 보세요.

## 무엇을 기준으로 찾는가

| 선택자 | 찾는 대상 |
| --- | --- |
| `p` | `p`라는 요소 이름을 가진 문단 |
| `.notice` | `notice` 클래스를 가진 요소 |
| `#today` | `today`라는 ID를 가진 요소 |
| `input[required]` | `required` 속성이 있는 input |
| `input[type="email"]` | type 속성값이 email인 input |

같은 역할의 여러 요소가 모양을 공유하면 class를 재사용할 수 있다.
ID는 문서 안에서 대상을 고유하게 식별하는 값이며, CSS를 강하게 만들려고 여러 요소에 반복하지 않는다.
`class="card"`를 찾을 때는 `.card`를 쓰며 `#card`와 바꿔 쓸 수 없다.

## 같은 요소와 후손을 구분한다

바깥 article 자체와 안쪽 h2 중 어느 요소가 선택되는지 먼저 예상해 보자.

```html
<article class="card featured">
  <h2 class="featured">추천 과정</h2>
</article>
```

```css
.card.featured {
  border-color: royalblue;
}

.card .featured {
  color: royalblue;
}
```

`.card.featured`는 두 클래스를 동시에 가진 같은 요소를 선택한다.
`.card .featured`의 공백은 후손 관계이므로 card 안쪽의 별도 featured 요소를 선택한다.
이 예에서는 앞 선택자가 article, 뒤 선택자가 h2와 일치한다.

공백 하나 때문에 CSS가 찾는 대상이 달라진다.
원하는 규칙이 보이지 않으면 선언을 고치기 전에 개발자 도구에서 실제로 선택된 요소를 확인한다.

## 결합자로 관계를 좁힌다

| 선택자 | 관계 |
| --- | --- |
| `.card p` | card 안의 모든 단계에 있는 p 후손 |
| `.card > h2` | card 바로 아래의 h2 자식 |
| `h2 + p` | 같은 부모 안에서 h2 바로 다음에 오는 p 형제 |
| `h2 ~ p` | 같은 부모 안에서 h2 뒤에 오는 p 형제들 |

card 안에 div가 있고 그 안에 h2가 있다면 `.card h2`는 그 h2와 일치하지만 `.card > h2`는 일치하지 않는다.
HTML 구조에 의존하는 선택자를 계속 길게 만들기보다, 역할을 나타내는 클래스 하나로 찾을 수 있는지 먼저 살핀다.

## 이어서 연습하기

[학습 알림 스타일](#/quest/css/learning-notice)은 선택자와 상속을 함께 쓰는 실습입니다.
[상속과 초기값](#/learn/css/wiki-inheritance)까지 읽은 뒤 원하는 요소만 바뀌는지 확인해 보세요.

## 공식 자료

- [Selectors Level 4 — 선택자 구조](https://www.w3.org/TR/selectors-4/#structure)
- [Selectors Level 4 — 후손 결합자](https://www.w3.org/TR/selectors-4/#descendant-combinators)
- [Selectors Level 4 — 결합자](https://www.w3.org/TR/selectors-4/#combinators)

## 핵심 질문 답

공백 없이 연결한 `.card.featured`는 같은 요소가 두 클래스를 모두 갖는지 확인합니다.
공백이 있는 `.card .featured`는 card 안쪽의 별도 후손을 찾고, `>`는 바로 아래 자식으로 범위를 좁힙니다.
`+`와 `~`는 같은 부모 안의 뒤쪽 형제 관계를 나타내므로 먼저 HTML에서 대상과 주변 요소의 관계를 확인합니다.
