# CSS의 역할과 적용

## 학습 목표

HTML과 CSS의 역할을 구분하고 스타일시트를 연결해 선택자·속성·값으로 규칙을 읽을 수 있습니다.

## 한줄 요약

CSS는 HTML의 표현을 정하며 연결된 규칙의 선택자로 대상을 찾고 속성에 값을 적용합니다.

## 먼저 확인할 개념

[HTML의 역할과 요소 읽기](#/learn/html/wiki-markup)와 [HTML 문서의 기본 골격](#/learn/html/wiki-document-skeleton)을 알면 CSS를 어디에 연결할지 찾기 쉽습니다.

## CSS는 표현을 맡는다

HTML은 제목·문단·링크처럼 내용의 구조와 의미를 나타낸다.
CSS(Cascading Style Sheets)는 같은 내용의 색·크기·간격·배치를 정한다.
CSS로 링크를 카드처럼 꾸며도 링크가 가진 HTML 의미는 바뀌지 않는다.

```html
<article class="meeting-card">
  <h2>저녁 책모임</h2>
  <p>오늘 저녁 7시에 만납니다.</p>
</article>
```

```css
.meeting-card {
  padding: 1rem;
  border: 1px solid #bcccdc;
}
```

CSS 없이도 제목과 문단의 의미는 남는다.
위 CSS는 그 내용을 담은 카드의 안쪽 간격과 테두리를 정한다.

## HTML에 스타일시트를 연결한다

보통 CSS를 별도 파일에 쓰고 HTML의 `head`에 다음 줄을 둔다.

```html
<link rel="stylesheet" href="styles.css">
```

`rel="stylesheet"`는 스타일시트 연결임을 알리고 `href`는 파일의 위치를 가리킨다.
이 예의 `styles.css`는 HTML 문서 위치를 기준으로 찾는다.
여러 HTML 문서가 같은 파일을 사용하고 구조와 표현을 나눠 관리할 수 있다.

작은 예제를 한 파일에서 확인할 때는 HTML의 `style` 요소에 CSS 규칙을 쓸 수도 있다.
요소의 `style` 속성에 `style="color: navy;"`처럼 직접 적는 방법도 있지만, 재사용하기 어렵고 HTML과 표현이 섞이기 쉽다.
일반 프로젝트에서는 외부 파일부터 사용한다.

## 규칙은 대상과 선언으로 읽는다

```css
.notice {
  color: navy;
  padding: 1rem;
}
```

| 부분 | 예 | 역할 |
| --- | --- | --- |
| 선택자 | `.notice` | 규칙을 적용할 요소를 찾는다. |
| 속성 | `color` | 바꾸려는 성질을 정한다. |
| 값 | `navy` | 속성에 사용할 값을 정한다. |
| 선언 | `color: navy;` | 속성과 값을 한 쌍으로 적는다. |

중괄호 안은 선언 블록이다.
콜론은 속성과 값을, 세미콜론은 선언을 나눈다.
선택자가 요소와 맞아야 그 규칙을 적용할 후보가 된다.

## 적용되지 않으면 연결부터 확인한다

CSS가 전혀 보이지 않으면 파일 경로·이름·대소문자를 확인하고 개발자 도구의 Network에서 요청이 성공했는지 본다.
그다음 HTML의 `class`와 CSS 선택자가 맞는지 확인한다.

한 선언만 적용되지 않는다면 속성 이름과 그 속성에 허용되는 값을 확인한다.
브라우저는 보통 유효하지 않은 선언을 무시하므로, 오류 창을 기다리기보다 Styles에서 규칙이 인식되는지 살핀다.

## 이어서 연습하기

[선택자로 원하는 요소 찾기](#/learn/css/wiki-selectors)에서 같은 역할의 요소와 요소 사이 관계를 구분해 보세요.

## 공식 자료

- [WHATWG HTML — link 요소](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element)
- [CSS Syntax Module Level 3](https://www.w3.org/TR/css-syntax-3/)
- [Selectors Level 4](https://www.w3.org/TR/selectors-4/)

## 핵심 질문 답

HTML은 내용의 구조와 의미를, CSS는 그 내용의 표현을 맡습니다.
보통 head의 link로 외부 CSS 파일을 연결하고, 규칙의 선택자로 대상을 찾은 뒤 속성에 값을 적용합니다.
스타일이 전혀 보이지 않으면 연결 경로와 파일 요청부터, 일부 선언만 적용되지 않으면 선택자와 속성·값의 문법부터 확인합니다.
